// ============================================================================
// src/sample/shared/OcrImagePreviewer.tsx
// 루틴 공통 첨부 이미지 OCR 인라인 확대/축소 미리보기 & 크기조절 가능 대형 팝업 뷰어
// - 디자인 정책 §2.4 (첨부 이미지 OCR 미리보기 · 인라인 확대/축소 및 크기조절 팝업) 준수
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  X,
  Move,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { RoutineAttachmentItem } from './routineOcrFields';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * 1. 인라인 펼침형 이미지 미리보기 (첨부파일 바 내부에 펼쳐져 특정 영역 확대/축소 확인)
 */
export const OcrInlineImagePreview: React.FC<{
  attachment: RoutineAttachmentItem;
  onOpenPopup: () => void;
  onClose: () => void;
}> = ({ attachment, onOpenPopup, onClose }) => {
  const [zoom, setZoom] = useState<number>(1);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({ active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  useEffect(() => {
    setZoom(1);
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
      viewportRef.current.scrollLeft = 0;
    }
  }, [attachment.attachmentId]);

  const handlePanStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    panStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture errors
    }
  };

  const handlePanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current.active || !viewportRef.current) return;
    const dx = e.clientX - panStateRef.current.startX;
    const dy = e.clientY - panStateRef.current.startY;
    viewportRef.current.scrollLeft = panStateRef.current.scrollLeft - dx;
    viewportRef.current.scrollTop = panStateRef.current.scrollTop - dy;
  };

  const handlePanEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current.active) return;
    panStateRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
      {/* 타이틀/컨트롤 영역 DIV */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200/80 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[160px] sm:max-w-[220px]">
            {attachment.fileName}
          </span>
          <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setZoom((z) => clamp(Number((z - ZOOM_STEP).toFixed(2)), MIN_ZOOM, MAX_ZOOM))}
            disabled={zoom <= MIN_ZOOM}
            title="축소"
            aria-label="이미지 축소"
            className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 inline-flex items-center justify-center cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => clamp(Number((z + ZOOM_STEP).toFixed(2)), MIN_ZOOM, MAX_ZOOM))}
            disabled={zoom >= MAX_ZOOM}
            title="확대"
            aria-label="이미지 확대"
            className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 inline-flex items-center justify-center cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="원래 비율(100%)"
            aria-label="배율 초기화"
            className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onOpenPopup}
            title="크기 조절 가능한 큰 이미지 팝업으로 보기"
            className="h-7 px-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>큰 팝업</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="미리보기 접기"
            className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/70 dark:hover:bg-zinc-700 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 컨텐츠(이미지 스크롤/팬 뷰포트) 영역 DIV */}
      <div
        ref={viewportRef}
        onPointerDown={handlePanStart}
        onPointerMove={handlePanMove}
        onPointerUp={handlePanEnd}
        onPointerCancel={handlePanEnd}
        className="relative h-56 sm:h-64 w-full overflow-auto bg-slate-100/90 dark:bg-zinc-950/90 select-none cursor-grab active:cursor-grabbing p-2"
      >
        {attachment.previewUrl ? (
          <div
            className="mx-auto transition-[width] duration-150"
            style={{ width: `${Math.round(zoom * 100)}%`, minWidth: zoom < 1 ? undefined : '100%' }}
          >
            <img
              src={attachment.previewUrl}
              alt={attachment.fileName}
              draggable={false}
              className="w-full h-auto rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white shadow-xs"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-1.5 text-slate-500 dark:text-zinc-400">
            <ImageIcon className="w-7 h-7 opacity-60" />
            <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {attachment.fileName}
            </div>
            <p className="text-[11px] max-w-xs leading-relaxed">{attachment.ocrSummary}</p>
          </div>
        )}
      </div>

      {/* 하단 안내 스트립 */}
      <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-zinc-400">
        <span className="truncate">{attachment.ocrSummary}</span>
        <span className="whitespace-nowrap shrink-0">드래그로 영역 이동</span>
      </div>
    </div>
  );
};

/**
 * 2. 크기 조절 · 위치 이동 가능한 대형 OCR 이미지 미리보기 팝업 (Portal 렌더링)
 */
export const OcrResizableImagePopup: React.FC<{
  attachments: RoutineAttachmentItem[];
  initialAttachmentId: string;
  onClose: () => void;
}> = ({ attachments, initialAttachmentId, onClose }) => {
  const initialIndex = Math.max(
    0,
    attachments.findIndex((a) => a.attachmentId === initialAttachmentId)
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1.25);

  const [box, setBox] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 720, height: 560, x: 80, y: 60 };
    }
    const w = Math.min(760, window.innerWidth - 32);
    const h = Math.min(620, window.innerHeight - 48);
    return {
      width: w,
      height: h,
      x: Math.max(16, Math.round((window.innerWidth - w) / 2)),
      y: Math.max(16, Math.round((window.innerHeight - h) / 2)),
    };
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragModeRef = useRef<{
    type: 'NONE' | 'MOVE' | 'RESIZE' | 'PAN';
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    type: 'NONE',
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    origW: 0,
    origH: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const activeAttachment = attachments[activeIndex] || attachments[0];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const applySizePreset = useCallback((preset: 'S' | 'M' | 'L' | 'FULL') => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const map = {
      S: { w: Math.min(460, vw - 24), h: Math.min(420, vh - 32) },
      M: { w: Math.min(720, vw - 24), h: Math.min(580, vh - 32) },
      L: { w: Math.min(980, vw - 24), h: Math.min(720, vh - 32) },
      FULL: { w: vw - 24, h: vh - 24 },
    }[preset];
    setBox({
      width: map.w,
      height: map.h,
      x: Math.max(12, Math.round((vw - map.w) / 2)),
      y: Math.max(12, Math.round((vh - map.h) / 2)),
    });
  }, []);

  const startMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragModeRef.current = {
      type: 'MOVE',
      startX: e.clientX,
      startY: e.clientY,
      origX: box.x,
      origY: box.y,
      origW: box.width,
      origH: box.height,
      scrollLeft: 0,
      scrollTop: 0,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    dragModeRef.current = {
      type: 'RESIZE',
      startX: e.clientX,
      startY: e.clientY,
      origX: box.x,
      origY: box.y,
      origW: box.width,
      origH: box.height,
      scrollLeft: 0,
      scrollTop: 0,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleWindowPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const mode = dragModeRef.current;
    if (mode.type === 'NONE') return;
    const dx = e.clientX - mode.startX;
    const dy = e.clientY - mode.startY;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (mode.type === 'MOVE') {
      const nextX = clamp(mode.origX + dx, 12, Math.max(12, vw - mode.origW - 12));
      const nextY = clamp(mode.origY + dy, 12, Math.max(12, vh - mode.origH - 12));
      setBox((prev) => ({ ...prev, x: nextX, y: nextY }));
    } else if (mode.type === 'RESIZE') {
      const minW = Math.min(340, vw - 24);
      const minH = Math.min(300, vh - 24);
      const maxW = vw - mode.origX - 12;
      const maxH = vh - mode.origY - 12;
      setBox((prev) => ({
        ...prev,
        width: clamp(mode.origW + dx, minW, Math.max(minW, maxW)),
        height: clamp(mode.origH + dy, minH, Math.max(minH, maxH)),
      }));
    } else if (mode.type === 'PAN' && viewportRef.current) {
      viewportRef.current.scrollLeft = mode.scrollLeft - dx;
      viewportRef.current.scrollTop = mode.scrollTop - dy;
    }
  };

  const handleWindowPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragModeRef.current.type === 'NONE') return;
    dragModeRef.current.type = 'NONE';
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const startPan = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    dragModeRef.current = {
      type: 'PAN',
      startX: e.clientX,
      startY: e.clientY,
      origX: box.x,
      origY: box.y,
      origW: box.width,
      origH: box.height,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((z) => clamp(Number((z + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM));
  };

  if (!activeAttachment || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-[1px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="OCR 이미지 크게 보기 팝업"
        onPointerMove={handleWindowPointerMove}
        onPointerUp={handleWindowPointerEnd}
        onPointerCancel={handleWindowPointerEnd}
        style={{
          width: `${box.width}px`,
          height: `${box.height}px`,
          transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
        }}
        className="fixed top-0 left-0 flex flex-col bg-white dark:bg-[#131926] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* 1. 상단 드래그 이동 헤더 + 크기 프리셋 + 확대/축소 */}
        <div
          onPointerDown={startMove}
          className="px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 cursor-move select-none shrink-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Move className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-[260px]">
              {activeAttachment.fileName}
            </span>
            <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold whitespace-nowrap">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {/* 팝업 크기 프리셋 */}
            <div className="inline-flex items-center p-0.5 rounded-md bg-slate-200/70 dark:bg-zinc-800 text-[10px] font-bold">
              {(['S', 'M', 'L', 'FULL'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applySizePreset(preset)}
                  className="px-1.5 py-0.5 rounded text-slate-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 cursor-pointer"
                >
                  {preset === 'FULL' ? '최대' : preset}
                </button>
              ))}
            </div>

            {/* 확대/축소 버튼 */}
            <button
              type="button"
              onClick={() => setZoom((z) => clamp(Number((z - ZOOM_STEP).toFixed(2)), MIN_ZOOM, MAX_ZOOM))}
              disabled={zoom <= MIN_ZOOM}
              aria-label="축소"
              className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 disabled:opacity-40 inline-flex items-center justify-center cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => clamp(Number((z + ZOOM_STEP).toFixed(2)), MIN_ZOOM, MAX_ZOOM))}
              disabled={zoom >= MAX_ZOOM}
              aria-label="확대"
              className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 disabled:opacity-40 inline-flex items-center justify-center cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="원래 크기"
              className="w-7 h-7 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 inline-flex items-center justify-center cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="팝업 닫기"
              className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/80 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. 본문 이미지 확대/이동 뷰포트 */}
        <div
          ref={viewportRef}
          onPointerDown={startPan}
          onWheel={handleWheelZoom}
          className="flex-1 min-h-0 overflow-auto bg-slate-100 dark:bg-zinc-950 p-4 select-none cursor-grab active:cursor-grabbing"
        >
          {activeAttachment.previewUrl ? (
            <div
              className="mx-auto transition-[width] duration-150"
              style={{
                width: `${Math.round(zoom * 100)}%`,
                minWidth: zoom < 1 ? undefined : '100%',
              }}
            >
              <img
                src={activeAttachment.previewUrl}
                alt={activeAttachment.fileName}
                draggable={false}
                className="w-full h-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white shadow-sm"
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500 dark:text-zinc-400">
              <ImageIcon className="w-10 h-10 opacity-50" />
              <div className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                {activeAttachment.fileName}
              </div>
              <p className="text-xs max-w-md">{activeAttachment.ocrSummary}</p>
            </div>
          )}
        </div>

        {/* 3. 하단 상태바 + 다중 첨부 전환 + 우측 하단 크기 조절 핸들 */}
        <div className="px-3.5 py-2 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 relative">
          <div className="flex items-center gap-2 min-w-0">
            {attachments.length > 1 && (
              <div className="inline-flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((i) => (i - 1 + attachments.length) % attachments.length)
                  }
                  aria-label="이전 첨부"
                  className="w-6 h-6 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                  {activeIndex + 1}/{attachments.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIndex((i) => (i + 1) % attachments.length)}
                  aria-label="다음 첨부"
                  className="w-6 h-6 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              {activeAttachment.ocrSummary} · 헤더 드래그로 이동 / 우하단 모서리로 크기 조절
            </span>
          </div>

          <span className="text-[10px] font-mono tabular-nums text-slate-400 whitespace-nowrap pr-5">
            {Math.round(box.width)}×{Math.round(box.height)}
          </span>

          {/* 우측 하단 드래그 크기 조절 핸들 */}
          <div
            onPointerDown={startResize}
            title="드래그하여 팝업 크기 조절"
            aria-label="팝업 크기 조절 핸들"
            className="absolute right-0 bottom-0 w-7 h-7 flex items-end justify-end p-1.5 cursor-nwse-resize touch-none text-slate-400 hover:text-indigo-600 dark:text-zinc-500 dark:hover:text-indigo-400"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M11 3L3 11M11 7L7 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
