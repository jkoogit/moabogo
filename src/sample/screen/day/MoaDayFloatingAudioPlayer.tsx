// ==========================================
// src/sample/screen/day/MoaDayFloatingAudioPlayer.tsx
// 플로팅 오디오 플레이어 (통화녹음 재생기)
// ==========================================

import React from 'react';
import { Volume2, X, Play, Pause } from 'lucide-react';

interface MoaDayFloatingAudioPlayerProps {
  playingAudio: {
    name: string;
    duration: string;
    isPlaying: boolean;
    currentTime: number;
    totalTime: number;
    playbackRate: number;
  } | null;
  onTogglePlay: () => void;
  onRateChange: () => void;
  onClose: () => void;
}

export const MoaDayFloatingAudioPlayer: React.FC<MoaDayFloatingAudioPlayerProps> = ({
  playingAudio,
  onTogglePlay,
  onRateChange,
  onClose,
}) => {
  if (!playingAudio) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[420px] z-50 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 animate-in slide-in-from-bottom duration-200 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
            <Volume2 className="w-4 h-4" />
          </span>
          <div className="truncate">
            <p className="text-xs font-bold truncate">{playingAudio.name}</p>
            <p className="text-[10px] text-slate-400">재생 중 ({playingAudio.duration})</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 재생 시크바 & 컨트롤 */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-transform active:scale-95"
        >
          {playingAudio.isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">03:45</span>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="25"
            className="flex-1 accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] text-slate-400 font-mono">{playingAudio.duration}</span>
        </div>

        <button
          onClick={onRateChange}
          className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-rose-400 border border-slate-700"
        >
          {playingAudio.playbackRate}x
        </button>
      </div>
    </div>
  );
};
