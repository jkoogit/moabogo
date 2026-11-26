import React from 'react';
import { Handshake, FileText, ShieldCheck } from 'lucide-react';
import { SubstituteNettingPair } from '../../../types';
import { validateDutyExternalUrl } from './dutyUtils';

interface DutySubstituteTabProps {
  nettingPairs: SubstituteNettingPair[];
  onOpenReportModal: () => void;
  onCompleteNetting: (pair: SubstituteNettingPair) => void;
  onCopyPaymentLink: (rawUrl?: string) => void;
}

export const DutySubstituteTab: React.FC<DutySubstituteTabProps> = ({
  nettingPairs,
  onOpenReportModal,
  onCompleteNetting,
  onCopyPaymentLink,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121215] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Handshake className="w-4 h-4 text-emerald-500" />
            <span>대신수행 상계정산(Netting) 엔진</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            구성원 간 대신수행 보상 머니를 1:1로 맞비교 상계하여 최종 차액만 정산합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenReportModal}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>종합 정산 보고서 발행</span>
        </button>
      </div>

      {/* Netting Pairs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nettingPairs.map((pair, idx) => {
          const linkCheck = pair.payment_link_url
            ? validateDutyExternalUrl(pair.payment_link_url)
            : null;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-100 dark:border-zinc-800 pb-2 gap-2 flex-wrap">
                <span>1:1 상계 정산</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {pair.from_name} ➔ {pair.to_name}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-xs flex items-center justify-between">
                <span className="text-slate-500">대신수행 누적 ({pair.help_count}건)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                  총액 ₩{pair.gross_amount.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">
                    최종 차액 정산액
                  </span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">
                    {pair.from_name} ➔ {pair.to_name} 송금 대상
                  </span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    ₩{pair.netted_amount.toLocaleString()} {pair.is_cleared && '(상계 완료)'}
                  </span>
                  {!pair.is_cleared && pair.netted_amount > 0 && (
                    <>
                      {linkCheck?.valid && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopyPaymentLink(pair.payment_link_url);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] cursor-pointer whitespace-nowrap flex items-center gap-1"
                          title="화이트리스트 검증된 안전 송금 링크 복사"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>안전 송금링크</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteNetting(pair);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        원클릭 상계 완료
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
