import React from 'react';
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export interface AuthFeedbackState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AuthFeedbackAlert: React.FC<{ feedback: AuthFeedbackState | null }> = ({
  feedback,
}) => {
  if (!feedback) return null;

  return (
    <div
      className={`p-3 rounded-xl border text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
        feedback.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          : feedback.type === 'error'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
      }`}
    >
      {feedback.type === 'success' && (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
      )}
      {feedback.type === 'error' && (
        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      )}
      {feedback.type === 'info' && (
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
      )}
      <span className="leading-relaxed flex-1 break-keep">{feedback.message}</span>
    </div>
  );
};

interface SocialAuthButtonsProps {
  mode: 'SIGNUP' | 'LOGIN';
  disabled?: boolean;
  onSelect: (provider: '카카오' | '네이버' | '구글') => void;
}

/** 360px 모바일 뷰포트 대응 3대 소셜 간편 인증 버튼 그룹 */
export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  mode,
  disabled = false,
  onSelect,
}) => {
  const actionLabel = mode === 'SIGNUP' ? '간편 소셜 3초 가입' : '간편 소셜 1초 로그인';
  const hintLabel =
    disabled
      ? '오프라인 중 소셜 인증 차단'
      : mode === 'SIGNUP'
      ? '인증 불필요 즉시 시작'
      : '오프라인 토큰 자동 발급';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-semibold text-slate-600 dark:text-slate-400">
        <span className="whitespace-nowrap">{actionLabel}</span>
        <span
          className={`text-[11px] font-normal whitespace-nowrap ${
            disabled
              ? 'text-amber-600 dark:text-amber-400 font-semibold'
              : 'text-indigo-600 dark:text-indigo-400'
          }`}
        >
          {hintLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect('카카오')}
          className="min-w-0 min-h-[44px] py-2.5 px-1.5 sm:px-2 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-[#191919] font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs whitespace-nowrap cursor-pointer"
          title={`카카오로 ${mode === 'SIGNUP' ? '회원가입' : '로그인'}`}
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.88 5.36 4.73 6.72-.21.77-.76 2.78-.87 3.22-.14.54.2.53.42.39.17-.11 2.74-1.87 3.86-2.63.6.09 1.22.14 1.86.14 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
          </svg>
          <span>카카오</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect('네이버')}
          className="min-w-0 min-h-[44px] py-2.5 px-1.5 sm:px-2 rounded-xl bg-[#03C75A] hover:bg-[#02a94d] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs whitespace-nowrap cursor-pointer"
          title={`네이버로 ${mode === 'SIGNUP' ? '회원가입' : '로그인'}`}
        >
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
          </svg>
          <span>네이버</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect('구글')}
          className="min-w-0 min-h-[44px] py-2.5 px-1.5 sm:px-2 rounded-xl bg-white dark:bg-[#252529] hover:bg-slate-50 dark:hover:bg-[#2e2e33] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs whitespace-nowrap cursor-pointer"
          title={`Google 계정으로 ${mode === 'SIGNUP' ? '회원가입' : '로그인'}`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Google</span>
        </button>
      </div>
    </div>
  );
};
