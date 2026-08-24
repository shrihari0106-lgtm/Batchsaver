/**
 * @file apps/web/src/index.ts
 * @description BatchSaver Web Dashboard Application Foundation
 */

import { DashboardViewModel } from '@batchsaver/module-dashboard';
import { getProcessParameters } from '@batchsaver/config';

export function initializeWebDashboard() {
  const parameters = getProcessParameters();
  console.log('[BatchSaver Web] Dashboard foundation initialized with parameters:', parameters);
}

export type { DashboardViewModel };
