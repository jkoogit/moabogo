import React, { useState } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmSwt01,
  ElmRad01,
  ElmChk01,
  ElmSld03,
} from '../elements/Tokens';
import {
  Settings,
  Bell,
  Layout,
  Sliders,
  KeyRound,
  CreditCard,
  Check,
  Save,
  Sun,
  Moon,
  Sparkles,
  Monitor,
  X,
  Store,
  ExternalLink,
  Coffee,
  CheckCircle2,
  Utensils,
  Search,
  Plus,
  Trash2,
  Star,
  Copy,
  Edit3,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  SYSTEM_STORE_POOL,
  loadUserStorePreference,
  saveUserStorePreference,
  StorePreset,
  StoreMenuItem,
  UserStorePreference,
} from '../data/systemStorePool';
import {
  UserBankAccount,
  AccountServicePurpose,
  loadUserBankAccounts,
  saveUserBankAccounts,
  maskAccountNo,
} from '../data/accountStorePool';

export const SCR_SET_01_사용자설정: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('THEME');
  const [saveToast, setSaveToast] = useState(false);

  // 6.1 메인화면 구성 설정
  const [showLedgerSummary, setShowLedgerSummary] = useState(true);
  const [showGoalSummary, setShowGoalSummary] = useState(true);
  const [showDutySummary, setShowDutySummary] = useState(true);
  const [showMoneySummary, setShowMoneySummary] = useState(true);

  // 6.2 빠른수행 우선순위 설정
  const [quickPriorityMode, setQuickPriorityMode] = useState<'ALL' | 'TOP_ONE'>('TOP_ONE');

  // 6.3 알림 설정
  const [notifyGoals, setNotifyGoals] = useState(true);
  const [notifyDuties, setNotifyDuties] = useState(true);
  const [notifyLoans, setNotifyLoans] = useState(true);
  const [notifyTime, setNotifyTime] = useState('09:00');

  // 6.4 복수 계좌 풀 연동
  const [userBankAccounts, setUserBankAccounts] = useState<UserBankAccount[]>(() =>
    loadUserBankAccounts('u-1001-koo')
  );
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formBankName, setFormBankName] = useState('카카오뱅크');
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('구본영');
  const [formAlias, setFormAlias] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formPurposes, setFormPurposes] = useState<AccountServicePurpose[]>(['GENERAL']);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // 6.5 OCR 개인 키
  const [ocrKey, setOcrKey] = useState('sk-proj-user-key-dummy-sample');

  // 6.6 단골 매장 관리 (시스템 풀 연동)
  const [userStorePref, setUserStorePref] = useState<UserStorePreference>(() => loadUserStorePreference());
  const [selectedMenuStore, setSelectedMenuStore] = useState<StorePreset | null>(null);
  const [menuModalCategory, setMenuModalCategory] = useState<string>('전체');
  const [storeFilterCategory, setStoreFilterCategory] = useState<string>('전체');

  const handleToggleMyStore = (storeId: string) => {
    setUserStorePref((prev) => {
      const exists = prev.myStoreIds.includes(storeId);
      const newIds = exists
        ? prev.myStoreIds.filter((id) => id !== storeId)
        : [...prev.myStoreIds, storeId];
      const newSelected = !newIds.includes(prev.selectedStoreId)
        ? (newIds[0] || 'sys_store_pluscafe_45f')
        : prev.selectedStoreId;
      return {
        selectedStoreId: newSelected,
        myStoreIds: newIds,
      };
    });
  };

  const handleSetDefaultStore = (storeId: string) => {
    setUserStorePref((prev) => ({
      ...prev,
      selectedStoreId: storeId,
      myStoreIds: prev.myStoreIds.includes(storeId) ? prev.myStoreIds : [...prev.myStoreIds, storeId],
    }));
  };

  // 계좌 기본값 지정 핸들러
  const handleSetDefaultAccount = (accountId: string) => {
    setUserBankAccounts((prev) => {
      const updated = prev.map((a) => ({
        ...a,
        isDefault: a.id === accountId,
      }));
      saveUserBankAccounts(updated, 'u-1001-koo');
      return updated;
    });
    setCopyToast('★ 기본 대표계좌가 변경되었습니다.');
    setTimeout(() => setCopyToast(null), 2500);
  };

  // 계좌 삭제 핸들러
  const handleDeleteAccount = (accountId: string) => {
    setUserBankAccounts((prev) => {
      const remaining = prev.filter((a) => a.id !== accountId);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      saveUserBankAccounts(remaining, 'u-1001-koo');
      return remaining;
    });
    setCopyToast('계좌가 삭제되었습니다.');
    setTimeout(() => setCopyToast(null), 2500);
  };

  // 계좌 등록/수정 모달 오픈
  const handleOpenAccountModal = (acc?: UserBankAccount) => {
    if (acc) {
      setEditingAccountId(acc.id);
      setFormBankName(acc.bankName);
      setFormAccountNo(acc.accountNo);
      setFormAccountHolder(acc.accountHolder);
      setFormAlias(acc.alias);
      setFormIsDefault(acc.isDefault);
      setFormPurposes(acc.assignedPurposes);
    } else {
      setEditingAccountId(null);
      setFormBankName('카카오뱅크');
      setFormAccountNo('');
      setFormAccountHolder('구본영');
      setFormAlias('');
      setFormIsDefault(userBankAccounts.length === 0);
      setFormPurposes(['GENERAL']);
    }
    setIsAccountModalOpen(true);
  };

  // 계좌 모달 저장
  const handleSaveAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formAccountNo.trim()) return;

    if (editingAccountId) {
      // 수정
      setUserBankAccounts((prev) => {
        const updated: UserBankAccount[] = prev.map((a) => {
          if (a.id === editingAccountId) {
            return {
              ...a,
              bankName: formBankName,
              accountNo: formAccountNo.trim(),
              accountHolder: formAccountHolder.trim() || '구본영',
              alias: formAlias.trim() || `${formBankName} 계좌`,
              isDefault: formIsDefault ? true : a.isDefault,
              assignedPurposes:
                formPurposes.length > 0
                  ? formPurposes
                  : (['GENERAL'] as AccountServicePurpose[]),
            };
          }
          if (formIsDefault) return { ...a, isDefault: false };
          return a;
        });
        saveUserBankAccounts(updated, 'u-1001-koo');
        return updated;
      });
    } else {
      // 신규 추가
      const newAcc: UserBankAccount = {
        id: `acc-${Date.now()}`,
        userId: 'u-1001-koo',
        bankName: formBankName,
        accountNo: formAccountNo.trim(),
        accountHolder: formAccountHolder.trim() || '구본영',
        alias: formAlias.trim() || `${formBankName} 계좌`,
        isDefault: formIsDefault || userBankAccounts.length === 0,
        assignedPurposes:
          formPurposes.length > 0
            ? formPurposes
            : (['GENERAL'] as AccountServicePurpose[]),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setUserBankAccounts((prev) => {
        const base = formIsDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        const updated = [...base, newAcc];
        saveUserBankAccounts(updated, 'u-1001-koo');
        return updated;
      });
    }

    setIsAccountModalOpen(false);
    setCopyToast('✓ 계좌 정보가 안전하게 저장되었습니다.');
    setTimeout(() => setCopyToast(null), 2500);
  };

  const handleSave = () => {
    saveUserStorePreference(userStorePref);
    saveUserBankAccounts(userBankAccounts, 'u-1001-koo');
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-8 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Section 1: Header (Flat Peer 1) */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <ElmTyp01
            title="사용자 맞춤 설정"
            badge="SCR-SET-01"
            subtitle="위젯 배치 • 우선순위 • 알림 • 송금 계좌 • 단골 매장 • OCR 키 • 플랫 피어 레이아웃"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm shrink-0 cursor-pointer transition-all"
        >
          <Save className="w-4 h-4" />
          <span>설정 저장</span>
        </button>
      </section>

      {/* In-app Save Success Toast (replaces window.alert) */}
      {saveToast && (
        <aside className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <span>✓ 사용자 맞춤 설정 및 단골 매장 설정이 브라우저 로컬 스토리지에 안전하게 저장되었습니다.</span>
          <button
            type="button"
            onClick={() => setSaveToast(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-600 dark:text-emerald-400"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Section 2: Settings Tabs with ElmSld03 (Flat Peer 2) */}
      <section className="w-full min-w-0">
        <ElmSld03 showNavButtons={false} className="w-full">
          <div className="flex items-center min-w-max border-b border-slate-200 dark:border-zinc-800">
            {[
              { id: 'THEME', label: '화면 테마' },
              { id: 'STORE', label: '단골 매장' },
              { id: 'LAYOUT', label: '화면배치' },
              { id: 'PRIORITY', label: '우선순위' },
              { id: 'NOTIFY', label: '알림설정' },
              { id: 'ACCOUNT', label: '송금계좌' },
              { id: 'OCR', label: 'OCR 키' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] px-5 py-3 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
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

      {/* Section 3: Tab Content Panels (Flat Peer 3) */}

      {/* Tab 0: 화면 테마 (주간 / 야간 / 여명 / 시스템) */}
      {activeTab === 'THEME' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              화면 디스플레이 테마 (주간 • 야간 • 여명 • 시스템)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              선호하는 색상 팔레트와 기기 기본 설정을 실시간으로 선택 및 적용할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Light Mode Card */}
            <div
              onClick={() => setTheme('light')}
              className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">주간 (라이트)</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">화이트 테마</span>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                밝은 주간 환경 및 문서 검토에 적합한 클린 화이트
              </p>
            </div>

            {/* 2. Dark Mode Card (Gray) */}
            <div
              onClick={() => setTheme('dark')}
              className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'dark'
                  ? 'border-zinc-400 bg-zinc-800/40 shadow-sm'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">야간 (다크)</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">딥 잉크 블랙 테마</span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                OLED 친화적인 딥 잉크 블랙(#0B0F17 / #131B2E) 배경
              </p>
            </div>

            {/* 3. Dawn Mode Card (Blue) */}
            <div
              onClick={() => setTheme('dawn')}
              className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'dawn'
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">여명 (블루)</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">오션 스카이 블루</span>
                  </div>
                </div>
                {theme === 'dawn' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                산뜻하고 시원한 오션 스카이 블루(#edf4fc / #2563eb) 컬러웨이
              </p>
            </div>

            {/* 4. System Auto Card */}
            <div
              onClick={() => setTheme('system')}
              className={`min-h-[44px] p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] hover:bg-white dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block leading-tight">시스템 연동</span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">기기 OS 자동</span>
                  </div>
                </div>
                {theme === 'system' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                운영체제(OS)의 다크/라이트 모드 설정에 자동 동기화
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab: 단골 매장 관리 (시스템 매장 풀 & 사다리 연동) */}
      {activeTab === 'STORE' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  단골 매장 및 메뉴 관리 (사다리 커피내기 연동)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                시스템에서 수집된 매장 풀 중 우리 모임/사내 단골 매장을 등록하면, 사다리게임에서 각 참가자가 원하는 음료/메뉴를 직접 선택할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                등록 매장 {userStorePref.myStoreIds.length}개
              </span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: '전체', label: '전체 매장' },
              { id: 'CAFE', label: '☕ 카페 / 디저트' },
              { id: 'LUNCH', label: '🍱 점심 / 한식 / 샐러드' },
              { id: 'SNACK', label: '🥟 분식 / 간편식' },
            ].map((cat) => {
              const isActive = storeFilterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setStoreFilterCategory(cat.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* System Store Pool Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_STORE_POOL.filter((s) => {
              if (storeFilterCategory === '전체') return true;
              return s.category === storeFilterCategory;
            }).map((store) => {
              const isRegistered = userStorePref.myStoreIds.includes(store.id);
              const isDefault = userStorePref.selectedStoreId === store.id;


              return (
                <div
                  key={store.id}
                  className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                    isDefault
                      ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                      : isRegistered
                      ? 'border-indigo-300 dark:border-indigo-900/60 bg-white dark:bg-[#172239]'
                      : 'border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-[#0B0F17]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                          style={{ backgroundColor: store.themeColor || '#006241' }}
                        >
                          <Coffee className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {store.name}
                            </span>
                            {isDefault && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                                기본 매장
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                            {store.partnerBrand || store.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium shrink-0">
                        메뉴 {store.menus.length}종
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300 line-clamp-2">
                      📍 {store.locationMemo}
                    </p>

                    {/* Menu category preview tags */}
                    <div className="flex flex-wrap gap-1">
                      {store.menuCategories.slice(0, 4).map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                        >
                          {cat}
                        </span>
                      ))}
                      {store.menuCategories.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                          +{store.menuCategories.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Store Action Buttons (44px touch target) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMenuStore(store);
                        setMenuModalCategory('전체');
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>📋 전체 메뉴판 보기</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isRegistered && !isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultStore(store.id)}
                          className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          기본 매장 지정
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleMyStore(store.id)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isRegistered
                            ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {isRegistered ? '등록 해제' : '+ 내 매장 등록'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-300">💡 매장 풀 안내</p>
            <p>• 시스템 매장 풀은 공식 파트너십 및 수집 데이터를 기반으로 제공되며, 사용자 요청에 따라 향후 엑셀 업로드 및 신규 매장 제안 기능이 순차 제공될 예정입니다.</p>
          </aside>
        </section>
      )}

      {/* Store Menu Board Modal (전체 메뉴판 레이어 팝업) */}
      {selectedMenuStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
            {/* Modal Header */}
            <div
              className="p-4 sm:p-5 text-white flex items-center justify-between gap-3 shrink-0"
              style={{ backgroundColor: selectedMenuStore.themeColor || '#006241' }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold">{selectedMenuStore.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                    전체 {selectedMenuStore.menus.length}종
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-0.5">
                  {selectedMenuStore.locationMemo} • {selectedMenuStore.partnerBrand}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedMenuStore.naverBookingUrl && (
                  <a
                    href={selectedMenuStore.naverBookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="네이버 주문/예약 페이지 열기"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">네이버 주문</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedMenuStore(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0B0F17]/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                type="button"
                onClick={() => setMenuModalCategory('전체')}
                className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  menuModalCategory === '전체'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                전체 ({selectedMenuStore.menus.length})
              </button>
              {selectedMenuStore.menuCategories.map((cat) => {
                const count = selectedMenuStore.menus.filter((m) => m.categoryName === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMenuModalCategory(cat)}
                    className={`min-h-[36px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      menuModalCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Menu List Scrollable Area */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 overscroll-contain">
              {selectedMenuStore.menus
                .filter((m) => menuModalCategory === '전체' || m.categoryName === menuModalCategory)
                .map((menu) => (
                  <div
                    key={menu.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {menu.name}
                        </span>
                        {menu.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              menu.badge === 'BEST'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            }`}
                          >
                            {menu.badge}
                          </span>
                        )}
                        {menu.temperature && (
                          <span className="text-[10px] text-slate-400">
                            [{menu.temperature}]
                          </span>
                        )}
                      </div>
                      {menu.description && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {menu.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {menu.price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedMenuStore(null)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: 메인화면 구성 */}
      {activeTab === 'LAYOUT' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            대시보드 Bento Grid 위젯 표시 항목 선택
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            <ElmSwt01
              checked={showLedgerSummary}
              onChange={setShowLedgerSummary}
              label="가계부 자산 및 생활비 통계 카드"
              description="소비 지출과 자산/부채 이동 엄격 분리 표시"
            />
            <ElmSwt01
              checked={showGoalSummary}
              onChange={setShowGoalSummary}
              label="모아목표 (MoaGoal) 챌린지 위젯"
              description="동행원 일일 달성률 및 챌린지 진행바"
            />
            <ElmSwt01
              checked={showDutySummary}
              onChange={setShowDutySummary}
              label="모아당번 (MoaDuty) 상태 카드"
              description="미인증 및 대신수행 요청 건수 노출"
            />
            <ElmSwt01
              checked={showMoneySummary}
              onChange={setShowMoneySummary}
              label="모아머니 (MoaMoney) 요구/상환 카드"
              description="용돈 차감 요청 및 분납 D-Day 노출"
            />
          </div>
        </section>
      )}

      {/* Tab 2: 빠른수행 우선순위 */}
      {activeTab === 'PRIORITY' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            빠른수행 위젯 우선순위 노출 정책
          </h3>
          <div className="space-y-3">
            <ElmRad01
              selected={quickPriorityMode === 'TOP_ONE'}
              onSelect={() => setQuickPriorityMode('TOP_ONE')}
              label="최우선 1건 단독 노출 (당일 가장 마감이 임박한 과업)"
            />
            <ElmRad01
              selected={quickPriorityMode === 'ALL'}
              onSelect={() => setQuickPriorityMode('ALL')}
              label="설정별 전체 항목 카드 목록 노출 (당번, 목표 모두 펼쳐보기)"
            />
          </div>
        </section>
      )}

      {/* Tab 3: 알림 설정 */}
      {activeTab === 'NOTIFY' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            알림톡 및 푸시 알림 시간/주기
          </h3>
          <div className="space-y-3">
            <ElmInp01
              label="기본 일일 브리핑 알림 시간"
              type="time"
              value={notifyTime}
              onChange={setNotifyTime}
            />
            <ElmChk01
              checked={notifyGoals}
              onChange={setNotifyGoals}
              label="모아목표 일일 실천 리마인더 발송"
            />
            <ElmChk01
              checked={notifyDuties}
              onChange={setNotifyDuties}
              label="모아당번 순번 도래 및 대신수행 요청 시 알림"
            />
            <ElmChk01
              checked={notifyLoans}
              onChange={setNotifyLoans}
              label="모아머니 상환 만기 3일 전 D-Day 알림"
            />
          </div>
        </section>
      )}

      {/* Tab 4: 복수 계좌 관리 & 서비스별 목적성 매핑 (Zero-Friction) */}
      {activeTab === 'ACCOUNT' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  내 수신/이체 계좌 및 서비스별 목적성 매핑
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                계좌 등록은 선택 사항입니다. 계좌가 없어도 목표 실천, 당번, 가계부 분석 등 모든 서비스를 100% 이용하실 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAccountModal()}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>새 계좌 등록</span>
            </button>
          </div>

          {/* Zero-Friction 가이드 배너 */}
          <aside className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">안전한 사용자 주권 (Zero-Friction 원칙)</span>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                원치 않는 계좌 등록을 강제하지 않습니다. 상대방에게 이체 링크를 제공하거나 목표 용돈을 앱으로 송금받을 때에만 등록된 계좌가 안전하게 연계됩니다.
              </p>
            </div>
          </aside>

          {/* 인앱 토스트 알림 */}
          {copyToast && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
              {copyToast}
            </div>
          )}

          {/* 계좌 카드 목록 */}
          {userBankAccounts.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                등록된 계좌가 없습니다.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                계좌 등록 없이 자유롭게 모든 라이프 기능을 이용하실 수 있습니다.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAccountModal()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
              >
                + 첫 계좌 등록하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {userBankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    acc.isDefault
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-700/60 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* 카드 헤더 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate">
                        {acc.alias || `${acc.bankName} 계좌`}
                      </span>
                      {acc.isDefault ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] shrink-0 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          기본 대표
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAccount(acc.id)}
                          className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer shrink-0"
                        >
                          대표로 지정
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenAccountModal(acc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="계좌 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="계좌 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 계좌 정보 */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-300">
                        {acc.bankName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        예금주: <strong className="text-slate-800 dark:text-zinc-200">{acc.accountHolder}</strong>
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
                        {acc.accountNo}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(`${acc.bankName} ${acc.accountNo}`);
                          setCopyToast(`✓ ${acc.bankName} 계좌번호가 복사되었습니다.`);
                          setTimeout(() => setCopyToast(null), 2500);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                        title="계좌번호 복사"
                      >
                        <Copy className="w-3 h-3" />
                        <span>복사</span>
                      </button>
                    </div>
                  </div>

                  {/* 서비스별 목적성 태그 */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">연결 용도:</span>
                    {acc.assignedPurposes.map((p) => (
                      <span
                        key={p}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p === 'GOAL_ALLOWANCE'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : p === 'LEDGER_LIVING'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : p === 'SETTLE_MONEY'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {p === 'GOAL_ALLOWANCE'
                          ? '🎯 목표용돈'
                          : p === 'LEDGER_LIVING'
                          ? '🛒 생활비'
                          : p === 'SETTLE_MONEY'
                          ? '🍻 정산·회비'
                          : '📋 일반'}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 계좌 추가/수정 모달 */}
          {isAccountModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    {editingAccountId ? '계좌 정보 수정' : '새 수신/이체 계좌 등록'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
                  <ElmSel01
                    label="은행 선택"
                    value={formBankName}
                    onChange={setFormBankName}
                    options={[
                      { value: '카카오뱅크', label: '카카오뱅크 (090)' },
                      { value: '토스뱅크', label: '토스뱅크 (092)' },
                      { value: '국민은행', label: 'KB국민은행 (004)' },
                      { value: '신한은행', label: '신한은행 (088)' },
                      { value: '우리은행', label: '우리은행 (020)' },
                      { value: '하나은행', label: '하나은행 (081)' },
                      { value: 'NH농협', label: 'NH농협은행 (011)' },
                      { value: '케이뱅크', label: '케이뱅크 (089)' },
                    ]}
                  />

                  <ElmInp01
                    label="계좌번호"
                    value={formAccountNo}
                    onChange={setFormAccountNo}
                    placeholder="'-' 없이 숫자만 또는 번호 입력"
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    <ElmInp01
                      label="예금주"
                      value={formAccountHolder}
                      onChange={setFormAccountHolder}
                      placeholder="구본영"
                    />
                    <ElmInp01
                      label="계좌 별칭"
                      value={formAlias}
                      onChange={setFormAlias}
                      placeholder="예: 생활비 주통장"
                    />
                  </div>

                  {/* 연결 목적 체크박스 */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700 dark:text-zinc-300 block text-xs">
                      기본 연결 서비스 목적 (다중 선택 가능)
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                      {[
                        { id: 'GOAL_ALLOWANCE', label: '🎯 목표 보상·용돈' },
                        { id: 'LEDGER_LIVING', label: '🛒 가계부 생활비' },
                        { id: 'SETTLE_MONEY', label: '🍻 정산 및 회비' },
                        { id: 'GENERAL', label: '📋 일반 예비' },
                      ].map((item) => {
                        const checked = formPurposes.includes(item.id as AccountServicePurpose);
                        return (
                          <label key={item.id} className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormPurposes((prev) => [...prev, item.id as AccountServicePurpose]);
                                } else {
                                  setFormPurposes((prev) =>
                                    prev.length > 1
                                      ? prev.filter((p) => p !== item.id)
                                      : prev
                                  );
                                }
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    <ElmChk01
                      checked={formIsDefault}
                      onChange={setFormIsDefault}
                      label="★ 이 계좌를 기본 대표계좌로 지정"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAccountModalOpen(false)}
                      className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={!formAccountNo.trim()}
                      className="min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                    >
                      {editingAccountId ? '수정 완료' : '계좌 등록'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tab 5: 2차 OCR 인증키 */}
      {activeTab === 'OCR' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            2단계 사용자 OCR API 인증키 관리 (서버 운영비 0원)
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            1차 로컬 Docker EasyOCR 인식 불가 시, 사용자가 등록한 개인 Google Cloud Vision 또는 OpenAI Key로만 Fallback됩니다.
          </p>
          <div className="max-w-md space-y-3">
            <ElmInp01
              label="개인 Vision / OpenAI API Key"
              type="password"
              value={ocrKey}
              onChange={setOcrKey}
              placeholder="AIzaSy... 또는 sk-..."
            />
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">
              * 키는 브라우저 로컬 스토리지에 암호화되어 보관되며 서버 비용 0원을 달성합니다.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
