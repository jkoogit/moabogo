// ==========================================
// 모아목표 (MoaGoal) 도메인 모델 및 샘플 데이터
// ==========================================

export type GoalCategory = 'HABIT' | 'FINANCE' | 'STUDY' | 'BOOK' | 'SAVING';
export type GoalRole = 'MANAGER' | 'PARTICIPANT' | 'VIEWER';
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

export interface GoalComment {
  id: string;
  author: string;
  role: GoalRole;
  text: string;
  createdAt: string;
}

export interface ExecutionRecord {
  id: string;
  goalId: string;
  companionId: string;
  companionName: string;
  isAllowanceTarget?: boolean; // 용돈 수령 대상자 여부 (자녀 등)
  allowanceAccount?: string; // 대표입금계좌 정보 (예: 토스뱅크 1000-***-***)
  date: string;
  valueText: string;
  memo: string;
  photoUrl?: string; // 실제 첨부된 이미지 데이터/URL
  hasPhoto?: boolean;
  cheerCount: number;
  userCheered: boolean;
  comments: GoalComment[];
}

export interface CompanionUser {
  id: string;
  name: string;
  isAllowanceTarget?: boolean;
  progress: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  currentValue: number;
  targetValue: number;
  achievementRate: number;
}

export interface ViewerUser {
  id: string;
  name: string;
  note: string;
}

export interface GoalItem {
  id: string;
  title: string;
  category: GoalCategory;
  categoryLabel: string;
  period: string; // e.g. "2026.10.01 ~ 2026.10.31"
  dDay: string; // e.g. "D-5"
  nextSchedule: string;
  myRole: GoalRole; // 내 역할: 'MANAGER' | 'PARTICIPANT' | 'VIEWER'
  status: GoalStatus;
  progressRate: number;
  targetValue: number;
  currentTotal: number;
  unit: string;
  fixedRule: string; // 고정 항목 (규칙/기준)
  inputRule: string; // 입력 항목 (수행 기록)
  companions: CompanionUser[];
  viewers: ViewerUser[];
  cheerCount: number;
  userCheered: boolean;
  comments: GoalComment[];
  records: ExecutionRecord[];
}

export const INITIAL_GOAL_LIST: GoalItem[] = [
  {
    id: 'goal-1',
    title: '가족 건강 1만보 걷기 챌린지',
    category: 'HABIT',
    categoryLabel: '생활습관 · 운동',
    period: '2026.10.01 ~ 2026.10.31',
    dDay: 'D-5',
    nextSchedule: '오늘 23:59까지 인증 마감',
    myRole: 'PARTICIPANT', // 나는 동행원
    status: 'IN_PROGRESS',
    progressRate: 78,
    targetValue: 10000,
    currentTotal: 7820,
    unit: '보',
    fixedRule: '일일 최소 10,000보 이상 걸음 수 인정 (만보기 앱 또는 웨어러블 캡처 필수)',
    inputRule: '당일 실제 걸음 수(숫자) & 컨디션 한줄 메모 & 인증 캡처 사진',
    companions: [
      {
        id: 'c1',
        name: '구본영(나)',
        progress: '10,240보 달성',
        status: 'COMPLETED',
        currentValue: 10240,
        targetValue: 10000,
        achievementRate: 102,
      },
      {
        id: 'c2',
        name: '김은지(배우자)',
        progress: '8,500보 수행중',
        status: 'IN_PROGRESS',
        currentValue: 8500,
        targetValue: 10000,
        achievementRate: 85,
      },
      {
        id: 'c3',
        name: '구민우(자녀)',
        isAllowanceTarget: true,
        progress: '4,200보 수행중',
        status: 'IN_PROGRESS',
        currentValue: 4200,
        targetValue: 10000,
        achievementRate: 42,
      },
    ],
    viewers: [
      { id: 'v1', name: '시어머니(할머니)', note: '손자 응원 및 매일 조회' },
      { id: 'v2', name: '외삼촌', note: '가족 건강 응원' },
    ],
    cheerCount: 24,
    userCheered: true,
    comments: [
      {
        id: 'cm1',
        author: '시어머니(할머니)',
        role: 'VIEWER',
        text: '민우야 오늘도 조금만 더 힘내서 만보 채우자꾸나! 화이팅!',
        createdAt: '10분 전',
      },
      {
        id: 'cm2',
        author: '구본영(나)',
        role: 'PARTICIPANT',
        text: '오늘 저녁 식사 후 다 같이 동네 산책 한 바퀴 돌면 100% 달성할 수 있습니다!',
        createdAt: '30분 전',
      },
    ],
    records: [
      {
        id: 'rec-1',
        goalId: 'goal-1',
        companionId: 'c3',
        companionName: '구민우(자녀)',
        isAllowanceTarget: true,
        allowanceAccount: '토스뱅크 1000-8821-3942 (구민우 용돈통장)',
        date: '2026.10.26',
        valueText: '10,050보 달성',
        memo: '축구 경기 뛰고 집 올 때 걸어서 만보 넘었어요!',
        hasPhoto: true,
        photoUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=80',
        cheerCount: 7,
        userCheered: true,
        comments: [
          {
            id: 'rc-1',
            author: '시어머니(할머니)',
            role: 'VIEWER',
            text: '기특하다 우리 손자! 할머니가 용돈 5천원 바로 보낸다~',
            createdAt: '2026.10.26 19:40',
          },
        ],
      },
      {
        id: 'rec-2',
        goalId: 'goal-1',
        companionId: 'c1',
        companionName: '구본영(나)',
        date: '2026.10.25',
        valueText: '11,100보 달성',
        memo: '퇴근길 3정거장 일찍 내려서 호수공원 경유 완주!',
        hasPhoto: true,
        cheerCount: 8,
        userCheered: false,
        comments: [],
      },
    ],
  },
  {
    id: 'goal-2',
    title: '2026 유럽 가족여행 1,000만원 모으기',
    category: 'FINANCE',
    categoryLabel: '정기적금 · 자산',
    period: '2026.01.01 ~ 2026.12.31',
    dDay: 'D-66',
    nextSchedule: '매주 월요일 20만원 자동 저축',
    myRole: 'MANAGER', // 나는 관리자 (개설자)
    status: 'IN_PROGRESS',
    progressRate: 65,
    targetValue: 10000000,
    currentTotal: 6500000,
    unit: '원',
    fixedRule: '주 1회 정기 적립 및 불필요 외식비 절감 (모아머니 연결 계좌 자동 이체)',
    inputRule: '주간 실제 저축액(원) & 절약 영수증 캡처 첨부',
    companions: [
      {
        id: 'c1',
        name: '구본영(나)',
        progress: '3,500,000원 납입',
        status: 'COMPLETED',
        currentValue: 3500000,
        targetValue: 5000000,
        achievementRate: 70,
      },
      {
        id: 'c2',
        name: '김은지(배우자)',
        progress: '3,000,000원 납입',
        status: 'COMPLETED',
        currentValue: 3000000,
        targetValue: 5000000,
        achievementRate: 60,
      },
    ],
    viewers: [{ id: 'v1', name: '시어머니(할머니)', note: '가족 여행 계획 응원' }],
    cheerCount: 42,
    userCheered: false, // 관리자는 응원 불가
    comments: [
      {
        id: 'cm3',
        author: '시어머니(할머니)',
        role: 'VIEWER',
        text: '내년에는 꼭 비행기 타고 알프스 보고 오자꾸나!',
        createdAt: '어제',
      },
    ],
    records: [
      {
        id: 'rec-3',
        goalId: 'goal-2',
        companionId: 'c1',
        companionName: '구본영(나)',
        date: '2026.10.20',
        valueText: '200,000원 저축 완료',
        memo: '배달음식 2회 참고 여행 통장으로 바로 송금!',
        hasPhoto: true,
        cheerCount: 12,
        userCheered: false,
        comments: [],
      },
    ],
  },
  {
    id: 'goal-3',
    title: '빅데이터 분석기사 실기 합격 챌린지',
    category: 'STUDY',
    categoryLabel: '자격증 · 학습',
    period: '2026.10.15 ~ 2026.11.30',
    dDay: 'D-29',
    nextSchedule: '실기 시험일: 2026.11.29 (토)',
    myRole: 'VIEWER', // 나는 관람원 (응원자)
    status: 'IN_PROGRESS',
    progressRate: 45,
    targetValue: 60,
    currentTotal: 27,
    unit: '시간',
    fixedRule: '주당 최소 10시간 이상 파이썬/R 머신러닝 실습 (깃허브 커밋 또는 강의 화면 인증)',
    inputRule: '학습 단원명, 풀이한 문제 수, 당일 실습 시간(숫자)',
    companions: [
      {
        id: 'c2',
        name: '김은지(배우자)',
        progress: '27시간 달성 (목표: 60시간)',
        status: 'IN_PROGRESS',
        currentValue: 27,
        targetValue: 60,
        achievementRate: 45,
      },
    ],
    viewers: [
      { id: 'v1', name: '구본영(나)', note: '주말 공부 지원 및 응원' },
      { id: 'v2', name: '구민우(자녀)', note: '엄마 열공 응원' },
    ],
    cheerCount: 19,
    userCheered: true,
    comments: [
      {
        id: 'cm4',
        author: '구본영(나)',
        role: 'VIEWER',
        text: '이번 주말 아이 돌보기는 제가 전담할 테니 편하게 도서관 다녀와요!',
        createdAt: '2일 전',
      },
    ],
    records: [
      {
        id: 'rec-4',
        goalId: 'goal-3',
        companionId: 'c2',
        companionName: '김은지(배우자)',
        date: '2026.10.25',
        valueText: '머신러닝 파이프라인 3시간 실습',
        memo: 'RandomForest & XGBoost 교차검증 모델링 완독',
        hasPhoto: true,
        cheerCount: 9,
        userCheered: true,
        comments: [],
      },
    ],
  },
  {
    id: 'goal-4',
    title: '매월 2권 완독 서평 쓰기',
    category: 'BOOK',
    categoryLabel: '도서 · 문화',
    period: '2026.10.01 ~ 2026.12.31',
    dDay: 'D-60',
    nextSchedule: '10월 2권 완독 마감 D-5',
    myRole: 'PARTICIPANT',
    status: 'IN_PROGRESS',
    progressRate: 50,
    targetValue: 6,
    currentTotal: 3,
    unit: '권',
    fixedRule: '완독 후 핵심 요약 서평 300자 이상 및 책 표지 사진 등록',
    inputRule: '도서명, 인상 깊은 문장, 서평 텍스트, 책 표지 사진',
    companions: [
      {
        id: 'c1',
        name: '구본영(나)',
        progress: '2권 완독',
        status: 'COMPLETED',
        currentValue: 2,
        targetValue: 2,
        achievementRate: 100,
      },
      {
        id: 'c3',
        name: '구민우(자녀)',
        isAllowanceTarget: true,
        progress: '1권 완독 (2권째 읽는 중)',
        status: 'IN_PROGRESS',
        currentValue: 1,
        targetValue: 2,
        achievementRate: 50,
      },
    ],
    viewers: [{ id: 'v1', name: '김은지(배우자)', note: '가족 독서 습관 응원' }],
    cheerCount: 15,
    userCheered: true,
    comments: [],
    records: [
      {
        id: 'rec-5',
        goalId: 'goal-4',
        companionId: 'c3',
        companionName: '구민우(자녀)',
        isAllowanceTarget: true,
        allowanceAccount: '토스뱅크 1000-8821-3942 (구민우 용돈통장)',
        date: '2026.10.22',
        valueText: '1권 완독',
        memo: '어린이 과학동아 완독하고 서평 썼어요!',
        hasPhoto: true,
        cheerCount: 5,
        userCheered: true,
        comments: [],
      },
    ],
  },
  {
    id: 'goal-5',
    title: '주말 외식비 30% 절약 챌린지',
    category: 'SAVING',
    categoryLabel: '소비절약 · 생활',
    period: '2026.10.01 ~ 2026.10.31',
    dDay: 'D-5',
    nextSchedule: '이번 주말 집밥 챌린지',
    myRole: 'MANAGER',
    status: 'COMPLETED',
    progressRate: 100,
    targetValue: 300000,
    currentTotal: 320000,
    unit: '원',
    fixedRule: '주말 배달 대신 집밥 요리 사진 인증 및 영수증 지출 0원 인증',
    inputRule: '절약한 예상 외식비(원) & 직접 만든 요리 사진 첨부',
    companions: [
      {
        id: 'c1',
        name: '구본영(나)',
        progress: '160,000원 절약',
        status: 'COMPLETED',
        currentValue: 160000,
        targetValue: 150000,
        achievementRate: 106,
      },
      {
        id: 'c2',
        name: '김은지(배우자)',
        progress: '160,000원 절약',
        status: 'COMPLETED',
        currentValue: 160000,
        targetValue: 150000,
        achievementRate: 106,
      },
    ],
    viewers: [],
    cheerCount: 30,
    userCheered: false,
    comments: [],
    records: [],
  },
];
