// ============================================================================
// src/sample/screen/routine/useMoaRoutine.ts
// 모아루틴(SCR-ROU-01) 비즈니스 상태·인터랙션 훅 (SRP 분리 · OCR 자동등록/터치확인 · TRANSFER 브릿지)
// ============================================================================

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RoutineItem,
  RoutineFilterCategory,
  RoutineViewMode,
  CreateRoutinePayload,
  ROUTINE_TODAY_ISO,
  MedicineRoutine,
  MedicineDrugItem,
  MedicineSlotLabel,
  MvnoRoutine,
  MvnoOcrStepKey,
  MvnoOcrCaptureStep,
  TaxInvoiceRoutine,
  CardSettlementRoutine,
  RoutineUploadedFile,
  maskBusinessNumber,
  maskUsimSerial,
} from './types';
import { INITIAL_ROUTINES } from './routineMockData';
import { sanitizeForLocalStorage } from '../../shared/securityGuards';
import { publishLedgerTransfer } from '../../shared/ledgerTransferBridge';
import { isRoutineItemUrgent } from './plugins/registry';

const STORAGE_KEY = 'moabogo_routine_items_v4';

function addDaysIso(baseIso: string, days: number): string {
  const date = new Date(`${baseIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return ROUTINE_TODAY_ISO;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function addMonthsIso(baseIso: string, months: number): string {
  const date = new Date(`${baseIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return ROUTINE_TODAY_ISO;
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

const SLOT_SCHEDULE_META: Record<
  MedicineSlotLabel,
  { time: string; defaultRule: string; suffix: string }
> = {
  아침: { time: '08:30', defaultRule: '식직후', suffix: 'am' },
  점심: { time: '13:00', defaultRule: '식직후', suffix: 'noon' },
  저녁: { time: '19:30', defaultRule: '식직후', suffix: 'pm' },
  취침전: { time: '22:30', defaultRule: '취침 30분전', suffix: 'bed' },
};

function buildMedicineSlotsFromDrugs(
  id: string,
  drugs: MedicineDrugItem[],
  preset: '2_TIMES' | '3_TIMES' | '4_TIMES'
): MedicineRoutine['slots'] {
  const orderedLabels: MedicineSlotLabel[] =
    preset === '4_TIMES'
      ? ['아침', '점심', '저녁', '취침전']
      : preset === '3_TIMES'
      ? ['아침', '점심', '저녁']
      : ['아침', '저녁'];

  if (drugs.length === 0) {
    return orderedLabels.map((label) => ({
      slotId: `${id}-${SLOT_SCHEDULE_META[label].suffix}`,
      label,
      scheduledTime: SLOT_SCHEDULE_META[label].time,
      timingRule: SLOT_SCHEDULE_META[label].defaultRule,
      pillsPerDose: 1,
      taken: false,
    }));
  }

  const activeSet = new Set<MedicineSlotLabel>();
  drugs.forEach((d) => d.slotLabels.forEach((lbl) => activeSet.add(lbl)));
  const finalLabels: MedicineSlotLabel[] = (
    ['아침', '점심', '저녁', '취침전'] as MedicineSlotLabel[]
  ).filter((lbl) => activeSet.has(lbl));

  return (finalLabels.length > 0 ? finalLabels : orderedLabels).map((label) => {
    const matched = drugs.filter((d) => d.slotLabels.includes(label));
    const pillsPerDose = matched.reduce((sum, d) => sum + d.dosePerTake, 0) || 1;
    return {
      slotId: `${id}-${SLOT_SCHEDULE_META[label].suffix}`,
      label,
      scheduledTime: SLOT_SCHEDULE_META[label].time,
      timingRule: `${SLOT_SCHEDULE_META[label].defaultRule} (${matched.length}종)`,
      pillsPerDose,
      taken: false,
    };
  });
}

function buildDefaultMvnoOcrSteps(
  carrierName: string,
  planName: string,
  promoFee: number,
  promoMonths: number,
  autoPayMethod: string,
  usimType: 'USIM' | 'eSIM',
  usimSerialMasked: string | undefined,
  prefilled: boolean
): MvnoOcrCaptureStep[] {
  return [
    {
      stepKey: 'STEP_1_PLAN',
      stepNo: 1,
      label: '요금제 선택',
      captureHint: '통신망·특가요금·데이터 스펙 화면 캡처',
      captured: prefilled,
      capturedAt: prefilled ? ROUTINE_TODAY_ISO : undefined,
      extractedSummary: prefilled
        ? `${carrierName} · ${planName} · 월 ${promoFee.toLocaleString()}원 (${promoMonths}개월)`
        : undefined,
      ocrReview: prefilled ? 'AUTO_UNCONFIRMED' : undefined,
    },
    {
      stepKey: 'STEP_2_APPLY',
      stepNo: 2,
      label: '신청·동의',
      captureHint: '번호이동 신청서·자동납부·사은품 유지조건 캡처',
      captured: prefilled,
      capturedAt: prefilled ? ROUTINE_TODAY_ISO : undefined,
      extractedSummary: prefilled ? `자동납부 ${autoPayMethod} · 신청정보 OCR 자동반영` : undefined,
      ocrReview: prefilled ? 'AUTO_UNCONFIRMED' : undefined,
    },
    {
      stepKey: 'STEP_3_USIM',
      stepNo: 3,
      label: '유심/eSIM',
      captureHint: '유심 일련번호 또는 eSIM QR 발급 화면 캡처',
      captured: Boolean(prefilled && usimSerialMasked),
      capturedAt: prefilled && usimSerialMasked ? ROUTINE_TODAY_ISO : undefined,
      extractedSummary:
        prefilled && usimSerialMasked
          ? `${usimType} 일련번호 ${usimSerialMasked} 인식 완료`
          : undefined,
      ocrReview: prefilled && usimSerialMasked ? 'AUTO_UNCONFIRMED' : undefined,
    },
    {
      stepKey: 'STEP_4_OPEN',
      stepNo: 4,
      label: '개통 완료',
      captureHint: '개통 문자·개통 완료 화면 캡처 (90일 제한 자동계산)',
      captured: false,
    },
  ];
}

function buildStepOcrExtraction(item: MvnoRoutine, stepKey: MvnoOcrStepKey): string {
  switch (stepKey) {
    case 'STEP_1_PLAN':
      return `${item.networkType} ${item.carrierName} · ${item.planName} · 월 ${item.promoMonthlyFee.toLocaleString()}원 (${item.promoMonths}개월)`;
    case 'STEP_2_APPLY':
      return `${item.autoPayMethod}${item.benefitMemo ? ` · ${item.benefitMemo}` : ' · 번호이동 동의 확인'}`;
    case 'STEP_3_USIM':
      return item.usimType === 'eSIM'
        ? `eSIM 프로파일 QR 발급 · ${item.networkType} 개통 준비`
        : `${item.usimType} 일련번호 ${item.usimSerialMasked || '8982-****-4410'} 인식 완료`;
    case 'STEP_4_OPEN':
      return `개통일 ${item.openedDate} 확정 · 90일 제한 해제일 ${item.mnpRestrictionEndDate} 자동 등록`;
  }
}

export function useMoaRoutine() {
  const [routines, setRoutines] = useState<RoutineItem[]>(() => {
    if (typeof window === 'undefined') return INITIAL_ROUTINES;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as RoutineItem[];
      }
    } catch {
      // Fallback safely to initial dataset
    }
    return INITIAL_ROUTINES;
  });

  const [selectedCategory, setSelectedCategory] = useState<RoutineFilterCategory>('ALL');
  const [viewMode, setViewMode] = useState<RoutineViewMode>('CARD');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [detailRoutineId, setDetailRoutineId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string | null;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({ message: null, type: 'success' });

  useEffect(() => {
    try {
      const sanitized = sanitizeForLocalStorage(routines);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch {
      // Ignore storage quota errors
    }
  }, [routines]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
      setToast({ message, type });
    },
    []
  );

  const clearToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: null }));
  }, []);

  // --- 1. 약복용 타임라인 체크 & 다중 약품 잔여량 자동 차감/복구 ---
  const toggleMedicineSlot = useCallback(
    (routineId: string, slotId: string) => {
      let feedback = '';
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId || item.category !== 'HEALTH_MEDICINE') return item;
          const targetSlot = item.slots.find((s) => s.slotId === slotId);
          if (!targetSlot) return item;

          const nextTaken = !targetSlot.taken;
          const delta = nextTaken ? -targetSlot.pillsPerDose : targetSlot.pillsPerDose;
          const nextRemaining = Math.max(0, Math.min(item.totalPills, item.remainingPills + delta));
          const nowTime = new Date().toTimeString().slice(0, 5);

          const nextDrugs = (item.drugs ?? []).map((drug) => {
            if (!drug.slotLabels.includes(targetSlot.label)) return drug;
            const drugDelta = nextTaken ? -drug.dosePerTake : drug.dosePerTake;
            return {
              ...drug,
              remainingQty: Math.max(0, Math.min(drug.totalQty, drug.remainingQty + drugDelta)),
            };
          });

          feedback = nextTaken
            ? `${item.title} [${targetSlot.label}] 복용 완료 (잔여 ${nextRemaining}알)`
            : `${item.title} [${targetSlot.label}] 복용 체크 해제 (잔여 ${nextRemaining}알)`;

          return {
            ...item,
            remainingPills: nextRemaining,
            drugs: nextDrugs,
            slots: item.slots.map((s) =>
              s.slotId === slotId
                ? { ...s, taken: nextTaken, takenAt: nextTaken ? nowTime : undefined }
                : s
            ),
          };
        })
      );
      if (feedback) showToast(feedback, 'success');
    },
    [showToast]
  );

  const refillMedicine = useCallback(
    (routineId: string, addPills: number = 30) => {
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId || item.category !== 'HEALTH_MEDICINE') return item;
          return {
            ...item,
            totalPills: item.totalPills + addPills,
            remainingPills: item.remainingPills + addPills,
            prescribedDate: ROUTINE_TODAY_ISO,
          };
        })
      );
      showToast(`처방전 재등록 완료 (+${addPills}알 보충됨)`, 'info');
    },
    [showToast]
  );

  // --- 2. 알뜰폰 환승 체크리스트, 단계별 캡처 OCR 수집 및 주기 갱신 ---
  const toggleMvnoChecklist = useCallback((routineId: string, stepId: string) => {
    setRoutines((prev) =>
      prev.map((item) => {
        if (item.id !== routineId || item.category !== 'LIFE_PHONE') return item;
        return {
          ...item,
          checklist: item.checklist.map((step) =>
            step.stepId === stepId ? { ...step, done: !step.done } : step
          ),
        };
      })
    );
  }, []);

  const captureMvnoOcrStep = useCallback(
    (routineId: string, stepKey: MvnoOcrStepKey) => {
      let feedback = '';
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId || item.category !== 'LIFE_PHONE') return item;
          const targetStep = item.ocrCaptureSteps.find((s) => s.stepKey === stepKey);
          if (!targetStep) return item;

          const extracted = buildStepOcrExtraction(item, stepKey);
          feedback = `[${targetStep.stepNo}단계 ${targetStep.label}] 화면 캡처 OCR 자동등록 완료 (배지 터치로 확인)`;

          const updatedOpenedDate =
            stepKey === 'STEP_4_OPEN' && !item.openedDate ? ROUTINE_TODAY_ISO : item.openedDate;
          const updatedRestrictionEnd =
            stepKey === 'STEP_4_OPEN'
              ? addDaysIso(updatedOpenedDate, 90)
              : item.mnpRestrictionEndDate;

          return {
            ...item,
            openedDate: updatedOpenedDate,
            mnpRestrictionEndDate: updatedRestrictionEnd,
            usimSerialMasked:
              stepKey === 'STEP_3_USIM' && !item.usimSerialMasked
                ? '8982-****-4410'
                : item.usimSerialMasked,
            ocrCaptureSteps: item.ocrCaptureSteps.map((step) =>
              step.stepKey === stepKey
                ? {
                    ...step,
                    captured: true,
                    capturedAt: ROUTINE_TODAY_ISO,
                    extractedSummary: extracted,
                    ocrReview: 'AUTO_UNCONFIRMED',
                  }
                : step
            ),
          };
        })
      );
      if (feedback) showToast(feedback, 'success');
    },
    [showToast]
  );

  const completeMvnoRenewal = useCallback(
    (routineId: string, monthsToAdd?: number) => {
      let appliedMonths = monthsToAdd || 7;
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId || item.category !== 'LIFE_PHONE') return item;
          appliedMonths = monthsToAdd || item.promoMonths || 7;
          const nextIso = addMonthsIso(ROUTINE_TODAY_ISO, appliedMonths);
          const nextRestriction = addDaysIso(ROUTINE_TODAY_ISO, 90);
          return {
            ...item,
            openedDate: ROUTINE_TODAY_ISO,
            mnpRestrictionEndDate: nextRestriction,
            penaltyFreeDate: nextRestriction,
            promoEndDate: nextIso,
            streakDays: item.streakDays + 1,
            ocrCaptureSteps: item.ocrCaptureSteps.map((step) => ({
              ...step,
              captured: false,
              capturedAt: undefined,
              extractedSummary: undefined,
              ocrReview: undefined,
            })),
            checklist: item.checklist.map((step) => ({ ...step, done: false })),
          };
        })
      );
      showToast(
        `알뜰폰 번호이동 완료! 다음 만료일(+${appliedMonths}개월) 및 90일 제한 해제일이 자동 갱신되었습니다.`,
        'success'
      );
    },
    [showToast]
  );

  // --- 3. 세금계산서 거래처별 발급 완료 토글 ---
  const toggleTaxClientStatus = useCallback(
    (routineId: string, clientId: string) => {
      let feedback = '';
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId || item.category !== 'BIZ_TAX') return item;
          const client = item.clients.find((c) => c.clientId === clientId);
          if (!client) return item;
          const nextStatus = client.status === 'ISSUED' ? 'PENDING' : 'ISSUED';
          const stamp = `${ROUTINE_TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`;
          feedback =
            nextStatus === 'ISSUED'
              ? `${client.companyName} 전자세금계산서 발급 체크 완료`
              : `${client.companyName} 발급 상태를 대기로 되돌렸습니다`;
          return {
            ...item,
            clients: item.clients.map((c) =>
              c.clientId === clientId
                ? { ...c, status: nextStatus, issuedAt: nextStatus === 'ISSUED' ? stamp : undefined }
                : c
            ),
          };
        })
      );
      if (feedback) showToast(feedback, 'success');
    },
    [showToast]
  );

  // --- 4. 급여·카드 정산 개별 카드 송금 상태 토글 (상환금액 자동 동기화) ---
  const toggleCardPaymentStatus = useCallback(
    (routineId: string, cardId: string) => {
      let feedback = '';
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId || item.category !== 'FINANCE_CARD_SETTLE') return item;
          const card = item.cards.find((c) => c.cardId === cardId);
          if (!card) return item;
          const nextStatus = card.status === 'TRANSFERRED' ? 'PENDING' : 'TRANSFERRED';
          const stamp = `${ROUTINE_TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`;
          feedback =
            nextStatus === 'TRANSFERRED'
              ? `${card.cardName} (${card.amount.toLocaleString()}원) 상환·이체 완료 체크`
              : `${card.cardName} 이체 체크 해제 (잔여결제 복원)`;
          return {
            ...item,
            cards: item.cards.map((c) =>
              c.cardId === cardId
                ? {
                    ...c,
                    status: nextStatus,
                    repaidAmount: nextStatus === 'TRANSFERRED' ? c.amount : 0,
                    transferredAt: nextStatus === 'TRANSFERRED' ? stamp : undefined,
                  }
                : c
            ),
          };
        })
      );
      if (feedback) showToast(feedback, 'info');
    },
    [showToast]
  );

  // --- 5. 공통 OCR 자동등록 항목 원터치 확인 / 전체 확인 / 추가 첨부(Append) ---
  const toggleOcrItemConfirm = useCallback(
    (routineId: string, itemId: string) => {
      let becameConfirmed = true;
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId) return item;
          if (item.category === 'HEALTH_MEDICINE') {
            return {
              ...item,
              drugs: (item.drugs ?? []).map((d) => {
                if (d.drugId !== itemId) return d;
                const next = d.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
                becameConfirmed = next === 'CONFIRMED';
                return { ...d, ocrReview: next };
              }),
            };
          }
          if (item.category === 'LIFE_PHONE') {
            return {
              ...item,
              ocrCaptureSteps: (item.ocrCaptureSteps ?? []).map((s) => {
                if (s.stepKey !== itemId) return s;
                const next = s.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
                becameConfirmed = next === 'CONFIRMED';
                return { ...s, ocrReview: next };
              }),
            };
          }
          if (item.category === 'BIZ_TAX') {
            return {
              ...item,
              clients: item.clients.map((c) => {
                if (c.clientId !== itemId) return c;
                const next = c.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
                becameConfirmed = next === 'CONFIRMED';
                return { ...c, ocrReview: next };
              }),
            };
          }
          return {
            ...item,
            cards: item.cards.map((c) => {
              if (c.cardId !== itemId) return c;
              const next = c.ocrReview === 'AUTO_UNCONFIRMED' ? 'CONFIRMED' : 'AUTO_UNCONFIRMED';
              becameConfirmed = next === 'CONFIRMED';
              return { ...c, ocrReview: next };
            }),
          };
        })
      );
      showToast(
        becameConfirmed
          ? '자동등록 항목이 터치 확인 완료되었습니다.'
          : '자동등록 항목을 미확인 상태로 되돌렸습니다.',
        'info'
      );
    },
    [showToast]
  );

  const confirmAllOcrItems = useCallback(
    (routineId: string) => {
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId) return item;
          if (item.category === 'HEALTH_MEDICINE') {
            return {
              ...item,
              drugs: (item.drugs ?? []).map((d) =>
                d.ocrReview === 'AUTO_UNCONFIRMED' ? { ...d, ocrReview: 'CONFIRMED' as const } : d
              ),
            };
          }
          if (item.category === 'LIFE_PHONE') {
            return {
              ...item,
              ocrCaptureSteps: (item.ocrCaptureSteps ?? []).map((s) =>
                s.ocrReview === 'AUTO_UNCONFIRMED' ? { ...s, ocrReview: 'CONFIRMED' as const } : s
              ),
            };
          }
          if (item.category === 'BIZ_TAX') {
            return {
              ...item,
              clients: item.clients.map((c) =>
                c.ocrReview === 'AUTO_UNCONFIRMED' ? { ...c, ocrReview: 'CONFIRMED' as const } : c
              ),
            };
          }
          return {
            ...item,
            cards: item.cards.map((c) =>
              c.ocrReview === 'AUTO_UNCONFIRMED' ? { ...c, ocrReview: 'CONFIRMED' as const } : c
            ),
          };
        })
      );
      showToast('모든 자동등록 항목을 확인 완료로 처리했습니다.', 'success');
    },
    [showToast]
  );

  const attachOcrFiles = useCallback(
    (routineId: string, files: RoutineUploadedFile[]) => {
      if (files.length === 0) return;
      const firstFile = files[0].fileName;
      setRoutines((prev) =>
        prev.map((item) => {
          if (item.id !== routineId) return item;
          const addedAttachments = files.map((file, idx) => ({
            attachmentId: `att-${Date.now()}-${idx}`,
            fileName: file.fileName,
            uploadedAt: ROUTINE_TODAY_ISO,
            ocrSummary: `${file.fileName} OCR 자동분석 및 항목 추가`,
            previewUrl: file.previewUrl,
            isImageOcr: file.isImage,
          }));

          if (item.category === 'HEALTH_MEDICINE') {
            const addedDrug: MedicineDrugItem = {
              drugId: `drug-ocr-${Date.now()}`,
              drugName: firstFile.includes('추가') ? '알마겔정 (추가처방)' : '처방약 (OCR 추가)',
              effectCategory: '제산제',
              dosePerTake: 1,
              dailyFrequency: 2,
              prescribedDays: 7,
              totalQty: 14,
              remainingQty: 14,
              unitLabel: '정',
              slotLabels: ['아침', '저녁'],
              storageNote: '실온보관',
              cautionTags: ['식후복용'],
              ocrReview: 'AUTO_UNCONFIRMED',
            };
            const nextDrugs = [...(item.drugs ?? []), addedDrug];
            return {
              ...item,
              attachments: [...(item.attachments ?? []), ...addedAttachments],
              totalPills: item.totalPills + addedDrug.totalQty,
              remainingPills: item.remainingPills + addedDrug.remainingQty,
              drugs: nextDrugs,
            };
          }

          if (item.category === 'BIZ_TAX') {
            const newClient = {
              clientId: `tax-ocr-${Date.now()}`,
              companyName: '주식회사 클라우드브릿지',
              bizNo: '312-**-88412',
              representativeName: '김민수',
              email: 'tax@cloudbridge.kr',
              writtenDate: ROUTINE_TODAY_ISO,
              itemName: '클라우드 유지보수 용역료',
              claimType: '청구' as const,
              supplyAmount: 2200000,
              vatAmount: 220000,
              status: 'PENDING' as const,
              ocrReview: 'AUTO_UNCONFIRMED' as const,
            };
            return {
              ...item,
              attachments: [...(item.attachments ?? []), ...addedAttachments],
              clients: [...item.clients, newClient],
            };
          }

          if (item.category === 'FINANCE_CARD_SETTLE') {
            const cardLabel = firstFile.includes('신한') ? '신한카드' : '추가 명세서 카드';
            const bankLabel = firstFile.includes('신한') ? '신한은행' : '우리은행';
            const newCard = {
              cardId: `card-ocr-${Date.now()}`,
              cardName: cardLabel,
              itemCategory: 'CARD' as const,
              targetBank: bankLabel,
              targetAccountNo: bankLabel === '신한은행' ? '110-****-4412' : '1002-****-1120',
              paymentDay: 23,
              depositDate: item.dueDate,
              amount: 342000,
              repaidAmount: 0,
              syncSource: 'OCR' as const,
              status: 'PENDING' as const,
              ocrReview: 'AUTO_UNCONFIRMED' as const,
            };
            return {
              ...item,
              attachments: [...(item.attachments ?? []), ...addedAttachments],
              cards: [...item.cards, newCard],
            };
          }

          return {
            ...item,
            attachments: [...(item.attachments ?? []), ...addedAttachments],
          };
        })
      );
      showToast(
        `${files.length}개 파일 OCR 분석 완료! 기존 항목을 유지하고 새 자동입력 항목을 추가했습니다.`,
        'success'
      );
    },
    [showToast]
  );

  // --- 6. 급여·카드 정산 → 단방향 가계부 TRANSFER 브릿지 기장 ---
  const publishCardTransfer = useCallback(
    (routineId: string) => {
      const target = routines.find(
        (r): r is CardSettlementRoutine => r.id === routineId && r.category === 'FINANCE_CARD_SETTLE'
      );
      if (!target) return;

      let createdCount = 0;
      let duplicateCount = 0;

      target.cards.forEach((card) => {
        if (card.amount <= 0) return;
        const result = publishLedgerTransfer({
          sourceDomain: 'ROUTINE_CARD_SETTLE',
          sourceRefId: target.id,
          settlementYearMonth: target.settlementYearMonth,
          fromBankName: target.sourceBankName,
          fromAccountNo: target.sourceAccountNo,
          toBankName: card.targetBank,
          toAccountNo: card.targetAccountNo,
          label: `${card.cardName} (${target.settlementYearMonth} 정산)`,
          amount: card.amount,
        });
        if (result.status === 'CREATED') createdCount += 1;
        else duplicateCount += 1;
      });

      setRoutines((prev) =>
        prev.map((item) =>
          item.id === routineId && item.category === 'FINANCE_CARD_SETTLE'
            ? { ...item, isTransferredToLedger: true }
            : item
        )
      );

      if (createdCount > 0) {
        showToast(
          `가계부 자산이동(TRANSFER) ${createdCount}건 기장 완료 (순수 지출 제외 · 중복 ${duplicateCount}건 차단)`,
          'success'
        );
      } else {
        showToast(
          `이미 동일 멱등키로 가계부 TRANSFER 기장이 완료된 정산입니다 (${duplicateCount}건 중복 방어).`,
          'info'
        );
      }
    },
    [routines, showToast]
  );

  // --- 7. 신규 루틴 생성 / 삭제 / 초기화 ---
  const createRoutine = useCallback(
    (payload: CreateRoutinePayload) => {
      const id = `rou-${Date.now()}`;
      let newItem: RoutineItem;

      if (payload.category === 'HEALTH_MEDICINE') {
        const prescribedDate = payload.prescribedDate || ROUTINE_TODAY_ISO;
        const prescribedDays = Math.max(1, payload.prescribedDays || 14);
        const drugs = payload.drugs ?? [];
        const total =
          drugs.length > 0
            ? drugs.reduce((sum, d) => sum + d.totalQty, 0)
            : Math.max(1, payload.totalPills || 30);
        const slots = buildMedicineSlotsFromDrugs(id, drugs, payload.slotPreset || '2_TIMES');

        newItem = {
          id,
          category: 'HEALTH_MEDICINE',
          title: payload.title.trim(),
          subtitle: payload.subtitle.trim() || '매일 복용 타임라인 루틴',
          isActive: true,
          streakDays: 1,
          updatedAt: ROUTINE_TODAY_ISO,
          attachments: payload.attachments,
          ocrReviewMap: payload.ocrReviewMap,
          hospitalOrBrand: payload.hospitalOrBrand?.trim() || '직접 등록',
          pharmacyName: payload.pharmacyName?.trim() || undefined,
          prescribedDate,
          completionDate: addDaysIso(prescribedDate, prescribedDays),
          prescribedDays,
          receiptTotalAmount: payload.receiptTotalAmount || undefined,
          hasPrescriptionOcr: Boolean((payload.attachments?.length || 0) > 0 || drugs.length > 0),
          ocrSummaryText:
            drugs.length > 0
              ? `약봉지 OCR 자동등록 · ${drugs.length}종 ${prescribedDays}일분`
              : '수동 등록 복약 루틴',
          totalPills: total,
          remainingPills: total,
          drugs,
          slots,
        };
      } else if (payload.category === 'LIFE_PHONE') {
        const openedDate = payload.openedDate || ROUTINE_TODAY_ISO;
        const promoMonths = Math.max(1, payload.promoMonths || 7);
        const restrictionEnd = addDaysIso(openedDate, 90);
        const carrierName = payload.carrierName?.trim() || 'SK 7mobile';
        const planName = payload.planName?.trim() || '프로모션 특가 요금제';
        const promoFee = Math.max(0, payload.promoMonthlyFee ?? 14900);
        const usimType = payload.usimType || 'USIM';
        const usimSerialMasked = payload.usimSerial?.trim()
          ? maskUsimSerial(payload.usimSerial)
          : undefined;
        const autoPayMethod = payload.autoPayMethod?.trim() || '신용카드 자동납부';

        newItem = {
          id,
          category: 'LIFE_PHONE',
          title: payload.title.trim(),
          subtitle: payload.subtitle.trim() || '알뜰폰 프로모션 만기 및 OCR 수집 관리',
          isActive: true,
          streakDays: 1,
          updatedAt: ROUTINE_TODAY_ISO,
          attachments: payload.attachments,
          ocrReviewMap: payload.ocrReviewMap,
          lineOwner: '본인 회선',
          phoneNumberMasked: '010-****-0000',
          networkType: payload.networkType || 'SKT망',
          carrierName,
          planName,
          dataCallSpec: payload.dataCallSpec?.trim() || '11GB+일2GB+3Mbps · 무제한',
          promoMonthlyFee: promoFee,
          normalMonthlyFee: Math.max(0, payload.normalMonthlyFee ?? 33900),
          promoMonths,
          openedDate,
          mnpRestrictionEndDate: restrictionEnd,
          promoEndDate: payload.promoEndDate || addMonthsIso(openedDate, promoMonths),
          penaltyFreeDate: restrictionEnd,
          usimType,
          usimSerialMasked,
          autoPayMethod,
          benefitMemo: payload.benefitMemo?.trim() || undefined,
          recommendedCarrierHint:
            '번호이동 단계별 화면 캡처 OCR로 개통·유심·자동납부 정보를 수집해두면 만료 14일 전 환승이 훨씬 수월합니다.',
          ocrCaptureSteps: buildDefaultMvnoOcrSteps(
            carrierName,
            planName,
            promoFee,
            promoMonths,
            autoPayMethod,
            usimType,
            usimSerialMasked,
            Boolean(payload.ocrAutofilled)
          ),
          checklist: [
            { stepId: `${id}-c1`, label: '90일 번호이동 제한 해제 및 사은품 유지기간 확인', done: false },
            { stepId: `${id}-c2`, label: '신규 알뜰폰 요금제 신청 및 단계별 화면 캡처 OCR 수집', done: Boolean(payload.ocrAutofilled) },
          ],
        } as MvnoRoutine;
      } else if (payload.category === 'BIZ_TAX') {
        const supply = Math.max(0, payload.initialSupplyAmount || 1000000);
        const vat =
          payload.initialVatAmount !== undefined
            ? Math.max(0, payload.initialVatAmount)
            : Math.round(supply * 0.1);
        const hasOcr = Boolean(
          (payload.attachments?.length || 0) > 0 ||
            Object.keys(payload.ocrReviewMap || {}).length > 0
        );
        const allConfirmed =
          hasOcr &&
          Object.values(payload.ocrReviewMap || {}).every((s) => s !== 'AUTO_UNCONFIRMED');

        newItem = {
          id,
          category: 'BIZ_TAX',
          title: payload.title.trim(),
          subtitle: payload.subtitle.trim() || '매월 10일 전자세금계산서 마감 관리',
          isActive: true,
          streakDays: 1,
          updatedAt: ROUTINE_TODAY_ISO,
          attachments: payload.attachments,
          ocrReviewMap: payload.ocrReviewMap,
          targetYearMonth: payload.targetYearMonth || '2026-11',
          deadlineDate: payload.deadlineDate || '2026-12-10',
          hometaxSyncReady: true,
          clients: [
            {
              clientId: `${id}-cl1`,
              companyName: payload.initialClientName?.trim() || '신규 거래처',
              bizNo: maskBusinessNumber(payload.initialBizNo?.trim() || '120-81-00000'),
              representativeName: payload.initialRepresentative?.trim() || undefined,
              email: payload.initialClientEmail?.trim() || undefined,
              writtenDate: payload.initialWrittenDate || ROUTINE_TODAY_ISO,
              itemName: payload.initialItemName?.trim() || undefined,
              claimType: payload.initialClaimType || '청구',
              supplyAmount: supply,
              vatAmount: vat,
              status: 'PENDING',
              ocrReview: hasOcr ? (allConfirmed ? 'CONFIRMED' : 'AUTO_UNCONFIRMED') : undefined,
            },
          ],
        } as TaxInvoiceRoutine;
      } else {
        const cards =
          payload.cards && payload.cards.length > 0
            ? payload.cards
            : [
                {
                  cardId: `${id}-card1`,
                  cardName: payload.initialCardName?.trim() || '주력 신용카드',
                  itemCategory: 'CARD' as const,
                  targetBank: payload.initialCardBank?.trim() || '우리은행',
                  targetAccountNo: '1002-****-1120',
                  paymentDay: 23,
                  depositDate: payload.dueDate || '2026-11-23',
                  amount: Math.max(0, payload.initialCardAmount || 500000),
                  repaidAmount: Math.max(0, payload.initialRepaidAmount || 0),
                  syncSource: 'MANUAL' as const,
                  status: 'PENDING' as const,
                },
              ];

        newItem = {
          id,
          category: 'FINANCE_CARD_SETTLE',
          title: payload.title.trim(),
          subtitle: payload.subtitle.trim() || '급여계좌 분배 송금 및 자산이동 연동',
          isActive: true,
          streakDays: 1,
          updatedAt: ROUTINE_TODAY_ISO,
          attachments: payload.attachments,
          ocrReviewMap: payload.ocrReviewMap,
          settlementYearMonth: payload.settlementYearMonth || '2026-11',
          dueDate: payload.dueDate || '2026-11-23',
          sourceBankName: payload.sourceBankName?.trim() || '우리은행 급여통장',
          sourceAccountNo: payload.sourceAccountNo?.trim() || '1002-****-8812',
          settlementMemo: payload.settlementMemo?.trim() || undefined,
          isTransferredToLedger: false,
          cards,
        } as CardSettlementRoutine;
      }

      setRoutines((prev) => [newItem, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`"${newItem.title}" 루틴이 등록되었습니다.`, 'success');
    },
    [showToast]
  );

  const deleteRoutine = useCallback(
    (routineId: string) => {
      setRoutines((prev) => prev.filter((item) => item.id !== routineId));
      setDetailRoutineId(null);
      showToast('선택한 루틴이 삭제되었습니다.', 'warning');
    },
    [showToast]
  );

  const resetDemoData = useCallback(() => {
    setRoutines(INITIAL_ROUTINES);
    showToast('초기 샘플 루틴 데이터로 복원되었습니다.', 'info');
  }, [showToast]);

  // --- 파생 통계 및 필터링 ---
  const categoryCounts = useMemo(() => {
    const counts: Record<RoutineFilterCategory, number> = {
      ALL: routines.length,
      HEALTH_MEDICINE: 0,
      LIFE_PHONE: 0,
      BIZ_TAX: 0,
      FINANCE_CARD_SETTLE: 0,
    };
    routines.forEach((r) => {
      counts[r.category] += 1;
    });
    return counts;
  }, [routines]);

  const filteredRoutines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return routines.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (!q) return true;
      const inBase =
        item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q);
      if (inBase) return true;
      if (item.category === 'HEALTH_MEDICINE') {
        return (
          item.hospitalOrBrand.toLowerCase().includes(q) ||
          (item.pharmacyName || '').toLowerCase().includes(q) ||
          item.ocrSummaryText.toLowerCase().includes(q) ||
          (item.drugs ?? []).some((d) => d.drugName.toLowerCase().includes(q))
        );
      }
      if (item.category === 'LIFE_PHONE') {
        return (
          item.carrierName.toLowerCase().includes(q) ||
          item.planName.toLowerCase().includes(q) ||
          item.networkType.toLowerCase().includes(q) ||
          item.dataCallSpec.toLowerCase().includes(q)
        );
      }
      if (item.category === 'BIZ_TAX') {
        return item.clients.some(
          (c) =>
            c.companyName.toLowerCase().includes(q) ||
            (c.itemName || '').toLowerCase().includes(q)
        );
      }
      if (item.category === 'FINANCE_CARD_SETTLE') {
        return item.cards.some(
          (c) =>
            c.cardName.toLowerCase().includes(q) || c.targetBank.toLowerCase().includes(q)
        );
      }
      return false;
    });
  }, [routines, selectedCategory, searchQuery]);

  const summaryMetrics = useMemo(() => {
    let medTotalSlots = 0;
    let medTakenSlots = 0;
    let urgentDDayCount = 0;
    let taxTotalClients = 0;
    let taxIssuedClients = 0;
    let cardTotalAmount = 0;
    let cardTransferredAmount = 0;

    routines.forEach((item) => {
      if (isRoutineItemUrgent(item)) urgentDDayCount += 1;
      if (item.category === 'HEALTH_MEDICINE') {
        medTotalSlots += item.slots.length;
        medTakenSlots += item.slots.filter((s) => s.taken).length;
      } else if (item.category === 'BIZ_TAX') {
        taxTotalClients += item.clients.length;
        taxIssuedClients += item.clients.filter((c) => c.status === 'ISSUED').length;
      } else if (item.category === 'FINANCE_CARD_SETTLE') {
        item.cards.forEach((c) => {
          cardTotalAmount += c.amount;
          cardTransferredAmount += c.repaidAmount || 0;
        });
      }
    });

    const medCompletionRate =
      medTotalSlots > 0 ? Math.round((medTakenSlots / medTotalSlots) * 100) : 0;

    return {
      medTotalSlots,
      medTakenSlots,
      medCompletionRate,
      urgentDDayCount,
      taxTotalClients,
      taxIssuedClients,
      cardTotalAmount,
      cardTransferredAmount,
    };
  }, [routines]);

  const detailRoutine = useMemo(
    () => routines.find((r) => r.id === detailRoutineId) || null,
    [routines, detailRoutineId]
  );

  return {
    routines,
    filteredRoutines,
    selectedCategory,
    setSelectedCategory,
    categoryCounts,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    summaryMetrics,
    isCreateModalOpen,
    setIsCreateModalOpen,
    detailRoutine,
    setDetailRoutineId,
    toast,
    showToast,
    clearToast,
    toggleMedicineSlot,
    refillMedicine,
    toggleMvnoChecklist,
    captureMvnoOcrStep,
    completeMvnoRenewal,
    toggleTaxClientStatus,
    toggleCardPaymentStatus,
    toggleOcrItemConfirm,
    confirmAllOcrItems,
    attachOcrFiles,
    publishCardTransfer,
    createRoutine,
    deleteRoutine,
    resetDemoData,
  };
}
