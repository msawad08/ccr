'use client';

import React from 'react';
import { CapProgress } from '../types/card';
import { formatCurrency, formatPoints, formatDateDisplay } from '../lib/utils';
import { Calendar, AlertTriangle, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface DailyCapInspectorProps {
  capProgress: CapProgress;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  pointName?: string;
}

export const DailyCapInspector: React.FC<DailyCapInspectorProps> = ({
  capProgress,
  selectedDay,
  onSelectDay,
  pointName = 'RP',
}) => {
  const dailyCap = capProgress.maxDailyBonusPoints || 2000;
  const currentDayPoints = capProgress.dailyUsageMap[selectedDay] || 0;
  const percentOfDaily = Math.min(100, Math.round((currentDayPoints / dailyCap) * 100));
  const isDailyExceeded = currentDayPoints >= dailyCap;
  const isNearDaily = currentDayPoints >= dailyCap * 0.8 && !isDailyExceeded;
  const remainingDailyPoints = Math.max(0, dailyCap - currentDayPoints);

  // Approximate remaining spend at 5X (0.10 RP per ₹)
  const remainingSpend = Math.round(remainingDailyPoints / 0.1);

  // Available active dates
  const activeDates = Object.keys(capProgress.dailyUsageMap).sort();

  return (
    <div className="p-4 rounded-2xl bg-[#0C0A09] border border-stone-800 space-y-3.5">
      {/* Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2.5 border-b border-stone-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-[#C5A880]">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-serif font-medium text-xs text-stone-200">Daily Cap Timeline & Inspector</span>
            <span className="text-[10px] font-mono text-stone-400 block">
              Limit: {dailyCap.toLocaleString()} bonus {pointName}/day
            </span>
          </div>
        </div>

        {/* Day Picker Controls */}
        <div className="flex items-center space-x-2">
          <label className="text-[11px] text-stone-400 flex items-center space-x-1 font-sans">
            <Calendar className="w-3 h-3 text-stone-400" />
            <span>Day:</span>
          </label>
          <select
            value={selectedDay}
            onChange={(e) => onSelectDay(e.target.value)}
            className="bg-[#141210] border border-stone-700/80 rounded-lg px-2.5 py-1 text-xs text-stone-200 font-mono focus:outline-none focus:border-[#C5A880] cursor-pointer"
          >
            {activeDates.length === 0 ? (
              <option value={selectedDay}>{formatDateDisplay(selectedDay)}</option>
            ) : (
              activeDates.map((d) => (
                <option key={d} value={d}>
                  {formatDateDisplay(d)} ({(capProgress.dailyUsageMap[d] || 0).toLocaleString()} {pointName})
                </option>
              ))
            )}
            {/* If today is not in activeDates, allow picking today */}
            {selectedDay && !activeDates.includes(selectedDay) && (
              <option value={selectedDay}>{formatDateDisplay(selectedDay)} (0 {pointName})</option>
            )}
          </select>

          {capProgress.peakDay && capProgress.peakDay.date !== selectedDay && (
            <button
              onClick={() => onSelectDay(capProgress.peakDay!.date)}
              className="text-[10px] px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-[#C5A880] rounded-lg border border-stone-800 transition-colors font-mono font-medium active:scale-[0.98]"
              title={`Jump to highest bonus day (${capProgress.peakDay.bonusPoints.toLocaleString()} RP)`}
            >
              Peak Day
            </button>
          )}
        </div>
      </div>

      {/* Selected Day Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-[#141210] rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-sans">Day's Bonus Used</span>
          <span className="text-stone-100 font-mono font-bold text-sm">
            {formatPoints(currentDayPoints)} <span className="text-[10px] font-normal text-stone-400">/ {formatPoints(dailyCap)}</span>
          </span>
        </div>

        <div className="p-2.5 bg-[#141210] rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-sans">Daily Headroom</span>
          <span className="text-[#769F86] font-mono font-bold text-sm">
            {formatPoints(remainingDailyPoints)} {pointName}
          </span>
        </div>

        <div className="p-2.5 bg-[#141210] rounded-xl border border-stone-800">
          <span className="text-[10px] text-stone-400 block font-sans">Remaining Spend Cap</span>
          <span className="text-[#C5A880] font-mono font-bold text-sm">
            ≈ {formatCurrency(remainingSpend)}
          </span>
        </div>

        <div className="p-2.5 bg-[#141210] rounded-xl border border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-stone-400 block font-sans">Cap Status</span>
            <span
              className={`font-semibold text-xs font-mono ${
                isDailyExceeded
                  ? 'text-[#B85D43]'
                  : isNearDaily
                  ? 'text-[#C28B45]'
                  : 'text-[#769F86]'
              }`}
            >
              {isDailyExceeded ? 'Cap Hit' : isNearDaily ? 'Near Limit' : 'Available'}
            </span>
          </div>
          {isDailyExceeded ? (
            <AlertTriangle className="w-4 h-4 text-[#B85D43]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#769F86]" />
          )}
        </div>
      </div>

      {/* Selected Day Progress Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-stone-400 mb-1">
          <span>{formatDateDisplay(selectedDay)} utilization</span>
          <span className="font-mono">{percentOfDaily}% of daily limit</span>
        </div>
        <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDailyExceeded
                ? 'bg-[#B85D43]'
                : isNearDaily
                ? 'bg-[#C28B45]'
                : 'bg-[#C5A880]'
            }`}
            style={{ width: `${percentOfDaily}%` }}
          />
        </div>
      </div>

      {/* Daily Comparison Bar Chart (Interactive Visual Timeline) */}
      {capProgress.dailyHistory.length > 0 && (
        <div className="pt-2 border-t border-stone-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-400">
            <span className="font-serif font-medium text-stone-300">Daily Bonus Comparison</span>
            <span className="text-stone-400 text-[10px]">Select a bar to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {capProgress.dailyHistory.map((item) => {
              const isSelected = item.date === selectedDay;

              return (
                <div
                  key={item.date}
                  onClick={() => onSelectDay(item.date)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left group active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#1C1815] border-[#C5A880]/70 ring-1 ring-[#C5A880]/30 shadow-md'
                      : 'bg-[#141210] border-stone-800/80 hover:bg-[#181614] hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                    <span className="font-mono text-stone-300">
                      {formatDateDisplay(item.date).split(' ')[0]} {formatDateDisplay(item.date).split(' ')[1]}
                    </span>
                    <span className="font-mono text-[9px] text-stone-400">{item.percentOfDailyCap}%</span>
                  </div>

                  {/* Vertical mini bar preview */}
                  <div className="w-full bg-stone-900 rounded-full h-1.5 my-1.5 overflow-hidden border border-stone-800">
                    <div
                      className={`h-full rounded-full ${
                        item.isExceeded
                          ? 'bg-[#B85D43]'
                          : item.bonusPoints >= dailyCap * 0.8
                          ? 'bg-[#C28B45]'
                          : 'bg-[#C5A880]'
                      }`}
                      style={{ width: `${item.percentOfDailyCap}%` }}
                    />
                  </div>

                  <div className="text-[11px] font-mono font-bold text-stone-200 flex items-center justify-between">
                    <span>{formatPoints(item.bonusPoints)}</span>
                    <span className="text-[9px] font-normal text-stone-400">{pointName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
