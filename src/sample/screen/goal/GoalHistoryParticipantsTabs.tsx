import React from 'react';
import {
  Clock,
  Camera,
  Heart,
  Coins,
  ShieldAlert,
  Sparkles,
  Users,
  Eye,
} from 'lucide-react';
import { ElmStt01, ElmCnt01, ElmPrf01 } from '../../elements/Tokens';
import { GoalItem, ExecutionRecord } from '../../data/goal-mock-data';
import { getMemberAllowanceAccount } from '../../data/accountStorePool';

interface GoalHistoryTabProps {
  currentGoal: GoalItem;
  hasSenderAccount: boolean;
  historyCommentInputs: Record<string, string>;
  setHistoryCommentInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onToggleRecordCheer: (recordId: string) => void;
  onOpenTransferModal: (record: ExecutionRecord) => void;
  onAddHistoryComment: (recordId: string) => void;
}

export const GoalHistoryTab: React.FC<GoalHistoryTabProps> = ({
  currentGoal,
  hasSenderAccount,
  historyCommentInputs,
  setHistoryCommentInputs,
  onToggleRecordCheer,
  onOpenTransferModal,
  onAddHistoryComment,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>수행 이력 타임라인</span>
        </h3>
        <span className="text-xs text-slate-500 dark:text-zinc-400">
          총 {currentGoal.records.length}건의 인증 기록
        </span>
      </div>

      <div className="space-y-3.5">
        {currentGoal.records.map((rec) => (
          <div
            key={rec.id}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <ElmPrf01 size="sm" name={rec.companionName} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {rec.companionName}
                    </span>
                    {rec.isAllowanceTarget && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        용돈 수령 대상
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block">{rec.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rec.hasPhoto && (
                  <span className="text-[11px] flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                    <Camera className="w-3.5 h-3.5" />
                    사진인증
                  </span>
                )}
                <ElmStt01 type="EMERALD" label={rec.valueText} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-[#0B0F17] p-3 rounded-xl">
                {rec.memo}
              </p>
              {rec.photoUrl && (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700">
                  <img src={rec.photoUrl} alt="인증 증빙" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleRecordCheer(rec.id)}
                  disabled={currentGoal.myRole === 'MANAGER'}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    currentGoal.myRole === 'MANAGER'
                      ? 'opacity-40 cursor-not-allowed text-slate-400 border border-slate-200 dark:border-zinc-700'
                      : rec.userCheered
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-300 dark:border-rose-800 cursor-pointer'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${rec.userCheered ? 'fill-rose-500 text-rose-500' : ''}`}
                  />
                  <span>응원 {rec.cheerCount}</span>
                </button>

                {(() => {
                  if (!rec.isAllowanceTarget || currentGoal.myRole === 'MANAGER') return null;
                  const targetAllowance = getMemberAllowanceAccount('led-group-01', rec.companionName);
                  const hasRecipientAccount =
                    (targetAllowance.hasAccount && Boolean(targetAllowance.account?.accountNo)) ||
                    Boolean(rec.allowanceAccount);

                  if (!hasRecipientAccount) return null;

                  if (!hasSenderAccount) {
                    return (
                      <button
                        type="button"
                        disabled
                        title="송금할 내 계좌가 없습니다. [설정 > 계좌 관리]에서 계좌를 먼저 등록해주세요."
                        className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-70 border border-slate-300 dark:border-zinc-700"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>응원 송금 (계좌필요) 💰</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => onOpenTransferModal(rec)}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>응원 송금 💰</span>
                    </button>
                  );
                })()}
              </div>

              <span className="text-xs text-slate-400">댓글 {rec.comments.length}개</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
              {rec.comments.map((rcm) => (
                <div
                  key={rcm.id}
                  className="text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F17] flex items-start gap-2"
                >
                  <span className="font-bold text-slate-800 dark:text-zinc-200 shrink-0">
                    {rcm.author}
                  </span>
                  <span className="text-slate-600 dark:text-zinc-400 flex-1">{rcm.text}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{rcm.createdAt}</span>
                </div>
              ))}

              {currentGoal.myRole !== 'MANAGER' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={historyCommentInputs[rec.id] || ''}
                    onChange={(e) =>
                      setHistoryCommentInputs((prev) => ({ ...prev, [rec.id]: e.target.value }))
                    }
                    placeholder="이 인증에 응원이나 칭찬 댓글을 남겨보세요..."
                    className="flex-1 min-h-[38px] px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => onAddHistoryComment(rec.id)}
                    className="min-h-[38px] px-3 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    등록
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface GoalParticipantsTabProps {
  currentGoal: GoalItem;
}

export const GoalParticipantsTab: React.FC<GoalParticipantsTabProps> = ({ currentGoal }) => {
  return (
    <div className="space-y-4">
      {currentGoal.myRole === 'VIEWER' ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#131B2E] border border-rose-200 dark:border-rose-900/60 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              참가자 세부 명단 열람 권한 제한 (RBAC)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              현재 귀하는 <strong className="text-purple-600 dark:text-purple-400">[관람원(응원원)]</strong>{' '}
              권한입니다. 동행원(직접 실천자)의 개인 정보 보호 및 집중을 위해 상세 참가자 명단
              열람이 제한됩니다.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 max-w-md mx-auto flex items-center gap-2 text-left">
            <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
            <span>
              대신 <strong>[1. 목표 현황]</strong>과 <strong>[2. 수행 이력]</strong> 탭에서 언제든
              따뜻한 응원과 하트, 댓글 및 용돈을 보내실 수 있습니다!
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  동행원 현황 (목표 직접 수행자)
                </h3>
              </div>
              <ElmCnt01 count={`${currentGoal.companions.length}명`} />
            </div>

            <div className="space-y-3">
              {currentGoal.companions.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <ElmPrf01 size="sm" name={c.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-zinc-200 block truncate">
                            {c.name}
                          </span>
                          {c.isAllowanceTarget && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                              용돈대상
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                          {c.progress}
                        </span>
                      </div>
                    </div>
                    <ElmStt01
                      type={c.status === 'COMPLETED' ? 'EMERALD' : 'AMBER'}
                      label={c.status === 'COMPLETED' ? '달성 완료 ✓' : '진행중 ⏳'}
                    />
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, c.achievementRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  관람원 현황 (응원 및 조회자)
                </h3>
              </div>
              <ElmCnt01 count={`${currentGoal.viewers.length}명`} />
            </div>

            <div className="space-y-3">
              {currentGoal.viewers.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between gap-3 text-xs min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <ElmPrf01 size="sm" name={v.name} />
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block truncate">
                        {v.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                        {v.note}
                      </span>
                    </div>
                  </div>
                  <ElmStt01 type="PURPLE" label="응원단" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
