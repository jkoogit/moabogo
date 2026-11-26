import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  LayoutGrid,
  List,
  Folder,
  Star,
  Edit3,
  Trash2,
  Copy,
} from 'lucide-react';
import { ElmInp01, ElmSel01, ElmTre02, TreeNodeItem } from '../../elements/Tokens';
import {
  ExternalTransactionAccount,
  AccountServiceType,
  SERVICE_PURPOSE_LABELS,
  loadAccountTreeNodes,
  loadExternalAccounts,
  attachCountsToTree,
  addTreeNode,
  updateTreeNode,
  deleteTreeNode,
  moveTreeNode,
  addExternalAccount,
  updateExternalAccount,
  deleteExternalAccount,
  searchExternalAccounts,
  maskExternalAccountNo,
} from '../../data/externalAccountStorePool';

export const ExternalAccountTab: React.FC = () => {
  const [extAccounts, setExtAccounts] = useState<ExternalTransactionAccount[]>(() =>
    loadExternalAccounts()
  );
  const [rawTreeNodes, setRawTreeNodes] = useState<TreeNodeItem[]>(() => loadAccountTreeNodes());
  const extTreeNodes = attachCountsToTree(rawTreeNodes, extAccounts);
  const [selectedTreeNodeId, setSelectedTreeNodeId] = useState<string>('root');
  const [isTreeCollapsed, setIsTreeCollapsed] = useState<boolean>(false);
  const [treePanelWidth, setTreePanelWidth] = useState<number>(280);
  const [isResizingTree, setIsResizingTree] = useState<boolean>(false);
  const [viewLayoutMode, setViewLayoutMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchExtQuery, setSearchExtQuery] = useState<string>('');
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // 계좌 등록/수정 모달 (슬림 4대 정보)
  const [isExtModalOpen, setIsExtModalOpen] = useState(false);
  const [editingExtAccountId, setEditingExtAccountId] = useState<string | null>(null);
  const [formExtFolderId, setFormExtFolderId] = useState('fld-edu');
  const [formExtAccountHolder, setFormExtAccountHolder] = useState('');
  const [formExtBankName, setFormExtBankName] = useState('국민은행');
  const [formExtAccountNo, setFormExtAccountNo] = useState('');
  const [formExtDepositor, setFormExtDepositor] = useState('');
  const [formExtIsDefault, setFormExtIsDefault] = useState(false);
  const [formExtPurposes, setFormExtPurposes] = useState<AccountServiceType[]>(['LIVING']);
  const [formExtDisabledServices, setFormExtDisabledServices] = useState<AccountServiceType[]>([]);
  const [formExtMemo, setFormExtMemo] = useState('');

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2500);
  };

  // 트리-컨텐츠 영역비율 조정 마우스 핸들러
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingTree(true);
    const startX = e.clientX;
    const startWidth = treePanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(500, startWidth + delta));
      setTreePanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingTree(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 트리 노드 CRUD 및 이동 핸들러
  const handleAddTreeNode = (parentId: string, name: string) => {
    addTreeNode(parentId, name);
    setRawTreeNodes(loadAccountTreeNodes());
  };

  const handleUpdateTreeNode = (nodeId: string, newName: string) => {
    updateTreeNode(nodeId, newName);
    setRawTreeNodes(loadAccountTreeNodes());
  };

  const handleDeleteTreeNode = (nodeId: string) => {
    const res = deleteTreeNode(nodeId);
    if (res.success) {
      setRawTreeNodes(loadAccountTreeNodes());
      if (selectedTreeNodeId === nodeId) setSelectedTreeNodeId('root');
    }
    return res;
  };

  const handleMoveTreeNode = (
    draggedId: string,
    targetId: string,
    position: 'inside' | 'before' | 'after'
  ) => {
    moveTreeNode(draggedId, targetId, position);
    setRawTreeNodes(loadAccountTreeNodes());
  };

  // 계좌 CRUD
  const handleOpenExtModal = (acc?: ExternalTransactionAccount) => {
    if (acc) {
      setEditingExtAccountId(acc.id);
      setFormExtFolderId(acc.folderId);
      setFormExtAccountHolder(acc.accountHolder);
      setFormExtBankName(acc.bankName || '국민은행');
      setFormExtAccountNo(acc.accountNo || '');
      setFormExtDepositor(acc.depositor || '');
      setFormExtIsDefault(acc.isDefault);
      setFormExtPurposes(acc.assignedPurposes);
      setFormExtDisabledServices(acc.disabledServices);
      setFormExtMemo(acc.memo || '');
    } else {
      setEditingExtAccountId(null);
      setFormExtFolderId(selectedTreeNodeId !== 'root' ? selectedTreeNodeId : 'fld-edu');
      setFormExtAccountHolder('');
      setFormExtBankName('국민은행');
      setFormExtAccountNo('');
      setFormExtDepositor('');
      setFormExtIsDefault(extAccounts.length === 0);
      setFormExtPurposes(extAccounts.length === 0 ? ['DEFAULT'] : ['LIVING']);
      setFormExtDisabledServices([]);
      setFormExtMemo('');
    }
    setIsExtModalOpen(true);
  };

  const handleSaveExtAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formExtAccountHolder.trim()) return;

    if (editingExtAccountId) {
      const existing = extAccounts.find((a) => a.id === editingExtAccountId);
      if (existing) {
        const updated: ExternalTransactionAccount = {
          ...existing,
          folderId: formExtFolderId,
          accountHolder: formExtAccountHolder.trim(),
          bankName: formExtBankName.trim(),
          accountNo: formExtAccountNo.trim(),
          depositor: formExtDepositor.trim() || undefined,
          isDefault: formExtIsDefault,
          assignedPurposes: formExtPurposes,
          disabledServices: formExtDisabledServices,
          memo: formExtMemo.trim(),
        };
        updateExternalAccount(updated);
        setExtAccounts(loadExternalAccounts());
        showToast('✓ 거래계좌 정보가 수정되었습니다.');
      }
    } else {
      addExternalAccount({
        folderId: formExtFolderId,
        accountHolder: formExtAccountHolder.trim(),
        bankName: formExtBankName.trim(),
        accountNo: formExtAccountNo.trim(),
        depositor: formExtDepositor.trim() || undefined,
        isDefault: formExtIsDefault,
        assignedPurposes: formExtPurposes,
        disabledServices: formExtDisabledServices,
        memo: formExtMemo.trim(),
      });
      setExtAccounts(loadExternalAccounts());
      showToast('✓ 새 거래계좌가 등록되었습니다.');
    }
    setIsExtModalOpen(false);
  };

  const handleDeleteExtAccount = (id: string) => {
    if (window.confirm('이 거래계좌를 삭제하시겠습니까?')) {
      deleteExternalAccount(id);
      setExtAccounts(loadExternalAccounts());
      showToast('거래계좌가 삭제되었습니다.');
    }
  };

  const filtered = searchExternalAccounts(searchExtQuery, selectedTreeNodeId);

  const renderCardGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {filtered.map((acc) => (
        <div
          key={acc.id}
          className={`p-4 rounded-2xl border transition-all space-y-3 ${
            acc.isDefault
              ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300/70 dark:border-amber-700/60 shadow-xs'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700/60'
          }`}
        >
          {/* 카드 상단 */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate">
                  {acc.accountHolder}
                </h4>
                {acc.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] shrink-0 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    기본대표
                  </span>
                )}
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-bold">
                  ⚡ {acc.usageCount}회 기장
                </span>
              </div>

              {/* 용도 뱃지 목록 */}
              <div className="flex items-center gap-1 flex-wrap">
                {acc.assignedPurposes.map((p) => {
                  const info = SERVICE_PURPOSE_LABELS[p];
                  return (
                    <span
                      key={p}
                      className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-0.5"
                    >
                      <span>{info?.icon}</span>
                      <span>{info?.label}</span>
                    </span>
                  );
                })}
                {acc.disabledServices.map((d) => (
                  <span
                    key={d}
                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                  >
                    {SERVICE_PURPOSE_LABELS[d]?.label}: 미사용 (숨김)
                  </span>
                ))}
              </div>
            </div>

            {/* 액션 */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenExtModal(acc)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="계좌 수정"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteExtAccount(acc.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="계좌 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 계좌번호 정보 박스 */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 text-xs space-y-1">
            {acc.accountNo ? (
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-slate-800 dark:text-zinc-200 font-bold">
                  🏦 {acc.bankName} {maskExternalAccountNo(acc.accountNo)}
                  {acc.depositor && (
                    <span className="font-sans font-normal text-slate-500 ml-1.5">
                      (예금주: {acc.depositor})
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(acc.accountNo);
                    showToast(`✓ "${acc.accountHolder}" 계좌번호가 복사되었습니다.`);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-bold border border-slate-200 dark:border-zinc-600 hover:bg-slate-50 cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <Copy className="w-3 h-3" />
                  <span>복사</span>
                </button>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-semibold">
                  Zero-Friction
                </span>
                <span>계좌번호 미등록 (간편 기장용 상호)</span>
              </div>
            )}
          </div>

          {/* 메모 */}
          {acc.memo && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50/50 dark:bg-zinc-800/30 p-2 rounded-lg border border-slate-100 dark:border-zinc-800/60 truncate">
              📝 {acc.memo}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <section className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col space-y-0">
        {/* 1. 상단 타이틀 & 글로벌 액션 바 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/40">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Building2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>거래계좌 관리</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 whitespace-nowrap shrink-0">
                ELM-TRE-02
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                기본 Fallback & 킬스위치
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              좌측 트리 네비게이션으로 분류 탐색 • 기본 계좌 자동 상속(Fallback) • 서비스별 '미사용' 시 송금 버튼 자동 숨김
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenExtModal()}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>계좌 등록</span>
            </button>
          </div>
        </div>

        {/* 2. 메인 2-패널 컨테이너 */}
        <div className="flex flex-col sm:flex-row min-h-[560px] relative">
          {/* 좌측 트리 컴포넌트 */}
          <ElmTre02
            nodes={extTreeNodes}
            selectedNodeId={selectedTreeNodeId}
            onSelectNode={setSelectedTreeNodeId}
            onAddNode={handleAddTreeNode}
            onUpdateNode={handleUpdateTreeNode}
            onDeleteNode={handleDeleteTreeNode}
            onMoveNode={handleMoveTreeNode}
            isCollapsed={isTreeCollapsed}
            onToggleCollapse={() => setIsTreeCollapsed(!isTreeCollapsed)}
            style={!isTreeCollapsed ? { width: `${treePanelWidth}px` } : undefined}
          />

          {/* 영역 비율 조정 리사이저 (데스크톱 전용) */}
          {!isTreeCollapsed && (
            <div
              onMouseDown={handleMouseDownResize}
              onDoubleClick={() => setTreePanelWidth(280)}
              className={`hidden sm:flex items-center justify-center w-2 -ml-1 cursor-col-resize z-20 group relative transition-colors select-none ${
                isResizingTree ? 'bg-indigo-600' : 'hover:bg-indigo-400/80 bg-transparent'
              }`}
              title="드래그하여 트리/컨텐츠 영역 비율 조정 (더블클릭 시 280px 리셋)"
            >
              <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
            </div>
          )}

          {/* 우측 계좌 목록 및 검색 컨텐츠 영역 */}
          <main className="flex-1 p-4 sm:p-5 flex flex-col space-y-4 min-w-0">
            {/* 검색 바 및 뷰모드 툴바 */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchExtQuery}
                  onChange={(e) => setSearchExtQuery(e.target.value)}
                  placeholder="계좌명칭, 예금주, 은행, 번호, 메모 검색..."
                  className="w-full min-h-[40px] pl-10 pr-8 py-2 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
                {searchExtQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchExtQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1 self-end sm:self-auto border border-slate-200 dark:border-zinc-700 rounded-xl p-1 bg-slate-50 dark:bg-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setViewLayoutMode('GRID')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewLayoutMode === 'GRID'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                  }`}
                  title="카드 그리드 뷰"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayoutMode('LIST')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewLayoutMode === 'LIST'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                  }`}
                  title="목록 테이블 뷰"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {copyToast && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
                {copyToast}
              </div>
            )}

            {/* 계좌 목록 컨텐츠 렌더링 */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                  <Folder className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                  선택된 분류에 등록된 거래계좌가 없습니다.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenExtModal()}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  + 이 분류에 새 계좌 등록하기
                </button>
              </div>
            ) : viewLayoutMode === 'LIST' ? (
              <>
                <div className="block sm:hidden">{renderCardGridView()}</div>
                <div className="hidden sm:block border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900/60">
                  {filtered.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-zinc-100">
                            {acc.accountHolder}
                          </span>
                          {acc.isDefault && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              기본대표
                            </span>
                          )}
                          {acc.assignedPurposes.map((p) => {
                            const info = SERVICE_PURPOSE_LABELS[p];
                            return (
                              <span
                                key={p}
                                className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                              >
                                {info?.icon} {info?.label}
                              </span>
                            );
                          })}
                          {acc.disabledServices.map((d) => (
                            <span
                              key={d}
                              className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            >
                              {SERVICE_PURPOSE_LABELS[d]?.label}: 미사용
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                          {acc.accountNo ? (
                            <span>
                              🏦 {acc.bankName} {maskExternalAccountNo(acc.accountNo)}
                            </span>
                          ) : (
                            <span className="text-slate-400">Zero-Friction (계좌번호 미등록)</span>
                          )}
                          {acc.memo && (
                            <span className="text-slate-400 font-sans truncate">| {acc.memo}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {acc.accountNo && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(acc.accountNo);
                              showToast(`✓ "${acc.accountHolder}" 계좌번호가 복사되었습니다.`);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-xs font-bold hover:bg-slate-200 cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>복사</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenExtModal(acc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExtAccount(acc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              renderCardGridView()
            )}
          </main>
        </div>
      </section>

      {/* 슬림형 거래계좌 등록/수정 모달 */}
      {isExtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                  {editingExtAccountId ? '거래계좌 정보 수정' : '거래계좌 등록'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsExtModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveExtAccount} className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <ElmSel01
                label="소속 분류 폴더"
                value={formExtFolderId}
                onChange={setFormExtFolderId}
                options={[
                  { value: 'fld-edu', label: '🏫 교육/학원' },
                  { value: 'fld-edu-math', label: '  └ 📐 수학/과학' },
                  { value: 'fld-edu-lang', label: '  └ 🔤 어학/교습' },
                  { value: 'fld-living', label: '🛒 생활/마트' },
                  { value: 'fld-health', label: '🏥 의료/건강' },
                  { value: 'fld-club', label: '👥 모임/회비' },
                  { value: 'fld-food', label: '☕ 단골/식음료' },
                  { value: 'fld-etc', label: '🏢 기타/비회원' },
                ]}
              />

              <ElmInp01
                label="계좌 명칭 / 상호 (필수)"
                value={formExtAccountHolder}
                onChange={setFormExtAccountHolder}
                placeholder="예: 미래수학학원, (주)이마트 역삼점, 주말러닝크루"
              />

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  <span>은행 계좌 정보</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <ElmSel01
                    label="은행명"
                    value={formExtBankName}
                    onChange={setFormExtBankName}
                    options={[
                      { value: '국민은행', label: '국민은행' },
                      { value: '신한은행', label: '신한은행' },
                      { value: '카카오뱅크', label: '카카오뱅크' },
                      { value: '토스뱅크', label: '토스뱅크' },
                      { value: '하나은행', label: '하나은행' },
                      { value: '우리은행', label: '우리은행' },
                      { value: 'NH농협', label: 'NH농협' },
                      { value: '기업은행', label: '기업은행' },
                      { value: '기타은행', label: '기타' },
                    ]}
                  />

                  <ElmInp01
                    label="계좌번호 (선택)"
                    value={formExtAccountNo}
                    onChange={setFormExtAccountNo}
                    placeholder="'-' 없이 숫자 입력"
                  />

                  <ElmInp01
                    label="예금주명 (선택)"
                    value={formExtDepositor}
                    onChange={setFormExtDepositor}
                    placeholder="예: 김원장"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    용도 설정
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formExtIsDefault}
                      onChange={(e) => setFormExtIsDefault(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      기본 대표 계좌로 지정
                    </span>
                  </label>
                </div>

                {formExtIsDefault && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200 font-medium animate-in fade-in">
                    {(() => {
                      const prevDefault = extAccounts.find(
                        (a) => a.isDefault && a.id !== editingExtAccountId
                      );
                      if (prevDefault) {
                        return `ℹ️ 현재 기본 대표 계좌: [${prevDefault.accountHolder}${
                          prevDefault.bankName ? ` (${prevDefault.bankName})` : ''
                        }] ➔ 등록 완료 시 이 계좌가 새로운 기본 대표 계좌로 지정됩니다.`;
                      }
                      return '✓ 이 계좌가 첫 번째 기본 대표 계좌로 지정됩니다. (등록 완료 시 반영)';
                    })()}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-zinc-400">
                    이 계좌가 적용될 서비스 용도:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['ALLOWANCE', 'LIVING', 'MEETING', 'GOAL_CHEER'] as AccountServiceType[]).map(
                      (srv) => {
                        const isAssigned = formExtPurposes.includes(srv);
                        const info = SERVICE_PURPOSE_LABELS[srv];
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => {
                              if (isAssigned) {
                                setFormExtPurposes(formExtPurposes.filter((p) => p !== srv));
                              } else {
                                setFormExtPurposes([...formExtPurposes, srv]);
                                setFormExtDisabledServices(
                                  formExtDisabledServices.filter((d) => d !== srv)
                                );
                              }
                            }}
                            className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isAssigned
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                            }`}
                          >
                            <span>{info.icon}</span>
                            <span>{info.label}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-700 space-y-1.5">
                  <label className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <span>🚨 '미사용' 킬스위치 설정 (화면에서 송금 버튼 숨김):</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['GOAL_CHEER', 'ALLOWANCE'] as AccountServiceType[]).map((srv) => {
                      const isKill = formExtDisabledServices.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => {
                            if (isKill) {
                              setFormExtDisabledServices(
                                formExtDisabledServices.filter((d) => d !== srv)
                              );
                            } else {
                              setFormExtDisabledServices([...formExtDisabledServices, srv]);
                              setFormExtPurposes(formExtPurposes.filter((p) => p !== srv));
                            }
                          }}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isKill
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          {isKill ? '✓ ' : ''}
                          {SERVICE_PURPOSE_LABELS[srv].label} 미사용 (숨김)
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <ElmInp01
                label="메모 / 특이사항 (선택)"
                value={formExtMemo}
                onChange={setFormExtMemo}
                placeholder="예: 매월 25일 자동이체, 실비보험 청구용"
              />

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExtModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {editingExtAccountId ? '수정 저장' : '등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
