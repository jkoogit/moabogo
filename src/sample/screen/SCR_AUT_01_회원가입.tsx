import React, { useState, useEffect } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmChk01,
  ElmStt01,
} from '../elements/Tokens';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const SCR_AUT_01_회원가입: React.FC<{
  onGoLogin?: () => void;
  onSuccessSignup?: () => void;
}> = ({ onGoLogin, onSuccessSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3분 타이머
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);

  // 인라인 알림 상태 (window.alert 대체)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 3분 카운트다운 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setFeedback({
        type: 'error',
        message: '인증 유효시간(3분)이 만료되었습니다. 인증번호를 재요청해주세요.',
      });
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainderSecs).padStart(2, '0')}`;
  };

  // 전체 동의 핸들러
  const isAllAgreed = agreeTerms && agreePrivacy && agreeMarketing;
  const handleToggleAllAgreed = () => {
    const nextVal = !isAllAgreed;
    setAgreeTerms(nextVal);
    setAgreePrivacy(nextVal);
    setAgreeMarketing(nextVal);
  };

  const handleSendCode = () => {
    if (!email || !email.includes('@')) {
      setFeedback({
        type: 'error',
        message: '유효한 이메일 주소를 입력해주세요.',
      });
      return;
    }
    setIsCodeSent(true);
    setTimerSeconds(180);
    setIsTimerRunning(true);
    setEmailCode('');
    setIsEmailVerified(false);
    setFeedback({
      type: 'info',
      message: `인증번호가 ${email}로 발송되었습니다. (테스트용 인증번호: 123456)`,
    });
  };

  const handleVerifyCode = () => {
    if (timerSeconds === 0) {
      setFeedback({
        type: 'error',
        message: '인증 유효시간이 만료되었습니다. [재발송] 버튼을 눌러주세요.',
      });
      return;
    }
    if (emailCode.trim() === '123456' || (emailCode.trim().length === 6 && /^\d+$/.test(emailCode.trim()))) {
      setIsEmailVerified(true);
      setIsTimerRunning(false);
      setFeedback({
        type: 'success',
        message: '이메일 본인 인증이 성공적으로 완료되었습니다.',
      });
    } else {
      setFeedback({
        type: 'error',
        message: '인증번호 6자리가 일치하지 않습니다. (테스트용: 123456)',
      });
    }
  };

  const handleSocialSignup = (provider: '카카오' | '네이버' | '구글') => {
    setFeedback({
      type: 'info',
      message: `[${provider}] 소셜 계정 연동 가입이 진행됩니다. 잠시만 기다려주세요...`,
    });
    setTimeout(() => {
      setFeedback({
        type: 'success',
        message: `[${provider}] 간편 회원가입 완료! [내 개인 가계부]가 자동 생성되었습니다.`,
      });
      setTimeout(() => {
        if (onSuccessSignup) onSuccessSignup();
      }, 900);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setFeedback({ type: 'error', message: '사용자 닉네임을 입력해주세요.' });
      return;
    }
    if (!isEmailVerified) {
      setFeedback({ type: 'error', message: '이메일 인증을 완료해주세요.' });
      return;
    }
    if (password.length < 8) {
      setFeedback({ type: 'error', message: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }
    if (passwordConfirm && password !== passwordConfirm) {
      setFeedback({ type: 'error', message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setFeedback({ type: 'error', message: '필수 이용약관 및 개인정보 수집에 동의해주세요.' });
      return;
    }

    setFeedback({
      type: 'success',
      message: '회원가입이 완료되었습니다! [내 개인 가계부]가 자동 생성되었습니다.',
    });
    setTimeout(() => {
      if (onSuccessSignup) onSuccessSignup();
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#121215] text-slate-900 dark:text-slate-100 flex flex-col justify-start pt-2 sm:pt-6 transition-colors">
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-[#27272a] shadow-sm space-y-5 transition-colors">
        
        {/* Header with ElmTyp01 */}
        <div className="text-center">
          <div className="flex justify-center mb-1.5">
            <ElmStt01 type="INDIGO" label="SCR-AUT-01 · 3초 간편 시작" />
          </div>
          <ElmTyp01
            title="모아보고 회원가입"
            subtitle="1인 다중 가계부와 스마트 모임 라이프 서비스를 시작하세요"
            className="items-center text-center"
          />
        </div>

        {/* 3대 소셜 간편가입 버튼 (공식 로고 SVG + whitespace-nowrap) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>간편 소셜 3초 가입</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">인증 불필요 즉시 시작</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* 카카오 */}
            <button
              type="button"
              onClick={() => handleSocialSignup('카카오')}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] active:scale-[0.98] text-[#191919] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              title="카카오로 3초 회원가입"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.88 5.36 4.73 6.72-.21.77-.76 2.78-.87 3.22-.14.54.2.53.42.39.17-.11 2.74-1.87 3.86-2.63.6.09 1.22.14 1.86.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
              </svg>
              <span>카카오</span>
            </button>

            {/* 네이버 */}
            <button
              type="button"
              onClick={() => handleSocialSignup('네이버')}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-[#03C75A] hover:bg-[#02a94d] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              title="네이버로 3초 회원가입"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
              </svg>
              <span>네이버</span>
            </button>

            {/* 구글 */}
            <button
              type="button"
              onClick={() => handleSocialSignup('구글')}
              className="min-h-[44px] py-2.5 px-2 rounded-xl bg-white dark:bg-[#252529] hover:bg-slate-50 dark:hover:bg-[#2e2e33] active:scale-[0.98] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              title="Google 계정으로 회원가입"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">또는 이메일 ID/PW 가입</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        {/* 인라인 상태 알림 피드백 (alert 대체) */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
            }`}
          >
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
            {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />}
            {feedback.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />}
            <span className="leading-relaxed flex-1">{feedback.message}</span>
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <ElmInp01
            label="사용자 닉네임"
            value={nickname}
            onChange={setNickname}
            placeholder="예: 구본영"
          />

          {/* 이메일 주소 및 인증번호 발송 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 leading-none">
              이메일 주소 (시스템 설정 시 필수 인증)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <ElmInp01
                  value={email}
                  onChange={setEmail}
                  placeholder="name@example.com"
                  disabled={isEmailVerified}
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isEmailVerified}
                className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold shrink-0 transition-colors whitespace-nowrap cursor-pointer"
              >
                {isEmailVerified ? '인증완료' : isCodeSent ? '재발송' : '인증요청'}
              </button>
            </div>
          </div>

          {/* 인증번호 입력 박스 (3분 카운트다운 타이머 포함) */}
          {isCodeSent && !isEmailVerified && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                  <span>6자리 인증번호 입력</span>
                  <span className="text-slate-400 font-normal">(테스트: 123456)</span>
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timerSeconds)}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ElmInp01
                    value={emailCode}
                    onChange={setEmailCode}
                    placeholder="인증번호 6자리"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="min-h-[40px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  확인
                </button>
              </div>
            </div>
          )}

          {/* 인증 완료 상태 표시 */}
          {isEmailVerified && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>이메일 본인 인증이 정상 완료되었습니다.</span>
            </div>
          )}

          <ElmInp01
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="8자 이상 영문/숫자/특수문자 조합"
          />

          <ElmInp01
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            placeholder="비밀번호 다시 입력"
          />

          {/* 약관 동의 (전체 동의 + 개별 선택) */}
          <div className="pt-2.5 space-y-2 border-t border-slate-100 dark:border-[#27272a]">
            {/* 전체 동의 버튼/체크박스 */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-slate-800">
              <ElmChk01
                checked={isAllAgreed}
                onChange={handleToggleAllAgreed}
                label="[전체 동의] 이용약관 및 개인정보 수집에 모두 동의합니다"
                className="font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pl-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <ElmChk01
                  checked={agreeTerms}
                  onChange={setAgreeTerms}
                  label="[필수] 모아보고 서비스 이용약관 동의"
                />
                <button
                  type="button"
                  onClick={() => setShowTermsDetail(!showTermsDetail)}
                  className="text-[10px] text-slate-400 hover:text-indigo-600 underline whitespace-nowrap cursor-pointer shrink-0"
                >
                  {showTermsDetail ? '약관 접기' : '약관 전문'}
                </button>
              </div>

              {showTermsDetail && (
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#232328] text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed max-h-24 overflow-y-auto border border-slate-200 dark:border-slate-700">
                  모아보고는 개인 및 모임 회원을 위한 분산형 가계부 관리 및 라이프 서비스를 제공하며, 오프라인 우선(IndexedDB) 보장과 단일 귀속성 자산관리를 준수합니다.
                </div>
              )}

              <ElmChk01
                checked={agreePrivacy}
                onChange={setAgreePrivacy}
                label="[필수] 개인정보 수집 및 이용 동의"
              />

              <ElmChk01
                checked={agreeMarketing}
                onChange={setAgreeMarketing}
                label="[선택] 이벤트 알림 및 라이프 혜택 정보 수신 동의"
              />
            </div>
          </div>

          {/* 가입 완료 제출 버튼 (min-h-[44px] 터치 규격 및 whitespace-nowrap) */}
          <button
            type="submit"
            className="w-full mt-4 min-h-[44px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>가입 완료하고 내 가계부 바로 열기</span>
          </button>
        </form>

        {/* 기존 회원 로그인 링크 */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            onClick={onGoLogin}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1 cursor-pointer whitespace-nowrap"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

