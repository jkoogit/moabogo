import React, { useState } from 'react';
import { UserPlus, UserX, Coins, CreditCard, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ElmBsh01, ElmInp01, ElmSel01, ElmChk01 } from '../../../sample/elements/Tokens';
import type { LedgerRole, LedgerBook } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';
import {
  loadLedgerAllowanceMembers,
  saveLedgerAllowanceMembers,
  loadAllUserBankAccounts,
  maskAccountNo,
  LedgerAllowanceMember,
} from '../../../sample/data/accountStorePool';

export interface LedgerMember {
  id: string;
  name: string;
  role: LedgerRole;
  isGuest: boolean;
  guestId?: string;
  joinedAt: string;
  avatar: string;
  isAllowanceTarget?: boolean;
  paymentMethod?: 'ACCOUNT' | 'CASH';
  allowanceAccount?: {
    bankName: string;
    accountNo: string;
    accountHolder: string;
  };
}

export interface LedgerMemberManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLedger: LedgerBook;
  members: LedgerMember[];
  canManageMembers: boolean;
  onRoleChange: (memberId: string, newRole: LedgerRole) => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
  onAddMember: (member: { name: string; role: LedgerRole; isGuest: boolean }) => void;
  onUpdateAllowance?: () => void;
}

export const LedgerMemberManageModal: React.FC<LedgerMemberManageModalProps> = ({
  isOpen,
  onClose,
  currentLedger,
  members,
  canManageMembers,
  onRoleChange,
  onRemoveMember,
  onAddMember,
  onUpdateAllowance,
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<LedgerRole>('MEMBER');
  const [isNewMemberGuest, setIsNewMemberGuest] = useState(false);

  // 용돈 구성원 관리 상태
  const [allowanceMembers, setAllowanceMembers] = useState<LedgerAllowanceMember[]>(() =>
    loadLedgerAllowanceMembers(currentLedger.id)
  );
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // 등록된 시스템 계좌 목록 풀
  const allAccounts = loadAllUserBankAccounts();

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAddMember({
      name: newMemberName.trim(),
      role: newMemberRole,
      isGuest: currentLedger.type === 'GROUP' ? false : isNewMemberGuest,
    });
    setNewMemberName('');
    setIsNewMemberGuest(false);
  };
  const getMemberAllowance = (m: LedgerMember) => {
    return allowanceMembers.find(
      (a) =>
        a.memberId === m.id ||
        a.memberName === m.name ||
        a.memberName.includes(m.name) ||
        m.name.includes(a.memberName.replace(/\(.*\)/, ''))
    );
  };

  const handleUpdateAllowanceTarget = (
    member: LedgerMember,
    isTarget: boolean,
    paymentMethod: 'ACCOUNT' | 'CASH' = 'ACCOUNT',
    account?: { bankName: string; accountNo: string; accountHolder: string }
  ) => {
    setAllowanceMembers((prev) => {
      const existingIdx = prev.findIndex(
        (a) =>
          a.memberId === member.id ||
          a.memberName === member.name ||
          a.memberName.includes(member.name) ||
          member.name.includes(a.memberName.replace(/\(.*\)/, ''))
      );

      const defaultAcc = allAccounts.find(
        (a) => a.accountHolder === member.name.replace(/\(.*\)/, '').trim()
      ) || {
        bankName: '토스뱅크',
        accountNo: '1000-8821-3942',
        accountHolder: member.name.replace(/\(.*\)/, '').trim(),
      };

      const updatedEntry: LedgerAllowanceMember = {
        ledgerId: currentLedger.id,
        memberId: member.id,
        memberName: member.name,
        isAllowanceTarget: isTarget,
        paymentMethod,
        representativeAccount:
          paymentMethod === 'ACCOUNT' ? account || defaultAcc : undefined,
      };

      let next: LedgerAllowanceMember[];
      if (existingIdx >= 0) {
        next = [...prev];
        next[existingIdx] = updatedEntry;
      } else {
        next = [...prev, updatedEntry];
      }
      saveLedgerAllowanceMembers(currentLedger.id, next);
      if (onUpdateAllowance) onUpdateAllowance();
      return next;
    });
  };

  return (
    <ElmBsh01
      isOpen={isOpen}
      onClose={onClose}
      title={`가계부 참여자 및 권한 설정 (${members.length}명)`}
    >
      <div className="space-y-5 pb-6">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              현재 가계부: {currentLedger.title}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                currentLedger.type === 'GROUP'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentLedger.type === 'PERSONAL'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {currentLedger.type === 'GROUP'
                ? '정식회원 전용'
                : currentLedger.type === 'PERSONAL'
                ? '개인 전용'
                : '게스트 허용 (모임)'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {currentLedger.type === 'GROUP'
              ? '가족 그룹 가계부는 데이터 정합성을 위해 정식 가입 회원만 참여할 수 있습니다. 자녀 및 구성원의 용돈 수령 계좌를 1:1로 매핑할 수 있습니다.'
              : currentLedger.type === 'PERSONAL'
              ? '개인 가계부는 단독 소유로 외부 참여자를 추가할 수 없습니다.'
              : '동창/모임 가계부는 미가입 게스트 참여를 유연하게 허용하며 모임 종료 시 정산됩니다.'}
          </p>
        </div>

        {/* 참여자 리스트 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              참여자 목록 & 권한 / 용돈 계좌 매핑
            </h5>
            <span className="text-[10px] text-slate-400">
              💡 구성원별 용돈 수령 여부 및 대표계좌 설정 가능
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {members.map((m) => {
              const allowance = getMemberAllowance(m);
              const isExpanded = expandedMemberId === m.id;

              return (
                <div key={m.id} className="p-3 text-xs bg-white dark:bg-zinc-900 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{m.avatar}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate">
                            {m.name}
                          </span>
                          {m.isGuest && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                              게스트 ({m.guestId})
                            </span>
                          )}
                          {allowance?.isAllowanceTarget && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                allowance.paymentMethod === 'ACCOUNT'
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60'
                                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60'
                              }`}
                            >
                              {allowance.paymentMethod === 'ACCOUNT'
                                ? `💰 용돈: ${allowance.representativeAccount?.bankName} ${maskAccountNo(
                                    allowance.representativeAccount?.accountNo || ''
                                  )}`
                                : '💵 현금 직접 수령'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          참여일: {m.joinedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* 용돈/계좌 매핑 토글 버튼 */}
                      <button
                        type="button"
                        onClick={() => setExpandedMemberId(isExpanded ? null : m.id)}
                        className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                          allowance?.isAllowanceTarget
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                        }`}
                        title="용돈 및 대표계좌 설정"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>용돈설정</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        )}
                      </button>

                      <select
                        value={m.role}
                        disabled={!canManageMembers || m.role === 'OWNER'}
                        onChange={(e) => onRoleChange(m.id, e.target.value as LedgerRole)}
                        className={`text-[11px] font-bold rounded-lg border px-2 py-1 focus:outline-hidden ${
                          m.role === 'OWNER'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : m.role === 'ADMIN'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : m.role === 'MEMBER'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : m.role === 'VIEWER'
                            ? 'bg-slate-100 border-slate-300 text-slate-700'
                            : 'bg-orange-50 border-orange-300 text-orange-800'
                        } ${!canManageMembers || m.role === 'OWNER' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                      >
                        <option value="OWNER">👑 소유자 (총괄)</option>
                        <option value="ADMIN">🛡️ 관리자</option>
                        <option value="MEMBER">👤 멤버</option>
                        <option value="VIEWER">👁️ 조회전용</option>
                        <option value="GUEST">🎭 게스트</option>
                      </select>

                      {canManageMembers && m.role !== 'OWNER' && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id, m.name)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="참여자 내보내기"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 확장된 용돈 및 대표계좌 설정 패널 */}
                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-500" />
                          <span>[{m.name}] 용돈 수령 & 대표입금계좌 설정</span>
                        </span>
                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-indigo-600 dark:text-indigo-400">
                          <input
                            type="checkbox"
                            checked={!!allowance?.isAllowanceTarget}
                            onChange={(e) =>
                              handleUpdateAllowanceTarget(
                                m,
                                e.target.checked,
                                allowance?.paymentMethod || 'ACCOUNT',
                                allowance?.representativeAccount
                              )
                            }
                            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                          />
                          <span>용돈 지급 대상자로 지정</span>
                        </label>
                      </div>

                      {allowance?.isAllowanceTarget ? (
                        <div className="space-y-3 pt-1">
                          {/* 지급 방식 선택 (계좌 송금 vs 현금 수령) */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 block">
                              지급 방식 선택
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateAllowanceTarget(
                                    m,
                                    true,
                                    'ACCOUNT',
                                    allowance.representativeAccount
                                  )
                                }
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                  allowance.paymentMethod === 'ACCOUNT'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>계좌 송금 (토스 연동)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateAllowanceTarget(m, true, 'CASH', undefined)
                                }
                                className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                  allowance.paymentMethod === 'CASH'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <span>💵 현금 직접 지급</span>
                              </button>
                            </div>
                          </div>

                          {/* 계좌 정보 입력 및 매핑 */}
                          {allowance.paymentMethod === 'ACCOUNT' ? (
                            <div className="space-y-2 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                                대표 입금 계좌 정보 (1:1 매핑)
                              </span>
                              <div className="grid grid-cols-3 gap-2">
                                <ElmSel01
                                  label="은행"
                                  value={allowance.representativeAccount?.bankName || '토스뱅크'}
                                  onChange={(val) =>
                                    handleUpdateAllowanceTarget(m, true, 'ACCOUNT', {
                                      bankName: val,
                                      accountNo: allowance.representativeAccount?.accountNo || '',
                                      accountHolder:
                                        allowance.representativeAccount?.accountHolder ||
                                        m.name.replace(/\(.*\)/, '').trim(),
                                    })
                                  }
                                  options={[
                                    { value: '토스뱅크', label: '토스뱅크 (092)' },
                                    { value: '카카오뱅크', label: '카카오뱅크 (090)' },
                                    { value: '국민은행', label: 'KB국민 (004)' },
                                    { value: '신한은행', label: '신한 (088)' },
                                  ]}
                                />
                                <div className="col-span-2">
                                  <ElmInp01
                                    label="계좌번호"
                                    value={allowance.representativeAccount?.accountNo || ''}
                                    onChange={(val) =>
                                      handleUpdateAllowanceTarget(m, true, 'ACCOUNT', {
                                        bankName:
                                          allowance.representativeAccount?.bankName || '토스뱅크',
                                        accountNo: val,
                                        accountHolder:
                                          allowance.representativeAccount?.accountHolder ||
                                          m.name.replace(/\(.*\)/, '').trim(),
                                      })
                                    }
                                    placeholder="1000-8821-..."
                                  />
                                </div>
                              </div>
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                                * 목표 달성 시 '용돈이체' 버튼을 누르면 위 대표계좌로 토스 송금이 즉시 연결됩니다.
                              </p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                              ✓ 계좌 등록 없이 현금으로 직접 전달합니다. 목표 실천 화면에서 이체 딥링크 대신 '현금전달 마감'으로 처리됩니다.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          현재 이 구성원은 용돈 수령 대상이 아닙니다. 상단 체크박스를 활성화하면 대표계좌를 매핑할 수 있습니다.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 새 참여자 초대 */}
        {currentLedger.type !== 'PERSONAL' && (
          <form onSubmit={handleAddSubmit} className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
            <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              <span>새 참여자 초대</span>
            </h5>
            <ElmInp01
              label="이름 / 닉네임"
              value={newMemberName}
              onChange={setNewMemberName}
              placeholder="예: 홍길동 (이메일 또는 닉네임)"
            />
            <div className="grid grid-cols-2 gap-3">
              <ElmSel01
                label="부여할 권한"
                value={newMemberRole}
                onChange={(val) => setNewMemberRole(val as LedgerRole)}
                options={[
                  { value: 'ADMIN', label: '🛡️ 관리자' },
                  { value: 'MEMBER', label: '👤 일반 멤버' },
                  { value: 'VIEWER', label: '👁️ 조회 전용' },
                ]}
              />
              <div className="flex flex-col justify-end pb-1">
                <ElmChk01
                  checked={isNewMemberGuest}
                  onChange={setIsNewMemberGuest}
                  label="미가입 게스트로 추가"
                />
                {currentLedger.type === 'GROUP' && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1">
                    * 가족 가계부는 게스트 추가 불가
                  </span>
                )}
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={!canManageMembers}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                참여자 초대하기
              </button>
            </div>
          </form>
        )}
      </div>
    </ElmBsh01>
  );
};
