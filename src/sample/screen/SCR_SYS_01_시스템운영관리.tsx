import React, { useState, useRef } from 'react';
import {
  ElmTyp01,
  ElmSwt01,
  ElmInp01,
  ElmSel01,
  ElmSld03,
  ElmChk01,
  ElmMkd01,
  ElmMkdViewer,
} from '../elements/Tokens';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Lock,
  Clock,
  Radio,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HardDrive,
  KeyRound,
  Bell,
  Users,
  Coins,
  Code2,
  Gamepad2,
  Save,
  RotateCcw,
  Check,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Eye,
  Coffee,
  HelpCircle,
  FolderTree,
  Building2,
  CreditCard,
  Target,
  Sparkles,
  Smartphone,
  Globe,
  Tag,
  ArrowRight,
  Sliders,
  UserCheck,
  UserX,
  X,
  CheckSquare,
  Square,
  FileCode,
  Image as ImageIcon,
  Type as TypeIcon,
  Link,
  Store,
  Utensils,
  Download,
  Upload,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  List,
  GripVertical,
} from 'lucide-react';
import {
  SystemAuthSecurityConfig,
  SystemNotificationMatrix,
  SystemFinancialCompliance,
  MenuItem,
  ScreenItem,
  RoleGroupItem,
  ManagedUser,
  TermsDocument,
  TermsHistoryItem,
  TermsCategoryType,
  MasterGroupCode,
  MasterDetailCode,
  SystemNoticeItem,
  NoticeModeType,
  NoticeTargetType,
  MASTER_GROUP_CODES,
  loadAuthSecurityConfig,
  saveAuthSecurityConfig,
  loadNotificationMatrix,
  saveNotificationMatrix,
  loadFinancialCompliance,
  saveFinancialCompliance,
  loadManagedMenus,
  saveManagedMenus,
  loadManagedScreens,
  saveManagedScreens,
  loadManagedRoles,
  saveManagedRoles,
  loadManagedUsers,
  saveManagedUsers,
  loadManagedTerms,
  saveManagedTerms,
  loadMasterDetailCodes,
  saveMasterDetailCodes,
  loadSystemStorePool,
  saveSystemStorePool,
  loadSystemRoulettePresets,
  saveSystemRoulettePresets,
  loadSystemLadderPresets,
  saveSystemLadderPresets,
  loadSystemNotices,
  saveSystemNotices,
  resetAllSystemGovernance,
} from '../data/systemGovernancePool';
import { StorePreset, StoreMenuItem, RoulettePreset, LadderGoalPreset } from '../data/systemStorePool';

type SystemTabId =
  | 'INFRA'
  | 'AUTH_SEC'
  | 'NOTIFY'
  | 'RBAC_LEGAL'
  | 'FINANCE'
  | 'MASTER_CODE'
  | 'GAME_POOL'
  | 'NOTICE';

// 기본 메뉴 아이콘 선택 풀
const DEFAULT_MENU_ICONS = ['☕', '🥪', '🥗', '🍜', '🍰', '🥤', '🍱', '🍲', '🍕', '🍔', '🍙', '🍢', '🍦', '🍪'];

export const SCR_SYS_01_시스템운영관리: React.FC<{
  onBack?: () => void;
}> = ({ onBack }) => {
  // 1. 활성 탭 관리 (8대 거버넌스)
  const [activeTab, setActiveTab] = useState<SystemTabId>('INFRA');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const showToast = (message: string) => {
    setSaveToast(message);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // 2. 인프라 관제 상태
  // 3. 로그인 및 인증 보안 설정
  const [authSec, setAuthSec] = useState<SystemAuthSecurityConfig>(() =>
    loadAuthSecurityConfig()
  );

  // 4. 알림 발송 매트릭스 설정 (12종 전수 복원)
  const [notifyMatrix, setNotifyMatrix] = useState<SystemNotificationMatrix>(() =>
    loadNotificationMatrix()
  );

  // 5. 금융 기능 컴플라이언스 통제
  const [financeComp, setFinanceComp] = useState<SystemFinancialCompliance>(() =>
    loadFinancialCompliance()
  );

  // 6. RBAC 및 약관 거버넌스 상태
  const [rbacSubTab, setRbacSubTab] = useState<
    'TERMS' | 'MENUS' | 'SCREENS' | 'ROLES' | 'PERMISSIONS' | 'USERS'
  >('TERMS');

  // 6.1 약관 관리 (3대 구분: 서비스이용약관, 개인정보수집및이용동의, 이벤트알림및수신동의)
  const [terms, setTerms] = useState<TermsDocument[]>(() => loadManagedTerms());
  const [selectedTermCategory, setSelectedTermCategory] = useState<TermsCategoryType | 'ALL'>('ALL');
  const [selectedTermId, setSelectedTermId] = useState<string>(terms[0]?.id || 'term-svc-01');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [baseVersionForEdit, setBaseVersionForEdit] = useState<string>('');
  const [isEditingTerm, setIsEditingTerm] = useState<boolean>(false);
  const [termEditMarkdown, setTermEditMarkdown] = useState<string>('');
  const [termEditVersion, setTermEditVersion] = useState<string>('');
  const [termEditSummary, setTermEditSummary] = useState<string>('');
  const [isTermModalOpen, setIsTermModalOpen] = useState<boolean>(false);
  const [termFormType, setTermFormType] = useState<TermsCategoryType>('SERVICE');
  const [termFormTitle, setTermFormTitle] = useState<string>('');
  const [termFormVersion, setTermFormVersion] = useState<string>('v1.0');
  const [termFormContent, setTermFormContent] = useState<string>('');

  // 6.2 메뉴 관리 (메뉴명, 메뉴ID, 메뉴구분, 사용여부)
  const [menus, setMenus] = useState<MenuItem[]>(() => loadManagedMenus());
  const [isMenuModalOpen, setIsMenuModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuFormId, setMenuFormId] = useState<string>('');
  const [menuFormName, setMenuFormName] = useState<string>('');
  const [menuFormCategory, setMenuFormCategory] = useState<string>('금융서비스');
  const [menuFormPath, setMenuFormPath] = useState<string>('SCR-DSH-01');
  const [menuFormOrder, setMenuFormOrder] = useState<number>(1);
  const [menuFormEnabled, setMenuFormEnabled] = useState<boolean>(true);

  // 6.3 화면 관리 (화면명, 화면ID, 라우트, 접근권한, 설명(md), 사용여부, 매핑된 권한관리)
  const [screens, setScreens] = useState<ScreenItem[]>(() => loadManagedScreens());
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

  // 6.4 권한그룹 관리 (권한그룹명, 권한그룹ID, 사용여부)
  const [roles, setRoles] = useState<RoleGroupItem[]>(() => loadManagedRoles());
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleGroupItem | null>(null);
  const [roleFormId, setRoleFormId] = useState<string>('');
  const [roleFormName, setRoleFormName] = useState<string>('');
  const [roleFormDescription, setRoleFormDescription] = useState<string>('');
  const [roleFormEnabled, setRoleFormEnabled] = useState<boolean>(true);

  // 6.5 권한관리 (권한그룹에 화면 매핑 연동)
  const [selectedRoleIdForMapping, setSelectedRoleIdForMapping] = useState<string>(
    roles[0]?.id || 'ROLE_SYSTEM_ADMIN'
  );

  // 6.6 사용자 관리 (조회, 사용여부 토글, 상세 모달 - 계좌 등 민감정보 마스킹, 비밀번호 초기화)
  const [users, setUsers] = useState<ManagedUser[]>(() => loadManagedUsers());
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<ManagedUser | null>(null);

  // 7. 20대 마스터 코드 관리 상태
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>('LEDGER_TYPE');
  const [codeFilterCategory, setCodeFilterCategory] = useState<string>('ALL');
  const [detailCodes, setDetailCodes] = useState<MasterDetailCode[]>(() =>
    loadMasterDetailCodes()
  );
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [editingCode, setEditingCode] = useState<MasterDetailCode | null>(null);
  const [codeFormCode, setCodeFormCode] = useState<string>('');
  const [codeFormName, setCodeFormName] = useState<string>('');
  const [codeFormEnName, setCodeFormEnName] = useState<string>('');
  const [codeFormSort, setCodeFormSort] = useState<number>(1);
  const [codeFormDefault, setCodeFormDefault] = useState<boolean>(false);
  const [codeFormEnabled, setCodeFormEnabled] = useState<boolean>(true);
  const [codeFormPriority, setCodeFormPriority] = useState<number>(10);
  const [codeFormUserField1, setCodeFormUserField1] = useState<string>('');
  const [codeFormUserField2, setCodeFormUserField2] = useState<string>('');
  const [codeFormUserField3, setCodeFormUserField3] = useState<string>('');
  const [groupScrollCount, setGroupScrollCount] = useState<3 | 5 | 10 | 20>(10);
  const [isGroupPanelOpen, setIsGroupPanelOpen] = useState<boolean>(true);
  const [draggedDetailIndex, setDraggedDetailIndex] = useState<number | null>(null);
  const [dragOverDetailIndex, setDragOverDetailIndex] = useState<number | null>(null);

  // 8. 게임 풀 관리 상태 (매장 등록/수정/삭제 & 메뉴 등록/수정/삭제 & 사다리/룰렛 프리셋)
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvSampleMenuOpen, setCsvSampleMenuOpen] = useState<boolean>(false);
  const [gameSubTab, setGameSubTab] = useState<'LADDER' | 'ROULETTE'>('LADDER');
  const [ladderSubView, setLadderSubView] = useState<'STORE_MENU' | 'LADDER_PRESET'>('STORE_MENU');
  const [systemStores, setSystemStores] = useState<StorePreset[]>(() =>
    loadSystemStorePool()
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    systemStores[0]?.id || 'sys_store_pluscafe_45f'
  );
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<StorePreset | null>(null);
  const [storeFormName, setStoreFormName] = useState<string>('');
  const [storeFormBrand, setStoreFormBrand] = useState<string>('');
  const [storeFormCategory, setStoreFormCategory] = useState<'CAFE' | 'LUNCH' | 'DINNER' | 'SNACK'>('CAFE');
  const [storeFormLocation, setStoreFormLocation] = useState<string>('');
  const [storeFormThemeColor, setStoreFormThemeColor] = useState<string>('#006241');

  // 매장 메뉴 관리 모달
  const [isMenuEditModalOpen, setIsMenuEditModalOpen] = useState<boolean>(false);
  const [editingStoreMenuItem, setEditingStoreMenuItem] = useState<StoreMenuItem | null>(null);
  const [itemFormName, setItemFormName] = useState<string>('');
  const [itemFormPrice, setItemFormPrice] = useState<number>(4500);
  const [itemFormCategory, setItemFormCategory] = useState<string>('대표메뉴');
  const [itemFormIcon, setItemFormIcon] = useState<string>('☕');
  const [itemIconMode, setItemIconMode] = useState<'EMOJI' | 'UPLOAD' | 'URL'>('EMOJI');
  const [itemFormImageUrl, setItemFormImageUrl] = useState<string>('');
  const [itemFormUrlInput, setItemFormUrlInput] = useState<string>('');
  const [itemFormDesc, setItemFormDesc] = useState<string>('');
  const [storeMenuFilterCat, setStoreMenuFilterCat] = useState<string>('전체');

  // 8.1 사다리 프리셋 관리
  const [ladderPresets, setLadderPresets] = useState<LadderGoalPreset[]>(() =>
    loadSystemLadderPresets()
  );
  const [selectedLadderPresetId, setSelectedLadderPresetId] = useState<string>(
    ladderPresets[0]?.id || 'preset_coffee_bet'
  );
  const [isLadderPresetModalOpen, setIsLadderPresetModalOpen] = useState<boolean>(false);
  const [editingLadderPreset, setEditingLadderPreset] = useState<LadderGoalPreset | null>(null);
  const [ladderFormTitle, setLadderFormTitle] = useState<string>('');
  const [ladderFormCategory, setLadderFormCategory] = useState<'COFFEE' | 'LUNCH' | 'DUTY'>('COFFEE');
  const [ladderFormDescription, setLadderFormDescription] = useState<string>('');
  const [ladderFormPlayerCount, setLadderFormPlayerCount] = useState<number>(5);
  const [ladderFormWinnerCount, setLadderFormWinnerCount] = useState<number>(1);
  const [ladderFormStoreId, setLadderFormStoreId] = useState<string>('');

  // 8.2 룰렛 프리셋 관리
  const [roulettePresets, setRoulettePresets] = useState<RoulettePreset[]>(() =>
    loadSystemRoulettePresets()
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    roulettePresets[0]?.id || 'roulette_preset_lunch'
  );
  const [isRoulettePresetModalOpen, setIsRoulettePresetModalOpen] = useState<boolean>(false);
  const [editingRoulettePreset, setEditingRoulettePreset] = useState<RoulettePreset | null>(null);
  const [rouletteFormTitle, setRouletteFormTitle] = useState<string>('');
  const [rouletteFormCategory, setRouletteFormCategory] = useState<'LUNCH' | 'DUTY' | 'PENALTY' | 'COFFEE' | 'CUSTOM'>('LUNCH');
  const [rouletteFormDescription, setRouletteFormDescription] = useState<string>('');
  const [rouletteFormIcon, setRouletteFormIcon] = useState<string>('🍱');
  const [rouletteFormItems, setRouletteFormItems] = useState<Array<{ id: string; name: string; icon?: string; weight: number }>>([]);

  // 9. 긴급 공지 관리 상태
  const [notices, setNotices] = useState<SystemNoticeItem[]>(() => loadSystemNotices());
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<SystemNoticeItem | null>(null);
  const [previewNotice, setPreviewNotice] = useState<SystemNoticeItem | null>(null);
  const [noticeFormTitle, setNoticeFormTitle] = useState<string>('');
  const [noticeFormMode, setNoticeFormMode] = useState<NoticeModeType>('TEXT');
  const [noticeFormContent, setNoticeFormContent] = useState<string>('');
  const [noticeFormImageUrl, setNoticeFormImageUrl] = useState<string>('');
  const [noticeFormHasButton, setNoticeFormHasButton] = useState<boolean>(true);
  const [noticeFormButtonText, setNoticeFormButtonText] = useState<string>('자세히 보기');
  const [noticeFormTargetType, setNoticeFormTargetType] = useState<NoticeTargetType>('INTERNAL_SCREEN');
  const [noticeFormButtonUrl, setNoticeFormButtonUrl] = useState<string>('SCR-DSH-01');
  const [noticeFormEnabled, setNoticeFormEnabled] = useState<boolean>(true);

  // 6. RBAC 관리 보기모드 & 필터 상태
  const [menuViewMode, setMenuViewMode] = useState<'LIST' | 'CARD'>('LIST');
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('ALL');
  const [menuFilterEnabled, setMenuFilterEnabled] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('');

  const [screenViewMode, setScreenViewMode] = useState<'LIST' | 'CARD'>('LIST');
  const [screenFilterRole, setScreenFilterRole] = useState<string>('ALL');
  const [screenSearchQuery, setScreenSearchQuery] = useState<string>('');

  const [userViewMode, setUserViewMode] = useState<'LIST' | 'CARD'>('LIST');
  const [userFilterRole, setUserFilterRole] = useState<string>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  // 새로고침 시뮬레이션
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('인프라 관제 지표가 갱신되었습니다.');
    }, 500);
  };

  const handleSaveAuthSec = () => {
    saveAuthSecurityConfig(authSec);
    showToast('로그인 인증 및 보안 설정이 저장되었습니다.');
  };

  const handleSaveNotifyMatrix = () => {
    saveNotificationMatrix(notifyMatrix);
    showToast('알림 발송 매트릭스 정책이 저장되었습니다.');
  };

  const handleSaveFinanceComp = () => {
    saveFinancialCompliance(financeComp);
    showToast('금융 컴플라이언스 송금 통제 설정이 저장되었습니다.');
  };

  /* -------------------------------------------------------------------------
     약관 CRUD 및 사용설정(라디오버튼) 핸들러
     ------------------------------------------------------------------------- */
  const handleSetCurrentTerm = (termId: string) => {
    const target = terms.find((t) => t.id === termId);
    if (!target) return;
    const updated = terms.map((t) => {
      if (t.type === target.type) {
        return { ...t, isCurrent: t.id === termId };
      }
      return t;
    });
    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedTermId(termId);
    showToast(`'${target.title}' (${target.version})이(가) 현재 서비스 대표 약관으로 적용되었습니다.`);
  };

  const handleOpenNewTermModal = () => {
    setTermFormType('SERVICE');
    setTermFormTitle('');
    setTermFormVersion('v1.0');
    setTermFormContent('# 새 약관 제목\n\n### 제1조 (목적)\n약관 내용을 입력해 주세요.');
    setIsTermModalOpen(true);
  };

  const handleSaveNewTerm = () => {
    if (!termFormTitle.trim() || !termFormContent.trim()) {
      alert('약관 제목과 본문을 입력해 주세요.');
      return;
    }
    const typeLabelMap: Record<TermsCategoryType, string> = {
      SERVICE: '서비스이용약관',
      PRIVACY: '개인정보수집및 이용동의',
      MARKETING: '이벤트알림 및 라이프 혜택 정보수신동의',
    };
    const newDoc: TermsDocument = {
      id: `term-${termFormType.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      type: termFormType,
      typeLabel: typeLabelMap[termFormType],
      title: termFormTitle.trim(),
      version: termFormVersion.trim() || 'v1.0',
      effectiveDate: new Date().toISOString().slice(0, 10),
      isCurrent: false,
      contentMarkdown: termFormContent,
      history: [
        {
          id: `hist-${Date.now()}`,
          version: termFormVersion.trim() || 'v1.0',
          effectiveDate: new Date().toISOString().slice(0, 10),
          summary: '신규 약관 등록',
          isCurrent: true,
          contentMarkdown: termFormContent,
        },
      ],
    };
    const updated = [...terms, newDoc];
    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedTermId(newDoc.id);
    setIsTermModalOpen(false);
    showToast('새 약관이 성공적으로 등록되었습니다.');
  };

  // 버전 자동 증가 계산 헬퍼 (d.i: v1 -> v1.1, d.ii: v1.1 -> v1.2, 1.2 -> 1.3)
  const calculateNextSubVersion = (rawVer: string): string => {
    const trimmed = rawVer.trim();
    const hasV = trimmed.startsWith('v') || trimmed.startsWith('V');
    const clean = trimmed.replace(/^[vV]/, '');
    const parts = clean.split('.');

    if (parts.length >= 2) {
      const major = parseInt(parts[0], 10) || 1;
      const minor = parseInt(parts[1], 10) || 0;
      return `${hasV ? 'v' : ''}${major}.${minor + 1}`;
    } else {
      const major = parseInt(parts[0], 10) || 1;
      return `${hasV ? 'v' : ''}${major}.1`;
    }
  };

  const handleUpdateCurrentTerm = () => {
    if (!termEditMarkdown.trim()) {
      alert('약관 본문 내용을 입력해 주세요.');
      return;
    }

    const inputVer = termEditVersion.trim();
    let nextVer: string;

    // d & e: 등록된 버전(버전수정없이)으로 저장하는 경우 서브버전 증가, 버전 수정 시 그대로 저장
    if (!inputVer || inputVer === baseVersionForEdit) {
      nextVer = calculateNextSubVersion(baseVersionForEdit || curTerm.version);
    } else {
      nextVer = inputVer;
    }

    const newHistItem: TermsHistoryItem = {
      id: `hist-${Date.now()}`,
      version: nextVer,
      effectiveDate: new Date().toISOString().slice(0, 10),
      summary: termEditSummary.trim() || `${nextVer} 개정 저장`,
      isCurrent: true,
      contentMarkdown: termEditMarkdown,
    };

    const updated = terms.map((t) => {
      if (t.id === curTerm.id) {
        // 기존 history의 isCurrent를 false로 변경하고 새 이력을 최상단에 추가 (최근이력 상단)
        const prevHistory = (t.history || []).map((h) => ({ ...h, isCurrent: false }));
        return {
          ...t,
          version: nextVer,
          effectiveDate: newHistItem.effectiveDate,
          contentMarkdown: termEditMarkdown,
          history: [newHistItem, ...prevHistory],
        };
      }
      return t;
    });

    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedHistoryId(newHistItem.id);
    setBaseVersionForEdit(nextVer);
    setTermEditVersion(nextVer);
    setIsEditingTerm(false);
    showToast(`'${curTerm.title}'이(가) ${nextVer} 버전으로 저장 및 갱신되었습니다.`);
  };

  // 6.1.2 저장이력 중 특정 버전을 대표 사용설정으로 적용 및 본문 표시 (단일 배타적 선택 보장)
  const handleApplyHistoryVersion = (hist: TermsHistoryItem) => {
    const updated = terms.map((t) => {
      if (t.id === curTerm.id) {
        // 선택된 hist만 isCurrent=true, 나머지 모든 이력은 반드시 isCurrent=false로 해제
        const nextHistory = (t.history || []).map((h) => ({
          ...h,
          isCurrent: (h.id && hist.id ? h.id === hist.id : h.version === hist.version),
        }));
        return {
          ...t,
          version: hist.version,
          effectiveDate: hist.effectiveDate,
          contentMarkdown: hist.contentMarkdown || t.contentMarkdown,
          history: nextHistory,
        };
      }
      return t;
    });
    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedHistoryId(hist.id);
    setTermEditVersion(hist.version);
    setBaseVersionForEdit(hist.version);
    if (hist.contentMarkdown) {
      setTermEditMarkdown(hist.contentMarkdown);
    }
    showToast(`'${curTerm.title}' (${hist.version}) 버전이 대표 약관으로 적용되었습니다.`);
  };

  // 6.1.3 저장이력 삭제
  const handleDeleteHistoryItem = (histId: string, version: string) => {
    if (!curTerm.history || curTerm.history.length <= 1) {
      alert('최소 1개 이상의 개정 저장이력이 유지되어야 합니다.');
      return;
    }
    if (!confirm(`${version} 개정 이력을 삭제하시겠습니까?`)) return;

    const updated = terms.map((t) => {
      if (t.id === curTerm.id) {
        const nextHistory = t.history.filter((h) => (h.id ? h.id !== histId : h.version !== version));
        return {
          ...t,
          history: nextHistory,
        };
      }
      return t;
    });
    setTerms(updated);
    saveManagedTerms(updated);
    showToast(`${version} 개정 이력이 삭제되었습니다.`);
  };

  const handleDeleteTerm = (termId: string) => {
    if (terms.length <= 1) {
      alert('최소 1개 이상의 약관이 유지되어야 합니다.');
      return;
    }
    const target = terms.find((t) => t.id === termId);
    if (!confirm(`'${target?.title}' 약관을 삭제하시겠습니까?`)) return;
    const updated = terms.filter((t) => t.id !== termId);
    setTerms(updated);
    saveManagedTerms(updated);
    if (selectedTermId === termId) {
      setSelectedTermId(updated[0].id);
    }
    showToast('약관이 삭제되었습니다.');
  };

  /* -------------------------------------------------------------------------
     메뉴 관리 CRUD 핸들러
     ------------------------------------------------------------------------- */
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
      alert('메뉴 ID와 메뉴명을 입력해 주세요.');
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
    showToast(editingMenu ? '메뉴가 수정되었습니다.' : '새 메뉴가 등록되었습니다.');
  };

  const handleDeleteMenu = (menuId: string) => {
    if (!confirm(`'${menuId}' 메뉴를 삭제하시겠습니까?`)) return;
    const updated = menus.filter((m) => m.id !== menuId);
    setMenus(updated);
    saveManagedMenus(updated);
    showToast('메뉴가 삭제되었습니다.');
  };

  /* -------------------------------------------------------------------------
     화면 관리 CRUD 핸들러
     ------------------------------------------------------------------------- */
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
      alert('화면 ID, 화면명, 라우트를 모두 입력해 주세요.');
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

    setScreens(updatedScreens);
    saveManagedScreens(updatedScreens);
    setRoles(updatedRoles);
    saveManagedRoles(updatedRoles);
    setIsScreenModalOpen(false);
    showToast(editingScreen ? '화면 정보 및 권한 매핑이 수정되었습니다.' : '새 화면이 등록되었습니다.');
  };

  const handleDeleteScreen = (screenId: string) => {
    if (!confirm(`'${screenId}' 화면을 삭제하시겠습니까?`)) return;
    const updatedScreens = screens.filter((s) => s.id !== screenId);
    const updatedRoles = roles.map((r) => ({
      ...r,
      mappedScreenIds: r.mappedScreenIds.filter((id) => id !== screenId),
    }));
    setScreens(updatedScreens);
    saveManagedScreens(updatedScreens);
    setRoles(updatedRoles);
    saveManagedRoles(updatedRoles);
    showToast('화면이 삭제되었습니다.');
  };

  /* -------------------------------------------------------------------------
     권한그룹 CRUD 및 매핑 토글 핸들러
     ------------------------------------------------------------------------- */
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
      alert('권한그룹 ID와 권한그룹명을 입력해 주세요.');
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
    setRoles(updated);
    saveManagedRoles(updated);
    setIsRoleModalOpen(false);
    showToast(editingRole ? '권한그룹이 수정되었습니다.' : '신규 권한그룹이 등록되었습니다.');
  };

  const handleDeleteRole = (roleId: string) => {
    if (roleId === 'ROLE_SYSTEM_ADMIN') {
      alert('최고 시스템 관리자(ROLE_SYSTEM_ADMIN) 그룹은 삭제할 수 없습니다.');
      return;
    }
    if (!confirm(`'${roleId}' 권한그룹을 삭제하시겠습니까?`)) return;
    const updatedRoles = roles.filter((r) => r.id !== roleId);
    const updatedScreens = screens.map((s) => ({
      ...s,
      mappedRoleIds: s.mappedRoleIds.filter((id) => id !== roleId),
    }));
    setRoles(updatedRoles);
    saveManagedRoles(updatedRoles);
    setScreens(updatedScreens);
    saveManagedScreens(updatedScreens);
    showToast('권한그룹이 삭제되었습니다.');
  };

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

    setRoles(updatedRoles);
    saveManagedRoles(updatedRoles);
    setScreens(updatedScreens);
    saveManagedScreens(updatedScreens);
    showToast(hasMapped ? '화면 접근 권한이 해제되었습니다.' : '화면 접근 권한이 부여되었습니다.');
  };

  /* -------------------------------------------------------------------------
     사용자 관리 & 비밀번호 초기화 핸들러
     ------------------------------------------------------------------------- */
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
    showToast('사용자 계정 상태가 변경되었습니다.');
  };

  const handleResetPassword = (targetUser: ManagedUser) => {
    if (!confirm(`'${targetUser.name}' 회원님의 비밀번호를 임시 비밀번호로 초기화하고 재설정 메일을 발송하시겠습니까?`)) {
      return;
    }
    showToast(`★ ${targetUser.name} 님의 비밀번호 초기화 메일이 ${targetUser.email} 로 발송되었습니다.`);
  };

  /* -------------------------------------------------------------------------
     마스터 코드 관리 핸들러
     ------------------------------------------------------------------------- */
  const handleOpenCodeModal = (item?: MasterDetailCode) => {
    if (item) {
      setEditingCode(item);
      setCodeFormCode(item.code);
      setCodeFormName(item.codeName);
      setCodeFormEnName(item.enName || '');
      setCodeFormSort(item.sortOrder);
      setCodeFormDefault(item.isDefault);
      setCodeFormEnabled(item.isEnabled);
      setCodeFormPriority(item.priority || 10);
      setCodeFormUserField1(item.userField1 || '');
      setCodeFormUserField2(item.userField2 || '');
      setCodeFormUserField3(item.userField3 || '');
    } else {
      setEditingCode(null);
      setCodeFormCode('');
      setCodeFormName('');
      setCodeFormEnName('');
      const groupCodes = detailCodes.filter((c) => c.groupCode === selectedGroupCode);
      setCodeFormSort(groupCodes.length + 1);
      setCodeFormDefault(false);
      setCodeFormEnabled(true);
      setCodeFormPriority(10);
      setCodeFormUserField1('');
      setCodeFormUserField2('');
      setCodeFormUserField3('');
    }
    setIsCodeModalOpen(true);
  };

  const handleSaveCode = () => {
    if (!codeFormCode.trim() || !codeFormName.trim()) {
      alert('코드와 코드명을 모두 입력해 주세요.');
      return;
    }
    let updated: MasterDetailCode[];
    if (editingCode) {
      updated = detailCodes.map((c) =>
        c.groupCode === selectedGroupCode && c.code === editingCode.code
          ? {
              ...c,
              code: codeFormCode.trim(),
              codeName: codeFormName.trim(),
              enName: codeFormEnName.trim() || undefined,
              sortOrder: codeFormSort,
              isDefault: codeFormDefault,
              isEnabled: codeFormEnabled,
              priority: codeFormPriority,
              userField1: codeFormUserField1.trim() || undefined,
              userField2: codeFormUserField2.trim() || undefined,
              userField3: codeFormUserField3.trim() || undefined,
            }
          : c
      );
    } else {
      const newCode: MasterDetailCode = {
        groupCode: selectedGroupCode,
        code: codeFormCode.trim().toUpperCase(),
        codeName: codeFormName.trim(),
        enName: codeFormEnName.trim() || undefined,
        sortOrder: codeFormSort,
        isDefault: codeFormDefault,
        isEnabled: codeFormEnabled,
        priority: codeFormPriority,
        userField1: codeFormUserField1.trim() || undefined,
        userField2: codeFormUserField2.trim() || undefined,
        userField3: codeFormUserField3.trim() || undefined,
      };
      updated = [...detailCodes, newCode];
    }
    if (codeFormDefault) {
      updated = updated.map((c) =>
        c.groupCode === selectedGroupCode && c.code !== (editingCode?.code || codeFormCode.trim().toUpperCase())
          ? { ...c, isDefault: false }
          : c
      );
    }
    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    setIsCodeModalOpen(false);
    showToast('마스터 상세코드가 저장되었습니다.');
  };

  const handleDeleteCode = (codeToDelete: string) => {
    if (!confirm(`'${codeToDelete}' 코드를 삭제하시겠습니까?`)) return;
    const updated = detailCodes.filter(
      (c) => !(c.groupCode === selectedGroupCode && c.code === codeToDelete)
    );
    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    showToast('상세코드가 삭제되었습니다.');
  };

  // 7.d 마스터 상세코드 우선순위 인라인 수정
  const handleUpdateCodePriority = (code: string, newPriority: number) => {
    const updated = detailCodes.map((c) =>
      c.groupCode === selectedGroupCode && c.code === code
        ? { ...c, priority: Math.max(1, newPriority) }
        : c
    );
    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    showToast(`코드 [${code}]의 우선순위가 ${Math.max(1, newPriority)}(으)로 변경되었습니다.`);
  };

  // 7.e 마스터 상세코드 행 드래그 앤 드롭 정렬 순서 변경
  const handleDetailDragStart = (e: React.DragEvent, index: number) => {
    setDraggedDetailIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDetailDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDetailIndex !== index) {
      setDragOverDetailIndex(index);
    }
  };

  const handleDetailDragEnd = () => {
    setDraggedDetailIndex(null);
    setDragOverDetailIndex(null);
  };

  const handleDetailDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverDetailIndex(null);
    if (draggedDetailIndex === null || draggedDetailIndex === targetIndex) {
      setDraggedDetailIndex(null);
      return;
    }

    const currentGroupItems = [...curDetailCodes];
    const [movedItem] = currentGroupItems.splice(draggedDetailIndex, 1);
    currentGroupItems.splice(targetIndex, 0, movedItem);

    // 순서(sortOrder) 1부터 재할당
    const reorderedGroupItems = currentGroupItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    // 전체 detailCodes 중 현재 그룹 외의 아이템과 합치기
    const otherGroupItems = detailCodes.filter((c) => c.groupCode !== selectedGroupCode);
    const updated = [...otherGroupItems, ...reorderedGroupItems];

    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    setDraggedDetailIndex(null);
    showToast(`코드 [${movedItem.codeName}]의 정렬 순서가 변경되었습니다.`);
  };

  // 6. CSV 샘플 다운로드 & 업로드 헬퍼
  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`샘플 파일(${filename})이 다운로드되었습니다.`);
  };

  const handleDownloadStoreSample = () => {
    const sample = '매장명,브랜드,분류(CAFE/LUNCH/DINNER/SNACK),위치메모,테마색상,메뉴아이콘,메뉴명,단가,메뉴분류\n' +
      'PLUS CAFE 45F,스타벅스WPS,CAFE,본관 45층 임직원 전용,#006241,☕,아메리카노,3500,대표메뉴\n' +
      '싸다김밥 여의도점,싸다김밥,LUNCH,여의도역 3번출구 앞,#D97706,🍙,싸다김밥,4500,대표메뉴';
    downloadCSV('store_menu_sample.csv', sample);
  };

  const handleDownloadRouletteSample = () => {
    const sample = '프리셋제목,카테고리(LUNCH/DUTY/PENALTY/COFFEE/CUSTOM),아이콘,항목명,항목아이콘,가중치(1~100)\n' +
      '오늘 점심 메뉴 뭐 먹지?,LUNCH,🍱,김치찌개/제육볶음,🍲,10\n' +
      '오늘 점심 메뉴 뭐 먹지?,LUNCH,🍱,돈까스/일식 라멘,🍛,10\n' +
      '오늘 점심 메뉴 뭐 먹지?,LUNCH,🍱,짜장면/짬뽕 (중식),🍜,10';
    downloadCSV('roulette_preset_sample.csv', sample);
  };

  const handleDownloadLadderSample = () => {
    const sample = '프리셋제목,카테고리(COFFEE/LUNCH/DUTY),참가자수,당첨자수,연계매장명,역할라벨,역할유형(PAY/PICKUP/CLEAN/PASS),배지텍스트\n' +
      '커피 쏘기 & 픽업 내기 (5인),COFFEE,5,1,PLUS CAFE,오늘 커피 결제,PAY,당첨\n' +
      '커피 쏘기 & 픽업 내기 (5인),COFFEE,5,1,PLUS CAFE,커피 픽업 심부름,PICKUP,심부름\n' +
      '커피 쏘기 & 픽업 내기 (5인),COFFEE,5,1,PLUS CAFE,축 통과,PASS,면제';
    downloadCSV('ladder_preset_sample.csv', sample);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV 파일에 유효한 데이터 행이 없습니다.');
        return;
      }
      const header = lines[0];
      if (header.includes('매장명') || header.includes('메뉴명')) {
        showToast(`'${file.name}' 매장/메뉴 엑셀(CSV) ${lines.length - 1}건이 성공적으로 파싱되어 시스템에 반영되었습니다.`);
      } else if (header.includes('룰렛') || header.includes('가중치')) {
        showToast(`'${file.name}' 룰렛 프리셋 엑셀(CSV) ${lines.length - 1}건이 성공적으로 파싱되어 시스템에 반영되었습니다.`);
      } else if (header.includes('사다리') || header.includes('참가자수')) {
        showToast(`'${file.name}' 사다리 게임 프리셋 엑셀(CSV) ${lines.length - 1}건이 성공적으로 파싱되어 시스템에 반영되었습니다.`);
      } else {
        showToast(`'${file.name}' 엑셀(CSV) ${lines.length - 1}개 행이 파싱되어 정상 반영되었습니다.`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* -------------------------------------------------------------------------
     5. 게임 콘텐츠 풀: 매장 CRUD & 메뉴 CRUD (아이콘, 메뉴명, 금액)
     ------------------------------------------------------------------------- */
  const handleOpenStoreModal = (store?: StorePreset) => {
    if (store) {
      setEditingStore(store);
      setStoreFormName(store.name);
      setStoreFormBrand(store.partnerBrand || '');
      setStoreFormCategory(store.category as any);
      setStoreFormLocation(store.locationMemo || '');
      setStoreFormThemeColor(store.themeColor || '#006241');
    } else {
      setEditingStore(null);
      setStoreFormName('');
      setStoreFormBrand('');
      setStoreFormCategory('CAFE');
      setStoreFormLocation('');
      setStoreFormThemeColor('#006241');
    }
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = () => {
    if (!storeFormName.trim()) {
      alert('매장명을 입력해 주세요.');
      return;
    }
    let updated: StorePreset[];
    if (editingStore) {
      updated = systemStores.map((s) =>
        s.id === editingStore.id
          ? {
              ...s,
              name: storeFormName.trim(),
              partnerBrand: storeFormBrand.trim() || undefined,
              category: storeFormCategory,
              locationMemo: storeFormLocation.trim(),
              themeColor: storeFormThemeColor,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : s
      );
    } else {
      const newStore: StorePreset = {
        id: `sys_store_${Date.now().toString().slice(-6)}`,
        name: storeFormName.trim(),
        partnerBrand: storeFormBrand.trim() || undefined,
        category: storeFormCategory,
        categoryLabel: storeFormCategory === 'CAFE' ? '카페/디저트' : '식당/일반식',
        locationMemo: storeFormLocation.trim() || '신규 등록 매장',
        themeColor: storeFormThemeColor,
        menuCategories: ['대표메뉴'],
        menus: [],
        isPresetDefault: false,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      updated = [...systemStores, newStore];
      setSelectedStoreId(newStore.id);
    }
    setSystemStores(updated);
    saveSystemStorePool(updated);
    setIsStoreModalOpen(false);
    showToast(editingStore ? '매장 정보가 수정되었습니다.' : '새 매장이 등록되었습니다.');
  };

  const handleDeleteStore = (storeId: string) => {
    if (systemStores.length <= 1) {
      alert('최소 1개 이상의 매장이 유지되어야 합니다.');
      return;
    }
    if (!confirm('해당 매장과 소속 메뉴들을 모두 삭제하시겠습니까?')) return;
    const updated = systemStores.filter((s) => s.id !== storeId);
    setSystemStores(updated);
    saveSystemStorePool(updated);
    setSelectedStoreId(updated[0].id);
    showToast('매장이 삭제되었습니다.');
  };

  // 6.a 매장 메뉴 추가/수정 모달 (아이콘 3종 모드)
  const handleOpenMenuEditModal = (item?: StoreMenuItem) => {
    if (item) {
      setEditingStoreMenuItem(item);
      setItemFormName(item.name);
      setItemFormPrice(item.price);
      setItemFormCategory(item.categoryName || '대표메뉴');
      setItemFormDesc(item.description || '');
      setItemFormIcon(item.iconName || '☕');
      setItemFormImageUrl(item.imageUrl || '');
      setItemFormUrlInput(item.imageUrl || '');
      setItemIconMode(item.imageUrl ? 'URL' : 'EMOJI');
    } else {
      setEditingStoreMenuItem(null);
      setItemFormName('');
      setItemFormPrice(4500);
      setItemFormCategory('대표메뉴');
      setItemFormDesc('');
      setItemFormIcon('☕');
      setItemFormImageUrl('');
      setItemFormUrlInput('');
      setItemIconMode('EMOJI');
    }
    setIsMenuEditModalOpen(true);
  };

  const handleMenuImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setItemFormImageUrl(result);
      setItemIconMode('UPLOAD');
      showToast(`'${file.name}' 이미지가 업로드되어 메뉴 아이콘으로 지정되었습니다.`);
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterUrlAsIcon = () => {
    if (!itemFormUrlInput.trim()) {
      alert('이미지 URL을 입력해주세요.');
      return;
    }
    setItemFormImageUrl(itemFormUrlInput.trim());
    setItemIconMode('URL');
    showToast('입력하신 이미지 URL이 메뉴 아이콘으로 등록되었습니다.');
  };

  const handleSaveStoreMenuItem = () => {
    if (!itemFormName.trim() || itemFormPrice <= 0) {
      alert('메뉴명과 올바른 금액을 입력해 주세요.');
      return;
    }
    const updated = systemStores.map((store) => {
      if (store.id === selectedStoreId) {
        let nextMenus: StoreMenuItem[];
        const resolvedIcon = itemIconMode === 'EMOJI' ? itemFormIcon : (itemFormImageUrl ? '🖼️' : itemFormIcon);
        const resolvedImg = itemIconMode !== 'EMOJI' && itemFormImageUrl ? itemFormImageUrl : undefined;

        if (editingStoreMenuItem) {
          nextMenus = store.menus.map((m) =>
            m.id === editingStoreMenuItem.id
              ? {
                  ...m,
                  name: itemFormName.trim(),
                  price: itemFormPrice,
                  categoryName: itemFormCategory.trim(),
                  description: itemFormDesc.trim() || undefined,
                  iconName: resolvedIcon,
                  imageUrl: resolvedImg,
                }
              : m
          );
        } else {
          const newItem: StoreMenuItem = {
            id: `menu_${Date.now().toString().slice(-6)}`,
            name: itemFormName.trim(),
            price: itemFormPrice,
            categoryName: itemFormCategory.trim(),
            description: itemFormDesc.trim() || undefined,
            iconName: resolvedIcon,
            imageUrl: resolvedImg,
            isSignature: false,
          };
          nextMenus = [...store.menus, newItem];
        }
        return { ...store, menus: nextMenus };
      }
      return store;
    });
    setSystemStores(updated);
    saveSystemStorePool(updated);
    setIsMenuEditModalOpen(false);
    showToast(editingStoreMenuItem ? '메뉴가 수정되었습니다.' : '새 메뉴가 추가되었습니다.');
  };

  const handleDeleteStoreMenuItem = (menuItemId: string) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;
    const updated = systemStores.map((store) => {
      if (store.id === selectedStoreId) {
        return {
          ...store,
          menus: store.menus.filter((m) => m.id !== menuItemId),
        };
      }
      return store;
    });
    setSystemStores(updated);
    saveSystemStorePool(updated);
    showToast('메뉴가 삭제되었습니다.');
  };

  // 6.b 사다리 프리셋 CRUD
  const handleOpenLadderPresetModal = (preset?: LadderGoalPreset) => {
    if (preset) {
      setEditingLadderPreset(preset);
      setLadderFormTitle(preset.title);
      setLadderFormCategory(preset.category);
      setLadderFormDescription(preset.description);
      setLadderFormPlayerCount(preset.playerCount || 5);
      setLadderFormWinnerCount(preset.winnerCount || 1);
      setLadderFormStoreId(preset.storeId || '');
    } else {
      setEditingLadderPreset(null);
      setLadderFormTitle('');
      setLadderFormCategory('COFFEE');
      setLadderFormDescription('');
      setLadderFormPlayerCount(5);
      setLadderFormWinnerCount(1);
      setLadderFormStoreId(systemStores[0]?.id || '');
    }
    setIsLadderPresetModalOpen(true);
  };

  const handleSaveLadderPreset = () => {
    if (!ladderFormTitle.trim()) {
      alert('사다리 프리셋 제목을 입력해주세요.');
      return;
    }
    const targetStore = systemStores.find((s) => s.id === ladderFormStoreId);
    let updated: LadderGoalPreset[];
    if (editingLadderPreset) {
      updated = ladderPresets.map((p) =>
        p.id === editingLadderPreset.id
          ? {
              ...p,
              title: ladderFormTitle.trim(),
              category: ladderFormCategory,
              description: ladderFormDescription.trim(),
              playerCount: ladderFormPlayerCount,
              winnerCount: ladderFormWinnerCount,
              storeId: ladderFormStoreId || undefined,
              storeName: targetStore?.name,
            }
          : p
      );
    } else {
      const newPreset: LadderGoalPreset = {
        id: `ladder_preset_${Date.now().toString().slice(-6)}`,
        title: ladderFormTitle.trim(),
        category: ladderFormCategory,
        description: ladderFormDescription.trim(),
        playerCount: ladderFormPlayerCount,
        winnerCount: ladderFormWinnerCount,
        storeId: ladderFormStoreId || undefined,
        storeName: targetStore?.name,
        roles: Array.from({ length: ladderFormPlayerCount }).map((_, idx) => ({
          label: idx < ladderFormWinnerCount ? '💳 결제 당첨' : '🎉 통과',
          type: idx < ladderFormWinnerCount ? 'PAY' : 'PASS',
          color: idx < ladderFormWinnerCount ? 'rose' : 'emerald',
          badgeText: idx < ladderFormWinnerCount ? '당첨' : '면제',
        })),
      };
      updated = [...ladderPresets, newPreset];
      setSelectedLadderPresetId(newPreset.id);
    }
    setLadderPresets(updated);
    saveSystemLadderPresets(updated);
    setIsLadderPresetModalOpen(false);
    showToast(editingLadderPreset ? '사다리 프리셋이 수정되었습니다.' : '새 사다리 프리셋이 등록되었습니다.');
  };

  const handleDeleteLadderPreset = (presetId: string) => {
    if (ladderPresets.length <= 1) {
      alert('최소 1개 이상의 사다리 프리셋이 유지되어야 합니다.');
      return;
    }
    if (!confirm('해당 사다리 프리셋을 삭제하시겠습니까?')) return;
    const updated = ladderPresets.filter((p) => p.id !== presetId);
    setLadderPresets(updated);
    saveSystemLadderPresets(updated);
    setSelectedLadderPresetId(updated[0].id);
    showToast('사다리 프리셋이 삭제되었습니다.');
  };

  // 6.c 룰렛 프리셋 CRUD
  const handleOpenRoulettePresetModal = (preset?: RoulettePreset) => {
    if (preset) {
      setEditingRoulettePreset(preset);
      setRouletteFormTitle(preset.title);
      setRouletteFormCategory(preset.category);
      setRouletteFormDescription(preset.description);
      setRouletteFormIcon(preset.icon || '🍱');
      setRouletteFormItems([...preset.items]);
    } else {
      setEditingRoulettePreset(null);
      setRouletteFormTitle('');
      setRouletteFormCategory('LUNCH');
      setRouletteFormDescription('');
      setRouletteFormIcon('🍱');
      setRouletteFormItems([
        { id: `item_${Date.now()}_1`, name: '새 메뉴 항목 1', icon: '🍲', weight: 10 },
        { id: `item_${Date.now()}_2`, name: '새 메뉴 항목 2', icon: '🍛', weight: 10 },
      ]);
    }
    setIsRoulettePresetModalOpen(true);
  };

  const handleSaveRoulettePreset = () => {
    if (!rouletteFormTitle.trim() || rouletteFormItems.length === 0) {
      alert('프리셋 제목과 최소 1개 이상의 항목을 입력해주세요.');
      return;
    }
    let updated: RoulettePreset[];
    if (editingRoulettePreset) {
      updated = roulettePresets.map((p) =>
        p.id === editingRoulettePreset.id
          ? {
              ...p,
              title: rouletteFormTitle.trim(),
              category: rouletteFormCategory,
              description: rouletteFormDescription.trim(),
              icon: rouletteFormIcon || '🍱',
              items: rouletteFormItems,
            }
          : p
      );
    } else {
      const newPreset: RoulettePreset = {
        id: `roulette_preset_${Date.now().toString().slice(-6)}`,
        title: rouletteFormTitle.trim(),
        category: rouletteFormCategory,
        description: rouletteFormDescription.trim(),
        icon: rouletteFormIcon || '🍱',
        items: rouletteFormItems,
      };
      updated = [...roulettePresets, newPreset];
      setSelectedPresetId(newPreset.id);
    }
    setRoulettePresets(updated);
    saveSystemRoulettePresets(updated);
    setIsRoulettePresetModalOpen(false);
    showToast(editingRoulettePreset ? '룰렛 프리셋이 수정되었습니다.' : '새 룰렛 프리셋이 등록되었습니다.');
  };

  const handleDeleteRoulettePreset = (presetId: string) => {
    if (roulettePresets.length <= 1) {
      alert('최소 1개 이상의 룰렛 프리셋이 유지되어야 합니다.');
      return;
    }
    if (!confirm('해당 룰렛 프리셋을 삭제하시겠습니까?')) return;
    const updated = roulettePresets.filter((p) => p.id !== presetId);
    setRoulettePresets(updated);
    saveSystemRoulettePresets(updated);
    setSelectedPresetId(updated[0].id);
    showToast('룰렛 프리셋이 삭제되었습니다.');
  };

  /* -------------------------------------------------------------------------
     6. 긴급 공지 CRUD 및 모드/버튼타겟 핸들러
     ------------------------------------------------------------------------- */
  const handleOpenNoticeModal = (notice?: SystemNoticeItem) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeFormTitle(notice.title);
      setNoticeFormMode(notice.mode);
      setNoticeFormContent(notice.content);
      setNoticeFormImageUrl(notice.imageUrl || '');
      setNoticeFormHasButton(notice.hasButton);
      setNoticeFormButtonText(notice.buttonText || '자세히 보기');
      setNoticeFormTargetType(notice.buttonTargetType || 'INTERNAL_SCREEN');
      setNoticeFormButtonUrl(notice.buttonUrl || 'SCR-DSH-01');
      setNoticeFormEnabled(notice.isEnabled);
    } else {
      setEditingNotice(null);
      setNoticeFormTitle('');
      setNoticeFormMode('TEXT');
      setNoticeFormContent('');
      setNoticeFormImageUrl('');
      setNoticeFormHasButton(true);
      setNoticeFormButtonText('자세히 보기');
      setNoticeFormTargetType('INTERNAL_SCREEN');
      setNoticeFormButtonUrl('SCR-DSH-01');
      setNoticeFormEnabled(true);
    }
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = () => {
    if (!noticeFormTitle.trim() || !noticeFormContent.trim()) {
      alert('공지 제목과 내용을 입력해 주세요.');
      return;
    }
    let updated: SystemNoticeItem[];
    if (editingNotice) {
      updated = notices.map((n) =>
        n.id === editingNotice.id
          ? {
              ...n,
              title: noticeFormTitle.trim(),
              mode: noticeFormMode,
              content: noticeFormContent,
              imageUrl: noticeFormImageUrl.trim() || undefined,
              hasButton: noticeFormHasButton,
              buttonText: noticeFormButtonText.trim(),
              buttonTargetType: noticeFormTargetType,
              buttonUrl: noticeFormButtonUrl.trim(),
              isEnabled: noticeFormEnabled,
            }
          : n
      );
    } else {
      const newNotice: SystemNoticeItem = {
        id: `notice-${Date.now().toString().slice(-4)}`,
        title: noticeFormTitle.trim(),
        mode: noticeFormMode,
        content: noticeFormContent,
        imageUrl: noticeFormImageUrl.trim() || undefined,
        hasButton: noticeFormHasButton,
        buttonText: noticeFormButtonText.trim(),
        buttonTargetType: noticeFormTargetType,
        buttonUrl: noticeFormButtonUrl.trim(),
        isEnabled: noticeFormEnabled,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      updated = [newNotice, ...notices];
    }
    setNotices(updated);
    saveSystemNotices(updated);
    setIsNoticeModalOpen(false);
    showToast(editingNotice ? '공지가 수정되었습니다.' : '새 공지가 등록되었습니다.');
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (!confirm('해당 공지를 삭제하시겠습니까?')) return;
    const updated = notices.filter((n) => n.id !== noticeId);
    setNotices(updated);
    saveSystemNotices(updated);
    showToast('공지가 삭제되었습니다.');
  };

  const handleToggleNoticeEnable = (noticeId: string) => {
    const updated = notices.map((n) =>
      n.id === noticeId ? { ...n, isEnabled: !n.isEnabled } : n
    );
    setNotices(updated);
    saveSystemNotices(updated);
    showToast('공지 게시 상태가 변경되었습니다.');
  };

  const handleResetAll = () => {
    if (!confirm('경고: 모든 시스템 거버넌스 설정을 공장초기 기본값으로 복원하시겠습니까?')) {
      return;
    }
    resetAllSystemGovernance();
    setAuthSec(loadAuthSecurityConfig());
    setNotifyMatrix(loadNotificationMatrix());
    setFinanceComp(loadFinancialCompliance());
    setMenus(loadManagedMenus());
    setScreens(loadManagedScreens());
    setRoles(loadManagedRoles());
    setUsers(loadManagedUsers());
    setTerms(loadManagedTerms());
    setDetailCodes(loadMasterDetailCodes());
    setSystemStores(loadSystemStorePool());
    setRoulettePresets(loadSystemRoulettePresets());
    setNotices(loadSystemNotices());
    showToast('전체 시스템 거버넌스가 기본값으로 초기화되었습니다.');
  };

  const curGroup = MASTER_GROUP_CODES.find((g) => g.groupCode === selectedGroupCode) || MASTER_GROUP_CODES[0];
  const curDetailCodes = detailCodes
    .filter((c) => c.groupCode === selectedGroupCode)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const filteredGroups = codeFilterCategory === 'ALL'
    ? MASTER_GROUP_CODES
    : MASTER_GROUP_CODES.filter((g) => g.category === codeFilterCategory);

  const filteredTerms = selectedTermCategory === 'ALL'
    ? terms
    : terms.filter((t) => t.type === selectedTermCategory);

  const curTerm = terms.find((t) => t.id === selectedTermId) || terms[0];
  const curStore = systemStores.find((s) => s.id === selectedStoreId) || systemStores[0];
  const curPreset = roulettePresets.find((p) => p.id === selectedPresetId) || roulettePresets[0];

  // 6.1 RBAC 필터링 계산 (메뉴 / 화면 / 사용자)
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

  // 7. 마스터코드 동적 컬럼 표출 및 스크롤 높이 계산
  const hasPriority = curDetailCodes.some((c) => c.priority !== undefined);
  const hasUserField1 = curDetailCodes.some((c) => !!c.userField1);
  const hasUserField2 = curDetailCodes.some((c) => !!c.userField2);
  const hasUserField3 = curDetailCodes.some((c) => !!c.userField3);
  const groupScrollHeightClass =
    groupScrollCount === 3
      ? 'max-h-[160px]'
      : groupScrollCount === 5
      ? 'max-h-[250px]'
      : groupScrollCount === 10
      ? 'max-h-[460px]'
      : 'max-h-[850px]';

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header with 360px 2-line layout standard */}
      <section className="border-b border-slate-200 dark:border-zinc-800 pb-3">
        <ElmTyp01
          title="시스템 운영관리 백오피스"
          badge="SCR-SYS-01"
          subtitle="플랫폼 8대 거버넌스 • 보안/인증 • 12종 알림 매트릭스 • RBAC/약관 • 금융통제 • 20대 마스터코드 • 게임풀 • 인프라 관제"
          actions={
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                title="인프라 상태 실시간 새로고침"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">새로고침</span>
              </button>

              <span className="text-[10px] px-2 py-1 rounded-lg font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>운영 정상</span>
              </span>
            </div>
          }
        />
      </section>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="fixed top-16 right-4 z-50 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. 8대 거버넌스 네비게이션 서류철 탭 (ElmSld03 Slider) */}
      <section className="w-full min-w-0">
        <ElmSld03 showNavButtons={false} className="w-full">
          <div className="flex items-center min-w-max border-b border-slate-200 dark:border-zinc-800">
            {[
              { id: 'INFRA', label: '인프라 관제', icon: <Server className="w-3.5 h-3.5" /> },
              { id: 'AUTH_SEC', label: '로그인/보안', icon: <Lock className="w-3.5 h-3.5" /> },
              { id: 'NOTIFY', label: '알림 매트릭스', icon: <Bell className="w-3.5 h-3.5" /> },
              { id: 'RBAC_LEGAL', label: '시스템관리', icon: <Users className="w-3.5 h-3.5" /> },
              { id: 'FINANCE', label: '금융 통제', icon: <Coins className="w-3.5 h-3.5" /> },
              { id: 'MASTER_CODE', label: '마스터 코드', icon: <Code2 className="w-3.5 h-3.5" /> },
              { id: 'GAME_POOL', label: '게임 콘텐츠 풀', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
              { id: 'NOTICE', label: '공지', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as SystemTabId)}
                  className={`min-h-[44px] px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t" />
                  )}
                </button>
              );
            })}
          </div>
        </ElmSld03>
      </section>

      {/* 3. 8대 탭 컨텐츠 영역 (Flat Peer Sections) */}

      {/* Tab 1: 인프라 상세 관제 */}
      {activeTab === 'INFRA' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-sky-500" />
                  <span>PostgreSQL 풀</span>
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  HEALTHY
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">7 / 20</span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">35.0% 사용</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: '35%' }} />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">대기 큐: 0건 • 최대 20개 커넥션</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <span>Cloudflare 터널</span>
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  CONNECTED
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">42 ms</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">안정적</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '22%' }} />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">524 방어 폴링 큐 정상 작동</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span>홈서버 RAM (2GB 상한)</span>
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  BUFFER OK
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">1,280 MB</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">62.5%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: '62.5%' }} />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">OOM 격리 안전 버퍼 768 MB 확보</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>EasyOCR 워커 큐</span>
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  IDLE
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">0 건 대기</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">평균 1.8s</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '5%' }} />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">오늘 완료: 48건 • OOM 재시도: 0건</p>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: 로그인 및 보안 설정 */}
      {activeTab === 'AUTH_SEC' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>로그인 인증 방식 및 보안 정책 거버넌스</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                OAuth 3사 간편로그인, 2단계 인증(2FA), 이메일 인증 강제 여부를 통제합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAuthSec}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>보안 설정 저장</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-3">
              <ElmSwt01
                checked={authSec.enableSocialLogin}
                onChange={(checked) => setAuthSec((prev) => ({ ...prev, enableSocialLogin: checked }))}
                label="간편로그인(OAuth) 전역 허용"
                description="비활성화 시 일반 아이디/비밀번호 인증 모드로 강제 전환됩니다."
              />

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                  개별 간편로그인 공급자 허용 대상
                </span>
                <div className="space-y-1.5">
                  <div
                    onClick={() => {
                      if (!authSec.enableSocialLogin) return;
                      setAuthSec((prev) => ({
                        ...prev,
                        providers: { ...prev.providers, kakao: !prev.providers.kakao },
                      }));
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      !authSec.enableSocialLogin
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                        : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    <span className="text-xs font-semibold flex items-center gap-2 select-none">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                      <span>카카오 간편로그인 (Kakao OAuth)</span>
                    </span>
                    <ElmChk01
                      checked={authSec.providers.kakao}
                      disabled={!authSec.enableSocialLogin}
                      onChange={(chk) =>
                        setAuthSec((prev) => ({
                          ...prev,
                          providers: { ...prev.providers, kakao: chk },
                        }))
                      }
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => {
                      if (!authSec.enableSocialLogin) return;
                      setAuthSec((prev) => ({
                        ...prev,
                        providers: { ...prev.providers, naver: !prev.providers.naver },
                      }));
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      !authSec.enableSocialLogin
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                        : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    <span className="text-xs font-semibold flex items-center gap-2 select-none">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <span>네이버 간편로그인 (Naver OAuth)</span>
                    </span>
                    <ElmChk01
                      checked={authSec.providers.naver}
                      disabled={!authSec.enableSocialLogin}
                      onChange={(chk) =>
                        setAuthSec((prev) => ({
                          ...prev,
                          providers: { ...prev.providers, naver: chk },
                        }))
                      }
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>

                  <div
                    onClick={() => {
                      if (!authSec.enableSocialLogin) return;
                      setAuthSec((prev) => ({
                        ...prev,
                        providers: { ...prev.providers, google: !prev.providers.google },
                      }));
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      !authSec.enableSocialLogin
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                        : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                    }`}
                  >
                    <span className="text-xs font-semibold flex items-center gap-2 select-none">
                      <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
                      <span>구글 간편로그인 (Google OAuth)</span>
                    </span>
                    <ElmChk01
                      checked={authSec.providers.google}
                      disabled={!authSec.enableSocialLogin}
                      onChange={(chk) =>
                        setAuthSec((prev) => ({
                          ...prev,
                          providers: { ...prev.providers, google: chk },
                        }))
                      }
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-4">
              <ElmSwt01
                checked={authSec.enable2FA}
                onChange={(checked) => setAuthSec((prev) => ({ ...prev, enable2FA: checked }))}
                label="로그인 2단계 인증(2FA) 적용"
                description="로그인 시 인증 앱(TOTP) 또는 등록된 이메일 OTP를 필수로 요구합니다."
              />

              <ElmSwt01
                checked={authSec.requireEmailVerification}
                onChange={(checked) =>
                  setAuthSec((prev) => ({ ...prev, requireEmailVerification: checked }))
                }
                label="이메일 인증 필수 여부 설정"
                description="이메일 인증이 완료되지 않은 계정은 가계부 생성 및 정산 기능이 제한됩니다."
              />
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          Tab 3: 알림 매트릭스 (요청 1번: 12종 전수 복원 & 인증메일 한정 설정)
          ========================================================================= */}
      {activeTab === 'NOTIFY' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>서비스 전역 알림 발송 매트릭스 정책 (12종 알림 토글)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                인증 메일 한정 발송 옵션 및 가계부, 모아당번, 모아목표, 모아머니 12종 알림을 제어합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveNotifyMatrix}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>알림 정책 저장</span>
            </button>
          </div>

          {/* 인증된 메일 한정 옵션 */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
            <ElmSwt01
              checked={notifyMatrix.requireVerifiedEmailOnly}
              onChange={(checked) =>
                setNotifyMatrix((prev) => ({ ...prev, requireVerifiedEmailOnly: checked }))
              }
              label="인증된 이메일에만 알림 발송 제한"
              description="활성화 시 메일 주소 소유권이 검증된 회원에게만 웹 푸시 및 이메일 노티를 전송합니다."
            />
          </div>

          {/* 12종 서비스 알림 토글 매트릭스 */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
              서비스 전역 12종 알림 매트릭스 목록
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. 가계부 영역 (2종) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>가계부 알림 (2종)</span>
                </span>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, ledgerMemberRegistered: !prev.ledgerMemberRegistered }))}
                    className="py-2 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-indigo-600 transition-colors">가계부 구성원 등록 알림</div>
                      <div className="text-[10px] text-slate-400">모임 장부에 신규 멤버 합류 시 발송</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.ledgerMemberRegistered}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, ledgerMemberRegistered: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, ledgerRecurringExpense: !prev.ledgerRecurringExpense }))}
                    className="py-2 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-indigo-600 transition-colors">정기지출 예정 도래 알림</div>
                      <div className="text-[10px] text-slate-400">고정비/월세 결제 3일 전 리마인더</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.ledgerRecurringExpense}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, ledgerRecurringExpense: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. 모아당번 영역 (4종) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>모아당번 알림 (4종)</span>
                </span>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyWatchEvent: !prev.dutyWatchEvent }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">관람당번 이벤트 알림</div>
                      <div className="text-[10px] text-slate-400">당번 교체 및 중요 이벤트 안내</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.dutyWatchEvent}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyWatchEvent: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyScheduleReminder: !prev.dutyScheduleReminder }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">담당 당번일정 도래 알림</div>
                      <div className="text-[10px] text-slate-400">본인 담당 당번 수행 당일 알림</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.dutyScheduleReminder}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyScheduleReminder: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyActionRequest: !prev.dutyActionRequest }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">당번 수행 요청 알림</div>
                      <div className="text-[10px] text-slate-400">동료의 당번 대리 수행 요청 시 발송</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.dutyActionRequest}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyActionRequest: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyInviteAccepted: !prev.dutyInviteAccepted }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">당번 초대요청/수용 알림</div>
                      <div className="text-[10px] text-slate-400">새 모임 당번 롤에 참여 확정 시 발송</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.dutyInviteAccepted}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyInviteAccepted: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. 모아목표 영역 (4종) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>모아목표 알림 (4종)</span>
                </span>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalWatchEvent: !prev.goalWatchEvent }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">관람목표 이벤트 알림</div>
                      <div className="text-[10px] text-slate-400">목표 달성 및 주요 마일스톤 안내</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.goalWatchEvent}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalWatchEvent: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalScheduleReminder: !prev.goalScheduleReminder }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">목표 수행일정 도래 알림</div>
                      <div className="text-[10px] text-slate-400">목표 실천 체크 시간 리마인더</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.goalScheduleReminder}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalScheduleReminder: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalCheerMessage: !prev.goalCheerMessage }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">목표 수행응원 도착 알림</div>
                      <div className="text-[10px] text-slate-400">친구의 응원 메시지 및 격려 수신 시</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.goalCheerMessage}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalCheerMessage: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalInviteAccepted: !prev.goalInviteAccepted }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">목표 초대요청/수용 알림</div>
                      <div className="text-[10px] text-slate-400">챌린지 초대 및 팀원 수용 시 발송</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.goalInviteAccepted}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalInviteAccepted: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. 모아머니 영역 (3종) */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>모아머니 알림 (3종)</span>
                </span>
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, moneySettleProcessed: !prev.moneySettleProcessed }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">정산요청/승인 알림 (정산결과처리)</div>
                      <div className="text-[10px] text-slate-400">정산 결과 확정 및 입금 요청</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.moneySettleProcessed}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, moneySettleProcessed: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, moneySupportProcessed: !prev.moneySupportProcessed }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">지원요청/승인 알림 (용돈지원/가불)</div>
                      <div className="text-[10px] text-slate-400">용돈 지원 및 긴급 가불 처리 결과</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.moneySupportProcessed}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, moneySupportProcessed: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                  <div
                    onClick={() => setNotifyMatrix((prev) => ({ ...prev, moneyRewardProcessed: !prev.moneyRewardProcessed }))}
                    className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div>
                      <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">보상요청/승인 알림 (당번수행대가)</div>
                      <div className="text-[10px] text-slate-400">당번 수행 완료 대가 머니 지급 완료 시</div>
                    </div>
                    <ElmChk01
                      checked={notifyMatrix.moneyRewardProcessed}
                      onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, moneyRewardProcessed: chk }))}
                      className="min-h-0 py-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          Tab 4: RBAC 시스템 관리 및 약관 거버넌스
          ========================================================================= */}
      {activeTab === 'RBAC_LEGAL' && (
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
              { id: 'TERMS', label: '1. 약관 관리' },
              { id: 'MENUS', label: '2. 메뉴 관리' },
              { id: 'SCREENS', label: '3. 화면 관리' },
              { id: 'ROLES', label: '4. 권한그룹' },
              { id: 'PERMISSIONS', label: '5. 권한 매핑' },
              { id: 'USERS', label: '6. 사용자 관리' },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setRbacSubTab(sub.id as any)}
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

          {/* 1. 약관 관리 (요청 2번: 약관 카드에 사용설정 라디오버튼 체크) */}
          {rbacSubTab === 'TERMS' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {(['ALL', 'SERVICE', 'PRIVACY', 'MARKETING'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedTermCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedTermCategory === cat
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {cat === 'ALL'
                        ? '전체 약관'
                        : cat === 'SERVICE'
                        ? '서비스이용약관'
                        : cat === 'PRIVACY'
                        ? '개인정보수집'
                        : '이벤트알림'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewTermModal}
                  className="min-h-[34px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>약관 등록</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* 좌측: 약관 목록 (약관카드 사용설정은 제거, 카드 기본정보 및 삭제) */}
                <div className="md:col-span-4 space-y-1.5 max-h-[520px] overflow-y-auto">
                  {filteredTerms.map((t) => {
                    const isSel = selectedTermId === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTermId(t.id);
                          setIsEditingTerm(false);
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                          isSel
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                            {t.typeLabel}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{t.version}</span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">{t.title}</div>

                        {/* 약관카드 하단: 시행일, 이력 건수 및 삭제 버튼 (카드 사용설정 제거) */}
                        <div
                          className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[10px]">시행일 {t.effectiveDate} • 이력 {t.history?.length || 1}건</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTerm(t.id)}
                            className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                            title="약관 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 우측: 약관 상세 뷰어 및 Markdown 수정기 (하단 저장이력 연동) */}
                {(() => {
                  const activeDisplayHistory =
                    curTerm.history?.find((h) => h.id === selectedHistoryId) || curTerm.history?.[0];
                  const displayMarkdown = activeDisplayHistory?.contentMarkdown || curTerm.contentMarkdown;
                  const displayVersion = activeDisplayHistory?.version || curTerm.version;
                  const displayDate = activeDisplayHistory?.effectiveDate || curTerm.effectiveDate;

                  return (
                    <div className="md:col-span-8 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                            <span>{curTerm.title}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                              {isEditingTerm ? termEditVersion : displayVersion}
                            </span>
                            {activeDisplayHistory?.isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                                대표 적용중
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {curTerm.typeLabel} • 시행일: {displayDate} • 총 개정 이력: {curTerm.history?.length || 1}건
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isEditingTerm ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setIsEditingTerm(false)}
                                className="px-2.5 py-1 rounded-lg border text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800"
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                onClick={handleUpdateCurrentTerm}
                                className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
                              >
                                <Save className="w-3 h-3" />
                                <span>저장</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const initialMd = activeDisplayHistory?.contentMarkdown || curTerm.contentMarkdown;
                                const initialVer = activeDisplayHistory?.version || curTerm.version;
                                setTermEditMarkdown(initialMd);
                                setTermEditVersion(initialVer);
                                setBaseVersionForEdit(initialVer);
                                setTermEditSummary('');
                                setIsEditingTerm(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>수정</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 약관 본문 영역 (수정: ElmMkd01 에디터 & 미리보기 토큰 / 조회: ElmMkd01 readOnly 토큰) */}
                      {isEditingTerm ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500">개정 버전</label>
                                <span className="text-[10px] text-indigo-500 font-mono">
                                  미수정 저장 시 ➔ {calculateNextSubVersion(baseVersionForEdit || curTerm.version)}
                                </span>
                              </div>
                              <input
                                type="text"
                                value={termEditVersion}
                                onChange={(e) => setTermEditVersion(e.target.value)}
                                placeholder="예: v2.2 (미입력 시 서브버전 자동 증가)"
                                className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] font-mono text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">개정 요약</label>
                              <input
                                type="text"
                                value={termEditSummary}
                                onChange={(e) => setTermEditSummary(e.target.value)}
                                placeholder="예: 혜택 안내 조항 문구 수정"
                                className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-xs"
                              />
                            </div>
                          </div>
                          <ElmMkd01
                            value={termEditMarkdown}
                            onChange={setTermEditMarkdown}
                            label="약관 본문 (Markdown 포맷)"
                            rows={7}
                            heightClass="min-h-[220px]"
                            defaultMode="split"
                          />
                        </div>
                      ) : (
                        <ElmMkd01
                          value={displayMarkdown}
                          readOnly={true}
                          label={`약관 본문 미리보기 (${displayVersion} 기준)`}
                          heightClass="max-h-[300px]"
                        />
                      )}

                      {/* 3.a & 3.b & 3.c: 약관 이력 체크박스 사용설정, 이력 선택 시 본문 표시, 최근이력 상단 */}
                      <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" />
                            <span>개정 저장이력 (최근 이력 순 / 클릭 시 본문 전환)</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            총 {curTerm.history?.length || 1}개 버전 • 체크 시 대표 적용
                          </span>
                        </div>

                        <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                          {(() => {
                            const hasExplicitCurrent = (curTerm.history || []).some((item) => item.isCurrent);
                            return (curTerm.history || []).map((h, idx) => {
                              // 하나가 선택되어 적용되면 다른 항목은 반드시 해제되는 단일 배타적 상태
                              const isCurrentActive = hasExplicitCurrent
                                ? !!h.isCurrent
                                : h.version === curTerm.version;
                              const isHistorySelected =
                                (selectedHistoryId ? h.id === selectedHistoryId : idx === 0);

                              return (
                              <div
                                key={h.id || `hist-${idx}`}
                                onClick={() => {
                                  setSelectedHistoryId(h.id);
                                  if (isEditingTerm) {
                                    setTermEditMarkdown(h.contentMarkdown || curTerm.contentMarkdown);
                                    setTermEditVersion(h.version);
                                    setBaseVersionForEdit(h.version);
                                  }
                                }}
                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all cursor-pointer ${
                                  isHistorySelected
                                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                                    : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 hover:border-slate-300'
                                }`}
                              >
                                <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                  {/* 3.a: 이력 사용설정 버튼 말고 체크박스를 앞에 표시 */}
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <ElmChk01
                                      checked={isCurrentActive}
                                      onChange={() => handleApplyHistoryVersion(h)}
                                      className="min-h-0 py-0 shrink-0"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-zinc-100">
                                        {h.version}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {h.effectiveDate}
                                      </span>
                                      {isCurrentActive && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                                          대표 적용중
                                        </span>
                                      )}
                                      {isHistorySelected && !isCurrentActive && (
                                        <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                                          현재 조회중
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                                      {h.summary}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteHistoryItem(h.id, h.version)}
                                    className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                    title="이력 삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 약관 등록 모달 */}
              {isTermModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
                  <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-sm font-bold">신규 약관 등록</h4>
                      <button onClick={() => setIsTermModalOpen(false)}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold block mb-1">약관 구분 (3대 분류)</label>
                        <select
                          value={termFormType}
                          onChange={(e) => setTermFormType(e.target.value as TermsCategoryType)}
                          className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                        >
                          <option value="SERVICE">1. 서비스이용약관</option>
                          <option value="PRIVACY">2. 개인정보수집및 이용동의</option>
                          <option value="MARKETING">3. 이벤트알림 및 라이프 혜택 정보수신동의</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold block mb-1">약관 제목</label>
                        <input
                          type="text"
                          value={termFormTitle}
                          onChange={(e) => setTermFormTitle(e.target.value)}
                          placeholder="예: 모아보고 서비스 이용약관 (신규)"
                          className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">초기 버전</label>
                        <input
                          type="text"
                          value={termFormVersion}
                          onChange={(e) => setTermFormVersion(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                        />
                      </div>
                      <div>
                      <ElmMkd01
                        value={termFormContent}
                        onChange={setTermFormContent}
                        label="약관 본문 (Markdown 포맷)"
                        rows={7}
                        heightClass="min-h-[200px]"
                        defaultMode="edit"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button onClick={() => setIsTermModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
                      <button onClick={handleSaveNewTerm} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">등록</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          )}

          {/* 2. 메뉴 관리 (요청 8: 보기모드 목록/카드, 필터 슬라이더 & 검색 입력필드) */}
          {rbacSubTab === 'MENUS' && (
            <div className="space-y-3">
              {/* 8.b.i 필터 슬라이더 & 검색 & 보기모드 토글 & 등록버튼 */}
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
                  {/* 검색창: 메뉴ID, 메뉴명, 화면경로 or 검색 */}
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

                  {/* 8.a 보기모드 전환: 목록 / 카드 */}
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

              {/* 목록 또는 카드 렌더링 */}
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
                      <button onClick={() => setIsMenuModalOpen(false)}><X className="w-4 h-4" /></button>
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
                      <button onClick={() => setIsMenuModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
                      <button onClick={handleSaveMenu} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">저장</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. 화면 관리 (요청 8: 보기모드 목록/카드, 필터 슬라이더 & 검색 입력필드) */}
          {rbacSubTab === 'SCREENS' && (
            <div className="space-y-3">
              {/* 8.b.ii 필터 슬라이더 & 검색 & 보기모드 토글 & 등록버튼 */}
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
                  {/* 검색창: 화면ID, 화면명, 라우트 or 검색 */}
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

                  {/* 8.a 보기모드 전환: 목록 / 카드 */}
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

              {/* 목록 또는 카드 렌더링 */}
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
                      <button onClick={() => setIsScreenModalOpen(false)}><X className="w-4 h-4" /></button>
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
                      <button onClick={() => setIsScreenModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
                      <button onClick={handleSaveScreen} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">저장</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. 권한그룹 관리 */}
          {rbacSubTab === 'ROLES' && (
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
                      <button onClick={() => setIsRoleModalOpen(false)}><X className="w-4 h-4" /></button>
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
                      <button onClick={() => setIsRoleModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
                      <button onClick={handleSaveRole} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">저장</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. 권한 매핑 관리 */}
          {rbacSubTab === 'PERMISSIONS' && (
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
          )}

          {/* 6. 사용자 관리 (요청 8: 보기모드 목록/카드, 필터 슬라이더 & 검색 입력필드) */}
          {rbacSubTab === 'USERS' && (
            <div className="space-y-3">
              {/* 8.b.iii 필터 슬라이더 & 검색 & 보기모드 토글 */}
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
                  {/* 검색창: 사용자ID, 회원명, 이메일 or 검색 */}
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

                  {/* 8.a 보기모드 전환: 목록 / 카드 */}
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

              {/* 목록 또는 카드 렌더링 */}
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

              {/* 6.a 사용자 상세 모달 (요청 4: 비밀번호 초기화 버튼 추가 & 계좌 마스킹) */}
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
                      <button onClick={() => setSelectedUserForDetail(null)}><X className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* 기본 환경 설정 */}
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

                      {/* 등록 계좌 정보 (민감정보 마스킹 보호) */}
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

                      {/* 알림 동의 상태 */}
                      <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs">알림 채널 및 혜택 수신 동의</div>
                          <div className="text-[10px] text-slate-400">
                            이메일인증: {selectedUserForDetail.personalSettings.notificationChannels.emailVerified ? '완료' : '미완료'} • 
                            푸시알림: {selectedUserForDetail.personalSettings.notificationChannels.pushAllowed ? '허용' : '차단'}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                          정상 연동
                        </span>
                      </div>
                    </div>

                    {/* 모달 하단 버튼 그룹 (요청 4: 비밀번호 초기화 버튼 추가) */}
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
          )}
        </section>
      )}

      {/* Tab 5: 금융 기능 통제 */}
      {activeTab === 'FINANCE' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-indigo-600" />
                <span>금융 기능 컴플라이언스 및 송금 통제</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                토스/카카오페이 딥링크 및 계좌 송금 URL 생성 허용 여부를 강력히 통제합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveFinanceComp}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>컴플라이언스 저장</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-3">
              <ElmSwt01
                checked={financeComp.enableRemitUrlGeneration}
                onChange={(checked) =>
                  setFinanceComp((prev) => ({ ...prev, enableRemitUrlGeneration: checked }))
                }
                label="송금 URL 생성 전역 허용"
                description="비활성화 시 플랫폼 내 모든 화면에서 토스/카카오페이 딥링크 생성이 즉각 차단됩니다."
              />

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                <ElmSwt01
                  checked={financeComp.allowGoalCheerRemit}
                  onChange={(checked) =>
                    setFinanceComp((prev) => ({ ...prev, allowGoalCheerRemit: checked }))
                  }
                  label="모아목표 수행응원 송금 허용"
                  description="목표 달성 응원 시 송금 URL 생성을 허용합니다."
                />

                <ElmSwt01
                  checked={financeComp.allowMoaMoneyRemit}
                  onChange={(checked) =>
                    setFinanceComp((prev) => ({ ...prev, allowMoaMoneyRemit: checked }))
                  }
                  label="모아머니(정산/지원/보상) 송금 허용"
                  description="정산 결과 및 용돈 지원 시 송금 URL 생성을 허용합니다."
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-3">
              <ElmSwt01
                checked={financeComp.blockForeignIpRemit}
                onChange={(checked) =>
                  setFinanceComp((prev) => ({ ...prev, blockForeignIpRemit: checked }))
                }
                label="해외 IP 송금 URL 생성 차단"
                description="Cloudflare IP 지리 정보를 기반으로 국내 외 IP의 송금 링크 생성을 방어합니다."
              />
            </div>
          </div>
        </section>
      )}

      {/* Tab 6: 20대 마스터 코드 관리 (요청 7: 그룹목록 높이, 패널 토글, 우선순위 및 사용자항목 1~3, 모달) */}
      {activeTab === 'MASTER_CODE' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>플랫폼 전역 20대 마스터 그룹코드 및 상세코드 풀</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                장부, 금융, 지출이동, 당번, 목표, 정산 6대 카테고리 20종 그룹코드를 관리합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGroupPanelOpen(!isGroupPanelOpen)}
                className="min-h-[34px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title={isGroupPanelOpen ? '그룹 패널 접기' : '그룹 패널 펼치기'}
              >
                {isGroupPanelOpen ? <PanelLeftClose className="w-3.5 h-3.5 text-indigo-600" /> : <PanelLeftOpen className="w-3.5 h-3.5 text-indigo-600" />}
                <span className="hidden sm:inline">{isGroupPanelOpen ? '그룹패널 접기' : '그룹패널 열기'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenCodeModal()}
                className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>상세코드 추가</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', '장부', '금융', '지출이동', '모아당번', '모아목표', '정산'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCodeFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    codeFilterCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {cat === 'ALL' ? '전체 그룹 (20종)' : cat}
                </button>
              ))}
            </div>

            {/* 7.a 그룹목록 스크롤높이 설정 (3건, 5건, 10건, 20건) */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-semibold">그룹 목록높이:</span>
              <select
                value={groupScrollCount}
                onChange={(e) => setGroupScrollCount(Number(e.target.value) as 3 | 5 | 10 | 20)}
                className="h-7 px-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-slate-800 dark:text-zinc-200"
              >
                <option value={3}>3건 표시</option>
                <option value={5}>5건 표시</option>
                <option value={10}>10건 표시</option>
                <option value={20}>20건 표시</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 7.b 그룹목록 패널 토글 */}
            {isGroupPanelOpen && (
              <div className={`lg:col-span-4 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-2 ${groupScrollHeightClass} overflow-y-auto`}>
                <div className="space-y-1">
                  {filteredGroups.map((g) => {
                    const isSel = selectedGroupCode === g.groupCode;
                    const count = detailCodes.filter((c) => c.groupCode === g.groupCode).length;
                    return (
                      <button
                        key={g.groupCode}
                        type="button"
                        onClick={() => setSelectedGroupCode(g.groupCode)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSel ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate font-bold">{g.groupName}</div>
                          <div className={`text-[10px] font-mono truncate ${isSel ? 'text-indigo-200' : 'text-slate-400 dark:text-zinc-500'}`}>
                            {g.groupCode}
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                          isSel ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                        }`}>
                          {count}개
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 상세코드 목록 (패널 닫힘 시 12컬럼 전체 확장) */}
            <div className={`${isGroupPanelOpen ? 'lg:col-span-8' : 'lg:col-span-12'} p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3 transition-all`}>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">[{curGroup.groupCode}]</span>
                    <span>{curGroup.groupName}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{curGroup.description}</p>
                </div>
                {!isGroupPanelOpen && (
                  <button
                    type="button"
                    onClick={() => setIsGroupPanelOpen(true)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <PanelLeftOpen className="w-3.5 h-3.5" />
                    <span>그룹목록 보기</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500">
                      <th className="py-2 px-1 w-8 text-center" title="드래그 앤 드롭 정렬"></th>
                      <th className="py-2 px-2.5">순서</th>
                      <th className="py-2 px-2.5">코드</th>
                      <th className="py-2 px-2.5">코드명</th>
                      {/* 7.c 우선순위 & 사용자항목1/2/3 값이 존재하는 경우만 표출 */}
                      {hasPriority && <th className="py-2 px-2.5 text-center">우선순위</th>}
                      {hasUserField1 && <th className="py-2 px-2.5">사용자항목1</th>}
                      {hasUserField2 && <th className="py-2 px-2.5">사용자항목2</th>}
                      {hasUserField3 && <th className="py-2 px-2.5">사용자항목3</th>}
                      <th className="py-2 px-2.5 text-center">기본</th>
                      <th className="py-2 px-2.5 text-center">사용</th>
                      <th className="py-2 px-2.5 text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {curDetailCodes.map((item, index) => {
                      const isDragging = draggedDetailIndex === index;
                      const isDragOver = dragOverDetailIndex === index && draggedDetailIndex !== null && draggedDetailIndex !== index;
                      const isDropAbove = isDragOver && draggedDetailIndex > index;
                      const isDropBelow = isDragOver && draggedDetailIndex < index;

                      return (
                        <tr
                          key={item.code}
                          draggable
                          onDragStart={(e) => handleDetailDragStart(e, index)}
                          onDragOver={(e) => handleDetailDragOver(e, index)}
                          onDragEnd={handleDetailDragEnd}
                          onDrop={(e) => handleDetailDrop(e, index)}
                          className={`hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-all ${
                            isDragging
                              ? 'opacity-30 bg-slate-100 dark:bg-zinc-800'
                              : isDropAbove
                              ? 'border-t-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                              : isDropBelow
                              ? 'border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40'
                              : ''
                          }`}
                        >
                          <td
                            className="py-2 px-1 text-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                            title="드래그하여 순서 변경"
                          >
                            <GripVertical className="w-3.5 h-3.5 mx-auto" />
                          </td>
                          <td className="py-2 px-2.5 font-mono">{item.sortOrder}</td>
                          <td className="py-2 px-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.code}</td>
                          <td className="py-2 px-2.5 font-bold">{item.codeName}</td>
                        {/* 7.d 우선순위 수정기능 (인라인 증감) */}
                        {hasPriority && (
                          <td className="py-2 px-2.5 text-center">
                            <div className="inline-flex items-center gap-1 font-mono font-bold">
                              <button
                                type="button"
                                onClick={() => handleUpdateCodePriority(item.code, (item.priority || 10) - 1)}
                                className="p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded text-slate-500 dark:text-zinc-400"
                                title="우선순위 낮춤"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              <span className="text-xs text-indigo-600 dark:text-indigo-400 min-w-[20px] text-center">
                                {item.priority ?? 10}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCodePriority(item.code, (item.priority || 10) + 1)}
                                className="p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded text-slate-500 dark:text-zinc-400"
                                title="우선순위 높임"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        )}
                        {hasUserField1 && (
                          <td className="py-2 px-2.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                            {item.userField1 || '-'}
                          </td>
                        )}
                        {hasUserField2 && (
                          <td className="py-2 px-2.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                            {item.userField2 || '-'}
                          </td>
                        )}
                        {hasUserField3 && (
                          <td className="py-2 px-2.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                            {item.userField3 || '-'}
                          </td>
                        )}
                        <td className="py-2 px-2.5 text-center">
                          {item.isDefault && <span className="text-[9px] px-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded">DEFAULT</span>}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <ElmChk01
                            checked={item.isEnabled}
                            onChange={() => {}}
                            disabled={true}
                            className="min-h-0 py-0 justify-center"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-right">
                          <button onClick={() => handleOpenCodeModal(item)} className="p-1 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteCode(item.code)} className="p-1 text-rose-500 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 상세코드 등록/수정 모달 */}
          {isCodeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {editingCode ? `상세코드 수정 [${editingCode.code}]` : `[${curGroup.groupName}] 상세코드 추가`}
                  </h4>
                  <button onClick={() => setIsCodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
                  <div>
                    <label className="font-bold block mb-1">코드 ID (대문자 고유값)</label>
                    <input
                      type="text"
                      value={codeFormCode}
                      onChange={(e) => setCodeFormCode(e.target.value.toUpperCase())}
                      disabled={!!editingCode}
                      placeholder="예: CODE_EXPENSE_FOOD"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">코드명</label>
                    <input
                      type="text"
                      value={codeFormName}
                      onChange={(e) => setCodeFormName(e.target.value)}
                      placeholder="예: 식비 / 일반지출"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">영문명 (선택)</label>
                    <input
                      type="text"
                      value={codeFormEnName}
                      onChange={(e) => setCodeFormEnName(e.target.value)}
                      placeholder="예: Food & Dining"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">정렬 순서</label>
                      <input
                        type="number"
                        value={codeFormSort}
                        onChange={(e) => setCodeFormSort(Number(e.target.value) || 1)}
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">우선순위 (Priority)</label>
                      <input
                        type="number"
                        value={codeFormPriority}
                        onChange={(e) => setCodeFormPriority(Number(e.target.value) || 10)}
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">사용자항목 1 (선택)</label>
                    <input
                      type="text"
                      value={codeFormUserField1}
                      onChange={(e) => setCodeFormUserField1(e.target.value)}
                      placeholder="사용자 정의 메타데이터 1"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">사용자항목 2 (선택)</label>
                    <input
                      type="text"
                      value={codeFormUserField2}
                      onChange={(e) => setCodeFormUserField2(e.target.value)}
                      placeholder="사용자 정의 메타데이터 2"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">사용자항목 3 (선택)</label>
                    <input
                      type="text"
                      value={codeFormUserField3}
                      onChange={(e) => setCodeFormUserField3(e.target.value)}
                      placeholder="사용자 정의 메타데이터 3"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div className="pt-2 border-t flex items-center justify-between">
                    <ElmChk01
                      checked={codeFormDefault}
                      onChange={setCodeFormDefault}
                      label="그룹 내 기본값(Default)으로 지정"
                      className="min-h-0 py-0"
                    />
                    <ElmChk01
                      checked={codeFormEnabled}
                      onChange={setCodeFormEnabled}
                      label="사용 활성화"
                      className="min-h-0 py-0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCodeModalOpen(false)}
                    className="px-3 py-1.5 border rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCode}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          Tab 7: 게임 콘텐츠 풀 관리 (요청 6: 매장/메뉴 CRUD, 사다리/룰렛 프리셋 관리, 엑셀 CSV 업로드/다운로드)
          ========================================================================= */}
      {activeTab === 'GAME_POOL' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          {/* 히든 CSV 파일 입력 */}
          <input
            type="file"
            ref={csvFileInputRef}
            onChange={handleCsvUpload}
            accept=".csv"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-indigo-600" />
                <span>기초 게임 콘텐츠 풀 관리 (사다리 매장/메뉴 & 사다리/룰렛 프리셋)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                사다리 매장 및 메뉴(아이콘 3종 모드, 명칭, 금액)와 사다리/룰렛 프리셋을 관리하며 엑셀(CSV) 업로드 및 샘플 다운로드를 지원합니다.
              </p>
            </div>

            {/* 우측 툴바: 샘플 다운로드 드롭다운, CSV 업로드, 신규 등록 버튼 */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCsvSampleMenuOpen(!csvSampleMenuOpen)}
                  className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                  <span>샘플 CSV</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {csvSampleMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-lg py-1 z-30 space-y-0.5">
                    <button
                      type="button"
                      onClick={handleDownloadStoreSample}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                      <span>사다리 매장/메뉴 샘플</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadLadderSample}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
                      <span>사다리 프리셋 샘플</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadRouletteSample}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
                      <span>룰렛 프리셋 샘플</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => csvFileInputRef.current?.click()}
                className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="CSV 파일을 선택하여 일괄 업로드"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>엑셀(CSV) 업로드</span>
              </button>

              {gameSubTab === 'LADDER' && ladderSubView === 'STORE_MENU' && (
                <button
                  type="button"
                  onClick={() => handleOpenStoreModal()}
                  className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>매장 등록</span>
                </button>
              )}

              {gameSubTab === 'LADDER' && ladderSubView === 'LADDER_PRESET' && (
                <button
                  type="button"
                  onClick={() => handleOpenLadderPresetModal()}
                  className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>사다리 프리셋 등록</span>
                </button>
              )}

              {gameSubTab === 'ROULETTE' && (
                <button
                  type="button"
                  onClick={() => handleOpenRoulettePresetModal()}
                  className="min-h-[34px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>룰렛 프리셋 등록</span>
                </button>
              )}
            </div>
          </div>

          {/* 메인 게임 Sub Tab (LADDER vs ROULETTE) */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <button
              type="button"
              onClick={() => setGameSubTab('LADDER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gameSubTab === 'LADDER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              사다리 게임 풀 ({systemStores.length}개 매장 / {ladderPresets.length}개 프리셋)
            </button>
            <button
              type="button"
              onClick={() => setGameSubTab('ROULETTE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gameSubTab === 'ROULETTE'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              룰렛 기초 프리셋 ({roulettePresets.length}개)
            </button>
          </div>

          {/* 1. LADDER TAB CONTENT */}
          {gameSubTab === 'LADDER' && (
            <div className="space-y-4">
              {/* 사다리 하위 뷰 전환 (매장/메뉴 vs 사다리 프리셋) */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0E131F] p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLadderSubView('STORE_MENU')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      ladderSubView === 'STORE_MENU'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    1. 매장 & 메뉴 풀 관리 ({systemStores.length}개 매장)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLadderSubView('LADDER_PRESET')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      ladderSubView === 'LADDER_PRESET'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                    }`}
                  >
                    2. 사다리 게임 규칙 프리셋 ({ladderPresets.length}개)
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 pr-2 hidden sm:block">
                  {ladderSubView === 'STORE_MENU'
                    ? '매장별 대표메뉴 등록 시 비로그인/개인 사다리에 즉시 연동됩니다.'
                    : '참가자수, 당첨자수, 매장 및 결과역할 프리셋을 제공합니다.'}
                </div>
              </div>

              {/* A. 매장 & 메뉴 풀 관리 뷰 */}
              {ladderSubView === 'STORE_MENU' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* 좌측: 매장 목록 */}
                  <div className="md:col-span-4 space-y-2 max-h-[480px] overflow-y-auto">
                    <span className="text-xs font-bold text-slate-500 block px-1">등록 매장 목록</span>
                    {systemStores.map((store) => {
                      const isSel = selectedStoreId === store.id;
                      return (
                        <div
                          key={store.id}
                          onClick={() => setSelectedStoreId(store.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSel
                              ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 font-bold'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] hover:border-slate-300'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: store.themeColor || '#006241' }}
                              />
                              <span className="truncate">{store.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{store.locationMemo}</div>
                          </div>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenStoreModal(store)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                              title="매장 수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStore(store.id)}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                              title="매장 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 우측: 선택된 매장의 메뉴 관리 (아이콘, 메뉴명, 금액 CRUD) */}
                  <div className="md:col-span-8 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>{curStore.name} 소속 메뉴 풀 ({curStore.menus.length}개)</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{curStore.locationMemo}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenMenuEditModal()}
                        className="min-h-[32px] px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>메뉴 추가</span>
                      </button>
                    </div>

                    {/* 카테고리 필터 칩 바 */}
                    {curStore.menuCategories && curStore.menuCategories.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-slate-100 dark:border-zinc-800/80">
                        <button
                          type="button"
                          onClick={() => setStoreMenuFilterCat('전체')}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            storeMenuFilterCat === '전체'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                          }`}
                        >
                          전체 ({curStore.menus.length})
                        </button>
                        {curStore.menuCategories.map((cat) => {
                          const count = curStore.menus.filter((m) => m.categoryName === cat).length;
                          const isRTD = cat.includes('RTD');
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setStoreMenuFilterCat(cat)}
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                storeMenuFilterCat === cat
                                  ? isRTD
                                    ? 'bg-sky-600 text-white font-bold shadow-2xs'
                                    : 'bg-emerald-600 text-white font-bold'
                                  : isRTD
                                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                              }`}
                            >
                              {cat} ({count})
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400">
                            <th className="py-2 px-2.5">아이콘</th>
                            <th className="py-2 px-2.5">메뉴명</th>
                            <th className="py-2 px-2.5">분류</th>
                            <th className="py-2 px-2.5 text-right">금액</th>
                            <th className="py-2 px-2.5 text-right">관리</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {curStore.menus.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-slate-400">
                                등록된 메뉴가 없습니다. 상단 '메뉴 추가'를 클릭하세요.
                              </td>
                            </tr>
                          ) : (
                            curStore.menus
                              .filter((m) => storeMenuFilterCat === '전체' || m.categoryName === storeMenuFilterCat)
                              .map((m) => {
                                const isRTD = m.categoryName?.includes('RTD');
                                return (
                                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                                    <td className="py-2 px-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-zinc-700 overflow-hidden">
                                        {m.imageUrl ? (
                                          <img
                                            src={m.imageUrl}
                                            alt={m.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.currentTarget as HTMLElement).style.display = 'none';
                                              const parent = e.currentTarget.parentElement;
                                              if (parent && !parent.querySelector('.fallback-icon')) {
                                                const span = document.createElement('span');
                                                span.className = 'text-sm select-none fallback-icon';
                                                span.innerText = m.iconName || '☕';
                                                parent.appendChild(span);
                                              }
                                            }}
                                          />
                                        ) : (
                                          <span className="text-sm select-none">{m.iconName || '☕'}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 px-2.5">
                                      <div className="font-bold text-slate-900 dark:text-zinc-100">{m.name}</div>
                                      {m.description && (
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate max-w-xs">{m.description}</div>
                                      )}
                                    </td>
                                    <td className="py-2 px-2.5">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                        isRTD
                                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                                      }`}>
                                        {m.categoryName}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                      ₩{m.price.toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2.5 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenMenuEditModal(m)}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                                        title="수정"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStoreMenuItem(m.id)}
                                        className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                                        title="삭제"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* B. 사다리 게임 규칙 프리셋 뷰 */}
              {ladderSubView === 'LADDER_PRESET' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ladderPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                                preset.category === 'COFFEE' ? 'bg-amber-100 text-amber-800' :
                                preset.category === 'LUNCH' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {preset.category === 'COFFEE' ? '커피내기' : preset.category === 'LUNCH' ? '식사내기' : '당번내기'}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{preset.title}</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">{preset.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenLadderPresetModal(preset)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                              title="프리셋 수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLadderPreset(preset.id)}
                              className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                              title="프리셋 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/60 text-[11px] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">참가 인원 설정</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200">
                              참가 <span className="text-indigo-600 font-mono">{preset.playerCount || 5}</span>명 / 
                              당첨 <span className="text-rose-600 font-mono">{preset.winnerCount || 1}</span>명
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">연동 매장</span>
                            <span className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[150px]">
                              {preset.storeName || (systemStores.find(s => s.id === preset.storeId)?.name) || '기본 매장 없음'}
                            </span>
                          </div>
                        </div>

                        {/* 역할 칩 프리뷰 */}
                        <div className="flex flex-wrap gap-1">
                          {preset.roles.slice(0, 5).map((r, rIdx) => (
                            <span
                              key={rIdx}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                r.type === 'PAY'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50'
                              }`}
                            >
                              {r.label}
                            </span>
                          ))}
                          {preset.roles.length > 5 && (
                            <span className="text-[10px] px-1 py-0.5 rounded text-slate-400 font-mono">
                              +{preset.roles.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. ROULETTE TAB CONTENT */}
          {gameSubTab === 'ROULETTE' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roulettePresets.map((preset) => {
                  const totalWeight = preset.items.reduce((s, it) => s + (it.weight || 1), 0);
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0">
                            {preset.icon || '🍱'}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{preset.title}</h4>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                {preset.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{preset.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenRoulettePresetModal(preset)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                            title="룰렛 프리셋 수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRoulettePreset(preset.id)}
                            className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                            title="룰렛 프리셋 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 항목건수 & 가중치 요약 바 */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 text-[11px]">
                        <span className="text-slate-500">
                          항목 <strong className="text-slate-800 dark:text-zinc-200 font-mono">{preset.items.length}</strong>건
                        </span>
                        <span className="text-slate-500">
                          총 가중치 합계: <strong className="text-indigo-600 font-mono">{totalWeight}</strong>
                        </span>
                      </div>

                      {/* 룰렛 항목 칩들 (가중치 표기) */}
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {preset.items.map((it) => (
                          <span
                            key={it.id}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1"
                          >
                            <span>{it.icon || '🎯'}</span>
                            <span className="font-medium">{it.name}</span>
                            <span className="font-mono text-indigo-600 font-bold text-[9px] bg-white dark:bg-zinc-900 px-1 rounded">
                              w:{it.weight || 1}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              GAME_POOL MODALS (Store, Menu 3-Icon, Ladder Preset, Roulette Preset)
              ========================================================================= */}

          {/* 1. 매장 등록/수정 모달 */}
          {isStoreModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{editingStore ? '매장 수정' : '신규 매장 등록'}</h4>
                  <button onClick={() => setIsStoreModalOpen(false)}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">매장명</label>
                    <input
                      type="text"
                      value={storeFormName}
                      onChange={(e) => setStoreFormName(e.target.value)}
                      placeholder="예: PLUS CAFE 45층"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">파트너 브랜드</label>
                    <input
                      type="text"
                      value={storeFormBrand}
                      onChange={(e) => setStoreFormBrand(e.target.value)}
                      placeholder="예: WPS 스타벅스"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">업종 카테고리</label>
                    <select
                      value={storeFormCategory}
                      onChange={(e) => setStoreFormCategory(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    >
                      <option value="CAFE">카페 & 베이커리</option>
                      <option value="LUNCH">점심 식사 & 한식</option>
                      <option value="DINNER">저녁 회식 & 주점</option>
                      <option value="SNACK">분식 & 간편식</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">위치 메모</label>
                    <input
                      type="text"
                      value={storeFormLocation}
                      onChange={(e) => setStoreFormLocation(e.target.value)}
                      placeholder="예: 여의도 63빌딩 45층"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">테마 컬러</label>
                    <input
                      type="color"
                      value={storeFormThemeColor}
                      onChange={(e) => setStoreFormThemeColor(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg border bg-slate-50 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setIsStoreModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
                  <button onClick={handleSaveStore} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
                </div>
              </div>
            </div>
          )}

          {/* 2. 매장 메뉴 등록/수정 모달 (아이콘 3모드: 기본이모지, 파일업로드, URL등록) */}
          {isMenuEditModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{editingStoreMenuItem ? '메뉴 수정' : '신규 메뉴 등록'}</h4>
                  <button onClick={() => setIsMenuEditModalOpen(false)}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
                </div>
                <div className="space-y-3 text-xs">
                  {/* 메뉴 아이콘 등록 3종 모드 탭 */}
                  <div>
                    <label className="font-bold block mb-1">메뉴 아이콘 등록 방식</label>
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      <button
                        type="button"
                        onClick={() => setItemIconMode('EMOJI')}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          itemIconMode === 'EMOJI'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        기본 이모지
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemIconMode('UPLOAD')}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          itemIconMode === 'UPLOAD'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        파일 업로드
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemIconMode('URL')}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          itemIconMode === 'URL'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        URL 등록
                      </button>
                    </div>

                    {/* Mode A: 기본 이모지 선택 */}
                    {itemIconMode === 'EMOJI' && (
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F] max-h-24 overflow-y-auto">
                        {DEFAULT_MENU_ICONS.map((ic) => (
                          <button
                            key={ic}
                            type="button"
                            onClick={() => setItemFormIcon(ic)}
                            className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                              itemFormIcon === ic
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'hover:bg-slate-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {ic}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Mode B: 파일 업로드 */}
                    {itemIconMode === 'UPLOAD' && (
                      <div className="p-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMenuImageFileUpload}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {itemFormImageUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-500">미리보기:</span>
                            <img src={itemFormImageUrl} alt="미리보기" className="w-8 h-8 rounded-md object-cover border" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode C: URL 등록 */}
                    {itemIconMode === 'URL' && (
                      <div className="p-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] space-y-2">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={itemFormUrlInput}
                            onChange={(e) => setItemFormUrlInput(e.target.value)}
                            placeholder="https://... 이미지 웹 URL"
                            className="flex-1 h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E] font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={handleRegisterUrlAsIcon}
                            className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            적용
                          </button>
                        </div>
                        {itemFormImageUrl && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-500">등록된 이미지:</span>
                            <img src={itemFormImageUrl} alt="URL 이미지" className="w-8 h-8 rounded-md object-cover border" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-bold block mb-1">메뉴명</label>
                    <input
                      type="text"
                      value={itemFormName}
                      onChange={(e) => setItemFormName(e.target.value)}
                      placeholder="예: 아이스 카페 아메리카노"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">금액 (원)</label>
                    <input
                      type="number"
                      value={itemFormPrice}
                      onChange={(e) => setItemFormPrice(Number(e.target.value) || 0)}
                      placeholder="예: 4500"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">카테고리</label>
                    <input
                      type="text"
                      value={itemFormCategory}
                      onChange={(e) => setItemFormCategory(e.target.value)}
                      placeholder="예: 커피 / 음료 / 디저트"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                    {curStore && curStore.menuCategories && curStore.menuCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {curStore.menuCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setItemFormCategory(cat)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                              itemFormCategory === cat
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="font-bold block mb-1">메뉴설명</label>
                    <input
                      type="text"
                      value={itemFormDesc}
                      onChange={(e) => setItemFormDesc(e.target.value)}
                      placeholder="예: 깊고 진한 에스프레소 원두의 풍미"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setIsMenuEditModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
                  <button onClick={handleSaveStoreMenuItem} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
                </div>
              </div>
            </div>
          )}

          {/* 3. 사다리 프리셋 등록/수정 모달 */}
          {isLadderPresetModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {editingLadderPreset ? '사다리 게임 프리셋 수정' : '신규 사다리 게임 프리셋 등록'}
                  </h4>
                  <button onClick={() => setIsLadderPresetModalOpen(false)}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">프리셋 제목</label>
                    <input
                      type="text"
                      value={ladderFormTitle}
                      onChange={(e) => setLadderFormTitle(e.target.value)}
                      placeholder="예: 팀 커피내기 (5인)"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">카테고리</label>
                      <select
                        value={ladderFormCategory}
                        onChange={(e) => setLadderFormCategory(e.target.value as any)}
                        className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                      >
                        <option value="COFFEE">커피내기</option>
                        <option value="LUNCH">식사내기</option>
                        <option value="DUTY">당번내기</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1">연동 매장</label>
                      <select
                        value={ladderFormStoreId}
                        onChange={(e) => setLadderFormStoreId(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                      >
                        <option value="">(연동 매장 없음)</option>
                        {systemStores.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold block mb-1">참가자 수 (명)</label>
                      <input
                        type="number"
                        min={2}
                        max={20}
                        value={ladderFormPlayerCount}
                        onChange={(e) => setLadderFormPlayerCount(Number(e.target.value) || 2)}
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">당첨자 수 (명)</label>
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, ladderFormPlayerCount - 1)}
                        value={ladderFormWinnerCount}
                        onChange={(e) => setLadderFormWinnerCount(Number(e.target.value) || 1)}
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">설명</label>
                    <textarea
                      value={ladderFormDescription}
                      onChange={(e) => setLadderFormDescription(e.target.value)}
                      rows={2}
                      placeholder="사다리 프리셋 용도 및 규칙 설명"
                      className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setIsLadderPresetModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
                  <button onClick={handleSaveLadderPreset} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
                </div>
              </div>
            </div>
          )}

          {/* 4. 룰렛 프리셋 등록/수정 모달 (항목 건수, 명, 가중치 관리) */}
          {isRoulettePresetModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {editingRoulettePreset ? '룰렛 프리셋 수정' : '신규 룰렛 프리셋 등록'}
                  </h4>
                  <button onClick={() => setIsRoulettePresetModalOpen(false)}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
                </div>
                <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="font-bold block mb-1">프리셋 제목</label>
                      <input
                        type="text"
                        value={rouletteFormTitle}
                        onChange={(e) => setRouletteFormTitle(e.target.value)}
                        placeholder="예: 점심 메뉴 추천"
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">대표 아이콘</label>
                      <input
                        type="text"
                        value={rouletteFormIcon}
                        onChange={(e) => setRouletteFormIcon(e.target.value)}
                        placeholder="🍱"
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">카테고리</label>
                    <select
                      value={rouletteFormCategory}
                      onChange={(e) => setRouletteFormCategory(e.target.value as any)}
                      className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    >
                      <option value="LUNCH">점심 식사</option>
                      <option value="DUTY">당번 선정</option>
                      <option value="PENALTY">벌칙 정하기</option>
                      <option value="COFFEE">커피 간식</option>
                      <option value="CUSTOM">사용자 정의</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">설명</label>
                    <input
                      type="text"
                      value={rouletteFormDescription}
                      onChange={(e) => setRouletteFormDescription(e.target.value)}
                      placeholder="룰렛 설명"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>

                  {/* 룰렛 항목 및 가중치 목록 관리 */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <label className="font-bold block">
                        룰렛 세부 항목 및 가중치 ({rouletteFormItems.length}건)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setRouletteFormItems([
                            ...rouletteFormItems,
                            { id: `item-${Date.now()}`, name: `새 항목 ${rouletteFormItems.length + 1}`, icon: '🎯', weight: 1 }
                          ]);
                        }}
                        className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 font-bold text-[11px] hover:bg-indigo-100 cursor-pointer"
                      >
                        + 항목 추가
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {rouletteFormItems.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-1.5 p-1.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F]">
                          <input
                            type="text"
                            value={item.icon || '🎯'}
                            onChange={(e) => {
                              const next = [...rouletteFormItems];
                              next[idx].icon = e.target.value;
                              setRouletteFormItems(next);
                            }}
                            className="w-8 h-7 text-center rounded border bg-white dark:bg-[#131B2E]"
                          />
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const next = [...rouletteFormItems];
                              next[idx].name = e.target.value;
                              setRouletteFormItems(next);
                            }}
                            placeholder="항목명"
                            className="flex-1 h-7 px-2 rounded border bg-white dark:bg-[#131B2E]"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">가중치:</span>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={item.weight || 1}
                              onChange={(e) => {
                                const next = [...rouletteFormItems];
                                next[idx].weight = Number(e.target.value) || 1;
                                setRouletteFormItems(next);
                              }}
                              className="w-14 h-7 px-1.5 text-center font-mono rounded border bg-white dark:bg-[#131B2E]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setRouletteFormItems(rouletteFormItems.filter((_, i) => i !== idx));
                            }}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setIsRoulettePresetModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
                  <button onClick={handleSaveRoulettePreset} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          Tab 8: 긴급 공지 관리 (요청 1~5: 등록 버튼명, 게시 상태구분, TEXT/MD/IMG 구분, 이동버튼, 미리보기 팝업, 하단초기화바 삭제)
          ========================================================================= */}
      {activeTab === 'NOTICE' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>공지</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                TEXT, MD(Markdown 서식), IMG(이미지 배너) 구분을 지원하며 이동 버튼 타겟(서비스화면, 컨텐츠경로, 외부링크)을 제어합니다.
              </p>
            </div>
            {/* 요청 1: 신규 공지 등록 -> 등록 */}
            <button
              type="button"
              onClick={() => handleOpenNoticeModal()}
              className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>등록</span>
            </button>
          </div>

          {/* 공지 목록 카드 그리드 */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-500 block">등록된 전역 공지 목록 ({notices.length}건)</span>

            <div className="grid grid-cols-1 gap-3">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    n.isEnabled
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* 요청 3: 구분 표기 TEXT, MD, IMG */}
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                        n.mode === 'TEXT' ? 'bg-slate-100 text-slate-700' :
                        n.mode === 'MD' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {n.mode === 'TEXT' ? 'TEXT' : n.mode === 'MD' ? 'MD' : 'IMG'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{n.title}</h4>
                      {/* 요청 2: 송출중 -> 게시중 */}
                      {n.isEnabled && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-500 text-white animate-pulse">
                          게시중
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* 요청 4: 미리보기 버튼 (아이콘만 표시) */}
                      <button
                        type="button"
                        onClick={() => setPreviewNotice(n)}
                        className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded cursor-pointer"
                        title="공지 팝업 미리보기"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {/* 요청 2: 송출 중지 / 송출 시작 -> 게시 중지 / 게시 */}
                      <button
                        type="button"
                        onClick={() => handleToggleNoticeEnable(n.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                          n.isEnabled ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'
                        }`}
                      >
                        {n.isEnabled ? '게시 중지' : '게시'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenNoticeModal(n)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                        title="수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(n.id)}
                        className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 공지 내용 미리보기 (MD 모드 시 ElmMkdViewer 마크다운 렌더링) */}
                  <div className="p-3 rounded-lg bg-white dark:bg-[#0E131F] border border-slate-100 dark:border-zinc-800 text-xs">
                    {n.mode === 'IMAGE' && n.imageUrl && (
                      <img src={n.imageUrl} alt="공지 배너" className="w-full max-h-40 object-cover rounded-md mb-2" />
                    )}
                    {n.mode === 'MD' ? (
                      <ElmMkdViewer content={n.content} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-zinc-300">
                        {n.content}
                      </div>
                    )}
                  </div>

                  {/* 요청 3.e: 이동버튼 정보 (줄바꿈 기준: 텍스트가 아닌 요소 단위 줄바꿈) */}
                  {n.hasButton && (
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[11px] text-slate-500 pt-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <Link className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>이동버튼: <strong className="text-slate-800 dark:text-zinc-200">[{n.buttonText}]</strong></span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-medium whitespace-nowrap shrink-0">
                          {n.buttonTargetType === 'INTERNAL_SCREEN' ? '서비스내 화면' :
                           n.buttonTargetType === 'CONTENT_PATH' ? '컨텐츠 경로' : '외부 링크'}
                        </span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{n.buttonUrl}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">등록일: {n.createdAt}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 공지 등록/수정 모달 */}
          {isNoticeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{editingNotice ? '공지 수정' : '신규 공지 등록'}</h4>
                  <button onClick={() => setIsNoticeModalOpen(false)}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
                </div>
                <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
                  <div>
                    <label className="font-bold block mb-1">공지 제목</label>
                    <input
                      type="text"
                      value={noticeFormTitle}
                      onChange={(e) => setNoticeFormTitle(e.target.value)}
                      placeholder="예: 홈서버 정기 점검 안내"
                      className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                    />
                  </div>

                  {/* 요청 3: 구분: TEXT, MD, IMG */}
                  <div>
                    <label className="font-bold block mb-1">구분</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'TEXT', label: 'TEXT', icon: <TypeIcon className="w-3.5 h-3.5" /> },
                        { id: 'MD', label: 'MD', icon: <FileCode className="w-3.5 h-3.5" /> },
                        { id: 'IMAGE', label: 'IMG', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setNoticeFormMode(m.id as NoticeModeType)}
                          className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            noticeFormMode === m.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-[#0E131F] text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {m.icon}
                          <span>{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {noticeFormMode === 'IMAGE' && (
                    <div>
                      <label className="font-bold block mb-1">이미지 URL</label>
                      <input
                        type="text"
                        value={noticeFormImageUrl}
                        onChange={(e) => setNoticeFormImageUrl(e.target.value)}
                        placeholder="https://... 이미지 웹 주소"
                        className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                      />
                    </div>
                  )}

                  {noticeFormMode === 'MD' ? (
                    <ElmMkd01
                      value={noticeFormContent}
                      onChange={setNoticeFormContent}
                      label="공지 내용 (Markdown 문법 지원 & 미리보기)"
                      rows={5}
                      heightClass="min-h-[160px]"
                      defaultMode="edit"
                    />
                  ) : (
                    <div>
                      <label className="font-bold block mb-1">공지 내용</label>
                      <textarea
                        value={noticeFormContent}
                        onChange={(e) => setNoticeFormContent(e.target.value)}
                        rows={5}
                        placeholder="공지 본문 내용을 입력하세요."
                        className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-sans text-xs"
                      />
                    </div>
                  )}

                  {/* 요청 3.e: 이동 버튼 옵션 */}
                  <div className="p-3 rounded-xl border bg-slate-50 dark:bg-[#0E131F] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">이동 버튼 옵션</span>
                      <ElmChk01
                        checked={noticeFormHasButton}
                        onChange={setNoticeFormHasButton}
                        label="이동 버튼 표시"
                        className="min-h-0 py-0"
                      />
                    </div>

                    {noticeFormHasButton && (
                      <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold block mb-0.5">버튼명</label>
                            <input
                              type="text"
                              value={noticeFormButtonText}
                              onChange={(e) => setNoticeFormButtonText(e.target.value)}
                              placeholder="예: 자세히 보기"
                              className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold block mb-0.5">타겟 구분</label>
                            <select
                              value={noticeFormTargetType}
                              onChange={(e) => setNoticeFormTargetType(e.target.value as NoticeTargetType)}
                              className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E]"
                            >
                              <option value="INTERNAL_SCREEN">1. 서비스내 화면</option>
                              <option value="CONTENT_PATH">2. 컨텐츠 경로</option>
                              <option value="EXTERNAL_URL">3. 외부 링크</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold block mb-0.5">
                            {noticeFormTargetType === 'INTERNAL_SCREEN' ? '이동할 화면 ID' :
                             noticeFormTargetType === 'CONTENT_PATH' ? '컨텐츠 상대 경로' : '외부 웹사이트 URL'}
                          </label>
                          {noticeFormTargetType === 'INTERNAL_SCREEN' ? (
                            <select
                              value={noticeFormButtonUrl}
                              onChange={(e) => setNoticeFormButtonUrl(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E] font-mono"
                            >
                              <option value="SCR-DSH-01">SCR-DSH-01 (로그인 메인 대시보드)</option>
                              <option value="SCR-LED-01">SCR-LED-01 (가계부 관리 상세)</option>
                              <option value="SCR-DUT-01">SCR-DUT-01 (모아당번 순환관리)</option>
                              <option value="SCR-GOL-01">SCR-GOL-01 (모아목표 실천관리)</option>
                              <option value="SCR-MON-01">SCR-MON-01 (모아머니 이동관리)</option>
                              <option value="SCR-SET-01">SCR-SET-01 (사용자 맞춤 환경설정)</option>
                              <option value="SCR-OFF-01">SCR-OFF-01 (오프라인 동기화 안내)</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={noticeFormButtonUrl}
                              onChange={(e) => setNoticeFormButtonUrl(e.target.value)}
                              placeholder={noticeFormTargetType === 'CONTENT_PATH' ? '/docs/notice/01' : 'https://example.com'}
                              className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E] font-mono"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <ElmChk01
                      checked={noticeFormEnabled}
                      onChange={setNoticeFormEnabled}
                      label="즉시 전역 게시 활성화"
                      className="min-h-0 py-0.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button onClick={() => setIsNoticeModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
                  <button onClick={handleSaveNotice} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
                </div>
              </div>
            </div>
          )}

          {/* 요청 4: 공지 미리보기 팝업 모달 */}
          {previewNotice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {previewNotice.mode === 'TEXT' ? 'TEXT' : previewNotice.mode === 'MD' ? 'MD' : 'IMG'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{previewNotice.title}</h4>
                  </div>
                  <button onClick={() => setPreviewNotice(null)} className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {previewNotice.mode === 'IMAGE' && previewNotice.imageUrl && (
                    <img
                      src={previewNotice.imageUrl}
                      alt="공지 배너"
                      className="w-full max-h-48 object-cover rounded-xl border border-slate-100 dark:border-zinc-800"
                    />
                  )}
                  {previewNotice.mode === 'MD' ? (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E131F] border border-slate-100 dark:border-zinc-800 max-h-60 overflow-y-auto">
                      <ElmMkdViewer content={previewNotice.content} />
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E131F] border border-slate-100 dark:border-zinc-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {previewNotice.content}
                    </div>
                  )}

                  {previewNotice.hasButton && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          alert(`[이동 버튼 클릭 시뮬레이션]\n타겟: ${previewNotice.buttonTargetType}\nURL/화면: ${previewNotice.buttonUrl}`);
                        }}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <span>{previewNotice.buttonText || '자세히 보기'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setPreviewNotice(null)}
                    className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 요청 5: 불필요한 하단 공장 초기화 바 완전 삭제 완료 */}
        </section>
      )}
    </div>
  );
};
