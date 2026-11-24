// ============================================================================
// src/sample/screen/routine/plugins/mvnoPlugin.tsx
// 2. 알뜰폰 환승 루틴 차별기능 플러그인
// - 5단계 D-Day FSM & 번호이동 4단계 캡처 OCR · 터치확인
// - [0047] 다인·다회선(1인 다번호), 년도-차수(2026-2차) 관리, 정원/차수생략(SKIPPED)
// - [0047] 24개월 장기약정 점검(MAINTAINED) 및 실물 USIM(ICCID) 마스킹/복사
// ============================================================================

import React, { useState } from 'react';
import {
  Smartphone,
  Clock,
  Check,
  ChevronRight,
  Camera,
  ShieldCheck,
  CreditCard,
  Gift,
  Copy,
  Eye,
  EyeOff,
  User,
  Users,
  Repeat,
  AlertCircle,
  FileCheck2,
  Calendar,
} from 'lucide-react';
import { ElmInp01, ElmSel01 } from '../../../elements/Tokens';
import {
  OcrConfirmBadge,
  OcrFieldShell,
  RoutineAttachmentDropBar,
  RoutineUploadedFile,
} from '../../../shared/routineOcrFields';
import {
  MvnoRoutine,
  MvnoRoundLineEntry,
  MvnoRoundLineStatus,
  ROUTINE_CATEGORY_META,
  ROUTINE_TODAY_ISO,
  evaluateUrgencyFSM,
} from '../types';
import {
  RoutinePlugin,
  RoutineHelpTooltip,
  RoutineCreateDraft,
  CreateFieldsHelpers,
  RoutineCardActionHandlers,
} from './pluginContract';

const meta = ROUTINE_CATEGORY_META.LIFE_PHONE;

// --- 1. 등록 폼 (다인/다회선 및 24개월 약정/USIM 지원) ---
const MvnoCreateFields: React.FC<{
  draft: RoutineCreateDraft;
  helpers: CreateFieldsHelpers;
}> = ({ draft, helpers }) => {
  const [lineMode, setLineMode] = useState<'MNP_PROMO' | 'LONG_TERM_CONTRACT'>('MNP_PROMO');

  const applyMvnoOcr = (files?: RoutineUploadedFile[]) => {
    const sourceFiles: RoutineUploadedFile[] =
      files && files.length > 0
        ? files
        : [
            {
              fileName: 'SK7mobile_번호이동_캡처.png',
              isImage: true,
            },
          ];
    const newAttachments = sourceFiles.map((file, idx) => ({
      attachmentId: `att-mvno-${Date.now()}-${idx}`,
      fileName: file.fileName,
      uploadedAt: ROUTINE_TODAY_ISO,
      ocrSummary: 'SK 7mobile · SKT망 7개월 특가 14,900원 · USIM 일련번호 자동인식',
      previewUrl: file.previewUrl,
      isImageOcr: file.isImage,
    }));

    helpers.patchDraft({
      autoTitle: 'SK 7mobile 번호이동 (7개월 특가)',
      autoSubtitle: 'SKT망 · 번호이동 화면 캡처 OCR 자동완성',
      networkType: 'SKT망',
      carrierName: 'SK 7mobile',
      planName: 'LTE 유심 11GB+ (7개월 특가)',
      dataCallSpec: '11GB+일2GB+3Mbps · 무제한',
      promoMonthlyFee: '14900',
      normalMonthlyFee: '33900',
      promoMonths: '7',
      openedDate: ROUTINE_TODAY_ISO,
      promoEndDate: '2027-06-23',
      usimType: 'USIM',
      usimSerial: '8982051900244410',
      autoPayMethod: '신한카드 자동납부',
      benefitMemo: '네이버페이 2만원 (3개월 유지 조건)',
      ocrAutofilled: true,
      attachments: [...draft.attachments, ...newAttachments],
      ocrReviewMap: {
        ...draft.ocrReviewMap,
        networkType: 'AUTO_UNCONFIRMED',
        carrierName: 'AUTO_UNCONFIRMED',
        planName: 'AUTO_UNCONFIRMED',
        promoMonthlyFee: 'AUTO_UNCONFIRMED',
        normalMonthlyFee: 'AUTO_UNCONFIRMED',
        promoMonths: 'AUTO_UNCONFIRMED',
        openedDate: 'AUTO_UNCONFIRMED',
        promoEndDate: 'AUTO_UNCONFIRMED',
        usimSerial: 'AUTO_UNCONFIRMED',
        autoPayMethod: 'AUTO_UNCONFIRMED',
        benefitMemo: 'AUTO_UNCONFIRMED',
      },
    });
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
      <RoutineAttachmentDropBar
        title="번호이동 화면 캡처 OCR 자동 세팅"
        description="요금제 신청·유심 바코드(ICCID)·개통 캡처 이미지를 첨부하면 회선 정보와 유심번호를 자동 세팅합니다"
        uploadButtonLabel="번호이동 캡처 첨부"
        sampleButtonLabel="SK7mobile 예시 적용"
        accentTone="sky"
        attachments={draft.attachments}
        reviewMap={draft.ocrReviewMap}
        onFilesUploaded={(files: RoutineUploadedFile[]) => applyMvnoOcr(files)}
        onSampleApply={() => applyMvnoOcr()}
        onConfirmAll={helpers.confirmAllFields}
        onRemoveAttachment={helpers.removeAttachment}
      />

      {/* 회선 성격 선택 (단기 번호이동 vs 24개월 장기약정) */}
      <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" /> 회선 관리 유형:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLineMode('MNP_PROMO')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              lineMode === 'MNP_PROMO'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            단기 프로모션 환승형 (6~7개월)
          </button>
          <button
            type="button"
            onClick={() => setLineMode('LONG_TERM_CONTRACT')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              lineMode === 'LONG_TERM_CONTRACT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
            }`}
          >
            장기 약정 점검용 (24개월 유지)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <OcrFieldShell
          label="통신망 (Network)"
          reviewState={draft.ocrReviewMap.networkType}
          onToggleConfirm={() => helpers.toggleFieldConfirm('networkType')}
        >
          <ElmSel01
            value={draft.networkType}
            onChange={(v) => helpers.updateField('networkType', v as 'SKT망' | 'KT망' | 'LGU+망')}
            options={[
              { value: 'SKT망', label: 'SKT망 (SK텔레콤 망)' },
              { value: 'KT망', label: 'KT망 (KT 망)' },
              { value: 'LGU+망', label: 'LGU+망 (LG유플러스 망)' },
            ]}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="유심 유형 (USIM / eSIM)"
          reviewState={draft.ocrReviewMap.usimType}
          onToggleConfirm={() => helpers.toggleFieldConfirm('usimType')}
        >
          <ElmSel01
            value={draft.usimType}
            onChange={(v) => helpers.updateField('usimType', v as 'USIM' | 'eSIM')}
            options={[
              { value: 'USIM', label: '실물 USIM (유심 바코드 일련번호 관리)' },
              { value: 'eSIM', label: 'eSIM (QR 다운로드 및 EID)' },
            ]}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="알뜰폰 통신사"
          reviewState={draft.ocrReviewMap.carrierName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('carrierName')}
        >
          <ElmInp01
            value={draft.carrierName}
            onChange={(v) => helpers.updateField('carrierName', v)}
            placeholder="예: SK 7mobile / KT M모바일 / 모나"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="요금제명"
          reviewState={draft.ocrReviewMap.planName}
          onToggleConfirm={() => helpers.toggleFieldConfirm('planName')}
        >
          <ElmInp01
            value={draft.planName}
            onChange={(v) => helpers.updateField('planName', v)}
            placeholder="예: LTE 유심 11GB+ (7개월 특가)"
          />
        </OcrFieldShell>

        {draft.usimType === 'USIM' && (
          <OcrFieldShell
            label="실물 USIM 일련번호 (ICCID 16자리 · 저장 시 자동 마스킹)"
            reviewState={draft.ocrReviewMap.usimSerial}
            onToggleConfirm={() => helpers.toggleFieldConfirm('usimSerial')}
            className="sm:col-span-2"
          >
            <ElmInp01
              value={draft.usimSerial}
              onChange={(v) => helpers.updateField('usimSerial', v)}
              placeholder="예: 8982051900244410 (실물 유심카드 뒷면 일련번호)"
            />
          </OcrFieldShell>
        )}

        <OcrFieldShell
          label="프로모션 월요금 (원)"
          reviewState={draft.ocrReviewMap.promoMonthlyFee}
          onToggleConfirm={() => helpers.toggleFieldConfirm('promoMonthlyFee')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.promoMonthlyFee}
            onChange={(v) => helpers.updateField('promoMonthlyFee', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="만료 후 정상 월요금 (원)"
          reviewState={draft.ocrReviewMap.normalMonthlyFee}
          onToggleConfirm={() => helpers.toggleFieldConfirm('normalMonthlyFee')}
        >
          <ElmInp01
            type="number"
            inputMode="numeric"
            value={draft.normalMonthlyFee}
            onChange={(v) => helpers.updateField('normalMonthlyFee', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="개통일 (90일 제한 기준)"
          reviewState={draft.ocrReviewMap.openedDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('openedDate')}
        >
          <ElmInp01
            type="date"
            value={draft.openedDate}
            onChange={(v) => helpers.updateField('openedDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="프로모션 만료 예정일"
          reviewState={draft.ocrReviewMap.promoEndDate}
          onToggleConfirm={() => helpers.toggleFieldConfirm('promoEndDate')}
        >
          <ElmInp01
            type="date"
            value={draft.promoEndDate}
            onChange={(v) => helpers.updateField('promoEndDate', v)}
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="자동납부 결제수단"
          reviewState={draft.ocrReviewMap.autoPayMethod}
          onToggleConfirm={() => helpers.toggleFieldConfirm('autoPayMethod')}
        >
          <ElmInp01
            value={draft.autoPayMethod}
            onChange={(v) => helpers.updateField('autoPayMethod', v)}
            placeholder="예: 신한카드 자동납부"
          />
        </OcrFieldShell>

        <OcrFieldShell
          label="사은품 · 유지조건 메모"
          reviewState={draft.ocrReviewMap.benefitMemo}
          onToggleConfirm={() => helpers.toggleFieldConfirm('benefitMemo')}
        >
          <ElmInp01
            value={draft.benefitMemo}
            onChange={(v) => helpers.updateField('benefitMemo', v)}
            placeholder="예: 네이버페이 2만원 (3개월 유지)"
          />
        </OcrFieldShell>
      </div>
    </div>
  );
};

// --- 2. 개별 회선 뷰 컴포넌트 (다회선 모드에서 각 회선 렌더링) ---
interface MvnoLineCardProps {
  line: MvnoRoundLineEntry;
  routineId: string;
  isDetailed?: boolean;
  onCaptureStep?: (stepKey: string) => void;
  onToggleStatus?: (newStatus: MvnoRoundLineStatus) => void;
  onNotify?: (msg: string) => void;
}

const MvnoLineCard: React.FC<MvnoLineCardProps> = ({
  line,
  routineId,
  isDetailed = false,
  onCaptureStep,
  onToggleStatus,
  onNotify,
}) => {
  const [showUsim, setShowUsim] = useState(false);
  const fsm = evaluateUrgencyFSM(line.promoEndDate);
  const isLongTerm = line.lineMode === 'LONG_TERM_CONTRACT';

  const copyUsim = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rawOrMasked = line.usimSerialMasked || '8982051900244410';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(rawOrMasked.replace(/[^0-9]/g, ''));
      onNotify?.(`USIM 번호 (${rawOrMasked})가 클립보드에 복사되었습니다.`);
    }
  };

  const statusBadge = () => {
    switch (line.roundStatus) {
      case 'IN_PROGRESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            환승 진행중
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            차수 생략
          </span>
        );
      case 'MAINTAINED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            24개월 유지
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            환승 완료
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
            대기
          </span>
        );
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-3">
      {/* 1. 회선 소유자 및 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200">
            <User className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            {line.ownerName}
          </span>
          <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
            {line.lineAlias}
          </span>
          <span className="font-mono text-xs text-slate-500 dark:text-zinc-400">
            ({line.phoneNumberMasked})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {statusBadge()}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border tabular-nums ${fsm.toneClass}`}
          >
            <Clock className="w-3 h-3" />
            {fsm.dDayText}
          </span>
        </div>
      </div>

      {/* 2. 요금제 및 통신 스펙 */}
      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-zinc-800 p-2.5 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 text-xs">
        <div className="pr-2 space-y-0.5">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 truncate">
            <span className="font-semibold text-sky-600 dark:text-sky-400">{line.networkType}</span>
            <span>· {line.carrierName}</span>
          </div>
          <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">
            {line.planName}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {line.dataCallSpec}
          </div>
        </div>

        <div className="pl-3 space-y-0.5">
          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
            {isLongTerm ? '약정 월요금' : `특가 월요금 (${line.promoMonths}개월)`}
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100 tabular-nums">
            {line.promoMonthlyFee.toLocaleString()}원
            {!isLongTerm && (
              <span className="text-[10px] text-slate-400 ml-1 font-normal">
                (정상 {line.normalMonthlyFee.toLocaleString()}원)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
            {line.autoPayMethod}
          </div>
        </div>
      </div>

      {/* 3. 장기 약정 회선 상세 박스 (선택약정 25% / 24개월) */}
      {isLongTerm && line.contractInfo && (
        <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              24개월 약정 유지 관리 (통신비 결합점검)
            </span>
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-bold">
              약정 만료 D-Day: {line.promoEndDate}
            </span>
          </div>
          <div className="text-[11px] text-indigo-700 dark:text-indigo-300">
            약정유형: 선택약정 25% 요금할인 · {line.contractInfo.bundleMemo}
          </div>
        </div>
      )}

      {/* 4. 차수 생략 사유 (SKIPPED) */}
      {line.roundStatus === 'SKIPPED' && line.skipReason && (
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800/70 text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>생략 사유: {line.skipReason}</span>
        </div>
      )}

      {/* 5. 실물 USIM(ICCID) 일련번호 보안 관리 및 복사 버튼 */}
      {line.usimType === 'USIM' && line.usimSerialMasked && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium">실물 USIM 번호:</span>
            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
              {showUsim ? '8982-0519-0024-4410' : line.usimSerialMasked}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowUsim(!showUsim);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              title={showUsim ? '마스킹 감추기' : '마스킹 일시 해제'}
            >
              {showUsim ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="button"
            onClick={copyUsim}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
          >
            <Copy className="w-3 h-3" />
            유심번호 복사
          </button>
        </div>
      )}

      {/* 6. 회선 상태 전환 버튼 액션바 */}
      <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        {line.roundStatus !== 'IN_PROGRESS' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.('IN_PROGRESS');
            }}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100"
          >
            환승진행 전환
          </button>
        )}
        {line.roundStatus !== 'SKIPPED' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.('SKIPPED');
            }}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-200"
          >
            차수 생략
          </button>
        )}
        {line.roundStatus !== 'MAINTAINED' && isLongTerm && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus?.('MAINTAINED');
            }}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
          >
            24개월 유지
          </button>
        )}
      </div>
    </div>
  );
};

// --- 3. 알뜰폰 메인 플러그인 인터페이스 ---
export const mvnoPlugin: RoutinePlugin<MvnoRoutine> = {
  category: 'LIFE_PHONE',
  enabled: true,
  meta,
  renderIcon: (className = 'w-4 h-4') => <Smartphone className={className} />,

  isUrgent: (item) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    return fsm.state === 'URGENT' || fsm.state === 'OVERDUE' || fsm.state === 'IMMINENT';
  },

  getListSummary: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    const roundInfo = item.roundGroup
      ? `${item.roundGroup.year}-${item.roundGroup.roundNo}차 (${item.roundGroup.lines.length}/${item.roundGroup.maxLineCount}회선)`
      : `${item.networkType} · 월 ${item.promoMonthlyFee.toLocaleString()}원`;
    return {
      statusText: `${fsm.dDayText} · ${roundInfo}`,
      statusClass:
        fsm.state === 'URGENT' || fsm.state === 'OVERDUE'
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-sky-600 dark:text-sky-400',
      metricText: roundInfo,
      quickActionLabel: '환승갱신',
      onQuickAction: () => handlers.onCompleteMvnoRenewal(item.id),
    };
  },

  renderCard: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    const hasRoundGroup = Boolean(item.roundGroup && item.roundGroup.lines.length > 0);
    const roundLines = item.roundGroup?.lines ?? [];
    const maxLines = item.roundGroup?.maxLineCount ?? 5;

    // 회선 카테고리 통계
    const inProgressCount = roundLines.filter((l) => l.roundStatus === 'IN_PROGRESS').length;
    const maintainedCount = roundLines.filter((l) => l.roundStatus === 'MAINTAINED').length;
    const skippedCount = roundLines.filter((l) => l.roundStatus === 'SKIPPED').length;
    const completedCount = roundLines.filter((l) => l.roundStatus === 'COMPLETED').length;

    return (
      <article
        onClick={() => handlers.onOpenDetail(item.id)}
        className="bg-white dark:bg-[#131926] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
      >
        <div className="space-y-3">
          {/* 상단 헤더: 차수 및 D-Day 배지 */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 min-w-0">
              <Smartphone className={`w-4 h-4 shrink-0 ${meta.accentText}`} />
              {hasRoundGroup ? (
                <>
                  <span className="font-bold text-sky-700 dark:text-sky-300 whitespace-nowrap bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                    {item.roundGroup?.year}-{item.roundGroup?.roundNo}차 번호이동 배치
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    (정원 {maxLines}회선)
                  </span>
                </>
              ) : (
                <>
                  <span className={`font-semibold whitespace-nowrap ${meta.accentText}`}>
                    {item.networkType}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-200 truncate">
                    {item.carrierName}
                  </span>
                </>
              )}
              <RoutineHelpTooltip content={meta.tooltip} />
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md border whitespace-nowrap tabular-nums shrink-0 ${fsm.toneClass}`}
            >
              <Clock className="w-3 h-3 shrink-0" />
              {fsm.dDayText} · {fsm.label}
            </span>
          </div>

          {/* 타이틀 및 요약 */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug truncate">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                {hasRoundGroup
                  ? `가족 다인·다회선 관리: 본인(2), 배우자(1), 어머니(1) · 24개월 약정 유지 포함`
                  : `${item.planName} · ${item.dataCallSpec}`}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
          </div>

          {/* 다인 다회선 관리 차수 진행바 */}
          {hasRoundGroup && (
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/80 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  회선 슬롯 할당 현황
                </span>
                <span className="font-mono tabular-nums font-semibold text-slate-600 dark:text-zinc-400">
                  {roundLines.length} / {maxLines} 회선 할당됨
                </span>
              </div>

              {/* 회선 상태 칩 묶음 */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold">
                  환승진행 {inProgressCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                  24개월유지 {maintainedCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold">
                  차수생략 {skippedCount}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  완료 {completedCount}
                </span>
              </div>
            </div>
          )}

          {/* 단일 회선 기본 요약 or 다회선 대표 요약 */}
          {!hasRoundGroup ? (
            <div className="grid grid-cols-2 divide-x divide-slate-200/80 dark:divide-zinc-800 py-2.5 px-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 text-xs">
              <div className="pr-3">
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">현재 특가</div>
                <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono tabular-nums mt-0.5">
                  {item.promoMonthlyFee.toLocaleString()}원
                </div>
              </div>
              <div className="pl-3">
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">만료 후 정상 요금</div>
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-0.5">
                  {item.normalMonthlyFee.toLocaleString()}원
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                차수 등록 대표 회선 미리보기 (총 {roundLines.length}회선)
              </div>
              <div className="grid grid-cols-1 gap-2">
                {roundLines.slice(0, 2).map((line) => (
                  <MvnoLineCard
                    key={line.lineId}
                    line={line}
                    routineId={item.id}
                    onNotify={handlers.onNotify}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 하단 CTA */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
            {hasRoundGroup
              ? `정원 ${maxLines}회선 중 ${roundLines.length}개 관리 중`
              : `만료일 ${item.promoEndDate} · 체크완료`}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onOpenDetail(item.id);
            }}
            className="min-h-[34px] px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            다회선 배치 관리 · 상세
          </button>
        </div>
      </article>
    );
  },

  renderCreateFields: (draft, helpers) => <MvnoCreateFields draft={draft} helpers={helpers} />,

  renderDetailContent: (item, handlers) => {
    const fsm = evaluateUrgencyFSM(item.promoEndDate);
    const hasRoundGroup = Boolean(item.roundGroup && item.roundGroup.lines.length > 0);
    const roundLines = item.roundGroup?.lines ?? [];
    const maxLines = item.roundGroup?.maxLineCount ?? 5;
    const [selectedOwner, setSelectedOwner] = useState<string>('ALL');

    const owners = ['ALL', ...Array.from(new Set(roundLines.map((l) => l.ownerName)))];
    const filteredLines =
      selectedOwner === 'ALL'
        ? roundLines
        : roundLines.filter((l) => l.ownerName === selectedOwner);

    return (
      <div className="space-y-4">
        {/* 상단 차수 관리 헤더 배너 */}
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800 text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              {item.roundGroup
                ? `${item.roundGroup.year}-${item.roundGroup.roundNo}차 번호이동 배치 관리`
                : '알뜰폰 환승 루틴 상세'}
            </div>
            <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">
              정원 {maxLines}회선 중 {roundLines.length}회선 등록됨
            </span>
          </div>
          <p className="text-[11px] text-sky-800 dark:text-sky-300">
            가족 전체의 회선을 연도-차수 단위로 묶어 환승 진행, 24개월 장기약정 유지 점검, 차수 생략을 일괄 관리합니다.
          </p>
        </div>

        {/* 소유자별 탭 필터 (본인 / 배우자 / 어머니 등) */}
        {hasRoundGroup && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {owners.map((owner) => (
              <button
                key={owner}
                type="button"
                onClick={() => setSelectedOwner(owner)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedOwner === owner
                    ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                }`}
              >
                {owner === 'ALL' ? `전체 회선 (${roundLines.length})` : `${owner} (${roundLines.filter((l) => l.ownerName === owner).length})`}
              </button>
            ))}
          </div>
        )}

        {/* 회선 카드 목록 */}
        <div className="space-y-3">
          {filteredLines.map((line) => (
            <MvnoLineCard
              key={line.lineId}
              line={line}
              routineId={item.id}
              isDetailed
              onNotify={handlers.onNotify}
            />
          ))}
        </div>

        {/* 하단 일괄 환승 갱신 */}
        <button
          type="button"
          onClick={() => handlers.onCompleteMvnoRenewal(item.id)}
          className="w-full min-h-[42px] rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
        >
          {item.roundGroup?.year}-{item.roundGroup?.roundNo}차 번호이동 차수 완료 처리 (+차수 갱신)
        </button>
      </div>
    );
  },
};
