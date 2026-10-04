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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141210] border border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 text-[#C5A880] flex items-center justify-center font-bold">
              {isRefund ? <RotateCcw className="w-4 h-4 text-[#B85D43]" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-stone-100">
                {editTransaction ? 'Edit Transaction' : isRefund ? 'Record Refund / Reversal' : 'Add New Transaction'}
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                Real-time accrual calculation, milestone tracking, and sub-cap simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {/* Card & Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card Picker */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1 font-sans">
                Credit Card
              </label>
              <select
                value={selectedUserCardId}
                onChange={(e) => setSelectedUserCardId(e.target.value)}
                className="w-full bg-[#0C0A09] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880] font-sans"
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
              <label className="block text-xs font-medium text-stone-300 mb-1 font-sans">
                Category & Multiplier
              </label>
              <select
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
                className="w-full bg-[#0C0A09] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880] font-medium"
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
              <label className="block text-xs font-medium text-stone-300 mb-1 font-sans">
                Merchant / Brand
              </label>
              <input
                type="text"
                required
                placeholder="e.g., GyFTR Amazon, Swiggy, HPCL Fuel"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-[#0C0A09] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1 font-sans">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-mono text-xs">
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
                  className="w-full bg-[#0C0A09] border border-stone-800 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-medium text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1 font-sans">
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
                className="w-full bg-[#0C0A09] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880] font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-stone-300 font-sans">
                  Posting Date (Settlement)
                </label>
                <label className="flex items-center space-x-1 cursor-pointer text-[11px] text-stone-400 hover:text-stone-200 font-mono">
                  <input
                    type="checkbox"
                    checked={isPendingSettlement}
                    onChange={(e) => setIsPendingSettlement(e.target.checked)}
                    className="rounded text-[#C5A880] focus:ring-0 cursor-pointer"
                  />
                  <span>Pending</span>
                </label>
              </div>
              <input
                type="date"
                disabled={isPendingSettlement}
                value={isPendingSettlement ? '' : postingDate}
                onChange={(e) => setPostingDate(e.target.value)}
                className={`w-full bg-[#0C0A09] border rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880] font-mono ${
                  isPendingSettlement
                    ? 'opacity-40 border-stone-800 cursor-not-allowed'
                    : 'border-stone-800'
                }`}
              />
            </div>
          </div>

          {/* Refund Toggle & Notes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0C0A09] border border-stone-800">
              <div className="flex items-center space-x-2.5">
                <RotateCcw className={`w-4 h-4 ${isRefund ? 'text-[#B85D43]' : 'text-stone-500'}`} />
                <div>
                  <span className="text-xs font-medium text-stone-200">Mark as Refund / Reversal</span>
                  <p className="text-[11px] text-stone-400 font-sans">
                    Reverses bonus points and restores capacity in the active cap period
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRefund}
                onChange={(e) => setIsRefund(e.target.checked)}
                className="w-4 h-4 rounded text-[#B85D43] focus:ring-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1 font-sans">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Booking reference or purpose"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#0C0A09] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          {/* DYNAMIC LIVE CALCULATION & CAP WARNING PREVIEW */}
          {numericAmount > 0 && (
            <div className="p-4 rounded-2xl bg-[#0C0A09] border border-stone-800 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-medium text-stone-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Real-time Accrual Simulation</span>
                </span>
                <span className="font-mono font-bold text-[#C5A880] text-sm">
                  {simulatedReward.totalPoints >= 0 ? '+' : ''}
                  {formatPoints(simulatedReward.totalPoints)} {cardTemplate.pointName}
                </span>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-800">
                <div>
                  Base: <strong className="text-stone-200">{formatPoints(simulatedReward.basePoints)}</strong>
                </div>
                <div>
                  Bonus: <strong className="text-[#C5A880]">{formatPoints(simulatedReward.bonusPoints)}</strong>
                </div>
                <div>
                  Multiplier:{' '}
                  <strong className="text-stone-200">
                    {currentRule.bonusMultiplier > 0 ? `${currentRule.bonusMultiplier + 1}X` : '1X'}
                  </strong>
                </div>
              </div>

              {/* Cap Warning Indicator if cap is breached */}
              {simulatedReward.capWarning && (
                <div className="flex items-start space-x-2 text-[11px] text-[#C28B45] bg-[#241A10] p-2.5 rounded-xl border border-[#593E1B]/50 font-sans">
                  <AlertTriangle className="w-4 h-4 text-[#C28B45] flex-shrink-0 mt-0.5" />
                  <span>{simulatedReward.capWarning}</span>
                </div>
              )}

              {/* Amex milestone qualification badge */}
              {cardTemplate.id === 'amex_mrcc' && numericAmount >= 1500 && !isRefund && (
                <div className="flex items-center space-x-1.5 text-[11px] text-[#769F86] bg-[#132219] p-2.5 rounded-xl border border-emerald-900/40 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#769F86]" />
                  <span>
                    Qualifies as a <strong>₹1,500+ milestone transaction</strong> toward 1,000 bonus MR!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3.5 border-t border-stone-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!merchant.trim() || numericAmount <= 0}
              className="px-5 py-2 rounded-xl text-xs font-medium text-[#0C0A09] bg-[#C5A880] hover:bg-[#D4B992] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {editTransaction ? 'Save Changes' : isRefund ? 'Record Refund' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
