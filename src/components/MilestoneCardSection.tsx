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
        <div className="flex items-center space-x-2.5">
          <Award className="w-4 h-4 text-[#C5A880]" />
          <h3 className="font-serif font-medium text-sm text-stone-100">Milestones & Loyalty Benefits</h3>
          <span className="text-xs text-stone-500 hidden md:inline font-sans">
            • Monthly, Quarterly & Annual spend thresholds
          </span>
        </div>

        {onOpenMonthlyReport && (
          <button
            onClick={onOpenMonthlyReport}
            className="text-xs text-[#C5A880] hover:text-[#EAE4DC] font-medium flex items-center space-x-1.5 transition-colors active:scale-[0.98]"
          >
            <span>Multi-Month Cap & Milestone Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Lounge Highlight Banner if card has lounge milestone */}
      {loungeSummary && (
        <div className="p-4 rounded-2xl bg-[#141210] border border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-[#C5A880] border border-stone-800 flex items-center justify-center font-bold">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-serif font-medium text-stone-100 text-sm">Complimentary Airport Lounge Access</h4>
                {loungeSummary.status === 'unlocked' ? (
                  <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#132219] text-[#769F86] border border-emerald-900/40">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#241A10] text-[#C28B45] border border-[#593E1B]/50">
                    Spend Required
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5 font-sans">
                {loungeSummary.status === 'unlocked'
                  ? `You have unlocked ${loungeSummary.totalUnlockedVisits} complimentary lounge visits for this quarter.`
                  : `Spend ${formatCurrency(loungeSummary.remainingSpendToUnlock)} more this quarter to unlock 2 lounge passes.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block font-sans">Quarterly Progress</span>
              <span className="text-xs font-mono font-medium text-stone-200">
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
                  ? 'bg-[#151C17] border-emerald-900/40 shadow-sm'
                  : 'bg-[#141210] border-stone-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      m.isCompleted
                        ? 'bg-[#1C2C20] text-[#769F86] border border-emerald-800/40'
                        : 'bg-stone-900 text-[#C5A880] border border-stone-800'
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
                      <h4 className="font-serif font-medium text-stone-100 text-sm">{m.title}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400">
                        {m.periodLabel || m.period}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5 font-sans">{m.description}</p>
                  </div>
                </div>

                {m.isCompleted ? (
                  <span className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#132219] text-[#769F86] border border-emerald-900/40 whitespace-nowrap font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Achieved</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-stone-900 text-[#C5A880] border border-stone-800 whitespace-nowrap">
                    {m.benefitValue || (m.rewardPoints > 0 ? `+${formatPoints(m.rewardPoints)} ${pointName}` : 'Benefit')}
                  </span>
                )}
              </div>

              {/* Progress Bar & Values */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-sans">
                  <span className="text-stone-400">
                    {m.type === 'transaction_count' ? (
                      <>
                        Swipes: <strong className="text-stone-200 font-mono">{m.currentCount || 0} / {m.targetCount}</strong>
                      </>
                    ) : (
                      <>
                        Spend: <strong className="text-stone-200 font-mono">{formatCurrency(m.currentSpend || 0)}</strong> / <span className="font-mono">{formatCurrency(m.targetSpend || 0)}</span>
                      </>
                    )}
                  </span>
                  <span className={`font-mono text-[11px] ${m.isCompleted ? 'text-[#769F86]' : 'text-[#C5A880]'}`}>
                    {m.isCompleted
                      ? 'Goal Completed'
                      : m.type === 'transaction_count'
                      ? `${Math.max(0, (m.targetCount || 0) - (m.currentCount || 0))} more swipes needed`
                      : `Remaining: ${formatCurrency(m.remainingSpend || 0)}`}
                  </span>
                </div>
                <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.isCompleted
                        ? 'bg-[#769F86]'
                        : m.percentComplete >= 80
                        ? 'bg-[#C28B45]'
                        : 'bg-[#C5A880]'
                    }`}
                    style={{ width: `${m.percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Qualifying Transactions Chips if available */}
              {m.qualifyingTransactions && m.qualifyingTransactions.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <span className="text-[11px] text-stone-400 block font-sans">Qualifying Transactions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.qualifyingTransactions.map((q, idx) => (
                      <span
                        key={q.id || idx}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-[#0C0A09] border border-stone-800 text-stone-300 font-mono"
                      >
                        {formatCurrency(q.amount)} <span className="text-stone-400">({q.merchant})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefit Footer Tag */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800/80">
                <span className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Period: {m.periodLabel || m.period}</span>
                </span>
                <span className="font-mono text-stone-300">{m.benefitValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
