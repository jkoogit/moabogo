import React from 'react';
import { Eye, RefreshCw, Sparkles, Upload, X } from 'lucide-react';
import { ElmSld03 } from '../../elements/Tokens';
import { RECEIPT_OCR_PRESETS, ReceiptOcrPreset } from './quickEntryData';

interface OcrStagePreviewCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isScanning: boolean;
  ocrStage: 'IDLE' | 'SCANNING' | 'PREVIEW_READY';
  previewImageUrl: string | null;
  ocrConfidence: string;
  paidAt: string;
  merchant: string;
  amount: string;
  ocrRawLines: string[];
  isPreviewExpanded: boolean;
  onToggleExpand: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPreset: (preset: ReceiptOcrPreset) => void;
  onClearPreview: () => void;
}

/** 2단계 OCR 스캔 프리셋 · 파일 업로드 · 추출 결과 미리보기 카드 */
export const OcrStagePreviewCard: React.FC<OcrStagePreviewCardProps> = ({
  fileInputRef,
  isScanning,
  ocrStage,
  previewImageUrl,
  ocrConfidence,
  paidAt,
  merchant,
  amount,
  ocrRawLines,
  isPreviewExpanded,
  onToggleExpand,
  onFileUpload,
  onSelectPreset,
  onClearPreview,
}) => (
  <section className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>2단계 OCR 스캔 & 미리보기</span>
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
      >
        <Upload className="w-3.5 h-3.5 shrink-0" />
        <span>사진/캡처 첨부</span>
      </button>
    </div>

    <ElmSld03 showNavButtons={false} stepWidth={155} innerClassName="flex items-stretch gap-2 pb-0.5">
      {RECEIPT_OCR_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelectPreset(preset)}
          disabled={isScanning}
          className="min-h-[44px] min-w-[148px] shrink-0 px-3 py-2 rounded-xl border text-left bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 hover:border-indigo-400 transition-colors cursor-pointer disabled:opacity-50"
        >
          <div className="text-xs font-bold text-slate-800 dark:text-zinc-100 whitespace-nowrap">
            {preset.label}
          </div>
          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 whitespace-nowrap">
            ₩{Number(preset.amount).toLocaleString()}원 · OCR {preset.confidence}
          </div>
        </button>
      ))}
    </ElmSld03>

    {ocrStage === 'SCANNING' && (
      <div className="p-4 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/20 text-center space-y-1.5">
        <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
        <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
          1단계: EasyOCR 텍스트 블록 분석 중...
        </div>
        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
          가맹점명 · 승인일시 · 합계금액 자동 매핑 진행
        </p>
      </div>
    )}

    {ocrStage === 'PREVIEW_READY' && previewImageUrl && (
      <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-zinc-900 space-y-2.5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggleExpand}
            className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0 group cursor-pointer"
            title="영수증 이미지 크게 보기"
          >
            <img
              src={previewImageUrl}
              alt="OCR 영수증 미리보기"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Eye className="w-4 h-4" />
            </span>
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                2단계 OCR 추출 완료 · {ocrConfidence}
              </span>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">{paidAt}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-zinc-100 truncate">
              {merchant} · ₩{Number(amount || 0).toLocaleString()}원
            </div>
            {ocrRawLines.length > 0 && (
              <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                {ocrRawLines.join(' | ')}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClearPreview}
            aria-label="OCR 미리보기 닫기"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isPreviewExpanded && (
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <img
              src={previewImageUrl}
              alt="확대된 영수증 미리보기"
              className="w-full max-h-52 object-contain rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
            />
          </div>
        )}
      </div>
    )}
  </section>
);
