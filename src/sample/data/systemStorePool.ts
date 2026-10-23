// 모아보고 시스템 매장 풀 (System Store Pool) 및 사다리 역할 프리셋
// SSOT: docs/04.데이터 / SCR-SET-01 & SCR-GNT-01 공유 데이터

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
    description: '1명 결제 독박, 2명 픽업 심부름, 2명 생존',
    roles: [
      { label: '💳 오늘 커피 결제 (독박)', type: 'PAY', color: 'rose', badgeText: '당첨' },
      { label: '🏃 커피 픽업 심부름', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
      { label: '🏃 커피 픽업 심부름', type: 'PICKUP', color: 'amber', badgeText: '심부름' },
      { label: '🎉 축 통과 (생존)', type: 'PASS', color: 'emerald', badgeText: '면제' },
      { label: '🎉 축 통과 (생존)', type: 'PASS', color: 'emerald', badgeText: '면제' },
    ],
  },
  {
    id: 'preset_lunch_duty',
    category: 'LUNCH',
    title: '🍱 점심식사 뒷정리 & 수저 세팅 내기',
    description: '수저 세팅, 테이블 정리, 영수증 챙기기 역할 분담',
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
    title: '🎯 단 1명만 결제하기 (1인 독박 모드)',
    description: '1명만 결제하고 나머지는 모두 통과하는 긴장감 넘치는 모드',
    roles: [
      { label: '💳 전체 전액 결제', type: 'PAY', color: 'rose', badgeText: '독박' },
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
      { id: 'r_item_1', name: '김치찌개 / 제육볶음 (한식)', icon: '🍲', weight: 1 },
      { id: 'r_item_2', name: '돈까스 / 일식 라멘', icon: '🍛', weight: 1 },
      { id: 'r_item_3', name: '짜장면 / 짬뽕 (중식)', icon: '🍜', weight: 1 },
      { id: 'r_item_4', name: '파스타 / 버거 (양식)', icon: '🍔', weight: 1 },
      { id: 'r_item_5', name: '샐러드 / 샌드위치 (가볍게)', icon: '🥗', weight: 1 },
      { id: 'r_item_6', name: '떡볶이 / 튀김 (분식)', icon: '🍢', weight: 1 },
    ],
  },
  {
    id: 'roulette_preset_duty',
    category: 'DUTY',
    title: '🧹 오늘 당번 & 청소 정하기',
    description: '회의실, 탕비실, 분리수거 등 공정한 당번 배정',
    icon: '🧹',
    items: [
      { id: 'r_duty_1', name: '회의실 정리 & 화이트보드 지우기', icon: '📝', weight: 1 },
      { id: 'r_duty_2', name: '탕비실 싱크대 정리 & 컵 씻기', icon: '☕', weight: 1 },
      { id: 'r_duty_3', name: '재활용 분리수거 배출', icon: '♻️', weight: 1 },
      { id: 'r_duty_4', name: '간식 & 원두 채워넣기', icon: '🍪', weight: 1 },
      { id: 'r_duty_5', name: '저녁 퇴근 시 환기 & 소등 점검', icon: '💡', weight: 1 },
    ],
  },
  {
    id: 'roulette_preset_penalty',
    category: 'PENALTY',
    title: '🎯 흥미진진한 벌칙 룰렛',
    description: '모임 분위기를 띄우는 가벼운 미션 & 벌칙',
    icon: '🎯',
    items: [
      { id: 'r_pen_1', name: '다음 회식/모임 커피 쏘기', icon: '☕', weight: 1 },
      { id: 'r_pen_2', name: '시원한 아이스크림 사오기', icon: '🍦', weight: 1 },
      { id: 'r_pen_3', name: '팀원 전원에게 진심 어린 칭찬 1마디', icon: '💖', weight: 1 },
      { id: 'r_pen_4', name: '단체방에 셀카 투척', icon: '📸', weight: 1 },
      { id: 'r_pen_5', name: '노래 1소절 부르기', icon: '🎤', weight: 1 },
      { id: 'r_pen_6', name: '🎉 축 통과! (벌칙 면제)', icon: '🍀', weight: 1 },
    ],
  },
  {
    id: 'roulette_preset_coffee',
    category: 'COFFEE',
    title: '☕ 커피 쏘기 독박 & 픽업 내기',
    description: '결제자 1명, 픽업자 1명, 면제자 선정',
    icon: '☕',
    items: [
      { id: 'r_cof_1', name: '💳 오늘 커피 전액 결제 (독박)', icon: '💳', weight: 1 },
      { id: 'r_cof_2', name: '🏃 카페 다녀오기 (픽업 심부름)', icon: '🏃', weight: 1 },
      { id: 'r_cof_3', name: '🎉 축 통과 (편안한 휴식)', icon: '🎉', weight: 1 },
      { id: 'r_cof_4', name: '🎉 축 통과 (편안한 휴식)', icon: '🎉', weight: 1 },
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
      '에스프레소 & 커피',
      '콜드브루 & 디카페인',
      '티 & 프리미엄 블렌딩',
      '논커피 라떼 & 초콜릿',
      '에이드 & 생과일주스',
      '베이커리 & 샌드위치',
    ],
    menus: [
      // 1. 에스프레소 & 커피
      {
        id: 'menu_pc_01',
        name: '카페 아메리카노 (HOT)',
        price: 4500,
        categoryName: '에스프레소 & 커피',
        isSignature: true,
        badge: 'BEST',
        temperature: 'HOT',
        description: 'WPS 스타벅스 에스프레소 원두의 깊고 진한 풍미',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_02',
        name: '카페 아메리카노 (ICE)',
        price: 4500,
        categoryName: '에스프레소 & 커피',
        isSignature: true,
        badge: 'BEST',
        temperature: 'ICE',
        description: '얼음 가득 깔끔하고 시원한 부동의 1위 메뉴',
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_03',
        name: '에스프레소 (HOT)',
        price: 3500,
        categoryName: '에스프레소 & 커피',
        temperature: 'HOT',
        description: '농밀한 크레마와 바디감의 정통 에스프레소 더블샷',
        imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_04',
        name: '카페 라떼 (HOT/ICE)',
        price: 5000,
        categoryName: '에스프레소 & 커피',
        isSignature: true,
        badge: '인기',
        temperature: 'BOTH',
        description: '부드러운 스팀우유와 에스프레소의 고소한 조화',
        imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_05',
        name: '바닐라 빈 라떼 (HOT/ICE)',
        price: 5500,
        categoryName: '에스프레소 & 커피',
        badge: '추천',
        temperature: 'BOTH',
        description: '천연 바닐라빈 시럽이 은은하게 퍼지는 달콤함',
        imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_06',
        name: '카라멜 마키아또 (HOT/ICE)',
        price: 5800,
        categoryName: '에스프레소 & 커피',
        temperature: 'BOTH',
        description: '달콤한 바닐라 시럽, 벨벳 우유 거품, 진한 카라멜 드리즐',
        imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_07',
        name: '카푸치노 (HOT)',
        price: 5000,
        categoryName: '에스프레소 & 커피',
        temperature: 'HOT',
        description: '풍성하고 벨벳 같은 우유 거품과 향긋한 시나몬 파우더',
      },
      {
        id: 'menu_pc_08',
        name: '헤이즐넛 아메리카노 (ICE)',
        price: 4800,
        categoryName: '에스프레소 & 커피',
        temperature: 'ICE',
        description: '고소한 헤이즐넛 시럽 향이 어우러진 달콤 아메리카노',
      },
      {
        id: 'menu_pc_09',
        name: '카페 모카 (HOT/ICE)',
        price: 5500,
        categoryName: '에스프레소 & 커피',
        temperature: 'BOTH',
        description: '달콤 쌉싸름한 다크 초콜릿 모카 시럽과 휘핑크림',
      },

      // 2. 콜드브루 & 디카페인
      {
        id: 'menu_pc_10',
        name: '콜드브루 (ICE)',
        price: 4800,
        categoryName: '콜드브루 & 디카페인',
        isSignature: true,
        badge: 'BEST',
        temperature: 'ICE',
        description: '장시간 저온 추출하여 깔끔하고 초콜릿 풍미가 감도는 커피',
        imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_11',
        name: '돌체 콜드브루 (ICE)',
        price: 5800,
        categoryName: '콜드브루 & 디카페인',
        badge: '인기',
        temperature: 'ICE',
        description: '부드러운 연유 돌체 시럽과 콜드브루의 깔끔한 만남',
        imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_12',
        name: '디카페인 아메리카노 (ICE)',
        price: 4800,
        categoryName: '콜드브루 & 디카페인',
        temperature: 'ICE',
        description: '카페인 부담 없이 가볍게 즐기는 100% 디카페인 원두',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_13',
        name: '디카페인 카페 라떼 (HOT/ICE)',
        price: 5300,
        categoryName: '콜드브루 & 디카페인',
        temperature: 'BOTH',
        description: '늦은 오후에도 부담 없는 편안하고 고소한 디카페인 라떼',
        imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=200&auto=format&fit=crop&q=80',
      },

      // 3. 티 & 프리미엄 블렌딩
      {
        id: 'menu_pc_14',
        name: '자몽 허니 블랙티 (HOT/ICE)',
        price: 5700,
        categoryName: '티 & 프리미엄 블렌딩',
        isSignature: true,
        badge: 'BEST',
        temperature: 'BOTH',
        description: '상큼한 생자몽 퓨레와 달콤한 아카시아 꿀, 블랙티의 완벽한 밸런스',
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_15',
        name: '유자 민트 티 (HOT/ICE)',
        price: 5300,
        categoryName: '티 & 프리미엄 블렌딩',
        badge: '상큼',
        temperature: 'BOTH',
        description: '달콤한 고흥 유자청과 시원하고 청량한 스피아민트 허브',
        imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_16',
        name: '캐모마일 릴렉서 (ICE)',
        price: 5800,
        categoryName: '티 & 프리미엄 블렌딩',
        badge: '인기',
        temperature: 'ICE',
        description: '리치와 레몬그라스, 캐모마일이 주는 힐링 블렌딩 음료',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'menu_pc_17',
        name: '얼그레이 프렌치 블루 티 (HOT)',
        price: 4500,
        categoryName: '티 & 프리미엄 블렌딩',
        temperature: 'HOT',
        description: '천연 베르가못 향과 수레국화 꽃잎의 귀족적인 향기',
      },
      {
        id: 'menu_pc_18',
        name: '페퍼민트 허브티 (HOT/ICE)',
        price: 4500,
        categoryName: '티 & 프리미엄 블렌딩',
        temperature: 'BOTH',
        description: '멘톨의 상쾌함으로 입안을 개운하게 해주는 무카페인 허브티',
      },

      // 4. 논커피 라떼 & 초콜릿
      {
        id: 'menu_pc_19',
        name: '제주 유기농 말차 라떼 (HOT/ICE)',
        price: 6100,
        categoryName: '논커피 라떼 & 초콜릿',
        isSignature: true,
        badge: '시그니처',
        temperature: 'BOTH',
        description: '차광 재배한 제주 어린 찻잎으로 만든 깊고 진한 프리미엄 말차',
      },
      {
        id: 'menu_pc_20',
        name: '딸기 듬뿍 라떼 (ICE)',
        price: 5900,
        categoryName: '논커피 라떼 & 초콜릿',
        badge: '인기',
        temperature: 'ICE',
        description: '국내산 생딸기 과육이 씹히는 달콤하고 부드러운 우유 음료',
      },
      {
        id: 'menu_pc_21',
        name: '리얼 초콜릿 라떼 (HOT/ICE)',
        price: 5500,
        categoryName: '논커피 라떼 & 초콜릿',
        temperature: 'BOTH',
        description: '벨기에산 진한 다크 초콜릿을 직접 녹여낸 극강의 달콤함',
      },
      {
        id: 'menu_pc_22',
        name: '토피넛 라떼 (HOT/ICE)',
        price: 5800,
        categoryName: '논커피 라떼 & 초콜릿',
        badge: '시즌',
        temperature: 'BOTH',
        description: '버터의 고소함과 구운 견과류 향이 입안 가득 맴도는 라떼',
      },
      {
        id: 'menu_pc_23',
        name: '로얄 밀크티 (HOT/ICE)',
        price: 5500,
        categoryName: '논커피 라떼 & 초콜릿',
        temperature: 'BOTH',
        description: '진한 아쌈 홍차를 찻잎째 끓여 우려낸 진한 밀크티',
      },

      // 5. 에이드 & 생과일주스
      {
        id: 'menu_pc_24',
        name: '생자몽 에이드 (ICE)',
        price: 5800,
        categoryName: '에이드 & 생과일주스',
        isSignature: true,
        badge: 'BEST',
        temperature: 'ICE',
        description: '생자몽을 통째로 착즙하여 탄산수와 블렌딩한 톡 쏘는 청량감',
      },
      {
        id: 'menu_pc_25',
        name: '청포도 라임 에이드 (ICE)',
        price: 5500,
        categoryName: '에이드 & 생과일주스',
        temperature: 'ICE',
        description: '달콤한 청포도 알갱이와 라임 주스의 상큼한 만남',
      },
      {
        id: 'menu_pc_26',
        name: '토마토 생과일 주스 (ICE)',
        price: 5500,
        categoryName: '에이드 & 생과일주스',
        badge: '건강',
        temperature: 'ICE',
        description: '신선한 완숙 토마토를 즉석에서 곱게 갈아 넣은 건강 주스',
      },
      {
        id: 'menu_pc_27',
        name: '망고 바나나 블렌디드 (ICE)',
        price: 6200,
        categoryName: '에이드 & 생과일주스',
        badge: '추천',
        temperature: 'ICE',
        description: '달콤한 애플망고와 생바나나 1개를 통째로 갈아 든든한 한 끼',
      },

      // 6. 베이커리 & 샌드위치
      {
        id: 'menu_pc_28',
        name: '버터 크로플',
        price: 3800,
        categoryName: '베이커리 & 샌드위치',
        isSignature: true,
        badge: 'BEST',
        description: '프랑스산 고메버터 크루아상 생지를 와플기에 갓 구워낸 바삭함',
      },
      {
        id: 'menu_pc_29',
        name: '브라운 치즈 크로플',
        price: 4800,
        categoryName: '베이커리 & 샌드위치',
        badge: '단짠',
        description: '갓 구운 크로플 위에 노르웨이 브라운치즈를 산더미처럼 갈아 올림',
      },
      {
        id: 'menu_pc_30',
        name: '플레인 베이글 & 크림치즈',
        price: 4200,
        categoryName: '베이커리 & 샌드위치',
        description: '따뜻하게 토스팅한 쫄깃한 베이글과 필라델피아 크림치즈 포션',
      },
      {
        id: 'menu_pc_31',
        name: '햄 & 에멘탈 치즈 치아바타',
        price: 6500,
        categoryName: '베이커리 & 샌드위치',
        isSignature: true,
        badge: '식사대용',
        description: '담백한 올리브 치아바타에 고급 본레스햄과 고소한 에멘탈 치즈',
      },
      {
        id: 'menu_pc_32',
        name: '에그 마요 샐러드 샌드위치',
        price: 5800,
        categoryName: '베이커리 & 샌드위치',
        badge: '든든',
        description: '신선한 삶은 달걀과 파슬리가 듬뿍 들어간 클래식 샌드위치',
      },
      {
        id: 'menu_pc_33',
        name: '바스크 치즈 케이크 (조각)',
        price: 6500,
        categoryName: '베이커리 & 샌드위치',
        badge: '인기',
        description: '고온에서 그을려 캐러멜라이징된 스모키한 크림치즈의 깊은 맛',
      },
      {
        id: 'menu_pc_34',
        name: '수제 마카롱 (바닐라/초코)',
        price: 2800,
        categoryName: '베이커리 & 샌드위치',
        description: '쫀득한 꼬끄와 진한 가나슈 필링의 달콤한 디저트',
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
      { id: 'menu_jj_01', name: '손만두 떡국', price: 13000, categoryName: '대표 식사', isSignature: true, badge: '대표', imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_jj_02', name: '칼만두국', price: 13000, categoryName: '대표 식사', badge: '인기', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_jj_03', name: '접시만두 (6알)', price: 12000, categoryName: '곁들임/전류', isSignature: true, imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_jj_04', name: '부추전', price: 15000, categoryName: '곁들임/전류', imageUrl: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_jj_05', name: '어복쟁반 (중)', price: 68000, categoryName: '대표 식사', badge: '회식추천', imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=200&auto=format&fit=crop&q=80' },
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
      { id: 'menu_sal_01', name: '탄단지 샐러디', price: 8900, categoryName: '시그니처 샐러디', isSignature: true, badge: 'BEST', description: '치킨, 고구마무스, 견과류와 크랜베리의 완벽한 영양 밸런스', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sal_02', name: '로스트닭다리살 샐러디', price: 10900, categoryName: '시그니처 샐러디', badge: '인기', description: '육즙 가득 구워낸 부드러운 닭다리살', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sal_03', name: '칠리베이컨 웜볼', price: 8600, categoryName: '든든 웜볼', isSignature: true, badge: 'BEST', description: '베이컨, 에그, 옥수수와 매콤달콤 크리미칠리 드레싱의 따뜻한 곡물볼', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sal_04', name: '우삼겹 웜볼', price: 9300, categoryName: '든든 웜볼', badge: '든든', description: '달콤 짭조름한 우삼겹과 오리엔탈 드레싱', imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sal_05', name: '멕시칸 랩', price: 7200, categoryName: '간편 샌드/랩', badge: '간편', description: '그라운드비프, 나쵸칩의 바삭한 식감', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sal_06', name: '바질치킨 웜랩', price: 7900, categoryName: '간편 샌드/랩', description: '향긋한 바질페스토와 담백한 닭가슴살', imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sal_07', name: '착즙주스 (그린밀싹/옐로우)', price: 4500, categoryName: '시그니처 샐러디', description: '100% 무가당 신선 과채 착즙 주스', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200&auto=format&fit=crop&q=80' },
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
      { id: 'menu_sd_01', name: '싸다김밥 (기본)', price: 4000, categoryName: '김밥류', isSignature: true, badge: '기본', imageUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sd_02', name: '참치샐러드김밥', price: 5500, categoryName: '김밥류', badge: '인기', imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sd_03', name: '매운오징어김밥', price: 5500, categoryName: '김밥류', badge: '매콤', imageUrl: 'https://images.unsplash.com/photo-1617196034096-74dbb8a7f9a1?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sd_04', name: '국물떡볶이 (치즈추가)', price: 7500, categoryName: '분식/떡볶이류', isSignature: true, badge: 'BEST', imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sd_05', name: '모둠튀김 (5종)', price: 6000, categoryName: '분식/떡볶이류', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sd_06', name: '치즈돈까스', price: 9500, categoryName: '식사/면류', badge: '든든', imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&auto=format&fit=crop&q=80' },
      { id: 'menu_sd_07', name: '얼큰해장라면', price: 5000, categoryName: '식사/면류', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80' },
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

