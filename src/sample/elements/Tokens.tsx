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
  Minus,
  Trash2,
  Edit2,
  Menu,
  WifiOff,
  Clock,
  Sparkles,
  Copy,
  HelpCircle,
  Zap,
  GripHorizontal,
  Coins,
  Info,
  AlertCircle,
  Flag,
  CornerDownRight,
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
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-none flex items-center break-keep">
        {title}
      </h2>
      {badge && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 leading-none whitespace-nowrap shrink-0">
          {badge}
        </span>
      )}
    </div>
    {subtitle && (
      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal break-keep">{subtitle}</p>
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
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  inputMode?: 'text' | 'none' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  lang?: string;
}> = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  label,
  disabled = false,
  className = '',
  onFocus,
  inputMode,
  lang,
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
        lang={lang}
        inputMode={inputMode}
        onFocus={onFocus}
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
   ELM-CMB-01 : 선택 및 직접입력 콤보박스 (Editable Combobox / 목록 선택 + 자유 직접입력)
   ========================================================================= */
export interface ElmCmbOption {
  value: string;
  label: string;
  icon?: string;
  subtext?: string;
  isAction?: boolean;
}

export const ElmCmb01: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: ElmCmbOption[];
  onSelectOption?: (option: ElmCmbOption) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  selectedIcon?: string;
  onIconChange?: (icon: string) => void;
  availableIcons?: string[];
  size?: 'sm' | 'md';
  onActionClick?: (actionVal: string) => void;
}> = ({
  value,
  onChange,
  options,
  onSelectOption,
  placeholder = '직접 입력 또는 선택...',
  label,
  className = '',
  disabled = false,
  selectedIcon,
  onIconChange,
  size = 'md',
  onActionClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 250,
  });

  const isSmall = size === 'sm';

  const updateDropdownPos = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetWidth = isSmall ? 250 : Math.max(250, rect.width);
      let left = isSmall ? rect.left - (targetWidth - rect.width) / 2 : rect.left;
      // 화면 밖으로 벗어나지 않도록 좌우 마진 12px 방어
      left = Math.max(12, Math.min(window.innerWidth - targetWidth - 12, left));

      // 화면 하단 넘침 방지 (공간 부족 시 상단으로 전개)
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow < 240 && rect.top > 240 ? rect.top - 240 - 4 : rect.bottom + 4;

      setDropdownPos({ top, left, width: targetWidth });
    }
  };

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateDropdownPos();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => {
      updateDropdownPos();
    };
    window.addEventListener('scroll', handleReposition, { passive: true, capture: true });
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, { capture: true });
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, isSmall]);

  const handleSelect = (opt: ElmCmbOption) => {
    if (opt.isAction) {
      if (onActionClick) onActionClick(opt.value);
      setIsOpen(false);
      return;
    }
    onChange(opt.label);
    if (opt.icon && onIconChange) {
      onIconChange(opt.icon);
    }
    if (onSelectOption) {
      onSelectOption(opt);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 leading-none">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 ${
          isSmall ? 'min-h-[28px] h-7' : 'min-h-[40px] h-10'
        } ${disabled ? 'bg-slate-100 dark:bg-zinc-900 opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* 선두 아이콘 (아이콘 목록 불필요로 단독 깔끔 표시) */}
        {selectedIcon && (
          <div className="relative shrink-0 flex items-center">
            <span
              className={`flex items-center justify-center select-none ${
                isSmall ? 'pl-1.5 pr-0.5 text-xs' : 'pl-2.5 pr-1 text-sm'
              }`}
            >
              {selectedIcon}
            </span>
          </div>
        )}

        {/* 직접 입력 인풋 필드 */}
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 min-w-0 h-full bg-transparent text-slate-900 dark:text-zinc-100 outline-none leading-normal font-medium ${
            isSmall
              ? `text-[10px] ${selectedIcon ? 'pl-0.5 pr-7' : 'px-1.5 pr-7'}`
              : `text-sm ${selectedIcon ? 'pl-1 pr-12' : 'pl-3 pr-12'}`
          } placeholder-slate-400 dark:placeholder-zinc-500`}
        />

        {/* 우측 클리어 및 드롭다운 토글 버튼 */}
        <div className={`absolute right-1 flex items-center ${isSmall ? 'gap-0.5' : 'gap-1'}`}>
          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className={`flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer ${
                isSmall ? 'w-3.5 h-3.5' : 'w-5 h-5'
              }`}
              title="지우기"
            >
              <X className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggleOpen}
            className={`flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer ${
              isSmall ? 'w-3.5 h-3.5' : 'w-6 h-6'
            }`}
            title="목록 열기/닫기"
          >
            <ChevronDown
              className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 선택목록 드롭다운 (가로 250px 확장 & position:fixed + z-[100]으로 아래 영역에 절대 가려지지 않음) */}
      {isOpen && (
        <>
          {/* 외부 클릭 감지 백드롭 */}
          <div
            className="fixed inset-0 z-[90]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: `${dropdownPos.top}px`,
              left: `${dropdownPos.left}px`,
              width: `${dropdownPos.width}px`,
              zIndex: 100,
            }}
            className="max-h-60 overflow-y-auto bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-2xl py-1 scroll-smooth animate-in fade-in zoom-in-95"
          >
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected = opt.label === value;
                return (
                  <button
                    key={opt.value || opt.label}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer ${
                      opt.isAction
                        ? 'border-t border-slate-100 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold mt-1 pt-2'
                        : isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <span className="font-semibold truncate">{opt.label}</span>
                    </div>
                    {opt.subtext && (
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 font-normal">
                        {opt.subtext}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">선택 목록이 없습니다</div>
            )}
          </div>
        </>
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
  onMoveNode?: (draggedId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
  onDataChange?: (newData: TreeNode[]) => void;
}> = ({ data, isEditMode, onSaveNode, onDeleteNode, onAddChildNode, onMoveNode, onDataChange }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({ '1': true, '2': true });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  // 드래그 앤 드롭 이동 상태 및 실시간 위치 표시 플래그 상태
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverInfo, setDragOverInfo] = useState<{
    targetId: string;
    position: 'before' | 'after' | 'inside';
    isInvalid?: boolean;
  } | null>(null);

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

  // 특정 노드가 검색 대상 노드의 자식/후손인지 검사 (순환 참조 방지)
  const isNodeDescendant = (nodes: TreeNode[], parentId: string, searchId: string): boolean => {
    for (const n of nodes) {
      if (n.id === parentId) {
        return checkContains(n.children || [], searchId);
      }
      if (n.children && isNodeDescendant(n.children, parentId, searchId)) {
        return true;
      }
    }
    return false;
  };

  const checkContains = (nodes: TreeNode[], targetId: string): boolean => {
    for (const n of nodes) {
      if (n.id === targetId) return true;
      if (n.children && checkContains(n.children, targetId)) return true;
    }
    return false;
  };

  // 트리 재배치 순수 함수 (상위 노드, 다른 경로, 자식 노드로 이동)
  const moveTreeNode = (
    tree: TreeNode[],
    draggedId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ): TreeNode[] => {
    let extractedNode: TreeNode | null = null;

    // 1. 기존 위치에서 드래그 노드 추출
    const remove = (nodes: TreeNode[]): TreeNode[] => {
      const res: TreeNode[] = [];
      for (const n of nodes) {
        if (n.id === draggedId) {
          extractedNode = JSON.parse(JSON.stringify(n));
        } else {
          const item = { ...n };
          if (item.children) {
            item.children = remove(item.children);
          }
          res.push(item);
        }
      }
      return res;
    };

    const cleanedTree = remove(tree);
    if (!extractedNode) return tree;

    // 2. 대상 위치에 삽입
    const insert = (nodes: TreeNode[]): TreeNode[] => {
      const res: TreeNode[] = [];
      for (const n of nodes) {
        if (n.id === targetId) {
          if (position === 'before') {
            res.push(extractedNode!);
            res.push(n);
          } else if (position === 'after') {
            res.push(n);
            res.push(extractedNode!);
          } else if (position === 'inside') {
            const item = { ...n };
            item.children = [...(item.children || []), extractedNode!];
            res.push(item);
          }
        } else {
          const item = { ...n };
          if (item.children) {
            item.children = insert(item.children);
          }
          res.push(item);
        }
      }
      return res;
    };

    return insert(cleanedTree);
  };

  const renderTree = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      const isExpanded = expandedIds[node.id] ?? false;
      const hasChildren = node.children && node.children.length > 0;
      const isEditing = editingId === node.id;
      const isBeingDragged = draggedNodeId === node.id;
      const isDragOver = dragOverInfo?.targetId === node.id;
      const dropPos = isDragOver ? dragOverInfo.position : null;
      const isInvalidDrop = isDragOver && dragOverInfo.isInvalid;

      return (
        <div key={node.id} className="w-full relative select-none">
          {/* 1. 상단 삽입 위치 표시 플래그 (▲ 이 노드 앞에 삽입) */}
          {isDragOver && dropPos === 'before' && !isInvalidDrop && (
            <div className="absolute -top-2.5 left-0 right-0 z-30 flex items-center gap-1.5 pointer-events-none px-2 animate-in fade-in">
              <div className="h-0.5 bg-indigo-600 dark:bg-indigo-400 flex-1 rounded-full shadow-xs" />
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md animate-bounce">
                <Flag className="w-2.5 h-2.5 fill-current" />
                <span>▲ [위치 플래그] '{node.name}' 앞에 삽입</span>
              </span>
              <div className="h-0.5 bg-indigo-600 dark:bg-indigo-400 w-6 rounded-full" />
            </div>
          )}

          {/* 2. 무효 이동 경고 플래그 (🚫 자기 자신 또는 하위 경로) */}
          {isDragOver && isInvalidDrop && (
            <div className="absolute -top-2.5 left-0 right-0 z-30 flex items-center gap-1.5 pointer-events-none px-2 animate-in fade-in">
              <div className="h-0.5 bg-rose-500 flex-1 rounded-full shadow-xs" />
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>🚫 이동 불가 (자기 자신 또는 하위 경로)</span>
              </span>
              <div className="h-0.5 bg-rose-500 w-6 rounded-full" />
            </div>
          )}

          {/* 노드 행 컨테이너 */}
          <div
            onDragOver={(e) => {
              if (!isEditMode || !draggedNodeId) return;
              e.preventDefault();
              e.stopPropagation();

              if (draggedNodeId === node.id) {
                setDragOverInfo(null);
                return;
              }

              const isInvalid = isNodeDescendant(data, draggedNodeId, node.id);
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetY = e.clientY - rect.top;
              const ratio = offsetY / rect.height;

              let pos: 'before' | 'after' | 'inside' = 'inside';
              if (ratio < 0.28) {
                pos = 'before';
              } else if (ratio > 0.72) {
                pos = 'after';
              } else {
                pos = 'inside';
              }

              setDragOverInfo({
                targetId: node.id,
                position: pos,
                isInvalid,
              });
            }}
            onDragLeave={(e) => {
              if (dragOverInfo?.targetId === node.id) {
                const rect = e.currentTarget.getBoundingClientRect();
                if (
                  e.clientY < rect.top ||
                  e.clientY > rect.bottom ||
                  e.clientX < rect.left ||
                  e.clientX > rect.right
                ) {
                  setDragOverInfo(null);
                }
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!draggedNodeId || !dragOverInfo) return;
              const { targetId, position, isInvalid } = dragOverInfo;
              setDraggedNodeId(null);
              setDragOverInfo(null);

              if (isInvalid || draggedNodeId === targetId) return;

              const newTree = moveTreeNode(data, draggedNodeId, targetId, position);
              if (position === 'inside') {
                setExpandedIds((prev) => ({ ...prev, [targetId]: true }));
              }
              if (onMoveNode) onMoveNode(draggedNodeId, targetId, position);
              if (onDataChange) onDataChange(newTree);
            }}
            className={`flex items-center justify-between p-2 rounded-lg border transition-all text-xs relative ${
              depth > 0 ? 'ml-4' : ''
            } ${
              isBeingDragged
                ? 'opacity-40 bg-slate-100 dark:bg-zinc-800 border-dashed border-indigo-400'
                : isDragOver && dropPos === 'inside' && !isInvalidDrop
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-sm'
                : isDragOver && isInvalidDrop
                ? 'border-rose-400 bg-rose-50/60 dark:bg-rose-950/30'
                : 'border-transparent hover:border-slate-200 dark:hover:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
            }`}
          >
            {/* 3. 하위 자식 노드로 편입 플래그 (↳ 자식 노드로 이동) */}
            {isDragOver && dropPos === 'inside' && !isInvalidDrop && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md animate-pulse">
                <CornerDownRight className="w-2.5 h-2.5" />
                <span>🚩 [위치 플래그] '{node.name}'의 하위(자식) 노드로 이동</span>
              </div>
            )}

            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isEditMode && (
                <span
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggedNodeId(node.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', node.id);
                  }}
                  onDragEnd={() => {
                    setDraggedNodeId(null);
                    setDragOverInfo(null);
                  }}
                  className="cursor-grab active:cursor-grabbing p-1 -m-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                  title="드래그하여 항목의 위치 및 상위/하위 경로를 수정하세요"
                >
                  <Menu className="w-3.5 h-3.5" />
                </span>
              )}

              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
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
                    className="h-7 px-2 text-xs bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-indigo-400 rounded focus:outline-none flex-1"
                  />
                  <button
                    onClick={() => handleSave(node.id)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-semibold cursor-pointer"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-1.5 py-1 text-slate-500 rounded text-[10px] cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <span className="font-medium text-slate-800 dark:text-zinc-200 truncate leading-none">
                  {node.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {node.count !== undefined && <ElmCnt01 count={`${node.count}건`} />}
              {node.amount !== undefined && (
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                  ₩{node.amount.toLocaleString()}
                </span>
              )}

              {isEditMode && !isEditing && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(node)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    title="이름 수정"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {onAddChildNode && (
                    <button
                      onClick={() => onAddChildNode(node.id)}
                      className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                      title="하위 항목 추가"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                  {onDeleteNode && (
                    <button
                      onClick={() => onDeleteNode(node.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 4. 하단 삽입 위치 표시 플래그 (▼ 이 노드 뒤에 삽입) */}
          {isDragOver && dropPos === 'after' && !isInvalidDrop && (
            <div className="absolute -bottom-2.5 left-0 right-0 z-30 flex items-center gap-1.5 pointer-events-none px-2 animate-in fade-in">
              <div className="h-0.5 bg-indigo-600 dark:bg-indigo-400 flex-1 rounded-full shadow-xs" />
              <span className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-md animate-bounce">
                <Flag className="w-2.5 h-2.5 fill-current" />
                <span>▼ [위치 플래그] '{node.name}' 뒤에 삽입</span>
              </span>
              <div className="h-0.5 bg-indigo-600 dark:bg-indigo-400 w-6 rounded-full" />
            </div>
          )}

          {hasChildren && isExpanded && (
            <div className="border-l border-slate-200 dark:border-zinc-800 ml-3 pl-1">
              {renderTree(node.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div className="w-full bg-white dark:bg-[#121215] border border-slate-200 dark:border-zinc-800 rounded-xl p-3 space-y-1">
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
}> = ({ tabs, activeTab, onTabChange, className = '' }) => {
  const tabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tabRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const rawDelta = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
      if (rawDelta === 0) return;

      const isAtStart = el.scrollLeft <= 1;
      const isAtEnd = el.scrollLeft >= Math.floor(el.scrollWidth - el.clientWidth) - 2;

      // 첫 아이템 도달 후 좌측 스크롤이거나 끝 아이템 도달 후 우측 스크롤 시 화면 상하 스크롤 허용
      if ((isAtStart && rawDelta < 0) || (isAtEnd && rawDelta > 0)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += rawDelta;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      ref={tabRef}
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
};

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
  innerClassName?: string;
  externalRef?: React.RefObject<HTMLDivElement | null>;
}> = ({
  children,
  showNavButtons = true,
  stepWidth = 240,
  className = '',
  innerClassName = '',
  externalRef,
}) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  const setRef = (el: HTMLDivElement | null) => {
    (localContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (externalRef && 'current' in externalRef) {
      (externalRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
    setNode(el);
  };

  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // 휠 이벤트: DOM 레벨에서 { passive: false }로 리스너를 바인딩하여 정밀 제어
  useEffect(() => {
    if (!node) return;

    const handleWheel = (e: WheelEvent) => {
      // 1. 수평 스크롤 필요성 검사: 전체 노드가 한 화면에 다 보여서 좌우 스크롤할 여지가 없는 경우
      // 브라우저 기본 화면 상하 스크롤이 자연스럽게 동작하도록 즉시 통과
      const canScroll = node.scrollWidth > node.clientWidth + 2;
      if (!canScroll) {
        return;
      }

      const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (rawDelta === 0) return;

      const isAtStart = node.scrollLeft <= 2;
      const isAtEnd = node.scrollLeft >= Math.floor(node.scrollWidth - node.clientWidth) - 2;

      // 2. 휠 이벤트 시 첫 항목(위/좌측) 또는 마지막 항목(아래/우측) 도달한 경우 화면 스크롤 이벤트로 통과
      if ((isAtStart && rawDelta < 0) || (isAtEnd && rawDelta > 0)) {
        return;
      }

      // 3. 첫 항목, 마지막 항목에 도달하지 않은 슬라이드 구간에서는 화면 스크롤 차단 및 수평 슬라이드 수행
      e.preventDefault();
      e.stopPropagation();

      const multiplier = e.deltaMode === 1 ? 24 : 1;
      node.scrollLeft += rawDelta * multiplier;
    };

    node.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [node]);

  // 전역 마우스 업 감지 (컨테이너 밖에서 마우스 뗄 때 안전 복원)
  useEffect(() => {
    const onWindowMouseUp = () => {
      if (isDown.current) {
        isDown.current = false;
        setIsDragging(false);
      }
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, []);

  // 마우스 드래그 핸들러 (자석 기능 해제: 드래그한 위치에 자연스럽게 유지)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    hasDraggedRef.current = false;
    setIsDragging(true);
    if (!node) return;
    startXRef.current = e.pageX - node.offsetLeft;
    scrollLeftRef.current = node.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !node) return;
    const x = e.pageX - node.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
      node.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleMouseUp = () => {
    if (!isDown.current) return;
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDown.current) {
      isDown.current = false;
      setIsDragging(false);
    }
  };

  // 터치(모바일) 드래그 핸들러
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchScrollLeft = useRef(0);
  const isHorizontalTouch = useRef<boolean | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!node) return;
    touchStartX.current = e.touches[0].pageX;
    touchStartY.current = e.touches[0].pageY;
    touchScrollLeft.current = node.scrollLeft;
    hasDraggedRef.current = false;
    isHorizontalTouch.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!node) return;
    const x = e.touches[0].pageX;
    const y = e.touches[0].pageY;
    const diffX = x - touchStartX.current;
    const diffY = y - touchStartY.current;

    if (isHorizontalTouch.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontalTouch.current = Math.abs(diffX) > Math.abs(diffY);
    }

    if (isHorizontalTouch.current) {
      hasDraggedRef.current = true;
      node.scrollLeft = touchScrollLeft.current - diffX * 1.2;
    }
  };

  const handleTouchEnd = () => {
    isHorizontalTouch.current = null;
  };

  // 버튼 명시적 클릭 이동 (한 개 요소/stepWidth 단위)
  const handleNavPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node) {
      node.scrollBy({ left: -stepWidth, behavior: 'smooth' });
    }
  };

  const handleNavNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node) {
      node.scrollBy({ left: stepWidth, behavior: 'smooth' });
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#1a1a1e] shadow-lg border border-slate-200 dark:border-[#27272a] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-[#27272a] transition-all opacity-85 group-hover:opacity-100 cursor-pointer"
            title="이전 항목 (1개 이동)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNavNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-[#1a1a1e] shadow-lg border border-slate-200 dark:border-[#27272a] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-[#27272a] transition-all opacity-85 group-hover:opacity-100 cursor-pointer"
            title="다음 항목 (1개 이동)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* 가로스크롤바 표시 완전 제거 (no-scrollbar), 자석 snap 해제, 드래그 & 휠 즉각 반영, 경계 도달 시 상하 스크롤 연동 */}
      <div
        ref={setRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClickCapture={(e) => {
          if (hasDraggedRef.current) {
            e.stopPropagation();
            e.preventDefault();
            hasDraggedRef.current = false;
          }
        }}
        className={`w-full flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [scroll-snap-type:none] snap-none touch-pan-x ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        } ${innerClassName}`}
        style={{
          scrollBehavior: 'auto',
          scrollSnapType: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/* =========================================================================
   ELM-RNG-01 : 상태바 증감드래그휠 컴포넌트 (표준화)
   - 좌우 [-] / [+] 버튼 내장 (min/max 한계 도달 시 비활성화)
   - input[type="range"] 슬라이더 내장 (터치 & 포인터 드래그 전파 차단)
   - 마우스 휠 이벤트 내장: 상하 휠 스크롤 시 step 단위 증감 & 배경 스크롤 전파 차단
   - 숫자 직접 입력 input 연동
   - 테마 연동: indigo, rose, emerald, sky 등
   ========================================================================= */
export const ElmRng01: React.FC<{
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  colorScheme?: 'indigo' | 'rose' | 'emerald' | 'sky';
  label?: string;
  labelExtra?: React.ReactNode;
  showInput?: boolean;
  className?: string;
  disabled?: boolean;
  title?: string;
}> = ({
  value,
  min,
  max,
  step = 1,
  unit = '명',
  onChange,
  colorScheme = 'indigo',
  label,
  labelExtra,
  showInput = true,
  className = '',
  disabled = false,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 휠 이벤트: DOM passive: false 리스너로 브라우저 상하 스크롤 원천 차단 + 값 증감
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      if (e.deltaY < 0) {
        onChange(Math.min(max, value + step));
      } else if (e.deltaY > 0) {
        onChange(Math.max(min, value - step));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [value, min, max, step, disabled, onChange]);

  const colorStyles = {
    indigo: {
      accent: 'accent-indigo-600',
      text: 'text-indigo-600 dark:text-indigo-400',
      btnHover: 'hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400',
      activeBorder: 'focus:border-indigo-500',
    },
    rose: {
      accent: 'accent-rose-600',
      text: 'text-rose-600 dark:text-rose-400',
      btnHover: 'hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400',
      activeBorder: 'focus:border-rose-500',
    },
    emerald: {
      accent: 'accent-emerald-600',
      text: 'text-emerald-600 dark:text-emerald-400',
      btnHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400',
      activeBorder: 'focus:border-emerald-500',
    },
    sky: {
      accent: 'accent-sky-600',
      text: 'text-sky-600 dark:text-sky-400',
      btnHover: 'hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:border-sky-400',
      activeBorder: 'focus:border-sky-500',
    },
  }[colorScheme];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-zinc-300 break-keep">{label}</span>
            {labelExtra}
          </div>
          {showInput && (
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                min={min}
                max={max}
                value={value}
                disabled={disabled}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)));
                }}
                className={`w-14 text-center py-0.5 px-1 text-xs font-bold rounded-md border bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 ${colorStyles.text} ${colorStyles.activeBorder} outline-none`}
              />
              <span className={`text-xs font-bold ${colorStyles.text}`}>{unit}</span>
            </div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        title={title || '마우스 휠을 굴리거나 좌우로 드래그하여 조절할 수 있습니다'}
        onWheel={(e) => {
          e.stopPropagation();
          if (disabled) return;
          if (e.deltaY < 0) {
            onChange(Math.min(max, value + step));
          } else if (e.deltaY > 0) {
            onChange(Math.max(min, value - step));
          }
        }}
        className="flex items-center gap-2 select-none"
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={disabled || value <= min}
          className={`p-2 rounded-lg border bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer shadow-2xs ${colorStyles.btnHover}`}
          title={`${step} 감소`}
        >
          <Minus className="w-4 h-4" />
        </button>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          style={{ touchAction: 'pan-x' }}
          className={`flex-1 ${colorStyles.accent} cursor-ew-resize`}
        />

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled || value >= max}
          className={`p-2 rounded-lg border bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer shadow-2xs ${colorStyles.btnHover}`}
          title={`${step} 증가`}
        >
          <Plus className="w-4 h-4" />
        </button>
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

/* =========================================================================
   ELM-TIP-01 : 롱프레스 툴팁 & 클립보드 원클릭 복사 컴포넌트
   ========================================================================= */
export const ElmTip01: React.FC<{
  text: string;
  children?: React.ReactNode;
  className?: string;
  badgeClassName?: string;
  onCopyNotice?: (msg: string) => void;
}> = ({ text, children, className = '', badgeClassName = '', onCopyNotice }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 450);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      onCopyNotice?.(`✓ 클립보드에 복사되었습니다: "${text}"`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchCancel={cancelPress}
    >
      {children ? (
        children
      ) : (
        <span
          className={`truncate cursor-help select-text ${badgeClassName}`}
          title="길게 누르면 전체보기 및 복사"
        >
          {text}
        </span>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            className="absolute left-0 bottom-full mb-1.5 z-50 min-w-[180px] max-w-[320px] p-2.5 rounded-xl bg-slate-900 text-white dark:bg-zinc-800 border border-slate-700 dark:border-zinc-700 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 select-text"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 dark:border-zinc-700 pb-1 text-[10px] text-slate-400 font-bold">
              <span>전체 내용 (롱프레스)</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer transition-colors"
                  title="클립보드 복사"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? '복사됨' : '복사'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <p className="text-[11px] font-mono leading-relaxed break-all select-all text-slate-100">
              {text}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

/* =========================================================================
   ELM-HLP-01 : 반응형 기능안내 [?] 팝업레이어
   - HelpCircle ? 아이콘/버튼 트리거 (buttonText 옵션 제공)
   - 모바일 뷰포트 초과 방어 레이아웃 (fixed inset-x-3 top-24 sm:static sm:absolute sm:inset-auto)
   - 바깥 클릭/Esc 키 누름 시 자동 닫기 핸들러 내장
   - 모바일 전용 백드롭 (sm:hidden)
   - 다크모드 Deep Obsidian / Midnight Black 완벽 호환
   ========================================================================= */
export const ElmHlp01: React.FC<{
  title: string;
  children: React.ReactNode;
  buttonText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerIcon?: React.ComponentType<{ className?: string }>;
  align?: 'left' | 'right';
  width?: string;
  badge?: string;
  className?: string;
  buttonClassName?: string;
  tooltip?: string;
  colorScheme?: 'indigo' | 'sky' | 'emerald' | 'amber' | 'purple' | 'slate';
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}> = ({
  title,
  children,
  buttonText,
  icon: IconComponent = HelpCircle,
  headerIcon: HeaderIconComponent,
  align = 'right',
  width = 'sm:w-84',
  badge,
  className = '',
  buttonClassName = '',
  tooltip,
  colorScheme = 'indigo',
  isOpen: controlledIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    if (onToggle) {
      onToggle(open);
    }
  };

  // 바깥 클릭 및 Esc 키 닫기 이벤트 핸들러
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const colorStyles = {
    indigo: {
      activeBtn: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 shadow-2xs',
      hoverBtn: 'hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#1c1e26]',
      headerText: 'text-indigo-600 dark:text-indigo-400',
    },
    sky: {
      activeBtn: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 shadow-2xs',
      hoverBtn: 'hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-[#1c1e26]',
      headerText: 'text-sky-600 dark:text-sky-400',
    },
    emerald: {
      activeBtn: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shadow-2xs',
      hoverBtn: 'hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-[#1c1e26]',
      headerText: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      activeBtn: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shadow-2xs',
      hoverBtn: 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-[#1c1e26]',
      headerText: 'text-amber-600 dark:text-amber-400',
    },
    purple: {
      activeBtn: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 shadow-2xs',
      hoverBtn: 'hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-100 dark:hover:bg-[#1c1e26]',
      headerText: 'text-purple-700 dark:text-purple-300',
    },
    slate: {
      activeBtn: 'bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 shadow-2xs',
      hoverBtn: 'hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#1c1e26]',
      headerText: 'text-slate-700 dark:text-zinc-200',
    },
  }[colorScheme];

  const EffectiveHeaderIcon = HeaderIconComponent || IconComponent;
  const alignClass = align === 'left' ? 'sm:left-0' : 'sm:right-0';

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold select-none ${
          isOpen
            ? colorStyles.activeBtn
            : `text-slate-400 dark:text-slate-400 ${colorStyles.hoverBtn}`
        } ${buttonClassName}`}
        title={tooltip || `${title} 안내보기`}
      >
        <IconComponent className="w-4 h-4 shrink-0" />
        {buttonText && <span className="text-[11px] font-semibold break-keep hidden sm:inline">{buttonText}</span>}
      </button>

      {isOpen && (
        <>
          {/* 모바일 화면 밖 클릭 시 닫기 백드롭 */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* 반응형 팝업 레이어 (모바일 inset-x-3 고정 / 데스크톱 드롭다운) */}
          <div
            className={`fixed inset-x-3 top-24 sm:static sm:absolute sm:inset-auto ${alignClass} sm:top-full sm:mt-1.5 z-50 w-auto ${width} max-w-[calc(100vw-1.5rem)] p-4 sm:p-3.5 rounded-2xl bg-white dark:bg-[#111318] border border-slate-200 dark:border-[#1e2029] shadow-2xl text-xs text-slate-600 dark:text-zinc-300 animate-in fade-in zoom-in-95 space-y-2.5`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1e2029] font-extrabold text-slate-900 dark:text-white">
              <span className={`flex items-center gap-1.5 ${colorStyles.headerText} break-keep`}>
                <EffectiveHeaderIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-tight">{title}</span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1c1e26] text-slate-500 dark:text-slate-400">
                    {badge}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c1e26] cursor-pointer transition-colors"
                  title="닫기"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-[11px] leading-relaxed text-slate-600 dark:text-zinc-300 break-keep space-y-2">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* =========================================================================
   ELM-QCK-01 : 전역 플로팅 빠른등록 도크 (단일 번개 접힘, 상단 핸들, 136px 상한선)
   ========================================================================= */
export const ElmQck01: React.FC<{
  onOpenMoney: () => void;
  onOpenDuty: () => void;
  initialTop?: number;
  className?: string;
}> = ({ onOpenMoney, onOpenDuty, initialTop = 136, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [topPos, setTopPos] = useState(initialTop);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const initialTopRef = useRef(initialTop);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    initialTopRef.current = topPos;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    // 136px(대시보드 타이틀 기준선)을 상한선(Ceiling)으로 제한하고, 화면 하단 80px 내에서만 이동
    const maxTop = typeof window !== 'undefined' ? window.innerHeight - 80 : 600;
    const newTop = Math.max(136, Math.min(maxTop, initialTopRef.current + deltaY));
    setTopPos(newTop);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <aside
      aria-label="빠른등록 플로팅 메뉴"
      style={{ top: `${topPos}px` }}
      className={`fixed right-3 sm:right-5 z-40 flex flex-col items-end select-none transition-shadow ${className}`}
    >
      {/* 1.2 위치이동 핸들: 접고 펼치는 영역 상단에 배치 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-10 h-5 mb-1 flex items-center justify-center cursor-ns-resize bg-slate-800/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full shadow-md backdrop-blur-md transition-all active:scale-95"
        title="상하 위치 이동 핸들 (상한선: 화면 타이틀선)"
      >
        <GripHorizontal className="w-3.5 h-3.5" />
      </div>

      {/* 접힘 / 펼침 영역 */}
      {!isExpanded ? (
        /* 1.1 접었을 때: 처음 번개(Zap) 아이콘 하나만 표시 */
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="빠른등록 열기"
        >
          <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
        </button>
      ) : (
        /* 펼쳤을 때: 빠른 머니/수행 등록 및 접기 버튼 */
        <div className="flex flex-col gap-2 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-1.5 px-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              빠른등록
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="접기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenMoney();
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all min-h-[44px]"
          >
            <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>빠른 머니 등록</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenDuty();
              setIsExpanded(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all min-h-[44px]"
          >
            <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>빠른 수행 등록</span>
          </button>
        </div>
      )}
    </aside>
  );
};
/* =========================================================================
   ELM-TOST-01 : 화면 하단 플로팅 상태메시지 레이어 (스낵바 / 토스트 토큰)
   - 모바일 & 데스크톱 통일: 화면 하단 중앙에 부드럽게 노출되는 플로팅 피드백 레이어
   - 버튼 내 '복사됨!' 텍스트 변경 대신 일관된 비침습적 피드백 제공
   - 성공(success), 안내(info), 경고(warning), 에러(error) 스타일 지원
   - 자동 닫힘 타이머 및 수동 닫기 지원
   ========================================================================= */
export const ElmToast01: React.FC<{
  message: string | null;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose?: () => void;
  duration?: number;
  className?: string;
}> = ({ message, type = 'success', onClose, duration = 2800, className = '' }) => {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const styleConfig = {
    success: {
      bg: 'bg-slate-900/95 dark:bg-zinc-800/95 border-emerald-500/40 text-white',
      badge: 'bg-emerald-500/20 text-emerald-400',
      icon: <Check className="w-4 h-4 text-emerald-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/95 dark:bg-zinc-800/95 border-indigo-500/40 text-white',
      badge: 'bg-indigo-500/20 text-indigo-400',
      icon: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-slate-900/95 dark:bg-zinc-800/95 border-amber-500/40 text-white',
      badge: 'bg-amber-500/20 text-amber-400',
      icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    },
    error: {
      bg: 'bg-slate-900/95 dark:bg-zinc-800/95 border-rose-500/40 text-white',
      badge: 'bg-rose-500/20 text-rose-400',
      icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    },
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full border shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200 select-none max-w-[94vw] sm:max-w-none w-auto ${styleConfig.bg} ${className}`}
    >
      <div className={`p-1 rounded-full ${styleConfig.badge}`}>
        {styleConfig.icon}
      </div>
      <span className="text-xs sm:text-sm font-semibold tracking-tight text-white whitespace-normal sm:whitespace-nowrap">
        {message}
      </span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
