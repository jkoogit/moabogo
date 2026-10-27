import React, { useRef, useEffect, useState } from 'react';
import {
  Coins,
  Copy,
  RotateCcw,
  SlidersHorizontal,
  Plus,
  Minus,
  Check,
  Camera,
  Download,
} from 'lucide-react';
import { ElmInp01 } from '../../../sample/elements/Tokens';
import { Participant } from '../types';
import { SettlementSummary } from './types';
import { formatSettlementShareText } from './settlementEngine';
import {
  generateSettlementResultCardBlob,
  copyBlobToClipboard,
  downloadBlobAsFile,
} from '../../../sample/utils/gameResultCardCanvas';

export interface SettlementGameZoneProps {
  members: Participant[];
  setMembers: React.Dispatch<React.SetStateAction<Participant[]>>;
  amount: string;
  setAmount: (val: string) => void;
  useSplitWeight: boolean;
  setUseSplitWeight: React.Dispatch<React.SetStateAction<boolean>>;
  settlementSummary: SettlementSummary;
  updateSplitMemberWeight: (id: string, delta: number, isAbsolute?: boolean) => void;
  toggleSentStatus: (id: string) => void;
  handleAdjustAmount: (delta: number) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  resolvedTheme: string;
  isDark: boolean;
}

export const SettlementGameZone: React.FC<SettlementGameZoneProps> = ({
  members,
  amount,
  setAmount,
  useSplitWeight,
  setUseSplitWeight,
  settlementSummary,
  updateSplitMemberWeight,
  toggleSentStatus,
  handleAdjustAmount,
  showToast,
  resolvedTheme,
  isDark,
}) => {
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);

  // 정산 만원 프리셋 슬라이드 드래그/휠 스크롤 Ref & 네이티브 논패시브 휠 리스너 (페이지 스크롤 전파 차단)
  const presetScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingPresetRef = useRef(false);
  const presetStartXRef = useRef(0);
  const presetScrollLeftRef = useRef(0);

  useEffect(() => {
    const el = presetScrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const canScroll = el.scrollWidth > el.clientWidth + 2;
      if (!canScroll) return;

      const rawDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (rawDelta === 0) return;

      const isAtStart = el.scrollLeft <= 2;
      const isAtEnd = el.scrollLeft >= Math.floor(el.scrollWidth - el.clientWidth) - 2;
      if ((isAtStart && rawDelta < 0) || (isAtEnd && rawDelta > 0)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      const multiplier = e.deltaMode === 1 ? 24 : 1;
      el.scrollLeft += rawDelta * multiplier;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handlePresetMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingPresetRef.current = true;
    if (presetScrollRef.current) {
      presetStartXRef.current = e.pageX - presetScrollRef.current.offsetLeft;
      presetScrollLeftRef.current = presetScrollRef.current.scrollLeft;
    }
  };

  const handlePresetMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPresetRef.current || !presetScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - presetScrollRef.current.offsetLeft;
    const walk = (x - presetStartXRef.current) * 1.5;
    presetScrollRef.current.scrollLeft = presetScrollLeftRef.current - walk;
  };

  const handlePresetMouseUpOrLeave = () => {
    isDraggingPresetRef.current = false;
  };

  const handlePresetTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    isDraggingPresetRef.current = true;
    if (presetScrollRef.current && e.touches.length > 0) {
      presetStartXRef.current = e.touches[0].pageX - presetScrollRef.current.offsetLeft;
      presetScrollLeftRef.current = presetScrollRef.current.scrollLeft;
    }
  };

  const handlePresetTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingPresetRef.current || !presetScrollRef.current || e.touches.length === 0) return;
    const x = e.touches[0].pageX - presetScrollRef.current.offsetLeft;
    const walk = (x - presetStartXRef.current) * 1.5;
    presetScrollRef.current.scrollLeft = presetScrollLeftRef.current - walk;
  };

  const handleCopyText = () => {
    const text = formatSettlementShareText(settlementSummary, members, useSplitWeight);
    navigator.clipboard?.writeText(text);
    showToast('정산 결과 텍스트가 클립보드에 복사되었습니다.');
  };

  const handleCopyImageCard = async () => {
    setIsGeneratingCard(true);
    try {
      const blob = await generateSettlementResultCardBlob({
        title: useSplitWeight ? '가중치 차등 정산 결과서' : '모아보고 스마트 정산 결과서',
        totalAmount: settlementSummary.total,
        totalCount: members.length,
        perPerson: useSplitWeight ? settlementSummary.baseUnitAmount : settlementSummary.perPerson,
        isWeighted: useSplitWeight,
        totalWeight: settlementSummary.totalWeight,
        baseUnitAmount: settlementSummary.baseUnitAmount,
        remainder: settlementSummary.remainder,
        members: members.map((m) => {
          const share = settlementSummary.memberShares[m.id];
          return {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            amount: share ? share.amount : settlementSummary.perPerson,
            weight: share ? share.weight : 1,
            isSent: m.isSent,
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      const res = await copyBlobToClipboard(blob);
      if (res.success) {
        showToast('정산 결과 카드 이미지가 클립보드에 복사되었습니다.');
      } else {
        downloadBlobAsFile(blob, `moabogo_settlement_${Date.now()}.png`);
        showToast('클립보드 권한으로 인해 이미지 파일로 저장되었습니다.', 'info');
      }
    } catch (e) {
      console.error('Failed to generate settlement card:', e);
      showToast('카드 이미지 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleDownloadImageCard = async () => {
    setIsGeneratingCard(true);
    try {
      const blob = await generateSettlementResultCardBlob({
        title: useSplitWeight ? '가중치 차등 정산 결과서' : '모아보고 스마트 정산 결과서',
        totalAmount: settlementSummary.total,
        totalCount: members.length,
        perPerson: useSplitWeight ? settlementSummary.baseUnitAmount : settlementSummary.perPerson,
        isWeighted: useSplitWeight,
        totalWeight: settlementSummary.totalWeight,
        baseUnitAmount: settlementSummary.baseUnitAmount,
        remainder: settlementSummary.remainder,
        members: members.map((m) => {
          const share = settlementSummary.memberShares[m.id];
          return {
            id: m.id,
            name: m.name,
            avatar: m.avatar,
            amount: share ? share.amount : settlementSummary.perPerson,
            weight: share ? share.weight : 1,
            isSent: m.isSent,
          };
        }),
        theme: resolvedTheme as 'light' | 'dark' | 'dawn',
      });
      downloadBlobAsFile(blob, `moabogo_settlement_${Date.now()}.png`);
      showToast('정산 결과 카드 이미지를 다운로드했습니다.');
    } catch (e) {
      console.error('Failed to download settlement card:', e);
      showToast('카드 이미지 다운로드 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsGeneratingCard(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border ${
          resolvedTheme === 'dawn'
            ? 'bg-[#f0f7ff] border-[#bfdbfe]'
            : isDark
            ? 'bg-[#1a1a1e] border-[#27272a]'
            : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        {/* 금액 입력 & 만원/천원 증감 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-indigo-400" />
              <span>총 결제 금액 (원)</span>
            </label>
            {amount && (
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                ₩{parseInt(amount.replace(/[^0-9]/g, '') || '0', 10).toLocaleString()}원
              </span>
            )}
          </div>
          <ElmInp01
            value={amount}
            onChange={(val: string) => setAmount(val.replace(/[^0-9]/g, ''))}
            placeholder="예: 84000"
            type="text"
            inputMode="numeric"
            lang="ko"
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
          />
          {/* 만원/천원 증감 퀵 인디케이터 */}
          <div className="flex flex-col gap-2 pt-1 w-full overflow-hidden">
            {/* 1행: 좌측 [+ 만원 -] [+ 천원 -] 인디케이터 & 우측 초기화 버튼 */}
            <div className="flex items-center justify-between gap-2 w-full shrink-0">
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 만원 인디케이터 */}
                <div
                  className={`inline-flex items-center rounded-lg border overflow-hidden shadow-2xs ${
                    resolvedTheme === 'dawn'
                      ? 'bg-blue-100/80 border-blue-300 text-blue-900'
                      : isDark
                      ? 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAdjustAmount(10000)}
                    className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    title="1만원 증가"
                  >
                    + 만원
                  </button>
                  <span className="w-px h-3.5 bg-indigo-200 dark:bg-indigo-700/60" />
                  <button
                    type="button"
                    onClick={() => handleAdjustAmount(-10000)}
                    className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    title="1만원 감소"
                  >
                    - 만원
                  </button>
                </div>

                {/* 천원 인디케이터 */}
                <div
                  className={`inline-flex items-center rounded-lg border overflow-hidden shadow-2xs ${
                    resolvedTheme === 'dawn'
                      ? 'bg-sky-100/80 border-sky-300 text-sky-900'
                      : isDark
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleAdjustAmount(1000)}
                    className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    title="1천원 증가"
                  >
                    + 천원
                  </button>
                  <span className="w-px h-3.5 bg-slate-300 dark:bg-zinc-600" />
                  <button
                    type="button"
                    onClick={() => handleAdjustAmount(-1000)}
                    className="px-2 py-1 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    title="1천원 감소"
                  >
                    - 천원
                  </button>
                </div>
              </div>

              {/* 우측 초기화 버튼 */}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shrink-0"
                title="금액 0원 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2행: 슬라이드 휠 칩 */}
            <div
              ref={presetScrollRef}
              onMouseDown={handlePresetMouseDown}
              onMouseMove={handlePresetMouseMove}
              onMouseUp={handlePresetMouseUpOrLeave}
              onMouseLeave={handlePresetMouseUpOrLeave}
              onTouchStart={handlePresetTouchStart}
              onTouchMove={handlePresetTouchMove}
              onTouchEnd={handlePresetMouseUpOrLeave}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing select-none py-1 -my-1"
            >
              {[10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleAdjustAmount(val)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all shrink-0 cursor-pointer ${
                    resolvedTheme === 'dawn'
                      ? 'bg-white/80 border-[#bfdbfe] text-[#0d2746] hover:bg-blue-50'
                      : isDark
                      ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  +{val >= 10000 ? `${val / 10000}만` : `${val / 1000}천`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 정산 모드 옵션 & 빠른 안내 */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
              <span>정산 옵션 설정</span>
            </label>
            <button
              type="button"
              onClick={() => setUseSplitWeight((prev) => !prev)}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                useSplitWeight
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                  : resolvedTheme === 'dawn'
                  ? 'bg-white/80 border-[#bfdbfe] text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-slate-300 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{useSplitWeight ? '⚡ 가중치 정산 ON' : '👥 균등 1/N 정산'}</span>
            </button>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {useSplitWeight
              ? '💡 참가자별로 0배(면제), 0.5배, 1배, 2배 등 차등 가중치를 부여하여 공정하게 계산합니다.'
              : '💡 총 금액을 참여 인원수로 나누어 100원 단위로 깔끔하게 절사하여 1인당 송금액을 산출합니다.'}
          </p>

          {/* 3대 공유 액션 버튼 바 */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyText}
              disabled={settlementSummary.total === 0}
              className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>텍스트 복사</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImageCard}
              disabled={settlementSummary.total === 0 || isGeneratingCard}
              className={`p-2 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                resolvedTheme === 'dawn'
                  ? 'bg-white border-[#bfdbfe] text-indigo-700 hover:bg-indigo-50'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-indigo-400 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50'
              }`}
              title="정산 결과 이미지 카드 클립보드 복사"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDownloadImageCard}
              disabled={settlementSummary.total === 0 || isGeneratingCard}
              className={`p-2 rounded-xl border font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                resolvedTheme === 'dawn'
                  ? 'bg-white border-[#bfdbfe] text-emerald-700 hover:bg-emerald-50'
                  : isDark
                  ? 'bg-[#222226] border-[#333338] text-emerald-400 hover:bg-[#2c2c32]'
                  : 'bg-white border-slate-200 text-emerald-600 hover:bg-slate-50'
              }`}
              title="정산 결과 이미지 파일 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 정산 요약 수치 카드 */}
      <div
        className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          resolvedTheme === 'dawn'
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50/60 border-blue-200'
            : isDark
            ? 'bg-[#18181b] border-indigo-950/60'
            : 'bg-indigo-50/50 border-indigo-100'
        }`}
      >
        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {useSplitWeight ? '기준 1배 금액 (1인당 환산)' : '1인당 송금액'}
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight mt-0.5">
            ₩{settlementSummary.perPerson.toLocaleString()}원
          </p>
        </div>

        <div className="flex items-center gap-4 text-right">
          {useSplitWeight && (
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">총 가중치</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                {settlementSummary.totalWeight}배
              </p>
            </div>
          )}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">자투리 잔액</span>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 font-mono">
              ₩{settlementSummary.remainder.toLocaleString()}원
            </p>
          </div>
        </div>
      </div>

      {/* 참가자 송금 현황 및 가중치 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>참가자별 부담 금액 & 완료 체크</span>
            <span className="text-[10px] text-slate-400">({members.length}명)</span>
          </h4>
          <span className="text-[10px] text-slate-400">카드 클릭 시 송금 완료 토글</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {members.map((m) => {
            const share = settlementSummary.memberShares[m.id];
            const memberAmount = share ? share.amount : settlementSummary.perPerson;
            const memberWeight = share ? share.weight : 1;
            const isExempt = memberWeight === 0;

            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                  m.isSent
                    ? resolvedTheme === 'dawn'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                      : isDark
                      ? 'bg-emerald-950/20 border-emerald-800 text-emerald-300'
                      : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : resolvedTheme === 'dawn'
                    ? 'bg-white/90 border-[#bfdbfe] hover:border-blue-400'
                    : isDark
                    ? 'bg-[#1a1a1e] border-[#27272a] hover:border-[#38383e]'
                    : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                }`}
              >
                <div
                  onClick={() => toggleSentStatus(m.id)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg p-1.5 rounded-lg bg-black/10 dark:bg-white/10 shrink-0">
                      {m.avatar}
                    </span>
                    <div className="truncate min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-bold truncate ${m.isSent ? 'line-through text-slate-400' : ''}`}>
                          {m.name}
                        </p>
                        {useSplitWeight && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                              isExempt
                                ? 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {isExempt ? '면제' : `${memberWeight}배`}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-semibold mt-0.5 ${
                          isExempt
                            ? 'text-slate-400'
                            : 'text-slate-700 dark:text-slate-300 font-mono font-bold'
                        }`}
                      >
                        ₩{memberAmount.toLocaleString()}원
                      </p>
                    </div>
                  </div>

                  <span
                    className={`p-1 rounded-full text-xs shrink-0 ${
                      m.isSent ? 'bg-emerald-600 text-white' : 'bg-black/10 text-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* 가중치 변경 컨트롤 (useSplitWeight 활성화 시) */}
                {useSplitWeight && (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-400 text-[10px]">배율 조정:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSplitMemberWeight(m.id, -0.5);
                        }}
                        className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        title="0.5배 감소"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="px-1.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {memberWeight}x
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSplitMemberWeight(m.id, 0.5);
                        }}
                        className="p-1 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        title="0.5배 증가"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSplitMemberWeight(m.id, 0, true);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-rose-500"
                        title="면제(0배)"
                      >
                        면제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
