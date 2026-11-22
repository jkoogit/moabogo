// ==========================================
// src/sample/screen/day/types.ts
// 모아데이 (MoaDay) 도메인 타입 정의
// ==========================================

export type DayViewMode = 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA';
export type ServiceType = 'LEDGER' | 'DUTY' | 'GOAL' | 'ROUTINE' | 'PERSONAL' | 'DIARY';

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
  sticker?: string;
  description?: string;
  sourceId?: string;
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
  mode: 'KEYWORD' | 'THREE_LINE' | 'MARKDOWN';
  moodEmoji: string;
  weatherEmoji: string;
  keywordTags: string[];
  threeLines: {
    event: string;
    thought: string;
    tomorrow: string;
  };
  contentMarkdown: string;
  attachedMedia: AttachedMediaItem[];
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
};
