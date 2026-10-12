import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmStt01,
} from '../elements/Tokens';
import {
  Sparkles,
  Camera,
  Target,
  CheckCircle,
  Clock,
  Check,
  X,
  Image as ImageIcon,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

export const SCR_QCK_02_빠른수행등록: React.FC<{
  onClose?: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark' || resolvedTheme === 'dawn';

  const [taskType, setTaskType] = useState<'DUTY' | 'GOAL'>('DUTY');
  const [selectedTask, setSelectedTask] = useState('1');
  const [memo, setMemo] = useState('분리수거 및 청소기 돌리기 완료했습니다!');
  const [status, setStatus] = useState<'COMPLETED' | 'SUBSTITUTE_REQUESTED' | 'ON_HOLD'>('COMPLETED');
  const [execTime, setExecTime] = useState('2026-10-11T19:30');
  const [substitutePerson, setSubstitutePerson] = useState('구본영(호스트)');

  // 가상 인증 사진 샘플 프리셋
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80'
  );
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const photoPresets = [
    {
      label: '🧹 청소/분리수거',
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&auto=format&fit=crop&q=80',
    },
    {
      label: '🏃 1만보 걷기 달성',
      url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&auto=format&fit=crop&q=80',
    },
    {
      label: '📚 독서/학습 노트',
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(
      taskType === 'DUTY'
        ? `모아당번 [${status === 'COMPLETED' ? '완료' : status === 'SUBSTITUTE_REQUESTED' ? '대신요청' : '보류양해'}] 상태가 등록되었습니다.`
        : '모아목표 인증 기록이 성공적으로 등록되었습니다.'
    );
    if (onSuccess) onSuccess();
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto p-4 sm:p-6 space-y-6 min-h-screen flex flex-col justify-center transition-colors ${
        resolvedTheme === 'dawn'
          ? 'bg-[#070d1e] text-[#f0f6fc]'
          : isDark
          ? 'bg-[#121215] text-[#f4f4f6]'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div
        className={`p-6 rounded-2xl border shadow-sm space-y-5 transition-colors ${
          resolvedTheme === 'dawn'
            ? 'bg-[#0d1838] border-[#1e3a6d]'
            : isDark
            ? 'bg-[#18181b] border-[#27272a]'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-bold border border-purple-200 dark:border-purple-800 shrink-0">
              SCR-QCK-02
            </span>
            <ElmTyp01
              title="빠른 수행등록 (당번 & 목표)"
              subtitle="인증사진 첨부, 직교 3상태머신 원클릭 기록"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 인라인 성공 알림 배너 */}
        {submitSuccess && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400">
                수행 등록이 성공적으로 기록되었습니다!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {submitSuccess}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shrink-0"
                >
                  새 수행 계속 등록
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors shrink-0"
                  >
                    대시보드로 복귀
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task Selector */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setTaskType('DUTY');
              setMemo('분리수거 및 청소기 돌리기 완료했습니다!');
            }}
            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
              taskType === 'DUTY'
                ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 shadow-xs ring-1 ring-purple-500/30'
                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-1.5 text-purple-600 dark:text-purple-400" />
            <span className="block text-sm">모아당번 수행</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-normal">
              순번 가사/과업 인증
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTaskType('GOAL');
              setMemo('가족 1만보 걷기 챌린지 10,240보 완료!');
            }}
            className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
              taskType === 'GOAL'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/30'
                : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
            }`}
          >
            <Target className="w-4 h-4 mb-1.5 text-indigo-600 dark:text-indigo-400" />
            <span className="block text-sm">모아목표 달성</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-normal">
              챌린지 일일 인증
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <ElmSel01
            label={taskType === 'DUTY' ? '수행할 당번 과업 선택' : '인증할 목표 선택'}
            value={selectedTask}
            onChange={setSelectedTask}
            options={
              taskType === 'DUTY'
                ? [
                    { value: '1', label: '거실 청소기 및 물걸레 밀기 (오늘 순번)' },
                    { value: '2', label: '주말 분리수거 및 음식물 쓰레기' },
                    { value: '3', label: '2026 동창회 모임 숙소 식기 정리' },
                  ]
                : [
                    { value: '1', label: '가족 건강 1만보 걷기 챌린지 (동행 3명)' },
                    { value: '2', label: '주 3회 독서 서평 작성' },
                  ]
            }
          />

          {/* MoaDuty 직교 3상태머신 선택 */}
          {taskType === 'DUTY' && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                수행 상태머신 설정
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('COMPLETED')}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                    status === 'COMPLETED'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  완료 (COMPLETED)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('SUBSTITUTE_REQUESTED')}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                    status === 'SUBSTITUTE_REQUESTED'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  대신요청 (SUBSTITUTE)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('ON_HOLD')}
                  className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                    status === 'ON_HOLD'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  보류양해 (ON_HOLD)
                </button>
              </div>
            </div>
          )}

          {status === 'SUBSTITUTE_REQUESTED' && taskType === 'DUTY' && (
            <ElmSel01
              label="대신수행 요청 대상자"
              value={substitutePerson}
              onChange={setSubstitutePerson}
              options={[
                { value: '구본영(호스트)', label: '구본영 (호스트)' },
                { value: '최수진(배우자)', label: '최수진 (배우자)' },
                { value: '구민우(자녀)', label: '구민우 (자녀)' },
              ]}
            />
          )}

          <ElmInp01
            label="수행 일시"
            type="datetime-local"
            value={execTime}
            onChange={setExecTime}
          />

          <ElmInp01
            label={status === 'ON_HOLD' ? '보류 양해 사유 메모' : '수행 메모'}
            value={memo}
            onChange={setMemo}
            placeholder="수행 내용 또는 양해 사유를 적어주세요..."
          />

          {/* 인증 사진 첨부 및 실시간 미리보기 영역 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-purple-500" />
                <span>인증 사진 첨부:</span>
              </span>
              <span className="text-[10px] text-slate-400">모의 프리셋 선택 가능</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photoPresets.map((ph, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAttachedPhoto(ph.url)}
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-bold shrink-0 transition-colors bg-slate-50 dark:bg-zinc-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-slate-200 dark:border-zinc-700 hover:border-purple-400 text-slate-700 dark:text-zinc-300"
                >
                  {ph.label}
                </button>
              ))}
            </div>

            {attachedPhoto ? (
              <div className="relative rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800/50 bg-slate-100 dark:bg-zinc-800 p-2 flex items-center gap-3">
                <img
                  src={attachedPhoto}
                  alt="인증 사진 미리보기"
                  className="w-16 h-16 rounded-lg object-cover border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block truncate">
                    인증 사진이 성공적으로 첨부됨
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    ✓ 고화질 압축 및 EXIF 검증 완료
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedPhoto(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                  title="사진 삭제"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl text-center bg-slate-50/60 dark:bg-zinc-800/40 space-y-1">
                <Camera className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto" />
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
                  인증 사진 촬영 또는 갤러리 첨부
                </span>
                <p className="text-[10px] text-slate-400">
                  * 사진 첨부 시 구성원들에게 모아보고 피드 알림이 자동 발송됩니다.
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-2 min-h-[44px] py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            <span>수행 인증 완료</span>
          </button>
        </form>
      </div>
    </div>
  );
};
