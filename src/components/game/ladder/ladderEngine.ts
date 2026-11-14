import { Participant } from '../types';
import {
  LadderRung,
  LadderGoal,
  LadderResultMap,
  LADDER_COL_WIDTH,
} from './types';
import { StorePreset, StoreMenuItem } from '../../../sample/data/systemStorePool';

export const getStoreMenuEmoji = (item: StoreMenuItem): string => {
  if (item.iconName) return item.iconName;
  const cat = item.categoryName || '';
  const name = item.name || '';

  if (name.includes('딸기') || name.includes('스트로베리')) return '🍓';
  if (name.includes('망고')) return '🥭';
  if (name.includes('바나나')) return '🍌';
  if (name.includes('레몬') || name.includes('유자')) return '🍋';
  if (name.includes('자몽') || name.includes('오렌지')) return '🍊';
  if (name.includes('사과') || name.includes('애플')) return '🍎';
  if (name.includes('초코') || name.includes('모카')) return '🍫';
  if (name.includes('카라멜') || name.includes('바닐라')) return '🍯';
  if (name.includes('녹차') || name.includes('말차')) return '🍵';
  if (name.includes('얼그레이') || name.includes('캐모마일') || name.includes('페퍼민트') || name.includes('블랙티') || cat.includes('티')) return '🫖';
  if (name.includes('콜드브루') || (name.includes('아메리카노') && name.includes('ICE'))) return '🧊';
  if (name.includes('스무디') || name.includes('프라푸치노') || name.includes('블렌디드') || name.includes('쉐이크') || name.includes('프라페')) return '🥤';
  if (name.includes('에이드') || name.includes('주스') || name.includes('피지오')) return '🍹';
  if (name.includes('라떼') || name.includes('카푸치노') || name.includes('마키아또') || name.includes('밀크')) return '🥛';
  if (name.includes('아메리카노') || name.includes('에스프레소') || cat.includes('커피')) return '☕';
  if (name.includes('케이크') || name.includes('타르트') || name.includes('카스텔라')) return '🍰';
  if (name.includes('베이글') || name.includes('크루아상') || name.includes('소금빵')) return '🥯';
  if (name.includes('마카롱') || name.includes('까눌레')) return '🧁';
  if (name.includes('쿠키') || name.includes('스콘')) return '🍪';
  if (name.includes('샌드위치') || name.includes('토스트') || name.includes('파니니')) return '🥪';
  if (name.includes('버거')) return '🍔';
  if (name.includes('피자')) return '🍕';
  if (name.includes('파스타') || name.includes('스파게티')) return '🍝';
  if (name.includes('샐러드')) return '🥗';
  if (name.includes('빙수') || name.includes('아이스크림')) return '🍧';
  if (name.includes('떡볶이') || name.includes('순대') || name.includes('튀김')) return '🍢';
  if (name.includes('김치찌개') || name.includes('된장찌개') || name.includes('국밥')) return '🍲';
  if (name.includes('돈까스') || name.includes('카레')) return '🍛';
  if (name.includes('짜장') || name.includes('짬뽕')) return '🍜';
  if (name.includes('치킨')) return '🍗';
  return '☕';
};

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

export interface PolylineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  len: number;
  cumStart: number;
  cumEnd: number;
  vx: number;
}

export interface PolylineCurve {
  waypoints: { x: number; y: number }[];
  segments: PolylineSegment[];
  totalLength: number;
}

export const buildPolylineCurve = (waypoints: { x: number; y: number }[]): PolylineCurve => {
  const segments: PolylineSegment[] = [];
  let totalLength = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.001) {
      segments.push({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        len,
        cumStart: totalLength,
        cumEnd: totalLength + len,
        vx: dx / len,
      });
      totalLength += len;
    }
  }

  return { waypoints, segments, totalLength };
};

export const samplePolylineAtDistance = (
  curve: PolylineCurve,
  distance: number
): {
  pos: { x: number; y: number };
  trail: { x: number; y: number }[];
  vx: number;
  done: boolean;
} => {
  const { waypoints, segments, totalLength } = curve;
  if (waypoints.length === 0) {
    return { pos: { x: 0, y: 0 }, trail: [], vx: 0, done: true };
  }
  if (segments.length === 0 || distance >= totalLength) {
    const last = waypoints[waypoints.length - 1];
    return { pos: last, trail: waypoints, vx: 0, done: true };
  }
  if (distance <= 0) {
    const first = waypoints[0];
    return { pos: first, trail: [first], vx: segments[0].vx, done: false };
  }

  const trail: { x: number; y: number }[] = [{ x: segments[0].x1, y: segments[0].y1 }];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (distance <= seg.cumEnd || i === segments.length - 1) {
      const t = Math.max(0, Math.min(1, (distance - seg.cumStart) / seg.len));
      const pos = {
        x: seg.x1 + (seg.x2 - seg.x1) * t,
        y: seg.y1 + (seg.y2 - seg.y1) * t,
      };
      trail.push(pos);
      return { pos, trail, vx: seg.vx, done: false };
    }
    trail.push({ x: seg.x2, y: seg.y2 });
  }

  const last = waypoints[waypoints.length - 1];
  return { pos: last, trail: waypoints, vx: 0, done: true };
};

export const computeLadderPaths = (
  members: Participant[],
  ladderGoals: LadderGoal[],
  activeRungs: LadderRung[]
): {
  results: LadderResultMap;
  paths: Record<string, { x: number; y: number }[]>;
  waypointsMap: Record<string, { x: number; y: number }[]>;
} => {
  const rows = 10;
  const results: LadderResultMap = {};
  const paths: Record<string, { x: number; y: number }[]> = {};
  const waypointsMap: Record<string, { x: number; y: number }[]> = {};
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
    waypointsMap[member.id] = waypoints;

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

  return { results, paths, waypointsMap };
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
