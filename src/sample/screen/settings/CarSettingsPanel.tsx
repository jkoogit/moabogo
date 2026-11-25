import React, { useState } from 'react';
import {
  Car,
  Calendar,
  Layers,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Wrench,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ElmSwt01 } from '../../elements/Tokens';
import { Vehicle, VehicleFuelType, DuplicateExpenseCandidate } from '../car/types';
import {
  CarPreferencesState,
  CarMaintenanceDefaultPreset,
  maskPlateNumber,
  DEFAULT_CAR_MAINTENANCE_PRESETS,
} from '../../data/servicePreferencesPool';

interface CarSettingsPanelProps {
  carPrefs: CarPreferencesState;
  onUpdateCarPrefs: (next: CarPreferencesState) => void;
  duplicateCandidates: DuplicateExpenseCandidate[];
  onOpenReconcileModal: () => void;
  onNotify: (msg: string) => void;
}

const SHARED_LEDGER_OPTIONS = [
  { id: '', label: '공유 가계부 미연동 (개인 전용)' },
  { id: 'led-1', label: '우리집 생활비 가계부 (가족)' },
  { id: 'led-2', label: '내 개인 메인 가계부' },
  { id: 'led-3', label: '모임 차량 공동유지 장부' },
];

const FUEL_TYPE_LABELS: Record<VehicleFuelType, string> = {
  GASOLINE: '휘발유',
  DIESEL: '경유',
  HYBRID: '하이브리드',
  EV: '전기차',
  LPG: 'LPG',
};

export const CarSettingsPanel: React.FC<CarSettingsPanelProps> = ({
  carPrefs,
  onUpdateCarPrefs,
  duplicateCandidates,
  onOpenReconcileModal,
  onNotify,
}) => {
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('현대 (HYUNDAI)');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState(2025);
  const [newFuel, setNewFuel] = useState<VehicleFuelType>('HYBRID');
  const [newOdometer, setNewOdometer] = useState(1000);
  const [showUnmaskedAll, setShowUnmaskedAll] = useState(false);

  const { vehicles, settings, maintenancePresets } = carPrefs;

  const handleSetPrimary = (vehicleId: string) => {
    const updated = vehicles.map((v) => ({
      ...v,
      is_primary: v.vehicle_id === vehicleId,
      is_active: v.vehicle_id === vehicleId ? true : v.is_active,
    }));
    onUpdateCarPrefs({ ...carPrefs, vehicles: updated });
    onNotify('대표 차량이 변경되었습니다.');
  };

  const handleToggleActive = (vehicleId: string) => {
    const target = vehicles.find((v) => v.vehicle_id === vehicleId);
    if (target?.is_primary && target.is_active) {
      onNotify('대표 차량은 비활성화할 수 없습니다. 다른 차량을 대표로 먼저 지정하세요.');
      return;
    }
    const updated = vehicles.map((v) =>
      v.vehicle_id === vehicleId ? { ...v, is_active: !v.is_active } : v
    );
    onUpdateCarPrefs({ ...carPrefs, vehicles: updated });
  };

  const handleChangeSharedLedger = (vehicleId: string, ledgerId: string) => {
    const updated = vehicles.map((v) =>
      v.vehicle_id === vehicleId ? { ...v, shared_ledger_id: ledgerId || undefined } : v
    );
    onUpdateCarPrefs({ ...carPrefs, vehicles: updated });
    onNotify('공유 가계부 매핑이 저장되었습니다.');
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (vehicles.length <= 1) {
      onNotify('최소 1대 이상의 차량이 유지되어야 합니다.');
      return;
    }
    const target = vehicles.find((v) => v.vehicle_id === vehicleId);
    const remaining = vehicles.filter((v) => v.vehicle_id !== vehicleId);
    if (target?.is_primary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], is_primary: true, is_active: true };
    }
    onUpdateCarPrefs({ ...carPrefs, vehicles: remaining });
    onNotify('차량이 목록에서 제거되었습니다.');
  };

  const handleAddVehicle = () => {
    if (!newNickname.trim() || !newPlate.trim() || !newModel.trim()) {
      onNotify('차량 별칭, 번호판, 모델명을 모두 입력해 주세요.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const created: Vehicle = {
      vehicle_id: `veh-${Date.now()}`,
      owner_user_id: 'user-1',
      nickname: newNickname.trim(),
      plate_number: newPlate.trim(),
      manufacturer: newManufacturer.trim() || '기타',
      model_name: newModel.trim(),
      model_year: Number(newYear) || 2025,
      fuel_type: newFuel,
      current_odometer_km: Math.max(0, Number(newOdometer) || 0),
      is_primary: false,
      is_active: true,
      created_at: today,
      updated_at: today,
    };
    onUpdateCarPrefs({ ...carPrefs, vehicles: [...vehicles, created] });
    setNewNickname('');
    setNewPlate('');
    setNewModel('');
    setIsAddingVehicle(false);
    onNotify(`'${created.nickname}' 차량이 등록되었습니다.`);
  };

  const handleUpdatePreset = (
    ruleType: CarMaintenanceDefaultPreset['ruleType'],
    patch: Partial<CarMaintenanceDefaultPreset>
  ) => {
    const updated = maintenancePresets.map((p) =>
      p.ruleType === ruleType ? { ...p, ...patch } : p
    );
    onUpdateCarPrefs({ ...carPrefs, maintenancePresets: updated });
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>모아부릉(SCR-CAR-01) 다중 차량 · 마스킹 · 소모품 주기 통합 설정</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            다중 차량 관리, 번호판 PII 마스킹, 소모품 기본 주기, 모아데이 투영 및 중복지출 정리를 통합 제어합니다.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 whitespace-nowrap self-start sm:self-center">
          ✓ SCR-CAR-01 실시간 동기화
        </span>
      </div>

      {/* 1. 다중 차량 관리 패널 (vehicles 연동) */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
            <Car className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>내 보유 차량 관리 ({vehicles.length}대)</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowUnmaskedAll((prev) => !prev)}
              className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              {showUnmaskedAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showUnmaskedAll ? '번호판 마스킹' : '번호판 일시보기'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddingVehicle((prev) => !prev)}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingVehicle ? '등록 닫기' : '차량 추가'}</span>
            </button>
          </div>
        </div>

        {isAddingVehicle && (
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-[#131B2E] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="차량 별칭 (예: 출퇴근 아반떼)"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
              />
              <input
                type="text"
                placeholder="번호판 (예: 34다 5678)"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
              />
              <input
                type="text"
                placeholder="모델명 (예: 아반떼 CN7 하이브리드)"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
              />
              <input
                type="text"
                placeholder="제조사"
                value={newManufacturer}
                onChange={(e) => setNewManufacturer(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
              />
              <select
                value={newFuel}
                onChange={(e) => setNewFuel(e.target.value as VehicleFuelType)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
              >
                {Object.entries(FUEL_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="연식"
                  value={newYear}
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="w-1/2 min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
                />
                <input
                  type="number"
                  placeholder="주행(km)"
                  value={newOdometer}
                  onChange={(e) => setNewOdometer(Number(e.target.value))}
                  className="w-1/2 min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddVehicle}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                차량 저장
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {vehicles.map((v) => {
            const displayedPlate = maskPlateNumber(
              v.plate_number,
              settings.privacy_mask_plate_number && !showUnmaskedAll
            );
            return (
              <div
                key={v.vehicle_id}
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  v.is_primary
                    ? 'border-emerald-500/70 bg-white dark:bg-[#131B2E] ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50'
                } ${!v.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {v.is_primary && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white whitespace-nowrap">
                          대표차량
                        </span>
                      )}
                      <span className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                        {v.nickname}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        · {v.model_name} ({v.model_year} · {FUEL_TYPE_LABELS[v.fuel_type]})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                        {displayedPlate}
                      </span>
                      <span>· 누적 {v.current_odometer_km.toLocaleString()} km</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    {!v.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(v.vehicle_id)}
                        className="min-h-[36px] px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                      >
                        <Star className="w-3 h-3" />
                        <span>대표지정</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(v.vehicle_id)}
                      className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                        v.is_active
                          ? 'border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-zinc-700 text-slate-500'
                      }`}
                    >
                      {v.is_active ? '활성 ON' : '비활성'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v.vehicle_id)}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title="차량 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                    가족/공유 가계부 연동 매핑
                  </span>
                  <select
                    value={v.shared_ledger_id || ''}
                    onChange={(e) => handleChangeSharedLedger(v.vehicle_id, e.target.value)}
                    className="min-h-[38px] px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-200"
                  >
                    {SHARED_LEDGER_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 번호판 PII 마스킹 & 중복 자동대사 토글 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>프라이버시 마스킹 및 지출 자동대사 정책</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E]">
            <ElmSwt01
              checked={settings.privacy_mask_plate_number}
              onChange={(checked) =>
                onUpdateCarPrefs({
                  ...carPrefs,
                  settings: { ...settings, privacy_mask_plate_number: checked },
                })
              }
              label="차량 번호판 PII 마스킹 기본 적용"
              description="대시보드 및 공유 화면에서 번호판 끝 2자리를 **로 보호 표기합니다."
            />
          </div>
          <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E]">
            <ElmSwt01
              checked={settings.auto_reconcile_duplicates}
              onChange={(checked) =>
                onUpdateCarPrefs({
                  ...carPrefs,
                  settings: { ...settings, auto_reconcile_duplicates: checked },
                })
              }
              label="3-Key 중복지출 자동 후보 감지"
              description="지출일자·결제수단·금액 일치 시 가계부/카드명세서와 자동 대조합니다."
            />
          </div>
        </div>
      </div>

      {/* 3. 소모품 교체 주기 기본 프리셋 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
            <Wrench className="w-4 h-4 text-sky-600 shrink-0" />
            <span>소모품 · 법정검사 교체 주기 기본 프리셋</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onUpdateCarPrefs({
                ...carPrefs,
                maintenancePresets: DEFAULT_CAR_MAINTENANCE_PRESETS,
              });
              onNotify('소모품 주기 프리셋이 권장 기본값으로 초기화되었습니다.');
            }}
            className="min-h-[34px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-bold text-slate-600 dark:text-zinc-300 whitespace-nowrap cursor-pointer"
          >
            권장값 복원
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {maintenancePresets.map((preset) => (
            <div
              key={preset.ruleType}
              className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {preset.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 whitespace-nowrap">
                  D-{preset.alertDaysBefore} 알림
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {preset.intervalMonths !== undefined && (
                  <label className="flex items-center gap-1">
                    <span className="text-slate-500">기간</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={preset.intervalMonths}
                      onChange={(e) =>
                        handleUpdatePreset(preset.ruleType, {
                          intervalMonths: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-14 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-mono text-center"
                    />
                    <span className="text-slate-500">개월</span>
                  </label>
                )}
                {preset.intervalKm !== undefined && (
                  <label className="flex items-center gap-1">
                    <span className="text-slate-500">거리</span>
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      value={preset.intervalKm}
                      onChange={(e) =>
                        handleUpdatePreset(preset.ruleType, {
                          intervalKm: Math.max(1000, Number(e.target.value) || 5000),
                        })
                      }
                      className="w-20 h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-mono text-center"
                    />
                    <span className="text-slate-500">km</span>
                  </label>
                )}
                <label className="flex items-center gap-1 ml-auto">
                  <span className="text-slate-500">사전</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={preset.alertDaysBefore}
                    onChange={(e) =>
                      handleUpdatePreset(preset.ruleType, {
                        alertDaysBefore: Math.max(1, Number(e.target.value) || 7),
                      })
                    }
                    className="w-12 h-8 px-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs font-mono text-center"
                  />
                  <span className="text-slate-500">일</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 모아데이(SCR-DAY-01) 전역 캘린더 연동 대상 설정 */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span>모아데이 전역 캘린더 연동 대상 관리</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
          체크된 대상만 모아데이 전역 일정에 자동으로 등록되며, 불필요한 알림 피로도를 방지합니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {[
            { id: 'INSURANCE' as const, label: '자동차보험 만기 갱신 D-Day', desc: '만기 30일/7일 전 캘린더 알림 투영' },
            { id: 'LEGAL_INSPECTION' as const, label: '한국교통안전공단 정기종합검사', desc: '검사 만료 전 예약 일정 투영' },
            { id: 'CONSUMABLES' as const, label: '소모품(엔진오일/필터) 교체 도래', desc: '주행거리/기간 만료 임박 투영' },
            { id: 'PARKING_PASS' as const, label: '월 정기주차권 갱신일', desc: '매월 정기결제 갱신 일정 투영' },
          ].map((item) => {
            const isChecked = settings.sync_to_day_targets.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...settings.sync_to_day_targets, item.id]
                      : settings.sync_to_day_targets.filter((t) => t !== item.id);
                    onUpdateCarPrefs({
                      ...carPrefs,
                      settings: { ...settings, sync_to_day_targets: next },
                    });
                  }}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {item.desc}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. 중복지출 정리 기능 */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
            <Layers className="w-4 h-4 text-amber-600 shrink-0" />
            <span>중복지출 정리 센터 (원자성 유지 프로세스)</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 whitespace-nowrap">
            대기 {duplicateCandidates.filter((d) => !d.is_resolved).length}건
          </span>
        </div>
        <p className="text-[11px] text-amber-800/80 dark:text-amber-300 leading-relaxed">
          • <strong>검토 프로세스</strong>: 지출내용 작성 ➔ 카드명세서 등록 ➔ 자동차이력 등록 시 동일한 지출일자, 결제수단, 금액 기준의 항목을 교차 검토합니다.
          <br />
          • 모아부릉 이력과 가계부 지출이 중복 집계되지 않도록 수동으로 1건으로 안전하게 병합하거나 개별 지출로 유지할 수 있습니다.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={onOpenReconcileModal}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>중복지출 정리 센터 열기</span>
          </button>
        </div>
      </div>
    </section>
  );
};
