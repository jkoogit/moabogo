import React from 'react';
import { HardDrive, Save } from 'lucide-react';
import { ElmSwt01 } from '../../elements/Tokens';
import { SystemRetentionPolicy } from '../../data/systemGovernancePool';

interface RetentionPolicyPanelProps {
  retention: SystemRetentionPolicy;
  onChangeRetention: (next: SystemRetentionPolicy) => void;
  onSaveRetention: () => void;
}

export const RetentionPolicyPanel: React.FC<RetentionPolicyPanelProps> = ({
  retention,
  onChangeRetention,
  onSaveRetention,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>스토리지 · 미아데이터 수명주기(Retention) 전역 정책 (`retention_policies`)</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            미아 지출/첨부 TTL, 2-Tier tarball 압축 전환 일수, 자동 GC 및 온디맨드 스트림 캐시 정책을 제어합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveRetention}
          className="min-h-[40px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>수명주기 저장</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
            미아 데이터 보존 TTL (일)
          </label>
          <input
            type="number"
            min={7}
            max={365}
            value={retention.orphanTtlDays}
            onChange={(e) =>
              onChangeRetention({
                ...retention,
                orphanTtlDays: Math.max(7, Math.min(365, Number(e.target.value) || 90)),
              })
            }
            className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-xs font-mono font-bold"
          />
          <p className="text-[10px] text-slate-400">UNALLOCATED 고아 지출·첨부 기본 90일</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
            Cold tarball 압축 전환 (일)
          </label>
          <input
            type="number"
            min={7}
            max={180}
            value={retention.archiveTierDays}
            onChange={(e) =>
              onChangeRetention({
                ...retention,
                archiveTierDays: Math.max(7, Math.min(180, Number(e.target.value) || 30)),
              })
            }
            className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-xs font-mono font-bold"
          />
          <p className="text-[10px] text-slate-400">ACTIVE ➔ ARCHIVED(.tar.gz.enc) 기본 30일</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] space-y-1.5">
          <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
            온디맨드 스트림 캐시 정책
          </label>
          <select
            value={retention.streamCachePolicy}
            onChange={(e) =>
              onChangeRetention({
                ...retention,
                streamCachePolicy: e.target.value as SystemRetentionPolicy['streamCachePolicy'],
              })
            }
            className="w-full min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#131B2E] text-xs font-bold"
          >
            <option value="INSTANT">INSTANT (조회 즉시 파기)</option>
            <option value="1_DAY">1_DAY (24시간 임시 캐시)</option>
            <option value="30_DAYS">30_DAYS (30일 단기 보관)</option>
          </select>
          <p className="text-[10px] text-slate-400">압축 복원 스트리밍 임시 버퍼 정책</p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0E131F] flex items-center">
          <ElmSwt01
            checked={retention.autoPurgeOrphan}
            onChange={(checked) => onChangeRetention({ ...retention, autoPurgeOrphan: checked })}
            label="만료 미아 자동 GC"
            description="야간 배치에서 TTL 만료 고아 데이터를 자동 정리합니다."
          />
        </div>
      </div>
    </div>
  );
};
