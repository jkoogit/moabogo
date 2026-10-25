import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmStt01,
  ElmCnt01,
  ElmPrf01,
  ElmStp01,
  ElmBsh01,
  ElmRng01,
} from '../elements/Tokens';
import {
  Sparkles,
  Target,
  Users,
  Eye,
  CheckCircle,
  Plus,
  Camera,
  Calendar,
  Flame,
  Award,
  Check,
} from 'lucide-react';

export const SCR_GOL_01_모아목표상세: React.FC = () => {
  const [goalTitle, setGoalTitle] = useState('가족 건강 1만보 걷기 챌린지');
  const [currentStep, setCurrentStep] = useState(2);
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false);
  const [dailyTargetSteps, setDailyTargetSteps] = useState(10000);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Form states for new goal
  const [newTitle, setNewTitle] = useState('주 3회 독서 및 서평 쓰기');
  const [newPeriod, setNewPeriod] = useState('1');

  // Participants: 동행원 (수행자) vs 관람원 (조회자)
  const [companions, setCompanions] = useState([
    { id: 'c1', name: '구본영(나)', progress: '10,240보 달성', status: 'COMPLETED' },
    { id: 'c2', name: '김은지(배우자)', progress: '8,500보 수행중', status: 'IN_PROGRESS' },
    { id: 'c3', name: '구민우(자녀)', progress: '3,200보 수행중', status: 'IN_PROGRESS' },
  ]);

  const viewers = [
    { id: 'v1', name: '시어머니(할머니)', note: '응원 및 조회' },
    { id: 'v2', name: '외삼촌', note: '응원 및 조회' },
  ];

  const handleToggleCompanionStatus = (id: string) => {
    setCompanions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED',
              progress: c.status === 'COMPLETED' ? '8,000보 수행중' : `${dailyTargetSteps.toLocaleString()}보 달성`,
            }
          : c
      )
    );
    setFeedbackNotice('동행원의 인증 상태가 갱신되었습니다.');
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleCreateGoal = () => {
    if (!newTitle.trim()) return;
    setGoalTitle(newTitle);
    setAddGoalModalOpen(false);
    setFeedbackNotice(`✓ 새 모아목표 "${newTitle}"이(가) 등록되었습니다.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Section 1: Header (Flat Peer 1) */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <ElmTyp01
            title="모아목표 상세 관리"
            badge="SCR-GOL-01"
            subtitle="동행원(목표수행) vs 관람원(응원조회) 역할 분리 • 플랫 피어 레이아웃"
          />
        </div>

        <button
          type="button"
          onClick={() => setAddGoalModalOpen(true)}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm shrink-0 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>새 모아목표 등록</span>
        </button>
      </section>

      {/* In-app Feedback Toast (replaces window.alert) */}
      {feedbackNotice && (
        <aside className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Section 2: Main Goal Information Card (Flat Peer 2) */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 break-keep">{goalTitle}</h2>
              <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">기간: 2026.10.01 ~ 2026.10.31 (31일간) • 일일 챌린지</span>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <ElmStt01 type="INDIGO" label="동행 3명 • 진행중" />
          </div>
        </div>

        {/* Section 3: 3-Step Stepper (Flat Peer 3) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800">
          <ElmStp01
            currentStep={currentStep}
            steps={[
              { number: 1, label: '목표/동행 등록' },
              { number: 2, label: '일일 인증기록' },
              { number: 3, label: '월말 최종달성' },
            ]}
          />
        </div>
      </section>

      {/* Section 4: Daily Goal Range Wheel Slider (ELM-RNG-01 표준 연동 - Flat Peer 4) */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">일일 목표 걸음 수 조절 (ELM-RNG-01)</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">마우스 휠 / 슬라이더 드래그 / 44px 터치 버튼</span>
        </div>

        <ElmRng01
          label="목표 인정 기준치"
          value={dailyTargetSteps}
          min={5000}
          max={20000}
          step={500}
          unit="보"
          colorScheme="rose"
          onChange={setDailyTargetSteps}
          className="pt-1"
        />
      </section>

      {/* Section 5: Goal Config Specifications (Flat Peer 5) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-1.5 shadow-xs">
          <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">📌 고정 항목 (규칙/기준)</span>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">• 일일 최소 {dailyTargetSteps.toLocaleString()}보 이상 걸음 수 인정</p>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">• 만보기 앱 캡처 사진 첨부 필수</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-1.5 shadow-xs">
          <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">✏️ 입력 항목 (수행 기록)</span>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">• 당일 실제 걸음 수 (숫자 입력)</p>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">• 컨디션 한줄 메모 및 피로도 척도</p>
        </div>
      </section>

      {/* Section 6: Participants Peer Section (Companions & Viewers - Flat Peer 6) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companions (동행원) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                동행원 관리 (목표 직접 수행자)
              </h3>
            </div>
            <ElmCnt01 count={`${companions.length}명`} />
          </div>

          <div className="space-y-2.5">
            {companions.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between gap-3 text-xs flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ElmPrf01 size="sm" name={c.name} />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block truncate">{c.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">{c.progress}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleCompanionStatus(c.id)}
                  className="min-h-[44px] px-3 flex items-center justify-center shrink-0 cursor-pointer"
                  title="인증 상태 변경 토글"
                >
                  <ElmStt01
                    type={c.status === 'COMPLETED' ? 'EMERALD' : 'AMBER'}
                    label={c.status === 'COMPLETED' ? '인증완료 ✓' : '인증 대기 ⏳'}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Viewers (관람원) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                관람원 관리 (응원 및 조회자)
              </h3>
            </div>
            <ElmCnt01 count={`${viewers.length}명`} />
          </div>

          <div className="space-y-2.5">
            {viewers.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-between gap-3 text-xs flex-wrap sm:flex-nowrap min-h-[44px]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ElmPrf01 size="sm" name={v.name} />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block truncate">{v.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">{v.note}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center min-h-[44px]">
                  <ElmStt01 type="SLATE" label="관람(응원)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Add Goal In-app Modal Bottom Sheet */}
      <ElmBsh01
        isOpen={addGoalModalOpen}
        onClose={() => setAddGoalModalOpen(false)}
        title="새 모아목표 등록"
      >
        <div className="space-y-4">
          <ElmInp01
            label="목표 제목"
            value={newTitle}
            onChange={setNewTitle}
            placeholder="목표명을 입력하세요"
          />
          <ElmSel01
            label="목표 주기"
            value={newPeriod}
            onChange={setNewPeriod}
            options={[
              { value: '1', label: '매일 실천형' },
              { value: '2', label: '주간 달성형' },
              { value: '3', label: '월간 챌린지형' },
            ]}
          />
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddGoalModalOpen(false)}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleCreateGoal}
              className="min-h-[44px] px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-sm cursor-pointer transition-all"
            >
              목표 생성 완료
            </button>
          </div>
        </div>
      </ElmBsh01>
    </div>
  );
};
