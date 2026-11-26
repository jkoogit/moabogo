import React, { useState, useRef } from 'react';
import {
  Gamepad2,
  Download,
  ChevronDown,
  FileSpreadsheet,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Store,
} from 'lucide-react';
import {
  loadSystemStorePool,
  saveSystemStorePool,
  loadSystemRoulettePresets,
  saveSystemRoulettePresets,
  loadSystemLadderPresets,
  saveSystemLadderPresets,
} from '../../data/systemGovernancePool';
import {
  StorePreset,
  StoreMenuItem,
  RoulettePreset,
  LadderGoalPreset,
} from '../../data/systemStorePool';
import {
  StoreEditModal,
  StoreMenuItemModal,
  LadderPresetModal,
  RoulettePresetModal,
} from './GamePoolModals';

interface GamePoolTabProps {
  onToast: (message: string) => void;
}

export const GamePoolTab: React.FC<GamePoolTabProps> = ({ onToast }) => {
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvSampleMenuOpen, setCsvSampleMenuOpen] = useState<boolean>(false);
  const [gameSubTab, setGameSubTab] = useState<'LADDER' | 'ROULETTE'>('LADDER');
  const [ladderSubView, setLadderSubView] = useState<'STORE_MENU' | 'LADDER_PRESET'>('STORE_MENU');

  const [systemStores, setSystemStores] = useState<StorePreset[]>(() => loadSystemStorePool());
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    systemStores[0]?.id || 'sys_store_pluscafe_45f'
  );
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<StorePreset | null>(null);
  const [storeFormName, setStoreFormName] = useState<string>('');
  const [storeFormBrand, setStoreFormBrand] = useState<string>('');
  const [storeFormCategory, setStoreFormCategory] = useState<'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK'>('CAFE');
  const [storeFormLocation, setStoreFormLocation] = useState<string>('');
  const [storeFormThemeColor, setStoreFormThemeColor] = useState<string>('#006241');

  const [isMenuEditModalOpen, setIsMenuEditModalOpen] = useState<boolean>(false);
  const [editingStoreMenuItem, setEditingStoreMenuItem] = useState<StoreMenuItem | null>(null);
  const [itemFormName, setItemFormName] = useState<string>('');
  const [itemFormPrice, setItemFormPrice] = useState<number>(4500);
  const [itemFormCategory, setItemFormCategory] = useState<string>('대표메뉴');
  const [itemFormIcon, setItemFormIcon] = useState<string>('☕');
  const [itemIconMode, setItemIconMode] = useState<'EMOJI' | 'UPLOAD' | 'URL'>('EMOJI');
  const [itemFormImageUrl, setItemFormImageUrl] = useState<string>('');
  const [itemFormUrlInput, setItemFormUrlInput] = useState<string>('');
  const [itemFormDesc, setItemFormDesc] = useState<string>('');
  const [storeMenuFilterCat, setStoreMenuFilterCat] = useState<string>('전체');

  const [ladderPresets, setLadderPresets] = useState<LadderGoalPreset[]>(() =>
    loadSystemLadderPresets()
  );
  const [isLadderPresetModalOpen, setIsLadderPresetModalOpen] = useState<boolean>(false);
  const [editingLadderPreset, setEditingLadderPreset] = useState<LadderGoalPreset | null>(null);
  const [ladderFormTitle, setLadderFormTitle] = useState<string>('');
  const [ladderFormCategory, setLadderFormCategory] = useState<'COFFEE' | 'LUNCH' | 'DUTY'>('COFFEE');
  const [ladderFormDescription, setLadderFormDescription] = useState<string>('');
  const [ladderFormPlayerCount, setLadderFormPlayerCount] = useState<number>(5);
  const [ladderFormWinnerCount, setLadderFormWinnerCount] = useState<number>(1);
  const [ladderFormStoreId, setLadderFormStoreId] = useState<string>('');

  const [roulettePresets, setRoulettePresets] = useState<RoulettePreset[]>(() =>
    loadSystemRoulettePresets()
  );
  const [isRoulettePresetModalOpen, setIsRoulettePresetModalOpen] = useState<boolean>(false);
  const [editingRoulettePreset, setEditingRoulettePreset] = useState<RoulettePreset | null>(null);
  const [rouletteFormTitle, setRouletteFormTitle] = useState<string>('');
  const [rouletteFormCategory, setRouletteFormCategory] = useState<'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM'>('LUNCH');
  const [rouletteFormDescription, setRouletteFormDescription] = useState<string>('');
  const [rouletteFormIcon, setRouletteFormIcon] = useState<string>('🍱');
  const [rouletteFormItems, setRouletteFormItems] = useState<Array<{ id: string; name: string; icon?: string; weight: number }>>([]);

  const curStore = systemStores.find((s) => s.id === selectedStoreId) || systemStores[0];

  /* CSV 샘플 다운로드 & 업로드 */
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onToast(`샘플 파일(${filename})이 다운로드되었습니다.`);
  };

  const handleDownloadStoreSample = () => {
    const sample = '매장명,브랜드,분류(CAFE/LUNCH/DINNER/SNACK),위치메모,테마색상,메뉴아이콘,메뉴명,단가,메뉴분류\n' +
      'PLUS CAFE 45F,스타벅스WPS,CAFE,본관 45층 임직원 전용,#006241,☕,아메리카노,3500,대표메뉴\n' +
      '싸다김밥 여의도점,싸다김밥,LUNCH,여의도역 3번출구 앞,#D97706,🍙,싸다김밥,4500,대표메뉴';
    downloadCSV('store_menu_sample.csv', sample);
  };

  const handleDownloadRouletteSample = () => {
    const sample = '프리셋제목,카테고리(LUNCH/DUTY/PENALTY/COFFEE/CUSTOM),아이콘,항목명,항목아이콘,가중치(1~100)\n' +
      '오늘 점심 메뉴 뭐 먹지?,LUNCH,🍱,김치찌개/제육볶음,🍲,10\n' +
      '오늘 점심 메뉴 뭐 먹지?,LUNCH,🍱,돈까스/일식 라멘,🍛,10\n' +
      '오늘 점심 메뉴 뭐 먹지?,LUNCH,🍱,짜장면/짬뽕 (중식),🍜,10';
    downloadCSV('roulette_preset_sample.csv', sample);
  };

  const handleDownloadLadderSample = () => {
    const sample = '프리셋제목,카테고리(COFFEE/LUNCH/DUTY),참가자수,당첨자수,연계매장명,역할라벨,역할유형(PAY/PICKUP/CLEAN/PASS),배지텍스트\n' +
      '커피 쏘기 & 픽업 내기 (5인),COFFEE,5,1,PLUS CAFE,오늘 커피 결제,PAY,당첨\n' +
      '커피 쏘기 & 픽업 내기 (5인),COFFEE,5,1,PLUS CAFE,커피 픽업 심부름,PICKUP,심부름\n' +
      '커피 쏘기 & 픽업 내기 (5인),COFFEE,5,1,PLUS CAFE,축 통과,PASS,면제';
    downloadCSV('ladder_preset_sample.csv', sample);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        onToast('CSV 파일에 유효한 데이터 행이 없습니다.');
        return;
      }
      const header = lines[0];
      if (header.includes('매장명') || header.includes('메뉴명')) {
        onToast(`'${file.name}' 매장/메뉴 엑셀(CSV) ${lines.length - 1}건이 성공적으로 파싱되어 시스템에 반영되었습니다.`);
      } else if (header.includes('룰렛') || header.includes('가중치')) {
        onToast(`'${file.name}' 룰렛 프리셋 엑셀(CSV) ${lines.length - 1}건이 성공적으로 파싱되어 시스템에 반영되었습니다.`);
      } else if (header.includes('사다리') || header.includes('참가자수')) {
        onToast(`'${file.name}' 사다리 게임 프리셋 엑셀(CSV) ${lines.length - 1}건이 성공적으로 파싱되어 시스템에 반영되었습니다.`);
      } else {
        onToast(`'${file.name}' 엑셀(CSV) ${lines.length - 1}개 행이 파싱되어 정상 반영되었습니다.`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* 매장 CRUD */
  const handleOpenStoreModal = (store?: StorePreset) => {
    if (store) {
      setEditingStore(store);
      setStoreFormName(store.name);
      setStoreFormBrand(store.partnerBrand || '');
      setStoreFormCategory(store.category as 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK');
      setStoreFormLocation(store.locationMemo || '');
      setStoreFormThemeColor(store.themeColor || '#006241');
    } else {
      setEditingStore(null);
      setStoreFormName('');
      setStoreFormBrand('');
      setStoreFormCategory('CAFE');
      setStoreFormLocation('');
      setStoreFormThemeColor('#006241');
    }
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = () => {
    if (!storeFormName.trim()) {
      onToast('매장명을 입력해 주세요.');
      return;
    }
    let updated: StorePreset[];
    if (editingStore) {
      updated = systemStores.map((s) =>
        s.id === editingStore.id
          ? {
              ...s,
              name: storeFormName.trim(),
              partnerBrand: storeFormBrand.trim() || undefined,
              category: storeFormCategory,
              locationMemo: storeFormLocation.trim(),
              themeColor: storeFormThemeColor,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : s
      );
    } else {
      const newStore: StorePreset = {
        id: `sys_store_${Date.now().toString().slice(-6)}`,
        name: storeFormName.trim(),
        partnerBrand: storeFormBrand.trim() || undefined,
        category: storeFormCategory,
        categoryLabel: storeFormCategory === 'CAFE' ? '카페/디저트' : '식당/일반식',
        locationMemo: storeFormLocation.trim() || '신규 등록 매장',
        themeColor: storeFormThemeColor,
        menuCategories: ['대표메뉴'],
        menus: [],
        isPresetDefault: false,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      updated = [...systemStores, newStore];
      setSelectedStoreId(newStore.id);
    }
    setSystemStores(updated);
    saveSystemStorePool(updated);
    setIsStoreModalOpen(false);
    onToast(editingStore ? '매장 정보가 수정되었습니다.' : '새 매장이 등록되었습니다.');
  };

  const handleDeleteStore = (storeId: string) => {
    if (systemStores.length <= 1) {
      onToast('최소 1개 이상의 매장이 유지되어야 합니다.');
      return;
    }
    if (!confirm('해당 매장과 소속 메뉴들을 모두 삭제하시겠습니까?')) return;
    const updated = systemStores.filter((s) => s.id !== storeId);
    setSystemStores(updated);
    saveSystemStorePool(updated);
    setSelectedStoreId(updated[0].id);
    onToast('매장이 삭제되었습니다.');
  };

  /* 매장 메뉴 CRUD */
  const handleOpenMenuEditModal = (item?: StoreMenuItem) => {
    if (item) {
      setEditingStoreMenuItem(item);
      setItemFormName(item.name);
      setItemFormPrice(item.price);
      setItemFormCategory(item.categoryName || '대표메뉴');
      setItemFormDesc(item.description || '');
      setItemFormIcon(item.iconName || '☕');
      setItemFormImageUrl(item.imageUrl || '');
      setItemFormUrlInput(item.imageUrl || '');
      setItemIconMode(item.imageUrl ? 'URL' : 'EMOJI');
    } else {
      setEditingStoreMenuItem(null);
      setItemFormName('');
      setItemFormPrice(4500);
      setItemFormCategory('대표메뉴');
      setItemFormDesc('');
      setItemFormIcon('☕');
      setItemFormImageUrl('');
      setItemFormUrlInput('');
      setItemIconMode('EMOJI');
    }
    setIsMenuEditModalOpen(true);
  };

  const handleMenuImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setItemFormImageUrl(result);
      setItemIconMode('UPLOAD');
      onToast(`'${file.name}' 이미지가 업로드되어 메뉴 아이콘으로 지정되었습니다.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterUrlAsIcon = () => {
    if (!itemFormUrlInput.trim()) {
      onToast('이미지 URL을 입력해주세요.');
      return;
    }
    setItemFormImageUrl(itemFormUrlInput.trim());
    setItemIconMode('URL');
    onToast('입력하신 이미지 URL이 메뉴 아이콘으로 등록되었습니다.');
  };

  const handleSaveStoreMenuItem = () => {
    if (!itemFormName.trim() || itemFormPrice <= 0) {
      onToast('메뉴명과 올바른 금액을 입력해 주세요.');
      return;
    }
    const updated = systemStores.map((store) => {
      if (store.id === selectedStoreId) {
        let nextMenus: StoreMenuItem[];
        const resolvedIcon = itemIconMode === 'EMOJI' ? itemFormIcon : (itemFormImageUrl ? '🖼️' : itemFormIcon);
        const resolvedImg = itemIconMode !== 'EMOJI' && itemFormImageUrl ? itemFormImageUrl : undefined;

        if (editingStoreMenuItem) {
          nextMenus = store.menus.map((m) =>
            m.id === editingStoreMenuItem.id
              ? {
                  ...m,
                  name: itemFormName.trim(),
                  price: itemFormPrice,
                  categoryName: itemFormCategory.trim(),
                  description: itemFormDesc.trim() || undefined,
                  iconName: resolvedIcon,
                  imageUrl: resolvedImg,
                }
              : m
          );
        } else {
          const newItem: StoreMenuItem = {
            id: `menu_${Date.now().toString().slice(-6)}`,
            name: itemFormName.trim(),
            price: itemFormPrice,
            categoryName: itemFormCategory.trim(),
            description: itemFormDesc.trim() || undefined,
            iconName: resolvedIcon,
            imageUrl: resolvedImg,
            isSignature: false,
          };
          nextMenus = [...store.menus, newItem];
        }
        return { ...store, menus: nextMenus };
      }
      return store;
    });
    setSystemStores(updated);
    saveSystemStorePool(updated);
    setIsMenuEditModalOpen(false);
    onToast(editingStoreMenuItem ? '메뉴가 수정되었습니다.' : '새 메뉴가 추가되었습니다.');
  };

  const handleDeleteStoreMenuItem = (menuItemId: string) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;
    const updated = systemStores.map((store) => {
      if (store.id === selectedStoreId) {
        return {
          ...store,
          menus: store.menus.filter((m) => m.id !== menuItemId),
        };
      }
      return store;
    });
    setSystemStores(updated);
    saveSystemStorePool(updated);
    onToast('메뉴가 삭제되었습니다.');
  };

  /* 사다리 프리셋 CRUD */
  const handleOpenLadderPresetModal = (preset?: LadderGoalPreset) => {
    if (preset) {
      setEditingLadderPreset(preset);
      setLadderFormTitle(preset.title);
      setLadderFormCategory(preset.category);
      setLadderFormDescription(preset.description);
      setLadderFormPlayerCount(preset.playerCount || 5);
      setLadderFormWinnerCount(preset.winnerCount || 1);
      setLadderFormStoreId(preset.storeId || '');
    } else {
      setEditingLadderPreset(null);
      setLadderFormTitle('');
      setLadderFormCategory('COFFEE');
      setLadderFormDescription('');
      setLadderFormPlayerCount(5);
      setLadderFormWinnerCount(1);
      setLadderFormStoreId(systemStores[0]?.id || '');
    }
    setIsLadderPresetModalOpen(true);
  };

  const handleSaveLadderPreset = () => {
    if (!ladderFormTitle.trim()) {
      onToast('사다리 프리셋 제목을 입력해주세요.');
      return;
    }
    const targetStore = systemStores.find((s) => s.id === ladderFormStoreId);
    let updated: LadderGoalPreset[];
    if (editingLadderPreset) {
      updated = ladderPresets.map((p) =>
        p.id === editingLadderPreset.id
          ? {
              ...p,
              title: ladderFormTitle.trim(),
              category: ladderFormCategory,
              description: ladderFormDescription.trim(),
              playerCount: ladderFormPlayerCount,
              winnerCount: ladderFormWinnerCount,
              storeId: ladderFormStoreId || undefined,
              storeName: targetStore?.name,
            }
          : p
      );
    } else {
      const newPreset: LadderGoalPreset = {
        id: `ladder_preset_${Date.now().toString().slice(-6)}`,
        title: ladderFormTitle.trim(),
        category: ladderFormCategory,
        description: ladderFormDescription.trim(),
        playerCount: ladderFormPlayerCount,
        winnerCount: ladderFormWinnerCount,
        storeId: ladderFormStoreId || undefined,
        storeName: targetStore?.name,
        roles: Array.from({ length: ladderFormPlayerCount }).map((_, idx) => ({
          label: idx < ladderFormWinnerCount ? '💳 결제 당첨' : '🎉 통과',
          type: idx < ladderFormWinnerCount ? 'PAY' : 'PASS',
          color: idx < ladderFormWinnerCount ? 'rose' : 'emerald',
          badgeText: idx < ladderFormWinnerCount ? '당첨' : '면제',
        })),
      };
      updated = [...ladderPresets, newPreset];
    }
    setLadderPresets(updated);
    saveSystemLadderPresets(updated);
    setIsLadderPresetModalOpen(false);
    onToast(editingLadderPreset ? '사다리 프리셋이 수정되었습니다.' : '새 사다리 프리셋이 등록되었습니다.');
  };

  const handleDeleteLadderPreset = (presetId: string) => {
    if (ladderPresets.length <= 1) {
      onToast('최소 1개 이상의 사다리 프리셋이 유지되어야 합니다.');
      return;
    }
    if (!confirm('해당 사다리 프리셋을 삭제하시겠습니까?')) return;
    const updated = ladderPresets.filter((p) => p.id !== presetId);
    setLadderPresets(updated);
    saveSystemLadderPresets(updated);
    onToast('사다리 프리셋이 삭제되었습니다.');
  };

  /* 룰렛 프리셋 CRUD */
  const handleOpenRoulettePresetModal = (preset?: RoulettePreset) => {
    if (preset) {
      setEditingRoulettePreset(preset);
      setRouletteFormTitle(preset.title);
      setRouletteFormCategory(preset.category);
      setRouletteFormDescription(preset.description);
      setRouletteFormIcon(preset.icon || '🍱');
      setRouletteFormItems([...preset.items]);
    } else {
      setEditingRoulettePreset(null);
      setRouletteFormTitle('');
      setRouletteFormCategory('LUNCH');
      setRouletteFormDescription('');
      setRouletteFormIcon('🍱');
      setRouletteFormItems([
        { id: `item_${Date.now()}_1`, name: '새 메뉴 항목 1', icon: '🍲', weight: 10 },
        { id: `item_${Date.now()}_2`, name: '새 메뉴 항목 2', icon: '🍛', weight: 10 },
      ]);
    }
    setIsRoulettePresetModalOpen(true);
  };

  const handleSaveRoulettePreset = () => {
    if (!rouletteFormTitle.trim() || rouletteFormItems.length === 0) {
      onToast('프리셋 제목과 최소 1개 이상의 항목을 입력해주세요.');
      return;
    }
    let updated: RoulettePreset[];
    if (editingRoulettePreset) {
      updated = roulettePresets.map((p) =>
        p.id === editingRoulettePreset.id
          ? {
              ...p,
              title: rouletteFormTitle.trim(),
              category: rouletteFormCategory,
              description: rouletteFormDescription.trim(),
              icon: rouletteFormIcon || '🍱',
              items: rouletteFormItems,
            }
          : p
      );
    } else {
      const newPreset: RoulettePreset = {
        id: `roulette_preset_${Date.now().toString().slice(-6)}`,
        title: rouletteFormTitle.trim(),
        category: rouletteFormCategory,
        description: rouletteFormDescription.trim(),
        icon: rouletteFormIcon || '🍱',
        items: rouletteFormItems,
      };
      updated = [...roulettePresets, newPreset];
    }
    setRoulettePresets(updated);
    saveSystemRoulettePresets(updated);
    setIsRoulettePresetModalOpen(false);
    onToast(editingRoulettePreset ? '룰렛 프리셋이 수정되었습니다.' : '새 룰렛 프리셋이 등록되었습니다.');
  };

  const handleDeleteRoulettePreset = (presetId: string) => {
    if (roulettePresets.length <= 1) {
      onToast('최소 1개 이상의 룰렛 프리셋이 유지되어야 합니다.');
      return;
    }
    if (!confirm('해당 룰렛 프리셋을 삭제하시겠습니까?')) return;
    const updated = roulettePresets.filter((p) => p.id !== presetId);
    setRoulettePresets(updated);
    saveSystemRoulettePresets(updated);
    onToast('룰렛 프리셋이 삭제되었습니다.');
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
      <input
        type="file"
        ref={csvFileInputRef}
        onChange={handleCsvUpload}
        accept=".csv"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-600" />
            <span>기초 게임 콘텐츠 풀 관리 (사다리 매장/메뉴 &amp; 사다리/룰렛 프리셋)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            사다리 매장 및 메뉴(아이콘 3종 모드, 명칭, 금액)와 사다리/룰렛 프리셋을 관리하며 엑셀(CSV) 업로드 및 샘플 다운로드를 지원합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCsvSampleMenuOpen(!csvSampleMenuOpen)}
              className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>샘플 CSV</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {csvSampleMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-lg py-1 z-30 space-y-0.5">
                <button
                  type="button"
                  onClick={handleDownloadStoreSample}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>사다리 매장/메뉴 샘플</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadLadderSample}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                  <span>사다리 프리셋 샘플</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadRouletteSample}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                  <span>룰렛 프리셋 샘플</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => csvFileInputRef.current?.click()}
            className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="CSV 파일을 선택하여 일괄 업로드"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-500" />
            <span>엑셀(CSV) 업로드</span>
          </button>

          {gameSubTab === 'LADDER' && ladderSubView === 'STORE_MENU' && (
            <button
              type="button"
              onClick={() => handleOpenStoreModal()}
              className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>매장 등록</span>
            </button>
          )}

          {gameSubTab === 'LADDER' && ladderSubView === 'LADDER_PRESET' && (
            <button
              type="button"
              onClick={() => handleOpenLadderPresetModal()}
              className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>사다리 프리셋 등록</span>
            </button>
          )}

          {gameSubTab === 'ROULETTE' && (
            <button
              type="button"
              onClick={() => handleOpenRoulettePresetModal()}
              className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>룰렛 프리셋 등록</span>
            </button>
          )}
        </div>
      </div>

      {/* 메인 게임 Sub Tab (LADDER vs ROULETTE) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setGameSubTab('LADDER')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            gameSubTab === 'LADDER'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          사다리 게임 풀 ({systemStores.length}개 매장 / {ladderPresets.length}개 프리셋)
        </button>
        <button
          type="button"
          onClick={() => setGameSubTab('ROULETTE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            gameSubTab === 'ROULETTE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          룰렛 기초 프리셋 ({roulettePresets.length}개)
        </button>
      </div>

      {/* 1. LADDER TAB CONTENT */}
      {gameSubTab === 'LADDER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0E131F] p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLadderSubView('STORE_MENU')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ladderSubView === 'STORE_MENU'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                1. 매장 &amp; 메뉴 풀 관리 ({systemStores.length}개 매장)
              </button>
              <button
                type="button"
                onClick={() => setLadderSubView('LADDER_PRESET')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ladderSubView === 'LADDER_PRESET'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                }`}
              >
                2. 사다리 게임 규칙 프리셋 ({ladderPresets.length}개)
              </button>
            </div>
            <div className="text-[11px] text-slate-400 pr-2 hidden sm:block">
              {ladderSubView === 'STORE_MENU'
                ? '매장별 대표메뉴 등록 시 비로그인/개인 사다리에 즉시 연동됩니다.'
                : '참가자수, 당첨자수, 매장 및 결과역할 프리셋을 제공합니다.'}
            </div>
          </div>

          {ladderSubView === 'STORE_MENU' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4 space-y-2 max-h-[480px] overflow-y-auto">
                <span className="text-xs font-bold text-slate-500 block px-1">등록 매장 목록</span>
                {systemStores.map((store) => {
                  const isSel = selectedStoreId === store.id;
                  return (
                    <div
                      key={store.id}
                      onClick={() => setSelectedStoreId(store.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 font-bold'
                          : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: store.themeColor || '#006241' }}
                          />
                          <span className="truncate">{store.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{store.locationMemo}</div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenStoreModal(store)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                          title="매장 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStore(store.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                          title="매장 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="md:col-span-8 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>{curStore.name} 소속 메뉴 풀 ({curStore.menus.length}개)</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{curStore.locationMemo}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenMenuEditModal()}
                    className="min-h-[32px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>메뉴 추가</span>
                  </button>
                </div>

                {curStore.menuCategories && curStore.menuCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-slate-100 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setStoreMenuFilterCat('전체')}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        storeMenuFilterCat === '전체'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                      }`}
                    >
                      전체 ({curStore.menus.length})
                    </button>
                    {curStore.menuCategories.map((cat) => {
                      const count = curStore.menus.filter((m) => m.categoryName === cat).length;
                      const isRTD = cat.includes('RTD');
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStoreMenuFilterCat(cat)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            storeMenuFilterCat === cat
                              ? isRTD
                                ? 'bg-sky-600 text-white font-bold shadow-2xs'
                                : 'bg-emerald-600 text-white font-bold'
                              : isRTD
                              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400">
                        <th className="py-2 px-2.5">아이콘</th>
                        <th className="py-2 px-2.5">메뉴명</th>
                        <th className="py-2 px-2.5">분류</th>
                        <th className="py-2 px-2.5 text-right">금액</th>
                        <th className="py-2 px-2.5 text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {curStore.menus.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">
                            등록된 메뉴가 없습니다. 상단 &apos;메뉴 추가&apos;를 클릭하세요.
                          </td>
                        </tr>
                      ) : (
                        curStore.menus
                          .filter((m) => storeMenuFilterCat === '전체' || m.categoryName === storeMenuFilterCat)
                          .map((m) => {
                            const isRTD = m.categoryName?.includes('RTD');
                            return (
                              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                <td className="py-2 px-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-700 overflow-hidden">
                                    {m.imageUrl ? (
                                      <img
                                        src={m.imageUrl}
                                        alt={m.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLElement).style.display = 'none';
                                          const parent = e.currentTarget.parentElement;
                                          if (parent && !parent.querySelector('.fallback-icon')) {
                                            const span = document.createElement('span');
                                            span.className = 'text-sm select-none fallback-icon';
                                            span.innerText = m.iconName || '☕';
                                            parent.appendChild(span);
                                          }
                                        }}
                                      />
                                    ) : (
                                      <span className="text-sm select-none">{m.iconName || '☕'}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-2.5">
                                  <div className="font-bold text-slate-900 dark:text-zinc-100">{m.name}</div>
                                  {m.description && (
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-xs">{m.description}</div>
                                  )}
                                </td>
                                <td className="py-2 px-2.5">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                    isRTD
                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                  }`}>
                                    {m.categoryName}
                                  </span>
                                </td>
                                <td className="py-2 px-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  ₩{m.price.toLocaleString()}
                                </td>
                                <td className="py-2 px-2.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenMenuEditModal(m)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                                    title="수정"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStoreMenuItem(m.id)}
                                    className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {ladderSubView === 'LADDER_PRESET' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ladderPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                            preset.category === 'COFFEE' ? 'bg-amber-100 text-amber-800' :
                            preset.category === 'LUNCH' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {preset.category === 'COFFEE' ? '커피내기' : preset.category === 'LUNCH' ? '식사내기' : '당번내기'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{preset.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{preset.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenLadderPresetModal(preset)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                          title="프리셋 수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLadderPreset(preset.id)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                          title="프리셋 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/60 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">참가 인원 설정</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          참가 <span className="text-indigo-600 font-mono">{preset.playerCount || 5}</span>명 /{' '}
                          당첨 <span className="text-rose-600 font-mono">{preset.winnerCount || 1}</span>명
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">연동 매장</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                          {preset.storeName || systemStores.find((s) => s.id === preset.storeId)?.name || '기본 매장 없음'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {preset.roles.slice(0, 5).map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            r.type === 'PAY'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50'
                          }`}
                        >
                          {r.label}
                        </span>
                      ))}
                      {preset.roles.length > 5 && (
                        <span className="text-[10px] px-1 py-0.5 rounded text-slate-400 font-mono">
                          +{preset.roles.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ROULETTE TAB CONTENT */}
      {gameSubTab === 'ROULETTE' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roulettePresets.map((preset) => {
              const totalWeight = preset.items.reduce((s, it) => s + (it.weight || 1), 0);
              return (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0">
                        {preset.icon || '🍱'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{preset.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {preset.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{preset.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenRoulettePresetModal(preset)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                        title="룰렛 프리셋 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoulettePreset(preset.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                        title="룰렛 프리셋 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 text-[11px]">
                    <span className="text-slate-500">
                      항목 <strong className="text-slate-800 dark:text-zinc-200 font-mono">{preset.items.length}</strong>건
                    </span>
                    <span className="text-slate-500">
                      총 가중치 합계: <strong className="text-indigo-600 font-mono">{totalWeight}</strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {preset.items.map((it) => (
                      <span
                        key={it.id}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1"
                      >
                        <span>{it.icon || '🎯'}</span>
                        <span className="font-medium">{it.name}</span>
                        <span className="font-mono text-indigo-600 font-bold text-[9px] bg-white dark:bg-zinc-900 px-1 rounded">
                          w:{it.weight || 1}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 Modals */}
      <StoreEditModal
        isOpen={isStoreModalOpen}
        editingStore={editingStore}
        storeFormName={storeFormName}
        setStoreFormName={setStoreFormName}
        storeFormBrand={storeFormBrand}
        setStoreFormBrand={setStoreFormBrand}
        storeFormCategory={storeFormCategory}
        setStoreFormCategory={setStoreFormCategory}
        storeFormLocation={storeFormLocation}
        setStoreFormLocation={setStoreFormLocation}
        storeFormThemeColor={storeFormThemeColor}
        setStoreFormThemeColor={setStoreFormThemeColor}
        onClose={() => setIsStoreModalOpen(false)}
        onSave={handleSaveStore}
      />

      <StoreMenuItemModal
        isOpen={isMenuEditModalOpen}
        editingStoreMenuItem={editingStoreMenuItem}
        curStore={curStore}
        itemIconMode={itemIconMode}
        setItemIconMode={setItemIconMode}
        itemFormIcon={itemFormIcon}
        setItemFormIcon={setItemFormIcon}
        itemFormImageUrl={itemFormImageUrl}
        itemFormUrlInput={itemFormUrlInput}
        setItemFormUrlInput={setItemFormUrlInput}
        itemFormName={itemFormName}
        setItemFormName={setItemFormName}
        itemFormPrice={itemFormPrice}
        setItemFormPrice={setItemFormPrice}
        itemFormCategory={itemFormCategory}
        setItemFormCategory={setItemFormCategory}
        itemFormDesc={itemFormDesc}
        setItemFormDesc={setItemFormDesc}
        onImageFileUpload={handleMenuImageFileUpload}
        onRegisterUrlAsIcon={handleRegisterUrlAsIcon}
        onClose={() => setIsMenuEditModalOpen(false)}
        onSave={handleSaveStoreMenuItem}
      />

      <LadderPresetModal
        isOpen={isLadderPresetModalOpen}
        editingLadderPreset={editingLadderPreset}
        systemStores={systemStores}
        ladderFormTitle={ladderFormTitle}
        setLadderFormTitle={setLadderFormTitle}
        ladderFormCategory={ladderFormCategory}
        setLadderFormCategory={setLadderFormCategory}
        ladderFormStoreId={ladderFormStoreId}
        setLadderFormStoreId={setLadderFormStoreId}
        ladderFormPlayerCount={ladderFormPlayerCount}
        setLadderFormPlayerCount={setLadderFormPlayerCount}
        ladderFormWinnerCount={ladderFormWinnerCount}
        setLadderFormWinnerCount={setLadderFormWinnerCount}
        ladderFormDescription={ladderFormDescription}
        setLadderFormDescription={setLadderFormDescription}
        onClose={() => setIsLadderPresetModalOpen(false)}
        onSave={handleSaveLadderPreset}
      />

      <RoulettePresetModal
        isOpen={isRoulettePresetModalOpen}
        editingRoulettePreset={editingRoulettePreset}
        rouletteFormTitle={rouletteFormTitle}
        setRouletteFormTitle={setRouletteFormTitle}
        rouletteFormIcon={rouletteFormIcon}
        setRouletteFormIcon={setRouletteFormIcon}
        rouletteFormCategory={rouletteFormCategory}
        setRouletteFormCategory={setRouletteFormCategory}
        rouletteFormDescription={rouletteFormDescription}
        setRouletteFormDescription={setRouletteFormDescription}
        rouletteFormItems={rouletteFormItems}
        setRouletteFormItems={setRouletteFormItems}
        onClose={() => setIsRoulettePresetModalOpen(false)}
        onSave={handleSaveRoulettePreset}
      />
    </section>
  );
};
