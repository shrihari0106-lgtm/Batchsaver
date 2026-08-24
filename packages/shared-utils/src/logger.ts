/**
 * @file packages/shared-utils/src/logger.ts
 * @description Structured Industrial Logger Interface and Default Console Implementation
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
}

export class IndustrialLogger implements ILogger {
  constructor(private readonly moduleName: string) {}

  private format(level: LogLevel, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const ctx = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.moduleName}] ${message}${ctx}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.format('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(this.format('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.format('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    console.error(this.format('error', message, context));
    if (error && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

export function createLogger(moduleName: string): ILogger {
  return new IndustrialLogger(moduleName);
}
