/**
 * @file packages/shared-utils/src/time.ts
 * @description Time & Timestamp Utilities for Traceability
 */

export function getCurrentIsoTimestamp(): string {
  return new Date().toISOString();
}

export function formatDurationSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const remSecs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
