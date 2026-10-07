import React, { useState } from 'react';
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
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SCR_AUT_01_회원가입: React.FC<{
  onGoLogin?: () => void;
  onSuccessSignup?: () => void;
}> = ({ onGoLogin, onSuccessSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);

  const handleSendCode = () => {
    if (!email) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }
    setIsCodeSent(true);
    alert(`[인증번호 발송] ${email}로 6자리 인증번호가 발송되었습니다. (테스트용: 123456)`);
  };

  const handleVerifyCode = () => {
    if (emailCode === '123456' || emailCode.length === 6) {
      setIsEmailVerified(true);
      alert('이메일 인증이 성공적으로 완료되었습니다.');
    } else {
      alert('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      alert('이메일 인증을 완료해주세요.');
      return;
    }
    alert('회원가입이 완료되었습니다! 가입 즉시 [내 개인 가계부]가 자동 생성됩니다.');
    if (onSuccessSignup) onSuccessSignup();
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
            SCR-AUT-01
          </span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            모아보고 무료 회원가입
          </h1>
          <p className="text-xs text-slate-500">
            1인 다중 가계부와 모임 라이프 서비스를 시작하세요
          </p>
        </div>

        {/* 3 Major Social Logins */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700 block text-center">
            간편 소셜 계정으로 3초 시작:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => alert('[카카오 인증] 카카오 간편가입 진행')}
              className="py-2.5 px-3 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] text-slate-900 font-bold text-xs flex items-center justify-center transition-all shadow-xs"
            >
              카카오
            </button>
            <button
              type="button"
              onClick={() => alert('[네이버 인증] 네이버 간편가입 진행')}
              className="py-2.5 px-3 rounded-xl bg-[#03C75A] hover:bg-[#02a94d] text-white font-bold text-xs flex items-center justify-center transition-all shadow-xs"
            >
              네이버
            </button>
            <button
              type="button"
              onClick={() => alert('[구글 인증] 구글 간편가입 진행')}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center transition-all shadow-xs"
            >
              Google
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 my-3">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[11px] text-slate-400 font-medium">또는 이메일 ID/PW 가입</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <ElmInp01
            label="사용자 닉네임"
            value={nickname}
            onChange={setNickname}
            placeholder="예: 구본영"
          />

          {/* Email with Verification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 leading-none">
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
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:bg-slate-200 text-white text-xs font-semibold shrink-0"
              >
                {isCodeSent ? '재발송' : '인증요청'}
              </button>
            </div>
          </div>

          {/* Verification Code Box */}
          {isCodeSent && !isEmailVerified && (
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <span className="text-[11px] font-semibold text-indigo-900 block">
                6자리 인증번호 입력 (테스트: 123456)
              </span>
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
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0"
                >
                  확인
                </button>
              </div>
            </div>
          )}

          {isEmailVerified && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>이메일 본인 인증이 완료되었습니다.</span>
            </div>
          )}

          <ElmInp01
            label="비밀번호"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="8자 이상 영문/숫자 조합"
          />

          {/* Agreements */}
          <div className="pt-2 space-y-2 border-t border-slate-100">
            <ElmChk01
              checked={agreeTerms}
              onChange={setAgreeTerms}
              label="[필수] 모아보고 서비스 이용약관 동의"
            />
            <ElmChk01
              checked={agreePrivacy}
              onChange={setAgreePrivacy}
              label="[필수] 개인정보 수집 및 이용 동의"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>가입 완료하고 가계부 자동 생성</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          이미 계정이 있으신가요?{' '}
          <button
            type="button"
            onClick={onGoLogin}
            className="text-indigo-600 font-bold hover:underline"
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};
