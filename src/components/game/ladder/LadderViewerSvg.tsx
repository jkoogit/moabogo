import React from 'react';
import {
  LadderRung,
  LadderGoal,
  LadderResultMap,
  LadderRevealedGoalCols,
  LADDER_COL_WIDTH,
} from './types';
import { Participant } from '../types';

export interface LadderViewerSvgProps {
  members: Participant[];
  ladderGoals: LadderGoal[];
  ladderRungs: LadderRung[];
  ladderResult: LadderResultMap | null;
  revealedGoals: Record<string, boolean>;
  revealedGoalCols: LadderRevealedGoalCols;
  isLadderTracing: boolean;
  activeTracingMemberIndex: number | null;
  currentTracerPosition: { x: number; y: number } | null;
  currentTracedTrail: { x: number; y: number }[];
  onGoalColClick: (colIdx: number) => void;
  onStartSingleMemberTrace?: (memberIdx: number) => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const LadderViewerSvg: React.FC<LadderViewerSvgProps> = ({
  members,
  ladderGoals,
  ladderRungs,
  ladderResult,
  revealedGoals,
  revealedGoalCols,
  isLadderTracing,
  activeTracingMemberIndex,
  currentTracerPosition,
  currentTracedTrail,
  onGoalColClick,
  resolvedTheme,
  isDark,
}) => {
  const cols = members.length;
  const colWidth = LADDER_COL_WIDTH;
  const totalSvgWidth = cols * colWidth;
  const startY = 12;
  const endY = 244;
  const getX = (col: number) => col * colWidth + colWidth / 2;
  const getRungY = (r: number) => 28 + r * 22;

  const activeMember =
    activeTracingMemberIndex !== null && activeTracingMemberIndex < members.length
      ? members[activeTracingMemberIndex]
      : null;

  return (
    <div className="relative select-none" style={{ width: totalSvgWidth }}>
      <svg
        width={totalSvgWidth}
        height={256}
        className="overflow-visible block"
      >
        {/* 세로 기둥 선들 */}
        {Array.from({ length: cols }).map((_, c) => {
          const x = getX(c);
          return (
            <line
              key={`col-${c}`}
              x1={x}
              y1={startY}
              x2={x}
              y2={endY}
              stroke={
                resolvedTheme === 'dawn'
                  ? '#93c5fd'
                  : isDark
                  ? '#3f3f46'
                  : '#cbd5e1'
              }
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}

        {/* 가로 사다리 발판 선들 (Rungs) */}
        {ladderRungs.map((rung, i) => {
          const x1 = getX(rung.col);
          const x2 = getX(rung.col + 1);
          const y = getRungY(rung.row);
          return (
            <line
              key={`rung-${i}`}
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={
                resolvedTheme === 'dawn'
                  ? '#3b82f6'
                  : isDark
                  ? '#6366f1'
                  : '#4f46e5'
              }
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}

        {/* 현재 이동 중인 발자국 궤적 (Polyline) */}
        {currentTracedTrail.length > 1 && (
          <polyline
            points={currentTracedTrail.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#ec4899"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-in fade-in"
          />
        )}

        {/* 실시간 이동 마커 (이모지 아바타 + 글로우 원) */}
        {currentTracerPosition && activeMember && (
          <g
            transform={`translate(${currentTracerPosition.x}, ${currentTracerPosition.y})`}
            className="transition-transform"
          >
            <circle
              r="16"
              fill="#ec4899"
              fillOpacity="0.25"
              className="animate-ping"
            />
            <circle
              r="14"
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="shadow-lg"
            />
            <text
              x="0"
              y="1"
              fontSize="14"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {activeMember.avatar}
            </text>
          </g>
        )}
      </svg>

      {/* 하단 목표 칸들 (Goal Boxes) */}
      <div className="flex items-center pt-2 select-none" style={{ width: totalSvgWidth }}>
        {Array.from({ length: cols }).map((_, colIdx) => {
          const goal = ladderGoals[colIdx] || { text: '통과', icon: '💨' };
          const revealedInfo = revealedGoalCols[colIdx];
          const hasRevealed = !!revealedInfo || !!ladderResult;

          return (
            <div
              key={`goal-${colIdx}`}
              style={{ width: colWidth }}
              className="flex flex-col items-center justify-center shrink-0 px-1"
            >
              <button
                type="button"
                onClick={() => onGoalColClick(colIdx)}
                className={`w-[76px] py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs ${
                  hasRevealed
                    ? goal.icon === '🎁' || goal.text.includes('당첨') || goal.text.includes('1등')
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 scale-105'
                      : 'bg-slate-100 dark:bg-zinc-800/80 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-300'
                    : resolvedTheme === 'dawn'
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900 hover:bg-blue-100/90'
                    : isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                }`}
                title="클릭하여 목표 수정 또는 결과 확인"
              >
                <span className="text-base">{goal.icon}</span>
                <span className="text-[11px] font-bold truncate max-w-full text-center mt-0.5">
                  {goal.text}
                </span>

                {revealedInfo && (
                  <div className="mt-1 pt-1 border-t border-black/10 dark:border-white/10 flex items-center gap-1">
                    <span className="text-xs">{revealedInfo.avatar}</span>
                    <span className="text-[10px] font-black truncate max-w-[42px]">
                      {revealedInfo.memberName}
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
