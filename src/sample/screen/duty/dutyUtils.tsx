import React from 'react';
import { Check } from 'lucide-react';
import { validateSafeTransferUrl, UrlValidationResult } from '../../shared/securityGuards';

export const DUTY_WEEKDAYS = [
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
  { key: 'SAT', label: '토' },
  { key: 'SUN', label: '일' },
] as const;

export const formatKoreanCycleDays = (days?: string[]): string => {
  if (!days || days.length === 0) return '상시 정기 수행';
  if (days.length === 7) return '매일 (주 7회)';
  const dayMap: Record<string, string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
  };
  const korDays = days.map((d) => dayMap[d] || d).join('·');
  return `매주 ${korDays} (주 ${days.length}회)`;
};

export const getRotationPolicyLabel = (policy: string): string => {
  switch (policy) {
    case 'AGE_WEIGHTED':
      return '연령 가중 순환 배정';
    case 'ROUND_ROBIN':
    case 'NAME_ASC':
      return '순차 순환 배정';
    case 'BIRTH_DATE':
      return '생년월일 순환 배정';
    case 'RANDOM':
    case 'RANDOM_ROULETTE':
      return '랜덤 추첨 배정';
    case 'FREE_PICK':
      return '자율 신청 배정';
    default:
      return '순환 배정';
  }
};

export const validateDutyExternalUrl = (url: string): UrlValidationResult => {
  return validateSafeTransferUrl(url);
};

export const renderDutyMarkdown = (
  text: string,
  emptyPlaceholder: string = '입력된 완수 기준이 없습니다.'
): React.ReactNode => {
  if (!text.trim()) {
    return <p className="text-slate-400 italic">{emptyPlaceholder}</p>;
  }
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={idx} className="font-bold text-slate-900 dark:text-zinc-100 text-xs mt-1.5">
              {trimmed.slice(4)}
            </h5>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 dark:text-zinc-100 text-sm mt-2">
              {trimmed.slice(3)}
            </h4>
          );
        }
        if (trimmed.startsWith('- [ ] ')) {
          return (
            <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 pl-1">
              <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-zinc-600 inline-block shrink-0" />
              <span>{trimmed.slice(6)}</span>
            </div>
          );
        }
        if (trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
          return (
            <div key={idx} className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 pl-1 font-medium">
              <Check className="w-3.5 h-3.5 inline-block shrink-0" />
              <span className="line-through text-slate-400">{trimmed.slice(6)}</span>
            </div>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1.5">
              <span className="text-indigo-500 font-bold">•</span>
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
};
