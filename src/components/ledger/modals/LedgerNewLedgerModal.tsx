import React, { useState } from 'react';
import { BookOpen, X, Palette, PiggyBank } from 'lucide-react';
import { ElmInp01, ElmSel01, ElmChk01 } from '../../../sample/elements/Tokens';
import { COVER_COLOR_PRESETS, LedgerDesignStyle } from './LedgerEditCoverModal';
import type { LedgerType, LedgerPeriodType, LedgerSubType, LedgerBook } from '../../../sample/screen/SCR_LED_01_그룹가계부관리상세';

export interface LedgerNewLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLedger: (book: LedgerBook) => void;
}

export const LedgerNewLedgerModal: React.FC<LedgerNewLedgerModalProps> = ({
  isOpen,
  onClose,
  onCreateLedger,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LedgerType>('GROUP');
  const [periodType, setPeriodType] = useState<LedgerPeriodType>('LONG_TERM');
  const [subType, setSubType] = useState<LedgerSubType>('STANDARD');
  const [initialBalance] = useState('0');
  const [budgetCap, setBudgetCap] = useState('150000');
  const [resetCycle, setResetCycle] = useState<'MONTHLY' | 'WEEKLY' | 'NONE'>('MONTHLY');
  const [allowReopen, setAllowReopen] = useState(true);
  const [designStyle, setDesignStyle] = useState<LedgerDesignStyle>('KRAFT');
  const [customColor, setCustomColor] = useState('#e5a622');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const initBal = parseInt(initialBalance.replace(/[^0-9-]/g, '') || '0', 10);
    const cap = parseInt(budgetCap.replace(/[^0-9]/g, '') || '150000', 10);
    const newId = `led-${Date.now()}`;

    const themeMap: Record<LedgerDesignStyle, any> = {
      LEATHER: {
        bg: 'from-emerald-900/10 via-emerald-800/5 to-transparent',
        border: 'border-emerald-600/40',
        spineGrad: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-emerald-100',
        labelBg: 'bg-emerald-950/80 border border-emerald-500/40',
        labelText: 'text-emerald-300',
        bookmarkColor: 'bg-emerald-500 text-white',
        accent: 'text-emerald-600 dark:text-emerald-400',
      },
      HARDCOVER: {
        bg: 'from-indigo-900/10 via-indigo-800/5 to-transparent',
        border: 'border-indigo-600/40',
        spineGrad: 'bg-gradient-to-r from-indigo-800 via-blue-900 to-indigo-950 text-indigo-100',
        labelBg: 'bg-indigo-950/80 border border-indigo-500/40',
        labelText: 'text-indigo-300',
        bookmarkColor: 'bg-indigo-500 text-white',
        accent: 'text-indigo-600 dark:text-indigo-400',
      },
      KRAFT: {
        bg: 'from-amber-900/10 via-amber-800/5 to-transparent',
        border: 'border-amber-600/40',
        spineGrad: 'bg-gradient-to-r from-amber-800 via-orange-900 to-amber-950 text-amber-100',
        labelBg: 'bg-amber-950/80 border border-amber-500/40',
        labelText: 'text-amber-300',
        bookmarkColor: 'bg-amber-500 text-white',
        accent: 'text-amber-600 dark:text-amber-400',
      },
      FABRIC: {
        bg: 'from-purple-900/10 via-fuchsia-800/5 to-transparent',
        border: 'border-purple-600/40',
        spineGrad: 'bg-gradient-to-r from-purple-800 via-fuchsia-900 to-purple-950 text-purple-100',
        labelBg: 'bg-purple-950/80 border border-purple-500/40',
        labelText: 'text-purple-300',
        bookmarkColor: 'bg-purple-500 text-white',
        accent: 'text-purple-600 dark:text-purple-400',
      },
      SLATE: {
        bg: 'from-slate-900/15 via-zinc-800/5 to-transparent',
        border: 'border-slate-500/40',
        spineGrad: 'bg-gradient-to-r from-slate-700 via-zinc-800 to-slate-950 text-slate-100',
        labelBg: 'bg-slate-950/80 border border-slate-500/40',
        labelText: 'text-slate-300',
        bookmarkColor: 'bg-slate-500 text-white',
        accent: 'text-slate-600 dark:text-slate-400',
      },
      VINTAGE_BURGUNDY: {
        bg: 'from-rose-950/20 via-amber-950/10 to-transparent',
        border: 'border-amber-700/50',
        spineGrad: 'bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 text-amber-200',
        labelBg: 'bg-amber-100/95 dark:bg-amber-950/90 border border-amber-600/60 shadow-xs',
        labelText: 'text-amber-950 dark:text-amber-200',
        bookmarkColor: 'bg-amber-500 text-amber-950',
        accent: 'text-amber-600 dark:text-amber-400',
      },
    };

    const newBook: LedgerBook = {
      id: newId,
      title: title.trim(),
      type,
      periodType,
      subType,
      closingStatus: 'OPEN',
      budgetCap: subType === 'POCKET_MONEY' ? cap : undefined,
      spentAmount: 0,
      resetCycle: subType === 'POCKET_MONEY' ? resetCycle : undefined,
      allowReopen: periodType === 'SHORT_TERM' ? allowReopen : true,
      description:
        subType === 'POCKET_MONEY'
          ? `용돈기입장 · ${resetCycle === 'MONTHLY' ? '월' : '주'} 한도 ₩${cap.toLocaleString()}`
          : periodType === 'SHORT_TERM'
          ? '단기 프로젝트 · 정산 중심 일회성 장부'
          : '일상 가계부 · 연속 시계열 관리',
      balance: subType === 'POCKET_MONEY' ? cap : initBal,
      currency: 'KRW',
      designStyle,
      customCoverColor: customColor,
      colorTheme: themeMap[designStyle],
      membersCount: 1,
      createdAt: new Date().toISOString().slice(0, 10),
      settlementCycle:
        subType === 'POCKET_MONEY'
          ? '주기별 용돈 리셋'
          : periodType === 'SHORT_TERM'
          ? '프로젝트 종료 시 정산'
          : '매월 말일 결산',
    };

    onCreateLedger(newBook);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              새 장부 개설 (회계 프로세스 설정)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <ElmInp01
            label="장부 타이틀"
            value={title}
            onChange={setTitle}
            placeholder="예: 우리집 가계부, 자녀 용돈기입장, 제주도 여행"
          />

          <div className="grid grid-cols-2 gap-3">
            <ElmSel01
              label="귀속 유형"
              value={type}
              onChange={(v) => setType(v as LedgerType)}
              options={[
                { value: 'PERSONAL', label: '👤 개인 가계부' },
                { value: 'GROUP', label: '👥 모임/가족 가계부' },
                { value: 'INSTANCE', label: '⚡ 인스턴스 (일회성)' },
              ]}
            />
            <ElmSel01
              label="회계 기간 유형"
              value={periodType}
              onChange={(v) => setPeriodType(v as LedgerPeriodType)}
              options={[
                { value: 'LONG_TERM', label: '📅 장기 연속형 (일상/누적)' },
                { value: 'SHORT_TERM', label: '⏱️ 단기 정산형 (정산 후 마감)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ElmSel01
              label="세부 성격"
              value={subType}
              onChange={(v) => setSubType(v as LedgerSubType)}
              options={[
                { value: 'STANDARD', label: '📖 일반 가계부 (자산/수지)' },
                { value: 'POCKET_MONEY', label: '🪙 용돈기입장 (한도/소진)' },
              ]}
            />
            <ElmSel01
              label="책등 디자인 스타일"
              value={designStyle}
              onChange={(v) => setDesignStyle(v as LedgerDesignStyle)}
              options={[
                { value: 'LEATHER', label: '🌿 에메랄드 가죽' },
                { value: 'HARDCOVER', label: '📘 미드나잇 하드커버' },
                { value: 'KRAFT', label: '📙 따뜻한 크라프트' },
                { value: 'FABRIC', label: '🔮 바이올렛 패브릭' },
                { value: 'SLATE', label: '⚙️ 슬레이트 바인더' },
                { value: 'VINTAGE_BURGUNDY', label: '🍷 빈티지 버건디 양장' },
              ]}
            />
          </div>

          {/* 북커버 시그니처 색상 지정 및 실시간 미리보기 */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>북커버 색상 지정 (커버 스타일과 연동)</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-4 h-4 rounded-full border border-black/20 shadow-2xs"
                  style={{ backgroundColor: customColor }}
                />
                <span className="font-mono text-[11px] font-bold text-stone-600 dark:text-zinc-400">
                  {customColor.toUpperCase()}
                </span>
              </div>
            </div>

            {/* 색상 프리셋 칩 */}
            <div className="flex flex-wrap gap-1.5">
              {COVER_COLOR_PRESETS.map((p) => {
                const isSelected = customColor === p.color;
                return (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => setCustomColor(p.color)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 border-indigo-500 bg-white dark:bg-zinc-900 shadow-2xs font-black'
                        : 'border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* 직접 색상 선택기 */}
            <div className="flex items-center gap-2 pt-1 border-t border-stone-200/60 dark:border-zinc-700/60">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-6 h-6 rounded-md border-0 cursor-pointer p-0 bg-transparent"
                title="색상 직접 선택"
              />
              <span className="text-[10.5px] text-stone-500 dark:text-zinc-400">
                직접 색상을 클릭하여 사용자 지정 Hex 코드를 선택할 수 있습니다.
              </span>
            </div>
          </div>

          {/* 용돈기입장 전용 설정 */}
          {subType === 'POCKET_MONEY' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                <PiggyBank className="w-4 h-4 text-amber-600" />
                <span>용돈기입장 특화 설정</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ElmInp01
                  label="한도 예산 (원)"
                  value={budgetCap}
                  onChange={setBudgetCap}
                  placeholder="예: 150000"
                />
                <ElmSel01
                  label="리셋 주기"
                  value={resetCycle}
                  onChange={(v) => setResetCycle(v as 'MONTHLY' | 'WEEKLY' | 'NONE')}
                  options={[
                    { value: 'MONTHLY', label: '매월 1일 리셋' },
                    { value: 'WEEKLY', label: '매주 월요일 리셋' },
                    { value: 'NONE', label: '수동 관리' },
                  ]}
                />
              </div>
              <p className="text-[10.5px] text-amber-800 dark:text-amber-300">
                * 부모 가계부에서 용돈을 송금할 때 TRANSFER 1:1 페어링으로 생활비 왜곡 없이 안전하게 충전됩니다.
              </p>
            </div>
          )}

          {/* 단기 정산형 전용 설정 */}
          {periodType === 'SHORT_TERM' && (
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 space-y-1">
              <ElmChk01
                checked={allowReopen}
                onChange={setAllowReopen}
                label="정산 마감 후에도 방장 재오픈(Reopen) 허용"
              />
              <p className="text-[10px] text-orange-700 dark:text-orange-300 pl-6">
                체크 해제 시 마감 후 수정이 불가한 불변 영구 보관 장부로 잠금됩니다.
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              새 장부 책꽂이에 꽂기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
