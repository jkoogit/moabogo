import React, { useEffect, useState } from 'react';
import {
  ElmChk01,
  ElmInp01,
  ElmStt01,
  ElmTyp01,
} from '../elements/Tokens';
import {
  CheckCircle2,
  Clock,
  Home,
  UserPlus,
  WifiOff,
} from 'lucide-react';
import {
  issueOfflineSession,
  OfflineAuthProvider,
} from '../data/offlineSessionStore';
import {
  AuthFeedbackAlert,
  AuthFeedbackState,
  SocialAuthButtons,
} from './auth/AuthSharedParts';

export interface SCR_AUT_01_Props {
  onGoLogin?: () => void;
  onSuccessSignup?: () => void;
  onGoHome?: () => void;
  isOffline?: boolean;
}

export const SCR_AUT_01_회원가입: React.FC<SCR_AUT_01_Props> = ({
  onGoLogin,
  onSuccessSignup,
  onGoHome,
  isOffline: externalIsOffline,
}) => {
  const [internalOffline, setInternalOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const isOffline =
    externalIsOffline !== undefined ? externalIsOffline : internalOffline;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [showTermsDetail, setShowTermsDetail] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedbackState | null>(null);

  useEffect(() => {
    const onOnline = () => setInternalOffline(false);
    const onOffline = () => setInternalOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
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

  const isAllAgreed = agreeTerms && agreePrivacy && agreeMarketing;
  const handleToggleAllAgreed = () => {
    const nextVal = !isAllAgreed;
    setAgreeTerms(nextVal);
    setAgreePrivacy(nextVal);
    setAgreeMarketing(nextVal);
  };

  const handleSendCode = () => {
    if (isOffline) {
      setFeedback({
        type: 'error',
        message: '오프라인 상태에서는 이메일 인증번호를 발송할 수 없습니다.',
      });
      return;
    }
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
    if (
      emailCode.trim() === '123456' ||
      (emailCode.trim().length === 6 && /^\d+$/.test(emailCode.trim()))
    ) {
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
    if (isOffline) {
      setFeedback({
        type: 'error',
        message: '오프라인 상태에서는 소셜 간편가입을 이용할 수 없습니다.',
      });
      return;
    }
    const providerCode: OfflineAuthProvider =
      provider === '카카오' ? 'KAKAO' : provider === '네이버' ? 'NAVER' : 'GOOGLE';

    setFeedback({
      type: 'info',
      message: `[${provider}] 소셜 계정 연동 가입이 진행됩니다. 잠시만 기다려주세요...`,
    });
    window.setTimeout(() => {
      issueOfflineSession({
        email: `${providerCode.toLowerCase()}_user@moabogo.app`,
        nickname: `${provider} 회원`,
        provider: providerCode,
      });
      setFeedback({
        type: 'success',
        message: `[${provider}] 간편 회원가입 완료! [내 개인 가계부]와 IndexedDB 오프라인 세션이 생성되었습니다.`,
      });
      window.setTimeout(() => {
        onSuccessSignup?.();
      }, 700);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) {
      setFeedback({
        type: 'error',
        message: '네트워크 연결 후 회원가입을 완료해주세요. 기존 회원은 로그인 화면의 오프라인 세션을 이용할 수 있습니다.',
      });
      return;
    }
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

    issueOfflineSession({
      email: email.trim(),
      nickname: nickname.trim(),
      provider: 'EMAIL',
    });

    setFeedback({
      type: 'success',
      message: '회원가입이 완료되었습니다! [내 개인 가계부]와 오프라인 세션 토큰이 생성되었습니다.',
    });
    window.setTimeout(() => {
      onSuccessSignup?.();
    }, 700);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start py-2 sm:py-4 px-2.5 sm:px-4 transition-colors">
      <div className="w-full max-w-md p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-[#27272a] shadow-sm space-y-3.5 transition-colors">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <ElmStt01 type="INDIGO" label="SCR-AUT-01 · 3초 간편 시작" />
          </div>
          <ElmTyp01
            title="모아보고 회원가입"
            subtitle="1인 다중 가계부와 스마트 모임 라이프 서비스를 시작하세요"
            className="items-center text-center"
          />
        </div>

        {/* 오프라인 단절 가드레일 안내 */}
        {isOffline && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-2">
            <div className="flex items-start gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-snug break-keep font-semibold">
                네트워크가 단절되어 신규 회원가입이 일시 제한됩니다. 기존 회원은 IndexedDB 캐시 세션으로 로그인할 수 있습니다.
              </span>
            </div>
            {onGoLogin && (
              <button
                type="button"
                onClick={onGoLogin}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
              >
                오프라인 세션 로그인(SCR-AUT-02)으로 이동
              </button>
            )}
          </div>
        )}

        {/* 3대 소셜 간편가입 */}
        <SocialAuthButtons mode="SIGNUP" disabled={isOffline} onSelect={handleSocialSignup} />

        {/* 구분선 */}
        <div className="flex items-center gap-2 my-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
            또는 이메일 ID/PW 가입
          </span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        <AuthFeedbackAlert feedback={feedback} />

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <ElmInp01
            label="사용자 닉네임"
            value={nickname}
            onChange={setNickname}
            placeholder="예: 구본영"
          />

          {/* 이메일 주소 및 인증번호 발송 (360px min-w-0 보정) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 leading-none">
              이메일 주소 (시스템 설정 시 필수 인증)
            </label>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0">
                <ElmInp01
                  value={email}
                  onChange={setEmail}
                  placeholder="name@example.com"
                  disabled={isEmailVerified || isOffline}
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isEmailVerified || isOffline}
                className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-semibold shrink-0 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center"
              >
                {isEmailVerified ? '인증완료' : isCodeSent ? '재발송' : '인증요청'}
              </button>
            </div>
          </div>

          {isCodeSent && !isEmailVerified && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1 flex-wrap">
                  <span>6자리 인증번호 입력</span>
                  <span className="text-slate-400 font-normal">(테스트: 123456)</span>
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatTimer(timerSeconds)}</span>
                </span>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 min-w-0">
                  <ElmInp01
                    value={emailCode}
                    onChange={setEmailCode}
                    placeholder="인증번호 6자리"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  className="min-h-[44px] px-4 sm:px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  확인
                </button>
              </div>
            </div>
          )}

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

          {/* 약관 동의 (360px flex-wrap & 터치 타깃 보강) */}
          <div className="pt-2.5 space-y-2 border-t border-slate-100 dark:border-[#27272a]">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-slate-800">
              <ElmChk01
                checked={isAllAgreed}
                onChange={handleToggleAllAgreed}
                label="[전체 동의] 이용약관 및 개인정보 수집 모두 동의"
                className="font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pl-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <ElmChk01
                  checked={agreeTerms}
                  onChange={setAgreeTerms}
                  label="[필수] 모아보고 서비스 이용약관 동의"
                />
                <button
                  type="button"
                  onClick={() => setShowTermsDetail(!showTermsDetail)}
                  className="min-h-[36px] px-2 text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 underline whitespace-nowrap cursor-pointer shrink-0"
                >
                  {showTermsDetail ? '약관 접기' : '약관 전문'}
                </button>
              </div>

              {showTermsDetail && (
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-[#232328] text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed max-h-24 overflow-y-auto border border-slate-200 dark:border-slate-700 break-keep">
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

          {/* 제출 버튼 */}
          <div className="flex items-center gap-2 mt-4">
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-[#27272a] bg-slate-100 hover:bg-slate-200 dark:bg-[#252529] dark:hover:bg-[#2e2e33] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap shadow-2xs"
                title="모아보고 홈으로 이동"
              >
                <Home className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span>홈</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isOffline}
              className="flex-1 min-h-[44px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4 shrink-0" />
              <span>{isOffline ? '오프라인 중 가입 제한' : '회원가입'}</span>
            </button>
          </div>
        </form>

        {/* 로그인 전환 링크 */}
        <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 flex-wrap">
          <span>이미 계정이 있으신가요?</span>
          <button
            type="button"
            onClick={onGoLogin}
            className="min-h-[44px] px-2 inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer whitespace-nowrap"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};
