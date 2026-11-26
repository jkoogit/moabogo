import React, { useState, useEffect } from 'react';
import {
  Store,
  Download,
  FileSpreadsheet,
  Plus,
  Coffee,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react';
import { ElmSld03 } from '../../elements/Tokens';
import {
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
  exportUserStoresToCsv,
  checkPresetSourceSyncStatus,
} from '../../data/systemStorePool';
import {
  loadSystemLadderPresets,
  loadSystemRoulettePresets,
} from '../../data/systemGovernancePool';
import { LadderImportModal, LadderManualModal } from './LadderPresetModals';
import { RouletteImportModal, RouletteManualModal } from './RoulettePresetModals';
import { StoreManualModal, StoreExcelModal } from './StoreCustomModals';

interface StorePresetTabProps {
  onNotify: (msg?: string) => void;
}

export const StorePresetTab: React.FC<StorePresetTabProps> = ({ onNotify }) => {
  const [storeSubTab, setStoreSubTab] = useState<'STORES' | 'LADDER_PRESETS' | 'ROULETTE_PRESETS'>(
    'STORES'
  );
  const [userStorePref, setUserStorePref] = useState<UserStorePreference>(() =>
    loadUserStorePreference()
  );
  const [customStores, setCustomStores] = useState<StorePreset[]>(() => loadUserCustomStores());
  const [personalLadderPresets, setPersonalLadderPresets] = useState<UserLadderPreset[]>(() =>
    loadUserPersonalLadderPresets()
  );
  const [personalRoulettePresets, setPersonalRoulettePresets] = useState<UserRoulettePreset[]>(() =>
    loadUserPersonalRoulettePresets()
  );
  const [systemLadderList, setSystemLadderList] = useState<LadderGoalPreset[]>(() =>
    loadSystemLadderPresets()
  );
  const [systemRouletteList, setSystemRouletteList] = useState<RoulettePreset[]>(() =>
    loadSystemRoulettePresets()
  );

  const [selectedMenuStore, setSelectedMenuStore] = useState<StorePreset | null>(null);
  const [menuModalCategory, setMenuModalCategory] = useState<string>('전체');
  const [storeFilterCategory, setStoreFilterCategory] = useState<string>('전체');

  // 모달 상태
  const [isStoreManualModalOpen, setIsStoreManualModalOpen] = useState<boolean>(false);
  const [editingCustomStore, setEditingCustomStore] = useState<StorePreset | null>(null);
  const [isStoreExcelModalOpen, setIsStoreExcelModalOpen] = useState<boolean>(false);

  const [isLadderImportModalOpen, setIsLadderImportModalOpen] = useState<boolean>(false);
  const [selectedSystemLadderIds, setSelectedSystemLadderIds] = useState<string[]>([]);
  const [isLadderManualModalOpen, setIsLadderManualModalOpen] = useState<boolean>(false);
  const [editingLadderPreset, setEditingLadderPreset] = useState<UserLadderPreset | null>(null);

  const [isRouletteImportModalOpen, setIsRouletteImportModalOpen] = useState<boolean>(false);
  const [selectedSystemRouletteIds, setSelectedSystemRouletteIds] = useState<string[]>([]);
  const [isRouletteManualModalOpen, setIsRouletteManualModalOpen] = useState<boolean>(false);
  const [editingRoulettePreset, setEditingRoulettePreset] = useState<UserRoulettePreset | null>(
    null
  );

  // 기초 매장 추가 아코디언 토글 및 메뉴판 모달 상태
  const [showBaseStoreSection, setShowBaseStoreSection] = useState<boolean>(false);
  const [showAddMenuForm, setShowAddMenuForm] = useState<boolean>(false);
  const [newMenuName, setNewMenuName] = useState<string>('');
  const [newMenuPrice, setNewMenuPrice] = useState<number>(5000);
  const [newMenuCat, setNewMenuCat] = useState<string>('대표');
  const [newMenuDesc, setNewMenuDesc] = useState<string>('');
  const [showMenuCsvInput, setShowMenuCsvInput] = useState<boolean>(false);
  const [menuCsvText, setMenuCsvText] = useState<string>('');

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

  const handleSaveCustomStore = (storeData: StorePreset) => {
    const exists = customStores.some((s) => s.id === storeData.id);
    const updated = exists
      ? customStores.map((s) => (s.id === storeData.id ? storeData : s))
      : [storeData, ...customStores];
    setCustomStores(updated);
    saveUserCustomStores(updated);

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
    onNotify('✓ 매장 정보가 저장되었습니다.');
  };

  const handleDeleteCustomStore = (storeId: string) => {
    if (window.confirm('등록한 맞춤 매장을 삭제하시겠습니까?')) {
      const updated = customStores.filter((s) => s.id !== storeId);
      setCustomStores(updated);
      saveUserCustomStores(updated);
      const nextPref = {
        selectedStoreId:
          userStorePref.selectedStoreId === storeId
            ? updated[0]?.id || 'sys_store_pluscafe_45f'
            : userStorePref.selectedStoreId,
        myStoreIds: userStorePref.myStoreIds.filter((id) => id !== storeId),
      };
      setUserStorePref(nextPref);
      saveUserStorePreference(nextPref);
      onNotify('맞춤 매장이 삭제되었습니다.');
    }
  };

  const handleRegisterBaseStore = (baseStore: StorePreset, includeMenus: boolean) => {
    const newId = `usr_store_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const clonedMenus: StoreMenuItem[] = includeMenus
      ? baseStore.menus.map((m) => ({
          ...m,
          id: `m_c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        }))
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
    onNotify(
      `✓ '${baseStore.name}' 매장이 ${
        includeMenus ? '메뉴 포함하여' : '매장 정보만'
      } 내 매장에 등록되었습니다.`
    );
  };

  const handleExportStoresCsv = () => {
    const storesToExport = getAllAvailableStorePool().filter(
      (s) => userStorePref.myStoreIds.includes(s.id) || customStores.some((c) => c.id === s.id)
    );
    if (storesToExport.length === 0) {
      onNotify('내보낼 매장 정보가 없습니다.');
      return;
    }
    exportUserStoresToCsv(storesToExport);
    onNotify(`✓ ${storesToExport.length}개 매장 CSV 다운로드를 시작합니다.`);
  };

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
    const updatedCats = Array.from(
      new Set([...selectedMenuStore.menuCategories, newMenu.categoryName])
    );
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
      onNotify('추가할 유효한 메뉴 데이터가 없습니다. (예: 아메리카노,4500,커피)');
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
    onNotify(`✓ ${newMenus.length}개의 메뉴가 성공적으로 일괄 추가되었습니다.`);
  };

  const handleImportLadderPresets = () => {
    if (selectedSystemLadderIds.length === 0) return;
    const updated = copySystemLadderPresetsToUser(systemLadderList, selectedSystemLadderIds);
    setPersonalLadderPresets(updated);
    setIsLadderImportModalOpen(false);
    setSelectedSystemLadderIds([]);
    onNotify('✓ 선택한 사다리 프리셋을 가져왔습니다.');
  };

  const handleSavePersonalLadderPreset = (presetData: UserLadderPreset) => {
    const exists = personalLadderPresets.some((p) => p.id === presetData.id);
    const updated = exists
      ? personalLadderPresets.map((p) => (p.id === presetData.id ? presetData : p))
      : [presetData, ...personalLadderPresets];
    setPersonalLadderPresets(updated);
    saveUserPersonalLadderPresets(updated);
    setIsLadderManualModalOpen(false);
    setEditingLadderPreset(null);
    onNotify('✓ 사다리 프리셋이 저장되었습니다.');
  };

  const handleDeletePersonalLadderPreset = (presetId: string) => {
    if (window.confirm('이 사다리 프리셋을 삭제하시겠습니까?')) {
      const updated = personalLadderPresets.filter((p) => p.id !== presetId);
      setPersonalLadderPresets(updated);
      saveUserPersonalLadderPresets(updated);
      onNotify('사다리 프리셋이 삭제되었습니다.');
    }
  };

  const handleImportRoulettePresets = () => {
    if (selectedSystemRouletteIds.length === 0) return;
    const updated = copySystemRoulettePresetsToUser(systemRouletteList, selectedSystemRouletteIds);
    setPersonalRoulettePresets(updated);
    setIsRouletteImportModalOpen(false);
    setSelectedSystemRouletteIds([]);
    onNotify('✓ 선택한 룰렛 프리셋을 가져왔습니다.');
  };

  const handleSavePersonalRoulettePreset = (presetData: UserRoulettePreset) => {
    const exists = personalRoulettePresets.some((p) => p.id === presetData.id);
    const updated = exists
      ? personalRoulettePresets.map((p) => (p.id === presetData.id ? presetData : p))
      : [presetData, ...personalRoulettePresets];
    setPersonalRoulettePresets(updated);
    saveUserPersonalRoulettePresets(updated);
    setIsRouletteManualModalOpen(false);
    setEditingRoulettePreset(null);
    onNotify('✓ 룰렛 프리셋이 저장되었습니다.');
  };

  const handleDeletePersonalRoulettePreset = (presetId: string) => {
    if (window.confirm('이 룰렛 프리셋을 삭제하시겠습니까?')) {
      const updated = personalRoulettePresets.filter((p) => p.id !== presetId);
      setPersonalRoulettePresets(updated);
      saveUserPersonalRoulettePresets(updated);
      onNotify('룰렛 프리셋이 삭제되었습니다.');
    }
  };

  const handleSyncLadderPresetWithSource = (preset: UserLadderPreset) => {
    const status = checkPresetSourceSyncStatus(preset);
    if (!status.hasChanged) return;

    const updatedPreset: UserLadderPreset = {
      ...preset,
      playerCount: status.currentCount,
      originalMemberCount: status.currentCount,
      originalMembers: status.currentMembers,
    };
    const updated = personalLadderPresets.map((p) => (p.id === preset.id ? updatedPreset : p));
    setPersonalLadderPresets(updated);
    saveUserPersonalLadderPresets(updated);
    onNotify('✓ 사다리 프리셋 구성원이 동기화되었습니다.');
  };

  const handleSyncRoulettePresetWithSource = (preset: UserRoulettePreset) => {
    const status = checkPresetSourceSyncStatus(preset);
    if (!status.hasChanged) return;

    const updatedPreset: UserRoulettePreset = {
      ...preset,
      items: status.currentMembers.map((m, idx) => ({
        id: `it_sync_${idx}`,
        name: m,
        icon: preset.icon || '🎯',
        weight: 10,
      })),
      originalMemberCount: status.currentCount,
      originalMembers: status.currentMembers,
    };
    const updated = personalRoulettePresets.map((p) => (p.id === preset.id ? updatedPreset : p));
    setPersonalRoulettePresets(updated);
    saveUserPersonalRoulettePresets(updated);
    onNotify('✓ 룰렛 프리셋 구성원이 동기화되었습니다.');
  };

  const handleToggleMyStore = (storeId: string) => {
    setUserStorePref((prev) => {
      const exists = prev.myStoreIds.includes(storeId);
      const newIds = exists
        ? prev.myStoreIds.filter((id) => id !== storeId)
        : [...prev.myStoreIds, storeId];
      const newSelected = !newIds.includes(prev.selectedStoreId)
        ? newIds[0] || 'sys_store_pluscafe_45f'
        : prev.selectedStoreId;
      const next = {
        selectedStoreId: newSelected,
        myStoreIds: newIds,
      };
      saveUserStorePreference(next);
      return next;
    });
  };

  const handleSetDefaultStore = (storeId: string) => {
    setUserStorePref((prev) => {
      const next = {
        ...prev,
        selectedStoreId: storeId,
        myStoreIds: prev.myStoreIds.includes(storeId)
          ? prev.myStoreIds
          : [...prev.myStoreIds, storeId],
      };
      saveUserStorePreference(next);
      return next;
    });
  };

  return (
    <>
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

        {/* Sub-Tab 1: 단골 매장 관리 */}
        {storeSubTab === 'STORES' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
              <ElmSld03
                showNavButtons={false}
                className="max-w-full sm:max-w-md md:max-w-xl"
                innerClassName="gap-1.5 items-center py-0.5"
              >
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
                      className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs border border-slate-200 dark:border-zinc-700'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-white/60 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </ElmSld03>

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
                  onClick={() => setIsStoreExcelModalOpen(true)}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="매장 및 메뉴 엑셀 일괄 업로드/수정"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>📥 엑셀 업로드/등록</span>
                </button>
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
                  <span className="text-[10px]">
                    {showBaseStoreSection ? '▲ 닫기' : '▼ 펼치기'}
                  </span>
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

            {/* 기초 매장 선택 영역 */}
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

                          {linkedLadder.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block">
                                🪜 연계 기초 프리셋 ({linkedLadder.length}개):
                              </span>
                              {linkedLadder.map((lad) => (
                                <div
                                  key={lad.id}
                                  className="flex items-center justify-between text-[10px] bg-purple-50 dark:bg-purple-950/40 p-1 rounded"
                                >
                                  <span className="truncate max-w-[130px] text-purple-900 dark:text-purple-200">
                                    • {lad.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      copySystemLadderPresetsToUser(systemLadderList, [lad.id]);
                                      setPersonalLadderPresets(loadUserPersonalLadderPresets());
                                      onNotify(
                                        `✓ '${lad.title}' 사다리 프리셋이 내 프리셋에 등록되었습니다.`
                                      );
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
                  if (storeFilterCategory === 'CUSTOM')
                    return customStores.some((c) => c.id === s.id);
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

        {/* Sub-Tab 2: 사다리 게임 프리셋 관리 */}
        {storeSubTab === 'LADDER_PRESETS' && (
          <div className="space-y-6 animate-in fade-in">
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
                  <span>기초 프리셋 등록</span>
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
                  <span>직접 등록</span>
                </button>
              </div>
            </div>

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
                    기초 프리셋 등록
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalLadderPresets.map((preset) => {
                  const sourceStatus = checkPresetSourceSyncStatus(preset);
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0F17] hover:border-violet-300 dark:hover:border-violet-800 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 min-w-0">
                            <span>
                              {preset.category === 'COFFEE'
                                ? '☕'
                                : preset.category === 'LUNCH'
                                ? '🍱'
                                : '🧹'}
                            </span>
                            <span className="truncate">{preset.title}</span>
                          </h5>
                          <div className="flex items-center gap-1 flex-wrap shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-bold whitespace-nowrap">
                              {preset.playerCount}인 ({preset.winnerCount}명 당첨)
                            </span>
                            {preset.sourceType && preset.sourceType !== 'DIRECT' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold whitespace-nowrap">
                                {preset.sourceType === 'GOAL'
                                  ? '🎯 목표(룰렛 동시 적용)'
                                  : '🧹 당번(룰렛 동시 적용)'}
                              </span>
                            ) : preset.isCustomCreated ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold whitespace-nowrap">
                                수동등록
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                                기초복사
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {preset.description}
                        </p>

                        {sourceStatus.hasChanged && (
                          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                            <div className="flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span className="font-medium text-[11px]">
                                원본 구성원 변경됨: 기존 {sourceStatus.originalCount}명 ➔ 현재{' '}
                                {sourceStatus.currentCount}명
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSyncLadderPresetWithSource(preset)}
                              className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              동기화
                            </button>
                          </div>
                        )}

                        {preset.storeName && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                            <span>🏪</span>
                            <span>연계 매장: {preset.storeName}</span>
                          </div>
                        )}

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
                              {r.badgeText ? `[${r.badgeText}] ` : ''}
                              {r.label}
                            </span>
                          ))}
                        </div>
                      </div>

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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sub-Tab 3: 룰렛 게임 프리셋 관리 */}
        {storeSubTab === 'ROULETTE_PRESETS' && (
          <div className="space-y-6 animate-in fade-in">
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
                  <span>기초 프리셋 등록</span>
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
                  <span>직접 등록</span>
                </button>
              </div>
            </div>

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
                    기초 프리셋 등록
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalRoulettePresets.map((preset) => {
                  const sourceStatus = checkPresetSourceSyncStatus(preset);
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0B0F17] hover:border-amber-300 dark:hover:border-amber-800 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 min-w-0">
                            <span>{preset.icon || '🎯'}</span>
                            <span className="truncate">{preset.title}</span>
                          </h5>
                          <div className="flex items-center gap-1 flex-wrap shrink-0">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold whitespace-nowrap">
                              항목 {preset.items.length}개
                            </span>
                            {preset.sourceType && preset.sourceType !== 'DIRECT' ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold whitespace-nowrap">
                                {preset.sourceType === 'GOAL'
                                  ? '🎯 목표(룰렛 동시 적용)'
                                  : '🧹 당번(룰렛 동시 적용)'}
                              </span>
                            ) : preset.isCustomCreated ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold whitespace-nowrap">
                                수동등록
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                                기초복사
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {preset.description}
                        </p>

                        {sourceStatus.hasChanged && (
                          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                            <div className="flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span className="font-medium text-[11px]">
                                원본 구성원 변경됨: 기존 {sourceStatus.originalCount}명 ➔ 현재{' '}
                                {sourceStatus.currentCount}명
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSyncRoulettePresetWithSource(preset)}
                              className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              동기화
                            </button>
                          </div>
                        )}

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
                  );
                })}
              </div>
            )}
          </div>
        )}

        <aside className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-zinc-300">
            💡 개인화 프리셋 거버넌스 안내
          </p>
          <p>
            • 시스템 기초 프리셋을 가져오거나 수동으로 등록한 항목은 사용자 브라우저에 안전하게 독립 보관되며, 시스템 설정 원본에 영향을 주지 않습니다.
          </p>
          <p>
            • 등록된 사다리 및 룰렛 프리셋은 로그인 메인 대시보드의 '게임·정산 퀵런처'에 우선 바인딩되어 바로 플레이할 수 있습니다.
          </p>
        </aside>
      </section>

      {/* Store Menu Board Modal (전체 메뉴판 레이어 팝업) */}
      {selectedMenuStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overscroll-contain overflow-hidden">
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

            {showMenuCsvInput && (
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                  <span>메뉴 CSV 붙여넣기 (형식: 메뉴명,가격,분류)</span>
                  <button
                    type="button"
                    onClick={() => setShowMenuCsvInput(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={menuCsvText}
                  onChange={(e) => setMenuCsvText(e.target.value)}
                  placeholder={'예: 카페모카,5500,커피\n자몽허니블랙티,6000,티'}
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
                .filter(
                  (m) => menuModalCategory === '전체' || m.categoryName === menuModalCategory
                )
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

      {/* 개인화 팝업 모달 6종 */}
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

      <LadderManualModal
        isOpen={isLadderManualModalOpen}
        onClose={() => {
          setIsLadderManualModalOpen(false);
          setEditingLadderPreset(null);
        }}
        preset={editingLadderPreset}
        availableStores={getAllAvailableStorePool()}
        onSave={handleSavePersonalLadderPreset}
        onNotify={onNotify}
      />

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

      <RouletteManualModal
        isOpen={isRouletteManualModalOpen}
        onClose={() => {
          setIsRouletteManualModalOpen(false);
          setEditingRoulettePreset(null);
        }}
        preset={editingRoulettePreset}
        onSave={handleSavePersonalRoulettePreset}
        onNotify={onNotify}
      />

      <StoreManualModal
        isOpen={isStoreManualModalOpen}
        onClose={() => {
          setIsStoreManualModalOpen(false);
          setEditingCustomStore(null);
        }}
        store={editingCustomStore}
        onSave={handleSaveCustomStore}
        onNotify={onNotify}
      />

      <StoreExcelModal
        isOpen={isStoreExcelModalOpen}
        onClose={() => setIsStoreExcelModalOpen(false)}
        onUploadSuccess={(importedStores) => {
          const updated = [...importedStores, ...customStores];
          setCustomStores(updated);
          saveUserCustomStores(updated);
          const nextPref = {
            ...userStorePref,
            myStoreIds: Array.from(
              new Set([...userStorePref.myStoreIds, ...importedStores.map((s) => s.id)])
            ),
          };
          setUserStorePref(nextPref);
          saveUserStorePreference(nextPref);
          setIsStoreExcelModalOpen(false);
          onNotify(`✓ ${importedStores.length}개 매장이 일괄 등록되었습니다.`);
        }}
      />
    </>
  );
};
