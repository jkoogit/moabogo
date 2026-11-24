import React, { useRef, useState } from 'react';
import { addOfflineQueueItem } from '../../data/offlineQueueStore';
import {
  buildOcrPreviewSvgDataUrl,
  createIdempotencyKey,
  LEDGER_OPTIONS,
  MoneyEntryType,
  ReceiptOcrPreset,
} from './quickEntryData';

export interface MoneySubmitResult {
  merchant: string;
  amount: string;
  type: string;
  idempotencyKey: string;
  queuedOffline: boolean;
}

/** SCR_QCK_01 비즈니스 상태 · OCR 2단계 추출 · 오프라인 큐 제출 훅 */
export function useQuickMoneyEntry(isOffline: boolean, onSuccess?: () => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entryType, setEntryType] = useState<MoneyEntryType>('RECEIPT_EXPENSE');
  const [amount, setAmount] = useState('18500');
  const [merchant, setMerchant] = useState('GS25 역삼디오빌점');
  const [paidAt, setPaidAt] = useState('2026-11-25 09:10');
  const [targetLedger, setTargetLedger] = useState<'PERSONAL' | 'GROUP' | 'INSTANCE'>('GROUP');
  const [payer, setPayer] = useState('구본영(호스트)');
  const [consumer, setConsumer] = useState('가족 전체');
  const [isAssetTransfer, setIsAssetTransfer] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(['#생활비']);

  const [isScanning, setIsScanning] = useState(false);
  const [ocrStage, setOcrStage] = useState<'IDLE' | 'SCANNING' | 'PREVIEW_READY'>('IDLE');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<string>('97.9%');
  const [ocrRawLines, setOcrRawLines] = useState<string[]>([]);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<MoneySubmitResult | null>(null);

  const selectedLedgerMeta =
    LEDGER_OPTIONS.find((opt) => opt.value === targetLedger) || LEDGER_OPTIONS[0];

  const handleModeChange = (nextType: MoneyEntryType) => {
    setEntryType(nextType);
    if (nextType === 'TRANSFER_PAYMENT') {
      setIsAssetTransfer(true);
    }
  };

  const runMockOcrStage = (preset: ReceiptOcrPreset) => {
    setIsScanning(true);
    setOcrStage('SCANNING');
    setSubmitSuccess(null);

    window.setTimeout(() => {
      setIsScanning(false);
      setOcrStage('PREVIEW_READY');
      setEntryType(preset.entryType);
      setMerchant(preset.merchant);
      setAmount(preset.amount);
      setPaidAt(preset.paidAt);
      setTargetLedger(preset.ledger);
      setPayer(preset.payer);
      setConsumer(preset.consumer);
      setIsAssetTransfer(preset.isTransfer);
      setSelectedTags(preset.tags);
      setOcrConfidence(preset.confidence);
      setOcrRawLines(preset.rawLines);
      setPreviewImageUrl(
        buildOcrPreviewSvgDataUrl(preset.merchant, preset.amount, preset.rawLines, preset.isTransfer)
      );
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      setIsScanning(true);
      setOcrStage('SCANNING');
      setSubmitSuccess(null);

      window.setTimeout(() => {
        setIsScanning(false);
        setOcrStage('PREVIEW_READY');
        setPreviewImageUrl(dataUrl);
        setOcrConfidence('96.4%');
        setOcrRawLines([
          `파일명: ${file.name}`,
          `추출 가맹점: ${merchant || '신규 영수증'}`,
          `확인 금액: ₩${Number(amount || 0).toLocaleString()}원`,
        ]);
      }, 450);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClearOcrPreview = () => {
    setOcrStage('IDLE');
    setPreviewImageUrl(null);
    setOcrRawLines([]);
    setIsPreviewExpanded(false);
  };

  const handleSubmitForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const numericAmount = Math.max(0, Number(amount) || 0);
    const idempotencyKey = createIdempotencyKey('qck_mon');
    const networkOffline =
      isOffline || (typeof navigator !== 'undefined' && navigator.onLine === false);

    if (networkOffline) {
      addOfflineQueueItem({
        idempotencyKey,
        type: 'LEDGER_EXPENSE',
        title: `${isAssetTransfer ? '[TRANSFER] ' : ''}${merchant || '빠른 머니등록'}`,
        amount: numericAmount,
        ledgerName: selectedLedgerMeta.label,
        payerName: payer,
        category: selectedTags.join(', ') || '일반',
        memo: `소비자: ${consumer} · ${isAssetTransfer ? '자산이동 분리' : '생활비 반영'}`,
      });
    }

    setSubmitSuccess({
      merchant: merchant || '미지정 가맹점',
      amount: numericAmount.toLocaleString(),
      type: entryType === 'RECEIPT_EXPENSE' ? '영수증 지출' : '이체 지급',
      idempotencyKey,
      queuedOffline: networkOffline,
    });
    if (onSuccess) onSuccess();
  };

  return {
    fileInputRef,
    entryType,
    amount,
    setAmount,
    merchant,
    setMerchant,
    paidAt,
    targetLedger,
    setTargetLedger,
    payer,
    setPayer,
    consumer,
    setConsumer,
    isAssetTransfer,
    setIsAssetTransfer,
    selectedTags,
    isScanning,
    ocrStage,
    previewImageUrl,
    ocrConfidence,
    ocrRawLines,
    isPreviewExpanded,
    setIsPreviewExpanded,
    submitSuccess,
    setSubmitSuccess,
    selectedLedgerMeta,
    handleModeChange,
    runMockOcrStage,
    handleFileUpload,
    handleToggleTag,
    handleClearOcrPreview,
    handleSubmitForm,
  };
}
