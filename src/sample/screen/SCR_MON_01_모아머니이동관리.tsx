import React, { useState, useMemo } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
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
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  User,
  Sparkles,
  TrendingUp,
  Receipt,
  Wallet,
  Check,
  Smartphone,
  BookOpen,
  HelpCircle,
} from 'lucide-react';

// 가계부 메타데이터 인터페이스
export interface LedgerRef {
  id: string;
  name: string;
  type: 'GROUP' | 'INSTANCE';
  icon: string;
  badgeColor: string;
  members: string[];
}

export interface RepaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
}

export interface DemandedMoneyItem {
  id: string;
  ledgerId?: string; // 미지급 시 미정, 지급 시 부모/관리자가 확정
  ledgerName?: string;
  requester: string;
  amount: number;
  reason: string;
  deductAllowance: boolean;
  status: 'APPROVED' | 'PAID' | 'REJECTED';
  date: string;
  category: string;
}

export interface LoanMoneyItem {
  id: string;
  ledgerId: string; // 이미 지급된 대여금은 가계부 확정 상태
  ledgerName: string;
  debtor: string;
  amount: number;
  repaid: number;
  remaining: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIAL_PAID' | 'COMPLETED';
  type: string;
  history: RepaymentRecord[];
}

// 모아보고 등록 가계부 목록 (SSOT: 가계부 = 회계 경계선)
export const AVAILABLE_LEDGERS: LedgerRef[] = [
  {
    id: 'led-family',
    name: '우리집 생활비 가계부',
    type: 'GROUP',
    icon: '🏠',
    badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    members: ['구본영(나)', '이서영(배우자)', '구민우(자녀)'],
  },
  {
    id: 'led-vacation',
    name: '2026 가족 제주여행',
    type: 'INSTANCE',
    icon: '🏖️',
    badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    members: ['구본영(나)', '이서영(배우자)', '구민우(자녀)', '박준혁(동창)'],
  },
  {
    id: 'led-relatives',
    name: '친가·외가 명절모임',
    type: 'INSTANCE',
    icon: '👨‍👩‍👧‍👦',
    badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    members: ['구본영(나)', '이서영(배우자)', '구민우(자녀)', '박준혁(동창)'],
  },
];

export const SCR_MON_01_모아머니이동관리: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  // 1. 탭 및 가계부·구성원·상태 필터
  const [viewMode, setViewMode] = useState<'OVERVIEW' | 'URGENT_REQUEST' | 'LOAN_REQUEST'>('OVERVIEW');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>('ALL');
  const [memberFilter, setMemberFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  // 2. 모달 및 바텀시트 상태
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [repayModalItem, setRepayModalItem] = useState<LoanMoneyItem | null>(null);
  const [partialRepayAmount, setPartialRepayAmount] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ message: string; isTransfer: boolean } | null>(null);

  // 3. 딥링크 모의 모달 (지급 시 출금 가계부 지정 state 포함)
  const [deepLinkModal, setDeepLinkModal] = useState<{
    platform: 'TOSS' | 'KAKAO';
    item: DemandedMoneyItem;
    selectedPayoutLedgerId: string; // 지급 시 부모/관리자가 확정할 출금 가계부
  } | null>(null);

  // 4. 새 요청 등록 폼 상태 (요청자는 가계부를 몰라도 됨 - 순수 요청 정보만)
  const [reqMember, setReqMember] = useState('구민우(자녀)');
  const [reqAmount, setReqAmount] = useState('30000');
  const [reqReason, setReqReason] = useState('중간고사 수학 문제집 구입');
  const [reqCategory, setReqCategory] = useState('학용품/교재');
  const [deductFromAllowance, setDeductFromAllowance] = useState(true);

  // 5. 요구머니(Demanded Money) Mock 데이터 (지급 전에는 ledgerId가 미지정일 수 있음)
  const [demandedList, setDemandedList] = useState<DemandedMoneyItem[]>([
    {
      id: 'd1',
      // 아직 미지급 상태: 요청자는 가계부를 지정하지 않음
      requester: '구민우(자녀)',
      amount: 30000,
      reason: '중간고사 대비 수학 교재 및 독서실 이용권',
      deductAllowance: true,
      status: 'APPROVED',
      date: '2026-10-06',
      category: '학용품/교재',
    },
    {
      id: 'd2',
      // 이미 지급된 항목: 지급 시 '우리집 생활비 가계부'로 확정됨
      ledgerId: 'led-family',
      ledgerName: '우리집 생활비 가계부',
      requester: '구민우(자녀)',
      amount: 15000,
      reason: '준비물 아크릴 물감 세트 구매',
      deductAllowance: false,
      status: 'PAID',
      date: '2026-10-04',
      category: '학용품/교재',
    },
    {
      id: 'd3',
      requester: '이서영(배우자)',
      amount: 55000,
      reason: '가족 주말 생필품 장보기 부족분 지원',
      deductAllowance: false,
      status: 'APPROVED',
      date: '2026-10-08',
      category: '생활비',
    },
    {
      id: 'd4',
      ledgerId: 'led-vacation',
      ledgerName: '2026 가족 제주여행',
      requester: '구민우(자녀)',
      amount: 25000,
      reason: '제주도 기념품(돌하르방 열쇠고리) 구입비',
      deductAllowance: false,
      status: 'PAID',
      date: '2026-10-10',
      category: '여행경비',
    },
  ]);

  // 6. 요청머니(Loan Money) Mock 데이터 (이미 지급 완료된 대여금은 가계부 확정 상태)
  const [loanList, setLoanList] = useState<LoanMoneyItem[]>([
    {
      id: 'l1',
      ledgerId: 'led-vacation',
      ledgerName: '2026 가족 제주여행',
      debtor: '박준혁(동창)',
      amount: 300000,
      repaid: 150000,
      remaining: 150000,
      dueDate: '2026-11-15',
      status: 'PARTIAL_PAID',
      type: '여행 분담금 분납 상환',
      history: [
        { id: 'h1', date: '2026-10-01', amount: 100000, method: '계좌이체' },
        { id: 'h2', date: '2026-10-15', amount: 50000, method: '현금상환' },
      ],
    },
    {
      id: 'l2',
      ledgerId: 'led-family',
      ledgerName: '우리집 생활비 가계부',
      debtor: '구민우(자녀)',
      amount: 50000,
      repaid: 0,
      remaining: 50000,
      dueDate: '2026-10-25',
      status: 'PENDING',
      type: '다음달 정기용돈 자동 차감 상환',
      history: [],
    },
    {
      id: 'l3',
      ledgerId: 'led-family',
      ledgerName: '우리집 생활비 가계부',
      debtor: '구민우(자녀)',
      amount: 20000,
      repaid: 20000,
      remaining: 0,
      dueDate: '2026-09-30',
      status: 'COMPLETED',
      type: '용돈 선지급 상환 완료',
      history: [
        { id: 'h3', date: '2026-09-30', amount: 20000, method: '정기용돈차감' },
      ],
    },
  ]);

  // 알림 토스트 헬퍼
  const showNotice = (message: string, isTransfer = false) => {
    setFeedbackNotice({ message, isTransfer });
    setTimeout(() => setFeedbackNotice(null), 4500);
  };

  // 선택된 가계부에 따른 구성원 목록 산출
  const availableMembers = useMemo(() => {
    if (selectedLedgerId === 'ALL') {
      const set = new Set<string>();
      AVAILABLE_LEDGERS.forEach((l) => l.members.forEach((m) => set.add(m)));
      return Array.from(set);
    }
    const target = AVAILABLE_LEDGERS.find((l) => l.id === selectedLedgerId);
    return target ? target.members : [];
  }, [selectedLedgerId]);

  // 가계부 변경 시 구성원 필터 초기화
  const handleSelectLedger = (ledgerId: string) => {
    setSelectedLedgerId(ledgerId);
    setMemberFilter('ALL');
  };

  // 7. 대차대조표 집계 계산 (미지정 요구머니는 '전체' 또는 활성 집계에 포함)
  const balanceSheet = useMemo(() => {
    const targetDemands = demandedList.filter((d) => {
      // 가계부 필터: 'ALL'이거나, 항목의 가계부와 일치하거나, 미지정(지급대기)인 경우 가계부 전체에 노출
      const matchLedger =
        selectedLedgerId === 'ALL' || !d.ledgerId || d.ledgerId === selectedLedgerId;
      const matchMember = memberFilter === 'ALL' || d.requester === memberFilter;
      return matchLedger && matchMember;
    });

    const targetLoans = loanList.filter((l) => {
      const matchLedger = selectedLedgerId === 'ALL' || l.ledgerId === selectedLedgerId;
      const matchMember = memberFilter === 'ALL' || l.debtor === memberFilter;
      return matchLedger && matchMember;
    });

    const totalDemanded = targetDemands.reduce((sum, d) => sum + d.amount, 0);
    const pendingDemanded = targetDemands
      .filter((d) => d.status === 'APPROVED')
      .reduce((sum, d) => sum + d.amount, 0);

    const totalLoanPrincipal = targetLoans.reduce((sum, l) => sum + l.amount, 0);
    const totalLoanRepaid = targetLoans.reduce((sum, l) => sum + l.repaid, 0);
    const totalLoanRemaining = targetLoans.reduce((sum, l) => sum + l.remaining, 0);

    const repaymentRate =
      totalLoanPrincipal > 0 ? Math.round((totalLoanRepaid / totalLoanPrincipal) * 100) : 100;

    return {
      totalDemanded,
      pendingDemanded,
      totalLoanPrincipal,
      totalLoanRepaid,
      totalLoanRemaining,
      repaymentRate,
      activeDemandsCount: targetDemands.filter((d) => d.status === 'APPROVED').length,
      activeLoansCount: targetLoans.filter((l) => l.remaining > 0).length,
    };
  }, [demandedList, loanList, selectedLedgerId, memberFilter]);

  // 필터링된 요구머니 목록
  const filteredDemanded = useMemo(() => {
    return demandedList.filter((item) => {
      // 미확정(지급대기) 요구는 전체 가계부 및 주 가계부 모두에서 처리 가능하도록 매칭
      const matchLedger =
        selectedLedgerId === 'ALL' || !item.ledgerId || item.ledgerId === selectedLedgerId;
      const matchMember = memberFilter === 'ALL' || item.requester === memberFilter;
      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PENDING'
          ? item.status === 'APPROVED'
          : item.status === 'PAID';
      return matchLedger && matchMember && matchStatus;
    });
  }, [demandedList, selectedLedgerId, memberFilter, statusFilter]);

  // 필터링된 요청머니 목록
  const filteredLoans = useMemo(() => {
    return loanList.filter((item) => {
      const matchLedger = selectedLedgerId === 'ALL' || item.ledgerId === selectedLedgerId;
      const matchMember = memberFilter === 'ALL' || item.debtor === memberFilter;
      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'PENDING'
          ? item.remaining > 0
          : item.remaining === 0;
      return matchLedger && matchMember && matchStatus;
    });
  }, [loanList, selectedLedgerId, memberFilter, statusFilter]);

  // 8. 1초 송금 딥링크 모달 열기 (기본 출금 가계부 바인딩)
  const handleOpenDeepLink = (item: DemandedMoneyItem, platform: 'TOSS' | 'KAKAO') => {
    // 이미 지정된 가계부가 있으면 그것을 기본값으로, 없으면 현재 선택된 가계부 또는 주 생활비 가계부 선택
    const defaultLedgerId = item.ledgerId || (selectedLedgerId !== 'ALL' ? selectedLedgerId : 'led-family');
    setDeepLinkModal({
      platform,
      item,
      selectedPayoutLedgerId: defaultLedgerId,
    });
  };

  // 지급 실행 시 출금 가계부 최종 확정 & TRANSFER 기장!
  const handleConfirmTransfer = () => {
    if (!deepLinkModal) return;
    const { item, platform, selectedPayoutLedgerId } = deepLinkModal;

    const chosenLedger = AVAILABLE_LEDGERS.find((l) => l.id === selectedPayoutLedgerId);
    const ledgerName = chosenLedger ? chosenLedger.name : '우리집 생활비 가계부';

    // 요구머니 지급 완료 처리 & 지급자가 선택한 가계부로 확정 귀속!
    setDemandedList((prev) =>
      prev.map((d) =>
        d.id === item.id
          ? {
              ...d,
              status: 'PAID',
              ledgerId: selectedPayoutLedgerId,
              ledgerName: ledgerName,
            }
          : d
      )
    );

    // 용돈 차감 옵션인 경우, 지급자가 선택한 가계부의 요청머니(Loan) 리스트에 상환 항목 자동 연계!
    if (item.deductAllowance) {
      const newLoanEntry: LoanMoneyItem = {
        id: `l${Date.now()}`,
        ledgerId: selectedPayoutLedgerId,
        ledgerName: ledgerName,
        debtor: item.requester,
        amount: item.amount,
        repaid: 0,
        remaining: item.amount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'PENDING',
        type: '익월 용돈 자동 차감 상환',
        history: [],
      };
      setLoanList((prev) => [newLoanEntry, ...prev]);
    }

    const platName = platform === 'TOSS' ? '토스 간편이체' : '카카오페이 송금';
    showNotice(
      `✓ [${platName} 완료] [${ledgerName}] 출금 주머니에서 ₩${item.amount.toLocaleString()}원이 지급되었으며, 가계부 내부 이동(TRANSFER)으로 자동 기장되었습니다.`,
      true
    );
    setDeepLinkModal(null);
  };

  // 9. 부분 분할 상환 처리
  const handleOpenRepayModal = (item: LoanMoneyItem) => {
    setRepayModalItem(item);
    setPartialRepayAmount(String(item.remaining));
  };

  const handleExecuteRepay = () => {
    if (!repayModalItem) return;
    const payNum = Number(partialRepayAmount);
    if (!payNum || payNum <= 0) return;

    const actualPay = Math.min(payNum, repayModalItem.remaining);
    const nextRepaid = repayModalItem.repaid + actualPay;
    const nextRemaining = repayModalItem.remaining - actualPay;
    const nextStatus = nextRemaining === 0 ? 'COMPLETED' : 'PARTIAL_PAID';

    const newRecord: RepaymentRecord = {
      id: `h${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount: actualPay,
      method: '분할 상환 접수',
    };

    setLoanList((prev) =>
      prev.map((l) =>
        l.id === repayModalItem.id
          ? {
              ...l,
              repaid: nextRepaid,
              remaining: nextRemaining,
              status: nextStatus,
              history: [newRecord, ...l.history],
            }
          : l
      )
    );

    showNotice(
      `✓ [${repayModalItem.ledgerName}] ${repayModalItem.debtor}님의 상환금 ₩${actualPay.toLocaleString()}원이 정상 접수되었습니다. (잔여: ₩${nextRemaining.toLocaleString()}원)`,
      true
    );
    setRepayModalItem(null);
  };

  // 10. 새 머니 요청 등록 (요청자는 주머니를 몰라도 됨! 순수 요청 정보만 등록)
  const handleSubmitNewRequest = () => {
    const num = Number(reqAmount);
    if (!num || num <= 0) return;

    const newEntry: DemandedMoneyItem = {
      id: `d${Date.now()}`,
      // ledgerId는 미지정 상태: 지급 시 부모/관리자가 출금할 가계부 지정
      requester: reqMember,
      amount: num,
      reason: reqReason || '일반 자금 지원 요청',
      deductAllowance: deductFromAllowance,
      status: 'APPROVED',
      date: new Date().toISOString().slice(0, 10),
      category: reqCategory,
    };

    setDemandedList((prev) => [newEntry, ...prev]);
    setRequestModalOpen(false);
    showNotice(`✓ ₩${num.toLocaleString()}원 머니 요청서가 등록되었습니다. (출금 가계부는 지급 시 부모님이 지정합니다.)`);
  };

  // 가계부 배지 반환 헬퍼 (미지정 시 유연한 배지)
  const getLedgerBadge = (ledgerId?: string) => {
    if (!ledgerId) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span>⏳</span>
          <span>출금 가계부: 지급 시 결정</span>
        </span>
      );
    }
    const l = AVAILABLE_LEDGERS.find((item) => item.id === ledgerId);
    if (!l) return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${l.badgeColor}`}>
        <span>{l.icon}</span>
        <span>{l.name}</span>
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-10 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. 상단 헤더 & 원클릭 머니 요청 버튼 */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
              title="메인 대시보드로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <ElmTyp01
            title="모아머니 통합 이동관리"
            badge="SCR-MON-01"
            subtitle="요청은 가볍게, 출금 주머니는 지급 시 결정 • 가족 대차대조표 • 1초 송금 딥링크"
          />
        </div>

        <button
          type="button"
          onClick={() => setRequestModalOpen(true)}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>새 머니 요청 등록</span>
        </button>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. 인앱 피드백 알림 배너 (토스트) */}
      {/* ────────────────────────────────────────────────────────── */}
      {feedbackNotice && (
        <aside
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 shadow-xs transition-all animate-in fade-in ${
            feedbackNotice.isTransfer
              ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
              : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="break-keep">{feedbackNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </aside>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. 인간 중심 주머니(가계부) 분리 가이드 배너 */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-[#1a1429] dark:to-[#131b2e] border border-purple-200/80 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5 flex-1">
          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>스마트 주머니 원칙: 요청은 부담 없이, 출금 가계부는 줄 때 결정!</span>
            </span>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 break-keep leading-relaxed">
              아이/요청자는 복잡한 가계부 구조를 몰라도 자유롭게 요청할 수 있습니다. <strong>돈을 지급하는 부모(관리자)가 어떤 주머니(가계부)에서 지출할지 송금 시점에 유연하게 결정</strong>하며, 결정 즉시 해당 장부에 <code>TRANSFER</code>로 자동 기장됩니다.
            </p>
          </div>
        </div>
        <div className="shrink-0 self-start sm:self-auto flex items-center gap-1.5">
          <ElmStt01 type="PURPLE" label="생활비 왜곡 0건 방어" />
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. 가계부(ledgerId) 스위처 & 구성원 동적 필터 바 */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="space-y-2.5 bg-white dark:bg-[#131B2E] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        {/* 가계부 1차 필터 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>가계부:</span>
          </span>
          <button
            type="button"
            onClick={() => handleSelectLedger('ALL')}
            className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedLedgerId === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            전체 가계부
          </button>
          {AVAILABLE_LEDGERS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => handleSelectLedger(l.id)}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedLedgerId === l.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{l.icon}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>

        {/* 2차: 구성원 필터 & 상태 필터 */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 shrink-0 mr-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>구성원:</span>
            </span>
            <button
              type="button"
              onClick={() => setMemberFilter('ALL')}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                memberFilter === 'ALL'
                  ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
              }`}
            >
              전체
            </button>
            {availableMembers.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMemberFilter(m)}
                className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  memberFilter === m
                    ? 'bg-slate-800 dark:bg-zinc-200 text-white dark:text-slate-900 font-bold'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 focus:outline-hidden"
            >
              <option value="ALL">전체 상태</option>
              <option value="PENDING">대기 / 미상환</option>
              <option value="COMPLETED">지급완료 / 전액상환</option>
            </select>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. 가족 간 머니 대차대조표 (Family Money Balance Sheet) KPI */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: 지급 대기 요구머니 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-bold">
            <span className="flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-amber-600" />
              <span>지급 대기 요구</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 font-mono">
              {balanceSheet.activeDemandsCount}건
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 font-mono">
              ₩{balanceSheet.pendingDemanded.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              승인 요구 총액: ₩{balanceSheet.totalDemanded.toLocaleString()}
            </p>
          </div>
        </div>

        {/* KPI 2: 총 대여 원금 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-indigo-200 dark:border-indigo-900/60 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-indigo-600" />
              <span>총 대여/선지급 원금</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 font-mono">
              누적
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 font-mono">
              ₩{balanceSheet.totalLoanPrincipal.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              상환 회수율: <strong className="text-indigo-600 dark:text-indigo-400">{balanceSheet.repaymentRate}%</strong>
            </p>
          </div>
        </div>

        {/* KPI 3: 회수 완료액 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-emerald-200 dark:border-emerald-900/60 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>기상환 회수 완료</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 font-mono">
              정상회수
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              ₩{balanceSheet.totalLoanRepaid.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              용돈 공제 및 직접 분납 합산
            </p>
          </div>
        </div>

        {/* KPI 4: 미상환 잔액 (순 채권) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-purple-200 dark:border-purple-900/60 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400 font-bold">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>미상환 채권 순 잔액</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 font-mono">
              {balanceSheet.activeLoansCount}건 진행중
            </span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              ₩{balanceSheet.totalLoanRemaining.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
              회수 대기중인 순 자산 잔액
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 6. 3단 뷰 세그먼트 탭 전환 (전체 / 요구머니 / 요청머니) */}
      {/* ────────────────────────────────────────────────────────── */}
      <section className="flex flex-wrap items-center gap-2">
        <ElmFlt01
          label="전체 대차 요약"
          selected={viewMode === 'OVERVIEW'}
          count={filteredDemanded.length + filteredLoans.length}
          onClick={() => setViewMode('OVERVIEW')}
        />
        <ElmFlt01
          label="요구머니 (자금긴급/용돈선급)"
          selected={viewMode === 'URGENT_REQUEST'}
          count={filteredDemanded.length}
          onClick={() => setViewMode('URGENT_REQUEST')}
        />
        <ElmFlt01
          label="요청머니 (상환/분납관리)"
          selected={viewMode === 'LOAN_REQUEST'}
          count={filteredLoans.length}
          onClick={() => setViewMode('LOAN_REQUEST')}
        />
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 7. 요구머니 섹션 (viewMode === 'OVERVIEW' 또는 'URGENT_REQUEST') */}
      {/* ────────────────────────────────────────────────────────── */}
      {(viewMode === 'OVERVIEW' || viewMode === 'URGENT_REQUEST') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-amber-600" />
              <span>요구머니 내역 (자금 지원 요청)</span>
              <span className="text-xs font-normal text-slate-400 font-mono">({filteredDemanded.length}건)</span>
            </h3>
            {viewMode === 'OVERVIEW' && (
              <button
                type="button"
                onClick={() => setViewMode('URGENT_REQUEST')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                더보기 →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDemanded.length === 0 ? (
              <div className="col-span-full p-8 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                선택한 가계부 및 구성원의 요구머니 내역이 없습니다.
              </div>
            ) : (
              filteredDemanded.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3.5"
                >
                  <div className="space-y-2.5">
                    {/* 상단 귀속 가계부 배지 및 요청자 정보 */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 flex-wrap">
                          {getLedgerBadge(item.ledgerId)}
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">{item.requester}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[10px]">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1">
                          ₩{item.amount.toLocaleString()}원
                        </h4>
                      </div>
                      <ElmStt01
                        type={item.status === 'PAID' ? 'EMERALD' : 'AMBER'}
                        label={item.status === 'PAID' ? '지급완료 ✓' : '승인 (송금대기)'}
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">요청 사유:</span>
                      <p className="break-keep">{item.reason}</p>
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                        {item.deductAllowance ? (
                          <span>✓ 지급 시 익월 용돈 차감 (요청머니 상환 자동 연계)</span>
                        ) : (
                          <span>• 순수 지원금 (용돈 차감 없음)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1초 송금 딥링크 액션 바 */}
                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 font-mono">{item.date}</span>
                    <div className="flex items-center gap-2">
                      {item.status === 'APPROVED' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenDeepLink(item, 'TOSS')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0064FF] hover:bg-[#0052d4] active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            title="토스 1초 간편이체 딥링크 호출 (출금 가계부 지정)"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>토스 1초 이체</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeepLink(item, 'KAKAO')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FEE500] hover:bg-[#ebd300] active:scale-95 text-slate-900 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                            title="카카오페이 송금 링크 호출 (출금 가계부 지정)"
                          >
                            <span>카톡 송금</span>
                            <ExternalLink className="w-3 h-3 opacity-80" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-2">
                          <Check className="w-4 h-4" />
                          <span>TRANSFER 기장 완료 ({item.ledgerName})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 8. 요청머니 섹션 (viewMode === 'OVERVIEW' 또는 'LOAN_REQUEST') */}
      {/* ────────────────────────────────────────────────────────── */}
      {(viewMode === 'OVERVIEW' || viewMode === 'LOAN_REQUEST') && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>요청머니 내역 (대여금 / 용돈선급 분납 상환)</span>
              <span className="text-xs font-normal text-slate-400 font-mono">({filteredLoans.length}건)</span>
            </h3>
            {viewMode === 'OVERVIEW' && (
              <button
                type="button"
                onClick={() => setViewMode('LOAN_REQUEST')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                더보기 →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredLoans.length === 0 ? (
              <div className="col-span-full p-8 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                선택한 가계부 및 구성원의 요청머니 상환 내역이 없습니다.
              </div>
            ) : (
              filteredLoans.map((item) => {
                const pct = Math.round((item.repaid / item.amount) * 100);
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 flex-wrap">
                            {getLedgerBadge(item.ledgerId)}
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-zinc-300">상환 대상: {item.debtor}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1">
                            원금 ₩{item.amount.toLocaleString()}원
                          </h4>
                        </div>
                        <ElmStt01
                          type={item.remaining === 0 ? 'EMERALD' : 'PURPLE'}
                          label={item.remaining === 0 ? '전액상환 ✓' : `상환중 (${pct}%)`}
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200/80 dark:border-zinc-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-zinc-400">잔여 상환금:</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                            ₩{item.remaining.toLocaleString()}원
                          </span>
                        </div>

                        {/* 프로그레스 바 */}
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-zinc-500 pt-0.5">
                          <span>{item.type}</span>
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">
                            상환일: {item.dueDate}
                          </span>
                        </div>

                        {/* 최근 분납 이력 요약 */}
                        {item.history.length > 0 && (
                          <div className="pt-1.5 border-t border-slate-200/60 dark:border-zinc-800/80 text-[10px] text-slate-500 dark:text-zinc-400 space-y-0.5">
                            <span className="font-semibold">최근 상환:</span>
                            {item.history.slice(0, 2).map((h) => (
                              <div key={h.id} className="flex justify-between">
                                <span>{h.date} ({h.method})</span>
                                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                                  +₩{h.amount.toLocaleString()}원
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                        {item.remaining === 0 ? '상환 완결' : '상환 알림 예약중'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenRepayModal(item)}
                        disabled={item.remaining === 0}
                        className="min-h-[44px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{item.remaining === 0 ? '상환 완료' : '부분/전액 상환 접수'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 9. 1초 송금 딥링크 모달 시뮬레이션 (지급 시 출금 가계부 지정!) */}
      {/* ────────────────────────────────────────────────────────── */}
      {deepLinkModal && (
        <aside className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>{deepLinkModal.platform === 'TOSS' ? '토스(Toss) 1초 이체' : '카카오페이 송금'}</span>
              </span>
              <button
                type="button"
                onClick={() => setDeepLinkModal(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
              {/* 핵심: 지급자가 출금할 가계부(주머니) 선택 */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-1.5">
                <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>출금 가계부 지정 (어느 주머니에서 줄까요?):</span>
                </label>
                <select
                  value={deepLinkModal.selectedPayoutLedgerId}
                  onChange={(e) =>
                    setDeepLinkModal({
                      ...deepLinkModal,
                      selectedPayoutLedgerId: e.target.value,
                    })
                  }
                  className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-700 text-slate-900 dark:text-zinc-100 font-bold focus:outline-hidden"
                >
                  {AVAILABLE_LEDGERS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.icon} {l.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                  * 선택한 가계부의 내부 자산이동(TRANSFER)으로 즉시 회계 기장됩니다.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] space-y-1.5 border border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">수취인:</span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">{deepLinkModal.item.requester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">요청 사유:</span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300">{deepLinkModal.item.reason}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                  <span className="text-slate-400">이체 금액:</span>
                  <span className="font-black font-mono text-base text-indigo-600 dark:text-indigo-400">
                    ₩{deepLinkModal.item.amount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {deepLinkModal.item.deductAllowance && (
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[11px] text-purple-700 dark:text-purple-300">
                  <p className="font-bold">✓ 용돈 차감 연계:</p>
                  <p className="break-keep">
                    선택한 가계부의 익월 정기용돈 차감(요청머니 상환) 항목으로 자동 등록됩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeepLinkModal(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="min-h-[44px] px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>주머니 확정 및 송금 실행</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ────────────────────────────────────────────────────────── */}
      {/* 10. 부분 분할 상환 바텀시트 (ElmBsh01) */}
      {/* ────────────────────────────────────────────────────────── */}
      <ElmBsh01
        isOpen={Boolean(repayModalItem)}
        onClose={() => setRepayModalItem(null)}
        title="요청머니 분할 상환 접수"
      >
        {repayModalItem && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">귀속 가계부:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{repayModalItem.ledgerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">상환 대상자:</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{repayModalItem.debtor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">원금 대비 잔여액:</span>
                <span className="font-mono font-bold text-rose-600">
                  ₩{repayModalItem.remaining.toLocaleString()}원 / ₩{repayModalItem.amount.toLocaleString()}원
                </span>
              </div>
            </div>

            <ElmInp01
              label="상환 접수 금액 (원)"
              type="number"
              value={partialRepayAmount}
              onChange={setPartialRepayAmount}
            />

            {/* 퀵 금액 증감 칩 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">빠른 선택:</span>
              {[10000, 30000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPartialRepayAmount(String(amt))}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-[11px] font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 cursor-pointer"
                >
                  +{amt.toLocaleString()}원
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPartialRepayAmount(String(repayModalItem.remaining))}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-200 cursor-pointer"
              >
                잔액 전액 (₩{repayModalItem.remaining.toLocaleString()})
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRepayModalItem(null)}
                className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleExecuteRepay}
                className="min-h-[44px] px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl shadow-sm cursor-pointer transition-all"
              >
                상환 반영하기
              </button>
            </div>
          </div>
        )}
      </ElmBsh01>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 11. 새 머니 요청 등록 바텀시트 (요청자는 순수 요청 내용만 작성!) */}
      {/* ────────────────────────────────────────────────────────── */}
      <ElmBsh01
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="새 모아머니 요청서 작성"
      >
        <div className="space-y-4">
          {/* 가이드 배너: 요청자는 가계부를 몰라도 됨 */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p className="break-keep leading-relaxed text-[11px]">
              필요한 금액과 사유만 적어주세요. <strong>어느 주머니(가계부)에서 지출할지는 지급할 때 부모님이 결정</strong>합니다.
            </p>
          </div>

          {/* 요청 구성원 선택 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              요청자 (수취인)
            </label>
            <select
              value={reqMember}
              onChange={(e) => setReqMember(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden"
            >
              {['구민우(자녀)', '이서영(배우자)', '구본영(나)'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

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
            placeholder="자세한 구매 또는 지출 사유를 입력하세요 (예: 문제집, 독서실비 등)..."
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              카테고리 분류
            </label>
            <select
              value={reqCategory}
              onChange={(e) => setReqCategory(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-hidden"
            >
              <option value="학용품/교재">학용품/교재</option>
              <option value="교통/식비">교통/식비</option>
              <option value="생활비">생활비</option>
              <option value="여행경비">여행경비</option>
              <option value="긴급비상금">긴급비상금</option>
            </select>
          </div>

          <ElmChk01
            checked={deductFromAllowance}
            onChange={setDeductFromAllowance}
            label="지급 시 다음달 정기 용돈에서 차감 (요청머니 상환 연계)"
            description="체크 시 부모님이 지급할 때 요청머니 상환 목록으로 자동 등록되어 체계적인 용돈 관리를 돕습니다."
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
              onClick={handleSubmitNewRequest}
              className="min-h-[44px] px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl shadow-sm cursor-pointer transition-all"
            >
              요청서 전송
            </button>
          </div>
        </div>
      </ElmBsh01>
    </div>
  );
};
