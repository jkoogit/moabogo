import React, { useState } from 'react';
import { ElmSwt01, ElmChk01 } from '../../elements/Tokens';
import {
  Bell,
  Save,
  CreditCard,
  Sparkles,
  Target,
  Coins,
  Clock,
} from 'lucide-react';
import {
  SystemNotificationMatrix,
  loadNotificationMatrix,
  saveNotificationMatrix,
} from '../../data/systemGovernancePool';

interface NotificationMatrixTabProps {
  onToast: (message: string) => void;
}

export const NotificationMatrixTab: React.FC<NotificationMatrixTabProps> = ({ onToast }) => {
  const [notifyMatrix, setNotifyMatrix] = useState<SystemNotificationMatrix>(() =>
    loadNotificationMatrix()
  );

  const handleSaveNotifyMatrix = () => {
    saveNotificationMatrix(notifyMatrix);
    onToast('알림 발송 매트릭스 정책이 저장되었습니다.');
  };

  return (
    <section className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>서비스 전역 알림 발송 매트릭스 정책 (7대 서비스 22종 토글)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            인증 메일 한정 발송 옵션 및 가계부·모아당번·모아목표·모아머니·모아부릉·모아데이·모아루틴 22종 알림을 제어합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveNotifyMatrix}
          className="min-h-[38px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>알림 정책 저장</span>
        </button>
      </div>

      {/* 인증된 메일 한정 옵션 */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
        <ElmSwt01
          checked={notifyMatrix.requireVerifiedEmailOnly}
          onChange={(checked) =>
            setNotifyMatrix((prev) => ({ ...prev, requireVerifiedEmailOnly: checked }))
          }
          label="인증된 이메일에만 알림 발송 제한"
          description="활성화 시 메일 주소 소유권이 검증된 회원에게만 웹 푸시 및 이메일 노티를 전송합니다."
        />
      </div>

      {/* 22종 서비스 알림 토글 매트릭스 */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block">
          서비스 전역 22종 알림 매트릭스 목록
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. 가계부 영역 (2종) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>가계부 알림 (2종)</span>
            </span>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, ledgerMemberRegistered: !prev.ledgerMemberRegistered }))}
                className="py-2 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-indigo-600 transition-colors">가계부 구성원 등록 알림</div>
                  <div className="text-[10px] text-slate-400">모임 장부에 신규 멤버 합류 시 발송</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.ledgerMemberRegistered}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, ledgerMemberRegistered: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, ledgerRecurringExpense: !prev.ledgerRecurringExpense }))}
                className="py-2 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-indigo-600 transition-colors">정기지출 예정 도래 알림</div>
                  <div className="text-[10px] text-slate-400">고정비/월세 결제 3일 전 리마인더</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.ledgerRecurringExpense}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, ledgerRecurringExpense: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 2. 모아당번 영역 (4종) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>모아당번 알림 (4종)</span>
            </span>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyWatchEvent: !prev.dutyWatchEvent }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">관람당번 이벤트 알림</div>
                  <div className="text-[10px] text-slate-400">당번 교체 및 중요 이벤트 안내</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.dutyWatchEvent}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyWatchEvent: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyScheduleReminder: !prev.dutyScheduleReminder }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">담당 당번일정 도래 알림</div>
                  <div className="text-[10px] text-slate-400">본인 담당 당번 수행 당일 알림</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.dutyScheduleReminder}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyScheduleReminder: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyActionRequest: !prev.dutyActionRequest }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">당번 수행 요청 알림</div>
                  <div className="text-[10px] text-slate-400">동료의 당번 대리 수행 요청 시 발송</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.dutyActionRequest}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyActionRequest: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, dutyInviteAccepted: !prev.dutyInviteAccepted }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">당번 초대요청/수용 알림</div>
                  <div className="text-[10px] text-slate-400">새 모임 당번 롤에 참여 확정 시 발송</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.dutyInviteAccepted}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, dutyInviteAccepted: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 3. 모아목표 영역 (4종) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>모아목표 알림 (4종)</span>
            </span>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalWatchEvent: !prev.goalWatchEvent }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">관람목표 이벤트 알림</div>
                  <div className="text-[10px] text-slate-400">목표 달성 및 주요 마일스톤 안내</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.goalWatchEvent}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalWatchEvent: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalScheduleReminder: !prev.goalScheduleReminder }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">목표 수행일정 도래 알림</div>
                  <div className="text-[10px] text-slate-400">목표 실천 체크 시간 리마인더</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.goalScheduleReminder}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalScheduleReminder: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalCheerMessage: !prev.goalCheerMessage }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">목표 수행응원 도착 알림</div>
                  <div className="text-[10px] text-slate-400">친구의 응원 메시지 및 격려 수신 시</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.goalCheerMessage}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalCheerMessage: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, goalInviteAccepted: !prev.goalInviteAccepted }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-purple-600 transition-colors">목표 초대요청/수용 알림</div>
                  <div className="text-[10px] text-slate-400">챌린지 초대 및 팀원 수용 시 발송</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.goalInviteAccepted}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, goalInviteAccepted: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 4. 모아머니 영역 (3종) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              <span>모아머니 알림 (3종)</span>
            </span>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, moneySettleProcessed: !prev.moneySettleProcessed }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">정산요청/승인 알림 (정산결과처리)</div>
                  <div className="text-[10px] text-slate-400">정산 결과 확정 및 입금 요청</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.moneySettleProcessed}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, moneySettleProcessed: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, moneySupportProcessed: !prev.moneySupportProcessed }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">지원요청/승인 알림 (용돈지원/가불)</div>
                  <div className="text-[10px] text-slate-400">용돈 지원 및 긴급 가불 처리 결과</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.moneySupportProcessed}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, moneySupportProcessed: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
              <div
                onClick={() => setNotifyMatrix((prev) => ({ ...prev, moneyRewardProcessed: !prev.moneyRewardProcessed }))}
                className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
              >
                <div>
                  <div className="text-xs font-semibold group-hover:text-amber-600 transition-colors">보상요청/승인 알림 (당번수행대가)</div>
                  <div className="text-[10px] text-slate-400">당번 수행 완료 대가 머니 지급 완료 시</div>
                </div>
                <ElmChk01
                  checked={notifyMatrix.moneyRewardProcessed}
                  onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, moneyRewardProcessed: chk }))}
                  className="min-h-0 py-0 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* 5. 모아부릉 영역 (3종) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>모아부릉(차량) 알림 (3종)</span>
            </span>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {[
                { key: 'carInsuranceExpiry' as const, title: '자동차보험 만기 갱신 D-Day 알림', desc: '만기 30일/7일 전 갱신 안내 발송' },
                { key: 'carLegalInspection' as const, title: '정기종합검사 도래 알림', desc: '교통안전공단 법정 검사 기한 알림' },
                { key: 'carConsumableDue' as const, title: '소모품 교체 임박 알림', desc: '엔진오일·필터·타이어 주행거리/기간 도래' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setNotifyMatrix((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                >
                  <div>
                    <div className="text-xs font-semibold group-hover:text-emerald-600 transition-colors">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  <ElmChk01
                    checked={notifyMatrix[item.key]}
                    onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, [item.key]: chk }))}
                    className="min-h-0 py-0 pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 6. 모아데이(2종) & 모아루틴(4종) 영역 */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0E131F] space-y-2.5">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>모아데이(2종) · 모아루틴(4종) 알림</span>
            </span>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {[
                { key: 'dayScheduleReminder' as const, title: '모아데이 일정 사전 리마인더', desc: '전역 캘린더 등록 일정 사전 알림' },
                { key: 'dayPastYearBriefing' as const, title: '모아데이 과거의 오늘 회고 브리핑', desc: 'N년 전 오늘 일기/소비 내역 브리핑' },
                { key: 'routineMedicineReminder' as const, title: '모아루틴 약복용 시점·소진 임박', desc: '아침/점심/저녁/취침전 복약 및 재처방 알림' },
                { key: 'routineMvnoDue' as const, title: '모아루틴 알뜰폰 프로모션·약정 D-Day', desc: '특가 종료 및 90일 제한 해제 알림' },
                { key: 'routineTaxDeadline' as const, title: '모아루틴 세금계산서 10일 마감 알림', desc: '매월 10일 의무 발급 사전 리마인더' },
                { key: 'routineCardSettlement' as const, title: '모아루틴 급여·카드 일괄 정산 알림', desc: '급여일 카드 청구서 대사 및 송금 안내' },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => setNotifyMatrix((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                  className="py-1.5 flex items-center justify-between cursor-pointer group select-none"
                >
                  <div>
                    <div className="text-xs font-semibold group-hover:text-sky-600 transition-colors">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  <ElmChk01
                    checked={notifyMatrix[item.key]}
                    onChange={(chk) => setNotifyMatrix((prev) => ({ ...prev, [item.key]: chk }))}
                    className="min-h-0 py-0 pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
