import React from 'react';
import { Target, CheckCircle, Camera, Check, MessageCircle } from 'lucide-react';
import { ElmInp01, ElmPrf01, ElmRng01 } from '../../elements/Tokens';
import { GoalItem } from '../../data/goal-mock-data';
import { GoalMetricPlugin } from './plugins/pluginContract';

interface GoalStatusTabProps {
  currentGoal: GoalItem;
  plugin: GoalMetricPlugin;
  sliderTargetValue: number;
  setSliderTargetValue: (val: number) => void;
  recordValue: string;
  setRecordValue: (val: string) => void;
  recordMemo: string;
  setRecordMemo: (val: string) => void;
  attachedFile: File | null;
  attachedFilePreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onRegisterExecution: (e?: React.FormEvent) => void;
  statusCommentInput: string;
  setStatusCommentInput: (val: string) => void;
  onAddStatusComment: (e?: React.FormEvent) => void;
}

export const GoalStatusTab: React.FC<GoalStatusTabProps> = ({
  currentGoal,
  plugin,
  sliderTargetValue,
  setSliderTargetValue,
  recordValue,
  setRecordValue,
  recordMemo,
  setRecordMemo,
  attachedFile,
  attachedFilePreview,
  onFileChange,
  onRemoveFile,
  onRegisterExecution,
  statusCommentInput,
  setStatusCommentInput,
  onAddStatusComment,
}) => {
  return (
    <div className="space-y-4">
      {/* 플러그인 카테고리 특화 위젯 */}
      {plugin.renderDetailWidget(currentGoal, sliderTargetValue)}

      {/* 목표 인정 기준치 조절 (ELM-RNG-01) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              목표 인정 기준치 조절 (ELM-RNG-01)
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
            현재 기준: {sliderTargetValue.toLocaleString()} {currentGoal.unit}
          </span>
        </div>

        <ElmRng01
          label={plugin.sliderConfig.label}
          value={sliderTargetValue}
          min={plugin.sliderConfig.min}
          max={plugin.sliderConfig.max}
          step={plugin.sliderConfig.step}
          unit={currentGoal.unit}
          colorScheme="rose"
          onChange={setSliderTargetValue}
          className="pt-1"
        />
      </section>

      {/* 고정 항목 & 입력 항목 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-1.5 shadow-xs">
          <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
            📌 고정 항목 (규칙/기준)
          </span>
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-semibold">
            • {currentGoal.fixedRule}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-1.5 shadow-xs">
          <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
            ✏️ 입력 항목 (수행 기록 가이드)
          </span>
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed font-semibold">
            • {currentGoal.inputRule}
          </p>
        </div>
      </section>

      {/* 오늘의 실천 인증 제출 영역 */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              오늘의 목표 실천 인증
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
            {currentGoal.myRole === 'PARTICIPANT'
              ? '동행원 인증 모드'
              : currentGoal.myRole === 'MANAGER'
              ? '관리자 모드 (인증 대상 아님)'
              : '관람원 조회 모드'}
          </span>
        </div>

        {currentGoal.myRole === 'PARTICIPANT' ? (
          <form onSubmit={onRegisterExecution} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ElmInp01
                label={`실제 실천 수치 (${currentGoal.unit})`}
                value={recordValue}
                onChange={setRecordValue}
                placeholder={`예: ${sliderTargetValue.toLocaleString()}`}
              />
              <ElmInp01
                label="컨디션 및 실천 메모"
                value={recordMemo}
                onChange={setRecordMemo}
                placeholder="예: 오늘 저녁 산책 코스 만보 완주!"
              />
            </div>

            <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-[#0B0F17] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <label className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>증빙 사진 첨부하기</span>
                  <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>

                {attachedFile ? (
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>
                      ✓ {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={onRemoveFile}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                      title="첨부 파일 삭제"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400">만보기 캡처나 영수증 사진을 첨부하세요.</span>
                )}
              </div>

              {attachedFilePreview && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 shrink-0">
                  <img
                    src={attachedFilePreview}
                    alt="첨부 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="min-h-[44px] px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>인증제출 ✓</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-300">
            {currentGoal.myRole === 'MANAGER'
              ? '관리자는 운영자 역할로서 목표를 직접 실천/인증하지 않습니다. [수행 이력]에서 참가자들의 인증을 검토하세요.'
              : '관람원(응원원)은 목표를 직접 인증하지 않고, 아래 피드에서 따뜻한 응원과 댓글을 남길 수 있습니다.'}
          </div>
        )}
      </section>

      {/* 실시간 응원 및 댓글 피드 */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              실시간 목표 응원 피드 ({currentGoal.comments.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            참가자 & 관람자 작성 가능 (관리자는 등록 불가)
          </span>
        </div>

        {currentGoal.myRole === 'MANAGER' ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 text-xs text-slate-400">
            ⚠️ 관리자 역할은 객관적 운영자로서 응원 댓글 작성이 제한됩니다.
          </div>
        ) : (
          <form onSubmit={onAddStatusComment} className="flex gap-2 items-center">
            <div className="flex-1">
              <ElmInp01
                label=""
                value={statusCommentInput}
                onChange={setStatusCommentInput}
                placeholder="따뜻한 응원이나 실천 다짐을 남겨보세요..."
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shrink-0 cursor-pointer transition-all shadow-xs"
            >
              응원 등록
            </button>
          </form>
        )}

        <div className="space-y-2.5 pt-1">
          {currentGoal.comments.map((cm) => (
            <div
              key={cm.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0F17] text-xs flex items-start gap-2.5"
            >
              <ElmPrf01 size="sm" name={cm.author} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{cm.author}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      cm.role === 'PARTICIPANT'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {cm.role === 'PARTICIPANT' ? '동행원' : '응원원'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">{cm.createdAt}</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">{cm.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
