import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Vehicle,
  VehicleLog,
  VehicleLogType,
  VehicleMaintenanceRule,
  MaintenanceFsmStatus,
  CarFilterTab,
  DuplicateExpenseCandidate,
  CarUserSettings,
} from './types';
import {
  INITIAL_VEHICLE_LOGS,
  INITIAL_MAINTENANCE_RULES,
  INITIAL_DUPLICATE_CANDIDATES,
} from './carMockData';
import {
  loadCarPreferences,
  saveCarPreferences,
  CAR_PREFS_UPDATED_EVENT,
  CarPreferencesState,
} from '../../data/servicePreferencesPool';

const TODAY_STR = '2026-11-25';

export function calculateMaintenanceFsm(
  rule: VehicleMaintenanceRule,
  currentOdometerKm: number,
  todayStr: string = TODAY_STR
): { status: MaintenanceFsmStatus; badgeText: string; daysLeft?: number; kmLeft?: number } {
  let daysLeft: number | undefined;
  let kmLeft: number | undefined;

  if (rule.next_due_date) {
    const today = new Date(todayStr);
    const due = new Date(rule.next_due_date);
    const diffTime = due.getTime() - today.getTime();
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (rule.next_due_odometer_km) {
    kmLeft = rule.next_due_odometer_km - currentOdometerKm;
  }

  // FSM 우선순위 평가: 더 임박한 조건 기준
  const isOverdue = (daysLeft !== undefined && daysLeft < 0) || (kmLeft !== undefined && kmLeft < 0);
  if (isOverdue) {
    const text = daysLeft !== undefined && daysLeft < 0 ? `D+${Math.abs(daysLeft)}일 초과` : `+${Math.abs(kmLeft || 0).toLocaleString()}km 초과`;
    return { status: 'OVERDUE', badgeText: text, daysLeft, kmLeft };
  }

  const isUrgent = (daysLeft !== undefined && daysLeft <= 3) || (kmLeft !== undefined && kmLeft <= 300);
  if (isUrgent) {
    const text = daysLeft !== undefined && daysLeft <= 3 ? `D-${daysLeft} 긴급` : `잔여 ${kmLeft?.toLocaleString()}km`;
    return { status: 'URGENT', badgeText: text, daysLeft, kmLeft };
  }

  const isImminent = (daysLeft !== undefined && daysLeft <= 14) || (kmLeft !== undefined && kmLeft <= 800);
  if (isImminent) {
    const text = daysLeft !== undefined && daysLeft <= 14 ? `D-${daysLeft} 임박` : `잔여 ${kmLeft?.toLocaleString()}km`;
    return { status: 'IMMINENT', badgeText: text, daysLeft, kmLeft };
  }

  const isCheckSoon = (daysLeft !== undefined && daysLeft <= 30) || (kmLeft !== undefined && kmLeft <= 1500);
  if (isCheckSoon) {
    const text = daysLeft !== undefined && daysLeft <= 30 ? `D-${daysLeft}` : `잔여 ${kmLeft?.toLocaleString()}km`;
    return { status: 'CHECK_SOON', badgeText: text, daysLeft, kmLeft };
  }

  const text = daysLeft !== undefined ? `D-${daysLeft}` : `잔여 ${kmLeft?.toLocaleString()}km`;
  return { status: 'SAFE', badgeText: text, daysLeft, kmLeft };
}

export function useMoaCar() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadCarPreferences().vehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    () => loadCarPreferences().vehicles.find((v) => v.is_primary)?.vehicle_id || loadCarPreferences().vehicles[0]?.vehicle_id || 'veh-1'
  );
  const [logs, setLogs] = useState<VehicleLog[]>(INITIAL_VEHICLE_LOGS);
  const [rules, setRules] = useState<VehicleMaintenanceRule[]>(INITIAL_MAINTENANCE_RULES);
  const [activeTab, setActiveTab] = useState<CarFilterTab>('ALL');
  const [duplicates, setDuplicates] = useState<DuplicateExpenseCandidate[]>(INITIAL_DUPLICATE_CANDIDATES);
  const [userSettings, setUserSettings] = useState<CarUserSettings>(() => loadCarPreferences().settings);

  // SCR-SET-01 등 외부 설정 변경 시 실시간 동기화
  useEffect(() => {
    const syncFromStore = (e?: Event) => {
      const detail = (e as CustomEvent<CarPreferencesState> | undefined)?.detail || loadCarPreferences();
      setVehicles(detail.vehicles);
      setUserSettings(detail.settings);
    };
    window.addEventListener(CAR_PREFS_UPDATED_EVENT, syncFromStore);
    return () => window.removeEventListener(CAR_PREFS_UPDATED_EVENT, syncFromStore);
  }, []);

  // 현재 선택된 차량
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.vehicle_id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // 선택 차량의 이력 목록 (최신순)
  const vehicleLogs = useMemo(() => {
    return logs
      .filter((l) => l.vehicle_id === currentVehicle?.vehicle_id)
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  }, [logs, currentVehicle]);

  // 탭 필터링된 이력
  const filteredLogs = useMemo(() => {
    if (activeTab === 'ALL') return vehicleLogs;
    return vehicleLogs.filter((l) => l.log_type === activeTab);
  }, [vehicleLogs, activeTab]);

  // 선택 차량의 소모품/정기점검 규칙
  const vehicleRules = useMemo(() => {
    return rules.filter((r) => r.vehicle_id === currentVehicle?.vehicle_id && r.is_active);
  }, [rules, currentVehicle]);

  // 보조적 참고 지표: 당월 총유지비 (과장/강조 배제, 등록 데이터 기준 집계)
  const monthlyTco = useMemo(() => {
    const currentMonth = TODAY_STR.substring(0, 7); // '2026-11'
    return vehicleLogs
      .filter((l) => l.occurred_at.startsWith(currentMonth))
      .reduce((sum, l) => sum + (l.amount || 0), 0);
  }, [vehicleLogs]);

  // 보조적 참고 지표: 최근 실연비 (km/L 또는 km/kWh)
  const recentEfficiency = useMemo(() => {
    const fuelLogs = vehicleLogs.filter((l) => l.log_type === 'FUEL' && l.meta.calc_efficiency_km_per_l);
    if (fuelLogs.length === 0) return null;
    return fuelLogs[0].meta.calc_efficiency_km_per_l || null;
  }, [vehicleLogs]);

  // 최근 주차 위치 (PARKING 이력 기준)
  const latestParkingLocation = useMemo(() => {
    const parkingLogs = vehicleLogs.filter((l) => l.log_type === 'PARKING' && l.meta.parking_zone);
    if (parkingLogs.length === 0) return null;
    return {
      zone: parkingLogs[0].meta.parking_zone,
      time: parkingLogs[0].occurred_at,
      vendor: parkingLogs[0].vendor_name,
    };
  }, [vehicleLogs]);

  // 미해결 중복 지출 의심 건수
  const unresolvedDuplicateCount = useMemo(() => {
    return duplicates.filter((d) => !d.is_resolved).length;
  }, [duplicates]);

  // 1. 차량 전환
  const selectVehicle = useCallback((id: string) => {
    setSelectedVehicleId(id);
    setActiveTab('ALL');
  }, []);

  // 2. 계기판 주행거리 직접 갱신
  const updateOdometer = useCallback((newOdometerKm: number) => {
    if (newOdometerKm <= 0) return;
    setVehicles((prev) => {
      const updated = prev.map((v) =>
        v.vehicle_id === selectedVehicleId
          ? { ...v, current_odometer_km: newOdometerKm, updated_at: TODAY_STR }
          : v
      );
      const currentPrefs = loadCarPreferences();
      saveCarPreferences({ ...currentPrefs, vehicles: updated });
      return updated;
    });
  }, [selectedVehicleId]);

  // 3. 신규 차량 등록
  const addVehicle = useCallback((newVehicle: Omit<Vehicle, 'vehicle_id' | 'created_at' | 'updated_at'>) => {
    const id = `veh-${Date.now()}`;
    const created: Vehicle = {
      ...newVehicle,
      vehicle_id: id,
      created_at: TODAY_STR,
      updated_at: TODAY_STR,
    };
    setVehicles((prev) => {
      const updated = [...prev, created];
      const currentPrefs = loadCarPreferences();
      saveCarPreferences({ ...currentPrefs, vehicles: updated });
      return updated;
    });
    setSelectedVehicleId(id);
  }, []);

  // 4. 모아데이 연동 대상 여부 판정 (사용자 설정 기준)
  const shouldSyncToDay = useCallback(
    (logType: VehicleLogType, ruleType?: string) => {
      if (ruleType === 'INSURANCE_RENEWAL' || logType === 'INSURANCE') {
        return userSettings.sync_to_day_targets.includes('INSURANCE');
      }
      if (ruleType === 'LEGAL_INSPECTION') {
        return userSettings.sync_to_day_targets.includes('LEGAL_INSPECTION');
      }
      if (ruleType === 'ENGINE_OIL' || ruleType === 'AIR_FILTER' || logType === 'INSPECTION') {
        return userSettings.sync_to_day_targets.includes('CONSUMABLES');
      }
      if (ruleType === 'PARKING_PASS' || logType === 'PARKING') {
        return userSettings.sync_to_day_targets.includes('PARKING_PASS');
      }
      return false;
    },
    [userSettings.sync_to_day_targets]
  );

  // 5. 중복 지출 의심 자동 감지 (지출일자 + 결제수단 + 금액)
  const detectDuplicateSuspect = useCallback(
    (occurredAt: string, paymentMethod: string, amount: number): boolean => {
      if (amount <= 0) return false;
      // 기존 로그 중 동일 일자 + 결제수단 + 금액 여부 확인
      const hasMatchingLog = logs.some(
        (l) => l.occurred_at === occurredAt && l.payment_method === paymentMethod && l.amount === amount
      );
      // 기존 중복 후보 목록 중 매칭 여부
      const hasCandidate = duplicates.some(
        (d) => d.occurred_date === occurredAt && d.payment_method === paymentMethod && d.amount === amount
      );
      return hasMatchingLog || hasCandidate;
    },
    [logs, duplicates]
  );

  // 6. 6대 이력 신규 등록 (가계부 1:1 연동 & 모아데이 사용자설정 및 계획 연동)
  const addVehicleLog = useCallback(
    (params: {
      log_type: VehicleLogType;
      occurred_at: string;
      odometer_km?: number;
      amount: number;
      payment_method: VehicleLog['payment_method'];
      vendor_name: string;
      summary: string;
      detail_memo?: string;
      meta?: VehicleLog['meta'];
      auto_ledger_booking: boolean;
      force_sync_to_day?: boolean;
      linked_day_schedule_id?: string;
      linked_day_schedule_title?: string;
    }) => {
      const logId = `log-${Date.now()}`;
      const isDuplicate = detectDuplicateSuspect(params.occurred_at, params.payment_method, params.amount);

      // 주행거리가 입력된 경우 차량 Odometer 자동 현행화
      if (params.odometer_km && params.odometer_km > (currentVehicle?.current_odometer_km || 0)) {
        updateOdometer(params.odometer_km);
      }

      // 모아데이 등록 여부 (사용자 설정에서 정한 대상만 등록)
      const allowedBySettings = shouldSyncToDay(params.log_type);
      const syncToDay = params.force_sync_to_day !== undefined ? params.force_sync_to_day : allowedBySettings;

      // 주유 시 세차 추가 부가정보가 포함된 경우 연계 세차 ID 사전 생성
      const washLogId =
        params.log_type === 'FUEL' && params.meta?.add_wash_included
          ? `log-wash-${Date.now() + 1}`
          : undefined;

      const meta: VehicleLog['meta'] = {
        ...(params.meta || {}),
        linked_wash_log_id: washLogId,
      };

      const newLog: VehicleLog = {
        log_id: logId,
        vehicle_id: selectedVehicleId,
        user_id: 'user-1',
        log_type: params.log_type,
        occurred_at: params.occurred_at,
        odometer_km: params.odometer_km,
        amount: params.amount,
        payment_method: params.payment_method,
        vendor_name: params.vendor_name,
        summary: params.summary,
        detail_memo: params.detail_memo,
        meta,
        linked_expense_id: `exp-car-${Date.now()}`, // 시스템 1:1 보장
        sync_to_day: syncToDay,
        linked_day_schedule_id: params.linked_day_schedule_id,
        linked_day_schedule_title: params.linked_day_schedule_title,
        is_duplicate_suspected: isDuplicate,
        created_at: new Date().toISOString(),
      };

      // 주유 시 세차가 추가된 경우 연계 세차 이력 동시 생성 (사용자 피드백 4.e)
      const newLogs: VehicleLog[] = [newLog];
      if (washLogId && params.meta?.add_wash_included) {
        newLogs.push({
          log_id: washLogId,
          vehicle_id: selectedVehicleId,
          user_id: 'user-1',
          log_type: 'WASH',
          occurred_at: params.occurred_at,
          odometer_km: params.odometer_km,
          amount: params.meta.add_wash_amount || 3000,
          payment_method: params.payment_method,
          vendor_name: `${params.vendor_name} (자동세차)`,
          summary: '자동세차 (주유 연계)',
          detail_memo: `${params.vendor_name} 주유 시 자동세차 추가 영수증 연동`,
          meta: {
            wash_type: 'AUTOMATIC',
            linked_fuel_log_id: logId,
          },
          linked_expense_id: `exp-wash-${Date.now() + 1}`,
          sync_to_day: false,
          created_at: new Date().toISOString(),
        });
      }

      setLogs((prev) => [...newLogs, ...prev]);

      // 중복 의심 감지 시 후보 목록에 자동 등록
      if (isDuplicate) {
        setDuplicates((prev) => [
          {
            candidate_id: `dup-${Date.now()}`,
            occurred_date: params.occurred_at,
            payment_method: params.payment_method,
            amount: params.amount,
            is_resolved: false,
            entries: [
              {
                source_type: 'CAR_LOG',
                source_id: logId,
                source_title: `모아부릉 ${params.summary}`,
                description: `${params.vendor_name} (${params.amount.toLocaleString()}원)`,
                created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              {
                source_type: 'CARD_STATEMENT',
                source_id: `card-auto-${Date.now()}`,
                source_title: `카드 승인 내역: ${params.vendor_name}`,
                description: `동일 일자 승인건 (${params.amount.toLocaleString()}원)`,
                created_at: '자동 수집',
              },
            ],
          },
          ...prev,
        ]);
      }
    },
    [selectedVehicleId, currentVehicle, updateOdometer, detectDuplicateSuspect, shouldSyncToDay]
  );

  // 7. 중복 지출 정리 프로세스 (원자성 유지: 지출모아 연결 / 개별유지 / 제외)
  const resolveDuplicate = useCallback(
    (
      candidateId: string,
      resolution: 'MERGE_TO_CAR' | 'KEEP_SEPARATE' | 'DISMISS',
      primaryEntryId?: string
    ) => {
      const candidate = duplicates.find((d) => d.candidate_id === candidateId);
      const chosenPrimaryId = primaryEntryId || candidate?.entries[0]?.source_id;

      setDuplicates((prev) =>
        prev.map((d) => {
          if (d.candidate_id !== candidateId) return d;
          return {
            ...d,
            is_resolved: true,
            resolution_type: resolution,
            primary_entry_id: chosenPrimaryId,
            entries: d.entries.map((e) => ({
              ...e,
              is_primary: e.source_id === chosenPrimaryId,
              primary_source_id: chosenPrimaryId,
            })),
          };
        })
      );

      // MERGE_TO_CAR 선택 시: 선택된 원본 및 사본 관계를 차량 로그에 동기화
      if (resolution === 'MERGE_TO_CAR' && candidate) {
        const carEntry = candidate.entries.find((e) => e.source_type === 'CAR_LOG');
        if (carEntry) {
          const isCarPrimary = carEntry.source_id === chosenPrimaryId;
          const otherEntries = candidate.entries.filter((e) => e.source_id !== chosenPrimaryId);

          setLogs((prev) =>
            prev.map((l) => {
              if (l.log_id !== carEntry.source_id) return l;
              return {
                ...l,
                is_duplicate_suspected: false,
                linked_expense_id: `exp-merged-${Date.now()}`,
                linked_primary_source_id: isCarPrimary ? undefined : chosenPrimaryId,
                linked_replica_entries: isCarPrimary
                  ? otherEntries.map((o) => ({
                      source_type: o.source_type,
                      source_id: o.source_id,
                      source_title: o.source_title,
                      description: o.description,
                    }))
                  : undefined,
              };
            })
          );
        }
      }
    },
    [duplicates]
  );

  // 8. 사용자 설정 변경 (모아데이 연동 대상 및 개인정보 마스킹)
  const updateCarUserSettings = useCallback((newSettings: Partial<CarUserSettings>) => {
    setUserSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      const currentPrefs = loadCarPreferences();
      saveCarPreferences({ ...currentPrefs, settings: updated });
      return updated;
    });
  }, []);

  return {
    vehicles,
    currentVehicle,
    selectedVehicleId,
    selectVehicle,
    updateOdometer,
    addVehicle,
    vehicleLogs,
    filteredLogs,
    activeTab,
    setActiveTab,
    vehicleRules,
    monthlyTco,
    recentEfficiency,
    latestParkingLocation,
    addVehicleLog,
    // 중복지출 정리 프로세스
    duplicates,
    unresolvedDuplicateCount,
    resolveDuplicate,
    // 사용자 설정
    userSettings,
    updateCarUserSettings,
    shouldSyncToDay,
    detectDuplicateSuspect,
  };
}
