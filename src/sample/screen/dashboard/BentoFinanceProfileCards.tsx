import React, { useState } from 'react';
import {
  ArrowRight,
  Copy,
  CreditCard,
  Scale,
  UserCheck,
} from 'lucide-react';
import { ThemeMode } from '../../../context/ThemeContext';
import {
  getCurrentUserDefaultAccount,
  maskAccountNo,
} from '../../data/accountStorePool';
import {
  BentoCardHeader,
  getBentoBorderClass,
  getBentoSubCardClass,
  getBentoSurfaceClass,
} from './BentoCardShell';

/** MODULE: ⚖️ 모아머니 가족 대차대조표 벤토 카드 (1-Col) */
export const MoneyBalanceBentoCard: React.FC<{
  resolvedTheme: ThemeMode;
  orderStyle: React.CSSProperties;
  pendingCount: number;
  pendingAmount: number;
  onNavigate?: (screenId: string) => void;
}> = ({ resolvedTheme, orderStyle, pendingCount, pendingAmount, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalLent = 420000;
  const totalRepaid = 285000;
  const netReceivable = totalLent - totalRepaid;

  return (
    <section
      style={orderStyle}
      className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-amber-400/50 ${getBentoSurfaceClass(
        resolvedTheme
      )}`}
    >
      <div>
        <BentoCardHeader
          resolvedTheme={resolvedTheme}
          icon={<Scale className="w-4 h-4" />}
          iconBgClass="bg-amber-500/10 text-amber-500"
          title="모아머니 대차대조표"
          subtitle="지급 시 주머니 결정 · TRANSFER 자동기장"
          screenBadge="SCR-MON-01"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
        />

        {isExpanded && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2.5 rounded-xl border ${getBentoSubCardClass(resolvedTheme)}`}>
                <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                  지급 대기 ({pendingCount}건)
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">
                  ₩{pendingAmount.toLocaleString()}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${getBentoSubCardClass(resolvedTheme)}`}>
                <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                  미상환 순 채권
                </span>
                <span className="text-xs sm:text-sm font-black font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  ₩{netReceivable.toLocaleString()}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${getBentoSubCardClass(resolvedTheme)}`}>
                <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                  총 대여·선지급
                </span>
                <span className="text-xs font-bold font-mono text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                  ₩{totalLent.toLocaleString()}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${getBentoSubCardClass(resolvedTheme)}`}>
                <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                  기상환 회수액
                </span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  ₩{totalRepaid.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-snug break-keep">
              ✓ 가계부 단일 귀속 SSOT 및 1초 송금 시 출금 원장 지정 연동
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${getBentoBorderClass(
            resolvedTheme
          )}`}
        >
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
            회수율 {Math.round((totalRepaid / totalLent) * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onNavigate?.('SCR-MON-01')}
            className="min-h-[44px] px-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>모아머니 관리</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};

/** MODULE: 👤 마이페이지 프로필 & 대표 송금계좌 벤토 카드 (1-Col) */
export const MyPageBentoCard: React.FC<{
  resolvedTheme: ThemeMode;
  orderStyle: React.CSSProperties;
  ledgerCount: number;
  onNavigate?: (screenId: string) => void;
  onNotify?: (msg: string) => void;
}> = ({ resolvedTheme, orderStyle, ledgerCount, onNavigate, onNotify }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const defaultAccount = getCurrentUserDefaultAccount('u-1001-koo');

  const handleCopyAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!defaultAccount) return;
    const copyText = `${defaultAccount.bankName} ${defaultAccount.accountNo}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(copyText);
    }
    onNotify?.(`✓ 대표 송금계좌가 복사되었습니다: ${defaultAccount.bankName} ${maskAccountNo(defaultAccount.accountNo)}`);
  };

  return (
    <section
      style={orderStyle}
      className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col justify-between transition-all hover:border-sky-400/50 ${getBentoSurfaceClass(
        resolvedTheme
      )}`}
    >
      <div>
        <BentoCardHeader
          resolvedTheme={resolvedTheme}
          icon={<UserCheck className="w-4 h-4" />}
          iconBgClass="bg-sky-500/10 text-sky-500"
          title="마이페이지 프로필"
          subtitle="대표 송금계좌 · 참여 가계부 · 개인 활동 허브"
          screenBadge="SCR-MYP-01"
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
        />

        {isExpanded && (
          <div className="space-y-2.5">
            {/* 프로필 요약 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${getBentoSubCardClass(
                resolvedTheme
              )}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  구
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    구본영 (본영·가장)
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                    FAMILY OWNER · 참여 가계부 {ledgerCount}권
                  </div>
                </div>
              </div>
            </div>

            {/* 대표 송금 수신계좌 */}
            {defaultAccount && (
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${getBentoSubCardClass(
                  resolvedTheme
                )}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <CreditCard className="w-3 h-3 text-sky-500 shrink-0" />
                    <span className="truncate">{defaultAccount.bankName} (대표)</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-200 truncate mt-0.5">
                    {maskAccountNo(defaultAccount.accountNo)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="min-h-[38px] px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3 shrink-0" />
                  <span>복사</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${getBentoBorderClass(
            resolvedTheme
          )}`}
        >
          <span className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">
            2FA 보안 우수
          </span>
          <button
            type="button"
            onClick={() => onNavigate?.('SCR-MYP-01')}
            className="min-h-[44px] px-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>마이페이지 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
