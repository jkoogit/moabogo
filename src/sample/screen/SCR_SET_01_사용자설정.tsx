import React, { useState, useEffect } from 'react';
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
  Gamepad2,
  FileSpreadsheet,
  Download,
  Upload,
  CheckSquare,
  Square,
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
  UserLadderPreset,
  UserRoulettePreset,
  LadderGoalPreset,
  RoulettePreset,
  loadUserCustomStores,
  saveUserCustomStores,
  getAllAvailableStorePool,
  loadUserPersonalLadderPresets,
  saveUserPersonalLadderPresets,
  loadUserPersonalRoulettePresets,
  saveUserPersonalRoulettePresets,
  copySystemLadderPresetsToUser,
  copySystemRoulettePresetsToUser,
  downloadStoreExcelTemplate,
  parseStoreCsvData,
  exportUserStoresToCsv,
} from '../data/systemStorePool';
import {
  loadSystemLadderPresets,
  loadSystemRoulettePresets,
} from '../data/systemGovernancePool';
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

  // 6.6 단골 매장 관리 및 게임 프리셋 개인화 연동
  const [storeSubTab, setStoreSubTab] = useState<'STORES' | 'LADDER_PRESETS' | 'ROULETTE_PRESETS'>('STORES');
  const [userStorePref, setUserStorePref] = useState<UserStorePreference>(() => loadUserStorePreference());
  const [customStores, setCustomStores] = useState<StorePreset[]>(() => loadUserCustomStores());
  const [personalLadderPresets, setPersonalLadderPresets] = useState<UserLadderPreset[]>(() => loadUserPersonalLadderPresets());
  const [personalRoulettePresets, setPersonalRoulettePresets] = useState<UserRoulettePreset[]>(() => loadUserPersonalRoulettePresets());
  const [systemLadderList, setSystemLadderList] = useState<LadderGoalPreset[]>(() => loadSystemLadderPresets());
  const [systemRouletteList, setSystemRouletteList] = useState<RoulettePreset[]>(() => loadSystemRoulettePresets());

  const [selectedMenuStore, setSelectedMenuStore] = useState<StorePreset | null>(null);
  const [menuModalCategory, setMenuModalCategory] = useState<string>('전체');
  const [storeFilterCategory, setStoreFilterCategory] = useState<string>('전체');

  // 모달 상태
  const [isStoreManualModalOpen, setIsStoreManualModalOpen] = useState<boolean>(false);
  const [editingCustomStore, setEditingCustomStore] = useState<StorePreset | null>(null);
  const [isStoreExcelModalOpen, setIsStoreExcelModalOpen] = useState<boolean>(false);
  const [excelInputText, setExcelInputText] = useState<string>('');
  const [excelErrorMsg, setExcelErrorMsg] = useState<string>('');

  const [isLadderImportModalOpen, setIsLadderImportModalOpen] = useState<boolean>(false);
  const [selectedSystemLadderIds, setSelectedSystemLadderIds] = useState<string[]>([]);
  const [isLadderManualModalOpen, setIsLadderManualModalOpen] = useState<boolean>(false);
  const [editingLadderPreset, setEditingLadderPreset] = useState<UserLadderPreset | null>(null);

  const [isRouletteImportModalOpen, setIsRouletteImportModalOpen] = useState<boolean>(false);
  const [selectedSystemRouletteIds, setSelectedSystemRouletteIds] = useState<string[]>([]);
  const [isRouletteManualModalOpen, setIsRouletteManualModalOpen] = useState<boolean>(false);
  const [editingRoulettePreset, setEditingRoulettePreset] = useState<UserRoulettePreset | null>(null);

  // 3-a,b. 기초 매장 추가 아코디언 토글 상태
  const [showBaseStoreSection, setShowBaseStoreSection] = useState<boolean>(false);
  // 메뉴판 모달 내 메뉴 수동 추가 폼 토글 및 상태
  const [showAddMenuForm, setShowAddMenuForm] = useState<boolean>(false);
  const [newMenuName, setNewMenuName] = useState<string>('');
  const [newMenuPrice, setNewMenuPrice] = useState<number>(5000);
  const [newMenuCat, setNewMenuCat] = useState<string>('대표');
  const [newMenuDesc, setNewMenuDesc] = useState<string>('');
  const [showMenuCsvInput, setShowMenuCsvInput] = useState<boolean>(false);
  const [menuCsvText, setMenuCsvText] = useState<string>('');

  // 로컬 스토리지 변경 시 동기화
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomStores(loadUserCustomStores());
      setPersonalLadderPresets(loadUserPersonalLadderPresets());
      setPersonalRoulettePresets(loadUserPersonalRoulettePresets());
      setSystemLadderList(loadSystemLadderPresets());
      setSystemRouletteList(loadSystemRoulettePresets());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 1. 매장 수동 등록/수정/삭제
  const handleSaveCustomStore = (storeData: StorePreset) => {
    const exists = customStores.some((s) => s.id === storeData.id);
    let updated: StorePreset[];
    if (exists) {
      updated = customStores.map((s) => (s.id === storeData.id ? storeData : s));
    } else {
      updated = [storeData, ...customStores];
    }
    setCustomStores(updated);
    saveUserCustomStores(updated);
    // 내 매장에도 자동 등록
    if (!userStorePref.myStoreIds.includes(storeData.id)) {
      const nextPref = {
        ...userStorePref,
        myStoreIds: [...userStorePref.myStoreIds, storeData.id],
      };
      setUserStorePref(nextPref);
      saveUserStorePreference(nextPref);
    }
    setIsStoreManualModalOpen(false);
    setEditingCustomStore(null);
  };

  const handleDeleteCustomStore = (storeId: string) => {
    if (window.confirm('등록한 맞춤 매장을 삭제하시겠습니까?')) {
      const updated = customStores.filter((s) => s.id !== storeId);
      setCustomStores(updated);
      saveUserCustomStores(updated);
      const nextPref = {
        selectedStoreId: userStorePref.selectedStoreId === storeId ? (updated[0]?.id || 'sys_store_pluscafe_45f') : userStorePref.selectedStoreId,
        myStoreIds: userStorePref.myStoreIds.filter((id) => id !== storeId),
      };
      setUserStorePref(nextPref);
      saveUserStorePreference(nextPref);
    }
  };

  // 3-c. 기초 매장 복사 등록 (매장만 등록 or 매장+메뉴 등록)
  const handleRegisterBaseStore = (baseStore: StorePreset, includeMenus: boolean) => {
    const newId = `usr_store_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const clonedMenus: StoreMenuItem[] = includeMenus
      ? baseStore.menus.map((m) => ({ ...m, id: `m_c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` }))
      : [];
    const newStore: StorePreset = {
      ...JSON.parse(JSON.stringify(baseStore)),
      id: newId,
      name: `${baseStore.name}${includeMenus ? '' : ' (직접메뉴)'}`,
      menus: clonedMenus,
      menuCategories: includeMenus ? baseStore.menuCategories : ['대표메뉴'],
      isPresetDefault: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [newStore, ...customStores];
    setCustomStores(updated);
    saveUserCustomStores(updated);

    const nextPref = {
      ...userStorePref,
      myStoreIds: [...userStorePref.myStoreIds, newId],
    };
    setUserStorePref(nextPref);
    saveUserStorePreference(nextPref);
    alert(`'${baseStore.name}' 매장이 ${includeMenus ? '메뉴 포함하여' : '매장 정보만'} 성공적으로 내 매장에 등록되었습니다.`);
  };

  // 3-f. 등록된 매장 목록 엑셀 다운로드
  const handleExportStoresCsv = () => {
    const storesToExport = getAllAvailableStorePool().filter((s) => userStorePref.myStoreIds.includes(s.id) || customStores.some((c) => c.id === s.id));
    if (storesToExport.length === 0) {
      alert('내보낼 매장 정보가 없습니다.');
      return;
    }
    exportUserStoresToCsv(storesToExport);
  };

  // 3-e. 메뉴판 모달 내 메뉴 추가 / 엑셀 추가 / 삭제
  const handleAddMenuToSelectedStore = () => {
    if (!selectedMenuStore || !newMenuName.trim()) return;
    const newMenu: StoreMenuItem = {
      id: `m_u_${Date.now()}`,
      name: newMenuName.trim(),
      price: newMenuPrice || 0,
      categoryName: newMenuCat.trim() || '대표메뉴',
      description: newMenuDesc.trim() || undefined,
      isSignature: false,
    };
    const updatedMenus = [...selectedMenuStore.menus, newMenu];
    const updatedCats = Array.from(new Set([...selectedMenuStore.menuCategories, newMenu.categoryName]));
    const updatedStore = {
      ...selectedMenuStore,
      menus: updatedMenus,
      menuCategories: updatedCats,
    };

    handleSaveCustomStore(updatedStore);
    setSelectedMenuStore(updatedStore);
    setNewMenuName('');
    setNewMenuDesc('');
    setShowAddMenuForm(false);
  };

  const handleDeleteMenuFromSelectedStore = (menuId: string) => {
    if (!selectedMenuStore) return;
    const updatedMenus = selectedMenuStore.menus.filter((m) => m.id !== menuId);
    const updatedStore = {
      ...selectedMenuStore,
      menus: updatedMenus,
    };
    handleSaveCustomStore(updatedStore);
    setSelectedMenuStore(updatedStore);
  };

  const handleImportMenuCsvToSelectedStore = () => {
    if (!selectedMenuStore || !menuCsvText.trim()) return;
    const lines = menuCsvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const newMenus: StoreMenuItem[] = [];
    const newCats = new Set(selectedMenuStore.menuCategories);

    for (const line of lines) {
      const parts = line.split(/[,:]/).map((s) => s.trim());
      if (parts[0]) {
        const name = parts[0];
        const price = parseInt(parts[1], 10) || 0;
        const cat = parts[2] || '대표메뉴';
        const desc = parts[3] || undefined;
        newCats.add(cat);
        newMenus.push({
          id: `m_csv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name,
          price,
          categoryName: cat,
          description: desc,
        });
      }
    }

    if (newMenus.length === 0) {
      alert('추가할 유효한 메뉴 데이터가 없습니다. (예: 아메리카노,4500,커피)');
      return;
    }

    const updatedStore = {
      ...selectedMenuStore,
      menus: [...selectedMenuStore.menus, ...newMenus],
      menuCategories: Array.from(newCats),
    };
    handleSaveCustomStore(updatedStore);
    setSelectedMenuStore(updatedStore);
    setMenuCsvText('');
    setShowMenuCsvInput(false);
    alert(`${newMenus.length}개의 메뉴가 성공적으로 일괄 추가되었습니다.`);
  };

  // 2. 사다리 프리셋 가져오기 / 직접등록 / 삭제
  const handleImportLadderPresets = () => {
    if (selectedSystemLadderIds.length === 0) return;
    const updated = copySystemLadderPresetsToUser(systemLadderList, selectedSystemLadderIds);
    setPersonalLadderPresets(updated);
    setIsLadderImportModalOpen(false);
    setSelectedSystemLadderIds([]);
  };

  const handleSavePersonalLadderPreset = (presetData: UserLadderPreset) => {
    const exists = personalLadderPresets.some((p) => p.id === presetData.id);
    let updated: UserLadderPreset[];
    if (exists) {
      updated = personalLadderPresets.map((p) => (p.id === presetData.id ? presetData : p));
    } else {
      updated = [presetData, ...personalLadderPresets];
    }
    setPersonalLadderPresets(updated);
    saveUserPersonalLadderPresets(updated);
    setIsLadderManualModalOpen(false);
    setEditingLadderPreset(null);
  };

  const handleDeletePersonalLadderPreset = (presetId: string) => {
    if (window.confirm('이 사다리 프리셋을 삭제하시겠습니까?')) {
      const updated = personalLadderPresets.filter((p) => p.id !== presetId);
      setPersonalLadderPresets(updated);
      saveUserPersonalLadderPresets(updated);
    }
  };

  // 3. 룰렛 프리셋 가져오기 / 직접등록 / 삭제
  const handleImportRoulettePresets = () => {
    if (selectedSystemRouletteIds.length === 0) return;
    const updated = copySystemRoulettePresetsToUser(systemRouletteList, selectedSystemRouletteIds);
    setPersonalRoulettePresets(updated);
    setIsRouletteImportModalOpen(false);
    setSelectedSystemRouletteIds([]);
  };

  const handleSavePersonalRoulettePreset = (presetData: UserRoulettePreset) => {
    const exists = personalRoulettePresets.some((p) => p.id === presetData.id);
    let updated: UserRoulettePreset[];
    if (exists) {
      updated = personalRoulettePresets.map((p) => (p.id === presetData.id ? presetData : p));
    } else {
      updated = [presetData, ...personalRoulettePresets];
    }
    setPersonalRoulettePresets(updated);
    saveUserPersonalRoulettePresets(updated);
    setIsRouletteManualModalOpen(false);
    setEditingRoulettePreset(null);
  };

  const handleDeletePersonalRoulettePreset = (presetId: string) => {
    if (window.confirm('이 룰렛 프리셋을 삭제하시겠습니까?')) {
      const updated = personalRoulettePresets.filter((p) => p.id !== presetId);
      setPersonalRoulettePresets(updated);
      saveUserPersonalRoulettePresets(updated);
    }
  };

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
              { id: 'STORE', label: '게임프리셋' },
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

      {/* Tab: 단골 매장 & 게임 프리셋 관리 (시스템 풀 & 개인화 프리셋 SSOT) */}
      {activeTab === 'STORE' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
          {/* Header & Sub-Tab Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  단골 매장 & 사다리/룰렛 게임 프리셋 개인화 관리
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                사내/모임 단골 매장과 나만의 게임(사다리/룰렛) 프리셋을 설정하면, 대시보드 퀵런처 및 게임존에 즉시 연동됩니다.
              </p>
            </div>

            {/* Sub-Tabs Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 shrink-0">
              <button
                type="button"
                onClick={() => setStoreSubTab('STORES')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  storeSubTab === 'STORES'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>매장 ({userStorePref.myStoreIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setStoreSubTab('LADDER_PRESETS')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  storeSubTab === 'LADDER_PRESETS'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <span>🪜</span>
                <span>사다리 프리셋 ({personalLadderPresets.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setStoreSubTab('ROULETTE_PRESETS')}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  storeSubTab === 'ROULETTE_PRESETS'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                <span>🎯</span>
                <span>룰렛 프리셋 ({personalRoulettePresets.length})</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              Sub-Tab 1: 단골 매장 관리
              ========================================================================= */}
          {storeSubTab === 'STORES' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    { id: '전체', label: '전체 매장' },
                    { id: 'CAFE', label: '☕ 카페/음료' },
                    { id: 'LUNCH', label: '🍱 점심/한식' },
                    { id: 'SNACK', label: '🥟 분식/간식' },
                    { id: 'CUSTOM', label: '⭐ 직접 등록 매장' },
                  ].map((cat) => {
                    const isActive = storeFilterCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setStoreFilterCategory(cat.id)}
                        className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs border border-slate-200 dark:border-zinc-700'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportStoresCsv}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="등록된 매장 및 메뉴 정보 엑셀(CSV) 다운로드"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>엑셀 다운로드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExcelInputText('');
                      setExcelErrorMsg('');
                      setIsStoreExcelModalOpen(true);
                    }}
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="매장 및 메뉴 엑셀 일괄 업로드/수정"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>📥 엑셀 업로드/등록</span>
                  </button>
                  {/* 3-a. 기초 매장 추가 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => setShowBaseStoreSection((prev) => !prev)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      showBaseStoreSection
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <span>⭐ 기초 매장 추가</span>
                    <span className="text-[10px]">{showBaseStoreSection ? '▲ 닫기' : '▼ 펼치기'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCustomStore(null);
                      setIsStoreManualModalOpen(true);
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ 매장 등록</span>
                  </button>
                </div>
              </div>

              {/* 3-b,c,d. 기초 매장 선택 영역 (펴기/닫기) */}
              {showBaseStoreSection && (
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 space-y-3.5 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏢</span>
                      <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        기초 매장 목록 선택 및 등록
                      </h4>
                      <span className="text-[11px] text-amber-700/80 dark:text-amber-400">
                        시스템에서 검증된 기초 매장을 내 매장으로 가져옵니다.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBaseStoreSection(false)}
                      className="text-xs text-amber-700 hover:underline cursor-pointer"
                    >
                      접기 ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getSystemStorePool().map((baseStore) => {
                      const linkedLadder = systemLadderList.filter((p) => p.storeId === baseStore.id);
                      return (
                        <div
                          key={baseStore.id}
                          className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-white dark:bg-zinc-900 flex flex-col justify-between space-y-2.5 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 text-xs font-bold text-slate-900 dark:text-zinc-100">
                              <span className="truncate">{baseStore.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 shrink-0 font-normal">
                                {baseStore.categoryLabel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                              📍 {baseStore.locationMemo} • 메뉴 {baseStore.menus.length}종
                            </p>

                            {/* 3-d. 해당 매장의 기초프리셋 연계 표시 및 프리셋 등록 */}
                            {linkedLadder.length > 0 && (
                              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                                  🪜 연계 기초 프리셋 ({linkedLadder.length}개):
                                </span>
                                {linkedLadder.map((lad) => (
                                  <div key={lad.id} className="flex items-center justify-between text-[10px] bg-purple-50 dark:bg-purple-950/40 p-1 rounded">
                                    <span className="truncate max-w-[130px] text-purple-900 dark:text-purple-200">• {lad.title}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        copySystemLadderPresetsToUser(systemLadderList, [lad.id]);
                                        setPersonalLadderPresets(loadUserPersonalLadderPresets());
                                        alert(`'${lad.title}' 사다리 프리셋이 내 프리셋에 등록되었습니다.`);
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                                    >
                                      + 프리셋 등록
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 3-c. 등록 버튼 2종 */}
                          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => handleRegisterBaseStore(baseStore, false)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer text-[11px]"
                              title="매장 정보만 등록 (메뉴는 이후 직접 등록)"
                            >
                              매장등록
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegisterBaseStore(baseStore, true)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer text-[11px] shadow-2xs"
                              title="매장과 전체 메뉴까지 함께 등록"
                            >
                              매장+메뉴 등록
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAllAvailableStorePool()
                  .filter((s) => {
                    if (storeFilterCategory === '전체') return true;
                    if (storeFilterCategory === 'CUSTOM') return customStores.some((c) => c.id === s.id);
                    return s.category === storeFilterCategory;
                  })
                  .map((store) => {
                    const isRegistered = userStorePref.myStoreIds.includes(store.id);
                    const isDefault = userStorePref.selectedStoreId === store.id;
                    const isCustom = customStores.some((c) => c.id === store.id);

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
                                  {isCustom && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
                                      직접등록
                                    </span>
                                  )}
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
                            <span>📋 메뉴보기</span>
                          </button>

                          <div className="flex items-center gap-2">
                            {isCustom && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCustomStore(store);
                                    setIsStoreManualModalOpen(true);
                                  }}
                                  className="min-h-[44px] px-2.5 py-1 text-xs text-slate-600 dark:text-zinc-300 hover:text-indigo-600 font-semibold"
                                  title="수정"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomStore(store.id)}
                                  className="min-h-[44px] px-2.5 py-1 text-xs text-rose-500 hover:text-rose-700 font-semibold"
                                  title="삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

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
            </div>
          )}

          {/* =========================================================================
              Sub-Tab 2: 사다리 게임 프리셋 관리
              ========================================================================= */}
          {storeSubTab === 'LADDER_PRESETS' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40">
                <div>
                  <h4 className="text-sm font-bold text-violet-950 dark:text-violet-200 flex items-center gap-1.5">
                    <span>🪜</span>
                    <span>나만의 사다리 맞춤 프리셋</span>
                  </h4>
                  <p className="text-xs text-violet-700/80 dark:text-violet-300/80 mt-0.5">
                    등록된 사다리 프리셋은 로그인 메인 대시보드 퀵런처에서 원클릭으로 즉시 실행됩니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSystemLadderIds([]);
                      setIsLadderImportModalOpen(true);
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl border border-violet-300 dark:border-violet-700 bg-white dark:bg-zinc-900 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center gap-1.5 hover:bg-violet-50 cursor-pointer shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>기초 프리셋 가져오기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLadderPreset(null);
                      setIsLadderManualModalOpen(true);
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ 사다리 프리셋 직접 등록</span>
                  </button>
                </div>
              </div>

              {/* Personal Ladder Presets Grid */}
              {personalLadderPresets.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="text-3xl">🪜</div>
                  <h5 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    등록된 개인 사다리 프리셋이 없습니다
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    시스템 기초 프리셋(커피 내기, 점심 뒷정리 등)을 가져오거나, 우리 모임만의 맞춤 사다리 역할을 새로 등록해보세요!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLadderImportModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold cursor-pointer"
                    >
                      기초 프리셋 둘러보기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalLadderPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0F17] hover:border-violet-300 dark:hover:border-violet-800 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{preset.category === 'COFFEE' ? '☕' : preset.category === 'LUNCH' ? '🍱' : '🧹'}</span>
                            <span>{preset.title}</span>
                          </h5>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold">
                              {preset.playerCount}인 ({preset.winnerCount}명 당첨)
                            </span>
                            {preset.isCustomCreated ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
                                수동등록
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                기초복사
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {preset.description}
                        </p>

                        {preset.storeName && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                            <span>🏪</span>
                            <span>연계 매장: {preset.storeName}</span>
                          </div>
                        )}

                        {/* Roles Pill Preview */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {preset.roles.map((r, rIdx) => (
                            <span
                              key={rIdx}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                r.type === 'PAY'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                  : r.type === 'PICKUP'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  : r.type === 'CLEAN'
                                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {r.badgeText ? `[${r.badgeText}] ` : ''}{r.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          등록일: {preset.createdAt?.slice(0, 10) || '2026-11-19'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLadderPreset(preset);
                              setIsLadderManualModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePersonalLadderPreset(preset.id)}
                            className="px-2.5 py-1 text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              Sub-Tab 3: 룰렛 게임 프리셋 관리
              ========================================================================= */}
          {storeSubTab === 'ROULETTE_PRESETS' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <div>
                  <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>나만의 룰렛 맞춤 프리셋</span>
                  </h4>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    점심 메뉴, 벌칙, 당번 룰렛을 등록하여 대시보드 퀵런처에서 즉시 회전할 수 있습니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSystemRouletteIds([]);
                      setIsRouletteImportModalOpen(true);
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-50 cursor-pointer shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>기초 프리셋 가져오기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoulettePreset(null);
                      setIsRouletteManualModalOpen(true);
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ 룰렛 프리셋 직접 등록</span>
                  </button>
                </div>
              </div>

              {/* Personal Roulette Presets Grid */}
              {personalRoulettePresets.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="text-3xl">🎯</div>
                  <h5 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    등록된 개인 룰렛 프리셋이 없습니다
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    시스템 기초 룰렛(점심 메뉴, 벌칙 룰렛 등)을 가져오거나 나만의 맞춤 룰렛을 직접 등록해보세요!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRouletteImportModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                    >
                      기초 프리셋 둘러보기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalRoulettePresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0F17] hover:border-amber-300 dark:hover:border-amber-800 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>{preset.icon || '🎯'}</span>
                            <span>{preset.title}</span>
                          </h5>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
                              항목 {preset.items.length}개
                            </span>
                            {preset.isCustomCreated ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                                수동등록
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                기초복사
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {preset.description}
                        </p>

                        {/* Items Preview */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {preset.items.map((it) => (
                            <span
                              key={it.id}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1"
                            >
                              <span>{it.icon || '•'}</span>
                              <span>{it.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          등록일: {preset.createdAt?.slice(0, 10) || '2026-11-19'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRoulettePreset(preset);
                              setIsRouletteManualModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePersonalRoulettePreset(preset.id)}
                            className="px-2.5 py-1 text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>삭제</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <aside className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-zinc-300">💡 개인화 프리셋 거버넌스 안내</p>
            <p>• 시스템 기초 프리셋을 가져오거나 수동으로 등록한 항목은 사용자 브라우저에 안전하게 독립 보관되며, 시스템 설정 원본에 영향을 주지 않습니다.</p>
            <p>• 등록된 사다리 및 룰렛 프리셋은 로그인 메인 대시보드의 '게임·정산 퀵런처'에 우선 바인딩되어 바로 플레이할 수 있습니다.</p>
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

            {/* Category Filter Chips & Menu Actions */}
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0B0F17]/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setMenuModalCategory('전체')}
                  className={`min-h-[32px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    menuModalCategory === '전체'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  전체 ({selectedMenuStore.menus.length})
                </button>
                {selectedMenuStore.menuCategories.map((cat) => {
                  const count = selectedMenuStore.menus.filter((m) => m.categoryName === cat).length;
                  const isRTD = cat.includes('RTD');
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMenuModalCategory(cat)}
                      className={`min-h-[32px] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        menuModalCategory === cat
                          ? isRTD
                            ? 'bg-sky-600 text-white shadow-2xs font-bold'
                            : 'bg-emerald-600 text-white font-bold'
                          : isRTD
                          ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* 3-e. 메뉴 등록 버튼 2종 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuCsvInput((prev) => !prev);
                    setShowAddMenuForm(false);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3 h-3 text-indigo-500" />
                  <span>엑셀 메뉴 추가</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenuForm((prev) => !prev);
                    setShowMenuCsvInput(false);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ 메뉴 직접 추가</span>
                </button>
              </div>
            </div>

            {/* Menu Manual Add Form */}
            {showAddMenuForm && (
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="text"
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="메뉴명 (예: 바닐라라떼)"
                  className="flex-1 min-w-[120px] h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
                <input
                  type="number"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(parseInt(e.target.value, 10) || 0)}
                  placeholder="가격 (원)"
                  className="w-24 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-right"
                />
                <input
                  type="text"
                  value={newMenuCat}
                  onChange={(e) => setNewMenuCat(e.target.value)}
                  placeholder="분류 (예: 커피)"
                  className="w-24 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
                <input
                  type="text"
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="메뉴설명 (예: 깊고 진한 풍미)"
                  className="flex-1 min-w-[140px] h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                />
                <div className="w-full flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span className="text-slate-400">카테고리 퀵 선택:</span>
                  {selectedMenuStore.menuCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewMenuCat(cat)}
                      className={`px-2 py-0.5 rounded-md font-semibold border transition-all cursor-pointer ${
                        newMenuCat === cat
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddMenuToSelectedStore}
                  className="px-3 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMenuForm(false)}
                  className="px-2 h-8 text-slate-500 hover:text-slate-800"
                >
                  취소
                </button>
              </div>
            )}

            {/* Menu CSV Add Input */}
            {showMenuCsvInput && (
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                  <span>메뉴 CSV 붙여넣기 (형식: 메뉴명,가격,분류)</span>
                  <button type="button" onClick={() => setShowMenuCsvInput(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <textarea
                  rows={2}
                  value={menuCsvText}
                  onChange={(e) => setMenuCsvText(e.target.value)}
                  placeholder="예: 카페모카,5500,커피&#10;자몽허니블랙티,6000,티"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-[11px]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleImportMenuCsvToSelectedStore}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    메뉴 일괄 추가
                  </button>
                </div>
              </div>
            )}

            {/* Menu List Scrollable Area */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 overscroll-contain">
              {selectedMenuStore.menus
                .filter((m) => menuModalCategory === '전체' || m.categoryName === menuModalCategory)
                .map((menu) => (
                  <div
                    key={menu.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden">
                        {menu.imageUrl ? (
                          <img
                            src={menu.imageUrl}
                            alt={menu.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.fallback-icon')) {
                                const span = document.createElement('span');
                                span.className = 'text-lg select-none fallback-icon';
                                span.innerText = menu.iconName || '☕';
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-lg select-none">{menu.iconName || '☕'}</span>
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">
                            {menu.name}
                          </span>
                          {menu.categoryName && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                menu.categoryName.includes('RTD')
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                                  : 'bg-slate-200/70 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                              }`}
                            >
                              {menu.categoryName}
                            </span>
                          )}
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
                  </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {menu.price.toLocaleString()}원
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenuFromSelectedStore(menu.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
                        title="메뉴 삭제"
                      >
                        ✕
                      </button>
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

      {/* =========================================================================
          신규 개인화 팝업 모달 6종 (사다리/룰렛 기초복사, 수동등록, 매장/엑셀등록)
          ========================================================================= */}

      {/* 1. 기초 사다리 프리셋 가져오기 모달 */}
      <LadderImportModal
        isOpen={isLadderImportModalOpen}
        onClose={() => setIsLadderImportModalOpen(false)}
        systemPresets={systemLadderList}
        selectedIds={selectedSystemLadderIds}
        onToggleSelect={(id) => {
          setSelectedSystemLadderIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          );
        }}
        onSelectAll={() => {
          if (selectedSystemLadderIds.length === systemLadderList.length) {
            setSelectedSystemLadderIds([]);
          } else {
            setSelectedSystemLadderIds(systemLadderList.map((p) => p.id));
          }
        }}
        onConfirmImport={handleImportLadderPresets}
      />

      {/* 2. 사다리 프리셋 수동 등록/수정 모달 */}
      <LadderManualModal
        isOpen={isLadderManualModalOpen}
        onClose={() => {
          setIsLadderManualModalOpen(false);
          setEditingLadderPreset(null);
        }}
        preset={editingLadderPreset}
        availableStores={getAllAvailableStorePool()}
        onSave={handleSavePersonalLadderPreset}
      />

      {/* 3. 기초 룰렛 프리셋 가져오기 모달 */}
      <RouletteImportModal
        isOpen={isRouletteImportModalOpen}
        onClose={() => setIsRouletteImportModalOpen(false)}
        systemPresets={systemRouletteList}
        selectedIds={selectedSystemRouletteIds}
        onToggleSelect={(id) => {
          setSelectedSystemRouletteIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          );
        }}
        onSelectAll={() => {
          if (selectedSystemRouletteIds.length === systemRouletteList.length) {
            setSelectedSystemRouletteIds([]);
          } else {
            setSelectedSystemRouletteIds(systemRouletteList.map((p) => p.id));
          }
        }}
        onConfirmImport={handleImportRoulettePresets}
      />

      {/* 4. 룰렛 프리셋 수동 등록/수정 모달 */}
      <RouletteManualModal
        isOpen={isRouletteManualModalOpen}
        onClose={() => {
          setIsRouletteManualModalOpen(false);
          setEditingRoulettePreset(null);
        }}
        preset={editingRoulettePreset}
        onSave={handleSavePersonalRoulettePreset}
      />

      {/* 5. 매장 수동 등록/수정 모달 */}
      <StoreManualModal
        isOpen={isStoreManualModalOpen}
        onClose={() => {
          setIsStoreManualModalOpen(false);
          setEditingCustomStore(null);
        }}
        store={editingCustomStore}
        onSave={handleSaveCustomStore}
      />

      {/* 6. 매장 엑셀 일괄 등록 모달 */}
      <StoreExcelModal
        isOpen={isStoreExcelModalOpen}
        onClose={() => setIsStoreExcelModalOpen(false)}
        onUploadSuccess={(importedStores) => {
          const updated = [...importedStores, ...customStores];
          setCustomStores(updated);
          saveUserCustomStores(updated);
          // 내 매장에도 자동 등록
          const nextPref = {
            ...userStorePref,
            myStoreIds: Array.from(new Set([...userStorePref.myStoreIds, ...importedStores.map((s) => s.id)])),
          };
          setUserStorePref(nextPref);
          saveUserStorePreference(nextPref);
          setIsStoreExcelModalOpen(false);
        }}
      />
    </div>
  );
};

/* =========================================================================
   개인화 하위 모달 컴포넌트 6종 정의
   ========================================================================= */

// 1. 기초 사다리 프리셋 다중 선택 가져오기 모달
interface LadderImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPresets: LadderGoalPreset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onConfirmImport: () => void;
}

const LadderImportModal: React.FC<LadderImportModalProps> = ({
  isOpen,
  onClose,
  systemPresets,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onConfirmImport,
}) => {
  if (!isOpen) return null;
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === systemPresets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-violet-50/60 dark:bg-violet-950/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪜</span>
            <div>
              <h4 className="text-sm font-bold text-violet-950 dark:text-violet-100">
                기초 사다리 프리셋 목록에서 가져오기
              </h4>
              <p className="text-[11px] text-violet-700/80 dark:text-violet-300/80">
                원하는 프리셋을 체크하여 내 프리셋으로 복사 등록합니다 (수정해도 시스템 원본은 보존됩니다).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* List Header & Select All */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-violet-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>전체 선택 ({selectedIds.length}/{systemPresets.length})</span>
          </button>
          <span className="text-[11px] text-slate-400">선택된 프리셋: {selectedIds.length}개</span>
        </div>

        {/* Presets List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {systemPresets.map((preset) => {
            const isChecked = selectedIds.includes(preset.id);
            return (
              <div
                key={preset.id}
                onClick={() => onToggleSelect(preset.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'border-violet-500 bg-violet-50/30 dark:bg-violet-950/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <div className="pt-0.5">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-violet-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {preset.title}
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0 font-medium">
                      {preset.playerCount}인 ({preset.winnerCount}명 당첨)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {preset.description}
                  </p>
                  {preset.storeName && (
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      🏪 매장 연계: {preset.storeName}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {preset.roles.map((r, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      >
                        {r.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
            총 {selectedIds.length}개 선택됨
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={onConfirmImport}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              내 프리셋으로 가져오기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. 사다리 프리셋 수동 등록/수정 모달
interface LadderManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: UserLadderPreset | null;
  availableStores: StorePreset[];
  onSave: (data: UserLadderPreset) => void;
}

interface ParticipantConfig {
  name: string;
  menuName?: string;
  menuPrice?: number;
  weight: number;
}

const LADDER_GOAL_ICONS = ['💳', '🏃', '🧹', '🎉', '☕', '🍱', '🎯', '🍀', '📝', '💡', '🍗', '🥤'];

const LadderManualModal: React.FC<LadderManualModalProps> = ({
  isOpen,
  onClose,
  preset,
  availableStores,
  onSave,
}) => {
  const [title, setTitle] = useState(preset?.title || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [category, setCategory] = useState<'COFFEE' | 'LUNCH' | 'DUTY'>(preset?.category || 'COFFEE');
  const [playerCount, setPlayerCount] = useState<number>(preset?.playerCount || 4);
  const [winnerCount, setWinnerCount] = useState<number>(preset?.winnerCount || 1);
  const [storeId, setStoreId] = useState<string>(preset?.storeId || '');

  // 4-b. 참가자별 이름, 매장 메뉴, 가중치
  const [participants, setParticipants] = useState<ParticipantConfig[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      name: `참가자 ${i + 1}`,
      weight: 10,
    }))
  );

  const [roles, setRoles] = useState<
    Array<{ label: string; icon?: string; type: 'PAY' | 'PICKUP' | 'CLEAN' | 'PASS'; color: string; badgeText?: string }>
  >(
    preset?.roles || [
      { label: '오늘 결제 당첨', icon: '💳', type: 'PAY', color: 'rose', badgeText: '당첨' },
      { label: '심부름 픽업', icon: '🏃', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
      { label: '축 통과 (생존)', icon: '🎉', type: 'PASS', color: 'emerald', badgeText: '면제' },
      { label: '축 통과 (생존)', icon: '🎉', type: 'PASS', color: 'emerald', badgeText: '면제' },
    ]
  );

  const selectedStoreObj = availableStores.find((s) => s.id === storeId);

  useEffect(() => {
    if (preset) {
      setTitle(preset.title);
      setDescription(preset.description);
      setCategory(preset.category);
      setPlayerCount(preset.playerCount);
      setWinnerCount(preset.winnerCount);
      setStoreId(preset.storeId || '');
      setRoles(
        preset.roles.map((r) => ({
          ...r,
          icon: r.badgeText || (r.type === 'PAY' ? '💳' : r.type === 'PICKUP' ? '🏃' : r.type === 'CLEAN' ? '🧹' : '🎉'),
        }))
      );
      setParticipants(
        Array.from({ length: preset.playerCount }, (_, i) => ({
          name: `참가자 ${i + 1}`,
          weight: 10,
        }))
      );
    } else {
      setTitle('');
      setDescription('');
      setCategory('COFFEE');
      setPlayerCount(4);
      setWinnerCount(1);
      setStoreId('');
      setParticipants(
        Array.from({ length: 4 }, (_, i) => ({
          name: `참가자 ${i + 1}`,
          weight: 10,
        }))
      );
      setRoles([
        { label: '오늘 결제 당첨', icon: '💳', type: 'PAY', color: 'rose', badgeText: '당첨' },
        { label: '심부름 픽업', icon: '🏃', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
        { label: '축 통과 (생존)', icon: '🎉', type: 'PASS', color: 'emerald', badgeText: '면제' },
        { label: '축 통과 (생존)', icon: '🎉', type: 'PASS', color: 'emerald', badgeText: '면제' },
      ]);
    }
  }, [preset, isOpen]);

  if (!isOpen) return null;

  // 4-a. 인원수 증감 (감소 시 아래부터 삭제)
  const handleSetPlayerCount = (target: number) => {
    const safeNum = Math.max(2, Math.min(10, target));
    setPlayerCount(safeNum);

    // 참가자 배열 증감
    setParticipants((prev) => {
      if (prev.length < safeNum) {
        const added = Array.from({ length: safeNum - prev.length }, (_, i) => ({
          name: `참가자 ${prev.length + i + 1}`,
          weight: 10,
        }));
        return [...prev, ...added];
      } else if (prev.length > safeNum) {
        return prev.slice(0, safeNum); // 아래부터 삭제
      }
      return prev;
    });

    // 역할 배열 증감
    setRoles((prev) => {
      if (prev.length < safeNum) {
        const added = Array.from({ length: safeNum - prev.length }, () => ({
          label: '통과 (생존)',
          icon: '🎉',
          type: 'PASS' as const,
          color: 'emerald',
          badgeText: '면제',
        }));
        return [...prev, ...added];
      } else if (prev.length > safeNum) {
        return prev.slice(0, safeNum); // 아래부터 삭제
      }
      return prev;
    });

    if (winnerCount >= safeNum) {
      setWinnerCount(Math.max(1, safeNum - 1));
    }
  };

  const handleSetWinnerCount = (target: number) => {
    const safeNum = Math.max(1, Math.min(playerCount - 1, target));
    setWinnerCount(safeNum);
  };

  const handleParticipantChange = (idx: number, field: keyof ParticipantConfig, val: any) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const handleRoleChange = (idx: number, field: string, val: any) => {
    setRoles((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('프리셋 제목을 입력해주세요.');
      return;
    }

    const matchedStore = availableStores.find((s) => s.id === storeId);
    const savedData: UserLadderPreset = {
      id: preset?.id || `user_lad_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `${playerCount}인 사다리 내기 맞춤 프리셋`,
      category,
      playerCount,
      winnerCount,
      storeId: storeId || undefined,
      storeName: matchedStore?.name,
      roles: roles.map((r) => ({
        label: r.label,
        type: r.type,
        color: r.color,
        badgeText: r.icon || r.badgeText,
      })),
      isCustomCreated: true,
      importedFromSystemId: preset?.importedFromSystemId,
      createdAt: preset?.createdAt || new Date().toISOString(),
    };

    onSave(savedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-violet-50/60 dark:bg-violet-950/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪜</span>
            <h4 className="text-sm font-bold text-violet-950 dark:text-violet-100">
              {preset ? '사다리 맞춤 프리셋 수정' : '새 사다리 프리셋 직접 등록'}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
              프리셋 제목 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: ☕ 커피 쏘기 & 픽업 내기 (대표 5인)"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="COFFEE">☕ 커피/음료 내기</option>
                <option value="LUNCH">🍱 점심/식사 뒷정리</option>
                <option value="DUTY">🧹 사내 당번/청소</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                연계 매장 선택
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="">연계 매장 없음 (일반 벌칙 사다리)</option>
                {availableStores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.categoryLabel} • 메뉴 {s.menus.length}개)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4-a. 참가인원수 & 당첨인원수 입력필드 + 증감 버튼 */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                참가인원수 (2~10명)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetPlayerCount(playerCount - 1)}
                  disabled={playerCount <= 2}
                  className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm hover:bg-slate-100 disabled:opacity-40"
                >
                  -
                </button>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={playerCount}
                  onChange={(e) => handleSetPlayerCount(parseInt(e.target.value, 10) || 2)}
                  className="flex-1 h-9 px-2 text-center font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => handleSetPlayerCount(playerCount + 1)}
                  disabled={playerCount >= 10}
                  className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">감소 시 하단 항목부터 자동 제거</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                당첨인원수 (1~{playerCount - 1}명)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetWinnerCount(winnerCount - 1)}
                  disabled={winnerCount <= 1}
                  className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm hover:bg-slate-100 disabled:opacity-40"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, playerCount - 1)}
                  value={winnerCount}
                  onChange={(e) => handleSetWinnerCount(parseInt(e.target.value, 10) || 1)}
                  className="flex-1 h-9 px-2 text-center font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => handleSetWinnerCount(winnerCount + 1)}
                  disabled={winnerCount >= playerCount - 1}
                  className="w-9 h-9 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">최대 {playerCount - 1}명까지 당첨 가능</span>
            </div>
          </div>

          {/* 4-b. 참가자 정보 등록 폼 (이름, 선택매장의 메뉴목록, 가중치 설정 증감) */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <span>👥</span>
                <span>참가자별 정보 및 메뉴·가중치 설정 ({participants.length}명)</span>
              </label>
              {selectedStoreObj && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                  🏪 {selectedStoreObj.name} 메뉴 연동됨
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {participants.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 w-5 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                    placeholder="참가자 이름"
                    className="w-28 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  />

                  {/* 매장 메뉴 선택 드롭다운 */}
                  <select
                    value={p.menuName || ''}
                    onChange={(e) => {
                      const mName = e.target.value;
                      const matchedMenu = selectedStoreObj?.menus.find((m) => m.name === mName);
                      setParticipants((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, menuName: mName, menuPrice: matchedMenu?.price } : item
                        )
                      );
                    }}
                    className="flex-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px]"
                  >
                    <option value="">메뉴 미지정</option>
                    {selectedStoreObj?.menus.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.iconName ? `${m.iconName} ` : ''}{m.name} ({m.price.toLocaleString()}원)
                      </option>
                    ))}
                  </select>

                  {/* 가중치 설정 증감 (- 10 +) */}
                  <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => handleParticipantChange(idx, 'weight', Math.max(1, p.weight - 5))}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs">{p.weight}</span>
                    <button
                      type="button"
                      onClick={() => handleParticipantChange(idx, 'weight', Math.min(50, p.weight + 5))}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-c. 목표 설정 (아이콘 선택목록, 목표명) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🎯</span>
              <span>사다리 도착 목표 역할 설정 ({roles.length}개)</span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {roles.map((r, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                  <span className="font-bold text-slate-500 w-5 text-center">{idx + 1}</span>

                  {/* 아이콘 선택 칩 피커 */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-sm cursor-pointer shadow-2xs"
                    >
                      {r.icon || '🎯'}
                    </button>
                    <div className="hidden group-hover:flex absolute left-0 top-full mt-1 z-20 p-1.5 rounded-xl bg-white dark:bg-zinc-800 border shadow-xl flex-wrap gap-1 w-44 animate-in fade-in">
                      {LADDER_GOAL_ICONS.map((ico) => (
                        <button
                          key={ico}
                          type="button"
                          onClick={() => handleRoleChange(idx, 'icon', ico)}
                          className="w-7 h-7 rounded hover:bg-violet-100 dark:hover:bg-violet-900/40 text-sm flex items-center justify-center cursor-pointer"
                        >
                          {ico}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={r.label}
                    onChange={(e) => handleRoleChange(idx, 'label', e.target.value)}
                    placeholder="목표명 (예: 💳 커피 결제)"
                    className="flex-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  />

                  <select
                    value={r.type}
                    onChange={(e) => handleRoleChange(idx, 'type', e.target.value)}
                    className="h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px]"
                  >
                    <option value="PAY">결제(당첨)</option>
                    <option value="PICKUP">심부름</option>
                    <option value="CLEAN">정리/청소</option>
                    <option value="PASS">면제(생존)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. 기초 룰렛 프리셋 다중 선택 가져오기 모달
interface RouletteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPresets: RoulettePreset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onConfirmImport: () => void;
}

const RouletteImportModal: React.FC<RouletteImportModalProps> = ({
  isOpen,
  onClose,
  systemPresets,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onConfirmImport,
}) => {
  if (!isOpen) return null;
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === systemPresets.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-amber-50/60 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                기초 룰렛 프리셋 목록에서 가져오기
              </h4>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                원하는 룰렛을 체크하여 내 프리셋으로 복사 등록합니다 (수정해도 시스템 원본은 보존됩니다).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* List Header */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center gap-2 font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-amber-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>전체 선택 ({selectedIds.length}/{systemPresets.length})</span>
          </button>
          <span className="text-[11px] text-slate-400">선택된 프리셋: {selectedIds.length}개</span>
        </div>

        {/* Presets List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {systemPresets.map((preset) => {
            const isChecked = selectedIds.includes(preset.id);
            return (
              <div
                key={preset.id}
                onClick={() => onToggleSelect(preset.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <div className="pt-0.5">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                      <span>{preset.icon || '🎯'}</span>
                      <span>{preset.title}</span>
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0 font-medium">
                      항목 {preset.items.length}개
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {preset.items.map((it) => (
                      <span
                        key={it.id}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      >
                        {it.icon || '•'} {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
            총 {selectedIds.length}개 선택됨
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={onConfirmImport}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              내 프리셋으로 가져오기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. 룰렛 프리셋 수동 등록/수정 모달
interface RouletteManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: UserRoulettePreset | null;
  onSave: (data: UserRoulettePreset) => void;
}

const ROULETTE_EMOJI_PALETTE = [
  '🍱', '🍲', '🍛', '🍜', '🍔', '🍕', '🥗', '☕', '🍰', '🍦', '🍩', '🍺',
  '🧹', '📝', '♻️', '🍪', '💡', '🎯', '🍀', '🏆', '🎲', '🎤', '📸', '⚡'
];

const RouletteManualModal: React.FC<RouletteManualModalProps> = ({
  isOpen,
  onClose,
  preset,
  onSave,
}) => {
  const [title, setTitle] = useState(preset?.title || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [category, setCategory] = useState<'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM'>(
    preset?.category || 'LUNCH'
  );
  const [icon, setIcon] = useState(preset?.icon || '🍱');
  const [showMainIconPicker, setShowMainIconPicker] = useState<boolean>(false);
  const [activeItemIconPickerIdx, setActiveItemIconPickerIdx] = useState<number | null>(null);

  const [items, setItems] = useState<Array<{ id: string; name: string; icon?: string; weight: number }>>(
    preset?.items || [
      { id: 'item_1', name: '김치찌개 / 제육', icon: '🍲', weight: 10 },
      { id: 'item_2', name: '돈까스 / 라멘', icon: '🍛', weight: 10 },
      { id: 'item_3', name: '짜장면 / 짬뽕', icon: '🍜', weight: 10 },
      { id: 'item_4', name: '샐러드 / 샌드위치', icon: '🥗', weight: 10 },
    ]
  );

  useEffect(() => {
    if (preset) {
      setTitle(preset.title);
      setDescription(preset.description);
      setCategory(preset.category);
      setIcon(preset.icon || '🍱');
      setItems(preset.items);
    } else {
      setTitle('');
      setDescription('');
      setCategory('LUNCH');
      setIcon('🍱');
      setItems([
        { id: 'item_1', name: '김치찌개 / 제육', icon: '🍲', weight: 10 },
        { id: 'item_2', name: '돈까스 / 라멘', icon: '🍛', weight: 10 },
        { id: 'item_3', name: '짜장면 / 짬뽕', icon: '🍜', weight: 10 },
        { id: 'item_4', name: '샐러드 / 샌드위치', icon: '🥗', weight: 10 },
      ]);
    }
  }, [preset, isOpen]);

  if (!isOpen) return null;

  // 5-b. 설정항목 건수 증감 (감소 시 아래부터 삭제)
  const handleSetItemCount = (target: number) => {
    const safeCount = Math.max(2, Math.min(20, target));
    setItems((prev) => {
      if (prev.length < safeCount) {
        const added = Array.from({ length: safeCount - prev.length }, (_, i) => ({
          id: `r_it_${Date.now()}_${prev.length + i}`,
          name: `새 항목 ${prev.length + i + 1}`,
          icon: ROULETTE_EMOJI_PALETTE[(prev.length + i) % ROULETTE_EMOJI_PALETTE.length],
          weight: 10,
        }));
        return [...prev, ...added];
      } else if (prev.length > safeCount) {
        return prev.slice(0, safeCount); // 아래부터 삭제
      }
      return prev;
    });
  };

  const handleAddItem = () => {
    handleSetItemCount(items.length + 1);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 2) {
      alert('룰렛 항목은 최소 2개 이상이어야 합니다.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('룰렛 제목을 입력해주세요.');
      return;
    }

    const savedData: UserRoulettePreset = {
      id: preset?.id || `user_rou_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || `${items.length}개 항목 맞춤 룰렛 프리셋`,
      category,
      icon,
      items,
      isCustomCreated: true,
      importedFromSystemId: preset?.importedFromSystemId,
      createdAt: preset?.createdAt || new Date().toISOString(),
    };

    onSave(savedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[92vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-amber-50/60 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
              {preset ? '룰렛 맞춤 프리셋 수정' : '새 룰렛 프리셋 직접 등록'}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="flex items-center gap-3">
            {/* 5-a. 대표 아이콘 선택 팝업 */}
            <div className="relative">
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                아이콘
              </label>
              <button
                type="button"
                onClick={() => setShowMainIconPicker((prev) => !prev)}
                className="w-12 h-10 text-xl rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 flex items-center justify-center cursor-pointer shadow-2xs hover:border-amber-400"
                title="대표 아이콘 선택"
              >
                {icon}
              </button>

              {showMainIconPicker && (
                <div className="absolute left-0 top-full mt-1.5 z-30 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-2xl grid grid-cols-6 gap-1 w-56 animate-in fade-in zoom-in-95">
                  {ROULETTE_EMOJI_PALETTE.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setIcon(emoji);
                        setShowMainIconPicker(false);
                      }}
                      className="w-8 h-8 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/60 text-lg flex items-center justify-center cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                룰렛 제목 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 🍱 오늘 점심 뭐 먹지?"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              >
                <option value="LUNCH">🍱 점심/식사</option>
                <option value="DUTY">🧹 당번/청소</option>
                <option value="PENALTY">🎯 벌칙/미션</option>
                <option value="COFFEE">☕ 커피/간식</option>
                <option value="CUSTOM">⭐ 맞춤</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                설명 (선택)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="간단한 룰렛 설명"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* 5-b. 설정항목 건수 입력필드 + 증감 버튼 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-700 dark:text-zinc-300 block">
                설정 항목 건수 ({items.length}개)
              </span>
              <span className="text-[10px] text-slate-400">감소 시 하단 항목부터 자동 제거</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetItemCount(items.length - 1)}
                disabled={items.length <= 2}
                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm hover:bg-slate-100 disabled:opacity-40"
              >
                -
              </button>
              <input
                type="number"
                min="2"
                max="20"
                value={items.length}
                onChange={(e) => handleSetItemCount(parseInt(e.target.value, 10) || 2)}
                className="w-12 h-8 px-1 text-center font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={() => handleSetItemCount(items.length + 1)}
                disabled={items.length >= 20}
                className="w-8 h-8 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-sm hover:bg-slate-100 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* 5-c,d. 항목 목록 (아이콘 선택 팝업 + 가중치 증감 버튼) */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-zinc-300">
                룰렛 슬라이스 항목 목록 ({items.length}개)
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                + 항목 추가
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs">
                  {/* 5-c. 항목 아이콘 선택 팝업 */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveItemIconPickerIdx((prev) => (prev === idx ? null : idx))
                      }
                      className="w-8 h-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm flex items-center justify-center cursor-pointer shadow-2xs hover:border-amber-400"
                    >
                      {it.icon || '🎯'}
                    </button>

                    {activeItemIconPickerIdx === idx && (
                      <div className="absolute left-0 top-full mt-1 z-30 p-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-2xl grid grid-cols-6 gap-1 w-56 animate-in fade-in">
                        {ROULETTE_EMOJI_PALETTE.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              handleItemChange(idx, 'icon', emoji);
                              setActiveItemIconPickerIdx(null);
                            }}
                            className="w-8 h-8 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/60 text-base flex items-center justify-center cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={it.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    placeholder="항목 이름"
                    className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  />

                  {/* 5-d. 가중치 설정 증감 (- 10 +) */}
                  <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => handleItemChange(idx, 'weight', Math.max(1, it.weight - 5))}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs">{it.weight}</span>
                    <button
                      type="button"
                      onClick={() => handleItemChange(idx, 'weight', Math.min(50, it.weight + 5))}
                      className="w-6 h-6 rounded bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
                    title="항목 삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. 매장 수동 등록/수정 모달
interface StoreManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StorePreset | null;
  onSave: (data: StorePreset) => void;
}

const StoreManualModal: React.FC<StoreManualModalProps> = ({
  isOpen,
  onClose,
  store,
  onSave,
}) => {
  const [name, setName] = useState(store?.name || '');
  const [partnerBrand, setPartnerBrand] = useState(store?.partnerBrand || '');
  const [category, setCategory] = useState<any>(store?.category || 'CAFE');
  const [locationMemo, setLocationMemo] = useState(store?.locationMemo || '');
  const [themeColor, setThemeColor] = useState(store?.themeColor || '#006241');
  const [menus, setMenus] = useState<StoreMenuItem[]>(
    store?.menus || [
      { id: 'm_1', name: '아메리카노', price: 4500, categoryName: '커피', isSignature: true },
      { id: 'm_2', name: '카페 라떼', price: 5000, categoryName: '커피' },
    ]
  );

  useEffect(() => {
    if (store) {
      setName(store.name);
      setPartnerBrand(store.partnerBrand || '');
      setCategory(store.category);
      setLocationMemo(store.locationMemo);
      setThemeColor(store.themeColor || '#006241');
      setMenus(store.menus);
    } else {
      setName('');
      setPartnerBrand('');
      setCategory('CAFE');
      setLocationMemo('');
      setThemeColor('#006241');
      setMenus([
        { id: 'm_1', name: '아메리카노', price: 4500, categoryName: '커피', isSignature: true },
        { id: 'm_2', name: '카페 라떼', price: 5000, categoryName: '커피' },
      ]);
    }
  }, [store, isOpen]);

  if (!isOpen) return null;

  const handleAddMenu = () => {
    setMenus((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, name: `새 메뉴 ${prev.length + 1}`, price: 5000, categoryName: '대표메뉴' },
    ]);
  };

  const handleRemoveMenu = (idx: number) => {
    setMenus((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMenuChange = (idx: number, field: string, val: any) => {
    setMenus((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('매장명을 입력해주세요.');
      return;
    }

    const cats = Array.from(new Set(menus.map((m) => m.categoryName).filter(Boolean)));
    const saved: StorePreset = {
      id: store?.id || `usr_store_${Date.now()}`,
      name: name.trim(),
      partnerBrand: partnerBrand.trim(),
      category,
      categoryLabel:
        category === 'CAFE'
          ? '카페/음료'
          : category === 'LUNCH'
          ? '점심식사'
          : category === 'DINNER'
          ? '저녁/회식'
          : category === 'SNACK'
          ? '간식/분식'
          : '맞춤매장',
      locationMemo: locationMemo.trim() || '위치 미지정',
      themeColor,
      menuCategories: cats.length > 0 ? cats : ['대표메뉴'],
      menus,
      isPresetDefault: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-indigo-50/60 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              {store ? '맞춤 매장 정보 수정' : '새 단골 매장 직접 등록'}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                매장명 *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 을지로 직장인커피"
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                브랜드/운영사
              </label>
              <input
                type="text"
                value={partnerBrand}
                onChange={(e) => setPartnerBrand(e.target.value)}
                placeholder="예: 을지로빈스"
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
              >
                <option value="CAFE">☕ 카페/음료</option>
                <option value="LUNCH">🍱 점심식사</option>
                <option value="DINNER">🍗 저녁/회식</option>
                <option value="SNACK">🥟 분식/간식</option>
                <option value="CUSTOM">⭐ 기타 맞춤</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                테마 색상
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-zinc-700"
                />
                <input
                  type="text"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="flex-1 h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              위치 메모
            </label>
            <input
              type="text"
              value={locationMemo}
              onChange={(e) => setLocationMemo(e.target.value)}
              placeholder="예: 을지로입구역 2번 출구 지하 1층"
              className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
            />
          </div>

          {/* Menus List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                메뉴 목록 ({menus.length}종)
              </label>
              <button
                type="button"
                onClick={handleAddMenu}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                + 메뉴 추가
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {menus.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs">
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => handleMenuChange(idx, 'name', e.target.value)}
                    placeholder="메뉴명"
                    className="flex-1 h-8 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="number"
                    value={m.price}
                    onChange={(e) => handleMenuChange(idx, 'price', parseInt(e.target.value, 10) || 0)}
                    placeholder="가격"
                    className="w-20 h-8 px-2 text-right rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <input
                    type="text"
                    value={m.categoryName}
                    onChange={(e) => handleMenuChange(idx, 'categoryName', e.target.value)}
                    placeholder="분류"
                    className="w-16 h-8 px-1 text-center rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMenu(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. 매장 엑셀 일괄 등록 모달
interface StoreExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (stores: StorePreset[]) => void;
}

const StoreExcelModal: React.FC<StoreExcelModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewStores, setPreviewStores] = useState<StorePreset[]>([]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        const res = parseStoreCsvData(content);
        if (res.success) {
          setPreviewStores(res.stores);
          setErrorMsg('');
        } else {
          setPreviewStores([]);
          setErrorMsg(res.error || '파싱에 실패했습니다.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (!text.trim()) {
      setPreviewStores([]);
      setErrorMsg('');
      return;
    }
    const res = parseStoreCsvData(text);
    if (res.success) {
      setPreviewStores(res.stores);
      setErrorMsg('');
    } else {
      setPreviewStores([]);
      setErrorMsg(res.error || '파싱 오류');
    }
  };

  const handleConfirm = () => {
    if (previewStores.length === 0) return;
    onUploadSuccess(previewStores);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              매장 및 메뉴 엑셀(CSV) 일괄 등록
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* File Upload Drop Area */}
          <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 text-center space-y-2">
            <Upload className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400" />
            <p className="font-bold text-slate-700 dark:text-zinc-300">
              CSV 파일을 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              샘플 양식에 맞춰 작성된 UTF-8 CSV 파일을 선택해주세요.
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-upload-input"
            />
            <label
              htmlFor="csv-file-upload-input"
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition-colors"
            >
              파일 찾아보기
            </label>
          </div>

          {/* Text Area Manual Paste */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-zinc-300">
              또는 CSV 텍스트 직접 붙여넣기
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="헤더 포함 CSV 데이터 붙여넣기..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 font-mono text-[11px] focus:outline-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 text-[11px] font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Preview */}
          {previewStores.length > 0 && (
            <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                ✓ 유효성 검증 완료: {previewStores.length}개 매장 감지됨
              </span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {previewStores.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      • {s.name} ({s.categoryLabel})
                    </span>
                    <span className="text-slate-400">메뉴 {s.menus.length}개</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={downloadStoreExcelTemplate}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>샘플 양식 다운로드</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="button"
              disabled={previewStores.length === 0}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {previewStores.length}개 매장 일괄 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
