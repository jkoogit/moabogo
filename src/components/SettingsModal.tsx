import React, { useState } from 'react';
import { User } from '../types';
import { KeyRound, X, Check, Cpu, ShieldCheck, Database, Server } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateKey,
}) => {
  const [ocrKey, setOcrKey] = useState(currentUser?.personal_ocr_key || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/user/ocr-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personal_ocr_key: ocrKey }),
      });
      onUpdateKey(ocrKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('설정 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-white">
              2단계 OCR Key & 시스템 아키텍처 설정
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">현재 로그인 계정:</span>
            <div className="text-white font-bold">{currentUser?.nickname} ({currentUser?.email})</div>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
            소셜 인증: {currentUser?.provider}
          </span>
        </div>

        {/* 2nd OCR Key Config */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              사용자 개인 2차 OCR Key (OpenAI / Google Cloud Vision API Key)
            </label>
            <input
              type="password"
              value={ocrKey}
              onChange={(e) => setOcrKey(e.target.value)}
              placeholder="sk-... 또는 AIzaSy... (개인 키 입력 시 서버 비용 0원 유지)"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * 1차 Docker 로컬 EasyOCR 실패 시에만 클라이언트 사용자의 개인 키로 Fallback됩니다.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>저장 완료</span>
                </>
              ) : (
                <span>설정 저장</span>
              )}
            </button>
          </div>
        </form>

        {/* Architecture Spec Info Box */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 text-xs text-slate-300">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-400" />
            모아보고(MoaBogo) 인프라 & 가드레일 사양
          </span>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400">•</span>
              <span><strong>EasyOCR 세마포어 제한:</strong> 동시 요청 1~2건으로 제어하여 PostgreSQL 프로세스 OOM 방지</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400">•</span>
              <span><strong>비동기 멱등성:</strong> SHA-256 해시 검증으로 중복 영수증 재연산 차단</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-400">•</span>
              <span><strong>Stuck Task 보상:</strong> 3분 초과 정체 시 retry_count 증가 후 수동 보정으로 안전하게 전환</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
