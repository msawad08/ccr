'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { DateTrackingBasis } from '../types/card';

interface PeriodSelectorProps {
  year: number;
  month: number;
  onChangePeriod: (year: number, month: number) => void;
  trackingBasis: DateTrackingBasis;
  onChangeTrackingBasis: (basis: DateTrackingBasis) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  year,
  month,
  onChangePeriod,
  trackingBasis,
  onChangeTrackingBasis,
}) => {
  const handlePrevMonth = () => {
    if (month === 1) {
      onChangePeriod(year - 1, 12);
    } else {
      onChangePeriod(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onChangePeriod(year + 1, 1);
    } else {
      onChangePeriod(year, month + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onChangePeriod(now.getFullYear(), now.getMonth() + 1);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() + 1 === month;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-zinc-900/70 border border-zinc-800 rounded-2xl">
      {/* Month Stepper */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 bg-zinc-950 rounded-xl border border-zinc-800">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white text-sm tracking-wide">
            {MONTH_NAMES[month - 1]} {year}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isCurrentMonth() && (
          <button
            onClick={handleCurrentMonth}
            className="text-xs px-2.5 py-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors font-medium border border-amber-500/20"
          >
            Today
          </button>
        )}
      </div>

      {/* Date Basis Toggle */}
      <div className="flex items-center space-x-2">
        <div className="text-xs text-zinc-400 flex items-center space-x-1">
          <span>Date Basis:</span>
          <span
            title="SmartBuy caps and Amex milestones track strictly by settled posting date. Transactions swiped on the 31st settling on the 1st roll into next month."
            className="cursor-help text-zinc-500 hover:text-zinc-300"
          >
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => onChangeTrackingBasis('posting_date')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              trackingBasis === 'posting_date'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Posting Date (Default)
          </button>
          <button
            onClick={() => onChangeTrackingBasis('transaction_date')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              trackingBasis === 'transaction_date'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Transaction Date
          </button>
        </div>
      </div>
    </div>
  );
};
