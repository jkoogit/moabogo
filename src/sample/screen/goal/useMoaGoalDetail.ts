import React, { useState, useMemo } from 'react';
import {
  GoalItem,
  GoalComment,
  ExecutionRecord,
  INITIAL_GOAL_LIST,
} from '../../data/goal-mock-data';
import {
  getMemberAllowanceAccount,
  loadUserBankAccounts,
  maskAccountNo,
} from '../../data/accountStorePool';
import {
  buildIdempotencyKey,
  buildSafeTossTransferUrl,
  validateSafeTransferUrl,
} from '../../shared/securityGuards';
import { getGoalPlugin } from './plugins/registry';

export type GoalDetailTab = 'STATUS' | 'HISTORY' | 'PARTICIPANTS';

export function useMoaGoalDetail(goalId: string = 'goal-1') {
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOAL_LIST);
  const currentGoal = useMemo(
    () => goals.find((g) => g.id === goalId) || goals[0],
    [goals, goalId]
  );

  const plugin = useMemo(() => getGoalPlugin(currentGoal.category), [currentGoal.category]);

  const [activeTab, setActiveTab] = useState<GoalDetailTab>('STATUS');
  const [sliderTargetValue, setSliderTargetValue] = useState<number>(currentGoal.targetValue);

  const [recordValue, setRecordValue] = useState('');
  const [recordMemo, setRecordMemo] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFilePreview, setAttachedFilePreview] = useState<string | null>(null);

  const [statusCommentInput, setStatusCommentInput] = useState('');
  const [historyCommentInputs, setHistoryCommentInputs] = useState<Record<string, string>>({});

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecordForTransfer, setSelectedRecordForTransfer] =
    useState<ExecutionRecord | null>(null);
  const [transferAmount, setTransferAmount] = useState('5000');
  const [transferMemo, setTransferMemo] = useState('목표 달성 축하 용돈');
  const [processedTransferKeys, setProcessedTransferKeys] = useState<Record<string, boolean>>({});

  const myAccounts = useMemo(() => loadUserBankAccounts('u-1001-koo'), []);
  const hasSenderAccount = myAccounts.length > 0;
  const [transferBank, setTransferBank] = useState('토스뱅크');
  const [transferAccountNo, setTransferAccountNo] = useState('');
  const [transferAccountHolder, setTransferAccountHolder] = useState('');
  const [isManualAccountMode, setIsManualAccountMode] = useState(false);

  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAttachedFilePreview(previewUrl);
      showToast(`📷 파일 "${file.name}"이(가) 첨부되었습니다.`);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (attachedFilePreview) {
      URL.revokeObjectURL(attachedFilePreview);
      setAttachedFilePreview(null);
    }
  };

  const handleRegisterExecution = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!recordValue.trim()) {
      showToast('⚠️ 오늘의 실천 수치를 입력해주세요.');
      return;
    }

    const valNum = parseInt(recordValue.replace(/,/g, ''), 10) || 0;
    const newRecord: ExecutionRecord = {
      id: `rec-${Date.now()}`,
      goalId: currentGoal.id,
      companionId: 'c1',
      companionName: '구본영(나)',
      date: '2026.11.01',
      valueText: `${recordValue} ${currentGoal.unit} 실천 완료`,
      memo: recordMemo.trim() || '오늘의 목표를 성실히 실천했습니다.',
      hasPhoto: !!attachedFilePreview,
      photoUrl: attachedFilePreview || undefined,
      cheerCount: 0,
      userCheered: false,
      comments: [],
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== currentGoal.id) return g;
        const nextRecords = [newRecord, ...g.records];
        const newCurrentTotal = g.currentTotal + valNum;
        const activePlugin = getGoalPlugin(g.category);
        const nextProgressRate = activePlugin.calculateProgressRate(
          g,
          newCurrentTotal,
          sliderTargetValue
        );
        return {
          ...g,
          currentTotal: newCurrentTotal,
          progressRate: nextProgressRate,
          records: nextRecords,
          companions: g.companions.map((c) =>
            c.id === 'c1'
              ? {
                  ...c,
                  status: 'COMPLETED',
                  progress: `${recordValue} ${g.unit} 달성`,
                  currentValue: c.currentValue + valNum,
                  achievementRate: Math.min(
                    100,
                    Math.round(((c.currentValue + valNum) / Math.max(1, c.targetValue)) * 100)
                  ),
                }
              : c
          ),
        };
      })
    );

    setRecordValue('');
    setRecordMemo('');
    handleRemoveFile();
    showToast('🎉 오늘의 인증이 성공적으로 등록되었습니다!');
  };

  const handleToggleGoalCheer = () => {
    if (currentGoal.myRole === 'MANAGER') {
      showToast('⚠️ 관리자는 객관적 운영자로서 응원 작성이 제한됩니다.');
      return;
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== currentGoal.id) return g;
        const nextCheered = !g.userCheered;
        return {
          ...g,
          userCheered: nextCheered,
          cheerCount: nextCheered ? g.cheerCount + 1 : Math.max(0, g.cheerCount - 1),
        };
      })
    );
  };

  const handleToggleRecordCheer = (recordId: string) => {
    if (currentGoal.myRole === 'MANAGER') {
      showToast('⚠️ 관리자는 객관적 운영자로서 응원 작성이 제한됩니다.');
      return;
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== currentGoal.id) return g;
        return {
          ...g,
          records: g.records.map((r) => {
            if (r.id !== recordId) return r;
            const nextCheered = !r.userCheered;
            return {
              ...r,
              userCheered: nextCheered,
              cheerCount: nextCheered ? r.cheerCount + 1 : Math.max(0, r.cheerCount - 1),
            };
          }),
        };
      })
    );
  };

  const handleAddStatusComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentGoal.myRole === 'MANAGER') {
      showToast('⚠️ 관리자는 소셜 응원 댓글 작성이 제한됩니다.');
      return;
    }
    if (!statusCommentInput.trim()) return;

    const newComment: GoalComment = {
      id: `cm-${Date.now()}`,
      author: currentGoal.myRole === 'PARTICIPANT' ? '구본영(나)' : '응원가족(나)',
      role: currentGoal.myRole,
      text: statusCommentInput.trim(),
      createdAt: '방금 전',
    };

    setGoals((prev) =>
      prev.map((g) =>
        g.id === currentGoal.id ? { ...g, comments: [newComment, ...g.comments] } : g
      )
    );
    setStatusCommentInput('');
    showToast('✓ 따뜻한 응원 댓글이 등록되었습니다.');
  };

  const handleAddHistoryComment = (recordId: string) => {
    if (currentGoal.myRole === 'MANAGER') {
      showToast('⚠️ 관리자는 소셜 응원 댓글 작성이 제한됩니다.');
      return;
    }
    const text = historyCommentInputs[recordId]?.trim();
    if (!text) return;

    const newComment: GoalComment = {
      id: `rcm-${Date.now()}`,
      author: currentGoal.myRole === 'PARTICIPANT' ? '구본영(나)' : '응원가족(나)',
      role: currentGoal.myRole,
      text,
      createdAt: '방금 전',
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== currentGoal.id) return g;
        return {
          ...g,
          records: g.records.map((r) =>
            r.id === recordId ? { ...r, comments: [...r.comments, newComment] } : r
          ),
        };
      })
    );
    setHistoryCommentInputs((prev) => ({ ...prev, [recordId]: '' }));
    showToast('✓ 이력 피드에 댓글을 남겼습니다.');
  };

  const handleOpenTransferModal = (record: ExecutionRecord) => {
    setSelectedRecordForTransfer(record);
    const allowance = getMemberAllowanceAccount('led-group-01', record.companionName);
    if (allowance.hasAccount && allowance.account && allowance.account.accountNo) {
      setTransferBank(allowance.account.bankName);
      setTransferAccountNo(allowance.account.accountNo);
      setTransferAccountHolder(allowance.account.accountHolder);
      setIsManualAccountMode(false);
    } else if (record.allowanceAccount) {
      const parts = record.allowanceAccount.split(' ');
      setTransferBank(parts[0] || '토스뱅크');
      setTransferAccountNo(parts[1] || record.allowanceAccount);
      setTransferAccountHolder(record.companionName.replace(/\(.*\)/, '').trim());
      setIsManualAccountMode(false);
    } else {
      setTransferBank('토스뱅크');
      setTransferAccountNo('');
      setTransferAccountHolder(record.companionName.replace(/\(.*\)/, '').trim());
      setIsManualAccountMode(true);
    }
    setTransferModalOpen(true);
  };

  const handleOpenSafeTossTransfer = () => {
    if (!transferBank.trim() || !transferAccountNo.trim()) {
      showToast('⚠️ 송금받을 은행명과 계좌번호를 먼저 입력해주세요.');
      return;
    }
    const amountNum = parseInt(transferAmount, 10) || 5000;
    const validation = buildSafeTossTransferUrl(transferBank, transferAccountNo, amountNum);
    if (!validation.valid || !validation.sanitizedUrl) {
      showToast(`⚠️ 보안 검증 실패: ${validation.reason || '신뢰할 수 없는 송금 링크입니다.'}`);
      return;
    }
    navigator.clipboard?.writeText(validation.sanitizedUrl);
    showToast(
      `✓ 보안 검증 완료! 토스 안전 송금 링크(${transferBank} ${maskAccountNo(
        transferAccountNo
      )}, ${amountNum.toLocaleString()}원)가 복사되었습니다.`
    );
  };

  const handleCompleteTransfer = () => {
    if (!selectedRecordForTransfer) return;
    const targetName = selectedRecordForTransfer.companionName;
    const amountNum = parseInt(transferAmount, 10) || 5000;
    const idemKey = buildIdempotencyKey('goal_allowance_transfer', [
      currentGoal.id,
      selectedRecordForTransfer.id,
      amountNum,
      transferBank,
    ]);

    if (processedTransferKeys[idemKey]) {
      showToast('⚠️ 이미 동일 조건으로 처리된 용돈 송금입니다 (중복 기장 차단).');
      return;
    }

    const transferNoticeComment: GoalComment = {
      id: `tcm-${Date.now()}`,
      author: '구본영(나)',
      role: currentGoal.myRole,
      text: `💸 [용돈이체 완료] ${targetName}에게 ${amountNum.toLocaleString()}원을 송금했습니다! (${transferBank} ${maskAccountNo(
        transferAccountNo
      )} / ${transferMemo})`,
      createdAt: '방금 전',
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== currentGoal.id) return g;
        return {
          ...g,
          records: g.records.map((r) =>
            r.id === selectedRecordForTransfer.id
              ? { ...r, comments: [...r.comments, transferNoticeComment] }
              : r
          ),
        };
      })
    );

    setProcessedTransferKeys((prev) => ({ ...prev, [idemKey]: true }));
    setTransferModalOpen(false);
    showToast(`✓ ${targetName}에게 ${amountNum.toLocaleString()}원 용돈 송금이 완료되었습니다!`);
  };

  const handleCompleteWithoutTransfer = () => {
    if (!selectedRecordForTransfer) return;
    const targetName = selectedRecordForTransfer.companionName;
    const amountNum = parseInt(transferAmount, 10) || 5000;

    const cashNoticeComment: GoalComment = {
      id: `ccm-${Date.now()}`,
      author: '구본영(나)',
      role: currentGoal.myRole,
      text: `💵 [현금전달 완료] ${targetName}에게 ${amountNum.toLocaleString()}원을 직접 현금으로 전달했습니다! (${transferMemo})`,
      createdAt: '방금 전',
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== currentGoal.id) return g;
        return {
          ...g,
          records: g.records.map((r) =>
            r.id === selectedRecordForTransfer.id
              ? { ...r, comments: [...r.comments, cashNoticeComment] }
              : r
          ),
        };
      })
    );

    setTransferModalOpen(false);
    showToast(`✓ ${targetName}에게 현금으로 전달하고 이체 없이 종료했습니다.`);
  };

  const handleCopySafeInviteLink = (roleType: 'companion' | 'viewer') => {
    const rawUrl =
      roleType === 'companion'
        ? `https://moabogo.app/goal/${currentGoal.id}?role=companion&code=GOL-8921`
        : `https://moabogo.app/goal/${currentGoal.id}?role=viewer&code=GOL-VIEW`;
    const check = validateSafeTransferUrl(rawUrl);
    if (!check.valid || !check.sanitizedUrl) {
      showToast(`⚠️ 보안 검증 실패: ${check.reason || '허용되지 않은 초대 도메인입니다.'}`);
      return;
    }
    navigator.clipboard?.writeText(check.sanitizedUrl);
    showToast(
      roleType === 'companion'
        ? '✓ 보안 검증된 동행원 초대 링크가 클립보드에 복사되었습니다.'
        : '✓ 보안 검증된 관람원 응원 초대 링크가 클립보드에 복사되었습니다.'
    );
  };

  return {
    currentGoal,
    plugin,
    activeTab,
    setActiveTab,
    sliderTargetValue,
    setSliderTargetValue,
    recordValue,
    setRecordValue,
    recordMemo,
    setRecordMemo,
    attachedFile,
    attachedFilePreview,
    statusCommentInput,
    setStatusCommentInput,
    historyCommentInputs,
    setHistoryCommentInputs,
    inviteModalOpen,
    setInviteModalOpen,
    transferModalOpen,
    setTransferModalOpen,
    selectedRecordForTransfer,
    transferAmount,
    setTransferAmount,
    transferMemo,
    setTransferMemo,
    hasSenderAccount,
    transferBank,
    setTransferBank,
    transferAccountNo,
    setTransferAccountNo,
    transferAccountHolder,
    setTransferAccountHolder,
    isManualAccountMode,
    setIsManualAccountMode,
    feedbackNotice,
    setFeedbackNotice,
    handleFileChange,
    handleRemoveFile,
    handleRegisterExecution,
    handleToggleGoalCheer,
    handleToggleRecordCheer,
    handleAddStatusComment,
    handleAddHistoryComment,
    handleOpenTransferModal,
    handleOpenSafeTossTransfer,
    handleCompleteTransfer,
    handleCompleteWithoutTransfer,
    handleCopySafeInviteLink,
  };
}
