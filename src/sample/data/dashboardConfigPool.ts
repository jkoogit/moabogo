/**
 * src/sample/data/dashboardConfigPool.ts
 * 대시보드 위젯 배치, On/Off, 프리셋 중앙 집중 관리 스토어 풀
 * SCR_DSH_01과 SCR_SET_01 간 SSOT(단일 진실 공급원) 동기화 지원
 */

export type DashboardModuleId =
  | 'bookshelf'
  | 'inbound_radar'
  | 'financial_brief'
  | 'duty_widget'
  | 'goal_widget'
  | 'quick_game'
  | 'activity_feed';

export type DashboardPreset = 'DEFAULT' | 'FINANCE_FIRST' | 'LIFE_FIRST' | 'QUICK_GAME';

export interface ModuleConfig {
  id: DashboardModuleId;
  enabled: boolean;
  title: string;
  category: '가계부' | '요청머니' | '일상' | '게임' | '활동이력';
  description: string;
  previewThumbnail?: string;
  detailFeatures?: string[];
}

export const STORAGE_KEY = 'moabogo_dashboard_config_v3';

export const DEFAULT_MODULES: ModuleConfig[] = [
  {
    id: 'bookshelf',
    enabled: true,
    title: '가계부 책꽂이 (Bookshelf)',
    category: '가계부',
    description: '관리 중인 개인/그룹/인스턴스 가계부 덱 및 카드/목록 전환',
    detailFeatures: ['3D 카툰 책장 시각화', '가계부 즉시 전환', '잔액 및 예산 한눈에 보기'],
  },
  {
    id: 'inbound_radar',
    enabled: true,
    title: '요청된 머니 (Inbound Money)',
    category: '요청머니',
    description: '도착한 모임 정산 및 용돈 지급 요청 모니터링 & 간편 송금',
    detailFeatures: ['실시간 정산 요청 알림', '원터치 간편 송금', '미수금 대사'],
  },
  {
    id: 'financial_brief',
    enabled: true,
    title: '가계부 금융 & 순수 생활비 브리핑',
    category: '가계부',
    description: '현재 활성 가계부의 순수 생활비(자산이동 분리) 및 예산 소진율',
    detailFeatures: ['단일 귀속성 자산이동 분리', '월간 예산 소진율 게이지', '이중계상 방지'],
  },
  {
    id: 'duty_widget',
    enabled: true,
    title: '모아당번 일상 위젯',
    category: '일상',
    description: '직교 3상태머신 기반 당번 과업 및 대신수행 즉시 승인',
    detailFeatures: ['오늘의 당번 체크', '사진 인증 및 대행 승인', '정산 상태 연동'],
  },
  {
    id: 'goal_widget',
    enabled: true,
    title: '모아목표 일상 위젯',
    category: '일상',
    description: '동행원/관람원 챌린지 및 오늘 걸음수/저축 1초 체크인',
    detailFeatures: ['목표 달성률 시각화', '동행원 응원 메시지', '1초 빠른 체크인'],
  },
  {
    id: 'quick_game',
    enabled: true,
    title: '게임·정산 즉시실행 퀵런처',
    category: '게임',
    description: '로그인 사용자 전용 프리셋(사다리/룰렛) 원클릭 즉시 플레이',
    detailFeatures: ['저장된 모임 멤버 연동', '사다리 & 룰렛 즉시 플레이', '결과 가계부 직행'],
  },
  {
    id: 'activity_feed',
    enabled: true,
    title: '활동이력 타임라인',
    category: '활동이력',
    description: '가계부·머니·당번·목표·게임 실시간 통합 타임라인 피드',
    detailFeatures: ['실시간 종합 활동 이력', '필터링 검색', '상세 거래 팝업 연결'],
  },
];

export const PRESET_ORDER_MAP: Record<DashboardPreset, DashboardModuleId[]> = {
  DEFAULT: [
    'bookshelf',
    'inbound_radar',
    'financial_brief',
    'duty_widget',
    'goal_widget',
    'quick_game',
    'activity_feed',
  ],
  FINANCE_FIRST: [
    'bookshelf',
    'financial_brief',
    'inbound_radar',
    'activity_feed',
    'duty_widget',
    'goal_widget',
    'quick_game',
  ],
  LIFE_FIRST: [
    'duty_widget',
    'goal_widget',
    'inbound_radar',
    'bookshelf',
    'financial_brief',
    'quick_game',
    'activity_feed',
  ],
  QUICK_GAME: [
    'quick_game',
    'activity_feed',
    'inbound_radar',
    'bookshelf',
    'financial_brief',
    'duty_widget',
    'goal_widget',
  ],
};

export const PRESET_LABELS: Record<DashboardPreset, { title: string; desc: string }> = {
  DEFAULT: {
    title: '기본 균형형',
    desc: '가계부 책장과 요청머니, 일상 위젯을 균형 있게 배치합니다.',
  },
  FINANCE_FIRST: {
    title: '금융 자산 집중형',
    desc: '장부와 생활비 브리핑, 정산 레이더를 최상단에 전진 배치합니다.',
  },
  LIFE_FIRST: {
    title: '일상 협업 중심형',
    desc: '당번 과업과 목표 챌린지 위젯을 우선적으로 확인합니다.',
  },
  QUICK_GAME: {
    title: '게임·모임 빠른실행형',
    desc: '모임 정산 퀵런처와 활동 피드를 빠르게 실행할 수 있도록 배치합니다.',
  },
};

/**
 * 로컬스토리지에서 대시보드 위젯 설정 로드
 */
export function loadDashboardModules(): ModuleConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MODULES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_MODULES;

    // 기존 기본 목록과 매핑하여 신규 모듈 누락 방지
    const loadedIds = new Set(parsed.map((m: any) => m.id));
    const merged: ModuleConfig[] = parsed.map((item: any) => {
      const def = DEFAULT_MODULES.find((m) => m.id === item.id);
      return {
        id: item.id,
        enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
        title: item.title || def?.title || item.id,
        category: def?.category || '가계부',
        description: def?.description || '',
        detailFeatures: def?.detailFeatures || [],
      };
    });

    // 기본 목록 중 누락된 것이 있다면 후순위로 추가
    DEFAULT_MODULES.forEach((def) => {
      if (!loadedIds.has(def.id)) {
        merged.push(def);
      }
    });

    return merged;
  } catch (_) {
    return DEFAULT_MODULES;
  }
}

/**
 * 로컬스토리지에 대시보드 위젯 설정 저장
 */
export function saveDashboardModules(modules: ModuleConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
    // 다른 컴포넌트/창에 스토리지 변경 이벤트 전파
    window.dispatchEvent(new Event('moabogo_dashboard_config_updated'));
  } catch (err) {
    console.error('Failed to save dashboard config:', err);
  }
}

/**
 * 프리셋 적용
 */
export function applyDashboardPreset(
  preset: DashboardPreset,
  currentModules: ModuleConfig[]
): ModuleConfig[] {
  const order = PRESET_ORDER_MAP[preset];
  const moduleMap = new Map<DashboardModuleId, ModuleConfig>();
  currentModules.forEach((m) => moduleMap.set(m.id, m));

  const reordered: ModuleConfig[] = [];
  order.forEach((id) => {
    const mod = moduleMap.get(id);
    if (mod) {
      reordered.push({ ...mod, enabled: true });
      moduleMap.delete(id);
    }
  });

  // 잔여 모듈 추가
  moduleMap.forEach((mod) => reordered.push(mod));
  return reordered;
}
