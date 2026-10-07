import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmInp04,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmTre01,
  ElmBsh01,
  ElmChk01,
  TreeNode,
} from '../elements/Tokens';
import {
  Wallet,
  Users,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Calendar,
  Layers,
} from 'lucide-react';

export const SCR_LED_01_그룹가계부관리상세: React.FC = () => {
  const [activeLedgerType, setActiveLedgerType] = useState<'GROUP' | 'PERSONAL' | 'INSTANCE'>('GROUP');
  const [searchWord, setSearchWord] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  // Sample Members list
  const [members, setMembers] = useState([
    { id: 'm1', name: '구본영(호스트)', role: 'OWNER', isGuest: false },
    { id: 'm2', name: '김은지(배우자)', role: 'MEMBER', isGuest: false },
    { id: 'm3', name: '구민우(자녀)', role: 'MEMBER', isGuest: false },
    { id: 'g1', name: '게스트 정현우', role: 'VIEWER', isGuest: true },
  ]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    if (activeLedgerType === 'GROUP' && isGuest) {
      alert('[정책 가드레일] 정규 그룹 가계부는 정식 가입 회원만 참여할 수 있습니다. (개별/인스턴스 가계부는 게스트 허용)');
      return;
    }

    setMembers([
      ...members,
      {
        id: `m-${Date.now()}`,
        name: newMemberName.trim(),
        role: 'MEMBER',
        isGuest,
      },
    ]);
    setNewMemberName('');
    setMemberModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              SCR-LED-01
            </span>
            <ElmTyp01
              title="가계부 관리 및 구성원 RBAC 상세"
              subtitle="그룹 가계부(회원필수) vs 개별/인스턴스(게스트허용) 정책 분리"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>구성원 관리 ({members.length}명)</span>
          </button>
          <button
            onClick={() => alert('새 가계부 생성 모달 호출')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 가계부 등록</span>
          </button>
        </div>
      </div>

      {/* Ledger Type Switcher & Policy Notice */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ElmFlt01
            label="우리집 가계부 (그룹 - 회원필수)"
            selected={activeLedgerType === 'GROUP'}
            onClick={() => setActiveLedgerType('GROUP')}
          />
          <ElmFlt01
            label="내 개인 가계부 (개별)"
            selected={activeLedgerType === 'PERSONAL'}
            onClick={() => setActiveLedgerType('PERSONAL')}
          />
          <ElmFlt01
            label="2026 상반기 동창 모임 (인스턴스 - 게스트허용)"
            selected={activeLedgerType === 'INSTANCE'}
            onClick={() => setActiveLedgerType('INSTANCE')}
          />
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>현재 가계부 구성원 정책:</strong>{' '}
              {activeLedgerType === 'GROUP'
                ? '정규 가족 그룹 가계부는 정합성을 위해 정식 가입 회원만 참여 가능합니다.'
                : '개별 및 인스턴스 가계부는 미가입 게스트 참여를 유연하게 허용합니다.'}
            </span>
          </span>
          <ElmStt01
            type={activeLedgerType === 'GROUP' ? 'EMERALD' : 'PURPLE'}
            label={activeLedgerType === 'GROUP' ? '그룹 : 회원필수' : '인스턴스 : 게스트허용'}
          />
        </div>
      </div>

      {/* Transactions List & Search */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 leading-none">
              거래 내역 리스트
            </span>
            <ElmCnt01 count={24} label="총" />
          </div>

          <div className="w-full sm:w-72">
            <ElmInp04
              value={searchWord}
              onChange={setSearchWord}
              placeholder="가맹점 및 메모 검색..."
            />
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <ElmFlt01
            label="전체"
            selected={activeCategory === 'ALL'}
            onClick={() => setActiveCategory('ALL')}
          />
          <ElmFlt01
            label="식음료"
            selected={activeCategory === 'CAFE'}
            onClick={() => setActiveCategory('CAFE')}
          />
          <ElmFlt01
            label="마트/장보기"
            selected={activeCategory === 'MART'}
            onClick={() => setActiveCategory('MART')}
          />
          <ElmFlt01
            label="자산이동 (생활비제외)"
            selected={activeCategory === 'ASSET'}
            onClick={() => setActiveCategory('ASSET')}
          />
        </div>

        {/* Table Rows with Vertical 100% Center Alignment */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          {[
            {
              id: '1',
              title: '이마트 양재점 (주말 식자재)',
              type: 'EXPENSE',
              amount: 124800,
              cat: '식료품/마트',
              date: '2026-10-06',
              isAsset: false,
            },
            {
              id: '2',
              title: '구민우 자녀 용돈 지급 (가족내부이동)',
              type: 'TRANSFER',
              amount: 50000,
              cat: '가족 내부 이동',
              date: '2026-10-05',
              isAsset: true,
            },
            {
              id: '3',
              title: '스타벅스 강남점 (커피 & 베이글)',
              type: 'EXPENSE',
              amount: 14500,
              cat: '식음료/카페',
              date: '2026-10-04',
              isAsset: false,
            },
            {
              id: '4',
              title: '동창회 펜션 1/N 정산 입금',
              type: 'INCOME',
              amount: 78000,
              cat: '모임/정산',
              date: '2026-10-03',
              isAsset: false,
            },
          ].map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === 'EXPENSE'
                      ? 'bg-rose-50 text-rose-600'
                      : tx.type === 'INCOME'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {tx.type === 'EXPENSE' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : tx.type === 'INCOME' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <ArrowRightLeft className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {tx.title}
                    </span>
                    <ElmStt01
                      type={tx.isAsset ? 'PURPLE' : 'SLATE'}
                      label={tx.cat}
                    />
                    {tx.isAsset && (
                      <span className="text-[10px] text-purple-700 font-semibold hidden sm:inline">
                        (생활비제외)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{tx.date}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-mono font-bold text-xs ${
                    tx.type === 'EXPENSE'
                      ? 'text-rose-600'
                      : tx.type === 'INCOME'
                      ? 'text-emerald-600'
                      : 'text-indigo-600'
                  }`}
                >
                  {tx.type === 'EXPENSE' ? '-' : '+'}₩{tx.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet for Member Management Modal */}
      <ElmBsh01
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title="가계부 구성원 RBAC 관리"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            가계부 참여 구성원의 권한을 확인하고 새 구성원을 초대합니다. (그룹 가계부는 회원필수)
          </p>

          {/* Member List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {members.map((m) => (
              <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{m.name}</span>
                  {m.isGuest && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px]">
                      게스트
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-indigo-600">{m.role}</span>
              </div>
            ))}
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddMember} className="space-y-3 pt-2 border-t border-slate-100">
            <ElmInp01
              label="구성원 이름 / 닉네임"
              value={newMemberName}
              onChange={setNewMemberName}
              placeholder="예: 친구B"
            />

            <ElmChk01
              checked={isGuest}
              onChange={setIsGuest}
              label="미가입 게스트로 추가 (인스턴스 가계부에서만 허용)"
            />

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMemberModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-500"
              >
                닫기
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm"
              >
                구성원 초대
              </button>
            </div>
          </form>
        </div>
      </ElmBsh01>
    </div>
  );
};
