import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmSld02,
  ElmFab01,
} from '../elements/Tokens';
import {
  Wallet,
  TrendingUp,
  Sparkles,
  Coins,
  Gamepad2,
  Plus,
  Camera,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Handshake,
  Settings,
  Bell,
  Search,
} from 'lucide-react';

export const SCR_DSH_01_로그인메인대시보드: React.FC<{
  onNavigate?: (screenId: string) => void;
}> = ({ onNavigate }) => {
  const [selectedLedger, setSelectedLedger] = useState<'PERSONAL' | 'GROUP' | 'INSTANCE'>('GROUP');

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Screen Meta Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
            SCR-DSH-01
          </span>
          <ElmTyp01
            title="메인 대시보드"
            subtitle="맞춤형 Bento Grid & 다중 가계부"
          />
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => onNavigate && onNavigate('SCR-QCK-01')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm whitespace-nowrap"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>빠른 머니등록</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('SCR-QCK-02')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>빠른 수행등록</span>
          </button>
          <button
            onClick={() => onNavigate && onNavigate('SCR-SET-01')}
            className="p-2 sm:p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shrink-0"
            title="사용자 설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Ledger Switcher Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">가계부 전환:</span>
        <ElmFlt01
          label="내 개인 가계부 (기본)"
          selected={selectedLedger === 'PERSONAL'}
          onClick={() => setSelectedLedger('PERSONAL')}
        />
        <ElmFlt01
          label="우리집 가계부 (가족 공유)"
          selected={selectedLedger === 'GROUP'}
          count={4}
          onClick={() => setSelectedLedger('GROUP')}
        />
        <ElmFlt01
          label="2026 상반기 동창 모임 (인스턴스)"
          selected={selectedLedger === 'INSTANCE'}
          onClick={() => setSelectedLedger('INSTANCE')}
        />
      </div>

      {/* 4-Column Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 가계부 자산 및 순수 생활비 현황 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">순수 생활비 (자산이동 제외)</span>
              <ElmStt01 type="EMERALD" label="정상 집계" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                ₩1,248,000
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                용돈/빌림(₩200,000)은 지출 통계에서 안전하게 분리됨
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate && onNavigate('SCR-LED-01')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>가계부 내역 상세</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ElmCnt01 count="18건" />
          </div>
        </div>

        {/* Card 2: 모아목표 (동행원 & 관람원) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500">모아목표</span>
              <div className="shrink-0">
                <ElmStt01 type="INDIGO" label="동행 3명" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-base font-bold text-slate-900 break-keep">가족 1만보 걷기 챌린지</div>
              <div className="mt-2 w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 flex justify-between gap-2 flex-wrap">
                <span>진행률 70%</span>
                <span className="text-indigo-600 font-semibold">동행 2명 완료</span>
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => onNavigate && onNavigate('SCR-GOL-01')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>목표 관리</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ElmCnt01 count="2개 진행" />
          </div>
        </div>

        {/* Card 3: 모아당번 (대신수행 & 사진인증) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">모아당번 (MoaDuty)</span>
              <ElmStt01 type="AMBER" label="인증 1건 대기" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-sm font-bold text-slate-900">거실 청소기 & 분리수거</div>
              <p className="text-xs text-slate-500">담당: 구민우(자녀) • 사진 제출 완료</p>
              <div className="text-[11px] text-amber-600 font-semibold mt-1">
                대신수행 요청 1건 접수됨
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate && onNavigate('SCR-DUT-01')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>당번 관리 & 승인</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ElmCnt01 count="3과업" />
          </div>
        </div>

        {/* Card 4: 모아머니 (요구머니 & 요청머니) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">모아머니 (자금/상환)</span>
              <ElmStt01 type="PURPLE" label="요청머니 1건" />
            </div>
            <div className="mt-3 space-y-1">
              <div className="text-sm font-bold text-slate-900">문제집 구입 긴급 요청</div>
              <div className="font-mono font-bold text-base text-purple-700">₩30,000원</div>
              <p className="text-[11px] text-slate-400">지급 시 용돈 자동 차감 & 토스 딥링크</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate && onNavigate('SCR-MON-01')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>머니 이동 관리</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <ElmCnt01 count="2건 대기" />
          </div>
        </div>
      </div>

      {/* Slide Wheel Track : Quick Life Events & Event Services */}
      <section className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">독립 이벤트 정산 & 모임 활동</h3>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('SCR-EVT-01')}
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            새 정산/사다리 실행 →
          </button>
        </div>

        <ElmSld02>
          <div className="min-w-[240px] p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>주말 글램핑 1/N 정산</span>
                <ElmStt01 type="EMERALD" label="정산 완료" />
              </div>
              <p className="text-xs text-slate-500 mt-2">총 4인 분할 (게스트 2명 포함)</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-mono">
              <span className="text-slate-400">1인당</span>
              <span className="font-bold text-indigo-600">₩39,000</span>
            </div>
          </div>

          <div className="min-w-[240px] p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>동창회 펜션 사다리타기</span>
                <ElmStt01 type="INDIGO" label="게임 기록" />
              </div>
              <p className="text-xs text-slate-500 mt-2">당첨자: 박준혁 (커피 쏘기)</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-mono">
              <span className="text-slate-400">참여자</span>
              <span className="font-bold text-slate-700">6명</span>
            </div>
          </div>

          <div className="min-w-[240px] p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>회식 1차 장소 술래잡기</span>
                <ElmStt01 type="PURPLE" label="룰렛 완료" />
              </div>
              <p className="text-xs text-slate-500 mt-2">술래: 최영식 (예약 완료)</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between text-xs font-mono">
              <span className="text-slate-400">참여자</span>
              <span className="font-bold text-slate-700">8명</span>
            </div>
          </div>
        </ElmSld02>
      </section>

      {/* FAB Floating Menu */}
      <ElmFab01
        onOcrClick={() => onNavigate && onNavigate('SCR-QCK-01')}
        onQuickExpenseClick={() => onNavigate && onNavigate('SCR-QCK-01')}
        onQuickDutyClick={() => onNavigate && onNavigate('SCR-QCK-02')}
      />
    </div>
  );
};
