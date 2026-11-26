import React, { useState } from 'react';
import { ElmSwt01, ElmChk01 } from '../../elements/Tokens';
import {
  Database,
  Radio,
  Cpu,
  Layers,
  Lock,
  Coins,
  Save,
} from 'lucide-react';
import {
  SystemAuthSecurityConfig,
  SystemRetentionPolicy,
  SystemFinancialCompliance,
  loadAuthSecurityConfig,
  saveAuthSecurityConfig,
  loadRetentionPolicy,
  saveRetentionPolicy,
  loadFinancialCompliance,
  saveFinancialCompliance,
} from '../../data/systemGovernancePool';
import { RetentionPolicyPanel } from './RetentionPolicyPanel';

interface SystemTabProps {
  onToast: (message: string) => void;
}

/* =========================================================================
   Tab 1: 인프라 상세 관제 + 스토리지 수명주기 정책
   ========================================================================= */
export const InfraSettingsTab: React.FC<SystemTabProps> = ({ onToast }) => {
  const [retentionPolicy, setRetentionPolicy] = useState<SystemRetentionPolicy>(() =>
    loadRetentionPolicy()
  );

  const handleSaveRetentionPolicy = () => {
    saveRetentionPolicy(retentionPolicy);
    onToast('스토리지 및 미아데이터 수명주기 정책이 저장되었습니다.');
  };

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">7 / 20</span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">35.0% 사용</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full transition-all" style={{ width: '35%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">대기 큐: 0건 • 최대 20개 커넥션</p>
        </div>

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
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">42 ms</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">안정적</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '22%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">524 방어 폴링 큐 정상 작동</p>
        </div>

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
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">1,280 MB</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">62.5%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all" style={{ width: '62.5%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">OOM 격리 안전 버퍼 768 MB 확보</p>
        </div>

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
            <span className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 font-mono">0 건 대기</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">평균 1.8s</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: '5%' }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-zinc-500">오늘 완료: 48건 • OOM 재시도: 0건</p>
        </div>
      </div>

      <RetentionPolicyPanel
        retention={retentionPolicy}
        onChangeRetention={setRetentionPolicy}
        onSaveRetention={handleSaveRetentionPolicy}
      />
    </section>
  );
};

/* =========================================================================
   Tab 2: 로그인 및 보안 설정
   ========================================================================= */
export const AuthSecurityTab: React.FC<SystemTabProps> = ({ onToast }) => {
  const [authSec, setAuthSec] = useState<SystemAuthSecurityConfig>(() =>
    loadAuthSecurityConfig()
  );

  const handleSaveAuthSec = () => {
    saveAuthSecurityConfig(authSec);
    onToast('로그인 인증 및 보안 설정이 저장되었습니다.');
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>로그인 인증 방식 및 보안 정책 거버넌스</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            OAuth 3사 간편로그인, 2단계 인증(2FA), 이메일 인증 강제 여부를 통제합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAuthSec}
          className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>보안 설정 저장</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-3">
          <ElmSwt01
            checked={authSec.enableSocialLogin}
            onChange={(checked) => setAuthSec((prev) => ({ ...prev, enableSocialLogin: checked }))}
            label="간편로그인(OAuth) 전역 허용"
            description="비활성화 시 일반 아이디/비밀번호 인증 모드로 강제 전환됩니다."
          />

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
              개별 간편로그인 공급자 허용 대상
            </span>
            <div className="space-y-1.5">
              <div
                onClick={() => {
                  if (!authSec.enableSocialLogin) return;
                  setAuthSec((prev) => ({
                    ...prev,
                    providers: { ...prev.providers, kakao: !prev.providers.kakao },
                  }));
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  !authSec.enableSocialLogin
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                    : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                }`}
              >
                <span className="text-xs font-semibold flex items-center gap-2 select-none">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                  <span>카카오 간편로그인 (Kakao OAuth)</span>
                </span>
                <ElmChk01
                  checked={authSec.providers.kakao}
                  disabled={!authSec.enableSocialLogin}
                  onChange={(chk) =>
                    setAuthSec((prev) => ({
                      ...prev,
                      providers: { ...prev.providers, kakao: chk },
                    }))
                  }
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>

              <div
                onClick={() => {
                  if (!authSec.enableSocialLogin) return;
                  setAuthSec((prev) => ({
                    ...prev,
                    providers: { ...prev.providers, naver: !prev.providers.naver },
                  }));
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  !authSec.enableSocialLogin
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                    : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                }`}
              >
                <span className="text-xs font-semibold flex items-center gap-2 select-none">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span>네이버 간편로그인 (Naver OAuth)</span>
                </span>
                <ElmChk01
                  checked={authSec.providers.naver}
                  disabled={!authSec.enableSocialLogin}
                  onChange={(chk) =>
                    setAuthSec((prev) => ({
                      ...prev,
                      providers: { ...prev.providers, naver: chk },
                    }))
                  }
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>

              <div
                onClick={() => {
                  if (!authSec.enableSocialLogin) return;
                  setAuthSec((prev) => ({
                    ...prev,
                    providers: { ...prev.providers, google: !prev.providers.google },
                  }));
                }}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                  !authSec.enableSocialLogin
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                    : 'bg-white dark:bg-[#131B2E] border-slate-200 dark:border-zinc-700 hover:border-indigo-400'
                }`}
              >
                <span className="text-xs font-semibold flex items-center gap-2 select-none">
                  <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
                  <span>구글 간편로그인 (Google OAuth)</span>
                </span>
                <ElmChk01
                  checked={authSec.providers.google}
                  disabled={!authSec.enableSocialLogin}
                  onChange={(chk) =>
                    setAuthSec((prev) => ({
                      ...prev,
                      providers: { ...prev.providers, google: chk },
                    }))
                  }
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-4">
          <ElmSwt01
            checked={authSec.enable2FA}
            onChange={(checked) => setAuthSec((prev) => ({ ...prev, enable2FA: checked }))}
            label="로그인 2단계 인증(2FA) 적용"
            description="로그인 시 인증 앱(TOTP) 또는 등록된 이메일 OTP를 필수로 요구합니다."
          />

          <ElmSwt01
            checked={authSec.requireEmailVerification}
            onChange={(checked) =>
              setAuthSec((prev) => ({ ...prev, requireEmailVerification: checked }))
            }
            label="이메일 인증 필수 여부 설정"
            description="이메일 인증이 완료되지 않은 계정은 가계부 생성 및 정산 기능이 제한됩니다."
          />
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   Tab 5: 금융 기능 컴플라이언스 및 송금 통제
   ========================================================================= */
export const FinanceComplianceTab: React.FC<SystemTabProps> = ({ onToast }) => {
  const [financeComp, setFinanceComp] = useState<SystemFinancialCompliance>(() =>
    loadFinancialCompliance()
  );

  const handleSaveFinanceComp = () => {
    saveFinancialCompliance(financeComp);
    onToast('금융 컴플라이언스 송금 통제 설정이 저장되었습니다.');
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-600" />
            <span>금융 기능 컴플라이언스 및 송금 통제</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            토스/카카오페이 딥링크 및 계좌 송금 URL 생성 허용 여부를 강력히 통제합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveFinanceComp}
          className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>컴플라이언스 저장</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-3">
          <ElmSwt01
            checked={financeComp.enableRemitUrlGeneration}
            onChange={(checked) =>
              setFinanceComp((prev) => ({ ...prev, enableRemitUrlGeneration: checked }))
            }
            label="송금 URL 생성 전역 허용"
            description="비활성화 시 플랫폼 내 모든 화면에서 토스/카카오페이 딥링크 생성이 즉각 차단됩니다."
          />

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
            <ElmSwt01
              checked={financeComp.allowGoalCheerRemit}
              onChange={(checked) =>
                setFinanceComp((prev) => ({ ...prev, allowGoalCheerRemit: checked }))
              }
              label="모아목표 수행응원 송금 허용"
              description="목표 달성 응원 시 송금 URL 생성을 허용합니다."
            />

            <ElmSwt01
              checked={financeComp.allowMoaMoneyRemit}
              onChange={(checked) =>
                setFinanceComp((prev) => ({ ...prev, allowMoaMoneyRemit: checked }))
              }
              label="모아머니(정산/지원/보상) 송금 허용"
              description="정산 결과 및 용돈 지원 시 송금 URL 생성을 허용합니다."
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 space-y-3">
          <ElmSwt01
            checked={financeComp.blockForeignIpRemit}
            onChange={(checked) =>
              setFinanceComp((prev) => ({ ...prev, blockForeignIpRemit: checked }))
            }
            label="해외 IP 송금 URL 생성 차단"
            description="Cloudflare IP 지리 정보를 기반으로 국내 외 IP의 송금 링크 생성을 방어합니다."
          />
        </div>
      </div>
    </section>
  );
};
