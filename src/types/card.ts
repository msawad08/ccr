export type CalculationMode = 'floor' | 'proportional' | 'round';
export type DateTrackingBasis = 'posting_date' | 'transaction_date';
export type MilestonePeriod = 'calendar_month' | 'billing_cycle' | 'quarter' | 'annual';
export type MilestoneType = 'transaction_count' | 'cumulative_spend';

export interface CapGroupDefinition {
  id: string;
  name: string;
  dailyBonusCap?: number | null;
  monthlyBonusCap?: number | null;
  parentGroupId?: string | null; // e.g., smartbuy_voucher has parent 'smartbuy'
  description?: string;
  // If true, the cap applies to total points (base + bonus), otherwise bonus points only
  capsTotalPoints?: boolean;
}

export interface RewardRule {
  id: string;
  name: string;
  categoryKey: string;
  baseRateSpend: number; // e.g. 200
  baseRatePoints: number; // e.g. 5
  bonusMultiplier: number; // e.g. 4 for 5X total, 9 for 10X total, 0 for 1X
  capGroupId?: string | null;
  dailyBonusCap?: number | null;
  monthlyBonusCap?: number | null;
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
  period: MilestonePeriod;
  targetCount?: number; // e.g. 4 for 4x transactions
  minTxnAmount?: number; // e.g. 1500
  targetSpend?: number; // e.g. 20000
  rewardPoints: number; // e.g. 1000
  includeExemptCategories?: boolean; // true if fuel/utility spend counts towards milestone
  badgeText?: string;
}

export interface CardTemplate {
  id: string;
  name: string;
  issuer: string; // e.g. 'HDFC Bank', 'American Express'
  network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' | 'Diners' | 'Other';
  currency: string; // e.g. 'INR'
  pointName: string; // e.g. 'RP', 'MR Points', 'Miles', 'Cashback ₹'
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
    spendStep: number; // e.g. 200 or 50
    pointsPerStep: number; // e.g. 5 or 1
    calculationMode: CalculationMode;
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
}

export interface MilestoneProgress {
  ruleId: string;
  title: string;
  description: string;
  type: MilestoneType;
  currentCount?: number;
  targetCount?: number;
  currentSpend?: number;
  targetSpend?: number;
  isCompleted: boolean;
  rewardPoints: number;
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

