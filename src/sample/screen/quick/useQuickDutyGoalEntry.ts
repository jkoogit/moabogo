import React, { useRef, useState } from 'react';
import { addOfflineQueueItem } from '../../data/offlineQueueStore';
import {
  createIdempotencyKey,
  DutyEvaluationStatus,
  DutyProgressStatus,
  DutySettlementStatus,
  EVALUATION_STATUS_META,
  PROGRESS_STATUS_META,
  QUICK_DUTY_TASKS,
  QUICK_GOAL_TASKS,
  QUICK_PHOTO_PRESETS,
} from './quickEntryData';

export interface DutyGoalSubmitResult {
  message: string;
  idempotencyKey: string;
  queuedOffline: boolean;
}

/** SCR_QCK_02 비즈니스 상태 · 직교 3상태머신 · 목표 증감휠 · 1초 사진인증 훅 */
export function useQuickDutyGoalEntry(
  initialTaskType: 'DUTY' | 'GOAL',
  isOffline: boolean,
  onSuccess?: () => void
) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [taskType, setTaskType] = useState<'DUTY' | 'GOAL'>(initialTaskType);
  const [selectedDutyId, setSelectedDutyId] = useState(QUICK_DUTY_TASKS[0].value);
  const [selectedGoalId, setSelectedGoalId] = useState(QUICK_GOAL_TASKS[0].value);
  const [memo, setMemo] = useState(QUICK_DUTY_TASKS[0].defaultMemo);
  const [execTime, setExecTime] = useState('2026-11-25T09:15');

  const [progressStatus, setProgressStatus] = useState<DutyProgressStatus>('SUBMITTED');
  const [settlementStatus, setSettlementStatus] = useState<DutySettlementStatus>('UNSETTLED');
  const [evaluationStatus, setEvaluationStatus] = useState<DutyEvaluationStatus>('AUTO_APPROVED');
  const [isSubstituteRequested, setIsSubstituteRequested] = useState(false);
  const [substitutePerson, setSubstitutePerson] = useState('최수진(배우자)');

  const activeGoal =
    QUICK_GOAL_TASKS.find((g) => g.value === selectedGoalId) || QUICK_GOAL_TASKS[0];
  const [goalIncrementValue, setGoalIncrementValue] = useState<number>(
    QUICK_GOAL_TASKS[0].defaultIncrement
  );

  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(QUICK_PHOTO_PRESETS[0].url);
  const [attachedPhotoLabel, setAttachedPhotoLabel] = useState<string>(
    QUICK_PHOTO_PRESETS[0].label
  );
  const [isInstantSubmitting, setIsInstantSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<DutyGoalSubmitResult | null>(null);

  const handleTaskTypeChange = (nextType: 'DUTY' | 'GOAL') => {
    setTaskType(nextType);
    setSubmitSuccess(null);
    if (nextType === 'DUTY') {
      const duty = QUICK_DUTY_TASKS.find((d) => d.value === selectedDutyId) || QUICK_DUTY_TASKS[0];
      setMemo(duty.defaultMemo);
    } else {
      setMemo(activeGoal.defaultMemo);
      setGoalIncrementValue(activeGoal.defaultIncrement);
    }
  };

  const handleDutySelect = (dutyId: string) => {
    setSelectedDutyId(dutyId);
    const duty = QUICK_DUTY_TASKS.find((d) => d.value === dutyId);
    if (duty) {
      setMemo(duty.defaultMemo);
      setSettlementStatus(duty.rewardAmount > 0 ? 'UNSETTLED' : 'SETTLED');
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoalId(goalId);
    const goal = QUICK_GOAL_TASKS.find((g) => g.value === goalId);
    if (goal) {
      setGoalIncrementValue(goal.defaultIncrement);
      setMemo(goal.defaultMemo);
    }
  };

  const commitSubmission = (isInstantOneSec = false) => {
    const idempotencyKey = createIdempotencyKey('qck_act');
    const networkOffline =
      isOffline || (typeof navigator !== 'undefined' && navigator.onLine === false);
    const activeDuty =
      QUICK_DUTY_TASKS.find((d) => d.value === selectedDutyId) || QUICK_DUTY_TASKS[0];

    const summaryMessage =
      taskType === 'DUTY'
        ? isSubstituteRequested
          ? `[${activeDuty.label}] ${substitutePerson}님께 대신수행 요청이 전송되었습니다.`
          : `${isInstantOneSec ? '⚡ 1초 사진 인증 완료 · ' : ''}${PROGRESS_STATUS_META[progressStatus].label} / ${EVALUATION_STATUS_META[evaluationStatus].shortLabel}`
        : `[${activeGoal.label}] +${goalIncrementValue.toLocaleString()}${activeGoal.unit} 달성이 기록되었습니다.`;

    if (networkOffline) {
      addOfflineQueueItem({
        idempotencyKey,
        type: taskType === 'DUTY' ? 'DUTY_RECORD' : 'GOAL_RECORD',
        title: taskType === 'DUTY' ? activeDuty.label : activeGoal.label,
        amount: taskType === 'DUTY' ? activeDuty.rewardAmount : goalIncrementValue,
        ledgerName: '우리집 가계부 (가족 공유)',
        payerName: isSubstituteRequested ? substitutePerson : activeDuty.assignee,
        category: taskType === 'DUTY' ? '모아당번' : '모아목표',
        memo: summaryMessage,
      });
    }

    setSubmitSuccess({
      message: summaryMessage,
      idempotencyKey,
      queuedOffline: networkOffline,
    });
    if (onSuccess) onSuccess();
  };

  const applyPhotoProof = (url: string, label: string, autoSubmitNow = false) => {
    setAttachedPhoto(url);
    setAttachedPhotoLabel(label);
    if (taskType === 'DUTY') {
      setProgressStatus('SUBMITTED');
      setEvaluationStatus('AUTO_APPROVED');
      setIsSubstituteRequested(false);
    }
    if (autoSubmitNow) {
      setIsInstantSubmitting(true);
      window.setTimeout(() => {
        setIsInstantSubmitting(false);
        commitSubmission(true);
      }, 280);
    }
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        applyPhotoProof(reader.result, file.name, false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearPhoto = () => {
    setAttachedPhoto(null);
    setAttachedPhotoLabel('');
    if (taskType === 'DUTY' && evaluationStatus === 'AUTO_APPROVED') {
      setEvaluationStatus('UNVERIFIED');
    }
  };

  const projectedAccum = activeGoal.currentAccum + goalIncrementValue;
  const projectedRate = Math.min(100, Math.round((projectedAccum / activeGoal.totalTarget) * 100));
  const dailyAchieved = goalIncrementValue >= activeGoal.dailyTarget;

  return {
    photoInputRef,
    taskType,
    selectedDutyId,
    selectedGoalId,
    memo,
    setMemo,
    execTime,
    setExecTime,
    progressStatus,
    setProgressStatus,
    settlementStatus,
    setSettlementStatus,
    evaluationStatus,
    setEvaluationStatus,
    isSubstituteRequested,
    setIsSubstituteRequested,
    substitutePerson,
    setSubstitutePerson,
    activeGoal,
    goalIncrementValue,
    setGoalIncrementValue,
    attachedPhoto,
    attachedPhotoLabel,
    isInstantSubmitting,
    submitSuccess,
    setSubmitSuccess,
    projectedAccum,
    projectedRate,
    dailyAchieved,
    handleTaskTypeChange,
    handleDutySelect,
    handleGoalSelect,
    applyPhotoProof,
    handlePhotoFileChange,
    handleClearPhoto,
    commitSubmission,
  };
}
