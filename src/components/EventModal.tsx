import React, { useState } from 'react';
import { User, Ledger, StandaloneEvent } from '../types';
import {
  X,
  Users,
  Gamepad2,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Shuffle,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLedger: Ledger | null;
  currentUser: User | null;
  isOffline: boolean;
  onEventCreated: () => void;
}

interface ParticipantInput {
  id: string;
  name: string;
  is_guest: boolean;
  selected: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  activeLedger,
  currentUser,
  isOffline,
  onEventCreated,
}) => {
  const [eventType, setEventType] = useState<'SETTLEMENT_1_N' | 'LADDER' | 'TAG'>('SETTLEMENT_1_N');
  const [eventTitle, setEventTitle] = useState('주말 모임 정산');
  const [totalAmount, setTotalAmount] = useState('120000');
  const [bindingOption, setBindingOption] = useState<'ASK_AFTER' | 'AUTO_LINK' | 'SKIP'>('ASK_AFTER');
  const [guestNameInput, setGuestNameInput] = useState('');

  // Default roster
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { id: 'u1', name: currentUser?.nickname || '구본영(나)', is_guest: false, selected: true },
    { id: 'u2', name: '김은지(가족)', is_guest: false, selected: true },
    { id: 'u3', name: '박준혁(동창)', is_guest: false, selected: true },
    { id: 'g1', name: '게스트 정현우', is_guest: true, selected: true },
  ]);

  // Created Result State
  const [createdEvent, setCreatedEvent] = useState<StandaloneEvent | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);

  if (!isOpen) return null;

  const activeParticipants = participants.filter((p) => p.selected);
  const hasGuests = activeParticipants.some((p) => p.is_guest);
  const splitAmount = activeParticipants.length > 0 ? Math.round(Number(totalAmount) / activeParticipants.length) : 0;

  const handleAddGuest = () => {
    if (!guestNameInput.trim()) return;
    setParticipants([
      ...participants,
      {
        id: `g-${Date.now()}`,
        name: `게스트 ${guestNameInput.trim()}`,
        is_guest: true,
        selected: true,
      },
    ]);
    setGuestNameInput('');
  };

  const handleToggleSelect = (id: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const handleAdjustCount = (delta: number) => {
    if (delta > 0) {
      setParticipants([
        ...participants,
        {
          id: `g-${Date.now()}`,
          name: `게스트 참가자 ${participants.length + 1}`,
          is_guest: true,
          selected: true,
        },
      ]);
    } else if (participants.length > 2) {
      // Remove last guest if possible
      const lastGuestIdx = [...participants].reverse().findIndex((p) => p.is_guest);
      if (lastGuestIdx !== -1) {
        const actualIdx = participants.length - 1 - lastGuestIdx;
        setParticipants(participants.filter((_, idx) => idx !== actualIdx));
      }
    }
  };

  const handleExecuteEvent = async () => {
    if (activeParticipants.length < 1) {
      alert('최소 1명 이상의 참가자를 선택해주세요.');
      return;
    }

    // Mini-game calculations
    if (eventType === 'LADDER') {
      const luckyIdx = Math.floor(Math.random() * activeParticipants.length);
      setGameResult(`🎉 [사다리타기 결과] 당첨자: ${activeParticipants[luckyIdx].name} (전액 몰빵 또는 커피 쏘기!)`);
    } else if (eventType === 'TAG') {
      const tagIdx = Math.floor(Math.random() * activeParticipants.length);
      setGameResult(`🏃‍♂️ [술래잡기 룰렛] 오늘의 술래: ${activeParticipants[tagIdx].name}`);
    }

    try {
      const res = await fetch('/api/v1/events/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          event_title: eventTitle,
          total_amount: Number(totalAmount),
          participants: activeParticipants.map((p) => ({
            name: p.name,
            is_guest: p.is_guest,
            user_id: p.is_guest ? undefined : currentUser?.user_id,
          })),
          binding_option: bindingOption,
        }),
      });

      const data = await res.json();
      setCreatedEvent(data);
      onEventCreated();
    } catch (err) {
      alert('정산 생성 중 오류가 발생했습니다.');
    }
  };

  const handleLinkToLedger = async () => {
    if (!createdEvent) return;
    setIsLinking(true);
    try {
      const res = await fetch(`/api/v1/events/${createdEvent.event_id}/link-to-ledger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ledger_id: activeLedger?.ledger_id,
        }),
      });
      const data = await res.json();
      setIsLinking(false);
      setLinkSuccess(true);
      onEventCreated();
    } catch (err) {
      setIsLinking(false);
      alert('가계부 연동 중 오류가 발생했습니다.');
    }
  };

  const handleDeepLinkClick = (scheme: string, name: string) => {
    if (isOffline) {
      alert('오프라인 환경에서는 3대 간편 송금 딥링크가 비활성화됩니다.');
      return;
    }

    // Try opening URL scheme
    try {
      window.location.href = scheme;
    } catch (e) {
      console.warn('Deep link redirection attempt handled', e);
    }

    // Friendly feedback
    alert(
      `[${name} 3초 송금 연동]\n송금 앱(${scheme.split('://')[0]})으로 연결을 시도했습니다.\n(금액: ${splitAmount.toLocaleString()}원)`
    );
  };

  const copyBankInfo = () => {
    navigator.clipboard.writeText(`카카오뱅크 3333-01-9988776 (예금주: 구본영) / 금액: ${splitAmount.toLocaleString()}원`);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                독립 모임 이벤트 & 3대 빅테크 송금
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  개방형 정산
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                1/N 정산, 사다리타기, 술래잡기 & 게스트 자동 연동 차단 Fallback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!createdEvent ? (
            <div className="space-y-4">
              {/* Event Type Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setEventType('SETTLEMENT_1_N')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    eventType === 'SETTLEMENT_1_N'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ 1/N 정산 (스마트 분할)
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('LADDER')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    eventType === 'LADDER'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🪜 사다리타기 게임
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('TAG')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    eventType === 'TAG'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎯 술래잡기 룰렛
                </button>
              </div>

              {/* Title & Total Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    이벤트/정산 제목
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-medium text-white focus:outline-none focus:border-blue-500"
                    placeholder="예: 2차 호프집 정산"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    총 정산 금액 (원)
                  </label>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Smart Participant Auto-setting & +/- Controller */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-400" />
                      스마트 인원 자동 세팅 ({activeParticipants.length}명 참여)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      1인당 분할액: <span className="font-mono font-bold text-blue-400">₩{splitAmount.toLocaleString()}</span>
                    </p>
                  </div>

                  {/* +/- count controller */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleAdjustCount(-1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                      title="게스트 1명 줄이기"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold px-2 text-slate-200">
                      {activeParticipants.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustCount(1)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700"
                      title="게스트 1명 늘리기"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Participant Checklist */}
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {participants.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        p.selected
                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-200'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={p.selected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded text-blue-600 focus:ring-0 bg-slate-900 border-slate-700"
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      {p.is_guest && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          게스트
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {/* Add Guest by name */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGuest())}
                    placeholder="새 게스트 이름 (예: 동창 친구B)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddGuest}
                    className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> 게스트 추가
                  </button>
                </div>
              </div>

              {/* Binding Options & Guest Guardrail Banner */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  가계부 바인딩 옵션
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBindingOption('ASK_AFTER')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      bindingOption === 'ASK_AFTER'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block">실행 후 선택 (기본값)</span>
                    <span className="text-[10px] text-slate-400">결과 확인 후 수동 연동</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (hasGuests) {
                        alert('게스트가 포함된 경우 자동 연동이 차단됩니다. (확실한 구성원만 수동 연동 지원)');
                        return;
                      }
                      setBindingOption('AUTO_LINK');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      hasGuests
                        ? 'opacity-40 cursor-not-allowed bg-slate-800/20 border-slate-800 text-slate-500'
                        : bindingOption === 'AUTO_LINK'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block">자동 연동</span>
                    <span className="text-[10px] text-slate-400">
                      {hasGuests ? '게스트 포함 시 차단됨' : '현재 가계부에 즉시 등록'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBindingOption('SKIP')}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      bindingOption === 'SKIP'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block">연동 생략</span>
                    <span className="text-[10px] text-slate-400">독립 게임/정산만 실행</span>
                  </button>
                </div>

                {hasGuests && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>게스트 포함 Fallback UX:</strong> 미가입 게스트가 포함되어 가계부 전체 자동 연동이 제한됩니다. 결과 화면에서 정식 회원만 수동 연동할 수 있습니다.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EVENT CREATED & SETTLEMENT RESULT SCREEN */
            <div className="space-y-4">
              {gameResult && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold animate-pulse">
                  {gameResult}
                </div>
              )}

              {/* Settle Summary Box */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-center">
                <span className="text-xs text-slate-400">{createdEvent.event_title}</span>
                <div className="text-2xl font-black text-white mt-1">
                  1인당 ₩{createdEvent.participants[0]?.amount_due.toLocaleString()}원
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  총액: ₩{createdEvent.total_amount.toLocaleString()} ({createdEvent.participants.length}인 분할)
                </p>
              </div>

              {/* 3 BigTech Deep Link Quick Transfer Buttons */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>3대 빅테크 간편 송금 딥링크 (3초 이체)</span>
                  {isOffline && (
                    <span className="text-[10px] text-amber-400 font-semibold">
                      오프라인 모드에서는 비활성화
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* KakaoPay */}
                  <button
                    type="button"
                    disabled={isOffline}
                    onClick={() => handleDeepLinkClick('kakaopay://', '카카오페이')}
                    className="p-3 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] text-slate-900 font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                  >
                    <span>카카오페이</span>
                    <span className="text-[10px] font-medium opacity-80">kakaopay://</span>
                  </button>

                  {/* Toss */}
                  <button
                    type="button"
                    disabled={isOffline}
                    onClick={() =>
                      handleDeepLinkClick(
                        `supertoss://send?bank=090&accountNo=3333019988776&amount=${createdEvent.participants[0]?.amount_due}`,
                        '토스'
                      )
                    }
                    className="p-3 rounded-xl bg-[#0064FF] hover:bg-[#0055db] text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                  >
                    <span>토스 (Toss)</span>
                    <span className="text-[10px] font-medium opacity-80">supertoss://send</span>
                  </button>

                  {/* NaverPay */}
                  <button
                    type="button"
                    disabled={isOffline}
                    onClick={() => handleDeepLinkClick('naverpay://', '네이버페이')}
                    className="p-3 rounded-xl bg-[#03C75A] hover:bg-[#02a94d] text-white font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                  >
                    <span>네이버페이</span>
                    <span className="text-[10px] font-medium opacity-80">naverpay://</span>
                  </button>
                </div>

                {/* Account Number Copy Fallback */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">카카오뱅크 3333-01-9988776 구본영</span>
                  <button
                    type="button"
                    onClick={copyBankInfo}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBank ? '복사됨!' : '계좌 복사'}</span>
                  </button>
                </div>
              </div>

              {/* Participant Fallback Tagging List (PRD Requirement) */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  참가자별 정산 및 매핑 상태:
                </span>
                <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/60 max-h-48 overflow-y-auto">
                  {createdEvent.participants.map((p) => (
                    <div key={p.participant_id} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{p.name}</span>
                        {p.is_guest ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            [게스트 / 매핑 필요]
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            [정식 회원: 연동 가능]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300">
                          ₩{p.amount_due.toLocaleString()}
                        </span>
                        {p.is_settled ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            정산완료
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            미정산
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Link to Ledger for Mapped Members */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">정식 회원 가계부 수동 연동</span>
                  <p className="text-[11px] text-slate-400">
                    미매핑 게스트를 제외하고 확실한 정식 회원만 선택 가계부에 안전하게 분할 등록합니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLinkToLedger}
                  disabled={isLinking || linkSuccess}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 flex items-center gap-1.5 shadow-md shrink-0"
                >
                  {linkSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      연동 완료
                    </>
                  ) : isLinking ? (
                    '연동 중...'
                  ) : (
                    <>
                      <span>가계부 연동 / 요청</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {createdEvent ? (
            <button
              type="button"
              onClick={() => setCreatedEvent(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              ← 다른 이벤트 생성
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              {activeLedger ? `바인딩 기준: ${activeLedger.ledger_name}` : ''}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              닫기
            </button>

            {!createdEvent && (
              <button
                type="button"
                onClick={handleExecuteEvent}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>이벤트 / 1/N 정산 실행</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
