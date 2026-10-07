import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmChk01,
  ElmStt01,
} from '../elements/Tokens';
import {
  LogIn,
  Shield,
  Wifi,
  WifiOff,
  KeyRound,
  CheckCircle,
  Database,
} from 'lucide-react';

export const SCR_AUT_02_로그인오프라인세션: React.FC<{
  onSuccessLogin?: () => void;
  onGoSignup?: () => void;
}> = ({ onSuccessLogin, onGoSignup }) => {
  const [email, setEmail] = useState('jkok2j2m@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [keepOfflineSession, setKeepOfflineSession] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [is2FARequired, setIs2FARequired] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    // Simulate 2FA check or success
    alert('로그인 성공! IndexedDB에 오프라인 세션 토큰이 안전하게 저장되어 오프라인에서도 가계부 조회가 가능합니다.');
    if (onSuccessLogin) onSuccessLogin();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            SCR-AUT-02
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            모아보고 로그인 & 세션 관리
          </h1>
          <p className="text-xs text-slate-500">
            오프라인 PWA 무중단 세션 지속 보장
          </p>
        </div>

        {/* Social Quick Login */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              alert('[카카오 1초 로그인] 오프라인 토큰 발급');
              if (onSuccessLogin) onSuccessLogin();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] text-slate-900 font-bold text-xs flex items-center justify-center transition-all shadow-xs"
          >
            카카오
          </button>
          <button
            type="button"
            onClick={() => {
              alert('[네이버 1초 로그인] 오프라인 토큰 발급');
              if (onSuccessLogin) onSuccessLogin();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#03C75A] hover:bg-[#02a94d] text-white font-bold text-xs flex items-center justify-center transition-all shadow-xs"
          >
            네이버
          </button>
          <button
            type="button"
            onClick={() => {
              alert('[Google 1초 로그인] 오프라인 토큰 발급');
              if (onSuccessLogin) onSuccessLogin();
            }}
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center transition-all shadow-xs"
          >
            Google
          </button>
        </div>

        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[11px] text-slate-400 font-medium">또는 이메일 로그인</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <ElmInp01
            label="아이디 / 이메일"
            value={email}
            onChange={setEmail}
            placeholder="jkok2j2m@gmail.com"
          />

          <ElmInp01
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="비밀번호"
          />

          {/* Offline Session Checkbox (PRD Requirement) */}
          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
            <ElmChk01
              checked={keepOfflineSession}
              onChange={setKeepOfflineSession}
              label="오프라인 무중단 세션 유지 (IndexedDB)"
              description="네트워크가 끊겨도 로그인 상태를 유지하고 로컬 가계부를 조회합니다."
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>로그인하고 가계부 열기</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={onGoSignup}
            className="text-indigo-600 font-bold hover:underline"
          >
            회원가입하기
          </button>
        </div>
      </div>
    </div>
  );
};
