import React from 'react';
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { MoaDuty } from '../../../types';
import { DutyInvitation } from '../../dutyStore';
import { DutyManageTab } from './useMoaDutyManage';
import { formatKoreanCycleDays, getRotationPolicyLabel } from './dutyUtils';

interface DutyListSectionProps {
  activeTab: DutyManageTab;
  invitations: DutyInvitation[];
  filteredDuties: MoaDuty[];
  onAcceptInvitation: (invId: string) => void;
  onRejectInvitation: (invId: string) => void;
  onSelectDuty?: (dutyId: string) => void;
  onResetFilters: () => void;
}

export const DutyListSection: React.FC<DutyListSectionProps> = ({
  activeTab,
  invitations,
  filteredDuties,
  onAcceptInvitation,
  onRejectInvitation,
  onSelectDuty,
  onResetFilters,
}) => {
  if (activeTab === 'INVITATION') {
    return (
      <div className="space-y-3">
        {invitations.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 text-sm">
            도착한 당번 초대장이 없습니다.
          </div>
        ) : (
          invitations.map((inv) => (
            <div
              key={inv.invitation_id}
              className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 whitespace-nowrap">
                    {inv.category_name}
                  </span>
                  <span className="text-xs text-slate-400">초대일: {inv.invited_at}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{inv.duty_title}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  초대자: <strong className="text-slate-700 dark:text-zinc-200">{inv.inviter_name}</strong> • 배정 역할:{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {inv.role === 'ASSIGNEE' ? '당번 수행원' : '관람·응원단'}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {inv.status === 'PENDING' ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRejectInvitation(inv.invitation_id);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 cursor-pointer whitespace-nowrap"
                    >
                      거절
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAcceptInvitation(inv.invitation_id);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      수락하고 참여
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                      inv.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {inv.status === 'ACCEPTED' ? '✓ 수락 완료' : '거절됨'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      {filteredDuties.length === 0 ? (
        <div className="col-span-full p-12 text-center bg-white dark:bg-[#121215] rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">조회된 당번 과업이 없습니다</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            검색 조건 또는 카테고리 필터를 변경하거나, 상단의 [+ 새 당번 등록] 버튼으로 새로운 생활 역할을 시작해보세요.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            필터 전체 초기화
          </button>
        </div>
      ) : (
        filteredDuties.map((duty) => {
          const hasSubRequest =
            duty.active_substitute_request && duty.active_substitute_request.status === 'PENDING';

          return (
            <div
              key={duty.duty_id}
              onClick={() => onSelectDuty && onSelectDuty(duty.duty_id)}
              className="p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
            >
              {/* Card Top: Category, Rotation, 3-State Badges */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 whitespace-nowrap">
                    {duty.category_name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700 whitespace-nowrap">
                    {getRotationPolicyLabel(duty.rotation_policy)}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  {duty.progress_status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1 whitespace-nowrap">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>완수</span>
                    </span>
                  ) : duty.progress_status === 'SUBMITTED' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      <span>제출됨</span>
                    </span>
                  ) : duty.progress_status === 'IN_PROGRESS' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 whitespace-nowrap">
                      수행중
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                      대기
                    </span>
                  )}

                  {duty.evaluation_status === 'AUTO_APPROVED' ? (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap"
                      title="시스템/피어 자동 승인"
                    >
                      자동승인
                    </span>
                  ) : duty.evaluation_status === 'MANUAL_CONFIRMED' ? (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 whitespace-nowrap"
                      title="피어 상호 검증 승인"
                    >
                      상호승인
                    </span>
                  ) : null}

                  {duty.settlement_status === 'SETTLED' && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 whitespace-nowrap">
                      정산완료
                    </span>
                  )}
                </div>
              </div>

              {/* Card Title & Description */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {duty.duty_title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {duty.duty_description}
                </p>
              </div>

              {/* Cycle Schedule Banner */}
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] gap-2">
                <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300 min-w-0 truncate">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate">{formatKoreanCycleDays(duty.cycle_config.days_of_week)}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 shrink-0 whitespace-nowrap">
                  누적 완수 {duty.completed_count}회
                </span>
              </div>

              {/* Substitute Request Alert Banner */}
              {hasSubRequest && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 flex items-center justify-between text-xs gap-2">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1 whitespace-nowrap">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>대신수행 요청 중</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                    보상 ₩{duty.active_substitute_request?.allowance_amount?.toLocaleString() || '3,000'}
                  </span>
                </div>
              )}

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {duty.current_assigned_name.slice(0, 1)}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                    {duty.current_assigned_name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] shrink-0 whitespace-nowrap">
                  <span>마감: {duty.next_due_date || '오늘'}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
