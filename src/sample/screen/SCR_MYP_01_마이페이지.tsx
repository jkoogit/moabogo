// ============================================================================
// src/sample/screen/SCR_MYP_01_마이페이지.tsx
// 마이페이지 & 개인 프로필 허브 (MyPage & Personal Activity Hub)
// - 사용자 프로필 & 3대 소셜 연동 상태 & 계정 보안 등급
// - 대표 송금/수신 계좌 관리 (토스/카카오 딥링크 및 원터치 복사)
// - 참여 가계부·모임 요약 및 내 RBAC 권한 (OWNER/ADMIN/MEMBER)
// - 4대 라이프 서비스 실시간 통합 현황 (내 당번·목표·일정·루틴)
// - 360px 모바일 반응형 및 Elm 디자인 토큰 표준화
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  Wallet,
  Sparkles,
  Calendar,
  Repeat,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Settings,
  Mail,
  Trophy,
  Flame,
  Clock,
  Plus,
  Edit3,
  Check,
  Star,
  Layers,
  ArrowUpRight,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import { ElmTyp01, ElmToast01, ElmInp01, ElmSel01 } from '../elements/Tokens';
import {
  UserBankAccount,
  loadUserBankAccounts,
  saveUserBankAccounts,
  maskAccountNo,
} from '../data/accountStorePool';

export interface SCR_MYP_01_Props {
  onNavigateToSettings?: () => void;
  onNavigateToLedger?: () => void;
  onNavigateToDay?: () => void;
  onNavigateToRoutine?: () => void;
  onNavigateToDuty?: () => void;
  onNavigateToGoal?: () => void;
}

export const SCR_MYP_01_마이페이지: React.FC<SCR_MYP_01_Props> = ({
  onNavigateToSettings,
  onNavigateToLedger,
  onNavigateToDay,
  onNavigateToRoutine,
  onNavigateToDuty,
  onNavigateToGoal,
}) => {
  // 1. 계좌 상태 (SSOT: accountStorePool)
  const [bankAccounts, setBankAccounts] = useState<UserBankAccount[]>(() =>
    loadUserBankAccounts('u-1001-koo')
  );
  const [showMaskedAccount, setShowMaskedAccount] = useState<Record<string, boolean>>({});

  // 2. 프로필 정보 상태
  const [userProfile, setUserProfile] = useState({
    name: '구본영',
    nickname: '본영(가장)',
    email: 'koo.by@moabogo.app',
    joinedDate: '2026.01.01 (가입 328일째)',
    role: 'FAMILY OWNER (가족 대표관리자)',
    securityLevel: '우수 (2FA OTP 활성)',
    socialKakao: true,
    socialNaver: true,
    socialGoogle: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(`${label} 복사되었습니다: ${text}`);
        return;
      }
    } catch {
      // Fallback for unfocused document or restricted clipboard context
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(`${label} 복사되었습니다: ${text}`);
    } catch {
      showToast(`복사 권한이 제한되어 있습니다. 직접 선택하여 복사해주세요.`);
    }
  };

  const handleSetDefaultAccount = (accountId: string) => {
    const updated = bankAccounts.map((acc) => ({
      ...acc,
      isDefault: acc.id === accountId,
    }));
    setBankAccounts(updated);
    saveUserBankAccounts(updated, 'u-1001-koo');
    showToast('대표 송금계좌가 변경되었습니다.');
  };

  const defaultAccount = bankAccounts.find((a) => a.isDefault) || bankAccounts[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* 1. 상단 타이틀 헤더 */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <ElmTyp01
          title="마이페이지 & 개인 프로필"
          badge="SCR-MYP-01"
          subtitle="내 프로필 • 대표 송금계좌 • 참여 가계부 • 4대 라이프(당번·목표·일정·루틴) 개인 통합 활동 허브"
          actions={
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>환경설정</span>
            </button>
          }
        />
      </section>

      {/* 2. 개인 프로필 & 보안/소셜 계정 카드 */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
              구
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  {userProfile.name}
                </h2>
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  @{userProfile.nickname}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {userProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{userProfile.email}</span>
                <span>·</span>
                <span>{userProfile.joinedDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>보안: {userProfile.securityLevel}</span>
            </div>
          </div>
        </div>

        {/* 소셜 계정 연동 상태 칩 */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 font-medium">
            소셜 계정 연동 상태:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FEE500]/20 text-[#3c1e1e] dark:text-[#FEE500] font-semibold border border-[#FEE500]/40">
              <span className="w-2 h-2 rounded-full bg-[#3c1e1e] dark:bg-[#FEE500]" />
              카카오 연동됨
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#03C75A]/20 text-[#03C75A] font-semibold border border-[#03C75A]/40">
              <span className="w-2 h-2 rounded-full bg-[#03C75A]" />
              네이버 연동됨
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              구글 미연동
            </span>
          </div>
        </div>
      </section>

      {/* 3. 대표 송금/수신 계좌 관리 (SSOT: accountStorePool) */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              대표 송금/수신 계좌 카드
            </h3>
            <span className="text-xs text-slate-400 dark:text-zinc-500">
              (용돈 정산·회비·송금 1초 딥링크 지원)
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>계좌 풀 관리</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 계좌 카드 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bankAccounts.map((acc) => {
            const isMasked = !showMaskedAccount[acc.id];
            const displayAccount = isMasked ? maskAccountNo(acc.accountNo) : acc.accountNo;
            const tossDeepLink = `supertoss://send?bank=${encodeURIComponent(acc.bankName)}&accountNo=${acc.accountNo.replace(/[^0-9]/g, '')}`;

            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  acc.isDefault
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                    : 'bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {acc.bankName}
                      </span>
                      <span>· {acc.alias}</span>
                    </span>
                    {acc.isDefault ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                        대표계좌
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAccount(acc.id)}
                        className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300 font-semibold"
                      >
                        대표 설정
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-mono text-slate-900 dark:text-zinc-100 font-bold tabular-nums">
                      {displayAccount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowMaskedAccount((prev) => ({
                          ...prev,
                          [acc.id]: !prev[acc.id],
                        }))
                      }
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      title={isMasked ? '계좌번호 전체보기' : '마스킹 감추기'}
                    >
                      {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    예금주: {acc.accountHolder}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyText(acc.accountNo, '계좌번호가')}
                    className="flex-1 min-h-[32px] px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-semibold hover:bg-slate-50 inline-flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    계좌 복사
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(tossDeepLink, '토스 송금 링크가')}
                    className="flex-1 min-h-[32px] px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    토스 송금
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. 참여 가계부 & 모임 요약 (책꽂이형 뷰) */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              참여 중인 가계부 & 모임 (3개 가계부 참여 중)
            </h3>
          </div>
          <button
            type="button"
            onClick={onNavigateToLedger}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>가계부 허브 이동</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. 가족 가계부 */}
          <div
            onClick={onNavigateToLedger}
            className="p-3.5 rounded-xl border border-sky-100 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 space-y-2 hover:border-sky-300 dark:hover:border-sky-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-600 text-white">
                OWNER
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> 4인 구성
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                우리집 가계부 (가족 공유)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                이번 달 내 지출 분담: 1,840,000원
              </p>
            </div>
          </div>

          {/* 2. 스터디 가계부 */}
          <div
            onClick={onNavigateToLedger}
            className="p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/30 space-y-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">
                ADMIN
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> 6인 스터디
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                개발팀 주간 스터디
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                모임 회비 잔액: 450,000원 (정산 완료)
              </p>
            </div>
          </div>

          {/* 3. 동창 친목 가계부 */}
          <div
            onClick={onNavigateToLedger}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 space-y-2 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-white dark:bg-zinc-700">
                MEMBER
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> 12인 정기모임
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                고교 동창 친목회
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                4분기 회비 납부 완료 (2026.10.15)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4대 라이프 서비스 실시간 통합 현황 허브 (My 4-Life Hub) */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              나의 4대 라이프 서비스 실시간 활동 현황
            </h3>
          </div>
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            실시간 동기화
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1) 내 당번 */}
          <div
            onClick={onNavigateToDuty}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 space-y-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 내 당번
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">
                  오늘 1건
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                주방 설거지 및 분리수거
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 오늘 20:00 (D-Day)
              </div>
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5 pt-1">
              사진인증 수행하기 <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 2) 내 목표 */}
          <div
            onClick={onNavigateToGoal}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 space-y-2 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> 내 목표
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500 text-white">
                  진행 68%
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                비상금 1,000만원 모으기
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                680만원 / 1,000만원 (D-42)
              </div>
            </div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-0.5 pt-1">
              목표 기록하기 <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 3) 내 일정 */}
          <div
            onClick={onNavigateToDay}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 오늘 일정
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                  2건
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                가족 정기 결산 회의
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 오늘 19:30 · 거실
              </div>
            </div>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 pt-1">
              스마트 일기 작성 <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* 4) 내 루틴 */}
          <div
            onClick={onNavigateToRoutine}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 space-y-2 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5" /> 오늘 루틴
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                  완수 4/4
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                복약 순응 완료 · 알뜰폰 D-10
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-500" /> 18일 연속 달성 스트릭
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 pt-1">
              루틴 잔디 확인 <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </section>

      {/* 6. 나의 종합 활동 성과 KPI */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800 text-center">
          <div className="p-2 space-y-0.5">
            <div className="text-xs text-slate-500 dark:text-zinc-400">누적 당번 완수</div>
            <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 tabular-nums">
              142회
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            <div className="text-xs text-slate-500 dark:text-zinc-400">완료한 목표</div>
            <div className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
              8개
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            <div className="text-xs text-slate-500 dark:text-zinc-400">최대 연속 스트릭</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              24일
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            <div className="text-xs text-slate-500 dark:text-zinc-400">가계부 기장 준수율</div>
            <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 tabular-nums">
              98.5%
            </div>
          </div>
        </div>
      </section>

      {/* 토스트 피드백 */}
      {toastMessage && (
        <ElmToast01
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
