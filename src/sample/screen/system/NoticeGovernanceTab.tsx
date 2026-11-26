import React, { useState } from 'react';
import { ElmChk01, ElmMkd01, ElmMkdViewer } from '../../elements/Tokens';
import {
  AlertTriangle,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Link,
  X,
  Type as TypeIcon,
  FileCode,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react';
import {
  SystemNoticeItem,
  NoticeModeType,
  NoticeTargetType,
  loadSystemNotices,
  saveSystemNotices,
} from '../../data/systemGovernancePool';

interface NoticeGovernanceTabProps {
  onToast: (message: string) => void;
}

export const NoticeGovernanceTab: React.FC<NoticeGovernanceTabProps> = ({ onToast }) => {
  const [notices, setNotices] = useState<SystemNoticeItem[]>(() => loadSystemNotices());
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<SystemNoticeItem | null>(null);
  const [previewNotice, setPreviewNotice] = useState<SystemNoticeItem | null>(null);
  const [noticeFormTitle, setNoticeFormTitle] = useState<string>('');
  const [noticeFormMode, setNoticeFormMode] = useState<NoticeModeType>('TEXT');
  const [noticeFormContent, setNoticeFormContent] = useState<string>('');
  const [noticeFormImageUrl, setNoticeFormImageUrl] = useState<string>('');
  const [noticeFormHasButton, setNoticeFormHasButton] = useState<boolean>(true);
  const [noticeFormButtonText, setNoticeFormButtonText] = useState<string>('자세히 보기');
  const [noticeFormTargetType, setNoticeFormTargetType] = useState<NoticeTargetType>('INTERNAL_SCREEN');
  const [noticeFormButtonUrl, setNoticeFormButtonUrl] = useState<string>('SCR-DSH-01');
  const [noticeFormEnabled, setNoticeFormEnabled] = useState<boolean>(true);

  const handleOpenNoticeModal = (notice?: SystemNoticeItem) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeFormTitle(notice.title);
      setNoticeFormMode(notice.mode);
      setNoticeFormContent(notice.content);
      setNoticeFormImageUrl(notice.imageUrl || '');
      setNoticeFormHasButton(notice.hasButton);
      setNoticeFormButtonText(notice.buttonText || '자세히 보기');
      setNoticeFormTargetType(notice.buttonTargetType || 'INTERNAL_SCREEN');
      setNoticeFormButtonUrl(notice.buttonUrl || 'SCR-DSH-01');
      setNoticeFormEnabled(notice.isEnabled);
    } else {
      setEditingNotice(null);
      setNoticeFormTitle('');
      setNoticeFormMode('TEXT');
      setNoticeFormContent('');
      setNoticeFormImageUrl('');
      setNoticeFormHasButton(true);
      setNoticeFormButtonText('자세히 보기');
      setNoticeFormTargetType('INTERNAL_SCREEN');
      setNoticeFormButtonUrl('SCR-DSH-01');
      setNoticeFormEnabled(true);
    }
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = () => {
    if (!noticeFormTitle.trim() || !noticeFormContent.trim()) {
      onToast('공지 제목과 내용을 입력해 주세요.');
      return;
    }
    let updated: SystemNoticeItem[];
    if (editingNotice) {
      updated = notices.map((n) =>
        n.id === editingNotice.id
          ? {
              ...n,
              title: noticeFormTitle.trim(),
              mode: noticeFormMode,
              content: noticeFormContent,
              imageUrl: noticeFormImageUrl.trim() || undefined,
              hasButton: noticeFormHasButton,
              buttonText: noticeFormButtonText.trim(),
              buttonTargetType: noticeFormTargetType,
              buttonUrl: noticeFormButtonUrl.trim(),
              isEnabled: noticeFormEnabled,
            }
          : n
      );
    } else {
      const newNotice: SystemNoticeItem = {
        id: `notice-${Date.now().toString().slice(-4)}`,
        title: noticeFormTitle.trim(),
        mode: noticeFormMode,
        content: noticeFormContent,
        imageUrl: noticeFormImageUrl.trim() || undefined,
        hasButton: noticeFormHasButton,
        buttonText: noticeFormButtonText.trim(),
        buttonTargetType: noticeFormTargetType,
        buttonUrl: noticeFormButtonUrl.trim(),
        isEnabled: noticeFormEnabled,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      updated = [newNotice, ...notices];
    }
    setNotices(updated);
    saveSystemNotices(updated);
    setIsNoticeModalOpen(false);
    onToast(editingNotice ? '공지가 수정되었습니다.' : '새 공지가 등록되었습니다.');
  };

  const handleDeleteNotice = (noticeId: string) => {
    if (!confirm('해당 공지를 삭제하시겠습니까?')) return;
    const updated = notices.filter((n) => n.id !== noticeId);
    setNotices(updated);
    saveSystemNotices(updated);
    onToast('공지가 삭제되었습니다.');
  };

  const handleToggleNoticeEnable = (noticeId: string) => {
    const updated = notices.map((n) =>
      n.id === noticeId ? { ...n, isEnabled: !n.isEnabled } : n
    );
    setNotices(updated);
    saveSystemNotices(updated);
    onToast('공지 게시 상태가 변경되었습니다.');
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>공지</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            TEXT, MD(Markdown 서식), IMG(이미지 배너) 구분을 지원하며 이동 버튼 타겟(서비스화면, 컨텐츠경로, 외부링크)을 제어합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenNoticeModal()}
          className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>등록</span>
        </button>
      </div>

      {/* 공지 목록 카드 그리드 */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-500 block">등록된 전역 공지 목록 ({notices.length}건)</span>

        <div className="grid grid-cols-1 gap-3">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                n.isEnabled
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#131B2E]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                    n.mode === 'TEXT' ? 'bg-slate-100 text-slate-700' :
                    n.mode === 'MD' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {n.mode === 'TEXT' ? 'TEXT' : n.mode === 'MD' ? 'MD' : 'IMG'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{n.title}</h4>
                  {n.isEnabled && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-500 text-white animate-pulse">
                      게시중
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewNotice(n)}
                    className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded cursor-pointer"
                    title="공지 팝업 미리보기"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleNoticeEnable(n.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                      n.isEnabled ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800'
                    }`}
                  >
                    {n.isEnabled ? '게시 중지' : '게시'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenNoticeModal(n)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    title="수정"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 공지 내용 미리보기 */}
              <div className="p-3 rounded-lg bg-white dark:bg-[#0E131F] border border-slate-100 dark:border-zinc-800 text-xs">
                {n.mode === 'IMAGE' && n.imageUrl && (
                  <img src={n.imageUrl} alt="공지 배너" className="w-full max-h-40 object-cover rounded-md mb-2" />
                )}
                {n.mode === 'MD' ? (
                  <ElmMkdViewer content={n.content} />
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-zinc-300">
                    {n.content}
                  </div>
                )}
              </div>

              {n.hasButton && (
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-[11px] text-slate-500 pt-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                      <Link className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>이동버튼: <strong className="text-slate-800 dark:text-zinc-200">[{n.buttonText}]</strong></span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-medium whitespace-nowrap shrink-0">
                      {n.buttonTargetType === 'INTERNAL_SCREEN' ? '서비스내 화면' :
                       n.buttonTargetType === 'CONTENT_PATH' ? '컨텐츠 경로' : '외부 링크'}
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{n.buttonUrl}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">등록일: {n.createdAt}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 공지 등록/수정 모달 */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{editingNotice ? '공지 수정' : '신규 공지 등록'}</h4>
              <button type="button" onClick={() => setIsNoticeModalOpen(false)}><X className="w-4 h-4 text-slate-500 cursor-pointer" /></button>
            </div>
            <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-1">
              <div>
                <label className="font-bold block mb-1">공지 제목</label>
                <input
                  type="text"
                  value={noticeFormTitle}
                  onChange={(e) => setNoticeFormTitle(e.target.value)}
                  placeholder="예: 홈서버 정기 점검 안내"
                  className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F]"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">구분</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'TEXT', label: 'TEXT', icon: <TypeIcon className="w-3.5 h-3.5" /> },
                    { id: 'MD', label: 'MD', icon: <FileCode className="w-3.5 h-3.5" /> },
                    { id: 'IMAGE', label: 'IMG', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNoticeFormMode(m.id as NoticeModeType)}
                      className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        noticeFormMode === m.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#0E131F] text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {noticeFormMode === 'IMAGE' && (
                <div>
                  <label className="font-bold block mb-1">이미지 URL</label>
                  <input
                    type="text"
                    value={noticeFormImageUrl}
                    onChange={(e) => setNoticeFormImageUrl(e.target.value)}
                    placeholder="https://... 이미지 웹 주소"
                    className="w-full h-9 px-3 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-mono"
                  />
                </div>
              )}

              {noticeFormMode === 'MD' ? (
                <ElmMkd01
                  value={noticeFormContent}
                  onChange={setNoticeFormContent}
                  label="공지 내용 (Markdown 문법 지원 & 미리보기)"
                  rows={5}
                  heightClass="min-h-[160px]"
                  defaultMode="edit"
                />
              ) : (
                <div>
                  <label className="font-bold block mb-1">공지 내용</label>
                  <textarea
                    value={noticeFormContent}
                    onChange={(e) => setNoticeFormContent(e.target.value)}
                    rows={5}
                    placeholder="공지 본문 내용을 입력하세요."
                    className="w-full p-2.5 rounded-lg border bg-slate-50 dark:bg-[#0E131F] font-sans text-xs"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-[#0E131F] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">이동 버튼 옵션</span>
                  <ElmChk01
                    checked={noticeFormHasButton}
                    onChange={setNoticeFormHasButton}
                    label="이동 버튼 표시"
                    className="min-h-0 py-0"
                  />
                </div>

                {noticeFormHasButton && (
                  <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold block mb-0.5">버튼명</label>
                        <input
                          type="text"
                          value={noticeFormButtonText}
                          onChange={(e) => setNoticeFormButtonText(e.target.value)}
                          placeholder="예: 자세히 보기"
                          className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block mb-0.5">타겟 구분</label>
                        <select
                          value={noticeFormTargetType}
                          onChange={(e) => setNoticeFormTargetType(e.target.value as NoticeTargetType)}
                          className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E]"
                        >
                          <option value="INTERNAL_SCREEN">1. 서비스내 화면</option>
                          <option value="CONTENT_PATH">2. 컨텐츠 경로</option>
                          <option value="EXTERNAL_URL">3. 외부 링크</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold block mb-0.5">
                        {noticeFormTargetType === 'INTERNAL_SCREEN' ? '이동할 화면 ID' :
                         noticeFormTargetType === 'CONTENT_PATH' ? '컨텐츠 상대 경로' : '외부 웹사이트 URL'}
                      </label>
                      {noticeFormTargetType === 'INTERNAL_SCREEN' ? (
                        <select
                          value={noticeFormButtonUrl}
                          onChange={(e) => setNoticeFormButtonUrl(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E] font-mono"
                        >
                          <option value="SCR-DSH-01">SCR-DSH-01 (로그인 메인 대시보드)</option>
                          <option value="SCR-LED-01">SCR-LED-01 (가계부 관리 상세)</option>
                          <option value="SCR-DUT-01">SCR-DUT-01 (모아당번 순환관리)</option>
                          <option value="SCR-GOL-01">SCR-GOL-01 (모아목표 실천관리)</option>
                          <option value="SCR-MON-01">SCR-MON-01 (모아머니 이동관리)</option>
                          <option value="SCR-SET-01">SCR-SET-01 (사용자 맞춤 환경설정)</option>
                          <option value="SCR-OFF-01">SCR-OFF-01 (오프라인 동기화 안내)</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={noticeFormButtonUrl}
                          onChange={(e) => setNoticeFormButtonUrl(e.target.value)}
                          placeholder={noticeFormTargetType === 'CONTENT_PATH' ? '/docs/notice/01' : 'https://example.com'}
                          className="w-full h-8 px-2 rounded-lg border bg-white dark:bg-[#131B2E] font-mono"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <ElmChk01
                  checked={noticeFormEnabled}
                  onChange={setNoticeFormEnabled}
                  label="즉시 전역 게시 활성화"
                  className="min-h-0 py-0.5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setIsNoticeModalOpen(false)} className="px-3 py-1.5 border rounded-lg text-xs cursor-pointer">취소</button>
              <button type="button" onClick={handleSaveNotice} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 미리보기 팝업 모달 */}
      {previewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {previewNotice.mode === 'TEXT' ? 'TEXT' : previewNotice.mode === 'MD' ? 'MD' : 'IMG'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{previewNotice.title}</h4>
              </div>
              <button type="button" onClick={() => setPreviewNotice(null)} className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {previewNotice.mode === 'IMAGE' && previewNotice.imageUrl && (
                <img
                  src={previewNotice.imageUrl}
                  alt="공지 배너"
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-100 dark:border-zinc-800"
                />
              )}
              {previewNotice.mode === 'MD' ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E131F] border border-slate-100 dark:border-zinc-800 max-h-60 overflow-y-auto">
                  <ElmMkdViewer content={previewNotice.content} />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E131F] border border-slate-100 dark:border-zinc-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {previewNotice.content}
                </div>
              )}

              {previewNotice.hasButton && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onToast(`[이동 버튼 시뮬레이션] 타겟: ${previewNotice.buttonTargetType} → ${previewNotice.buttonUrl}`);
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>{previewNotice.buttonText || '자세히 보기'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setPreviewNotice(null)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
