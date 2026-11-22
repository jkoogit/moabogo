// ==========================================
// src/sample/screen/day/MoaDayUnifiedCreateModal.tsx
// 네이버 캘린더 스타일 통합 작성 팝업 (일기 / 계획 듀얼 탭)
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Bookmark,
  MapPin,
  Plus,
} from 'lucide-react';
import { ElmBsh01, ElmMkd01 } from '../../elements/Tokens';
import {
  CalendarEventItem,
  DiaryEntry,
  AttachedMediaItem,
  ServiceType,
} from './types';

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

  // 일기 폼 상태
  const [diaryMode, setDiaryMode] = useState<'KEYWORD' | 'THREE_LINE' | 'MARKDOWN'>('MARKDOWN');
  const [diaryMood, setDiaryMood] = useState<string>('🌟');
  const [diaryWeather, setDiaryWeather] = useState<string>('☀️');
  const [diaryKeywords, setDiaryKeywords] = useState<string>('#모아데이 #계획완료');
  const [diaryThreeLines, setDiaryThreeLines] = useState({ event: '', thought: '', tomorrow: '' });
  const [diaryMarkdown, setDiaryMarkdown] = useState<string>('');
  const [attachedMedia, setAttachedMedia] = useState<AttachedMediaItem[]>([]);

  // PWA 리소스 스캔 상태
  const [scannedResources, setScannedResources] = useState<AttachedMediaItem[]>([]);
  const [selectedScanIds, setSelectedScanIds] = useState<Record<string, boolean>>({});
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // 계획 폼 상태 (네이버 캘린더 스타일)
  const [planTitle, setPlanTitle] = useState<string>('');
  const [planIsImportant, setPlanIsImportant] = useState<boolean>(false);
  const [planStartDate, setPlanStartDate] = useState<string>(targetDate);
  const [planStartTime, setPlanStartTime] = useState<string>('14:00');
  const [planEndDate, setPlanEndDate] = useState<string>(targetDate);
  const [planEndTime, setPlanEndTime] = useState<string>('15:00');
  const [planIsAllDay, setPlanIsAllDay] = useState<boolean>(false);
  const [planRepeat, setPlanRepeat] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [planLocation, setPlanLocation] = useState<string>('');
  const [planServiceType, setPlanServiceType] = useState<ServiceType>('PERSONAL');
  const [planSticker, setPlanSticker] = useState<string>('📌');
  const [planDescription, setPlanDescription] = useState<string>('');
  const [planNotification, setPlanNotification] = useState<string>('10M_BEFORE');

  // 날짜/탭 변경 시 초기화
  useEffect(() => {
    setActiveTab(defaultTab);
    setPlanStartDate(targetDate);
    setPlanEndDate(targetDate);

    if (existingDiary) {
      setDiaryMode(existingDiary.mode);
      setDiaryMood(existingDiary.moodEmoji);
      setDiaryWeather(existingDiary.weatherEmoji);
      setDiaryKeywords(existingDiary.keywordTags.join(' '));
      setDiaryThreeLines(existingDiary.threeLines);
      setDiaryMarkdown(existingDiary.contentMarkdown);
      setAttachedMedia(existingDiary.attachedMedia || []);
    } else {
      setDiaryMode('MARKDOWN');
      setDiaryMood('🌟');
      setDiaryWeather('☀️');
      setDiaryKeywords('#일상 #기록');
      setDiaryThreeLines({ event: '', thought: '', tomorrow: '' });
      setDiaryMarkdown('');
      setAttachedMedia([]);
    }
  }, [isOpen, targetDate, defaultTab, existingDiary]);

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
      onNotify('📱 오늘 생성된 모바일 활동 리소스 6건을 감지했습니다.');
    }, 600);
  };

  // 스캔된 리소스 일기 본문에 취합 배치
  const handleInsertResourcesToDiary = () => {
    const selectedItems = scannedResources.filter((r) => selectedScanIds[r.id]);
    if (selectedItems.length === 0) {
      onNotify('배치할 리소스를 선택해주세요.');
      return;
    }

    let appendMd = `\n\n#### 📱 오늘 활동 기록 취합 (${targetDate})\n`;
    selectedItems.forEach((item) => {
      if (item.type === 'AUDIO') {
        appendMd += `- 🎙️ **통화녹음**: \`${item.name}\` (${item.duration || '재생가능'})\n`;
      } else if (item.type === 'IMAGE') {
        appendMd += `- 📷 **사진**: \`${item.name}\` (${item.timestamp || '촬영'})\n`;
      } else if (item.type === 'DOCUMENT') {
        appendMd += `- 📁 **문서**: \`${item.name}\` (${item.size || '첨부'})\n`;
      }
    });

    setDiaryMarkdown((prev) => prev + appendMd);
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
      id: `dia-${targetDate}`,
      date: targetDate,
      mode: diaryMode,
      moodEmoji: diaryMood,
      weatherEmoji: diaryWeather,
      keywordTags: rawTags,
      threeLines: diaryThreeLines,
      contentMarkdown: diaryMarkdown,
      attachedMedia,
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
      sticker: planSticker,
      description: planDescription,
    };
    onSavePlan(newEvt);
  };

  return (
    <ElmBsh01
      isOpen={isOpen}
      onClose={onClose}
      title={`${targetDate} 일정 및 일기 등록`}
      badge="통합 등록 허브"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 pt-1 pb-8 text-xs text-slate-900 dark:text-zinc-100">
        {/* 상단 듀얼 탭: [📝 일기 쓰기] vs [📅 계획 / 할일 등록] */}
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
            <span>📝 일기 쓰기 (키워드/3줄/MD)</span>
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
            <span>📅 계획 / 할일 등록 (네이버형)</span>
          </button>
        </div>

        {/* ========================================== */}
        {/* 탭 A: 일기 쓰기 모드 */}
        {/* ========================================== */}
        {activeTab === 'DIARY' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                {(['KEYWORD', 'THREE_LINE', 'MARKDOWN'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setDiaryMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      diaryMode === m
                        ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {m === 'KEYWORD' ? '키워드 일기' : m === 'THREE_LINE' ? '3줄 일기' : '마크다운 일기'}
                  </button>
                ))}
              </div>

              {/* 감정 이모지 선택 */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-400 mr-1">기분:</span>
                {['🌟', '😊', '☕', '🔥', '💧', '😴'].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setDiaryMood(emo)}
                    className={`text-base p-1 rounded-lg transition-transform ${
                      diaryMood === emo ? 'scale-125 bg-amber-100 dark:bg-amber-950/60' : 'opacity-60'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            {/* PWA 모바일 리소스 수집 버튼 및 감지 레이어 */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50/70 to-indigo-50/70 dark:from-zinc-800 dark:to-zinc-800 border border-sky-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-sky-500 text-white">📱</span>
                  <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-xs">
                    오늘 하루 모바일 활동 리소스 자동 스캔
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

            {/* 에디터 본문 (모드별 분기) */}
            {diaryMode === 'KEYWORD' && (
              <div className="space-y-3">
                <label className="font-bold block">해시태그 키워드 (공백 구분)</label>
                <input
                  type="text"
                  value={diaryKeywords}
                  onChange={(e) => setDiaryKeywords(e.target.value)}
                  placeholder="#운동 #가족모임 #개발성공"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                />
                <p className="text-[11px] text-slate-400">
                  10초 만에 감정 이모지와 3~5개 키워드로 하루를 압축 기록합니다.
                </p>
              </div>
            )}

            {diaryMode === 'THREE_LINE' && (
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    1. 오늘 일어난 중요한 사건
                  </label>
                  <input
                    type="text"
                    value={diaryThreeLines.event}
                    onChange={(e) =>
                      setDiaryThreeLines((p) => ({ ...p, event: e.target.value }))
                    }
                    placeholder="예) 모아데이 화면 설계와 PWA 리소스 수집 기능 완성"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    2. 나의 생각과 느낌
                  </label>
                  <input
                    type="text"
                    value={diaryThreeLines.thought}
                    onChange={(e) =>
                      setDiaryThreeLines((p) => ({ ...p, thought: e.target.value }))
                    }
                    placeholder="예) 기획과 개발의 연결고리가 탄탄해져서 매우 뿌듯하다."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                    3. 내일의 다짐 / 목표
                  </label>
                  <input
                    type="text"
                    value={diaryThreeLines.tomorrow}
                    onChange={(e) =>
                      setDiaryThreeLines((p) => ({ ...p, tomorrow: e.target.value }))
                    }
                    placeholder="예) 정적 검증 완료하고 원격 dev/stg/main 브랜치에 배포 승급하기."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                  />
                </div>
              </div>
            )}

            {diaryMode === 'MARKDOWN' && (
              <div className="space-y-2">
                <ElmMkd01
                  value={diaryMarkdown}
                  onChange={setDiaryMarkdown}
                  placeholder="오늘 하루의 생각, 활동, 일정을 자유롭게 기록하세요..."
                  rows={8}
                  defaultMode="split"
                />
              </div>
            )}

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
        {/* 탭 B: 계획 / 할일 등록 모드 (네이버 캘린더 등록 폼) */}
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

            {/* 일시: 시작 ~ 종료, 종일, 반복 */}
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
                <select
                  value={planRepeat}
                  onChange={(e) => setPlanRepeat(e.target.value as any)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                >
                  <option value="NONE">반복 없음</option>
                  <option value="DAILY">매일 반복</option>
                  <option value="WEEKLY">매주 반복</option>
                  <option value="MONTHLY">매월 반복</option>
                </select>
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
  );
};
