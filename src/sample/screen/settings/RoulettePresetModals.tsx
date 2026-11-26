import React, { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import {
  UserRoulettePreset,
  RoulettePreset,
} from '../../data/systemStorePool';
import { INITIAL_GOAL_LIST } from '../../data/goal-mock-data';
import { INITIAL_DUTIES } from '../../dutyStore';

/* =========================================================================
   1. 기초 룰렛 프리셋 다중 선택 가져오기 모달
   ========================================================================= */
export interface RouletteImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPresets: RoulettePreset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onConfirmImport: () => void;
}

export const RouletteImportModal: React.FC<RouletteImportModalProps> = ({
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
            <span>
              전체 선택 ({selectedIds.length}/{systemPresets.length})
            </span>
          </button>
          <span className="text-[11px] text-slate-400">선택된 프리셋: {selectedIds.length}개</span>
        </div>

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

/* =========================================================================
   2. 룰렛 프리셋 수동 등록/수정 모달
   ========================================================================= */
export interface RouletteManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: UserRoulettePreset | null;
  onSave: (data: UserRoulettePreset) => void;
  onNotify?: (msg: string) => void;
}

const ROULETTE_EMOJI_PALETTE = [
  '🍱', '🍲', '🍛', '🍜', '🍔', '🍕', '🥗', '☕', '🍰', '🍦', '🍩', '🍺',
  '🧹', '📝', '♻️', '🍪', '💡', '🎯', '🍀', '🏆', '🎲', '🎤', '📸', '⚡',
];

export const RouletteManualModal: React.FC<RouletteManualModalProps> = ({
  isOpen,
  onClose,
  preset,
  onSave,
  onNotify,
}) => {
  const [title, setTitle] = useState(preset?.title || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [category, setCategory] = useState<'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM'>(
    preset?.category || 'LUNCH'
  );
  const [icon, setIcon] = useState(preset?.icon || '🍱');
  const [showMainIconPicker, setShowMainIconPicker] = useState<boolean>(false);
  const [activeItemIconPickerIdx, setActiveItemIconPickerIdx] = useState<number | null>(null);

  const [sourceType, setSourceType] = useState<'DIRECT' | 'GOAL' | 'DUTY'>(
    preset?.sourceType || 'DIRECT'
  );
  const [sourceId, setSourceId] = useState<string>(preset?.sourceId || '');
  const [sourceName, setSourceName] = useState<string>(preset?.sourceName || '');
  const [originalMemberCount, setOriginalMemberCount] = useState<number | undefined>(
    preset?.originalMemberCount
  );
  const [originalMembers, setOriginalMembers] = useState<string[] | undefined>(
    preset?.originalMembers
  );

  const [items, setItems] = useState<
    Array<{ id: string; name: string; icon?: string; weight: number }>
  >(
    preset?.items || [
      { id: 'item_1', name: '김치찌개 / 제육', icon: '🍲', weight: 10 },
      { id: 'item_2', name: '돈까스 / 라멘', icon: '🍛', weight: 10 },
      { id: 'item_3', name: '짜장면 / 짬뽕', icon: '🍜', weight: 10 },
      { id: 'item_4', name: '샐러드 / 샌드위치', icon: '🥗', weight: 10 },
    ]
  );

  const handleSourceTypeChange = (newType: 'DIRECT' | 'GOAL' | 'DUTY') => {
    setSourceType(newType);
    if (newType === 'DIRECT') {
      setSourceId('');
      setSourceName('');
      setOriginalMemberCount(undefined);
      setOriginalMembers(undefined);
    } else if (newType === 'GOAL') {
      if (INITIAL_GOAL_LIST.length > 0) {
        applyGoalSource(INITIAL_GOAL_LIST[0].id);
      }
    } else if (newType === 'DUTY') {
      if (INITIAL_DUTIES.length > 0) {
        applyDutySource(INITIAL_DUTIES[0].duty_id);
      }
    }
  };

  const applyGoalSource = (targetGoalId: string) => {
    const goal = INITIAL_GOAL_LIST.find((g) => g.id === targetGoalId);
    if (!goal) return;
    setSourceId(goal.id);
    setSourceName(goal.title);
    const companionNames = goal.companions.map((c) => c.name);
    setOriginalMemberCount(companionNames.length);
    setOriginalMembers(companionNames);

    if (!preset) {
      setTitle(`[목표] ${goal.title}`);
      setDescription(`🎯 '${goal.title}' 동행원 전용 룰렛`);
      setIcon('🎯');
    }

    setItems(
      companionNames.map((name, idx) => ({
        id: `r_goal_${idx}_${Date.now()}`,
        name,
        icon: '🎯',
        weight: 10,
      }))
    );
  };

  const applyDutySource = (targetDutyId: string) => {
    const duty = INITIAL_DUTIES.find((d) => d.duty_id === targetDutyId);
    if (!duty) return;
    setSourceId(duty.duty_id);
    setSourceName(duty.duty_title);
    const participantNames = duty.participants.map((p) => p.name);
    setOriginalMemberCount(participantNames.length);
    setOriginalMembers(participantNames);

    if (!preset) {
      setTitle(`[당번] ${duty.duty_title}`);
      setDescription(`🧹 '${duty.duty_title}' 담당자 전용 룰렛`);
      setCategory('DUTY');
      setIcon('🧹');
    }

    setItems(
      participantNames.map((name, idx) => ({
        id: `r_duty_${idx}_${Date.now()}`,
        name,
        icon: '🧹',
        weight: 10,
      }))
    );
  };

  useEffect(() => {
    if (preset) {
      setTitle(preset.title);
      setDescription(preset.description);
      setCategory(preset.category);
      setIcon(preset.icon || '🍱');
      setItems(preset.items);
      setSourceType(preset.sourceType || 'DIRECT');
      setSourceId(preset.sourceId || '');
      setSourceName(preset.sourceName || '');
      setOriginalMemberCount(preset.originalMemberCount);
      setOriginalMembers(preset.originalMembers);
    } else {
      setTitle('');
      setDescription('');
      setCategory('LUNCH');
      setIcon('🍱');
      setSourceType('DIRECT');
      setSourceId('');
      setSourceName('');
      setOriginalMemberCount(undefined);
      setOriginalMembers(undefined);
      setItems([
        { id: 'item_1', name: '김치찌개 / 제육', icon: '🍲', weight: 10 },
        { id: 'item_2', name: '돈까스 / 라멘', icon: '🍛', weight: 10 },
        { id: 'item_3', name: '짜장면 / 짬뽕', icon: '🍜', weight: 10 },
        { id: 'item_4', name: '샐러드 / 샌드위치', icon: '🥗', weight: 10 },
      ]);
    }
  }, [preset, isOpen]);

  if (!isOpen) return null;

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
        return prev.slice(0, safeCount);
      }
      return prev;
    });
  };

  const handleAddItem = () => {
    handleSetItemCount(items.length + 1);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 2) {
      onNotify?.('룰렛 항목은 최소 2개 이상이어야 합니다.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: string | number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: val } : it))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify?.('룰렛 제목을 입력해주세요.');
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
      sourceType,
      sourceId: sourceId || undefined,
      sourceName: sourceName || undefined,
      originalMemberCount,
      originalMembers,
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
          {/* 출처 선택 세그먼트 버튼 */}
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 space-y-2">
            <label className="block font-bold text-amber-950 dark:text-amber-200">
              프리셋 출처 선택
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSourceTypeChange('DIRECT')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  sourceType === 'DIRECT'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                ✏️ 직접 입력
              </button>
              <button
                type="button"
                onClick={() => handleSourceTypeChange('GOAL')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  sourceType === 'GOAL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                🎯 모아목표
              </button>
              <button
                type="button"
                onClick={() => handleSourceTypeChange('DUTY')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  sourceType === 'DUTY'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                🧹 모아당번
              </button>
            </div>

            {sourceType === 'GOAL' && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  연동할 모아목표 선택 (참석자 자동 주입)
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => applyGoalSource(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none"
                >
                  {INITIAL_GOAL_LIST.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.companions.length}명 참여 •{' '}
                      {g.companions.map((c) => c.name).join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sourceType === 'DUTY' && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                  연동할 모아당번 선택 (담당자 자동 주입)
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => applyDutySource(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-xs focus:outline-none"
                >
                  {INITIAL_DUTIES.map((d) => (
                    <option key={d.duty_id} value={d.duty_id}>
                      {d.duty_title} ({d.participants.length}명 담당 •{' '}
                      {d.participants.map((p) => p.name).join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
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
                onChange={(e) =>
                  setCategory(
                    e.target.value as 'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM'
                  )
                }
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

          {/* 설정항목 건수 */}
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

          {/* 항목 목록 */}
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
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs"
                >
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
