import React, { useState } from 'react';
import { Ledger } from '../types';
import { Plus, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLedger: Ledger | null;
  onSuccess: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  activeLedger,
  onSuccess,
}) => {
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [categoryName, setCategoryName] = useState('식음료/카페');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [isAssetTransfer, setIsAssetTransfer] = useState(false);
  const [note, setNote] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (force: boolean = false) => {
    if (!amount || !merchantName) {
      alert('금액과 가맹점명을 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/ledgers/${activeLedger?.ledger_id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_type: txType,
          amount: Number(amount),
          merchant_name: merchantName,
          category_name: categoryName,
          transaction_date: new Date(txDate).toISOString(),
          is_asset_transfer: isAssetTransfer,
          note,
          force,
        }),
      });

      if (res.status === 409) {
        const err = await res.json();
        setDuplicateWarning(err.message);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert('내역 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">가계부 내역 등록</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {duplicateWarning && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>중복 내역 의심 경고</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed">{duplicateWarning}</p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs"
              >
                수정하기
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                중복 무시하고 등록
              </button>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-3"
        >
          {/* Type Chooser */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-800 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setTxType('EXPENSE');
                setIsAssetTransfer(false);
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                txType === 'EXPENSE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              지출 (소비)
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('INCOME');
                setIsAssetTransfer(false);
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                txType === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              수입
            </button>
            <button
              type="button"
              onClick={() => {
                setTxType('TRANSFER');
                setIsAssetTransfer(true);
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                txType === 'TRANSFER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              이동/이체
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              가맹점 / 수신처
            </label>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => {
                setMerchantName(e.target.value);
                setDuplicateWarning(null);
              }}
              placeholder="예: 배달의민족, 스타벅스"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                금액 (원)
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setDuplicateWarning(null);
                }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                결제 일자
              </label>
              <input
                type="date"
                required
                value={txDate}
                onChange={(e) => {
                  setTxDate(e.target.value);
                  setDuplicateWarning(null);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                카테고리
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="식음료/카페">식음료/카페</option>
                <option value="식료품/마트">식료품/마트</option>
                <option value="생활/잡화">생활/잡화</option>
                <option value="교통/유류">교통/유류</option>
                <option value="문화/여가">문화/여가</option>
                <option value="모임/정산">모임/정산</option>
                <option value="급여/상여">급여/상여</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                메모 (선택)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="간단한 메모"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Asset Transfer Checkbox */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={isAssetTransfer}
                onChange={(e) => setIsAssetTransfer(e.target.checked)}
                className="rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span className="font-semibold">자산/부채 이동으로 처리</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">
              체크 시 이번 달 순수 생활비 지출 통계에서 제외되어 가계 예산이 왜곡되지 않습니다.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
            >
              등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
