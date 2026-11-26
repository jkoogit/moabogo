import React, { useState } from 'react';
import { ElmSld03, ElmChk01 } from '../../elements/Tokens';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckSquare,
  Square,
  Search,
  List,
  LayoutGrid,
  CreditCard,
  KeyRound,
} from 'lucide-react';
import {
  ScreenItem,
  RoleGroupItem,
  ManagedUser,
  loadManagedUsers,
  saveManagedUsers,
} from '../../data/systemGovernancePool';

/* =========================================================================
   4. 권한그룹 관리 Sub-Tab
   ========================================================================= */
interface RbacRolesSubTabProps {
  roles: RoleGroupItem[];
  screens: ScreenItem[];
  onSyncScreensAndRoles: (nextScreens: ScreenItem[], nextRoles: RoleGroupItem[]) => void;
  onUpdateRolesOnly: (nextRoles: RoleGroupItem[]) => void;
  onToast: (message: string) => void;
}

export const RbacRolesSubTab: React.FC<RbacRolesSubTabProps> = ({
  roles,
  screens,
  onSyncScreensAndRoles,
  onUpdateRolesOnly,
  onToast,
}) => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleGroupItem | null>(null);
  const [roleFormId, setRoleFormId] = useState<string>('');
  const [roleFormName, setRoleFormName] = useState<string>('');
  const [roleFormDescription, setRoleFormDescription] = useState<string>('');
  const [roleFormEnabled, setRoleFormEnabled] = useState<boolean>(true);

  const handleOpenRoleModal = (role?: RoleGroupItem) => {
    if (role) {
      setEditingRole(role);
      setRoleFormId(role.id);
      setRoleFormName(role.name);
      setRoleFormDescription(role.description || '');
      setRoleFormEnabled(role.isEnabled);
    } else {
      setEditingRole(null);
      setRoleFormId(`ROLE_CUST_${Date.now().toString().slice(-4)}`);
      setRoleFormName('');
      setRoleFormDescription('');
      setRoleFormEnabled(true);
    }
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    if (!roleFormId.trim() || !roleFormName.trim()) {
      onToast('권한그룹 ID와 권한그룹명을 입력해 주세요.');
      return;
    }
    let updated: RoleGroupItem[];
    if (editingRole) {
      updated = roles.map((r) =>
        r.id === editingRole.id
          ? {
              ...r,
              name: roleFormName.trim(),
              description: roleFormDescription.trim(),
              isEnabled: roleFormEnabled,
            }
          : r
      );
    } else {
      const newRole: RoleGroupItem = {
        id: roleFormId.trim(),
        name: roleFormName.trim(),
        description: roleFormDescription.trim(),
        isEnabled: roleFormEnabled,
        userCount: 0,
        mappedScreenIds: ['SCR-GNT-01'],
      };
      updated = [...roles, newRole];
    }
    onUpdateRolesOnly(updated);
    setIsRoleModalOpen(false);
    onToast(editingRole ? '권한그룹이 수정되었습니다.' : '신규 권한그룹이 등록되었습니다.');
  };

  const handleDeleteRole = (roleId: string) => {
    if (roleId === 'ROLE_SYSTEM_ADMIN') {
      onToast('최고 시스템 관리자(ROLE_SYSTEM_ADMIN) 그룹은 삭제할 수 없습니다.');
      return;
    }
    if (!confirm(`'${roleId}' 권한그룹을 삭제하시겠습니까?`)) return;
    const updatedRoles = roles.filter((r) => r.id !== roleId);
    const updatedScreens = screens.map((s) => ({
      ...s,
      mappedRoleIds: s.mappedRoleIds.filter((id) => id !== roleId),
    }));
    onSyncScreensAndRoles(updatedScreens, updatedRoles);
    onToast('권한그룹이 삭제되었습니다.');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">전체 권한그룹 ({roles.length}개)</span>
        <button
          type="button"
          onClick={() => handleOpenRoleModal()}
          className="min-h-[34px] px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>권한그룹 등록</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>{r.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      r.isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {r.isEnabled ? '사용' : '미사용'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">{r.id}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenRoleModal(r)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="수정"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRole(r.id)}
                  className="p-1 hover:bg-rose-50 rounded text-rose-500"
                  title="삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{r.description || '설명 없음'}</p>
            <div className="pt-2 border-t flex items-center justify-between text-[11px]">
              <span className="text-slate-400">매핑된 화면 수</span>
              <span className="font-bold text-indigo-600 font-mono">{r.mappedScreenIds.length}개</span>
            </div>
          </div>
        ))}
      </div>

      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold">{editingRole ? '권한그룹 수정' : '권한그룹 등록'}</h4>
              <button type="button" onClick={() => setIsRoleModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">권한그룹 ID</label>
                <input
                  type="text"
                  value={roleFormId}
                  disabled={!!editingRole}
                  onChange={(e) => setRoleFormId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">권한그룹명</label>
                <input
                  type="text"
                  value={roleFormName}
                  onChange={(e) => setRoleFormName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">설명</label>
                <textarea
                  value={roleFormDescription}
                  onChange={(e) => setRoleFormDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                />
              </div>
              <div className="pt-1">
                <ElmChk01
                  checked={roleFormEnabled}
                  onChange={setRoleFormEnabled}
                  label="그룹 활성화 (사용여부)"
                  className="min-h-0 py-0.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
              <button type="button" onClick={handleSaveRole} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   5. 권한 매핑 관리 Sub-Tab
   ========================================================================= */
interface RbacPermissionsSubTabProps {
  roles: RoleGroupItem[];
  screens: ScreenItem[];
  onSyncScreensAndRoles: (nextScreens: ScreenItem[], nextRoles: RoleGroupItem[]) => void;
  onToast: (message: string) => void;
}

export const RbacPermissionsSubTab: React.FC<RbacPermissionsSubTabProps> = ({
  roles,
  screens,
  onSyncScreensAndRoles,
  onToast,
}) => {
  const [selectedRoleIdForMapping, setSelectedRoleIdForMapping] = useState<string>(
    roles[0]?.id || 'ROLE_SYSTEM_ADMIN'
  );

  const handleToggleScreenMapping = (roleId: string, screenId: string) => {
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) return;
    const hasMapped = targetRole.mappedScreenIds.includes(screenId);

    const nextMappedScreenIds = hasMapped
      ? targetRole.mappedScreenIds.filter((id) => id !== screenId)
      : [...targetRole.mappedScreenIds, screenId];

    const updatedRoles = roles.map((r) =>
      r.id === roleId ? { ...r, mappedScreenIds: nextMappedScreenIds } : r
    );

    const updatedScreens = screens.map((s) => {
      if (s.id === screenId) {
        const nextRoleIds = hasMapped
          ? s.mappedRoleIds.filter((id) => id !== roleId)
          : [...s.mappedRoleIds, roleId];
        return { ...s, mappedRoleIds: nextRoleIds };
      }
      return s;
    });

    onSyncScreensAndRoles(updatedScreens, updatedRoles);
    onToast(hasMapped ? '화면 접근 권한이 해제되었습니다.' : '화면 접근 권한이 부여되었습니다.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1.5">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelectedRoleIdForMapping(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRoleIdForMapping === r.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            <span>{r.name}</span>
            <span className="text-[10px] opacity-75">({r.mappedScreenIds.length})</span>
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {screens.map((scr) => {
            const isMapped = roles
              .find((r) => r.id === selectedRoleIdForMapping)
              ?.mappedScreenIds.includes(scr.id);

            return (
              <div
                key={scr.id}
                onClick={() => handleToggleScreenMapping(selectedRoleIdForMapping, scr.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isMapped
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-bold'
                    : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-indigo-600 text-[11px]">{scr.id}</span>
                    <span className="truncate">{scr.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{scr.route}</div>
                </div>
                <div className="shrink-0">
                  {isMapped ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. 사용자 관리 Sub-Tab
   ========================================================================= */
interface RbacUsersSubTabProps {
  onToast: (message: string) => void;
}

export const RbacUsersSubTab: React.FC<RbacUsersSubTabProps> = ({ onToast }) => {
  const [users, setUsers] = useState<ManagedUser[]>(() => loadManagedUsers());
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<ManagedUser | null>(null);
  const [userViewMode, setUserViewMode] = useState<'LIST' | 'CARD'>('LIST');
  const [userFilterRole, setUserFilterRole] = useState<string>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  const filteredUsers = users.filter((u) => {
    if (userFilterRole !== 'ALL' && u.roleCode !== userFilterRole) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.trim().toLowerCase();
      const matchId = u.id.toLowerCase().includes(q);
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchEmail) return false;
    }
    return true;
  });

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: 'ACTIVE' | 'SUSPENDED' = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
    saveManagedUsers(updated);
    onToast('사용자 계정 상태가 변경되었습니다.');
  };

  const handleResetPassword = (targetUser: ManagedUser) => {
    if (!confirm(`'${targetUser.name}' 회원님의 비밀번호를 임시 비밀번호로 초기화하고 재설정 메일을 발송하시겠습니까?`)) {
      return;
    }
    onToast(`★ ${targetUser.name} 님의 비밀번호 초기화 메일이 ${targetUser.email} 로 발송되었습니다.`);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0E131F] p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="flex-1 min-w-0">
          <ElmSld03 showNavButtons={false} className="w-full">
            <div className="flex items-center gap-2 min-w-max pb-1">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">권한그룹:</span>
              {['ALL', 'ROLE_SYSTEM_ADMIN', 'ROLE_OWNER', 'ROLE_MEMBER', 'ROLE_GUEST'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setUserFilterRole(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    userFilterRole === r
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  {r === 'ALL' ? '전체 회원' : r.replace('ROLE_', '')}
                </button>
              ))}
            </div>
          </ElmSld03>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="사용자ID, 회원명, 이메일..."
              className="w-full h-8 pl-8 pr-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E]"
            />
          </div>

          <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-[#131B2E]">
            <button
              type="button"
              onClick={() => setUserViewMode('LIST')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                userViewMode === 'LIST' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="목록 보기"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setUserViewMode('CARD')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                userViewMode === 'CARD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="카드 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {userViewMode === 'LIST' ? (
        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-400">
                <th className="py-2.5 px-3">사용자 ID</th>
                <th className="py-2.5 px-3">회원명</th>
                <th className="py-2.5 px-3">이메일</th>
                <th className="py-2.5 px-3">권한그룹</th>
                <th className="py-2.5 px-3 text-center">사용여부</th>
                <th className="py-2.5 px-3">최근로그인</th>
                <th className="py-2.5 px-3 text-right">상세조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    검색 및 필터 조건에 일치하는 회원이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{u.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-zinc-400">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                        {u.roleCode.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`min-h-[26px] px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 hover:bg-rose-200'
                        }`}
                        title="클릭하여 활성/정지 토글"
                      >
                        {u.status === 'ACTIVE' ? '사용중 (ACTIVE)' : '이용정지 (SUSPENDED)'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">{u.lastLoginAt}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForDetail(u)}
                        className="min-h-[28px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        상세조회
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">
              검색 및 필터 조건에 일치하는 회원이 없습니다.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3 shadow-xs hover:border-indigo-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{u.id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                    {u.roleCode.replace('ROLE_', '')}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{u.name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleUserStatus(u.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {u.status === 'ACTIVE' ? '사용중' : '정지됨'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUserForDetail(u)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100"
                  >
                    상세조회
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 사용자 상세 모달 */}
      {selectedUserForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {selectedUserForDetail.name} 님의 개인설정 상세
                </h4>
                <span className="text-[10px] text-slate-400">
                  {selectedUserForDetail.email} • ID: {selectedUserForDetail.id}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedUserForDetail(null)}><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
                  기본 환경 및 AI OCR 엔진 설정
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">적용 테마:</span>{' '}
                    <strong className="text-indigo-600">{selectedUserForDetail.personalSettings.theme.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">단골 매장:</span>{' '}
                    <strong className="text-slate-800 dark:text-zinc-200">{selectedUserForDetail.personalSettings.favoriteStoreName}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">OCR 엔진:</span>{' '}
                    <strong className="text-emerald-600">{selectedUserForDetail.personalSettings.ocrEngineName}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    <span>등록 금융계좌 (민감정보 마스킹 보호)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">개인정보보호법 준수</span>
                </div>

                <div className="space-y-1.5">
                  {selectedUserForDetail.personalSettings.maskedBankAccounts.map((acc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{acc.bankName}</span>
                          {acc.isDefault && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 text-amber-700 font-bold">
                              대표계좌
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 text-xs">
                          {acc.maskedAccountNo}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <div>예금주: {acc.accountHolder}</div>
                        {acc.alias && <div className="text-[10px] text-slate-400">용도: {acc.alias}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs">알림 채널 및 혜택 수신 동의</div>
                  <div className="text-[10px] text-slate-400">
                    이메일인증: {selectedUserForDetail.personalSettings.notificationChannels.emailVerified ? '완료' : '미완료'} •{' '}
                    푸시알림: {selectedUserForDetail.personalSettings.notificationChannels.pushAllowed ? '허용' : '차단'}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  정상 연동
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleResetPassword(selectedUserForDetail)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>비밀번호 초기화</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedUserForDetail(null)}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
