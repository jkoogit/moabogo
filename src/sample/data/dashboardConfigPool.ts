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
  | 'day_widget'
  | 'routine_widget'
  | 'money_balance_widget'
  | 'mypage_widget'
  | 'quick_game'
  | 'activity_feed';

export type DashboardPreset = 'DEFAULT' | 'FINANCE_FIRST' | 'LIFE_FIRST' | 'QUICK_GAME';

export interface ModuleConfig {
  id: DashboardModuleId;
  enabled: boolean;
  title: string;
  category: '가계부' | '요청머니' | '일상' | '라이프' | '프로필' | '게임' | '활동이력';
  description: string;
  previewThumbnail?: string;
  detailFeatures?: string[];
}

export const STORAGE_KEY = 'moabogo_dashboard_config_v3';
export const PRESET_STORAGE_KEY = 'moabogo_dashboard_preset_v1';

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
    id: 'day_widget',
    enabled: true,
    title: '모아데이 전역 일정 & 다이어리',
    category: '라이프',
    description: '4대 서비스 통합 일정 미리보기 및 N년 전 오늘 회고 요약',
    detailFeatures: ['가계부·당번·목표·루틴 통합 일정', 'D-Day 임박 일정 강조', 'SCR-DAY-01 원클릭 이동'],
  },
  {
    id: 'routine_widget',
    enabled: true,
    title: '모아루틴 타임라인 & 스트릭',
    category: '라이프',
    description: '사용자설정 플러그인 연동 오늘의 루틴 체크인 & 연속 스트릭',
    detailFeatures: ['설정 ON/OFF 동적 필터링', '12일 미니 스트릭 트래커', '원클릭 오늘 루틴 완료'],
  },
  {
    id: 'money_balance_widget',
    enabled: true,
    title: '모아머니 가족 대차대조표',
    category: '요청머니',
    description: '지급대기·총대여·기상환·순채권 4대 KPI 및 지급시점 주머니 연동',
    detailFeatures: ['가족 간 순 채권 잔액 요약', '지급 시 출금 가계부 결정', 'TRANSFER 이중계상 차단'],
  },
  {
    id: 'mypage_widget',
    enabled: true,
    title: '마이페이지 프로필 & 대표계좌',
    category: '프로필',
    description: '내 대표 송금계좌 원클릭 복사 및 참여 가계부·4대 라이프 요약',
    detailFeatures: ['대표 수신계좌 원터치 복사', '계좌번호 PII 마스킹 보호', 'SCR-MYP-01 프로필 허브 이동'],
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
    'day_widget',
    'routine_widget',
    'money_balance_widget',
    'mypage_widget',
    'quick_game',
    'activity_feed',
  ],
  FINANCE_FIRST: [
    'bookshelf',
    'financial_brief',
    'money_balance_widget',
    'mypage_widget',
    'inbound_radar',
    'routine_widget',
    'day_widget',
    'duty_widget',
    'goal_widget',
    'quick_game',
    'activity_feed',
  ],
  LIFE_FIRST: [
    'day_widget',
    'routine_widget',
    'duty_widget',
    'goal_widget',
    'mypage_widget',
    'money_balance_widget',
    'financial_brief',
    'inbound_radar',
    'bookshelf',
    'quick_game',
    'activity_feed',
  ],
  QUICK_GAME: [
    'quick_game',
    'day_widget',
    'routine_widget',
    'inbound_radar',
    'money_balance_widget',
    'mypage_widget',
    'bookshelf',
    'financial_brief',
    'duty_widget',
    'goal_widget',
    'activity_feed',
  ],
};

export const PRESET_LABELS: Record<DashboardPreset, { title: string; desc: string }> = {
  DEFAULT: {
    title: '기본 균형형',
    desc: '가계부와 모아데이·루틴·머니·마이페이지를 균형 있게 배치합니다.',
  },
  FINANCE_FIRST: {
    title: '금융 자산 집중형',
    desc: '장부와 생활비 브리핑, 모아머니 대차대조표·계좌를 전진 배치합니다.',
  },
  LIFE_FIRST: {
    title: '일상 협업 중심형',
    desc: '모아데이 일정과 모아루틴·당번·목표 위젯을 최상단에 배치합니다.',
  },
  QUICK_GAME: {
    title: '게임·모임 빠른실행형',
    desc: '모임 정산 퀵런처와 일정·요청머니를 빠르게 실행할 수 있도록 배치합니다.',
  },
};

/**
 * 로컬스토리지에서 대시보드 위젯 설정 로드 (구버전 { preset, modules } 호환 마이그레이션 포함)
 */
export function loadDashboardModules(): ModuleConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MODULES;
    const parsed = JSON.parse(raw);
    const rawList = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.modules)
      ? parsed.modules
      : null;

    if (!rawList || rawList.length === 0) return DEFAULT_MODULES;

    const loadedIds = new Set(rawList.map((m: { id?: string }) => m.id));
    const merged: ModuleConfig[] = rawList
      .filter((item: { id?: string }) =>
        DEFAULT_MODULES.some((def) => def.id === item.id)
      )
      .map((item: { id: DashboardModuleId; enabled?: boolean; title?: string }) => {
        const def = DEFAULT_MODULES.find((m) => m.id === item.id)!;
        return {
          id: item.id,
          enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
          title: item.title || def.title,
          category: def.category,
          description: def.description,
          detailFeatures: def.detailFeatures || [],
        };
      });

    DEFAULT_MODULES.forEach((def) => {
      if (!loadedIds.has(def.id)) {
        merged.push(def);
      }
    });

    return merged;
  } catch {
    return DEFAULT_MODULES;
  }
}

export function loadDashboardPreset(): DashboardPreset {
  try {
    const savedPreset = localStorage.getItem(PRESET_STORAGE_KEY) as DashboardPreset | null;
    if (savedPreset && savedPreset in PRESET_ORDER_MAP) {
      return savedPreset;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.preset && parsed.preset in PRESET_ORDER_MAP) {
        return parsed.preset as DashboardPreset;
      }
    }
  } catch {
    // ignore
  }
  return 'DEFAULT';
}

export function saveDashboardPreset(preset: DashboardPreset): void {
  try {
    localStorage.setItem(PRESET_STORAGE_KEY, preset);
  } catch {
    // ignore
  }
}

/**
 * 로컬스토리지에 대시보드 위젯 설정 저장 및 전역 브로드캐스트
 */
export function saveDashboardModules(modules: ModuleConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(modules));
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

  moduleMap.forEach((mod) => reordered.push(mod));
  return reordered;
}
