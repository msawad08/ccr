'use client';

import React, { useState } from 'react';
import { Transaction, CardTemplate, DateTrackingBasis } from '../types/card';
import { formatCurrency, formatPoints, formatDateDisplay } from '../lib/utils';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  RotateCcw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { calculateTransactionReward } from '../lib/rewardsEngine';

interface TransactionLedgerProps {
  transactions: Transaction[];
  card: CardTemplate;
  trackingBasis: DateTrackingBasis;
  onEditTransaction: (txn: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleRefund: (txn: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  card,
  trackingBasis,
  onEditTransaction,
  onDeleteTransaction,
  onToggleRefund,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || t.ruleId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Ledger Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Transaction Ledger
          </h3>
          <p className="text-xs text-zinc-400">
            {transactions.length} transactions recorded for this billing period
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-44"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
            <Filter className="w-3 h-3 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-white">All Categories</option>
              {card.rewardRules.map((rule) => (
                <option key={rule.id} value={rule.id} className="bg-zinc-900 text-white">
                  {rule.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs rounded-xl shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-lg">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Info className="w-6 h-6" />
            </div>
            <div className="text-zinc-300 text-sm font-semibold">
              {transactions.length === 0
                ? 'No transactions found for this period'
                : 'No transactions match your search filter'}
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Transactions swipe dates and posting dates are tracked here to calculate base and bonus points.
            </p>
            {transactions.length === 0 && (
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Transaction</span>
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Merchant & Notes</th>
                <th className="py-3 px-4">Category & Multiplier</th>
                <th className="py-3 px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-right">Base {card.pointName}</th>
                <th className="py-3 px-4 text-right">Bonus {card.pointName}</th>
                <th className="py-3 px-4 text-right">Total {card.pointName}</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((txn, index) => {
                const rule = card.rewardRules.find((r) => r.id === txn.ruleId) || card.rewardRules[0];
                const reward = calculateTransactionReward(
                  txn.amount,
                  rule,
                  card,
                  transactions.slice(0, index),
                  txn.transactionDate,
                  txn.postingDate,
                  txn.isRefund,
                  trackingBasis
                );

                return (
                  <tr
                    key={txn.id}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      txn.isRefund ? 'bg-red-950/10' : ''
                    }`}
                  >
                    {/* Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-white">
                        {formatDateDisplay(txn.transactionDate)}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center space-x-1">
                        <span>Settled:</span>
                        <span className={txn.postingDate ? 'text-zinc-400 font-mono' : 'text-amber-400 italic'}>
                          {txn.postingDate ? formatDateDisplay(txn.postingDate) : 'Pending'}
                        </span>
                      </div>
                    </td>

                    {/* Merchant & Notes */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {txn.isRefund ? (
                          <span className="p-1 rounded-md bg-red-500/20 text-red-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <div>
                          <div className="font-semibold text-zinc-100 flex items-center space-x-1.5">
                            <span>{txn.merchant}</span>
                            {txn.isRefund && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                Refund / Reversal
                              </span>
                            )}
                          </div>
                          {txn.notes && (
                            <div className="text-[11px] text-zinc-500 truncate max-w-xs">
                              {txn.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category & Rule */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700/80">
                        {rule?.name || 'Standard Spend'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className={`font-mono font-bold text-sm ${txn.isRefund ? 'text-red-400' : 'text-white'}`}>
                        {txn.isRefund ? '-' : ''}{formatCurrency(Math.abs(txn.amount))}
                      </div>
                    </td>

                    {/* Base Points */}
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                      {formatPoints(reward.basePoints)}
                    </td>

                    {/* Bonus Points */}
                    <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-semibold">
                      {reward.bonusPoints > 0 ? `+${formatPoints(reward.bonusPoints)}` : formatPoints(reward.bonusPoints)}
                    </td>

                    {/* Total Points */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatPoints(reward.totalPoints)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1 text-zinc-400">
                        <button
                          onClick={() => onToggleRefund(txn)}
                          title={txn.isRefund ? 'Unmark Refund' : 'Mark as Refund / Reversal'}
                          className={`p-1.5 rounded-lg hover:text-white transition-colors ${
                            txn.isRefund ? 'text-red-400 bg-red-500/10' : 'hover:bg-zinc-800'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditTransaction(txn)}
                          title="Edit Transaction"
                          className="p-1.5 rounded-lg hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(txn.id)}
                          title="Delete Transaction"
                          className="p-1.5 rounded-lg hover:text-red-400 hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
