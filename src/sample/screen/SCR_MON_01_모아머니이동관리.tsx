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
} from 'lucide-react';

export const SCR_MON_01_모아머니이동관리: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'URGENT_REQUEST' | 'LOAN_REQUEST'>('URGENT_REQUEST');
  const [requestModalOpen, setRequestModalOpen] = useState(false);

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
    alert(
      `[${platform} 딥링크 생성]\n수신인: ${item.requester}\n금액: ₩${item.amount.toLocaleString()}원\n` +
        `그룹 가계부 내 '가족 내부 이동'으로 등록되어 이중 합산이 방지됩니다.`
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
            SCR-MON-01
          </span>
          <ElmTyp01
            title="모아머니 통합 이동관리"
            subtitle="요구머니 (자금긴급/용돈차감) & 요청머니 (상환/분납)"
          />
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>머니 요청 등록</span>
        </button>
      </div>

      {/* Accounting Guardrail Banner */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2 flex-1">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span className="break-keep">
            <strong>가족 내부 이동 가드레일:</strong> 모아머니 요구 및 상환은 '내부 자산 이동'으로 자동 회계 분리되어 생활비 예산이 2중으로 부풀려지지 않습니다.
          </span>
        </div>
        <div className="shrink-0 self-start sm:self-auto">
          <ElmStt01 type="PURPLE" label="생활비 왜곡 차단" />
        </div>
      </div>

      {/* Tab Switcher - 모바일 가로폭주 방지: flex-wrap 및 간결 라벨 */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
      </div>

      {/* Tab 1: 요구머니 (Urgent Request) */}
      {activeTab === 'URGENT_REQUEST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demandedList.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400">요청자: {item.requester}</span>
                    <h3 className="text-lg font-black text-slate-900 font-mono mt-0.5">
                      ₩{item.amount.toLocaleString()}원
                    </h3>
                  </div>
                  <ElmStt01
                    type={item.status === 'PAID' ? 'EMERALD' : 'AMBER'}
                    label={item.status === 'PAID' ? '지급완료' : '승인됨 (송금대기)'}
                  />
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-800">사유:</span>
                  <p>{item.reason}</p>
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium">
                    <span>{item.deductAllowance ? '✓ 지급 시 다음달 용돈에서 차감 (요청머니 연계)' : '• 순수 지원금 (차감 없음)'}</span>
                  </div>
                </div>
              </div>

              {/* 3-Second Deep link transfer buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">{item.date}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePayDeepLink(item, 'TOSS')}
                    className="px-3 py-1.5 rounded-lg bg-[#0064FF] hover:bg-[#0052d4] text-white text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <span>토스 이체</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handlePayDeepLink(item, 'KAKAO')}
                    className="px-3 py-1.5 rounded-lg bg-[#FEE500] hover:bg-[#ebd300] text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1"
                  >
                    <span>카톡 송금</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: 요청머니 (Loan & Installment Repayment) */}
      {activeTab === 'LOAN_REQUEST' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loanList.map((item) => {
            const pct = Math.round((item.repaid / item.amount) * 100);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400">대상자: {item.requester}</span>
                      <h3 className="text-lg font-black text-slate-900 font-mono mt-0.5">
                        원금 ₩{item.amount.toLocaleString()}원
                      </h3>
                    </div>
                    <ElmStt01
                      type={item.remaining === 0 ? 'EMERALD' : 'PURPLE'}
                      label={item.remaining === 0 ? '전액상환' : `상환중 (${pct}%)`}
                    />
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">잔여 상환액:</span>
                      <span className="font-mono font-bold text-rose-600">
                        ₩{item.remaining.toLocaleString()}원
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                      <span>방식: {item.type}</span>
                      <span className="font-semibold text-slate-700">D-Day: {item.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-indigo-600 font-semibold">
                    상환예정일 알림 예약됨
                  </span>
                  <button
                    onClick={() => alert(`[분납 상환 기록] ₩${item.remaining.toLocaleString()}원 상환 접수`)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                  >
                    분할 상환 접수
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal Bottom Sheet */}
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
              onClick={() => setRequestModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500"
            >
              취소
            </button>
            <button
              onClick={() => {
                alert('요청서가 등록되었습니다.');
                setRequestModalOpen(false);
              }}
              className="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-lg shadow-sm"
            >
              요청서 전송
            </button>
          </div>
        </div>
      </ElmBsh01>
    </div>
  );
};
