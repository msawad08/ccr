export type CalculationMode = 'floor' | 'direct_percentage' | 'proportional' | 'round';
export type DateTrackingBasis = 'posting_date' | 'transaction_date';
export type MilestonePeriod = 'calendar_month' | 'billing_cycle' | 'quarterly' | 'annual';
export type MilestoneType = 'transaction_count' | 'cumulative_spend';
export type MilestoneBenefitType = 'points' | 'voucher' | 'fee_waiver' | 'lounge_access';
export type CapTarget = 'bonus_only' | 'total_points';

export interface CapGroupDefinition {
  id: string;
  name: string;
  dailyBonusCap?: number | null;
  monthlyBonusCap?: number | null;
  parentGroupId?: string | null; // e.g., smartbuy_voucher has parent 'smartbuy'
  description?: string;
  // If 'total_points', cap applies to the entire reward (e.g. SBI Cashback 5% online cap of ₹5,000)
  capTarget?: CapTarget;
  capsTotalPoints?: boolean; // backwards compatibility
}

export interface RewardRule {
  id: string;
  name: string;
  categoryKey: string;
  baseRateSpend: number; // e.g. 200 (for HDFC) or 100 (for SBI Cashback)
  baseRatePoints: number; // e.g. 5 (for HDFC) or 1 (for 1% SBI Cashback)
  bonusMultiplier: number; // e.g. 4 for 5X/5%, 9 for 10X, 0 for 1X
  capGroupId?: string | null;
  dailyBonusCap?: number | null;
  monthlyBonusCap?: number | null;
  // If 'total_points', capping limits entire reward (base + bonus), e.g. SBI CB 5% online
  capTarget?: CapTarget;
  isExempt?: boolean; // Fuel, Rent, Wallet, Gov (0 RP)
  isMilestoneEligible?: boolean; // amex fuel/utilities count for milestone but 0 base points
  dateTrackingBasis?: DateTrackingBasis;
  notes?: string;
}

export interface MilestoneRule {
  id: string;
  title: string;
  description: string;
  type: MilestoneType;
  period: MilestonePeriod; // 'calendar_month' | 'billing_cycle' | 'quarterly' | 'annual'
  targetCount?: number; // e.g. 4 for 4x transactions
  minTxnAmount?: number; // e.g. 1500
  targetSpend?: number; // e.g. 150000 for quarterly ₹1.5L voucher, 50000 for quarterly lounge, 400000 for fee waiver
  rewardPoints?: number; // e.g. 1000 bonus points
  benefitType?: MilestoneBenefitType; // 'points' | 'voucher' | 'fee_waiver' | 'lounge_access'
  benefitValue?: string; // e.g. "₹1,500 Voucher", "Fee Waived (₹2,500)", "2 Lounge Visits"
  voucherValue?: number; // e.g. 1500
  voucherBrand?: string; // e.g. "Flights / Marriott / M&S"
  loungeVisitsCount?: number; // e.g. 2 complimentary lounge visits
  // Granular category inclusion: which specific category rules count towards this milestone
  eligibleRuleIds?: string[];
  excludedRuleIds?: string[];
  includeExemptCategories?: boolean; // backwards compatibility
  badgeText?: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  issuer: string; // e.g. 'HDFC Bank', 'American Express', 'SBI Card'
  network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' | 'Diners' | 'Other';
  currency: string; // e.g. 'INR'
  pointName: string; // e.g. 'RP', 'MR Points', 'Cashback ₹', 'Miles'
  pointValueInInr: number; // e.g. 0.50, 0.25, 1.00
  statementCeilingPoints?: number | null; // e.g. 50000 for Regalia Gold
  theme: {
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
    cardTextColor: string;
    tagBg: string;
  };
  baseRule: {
    spendStep: number; // e.g. 200, 100, 50
    pointsPerStep: number; // e.g. 5, 1, 5
    calculationMode: CalculationMode; // 'floor' | 'direct_percentage' | 'proportional' | 'round'
    excludedCategoryIds?: string[];
  };
  capGroups: Record<string, CapGroupDefinition>;
  rewardRules: RewardRule[];
  milestoneRules: MilestoneRule[];
  isCustom?: boolean;
}

export interface UserCard {
  id: string;
  userId?: string;
  cardTemplateId: string;
  nickname: string;
  last4?: string;
  billingCycleDay: number; // 1 - 31
  templateOverride?: CardTemplate; // Allows customized rules/devaluations per user card
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  userCardId: string;
  ruleId: string;
  transactionDate: string; // YYYY-MM-DD
  postingDate?: string | null; // YYYY-MM-DD
  merchant: string;
  amount: number;
  isRefund: boolean;
  relatedTransactionId?: string | null;
  notes?: string;
  createdAt: string;
}

export interface TransactionCalculatedReward {
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
  grossAmount: number;
  cappedDaily: boolean;
  cappedMonthly: boolean;
  capGroupName?: string;
  capWarning?: string | null;
}

export interface DailyUsageItem {
  date: string;
  bonusPoints: number;
  spend: number;
  isExceeded: boolean;
  percentOfDailyCap: number;
}

export interface CapProgress {
  capGroupId: string;
  name: string;
  usedBonusPoints: number;
  maxBonusPoints?: number | null;
  usedDailyBonusPoints: number;
  maxDailyBonusPoints?: number | null;
  selectedDate?: string;
  selectedDateBonusPoints?: number;
  dailyUsageMap: Record<string, number>;
  dailyHistory: DailyUsageItem[];
  peakDay?: { date: string; bonusPoints: number };
  equivalentUsedSpend: number;
  equivalentMaxSpend?: number | null;
  equivalentRemainingSpend?: number | null;
  remainingBonusPoints?: number | null;
  percentUsed: number;
  isExceeded: boolean;
  capTarget?: CapTarget;
}

export interface MilestoneProgress {
  ruleId: string;
  title: string;
  description: string;
  type: MilestoneType;
  period: MilestonePeriod;
  periodLabel?: string; // e.g. "Q4 2026 (Oct - Dec)", "Year 2026", "October 2026"
  benefitType: MilestoneBenefitType;
  benefitValue?: string;
  rewardPoints: number;
  currentCount?: number;
  targetCount?: number;
  currentSpend?: number;
  targetSpend?: number;
  remainingSpend?: number;
  isCompleted: boolean;
  loungeVisitsUnlocked?: number;
  loungeVisitsRemainingSpend?: number;
  qualifyingTransactions?: Array<{
    id: string;
    merchant: string;
    amount: number;
    date: string;
  }>;
  percentComplete: number;
}

export interface PeriodSummary {
  periodLabel: string;
  year: number;
  month: number;
  quarterLabel: string; // e.g. "Q4 2026"
  totalSpend: number;
  totalRefunds: number;
  netSpend: number;
  totalBasePoints: number;
  totalBonusPoints: number;
  totalMilestonePoints: number;
  netTotalPoints: number;
  pointValueInInr: number;
  totalRewardValueInInr: number;
  statementCeilingReached: boolean;
  capsProgress: CapProgress[];
  milestonesProgress: MilestoneProgress[];
  loungeSummary?: {
    totalUnlockedVisits: number;
    activeVisitsAvailable: number;
    qualifyingSpendThisQuarter: number;
    targetQuarterSpend: number;
    remainingSpendToUnlock: number;
    status: 'unlocked' | 'in_progress';
  };
}

export interface MonthCapReportItem {
  year: number;
  month: number;
  periodLabel: string;
  netSpend: number;
  totalPoints: number;
  totalBasePoints: number;
  totalBonusPoints: number;
  totalRewardValueInInr: number;
  pointName: string;
  capsSummary: Array<{
    capGroupId: string;
    capName: string;
    usedBonusPoints: number;
    maxBonusPoints: number | null;
    percentUsed: number;
    status: 'reached' | 'near_cap' | 'available';
  }>;
  milestonesSummary: Array<{
    title: string;
    isCompleted: boolean;
    rewardPoints: number;
  }>;
  statementCeilingReached: boolean;
  peakDailyPoints: number;
  peakDailyDate?: string;
  hasCapBreached: boolean;
  hasNearCap: boolean;
}
