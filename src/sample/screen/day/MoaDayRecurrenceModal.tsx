// ==========================================
// src/sample/screen/day/MoaDayRecurrenceModal.tsx
// 네이버 캘린더형 상세 반복 설정 모달 (사양 100% 충족)
// ==========================================

import React, { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { RecurrenceRule } from './types';

interface MoaDayRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rule: RecurrenceRule) => void;
  initialRule?: RecurrenceRule;
  targetDate: string; // YYYY-MM-DD
}

const DAYS_LABEL = ['일', '월', '화', '수', '목', '금', '토'];

export const MoaDayRecurrenceModal: React.FC<MoaDayRecurrenceModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialRule,
  targetDate,
}) => {
  if (!isOpen) return null;

  // 초기 요일 계산 (targetDate 요일)
  const defaultDayOfWeek = useMemo(() => {
    try {
      const d = new Date(targetDate);
      return d.getDay();
    } catch {
      return 0;
    }
  }, [targetDate]);

  const [cycle, setCycle] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>(
    initialRule?.cycle || 'WEEKLY'
  );
  const [interval, setInterval] = useState<number>(initialRule?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    initialRule?.daysOfWeek || [defaultDayOfWeek]
  );
  const [startTime, setStartTime] = useState<string>(initialRule?.startTime || '19:30');
  const [endTime, setEndTime] = useState<string>(initialRule?.endTime || '20:30');
  const [isNextDayEnd, setIsNextDayEnd] = useState<boolean>(initialRule?.isNextDayEnd || false);
  const [isAllDay, setIsAllDay] = useState<boolean>(initialRule?.isAllDay || false);
  const [endCondition, setEndCondition] = useState<'NONE' | 'DATE' | 'COUNT'>(
    initialRule?.endCondition || 'NONE'
  );
  const [endDate, setEndDate] = useState<string>(initialRule?.endDate || targetDate);
  const [endCount, setEndCount] = useState<number>(initialRule?.endCount || 10);

  // 요일 토글 핸들러
  const handleToggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      if (daysOfWeek.length === 1) return; // 최소 1개는 선택 유지
      setDaysOfWeek(daysOfWeek.filter((d) => d !== dayIndex));
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex].sort());
    }
  };

  // 실시간 요약 문구 계산 (네이버 캘린더 동일)
  const summaryText = useMemo(() => {
    const cycleMap = { DAILY: '일', WEEKLY: '주', MONTHLY: '개월', YEARLY: '년' };
    let cycleDesc = '';
    if (cycle === 'DAILY') {
      cycleDesc = interval === 1 ? '매일' : `${interval}일마다`;
    } else if (cycle === 'WEEKLY') {
      const selectedDaysStr = daysOfWeek.map((d) => `${DAYS_LABEL[d]}요일`).join(', ');
      cycleDesc = interval === 1 ? `매주 ${selectedDaysStr}` : `${interval}주마다 ${selectedDaysStr}`;
    } else if (cycle === 'MONTHLY') {
      cycleDesc = interval === 1 ? '매월' : `${interval}개월마다`;
    } else {
      cycleDesc = interval === 1 ? '매년' : `${interval}년마다`;
    }

    const timeDesc = isAllDay
      ? '종일'
      : `${startTime} - ${isNextDayEnd ? '익일 ' : ''}${endTime}`;

    let endDesc = '';
    if (endCondition === 'NONE') {
      endDesc = `${targetDate} - 무한반복`;
    } else if (endCondition === 'DATE') {
      endDesc = `${targetDate}부터 ${endDate}까지 반복`;
    } else {
      endDesc = `${targetDate}부터 ${endCount}회 반복 후 종료`;
    }

    return `${cycleDesc} | ${timeDesc}\n${endDesc}`;
  }, [
    cycle,
    interval,
    daysOfWeek,
    startTime,
    endTime,
    isNextDayEnd,
    isAllDay,
    endCondition,
    targetDate,
    endDate,
    endCount,
  ]);

  const handleSave = () => {
    const rule: RecurrenceRule = {
      cycle,
      interval,
      daysOfWeek,
      startTime,
      endTime,
      isNextDayEnd,
      isAllDay,
      endCondition,
      endDate: endCondition === 'DATE' ? endDate : undefined,
      endCount: endCondition === 'COUNT' ? endCount : undefined,
      summary: summaryText,
    };
    onApply(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col text-sm text-slate-800 dark:text-zinc-200">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-zinc-100">
            <span>반복</span>
            <span className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500">
              <CalendarIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 바디 컨텐츠 (네이버형 폼) */}
        <div className="p-5 space-y-4">
          {/* 1. 반복 주기 */}
          <div className="grid grid-cols-4 items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">반복 주기</label>
            <div className="col-span-3">
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as any)}
                className="w-36 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium focus:outline-indigo-500"
              >
                <option value="DAILY">매일</option>
                <option value="WEEKLY">매주</option>
                <option value="MONTHLY">매월</option>
                <option value="YEARLY">매년</option>
              </select>
            </div>
          </div>

          {/* 2. 주기 */}
          <div className="grid grid-cols-4 items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">주기</label>
            <div className="col-span-3 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center text-xs font-bold"
              />
              <span className="text-xs font-medium">
                {cycle === 'DAILY' ? '일' : cycle === 'WEEKLY' ? '주' : cycle === 'MONTHLY' ? '개월' : '년'}
              </span>
            </div>
          </div>

          {/* 3. 요일 선택 (매주일 때 활성화) */}
          {cycle === 'WEEKLY' && (
            <div className="grid grid-cols-4 items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">요일</span>
              <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
                {DAYS_LABEL.map((day, idx) => {
                  const isChecked = daysOfWeek.includes(idx);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-transparent hover:border-slate-300'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. 시간 */}
          <div className="grid grid-cols-4 items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400">시간</label>
            <div className="col-span-3 flex items-center gap-1.5 flex-wrap">
              <input
                type="time"
                disabled={isAllDay}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs disabled:opacity-40"
              />
              <span className="text-xs text-slate-400">-</span>
              <select
                disabled={isAllDay}
                value={isNextDayEnd ? 'NEXT' : 'SAME'}
                onChange={(e) => setIsNextDayEnd(e.target.value === 'NEXT')}
                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs disabled:opacity-40"
              >
                <option value="SAME">당일</option>
                <option value="NEXT">익일</option>
              </select>
              <input
                type="time"
                disabled={isAllDay}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs disabled:opacity-40"
              />
              <label className="flex items-center gap-1 ml-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>종일</span>
              </label>
            </div>
          </div>

          {/* 5. 종료 */}
          <div className="grid grid-cols-4 items-start gap-2 pt-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-zinc-400 pt-1">종료</label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={endCondition === 'NONE'}
                    onChange={() => setEndCondition('NONE')}
                    className="text-indigo-600 focus:ring-0"
                  />
                  <span>없음</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={endCondition === 'DATE'}
                    onChange={() => setEndCondition('DATE')}
                    className="text-indigo-600 focus:ring-0"
                  />
                  <span>날짜</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={endCondition === 'COUNT'}
                    onChange={() => setEndCondition('COUNT')}
                    className="text-indigo-600 focus:ring-0"
                  />
                  <span>횟수</span>
                </label>
              </div>

              {endCondition === 'DATE' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-500">종료일:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
                  />
                  <span className="text-xs text-slate-500">까지</span>
                </div>
              )}

              {endCondition === 'COUNT' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={endCount}
                    onChange={(e) => setEndCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center text-xs font-bold"
                  />
                  <span className="text-xs text-slate-500">회 반복 후 종료</span>
                </div>
              )}
            </div>
          </div>

          {/* 6. 네이버형 실시간 요약 박스 */}
          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 text-xs leading-relaxed text-slate-700 dark:text-zinc-300 whitespace-pre-line font-medium">
            {summaryText}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>설정</span>
          </button>
        </div>
      </div>
    </div>
  );
};
