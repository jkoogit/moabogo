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
  Paperclip,
  Eye,
  Tag,
  Trash2,
} from 'lucide-react';
import { ElmBsh01, ElmMkd01, ElmMkdViewer } from '../../elements/Tokens';
import {
  CalendarEventItem,
  DiaryEntry,
  AttachedMediaItem,
  ServiceType,
  RecurrenceRule,
  TaggedDiaryBlock,
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

  // 태그 목록 관리 & 수정 모드 상태 (요구사항 4-a,b)
  const [diaryTagList, setDiaryTagList] = useState<string[]>(['#일상', '#모아데이', '#개발완료']);
  const [tagInput, setTagInput] = useState<string>('');
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);

  // 태그별 3줄 일기 & 마크다운 블록 상태 (요구사항 4-c,d,e 에피소드 분리)
  const [selectedTagForBlock, setSelectedTagForBlock] = useState<string>('ALL');
  const [taggedBlocks, setTaggedBlocks] = useState<
    Record<string, { threeLines: { event: string; thought: string; tomorrow: string }; markdown: string }>
  >({});

  const [diaryThreeLines, setDiaryThreeLines] = useState({ event: '', thought: '', tomorrow: '' });
  const [diaryMarkdown, setDiaryMarkdown] = useState<string>('');
  const [attachedMedia, setAttachedMedia] = useState<AttachedMediaItem[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // 마크다운 textarea 커서 참조 & 숨겨진 파일 인풋 참조 & 미리보기 팝업 상태 (요구사항 4-f, 6-a,b)
  const markdownTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewCollapsedTags, setPreviewCollapsedTags] = useState<Record<string, boolean>>({});
  const [previewFilterTag, setPreviewFilterTag] = useState<string>('ALL');

  // 미리보기 태그 필터 바 가로 슬라이더 참조 및 상태 (요구사항 3-a)
  const previewTagScrollRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewTagDragging, setIsPreviewTagDragging] = useState(false);
  const [previewTagStartX, setPreviewTagStartX] = useState(0);
  const [previewTagScrollLeft, setPreviewTagScrollLeft] = useState(0);

  const handlePreviewTagMouseDown = (e: React.MouseEvent) => {
    if (!previewTagScrollRef.current) return;
    setIsPreviewTagDragging(true);
    setPreviewTagStartX(e.pageX - previewTagScrollRef.current.offsetLeft);
    setPreviewTagScrollLeft(previewTagScrollRef.current.scrollLeft);
  };
  const handlePreviewTagMouseLeave = () => setIsPreviewTagDragging(false);
  const handlePreviewTagMouseUp = () => setIsPreviewTagDragging(false);
  const handlePreviewTagMouseMove = (e: React.MouseEvent) => {
    if (!isPreviewTagDragging || !previewTagScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - previewTagScrollRef.current.offsetLeft;
    const walk = (x - previewTagStartX) * 1.5;
    previewTagScrollRef.current.scrollLeft = previewTagScrollLeft - walk;
  };
  const handlePreviewTagWheel = (e: React.WheelEvent) => {
    if (!previewTagScrollRef.current) return;
    if (e.deltaY === 0) return;
    const el = previewTagScrollRef.current;
    const isAtStart = el.scrollLeft <= 0;
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    if ((isAtStart && e.deltaY < 0) || (isAtEnd && e.deltaY > 0)) {
      return; // 상위 세로 스크롤로 패스스루 허용
    }
    el.scrollLeft += e.deltaY;
  };

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
  const [planNotifications, setPlanNotifications] = useState<string[]>(['10M_BEFORE']);

  const handleAddNotification = () => setPlanNotifications((prev) => [...prev, '30M_BEFORE']);
  const handleRemoveNotification = (idx: number) =>
    setPlanNotifications((prev) => prev.filter((_, i) => i !== idx));
  const handleUpdateNotification = (idx: number, val: string) => {
    setPlanNotifications((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

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
      const initialTags =
        existingDiary.keywordTags && existingDiary.keywordTags.length > 0
          ? existingDiary.keywordTags
          : ['#일상', '#기록'];
      setDiaryTagList(initialTags);
      setDiaryThreeLines(existingDiary.threeLines || { event: '', thought: '', tomorrow: '' });
      setDiaryMarkdown(existingDiary.contentMarkdown || '');
      setAttachedMedia(existingDiary.attachedMedia || []);

      const blocksMap: Record<
        string,
        { threeLines: { event: string; thought: string; tomorrow: string }; markdown: string }
      > = {};
      if (existingDiary.taggedBlocks) {
        existingDiary.taggedBlocks.forEach((tb) => {
          blocksMap[tb.tag] = {
            threeLines: tb.threeLines || { event: '', thought: '', tomorrow: '' },
            markdown: tb.contentMarkdown || '',
          };
        });
      }
      setTaggedBlocks(blocksMap);
    } else {
      setDiaryMood('🌟');
      setDiaryWeather('☀️');
      setDiaryWeatherText('맑음 (18℃)');
      setDiaryLocation('서울 강남구 역삼동');
      setDiaryTagList(['#일상', '#모아데이', '#기록']);
      setDiaryThreeLines({ event: '', thought: '', tomorrow: '' });
      setDiaryMarkdown('');
      setAttachedMedia([]);
      setTaggedBlocks({});
    }
    setEditingTagIndex(null);
    setTagInput('');
    setSelectedTagForBlock('ALL');
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

  // 마크다운 커서 위치 템플릿 스마트 삽입 ($O(1)$ 무부하 성능 검토 반영 - 태그 에피소드 모드 지원 버그수정 - 요구사항 4)
  const handleInsertTemplateAtCursor = (templateContent: string, templateName: string) => {
    const el = markdownTextareaRef.current;
    if (!el) {
      // 텍스트에어리어가 직접 잡히지 않을 때 단순 append
      handleUpdateCurrentMarkdown(currentMarkdown ? `${currentMarkdown}\n\n${templateContent}` : templateContent);
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
    handleUpdateCurrentMarkdown(nextVal);

    // 삽입 후 포커스 및 캐럿 복원
    setTimeout(() => {
      el.focus();
      const newPos = start + insertText.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);

    onNotify(`커서 위치에 [${templateName}] 서식을 쏙 삽입했습니다.`);
  };

  // 클립보드 이미지 복사 붙여넣기 이벤트 핸들러 (요구사항 6-a)
  const handlePasteMarkdown = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const fileName =
            file.name && file.name !== 'image.png'
              ? file.name
              : `클립보드_캡처_${new Date().toISOString().slice(11, 19).replace(/:/g, '')}.png`;
          const newMedia: AttachedMediaItem = {
            id: `res-paste-${Date.now()}`,
            type: 'IMAGE',
            name: fileName,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            imageRatio: 'WIDE',
            imageToggle: 'EXPANDED',
          };
          setAttachedMedia((prev) => [...prev, newMedia]);
          handleInsertTemplateAtCursor(`\n\n![${fileName}](attachment://${newMedia.id})\n`, fileName);
          onNotify(`📋 클립보드 이미지가 첨부되고 커서 위치에 자동 삽입되었습니다.`);
        }
      }
    }
  };

  // 수동 파일 첨부 핸들러 (요구사항 6-b)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: AttachedMediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');
      const isAud = file.type.startsWith('audio/');
      const mediaType: 'IMAGE' | 'AUDIO' | 'DOCUMENT' = isImg ? 'IMAGE' : isAud ? 'AUDIO' : 'DOCUMENT';

      const item: AttachedMediaItem = {
        id: `res-upload-${Date.now()}-${i}`,
        type: mediaType,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageRatio: 'WIDE',
        imageToggle: 'EXPANDED',
      };
      newItems.push(item);

      if (isImg) {
        handleInsertTemplateAtCursor(`\n\n![${file.name}](attachment://${item.id})\n`, file.name);
      }
    }

    setAttachedMedia((prev) => [...prev, ...newItems]);
    onNotify(`📎 ${newItems.length}개 파일이 성공적으로 첨부되었습니다.`);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 태그 추가 및 수정 핸들러 (요구사항 4-a, b)
  const handleAddOrUpdateTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

    if (editingTagIndex !== null && editingTagIndex >= 0 && editingTagIndex < diaryTagList.length) {
      const oldTag = diaryTagList[editingTagIndex];
      const updated = [...diaryTagList];
      updated[editingTagIndex] = formatted;
      setDiaryTagList(updated);

      if (taggedBlocks[oldTag]) {
        setTaggedBlocks((prev) => {
          const next = { ...prev };
          next[formatted] = next[oldTag];
          delete next[oldTag];
          return next;
        });
      }
      if (selectedTagForBlock === oldTag) {
        setSelectedTagForBlock(formatted);
      }
      setEditingTagIndex(null);
      setTagInput('');
      onNotify(`🏷️ 태그 [${oldTag}]를 [${formatted}]로 수정했습니다.`);
    } else {
      if (!diaryTagList.includes(formatted)) {
        setDiaryTagList((prev) => [...prev, formatted]);
        onNotify(`🏷️ 새 태그 [${formatted}]를 추가했습니다.`);
      }
      setTagInput('');
    }
  };

  const handleSelectTagForEdit = (tag: string, index: number) => {
    if (selectedTagForBlock === tag) {
      // 이미 선택된 태그 재클릭 시 토글 오프 (태그해제 - 요구사항 6-a)
      setSelectedTagForBlock('ALL');
      setEditingTagIndex(null);
      setTagInput('');
      onNotify('태그가 해제되어 공통 일기 작성 모드로 복귀했습니다.');
    } else {
      setEditingTagIndex(index);
      setTagInput(tag);
      setSelectedTagForBlock(tag);
      onNotify(`✏️ [${tag}] 에피소드 작성 및 수정 모드로 전환했습니다.`);
    }
  };

  const handleDeleteTag = (index: number) => {
    const targetTag = diaryTagList[index];
    const updated = diaryTagList.filter((_, i) => i !== index);
    setDiaryTagList(updated);
    if (editingTagIndex === index) {
      setEditingTagIndex(null);
      setTagInput('');
    }
    if (selectedTagForBlock === targetTag) {
      setSelectedTagForBlock('ALL');
    }
    onNotify(`🗑️ 태그 [${targetTag}]를 삭제했습니다.`);
  };

  // 현재 에디터 활성 3줄일기 및 마크다운 값 (태그별 에피소드 지원 - 요구사항 4-c,d,e)
  const currentThreeLines =
    selectedTagForBlock === 'ALL'
      ? diaryThreeLines
      : taggedBlocks[selectedTagForBlock]?.threeLines || { event: '', thought: '', tomorrow: '' };

  const handleUpdateCurrentThreeLines = (patch: Partial<{ event: string; thought: string; tomorrow: string }>) => {
    if (selectedTagForBlock === 'ALL') {
      setDiaryThreeLines((prev) => ({ ...prev, ...patch }));
    } else {
      setTaggedBlocks((prev) => ({
        ...prev,
        [selectedTagForBlock]: {
          threeLines: {
            ...(prev[selectedTagForBlock]?.threeLines || { event: '', thought: '', tomorrow: '' }),
            ...patch,
          },
          markdown: prev[selectedTagForBlock]?.markdown || '',
        },
      }));
    }
  };

  const currentMarkdown =
    selectedTagForBlock === 'ALL' ? diaryMarkdown : taggedBlocks[selectedTagForBlock]?.markdown || '';

  const handleUpdateCurrentMarkdown = (val: string) => {
    if (selectedTagForBlock === 'ALL') {
      setDiaryMarkdown(val);
    } else {
      setTaggedBlocks((prev) => ({
        ...prev,
        [selectedTagForBlock]: {
          threeLines: prev[selectedTagForBlock]?.threeLines || { event: '', thought: '', tomorrow: '' },
          markdown: val,
        },
      }));
    }
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
    const rawTags = diaryTagList.length > 0 ? diaryTagList : ['#일상'];

    const taggedBlocksList: TaggedDiaryBlock[] = rawTags.map((t) => ({
      tag: t,
      threeLines: taggedBlocks[t]?.threeLines,
      contentMarkdown: taggedBlocks[t]?.markdown,
    }));

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
      taggedBlocks: taggedBlocksList,
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

  // 모바일 바텀시트 하단 고정 푸터 렌더러 (요구사항 7-b 고정 푸터 분리)
  const renderModalFooter = () => {
    if (activeTab === 'DIARY') {
      return (
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-zinc-300 hover:text-indigo-600 font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-zinc-700 text-xs shadow-2xs"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>미리보기</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold text-xs"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveDiarySubmit}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
            >
              일기 저장 완료
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-2 w-full">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold text-xs"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSavePlanSubmit}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
        >
          저장
        </button>
      </div>
    );
  };

  return (
    <>
      <ElmBsh01
        isOpen={isOpen}
        onClose={onClose}
        title={`${targetDate} 등록`}
        maxWidth="max-w-2xl"
        footer={renderModalFooter()}
      >
        <div className="space-y-4 pt-1 text-xs text-slate-900 dark:text-zinc-100">
          {/* 상단 듀얼 탭: [일기] vs [📅 계획 / 할일] (명칭 표준화) */}
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
              <span>일기</span>
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
              <span>📅 계획 / 할일</span>
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

              {/* PWA 하루 모바일 활동 리소스 자동 스캔 & 수동 파일 첨부 (요구사항 6-b) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/70 to-indigo-50/70 dark:from-zinc-800 dark:to-zinc-800 border border-sky-200 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-sky-500 text-white text-xs">📱</span>
                    <span className="font-extrabold text-slate-900 dark:text-zinc-100 text-xs">
                      하루 모바일 활동 리소스 자동 스캔
                    </span>
                  </div>

                  {/* 파일 첨부 및 스캔 버튼 묶음 (요구사항 6-b) */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                      title="로컬 사진/녹음/문서 파일 직접 첨부"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                      <span>파일첨부</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleScanMobileResources}
                      disabled={isScanning}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                    >
                      {isScanning ? '스캔 중...' : '파일스캔'}
                    </button>
                  </div>
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
              {/* 블록 1: 해시태그 키워드 (입력/결과 분리 및 수정 모드 - 요구사항 4-a, b) */}
              {/* ========================================== */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBlockKeywordsOpen((prev) => !prev)}
                  className="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-zinc-800/70 flex items-center justify-between font-bold text-xs hover:bg-slate-200/50"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🏷️ 1. 해시태그 키워드 관리 블록</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (칩 클릭 시 수정모드 & 태그별 3줄/본문 연동)
                    </span>
                  </span>
                  {blockKeywordsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {blockKeywordsOpen && (
                  <div className="p-3.5 space-y-3 bg-white dark:bg-zinc-900">
                    {/* 태그 입력 필드 (Enter 시 추가 또는 수정 - 요구사항 4-a) */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOrUpdateTag();
                            }
                          }}
                          placeholder={
                            editingTagIndex !== null
                              ? '선택된 태그 수정 후 Enter 키를 누르세요'
                              : '새 태그 입력 후 Enter (#생략 가능)'
                          }
                          className={`w-full pl-8 pr-3 py-2 rounded-xl border bg-white dark:bg-zinc-800 text-xs font-bold transition-all ${
                            editingTagIndex !== null
                              ? 'border-amber-500 ring-2 ring-amber-500/30'
                              : 'border-slate-200 dark:border-zinc-700'
                          }`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOrUpdateTag}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs whitespace-nowrap shadow-2xs"
                      >
                        {editingTagIndex !== null ? '태그 수정' : '+ 추가'}
                      </button>
                    </div>

                    {/* 태그 결과 목록 & 태그별 에피소드 선택 칩 (요구사항 1-a, 4-b, c, d, e) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">태그 에피소드:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTagForBlock('ALL');
                          setEditingTagIndex(null);
                          setTagInput('');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          selectedTagForBlock === 'ALL'
                            ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                        }`}
                      >
                        #태그선택해제
                      </button>

                      {diaryTagList.map((tag, idx) => {
                        const isEditing = editingTagIndex === idx;
                        const isSelectedForBlock = selectedTagForBlock === tag;
                        return (
                          <div
                            key={`${tag}-${idx}`}
                            onClick={() => handleSelectTagForEdit(tag, idx)}
                            className={`group px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border select-none ${
                              isEditing
                                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 shadow-xs'
                                : isSelectedForBlock
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300'
                            }`}
                            title="클릭하여 태그 수정모드 진입 & 해당 태그 전용 일기 작성"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTag(idx);
                              }}
                              className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-rose-500"
                              title="태그 삭제"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================== */}
              {/* 블록 2: 3줄 일기 블록 (토글형 아코디언 & 태그별 작성 - 요구사항 2-a, 2-b) */}
              {/* ========================================== */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBlockThreeLinesOpen((prev) => !prev)}
                  className="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-zinc-800/70 flex items-center justify-between font-bold text-xs hover:bg-slate-200/50"
                >
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span>📝 2. 3줄 일기 블록</span>
                    {/* 타이틀 뒤, 태그 앞에 설명 ? 아이콘 배치 (요구사항 2-b) */}
                    <span
                      className="relative group inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-black inline-flex items-center justify-center cursor-help">
                        ?
                      </span>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-48 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-xl z-30 pointer-events-none whitespace-normal text-left">
                        오늘 하루 일어난 사건, 느낌, 내일의 다짐을 3줄로 핵심 요약합니다.
                      </span>
                    </span>
                    {/* 선택된 태그 뱃지 & 닫기(해제) 버튼 일체형 (요구사항 2-a) */}
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200/80 dark:border-indigo-800">
                      <span>{selectedTagForBlock === 'ALL' ? '공통' : selectedTagForBlock}</span>
                      {selectedTagForBlock !== 'ALL' && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTagForBlock('ALL');
                            setEditingTagIndex(null);
                            setTagInput('');
                            onNotify('태그가 해제되어 공통 일기 작성 모드로 복귀했습니다.');
                          }}
                          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-indigo-500 hover:text-rose-500 cursor-pointer"
                          title="태그 해제하고 공통 3줄 일기로 복귀"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </span>
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
                        value={currentThreeLines.event}
                        onChange={(e) => handleUpdateCurrentThreeLines({ event: e.target.value })}
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
                        value={currentThreeLines.thought}
                        onChange={(e) => handleUpdateCurrentThreeLines({ thought: e.target.value })}
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
                        value={currentThreeLines.tomorrow}
                        onChange={(e) => handleUpdateCurrentThreeLines({ tomorrow: e.target.value })}
                        placeholder="예) 정적 검증 완료하고 원격 dev/stg/main 브랜치에 배포 승급하기."
                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* 블록 3: 마크다운 서술 에디터 (커서 위치 템플릿 & Ctrl+V 이미지 붙여넣기 - 요구사항 2-a, 2-b, 4-a-ii) */}
              {/* ============================================================ */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setBlockMarkdownOpen((prev) => !prev)}
                  className="w-full px-4 py-2.5 bg-slate-100/70 dark:bg-zinc-800/70 flex items-center justify-between font-bold text-xs hover:bg-slate-200/50"
                >
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span>📄 3. 자유 마크다운 서술 블록</span>
                    {/* 타이틀 뒤, 태그 앞에 설명 ? 아이콘 배치 (요구사항 2-b) */}
                    <span
                      className="relative group inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-black inline-flex items-center justify-center cursor-help">
                        ?
                      </span>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-52 p-2 rounded-lg bg-slate-900 text-white text-[10px] leading-tight shadow-xl z-30 pointer-events-none whitespace-normal text-left">
                        자유 마크다운 서술, 서식 삽입 및 클립보드 이미지(Ctrl+V) 자동 첨부를 지원합니다.
                      </span>
                    </span>
                    {/* 선택된 태그 뱃지 & 닫기(해제) 버튼 일체형 (요구사항 2-a) */}
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-200/80 dark:border-indigo-800">
                      <span>{selectedTagForBlock === 'ALL' ? '공통' : selectedTagForBlock}</span>
                      {selectedTagForBlock !== 'ALL' && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTagForBlock('ALL');
                            setEditingTagIndex(null);
                            setTagInput('');
                            onNotify('태그가 해제되어 공통 마크다운 본문 모드로 복귀했습니다.');
                          }}
                          className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-indigo-500 hover:text-rose-500 cursor-pointer"
                          title="태그 해제하고 공통 본문으로 복귀"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </span>
                  </span>
                  {blockMarkdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {blockMarkdownOpen && (
                  <div className="p-3.5 space-y-2 bg-white dark:bg-zinc-900">
                    {/* 상단 템플릿 프리셋 바 */}
                    <div className="flex items-center gap-1.5 flex-wrap pb-1.5 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-[11px] font-bold text-slate-400 mr-1">서식 추가:</span>
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
                      id="diary-markdown-editor"
                      name="diaryMarkdown"
                      rows={7}
                      value={currentMarkdown}
                      onChange={(e) => handleUpdateCurrentMarkdown(e.target.value)}
                      onPaste={handlePasteMarkdown}
                      placeholder="오늘 하루의 생각, 활동, 일정을 자유롭게 기록하세요... (이미지 복사 후 붙여넣기 시 자동 첨부)"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono leading-relaxed"
                    />
                  </div>
                )}
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

              {/* 공개 / 비공개 설정 (간소화 명칭 표준화 - 요구사항 2-g, h) */}
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
                    <span>공개</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isPrivate"
                      checked={planIsPrivate}
                      onChange={() => setPlanIsPrivate(true)}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span>🔒 비공개</span>
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

              {/* 알림 설정 (복수 알림 동적 추가/삭제 지원 - 요구사항 11) */}
              <div className="flex items-start gap-3">
                <label className="font-extrabold text-slate-700 dark:text-zinc-300 w-16 shrink-0 pt-1.5">
                  알림
                </label>
                <div className="flex-1 space-y-2">
                  <div className="space-y-1.5">
                    {planNotifications.map((noti, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={noti}
                          onChange={(e) => handleUpdateNotification(idx, e.target.value)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                        >
                          <option value="ON_TIME">정시 알림</option>
                          <option value="10M_BEFORE">10분 전</option>
                          <option value="30M_BEFORE">30분 전</option>
                          <option value="1H_BEFORE">1시간 전</option>
                          <option value="1D_BEFORE">1일 전</option>
                        </select>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          팝업 알림
                        </span>
                        {planNotifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveNotification(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                            title="알림 삭제"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNotification}
                    className="px-2.5 py-1 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>알림 추가</span>
                  </button>
                </div>
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

      {/* 일기 작성 내용 미리보기 팝업 (요구사항 4-f) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6 flex flex-col max-h-[85vh] overflow-hidden text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 font-bold">
                  <Eye className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {customDiaryDate} 일기 미리보기
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {/* 기분/날씨/위치 */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-amber-50/50 dark:bg-zinc-800/50 border border-amber-200/50 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{diaryMood}</span>
                  <span className="text-base">{diaryWeather}</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">{diaryWeatherText}</span>
                </div>
                {diaryLocation && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    📍 {diaryLocation}
                  </span>
                )}
              </div>

              {/* 태그 목록 필터 바 (가로 슬라이드 드래그 휠 & 휠 트랩 패스스루 통제 - 요구사항 3-a) */}
              <div
                ref={previewTagScrollRef}
                onMouseDown={handlePreviewTagMouseDown}
                onMouseLeave={handlePreviewTagMouseLeave}
                onMouseUp={handlePreviewTagMouseUp}
                onMouseMove={handlePreviewTagMouseMove}
                onWheel={handlePreviewTagWheel}
                className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 select-none cursor-grab active:cursor-grabbing"
              >
                <button
                  type="button"
                  onClick={() => setPreviewFilterTag('ALL')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                    previewFilterTag === 'ALL'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                  }`}
                >
                  전체보기
                </button>
                {diaryTagList.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setPreviewFilterTag((prev) => (prev === tag ? 'ALL' : tag))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border ${
                      previewFilterTag === tag
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* 공통 3줄 일기 */}
              {(previewFilterTag === 'ALL') && (diaryThreeLines.event || diaryThreeLines.thought || diaryThreeLines.tomorrow) && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-1.5">
                  <span className="text-[11px] font-extrabold text-amber-600 block mb-1">
                    📝 3줄 일기 요약 (공통)
                  </span>
                  {diaryThreeLines.event && (
                    <p>
                      <strong className="text-slate-700 dark:text-zinc-300">사건: </strong>
                      {diaryThreeLines.event}
                    </p>
                  )}
                  {diaryThreeLines.thought && (
                    <p>
                      <strong className="text-slate-700 dark:text-zinc-300">느낌: </strong>
                      {diaryThreeLines.thought}
                    </p>
                  )}
                  {diaryThreeLines.tomorrow && (
                    <p>
                      <strong className="text-slate-700 dark:text-zinc-300">내일: </strong>
                      {diaryThreeLines.tomorrow}
                    </p>
                  )}
                </div>
              )}

              {/* 공통 마크다운 본문 */}
              {(previewFilterTag === 'ALL') && diaryMarkdown && (
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                  <span className="text-[11px] font-extrabold text-slate-400 block mb-2">
                    📄 마크다운 서술 본문 (공통)
                  </span>
                  <ElmMkdViewer content={diaryMarkdown} />
                </div>
              )}

              {/* 태그별 에피소드 블록 목록 (Chevron 접기/펴기 아코디언 지원 - 요구사항 7) */}
              {Object.keys(taggedBlocks).length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      🏷️ 태그별 에피소드 블록 ({Object.keys(taggedBlocks).length}개)
                    </span>
                    {previewFilterTag !== 'ALL' && (
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        필터링: {previewFilterTag}
                      </span>
                    )}
                  </div>
                  {Object.entries(taggedBlocks)
                    .filter(([tagKey]) => previewFilterTag === 'ALL' || previewFilterTag === tagKey)
                    .map(([tagKey, block]) => {
                      const isCollapsed = !!previewCollapsedTags[tagKey];
                      return (
                        <div
                          key={tagKey}
                          className="p-3 rounded-xl bg-indigo-50/40 dark:bg-zinc-800/40 border border-indigo-200/60 dark:border-zinc-700 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-xs block">
                              {tagKey} 에피소드
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewCollapsedTags((prev) => ({
                                  ...prev,
                                  [tagKey]: !prev[tagKey],
                                }))
                              }
                              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-indigo-100/60 dark:hover:bg-zinc-700 transition-colors"
                              title={isCollapsed ? '에피소드 펼치기' : '에피소드 접기'}
                            >
                              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          {!isCollapsed && (
                            <>
                              {(block.threeLines.event || block.threeLines.thought || block.threeLines.tomorrow) && (
                                <div className="text-[11px] space-y-1 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                                  {block.threeLines.event && (
                                    <div>
                                      <strong>사건:</strong> {block.threeLines.event}
                                    </div>
                                  )}
                                  {block.threeLines.thought && (
                                    <div>
                                      <strong>느낌:</strong> {block.threeLines.thought}
                                    </div>
                                  )}
                                  {block.threeLines.tomorrow && (
                                    <div>
                                      <strong>다짐:</strong> {block.threeLines.tomorrow}
                                    </div>
                                  )}
                                </div>
                              )}
                              {block.markdown && (
                                <div className="pt-1 text-xs">
                                  <ElmMkdViewer content={block.markdown} />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}

              {/* 첨부파일 */}
              {attachedMedia.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    📎 첨부된 미디어 리소스 ({attachedMedia.length}개)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {attachedMedia.map((m) => (
                      <span
                        key={m.id}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] text-slate-700 dark:text-zinc-300 font-medium"
                      >
                        {m.type === 'IMAGE' ? '📷' : m.type === 'AUDIO' ? '🎙️' : '📁'} {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end shrink-0">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
