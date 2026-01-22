export type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getString(record: UnknownRecord, key: string): string | null {
  const v = record[key];
  return typeof v === 'string' ? v : null;
}
