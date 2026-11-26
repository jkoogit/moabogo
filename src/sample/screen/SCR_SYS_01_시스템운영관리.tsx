import React, { useState } from 'react';
import { ElmTyp01, ElmSld03 } from '../elements/Tokens';
import {
  Server,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Lock,
  Bell,
  Users,
  Coins,
  Code2,
  Gamepad2,
} from 'lucide-react';
import {
  InfraSettingsTab,
  AuthSecurityTab,
  FinanceComplianceTab,
} from './system/InfraAuthFinanceTabs';
import { NotificationMatrixTab } from './system/NotificationMatrixTab';
import { RbacGovernanceTab } from './system/RbacGovernanceTab';
import { MasterCodeTab } from './system/MasterCodeTab';
import { GamePoolTab } from './system/GamePoolTab';
import { NoticeGovernanceTab } from './system/NoticeGovernanceTab';

type SystemTabId =
  | 'INFRA'
  | 'AUTH_SEC'
  | 'NOTIFY'
  | 'RBAC_LEGAL'
  | 'FINANCE'
  | 'MASTER_CODE'
  | 'GAME_POOL'
  | 'NOTICE';

export const SCR_SYS_01_시스템운영관리: React.FC<{
  onBack?: () => void;
}> = () => {
  const [activeTab, setActiveTab] = useState<SystemTabId>('INFRA');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('인프라 관제 지표가 갱신되었습니다.');
    }, 500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header with 360px 2-line layout standard */}
      <section className="border-b border-slate-200 dark:border-zinc-800 pb-3">
        <ElmTyp01
          title="시스템 운영관리 백오피스"
          badge="SCR-SYS-01"
          subtitle="플랫폼 8대 거버넌스 • 보안/인증 • 22종 알림 매트릭스 • 21개 화면 RBAC/약관 • 28대 마스터코드 • 수명주기·인프라 관제"
          actions={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                title="인프라 상태 실시간 새로고침"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">새로고침</span>
              </button>

              <span className="text-[10px] px-2 py-1 rounded-lg font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>운영 정상</span>
              </span>
            </div>
          }
        />
      </section>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="fixed top-16 right-4 z-50 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. 8대 거버넌스 네비게이션 서류철 탭 (ElmSld03 Slider) */}
      <section className="w-full min-w-0">
        <ElmSld03 showNavButtons={false} className="w-full">
          <div className="flex items-center min-w-max border-b border-slate-200 dark:border-zinc-800">
            {[
              { id: 'INFRA', label: '인프라 관제', icon: <Server className="w-3.5 h-3.5" /> },
              { id: 'AUTH_SEC', label: '로그인/보안', icon: <Lock className="w-3.5 h-3.5" /> },
              { id: 'NOTIFY', label: '알림 매트릭스', icon: <Bell className="w-3.5 h-3.5" /> },
              { id: 'RBAC_LEGAL', label: '시스템관리', icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'FINANCE', label: '금융 통제', icon: <Coins className="w-3.5 h-3.5" /> },
              { id: 'MASTER_CODE', label: '마스터 코드', icon: <Code2 className="w-3.5 h-3.5" /> },
              { id: 'GAME_POOL', label: '게임 콘텐츠 풀', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
              { id: 'NOTICE', label: '공지', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SystemTabId)}
                  className={`min-h-[44px] px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t" />
                  )}
                </button>
              );
            })}
          </div>
        </ElmSld03>
      </section>

      {/* 3. 8대 탭 컨텐츠 영역 (모듈화된 하위 패널 오케스트레이션) */}
      {activeTab === 'INFRA' && <InfraSettingsTab onToast={showToast} />}
      {activeTab === 'AUTH_SEC' && <AuthSecurityTab onToast={showToast} />}
      {activeTab === 'NOTIFY' && <NotificationMatrixTab onToast={showToast} />}
      {activeTab === 'RBAC_LEGAL' && <RbacGovernanceTab onToast={showToast} />}
      {activeTab === 'FINANCE' && <FinanceComplianceTab onToast={showToast} />}
      {activeTab === 'MASTER_CODE' && <MasterCodeTab onToast={showToast} />}
      {activeTab === 'GAME_POOL' && <GamePoolTab onToast={showToast} />}
      {activeTab === 'NOTICE' && <NoticeGovernanceTab onToast={showToast} />}
    </div>
  );
};
