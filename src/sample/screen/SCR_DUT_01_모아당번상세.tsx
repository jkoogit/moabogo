import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmFlt01,
  ElmStt01,
  ElmCnt01,
  ElmPrf01,
  ElmStp01,
  ElmBsh01,
  ElmSwt01,
} from '../elements/Tokens';
import {
  Sparkles,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Users,
  Eye,
  Plus,
  HelpCircle,
  ArrowRightLeft,
} from 'lucide-react';

export type DutyStatusType = 'COMPLETED' | 'ON_HOLD' | 'SUBSTITUTE_REQUESTED' | 'RESERVED';

export const SCR_DUT_01_모아당번상세: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [approvalPolicy, setApprovalPolicy] = useState(true);
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState<any>(null);
  const [proofMemo, setProofMemo] = useState('깨끗하게 완료했습니다!');
  const [selectedNewStatus, setSelectedNewStatus] = useState<DutyStatusType>('COMPLETED');

  // Substitute duty counter state
  const [substituteRequestedCount, setSubstituteRequestedCount] = useState(2);
  const [substituteExecutedCount, setSubstituteExecutedCount] = useState(1);

  // Duties list
  const [duties, setDuties] = useState([
    {
      id: 'd1',
      title: '거실 청소기 및 물걸레 밀기',
      assigned: '구민우(자녀)',
      isGuest: false,
      status: 'SUBSTITUTE_REQUESTED' as DutyStatusType,
      memo: '학원 시험 준비로 인해 대신수행 요청 접수됨',
      proofImg: '',
      date: '2026-10-06',
    },
    {
      id: 'd2',
      title: '주말 분리수거 및 음식물 쓰레기 배출',
      assigned: '구본영(호스트)',
      isGuest: false,
      status: 'COMPLETED' as DutyStatusType,
      memo: '분리수거 완료 사진 등록됨',
      proofImg: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&auto=format&fit=crop&q=60',
      date: '2026-10-05',
    },
    {
      id: 'd3',
      title: '동창회 펜션 주방 식기 정리',
      assigned: '게스트 정현우',
      isGuest: true,
      status: 'RESERVED' as DutyStatusType,
      memo: '퇴실 시 수행 예정',
      proofImg: '',
      date: '2026-10-07',
    },
  ]);

  const handleOpenProof = (duty: any) => {
    setSelectedDuty(duty);
    setProofModalOpen(true);
  };

  const handleSaveProof = () => {
    if (!selectedDuty) return;
    setDuties(
      duties.map((d) =>
        d.id === selectedDuty.id
          ? {
              ...d,
              status: selectedNewStatus,
              memo: proofMemo,
              proofImg:
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60',
            }
          : d
      )
    );
    if (selectedNewStatus === 'COMPLETED' && selectedDuty.status === 'SUBSTITUTE_REQUESTED') {
      setSubstituteExecutedCount((prev) => prev + 1);
    }
    setProofModalOpen(false);
  };

  const getStatusBadge = (status: DutyStatusType) => {
    switch (status) {
      case 'COMPLETED':
        return <ElmStt01 type="EMERALD" label="완료 (COMPLETED)" />;
      case 'ON_HOLD':
        return <ElmStt01 type="AMBER" label="보류 양해 (ON_HOLD)" />;
      case 'SUBSTITUTE_REQUESTED':
        return <ElmStt01 type="ROSE" label="대신요청 (SUBSTITUTE)" />;
      case 'RESERVED':
        return <ElmStt01 type="INDIGO" label="예약 (RESERVED)" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              SCR-DUT-01
            </span>
            <ElmTyp01
              title="모아당번 (MoaDuty) 상세 관리"
              subtitle="당번정책 & 상태머신 (완료/보류/대신요청/예약) & 대신수행 건수관리"
            />
          </div>
        </div>

        <button
          onClick={() => alert('새 당번 등록 모달 호출')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 당번 과업 등록</span>
        </button>
      </div>

      {/* Policy & Substitute Duty KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Policy Box */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">당번 승인 정책 (RBAC)</span>
            <div className="mt-2">
              <ElmSwt01
                checked={approvalPolicy}
                onChange={setApprovalPolicy}
                label="관리자 최종 승인 필수"
                description={approvalPolicy ? '인증 후 관리자 승인 시 완료' : '사진 등록 즉시 완료 인정'}
              />
            </div>
          </div>
        </div>

        {/* Substitute Duty Requested Count */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">대신수행 [요청] 건수</span>
            <div className="text-2xl font-black text-rose-600 font-mono">
              {substituteRequestedCount}건
            </div>
            <p className="text-[11px] text-slate-400">타 구성원에게 위임 요청됨</p>
          </div>
          <span className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <ArrowRightLeft className="w-5 h-5" />
          </span>
        </div>

        {/* Substitute Duty Executed Count */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">대신수행 [실행] 건수</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {substituteExecutedCount}건
            </div>
            <p className="text-[11px] text-slate-400">요청을 수락하여 대신 완수함</p>
          </div>
          <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Duty Card Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 leading-none">
              등록된 당번 과업 목록
            </h3>
            <ElmCnt01 count={duties.length} />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <ElmFlt01
              label="전체"
              selected={filterStatus === 'ALL'}
              onClick={() => setFilterStatus('ALL')}
            />
            <ElmFlt01
              label="대신요청"
              selected={filterStatus === 'SUBSTITUTE'}
              onClick={() => setFilterStatus('SUBSTITUTE')}
            />
            <ElmFlt01
              label="완료됨"
              selected={filterStatus === 'COMPLETED'}
              onClick={() => setFilterStatus('COMPLETED')}
            />
          </div>
        </div>

        {/* Duties Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {duties.map((duty) => (
            <div
              key={duty.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900">{duty.title}</h4>
                  {getStatusBadge(duty.status)}
                </div>

                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>담당자:</span>
                    <span className="font-semibold text-slate-800">
                      {duty.assigned} {duty.isGuest && '(게스트)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>예정일자:</span>
                    <span className="font-mono">{duty.date}</span>
                  </div>
                </div>

                {duty.proofImg && (
                  <div className="mt-2.5">
                    <img
                      src={duty.proofImg}
                      alt="인증"
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                {duty.memo && (
                  <p className="mt-2 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                    {duty.memo}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenProof(duty)}
                  className="w-full py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>수행/상태 등록 및 사진인증</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof & Status Modal Bottom Sheet */}
      <ElmBsh01
        isOpen={proofModalOpen}
        onClose={() => setProofModalOpen(false)}
        title="당번 수행 및 상태 설정 (인증사진)"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            과업: <strong>{selectedDuty?.title}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 leading-none">
              상태 설정 (4대 상태머신)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedNewStatus('COMPLETED')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  selectedNewStatus === 'COMPLETED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                ✓ 완료 (인증사진 포함)
              </button>
              <button
                type="button"
                onClick={() => setSelectedNewStatus('SUBSTITUTE_REQUESTED')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  selectedNewStatus === 'SUBSTITUTE_REQUESTED'
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                🔄 대신수행 요청
              </button>
              <button
                type="button"
                onClick={() => setSelectedNewStatus('ON_HOLD')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  selectedNewStatus === 'ON_HOLD'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                ⏸ 보류 양해 (사유 메모)
              </button>
              <button
                type="button"
                onClick={() => setSelectedNewStatus('RESERVED')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                  selectedNewStatus === 'RESERVED'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                🗓 수행 예약
              </button>
            </div>
          </div>

          <ElmInp01
            label="수행 메모 / 사유"
            value={proofMemo}
            onChange={setProofMemo}
            placeholder="상세 내용을 입력하세요..."
          />

          <div className="p-3 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            📷 <strong>인증 사진 등록:</strong> 카메라 촬영 또는 갤러리 업로드
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setProofModalOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500"
            >
              취소
            </button>
            <button
              onClick={handleSaveProof}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-sm"
            >
              상태 저장 완료
            </button>
          </div>
        </div>
      </ElmBsh01>
    </div>
  );
};
