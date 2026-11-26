import React, { useState } from 'react';
import { Bell, ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react';
import { ElmInp01, ElmChk01 } from '../../elements/Tokens';
import { SystemNotificationMatrix } from '../../data/systemGovernancePool';
import { CommonServicePreferences } from '../../data/servicePreferencesPool';

/* ============================================================================
   1. 알림 설정 탭
   ============================================================================ */
interface NotifySettingsTabProps {
  sysNotifyMatrix: SystemNotificationMatrix;
  commonPrefs: CommonServicePreferences;
  onUpdateCommonPrefs: (next: CommonServicePreferences) => void;
}

export const NotifySettingsTab: React.FC<NotifySettingsTabProps> = ({
  sysNotifyMatrix,
  commonPrefs,
  onUpdateCommonPrefs,
}) => {
  const [notifyGoals, setNotifyGoals] = useState(true);
  const [notifyDuties, setNotifyDuties] = useState(true);
  const [notifyLoans, setNotifyLoans] = useState(true);
  const [notifyTime, setNotifyTime] = useState('09:00');

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>알림톡 및 푸시 알림 시간/주기 설정</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            플랫폼 12종 알림 매트릭스 거버넌스 정책과 연동된 개인화 수신 옵션을 설정합니다.
          </p>
        </div>
        {sysNotifyMatrix.requireVerifiedEmailOnly && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>인증된 이메일 한정 발송 중</span>
          </span>
        )}
      </div>

      <div className="space-y-3">
        <ElmInp01
          label="기본 일일 브리핑 알림 시간"
          type="time"
          value={notifyTime}
          onChange={setNotifyTime}
        />
        <ElmChk01
          checked={sysNotifyMatrix.goalScheduleReminder ? notifyGoals : false}
          onChange={setNotifyGoals}
          disabled={!sysNotifyMatrix.goalScheduleReminder}
          label="모아목표 일일 실천 리마인더 발송"
          description={
            !sysNotifyMatrix.goalScheduleReminder
              ? '※ 시스템 관리자 정책에 의해 전체 발송이 일시 중단되었습니다.'
              : '매일 설정한 브리핑 시간에 목표 실천 현황을 전달합니다.'
          }
        />
        <ElmChk01
          checked={sysNotifyMatrix.dutyActionRequest ? notifyDuties : false}
          onChange={setNotifyDuties}
          disabled={!sysNotifyMatrix.dutyActionRequest}
          label="모아당번 순번 도래 및 대신수행 요청 시 알림"
          description={
            !sysNotifyMatrix.dutyActionRequest
              ? '※ 시스템 관리자 정책에 의해 전체 발송이 일시 중단되었습니다.'
              : '당번 순번 도래 및 대신수행 요청 발생 시 즉시 푸시를 수신합니다.'
          }
        />
        <ElmChk01
          checked={sysNotifyMatrix.moneySettleProcessed ? notifyLoans : false}
          onChange={setNotifyLoans}
          disabled={!sysNotifyMatrix.moneySettleProcessed}
          label="모아머니 상환 만기 3일 전 D-Day 알림"
          description={
            !sysNotifyMatrix.moneySettleProcessed
              ? '※ 시스템 관리자 정책에 의해 전체 발송이 일시 중단되었습니다.'
              : '모아머니 정산 및 상환 만기 도래 시 사전에 알림을 수신합니다.'
          }
        />
        <ElmChk01
          checked={
            sysNotifyMatrix.carInsuranceExpiry ||
            sysNotifyMatrix.carLegalInspection ||
            sysNotifyMatrix.carConsumableDue
              ? commonPrefs.notifyCar
              : false
          }
          onChange={(chk) => onUpdateCommonPrefs({ ...commonPrefs, notifyCar: chk })}
          disabled={
            !sysNotifyMatrix.carInsuranceExpiry &&
            !sysNotifyMatrix.carLegalInspection &&
            !sysNotifyMatrix.carConsumableDue
          }
          label="모아부릉 보험 만기 · 정기검사 · 소모품 임박 알림"
          description="자동차보험 갱신 D-Day, 정기종합검사 및 엔진오일/필터 교체 임박 시 알림을 수신합니다."
        />
        <ElmChk01
          checked={
            sysNotifyMatrix.dayScheduleReminder || sysNotifyMatrix.dayPastYearBriefing
              ? commonPrefs.notifyDay
              : false
          }
          onChange={(chk) => onUpdateCommonPrefs({ ...commonPrefs, notifyDay: chk })}
          disabled={!sysNotifyMatrix.dayScheduleReminder && !sysNotifyMatrix.dayPastYearBriefing}
          label="모아데이 통합 일정 리마인더 · 과거의 오늘 회고 알림"
          description="등록된 캘린더 일정 사전 리마인더 및 N년 전 오늘 다이어리 회고 브리핑을 수신합니다."
        />
        <ElmChk01
          checked={
            sysNotifyMatrix.routineMedicineReminder ||
            sysNotifyMatrix.routineMvnoDue ||
            sysNotifyMatrix.routineTaxDeadline ||
            sysNotifyMatrix.routineCardSettlement
              ? commonPrefs.notifyRoutine
              : false
          }
          onChange={(chk) => onUpdateCommonPrefs({ ...commonPrefs, notifyRoutine: chk })}
          disabled={
            !sysNotifyMatrix.routineMedicineReminder &&
            !sysNotifyMatrix.routineMvnoDue &&
            !sysNotifyMatrix.routineTaxDeadline &&
            !sysNotifyMatrix.routineCardSettlement
          }
          label="모아루틴 복약 · 알뜰폰 · 세금계산서 · 카드정산 알림"
          description="복약 시점 체크, 알뜰폰 만료 D-Day, 세금계산서 10일 마감 및 급여카드 정산 알림을 수신합니다."
        />
      </div>
    </section>
  );
};

/* ============================================================================
   2. OCR 에이전트 엔진 및 개인 API 키 관리 탭
   ============================================================================ */
interface OcrSettingsTabProps {
  onNotify: (msg?: string) => void;
}

export const OcrSettingsTab: React.FC<OcrSettingsTabProps> = ({ onNotify }) => {
  const [ocrEngine, setOcrEngine] = useState<'GEMINI' | 'OPENAI' | 'CLAUDE' | 'CLOVA' | 'EASYOCR'>(
    'GEMINI'
  );
  const [ocrModel, setOcrModel] = useState<string>('gemini-2.0-flash');
  const [ocrKey, setOcrKey] = useState<string>(
    () => localStorage.getItem('moabogo_user_ocr_key') || 'sk-proj-user-sample-key-9981'
  );
  const [showOcrKey, setShowOcrKey] = useState<boolean>(false);

  const handleSaveOcrKey = (newKey: string) => {
    setOcrKey(newKey);
    localStorage.setItem('moabogo_user_ocr_key', newKey);
    localStorage.setItem('moabogo_user_ocr_engine', ocrEngine);
    localStorage.setItem('moabogo_user_ocr_model', ocrModel);
    onNotify();
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>AI 에이전트 & 사용자 OCR API 인증키 관리 (서버비 0원)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          1차 로컬 Docker EasyOCR 인식 실패 시, 사용자가 직접 등록한 개인 클라우드 AI 비전 모델로 즉시 Fallback됩니다.
        </p>
      </div>

      <div className="max-w-xl space-y-4">
        {/* 1. OCR 엔진 / AI 에이전트 공급자 선택 */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            OCR 비전 엔진 선택
          </label>
          <select
            value={ocrEngine}
            onChange={(e) => {
              const eng = e.target.value as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'CLOVA' | 'EASYOCR';
              setOcrEngine(eng);
              if (eng === 'GEMINI') setOcrModel('gemini-2.0-flash');
              else if (eng === 'OPENAI') setOcrModel('gpt-4o');
              else if (eng === 'CLAUDE') setOcrModel('claude-3-5-sonnet-20241022');
              else if (eng === 'CLOVA') setOcrModel('clova-ocr-receipt');
              else if (eng === 'EASYOCR') setOcrModel('easyocr-v1-korean');
            }}
            className="w-full h-11 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="GEMINI">Google Gemini 2.0 (추천 • 초고속 멀티모달 & 무료 티어)</option>
            <option value="OPENAI">OpenAI GPT-4o (고정밀 영수증 OCR & 복합 테이블 분석)</option>
            <option value="CLAUDE">Anthropic Claude 3.5 Sonnet (세부 항목 및 품목 추론)</option>
            <option value="CLOVA">Naver CLOVA OCR (한국어 세금계산서/간이영수증 특화)</option>
            <option value="EASYOCR">Docker EasyOCR (홈서버 온디바이스 기본 내장 무료)</option>
          </select>
        </div>

        {/* 2. 엔진별 세부 모델 선택 */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            세부 AI 모델 선택
          </label>
          <select
            value={ocrModel}
            onChange={(e) => setOcrModel(e.target.value)}
            className="w-full h-11 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {ocrEngine === 'GEMINI' && (
              <>
                <option value="gemini-2.0-flash">gemini-2.0-flash (초저지연 영수증 파싱 권장)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (대형 복합 계산서 심층 추론)</option>
              </>
            )}
            {ocrEngine === 'OPENAI' && (
              <>
                <option value="gpt-4o">gpt-4o (최고 정밀도 Vision)</option>
                <option value="gpt-4o-mini">gpt-4o-mini (경량 고속 파싱)</option>
              </>
            )}
            {ocrEngine === 'CLAUDE' && (
              <>
                <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022</option>
                <option value="claude-3-5-haiku-20241022">claude-3-5-haiku-20241022</option>
              </>
            )}
            {ocrEngine === 'CLOVA' && (
              <>
                <option value="clova-ocr-receipt">clova-ocr-receipt (영수증 특화 도메인)</option>
                <option value="clova-ocr-general">clova-ocr-general (일반 인쇄물)</option>
              </>
            )}
            {ocrEngine === 'EASYOCR' && (
              <option value="easyocr-v1-korean">easyocr-v1-korean (로컬 파이프라인)</option>
            )}
          </select>
        </div>

        {/* 3. 개인 API 키 입력 필드 (눈 아이콘 토글 미리보기 지원) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            개인 API 인증키 (Personal API Key)
          </label>
          <div className="relative">
            <input
              type={showOcrKey ? 'text' : 'password'}
              value={ocrKey}
              onChange={(e) => handleSaveOcrKey(e.target.value)}
              placeholder="API Key를 입력하세요 (예: AIzaSy... 또는 sk-...)"
              className="w-full h-11 pl-3.5 pr-12 text-xs font-mono rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button
              type="button"
              onClick={() => setShowOcrKey((prev) => !prev)}
              className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 cursor-pointer transition-colors"
              title={showOcrKey ? 'API 키 숨기기' : 'API 키 확인 (눈 아이콘)'}
              aria-label="API 키 미리보기 토글"
            >
              {showOcrKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4. 무과금 0원 보안 안내 카드 */}
        <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-[11px] text-slate-600 dark:text-zinc-300">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>개인정보 보호 및 서버 비용 0원 원칙</span>
          </div>
          <p className="leading-relaxed">
            • 등록된 개인 API 키는 서버 중앙 데이터베이스에 전송되지 않으며, 사용자 브라우저의 IndexedDB/LocalStorage에 암호화 보관됩니다.
          </p>
          <p className="leading-relaxed">
            • 영수증 촬영 시 클라이언트에서 직접 AI 모델에 요청하여 서버 운영비 0원을 영구 달성합니다.
          </p>
        </div>
      </div>
    </section>
  );
};
