import React, { useState } from 'react';
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
} from 'lucide-react';

export const SCR_QCK_02_빠른수행등록: React.FC<{
  onClose?: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const [taskType, setTaskType] = useState<'DUTY' | 'GOAL'>('DUTY');
  const [selectedTask, setSelectedTask] = useState('1');
  const [memo, setMemo] = useState('분리수거 및 분리배출 완료했습니다!');
  const [status, setStatus] = useState('COMPLETED');
  const [execTime, setExecTime] = useState('2026-10-06T19:30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`[수행 등록 완료]\n과업: ${taskType === 'DUTY' ? '모아당번' : '모아목표'}\n인증사진 및 메모가 성공적으로 기록되었습니다.`);
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 space-y-6 bg-slate-50 min-h-screen text-slate-900 flex flex-col justify-center">
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
              SCR-QCK-02
            </span>
            <ElmTyp01
              title="빠른 수행등록 (당번 & 목표)"
              subtitle="인증사진 첨부, 메모, 상태, 수행시간 원클릭 기록"
            />
          </div>
          {onClose && (
            <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-700 font-semibold">
              닫기 ✕
            </button>
          )}
        </div>

        {/* Task Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTaskType('DUTY')}
            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
              taskType === 'DUTY'
                ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-1 text-purple-600" />
            <span className="block">모아당번 수행</span>
            <span className="text-[10px] text-slate-400 font-normal">순번 가사/과업 인증</span>
          </button>

          <button
            type="button"
            onClick={() => setTaskType('GOAL')}
            className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
              taskType === 'GOAL'
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Target className="w-4 h-4 mb-1 text-indigo-600" />
            <span className="block">모아목표 달성</span>
            <span className="text-[10px] text-slate-400 font-normal">챌린지 일일 인증</span>
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
                    { value: '1', label: '거실 청소기 및 물걸레 밀기' },
                    { value: '2', label: '주말 분리수거 및 음식물 쓰레기' },
                    { value: '3', label: '동창회 펜션 식기 정리' },
                  ]
                : [
                    { value: '1', label: '가족 건강 1만보 걷기 챌린지' },
                    { value: '2', label: '주 3회 독서 서평 작성' },
                  ]
            }
          />

          <ElmSel01
            label="수행 상태"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'COMPLETED', label: '완료 (COMPLETED)' },
              { value: 'SUBSTITUTE_REQUESTED', label: '대신요청 (SUBSTITUTE)' },
              { value: 'ON_HOLD', label: '보류 양해 (ON_HOLD)' },
            ]}
          />

          <ElmInp01
            label="수행 일시"
            type="datetime-local"
            value={execTime}
            onChange={setExecTime}
          />

          <ElmInp01
            label="수행 메모"
            value={memo}
            onChange={setMemo}
            placeholder="수행 내용 또는 보류 사유를 적어주세요..."
          />

          {/* Photo attachment placeholder */}
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50 space-y-1">
            <Camera className="w-5 h-5 text-purple-600 mx-auto" />
            <span className="text-xs font-semibold text-slate-700 block">
              인증 사진 촬영 또는 갤러리 첨부
            </span>
            <p className="text-[10px] text-slate-400">
              * 인증사진 첨부 시 구성원들에게 알림톡이 자동 발송됩니다.
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>수행 인증 완료</span>
          </button>
        </form>
      </div>
    </div>
  );
};
