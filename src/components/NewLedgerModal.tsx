import React, { useState } from 'react';
import { Ledger } from '../types';
import { Plus, X, Users, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { resolvedTheme } = useTheme();
  const isDawn = resolvedTheme === 'dawn';
  const isDark = resolvedTheme === 'dark' || isDawn;

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

      if (res.ok) {
        const newLedger = await res.json();
        onCreated(newLedger);
        onClose();
        return;
      }
    } catch {
      // offline or mock fallback
    }

    // Fallback: create mock Ledger on client
    const fallbackLedger: Ledger = {
      ledger_id: `led-${Date.now()}`,
      owner_id: 'u-1001-koo',
      ledger_name: ledgerName.trim(),
      ledger_type: ledgerType,
      is_instance: isInstance,
      role: 'OWNER',
      created_at: new Date().toISOString().split('T')[0],
    };
    onCreated(fallbackLedger);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`rounded-2xl w-full max-w-md p-6 shadow-2xl border space-y-4 transition-colors ${
          isDawn
            ? 'bg-[#0e1733] border-[#22396d] text-[#f0f6fc]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b pb-3 ${
            isDawn ? 'border-[#22396d]' : isDark ? 'border-zinc-800' : 'border-slate-200'
          }`}
        >
          <h3 className="text-base font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" />
            새 장부 추가
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
              장부 이름
            </label>
            <input
              type="text"
              required
              value={ledgerName}
              onChange={(e) => setLedgerName(e.target.value)}
              placeholder="예: [우리집 생활비 장부], [2026 동창회]"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-colors ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-white placeholder-zinc-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
              장부 유형
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLedgerType('GROUP')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  ledgerType === 'GROUP'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                    : isDark
                    ? 'bg-zinc-800/40 border-zinc-700/80 text-zinc-400 hover:border-zinc-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Users className="w-4 h-4 mb-1 text-indigo-500" />
                <span className="block font-bold">그룹/모임 장부</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">구성원 초대 및 RBAC 권한 분리</span>
              </button>

              <button
                type="button"
                onClick={() => setLedgerType('PERSONAL')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  ledgerType === 'PERSONAL'
                    ? 'bg-emerald-600/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : isDark
                    ? 'bg-zinc-800/40 border-zinc-700/80 text-zinc-400 hover:border-zinc-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Wallet className="w-4 h-4 mb-1 text-emerald-500" />
                <span className="block font-bold">개인 보조 장부</span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500">비공개 1인 전용 계정</span>
              </button>
            </div>
          </div>

          {/* Instance Ledger Option */}
          <div
            className={`p-3 rounded-xl border text-xs transition-colors ${
              isDark ? 'bg-zinc-850/60 border-zinc-700/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={isInstance}
                onChange={(e) => setIsInstance(e.target.checked)}
                className="rounded text-indigo-600 bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
              />
              <span className="font-semibold">인스턴스 장부로 지정 (예: 단기 여행/프로젝트)</span>
            </label>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 pl-6 leading-relaxed">
              정규 장부와 별도로 일시적인 모임이나 특정 이벤트를 독립적으로 집계합니다.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
            >
              장부 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
