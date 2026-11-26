// ============================================================================
// src/services/caseTransform.ts
// 스네이크케이스(DB/BE) ↔ 카멜케이스(FE) 재귀 직렬화·역직렬화 순수 변환 유틸
// ============================================================================

/**
 * 바이너리·특수 내장 객체 여부를 판별하여 일반 Plain Object만 재귀 변환 대상으로 제한
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * camelCase / PascalCase 키를 snake_case로 변환
 * 예: isAssetTransfer -> is_asset_transfer, ocrKey -> ocr_key
 */
export function toSnakeKey(key: string): string {
  if (!key) return key;
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

/**
 * snake_case 키를 camelCase로 변환
 * 예: transaction_type -> transactionType, is_asset_transfer -> isAssetTransfer
 */
export function toCamelKey(key: string): string {
  if (!key) return key;
  return key.replace(/_([a-z\d])/g, (_, ch: string) => ch.toUpperCase());
}

/**
 * 객체/배열 트리의 모든 키를 재귀적으로 snake_case로 변환 (Request 직렬화용)
 */
export function toSnakeCase<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => toSnakeCase(item)) as unknown as T;
  }
  if (!isPlainObject(input)) {
    return input as T;
  }
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    result[toSnakeKey(k)] = toSnakeCase(v);
  }
  return result as T;
}

/**
 * 객체/배열 트리의 모든 키를 재귀적으로 camelCase로 변환 (Response 역직렬화용)
 */
export function toCamelCase<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCase(item)) as unknown as T;
  }
  if (!isPlainObject(input)) {
    return input as T;
  }
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    result[toCamelKey(k)] = toCamelCase(v);
  }
  return result as T;
}
