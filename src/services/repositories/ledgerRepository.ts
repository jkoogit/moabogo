// ============================================================================
// src/services/repositories/ledgerRepository.ts
// 가계부(Ledger) 및 거래내역(Transaction) 도메인 Repository 추상화 계층
// ============================================================================

import { Ledger, Transaction } from '../../types';
import { apiClient } from '../apiClient';
import { RepositoryContext, shouldUseOfflineFallback } from './repositoryContract';

export interface LedgerDto {
  ledgerId: string;
  ownerId: string;
  ledgerName: string;
  ledgerType: 'PERSONAL' | 'GROUP';
  isInstance?: boolean;
  role?: 'OWNER' | 'MEMBER' | 'VIEWER';
  createdAt: string;
}

export interface CreateLedgerInput {
  ledgerName: string;
  ledgerType: 'PERSONAL' | 'GROUP';
  isInstance?: boolean;
}

export interface TransactionDto {
  transactionId: string;
  ledgerId: string;
  userId: string;
  transactionType: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  merchantName: string;
  categoryName: string;
  transactionDate: string;
  isAssetTransfer: boolean;
  createdAt: string;
  note?: string;
}

export interface CreateTransactionInput {
  transactionType: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  merchantName: string;
  categoryName: string;
  transactionDate: string;
  isAssetTransfer: boolean;
  note?: string;
  force?: boolean;
}

const DEFAULT_FALLBACK_LEDGERS: LedgerDto[] = [
  {
    ledgerId: 'led-personal-01',
    ownerId: 'u-1001-koo',
    ledgerName: '내 개인 가계부 (기본)',
    ledgerType: 'PERSONAL',
    role: 'OWNER',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    ledgerId: 'led-group-01',
    ownerId: 'u-1001-koo',
    ledgerName: '우리집 가계부 (가족 공유)',
    ledgerType: 'GROUP',
    role: 'OWNER',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

export function toLegacyLedger(dto: LedgerDto): Ledger {
  return {
    ledger_id: dto.ledgerId,
    owner_id: dto.ownerId,
    ledger_name: dto.ledgerName,
    ledger_type: dto.ledgerType,
    is_instance: dto.isInstance,
    role: dto.role,
    created_at: dto.createdAt,
  };
}

export function toLegacyTransaction(dto: TransactionDto): Transaction {
  return {
    transaction_id: dto.transactionId,
    ledger_id: dto.ledgerId,
    user_id: dto.userId,
    transaction_type: dto.transactionType,
    amount: dto.amount,
    merchant_name: dto.merchantName,
    category_name: dto.categoryName,
    transaction_date: dto.transactionDate,
    is_asset_transfer: dto.isAssetTransfer,
    created_at: dto.createdAt,
    note: dto.note,
  };
}

export const ledgerRepository = {
  async listLedgers(ctx?: RepositoryContext): Promise<LedgerDto[]> {
    if (ctx?.mode === 'LOCAL_ONLY' || ctx?.isOffline) {
      return DEFAULT_FALLBACK_LEDGERS;
    }
    try {
      return await apiClient.get<LedgerDto[]>('/api/v1/ledgers', { signal: ctx?.signal });
    } catch (err) {
      if (shouldUseOfflineFallback(err, ctx)) {
        return DEFAULT_FALLBACK_LEDGERS;
      }
      throw err;
    }
  },

  async createLedger(input: CreateLedgerInput, ctx?: RepositoryContext): Promise<LedgerDto> {
    const buildLocalLedger = (): LedgerDto => ({
      ledgerId: `led-${Date.now()}`,
      ownerId: 'u-1001-koo',
      ledgerName: input.ledgerName.trim(),
      ledgerType: input.ledgerType,
      isInstance: Boolean(input.isInstance),
      role: 'OWNER',
      createdAt: new Date().toISOString().split('T')[0],
    });

    if (ctx?.mode === 'LOCAL_ONLY' || ctx?.isOffline) {
      return buildLocalLedger();
    }
    try {
      return await apiClient.post<LedgerDto>('/api/v1/ledgers', input, {
        signal: ctx?.signal,
        idempotencyKey: ctx?.idempotencyKey,
      });
    } catch (err) {
      if (shouldUseOfflineFallback(err, ctx)) {
        return buildLocalLedger();
      }
      throw err;
    }
  },

  async listTransactions(ledgerId: string, ctx?: RepositoryContext): Promise<TransactionDto[]> {
    if (ctx?.mode === 'LOCAL_ONLY' || ctx?.isOffline) {
      return [];
    }
    try {
      return await apiClient.get<TransactionDto[]>(
        `/api/v1/ledgers/${encodeURIComponent(ledgerId)}/transactions`,
        { signal: ctx?.signal }
      );
    } catch (err) {
      if (shouldUseOfflineFallback(err, ctx)) {
        return [];
      }
      throw err;
    }
  },

  async createTransaction(
    ledgerId: string,
    input: CreateTransactionInput,
    ctx?: RepositoryContext
  ): Promise<TransactionDto> {
    return apiClient.post<TransactionDto>(
      `/api/v1/ledgers/${encodeURIComponent(ledgerId)}/transactions`,
      input,
      {
        signal: ctx?.signal,
        idempotencyKey: ctx?.idempotencyKey,
      }
    );
  },

  async deleteTransaction(
    transactionId: string,
    ctx?: RepositoryContext
  ): Promise<{ success: boolean; deletedId: string }> {
    return apiClient.delete<{ success: boolean; deletedId: string }>(
      `/api/v1/transactions/${encodeURIComponent(transactionId)}`,
      {
        signal: ctx?.signal,
        idempotencyKey: ctx?.idempotencyKey,
      }
    );
  },
};
