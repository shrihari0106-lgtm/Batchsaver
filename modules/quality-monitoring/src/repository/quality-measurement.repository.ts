/**
 * @file modules/quality-monitoring/src/repository/quality-measurement.repository.ts
 * @description Repository interface and in-memory implementation for quality history.
 *
 * Indexing supported:
 *  - batchId
 *  - parameter
 *  - timestamp
 *  - status
 *
 * Designed to swap seamlessly with Prisma/PostgreSQL DB repository in production.
 */

import { ParameterQualityResult, QualityParameter, QualityState } from '@batchsaver/shared-types';

export interface QualityHistoryQuery {
  readonly batchId: string;
  readonly parameter?: QualityParameter;
  readonly status?: QualityState;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly limit?: number;
  readonly page?: number;
}

export interface IQualityMeasurementRepository {
  save(measurement: ParameterQualityResult): Promise<void>;
  getLatestForBatch(batchId: string): Promise<Map<QualityParameter, ParameterQualityResult>>;
  getLatestForParameter(batchId: string, parameter: QualityParameter): Promise<ParameterQualityResult | undefined>;
  queryHistory(query: QualityHistoryQuery): Promise<readonly ParameterQualityResult[]>;
  getActiveDeviations(batchId: string): Promise<readonly ParameterQualityResult[]>;
  clearBatch(batchId: string): Promise<void>;
}

export class InMemoryQualityMeasurementRepository implements IQualityMeasurementRepository {
  // Primary store: batchId -> parameter -> Array of results (newest last)
  private readonly store = new Map<string, Map<QualityParameter, ParameterQualityResult[]>>();

  async save(measurement: ParameterQualityResult): Promise<void> {
    let batchMap = this.store.get(measurement.batchId);
    if (!batchMap) {
      batchMap = new Map<QualityParameter, ParameterQualityResult[]>();
      this.store.set(measurement.batchId, batchMap);
    }

    let paramList = batchMap.get(measurement.parameter);
    if (!paramList) {
      paramList = [];
      batchMap.set(measurement.parameter, paramList);
    }

    paramList.push(measurement);

    // Keep max 1000 history entries per parameter per batch in memory
    if (paramList.length > 1000) {
      paramList.shift();
    }
  }

  async getLatestForBatch(batchId: string): Promise<Map<QualityParameter, ParameterQualityResult>> {
    const result = new Map<QualityParameter, ParameterQualityResult>();
    const batchMap = this.store.get(batchId);
    if (!batchMap) return result;

    for (const [param, list] of batchMap.entries()) {
      if (list.length > 0) {
        result.set(param, list[list.length - 1]);
      }
    }
    return result;
  }

  async getLatestForParameter(
    batchId: string,
    parameter: QualityParameter
  ): Promise<ParameterQualityResult | undefined> {
    const batchMap = this.store.get(batchId);
    if (!batchMap) return undefined;
    const list = batchMap.get(parameter);
    if (!list || list.length === 0) return undefined;
    return list[list.length - 1];
  }

  async queryHistory(query: QualityHistoryQuery): Promise<readonly ParameterQualityResult[]> {
    const batchMap = this.store.get(query.batchId);
    if (!batchMap) return [];

    let all: ParameterQualityResult[] = [];

    if (query.parameter) {
      all = batchMap.get(query.parameter) ?? [];
    } else {
      for (const list of batchMap.values()) {
        all.push(...list);
      }
    }

    // Sort by timestamp descending
    all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filter by status
    if (query.status) {
      all = all.filter((m) => m.status === query.status);
    }

    // Filter by date range
    if (query.startDate) {
      const startMs = new Date(query.startDate).getTime();
      all = all.filter((m) => new Date(m.timestamp).getTime() >= startMs);
    }

    if (query.endDate) {
      const endMs = new Date(query.endDate).getTime();
      all = all.filter((m) => new Date(m.timestamp).getTime() <= endMs);
    }

    // Pagination
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const startIndex = (page - 1) * limit;

    return all.slice(startIndex, startIndex + limit);
  }

  async getActiveDeviations(batchId: string): Promise<readonly ParameterQualityResult[]> {
    const latestMap = await this.getLatestForBatch(batchId);
    const active: ParameterQualityResult[] = [];

    for (const m of latestMap.values()) {
      if (m.status === 'DEVIATION' || m.status === 'CRITICAL' || m.status === 'WARNING') {
        active.push(m);
      }
    }

    return active;
  }

  async clearBatch(batchId: string): Promise<void> {
    this.store.delete(batchId);
  }
}
