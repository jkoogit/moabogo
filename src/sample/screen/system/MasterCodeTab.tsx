import React, { useState } from 'react';
import { ElmChk01 } from '../../elements/Tokens';
import {
  Code2,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
} from 'lucide-react';
import {
  MasterDetailCode,
  MASTER_GROUP_CODES,
  loadMasterDetailCodes,
  saveMasterDetailCodes,
} from '../../data/systemGovernancePool';

interface MasterCodeTabProps {
  onToast: (message: string) => void;
}

export const MasterCodeTab: React.FC<MasterCodeTabProps> = ({ onToast }) => {
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

  const curGroup = MASTER_GROUP_CODES.find((g) => g.groupCode === selectedGroupCode) || MASTER_GROUP_CODES[0];
  const curDetailCodes = detailCodes
    .filter((c) => c.groupCode === selectedGroupCode)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const filteredGroups = codeFilterCategory === 'ALL'
    ? MASTER_GROUP_CODES
    : MASTER_GROUP_CODES.filter((g) => g.category === codeFilterCategory);

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
      onToast('코드와 코드명을 모두 입력해 주세요.');
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
    onToast('마스터 상세코드가 저장되었습니다.');
  };

  const handleDeleteCode = (codeToDelete: string) => {
    if (!confirm(`'${codeToDelete}' 코드를 삭제하시겠습니까?`)) return;
    const updated = detailCodes.filter(
      (c) => !(c.groupCode === selectedGroupCode && c.code === codeToDelete)
    );
    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    onToast('상세코드가 삭제되었습니다.');
  };

  const handleUpdateCodePriority = (code: string, newPriority: number) => {
    const updated = detailCodes.map((c) =>
      c.groupCode === selectedGroupCode && c.code === code
        ? { ...c, priority: Math.max(1, newPriority) }
        : c
    );
    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    onToast(`코드 [${code}]의 우선순위가 ${Math.max(1, newPriority)}(으)로 변경되었습니다.`);
  };

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

    const reorderedGroupItems = currentGroupItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));

    const otherGroupItems = detailCodes.filter((c) => c.groupCode !== selectedGroupCode);
    const updated = [...otherGroupItems, ...reorderedGroupItems];

    setDetailCodes(updated);
    saveMasterDetailCodes(updated);
    setDraggedDetailIndex(null);
    onToast(`코드 [${movedItem.codeName}]의 정렬 순서가 변경되었습니다.`);
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>플랫폼 전역 28대 마스터 그룹코드 및 상세코드 풀</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            장부, 금융, 지출이동, 당번, 목표, 정산, 모아데이, 모아루틴, 모아부릉 9대 카테고리 28종 그룹코드를 관리합니다.
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
          {['ALL', '장부', '금융', '지출이동', '모아당번', '모아목표', '정산', '모아데이', '모아루틴', '모아부릉'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCodeFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                codeFilterCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {cat === 'ALL' ? '전체 그룹 (28종)' : cat}
            </button>
          ))}
        </div>

        {/* 그룹목록 스크롤높이 설정 */}
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
                        <button type="button" onClick={() => handleOpenCodeModal(item)} className="p-1 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => handleDeleteCode(item.code)} className="p-1 text-rose-500 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <button type="button" onClick={() => setIsCodeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
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
  );
};
