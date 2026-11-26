import React, { useState, useEffect } from 'react';
import { Store, FileSpreadsheet, Upload, Download } from 'lucide-react';
import {
  StorePreset,
  StoreMenuItem,
  downloadStoreExcelTemplate,
  parseStoreCsvData,
} from '../../data/systemStorePool';

/* =========================================================================
   1. 매장 수동 등록/수정 모달
   ========================================================================= */
export interface StoreManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StorePreset | null;
  onSave: (data: StorePreset) => void;
  onNotify?: (msg: string) => void;
}

export const StoreManualModal: React.FC<StoreManualModalProps> = ({
  isOpen,
  onClose,
  store,
  onSave,
  onNotify,
}) => {
  const [name, setName] = useState(store?.name || '');
  const [partnerBrand, setPartnerBrand] = useState(store?.partnerBrand || '');
  const [category, setCategory] = useState<'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK' | 'CUSTOM'>(
    (store?.category as 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK' | 'CUSTOM') || 'CAFE'
  );
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
      setCategory(
        (store.category as 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK' | 'CUSTOM') || 'CAFE'
      );
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
      {
        id: `m_${Date.now()}`,
        name: `새 메뉴 ${prev.length + 1}`,
        price: 5000,
        categoryName: '대표메뉴',
      },
    ]);
  };

  const handleRemoveMenu = (idx: number) => {
    setMenus((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMenuChange = (idx: number, field: string, val: string | number) => {
    setMenus((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify?.('매장명을 입력해주세요.');
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
                onChange={(e) =>
                  setCategory(e.target.value as 'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK' | 'CUSTOM')
                }
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
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs"
                >
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
                    onChange={(e) =>
                      handleMenuChange(idx, 'price', parseInt(e.target.value, 10) || 0)
                    }
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

/* =========================================================================
   2. 매장 엑셀(CSV) 일괄 등록 모달
   ========================================================================= */
export interface StoreExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (stores: StorePreset[]) => void;
}

export const StoreExcelModal: React.FC<StoreExcelModalProps> = ({
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
