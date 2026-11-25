import React, { useState } from 'react';
import {
  Car,
  Fuel,
  Wrench,
  Shield,
  MapPin,
  Sparkles,
  Layers,
  Plus,
  Gauge,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronDown,
  CreditCard,
  Edit2,
  Eye,
  EyeOff,
  Settings2,
  Link2,
  Paperclip,
} from 'lucide-react';
import { ElmSld03 } from '../elements/Tokens';
import { useTheme } from '../../context/ThemeContext';
import { useMoaCar } from './car/useMoaCar';
import { VehicleLogType, CarFilterTab, VehicleLog } from './car/types';
import { CarMaintenanceStrip } from './car/CarMaintenanceStrip';
import { CarRegisterModal } from './car/CarRegisterModal';
import { CarLogCreateModal } from './car/CarLogCreateModal';
import { DuplicateExpenseReconcileModal } from './car/DuplicateExpenseReconcileModal';
import { LinkedExpenseDetailModal } from './car/LinkedExpenseDetailModal';
import { PhotoViewerModal } from './car/PhotoViewerModal';

interface ScreenProps {
  onBack?: () => void;
  onGoSettings?: () => void;
}

const TAB_CONFIG: { tab: CarFilterTab; label: string; icon: React.ReactNode }[] = [
  { tab: 'ALL', label: '전체', icon: <Car className="w-3.5 h-3.5" /> },
  { tab: 'PARKING', label: '주차', icon: <MapPin className="w-3.5 h-3.5" /> },
  { tab: 'FUEL', label: '주유·충전', icon: <Fuel className="w-3.5 h-3.5" /> },
  { tab: 'WASH', label: '세차', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { tab: 'INSPECTION', label: '점검', icon: <Wrench className="w-3.5 h-3.5" /> },
  { tab: 'REPAIR', label: '수리', icon: <Wrench className="w-3.5 h-3.5" /> },
  { tab: 'INSURANCE', label: '보험', icon: <Shield className="w-3.5 h-3.5" /> },
];

export const SCR_CAR_01_모아부릉: React.FC<ScreenProps> = ({ onBack, onGoSettings }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  const {
    vehicles,
    currentVehicle,
    selectedVehicleId,
    selectVehicle,
    updateOdometer,
    addVehicle,
    filteredLogs,
    activeTab,
    setActiveTab,
    vehicleRules,
    monthlyTco,
    recentEfficiency,
    latestParkingLocation,
    addVehicleLog,
    duplicates,
    unresolvedDuplicateCount,
    resolveDuplicate,
    userSettings,
    shouldSyncToDay,
    detectDuplicateSuspect,
  } = useMoaCar();

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [selectedLinkedLog, setSelectedLinkedLog] = useState<VehicleLog | null>(null);
  const [viewerPhotos, setViewerPhotos] = useState<string[] | null>(null);
  const [isMaskPlate, setIsMaskPlate] = useState(true);
  const [isEditingOdometer, setIsEditingOdometer] = useState(false);
  const [tempOdometer, setTempOdometer] = useState<number>(currentVehicle?.current_odometer_km || 0);

  // 번호판 마스킹 (예: 12가 3456 ➔ 12가 34**)
  const displayPlateNumber = (plate: string) => {
    if (!isMaskPlate || plate.length < 4) return plate;
    return `${plate.slice(0, -2)}**`;
  };

  const getLogTypeBadge = (type: VehicleLogType) => {
    switch (type) {
      case 'FUEL':
        return { label: '주유', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'INSPECTION':
        return { label: '점검', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
      case 'REPAIR':
        return { label: '수리', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
      case 'WASH':
        return { label: '세차', cls: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' };
      case 'INSURANCE':
        return { label: '보험', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' };
      case 'PARKING':
      default:
        return { label: '주차', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
    }
  };

  const handleSaveOdometer = () => {
    if (tempOdometer > 0) {
      updateOdometer(tempOdometer);
    }
    setIsEditingOdometer(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* 1. 상단 다중 차량 스위처 & 헤더 */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-md' : 'bg-white border-slate-200/90 shadow-2xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">모아부릉</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                  6대 일상관리 허브
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                차량별 6대 이력 원장·가계부 1:1 연동·중복지출 정리
              </p>
            </div>
          </div>

          {/* 다중 차량 스위처 칩 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {vehicles.map((v) => (
              <button
                type="button"
                key={v.vehicle_id}
                onClick={() => {
                  selectVehicle(v.vehicle_id);
                  setTempOdometer(v.current_odometer_km);
                }}
                className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  v.vehicle_id === selectedVehicleId
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span>{v.nickname}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(true)}
              className="min-h-[36px] px-2.5 rounded-xl text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> 차량 추가
            </button>
          </div>
        </div>

        {/* 선택 차량 정보 바 & 계기판 주행거리 수정 (요소 단위 줄바꿈 정합성 보장) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentVehicle?.model_name}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ({currentVehicle?.model_year}년식 · {currentVehicle?.fuel_type})
            </span>
            <button
              type="button"
              onClick={() => setIsMaskPlate(!isMaskPlate)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="번호판 마스킹 토글"
            >
              {isMaskPlate ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="font-mono">{displayPlateNumber(currentVehicle?.plate_number || '')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">누적 주행:</span>
            {isEditingOdometer ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tempOdometer}
                  onChange={(e) => setTempOdometer(Number(e.target.value))}
                  className="w-24 h-7 px-1.5 text-xs font-mono rounded border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleSaveOdometer}
                  className="px-2 h-7 text-[11px] font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  저장
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {currentVehicle?.current_odometer_km.toLocaleString()} km
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTempOdometer(currentVehicle?.current_odometer_km || 0);
                    setIsEditingOdometer(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="주행거리 직접 수정"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. 보조적 참고 지표 바 (과장/강조 배제, 차분한 보조 통계) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">당월 유지비 (참고)</span>
            <span className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200">
              {monthlyTco.toLocaleString()}원
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">최근 구간 연비 (참고)</span>
            <span className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200">
              {recentEfficiency ? `${recentEfficiency} km/L` : '기록 필요 (-)'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">마지막 주차 위치</span>
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
              {latestParkingLocation ? `${latestParkingLocation.zone} (${latestParkingLocation.vendor})` : '주차 기록 없음'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. 점검·소모품·보험 D-Day 스트립 */}
      <CarMaintenanceStrip
        rules={vehicleRules}
        currentOdometerKm={currentVehicle?.current_odometer_km || 0}
        isDark={isDark}
      />

      {/* 5. 6대 관리포인트 탭 바 & 퀵 액션 (ElmSld03 슬라이드드래그휠 적용) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="w-full sm:w-auto overflow-hidden">
          <ElmSld03 showNavButtons={false} stepWidth={120} className="w-full">
            <div className="flex items-center gap-1.5 pb-1 min-w-max">
              {TAB_CONFIG.map((t) => (
                <button
                  type="button"
                  key={t.tab}
                  onClick={() => setActiveTab(t.tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === t.tab
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </ElmSld03>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* 중복지출 정리 버튼: 미해결 발생건이 있을 때만 동적 노출 (사용자 피드백 1.c) */}
          {unresolvedDuplicateCount > 0 && (
            <button
              type="button"
              onClick={() => setIsReconcileModalOpen(true)}
              className="min-h-[38px] px-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs animate-in fade-in"
              title="중복지출 정리 센터 열기"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>중복정리</span>
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                {unresolvedDuplicateCount}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="min-h-[38px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>이력 등록</span>
          </button>
        </div>
      </div>

      {/* 6. 이력 타임라인 리스트 */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
            <Car className="w-8 h-8 mx-auto mb-2 opacity-60" />
            등록된 이력이 없습니다. 상단 [+ 이력 등록] 버튼으로 첫 기록을 남겨보세요.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getLogTypeBadge(log.log_type);
            return (
              <div
                key={log.log_id}
                className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {log.summary}
                    </h3>

                    {/* 모아데이 계획 상호 연결 뱃지 */}
                    {log.linked_day_schedule_title && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                        <Calendar className="w-2.5 h-2.5 text-blue-600" />
                        <span>모아데이: {log.linked_day_schedule_title}</span>
                      </span>
                    )}

                    {/* 주유 ➔ 세차 연계 뱃지 */}
                    {log.meta.linked_wash_log_id && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-600" />
                        <span>세차 연계됨</span>
                      </span>
                    )}

                    {/* 세차 ➔ 주유 연계 뱃지 */}
                    {log.meta.linked_fuel_log_id && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Fuel className="w-2.5 h-2.5 text-emerald-600" />
                        <span>주유 연계 세차</span>
                      </span>
                    )}

                    {/* 지출모아 연결 배지 (클릭 시 사본/원본 관계 확인 팝업) */}
                    {((log.linked_replica_entries && log.linked_replica_entries.length > 0) ||
                      log.linked_primary_source_id) && (
                      <button
                        type="button"
                        onClick={() => setSelectedLinkedLog(log)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                        title="지출모아 연결된 동일 지출 사본 확인 (클릭 시 상세 팝업)"
                      >
                        <Link2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {log.linked_primary_source_id
                            ? '사본 (원본 연결됨)'
                            : `지출모아 연결됨 (${log.linked_replica_entries?.length || 1}건 사본)`}
                        </span>
                      </button>
                    )}

                    {/* 중복 의심 경고 배지 (클릭 시 중복정리 센터 즉시 열림) */}
                    {log.is_duplicate_suspected && (
                      <button
                        type="button"
                        onClick={() => setIsReconcileModalOpen(true)}
                        className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 transition-colors cursor-pointer"
                        title="동일 일자·결제수단·금액 지출 중복 의심 - 클릭하여 지출모아 연결하기"
                      >
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        <span>중복 의심 (정리)</span>
                      </button>
                    )}
                  </div>
                  <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                    {log.amount > 0 ? `${log.amount.toLocaleString()}원` : '무료'}
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span className="font-mono">{log.occurred_at}</span>
                  {log.odometer_km && (
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {log.odometer_km.toLocaleString()} km
                    </span>
                  )}
                  <span>{log.vendor_name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                    {log.payment_method}
                  </span>
                </div>

                {log.detail_memo && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2.5 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                    {log.detail_memo}
                  </p>
                )}

                {/* 특화 메타 정보 (연비/주차구역/경고등/사진/연동 등) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                  {log.meta.calc_efficiency_km_per_l && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      실연비 {log.meta.calc_efficiency_km_per_l} km/L
                    </span>
                  )}
                  {log.meta.parking_zone && (
                    <span className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                      위치: {log.meta.parking_zone}
                    </span>
                  )}
                  {log.meta.emergency_tel && (
                    <span className="text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                      긴급출동: {log.meta.emergency_tel}
                    </span>
                  )}
                  {log.meta.warning_lights_detected && log.meta.warning_lights_detected.length > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                      경고등: {log.meta.warning_lights_detected.join(', ')}
                    </span>
                  )}
                  {log.meta.photo_urls && log.meta.photo_urls.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setViewerPhotos(log.meta.photo_urls || [])}
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                    >
                      <Paperclip className="w-3 h-3" /> 증빙사진 {log.meta.photo_urls.length}장
                    </button>
                  )}

                  {/* 가계부 1:1 연동 & 모아데이 투영 배지 */}
                  <div className="ml-auto flex flex-wrap items-center gap-1.5">
                    {log.meta.linked_wash_log_id && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-600 dark:text-sky-400 font-medium bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
                        <Sparkles className="w-3 h-3" /> 세차연동
                      </span>
                    )}
                    {log.meta.linked_fuel_log_id && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        <Fuel className="w-3 h-3" /> 주유연동
                      </span>
                    )}
                    {log.linked_day_schedule_title && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                        <Calendar className="w-3 h-3" /> {log.linked_day_schedule_title}
                      </span>
                    )}
                    {log.linked_expense_id ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> 가계부 1:1 연동
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">가계부 미연동</span>
                    )}
                    {log.sync_to_day && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        <Calendar className="w-3 h-3" /> 모아데이
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 모달 컴포넌트들 */}
      <CarRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onAddVehicle={addVehicle}
        isDark={isDark}
      />

      <CarLogCreateModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        currentOdometerKm={currentVehicle?.current_odometer_km || 0}
        initialType={activeTab === 'ALL' ? 'PARKING' : activeTab}
        onAddLog={addVehicleLog}
        shouldSyncToDay={shouldSyncToDay}
        detectDuplicateSuspect={detectDuplicateSuspect}
        isDark={isDark}
      />

      <DuplicateExpenseReconcileModal
        isOpen={isReconcileModalOpen}
        onClose={() => setIsReconcileModalOpen(false)}
        duplicates={duplicates}
        onResolveDuplicate={resolveDuplicate}
        isDark={isDark}
      />

      {/* 지출모아 연결 상세 확인 팝업 (정산 원자성) */}
      <LinkedExpenseDetailModal
        isOpen={!!selectedLinkedLog}
        onClose={() => setSelectedLinkedLog(null)}
        log={selectedLinkedLog}
        isDark={isDark}
      />

      {/* 증빙 다중 사진 뷰어 팝업 */}
      <PhotoViewerModal
        isOpen={!!viewerPhotos}
        onClose={() => setViewerPhotos(null)}
        photos={viewerPhotos || []}
        isDark={isDark}
      />
    </div>
  );
};
