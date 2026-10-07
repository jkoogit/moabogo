import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
  ElmChk01,
} from '../elements/Tokens';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
} from 'lucide-react';

export const SCR_QCK_01_빠른머니등록: React.FC<{
  onClose?: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const [entryType, setEntryType] = useState<'RECEIPT_EXPENSE' | 'TRANSFER_PAYMENT'>('RECEIPT_EXPENSE');
  const [amount, setAmount] = useState('18500');
  const [merchant, setMerchant] = useState('GS25 역삼디오빌점');
  const [targetLedger, setTargetLedger] = useState('GROUP');
  const [payer, setPayer] = useState('구본영(호스트)');
  const [consumer, setConsumer] = useState('가족 전체');
  const [isAssetTransfer, setIsAssetTransfer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `[빠른 등록 완료]\n유형: ${entryType === 'RECEIPT_EXPENSE' ? '영수증 지출' : '이체 지급'}\n` +
      `가맹점: ${merchant}\n금액: ₩${Number(amount).toLocaleString()}원\n` +
      `가계부: ${targetLedger === 'GROUP' ? '우리집 가계부' : '개인 가계부'}`
    );
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              SCR-QCK-01
            </span>
            <ElmTyp01
              title="빠른 머니등록 (영수증 & 이체내역)"
              subtitle="2단계 OCR 및 이체 캡처 자동 파싱"
            />
          </div>
          {onClose && (
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-700 font-semibold">
              닫기 ✕
            </button>
          )}
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setEntryType('RECEIPT_EXPENSE')}
            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
              entryType === 'RECEIPT_EXPENSE'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-4 h-4 mb-1 text-indigo-600" />
            <span className="block">영수증 지출 내역</span>
            <span className="text-[10px] text-slate-400 font-normal">사진 캡처 OCR 자동 파싱</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryType('TRANSFER_PAYMENT')}
            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
              entryType === 'TRANSFER_PAYMENT'
                ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1 text-purple-600" />
            <span className="block">이체 지급 내역</span>
            <span className="text-[10px] text-slate-400 font-normal">은행/페이 이체 화면 캡처</span>
          </button>
        </div>

        {/* File Dropzone Preview */}
        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/60 space-y-2">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-slate-700">
            {entryType === 'RECEIPT_EXPENSE' ? '영수증 사진 업로드' : '이체 확인증 캡처 첨부'}
          </div>
          <p className="text-[11px] text-slate-400">
            자동 분석: 가맹점, 결제일자, 금액, 세부품목이 추출됩니다.
          </p>
        </div>

        {/* Parsed Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <ElmInp01
            label="가맹점 / 수신처"
            value={merchant}
            onChange={setMerchant}
          />

          <div className="grid grid-cols-2 gap-3">
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
                { value: 'GROUP', label: '우리집 가계부 (그룹)' },
                { value: 'PERSONAL', label: '내 개인 가계부' },
                { value: 'INSTANCE', label: '2026 동창회 모임' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <ElmChk01
              checked={isAssetTransfer}
              onChange={setIsAssetTransfer}
              label="자산 이동 처리 (생활비 통계 제외)"
              description="용돈 또는 대여금 지급 시 체크하여 예산 왜곡 방지"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>가계부에 빠른 등록 완료</span>
          </button>
        </form>
      </div>
    </div>
  );
};
