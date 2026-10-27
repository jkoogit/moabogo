import { StoreMenuItem } from '../../sample/data/systemStorePool';

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  color: string;
  bgLight: string;
  weight: number; // for weighted games (default 1)
  isSent?: boolean; // for settlement
  claimedBy?: string; // 클라이언트 탭/사용자 식별자 (점유자)
  selectedMenu?: StoreMenuItem; // 선택한 음료/메뉴
}

export const PRESET_CHARACTERS = [
  { avatar: '🐱', color: 'text-amber-600 dark:text-amber-400', bgLight: 'bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800' },
  { avatar: '🐶', color: 'text-indigo-600 dark:text-indigo-400', bgLight: 'bg-indigo-100 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800' },
  { avatar: '🦊', color: 'text-orange-600 dark:text-orange-400', bgLight: 'bg-orange-100 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800' },
  { avatar: '🐼', color: 'text-emerald-600 dark:text-emerald-400', bgLight: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800' },
  { avatar: '🦁', color: 'text-yellow-600 dark:text-yellow-400', bgLight: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-950/40 dark:border-yellow-800' },
  { avatar: '🐻', color: 'text-rose-600 dark:text-rose-400', bgLight: 'bg-rose-100 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800' },
  { avatar: '🐰', color: 'text-pink-600 dark:text-pink-400', bgLight: 'bg-pink-100 border-pink-300 dark:bg-pink-950/40 dark:border-pink-800' },
  { avatar: '🐨', color: 'text-teal-600 dark:text-teal-400', bgLight: 'bg-teal-100 border-teal-300 dark:bg-teal-950/40 dark:border-teal-800' },
  { avatar: '🐯', color: 'text-amber-700 dark:text-amber-300', bgLight: 'bg-amber-200 border-amber-400 dark:bg-amber-900/40 dark:border-amber-700' },
  { avatar: '🐧', color: 'text-cyan-600 dark:text-cyan-400', bgLight: 'bg-cyan-100 border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-800' },
  { avatar: '🐵', color: 'text-lime-600 dark:text-lime-400', bgLight: 'bg-lime-100 border-lime-300 dark:bg-lime-950/40 dark:border-lime-800' },
  { avatar: '🐸', color: 'text-green-600 dark:text-green-400', bgLight: 'bg-green-100 border-green-300 dark:bg-green-950/40 dark:border-green-800' },
];

export const ROULETTE_ICONS = [
  '🍱', '🍲', '🍛', '🍜', '🍔', '🍕', '🥗', '🍢', '☕', '🍦', '🍰', '🧹', '♻️', '📝', '💡', '🎯', '👑', '💸', '🏃', '🎤', '💖', '🍀', '💀', '🎁',
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
];

export const TARGET_ICONS = [
  '🎁', '💨', '☕', '🍰', '🏃', '🧹', '✨', '🍜', '🍫', '🏪', '🥇', '💀', '💸', '👑', '🍔', '🍕', '🍻', '🥤', '🎯', '🍀', '💡', '📝', '⚽', '🎤',
];

export interface RouletteSliceItem {
  id: string;
  name: string;
  avatar: string;
  weight: number;
}

export interface GoalPresetItem {
  id: string;
  text: string;
  icon: string;
}

export const DEFAULT_GOAL_PRESETS: GoalPresetItem[] = [
  { id: 'gp_1', text: '당첨', icon: '🎁' },
  { id: 'gp_2', text: '통과', icon: '💨' },
  { id: 'gp_3', text: '커피 쏘기', icon: '☕' },
  { id: 'gp_4', text: '디저트 쏘기', icon: '🍰' },
  { id: 'gp_5', text: '픽업 당번', icon: '🏃' },
  { id: 'gp_6', text: '자리 정리', icon: '🧹' },
  { id: 'gp_7', text: '면제', icon: '✨' },
  { id: 'gp_8', text: '점심 쏘기', icon: '🍜' },
  { id: 'gp_9', text: '간식 쏘기', icon: '🍫' },
  { id: 'gp_10', text: '편의점 쏘기', icon: '🏪' },
  { id: 'gp_11', text: '1등', icon: '🥇' },
  { id: 'gp_12', text: '꼴찌', icon: '💀' },
];

export const LOCAL_STORAGE_KEY_LADDER_GOAL_PRESETS = 'moabogo_ladder_goal_presets_v1';

export function loadUserGoalPresets(): GoalPresetItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_LADDER_GOAL_PRESETS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load ladder goal presets:', e);
  }
  return DEFAULT_GOAL_PRESETS;
}

export function saveUserGoalPresets(presets: GoalPresetItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_LADDER_GOAL_PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.error('Failed to save ladder goal presets:', e);
  }
}
