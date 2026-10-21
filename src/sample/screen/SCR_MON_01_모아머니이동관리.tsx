import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmChk01,
  ElmBsh01,
} from '../elements/Tokens';
import {
  Coins,
  Send,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  X,
  CreditCard,
} from 'lucide-react';

export const SCR_MON_01_모아머니이동관리: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'URGENT_REQUEST' | 'LOAN_REQUEST'>('URGENT_REQUEST');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Deep Link Mock Modal State (replaces alert)
  const [deepLinkModal, setDeepLinkModal] = useState<{
    platform: 'TOSS' | 'KAKAO';
    requester: string;
    amount: number;
  } | null>(null);

  // Form states
  const [reqAmount, setReqAmount] = useState('30000');
  const [reqReason, setReqReason] = useState('중간고사 수학 문제집 구입');
  const [deductFromAllowance, setDeductFromAllowance] = useState(true);

  // Demanded money (요구머니) list
  const [demandedList, setDemandedList] = useState([
    {
      id: 'd1',
      requester: '구민우(자녀)',
      amount: 30000,
      reason: '중간고사 대비 수학 교재 및 독서실 이용권',
      deductAllowance: true,
      status: 'APPROVED',
      date: '2026-10-06',
    },
    {
      id: 'd2',
      requester: '구민우(자녀)',
      amount: 15000,
      reason: '준비물 아크릴 물감 세트 구매',
      deductAllowance: false,
      status: 'PAID',
      date: '2026-10-04',
    },
  ]);

  // Requested money (요청머니 - 상환/분납 대상) list
  const [loanList, setLoanList] = useState([
    {
      id: 'l1',
      requester: '박준혁(동창)',
      amount: 300000,
      repaid: 150000,
      remaining: 150000,
      dueDate: '2026-11-15',
      status: 'PARTIAL_PAID',
      type: '용돈/현금 분납 상환',
    },
    {
      id: 'l2',
      requester: '구민우(자녀)',
      amount: 50000,
      repaid: 0,
      remaining: 50000,
      dueDate: '2026-10-25',
      status: 'PENDING',
      type: '다음달 용돈에서 자동 차감 상환',
    },
  ]);

  const handlePayDeepLink = (item: any, platform: 'TOSS' | 'KAKAO') => {
    setDeepLinkModal({
      platform,
      requester: item.requester,
      amount: item.amount,
    });
  };

  const handleConfirmDeepLink = () => {
    if (!deepLinkModal) return;
    setDemandedList((prev) =>
      prev.map((item) =>
        item.requester === deepLinkModal.requester && item.amount === deepLinkModal.amount
          ? { ...item, status: 'PAID' }
          : item
      )
    );
    const plat = deepLinkModal.platform === 'TOSS' ? '토스' : '카카오페이';
    setFeedbackNotice(`✓ [${plat} 3초 송금 연동 완료] ${deepLinkModal.requester}님에게 ₩${deepLinkModal.amount.toLocaleString()}원이 가족 내부 이동으로 지급 처리되었습니다.`);
    setDeepLinkModal(null);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleRepay = (item: any) => {
    setLoanList((prev) =>
      prev.map((l) =>
        l.id === item.id
          ? {
              ...l,
              repaid: l.amount,
              remaining: 0,
              status: 'COMPLETED',
            }
          : l
      )
    );
    setFeedbackNotice(`✓ ${item.requester}님의 잔여 상환금 ₩${item.remaining.toLocaleString()}원이 전액 상환 처리되었습니다.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleSubmitRequest = () => {
    const num = Number(reqAmount);
    if (!num || num <= 0) return;
    const newEntry = {
      id: `d${Date.now()}`,
      requester: '구본영(나)',
      amount: num,
      reason: reqReason || '일반 머니 요청',
      deductAllowance: deductFromAllowance,
      status: 'APPROVED',
      date: new Date().toISOString().slice(0, 10),
    };
    setDemandedList([newEntry, ...demandedList]);
    setRequestModalOpen(false);
    setFeedbackNotice(`✓ ₩${num.toLocaleString()}원 머니 요청서가 등록되었습니다.`);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* Section 1: Header (Flat Peer 1) */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 shrink-0">
            SCR-MON-01
          </span>
          <ElmTyp01
            title="모아머니 통합 이동관리"
            subtitle="요구머니 (자금긴급/용돈차감) & 요청머니 (상환/분납) • 플랫 피어 레이아웃"
          />
        </div>

        <button
          type="button"
          onClick={() => setRequestModalOpen(true)}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-sm shrink-0 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>머니 요청 등록</span>
        </button>
      </section>

      {/* In-app Feedback Toast (replaces window.alert) */}
      {feedbackNotice && (
        <aside className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-amber-500 hover:text-amber-700 dark:hover:text-amber-300"
          >
            ✕
          </button>
        </aside>
      )}

      {/* Section 2: Accounting Guardrail Banner (Flat Peer 2) */}
      <section className="p-4 rounded-2xl bg-purple-50 dark:bg-[#1a1429] border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5 flex-1">
          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <span className="break-keep leading-relaxed">
            <strong>가족 내부 이동 가드레일:</strong> 모아머니 요구 및 상환은 '내부 자산 이동(TRANSFER)'으로 자동 회계 분리되어 순수 생활비 예산이 2중으로 부풀려지지 않습니다.
          </span>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <ElmStt01 type="PURPLE" label="생활비 왜곡 차단" />
        </div>
      </section>

      {/* Section 3: Tab Switcher (Flat Peer 3) */}
      <section className="flex flex-wrap items-center gap-2">
        <ElmFlt01
          label="요구머니 (긴급요청)"
          selected={activeTab === 'URGENT_REQUEST'}
          count={demandedList.length}
          onClick={() => setActiveTab('URGENT_REQUEST')}
        />
        <ElmFlt01
          label="요청머니 (용돈상환)"
          selected={activeTab === 'LOAN_REQUEST'}
          count={loanList.length}
          onClick={() => setActiveTab('LOAN_REQUEST')}
        />
      </section>

      {/* Section 4: Tab 1 - 요구머니 (Urgent Request - Flat Peer 4A) */}
      {activeTab === 'URGENT_REQUEST' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demandedList.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">요청자: {item.requester}</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-0.5">
                      ₩{item.amount.toLocaleString()}원
                    </h3>
                  </div>
                  <ElmStt01
                    type={item.status === 'PAID' ? 'EMERALD' : 'AMBER'}
                    label={item.status === 'PAID' ? '지급완료 ✓' : '승인됨 (송금대기)'}
                  />
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-1">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">사유:</span>
                  <p className="break-keep">{item.reason}</p>
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                    <span>{item.deductAllowance ? '✓ 지급 시 다음달 용돈에서 차감 (요청머니 연계)' : '• 순수 지원금 (차감 없음)'}</span>
                  </div>
                </div>
              </div>

              {/* 3-Second Deep link transfer buttons with 44px min touch target */}
              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{item.date}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePayDeepLink(item, 'TOSS')}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0064FF] hover:bg-[#0052d4] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>토스 이체</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePayDeepLink(item, 'KAKAO')}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] active:scale-95 text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>카톡 송금</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Section 5: Tab 2 - 요청머니 (Loan & Installment Repayment - Flat Peer 4B) */}
      {activeTab === 'LOAN_REQUEST' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loanList.map((item) => {
            const pct = Math.round((item.repaid / item.amount) * 100);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">대상자: {item.requester}</span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-0.5">
                        원금 ₩{item.amount.toLocaleString()}원
                      </h3>
                    </div>
                    <ElmStt01
                      type={item.remaining === 0 ? 'EMERALD' : 'PURPLE'}
                      label={item.remaining === 0 ? '전액상환 ✓' : `상환중 (${pct}%)`}
                    />
                  </div>

                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-zinc-400">잔여 상환액:</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        ₩{item.remaining.toLocaleString()}원
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-zinc-500 pt-1">
                      <span>방식: {item.type}</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">D-Day: {item.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    상환예정일 알림 예약됨
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRepay(item)}
                    disabled={item.remaining === 0}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    {item.remaining === 0 ? '상환 완료' : '분할 상환 접수'}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* In-app Deep Link Simulation Modal (replaces alert) */}
      {deepLinkModal && (
        <aside className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                {deepLinkModal.platform === 'TOSS' ? '토스 간편이체' : '카카오페이 송금'}
              </span>
              <button
                type="button"
                onClick={() => setDeepLinkModal(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">수신인:</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">{deepLinkModal.requester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">이체 금액:</span>
                  <span className="font-black font-mono text-base text-indigo-600 dark:text-indigo-400">
                    ₩{deepLinkModal.amount.toLocaleString()}원
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-purple-700 dark:text-purple-300 break-keep">
                ✓ 그룹 가계부 내 <strong>'가족 내부 이동(TRANSFER)'</strong>으로 자동 등록되어 이중 합산이 방지됩니다.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeepLinkModal(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirmDeepLink}
                className="min-h-[44px] px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-sm cursor-pointer transition-all"
              >
                송금 실행 및 회계 반영
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Section 6: In-app Request Modal Bottom Sheet */}
      <ElmBsh01
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="새 모아머니 요청"
      >
        <div className="space-y-4">
          <ElmInp01
            label="요청 금액 (원)"
            type="number"
            value={reqAmount}
            onChange={setReqAmount}
          />
          <ElmInp01
            label="사용 사유"
            value={reqReason}
            onChange={setReqReason}
            placeholder="자세한 사유를 입력하세요..."
          />
          <ElmChk01
            checked={deductFromAllowance}
            onChange={setDeductFromAllowance}
            label="지급 시 용돈에서 차감 (요청머니 상환으로 교체)"
            description="체크 시 다음달 정기 용돈에서 자동 차감 상환 처리됩니다."
          />
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRequestModalOpen(false)}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmitRequest}
              className="min-h-[44px] px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl shadow-sm cursor-pointer transition-all"
            >
              요청서 전송
            </button>
          </div>
        </div>
      </ElmBsh01>
    </div>
  );
};
