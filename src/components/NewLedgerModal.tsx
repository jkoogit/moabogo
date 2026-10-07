import React, { useState } from 'react';
import { Ledger } from '../types';
import { Plus, X, Users, Wallet, Sparkles } from 'lucide-react';

interface NewLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ledger: Ledger) => void;
}

export const NewLedgerModal: React.FC<NewLedgerModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [ledgerName, setLedgerName] = useState('');
  const [ledgerType, setLedgerType] = useState<'PERSONAL' | 'GROUP'>('GROUP');
  const [isInstance, setIsInstance] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerName.trim()) return;

    try {
      const res = await fetch('/api/v1/ledgers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledger_name: ledgerName.trim(),
          ledger_type: ledgerType,
          is_instance: isInstance,
        }),
      });

      const newLedger = await res.json();
      onCreated(newLedger);
      onClose();
    } catch (err) {
      alert('가계부 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            새 가계부 추가 (1인 다중 가계부)
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              가계부 이름
            </label>
            <input
              type="text"
              required
              value={ledgerName}
              onChange={(e) => setLedgerName(e.target.value)}
              placeholder="예: [우리집 가계부], [2026 동창회]"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              가계부 유형
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLedgerType('GROUP')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  ledgerType === 'GROUP'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-blue-400" />
                <span className="block font-bold">그룹/모임 가계부</span>
                <span className="text-[10px] text-slate-400">구성원 초대 및 RBAC 권한 분리</span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerType('PERSONAL')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                  ledgerType === 'PERSONAL'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400'
                }`}
              >
                <Wallet className="w-4 h-4 mb-1 text-emerald-400" />
                <span className="block font-bold">개인 보조 가계부</span>
                <span className="text-[10px] text-slate-400">비공개 1인 전용 계정</span>
              </button>
            </div>
          </div>

          {/* Instance Ledger Option (PRD 2.1) */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-200">
              <input
                type="checkbox"
                checked={isInstance}
                onChange={(e) => setIsInstance(e.target.checked)}
                className="rounded text-blue-600 bg-slate-900 border-slate-700"
              />
              <span className="font-semibold">인스턴스 가계부로 지정 (예: 단기 여행/프로젝트)</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1 pl-6">
              정규 가계부와 별도로 일시적인 모임이나 특정 이벤트를 독립적으로 집계합니다.
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
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
