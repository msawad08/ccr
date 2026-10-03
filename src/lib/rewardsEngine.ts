import {
  CardTemplate,
  Transaction,
  RewardRule,
  PeriodSummary,
  CapProgress,
  MilestoneProgress,
  TransactionCalculatedReward,
  DateTrackingBasis,
  DailyUsageItem,
  MonthCapReportItem,
} from '../types/card';
import { parseISO, isSameDay } from 'date-fns';

/**
 * Returns effective date string (YYYY-MM-DD) for aggregation based on user preference
 */
export function getEffectiveDate(
  txn: Pick<Transaction, 'transactionDate' | 'postingDate'>,
  basis: DateTrackingBasis = 'posting_date'
): string {
  if (basis === 'posting_date') {
    return txn.postingDate || txn.transactionDate;
  }
  return txn.transactionDate;
}

/**
 * Checks if a transaction belongs to a given year and month (1-indexed month: 1=Jan, 12=Dec)
 */
export function isInCalendarMonth(
  txn: Pick<Transaction, 'transactionDate' | 'postingDate'>,
  year: number,
  month: number,
  basis: DateTrackingBasis = 'posting_date'
): boolean {
  const dateStr = getEffectiveDate(txn, basis);
  if (!dateStr) return false;
  const [txnYear, txnMonth] = dateStr.split('-').map(Number);
  return txnYear === year && txnMonth === month;
}

/**
 * Compute raw uncapped base points for a spend amount according to card rule
 */
export function computeRawBasePoints(
  amount: number,
  rule: RewardRule,
  card: CardTemplate
): number {
  if (rule.isExempt) return 0;
  if (card.baseRule.excludedCategoryIds?.includes(rule.id)) return 0;

  const spendStep = rule.baseRateSpend || card.baseRule.spendStep || 200;
  const pointsPerStep = rule.baseRatePoints ?? card.baseRule.pointsPerStep ?? 5;
  const mode = card.baseRule.calculationMode || 'floor';

  const positiveAmount = Math.abs(amount);

  if (mode === 'proportional') {
    return (positiveAmount / spendStep) * pointsPerStep;
  } else if (mode === 'round') {
    return Math.round(positiveAmount / spendStep) * pointsPerStep;
  } else {
    // Standard bank floor rule
    return Math.floor(positiveAmount / spendStep) * pointsPerStep;
  }
}

/**
 * Compute raw uncapped bonus points
 */
export function computeRawBonusPoints(
  basePoints: number,
  rule: RewardRule
): number {
  if (rule.isExempt || !rule.bonusMultiplier || rule.bonusMultiplier <= 0) {
    return 0;
  }
  return basePoints * rule.bonusMultiplier;
}

/**
 * Given all existing transactions and a new transaction (or single txn calculation in context),
 * calculate the exact base, bonus, cap headroom and cap warnings.
 */
export function calculateTransactionReward(
  amount: number,
  rule: RewardRule,
  card: CardTemplate,
  existingTransactions: Transaction[],
  txnDate: string,
  postingDate?: string | null,
  isRefund: boolean = false,
  basis: DateTrackingBasis = 'posting_date'
): TransactionCalculatedReward {
  const effectiveDate = basis === 'posting_date' ? (postingDate || txnDate) : txnDate;
  const [year, month] = effectiveDate.split('-').map(Number);

  const rawBase = computeRawBasePoints(amount, rule, card);
  const rawBonus = computeRawBonusPoints(rawBase, rule);

  // If it's a refund, points are simply negative of the earned points
  if (isRefund) {
    return {
      basePoints: -rawBase,
      bonusPoints: -rawBonus,
      totalPoints: -(rawBase + rawBonus),
      grossAmount: -Math.abs(amount),
      cappedDaily: false,
      cappedMonthly: false,
      capGroupName: rule.capGroupId || undefined,
      capWarning: null,
    };
  }

  // Calculate current month's usage for this rule and cap group
  let currentMonthBonus = 0;
  let currentMonthTotalPoints = 0;
  let currentDayBonus = 0;
  let currentDayTotalPoints = 0;

  // Track parent cap group usage if applicable
  const capGroup = rule.capGroupId ? card.capGroups[rule.capGroupId] : null;
  const parentCapGroup = capGroup?.parentGroupId ? card.capGroups[capGroup.parentGroupId] : null;
  let parentMonthBonus = 0;
  let parentDayBonus = 0;

  for (const existing of existingTransactions) {
    const existingDate = getEffectiveDate(existing, basis);
    const [eYear, eMonth] = existingDate.split('-').map(Number);

    if (eYear !== year || eMonth !== month) continue;

    const existingRule = card.rewardRules.find((r) => r.id === existing.ruleId);
    if (!existingRule) continue;

    const eBase = computeRawBasePoints(existing.amount, existingRule, card);
    const eBonus = computeRawBonusPoints(eBase, existingRule);
    const signedMultiplier = existing.isRefund ? -1 : 1;

    // Check if matches this rule's cap group
    if (existingRule.capGroupId === rule.capGroupId || (!rule.capGroupId && existingRule.id === rule.id)) {
      currentMonthBonus += eBonus * signedMultiplier;
      currentMonthTotalPoints += (eBase + eBonus) * signedMultiplier;

      if (existingDate === effectiveDate) {
        currentDayBonus += eBonus * signedMultiplier;
        currentDayTotalPoints += (eBase + eBonus) * signedMultiplier;
      }
    }

    // Check parent cap group (e.g. smartbuy parent of smartbuy_voucher)
    if (parentCapGroup) {
      const eCapGroup = existingRule.capGroupId ? card.capGroups[existingRule.capGroupId] : null;
      if (
        existingRule.capGroupId === parentCapGroup.id ||
        eCapGroup?.parentGroupId === parentCapGroup.id
      ) {
        parentMonthBonus += eBonus * signedMultiplier;
        if (existingDate === effectiveDate) {
          parentDayBonus += eBonus * signedMultiplier;
        }
      }
    }
  }

  // Ensure non-negative usage baselines
  currentMonthBonus = Math.max(0, currentMonthBonus);
  currentDayBonus = Math.max(0, currentDayBonus);
  parentMonthBonus = Math.max(0, parentMonthBonus);
  parentDayBonus = Math.max(0, parentDayBonus);

  let finalBase = rawBase;
  let finalBonus = rawBonus;
  let cappedDaily = false;
  let cappedMonthly = false;
  let capWarning: string | null = null;

  // Handle total points capped categories (e.g. Grocery 2,000 RP, Utility 2,000 RP, Insurance 2,000 RP)
  if (capGroup?.capsTotalPoints && capGroup.monthlyBonusCap) {
    const remainingMonthly = Math.max(0, capGroup.monthlyBonusCap - currentMonthTotalPoints);
    if (finalBase > remainingMonthly) {
      cappedMonthly = true;
      finalBase = remainingMonthly;
      capWarning = `Exceeds monthly ${capGroup.name} cap of ${capGroup.monthlyBonusCap.toLocaleString()} RP. Points reduced to ${finalBase.toLocaleString()} RP.`;
    }
  }

  // Handle bonus point caps
  const monthlyCap = rule.monthlyBonusCap ?? capGroup?.monthlyBonusCap;
  const dailyCap = rule.dailyBonusCap ?? capGroup?.dailyBonusCap;

  // Check Sub-Cap / Category Cap
  if (monthlyCap && finalBonus > 0) {
    const remainingMonthly = Math.max(0, monthlyCap - currentMonthBonus);
    if (finalBonus > remainingMonthly) {
      cappedMonthly = true;
      const originalBonus = finalBonus;
      finalBonus = remainingMonthly;
      capWarning = `Exceeds monthly bonus limit for ${rule.name} (${monthlyCap.toLocaleString()} RP) by ${(originalBonus - remainingMonthly).toLocaleString()} RP.`;
    }
  }

  // Check Parent Cap Group (e.g. Total SmartBuy cap 4,000 RP)
  if (parentCapGroup?.monthlyBonusCap && finalBonus > 0) {
    const remainingParentMonthly = Math.max(0, parentCapGroup.monthlyBonusCap - parentMonthBonus);
    if (finalBonus > remainingParentMonthly) {
      cappedMonthly = true;
      const originalBonus = finalBonus;
      finalBonus = remainingParentMonthly;
      capWarning = `Exceeds overall ${parentCapGroup.name} (${parentCapGroup.monthlyBonusCap.toLocaleString()} RP) by ${(originalBonus - remainingParentMonthly).toLocaleString()} RP.`;
    }
  }

  // Check Daily Cap
  const effectiveDailyCap = parentCapGroup?.dailyBonusCap ?? dailyCap;
  if (effectiveDailyCap && finalBonus > 0) {
    const effectiveDayUsage = parentCapGroup ? parentDayBonus : currentDayBonus;
    const remainingDaily = Math.max(0, effectiveDailyCap - effectiveDayUsage);
    if (finalBonus > remainingDaily) {
      cappedDaily = true;
      const originalBonus = finalBonus;
      finalBonus = remainingDaily;
      capWarning = `Exceeds today's ${parentCapGroup ? parentCapGroup.name : 'daily'} ${effectiveDailyCap.toLocaleString()} bonus RP limit by ${(originalBonus - remainingDaily).toLocaleString()} RP.`;
    }
  }

  return {
    basePoints: finalBase,
    bonusPoints: finalBonus,
    totalPoints: finalBase + finalBonus,
    grossAmount: Math.abs(amount),
    cappedDaily,
    cappedMonthly,
    capGroupName: capGroup?.name || rule.capGroupId || undefined,
    capWarning,
  };
}

/**
 * Compute the complete period summary (Net spends, Base RP, Bonus RP, Cap Meters, Milestones)
 */
export function evaluateCardPeriodSummary(
  card: CardTemplate,
  transactions: Transaction[],
  year: number,
  month: number,
  basis: DateTrackingBasis = 'posting_date',
  selectedDay?: string
): PeriodSummary {
  const periodTransactions = transactions
    .filter((t) => isInCalendarMonth(t, year, month, basis))
    .sort((a, b) => {
      const dateA = getEffectiveDate(a, basis);
      const dateB = getEffectiveDate(b, basis);
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  let totalSpend = 0;
  let totalRefunds = 0;
  let totalBasePoints = 0;
  let totalBonusPoints = 0;

  // Track cap group usage
  const capGroupUsage: Record<
    string,
    {
      usedBonusPoints: number;
      usedSpend: number;
      dailyUsageMap: Record<string, number>;
      dailySpendMap: Record<string, number>;
    }
  > = {};

  // Initialize all defined cap groups
  for (const [groupId] of Object.entries(card.capGroups)) {
    capGroupUsage[groupId] = {
      usedBonusPoints: 0,
      usedSpend: 0,
      dailyUsageMap: {},
      dailySpendMap: {},
    };
  }

  // Replay transactions in chronological order to correctly account for caps and refunds
  const processedTxns: Transaction[] = [];

  for (const txn of periodTransactions) {
    const rule = card.rewardRules.find((r) => r.id === txn.ruleId);
    if (!rule) continue;

    const reward = calculateTransactionReward(
      txn.amount,
      rule,
      card,
      processedTxns,
      txn.transactionDate,
      txn.postingDate,
      txn.isRefund,
      basis
    );

    processedTxns.push(txn);

    if (txn.isRefund) {
      totalRefunds += Math.abs(txn.amount);
    } else {
      totalSpend += Math.abs(txn.amount);
    }

    totalBasePoints += reward.basePoints;
    totalBonusPoints += reward.bonusPoints;

    // Attribute to cap group
    if (rule.capGroupId && capGroupUsage[rule.capGroupId]) {
      const signedBonus = reward.bonusPoints;
      const signedSpend = txn.isRefund ? -Math.abs(txn.amount) : Math.abs(txn.amount);
      const effDate = getEffectiveDate(txn, basis);

      capGroupUsage[rule.capGroupId].usedBonusPoints += signedBonus;
      capGroupUsage[rule.capGroupId].usedSpend += signedSpend;

      const currentDayBonus = capGroupUsage[rule.capGroupId].dailyUsageMap[effDate] || 0;
      capGroupUsage[rule.capGroupId].dailyUsageMap[effDate] = Math.max(0, currentDayBonus + signedBonus);

      const currentDaySpend = capGroupUsage[rule.capGroupId].dailySpendMap[effDate] || 0;
      capGroupUsage[rule.capGroupId].dailySpendMap[effDate] = Math.max(0, currentDaySpend + signedSpend);

      // Also propagate to parent cap group (e.g. smartbuy)
      const capGroupDef = card.capGroups[rule.capGroupId];
      if (capGroupDef.parentGroupId && capGroupUsage[capGroupDef.parentGroupId]) {
        capGroupUsage[capGroupDef.parentGroupId].usedBonusPoints += signedBonus;
        capGroupUsage[capGroupDef.parentGroupId].usedSpend += signedSpend;

        const parentDayBonus = capGroupUsage[capGroupDef.parentGroupId].dailyUsageMap[effDate] || 0;
        capGroupUsage[capGroupDef.parentGroupId].dailyUsageMap[effDate] = Math.max(0, parentDayBonus + signedBonus);

        const parentDaySpend = capGroupUsage[capGroupDef.parentGroupId].dailySpendMap[effDate] || 0;
        capGroupUsage[capGroupDef.parentGroupId].dailySpendMap[effDate] = Math.max(0, parentDaySpend + signedSpend);
      }
    }
  }

  const netSpend = totalSpend - totalRefunds;

  // Build CapProgress objects
  const capsProgress: CapProgress[] = Object.entries(card.capGroups).map(([groupId, groupDef]) => {
    const usage = capGroupUsage[groupId] || {
      usedBonusPoints: 0,
      usedSpend: 0,
      dailyUsageMap: {},
      dailySpendMap: {},
    };

    const usedBonus = Math.max(0, usage.usedBonusPoints);
    const maxBonus = groupDef.monthlyBonusCap ?? null;
    const remainingBonus = maxBonus !== null ? Math.max(0, maxBonus - usedBonus) : null;

    // Find bonus multiplier for this group to calculate equivalent spend capacity in INR
    const matchingRule = card.rewardRules.find((r) => r.capGroupId === groupId);
    let multiplierBonusPerRupee = 0;
    if (matchingRule && matchingRule.bonusMultiplier > 0) {
      const step = matchingRule.baseRateSpend || card.baseRule.spendStep || 200;
      const points = matchingRule.baseRatePoints ?? card.baseRule.pointsPerStep ?? 5;
      const bonusPointsPerStep = points * matchingRule.bonusMultiplier;
      multiplierBonusPerRupee = bonusPointsPerStep / step; // e.g. 20 / 200 = 0.10
    }

    let equivalentMaxSpend: number | null = null;
    let equivalentRemainingSpend: number | null = null;
    if (maxBonus !== null && multiplierBonusPerRupee > 0) {
      equivalentMaxSpend = Math.round(maxBonus / multiplierBonusPerRupee);
      equivalentRemainingSpend = remainingBonus !== null ? Math.round(remainingBonus / multiplierBonusPerRupee) : null;
    }

    // Determine Peak Day
    let peakDay: { date: string; bonusPoints: number } | undefined;
    let highestBonus = 0;
    for (const [dateKey, pts] of Object.entries(usage.dailyUsageMap)) {
      if (pts > highestBonus) {
        highestBonus = pts;
        peakDay = { date: dateKey, bonusPoints: pts };
      }
    }

    // Determine selected date (default to today if in current month, or peak day, or first date)
    const todayStr = new Date().toISOString().split('T')[0];
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    let effectiveSelectedDate = selectedDay;
    if (!effectiveSelectedDate) {
      if (todayStr.startsWith(monthPrefix)) {
        effectiveSelectedDate = todayStr;
      } else if (peakDay) {
        effectiveSelectedDate = peakDay.date;
      } else {
        effectiveSelectedDate = `${monthPrefix}-01`;
      }
    }

    const todayBonusUsed = usage.dailyUsageMap[todayStr] || 0;
    const selectedDateBonus = usage.dailyUsageMap[effectiveSelectedDate] || 0;

    // Build chronological daily history for active dates
    const allDates = Array.from(
      new Set([...Object.keys(usage.dailyUsageMap), ...Object.keys(usage.dailySpendMap)])
    ).sort();

    const dailyHistory: DailyUsageItem[] = allDates.map((date) => {
      const bPoints = usage.dailyUsageMap[date] || 0;
      const sp = usage.dailySpendMap[date] || 0;
      const dailyCap = groupDef.dailyBonusCap || 2000;
      return {
        date,
        bonusPoints: bPoints,
        spend: sp,
        isExceeded: bPoints >= dailyCap,
        percentOfDailyCap: Math.min(100, Math.round((bPoints / dailyCap) * 100)),
      };
    });

    const percentUsed = maxBonus ? Math.min(100, Math.round((usedBonus / maxBonus) * 100)) : 0;
    const isExceeded = maxBonus !== null && usedBonus >= maxBonus;

    return {
      capGroupId: groupId,
      name: groupDef.name,
      usedBonusPoints: usedBonus,
      maxBonusPoints: maxBonus,
      usedDailyBonusPoints: todayBonusUsed,
      maxDailyBonusPoints: groupDef.dailyBonusCap ?? null,
      selectedDate: effectiveSelectedDate,
      selectedDateBonusPoints: selectedDateBonus,
      dailyUsageMap: usage.dailyUsageMap,
      dailyHistory,
      peakDay,
      equivalentUsedSpend: Math.max(0, usage.usedSpend),
      equivalentMaxSpend,
      equivalentRemainingSpend,
      remainingBonusPoints: remainingBonus,
      percentUsed,
      isExceeded,
    };
  });

  // Evaluate Milestones (Amex MRCC or similar cards)
  let totalMilestonePoints = 0;
  const milestonesProgress: MilestoneProgress[] = card.milestoneRules.map((mRule) => {
    if (mRule.type === 'transaction_count') {
      const targetCount = mRule.targetCount || 4;
      const minAmount = mRule.minTxnAmount || 1500;

      // Filter eligible transactions
      const qualifying = periodTransactions.filter((txn) => {
        if (txn.isRefund) return false;
        if (txn.amount < minAmount) return false;

        const rule = card.rewardRules.find((r) => r.id === txn.ruleId);
        if (!rule) return false;
        if (rule.isExempt && !mRule.includeExemptCategories && !rule.isMilestoneEligible) {
          return false;
        }
        return true;
      });

      const isCompleted = qualifying.length >= targetCount;
      if (isCompleted) {
        totalMilestonePoints += mRule.rewardPoints;
      }

      return {
        ruleId: mRule.id,
        title: mRule.title,
        description: mRule.description,
        type: mRule.type,
        currentCount: qualifying.length,
        targetCount,
        isCompleted,
        rewardPoints: mRule.rewardPoints,
        qualifyingTransactions: qualifying.map((q) => ({
          id: q.id,
          merchant: q.merchant,
          amount: q.amount,
          date: getEffectiveDate(q, basis),
        })),
        percentComplete: Math.min(100, Math.round((qualifying.length / targetCount) * 100)),
      };
    } else {
      // Cumulative spend milestone (e.g. ₹20,000 monthly spend)
      const targetSpend = mRule.targetSpend || 20000;

      // Sum net spends of all eligible categories
      let eligibleSpend = 0;
      for (const txn of periodTransactions) {
        const rule = card.rewardRules.find((r) => r.id === txn.ruleId);
        if (!rule) continue;
        if (rule.isExempt && !mRule.includeExemptCategories && !rule.isMilestoneEligible) {
          continue;
        }
        eligibleSpend += txn.isRefund ? -Math.abs(txn.amount) : Math.abs(txn.amount);
      }

      eligibleSpend = Math.max(0, eligibleSpend);
      const isCompleted = eligibleSpend >= targetSpend;
      if (isCompleted) {
        totalMilestonePoints += mRule.rewardPoints;
      }

      return {
        ruleId: mRule.id,
        title: mRule.title,
        description: mRule.description,
        type: mRule.type,
        currentSpend: eligibleSpend,
        targetSpend,
        isCompleted,
        rewardPoints: mRule.rewardPoints,
        percentComplete: Math.min(100, Math.round((eligibleSpend / targetSpend) * 100)),
      };
    }
  });

  const netPoints = totalBasePoints + totalBonusPoints + totalMilestonePoints;
  const ceiling = card.statementCeilingPoints;
  const statementCeilingReached = ceiling ? netPoints >= ceiling : false;
  const finalNetPoints = ceiling ? Math.min(ceiling, netPoints) : netPoints;
  const pointValueInInr = card.pointValueInInr || 0.5;
  const totalRewardValueInInr = Number((finalNetPoints * pointValueInInr).toFixed(2));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const periodLabel = `${monthNames[month - 1]} ${year}`;

  return {
    periodLabel,
    year,
    month,
    totalSpend,
    totalRefunds,
    netSpend,
    totalBasePoints,
    totalBonusPoints,
    totalMilestonePoints,
    netTotalPoints: finalNetPoints,
    pointValueInInr,
    totalRewardValueInInr,
    statementCeilingReached,
    capsProgress,
    milestonesProgress,
  };
}

/**
 * Generate monthly comparison report across past months to see which months reached or neared caps
 */
export function generateMonthlyComparisonReport(
  card: CardTemplate,
  transactions: Transaction[],
  basis: DateTrackingBasis = 'posting_date',
  monthsCount: number = 6
): MonthCapReportItem[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Build target (year, month) list
  const monthMap = new Map<string, { year: number; month: number }>();

  // Add past N months
  for (let i = monthsCount - 1; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    const key = `${y}-${String(m).padStart(2, '0')}`;
    monthMap.set(key, { year: y, month: m });
  }

  // Also include any months present in transactions
  for (const txn of transactions) {
    const effDate = getEffectiveDate(txn, basis);
    if (!effDate) continue;
    const [y, m] = effDate.split('-').map(Number);
    if (y && m) {
      const key = `${y}-${String(m).padStart(2, '0')}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { year: y, month: m });
      }
    }
  }

  // Sort chronologically
  const sortedMonths = Array.from(monthMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return sortedMonths.map(({ year, month }) => {
    const summary = evaluateCardPeriodSummary(card, transactions, year, month, basis);

    let hasCapBreached = summary.statementCeilingReached;
    let hasNearCap = false;
    let peakDailyPoints = 0;
    let peakDailyDate: string | undefined;

    const capsSummary = summary.capsProgress.map((cap) => {
      let status: 'reached' | 'near_cap' | 'available' = 'available';
      if (cap.percentUsed >= 100) {
        status = 'reached';
        hasCapBreached = true;
      } else if (cap.percentUsed >= 80) {
        status = 'near_cap';
        hasNearCap = true;
      }

      if (cap.peakDay && cap.peakDay.bonusPoints > peakDailyPoints) {
        peakDailyPoints = cap.peakDay.bonusPoints;
        peakDailyDate = cap.peakDay.date;
      }

      return {
        capGroupId: cap.capGroupId,
        capName: cap.name,
        usedBonusPoints: cap.usedBonusPoints,
        maxBonusPoints: cap.maxBonusPoints ?? null,
        percentUsed: cap.percentUsed,
        status,
      };
    });

    const milestonesSummary = summary.milestonesProgress.map((m) => ({
      title: m.title,
      isCompleted: m.isCompleted,
      rewardPoints: m.rewardPoints,
    }));

    return {
      year,
      month,
      periodLabel: summary.periodLabel,
      netSpend: summary.netSpend,
      totalPoints: summary.netTotalPoints,
      totalBasePoints: summary.totalBasePoints,
      totalBonusPoints: summary.totalBonusPoints + summary.totalMilestonePoints,
      totalRewardValueInInr: summary.totalRewardValueInInr,
      pointName: card.pointName,
      capsSummary,
      milestonesSummary,
      statementCeilingReached: summary.statementCeilingReached,
      peakDailyPoints,
      peakDailyDate,
      hasCapBreached,
      hasNearCap,
    };
  });
}

