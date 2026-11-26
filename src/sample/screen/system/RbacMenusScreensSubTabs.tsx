import React, { useState } from 'react';
import { ElmSld03, ElmChk01, ElmMkd01 } from '../../elements/Tokens';
import {
  Search,
  List,
  LayoutGrid,
  Plus,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import {
  MenuItem,
  ScreenItem,
  RoleGroupItem,
  loadManagedMenus,
  saveManagedMenus,
} from '../../data/systemGovernancePool';

/* =========================================================================
   2. 메뉴 관리 Sub-Tab
   ========================================================================= */
interface RbacMenusSubTabProps {
  onToast: (message: string) => void;
}

export const RbacMenusSubTab: React.FC<RbacMenusSubTabProps> = ({ onToast }) => {
  const [menus, setMenus] = useState<MenuItem[]>(() => loadManagedMenus());
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuFormId, setMenuFormId] = useState<string>('');
  const [menuFormName, setMenuFormName] = useState<string>('');
  const [menuFormCategory, setMenuFormCategory] = useState<string>('금융서비스');
  const [menuFormPath, setMenuFormPath] = useState<string>('SCR-DSH-01');
  const [menuFormOrder, setMenuFormOrder] = useState<number>(1);
  const [menuFormEnabled, setMenuFormEnabled] = useState<boolean>(true);

  const [menuViewMode, setMenuViewMode] = useState<'LIST' | 'CARD'>('LIST');
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('ALL');
  const [menuFilterEnabled, setMenuFilterEnabled] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');

  const filteredMenus = menus.filter((m) => {
    if (menuFilterCategory !== 'ALL' && m.category !== menuFilterCategory) return false;
    if (menuFilterEnabled === 'ENABLED' && !m.isEnabled) return false;
    if (menuFilterEnabled === 'DISABLED' && m.isEnabled) return false;
    if (menuSearchQuery.trim()) {
      const q = menuSearchQuery.trim().toLowerCase();
      const matchId = m.id.toLowerCase().includes(q);
      const matchName = m.name.toLowerCase().includes(q);
      const matchPath = m.path.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPath) return false;
    }
    return true;
  });

  const handleOpenMenuModal = (menu?: MenuItem) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuFormId(menu.id);
      setMenuFormName(menu.name);
      setMenuFormCategory(menu.category);
      setMenuFormPath(menu.path);
      setMenuFormOrder(menu.order);
      setMenuFormEnabled(menu.isEnabled);
    } else {
      setEditingMenu(null);
      setMenuFormId(`MENU_CUST_${Date.now().toString().slice(-4)}`);
      setMenuFormName('');
      setMenuFormCategory('금융서비스');
      setMenuFormPath('SCR-DSH-01');
      setMenuFormOrder(menus.length + 1);
      setMenuFormEnabled(true);
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = () => {
    if (!menuFormId.trim() || !menuFormName.trim()) {
      onToast('메뉴 ID와 메뉴명을 입력해 주세요.');
      return;
    }
    let updated: MenuItem[];
    if (editingMenu) {
      updated = menus.map((m) =>
        m.id === editingMenu.id
          ? {
              ...m,
              name: menuFormName.trim(),
              category: menuFormCategory,
              path: menuFormPath.trim(),
              order: menuFormOrder,
              isEnabled: menuFormEnabled,
            }
          : m
      );
    } else {
      const newItem: MenuItem = {
        id: menuFormId.trim(),
        name: menuFormName.trim(),
        category: menuFormCategory,
        path: menuFormPath.trim(),
        order: menuFormOrder,
        isEnabled: menuFormEnabled,
        requiredRole: 'ROLE_MEMBER',
      };
      updated = [...menus, newItem].sort((a, b) => a.order - b.order);
    }
    setMenus(updated);
    saveManagedMenus(updated);
    setIsMenuModalOpen(false);
    onToast(editingMenu ? '메뉴가 수정되었습니다.' : '새 메뉴가 등록되었습니다.');
  };

  const handleDeleteMenu = (menuId: string) => {
    if (!confirm(`'${menuId}' 메뉴를 삭제하시겠습니까?`)) return;
    const updated = menus.filter((m) => m.id !== menuId);
    setMenus(updated);
    saveManagedMenus(updated);
    onToast('메뉴가 삭제되었습니다.');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0E131F] p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="flex-1 min-w-0">
          <ElmSld03 showNavButtons={false} className="w-full">
            <div className="flex items-center gap-2 min-w-max pb-1">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">구분:</span>
              {['ALL', '금융서비스', '라이프협업', '빠른입력', '시스템운영'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMenuFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    menuFilterCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700 mx-1 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 shrink-0">사용여부:</span>
              {(['ALL', 'ENABLED', 'DISABLED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setMenuFilterEnabled(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    menuFilterEnabled === st
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  {st === 'ALL' ? '전체' : st === 'ENABLED' ? '사용중' : '미사용'}
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
              value={menuSearchQuery}
              onChange={(e) => setMenuSearchQuery(e.target.value)}
              placeholder="메뉴ID, 메뉴명, 화면경로..."
              className="w-full h-8 pl-8 pr-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E]"
            />
          </div>

          <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-[#131B2E]">
            <button
              type="button"
              onClick={() => setMenuViewMode('LIST')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                menuViewMode === 'LIST' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="목록 보기"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMenuViewMode('CARD')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                menuViewMode === 'CARD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="카드 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenMenuModal()}
            className="min-h-[32px] px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>메뉴 등록</span>
          </button>
        </div>
      </div>

      {menuViewMode === 'LIST' ? (
        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-400">
                <th className="py-2.5 px-3">메뉴 ID</th>
                <th className="py-2.5 px-3">메뉴명</th>
                <th className="py-2.5 px-3">메뉴구분</th>
                <th className="py-2.5 px-3">화면경로</th>
                <th className="py-2.5 px-3 text-center">사용여부</th>
                <th className="py-2.5 px-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    검색 및 필터 조건에 일치하는 메뉴가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredMenus.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{m.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">{m.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-bold">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.path}</td>
                    <td className="py-2.5 px-3 text-center">
                      <ElmChk01
                        checked={m.isEnabled}
                        onChange={() => {}}
                        disabled={true}
                        className="min-h-0 py-0 justify-center"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenMenuModal(m)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMenu(m.id)}
                          className="p-1 rounded hover:bg-rose-50 text-rose-500"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMenus.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">
              검색 및 필터 조건에 일치하는 메뉴가 없습니다.
            </div>
          ) : (
            filteredMenus.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-2.5 shadow-xs hover:border-indigo-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                    {m.id}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-bold text-slate-600 dark:text-zinc-400">
                    {m.category}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{m.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{m.path}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold">사용:</span>
                    <ElmChk01
                      checked={m.isEnabled}
                      onChange={() => {}}
                      disabled={true}
                      className="min-h-0 py-0"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenMenuModal(m)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMenu(m.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 메뉴 등록/수정 모달 */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold">{editingMenu ? '메뉴 수정' : '메뉴 등록'}</h4>
              <button type="button" onClick={() => setIsMenuModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">메뉴 ID</label>
                <input
                  type="text"
                  value={menuFormId}
                  disabled={!!editingMenu}
                  onChange={(e) => setMenuFormId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">메뉴명</label>
                <input
                  type="text"
                  value={menuFormName}
                  onChange={(e) => setMenuFormName(e.target.value)}
                  placeholder="예: 가계부 관리 상세"
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">메뉴 구분</label>
                <select
                  value={menuFormCategory}
                  onChange={(e) => setMenuFormCategory(e.target.value)}
                  className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                >
                  <option value="금융서비스">금융서비스</option>
                  <option value="라이프협업">라이프협업</option>
                  <option value="빠른입력">빠른입력</option>
                  <option value="시스템운영">시스템운영</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">연결 화면 경로</label>
                <input
                  type="text"
                  value={menuFormPath}
                  onChange={(e) => setMenuFormPath(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                />
              </div>
              <div className="pt-1">
                <ElmChk01
                  checked={menuFormEnabled}
                  onChange={setMenuFormEnabled}
                  label="사용 여부 활성화"
                  className="min-h-0 py-0.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsMenuModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
              <button type="button" onClick={handleSaveMenu} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. 화면 관리 Sub-Tab
   ========================================================================= */
interface RbacScreensSubTabProps {
  screens: ScreenItem[];
  roles: RoleGroupItem[];
  onSyncScreensAndRoles: (nextScreens: ScreenItem[], nextRoles: RoleGroupItem[]) => void;
  onToast: (message: string) => void;
}

export const RbacScreensSubTab: React.FC<RbacScreensSubTabProps> = ({
  screens,
  roles,
  onSyncScreensAndRoles,
  onToast,
}) => {
  const [isScreenModalOpen, setIsScreenModalOpen] = useState<boolean>(false);
  const [editingScreen, setEditingScreen] = useState<ScreenItem | null>(null);
  const [screenFormId, setScreenFormId] = useState<string>('');
  const [screenFormName, setScreenFormName] = useState<string>('');
  const [screenFormRoute, setScreenFormRoute] = useState<string>('');
  const [screenFormRequiredRole, setScreenFormRequiredRole] = useState<string>('ROLE_MEMBER');
  const [screenFormCategory, setScreenFormCategory] = useState<string>('금융서비스');
  const [screenFormDescriptionMd, setScreenFormDescriptionMd] = useState<string>('');
  const [screenFormEnabled, setScreenFormEnabled] = useState<boolean>(true);
  const [screenFormMappedRoles, setScreenFormMappedRoles] = useState<string[]>([]);

  const [screenViewMode, setScreenViewMode] = useState<'LIST' | 'CARD'>('LIST');
  const [screenFilterRole, setScreenFilterRole] = useState<string>('ALL');
  const [screenSearchQuery, setScreenSearchQuery] = useState<string>('');

  const filteredScreens = screens.filter((s) => {
    if (screenFilterRole !== 'ALL' && s.requiredRole !== screenFilterRole) return false;
    if (screenSearchQuery.trim()) {
      const q = screenSearchQuery.trim().toLowerCase();
      const matchId = s.id.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoute = s.route.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchRoute) return false;
    }
    return true;
  });

  const handleOpenScreenModal = (scr?: ScreenItem) => {
    if (scr) {
      setEditingScreen(scr);
      setScreenFormId(scr.id);
      setScreenFormName(scr.name);
      setScreenFormRoute(scr.route);
      setScreenFormRequiredRole(scr.requiredRole);
      setScreenFormCategory(scr.category);
      setScreenFormDescriptionMd(scr.descriptionMd);
      setScreenFormEnabled(scr.isEnabled);
      setScreenFormMappedRoles(scr.mappedRoleIds || []);
    } else {
      setEditingScreen(null);
      setScreenFormId(`SCR-CUST-${Date.now().toString().slice(-4)}`);
      setScreenFormName('');
      setScreenFormRoute('/custom');
      setScreenFormRequiredRole('ROLE_MEMBER');
      setScreenFormCategory('금융서비스');
      setScreenFormDescriptionMd('### 화면 개요 및 설명 (Markdown)\n- 화면 주요 기능을 기술하세요.');
      setScreenFormEnabled(true);
      setScreenFormMappedRoles(['ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN']);
    }
    setIsScreenModalOpen(true);
  };

  const handleSaveScreen = () => {
    if (!screenFormId.trim() || !screenFormName.trim() || !screenFormRoute.trim()) {
      onToast('화면 ID, 화면명, 라우트를 모두 입력해 주세요.');
      return;
    }
    let updatedScreens: ScreenItem[];
    const screenId = editingScreen ? editingScreen.id : screenFormId.trim();

    if (editingScreen) {
      updatedScreens = screens.map((s) =>
        s.id === editingScreen.id
          ? {
              ...s,
              name: screenFormName.trim(),
              route: screenFormRoute.trim(),
              requiredRole: screenFormRequiredRole,
              category: screenFormCategory,
              descriptionMd: screenFormDescriptionMd,
              isEnabled: screenFormEnabled,
              mappedRoleIds: screenFormMappedRoles,
            }
          : s
      );
    } else {
      const newScreen: ScreenItem = {
        id: screenId,
        name: screenFormName.trim(),
        route: screenFormRoute.trim(),
        requiredRole: screenFormRequiredRole,
        category: screenFormCategory,
        descriptionMd: screenFormDescriptionMd,
        isEnabled: screenFormEnabled,
        mappedRoleIds: screenFormMappedRoles,
      };
      updatedScreens = [...screens, newScreen];
    }

    const updatedRoles = roles.map((role) => {
      const isMapped = screenFormMappedRoles.includes(role.id);
      const currentlyHas = role.mappedScreenIds.includes(screenId);
      if (isMapped && !currentlyHas) {
        return { ...role, mappedScreenIds: [...role.mappedScreenIds, screenId] };
      } else if (!isMapped && currentlyHas) {
        return { ...role, mappedScreenIds: role.mappedScreenIds.filter((id) => id !== screenId) };
      }
      return role;
    });

    onSyncScreensAndRoles(updatedScreens, updatedRoles);
    setIsScreenModalOpen(false);
    onToast(editingScreen ? '화면 정보 및 권한 매핑이 수정되었습니다.' : '새 화면이 등록되었습니다.');
  };

  const handleDeleteScreen = (screenId: string) => {
    if (!confirm(`'${screenId}' 화면을 삭제하시겠습니까?`)) return;
    const updatedScreens = screens.filter((s) => s.id !== screenId);
    const updatedRoles = roles.map((r) => ({
      ...r,
      mappedScreenIds: r.mappedScreenIds.filter((id) => id !== screenId),
    }));
    onSyncScreensAndRoles(updatedScreens, updatedRoles);
    onToast('화면이 삭제되었습니다.');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0E131F] p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
        <div className="flex-1 min-w-0">
          <ElmSld03 showNavButtons={false} className="w-full">
            <div className="flex items-center gap-2 min-w-max pb-1">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">기본권한:</span>
              {['ALL', 'ROLE_MEMBER', 'ROLE_OWNER', 'ROLE_SYSTEM_ADMIN'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setScreenFilterRole(role)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    screenFilterRole === role
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                  }`}
                >
                  {role === 'ALL' ? '전체 권한' : role.replace('ROLE_', '')}
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
              value={screenSearchQuery}
              onChange={(e) => setScreenSearchQuery(e.target.value)}
              placeholder="화면ID, 화면명, 라우트..."
              className="w-full h-8 pl-8 pr-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E]"
            />
          </div>

          <div className="flex items-center border border-slate-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-[#131B2E]">
            <button
              type="button"
              onClick={() => setScreenViewMode('LIST')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                screenViewMode === 'LIST' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="목록 보기"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setScreenViewMode('CARD')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                screenViewMode === 'CARD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
              title="카드 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenScreenModal()}
            className="min-h-[32px] px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>화면 등록</span>
          </button>
        </div>
      </div>

      {screenViewMode === 'LIST' ? (
        <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-400">
                <th className="py-2.5 px-3">화면 ID</th>
                <th className="py-2.5 px-3">화면명</th>
                <th className="py-2.5 px-3">라우트</th>
                <th className="py-2.5 px-3">기본 접근권한</th>
                <th className="py-2.5 px-3">매핑된 권한그룹</th>
                <th className="py-2.5 px-3 text-center">사용여부</th>
                <th className="py-2.5 px-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredScreens.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    검색 및 필터 조건에 일치하는 화면이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredScreens.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.id}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-zinc-100">{s.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{s.route}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                        {s.requiredRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {s.mappedRoleIds?.map((rId) => (
                          <span key={rId} className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono">
                            {rId.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <ElmChk01
                        checked={s.isEnabled}
                        onChange={() => {}}
                        disabled={true}
                        className="min-h-0 py-0 justify-center"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenScreenModal(s)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600"
                          title="수정"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScreen(s.id)}
                          className="p-1 rounded hover:bg-rose-50 text-rose-500"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredScreens.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400">
              검색 및 필터 조건에 일치하는 화면이 없습니다.
            </div>
          ) : (
            filteredScreens.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-2.5 shadow-xs hover:border-indigo-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                    {s.id}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                    {s.requiredRole.replace('ROLE_', '')}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{s.name}</h4>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">{s.route}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.mappedRoleIds?.map((rId) => (
                    <span key={rId} className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-mono">
                      {rId.replace('ROLE_', '')}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-semibold">사용:</span>
                    <ElmChk01
                      checked={s.isEnabled}
                      onChange={() => {}}
                      disabled={true}
                      className="min-h-0 py-0"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenScreenModal(s)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteScreen(s.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 화면 등록/수정 모달 */}
      {isScreenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold">{editingScreen ? '화면 수정' : '화면 등록'}</h4>
              <button type="button" onClick={() => setIsScreenModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">화면 ID</label>
                  <input
                    type="text"
                    value={screenFormId}
                    disabled={!!editingScreen}
                    onChange={(e) => setScreenFormId(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">화면명</label>
                  <input
                    type="text"
                    value={screenFormName}
                    onChange={(e) => setScreenFormName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">라우트</label>
                  <input
                    type="text"
                    value={screenFormRoute}
                    onChange={(e) => setScreenFormRoute(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">기본 접근권한</label>
                  <select
                    value={screenFormRequiredRole}
                    onChange={(e) => setScreenFormRequiredRole(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                  >
                    <option value="ROLE_GUEST">ROLE_GUEST</option>
                    <option value="ROLE_MEMBER">ROLE_MEMBER</option>
                    <option value="ROLE_OWNER">ROLE_OWNER</option>
                    <option value="ROLE_SYSTEM_ADMIN">ROLE_SYSTEM_ADMIN</option>
                  </select>
                </div>
              </div>

              <ElmMkd01
                value={screenFormDescriptionMd}
                onChange={setScreenFormDescriptionMd}
                label="화면 설명 (Markdown 포맷)"
                rows={4}
                heightClass="min-h-[150px]"
                defaultMode="edit"
              />

              <div>
                <label className="font-bold block mb-1.5">매핑된 권한그룹</label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl border bg-slate-50 dark:bg-[#0E131F]">
                  {roles.map((r) => (
                    <ElmChk01
                      key={r.id}
                      checked={screenFormMappedRoles.includes(r.id)}
                      onChange={(chk) => {
                        if (chk) {
                          setScreenFormMappedRoles([...screenFormMappedRoles, r.id]);
                        } else {
                          setScreenFormMappedRoles(screenFormMappedRoles.filter((id) => id !== r.id));
                        }
                      }}
                      label={r.name}
                      className="min-h-0 py-0.5"
                    />
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <ElmChk01
                  checked={screenFormEnabled}
                  onChange={setScreenFormEnabled}
                  label="화면 활성화 (사용여부)"
                  className="min-h-0 py-0.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsScreenModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
              <button type="button" onClick={handleSaveScreen} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
