import { RouletteSliceItem } from '../types';
import { RouletteSlice } from './types';

export function getEffectiveItemWeight(item: RouletteSliceItem, allItems: RouletteSliceItem[]): number {
  const w = Math.max(0, item.weight ?? 10);
  const anyPositive = allItems.some((it) => Math.max(0, it.weight ?? 10) > 0);
  if (!anyPositive) return 10;
  // 0 가중치 항목은 회전판 및 당첨 추첨에서 완전 제외 (비중 0)
  return w > 0 ? w : 0;
}

export function calculateRouletteSlices(
  items: RouletteSliceItem[],
  _totalWeight?: number
): RouletteSlice[] {
  let currentAngle = 0;
  const anyPositive = items.some((it) => Math.max(0, it.weight ?? 10) > 0);
  const effectiveWeights = items.map((it) => {
    const w = Math.max(0, it.weight ?? 10);
    if (!anyPositive) return 10;
    return w > 0 ? w : 0;
  });
  const effectiveTotal = Math.max(0.001, effectiveWeights.reduce((a, b) => a + b, 0));

  return items.map((item, idx) => {
    const weight = effectiveWeights[idx];
    const angle = weight > 0 ? (weight / effectiveTotal) * 360 : 0;
    const slice: RouletteSlice = {
      item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      angle,
    };
    currentAngle += angle;
    return slice;
  });
}

export function pickRandomRouletteItem(
  items: RouletteSliceItem[],
  _totalWeight?: number
): RouletteSliceItem {
  if (items.length === 0) {
    return { id: 'fallback', name: '항목', avatar: '🎯', weight: 10 };
  }
  const anyPositive = items.some((it) => Math.max(0, it.weight ?? 10) > 0);
  const effectiveWeights = items.map((it) => {
    const w = Math.max(0, it.weight ?? 10);
    if (!anyPositive) return 10;
    return w > 0 ? w : 0;
  });
  const effectiveTotal = Math.max(0.001, effectiveWeights.reduce((a, b) => a + b, 0));

  let rand = Math.random() * effectiveTotal;
  for (let i = 0; i < items.length; i++) {
    const w = effectiveWeights[i];
    if (w > 0 && rand <= w) {
      return items[i];
    }
    if (w > 0) rand -= w;
  }
  const positiveFallback = items.find((it) => Math.max(0, it.weight ?? 10) > 0);
  return positiveFallback || items[0];
}

export function calculateTargetRotation(
  chosen: RouletteSliceItem,
  slices: RouletteSlice[],
  currentRotation: number,
  isSkip: boolean
): { nextRotation: number; duration: number } {
  const chosenSlice =
    slices.find((s) => s.item.id === chosen.id && s.angle >= 0.5) ||
    slices.find((s) => s.angle >= 0.5) ||
    slices[0];
  const sliceMidAngle = chosenSlice ? (chosenSlice.startAngle + chosenSlice.endAngle) / 2 : 180;

  // 12시 상단 핀 각도(270도)에 슬라이스 중심각(sliceMidAngle)이 정확히 일치하도록 목표 각도 산출
  const targetAngleMod = (((270 - sliceMidAngle) % 360) + 360) % 360;
  const currentNorm = ((currentRotation % 360) + 360) % 360;

  if (isSkip) {
    let diff = targetAngleMod - currentNorm;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    return {
      nextRotation: currentRotation + diff,
      duration: 400,
    };
  }

  // 룰렛 정회전(시계방향): 최소 6바퀴 회전 후 잉여 위상차를 정밀 보정하여 항상 슬라이스 정중앙에 안착
  let forwardDiff = targetAngleMod - currentNorm;
  if (forwardDiff <= 0) {
    forwardDiff += 360;
  }

  const nextRotation = currentRotation + 360 * 6 + forwardDiff;
  return {
    nextRotation,
    duration: 3600,
  };
}

export function formatRouletteResultText(
  winner: RouletteSliceItem,
  presetTitle: string,
  items: RouletteSliceItem[]
): string {
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
    now.getDate()
  ).padStart(2, '0')}`;
  let text = `[모아보고 룰렛 추첨 결과]\n`;
  text += `📅 일시: ${dateStr}\n`;
  text += `📌 주제: ${presetTitle}\n\n`;
  text += `🎯 오늘의 당첨: ${winner.avatar} ${winner.name} (축하합니다! 🎉)\n\n`;
  text += `🎲 전체 후보 (${items.length}개):\n`;
  items.forEach((it, idx) => {
    text += `${idx + 1}. ${it.avatar} ${it.name}\n`;
  });
  text += `\n스마트 가계부 & 모임 정산 • 모아보고`;
  return text;
}
