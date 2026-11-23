// ============================================================================
// src/sample/shared/securityGuards.ts
// 모아보고 전역 보안 가드레일 (PII 마스킹, 로컬 저장소 민감정보 정제, 안전 딥링크 검증, 멱등키)
// - 도메인 비종속 Shared Core 계층 (모든 라이프/금융 서비스 단방향 참조)
// ============================================================================

const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['https:', 'supertoss:', 'kakaopay:']);

const ALLOWED_HTTPS_HOSTS = new Set([
  'toss.me',
  'qr.kakaopay.com',
  'moabogo.app',
  'moabogo.com',
  'www.hometax.go.kr',
  'hometax.go.kr',
]);

/**
 * 계좌번호 마스킹 (중간 대역 비식별화, 멱등적 재적용 안전)
 */
export function maskAccountNumber(accountNo: string): string {
  const clean = (accountNo || '').trim();
  if (!clean) return '****';
  if (clean.includes('****')) return clean;
  if (clean.length <= 6) return '****';
  const parts = clean.split('-');
  if (parts.length >= 3) {
    return `${parts[0]}-****-${parts[parts.length - 1].slice(-4)}`;
  }
  return `${clean.slice(0, 3)}****${clean.slice(-4)}`;
}

/**
 * 사업자등록번호 마스킹 (가운데 2자리 비식별화, 멱등적 재적용 안전)
 */
export function maskBusinessNumber(bizNo: string): string {
  const clean = (bizNo || '').trim();
  if (!clean) return '***-**-*****';
  if (clean.includes('-**-')) return clean;
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-**-${parts[2]}`;
  }
  return `${clean.slice(0, 3)}-**-*****`;
}

/**
 * 휴대전화번호 마스킹 (중간 4자리 비식별화, 멱등적 재적용 안전)
 */
export function maskPhoneNumber(phone: string): string {
  const clean = (phone || '').trim();
  if (!clean) return '010-****-****';
  if (clean.includes('****')) return clean;
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-****-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-***-${digits.slice(6)}`;
  }
  return '010-****-****';
}

export interface UrlValidationResult {
  valid: boolean;
  sanitizedUrl?: string;
  reason?: string;
}

/**
 * 외부 송금 딥링크 및 초대/공식 사이트 URL 화이트리스트 검증
 * - javascript:, data:, 임의 외부 피싱 도메인 원천 차단
 */
export function validateSafeTransferUrl(rawUrl: string): UrlValidationResult {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, reason: 'URL이 비어 있습니다.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: '올바른 URL 형식이 아닙니다.' };
  }

  if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
    return { valid: false, reason: `허용되지 않은 프로토콜입니다: ${parsed.protocol}` };
  }

  if (parsed.protocol === 'https:') {
    const host = parsed.hostname.toLowerCase();
    const isAllowed =
      ALLOWED_HTTPS_HOSTS.has(host) ||
      Array.from(ALLOWED_HTTPS_HOSTS).some((allowed) => host.endsWith(`.${allowed}`));
    if (!isAllowed) {
      return { valid: false, reason: `신뢰 목록에 없는 외부 도메인입니다: ${host}` };
    }
  }

  return { valid: true, sanitizedUrl: parsed.toString() };
}

/**
 * 실물 USIM 일련번호(ICCID) 마스킹 (중간 대역 비식별화, 멱등적 재적용 안전)
 */
export function maskUsimSerial(serial: string): string {
  const clean = (serial || '').trim();
  if (!clean) return '****-****-****';
  if (clean.includes('****')) return clean;
  const digits = clean.replace(/[^0-9A-Za-z]/g, '');
  if (digits.length <= 8) return '****-****';
  return `${digits.slice(0, 4)}-****-${digits.slice(-4)}`;
}

/**
 * 토스(Toss) 안전 송금 딥링크 생성 및 화이트리스트 검증
 */
export function buildSafeTossTransferUrl(
  bankName: string,
  accountNo: string,
  amount: number
): UrlValidationResult {
  const safeAmount = Math.max(0, Math.round(amount));
  const cleanAccount = (accountNo || '').replace(/[^0-9-]/g, '');
  const raw = `supertoss://send?bank=${encodeURIComponent(bankName.trim())}&accountNo=${encodeURIComponent(cleanAccount)}&amount=${safeAmount}`;
  return validateSafeTransferUrl(raw);
}

/**
 * 결정적 멱등키 생성 (중복 정산/자산이동 기장 방지)
 * - 동일 인자 조합에 대해 항상 동일한 해시 키 반환
 */
export function buildIdempotencyKey(namespace: string, parts: Array<string | number>): string {
  const normalized = [namespace, ...parts.map((p) => String(p).trim().toLowerCase())].join('|');
  // FNV-1a 64-bit style dual 32-bit deterministic digest (browser-sync friendly)
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `idem_${namespace}_${hex1}${hex2}`;
}

/**
 * 브라우저 localStorage 저장 전 객체 트리 내 민감 키 자동 마스킹 정제
 * - 원본 계좌번호/사업자번호/전화번호/유심번호가 로컬 스토리지에 평문 잔존하는 것을 방지
 */
export function sanitizeForLocalStorage<T>(payload: T): T {
  const transform = (value: unknown, keyName?: string): unknown => {
    if (Array.isArray(value)) {
      return value.map((entry) => transform(entry));
    }
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        result[k] = transform(v, k);
      }
      return result;
    }
    if (typeof value === 'string' && keyName) {
      const lower = keyName.toLowerCase();
      if (lower.includes('accountno') || lower.includes('account_no')) {
        return maskAccountNumber(value);
      }
      if (lower === 'bizno' || lower === 'biz_no') {
        return maskBusinessNumber(value);
      }
      if (lower.includes('phonenumber') || lower.includes('phone_number')) {
        return maskPhoneNumber(value);
      }
      if (lower.includes('usimserial') || lower.includes('usim_serial')) {
        return maskUsimSerial(value);
      }
    }
    return value;
  };

  return transform(payload) as T;
}
