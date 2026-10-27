import React, { useState } from 'react';
import { Bell, X, Plus } from 'lucide-react';
import { ElmInp01, ElmSel01, ElmTip01 } from '../../../sample/elements/Tokens';
import type { FixedIncomeRule } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerFixedIncomeModalProps {
  isOpen: boolean;
  rules: FixedIncomeRule[];
  onClose: () => void;
  currentLedgerTitle: string;
  currentLedgerId: string;
  onSaveRule: (rule: FixedIncomeRule) => void;
  onDeleteRule: (ruleId: string, ruleName: string) => void;
  onToggleNotify: (ruleId: string) => void;
  onCopyNotice?: (msg: string) => void;
}

export const LedgerFixedIncomeModal: React.FC<LedgerFixedIncomeModalProps> = ({
  isOpen,
  rules,
  onClose,
  currentLedgerTitle,
  currentLedgerId,
  onSaveRule,
  onDeleteRule,
  onToggleNotify,
  onCopyNotice,
}) => {
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('25');
  const [category, setCategory] = useState<'급여' | '배당금' | '이자' | '임대료' | '기타'>('급여');
  const [account, setAccount] = useState('주거래 통장');
  const [notify, setNotify] = useState(true);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingRuleId(null);
    setName('');
    setAmount('');
    setDay('25');
    setCategory('급여');
    setAccount('주거래 통장');
    setNotify(true);
    setIsRuleFormOpen(true);
  };

  const handleOpenEdit = (rule: FixedIncomeRule) => {
    setEditingRuleId(rule.id);
    setName(rule.name);
    setAmount(rule.amount.toString());
    setDay(rule.dayOfMonth.toString());
    setCategory(rule.category);
    setAccount(rule.account);
    setNotify(rule.notifyEnabled);
    setIsRuleFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, '') || '0', 10);
    const parsedDay = Math.min(31, Math.max(1, parseInt(day, 10) || 25));

    const rule: FixedIncomeRule = {
      id: editingRuleId || `fir-${Date.now()}`,
      name: name.trim(),
      amount: parsedAmount,
      dayOfMonth: parsedDay,
      category,
      targetLedgerTitle: currentLedgerTitle,
      targetLedgerId: currentLedgerId,
      notifyEnabled: notify,
      account: account.trim() || '주거래 통장',
    };

    onSaveRule(rule);
    setIsRuleFormOpen(false);
    setEditingRuleId(null);
  };

  const handleCloseModal = () => {
    setIsRuleFormOpen(false);
    setEditingRuleId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="whitespace-nowrap">고정수입 및 정기 입금 규칙</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold shrink-0">
                  {rules.length}건
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                매월 지정된 일자에 자동으로 수입을 등록하거나 정기 입금 알림을 생성합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!isRuleFormOpen && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>새 규칙 추가</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCloseModal}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 규칙 추가/수정 폼 */}
        {isRuleFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3.5 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 pb-2">
              <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                <span>{editingRuleId ? '✏️ 고정수입 규칙 수정' : '➕ 새 고정수입 규칙 등록'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRuleFormOpen(false);
                  setEditingRuleId(null);
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                닫기
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ElmInp01
                label="규칙 명칭 / 항목명"
                value={name}
                onChange={setName}
                placeholder="예: 회사 월급, 부동산 월세, 부모님 용돈"
              />
              <ElmInp01
                label="정기 입금액 (원)"
                value={amount}
                onChange={setAmount}
                placeholder="예: 3500000"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  매월 입금일 (1~31일)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-bold">매월</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-20 p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-center"
                  />
                  <span className="text-xs text-slate-500 font-bold">일</span>
                </div>
              </div>
              <ElmSel01
                label="수입 분류"
                value={category}
                onChange={(val) => setCategory(val as any)}
                options={[
                  { value: '급여', label: '💼 급여' },
                  { value: '배당금', label: '📈 배당금' },
                  { value: '이자', label: '🏦 이자' },
                  { value: '임대료', label: '🏠 임대료' },
                  { value: '기타', label: '🎁 기타 정기수입' },
                ]}
              />
              <ElmInp01
                label="입금 계좌 / 자산"
                value={account}
                onChange={setAccount}
                placeholder="예: 국민 주거래 통장"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer shrink-0 select-none">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="whitespace-nowrap">정기 입금 당일 자동 알림 생성</span>
              </label>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsRuleFormOpen(false);
                    setEditingRuleId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/60 dark:hover:bg-zinc-800 cursor-pointer transition-colors whitespace-nowrap"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold cursor-pointer shadow-xs transition-all whitespace-nowrap"
                >
                  {editingRuleId ? '수정 완료' : '규칙 저장하기'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 등록된 규칙 목록 카드 그리드 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-zinc-300">
              등록된 정기 고정수입 목록
            </span>
          </div>

          {rules.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
              <p className="text-xs text-slate-400 font-medium">등록된 고정수입 규칙이 없습니다.</p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>첫 고정수입 규칙 등록하기</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 space-y-3 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-700 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {rule.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {rule.category}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      매월 {rule.dayOfMonth}일
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">정기 입금 예정액</span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                      +₩{rule.amount.toLocaleString()}원
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-zinc-700 text-[11px]">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-slate-400 shrink-0 font-medium">지정 장부:</span>
                      <ElmTip01
                        text={rule.targetLedgerTitle}
                        onCopyNotice={onCopyNotice}
                        className="max-w-full"
                      >
                        <span
                          className="font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/60 break-all select-all hover:ring-1 hover:ring-indigo-300 transition-all cursor-pointer text-[11px]"
                          title="길게 누르면 전체보기 및 복사"
                        >
                          {rule.targetLedgerTitle}
                        </span>
                      </ElmTip01>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="text-slate-400 shrink-0 font-medium">입금 계좌:</span>
                      <ElmTip01
                        text={rule.account}
                        onCopyNotice={onCopyNotice}
                        className="max-w-full"
                      >
                        <span
                          className="font-mono text-slate-800 dark:text-zinc-100 font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 break-all select-all hover:ring-1 hover:ring-slate-400 transition-all cursor-pointer text-[11px]"
                          title="길게 누르면 전체보기 및 복사"
                        >
                          {rule.account}
                        </span>
                      </ElmTip01>
                    </div>
                  </div>

                  {/* 하단 제어 액션: 알림 토글 + 수정 + 삭제 */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-zinc-700 text-xs">
                    <button
                      type="button"
                      onClick={() => onToggleNotify(rule.id)}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-bold cursor-pointer transition-colors ${
                        rule.notifyEnabled
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-500 dark:bg-zinc-700'
                      }`}
                    >
                      {rule.notifyEnabled ? '🔔 알림 켜짐' : '🔕 알림 꺼짐'}
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(rule)}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRule(rule.id, rule.name)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 닫기 */}
        <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
