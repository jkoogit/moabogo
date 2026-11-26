import React from 'react';
import {
  ElmTyp01,
  ElmInp04,
  ElmTre02,
  ElmToast01,
  ElmSld03,
} from '../elements/Tokens';
import { Plus, ChevronLeft } from 'lucide-react';
import { useMoaDutyManage, DutySortOption } from './duty/useMoaDutyManage';
import { DutyListSection } from './duty/DutyListSection';
import { DutyCreateModals } from './duty/DutyCreateModals';

interface SCR_DUT_01_Props {
  onBack?: () => void;
  onNavigateToDetail?: (dutyId: string) => void;
  onOpenQuickRegister?: () => void;
  onNavigateToGoal?: () => void;
}

export const SCR_DUT_01_모아당번관리: React.FC<SCR_DUT_01_Props> = ({
  onBack,
  onNavigateToDetail,
}) => {
  const vm = useMoaDutyManage();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header Section */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
              title="메인 대시보드로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <ElmTyp01
            title="모아당번 관리"
            badge="SCR-DUT-01"
            subtitle="가족·모임 정기 역할 분담 및 카테고리별 당번 관리 • 함께 완성하는 생활 과업"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => vm.setCreateModalOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>새 당번 등록</span>
          </button>
        </div>
      </section>

      {/* 2. Main Body: Left Category Tree + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3.5">
          <ElmTre02
            title="당번 카테고리 분류"
            data={vm.categoryTreeData}
            selectedIds={vm.selectedCategoryIds}
            onSelect={(newIds: string[]) => vm.setSelectedCategoryIds(newIds)}
            totalCount={vm.totalDutiesCount}
            isCollapsed={vm.isCategoryCollapsed}
            onToggleCollapse={() => vm.setIsCategoryCollapsed((prev) => !prev)}
          />
        </aside>

        <main className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Search Bar & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white dark:bg-[#121215] p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
            <div className="flex-1">
              <ElmInp04
                value={vm.searchQuery}
                onChange={vm.setSearchQuery}
                placeholder="당번 과업명, 담당자 이름, 카테고리 검색..."
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={vm.sortBy}
                onChange={(e) => vm.setSortBy(e.target.value as DutySortOption)}
                className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="DUE_DATE">마감기한 순</option>
                <option value="TITLE">과업 명칭순</option>
                <option value="COMPLETED">누적 완수순</option>
              </select>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
            <ElmSld03 showNavButtons={false} className="w-full" innerClassName="items-center gap-1.5 pb-0.5 flex-nowrap">
              <button
                type="button"
                onClick={() => vm.setActiveTab('ALL')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  vm.activeTab === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>전체 당번</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${vm.activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {vm.totalDutiesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => vm.setActiveTab('MY')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  vm.activeTab === 'MY'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>내 담당 당번</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${vm.activeTab === 'MY' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                  {vm.myDutiesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => vm.setActiveTab('SUBSTITUTE')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  vm.activeTab === 'SUBSTITUTE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>대신수행 요청</span>
                {vm.substituteRequestsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${vm.activeTab === 'SUBSTITUTE' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                    {vm.substituteRequestsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => vm.setActiveTab('INVITATION')}
                className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  vm.activeTab === 'INVITATION'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>초대함</span>
                {vm.pendingInvitationsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${vm.activeTab === 'INVITATION' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'}`}>
                    {vm.pendingInvitationsCount}
                  </span>
                )}
              </button>
            </ElmSld03>
          </div>

          <DutyListSection
            activeTab={vm.activeTab}
            invitations={vm.invitations}
            filteredDuties={vm.filteredDuties}
            onAcceptInvitation={vm.handleAcceptInvitation}
            onRejectInvitation={vm.handleRejectInvitation}
            onSelectDuty={onNavigateToDetail}
            onResetFilters={vm.resetAllFilters}
          />
        </main>
      </div>

      {/* 3. Modals */}
      <DutyCreateModals
        createModalOpen={vm.createModalOpen}
        onCloseCreateModal={() => vm.setCreateModalOpen(false)}
        memberSelectModalOpen={vm.memberSelectModalOpen}
        onCloseMemberSelectModal={() => vm.setMemberSelectModalOpen(false)}
        onOpenMemberSelectModal={() => vm.setMemberSelectModalOpen(true)}
        categories={vm.categories}
        formCategory={vm.formCategory}
        setFormCategory={vm.setFormCategory}
        formTitle={vm.formTitle}
        setFormTitle={vm.setFormTitle}
        formDesc={vm.formDesc}
        setFormDesc={vm.setFormDesc}
        descPreviewMode={vm.descPreviewMode}
        setDescPreviewMode={vm.setDescPreviewMode}
        formCycleDays={vm.formCycleDays}
        setFormCycleDays={vm.setFormCycleDays}
        formRotationPolicy={vm.formRotationPolicy}
        setFormRotationPolicy={vm.setFormRotationPolicy}
        formSettlementCycle={vm.formSettlementCycle}
        setFormSettlementCycle={vm.setFormSettlementCycle}
        formApprovalPolicy={vm.formApprovalPolicy}
        setFormApprovalPolicy={vm.setFormApprovalPolicy}
        formParticipants={vm.formParticipants}
        setFormParticipants={vm.setFormParticipants}
        memberSearchQuery={vm.memberSearchQuery}
        setMemberSearchQuery={vm.setMemberSearchQuery}
        selectedMemberRole={vm.selectedMemberRole}
        setSelectedMemberRole={vm.setSelectedMemberRole}
        onAddMemberToForm={vm.handleAddMemberToForm}
        onSubmitCreateDuty={vm.handleCreateDuty}
      />

      <ElmToast01 message={vm.toastMessage} onClose={() => vm.setToastMessage(null)} />
    </div>
  );
};
