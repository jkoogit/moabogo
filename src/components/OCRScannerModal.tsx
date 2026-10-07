import React, { useState } from 'react';
import { User, Ledger } from '../types';
import {
  X,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileText,
  KeyRound,
  RotateCw,
  Hash,
  Cpu,
} from 'lucide-react';

interface OCRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLedger: Ledger | null;
  currentUser: User | null;
  isOffline: boolean;
  onSuccessTransaction: (txData: any) => void;
  onOpenSettings: () => void;
}

export const OCRScannerModal: React.FC<OCRScannerModalProps> = ({
  isOpen,
  onClose,
  activeLedger,
  currentUser,
  isOffline,
  onSuccessTransaction,
  onOpenSettings,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  // Form fields for OCR Result & Manual Correction
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('식음료/카페');
  const [isAssetTransfer, setIsAssetTransfer] = useState(false);
  const [flaggedFields, setFlaggedFields] = useState<string[]>([]);
  const [engineUsed, setEngineUsed] = useState<string>('');
  const [imageHash, setImageHash] = useState<string>('');
  const [parsedItems, setParsedItems] = useState<Array<{ name: string; price: number; qty: number }>>([]);
  const [step, setStep] = useState<'UPLOAD' | 'REVIEW'>('UPLOAD');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectSample = (sampleType: 'clear' | 'blurry') => {
    if (sampleType === 'clear') {
      setSelectedFile(new File(['dummy-receipt'], 'starbucks_receipt.jpg', { type: 'image/jpeg' }));
      setPreviewUrl('https://images.unsplash.com/photo-1554415707-9e4c2bc052df?w=600&auto=format&fit=crop&q=60');
      setSimulateError(false);
    } else {
      setSelectedFile(new File(['dummy-receipt-blurry'], 'blurry_unclear_receipt.jpg', { type: 'image/jpeg' }));
      setPreviewUrl('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=60');
      setSimulateError(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setSimulateError(false);
    }
  };

  const handleRunOCR = async () => {
    if (isOffline) {
      alert('오프라인 환경에서는 OCR 업로드가 차단됩니다.');
      return;
    }
    if (!selectedFile && !previewUrl) return;

    setIsProcessing(true);
    setWarningMessage(null);

    try {
      const fileName = simulateError ? 'blur_failed_receipt.jpg' : selectedFile?.name || 'receipt.jpg';

      const res = await fetch('/api/v1/ocr/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_name: fileName,
          user_ocr_key: currentUser?.personal_ocr_key || '',
        }),
      });

      const data = await res.json();

      // Poll task result
      setTimeout(async () => {
        const taskRes = await fetch(`/api/v1/ocr/tasks/${data.task_id}`);
        const taskData = await taskRes.json();
        setIsProcessing(false);

        if (taskData.ocr_result) {
          const resObj = taskData.ocr_result;
          setMerchantName(resObj.merchant_name || '');
          setAmount(resObj.amount ? String(resObj.amount) : '');
          setDate(resObj.transaction_date ? resObj.transaction_date.slice(0, 10) : new Date().toISOString().slice(0, 10));
          setFlaggedFields(resObj.flagged_fields || []);
          setEngineUsed(resObj.engine_used);
          setImageHash(taskData.image_hash?.slice(0, 16) || '7f9a2b...');
          setParsedItems(resObj.items || []);
          setStep('REVIEW');

          if (resObj.flagged_fields && resObj.flagged_fields.length > 0) {
            setWarningMessage('영수증의 일부 항목이 불명확합니다. 주황색/붉은색으로 강조된 항목을 직접 확인 및 보정해주세요.');
          }
        }
      }, 700);
    } catch (err) {
      setIsProcessing(false);
      alert('OCR 분석 요청 중 오류가 발생했습니다.');
    }
  };

  const handleConfirmTransaction = async () => {
    if (!merchantName || !amount) {
      alert('가맹점명과 금액을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/ledgers/${activeLedger?.ledger_id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: 'EXPENSE',
          amount: Number(amount),
          merchant_name: merchantName,
          category_name: category,
          transaction_date: date ? new Date(date).toISOString() : new Date().toISOString(),
          is_asset_transfer: isAssetTransfer,
          note: `[2단계 OCR 인증: ${engineUsed === 'USER_KEY_OCR' ? '개인 Key' : '로컬 EasyOCR'}]`,
        }),
      });

      if (res.status === 409) {
        const errData = await res.json();
        const proceed = confirm(`[중복 경고]\n${errData.message}\n그래도 등록하시겠습니까?`);
        if (proceed) {
          await fetch(`/api/v1/ledgers/${activeLedger?.ledger_id}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transaction_type: 'EXPENSE',
              amount: Number(amount),
              merchant_name: merchantName,
              category_name: category,
              transaction_date: date ? new Date(date).toISOString() : new Date().toISOString(),
              is_asset_transfer: isAssetTransfer,
              note: `[중복 강제등록 OCR]`,
              force: true,
            }),
          });
          onSuccessTransaction({});
          onClose();
        }
        return;
      }

      const savedTx = await res.json();
      onSuccessTransaction(savedTx);
      onClose();
    } catch (err) {
      alert('내역 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                2단계 스마트 영수증 OCR
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  우분투 세마포어 1~2 제한
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                1차 로컬 EasyOCR (2G/2C) → 실패 시 2차 사용자 개인 API Key Fallback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 'UPLOAD' ? (
            <div className="space-y-4">
              {/* Sample selection chips for instant testing */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  빠른 테스트를 위한 샘플 영수증 선택:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSample('clear')}
                    className="p-3 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-left transition-all"
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      선명한 영수증 (정상 인식)
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      GS25 편의점, 18,500원 자동 완벽 파싱
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('blurry')}
                    className="p-3 rounded-xl border border-amber-600/40 bg-amber-500/5 hover:bg-amber-500/10 text-left transition-all"
                  >
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      흐린 영수증 (오인식 예외 모달 테스트)
                    </div>
                    <p className="text-[11px] text-amber-200/70 mt-1">
                      주황색 테두리 하이라이트 및 수동 보정 가드레일
                    </p>
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-2xl p-6 text-center bg-slate-900/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="max-h-48 mx-auto rounded-lg object-contain border border-slate-700"
                    />
                    <div className="text-xs text-slate-300 font-medium">
                      선택된 영수증: {selectedFile?.name || '샘플 영수증'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      영수증 이미지를 드래그하거나 클릭하여 업로드
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, HEIC 지원 (최대 10MB)</p>
                  </div>
                )}
              </div>

              {/* Engine Architecture Indicator */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    서버 비용 0원 & OOM 방지 정책
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentUser?.personal_ocr_key ? '2차 사용자 Key 등록됨' : '1차 로컬 엔진 우선'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  우분투 호스트에서 세마포어로 동시 요청을 1~2건으로 제어하여 PostgreSQL 메모리 OOM을 원천 차단합니다. 1차 인식 불가 시 사용자가 등록한 개인 Key로만 2차가 호출됩니다.
                </p>
                {!currentUser?.personal_ocr_key && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium pt-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> 개인 2차 OCR Key (OpenAI/Google Vision) 등록하기
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* REVIEW & MANUAL CORRECTION STEP */
            <div className="space-y-4">
              {warningMessage && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">오인식 예외 감지!</span>
                    <p className="mt-0.5 text-amber-200/90 leading-relaxed">{warningMessage}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">사용된 엔진:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                    {engineUsed === 'USER_KEY_OCR' ? '2차 사용자 개인 Key' : '1차 Docker EasyOCR'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span>해시: {imageHash}...</span>
                </div>
              </div>

              {/* Form with Error Highlighting (Orange/Red borders per PRD) */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    가맹점명 (상호명)
                    {flaggedFields.includes('merchant_name') && (
                      <span className="ml-1.5 text-amber-400 font-bold text-[11px]">
                        ⚠️ 인식 불확실 — 확인 필요
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => {
                      setMerchantName(e.target.value);
                      setFlaggedFields(flaggedFields.filter((f) => f !== 'merchant_name'));
                    }}
                    placeholder="가맹점명을 입력하세요"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-800 text-sm font-medium text-white transition-all ${
                      flaggedFields.includes('merchant_name')
                        ? 'border-2 border-amber-500 bg-amber-500/10 focus:border-amber-400 focus:outline-none'
                        : 'border border-slate-700 focus:border-blue-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      결제 금액 (원)
                      {flaggedFields.includes('amount') && (
                        <span className="ml-1.5 text-rose-400 font-bold text-[11px]">
                          ⚠️ 금액 확인 필요
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setFlaggedFields(flaggedFields.filter((f) => f !== 'amount'));
                      }}
                      placeholder="0"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-800 text-sm font-mono font-bold text-white transition-all ${
                        flaggedFields.includes('amount')
                          ? 'border-2 border-rose-500 bg-rose-500/10 focus:border-rose-400 focus:outline-none'
                          : 'border border-slate-700 focus:border-blue-500 focus:outline-none'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      결제 일자
                      {flaggedFields.includes('transaction_date') && (
                        <span className="ml-1.5 text-amber-400 font-bold text-[11px]">
                          ⚠️ 날짜 보정 필요
                        </span>
                      )}
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setFlaggedFields(flaggedFields.filter((f) => f !== 'transaction_date'));
                      }}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-800 text-sm font-medium text-white transition-all ${
                        flaggedFields.includes('transaction_date')
                          ? 'border-2 border-amber-500 bg-amber-500/10 focus:border-amber-400 focus:outline-none'
                          : 'border border-slate-700 focus:border-blue-500 focus:outline-none'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      카테고리
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="식음료/카페">식음료/카페</option>
                      <option value="식료품/마트">식료품/마트</option>
                      <option value="생활/잡화">생활/잡화</option>
                      <option value="교통/유류">교통/유류</option>
                      <option value="문화/여가">문화/여가</option>
                      <option value="모임/정산">모임/정산</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      회계 분류 (자산 이동 여부)
                    </label>
                    <div className="flex items-center h-10 px-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={isAssetTransfer}
                          onChange={(e) => setIsAssetTransfer(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700"
                        />
                        <span>생활비 지출 통계에서 제외 (자산 이동)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Parsed Line Items (if available) */}
                {parsedItems.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      파싱된 세부 품목 내역:
                    </span>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800 text-xs">
                      {parsedItems.map((item, i) => (
                        <div key={i} className="p-2.5 flex items-center justify-between text-slate-300">
                          <span>{item.name} x {item.qty}</span>
                          <span className="font-mono font-medium">₩{item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {step === 'REVIEW' ? (
            <button
              type="button"
              onClick={() => setStep('UPLOAD')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ← 다시 스캔
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              {activeLedger ? `저장 대상: ${activeLedger.ledger_name}` : ''}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              취소
            </button>

            {step === 'UPLOAD' ? (
              <button
                type="button"
                onClick={handleRunOCR}
                disabled={isProcessing || (!selectedFile && !previewUrl)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>OCR 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>2단계 OCR 분석 실행</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmTransaction}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>가계부에 최종 등록</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
