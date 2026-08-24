/**
 * @file apps/api/src/routes/audit.route.ts
 * @description REST Route definitions for /api/v1/audit
 */

import { AuditLogQuery, BatchTraceabilityReportDto, ApiResponse, PaginatedResponse } from '@batchsaver/api-contracts';
import { AuditEvent } from '@batchsaver/shared-types';

export interface IAuditController {
  queryAuditLogs(query: AuditLogQuery): Promise<ApiResponse<PaginatedResponse<AuditEvent>>>;
  getBatchTraceabilityReport(batchId: string): Promise<ApiResponse<BatchTraceabilityReportDto>>;
}
