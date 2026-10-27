import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Users,
  PiggyBank,
  Coins,
  ArrowRightLeft,
  Layers,
  CreditCard,
  Receipt,
  Bell,
  FileText,
  Clock,
  Tag,
  CheckSquare,
  Camera,
  Maximize2,
  RefreshCw,
  DownloadCloud,
  ExternalLink,
} from 'lucide-react';
import { ElmTip01 } from '../../../sample/elements/Tokens';
import type { LedgerTransaction, LedgerBook } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerProofReconcileModalProps {
  selectedTx: LedgerTransaction | null;
  onClose: () => void;
  currentLedger: LedgerBook;
  onCopyNotice?: (msg: string) => void;
}

export const LedgerProofReconcileModal: React.FC<LedgerProofReconcileModalProps> = ({
  selectedTx,
  onClose,
  currentLedger,
  onCopyNotice,
}) => {
  const [detailProofFilter, setDetailProofFilter] = useState<'ALL' | 'STATEMENT' | 'RECEIPT'>('ALL');
  const [selectedProofItemId, setSelectedProofItemId] = useState<string | null>(null);
  const [lightboxModal, setLightboxModal] = useState<{
    isOpen: boolean;
    title: string;
    imageUrl: string;
    merchant?: string;
    amount?: number;
  } | null>(null);
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);

  if (!selectedTx) return null;

  const proofs = selectedTx.proofs || [];
  const filteredProofs = proofs.filter((p) => {
    if (detailProofFilter === 'STATEMENT') return p.type === 'STATEMENT_LINE' || p.type === 'SMS_NOTIFICATION';
    if (detailProofFilter === 'RECEIPT') return p.type === 'RECEIPT_OCR' || p.type === 'MANUAL' || !p.type;
    return true;
  });
  const activeProof = proofs.find((p) => p.id === selectedProofItemId) || filteredProofs[0] || proofs[0];

  const handleDownloadOriginalProof = (title: string, merchant?: string) => {
    setDownloadingOriginal(true);
    setTimeout(() => {
      setDownloadingOriginal(false);
      onCopyNotice?.(`✓ [${title}${merchant ? ` - ${merchant}` : ''}] 증빙 원본 파일이 다운로드 폴더에 안전하게 저장되었습니다.`);
    }, 900);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in-50">
        <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
          {/* 모달 윈도우 헤더 */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-black border border-indigo-200 dark:border-indigo-800 whitespace-nowrap shrink-0">
                  지출항목 상세정보
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-bold border border-slate-200 dark:border-zinc-700 whitespace-nowrap shrink-0">
                  {selectedTx.type === 'INCOME' ? '수입내역' : selectedTx.type === 'TRANSFER' ? '자산이동내역' : '지출내역'}
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-800/80 text-[11px] font-mono border border-slate-200 dark:border-zinc-700 whitespace-nowrap shrink-0">
                  <span className="text-slate-400">원장 SSOT:</span>
                  <strong className="text-slate-700 dark:text-zinc-200">{selectedTx.expenseRecordId || `atx-${selectedTx.id}`}</strong>
                </div>
              </div>
              <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                {selectedTx.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ① [상단] 공통 및 필수 항목 헤더 요약 바 (Top) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">최종 대사 확정 금액</span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-2">
                  <span>₩{selectedTx.amount.toLocaleString()}원</span>
                  {selectedTx.statementDiscount && selectedTx.statementDiscount > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      카드사 청구할인 -₩{selectedTx.statementDiscount.toLocaleString()} 반영됨
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>대사 수렴 상태: {selectedTx.reconciliationStatus || 'CONFIRMED'}</span>
                </span>
              </div>
            </div>

            {/* 필수 메타데이터 4열 그리드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-2 border-t border-slate-200 dark:border-zinc-700/60">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">승인 및 결제일시</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedTx.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">표준 카테고리</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{selectedTx.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">결제자 / 수단</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  {selectedTx.payerName}
                  {selectedTx.statementCardName ? ` (${selectedTx.statementCardName})` : ''}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">단방향 장부 귀속</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {currentLedger.title} (기준참조)
                </span>
              </div>
            </div>

            {/* 타서비스 관계정보 표시 및 대상 링크 바 */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-700/60 space-y-1.5">
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-zinc-400 block">
                🔗 타 서비스 관계정보 및 정산 연계:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedTx.crossServiceLinks?.dutyId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>모아당번 연계: {selectedTx.crossServiceLinks.dutyTitle}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </span>
                )}
                {selectedTx.crossServiceLinks?.goalId && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                    <PiggyBank className="w-3.5 h-3.5" />
                    <span>모아목표 연계: {selectedTx.crossServiceLinks.goalTitle}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </span>
                )}
                {selectedTx.crossServiceLinks?.guestEventName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>게스트 정산 연계: {selectedTx.crossServiceLinks.guestEventName}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </span>
                )}
                {selectedTx.isAssetTransfer && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>자산이동 (1:1 페어링 연동됨)</span>
                  </span>
                )}
                {selectedTx.tagNames?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-200/80 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ② [중간] 수집방법 목록 테이블 (Mid: 3대 뷰 토글 인터랙션) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white whitespace-nowrap">
                  수집방법 목록 (접수:{proofs.length}건)
                </h4>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setDetailProofFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    detailProofFilter === 'ALL'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                  }`}
                >
                  전체보기 ({proofs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailProofFilter('STATEMENT')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    detailProofFilter === 'STATEMENT'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                  }`}
                >
                  명세보기
                </button>
                <button
                  type="button"
                  onClick={() => setDetailProofFilter('RECEIPT')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    detailProofFilter === 'RECEIPT'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400'
                  }`}
                >
                  영수보기
                </button>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredProofs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  해당 수집 보기 조건에 맞는 등록 건이 없습니다.
                </div>
              ) : (
                filteredProofs.map((prf) => {
                  const isSelected = activeProof?.id === prf.id;
                  return (
                    <div
                      key={prf.id}
                      onClick={() => setSelectedProofItemId(prf.id)}
                      className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                          : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                            prf.type === 'STATEMENT_LINE'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : prf.type === 'RECEIPT_OCR'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : prf.type === 'SMS_NOTIFICATION'
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {prf.type === 'STATEMENT_LINE' ? (
                            <CreditCard className="w-4 h-4" />
                          ) : prf.type === 'RECEIPT_OCR' ? (
                            <Receipt className="w-4 h-4" />
                          ) : prf.type === 'SMS_NOTIFICATION' ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <ElmTip01
                              text={prf.title}
                              onCopyNotice={onCopyNotice}
                              className="max-w-full"
                            >
                              <span
                                className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-[280px] block cursor-pointer hover:text-indigo-600 transition-colors"
                                title="길게 누르면 전체보기 및 복사"
                              >
                                {prf.title}
                              </span>
                            </ElmTip01>
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 shrink-0 whitespace-nowrap">
                              {prf.type === 'STATEMENT_LINE'
                                ? '명세서수집'
                                : prf.type === 'RECEIPT_OCR'
                                ? '영수보기'
                                : prf.type === 'SMS_NOTIFICATION'
                                ? '승인문자'
                                : '영수보기'}
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black shrink-0 whitespace-nowrap">
                                선택됨
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 font-mono text-[10.5px] shrink-0 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{prf.date}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-medium shrink-0 whitespace-nowrap">
                              <Tag className="w-2.5 h-2.5 text-indigo-500" />
                              <span>출처: {prf.source}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white block">
                          ₩{prf.amount.toLocaleString()}원
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          상세보기 클릭 ➔
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ③ [하단] 선택 수집정보 상세 패널 (Bottom: 잔여 속성 전체 표시) */}
          {activeProof && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-indigo-200 dark:border-indigo-900/60 space-y-4 animate-in fade-in-50">
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 dark:border-zinc-700/60 pb-3">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-2xs shrink-0 whitespace-nowrap">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>선택 수집 상세</span>
                  </span>
                  <ElmTip01
                    text={activeProof.title}
                    onCopyNotice={onCopyNotice}
                    className="max-w-full"
                  >
                    <span
                      className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 truncate max-w-[200px] sm:max-w-[320px] block cursor-pointer hover:underline"
                      title="길게 누르면 전체보기 및 복사"
                    >
                      {activeProof.title}
                    </span>
                  </ElmTip01>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-mono font-bold whitespace-nowrap">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>수집출처: {activeProof.source}</span>
                  </span>
                </div>
              </div>

              {/* 1) 명세서 수집 항목인 경우 */}
              {activeProof.type === 'STATEMENT_LINE' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10.5px] text-slate-400 block">카드사 및 카드명</span>
                      <span className="font-black text-slate-800 dark:text-zinc-100">
                        {activeProof.cardName || selectedTx.statementCardName || '우리카드'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10.5px] text-slate-400 block">카드 승인번호</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
                        {activeProof.approvalNo || '83921028'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10.5px] text-slate-400 block">할부 회차</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-100">
                        {activeProof.installmentMonths || '일시불'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10.5px] text-slate-400 block">청구할인 혜택</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        -₩{(activeProof.statementDiscount || selectedTx.statementDiscount || 1000).toLocaleString()}원
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10.5px] text-slate-400 block">결제예정일</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-100">
                        {activeProof.paymentDueDate || '2026년 10월 23일'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10.5px] text-slate-400 block">결제 출금계좌</span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">우리은행</span>
                        <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[11px] whitespace-nowrap">(1002-***-918231)</span>
                      </div>
                    </div>
                  </div>
                  {activeProof.details && (
                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs space-y-1">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200 text-[11px] block">
                        📌 명세서 매핑 특이사항 및 골든 레코드 메모:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700 dark:text-zinc-300 text-[11px]">
                        {activeProof.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 2) 영수증 OCR 수집 항목인 경우 */}
              {activeProof.type === 'RECEIPT_OCR' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                      <span className="text-[10px] text-slate-400 block">사업자등록번호</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {activeProof.businessNumber || '201-81-29182'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                      <span className="text-[10px] text-slate-400 block">대표자명 / 상호</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {activeProof.ceoName || '이진우'} (스타벅스)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                      <span className="text-[10px] text-slate-400 block">부가세 분리</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        세액 ₩{(activeProof.taxAmount || 745).toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                      <span className="text-[10px] text-slate-400 block">현금영수증 식별</span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300">
                        {activeProof.cashReceiptNo || '010-****-9182'}
                      </span>
                    </div>
                  </div>

                  {/* 세부 품목 리스트 */}
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-2">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                      <span>영수증 품목별 단가 및 수량 파싱 내역 (Itemized Lines)</span>
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-zinc-800 text-[10.5px] text-slate-400 font-semibold border-b border-slate-100 dark:border-zinc-700">
                          <tr>
                            <th className="p-2">품목명</th>
                            <th className="p-2 text-center">수량</th>
                            <th className="p-2 text-right">단가</th>
                            <th className="p-2 text-right">금액</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {(activeProof.itemsList || [
                            { name: '아메리카노 T', qty: 1, unitPrice: 4500, totalPrice: 4500 },
                            { name: '바닐라 라떼 G', qty: 1, unitPrice: 5500, totalPrice: 5500 },
                            { name: '개인컵 친환경 할인', qty: 1, unitPrice: -1800, totalPrice: -1800 },
                          ]).map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                              <td className="p-2 font-medium text-slate-800 dark:text-zinc-200">{item.name}</td>
                              <td className="p-2 text-center font-mono">{item.qty}</td>
                              <td className="p-2 text-right font-mono text-slate-500">
                                ₩{item.unitPrice.toLocaleString()}
                              </td>
                              <td className={`p-2 text-right font-mono font-bold ${
                                item.totalPrice < 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                              }`}>
                                ₩{item.totalPrice.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3) 수기 / 문자 등록 항목인 경우 */}
              {(activeProof.type === 'MANUAL' || activeProof.type === 'SMS_NOTIFICATION') && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      {activeProof.type === 'MANUAL' ? '수기 등록 상세 메모' : '카드 승인 SMS 전문'}
                    </span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300 text-[11px]">
                    {activeProof.details?.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 증빙 이미지 미리보기 & 온디맨드 다운로드 */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>증빙 이미지 미리보기</span>
                    <span className="text-[10.5px] text-slate-400 font-normal">
                      (썸네일 클릭 시 확대 조회)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadOriginalProof(
                        activeProof.title,
                        activeProof.merchant || activeProof.cardName
                      )
                    }
                    disabled={downloadingOriginal}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {downloadingOriginal ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>다운로드 중...</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>원본 다운로드</span>
                      </>
                    )}
                  </button>
                </div>
                {/* 썸네일 카드 */}
                <div
                  onClick={() =>
                    setLightboxModal({
                      isOpen: true,
                      title: activeProof.title,
                      imageUrl:
                        activeProof.receiptImageUrl ||
                        'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?auto=format&fit=crop&w=1200&q=80',
                      merchant: activeProof.merchant || activeProof.cardName,
                      amount: activeProof.amount,
                    })
                  }
                  className="group relative w-full sm:w-64 h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 cursor-pointer bg-slate-100 dark:bg-zinc-800 flex items-center justify-center transition-all hover:ring-2 hover:ring-indigo-500/50"
                >
                  <img
                    src={
                      activeProof.receiptImageUrl ||
                      'https://images.unsplash.com/photo-1554415707-9e4466bfe0dc?auto=format&fit=crop&w=400&q=75'
                    }
                    alt={activeProof.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                    <Maximize2 className="w-5 h-5" />
                    <span className="text-[11px] font-bold">전체화면으로 조회</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold">
                    썸네일 캐시
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 모달 닫기 버튼 */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              지출상세 닫기
            </button>
          </div>
        </div>
      </div>

      {/* 고해상도 전체화면 라이트박스 모달 */}
      {lightboxModal && lightboxModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setLightboxModal(null)}
        >
          <div
            className="w-full max-w-3xl flex items-center justify-between pb-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>{lightboxModal.title}</span>
              </span>
              <p className="text-xs text-slate-300">
                {lightboxModal.merchant && `가맹점: ${lightboxModal.merchant} · `}
                {lightboxModal.amount && `금액: ₩${lightboxModal.amount.toLocaleString()}원`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadOriginalProof(
                    lightboxModal.title,
                    lightboxModal.merchant
                  )
                }
                disabled={downloadingOriginal}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {downloadingOriginal ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>다운로드 중...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>원본 다운로드</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLightboxModal(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="닫기 (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div
            className="relative max-w-3xl max-h-[80vh] overflow-auto rounded-2xl border border-white/20 bg-zinc-950 flex items-center justify-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxModal.imageUrl}
              alt={lightboxModal.title}
              className="max-w-full max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
};
