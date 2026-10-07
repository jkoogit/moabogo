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
} from 'lucide-react';

export const SCR_GOL_01_모아목표상세: React.FC = () => {
  const [goalTitle, setGoalTitle] = useState('가족 건강 1만보 걷기 챌린지');
  const [currentStep, setCurrentStep] = useState(2);
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false);

  // Participants: 동행원 (수행자) vs 관람원 (조회자)
  const companions = [
    { id: 'c1', name: '구본영(나)', progress: '10,240보 달성', status: 'COMPLETED' },
    { id: 'c2', name: '김은지(배우자)', progress: '8,500보 수행중', status: 'IN_PROGRESS' },
    { id: 'c3', name: '구민우(자녀)', progress: '3,200보 수행중', status: 'IN_PROGRESS' },
  ];

  const viewers = [
    { id: 'v1', name: '시어머니(할머니)', note: '응원 및 조회' },
    { id: 'v2', name: '외삼촌', note: '응원 및 조회' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
            SCR-GOL-01
          </span>
          <ElmTyp01
            title="모아목표 상세 관리"
            subtitle="동행원(목표수행) vs 관람원(응원조회) 역할 분리"
          />
        </div>

        <button
          onClick={() => setAddGoalModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 모아목표 등록</span>
        </button>
      </div>

      {/* Main Goal Progress Bento Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900 break-keep">{goalTitle}</h2>
              <span className="text-xs text-slate-500 block truncate">기간: 2026.10.01 ~ 2026.10.31 (31일간)</span>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <ElmStt01 type="INDIGO" label="동행 3명 • 진행중" />
          </div>
        </div>

        {/* 3-Step Progress Stepper - 모바일 가로폭주 방지: 간결 라벨 & 반응형 스태킹 */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 border border-slate-200">
          <ElmStp01
            currentStep={currentStep}
            steps={[
              { number: 1, label: '목표/동행 등록' },
              { number: 2, label: '일일 인증기록' },
              { number: 3, label: '월말 최종달성' },
            ]}
          />
        </div>

        {/* Fixed & Input Goal Config Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-semibold text-slate-700 block">📌 고정 항목 (규칙/기준)</span>
            <p className="text-slate-500">• 일일 최소 8,000보 이상 걸음수 인정</p>
            <p className="text-slate-500">• 만보기 앱 캡처 사진 첨부 필수</p>
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="font-semibold text-slate-700 block">✏️ 입력 항목 (수행 기록)</span>
            <p className="text-slate-500">• 당일 실제 걸음 수 (숫자 입력)</p>
            <p className="text-slate-500">• 컨디션 한줄 메모 및 피로도 척도</p>
          </div>
        </div>
      </div>

      {/* Companions (동행원) vs Viewers (관람원) Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                동행원 관리 (목표 수행자)
              </h3>
            </div>
            <ElmCnt01 count="3명" />
          </div>

          <div className="space-y-2.5">
            {companions.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5 text-xs flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ElmPrf01 size="sm" name={c.name} />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 block truncate">{c.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{c.progress}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <ElmStt01
                    type={c.status === 'COMPLETED' ? 'EMERALD' : 'AMBER'}
                    label={c.status === 'COMPLETED' ? '인증완료' : '인증 대기'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Viewers */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">
                관람원 관리 (응원 조회자)
              </h3>
            </div>
            <ElmCnt01 count="2명" />
          </div>

          <div className="space-y-2.5">
            {viewers.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2.5 text-xs flex-wrap sm:flex-nowrap"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ElmPrf01 size="sm" name={v.name} />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-800 block truncate">{v.name}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{v.note}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <ElmStt01 type="SLATE" label="관람(응원)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Goal Modal Bottom Sheet */}
      <ElmBsh01
        isOpen={addGoalModalOpen}
        onClose={() => setAddGoalModalOpen(false)}
        title="새 모아목표 등록"
      >
        <div className="space-y-4">
          <ElmInp01
            label="목표 제목"
            value="주 3회 독서 및 서평 쓰기"
            onChange={() => {}}
          />
          <ElmSel01
            label="목표 주기"
            value="1"
            onChange={() => {}}
            options={[
              { value: '1', label: '매일 실천형' },
              { value: '2', label: '주간 달성형' },
              { value: '3', label: '월간 챌린지형' },
            ]}
          />
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setAddGoalModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500"
            >
              취소
            </button>
            <button
              onClick={() => setAddGoalModalOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm"
            >
              목표 생성 완료
            </button>
          </div>
        </div>
      </ElmBsh01>
    </div>
  );
};
