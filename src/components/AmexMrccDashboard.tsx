'use client';

import React, { useEffect } from 'react';
import { CardTemplate, PeriodSummary } from '../types/card';
import { formatCurrency, formatPoints } from '../lib/utils';
import { CheckCircle2, TrendingUp, Sparkles, Fuel, Zap, AlertCircle, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AmexMrccDashboardProps {
  card: CardTemplate;
  summary: PeriodSummary;
  onOpenMonthlyReport?: () => void;
}

export const AmexMrccDashboard: React.FC<AmexMrccDashboardProps> = ({
  card,
  summary,
  onOpenMonthlyReport,
}) => {
  const milestone4x = summary.milestonesProgress.find((m) => m.type === 'transaction_count');
  const milestone20k = summary.milestonesProgress.find((m) => m.type === 'cumulative_spend');

  const allMilestonesUnlocked = (milestone4x?.isCompleted ?? false) && (milestone20k?.isCompleted ?? false);

  // Trigger celebration confetti when all milestones are achieved
  useEffect(() => {
    if (allMilestonesUnlocked) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fail
      }
    }
  }, [allMilestonesUnlocked]);

  const completedCount = (milestone4x?.isCompleted ? 1 : 0) + (milestone20k?.isCompleted ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Top Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points Accrued */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Total Points Accrued</div>
          <div className="text-2xl font-black text-cyan-400 mt-1 flex items-baseline space-x-1.5">
            <span>{formatPoints(summary.netTotalPoints)}</span>
            <span className="text-xs font-semibold text-zinc-400">{card.pointName}</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Worth ≈ {formatCurrency(summary.totalRewardValueInInr)}</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between border-t border-zinc-800/80 pt-1.5">
            <span>Base MR: {formatPoints(summary.totalBasePoints)}</span>
            <span>Milestone Bonus: +{formatPoints(summary.totalMilestonePoints)}</span>
          </div>
        </div>

        {/* Net Monthly Spends */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Net Monthly Spend</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(summary.netSpend)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            All settled transactions in {summary.periodLabel}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5 flex items-center justify-between">
            <span>Milestone Target:</span>
            <span>₹20,000 / month</span>
          </div>
        </div>

        {/* Monthly Milestones Status */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Milestones Unlocked</div>
          <div className="text-2xl font-black text-white mt-1 flex items-center space-x-2">
            <span>{completedCount} of 2</span>
            {completedCount === 2 ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Max Unlocked
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                In Progress
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Up to 2,000 bonus MR points per month
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5 flex items-center justify-between">
            <span>Potential Bonus:</span>
            <span>2,000 MR points (₹500 - ₹1,000 value)</span>
          </div>
        </div>
      </div>

      {/* Amex Special Rule Callout Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-start space-x-3 text-cyan-200 text-xs">
        <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Amex MRCC Milestone Rule:</strong> Fuel & Utility spends are excluded
          from base MR points (0 base points), but <span className="underline decoration-cyan-400 font-semibold">100% count toward both the 4x ₹1,500 count and ₹20,000 monthly spend thresholds</span>.
        </div>
      </div>

      {/* Milestone Header with Monthly Report button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Monthly Milestone Trackers</h3>
          <span className="text-xs text-zinc-500 hidden md:inline">• Dual milestone accelerator</span>
        </div>

        {onOpenMonthlyReport && (
          <button
            onClick={onOpenMonthlyReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors shadow-sm self-start sm:self-auto"
            title="View multi-month cap & milestone report"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monthly Cap Report & Compare</span>
          </button>
        )}
      </div>

      {/* Milestone Progress Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Milestone 1: 4x ₹1,500 Transactions */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                4×
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">4x ₹1,500 Transactions</h4>
                <p className="text-xs text-zinc-400">Complete 4 settled swipes of ₹1,500+ each</p>
              </div>
            </div>
            {milestone4x?.isCompleted ? (
              <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+1,000 MR Unlocked</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-lg border border-cyan-400/20">
                +1,000 Bonus MR
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">
                Progress: <strong className="text-white">{milestone4x?.currentCount || 0} / 4 completed</strong>
              </span>
              <span className={milestone4x?.isCompleted ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                {milestone4x?.isCompleted
                  ? 'Goal Achieved!'
                  : `${Math.max(0, 4 - (milestone4x?.currentCount || 0))} more txn of ₹1,500+ needed`}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  milestone4x?.isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${milestone4x?.percentComplete || 0}%` }}
              />
            </div>
          </div>

          {/* Qualifying Transactions Chips */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span>Qualifying Transactions (≥ ₹1,500):</span>
              <span className="text-[11px] text-zinc-500">{milestone4x?.qualifyingTransactions?.length || 0} found</span>
            </div>

            {milestone4x?.qualifyingTransactions && milestone4x.qualifyingTransactions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {milestone4x.qualifyingTransactions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-cyan-500/30 text-xs text-zinc-200 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-white">{formatCurrency(q.amount)}</span>
                    <span className="text-zinc-400 truncate max-w-[120px]">({q.merchant})</span>
                  </div>
                ))}
                {/* Empty placeholders for remaining required transactions */}
                {Array.from({ length: Math.max(0, 4 - milestone4x.qualifyingTransactions.length) }).map(
                  (_, i) => (
                    <div
                      key={`placeholder_${i}`}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-dashed border-zinc-700 text-xs text-zinc-500"
                    >
                      <span>Txn #{milestone4x.qualifyingTransactions!.length + i + 1}: Min ₹1,500</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic bg-zinc-950/40 p-3 rounded-xl border border-zinc-800 text-center">
                No transactions of ₹1,500 or more recorded yet this month.
              </div>
            )}
          </div>
        </div>

        {/* Milestone 2: ₹20,000 Total Monthly Spend */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                ₹20k
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">₹20,000 Monthly Spend</h4>
                <p className="text-xs text-zinc-400">Total cumulative net spend across all categories</p>
              </div>
            </div>
            {milestone20k?.isCompleted ? (
              <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+1,000 MR Unlocked</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-lg border border-indigo-400/20">
                +1,000 Bonus MR
              </span>
            )}
          </div>

          {/* Spend Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">
                Spend: <strong className="text-white">{formatCurrency(milestone20k?.currentSpend || 0)}</strong> / ₹20,000
              </span>
              <span className={milestone20k?.isCompleted ? 'text-emerald-400 font-medium' : 'text-indigo-400'}>
                {milestone20k?.isCompleted
                  ? 'Goal Achieved!'
                  : `Remaining: ${formatCurrency(Math.max(0, 20000 - (milestone20k?.currentSpend || 0)))}`}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  milestone20k?.isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${milestone20k?.percentComplete || 0}%` }}
              />
            </div>
          </div>

          {/* Detailed Spend Stats */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block text-[11px]">Current Progress</span>
              <span className="text-white font-bold text-sm">{milestone20k?.percentComplete || 0}%</span>
            </div>
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
              <span className="text-zinc-500 block text-[11px]">Spend Gap</span>
              <span className="text-amber-400 font-bold text-sm">
                {formatCurrency(Math.max(0, 20000 - (milestone20k?.currentSpend || 0)))}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Crossing ₹20,000 automatically credits 1,000 bonus MR points in your statement.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
