'use client';

import React, { useState } from 'react';
import { CardTemplate, Transaction, DateTrackingBasis, MonthCapReportItem } from '../types/card';
import { generateMonthlyComparisonReport } from '../lib/rewardsEngine';
import { formatCurrency, formatPoints } from '../lib/utils';
import {
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BarChart3
} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardTemplate;
  transactions: Transaction[];
  trackingBasis: DateTrackingBasis;
  onSelectPeriod: (year: number, month: number) => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  card,
  transactions,
  trackingBasis,
  onSelectPeriod,
}) => {
  const [monthsCount, setMonthsCount] = useState<number>(6);

  if (!isOpen) return null;

  const reportItems: MonthCapReportItem[] = generateMonthlyComparisonReport(
    card,
    transactions,
    trackingBasis,
    monthsCount
  );

  // Overall totals across the comparison window
  const totalPointsAllMonths = reportItems.reduce((acc, m) => acc + m.totalPoints, 0);
  const totalSpendAllMonths = reportItems.reduce((acc, m) => acc + m.netSpend, 0);
  const totalValueAllMonths = reportItems.reduce((acc, m) => acc + m.totalRewardValueInInr, 0);
  const breachedMonthsCount = reportItems.filter((m) => m.hasCapBreached).length;
  const nearCapMonthsCount = reportItems.filter((m) => m.hasNearCap && !m.hasCapBreached).length;

  // Maximum points in any month for scaling visual comparison bars
  const maxMonthlyPoints = Math.max(...reportItems.map((m) => m.totalPoints), 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly Cap & Utilization Report</h3>
              <p className="text-xs text-zinc-400">
                Compare multi-month accruals, detect capped months, and analyze spend patterns for {card.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Window selector */}
            <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setMonthsCount(3)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  monthsCount === 3 ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3 Mo
              </button>
              <button
                onClick={() => setMonthsCount(6)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  monthsCount === 6 ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-white'
                }`}
              >
                6 Mo
              </button>
              <button
                onClick={() => setMonthsCount(12)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  monthsCount === 12 ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-400 hover:text-white'
                }`}
              >
                12 Mo
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-zinc-800/80 flex-shrink-0">
          <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">Total Accrued</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {formatPoints(totalPointsAllMonths)} <span className="text-xs font-normal text-zinc-400">{card.pointName}</span>
            </span>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">Total Net Spend</span>
            <span className="text-lg font-bold text-white font-mono">
              {formatCurrency(totalSpendAllMonths)}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block">Reward Value</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              ≈ {formatCurrency(totalValueAllMonths)}
            </span>
          </div>

          <div className="p-3 bg-zinc-950/70 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block">Cap Status Overview</span>
              <div className="flex items-center space-x-2 mt-0.5">
                {breachedMonthsCount > 0 ? (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    {breachedMonthsCount} Cap Hit
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    All Within Cap
                  </span>
                )}
                {nearCapMonthsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {nearCapMonthsCount} Near Cap
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Month Comparison Cards */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span className="font-semibold text-zinc-300">Month-by-Month Cap Utilization Matrix</span>
            <span>Basis: {trackingBasis === 'posting_date' ? 'Posting Date' : 'Transaction Date'}</span>
          </div>

          <div className="space-y-3">
            {reportItems.map((item) => {
              const barWidthPercent = Math.min(100, Math.round((item.totalPoints / maxMonthlyPoints) * 100));

              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.hasCapBreached
                      ? 'bg-red-950/15 border-red-800/40'
                      : item.hasNearCap
                      ? 'bg-amber-950/15 border-amber-800/40'
                      : 'bg-zinc-950/70 border-zinc-800'
                  }`}
                >
                  {/* Month Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-300 font-bold text-xs">
                        {item.periodLabel.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm">{item.periodLabel}</h4>
                          {item.hasCapBreached && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Cap Reached</span>
                            </span>
                          )}
                          {item.hasNearCap && !item.hasCapBreached && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Near Cap (≥80%)
                            </span>
                          )}
                          {!item.hasCapBreached && !item.hasNearCap && item.netSpend > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Capacity Left</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center space-x-2">
                          <span>Spend: {formatCurrency(item.netSpend)}</span>
                          <span>•</span>
                          <span>Reward: ≈ {formatCurrency(item.totalRewardValueInInr)}</span>
                          {item.peakDailyPoints > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/90">
                                Peak Day: {item.peakDailyPoints.toLocaleString()} {item.pointName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-amber-400 font-mono">
                          {formatPoints(item.totalPoints)} {item.pointName}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Base: {formatPoints(item.totalBasePoints)} | Bonus: {formatPoints(item.totalBonusPoints)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectPeriod(item.year, item.month);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                        title="Jump to this month in dashboard"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Relative Volume Bar */}
                  <div className="py-2.5">
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.hasCapBreached
                            ? 'bg-red-500'
                            : item.hasNearCap
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        }`}
                        style={{ width: `${barWidthPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Cap Groups Breakdown Grid */}
                  {item.capsSummary.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-xs">
                      {item.capsSummary.map((cap) => (
                        <div
                          key={cap.capGroupId}
                          className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-zinc-300 truncate max-w-[140px]">
                              {cap.capName}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                cap.status === 'reached'
                                  ? 'text-red-300 bg-red-500/20'
                                  : cap.status === 'near_cap'
                                  ? 'text-amber-300 bg-amber-500/20'
                                  : 'text-zinc-400 bg-zinc-800'
                              }`}
                            >
                              {cap.percentUsed}%
                            </span>
                          </div>

                          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                cap.status === 'reached'
                                  ? 'bg-red-400'
                                  : cap.status === 'near_cap'
                                  ? 'bg-amber-400'
                                  : 'bg-blue-400'
                              }`}
                              style={{ width: `${Math.min(100, cap.percentUsed)}%` }}
                            />
                          </div>

                          <div className="text-[10px] text-zinc-500 flex justify-between font-mono">
                            <span>{formatPoints(cap.usedBonusPoints)} RP</span>
                            <span>{cap.maxBonusPoints ? `${formatPoints(cap.maxBonusPoints)} cap` : 'No cap'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800 flex-shrink-0 text-xs text-zinc-400">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cap reports highlight exhausted limits to help you redirect spends to other cards.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
