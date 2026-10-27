import { Participant } from '../types';
import {
  LadderRung,
  LadderGoal,
  LadderResultMap,
  LADDER_COL_WIDTH,
} from './types';
import { StorePreset } from '../../../sample/data/systemStorePool';

export const generateDefaultLadderGoals = (total: number, winners: number): LadderGoal[] => {
  let selectIdx = 1;
  let passIdx = 1;
  const safeWinners = Math.max(1, Math.min(total - 1, winners));
  return Array.from({ length: total }, (_, i) => {
    if (i < safeWinners) {
      return { text: `선택 ${selectIdx++}`, icon: '🎁' };
    } else {
      return { text: `통과 ${passIdx++}`, icon: '💨' };
    }
  });
};

export const generateLadderRungs = (cols: number, seed: number): LadderRung[] => {
  const rows = 10;
  const rungs: LadderRung[] = [];

  let s = (seed * 41 + cols * 67 + 101) % 233280;
  const pseudoRand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const phaseOffset = pseudoRand() > 0.5 ? 1 : 0;

  for (let c = 0; c < cols - 1; c++) {
    const isEvenColGroup = (c + phaseOffset) % 2 === 0;
    const candidateRows = isEvenColGroup ? [0, 2, 4, 6, 8] : [1, 3, 5, 7, 9];

    const shuffled = [...candidateRows].sort(() => pseudoRand() - 0.5);
    const pickCount = pseudoRand() > 0.35 ? 3 : 4;
    const selected = shuffled.slice(0, pickCount);

    selected.forEach((r) => {
      rungs.push({ col: c, row: r });
    });
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const alreadyHas = rungs.some((item) => item.row === r && item.col === c);
      if (!alreadyHas) {
        const leftHas = rungs.some((item) => item.row === r && item.col === c - 1);
        const rightHas = rungs.some((item) => item.row === r && item.col === c + 1);
        if (!leftHas && !rightHas && pseudoRand() > 0.72) {
          rungs.push({ col: c, row: r });
        }
      }
    }
  }

  return rungs;
};

export const computeLadderPaths = (
  members: Participant[],
  ladderGoals: LadderGoal[],
  activeRungs: LadderRung[]
): { results: LadderResultMap; paths: Record<string, { x: number; y: number }[]> } => {
  const rows = 10;
  const results: LadderResultMap = {};
  const paths: Record<string, { x: number; y: number }[]> = {};
  const colWidth = LADDER_COL_WIDTH;
  const startY = 12;
  const endY = 244;

  const getX = (col: number) => col * colWidth + colWidth / 2;
  const getRungY = (r: number) => 28 + r * 22;

  members.forEach((member, startCol) => {
    let currentCol = startCol;
    const waypoints: { x: number; y: number }[] = [];
    waypoints.push({ x: getX(currentCol), y: startY });

    for (let r = 0; r < rows; r++) {
      const rungY = getRungY(r);
      waypoints.push({ x: getX(currentCol), y: rungY });

      const rightRung = activeRungs.some((item) => item.row === r && item.col === currentCol);
      if (rightRung) {
        currentCol += 1;
        waypoints.push({ x: getX(currentCol), y: rungY });
        continue;
      }

      const leftRung = activeRungs.some((item) => item.row === r && item.col === currentCol - 1);
      if (leftRung) {
        currentCol -= 1;
        waypoints.push({ x: getX(currentCol), y: rungY });
        continue;
      }
    }

    waypoints.push({ x: getX(currentCol), y: endY });

    const densePoints: { x: number; y: number }[] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const steps = Math.max(4, Math.round(dist / 6));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        densePoints.push({
          x: Math.round(p1.x + (p2.x - p1.x) * t),
          y: Math.round(p1.y + (p2.y - p1.y) * t),
        });
      }
    }
    densePoints.push(waypoints[waypoints.length - 1]);
    paths[member.id] = densePoints;

    const targetGoal = ladderGoals[currentCol] || { text: '통과', icon: '💨' };
    const isWinner =
      targetGoal.icon === '🎁' ||
      targetGoal.text.includes('당첨') ||
      targetGoal.text.includes('1등') ||
      targetGoal.text.includes('선택') ||
      targetGoal.text.includes('쏠 사람') ||
      targetGoal.text.includes('결제') ||
      targetGoal.text.includes('커피') ||
      targetGoal.text.includes('점심');

    results[member.id] = {
      goalIndex: currentCol,
      text: targetGoal.text,
      icon: targetGoal.icon,
      isWinner,
    };
  });

  return { results, paths };
};

export const formatLadderResultText = (
  results: LadderResultMap,
  members: Participant[],
  selectedStore: StorePreset | null
): string => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
    now.getDate()
  ).padStart(2, '0')}`;
  let text = `[모아보고 사다리타기 최종 결과]\n`;
  text += `📅 일시: ${dateStr} | 참여 ${members.length}명\n\n`;

  const winners = members.filter((m) => results[m.id]?.isWinner);
  if (winners.length > 0) {
    text += `🏆 당첨자 명단:\n`;
    winners.forEach((w) => {
      const res = results[w.id];
      text += `• ${w.avatar} ${w.name} ➔ ${res?.icon} ${res?.text}\n`;
    });
    text += `\n`;
  }

  text += `👥 전체 참가자 결과:\n`;
  members.forEach((m) => {
    const res = results[m.id];
    text += `• ${m.avatar} ${m.name}: ${res?.icon || '❓'} ${res?.text || '대기'}\n`;
  });

  text += `\n스마트 가계부 & 모임 정산 • 모아보고`;
  return text;
};

export const formatStoreOrderText = (
  results: LadderResultMap,
  members: Participant[],
  selectedStore: StorePreset
): string => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const payerMember = members.find((m) => results[m.id]?.isWinner) || members[0];

  const itemCounts: Record<string, { count: number; price: number; name: string }> = {};
  let totalAmount = 0;
  let totalCount = 0;

  members.forEach((m) => {
    if (m.selectedMenu) {
      const item = m.selectedMenu;
      if (!itemCounts[item.id]) {
        itemCounts[item.id] = { count: 0, price: item.price, name: item.name };
      }
      itemCounts[item.id].count += 1;
      totalAmount += item.price;
      totalCount += 1;
    }
  });

  let itemsText = '';
  Object.values(itemCounts).forEach((it) => {
    itemsText += `• ${it.name} x ${it.count}개 (${(it.price * it.count).toLocaleString()}원)\n`;
  });

  let participantMenuText = '';
  members.forEach((m) => {
    participantMenuText += `• ${m.name}: ${m.selectedMenu?.name || '미선택'}\n`;
  });

  return `[모아보고 사다리 결과 - ${selectedStore.name}]\n📅 ${dateStr} | 총 ${members.length}명 참여\n\n🏆 당첨 결과:\n• 💳 오늘 결제: ${
    payerMember ? payerMember.name : '결제 당첨자'
  } (축하합니다! 🎉)\n\n☕ 주문 내역 요약 (총 ${totalCount}잔 / ${totalAmount.toLocaleString()}원):\n${itemsText}\n👥 각자 선택한 메뉴:\n${participantMenuText}\n스마트 가계부 & 모임 정산 • 모아보고`;
};
