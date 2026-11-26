import React, { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import {
  StorePreset,
  UserLadderPreset,
  LadderGoalPreset,
} from '../../data/systemStorePool';
import { INITIAL_GOAL_LIST } from '../../data/goal-mock-data';
import { INITIAL_DUTIES } from '../../dutyStore';

/* =========================================================================
   1. 기초 사다리 프리셋 다중 선택 가져오기 모달
   ========================================================================= */
export interface LadderImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemPresets: LadderGoalPreset[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onConfirmImport: () => void;
}

export const LadderImportModal: React.FC<LadderImportModalProps> = ({
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

/* =========================================================================
   2. 사다리 프리셋 수동 등록/수정 모달
   ========================================================================= */
export interface LadderManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: UserLadderPreset | null;
  availableStores: StorePreset[];
  onSave: (data: UserLadderPreset) => void;
  onNotify?: (msg: string) => void;
}

interface ParticipantConfig {
  name: string;
  menuName?: string;
  menuPrice?: number;
  weight: number;
}

const LADDER_GOAL_ICONS = ['💳', '🏃', '🧹', '🎉', '☕', '🍱', '🎯', '🍀', '📝', '💡', '🍗', '🥤'];

export const LadderManualModal: React.FC<LadderManualModalProps> = ({
  isOpen,
  onClose,
  preset,
  availableStores,
  onSave,
  onNotify,
}) => {
  const [title, setTitle] = useState(preset?.title || '');
  const [description, setDescription] = useState(preset?.description || '');
  const [category, setCategory] = useState<'COFFEE' | 'LUNCH' | 'DUTY'>(
    preset?.category || 'COFFEE'
  );
  const [playerCount, setPlayerCount] = useState<number>(preset?.playerCount || 4);
  const [winnerCount, setWinnerCount] = useState<number>(preset?.winnerCount || 1);
  const [storeId, setStoreId] = useState<string>(preset?.storeId || '');

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

  const [participants, setParticipants] = useState<ParticipantConfig[]>(() =>
    Array.from({ length: 4 }, (_, i) => ({
      name: `참가자 ${i + 1}`,
      weight: 10,
    }))
  );

  const [roles, setRoles] = useState<
    Array<{
      label: string;
      icon?: string;
      type: 'PAY' | 'PICKUP' | 'CLEAN' | 'PASS';
      color: string;
      badgeText?: string;
    }>
  >(
    preset?.roles || [
      { label: '오늘 결제 당첨', icon: '💳', type: 'PAY', color: 'rose', badgeText: '당첨' },
      { label: '심부름 픽업', icon: '🏃', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
      { label: '축 통과 (생존)', icon: '🎉', type: 'PASS', color: 'emerald', badgeText: '면제' },
      { label: '축 통과 (생존)', icon: '🎉', type: 'PASS', color: 'emerald', badgeText: '면제' },
    ]
  );

  const selectedStoreObj = availableStores.find((s) => s.id === storeId);

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
      setDescription(`🎯 '${goal.title}' 동행원 맞춤 사다리 게임`);
    }

    const count = Math.max(2, Math.min(10, companionNames.length));
    setPlayerCount(count);
    setParticipants(
      companionNames.slice(0, count).map((name) => ({
        name,
        weight: 10,
      }))
    );
    setRoles((prev) => {
      if (prev.length < count) {
        const added = Array.from({ length: count - prev.length }, () => ({
          label: '통과 (생존)',
          icon: '🎉',
          type: 'PASS' as const,
          color: 'emerald',
          badgeText: '면제',
        }));
        return [...prev, ...added];
      } else if (prev.length > count) {
        return prev.slice(0, count);
      }
      return prev;
    });
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
      setDescription(`🧹 '${duty.duty_title}' 담당자 맞춤 사다리 게임`);
      setCategory('DUTY');
    }

    const count = Math.max(2, Math.min(10, participantNames.length));
    setPlayerCount(count);
    setParticipants(
      participantNames.slice(0, count).map((name) => ({
        name,
        weight: 10,
      }))
    );
    setRoles((prev) => {
      if (prev.length < count) {
        const added = Array.from({ length: count - prev.length }, () => ({
          label: '통과 (생존)',
          icon: '🎉',
          type: 'PASS' as const,
          color: 'emerald',
          badgeText: '면제',
        }));
        return [...prev, ...added];
      } else if (prev.length > count) {
        return prev.slice(0, count);
      }
      return prev;
    });
  };

  useEffect(() => {
    if (preset) {
      setTitle(preset.title);
      setDescription(preset.description);
      setCategory(preset.category);
      setPlayerCount(preset.playerCount);
      setWinnerCount(preset.winnerCount);
      setStoreId(preset.storeId || '');
      setSourceType(preset.sourceType || 'DIRECT');
      setSourceId(preset.sourceId || '');
      setSourceName(preset.sourceName || '');
      setOriginalMemberCount(preset.originalMemberCount);
      setOriginalMembers(preset.originalMembers);
      setRoles(
        preset.roles.map((r) => ({
          ...r,
          icon:
            r.badgeText ||
            (r.type === 'PAY' ? '💳' : r.type === 'PICKUP' ? '🏃' : r.type === 'CLEAN' ? '🧹' : '🎉'),
        }))
      );
      setParticipants(
        Array.from({ length: preset.playerCount }, (_, i) => ({
          name:
            preset.originalMembers && preset.originalMembers[i]
              ? preset.originalMembers[i]
              : `참가자 ${i + 1}`,
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
      setSourceType('DIRECT');
      setSourceId('');
      setSourceName('');
      setOriginalMemberCount(undefined);
      setOriginalMembers(undefined);
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

  const handleSetPlayerCount = (target: number) => {
    const safeNum = Math.max(2, Math.min(10, target));
    setPlayerCount(safeNum);

    setParticipants((prev) => {
      if (prev.length < safeNum) {
        const added = Array.from({ length: safeNum - prev.length }, (_, i) => ({
          name: `참가자 ${prev.length + i + 1}`,
          weight: 10,
        }));
        return [...prev, ...added];
      } else if (prev.length > safeNum) {
        return prev.slice(0, safeNum);
      }
      return prev;
    });

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
        return prev.slice(0, safeNum);
      }
      return prev;
    });

    if (winnerCount >= safeNum) {
      syncRolesWithWinnerCount(Math.max(1, safeNum - 1), safeNum);
    }
  };

  const syncRolesWithWinnerCount = (targetWinner: number, currentPlayers: number = playerCount) => {
    const safeNum = Math.max(1, Math.min(currentPlayers - 1, targetWinner));
    setWinnerCount(safeNum);

    setRoles((prev) => {
      let currentPayCount = prev.filter((r) => r.type === 'PAY').length;
      if (currentPayCount === safeNum) return prev;

      const newRoles = [...prev];
      if (currentPayCount < safeNum) {
        for (let i = 0; i < newRoles.length && currentPayCount < safeNum; i++) {
          if (newRoles[i].type !== 'PAY') {
            newRoles[i] = {
              label:
                currentPayCount === 0 ? '오늘 결제 당첨' : `결제 당첨 (${currentPayCount + 1})`,
              icon: '💳',
              type: 'PAY',
              color: 'rose',
              badgeText: '당첨',
            };
            currentPayCount++;
          }
        }
      } else if (currentPayCount > safeNum) {
        for (let i = newRoles.length - 1; i >= 0 && currentPayCount > safeNum; i--) {
          if (newRoles[i].type === 'PAY') {
            newRoles[i] = {
              label: '축 통과 (생존)',
              icon: '🎉',
              type: 'PASS',
              color: 'emerald',
              badgeText: '면제',
            };
            currentPayCount--;
          }
        }
      }
      return newRoles;
    });
  };

  const handleSetWinnerCount = (target: number) => {
    syncRolesWithWinnerCount(target);
  };

  const handleParticipantChange = (
    idx: number,
    field: keyof ParticipantConfig,
    val: string | number | undefined
  ) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p))
    );
  };

  const handleRoleChange = (idx: number, field: string, val: string) => {
    setRoles((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onNotify?.('프리셋 제목을 입력해주세요.');
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
          {/* 출처 선택 세그먼트 버튼 */}
          <div className="p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 space-y-2">
            <label className="block font-bold text-violet-950 dark:text-violet-200">
              프리셋 출처 선택
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSourceTypeChange('DIRECT')}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  sourceType === 'DIRECT'
                    ? 'bg-violet-600 text-white shadow-xs'
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
                    ? 'bg-violet-600 text-white shadow-xs'
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
                    ? 'bg-violet-600 text-white shadow-xs'
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
                onChange={(e) => setCategory(e.target.value as 'COFFEE' | 'LUNCH' | 'DUTY')}
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

          {/* 참가인원수 & 당첨인원수 */}
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
              <span className="text-[10px] text-slate-400 mt-1 block">
                감소 시 하단 항목부터 자동 제거
              </span>
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
              <span className="text-[10px] text-slate-400 mt-1 block">
                최대 {playerCount - 1}명까지 당첨 가능
              </span>
            </div>
          </div>

          {/* 참가자 정보 등록 폼 */}
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
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800"
                >
                  <span className="font-bold text-slate-500 w-5 text-center">{idx + 1}</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                    placeholder="참가자 이름"
                    className="w-28 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-semibold"
                  />

                  <select
                    value={p.menuName || ''}
                    onChange={(e) => {
                      const mName = e.target.value;
                      const matchedMenu = selectedStoreObj?.menus.find((m) => m.name === mName);
                      setParticipants((prev) =>
                        prev.map((item, i) =>
                          i === idx
                            ? { ...item, menuName: mName, menuPrice: matchedMenu?.price }
                            : item
                        )
                      );
                    }}
                    className="flex-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px]"
                  >
                    <option value="">메뉴 미지정</option>
                    {selectedStoreObj?.menus.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.iconName ? `${m.iconName} ` : ''}
                        {m.name} ({m.price.toLocaleString()}원)
                      </option>
                    ))}
                  </select>

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

          {/* 사다리 도착 목표 역할 설정 */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span>🎯</span>
              <span>사다리 도착 목표 역할 설정 ({roles.length}개)</span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {roles.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800"
                >
                  <span className="font-bold text-slate-500 w-5 text-center">{idx + 1}</span>

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
