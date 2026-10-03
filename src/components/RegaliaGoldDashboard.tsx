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
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 relative overflow-hidden">
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
            <span>Bonus: {formatPoints(summary.totalBonusPoints)}</span>
          </div>
        </div>

        {/* Live Voucher Spend Remaining */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">SmartBuy Vouchers Capacity</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(voucherCap?.equivalentRemainingSpend ?? 30000)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Remaining spend headroom this month
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5">
            Cap: ₹30,000 spend (3,000 bonus RP)
          </div>
        </div>

        {/* Live 5X Partner Remaining */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">5X Partner Headroom</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(partnerCap?.equivalentRemainingSpend ?? 50000)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Myntra, Nykaa, Reliance, M&S
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5">
            Cap: ₹50,000 spend (5,000 bonus RP)
          </div>
        </div>

        {/* Net Monthly Spends */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="text-xs text-zinc-400 font-medium">Net Monthly Spend</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(summary.netSpend)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {summary.totalRefunds > 0 ? (
              <span className="text-amber-400/90">
                Gross {formatCurrency(summary.totalSpend)} − {formatCurrency(summary.totalRefunds)} refunds
              </span>
            ) : (
              <span>Settled in {summary.periodLabel}</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 border-t border-zinc-800/80 pt-1.5 flex items-center justify-between">
            <span>Statement Ceiling:</span>
            <span>50,000 RP</span>
          </div>
        </div>
      </div>

      {/* Statement Ceiling Alert if reached or close */}
      {summary.statementCeilingReached && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 flex items-center space-x-3 text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Statement Ceiling Reached:</strong> You have hit the 50,000 RP cap for this billing cycle.
            Additional spends in this cycle will not accrue further reward points.
          </span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Reward Cap Capacity Meters</h3>
          <span className="text-xs text-zinc-500 hidden md:inline">• Monthly & Daily limits</span>
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

      {/* Cap Capacity Meters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. SmartBuy Instant Vouchers (5X) */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">SmartBuy Instant Vouchers (5X)</h4>
                <p className="text-[11px] text-zinc-400">GyFTR & Woohoo Brand Vouchers</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
              5X (1X + 4X Bonus)
            </span>
          </div>

          {/* Spend Capacity Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">
                Spend Used: <strong className="text-white">{formatCurrency(voucherCap?.equivalentUsedSpend || 0)}</strong> / {formatCurrency(voucherCap?.equivalentMaxSpend || 30000)}
              </span>
              <span className="font-medium text-amber-400">
                Remaining: {formatCurrency(voucherCap?.equivalentRemainingSpend || 30000)}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (voucherCap?.percentUsed || 0) >= 90
                    ? 'bg-red-500'
                    : (voucherCap?.percentUsed || 0) >= 70
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${voucherCap?.percentUsed || 0}%` }}
              />
            </div>
          </div>

          {/* Points Capacity Breakdown */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
            <span>Bonus RP: <strong>{formatPoints(voucherCap?.usedBonusPoints || 0)}</strong> / 3,000 RP</span>
            <span>Left: <strong className="text-emerald-400">{formatPoints(voucherCap?.remainingBonusPoints || 3000)} RP</strong></span>
            <span>Sub-Cap: 3,000/mo</span>
          </div>
        </div>

        {/* 2. Total SmartBuy Allowance */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Total SmartBuy Allowance</h4>
                <p className="text-[11px] text-zinc-400">Shared limit: Vouchers, Flights, Hotels, Trains</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-lg border border-blue-400/20">
              Overall 4,000 Cap
            </span>
          </div>

          {/* Overall SmartBuy Points Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">
                Bonus Used: <strong className="text-white">{formatPoints(smartbuyTotalCap?.usedBonusPoints || 0)}</strong> / 4,000 RP
              </span>
              <span className="font-medium text-blue-400">
                Headroom: {formatPoints(smartbuyTotalCap?.remainingBonusPoints || 4000)} RP
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (smartbuyTotalCap?.percentUsed || 0) >= 90
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400'
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
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">5X Partner Brands</h4>
                <p className="text-[11px] text-zinc-400">Myntra, Nykaa, Reliance Digital, Marks & Spencer</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-lg border border-purple-400/20">
              Dedicated 5,000 Cap
            </span>
          </div>

          {/* Spend Capacity Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">
                Spend Used: <strong className="text-white">{formatCurrency(partnerCap?.equivalentUsedSpend || 0)}</strong> / {formatCurrency(partnerCap?.equivalentMaxSpend || 50000)}
              </span>
              <span className="font-medium text-purple-400">
                Remaining: {formatCurrency(partnerCap?.equivalentRemainingSpend || 50000)}
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${partnerCap?.percentUsed || 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
            <span>Bonus RP: <strong>{formatPoints(partnerCap?.usedBonusPoints || 0)}</strong> / 5,000 RP</span>
            <span>Remaining: <strong className="text-emerald-400">{formatPoints(partnerCap?.remainingBonusPoints || 5000)} RP</strong></span>
            <span>Independent of SmartBuy</span>
          </div>
        </div>

        {/* 4. Essential Category Hard Caps */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Essential Category Hard Caps</h4>
                <p className="text-[11px] text-zinc-400">Monthly point ceilings on essential retail</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg border border-emerald-400/20">
              1X Capped
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Grocery */}
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Grocery: {formatPoints(groceryCap?.usedBonusPoints || 0)} / 2,000 RP</span>
                <span>{groceryCap?.percentUsed || 0}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${groceryCap?.percentUsed || 0}%` }}
                />
              </div>
            </div>

            {/* Utilities */}
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Utilities & Telecom: {formatPoints(utilityCap?.usedBonusPoints || 0)} / 2,000 RP</span>
                <span>{utilityCap?.percentUsed || 0}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${utilityCap?.percentUsed || 0}%` }}
                />
              </div>
            </div>

            {/* Insurance */}
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                <span>Insurance: {formatPoints(insuranceCap?.usedBonusPoints || 0)} / 2,000 RP (Daily: 2,000 RP)</span>
                <span>{insuranceCap?.percentUsed || 0}%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
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
