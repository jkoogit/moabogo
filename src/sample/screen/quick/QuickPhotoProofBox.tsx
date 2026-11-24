import React from 'react';
import { Camera, Upload, X, Zap } from 'lucide-react';
import { ElmSld03 } from '../../elements/Tokens';
import { buildPhotoProofFallbackSvg, QUICK_PHOTO_PRESETS } from './quickEntryData';

interface QuickPhotoProofBoxProps {
  photoInputRef: React.RefObject<HTMLInputElement | null>;
  taskType: 'DUTY' | 'GOAL';
  attachedPhoto: string | null;
  attachedPhotoLabel: string;
  isInstantSubmitting: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyProof: (url: string, label: string, autoSubmitNow?: boolean) => void;
  onClearPhoto: () => void;
}

/** 1초 사진 인증 첨부 · 프리셋 휠 · 즉시제출 뷰 컴포넌트 */
export const QuickPhotoProofBox: React.FC<QuickPhotoProofBoxProps> = ({
  photoInputRef,
  taskType,
  attachedPhoto,
  attachedPhotoLabel,
  isInstantSubmitting,
  onFileChange,
  onApplyProof,
  onClearPhoto,
}) => (
  <section className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40">
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 whitespace-nowrap">
        <Camera className="w-3.5 h-3.5 text-purple-500 shrink-0" />
        <span>1초 사진 인증 첨부</span>
      </span>
      <div className="flex items-center gap-1.5">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span>카메라/앨범</span>
        </button>
        <button
          type="button"
          disabled={isInstantSubmitting}
          onClick={() => {
            const fallbackPreset =
              QUICK_PHOTO_PRESETS.find((p) => p.taskType === taskType) || QUICK_PHOTO_PRESETS[0];
            onApplyProof(
              attachedPhoto || fallbackPreset.url,
              attachedPhotoLabel || fallbackPreset.label,
              true
            );
          }}
          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300 shrink-0" />
          <span>1초 즉시제출</span>
        </button>
      </div>
    </div>

    <ElmSld03 showNavButtons={false} stepWidth={150} innerClassName="flex items-center gap-2 py-0.5">
      {QUICK_PHOTO_PRESETS.map((ph) => (
        <button
          key={ph.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onApplyProof(ph.url, ph.label, false);
          }}
          className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold shrink-0 whitespace-nowrap transition-colors cursor-pointer ${
            attachedPhotoLabel === ph.label
              ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-400 text-purple-700 dark:text-purple-300'
              : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
          }`}
        >
          {ph.label}
        </button>
      ))}
    </ElmSld03>

    {attachedPhoto ? (
      <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-zinc-900 p-2 flex items-center gap-3">
        <img
          src={attachedPhoto}
          alt="인증 사진 미리보기"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              buildPhotoProofFallbackSvg(attachedPhotoLabel);
          }}
          className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block truncate">
            {attachedPhotoLabel}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5 truncate">
            ✓ EXIF 검증 완료 ·{' '}
            {taskType === 'DUTY' ? 'SUBMITTED + 자동승인 전이' : '목표 증빙 첨부됨'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClearPhoto}
          aria-label="사진 삭제"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div className="p-3 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl text-center text-[11px] text-slate-500 dark:text-zinc-400">
        사진을 첨부하면 당번 진행상태가 즉시 제출(`SUBMITTED`)로 전이됩니다.
      </div>
    )}
  </section>
);
