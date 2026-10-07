import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmFlt01,
  ElmInp01,
  ElmStt01,
  ElmRad01,
} from '../elements/Tokens';
import {
  Gamepad2,
  Users,
  Wallet,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  Coins,
  ShieldCheck,
  Shuffle,
  Check,
} from 'lucide-react';

export const SCR_GNT_01_비로그인게스트홈: React.FC<{
  onGoLogin?: () => void;
  onGoSignup?: () => void;
}> = ({ onGoLogin, onGoSignup }) => {
  const [gameType, setGameType] = useState<'1N' | 'LADDER' | 'TAG'>('1N');
  const [amount, setAmount] = useState('80000');
  const [participants, setParticipants] = useState('김철수, 이영희, 박지성, 손흥민');
  const [resultText, setResultText] = useState<string | null>(null);

  const handlePlayGame = () => {
    const list = participants.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return;

    if (gameType === '1N') {
      const split = Math.round(Number(amount || '0') / list.length);
      setResultText(`🎉 [1/N 정산 결과] 총 ${list.length}명 참여 / 1인당 ₩${split.toLocaleString()}원씩 송금해주세요!`);
    } else if (gameType === 'LADDER') {
      const lucky = list[Math.floor(Math.random() * list.length)];
      setResultText(`🪜 [사다리타기 당첨] 오늘의 커피 쏘기 당첨자: [${lucky}] 님! 축하합니다!`);
    } else {
      const tag = list[Math.floor(Math.random() * list.length)];
      setResultText(`🎯 [술래잡기 룰렛] 오늘의 1차 장소 예약 술래: [${tag}] 님!`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Top Hero Header with Login/Signup CTAs */}
      <header className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              SCR-GNT-01 • 게스트 홈
            </span>
            <span className="text-xs text-slate-400">비로그인 무료 이용</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            모아서 분석하고 한눈에 보고! <span className="text-indigo-400">모아보고</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            가입 없이도 1/N 정산과 모임 게임을 즉시 즐기세요. 로그인 시 1인 다중 가계부와 당번·목표·용돈 라이프 서비스를 무료로 연동할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onGoLogin}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all backdrop-blur-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>로그인</span>
          </button>
          <button
            onClick={onGoSignup}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>무료 회원가입</span>
          </button>
        </div>
      </header>

      {/* Main Feature 1 : Non-login Standalone Game Center */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 pb-3 gap-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight break-keep">
              로그인 없이 바로 하는 모임 정산 & 게임
            </h2>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <ElmStt01 type="INDIGO" label="게스트 무제한 무료" />
          </div>
        </div>

        {/* Game Mode Selector - 모바일 가로폭주 방지: flex-wrap 및 간결 문구 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <ElmFlt01
            label="⚡ 1/N 스마트 정산"
            selected={gameType === '1N'}
            onClick={() => {
              setGameType('1N');
              setResultText(null);
            }}
          />
          <ElmFlt01
            label="🪜 사다리타기"
            selected={gameType === 'LADDER'}
            onClick={() => {
              setGameType('LADDER');
              setResultText(null);
            }}
          />
          <ElmFlt01
            label="🎯 술래잡기"
            selected={gameType === 'TAG'}
            onClick={() => {
              setGameType('TAG');
              setResultText(null);
            }}
          />
        </div>

        {/* Interactive Play Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {gameType === '1N' && (
              <ElmInp01
                label="총 결제 금액 (원)"
                type="number"
                value={amount}
                onChange={setAmount}
                placeholder="예: 80000"
              />
            )}
            <ElmInp01
              label="참가자 명단 (쉼표로 구분)"
              value={participants}
              onChange={setParticipants}
              placeholder="예: 김철수, 이영희, 박지성"
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                게임/정산 실행 결과:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed min-h-[60px] flex items-center">
                {resultText || '참가자를 입력한 후 아래 [게임 실행하기] 버튼을 눌러주세요.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayGame}
              className="w-full mt-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>{gameType === '1N' ? '1/N 정산 계산하기' : '게임 룰렛 실행하기'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Preview Bento Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 leading-none">
            회원가입 시 누리는 모아보고 핵심 서비스
          </h2>
          <span className="text-xs text-slate-400">Zero-Onboarding 즉시 생성</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 inline-block">
                <Wallet className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">1인 다중 가계부</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                가입 즉시 [내 개인 가계부] 자동 생성, 가족 및 모임 그룹 가계부 무제한 분리.
              </p>
            </div>
            <ElmStt01 type="EMERALD" label="Zero-Onboarding" />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 inline-block">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">모아당번 & 모아목표</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                가사 및 모임 순번 배정, 인증사진 첨부 및 대신수행 요청/실행 관리.
              </p>
            </div>
            <ElmStt01 type="PURPLE" label="라이프 서비스" />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600 inline-block">
                <Coins className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">모아머니 (요구/요청)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                긴급 용돈 요청, 분납 상환 트래킹 및 3대 빅테크(카톡/토스) 3초 송금 연동.
              </p>
            </div>
            <ElmStt01 type="AMBER" label="3대 빅테크 연동" />
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 inline-block">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">2단계 스마트 OCR</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                1차 로컬 EasyOCR 무료 파싱 + 2차 개인 키 지원으로 서버 운영비 0원 모델.
              </p>
            </div>
            <ElmStt01 type="INDIGO" label="운영비 0원 모델" />
          </div>
        </div>
      </section>
    </div>
  );
};
