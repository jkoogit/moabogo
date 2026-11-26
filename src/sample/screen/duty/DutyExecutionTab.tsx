import React from 'react';
import { Users, ShieldCheck, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { MoaDuty, DutyParticipant, DutyExecutionLog } from '../../../types';
import { renderDutyMarkdown } from './dutyUtils';

interface DutyExecutionTabProps {
  duty: MoaDuty;
  nextAssignee: DutyParticipant | null;
  dutyLogs: DutyExecutionLog[];
  onApproveDuty: () => void;
}

export const DutyExecutionTab: React.FC<DutyExecutionTabProps> = ({
  duty,
  nextAssignee,
  dutyLogs,
  onApproveDuty,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      {/* Current Assignee & Next Prediction Card */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800 dark:text-zinc-200">현재 담당 수행원</span>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">순번 1위</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-lg shrink-0">
              {duty.current_assigned_name.slice(0, 1)}
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {duty.current_assigned_name}
              </h4>
              <p className="text-xs text-slate-500">마감 예정일: {duty.next_due_date || '오늘'}</p>
            </div>
          </div>

          {/* Next Rotation Prediction */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>다음 순환 예측 배정자</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">자동 계산</span>
            </div>
            {nextAssignee ? (
              <>
                <div className="font-bold text-slate-800 dark:text-zinc-200">{nextAssignee.name}</div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {duty.rotation_policy === 'AGE_WEIGHTED'
                    ? `연령 가중치 ${nextAssignee.weight || 1}배 우선 배정`
                    : '순차 순환 규칙 적용'}
                </p>
              </>
            ) : (
              <div className="text-slate-400">배정 가능한 인원이 없습니다.</div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onApproveDuty}
              className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <ThumbsUp className="w-4 h-4 shrink-0" />
              <span>당번 완료 승인 투표 (2/3명 찬성)</span>
            </button>
          </div>
        </div>

        {/* Participants Summary Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>참가자 배정 순서 및 가중치</span>
          </h4>
          <div className="space-y-1.5">
            {duty.participants.map((p, idx) => (
              <div
                key={p.participant_id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between text-xs gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 whitespace-nowrap">
                  <span>가중치 {p.weight || 1}배</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    [{p.role === 'ASSIGNEE' ? '수행원' : '응원단'}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist & Completion Criteria Card */}
      <div className="lg:col-span-2 space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>완수 체크리스트 및 수행 가이드</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">가이드라인</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-700/60">
            {renderDutyMarkdown(duty.duty_description || '', '등록된 완수 가이드가 없습니다.')}
          </div>

          <div className="space-y-2 pt-2">
            <h5 className="text-xs font-bold text-slate-800 dark:text-zinc-200">최근 제출된 인증 내역</h5>
            {dutyLogs.slice(0, 1).map((log) => (
              <div
                key={log.log_id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs"
              >
                {log.proof_image_url && (
                  <img
                    src={log.proof_image_url}
                    alt="인증"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                  />
                )}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {log.executed_by_name} 완수
                    </span>
                    <span className="text-[10px] text-slate-400">{log.submitted_at}</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 text-[11px]">"{log.memo}"</p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      당번 승인 완료 ({log.approvals_count}/{log.approvals_required || 1}인)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
