'use client';

import React from 'react';
import { Plus, Sliders, CreditCard, Settings, Sparkles, ShieldCheck, BarChart3 } from 'lucide-react';

interface NavbarProps {
  onOpenAddTransaction: () => void;
  onOpenCardRules: () => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenMonthlyReport?: () => void;
  isSupabaseConfigured: boolean;
  storageMode?: 'local' | 'supabase';
  userEmail?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddTransaction,
  onOpenCardRules,
  onOpenWallet,
  onOpenSettings,
  onOpenMonthlyReport,
  isSupabaseConfigured,
  storageMode = 'local',
  userEmail,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black text-xl">
            💳
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">CardCap</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                Rewards Engine
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Multi-Card Accrual, Sub-Cap Limits & Milestone Tracker
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Storage / Auth Status indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
              storageMode === 'supabase' && userEmail
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                : storageMode === 'supabase'
                ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/40'
                : 'bg-zinc-900 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Click to view storage, auth & sync settings"
          >
            {storageMode === 'supabase' ? (
              userEmail ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[120px] truncate">{userEmail}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In (Supabase)</span>
                </>
              )
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Local (Device Only)</span>
              </>
            )}
          </button>

          {/* Monthly Cap Report button */}
          {onOpenMonthlyReport && (
            <button
              onClick={onOpenMonthlyReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all hover:text-white"
              title="View Multi-Month Cap Report & Compare"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Cap Report</span>
            </button>
          )}

          {/* Card Rules & Devaluation Editor button */}
          <button
            onClick={onOpenCardRules}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all hover:text-white"
            title="Edit Caps, Multipliers & Rules (Handles Devaluation/Revaluation)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules & Templates</span>
          </button>

          {/* My Cards / Wallet button */}
          <button
            onClick={onOpenWallet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all hover:text-white"
            title="Manage Cards in Wallet"
          >
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">My Cards</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors"
            title="Settings & Data Backup"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Quick Add Transaction button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/25 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
