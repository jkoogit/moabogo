import React, { useState, useEffect } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmChk01,
  ElmStt01,
  ElmOff01,
  ElmSwt01,
} from '../elements/Tokens';
import {
  LogIn,
  Shield,
  ShieldCheck,
  Wifi,
  WifiOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Mail,
  HelpCircle,
} from 'lucide-react';

export const SCR_AUT_02_로그인오프라인세션: React.FC<{
  onSuccessLogin?: () => void;
  onGoSignup?: () => void;
}> = ({ onSuccessLogin, onGoSignup }) => {
  const [email, setEmail] = useState('jkok2j2m@gmail.com');
  const [password, setPassword] = useState('moabogo2026!');
  const [keepOfflineSession, setKeepOfflineSession] = useState(true);

  // 2단계 인증(2FA) 관련 상태
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // 네트워크 상태 감지
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // 인라인 알림 피드백 (alert 대체)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // 온라인/오프라인 이벤트 리스너 등록
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setFeedback({
        type: 'info',
        message: '네트워크가 재연결되었습니다. 온라인 서버와 동기화됩니다.',
      });
    };
    const handleOffline = () => {
      setIsOffline(true);
      setFeedback({
        type: 'info',
        message: '오프라인 모드로 전환되었습니다. 기기 로컬 IndexedDB 세션으로 로그인됩니다.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSocialLogin = (provider: '카카오' | '네이버' | '구글') => {
    setFeedback({
      type: 'info',
      message: `[${provider}] 간편 로그인 진행 중... IndexedDB 세션 토큰을 동기화합니다.`,
    });
    setTimeout(() => {
      setFeedback({
        type: 'success',
        message: `[${provider}] 로그인 완료! ${keepOfflineSession ? '오프라인 무중단 세션이 안전하게 캐시되었습니다.' : ''}`,
      });
      setTimeout(() => {
        if (onSuccessLogin) onSuccessLogin();
      }, 700);
    }, 500);
  };

  const handlePrimarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback({
        type: 'error',
        message: '아이디(이메일)와 비밀번호를 모두 입력해주세요.',
      });
      return;
    }

    // 2단계 인증이 활성화된 경우 OTP 입력 단계로 전이
    if (is2FAEnabled && !is2FAStep) {
      setIs2FAStep(true);
      setFeedback({
        type: 'info',
        message: '2단계 인증(2FA)이 활성화된 계정입니다. OTP 보안 코드를 입력해주세요. (테스트용: 654321)',
      });
      return;
    }

    // 2FA 2단계 검증
    if (is2FAStep) {
      if (twoFactorCode.trim() === '654321' || twoFactorCode.trim().length === 6) {
        setFeedback({
          type: 'success',
          message: '2FA 인증 성공! IndexedDB 세션이 발급되었습니다.',
        });
        setTimeout(() => {
          if (onSuccessLogin) onSuccessLogin();
        }, 700);
      } else {
        setFeedback({
          type: 'error',
          message: '2FA OTP 인증코드가 일치하지 않습니다. (테스트용: 654321)',
        });
      }
      return;
    }

    // 일반 로그인 성공
    const offlineNotice = isOffline
      ? '오프라인 상태입니다. 로컬 IndexedDB에 저장된 캐시 세션으로 진입합니다.'
      : '로그인 성공! IndexedDB에 오프라인 세션 토큰이 안전하게 저장되었습니다.';

    setFeedback({
      type: 'success',
      message: offlineNotice,
    });

    setTimeout(() => {
      if (onSuccessLogin) onSuccessLogin();
    }, 700);
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-[#121215] text-slate-900 dark:text-slate-100 flex flex-col justify-start transition-colors">
      {/* 최상단 오프라인 인디케이터 토큰 (ELM-OFF-01) */}
      <ElmOff01 isOffline={isOffline} pendingCount={isOffline ? 2 : 0} />

      {/* 상단 밀착 및 div 중복 제거 플랫 레이아웃 */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-[#27272a] shadow-xs space-y-5 transition-colors">
          
          {/* Header with ElmTyp01 */}
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-1.5">
              <ElmStt01 type="INDIGO" label="SCR-AUT-02 · 세션 관리" />
              {isOffline ? (
                <ElmStt01 type="AMBER" label="오프라인 모드" icon={<WifiOff className="w-3 h-3" />} />
              ) : (
                <ElmStt01 type="EMERALD" label="온라인 연결됨" icon={<Wifi className="w-3 h-3" />} />
              )}
            </div>
            <ElmTyp01
              title="모아보고 로그인 & 세션"
              subtitle="오프라인 PWA 무중단 세션 지속 보장 (IndexedDB)"
              className="items-center text-center"
            />
          </div>

          {/* 오프라인 시뮬레이션 토글 버튼 (테스트 편의용) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100/70 dark:bg-[#252529] border border-slate-200/80 dark:border-[#333338] text-xs">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>네트워크 모드 테스트</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOffline(!isOffline)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                isOffline
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              {isOffline ? '네트워크 끊김 (오프라인)' : '정상 연결 (온라인)'}
            </button>
          </div>

          {/* 3대 소셜 1초 간편 로그인 */}
          {!is2FAStep && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>간편 소셜 1초 로그인</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">오프라인 토큰 자동 발급</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* 카카오 */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('카카오')}
                  className="min-h-[44px] py-2.5 px-2 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] active:scale-[0.98] text-[#191919] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                  title="카카오로 1초 로그인"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.88 5.36 4.73 6.72-.21.77-.76 2.78-.87 3.22-.14.54.2.53.42.39.17-.11 2.74-1.87 3.86-2.63.6.09 1.22.14 1.86.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
                  </svg>
                  <span>카카오</span>
                </button>

                {/* 네이버 */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('네이버')}
                  className="min-h-[44px] py-2.5 px-2 rounded-xl bg-[#03C75A] hover:bg-[#02a94d] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                  title="네이버로 1초 로그인"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
                  </svg>
                  <span>네이버</span>
                </button>

                {/* 구글 */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('구글')}
                  className="min-h-[44px] py-2.5 px-2 rounded-xl bg-white dark:bg-[#252529] hover:bg-slate-50 dark:hover:bg-[#2e2e33] active:scale-[0.98] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
                  title="Google 계정으로 로그인"
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

              <div className="flex items-center gap-2 my-2.5">
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">또는 이메일 계정 로그인</span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>
            </div>
          )}

          {/* 인라인 알림 피드백 (alert 대체) */}
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

          {/* 메인 로그인 / 2FA 폼 */}
          <form onSubmit={handlePrimarySubmit} className="space-y-3.5">
            {!is2FAStep ? (
              <>
                <ElmInp01
                  label="아이디 / 이메일"
                  value={email}
                  onChange={setEmail}
                  placeholder="name@example.com"
                />

                <ElmInp01
                  label="비밀번호"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="비밀번호 입력"
                />

                {/* 2단계 인증 시뮬레이션 설정 토글 */}
                <div className="pt-1">
                  <ElmSwt01
                    checked={is2FAEnabled}
                    onChange={setIs2FAEnabled}
                    label="2단계 인증(2FA OTP) 보안 적용"
                    description="로그인 시 인증기 앱(Google OTP 등) 6자리 코드를 추가 확인합니다."
                  />
                </div>

                {/* 오프라인 IndexedDB 세션 유지 체크박스 */}
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 space-y-1">
                  <ElmChk01
                    checked={keepOfflineSession}
                    onChange={setKeepOfflineSession}
                    label="오프라인 무중단 세션 유지 (IndexedDB)"
                    description="네트워크가 단절되어도 기기 로컬 스토리지에 세션을 유지하고 가계부를 조회합니다."
                  />
                </div>

                {/* 로그인 제출 버튼 (min-h-[44px], whitespace-nowrap) */}
                <button
                  type="submit"
                  className="w-full mt-4 min-h-[44px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>{is2FAEnabled ? '다음 (2단계 OTP 인증)' : '로그인하고 내 가계부 열기'}</span>
                </button>
              </>
            ) : (
              /* 2단계 인증(2FA) OTP 입력 화면 */
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>2단계 보안 인증 (2FA OTP)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Google Authenticator 또는 OTP 보안 앱의 6자리 인증코드를 입력하세요. (테스트용: <strong className="font-mono text-indigo-600 dark:text-indigo-400">654321</strong>)
                  </p>
                </div>

                <ElmInp01
                  label="OTP 인증코드 6자리"
                  value={twoFactorCode}
                  onChange={setTwoFactorCode}
                  placeholder="예: 654321"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIs2FAStep(false);
                      setTwoFactorCode('');
                      setFeedback(null);
                    }}
                    className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#252529] hover:bg-slate-200 dark:hover:bg-[#2e2e33] text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>이전 단계</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-2 min-h-[44px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>2FA 인증 완료 및 로그인</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* 하단 보조 링크 (아이디/비밀번호 찾기 & 회원가입) */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#27272a] space-y-2 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-center gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => setFeedback({ type: 'info', message: '가입하신 이메일로 비밀번호 재설정 링크를 전송할 수 있습니다.' })}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer whitespace-nowrap"
              >
                비밀번호 찾기
              </button>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <button
                type="button"
                onClick={() => setFeedback({ type: 'info', message: '가입 시 인증한 이메일 또는 휴대폰 번호로 아이디를 조회합니다.' })}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer whitespace-nowrap"
              >
                아이디 찾기
              </button>
            </div>

            <div className="pt-1">
              아직 모아보고 계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={onGoSignup}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1 cursor-pointer whitespace-nowrap"
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

