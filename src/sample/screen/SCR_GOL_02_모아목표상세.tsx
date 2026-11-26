import React from 'react';
import {
  Target,
  Users,
  Heart,
  Share2,
  Clock,
  TrendingUp,
  ChevronLeft,
} from 'lucide-react';
import { ElmTyp01, ElmStt01 } from '../elements/Tokens';
import { useMoaGoalDetail } from './goal/useMoaGoalDetail';
import { GoalStatusTab } from './goal/GoalStatusTab';
import { GoalHistoryTab, GoalParticipantsTab } from './goal/GoalHistoryParticipantsTabs';
import { GoalDetailModals } from './goal/GoalDetailModals';

// ============================================================================
// SCR_GOL_02_모아목표상세 (Slim Orchestrator Shell)
// - goal/ 하위 모듈 및 goal/plugins/ 전략 플러그인 기반 SRP 분해 + 보안 가드레일 바인딩
// ============================================================================

export const SCR_GOL_02_모아목표상세: React.FC<{
  goalId?: string;
  onBack?: () => void;
  onNavigateToGame?: (params: {
    groupId: string;
    gameType: 'ROULETTE' | 'LADDER' | 'SPLIT';
    presetType?: 'CELEBRATION' | 'PENALTY';
  }) => void;
}> = ({ goalId = 'goal-1', onBack }) => {
  const state = useMoaGoalDetail(goalId);
  const { currentGoal, plugin } = state;

  const roleBadgeType =
    currentGoal.myRole === 'MANAGER'
      ? 'INDIGO'
      : currentGoal.myRole === 'PARTICIPANT'
      ? 'EMERALD'
      : 'PURPLE';
  const roleLabel =
    currentGoal.myRole === 'MANAGER'
      ? '내 역할: 관리자 (운영/마감)'
      : currentGoal.myRole === 'PARTICIPANT'
      ? '내 역할: 동행원 (직접실천)'
      : '내 역할: 관람원 (응원/용돈)';

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. 상단 헤더 */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
              title="모아목표 목록으로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <ElmTyp01
            title="모아목표 관리"
            badge="SCR-GOL-02"
            subtitle={`${currentGoal.title} • ${currentGoal.categoryLabel} 상세 조회`}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => state.setInviteModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <Share2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>초대하기</span>
          </button>

          <button
            type="button"
            onClick={state.handleToggleGoalCheer}
            disabled={currentGoal.myRole === 'MANAGER'}
            title={currentGoal.myRole === 'MANAGER' ? '관리자는 응원 등록 불가' : '응원하기'}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              currentGoal.myRole === 'MANAGER'
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'
                : currentGoal.userCheered
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-300 dark:border-rose-800 cursor-pointer'
                : 'border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 cursor-pointer'
            }`}
          >
            <Heart
              className={`w-4 h-4 shrink-0 ${
                currentGoal.userCheered ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>응원 {currentGoal.cheerCount}</span>
          </button>
        </div>
      </section>

      {state.feedbackNotice && (
        <aside className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in shadow-xs">
          <span>{state.feedbackNotice}</span>
          <button
            type="button"
            onClick={() => state.setFeedbackNotice(null)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-indigo-500 hover:text-indigo-700 cursor-pointer"
          >
            ✕
          </button>
        </aside>
      )}

      {/* 2. 목표 요약 카드 */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${plugin.badgeColorClass}`}
                >
                  {currentGoal.categoryLabel}
                </span>
                <ElmStt01 type={roleBadgeType} label={roleLabel} />
                <ElmStt01
                  type={currentGoal.status === 'COMPLETED' ? 'INDIGO' : 'EMERALD'}
                  label={currentGoal.status === 'COMPLETED' ? '달성완료 🎉' : '진행중 🏃'}
                />
                <span className="text-xs font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                  {currentGoal.dDay}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 break-keep mt-1">
                {currentGoal.title}
              </h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate mt-0.5">
                실천 기간: {currentGoal.period} • {currentGoal.nextSchedule}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block font-semibold">전체 달성률</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {currentGoal.progressRate}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, currentGoal.progressRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>
              누적 달성: {currentGoal.currentTotal.toLocaleString()} {currentGoal.unit}
            </span>
            <span>
              최종 목표: {currentGoal.targetValue.toLocaleString()} {currentGoal.unit}
            </span>
          </div>
        </div>
      </section>

      {/* 3. 상세 3대 탭 메뉴 */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => state.setActiveTab('STATUS')}
          className={`min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            state.activeTab === 'STATUS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>1. 목표 현황</span>
        </button>
        <button
          type="button"
          onClick={() => state.setActiveTab('HISTORY')}
          className={`min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            state.activeTab === 'HISTORY'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span>2. 수행 이력 ({currentGoal.records.length})</span>
        </button>
        <button
          type="button"
          onClick={() => state.setActiveTab('PARTICIPANTS')}
          className={`min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
            state.activeTab === 'PARTICIPANTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>3. 참가자 현황 ({currentGoal.companions.length})</span>
          {currentGoal.myRole === 'VIEWER' && (
            <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
              RBAC 잠김
            </span>
          )}
        </button>
      </div>

      {/* 4. 탭 본문 */}
      {state.activeTab === 'STATUS' && (
        <GoalStatusTab
          currentGoal={currentGoal}
          plugin={plugin}
          sliderTargetValue={state.sliderTargetValue}
          setSliderTargetValue={state.setSliderTargetValue}
          recordValue={state.recordValue}
          setRecordValue={state.setRecordValue}
          recordMemo={state.recordMemo}
          setRecordMemo={state.setRecordMemo}
          attachedFile={state.attachedFile}
          attachedFilePreview={state.attachedFilePreview}
          onFileChange={state.handleFileChange}
          onRemoveFile={state.handleRemoveFile}
          onRegisterExecution={state.handleRegisterExecution}
          statusCommentInput={state.statusCommentInput}
          setStatusCommentInput={state.setStatusCommentInput}
          onAddStatusComment={state.handleAddStatusComment}
        />
      )}

      {state.activeTab === 'HISTORY' && (
        <GoalHistoryTab
          currentGoal={currentGoal}
          hasSenderAccount={state.hasSenderAccount}
          historyCommentInputs={state.historyCommentInputs}
          setHistoryCommentInputs={state.setHistoryCommentInputs}
          onToggleRecordCheer={state.handleToggleRecordCheer}
          onOpenTransferModal={state.handleOpenTransferModal}
          onAddHistoryComment={state.handleAddHistoryComment}
        />
      )}

      {state.activeTab === 'PARTICIPANTS' && <GoalParticipantsTab currentGoal={currentGoal} />}

      {/* 5. 모달 */}
      <GoalDetailModals
        currentGoal={currentGoal}
        transferModalOpen={state.transferModalOpen}
        setTransferModalOpen={state.setTransferModalOpen}
        selectedRecordForTransfer={state.selectedRecordForTransfer}
        transferAmount={state.transferAmount}
        setTransferAmount={state.setTransferAmount}
        transferMemo={state.transferMemo}
        setTransferMemo={state.setTransferMemo}
        transferBank={state.transferBank}
        setTransferBank={state.setTransferBank}
        transferAccountNo={state.transferAccountNo}
        setTransferAccountNo={state.setTransferAccountNo}
        transferAccountHolder={state.transferAccountHolder}
        setTransferAccountHolder={state.setTransferAccountHolder}
        isManualAccountMode={state.isManualAccountMode}
        setIsManualAccountMode={state.setIsManualAccountMode}
        onOpenSafeTossTransfer={state.handleOpenSafeTossTransfer}
        onCompleteTransfer={state.handleCompleteTransfer}
        onCompleteWithoutTransfer={state.handleCompleteWithoutTransfer}
        inviteModalOpen={state.inviteModalOpen}
        setInviteModalOpen={state.setInviteModalOpen}
        onCopySafeInviteLink={state.handleCopySafeInviteLink}
      />
    </div>
  );
};
