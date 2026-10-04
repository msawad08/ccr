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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-[#141210] border border-stone-800/90 rounded-2xl shadow-sm">
      {/* Month Stepper */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors active:scale-[0.98]"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 px-3.5 py-1.5 bg-[#0C0A09] rounded-xl border border-stone-800">
          <Calendar className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="font-serif font-medium text-stone-100 text-sm tracking-wide">
            {MONTH_NAMES[month - 1]} {year}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors active:scale-[0.98]"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isCurrentMonth() && (
          <button
            onClick={handleCurrentMonth}
            className="text-xs px-2.5 py-1 text-[#C5A880] hover:text-[#EAE4DC] bg-stone-900 hover:bg-stone-800 rounded-xl transition-all font-mono border border-stone-800 active:scale-[0.98]"
          >
            Today
          </button>
        )}
      </div>

      {/* Date Basis Toggle */}
      <div className="flex items-center space-x-2">
        <div className="text-[11px] text-stone-400 flex items-center space-x-1.5 font-sans">
          <span>Tracking Basis</span>
          <span
            title="SmartBuy caps and Amex milestones track strictly by settled posting date. Transactions swiped on the 31st settling on the 1st roll into next month."
            className="cursor-help text-stone-400 hover:text-stone-300"
          >
            <Info className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex bg-[#0C0A09] p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => onChangeTrackingBasis('posting_date')}
            className={`px-3 py-1 rounded-lg font-medium transition-all text-[11px] font-mono ${
              trackingBasis === 'posting_date'
                ? 'bg-[#24201D] text-[#EAE4DC] border border-stone-700/80 shadow-sm'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            Posting Date (Default)
          </button>
          <button
            onClick={() => onChangeTrackingBasis('transaction_date')}
            className={`px-3 py-1 rounded-lg font-medium transition-all text-[11px] font-mono ${
              trackingBasis === 'transaction_date'
                ? 'bg-[#24201D] text-[#EAE4DC] border border-stone-700/80 shadow-sm'
                : 'text-stone-400 hover:text-stone-300'
            }`}
          >
            Transaction Date
          </button>
        </div>
      </div>
    </div>
  );
};
