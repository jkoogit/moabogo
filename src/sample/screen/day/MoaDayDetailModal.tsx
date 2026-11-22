// ==========================================
// src/sample/screen/day/MoaDayDetailModal.tsx
// 일기 및 일정 대형 상세 확대보기 팝업 모달
// ==========================================

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bookmark,
  Clock,
  MapPin,
  Tag,
  ChevronDown,
  ChevronUp,
  FolderArchive,
  Download,
  Mic,
  Image as ImageIcon,
  File,
  Play,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { ElmMkdViewer } from '../../elements/Tokens';
import { CalendarEventItem, DiaryEntry, AttachedMediaItem } from './types';

interface MoaDayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  diary?: DiaryEntry;
  events: CalendarEventItem[];
  onPlayAudio?: (item: AttachedMediaItem) => void;
  onViewDoc?: (item: AttachedMediaItem) => void;
  onDownloadItem?: (item: AttachedMediaItem) => void;
  onDownloadAllZip?: () => void;
  onOpenCreateDiary?: () => void;
  onOpenCreatePlan?: () => void;
}

export const MoaDayDetailModal: React.FC<MoaDayDetailModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onDateChange,
  diary,
  events,
  onPlayAudio,
  onViewDoc,
  onDownloadItem,
  onDownloadAllZip,
  onOpenCreateDiary,
  onOpenCreatePlan,
}) => {
  if (!isOpen) return null;

  // 태그별 탭 선택 상태 ('ALL' 또는 특정 태그명)
  const [activeTagTab, setActiveTagTab] = useState<string>('ALL');
  // 태그별 아코디언 접기 상태
  const [collapsedTags, setCollapsedTags] = useState<Record<string, boolean>>({});

  // 롱프레스 파일명 전체 표시 상태 (요구사항 3)
  const [longPressedName, setLongPressedName] = useState<string | null>(null);
  const longPressTimerRef = React.useRef<any>(null);

  const handleTouchStart = (name: string) => {
    longPressTimerRef.current = setTimeout(() => {
      setLongPressedName(name);
      setTimeout(() => setLongPressedName(null), 3000);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // 일자 이전/다음 이동 핸들러
  const handlePrevDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() - 1);
    const yStr = dt.getFullYear();
    const mStr = String(dt.getMonth() + 1).padStart(2, '0');
    const dStr = String(dt.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const parts = selectedDate.split('-').map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    dt.setDate(dt.getDate() + 1);
    const yStr = dt.getFullYear();
    const mStr = String(dt.getMonth() + 1).padStart(2, '0');
    const dStr = String(dt.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const toggleTagCollapse = (tag: string) => {
    setCollapsedTags((prev) => ({ ...prev, [tag]: !prev[tag] }));
  };

  const allTags = diary?.keywordTags || [];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 text-xs text-slate-800 dark:text-zinc-200">
        {/* 상단 고정 헤더 (날짜 좌우 이동, 날짜선택기, 닫기 버튼 고정 - 요구사항 4-b, 5-c) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </span>
            {/* 일자 좌우 이동 네비게이션 & Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                title="이전 날짜 이동"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="px-2 py-0.5 rounded-md font-black text-sm bg-transparent border-none text-slate-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
              />
              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                title="다음 날짜 이동"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hidden sm:inline">
              상세 확대 뷰어
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 2열 분할 스크롤 영역 (좌측: 당일 일정 / 우측: 스마트 일기) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* ============================================================ */}
          {/* 좌측 컬럼: 당일 등록 일정 & 할일 목록 (md: col-span-5) */}
          {/* ============================================================ */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>당일 등록 일정 ({events.length}건)</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreatePlan?.();
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + 일정 추가
              </button>
            </div>

            {events.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-slate-400">
                등록된 일정이 없습니다.
              </div>
            ) : (
              <div className="space-y-2.5">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/80 dark:border-zinc-700/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          style={{ backgroundColor: evt.color }}
                          className="w-2 h-2 rounded-full shrink-0"
                        />
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs truncate">
                          {evt.sticker && <span className="mr-1">{evt.sticker}</span>}
                          {evt.title}
                        </span>
                      </div>
                      <span
                        style={{ color: evt.color }}
                        className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 shrink-0 shadow-2xs"
                      >
                        {evt.serviceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{evt.startTime ? `${evt.startTime} ~ ${evt.endTime || ''}` : '종일'}</span>
                      {evt.location && <span>• 📍 {evt.location}</span>}
                      {evt.isImportant && <span className="text-rose-500 font-bold">• 중요 ⭐</span>}
                    </div>

                    {evt.amount && (
                      <p className="text-xs font-black text-sky-600 dark:text-sky-400">
                        금액: {evt.amount.toLocaleString()}원
                      </p>
                    )}
                    {evt.description && (
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed pt-1 border-t border-slate-200/50 dark:border-zinc-700/50">
                        {evt.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* 우측 컬럼: 스마트 다이어리 에피소드 & 미디어 (md: col-span-7) */}
          {/* ============================================================ */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-500" />
                <span>스마트 다이어리 에피소드</span>
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateDiary?.();
                }}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {diary ? '수정' : '등록'}
              </button>
            </div>

            {diary ? (
              <div className="space-y-4">
                {/* 메타 요약 바 */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-zinc-800/60 border border-amber-200/70 dark:border-zinc-700 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{diary.moodEmoji}</span>
                    <span className="text-xl">{diary.weatherEmoji}</span>
                    {diary.weather && (
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {diary.weather}
                      </span>
                    )}
                    {diary.location && (
                      <span className="text-xs text-slate-500 flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{diary.location}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{diary.updatedAt}</span>
                </div>

                {/* 태그 모드 스위처 [전체보기] vs [태그별 탭] (요구사항 5-a,b) */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> 열람:
                    </span>
                    <button
                      onClick={() => setActiveTagTab('ALL')}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        activeTagTab === 'ALL'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                    >
                      전체보기
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTagTab(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                          activeTagTab === tag
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3줄 요약 및 마크다운 본문 렌더링 영역 (전체보기 시 공통 + 태그별 에피소드 전수 표시 - 요구사항 6) */}
                {activeTagTab === 'ALL' ? (
                  <div className="space-y-4">
                    {/* 공통 3줄 일기 */}
                    {diary.threeLines && (diary.threeLines.event || diary.threeLines.thought) && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-amber-200/80 dark:border-zinc-700 space-y-1.5">
                        <h5 className="font-bold text-amber-600 dark:text-amber-400 text-xs mb-1">
                          📝 오늘의 공통 3줄 요약
                        </h5>
                        {diary.threeLines.event && (
                          <p>
                            <span className="font-bold text-slate-500">사건: </span>
                            {diary.threeLines.event}
                          </p>
                        )}
                        {diary.threeLines.thought && (
                          <p>
                            <span className="font-bold text-slate-500">느낌: </span>
                            {diary.threeLines.thought}
                          </p>
                        )}
                        {diary.threeLines.tomorrow && (
                          <p>
                            <span className="font-bold text-slate-500">내일: </span>
                            {diary.threeLines.tomorrow}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 공통 마크다운 본문 */}
                    {diary.contentMarkdown && (
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                        <span className="text-[11px] font-bold text-slate-400 block mb-2">
                          📄 공통 본문
                        </span>
                        <ElmMkdViewer content={diary.contentMarkdown} />
                      </div>
                    )}

                    {/* 태그별 에피소드 전수 열거 */}
                    {diary.taggedBlocks && diary.taggedBlocks.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                          🏷️ 태그별 에피소드 ({diary.taggedBlocks.length}개)
                        </span>
                        {diary.taggedBlocks.map((block) => (
                          <div
                            key={block.tag}
                            className="p-3.5 rounded-2xl bg-indigo-50/40 dark:bg-zinc-800/40 border border-indigo-200/60 dark:border-zinc-700 space-y-2"
                          >
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs block">
                              {block.tag} 에피소드
                            </span>
                            {block.threeLines && (block.threeLines.event || block.threeLines.thought) && (
                              <div className="text-xs space-y-1 pl-2 border-l-2 border-indigo-300 dark:border-indigo-600">
                                {block.threeLines.event && (
                                  <div>
                                    <strong className="text-slate-600 dark:text-zinc-400">사건:</strong> {block.threeLines.event}
                                  </div>
                                )}
                                {block.threeLines.thought && (
                                  <div>
                                    <strong className="text-slate-600 dark:text-zinc-400">느낌:</strong> {block.threeLines.thought}
                                  </div>
                                )}
                                {block.threeLines.tomorrow && (
                                  <div>
                                    <strong className="text-slate-600 dark:text-zinc-400">다짐:</strong> {block.threeLines.tomorrow}
                                  </div>
                                )}
                              </div>
                            )}
                            {block.contentMarkdown && (
                              <div className="pt-1 text-xs">
                                <ElmMkdViewer content={block.contentMarkdown} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* 단일 선택 태그 에피소드 */
                  (() => {
                    const targetBlock = diary.taggedBlocks?.find((b) => b.tag === activeTagTab);
                    if (!targetBlock) {
                      return (
                        <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700 text-center text-xs text-slate-400">
                          [{activeTagTab}] 전용 에피소드가 작성되지 않았습니다.
                        </div>
                      );
                    }

                    return (
                      <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-zinc-800/40 border border-indigo-200/60 dark:border-zinc-700 space-y-3">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs block">
                          🏷️ [{targetBlock.tag}] 에피소드
                        </span>
                        {targetBlock.threeLines && (targetBlock.threeLines.event || targetBlock.threeLines.thought) && (
                          <div className="text-xs space-y-1 pl-2 border-l-2 border-indigo-300 dark:border-indigo-600">
                            {targetBlock.threeLines.event && (
                              <div>
                                <strong className="text-slate-600 dark:text-zinc-400">사건:</strong> {targetBlock.threeLines.event}
                              </div>
                            )}
                            {targetBlock.threeLines.thought && (
                              <div>
                                <strong className="text-slate-600 dark:text-zinc-400">느낌:</strong> {targetBlock.threeLines.thought}
                              </div>
                            )}
                            {targetBlock.threeLines.tomorrow && (
                              <div>
                                <strong className="text-slate-600 dark:text-zinc-400">다짐:</strong> {targetBlock.threeLines.tomorrow}
                              </div>
                            )}
                          </div>
                        )}
                        {targetBlock.contentMarkdown && (
                          <div className="pt-1 text-xs">
                            <ElmMkdViewer content={targetBlock.contentMarkdown} />
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}

                {/* 첨부 리소스 뷰어 & 다운로드 허브 */}
                {diary.attachedMedia && diary.attachedMedia.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <FolderArchive className="w-4 h-4 text-indigo-500" />
                        <span>첨부된 미디어 리소스 ({diary.attachedMedia.length}개)</span>
                      </span>
                      <button
                        onClick={onDownloadAllZip}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>전체받기</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {diary.attachedMedia.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {m.type === 'AUDIO' && <Mic className="w-4 h-4 text-rose-500 shrink-0" />}
                            {m.type === 'IMAGE' && <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />}
                            {m.type === 'DOCUMENT' && <File className="w-4 h-4 text-amber-500 shrink-0" />}
                            <span
                              onTouchStart={() => handleTouchStart(m.name)}
                              onTouchEnd={handleTouchEnd}
                              onTouchCancel={handleTouchEnd}
                              title={`${m.name} (길게 누르면 전체 표시)`}
                              className="font-medium truncate max-w-[140px] cursor-help select-none"
                            >
                              {m.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {m.type === 'AUDIO' && (
                              <button
                                onClick={() => onPlayAudio?.(m)}
                                className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Play className="w-3 h-3 fill-current" /> 재생
                              </button>
                            )}
                            {m.type === 'DOCUMENT' && (
                              <button
                                onClick={() => onViewDoc?.(m)}
                                className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[10px] font-bold flex items-center gap-0.5"
                              >
                                <Eye className="w-3 h-3" /> 열기
                              </button>
                            )}
                            <button
                              onClick={() => onDownloadItem?.(m)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                              title="다운로드"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-slate-400">
                작성된 스마트 다이어리가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 롱프레스 파일명 플로팅 토스트/툴팁 (요구사항 3) */}
      {longPressedName && (
        <div
          onClick={() => setLongPressedName(null)}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-70 px-4 py-2 rounded-xl bg-slate-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 text-xs font-bold shadow-2xl border border-slate-700 animate-in fade-in duration-150 cursor-pointer"
        >
          <span>📎 {longPressedName}</span>
        </div>
      )}
    </div>
  );
};
