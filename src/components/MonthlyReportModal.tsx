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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#141210] border border-stone-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 text-[#C5A880] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-stone-100">Monthly Cap & Utilization Report</h3>
              <p className="text-xs text-stone-400 font-sans">
                Multi-month reward comparison, cap utilization analytics, and spend trends for {card.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Window selector */}
            <div className="flex items-center space-x-1 bg-[#0C0A09] border border-stone-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setMonthsCount(3)}
                className={`px-3 py-1 rounded-lg transition-colors font-mono text-[11px] ${
                  monthsCount === 3 ? 'bg-[#24201D] text-[#EAE4DC] border border-stone-700/80 shadow-sm' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                3 Mo
              </button>
              <button
                onClick={() => setMonthsCount(6)}
                className={`px-3 py-1 rounded-lg transition-colors font-mono text-[11px] ${
                  monthsCount === 6 ? 'bg-[#24201D] text-[#EAE4DC] border border-stone-700/80 shadow-sm' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                6 Mo
              </button>
              <button
                onClick={() => setMonthsCount(12)}
                className={`px-3 py-1 rounded-lg transition-colors font-mono text-[11px] ${
                  monthsCount === 12 ? 'bg-[#24201D] text-[#EAE4DC] border border-stone-700/80 shadow-sm' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                12 Mo
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 border-b border-stone-800/80 flex-shrink-0">
          <div className="p-3 bg-[#0C0A09] rounded-2xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block font-sans">Total Accrued</span>
            <span className="text-lg font-bold text-[#C5A880] font-mono">
              {formatPoints(totalPointsAllMonths)} <span className="text-xs font-normal text-stone-400">{card.pointName}</span>
            </span>
          </div>

          <div className="p-3 bg-[#0C0A09] rounded-2xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block font-sans">Total Net Spend</span>
            <span className="text-lg font-bold text-stone-100 font-mono">
              {formatCurrency(totalSpendAllMonths)}
            </span>
          </div>

          <div className="p-3 bg-[#0C0A09] rounded-2xl border border-stone-800">
            <span className="text-[11px] text-stone-400 block font-sans">Reward Value</span>
            <span className="text-lg font-bold text-[#769F86] font-mono">
              ≈ {formatCurrency(totalValueAllMonths)}
            </span>
          </div>

          <div className="p-3 bg-[#0C0A09] rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400 block font-sans">Cap Status Overview</span>
              <div className="flex items-center space-x-1.5 mt-1 font-mono">
                {breachedMonthsCount > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#251310] text-[#B85D43] border border-[#5E2218]/50">
                    {breachedMonthsCount} Cap Hit
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#132219] text-[#769F86] border border-emerald-900/40">
                    Within Caps
                  </span>
                )}
                {nearCapMonthsCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#241A10] text-[#C28B45] border border-[#593E1B]/50">
                    {nearCapMonthsCount} Near Cap
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Month Comparison Cards */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="text-xs text-stone-400 flex items-center justify-between font-sans">
            <span className="font-serif font-medium text-stone-200">Month-by-Month Cap Utilization Matrix</span>
            <span className="font-mono text-[11px]">Basis: {trackingBasis === 'posting_date' ? 'Posting Date' : 'Transaction Date'}</span>
          </div>

          <div className="space-y-3">
            {reportItems.map((item) => {
              const barWidthPercent = Math.min(100, Math.round((item.totalPoints / maxMonthlyPoints) * 100));

              return (
                <div
                  key={`${item.year}-${item.month}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.hasCapBreached
                      ? 'bg-[#251310]/20 border-[#5E2218]/50'
                      : item.hasNearCap
                      ? 'bg-[#241A10]/20 border-[#593E1B]/50'
                      : 'bg-[#0C0A09] border-stone-800'
                  }`}
                >
                  {/* Month Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-stone-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 font-mono text-xs">
                        {item.periodLabel.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-serif font-medium text-stone-100 text-sm">{item.periodLabel}</h4>
                          {item.hasCapBreached && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#251310] text-[#B85D43] border border-[#5E2218]/50 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Cap Reached</span>
                            </span>
                          )}
                          {item.hasNearCap && !item.hasCapBreached && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#241A10] text-[#C28B45] border border-[#593E1B]/50">
                              Near Cap (≥80%)
                            </span>
                          )}
                          {!item.hasCapBreached && !item.hasNearCap && item.netSpend > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#132219] text-[#769F86] border border-emerald-900/40 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Capacity Available</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5 flex items-center space-x-2 font-mono">
                          <span>Spend: {formatCurrency(item.netSpend)}</span>
                          <span>•</span>
                          <span>Reward: ≈ {formatCurrency(item.totalRewardValueInInr)}</span>
                          {item.peakDailyPoints > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-[#C5A880]">
                                Peak Day: {item.peakDailyPoints.toLocaleString()} {item.pointName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#C5A880] font-mono">
                          {formatPoints(item.totalPoints)} {item.pointName}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Base: {formatPoints(item.totalBasePoints)} | Bonus: {formatPoints(item.totalBonusPoints)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectPeriod(item.year, item.month);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-[#C5A880] text-xs font-medium flex items-center space-x-1 border border-stone-800 transition-colors active:scale-[0.98]"
                        title="Jump to this month in dashboard"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Relative Volume Bar */}
                  <div className="py-2.5">
                    <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.hasCapBreached
                            ? 'bg-[#B85D43]'
                            : item.hasNearCap
                            ? 'bg-[#C28B45]'
                            : 'bg-[#C5A880]'
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
                          className="p-2.5 rounded-xl bg-[#141210] border border-stone-800 space-y-1 font-mono"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-sans font-medium text-stone-200 truncate max-w-[140px]">
                              {cap.capName}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                                cap.status === 'reached'
                                  ? 'text-[#B85D43] bg-[#251310]'
                                  : cap.status === 'near_cap'
                                  ? 'text-[#C28B45] bg-[#241A10]'
                                  : 'text-stone-400 bg-stone-900'
                              }`}
                            >
                              {cap.percentUsed}%
                            </span>
                          </div>

                          <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden border border-stone-800">
                            <div
                              className={`h-full rounded-full ${
                                cap.status === 'reached'
                                  ? 'bg-[#B85D43]'
                                  : cap.status === 'near_cap'
                                  ? 'bg-[#C28B45]'
                                  : 'bg-[#C5A880]'
                              }`}
                              style={{ width: `${Math.min(100, cap.percentUsed)}%` }}
                            />
                          </div>

                          <div className="text-[10px] text-stone-400 flex justify-between">
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
        <div className="flex items-center justify-between pt-3.5 border-t border-stone-800/80 flex-shrink-0 text-xs text-stone-400 font-sans">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Cap reports highlight exhausted limits to help you redirect spends to alternative cards.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-stone-200 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-all active:scale-[0.98]"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
