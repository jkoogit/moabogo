// 모아보고 시스템 매장 풀 (System Store Pool) 및 사다리 역할 프리셋
// SSOT: docs/04.데이터 / SCR-SET-01 & SCR-GNT-01 공유 데이터

import { INITIAL_GOAL_LIST } from './goal-mock-data';
import { INITIAL_DUTIES } from '../dutyStore';

export type StoreCategoryType = 'CAFE' | 'LUNCH' | 'DINNER' | 'DESSERT' | 'SNACK' | 'CUSTOM';

export interface StoreMenuItem {
  id: string;
  name: string;
  price: number;
  categoryName: string;
  isSignature?: boolean;
  badge?: string;
  temperature?: 'HOT' | 'ICE' | 'BOTH';
  description?: string;
  iconName?: string;
  imageUrl?: string;
}

export interface StorePreset {
  id: string;
  name: string;
  partnerBrand?: string;
  operator?: string;
  category: StoreCategoryType;
  categoryLabel: string;
  locationMemo: string;
  naverBookingUrl?: string;
  bannerImage?: string;
  themeColor: string;
  menuCategories: string[];
  menus: StoreMenuItem[];
  isPresetDefault?: boolean;
  updatedAt: string;
}

export interface LadderGoalPreset {
  id: string;
  category: 'COFFEE' | 'LUNCH' | 'DUTY';
  title: string;
  description: string;
  playerCount: number; // 참가자수
  winnerCount: number; // 당첨자수
  storeId?: string; // 연계 매장 ID
  storeName?: string; // 연계 매장명
  roles: Array<{
    label: string;
    type: 'PAY' | 'PICKUP' | 'CLEAN' | 'PASS';
    color: string;
    badgeText?: string;
  }>;
}

// 사다리 추천 목표(Role) 프리셋 묶음
export const LADDER_ROLE_PRESETS: LadderGoalPreset[] = [
  {
    id: 'preset_coffee_bet',
    category: 'COFFEE',
    title: '☕ 커피 쏘기 & 픽업 내기 (대표 5인)',
    description: '1명 결제 당첨, 2명 픽업 심부름, 2명 생존',
    playerCount: 5,
    winnerCount: 1,
    storeId: 'sys_store_pluscafe_45f',
    storeName: 'PLUS CAFE (45층 사내카페)',
    roles: [
      { label: '💳 오늘 커피 결제', type: 'PAY', color: 'rose', badgeText: '당첨' },
      { label: '🏃 커피 픽업 심부름', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
      { label: '🏃 커피 픽업 심부름', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
      { label: '🎉 축 통과 (생존)', type: 'PASS', color: 'emerald', badgeText: '면제' },
      { label: '🎉 축 통과 (생존)', type: 'PASS', color: 'emerald', badgeText: '면제' },
    ],
  },
  {
    id: 'preset_lunch_duty',
    category: 'LUNCH',
    title: '🍱 점심식사 뒷정리 & 수저 세팅 내기 (5인)',
    description: '수저 세팅, 테이블 정리, 영수증 챙기기 역할 분담',
    playerCount: 5,
    winnerCount: 3,
    storeId: 'sys_store_ssada_yeouido',
    storeName: '싸다김밥 여의도점',
    roles: [
      { label: '🥄 수저 & 물 세팅', type: 'CLEAN', color: 'sky', badgeText: '세팅' },
      { label: '🧻 식사 후 테이블 닦기', type: 'CLEAN', color: 'sky', badgeText: '정리' },
      { label: '🧾 영수증 챙겨 정산 올리기', type: 'CLEAN', color: 'indigo', badgeText: '정산' },
      { label: '🎉 안락한 식사 (면제)', type: 'PASS', color: 'emerald', badgeText: '면제' },
      { label: '🎉 안락한 식사 (면제)', type: 'PASS', color: 'emerald', badgeText: '면제' },
    ],
  },
  {
    id: 'preset_one_buyer',
    category: 'COFFEE',
    title: '🎯 단 1명만 결제하기 (1인 결제 모드 - 5인)',
    description: '1명만 결제하고 나머지는 모두 통과하는 긴장감 넘치는 모드',
    playerCount: 5,
    winnerCount: 1,
    storeId: 'sys_store_starbucks_ifc',
    storeName: '스타벅스 여의도IFC몰점',
    roles: [
      { label: '💳 전체 전액 결제', type: 'PAY', color: 'rose', badgeText: '당첨' },
      { label: '🎉 생존', type: 'PASS', color: 'emerald', badgeText: '통과' },
      { label: '🎉 생존', type: 'PASS', color: 'emerald', badgeText: '통과' },
      { label: '🎉 생존', type: 'PASS', color: 'emerald', badgeText: '통과' },
      { label: '🎉 생존', type: 'PASS', color: 'emerald', badgeText: '통과' },
    ],
  },
];

// 룰렛 프리셋 및 항목 인터페이스
export interface RoulettePresetItem {
  id: string;
  name: string;
  icon?: string;
  weight: number;
}

export interface RoulettePreset {
  id: string;
  category: 'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM';
  title: string;
  description: string;
  icon: string;
  items: RoulettePresetItem[];
}

// 룰렛 추천 퀵 프리셋 묶음
export const ROULETTE_PRESETS: RoulettePreset[] = [
  {
    id: 'roulette_preset_lunch',
    category: 'LUNCH',
    title: '🍱 오늘 점심 메뉴 뭐 먹지?',
    description: '선택 장애 해결! 가장 인기 있는 6가지 점심 메뉴',
    icon: '🍱',
    items: [
      { id: 'r_item_1', name: '김치찌개 / 제육볶음 (한식)', icon: '🍲', weight: 10 },
      { id: 'r_item_2', name: '돈까스 / 일식 라멘', icon: '🍛', weight: 10 },
      { id: 'r_item_3', name: '짜장면 / 짬뽕 (중식)', icon: '🍜', weight: 10 },
      { id: 'r_item_4', name: '파스타 / 버거 (양식)', icon: '🍔', weight: 10 },
      { id: 'r_item_5', name: '샐러드 / 샌드위치 (가볍게)', icon: '🥗', weight: 10 },
      { id: 'r_item_6', name: '떡볶이 / 튀김 (분식)', icon: '🍢', weight: 10 },
    ],
  },
  {
    id: 'roulette_preset_duty',
    category: 'DUTY',
    title: '🧹 오늘 당번 & 청소 정하기',
    description: '회의실, 탕비실, 분리수거 등 공정한 당번 배정',
    icon: '🧹',
    items: [
      { id: 'r_duty_1', name: '회의실 정리 & 화이트보드 지우기', icon: '📝', weight: 10 },
      { id: 'r_duty_2', name: '탕비실 싱크대 정리 & 컵 씻기', icon: '☕', weight: 10 },
      { id: 'r_duty_3', name: '재활용 분리수거 배출', icon: '♻️', weight: 10 },
      { id: 'r_duty_4', name: '간식 & 원두 채워넣기', icon: '🍪', weight: 10 },
      { id: 'r_duty_5', name: '저녁 퇴근 시 환기 & 소등 점검', icon: '💡', weight: 10 },
    ],
  },
  {
    id: 'roulette_preset_penalty',
    category: 'PENALTY',
    title: '🎯 흥미진진한 벌칙 룰렛',
    description: '모임 분위기를 띄우는 가벼운 미션 & 벌칙',
    icon: '🎯',
    items: [
      { id: 'r_pen_1', name: '다음 회식/모임 커피 쏘기', icon: '☕', weight: 10 },
      { id: 'r_pen_2', name: '시원한 아이스크림 사오기', icon: '🍦', weight: 10 },
      { id: 'r_pen_3', name: '팀원 전원에게 진심 어린 칭찬 1마디', icon: '💖', weight: 10 },
      { id: 'r_pen_4', name: '단체방에 셀카 투척', icon: '📸', weight: 10 },
      { id: 'r_pen_5', name: '노래 1소절 부르기', icon: '🎤', weight: 10 },
      { id: 'r_pen_6', name: '🎉 축 통과! (벌칙 면제)', icon: '🍀', weight: 10 },
    ],
  },
  {
    id: 'roulette_preset_coffee',
    category: 'COFFEE',
    title: '☕ 커피 쏘기 & 픽업 내기',
    description: '결제자 1명, 픽업자 1명, 면제자 선정',
    icon: '☕',
    items: [
      { id: 'r_cof_1', name: '💳 오늘 커피 전액 결제', icon: '💳', weight: 10 },
      { id: 'r_cof_2', name: '🏃 카페 다녀오기 (픽업 심부름)', icon: '🏃', weight: 10 },
      { id: 'r_cof_3', name: '🎉 축 통과 (편안한 휴식)', icon: '🎉', weight: 10 },
      { id: 'r_cof_4', name: '🎉 축 통과 (편안한 휴식)', icon: '🎉', weight: 10 },
    ],
  },
];

// PLUS CAFE 45층 (WPS 스타벅스 공식 파트너 / 여의도 63빌딩 45층 사내카페)
// 실전 전 메뉴 34종 전수 수집 데이터셋
export const SYSTEM_STORE_POOL: StorePreset[] = [
  {
    id: 'sys_store_pluscafe_45f',
    name: 'PLUS CAFE 45층',
    partnerBrand: 'WPS 스타벅스 (We Proudly Serve Starbucks®)',
    operator: '주식회사 굿플레이스',
    category: 'CAFE',
    categoryLabel: '사내카페 / WPS 스타벅스',
    locationMemo: '여의도 63빌딩 45층 (사내 임직원 복지 카페)',
    naverBookingUrl: 'https://booking.naver.com/order/bizes/1655266/items/7683611',
    bannerImage: 'https://naverbooking-phinf.pstatic.net/20260515_269/1778819513942PNlX6_PNG/image.png?type=f804_408_60_sharpen',
    themeColor: '#006241', // 스타벅스 시그니처 딥그린
    isPresetDefault: true,
    updatedAt: '2026-10-21',
        menuCategories: [
      '커피 (COFFEE)',
      '콜드브루 & 디카페인',
      '음료 & 티',
      'RTD (병음료)',
      '베이커리 & 디저트',
    ],
    menus: [
      // 1. 커피 (COFFEE)
      {
        id: 'menu_pc_01',
        name: '카페 아메리카노 (HOT)',
        price: 4500,
        iconName: '☕',
        categoryName: '커피 (COFFEE)',
        isSignature: true,
        badge: 'BEST',
        temperature: 'HOT',
        description: 'WPS 스타벅스 에스프레소 로스트의 깊고 진한 풍미',
        imageUrl: '/images/menu/pluscafe/menu_pc_01.png',
      },
      {
        id: 'menu_pc_02',
        name: '카페 아메리카노 (ICE)',
        price: 4500,
        iconName: '🧊',
        categoryName: '커피 (COFFEE)',
        isSignature: true,
        badge: 'BEST',
        temperature: 'ICE',
        description: '얼음 가득 깔끔하고 시원한 부동의 1위 메뉴',
        imageUrl: '/images/menu/pluscafe/menu_pc_02.png',
      },
      {
        id: 'menu_pc_03',
        name: '에스프레소 (HOT)',
        price: 3500,
        iconName: '☕',
        categoryName: '커피 (COFFEE)',
        temperature: 'HOT',
        description: '농밀한 크레마와 바디감의 정통 에스프레소 더블샷',
        imageUrl: '/images/menu/pluscafe/menu_pc_03.png',
      },
      {
        id: 'menu_pc_04',
        name: '카페 라떼 (HOT/ICE)',
        price: 5000,
        iconName: '🥛',
        categoryName: '커피 (COFFEE)',
        isSignature: true,
        badge: '인기',
        temperature: 'BOTH',
        description: '부드러운 스팀우유와 에스프레소의 고소한 조화',
        imageUrl: '/images/menu/pluscafe/menu_pc_04.png',
      },
      {
        id: 'menu_pc_05',
        name: '바닐라 빈 라떼 (HOT/ICE)',
        price: 5500,
        iconName: '🍯',
        categoryName: '커피 (COFFEE)',
        badge: '추천',
        temperature: 'BOTH',
        description: '천연 바닐라빈 시럽이 은은하게 퍼지는 달콤함',
        imageUrl: '/images/menu/pluscafe/menu_pc_05.png',
      },
      {
        id: 'menu_pc_06',
        name: '헤이즐넛 라떼 (HOT/ICE)',
        price: 5500,
        iconName: '🌰',
        categoryName: '커피 (COFFEE)',
        temperature: 'BOTH',
        description: '구운 헤이즐넛의 고소한 향미가 퍼지는 라떼',
        imageUrl: '/images/menu/pluscafe/menu_pc_06.png',
      },
      {
        id: 'menu_pc_07',
        name: '카라멜 마키아또 (HOT/ICE)',
        price: 5800,
        iconName: '🍮',
        categoryName: '커피 (COFFEE)',
        temperature: 'BOTH',
        description: '달콤한 바닐라 시럽, 벨벳 우유 거품, 진한 카라멜 드리즐',
        imageUrl: '/images/menu/pluscafe/menu_pc_07.png',
      },
      {
        id: 'menu_pc_08',
        name: '카푸치노 (HOT)',
        price: 5000,
        iconName: '☕',
        categoryName: '커피 (COFFEE)',
        temperature: 'HOT',
        description: '풍성하고 벨벳 같은 우유 거품과 향긋한 시나몬 파우더',
        imageUrl: '/images/menu/pluscafe/menu_pc_08.png',
      },
      {
        id: 'menu_pc_09',
        name: '카페 모카 (HOT/ICE)',
        price: 5800,
        iconName: '🍫',
        categoryName: '커피 (COFFEE)',
        temperature: 'BOTH',
        description: '달콤 쌉싸름한 다크 초콜릿 모카 시럽과 휘핑크림',
        imageUrl: '/images/menu/pluscafe/menu_pc_09.png',
      },

      // 2. 콜드브루 & 디카페인
      {
        id: 'menu_pc_10',
        name: '콜드브루 (ICE)',
        price: 5000,
        iconName: '🧊',
        categoryName: '콜드브루 & 디카페인',
        isSignature: true,
        badge: '시그니처',
        temperature: 'ICE',
        description: '장시간 저온 추출하여 깔끔하고 초콜릿 풍미가 감도는 커피',
        imageUrl: '/images/menu/pluscafe/menu_pc_10.png',
      },
      {
        id: 'menu_pc_11',
        name: '돌체 콜드브루 (ICE)',
        price: 5800,
        iconName: '🥛',
        categoryName: '콜드브루 & 디카페인',
        badge: '인기',
        temperature: 'ICE',
        description: '부드러운 연유 돌체 시럽과 콜드브루의 깔끔한 만남',
        imageUrl: '/images/menu/pluscafe/menu_pc_11.png',
      },
      {
        id: 'menu_pc_12',
        name: '디카페인 아메리카노 (HOT/ICE)',
        price: 4800,
        iconName: '☕',
        categoryName: '콜드브루 & 디카페인',
        temperature: 'BOTH',
        description: '카페인 부담 없이 가볍게 즐기는 100% 디카페인 원두',
        imageUrl: '/images/menu/pluscafe/menu_pc_12.png',
      },
      {
        id: 'menu_pc_13',
        name: '디카페인 카페 라떼 (HOT/ICE)',
        price: 5300,
        iconName: '🥛',
        categoryName: '콜드브루 & 디카페인',
        temperature: 'BOTH',
        description: '늦은 오후에도 부담 없는 편안하고 고소한 디카페인 라떼',
        imageUrl: '/images/menu/pluscafe/menu_pc_13.png',
      },

      // 3. 음료 & 티
      {
        id: 'menu_pc_14',
        name: '제주 유기농 말차 라떼 (HOT/ICE)',
        price: 6100,
        iconName: '🍵',
        categoryName: '음료 & 티',
        badge: '인기',
        temperature: 'BOTH',
        description: '차광 재배한 제주 어린 찻잎으로 만든 깊고 진한 프리미엄 말차',
        imageUrl: '/images/menu/pluscafe/menu_pc_14.png',
      },
      {
        id: 'menu_pc_15',
        name: '시그니처 초콜릿 라떼 (HOT/ICE)',
        price: 5500,
        iconName: '🍫',
        categoryName: '음료 & 티',
        temperature: 'BOTH',
        description: '벨기에산 진한 다크 초콜릿을 직접 녹여낸 극강의 달콤함',
        imageUrl: '/images/menu/pluscafe/menu_pc_15.png',
      },
      {
        id: 'menu_pc_16',
        name: '자몽 허니 블랙티 (HOT/ICE)',
        price: 5700,
        iconName: '🍊',
        categoryName: '음료 & 티',
        isSignature: true,
        badge: 'BEST',
        temperature: 'BOTH',
        description: '상큼한 생자몽 퓨레와 달콤한 아카시아 꿀, 블랙티의 완벽한 밸런스',
        imageUrl: '/images/menu/pluscafe/menu_pc_16.png',
      },
      {
        id: 'menu_pc_17',
        name: '생자몽 에이드 (ICE)',
        price: 5800,
        iconName: '🍹',
        categoryName: '음료 & 티',
        temperature: 'ICE',
        description: '생자몽을 통째로 착즙하여 탄산수와 블렌딩한 톡 쏘는 청량감',
        imageUrl: '/images/menu/pluscafe/menu_pc_17.png',
      },
      {
        id: 'menu_pc_18',
        name: '레몬 라임 에이드 (ICE)',
        price: 5500,
        iconName: '🍋',
        categoryName: '음료 & 티',
        temperature: 'ICE',
        description: '신선한 레몬과 라임 과즙의 톡 쏘는 청량감',
        imageUrl: '/images/menu/pluscafe/menu_pc_18.png',
      },
      {
        id: 'menu_pc_19',
        name: '청포도 에이드 (ICE)',
        price: 5500,
        iconName: '🍇',
        categoryName: '음료 & 티',
        temperature: 'ICE',
        description: '달콤한 청포도 알갱이와 스파클링 탄산수의 상큼한 만남',
        imageUrl: '/images/menu/pluscafe/menu_pc_19.png',
      },
      {
        id: 'menu_pc_20',
        name: '복숭아 아이스티 (ICE)',
        price: 4000,
        iconName: '🍑',
        categoryName: '음료 & 티',
        temperature: 'ICE',
        description: '달콤하고 시원한 복숭아 홍차 블렌딩',
        imageUrl: '/images/menu/pluscafe/menu_pc_20.png',
      },
      {
        id: 'menu_pc_21',
        name: '얼그레이 클래식 티 (HOT/ICE)',
        price: 4500,
        iconName: '🫖',
        categoryName: '음료 & 티',
        temperature: 'BOTH',
        description: '천연 베르가못 향과 클래식 홍차 잎의 깊은 향기',
        imageUrl: '/images/menu/pluscafe/menu_pc_21.png',
      },
      {
        id: 'menu_pc_22',
        name: '캐모마일 허브티 (HOT/ICE)',
        price: 4500,
        iconName: '🌼',
        categoryName: '음료 & 티',
        temperature: 'BOTH',
        description: '마음을 편안하게 해주는 은은한 꽃향기 무카페인 허브티',
        imageUrl: '/images/menu/pluscafe/menu_pc_22.png',
      },
      {
        id: 'menu_pc_23',
        name: '페퍼민트 허브티 (HOT/ICE)',
        price: 4500,
        iconName: '🌿',
        categoryName: '음료 & 티',
        temperature: 'BOTH',
        description: '멘톨의 상쾌함으로 입안을 개운하게 해주는 무카페인 허브티',
        imageUrl: '/images/menu/pluscafe/menu_pc_23.png',
      },

      // 4. RTD (병음료) 🥤
      {
        id: 'menu_pc_24',
        name: '분다버그 핑크자몽 (375ml)',
        price: 4500,
        iconName: '🍹',
        categoryName: 'RTD (병음료)',
        isSignature: true,
        badge: 'BEST RTD',
        temperature: 'ICE',
        description: '자연 발효 호주 프리미엄 자몽 탄산음료 (인기 1위)',
        imageUrl: '/images/menu/pluscafe/menu_pc_24.png',
      },
      {
        id: 'menu_pc_25',
        name: '분다버그 진저비어 (375ml)',
        price: 4500,
        iconName: '🍺',
        categoryName: 'RTD (병음료)',
        badge: '추천',
        temperature: 'ICE',
        description: '호주산 생강과 사탕수수를 발효시킨 전통 무알콜 탄산음료',
        imageUrl: '/images/menu/pluscafe/menu_pc_25.png',
      },
      {
        id: 'menu_pc_26',
        name: '페리에 탄산수 플레인 (330ml)',
        price: 3500,
        iconName: '🫧',
        categoryName: 'RTD (병음료)',
        temperature: 'ICE',
        description: '프랑스 남부 베르게즈 천연 미네랄 탄산수',
        imageUrl: '/images/menu/pluscafe/menu_pc_26.png',
      },
      {
        id: 'menu_pc_27',
        name: '페리에 탄산수 라임 (330ml)',
        price: 3500,
        iconName: '🍋',
        categoryName: 'RTD (병음료)',
        temperature: 'ICE',
        description: '천연 라임향이 더해진 프랑스 프리미엄 탄산수',
        imageUrl: '/images/menu/pluscafe/menu_pc_27.png',
      },
      {
        id: 'menu_pc_28',
        name: '골든메달 애플주스 (296ml)',
        price: 4000,
        iconName: '🍎',
        categoryName: 'RTD (병음료)',
        badge: '인기',
        temperature: 'ICE',
        description: '150년 전통 미국산 최고급 사과 100% 무가당 착즙 주스',
        imageUrl: '/images/menu/pluscafe/menu_pc_28.png',
      },
      {
        id: 'menu_pc_29',
        name: '노아 착즙주스 오렌지 (260ml)',
        price: 5000,
        iconName: '🍊',
        categoryName: 'RTD (병음료)',
        temperature: 'ICE',
        description: '호주산 발렌시아 오렌지 물 한방울 넣지 않은 생착즙 주스',
        imageUrl: '/images/menu/pluscafe/menu_pc_29.png',
      },
      {
        id: 'menu_pc_30',
        name: '에비앙 천연광천수 (500ml)',
        price: 2000,
        iconName: '💧',
        categoryName: 'RTD (병음료)',
        temperature: 'ICE',
        description: '프랑스 알프스 청정 빙하 퇴적층 천연 미네랄 생수',
        imageUrl: '/images/menu/pluscafe/menu_pc_30.png',
      },

      // 5. 베이커리 & 디저트
      {
        id: 'menu_pc_31',
        name: '플레인 베이글 & 크림치즈',
        price: 4200,
        iconName: '🥯',
        categoryName: '베이커리 & 디저트',
        isSignature: true,
        badge: '인기',
        temperature: 'HOT',
        description: '따뜻하게 토스팅한 쫄깃한 베이글과 필라델피아 크림치즈',
        imageUrl: '/images/menu/pluscafe/menu_pc_31.png',
      },
      {
        id: 'menu_pc_32',
        name: '버터 크로플',
        price: 3800,
        iconName: '🧇',
        categoryName: '베이커리 & 디저트',
        badge: '추천',
        temperature: 'HOT',
        description: '프랑스산 고메버터 크루아상 생지를 즉석에서 와플기로 구운 디저트',
        imageUrl: '/images/menu/pluscafe/menu_pc_32.png',
      },
      {
        id: 'menu_pc_33',
        name: '바질 토마토 치즈 치아바타',
        price: 6500,
        iconName: '🥪',
        categoryName: '베이커리 & 디저트',
        temperature: 'HOT',
        description: '올리브 치아바타에 향긋한 바질 페스토와 생토마토 모짜렐라',
        imageUrl: '/images/menu/pluscafe/menu_pc_33.png',
      },
      {
        id: 'menu_pc_34',
        name: '햄 & 에멘탈 치즈 샌드위치',
        price: 6500,
        iconName: '🥪',
        categoryName: '베이커리 & 디저트',
        temperature: 'HOT',
        description: '담백한 빵에 본레스 햄과 고소한 에멘탈 치즈의 조화',
        imageUrl: '/images/menu/pluscafe/menu_pc_34.png',
      },
      {
        id: 'menu_pc_35',
        name: '초콜릿 청크 수제 쿠키',
        price: 2800,
        iconName: '🍪',
        categoryName: '베이커리 & 디저트',
        temperature: 'BOTH',
        description: '다크 초콜릿 청크가 듬뿍 박힌 겉바속촉 수제 아메리칸 쿠키',
        imageUrl: '/images/menu/pluscafe/menu_pc_35.png',
      },
    ],
  },
  {
    id: 'sys_store_yeouido_jinjin',
    name: '여의도 진진만두국 (직장인 점심)',
    partnerBrand: '여의도 대표 노포 맛집',
    category: 'LUNCH',
    categoryLabel: '점심식사 / 한식',
    locationMemo: '여의도역 5번 출구 인근 (도보 3분)',
    themeColor: '#B91C1C',
    isPresetDefault: false,
    updatedAt: '2026-10-21',
    menuCategories: ['대표 식사', '곁들임/전류'],
    menus: [
      { id: 'menu_jj_01', name: '손만두 떡국', price: 13000,
        iconName: '🥟', categoryName: '대표 식사', isSignature: true, badge: '대표' },
      { id: 'menu_jj_02', name: '칼만두국', price: 13000,
        iconName: '🥟', categoryName: '대표 식사', badge: '인기' },
      { id: 'menu_jj_03', name: '접시만두 (6알)', price: 12000,
        iconName: '🍲', categoryName: '곁들임/전류', isSignature: true },
      { id: 'menu_jj_04', name: '부추전', price: 15000,
        iconName: '🥞', categoryName: '곁들임/전류' },
      { id: 'menu_jj_05', name: '어복쟁반 (중)', price: 68000,
        iconName: '🥟', categoryName: '대표 식사', badge: '회식추천' },
    ],
  },
  {
    id: 'sys_store_salady_yeouido',
    name: '샐러디 여의도역점',
    partnerBrand: 'Salady® Fresh Everyday',
    category: 'LUNCH',
    categoryLabel: '샐러드 / 웜볼 / 건강식',
    locationMemo: '여의도역 지하상가 연결통로 (도보 2분)',
    themeColor: '#059669',
    isPresetDefault: false,
    updatedAt: '2026-10-21',
    menuCategories: ['시그니처 샐러디', '든든 웜볼', '간편 샌드/랩'],
    menus: [
      { id: 'menu_sal_01', name: '탄단지 샐러디', price: 8900,
        iconName: '🥗', categoryName: '시그니처 샐러디', isSignature: true, badge: 'BEST', description: '치킨, 고구마무스, 견과류와 크랜베리의 완벽한 영양 밸런스' },
      { id: 'menu_sal_02', name: '로스트닭다리살 샐러디', price: 10900,
        iconName: '🥗', categoryName: '시그니처 샐러디', badge: '인기', description: '육즙 가득 구워낸 부드러운 닭다리살' },
      { id: 'menu_sal_03', name: '칠리베이컨 웜볼', price: 8600,
        iconName: '🌯', categoryName: '든든 웜볼', isSignature: true, badge: 'BEST', description: '베이컨, 에그, 옥수수와 매콤달콤 크리미칠리 드레싱의 따뜻한 곡물볼' },
      { id: 'menu_sal_04', name: '우삼겹 웜볼', price: 9300,
        iconName: '🥗', categoryName: '든든 웜볼', badge: '든든', description: '달콤 짭조름한 우삼겹과 오리엔탈 드레싱' },
      { id: 'menu_sal_05', name: '멕시칸 랩', price: 7200,
        iconName: '🌯', categoryName: '간편 샌드/랩', badge: '간편', description: '그라운드비프, 나쵸칩의 바삭한 식감' },
      { id: 'menu_sal_06', name: '바질치킨 웜랩', price: 7900, categoryName: '간편 샌드/랩', description: '향긋한 바질페스토와 담백한 닭가슴살' },
      { id: 'menu_sal_07', name: '착즙주스 (그린밀싹/옐로우)', price: 4500, categoryName: '시그니처 샐러디', description: '100% 무가당 신선 과채 착즙 주스' },
    ],
  },
  {
    id: 'sys_store_ssada_gimbap',
    name: '싸다김밥 여의도역점',
    partnerBrand: '싸다김밥 프리미엄 분식',
    category: 'SNACK',
    categoryLabel: '분식 / 간편식 / 김밥',
    locationMemo: '여의도 백화점 1층 인근',
    themeColor: '#EA580C',
    isPresetDefault: false,
    updatedAt: '2026-10-21',
    menuCategories: ['김밥류', '분식/떡볶이류', '식사/면류'],
    menus: [
      { id: 'menu_sd_01', name: '싸다김밥 (기본)', price: 4000, categoryName: '김밥류', isSignature: true, badge: '기본' },
      { id: 'menu_sd_02', name: '참치샐러드김밥', price: 5500, categoryName: '김밥류', badge: '인기' },
      { id: 'menu_sd_03', name: '매운오징어김밥', price: 5500, categoryName: '김밥류', badge: '매콤' },
      { id: 'menu_sd_04', name: '국물떡볶이 (치즈추가)', price: 7500, categoryName: '분식/떡볶이류', isSignature: true, badge: 'BEST' },
      { id: 'menu_sd_05', name: '모둠튀김 (5종)', price: 6000, categoryName: '분식/떡볶이류' },
      { id: 'menu_sd_06', name: '치즈돈까스', price: 9500, categoryName: '식사/면류', badge: '든든' },
      { id: 'menu_sd_07', name: '얼큰해장라면', price: 5000, categoryName: '식사/면류' },
    ],
  },
];

// 로컬 스토리지 헬퍼 함수
const LOCAL_STORAGE_KEY_USER_STORES = 'moabogo_user_stores_v1';

export interface UserStorePreference {
  selectedStoreId: string;
  myStoreIds: string[];
}

export function loadUserStorePreference(): UserStorePreference {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USER_STORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.myStoreIds)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user stores:', err);
  }
  // 기본값: PLUS CAFE 45층과 진진만두국이 기본 내 단골 매장으로 등록
  return {
    selectedStoreId: 'sys_store_pluscafe_45f',
    myStoreIds: ['sys_store_pluscafe_45f', 'sys_store_yeouido_jinjin'],
  };
}

export function saveUserStorePreference(pref: UserStorePreference): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER_STORES, JSON.stringify(pref));
  } catch (err) {
    console.error('Failed to save user stores:', err);
  }
}

// 시스템 백오피스(/system)와 사용자 환경설정(SCR-SET-01) 간 동적 매장 풀 공급 헬퍼
export function getSystemStorePool(): StorePreset[] {
  try {
    const raw = localStorage.getItem('moabogo_system_stores_pool');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // PLUS CAFE 45층에 RTD 카테고리가 없는 구버전 스토리지 데이터 자동 현행화 (RTD 7종 포함 35종)
        const plusStore = parsed.find((s: StorePreset) => s.id === 'sys_store_pluscafe_45f');
        if (plusStore && (!plusStore.menuCategories.some((c: string) => c.includes('RTD')) || plusStore.menus.length < 35 || !plusStore.menus[0]?.imageUrl?.startsWith('/images/menu/pluscafe/'))) {
          const defaultPlus = SYSTEM_STORE_POOL.find((s) => s.id === 'sys_store_pluscafe_45f');
          if (defaultPlus) {
            plusStore.menuCategories = defaultPlus.menuCategories;
            plusStore.menus = defaultPlus.menus;
            localStorage.setItem('moabogo_system_stores_pool', JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load system store pool:', err);
  }
  return SYSTEM_STORE_POOL;
}

/* =========================================================================
   사용자 맞춤 개인화 프리셋 및 개인 매장 스토리지 헬퍼 (User Personalization)
   ========================================================================= */

export const STORAGE_KEY_USER_CUSTOM_STORES = 'moabogo_user_custom_stores_v1';
export const STORAGE_KEY_USER_PERSONAL_LADDER = 'moabogo_user_personal_ladder_presets_v1';
export const STORAGE_KEY_USER_PERSONAL_ROULETTE = 'moabogo_user_personal_roulette_presets_v1';

export interface UserLadderPreset extends LadderGoalPreset {
  isCustomCreated?: boolean; // 사용자가 직접 수동 등록했는지 여부
  importedFromSystemId?: string; // 시스템 기초 프리셋에서 복제된 경우 원본 ID
  createdAt: string;
  sourceType?: 'DIRECT' | 'GOAL' | 'DUTY';
  sourceId?: string;
  sourceName?: string;
  originalMemberCount?: number;
  originalMembers?: string[];
}

export interface UserRoulettePreset extends RoulettePreset {
  isCustomCreated?: boolean; // 사용자가 직접 수동 등록했는지 여부
  importedFromSystemId?: string; // 시스템 기초 프리셋에서 복제된 경우 원본 ID
  createdAt: string;
  sourceType?: 'DIRECT' | 'GOAL' | 'DUTY';
  sourceId?: string;
  sourceName?: string;
  originalMemberCount?: number;
  originalMembers?: string[];
}

export interface PresetSourceSyncStatus {
  hasChanged: boolean;
  currentCount: number;
  originalCount: number;
  sourceTitle: string;
  currentMembers: string[];
}

export function checkPresetSourceSyncStatus(
  preset: UserLadderPreset | UserRoulettePreset
): PresetSourceSyncStatus {
  if (!preset.sourceType || preset.sourceType === 'DIRECT' || !preset.sourceId) {
    return { hasChanged: false, currentCount: 0, originalCount: 0, sourceTitle: '', currentMembers: [] };
  }

  const originalCount = preset.originalMemberCount || 0;

  if (preset.sourceType === 'GOAL') {
    const goal = INITIAL_GOAL_LIST.find((g) => g.id === preset.sourceId);
    if (!goal) {
      return { hasChanged: false, currentCount: originalCount, originalCount, sourceTitle: preset.sourceName || '', currentMembers: [] };
    }
    const currentMembers = goal.companions.map((c) => c.name);
    const hasChanged =
      currentMembers.length !== originalCount ||
      (preset.originalMembers ? currentMembers.some((m, idx) => m !== preset.originalMembers?.[idx]) : false);
    return {
      hasChanged,
      currentCount: currentMembers.length,
      originalCount,
      sourceTitle: goal.title,
      currentMembers,
    };
  }

  if (preset.sourceType === 'DUTY') {
    const duty = INITIAL_DUTIES.find((d) => d.duty_id === preset.sourceId);
    if (!duty) {
      return { hasChanged: false, currentCount: originalCount, originalCount, sourceTitle: preset.sourceName || '', currentMembers: [] };
    }
    const currentMembers = duty.participants.map((p) => p.name);
    const hasChanged =
      currentMembers.length !== originalCount ||
      (preset.originalMembers ? currentMembers.some((m, idx) => m !== preset.originalMembers?.[idx]) : false);
    return {
      hasChanged,
      currentCount: currentMembers.length,
      originalCount,
      sourceTitle: duty.duty_title,
      currentMembers,
    };
  }

  return { hasChanged: false, currentCount: originalCount, originalCount, sourceTitle: '', currentMembers: [] };
}

// 1. 사용자 수동 등록 매장 로드/저장
export function loadUserCustomStores(): StorePreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_CUSTOM_STORES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user custom stores:', err);
  }
  return [];
}

export function saveUserCustomStores(stores: StorePreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_CUSTOM_STORES, JSON.stringify(stores));
  } catch (err) {
    console.error('Failed to save user custom stores:', err);
  }
}

// 전체 매장 풀 (시스템 매장 + 사용자 수동 등록 매장 통합)
export function getAllAvailableStorePool(): StorePreset[] {
  const systemStores = getSystemStorePool();
  const customStores = loadUserCustomStores();
  return [...systemStores, ...customStores];
}

// 2. 사용자 개인 사다리 프리셋 로드/저장
export function loadUserPersonalLadderPresets(): UserLadderPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_PERSONAL_LADDER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user personal ladder presets:', err);
  }
  return [];
}

export function saveUserPersonalLadderPresets(presets: UserLadderPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_PERSONAL_LADDER, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save user personal ladder presets:', err);
  }
}

// 3. 사용자 개인 룰렛 프리셋 로드/저장
export function loadUserPersonalRoulettePresets(): UserRoulettePreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_PERSONAL_ROULETTE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load user personal roulette presets:', err);
  }
  return [];
}

export function saveUserPersonalRoulettePresets(presets: UserRoulettePreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_PERSONAL_ROULETTE, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save user personal roulette presets:', err);
  }
}

// 4. 시스템 기초 프리셋 -> 사용자 개인 프리셋 일괄 복제 (Deep Copy)
export function copySystemLadderPresetsToUser(
  systemPresets: LadderGoalPreset[],
  targetSystemIds: string[]
): UserLadderPreset[] {
  const current = loadUserPersonalLadderPresets();
  const newItems: UserLadderPreset[] = [];

  for (const sysId of targetSystemIds) {
    const found = systemPresets.find((p) => p.id === sysId);
    if (!found) continue;

    // 이미 같은 시스템 ID로부터 복제한 것이 있더라도 고유 새 ID로 복제
    const copied: UserLadderPreset = {
      ...JSON.parse(JSON.stringify(found)),
      id: `user_lad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      importedFromSystemId: found.id,
      isCustomCreated: false,
      createdAt: new Date().toISOString(),
    };
    newItems.push(copied);
  }

  const updated = [...current, ...newItems];
  saveUserPersonalLadderPresets(updated);
  return updated;
}

export function copySystemRoulettePresetsToUser(
  systemPresets: RoulettePreset[],
  targetSystemIds: string[]
): UserRoulettePreset[] {
  const current = loadUserPersonalRoulettePresets();
  const newItems: UserRoulettePreset[] = [];

  for (const sysId of targetSystemIds) {
    const found = systemPresets.find((p) => p.id === sysId);
    if (!found) continue;

    const copied: UserRoulettePreset = {
      ...JSON.parse(JSON.stringify(found)),
      id: `user_rou_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      importedFromSystemId: found.id,
      isCustomCreated: false,
      createdAt: new Date().toISOString(),
    };
    newItems.push(copied);
  }

  const updated = [...current, ...newItems];
  saveUserPersonalRoulettePresets(updated);
  return updated;
}

// 5. 엑셀/CSV 매장 템플릿 다운로드 및 파싱
export function downloadStoreExcelTemplate(): void {
  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    '매장명,브랜드/운영사,카테고리(CAFE/LUNCH/DINNER/SNACK),위치메모,대표테마색상(#HEX),메뉴목록(이름:가격:카테고리:대표여부)\n' +
    '을지로 직장인커피,을지로빈스,CAFE,을지로입구역 2번출구 지하 1층,#006241,아메리카노:4500:커피:Y|카페라떼:5000:커피:N|바닐라라떼:5500:커피:N\n' +
    '여의도 불꽃분식,불꽃푸드,SNACK,여의도백화점 지하 1층,#EA580C,불꽃떡볶이:4500:분식:Y|순대:4000:분식:N|모둠튀김:5000:분식:N\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'moabogo_store_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseStoreCsvData(csvText: string): { success: boolean; stores: StorePreset[]; error?: string } {
  try {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { success: false, stores: [], error: '데이터 행이 비어있습니다. 샘플 서식을 참고해주세요.' };
    }

    const stores: StorePreset[] = [];
    // 첫번째 행(헤더) 제외
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');
      if (cols.length < 4) continue;

      const name = cols[0]?.trim();
      const partnerBrand = cols[1]?.trim() || '';
      const category = (cols[2]?.trim() || 'CUSTOM') as StoreCategoryType;
      const locationMemo = cols[3]?.trim() || '';
      const themeColor = cols[4]?.trim() || '#3B82F6';
      const menuRaw = cols[5]?.trim() || '';

      if (!name) continue;

      const menus: StoreMenuItem[] = [];
      const menuCats = new Set<string>();

      if (menuRaw) {
        const menuParts = menuRaw.split('|');
        menuParts.forEach((part, idx) => {
          const [mName, mPrice, mCat, mSig] = part.split(':').map((s) => s.trim());
          if (mName) {
            const catName = mCat || '대표메뉴';
            menuCats.add(catName);
            menus.push({
              id: `m_csv_${Date.now()}_${idx}`,
              name: mName,
              price: parseInt(mPrice, 10) || 0,
              categoryName: catName,
              isSignature: mSig?.toUpperCase() === 'Y',
            });
          }
        });
      }

      stores.push({
        id: `usr_store_${Date.now()}_${i}`,
        name,
        partnerBrand,
        category,
        categoryLabel:
          category === 'CAFE'
            ? '카페/음료'
            : category === 'LUNCH'
            ? '점심식사'
            : category === 'DINNER'
            ? '저녁/회식'
            : category === 'SNACK'
            ? '간식/분식'
            : '맞춤매장',
        locationMemo,
        themeColor,
        menuCategories: menuCats.size > 0 ? Array.from(menuCats) : ['대표메뉴'],
        menus,
        isPresetDefault: false,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    }

    if (stores.length === 0) {
      return { success: false, stores: [], error: '유효한 매장 행을 찾을 수 없습니다.' };
    }

    return { success: true, stores };
  } catch (err: any) {
    return { success: false, stores: [], error: `파싱 중 오류가 발생했습니다: ${err.message}` };
  }
}

// 6. 등록된 매장 및 메뉴 정보를 엑셀(CSV)로 내보내기 다운로드
export function exportUserStoresToCsv(stores: StorePreset[]): void {
  let csv = '\uFEFF' + '매장명,브랜드/운영사,카테고리(CAFE/LUNCH/DINNER/SNACK),위치메모,대표테마색상(#HEX),메뉴목록(이름:가격:카테고리:대표여부)\n';

  for (const s of stores) {
    const menuStr = s.menus
      .map((m) => `${m.name}:${m.price}:${m.categoryName || '대표'}:${m.isSignature ? 'Y' : 'N'}`)
      .join('|');
    csv += `"${s.name}","${s.partnerBrand || ''}","${s.category}","${s.locationMemo || ''}","${s.themeColor || '#006241'}","${menuStr}"\n`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `moabogo_stores_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}




