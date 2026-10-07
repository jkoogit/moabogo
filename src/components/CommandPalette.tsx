import React, { useState, useEffect } from 'react';
import { Ledger } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  Receipt,
  Gamepad2,
  Plus,
  Wallet,
  Users,
  Sparkles,
  Coins,
  Handshake,
  Wifi,
  WifiOff,
  KeyRound,
  X,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  ledgers: Ledger[];
  onSelectLedger: (ledger: Ledger) => void;
  onOpenOCR: () => void;
  onOpenSettle: () => void;
  onOpenNewTx: () => void;
  onSelectTab: (tab: 'TRANSACTIONS' | 'DUTIES' | 'ALLOWANCE' | 'LOANS') => void;
  onToggleOffline: () => void;
  isOffline: boolean;
  onOpenSettings: () => void;
  onOpenSampleGallery?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  ledgers,
  onSelectLedger,
  onOpenOCR,
  onOpenSettle,
  onOpenNewTx,
  onSelectTab,
  onToggleOffline,
  isOffline,
  onOpenSettings,
  onOpenSampleGallery,
}) => {
  const { setTheme } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'ocr',
      icon: Receipt,
      label: '2단계 스마트 영수증 OCR 스캔',
      category: '빠른 실행',
      run: () => {
        onClose();
        onOpenOCR();
      },
    },
    {
      id: 'settle',
      icon: Gamepad2,
      label: '독립 모임 1/N 정산 & 사다리타기 / 술래잡기',
      category: '빠른 실행',
      run: () => {
        onClose();
        onOpenSettle();
      },
    },
    {
      id: 'new-tx',
      icon: Plus,
      label: '새 가계부 수입/지출 내역 수동 등록',
      category: '빠른 실행',
      run: () => {
        onClose();
        onOpenNewTx();
      },
    },
    {
      id: 'tab-duties',
      icon: Sparkles,
      label: '모아당번: 순번 집안일/모임 과업 확인 & 사진 인증',
      category: '모아 3종 라이프',
      run: () => {
        onClose();
        onSelectTab('DUTIES');
      },
    },
    {
      id: 'tab-allowance',
      icon: Coins,
      label: '모아용돈: 사유 요청 & 3대 빅테크 간편 송금',
      category: '모아 3종 라이프',
      run: () => {
        onClose();
        onSelectTab('ALLOWANCE');
      },
    },
    {
      id: 'tab-loans',
      icon: Handshake,
      label: '모아빌림: 차용/대여 트래킹 (자산이동 엄격 분리)',
      category: '모아 3종 라이프',
      run: () => {
        onClose();
        onSelectTab('LOANS');
      },
    },
    {
      id: 'offline-toggle',
      icon: isOffline ? Wifi : WifiOff,
      label: isOffline ? '온라인 모드로 전환 (PWA 재연결 검증)' : '오프라인 모드 시뮬레이션 전환',
      category: '시스템 & 네트워크',
      run: () => {
        onClose();
        onToggleOffline();
      },
    },
    {
      id: 'settings',
      icon: KeyRound,
      label: '사용자 2차 OCR Key 설정 (서버 운영비 0원 모델)',
      category: '시스템 & 네트워크',
      run: () => {
        onClose();
        onOpenSettings();
      },
    },
    {
      id: 'design-gallery',
      icon: Sparkles,
      label: '🎨 디자인 정책 샘플 갤러리 (14종 토큰 & 화면별 쇼케이스)',
      category: '디자인 시스템 (docs/03)',
      run: () => {
        onClose();
        onOpenSampleGallery && onOpenSampleGallery();
      },
    },
    {
      id: 'theme-light',
      icon: Sun,
      label: '테마: 주간 모드 (라이트 테마)',
      category: '화면 테마 설정',
      run: () => {
        onClose();
        setTheme('light');
      },
    },
    {
      id: 'theme-dark',
      icon: Moon,
      label: '테마: 야간 모드 (다크 테마)',
      category: '화면 테마 설정',
      run: () => {
        onClose();
        setTheme('dark');
      },
    },
    {
      id: 'theme-system',
      icon: Monitor,
      label: '테마: 시스템 연동 (OS 자동 감지)',
      category: '화면 테마 설정',
      run: () => {
        onClose();
        setTheme('system');
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLedgers = ledgers.filter((l) =>
    l.ledger_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="어떤 작업을 찾으시나요? (예: 정산, OCR, 당번, 가계부)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
              액션 & 기능
            </span>
            <div className="space-y-0.5">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.run}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">실행</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ledgers switch */}
          {filteredLedgers.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                가계부 바로 전환
              </span>
              <div className="space-y-0.5">
                {filteredLedgers.map((l) => (
                  <button
                    key={l.ledger_id}
                    onClick={() => {
                      onSelectLedger(l);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs hover:bg-slate-800 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                        {l.ledger_type === 'PERSONAL' ? <Wallet className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{l.ledger_name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {l.is_instance ? '인스턴스' : l.ledger_type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
