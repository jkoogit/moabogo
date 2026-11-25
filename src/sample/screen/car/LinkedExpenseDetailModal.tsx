import React from 'react';
import { X, Link2, CheckCircle2, ShieldCheck, Car, CreditCard, FileText } from 'lucide-react';
import { VehicleLog } from './types';

interface LinkedExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: VehicleLog | null;
  isDark?: boolean;
}

export const LinkedExpenseDetailModal: React.FC<LinkedExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  log,
  isDark = false,
}) => {
  if (!isOpen || !log) return null;

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

  const isThisPrimary = !log.linked_primary_source_id;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className={`w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85vh] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. 고정 헤더 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">지출모아 연결 내역</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                정산 원자성을 위한 원본 및 사본 지출 관계를 확인합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 스크롤 본문 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 원자성 안내 배너 */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>정산 원자성 및 이중계상 차단 원칙</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
              지출내용 작성, 카드명세서 등록, 자동차이력 등록 시 동일한 지출일자·결제수단·금액 항목에 대해 사용자가 지정한 <strong>원본(Primary) 지출 1건만 유효하게 계상</strong>되며, 연결된 사본들은 중복 합산되지 않습니다.
            </p>
          </div>

          {/* 원본 지출 정보 */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              기준 원본 지출 (Primary)
            </span>
            <div className="p-3.5 rounded-xl border border-emerald-500 bg-white dark:bg-slate-800/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                    {isThisPrimary ? '현재 이력 (원본)' : '원본 지출'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {log.summary}
                  </span>
                </div>
                <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {log.amount.toLocaleString()}원
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                <span>{log.occurred_at}</span>
                <span>{log.vendor_name}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-[10px]">
                  {log.payment_method}
                </span>
                {log.odometer_km && <span>{log.odometer_km.toLocaleString()} km</span>}
              </div>
            </div>
          </div>

          {/* 연결된 사본 지출 목록 */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              연결된 동일 지출 사본 (Replicas)
            </span>
            <div className="space-y-2">
              {log.linked_replica_entries && log.linked_replica_entries.length > 0 ? (
                log.linked_replica_entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {getSourceIcon(entry.source_type)}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getSourceBadge(entry.source_type)}`}>
                        {entry.source_type === 'CAR_LOG' ? '모아부릉' : entry.source_type === 'CARD_STATEMENT' ? '카드승인' : '가계부'}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {entry.source_title}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {entry.description} (원본 ID: {log.log_id} 참조)
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 shrink-0">
                      사본
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-xs text-slate-500 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span>비씨카드 자동 승인 내역: (주)GS판교주유</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">
                    사본 관리
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. 고정 푸터 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 h-11 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
