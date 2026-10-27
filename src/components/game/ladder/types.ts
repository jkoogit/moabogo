import { Participant } from '../types';

export interface LadderRung {
  col: number;
  row: number;
}

export interface LadderGoal {
  text: string;
  icon: string;
}

export interface LadderSpeedOption {
  value: number;
  label: string;
  interval: number;
}

export interface LadderResultItem {
  goalIndex: number;
  text: string;
  icon: string;
  isWinner: boolean;
}

export type LadderResultMap = Record<string, LadderResultItem>;

export interface RevealedGoalColInfo {
  memberName: string;
  avatar: string;
  isWinner: boolean;
}

export type LadderRevealedGoalCols = Record<number, RevealedGoalColInfo>;

export interface ArrivalPopupData {
  member: Participant;
  result: LadderResultItem;
  memberIndex: number;
  totalMembers: number;
  nextMemberName?: string;
}

export const LADDER_COL_WIDTH = 84; // 사다리 열 고정 폭 (84px 완벽 통일)

export const LADDER_SPEED_OPTIONS: LadderSpeedOption[] = [
  { value: 0.5, label: '0.5x', interval: 40 },
  { value: 0.75, label: '0.75x', interval: 27 },
  { value: 1.0, label: '1.0x', interval: 20 },
  { value: 1.25, label: '1.25x', interval: 16 },
  { value: 1.5, label: '1.5x', interval: 13 },
];
