import React, { useState, useEffect } from 'react';
import { CreditCard, X, Plus, Trash2 } from 'lucide-react';
import type { CardStatementIntakeReview } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerStatementEditModalProps {
  isOpen: boolean;
  statement: CardStatementIntakeReview | null;
  onClose: () => void;
  onSave: (statement: CardStatementIntakeReview) => void;
}

export const LedgerStatementEditModal: React.FC<LedgerStatementEditModalProps> = ({
  isOpen,
  statement,
  onClose,
  onSave,
}) => {
  const [editingStatement, setEditingStatement] = useState<CardStatementIntakeReview | null>(statement);

  useEffect(() => {
    if (statement) {
      setEditingStatement(JSON.parse(JSON.stringify(statement)));
    } else {
      setEditingStatement(null);
    }
  }, [statement, isOpen]);

  if (!isOpen || !editingStatement) return null;

  const handleAddLine = () => {
    const newLine = {
      id: `line-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      merchant: '신규 승인 가맹점',
      amount: 10000,
      installment: '일시불',
      approvalNo: `${Math.floor(10000000 + Math.random() * 90000000)}`,
      discount: 0,
      isFixedExpense: false,
    };
    setEditingStatement({
      ...editingStatement,
      lines: [newLine, ...editingStatement.lines],
      txCount: editingStatement.txCount + 1,
      totalBilled: editingStatement.totalBilled + 10000,
      lumpSumCount: editingStatement.lumpSumCount + 1,
    });
  };

  const handleDeleteLine = (lineId: string) => {
    const target = editingStatement.lines.find((l) => l.id === lineId);
    if (!target) return;
    const remaining = editingStatement.lines.filter((l) => l.id !== lineId);
    setEditingStatement({
      ...editingStatement,
      lines: remaining,
      txCount: Math.max(0, editingStatement.txCount - 1),
      totalBilled: Math.max(0, editingStatement.totalBilled - target.amount),
      lumpSumCount: target.installment === '일시불'
        ? Math.max(0, editingStatement.lumpSumCount - 1)
        : editingStatement.lumpSumCount,
      installmentCount: target.installment !== '일시불'
        ? Math.max(0, editingStatement.installmentCount - 1)
        : editingStatement.installmentCount,
    });
  };

  const handleFormSubmit = () => {
    onSave(editingStatement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>카드 이용대금 명세서 등록정보 편집 및 보정</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                OCR 파싱 결과와 청구 메타데이터를 직접 수정하고 승인 라인을 보정합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메타데이터 기본 입력 폼 */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3.5">
          <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-100 block">
            📋 명세서 청구 기본 정보
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
                카드사 및 카드명
              </label>
              <input
                type="text"
                value={editingStatement.cardName}
                onChange={(e) =>
                  setEditingStatement({ ...editingStatement, cardName: e.target.value })
                }
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-bold focus:outline-hidden text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
                청구 기준월 (YYYY-MM)
              </label>
              <input
                type="text"
                value={editingStatement.statementMonth}
                onChange={(e) =>
                  setEditingStatement({ ...editingStatement, statementMonth: e.target.value })
                }
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono focus:outline-hidden text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 mb-1">
                월 총 결제금액 (원)
              </label>
              <input
                type="number"
                value={editingStatement.totalBilled}
                onChange={(e) =>
                  setEditingStatement({
                    ...editingStatement,
                    totalBilled: parseInt(e.target.value || '0', 10),
                  })
                }
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono font-bold text-indigo-600 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500">
                건수 요약: 총 <strong>{editingStatement.txCount}건</strong> (일시불 {editingStatement.lumpSumCount} / 할부 {editingStatement.installmentCount})
              </span>
              <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                파일: {editingStatement.rawFileName}
              </span>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={!editingStatement.needsReview}
                onChange={(e) =>
                  setEditingStatement({ ...editingStatement, needsReview: !e.target.checked })
                }
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>OCR 검토 완료 처리</span>
            </label>
          </div>
        </div>

        {/* 승인 라인 목록 편집 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800 dark:text-zinc-200">
                명세서 승인 라인 목록 ({editingStatement.lines.length}건)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 승인 라인 추가</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-zinc-800/30">
            {editingStatement.lines.map((line, idx) => (
              <div key={line.id} className="pt-2 pb-1 space-y-1.5 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={line.date}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newLines = [...editingStatement.lines];
                        newLines[idx] = { ...line, date: val };
                        setEditingStatement({ ...editingStatement, lines: newLines });
                      }}
                      className="w-24 p-1 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-mono"
                      placeholder="YYYY-MM-DD"
                    />
                    <input
                      type="text"
                      value={line.merchant}
                      onChange={(e) => {
                        const val = e.target.value;
                        const newLines = [...editingStatement.lines];
                        newLines[idx] = { ...line, merchant: val };
                        setEditingStatement({ ...editingStatement, lines: newLines });
                      }}
                      className="flex-1 min-w-[100px] p-1 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-bold"
                      placeholder="가맹점명"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      value={line.amount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value || '0', 10);
                        const newLines = [...editingStatement.lines];
                        const diff = val - line.amount;
                        newLines[idx] = { ...line, amount: val };
                        setEditingStatement({
                          ...editingStatement,
                          lines: newLines,
                          totalBilled: editingStatement.totalBilled + diff,
                        });
                      }}
                      className="w-24 p-1 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-right"
                      placeholder="금액"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteLine(line.id)}
                      className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                      title="라인 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400">구분:</span>
                  <input
                    type="text"
                    value={line.installment}
                    onChange={(e) => {
                      const val = e.target.value;
                      const newLines = [...editingStatement.lines];
                      newLines[idx] = { ...line, installment: val };
                      setEditingStatement({ ...editingStatement, lines: newLines });
                    }}
                    className="w-28 p-0.5 px-1.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[10.5px]"
                    placeholder="일시불 / 할부회차"
                  />
                  <label className="flex items-center gap-1 cursor-pointer text-slate-600 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={line.isFixedExpense || false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const newLines = [...editingStatement.lines];
                        newLines[idx] = { ...line, isFixedExpense: checked };
                        setEditingStatement({ ...editingStatement, lines: newLines });
                      }}
                      className="rounded text-indigo-600 w-3.5 h-3.5"
                    />
                    <span>고정비 지정</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
          >
            보정 완료 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};
