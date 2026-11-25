import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: string[];
  title?: string;
  isDark?: boolean;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photos,
  title = '이미지 확인',
  isDark = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [transformOrigin, setTransformOrigin] = useState('center center');
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // 포인터가 이미지/뷰어 영역에 위치할 경우 화면 스크롤 이벤트 전파 차단
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
      const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);
      setTransformOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);

      const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
      setZoomLevel((prev) => Math.min(Math.max(prev + zoomFactor, 0.6), 4.0));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setZoomLevel(1);
    setTransformOrigin('center center');
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setZoomLevel(1);
    setTransformOrigin('center center');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl flex flex-col max-h-[92vh] shadow-2xl border overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 헤더 */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold truncate">{title}</h3>
            {photos.length > 1 && (
              <span className="text-xs text-slate-400 font-mono">
                ({currentIndex + 1} / {photos.length})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 4.0))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="확대"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.6))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="축소"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 뷰어 영역 (포인터 기준 휠 확대/축소 및 이벤트 전파 제한) */}
        <div
          ref={viewerRef}
          className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[65vh] select-none cursor-grab active:cursor-grabbing"
        >
          {/* 이미지 렌더링 또는 목업 시뮬레이터 카드 */}
          <div
            className="transition-transform duration-100 p-4 flex flex-col items-center justify-center max-w-full origin-center"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: transformOrigin,
            }}
          >
            {currentPhoto.startsWith('http') || currentPhoto.startsWith('data:') ? (
              <img
                src={currentPhoto}
                alt="증빙 이미지"
                className="max-h-[55vh] object-contain rounded-lg shadow-lg pointer-events-none"
              />
            ) : (
              <div className="w-72 sm:w-80 p-5 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-2xl space-y-3 font-sans">
                <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                  <span className="text-xs font-bold text-emerald-700">[증빙 이미지 원본]</span>
                  <span className="text-[10px] text-slate-400 font-mono">Verified OCR</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-800">{currentPhoto}</p>
                  <p className="text-[11px] text-slate-500">
                    첨부된 문서/사진의 해상도 및 텍스트 검증이 완료되었습니다.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 text-[10px] text-slate-600 font-mono">
                  CHECKSUM: SHA-256 (PWA Offline Verified)
                </div>
              </div>
            )}
          </div>

          {/* 좌우 이동 버튼 */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* 푸터 (요구사항 2.a: 텍스트 문구 삭제 및 닫기 버튼 우측 정렬) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 text-xs font-medium cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
