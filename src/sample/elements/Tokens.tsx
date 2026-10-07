import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Check,
  Camera,
  ArrowUp,
  Plus,
  Trash2,
  Edit2,
  Menu,
  WifiOff,
  Clock,
  Sparkles,
} from 'lucide-react';

/* =========================================================================
   ELM-TYP-01 : 메인 타이틀 (수직 100% 중앙 정렬)
   ========================================================================= */
export const ElmTyp01: React.FC<{
  title: string;
  badge?: string;
  subtitle?: string;
  className?: string;
}> = ({ title, badge, subtitle, className = '' }) => (
  <div className={`flex flex-col justify-center ${className}`}>
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-h-[32px]">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-none flex items-center break-keep">
        {title}
      </h2>
      {badge && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 leading-none whitespace-nowrap shrink-0">
          {badge}
        </span>
      )}
    </div>
    {subtitle && (
      <p className="text-xs text-slate-500 mt-1 leading-normal break-keep">{subtitle}</p>
    )}
  </div>
);

/* =========================================================================
   ELM-INP-01 : 일반 입력필드 (상시 X 클리어 버튼 내장, 수직 중앙 정렬)
   ========================================================================= */
export const ElmInp01: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label,
  disabled = false,
  className = '',
}) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label className="block text-xs font-semibold text-slate-700 mb-1 leading-none">
        {label}
      </label>
    )}
    <div className="relative flex items-center min-h-[40px]">
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-3 pr-8 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed leading-normal"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="입력 내용 지우기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

/* =========================================================================
   ELM-INP-04 : 검색 입력필드 (Search 아이콘 + 상시 X 클리어 버튼)
   ========================================================================= */
export const ElmInp04: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = '검색어를 입력하세요...', className = '' }) => (
  <div className={`relative flex items-center min-h-[40px] w-full ${className}`}>
    <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 pl-9 pr-8 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 leading-normal"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        title="검색어 지우기"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);

/* =========================================================================
   ELM-SEL-01 : 선택 목록 드롭다운 (수직 중앙 정렬)
   ========================================================================= */
export const ElmSel01: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  label?: string;
  className?: string;
}> = ({ value, onChange, options, label, className = '' }) => (
  <div className={`w-full ${className}`}>
    {label && (
      <label className="block text-xs font-semibold text-slate-700 mb-1 leading-none">
        {label}
      </label>
    )}
    <div className="relative flex items-center min-h-[40px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-3 pr-8 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer leading-normal"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
    </div>
  </div>
);

/* =========================================================================
   ELM-SEL-02 : 선택 필터 드롭다운 (입력값에 따른 실시간 필터 및 선택, 상시 ✕)
   ========================================================================= */
export const ElmSel02: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string; subtext?: string }>;
  label?: string;
  placeholder?: string;
  className?: string;
}> = ({
  value,
  onChange,
  options,
  label,
  placeholder = '검색 또는 선택...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(filterText.toLowerCase()) ||
      (opt.subtext && opt.subtext.toLowerCase().includes(filterText.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optVal: string, optLabel: string) => {
    onChange(optVal);
    setFilterText(optLabel);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setFilterText('');
  };

  return (
    <div ref={containerRef} className={`w-full relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 leading-none">
          {label}
        </label>
      )}
      <div className="relative flex items-center min-h-[40px]">
        <input
          type="text"
          value={isOpen ? filterText : selectedOption ? selectedOption.label : filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedOption) setFilterText(selectedOption.label);
          }}
          placeholder={placeholder}
          className="w-full h-10 pl-3 pr-16 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 leading-normal"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {(value || filterText) && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="선택 초기화"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 scroll-smooth">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value, opt.label)}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 hover:bg-indigo-50/70 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.subtext && (
                    <span className="text-[10px] text-slate-400 shrink-0">{opt.subtext}</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">
              일치하는 목록이 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   ELM-FLT-01 : 필터 선택 칩 (whitespace-nowrap, 수직 100% 중앙 정렬)
   ========================================================================= */
export const ElmFlt01: React.FC<{
  label: string;
  selected?: boolean;
  count?: number;
  onClick: () => void;
  className?: string;
}> = ({ label, selected = false, count, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-full border transition-all whitespace-nowrap cursor-pointer select-none leading-none ${
      selected
        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs'
        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
    } ${className}`}
  >
    <span className="leading-none">{label}</span>
    {typeof count === 'number' && (
      <span
        className={`px-1.5 py-0.2 rounded-full text-[10px] leading-tight font-bold ${
          selected ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

/* =========================================================================
   ELM-RAD-01 / ELM-CHK-01 : 라디오 & 체크박스 (텍스트 클릭 영역 전체 연동)
   ========================================================================= */
export const ElmChk01: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}> = ({ checked, onChange, label, description, disabled = false, className = '' }) => (
  <label
    onClick={() => !disabled && onChange(!checked)}
    className={`inline-flex items-center gap-2.5 cursor-pointer select-none min-h-[36px] py-1 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-600'
    } ${className}`}
  >
    <div
      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
        checked
          ? 'bg-indigo-600 border-indigo-600 text-white'
          : 'bg-white border-slate-300 hover:border-indigo-400'
      }`}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </div>
    <div className="flex flex-col justify-center">
      <span className="text-xs font-medium text-slate-800 leading-none break-keep">
        {label}
      </span>
      {description && (
        <span className="text-[10px] text-slate-400 mt-1 break-keep">{description}</span>
      )}
    </div>
  </label>
);

export const ElmRad01: React.FC<{
  selected: boolean;
  onSelect: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
}> = ({ selected, onSelect, label, disabled = false, className = '' }) => (
  <label
    className={`inline-flex items-center gap-2.5 cursor-pointer select-none min-h-[36px] py-1 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-600'
    } ${className}`}
    onClick={() => !disabled && onSelect()}
  >
    <div
      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
        selected
          ? 'border-indigo-600 bg-white'
          : 'border-slate-300 bg-white hover:border-indigo-400'
      }`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
    </div>
    <span className="text-xs font-medium text-slate-800 leading-none break-keep">
      {label}
    </span>
  </label>
);

/* =========================================================================
   ELM-SWT-01 : 토글 스위치 (라벨/텍스트 클릭 영역 전체 연동)
   ========================================================================= */
export const ElmSwt01: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  description?: string;
  className?: string;
}> = ({ checked, onChange, label, description, className = '' }) => (
  <label
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between gap-3 min-h-[36px] cursor-pointer select-none py-1 ${className}`}
  >
    {label && (
      <div className="flex flex-col justify-center">
        <span className="text-xs font-semibold text-slate-800 leading-none break-keep">
          {label}
        </span>
        {description && (
          <span className="text-[10px] text-slate-400 mt-1 break-keep">{description}</span>
        )}
      </div>
    )}
    <div
      role="switch"
      aria-checked={checked}
      className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shrink-0 ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 left-0.5 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </div>
  </label>
);

/* =========================================================================
   ELM-CNT-01 : 건수 뱃지 (whitespace-nowrap)
   ========================================================================= */
export const ElmCnt01: React.FC<{ count: number | string; label?: string }> = ({
  count,
  label,
}) => (
  <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 leading-none whitespace-nowrap">
    {label && <span className="text-[10px] text-slate-400">{label}</span>}
    <span>{count}</span>
  </span>
);

/* =========================================================================
   ELM-STT-01 : 상태 Pills 뱃지 6종 (Emerald, Amber, Rose, Purple, Indigo, Slate)
   ========================================================================= */
export type ElmStatusType =
  | 'EMERALD' // 완료 / 승인
  | 'AMBER'   // 대기 / 보정
  | 'ROSE'    // 반려 / 실패
  | 'PURPLE'  // 자산이동
  | 'INDIGO'  // 진행중
  | 'SLATE';  // 개인 / 기본대기

export const ElmStt01: React.FC<{
  type: ElmStatusType;
  label: string;
  icon?: React.ReactNode;
}> = ({ type, label, icon }) => {
  const styles: Record<ElmStatusType, string> = {
    EMERALD: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    AMBER: 'bg-amber-50 text-amber-700 border-amber-200/80',
    ROSE: 'bg-rose-50 text-rose-700 border-rose-200/80',
    PURPLE: 'bg-purple-50 text-purple-700 border-purple-200/80',
    INDIGO: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    SLATE: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border leading-none whitespace-nowrap shrink-0 ${styles[type]}`}
    >
      {icon && <span className="w-3 h-3 flex items-center justify-center shrink-0">{icon}</span>}
      <span className="leading-none">{label}</span>
    </span>
  );
};

/* =========================================================================
   ELM-TRE-01 : 목록 데이터 트리 (뷰 모드 & 인라인 편집 모드)
   ========================================================================= */
export interface TreeNode {
  id: string;
  name: string;
  count?: number;
  amount?: number;
  children?: TreeNode[];
}

export const ElmTre01: React.FC<{
  data: TreeNode[];
  isEditMode: boolean;
  onSaveNode?: (id: string, newName: string) => void;
  onDeleteNode?: (id: string) => void;
  onAddChildNode?: (parentId: string) => void;
}> = ({ data, isEditMode, onSaveNode, onDeleteNode, onAddChildNode }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ '1': true, '2': true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEdit = (node: TreeNode) => {
    setEditingId(node.id);
    setEditVal(node.name);
  };

  const handleSave = (id: string) => {
    if (onSaveNode) onSaveNode(id, editVal);
    setEditingId(null);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      const isExpanded = expandedIds[node.id] ?? false;
      const hasChildren = node.children && node.children.length > 0;
      const isEditing = editingId === node.id;

      return (
        <div key={node.id} className="w-full">
          <div
            className={`flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all text-xs ${
              depth > 0 ? 'ml-4' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isEditMode && (
                <span className="cursor-grab text-slate-400 hover:text-slate-600">
                  <Menu className="w-3.5 h-3.5" />
                </span>
              )}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ) : (
                <div className="w-4.5" />
              )}

              {isEditing ? (
                <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                  <input
                    type="text"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    className="h-7 px-2 text-xs bg-white border border-indigo-400 rounded focus:outline-none flex-1"
                  />
                  <button
                    onClick={() => handleSave(node.id)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-semibold"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-1.5 py-1 text-slate-500 rounded text-[10px]"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <span className="font-medium text-slate-800 truncate leading-none">
                  {node.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {node.count !== undefined && <ElmCnt01 count={`${node.count}건`} />}
              {node.amount !== undefined && (
                <span className="font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                  ₩{node.amount.toLocaleString()}
                </span>
              )}

              {isEditMode && !isEditing && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(node)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600"
                    title="이름 수정"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {onAddChildNode && (
                    <button
                      onClick={() => onAddChildNode(node.id)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-600"
                      title="하위 항목 추가"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  {onDeleteNode && (
                    <button
                      onClick={() => onDeleteNode(node.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="border-l border-slate-200 ml-3 pl-1">
              {renderTree(node.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-3 space-y-1">
      {renderTree(data)}
    </div>
  );
};

/* =========================================================================
   ELM-FAB-01 : 우측 하단 펼침기능 맨위로 FAB (Speed Dial + Top 🔝)
   ========================================================================= */
export const ElmFab01: React.FC<{
  onTopClick?: () => void;
  onOcrClick?: () => void;
  onQuickExpenseClick?: () => void;
  onQuickDutyClick?: () => void;
}> = ({ onTopClick, onOcrClick, onQuickExpenseClick, onQuickDutyClick }) => {
  const [expanded, setExpanded] = useState(false);

  const scrollToTop = () => {
    if (onTopClick) onTopClick();
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {/* Speed Dial Menu Items */}
      {expanded && (
        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => {
              setExpanded(false);
              onOcrClick && onOcrClick();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-transform hover:scale-105"
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>📷 OCR 영수증 스캔</span>
          </button>
          <button
            onClick={() => {
              setExpanded(false);
              onQuickExpenseClick && onQuickExpenseClick();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-transform hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>➕ 빠른 지출등록</span>
          </button>
          <button
            onClick={() => {
              setExpanded(false);
              onQuickDutyClick && onQuickDutyClick();
            }}
            className="flex items-center gap-2 px-3 py-2 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-lg border border-slate-200 hover:bg-slate-50 transition-transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>🧹 당번 빠른수행</span>
          </button>
        </div>
      )}

      {/* Main Action Circle Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={scrollToTop}
          title="화면 맨 위로"
          className="w-10 h-10 rounded-full bg-white text-slate-700 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all hover:scale-105"
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform hover:scale-105 ${
            expanded ? 'bg-slate-800 rotate-45' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          title="빠른 기능 열기"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   ELM-PRF-01 / ELM-PRF-02 : 프로필 아바타 그룹 (32px, 48px, 64px + 수정 뱃지)
   ========================================================================= */
export const ElmPrf01: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
  name?: string;
  hasEditBadge?: boolean;
  onEditClick?: () => void;
}> = ({ size = 'md', imageUrl, name = '구본영', hasEditBadge = false, onEditClick }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const badgeSizeClasses = {
    sm: 'w-4 h-4 p-0.5',
    md: 'w-5 h-5 p-1',
    lg: 'w-6 h-6 p-1.5',
  };

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center border-2 border-white shadow-sm leading-none`}
        >
          {name.slice(0, 1)}
        </div>
      )}

      {hasEditBadge && (
        <button
          type="button"
          onClick={onEditClick}
          className={`absolute -bottom-1 -right-1 ${badgeSizeClasses[size]} rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center`}
          title="사진 변경"
        >
          <Camera className="w-full h-full" />
        </button>
      )}
    </div>
  );
};

/* =========================================================================
   ELM-STP-01 : 수평 진행상태 스테퍼 (Step 1 ➔ Step 2 ➔ Step 3)
   ========================================================================= */
export const ElmStp01: React.FC<{
  currentStep: number; // 1, 2, 3
  steps?: Array<{ number: number; label: string }>;
  className?: string;
}> = ({
  currentStep = 1,
  steps = [
    { number: 1, label: '할당 완료' },
    { number: 2, label: '사진 인증' },
    { number: 3, label: '최종 승인' },
  ],
  className = '',
}) => (
  <div className={`w-full flex items-center justify-between gap-1 sm:gap-2 ${className}`}>
    {steps.map((st, idx) => {
      const isCompleted = currentStep > st.number;
      const isCurrent = currentStep === st.number;

      return (
        <React.Fragment key={st.number}>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 shrink-0">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                isCompleted
                  ? 'bg-emerald-600 text-white'
                  : isCurrent
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.number}
            </div>
            <span
              className={`text-[10px] sm:text-xs text-center sm:text-left break-keep sm:whitespace-nowrap leading-tight max-w-[76px] sm:max-w-none ${
                isCurrent
                  ? 'font-bold text-slate-900'
                  : isCompleted
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-400'
              }`}
            >
              {st.label}
            </span>
          </div>

          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 min-w-[10px] mx-1 sm:mx-2 rounded transition-colors ${
                currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* =========================================================================
   ELM-TAB-01 : 탭 네비게이션 컨텐츠 (모바일 가로폭주 방지: overflow-x-auto no-scrollbar)
   ========================================================================= */
export const ElmTab01: React.FC<{
  tabs: Array<{ id: string; label: string; count?: number }>;
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onTabChange, className = '' }) => (
  <div
    className={`w-full max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex items-center border-b border-slate-200 bg-white shrink-0 scroll-smooth ${className}`}
  >
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`relative px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          )}
          {isActive && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-t" />
          )}
        </button>
      );
    })}
  </div>
);

/* =========================================================================
   ELM-SLD-01 / ELM-SLD-02 : 슬라이드 휠 트랙 (기본형 & 좌우 이동버튼형)
   ========================================================================= */
export const ElmSld02: React.FC<{
  children: React.ReactNode;
  showNavButtons?: boolean;
}> = ({ children, showNavButtons = true }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full group">
      {showNavButtons && (
        <>
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all opacity-80 group-hover:opacity-100"
            title="왼쪽 이동"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all opacity-80 group-hover:opacity-100"
            title="오른쪽 이동"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      <div
        ref={trackRef}
        className="w-full flex items-center gap-3 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar snap-x snap-mandatory"
      >
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   ELM-SLD-03 : 슬라이드드래그휠(버튼) - 가로스크롤바 제거, 드래그 자석, 휠 변환, 클릭 버튼, 이벤트 전파 차단
   ========================================================================= */
export const ElmSld03: React.FC<{
  children: React.ReactNode;
  showNavButtons?: boolean;
  stepWidth?: number;
  className?: string;
}> = ({ children, showNavButtons = true, stepWidth = 240, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // 휠 이벤트: 상하 휠을 가로 이동으로 변환 & 배경 스크롤 전파 완전 차단
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      el.scrollLeft += delta * 1.2;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 자석(Magnetic Snap) 효과: 가장 가까운 자식 요소 위치로 부드럽게 정렬
  const snapToNearest = () => {
    const el = containerRef.current;
    if (!el) return;

    const childrenElements = Array.from(el.children) as HTMLElement[];
    if (childrenElements.length === 0) return;

    const currentScroll = el.scrollLeft;
    let closestOffset = 0;
    let minDiff = Infinity;

    childrenElements.forEach((child) => {
      const offset = child.offsetLeft - el.offsetLeft;
      const diff = Math.abs(currentScroll - offset);
      if (diff < minDiff) {
        minDiff = diff;
        closestOffset = offset;
      }
    });

    el.scrollTo({ left: closestOffset, behavior: 'smooth' });
  };

  // 마우스 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDown.current = true;
    setIsDragging(true);
    const el = containerRef.current;
    if (!el) return;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.stopPropagation();
    isDown.current = false;
    setIsDragging(false);
    snapToNearest();
  };

  const handleMouseLeave = () => {
    if (isDown.current) {
      isDown.current = false;
      setIsDragging(false);
      snapToNearest();
    }
  };

  // 터치(모바일) 드래그 핸들러
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    touchStartX.current = e.touches[0].pageX;
    touchScrollLeft.current = el.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const x = e.touches[0].pageX;
    const walk = (x - touchStartX.current) * 1.2;
    el.scrollLeft = touchScrollLeft.current - walk;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    snapToNearest();
  };

  // 버튼 명시적 클릭 이동 (한 개 요소/stepWidth 단위)
  const handleNavPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -stepWidth, behavior: 'smooth' });
    }
  };

  const handleNavNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: stepWidth, behavior: 'smooth' });
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`relative w-full group select-none ${className}`}
    >
      {showNavButtons && (
        <>
          <button
            type="button"
            onClick={handleNavPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 z-20 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-all opacity-85 group-hover:opacity-100 cursor-pointer"
            title="이전 항목 (1개 이동)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNavNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 z-20 w-8 h-8 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-all opacity-85 group-hover:opacity-100 cursor-pointer"
            title="다음 항목 (1개 이동)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* 가로스크롤바 표시 완전 제거 (no-scrollbar), 자석 snap, 드래그 & 휠 지원 */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full flex items-center gap-3 overflow-x-auto py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
      >
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   ELM-BSH-01 : 모바일 바텀시트 모달 (프로그레시브 디스클로저)
   ========================================================================= */
export const ElmBsh01: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 leading-none">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

/* =========================================================================
   ELM-NAV-01 : 모바일 하단 네비게이션 바 (터치 44px+ 보장 & 다크/라이트 테마 완벽 연동)
   ========================================================================= */
export const ElmNav01: React.FC<{
  activeItem: string;
  onSelect: (item: string) => void;
  items: Array<{ id: string; label: string; icon: React.ReactNode }>;
  className?: string;
}> = ({ activeItem, onSelect, items, className = '' }) => (
  <nav
    className={`h-16 flex items-center justify-around px-2 w-full transition-colors border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-300 shadow-lg ${className}`}
  >
    {items.map((item) => {
      const isActive = activeItem === item.id;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
            isActive
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
          <span className="text-[10px] mt-1 leading-none">{item.label}</span>
        </button>
      );
    })}
  </nav>
);

/* =========================================================================
   ELM-OFF-01 : 오프라인 인디케이터 바 & Sync Pending 뱃지 (차분한 로우톤 슬레이트 그레이)
   ========================================================================= */
export const ElmOff01: React.FC<{
  isOffline: boolean;
  pendingCount?: number;
}> = ({ isOffline, pendingCount = 0 }) => {
  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className="w-full bg-slate-700 dark:bg-slate-800 border-b border-slate-600 dark:border-slate-700 text-slate-200 text-xs font-medium py-1.5 px-4 flex items-center justify-between shadow-xs sticky top-0 z-50 leading-none transition-colors">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <WifiOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-200">
          오프라인 모드 활성화됨 : 네트워크 재연결 시 등록 내역이 자동 동기화됩니다.
        </span>
        {pendingCount > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-600 dark:bg-slate-700 text-slate-200 text-[11px] font-semibold">
            동기화 대기 {pendingCount}건
          </span>
        )}
      </div>
    </div>
  );
};
