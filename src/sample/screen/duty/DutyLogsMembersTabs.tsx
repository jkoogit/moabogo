import React from 'react';
import { Users, CheckCircle2, UserPlus, UserMinus } from 'lucide-react';
import { ElmHlp01 } from '../../elements/Tokens';
import { MoaDuty, DutyExecutionLog } from '../../../types';

interface DutyLogsTabProps {
  dutyLogsCount: number;
  selectedLogMemberName: string;
  setSelectedLogMemberName: (name: string) => void;
  logMembersSummary: Array<{ name: string; count: number }>;
  filteredLogs: DutyExecutionLog[];
}

export const DutyLogsTab: React.FC<DutyLogsTabProps> = ({
  dutyLogsCount,
  selectedLogMemberName,
  setSelectedLogMemberName,
  logMembersSummary,
  filteredLogs,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-4 p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-500" />
          <span>담당자별 이력 조회</span>
        </h4>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setSelectedLogMemberName('ALL')}
            className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
              selectedLogMemberName === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
            }`}
          >
            <span>전체 담당자 실적 보기</span>
            <span className="font-mono text-[10px]">{dutyLogsCount}건</span>
          </button>

          {logMembersSummary.map(({ name, count }) => {
            const isSelected = selectedLogMemberName === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedLogMemberName(name)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-indigo-600'
                    }`}
                  >
                    {name.slice(0, 1)}
                  </div>
                  <span className="truncate">{name}</span>
                </div>
                <span className="font-mono text-[10px] shrink-0">{count}건</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-8 space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 text-sm">
            해당 담당자의 등록된 완수 인증 이력이 없습니다.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.log_id}
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                {log.proof_image_url ? (
                  <img
                    src={log.proof_image_url}
                    alt="인증"
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 shrink-0 text-xl">
                    📝
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                      {log.executed_by_name}
                    </span>
                    {log.is_substitute && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-700 font-bold whitespace-nowrap">
                        대신수행
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{log.submitted_at}</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">"{log.memo}"</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>당번 승인 완료</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface DutyMembersTabProps {
  duty: MoaDuty;
  memberSubTab: 'ASSIGNEES' | 'VIEWERS';
  setMemberSubTab: (tab: 'ASSIGNEES' | 'VIEWERS') => void;
  onOpenInviteModal: () => void;
  onRemoveMember: (participantId: string, memberName: string) => void;
}

export const DutyMembersTab: React.FC<DutyMembersTabProps> = ({
  duty,
  memberSubTab,
  setMemberSubTab,
  onOpenInviteModal,
  onRemoveMember,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setMemberSubTab('ASSIGNEES')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                memberSubTab === 'ASSIGNEES'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>당번 수행원 ({duty.participants.filter((p) => p.role === 'ASSIGNEE').length}명)</span>
            </button>
            <button
              type="button"
              onClick={() => setMemberSubTab('VIEWERS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                memberSubTab === 'VIEWERS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>관람·응원단 ({duty.participants.filter((p) => p.role === 'VIEWER').length}명)</span>
            </button>

            <ElmHlp01
              title="당번 구성원 운영 및 불변 스냅샷 안내"
              badge="운영 원칙"
              tooltip="구성원 운영 안내 보기"
              align="left"
              width="sm:w-88"
            >
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-zinc-100 border-b border-slate-100 dark:border-zinc-800 pb-1.5">
                  <span className="text-sm">🔒</span>
                  <span>불변 스냅샷(Immutable Snapshot) 원칙</span>
                </div>
                <p>
                  이미 완료 및 정산된 과거 실적과 회계 이력은 <strong>불변 스냅샷</strong>으로 안전하게 보존되며 소급 변경되지 않습니다.
                </p>
                <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <span>✨</span>
                    <span>미래 큐 자동 반영</span>
                  </div>
                  <p>
                    진행 도중 신규 참여자가 수용되거나 탈퇴·해제되는 경우, <strong>향후(미래) 회차의 배정 순환 큐</strong>에만 즉시 반영되어 운영 연속성을 유지합니다.
                  </p>
                </div>
              </div>
            </ElmHlp01>
          </div>

          <button
            type="button"
            onClick={onOpenInviteModal}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>새 구성원 초대</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {duty.participants
          .filter((p) => (memberSubTab === 'ASSIGNEES' ? p.role === 'ASSIGNEE' : p.role === 'VIEWER'))
          .map((member, idx) => (
            <div
              key={member.participant_id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                  {member.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                      {member.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                      순번 #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold whitespace-nowrap">
                      활동중
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    초대 수락: 2026-10-24 18:30 • 배정 가중치: {member.weight || 1}배 • 다음 배정:{' '}
                    {duty.next_due_date || '오늘'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.participant_id, member.name)}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>멤버 해제</span>
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
