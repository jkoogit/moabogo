// ============================================================================
// src/sample/shared/offlineProofAssets.ts
// 오프라인·폐쇄망 환경에서도 깨지지 않는 로컬 SVG Data URI 인증 증빙 프리뷰 자산
// - 외부 Unsplash URL 의존성 제거 (BKL-ARCH-01 / ARCH-05)
// ============================================================================

export type OfflineProofTheme = 'CLEANING' | 'RECYCLING' | 'WALKING' | 'DEFAULT';

const THEME_PALETTE: Record<
  OfflineProofTheme,
  { bgStart: string; bgEnd: string; accent: string; badge: string; iconLabel: string }
> = {
  CLEANING: {
    bgStart: '#EEF2FF',
    bgEnd: '#E0E7FF',
    accent: '#4F46E5',
    badge: '청소 인증',
    iconLabel: 'CLEAN',
  },
  RECYCLING: {
    bgStart: '#ECFDF5',
    bgEnd: '#D1FAE5',
    accent: '#059669',
    badge: '배출 인증',
    iconLabel: 'ECO',
  },
  WALKING: {
    bgStart: '#F0F9FF',
    bgEnd: '#E0F2FE',
    accent: '#0284C7',
    badge: '만보 인증',
    iconLabel: 'STEP',
  },
  DEFAULT: {
    bgStart: '#F8FAFC',
    bgEnd: '#E2E8F0',
    accent: '#475569',
    badge: '증빙 완료',
    iconLabel: 'OK',
  },
};

function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 오프라인 안전 SVG Data URI 생성기
 */
export function createOfflineProofPlaceholder(
  theme: OfflineProofTheme,
  title: string,
  subtitle: string
): string {
  const palette = THEME_PALETTE[theme] || THEME_PALETTE.DEFAULT;
  const safeTitle = escapeSvgText(title);
  const safeSubtitle = escapeSvgText(subtitle);
  const safeBadge = escapeSvgText(palette.badge);

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">',
    '<defs>',
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.bgStart}"/><stop offset="100%" stop-color="${palette.bgEnd}"/></linearGradient>`,
    '</defs>',
    '<rect width="600" height="360" rx="24" fill="url(#bg)"/>',
    `<circle cx="510" cy="70" r="90" fill="${palette.accent}" fill-opacity="0.08"/>`,
    `<circle cx="80" cy="300" r="70" fill="${palette.accent}" fill-opacity="0.08"/>`,
    `<rect x="36" y="34" width="116" height="34" rx="17" fill="${palette.accent}"/>`,
    `<text x="94" y="56" font-family="sans-serif" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">${safeBadge}</text>`,
    `<rect x="44" y="108" width="84" height="84" rx="20" fill="#FFFFFF" fill-opacity="0.9"/>`,
    `<text x="86" y="158" font-family="sans-serif" font-size="18" font-weight="800" fill="${palette.accent}" text-anchor="middle">${palette.iconLabel}</text>`,
    `<text x="150" y="145" font-family="sans-serif" font-size="24" font-weight="800" fill="#0F172A">${safeTitle}</text>`,
    `<text x="150" y="180" font-family="sans-serif" font-size="15" font-weight="600" fill="#475569">${safeSubtitle}</text>`,
    '<rect x="44" y="236" width="512" height="72" rx="16" fill="#FFFFFF" fill-opacity="0.78"/>',
    `<text x="68" y="268" font-family="sans-serif" font-size="14" font-weight="700" fill="${palette.accent}">MoaBogo Offline-Safe Verified Proof</text>`,
    '<text x="68" y="292" font-family="sans-serif" font-size="13" fill="#64748B">로컬 보안 증빙 자산 • 외부 네트워크 없이 안전 렌더링</text>',
    '</svg>',
  ].join('');

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const OFFLINE_PROOF_CLEANING = createOfflineProofPlaceholder(
  'CLEANING',
  '거실 청소기 및 물걸레 완료',
  '실내 바닥 소독 및 정돈 증빙 스냅샷'
);

export const OFFLINE_PROOF_RECYCLING = createOfflineProofPlaceholder(
  'RECYCLING',
  '주말 분리수거 및 배출 완료',
  '재활용품 분류 및 음식물 배출 증빙 스냅샷'
);

export const OFFLINE_PROOF_WALKING = createOfflineProofPlaceholder(
  'WALKING',
  '10,050보 걷기 챌린지 달성',
  '일일 만보 걸음 수 인증 스냅샷'
);
