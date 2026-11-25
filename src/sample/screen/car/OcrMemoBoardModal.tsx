import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  FileText,
  Sparkles,
  GripHorizontal,
  MousePointerClick,
  ArrowDownToDot,
  HelpCircle,
} from 'lucide-react';

export interface KeySnippet {
  label: string;
  value: string;
}

interface MappingField {
  id: string;
  label: string;
  value: string;
}

interface OcrMemoBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  rawText: string;
  keySnippets?: KeySnippet[];
  onApplyMapping?: (mapped: Record<string, string>) => void;
  isDark?: boolean;
}

export const OcrMemoBoardModal: React.FC<OcrMemoBoardModalProps> = ({
  isOpen,
  onClose,
  fileName,
  rawText,
  keySnippets = [],
  onApplyMapping,
  isDark = false,
}) => {
  // 1. 감지항목 입력필드 상태
  const [fields, setFields] = useState<MappingField[]>(() => {
    return keySnippets.map((s, idx) => ({
      id: `field_${idx}_${Date.now()}`,
      label: s.label,
      value: s.value,
    }));
  });

  useEffect(() => {
    if (keySnippets.length > 0) {
      setFields(
        keySnippets.map((s, idx) => ({
          id: `field_${idx}_${Date.now()}`,
          label: s.label,
          value: s.value,
        }))
      );
    }
  }, [keySnippets]);

  // 2. 텍스트 전문에서 선택된 문자열
  const [selectedText, setSelectedText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3. ? 레이어 팝업 표시 상태 (사용자 피드백 4.a, 4.b)
  const [showHelpMapping, setShowHelpMapping] = useState(false);
  const [showHelpExtract, setShowHelpExtract] = useState(false);

  // 4. 상하 높이 조절 비율 (기본 46%)
  const [splitPercent, setSplitPercent] = useState<number>(46);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // 줄 단위 파싱 (크롬 개발도구 모바일 모드 탭 선택 지원)
  const rawLines = useMemo(() => {
    return rawText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }, [rawText]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 텍스트 드래그/선택 감지 핸들러
  const handleSelectText = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    if (start !== undefined && end !== undefined && start !== end) {
      const text = target.value.substring(start, end).trim();
      if (text) {
        setSelectedText(text);
      }
    }
  };

  // 감지항목 타이틀 클릭 시: 선택 텍스트가 있으면 해당 필드에 주입, 없으면 클립보드 복사
  const handleTitleClick = async (fieldId: string, label: string) => {
    if (selectedText) {
      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, value: selectedText } : f))
      );
      showToast(`선택된 "${selectedText}" ➔ [${label}] 항목에 적용되었습니다.`);
      setSelectedText('');
    } else {
      const targetField = fields.find((f) => f.id === fieldId);
      if (targetField && targetField.value) {
        try {
          await navigator.clipboard.writeText(targetField.value);
          showToast(`'${targetField.value}' 복사 완료!`);
        } catch {
          // fallback
        }
      }
    }
  };

  // 필드값 직접 수정
  const handleValueChange = (fieldId: string, val: string) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, value: val } : f)));
  };

  // 필드값 초기화 (사용자 요구사항 1: 표준 X 아이콘 적용)
  const handleClearField = (fieldId: string) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, value: '' } : f)));
  };

  // 마우스 리사이즈 핸들러
  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetY = ev.clientY - rect.top;
      const pct = Math.min(Math.max((offsetY / rect.height) * 100, 20), 80);
      setSplitPercent(pct);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 최종 폼 적용 (버튼명: 'OCR 적용')
  const handleApply = () => {
    if (onApplyMapping) {
      const mappedRecord: Record<string, string> = {};
      fields.forEach((f) => {
        if (f.label.trim() && f.value.trim()) {
          mappedRecord[f.label.trim()] = f.value.trim();
        }
      });
      onApplyMapping(mappedRecord);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-xl rounded-2xl flex flex-col h-[90vh] max-h-[760px] shadow-2xl border overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 플로팅 토스트 메시지 */}
        {toastMessage && (
          <div className="absolute top-4 right-5 z-50 px-3.5 py-2 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[280px]">{toastMessage}</span>
          </div>
        )}

        {/* 1. 고정 헤더 (사용자 요구사항 3.a: 타이틀 'OCR 추출 텍스트 매핑') */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                OCR 추출 텍스트 매핑
                <span className="text-[11px] font-mono font-normal text-slate-400 truncate max-w-[140px]">
                  ({fileName})
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                전문에서 텍스트를 선택한 뒤 타이틀을 클릭하면 입력필드에 즉시 매핑됩니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 스플릿 컨테이너 (높이 조절 핸들) */}
        <div ref={containerRef} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* A. 상단 영역: 감지대상 매핑항목 (사용자 요구사항 3.b & 4.a 레이어 팝업) */}
          <div
            style={{ height: `${splitPercent}%` }}
            className="overflow-y-auto p-4 space-y-2 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-1 relative">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ArrowDownToDot className="w-3.5 h-3.5 text-emerald-600" />
                  감지대상 매핑항목
                </span>

                {/* 4.a: ? 레이어팝업 버튼 */}
                <button
                  type="button"
                  onClick={() => setShowHelpMapping((prev) => !prev)}
                  className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-500 text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                  title="도움말 보기"
                >
                  ?
                </button>

                {showHelpMapping && (
                  <div className="absolute left-0 top-6 z-50 w-72 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-emerald-400">타이틀 클릭 시 선택 텍스트 주입</p>
                      <button
                        type="button"
                        onClick={() => setShowHelpMapping(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      하단 전문에서 원하는 텍스트를 드래그하거나 탭하여 선택한 뒤, 해당 항목의 타이틀 버튼을 클릭하면 입력필드에 즉시 입력됩니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
              >
                {/* 타이틀 버튼: 선택 텍스트 주입 */}
                <button
                  type="button"
                  onClick={() => handleTitleClick(field.id, field.label)}
                  className={`w-28 sm:w-32 px-2 py-1 text-xs font-semibold rounded-md border text-left truncate transition-all cursor-pointer ${
                    selectedText
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-400 shadow-2xs hover:bg-emerald-100'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                  }`}
                  title={
                    selectedText
                      ? `선택된 "${selectedText}"을(를) [${field.label}]에 주입`
                      : `클릭하여 '${field.value}' 복사`
                  }
                >
                  <span className="text-[10px] text-slate-400 block -mb-0.5">
                    {selectedText ? '주입 ➔' : '타이틀'}
                  </span>
                  <span className="truncate block">{field.label}</span>
                </button>

                {/* 입력 필드 */}
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleValueChange(field.id, e.target.value)}
                  placeholder="추출값 입력 또는 전문에서 선택"
                  className="flex-1 h-8 px-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                />

                {/* 초기화 버튼: 사용자 요구사항 1 토큰 표준 X 아이콘 적용 */}
                <button
                  type="button"
                  onClick={() => handleClearField(field.id)}
                  className="w-7 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="입력 내용 지우기 (초기화)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* B. 리사이저 핸들 */}
          <div
            onMouseDown={handleMouseDownResizer}
            className="h-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/20 active:bg-emerald-500/30 flex items-center justify-center cursor-row-resize select-none border-y border-slate-200 dark:border-slate-700 transition-colors"
            title="상하 영역 높이 조절 (드래그)"
          >
            <GripHorizontal className="w-4 h-3 text-slate-400" />
          </div>

          {/* C. 하단 영역: 추출 텍스트 전문 (사용자 요구사항 3.c & 4.b 레이어 팝업) */}
          <div
            style={{ height: `${100 - splitPercent}%` }}
            className="flex-1 flex flex-col p-4 min-h-0 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between shrink-0 relative">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  추출 텍스트 전문
                </span>

                {/* 4.b: ? 레이어팝업 버튼 */}
                <button
                  type="button"
                  onClick={() => setShowHelpExtract((prev) => !prev)}
                  className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-500 text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                  title="도움말 보기"
                >
                  ?
                </button>

                {showHelpExtract && (
                  <div className="absolute left-0 top-6 z-50 w-72 p-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-emerald-400">드래그 또는 탭하여 원하는 텍스트 선택</p>
                      <button
                        type="button"
                        onClick={() => setShowHelpExtract(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      마우스로 블록 지정하거나, 아래 탭 선택 칩을 클릭하여 선택할 수 있습니다. 선택된 내용은 상단 항목 타이틀을 누르면 입력필드에 자동 매핑됩니다.
                    </p>
                  </div>
                )}
              </div>

              {selectedText && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] font-semibold animate-in fade-in">
                  <MousePointerClick className="w-3 h-3" />
                  <span>선택됨: "{selectedText.slice(0, 15)}..."</span>
                </div>
              )}
            </div>

            {/* 사용자 피드백 2: 크롬 개발도구 모바일 모드 대응 (줄 단위 원클릭 탭 선택 칩) */}
            {rawLines.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shrink-0">
                <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">탭 선택:</span>
                {rawLines.map((line, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedText(line);
                      showToast(`"${line.slice(0, 15)}..." 선택됨`);
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded-md border transition-colors cursor-pointer truncate max-w-[220px] ${
                      selectedText === line
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                    title={line}
                  >
                    {line}
                  </button>
                ))}
              </div>
            )}

            {/* 텍스트 영역 */}
            <textarea
              readOnly
              value={rawText}
              onSelect={handleSelectText}
              style={{
                touchAction: 'manipulation',
                WebkitUserSelect: 'text',
                userSelect: 'text',
              }}
              className="flex-1 w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none overflow-y-auto"
              placeholder="텍스트를 마우스로 드래그하거나 위 탭 선택 칩을 클릭하세요."
            />
          </div>
        </div>

        {/* 3. 고정 푸터 (사용자 요구사항 3.d: 'OCR 적용' & 5.b: 안내문구 삭제) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-2xs"
          >
            OCR 적용
          </button>
        </div>
      </div>
    </div>
  );
};
