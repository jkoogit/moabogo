// ============================================================================
// src/services/repositories/financeRepository.ts
// 정산·게임(Events), OCR 2단계 파이프라인, 사용자 OCR 키, 당번/용돈/빌림 Repository
// ============================================================================

import { StandaloneEvent } from '../../types';
import { apiClient } from '../apiClient';
import { RepositoryContext } from './repositoryContract';

export interface SettleEventParticipantInput {
  name: string;
  isGuest: boolean;
  userId?: string;
}

export interface SettleEventInput {
  eventType: 'SETTLEMENT_1_N' | 'LADDER' | 'TAG';
  eventTitle: string;
  totalAmount: number;
  participants: SettleEventParticipantInput[];
  bindingOption: 'ASK_AFTER' | 'AUTO_LINK' | 'SKIP';
}

export interface StandaloneEventParticipantDto {
  participantId: string;
  userId?: string;
  name: string;
  isGuest: boolean;
  amountDue: number;
  isSettled: boolean;
  isMapped: boolean;
}

export interface StandaloneEventDto {
  eventId: string;
  createdBy: string;
  eventType: 'SETTLEMENT_1_N' | 'LADDER' | 'TAG';
  eventTitle: string;
  totalAmount: number;
  bindingOption: 'ASK_AFTER' | 'AUTO_LINK' | 'SKIP';
  hasGuests: boolean;
  createdAt: string;
  participants: StandaloneEventParticipantDto[];
}

export interface OcrUploadInput {
  imageName: string;
  imageBase64?: string;
  userOcrKey?: string;
}

export interface OcrUploadResponseDto {
  taskId: string;
  status: string;
  message?: string;
}

export interface OcrResultDto {
  merchantName: string;
  amount: number;
  transactionDate: string;
  items?: Array<{ name: string; price: number; qty: number }>;
  isValidated: boolean;
  flaggedFields: string[];
  engineUsed: 'EASY_OCR_LOCAL' | 'USER_KEY_OCR';
}

export interface OcrTaskDto {
  taskId: string;
  userId: string;
  imageHash: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'STALE';
  ocrResult?: OcrResultDto;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export function toLegacyStandaloneEvent(dto: StandaloneEventDto): StandaloneEvent {
  return {
    event_id: dto.eventId,
    created_by: dto.createdBy,
    event_type: dto.eventType,
    event_title: dto.eventTitle,
    total_amount: dto.totalAmount,
    binding_option: dto.bindingOption,
    has_guests: dto.hasGuests,
    created_at: dto.createdAt,
    participants: (dto.participants || []).map((p) => ({
      participant_id: p.participantId,
      user_id: p.userId,
      name: p.name,
      is_guest: p.isGuest,
      amount_due: p.amountDue,
      is_settled: p.isSettled,
      is_mapped: p.isMapped,
    })),
  };
}

export const financeRepository = {
  async listEvents(ctx?: RepositoryContext): Promise<StandaloneEventDto[]> {
    return apiClient.get<StandaloneEventDto[]>('/api/v1/events', { signal: ctx?.signal });
  },

  async settleEvent(input: SettleEventInput, ctx?: RepositoryContext): Promise<StandaloneEventDto> {
    return apiClient.post<StandaloneEventDto>('/api/v1/events/settle', input, {
      signal: ctx?.signal,
      idempotencyKey: ctx?.idempotencyKey,
    });
  },

  async linkEventToLedger(
    eventId: string,
    ledgerId?: string,
    ctx?: RepositoryContext
  ): Promise<Record<string, unknown>> {
    return apiClient.post<Record<string, unknown>>(
      `/api/v1/events/${encodeURIComponent(eventId)}/link-to-ledger`,
      { ledgerId },
      {
        signal: ctx?.signal,
        idempotencyKey: ctx?.idempotencyKey,
      }
    );
  },

  async uploadOcrReceipt(
    input: OcrUploadInput,
    ctx?: RepositoryContext
  ): Promise<OcrUploadResponseDto> {
    return apiClient.post<OcrUploadResponseDto>('/api/v1/ocr/upload', input, {
      signal: ctx?.signal,
      timeoutMs: 30000,
      idempotencyKey: ctx?.idempotencyKey,
    });
  },

  async getOcrTask(taskId: string, ctx?: RepositoryContext): Promise<OcrTaskDto> {
    return apiClient.get<OcrTaskDto>(`/api/v1/ocr/tasks/${encodeURIComponent(taskId)}`, {
      signal: ctx?.signal,
    });
  },

  async updateUserOcrKey(
    personalOcrKey: string,
    ctx?: RepositoryContext
  ): Promise<{ success: boolean; personalOcrKey: string }> {
    return apiClient.post<{ success: boolean; personalOcrKey: string }>(
      '/api/v1/user/ocr-key',
      { personalOcrKey },
      { signal: ctx?.signal }
    );
  },

  async listDuties<T = Record<string, unknown>>(ctx?: RepositoryContext): Promise<T[]> {
    return apiClient.get<T[]>('/api/v1/duties', { signal: ctx?.signal });
  },

  async listAllowances<T = Record<string, unknown>>(ctx?: RepositoryContext): Promise<T[]> {
    return apiClient.get<T[]>('/api/v1/allowance', { signal: ctx?.signal });
  },

  async listLoans<T = Record<string, unknown>>(ctx?: RepositoryContext): Promise<T[]> {
    return apiClient.get<T[]>('/api/v1/loans', { signal: ctx?.signal });
  },
};
