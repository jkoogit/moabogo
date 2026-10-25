// 모아보고 게임 결과 카드 2D 캔버스 이미지 생성 및 클립보드 복사 엔진
// SSOT: docs/03.디자인 / 모아보고 고해상도(Retina 2x) 브랜디드 공유 카드 (라이트/다크/여명 블루 테마 완벽 동기화)

export interface LadderResultParticipant {
  id: string;
  name: string;
  avatar: string;
  imageUrl?: string;
  goalText: string;
  goalIcon: string;
  isWinner: boolean;
  orderItemName?: string;
  orderItemPrice?: number;
}

export interface LadderCardData {
  title?: string;
  storeName?: string;
  totalAmount?: number;
  totalCount?: number;
  participants: LadderResultParticipant[];
  isDark?: boolean;
  theme?: 'light' | 'dark' | 'dawn';
}

export interface RouletteCardData {
  title?: string;
  winner: {
    name: string;
    avatar: string;
    weight?: number;
  };
  presetTitle?: string;
  candidates: Array<{
    name: string;
    avatar?: string;
    weight: number;
    pct: number;
  }>;
  isDark?: boolean;
  theme?: 'light' | 'dark' | 'dawn';
}

export interface SettlementResultMember {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  weight: number;
  isSent?: boolean;
}

export interface SettlementCardData {
  title?: string;
  totalAmount: number;
  totalCount: number;
  perPerson: number;
  isWeighted?: boolean;
  totalWeight?: number;
  baseUnitAmount?: number;
  remainder?: number;
  members: SettlementResultMember[];
  isDark?: boolean;
  theme?: 'light' | 'dark' | 'dawn';
}

/**
 * 활성 테마(라이트 / 다크 / 여명 블루)에 따른 캔버스 2D 팔레트 계산기
 */
function getCanvasThemeColors(theme?: 'light' | 'dark' | 'dawn') {
  if (theme === 'dawn') {
    return {
      bgGrad: ['#f0f7ff', '#e0effe', '#dbeafe'],
      glow: ['rgba(37, 99, 235, 0.18)', 'rgba(37, 99, 235, 0)'],
      border: 'rgba(37, 99, 235, 0.25)',
      headerBrand: '#2563eb',
      headerDate: '#64748b',
      title: '#0d2746',
      storeBoxBg: 'rgba(255, 255, 255, 0.9)',
      storeBoxBorder: 'rgba(59, 130, 246, 0.25)',
      storeTitle: '#059669',
      storeTotal: '#0d2746',
      winnerSectionTitle: '#e11d48',
      winnerBoxBg: 'rgba(255, 228, 230, 0.85)',
      winnerBoxBorder: 'rgba(244, 63, 94, 0.45)',
      winnerName: '#881337',
      winnerBadge: '#e11d48',
      winnerRole: '#be123c',
      otherSectionTitle: '#475569',
      otherBoxBg: 'rgba(255, 255, 255, 0.85)',
      otherBoxBorder: 'rgba(203, 213, 225, 0.8)',
      otherName: '#0f172a',
      otherRole: '#64748b',
      footer: '#64748b',
      // Roulette
      rouletteGlow: ['rgba(244, 63, 94, 0.2)', 'rgba(244, 63, 94, 0)'],
      rouletteHeroBg: 'rgba(255, 228, 230, 0.9)',
      rouletteHeroBorder: '#f43f5e',
      rouletteHeroText: '#881337',
      rouletteHeroSub: '#be123c',
      rouletteCandidateBg: 'rgba(255, 255, 255, 0.85)',
      rouletteCandidateBorder: 'rgba(203, 213, 225, 0.8)',
      rouletteCandidateText: '#0f172a',
      rouletteCandidatePct: '#64748b',
      rouletteWinnerCandidateBg: 'rgba(255, 228, 230, 0.9)',
      rouletteWinnerCandidateBorder: '#f43f5e',
      rouletteWinnerCandidateText: '#881337',
      rouletteWinnerCandidatePct: '#e11d48',
    };
  }
  if (theme === 'light') {
    return {
      bgGrad: ['#ffffff', '#f8fafc', '#f1f5f9'],
      glow: ['rgba(99, 102, 241, 0.12)', 'rgba(99, 102, 241, 0)'],
      border: 'rgba(226, 232, 240, 1)',
      headerBrand: '#4f46e5',
      headerDate: '#64748b',
      title: '#0f172a',
      storeBoxBg: 'rgba(241, 245, 249, 0.9)',
      storeBoxBorder: 'rgba(203, 213, 225, 0.8)',
      storeTitle: '#059669',
      storeTotal: '#0f172a',
      winnerSectionTitle: '#e11d48',
      winnerBoxBg: '#fff1f2',
      winnerBoxBorder: '#fecdd3',
      winnerName: '#9f1239',
      winnerBadge: '#e11d48',
      winnerRole: '#be123c',
      otherSectionTitle: '#64748b',
      otherBoxBg: '#ffffff',
      otherBoxBorder: '#e2e8f0',
      otherName: '#0f172a',
      otherRole: '#64748b',
      footer: '#94a3b8',
      // Roulette
      rouletteGlow: ['rgba(244, 63, 94, 0.15)', 'rgba(244, 63, 94, 0)'],
      rouletteHeroBg: '#fff1f2',
      rouletteHeroBorder: '#fecdd3',
      rouletteHeroText: '#9f1239',
      rouletteHeroSub: '#be123c',
      rouletteCandidateBg: '#ffffff',
      rouletteCandidateBorder: '#e2e8f0',
      rouletteCandidateText: '#0f172a',
      rouletteCandidatePct: '#64748b',
      rouletteWinnerCandidateBg: '#fff1f2',
      rouletteWinnerCandidateBorder: '#f43f5e',
      rouletteWinnerCandidateText: '#9f1239',
      rouletteWinnerCandidatePct: '#e11d48',
    };
  }
  // Dark mode (기본 다크)
  return {
    bgGrad: ['#0f172a', '#1e1b4b', '#090d16'],
    glow: ['rgba(99, 102, 241, 0.25)', 'rgba(99, 102, 241, 0)'],
    border: 'rgba(255, 255, 255, 0.12)',
    headerBrand: '#818cf8',
    headerDate: '#94a3b8',
    title: '#ffffff',
    storeBoxBg: 'rgba(255, 255, 255, 0.06)',
    storeBoxBorder: 'rgba(255, 255, 255, 0.1)',
    storeTitle: '#34d399',
    storeTotal: '#f8fafc',
    winnerSectionTitle: '#f43f5e',
    winnerBoxBg: 'rgba(244, 63, 94, 0.14)',
    winnerBoxBorder: 'rgba(244, 63, 94, 0.4)',
    winnerName: '#ffffff',
    winnerBadge: '#f43f5e',
    winnerRole: '#fca5a5',
    otherSectionTitle: '#94a3b8',
    otherBoxBg: 'rgba(255, 255, 255, 0.05)',
    otherBoxBorder: 'rgba(255, 255, 255, 0.08)',
    otherName: '#e2e8f0',
    otherRole: '#94a3b8',
    footer: '#64748b',
    // Roulette
    rouletteGlow: ['rgba(244, 63, 94, 0.28)', 'rgba(244, 63, 94, 0)'],
    rouletteHeroBg: 'rgba(244, 63, 94, 0.15)',
    rouletteHeroBorder: 'rgba(244, 63, 94, 0.5)',
    rouletteHeroText: '#ffffff',
    rouletteHeroSub: '#fda4af',
    rouletteCandidateBg: 'rgba(255, 255, 255, 0.05)',
    rouletteCandidateBorder: 'rgba(255, 255, 255, 0.08)',
    rouletteCandidateText: '#e2e8f0',
    rouletteCandidatePct: '#94a3b8',
    rouletteWinnerCandidateBg: 'rgba(244, 63, 94, 0.2)',
    rouletteWinnerCandidateBorder: 'rgba(244, 63, 94, 0.6)',
    rouletteWinnerCandidateText: '#fecdd3',
    rouletteWinnerCandidatePct: '#fb7185',
  };
}

function loadCanvasImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
    setTimeout(() => resolve(null), 1200);
  });
}

/**
 * 사다리타기 결과 고해상도(2x Retina) 카드 이미지 Blob 생성 (테마 완벽 반영, 너비 2/3 축소 426px)
 */
export async function generateLadderResultCardBlob(data: LadderCardData): Promise<Blob> {
  const width = 426; // 기존 640px의 2/3 규격
  const marginX = 20;
  const colGap = 8;
  const colW = (width - marginX * 2 - colGap) / 2; // 약 189px

  // 참가자 실물 이미지 사전 로드 (실패 시 이모지 아바타 자동 폴백)
  const imageMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    data.participants.map(async (p) => {
      if (p.imageUrl) {
        try {
          const img = await loadCanvasImage(p.imageUrl);
          if (img) imageMap.set(p.id, img);
        } catch {
          // ignore error
        }
      }
    })
  );

  const winnerList = data.participants.filter((p) => p.isWinner);
  const otherList = data.participants.filter((p) => !p.isWinner);
  const colors = getCanvasThemeColors(data.theme);

  // 임시 캔버스로 정확한 텍스트 너비 및 행별 높이 사전 계산
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  measureCtx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';

  // 1) 당첨자 행별 높이 사전 계산 (이름 길면 2줄, 그 행 전체 높이 통일)
  const winnerNameMaxWidth = colW - 64; // 아바타(24px) + 당첨배지(28px) + 여백
  const winnerRowCount = Math.ceil(winnerList.length / 2);
  const winnerRowHeights: number[] = [];
  const winnerLinesMap: Array<{ nameLines: string[]; roleText: string }> = [];

  for (let i = 0; i < winnerList.length; i++) {
    const p = winnerList[i];
    const nameLines = splitTextToLines(measureCtx, p.name, winnerNameMaxWidth, 2);
    const roleText = `${p.goalIcon || ''} ${p.goalText}`;
    winnerLinesMap.push({ nameLines, roleText });
  }

  for (let r = 0; r < winnerRowCount; r++) {
    const p1 = winnerLinesMap[r * 2];
    const p2 = winnerLinesMap[r * 2 + 1];
    const isMultiLine = (p1 && p1.nameLines.length > 1) || (p2 && p2.nameLines.length > 1);
    // 한 명이라도 2줄이면 해당 줄 전체 높이를 56px로 통일, 1줄이면 46px
    winnerRowHeights.push(isMultiLine ? 56 : 46);
  }

  // 2) 통과자 행별 높이 사전 계산 (이름 길면 2줄, 그 행 전체 높이 통일)
  const otherNameMaxWidth = colW - 40;
  const otherRowCount = Math.ceil(otherList.length / 2);
  const otherRowHeights: number[] = [];
  const otherLinesMap: Array<{ nameLines: string[]; roleText: string }> = [];

  for (let i = 0; i < otherList.length; i++) {
    const p = otherList[i];
    const nameLines = splitTextToLines(measureCtx, p.name, otherNameMaxWidth, 2);
    const roleText = `${p.goalIcon || ''} ${p.goalText}`;
    otherLinesMap.push({ nameLines, roleText });
  }

  for (let r = 0; r < otherRowCount; r++) {
    const p1 = otherLinesMap[r * 2];
    const p2 = otherLinesMap[r * 2 + 1];
    const isMultiLine = (p1 && p1.nameLines.length > 1) || (p2 && p2.nameLines.length > 1);
    // 한 명이라도 2줄이면 해당 줄 전체 높이를 48px로 통일, 1줄이면 38px
    otherRowHeights.push(isMultiLine ? 48 : 38);
  }

  // 캔버스 높이 동적 계산 (여백 충분히 확보하여 겹침 방지)
  const baseHeaderHeight = data.storeName ? 170 : 124;
  const winnerSectionHeight = winnerList.length > 0
    ? 24 + winnerRowHeights.reduce((acc, h) => acc + h + 8, 0) + 12
    : 0;
  const otherSectionHeight = otherList.length > 0
    ? 24 + otherRowHeights.reduce((acc, h) => acc + h + 8, 0) + 12
    : 0;
  const footerHeight = 48;
  const height = baseHeaderHeight + winnerSectionHeight + otherSectionHeight + footerHeight;

  const canvas = document.createElement('canvas');
  const dpr = 2; // HiDPI 2x
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.scale(dpr, dpr);

  // 1. 카드 배경 (테마별 그라디언트)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, colors.bgGrad[0]);
  bgGrad.addColorStop(0.5, colors.bgGrad[1]);
  bgGrad.addColorStop(1, colors.bgGrad[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 상단 원형 소프트 글로우
  const glow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, 240);
  glow.addColorStop(0, colors.glow[0]);
  glow.addColorStop(1, colors.glow[1]);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 240);

  // 카드 외곽선 테두리
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  let currentY = 32;

  // 2. 모아보고 브랜딩 헤더
  ctx.textAlign = 'left';
  ctx.fillStyle = colors.headerBrand;
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('MOABOGO GAME • 모아보고', marginX, currentY);

  // 날짜/시간
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = colors.headerDate;
  ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(dateStr, width - marginX, currentY);

  currentY += 26;

  // 타이틀 (당첨자 & 결과 매칭)
  ctx.textAlign = 'left';
  ctx.fillStyle = colors.title;
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(data.title || '🪜 당첨자 & 결과 매칭', marginX, currentY);

  // 매장 정보 박스 (있는 경우)
  if (data.storeName) {
    currentY += 14;
    ctx.fillStyle = colors.storeBoxBg;
    roundRect(ctx, marginX, currentY, width - marginX * 2, 40, 10);
    ctx.fill();
    ctx.strokeStyle = colors.storeBoxBorder;
    ctx.stroke();

    ctx.fillStyle = colors.storeTitle;
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(`☕ ${data.storeName}`, marginX + 12, currentY + 25);

    if (data.totalAmount !== undefined && data.totalCount !== undefined) {
      ctx.textAlign = 'right';
      ctx.fillStyle = colors.storeTotal;
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText(`총 ${data.totalCount}잔 / ${data.totalAmount.toLocaleString()}원`, width - marginX - 12, currentY + 25);
      ctx.textAlign = 'left';
    }
    // 4.1 매장, 금액 영역과 당첨자 타이틀 사이 충분한 공간 확보 (박스 높이 40 + 여백 26)
    currentY += 40 + 26;
  } else {
    currentY += 24;
  }

  // 3. 당첨자 섹션 (3.1 당첨 대상, 이름 길면 다음 줄 표시 & 행 높이 통일)
  if (winnerList.length > 0) {
    ctx.fillStyle = colors.winnerSectionTitle;
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(`🎉 당첨 대상 (${winnerList.length}명)`, marginX, currentY);
    currentY += 12;

    for (let r = 0; r < winnerRowCount; r++) {
      const rowHeight = winnerRowHeights[r];
      const isMultiLine = rowHeight > 46;

      for (let c = 0; c < 2; c++) {
        const idx = r * 2 + c;
        if (idx >= winnerList.length) break;
        const p = winnerList[idx];
        const { nameLines, roleText } = winnerLinesMap[idx];
        const itemX = marginX + c * (colW + colGap);
        const itemY = currentY;

        // 박스 (해당 행 전체 높이 통일)
        ctx.fillStyle = colors.winnerBoxBg;
        roundRect(ctx, itemX, itemY, colW, rowHeight, 9);
        ctx.fill();
        ctx.strokeStyle = colors.winnerBoxBorder;
        ctx.stroke();

        // 아바타 (세로 중앙: 실물 제품 이미지 우선, 실패 시 메뉴 아이콘/이모지)
        const winnerImg = imageMap.get(p.id);
        const avatarY = itemY + (rowHeight / 2) + 6;
        if (winnerImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(itemX + 17, avatarY - 6, 11, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(winnerImg, itemX + 6, avatarY - 17, 22, 22);
          ctx.restore();
        } else {
          ctx.font = '16px sans-serif';
          ctx.fillText(p.avatar || '👤', itemX + 8, avatarY);
        }

        // 당첨 배지
        ctx.fillStyle = colors.winnerBadge;
        ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        ctx.fillText('당첨', itemX + colW - 28, itemY + 16);

        // 이름 (말줄임표 대신 다음 줄 표시)
        ctx.fillStyle = colors.winnerName;
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        if (nameLines.length > 1) {
          ctx.fillText(nameLines[0], itemX + 32, itemY + 15);
          ctx.fillText(nameLines[1], itemX + 32, itemY + 27);
        } else {
          ctx.fillText(nameLines[0], itemX + 32, itemY + 18);
        }

        // 목표/역할
        ctx.fillStyle = colors.winnerRole;
        ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        const roleY = isMultiLine ? itemY + 44 : itemY + 34;
        ctx.fillText(truncateText(ctx, roleText, colW - 36), itemX + 32, roleY);
      }

      currentY += rowHeight + 8;
    }

    currentY += 12;
  }

  // 4. 나머지 참가자 섹션 (3.2 통과 대상, 이름 길면 다음 줄 표시 & 행 높이 통일)
  if (otherList.length > 0) {
    ctx.fillStyle = colors.otherSectionTitle;
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(`🍀 통과 대상 (${otherList.length}명)`, marginX, currentY);
    currentY += 12;

    for (let r = 0; r < otherRowCount; r++) {
      const rowHeight = otherRowHeights[r];
      const isMultiLine = rowHeight > 38;

      for (let c = 0; c < 2; c++) {
        const idx = r * 2 + c;
        if (idx >= otherList.length) break;
        const p = otherList[idx];
        const { nameLines, roleText } = otherLinesMap[idx];
        const itemX = marginX + c * (colW + colGap);
        const itemY = currentY;

        ctx.fillStyle = colors.otherBoxBg;
        roundRect(ctx, itemX, itemY, colW, rowHeight, 8);
        ctx.fill();
        ctx.strokeStyle = colors.otherBoxBorder;
        ctx.stroke();

        // 아바타 (세로 중앙: 실물 제품 이미지 우선, 실패 시 메뉴 아이콘/이모지)
        const otherImg = imageMap.get(p.id);
        const avatarY = itemY + (rowHeight / 2) + 5;
        if (otherImg) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(itemX + 15, avatarY - 5, 9, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(otherImg, itemX + 6, avatarY - 14, 18, 18);
          ctx.restore();
        } else {
          ctx.font = '14px sans-serif';
          ctx.fillText(p.avatar || '👤', itemX + 7, avatarY);
        }

        ctx.fillStyle = colors.otherName;
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        if (nameLines.length > 1) {
          ctx.fillText(nameLines[0], itemX + 28, itemY + 14);
          ctx.fillText(nameLines[1], itemX + 28, itemY + 25);
        } else {
          ctx.fillText(nameLines[0], itemX + 28, itemY + 16);
        }

        ctx.fillStyle = colors.otherRole;
        ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
        const roleY = isMultiLine ? itemY + 38 : itemY + 30;
        ctx.fillText(truncateText(ctx, roleText, colW - 32), itemX + 28, roleY);
      }

      currentY += rowHeight + 8;
    }

    currentY += 12;
  }

  // 5. 푸터 (워터마크)
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.footer;
  ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('공정하고 투명한 모임 가계부 & 게임 • 모아보고 (MoaBogo)', width / 2, height - 20);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png');
  });
}

/**
 * 룰렛 당첨 결과 고해상도(2x Retina) 카드 이미지 Blob 생성 (테마 완벽 반영)
 */
export async function generateRouletteResultCardBlob(data: RouletteCardData): Promise<Blob> {
  const width = 426;
  const marginX = 20;
  const colGap = 8;
  const colW = (width - marginX * 2 - colGap) / 2;

  const candidateCount = data.candidates.length;
  const candidateRows = Math.ceil(candidateCount / 2);
  const height = 310 + candidateRows * 40 + 44;
  const colors = getCanvasThemeColors(data.theme);

  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.scale(dpr, dpr);

  // 1. 배경
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, colors.bgGrad[0]);
  bgGrad.addColorStop(0.5, colors.bgGrad[1]);
  bgGrad.addColorStop(1, colors.bgGrad[2]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 상단 원형 소프트 핑크 글로우
  const glow = ctx.createRadialGradient(width / 2, 0, 10, width / 2, 0, 240);
  glow.addColorStop(0, colors.rouletteGlow[0]);
  glow.addColorStop(1, colors.rouletteGlow[1]);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, 240);

  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  let currentY = 32;

  // 2. 브랜딩
  ctx.textAlign = 'left';
  ctx.fillStyle = colors.headerBrand;
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('MOABOGO ROULETTE • 룰렛 추첨 결과', marginX, currentY);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = colors.headerDate;
  ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(dateStr, width - marginX, currentY);

  currentY += 26;

  // 프리셋 제목
  if (data.presetTitle) {
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.title;
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(`📌 ${data.presetTitle}`, marginX, currentY);
    currentY += 20;
  }

  // 3. 당첨자 히어로 카드
  const heroH = 110;
  ctx.fillStyle = colors.rouletteHeroBg;
  roundRect(ctx, marginX, currentY, width - marginX * 2, heroH, 14);
  ctx.fill();
  ctx.strokeStyle = colors.rouletteHeroBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 당첨 아바타
  ctx.textAlign = 'center';
  ctx.font = '36px sans-serif';
  ctx.fillText(data.winner.avatar || '🎯', width / 2, currentY + 44);

  // 당첨 텍스트
  ctx.fillStyle = colors.rouletteHeroText;
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(`🎯 오늘의 당첨: [${data.winner.name}]`, width / 2, currentY + 76);

  ctx.fillStyle = colors.rouletteHeroSub;
  ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('축하합니다! 오늘의 룰렛 주인공으로 선정되었습니다.', width / 2, currentY + 96);

  currentY += heroH + 22;

  // 4. 전체 후보 목록
  ctx.textAlign = 'left';
  ctx.fillStyle = colors.otherSectionTitle;
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(`📋 참여 항목 및 확률 (${candidateCount}개)`, marginX, currentY);
  currentY += 12;

  for (let i = 0; i < candidateCount; i++) {
    const c = data.candidates[i];
    const isWinner = c.name === data.winner.name;
    const col = i % 2;
    const row = Math.floor(i / 2);
    const itemX = marginX + col * (colW + colGap);
    const itemY = currentY + row * 38;

    ctx.fillStyle = isWinner ? colors.rouletteWinnerCandidateBg : colors.rouletteCandidateBg;
    roundRect(ctx, itemX, itemY, colW, 34, 8);
    ctx.fill();
    ctx.strokeStyle = isWinner ? colors.rouletteWinnerCandidateBorder : colors.rouletteCandidateBorder;
    ctx.stroke();

    ctx.font = '13px sans-serif';
    ctx.fillText(c.avatar || '🎯', itemX + 7, itemY + 22);

    ctx.fillStyle = isWinner ? colors.rouletteWinnerCandidateText : colors.rouletteCandidateText;
    ctx.font = isWinner
      ? 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif'
      : '500 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(truncateText(ctx, c.name, colW - 56), itemX + 26, itemY + 21);

    ctx.textAlign = 'right';
    ctx.fillStyle = isWinner ? colors.rouletteWinnerCandidatePct : colors.rouletteCandidatePct;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${c.pct}%`, itemX + colW - 8, itemY + 21);
    ctx.textAlign = 'left';
  }

  currentY += candidateRows * 38 + 20;

  // 5. 푸터
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.footer;
  ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('공정하고 투명한 모임 가계부 & 게임 • 모아보고 (MoaBogo)', width / 2, height - 16);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png');
  });
}

/**
 * 정산 결과 고해상도(2x Retina) 카드 이미지 Blob 생성 (균등 및 가중치 차등 분배 완벽 지원)
 */
export async function generateSettlementResultCardBlob(data: SettlementCardData): Promise<Blob> {
  const width = 426;
  const marginX = 20;
  const colGap = 8;
  const colW = (width - marginX * 2 - colGap) / 2;

  const colors = getCanvasThemeColors(data.theme);
  const memberCount = data.members.length;
  const memberRows = Math.ceil(memberCount / 2);

  // 헤더 110px + 서머리 박스 84px + 참가자 목록 + 푸터 48px
  const baseHeight = 110 + 84 + 20 + 16;
  const memberSectionHeight = memberRows * 44 + 16;
  const footerHeight = 48;
  const height = baseHeight + memberSectionHeight + footerHeight;

  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.scale(dpr, dpr);

  // 1. 배경 그라디언트
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, colors.bgGrad[0]);
  bgGrad.addColorStop(0.5, colors.bgGrad[1]);
  bgGrad.addColorStop(1, colors.bgGrad[2]);
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, width, height, 24);
  ctx.fill();

  // 글로우 효과
  const glow = ctx.createRadialGradient(width / 2, 80, 10, width / 2, 80, 200);
  glow.addColorStop(0, colors.glow[0]);
  glow.addColorStop(1, colors.glow[1]);
  ctx.fillStyle = glow;
  roundRect(ctx, 0, 0, width, height, 24);
  ctx.fill();

  // 카드 외곽 테두리
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1.5;
  roundRect(ctx, 0.75, 0.75, width - 1.5, height - 1.5, 24);
  ctx.stroke();

  let currentY = 28;

  // 2. 상단 헤더
  ctx.fillStyle = colors.headerBrand;
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('MOABOGO SMART SETTLEMENT', marginX, currentY);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  ctx.textAlign = 'right';
  ctx.fillStyle = colors.headerDate;
  ctx.font = '500 10px monospace';
  ctx.fillText(dateStr, width - marginX, currentY);
  ctx.textAlign = 'left';

  currentY += 24;

  ctx.fillStyle = colors.title;
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(data.title || '⚡ 모임 정산 결과 내역서', marginX, currentY);

  currentY += 18;

  // 3. 서머리 박스 (총 결제액 & 1인당/기준1배당 금액)
  const summaryBoxY = currentY;
  const summaryBoxH = 80;
  ctx.fillStyle = colors.storeBoxBg;
  roundRect(ctx, marginX, summaryBoxY, width - marginX * 2, summaryBoxH, 14);
  ctx.fill();
  ctx.strokeStyle = colors.storeBoxBorder;
  ctx.stroke();

  // 서머리 내용
  ctx.fillStyle = colors.storeTitle;
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(
    data.isWeighted
      ? `⚖️ 가중치 차등 분배 (총 ${data.totalWeight}배, ${data.totalCount}명)`
      : `👥 1/N 균등 분배 (${data.totalCount}명 균등)`,
    marginX + 14,
    summaryBoxY + 22
  );

  ctx.fillStyle = colors.storeTotal;
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(`총 ₩${data.totalAmount.toLocaleString()}원`, marginX + 14, summaryBoxY + 44);

  // 우측에 1인당 금액 강조
  ctx.textAlign = 'right';
  ctx.fillStyle = colors.headerBrand;
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(data.isWeighted ? '기준 1배당 금액' : '1인당 송금액', width - marginX - 14, summaryBoxY + 22);

  ctx.fillStyle = colors.title;
  ctx.font = 'bold 17px monospace';
  ctx.fillText(`₩${data.perPerson.toLocaleString()}원`, width - marginX - 14, summaryBoxY + 46);

  if (data.remainder && data.remainder > 0) {
    ctx.fillStyle = '#f59e0b';
    ctx.font = '500 9px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(`(자투리 ₩${data.remainder.toLocaleString()}원 제외)`, width - marginX - 14, summaryBoxY + 64);
  }
  ctx.textAlign = 'left';

  currentY += summaryBoxH + 20;

  // 4. 참가자별 분담금 그리드
  ctx.fillStyle = colors.otherSectionTitle;
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText(`📋 참가자별 송금 분담금 (${memberCount}명)`, marginX, currentY);
  currentY += 12;

  for (let i = 0; i < memberCount; i++) {
    const m = data.members[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const itemX = marginX + col * (colW + colGap);
    const itemY = currentY + row * 44;

    ctx.fillStyle = m.isSent ? 'rgba(16, 185, 129, 0.12)' : colors.otherBoxBg;
    roundRect(ctx, itemX, itemY, colW, 38, 10);
    ctx.fill();
    ctx.strokeStyle = m.isSent ? 'rgba(16, 185, 129, 0.5)' : colors.otherBoxBorder;
    ctx.stroke();

    // 아바타
    ctx.font = '14px sans-serif';
    ctx.fillText(m.avatar || '👤', itemX + 8, itemY + 24);

    // 이름
    ctx.fillStyle = m.isSent ? '#059669' : colors.otherName;
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
    ctx.fillText(truncateText(ctx, m.name, colW - 95), itemX + 28, itemY + 18);

    // 가중치 뱃지
    if (data.isWeighted) {
      ctx.fillStyle = m.weight === 0 ? '#64748b' : colors.headerBrand;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(m.weight === 0 ? '면제' : `${m.weight}배`, itemX + 28, itemY + 31);
    }

    // 금액
    ctx.textAlign = 'right';
    ctx.fillStyle = m.isSent ? '#059669' : colors.title;
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`₩${m.amount.toLocaleString()}원`, itemX + colW - 8, itemY + 22);

    if (m.isSent) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
      ctx.fillText('✓ 송금완료', itemX + colW - 8, itemY + 32);
    }
    ctx.textAlign = 'left';
  }

  currentY += memberRows * 44 + 20;

  // 5. 푸터
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.footer;
  ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
  ctx.fillText('공정하고 투명한 모임 가계부 & 정산 • 모아보고 (MoaBogo)', width / 2, height - 16);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas blob generation failed'));
    }, 'image/png');
  });
}

/**
 * 이미지 Blob을 시스템 클립보드에 복사
 */
export async function copyBlobToClipboard(blob: Blob): Promise<{ success: boolean; error?: string }> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return { success: false, error: '현재 브라우저 환경에서 클립보드 이미지 복사를 지원하지 않습니다.' };
    }
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Clipboard image write failed, fallback may be required:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * 이미지 Blob 파일 다운로드 (폴백용)
 */
export function downloadBlobAsFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Web Share API (모바일 네이티브 공유 다이얼로그)
 */
export async function shareImageBlob(blob: Blob, title: string, text: string): Promise<boolean> {
  try {
    const file = new File([blob], 'moabogo_result.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    }
  } catch (e) {
    console.warn('Web Share API aborted or failed:', e);
  }
  return false;
}

/**
 * 캔버스 둥근 사각형 경로 헬퍼
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * 캔버스 텍스트 최대 폭 초과 시 말줄임표(...) 처리 헬퍼
 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let len = text.length;
  while (len > 1 && ctx.measureText(text.slice(0, len) + '...').width > maxWidth) {
    len--;
  }
  return text.slice(0, len) + '...';
}

/**
 * 텍스트가 maxWidth를 넘을 경우 말줄임 대신 다음 줄(최대 2줄)로 분할
 */
function splitTextToLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2): string[] {
  if (!text) return [''];
  if (ctx.measureText(text).width <= maxWidth) {
    return [text];
  }
  const lines: string[] = [];
  let currentLine = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const testLine = currentLine + char;
    if (ctx.measureText(testLine).width > maxWidth && currentLine.length > 0) {
      if (lines.length + 1 < maxLines) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.slice(0, maxLines);
}
