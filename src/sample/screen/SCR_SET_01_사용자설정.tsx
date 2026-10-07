import React, { useState } from 'react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmSwt01,
  ElmRad01,
  ElmChk01,
  ElmTab01,
} from '../elements/Tokens';
import {
  Settings,
  Bell,
  Layout,
  Sliders,
  KeyRound,
  CreditCard,
  Check,
  Save,
  Sun,
  Moon,
  Sparkles,
  Monitor,
} from 'lucide-react';

export const SCR_SET_01_사용자설정: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('THEME');

  // 6.1 메인화면 구성 설정
  const [showLedgerSummary, setShowLedgerSummary] = useState(true);
  const [showGoalSummary, setShowGoalSummary] = useState(true);
  const [showDutySummary, setShowDutySummary] = useState(true);
  const [showMoneySummary, setShowMoneySummary] = useState(true);

  // 6.2 빠른수행 우선순위 설정
  const [quickPriorityMode, setQuickPriorityMode] = useState<'ALL' | 'TOP_ONE'>('TOP_ONE');

  // 6.3 알림 설정
  const [notifyGoals, setNotifyGoals] = useState(true);
  const [notifyDuties, setNotifyDuties] = useState(true);
  const [notifyLoans, setNotifyLoans] = useState(true);
  const [notifyTime, setNotifyTime] = useState('09:00');

  // 6.4 소셜 계정 & 송금 수신 계좌
  const [bankName, setBankName] = useState('카카오뱅크');
  const [accountNo, setAccountNo] = useState('3333-01-9988776');
  const [accountHolder, setAccountHolder] = useState('구본영');

  // 6.5 OCR 개인 키
  const [ocrKey, setOcrKey] = useState('sk-proj-user-key-dummy-sample');

  const handleSave = () => {
    alert('사용자 설정이 안전하게 저장되었습니다.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 shrink-0">
            SCR-SET-01
          </span>
          <ElmTyp01
            title="사용자 맞춤 설정"
            subtitle="위젯 배치 • 우선순위 • 알림 • 송금 계좌 • OCR 키"
          />
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>설정 저장</span>
        </button>
      </div>

      {/* Tabs - 모바일 가로폭주 방지: 간결 라벨 & ElmTab01 overflow-x-auto */}
      <div className="w-full min-w-0">
        <ElmTab01
          tabs={[
            { id: 'THEME', label: '화면 테마' },
            { id: 'LAYOUT', label: '화면배치' },
            { id: 'PRIORITY', label: '우선순위' },
            { id: 'NOTIFY', label: '알림설정' },
            { id: 'ACCOUNT', label: '송금계좌' },
            { id: 'OCR', label: 'OCR 키' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab 0: 화면 테마 (주간 / 야간 / 여명 / 시스템) */}
      {activeTab === 'THEME' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              화면 디스플레이 테마 (주간 • 야간 • 여명 • 시스템)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              선호하는 색상 팔레트(화이트, 그레이, 블루)와 기기 기본 설정을 실시간으로 선택 및 적용할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Light Mode Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">주간 (라이트)</span>
                    <span className="text-[10px] text-slate-500">화이트 테마</span>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                밝은 주간 환경 및 문서 검토에 적합한 클린 화이트
              </p>
            </div>

            {/* 2. Dark Mode Card (Gray) */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'dark'
                  ? 'border-zinc-400 bg-zinc-800/40 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 flex items-center justify-center shrink-0 border border-zinc-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">야간 (다크)</span>
                    <span className="text-[10px] text-slate-500">딥 그레이 테마</span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                차분하고 묵직한 뉴트럴 딥 그레이(#121214) 배경
              </p>
            </div>

            {/* 3. Dawn Mode Card (Blue) */}
            <div
              onClick={() => setTheme('dawn')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'dawn'
                  ? 'border-sky-500 bg-sky-950/30 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-950 text-sky-400 flex items-center justify-center shrink-0 border border-blue-800">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">여명 (블루)</span>
                    <span className="text-[10px] text-slate-500">미드나잇 청색</span>
                  </div>
                </div>
                {theme === 'dawn' && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                깊고 고요한 심해 미드나잇 딥 네이비 청색 배경
              </p>
            </div>

            {/* 4. System Auto Card */}
            <div
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">시스템 연동</span>
                    <span className="text-[10px] text-slate-500">기기 OS 자동</span>
                  </div>
                </div>
                {theme === 'system' && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                운영체제(OS)의 다크/라이트 모드 설정에 자동 동기화
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: 메인화면 구성 */}
      {activeTab === 'LAYOUT' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            대시보드 Bento Grid 위젯 표시 항목 선택
          </h3>
          <div className="divide-y divide-slate-100">
            <ElmSwt01
              checked={showLedgerSummary}
              onChange={setShowLedgerSummary}
              label="가계부 자산 및 생활비 통계 카드"
              description="소비 지출과 자산/부채 이동 엄격 분리 표시"
            />
            <ElmSwt01
              checked={showGoalSummary}
              onChange={setShowGoalSummary}
              label="모아목표 (MoaGoal) 챌린지 위젯"
              description="동행원 일일 달성률 및 챌린지 진행바"
            />
            <ElmSwt01
              checked={showDutySummary}
              onChange={setShowDutySummary}
              label="모아당번 (MoaDuty) 상태 카드"
              description="미인증 및 대신수행 요청 건수 노출"
            />
            <ElmSwt01
              checked={showMoneySummary}
              onChange={setShowMoneySummary}
              label="모아머니 (MoaMoney) 요구/상환 카드"
              description="용돈 차감 요청 및 분납 D-Day 노출"
            />
          </div>
        </div>
      )}

      {/* Tab 2: 빠른수행 우선순위 */}
      {activeTab === 'PRIORITY' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            빠른수행 위젯 우선순위 노출 정책
          </h3>
          <div className="space-y-3">
            <ElmRad01
              selected={quickPriorityMode === 'TOP_ONE'}
              onSelect={() => setQuickPriorityMode('TOP_ONE')}
              label="최우선 1건 단독 노출 (당일 가장 마감이 임박한 과업)"
            />
            <ElmRad01
              selected={quickPriorityMode === 'ALL'}
              onSelect={() => setQuickPriorityMode('ALL')}
              label="설정별 전체 항목 카드 목록 노출 (당번, 목표 모두 펼쳐보기)"
            />
          </div>
        </div>
      )}

      {/* Tab 3: 알림 설정 */}
      {activeTab === 'NOTIFY' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            알림톡 및 푸시 알림 시간/주기
          </h3>
          <div className="space-y-3">
            <ElmInp01
              label="기본 일일 브리핑 알림 시간"
              type="time"
              value={notifyTime}
              onChange={setNotifyTime}
            />
            <ElmChk01
              checked={notifyGoals}
              onChange={setNotifyGoals}
              label="모아목표 일일 실천 리마인더 발송"
            />
            <ElmChk01
              checked={notifyDuties}
              onChange={setNotifyDuties}
              label="모아당번 순번 도래 및 대신수행 요청 시 알림"
            />
            <ElmChk01
              checked={notifyLoans}
              onChange={setNotifyLoans}
              label="모아머니 상환 만기 3일 전 D-Day 알림"
            />
          </div>
        </div>
      )}

      {/* Tab 4: 송금 수신 계좌 */}
      {activeTab === 'ACCOUNT' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            3대 빅테크 이체 딥링크 생성을 위한 수신 계좌
          </h3>
          <p className="text-xs text-slate-500">
            정산 또는 용돈 요청 시 토스/카톡 이체 링크에 자동으로 채워질 계좌 정보입니다.
          </p>
          <div className="space-y-3 max-w-md">
            <ElmSel01
              label="은행 선택"
              value={bankName}
              onChange={setBankName}
              options={[
                { value: '카카오뱅크', label: '카카오뱅크 (090)' },
                { value: '토스뱅크', label: '토스뱅크 (092)' },
                { value: '국민은행', label: 'KB국민은행 (004)' },
                { value: '신한은행', label: '신한은행 (088)' },
              ]}
            />
            <ElmInp01
              label="계좌번호"
              value={accountNo}
              onChange={setAccountNo}
              placeholder="3333-01-..."
            />
            <ElmInp01
              label="예금주"
              value={accountHolder}
              onChange={setAccountHolder}
              placeholder="구본영"
            />
          </div>
        </div>
      )}

      {/* Tab 5: 2차 OCR 인증키 */}
      {activeTab === 'OCR' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            2단계 사용자 OCR API 인증키 관리 (서버 운영비 0원)
          </h3>
          <p className="text-xs text-slate-500">
            1차 로컬 Docker EasyOCR 인식 불가 시, 사용자가 등록한 개인 Google Cloud Vision 또는 OpenAI Key로만 Fallback됩니다.
          </p>
          <div className="max-w-md space-y-3">
            <ElmInp01
              label="개인 Vision / OpenAI API Key"
              type="password"
              value={ocrKey}
              onChange={setOcrKey}
              placeholder="AIzaSy... 또는 sk-..."
            />
            <p className="text-[11px] text-slate-400">
              * 키는 브라우저 로컬 스토리지에 암호화되어 보관되며 서버 비용 0원을 달성합니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
