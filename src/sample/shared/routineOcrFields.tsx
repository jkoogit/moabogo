// ============================================================================
// src/sample/shared/routineOcrFields.tsx
// 공통 멀티 파일첨부 · OCR 자동입력 표시, 원터치 확인(Confirm) 및 이미지 미리보기 컴포넌트
// - 디자인 정책 §2.3 (타이틀/컨텐츠 DIV 분리) 및 §2.4 (OCR 이미지 미리보기/크기조절 팝업) 준수
// ============================================================================

import React, { useRef, useState } from 'react';
import {
  Camera,
  Sparkles,
  Check,
  CheckCheck,
  PencilLine,
  Paperclip,
  Eye,
  X,
} from 'lucide-react';
import { ElmSld03 } from '../elements/Tokens';
import { OcrInlineImagePreview, OcrResizableImagePopup } from './OcrImagePreviewer';

export type OcrReviewState = 'AUTO_UNCONFIRMED' | 'CONFIRMED' | 'EDITED';

export type OcrFieldReviewMap = Record<string, OcrReviewState>;

export interface RoutineAttachmentItem {
  attachmentId: string;
  fileName: string;
  uploadedAt: string;
  ocrSummary: string;
  previewUrl?: string;
  isImageOcr?: boolean;
}

export interface RoutineUploadedFile {
  fileName: string;
  previewUrl?: string;
  isImage: boolean;
}

export function isImageFileName(fileName: string): boolean {
  return /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test((fileName || '').trim());
}

/**
 * OCR 자동입력 원터치 확인 배지
 * - AUTO_UNCONFIRMED : 터치하여 확인 가능 ("✨ 자동입력" / "✨ 자동입력 · 터치확인")
 * - CONFIRMED        : 사용자가 터치로 확인 완료 ("✓ 확인됨")
 * - EDITED           : 사용자가 값을 수정하며 확인 완료 ("✎ 수정·확인됨")
 */
export const OcrConfirmBadge: React.FC<{
  state?: OcrReviewState;
  onToggleConfirm?: () => void;
  compact?: boolean;
}> = ({ state, onToggleConfirm, compact = false }) => {
  if (!state) return null;

  const isUnconfirmed = state === 'AUTO_UNCONFIRMED';
  const isEdited = state === 'EDITED';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggleConfirm?.();
      }}
      title={
        isUnconfirmed
          ? '파일첨부 OCR로 자동 입력된 항목입니다. 터치하여 확인 완료로 표시하세요.'
          : isEdited
          ? '자동입력 후 사용자가 수정 확인한 항목입니다.'
          : '터치 확인이 완료된 자동입력 항목입니다. 다시 터치하면 미확인으로 되돌립니다.'
      }
      className={`inline-flex items-center gap-1 rounded-md border font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
      } ${
        isUnconfirmed
          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60'
          : isEdited
          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
          : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
      }`}
    >
      {isUnconfirmed ? (
        <>
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>{compact ? '자동입력' : '자동입력 · 터치확인'}</span>
        </>
      ) : isEdited ? (
        <>
          <PencilLine className="w-3 h-3 shrink-0" />
          <span>{compact ? '수정확인' : '수정·확인됨'}</span>
        </>
      ) : (
        <>
          <Check className="w-3 h-3 shrink-0" />
          <span>확인됨</span>
        </>
      )}
    </button>
  );
};

/**
 * OCR 자동입력 상태가 결합된 입력필드 셸 (타이틀 DIV / 컨텐츠 DIV 분리 준수)
 */
export const OcrFieldShell: React.FC<{
  label: string;
  reviewState?: OcrReviewState;
  onToggleConfirm?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ label, reviewState, onToggleConfirm, className = '', children }) => {
  const isUnconfirmed = reviewState === 'AUTO_UNCONFIRMED';
  return (
    <div className={`space-y-1.5 min-w-0 ${className}`}>
      {/* 타이틀 영역 DIV */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">
          {label}
        </span>
        <OcrConfirmBadge state={reviewState} onToggleConfirm={onToggleConfirm} compact />
      </div>
      {/* 컨텐츠 영역 DIV */}
      <div
        className={`rounded-lg transition-shadow ${
          isUnconfirmed ? 'ring-1 ring-amber-400/80 dark:ring-amber-600/80' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 공통 멀티 파일첨부 OCR 자동 세팅 바
 * - 이미지/PDF 다중 첨부 → OCR 자동입력 트리거
 * - 자동입력 확인 진행률(N/M) 및 [전체 확인] 원클릭 지원
 * - 이미지 OCR 첨부파일 미리보기 아이콘(Eye) → 인라인 확대/축소 펼침 및 크기조절 팝업 지원 (§2.4)
 */
export const RoutineAttachmentDropBar: React.FC<{
  title: string;
  description: string;
  uploadButtonLabel: string;
  sampleButtonLabel: string;
  accentTone?: 'emerald' | 'sky' | 'amber' | 'indigo';
  attachments: RoutineAttachmentItem[];
  reviewMap: OcrFieldReviewMap;
  onFilesUploaded: (files: RoutineUploadedFile[]) => void;
  onSampleApply: () => void;
  onConfirmAll: () => void;
  onRemoveAttachment?: (attachmentId: string) => void;
}> = ({
  title,
  description,
  uploadButtonLabel,
  sampleButtonLabel,
  accentTone = 'indigo',
  attachments,
  reviewMap,
  onFilesUploaded,
  onSampleApply,
  onConfirmAll,
  onRemoveAttachment,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inlinePreviewId, setInlinePreviewId] = useState<string | null>(null);
  const [popupPreviewId, setPopupPreviewId] = useState<string | null>(null);

  const reviewEntries = Object.values(reviewMap);
  const totalAutoFields = reviewEntries.length;
  const confirmedFields = reviewEntries.filter((s) => s !== 'AUTO_UNCONFIRMED').length;
  const hasUnconfirmed = totalAutoFields > confirmedFields;

  const imageOcrAttachments = attachments.filter(
    (att) => att.isImageOcr !== false && (Boolean(att.previewUrl) || isImageFileName(att.fileName))
  );
  const activeInlineAttachment =
    imageOcrAttachments.find((att) => att.attachmentId === inlinePreviewId) || null;

  const toneMap = {
    emerald: {
      box: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/90 dark:border-emerald-900',
      title: 'text-emerald-900 dark:text-emerald-200',
      icon: 'text-emerald-600 dark:text-emerald-400',
      desc: 'text-emerald-800/80 dark:text-emerald-300/80',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      subBtn:
        'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
    },
    sky: {
      box: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200/90 dark:border-sky-900',
      title: 'text-sky-900 dark:text-sky-200',
      icon: 'text-sky-600 dark:text-sky-400',
      desc: 'text-sky-800/80 dark:text-sky-300/80',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white',
      subBtn:
        'border-sky-300 dark:border-sky-800 bg-white dark:bg-zinc-900 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50',
    },
    amber: {
      box: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-900',
      title: 'text-amber-900 dark:text-amber-200',
      icon: 'text-amber-600 dark:text-amber-400',
      desc: 'text-amber-800/80 dark:text-amber-300/80',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      subBtn:
        'border-amber-300 dark:border-amber-800 bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50',
    },
    indigo: {
      box: 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200/90 dark:border-indigo-900',
      title: 'text-indigo-900 dark:text-indigo-200',
      icon: 'text-indigo-600 dark:text-indigo-400',
      desc: 'text-indigo-800/80 dark:text-indigo-300/80',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      subBtn:
        'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50',
    },
  }[accentTone];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const uploaded: RoutineUploadedFile[] = Array.from(files).map((file) => {
      const isImage = file.type.startsWith('image/') || isImageFileName(file.name);
      return {
        fileName: file.name,
        previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        isImage,
      };
    });
    onFilesUploaded(uploaded);
    e.target.value = '';
  };

  return (
    <div className={`p-3 rounded-xl border space-y-2.5 ${toneMap.box}`}>
      {/* 타이틀 영역 DIV */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 text-xs font-bold ${toneMap.title}`}>
          <Camera className={`w-3.5 h-3.5 shrink-0 ${toneMap.icon}`} />
          <span>{title}</span>
        </div>
        {totalAutoFields > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold font-mono tabular-nums text-slate-700 dark:text-zinc-200 whitespace-nowrap">
              자동입력 확인 {confirmedFields}/{totalAutoFields}
            </span>
            {hasUnconfirmed && (
              <button
                type="button"
                onClick={onConfirmAll}
                className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                전체 확인
              </button>
            )}
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 DIV */}
      <div className="space-y-2">
        <p className={`text-[11px] leading-relaxed ${toneMap.desc}`}>{description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${toneMap.btn}`}
          >
            <Paperclip className="w-3.5 h-3.5 shrink-0" />
            {uploadButtonLabel}
          </button>
          <button
            type="button"
            onClick={onSampleApply}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${toneMap.subBtn}`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            {sampleButtonLabel}
          </button>
        </div>

        {/* 멀티 첨부된 파일 목록 (ElmSld03 가로 슬라이드 + 이미지 OCR 미리보기 아이콘) */}
        {attachments.length > 0 && (
          <div className="pt-1">
            <ElmSld03
              showNavButtons={false}
              className="min-w-0"
              innerClassName="flex items-center gap-1.5"
            >
              {attachments.map((att) => {
                const canPreview =
                  att.isImageOcr !== false &&
                  (Boolean(att.previewUrl) || isImageFileName(att.fileName));
                const isPreviewOpen = inlinePreviewId === att.attachmentId;
                return (
                  <span
                    key={att.attachmentId}
                    title={att.ocrSummary}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] whitespace-nowrap shrink-0 transition-colors ${
                      isPreviewOpen
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200'
                        : 'bg-white/95 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="max-w-[140px] truncate font-medium">{att.fileName}</span>
                    {canPreview && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInlinePreviewId((prev) =>
                            prev === att.attachmentId ? null : att.attachmentId
                          );
                        }}
                        title={isPreviewOpen ? '이미지 미리보기 접기' : 'OCR 이미지 미리보기 펼치기'}
                        aria-label="OCR 이미지 미리보기"
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          isPreviewOpen
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/70'
                        }`}
                      >
                        <Eye className="w-3 h-3 shrink-0" />
                        <span>미리보기</span>
                      </button>
                    )}
                    {onRemoveAttachment && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (inlinePreviewId === att.attachmentId) setInlinePreviewId(null);
                          if (popupPreviewId === att.attachmentId) setPopupPreviewId(null);
                          onRemoveAttachment(att.attachmentId);
                        }}
                        aria-label="첨부 제거"
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </ElmSld03>
          </div>
        )}

        {/* 인라인 펼침형 이미지 OCR 미리보기 (확대/축소 + 드래그 영역확인 + 큰 팝업 호출) */}
        {activeInlineAttachment && (
          <div className="pt-1">
            <OcrInlineImagePreview
              attachment={activeInlineAttachment}
              onOpenPopup={() => setPopupPreviewId(activeInlineAttachment.attachmentId)}
              onClose={() => setInlinePreviewId(null)}
            />
          </div>
        )}
      </div>

      {/* 크기 조절 및 이동 가능한 대형 이미지 미리보기 팝업 */}
      {popupPreviewId && imageOcrAttachments.length > 0 && (
        <OcrResizableImagePopup
          attachments={imageOcrAttachments}
          initialAttachmentId={popupPreviewId}
          onClose={() => setPopupPreviewId(null)}
        />
      )}
    </div>
  );
};
