// ============================================================================
// src/sample/screen/SCR_ROU_01_모아루틴.tsx
// 모아루틴 (MoaRoutine) 허브: 4대 생활·재무 루틴 카드/리스트 통합 화면
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  RotateCcw,
  SearchX,
} from 'lucide-react';
import { ElmTyp01, ElmInp04, ElmToast01, ElmSld03 } from '../elements/Tokens';
import { useMoaRoutine } from './routine/useMoaRoutine';
import {
  RoutineFilterCategory,
  ROUTINE_TODAY_ISO,
} from './routine/types';
import { getEnabledRoutinePlugins } from './routine/plugins/registry';
import {
  loadRoutinePluginSettings,
  RoutinePluginSettings,
  ROUTINE_PLUGIN_SETTINGS_EVENT,
} from './routine/plugins/pluginSettings';
import { RoutineStreakGrass } from './routine/RoutineStreakGrass';
import {
  RoutineCardRenderer,
  RoutineListRow,
  RoutineCardActionHandlers,
} from './routine/RoutineCards';
import { RoutineCreateModal, RoutineDetailModal } from './routine/RoutineModals';

export interface SCR_ROU_01_Props {
  onBack?: () => void;
  onNavigateToLedger?: () => void;
  onNavigateToDay?: () => void;
}

export const SCR_ROU_01_모아루틴: React.FC<SCR_ROU_01_Props> = ({
  onNavigateToLedger,
}) => {
  const [pluginSettings, setPluginSettings] = useState<RoutinePluginSettings>(
    loadRoutinePluginSettings
  );

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<RoutinePluginSettings>;
      if (customEvent.detail) {
        setPluginSettings(customEvent.detail);
      } else {
        setPluginSettings(loadRoutinePluginSettings());
      }
    };
    window.addEventListener(ROUTINE_PLUGIN_SETTINGS_EVENT, handleSettingsChanged);
    return () => {
      window.removeEventListener(ROUTINE_PLUGIN_SETTINGS_EVENT, handleSettingsChanged);
    };
  }, []);

  const enabledPlugins = useMemo(
    () => getEnabledRoutinePlugins(pluginSettings),
    [pluginSettings]
  );

  const filterOptions = useMemo<Array<{ id: RoutineFilterCategory; label: string }>>(
    () => [
      { id: 'ALL', label: '전체 루틴' },
      ...enabledPlugins.map((plugin) => ({
        id: plugin.category as RoutineFilterCategory,
        label: plugin.meta.shortLabel,
      })),
    ],
    [enabledPlugins]
  );

  const activeCategorySet = useMemo(
    () => new Set(enabledPlugins.map((p) => p.category)),
    [enabledPlugins]
  );
  const {
    filteredRoutines,
    selectedCategory,
    setSelectedCategory,
    categoryCounts,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    setIsCreateModalOpen,
    detailRoutine,
    setDetailRoutineId,
    toast,
    showToast,
    clearToast,
    toggleMedicineSlot,
    refillMedicine,
    toggleMvnoChecklist,
    captureMvnoOcrStep,
    completeMvnoRenewal,
    toggleTaxClientStatus,
    toggleCardPaymentStatus,
    toggleOcrItemConfirm,
    confirmAllOcrItems,
    attachOcrFiles,
    publishCardTransfer,
    createRoutine,
    deleteRoutine,
    resetDemoData,
  } = useMoaRoutine();

  const cardHandlers: RoutineCardActionHandlers = {
    onOpenDetail: (id) => setDetailRoutineId(id),
    onToggleMedicineSlot: toggleMedicineSlot,
    onRefillMedicine: (id) => refillMedicine(id, 30),
    onToggleMvnoChecklist: toggleMvnoChecklist,
    onCaptureMvnoOcrStep: captureMvnoOcrStep,
    onCompleteMvnoRenewal: (id) => completeMvnoRenewal(id),
    onToggleTaxClient: toggleTaxClientStatus,
    onToggleCardPayment: toggleCardPaymentStatus,
    onToggleOcrItemConfirm: toggleOcrItemConfirm,
    onConfirmAllOcrItems: confirmAllOcrItems,
    onAttachOcrFiles: attachOcrFiles,
    onPublishCardTransfer: publishCardTransfer,
    onNotify: showToast,
    onNavigateToLedger,
  };

  const visibleRoutines = useMemo(
    () => filteredRoutines.filter((r) => activeCategorySet.has(r.category)),
    [filteredRoutines, activeCategorySet]
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* 1. 상단 타이틀 및 루틴 등록 헤더 */}
      <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5">
        <ElmTyp01
          title="모아루틴 허브"
          badge="SCR-ROU-01"
          subtitle={`기준일 ${ROUTINE_TODAY_ISO} · 약복용·알뜰폰·세금계산서·급여카드 정산을 가계부와 관심사 분리하여 관리합니다.`}
          actions={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="min-h-[40px] px-3 sm:px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>루틴 등록</span>
              </button>
            </div>
          }
        />
      </section>

      {/* 2. 카테고리 필터 바 (ElmSld03 슬라이드드래그휠) + 검색 + 카드/리스트 뷰 스위처 */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <ElmSld03
          showNavButtons={false}
          className="min-w-0 flex-1"
          innerClassName="flex items-center gap-1.5 pb-1 md:pb-0"
        >
          {filterOptions.map((opt) => {
            const active = selectedCategory === opt.id;
            const count = categoryCounts[opt.id];
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedCategory(opt.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 border-slate-900 dark:border-zinc-100'
                    : 'bg-white dark:bg-[#131926] text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    active ? 'opacity-80' : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </ElmSld03>

        {/* 우측 검색창 & 뷰모드 전환 컨트롤 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex-1 md:w-56">
            <ElmInp04
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="루틴·병원·거래처·카드 검색"
            />
          </div>

          <div className="inline-flex items-center p-1 rounded-lg bg-slate-200/70 dark:bg-zinc-800/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('CARD')}
              aria-label="카드 뷰"
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'CARD'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">카드</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              aria-label="리스트 뷰"
              className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">리스트</span>
            </button>
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            title="샘플 데이터 초기화"
            aria-label="샘플 데이터 초기화"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131926] text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2-1. [0047] 주기 적응형 루틴 트래커 (선택 탭별 일간잔디/12개월블록/차수타임라인 동적 전환) */}
      <RoutineStreakGrass
        routines={visibleRoutines}
        selectedCategory={selectedCategory}
      />

      {/* 3. 메인 루틴 콘텐츠 (카드 그리드 vs 고밀도 리스트 vs 빈 상태) */}
      {visibleRoutines.length === 0 ? (
        <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
          <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
            <SearchX className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              조건에 맞는 루틴이 없습니다
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              검색어나 카테고리 필터를 초기화하거나 새 루틴을 등록해보세요.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 whitespace-nowrap cursor-pointer"
            >
              필터 초기화
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="min-h-[40px] px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              새 루틴 등록
            </button>
          </div>
        </section>
      ) : viewMode === 'CARD' ? (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {visibleRoutines.map((item) => (
            <RoutineCardRenderer key={item.id} item={item} handlers={cardHandlers} />
          ))}
        </section>
      ) : (
        <section className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800 overflow-hidden">
          {visibleRoutines.map((item) => (
            <RoutineListRow key={item.id} item={item} handlers={cardHandlers} />
          ))}
        </section>
      )}

      {/* 4. ElmBsh01 고정 3분할 등록 / 상세 모달 */}
      <RoutineCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createRoutine}
      />

      <RoutineDetailModal
        routine={detailRoutine}
        onClose={() => setDetailRoutineId(null)}
        onDelete={deleteRoutine}
        handlers={cardHandlers}
      />

      {/* 5. 토스트 알림 */}
      <ElmToast01 message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
};
