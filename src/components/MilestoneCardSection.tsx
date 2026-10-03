'use client';

import React from 'react';
import { MilestoneProgress, PeriodSummary } from '../types/card';
import { formatCurrency, formatPoints } from '../lib/utils';
import {
  Award,
  CheckCircle2,
  Calendar,
  Gift,
  ShieldCheck,
  Plane,
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MilestoneCardSectionProps {
  milestones: MilestoneProgress[];
  loungeSummary?: PeriodSummary['loungeSummary'];
  pointName?: string;
  onOpenMonthlyReport?: () => void;
}

export const MilestoneCardSection: React.FC<MilestoneCardSectionProps> = ({
  milestones,
  loungeSummary,
  pointName = 'RP',
  onOpenMonthlyReport,
}) => {
  if (milestones.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Milestones & Loyalty Benefits</h3>
          <span className="text-xs text-zinc-500 hidden md:inline">
            • Monthly, Quarterly & Annual spend goals
          </span>
        </div>

        {onOpenMonthlyReport && (
          <button
            onClick={onOpenMonthlyReport}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
          >
            <span>Multi-Month Cap & Milestone Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Lounge Highlight Banner if card has lounge milestone */}
      {loungeSummary && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-white text-sm">Complimentary Airport Lounge Access</h4>
                {loungeSummary.status === 'unlocked' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active & Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Quarter Spend Required
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {loungeSummary.status === 'unlocked'
                  ? `You have unlocked ${loungeSummary.totalUnlockedVisits} complimentary lounge visits for this quarter!`
                  : `Spend ${formatCurrency(loungeSummary.remainingSpendToUnlock)} more this quarter to unlock 2 lounge passes.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block">Quarterly Progress</span>
              <span className="text-xs font-mono font-bold text-white">
                {formatCurrency(loungeSummary.qualifyingSpendThisQuarter)} / {formatCurrency(loungeSummary.targetQuarterSpend)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => {
          const isLounge = m.benefitType === 'lounge_access';
          const isFeeWaiver = m.benefitType === 'fee_waiver';
          const isVoucher = m.benefitType === 'voucher';

          return (
            <div
              key={m.ruleId}
              className={`p-5 rounded-2xl border space-y-3.5 transition-all ${
                m.isCompleted
                  ? 'bg-emerald-950/20 border-emerald-800/40 shadow-md shadow-emerald-950/20'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      m.isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isFeeWaiver
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : isLounge
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : isVoucher
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {isLounge ? (
                      <Plane className="w-4 h-4" />
                    ) : isFeeWaiver ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : isVoucher ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white text-sm">{m.title}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {m.periodLabel || m.period}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{m.description}</p>
                  </div>
                </div>

                {m.isCompleted ? (
                  <span className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Achieved!</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-amber-400 border border-zinc-700 whitespace-nowrap">
                    {m.benefitValue || (m.rewardPoints > 0 ? `+${formatPoints(m.rewardPoints)} ${pointName}` : 'Benefit')}
                  </span>
                )}
              </div>

              {/* Progress Bar & Values */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400">
                    {m.type === 'transaction_count' ? (
                      <>
                        Swipes: <strong className="text-white">{m.currentCount || 0} / {m.targetCount}</strong>
                      </>
                    ) : (
                      <>
                        Spend: <strong className="text-white">{formatCurrency(m.currentSpend || 0)}</strong> / {formatCurrency(m.targetSpend || 0)}
                      </>
                    )}
                  </span>
                  <span className={m.isCompleted ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                    {m.isCompleted
                      ? 'Goal Completed'
                      : m.type === 'transaction_count'
                      ? `${Math.max(0, (m.targetCount || 0) - (m.currentCount || 0))} more swipes needed`
                      : `Remaining: ${formatCurrency(m.remainingSpend || 0)}`}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-zinc-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : m.percentComplete >= 80
                        ? 'bg-amber-500'
                        : isLounge
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    }`}
                    style={{ width: `${m.percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Qualifying Transactions Chips if available */}
              {m.qualifyingTransactions && m.qualifyingTransactions.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <span className="text-[11px] text-zinc-500 block">Qualifying Transactions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.qualifyingTransactions.map((q, idx) => (
                      <span
                        key={q.id || idx}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono"
                      >
                        {formatCurrency(q.amount)} <span className="text-zinc-500">({q.merchant})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefit Footer Tag */}
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>Period: {m.periodLabel || m.period}</span>
                </span>
                <span className="font-semibold text-zinc-300">{m.benefitValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
