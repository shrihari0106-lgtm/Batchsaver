/**
 * @file apps/api/src/index.ts
 * @description BatchSaver API Service Entrypoint & Scaffolding
 */

import { getAppConfig } from '@batchsaver/config';
import { createLogger } from '@batchsaver/shared-utils';

export * from './routes';

const logger = createLogger('API-Service');

export function initializeApiServer() {
  const config = getAppConfig();
  logger.info(`BatchSaver API Foundation Initialized`, {
    port: config.port,
    env: config.env,
    sensorMode: config.industrial.sensorMode,
    actuatorMode: config.industrial.actuatorMode,
  });

  return {
    status: 'INITIALIZED',
    port: config.port,
  };
}

if (require.main === module) {
  initializeApiServer();
}
