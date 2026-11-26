import React from 'react';
import { Coins, X, ShieldCheck, Share2, Users, Eye, Copy } from 'lucide-react';
import { ElmInp01 } from '../../elements/Tokens';
import { GoalItem, ExecutionRecord } from '../../data/goal-mock-data';
import { maskAccountNo } from '../../data/accountStorePool';

interface GoalDetailModalsProps {
  currentGoal: GoalItem;
  // Transfer modal
  transferModalOpen: boolean;
  setTransferModalOpen: (v: boolean) => void;
  selectedRecordForTransfer: ExecutionRecord | null;
  transferAmount: string;
  setTransferAmount: (v: string) => void;
  transferMemo: string;
  setTransferMemo: (v: string) => void;
  transferBank: string;
  setTransferBank: (v: string) => void;
  transferAccountNo: string;
  setTransferAccountNo: (v: string) => void;
  transferAccountHolder: string;
  setTransferAccountHolder: (v: string) => void;
  isManualAccountMode: boolean;
  setIsManualAccountMode: (v: boolean) => void;
  onOpenSafeTossTransfer: () => void;
  onCompleteTransfer: () => void;
  onCompleteWithoutTransfer: () => void;
  // Invite modal
  inviteModalOpen: boolean;
  setInviteModalOpen: (v: boolean) => void;
  onCopySafeInviteLink: (roleType: 'companion' | 'viewer') => void;
}

export const GoalDetailModals: React.FC<GoalDetailModalsProps> = ({
  currentGoal,
  transferModalOpen,
  setTransferModalOpen,
  selectedRecordForTransfer,
  transferAmount,
  setTransferAmount,
  transferMemo,
  setTransferMemo,
  transferBank,
  setTransferBank,
  transferAccountNo,
  setTransferAccountNo,
  transferAccountHolder,
  setTransferAccountHolder,
  isManualAccountMode,
  setIsManualAccountMode,
  onOpenSafeTossTransfer,
  onCompleteTransfer,
  onCompleteWithoutTransfer,
  inviteModalOpen,
  setInviteModalOpen,
  onCopySafeInviteLink,
}) => {
  return (
    <>
      {/* 1. 용돈이체 송금 팝업 모달 (안전 딥링크 검증 + 중복기장 멱등키 적용) */}
      {transferModalOpen && selectedRecordForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  송금 처리 (용돈 이체)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {!isManualAccountMode && transferAccountNo ? (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                      받는 사람 및 대표입금계좌
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsManualAccountMode(true)}
                      className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold underline hover:text-amber-900 cursor-pointer"
                    >
                      직접 입력
                    </button>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                    {selectedRecordForTransfer.companionName}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-sans font-bold">
                      {transferBank}
                    </span>
                    <span>{maskAccountNo(transferAccountNo)}</span>
                    <span className="text-slate-400 font-sans">({transferAccountHolder})</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                      ⚠️ 받는 사람 계좌 직접 입력
                    </span>
                    {transferAccountNo && (
                      <button
                        type="button"
                        onClick={() => setIsManualAccountMode(false)}
                        className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold underline hover:text-amber-900 cursor-pointer"
                      >
                        등록계좌 불러오기
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    받는 사람({selectedRecordForTransfer.companionName})의 대표계좌가 없거나 변경이
                    필요합니다. 송금받을 계좌를 입력해주세요.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                        은행
                      </label>
                      <input
                        type="text"
                        value={transferBank}
                        onChange={(e) => setTransferBank(e.target.value)}
                        placeholder="예: 토스뱅크"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                        계좌번호 (- 없이 입력 가능)
                      </label>
                      <input
                        type="text"
                        value={transferAccountNo}
                        onChange={(e) => setTransferAccountNo(e.target.value)}
                        placeholder="1000-xxxx-xxxx"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-semibold text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-zinc-400">
                      예금주명
                    </label>
                    <input
                      type="text"
                      value={transferAccountHolder}
                      onChange={(e) => setTransferAccountHolder(e.target.value)}
                      placeholder="예금주 성명"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
                  이체할 용돈 금액
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['1000', '3000', '5000', '10000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTransferAmount(amt)}
                      className={`min-h-[38px] rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                        transferAmount === amt
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      {parseInt(amt, 10).toLocaleString()}원
                    </button>
                  ))}
                </div>
              </div>

              <ElmInp01
                label="통장 표시 메시지"
                value={transferMemo}
                onChange={setTransferMemo}
                placeholder="목표 실천 칭찬 용돈"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onOpenSafeTossTransfer}
                className="min-h-[42px] px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>안전 토스 송금링크</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={onCompleteWithoutTransfer}
                  title="실제 은행 계좌 이체 없이 현금으로 직접 지급하고 종료합니다."
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-300 dark:border-zinc-700 cursor-pointer transition-all"
                >
                  현금전달 💵
                </button>
                <button
                  type="button"
                  onClick={onCompleteTransfer}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  송금마감 ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. 멤버 초대 팝업 모달 (화이트리스트 검증 링크 복사) */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  모아목표 멤버 초대
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
                화이트리스트 검증이 적용된 초대 링크를 복사하여 메신저나 메시지로 전달하세요.
              </p>

              <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    동행원(직접 실천자) 초대 링크
                  </span>
                  <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded font-bold">
                    수행 권한
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://moabogo.app/goal/${currentGoal.id}?role=companion&code=GOL-8921`}
                    className="flex-1 min-h-[36px] px-2.5 text-[11px] rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                  />
                  <button
                    type="button"
                    onClick={() => onCopySafeInviteLink('companion')}
                    className="min-h-[36px] px-3 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    복사
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-purple-600" />
                    관람원(응원 및 용돈지급) 초대 링크
                  </span>
                  <span className="text-[10px] bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.2 rounded font-bold">
                    응원 전용
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://moabogo.app/goal/${currentGoal.id}?role=viewer&code=GOL-VIEW`}
                    className="flex-1 min-h-[36px] px-2.5 text-[11px] rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300"
                  />
                  <button
                    type="button"
                    onClick={() => onCopySafeInviteLink('viewer')}
                    className="min-h-[36px] px-3 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-purple-700 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    복사
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span>
                  간편 참여 코드:{' '}
                  <strong className="text-slate-800 dark:text-zinc-200 text-xs">GOL-7892</strong>
                </span>
                <span>모바일 앱에서 6자리 코드 직접 입력 가능</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
