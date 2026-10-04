'use client';

import React from 'react';
import { CardTemplate, PeriodSummary } from '../types/card';
import { formatCurrency, formatPoints } from '../lib/utils';
import { Sparkles, TrendingUp, ShieldCheck, CheckCircle2, BarChart3 } from 'lucide-react';
import { DailyCapInspector } from './DailyCapInspector';
import { MilestoneCardSection } from './MilestoneCardSection';

interface GenericCardDashboardProps {
  card: CardTemplate;
  summary: PeriodSummary;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  onOpenMonthlyReport?: () => void;
}

export const GenericCardDashboard: React.FC<GenericCardDashboardProps> = ({
  card,
  summary,
  selectedDay,
  onSelectDay,
  onOpenMonthlyReport,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points Accrued */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">Total Points Accrued</div>
          <div className="text-2xl font-bold font-mono text-[#C5A880] mt-1.5 flex items-baseline space-x-1.5">
            <span>{formatPoints(summary.netTotalPoints)}</span>
            <span className="text-xs font-normal text-stone-400">{card.pointName}</span>
          </div>
          <div className="text-xs text-[#769F86] mt-1 flex items-center space-x-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Worth ≈ {formatCurrency(summary.totalRewardValueInInr)}</span>
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 flex items-center justify-between border-t border-stone-800/80 pt-2">
            <span>Base: {formatPoints(summary.totalBasePoints)}</span>
            <span>Bonus: {formatPoints(summary.totalBonusPoints + summary.totalMilestonePoints)}</span>
          </div>
        </div>

        {/* Net Monthly Spends */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">Net Monthly Spend</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5">
            {formatCurrency(summary.netSpend)}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            Settled transactions in {summary.periodLabel}
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2 flex items-center justify-between">
            <span>Base Rate:</span>
            <span>
              {card.baseRule.pointsPerStep} {card.pointName} / ₹{card.baseRule.spendStep}
            </span>
          </div>
        </div>

        {/* Statement Ceiling / Points Limit */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">Cycle Points Ceiling</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5">
            {card.statementCeilingPoints
              ? `${formatPoints(card.statementCeilingPoints)} ${card.pointName}`
              : 'No Limit'}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            {card.statementCeilingPoints
              ? `${formatPoints(Math.max(0, card.statementCeilingPoints - summary.netTotalPoints))} capacity left`
              : 'Unlimited points accrual'}
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2 flex items-center justify-between">
            <span>Redemption Value:</span>
            <span>₹{card.pointValueInInr} per point</span>
          </div>
        </div>
      </div>

      {/* Dynamic Cap Groups */}
      {summary.capsProgress.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
              <h3 className="font-serif font-medium text-sm text-stone-100">Reward Cap Capacity Meters</h3>
              <span className="text-xs text-stone-500 hidden md:inline font-sans">• Live rules & thresholds</span>
            </div>

            {onOpenMonthlyReport && (
              <button
                onClick={onOpenMonthlyReport}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-medium text-[#C5A880] hover:text-[#EAE4DC] transition-colors shadow-sm self-start sm:self-auto active:scale-[0.98]"
                title="View multi-month cap utilization report and compare capped months"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Monthly Cap Report & Compare</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.capsProgress.map((cap) => (
              <div
                key={cap.capGroupId}
                className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-medium text-stone-100 text-sm">{cap.name}</h4>
                    <p className="text-[11px] text-stone-400 font-sans">
                      Monthly Bonus Cap: {cap.maxBonusPoints ? `${cap.maxBonusPoints.toLocaleString()} ${card.pointName}` : 'No cap'}
                    </p>
                  </div>
                  {cap.percentUsed >= 100 ? (
                    <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-[#251310] text-[#B85D43] border border-[#5E2218]/50">
                      Cap Reached
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                      {cap.percentUsed}% Used
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-sans">
                    <span className="text-stone-400">
                      Points Used: <strong className="text-stone-200 font-mono">{formatPoints(cap.usedBonusPoints)}</strong>
                      {cap.maxBonusPoints ? ` / ${formatPoints(cap.maxBonusPoints)}` : ''}
                    </span>
                    <span className="font-mono text-stone-300">
                      {cap.remainingBonusPoints !== null && cap.remainingBonusPoints !== undefined
                        ? `Remaining: ${formatPoints(cap.remainingBonusPoints)}`
                        : ''}
                    </span>
                  </div>
                  <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cap.percentUsed >= 90
                          ? 'bg-[#B85D43]'
                          : cap.percentUsed >= 70
                          ? 'bg-[#C28B45]'
                          : 'bg-[#C5A880]'
                      }`}
                      style={{ width: `${Math.min(100, cap.percentUsed)}%` }}
                    />
                  </div>
                </div>

                {/* Equivalent Spend Capacity */}
                {cap.equivalentMaxSpend && (
                  <div className="flex items-center justify-between text-[11px] text-stone-400 bg-[#0C0A09] p-2.5 rounded-xl border border-stone-800 font-mono">
                    <span>
                      Spend: <strong className="text-stone-200">{formatCurrency(cap.equivalentUsedSpend)}</strong> / {formatCurrency(cap.equivalentMaxSpend)}
                    </span>
                    <span className="text-[#769F86] font-medium">
                      Spend Remaining: {formatCurrency(cap.equivalentRemainingSpend ?? 0)}
                    </span>
                  </div>
                )}

                {/* Daily Cap Inspector if cap group has daily limit */}
                {cap.maxDailyBonusPoints && (
                  <div className="pt-2 border-t border-stone-800/80">
                    <DailyCapInspector
                      capProgress={cap}
                      selectedDay={selectedDay}
                      onSelectDay={onSelectDay}
                      pointName={card.pointName}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones & Loyalty Benefits (Monthly, Quarterly, Annual) */}
      <MilestoneCardSection
        milestones={summary.milestonesProgress}
        loungeSummary={summary.loungeSummary}
        pointName={card.pointName}
        onOpenMonthlyReport={onOpenMonthlyReport}
      />
    </div>
  );
};
