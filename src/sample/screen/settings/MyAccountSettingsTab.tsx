import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  ShieldCheck,
  AlertCircle,
  Star,
  Edit3,
  Trash2,
  Copy,
  X,
} from 'lucide-react';
import { ElmInp01, ElmSel01, ElmChk01 } from '../../elements/Tokens';
import {
  UserBankAccount,
  AccountServicePurpose,
  loadUserBankAccounts,
  saveUserBankAccounts,
} from '../../data/accountStorePool';
import { SystemFinancialCompliance } from '../../data/systemGovernancePool';

interface MyAccountSettingsTabProps {
  financialCompliance: SystemFinancialCompliance;
}

export const MyAccountSettingsTab: React.FC<MyAccountSettingsTabProps> = ({
  financialCompliance,
}) => {
  const [userBankAccounts, setUserBankAccounts] = useState<UserBankAccount[]>(() =>
    loadUserBankAccounts('u-1001-koo')
  );
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formBankName, setFormBankName] = useState('카카오뱅크');
  const [formAccountNo, setFormAccountNo] = useState('');
  const [formAccountHolder, setFormAccountHolder] = useState('구본영');
  const [formAlias, setFormAlias] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formPurposes, setFormPurposes] = useState<AccountServicePurpose[]>(['GENERAL']);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const handleSetDefaultAccount = (accountId: string) => {
    setUserBankAccounts((prev) => {
      const updated = prev.map((a) => ({
        ...a,
        isDefault: a.id === accountId,
      }));
      saveUserBankAccounts(updated, 'u-1001-koo');
      return updated;
    });
    showToast('★ 기본 대표계좌가 변경되었습니다.');
  };

  const handleDeleteAccount = (accountId: string) => {
    setUserBankAccounts((prev) => {
      const remaining = prev.filter((a) => a.id !== accountId);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      saveUserBankAccounts(remaining, 'u-1001-koo');
      return remaining;
    });
    showToast('계좌가 삭제되었습니다.');
  };

  const handleOpenAccountModal = (acc?: UserBankAccount) => {
    if (acc) {
      setEditingAccountId(acc.id);
      setFormBankName(acc.bankName);
      setFormAccountNo(acc.accountNo);
      setFormAccountHolder(acc.accountHolder);
      setFormAlias(acc.alias);
      setFormIsDefault(acc.isDefault);
      setFormPurposes(acc.assignedPurposes);
    } else {
      setEditingAccountId(null);
      setFormBankName('카카오뱅크');
      setFormAccountNo('');
      setFormAccountHolder('구본영');
      setFormAlias('');
      setFormIsDefault(userBankAccounts.length === 0);
      setFormPurposes(['GENERAL']);
    }
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formAccountNo.trim()) return;

    if (editingAccountId) {
      setUserBankAccounts((prev) => {
        const updated: UserBankAccount[] = prev.map((a) => {
          if (a.id === editingAccountId) {
            return {
              ...a,
              bankName: formBankName,
              accountNo: formAccountNo.trim(),
              accountHolder: formAccountHolder.trim() || '구본영',
              alias: formAlias.trim() || `${formBankName} 계좌`,
              isDefault: formIsDefault ? true : a.isDefault,
              assignedPurposes:
                formPurposes.length > 0
                  ? formPurposes
                  : (['GENERAL'] as AccountServicePurpose[]),
            };
          }
          if (formIsDefault) return { ...a, isDefault: false };
          return a;
        });
        saveUserBankAccounts(updated, 'u-1001-koo');
        return updated;
      });
    } else {
      const newAcc: UserBankAccount = {
        id: `acc-${Date.now()}`,
        userId: 'u-1001-koo',
        bankName: formBankName,
        accountNo: formAccountNo.trim(),
        accountHolder: formAccountHolder.trim() || '구본영',
        alias: formAlias.trim() || `${formBankName} 계좌`,
        isDefault: formIsDefault || userBankAccounts.length === 0,
        assignedPurposes:
          formPurposes.length > 0
            ? formPurposes
            : (['GENERAL'] as AccountServicePurpose[]),
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setUserBankAccounts((prev) => {
        const base = formIsDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
        const updated = [...base, newAcc];
        saveUserBankAccounts(updated, 'u-1001-koo');
        return updated;
      });
    }

    setIsAccountModalOpen(false);
    showToast('✓ 계좌 정보가 안전하게 저장되었습니다.');
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              내 수신/이체 계좌 및 서비스별 목적성 매핑
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            계좌 등록은 선택 사항입니다. 계좌가 없어도 목표 실천, 당번, 가계부 분석 등 모든 서비스를 100% 이용하실 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAccountModal()}
          className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>새 계좌 등록</span>
        </button>
      </div>

      {/* Zero-Friction 가이드 배너 */}
      <aside className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold">안전한 사용자 주권 (Zero-Friction 원칙)</span>
          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
            원치 않는 계좌 등록을 강제하지 않습니다. 상대방에게 이체 링크를 제공하거나 목표 용돈을 앱으로 송금받을 때에만 등록된 계좌가 안전하게 연계됩니다.
          </p>
        </div>
      </aside>

      {/* 금융 컴플라이언스 가드레일 정책 배너 */}
      {financialCompliance &&
        (!financialCompliance.enableRemitUrlGeneration ||
          !financialCompliance.allowGoalCheerRemit ||
          !financialCompliance.allowMoaMoneyRemit ||
          financialCompliance.blockForeignIpRemit) && (
          <aside className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold flex items-center gap-1.5 flex-wrap">
                <span>금융 컴플라이언스 송금 가드레일 정책 적용 중</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-200/80 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                  일일 송금 추천 상한: ₩{financialCompliance.maxDailyRemitLimit.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {!financialCompliance.enableRemitUrlGeneration
                  ? '플랫폼 보안 정책에 따라 간편송금 URL 생성이 전역 차단되어 있습니다. 계좌번호 복사 및 일반 이체를 이용해 주세요.'
                  : `플랫폼 보안 정책에 따라 일부 송금(목표응원: ${
                      financialCompliance.allowGoalCheerRemit ? '허용' : '제한'
                    }, 모아머니: ${
                      financialCompliance.allowMoaMoneyRemit ? '허용' : '제한'
                    }) 및 해외 IP 접속이 통제 중입니다.`}
              </p>
              {financialCompliance.complianceNotice && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                  ※ 안내: {financialCompliance.complianceNotice}
                </p>
              )}
            </div>
          </aside>
        )}

      {/* 인앱 토스트 알림 */}
      {copyToast && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold animate-in fade-in">
          {copyToast}
        </div>
      )}

      {/* 계좌 카드 목록 */}
      {userBankAccounts.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
            등록된 계좌가 없습니다.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            계좌 등록 없이 자유롭게 모든 라이프 기능을 이용하실 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => handleOpenAccountModal()}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold cursor-pointer transition-colors"
          >
            + 첫 계좌 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {userBankAccounts.map((acc) => (
            <div
              key={acc.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                acc.isDefault
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-700/60 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* 카드 헤더 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 truncate">
                    {acc.alias || `${acc.bankName} 계좌`}
                  </span>
                  {acc.isDefault ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] shrink-0 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      기본 대표
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefaultAccount(acc.id)}
                      className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer shrink-0"
                    >
                      대표로 지정
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenAccountModal(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="계좌 수정"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="계좌 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 계좌 정보 */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-300">
                    {acc.bankName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    예금주:{' '}
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {acc.accountHolder}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
                    {acc.accountNo}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(`${acc.bankName} ${acc.accountNo}`);
                      showToast(`✓ ${acc.bankName} 계좌번호가 복사되었습니다.`);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                    title="계좌번호 복사"
                  >
                    <Copy className="w-3 h-3" />
                    <span>복사</span>
                  </button>
                </div>
              </div>

              {/* 서비스별 목적성 태그 */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">연결 용도:</span>
                {acc.assignedPurposes.map((p) => (
                  <span
                    key={p}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p === 'GOAL_ALLOWANCE'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : p === 'LEDGER_LIVING'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : p === 'SETTLE_MONEY'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {p === 'GOAL_ALLOWANCE'
                      ? '🎯 목표용돈'
                      : p === 'LEDGER_LIVING'
                      ? '🛒 생활비'
                      : p === 'SETTLE_MONEY'
                      ? '🍻 정산·회비'
                      : '📋 일반'}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 계좌 추가/수정 모달 */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {editingAccountId ? '계좌 정보 수정' : '새 수신/이체 계좌 등록'}
              </h4>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <ElmSel01
                label="은행 선택"
                value={formBankName}
                onChange={setFormBankName}
                options={[
                  { value: '카카오뱅크', label: '카카오뱅크 (090)' },
                  { value: '토스뱅크', label: '토스뱅크 (092)' },
                  { value: '국민은행', label: 'KB국민은행 (004)' },
                  { value: '신한은행', label: '신한은행 (088)' },
                  { value: '우리은행', label: '우리은행 (020)' },
                  { value: '하나은행', label: '하나은행 (081)' },
                  { value: 'NH농협', label: 'NH농협은행 (011)' },
                  { value: '케이뱅크', label: '케이뱅크 (089)' },
                ]}
              />

              <ElmInp01
                label="계좌번호"
                value={formAccountNo}
                onChange={setFormAccountNo}
                placeholder="'-' 없이 숫자만 또는 번호 입력"
              />

              <div className="grid grid-cols-2 gap-2.5">
                <ElmInp01
                  label="예금주"
                  value={formAccountHolder}
                  onChange={setFormAccountHolder}
                  placeholder="구본영"
                />
                <ElmInp01
                  label="계좌 별칭"
                  value={formAlias}
                  onChange={setFormAlias}
                  placeholder="예: 생활비 주통장"
                />
              </div>

              {/* 연결 목적 체크박스 */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300 block text-xs">
                  기본 연결 서비스 목적 (다중 선택 가능)
                </label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  {[
                    { id: 'GOAL_ALLOWANCE', label: '🎯 목표 보상·용돈' },
                    { id: 'LEDGER_LIVING', label: '🛒 가계부 생활비' },
                    { id: 'SETTLE_MONEY', label: '🍻 정산 및 회비' },
                    { id: 'GENERAL', label: '📋 일반 예비' },
                  ].map((item) => {
                    const checked = formPurposes.includes(item.id as AccountServicePurpose);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormPurposes((prev) => [
                                ...prev,
                                item.id as AccountServicePurpose,
                              ]);
                            } else {
                              setFormPurposes((prev) =>
                                prev.length > 1 ? prev.filter((p) => p !== item.id) : prev
                              );
                            }
                          }}
                          className="w-3.5 h-3.5 rounded text-indigo-600 cursor-pointer"
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-1">
                <ElmChk01
                  checked={formIsDefault}
                  onChange={setFormIsDefault}
                  label="★ 이 계좌를 기본 대표계좌로 지정"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!formAccountNo.trim()}
                  className="min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                >
                  {editingAccountId ? '수정 완료' : '계좌 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
