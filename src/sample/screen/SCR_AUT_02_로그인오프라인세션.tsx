import React, { useEffect, useState } from 'react';
import {
  ElmChk01,
  ElmInp01,
  ElmStt01,
  ElmSwt01,
  ElmTyp01,
} from '../elements/Tokens';
import {
  ArrowLeft,
  Database,
  Home,
  LogIn,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { getPendingCount } from '../data/offlineQueueStore';
import {
  getCachedOfflineSession,
  hydrateOfflineSessionFromIDB,
  issueOfflineSession,
  OFFLINE_SESSION_CHANGED_EVENT,
  OfflineAuthProvider,
  OfflineAuthSession,
  revokeOfflineSession,
} from '../data/offlineSessionStore';
import {
  AuthFeedbackAlert,
  AuthFeedbackState,
  SocialAuthButtons,
} from './auth/AuthSharedParts';
import { OfflineSessionTokenCard } from './auth/OfflineSessionTokenCard';

export interface SCR_AUT_02_Props {
  onSuccessLogin?: () => void;
  onGoSignup?: () => void;
  onGoHome?: () => void;
  isOffline?: boolean;
  onToggleOffline?: () => void;
  onOpenOfflineViewer?: () => void;
}

export const SCR_AUT_02_로그인오프라인세션: React.FC<SCR_AUT_02_Props> = ({
  onSuccessLogin,
  onGoSignup,
  onGoHome,
  isOffline: externalIsOffline,
  onToggleOffline,
  onOpenOfflineViewer,
}) => {
  const [email, setEmail] = useState('jkok2j2m@gmail.com');
  const [password, setPassword] = useState('moabogo2026!');
  const [keepOfflineSession, setKeepOfflineSession] = useState(true);

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [internalOffline, setInternalOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const isOffline =
    externalIsOffline !== undefined ? externalIsOffline : internalOffline;

  const [cachedSession, setCachedSession] = useState<OfflineAuthSession | null>(() =>
    getCachedOfflineSession()
  );
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(() => getPendingCount());
  const [feedback, setFeedback] = useState<AuthFeedbackState | null>(null);

  useEffect(() => {
    void hydrateOfflineSessionFromIDB().then((session) => {
      setCachedSession(session);
    });

    const syncSession = () => setCachedSession(getCachedOfflineSession());
    const syncQueue = () => setPendingQueueCount(getPendingCount());

    const handleOnline = () => {
      setInternalOffline(false);
      setFeedback({
        type: 'info',
        message: '네트워크가 재연결되었습니다. 온라인 서버와 동기화할 수 있습니다.',
      });
    };
    const handleOffline = () => {
      setInternalOffline(true);
      setFeedback({
        type: 'info',
        message: '오프라인 모드로 전환되었습니다. IndexedDB 캐시 세션으로 무중단 로그인할 수 있습니다.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(OFFLINE_SESSION_CHANGED_EVENT, syncSession);
    window.addEventListener('moabogo:offline-queue-changed', syncQueue);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(OFFLINE_SESSION_CHANGED_EVENT, syncSession);
      window.removeEventListener('moabogo:offline-queue-changed', syncQueue);
    };
  }, []);

  const handleToggleNetworkMode = () => {
    if (onToggleOffline) {
      onToggleOffline();
    } else {
      setInternalOffline((prev) => !prev);
    }
  };

  const persistSessionIfEnabled = (provider: OfflineAuthProvider, targetEmail: string) => {
    if (keepOfflineSession) {
      const issued = issueOfflineSession({
        email: targetEmail,
        nickname: '구본영(호스트)',
        provider,
      });
      setCachedSession(issued);
    } else {
      revokeOfflineSession();
      setCachedSession(null);
    }
  };

  const handleSocialLogin = (provider: '카카오' | '네이버' | '구글') => {
    if (isOffline) {
      setFeedback({
        type: 'error',
        message: '오프라인 상태에서는 외부 소셜 로그인을 사용할 수 없습니다. 아래 IndexedDB 캐시 세션을 이용해주세요.',
      });
      return;
    }
    const providerCode: OfflineAuthProvider =
      provider === '카카오' ? 'KAKAO' : provider === '네이버' ? 'NAVER' : 'GOOGLE';

    setFeedback({
      type: 'info',
      message: `[${provider}] 간편 로그인 진행 중... IndexedDB 세션 토큰을 동기화합니다.`,
    });
    window.setTimeout(() => {
      persistSessionIfEnabled(providerCode, `${providerCode.toLowerCase()}@moabogo.app`);
      setFeedback({
        type: 'success',
        message: `[${provider}] 로그인 완료! ${
          keepOfflineSession ? 'IndexedDB 오프라인 세션이 안전하게 캐시되었습니다.' : ''
        }`,
      });
      window.setTimeout(() => {
        onSuccessLogin?.();
      }, 650);
    }, 450);
  };

  const handleOfflineCachedLogin = () => {
    if (!cachedSession) {
      setFeedback({
        type: 'error',
        message: '유효한 IndexedDB 오프라인 세션 토큰이 없습니다. 온라인 상태에서 먼저 로그인해주세요.',
      });
      return;
    }
    setFeedback({
      type: 'success',
      message: `IndexedDB 캐시 세션(${cachedSession.maskedToken}) 검증 완료! 오프라인 대시보드로 진입합니다.`,
    });
    window.setTimeout(() => {
      onSuccessLogin?.();
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

    if (isOffline) {
      if (cachedSession && cachedSession.email.toLowerCase() === email.trim().toLowerCase()) {
        handleOfflineCachedLogin();
      } else {
        setFeedback({
          type: 'error',
          message: '오프라인 상태에서는 기기에 캐시된 계정의 IndexedDB 세션으로만 로그인할 수 있습니다.',
        });
      }
      return;
    }

    if (is2FAEnabled && !is2FAStep) {
      setIs2FAStep(true);
      setFeedback({
        type: 'info',
        message: '2단계 인증(2FA)이 활성화된 계정입니다. OTP 보안 코드를 입력해주세요. (테스트용: 654321)',
      });
      return;
    }

    if (is2FAStep) {
      if (twoFactorCode.trim() === '654321' || twoFactorCode.trim().length === 6) {
        persistSessionIfEnabled('EMAIL', email.trim());
        setFeedback({
          type: 'success',
          message: '2FA 인증 성공! IndexedDB 오프라인 세션 토큰이 발급되었습니다.',
        });
        window.setTimeout(() => {
          onSuccessLogin?.();
        }, 650);
      } else {
        setFeedback({
          type: 'error',
          message: '2FA OTP 인증코드가 일치하지 않습니다. (테스트용: 654321)',
        });
      }
      return;
    }

    persistSessionIfEnabled('EMAIL', email.trim());
    setFeedback({
      type: 'success',
      message: keepOfflineSession
        ? '로그인 성공! IndexedDB에 오프라인 세션 토큰이 안전하게 저장되었습니다.'
        : '온라인 로그인 성공!',
    });

    window.setTimeout(() => {
      onSuccessLogin?.();
    }, 650);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start py-2 sm:py-4 px-2.5 sm:px-4 transition-colors">
      <div className="w-full max-w-md p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-[#27272a] shadow-xs space-y-3.5 transition-colors">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2 flex-wrap">
            <ElmStt01 type="INDIGO" label="SCR-AUT-02 · 세션 관리" />
            {isOffline ? (
              <ElmStt01 type="AMBER" label="오프라인" icon={<WifiOff className="w-3 h-3" />} />
            ) : (
              <ElmStt01 type="EMERALD" label="온라인" icon={<Wifi className="w-3 h-3" />} />
            )}
          </div>
          <ElmTyp01
            title="모아보고 로그인 & 세션"
            subtitle="오프라인 PWA 무중단 세션 지속 보장 (IndexedDB)"
            className="items-center text-center"
          />
        </div>

        {/* 네트워크 모드 테스트 바 (360px flex-wrap & 44px 터치타깃) */}
        <div className="flex items-center justify-between gap-2 flex-wrap p-2.5 rounded-xl bg-slate-100/80 dark:bg-[#252529] border border-slate-200/80 dark:border-[#333338] text-xs">
          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>네트워크 상태 전환</span>
          </span>
          <button
            type="button"
            onClick={handleToggleNetworkMode}
            className={`min-h-[44px] px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
              isOffline
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
            }`}
          >
            {isOffline ? '오프라인 (단절됨)' : '온라인 (정상연결)'}
          </button>
        </div>

        {/* IndexedDB 오프라인 세션 토큰 현황 및 원클릭 오프라인 진입 카드 */}
        <OfflineSessionTokenCard
          mode="LOGIN"
          isOffline={isOffline}
          cachedSession={cachedSession}
          pendingQueueCount={pendingQueueCount}
          onOfflineLogin={handleOfflineCachedLogin}
          onReissueSession={() => {
            const issued = issueOfflineSession({
              email,
              nickname: '구본영(호스트)',
              provider: 'EMAIL',
            });
            setCachedSession(issued);
            setFeedback({
              type: 'success',
              message: `IndexedDB 오프라인 세션(${issued.maskedToken})이 재발급되었습니다.`,
            });
          }}
          onRevokeSession={() => {
            revokeOfflineSession();
            setCachedSession(null);
            setFeedback({
              type: 'info',
              message: 'IndexedDB 오프라인 세션 토큰이 안전하게 폐기되었습니다.',
            });
          }}
          onOpenOfflineViewer={onOpenOfflineViewer}
        />

        {/* 3대 소셜 1초 간편 로그인 */}
        {!is2FAStep && (
          <div className="space-y-2">
            <SocialAuthButtons mode="LOGIN" disabled={isOffline} onSelect={handleSocialLogin} />

            <div className="flex items-center gap-2 my-2">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                또는 이메일 계정 로그인
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>
          </div>
        )}

        <AuthFeedbackAlert feedback={feedback} />

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

              <div className="pt-1">
                <ElmSwt01
                  checked={is2FAEnabled}
                  onChange={setIs2FAEnabled}
                  label="2단계 인증(2FA OTP) 보안 적용"
                  description="로그인 시 인증기 앱(Google OTP 등) 6자리 코드를 추가 확인합니다."
                  className="[&_span]:dark:text-zinc-200"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50">
                <ElmChk01
                  checked={keepOfflineSession}
                  onChange={setKeepOfflineSession}
                  label="오프라인 무중단 세션 유지 (IndexedDB)"
                  description="네트워크 단절 시에도 기기 로컬 IndexedDB 세션으로 가계부에 진입합니다."
                />
              </div>

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
                  className="flex-1 min-h-[44px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>
                    {isOffline
                      ? '오프라인 캐시 로그인'
                      : is2FAEnabled
                      ? '다음 (2단계 OTP 인증)'
                      : '로그인'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>2단계 보안 인증 (2FA OTP)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed break-keep">
                  Google Authenticator 또는 OTP 보안 앱의 6자리 인증코드를 입력하세요. (테스트용:{' '}
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400">654321</strong>)
                </p>
              </div>

              <ElmInp01
                label="OTP 인증코드 6자리"
                value={twoFactorCode}
                onChange={setTwoFactorCode}
                placeholder="예: 654321"
              />

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIs2FAStep(false);
                    setTwoFactorCode('');
                    setFeedback(null);
                  }}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-[#252529] hover:bg-slate-200 dark:hover:bg-[#2e2e33] text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>이전 단계</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>2FA 인증 완료 및 로그인</span>
                </button>
              </div>
            </div>
          )}
        </form>

        {/* 하단 보조 링크 */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#27272a] space-y-1 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-center gap-2 text-[11px] flex-wrap">
            <button
              type="button"
              onClick={() =>
                setFeedback({
                  type: 'info',
                  message: '가입하신 이메일로 비밀번호 재설정 링크를 전송할 수 있습니다.',
                })
              }
              className="min-h-[36px] px-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer whitespace-nowrap"
            >
              비밀번호 찾기
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              type="button"
              onClick={() =>
                setFeedback({
                  type: 'info',
                  message: '가입 시 인증한 이메일 또는 휴대폰 번호로 아이디를 조회합니다.',
                })
              }
              className="min-h-[36px] px-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer whitespace-nowrap"
            >
              아이디 찾기
            </button>
          </div>

          <div className="flex items-center justify-center gap-1 flex-wrap">
            <span>아직 모아보고 계정이 없으신가요?</span>
            <button
              type="button"
              onClick={onGoSignup}
              className="min-h-[44px] px-2 inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer whitespace-nowrap"
            >
              회원가입하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
