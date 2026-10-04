'use client';

import React from 'react';
import {
  Plus,
  Sliders,
  CreditCard,
  Settings,
  Shield,
  BarChart3,
  MessageSquare,
  Globe,
  User,
} from 'lucide-react';
import { canManageCards, getUserRole } from '../lib/adminAuth';

interface NavbarProps {
  onOpenAddTransaction: () => void;
  onOpenCardRules: () => void;
  onOpenWallet: () => void;
  onOpenSettings: () => void;
  onOpenMonthlyReport?: () => void;
  onOpenFeedback: () => void;
  onOpenAdminPanel?: () => void;
  onOpenCommunityCatalog?: () => void;
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
  onOpenFeedback,
  onOpenAdminPanel,
  onOpenCommunityCatalog,
  isSupabaseConfigured,
  storageMode = 'local',
  userEmail,
}) => {
  const isAdminUser = canManageCards(userEmail);
  const role = getUserRole(userEmail);

  return (
    <header className="sticky top-0 z-30 border-b border-stone-800/80 bg-[#0C0A09]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand - Warm Editorial Luxury */}
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#24201D] to-[#141210] border border-stone-700/60 flex items-center justify-center shadow-sm">
            <span className="font-serif font-bold text-base text-[#C5A880]">C</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-medium text-lg text-stone-100 tracking-tight">
                CardCap
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest bg-stone-900 border border-stone-800 text-stone-400">
                Editorial
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block tracking-normal font-sans">
              Precision Accrual, Sub-Cap Guard & Milestone Engine
            </p>
          </div>
        </div>

        {/* Action Controls - Quiet Luxury */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Storage / Auth Status indicator */}
          <button
            onClick={onOpenSettings}
            className={`hidden md:flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
              storageMode === 'supabase' && userEmail
                ? 'bg-stone-900/80 border-stone-700 text-stone-200 hover:border-stone-500'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
            title="Storage & Account"
          >
            <User className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="max-w-[130px] truncate text-[11px] font-mono">
              {userEmail || (storageMode === 'supabase' ? 'Cloud Sync' : 'Local Storage')}
            </span>
          </button>

          {/* Community Catalog button */}
          {onOpenCommunityCatalog && (
            <button
              onClick={onOpenCommunityCatalog}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all hover:text-stone-100 active:scale-[0.98]"
              title="Explore Community Approved Cards"
            >
              <Globe className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Catalog</span>
            </button>
          )}

          {/* Monthly Cap Report button */}
          {onOpenMonthlyReport && (
            <button
              onClick={onOpenMonthlyReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all hover:text-stone-100 active:scale-[0.98]"
              title="Multi-Month Cap & Milestone Analysis"
            >
              <BarChart3 className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          )}

          {/* Card Rules & Devaluation Editor button */}
          <button
            onClick={onOpenCardRules}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all hover:text-stone-100 active:scale-[0.98]"
            title="Edit Caps, Multipliers & Rules"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          {/* My Cards / Wallet button */}
          <button
            onClick={onOpenWallet}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-300 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all hover:text-stone-100 active:scale-[0.98]"
            title="Manage Wallet"
          >
            <CreditCard className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Wallet</span>
          </button>

          {/* Community Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-900/40 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all active:scale-[0.98]"
            title="Send Feedback or Report Devaluation"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="hidden sm:inline">Feedback</span>
          </button>

          {/* Admin Panel Button (Visible to Admins and Super Admins) */}
          {isAdminUser && onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#EAE4DC] border border-[#C5A880]/30 transition-all active:scale-[0.98]"
              title="Open Admin & Governance Terminal"
            >
              <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline font-mono font-semibold uppercase text-[11px]">
                Admin
              </span>
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 bg-stone-900/60 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-colors"
            title="Settings & Data Transfer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Quick Add Transaction button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium text-stone-950 bg-stone-100 hover:bg-stone-200 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="font-sans font-semibold">New Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
