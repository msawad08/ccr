'use client';

import React, { useState, useEffect } from 'react';
import { Transaction, CardTemplate, UserCard } from '../types/card';
import { calculateTransactionReward } from '../lib/rewardsEngine';
import { formatCurrency, formatPoints } from '../lib/utils';
import { X, Sparkles, AlertTriangle, CheckCircle2, RotateCcw, Calendar, ArrowRight } from 'lucide-react';

interface TransactionEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txn: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  userCards: UserCard[];
  cardTemplates: CardTemplate[];
  activeUserCardId: string;
  existingTransactions: Transaction[];
  editTransaction?: Transaction | null;
}

export const TransactionEntryModal: React.FC<TransactionEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userCards,
  cardTemplates,
  activeUserCardId,
  existingTransactions,
  editTransaction,
}) => {
  const [selectedUserCardId, setSelectedUserCardId] = useState(activeUserCardId);
  const [ruleId, setRuleId] = useState<string>('');
  const [merchant, setMerchant] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [postingDate, setPostingDate] = useState('');
  const [isPendingSettlement, setIsPendingSettlement] = useState(false);
  const [isRefund, setIsRefund] = useState(false);
  const [notes, setNotes] = useState('');

  // Active card template lookup
  const userCard = userCards.find((c) => c.id === selectedUserCardId) || userCards[0];
  const cardTemplate =
    userCard?.templateOverride ||
    cardTemplates.find((t) => t.id === userCard?.cardTemplateId) ||
    cardTemplates[0];

  useEffect(() => {
    if (editTransaction) {
      setSelectedUserCardId(editTransaction.userCardId);
      setRuleId(editTransaction.ruleId);
      setMerchant(editTransaction.merchant);
      setAmountStr(String(Math.abs(editTransaction.amount)));
      setTransactionDate(editTransaction.transactionDate);
      if (editTransaction.postingDate) {
        setPostingDate(editTransaction.postingDate);
        setIsPendingSettlement(false);
      } else {
        setPostingDate(editTransaction.transactionDate);
        setIsPendingSettlement(true);
      }
      setIsRefund(editTransaction.isRefund);
      setNotes(editTransaction.notes || '');
    } else {
      // New transaction defaults
      setSelectedUserCardId(activeUserCardId);
      const today = new Date().toISOString().split('T')[0];
      setTransactionDate(today);
      setPostingDate(today);
      setIsPendingSettlement(false);
      setIsRefund(false);
      setMerchant('');
      setAmountStr('');
      setNotes('');
      if (cardTemplate && cardTemplate.rewardRules.length > 0) {
        setRuleId(cardTemplate.rewardRules[0].id);
      }
    }
  }, [editTransaction, isOpen, activeUserCardId, cardTemplate]);

  // Keep ruleId valid when changing cards
  useEffect(() => {
    if (cardTemplate && cardTemplate.rewardRules.length > 0) {
      const exists = cardTemplate.rewardRules.some((r) => r.id === ruleId);
      if (!exists) {
        setRuleId(cardTemplate.rewardRules[0].id);
      }
    }
  }, [cardTemplate, ruleId]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;
  const currentRule = cardTemplate.rewardRules.find((r) => r.id === ruleId) || cardTemplate.rewardRules[0];

  // Live simulation of reward calculation
  const otherTxns = editTransaction
    ? existingTransactions.filter((t) => t.id !== editTransaction.id)
    : existingTransactions;

  const simulatedReward = calculateTransactionReward(
    numericAmount,
    currentRule,
    cardTemplate,
    otherTxns,
    transactionDate,
    isPendingSettlement ? null : postingDate,
    isRefund
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || numericAmount <= 0) return;

    onSave(
      {
        userCardId: selectedUserCardId,
        ruleId,
        merchant: merchant.trim(),
        amount: isRefund ? -Math.abs(numericAmount) : Math.abs(numericAmount),
        transactionDate,
        postingDate: isPendingSettlement ? null : postingDate || transactionDate,
        isRefund,
        notes: notes.trim() || undefined,
      },
      editTransaction?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              {isRefund ? <RotateCcw className="w-4 h-4 text-red-400" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {editTransaction ? 'Edit Transaction' : isRefund ? 'Record Refund / Reversal' : 'Add New Transaction'}
              </h3>
              <p className="text-xs text-zinc-400">
                Calculates live rewards, milestone qualifications, and sub-caps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card & Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card Picker */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Credit Card
              </label>
              <select
                value={selectedUserCardId}
                onChange={(e) => setSelectedUserCardId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {userCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.nickname} (•••• {card.last4 || '••••'})
                  </option>
                ))}
              </select>
            </div>

            {/* Category / Reward Multiplier Rule */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Category & Multiplier
              </label>
              <select
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
              >
                {cardTemplate.rewardRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Merchant & Amount row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Merchant / Brand
              </label>
              <input
                type="text"
                required
                placeholder="e.g., GyFTR Amazon, Swiggy, HPCL Fuel"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Transaction Date (Swipe Day)
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => {
                  setTransactionDate(e.target.value);
                  if (!isPendingSettlement && !postingDate) {
                    setPostingDate(e.target.value);
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-400">
                  Posting Date (Settlement)
                </label>
                <label className="flex items-center space-x-1 cursor-pointer text-[11px] text-zinc-400 hover:text-amber-400">
                  <input
                    type="checkbox"
                    checked={isPendingSettlement}
                    onChange={(e) => setIsPendingSettlement(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Pending</span>
                </label>
              </div>
              <input
                type="date"
                disabled={isPendingSettlement}
                value={isPendingSettlement ? '' : postingDate}
                onChange={(e) => setPostingDate(e.target.value)}
                className={`w-full bg-zinc-950 border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 ${
                  isPendingSettlement
                    ? 'opacity-40 border-zinc-800 cursor-not-allowed'
                    : 'border-zinc-800'
                }`}
              />
            </div>
          </div>

          {/* Refund Toggle & Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="flex items-center space-x-2">
                <RotateCcw className={`w-4 h-4 ${isRefund ? 'text-red-400' : 'text-zinc-500'}`} />
                <div>
                  <span className="text-xs font-semibold text-white">Mark as Refund / Reversal</span>
                  <p className="text-[11px] text-zinc-400">
                    Reverses bonus points and restores spend capacity in the active cap period
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRefund}
                onChange={(e) => setIsRefund(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Booking reference or purpose"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* DYNAMIC LIVE CALCULATION & CAP WARNING PREVIEW */}
          {numericAmount > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-time Reward Simulation</span>
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {simulatedReward.totalPoints >= 0 ? '+' : ''}
                  {formatPoints(simulatedReward.totalPoints)} {cardTemplate.pointName}
                </span>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                <div>
                  Base: <strong className="text-white">{formatPoints(simulatedReward.basePoints)}</strong>
                </div>
                <div>
                  Bonus: <strong className="text-amber-300">{formatPoints(simulatedReward.bonusPoints)}</strong>
                </div>
                <div>
                  Multiplier:{' '}
                  <strong className="text-white">
                    {currentRule.bonusMultiplier > 0 ? `${currentRule.bonusMultiplier + 1}X` : '1X'}
                  </strong>
                </div>
              </div>

              {/* Cap Warning Indicator if cap is breached */}
              {simulatedReward.capWarning && (
                <div className="flex items-start space-x-2 text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{simulatedReward.capWarning}</span>
                </div>
              )}

              {/* Amex milestone qualification badge */}
              {cardTemplate.id === 'amex_mrcc' && numericAmount >= 1500 && !isRefund && (
                <div className="flex items-center space-x-1.5 text-[11px] text-cyan-300 bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Qualifies as a <strong>₹1,500+ milestone transaction</strong> toward the 1,000 bonus MR goal!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!merchant.trim() || numericAmount <= 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editTransaction ? 'Save Changes' : isRefund ? 'Record Refund' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
