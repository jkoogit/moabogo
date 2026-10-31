import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmStt01,
  ElmCnt01,
  ElmPrf01,
  ElmRng01,
} from '../elements/Tokens';
import {
  GoalItem,
  GoalComment,
  ExecutionRecord,
  INITIAL_GOAL_LIST,
} from '../data/goal-mock-data';
import {
  Target,
  Users,
  Eye,
  CheckCircle,
  Plus,
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Copy,
  Clock,
  TrendingUp,
  ShieldAlert,
  ChevronLeft,
  X,
  Upload,
  Coins,
  Send,
  Sparkles,
  ExternalLink,
  Check,
  RotateCcw,
} from 'lucide-react';

export const SCR_GOL_02_모아목표상세: React.FC<{
  goalId?: string;
  onBack?: () => void;
}> = ({ goalId = 'goal-1', onBack }) => {
  // 목표 목록 상태
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOAL_LIST);
  const currentGoal = goals.find((g) => g.id === goalId) || goals[0];

  // 3대 탭 메뉴: STATUS (목표 현황) | HISTORY (수행 이력) | PARTICIPANTS (참가자 현황)
  const [activeTab, setActiveTab] = useState<'STATUS' | 'HISTORY' | 'PARTICIPANTS'>('STATUS');

  // 기준치 슬라이더 (ELM-RNG-01)
  const [sliderTargetValue, setSliderTargetValue] = useState<number>(currentGoal.targetValue);

  // 인증 제출 폼 상태 (탭 1)
  const [recordValue, setRecordValue] = useState('');
  const [recordMemo, setRecordMemo] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFilePreview, setAttachedFilePreview] = useState<string | null>(null);

  // 댓글 입력 상태 (탭 1 & 탭 2)
  const [statusCommentInput, setStatusCommentInput] = useState('');
  const [historyCommentInputs, setHistoryCommentInputs] = useState<Record<string, string>>({});

  // 팝업 모달 상태
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedRecordForTransfer, setSelectedRecordForTransfer] = useState<ExecutionRecord | null>(null);
  const [transferAmount, setTransferAmount] = useState('5000');
  const [transferMemo, setTransferMemo] = useState('목표 달성 축하 용돈');

  // 피드백 알림 상태
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3200);
  };

  // 파일 첨부 핸들러
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

  // 인증제출 제출 핸들러 (버튼명: '인증제출 ✓')
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
        if (g.id === currentGoal.id) {
          const nextRecords = [newRecord, ...g.records];
          const newCurrentTotal = g.currentTotal + valNum;
          const nextProgressRate = Math.min(
            100,
            Math.round((newCurrentTotal / (g.targetValue * (g.companions.length || 1))) * 100)
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
                    achievementRate: Math.min(100, Math.round(((c.currentValue + valNum) / c.targetValue) * 100)),
                  }
                : c
            ),
          };
        }
        return g;
      })
    );

    setRecordValue('');
    setRecordMemo('');
    handleRemoveFile();
    showToast('🎉 오늘의 인증이 성공적으로 등록되었습니다!');
  };

  // 목표 전체 응원 토글 (관리자는 불가)
  const handleToggleGoalCheer = () => {
    if (currentGoal.myRole === 'MANAGER') {
      showToast('⚠️ 관리자는 객관적 운영자로서 응원 작성이 제한됩니다.');
      return;
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === currentGoal.id) {
          const nextCheered = !g.userCheered;
          return {
            ...g,
            userCheered: nextCheered,
            cheerCount: nextCheered ? g.cheerCount + 1 : Math.max(0, g.cheerCount - 1),
          };
        }
        return g;
      })
    );
  };

  // 개별 이력 응원 토글 (관리자는 불가)
  const handleToggleRecordCheer = (recordId: string) => {
    if (currentGoal.myRole === 'MANAGER') {
      showToast('⚠️ 관리자는 객관적 운영자로서 응원 작성이 제한됩니다.');
      return;
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === currentGoal.id) {
          return {
            ...g,
            records: g.records.map((r) => {
              if (r.id === recordId) {
                const nextCheered = !r.userCheered;
                return {
                  ...r,
                  userCheered: nextCheered,
                  cheerCount: nextCheered ? r.cheerCount + 1 : Math.max(0, r.cheerCount - 1),
                };
              }
              return r;
            }),
          };
        }
        return g;
      })
    );
  };

  // 목표 현황 댓글 작성 (탭 1 - 관리자 불가)
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
      prev.map((g) => {
        if (g.id === currentGoal.id) {
          return {
            ...g,
            comments: [newComment, ...g.comments],
          };
        }
        return g;
      })
    );
    setStatusCommentInput('');
    showToast('✓ 따뜻한 응원 댓글이 등록되었습니다.');
  };

  // 이력별 댓글 작성 (탭 2 - 관리자 불가)
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
        if (g.id === currentGoal.id) {
          return {
            ...g,
            records: g.records.map((r) => {
              if (r.id === recordId) {
                return {
                  ...r,
                  comments: [...r.comments, newComment],
                };
              }
              return r;
            }),
          };
        }
        return g;
      })
    );
    setHistoryCommentInputs((prev) => ({ ...prev, [recordId]: '' }));
    showToast('✓ 이력 피드에 댓글을 남겼습니다.');
  };

  // 용돈이체 팝업 열기
  const handleOpenTransferModal = (record: ExecutionRecord) => {
    setSelectedRecordForTransfer(record);
    setTransferModalOpen(true);
  };

  // 용돈이체 송금마감 완료 핸들러
  const handleCompleteTransfer = () => {
    if (!selectedRecordForTransfer) return;
    const targetName = selectedRecordForTransfer.companionName;
    const amountNum = parseInt(transferAmount, 10) || 5000;

    // 해당 이력에 용돈 이체 완료 댓글 자동 추가
    const transferNoticeComment: GoalComment = {
      id: `tcm-${Date.now()}`,
      author: '구본영(나)',
      role: currentGoal.myRole,
      text: `💸 [용돈이체 완료] ${targetName}에게 ${amountNum.toLocaleString()}원을 송금했습니다! (${transferMemo})`,
      createdAt: '방금 전',
    };

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === currentGoal.id) {
          return {
            ...g,
            records: g.records.map((r) => {
              if (r.id === selectedRecordForTransfer.id) {
                return {
                  ...r,
                  comments: [...r.comments, transferNoticeComment],
                };
              }
              return r;
            }),
          };
        }
        return g;
      })
    );

    setTransferModalOpen(false);
    showToast(`✓ ${targetName}에게 ${amountNum.toLocaleString()}원 용돈 송금이 완료되었습니다!`);
  };

  // 역할 뱃지 스타일 매핑
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
      {/* ─────────────────────────────────────────────────────────────
          1. 상단 헤더: 뒤로가기 & 타이틀 '모아목표 관리' 유지 & 상세 정보
      ───────────────────────────────────────────────────────────── */}
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

        {/* 우측 액션: [초대하기] & [응원하기] (새목표등록 버튼 및 역할선택 버튼 완전 삭제) */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span>초대하기</span>
          </button>

          <button
            type="button"
            onClick={handleToggleGoalCheer}
            disabled={currentGoal.myRole === 'MANAGER'}
            title={currentGoal.myRole === 'MANAGER' ? '관리자는 응원 등록 불가' : '응원하기'}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentGoal.myRole === 'MANAGER'
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-zinc-800 text-slate-400 border border-slate-200 dark:border-zinc-700'
                : currentGoal.userCheered
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-300 dark:border-rose-800 cursor-pointer'
                : 'border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 cursor-pointer'
            }`}
          >
            <Heart className={`w-4 h-4 ${currentGoal.userCheered ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>응원 {currentGoal.cheerCount}</span>
          </button>
        </div>
      </section>

      {/* 피드백 토스트 알림 */}
      {feedbackNotice && (
        <aside className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in shadow-xs">
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-indigo-500 hover:text-indigo-700 cursor-pointer"
          >
            ✕
          </button>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. 목표 요약 카드: ELM-STT-01 상태 뱃지 활용 (ELM-STP-01 완전 삭제)
      ───────────────────────────────────────────────────────────── */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
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

          {/* 우측 총 진척률 게이지 수치 */}
          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block font-semibold">전체 달성률</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {currentGoal.progressRate}%
            </span>
          </div>
        </div>

        {/* 프로그레스 바 */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, currentGoal.progressRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
            <span>누적 달성: {currentGoal.currentTotal.toLocaleString()} {currentGoal.unit}</span>
            <span>최종 목표: {currentGoal.targetValue.toLocaleString()} {currentGoal.unit}</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. 상세 3대 탭 메뉴 (STATUS / HISTORY / PARTICIPANTS)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setActiveTab('STATUS')}
          className={`min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'STATUS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>1. 목표 현황</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>2. 수행 이력 ({currentGoal.records.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PARTICIPANTS')}
          className={`min-h-[46px] px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors relative ${
            activeTab === 'PARTICIPANTS'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. 참가자 현황 ({currentGoal.companions.length})</span>
          {currentGoal.myRole === 'VIEWER' && (
            <span className="text-[10px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
              RBAC 잠김
            </span>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          [탭 1] 목표 현황 (기준치 조절, 고정/입력 규칙, 인증제출, 응원피드)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'STATUS' && (
        <div className="space-y-4">
          {/* 목표 인정 기준치 조절 (ELM-RNG-01) */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  목표 인정 기준치 조절 (ELM-RNG-01)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                현재 기준: {sliderTargetValue.toLocaleString()} {currentGoal.unit}
              </span>
            </div>

            <ElmRng01
              label="일일/회차별 기준 인정값"
              value={sliderTargetValue}
              min={currentGoal.category === 'FINANCE' ? 100000 : 3000}
              max={currentGoal.category === 'FINANCE' ? 20000000 : 25000}
              step={currentGoal.category === 'FINANCE' ? 100000 : 500}
              unit={currentGoal.unit}
              colorScheme="rose"
              onChange={setSliderTargetValue}
              className="pt-1"
            />
          </section>

          {/* 고정 항목(규칙/기준) 및 입력 항목(수행 기록) 정보 표시 */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-1.5 shadow-xs">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
                📌 고정 항목 (규칙/기준)
              </span>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-semibold">
                • {currentGoal.fixedRule}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-1.5 shadow-xs">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
                ✏️ 입력 항목 (수행 기록 가이드)
              </span>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-semibold">
                • {currentGoal.inputRule}
              </p>
            </div>
          </section>

          {/* 오늘의 실천 인증 제출 영역 (파일 첨부 지원, 버튼명: '인증제출 ✓') */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  오늘의 목표 실천 인증
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                {currentGoal.myRole === 'PARTICIPANT'
                  ? '동행원 인증 모드'
                  : currentGoal.myRole === 'MANAGER'
                  ? '관리자 모드 (인증 대상 아님)'
                  : '관람원 조회 모드'}
              </span>
            </div>

            {currentGoal.myRole === 'PARTICIPANT' ? (
              <form onSubmit={handleRegisterExecution} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ElmInp01
                    label={`실제 실천 수치 (${currentGoal.unit})`}
                    value={recordValue}
                    onChange={setRecordValue}
                    placeholder={`예: ${sliderTargetValue.toLocaleString()}`}
                  />
                  <ElmInp01
                    label="컨디션 및 실천 메모"
                    value={recordMemo}
                    onChange={setRecordMemo}
                    placeholder="예: 오늘 저녁 산책 코스 만보 완주!"
                  />
                </div>

                {/* 실제 파일 첨부 기능 (input type="file") */}
                <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <label className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <Camera className="w-4 h-4 text-indigo-500" />
                      <span>증빙 사진 첨부하기</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {attachedFile ? (
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                        <span>✓ {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                          title="첨부 파일 삭제"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">만보기 캡처나 영수증 사진을 첨부하세요.</span>
                    )}
                  </div>

                  {attachedFilePreview && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0">
                      <img src={attachedFilePreview} alt="첨부 미리보기" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* 인증제출 버튼 (버튼명: '인증제출 ✓') */}
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="min-h-[44px] px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>인증제출 ✓</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300">
                {currentGoal.myRole === 'MANAGER'
                  ? '관리자는 운영자 역할로서 목표를 직접 실천/인증하지 않습니다. [수행 이력]에서 참가자들의 인증을 검토하세요.'
                  : '관람원(응원원)은 목표를 직접 인증하지 않고, 아래 피드에서 따뜻한 응원과 댓글을 남길 수 있습니다.'}
              </div>
            )}
          </section>

          {/* 실시간 응원 및 댓글 피드 (관리자 역할은 응원등록 불가) */}
          <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  실시간 목표 응원 피드 ({currentGoal.comments.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                참가자 & 관람자 작성 가능 (관리자는 등록 불가)
              </span>
            </div>

            {/* 댓글 작성창: 관리자는 비활성화 */}
            {currentGoal.myRole === 'MANAGER' ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 text-xs text-slate-400">
                ⚠️ 관리자 역할은 객관적 운영자로서 응원 댓글 작성이 제한됩니다.
              </div>
            ) : (
              <form onSubmit={handleAddStatusComment} className="flex gap-2 items-center">
                <div className="flex-1">
                  <ElmInp01
                    label=""
                    value={statusCommentInput}
                    onChange={setStatusCommentInput}
                    placeholder="따뜻한 응원이나 실천 다짐을 남겨보세요..."
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shrink-0 cursor-pointer transition-all shadow-xs"
                >
                  응원 등록
                </button>
              </form>
            )}

            {/* 댓글 목록 */}
            <div className="space-y-2.5 pt-1">
              {currentGoal.comments.map((cm) => (
                <div
                  key={cm.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] text-xs flex items-start gap-2.5"
                >
                  <ElmPrf01 size="sm" name={cm.author} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{cm.author}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          cm.role === 'PARTICIPANT'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                        }`}
                      >
                        {cm.role === 'PARTICIPANT' ? '동행원' : '응원원'}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">{cm.createdAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{cm.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          [탭 2] 목표 수행 이력 (타임라인, 관리자 응원불가, 용돈이체 버튼)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'HISTORY' && (
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
                {/* 이력 헤더: 이름, 날짜, 인증수치, 사진인증 뱃지 */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
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

                {/* 메모 및 첨부 사진 썸네일 */}
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

                {/* 이력 푸터: 응원(하트) 토글 + 용돈이체 버튼(자녀/수령대상) + 댓글 카운트 */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {/* 하트 응원 버튼: 관리자는 비활성화 */}
                    <button
                      type="button"
                      onClick={() => handleToggleRecordCheer(rec.id)}
                      disabled={currentGoal.myRole === 'MANAGER'}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        currentGoal.myRole === 'MANAGER'
                          ? 'opacity-40 cursor-not-allowed text-slate-400 border border-slate-200 dark:border-zinc-700'
                          : rec.userCheered
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-300 dark:border-rose-800 cursor-pointer'
                          : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${rec.userCheered ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>응원 {rec.cheerCount}</span>
                    </button>

                    {/* 용돈이체 버튼: 참가자/관람자 역할이고 대상자가 용돈 수령 대상인 경우 노출 */}
                    {rec.isAllowanceTarget && currentGoal.myRole !== 'MANAGER' && (
                      <button
                        type="button"
                        onClick={() => handleOpenTransferModal(rec)}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>용돈이체 💰</span>
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    댓글 {rec.comments.length}개
                  </span>
                </div>

                {/* 개별 이력 댓글 스레드 */}
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

                  {/* 이력별 댓글 입력창 (관리자는 불가) */}
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
                        onClick={() => handleAddHistoryComment(rec.id)}
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          [탭 3] 참가자 현황 (RBAC: 관람자는 명단 열람 불가)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'PARTICIPANTS' && (
        <div className="space-y-4">
          {currentGoal.myRole === 'VIEWER' ? (
            /* 관람자일 때 RBAC 차단 배너 */
            <div className="p-8 rounded-2xl bg-white dark:bg-[#131B2E] border border-rose-200 dark:border-rose-900/60 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  참가자 세부 명단 열람 권한 제한 (RBAC)
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  현재 귀하는 <strong className="text-purple-600 dark:text-purple-400">[관람원(응원원)]</strong> 권한입니다.
                  동행원(직접 실천자)의 개인 정보 보호 및 집중을 위해 상세 참가자 명단 열람이 제한됩니다.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 max-w-md mx-auto flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 shrink-0 text-purple-600" />
                <span>
                  대신 <strong>[1. 목표 현황]</strong>과 <strong>[2. 수행 이력]</strong> 탭에서 언제든 따뜻한 응원과 하트, 댓글 및 용돈을 보내실 수 있습니다!
                </span>
              </div>
            </div>
          ) : (
            /* 관리자 또는 동행원일 때 참가자 현황 정상 열람 */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 동행원 (직접 실천자) */}
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

                      {/* 개인별 진척 게이지 */}
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

              {/* 관람원 (응원자) */}
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. [MODAL 1] 용돈이체 송금 팝업 모달
      ───────────────────────────────────────────────────────────── */}
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
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold block">
                  받는 사람 및 대표계좌
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 block">
                  {selectedRecordForTransfer.companionName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-mono">
                  {selectedRecordForTransfer.allowanceAccount || '토스뱅크 1000-8821-3942'}
                </span>
              </div>

              {/* 금액 선택 칩 */}
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

            {/* 송금 액션 버튼 (토스 송금 링크 & 송금마감) */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    `https://toss.im/_m/open?bank=toss&amount=${transferAmount}`,
                    '_blank'
                  );
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1.5 hover:bg-blue-100 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>토스 송금</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleCompleteTransfer}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  송금마감 ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. [MODAL 2] 멤버 초대 팝업 모달
      ───────────────────────────────────────────────────────────── */}
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
                초대할 대상의 역할을 선택한 후 링크를 복사하여 메신저나 메시지로 전달하세요.
              </p>

              {/* 동행원 초대 링크 */}
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
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://moabogo.app/goal/${currentGoal.id}?role=companion&code=GOL-8921`
                      );
                      showToast('✓ 동행원 초대 링크가 클립보드에 복사되었습니다.');
                    }}
                    className="min-h-[36px] px-3 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-indigo-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    복사
                  </button>
                </div>
              </div>

              {/* 관람원 초대 링크 */}
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
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        `https://moabogo.app/goal/${currentGoal.id}?role=viewer&code=GOL-VIEW`
                      );
                      showToast('✓ 관람원 응원 초대 링크가 클립보드에 복사되었습니다.');
                    }}
                    className="min-h-[36px] px-3 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-purple-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    복사
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span>간편 참여 코드: <strong className="text-slate-800 dark:text-zinc-200 text-xs">GOL-7892</strong></span>
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
    </div>
  );
};
