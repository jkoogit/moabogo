import React from 'react';
import { Check, Sparkles, Target } from 'lucide-react';
import {
  ElmHlp01,
  ElmInp01,
  ElmRng01,
  ElmSel01,
} from '../elements/Tokens';
import { QuickSheetShell } from './quick/QuickSheetShell';
import { QuickOfflineBanner, QuickSuccessBanner } from './quick/QuickFeedbackBanners';
import { QuickPhotoProofBox } from './quick/QuickPhotoProofBox';
import { useQuickDutyGoalEntry } from './quick/useQuickDutyGoalEntry';
import {
  EVALUATION_STATUS_META,
  PROGRESS_STATUS_META,
  QUICK_DUTY_TASKS,
  QUICK_GOAL_TASKS,
  SETTLEMENT_STATUS_META,
} from './quick/quickEntryData';

export interface SCR_QCK_02_Props {
  isOpen?: boolean;
  variant?: 'sheet' | 'standalone';
  isOffline?: boolean;
  initialTaskType?: 'DUTY' | 'GOAL';
  onClose?: () => void;
  onSuccess?: () => void;
}

export const SCR_QCK_02_빠른수행등록: React.FC<SCR_QCK_02_Props> = ({
  isOpen,
  variant,
  isOffline = false,
  initialTaskType = 'DUTY',
  onClose,
  onSuccess,
}) => {
  const resolvedVariant: 'sheet' | 'standalone' =
    variant ?? (isOpen !== undefined ? 'sheet' : 'standalone');
  const resolvedOpen = isOpen ?? true;

  const q = useQuickDutyGoalEntry(initialTaskType, isOffline, onSuccess);

  const footerContent = (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 min-w-0">
        {q.taskType === 'DUTY' ? (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${PROGRESS_STATUS_META[q.progressStatus].badgeClass}`}
          >
            {PROGRESS_STATUS_META[q.progressStatus].shortLabel} ·{' '}
            {EVALUATION_STATUS_META[q.evaluationStatus].shortLabel}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
            +{q.goalIncrementValue.toLocaleString()}
            {q.activeGoal.unit} ({q.projectedRate}%)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap cursor-pointer"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={() => q.commitSubmission(false)}
          disabled={q.isInstantSubmitting}
          className="min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{q.taskType === 'DUTY' ? '수행 인증 완료' : '목표 수치 기록'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <QuickSheetShell
      variant={resolvedVariant}
      isOpen={resolvedOpen}
      onClose={onClose ?? (() => {})}
      title="빠른 수행등록"
      badge="SCR-QCK-02"
      headerExtra={
        <ElmHlp01
          title="모아당번 3상태머신 & 목표 증감휠 안내"
          badge="FSM"
          colorScheme="purple"
          align="right"
        >
          <ul className="space-y-1.5 text-[11px] leading-relaxed">
            <li>• <strong>직교 3상태머신</strong>: 진행(PENDING→SUBMITTED), 정산(UNSETTLED/SETTLED), 검증(UNVERIFIED/AUTO_APPROVED/MANUAL_CONFIRMED) 3축이 독립 전이됩니다.</li>
            <li>• <strong>1초 사진 인증</strong>: 사진 첨부 즉시 제출·자동승인 상태로 전환됩니다.</li>
            <li>• <strong>목표 증감휠</strong>: 마우스 휠·슬라이더·`[-]`/`[+]` 버튼으로 달성 수치를 빠르게 입력합니다.</li>
          </ul>
        </ElmHlp01>
      }
      footer={footerContent}
    >
      {isOffline && (
        <QuickOfflineBanner message="오프라인 모드입니다. 인증 사진과 수행 기록은 IndexedDB 큐에 안전 임시 저장됩니다." />
      )}

      {q.submitSuccess && (
        <QuickSuccessBanner
          title={
            q.submitSuccess.queuedOffline
              ? '오프라인 동기화 대기열에 임시 저장되었습니다!'
              : '수행 등록이 성공적으로 기록되었습니다!'
          }
          description={q.submitSuccess.message}
          idempotencyKey={q.submitSuccess.idempotencyKey}
          continueLabel="새 수행 계속 등록"
          accentColor="purple"
          onContinue={() => q.setSubmitSuccess(null)}
          onClose={onClose}
        />
      )}

      {/* 1. 당번 / 목표 스위처 */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => q.handleTaskTypeChange('DUTY')}
          className={`min-h-[54px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
            q.taskType === 'DUTY'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-700 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20'
              : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>모아당번 수행</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            1초 사진인증 · 3상태머신
          </span>
        </button>

        <button
          type="button"
          onClick={() => q.handleTaskTypeChange('GOAL')}
          className={`min-h-[54px] p-3 rounded-xl border text-left transition-all cursor-pointer ${
            q.taskType === 'GOAL'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
              : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm whitespace-nowrap">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>모아목표 달성</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
            수치 증감휠(ElmRng01)
          </span>
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          q.commitSubmission(false);
        }}
        className="space-y-3.5"
      >
        {q.taskType === 'DUTY' ? (
          <>
            <ElmSel01
              label="수행할 당번 과업 선택"
              value={q.selectedDutyId}
              onChange={q.handleDutySelect}
              options={QUICK_DUTY_TASKS.map((d) => ({ value: d.value, label: d.label }))}
            />

            {/* 모아당번 직교 3상태머신 전이 패널 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 whitespace-nowrap">
                  직교 3상태머신 전이
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${PROGRESS_STATUS_META[q.progressStatus].badgeClass}`}
                  >
                    {PROGRESS_STATUS_META[q.progressStatus].shortLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${SETTLEMENT_STATUS_META[q.settlementStatus].badgeClass}`}
                  >
                    {SETTLEMENT_STATUS_META[q.settlementStatus].shortLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${EVALUATION_STATUS_META[q.evaluationStatus].badgeClass}`}
                  >
                    {EVALUATION_STATUS_META[q.evaluationStatus].shortLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    q.setIsSubstituteRequested(false);
                    q.setProgressStatus('SUBMITTED');
                    q.setEvaluationStatus(q.attachedPhoto ? 'AUTO_APPROVED' : 'UNVERIFIED');
                  }}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    !q.isSubstituteRequested && q.progressStatus === 'SUBMITTED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  수행제출
                </button>
                <button
                  type="button"
                  onClick={() => {
                    q.setIsSubstituteRequested(false);
                    q.setProgressStatus('IN_PROGRESS');
                    q.setEvaluationStatus('UNVERIFIED');
                  }}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    !q.isSubstituteRequested && q.progressStatus === 'IN_PROGRESS'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  진행중
                </button>
                <button
                  type="button"
                  onClick={() => {
                    q.setIsSubstituteRequested(true);
                    q.setProgressStatus('ASSIGNED');
                    q.setEvaluationStatus('UNVERIFIED');
                  }}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    q.isSubstituteRequested
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  대신요청
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-0.5">
                <button
                  type="button"
                  onClick={() =>
                    q.setSettlementStatus((prev) =>
                      prev === 'UNSETTLED' ? 'SETTLED' : 'UNSETTLED'
                    )
                  }
                  className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 whitespace-nowrap cursor-pointer"
                >
                  정산축: {SETTLEMENT_STATUS_META[q.settlementStatus].shortLabel} ↻
                </button>
                <button
                  type="button"
                  onClick={() =>
                    q.setEvaluationStatus((prev) =>
                      prev === 'AUTO_APPROVED'
                        ? 'MANUAL_CONFIRMED'
                        : prev === 'MANUAL_CONFIRMED'
                        ? 'UNVERIFIED'
                        : 'AUTO_APPROVED'
                    )
                  }
                  className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 whitespace-nowrap cursor-pointer"
                >
                  검증축: {EVALUATION_STATUS_META[q.evaluationStatus].shortLabel} ↻
                </button>
              </div>
            </div>

            {q.isSubstituteRequested && (
              <ElmSel01
                label="대신수행 요청 대상자"
                value={q.substitutePerson}
                onChange={q.setSubstitutePerson}
                options={[
                  { value: '구본영(호스트)', label: '구본영 (호스트)' },
                  { value: '최수진(배우자)', label: '최수진 (배우자)' },
                  { value: '구민우(자녀)', label: '구민우 (자녀)' },
                ]}
              />
            )}
          </>
        ) : (
          <>
            <ElmSel01
              label="인증할 모아목표 선택"
              value={q.selectedGoalId}
              onChange={q.handleGoalSelect}
              options={QUICK_GOAL_TASKS.map((g) => ({ value: g.value, label: g.label }))}
            />

            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 whitespace-nowrap">
                  오늘 달성 수치 입력 (증감휠)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                    q.dailyAchieved
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  일일 기준 {q.activeGoal.dailyTarget.toLocaleString()}
                  {q.activeGoal.unit} {q.dailyAchieved ? '달성 ✓' : '진행중'}
                </span>
              </div>

              <ElmRng01
                label="금회 인증 수치"
                value={q.goalIncrementValue}
                min={q.activeGoal.min}
                max={q.activeGoal.max}
                step={q.activeGoal.step}
                unit={q.activeGoal.unit}
                colorScheme={q.activeGoal.colorScheme}
                onChange={q.setGoalIncrementValue}
              />

              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>
                    누적 예상: {q.projectedAccum.toLocaleString()} /{' '}
                    {q.activeGoal.totalTarget.toLocaleString()}
                    {q.activeGoal.unit}
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {q.projectedRate}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-200"
                    style={{ width: `${q.projectedRate}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ElmInp01
            label="수행 일시"
            type="datetime-local"
            value={q.execTime}
            onChange={q.setExecTime}
          />
          <ElmInp01
            label={q.isSubstituteRequested ? '대신수행 요청 사유' : '수행 메모'}
            value={q.memo}
            onChange={q.setMemo}
            placeholder="수행 내용 또는 요청 메모 입력"
          />
        </div>

        <QuickPhotoProofBox
          photoInputRef={q.photoInputRef}
          taskType={q.taskType}
          attachedPhoto={q.attachedPhoto}
          attachedPhotoLabel={q.attachedPhotoLabel}
          isInstantSubmitting={q.isInstantSubmitting}
          onFileChange={q.handlePhotoFileChange}
          onApplyProof={q.applyPhotoProof}
          onClearPhoto={q.handleClearPhoto}
        />
      </form>
    </QuickSheetShell>
  );
};
