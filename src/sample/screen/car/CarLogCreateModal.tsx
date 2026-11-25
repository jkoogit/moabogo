import React, { useState, useMemo } from 'react';
import {
  X,
  Fuel,
  Wrench,
  Shield,
  Car,
  Clock,
  Sparkles,
  AlertTriangle,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { VehicleLogType, PaymentMethodType, VehicleLog } from './types';

interface CarLogCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOdometerKm: number;
  initialType?: VehicleLogType;
  onAddLog: (params: {
    log_type: VehicleLogType;
    occurred_at: string;
    odometer_km?: number;
    amount: number;
    payment_method: PaymentMethodType;
    vendor_name: string;
    summary: string;
    detail_memo?: string;
    meta?: VehicleLog['meta'];
    auto_ledger_booking: boolean;
    force_sync_to_day?: boolean;
  }) => void;
  shouldSyncToDay: (logType: VehicleLogType) => boolean;
  detectDuplicateSuspect: (occurredAt: string, paymentMethod: string, amount: number) => boolean;
  isDark?: boolean;
}

const CATEGORIES: { type: VehicleLogType; label: string; icon: React.ReactNode }[] = [
  { type: 'FUEL', label: '주유', icon: <Fuel className="w-4 h-4" /> },
  { type: 'INSPECTION', label: '점검', icon: <Wrench className="w-4 h-4" /> },
  { type: 'REPAIR', label: '수리', icon: <Wrench className="w-4 h-4" /> },
  { type: 'WASH', label: '세차', icon: <Sparkles className="w-4 h-4" /> },
  { type: 'INSURANCE', label: '보험', icon: <Shield className="w-4 h-4" /> },
  { type: 'PARKING', label: '주차', icon: <MapPin className="w-4 h-4" /> },
];

const PAYMENT_METHODS: { type: PaymentMethodType; label: string }[] = [
  { type: 'CREDIT_CARD', label: '신용카드' },
  { type: 'CHECK_CARD', label: '체크카드' },
  { type: 'TRANSFER', label: '계좌이체' },
  { type: 'CASH', label: '현금' },
  { type: 'LOCAL_PAY', label: '지역화폐' },
];

export const CarLogCreateModal: React.FC<CarLogCreateModalProps> = ({
  isOpen,
  onClose,
  currentOdometerKm,
  initialType = 'FUEL',
  onAddLog,
  shouldSyncToDay,
  detectDuplicateSuspect,
  isDark = false,
}) => {
  const [logType, setLogType] = useState<VehicleLogType>(initialType);
  const [occurredAt, setOccurredAt] = useState<string>('2026-11-25');
  const [odometerKm, setOdometerKm] = useState<number>(currentOdometerKm);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CREDIT_CARD');
  const [vendorName, setVendorName] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [detailMemo, setDetailMemo] = useState<string>('');
  const [autoLedgerBooking, setAutoLedgerBooking] = useState<boolean>(true);
  const [forceSyncToDay, setForceSyncToDay] = useState<boolean>(() => shouldSyncToDay(initialType));

  // 카테고리별 특화 필드
  const [volumeLiters, setVolumeLiters] = useState<number>(40);
  const [unitPrice, setUnitPrice] = useState<number>(1680);
  const [isFullTank, setIsFullTank] = useState<boolean>(true);
  const [washType, setWashType] = useState<'SELF' | 'AUTOMATIC' | 'HAND' | 'DETAILING'>('SELF');
  const [parkingZone, setParkingZone] = useState<string>('B3층 G-12');
  const [exitTime, setExitTime] = useState<string>('18:30');
  const [emergencyTel, setEmergencyTel] = useState<string>('1588-5114');

  // 카테고리 전환 시 기본값 동기화
  const handleTypeChange = (type: VehicleLogType) => {
    setLogType(type);
    setForceSyncToDay(shouldSyncToDay(type));
    if (type === 'FUEL') setSummary('휘발유 가득 주유');
    else if (type === 'INSPECTION') setSummary('엔진오일 세트 교체');
    else if (type === 'REPAIR') setSummary('부품 수리 및 교체');
    else if (type === 'WASH') setSummary('하부 고압세차');
    else if (type === 'INSURANCE') setSummary('자동차보험 갱신 연납');
    else if (type === 'PARKING') setSummary('일일 주차비');
  };

  // 실시간 중복 지출 의심 감지
  const isDuplicateSuspected = useMemo(() => {
    return detectDuplicateSuspect(occurredAt, paymentMethod, amount);
  }, [occurredAt, paymentMethod, amount, detectDuplicateSuspect]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || amount < 0) {
      alert('항목명과 유효한 금액을 입력해주세요.');
      return;
    }

    const meta: VehicleLog['meta'] = {};
    if (logType === 'FUEL') {
      meta.volume_liters = Number(volumeLiters) || undefined;
      meta.unit_price = Number(unitPrice) || undefined;
      meta.is_full_tank = isFullTank;
      if (odometerKm > currentOdometerKm && volumeLiters > 0) {
        meta.calc_efficiency_km_per_l = Number(((odometerKm - currentOdometerKm) / volumeLiters).toFixed(1));
      }
    } else if (logType === 'WASH') {
      meta.wash_type = washType;
    } else if (logType === 'PARKING') {
      meta.parking_zone = parkingZone;
      meta.exit_time = exitTime;
    } else if (logType === 'INSURANCE') {
      meta.emergency_tel = emergencyTel;
    }

    onAddLog({
      log_type: logType,
      occurred_at: occurredAt,
      odometer_km: Number(odometerKm) || undefined,
      amount: Number(amount) || 0,
      payment_method: paymentMethod,
      vendor_name: vendorName.trim() || '미지정 처',
      summary: summary.trim(),
      detail_memo: detailMemo.trim() || undefined,
      meta,
      auto_ledger_booking: autoLedgerBooking,
      force_sync_to_day: forceSyncToDay,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className={`w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. 고정 헤더 */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              차량 6대 이력 등록
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              가계부 1:1 연동 및 중복 지출 의심 감지 프로세스가 지원됩니다.
            </p>
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
        <form id="car-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 6대 카테고리 탭 선택 */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              관리 포인트 유형
            </label>
            <div className="grid grid-cols-6 gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.type}
                  onClick={() => handleTypeChange(cat.type)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-all ${
                    logType === cat.type
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="mb-0.5">{cat.icon}</span>
                  <span className="text-[11px] truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 중복 지출 의심 실시간 경고 배너 */}
          {isDuplicateSuspected && (
            <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">동일한 지출 건 중복 의심 감지</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  입력하신 일자·결제수단·금액과 일치하는 내역이 존재합니다. 등록 후 [중복지출 정리 센터]에서 1건으로 안전하게 병합할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 기본 항목: 일자 & 주행거리 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                발생 일자
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="date"
                  required
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                계기판 주행거리 (km)
              </label>
              <input
                type="number"
                value={odometerKm || ''}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                placeholder={currentOdometerKm.toString()}
                className="w-full h-11 px-3 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 금액 & 결제수단 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                결제 금액 (원) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                step={100}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="예: 70000"
                className="w-full h-11 px-3 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                결제 수단
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType)}
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.type} value={pm.type}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 항목명 & 장소/업체명 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                항목 요약 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="예: 주유, 엔진오일 교체, 주차비"
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                정비소 / 주유소 / 주차장명
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="예: GS칼텍스 판교점"
                className="w-full h-11 px-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 카테고리별 동적 필드 */}
          {logType === 'FUEL' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">주유 정보</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFullTank}
                    onChange={(e) => setIsFullTank(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span>가득 주유 (Full Tank)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">주유량 (L / kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={volumeLiters || ''}
                    onChange={(e) => setVolumeLiters(Number(e.target.value))}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">단가 (원/L 또는 원/kWh)</label>
                  <input
                    type="number"
                    value={unitPrice || ''}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {logType === 'PARKING' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">주차 위치 정보</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">주차 층수/기둥 메모</label>
                  <input
                    type="text"
                    value={parkingZone}
                    onChange={(e) => setParkingZone(e.target.value)}
                    placeholder="예: 지하 3층 C-14 기둥"
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">출차 예정/완료 시간</label>
                  <input
                    type="time"
                    value={exitTime}
                    onChange={(e) => setExitTime(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {logType === 'INSURANCE' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">보험 계약 정보</span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">긴급출동 대표번호</label>
                <input
                  type="text"
                  value={emergencyTel}
                  onChange={(e) => setEmergencyTel(e.target.value)}
                  placeholder="예: 1588-5114"
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {/* 상세 메모 */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              상세 메모
            </label>
            <textarea
              rows={2}
              value={detailMemo}
              onChange={(e) => setDetailMemo(e.target.value)}
              placeholder="특이사항, 교체 부품, 할인 내역 등을 기록하세요."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 연동 옵션 체크박스 */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  가계부 자동 기장 (1:1 멱등 연동)
                </span>
                <p className="text-[11px] text-slate-500">
                  지정 가계부에 지출(차량/교통) 1건만 생성하여 이중계상을 차단합니다.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoLedgerBooking}
                onChange={(e) => setAutoLedgerBooking(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  모아데이 캘린더 등록
                </span>
                <p className="text-[11px] text-slate-500">
                  사용자 설정에서 허용한 대상만 전역 일정에 등록됩니다.
                </p>
              </div>
              <input
                type="checkbox"
                checked={forceSyncToDay}
                onChange={(e) => setForceSyncToDay(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>
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
            form="car-log-form"
            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-2xs"
          >
            이력 등록 완료
          </button>
        </div>
      </div>
    </div>
  );
};
