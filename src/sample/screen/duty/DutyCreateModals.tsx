import React from 'react';
import { Users, X, UserPlus, Eye as EyeIcon, Edit3 } from 'lucide-react';
import { ElmBsh01, ElmInp04, ElmTxt01 } from '../../elements/Tokens';
import { DutyCategory, DutyRotationPolicy, DutyApprovalPolicy } from '../../../types';
import {
  AVAILABLE_LEDGER_MEMBERS,
  DutyFormParticipant,
  LedgerMemberCandidate,
} from './useMoaDutyManage';
import { DUTY_WEEKDAYS, renderDutyMarkdown } from './dutyUtils';

interface DutyCreateModalsProps {
  createModalOpen: boolean;
  onCloseCreateModal: () => void;
  memberSelectModalOpen: boolean;
  onCloseMemberSelectModal: () => void;
  onOpenMemberSelectModal: () => void;
  categories: DutyCategory[];
  formCategory: string;
  setFormCategory: (val: string) => void;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  descPreviewMode: 'EDIT' | 'PREVIEW';
  setDescPreviewMode: (mode: 'EDIT' | 'PREVIEW') => void;
  formCycleDays: string[];
  setFormCycleDays: (days: string[]) => void;
  formRotationPolicy: DutyRotationPolicy;
  setFormRotationPolicy: (val: DutyRotationPolicy) => void;
  formSettlementCycle: 'WEEKLY' | 'MONTHLY' | 'DAILY';
  setFormSettlementCycle: (val: 'WEEKLY' | 'MONTHLY' | 'DAILY') => void;
  formApprovalPolicy: DutyApprovalPolicy;
  setFormApprovalPolicy: (val: DutyApprovalPolicy) => void;
  formParticipants: DutyFormParticipant[];
  setFormParticipants: (list: DutyFormParticipant[]) => void;
  memberSearchQuery: string;
  setMemberSearchQuery: (q: string) => void;
  selectedMemberRole: 'ASSIGNEE' | 'VIEWER';
  setSelectedMemberRole: (role: 'ASSIGNEE' | 'VIEWER') => void;
  onAddMemberToForm: (member: LedgerMemberCandidate) => void;
  onSubmitCreateDuty: (e: React.FormEvent) => void;
}

export const DutyCreateModals: React.FC<DutyCreateModalsProps> = ({
  createModalOpen,
  onCloseCreateModal,
  memberSelectModalOpen,
  onCloseMemberSelectModal,
  onOpenMemberSelectModal,
  categories,
  formCategory,
  setFormCategory,
  formTitle,
  setFormTitle,
  formDesc,
  setFormDesc,
  descPreviewMode,
  setDescPreviewMode,
  formCycleDays,
  setFormCycleDays,
  formRotationPolicy,
  setFormRotationPolicy,
  formSettlementCycle,
  setFormSettlementCycle,
  formApprovalPolicy,
  setFormApprovalPolicy,
  formParticipants,
  setFormParticipants,
  memberSearchQuery,
  setMemberSearchQuery,
  selectedMemberRole,
  setSelectedMemberRole,
  onAddMemberToForm,
  onSubmitCreateDuty,
}) => {
  return (
    <>
      {/* Modal 1: 새 당번 등록 */}
      <ElmBsh01
        isOpen={createModalOpen}
        onClose={onCloseCreateModal}
        title="새 모아당번 등록"
        badge="SCR-DUT-01"
      >
        <form onSubmit={onSubmitCreateDuty} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              카테고리 분류
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <ElmTxt01
            label="당번 과업 명칭"
            value={formTitle}
            onChange={setFormTitle}
            placeholder="예: 거실 청소기 및 물걸레 밀기, 주말 분리배출"
            rows={2}
            maxLength={60}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                상세 완수 기준 및 수행 가이드 (마크다운 지원)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setDescPreviewMode('EDIT')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                    descPreviewMode === 'EDIT'
                      ? 'bg-white dark:bg-zinc-700 font-bold text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>편집</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDescPreviewMode('PREVIEW')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
                    descPreviewMode === 'PREVIEW'
                      ? 'bg-white dark:bg-zinc-700 font-bold text-slate-900 dark:text-zinc-100 shadow-xs'
                      : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  <EyeIcon className="w-3 h-3" />
                  <span>미리보기</span>
                </button>
              </div>
            </div>

            {descPreviewMode === 'EDIT' ? (
              <ElmTxt01
                value={formDesc}
                onChange={setFormDesc}
                placeholder={'예:\n- [ ] 거실 소파 밑과 복도까지 물걸레 밀기\n- [ ] 먼지 배출통 비우기\n**주의사항**: 주 3회 정기 수행 완료 후 사진 인증 첨부 필수.'}
                rows={4}
                maxLength={400}
                helperText="불릿(- ), 체크박스(- [ ]), 볼드(**텍스트**) 등 마크다운 서식이 적용됩니다."
              />
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-800/50 min-h-[100px]">
                {renderDutyMarkdown(formDesc)}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
              수행 요일 선택 (주기)
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {DUTY_WEEKDAYS.map(({ key, label }) => {
                const isSelected = formCycleDays.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setFormCycleDays(formCycleDays.filter((d) => d !== key));
                      } else {
                        setFormCycleDays([...formCycleDays, key]);
                      }
                    }}
                    className={`min-h-[36px] min-w-[36px] px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                순환 배정 정책
              </label>
              <select
                value={formRotationPolicy}
                onChange={(e) => setFormRotationPolicy(e.target.value as DutyRotationPolicy)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="AGE_WEIGHTED">연령 가중치 순환</option>
                <option value="NAME_ASC">순차 순환 (가나다)</option>
                <option value="RANDOM">랜덤 추첨 배정</option>
                <option value="BIRTH_DATE">생년월일 순환 배정</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                정산 기준 주기
              </label>
              <select
                value={formSettlementCycle}
                onChange={(e) =>
                  setFormSettlementCycle(e.target.value as 'WEEKLY' | 'MONTHLY' | 'DAILY')
                }
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="WEEKLY">주간 정산 (매주 일요일)</option>
                <option value="MONTHLY">월간 정산 (말일 결산)</option>
                <option value="DAILY">일간 즉시 정산</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                완료 승인 방식
              </label>
              <select
                value={formApprovalPolicy}
                onChange={(e) => setFormApprovalPolicy(e.target.value as DutyApprovalPolicy)}
                className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
              >
                <option value="PEER_3_APPROVAL">구성원 3인 승인</option>
                <option value="SELF_CONFIRM">자율 즉시 승인</option>
                <option value="ADMIN_APPROVAL">관리자 단독 승인</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>참가자 & 관람원 목록 ({formParticipants.length}명)</span>
              </span>
              <button
                type="button"
                onClick={onOpenMemberSelectModal}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-3 h-3" />
                <span>가계부 구성원 선택</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {formParticipants.map((p, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-xs bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                    [{p.role === 'ASSIGNEE' ? '수행원' : '관람원'}]
                  </span>
                  {formParticipants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormParticipants(formParticipants.filter((_, i) => i !== idx))
                      }
                      className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onCloseCreateModal}
              className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap"
            >
              취소
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs font-bold text-white shadow-sm cursor-pointer whitespace-nowrap"
            >
              새 당번 등록 완료
            </button>
          </div>
        </form>
      </ElmBsh01>

      {/* Modal 2: 가계부 구성원 안전 선택 */}
      <ElmBsh01
        isOpen={memberSelectModalOpen}
        onClose={onCloseMemberSelectModal}
        title="가계부 구성원 안전 선택"
        badge="보안 인증"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            개인정보 보호를 위해 불특정 전체 가입자 대신, 사용자가 소속된 가계부 인증 구성원만을 안전하게 검색하여 추가합니다.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ElmInp04
                value={memberSearchQuery}
                onChange={setMemberSearchQuery}
                placeholder="이름 또는 관계 정확 검색 (예: 배우자, 자녀)..."
              />
            </div>
            <select
              value={selectedMemberRole}
              onChange={(e) => setSelectedMemberRole(e.target.value as 'ASSIGNEE' | 'VIEWER')}
              className="h-10 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
            >
              <option value="ASSIGNEE">당번 수행원</option>
              <option value="VIEWER">관람·응원단</option>
            </select>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {AVAILABLE_LEDGER_MEMBERS.filter((m) => {
              if (!memberSearchQuery.trim()) return true;
              const q = memberSearchQuery.toLowerCase();
              return m.name.toLowerCase().includes(q) || m.relation.toLowerCase().includes(q);
            }).map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-zinc-100">{member.name}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    소속: {member.ledgerName} • 관계: {member.relation}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onAddMemberToForm(member)}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer whitespace-nowrap"
                >
                  추가
                </button>
              </div>
            ))}
          </div>
        </div>
      </ElmBsh01>
    </>
  );
};
