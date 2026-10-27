import React from 'react';
import { ShieldCheck, X, AlertTriangle } from 'lucide-react';

export interface LedgerDomainPrinciplesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LedgerDomainPrinciplesModal: React.FC<LedgerDomainPrinciplesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              모아보고 금전관리 3대 원칙
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <div className="font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 flex items-center justify-center text-[10px] font-mono">
                1
              </span>
              <span>단일 귀속성 (Single Attribution)</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
              모든 거래는 개인 가계부 또는 모임 가계부 중 <strong>단 하나에만 배타적으로 귀속</strong>되며 상호 중복 합산되지 않아 데이터 정합성을 완벽하게 보장합니다.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-1.5">
            <div className="font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 flex items-center justify-center text-[10px] font-mono">
                2
              </span>
              <span>TRANSFER 1:1 자기참조 페어링 (생활비 왜곡 차단)</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              통장 간 이체, 부모-자녀 간 용돈 지급, 모임 회비 송금은 가계 전체 관점에서 <strong>단순 자산 재배치</strong>이므로, <code className="text-purple-700 dark:text-purple-300 font-mono">is_asset_transfer = true</code>로 생활비 지출 통계에서 원천 분리됩니다.
            </p>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 text-[10.5px] text-purple-900 dark:text-purple-300 space-y-0.5 border border-purple-200/60 dark:border-purple-800/60">
              <span className="font-bold">💡 실생활 사례 (부모 ➔ 자녀 용돈 10만 원):</span>
              <p>부모 가계부 출금(TRANSFER)과 자녀 용돈기입장 입금(TRANSFER)이 <code className="font-mono">related_transfer_id</code>로 1:1 맞물려, 자녀가 편의점(5천 원)을 결제할 때 비로소 가계 소비로 정확히 집계됩니다.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 space-y-1">
            <div className="font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-center text-[10px] font-mono">
                3
              </span>
              <span>태깅 분리 (이중계상 방지)</span>
            </div>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
              개인 지출의 모임 대납이나 1/N 정산 요청은 <strong>메타데이터 태그(#대납, #정산요청)</strong>로 분리하여 한 번 지출된 금액이 중복 청구되는 것을 차단합니다.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>게스트 소멸성 (Transient) 원칙</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              모임 인스턴스 가계부의 미가입 게스트는 임시 식별자로 활동하며, 정규 회원가입 시 기존 내역이 무단 소급 결합되지 않고 당사자의 승인 하에만 안전하게 이관됩니다.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
