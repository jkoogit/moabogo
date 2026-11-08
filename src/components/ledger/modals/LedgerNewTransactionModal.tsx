import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  X,
  Receipt,
  Camera,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { ElmInp01, ElmSel01, ElmChk01, ElmSld03 } from '../../../sample/elements/Tokens';
import { SAMPLE_RECEIPTS } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';
import type { LedgerBook, LedgerTransaction, FixedIncomeRule } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerNewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLedger: LedgerBook;
  initialType?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  onAddTransaction: (transaction: LedgerTransaction) => void;
  onAddFixedIncomeRule?: (rule: FixedIncomeRule) => void;
  onNotice?: (msg: string) => void;
}

export const LedgerNewTransactionModal: React.FC<LedgerNewTransactionModalProps> = ({
  isOpen,
  onClose,
  currentLedger,
  initialType = 'EXPENSE',
  onAddTransaction,
  onAddFixedIncomeRule,
  onNotice,
}) => {
  const [newTxType, setNewTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>(initialType);
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxTags, setNewTxTags] = useState('');

  // 1) 지출 전용 독립 속성
  const [expensePayMethod, setExpensePayMethod] = useState<'신용카드' | '체크카드' | '계좌이체' | '현금' | '페이결제'>('신용카드');
  const [expenseCard, setExpenseCard] = useState('우리카드');
  const [expenseInstallment, setExpenseInstallment] = useState('일시불');
  const [expenseCategory, setExpenseCategory] = useState('식료품/마트');
  const [expenseAttachProof, setExpenseAttachProof] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrScanResult, setOcrScanResult] = useState<typeof SAMPLE_RECEIPTS[0] | null>(null);

  // 2) 수입 전용 독립 속성
  const [incomeSource, setIncomeSource] = useState('급여/상여');
  const [incomeAccount, setIncomeAccount] = useState('국민 주거래 급여통장');
  const [incomeIsFixedRule, setIncomeIsFixedRule] = useState(false);

  // 3) 자산이동 전용 독립 속성
  const [transferFrom, setTransferFrom] = useState('개인 가계부 (국민 주거래)');
  const [transferTo, setTransferTo] = useState('가족 모임 가계부 (신한)');
  const [transferReason, setTransferReason] = useState('가족 생활비 분담');

  useEffect(() => {
    if (isOpen) {
      setNewTxType(initialType);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const handleApplyOcrSample = (sample: typeof SAMPLE_RECEIPTS[0]) => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      setOcrScanResult(sample);
      setNewTxTitle(sample.merchant);
      setNewTxAmount(String(sample.amount));
      setExpenseCategory(sample.category);
      setExpenseCard(sample.cardName);
      setExpensePayMethod('신용카드');
      setExpenseInstallment('일시불');
      setExpenseAttachProof(true);
      setNewTxTags(`영수증인식, ${sample.category}`);
      onNotice?.(`✓ 영수증 OCR 분석 완료: "${sample.merchant}" (${sample.amountStr}) 정보가 자동 매핑되었습니다.`);
    }, 400);
  };

  const handleSimulateOcrUpload = (fileName: string) => {
    setOcrScanning(true);
    setTimeout(() => {
      setOcrScanning(false);
      const generatedSample = {
        id: `rc-custom-${Date.now()}`,
        icon: '🧾',
        merchant: '현대백화점 판교점',
        amount: 88000,
        amountStr: '88,000원',
        category: '쇼핑/생활',
        cardName: '현대카드',
        itemSummary: '의류 및 생활잡화 구매',
        fileName,
      };
      setOcrScanResult(generatedSample);
      setNewTxTitle(generatedSample.merchant);
      setNewTxAmount(String(generatedSample.amount));
      setExpenseCategory(generatedSample.category);
      setExpenseCard(generatedSample.cardName);
      setExpenseAttachProof(true);
      setNewTxTags('영수증첨부, 현대백화점');
      onNotice?.(`✓ "${fileName}" OCR 광학문자인식 완료: 상호명 및 결제금액이 자동 적용되었습니다.`);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxTitle.trim() || !newTxAmount) return;
    const amt = parseInt(newTxAmount.replace(/[^0-9]/g, '') || '0', 10);
    if (amt <= 0) return;

    const parsedTags = newTxTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const isTransfer = newTxType === 'TRANSFER';
    let finalCategory = expenseCategory;
    let finalNote = '';
    let finalCardName: string | undefined = undefined;
    let finalProofs: any[] = [];

    if (newTxType === 'EXPENSE') {
      finalCategory = expenseCategory;
      finalCardName = expensePayMethod === '신용카드' || expensePayMethod === '체크카드' ? expenseCard : undefined;
      finalNote = `[${expensePayMethod}] ${expenseCard || '일반'} · ${expenseInstallment}`;

      if (expenseAttachProof) {
        finalProofs = [
          {
            id: `prf-new-${Date.now()}`,
            title: ocrScanResult ? `[영수증OCR] ${ocrScanResult.merchant}` : `[수기증빙] ${newTxTitle.trim()} 영수증`,
            type: 'RECEIPT_OCR',
            amount: amt,
            date: new Date().toISOString().slice(0, 10),
            source: ocrScanResult ? 'EasyOCR 사진판독' : '모바일 업로드',
            merchant: ocrScanResult?.merchant || newTxTitle.trim(),
            receiptImageUrl:
              'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?auto=format&fit=crop&w=800&q=75',
            details: [
              `상호명: ${ocrScanResult?.merchant || newTxTitle.trim()}`,
              `결제수단: ${expensePayMethod}`,
              `카드사: ${expenseCard}`,
              `할부: ${expenseInstallment}`,
              ocrScanResult ? `영수증 파일: ${ocrScanResult.fileName}` : '모바일 영수증 촬영 증빙',
            ],
            rawFileName: ocrScanResult?.fileName || 'receipt_capture.jpg',
            businessNumber: '201-81-21515',
            ceoName: '강희석',
            supplyAmount: Math.round(amt / 1.1),
            taxAmount: Math.round(amt - amt / 1.1),
          },
        ];
      }
    } else if (newTxType === 'INCOME') {
      finalCategory = incomeSource;
      finalNote = `[입금계좌] ${incomeAccount}`;
      if (incomeIsFixedRule && onAddFixedIncomeRule) {
        const mappedCategory: '급여' | '배당금' | '이자' | '임대료' | '기타' =
          incomeSource.includes('급여') ? '급여' : incomeSource.includes('이자') ? '이자' : '기타';
        onAddFixedIncomeRule({
          id: `fix-${Date.now()}`,
          name: newTxTitle.trim(),
          amount: amt,
          dayOfMonth: new Date().getDate(),
          category: mappedCategory,
          targetLedgerTitle: currentLedger.title,
          targetLedgerId: currentLedger.id,
          notifyEnabled: true,
          account: incomeAccount,
        });
      }
    } else if (newTxType === 'TRANSFER') {
      finalCategory = '자산이동';
      finalNote = `[자산이동] ${transferFrom} ➔ ${transferTo} (${transferReason})`;
    }

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now()}`,
      ledgerId: currentLedger.id,
      title: newTxTitle.trim(),
      type: newTxType,
      amount: amt,
      category: finalCategory,
      date: new Date().toISOString().slice(0, 10),
      payerName: '구본영(나)',
      note: finalNote,
      statementCardName: finalCardName,
      isAssetTransfer: isTransfer,
      relatedTransferId: isTransfer ? `rel-${Date.now()}` : undefined,
      reconciliationStatus: newTxType === 'EXPENSE' ? 'PENDING' : 'CONFIRMED',
      proofs: finalProofs,
      tagNames:
        parsedTags.length > 0
          ? parsedTags
          : isTransfer
          ? ['자산이동', transferReason]
          : newTxType === 'EXPENSE'
          ? ['지출', expensePayMethod]
          : ['수입', incomeSource],
    };

    onAddTransaction(newTx);
    setNewTxTitle('');
    setNewTxAmount('');
    setNewTxTags('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                newTxType === 'EXPENSE'
                  ? 'bg-pink-100 text-pink-600 dark:bg-pink-950/80 dark:text-pink-300'
                  : newTxType === 'INCOME'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300'
              }`}
            >
              {newTxType === 'EXPENSE' ? (
                <TrendingDown className="w-4 h-4" />
              ) : newTxType === 'INCOME' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <ArrowRightLeft className="w-4 h-4" />
              )}
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>거래 등록</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  newTxType === 'TRANSFER'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    : newTxType === 'INCOME'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                }`}
              >
                {newTxType === 'TRANSFER' ? '자산이동' : newTxType === 'INCOME' ? '수입' : '지출'}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
              {currentLedger.title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3단 탭 */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setNewTxType('EXPENSE')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              newTxType === 'EXPENSE'
                ? 'bg-white dark:bg-zinc-900 text-pink-600 dark:text-pink-400 shadow-2xs font-black'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>지출 (-)</span>
          </button>
          <button
            type="button"
            onClick={() => setNewTxType('INCOME')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              newTxType === 'INCOME'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-black'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>수입 (+)</span>
          </button>
          <button
            type="button"
            onClick={() => setNewTxType('TRANSFER')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              newTxType === 'TRANSFER'
                ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs font-black'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>자산이동 (↔)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* 지출 전용 입력 양식 */}
          {newTxType === 'EXPENSE' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-zinc-900 border border-emerald-200 dark:border-emerald-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                        <span>영수증 사진 촬영 / OCR 파일 첨부</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold">
                          자동 입력
                        </span>
                      </span>
                      <p className="text-[10.5px] text-emerald-800/80 dark:text-emerald-300">
                        영수증을 첨부하면 상호명, 결제금액, 카테고리가 입력란에 자동으로 매핑됩니다.
                      </p>
                    </div>
                  </div>
                  {expenseAttachProof && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpenseAttachProof(false);
                        setOcrScanResult(null);
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      첨부 취소
                    </button>
                  )}
                </div>

                {ocrScanning ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                    <div className="text-xs">
                      <span className="font-bold text-emerald-900 dark:text-emerald-100 block">
                        EasyOCR 영수증 광학 인식 및 항목 파싱 중...
                      </span>
                      <span className="text-[10.5px] text-slate-500 dark:text-zinc-400">
                        가맹점 상호, 결제금액, 세액을 추출하여 아래 입력 양식에 매핑하고 있습니다.
                      </span>
                    </div>
                  </div>
                ) : ocrScanResult ? (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <span>✓ {ocrScanResult.merchant}</span>
                        <span className="font-mono text-slate-900 dark:text-white font-extrabold">
                          ({ocrScanResult.amountStr})
                        </span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                        자동 매핑 완료
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                      <span>{ocrScanResult.fileName} ({ocrScanResult.category})</span>
                      <span>{ocrScanResult.cardName} 결제</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold cursor-pointer shadow-2xs transition-all">
                        <Camera className="w-3.5 h-3.5" />
                        <span>영수증 촬영 / 파일 첨부</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            handleSimulateOcrUpload(file?.name || 'receipt_camera_photo.jpg');
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">또는 샘플 원클릭 인식:</span>
                    </div>
                    <ElmSld03
                      showNavButtons={false}
                      className="w-full"
                      innerClassName="items-center gap-1.5 pb-0.5 flex-nowrap"
                    >
                      {SAMPLE_RECEIPTS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleApplyOcrSample(s)}
                          className="shrink-0 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-slate-700 dark:text-zinc-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          title={`${s.merchant} 영수증 자동 인식 시뮬레이션`}
                        >
                          <span>{s.icon}</span>
                          <span>{s.merchant}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                            {s.amountStr}
                          </span>
                        </button>
                      ))}
                    </ElmSld03>
                  </div>
                )}
              </div>

              <ElmInp01
                label="지출 항목명"
                value={newTxTitle}
                onChange={setNewTxTitle}
                placeholder="예: 주말 이마트 식료품 장보기"
              />

              <div className="grid grid-cols-2 gap-3">
                <ElmInp01
                  label="결제 금액 (원)"
                  value={newTxAmount}
                  onChange={setNewTxAmount}
                  placeholder="예: 58000"
                />
                <ElmSel01
                  label="결제 수단"
                  value={expensePayMethod}
                  onChange={(v) => setExpensePayMethod(v as any)}
                  options={[
                    { value: '신용카드', label: '💳 신용카드' },
                    { value: '체크카드', label: '💳 체크카드' },
                    { value: '계좌이체', label: '🏦 계좌이체' },
                    { value: '현금', label: '💵 현금' },
                    { value: '페이결제', label: '📱 간편결제(네이버/카카오)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ElmSel01
                  label="카드사 / 금융기관"
                  value={expenseCard}
                  onChange={setExpenseCard}
                  options={[
                    { value: '우리카드', label: '우리카드' },
                    { value: '현대카드', label: '현대카드' },
                    { value: 'KB국민카드', label: 'KB국민카드' },
                    { value: '신한카드', label: '신한카드' },
                    { value: '삼성카드', label: '삼성카드' },
                    { value: 'NH농협카드', label: 'NH농협카드' },
                    { value: '기타/직접입력', label: '기타' },
                  ]}
                />
                <ElmSel01
                  label="할부 구분"
                  value={expenseInstallment}
                  onChange={setExpenseInstallment}
                  options={[
                    { value: '일시불', label: '일시불' },
                    { value: '2개월', label: '2개월 무이자' },
                    { value: '3개월', label: '3개월 분납' },
                    { value: '6개월', label: '6개월' },
                    { value: '12개월', label: '12개월' },
                  ]}
                />
              </div>

              <ElmSel01
                label="지출 카테고리"
                value={expenseCategory}
                onChange={setExpenseCategory}
                options={[
                  { value: '식음료/외식', label: '☕ 외식/식음료' },
                  { value: '식료품/마트', label: '🛒 식료품/마트' },
                  { value: '주거/통신', label: '🏠 주거/관리비/통신' },
                  { value: '교통/차량', label: '🚗 교통/유류비' },
                  { value: '의료/건강', label: '💊 의료/약국' },
                  { value: '쇼핑/생활', label: '🛍️ 쇼핑/생활용품' },
                  { value: '문화/취미', label: '🎬 문화/취미' },
                ]}
              />

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-1.5">
                <ElmChk01
                  checked={expenseAttachProof}
                  onChange={setExpenseAttachProof}
                  label="영수증 결제 증빙 첨부 (멀티 증빙 체인 자동 생성)"
                />
                <p className="text-[10px] text-slate-500 dark:text-zinc-400 pl-6">
                  체크 시 단일 지출 3단 뷰어에 수기/영수증 증빙이 체이닝되어 명세서 대사를 지원합니다.
                </p>
              </div>
            </div>
          )}

          {/* 수입 전용 입력 양식 */}
          {newTxType === 'INCOME' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <ElmInp01
                label="수입 항목명"
                value={newTxTitle}
                onChange={setNewTxTitle}
                placeholder="예: 10월 정기 급여 입금"
              />
              <div className="grid grid-cols-2 gap-3">
                <ElmInp01
                  label="입금 금액 (원)"
                  value={newTxAmount}
                  onChange={setNewTxAmount}
                  placeholder="예: 4200000"
                />
                <ElmSel01
                  label="수입 분류"
                  value={incomeSource}
                  onChange={setIncomeSource}
                  options={[
                    { value: '급여/상여', label: '💼 급여 / 상여금' },
                    { value: '용돈/지원금', label: '🎁 용돈 / 회비입금' },
                    { value: '사업/부업', label: '📈 사업 / 프리랜서' },
                    { value: '금융이자', label: '🏦 이자 / 배당 소득' },
                    { value: '중고거래/기타', label: '📦 당근 / 중고판매' },
                  ]}
                />
              </div>
              <ElmSel01
                label="입금 계좌 / 자산"
                value={incomeAccount}
                onChange={setIncomeAccount}
                options={[
                  { value: '국민 주거래 급여통장', label: 'KB국민 주거래 급여통장' },
                  { value: '신한 생활비통장', label: '신한 생활비 전용통장' },
                  { value: '카카오 비상금통장', label: '카카오뱅크 세이프박스' },
                  { value: '현금 보유', label: '현금 보유' },
                ]}
              />
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <ElmChk01
                  checked={incomeIsFixedRule}
                  onChange={setIncomeIsFixedRule}
                  label="매월 정기 고정수입으로 규칙 동시 등록"
                />
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 pl-6">
                  체크 시 고정수입내역에 자동 등록되어 매월 입금 예정 알림과 자동 귀속이 활성화됩니다.
                </p>
              </div>
            </div>
          )}

          {/* 자산이동 전용 입력 양식 */}
          {newTxType === 'TRANSFER' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <ElmInp01
                label="이동 적요 / 제목"
                value={newTxTitle}
                onChange={setNewTxTitle}
                placeholder="예: 가족 모임 통장으로 10월 생활비 이체"
              />
              <ElmInp01
                label="이체 금액 (원)"
                value={newTxAmount}
                onChange={setNewTxAmount}
                placeholder="예: 500000"
              />
              <div className="grid grid-cols-2 gap-3">
                <ElmSel01
                  label="출금처 (From)"
                  value={transferFrom}
                  onChange={setTransferFrom}
                  options={[
                    { value: '개인 가계부 (국민 주거래)', label: '개인 가계부 (국민)' },
                    { value: '신한 생활비통장', label: '신한 생활비통장' },
                    { value: '모아머니 잔액', label: '모아머니 잔액' },
                  ]}
                />
                <ElmSel01
                  label="입금처 (To)"
                  value={transferTo}
                  onChange={setTransferTo}
                  options={[
                    { value: '가족 모임 가계부 (신한)', label: '가족 모임 가계부' },
                    { value: '자녀 용돈 통장', label: '자녀 용돈 통장' },
                    { value: '청약 저축 계좌', label: '주택청약 저축' },
                    { value: '모아머니 잔액', label: '모아머니 충전' },
                  ]}
                />
              </div>
              <ElmSel01
                label="이동 사유 / 목적"
                value={transferReason}
                onChange={setTransferReason}
                options={[
                  { value: '가족 생활비 분담', label: '가족 생활비 분담' },
                  { value: '모임 정산 대납 상계', label: '모임 정산 대납 상계' },
                  { value: '목돈 저축/투자', label: '목돈 저축 / 투자금 이동' },
                  { value: '자녀 용돈 지급', label: '자녀 용돈 지급' },
                ]}
              />
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>모아보고 금전관리 3대 원칙 자동 적용</span>
                </div>
                <p className="text-[10px] text-purple-700 dark:text-purple-300 leading-relaxed">
                  자산이동(TRANSFER)은 순수 생활비 지출/수입 집계에서 제외되며, 1:1 자기참조 페어링(`related_transfer_id`)으로 등록되어 양쪽 장부 간 이중계상을 원천 차단합니다.
                </p>
              </div>
            </div>
          )}

          {/* 공통 태그 입력 */}
          <ElmInp01
            label="태그 입력 (쉼표로 구분)"
            value={newTxTags}
            onChange={setNewTxTags}
            placeholder="예: 대납, 정산요청, 가족외식"
          />

          {/* 하단 액션 버튼 */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all ${
                newTxType === 'EXPENSE'
                  ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/20'
                  : newTxType === 'INCOME'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {newTxType === 'EXPENSE'
                ? '지출 기록하기'
                : newTxType === 'INCOME'
                ? '수입 기록하기'
                : '자산이동 기록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
