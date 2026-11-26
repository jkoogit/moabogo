import React from 'react';
import { X, Trash2 } from 'lucide-react';
import {
  StorePreset,
  StoreMenuItem,
  RoulettePreset,
  LadderGoalPreset,
} from '../../data/systemStorePool';

export const DEFAULT_MENU_ICONS = ['☕', '🥪', '🥗', '🍜', '🍰', '🥤', '🍱', '🍲', '🍕', '🍔', '🍙', '🍢', '🍦', '🍪'];

/* =========================================================================
   1. 매장 등록/수정 모달
   ========================================================================= */
interface StoreEditModalProps {
  isOpen: boolean;
  editingStore: StorePreset | null;
  storeFormName: string;
  setStoreFormName: (v: string) => void;
  storeFormBrand: string;
  setStoreFormBrand: (v: string) => void;
  storeFormCategory: 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK';
  setStoreFormCategory: (v: 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK') => void;
  storeFormLocation: string;
  setStoreFormLocation: (v: string) => void;
  storeFormThemeColor: string;
  setStoreFormThemeColor: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const StoreEditModal: React.FC<StoreEditModalProps> = ({
  isOpen,
  editingStore,
  storeFormName,
  setStoreFormName,
  storeFormBrand,
  setStoreFormBrand,
  storeFormCategory,
  setStoreFormCategory,
  storeFormLocation,
  setStoreFormLocation,
  storeFormThemeColor,
  setStoreFormThemeColor,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{editingStore ? '매장 수정' : '신규 매장 등록'}</h4>
          <button type="button" onClick={onClose}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">매장명</label>
            <input
              type="text"
              value={storeFormName}
              onChange={(e) => setStoreFormName(e.target.value)}
              placeholder="예: PLUS CAFE 45층"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">파트너 브랜드</label>
            <input
              type="text"
              value={storeFormBrand}
              onChange={(e) => setStoreFormBrand(e.target.value)}
              placeholder="예: WPS 스타벅스"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">업종 카테고리</label>
            <select
              value={storeFormCategory}
              onChange={(e) => setStoreFormCategory(e.target.value as 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK')}
              className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            >
              <option value="CAFE">카페 &amp; 베이커리</option>
              <option value="LUNCH">점심 식사 &amp; 한식</option>
              <option value="DINNER">저녁 회식 &amp; 주점</option>
              <option value="SNACK">분식 &amp; 간편식</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">위치 메모</label>
            <input
              type="text"
              value={storeFormLocation}
              onChange={(e) => setStoreFormLocation(e.target.value)}
              placeholder="예: 여의도 63빌딩 45층"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">테마 컬러</label>
            <input
              type="color"
              value={storeFormThemeColor}
              onChange={(e) => setStoreFormThemeColor(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border bg-slate-50 cursor-pointer"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
          <button type="button" onClick={onSave} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. 매장 메뉴 등록/수정 모달 (아이콘 3모드)
   ========================================================================= */
interface StoreMenuItemModalProps {
  isOpen: boolean;
  editingStoreMenuItem: StoreMenuItem | null;
  curStore: StorePreset;
  itemIconMode: 'EMOJI' | 'UPLOAD' | 'URL';
  setItemIconMode: (v: 'EMOJI' | 'UPLOAD' | 'URL') => void;
  itemFormIcon: string;
  setItemFormIcon: (v: string) => void;
  itemFormImageUrl: string;
  itemFormUrlInput: string;
  setItemFormUrlInput: (v: string) => void;
  itemFormName: string;
  setItemFormName: (v: string) => void;
  itemFormPrice: number;
  setItemFormPrice: (v: number) => void;
  itemFormCategory: string;
  setItemFormCategory: (v: string) => void;
  itemFormDesc: string;
  setItemFormDesc: (v: string) => void;
  onImageFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegisterUrlAsIcon: () => void;
  onClose: () => void;
  onSave: () => void;
}

export const StoreMenuItemModal: React.FC<StoreMenuItemModalProps> = ({
  isOpen,
  editingStoreMenuItem,
  curStore,
  itemIconMode,
  setItemIconMode,
  itemFormIcon,
  setItemFormIcon,
  itemFormImageUrl,
  itemFormUrlInput,
  setItemFormUrlInput,
  itemFormName,
  setItemFormName,
  itemFormPrice,
  setItemFormPrice,
  itemFormCategory,
  setItemFormCategory,
  itemFormDesc,
  setItemFormDesc,
  onImageFileUpload,
  onRegisterUrlAsIcon,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{editingStoreMenuItem ? '메뉴 수정' : '신규 메뉴 등록'}</h4>
          <button type="button" onClick={onClose}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">메뉴 아이콘 등록 방식</label>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setItemIconMode('EMOJI')}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  itemIconMode === 'EMOJI'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                기본 이모지
              </button>
              <button
                type="button"
                onClick={() => setItemIconMode('UPLOAD')}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  itemIconMode === 'UPLOAD'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                파일 업로드
              </button>
              <button
                type="button"
                onClick={() => setItemIconMode('URL')}
                className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  itemIconMode === 'URL'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                URL 등록
              </button>
            </div>

            {itemIconMode === 'EMOJI' && (
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F] max-h-24 overflow-y-auto">
                {DEFAULT_MENU_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setItemFormIcon(ic)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                      itemFormIcon === ic
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            )}

            {itemIconMode === 'UPLOAD' && (
              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {itemFormImageUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">미리보기:</span>
                    <img src={itemFormImageUrl} alt="미리보기" className="w-8 h-8 rounded-md object-cover border" />
                  </div>
                )}
              </div>
            )}

            {itemIconMode === 'URL' && (
              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] space-y-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={itemFormUrlInput}
                    onChange={(e) => setItemFormUrlInput(e.target.value)}
                    placeholder="https://... 이미지 웹 URL"
                    className="flex-1 h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={onRegisterUrlAsIcon}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    적용
                  </button>
                </div>
                {itemFormImageUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-500">등록된 이미지:</span>
                    <img src={itemFormImageUrl} alt="URL 이미지" className="w-8 h-8 rounded-md object-cover border" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="font-bold block mb-1">메뉴명</label>
            <input
              type="text"
              value={itemFormName}
              onChange={(e) => setItemFormName(e.target.value)}
              placeholder="예: 아이스 카페 아메리카노"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">금액 (원)</label>
            <input
              type="number"
              value={itemFormPrice}
              onChange={(e) => setItemFormPrice(Number(e.target.value) || 0)}
              placeholder="예: 4500"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">카테고리</label>
            <input
              type="text"
              value={itemFormCategory}
              onChange={(e) => setItemFormCategory(e.target.value)}
              placeholder="예: 커피 / 음료 / 디저트"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
            {curStore && curStore.menuCategories && curStore.menuCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {curStore.menuCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setItemFormCategory(cat)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                      itemFormCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="font-bold block mb-1">메뉴설명</label>
            <input
              type="text"
              value={itemFormDesc}
              onChange={(e) => setItemFormDesc(e.target.value)}
              placeholder="예: 깊고 진한 에스프레소 원두의 풍미"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
          <button type="button" onClick={onSave} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. 사다리 프리셋 등록/수정 모달
   ========================================================================= */
interface LadderPresetModalProps {
  isOpen: boolean;
  editingLadderPreset: LadderGoalPreset | null;
  systemStores: StorePreset[];
  ladderFormTitle: string;
  setLadderFormTitle: (v: string) => void;
  ladderFormCategory: 'COFFEE' | 'LUNCH' | 'DUTY';
  setLadderFormCategory: (v: 'COFFEE' | 'LUNCH' | 'DUTY') => void;
  ladderFormStoreId: string;
  setLadderFormStoreId: (v: string) => void;
  ladderFormPlayerCount: number;
  setLadderFormPlayerCount: (v: number) => void;
  ladderFormWinnerCount: number;
  setLadderFormWinnerCount: (v: number) => void;
  ladderFormDescription: string;
  setLadderFormDescription: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const LadderPresetModal: React.FC<LadderPresetModalProps> = ({
  isOpen,
  editingLadderPreset,
  systemStores,
  ladderFormTitle,
  setLadderFormTitle,
  ladderFormCategory,
  setLadderFormCategory,
  ladderFormStoreId,
  setLadderFormStoreId,
  ladderFormPlayerCount,
  setLadderFormPlayerCount,
  ladderFormWinnerCount,
  setLadderFormWinnerCount,
  ladderFormDescription,
  setLadderFormDescription,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {editingLadderPreset ? '사다리 게임 프리셋 수정' : '신규 사다리 게임 프리셋 등록'}
          </h4>
          <button type="button" onClick={onClose}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold block mb-1">프리셋 제목</label>
            <input
              type="text"
              value={ladderFormTitle}
              onChange={(e) => setLadderFormTitle(e.target.value)}
              placeholder="예: 팀 커피내기 (5인)"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold block mb-1">카테고리</label>
              <select
                value={ladderFormCategory}
                onChange={(e) => setLadderFormCategory(e.target.value as 'COFFEE' | 'LUNCH' | 'DUTY')}
                className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
              >
                <option value="COFFEE">커피내기</option>
                <option value="LUNCH">식사내기</option>
                <option value="DUTY">당번내기</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">연동 매장</label>
              <select
                value={ladderFormStoreId}
                onChange={(e) => setLadderFormStoreId(e.target.value)}
                className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
              >
                <option value="">(연동 매장 없음)</option>
                {systemStores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold block mb-1">참가자 수 (명)</label>
              <input
                type="number"
                min={2}
                max={20}
                value={ladderFormPlayerCount}
                onChange={(e) => setLadderFormPlayerCount(Number(e.target.value) || 2)}
                className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">당첨자 수 (명)</label>
              <input
                type="number"
                min={1}
                max={Math.max(1, ladderFormPlayerCount - 1)}
                value={ladderFormWinnerCount}
                onChange={(e) => setLadderFormWinnerCount(Number(e.target.value) || 1)}
                className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
              />
            </div>
          </div>
          <div>
            <label className="font-bold block mb-1">설명</label>
            <textarea
              value={ladderFormDescription}
              onChange={(e) => setLadderFormDescription(e.target.value)}
              rows={2}
              placeholder="사다리 프리셋 용도 및 규칙 설명"
              className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
          <button type="button" onClick={onSave} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. 룰렛 프리셋 등록/수정 모달
   ========================================================================= */
interface RoulettePresetModalProps {
  isOpen: boolean;
  editingRoulettePreset: RoulettePreset | null;
  rouletteFormTitle: string;
  setRouletteFormTitle: (v: string) => void;
  rouletteFormIcon: string;
  setRouletteFormIcon: (v: string) => void;
  rouletteFormCategory: 'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM';
  setRouletteFormCategory: (v: 'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM') => void;
  rouletteFormDescription: string;
  setRouletteFormDescription: (v: string) => void;
  rouletteFormItems: Array<{ id: string; name: string; icon?: string; weight: number }>;
  setRouletteFormItems: (v: Array<{ id: string; name: string; icon?: string; weight: number }>) => void;
  onClose: () => void;
  onSave: () => void;
}

export const RoulettePresetModal: React.FC<RoulettePresetModalProps> = ({
  isOpen,
  editingRoulettePreset,
  rouletteFormTitle,
  setRouletteFormTitle,
  rouletteFormIcon,
  setRouletteFormIcon,
  rouletteFormCategory,
  setRouletteFormCategory,
  rouletteFormDescription,
  setRouletteFormDescription,
  rouletteFormItems,
  setRouletteFormItems,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
            {editingRoulettePreset ? '룰렛 프리셋 수정' : '신규 룰렛 프리셋 등록'}
          </h4>
          <button type="button" onClick={onClose}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
        </div>
        <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="font-bold block mb-1">프리셋 제목</label>
              <input
                type="text"
                value={rouletteFormTitle}
                onChange={(e) => setRouletteFormTitle(e.target.value)}
                placeholder="예: 점심 메뉴 추천"
                className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">대표 아이콘</label>
              <input
                type="text"
                value={rouletteFormIcon}
                onChange={(e) => setRouletteFormIcon(e.target.value)}
                placeholder="🍱"
                className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] text-center"
              />
            </div>
          </div>
          <div>
            <label className="font-bold block mb-1">카테고리</label>
            <select
              value={rouletteFormCategory}
              onChange={(e) => setRouletteFormCategory(e.target.value as 'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM')}
              className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            >
              <option value="LUNCH">점심 식사</option>
              <option value="DUTY">당번 선정</option>
              <option value="PENALTY">벌칙 정하기</option>
              <option value="COFFEE">커피 간식</option>
              <option value="CUSTOM">사용자 정의</option>
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">설명</label>
            <input
              type="text"
              value={rouletteFormDescription}
              onChange={(e) => setRouletteFormDescription(e.target.value)}
              placeholder="룰렛 설명"
              className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <label className="font-bold block">
                룰렛 세부 항목 및 가중치 ({rouletteFormItems.length}건)
              </label>
              <button
                type="button"
                onClick={() => {
                  setRouletteFormItems([
                    ...rouletteFormItems,
                    { id: `item-${Date.now()}`, name: `새 항목 ${rouletteFormItems.length + 1}`, icon: '🎯', weight: 1 },
                  ]);
                }}
                className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 font-bold text-[11px] hover:bg-indigo-100 cursor-pointer"
              >
                + 항목 추가
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {rouletteFormItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F]">
                  <input
                    type="text"
                    value={item.icon || '🎯'}
                    onChange={(e) => {
                      const next = [...rouletteFormItems];
                      next[idx] = { ...next[idx], icon: e.target.value };
                      setRouletteFormItems(next);
                    }}
                    className="w-8 h-7 text-center rounded border bg-white dark:bg-[#131B2E]"
                  />
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const next = [...rouletteFormItems];
                      next[idx] = { ...next[idx], name: e.target.value };
                      setRouletteFormItems(next);
                    }}
                    placeholder="항목명"
                    className="flex-1 h-7 px-2 rounded border bg-white dark:bg-[#131B2E]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">가중치:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={item.weight || 1}
                      onChange={(e) => {
                        const next = [...rouletteFormItems];
                        next[idx] = { ...next[idx], weight: Number(e.target.value) || 1 };
                        setRouletteFormItems(next);
                      }}
                      className="w-14 h-7 px-1.5 text-center font-mono rounded border bg-white dark:bg-[#131B2E]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRouletteFormItems(rouletteFormItems.filter((_, i) => i !== idx));
                    }}
                    className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <button type="button" onClick={onClose} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
          <button type="button" onClick={onSave} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
        </div>
      </div>
    </div>
  );
};
