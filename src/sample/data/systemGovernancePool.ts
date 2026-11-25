// 모아보고 시스템 전역 거버넌스 및 마스터 코드/게임/알림 관리 풀 (SSOT)
// 경로: src/sample/data/systemGovernancePool.ts
// 관련 화면: SCR-SYS-01 (/system) & SCR-SET-01 & 플랫폼 전역 서비스

import {
  SYSTEM_STORE_POOL,
  ROULETTE_PRESETS,
  LADDER_ROLE_PRESETS,
  StorePreset,
  StoreMenuItem,
  RoulettePreset,
  LadderGoalPreset,
} from './systemStorePool';

/* =========================================================================
   1. 로그인 인증 및 보안 설정 (Auth & Security Governance)
   ========================================================================= */
export interface SystemAuthSecurityConfig {
  enableSocialLogin: boolean; // 간편로그인 사용여부 전역 토글
  providers: {
    kakao: boolean;
    naver: boolean;
    google: boolean;
  };
  enable2FA: boolean; // 로그인 2단계 인증 적용 정책
  requireEmailVerification: boolean; // 이메일 인증 필수 여부 설정
  passwordPolicy: {
    minLength: number;
    requireSpecialChar: boolean;
    expireDays: number;
  };
}

export const DEFAULT_AUTH_SECURITY_CONFIG: SystemAuthSecurityConfig = {
  enableSocialLogin: true,
  providers: {
    kakao: true,
    naver: true,
    google: true,
  },
  enable2FA: false,
  requireEmailVerification: true,
  passwordPolicy: {
    minLength: 8,
    requireSpecialChar: true,
    expireDays: 90,
  },
};

/* =========================================================================
   2. 서비스 전역 알림 발송 매트릭스 설정 (Notification Matrix Governance)
   ========================================================================= */
export interface SystemNotificationMatrix {
  requireVerifiedEmailOnly: boolean; // 인증된 이메일에만 알림 발송 제한 옵션
  // 전 서비스 22종 전역 알림 토글
  ledgerMemberRegistered: boolean; // 1. 가계부 구성원 등록 알림
  ledgerRecurringExpense: boolean; // 2. 정기지출 도래 알림
  dutyWatchEvent: boolean; // 3. 모아당번 관람당번 이벤트 알림
  dutyScheduleReminder: boolean; // 4. 모아당번 담당일정 알림
  dutyActionRequest: boolean; // 5. 모아당번 수행요청 알림
  dutyInviteAccepted: boolean; // 6. 모아당번 초대요청/수용 알림
  goalWatchEvent: boolean; // 7. 모아목표 관람목표 이벤트 알림
  goalScheduleReminder: boolean; // 8. 모아목표 수행일정 알림
  goalCheerMessage: boolean; // 9. 모아목표 수행응원 알림
  goalInviteAccepted: boolean; // 10. 모아목표 초대요청/수용 알림
  moneySettleProcessed: boolean; // 11. 모아머니 정산요청/승인 알림
  moneySupportProcessed: boolean; // 12. 모아머니 지원요청/승인 알림
  moneyRewardProcessed: boolean; // 13. 모아머니 보상요청/승인 알림
  // 모아부릉 (3종)
  carInsuranceExpiry: boolean; // 14. 자동차보험 만기 갱신 D-Day
  carLegalInspection: boolean; // 15. 정기종합검사 도래 알림
  carConsumableDue: boolean; // 16. 소모품 교체 임박 알림
  // 모아데이 (2종)
  dayScheduleReminder: boolean; // 17. 모아데이 일정 리마인더
  dayPastYearBriefing: boolean; // 18. 과거의 오늘 회고 브리핑
  // 모아루틴 (4종)
  routineMedicineReminder: boolean; // 19. 약복용 시점·소진 임박 알림
  routineMvnoDue: boolean; // 20. 알뜰폰 프로모션·약정 D-Day
  routineTaxDeadline: boolean; // 21. 세금계산서 매월 10일 마감 알림
  routineCardSettlement: boolean; // 22. 급여·카드 일괄 정산 실행 알림
}

export const DEFAULT_NOTIFICATION_MATRIX: SystemNotificationMatrix = {
  requireVerifiedEmailOnly: true,
  ledgerMemberRegistered: true,
  ledgerRecurringExpense: true,
  dutyWatchEvent: true,
  dutyScheduleReminder: true,
  dutyActionRequest: true,
  dutyInviteAccepted: true,
  goalWatchEvent: true,
  goalScheduleReminder: true,
  goalCheerMessage: true,
  goalInviteAccepted: true,
  moneySettleProcessed: true,
  moneySupportProcessed: true,
  moneyRewardProcessed: true,
  carInsuranceExpiry: true,
  carLegalInspection: true,
  carConsumableDue: true,
  dayScheduleReminder: true,
  dayPastYearBriefing: true,
  routineMedicineReminder: true,
  routineMvnoDue: true,
  routineTaxDeadline: true,
  routineCardSettlement: true,
};

/* =========================================================================
   2-1. 스토리지 및 미아데이터 수명주기 정책 (Retention Policies Governance)
   ========================================================================= */
export interface SystemRetentionPolicy {
  orphanTtlDays: number; // UNALLOCATED 미아 데이터 보존 TTL (기본 90일)
  archiveTierDays: number; // ACTIVE -> ARCHIVED tarball 전환 일수 (기본 30일)
  autoPurgeOrphan: boolean; // 만료 미아 데이터 야간 배치 자동 GC 여부
  streamCachePolicy: 'INSTANT' | '1_DAY' | '30_DAYS'; // 온디맨드 스트리밍 캐시 파기 정책
}

export const DEFAULT_RETENTION_POLICY: SystemRetentionPolicy = {
  orphanTtlDays: 90,
  archiveTierDays: 30,
  autoPurgeOrphan: true,
  streamCachePolicy: 'INSTANT',
};

/* =========================================================================
   3. RBAC 시스템 관리 및 Markdown 약관 거버넌스 (RBAC & Legal Governance)
   ========================================================================= */

// 1. 메뉴 관리: 메뉴명, 메뉴ID, 메뉴구분, 사용여부 (등록,수정,삭제)
export interface MenuItem {
  id: string; // 메뉴ID
  name: string; // 메뉴명
  category: '금융서비스' | '라이프협업' | '빠른입력' | '시스템운영' | string; // 메뉴구분
  isEnabled: boolean; // 사용여부
  path: string; // 연결 화면 라우트/경로
  order: number; // 순서
  icon?: string;
  requiredRole?: string;
}

// 2. 화면 관리: 화면명, 화면ID, 라우트, 접근권한, 설명(md포맷), 사용여부, 매핑된 권한관리 (등록,수정,삭제)
export interface ScreenItem {
  id: string; // 화면ID (예: SCR-DSH-01)
  name: string; // 화면명
  route: string; // 라우트 (예: /dashboard)
  requiredRole: string; // 기본 접근권한
  descriptionMd: string; // 설명 (md포맷)
  isEnabled: boolean; // 사용여부
  mappedRoleIds: string[]; // 매핑된 권한그룹 ID 목록 (권한관리와 실시간 연동)
  category: string;
}

// 3. 권한그룹: 권한그룹명, 권한그룹ID, 사용여부 (등록,수정,삭제)
export interface RoleGroupItem {
  id: string; // 권한그룹ID (예: ROLE_SYSTEM_ADMIN)
  name: string; // 권한그룹명 (예: 최고 시스템 관리자)
  isEnabled: boolean; // 사용여부
  description?: string;
  userCount?: number;
  mappedScreenIds: string[]; // 매핑된 화면 ID 목록 (화면관리 권한 매핑 연동)
}

// 4. 사용자 관리: 가입한 회원정보 조회, 사용여부관리 및 개인설정 상세정보 (계좌 마스킹)
export interface UserBankAccountMasked {
  bankName: string;
  maskedAccountNo: string; // 마스킹 계좌번호: 3333-**-****881
  accountHolder: string;
  alias?: string;
  isDefault: boolean;
}

export interface UserPersonalSettings {
  theme: 'light' | 'dark' | 'dawn' | 'system';
  favoriteStoreName: string;
  ocrEngineName: string;
  maskedBankAccounts: UserBankAccountMasked[];
  notificationChannels: {
    emailVerified: boolean;
    pushAllowed: boolean;
    marketingAgreed: boolean;
  };
}

export interface ManagedUser {
  id: string; // 사용자 ID
  name: string; // 회원명
  email: string; // 이메일
  roleCode: string; // 권한그룹 ID
  status: 'ACTIVE' | 'SUSPENDED'; // 사용여부 (활성 / 이용정지)
  isEmailVerified: boolean;
  joinedAt: string;
  lastLoginAt: string;
  personalSettings: UserPersonalSettings; // 개인설정 상세정보 (마스킹)
}

// 5. 약관 관리: 3대 구분 (서비스이용약관, 개인정보수집및이용동의, 이벤트알림및정보수신동의) - 등록,수정,삭제
export type TermsCategoryType = 'SERVICE' | 'PRIVACY' | 'MARKETING';

export interface TermsHistoryItem {
  id: string;
  version: string;
  effectiveDate: string;
  summary: string;
  isCurrent?: boolean;
  contentMarkdown?: string;
}

export interface TermsDocument {
  id: string;
  type: TermsCategoryType; // 약관 구분
  typeLabel: string; // 구분 표시명
  title: string;
  version: string;
  effectiveDate: string;
  isCurrent: boolean;
  contentMarkdown: string;
  history: TermsHistoryItem[];
}

export const DEFAULT_MENUS: MenuItem[] = [
  { id: 'MENU_DSH_01', name: '로그인 메인 대시보드', path: 'SCR-DSH-01', category: '금융서비스', order: 1, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_LED_01', name: '가계부 관리 상세', path: 'SCR-LED-01', category: '금융서비스', order: 2, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_MON_01', name: '모아머니 이동관리', path: 'SCR-MON-01', category: '금융서비스', order: 3, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_DAY_01', name: '모아데이 (전역 일정·일기)', path: 'SCR-DAY-01', category: '라이프협업', order: 4, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_ROU_01', name: '모아루틴 (4대 루틴 허브)', path: 'SCR-ROU-01', category: '라이프협업', order: 5, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_CAR_01', name: '모아부릉 (자동차 6대 관리)', path: 'SCR-CAR-01', category: '라이프협업', order: 6, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_DUT_01', name: '모아당번 관리', path: 'SCR-DUT-01', category: '라이프협업', order: 7, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_GOL_01', name: '모아목표 관리', path: 'SCR-GOL-01', category: '라이프협업', order: 8, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_GAM_01', name: '모아게임 허브 (정산/사다리/룰렛)', path: 'SCR-GAM-01', category: '라이프협업', order: 9, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_QCK_01', name: '빠른 머니등록 (영수증 OCR)', path: 'SCR-QCK-01', category: '빠른입력', order: 10, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_QCK_02', name: '빠른 수행등록 (사진인증)', path: 'SCR-QCK-02', category: '빠른입력', order: 11, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_MYP_01', name: '마이페이지 & 프로필 허브', path: 'SCR-MYP-01', category: '시스템운영', order: 12, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_SET_01', name: '사용자 맞춤 환경설정', path: 'SCR-SET-01', category: '시스템운영', order: 13, isEnabled: true, requiredRole: 'ROLE_MEMBER' },
  { id: 'MENU_OFF_01', name: '오프라인 동기화 & Stale 관리', path: 'SCR-OFF-01', category: '시스템운영', order: 14, isEnabled: true, requiredRole: 'ROLE_GUEST' },
  { id: 'MENU_SYS_01', name: '시스템 운영관리 백오피스', path: 'SCR-SYS-01', category: '시스템운영', order: 15, isEnabled: true, requiredRole: 'ROLE_SYSTEM_ADMIN' },
  { id: 'MENU_SMP_01', name: '공통 UI 토큰 쇼케이스', path: 'SCR-SMP-01', category: '시스템운영', order: 16, isEnabled: true, requiredRole: 'ROLE_GUEST' },
];

const ALL_MEMBER_SCREEN_IDS = [
  'SCR-GNT-01',
  'SCR-AUT-01',
  'SCR-AUT-02',
  'SCR-DSH-01',
  'SCR-LED-01',
  'SCR-MON-01',
  'SCR-DAY-01',
  'SCR-ROU-01',
  'SCR-CAR-01',
  'SCR-DUT-01',
  'SCR-DUT-02',
  'SCR-GOL-01',
  'SCR-GOL-02',
  'SCR-GAM-01',
  'SCR-QCK-01',
  'SCR-QCK-02',
  'SCR-MYP-01',
  'SCR-SET-01',
  'SCR-OFF-01',
  'SCR-SMP-01',
];

export const DEFAULT_SCREENS: ScreenItem[] = [
  {
    id: 'SCR-GNT-01',
    name: '비로그인 게스트 홈',
    route: '/guest',
    category: '게스트',
    requiredRole: 'ROLE_GUEST',
    descriptionMd: `### 비회원 게스트 전용 메인 화면 (SCR-EVT-01 게스트 정산/게임 통합)\n- 소멸성 룰렛 및 사다리 타기 게임 진행\n- 임시 N빵 정산 및 가계부 체험 모드 제공`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_GUEST', 'ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-AUT-01',
    name: '회원가입 (3초 가입)',
    route: '/signup',
    category: '인증·세션',
    requiredRole: 'ROLE_GUEST',
    descriptionMd: `### 이메일·3대 소셜 회원가입 및 약관 동의\n- 카카오/네이버/구글 간편가입 및 개인 가계부 자동 개설`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_GUEST', 'ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-AUT-02',
    name: '로그인 & 오프라인 세션',
    route: '/login',
    category: '인증·세션',
    requiredRole: 'ROLE_GUEST',
    descriptionMd: `### 로그인 및 IndexedDB 오프라인 자동 로그인 세션\n- 2FA OTP 검증 및 오프라인 세션 토큰 유지`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_GUEST', 'ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-DSH-01',
    name: '로그인 메인 대시보드',
    route: '/dashboard',
    category: '금융서비스',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 회원 로그인 메인 대시보드 허브\n- 12종 Bento 위젯 커스텀 배치 (모아부릉 car_widget 포함)\n- 최근 지출 요약 및 금전관리 3대 원칙 상태 브리핑`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-LED-01',
    name: '그룹/개인 가계부 관리 상세',
    route: '/ledger',
    category: '금융서비스',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 가계부 및 지출원장 상세 관리\n- 개인/모임 장부 단일 귀속성 검증\n- TRANSFER 단일 연결 자금 이동 및 태깅 정산`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-MON-01',
    name: '모아머니 이동관리',
    route: '/money',
    category: '금융서비스',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 모아머니 정산, 지원, 보상 중앙 관리\n- N빵 정산 요청 및 상호 확인\n- 긴급 용돈 지원 및 가불 처리`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-DAY-01',
    name: '모아데이 전역 일정·다이어리',
    route: '/day',
    category: '라이프허브',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 전 서비스 통합 일정 및 스마트 다이어리\n- 가계부·당번·목표·루틴·모아부릉 투영 및 과거의 오늘 회고`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-ROU-01',
    name: '모아루틴 4대 루틴 허브',
    route: '/routine',
    category: '라이프허브',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 4대 핵심 루틴(약복용·알뜰폰·세금계산서·카드정산)\n- 멀티 첨부 OCR 및 가계부 TRANSFER 멱등 연동`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-CAR-01',
    name: '모아부릉 자동차 6대 관리',
    route: '/car',
    category: '라이프허브',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 다중 차량 Odometer & 6대 관리포인트 허브\n- 주유·점검·수리·세차·보험·주차 이력 및 중복지출 정리센터`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-DUT-01',
    name: '모아당번 관리',
    route: '/duty',
    category: '라이프협업',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 모임 생활 당번 자동 순환 및 목록 관리\n- 카테고리 트리 선택 및 모임 구성원 초대`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-DUT-02',
    name: '모아당번 상세',
    route: '/duty/:id',
    category: '라이프협업',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 단건 당번 직교 3상태머신 실행·정산·평가\n- 사진 인증, 대신수행 상계정산(Netting) 보고서`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-GOL-01',
    name: '모아목표 관리',
    route: '/goal',
    category: '라이프협업',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 협업 실천 목표 목록 및 등록 관리\n- 목표 유형·실천 기간·목표량 설정`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-GOL-02',
    name: '모아목표 상세',
    route: '/goal/:id',
    category: '라이프협업',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 목표 실천 기록, 동행원·관람원 및 응원 송금\n- 3대 탭 진행률, 댓글·사진 인증 및 용돈 이체`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-GAM-01',
    name: '모아게임 허브',
    route: '/game',
    category: '라이프협업',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 로그인 회원 전용 정산·사다리·룰렛 허브 (SCR-EVT-01 회원 통합)\n- 모임 멤버·개인 프리셋 연동 및 가계부 결과 직행`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-QCK-01',
    name: '빠른 머니등록',
    route: '/quick/money',
    category: '빠른입력',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 영수증 2단계 OCR 기반 빠른 지출/지급 등록\n- 오프라인 큐 캐싱 및 가계부 즉시 기장`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-QCK-02',
    name: '빠른 수행등록',
    route: '/quick/task',
    category: '빠른입력',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 당번·목표 원클릭 빠른 수행 및 사진 인증\n- 증감 휠 및 직교 3상태 전이`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-MYP-01',
    name: '마이페이지 & 개인 프로필 허브',
    route: '/mypage',
    category: '개인화',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 프로필, 대표 수신계좌 퀵복사 및 4대 라이프 요약\n- 참여 가계부 책꽂이 및 활동 KPI`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-SET-01',
    name: '사용자 맞춤 환경설정',
    route: '/settings',
    category: '시스템운영',
    requiredRole: 'ROLE_MEMBER',
    descriptionMd: `### 12탭 전 서비스 개인화 환경설정 허브\n- 테마, 모아부릉, 모아데이, 모아루틴, 오프라인, 대시보드 12종 배치, 알림, 계좌, OCR 키`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-OFF-01',
    name: '오프라인 PWA 동기화 & Stale',
    route: '/offline',
    category: '시스템운영',
    requiredRole: 'ROLE_GUEST',
    descriptionMd: `### 오프라인 동기화 대기열 및 LWW 충돌 해결\n- 멱등키 기반 재전송 및 IndexedDB 세션 상태 점검`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_GUEST', 'ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-SYS-01',
    name: '시스템 운영관리 백오피스',
    route: '/system',
    category: '시스템운영',
    requiredRole: 'ROLE_SYSTEM_ADMIN',
    descriptionMd: `### 플랫폼 전역 거버넌스 백오피스\n- 인프라·수명주기(Retention), 보안, 22종 알림 매트릭스, 21개 화면 RBAC, 금융통제, 28대 마스터코드, 게임풀, 공지`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_SYSTEM_ADMIN'],
  },
  {
    id: 'SCR-SMP-01',
    name: '공통 컴포넌트 쇼케이스',
    route: '/showcase',
    category: '디자인표준',
    requiredRole: 'ROLE_GUEST',
    descriptionMd: `### 14종 원자적 UI 디자인 토큰 검증 쇼케이스\n- 다크/여명/주간 테마 및 44px 터치타겟 검증`,
    isEnabled: true,
    mappedRoleIds: ['ROLE_GUEST', 'ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'],
  },
];

export const DEFAULT_ROLE_GROUPS: RoleGroupItem[] = [
  {
    id: 'ROLE_SYSTEM_ADMIN',
    name: '최고 시스템 관리자',
    isEnabled: true,
    description: '백오피스(/system) 접근, 8대 거버넌스 및 플랫폼 전역 설정 통제 (21개 전 화면)',
    userCount: 2,
    mappedScreenIds: [...ALL_MEMBER_SCREEN_IDS, 'SCR-SYS-01'],
  },
  {
    id: 'ROLE_OWNER',
    name: '가계부/모임 소유자',
    isEnabled: true,
    description: '모임 생성 및 멤버 초대, 예산 책정 및 정산 최종 승인 권한 (20개 회원 화면)',
    userCount: 18,
    mappedScreenIds: [...ALL_MEMBER_SCREEN_IDS],
  },
  {
    id: 'ROLE_MEMBER',
    name: '일반 정회원',
    isEnabled: true,
    description: 'OAuth 간편로그인 완료 사용자, 전 라이프·금융 서비스 참여 (20개 회원 화면)',
    userCount: 142,
    mappedScreenIds: [...ALL_MEMBER_SCREEN_IDS],
  },
  {
    id: 'ROLE_GUEST',
    name: '임시 게스트',
    isEnabled: true,
    description: '비로그인 사용자, 소멸성 게임·인증·오프라인·쇼케이스 열람 한정',
    userCount: 38,
    mappedScreenIds: ['SCR-GNT-01', 'SCR-AUT-01', 'SCR-AUT-02', 'SCR-OFF-01', 'SCR-SMP-01'],
  },
];

export const DEFAULT_MANAGED_USERS: ManagedUser[] = [
  {
    id: 'usr-admin-01',
    name: '최고관리자 (구본영)',
    email: 'admin@moabogo.app',
    roleCode: 'ROLE_SYSTEM_ADMIN',
    status: 'ACTIVE',
    isEmailVerified: true,
    joinedAt: '2026-01-01',
    lastLoginAt: '2026-11-17 01:45',
    personalSettings: {
      theme: 'dawn',
      favoriteStoreName: 'PLUS CAFE 45층 (WPS 스타벅스)',
      ocrEngineName: 'Google Gemini 2.0 Flash (추천)',
      maskedBankAccounts: [
        { bankName: '카카오뱅크', maskedAccountNo: '3333-**-****882', accountHolder: '구본영', alias: '급여/생활비', isDefault: true },
        { bankName: '토스뱅크', maskedAccountNo: '1000-**-****914', accountHolder: '구본영', alias: '모임 정산용', isDefault: false },
      ],
      notificationChannels: { emailVerified: true, pushAllowed: true, marketingAgreed: true },
    },
  },
  {
    id: 'usr-admin-02',
    name: '시스템부관 (모아봇)',
    email: 'security@moabogo.app',
    roleCode: 'ROLE_SYSTEM_ADMIN',
    status: 'ACTIVE',
    isEmailVerified: true,
    joinedAt: '2026-01-05',
    lastLoginAt: '2026-11-16 23:10',
    personalSettings: {
      theme: 'dark',
      favoriteStoreName: '여의도 진진만두국 본점',
      ocrEngineName: 'EasyOCR (로컬 격리 엔진)',
      maskedBankAccounts: [
        { bankName: 'KB국민은행', maskedAccountNo: '9416-**-****320', accountHolder: '주식회사 굿플레이스', alias: '서버운영비', isDefault: true },
      ],
      notificationChannels: { emailVerified: true, pushAllowed: true, marketingAgreed: false },
    },
  },
  {
    id: 'usr-mem-01',
    name: '김민수 (가족모임장)',
    email: 'ms.kim@kakao.com',
    roleCode: 'ROLE_OWNER',
    status: 'ACTIVE',
    isEmailVerified: true,
    joinedAt: '2026-02-14',
    lastLoginAt: '2026-11-16 19:30',
    personalSettings: {
      theme: 'light',
      favoriteStoreName: '싸다김밥 여의도점',
      ocrEngineName: 'OpenAI GPT-4o',
      maskedBankAccounts: [
        { bankName: '신한은행', maskedAccountNo: '110-***-***992', accountHolder: '김민수', alias: '가족 생활비 통장', isDefault: true },
      ],
      notificationChannels: { emailVerified: true, pushAllowed: true, marketingAgreed: true },
    },
  },
  {
    id: 'usr-mem-02',
    name: '이지은 (스터디당번)',
    email: 'jieun.lee@naver.com',
    roleCode: 'ROLE_MEMBER',
    status: 'ACTIVE',
    isEmailVerified: true,
    joinedAt: '2026-03-02',
    lastLoginAt: '2026-11-15 08:20',
    personalSettings: {
      theme: 'system',
      favoriteStoreName: 'PLUS CAFE 45층',
      ocrEngineName: 'Naver CLOVA OCR',
      maskedBankAccounts: [
        { bankName: '우리은행', maskedAccountNo: '1002-***-***741', accountHolder: '이지은', alias: '용돈 계좌', isDefault: true },
      ],
      notificationChannels: { emailVerified: true, pushAllowed: true, marketingAgreed: false },
    },
  },
  {
    id: 'usr-mem-03',
    name: '박준호 (동호회총무)',
    email: 'jh.park@gmail.com',
    roleCode: 'ROLE_MEMBER',
    status: 'SUSPENDED',
    isEmailVerified: false,
    joinedAt: '2026-04-11',
    lastLoginAt: '2026-10-30 11:15',
    personalSettings: {
      theme: 'dark',
      favoriteStoreName: '싸다김밥 여의도점',
      ocrEngineName: 'Claude 3.5 Sonnet',
      maskedBankAccounts: [
        { bankName: '하나은행', maskedAccountNo: '620-***-***513', accountHolder: '박준호', alias: '모임 회비 통장', isDefault: true },
      ],
      notificationChannels: { emailVerified: false, pushAllowed: false, marketingAgreed: false },
    },
  },
];

// 약관 3대 구분 기본 데이터:
// 1) 서비스이용약관 (SERVICE)
// 2) 개인정보수집및 이용동의 (PRIVACY)
// 3) 이벤트알림 및 라이프 혜택 정보수신동의 (MARKETING)
export const DEFAULT_TERMS: TermsDocument[] = [
  {
    id: 'term-svc-01',
    type: 'SERVICE',
    typeLabel: '서비스이용약관',
    title: '모아보고 서비스 이용약관',
    version: 'v2.1',
    effectiveDate: '2026-11-01',
    isCurrent: true,
    contentMarkdown: `# 모아보고 서비스 이용약관 (v2.1)

### 제1조 (목적)
본 약관은 주식회사 모아보고(이하 "회사")가 제공하는 금융 협업 및 라이프 당번 플랫폼 "모아보고(MoaBogo)"의 이용 조건 및 절차를 규정함을 목적으로 합니다.

### 제2조 (금전관리 3대 원칙 준수의무)
1. 이용자는 개인 가계부와 모임 가계부의 단일 귀속성 원칙을 준수하여야 합니다.
2. 장부 간 이동은 TRANSFER 단일 연결로 처리되며 생활비 지출과 이중계상되지 않습니다.
3. 모임 대납 및 정산은 메타데이터 태깅으로 분리 보관됩니다.

### 제3조 (오프라인 우선 및 동기화)
네트워크 장애 시에도 이용자의 로컬 기기에 임시 안전 저장되며, 서버 연결 복구 시 멱등키를 기준으로 무결성 보정됩니다.`,
    history: [
      { id: 'hist-svc-21', version: 'v2.1', effectiveDate: '2026-11-01', summary: '금전관리 3대 원칙 및 오프라인 우선 조항 신설', isCurrent: true, contentMarkdown: `# 모아보고 서비스 이용약관 (v2.1)\n\n### 제1조 (목적)\n본 약관은 주식회사 모아보고(이하 "회사")가 제공하는 금융 협업 및 라이프 당번 플랫폼 "모아보고(MoaBogo)"의 이용 조건 및 절차를 규정함을 목적으로 합니다.\n\n### 제2조 (금전관리 3대 원칙 준수의무)\n1. 이용자는 개인 가계부와 모임 가계부의 단일 귀속성 원칙을 준수하여야 합니다.\n2. 장부 간 이동은 TRANSFER 단일 연결로 처리되며 생활비 지출과 이중계상되지 않습니다.\n3. 모임 대납 및 정산은 메타데이터 태깅으로 분리 보관됩니다.\n\n### 제3조 (오프라인 우선 및 동기화)\n네트워크 장애 시에도 이용자의 로컬 기기에 임시 안전 저장되며, 서버 연결 복구 시 멱등키를 기준으로 무결성 보정됩니다.` },
      { id: 'hist-svc-20', version: 'v2.0', effectiveDate: '2026-06-01', summary: '모아당번 및 모아목표 라이프 협업 약관 개정', isCurrent: false, contentMarkdown: `# 모아보고 서비스 이용약관 (v2.0)\n\n### 제1조 (목적)\n본 약관은 모아당번 및 모아목표 협업 기능을 포함한 서비스 이용조건을 규정합니다.` },
      { id: 'hist-svc-10', version: 'v1.0', effectiveDate: '2026-01-01', summary: '최초 서비스 런칭 기본 약관', isCurrent: false, contentMarkdown: `# 모아보고 서비스 이용약관 (v1.0)\n\n최초 서비스 런칭 기본 약관 본문입니다.` },
    ],
  },
  {
    id: 'term-priv-01',
    type: 'PRIVACY',
    typeLabel: '개인정보수집및 이용동의',
    title: '개인정보 수집 및 이용 동의서',
    version: 'v1.8',
    effectiveDate: '2026-11-01',
    isCurrent: true,
    contentMarkdown: `# 개인정보 수집 및 이용 동의 (v1.8)

### 제1조 (수집하는 개인정보 항목)
1. **간편로그인 시**: 이메일 주소, 닉네임, 프로필 이미지 (소셜 식별자)
2. **영수증 OCR 인식 시**: 이미지 파일은 로컬 및 격리된 비동기 프로세스에서 텍스트 추출 후 즉시 메모리 파기
3. **계좌번호 등록 시**: 은행명, 계좌번호(마스킹 보관), 예금주명

### 제2조 (개인정보의 파기 절차)
회원 탈퇴 요청 시 즉시 복구 불가능한 방법으로 영구 파기하며, 게스트 임시 식별자는 세션 만료 24시간 후 자동 파기됩니다.`,
    history: [
      { id: 'hist-priv-18', version: 'v1.8', effectiveDate: '2026-11-01', summary: 'EasyOCR 2GB RAM 격리 파기 원칙 명시', isCurrent: true, contentMarkdown: `# 개인정보 수집 및 이용 동의 (v1.8)\n\nEasyOCR 2GB RAM 격리 파기 원칙이 명시된 개인정보 동의서입니다.` },
      { id: 'hist-priv-10', version: 'v1.0', effectiveDate: '2026-01-01', summary: '개인정보 처리방침 제정', isCurrent: false, contentMarkdown: `# 개인정보 수집 및 이용 동의 (v1.0)\n\n최초 제정 개인정보 처리방침입니다.` },
    ],
  },
  {
    id: 'term-mkt-01',
    type: 'MARKETING',
    typeLabel: '이벤트알림 및 라이프 혜택 정보수신동의',
    title: '이벤트 알림 및 라이프 혜택 수신 동의서',
    version: 'v1.3',
    effectiveDate: '2026-11-01',
    isCurrent: true,
    contentMarkdown: `# 이벤트 알림 및 라이프 혜택 정보수신 동의 (v1.3)

### 제1조 (목적 및 수신 채널)
회사는 이용자에게 모아보고 서비스 내에서 제공되는 단골 매장 혜택, 제휴 할인, 사다리/룰렛 이벤트 쿠폰 및 맞춤형 금융 절약 팁을 이메일 및 앱 푸시 알림으로 안내합니다.

### 제2조 (수신 동의 철회)
이용자는 언제든지 [사용자 맞춤 설정 (SCR-SET-01) > 알림설정] 메뉴를 통하여 본 동의를 즉시 철회할 수 있습니다. 철회 시에도 기본 서비스 이용에는 일체의 제한이 없습니다.

### 제3조 (보유 및 이용 기간)
회원 탈퇴 시 또는 수신 동의 철회 시까지 보관 및 이용됩니다.`,
    history: [
      { id: 'hist-mkt-13', version: 'v1.3', effectiveDate: '2026-11-01', summary: '사내카페 단골매장 쿠폰 연계 조항 신설', isCurrent: true, contentMarkdown: `# 이벤트 알림 및 라이프 혜택 정보수신 동의 (v1.3)\n\n단골매장 쿠폰 연계 조항이 포함된 수신 동의서입니다.` },
      { id: 'hist-mkt-10', version: 'v1.0', effectiveDate: '2026-01-01', summary: '최초 혜택 정보수신 동의서 제정', isCurrent: false, contentMarkdown: `# 이벤트 알림 및 라이프 혜택 정보수신 동의 (v1.0)\n\n최초 혜택 정보수신 동의서입니다.` },
    ],
  },
];

/* =========================================================================
   4. 금융 기능 컴플라이언스 통제 (Financial Compliance Governance)
   ========================================================================= */
export interface SystemFinancialCompliance {
  enableRemitUrlGeneration: boolean; // 송금 URL 생성 전역 통제
  allowGoalCheerRemit: boolean; // 목표응원 송금 허용/차단
  allowMoaMoneyRemit: boolean; // 모아머니 송금 허용/차단
  maxDailyRemitLimit: number; // 일일 송금 추천 상한액 (원)
  blockForeignIpRemit: boolean; // 해외 IP 송금링크 생성 원천 차단
  complianceNotice: string; // 금융 통제 안내 문구
}

/* =========================================================================
   4-1. 긴급 공지 및 전역 안내 거버넌스 (System Notice Governance)
   ========================================================================= */
export type NoticeModeType = 'TEXT' | 'MD' | 'IMAGE';
export type NoticeTargetType = 'INTERNAL_SCREEN' | 'CONTENT_PATH' | 'EXTERNAL_URL';

export interface SystemNoticeItem {
  id: string;
  title: string;
  isEnabled: boolean; // 전역 송출 여부
  mode: NoticeModeType; // 텍스트, md, 이미지
  content: string; // 텍스트 내용 또는 마크다운 본문
  imageUrl?: string; // 이미지 URL
  hasButton: boolean;
  buttonText?: string;
  buttonTargetType?: NoticeTargetType;
  buttonUrl?: string;
  createdAt: string;
}

export const DEFAULT_NOTICES: SystemNoticeItem[] = [
  {
    id: 'notice-01',
    title: '홈서버 정기 점검 안내',
    isEnabled: true,
    mode: 'TEXT',
    content: '보다 안정적인 금융 가계부 서비스를 위해 홈서버 정기 점검이 진행 중입니다. (자정 02:00 ~ 02:30)',
    hasButton: true,
    buttonText: '오프라인 동기화 안내',
    buttonTargetType: 'INTERNAL_SCREEN',
    buttonUrl: 'SCR-OFF-01',
    createdAt: '2026-11-17',
  },
  {
    id: 'notice-02',
    title: '2026 겨울맞이 단골매장 혜택 안내',
    isEnabled: false,
    mode: 'MD',
    content: `### ☕ PLUS CAFE 45층 단골 매장 특별 프로모션\n- 사내 임직원 스타벅스 WPS 원두 전 메뉴 **10% 모아머니 환급**\n- 모아당번 수행 완료 시 아메리카노 교환권 지급`,
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop',
    hasButton: true,
    buttonText: '단골 매장 설정 바로가기',
    buttonTargetType: 'INTERNAL_SCREEN',
    buttonUrl: 'SCR-SET-01',
    createdAt: '2026-11-15',
  },
];

export const DEFAULT_FINANCIAL_COMPLIANCE: SystemFinancialCompliance = {
  enableRemitUrlGeneration: true,
  allowGoalCheerRemit: true,
  allowMoaMoneyRemit: true,
  maxDailyRemitLimit: 2000000,
  blockForeignIpRemit: true,
  complianceNotice: '전자금융거래법 가이드라인에 따라 인증된 본인 명의 계좌 간 송금 링크만 생성됩니다.',
};

/* =========================================================================
   5. 플랫폼 전역 20대 마스터 코드 체계 (Master Code System)
   ========================================================================= */
export interface MasterGroupCode {
  groupCode: string;
  groupName: string;
  category: '장부' | '금융' | '지출이동' | '모아당번' | '모아목표' | '정산' | '모아데이' | '모아루틴' | '모아부릉';
  description: string;
  isSystemReadOnly: boolean;
}

export interface MasterDetailCode {
  groupCode: string;
  code: string;
  codeName: string;
  enName?: string;
  sortOrder: number;
  isDefault: boolean;
  isEnabled: boolean;
  metaBadge?: string;
  metaColor?: string;
  priority?: number; // 우선순위 (1~99)
  userField1?: string; // 사용자항목 1
  userField2?: string; // 사용자항목 2
  userField3?: string; // 사용자항목 3
}

// 플랫폼 20대 핵심 그룹코드 정의서
export const MASTER_GROUP_CODES: MasterGroupCode[] = [
  // 1~6: 장부 도메인
  { groupCode: 'LEDGER_TYPE', groupName: '장부.장부유형', category: '장부', description: '개인형, 그룹공유형, 인스턴스 단기형 장부 구분', isSystemReadOnly: true },
  { groupCode: 'FISCAL_PERIOD', groupName: '장부.회계기간유형', category: '장부', description: '월간, 주간, 연간, 프로젝트 회계 주기', isSystemReadOnly: true },
  { groupCode: 'LEDGER_CHARACTER', groupName: '장부.세부성격', category: '장부', description: '가족생활비, 동아리회비, 데이트통장, 회사부서, 스터디', isSystemReadOnly: false },
  { groupCode: 'SPINE_DESIGN', groupName: '장부.책등디자인', category: '장부', description: '가계부 서재 책꽂이 책등 컬러 및 텍스처 스타일', isSystemReadOnly: false },
  { groupCode: 'LEDGER_STATUS', groupName: '장부.상태', category: '장부', description: '정상활성, 임시동결, 만기종료, 아카이브', isSystemReadOnly: true },
  { groupCode: 'LEDGER_ROLE', groupName: '장부.권한', category: '장부', description: '소유자(OWNER), 운영관리자(MANAGER), 일반멤버(MEMBER), 뷰어(VIEWER)', isSystemReadOnly: true },

  // 7~11: 금융 도메인
  { groupCode: 'BANK_CODE', groupName: '은행사', category: '금융', description: '국내 주요 시중/인터넷 은행 및 금융기관 코드', isSystemReadOnly: false },
  { groupCode: 'CARD_CODE', groupName: '카드사', category: '금융', description: '국내 주요 신용/체크카드 발급사 코드', isSystemReadOnly: false },
  { groupCode: 'INSTALLMENT_PERIOD', groupName: '할부기간', category: '금융', description: '일시불, 2개월~36개월 할부납부 기간 풀', isSystemReadOnly: true },
  { groupCode: 'PAY_METHOD', groupName: '결제수단', category: '금융', description: '현금, 체크카드, 신용카드, 계좌이체, 모바일페이, 지역화폐', isSystemReadOnly: false },
  { groupCode: 'INCOME_CHANNEL', groupName: '수입채널', category: '금융', description: '근로급여, 상여금, 금융수익, 당근마켓/부수입, 용돈/지원', isSystemReadOnly: false },

  // 12~13: 지출/이동 기초정보
  { groupCode: 'BASE_EXP_CATEGORY', groupName: '기초지출카테고리', category: '지출이동', description: '사용자별 카테고리 구성 기본 마스터 (식비, 카페, 교통, 주거 등)', isSystemReadOnly: false },
  { groupCode: 'BASE_TRANSFER_REASON', groupName: '기초이동사유', category: '지출이동', description: '가계부/자산 간 TRANSFER 이동 사유 마스터', isSystemReadOnly: false },

  // 14~17: 모아당번 도메인
  { groupCode: 'DUTY_BASE_CATEGORY', groupName: '모아당번.기초카테고리', category: '모아당번', description: '청소, 분리수거, 탕비실, 설거지, 회의준비 등 기초 당번 업무', isSystemReadOnly: false },
  { groupCode: 'DUTY_ROTATION_POLICY', groupName: '모아당번.순환정책', category: '모아당번', description: '순차순환(SEQUENTIAL), 무작위추첨(RANDOM), 자원선착순(VOLUNTEER)', isSystemReadOnly: true },
  { groupCode: 'DUTY_SETTLE_PERIOD', groupName: '모아당번.정산주기', category: '모아당번', description: '건별즉시, 주간합산, 월간정기, 분기정산', isSystemReadOnly: true },
  { groupCode: 'DUTY_COMPLETION_TYPE', groupName: '모아당번.완료방식', category: '모아당번', description: '사진인증, 체크확인, 상호상인, 자동승인', isSystemReadOnly: true },

  // 18~19: 모아목표 도메인
  { groupCode: 'GOAL_INITIAL_TYPE', groupName: '모아목표.초기목표유형', category: '모아목표', description: '저축모으기, 소비줄이기, 운동습관, 독서스터디, 자격증도전', isSystemReadOnly: false },
  { groupCode: 'GOAL_DURATION', groupName: '모아목표.목표실천기간', category: '모아목표', description: '7일 단기, 14일 챌린지, 30일 습관, 66일 체질화, 100일 완주, 1년 장기', isSystemReadOnly: false },

  // 20: 정산 도메인
  { groupCode: 'SETTLE_INITIAL_CATEGORY', groupName: '정산.초기카테고리', category: '정산', description: '식사/모임N빵, 펜션여행, 경조사비, 장보기, 공동구매정산', isSystemReadOnly: false },

  // 21: 모아데이 도메인
  { groupCode: 'DAY_SOURCE_TYPE', groupName: '모아데이.출처서비스', category: '모아데이', description: '가계부, 당번, 목표, 루틴, 모아부릉, 개인일정, 스마트일기', isSystemReadOnly: true },

  // 22~23: 모아루틴 도메인
  { groupCode: 'ROUTINE_CATEGORY', groupName: '모아루틴.4대카테고리', category: '모아루틴', description: '약복용, 알뜰폰환승, 세금계산서, 급여·카드정산', isSystemReadOnly: true },
  { groupCode: 'MVNO_NETWORK', groupName: '모아루틴.알뜰폰통신망', category: '모아루틴', description: 'SKT망, KT망, LGU+망 통신망 구분', isSystemReadOnly: true },

  // 24~28: 모아부릉 도메인
  { groupCode: 'CAR_FUEL_TYPE', groupName: '모아부릉.유종구분', category: '모아부릉', description: '휘발유, 경유, 하이브리드, 전기, LPG', isSystemReadOnly: true },
  { groupCode: 'CAR_LOG_TYPE', groupName: '모아부릉.6대관리포인트', category: '모아부릉', description: '주유·충전, 점검, 수리, 세차, 보험, 주차', isSystemReadOnly: true },
  { groupCode: 'CAR_MAINTENANCE_TYPE', groupName: '모아부릉.소모품규칙', category: '모아부릉', description: '엔진오일, 에어컨필터, 타이어위치교환, 종합검사, 보험갱신, 정기주차권', isSystemReadOnly: false },
  { groupCode: 'CAR_INSURANCE_CO', groupName: '모아부릉.자동차보험사', category: '모아부릉', description: '삼성화재, DB손해보험, 현대해상, KB손해보험 등 주요 보험사', isSystemReadOnly: false },
  { groupCode: 'CAR_INSPECT_CAT', groupName: '모아부릉.점검항목분류', category: '모아부릉', description: '동력·오일, 제동·타이어, 배터리·등화, 외관·와이퍼', isSystemReadOnly: false },
];

// 초기 상세코드 데이터 풀 (20대 그룹별 풍부한 사전 정의값)
export const DEFAULT_DETAIL_CODES: MasterDetailCode[] = [
  // 1. LEDGER_TYPE
  { groupCode: 'LEDGER_TYPE', code: 'PERSONAL', codeName: '개인 가계부', enName: 'Personal', sortOrder: 1, isDefault: true, isEnabled: true, metaBadge: '개인', metaColor: 'sky' },
  { groupCode: 'LEDGER_TYPE', code: 'GROUP', codeName: '모임 공유 가계부', enName: 'Group Shared', sortOrder: 2, isDefault: false, isEnabled: true, metaBadge: '그룹', metaColor: 'indigo' },
  { groupCode: 'LEDGER_TYPE', code: 'INSTANCE', codeName: '인스턴스 단기 장부', enName: 'Instance Temporary', sortOrder: 3, isDefault: false, isEnabled: true, metaBadge: '단기', metaColor: 'amber' },

  // 2. FISCAL_PERIOD
  { groupCode: 'FISCAL_PERIOD', code: 'MONTHLY', codeName: '매월 1일 ~ 말일', enName: 'Monthly 1st', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'FISCAL_PERIOD', code: 'SALARY_25', codeName: '급여일 기준 (매월 25일)', enName: 'Monthly 25th', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'FISCAL_PERIOD', code: 'WEEKLY', codeName: '주간 단위 (월~일)', enName: 'Weekly', sortOrder: 3, isDefault: false, isEnabled: true },

  // 3. LEDGER_CHARACTER
  { groupCode: 'LEDGER_CHARACTER', code: 'FAMILY', codeName: '가족 생활비', enName: 'Family Living', sortOrder: 1, isDefault: true, isEnabled: true, metaBadge: '가족', metaColor: 'rose' },
  { groupCode: 'LEDGER_CHARACTER', code: 'COUPLE', codeName: '데이트 / 부부', enName: 'Couple / Date', sortOrder: 2, isDefault: false, isEnabled: true, metaBadge: '데이트', metaColor: 'pink' },
  { groupCode: 'LEDGER_CHARACTER', code: 'CLUB', codeName: '동아리 / 동호회', enName: 'Club / Hobby', sortOrder: 3, isDefault: false, isEnabled: true, metaBadge: '모임', metaColor: 'emerald' },
  { groupCode: 'LEDGER_CHARACTER', code: 'STUDY', codeName: '스터디 / 스터디룸', enName: 'Study Group', sortOrder: 4, isDefault: false, isEnabled: true, metaBadge: '스터디', metaColor: 'purple' },
  { groupCode: 'LEDGER_CHARACTER', code: 'COMPANY', codeName: '회사 팀 / 프로젝트', enName: 'Team Project', sortOrder: 5, isDefault: false, isEnabled: true, metaBadge: '회사', metaColor: 'slate' },

  // 4. SPINE_DESIGN
  { groupCode: 'SPINE_DESIGN', code: 'INDIGO_CLASSIC', codeName: '인디고 클래식 패브릭', sortOrder: 1, isDefault: true, isEnabled: true, metaColor: '#4F46E5' },
  { groupCode: 'SPINE_DESIGN', code: 'EMERALD_NATURE', codeName: '에메랄드 포레스트 레더', sortOrder: 2, isDefault: false, isEnabled: true, metaColor: '#059669' },
  { groupCode: 'SPINE_DESIGN', code: 'AMBER_WARM', codeName: '웜 앰버 가죽 양장', sortOrder: 3, isDefault: false, isEnabled: true, metaColor: '#D97706' },
  { groupCode: 'SPINE_DESIGN', code: 'ROSE_ELEGANT', codeName: '로즈 와인 벨벳', sortOrder: 4, isDefault: false, isEnabled: true, metaColor: '#E11D48' },
  { groupCode: 'SPINE_DESIGN', code: 'SLATE_MODERN', codeName: '모던 딥 메탈 슬레이트', sortOrder: 5, isDefault: false, isEnabled: true, metaColor: '#334155' },

  // 5. LEDGER_STATUS
  { groupCode: 'LEDGER_STATUS', code: 'ACTIVE', codeName: '정상 활성', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'LEDGER_STATUS', code: 'FROZEN', codeName: '임시 동결', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'LEDGER_STATUS', code: 'ARCHIVED', codeName: '영구 아카이브', sortOrder: 3, isDefault: false, isEnabled: true },

  // 6. LEDGER_ROLE
  { groupCode: 'LEDGER_ROLE', code: 'OWNER', codeName: '장부 소유자 (전권)', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'LEDGER_ROLE', code: 'MANAGER', codeName: '운영자 (기장 및 정산)', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'LEDGER_ROLE', code: 'MEMBER', codeName: '참여 멤버 (입력)', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'LEDGER_ROLE', code: 'VIEWER', codeName: '단순 열람자', sortOrder: 4, isDefault: false, isEnabled: true },

  // 7. BANK_CODE
  { groupCode: 'BANK_CODE', code: 'KAKAO', codeName: '카카오뱅크', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'BANK_CODE', code: 'TOSS', codeName: '토스뱅크', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'BANK_CODE', code: 'KB', codeName: 'KB국민은행', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'BANK_CODE', code: 'SHINHAN', codeName: '신한은행', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'BANK_CODE', code: 'WOORI', codeName: '우리은행', sortOrder: 5, isDefault: false, isEnabled: true },
  { groupCode: 'BANK_CODE', code: 'HANA', codeName: '하나은행', sortOrder: 6, isDefault: false, isEnabled: true },
  { groupCode: 'BANK_CODE', code: 'NH', codeName: 'NH농협은행', sortOrder: 7, isDefault: false, isEnabled: true },

  // 8. CARD_CODE
  { groupCode: 'CARD_CODE', code: 'KB_CARD', codeName: 'KB국민카드', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'CARD_CODE', code: 'SHINHAN_CARD', codeName: '신한카드', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'CARD_CODE', code: 'SAMSUNG_CARD', codeName: '삼성카드', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'CARD_CODE', code: 'HYUNDAI_CARD', codeName: '현대카드', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'CARD_CODE', code: 'LOTTE_CARD', codeName: '롯데카드', sortOrder: 5, isDefault: false, isEnabled: true },
  { groupCode: 'CARD_CODE', code: 'WOORI_CARD', codeName: '우리카드', sortOrder: 6, isDefault: false, isEnabled: true },

  // 9. INSTALLMENT_PERIOD
  { groupCode: 'INSTALLMENT_PERIOD', code: 'LUMP_SUM', codeName: '일시불', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'INSTALLMENT_PERIOD', code: 'M_02', codeName: '2개월 할부', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'INSTALLMENT_PERIOD', code: 'M_03', codeName: '3개월 무이자', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'INSTALLMENT_PERIOD', code: 'M_06', codeName: '6개월 할부', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'INSTALLMENT_PERIOD', code: 'M_12', codeName: '12개월 할부', sortOrder: 5, isDefault: false, isEnabled: true },

  // 10. PAY_METHOD
  { groupCode: 'PAY_METHOD', code: 'CREDIT', codeName: '신용카드', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'PAY_METHOD', code: 'DEBIT', codeName: '체크카드', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'PAY_METHOD', code: 'TRANSFER', codeName: '계좌이체 / 뱅킹', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'PAY_METHOD', code: 'CASH', codeName: '현금', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'PAY_METHOD', code: 'EASY_PAY', codeName: '간편페이 (카카오/네이버/토스)', sortOrder: 5, isDefault: false, isEnabled: true },

  // 11. INCOME_CHANNEL
  { groupCode: 'INCOME_CHANNEL', code: 'SALARY', codeName: '정기 급여', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'INCOME_CHANNEL', code: 'BONUS', codeName: '보너스 / 성과급', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'INCOME_CHANNEL', code: 'FINANCIAL', codeName: '이자 / 배당 수익', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'INCOME_CHANNEL', code: 'SIDE_JOB', codeName: '중고거래 / 부업', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'INCOME_CHANNEL', code: 'ALLOWANCE', codeName: '용돈 / 지원금', sortOrder: 5, isDefault: false, isEnabled: true },

  // 12. BASE_EXP_CATEGORY
  { groupCode: 'BASE_EXP_CATEGORY', code: 'MEAL', codeName: '식비 & 장보기', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'BASE_EXP_CATEGORY', code: 'CAFE', codeName: '카페 & 디저트', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'BASE_EXP_CATEGORY', code: 'TRAFFIC', codeName: '교통 & 주유', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'BASE_EXP_CATEGORY', code: 'HOUSING', codeName: '주거 & 통신', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'BASE_EXP_CATEGORY', code: 'SHOPPING', codeName: '쇼핑 & 생활용품', sortOrder: 5, isDefault: false, isEnabled: true },
  { groupCode: 'BASE_EXP_CATEGORY', code: 'CULTURE', codeName: '문화 & 여가', sortOrder: 6, isDefault: false, isEnabled: true },

  // 13. BASE_TRANSFER_REASON
  { groupCode: 'BASE_TRANSFER_REASON', code: 'LIVING_CHARGE', codeName: '생활비 통장 충전', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'BASE_TRANSFER_REASON', code: 'SAVING_DEPOSIT', codeName: '적금 / 청약 저축 납입', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'BASE_TRANSFER_REASON', code: 'LOAN_REPAY', codeName: '대출 원리금 상환', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'BASE_TRANSFER_REASON', code: 'CARD_SETTLE', codeName: '신용카드 결제대금 결제', sortOrder: 4, isDefault: false, isEnabled: true },

  // 14. DUTY_BASE_CATEGORY
  { groupCode: 'DUTY_BASE_CATEGORY', code: 'CLEAN_ROOM', codeName: '회의실 / 거실 청소', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'DUTY_BASE_CATEGORY', code: 'TRASH_RECYCLE', codeName: '재활용 분리수거 배출', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'DUTY_BASE_CATEGORY', code: 'PANTRY', codeName: '탕비실 정리 & 컵 씻기', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'DUTY_BASE_CATEGORY', code: 'COFFEE_SNACK', codeName: '간식 & 원두 채우기', sortOrder: 4, isDefault: false, isEnabled: true },

  // 15. DUTY_ROTATION_POLICY
  { groupCode: 'DUTY_ROTATION_POLICY', code: 'SEQUENTIAL', codeName: '순차적 라운드로빈 순환', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'DUTY_ROTATION_POLICY', code: 'RANDOM', codeName: '룰렛 무작위 추첨 배정', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'DUTY_ROTATION_POLICY', code: 'VOLUNTEER', codeName: '선착순 자원 배정', sortOrder: 3, isDefault: false, isEnabled: true },

  // 16. DUTY_SETTLE_PERIOD
  { groupCode: 'DUTY_SETTLE_PERIOD', code: 'EACH_TIME', codeName: '수행 즉시 건별 정산', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'DUTY_SETTLE_PERIOD', code: 'WEEKLY', codeName: '주간 단위 합산 정산', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'DUTY_SETTLE_PERIOD', code: 'MONTH_END', codeName: '월말 일괄 정산', sortOrder: 3, isDefault: false, isEnabled: true },

  // 17. DUTY_COMPLETION_TYPE
  { groupCode: 'DUTY_COMPLETION_TYPE', code: 'PHOTO', codeName: '사진 인증 필수', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'DUTY_COMPLETION_TYPE', code: 'CHECK', codeName: '단순 체크 완료', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'DUTY_COMPLETION_TYPE', code: 'PEER_CONFIRM', codeName: '동료 1인 상호 확인', sortOrder: 3, isDefault: false, isEnabled: true },

  // 18. GOAL_INITIAL_TYPE
  { groupCode: 'GOAL_INITIAL_TYPE', code: 'SAVING_CHALLENGE', codeName: '목돈 모으기 저축 챌린지', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'GOAL_INITIAL_TYPE', code: 'NO_SPEND_DAY', codeName: '무지출 데이 달성하기', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'GOAL_INITIAL_TYPE', code: 'EXERCISE_HABIT', codeName: '매일 30분 운동하기', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'GOAL_INITIAL_TYPE', code: 'READING_BOOK', codeName: '한 달에 책 2권 완독', sortOrder: 4, isDefault: false, isEnabled: true },

  // 19. GOAL_DURATION
  { groupCode: 'GOAL_DURATION', code: 'D_07', codeName: '7일 단기 스프린트', sortOrder: 1, isDefault: false, isEnabled: true },
  { groupCode: 'GOAL_DURATION', code: 'D_14', codeName: '14일 집중 습관', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'GOAL_DURATION', code: 'D_30', codeName: '30일 챌린지', sortOrder: 3, isDefault: true, isEnabled: true },
  { groupCode: 'GOAL_DURATION', code: 'D_66', codeName: '66일 체질화 코스', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'GOAL_DURATION', code: 'D_100', codeName: '100일 완주 목표', sortOrder: 5, isDefault: false, isEnabled: true },

  // 20. SETTLE_INITIAL_CATEGORY
  { groupCode: 'SETTLE_INITIAL_CATEGORY', code: 'DINING_OUT', codeName: '점심 / 회식 식사비 N빵', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'SETTLE_INITIAL_CATEGORY', code: 'TRAVEL_TRIP', codeName: '주말 펜션 / 여행 경비', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'SETTLE_INITIAL_CATEGORY', code: 'CONGRAT_EVENT', codeName: '결혼식 / 경조사 모금', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'SETTLE_INITIAL_CATEGORY', code: 'CO_BUY', codeName: '생필품 공동구매 정산', sortOrder: 4, isDefault: false, isEnabled: true },

  // 21. DAY_SOURCE_TYPE
  { groupCode: 'DAY_SOURCE_TYPE', code: 'LEDGER', codeName: '가계부', enName: 'Ledger', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'DAY_SOURCE_TYPE', code: 'DUTY', codeName: '모아당번', enName: 'Duty', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'DAY_SOURCE_TYPE', code: 'GOAL', codeName: '모아목표', enName: 'Goal', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'DAY_SOURCE_TYPE', code: 'ROUTINE', codeName: '모아루틴', enName: 'Routine', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'DAY_SOURCE_TYPE', code: 'CAR', codeName: '모아부릉', enName: 'MoaVroom', sortOrder: 5, isDefault: false, isEnabled: true },
  { groupCode: 'DAY_SOURCE_TYPE', code: 'PERSONAL', codeName: '개인 일정', enName: 'Personal', sortOrder: 6, isDefault: false, isEnabled: true },
  { groupCode: 'DAY_SOURCE_TYPE', code: 'DIARY', codeName: '스마트 일기', enName: 'Diary', sortOrder: 7, isDefault: false, isEnabled: true },

  // 22. ROUTINE_CATEGORY
  { groupCode: 'ROUTINE_CATEGORY', code: 'HEALTH_MEDICINE', codeName: '약복용 루틴', enName: 'Medicine Routine', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'ROUTINE_CATEGORY', code: 'LIFE_PHONE', codeName: '알뜰폰 환승', enName: 'MVNO Transfer', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'ROUTINE_CATEGORY', code: 'BIZ_TAX', codeName: '세금계산서 발급', enName: 'Tax Invoice', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'ROUTINE_CATEGORY', code: 'FINANCE_CARD_SETTLE', codeName: '급여·카드 정산', enName: 'Card Settlement', sortOrder: 4, isDefault: false, isEnabled: true },

  // 23. MVNO_NETWORK
  { groupCode: 'MVNO_NETWORK', code: 'SKT', codeName: 'SKT망 (7모바일/티플러스)', enName: 'SKT Network', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'MVNO_NETWORK', code: 'KT', codeName: 'KT망 (M모바일/스카이라이프)', enName: 'KT Network', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'MVNO_NETWORK', code: 'LGU', codeName: 'LGU+망 (유모바일/리브모바일)', enName: 'LGU+ Network', sortOrder: 3, isDefault: false, isEnabled: true },

  // 24. CAR_FUEL_TYPE
  { groupCode: 'CAR_FUEL_TYPE', code: 'GASOLINE', codeName: '휘발유', enName: 'Gasoline', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'CAR_FUEL_TYPE', code: 'DIESEL', codeName: '경유', enName: 'Diesel', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_FUEL_TYPE', code: 'HYBRID', codeName: '하이브리드', enName: 'Hybrid', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_FUEL_TYPE', code: 'EV', codeName: '전기차', enName: 'Electric', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_FUEL_TYPE', code: 'LPG', codeName: 'LPG', enName: 'LPG', sortOrder: 5, isDefault: false, isEnabled: true },

  // 25. CAR_LOG_TYPE
  { groupCode: 'CAR_LOG_TYPE', code: 'FUEL', codeName: '주유·충전', enName: 'Fuel', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'CAR_LOG_TYPE', code: 'INSPECTION', codeName: '점검', enName: 'Inspection', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_LOG_TYPE', code: 'REPAIR', codeName: '수리', enName: 'Repair', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_LOG_TYPE', code: 'WASH', codeName: '세차', enName: 'Car Wash', sortOrder: 4, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_LOG_TYPE', code: 'INSURANCE', codeName: '보험', enName: 'Insurance', sortOrder: 5, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_LOG_TYPE', code: 'PARKING', codeName: '주차', enName: 'Parking', sortOrder: 6, isDefault: false, isEnabled: true },

  // 26. CAR_MAINTENANCE_TYPE
  { groupCode: 'CAR_MAINTENANCE_TYPE', code: 'ENGINE_OIL', codeName: '엔진오일 & 필터', enName: 'Engine Oil', sortOrder: 1, isDefault: true, isEnabled: true, userField1: '6개월', userField2: '10,000km' },
  { groupCode: 'CAR_MAINTENANCE_TYPE', code: 'AIR_FILTER', codeName: '에어컨/캐빈 필터', enName: 'Air Filter', sortOrder: 2, isDefault: false, isEnabled: true, userField1: '6개월', userField2: '10,000km' },
  { groupCode: 'CAR_MAINTENANCE_TYPE', code: 'TIRE_ROTATION', codeName: '타이어 위치교환', enName: 'Tire Rotation', sortOrder: 3, isDefault: false, isEnabled: true, userField1: '12개월', userField2: '15,000km' },
  { groupCode: 'CAR_MAINTENANCE_TYPE', code: 'LEGAL_INSPECTION', codeName: '정기종합검사', enName: 'Legal Inspection', sortOrder: 4, isDefault: false, isEnabled: true, userField1: '24개월' },
  { groupCode: 'CAR_MAINTENANCE_TYPE', code: 'INSURANCE_RENEWAL', codeName: '자동차보험 갱신', enName: 'Insurance Renewal', sortOrder: 5, isDefault: false, isEnabled: true, userField1: '12개월' },
  { groupCode: 'CAR_MAINTENANCE_TYPE', code: 'PARKING_PASS', codeName: '월 정기주차권', enName: 'Parking Pass', sortOrder: 6, isDefault: false, isEnabled: true, userField1: '1개월' },

  // 27. CAR_INSURANCE_CO
  { groupCode: 'CAR_INSURANCE_CO', code: 'SAMSUNG', codeName: '삼성화재 다이렉트', enName: 'Samsung Fire', sortOrder: 1, isDefault: true, isEnabled: true, userField1: '1588-5114' },
  { groupCode: 'CAR_INSURANCE_CO', code: 'DB', codeName: 'DB손해보험', enName: 'DB Insurance', sortOrder: 2, isDefault: false, isEnabled: true, userField1: '1588-0100' },
  { groupCode: 'CAR_INSURANCE_CO', code: 'HYUNDAI', codeName: '현대해상 다이렉트', enName: 'Hyundai Marine', sortOrder: 3, isDefault: false, isEnabled: true, userField1: '1588-5656' },
  { groupCode: 'CAR_INSURANCE_CO', code: 'KB', codeName: 'KB손해보험', enName: 'KB Insurance', sortOrder: 4, isDefault: false, isEnabled: true, userField1: '1544-0114' },

  // 28. CAR_INSPECT_CAT
  { groupCode: 'CAR_INSPECT_CAT', code: 'POWERTRAIN', codeName: '동력 · 엔진오일 · 냉각수', enName: 'Powertrain', sortOrder: 1, isDefault: true, isEnabled: true },
  { groupCode: 'CAR_INSPECT_CAT', code: 'BRAKE_TIRE', codeName: '제동 패드 · 타이어 공기압', enName: 'Brake & Tire', sortOrder: 2, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_INSPECT_CAT', code: 'ELECTRICAL', codeName: '배터리 · 등화장치 · 센서', enName: 'Electrical', sortOrder: 3, isDefault: false, isEnabled: true },
  { groupCode: 'CAR_INSPECT_CAT', code: 'BODY_EXTERIOR', codeName: '와이퍼 · 워셔액 · 차체외관', enName: 'Body & Exterior', sortOrder: 4, isDefault: false, isEnabled: true },
];

/* =========================================================================
   6. 전역 하이브리드 로컬 스토리지 SSOT 싱글톤 관리자
   ========================================================================= */
const STORAGE_KEYS = {
  AUTH_SECURITY: 'moabogo_system_auth_security',
  NOTIFICATIONS: 'moabogo_system_notifications',
  RETENTION_POLICY: 'moabogo_system_retention_policy',
  FINANCE_COMPLIANCE: 'moabogo_system_finance_compliance',
  MENUS: 'moabogo_system_menus',
  SCREENS: 'moabogo_system_screens',
  ROLES: 'moabogo_system_roles',
  USERS: 'moabogo_system_users',
  TERMS: 'moabogo_system_terms',
  DETAIL_CODES: 'moabogo_system_master_detail_codes',
  SYSTEM_STORES: 'moabogo_system_stores_pool',
  LADDER_PRESETS: 'moabogo_system_ladder_presets_pool',
  ROULETTE_PRESETS: 'moabogo_system_roulette_presets_pool',
  NOTICES: 'moabogo_system_notices_pool',
};

function mergeMissingDefaults<T extends { id: string }>(saved: T[], defaults: T[]): T[] {
  const seen = new Set(saved.map((item) => item.id));
  const missing = defaults.filter((def) => !seen.has(def.id));
  return missing.length > 0 ? [...saved, ...missing] : saved;
}

// 1. 로그인 인증 및 보안 설정 로드 / 저장
export const loadAuthSecurityConfig = (): SystemAuthSecurityConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SECURITY);
    return raw ? JSON.parse(raw) : DEFAULT_AUTH_SECURITY_CONFIG;
  } catch {
    return DEFAULT_AUTH_SECURITY_CONFIG;
  }
};

export const saveAuthSecurityConfig = (config: SystemAuthSecurityConfig): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_SECURITY, JSON.stringify(config));
};

// 2. 알림 발송 매트릭스 로드 / 저장
export const loadNotificationMatrix = (): SystemNotificationMatrix => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? { ...DEFAULT_NOTIFICATION_MATRIX, ...JSON.parse(raw) } : DEFAULT_NOTIFICATION_MATRIX;
  } catch {
    return DEFAULT_NOTIFICATION_MATRIX;
  }
};

export const saveNotificationMatrix = (matrix: SystemNotificationMatrix): void => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(matrix));
};

// 2-1. 스토리지 및 미아데이터 수명주기 정책 로드 / 저장
export const loadRetentionPolicy = (): SystemRetentionPolicy => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RETENTION_POLICY);
    return raw ? { ...DEFAULT_RETENTION_POLICY, ...JSON.parse(raw) } : DEFAULT_RETENTION_POLICY;
  } catch {
    return DEFAULT_RETENTION_POLICY;
  }
};

export const saveRetentionPolicy = (policy: SystemRetentionPolicy): void => {
  localStorage.setItem(STORAGE_KEYS.RETENTION_POLICY, JSON.stringify(policy));
};

// 3. 금융 컴플라이언스 로드 / 저장
export const loadFinancialCompliance = (): SystemFinancialCompliance => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCE_COMPLIANCE);
    return raw ? JSON.parse(raw) : DEFAULT_FINANCIAL_COMPLIANCE;
  } catch {
    return DEFAULT_FINANCIAL_COMPLIANCE;
  }
};

export const saveFinancialCompliance = (config: SystemFinancialCompliance): void => {
  localStorage.setItem(STORAGE_KEYS.FINANCE_COMPLIANCE, JSON.stringify(config));
};

// 4. RBAC 메뉴, 화면, 권한, 사용자, 약관 로드 / 저장 (구버전 로컬스토리지 누락분 안전 병합)
export const loadManagedMenus = (): MenuItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENUS);
    if (!raw) return DEFAULT_MENUS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? mergeMissingDefaults(parsed, DEFAULT_MENUS) : DEFAULT_MENUS;
  } catch {
    return DEFAULT_MENUS;
  }
};

export const saveManagedMenus = (menus: MenuItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menus));
};

export const loadManagedScreens = (): ScreenItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCREENS);
    if (!raw) return DEFAULT_SCREENS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? mergeMissingDefaults(parsed, DEFAULT_SCREENS) : DEFAULT_SCREENS;
  } catch {
    return DEFAULT_SCREENS;
  }
};

export const saveManagedScreens = (screens: ScreenItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
};

export const loadManagedRoles = (): RoleGroupItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROLES);
    if (!raw) return DEFAULT_ROLE_GROUPS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ROLE_GROUPS;
    const merged = mergeMissingDefaults(parsed, DEFAULT_ROLE_GROUPS);
    return merged.map((role) => {
      const def = DEFAULT_ROLE_GROUPS.find((d) => d.id === role.id);
      if (!def) return role;
      const missingScreenIds = def.mappedScreenIds.filter((sid) => !role.mappedScreenIds.includes(sid));
      return missingScreenIds.length > 0 && role.mappedScreenIds.length <= 8
        ? { ...role, mappedScreenIds: [...role.mappedScreenIds, ...missingScreenIds] }
        : role;
    });
  } catch {
    return DEFAULT_ROLE_GROUPS;
  }
};

export const saveManagedRoles = (roles: RoleGroupItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
};

export const loadManagedUsers = (): ManagedUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEFAULT_MANAGED_USERS;
  } catch {
    return DEFAULT_MANAGED_USERS;
  }
};

export const saveManagedUsers = (users: ManagedUser[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const loadManagedTerms = (): TermsDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TERMS);
    return raw ? JSON.parse(raw) : DEFAULT_TERMS;
  } catch {
    return DEFAULT_TERMS;
  }
};

export const saveManagedTerms = (terms: TermsDocument[]): void => {
  localStorage.setItem(STORAGE_KEYS.TERMS, JSON.stringify(terms));
};

// 5. 28대 마스터 코드 로드 / 저장 / 필터
export const loadMasterDetailCodes = (): MasterDetailCode[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DETAIL_CODES);
    if (!raw) return DEFAULT_DETAIL_CODES;
    const parsed: MasterDetailCode[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_DETAIL_CODES;
    const existingKeys = new Set(parsed.map((c) => `${c.groupCode}::${c.code}`));
    const missing = DEFAULT_DETAIL_CODES.filter((d) => !existingKeys.has(`${d.groupCode}::${d.code}`));
    return missing.length > 0 ? [...parsed, ...missing] : parsed;
  } catch {
    return DEFAULT_DETAIL_CODES;
  }
};

export const saveMasterDetailCodes = (codes: MasterDetailCode[]): void => {
  localStorage.setItem(STORAGE_KEYS.DETAIL_CODES, JSON.stringify(codes));
};

export const getDetailCodesByGroup = (groupCode: string): MasterDetailCode[] => {
  const all = loadMasterDetailCodes();
  return all
    .filter((c) => c.groupCode === groupCode)
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

// 6. 게임 기초 콘텐츠 풀 (사다리 매장 & 룰렛 프리셋) 로드 / 저장
export const loadSystemStorePool = (): StorePreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYSTEM_STORES);
    return raw ? JSON.parse(raw) : SYSTEM_STORE_POOL;
  } catch {
    return SYSTEM_STORE_POOL;
  }
};

export const saveSystemStorePool = (stores: StorePreset[]): void => {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_STORES, JSON.stringify(stores));
};

export const loadSystemLadderPresets = (): LadderGoalPreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LADDER_PRESETS);
    return raw ? JSON.parse(raw) : LADDER_ROLE_PRESETS;
  } catch {
    return LADDER_ROLE_PRESETS;
  }
};

export const saveSystemLadderPresets = (presets: LadderGoalPreset[]): void => {
  localStorage.setItem(STORAGE_KEYS.LADDER_PRESETS, JSON.stringify(presets));
};

export const loadSystemRoulettePresets = (): RoulettePreset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROULETTE_PRESETS);
    return raw ? JSON.parse(raw) : ROULETTE_PRESETS;
  } catch {
    return ROULETTE_PRESETS;
  }
};

export const saveSystemRoulettePresets = (presets: RoulettePreset[]): void => {
  localStorage.setItem(STORAGE_KEYS.ROULETTE_PRESETS, JSON.stringify(presets));
};

// 7. 긴급 공지 관리 로드 / 저장
export const loadSystemNotices = (): SystemNoticeItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTICES);
    return raw ? JSON.parse(raw) : DEFAULT_NOTICES;
  } catch {
    return DEFAULT_NOTICES;
  }
};

export const saveSystemNotices = (notices: SystemNoticeItem[]): void => {
  localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
};

// 8. 전체 시스템 설정 초기화 (기본값 복원)
export const resetAllSystemGovernance = (): void => {
  saveAuthSecurityConfig(DEFAULT_AUTH_SECURITY_CONFIG);
  saveNotificationMatrix(DEFAULT_NOTIFICATION_MATRIX);
  saveRetentionPolicy(DEFAULT_RETENTION_POLICY);
  saveFinancialCompliance(DEFAULT_FINANCIAL_COMPLIANCE);
  saveManagedMenus(DEFAULT_MENUS);
  saveManagedScreens(DEFAULT_SCREENS);
  saveManagedRoles(DEFAULT_ROLE_GROUPS);
  saveManagedUsers(DEFAULT_MANAGED_USERS);
  saveManagedTerms(DEFAULT_TERMS);
  saveMasterDetailCodes(DEFAULT_DETAIL_CODES);
  saveSystemStorePool(SYSTEM_STORE_POOL);
  saveSystemLadderPresets(LADDER_ROLE_PRESETS);
  saveSystemRoulettePresets(ROULETTE_PRESETS);
  saveSystemNotices(DEFAULT_NOTICES);
};
