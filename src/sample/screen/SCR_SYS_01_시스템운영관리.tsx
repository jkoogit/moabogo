import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmSwt01,
  ElmInp01,
  ElmSld03,
} from '../elements/Tokens';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  Lock,
  Clock,
  Radio,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  HardDrive,
} from 'lucide-react';

export const SCR_SYS_01_시스템운영관리: React.FC<{
  onBack?: () => void;
}> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'QUEUE' | 'AUDIT' | 'CONFIG'>('HEALTH');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [noticeText, setNoticeText] = useState<string>('홈서버 정기 점검이 진행 중입니다. (자정 02:00 ~ 02:30)');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 실시간 새로고침 시뮬레이션
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-12 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* 1. Header with 360px 2-line layout standard */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <ElmTyp01
          title="시스템 운영관리 관제"
          badge="SCR-SYS-01"
          subtitle="PostgreSQL 풀 • Cloudflare 터널 • 2GB RAM OOM 격리 • EasyOCR 큐 • 시스템 감사 로그"
        />

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-slate-700 dark:text-zinc-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="인프라 상태 실시간 새로고침"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">새로고침</span>
          </button>

          <span className="text-[10px] px-2 py-1 rounded-lg font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>정상 운영중</span>
          </span>
        </div>
      </section>

      {/* 2. 4대 핵심 인프라 헬스체크 Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: PostgreSQL DB Connection Pool */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-sky-500" />
              <span>PostgreSQL 풀</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              HEALTHY
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              7 / 20
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">35.0% 사용</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: '35%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">대기 큐: 0건 • 최대 20개 커넥션</p>
        </div>

        {/* Metric 2: Cloudflare Tunnel & 524 Timeout Defense */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-500" />
              <span>Cloudflare 터널</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              CONNECTED
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              42 ms
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">안정적</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '22%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">524 방어 폴링 큐 정상 작동</p>
        </div>

        {/* Metric 3: Home Server RAM & 2GB OOM Safe Boundary */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-500" />
              <span>홈서버 RAM (2GB 상한)</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              BUFFER OK
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              1,280 MB
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">62.5%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: '62.5%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">OOM 격리 안전 버퍼 768 MB 확보</p>
        </div>

        {/* Metric 4: EasyOCR Async Queue Worker */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>EasyOCR 워커 큐</span>
            </span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              IDLE
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">
              0 건 대기
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">평균 1.8s</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '5%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">오늘 완료: 48건 • OOM 재시도: 0건</p>
        </div>
      </section>

      {/* 3. Navigation Tabs */}
      <section className="w-full min-w-0">
        <ElmSld03 showNavButtons={false} className="w-full">
          <div className="flex items-center min-w-max border-b border-slate-200 dark:border-zinc-800">
            {[
              { id: 'HEALTH', label: '인프라 상세 관제' },
              { id: 'QUEUE', label: 'EasyOCR 비동기 큐' },
              { id: 'AUDIT', label: '가계부 무결성 감사' },
              { id: 'CONFIG', label: '긴급점검 & 시스템 공지' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`min-h-[44px] px-5 py-3 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t" />
                  )}
                </button>
              );
            })}
          </div>
        </ElmSld03>
      </section>

      {/* 4. Tab Contents */}

      {/* Tab 1: 인프라 상세 관제 */}
      {activeTab === 'HEALTH' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>노트북 홈서버 & 데몬 프로세스 모니터링</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
              Host: ASUS ZenBook Ubuntu 24.04 LTS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Docker 컨테이너 상태
              </span>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-zinc-400">
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>moabogo-postgres-16</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-600">Up 14 days (Port 5432)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>moabogo-easyocr-worker</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-600">Up 4 days (RAM Limit 2GB)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>cloudflared-tunnel-daemon</span>
                  </span>
                  <span className="font-mono text-[11px] text-emerald-600">Connected (Quick Tunnel)</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                무중단 0-Hang 가드레일 정책
              </span>
              <ul className="text-[11px] space-y-1.5 text-slate-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <span>PostgreSQL 장애 시 클라이언트 로컬 IndexedDB 자동 전환 및 안전 읽기 모드 유지</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <span>EasyOCR 인식 지연 시 100초 타임아웃 방어 비동기 작업 큐로 백그라운드 분리</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: EasyOCR 비동기 큐 */}
      {activeTab === 'QUEUE' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>EasyOCR 파이프라인 OOM 격리 큐 상태</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            영수증 분석 요청은 메인 웹 서버와 분리된 비동기 워커 프로세스에서 격리 처리되며, 2GB 메모리 초과 위험 발생 시 즉시 프로세스를 재생성하여 시스템 셧다운을 방어합니다.
          </p>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#0E131F]/60 text-center py-8">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">현재 대기 중인 OCR 큐 작업이 없습니다.</p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">모든 영수증 파싱 작업이 즉시 처리되었습니다.</p>
          </div>
        </section>
      )}

      {/* Tab 3: 가계부 무결성 감사 */}
      {activeTab === 'AUDIT' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>가계부 금전관리 3대 원칙 무결성 감사 로그</span>
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span>① 단일 귀속성 검증 (개인/그룹 배타적 귀속)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% 무결 (위반 0건)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span>② TRANSFER 단일 연결 (순수 생활비 이중계상 원천 차단)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% 무결 (위반 0건)</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span>③ 메타데이터 태깅 분리 (개인 대납 및 정산 분리)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% 정합 유지</span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: 긴급점검 & 시스템 공지 */}
      {activeTab === 'CONFIG' && (
        <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>긴급 점검 모드 및 시스템 전역 공지 제어</span>
          </h3>

          <div className="space-y-4 max-w-lg">
            <ElmSwt01
              checked={isMaintenanceMode}
              onChange={setIsMaintenanceMode}
              label="전역 긴급 점검 모드 강제 송출"
              description="활성화 시 전체 클라이언트 상단에 점검 안내 배너가 즉시 노출됩니다."
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                점검 및 긴급 공지 문구
              </label>
              <input
                type="text"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full h-11 px-3.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {isMaintenanceMode && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>현재 점검 모드가 활성화되어 전역 클라이언트에 배너가 송출 중입니다.</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
