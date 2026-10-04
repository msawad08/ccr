'use client';

import React from 'react';
import { CardTemplate, PeriodSummary } from '../types/card';
import { formatCurrency, formatPoints } from '../lib/utils';
import { Sparkles, TrendingUp, AlertTriangle, ShieldCheck, ShoppingBag, Plane, Tag, BarChart3 } from 'lucide-react';
import { DailyCapInspector } from './DailyCapInspector';
import { MilestoneCardSection } from './MilestoneCardSection';

interface RegaliaGoldDashboardProps {
  card: CardTemplate;
  summary: PeriodSummary;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  onOpenMonthlyReport?: () => void;
}

export const RegaliaGoldDashboard: React.FC<RegaliaGoldDashboardProps> = ({
  card,
  summary,
  selectedDay,
  onSelectDay,
  onOpenMonthlyReport,
}) => {
  // Extract specific cap groups
  const voucherCap = summary.capsProgress.find((c) => c.capGroupId === 'smartbuy_voucher');
  const smartbuyTotalCap = summary.capsProgress.find((c) => c.capGroupId === 'smartbuy');
  const partnerCap = summary.capsProgress.find((c) => c.capGroupId === 'partner_5x');
  const groceryCap = summary.capsProgress.find((c) => c.capGroupId === 'grocery');
  const utilityCap = summary.capsProgress.find((c) => c.capGroupId === 'utility');
  const insuranceCap = summary.capsProgress.find((c) => c.capGroupId === 'insurance');

  return (
    <div className="space-y-6">
      {/* Top Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Points Accrued */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 relative overflow-hidden shadow-sm">
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
            <span>Bonus: {formatPoints(summary.totalBonusPoints)}</span>
          </div>
        </div>

        {/* Live Voucher Spend Remaining */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">SmartBuy Vouchers Capacity</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5">
            {formatCurrency(voucherCap?.equivalentRemainingSpend ?? 30000)}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            Remaining spend headroom this month
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2">
            Cap: ₹30,000 spend (3,000 bonus RP)
          </div>
        </div>

        {/* Live 5X Partner Remaining */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">5X Partner Headroom</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5">
            {formatCurrency(partnerCap?.equivalentRemainingSpend ?? 50000)}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            Myntra, Nykaa, Reliance, M&S
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2">
            Cap: ₹50,000 spend (5,000 bonus RP)
          </div>
        </div>

        {/* Net Monthly Spends */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 shadow-sm">
          <div className="text-xs text-stone-400 font-medium font-sans">Net Monthly Spend</div>
          <div className="text-2xl font-bold font-mono text-stone-100 mt-1.5">
            {formatCurrency(summary.netSpend)}
          </div>
          <div className="text-xs text-stone-400 mt-1 font-sans">
            {summary.totalRefunds > 0 ? (
              <span className="text-[#C28B45] font-mono">
                Gross {formatCurrency(summary.totalSpend)} − {formatCurrency(summary.totalRefunds)} refunds
              </span>
            ) : (
              <span>Settled in {summary.periodLabel}</span>
            )}
          </div>
          <div className="mt-3 text-[11px] font-mono text-stone-400 border-t border-stone-800/80 pt-2 flex items-center justify-between">
            <span>Statement Ceiling:</span>
            <span>50,000 RP</span>
          </div>
        </div>
      </div>

      {/* Statement Ceiling Alert if reached or close */}
      {summary.statementCeilingReached && (
        <div className="p-3.5 rounded-xl bg-[#251310] border border-[#5E2218]/50 flex items-center space-x-3 text-[#E07A5F] text-xs">
          <AlertTriangle className="w-4 h-4 text-[#B85D43] flex-shrink-0" />
          <span>
            <strong>Statement Ceiling Reached:</strong> You have hit the 50,000 RP cap for this billing cycle.
            Additional spends in this cycle will not accrue further reward points.
          </span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
        <div className="flex items-center space-x-2.5">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <h3 className="font-serif font-medium text-sm text-stone-100">Reward Cap Capacity Meters</h3>
          <span className="text-xs text-stone-500 hidden md:inline font-sans">• Monthly & Daily limits</span>
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

      {/* Cap Capacity Meters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. SmartBuy Instant Vouchers (5X) */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-stone-100 text-sm">SmartBuy Instant Vouchers (5X)</h4>
                <p className="text-[11px] text-stone-400 font-sans">GyFTR & Woohoo Brand Vouchers</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
              5X (1X + 4X Bonus)
            </span>
          </div>

          {/* Spend Capacity Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-sans">
              <span className="text-stone-400">
                Spend Used: <strong className="text-stone-200 font-mono">{formatCurrency(voucherCap?.equivalentUsedSpend || 0)}</strong> / <span className="font-mono">{formatCurrency(voucherCap?.equivalentMaxSpend || 30000)}</span>
              </span>
              <span className="font-mono text-stone-300">
                Remaining: {formatCurrency(voucherCap?.equivalentRemainingSpend || 30000)}
              </span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (voucherCap?.percentUsed || 0) >= 90
                    ? 'bg-[#B85D43]'
                    : (voucherCap?.percentUsed || 0) >= 70
                    ? 'bg-[#C28B45]'
                    : 'bg-[#C5A880]'
                }`}
                style={{ width: `${voucherCap?.percentUsed || 0}%` }}
              />
            </div>
          </div>

          {/* Points Capacity Breakdown */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 bg-[#0C0A09] p-2.5 rounded-xl border border-stone-800 font-mono">
            <span>Bonus RP: <strong className="text-stone-200">{formatPoints(voucherCap?.usedBonusPoints || 0)}</strong> / 3,000 RP</span>
            <span>Left: <strong className="text-[#769F86]">{formatPoints(voucherCap?.remainingBonusPoints || 3000)} RP</strong></span>
            <span>Sub-Cap: 3,000/mo</span>
          </div>
        </div>

        {/* 2. Total SmartBuy Allowance */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880]">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-stone-100 text-sm">Total SmartBuy Allowance</h4>
                <p className="text-[11px] text-stone-400 font-sans">Shared limit: Vouchers, Flights, Hotels, Trains</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
              Overall 4,000 Cap
            </span>
          </div>

          {/* Overall SmartBuy Points Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-sans">
              <span className="text-stone-400">
                Bonus Used: <strong className="text-stone-200 font-mono">{formatPoints(smartbuyTotalCap?.usedBonusPoints || 0)}</strong> / <span className="font-mono">4,000 RP</span>
              </span>
              <span className="font-mono text-stone-300">
                Headroom: {formatPoints(smartbuyTotalCap?.remainingBonusPoints || 4000)} RP
              </span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (smartbuyTotalCap?.percentUsed || 0) >= 90
                    ? 'bg-[#B85D43]'
                    : (smartbuyTotalCap?.percentUsed || 0) >= 70
                    ? 'bg-[#C28B45]'
                    : 'bg-[#C5A880]'
                }`}
                style={{ width: `${smartbuyTotalCap?.percentUsed || 0}%` }}
              />
            </div>
          </div>

          {/* Interactive Daily Cap Inspector & Timeline Bar Chart */}
          {smartbuyTotalCap && (
            <div className="pt-1">
              <DailyCapInspector
                capProgress={smartbuyTotalCap}
                selectedDay={selectedDay}
                onSelectDay={onSelectDay}
                pointName={card.pointName}
              />
            </div>
          )}
        </div>

        {/* 3. 5X Partner Brands */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880]">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-stone-100 text-sm">5X Partner Brands</h4>
                <p className="text-[11px] text-stone-400 font-sans">Myntra, Nykaa, Reliance Digital, Marks & Spencer</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
              Dedicated 5,000 Cap
            </span>
          </div>

          {/* Spend Capacity Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-sans">
              <span className="text-stone-400">
                Spend Used: <strong className="text-stone-200 font-mono">{formatCurrency(partnerCap?.equivalentUsedSpend || 0)}</strong> / <span className="font-mono">{formatCurrency(partnerCap?.equivalentMaxSpend || 50000)}</span>
              </span>
              <span className="font-mono text-stone-300">
                Remaining: {formatCurrency(partnerCap?.equivalentRemainingSpend || 50000)}
              </span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2.5 overflow-hidden border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (partnerCap?.percentUsed || 0) >= 90
                    ? 'bg-[#B85D43]'
                    : (partnerCap?.percentUsed || 0) >= 70
                    ? 'bg-[#C28B45]'
                    : 'bg-[#C5A880]'
                }`}
                style={{ width: `${partnerCap?.percentUsed || 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 bg-[#0C0A09] p-2.5 rounded-xl border border-stone-800 font-mono">
            <span>Bonus RP: <strong className="text-stone-200">{formatPoints(partnerCap?.usedBonusPoints || 0)}</strong> / 5,000 RP</span>
            <span>Remaining: <strong className="text-[#769F86]">{formatPoints(partnerCap?.remainingBonusPoints || 5000)} RP</strong></span>
            <span>Independent of SmartBuy</span>
          </div>
        </div>

        {/* 4. Essential Category Hard Caps */}
        <div className="p-5 rounded-2xl bg-[#141210] border border-stone-800 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-stone-100 text-sm">Essential Category Hard Caps</h4>
                <p className="text-[11px] text-stone-400 font-sans">Monthly point ceilings on essential retail</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-stone-300 bg-stone-900 px-2 py-0.5 rounded-lg border border-stone-800">
              1X Capped
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Grocery */}
            <div>
              <div className="flex justify-between text-[11px] text-stone-400 mb-1 font-sans">
                <span>Grocery: <span className="font-mono text-stone-300">{formatPoints(groceryCap?.usedBonusPoints || 0)} / 2,000 RP</span></span>
                <span className="font-mono">{groceryCap?.percentUsed || 0}%</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-stone-400 rounded-full"
                  style={{ width: `${groceryCap?.percentUsed || 0}%` }}
                />
              </div>
            </div>

            {/* Utilities */}
            <div>
              <div className="flex justify-between text-[11px] text-stone-400 mb-1 font-sans">
                <span>Utilities & Telecom: <span className="font-mono text-stone-300">{formatPoints(utilityCap?.usedBonusPoints || 0)} / 2,000 RP</span></span>
                <span className="font-mono">{utilityCap?.percentUsed || 0}%</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-stone-400 rounded-full"
                  style={{ width: `${utilityCap?.percentUsed || 0}%` }}
                />
              </div>
            </div>

            {/* Insurance */}
            <div>
              <div className="flex justify-between text-[11px] text-stone-400 mb-1 font-sans">
                <span>Insurance: <span className="font-mono text-stone-300">{formatPoints(insuranceCap?.usedBonusPoints || 0)} / 2,000 RP</span></span>
                <span className="font-mono">{insuranceCap?.percentUsed || 0}%</span>
              </div>
              <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden border border-stone-800">
                <div
                  className="h-full bg-stone-400 rounded-full"
                  style={{ width: `${insuranceCap?.percentUsed || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly, Annual & Loyalty Milestones (Vouchers, Lounge Access, Fee Waivers) */}
      <MilestoneCardSection
        milestones={summary.milestonesProgress}
        loungeSummary={summary.loungeSummary}
        pointName={card.pointName}
        onOpenMonthlyReport={onOpenMonthlyReport}
      />
    </div>
  );
};
