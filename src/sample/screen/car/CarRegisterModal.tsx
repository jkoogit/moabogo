import React, { useState } from 'react';
import { X, Car, Hash, Gauge, Fuel } from 'lucide-react';
import { Vehicle, VehicleFuelType } from './types';

interface CarRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: Omit<Vehicle, 'vehicle_id' | 'created_at' | 'updated_at'>) => void;
  isDark?: boolean;
}

export const CarRegisterModal: React.FC<CarRegisterModalProps> = ({
  isOpen,
  onClose,
  onAddVehicle,
  isDark = false,
}) => {
  const [nickname, setNickname] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('현대/기아');
  const [modelName, setModelName] = useState('');
  const [modelYear, setModelYear] = useState<number>(2023);
  const [fuelType, setFuelType] = useState<VehicleFuelType>('GASOLINE');
  const [odometerKm, setOdometerKm] = useState<number>(0);
  const [isPrimary, setIsPrimary] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !plateNumber.trim() || !modelName.trim()) {
      alert('차량 별칭, 번호판, 모델명을 모두 입력해주세요.');
      return;
    }

    onAddVehicle({
      owner_user_id: 'user-1',
      nickname: nickname.trim(),
      plate_number: plateNumber.trim(),
      manufacturer: manufacturer.trim(),
      model_name: modelName.trim(),
      model_year: Number(modelYear) || 2023,
      fuel_type: fuelType,
      current_odometer_km: Number(odometerKm) || 0,
      is_primary: isPrimary,
      is_active: true,
      shared_ledger_id: 'led-1',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className={`w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. 고정 헤더 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">새 차량 등록</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">다중 차량을 등록하고 6대 이력을 독립 관리합니다.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 스크롤 본문 */}
        <form id="car-register-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              차량 별칭 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 우리집 쏘렌토, 출퇴근 레이"
              className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                차량 번호 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="예: 12가 3456"
                  className="w-full h-11 pl-9 pr-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                연식 (연도)
              </label>
              <input
                type="number"
                value={modelYear}
                onChange={(e) => setModelYear(Number(e.target.value))}
                min={1990}
                max={2030}
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                제조사
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="예: 기아, 현대, 테슬라"
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                모델명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="예: 쏘렌토 하이브리드"
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              유종 구분
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['HYBRID', 'GASOLINE', 'DIESEL', 'EV', 'LPG'] as VehicleFuelType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFuelType(type)}
                  className={`h-10 text-xs font-semibold rounded-lg border transition-all ${
                    fuelType === type
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type === 'HYBRID'
                    ? '하이브리드'
                    : type === 'GASOLINE'
                    ? '휘발유'
                    : type === 'DIESEL'
                    ? '경유'
                    : type === 'EV'
                    ? '전기차'
                    : 'LPG'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              현재 누적 주행거리 (km)
            </label>
            <div className="relative">
              <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="number"
                value={odometerKm || ''}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                placeholder="예: 48520"
                className="w-full h-11 pl-9 pr-3 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="is_primary" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              대표 차량으로 지정 (모아부릉 진입 시 우선 표시)
            </label>
          </div>
        </form>

        {/* 3. 고정 푸터 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            form="car-register-form"
            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-2xs"
          >
            차량 등록 완료
          </button>
        </div>
      </div>
    </div>
  );
};
