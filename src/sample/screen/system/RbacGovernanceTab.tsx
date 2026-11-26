import React, { useState } from 'react';
import { Users } from 'lucide-react';
import {
  ScreenItem,
  RoleGroupItem,
  loadManagedScreens,
  saveManagedScreens,
  loadManagedRoles,
  saveManagedRoles,
} from '../../data/systemGovernancePool';
import { RbacTermsSubTab } from './RbacTermsSubTab';
import { RbacMenusSubTab, RbacScreensSubTab } from './RbacMenusScreensSubTabs';
import {
  RbacRolesSubTab,
  RbacPermissionsSubTab,
  RbacUsersSubTab,
} from './RbacRolesUsersSubTabs';

type RbacSubTabId = 'TERMS' | 'MENUS' | 'SCREENS' | 'ROLES' | 'PERMISSIONS' | 'USERS';

interface RbacGovernanceTabProps {
  onToast: (message: string) => void;
}

export const RbacGovernanceTab: React.FC<RbacGovernanceTabProps> = ({ onToast }) => {
  const [rbacSubTab, setRbacSubTab] = useState<RbacSubTabId>('TERMS');
  const [screens, setScreens] = useState<ScreenItem[]>(() => loadManagedScreens());
  const [roles, setRoles] = useState<RoleGroupItem[]>(() => loadManagedRoles());

  const handleSyncScreensAndRoles = (nextScreens: ScreenItem[], nextRoles: RoleGroupItem[]) => {
    setScreens(nextScreens);
    saveManagedScreens(nextScreens);
    setRoles(nextRoles);
    saveManagedRoles(nextRoles);
  };

  const handleUpdateRolesOnly = (nextRoles: RoleGroupItem[]) => {
    setRoles(nextRoles);
    saveManagedRoles(nextRoles);
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>약관 및 시스템 설정 관리</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            약관 3대 구분(라디오 사용설정), 메뉴, 화면, 권한그룹, 권한매핑, 사용자 회원정보 및 마스킹 상세를 관리합니다.
          </p>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'TERMS' as const, label: '1. 약관 관리' },
          { id: 'MENUS' as const, label: '2. 메뉴 관리' },
          { id: 'SCREENS' as const, label: '3. 화면 관리' },
          { id: 'ROLES' as const, label: '4. 권한그룹' },
          { id: 'PERMISSIONS' as const, label: '5. 권한 매핑' },
          { id: 'USERS' as const, label: '6. 사용자 관리' },
        ].map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setRbacSubTab(sub.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rbacSubTab === sub.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {rbacSubTab === 'TERMS' && <RbacTermsSubTab onToast={onToast} />}
      {rbacSubTab === 'MENUS' && <RbacMenusSubTab onToast={onToast} />}
      {rbacSubTab === 'SCREENS' && (
        <RbacScreensSubTab
          screens={screens}
          roles={roles}
          onSyncScreensAndRoles={handleSyncScreensAndRoles}
          onToast={onToast}
        />
      )}
      {rbacSubTab === 'ROLES' && (
        <RbacRolesSubTab
          roles={roles}
          screens={screens}
          onSyncScreensAndRoles={handleSyncScreensAndRoles}
          onUpdateRolesOnly={handleUpdateRolesOnly}
          onToast={onToast}
        />
      )}
      {rbacSubTab === 'PERMISSIONS' && (
        <RbacPermissionsSubTab
          roles={roles}
          screens={screens}
          onSyncScreensAndRoles={handleSyncScreensAndRoles}
          onToast={onToast}
        />
      )}
      {rbacSubTab === 'USERS' && <RbacUsersSubTab onToast={onToast} />}
    </section>
  );
};
