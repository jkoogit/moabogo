import React, { useState } from 'react';
import {
  X,
  Layers,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
  Car,
  Link2,
} from 'lucide-react';
import { DuplicateExpenseCandidate } from './types';

interface DuplicateExpenseReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicateExpenseCandidate[];
  onResolveDuplicate: (
    candidateId: string,
    resolution: 'MERGE_TO_CAR' | 'KEEP_SEPARATE' | 'DISMISS',
    primaryEntryId?: string
  ) => void;
  isDark?: boolean;
}

export const DuplicateExpenseReconcileModal: React.FC<DuplicateExpenseReconcileModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  onResolveDuplicate,
  isDark = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<'UNRESOLVED' | 'RESOLVED'>('UNRESOLVED');

  // 각 중복 후보별 사용자가 원본(Primary)으로 선택한 항목 ID 맵
  const [selectedPrimaryMap, setSelectedPrimaryMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    duplicates.forEach((d) => {
      const carEntry = d.entries.find((e) => e.source_type === 'CAR_LOG');
      map[d.candidate_id] = d.primary_entry_id || carEntry?.source_id || d.entries[0]?.source_id || '';
    });
    return map;
  });

  if (!isOpen) return null;

  const filteredCandidates = duplicates.filter((d) =>
    activeFilter === 'UNRESOLVED' ? !d.is_resolved : d.is_resolved
  );

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'CAR_LOG':
        return <Car className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'CARD_STATEMENT':
        return <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'LEDGER_EXPENSE':
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  };

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case 'CAR_LOG':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'CARD_STATEMENT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'LEDGER_EXPENSE':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className={`w-full max-w-xl rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. 고정 헤더 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              중복 지출 검토 및 원자성 정리 센터
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              동일 지출을 검토하여 원본(Primary)을 지정하고 사본을 연결해 정산 원자성을 유지합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 전환 */}
        <div className="px-5 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('UNRESOLVED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'UNRESOLVED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            정리 필요 ({duplicates.filter((d) => !d.is_resolved).length}건)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('RESOLVED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === 'RESOLVED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            정리 완료 ({duplicates.filter((d) => d.is_resolved).length}건)
          </button>
        </div>

        {/* 2. 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
              {activeFilter === 'UNRESOLVED'
                ? '중복 지출 의심 건이 모두 깨끗하게 정리되었습니다.'
                : '정리 완료된 이력이 없습니다.'}
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const currentPrimaryId =
                selectedPrimaryMap[candidate.candidate_id] ||
                candidate.primary_entry_id ||
                candidate.entries[0]?.source_id;

              return (
                <div
                  key={candidate.candidate_id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  {/* 상단 일치 기준 정보 */}
                  <div className="flex items-center justify-between border-b pb-2.5 mb-3 border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        {candidate.occurred_date}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {candidate.payment_method}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      {candidate.amount.toLocaleString()}원
                    </div>
                  </div>

                  {/* 겹치는 소스 목록 & 원본 선택 체크박스 */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        동일 지출 항목 ({candidate.entries.length}개 소스) — 원본(Primary)으로 지정할 항목을 선택하세요:
                      </p>
                    </div>

                    {candidate.entries.map((entry, idx) => {
                      const isThisPrimary = currentPrimaryId === entry.source_id;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!candidate.is_resolved) {
                              setSelectedPrimaryMap((prev) => ({
                                ...prev,
                                [candidate.candidate_id]: entry.source_id,
                              }));
                            }
                          }}
                          className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isThisPrimary
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* 원본 선택 라디오 버튼 */}
                            <div className="flex items-center shrink-0">
                              <input
                                type="radio"
                                name={`primary-${candidate.candidate_id}`}
                                checked={isThisPrimary}
                                onChange={() => {
                                  setSelectedPrimaryMap((prev) => ({
                                    ...prev,
                                    [candidate.candidate_id]: entry.source_id,
                                  }));
                                }}
                                disabled={candidate.is_resolved}
                                className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                            </div>

                            {getSourceIcon(entry.source_type)}
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${getSourceBadge(
                                entry.source_type
                              )}`}
                            >
                              {entry.source_type === 'CAR_LOG'
                                ? '모아부릉'
                                : entry.source_type === 'CARD_STATEMENT'
                                ? '카드승인'
                                : '가계부'}
                            </span>

                            <div className="truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {entry.source_title}
                                </span>
                                {isThisPrimary && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                    원본(Primary)
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {entry.description}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{entry.created_at}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 액션 버튼 (지출모아 연결 & 개별 유지) */}
                  {!candidate.is_resolved ? (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() =>
                          onResolveDuplicate(
                            candidate.candidate_id,
                            'MERGE_TO_CAR',
                            currentPrimaryId
                          )
                        }
                        className="flex-1 min-h-[38px] px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        title="선택된 항목을 원본으로 지정하고 사본을 연결하여 1건의 원자적 지출로 통합합니다."
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>지출모아 연결</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onResolveDuplicate(candidate.candidate_id, 'KEEP_SEPARATE')
                        }
                        className="px-3 min-h-[38px] text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        개별 지출 유지
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onResolveDuplicate(candidate.candidate_id, 'DISMISS')
                        }
                        className="px-2.5 min-h-[38px] text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        무시
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        정리 완료 ({candidate.resolution_type === 'MERGE_TO_CAR' ? '지출모아 연결됨' : '개별 지출 유지'})
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 3. 고정 푸터 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 h-11 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
