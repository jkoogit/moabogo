// ==========================================
// src/sample/screen/day/MoaDayUnifiedCreateModal.tsx
// 네이버 스타일 통합 작성 모달 (일기 블록구조화 & 반복모달 연계)
// ==========================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Bookmark,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCw,
  X,
  Plus,
} from 'lucide-react';
import { ElmBsh01, ElmMkd01 } from '../../elements/Tokens';
import {
  CalendarEventItem,
  DiaryEntry,
  AttachedMediaItem,
  ServiceType,
  RecurrenceRule,
} from './types';
import { MoaDayRecurrenceModal } from './MoaDayRecurrenceModal';

// PWA 시뮬레이션용 감지 리소스 풀
const DETECTED_MOBILE_RESOURCES: AttachedMediaItem[] = [
  {
    id: 'res-img-1',
    type: 'IMAGE',
    name: '20261122_회의실풍경.jpg',
    size: '3.1 MB',
    timestamp: '14:15 (역삼역)',
    imageRatio: 'WIDE',
    imageToggle: 'EXPANDED',
  },
  {
    id: 'res-img-2',
    type: 'IMAGE',
    name: '20261122_점심메뉴_파스타.jpg',
    size: '2.4 MB',
    timestamp: '12:30 (강남역)',
    imageRatio: 'SQUARE',
    imageToggle: 'EXPANDED',
  },
  {
    id: 'res-aud-1',
    type: 'AUDIO',
    name: '통화녹음_김대리_20261122_1420.m4a',
    size: '7.2 MB',
    duration: '15:32',
    timestamp: '14:20',
  },
  {
    id: 'res-aud-2',
    type: 'AUDIO',
    name: '통화녹음_박부장_20261122_1640.m4a',
    size: '4.8 MB',
    duration: '09:40',
    timestamp: '16:40',
  },
  {
    id: 'res-doc-1',
    type: 'DOCUMENT',
    name: '2026-11-22_식대영수증_파스타.pdf',
    size: '1.2 MB',
    timestamp: '12:45',
  },
  {
    id: 'res-doc-2',
    type: 'DOCUMENT',
    name: '모아데이_기능요구서_v1.0.pdf',
    size: '4.5 MB',
    timestamp: '17:10',
  },
];

interface MoaDayUnifiedCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
  defaultTab: 'DIARY' | 'PLAN';
  existingDiary?: DiaryEntry;
  onSavePlan: (newEvent: CalendarEventItem) => void;
  onSaveDiary: (newDiary: DiaryEntry) => void;
  onNotify: (msg: string) => void;
}

export const MoaDayUnifiedCreateModal: React.FC<MoaDayUnifiedCreateModalProps> = ({
  isOpen,
  onClose,
  targetDate,
  defaultTab,
  existingDiary,
  onSavePlan,
  onSaveDiary,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'DIARY' | 'PLAN'>(defaultTab);

  // 날짜 선택기 (작성일자 소급/변경 지원)
  const [customDiaryDate, setCustomDiaryDate] = useState<string>(targetDate);

  // 일기 폼 상태 - 구조적 블록 아코디언
  const [blockKeywordsOpen, setBlockKeywordsOpen] = useState<boolean>(true);
  const [blockThreeLinesOpen, setBlockThreeLinesOpen] = useState<boolean>(true);
  const [blockMarkdownOpen, setBlockMarkdownOpen] = useState<boolean>(true);

  const [diaryMood, setDiaryMood] = useState<string>('🌟');
  const [diaryWeather, setDiaryWeather] = useState<string>('☀️');
  const [diaryWeatherText, setDiaryWeatherText] = useState<string>('맑음 (18℃)');
  const [diaryLocation, setDiaryLocation] = useState<string>('서울 강남구 역삼동');
  const [diaryKeywords, setDiaryKeywords] = useState<string>('#모아데이 #계획완료');
  const [diaryThreeLines, setDiaryThreeLines] = useState({ event: '', thought: '', tomorrow: '' });
  const [diaryMarkdown, setDiaryMarkdown] = useState<string>('');
  const [attachedMedia, setAttachedMedia] = useState<AttachedMediaItem[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // 마크다운 textarea 커서 참조
  const markdownTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // PWA 리소스 스캔 상태
  const [scannedResources, setScannedResources] = useState<AttachedMediaItem[]>([]);
  const [selectedScanIds, setSelectedScanIds] = useState<Record<string, boolean>>({});
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // 계획 폼 상태 (네이버 캘린더 스타일)
  const [planTitle, setPlanTitle] = useState<string>('');
  const [planIsImportant, setPlanIsImportant] = useState<boolean>(false);
  const [planIsPrivate, setPlanIsPrivate] = useState<boolean>(false);
  const [planStartDate, setPlanStartDate] = useState<string>(targetDate);
  const [planStartTime, setPlanStartTime] = useState<string>('19:30');
  const [planEndDate, setPlanEndDate] = useState<string>(targetDate);
  const [planEndTime, setPlanEndTime] = useState<string>('20:30');
  const [planIsAllDay, setPlanIsAllDay] = useState<boolean>(false);
  const [planLocation, setPlanLocation] = useState<string>('');
  const [planServiceType, setPlanServiceType] = useState<ServiceType>('PERSONAL');
  const [planSticker, setPlanSticker] = useState<string>('📌');
  const [planDescription, setPlanDescription] = useState<string>('');
  const [planNotification, setPlanNotification] = useState<string>('10M_BEFORE');

  // 상세 반복 설정 모달 상태
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState<boolean>(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(null);

  // 초기화
  useEffect(() => {
    setActiveTab(defaultTab);
    setCustomDiaryDate(targetDate);
    setPlanStartDate(targetDate);
    setPlanEndDate(targetDate);

    if (existingDiary) {
      setDiaryMood(existingDiary.moodEmoji);
      setDiaryWeather(existingDiary.weatherEmoji);
      setDiaryWeatherText(existingDiary.weather || '맑음');
      setDiaryLocation(existingDiary.location || '서울시');
      setDiaryKeywords(existingDiary.keywordTags.join(' '));
      setDiaryThreeLines(existingDiary.threeLines);
      setDiaryMarkdown(existingDiary.contentMarkdown);
      setAttachedMedia(existingDiary.attachedMedia || []);
    } else {
      setDiaryMood('🌟');
      setDiaryWeather('☀️');
      setDiaryWeatherText('맑음 (18℃)');
      setDiaryLocation('서울 강남구 역삼동');
      setDiaryKeywords('#일상 #기록');
      setDiaryThreeLines({ event: '', thought: '', tomorrow: '' });
      setDiaryMarkdown('');
      setAttachedMedia([]);
    }
  }, [isOpen, targetDate, defaultTab, existingDiary]);

  // 브라우저 위치 & 기상 자동 수집 (정책 5: 부가 기능 및 수동 수정 허용)
  const handleFetchLocationAndWeather = () => {
    if (!navigator.geolocation) {
      onNotify('브라우저가 GPS 위치를 지원하지 않아 기본 지역으로 설정합니다.');
      setDiaryLocation('서울 중구 명동');
      setDiaryWeatherText('맑음 (17℃)');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(2);
        const lon = pos.coords.longitude.toFixed(2);
        setDiaryLocation(`현재 위치 (위도 ${lat}, 경도 ${lon})`);
        setDiaryWeatherText('맑음, 체감 19℃');
        setDiaryWeather('☀️');
        onNotify('📍 현재 GPS 위치 및 당일 기상 정보를 자동 수집했습니다.');
      },
      (_err) => {
        setIsLocating(false);
        onNotify('위치 권한이 허용되지 않아 기본 지역(서울)으로 반영합니다.');
        setDiaryLocation('서울 강남구');
        setDiaryWeatherText('맑음 (18℃)');
      },
      { timeout: 5000 }
    );
  };

  // 마크다운 커서 위치 템플릿 스마트 삽입 ($O(1)$ 무부하 성능 검토 반영)
  const handleInsertTemplateAtCursor = (templateContent: string, templateName: string) => {
    const el = markdownTextareaRef.current;
    if (!el) {
      // 텍스트에어리어가 직접 잡히지 않을 때 단순 append
      setDiaryMarkdown((prev) => (prev ? `${prev}\n\n${templateContent}` : templateContent));
      onNotify(`[${templateName}] 서식을 본문에 추가했습니다.`);
      return;
    }

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const val = el.value;

    const before = val.substring(0, start);
    const after = val.substring(end);
    const insertText = before.length > 0 && !before.endsWith('\n') ? `\n\n${templateContent}` : templateContent;

    const nextVal = before + insertText + after;
    setDiaryMarkdown(nextVal);

    // 삽입 후 포커스 및 캐럿 복원
    setTimeout(() => {
      el.focus();
      const newPos = start + insertText.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);

    onNotify(`커서 위치에 [${templateName}] 서식을 쏙 삽입했습니다.`);
  };

  // PWA 모바일 리소스 스캔 실행
  const handleScanMobileResources = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResources(DETECTED_MOBILE_RESOURCES);
      const initialSelected: Record<string, boolean> = {};
      DETECTED_MOBILE_RESOURCES.forEach((r) => {
        initialSelected[r.id] = true;
      });
      setSelectedScanIds(initialSelected);
      onNotify(`📱 선택된 일자(${customDiaryDate})의 모바일 활동 리소스 6건을 감지했습니다.`);
    }, 500);
  };

  // 스캔된 리소스 일기 본문에 취합 배치
  const handleInsertResourcesToDiary = () => {
    const selectedItems = scannedResources.filter((r) => selectedScanIds[r.id]);
    if (selectedItems.length === 0) {
      onNotify('배치할 리소스를 선택해주세요.');
      return;
    }

    let appendMd = `\n\n#### 📱 하루 활동 기록 취합 (${customDiaryDate})\n`;
    selectedItems.forEach((item) => {
      if (item.type === 'AUDIO') {
        appendMd += `- 🎙️ **통화녹음**: \`${item.name}\` (${item.duration || '재생가능'})\n`;
      } else if (item.type === 'IMAGE') {
        appendMd += `- 📷 **사진**: \`${item.name}\` (${item.timestamp || '촬영'})\n`;
      } else if (item.type === 'DOCUMENT') {
        appendMd += `- 📁 **문서**: \`${item.name}\` (${item.size || '첨부'})\n`;
      }
    });

    setDiaryMarkdown((prev) => (prev ? prev + appendMd : appendMd.trim()));
    setAttachedMedia((prev) => [...prev, ...selectedItems]);
    onNotify(`${selectedItems.length}개 리소스가 일기 본문에 취합 배치되었습니다.`);
  };

  // 일기 저장
  const handleSaveDiarySubmit = () => {
    const rawTags = diaryKeywords
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    const newDiary: DiaryEntry = {
      id: `dia-${customDiaryDate}`,
      date: customDiaryDate,
      mode: 'STRUCTURAL',
      moodEmoji: diaryMood,
      weatherEmoji: diaryWeather,
      weather: diaryWeatherText,
      location: diaryLocation,
      keywordTags: rawTags,
      threeLines: diaryThreeLines,
      contentMarkdown: diaryMarkdown,
      attachedMedia,
      hasKeywords: blockKeywordsOpen && rawTags.length > 0,
      hasThreeLines: blockThreeLinesOpen && !!(diaryThreeLines.event || diaryThreeLines.thought),
      hasMarkdown: blockMarkdownOpen && !!diaryMarkdown.trim(),
      updatedAt: new Date().toLocaleDateString('ko-KR'),
    };
    onSaveDiary(newDiary);
  };

  // 계획 저장
  const handleSavePlanSubmit = () => {
    if (!planTitle.trim()) {
      onNotify('계획 제목을 입력해주세요.');
      return;
    }

    const newEvt: CalendarEventItem = {
      id: `evt-${Date.now()}`,
      title: planTitle,
      date: planStartDate,
      startTime: planIsAllDay ? undefined : planStartTime,
      endTime: planIsAllDay ? undefined : planEndTime,
      isAllDay: planIsAllDay,
      serviceType: planServiceType,
      itemSubtype: 'PERSONAL_PLAN',
      color:
        planServiceType === 'GOAL'
          ? '#0d9488'
          : planServiceType === 'DUTY'
          ? '#d946ef'
          : planServiceType === 'ROUTINE'
          ? '#8b5cf6'
          : '#4f46e5',
      location: planLocation,
      isImportant: planIsImportant,
      isPrivate: planIsPrivate,
      sticker: planSticker,
      description: planDescription,
      recurrenceRule: recurrenceRule || undefined,
    };
    onSavePlan(newEvt);
  };

  return (
    <>
      <ElmBsh01
        isOpen={isOpen}
        onClose={onClose}
        title={`${targetDate} 일정 및 일기 등록`}
        badge="통합 등록 허브"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 pt-1 pb-8 text-xs text-slate-900 dark:text-zinc-100">
          {/* 상단 듀얼 탭: [📝 일기 쓰기] vs [📅 계획 / 할일 등록] (명칭 표준화) */}
          <div className="flex items-center border-b border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('DIARY')}
              className={`flex-1 py-3 text-center text-sm font-extrabold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'DIARY'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>📝 일기 쓰기 (스마트 다이어리)</span>
            </button>
            <button
              onClick={() => setActiveTab('PLAN')}
              className={`flex-1 py-3 text-center text-sm font-extrabold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'PLAN'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>📅 계획 / 할일 등록</span>
            </button>
          </div>

          {/* ========================================== */}
          {/* 탭 A: 일기 쓰기 모드 (구조적 블록 아코디언) */}
          {/* ========================================== */}
          {activeTab === 'DIARY' && (
            <div className="space-y-4 pt-2">
              {/* 메타 바: 작성 일자 선택, 기분, 날씨/위치 수집 및 직접 편집 */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-zinc-800/60 border border-amber-200/70 dark:border-zinc-700 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  {/* 날짜 선택 */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">작성일:</span>
                    <input
                      type="date"
                      value={customDiaryDate}
                      onChange={(e) => setCustomDiaryDate(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 font-bold text-xs"
                    />
                  </div>

                  {/* 기분 이모지 선택 */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">기분:</span>
                    {['🌟', '😊', '☕', '🔥', '💧', '😴'].map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setDiaryMood(emo)}
                        className={`text-base p-1 rounded-lg transition-transform ${
                          diaryMood === emo ? 'scale-125 bg-amber-200/70 dark:bg-amber-950/80' : 'opacity-60'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 위치 & 날씨 수집 바 (GPS 버튼 + 수동 편집 인풋) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/50 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={handleFetchLocationAndWeather}
                    disabled={isLocating}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{isLocating ? '위치/날씨 수집 중...' : '📍 위치/날씨 자동수집'}</span>
                  </button>

                  <input
                    type="text"
                    value={diaryLocation}
                    onChange={(e) => setDiaryLocation(e.target.value)}
                    placeholder="위치 직접 입력 (예: 서울 강남구)"
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] font-medium flex-1 min-w-[120px]"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    {['☀️', '⛅', '🌧️', '❄️', '☕'].map((wEmo) => (
                      <button
                        key={wEmo}
                        type="button"
                        onClick={() => setDiaryWeather(wEmo)}
                        className={`p-1 rounded-md text-sm ${
                          diaryWeather === wEmo ? 'bg-amber-200/80 dark:bg-zinc-700' : 'opacity-50'
                        }`}
                      >
                        {wEmo}
                      </button>
                    ))}
                    <input
                      type="text"
                      value={diaryWeatherText}
                      onChange={(e) => setDiaryWeatherText(e.target.value)}
                      placeholder="날씨 요약"
                      className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* PWA 하루 모바일 활동 리소스 자동 스캔 (명칭 변경) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/70 to-indigo-50/70 dark:from-zinc-800 dark:to-zinc-800 border border-sky-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-sky-500 text-white text-xs">📱</span>
                    <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-xs">
                      하루 모바일 활동 리소스 자동 스캔
                    </span>
                  </div>
                  <button
                    onClick={handleScanMobileResources}
                    disabled={isScanning}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  >
                    {isScanning ? '스캔 중...' : '스캔하기'}
                  </button>
                </div>

                {scannedResources.length > 0 && (
                  <div className="mt-2 space-y-2 pt-2 border-t border-sky-200/50 dark:border-zinc-700">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>감지된 활동 리소스 ({scannedResources.length}건)</span>
                      <button
                        onClick={handleInsertResourcesToDiary}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                      >
                        [선택 항목 일기에 취합 배치]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {scannedResources.map((res) => (
                        <label
                          key={res.id}
                          className="p-2 rounded-lg bg-white dark:bg-zinc-700/60 border border-slate-200 dark:border-zinc-600 flex items-center gap-2 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={!!selectedScanIds[res.id]}
                            onChange={(e) =>
                              setSelectedScanIds((prev) => ({ ...prev, [res.id]: e.target.checked }))
                            }
                            className="rounded text-indigo-600"
                          />
                          <span className="truncate flex-1 font-medium">{res.name}</span>
                          <span className="text-[10px] text-slate-400">{res.size || res.duration}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================== */}
              {/* 블록 1: 해시태그 키워드 (토글형 아코디언) */}
              {/* ========================================== */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBlockKeywordsOpen((prev) => !prev)}
                  className="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-zinc-800/70 flex items-center justify-between font-bold text-xs hover:bg-slate-200/50"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🏷️ 1. 해시태그 키워드 블록</span>
                    <span className="text-[10px] text-slate-400 font-normal">(10초 압축 요약)</span>
                  </span>
                  {blockKeywordsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {blockKeywordsOpen && (
                  <div className="p-3.5 space-y-2 bg-white dark:bg-zinc-900">
                    <input
                      type="text"
                      value={diaryKeywords}
                      onChange={(e) => setDiaryKeywords(e.target.value)}
                      placeholder="#운동 #가족모임 #개발성공"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* ========================================== */}
              {/* 블록 2: 3줄 일기 블록 (토글형 아코디언) */}
              {/* ========================================== */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBlockThreeLinesOpen((prev) => !prev)}
                  className="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-zinc-800/70 flex items-center justify-between font-bold text-xs hover:bg-slate-200/50"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📝 2. 3줄 일기 블록</span>
                    <span className="text-[10px] text-slate-400 font-normal">(사건 - 느낌 - 내일의 다짐)</span>
                  </span>
                  {blockThreeLinesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {blockThreeLinesOpen && (
                  <div className="p-3.5 space-y-2.5 bg-white dark:bg-zinc-900">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        1. 오늘 일어난 중요한 사건
                      </span>
                      <input
                        type="text"
                        value={diaryThreeLines.event}
                        onChange={(e) => setDiaryThreeLines((p) => ({ ...p, event: e.target.value }))}
                        placeholder="예) 모아데이 화면 설계와 9대 UX 고도화 완성"
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        2. 나의 생각과 느낌
                      </span>
                      <input
                        type="text"
                        value={diaryThreeLines.thought}
                        onChange={(e) => setDiaryThreeLines((p) => ({ ...p, thought: e.target.value }))}
                        placeholder="예) 기획과 개발의 연결고리가 탄탄해져서 매우 뿌듯하다."
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">
                        3. 내일의 다짐 / 목표
                      </span>
                      <input
                        type="text"
                        value={diaryThreeLines.tomorrow}
                        onChange={(e) => setDiaryThreeLines((p) => ({ ...p, tomorrow: e.target.value }))}
                        placeholder="예) 정적 검증 완료하고 원격 dev/stg/main 브랜치에 배포 승급하기."
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* 블록 3: 마크다운 서술 에디터 (커서 위치 템플릿 스마트 삽입) */}
              {/* ============================================================ */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBlockMarkdownOpen((prev) => !prev)}
                  className="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-zinc-800/70 flex items-center justify-between font-bold text-xs hover:bg-slate-200/50"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📄 3. 자유 마크다운 서술 블록</span>
                    <span className="text-[10px] text-slate-400 font-normal">(템플릿 프리셋 지원)</span>
                  </span>
                  {blockMarkdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {blockMarkdownOpen && (
                  <div className="p-3.5 space-y-2 bg-white dark:bg-zinc-900">
                    {/* 상단 템플릿 프리셋 바 (onMouseDown preventDefault로 커서 보존) */}
                    <div className="flex items-center gap-1.5 flex-wrap pb-1.5 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">커서 서식 추가:</span>
                      {[
                        {
                          name: '✨ 감사 일기',
                          content:
                            '##### ✨ 오늘의 감사 3가지\n1. \n2. \n3. \n\n> 작은 것에도 감사하는 하루!',
                        },
                        {
                          name: '🔄 KPT 회고',
                          content:
                            '##### 🔄 KPT 업무/학습 회고\n- **Keep**: 잘해서 유지할 점\n- **Problem**: 아쉬웠던 점\n- **Try**: 내일 새롭게 시도할 점',
                        },
                        {
                          name: '💰 가계부 회고',
                          content:
                            '##### 💰 오늘의 소비 점검\n- **가장 만족한 지출**: \n- **아쉬웠던 낭비**: \n- **내일의 지출 한도**: ',
                        },
                        {
                          name: '🏃 운동/루틴',
                          content:
                            '##### 🏃 오늘의 건강 기록\n- **운동**: 1만보 걷기 (완료)\n- **복용**: 비타민 & 영양제 (완료)\n- **수면 컨디션**: 7시간 숙면',
                        },
                      ].map((tpl) => (
                        <button
                          key={tpl.name}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleInsertTemplateAtCursor(tpl.content, tpl.name)}
                          className="px-2 py-1 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors border border-slate-200/80 dark:border-zinc-700"
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={markdownTextareaRef}
                      rows={7}
                      value={diaryMarkdown}
                      onChange={(e) => setDiaryMarkdown(e.target.value)}
                      placeholder="오늘 하루의 생각, 활동, 일정을 자유롭게 기록하세요..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono leading-relaxed"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveDiarySubmit}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  일기 저장 완료
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 탭 B: 계획 / 할일 등록 모드 (명칭 표준화 & 상세 반복 모달 연계) */}
          {/* ============================================================ */}
          {activeTab === 'PLAN' && (
            <div className="space-y-3.5 pt-2">
              {/* 제목 및 중요 체크 */}
              <div className="flex items-center gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  제목
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="일정 제목을 입력하세요"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-bold text-xs"
                />
                <label className="flex items-center gap-1.5 shrink-0 font-bold cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={planIsImportant}
                    onChange={(e) => setPlanIsImportant(e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <span className="text-rose-600">중요 ⭐</span>
                </label>
              </div>

              {/* 장소 및 지도 첨부 */}
              <div className="flex items-center gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  장소
                </label>
                <input
                  type="text"
                  value={planLocation}
                  onChange={(e) => setPlanLocation(e.target.value)}
                  placeholder="장소 또는 주소를 입력하세요"
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
                <button
                  type="button"
                  onClick={() => onNotify('🗺️ 지도 첨부 인터페이스가 연동되었습니다.')}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold text-xs shrink-0 flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>지도첨부</span>
                </button>
              </div>

              {/* 일시: 시작 ~ 종료, 종일, 반복 설정 */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  일시
                </label>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 font-bold text-[11px]">
                    양력
                  </span>
                  <input
                    type="date"
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                  />
                  {!planIsAllDay && (
                    <input
                      type="time"
                      value={planStartTime}
                      onChange={(e) => setPlanStartTime(e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  )}
                  <span>~</span>
                  <input
                    type="date"
                    value={planEndDate}
                    onChange={(e) => setPlanEndDate(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                  />
                  {!planIsAllDay && (
                    <input
                      type="time"
                      value={planEndTime}
                      onChange={(e) => setPlanEndTime(e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  )}

                  {/* 네이버 스타일 상세 반복 설정 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsRecurrenceModalOpen(true)}
                    className={`px-2.5 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1 transition-all ${
                      recurrenceRule
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{recurrenceRule ? '반복 설정됨 🔄' : '반복 설정 ⚙️'}</span>
                  </button>

                  <label className="flex items-center gap-1 font-bold cursor-pointer ml-1">
                    <input
                      type="checkbox"
                      checked={planIsAllDay}
                      onChange={(e) => setPlanIsAllDay(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>종일</span>
                  </label>
                </div>
              </div>

              {/* 반복 규칙 요약 박스 (설정되었을 때 노출) */}
              {recurrenceRule && (
                <div className="ml-16 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium">
                    <RotateCw className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-pre-line">{recurrenceRule.summary}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecurrenceRule(null)}
                    className="text-slate-400 hover:text-rose-600 text-[11px] font-bold ml-2"
                  >
                    반복 해제
                  </button>
                </div>
              )}

              {/* 공개 / 비공개 설정 */}
              <div className="flex items-center gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  공개 여부
                </label>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isPrivate"
                      checked={!planIsPrivate}
                      onChange={() => setPlanIsPrivate(false)}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span>기본 공개 (그룹원 열람)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isPrivate"
                      checked={planIsPrivate}
                      onChange={() => setPlanIsPrivate(true)}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span>🔒 비공개 (나만 보기)</span>
                  </label>
                </div>
              </div>

              {/* 연계 서비스 선택 */}
              <div className="flex items-center gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  서비스 연계
                </label>
                <div className="flex-1 flex flex-wrap gap-1.5">
                  {[
                    { id: 'PERSONAL', label: '개인 할일 📌' },
                    { id: 'GOAL', label: '모아목표 🎯' },
                    { id: 'DUTY', label: '모아당번 🧹' },
                    { id: 'ROUTINE', label: '모아루틴 💊' },
                  ].map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setPlanServiceType(svc.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        planServiceType === svc.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                      }`}
                    >
                      {svc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 스티커 / 감성 이모지 바 */}
              <div className="flex items-center gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  스티커
                </label>
                <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
                  {['📌', '🎯', '🧹', '💊', '🎁', '🏖️', '🎈', '🏥', '💳', '✨'].map((stk) => (
                    <button
                      key={stk}
                      type="button"
                      onClick={() => setPlanSticker(stk)}
                      className={`text-lg p-1.5 rounded-xl border transition-all ${
                        planSticker === stk
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 scale-110 shadow-xs'
                          : 'border-slate-200 dark:border-zinc-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>

              {/* 상세 설명 */}
              <div className="flex items-start gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0 pt-2">
                  설명
                </label>
                <textarea
                  rows={3}
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="일정에 필요한 상세 설명을 남기세요."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                />
              </div>

              {/* 알림 설정 */}
              <div className="flex items-center gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0">
                  알림
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={planNotification}
                    onChange={(e) => setPlanNotification(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                  >
                    <option value="ON_TIME">정시 알림</option>
                    <option value="10M_BEFORE">10분 전</option>
                    <option value="1H_BEFORE">1시간 전</option>
                    <option value="1D_BEFORE">1일 전</option>
                  </select>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    팝업 알림
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold"
                >
                  취소
                </button>
                <button
                  onClick={handleSavePlanSubmit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20"
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </div>
      </ElmBsh01>

      {/* 네이버 캘린더형 상세 반복 설정 서브 모달 */}
      <MoaDayRecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        onApply={(rule) => {
          setRecurrenceRule(rule);
          onNotify(`🔄 반복 규칙 [${rule.cycle}] 설정이 적용되었습니다.`);
        }}
        initialRule={recurrenceRule || undefined}
        targetDate={planStartDate}
      />
    </>
  );
};
