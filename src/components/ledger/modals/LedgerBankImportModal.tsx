import React, { useState } from 'react';
import { Upload, X, RefreshCw, ShieldCheck, AlertTriangle, Check, CheckSquare, Square } from 'lucide-react';
import { ElmHlp01 } from '../../../sample/elements/Tokens';
import type { BankStatementImportItem } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerBankImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankParsedItems: BankStatementImportItem[];
  registeredBankAccounts: string[];
  detectedAutoAccount: string | null;
  unregisteredAccounts: Array<{ bankName: string; accountNo: string; count: number }>;
  onSimulateBankUpload: () => void;
  onSyncRefresh: () => void;
  onRegisterNewAccount: (bankName: string, accountNo: string) => void;
  onMapToPrimaryAccount: (accountNo: string) => void;
  onToggleSelectAll: () => void;
  onToggleSelectItem: (id: string) => void;
  onUpdateBankItem: (id: string, field: 'inferredType' | 'targetCategory', value: any) => void;
  onBatchImport: () => void;
}

export const LedgerBankImportModal: React.FC<LedgerBankImportModalProps> = ({
  isOpen,
  onClose,
  bankParsedItems,
  registeredBankAccounts,
  detectedAutoAccount,
  unregisteredAccounts,
  onSimulateBankUpload,
  onSyncRefresh,
  onRegisterNewAccount,
  onMapToPrimaryAccount,
  onToggleSelectAll,
  onToggleSelectItem,
  onUpdateBankItem,
  onBatchImport,
}) => {
  const [bankTypeFilter, setBankTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER'>('ALL');
  const [bankSearchKeyword, setBankSearchKeyword] = useState('');

  if (!isOpen) return null;

  const filteredItems = bankParsedItems.filter((item) => {
    if (bankTypeFilter !== 'ALL' && item.inferredType !== bankTypeFilter) return false;
    if (bankSearchKeyword) {
      const kw = bankSearchKeyword.toLowerCase();
      return (
        item.description.toLowerCase().includes(kw) ||
        item.bankName.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const selectedCount = bankParsedItems.filter((i) => i.selected).length;
  const totalSelectedDeposit = bankParsedItems
    .filter((i) => i.selected && i.depositAmount > 0)
    .reduce((acc, cur) => acc + cur.depositAmount, 0);
  const totalSelectedWithdraw = bankParsedItems
    .filter((i) => i.selected && i.withdrawAmount > 0)
    .reduce((acc, cur) => acc + cur.withdrawAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>통장 거래내역 일괄등록 및 대사 관리</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                엑셀/CSV 파일 첨부 또는 은행 연동 내역을 검토하고 가계부 원장(SSOT)에 일괄 등록합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ElmHlp01
              title="통장내역 일괄등록 안내"
              tooltip="통장 거래내역 일괄등록 안내"
              colorScheme="sky"
              headerIcon={Upload}
              align="right"
            >
              <p className="text-[11px] leading-relaxed">
                은행별 엑셀 다운로드 파일 또는 오픈뱅킹 계좌 내역을 분석하여, 입금(수입), 출금(지출), 계좌간 송금(자산이동)을 자동으로 추론합니다. 체크박스로 원하는 내역만 골라 한 번에 장부에 등록할 수 있습니다.
              </p>
            </ElmHlp01>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 상단 툴바 및 필터 */}
        <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onSimulateBankUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>📁 엑셀 파일 첨부 시뮬레이션</span>
              </button>
              <button
                type="button"
                onClick={onSyncRefresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>내역 새로고침</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-sky-800 dark:text-sky-300 font-medium">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-200/70 dark:bg-sky-900 font-bold">대표연동</span>
                <span>{registeredBankAccounts[0] || detectedAutoAccount}</span>
              </div>
            </div>
          </div>

          {/* 가계부 연동 계좌 풀 및 중복제거 안내 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 break-keep">
              <span className="font-bold text-slate-700 dark:text-zinc-300 shrink-0">연동 계좌 풀:</span>
              {registeredBankAccounts.map((acc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white dark:bg-[#111318] text-slate-700 dark:text-zinc-300 font-mono text-[10.5px] border border-slate-200 dark:border-[#1e2029] whitespace-nowrap"
                >
                  {acc}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-100/70 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 text-[10.5px] font-medium break-keep">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>중복 방지 원칙: 엑셀 내역 중 일자·적요·금액 동일 건은 단 1건으로 자동 통합됩니다.</span>
            </div>
          </div>

          {/* 미등록 계좌 감지 배너 */}
          {unregisteredAccounts.length > 0 && (
            <div className="space-y-2 pt-1">
              {unregisteredAccounts.map((uAcc) => (
                <div
                  key={`${uAcc.bankName}-${uAcc.accountNo}`}
                  className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in"
                >
                  <div className="flex items-start sm:items-center gap-2 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold break-keep">
                        <span className="text-amber-800 dark:text-amber-300">⚠️ 미등록 계좌:</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 font-semibold text-amber-950 dark:text-amber-100 whitespace-nowrap">
                          {uAcc.bankName}
                        </span>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-[#111318] border border-amber-300 dark:border-amber-800 text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                          {uAcc.accountNo}
                        </span>
                        <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold whitespace-nowrap">
                          {uAcc.count}건
                        </span>
                      </div>
                      <p className="text-[10.5px] text-amber-700 dark:text-amber-300 break-keep">
                        가계부에 등록되지 않은 계좌입니다. 새 보조 계좌로 추가하거나 대표 계좌로 귀속 매핑하세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onRegisterNewAccount(uAcc.bankName, uAcc.accountNo)}
                      className="px-2.5 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-2xs cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                    >
                      + 새 보조계좌로 등록
                    </button>
                    <button
                      type="button"
                      onClick={() => onMapToPrimaryAccount(uAcc.accountNo)}
                      className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 font-bold text-[11px] hover:bg-amber-100 dark:hover:bg-zinc-700 cursor-pointer transition-all whitespace-nowrap"
                    >
                      대표계좌 귀속 매핑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 whitespace-nowrap font-semibold">구분 필터:</span>
              <div className="flex items-center bg-white dark:bg-zinc-900 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs flex-1">
                <button
                  type="button"
                  onClick={() => setBankTypeFilter('ALL')}
                  className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors cursor-pointer ${
                    bankTypeFilter === 'ALL'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => setBankTypeFilter('INCOME')}
                  className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors cursor-pointer ${
                    bankTypeFilter === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                  }`}
                >
                  수입(입금)
                </button>
                <button
                  type="button"
                  onClick={() => setBankTypeFilter('EXPENSE')}
                  className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors cursor-pointer ${
                    bankTypeFilter === 'EXPENSE'
                      ? 'bg-pink-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                  }`}
                >
                  지출(출금)
                </button>
                <button
                  type="button"
                  onClick={() => setBankTypeFilter('TRANSFER')}
                  className={`flex-1 py-1 rounded-lg font-bold text-center transition-colors cursor-pointer ${
                    bankTypeFilter === 'TRANSFER'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                  }`}
                >
                  자산이동
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={bankSearchKeyword}
                onChange={(e) => setBankSearchKeyword(e.target.value)}
                placeholder="적요, 은행명 검색..."
                className="w-full p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* 통계 요약 뱃지 바 */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-slate-800 dark:text-zinc-200">
              파싱된 통장 거래내역
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-mono font-bold text-[10px]">
              선택 {selectedCount} / {bankParsedItems.length}건
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-emerald-600 font-bold">
              입금 +₩{totalSelectedDeposit.toLocaleString()}원
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-600 font-bold">
              출금 -₩{totalSelectedWithdraw.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 테이블 목록 */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center justify-between p-2 pb-1 text-xs">
            <button
              type="button"
              onClick={onToggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-zinc-300 cursor-pointer"
            >
              {selectedCount === bankParsedItems.length ? (
                <CheckSquare className="w-4 h-4 text-sky-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>전체 선택 / 해제</span>
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              필터에 일치하는 거래내역이 없습니다.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl transition-all space-y-1.5 ${
                  item.selected
                    ? 'bg-white dark:bg-zinc-900 border border-sky-200 dark:border-sky-800 shadow-2xs'
                    : 'bg-transparent opacity-75'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => onToggleSelectItem(item.id)}
                      className="rounded text-sky-600 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-slate-400">
                      {item.date}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                      {item.bankName}
                    </span>
                    <strong className="text-xs text-slate-800 dark:text-zinc-100">
                      {item.description}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.depositAmount > 0 ? (
                      <span className="font-mono font-bold text-emerald-600 text-xs">
                        +₩{item.depositAmount.toLocaleString()}원
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-rose-600 text-xs">
                        -₩{item.withdrawAmount.toLocaleString()}원
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pl-6 text-[11px]">
                  <span className="text-slate-400 font-mono text-[10.5px]">
                    계좌: {item.accountNoMasked}
                  </span>
                  <select
                    value={item.inferredType}
                    onChange={(e) => onUpdateBankItem(item.id, 'inferredType', e.target.value)}
                    className="p-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-bold focus:outline-hidden"
                  >
                    <option value="EXPENSE">지출 (출금)</option>
                    <option value="INCOME">수입 (입금)</option>
                    <option value="TRANSFER">자산이동</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-[11px] text-slate-400">
            선택된 거래내역은 가계부 원장(SSOT)에 대사 확정 건으로 기록됩니다.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={onBatchImport}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold cursor-pointer shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>선택 내역 원장에 일괄 등록 ({selectedCount}건)</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
