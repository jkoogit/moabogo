// ==========================================
// src/sample/screen/SCR_DAY_01_모아데이.tsx
// 모아데이 (MoaDay) 전역 일정 허브 및 스마트 다이어리 화면 (동적네비·가변리사이저 완결)
// ==========================================

import React, { useState, useEffect } from 'react';
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
  History,
  ChevronUp,
  ChevronDown,
  PanelRightClose,
  PanelLeftClose,
  PanelRightOpen,
  PanelLeftOpen,
} from 'lucide-react';
import {
  ElmMkdViewer,
  ElmSld03,
  ElmToast01,
} from '../elements/Tokens';
import { useMoaDayCalendar } from './day/useMoaDayCalendar';
import { MoaDayDisplaySettingsModal } from './day/MoaDayDisplaySettingsModal';
import { MoaDayUnifiedCreateModal } from './day/MoaDayUnifiedCreateModal';
import { MoaDayDetailModal } from './day/MoaDayDetailModal';
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

  // 일자 상세 패널 내 스마트 다이어리 에피소드 태그 필터 (요구사항 10)
  const [selectedDetailTagFilter, setSelectedDetailTagFilter] = useState<string>('ALL');

  useEffect(() => {
    setSelectedDetailTagFilter('ALL');
  }, [selectedDate]);

  // 일간 뷰 상세 아코디언 상태
  const [expandedDayEventId, setExpandedDayEventId] = useState<string | null>(null);

  // 주간 7일간 계산 헬퍼 (월~일 - 요구사항 1-a)
  const getDaysOfWeek = (dateStr: string) => {
    const parts = dateStr.split('-').map(Number);
    const current = new Date(parts[0], parts[1] - 1, parts[2]);
    const day = current.getDay();
    const monday = new Date(current);
    const diff = current.getDate() - (day === 0 ? 6 : day - 1);
    monday.setDate(diff);

    const days: { dateStr: string; day: number; dayOfWeek: string; isSunday: boolean; isSaturday: boolean }[] = [];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      days.push({
        dateStr: `${yStr}-${mStr}-${dStr}`,
        day: d.getDate(),
        dayOfWeek: dayNames[i],
        isSunday: i === 6,
        isSaturday: i === 5,
      });
    }
    return days;
  };

  // 가변 리사이저 드래그 핸들러 (요구사항 4-e)
  const [isResizing, setIsResizing] = useState(false);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = panelWidth;
    const startH = panelHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (panelPosition === 'RIGHT') {
        const diff = startX - moveEvent.clientX;
        const nextW = Math.min(560, Math.max(280, startW + diff));
        setPanelWidth(nextW);
      } else if (panelPosition === 'LEFT') {
        const diff = moveEvent.clientX - startX;
        const nextW = Math.min(560, Math.max(280, startW + diff));
        setPanelWidth(nextW);
      } else if (panelPosition === 'BOTTOM') {
        const diff = startY - moveEvent.clientY;
        const nextH = Math.min(520, Math.max(220, startH + diff));
        setPanelHeight(nextH);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
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

  // 서비스 뱃지 정보
  const getServiceInfo = (type: ServiceType) => {
    switch (type) {
      case 'LEDGER':
        return { label: '가계부 (결제/급여)', color: 'bg-sky-500' };
      case 'DUTY':
        return { label: '모아당번 (과업/대신)', color: 'bg-fuchsia-500' };
      case 'GOAL':
        return { label: '모아목표 (D-Day)', color: 'bg-teal-500' };
      case 'ROUTINE':
        return { label: '모아루틴 (약/세금)', color: 'bg-violet-500' };
      case 'PERSONAL':
        return { label: '개인 할일 📌', color: 'bg-indigo-500' };
      case 'DIARY':
        return { label: '스마트 일기 📝', color: 'bg-amber-500' };
      default:
        return { label: type, color: 'bg-slate-500' };
    }
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-28 ${
        isResizing ? 'select-none' : ''
      }`}
    >
      {/* 1. 상단 글로벌 네비게이션 헤더 (요구사항 1, 2-b, 3: 버튼배치 정돈 & 중복버튼 삭제) */}
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

          {/* Group 2 (ii): 동적 연월/주간/일간 네비게이션 & [오늘] & [⚙️ 설정] 묶음 응집 */}
          <div className="flex items-center gap-1.5 self-start lg:self-center flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={handlePrevNav}
                aria-label="이전 대상 이동"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                title="이전 (월/주/일)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-extrabold px-2.5 text-slate-800 dark:text-zinc-200 min-w-[110px] text-center whitespace-nowrap select-none">
                {navTitleText}
              </span>
              <button
                onClick={handleNextNav}
                aria-label="다음 대상 이동"
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                title="다음 (월/주/일)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleGoToday}
                className="px-2.5 py-1 ml-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors whitespace-nowrap"
              >
                오늘
              </button>
            </div>

            {/* [표시 설정] 버튼을 [오늘] 옆으로 이동 응집 (요구사항 2-b) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors flex items-center justify-center shrink-0 shadow-2xs"
              title="모아데이 표시 및 수집 설정"
            >
              <Settings2 className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            </button>
          </div>

          {/* Group 3 (iii): 뷰모드 탭 단독 배치 (중복 등록버튼 삭제 완료 - 요구사항 3) */}
          <div className="flex items-center justify-between lg:justify-end gap-2 flex-wrap">
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
          </div>
        </div>

        {/* 2. 4대 서비스 퀵필터 바 & 뷰모드/패널위치 설정 아이콘 (요구사항 2, 4-a: 접기버튼 제거) */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* 가로 슬라이드 드래그 휠 필터 목록 (타이틀 고정, 전체~개인할일 항목만 ElmSld03 적용) */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 shrink-0 flex items-center gap-1 whitespace-nowrap">
              <Filter className="w-3 h-3" /> 필터:
            </span>

            <ElmSld03
              showNavButtons={false}
              className="min-w-0 flex-1"
              innerClassName="flex items-center gap-2 pb-0.5"
            >
              {/* 전체 선택 토글 칩 */}
              <button
                type="button"
                onClick={handleToggleAllFilters}
                className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                  selectedFilters.length === availableFilterTypes.length
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-slate-900 dark:border-zinc-100 shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                }`}
              >
                <span>전체 ({selectedFilters.length}/{availableFilterTypes.length})</span>
              </button>

              {/* 켜진 서비스 개별 멀티 토글 칩 */}
              {availableFilterTypes.map((type) => {
                const info = getServiceInfo(type);
                const isSelected = selectedFilters.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
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
            </ElmSld03>
          </div>

          {/* 뷰 제어 아이콘 툴바 (요구사항 4-a: 접기 제거하고 [좌측|우측|하단] 3개 위치만 제공) */}
          <div className="flex items-center gap-1 shrink-0 self-start sm:self-center border-l sm:border-l sm:pl-3 border-slate-200 dark:border-zinc-800 flex-wrap">
            {/* 1) 달력 전체화면 토글 */}
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

            {/* 2) 달력이력 (과거의 오늘 회고) 완전 온/오프 (요구사항 1) */}
            <button
              onClick={toggleHistoryVisibility}
              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs font-bold ${
                isHistoryVisible
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                  : 'border-slate-200 dark:border-zinc-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="과거의 오늘 회고 캐러셀 완전 표시/숨김"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden md:inline">달력이력</span>
            </button>

            {/* 3) 패널 위치 선택기 [좌측 | 우측 | 하단] (접기 버튼 제거 완료 - 요구사항 4-a) */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold">
              {(
                [
                  { pos: 'LEFT', label: '좌측' },
                  { pos: 'RIGHT', label: '우측' },
                  { pos: 'BOTTOM', label: '하단' },
                ] as const
              ).map((p) => (
                <button
                  key={p.pos}
                  onClick={() => handleSetPanelPosition(p.pos)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                    panelPosition === p.pos && !isFullScreen
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 접힌 패널 다시 열기 플로팅 버튼 (패널이 접혀있을 때만 노출) */}
            {panelPosition === 'COLLAPSED' && !isFullScreen && (
              <button
                onClick={handleFoldPanel}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100"
              >
                <PanelRightOpen className="w-3.5 h-3.5" />
                <span>패널 열기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. 메인 그리드 및 가변 리사이저 레이아웃 (요구사항 4-e 드래그 리사이징) */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div
          className={`flex flex-col lg:flex-row gap-0 items-start ${
            panelPosition === 'BOTTOM' ? 'flex-col' : ''
          }`}
        >
          {/* 패널이 'LEFT'일 때 상세 패널 좌측 배치 */}
          {!isFullScreen && panelPosition === 'LEFT' && (
            <div
              style={{ width: `${panelWidth}px` }}
              className="hidden lg:block shrink-0 space-y-4"
            >
              {renderDetailPanel('LEFT')}
            </div>
          )}

          {/* 좌측 리사이저 바 (패널이 LEFT일 때) */}
          {!isFullScreen && panelPosition === 'LEFT' && (
            <div
              onMouseDown={handleStartResize}
              className="hidden lg:flex w-3 hover:w-3.5 items-center justify-center cursor-col-resize group shrink-0 self-stretch px-0.5"
              title="드래그하여 패널 너비 조절"
            >
              <div className="w-1 h-12 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-indigo-500 group-hover:w-1.5 transition-all" />
            </div>
          )}

          {/* 좌측 접힘 상태일 때: 좌측 경계면 슬림 펴기 핸들 (요구사항 3-b) */}
          {!isFullScreen && panelPosition === 'COLLAPSED' && savedPanelBeforeCollapse === 'LEFT' && (
            <button
              onClick={handleFoldPanel}
              className="hidden lg:flex w-6 hover:w-7 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-r-xl items-center justify-center py-6 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] [writing-mode:vertical-lr] tracking-wider shadow-md transition-all self-stretch my-2 shrink-0 cursor-pointer"
              title="접힌 좌측 상세 패널 다시 열기"
            >
              <span>▶ 패널 열기</span>
            </button>
          )}

          {/* 중앙 메인 캘린더 영역 (가변 너비) */}
          <div className="flex-1 w-full space-y-4 min-w-0">
            {/* 1. 월간 뷰 */}
            {viewMode === 'MONTH' && (
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

                        {/* 일기 배지 (기본 📝, 단독 필터 시 기분 이모지) */}
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
            )}

            {/* 2. 주간 뷰: 월~일 7일간 일자별 테두리 카드로 묶어 그룹핑 표시 (요구사항 1-a) */}
            {viewMode === 'WEEK' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200">
                      주간 일정 그룹핑 목록 ({navTitleText})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">월~일 7일간 테두리 카드 그룹핑</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {getDaysOfWeek(selectedDate).map((dayInfo) => {
                    const dEvents = eventsByDate[dayInfo.dateStr] || [];
                    const dDiary = diaries[dayInfo.dateStr];
                    const isSelected = selectedDate === dayInfo.dateStr;
                    const isToday = dayInfo.dateStr === '2026-11-22';

                    return (
                      <div
                        key={dayInfo.dateStr}
                        onClick={() => setSelectedDate(dayInfo.dateStr)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[140px] ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          {/* 일자 헤더 */}
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  isToday
                                    ? 'bg-indigo-600 text-white'
                                    : dayInfo.isSunday
                                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50'
                                    : dayInfo.isSaturday
                                    ? 'text-sky-500 bg-sky-50 dark:bg-sky-950/50'
                                    : 'text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800'
                                }`}
                              >
                                {dayInfo.day}일 ({dayInfo.dayOfWeek})
                              </span>
                              {isToday && (
                                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                                  오늘
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreateOnDate(dayInfo.dateStr, 'PLAN');
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              title="일정/일기 추가"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* 일기 뱃지 */}
                          {dDiary && (
                            <div className="mt-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 w-fit">
                                <span>{isOnlyDiaryFiltered ? dDiary.moodEmoji : '📝'}</span>
                                <span className="truncate max-w-[120px]">{dDiary.keywordTags[0] || '일기'}</span>
                              </span>
                            </div>
                          )}

                          {/* 등록된 일정 목록 */}
                          <div className="mt-2 space-y-1.5">
                            {dEvents.length === 0 ? (
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 py-1">
                                일정 없음
                              </p>
                            ) : (
                              dEvents.map((evt) => (
                                <div
                                  key={evt.id}
                                  style={{ borderLeftColor: evt.color }}
                                  className="text-[11px] leading-tight font-medium p-1.5 rounded bg-slate-50 dark:bg-zinc-800/80 text-slate-800 dark:text-zinc-200 border-l-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate font-bold">
                                      {evt.sticker && <span className="mr-0.5">{evt.sticker}</span>}
                                      {evt.title}
                                    </span>
                                    {evt.startTime && (
                                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                                        {evt.startTime}
                                      </span>
                                    )}
                                  </div>
                                  {evt.amount && (
                                    <p className="text-[10px] font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                                      {evt.amount.toLocaleString()}원
                                    </p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-1.5 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{dEvents.length}건 등록</span>
                          {isSelected && <span className="text-indigo-600 font-bold">선택됨 ✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. 일간 뷰: 등록 항목 시간대별 열거 & 클릭 시 세부 아코디언 펼침 (요구사항 1-b) */}
            {viewMode === 'DAY' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>{selectedDate} 일간 상세 타임라인</span>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                        총 {(eventsByDate[selectedDate] || []).length}건
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      항목을 클릭하면 상세 메모 및 위치 정보 아코디언이 펼쳐집니다.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenCreateOnDate(selectedDate, 'PLAN')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>일정 추가</span>
                  </button>
                </div>

                {(eventsByDate[selectedDate] || []).length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl">
                    <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
                      이 날짜에 등록된 일정이 없습니다.
                    </p>
                    <button
                      onClick={() => handleOpenCreateOnDate(selectedDate, 'PLAN')}
                      className="mt-3 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>새 일정 또는 스마트 일기 작성</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(eventsByDate[selectedDate] || []).map((evt) => {
                      const isExpanded = expandedDayEventId === evt.id;
                      return (
                        <div
                          key={evt.id}
                          onClick={() => setExpandedDayEventId(isExpanded ? null : evt.id)}
                          className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 transition-all cursor-pointer bg-white dark:bg-zinc-800/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div
                                style={{ backgroundColor: evt.color }}
                                className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                                    {evt.startTime ? `${evt.startTime} ~ ${evt.endTime || '종료시'}` : '종일'}
                                  </span>
                                  {evt.isImportant && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                      중요 ⭐
                                    </span>
                                  )}
                                  {evt.isPrivate && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                      🔒 비공개
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                    {evt.serviceType}
                                  </span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-1">
                                  {evt.sticker && <span className="mr-1">{evt.sticker}</span>}
                                  {evt.title}
                                </h4>

                                {evt.amount && (
                                  <p className="text-xs font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                                    금액: {evt.amount.toLocaleString()}원
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {evt.sourceId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (evt.serviceType === 'DUTY') onNavigateToDuty?.(evt.sourceId);
                                    if (evt.serviceType === 'GOAL') onNavigateToGoal?.(evt.sourceId);
                                  }}
                                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                  상세보기 <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-1.5 text-slate-600 dark:text-zinc-400">
                              {evt.description && (
                                <p>
                                  <strong>메모/설명:</strong> {evt.description}
                                </p>
                              )}
                              {evt.location && (
                                <p>
                                  <strong>위치:</strong> 📍 {evt.location}
                                </p>
                              )}
                              {evt.recurrenceRule && (
                                <p className="text-indigo-600 dark:text-indigo-400">
                                  <strong>반복 규칙:</strong> 🔄 {evt.recurrenceRule.summary}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. 아젠다 목록 뷰 */}
            {viewMode === 'AGENDA' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>전체 일정 타임라인 ({filteredEvents.length}건)</span>
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

            {/* 과거의 오늘 동적 회고 캐러셀 (완전 표시/숨김 & 헤더 유지 아코디언 & 가로 드래그 스크롤 - 요구사항 1, 2, 3) */}
            {isHistoryVisible && activePastDiaries.length > 0 && !isFullScreen && (
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
                        N년 전 오늘, 나는 어떤 일상과 소비를 기록했을까요? (가로 드래그/휠 지원)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleHistoryContentCollapse}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-amber-100/60 dark:hover:bg-zinc-800 transition-colors"
                    title={isHistoryContentCollapsed ? '내용 펼치기' : '내용 접기 (헤더 유지)'}
                  >
                    {isHistoryContentCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>

                {!isHistoryContentCollapsed && (
                  <ElmSld03
                    showNavButtons={false}
                    stepWidth={280}
                    className="min-w-0"
                    innerClassName="flex items-stretch gap-3 pb-1"
                  >
                    {activePastDiaries.map((past) => (
                      <div
                        key={past.yearsAgo}
                        className="min-w-[260px] max-w-[320px] p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-amber-100 dark:border-zinc-700/80 shadow-xs shrink-0 self-stretch flex flex-col justify-between"
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
                  </ElmSld03>
                )}
              </div>
            )}
          </div>

          {/* 우측 접힘 상태일 때: 우측 경계면 슬림 펴기 핸들 (요구사항 3-b) */}
          {!isFullScreen && panelPosition === 'COLLAPSED' && savedPanelBeforeCollapse === 'RIGHT' && (
            <button
              onClick={handleFoldPanel}
              className="hidden lg:flex w-6 hover:w-7 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-l-xl items-center justify-center py-6 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] [writing-mode:vertical-lr] tracking-wider shadow-md transition-all self-stretch my-2 shrink-0 cursor-pointer"
              title="접힌 우측 상세 패널 다시 열기"
            >
              <span>◀ 패널 열기</span>
            </button>
          )}

          {/* 우측 리사이저 바 (패널이 RIGHT일 때) */}
          {!isFullScreen && panelPosition === 'RIGHT' && (
            <div
              onMouseDown={handleStartResize}
              className="hidden lg:flex w-3 hover:w-3.5 items-center justify-center cursor-col-resize group shrink-0 self-stretch px-0.5"
              title="드래그하여 패널 너비 조절"
            >
              <div className="w-1 h-12 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-indigo-500 group-hover:w-1.5 transition-all" />
            </div>
          )}

          {/* 패널이 'RIGHT'일 때 상세 패널 우측 배치 */}
          {!isFullScreen && panelPosition === 'RIGHT' && (
            <div
              style={{ width: `${panelWidth}px` }}
              className="hidden lg:block shrink-0 space-y-4"
            >
              {renderDetailPanel('RIGHT')}
            </div>
          )}

          {/* 모바일 화면에서는 항상 캘린더 아래에 배치 */}
          {!isFullScreen && panelPosition !== 'COLLAPSED' && panelPosition !== 'BOTTOM' && (
            <div className="block lg:hidden w-full mt-4 space-y-4">
              {renderDetailPanel('BOTTOM')}
            </div>
          )}
        </div>

        {/* 하단 패널 리사이저 바 (패널이 BOTTOM일 때) */}
        {!isFullScreen && panelPosition === 'BOTTOM' && (
          <>
            <div
              onMouseDown={handleStartResize}
              className="w-full h-3 hover:h-4 flex items-center justify-center cursor-row-resize group my-1"
              title="드래그하여 패널 높이 조절"
            >
              <div className="h-1 w-20 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-indigo-500 group-hover:h-1.5 transition-all" />
            </div>
            <div
              style={{ minHeight: `${panelHeight}px` }}
              className="w-full space-y-4"
            >
              {renderDetailPanel('BOTTOM')}
            </div>
          </>
        )}

        {/* 하단 패널이 접혀있을 때: 하단 슬림 펴기 핸들 바 (요구사항 3-b) */}
        {!isFullScreen && panelPosition === 'COLLAPSED' && savedPanelBeforeCollapse === 'BOTTOM' && (
          <div className="w-full flex justify-center py-2">
            <button
              onClick={handleFoldPanel}
              className="px-5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              title="접힌 하단 상세 패널 다시 펼치기"
            >
              <ChevronUp className="w-4 h-4" />
              <span>▲ 상세 패널 펼치기</span>
            </button>
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

      {/* 9. 일기 및 일정 대형 상세 확대보기 팝업 모달 (요구사항 4-a, b) */}
      <MoaDayDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        selectedDate={selectedDate}
        onDateChange={(newD) => setSelectedDate(newD)}
        diary={selectedDayDiary}
        events={selectedDayEvents}
        onPlayAudio={(media) =>
          setPlayingAudio({
            name: media.name,
            duration: media.duration || '15:32',
            isPlaying: true,
            currentTime: 0,
            totalTime: 932,
            playbackRate: 1.0,
          })
        }
        onViewDoc={(media) => setViewingDoc({ name: media.name, size: media.size || '1.2 MB' })}
        onDownloadItem={handleDownloadFile}
        onDownloadAllZip={handleDownloadAllZip}
        onOpenCreateDiary={() => handleOpenCreateOnDate(selectedDate, 'DIARY')}
        onOpenCreatePlan={() => handleOpenCreateOnDate(selectedDate, 'PLAN')}
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

  // 일자상세 패널 렌더러 (위치 방향별 접기 버튼 연계)
  function renderDetailPanel(direction: 'LEFT' | 'RIGHT' | 'BOTTOM') {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs">
        {/* 패널 헤더: 날짜, 확대보기 버튼, 추가 버튼, 방향성 접기 버튼 (요구사항 4-a,b) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">선택된 일자</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
              {selectedDate}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {/* 대형 팝업 확대보기 버튼 (요구사항 4-a) */}
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors whitespace-nowrap"
              title="대형 팝업으로 상세 확대보기"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>확대보기</span>
            </button>

            <button
              onClick={() => handleOpenCreateOnDate(selectedDate, 'PLAN')}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>추가</span>
            </button>

            {/* 방향성 접기 버튼: 우측일 때 오른쪽으로 접기, 좌측일 때 왼쪽으로 접기, 하단일 때 상하접기 */}
            <button
              onClick={direction === 'BOTTOM' ? toggleDetailCollapse : handleFoldPanel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title={
                direction === 'RIGHT'
                  ? '오른쪽으로 패널 접기'
                  : direction === 'LEFT'
                  ? '왼쪽으로 패널 접기'
                  : isDetailCollapsed
                  ? '패널 펼치기'
                  : '패널 접기'
              }
            >
              {direction === 'RIGHT' ? (
                <PanelRightClose className="w-4 h-4" />
              ) : direction === 'LEFT' ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : isDetailCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {(!isDetailCollapsed || direction !== 'BOTTOM') && (
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

                  {/* 태그 칩 필터 바 (ElmSld03 슬라이드드래그휠 적용) */}
                  <ElmSld03
                    showNavButtons={false}
                    className="min-w-0"
                    innerClassName="flex items-center gap-1 pb-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDetailTagFilter('ALL')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${
                        selectedDetailTagFilter === 'ALL'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      전체보기
                    </button>
                    {selectedDayDiary.keywordTags.map((tag, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setSelectedDetailTagFilter((prev) => (prev === tag ? 'ALL' : tag))
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all shadow-2xs whitespace-nowrap shrink-0 ${
                          selectedDetailTagFilter === tag
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </ElmSld03>

                  {/* 일기 렌더링 영역 (전체보기 시 공통 + 태그별 에피소드 전수 표시 - 요구사항 5) */}
                  {selectedDetailTagFilter === 'ALL' ? (
                    <div className="space-y-3">
                      {/* 1) 공통 3줄 일기 */}
                      {selectedDayDiary.threeLines &&
                        (selectedDayDiary.threeLines.event || selectedDayDiary.threeLines.thought) && (
                          <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-amber-200/60 dark:border-zinc-700 text-xs space-y-1">
                            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 block mb-0.5">
                              📝 공통 3줄 요약
                            </span>
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

                      {/* 2) 공통 마크다운 본문 */}
                      {selectedDayDiary.contentMarkdown && (
                        <div className="text-xs text-slate-700 dark:text-zinc-300 max-h-48 overflow-y-auto pt-2 border-t border-amber-100 dark:border-zinc-700">
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 block mb-1">
                            📄 공통 본문
                          </span>
                          <ElmMkdViewer content={selectedDayDiary.contentMarkdown} />
                        </div>
                      )}

                      {/* 3) 태그별 에피소드 전수 열거 (요구사항 5) */}
                      {selectedDayDiary.taggedBlocks && selectedDayDiary.taggedBlocks.length > 0 && (
                        <div className="space-y-2.5 pt-2 border-t border-amber-200/50 dark:border-zinc-700">
                          <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block">
                            🏷️ 태그별 에피소드 ({selectedDayDiary.taggedBlocks.length}개)
                          </span>
                          {selectedDayDiary.taggedBlocks.map((block) => (
                            <div
                              key={block.tag}
                              className="p-2.5 rounded-lg bg-indigo-50/40 dark:bg-zinc-800/40 border border-indigo-200/60 dark:border-zinc-700 text-xs space-y-1.5"
                            >
                              <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 block">
                                {block.tag} 에피소드
                              </span>
                              {block.threeLines && (block.threeLines.event || block.threeLines.thought) && (
                                <div className="space-y-0.5 text-[11px] pl-1.5 border-l-2 border-indigo-300 dark:border-indigo-600">
                                  {block.threeLines.event && <div><strong>사건:</strong> {block.threeLines.event}</div>}
                                  {block.threeLines.thought && <div><strong>느낌:</strong> {block.threeLines.thought}</div>}
                                  {block.threeLines.tomorrow && <div><strong>다짐:</strong> {block.threeLines.tomorrow}</div>}
                                </div>
                              )}
                              {block.contentMarkdown && (
                                <div className="pt-1 text-xs">
                                  <ElmMkdViewer content={block.contentMarkdown} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 단일 선택 태그 에피소드 */
                    (() => {
                      const targetBlock = selectedDayDiary.taggedBlocks?.find(
                        (b) => b.tag === selectedDetailTagFilter
                      );
                      if (!targetBlock) {
                        return (
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 text-center text-xs text-slate-400">
                            [{selectedDetailTagFilter}] 전용 에피소드가 없습니다.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2 p-2.5 rounded-lg bg-indigo-50/40 dark:bg-zinc-800/40 border border-indigo-200/60 dark:border-zinc-700 text-xs">
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 block">
                            🏷️ [{targetBlock.tag}] 에피소드
                          </span>
                          {targetBlock.threeLines && (targetBlock.threeLines.event || targetBlock.threeLines.thought) && (
                            <div className="space-y-0.5 text-[11px] pl-1.5 border-l-2 border-indigo-300 dark:border-indigo-600">
                              {targetBlock.threeLines.event && <div><strong>사건:</strong> {targetBlock.threeLines.event}</div>}
                              {targetBlock.threeLines.thought && <div><strong>느낌:</strong> {targetBlock.threeLines.thought}</div>}
                              {targetBlock.threeLines.tomorrow && <div><strong>다짐:</strong> {targetBlock.threeLines.tomorrow}</div>}
                            </div>
                          )}
                          {targetBlock.contentMarkdown && (
                            <div className="pt-1 text-xs max-h-48 overflow-y-auto">
                              <ElmMkdViewer content={targetBlock.contentMarkdown} />
                            </div>
                          )}
                        </div>
                      );
                    })()
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
    );
  }
};
