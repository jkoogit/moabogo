export interface SettlementMemberShare {
  amount: number;
  weight: number;
  ratio: number;
}

export interface SettlementSummary {
  perPerson: number;
  baseUnitAmount: number;
  remainder: number;
  total: number;
  totalWeight: number;
  memberShares: Record<string, SettlementMemberShare>;
}
