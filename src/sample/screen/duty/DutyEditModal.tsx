import React from 'react';
import { Check } from 'lucide-react';
import { ElmBsh01 } from '../../elements/Tokens';
import {
  MoaDuty,
  DutyRotationPolicy,
  DutyApprovalPolicy,
} from '../../../types';
import { INITIAL_DUTY_CATEGORIES } from '../../dutyStore';
import { DUTY_WEEKDAYS, renderDutyMarkdown } from './dutyUtils';

interface DutyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editFormTitle: string;
  setEditFormTitle: (v: string) => void;
  editFormDesc: string;
  setEditFormDesc: (v: string) => void;
  editFormCategory: string;
  setEditFormCategory: (v: string) => void;
  editFormRotationPolicy: DutyRotationPolicy;
  setEditFormRotationPolicy: (v: DutyRotationPolicy) => void;
  editFormApprovalPolicy: DutyApprovalPolicy;
  setEditFormApprovalPolicy: (v: DutyApprovalPolicy) => void;
  editFormSettlementCycle: 'WEEKLY' | 'MONTHLY' | 'DAILY';
  setEditFormSettlementCycle: (v: 'WEEKLY' | 'MONTHLY' | 'DAILY') => void;
  editFormCycleDays: string[];
  setEditFormCycleDays: (v: string[]) => void;
  editFormProgressStatus: MoaDuty['progress_status'];
  setEditFormProgressStatus: (v: MoaDuty['progress_status']) => void;
  editFormSettlementStatus: MoaDuty['settlement_status'];
  setEditFormSettlementStatus: (v: MoaDuty['settlement_status']) => void;
  editFormEvaluationStatus: MoaDuty['evaluation_status'];
  setEditFormEvaluationStatus: (v: MoaDuty['evaluation_status']) => void;
  descPreviewMode: 'EDIT' | 'PREVIEW';
  setDescPreviewMode: (v: 'EDIT' | 'PREVIEW') => void;
  showToast: (msg: string) => void;
}

export const DutyEditModal: React.FC<DutyEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editFormTitle,
  setEditFormTitle,
  editFormDesc,
  setEditFormDesc,
  editFormCategory,
  setEditFormCategory,
  editFormRotationPolicy,
  setEditFormRotationPolicy,
  editFormApprovalPolicy,
  setEditFormApprovalPolicy,
  editFormSettlementCycle,
  setEditFormSettlementCycle,
  editFormCycleDays,
  setEditFormCycleDays,
  editFormProgressStatus,
  setEditFormProgressStatus,
  editFormSettlementStatus,
  setEditFormSettlementStatus,
  editFormEvaluationStatus,
  setEditFormEvaluationStatus,
  descPreviewMode,
  setDescPreviewMode,
  showToast,
}) => {
  return (
    <ElmBsh01
      isOpen={isOpen}
      onClose={onClose}
      title="모아당번 정보 수정"
      badge="SCR-DUT-02 수정"
      maxWidth="max-w-xl"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            당번 명칭 *
          </label>
          <input
            type="text"
            value={editFormTitle}
            onChange={(e) => setEditFormTitle(e.target.value)}
            placeholder="예: 거실 청소기 및 물걸레 밀기"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              카테고리 분류
            </label>
            <select
              value={editFormCategory}
              onChange={(e) => setEditFormCategory(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {INITIAL_DUTY_CATEGORIES.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              정산 기준 주기
            </label>
            <select
              value={editFormSettlementCycle}
              onChange={(e) =>
                setEditFormSettlementCycle(e.target.value as 'WEEKLY' | 'MONTHLY' | 'DAILY')
              }
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="WEEKLY">주간 정산 (WEEKLY)</option>
              <option value="MONTHLY">월간 정산 (MONTHLY)</option>
              <option value="DAILY">일간 정산 (DAILY)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              순환 배정 정책
            </label>
            <select
              value={editFormRotationPolicy}
              onChange={(e) => setEditFormRotationPolicy(e.target.value as DutyRotationPolicy)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="AGE_WEIGHTED">연령 가중 순환 배정</option>
              <option value="ROUND_ROBIN">순차 순환 배정</option>
              <option value="RANDOM">랜덤 추첨 배정</option>
              <option value="FREE_PICK">자율 신청 배정</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              완수 승인 정책
            </label>
            <select
              value={editFormApprovalPolicy}
              onChange={(e) => setEditFormApprovalPolicy(e.target.value as DutyApprovalPolicy)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="PEER_3_APPROVAL">피어 3인 교차 승인</option>
              <option value="ADMIN_APPROVAL">모임 관리자 승인</option>
              <option value="SELF_CONFIRM">수행자 자율 확인 (즉시완수)</option>
              <option value="NO_APPROVAL">무검증 자율 마감</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
            정기 수행 요일 선택
          </label>
          <div className="grid grid-cols-7 gap-1">
            {DUTY_WEEKDAYS.map((day) => {
              const isSelected = editFormCycleDays.includes(day.key);
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (editFormCycleDays.length > 1) {
                        setEditFormCycleDays(editFormCycleDays.filter((d) => d !== day.key));
                      } else {
                        showToast('최소 1개 이상의 수행 요일을 지정해야 합니다.');
                      }
                    } else {
                      setEditFormCycleDays([...editFormCycleDays, day.key]);
                    }
                  }}
                  className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700/80 space-y-2.5 text-xs">
          <span className="font-bold text-slate-800 dark:text-zinc-200 block text-[11px]">
            직교 3상태머신 상태값 조정 (마스터 권한)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">① 진행 상태</label>
              <select
                value={editFormProgressStatus}
                onChange={(e) =>
                  setEditFormProgressStatus(e.target.value as MoaDuty['progress_status'])
                }
                className="w-full h-8 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="ASSIGNED">할당됨 (대기)</option>
                <option value="IN_PROGRESS">수행 진행중</option>
                <option value="SUBMITTED">인증 제출됨</option>
                <option value="COMPLETED">과업 완수마감</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">② 정산 상태</label>
              <select
                value={editFormSettlementStatus}
                onChange={(e) =>
                  setEditFormSettlementStatus(e.target.value as MoaDuty['settlement_status'])
                }
                className="w-full h-8 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="UNSETTLED">미정산</option>
                <option value="SETTLED">정산 완료</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">③ 검증 상태</label>
              <select
                value={editFormEvaluationStatus}
                onChange={(e) =>
                  setEditFormEvaluationStatus(e.target.value as MoaDuty['evaluation_status'])
                }
                className="w-full h-8 px-2 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              >
                <option value="UNVERIFIED">미검증</option>
                <option value="AUTO_APPROVED">자동 승인</option>
                <option value="MANUAL_CONFIRMED">상호 승인</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              완수 기준 및 수행 가이드 (마크다운 지원)
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
              <button
                type="button"
                onClick={() => setDescPreviewMode('EDIT')}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  descPreviewMode === 'EDIT'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                편집
              </button>
              <button
                type="button"
                onClick={() => setDescPreviewMode('PREVIEW')}
                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                  descPreviewMode === 'PREVIEW'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                미리보기
              </button>
            </div>
          </div>

          {descPreviewMode === 'EDIT' ? (
            <textarea
              value={editFormDesc}
              onChange={(e) => setEditFormDesc(e.target.value)}
              placeholder="완수 기준 및 체크리스트를 마크다운 형식으로 작성하세요."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
            />
          ) : (
            <div className="min-h-[104px] p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/40">
              {renderDutyMarkdown(editFormDesc)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>수정사항 저장</span>
          </button>
        </div>
      </form>
    </ElmBsh01>
  );
};
