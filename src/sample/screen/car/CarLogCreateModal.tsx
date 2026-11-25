import React, { useState } from 'react';
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
  Camera,
  Plus,
  Paperclip,
  Eye,
  FileText,
  Key,
} from 'lucide-react';
import { VehicleLogType, PaymentMethodType, VehicleLog, MoaDayScheduleCandidate } from './types';
import {
  PAYMENT_TARGET_DETAILS,
  DB_INSURANCE_PRESET,
  MOA_DAY_SCHEDULE_POOL,
} from './carMockData';
import { PhotoViewerModal } from './PhotoViewerModal';
import { MoaDayScheduleLinkModal } from './MoaDayScheduleLinkModal';
import { OcrMemoBoardModal } from './OcrMemoBoardModal';

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
    linked_day_schedule_id?: string;
    linked_day_schedule_title?: string;
  }) => void;
  shouldSyncToDay: (logType: VehicleLogType) => boolean;
  detectDuplicateSuspect: (occurredAt: string, paymentMethod: string, amount: number) => boolean;
  isDark?: boolean;
}

// 사용자 요구사항 3: 탭 순서 변경 (주차 > 주유충전 > 세차 > 점검 > 수리 > 보험)
const CATEGORIES: { type: VehicleLogType; label: string; icon: React.ReactNode }[] = [
  { type: 'PARKING', label: '주차', icon: <MapPin className="w-4 h-4" /> },
  { type: 'FUEL', label: '주유·충전', icon: <Fuel className="w-4 h-4" /> },
  { type: 'WASH', label: '세차', icon: <Sparkles className="w-4 h-4" /> },
  { type: 'INSPECTION', label: '점검', icon: <Wrench className="w-4 h-4" /> },
  { type: 'REPAIR', label: '수리', icon: <Wrench className="w-4 h-4" /> },
  { type: 'INSURANCE', label: '보험', icon: <Shield className="w-4 h-4" /> },
];

const PAYMENT_METHODS: { type: PaymentMethodType; label: string }[] = [
  { type: 'CREDIT_CARD', label: '신용카드' },
  { type: 'CHECK_CARD', label: '체크카드' },
  { type: 'TRANSFER', label: '계좌이체' },
  { type: 'LOCAL_PAY', label: '지역화폐' },
  { type: 'CASH', label: '현금' },
  { type: 'OTHER', label: '기타' },
];

// 사용자 요구사항 7: 점검 표준 카테고리 정의
interface InspectionGroup {
  groupName: string;
  items: { id: string; label: string }[];
}

const INSPECTION_CATALOG: InspectionGroup[] = [
  {
    groupName: '정기 종합검사',
    items: [
      { id: 'REGULAR_INSPECT', label: '자동차 종합/정기검사' },
      { id: 'EMISSION_TEST', label: '배출가스/매연 점검' },
    ],
  },
  {
    groupName: '엔진 및 구동계',
    items: [
      { id: 'ENGINE_OIL', label: '엔진오일 및 오일필터' },
      { id: 'COOLANT', label: '냉각수(부동액) 및 라디에이터' },
      { id: 'MISSION_OIL', label: '변속기(미션) 오일' },
    ],
  },
  {
    groupName: '제동 및 하체',
    items: [
      { id: 'BRAKE_PAD', label: '브레이크 패드 및 디스크' },
      { id: 'TIRE_TPMS', label: '타이어 마모 및 공기압(TPMS)' },
      { id: 'SUSPENSION', label: '서스펜션 및 하체 유격' },
    ],
  },
  {
    groupName: '전장 및 소모품',
    items: [
      { id: 'BATTERY', label: '시동 배터리 전압 및 단자' },
      { id: 'WIPER_WASHER', label: '와이퍼 블레이드 및 워셔액' },
      { id: 'CABIN_FILTER', label: '에어컨/히터 캐빈필터' },
    ],
  },
];

// 첨부 파일 메타데이터 모델 (OCR 분석 결과 및 전문 보관)
interface AttachedDocItem {
  id: string;
  name: string;
  category: 'PARKING' | 'FUEL' | 'WASH' | 'INSPECTION' | 'INSURANCE' | 'ODOMETER' | 'OTHER';
  rawText: string;
  snippets: { label: string; value: string }[];
}

export const CarLogCreateModal: React.FC<CarLogCreateModalProps> = ({
  isOpen,
  onClose,
  currentOdometerKm,
  initialType = 'PARKING',
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
  const [paymentTargetDetail, setPaymentTargetDetail] = useState<string>('비씨카드 (끝자리 1234)');
  const [vendorName, setVendorName] = useState<string>('');
  const [summary, setSummary] = useState<string>('일일 주차비');
  const [detailMemo, setDetailMemo] = useState<string>('');
  const [forceSyncToDay, setForceSyncToDay] = useState<boolean>(() => shouldSyncToDay(initialType));

  // 토스트 알림 상태
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  // 주유 특화
  const [volumeLiters, setVolumeLiters] = useState<number>(40);
  const [unitPrice, setUnitPrice] = useState<number>(1680);
  const [isFullTank, setIsFullTank] = useState<boolean>(true);
  const [addWashIncluded, setAddWashIncluded] = useState<boolean>(false);
  const [addWashAmount, setAddWashAmount] = useState<number>(3000);

  // 세차 특화
  const [washType, setWashType] = useState<'SELF' | 'AUTOMATIC' | 'HAND' | 'DETAILING'>('AUTOMATIC');

  // 주차 특화 (사용자 피드백 8: 입차/출차 선택 시간 인디케이터)
  const [parkingZone, setParkingZone] = useState<string>('B4층 G-12 기둥');
  const [entryTime, setEntryTime] = useState<string>('14:30');
  const [exitTime, setExitTime] = useState<string>('16:45');
  const [activeTimeTarget, setActiveTimeTarget] = useState<'ENTRY' | 'EXIT'>('ENTRY');

  // 보험 특화 (DB손해보험 증권 기반)
  const [insuranceCompany, setInsuranceCompany] = useState<string>('DB손해보험 (프로미카 다이렉트)');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState<string>('220264437812000');
  const [insuranceInsuredName, setInsuranceInsuredName] = useState<string>('조정국');
  const [insuranceDriverLimit, setInsuranceDriverLimit] = useState<string>('부부운전자한정 (만 43세 이상)');
  const [policyStartDate, setPolicyStartDate] = useState<string>('2026-08-07');
  const [policyEndDate, setPolicyEndDate] = useState<string>('2027-08-07');
  const [emergencyTel, setEmergencyTel] = useState<string>('1588-0100 (프로미카SOS 6회)');
  const [syncMonthBeforeAlarm, setSyncMonthBeforeAlarm] = useState<boolean>(true);

  // 점검 특화 (사용자 피드백 7: 카테고리 기반 점검 및 모아데이 수리계획 연계)
  const [checkedInspectItems, setCheckedInspectItems] = useState<string[]>(['BRAKE_PAD', 'TIRE_TPMS']);
  const [createRepairPlan, setCreateRepairPlan] = useState<boolean>(true);
  const [repairPlanDate, setRepairPlanDate] = useState<string>('2026-12-02');
  const [repairPlanTitle, setRepairPlanTitle] = useState<string>('차량 수리 계획: 브레이크 패드 및 디스크, 타이어 마모 및 공기압(TPMS)');

  // 첨부 파일 목록 (사용자 피드백 6: 파일별 OCR 버튼 & TEXT 메모보드 지원)
  const [attachedDocs, setAttachedDocs] = useState<AttachedDocItem[]>([
    {
      id: 'doc_init_1',
      name: '코엑스몰_지하주차권_20261125.jpg',
      category: 'PARKING',
      rawText: `[코엑스몰 지하주차장 입차증]\n차량번호: 353다1647\n입차일시: 2026-11-25 14:30\n주차구역: B4층 G-12 기둥\n기본요금: 30분 3,000원\n정산예정: 사전무인정산기 권장`,
      snippets: [
        { label: '가맹점', value: '코엑스몰 지하주차장' },
        { label: '주차위치', value: 'B4층 G-12 기둥' },
        { label: '입차시간', value: '14:30' },
      ],
    },
  ]);

  // 뷰어 및 메모보드 모달 상태
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [activeMemoDoc, setActiveMemoDoc] = useState<AttachedDocItem | null>(null);

  // 모아데이 계획일정 저장 시점 연계 팝업 상태 (사용자 피드백 4)
  const [pendingMoaDayCandidate, setPendingMoaDayCandidate] = useState<MoaDayScheduleCandidate | null>(null);

  if (!isOpen) return null;

  // 카테고리 전환
  const handleTypeChange = (type: VehicleLogType) => {
    setLogType(type);
    setForceSyncToDay(shouldSyncToDay(type));
    if (type === 'PARKING') setSummary('일일 주차비');
    else if (type === 'FUEL') setSummary('휘발유 가득 주유');
    else if (type === 'WASH') setSummary('자동세차 (하부 고압세척 포함)');
    else if (type === 'INSPECTION') setSummary('정기점검 및 소모품 체크');
    else if (type === 'REPAIR') setSummary('부품 수리 및 정비 교체');
    else if (type === 'INSURANCE') setSummary('2026 자동차보험 갱신 연납');
  };

  // 결제수단 변경 시 상세 대상 기본값 동기화
  const handlePaymentMethodChange = (pm: PaymentMethodType) => {
    setPaymentMethod(pm);
    const details = PAYMENT_TARGET_DETAILS[pm];
    if (details && details.length > 0) {
      setPaymentTargetDetail(details[0]);
    }
  };

  // 계기판 사진 OCR 모의 촬영/인식
  const handleOdometerOcr = () => {
    const recognizedOdo = currentOdometerKm + 350;
    setOdometerKm(recognizedOdo);
    const docItem: AttachedDocItem = {
      id: `doc_odo_${Date.now()}`,
      name: '계기판_사진_OCR인식.jpg',
      category: 'ODOMETER',
      rawText: `[차량 계기판 디지털 트립컴퓨터]\n현재 누적주행거리: ${recognizedOdo.toLocaleString()} km\n평균연비: 13.8 km/L\n잔여주행거리: 480 km\n외부온도: 11℃`,
      snippets: [
        { label: '주행거리', value: `${recognizedOdo.toLocaleString()} km` },
        { label: '연비', value: '13.8 km/L' },
      ],
    };
    setAttachedDocs((prev) => [...prev, docItem]);
    setOcrNotice(`📷 계기판 사진에서 ${recognizedOdo.toLocaleString()} km가 인식되었습니다.`);
    setTimeout(() => setOcrNotice(null), 3000);
  };

  // 주차 시간 10분/30분 증감 핸들러 (사용자 피드백 8: 선택된 타겟에 적용)
  const handleAdjustTime = (minutesDelta: number) => {
    const targetTime = activeTimeTarget === 'ENTRY' ? entryTime : exitTime;
    const [h, m] = targetTime.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + minutesDelta);
    const nextH = String(date.getHours()).padStart(2, '0');
    const nextM = String(date.getMinutes()).padStart(2, '0');
    const formatted = `${nextH}:${nextM}`;

    if (activeTimeTarget === 'ENTRY') {
      setEntryTime(formatted);
    } else {
      setExitTime(formatted);
    }
  };

  // 파일별 OCR 분석 버튼 클릭 시 입력폼에 자동 매핑 (사용자 피드백 6.a)
  const handleRunOcrForDoc = (doc: AttachedDocItem) => {
    if (doc.category === 'INSURANCE') {
      setInsuranceCompany(DB_INSURANCE_PRESET.insurance_company);
      setInsurancePolicyNo(DB_INSURANCE_PRESET.insurance_policy_no);
      setInsuranceInsuredName(DB_INSURANCE_PRESET.insurance_insured_name);
      setPolicyStartDate(DB_INSURANCE_PRESET.policy_start_date);
      setPolicyEndDate(DB_INSURANCE_PRESET.policy_end_date);
      setAmount(DB_INSURANCE_PRESET.amount);
      setEmergencyTel(DB_INSURANCE_PRESET.emergency_tel);
      setInsuranceDriverLimit(DB_INSURANCE_PRESET.insurance_driver_limit);
      setVendorName(DB_INSURANCE_PRESET.vendor_name);
      setSummary(DB_INSURANCE_PRESET.summary);
      setOcrNotice('📄 보험 증권 OCR 데이터가 입력폼에 자동 매핑되었습니다.');
    } else if (doc.category === 'PARKING') {
      setParkingZone('B4층 G-12 기둥');
      setEntryTime('14:30');
      setVendorName('코엑스몰 지하주차장');
      setAmount(6000);
      setSummary('코엑스몰 방문 주차');
      setOcrNotice('🅿️ 주차 입차증 OCR 정보가 입력폼에 자동 매핑되었습니다.');
    } else if (doc.category === 'FUEL') {
      setVendorName('GS칼텍스 삼거리주유소');
      setAmount(75000);
      setVolumeLiters(44.64);
      setUnitPrice(1680);
      setIsFullTank(true);
      setSummary('휘발유 가득 주유');
      setOcrNotice('⛽ 주유 영수증 OCR 정보가 입력폼에 자동 매핑되었습니다.');
    } else if (doc.category === 'INSPECTION') {
      setCheckedInspectItems(['BRAKE_PAD', 'TIRE_TPMS']);
      setVendorName('한국교통안전공단 검사소');
      setSummary('자동차 종합정기검사 (브레이크/타이어 정비권장)');
      setOcrNotice('🔧 정기검사 결과표 분석 완료: 정비 권장 항목이 자동 체크되었습니다.');
    } else {
      setOcrNotice(`✓ ${doc.name} 텍스트 분석이 완료되었습니다.`);
    }
    setTimeout(() => setOcrNotice(null), 3000);
  };

  // 점검 항목 토글 및 수리계획 제목 자동 갱신
  const handleToggleInspectItem = (id: string, label: string) => {
    setCheckedInspectItems((prev) => {
      const isAlready = prev.includes(id);
      const next = isAlready ? prev.filter((item) => item !== id) : [...prev, id];

      // 선택된 항목들의 라벨 모음
      const allLabels = INSPECTION_CATALOG.flatMap((g) => g.items)
        .filter((i) => next.includes(i.id))
        .map((i) => i.label);

      if (allLabels.length > 0) {
        setRepairPlanTitle(`차량 수리 계획: ${allLabels.join(', ')}`);
      } else {
        setRepairPlanTitle('차량 정비 계획');
      }
      return next;
    });
  };

  // 신규 샘플 파일 첨부
  const handleAddSampleDoc = () => {
    let newDoc: AttachedDocItem;
    if (logType === 'INSURANCE') {
      newDoc = {
        id: `doc_ins_${Date.now()}`,
        name: 'DB손해보험_모바일증권_2026.jpg',
        category: 'INSURANCE',
        rawText: `[DB손해보험 프로미카다이렉트 개인용 자동차보험 증권]\n증권번호: 220264437812000\n피보험자: 조정국 / 800415-1******\n계약자: 조정국\n보험기간: 2026년 08월 07일 ~ 2027년 08월 07일\n차량번호: 353다1647 (올뉴카니발 2.2 디젤 9인승)\n총보험료: 453,850원 (일시납)\n운전자한정: 부부운전자한정 (만43세이상한정)\n프로미카SOS: 긴급출동서비스 (6회), 긴급견인(10km)\n고객상담센터: 1588-0100`,
        snippets: [
          { label: '보험사', value: 'DB손해보험 프로미카다이렉트' },
          { label: '증권번호', value: '220264437812000' },
          { label: '보험료', value: '453,850' },
          { label: '만기일', value: '2027-08-07' },
          { label: '긴급출동', value: '1588-0100' },
        ],
      };
    } else if (logType === 'INSPECTION') {
      newDoc = {
        id: `doc_insp_${Date.now()}`,
        name: '한국교통안전공단_정기종합검사표.jpg',
        category: 'INSPECTION',
        rawText: `[자동차종합검사 결과표 (TS 한국교통안전공단)]\n차량번호: 353다1647\n검사일: 2026-11-25\n주행거리: 48,520 km\n조향계통: 적합\n제동계통: 적합 (전륜 패드 마모 권장정비)\n타이어공기압: 불균형 경고 (TPMS 정비권장)\n배출가스(매연): 8% (기준 15% 이하 적합)`,
        snippets: [
          { label: '검사소', value: '한국교통안전공단 검사소' },
          { label: '권장1', value: '브레이크 패드 및 디스크' },
          { label: '권장2', value: '타이어 마모 및 공기압(TPMS)' },
        ],
      };
    } else {
      newDoc = {
        id: `doc_fuel_${Date.now()}`,
        name: `영수증_스캔_${Date.now().toString().slice(-4)}.jpg`,
        category: 'FUEL',
        rawText: `[GS칼텍스 삼거리주유소]\n사업자번호: 123-45-67890\n일시: 2026-11-25 14:20\n품명: 휘발유\n단가: 1,680원/L\n수량: 44.64 L\n금액: 75,000원\n결제: 비씨카드 (끝자리 1234)`,
        snippets: [
          { label: '가맹점', value: 'GS칼텍스 삼거리주유소' },
          { label: '금액', value: '75,000' },
          { label: '단가', value: '1,680' },
        ],
      };
    }
    setAttachedDocs((prev) => [...prev, newDoc]);
    setOcrNotice(`📎 ${newDoc.name} 파일이 첨부되었습니다. [OCR] 또는 [TEXT]로 확인하세요.`);
    setTimeout(() => setOcrNotice(null), 3000);
  };

  // OCR 텍스트 매핑 팝업 적용 핸들러 (사용자 피드백 2.a, 2.b)
  const handleApplyMappingFromMemo = (mapped: Record<string, string>) => {
    Object.entries(mapped).forEach(([key, val]) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('가맹점') ||
        lowerKey.includes('상호') ||
        lowerKey.includes('이용처') ||
        lowerKey.includes('주차장') ||
        lowerKey.includes('검사소')
      ) {
        setVendorName(val);
      }
      if (lowerKey.includes('금액') || lowerKey.includes('보험료') || lowerKey.includes('요금')) {
        const num = Number(val.replace(/[^0-9]/g, ''));
        if (!isNaN(num) && num > 0) setAmount(num);
      }
      if (lowerKey.includes('주유량') || lowerKey.includes('리터')) {
        const num = Number(val.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) setVolumeLiters(num);
      }
      if (lowerKey.includes('단가')) {
        const num = Number(val.replace(/[^0-9]/g, ''));
        if (!isNaN(num) && num > 0) setUnitPrice(num);
      }
      if (lowerKey.includes('주행거리')) {
        const num = Number(val.replace(/[^0-9]/g, ''));
        if (!isNaN(num) && num > 0) setOdometerKm(num);
      }
      if (lowerKey.includes('주차위치') || lowerKey.includes('구역') || lowerKey.includes('기둥')) {
        setParkingZone(val);
      }
      if (lowerKey.includes('입차시간')) {
        setEntryTime(val);
      }
      if (lowerKey.includes('출차시간')) {
        setExitTime(val);
      }
      if (lowerKey.includes('보험사')) {
        setInsuranceCompany(val);
      }
      if (lowerKey.includes('증권번호')) {
        setInsurancePolicyNo(val);
      }
      if (lowerKey.includes('피보험자') || lowerKey.includes('계약자')) {
        setInsuranceInsuredName(val);
      }
      if (lowerKey.includes('만기일')) {
        setPolicyEndDate(val);
      }
      if (lowerKey.includes('긴급출동')) {
        setEmergencyTel(val);
      }
      if (lowerKey.includes('운전자한정')) {
        setInsuranceDriverLimit(val);
      }
    });
    setOcrNotice('✓ OCR 텍스트 매핑 항목이 입력폼에 성공적으로 적용되었습니다.');
    setTimeout(() => setOcrNotice(null), 3000);
  };

  // 실시간 중복 지출 감지
  const isDuplicateSuspected = detectDuplicateSuspect(occurredAt, paymentMethod, amount);

  // 최종 저장 실행 함수
  const executeSave = (linkedScheduleId?: string, linkedScheduleTitle?: string) => {
    const meta: VehicleLog['meta'] = {
      payment_target_detail: paymentTargetDetail,
      photo_urls: attachedDocs.map((d) => d.name),
    };

    if (logType === 'PARKING') {
      meta.parking_zone = parkingZone;
      meta.entry_time = entryTime;
      meta.exit_time = exitTime;
    } else if (logType === 'FUEL') {
      meta.volume_liters = Number(volumeLiters) || undefined;
      meta.unit_price = Number(unitPrice) || undefined;
      meta.is_full_tank = isFullTank;
      meta.add_wash_included = addWashIncluded;
      meta.add_wash_amount = addWashIncluded ? Number(addWashAmount) || 0 : undefined;
      if (odometerKm > currentOdometerKm && volumeLiters > 0) {
        meta.calc_efficiency_km_per_l = Number(((odometerKm - currentOdometerKm) / volumeLiters).toFixed(1));
      }
    } else if (logType === 'WASH') {
      meta.wash_type = washType;
    } else if (logType === 'INSPECTION') {
      meta.inspection_items = checkedInspectItems;
      if (createRepairPlan && checkedInspectItems.length > 0) {
        meta.repair_plan_schedule_title = repairPlanTitle;
      }
    } else if (logType === 'INSURANCE') {
      meta.insurance_company = insuranceCompany;
      meta.insurance_policy_no = insurancePolicyNo;
      meta.insurance_insured_name = insuranceInsuredName;
      meta.insurance_driver_limit = insuranceDriverLimit;
      meta.policy_start_date = policyStartDate;
      meta.policy_end_date = policyEndDate;
      meta.emergency_tel = emergencyTel;
      meta.sync_month_before_alarm = syncMonthBeforeAlarm;
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
      auto_ledger_booking: true, // 시스템 자동 1:1 보장
      force_sync_to_day: forceSyncToDay,
      linked_day_schedule_id: linkedScheduleId,
      linked_day_schedule_title: linkedScheduleTitle,
    });

    onClose();
  };

  // 폼 제출 핸들러 (사용자 피드백 4: 저장 시점에 발생일자 기준 모아데이 계획 체크)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || amount < 0) {
      alert('항목명과 유효한 금액을 입력해주세요.');
      return;
    }

    // 발생일자(occurredAt) 기준으로 계획된 모아데이 일정이 있는지 검사
    const matchedSchedule = MOA_DAY_SCHEDULE_POOL.find((s) => s.date === occurredAt);
    if (matchedSchedule) {
      // 대상이 있으면 팝업으로 표시하여 연결 여부 확인
      setPendingMoaDayCandidate(matchedSchedule);
    } else {
      // 대상이 없으면 즉시 등록 완료
      executeSave();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        className={`relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh] shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 플로팅 토스트 메시지 (사용자 피드백 3: 화면 밀림 방지 부유형 토스트) */}
        {ocrNotice && (
          <div className="absolute top-16 right-5 z-50 max-w-[85%] px-4 py-2.5 bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{ocrNotice}</span>
            <button
              type="button"
              onClick={() => setOcrNotice(null)}
              className="text-slate-400 hover:text-white ml-1 text-sm font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* 1. 고정 헤더 (사용자 요구사항 1.a: 명칭변경 '모아부릉 이력등록') */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              모아부릉 이력등록
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              영수증·증권 파일별 OCR 자동입력 및 모아데이 계획 상호 연결을 지원합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 스크롤 본문 */}
        <form id="car-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 6대 카테고리 탭 (사용자 피드백 3: 주차>주유충전>세차>점검>수리>보험) */}
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
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
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

          {/* 중복 지출 의심 감지 배너 */}
          {isDuplicateSuspected && (
            <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">동일한 일자·수단·금액 지출 중복 의심</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  등록 후 [중복정리] 버튼에서 사용자가 선택한 원본에 1건으로 안전하게 '지출모아 연결'할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* 기본 항목: 일자 & 주행거리 OCR */}
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  누적 주행거리 (km)
                </label>
                <button
                  type="button"
                  onClick={handleOdometerOcr}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  title="계기판 사진 모의 촬영 및 OCR"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>OCR</span>
                </button>
              </div>
              <input
                type="number"
                value={odometerKm || ''}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                placeholder={`현재 ${currentOdometerKm.toLocaleString()} km`}
                className="w-full h-11 px-3 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 금액 & 결제수단 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                지출 금액 (원)
              </label>
              <input
                type="number"
                required
                min="0"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full h-11 px-3 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                결제수단 구분
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value as PaymentMethodType)}
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.type} value={pm.type}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 결제수단 상세 대상 연계 드롭다운 */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              결제 대상 상세 (카드사 / 계좌 / 지역화폐)
            </label>
            <select
              value={paymentTargetDetail}
              onChange={(e) => setPaymentTargetDetail(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(PAYMENT_TARGET_DETAILS[paymentMethod] || ['기본 결제계좌/카드']).map((detail) => (
                <option key={detail} value={detail}>
                  {detail}
                </option>
              ))}
            </select>
          </div>

          {/* 가맹점명 & 요약 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                가맹점 / 이용처
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="예: 코엑스몰 주차장, GS칼텍스"
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                이력 항목명 (요약)
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="항목 요약명"
                className="w-full h-11 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* ========================================================
              [카테고리별 특화 폼 영역]
             ======================================================== */}

          {/* A. 주차 특화: 입차/출차 선택 시간 인디케이터 (사용자 피드백 8) */}
          {logType === 'PARKING' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">주차 상세 정보</span>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">주차 층수/기둥 번호</label>
                <input
                  type="text"
                  value={parkingZone}
                  onChange={(e) => setParkingZone(e.target.value)}
                  placeholder="예: 지하 4층 G-12 기둥"
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* 시간 증감 인디케이터 (입차/출차 인풋 클릭 시 자동 활성화) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    선택된 <strong className="text-emerald-600 dark:text-emerald-400">{activeTimeTarget === 'ENTRY' ? '입차시간' : '출차시간'}</strong> 조절
                  </span>
                  <div className="flex items-center gap-1">
                    {[-30, -10, 10, 30].map((delta) => (
                      <button
                        type="button"
                        key={delta}
                        onClick={() => handleAdjustTime(delta)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
                        title={`${activeTimeTarget === 'ENTRY' ? '입차시간' : '출차시간'} ${delta}분 조절`}
                      >
                        {delta > 0 ? `+${delta}분` : `${delta}분`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-2 rounded-lg border transition-all ${
                      activeTimeTarget === 'ENTRY'
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <label className="block text-[10px] text-slate-500 mb-0.5">입차 시간</label>
                    <input
                      type="time"
                      value={entryTime}
                      onFocus={() => setActiveTimeTarget('ENTRY')}
                      onChange={(e) => setEntryTime(e.target.value)}
                      className="w-full text-xs font-mono bg-transparent focus:outline-none"
                    />
                  </div>
                  <div
                    className={`p-2 rounded-lg border transition-all ${
                      activeTimeTarget === 'EXIT'
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <label className="block text-[10px] text-slate-500 mb-0.5">출차 시간</label>
                    <input
                      type="time"
                      value={exitTime}
                      onFocus={() => setActiveTimeTarget('EXIT')}
                      onChange={(e) => setExitTime(e.target.value)}
                      className="w-full text-xs font-mono bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. 주유 특화: 세차 추가 부가비용 연계 */}
          {logType === 'FUEL' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">주유 정보</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFullTank}
                    onChange={(e) => setIsFullTank(e.target.checked)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer"
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

              {/* 세차 추가 부가정보 토글 */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addWashIncluded}
                      onChange={(e) => setAddWashIncluded(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> 주유 시 자동세차 추가 (세차 이력 동시 생성)
                    </span>
                  </label>
                </div>
                {addWashIncluded && (
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-[11px] text-slate-500">세차 추가 비용:</span>
                    <input
                      type="number"
                      value={addWashAmount || ''}
                      onChange={(e) => setAddWashAmount(Number(e.target.value))}
                      placeholder="3000"
                      className="w-28 h-8 px-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="text-xs text-slate-500">원</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* C. 세차 특화 */}
          {logType === 'WASH' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">세차 방식 구분</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'AUTOMATIC', label: '자동세차' },
                  { id: 'SELF', label: '셀프세차' },
                  { id: 'HAND', label: '손세차' },
                  { id: 'DETAILING', label: '디테일링' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWashType(w.id as any)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      washType === w.id
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* D. 점검 특화: 카테고리 기반 점검 및 모아데이 수리계획 연동 (사용자 피드백 7) */}
          {logType === 'INSPECTION' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    점검 항목 카테고리별 체크
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    점검표 첨부 후 [OCR]을 누르면 권장정비 항목이 자동 선택됩니다.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  선택 {checkedInspectItems.length}건
                </span>
              </div>

              {/* 4대 카테고리 그룹 */}
              <div className="space-y-2.5">
                {INSPECTION_CATALOG.map((group) => (
                  <div
                    key={group.groupName}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {group.groupName}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {group.items.map((item) => {
                        const isChecked = checkedInspectItems.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                                : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleInspectItem(item.id, item.label)}
                              className="w-3.5 h-3.5 text-amber-600 rounded cursor-pointer"
                            />
                            <span className="truncate">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* 여러 점검항목을 1개의 모아데이 수리 계획으로 통합 등록 */}
              {checkedInspectItems.length > 0 && (
                <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createRepairPlan}
                      onChange={(e) => setCreateRepairPlan(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                    />
                    <span>선택된 정비 권장 항목({checkedInspectItems.length}건)을 모아데이 수리 계획으로 등록</span>
                  </label>

                  {createRepairPlan && (
                    <div className="space-y-2 pl-6 pt-1">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">수리 희망 일자:</span>
                        <input
                          type="date"
                          value={repairPlanDate}
                          onChange={(e) => setRepairPlanDate(e.target.value)}
                          className="col-span-2 h-8 px-2 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">계획 일정명:</span>
                        <input
                          type="text"
                          value={repairPlanTitle}
                          onChange={(e) => setRepairPlanTitle(e.target.value)}
                          className="col-span-2 h-8 px-2 text-xs rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-amber-800 dark:text-amber-300">
                        * 등록된 계획에 따라 차후 정비소 방문 시 수리 이력과 1:1로 자연스럽게 연결됩니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* E. 보험 특화: DB손해보험 증권 기반 */}
          {logType === 'INSURANCE' && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">보험 계약 정보</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">보험사명</label>
                  <input
                    type="text"
                    value={insuranceCompany}
                    onChange={(e) => setInsuranceCompany(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">증권번호</label>
                  <input
                    type="text"
                    value={insurancePolicyNo}
                    onChange={(e) => setInsurancePolicyNo(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">피보험자/계약자</label>
                  <input
                    type="text"
                    value={insuranceInsuredName}
                    onChange={(e) => setInsuranceInsuredName(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">운전자 한정</label>
                  <input
                    type="text"
                    value={insuranceDriverLimit}
                    onChange={(e) => setInsuranceDriverLimit(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">보험 만기일</label>
                  <input
                    type="date"
                    value={policyEndDate}
                    onChange={(e) => setPolicyEndDate(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">긴급출동 전화번호</label>
                  <input
                    type="text"
                    value={emergencyTel}
                    onChange={(e) => setEmergencyTel(e.target.value)}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* 만기 1개월 전 알림 등록 옵션 */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncMonthBeforeAlarm}
                    onChange={(e) => setSyncMonthBeforeAlarm(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <span>보험 만기 1개월 전 모아데이 캘린더 알림 자동 등록</span>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================
              [첨부 파일 영역: 파일별 OCR 및 TEXT 메모보드 (사용자 피드백 6)]
             ======================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                증빙 파일 첨부 ({attachedDocs.length}건)
              </label>
              <div className="flex items-center gap-2">
                {attachedDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsPhotoViewerOpen(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> 전체 이미지 확인
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddSampleDoc}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 파일 추가
                </button>
              </div>
            </div>

            {/* 첨부 파일 리스트: 파일명 옆에 OCR 버튼 및 TEXT 버튼 (사용자 피드백 6.a, 6.c) */}
            {attachedDocs.length > 0 && (
              <div className="space-y-1.5">
                {attachedDocs.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {doc.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* OCR 버튼: 클릭 시에만 OCR 분석결과를 입력폼에 자동 매핑 */}
                      <button
                        type="button"
                        onClick={() => handleRunOcrForDoc(doc)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800 transition-colors cursor-pointer"
                        title="이 문서의 OCR 분석 결과를 입력폼에 자동 매핑"
                      >
                        OCR
                      </button>

                      {/* TEXT 버튼: 클릭 시 응답문자 전문 text 팝업 메모보드 표시 */}
                      <button
                        type="button"
                        onClick={() => setActiveMemoDoc(doc)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                        title="추출 텍스트 전문 메모보드 열기"
                      >
                        TEXT
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        type="button"
                        onClick={() => setAttachedDocs((prev) => prev.filter((_, i) => i !== idx))}
                        className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 rounded text-sm cursor-pointer"
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
        </form>

        {/* 3. 고정 푸터 (사용자 요구사항 1.b: 명칭변경 '등록') */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            type="submit"
            form="car-log-form"
            className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-2xs cursor-pointer"
          >
            등록
          </button>
        </div>
      </div>

      {/* 사진/증빙 확대 및 슬라이드 뷰어 모달 (사용자 요구사항 1.c: '이미지 확인') */}
      <PhotoViewerModal
        isOpen={isPhotoViewerOpen}
        onClose={() => setIsPhotoViewerOpen(false)}
        photos={attachedDocs.map((d) => d.name)}
        title="이미지 확인"
        isDark={isDark}
      />

      {/* OCR 추출 텍스트 메모보드 모달 (사용자 피드백 2.a, 2.b, 2.c) */}
      {activeMemoDoc && (
        <OcrMemoBoardModal
          isOpen={!!activeMemoDoc}
          onClose={() => setActiveMemoDoc(null)}
          fileName={activeMemoDoc.name}
          rawText={activeMemoDoc.rawText}
          keySnippets={activeMemoDoc.snippets}
          onApplyMapping={handleApplyMappingFromMemo}
          isDark={isDark}
        />
      )}

      {/* 모아데이 계획 상호 연결 확인 팝업 (사용자 피드백 4: 발생일자 기준 저장시점 노출) */}
      {pendingMoaDayCandidate && (
        <MoaDayScheduleLinkModal
          isOpen={!!pendingMoaDayCandidate}
          candidate={pendingMoaDayCandidate}
          onClose={() => setPendingMoaDayCandidate(null)}
          onConfirmLink={(schedule) => {
            setPendingMoaDayCandidate(null);
            executeSave(schedule.schedule_id, schedule.title);
          }}
          onSkipLink={() => {
            setPendingMoaDayCandidate(null);
            executeSave();
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
};
