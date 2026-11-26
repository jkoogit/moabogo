import React, { useState } from 'react';
import { ElmChk01, ElmMkd01 } from '../../elements/Tokens';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  Clock,
  X,
} from 'lucide-react';
import {
  TermsDocument,
  TermsHistoryItem,
  TermsCategoryType,
  loadManagedTerms,
  saveManagedTerms,
} from '../../data/systemGovernancePool';

interface RbacTermsSubTabProps {
  onToast: (message: string) => void;
}

const calculateNextSubVersion = (rawVer: string): string => {
  const trimmed = rawVer.trim();
  const hasV = trimmed.startsWith('v') || trimmed.startsWith('V');
  const clean = trimmed.replace(/^[vV]/, '');
  const parts = clean.split('.');

  if (parts.length >= 2) {
    const major = parseInt(parts[0], 10) || 1;
    const minor = parseInt(parts[1], 10) || 0;
    return `${hasV ? 'v' : ''}${major}.${minor + 1}`;
  } else {
    const major = parseInt(parts[0], 10) || 1;
    return `${hasV ? 'v' : ''}${major}.1`;
  }
};

export const RbacTermsSubTab: React.FC<RbacTermsSubTabProps> = ({ onToast }) => {
  const [terms, setTerms] = useState<TermsDocument[]>(() => loadManagedTerms());
  const [selectedTermCategory, setSelectedTermCategory] = useState<TermsCategoryType | 'ALL'>('ALL');
  const [selectedTermId, setSelectedTermId] = useState<string>(terms[0]?.id || 'term-svc-01');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [baseVersionForEdit, setBaseVersionForEdit] = useState<string>('');
  const [isEditingTerm, setIsEditingTerm] = useState<boolean>(false);
  const [termEditMarkdown, setTermEditMarkdown] = useState<string>('');
  const [termEditVersion, setTermEditVersion] = useState<string>('');
  const [termEditSummary, setTermEditSummary] = useState<string>('');
  const [isTermModalOpen, setIsTermModalOpen] = useState<boolean>(false);
  const [termFormType, setTermFormType] = useState<TermsCategoryType>('SERVICE');
  const [termFormTitle, setTermFormTitle] = useState<string>('');
  const [termFormVersion, setTermFormVersion] = useState<string>('v1.0');
  const [termFormContent, setTermFormContent] = useState<string>('');

  const filteredTerms = selectedTermCategory === 'ALL'
    ? terms
    : terms.filter((t) => t.type === selectedTermCategory);

  const curTerm = terms.find((t) => t.id === selectedTermId) || terms[0];

  const handleOpenNewTermModal = () => {
    setTermFormType('SERVICE');
    setTermFormTitle('');
    setTermFormVersion('v1.0');
    setTermFormContent('# 새 약관 제목\n\n### 제1조 (목적)\n약관 내용을 입력해 주세요.');
    setIsTermModalOpen(true);
  };

  const handleSaveNewTerm = () => {
    if (!termFormTitle.trim() || !termFormContent.trim()) {
      onToast('약관 제목과 본문을 입력해 주세요.');
      return;
    }
    const typeLabelMap: Record<TermsCategoryType, string> = {
      SERVICE: '서비스이용약관',
      PRIVACY: '개인정보수집및 이용동의',
      MARKETING: '이벤트알림 및 라이프 혜택 정보수신동의',
    };
    const newDoc: TermsDocument = {
      id: `term-${termFormType.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      type: termFormType,
      typeLabel: typeLabelMap[termFormType],
      title: termFormTitle.trim(),
      version: termFormVersion.trim() || 'v1.0',
      effectiveDate: new Date().toISOString().slice(0, 10),
      isCurrent: false,
      contentMarkdown: termFormContent,
      history: [
        {
          id: `hist-${Date.now()}`,
          version: termFormVersion.trim() || 'v1.0',
          effectiveDate: new Date().toISOString().slice(0, 10),
          summary: '신규 약관 등록',
          isCurrent: true,
          contentMarkdown: termFormContent,
        },
      ],
    };
    const updated = [...terms, newDoc];
    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedTermId(newDoc.id);
    setIsTermModalOpen(false);
    onToast('새 약관이 성공적으로 등록되었습니다.');
  };

  const handleUpdateCurrentTerm = () => {
    if (!termEditMarkdown.trim()) {
      onToast('약관 본문 내용을 입력해 주세요.');
      return;
    }

    const inputVer = termEditVersion.trim();
    let nextVer: string;

    if (!inputVer || inputVer === baseVersionForEdit) {
      nextVer = calculateNextSubVersion(baseVersionForEdit || curTerm.version);
    } else {
      nextVer = inputVer;
    }

    const newHistItem: TermsHistoryItem = {
      id: `hist-${Date.now()}`,
      version: nextVer,
      effectiveDate: new Date().toISOString().slice(0, 10),
      summary: termEditSummary.trim() || `${nextVer} 개정 저장`,
      isCurrent: true,
      contentMarkdown: termEditMarkdown,
    };

    const updated = terms.map((t) => {
      if (t.id === curTerm.id) {
        const prevHistory = (t.history || []).map((h) => ({ ...h, isCurrent: false }));
        return {
          ...t,
          version: nextVer,
          effectiveDate: newHistItem.effectiveDate,
          contentMarkdown: termEditMarkdown,
          history: [newHistItem, ...prevHistory],
        };
      }
      return t;
    });

    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedHistoryId(newHistItem.id);
    setBaseVersionForEdit(nextVer);
    setTermEditVersion(nextVer);
    setIsEditingTerm(false);
    onToast(`'${curTerm.title}'이(가) ${nextVer} 버전으로 저장 및 갱신되었습니다.`);
  };

  const handleApplyHistoryVersion = (hist: TermsHistoryItem) => {
    const updated = terms.map((t) => {
      if (t.id === curTerm.id) {
        const nextHistory = (t.history || []).map((h) => ({
          ...h,
          isCurrent: (h.id && hist.id ? h.id === hist.id : h.version === hist.version),
        }));
        return {
          ...t,
          version: hist.version,
          effectiveDate: hist.effectiveDate,
          contentMarkdown: hist.contentMarkdown || t.contentMarkdown,
          history: nextHistory,
        };
      }
      return t;
    });
    setTerms(updated);
    saveManagedTerms(updated);
    setSelectedHistoryId(hist.id);
    setTermEditVersion(hist.version);
    setBaseVersionForEdit(hist.version);
    if (hist.contentMarkdown) {
      setTermEditMarkdown(hist.contentMarkdown);
    }
    onToast(`'${curTerm.title}' (${hist.version}) 버전이 대표 약관으로 적용되었습니다.`);
  };

  const handleDeleteHistoryItem = (histId: string, version: string) => {
    if (!curTerm.history || curTerm.history.length <= 1) {
      onToast('최소 1개 이상의 개정 저장이력이 유지되어야 합니다.');
      return;
    }
    if (!confirm(`${version} 개정 이력을 삭제하시겠습니까?`)) return;

    const updated = terms.map((t) => {
      if (t.id === curTerm.id) {
        const nextHistory = t.history.filter((h) => (h.id ? h.id !== histId : h.version !== version));
        return {
          ...t,
          history: nextHistory,
        };
      }
      return t;
    });
    setTerms(updated);
    saveManagedTerms(updated);
    onToast(`${version} 개정 이력이 삭제되었습니다.`);
  };

  const handleDeleteTerm = (termId: string) => {
    if (terms.length <= 1) {
      onToast('최소 1개 이상의 약관이 유지되어야 합니다.');
      return;
    }
    const target = terms.find((t) => t.id === termId);
    if (!confirm(`'${target?.title}' 약관을 삭제하시겠습니까?`)) return;
    const updated = terms.filter((t) => t.id !== termId);
    setTerms(updated);
    saveManagedTerms(updated);
    if (selectedTermId === termId) {
      setSelectedTermId(updated[0].id);
    }
    onToast('약관이 삭제되었습니다.');
  };

  const activeDisplayHistory =
    curTerm.history?.find((h) => h.id === selectedHistoryId) || curTerm.history?.[0];
  const displayMarkdown = activeDisplayHistory?.contentMarkdown || curTerm.contentMarkdown;
  const displayVersion = activeDisplayHistory?.version || curTerm.version;
  const displayDate = activeDisplayHistory?.effectiveDate || curTerm.effectiveDate;
  const hasExplicitCurrent = (curTerm.history || []).some((item) => item.isCurrent);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {(['ALL', 'SERVICE', 'PRIVACY', 'MARKETING'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedTermCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTermCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {cat === 'ALL'
                ? '전체 약관'
                : cat === 'SERVICE'
                ? '서비스이용약관'
                : cat === 'PRIVACY'
                ? '개인정보수집'
                : '이벤트알림'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleOpenNewTermModal}
          className="min-h-[34px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>약관 등록</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* 좌측: 약관 목록 */}
        <div className="md:col-span-4 space-y-1.5 max-h-[520px] overflow-y-auto">
          {filteredTerms.map((t) => {
            const isSel = selectedTermId === t.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTermId(t.id);
                  setIsEditingTerm(false);
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                  isSel
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-slate-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
                    {t.typeLabel}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{t.version}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-zinc-100 truncate">{t.title}</div>

                <div
                  className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px]">시행일 {t.effectiveDate} • 이력 {t.history?.length || 1}건</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteTerm(t.id)}
                    className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                    title="약관 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 우측: 약관 상세 뷰어 및 Markdown 수정기 */}
        <div className="md:col-span-8 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{curTerm.title}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                  {isEditingTerm ? termEditVersion : displayVersion}
                </span>
                {activeDisplayHistory?.isCurrent && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    대표 적용중
                  </span>
                )}
              </h4>
              <span className="text-[10px] text-slate-400">
                {curTerm.typeLabel} • 시행일: {displayDate} • 총 개정 이력: {curTerm.history?.length || 1}건
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isEditingTerm ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingTerm(false)}
                    className="px-2.5 py-1 rounded-lg border text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateCurrentTerm}
                    className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
                  >
                    <Save className="w-3 h-3" />
                    <span>저장</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const initialMd = activeDisplayHistory?.contentMarkdown || curTerm.contentMarkdown;
                    const initialVer = activeDisplayHistory?.version || curTerm.version;
                    setTermEditMarkdown(initialMd);
                    setTermEditVersion(initialVer);
                    setBaseVersionForEdit(initialVer);
                    setTermEditSummary('');
                    setIsEditingTerm(true);
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-700"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>수정</span>
                </button>
              )}
            </div>
          </div>

          {isEditingTerm ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-500">개정 버전</label>
                    <span className="text-[10px] text-indigo-500 font-mono">
                      미수정 저장 시 ➔ {calculateNextSubVersion(baseVersionForEdit || curTerm.version)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={termEditVersion}
                    onChange={(e) => setTermEditVersion(e.target.value)}
                    placeholder="예: v2.2 (미입력 시 서브버전 자동 증가)"
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">개정 요약</label>
                  <input
                    type="text"
                    value={termEditSummary}
                    onChange={(e) => setTermEditSummary(e.target.value)}
                    placeholder="예: 혜택 안내 조항 문구 수정"
                    className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#0E131F] text-xs"
                  />
                </div>
              </div>
              <ElmMkd01
                value={termEditMarkdown}
                onChange={setTermEditMarkdown}
                label="약관 본문 (Markdown 포맷)"
                rows={7}
                heightClass="min-h-[220px]"
                defaultMode="split"
              />
            </div>
          ) : (
            <ElmMkd01
              value={displayMarkdown}
              readOnly={true}
              label={`약관 본문 미리보기 (${displayVersion} 기준)`}
              heightClass="max-h-[300px]"
            />
          )}

          {/* 개정 저장이력 */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>개정 저장이력 (최근 이력 순 / 클릭 시 본문 전환)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                총 {curTerm.history?.length || 1}개 버전 • 체크 시 대표 적용
              </span>
            </div>

            <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
              {(curTerm.history || []).map((h, idx) => {
                const isCurrentActive = hasExplicitCurrent
                  ? !!h.isCurrent
                  : h.version === curTerm.version;
                const isHistorySelected =
                  selectedHistoryId ? h.id === selectedHistoryId : idx === 0;

                return (
                  <div
                    key={h.id || `hist-${idx}`}
                    onClick={() => {
                      setSelectedHistoryId(h.id);
                      if (isEditingTerm) {
                        setTermEditMarkdown(h.contentMarkdown || curTerm.contentMarkdown);
                        setTermEditVersion(h.version);
                        setBaseVersionForEdit(h.version);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isHistorySelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0E131F]/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2.5">
                      <div onClick={(e) => e.stopPropagation()}>
                        <ElmChk01
                          checked={isCurrentActive}
                          onChange={() => handleApplyHistoryVersion(h)}
                          className="min-h-0 py-0 shrink-0"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-slate-900 dark:text-zinc-100">
                            {h.version}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {h.effectiveDate}
                          </span>
                          {isCurrentActive && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                              대표 적용중
                            </span>
                          )}
                          {isHistorySelected && !isCurrentActive && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                              현재 조회중
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">
                          {h.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(h.id, h.version)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="이력 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 약관 등록 모달 */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold">신규 약관 등록</h4>
              <button type="button" onClick={() => setIsTermModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">약관 구분 (3대 분류)</label>
                <select
                  value={termFormType}
                  onChange={(e) => setTermFormType(e.target.value as TermsCategoryType)}
                  className="w-full h-9 px-2 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                >
                  <option value="SERVICE">1. 서비스이용약관</option>
                  <option value="PRIVACY">2. 개인정보수집및 이용동의</option>
                  <option value="MARKETING">3. 이벤트알림 및 라이프 혜택 정보수신동의</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">약관 제목</label>
                <input
                  type="text"
                  value={termFormTitle}
                  onChange={(e) => setTermFormTitle(e.target.value)}
                  placeholder="예: 모아보고 서비스 이용약관 (신규)"
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">초기 버전</label>
                <input
                  type="text"
                  value={termFormVersion}
                  onChange={(e) => setTermFormVersion(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                />
              </div>
              <div>
                <ElmMkd01
                  value={termFormContent}
                  onChange={setTermFormContent}
                  label="약관 본문 (Markdown 포맷)"
                  rows={7}
                  heightClass="min-h-[200px]"
                  defaultMode="edit"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsTermModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs">취소</button>
                <button type="button" onClick={handleSaveNewTerm} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">등록</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
