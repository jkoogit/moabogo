import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmInp04,
  ElmSel01,
  ElmSel02,
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
  ElmBsh01,
  TreeNode,
} from '../elements/Tokens';
import {
  Sparkles,
  CheckCircle,
  Clock,
  AlertTriangle,
  Coins,
  Shield,
  Layers,
  Eye,
  Sliders,
} from 'lucide-react';

export const SCR_SMP_01_공통컴포넌트쇼케이스: React.FC = () => {
  // Demo states
  const [inputText, setInputText] = useState('스타벅스 강남점 결제');
  const [searchText, setSearchText] = useState('영수증');
  const [selectVal, setSelectVal] = useState('1');
  const [filterSelectVal, setFilterSelectVal] = useState('CAFE');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [checkVal, setCheckVal] = useState(true);
  const [radioVal, setRadioVal] = useState('1');
  const [toggleVal, setToggleVal] = useState(true);
  const [activeTab, setActiveTab] = useState('TAB1');
  const [isTreeEdit, setIsTreeEdit] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);

  // Sample tree data
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 min-h-screen text-slate-900 relative">
      {/* Visual Alignment Guide Notice (CSS Selector 1) */}
      <div className="p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 leading-none whitespace-nowrap">
              토큰 쇼케이스
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-semibold whitespace-nowrap shrink-0">
              SMP-01
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap shrink-0">
              LETO 검증
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-normal break-keep">
            14종 공통 토큰 • 중앙정렬 검증
          </p>
        </div>

        <div className="flex items-center justify-end sm:justify-start shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            type="button"
            onClick={() => setShowCenterGuide(!showCenterGuide)}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showCenterGuide
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">기준선 {showCenterGuide ? '끄기' : '켜기'}</span>
          </button>
        </div>
      </div>

      {/* Guide Line CSS Overlay */}
      {showCenterGuide && (
        <div className="p-2.5 sm:p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 animate-pulse break-keep">
          <span>🎯 빨간 점선은 컴포넌트 50% 중심축선입니다. 텍스트와 아이콘 중앙 일치 여부를 검증합니다.</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1 : 기본 타이틀 및 텍스트 토큰 (CSS Selector 2)
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 relative">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
              [ELM-TYP-01] 타이틀
            </span>
          </div>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            중앙정렬 규격
          </span>
        </div>

        <div className={`space-y-3 relative ${showCenterGuide ? 'before:content-[""] before:absolute before:inset-x-0 before:top-1/2 before:border-b before:border-dashed before:border-rose-400 before:z-20' : ''}`}>
          <ElmTyp01
            title="우리집 가계부"
            badge="그룹"
            subtitle="가족 4명 • 당월 생활비 ₩1,248,000"
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 : 입력 및 선택 토큰 (상시 X 클리어 버튼, 선택필터드롭다운 추가)
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 flex-wrap">
          <span className="text-xs font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
            [ELM-INP/SEL] 입력·선택 & 필터드롭다운
          </span>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            상시 ✕ & 실시간 필터
          </span>
        </div>

        {/* 모바일 모드 시 폭 제약 발생 시 세로로 줄바꿈되어 순차 배치 */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="w-full">
            <ElmInp01
              label="일반 입력필드 (상시 X Clear)"
              value={inputText}
              onChange={setInputText}
              placeholder="내용을 입력하세요..."
            />
            <span className="text-[10px] text-slate-400 mt-1 block break-keep">
              * 글자 입력 시 우측 ✕ 버튼으로 원클릭 초기화
            </span>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-700 mb-1 leading-none">
              검색 입력필드 (Search + ✕)
            </label>
            <ElmInp04
              value={searchText}
              onChange={setSearchText}
              placeholder="영수증 및 거래처 검색..."
            />
            <span className="text-[10px] text-slate-400 mt-1 block break-keep">
              * Search 라인 아이콘 + 우측 ✕ 삭제 버튼 결합
            </span>
          </div>

          <div className="w-full">
            <ElmSel01
              label="선택 드롭다운"
              value={selectVal}
              onChange={setSelectVal}
              options={[
                { value: '1', label: '식음료/카페' },
                { value: '2', label: '식료품/마트' },
                { value: '3', label: '생활/잡화' },
              ]}
            />
            <span className="text-[10px] text-slate-400 mt-1 block break-keep">
              * Chevron 아이콘과 텍스트 수평축 중앙 일치
            </span>
          </div>

          <div className="w-full">
            <ElmSel02
              label="선택필터드롭다운 [신규속성]"
              value={filterSelectVal}
              onChange={setFilterSelectVal}
              placeholder="카테고리 검색/선택..."
              options={[
                { value: 'CAFE', label: '식음료 / 스타벅스', subtext: '지출빈도 상' },
                { value: 'MART', label: '장보기 / 이마트', subtext: '생활비' },
                { value: 'TRANS', label: '교통 / 지하철·버스', subtext: '고정비' },
                { value: 'HOSP', label: '의료 / 병원·약국', subtext: '건강' },
                { value: 'DUTY', label: '모아당번 / 분리수거', subtext: '과업' },
                { value: 'LOAN', label: '모아빌림 / 차용금', subtext: '자산이동' },
              ]}
            />
            <span className="text-[10px] text-indigo-600 font-medium mt-1 block break-keep">
              * 텍스트 입력 시 실시간 필터 + 선택 지원
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 : 필터 칩, 라디오, 체크박스, 토글 스위치 (텍스트 클릭 연동 & 모바일 줄바꿈)
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 flex-wrap">
          <span className="text-xs font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
            [ELM-FLT/SWT] 선택·스위치
          </span>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            텍스트 클릭 연동 & 모바일 줄바꿈
          </span>
        </div>

        {/* Filter chips */}
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-2 break-keep">
            [ELM-FLT-01] 필터 선택 칩 (내부 줄바꿈 금지, 터치 32px+)
          </span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <ElmFlt01
              label="전체 내역"
              count={24}
              selected={activeFilter === 'ALL'}
              onClick={() => setActiveFilter('ALL')}
            />
            <ElmFlt01
              label="식음료/카페"
              count={12}
              selected={activeFilter === 'CAFE'}
              onClick={() => setActiveFilter('CAFE')}
            />
            <ElmFlt01
              label="식료품/마트"
              count={5}
              selected={activeFilter === 'MART'}
              onClick={() => setActiveFilter('MART')}
            />
            <ElmFlt01
              label="자산이동 (제외)"
              count={4}
              selected={activeFilter === 'ASSET'}
              onClick={() => setActiveFilter('ASSET')}
            />
            <ElmFlt01
              label="독립정산"
              count={3}
              selected={activeFilter === 'EVENT'}
              onClick={() => setActiveFilter('EVENT')}
            />
          </div>
        </div>

        {/* Radios, Checks & Toggle Switch - 모바일 모드 시 폭 제약되면 세로 줄바꿈 */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2 border-t border-slate-100">
          <div className="w-full sm:flex-1 min-w-[200px] p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              [ELM-CHK-01] 체크박스
            </span>
            <ElmChk01
              checked={checkVal}
              onChange={setCheckVal}
              label="생활비 통계 제외 (자산이동)"
              description="글자 클릭 시에도 체크 토글 연동"
            />
          </div>

          <div className="w-full sm:flex-1 min-w-[200px] p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              [ELM-RAD-01] 라디오 버튼
            </span>
            <div className="flex items-center gap-3">
              <ElmRad01
                selected={radioVal === '1'}
                onSelect={() => setRadioVal('1')}
                label="개인 가계부"
              />
              <ElmRad01
                selected={radioVal === '2'}
                onSelect={() => setRadioVal('2')}
                label="그룹 가계부"
              />
            </div>
            <span className="text-[10px] text-slate-400 block">* 글자 클릭 시에도 라디오 선택</span>
          </div>

          <div className="w-full sm:flex-1 min-w-[200px] p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              [ELM-SWT-01] 토글 스위치
            </span>
            <ElmSwt01
              checked={toggleVal}
              onChange={setToggleVal}
              label="카카오 알림톡 자동 발송"
              description="라벨 영역 클릭 시 스위치 토글 연동"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 : 상태 Pills 뱃지 6종 & 카운트 뱃지
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
            [ELM-STT/CNT] 상태·건수 뱃지
          </span>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            시맨틱 규격
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <ElmStt01
            type="EMERALD"
            label="완료 / 승인"
            icon={<CheckCircle className="w-3 h-3" />}
          />
          <ElmStt01
            type="AMBER"
            label="대기 / 보정"
            icon={<Clock className="w-3 h-3" />}
          />
          <ElmStt01
            type="ROSE"
            label="반려 / 실패"
            icon={<AlertTriangle className="w-3 h-3" />}
          />
          <ElmStt01
            type="PURPLE"
            label="자산이동 / 채권"
            icon={<Coins className="w-3 h-3" />}
          />
          <ElmStt01
            type="INDIGO"
            label="수행 중"
            icon={<Sparkles className="w-3 h-3" />}
          />
          <ElmStt01
            type="SLATE"
            label="기본 대기"
            icon={<Shield className="w-3 h-3" />}
          />

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <ElmCnt01 count={18} label="총" />
          <ElmCnt01 count="3건" label="미승인" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 5 : 수평 스테퍼 & 탭 네비게이션 & 프로필 아바타
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
            [ELM-STP/TAB] 스테퍼·탭·프로필
          </span>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            단계 및 네비게이션
          </span>
        </div>

        {/* Stepper */}
        <div className="max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-slate-700 block text-center break-keep">
            모아당번 3단계 스테퍼 (현재 Step {currentStep})
          </span>
          <ElmStp01 currentStep={currentStep} />
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-2.5 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Step 1
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-2.5 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Step 2
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-2.5 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Step 3
            </button>
          </div>
        </div>

        {/* Tab & Avatars - 모바일 모드 시 프로필 영역이 줄바꿈되어 아래 배치 */}
        <div className="flex flex-col lg:flex-row gap-6 pt-4 border-t border-slate-100 w-full">
          <div className="w-full lg:flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-700 block mb-2 break-keep">
              [ELM-TAB-01] 탭 컨텐츠
            </span>
            <ElmTab01
              tabs={[
                { id: 'TAB1', label: '가계부 내역', count: 18 },
                { id: 'TAB2', label: '모아당번', count: 3 },
                { id: 'TAB3', label: '모아용돈', count: 2 },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            <div className="p-3 bg-slate-50 text-xs text-slate-600 rounded-b-lg border-x border-b border-slate-200">
              현재 활성 탭: <strong>{activeTab}</strong>
            </div>
          </div>

          <div className="w-full lg:flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-700 block mb-2 break-keep">
              [ELM-PRF-01] 프로필 아바타 (모바일 시 아래 줄바꿈 배치)
            </span>
            <div className="flex items-center gap-4 py-2">
              <ElmPrf01 size="sm" name="김은지" />
              <ElmPrf01 size="md" name="구본영" hasEditBadge onEditClick={() => alert('프로필 사진 수정')} />
              <ElmPrf01 size="lg" name="박준혁" hasEditBadge onEditClick={() => alert('프로필 사진 수정')} />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 break-keep">
              * 32px / 48px / 64px 규격 및 사진 변경 카메라 버튼
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 : 슬라이드 휠 트랙 & 데이터 트리 (뷰/인라인 편집) & [ELM-SLD-03]
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <span className="text-xs font-mono font-bold text-indigo-600 whitespace-nowrap shrink-0">
            [ELM-SLD/TRE] 슬라이드·트리
          </span>
          <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            Magnetic Snap & 스크롤바 제거
          </span>
        </div>

        {/* Slide Wheel Track (기본형) */}
        <div>
          <span className="text-xs font-semibold text-slate-700 block mb-2 break-keep">
            [ELM-SLD-02] 가로 스크롤 트랙 (좌우 ◀, ▶ 결합)
          </span>
          <ElmSld02>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="min-w-[200px] p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all snap-start flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">모임 과업 #{idx}</span>
                    <ElmStt01 type={idx % 2 === 0 ? 'EMERALD' : 'AMBER'} label={idx % 2 === 0 ? '완료' : '진행중'} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 break-keep">
                    주말 분리수거 및 동창회 펜션 식기 정리
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-400 flex justify-between">
                  <span>담당: 구민우(자녀)</span>
                  <span className="font-mono text-indigo-600 font-bold">10-06</span>
                </div>
              </div>
            ))}
          </ElmSld02>
        </div>

        {/* [ELM-SLD-03] 신규: 슬라이드드래그휠(버튼) - 스크롤바 제거, 드래그 자석, 휠 가로이동, 버튼 옵션, 이벤트 전파 차단 */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-700 break-keep">
              [ELM-SLD-03] 슬라이드드래그휠(버튼) — 스크롤바 제거, 드래그 자석, 마우스 휠, 버튼 1단계 이동
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              배경 스크롤 전파 차단
            </span>
          </div>
          <ElmSld03 showNavButtons={true} stepWidth={240}>
            {[
              { id: 1, title: '스타벅스 강남점', tag: '카페/간식', amount: '₩6,500', date: '오늘 14:20' },
              { id: 2, title: '이마트 양재점', tag: '생활/마트', amount: '₩84,200', date: '어제 19:10' },
              { id: 3, title: '파리바게뜨 서초', tag: '베이커리', amount: '₩14,800', date: '10-04' },
              { id: 4, title: 'GS25 역삼', tag: '편의점', amount: '₩4,200', date: '10-03' },
              { id: 5, title: '모아당번 이행', tag: '분리수거 완료', amount: '인증완료', date: '10-02' },
              { id: 6, title: '정산: 주말등산 1/N', tag: '독립정산', amount: '₩28,000', date: '10-01' },
            ].map((item) => (
              <div
                key={item.id}
                className="min-w-[210px] p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between shrink-0"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate">{item.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-bold text-indigo-600 font-mono">
                    {item.amount}
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>상태: 정상</span>
                  <span className="font-mono">{item.date}</span>
                </div>
              </div>
            ))}
          </ElmSld03>
          <p className="text-[11px] text-slate-400 mt-2 break-keep">
            * 마우스/터치 드래그 시 가장 가까운 카드 위치로 자석(Magnetic) 정렬되며, 상하 휠 동작 시 배경 페이지 스크롤을 차단(stopPropagation)하고 가로로 부드럽게 이동합니다.
          </p>
        </div>

        {/* Tree view / edit */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-700 break-keep">
              [ELM-TRE-01] 카테고리 트리
            </span>
            <button
              type="button"
              onClick={() => setIsTreeEdit(!isTreeEdit)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              {isTreeEdit ? '뷰 모드' : '인라인 수정 (≡)'}
            </button>
          </div>
          <ElmTre01
            data={treeData}
            isEditMode={isTreeEdit}
            onSaveNode={(id, newName) => {
              setTreeData((prev) =>
                prev.map((n) => (n.id === id ? { ...n, name: newName } : n))
              );
            }}
          />
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 : 모바일 바텀시트 모달 테스트
          ========================================================================= */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono font-bold text-indigo-600 block">
            [ELM-BSH-01] 바텀시트 모달
          </span>
          <p className="text-xs text-slate-500 mt-0.5 break-keep">
            하단 시트로 복잡한 입력을 격리하여 모바일 공간감 확보
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBottomSheetOpen(true)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 whitespace-nowrap text-center shrink-0"
        >
          바텀시트 열기 ⬆
        </button>
      </section>

      {/* Bottom Sheet Component */}
      <ElmBsh01
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="카테고리 상세 편집 (바텀시트 모달)"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            모바일 공간감(Spaciousness)을 확보하기 위해 복잡한 입력 항목은 메인 스크린 대신 바텀시트에서 전담합니다.
          </p>
          <ElmInp01
            label="새 카테고리명"
            value="취미 / 레저 / 피트니스"
            onChange={() => {}}
          />
          <ElmSel01
            label="상위 분류 지정"
            value="1"
            onChange={() => {}}
            options={[
              { value: '1', label: '개인 생활비' },
              { value: '2', label: '가족 공용' },
            ]}
          />
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setBottomSheetOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              닫기
            </button>
            <button
              onClick={() => setBottomSheetOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg"
            >
              저장 완료
            </button>
          </div>
        </div>
      </ElmBsh01>

      {/* FAB Speed Dial Component */}
      <ElmFab01
        onTopClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOcrClick={() => alert('[FAB 액션] 2단계 OCR 영수증 스캔 호출')}
        onQuickExpenseClick={() => alert('[FAB 액션] 빠른 지출 등록 폼 호출')}
        onQuickDutyClick={() => alert('[FAB 액션] 당번 빠른 사진 인증 호출')}
      />
    </div>
  );
};
