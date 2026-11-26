import React from 'react';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  CheckCircle2,
  Camera,
  Users,
  BarChart3,
  ArrowRightLeft,
  FileText,
  Flame,
  ShieldCheck,
  AlertCircle,
  Coins,
  Calendar,
  Share2,
  Lock,
  Unlock,
  Edit3,
} from 'lucide-react';
import { ElmTyp01, ElmSld03, ElmToast01 } from '../elements/Tokens';
import { formatKoreanCycleDays, getRotationPolicyLabel } from './duty/dutyUtils';
import { useMoaDutyDetail } from './duty/useMoaDutyDetail';
import { DutyExecutionTab } from './duty/DutyExecutionTab';
import { DutyStatsTab } from './duty/DutyStatsTab';
import { DutySubstituteTab } from './duty/DutySubstituteTab';
import { DutyLogsTab, DutyMembersTab } from './duty/DutyLogsMembersTabs';
import { DutyDetailModals } from './duty/DutyDetailModals';
import { DutyEditModal } from './duty/DutyEditModal';

// ============================================================================
// SCR_DUT_02_모아당번상세 (Slim Orchestrator Shell)
// - 수평 화면 import(SCR_DUT_01) 완전 제거, duty/ 하위 모듈로 SRP 분해 완료
// ============================================================================

interface ScrDut02Props {
  dutyId?: string;
  onBack?: () => void;
  onNavigateToManagement?: () => void;
  onOpenQuickRegister?: () => void;
}

export const SCR_DUT_02_모아당번상세: React.FC<ScrDut02Props> = ({
  dutyId = 'duty-01',
  onBack,
  onNavigateToManagement,
}) => {
  const state = useMoaDutyDetail(dutyId);
  const { duty } = state;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header Section */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBack || onNavigateToManagement}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
            title="모아당번 관리 목록으로 돌아가기"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <ElmTyp01
            title="모아당번 상세"
            badge="SCR-DUT-02"
            subtitle="역할 수행 인증·승인, 대신수행 상계정산 및 기여도 통계 • 함께 완성하는 책임 생활"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => {
              state.setIsRecruitmentOpen(!state.isRecruitmentOpen);
              state.showToast(
                state.isRecruitmentOpen
                  ? '멤버 모집이 동결되었습니다. 신규 초대가 제한됩니다.'
                  : '멤버 모집이 개시되었습니다.'
              );
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer whitespace-nowrap ${
              state.isRecruitmentOpen
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
            }`}
            title="마스터 권한: 신규 참여자 모집 상태 변경"
          >
            {state.isRecruitmentOpen ? (
              <Unlock className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{state.isRecruitmentOpen ? '모집 진행중' : '모집 동결'}</span>
          </button>

          <button
            type="button"
            onClick={state.handleOpenEditModal}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            title="당번 과업 속성, 정책 및 상태 수정"
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>당번 정보 수정</span>
          </button>

          <button
            type="button"
            onClick={() => state.setInviteLinkModalOpen(true)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
            title="초대 링크 생성"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>초대 링크 생성</span>
          </button>
        </div>
      </section>

      {/* 2. Duty Profile & Orthogonal 3-State Lifecycle Banner */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                {duty.category_name}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <span>{formatKoreanCycleDays(duty.cycle_config.days_of_week)}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60">
                {getRotationPolicyLabel(duty.rotation_policy)}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
              {duty.duty_title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
              {duty.duty_description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => state.setProofModalOpen(true)}
              className="flex-1 md:flex-none min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>완수 인증 제출</span>
            </button>
            <button
              type="button"
              onClick={() => state.setSubstituteModalOpen(true)}
              className="flex-1 md:flex-none min-h-[44px] px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ArrowRightLeft className="w-4 h-4 shrink-0" />
              <span>대신수행 요청</span>
            </button>
          </div>
        </div>

        {/* Orthogonal 3-State Info Dashboard */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    ① 진행 상태
                  </span>
                  <button
                    type="button"
                    onClick={() => state.setShowStateGuideModal(true)}
                    className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                    title="직교 3상태머신 설명 레이어 팝업 열기"
                  >
                    ?
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  담당: {duty.current_assigned_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {duty.progress_status === 'COMPLETED' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>완수 마감 (COMPLETED)</span>
                  </span>
                ) : duty.progress_status === 'SUBMITTED' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>인증 제출됨 (SUBMITTED)</span>
                  </span>
                ) : duty.progress_status === 'IN_PROGRESS' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5 shadow-2xs">
                    <Flame className="w-4 h-4 text-blue-600" />
                    <span>수행 진행중 (IN_PROGRESS)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>할당/대기 (ASSIGNED)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  ② 정산 기준 & 상태
                </span>
                <select
                  aria-label="정산 기준 주기 선택"
                  value={state.settlementCycle}
                  onChange={(e) => {
                    const val = e.target.value as 'WEEKLY' | 'MONTHLY' | 'DAILY';
                    state.setSettlementCycle(val);
                    state.showToast(
                      `정산 기준 주기가 "${
                        val === 'WEEKLY' ? '주간정산' : val === 'MONTHLY' ? '월간정산' : '일간정산'
                      }"(으)로 변경되었습니다.`
                    );
                  }}
                  className="text-[11px] font-bold py-1 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="WEEKLY">주간정산 (WEEKLY)</option>
                  <option value="MONTHLY">월간정산 (MONTHLY)</option>
                  <option value="DAILY">일간정산 (DAILY)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                {duty.settlement_status === 'SETTLED' ? (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5 shadow-2xs">
                    <Coins className="w-4 h-4 text-indigo-600" />
                    <span>정산 완료 (SETTLED)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>미정산 (UNSETTLED)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">③ 평가 검증</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  정책: {duty.approval_policy}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div>
                  {duty.evaluation_status === 'AUTO_APPROVED' ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1.5 shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <span>자동 승인 완료</span>
                    </span>
                  ) : duty.evaluation_status === 'MANUAL_CONFIRMED' ? (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>상호 승인 완료</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span>미검증 (UNVERIFIED)</span>
                    </span>
                  )}
                </div>
                {duty.evaluation_status === 'UNVERIFIED' && (
                  <button
                    type="button"
                    onClick={state.handleApproveDuty}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>✓ 피어 승인</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tab Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-zinc-800 pb-2">
        <ElmSld03
          showNavButtons={false}
          className="w-full"
          innerClassName="items-center gap-1.5 pb-0.5 flex-nowrap"
        >
          {(
            [
              { id: 'EXECUTION', label: '당번 수행 및 인증', icon: Clock },
              { id: 'STATS', label: '실시간 통계 & 랭킹', icon: BarChart3 },
              { id: 'SUBSTITUTE', label: '대신수행 & 상계정산', icon: ArrowRightLeft },
              { id: 'LOGS', label: `수행 이력 (${state.dutyLogs.length})`, icon: FileText },
              {
                id: 'MEMBERS',
                label: `구성원 정보 & 관리 (${duty.participants.length})`,
                icon: Users,
              },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => state.setActiveTab(id)}
              className={`shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                state.activeTab === id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </ElmSld03>
      </div>

      {/* 4. Active Tab Content */}
      {state.activeTab === 'EXECUTION' && (
        <DutyExecutionTab
          duty={duty}
          nextAssignee={state.nextAssignee}
          dutyLogs={state.dutyLogs}
          onApproveDuty={state.handleApproveDuty}
        />
      )}

      {state.activeTab === 'STATS' && (
        <DutyStatsTab
          statsPeriod={state.statsPeriod}
          setStatsPeriod={state.setStatsPeriod}
          selectedStatPoint={state.selectedStatPoint}
          setSelectedStatPoint={state.setSelectedStatPoint}
          statsResult={state.statsResult}
          memberRanks={state.memberRanks}
          kpis={state.kpis}
        />
      )}

      {state.activeTab === 'SUBSTITUTE' && (
        <DutySubstituteTab
          nettingPairs={state.nettingPairs}
          onOpenReportModal={state.handleOpenReportModal}
          onCompleteNetting={(pair) =>
            state.showToast(
              `✓ ${pair.from_name} ➔ ${pair.to_name} ₩${pair.netted_amount.toLocaleString()} 상계 정산 완료!`
            )
          }
          onCopyPaymentLink={state.handleCopyPaymentLink}
        />
      )}

      {state.activeTab === 'LOGS' && (
        <DutyLogsTab
          dutyLogsCount={state.dutyLogs.length}
          selectedLogMemberName={state.selectedLogMemberName}
          setSelectedLogMemberName={state.setSelectedLogMemberName}
          logMembersSummary={state.logMembersSummary}
          filteredLogs={state.filteredLogs}
        />
      )}

      {state.activeTab === 'MEMBERS' && (
        <DutyMembersTab
          duty={duty}
          memberSubTab={state.memberSubTab}
          setMemberSubTab={state.setMemberSubTab}
          onOpenInviteModal={() => state.setInviteLinkModalOpen(true)}
          onRemoveMember={state.handleRemoveMember}
        />
      )}

      {/* 5. Modals & Toast */}
      <DutyDetailModals
        duty={duty}
        proofModalOpen={state.proofModalOpen}
        setProofModalOpen={state.setProofModalOpen}
        proofImage={state.proofImage}
        setProofImage={state.setProofImage}
        proofMemo={state.proofMemo}
        setProofMemo={state.setProofMemo}
        onSubmitProof={state.handleSubmitProof}
        substituteModalOpen={state.substituteModalOpen}
        setSubstituteModalOpen={state.setSubstituteModalOpen}
        subTargetType={state.subTargetType}
        setSubTargetType={state.setSubTargetType}
        selectedSubTargetMemberIds={state.selectedSubTargetMemberIds}
        setSelectedSubTargetMemberIds={state.setSelectedSubTargetMemberIds}
        subReward={state.subReward}
        setSubReward={state.setSubReward}
        subReason={state.subReason}
        setSubReason={state.setSubReason}
        onSubmitSubstitute={state.handleSubmitSubstitute}
        reportModalOpen={state.reportModalOpen}
        setReportModalOpen={state.setReportModalOpen}
        generatedReport={state.generatedReport}
        inviteLinkModalOpen={state.inviteLinkModalOpen}
        setInviteLinkModalOpen={state.setInviteLinkModalOpen}
        shortInviteUrl={state.shortInviteUrl}
        onCopyShortLink={state.handleCopyShortLink}
        showStateGuideModal={state.showStateGuideModal}
        setShowStateGuideModal={state.setShowStateGuideModal}
        showToast={state.showToast}
      />

      <DutyEditModal
        isOpen={state.editModalOpen}
        onClose={() => state.setEditModalOpen(false)}
        onSubmit={state.handleSaveDutyEdit}
        editFormTitle={state.editFormTitle}
        setEditFormTitle={state.setEditFormTitle}
        editFormDesc={state.editFormDesc}
        setEditFormDesc={state.setEditFormDesc}
        editFormCategory={state.editFormCategory}
        setEditFormCategory={state.setEditFormCategory}
        editFormRotationPolicy={state.editFormRotationPolicy}
        setEditFormRotationPolicy={state.setEditFormRotationPolicy}
        editFormApprovalPolicy={state.editFormApprovalPolicy}
        setEditFormApprovalPolicy={state.setEditFormApprovalPolicy}
        editFormSettlementCycle={state.editFormSettlementCycle}
        setEditFormSettlementCycle={state.setEditFormSettlementCycle}
        editFormCycleDays={state.editFormCycleDays}
        setEditFormCycleDays={state.setEditFormCycleDays}
        editFormProgressStatus={state.editFormProgressStatus}
        setEditFormProgressStatus={state.setEditFormProgressStatus}
        editFormSettlementStatus={state.editFormSettlementStatus}
        setEditFormSettlementStatus={state.setEditFormSettlementStatus}
        editFormEvaluationStatus={state.editFormEvaluationStatus}
        setEditFormEvaluationStatus={state.setEditFormEvaluationStatus}
        descPreviewMode={state.descPreviewMode}
        setDescPreviewMode={state.setDescPreviewMode}
        showToast={state.showToast}
      />

      <ElmToast01
        message={state.toastMessage}
        onClose={() => state.setToastMessage(null)}
      />
    </div>
  );
};
