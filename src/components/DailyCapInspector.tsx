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
    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
      {/* Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white">Daily Cap Timeline & Inspector</span>
            <span className="text-[10px] text-zinc-400 block">
              Limit: {dailyCap.toLocaleString()} bonus {pointName}/day
            </span>
          </div>
        </div>

        {/* Day Picker Controls */}
        <div className="flex items-center space-x-1.5">
          <label className="text-[11px] text-zinc-400 flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-zinc-500" />
            <span>Inspect Day:</span>
          </label>
          <select
            value={selectedDay}
            onChange={(e) => onSelectDay(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-xs text-white font-medium focus:outline-none focus:border-blue-400 cursor-pointer"
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
              className="text-[10px] px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 transition-colors font-semibold"
              title={`Jump to highest bonus day (${capProgress.peakDay.bonusPoints.toLocaleString()} RP)`}
            >
              Peak Day
            </button>
          )}
        </div>
      </div>

      {/* Selected Day Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Day's Bonus Used</span>
          <span className="text-white font-mono font-bold text-sm">
            {formatPoints(currentDayPoints)} <span className="text-[10px] font-normal text-zinc-400">/ {formatPoints(dailyCap)}</span>
          </span>
        </div>

        <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Daily Headroom</span>
          <span className="text-emerald-400 font-mono font-bold text-sm">
            {formatPoints(remainingDailyPoints)} {pointName}
          </span>
        </div>

        <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
          <span className="text-[10px] text-zinc-400 block">Remaining Spend Cap</span>
          <span className="text-blue-400 font-mono font-bold text-sm">
            ≈ {formatCurrency(remainingSpend)}
          </span>
        </div>

        <div className="p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 block">Cap Status</span>
            <span
              className={`font-semibold text-xs ${
                isDailyExceeded
                  ? 'text-red-400'
                  : isNearDaily
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {isDailyExceeded ? 'Cap Hit!' : isNearDaily ? 'Near Limit' : 'Within Limit'}
            </span>
          </div>
          {isDailyExceeded ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
        </div>
      </div>

      {/* Selected Day Progress Bar */}
      <div>
        <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
          <span>{formatDateDisplay(selectedDay)} utilization</span>
          <span className="font-mono">{percentOfDaily}% of daily limit</span>
        </div>
        <div className="w-full bg-zinc-800/80 rounded-full h-2 overflow-hidden border border-zinc-700/50">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDailyExceeded
                ? 'bg-red-500'
                : isNearDaily
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${percentOfDaily}%` }}
          />
        </div>
      </div>

      {/* Daily Comparison Bar Chart (Interactive Visual Timeline) */}
      {capProgress.dailyHistory.length > 0 && (
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-300">Daily Bonus Comparison (Active Days)</span>
            <span className="text-zinc-500">Click a bar to inspect that day</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {capProgress.dailyHistory.map((item) => {
              const isSelected = item.date === selectedDay;
              const barHeightPercent = Math.min(100, Math.max(10, Math.round((item.bonusPoints / dailyCap) * 100)));
              const [, , dayNum] = item.date.split('-');

              return (
                <div
                  key={item.date}
                  onClick={() => onSelectDay(item.date)}
                  className={`p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left group ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                      : 'bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span className="font-semibold text-zinc-200">
                      {formatDateDisplay(item.date).split(' ')[0]} {formatDateDisplay(item.date).split(' ')[1]}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">{item.percentOfDailyCap}%</span>
                  </div>

                  {/* Vertical mini bar preview */}
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 my-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.isExceeded
                          ? 'bg-red-400'
                          : item.bonusPoints >= dailyCap * 0.8
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-blue-400 to-cyan-300'
                      }`}
                      style={{ width: `${item.percentOfDailyCap}%` }}
                    />
                  </div>

                  <div className="text-[11px] font-mono font-bold text-white flex items-center justify-between">
                    <span>{formatPoints(item.bonusPoints)}</span>
                    <span className="text-[9px] font-normal text-zinc-400">{pointName}</span>
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
