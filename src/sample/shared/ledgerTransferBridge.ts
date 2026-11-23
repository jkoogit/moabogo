// ============================================================================
// src/sample/shared/ledgerTransferBridge.ts
// 서비스 간 단방향 가계부 자산이동(TRANSFER) 연동 포트 (Zero Horizontal Import)
// - 금전관리 3대 원칙 강제: isAssetTransfer=true, 1:1 자기참조 페어링, 멱등키 중복 차단
// ============================================================================

import { buildIdempotencyKey, maskAccountNumber, sanitizeForLocalStorage } from './securityGuards';

export const LEDGER_TRANSFER_STORAGE_KEY = 'moabogo_shared_ledger_transfers_v1';
export const LEDGER_TRANSFER_EVENT = 'moabogo:ledger-transfer-published';

export type TransferSourceDomain = 'ROUTINE_CARD_SETTLE' | 'DUTY_NETTING' | 'GOAL_ALLOWANCE';

export interface LedgerTransferRecord {
  transferId: string;
  relatedTransferId: string; // 1:1 자기참조 페어링 (출금 <-> 입금)
  idempotencyKey: string;
  sourceDomain: TransferSourceDomain;
  sourceRefId: string; // 예: routineId
  settlementYearMonth: string; // 예: "2026-11"
  fromBankName: string;
  fromAccountMasked: string;
  toBankName: string;
  toAccountMasked: string;
  label: string;
  amount: number;
  isAssetTransfer: true; // 생활비 지출 통계 제외 불변 보증
  executedAt: string;
}

export interface PublishTransferInput {
  sourceDomain: TransferSourceDomain;
  sourceRefId: string;
  settlementYearMonth: string;
  fromBankName: string;
  fromAccountNo: string;
  toBankName: string;
  toAccountNo: string;
  label: string;
  amount: number;
}

export interface PublishTransferResult {
  status: 'CREATED' | 'DUPLICATE_IGNORED';
  record: LedgerTransferRecord;
}

export function getLedgerTransferRecords(): LedgerTransferRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEDGER_TRANSFER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LedgerTransferRecord[]) : [];
  } catch {
    return [];
  }
}

export function hasLedgerTransferByKey(idempotencyKey: string): boolean {
  return getLedgerTransferRecords().some((rec) => rec.idempotencyKey === idempotencyKey);
}

/**
 * 단방향 가계부 자산이동(TRANSFER) 발행 포트
 * - 동일 멱등키 존재 시 중복 기장 차단 (DUPLICATE_IGNORED 반환)
 * - 저장 시 계좌번호 자동 마스킹 보장
 */
export function publishLedgerTransfer(input: PublishTransferInput): PublishTransferResult {
  const fromMasked = maskAccountNumber(input.fromAccountNo);
  const toMasked = maskAccountNumber(input.toAccountNo);
  const idempotencyKey = buildIdempotencyKey('transfer', [
    input.sourceDomain,
    input.sourceRefId,
    input.settlementYearMonth,
    fromMasked,
    toMasked,
    input.label,
    input.amount,
  ]);

  const existingList = getLedgerTransferRecords();
  const duplicated = existingList.find((item) => item.idempotencyKey === idempotencyKey);
  if (duplicated) {
    return { status: 'DUPLICATE_IGNORED', record: duplicated };
  }

  const stamp = Date.now();
  const transferId = `tx_out_${stamp}_${Math.random().toString(36).slice(2, 6)}`;
  const relatedTransferId = `tx_in_${stamp}_${Math.random().toString(36).slice(2, 6)}`;

  const record: LedgerTransferRecord = {
    transferId,
    relatedTransferId,
    idempotencyKey,
    sourceDomain: input.sourceDomain,
    sourceRefId: input.sourceRefId,
    settlementYearMonth: input.settlementYearMonth,
    fromBankName: input.fromBankName,
    fromAccountMasked: fromMasked,
    toBankName: input.toBankName,
    toAccountMasked: toMasked,
    label: input.label,
    amount: Math.max(0, Math.round(input.amount)),
    isAssetTransfer: true,
    executedAt: new Date().toISOString(),
  };

  const nextList = sanitizeForLocalStorage([record, ...existingList]);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LEDGER_TRANSFER_STORAGE_KEY, JSON.stringify(nextList));
      window.dispatchEvent(new CustomEvent(LEDGER_TRANSFER_EVENT, { detail: record }));
    } catch {
      // Safe fallback when storage is unavailable
    }
  }

  return { status: 'CREATED', record };
}
