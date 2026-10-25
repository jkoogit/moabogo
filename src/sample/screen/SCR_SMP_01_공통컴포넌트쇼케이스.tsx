import React, { useState, useMemo } from 'react';
import UI_TOKENS_METADATA from '../data/ui-tokens-metadata.json';
import {
  ElmTyp01,
  ElmInp01,
  ElmInp04,
  ElmSel01,
  ElmSel02,
  ElmCmb01,
  ElmFlt01,
  ElmChk01,
  ElmRad01,
  ElmSwt01,
  ElmCnt01,
  ElmStt01,
  ElmTre01,
  ElmFab01,
  ElmPrf01,
  ElmStp01,
  ElmTab01,
  ElmSld02,
  ElmSld03,
  ElmRng01,
  ElmBsh01,
  ElmTip01,
  ElmHlp01,
  ElmToast01,
  TreeNode,
} from '../elements/Tokens';
import {
  Layers,
  Sliders,
  Search,
  Code2,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface TokenMetaItem {
  id: string;
  name: string;
  category: string;
  description: string;
  guardrails: {
    verticalCenterRule: string;
    textWrapPolicy: string;
    touchTargetMin: string;
    keyTailwindClasses: string;
    eventIsolation: string;
  };
  states: string[];
  viewportSupport: {
    pc: string;
    tablet: string;
    mobile: string;
  };
  codeSnippet: string;
  propsInterface: string;
  usedScreenIds: Array<{ screenId: string; screenName: string; role: string }>;
}

export const SCR_SMP_01_공통컴포넌트쇼케이스: React.FC = () => {
  // 1. 검색 및 카테고리 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const [expandedTokenId, setExpandedTokenId] = useState<string | null>('ELM-CMB-01');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 2. 대화형 라이브 데모 전용 상태
  const [demoInput, setDemoInput] = useState('스타벅스 강남점 결제');
  const [demoSearch, setDemoSearch] = useState('영수증');
  const [demoSelect, setDemoSelect] = useState('1');
  const [demoFilterSelect, setDemoFilterSelect] = useState('CAFE');
  const [demoComboText, setDemoComboText] = useState('커피 쏘기');
  const [demoComboIcon, setDemoComboIcon] = useState('☕');
  const [demoCheck, setDemoCheck] = useState(true);
  const [demoRadio, setDemoRadio] = useState('1');
  const [demoToggle, setDemoToggle] = useState(true);
  const [demoRngVal, setDemoRngVal] = useState(5);
  const [demoTab, setDemoTab] = useState('TAB1');
  const [demoStep, setDemoStep] = useState(2);
  const [demoBottomSheetOpen, setDemoBottomSheetOpen] = useState(false);
  const [isTreeEdit, setIsTreeEdit] = useState(false);
  const [demoToastMsg, setDemoToastMsg] = useState<string | null>(null);
  const [demoToastType, setDemoToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const triggerDemoToast = (msg: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setDemoToastMsg(msg);
    setDemoToastType(type);
  };

  // 샘플 트리 데이터
  const [treeData, setTreeData] = useState<TreeNode[]>([
    {
      id: '1',
      name: '식음료 / 카페',
      count: 14,
      amount: 145000,
      children: [
        { id: '1-1', name: '커피 & 디저트', count: 8, amount: 62000 },
        { id: '1-2', name: '점심 식사', count: 6, amount: 83000 },
      ],
    },
    {
      id: '2',
      name: '생활 / 장보기',
      count: 5,
      amount: 189000,
      children: [{ id: '2-1', name: '이마트 양재점', count: 3, amount: 124800 }],
    },
  ]);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const rawCategories = Array.from(
      new Set((UI_TOKENS_METADATA as TokenMetaItem[]).map((t) => t.category))
    );
    return ['ALL', ...rawCategories];
  }, []);

  // 필터링된 토큰 목록
  const filteredTokens = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (UI_TOKENS_METADATA as TokenMetaItem[]).filter((token) => {
      const matchCat = selectedCategory === 'ALL' || token.category === selectedCategory;
      if (!matchCat) return false;
      if (!query) return true;
      return (
        token.id.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.description.toLowerCase().includes(query) ||
        token.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 카테고리별 시맨틱 컬러 뱃지
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Typography':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Form':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Control':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Badge':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Navigation':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Slider & Touch':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'Feedback & Overlay':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  // 각 토큰별 라이브 인터랙티브 데모 렌더러
  const renderLiveDemo = (token: TokenMetaItem) => {
    switch (token.id) {
      case 'ELM-TYP-01':
        return (
          <ElmTyp01
            title="우리집 가계부 관리"
            badge="그룹 장부"
            subtitle="가족 4명 • 당월 순수 생활비 ₩1,248,000"
          />
        );
      case 'ELM-INP-01':
        return (
          <ElmInp01
            value={demoInput}
            onChange={setDemoInput}
            label="일반 입력필드 (상시 ✕ 클리어)"
            placeholder="거래 적요 입력..."
          />
        );
      case 'ELM-INP-04':
        return (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              검색 입력필드 (Search + ✕)
            </label>
            <ElmInp04
              value={demoSearch}
              onChange={setDemoSearch}
              placeholder="영수증 및 거래처 검색..."
            />
          </div>
        );
      case 'ELM-SEL-01':
        return (
          <ElmSel01
            value={demoSelect}
            onChange={setDemoSelect}
            label="선택 드롭다운"
            options={[
              { value: '1', label: '식음료 / 카페' },
              { value: '2', label: '식료품 / 마트' },
              { value: '3', label: '생활 / 잡화' },
            ]}
          />
        );
      case 'ELM-SEL-02':
        return (
          <ElmSel02
            value={demoFilterSelect}
            onChange={setDemoFilterSelect}
            label="실시간 필터 드롭다운"
            placeholder="카테고리 검색/선택..."
            options={[
              { value: 'CAFE', label: '식음료 / 스타벅스', subtext: '지출빈도 상' },
              { value: 'MART', label: '장보기 / 이마트', subtext: '생활비' },
              { value: 'TRANS', label: '교통 / 지하철·버스', subtext: '고정비' },
              { value: 'HOSP', label: '의료 / 병원·약국', subtext: '건강' },
            ]}
          />
        );
      case 'ELM-CMB-01':
        return (
          <div className="space-y-2">
            <ElmCmb01
              label="선택형 직접입력 콤보박스 (사다리 목표 및 커스텀 항목)"
              value={demoComboText}
              onChange={setDemoComboText}
              selectedIcon={demoComboIcon}
              onIconChange={setDemoComboIcon}
              placeholder="선택하거나 직접 입력..."
              options={[
                { value: '1', label: '커피 쏘기', icon: '☕', subtext: '벌칙' },
                { value: '2', label: '디저트 쏘기', icon: '🍰', subtext: '벌칙' },
                { value: '3', label: '점심 쏘기', icon: '🍜', subtext: '벌칙' },
                { value: '4', label: '당첨 (1등)', icon: '🎁', subtext: '보상' },
                { value: '5', label: '통과 (면제)', icon: '💨', subtext: '통과' },
                { value: '6', label: '픽업 당번', icon: '🏃', subtext: '역할' },
              ]}
              onSelectOption={(opt) => {
                setDemoComboText(opt.label);
                if (opt.icon) setDemoComboIcon(opt.icon);
              }}
            />
            <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>현재 선택/입력값: <strong>{demoComboIcon} {demoComboText}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">직접 타이핑 및 목록 선택 가능</span>
            </div>
          </div>
        );
      case 'ELM-FLT-01':
        return (
          <div className="flex flex-wrap gap-2">
            {['전체', '개인장부', '모임장부', '정산대기', '완료'].map((filter, i) => (
              <ElmFlt01
                key={filter}
                label={filter}
                selected={i === 0}
                onClick={() => {}}
              />
            ))}
          </div>
        );
      case 'ELM-CHK-01':
        return (
          <ElmChk01
            label="자동 동기화 큐 및 오프라인 보관 활성화"
            checked={demoCheck}
            onChange={setDemoCheck}
          />
        );
      case 'ELM-RAD-01':
        return (
          <div className="flex items-center gap-4">
            <ElmRad01
              selected={demoRadio === '1'}
              onSelect={() => setDemoRadio('1')}
              label="개인 가계부"
            />
            <ElmRad01
              selected={demoRadio === '2'}
              onSelect={() => setDemoRadio('2')}
              label="모임 가계부"
            />
          </div>
        );
      case 'ELM-SWT-01':
        return (
          <ElmSwt01
            label="실시간 알림 및 사다리 당첨 카톡 공유"
            checked={demoToggle}
            onChange={setDemoToggle}
          />
        );
      case 'ELM-RNG-01':
        return (
          <ElmRng01
            label="참가 인원수 설정 (드래그휠 및 상태바)"
            value={demoRngVal}
            min={2}
            max={10}
            step={1}
            unit="명"
            onChange={setDemoRngVal}
            colorScheme="indigo"
          />
        );
      case 'ELM-CNT-01':
        return (
          <div className="flex items-center gap-3">
            <ElmCnt01 count={27} label="등록 토큰" />
            <ElmCnt01 count={8} label="카테고리" />
            <ElmCnt01 count={142} label="적용 인스턴스" />
          </div>
        );
      case 'ELM-STT-01':
        return (
          <div className="flex flex-wrap gap-2">
            {(
              [
                { type: 'EMERALD', label: '완료 / 승인' },
                { type: 'AMBER', label: '대기 / 보정' },
                { type: 'ROSE', label: '반려 / 오류' },
                { type: 'PURPLE', label: '자산 이동' },
                { type: 'INDIGO', label: '진행중' },
                { type: 'SLATE', label: '기본 보관' },
              ] as const
            ).map((st) => (
              <ElmStt01 key={st.type} type={st.type} label={st.label} />
            ))}
          </div>
        );
      case 'ELM-TRE-01':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                카테고리 분류 트리 (드래그 핸들로 상하/자식 노드 위치 이동 지원)
              </span>
              <button
                type="button"
                onClick={() => setIsTreeEdit(!isTreeEdit)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isTreeEdit ? '완료' : '편집 모드 (드래그 활성화)'}
              </button>
            </div>
            {isTreeEdit && (
              <div className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <span>💡</span>
                <span>핸들(☰)을 드래그하면 실시간 위치 플래그(▲ 위 삽입, ↳ 자식 편입, ▼ 아래 삽입)가 표시됩니다.</span>
              </div>
            )}
            <ElmTre01
              data={treeData}
              isEditMode={isTreeEdit}
              onDataChange={setTreeData}
              onMoveNode={(draggedId, targetId, pos) => {
                const posText = pos === 'inside' ? '하위 자식으로 편입' : pos === 'before' ? '앞으로 삽입' : '뒤로 삽입';
                triggerDemoToast(`[ELM-TRE-01] 노드 위치 변경 완료 (${posText})`, 'success');
              }}
              onSaveNode={(id, newName) => {
                setTreeData((prev) =>
                  prev.map((node) => (node.id === id ? { ...node, name: newName } : node))
                );
              }}
            />
          </div>
        );
      case 'ELM-PRF-01':
        return (
          <div className="flex items-center gap-3">
            <ElmPrf01 name="구본영" size="md" hasEditBadge />
            <ElmPrf01 name="김철수" size="md" />
            <ElmPrf01 name="이영희" size="md" />
            <ElmPrf01 name="박민수" size="md" />
          </div>
        );
      case 'ELM-STP-01':
        return (
          <ElmStp01
            currentStep={demoStep}
            steps={[
              { number: 1, label: '인원 설정' },
              { number: 2, label: '목표 지정' },
              { number: 3, label: '사다리 타기' },
              { number: 4, label: '결과 공유' },
            ]}
          />
        );
      case 'ELM-TAB-01':
        return (
          <ElmTab01
            activeTab={demoTab}
            onTabChange={setDemoTab}
            tabs={[
              { id: 'TAB1', label: '장부 작성', count: 12 },
              { id: 'TAB2', label: '지출 분석' },
              { id: 'TAB3', label: '정산 관리', count: 3 },
            ]}
          />
        );
      case 'ELM-SLD-02':
        return (
          <ElmSld02>
            {['1만원', '2만원', '3만원', '5만원', '10만원', '20만원', '30만원', '50만원'].map((chip) => (
              <span
                key={chip}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </ElmSld02>
        );
      case 'ELM-SLD-03':
        return (
          <ElmSld03>
            {['☕ 스타벅스', '🍔 맥도날드', '🍜 틈새라면', '🍕 도미노피자', '🍗 교촌치킨', '🍰 투썸플레이스', '🍱 한솥도시락'].map((shop) => (
              <span
                key={shop}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap shadow-2xs"
              >
                {shop}
              </span>
            ))}
          </ElmSld03>
        );
      case 'ELM-TIP-01':
        return (
          <div className="flex flex-wrap items-center gap-3">
            <ElmTip01 text="우리은행 1002-892-918231 (가계부 대표계좌)" />
            <ElmTip01 text="신한카드 Deep Oil 2026-10-21 ₩45,000" />
          </div>
        );
      case 'ELM-HLP-01':
        return (
          <div className="flex items-center gap-3">
            <ElmHlp01
              title="사다리 게임 목표 설정 안내"
              tooltip="도움말 확인"
              colorScheme="indigo"
            >
              <p>사다리 기둥 목표를 클릭하면 전폭 레이어 팝업으로 상세 설정할 수 있습니다.</p>
            </ElmHlp01>
            <ElmHlp01
              title="카드 명세서 대사 안내"
              buttonText="대사 안내"
              colorScheme="sky"
              badge="신규 규격"
            >
              <p>OCR 엔진을 통해 6대 카드사 명세서를 자동 파싱합니다.</p>
            </ElmHlp01>
          </div>
        );
      case 'ELM-BSH-01':
        return (
          <div>
            <button
              type="button"
              onClick={() => setDemoBottomSheetOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
            >
              바텀시트 모달 열기 ⬆
            </button>
            <ElmBsh01
              isOpen={demoBottomSheetOpen}
              onClose={() => setDemoBottomSheetOpen(false)}
              title="토큰 데모 바텀시트 모달"
            >
              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  모바일 공간감(Spaciousness)을 극대화하기 위해 복잡한 입력은 하단 바텀시트로 분리 격리합니다.
                </p>
                <ElmInp01
                  label="새 카테고리"
                  value="식음료/카페"
                  onChange={() => {}}
                />
                <button
                  type="button"
                  onClick={() => setDemoBottomSheetOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  확인
                </button>
              </div>
            </ElmBsh01>
          </div>
        );
      case 'ELM-TOA-01':
        return (
          <div className="space-y-3">
            <div className="text-xs text-slate-600 dark:text-zinc-400 break-keep">
              복사, 재배치, 저장 시 화면 하단 중앙에 부드럽게 노출되는 표준 비침습적 피드백 토스트/스낵바입니다. 아래 버튼을 눌러 피드백을 테스트해보세요.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => triggerDemoToast('🎲 주사위를 굴려 사다리 경로가 새롭게 재배치되었습니다!', 'success')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                ✓ 성공 토스트 (사다리 재배치)
              </button>
              <button
                type="button"
                onClick={() => triggerDemoToast('🎯 당첨 및 통과 목표 위치가 무작위로 재배치되었습니다!', 'info')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                ℹ 안내 토스트 (목표 재배치)
              </button>
              <button
                type="button"
                onClick={() => triggerDemoToast('⚠️ 입력되지 않은 필수 항목이 있습니다. 확인해주세요.', 'warning')}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                ⚠ 경고 토스트
              </button>
              <button
                type="button"
                onClick={() => triggerDemoToast('❌ 데이터 동기화 중 일시적 오류가 발생했습니다.', 'error')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                ✕ 에러 토스트
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-xs text-slate-500 flex items-center justify-between">
            <span>{token.name} 전용 라이브 인스턴스</span>
            <span className="font-mono text-[11px] text-indigo-500">{token.id}</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100">
      {/* 1. 상단 타이틀 및 기준선 가이드 바 */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              모아보고 공통 UI 토큰 시스템 쇼케이스
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
              SMP-01
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
              v2.2 메타데이터 연동
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 break-keep">
            FSD 아키텍처 기반 27종 원자적 토큰 규격 • 44px 터치타겟 가드레일 • 모바일 반응형 전폭 레이어 검증
          </p>
        </div>

        {/* 도구 컨트롤 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCenterGuide(!showCenterGuide)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showCenterGuide
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>기준선 50% {showCenterGuide ? '끄기' : '켜기'}</span>
          </button>
        </div>
      </div>

      {/* 기준선 가이드 활성화 알림 */}
      {showCenterGuide && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0 text-rose-500" />
          <span>
            빨간 점선은 컴포넌트 50% 중심축선입니다. 텍스트와 아이콘의 수평/수직 정렬을 정밀 검증합니다.
          </span>
        </div>
      )}

      {/* 2. 검색창 및 카테고리 필터 슬라이더 바 (ElmSld03 적용) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <ElmInp04
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="토큰 ID, 이름, 설명 검색..."
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 shrink-0">
            <span>표시 중: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredTokens.length}</strong> / {UI_TOKENS_METADATA.length}종</span>
          </div>
        </div>

        {/* 카테고리 필터 슬라이더 */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
          <ElmSld03>
            {categories.map((cat) => {
              const count = (UI_TOKENS_METADATA as TokenMetaItem[]).filter(
                (t) => cat === 'ALL' || t.category === cat
              ).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30'
                      : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span>{cat === 'ALL' ? '전체 보기' : cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </ElmSld03>
        </div>
      </div>

      {/* 3. 토큰 카드 갤러리 리스트 */}
      <div className="space-y-4">
        {filteredTokens.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 text-slate-400">
            검색 결과와 일치하는 UI 토큰이 없습니다.
          </div>
        ) : (
          filteredTokens.map((token) => {
            const isExpanded = expandedTokenId === token.id;

            return (
              <div
                key={token.id}
                className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4 transition-all"
              >
                {/* 토큰 헤더 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {token.id}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {token.name}
                    </h2>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                        token.category
                      )}`}
                    >
                      {token.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      적용: {token.usedScreenIds.length}개 화면
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedTokenId(isExpanded ? null : token.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>{isExpanded ? '상세 스펙 접기' : '상세 스펙 / 코드'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed break-keep">
                  {token.description}
                </p>

                {/* 인터랙티브 라이브 데모 영역 */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Interactive Live Demo
                  </span>
                  <div
                    className={`p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#0B0F17]/60 relative ${
                      showCenterGuide
                        ? 'before:content-[""] before:absolute before:inset-x-0 before:top-1/2 before:border-b before:border-dashed before:border-rose-400 before:z-10'
                        : ''
                    }`}
                  >
                    {renderLiveDemo(token)}
                  </div>
                </div>

                {/* 접이식 상세 가드레일, Props, 코드 스니펫 */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4 animate-in fade-in duration-150">
                    {/* 가드레일 매트릭스 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>핵심 디자인 및 인터랙션 가드레일</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            중앙 정렬 규격
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300 font-medium">
                            {token.guardrails.verticalCenterRule}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            텍스트 줄바꿈 정책
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300 font-medium">
                            {token.guardrails.textWrapPolicy}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            최소 터치 타겟 규격
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300 font-medium">
                            {token.guardrails.touchTargetMin}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold block">
                            이벤트 격리 및 전파 제어
                          </span>
                          <p className="text-slate-700 dark:text-zinc-300 font-medium">
                            {token.guardrails.eventIsolation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Props 및 코드 스니펫 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {/* Props Interface */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                          TypeScript Props Interface
                        </span>
                        <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
                          {token.propsInterface}
                        </pre>
                      </div>

                      {/* Code Snippet */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block">
                            JSX 구현 예시 스니펫
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(token.codeSnippet, token.id)}
                            className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === token.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">복사 완료!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>코드 복사</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3 rounded-xl bg-slate-900 text-indigo-300 text-[11px] font-mono overflow-x-auto leading-relaxed">
                          {token.codeSnippet}
                        </pre>
                      </div>
                    </div>

                    {/* 적용 화면 태그 목록 */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 block">
                        실제 프로젝트 내 적용 화면
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {token.usedScreenIds.map((sc) => (
                          <span
                            key={sc.screenId}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-700 dark:text-zinc-300 font-medium flex items-center gap-1"
                          >
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                              {sc.screenId}
                            </span>
                            <span>{sc.screenName}</span>
                            <span className="text-slate-400 text-[10px]">({sc.role})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Speed Dial FAB 데모 */}
      <ElmFab01
        onTopClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOcrClick={() => {}}
        onQuickExpenseClick={() => {}}
        onQuickDutyClick={() => {}}
      />

      {/* 화면 하단 플로팅 표준 피드백 토스트 레이어 (ELM-TOA-01) */}
      <ElmToast01
        message={demoToastMsg}
        type={demoToastType}
        onClose={() => setDemoToastMsg(null)}
      />
    </div>
  );
};
