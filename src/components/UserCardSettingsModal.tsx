'use client';

import React, { useState } from 'react';
import { UserCard, CardTemplate } from '../types/card';
import { X, CreditCard, Plus, Trash2, Edit2, Calendar } from 'lucide-react';

interface UserCardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCards: UserCard[];
  cardTemplates: CardTemplate[];
  onSaveCard: (card: UserCard) => void;
  onDeleteCard: (id: string) => void;
}

export const UserCardSettingsModal: React.FC<UserCardSettingsModalProps> = ({
  isOpen,
  onClose,
  userCards,
  cardTemplates,
  onSaveCard,
  onDeleteCard,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Form states
  const [selectedTemplateId, setSelectedTemplateId] = useState(cardTemplates[0]?.id || 'regalia_gold');
  const [nickname, setNickname] = useState('');
  const [last4, setLast4] = useState('');
  const [billingCycleDay, setBillingCycleDay] = useState(15);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingCardId(null);
    setSelectedTemplateId(cardTemplates[0]?.id || 'regalia_gold');
    setNickname('My Credit Card');
    setLast4('');
    setBillingCycleDay(15);
  };

  const handleStartEdit = (card: UserCard) => {
    setIsAddingNew(false);
    setEditingCardId(card.id);
    setSelectedTemplateId(card.cardTemplateId);
    setNickname(card.nickname);
    setLast4(card.last4 || '');
    setBillingCycleDay(card.billingCycleDay || 1);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingCardId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    if (isAddingNew) {
      const newCard: UserCard = {
        id: `uc_${Date.now()}`,
        cardTemplateId: selectedTemplateId,
        nickname: nickname.trim(),
        last4: last4.trim() || undefined,
        billingCycleDay: Math.min(31, Math.max(1, billingCycleDay)),
        createdAt: new Date().toISOString(),
      };
      onSaveCard(newCard);
    } else if (editingCardId) {
      const existing = userCards.find((c) => c.id === editingCardId);
      if (existing) {
        onSaveCard({
          ...existing,
          cardTemplateId: selectedTemplateId,
          nickname: nickname.trim(),
          last4: last4.trim() || undefined,
          billingCycleDay: Math.min(31, Math.max(1, billingCycleDay)),
        });
      }
    }

    handleCancelForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">My Cards & Wallet</h3>
              <p className="text-xs text-zinc-400">
                Manage the credit cards you hold and their statement billing cycle dates
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

        {/* Add/Edit Form */}
        {(isAddingNew || editingCardId) ? (
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
            <h4 className="text-sm font-semibold text-white">
              {isAddingNew ? 'Add Card to Wallet' : 'Edit Card Details'}
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Card Template (Reward Rules & Multipliers)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {cardTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.issuer})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  Card Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Regalia, Amex MRCC"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Last 4 Digits (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 4821"
                    value={last4}
                    onChange={(e) => setLast4(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Statement Cycle Day (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={billingCycleDay}
                    onChange={(e) => setBillingCycleDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                {isAddingNew ? 'Add Card' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Cards currently in your wallet:</span>
            <button
              onClick={handleStartAdd}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          </div>
        )}

        {/* Existing Cards List */}
        <div className="space-y-3">
          {userCards.map((card) => {
            const template =
              card.templateOverride ||
              cardTemplates.find((t) => t.id === card.cardTemplateId) ||
              cardTemplates[0];

            return (
              <div
                key={card.id}
                className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-zinc-300 font-mono text-xs">
                    {card.last4 ? `••${card.last4.slice(-2)}` : '💳'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{card.nickname}</h4>
                    <p className="text-xs text-zinc-400">{template.name} ({template.issuer})</p>
                    <div className="flex items-center space-x-2 text-[11px] text-zinc-500 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Cycle Day: {card.billingCycleDay || 1}th</span>
                      </span>
                      <span>•</span>
                      <span>{template.pointName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-zinc-400">
                  <button
                    onClick={() => handleStartEdit(card)}
                    className="p-2 rounded-lg hover:text-amber-400 hover:bg-zinc-900 transition-colors"
                    title="Edit Card"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {userCards.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${card.nickname} from wallet?`)) {
                          onDeleteCard(card.id);
                        }
                      }}
                      className="p-2 rounded-lg hover:text-red-400 hover:bg-zinc-900 transition-colors"
                      title="Delete Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
