import { RouletteSliceItem } from '../types';
import { RoulettePreset } from '../../../sample/data/systemStorePool';

export interface RouletteSlice {
  item: RouletteSliceItem;
  startAngle: number;
  endAngle: number;
  angle: number;
}

export const DEFAULT_FIVE_ITEMS_PRESET: RoulettePreset = {
  id: 'preset_default_6',
  category: 'CUSTOM',
  title: '🎯 기본 룰렛',
  description: '주제 없이 기본 세팅된 항목 1~6 룰렛 프리셋',
  icon: '🎯',
  items: [
    { id: 'def_1', name: '항목1', icon: '1️⃣', weight: 1 },
    { id: 'def_2', name: '항목2', icon: '2️⃣', weight: 1 },
    { id: 'def_3', name: '항목3', icon: '3️⃣', weight: 1 },
    { id: 'def_4', name: '항목4', icon: '4️⃣', weight: 1 },
    { id: 'def_5', name: '항목5', icon: '5️⃣', weight: 1 },
    { id: 'def_6', name: '항목6', icon: '6️⃣', weight: 1 },
  ],
};
