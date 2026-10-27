import React, { useState } from 'react';
import { UserPlus, UserX } from 'lucide-react';
import { ElmBsh01, ElmInp01, ElmSel01, ElmChk01 } from '../../../sample/elements/Tokens';
import type { LedgerRole, LedgerBook } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerMember {
  id: string;
  name: string;
  role: LedgerRole;
  isGuest: boolean;
  guestId?: string;
  joinedAt: string;
  avatar: string;
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
}) => {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<LedgerRole>('MEMBER');
  const [isNewMemberGuest, setIsNewMemberGuest] = useState(false);

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
              ? '가족 그룹 가계부는 데이터 정합성을 위해 정식 가입 회원만 참여할 수 있습니다.'
              : currentLedger.type === 'PERSONAL'
              ? '개인 가계부는 단독 소유로 외부 참여자를 추가할 수 없습니다.'
              : '동창/모임 가계부는 미가입 게스트 참여를 유연하게 허용하며 모임 종료 시 정산됩니다.'}
          </p>
        </div>

        {/* 참여자 리스트 */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            참여자 목록 & 권한 변경
          </h5>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-3 flex items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">{m.avatar}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 dark:text-white truncate">
                        {m.name}
                      </span>
                      {m.isGuest && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                          게스트 ({m.guestId})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      참여일: {m.joinedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
            ))}
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
