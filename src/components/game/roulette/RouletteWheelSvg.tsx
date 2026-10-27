import React from 'react';
import { RotateCcw } from 'lucide-react';
import { RouletteSlice } from './types';

export interface RouletteWheelSvgProps {
  slices: RouletteSlice[];
  rotation: number;
  duration: number;
  isSpinning: boolean;
  onCenterClick: () => void;
}

const SLICE_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f43f5e',
];

export const RouletteWheelSvg: React.FC<RouletteWheelSvgProps> = ({
  slices,
  rotation,
  duration,
  isSpinning,
  onCenterClick,
}) => {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center select-none my-2">
      {/* 상단 핀 인디케이터 (틱 튕김 애니메이션) */}
      <div
        className={`absolute -top-4 z-30 filter drop-shadow-md transition-transform ${
          isSpinning ? 'animate-bounce scale-110' : ''
        }`}
      >
        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-600" />
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs mx-auto -mt-6 border border-rose-600" />
      </div>

      {/* 룰렛 회전 SVG 휠 */}
      <svg
        viewBox="-100 -100 200 200"
        className="w-full h-full rounded-full shadow-2xl transition-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.12, 0.88, 0.24, 1.0)',
        }}
      >
        {slices.map((slice, i) => {
          const startRad = (slice.startAngle * Math.PI) / 180;
          const endRad = (slice.endAngle * Math.PI) / 180;
          const x1 = 100 * Math.cos(startRad);
          const y1 = 100 * Math.sin(startRad);
          const x2 = 100 * Math.cos(endRad);
          const y2 = 100 * Math.sin(endRad);
          const largeArc = slice.angle > 180 ? 1 : 0;
          const pathData = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;
          const midAngle = (slice.startAngle + slice.endAngle) / 2;
          const midRad = (midAngle * Math.PI) / 180;
          const textX = 64 * Math.cos(midRad);
          const textY = 64 * Math.sin(midRad);
          const fill = SLICE_COLORS[i % SLICE_COLORS.length];

          return (
            <g key={slice.item.id}>
              <path
                d={pathData}
                fill={fill}
                stroke="#ffffff"
                strokeWidth="2.5"
                className="transition-colors"
              />
              {/* 슬라이스 텍스트 및 이모지 */}
              <text
                x={textX}
                y={textY}
                fill="#ffffff"
                fontSize={slice.angle < 30 ? '11' : '13'}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
              >
                {slice.item.avatar} {slice.angle >= 35 ? slice.item.name.slice(0, 5) : ''}
              </text>
            </g>
          );
        })}

        {/* 룰렛 중심 원: 즉시 재실행 버튼 */}
        <g
          onClick={onCenterClick}
          className="cursor-pointer group select-none"
          role="button"
          aria-label="룰렛 즉시 재실행 (다시 돌리기)"
        >
          <circle
            cx="0"
            cy="0"
            r="25"
            fill="#0f172a"
            stroke="#ffffff"
            strokeWidth="3"
            className="transition-transform group-hover:scale-105 active:scale-95"
          />
          <circle cx="0" cy="0" r="22" fill="#1e293b" />
          <text
            x="0"
            y="-4"
            fill="#38bdf8"
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none select-none tracking-tighter"
          >
            SPIN
          </text>
          <text
            x="0"
            y="7"
            fill="#94a3b8"
            fontSize="7"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none select-none tracking-tight"
          >
            RESTART
          </text>
        </g>
      </svg>
    </div>
  );
};
