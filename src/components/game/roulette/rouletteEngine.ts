import { RouletteSliceItem } from '../types';
import { RouletteSlice } from './types';

export function calculateRouletteSlices(
  items: RouletteSliceItem[],
  totalWeight: number
): RouletteSlice[] {
  let currentAngle = 0;
  const safeTotalWeight = Math.max(1, totalWeight);
  return items.map((item) => {
    const weight = Math.max(1, item.weight || 1);
    const angle = (weight / safeTotalWeight) * 360;
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
  totalWeight: number
): RouletteSliceItem {
  if (items.length === 0) {
    return { id: 'fallback', name: '항목', avatar: '🎯', weight: 1 };
  }
  let rand = Math.random() * Math.max(1, totalWeight);
  for (const item of items) {
    const w = Math.max(1, item.weight || 1);
    if (rand <= w) {
      return item;
    }
    rand -= w;
  }
  return items[0];
}

export function calculateTargetRotation(
  chosen: RouletteSliceItem,
  slices: RouletteSlice[],
  currentRotation: number,
  isSkip: boolean
): { nextRotation: number; duration: number } {
  const chosenSlice = slices.find((s) => s.item.id === chosen.id);
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
