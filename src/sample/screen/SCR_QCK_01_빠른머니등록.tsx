import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmStt01,
  ElmChk01,
} from '../elements/Tokens';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  RefreshCw,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SCR_QCK_01_빠른머니등록: React.FC<{
  onClose?: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  const [entryType, setEntryType] = useState<'RECEIPT_EXPENSE' | 'TRANSFER_PAYMENT'>('RECEIPT_EXPENSE');
  const [amount, setAmount] = useState('18500');
  const [merchant, setMerchant] = useState('GS25 역삼디오빌점');
  const [targetLedger, setTargetLedger] = useState('GROUP');
  const [payer, setPayer] = useState('구본영(호스트)');
  const [consumer, setConsumer] = useState('가족 전체');
  const [isAssetTransfer, setIsAssetTransfer] = useState(false);

  // 2단계 OCR 가상 스캔 시뮬레이션 상태
  const [isScanning, setIsScanning] = useState(false);
  const [ocrSuccessNotice, setOcrSuccessNotice] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{ merchant: string; amount: string; type: string } | null>(null);

  // 3대 영수증 모의 프리셋
  const receiptPresets = [
    {
      label: '☕ 스타벅스 커피',
      merchant: '스타벅스 강남R점',
      amount: '11200',
      ledger: 'PERSONAL',
      payer: '구본영',
      consumer: '본인(개인생활비)',
      isTransfer: false,
    },
    {
      label: '🏪 GS25 편의점 야식',
      merchant: 'GS25 역삼디오빌점',
      amount: '18500',
      ledger: 'GROUP',
      payer: '구본영(호스트)',
      consumer: '가족 전체',
      isTransfer: false,
    },
    {
      label: '💸 토스 이체 확인증',
      merchant: '토스뱅크 8201-*** 이체',
      amount: '50000',
      ledger: 'GROUP',
      payer: '구본영(호스트)',
      consumer: '구민우(자녀 용돈지급)',
      isTransfer: true,
    },
  ];

  const handleApplyPreset = (preset: typeof receiptPresets[0]) => {
    setIsScanning(true);
    setOcrSuccessNotice(null);
    setTimeout(() => {
      setIsScanning(false);
      setMerchant(preset.merchant);
      setAmount(preset.amount);
      setTargetLedger(preset.ledger);
      setPayer(preset.payer);
      setConsumer(preset.consumer);
      setIsAssetTransfer(preset.isTransfer);
      setOcrSuccessNotice(`✅ OCR 2단계 자동 추출 완료: "${preset.merchant}" (금액 ₩${Number(preset.amount).toLocaleString()}원)`);
      setTimeout(() => setOcrSuccessNotice(null), 3500);
    }, 650);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess({
      merchant,
      amount: Number(amount).toLocaleString(),
      type: entryType === 'RECEIPT_EXPENSE' ? '영수증 지출' : '이체 지급',
    });
    if (onSuccess) onSuccess();
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6 min-h-screen flex flex-col justify-center transition-colors ${
        resolvedTheme === 'dawn'
          ? 'bg-[#070d1e] text-[#f0f6fc]'
          : isDark
          ? 'bg-[#121215] text-[#f4f4f6]'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`p-6 rounded-2xl border shadow-sm space-y-5 transition-colors ${
          resolvedTheme === 'dawn'
            ? 'bg-[#0d1838] border-[#1e3a6d]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 shrink-0">
              SCR-QCK-01
            </span>
            <ElmTyp01
              title="빠른 머니등록 (영수증 & 이체내역)"
              subtitle="2단계 OCR 가상 스캔 및 생활비 통계 자동 분리"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 인라인 성공 알림 배너 */}
        {submitSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                빠른 등록이 성공적으로 완료되었습니다!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                [{submitSuccess.type}] {submitSuccess.merchant} (₩{submitSuccess.amount}원)
                {isAssetTransfer ? ' • 자산이동 분리 처리됨' : ' • 순수 생활비 반영'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shrink-0"
                >
                  새 내역 계속 등록
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors shrink-0"
                  >
                    대시보드로 복귀
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setEntryType('RECEIPT_EXPENSE')}
            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
              entryType === 'RECEIPT_EXPENSE'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/30'
                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
            }`}
          >
            <Camera className="w-4 h-4 mb-1.5 text-indigo-600 dark:text-indigo-400" />
            <span className="block text-sm">영수증 지출 내역</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-normal">
              사진 캡처 OCR 자동 파싱
            </span>
          </button>

          <button
            type="button"
            onClick={() => setEntryType('TRANSFER_PAYMENT')}
            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
              entryType === 'TRANSFER_PAYMENT'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-purple-500/30'
                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1.5 text-purple-600 dark:text-purple-400" />
            <span className="block text-sm">이체 지급 내역</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-normal">
              은행/페이 이체 화면 캡처
            </span>
          </button>
        </div>

        {/* 2단계 OCR 가상 스캔 프리셋 바 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>원클릭 2단계 OCR 모의 프리셋:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">EasyOCR Pipeline Mock</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {receiptPresets.map((pr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(pr)}
                disabled={isScanning}
                className="p-2.5 rounded-xl border text-left text-xs font-bold transition-all bg-slate-50 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700 hover:border-indigo-400 disabled:opacity-50 cursor-pointer"
              >
                <div className="truncate text-slate-800 dark:text-zinc-100">{pr.label}</div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                  ₩{Number(pr.amount).toLocaleString()}원
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* File Dropzone Preview */}
        <div
          className={`p-4 border-2 border-dashed rounded-xl text-center space-y-2 transition-all ${
            isScanning
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/40'
          }`}
        >
          {isScanning ? (
            <div className="py-3 space-y-2">
              <RefreshCw className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                EasyOCR 엔진 2단계 이미지 분석 중... (0.6초)
              </div>
              <p className="text-[10px] text-slate-400">가맹점, 결제일자, 금액 추출 중</p>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
                {entryType === 'RECEIPT_EXPENSE' ? '영수증 사진 업로드' : '이체 확인증 캡처 첨부'}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                가맹점, 결제일자, 금액이 자동 파싱되어 아래 폼에 입력됩니다.
              </p>
            </>
          )}
        </div>

        {ocrSuccessNotice && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in duration-200">
            {ocrSuccessNotice}
          </div>
        )}

        {/* Parsed Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <ElmInp01
            label="가맹점 / 수신처"
            value={merchant}
            onChange={setMerchant}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ElmInp01
              label="금액 (원)"
              type="number"
              value={amount}
              onChange={setAmount}
            />

            <ElmSel01
              label="등록 대상 가계부"
              value={targetLedger}
              onChange={setTargetLedger}
              options={[
                { value: 'GROUP', label: '우리집 가계부 (가족 공유)' },
                { value: 'PERSONAL', label: '내 개인 가계부 (기본)' },
                { value: 'INSTANCE', label: '2026 동창회 모임 (인스턴스)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ElmInp01
              label="지출자 (결제한 사람)"
              value={payer}
              onChange={setPayer}
            />
            <ElmInp01
              label="소비자 (사용 대상)"
              value={consumer}
              onChange={setConsumer}
            />
          </div>

          {/* 금전관리 3대 원칙: 자산이동 분리 체크박스 */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700">
            <ElmChk01
              checked={isAssetTransfer}
              onChange={setIsAssetTransfer}
              label="자산 이동 처리 (생활비 통계 제외)"
              description="용돈 또는 대여금 등 단순 자산이동 시 체크하여 가계부 순수 생활비 예산 왜곡을 원천 방지합니다."
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 min-h-[44px] py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>가계부에 빠른 등록 완료</span>
          </button>
        </form>
      </div>
    </div>
  );
};
