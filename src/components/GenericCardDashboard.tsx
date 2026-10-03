'use client';

import React from 'react';
import { CardTemplate, PeriodSummary } from '../types/card';
import { formatCurrency, formatPoints } from '../lib/utils';
import { Sparkles, TrendingUp, ShieldCheck, CheckCircle2, BarChart3 } from 'lucide-react';
import { DailyCapInspector } from './DailyCapInspector';

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
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Total Points Accrued</div>
          <div className="text-2xl font-black text-amber-400 mt-1 flex items-baseline space-x-1.5">
            <span>{formatPoints(summary.netTotalPoints)}</span>
            <span className="text-xs font-semibold text-zinc-400">{card.pointName}</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Worth ≈ {formatCurrency(summary.totalRewardValueInInr)}</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
            <span>Base: {formatPoints(summary.totalBasePoints)}</span>
            <span>Bonus: {formatPoints(summary.totalBonusPoints + summary.totalMilestonePoints)}</span>
          </div>
        </div>

        {/* Net Monthly Spends */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Net Monthly Spend</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(summary.netSpend)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Settled transactions in {summary.periodLabel}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5 flex items-center justify-between">
            <span>Base Rate:</span>
            <span>
              {card.baseRule.pointsPerStep} {card.pointName} / ₹{card.baseRule.spendStep}
            </span>
          </div>
        </div>

        {/* Statement Ceiling / Points Limit */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Cycle Points Ceiling</div>
          <div className="text-2xl font-bold text-white mt-1">
            {card.statementCeilingPoints
              ? `${formatPoints(card.statementCeilingPoints)} ${card.pointName}`
              : 'No Limit'}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {card.statementCeilingPoints
              ? `${formatPoints(Math.max(0, card.statementCeilingPoints - summary.netTotalPoints))} capacity left`
              : 'Unlimited points accrual'}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5 flex items-center justify-between">
            <span>Redemption Value:</span>
            <span>₹{card.pointValueInInr} per point</span>
          </div>
        </div>
      </div>

      {/* Dynamic Cap Groups */}
      {summary.capsProgress.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Reward Cap Capacity Meters</h3>
              <span className="text-xs text-zinc-500 hidden md:inline">• Live rules & thresholds</span>
            </div>

            {onOpenMonthlyReport && (
              <button
                onClick={onOpenMonthlyReport}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors shadow-sm self-start sm:self-auto"
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
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{cap.name}</h4>
                    <p className="text-[11px] text-zinc-400">
                      Monthly Bonus Cap: {cap.maxBonusPoints ? `${cap.maxBonusPoints.toLocaleString()} ${card.pointName}` : 'No cap'}
                    </p>
                  </div>
                  {cap.percentUsed >= 100 ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
                      Cap Reached
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      {cap.percentUsed}% Used
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">
                      Points Used: <strong className="text-white">{formatPoints(cap.usedBonusPoints)}</strong>
                      {cap.maxBonusPoints ? ` / ${formatPoints(cap.maxBonusPoints)}` : ''}
                    </span>
                    <span className="text-amber-400 font-medium">
                      {cap.remainingBonusPoints !== null && cap.remainingBonusPoints !== undefined
                        ? `Remaining: ${formatPoints(cap.remainingBonusPoints)}`
                        : ''}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cap.percentUsed >= 90
                          ? 'bg-red-500'
                          : cap.percentUsed >= 70
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${Math.min(100, cap.percentUsed)}%` }}
                    />
                  </div>
                </div>

                {/* Equivalent Spend Capacity */}
                {cap.equivalentMaxSpend && (
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                    <span>
                      Spend: <strong>{formatCurrency(cap.equivalentUsedSpend)}</strong> / {formatCurrency(cap.equivalentMaxSpend)}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      Spend Remaining: {formatCurrency(cap.equivalentRemainingSpend ?? 0)}
                    </span>
                  </div>
                )}

                {/* Daily Cap Inspector if cap group has daily limit */}
                {cap.maxDailyBonusPoints && (
                  <div className="pt-2 border-t border-zinc-800/80">
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

      {/* Dynamic Milestones */}
      {summary.milestonesProgress.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Card Milestones Progress</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {summary.milestonesProgress.map((m) => (
              <div
                key={m.ruleId}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-base">{m.title}</h4>
                    <p className="text-xs text-zinc-400">{m.description}</p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                    +{formatPoints(m.rewardPoints)} {card.pointName}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">
                      Progress: <strong className="text-white">{m.percentComplete}%</strong>
                    </span>
                    <span className={m.isCompleted ? 'text-emerald-400' : 'text-amber-400'}>
                      {m.isCompleted ? 'Achieved!' : 'In Progress'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${m.percentComplete}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
