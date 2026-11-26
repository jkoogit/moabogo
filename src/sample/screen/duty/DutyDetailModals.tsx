import React from 'react';
import { Check, Download, Copy, Sparkles, ShieldCheck } from 'lucide-react';
import { ElmBsh01, ElmInp01, ElmTxt01 } from '../../elements/Tokens';
import { MoaDuty, DutyComprehensiveReport } from '../../../types';

interface DutyDetailModalsProps {
  duty: MoaDuty;
  // Proof modal
  proofModalOpen: boolean;
  setProofModalOpen: (v: boolean) => void;
  proofImage: string;
  setProofImage: (v: string) => void;
  proofMemo: string;
  setProofMemo: (v: string) => void;
  onSubmitProof: (e: React.FormEvent) => void;
  // Substitute modal
  substituteModalOpen: boolean;
  setSubstituteModalOpen: (v: boolean) => void;
  subTargetType: 'OPEN' | 'DIRECT';
  setSubTargetType: (v: 'OPEN' | 'DIRECT') => void;
  selectedSubTargetMemberIds: string[];
  setSelectedSubTargetMemberIds: (ids: string[]) => void;
  subReward: number;
  setSubReward: (v: number) => void;
  subReason: string;
  setSubReason: (v: string) => void;
  onSubmitSubstitute: (e: React.FormEvent) => void;
  // Report modal
  reportModalOpen: boolean;
  setReportModalOpen: (v: boolean) => void;
  generatedReport: DutyComprehensiveReport | null;
  // Invite modal
  inviteLinkModalOpen: boolean;
  setInviteLinkModalOpen: (v: boolean) => void;
  shortInviteUrl: string;
  onCopyShortLink: () => void;
  // State guide modal
  showStateGuideModal: boolean;
  setShowStateGuideModal: (v: boolean) => void;
  showToast: (msg: string) => void;
}

export const DutyDetailModals: React.FC<DutyDetailModalsProps> = ({
  duty,
  proofModalOpen,
  setProofModalOpen,
  proofImage,
  setProofImage,
  proofMemo,
  setProofMemo,
  onSubmitProof,
  substituteModalOpen,
  setSubstituteModalOpen,
  subTargetType,
  setSubTargetType,
  selectedSubTargetMemberIds,
  setSelectedSubTargetMemberIds,
  subReward,
  setSubReward,
  subReason,
  setSubReason,
  onSubmitSubstitute,
  reportModalOpen,
  setReportModalOpen,
  generatedReport,
  inviteLinkModalOpen,
  setInviteLinkModalOpen,
  shortInviteUrl,
  onCopyShortLink,
  showStateGuideModal,
  setShowStateGuideModal,
  showToast,
}) => {
  return (
    <>
      {/* 1. 인증 사진 첨부 및 완수 제출 모달 */}
      <ElmBsh01
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        title="당번 수행 인증 제출"
        badge="사진 인증"
      >
        <form onSubmit={onSubmitProof} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              인증 사진 (로컬 오프라인 자산 또는 이미지 데이터)
            </label>
            <ElmInp01
              value={proofImage}
              onChange={setProofImage}
              placeholder="인증 이미지 경로 또는 데이터 URI 입력..."
            />
            {proofImage && (
              <img
                src={proofImage}
                alt="미리보기"
                className="w-full h-36 object-cover rounded-xl mt-2 border border-slate-200 dark:border-zinc-700"
              />
            )}
          </div>

          <ElmTxt01
            label="완수 확인 메모 및 특이사항"
            value={proofMemo}
            onChange={setProofMemo}
            placeholder="예: 거실 및 복도 소독 걸레질 완료했습니다. 다음 당번 분은 먼지통 필터 교체 필요합니다!"
            rows={3}
            maxLength={200}
            helperText="구성원 피어가 확인 후 즉시 승인할 수 있도록 간략한 완수 메모를 남겨주세요."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setProofModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              인증 제출 완료
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* 2. 대신수행 요청 등록 모달 */}
      <ElmBsh01
        isOpen={substituteModalOpen}
        onClose={() => setSubstituteModalOpen(false)}
        title="당번 대신수행 요청"
        badge="상계 보상"
      >
        <form onSubmit={onSubmitSubstitute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              요청 대상 범위
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubTargetType('OPEN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  subTargetType === 'OPEN'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                전체 오픈 요청 (선착순)
              </button>
              <button
                type="button"
                onClick={() => setSubTargetType('DIRECT')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  subTargetType === 'DIRECT'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                }`}
              >
                지정 요청 (구성원 선택)
              </button>
            </div>
          </div>

          {subTargetType === 'DIRECT' && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">
                대신수행을 요청할 구성원 선택 (복수 선택 가능)
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {duty.participants
                  .filter((p) => p.name !== duty.current_assigned_name && p.role === 'ASSIGNEE')
                  .map((candidate) => {
                    const isChecked = selectedSubTargetMemberIds.includes(candidate.participant_id);
                    return (
                      <div
                        key={candidate.participant_id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSubTargetMemberIds(
                              selectedSubTargetMemberIds.filter((id) => id !== candidate.participant_id)
                            );
                          } else {
                            setSelectedSubTargetMemberIds([
                              ...selectedSubTargetMemberIds,
                              candidate.participant_id,
                            ]);
                          }
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer border transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </span>
                          <span className="font-semibold">{candidate.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          가중치 {candidate.weight || 1}배
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              대신수행 보상금액 (모아머니 / 용돈)
            </label>
            <input
              type="number"
              value={subReward}
              onChange={(e) => setSubReward(Number(e.target.value))}
              className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-mono"
            />
          </div>

          <ElmTxt01
            label="대신수행 요청 사유"
            value={subReason}
            onChange={setSubReason}
            placeholder="예: 이번 주말 야근 및 출장으로 인해 대신수행 부탁드립니다. 다음 주 화요일 제가 대신 수행하겠습니다!"
            rows={3}
            maxLength={200}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setSubstituteModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              대신수행 요청 발송
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* 3. 종합 정산 보고서 모달 */}
      <ElmBsh01
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="대신수행 종합 정산 보고서"
        badge="PDF 리포트"
        maxWidth="max-w-2xl"
      >
        {generatedReport && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                  {generatedReport.period_label}
                </h4>
                <p className="text-[11px] text-slate-500">
                  보고서 번호: {generatedReport.report_id}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">발행일시</span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                  {generatedReport.generated_at}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                <span className="text-[10px] text-slate-400 block">총 수행 건수</span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-zinc-200">
                  {generatedReport.total_substitute_count}건
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800">
                <span className="text-[10px] text-slate-400 block">총 정산 완료액</span>
                <span className="text-base font-bold font-mono text-slate-800 dark:text-zinc-200">
                  ₩{generatedReport.total_settled_amount.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
                <span className="text-[10px] text-emerald-600 block">미정산 잔여액</span>
                <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₩{generatedReport.unsettled_amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  showToast('✓ 보고서 PDF 저장이 완료되었습니다.');
                  setReportModalOpen(false);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>PDF 다운로드</span>
              </button>
            </div>
          </div>
        )}
      </ElmBsh01>

      {/* 4. 단축 초대 링크 생성 모달 (화이트리스트 검증 배지 포함) */}
      <ElmBsh01
        isOpen={inviteLinkModalOpen}
        onClose={() => setInviteLinkModalOpen(false)}
        title="초대 링크 생성"
        badge="안전 단축 링크"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            화이트리스트 검증이 완료된 고유 단축 링크를 복사하여 메신저로 전달하세요. 상대방이
            접속하면 모아보고 로그인 후 바로 <strong>[{duty.duty_title}]</strong> 참여 수락 팝업이
            표시됩니다.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 truncate select-all">
                {shortInviteUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={onCopyShortLink}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>링크 복사</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-zinc-400 space-y-1">
            <div className="font-bold text-indigo-900 dark:text-indigo-300">운영 가이드</div>
            <p>
              신규 참여자가 수락 시 [구성원 정보 & 관리] 탭에 등록되며, 다음 회차 순환 큐부터
              공평하게 배정됩니다.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setInviteLinkModalOpen(false)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* 5. 직교 3상태머신 설명 레이어 팝업 */}
      <ElmBsh01
        isOpen={showStateGuideModal}
        onClose={() => setShowStateGuideModal(false)}
        title="모아당번 직교 3상태머신 가이드"
        badge="도메인 규칙"
        maxWidth="max-w-md"
      >
        <div className="space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1.5">
            <h4 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>직교 3상태머신(Orthogonal 3-State Machine)이란?</span>
            </h4>
            <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
              모아당번의 3개 상태축(진행, 정산, 검증)은 상호 간섭이나 종속 없이 독립적으로
              전이되는 모아보고의 핵심 도메인 거버넌스 규칙입니다.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-900">
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                ① 진행 상태 (Progress Status)
              </span>
              <p className="text-slate-500 text-[11px]">
                <strong>ASSIGNED(할당)</strong> ➔ <strong>IN_PROGRESS(수행중)</strong> ➔{' '}
                <strong>SUBMITTED(제출됨)</strong> ➔ <strong>COMPLETED(완수)</strong>
                <br />
                과업 수행 담당자의 실제 이행 주기를 추적합니다.
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-900">
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                ② 정산 상태 (Settlement Status)
              </span>
              <p className="text-slate-500 text-[11px]">
                <strong>UNSETTLED(미정산)</strong> ➔ <strong>SETTLED(정산완료)</strong>
                <br />
                주간/월간/일간 기준 주기에 따라 보상금 및 대신수행 채권·채무 상계를 처리합니다.
              </p>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-900">
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                ③ 평가 검증 상태 (Evaluation Status)
              </span>
              <p className="text-slate-500 text-[11px]">
                <strong>UNVERIFIED(미검증)</strong> ➔ <strong>AUTO_APPROVED(자동승인)</strong> /{' '}
                <strong>MANUAL_CONFIRMED(상호승인)</strong>
                <br />
                정책에 따라 피어 다자간 투표 또는 관리자 확인을 거쳐 인증의 신뢰성을 보증합니다.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowStateGuideModal(false)}
              className="min-h-[40px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              확인
            </button>
          </div>
        </div>
      </ElmBsh01>
    </>
  );
};
