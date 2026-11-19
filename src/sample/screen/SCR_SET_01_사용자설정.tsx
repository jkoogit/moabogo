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
  ElmTre02,
  TreeNodeItem,
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
  FolderPlus,
  Folder,
  Tag,
  ArrowUpRight,
  Building2,
  LayoutGrid,
  List,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import {
  ModuleConfig,
  DashboardModuleId,
  DashboardPreset,
  DEFAULT_MODULES,
  PRESET_ORDER_MAP,
  PRESET_LABELS,
  loadDashboardModules,
  saveDashboardModules,
  applyDashboardPreset,
} from '../data/dashboardConfigPool';
import {
  SYSTEM_STORE_POOL,
  getSystemStorePool,
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
import {
  ExternalTransactionAccount,
  AccountServiceType,
  SERVICE_PURPOSE_LABELS,
  loadAccountTreeNodes,
  loadExternalAccounts,
  attachCountsToTree,
  addTreeNode,
  updateTreeNode,
  deleteTreeNode,
  moveTreeNode,
  addExternalAccount,
  updateExternalAccount,
  deleteExternalAccount,
  searchExternalAccounts,
  maskExternalAccountNo,
} from '../data/externalAccountStorePool';
import {
  loadFinancialCompliance,
  loadNotificationMatrix,
  loadSystemNotices,
} from '../data/systemGovernancePool';
export const SCR_SET_01_사용자설정: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('THEME');
  const [saveToast, setSaveToast] = useState(false);

  // 6.0 시스템 전역 거버넌스 정책 연동 (SSOT: systemGovernancePool)
  const [financialCompliance] = useState(() => loadFinancialCompliance());
  const [sysNotifyMatrix] = useState(() => loadNotificationMatrix());
  const [activeSystemNotices] = useState(() => loadSystemNotices().filter((n) => n.isEnabled));
  const [showNoticeBanner, setShowNoticeBanner] = useState<boolean>(true);

  // 6.1 대시보드 위젯 중앙 제어 풀 (SSOT: dashboardConfigPool)
  const [dashboardModules, setDashboardModules] = useState<ModuleConfig[]>(() => loadDashboardModules());
  const [selectedPreset, setSelectedPreset] = useState<DashboardPreset>('DEFAULT');
  const [selectedPreviewModule, setSelectedPreviewModule] = useState<ModuleConfig>(() => {
    const mods = loadDashboardModules();
    return mods[0] || DEFAULT_MODULES[0];
  });
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const handleToggleModule = (id: DashboardModuleId) => {
    setDashboardModules((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
      saveDashboardModules(updated);
      return updated;
    });
  };

  const handleMoveModule = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dashboardModules.length) return;

    setDashboardModules((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      saveDashboardModules(updated);
      return updated;
    });
  };

  const handleApplyPreset = (preset: DashboardPreset) => {
    setSelectedPreset(preset);
    const updated = applyDashboardPreset(preset, dashboardModules);
    setDashboardModules(updated);
    saveDashboardModules(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

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

  // 6.5 OCR 에이전트/엔진 및 개인 키
  const [ocrEngine, setOcrEngine] = useState<'GEMINI' | 'OPENAI' | 'CLAUDE' | 'CLOVA' | 'EASYOCR'>('GEMINI');
  const [ocrModel, setOcrModel] = useState<string>('gemini-2.0-flash');
  const [ocrKey, setOcrKey] = useState<string>(() => localStorage.getItem('moabogo_user_ocr_key') || 'sk-proj-user-sample-key-9981');
  const [showOcrKey, setShowOcrKey] = useState<boolean>(false);

  const handleSaveOcrKey = (newKey: string) => {
    setOcrKey(newKey);
    localStorage.setItem('moabogo_user_ocr_key', newKey);
    localStorage.setItem('moabogo_user_ocr_engine', ocrEngine);
    localStorage.setItem('moabogo_user_ocr_model', ocrModel);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // 6.7 외부 거래계좌 및 ELM-TRE-02 풀 연동 (BKL-ACC-11: 2-패널 관리 & 용도 Fallback)
  const [extAccounts, setExtAccounts] = useState<ExternalTransactionAccount[]>(() => loadExternalAccounts());
  const [rawTreeNodes, setRawTreeNodes] = useState<TreeNodeItem[]>(() => loadAccountTreeNodes());
  const extTreeNodes = attachCountsToTree(rawTreeNodes, extAccounts);
  const [selectedTreeNodeId, setSelectedTreeNodeId] = useState<string>('root');
  const [isTreeCollapsed, setIsTreeCollapsed] = useState<boolean>(false);
  const [treePanelWidth, setTreePanelWidth] = useState<number>(280);
  const [isResizingTree, setIsResizingTree] = useState<boolean>(false);
  const [viewLayoutMode, setViewLayoutMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchExtQuery, setSearchExtQuery] = useState<string>('');

  // 트리-컨텐츠 영역비율 조정 마우스 핸들러
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingTree(true);
    const startX = e.clientX;
    const startWidth = treePanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + delta));
      setTreePanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingTree(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 계좌 등록/수정 모달 (슬림 4대 정보)
  const [isExtModalOpen, setIsExtModalOpen] = useState(false);
  const [editingExtAccountId, setEditingExtAccountId] = useState<string | null>(null);
  const [formExtFolderId, setFormExtFolderId] = useState('fld-edu');
  const [formExtAccountHolder, setFormExtAccountHolder] = useState('');
  const [formExtBankName, setFormExtBankName] = useState('국민은행');
  const [formExtAccountNo, setFormExtAccountNo] = useState('');
  const [formExtDepositor, setFormExtDepositor] = useState('');
  const [formExtIsDefault, setFormExtIsDefault] = useState(false);
  const [formExtPurposes, setFormExtPurposes] = useState<AccountServiceType[]>(['LIVING']);
  const [formExtDisabledServices, setFormExtDisabledServices] = useState<AccountServiceType[]>([]);
  const [formExtMemo, setFormExtMemo] = useState('');

  // 트리 노드 CRUD 및 이동 핸들러
  const handleAddTreeNode = (parentId: string, name: string) => {
    addTreeNode(parentId, name);
    setRawTreeNodes(loadAccountTreeNodes());
  };

  const handleUpdateTreeNode = (nodeId: string, newName: string) => {
    updateTreeNode(nodeId, newName);
    setRawTreeNodes(loadAccountTreeNodes());
  };

  const handleDeleteTreeNode = (nodeId: string) => {
    const res = deleteTreeNode(nodeId);
    if (res.success) {
      setRawTreeNodes(loadAccountTreeNodes());
      if (selectedTreeNodeId === nodeId) setSelectedTreeNodeId('root');
    }
    return res;
  };

  const handleMoveTreeNode = (draggedId: string, targetId: string, position: 'inside' | 'before' | 'after') => {
    moveTreeNode(draggedId, targetId, position);
    setRawTreeNodes(loadAccountTreeNodes());
  };

  // 계좌 CRUD
  const handleOpenExtModal = (acc?: ExternalTransactionAccount) => {
    if (acc) {
      setEditingExtAccountId(acc.id);
      setFormExtFolderId(acc.folderId);
      setFormExtAccountHolder(acc.accountHolder);
      setFormExtBankName(acc.bankName || '국민은행');
      setFormExtAccountNo(acc.accountNo || '');
      setFormExtDepositor(acc.depositor || '');
      setFormExtIsDefault(acc.isDefault);
      setFormExtPurposes(acc.assignedPurposes);
      setFormExtDisabledServices(acc.disabledServices);
      setFormExtMemo(acc.memo || '');
    } else {
      setEditingExtAccountId(null);
      setFormExtFolderId(selectedTreeNodeId !== 'root' ? selectedTreeNodeId : 'fld-edu');
      setFormExtAccountHolder('');
      setFormExtBankName('국민은행');
      setFormExtAccountNo('');
      setFormExtIsDefault(extAccounts.length === 0);
      setFormExtPurposes(extAccounts.length === 0 ? ['DEFAULT'] : ['LIVING']);
      setFormExtDisabledServices([]);
      setFormExtMemo('');
    }
    setIsExtModalOpen(true);
  };

  const handleSaveExtAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExtAccountHolder.trim()) return;

    if (editingExtAccountId) {
      const existing = extAccounts.find((a) => a.id === editingExtAccountId);
      if (existing) {
        const updated: ExternalTransactionAccount = {
          ...existing,
          folderId: formExtFolderId,
          accountHolder: formExtAccountHolder.trim(),
          bankName: formExtBankName.trim(),
          accountNo: formAccountNo.trim(),
          isDefault: formExtIsDefault,
          assignedPurposes: formExtPurposes,
          disabledServices: formExtDisabledServices,
          memo: formExtMemo.trim(),
        };
        updateExternalAccount(updated);
        setExtAccounts(loadExternalAccounts());
      }
    } else {
      addExternalAccount({
        folderId: formExtFolderId,
        accountHolder: formExtAccountHolder.trim(),
        bankName: formExtBankName.trim(),
        accountNo: formAccountNo.trim(),
        isDefault: formExtIsDefault,
        assignedPurposes: formExtPurposes,
        disabledServices: formExtDisabledServices,
        memo: formExtMemo.trim(),
      });
      setExtAccounts(loadExternalAccounts());
    }
    setIsExtModalOpen(false);
  };

  const handleDeleteExtAccount = (id: string) => {
    if (window.confirm('이 거래계좌를 삭제하시겠습니까?')) {
      deleteExternalAccount(id);
      setExtAccounts(loadExternalAccounts());
    }
  };

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
      {/* Section 1: Header (360px 2행 분리 표준 규칙 적용 & 불필요한 헤더 액션 제거) */}
      <section className="border-b border-slate-200 dark:border-zinc-800 pb-3">
        <ElmTyp01
          title="사용자 맞춤 설정"
          badge="SCR-SET-01"
          subtitle="대시보드 위젯 배치 • 화면 테마 • 단골 매장 • 거래계좌 • 알림 • OCR 키 중앙 집중 제어"
        />
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

      {/* 플랫폼 전역 공지 배너 연동 (systemGovernancePool 동기화) */}
      {activeSystemNotices.length > 0 && showNoticeBanner && (
        <aside className="p-3.5 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 text-slate-900 dark:text-zinc-100 text-xs flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white">
                  플랫폼 긴급 공지
                </span>
                <span>{activeSystemNotices[0].title}</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                {activeSystemNotices[0].content}
              </p>
              {activeSystemNotices[0].hasButton && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
                    {activeSystemNotices[0].buttonText}
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNoticeBanner(false)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
            title="공지 닫기"
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
              { id: 'EXT_ACCOUNT', label: '거래계좌' },
              { id: 'LAYOUT', label: '화면배치' },
              { id: 'PRIORITY', label: '우선순위' },
              { id: 'NOTIFY', label: '알림설정' },
              { id: 'ACCOUNT', label: '송금계좌(내 계좌)' },
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
            {getSystemStorePool().filter((s) => {
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

      {/* Tab: 외부 거래계좌 관리 (ELM-TRE-02 2-패널 & 용도 Fallback - BKL-ACC-11) */}
      {activeTab === 'EXT_ACCOUNT' && (
        <section className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col space-y-0">
          {/* 1. 상단 타이틀 & 글로벌 액션 바 */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/40">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <Building2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>거래계좌 관리</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 whitespace-nowrap shrink-0">
                  ELM-TRE-02
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                  기본 Fallback & 킬스위치
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                좌측 트리 네비게이션으로 분류 탐색 • 기본 계좌 자동 상속(Fallback) • 서비스별 '미사용' 시 송금 버튼 자동 숨김
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenExtModal()}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>계좌 등록</span>
              </button>
            </div>
          </div>

          {/* 2. 메인 2-패널 컨테이너 (좌: ELM-TRE-02 트리, 중앙: 영역비율 리사이저, 우: 계좌 목록 컨텐츠) */}
          <div className="flex flex-col sm:flex-row min-h-[560px] relative">
            {/* 좌측 트리 컴포넌트 */}
            <ElmTre02
              nodes={extTreeNodes}
              selectedNodeId={selectedTreeNodeId}
              onSelectNode={setSelectedTreeNodeId}
              onAddNode={handleAddTreeNode}
              onUpdateNode={handleUpdateTreeNode}
              onDeleteNode={handleDeleteTreeNode}
              onMoveNode={handleMoveTreeNode}
              isCollapsed={isTreeCollapsed}
              onToggleCollapse={() => setIsTreeCollapsed(!isTreeCollapsed)}
              style={!isTreeCollapsed ? { width: `${treePanelWidth}px` } : undefined}
            />

            {/* 영역 비율 조정 리사이저 (데스크톱 전용) */}
            {!isTreeCollapsed && (
              <div
                onMouseDown={handleMouseDownResize}
                onDoubleClick={() => setTreePanelWidth(280)}
                className={`hidden sm:flex items-center justify-center w-2 -ml-1 cursor-col-resize z-20 group relative transition-colors select-none ${
                  isResizingTree ? 'bg-indigo-600' : 'hover:bg-indigo-400/80 bg-transparent'
                }`}
                title="드래그하여 트리/컨텐츠 영역 비율 조정 (더블클릭 시 280px 리셋)"
              >
                <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
              </div>
            )}

            {/* 우측 계좌 목록 및 검색 컨텐츠 영역 */}
            <main className="flex-1 p-4 sm:p-5 flex flex-col space-y-4 min-w-0">
              {/* 3.1 & 3.2 검색 바 및 뷰모드 툴바 */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* 검색 인풋 */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchExtQuery}
                    onChange={(e) => setSearchExtQuery(e.target.value)}
                    placeholder="계좌명칭, 예금주, 은행, 번호, 메모 검색..."
                    className="w-full min-h-[40px] pl-10 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                  {searchExtQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchExtQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* 뷰 모드 전환 토글 (카드보기 / 목록보기) */}
                <div className="hidden sm:flex items-center gap-1 self-end sm:self-auto border border-slate-200 dark:border-zinc-700 rounded-xl p-1 bg-slate-50 dark:bg-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setViewLayoutMode('GRID')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewLayoutMode === 'GRID'
                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                    title="카드 그리드 뷰"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayoutMode('LIST')}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewLayoutMode === 'LIST'
                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                    title="목록 테이블 뷰"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>



              {/* 복사 토스트 알림 */}
              {copyToast && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
                  {copyToast}
                </div>
              )}

              {/* 계좌 목록 컨텐츠 렌더링 */}
              {(() => {
                const filtered = searchExternalAccounts(searchExtQuery, selectedTreeNodeId);

                if (filtered.length === 0) {
                  return (
                    <div className="py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                        <Folder className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        선택된 분류에 등록된 거래계좌가 없습니다.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenExtModal()}
                        className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        + 이 분류에 새 계좌 등록하기
                      </button>
                    </div>
                  );
                }

                // 카드 그리드 뷰 렌더러
                const renderCardGridView = () => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filtered.map((acc) => (
                      <div
                        key={acc.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          acc.isDefault
                            ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/60 shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700/60'
                        }`}
                      >
                        {/* 카드 상단 */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate">
                                {acc.accountHolder}
                              </h4>
                              {acc.isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] shrink-0 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  기본대표
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-bold">
                                ⚡ {acc.usageCount}회 기장
                              </span>
                            </div>

                            {/* 용도 뱃지 목록 */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {acc.assignedPurposes.map((p) => {
                                const info = SERVICE_PURPOSE_LABELS[p];
                                return (
                                  <span
                                    key={p}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-0.5"
                                  >
                                    <span>{info?.icon}</span>
                                    <span>{info?.label}</span>
                                  </span>
                                );
                              })}
                              {acc.disabledServices.map((d) => (
                                <span
                                  key={d}
                                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                >
                                  {SERVICE_PURPOSE_LABELS[d]?.label}: 미사용 (숨김)
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 액션 */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenExtModal(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="계좌 수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExtAccount(acc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="계좌 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 계좌번호 정보 박스 */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs space-y-1">
                          {acc.accountNo ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                                🏦 {acc.bankName} {maskExternalAccountNo(acc.accountNo)}
                                {acc.depositor && <span className="font-sans font-normal text-slate-500 ml-1.5">(예금주: {acc.depositor})</span>}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(acc.accountNo);
                                  setCopyToast(`✓ "${acc.accountHolder}" 계좌번호가 복사되었습니다.`);
                                  setTimeout(() => setCopyToast(null), 2500);
                                }}
                                className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-bold border border-slate-200 dark:border-zinc-600 hover:bg-slate-50 cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                              >
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic">
                              계좌번호 미등록 (상호명으로 간편 기장)
                            </div>
                          )}

                          {acc.memo && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                              💬 {acc.memo}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );

                // 2. 모바일 모드에서는 항상 카드보기 고정, 데스크톱(sm 이상)에서만 LIST 전환 지원
                if (viewLayoutMode === 'LIST') {
                  return (
                    <>
                      {/* 모바일 화면: 카드보기 고정 */}
                      <div className="block sm:hidden">
                        {renderCardGridView()}
                      </div>
                      {/* 데스크톱 화면: 목록 테이블 뷰 */}
                      <div className="hidden sm:block border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900/60">
                      {filtered.map((acc) => (
                        <div
                          key={acc.id}
                          className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">
                                {acc.accountHolder}
                              </span>
                              {acc.isDefault && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  기본대표
                                </span>
                              )}
                              {acc.assignedPurposes.map((p) => {
                                const info = SERVICE_PURPOSE_LABELS[p];
                                return (
                                  <span
                                    key={p}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                  >
                                    {info?.icon} {info?.label}
                                  </span>
                                );
                              })}
                              {acc.disabledServices.map((d) => (
                                <span
                                  key={d}
                                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                >
                                  {SERVICE_PURPOSE_LABELS[d]?.label}: 미사용
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                              {acc.accountNo ? (
                                <span>🏦 {acc.bankName} {maskExternalAccountNo(acc.accountNo)}</span>
                              ) : (
                                <span className="text-slate-400">Zero-Friction (계좌번호 미등록)</span>
                              )}
                              {acc.memo && <span className="text-slate-400 font-sans truncate">| {acc.memo}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {acc.accountNo && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(acc.accountNo);
                                  setCopyToast(`✓ "${acc.accountHolder}" 계좌번호가 복사되었습니다.`);
                                  setTimeout(() => setCopyToast(null), 2500);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                <span>복사</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenExtModal(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                              title="수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExtAccount(acc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      </div>
                    </>
                  );
                }

                // Grid View
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filtered.map((acc) => (
                      <div
                        key={acc.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          acc.isDefault
                            ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/60 shadow-xs'
                            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700/60'
                        }`}
                      >
                        {/* 카드 상단 */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate">
                                {acc.accountHolder}
                              </h4>
                              {acc.isDefault && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] shrink-0 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                  기본대표
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-bold">
                                ⚡ {acc.usageCount}회 기장
                              </span>
                            </div>

                            {/* 용도 뱃지 목록 */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {acc.assignedPurposes.map((p) => {
                                const info = SERVICE_PURPOSE_LABELS[p];
                                return (
                                  <span
                                    key={p}
                                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-0.5"
                                  >
                                    <span>{info?.icon}</span>
                                    <span>{info?.label}</span>
                                  </span>
                                );
                              })}
                              {acc.disabledServices.map((d) => (
                                <span
                                  key={d}
                                  className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                >
                                  {SERVICE_PURPOSE_LABELS[d]?.label}: 미사용 (숨김)
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* 액션 */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenExtModal(acc)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                              title="계좌 수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExtAccount(acc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="계좌 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* 계좌번호 정보 박스 */}
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs space-y-1">
                          {acc.accountNo ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                                🏦 {acc.bankName} {maskExternalAccountNo(acc.accountNo)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(acc.accountNo);
                                  setCopyToast(`✓ "${acc.accountHolder}" 계좌번호가 복사되었습니다.`);
                                  setTimeout(() => setCopyToast(null), 2500);
                                }}
                                className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-bold border border-slate-200 dark:border-zinc-600 hover:bg-slate-100 flex items-center gap-0.5 cursor-pointer"
                              >
                                <Copy className="w-2.5 h-2.5" />
                                복사
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-semibold">
                                Zero-Friction
                              </span>
                              <span>계좌번호 미등록 (간편 기장용 상호)</span>
                            </div>
                          )}
                        </div>

                        {/* 메모 */}
                        {acc.memo && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/60 truncate">
                            📝 {acc.memo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </main>
          </div>
        </section>
      )}

      {/* 슬림형 거래계좌 등록/수정 모달 */}
      {isExtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                  {editingExtAccountId ? '거래계좌 정보 수정' : '거래계좌 등록'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsExtModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveExtAccount} className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* 1. 소속 분류 선택 */}
              <ElmSel01
                label="소속 분류 폴더"
                value={formExtFolderId}
                onChange={setFormExtFolderId}
                options={[
                  { value: 'fld-edu', label: '🏫 교육/학원' },
                  { value: 'fld-edu-math', label: '  └ 📐 수학/과학' },
                  { value: 'fld-edu-lang', label: '  └ 🔤 어학/교습' },
                  { value: 'fld-living', label: '🛒 생활/마트' },
                  { value: 'fld-health', label: '🏥 의료/건강' },
                  { value: 'fld-club', label: '👥 모임/회비' },
                  { value: 'fld-food', label: '☕ 단골/식음료' },
                  { value: 'fld-etc', label: '🏢 기타/비회원' },
                ]}
              />

              {/* 2. 계좌 명칭 / 상호 (필수) */}
              <ElmInp01
                label="계좌 명칭 / 상호 (필수)"
                value={formExtAccountHolder}
                onChange={setFormExtAccountHolder}
                placeholder="예: 미래수학학원, (주)이마트 역삼점, 주말러닝크루"
              />

              {/* 3. 은행 계좌 정보 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  <span>은행 계좌 정보</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <ElmSel01
                    label="은행명"
                    value={formExtBankName}
                    onChange={setFormExtBankName}
                    options={[
                      { value: '국민은행', label: '국민은행' },
                      { value: '신한은행', label: '신한은행' },
                      { value: '카카오뱅크', label: '카카오뱅크' },
                      { value: '토스뱅크', label: '토스뱅크' },
                      { value: '하나은행', label: '하나은행' },
                      { value: '우리은행', label: '우리은행' },
                      { value: 'NH농협', label: 'NH농협' },
                      { value: '기업은행', label: '기업은행' },
                      { value: '기타은행', label: '기타' },
                    ]}
                  />

                  <ElmInp01
                    label="계좌번호 (선택)"
                    value={formExtAccountNo}
                    onChange={setFormExtAccountNo}
                    placeholder="'-' 없이 숫자 입력"
                  />

                  <ElmInp01
                    label="예금주명 (선택)"
                    value={formExtDepositor}
                    onChange={setFormExtDepositor}
                    placeholder="예: 김원장"
                  />
                </div>
              </div>

              {/* 4. 용도 설정 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    용도 설정
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formExtIsDefault}
                      onChange={(e) => setFormExtIsDefault(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      기본 대표 계좌로 지정
                    </span>
                  </label>
                </div>

                {/* 4.2 기본 대표 계좌 지정 시 선행 계좌 안내 메시지 */}
                {formExtIsDefault && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 font-medium animate-in fade-in">
                    {(() => {
                      const prevDefault = extAccounts.find((a) => a.isDefault && a.id !== editingExtAccountId);
                      if (prevDefault) {
                        return `ℹ️ 현재 기본 대표 계좌: [${prevDefault.accountHolder}${prevDefault.bankName ? ` (${prevDefault.bankName})` : ''}] ➔ 등록 완료 시 이 계좌가 새로운 기본 대표 계좌로 지정됩니다.`;
                      }
                      return '✓ 이 계좌가 첫 번째 기본 대표 계좌로 지정됩니다. (등록 완료 시 반영)';
                    })()}
                  </div>
                )}
                
                {/* 개별 서비스 용도 토글 칩 */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-zinc-400">
                    이 계좌가 적용될 서비스 용도:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['ALLOWANCE', 'LIVING', 'MEETING', 'GOAL_CHEER'] as AccountServiceType[]).map((srv) => {
                      const isAssigned = formExtPurposes.includes(srv);
                      const info = SERVICE_PURPOSE_LABELS[srv];
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => {
                            if (isAssigned) {
                              setFormExtPurposes(formExtPurposes.filter((p) => p !== srv));
                            } else {
                              setFormExtPurposes([...formExtPurposes, srv]);
                              setFormExtDisabledServices(formExtDisabledServices.filter((d) => d !== srv));
                            }
                          }}
                          className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isAssigned
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 미사용 킬스위치 설정 */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-700 space-y-1.5">
                  <label className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <span>🚨 '미사용' 킬스위치 설정 (화면에서 송금 버튼 숨김):</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['GOAL_CHEER', 'ALLOWANCE'] as AccountServiceType[]).map((srv) => {
                      const isKill = formExtDisabledServices.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => {
                            if (isKill) {
                              setFormExtDisabledServices(formExtDisabledServices.filter((d) => d !== srv));
                            } else {
                              setFormExtDisabledServices([...formExtDisabledServices, srv]);
                              setFormExtPurposes(formExtPurposes.filter((p) => p !== srv));
                            }
                          }}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isKill
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          {isKill ? '✓ ' : ''}{SERVICE_PURPOSE_LABELS[srv].label} 미사용 (숨김)
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. 메모 */}
              <ElmInp01
                label="메모 / 특이사항 (선택)"
                value={formExtMemo}
                onChange={setFormExtMemo}
                placeholder="예: 매월 25일 자동이체, 실비보험 청구용"
              />

              {/* 버튼 바 */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExtModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {editingExtAccountId ? '수정 저장' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Tab 3: 화면배치 (대시보드 위젯 중앙 제어 & 프리셋 & 썸네일 미리보기) */}
      {activeTab === 'LAYOUT' && (
        <section className="space-y-5">
          {/* 1. 추천 프리셋 퀵 선택 바 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>대시보드 추천 배치 프리셋</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  라이프스타일에 맞게 위젯 순서를 원클릭으로 최적화합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApplyPreset('DEFAULT')}
                className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="기본값으로 되돌리기"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>초기화</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(['DEFAULT', 'FINANCE_FIRST', 'LIFE_FIRST', 'QUICK_GAME'] as DashboardPreset[]).map((presetKey) => {
                const info = PRESET_LABELS[presetKey];
                const isSelected = selectedPreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => handleApplyPreset(presetKey)}
                    className={`min-h-[44px] p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-slate-50/50 dark:bg-[#0E131F]/50 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                          {info.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {info.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 위젯 순서 및 On/Off 중앙 제어 + 썸네일 미리보기 2-패널 (반응형) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 좌측 패널: 위젯 목록 및 순서 조정 / 활성화 토글 (7열) */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200">
                  위젯 노출 순서 및 표시 설정 ({dashboardModules.filter((m) => m.enabled).length}/{dashboardModules.length}개 표시)
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  ↑↓ 화살표로 순서 이동
                </span>
              </div>

              <div className="space-y-2">
                {dashboardModules.map((module, idx) => {
                  const isSelected = selectedPreviewModule.id === module.id;
                  return (
                    <div
                      key={module.id}
                      onClick={() => setSelectedPreviewModule(module)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                          : 'border-slate-200/90 dark:border-zinc-800 bg-slate-50/30 dark:bg-[#111726]/40 hover:bg-slate-50 dark:hover:bg-[#162035]'
                      }`}
                    >
                      {/* Left: Drag Index + Title & Category */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-[11px] font-black flex items-center justify-center text-slate-600 dark:text-zinc-400 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                              {module.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0">
                              {module.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 max-w-[220px] sm:max-w-[280px]">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions (Move Up/Down + Toggle Switch) */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveModule(idx, 'UP')}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="위로 이동"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === dashboardModules.length - 1}
                          onClick={() => handleMoveModule(idx, 'DOWN')}
                          className="min-h-[34px] min-w-[34px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                          title="아래로 이동"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleModule(module.id)}
                          className={`min-h-[34px] px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            module.enabled
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 border-slate-300 dark:border-zinc-700'
                          }`}
                        >
                          {module.enabled ? '표시' : '숨김'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 우측 패널: 선택된 위젯의 썸네일 / 샘플 시각화 미리보기 카드 (5열) */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>위젯 미리보기 뷰어</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {selectedPreviewModule.category}
                  </span>
                </div>

                {/* 위젯 샘플 비주얼 썸네일 카드 */}
                <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-[#0B0F17] dark:to-indigo-950/20 border border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                      {selectedPreviewModule.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      selectedPreviewModule.enabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {selectedPreviewModule.enabled ? '● 현재 활성' : '○ 숨김 상태'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-zinc-300">
                    {selectedPreviewModule.description}
                  </p>

                  {/* 상세 기능 특징 목록 */}
                  {selectedPreviewModule.detailFeatures && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">
                        주요 기능 구성
                      </span>
                      {selectedPreviewModule.detailFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 하단 동기화 상태 배너 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                <span>✓ 변경 사항은 로그인 메인 대시보드에 즉시 실시간 동기화됩니다.</span>
              </div>
            </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>알림톡 및 푸시 알림 시간/주기 설정</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                플랫폼 12종 알림 매트릭스 거버넌스 정책과 연동된 개인화 수신 옵션을 설정합니다.
              </p>
            </div>
            {sysNotifyMatrix.requireVerifiedEmailOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>인증된 이메일 한정 발송 중</span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            <ElmInp01
              label="기본 일일 브리핑 알림 시간"
              type="time"
              value={notifyTime}
              onChange={setNotifyTime}
            />
            <ElmChk01
              checked={sysNotifyMatrix.goalScheduleReminder ? notifyGoals : false}
              onChange={setNotifyGoals}
              disabled={!sysNotifyMatrix.goalScheduleReminder}
              label="모아목표 일일 실천 리마인더 발송"
              description={
                !sysNotifyMatrix.goalScheduleReminder
                  ? '※ 시스템 관리자 정책에 의해 전체 발송이 일시 중단되었습니다.'
                  : '매일 설정한 브리핑 시간에 목표 실천 현황을 전달합니다.'
              }
            />
            <ElmChk01
              checked={sysNotifyMatrix.dutyActionRequest ? notifyDuties : false}
              onChange={setNotifyDuties}
              disabled={!sysNotifyMatrix.dutyActionRequest}
              label="모아당번 순번 도래 및 대신수행 요청 시 알림"
              description={
                !sysNotifyMatrix.dutyActionRequest
                  ? '※ 시스템 관리자 정책에 의해 전체 발송이 일시 중단되었습니다.'
                  : '당번 순번 도래 및 대신수행 요청 발생 시 즉시 푸시를 수신합니다.'
              }
            />
            <ElmChk01
              checked={sysNotifyMatrix.moneySettleProcessed ? notifyLoans : false}
              onChange={setNotifyLoans}
              disabled={!sysNotifyMatrix.moneySettleProcessed}
              label="모아머니 상환 만기 3일 전 D-Day 알림"
              description={
                !sysNotifyMatrix.moneySettleProcessed
                  ? '※ 시스템 관리자 정책에 의해 전체 발송이 일시 중단되었습니다.'
                  : '모아머니 정산 및 상환 만기 도래 시 사전에 알림을 수신합니다.'
              }
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

          {/* 금융 컴플라이언스 가드레일 정책 배너 (systemGovernancePool 동기화) */}
          {financialCompliance &&
            (!financialCompliance.enableRemitUrlGeneration ||
              !financialCompliance.allowGoalCheerRemit ||
              !financialCompliance.allowMoaMoneyRemit ||
              financialCompliance.blockForeignIpRemit) && (
              <aside className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5 flex-wrap">
                    <span>금융 컴플라이언스 송금 가드레일 정책 적용 중</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                      일일 송금 추천 상한: ₩{financialCompliance.maxDailyRemitLimit.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    {!financialCompliance.enableRemitUrlGeneration
                      ? '플랫폼 보안 정책에 따라 간편송금 URL 생성이 전역 차단되어 있습니다. 계좌번호 복사 및 일반 이체를 이용해 주세요.'
                      : `플랫폼 보안 정책에 따라 일부 송금(목표응원: ${
                          financialCompliance.allowGoalCheerRemit ? '허용' : '제한'
                        }, 모아머니: ${
                          financialCompliance.allowMoaMoneyRemit ? '허용' : '제한'
                        }) 및 해외 IP 접속이 통제 중입니다.`}
                  </p>
                  {financialCompliance.complianceNotice && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                      ※ 안내: {financialCompliance.complianceNotice}
                    </p>
                  )}
                </div>
              </aside>
            )}

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

      {/* Tab 8: OCR 에이전트 엔진 및 개인 API 키 관리 */}
      {activeTab === 'OCR' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>AI 에이전트 & 사용자 OCR API 인증키 관리 (서버비 0원)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              1차 로컬 Docker EasyOCR 인식 실패 시, 사용자가 직접 등록한 개인 클라우드 AI 비전 모델로 즉시 Fallback됩니다.
            </p>
          </div>

          <div className="max-w-xl space-y-4">
            {/* 1. OCR 엔진 / AI 에이전트 공급자 선택 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                OCR 비전 엔진 선택
              </label>
              <select
                value={ocrEngine}
                onChange={(e) => {
                  const eng = e.target.value as any;
                  setOcrEngine(eng);
                  if (eng === 'GEMINI') setOcrModel('gemini-2.0-flash');
                  else if (eng === 'OPENAI') setOcrModel('gpt-4o');
                  else if (eng === 'CLAUDE') setOcrModel('claude-3-5-sonnet-20241022');
                  else if (eng === 'CLOVA') setOcrModel('clova-ocr-receipt');
                  else if (eng === 'EASYOCR') setOcrModel('easyocr-v1-korean');
                }}
                className="w-full h-11 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="GEMINI">Google Gemini 2.0 (추천 • 초고속 멀티모달 & 무료 티어)</option>
                <option value="OPENAI">OpenAI GPT-4o (고정밀 영수증 OCR & 복합 테이블 분석)</option>
                <option value="CLAUDE">Anthropic Claude 3.5 Sonnet (세부 항목 및 품목 추론)</option>
                <option value="CLOVA">Naver CLOVA OCR (한국어 세금계산서/간이영수증 특화)</option>
                <option value="EASYOCR">Docker EasyOCR (홈서버 온디바이스 기본 내장 무료)</option>
              </select>
            </div>

            {/* 2. 엔진별 세부 모델 선택 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                세부 AI 모델 선택
              </label>
              <select
                value={ocrModel}
                onChange={(e) => setOcrModel(e.target.value)}
                className="w-full h-11 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              >
                {ocrEngine === 'GEMINI' && (
                  <>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (초저지연 영수증 파싱 권장)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (대형 복합 계산서 심층 추론)</option>
                  </>
                )}
                {ocrEngine === 'OPENAI' && (
                  <>
                    <option value="gpt-4o">gpt-4o (최고 정밀도 Vision)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (경량 고속 파싱)</option>
                  </>
                )}
                {ocrEngine === 'CLAUDE' && (
                  <>
                    <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
                    <option value="claude-3-5-haiku-20241022">claude-3-5-haiku-20241022</option>
                  </>
                )}
                {ocrEngine === 'CLOVA' && (
                  <>
                    <option value="clova-ocr-receipt">clova-ocr-receipt (영수증 특화 도메인)</option>
                    <option value="clova-ocr-general">clova-ocr-general (일반 인쇄물)</option>
                  </>
                )}
                {ocrEngine === 'EASYOCR' && (
                  <option value="easyocr-v1-korean">easyocr-v1-korean (로컬 파이프라인)</option>
                )}
              </select>
            </div>

            {/* 3. 개인 API 키 입력 필드 (눈 아이콘 토글 미리보기 지원) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                개인 API 인증키 (Personal API Key)
              </label>
              <div className="relative">
                <input
                  type={showOcrKey ? 'text' : 'password'}
                  value={ocrKey}
                  onChange={(e) => handleSaveOcrKey(e.target.value)}
                  placeholder="API Key를 입력하세요 (예: AIzaSy... 또는 sk-...)"
                  className="w-full h-11 pl-3.5 pr-12 text-xs font-mono rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowOcrKey((prev) => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 cursor-pointer transition-colors"
                  title={showOcrKey ? 'API 키 숨기기' : 'API 키 확인 (눈 아이콘)'}
                  aria-label="API 키 미리보기 토글"
                >
                  {showOcrKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 4. 무과금 0원 보안 안내 카드 */}
            <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-[11px] text-slate-600 dark:text-zinc-300">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>개인정보 보호 및 서버 비용 0원 원칙</span>
              </div>
              <p className="leading-relaxed">
                • 등록된 개인 API 키는 서버 중앙 데이터베이스에 전송되지 않으며, 사용자 브라우저의 IndexedDB/LocalStorage에 암호화 보관됩니다.
              </p>
              <p className="leading-relaxed">
                • 영수증 촬영 시 클라이언트에서 직접 AI 모델에 요청하여 서버 운영비 0원을 영구 달성합니다.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
