/**
 * @file modules/traceability-security/src/index.ts
 * @description Module 6: Traceability, Security & Deployment
 * 
 * Provides repository interfaces for immutable audit logging, batch traceability,
 * authentication, and role-based access control (RBAC).
 */

import {
  AuditEvent,
  User,
  UserRole,
  Batch,
  SensorReading,
  DeviationEvent,
  OperatorDecision,
  ActuatorResponse,
} from '@batchsaver/shared-types';

export interface IAuditRepository {
  recordEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
  queryEvents(filter: {
    batchId?: string;
    userId?: string;
    action?: string;
    limit?: number;
  }): Promise<readonly AuditEvent[]>;
}

export interface ITraceabilityRepository {
  getCompleteBatchRecord(batchId: string): Promise<{
    batch: Batch;
    readings: readonly SensorReading[];
    deviations: readonly DeviationEvent[];
    decisions: readonly OperatorDecision[];
    actuatorEvents: readonly ActuatorResponse[];
    auditLogs: readonly AuditEvent[];
  }>;
}

export interface IAuthService {
  validateToken(token: string): Promise<User | null>;
  checkPermission(userRole: UserRole, requiredRole: UserRole): boolean;
}
