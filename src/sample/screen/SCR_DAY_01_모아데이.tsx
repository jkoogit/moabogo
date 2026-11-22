// ==========================================
// src/sample/screen/SCR_DAY_01_모아데이.tsx
// 모아데이 (MoaDay) 전역 일정 허브 및 스마트 다이어리 화면 (9대 UX고도화 완결)
// ==========================================

import React, { useRef, useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Settings2,
  Clock,
  Wallet,
  Bookmark,
  FileText,
  Image as ImageIcon,
  Mic,
  File,
  Download,
  Play,
  Eye,
  FolderArchive,
  ExternalLink,
  Maximize2,
  Minimize2,
  Layout,
  History,
  ChevronUp,
  ChevronDown,
  Columns,
  LayoutGrid,
} from 'lucide-react';
import {
  ElmMkdViewer,
  ElmToast01,
} from '../elements/Tokens';
import { useMoaDayCalendar } from './day/useMoaDayCalendar';
import { MoaDayDisplaySettingsModal } from './day/MoaDayDisplaySettingsModal';
import { MoaDayUnifiedCreateModal } from './day/MoaDayUnifiedCreateModal';
import { MoaDayFloatingAudioPlayer } from './day/MoaDayFloatingAudioPlayer';
import { MoaDayDocViewerModal } from './day/MoaDayDocViewerModal';
import { AttachedMediaItem, PanelPosition, ServiceType } from './day/types';

interface SCR_DAY_01_Props {
  onNavigateToLedger?: () => void;
  onNavigateToDuty?: (dutyId?: string) => void;
  onNavigateToGoal?: (goalId?: string) => void;
  onNavigateToRoutine?: () => void;
}

export const SCR_DAY_01_모아데이: React.FC<SCR_DAY_01_Props> = ({
  onNavigateToLedger,
  onNavigateToDuty,
  onNavigateToGoal,
  onNavigateToRoutine,
}) => {
  const {
    currentYear,
    currentMonth,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    selectedFilters,
    availableFilterTypes,
    handleToggleFilter,
    handleToggleAllFilters,
    isOnlyDiaryFiltered,
    panelPosition,
    handleSetPanelPosition,
    isFullScreen,
    toggleFullScreen,
    isHistoryCollapsed,
    toggleHistoryCollapse,
    isDetailCollapsed,
    toggleDetailCollapse,
    settings,
    handleUpdateSettings,
    filteredEvents,
    eventsByDate,
    calendarDays,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
    handleOpenCreateOnDate,
    isSettingsOpen,
    setIsSettingsOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createModalTab,
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
  } = useMoaDayCalendar();

  // 슬라이드 드래그 휠 참조 및 상태 (요구사항 2)
  const filterScrollRef = useRef<HTMLDivElement | null>(null);
  const [isFilterDragging, setIsFilterDragging] = useState(false);
  const [filterStartX, setFilterStartX] = useState(0);
  const [filterScrollLeft, setFilterScrollLeft] = useState(0);

  const handleFilterMouseDown = (e: React.MouseEvent) => {
    if (!filterScrollRef.current) return;
    setIsFilterDragging(true);
    setFilterStartX(e.pageX - filterScrollRef.current.offsetLeft);
    setFilterScrollLeft(filterScrollRef.current.scrollLeft);
  };
  const handleFilterMouseLeave = () => setIsFilterDragging(false);
  const handleFilterMouseUp = () => setIsFilterDragging(false);
  const handleFilterMouseMove = (e: React.MouseEvent) => {
    if (!isFilterDragging || !filterScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - filterScrollRef.current.offsetLeft;
    const walk = (x - filterStartX) * 1.5;
    filterScrollRef.current.scrollLeft = filterScrollLeft - walk;
  };
  const handleFilterWheel = (e: React.WheelEvent) => {
    if (!filterScrollRef.current) return;
    if (e.deltaY !== 0) {
      filterScrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const selectedDayDiary = diaries[selectedDate];
  const selectedDayEvents = eventsByDate[selectedDate] || [];

  // 다운로드 핸들러
  const handleDownloadFile = (item: AttachedMediaItem) => {
    setToastMessage(`💾 [${item.name}] 다운로드를 시작합니다.`);
  };

  const handleDownloadAllZip = () => {
    setToastMessage(`📦 오늘 첨부된 모든 리소스(사진/녹음/문서)를 ZIP 압축 다운로드합니다.`);
  };

  const handleDownloadByType = (type: 'IMAGE' | 'AUDIO' | 'DOCUMENT') => {
    const label = type === 'IMAGE' ? '사진' : type === 'AUDIO' ? '음성녹음' : '문서';
    setToastMessage(`📁 ${label} 파일 전체를 묶어 다운로드합니다.`);
  };

  // 서비스 뱃지 컬러 및 라벨
  const getServiceInfo = (type: ServiceType) => {
    switch (type) {
      case 'LEDGER':
        return { label: '가계부 (결제/급여)', color: 'bg-sky-500', text: 'text-sky-500' };
      case 'DUTY':
        return { label: '모아당번 (과업/대신)', color: 'bg-fuchsia-500', text: 'text-fuchsia-500' };
      case 'GOAL':
        return { label: '모아목표 (D-Day)', color: 'bg-teal-500', text: 'text-teal-500' };
      case 'ROUTINE':
        return { label: '모아루틴 (약/세금)', color: 'bg-violet-500', text: 'text-violet-500' };
      case 'PERSONAL':
        return { label: '개인 할일 📌', color: 'bg-indigo-500', text: 'text-indigo-500' };
      case 'DIARY':
        return { label: '스마트 일기 📝', color: 'bg-amber-500', text: 'text-amber-500' };
      default:
        return { label: type, color: 'bg-slate-500', text: 'text-slate-500' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-28">
      {/* 1. 상단 글로벌 네비게이션 헤더 (요구사항 1-a: 3분할 및 모바일 선행 줄바꿈) */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Group 1 (i): 타이틀 및 배지 영역 */}
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                  모아데이 (MoaDay)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                  SCR-DAY-01
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                전역 일정 허브 & PWA 스마트 다이어리
              </p>
            </div>
          </div>

          {/* Group 2 (ii): 연월 이동 네비게이션 & 오늘 버튼 */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl self-start lg:self-center">
            <button
              onClick={handlePrevMonth}
              aria-label="이전 달"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold px-2 text-slate-800 dark:text-zinc-200 min-w-[95px] text-center whitespace-nowrap select-none">
              {currentYear}년 {currentMonth}월
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="다음 달"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2 py-1 ml-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors whitespace-nowrap"
            >
              오늘
            </button>
          </div>

          {/* Group 3 (iii): 뷰모드 탭, 뷰 컨트롤 아이콘, 설정, 작성 버튼 */}
          <div className="flex items-center justify-between lg:justify-end gap-2 flex-wrap">
            {/* 뷰모드 탭 */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-bold">
              {(
                [
                  { id: 'MONTH', label: '월간' },
                  { id: 'WEEK', label: '주간' },
                  { id: 'DAY', label: '일간' },
                  { id: 'AGENDA', label: '목록' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    viewMode === mode.id
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* 표시 설정 바텀시트 열기 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 text-xs font-bold whitespace-nowrap"
              title="표시 및 수집 설정"
            >
              <Settings2 className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              <span className="hidden sm:inline">표시 설정</span>
            </button>

            {/* 일정·일기 등록 버튼 */}
            <button
              onClick={() => handleOpenCreateOnDate(selectedDate, 'PLAN')}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>일정·일기 추가</span>
            </button>
          </div>
        </div>

        {/* 2. 4대 서비스 퀵필터 바 & 뷰모드/패널위치 설정 아이콘 (요구사항 2, 3, 4, 5) */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* 가로 슬라이드 드래그 휠 필터 목록 (요구사항 2 & 정책 1: 켜진 서비스만 노출) */}
          <div
            ref={filterScrollRef}
            onMouseDown={handleFilterMouseDown}
            onMouseLeave={handleFilterMouseLeave}
            onMouseUp={handleFilterMouseUp}
            onMouseMove={handleFilterMouseMove}
            onWheel={handleFilterWheel}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 cursor-grab active:cursor-grabbing select-none flex-1"
          >
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 shrink-0 flex items-center gap-1 whitespace-nowrap">
              <Filter className="w-3 h-3" /> 필터:
            </span>

            {/* 전체 선택 토글 칩 */}
            <button
              onClick={handleToggleAllFilters}
              className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                selectedFilters.length === availableFilterTypes.length
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              <span>전체 ({selectedFilters.length}/{availableFilterTypes.length})</span>
            </button>

            {/* 켜진 서비스 개별 멀티 토글 칩 (정책 1 준수) */}
            {availableFilterTypes.map((type) => {
              const info = getServiceInfo(type);
              const isSelected = selectedFilters.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => handleToggleFilter(type)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100 shadow-xs'
                      : 'bg-white dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500 border-slate-200/80 dark:border-zinc-700/80 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isSelected ? info.color : 'bg-slate-300 dark:bg-zinc-600'}`}
                  />
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* 뷰 제어 아이콘 툴바 (요구사항 4 & 5: 달력 전체화면, 과거의오늘, 패널위치) */}
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-l sm:border-l sm:pl-3 border-slate-200 dark:border-zinc-800">
            {/* 1) 달력 전체화면 토글 (일시적 포커스 모드 - 정책 3) */}
            <button
              onClick={toggleFullScreen}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs font-bold ${
                isFullScreen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title={isFullScreen ? '전체화면 해제 (이전 뷰로 복귀)' : '달력 전체화면 (집중 모드)'}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isFullScreen ? '복귀' : '전체화면'}</span>
            </button>

            {/* 2) 달력이력 (과거의 오늘 회고) 온/오프 토글 */}
            <button
              onClick={toggleHistoryCollapse}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs font-bold ${
                !isHistoryCollapsed
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                  : 'border-slate-200 dark:border-zinc-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="과거의 오늘 회고 캐러셀 온/오프"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden md:inline">달력이력</span>
            </button>

            {/* 3) 패널 위치 제어 버튼 그룹 (왼쪽 / 오른쪽 / 아래 / 접기 - 요구사항 5) */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold">
              {(
                [
                  { pos: 'LEFT', label: '좌측', title: '패널 왼쪽 배치' },
                  { pos: 'RIGHT', label: '우측', title: '패널 오른쪽 배치' },
                  { pos: 'BOTTOM', label: '하단', title: '패널 아래 배치' },
                  { pos: 'COLLAPSED', label: '접기', title: '패널 접기' },
                ] as const
              ).map((p) => (
                <button
                  key={p.pos}
                  onClick={() => handleSetPanelPosition(p.pos)}
                  className={`px-2 py-1 rounded text-[11px] transition-all ${
                    panelPosition === p.pos && !isFullScreen
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                  title={p.title}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 메인 그리드 및 레이아웃 영역 (패널 위치 FSM 바인딩) */}
      <div className="max-w-7xl mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 메인 캘린더/목록 뷰어 영역 (위치에 따라 컬럼 스팬 조정) */}
        <div
          className={`space-y-4 transition-all duration-200 ${
            isFullScreen || panelPosition === 'COLLAPSED' || panelPosition === 'BOTTOM'
              ? 'col-span-12'
              : 'lg:col-span-8'
          }`}
        >
          {viewMode === 'MONTH' ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 text-center text-xs font-bold py-2.5">
                <span className="text-rose-500">일</span>
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span className="text-sky-500">토</span>
              </div>

              {/* 날짜 셀 그리드 (6주 42칸) */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-zinc-800/60 border-b border-slate-100 dark:border-zinc-800/60">
                {calendarDays.map((cell, idx) => {
                  const dayEvents = eventsByDate[cell.dateStr] || [];
                  const dayDiary = diaries[cell.dateStr];
                  const isSelected = selectedDate === cell.dateStr;
                  const isToday = cell.dateStr === '2026-11-22';
                  const isSunday = idx % 7 === 0;
                  const isSaturday = idx % 7 === 6;

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => setSelectedDate(cell.dateStr)}
                      className={`group relative min-h-[92px] sm:min-h-[110px] p-1.5 transition-colors cursor-pointer select-none ${
                        !cell.isCurrentMonth
                          ? 'bg-slate-50/40 dark:bg-zinc-900/30 opacity-40'
                          : isSelected
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500 inset-ring'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-extrabold w-6 h-6 flex items-center justify-center rounded-full ${
                            isToday
                              ? 'bg-indigo-600 text-white'
                              : isSunday
                              ? 'text-rose-500'
                              : isSaturday
                              ? 'text-sky-500'
                              : 'text-slate-800 dark:text-zinc-200'
                          }`}
                        >
                          {cell.day}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCreateOnDate(cell.dateStr, 'PLAN');
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                          title="이 날짜에 계획/일기 추가"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 일기 배지 (정책 4: 기본 '📝' 아이콘, 단독 일기 필터 시 기분 이모지 전환) */}
                      {dayDiary && (
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 whitespace-nowrap"
                            title={dayDiary.keywordTags.join(' ')}
                          >
                            <span>{isOnlyDiaryFiltered ? dayDiary.moodEmoji : '📝'}</span>
                            <span className="hidden sm:inline truncate max-w-[60px]">
                              {dayDiary.keywordTags[0] || '일기'}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* 일정 목록 */}
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((evt) => (
                          <div
                            key={evt.id}
                            style={{ borderLeftColor: evt.color }}
                            className="text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded bg-slate-100/90 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-200 truncate border-l-2"
                            title={evt.title}
                          >
                            {evt.sticker && <span className="mr-0.5">{evt.sticker}</span>}
                            {evt.isPrivate && <span className="mr-0.5">🔒</span>}
                            <span>{evt.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 pl-1 block">
                            +{dayEvents.length - 2}건 더보기
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 아젠다 타임라인 뷰모드 */
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>2026년 11월 전체 일정 타임라인 ({filteredEvents.length}건)</span>
                </h3>
                <span className="text-xs text-slate-400">시간순 정렬</span>
              </div>
              <div className="space-y-3">
                {filteredEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedDate(evt.date)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 transition-all flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        style={{ backgroundColor: evt.color }}
                        className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                            {evt.date} {evt.startTime ? `(${evt.startTime})` : '(종일)'}
                          </span>
                          {evt.isImportant && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 whitespace-nowrap">
                              중요 ⭐
                            </span>
                          )}
                          {evt.isPrivate && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                              🔒 비공개
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                            {evt.serviceType}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                          {evt.sticker && <span className="mr-1">{evt.sticker}</span>}
                          {evt.title}
                        </h4>
                        {evt.amount && (
                          <p className="text-xs font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                            금액: {evt.amount.toLocaleString()}원
                          </p>
                        )}
                        {evt.description && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {evt.sourceId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (evt.serviceType === 'DUTY') onNavigateToDuty?.(evt.sourceId);
                          if (evt.serviceType === 'GOAL') onNavigateToGoal?.(evt.sourceId);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
                      >
                        상세보기 <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. 과거의 오늘 동적 회고 캐러셀 (요구사항 8-a: 접기/펴기 토글 추가) */}
          {activePastDiaries.length > 0 && !isFullScreen && (
            <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-indigo-50/50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 rounded-2xl border border-amber-200/70 dark:border-zinc-800 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-amber-200/40 dark:border-zinc-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🕰️</span>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>과거의 오늘 (On This Day)</span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                        최근 {settings.pastYearsCount}개년 복기
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      N년 전 오늘, 나는 어떤 일상과 소비를 기록했을까요?
                    </p>
                  </div>
                </div>

                {/* 캐러셀 접기/펴기 버튼 */}
                <button
                  onClick={toggleHistoryCollapse}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-amber-100/60 dark:hover:bg-zinc-800"
                  title="과거의 오늘 접기/펴기"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activePastDiaries.map((past) => (
                  <div
                    key={past.yearsAgo}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-amber-100 dark:border-zinc-700/80 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white whitespace-nowrap">
                          {past.yearsAgo}년 전 ({past.year}년)
                        </span>
                        <span className="text-sm">{past.moodEmoji}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                        {past.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                        {past.content}
                      </p>
                    </div>
                    {past.spendingSummary && (
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-700/60 flex items-center gap-1.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        <Wallet className="w-3 h-3" />
                        <span className="truncate">{past.spendingSummary}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* 일자 상세 & 스마트 다이어리 뷰어 패널 (요구사항 5 & 정책 2 표준화) */}
        {/* ============================================================ */}
        {!isFullScreen && panelPosition !== 'COLLAPSED' && (
          <div
            className={`space-y-4 transition-all duration-200 ${
              panelPosition === 'BOTTOM'
                ? 'col-span-12'
                : panelPosition === 'LEFT'
                ? 'lg:col-span-4 lg:order-first'
                : 'lg:col-span-4'
            }`}
          >
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs">
              {/* 패널 상단 헤더 및 상하 접기/펴기 버튼 (요구사항 8-b & 정책 2) */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">선택된 일자</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                    {selectedDate}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenCreateOnDate(selectedDate, 'PLAN')}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>추가</span>
                  </button>
                  {/* 상하 아코디언 접기 토글 (모바일 표준 정책 2) */}
                  <button
                    onClick={toggleDetailCollapse}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    title={isDetailCollapsed ? '상세 패널 펼치기' : '상세 패널 접기'}
                  >
                    {isDetailCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isDetailCollapsed && (
                <>
                  {/* 일정 목록 */}
                  <div className="mt-3 space-y-2">
                    <span className="text-xs font-bold text-slate-500">
                      등록된 일정 ({selectedDayEvents.length}건)
                    </span>
                    {selectedDayEvents.length === 0 ? (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 py-3 text-center">
                        등록된 일정이 없습니다.
                      </p>
                    ) : (
                      selectedDayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-700/60 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-zinc-100 truncate">
                              {evt.sticker && <span className="mr-1">{evt.sticker}</span>}
                              {evt.isPrivate && <span className="mr-1">🔒</span>}
                              {evt.title}
                            </span>
                            <span
                              style={{ color: evt.color }}
                              className="text-[10px] font-extrabold shrink-0 whitespace-nowrap ml-1"
                            >
                              {evt.serviceType}
                            </span>
                          </div>
                          {evt.amount && (
                            <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                              {evt.amount.toLocaleString()}원
                            </p>
                          )}
                          {evt.recurrenceRule && (
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                              <span>🔄</span>
                              <span className="truncate">{evt.recurrenceRule.summary.split('\n')[0]}</span>
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* 당일 스마트 다이어리 뷰어 */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                        <span>오늘의 스마트 다이어리</span>
                      </h4>
                      <button
                        onClick={() => handleOpenCreateOnDate(selectedDate, 'DIARY')}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline whitespace-nowrap"
                      >
                        {selectedDayDiary ? '일기 편집' : '+ 일기 쓰기'}
                      </button>
                    </div>

                    {selectedDayDiary ? (
                      <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-zinc-800/40 border border-amber-200/60 dark:border-zinc-700/60 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{selectedDayDiary.moodEmoji}</span>
                            <span className="text-base">{selectedDayDiary.weatherEmoji}</span>
                            {selectedDayDiary.weather && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {selectedDayDiary.weather}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{selectedDayDiary.updatedAt}</span>
                        </div>

                        {selectedDayDiary.location && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>📍</span>
                            <span>{selectedDayDiary.location}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {selectedDayDiary.keywordTags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* 3줄 일기 박스 */}
                        {selectedDayDiary.threeLines &&
                          (selectedDayDiary.threeLines.event || selectedDayDiary.threeLines.thought) && (
                            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-amber-200/60 dark:border-zinc-700 text-xs space-y-1">
                              {selectedDayDiary.threeLines.event && (
                                <p>
                                  <span className="font-bold text-amber-600">사건: </span>
                                  {selectedDayDiary.threeLines.event}
                                </p>
                              )}
                              {selectedDayDiary.threeLines.thought && (
                                <p>
                                  <span className="font-bold text-amber-600">느낌: </span>
                                  {selectedDayDiary.threeLines.thought}
                                </p>
                              )}
                              {selectedDayDiary.threeLines.tomorrow && (
                                <p>
                                  <span className="font-bold text-amber-600">내일: </span>
                                  {selectedDayDiary.threeLines.tomorrow}
                                </p>
                              )}
                            </div>
                          )}

                        {/* 마크다운 본문 */}
                        {selectedDayDiary.contentMarkdown && (
                          <div className="text-xs text-slate-700 dark:text-zinc-300 max-h-48 overflow-y-auto pt-2 border-t border-amber-100 dark:border-zinc-700">
                            <ElmMkdViewer content={selectedDayDiary.contentMarkdown} />
                          </div>
                        )}

                        {/* 첨부 리소스 및 보기모드 인터랙션 */}
                        {selectedDayDiary.attachedMedia && selectedDayDiary.attachedMedia.length > 0 && (
                          <div className="pt-2 border-t border-amber-200/50 dark:border-zinc-700 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                                <FolderArchive className="w-3.5 h-3.5 text-indigo-500" />
                                <span>첨부된 리소스 ({selectedDayDiary.attachedMedia.length}개)</span>
                              </span>
                              <button
                                onClick={handleDownloadAllZip}
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 whitespace-nowrap"
                              >
                                <Download className="w-3 h-3" /> 일괄 ZIP 다운
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {selectedDayDiary.attachedMedia.map((media) => (
                                <div
                                  key={media.id}
                                  className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {media.type === 'AUDIO' && <Mic className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                                    {media.type === 'IMAGE' && <ImageIcon className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                                    {media.type === 'DOCUMENT' && <File className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                    <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                                      {media.name}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {media.type === 'AUDIO' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPlayingAudio({
                                            name: media.name,
                                            duration: media.duration || '15:32',
                                            isPlaying: true,
                                            currentTime: 0,
                                            totalTime: 932,
                                            playbackRate: 1.0,
                                          });
                                        }}
                                        className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-100 whitespace-nowrap"
                                      >
                                        <Play className="w-3 h-3 fill-current" /> 재생
                                      </button>
                                    )}
                                    {media.type === 'DOCUMENT' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingDoc({ name: media.name, size: media.size || '1.2 MB' });
                                        }}
                                        className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1 hover:bg-amber-100 whitespace-nowrap"
                                      >
                                        <Eye className="w-3 h-3" /> 열기
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadFile(media);
                                      }}
                                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                                      title="다운로드"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px]">
                              <button
                                onClick={() => handleDownloadByType('IMAGE')}
                                className="text-slate-500 hover:text-sky-600 underline whitespace-nowrap"
                              >
                                사진만 다운
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => handleDownloadByType('AUDIO')}
                                className="text-slate-500 hover:text-rose-600 underline whitespace-nowrap"
                              >
                                녹음만 다운
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => handleDownloadByType('DOCUMENT')}
                                className="text-slate-500 hover:text-amber-600 underline whitespace-nowrap"
                              >
                                문서만 다운
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center">
                        <p className="text-xs text-slate-400 dark:text-zinc-500">
                          작성된 일기가 없습니다.
                        </p>
                        <button
                          onClick={() => handleOpenCreateOnDate(selectedDate, 'DIARY')}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-1 shadow-xs whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>오늘의 일기 쓰기</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. 계층적 2단계 표시 설정 모달 */}
      <MoaDayDisplaySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 6. 네이버 스타일 통합 작성 모달 */}
      <MoaDayUnifiedCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        targetDate={createTargetDate}
        defaultTab={createModalTab}
        existingDiary={diaries[createTargetDate]}
        onSavePlan={handleSavePlan}
        onSaveDiary={handleSaveDiary}
        onNotify={setToastMessage}
      />

      {/* 7. 플로팅 오디오 플레이어 바 */}
      <MoaDayFloatingAudioPlayer
        playingAudio={playingAudio}
        onTogglePlay={() =>
          setPlayingAudio((prev) => (prev ? { ...prev, isPlaying: !prev.isPlaying } : null))
        }
        onRateChange={() => {
          if (!playingAudio) return;
          const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
          const nextRate = rates[(rates.indexOf(playingAudio.playbackRate) + 1) % rates.length];
          setPlayingAudio((prev) => (prev ? { ...prev, playbackRate: nextRate } : null));
        }}
        onClose={() => setPlayingAudio(null)}
      />

      {/* 8. 문서 뷰어 모달 */}
      <MoaDayDocViewerModal
        viewingDoc={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onDownload={() => {
          if (viewingDoc) {
            setToastMessage(`💾 [${viewingDoc.name}] 다운로드 완료`);
            setViewingDoc(null);
          }
        }}
      />

      {/* 토스트 알림 */}
      {toastMessage && (
        <ElmToast01
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
