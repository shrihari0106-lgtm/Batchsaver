/**
 * @file packages/config/src/app-config.ts
 * @description General Application & Industrial Runtime Configuration
 */

export interface AppConfig {
  readonly env: 'development' | 'test' | 'production';
  readonly port: number;
  readonly webPort: number;
  readonly logLevel: string;
  readonly database: {
    readonly url: string;
    readonly host: string;
    readonly port: number;
    readonly dbName: string;
    readonly user: string;
  };
  readonly security: {
    readonly jwtSecret: string;
    readonly jwtExpiresIn: string;
    readonly corsOrigin: string;
  };
  readonly industrial: {
    readonly sensorMode: 'simulated' | 'real';
    readonly actuatorMode: 'simulated' | 'real';
    readonly mqttUrl?: string;
    readonly opcuaEndpoint?: string;
    readonly modbusHost?: string;
    readonly modbusPort?: number;
  };
}

export function getAppConfig(): AppConfig {
  return {
    env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
    port: Number(process.env.PORT || 4000),
    webPort: Number(process.env.WEB_PORT || 3000),
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
      url: process.env.DATABASE_URL || 'postgresql://batchsaver_user:batchsaver_pass@localhost:5432/batchsaver_db?schema=public',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      dbName: process.env.DB_NAME || 'batchsaver_db',
      user: process.env.DB_USER || 'batchsaver_user',
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'batchsaver-dev-secret-key-do-not-use-in-prod',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },
    industrial: {
      sensorMode: (process.env.SENSOR_ADAPTER_MODE as 'simulated' | 'real') || 'simulated',
      actuatorMode: (process.env.ACTUATOR_ADAPTER_MODE as 'simulated' | 'real') || 'simulated',
      mqttUrl: process.env.MQTT_BROKER_URL,
      opcuaEndpoint: process.env.OPCUA_ENDPOINT_URL,
      modbusHost: process.env.MODBUS_HOST,
      modbusPort: Number(process.env.MODBUS_PORT || 502),
    },
  };
}
