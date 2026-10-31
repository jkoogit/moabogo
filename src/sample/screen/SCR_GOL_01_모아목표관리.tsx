import React, { useState } from 'react';
import {
  ElmTyp01,
  ElmInp01,
  ElmSel01,
  ElmSel02,
  ElmStt01,
  ElmCnt01,
  ElmPrf01,
  ElmCmb01,
  ElmFlt01,
} from '../elements/Tokens';
import {
  GoalItem,
  GoalCategory,
  GoalRole,
  INITIAL_GOAL_LIST,
} from '../data/goal-mock-data';
import {
  Target,
  Users,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LayoutGrid,
  List,
  Calendar,
  X,
  Activity,
  Wallet,
  BookOpen,
  Bookmark,
  PiggyBank,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

// ==========================================
// 목표 카테고리 프리셋 (ELM-SEL-02용)
// ==========================================
const GOAL_CATEGORY_OPTIONS = [
  { value: 'HABIT', label: '🏃 생활습관 · 운동 (1만보 걷기, 홈트, 모닝루틴 등)' },
  { value: 'FINANCE', label: '💰 정기적금 · 자산 (목돈 모으기, 주간 저축 등)' },
  { value: 'STUDY', label: '📚 자격증 · 학습 (기사 자격증, 코딩, 어학 등)' },
  { value: 'BOOK', label: '📖 도서 · 문화 (월 2권 완독, 전시회, 서평 등)' },
  { value: 'SAVING', label: '🎯 소비절약 · 생활 (외식비 줄이기, 배달 금지 등)' },
];

export const SCR_GOL_01_모아목표관리: React.FC<{
  onSelectGoal?: (goalId: string) => void;
  onBack?: () => void;
}> = ({ onSelectGoal, onBack }) => {
  // 목표 목록 상태
  const [goals, setGoals] = useState<GoalItem[]>(INITIAL_GOAL_LIST);

  // 검색 조건 상태
  // 1) ELM-CMB-01: 목표 유형 선택 (텍스트 / 드롭다운 콤보)
  const [categoryComboText, setCategoryComboText] = useState('전체 목표');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // 2) ELM-FLT-01: 내 역할 다중선택 ('ALL', 'MANAGER', 'PARTICIPANT', 'VIEWER')
  const [selectedRoles, setSelectedRoles] = useState<GoalRole[]>([]);

  // 3) 조회 뷰 모드: 카드보기 ('GRID') vs 목록보기 ('LIST')
  const [viewType, setViewType] = useState<'GRID' | 'LIST'>('GRID');

  // 4) 팝업 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 목표 등록 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryVal, setNewCategoryVal] = useState('HABIT');
  const [newFixedRule, setNewFixedRule] = useState('');
  const [newInputRule, setNewInputRule] = useState('');
  const [newTargetVal, setNewTargetVal] = useState('10000');
  const [newUnit, setNewUnit] = useState('보');
  const [newPeriod, setNewPeriod] = useState('30');

  // 피드백 알림 헬퍼
  const showToast = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // 역할 다중선택 토글
  const handleToggleRole = (role: GoalRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  // 검색조건 초기화
  const handleResetFilters = () => {
    setCategoryComboText('전체 목표');
    setSelectedCategory('ALL');
    setSelectedRoles([]);
    showToast('검색 필터가 초기화되었습니다.');
  };

  // 필터링 적용된 목표 목록
  const filteredGoals = goals.filter((g) => {
    // 카테고리 필터
    if (selectedCategory !== 'ALL' && g.category !== selectedCategory) {
      return false;
    }
    // 역할 필터 (다중선택: 선택된 역할이 하나라도 있으면 포함)
    if (selectedRoles.length > 0 && !selectedRoles.includes(g.myRole)) {
      return false;
    }
    return true;
  });

  // 목표 등록 제출 핸들러
  const handleCreateGoalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      showToast('⚠️ 목표 제목을 입력해주세요.');
      return;
    }

    const matchedCat = GOAL_CATEGORY_OPTIONS.find((c) => c.value === newCategoryVal);
    const catLabel = matchedCat ? matchedCat.label.split(' ')[1] : '생활습관';

    const created: GoalItem = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategoryVal as GoalCategory,
      categoryLabel: catLabel,
      period: `2026.11.01 ~ 2026.11.${newPeriod}`,
      dDay: `D-${newPeriod}`,
      nextSchedule: '신규 목표 개설 완료',
      myRole: 'MANAGER', // 내가 등록했으므로 관리자
      status: 'IN_PROGRESS',
      progressRate: 0,
      targetValue: parseInt(newTargetVal, 10) || 10000,
      currentTotal: 0,
      unit: newUnit || '보',
      fixedRule: newFixedRule.trim() || '목표 기본 규칙 및 일일 최소 인증 기준',
      inputRule: newInputRule.trim() || '실천 수치 입력 및 증빙 캡처 사진 첨부',
      companions: [
        {
          id: 'c-me',
          name: '구본영(나)',
          progress: `0 ${newUnit} 달성`,
          status: 'IN_PROGRESS',
          currentValue: 0,
          targetValue: parseInt(newTargetVal, 10) || 10000,
          achievementRate: 0,
        },
      ],
      viewers: [],
      cheerCount: 0,
      userCheered: false,
      comments: [],
      records: [],
    };

    setGoals([created, ...goals]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewFixedRule('');
    setNewInputRule('');
    showToast(`✓ 모아목표 "${created.title}"이(가) 등록되었습니다.`);
  };

  // 목표 클릭 시 상세 화면으로 이동
  const handleGoalClick = (id: string) => {
    if (onSelectGoal) {
      onSelectGoal(id);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-3.5 pb-16 space-y-4 sm:space-y-5 bg-slate-50 dark:bg-[#0B0F17] min-h-screen text-slate-900 dark:text-zinc-100 transition-colors">
      {/* ─────────────────────────────────────────────────────────────
          1. 상단 헤더: 뒤로가기 & 화면 타이틀
      ───────────────────────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
              title="메인 대시보드로 돌아가기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <ElmTyp01
            title="모아목표 관리"
            badge="SCR-GOL-01"
            subtitle="함께 실천하는 습관·자산·학습 목표 챌린지 • 관리자 / 참가자 / 관람자 체계"
          />
        </div>

        {/* 우측 뷰 토글 (카드보기 / 목록보기) */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/80 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewType('GRID')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewType === 'GRID'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>카드보기</span>
          </button>
          <button
            type="button"
            onClick={() => setViewType('LIST')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewType === 'LIST'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>목록보기</span>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. 검색조건 영역 (ELM-CMB-01 + ELM-FLT-01 + 초기화 + 목표등록 버튼)
      ───────────────────────────────────────────────────────────── */}
      <section className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* 좌측 필터 그룹: [카테고리 콤보박스] + [역할 다중선택 필터] + [초기화 아이콘] */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
            {/* ELM-CMB-01: 목표 유형 선택 */}
            <div className="w-full sm:w-56 shrink-0">
              <ElmCmb01
                value={categoryComboText}
                onChange={setCategoryComboText}
                onSelectOption={(opt) => {
                  setCategoryComboText(opt.label);
                  setSelectedCategory(opt.value);
                }}
                options={[
                  { value: 'ALL', label: '전체 목표' },
                  { value: 'HABIT', label: '🏃 생활습관 · 운동' },
                  { value: 'FINANCE', label: '💰 정기적금 · 자산' },
                  { value: 'STUDY', label: '📚 자격증 · 학습' },
                  { value: 'BOOK', label: '📖 도서 · 문화' },
                  { value: 'SAVING', label: '🎯 소비절약 · 생활' },
                ]}
                placeholder="목표 유형 검색/선택"
                size="sm"
              />
            </div>

            {/* 구분선 (데스크톱) */}
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-zinc-700" />

            {/* ELM-FLT-01: 내 역할 다중선택 필터 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mr-1">
                내 역할:
              </span>
              <ElmFlt01
                label="전체역할"
                count={goals.length}
                selected={selectedRoles.length === 0}
                onClick={() => setSelectedRoles([])}
              />
              <ElmFlt01
                label="관리자"
                count={goals.filter((g) => g.myRole === 'MANAGER').length}
                selected={selectedRoles.includes('MANAGER')}
                onClick={() => handleToggleRole('MANAGER')}
              />
              <ElmFlt01
                label="참가자"
                count={goals.filter((g) => g.myRole === 'PARTICIPANT').length}
                selected={selectedRoles.includes('PARTICIPANT')}
                onClick={() => handleToggleRole('PARTICIPANT')}
              />
              <ElmFlt01
                label="관람자"
                count={goals.filter((g) => g.myRole === 'VIEWER').length}
                selected={selectedRoles.includes('VIEWER')}
                onClick={() => handleToggleRole('VIEWER')}
              />
            </div>

            {/* 초기화 아이콘 버튼 */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[38px] min-w-[38px] p-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="검색 조건 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 우측: [목표등록] 버튼 */}
          <div className="shrink-0 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>목표등록</span>
            </button>
          </div>
        </div>

        {/* 필터 결과 카운트 안내 */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>
            조회된 목표: <strong className="text-slate-800 dark:text-zinc-200">{filteredGoals.length}</strong>개
          </span>
          <span className="text-[11px]">
            {selectedRoles.length > 0 && `(선택된 역할: ${selectedRoles.map((r) => (r === 'MANAGER' ? '관리자' : r === 'PARTICIPANT' ? '참가자' : '관람자')).join(', ')})`}
          </span>
        </div>
      </section>

      {/* 피드백 토스트 알림 */}
      {feedbackNotice && (
        <aside className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in shadow-xs">
          <span>{feedbackNotice}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-indigo-500 hover:text-indigo-700 cursor-pointer"
          >
            ✕
          </button>
        </aside>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. 목표 목록 영역 (카드보기 vs 목록보기)
      ───────────────────────────────────────────────────────────── */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 text-xs text-slate-400 space-y-2">
          <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">조건에 부합하는 목표가 없습니다.</p>
          <p>검색 필터를 재설정하거나 우측 상단의 [목표등록] 버튼을 눌러 새 목표를 개설해보세요.</p>
        </div>
      ) : viewType === 'GRID' ? (
        /* [3-A] 카드보기 (Grid View) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGoals.map((goal) => {
            const roleBadgeType =
              goal.myRole === 'MANAGER'
                ? 'INDIGO'
                : goal.myRole === 'PARTICIPANT'
                ? 'EMERALD'
                : 'PURPLE';
            const roleLabel =
              goal.myRole === 'MANAGER'
                ? '내 역할: 관리자'
                : goal.myRole === 'PARTICIPANT'
                ? '내 역할: 참가자'
                : '내 역할: 관람자';

            return (
              <div
                key={goal.id}
                onClick={() => handleGoalClick(goal.id)}
                className="group p-5 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* 상단 뱃지 행: 카테고리 / 내 역할 / D-Day */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      {goal.categoryLabel}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <ElmStt01 type={roleBadgeType} label={roleLabel} />
                      <span className="text-xs font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                        {goal.dDay}
                      </span>
                    </div>
                  </div>

                  {/* 목표 제목 및 일정 */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {goal.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">
                      {goal.nextSchedule}
                    </p>
                  </div>

                  {/* 진척률 바 */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-zinc-400">달성 현황</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {goal.progressRate}% ({goal.currentTotal.toLocaleString()}/{goal.targetValue.toLocaleString()} {goal.unit})
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, goal.progressRate)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 카드 푸터: 참가/관람자 수 및 상세보기 화살표 */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      동행 {goal.companions.length}명
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-purple-500" />
                      관람 {goal.viewers.length}명
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>상세보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* [3-B] 목록보기 (Table / List View) */
        <div className="rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 uppercase font-bold">
                <tr>
                  <th className="py-3.5 px-4">목표유형</th>
                  <th className="py-3.5 px-4">목표명</th>
                  <th className="py-3.5 px-4">내 역할</th>
                  <th className="py-3.5 px-4">진척률</th>
                  <th className="py-3.5 px-4">D-Day</th>
                  <th className="py-3.5 px-4 text-center">동행/관람</th>
                  <th className="py-3.5 px-4 text-right">이동</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredGoals.map((goal) => (
                  <tr
                    key={goal.id}
                    onClick={() => handleGoalClick(goal.id)}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-zinc-300">
                      {goal.categoryLabel}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-zinc-100 block text-sm">
                        {goal.title}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{goal.nextSchedule}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <ElmStt01
                        type={
                          goal.myRole === 'MANAGER'
                            ? 'INDIGO'
                            : goal.myRole === 'PARTICIPANT'
                            ? 'EMERALD'
                            : 'PURPLE'
                        }
                        label={goal.myRole === 'MANAGER' ? '관리자' : goal.myRole === 'PARTICIPANT' ? '참가자' : '관람자'}
                      />
                    </td>
                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                        <span>{goal.progressRate}%</span>
                        <span className="text-slate-400">
                          {goal.currentTotal.toLocaleString()} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{ width: `${Math.min(100, goal.progressRate)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-500">{goal.dDay}</td>
                    <td className="py-3.5 px-4 text-center text-slate-500 dark:text-zinc-400">
                      동행 {goal.companions.length} · 관람 {goal.viewers.length}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>상세</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. [MODAL] 모아목표 등록 팝업 (ELM-SEL-02 + 규칙/입력 기준)
      ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* 팝업 헤더 (타이틀: '모아목표 등록') */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  모아목표 등록
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 팝업 본문 폼 */}
            <form onSubmit={handleCreateGoalSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* 목표유형 선택: ELM-SEL-02 표준 목록 선택 */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">
                  목표 유형 선택 (ELM-SEL-02)
                </label>
                <ElmSel02
                  value={newCategoryVal}
                  onChange={setNewCategoryVal}
                  options={GOAL_CATEGORY_OPTIONS}
                  placeholder="시스템 제공 목표 유형을 선택하세요"
                />
              </div>

              {/* 목표 제목 */}
              <ElmInp01
                label="목표 제목"
                value={newTitle}
                onChange={setNewTitle}
                placeholder="예: 매일 저녁 만보 걷기 챌린지"
              />

              {/* 고정 항목 (규칙/기준) */}
              <ElmInp01
                label="📌 고정 항목 (규칙/기준)"
                value={newFixedRule}
                onChange={setNewFixedRule}
                placeholder="예: 일일 최소 10,000보 이상 걸음 수 인정 (만보기 캡처 필수)"
              />

              {/* 입력 항목 (수행 기록) */}
              <ElmInp01
                label="✏️ 입력 항목 (수행 기록 가이드)"
                value={newInputRule}
                onChange={setNewInputRule}
                placeholder="예: 당일 실제 걸음 수(숫자) & 컨디션 메모 & 인증 사진 첨부"
              />

              {/* 목표치 및 단위, 실천 기간 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ElmInp01
                  label="목표 기준치"
                  value={newTargetVal}
                  onChange={setNewTargetVal}
                  placeholder="10000"
                />
                <ElmInp01
                  label="측정 단위"
                  value={newUnit}
                  onChange={setNewUnit}
                  placeholder="보, 원, 권, 시간 등"
                />
                <ElmSel01
                  label="실천 기간"
                  value={newPeriod}
                  onChange={setNewPeriod}
                  options={[
                    { value: '14', label: '2주 집중 (14일)' },
                    { value: '30', label: '한 달 달성 (30일)' },
                    { value: '60', label: '두 달 마스터 (60일)' },
                    { value: '100', label: '100일 습관형' },
                  ]}
                />
              </div>

              {/* 팝업 푸터 버튼 */}
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold shadow-md cursor-pointer transition-all"
                >
                  목표 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
