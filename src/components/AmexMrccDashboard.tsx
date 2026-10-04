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
            <span>Base MR: {formatPoints(summary.totalBasePoints)}</span>
            <span>Milestone Bonus: +{formatPoints(summary.totalMilestonePoints)}</span>
          </div>
        </div>

        {/* Net Monthly Spends */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">Net Monthly Spend</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5">
            {formatCurrency(summary.netSpend)}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            All settled transactions in {summary.periodLabel}
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2 flex items-center justify-between">
            <span>Milestone Target:</span>
            <span>₹20,000 / month</span>
          </div>
        </div>

        {/* Monthly Milestones Status */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">Milestones Unlocked</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5 flex items-center space-x-2">
            <span>{completedCount} of 2</span>
            {completedCount === 2 ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#132219] text-[#769F86] border border-emerald-900/40 font-mono">
                Max Unlocked
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#241A10] text-[#C28B45] border border-[#593E1B]/50 font-mono">
                In Progress
              </span>
            )}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            Up to 2,000 bonus MR points per month
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2 flex items-center justify-between">
            <span>Potential Bonus:</span>
            <span>2,000 MR points (₹500 - ₹1,000)</span>
          </div>
        </div>
      </div>

      {/* Amex Special Rule Callout Banner */}
      <div className="p-4 rounded-xl bg-[#141210] border border-stone-800 flex items-start space-x-3 text-stone-300 text-xs shadow-sm">
        <AlertCircle className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
        <div className="font-sans leading-relaxed">
          <strong className="text-stone-100">Amex MRCC Milestone Rule:</strong> Fuel & Utility spends are excluded
          from base MR points, but <span className="text-[#C5A880] underline decoration-[#C5A880]/50 font-medium">100% count toward both the 4x ₹1,500 swipe count and ₹20,000 monthly spend thresholds</span>.
        </div>
      </div>

      {/* Milestone Header with Monthly Report button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <h3 className="font-serif font-medium text-sm text-stone-100">Monthly Milestone Trackers</h3>
          <span className="text-xs text-stone-500 hidden md:inline font-sans">• Dual milestone accelerator</span>
        </div>

        {onOpenMonthlyReport && (
          <button
            onClick={onOpenMonthlyReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-medium text-[#C5A880] hover:text-[#EAE4DC] transition-colors shadow-sm self-start sm:self-auto active:scale-[0.98]"
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
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880] font-mono font-bold">
                4×
              </div>
              <div>
                <h4 className="font-serif font-medium text-stone-100 text-base">4x ₹1,500 Transactions</h4>
                <p className="text-xs text-stone-400 font-sans">Complete 4 settled swipes of ₹1,500+ each</p>
              </div>
            </div>
            {milestone4x?.isCompleted ? (
              <span className="flex items-center space-x-1 text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-[#132219] text-[#769F86] border border-emerald-900/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+1,000 MR Unlocked</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                +1,000 Bonus MR
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-sans">
              <span className="text-stone-400">
                Progress: <strong className="text-stone-200 font-mono">{milestone4x?.currentCount || 0} / 4 completed</strong>
              </span>
              <span className={`font-mono text-[11px] ${milestone4x?.isCompleted ? 'text-[#769F86]' : 'text-[#C5A880]'}`}>
                {milestone4x?.isCompleted
                  ? 'Goal Achieved'
                  : `${Math.max(0, 4 - (milestone4x?.currentCount || 0))} more txn of ₹1,500+ needed`}
              </span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  milestone4x?.isCompleted
                    ? 'bg-[#769F86]'
                    : 'bg-[#C5A880]'
                }`}
                style={{ width: `${milestone4x?.percentComplete || 0}%` }}
              />
            </div>
          </div>

          {/* Qualifying Transactions Chips */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-medium text-stone-400 flex items-center justify-between font-sans">
              <span>Qualifying Transactions (≥ ₹1,500):</span>
              <span className="text-[11px] font-mono text-stone-500">{milestone4x?.qualifyingTransactions?.length || 0} found</span>
            </div>

            {milestone4x?.qualifyingTransactions && milestone4x.qualifyingTransactions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {milestone4x.qualifyingTransactions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0C0A09] border border-stone-800 text-xs text-stone-200 shadow-sm font-mono"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                    <span className="font-semibold text-stone-100">{formatCurrency(q.amount)}</span>
                    <span className="text-stone-400 truncate max-w-[120px]">({q.merchant})</span>
                  </div>
                ))}
                {/* Empty placeholders for remaining required transactions */}
                {Array.from({ length: Math.max(0, 4 - milestone4x.qualifyingTransactions.length) }).map(
                  (_, i) => (
                    <div
                      key={`placeholder_${i}`}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-dashed border-stone-800 text-xs text-stone-500 font-mono"
                    >
                      <span>Txn #{milestone4x.qualifyingTransactions!.length + i + 1}: Min ₹1,500</span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-xs text-stone-500 italic bg-[#0C0A09] p-3 rounded-xl border border-stone-800 text-center font-sans">
                No transactions of ₹1,500 or more recorded yet this month.
              </div>
            )}
          </div>
        </div>

        {/* Milestone 2: ₹20,000 Total Monthly Spend */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880] font-mono font-bold">
                ₹20k
              </div>
              <div>
                <h4 className="font-serif font-medium text-stone-100 text-base">₹20,000 Monthly Spend</h4>
                <p className="text-xs text-stone-400 font-sans">Total cumulative net spend across all categories</p>
              </div>
            </div>
            {milestone20k?.isCompleted ? (
              <span className="flex items-center space-x-1 text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-[#132219] text-[#769F86] border border-emerald-900/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+1,000 MR Unlocked</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                +1,000 Bonus MR
              </span>
            )}
          </div>

          {/* Spend Progress Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-sans">
              <span className="text-stone-400">
                Spend: <strong className="text-stone-200 font-mono">{formatCurrency(milestone20k?.currentSpend || 0)}</strong> / <span className="font-mono">₹20,000</span>
              </span>
              <span className={`font-mono text-[11px] ${milestone20k?.isCompleted ? 'text-[#769F86]' : 'text-[#C5A880]'}`}>
                {milestone20k?.isCompleted
                  ? 'Goal Achieved'
                  : `Remaining: ${formatCurrency(Math.max(0, 20000 - (milestone20k?.currentSpend || 0)))}`}
              </span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  milestone20k?.isCompleted
                    ? 'bg-[#769F86]'
                    : 'bg-[#C5A880]'
                }`}
                style={{ width: `${milestone20k?.percentComplete || 0}%` }}
              />
            </div>
          </div>

          {/* Detailed Spend Stats */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-3 bg-[#0C0A09] rounded-xl border border-stone-800 font-mono">
              <span className="text-stone-500 block text-[11px] font-sans">Current Progress</span>
              <span className="text-stone-100 font-bold text-sm">{milestone20k?.percentComplete || 0}%</span>
            </div>
            <div className="p-3 bg-[#0C0A09] rounded-xl border border-stone-800 font-mono">
              <span className="text-stone-500 block text-[11px] font-sans">Spend Gap</span>
              <span className="text-[#C5A880] font-bold text-sm">
                {formatCurrency(Math.max(0, 20000 - (milestone20k?.currentSpend || 0)))}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 flex items-center space-x-1.5 pt-1 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Crossing ₹20,000 automatically credits 1,000 bonus MR points in your statement.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
