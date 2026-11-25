import React, { useRef } from 'react';
import { Shield, Wrench, AlertTriangle, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { VehicleMaintenanceRule } from './types';
import { calculateMaintenanceFsm } from './useMoaCar';

interface CarMaintenanceStripProps {
  rules: VehicleMaintenanceRule[];
  currentOdometerKm: number;
  isDark?: boolean;
}

export const CarMaintenanceStrip: React.FC<CarMaintenanceStripProps> = ({
  rules,
  currentOdometerKm,
  isDark = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 휠 스크롤 패스스루 핸들러 (좌우 스크롤 지원)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (rules.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OVERDUE':
        return isDark ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700';
      case 'URGENT':
        return isDark ? 'bg-amber-950/40 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700';
      case 'IMMINENT':
        return isDark ? 'bg-yellow-950/40 border-yellow-800 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'CHECK_SOON':
        return isDark ? 'bg-blue-950/40 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return isDark ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'INSURANCE_RENEWAL':
        return <Shield className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'LEGAL_INSPECTION':
        return <Calendar className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'ENGINE_OIL':
      case 'AIR_FILTER':
      case 'TIRE_ROTATION':
      default:
        return <Wrench className="w-4 h-4 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>점검·보험 D-Day 타임라인</span>
        </div>
        <span className="text-[11px] text-slate-400">가로로 스크롤하여 확인</span>
      </div>

      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
      >
        {rules.map((rule) => {
          const fsm = calculateMaintenanceFsm(rule, currentOdometerKm);
          const colorClass = getStatusColor(fsm.status);

          return (
            <div
              key={rule.rule_id}
              className={`shrink-0 w-52 sm:w-56 p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isDark ? 'bg-slate-900/90 border-slate-800 shadow-sm' : 'bg-white border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getRuleIcon(rule.rule_type)}
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {rule.title}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${colorClass}`}>
                  {fsm.badgeText}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 mb-2.5">
                {rule.next_due_date && (
                  <div className="flex justify-between items-center">
                    <span>예정일</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{rule.next_due_date}</span>
                  </div>
                )}
                {rule.next_due_odometer_km && (
                  <div className="flex justify-between items-center">
                    <span>예정거리</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {rule.next_due_odometer_km.toLocaleString()} km
                    </span>
                  </div>
                )}
              </div>

              {/* 연동 배지: 사용자 설정 기반 모아데이 및 모아루틴 투영 표시 */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {rule.sync_to_day ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> 모아데이
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">모아데이 미연동</span>
                )}
                {rule.sync_to_routine && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
                    루틴
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
