import { Participant } from '../types';
import { SettlementSummary, SettlementMemberShare } from './types';

export function calculateSettlementSummary(
  amountStr: string,
  members: Participant[],
  useSplitWeight: boolean
): SettlementSummary {
  const total = parseInt(amountStr.replace(/[^0-9]/g, '') || '0', 10);
  const count = members.length;

  if (count === 0 || total === 0) {
    return {
      perPerson: 0,
      baseUnitAmount: 0,
      remainder: 0,
      total: 0,
      totalWeight: 0,
      memberShares: {},
    };
  }

  if (!useSplitWeight) {
    const perPerson = Math.floor(total / count / 100) * 100; // 100원 단위 절사
    const remainder = total - perPerson * count;
    const memberShares: Record<string, SettlementMemberShare> = {};
    members.forEach((m) => {
      memberShares[m.id] = { amount: perPerson, weight: 1, ratio: 1 / count };
    });
    return { perPerson, baseUnitAmount: perPerson, remainder, total, totalWeight: count, memberShares };
  }

  // 가중치 정산 모드: 총 가중치 합산 (음수 방어, 0 허용)
  const rawTotalWeight = members.reduce((sum, m) => sum + Math.max(0, m.weight ?? 1), 0);
  const totalWeight = Math.round(rawTotalWeight * 10) / 10;

  if (totalWeight <= 0) {
    const perPerson = Math.floor(total / count / 100) * 100;
    const remainder = total - perPerson * count;
    const memberShares: Record<string, SettlementMemberShare> = {};
    members.forEach((m) => {
      memberShares[m.id] = { amount: perPerson, weight: 1, ratio: 1 / count };
    });
    return { perPerson, baseUnitAmount: perPerson, remainder, total, totalWeight: count, memberShares };
  }

  // 1배당 기준 금액 (100원 절사)
  const baseUnitAmount = Math.floor((total / totalWeight) / 100) * 100;

  let allocatedTotal = 0;
  const memberShares: Record<string, SettlementMemberShare> = {};

  members.forEach((m) => {
    const w = Math.max(0, m.weight ?? 1);
    const ratio = w / totalWeight;
    // 100원 단위 절사
    const mAmount = Math.floor((total * ratio) / 100) * 100;
    memberShares[m.id] = { amount: mAmount, weight: w, ratio };
    allocatedTotal += mAmount;
  });

  const remainder = total - allocatedTotal;

  return {
    perPerson: baseUnitAmount,
    baseUnitAmount,
    remainder,
    total,
    totalWeight,
    memberShares,
  };
}

export function formatSettlementShareText(
  summary: SettlementSummary,
  members: Participant[],
  useSplitWeight: boolean
): string {
  let text = '';
  if (!useSplitWeight) {
    text = `[모아보고 정산]\n총 금액: ${summary.total.toLocaleString()}원 (${members.length}명)\n1인당 송금액: ${summary.perPerson.toLocaleString()}원\n\n함께 정산해요!`;
  } else {
    text = `[모아보고 가중치 차등 정산]\n총 결제 금액: ${summary.total.toLocaleString()}원 (${members.length}명 참여, 총 ${summary.totalWeight}배)\n기준 1배당: ₩${summary.baseUnitAmount.toLocaleString()}원\n\n👥 참가자별 송금 금액:\n`;
    members.forEach((m) => {
      const share = summary.memberShares[m.id];
      const amt = share ? share.amount : 0;
      const w = share ? share.weight : 1;
      text += `• ${m.name}: ${amt.toLocaleString()}원 (${w === 0 ? '면제' : `${w}배`})\n`;
    });
    if (summary.remainder > 0) {
      text += `\n(자투리 ${summary.remainder.toLocaleString()}원 제외)\n`;
    }
    text += `\n함께 정산해요!`;
  }
  return text;
}
