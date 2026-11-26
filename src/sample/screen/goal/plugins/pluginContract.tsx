import React from 'react';
import { GoalCategory, GoalItem } from '../../../data/goal-mock-data';

// ============================================================================
// src/sample/screen/goal/plugins/pluginContract.tsx
// 모아목표 유형별 전략 플러그인 표준 계약 (Strategy Plugin Contract)
// - 도메인 독립성(BKL-ARCH-01): 각 목표 유형별 산식·슬라이더·배지·위젯을 플러그인으로 분리
// ============================================================================

export interface GoalSliderConfig {
  min: number;
  max: number;
  step: number;
  label: string;
}

export interface GoalMetricPlugin {
  category: GoalCategory;
  label: string;
  optionLabel: string;
  comboLabel: string;
  defaultUnit: string;
  defaultTargetValue: number;
  sliderConfig: GoalSliderConfig;
  badgeColorClass: string;
  enabled: boolean;
  /** 현재 누적값과 목표 기준치·동행원 수를 기반으로 달성률(%) 계산 */
  calculateProgressRate: (
    goal: GoalItem,
    nextCurrentTotal: number,
    overrideTargetValue?: number
  ) => number;
  /** 목록/카드 화면용 카테고리 특화 지표 배지 */
  renderMetricBadge: (goal: GoalItem) => React.ReactNode;
  /** 상세 화면(SCR-GOL-02) 상단용 카테고리 특화 분석 위젯 */
  renderDetailWidget: (goal: GoalItem, currentThreshold: number) => React.ReactNode;
}
