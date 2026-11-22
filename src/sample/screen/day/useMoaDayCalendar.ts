// ==========================================
// src/sample/screen/day/useMoaDayCalendar.ts
// 모아데이 비즈니스 로직 및 상태 관리 커스텀 훅 (SRP & 동적 네비게이션·리사이저)
// ==========================================

import { useState, useMemo, useEffect } from 'react';
import {
  CalendarEventItem,
  DiaryEntry,
  DisplaySettings,
  DEFAULT_DISPLAY_SETTINGS,
  DayViewMode,
  PastYearDiary,
  ServiceType,
  PanelPosition,
} from './types';

// 기본 Mock 이벤트 (2026년 11월)
const INITIAL_EVENTS: CalendarEventItem[] = [
  {
    id: 'evt-01',
    title: '넷플릭스 & 유튜브 프리미엄 정기결제',
    date: '2026-11-05',
    isAllDay: true,
    serviceType: 'LEDGER',
    itemSubtype: 'FIXED_EXPENSE',
    amount: 28500,
    color: '#0284c7',
    description: '가족 공유 계좌 자동이체 청구',
  },
  {
    id: 'evt-02',
    title: '11월 세금계산서 발급 마감일',
    date: '2026-11-10',
    startTime: '09:00',
    endTime: '18:00',
    isAllDay: false,
    serviceType: 'ROUTINE',
    itemSubtype: 'ROUTINE_TAX',
    color: '#8b5cf6',
    isImportant: true,
    sticker: '📑',
    description: '홈택스 전자세금계산서 마감 리마인더',
  },
  {
    id: 'evt-03',
    title: '현대카드 대금 결제일',
    date: '2026-11-15',
    isAllDay: true,
    serviceType: 'LEDGER',
    itemSubtype: 'BILLING',
    amount: 1240000,
    color: '#0369a1',
    isImportant: true,
    description: '결제계좌 잔고 확인 필요',
  },
  {
    id: 'evt-04',
    title: '거실 바닥 청소 및 재활용 분리수거',
    date: '2026-11-18',
    startTime: '19:00',
    endTime: '20:00',
    isAllDay: false,
    serviceType: 'DUTY',
    itemSubtype: 'MY_DUTY',
    color: '#d946ef',
    sticker: '🧹',
    status: 'DONE',
    description: '인증 사진 등록 및 피어 승인 완료',
    sourceId: 'duty-01',
  },
  {
    id: 'evt-05',
    title: '비상금 1,000만원 모으기 중간 점검',
    date: '2026-11-20',
    startTime: '14:00',
    endTime: '15:00',
    isAllDay: false,
    serviceType: 'GOAL',
    itemSubtype: 'GOAL_MILESTONE',
    color: '#0d9488',
    sticker: '🎯',
    description: '현재 달성률 85% 돌파 축하',
    sourceId: 'goal-01',
  },
  {
    id: 'evt-06',
    title: '삼성카드 결제예정일 청구',
    date: '2026-11-22',
    isAllDay: true,
    serviceType: 'LEDGER',
    itemSubtype: 'BILLING',
    amount: 860000,
    color: '#0284c7',
    isImportant: true,
  },
  {
    id: 'evt-07',
    title: '주방 식기세척기 정리 및 소독',
    date: '2026-11-22',
    startTime: '20:30',
    endTime: '21:00',
    isAllDay: false,
    serviceType: 'DUTY',
    itemSubtype: 'MY_DUTY',
    color: '#d946ef',
    sticker: '🧼',
    status: 'IN_PROGRESS',
    sourceId: 'duty-02',
  },
  {
    id: 'evt-08',
    title: '매일 1만보 걷기 챌린지 (22일차)',
    date: '2026-11-22',
    isAllDay: true,
    serviceType: 'GOAL',
    itemSubtype: 'GOAL_DEADLINE',
    color: '#0d9488',
    sticker: '👟',
  },
  {
    id: 'evt-09',
    title: '저녁 루틴: 오메가3 및 비타민D 복용',
    date: '2026-11-22',
    startTime: '21:30',
    endTime: '21:40',
    isAllDay: false,
    serviceType: 'ROUTINE',
    itemSubtype: 'ROUTINE_MEDICINE',
    color: '#8b5cf6',
    sticker: '💊',
  },
  {
    id: 'evt-10',
    title: '11월 급여 입금일 (+3,850,000원)',
    date: '2026-11-25',
    isAllDay: true,
    serviceType: 'LEDGER',
    itemSubtype: 'SALARY',
    amount: 3850000,
    color: '#16a34a',
    isImportant: true,
  },
  {
    id: 'evt-11',
    title: '욕실 타일 물때 청소 (대신수행 요청)',
    date: '2026-11-28',
    startTime: '10:00',
    endTime: '11:00',
    isAllDay: false,
    serviceType: 'DUTY',
    itemSubtype: 'SUBSTITUTE',
    color: '#ec4899',
    sticker: '🚿',
  },
  {
    id: 'evt-12',
    title: '11월 적금 150만원 자동이체 완수 D-Day',
    date: '2026-11-30',
    isAllDay: true,
    serviceType: 'GOAL',
    itemSubtype: 'GOAL_DEADLINE',
    color: '#0d9488',
    isImportant: true,
  },
];

// 기본 Mock 일기
const INITIAL_DIARIES: Record<string, DiaryEntry> = {
  '2026-11-22': {
    id: 'dia-2026-11-22',
    date: '2026-11-22',
    mode: 'STRUCTURAL',
    moodEmoji: '🌟',
    weatherEmoji: '☀️',
    weather: '맑음 (18℃)',
    location: '서울 강남구 역삼동',
    keywordTags: ['#모아데이', '#스마트다이어리', '#성공적'],
    threeLines: {
      event: '모아데이 전역 일정관리와 스마트 다이어리 PWA 연동 화면을 완벽히 설계했다.',
      thought: '통화녹음 재생과 네이버형 일정 등록 폼이 결합되니 생활 밀착형 체감이 확 살아난다.',
      tomorrow: '코드리뷰 문서 발행하고 dev/stg/main에 안정적으로 승급 배포해야지.',
    },
    contentMarkdown: `### 🌟 오늘 하루 모아데이 요약
오후에 모아데이 전역 일정 허브와 안드로이드 리소스 수집 엔진 인터페이스를 완성했다.
달력에서 바로 \`(+)\` 버튼을 눌러 네이버 스타일 팝업으로 일정과 일기를 원스톱 기장할 수 있게 되었다.

#### 📱 오늘의 모바일 활동 기록
- 📞 **14:20** 김대리님과 통화 (15분 32초)
- 🎙️ [통화녹음] 김대리_기획미팅.m4a (인라인 재생 가능)
- 📁 [문서] 11월_식대영수증_파스타.pdf (정산 첨부 완료)
- 📷 오늘 점심 맛있는 파스타 사진 1장 보관

> 내일도 활기차게 목표와 루틴을 이어나가자!`,
    attachedMedia: [
      {
        id: 'med-01',
        type: 'AUDIO',
        name: '통화녹음_김대리_20261122_1420.m4a',
        duration: '15:32',
        size: '7.2 MB',
        timestamp: '14:20',
      },
      {
        id: 'med-02',
        type: 'IMAGE',
        name: '20261122_점심메뉴_파스타.jpg',
        size: '2.4 MB',
        timestamp: '12:30',
        imageRatio: 'SQUARE',
        imageToggle: 'EXPANDED',
      },
      {
        id: 'med-03',
        type: 'DOCUMENT',
        name: '2026-11-22_식대영수증_파스타.pdf',
        size: '1.2 MB',
        timestamp: '12:45',
      },
    ],
    hasKeywords: true,
    hasThreeLines: true,
    hasMarkdown: true,
    updatedAt: '2026-11-22 18:30',
  },
};

const PAST_YEARS_MOCK: PastYearDiary[] = [
  {
    yearsAgo: 1,
    year: 2025,
    date: '2025-11-22',
    moodEmoji: '💡',
    title: '모아보고 프로젝트 첫 아키텍처 구상 회의',
    content:
      '가계부 지출 대사와 모아당번의 3상태머신 융합 아이디어를 백로그로 처음 작성했다. 팀원들과 열띤 토론을 나눔.',
    spendingSummary: '스타벅스 커피 2잔 9,000원 지출',
  },
  {
    yearsAgo: 2,
    year: 2024,
    date: '2024-11-22',
    moodEmoji: '🍂',
    title: '남한산성 늦가을 단풍 나들이',
    content:
      '가족들과 주말 남한산성 성곽길을 산책했다. 공기가 맑고 단풍이 절정이었음. 점심으로 닭백숙을 먹고 힐링.',
    spendingSummary: '남한산성 토종닭백숙 65,000원 지출',
  },
  {
    yearsAgo: 3,
    year: 2023,
    date: '2023-11-22',
    moodEmoji: '💻',
    title: '새 개발 노트북 세팅 및 IDE 구성',
    content:
      '새로 맞춘 고성능 랩탑에 VSCode, Node.js, Git 환경을 세팅했다. 빌드 속도가 2배 빨라져서 대만족.',
    spendingSummary: '무선 인체공학 마우스 35,000원 지출',
  },
];

const ALL_SERVICE_TYPES: ServiceType[] = [
  'LEDGER',
  'DUTY',
  'GOAL',
  'ROUTINE',
  'PERSONAL',
  'DIARY',
];

// 주차 계산 헬퍼
const getWeekOfMonth = (date: Date) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const startDayOfWeek = startOfMonth.getDay();
  return Math.ceil((dayOfMonth + startDayOfWeek) / 7);
};

export const useMoaDayCalendar = () => {
  // 1. 날짜 및 뷰모드 상태
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11);
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-22');
  const [viewMode, setViewMode] = useState<DayViewMode>('MONTH');

  // 2. 표시 설정 (LocalStorage 영속화)
  const [settings, setSettings] = useState<DisplaySettings>(() => {
    try {
      const saved = localStorage.getItem('moabogo_day_settings_v2');
      return saved ? JSON.parse(saved) : DEFAULT_DISPLAY_SETTINGS;
    } catch {
      return DEFAULT_DISPLAY_SETTINGS;
    }
  });

  // 3. 퀵필터 멀티 선택 상태 (정책 1: 설정 팝업에서 켜진 서비스만 노출 및 영속화)
  const availableFilterTypes = useMemo<ServiceType[]>(() => {
    const list: ServiceType[] = [];
    if (settings.masterLedger) list.push('LEDGER');
    if (settings.masterDuty) list.push('DUTY');
    if (settings.masterGoal) list.push('GOAL');
    if (settings.masterRoutine) list.push('ROUTINE');
    if (settings.masterDiary) list.push('DIARY');
    list.push('PERSONAL'); // 개인 할일은 기본 활성
    return list;
  }, [settings]);

  const [selectedFilters, setSelectedFilters] = useState<ServiceType[]>(() => {
    try {
      const saved = localStorage.getItem('moabogo_day_filters_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) { }
    return ALL_SERVICE_TYPES;
  });

  // 4. 패널 위치 및 레이아웃 상태
  const [panelPosition, setPanelPosition] = useState<PanelPosition>(settings.panelPosition || 'RIGHT');
  const [savedPanelBeforeCollapse, setSavedPanelBeforeCollapse] = useState<PanelPosition>('RIGHT');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [savedPanelBeforeFullScreen, setSavedPanelBeforeFullScreen] = useState<PanelPosition>('RIGHT');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState<boolean>(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState<boolean>(settings.isHistoryVisible ?? true);
  const [isHistoryContentCollapsed, setIsHistoryContentCollapsed] = useState<boolean>(settings.isHistoryContentCollapsed ?? false);
  const [isDetailCollapsed, setIsDetailCollapsed] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // 4-e. 가변 리사이저 크기 상태 (LocalStorage 영속화)
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('moabogo_day_panel_width_v1');
      return saved ? Math.min(560, Math.max(280, Number(saved))) : 380;
    } catch {
      return 380;
    }
  });

  const [panelHeight, setPanelHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('moabogo_day_panel_height_v1');
      return saved ? Math.min(520, Math.max(220, Number(saved))) : 340;
    } catch {
      return 340;
    }
  });

  // 크기 변경 시 LocalStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem('moabogo_day_panel_width_v1', String(panelWidth));
    } catch (_) {}
  }, [panelWidth]);

  useEffect(() => {
    try {
      localStorage.setItem('moabogo_day_panel_height_v1', String(panelHeight));
    } catch (_) {}
  }, [panelHeight]);

  // 5. 데이터 상태 (LocalStorage 영속화)
  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    try {
      const saved = localStorage.getItem('moabogo_day_events_v2');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [diaries, setDiaries] = useState<Record<string, DiaryEntry>>(() => {
    try {
      const saved = localStorage.getItem('moabogo_day_diaries_v2');
      return saved ? JSON.parse(saved) : INITIAL_DIARIES;
    } catch {
      return INITIAL_DIARIES;
    }
  });

  // 데이터 변경 시 자동 LocalStorage 동기화
  useEffect(() => {
    try {
      localStorage.setItem('moabogo_day_events_v2', JSON.stringify(events));
    } catch (_) { }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem('moabogo_day_diaries_v2', JSON.stringify(diaries));
    } catch (_) { }
  }, [diaries]);

  useEffect(() => {
    try {
      localStorage.setItem('moabogo_day_filters_v2', JSON.stringify(selectedFilters));
    } catch (_) { }
  }, [selectedFilters]);

  // 6. 모달/팝업 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createModalTab, setCreateModalTab] = useState<'DIARY' | 'PLAN'>('PLAN');
  const [createTargetDate, setCreateTargetDate] = useState<string>('2026-11-22');

  // 7. 플로팅 오디오 플레이어 & 문서 뷰어 상태
  const [playingAudio, setPlayingAudio] = useState<{
    name: string;
    duration: string;
    isPlaying: boolean;
    currentTime: number;
    totalTime: number;
    playbackRate: number;
  } | null>(null);

  const [viewingDoc, setViewingDoc] = useState<{ name: string; size: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 동적 네비게이션 타이틀 (요구사항 1)
  const navTitleText = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m - 1, d);

      if (viewMode === 'MONTH') {
        return `${currentYear}년 ${currentMonth}월`;
      } else if (viewMode === 'WEEK') {
        const weekNum = getWeekOfMonth(dt);
        return `${y}년 ${m}월 ${weekNum}주`;
      } else if (viewMode === 'DAY') {
        return `${y}년 ${m}월 ${d}일`;
      } else {
        return `${currentYear}년 ${currentMonth}월 전체`;
      }
    } catch {
      return `${currentYear}년 ${currentMonth}월`;
    }
  }, [viewMode, currentYear, currentMonth, selectedDate]);

  // 이전/다음 동적 네비게이션 핸들러 (요구사항 1)
  const handlePrevNav = () => {
    if (viewMode === 'MONTH' || viewMode === 'AGENDA') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else if (viewMode === 'WEEK') {
      const parts = selectedDate.split('-').map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      dt.setDate(dt.getDate() - 7);
      const yStr = dt.getFullYear();
      const mStr = String(dt.getMonth() + 1).padStart(2, '0');
      const dStr = String(dt.getDate()).padStart(2, '0');
      const nextDate = `${yStr}-${mStr}-${dStr}`;
      setSelectedDate(nextDate);
      setCurrentYear(dt.getFullYear());
      setCurrentMonth(dt.getMonth() + 1);
    } else if (viewMode === 'DAY') {
      const parts = selectedDate.split('-').map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      dt.setDate(dt.getDate() - 1);
      const yStr = dt.getFullYear();
      const mStr = String(dt.getMonth() + 1).padStart(2, '0');
      const dStr = String(dt.getDate()).padStart(2, '0');
      const nextDate = `${yStr}-${mStr}-${dStr}`;
      setSelectedDate(nextDate);
      setCurrentYear(dt.getFullYear());
      setCurrentMonth(dt.getMonth() + 1);
    }
  };

  const handleNextNav = () => {
    if (viewMode === 'MONTH' || viewMode === 'AGENDA') {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else if (viewMode === 'WEEK') {
      const parts = selectedDate.split('-').map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      dt.setDate(dt.getDate() + 7);
      const yStr = dt.getFullYear();
      const mStr = String(dt.getMonth() + 1).padStart(2, '0');
      const dStr = String(dt.getDate()).padStart(2, '0');
      const nextDate = `${yStr}-${mStr}-${dStr}`;
      setSelectedDate(nextDate);
      setCurrentYear(dt.getFullYear());
      setCurrentMonth(dt.getMonth() + 1);
    } else if (viewMode === 'DAY') {
      const parts = selectedDate.split('-').map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      dt.setDate(dt.getDate() + 1);
      const yStr = dt.getFullYear();
      const mStr = String(dt.getMonth() + 1).padStart(2, '0');
      const dStr = String(dt.getDate()).padStart(2, '0');
      const nextDate = `${yStr}-${mStr}-${dStr}`;
      setSelectedDate(nextDate);
      setCurrentYear(dt.getFullYear());
      setCurrentMonth(dt.getMonth() + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(11);
    setSelectedDate('2026-11-22');
  };

  // 설정 저장 핸들러
  const handleUpdateSettings = (newSettings: Partial<DisplaySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('moabogo_day_settings_v2', JSON.stringify(updated));
      } catch (_) { }
      return updated;
    });
    setToastMessage('표시 설정이 저장되었습니다.');
  };

  // 패널 위치 변경 핸들러
  const handleSetPanelPosition = (pos: PanelPosition) => {
    if (pos !== 'COLLAPSED') {
      setSavedPanelBeforeCollapse(pos);
    }
    setPanelPosition(pos);
    handleUpdateSettings({ panelPosition: pos });
  };

  // 방향성 패널 접기 및 복귀 핸들러 (요구사항 4-a~d)
  const handleFoldPanel = () => {
    if (panelPosition !== 'COLLAPSED') {
      setSavedPanelBeforeCollapse(panelPosition);
      setPanelPosition('COLLAPSED');
      setToastMessage('패널을 접었습니다.');
    } else {
      setPanelPosition(savedPanelBeforeCollapse);
      setToastMessage('패널을 다시 열었습니다.');
    }
  };

  // 정책 3: 전체화면 일시적 토글 (Focus Mode)
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setSavedPanelBeforeFullScreen(panelPosition);
      setIsFullScreen(true);
      setToastMessage('🖥️ 달력 전체화면(집중 모드)을 시작합니다.');
    } else {
      setIsFullScreen(false);
      setPanelPosition(savedPanelBeforeFullScreen);
      setToastMessage('🖥️ 이전 뷰 화면으로 복귀했습니다.');
    }
  };

  // 과거의 오늘 캐러셀 접기/펴기 (레거시 호환)
  const toggleHistoryCollapse = () => {
    setIsHistoryCollapsed((prev) => !prev);
  };

  // 요구사항 1: 과거의 오늘 캐러셀 영역 완전 표시/숨김 (헤더 툴바 [달력이력] 버튼 연동)
  const toggleHistoryVisibility = () => {
    setIsHistoryVisible((prev) => {
      const next = !prev;
      handleUpdateSettings({ isHistoryVisible: next });
      setToastMessage(next ? '🕰️ 달력 이력(과거의 오늘)을 표시합니다.' : '🕰️ 달력 이력을 숨겼습니다.');
      return next;
    });
  };

  // 요구사항 2: 과거의 오늘 헤더는 남기고 내용 슬라이더만 상하 아코디언 접기/펴기
  const toggleHistoryContentCollapse = () => {
    setIsHistoryContentCollapsed((prev) => {
      const next = !prev;
      handleUpdateSettings({ isHistoryContentCollapsed: next });
      return next;
    });
  };

  // 모바일 상하 접기/펴기 (정책 2)
  const toggleDetailCollapse = () => {
    setIsDetailCollapsed((prev) => !prev);
  };

  // 정책 1: 퀵필터 멀티 선택 토글 핸들러
  const handleToggleFilter = (type: ServiceType) => {
    setSelectedFilters((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // 퀵필터 전체 선택/해제 토글
  const handleToggleAllFilters = () => {
    if (selectedFilters.length === availableFilterTypes.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters([...availableFilterTypes]);
    }
  };

  // 정책 4: 일기만 단독 필터링된 상태 여부 확인
  const isOnlyDiaryFiltered = useMemo(() => {
    return selectedFilters.length === 1 && selectedFilters[0] === 'DIARY';
  }, [selectedFilters]);

  // 계층적 2단계 필터링 로직 (설정 마스터 & 멀티 퀵필터 결합)
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // 1) 퀵필터 체크 (선택되지 않은 서비스는 숨김)
      if (!selectedFilters.includes(evt.serviceType)) {
        return false;
      }

      // 2) 설정 팝업 마스터 토글 체크 (OFF 시 숨김)
      if (evt.serviceType === 'LEDGER' && !settings.masterLedger) return false;
      if (evt.serviceType === 'DUTY' && !settings.masterDuty) return false;
      if (evt.serviceType === 'GOAL' && !settings.masterGoal) return false;
      if (evt.serviceType === 'ROUTINE' && !settings.masterRoutine) return false;
      if (evt.serviceType === 'DIARY' && !settings.masterDiary) return false;

      // 3) 세부 항목 토글 체크
      if (evt.serviceType === 'LEDGER') {
        if (evt.itemSubtype === 'BILLING' && !settings.itemBilling) return false;
        if (evt.itemSubtype === 'FIXED_EXPENSE' && !settings.itemFixedExpense) return false;
        if (evt.itemSubtype === 'SALARY' && !settings.itemSalary) return false;
      }
      if (evt.serviceType === 'DUTY') {
        if (evt.itemSubtype === 'MY_DUTY' && !settings.itemMyDuty) return false;
        if (evt.itemSubtype === 'ALL_DUTY' && !settings.itemAllDuty) return false;
        if (evt.itemSubtype === 'SUBSTITUTE' && !settings.itemSubstitute) return false;
      }
      if (evt.serviceType === 'GOAL') {
        if (evt.itemSubtype === 'GOAL_DEADLINE' && !settings.itemGoalDeadline) return false;
        if (evt.itemSubtype === 'GOAL_MILESTONE' && !settings.itemGoalMilestone) return false;
      }
      if (evt.serviceType === 'ROUTINE') {
        if (evt.itemSubtype === 'ROUTINE_MEDICINE' && !settings.itemRoutineMedicine) return false;
        if (evt.itemSubtype === 'ROUTINE_TAX' && !settings.itemRoutineTax) return false;
      }
      return true;
    });
  }, [events, selectedFilters, settings]);

  // 달력 42칸 일수 계산
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
    const days = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = currentMonth === 1 ? 12 : currentMonth - 1;
      const y = currentMonth === 1 ? currentYear - 1 : currentYear;
      days.push({
        day: d,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        dateStr: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 12 ? 1 : currentMonth + 1;
      const y = currentMonth === 12 ? currentYear + 1 : currentYear;
      days.push({
        day: d,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }
    return days;
  }, [currentYear, currentMonth]);

  // 날짜별 이벤트 인덱스 매핑
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};
    filteredEvents.forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // 일정/일기 생성 팝업 열기
  const handleOpenCreateOnDate = (dateStr: string, defaultTab: 'DIARY' | 'PLAN' = 'PLAN') => {
    setCreateTargetDate(dateStr);
    setCreateModalTab(defaultTab);
    setIsCreateModalOpen(true);
  };

  // 과거의 오늘 복기 목록
  const activePastDiaries = useMemo(() => {
    if (settings.pastYearsCount === 0 || isHistoryCollapsed) return [];
    return PAST_YEARS_MOCK.filter((p) => p.yearsAgo <= settings.pastYearsCount);
  }, [settings.pastYearsCount, isHistoryCollapsed]);

  // 일정 등록 핸들러
  const handleSavePlan = (newEvt: CalendarEventItem) => {
    setEvents((prev) => [newEvt, ...prev]);
    setIsCreateModalOpen(false);
    setToastMessage(`[${newEvt.title}] 일정이 성공적으로 등록되었습니다.`);
  };

  // 일기 등록 핸들러 (정책 4: 일기는 기본 '📝' 아이콘, 단독 필터 시 감정 이모지)
  const handleSaveDiary = (newDiary: DiaryEntry) => {
    setDiaries((prev) => ({
      ...prev,
      [newDiary.date]: newDiary,
    }));

    setEvents((prev) => {
      const filtered = prev.filter((e) => !(e.serviceType === 'DIARY' && e.date === newDiary.date));
      const summaryTitle = newDiary.threeLines.event
        ? newDiary.threeLines.event.slice(0, 20)
        : newDiary.keywordTags.slice(0, 2).join(' ') || '오늘의 일기';

      return [
        {
          id: `evt-dia-${newDiary.date}`,
          title: `[일기] ${summaryTitle}`,
          date: newDiary.date,
          isAllDay: true,
          serviceType: 'DIARY',
          itemSubtype: 'DIARY_LOG',
          color: '#f59e0b',
          sticker: '📝',
          description: newDiary.contentMarkdown.slice(0, 80),
        },
        ...filtered,
      ];
    });

    setIsCreateModalOpen(false);
    setToastMessage(`[${newDiary.date}] 일기가 성공적으로 저장되었습니다.`);
  };

  return {
    currentYear,
    currentMonth,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    navTitleText,
    handlePrevNav,
    handleNextNav,
    handleGoToday,
    selectedFilters,
    availableFilterTypes,
    handleToggleFilter,
    handleToggleAllFilters,
    isOnlyDiaryFiltered,
    panelPosition,
    savedPanelBeforeCollapse,
    handleSetPanelPosition,
    handleFoldPanel,
    panelWidth,
    setPanelWidth,
    panelHeight,
    setPanelHeight,
    isFullScreen,
    toggleFullScreen,
    isHistoryCollapsed,
    toggleHistoryCollapse,
    isHistoryVisible,
    toggleHistoryVisibility,
    isHistoryContentCollapsed,
    toggleHistoryContentCollapse,
    isDetailCollapsed,
    toggleDetailCollapse,
    isDetailModalOpen,
    setIsDetailModalOpen,
    settings,
    handleUpdateSettings,
    filteredEvents,
    eventsByDate,
    calendarDays,
    handleOpenCreateOnDate,
    isSettingsOpen,
    setIsSettingsOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createModalTab,
    setCreateModalTab,
    createTargetDate,
    diaries,
    handleSavePlan,
    handleSaveDiary,
    activePastDiaries,
    playingAudio,
    setPlayingAudio,
    viewingDoc,
    setViewingDoc,
    toastMessage,
    setToastMessage,
  };
};
