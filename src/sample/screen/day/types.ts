// ==========================================
// src/sample/screen/day/types.ts
// 모아데이 (MoaDay) 도메인 타입 정의 SSOT
// ==========================================

export type DayViewMode = 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';
export type ServiceType = 'LEDGER' | 'DUTY' | 'GOAL' | 'ROUTINE' | 'PERSONAL' | 'DIARY';
export type PanelPosition = 'LEFT' | 'RIGHT' | 'BOTTOM' | 'COLLAPSED';

/**
 * 네이버 캘린더형 상세 반복 설정 규칙
 */
export interface RecurrenceRule {
  cycle: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number; // 예: 1주, 2일, 1개월
  daysOfWeek: number[]; // 0(일), 1(월), 2(화), 3(수), 4(목), 5(금), 6(토)
  startTime: string; // "19:30"
  endTime: string; // "20:30"
  isNextDayEnd?: boolean; // 익일 종료 여부
  isAllDay: boolean; // 종일 여부
  endCondition: 'NONE' | 'DATE' | 'COUNT'; // 종료 조건 (무한, 날짜, 횟수)
  endDate?: string; // YYYY-MM-DD
  endCount?: number; // N회
  summary: string; // 실시간 조합 요약 텍스트
}

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  isAllDay: boolean;
  serviceType: ServiceType;
  itemSubtype: string;
  status?: 'PENDING' | 'DONE' | 'IN_PROGRESS';
  amount?: number;
  color: string;
  location?: string;
  isImportant?: boolean;
  isPrivate?: boolean;
  sticker?: string;
  description?: string;
  sourceId?: string;
  // 반복 관련 속성 (네이버형 예외 처리 가드레일)
  recurrenceRule?: RecurrenceRule;
  recurrenceExceptions?: string[]; // 건너뛰거나 개별 처리된 YYYY-MM-DD 목록
  parentRecurringId?: string;
}

export interface AttachedMediaItem {
  id: string;
  type: 'IMAGE' | 'AUDIO' | 'DOCUMENT';
  name: string;
  size?: string;
  duration?: string;
  timestamp?: string;
  url?: string;
  imageRatio?: 'AUTO' | 'SQUARE' | 'WIDE';
  imageToggle?: 'EXPANDED' | 'COLLAPSED';
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mode?: 'KEYWORD' | 'THREE_LINE' | 'MARKDOWN' | 'STRUCTURAL';
  moodEmoji: string;
  weatherEmoji: string;
  weather?: string; // 날씨 설명 (예: 맑음, 기온 18℃)
  location?: string; // 위치명 (예: 서울 강남구 역삼동)
  keywordTags: string[];
  threeLines: {
    event: string;
    thought: string;
    tomorrow: string;
  };
  contentMarkdown: string;
  attachedMedia: AttachedMediaItem[];
  // 구조적 블록 활성화 여부
  hasKeywords?: boolean;
  hasThreeLines?: boolean;
  hasMarkdown?: boolean;
  updatedAt: string;
}

export interface PastYearDiary {
  yearsAgo: number;
  year: number;
  date: string;
  moodEmoji: string;
  title: string;
  content: string;
  spendingSummary?: string;
}

export interface DisplaySettings {
  // 1계층: 서비스 마스터 토글
  masterLedger: boolean;
  masterDuty: boolean;
  masterGoal: boolean;
  masterRoutine: boolean;
  masterDiary: boolean;
  // 2계층: 개별 항목 상세 토글 (마스터 ON 시 종속)
  itemBilling: boolean;
  itemFixedExpense: boolean;
  itemSalary: boolean;
  itemMyDuty: boolean;
  itemAllDuty: boolean;
  itemSubstitute: boolean;
  itemGoalDeadline: boolean;
  itemGoalMilestone: boolean;
  itemRoutineMedicine: boolean;
  itemRoutineTax: boolean;
  // 과거의 오늘 보기 년도 (0~5년)
  pastYearsCount: number;
  // PWA 리소스 수집 설정
  collectImages: boolean;
  collectAudio: boolean;
  collectDocs: boolean;
  // 뷰포트 및 패널 위치 설정
  panelPosition: PanelPosition;
  isHistoryVisible: boolean;
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  masterLedger: true,
  masterDuty: true,
  masterGoal: true,
  masterRoutine: true,
  masterDiary: true,
  itemBilling: true,
  itemFixedExpense: true,
  itemSalary: true,
  itemMyDuty: true,
  itemAllDuty: true,
  itemSubstitute: true,
  itemGoalDeadline: true,
  itemGoalMilestone: true,
  itemRoutineMedicine: true,
  itemRoutineTax: true,
  pastYearsCount: 3,
  collectImages: true,
  collectAudio: true,
  collectDocs: true,
  panelPosition: 'RIGHT',
  isHistoryVisible: true,
};
