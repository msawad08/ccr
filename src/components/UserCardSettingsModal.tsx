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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#141210] border border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 text-[#C5A880] flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-medium text-base text-stone-100">My Cards & Wallet</h3>
              <p className="text-xs text-stone-400 font-sans">
                Manage the credit cards you hold and their statement billing cycle dates
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

        {/* Add/Edit Form */}
        {(isAddingNew || editingCardId) ? (
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-[#0C0A09] border border-stone-800 space-y-4">
            <h4 className="font-serif font-medium text-sm text-stone-200">
              {isAddingNew ? 'Add Card to Wallet' : 'Edit Card Details'}
            </h4>

            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Card Template (Reward Rules & Multipliers)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-[#141210] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                >
                  {cardTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.issuer})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Card Nickname
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Regalia, Amex MRCC"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-[#141210] border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Last 4 Digits (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 4821"
                    value={last4}
                    onChange={(e) => setLast4(e.target.value)}
                    className="w-full bg-[#141210] border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Statement Cycle Day (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={billingCycleDay}
                    onChange={(e) => setBillingCycleDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-[#141210] border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200 focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-800/80">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-3.5 py-1.5 text-xs text-stone-400 hover:text-stone-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-medium text-[#0C0A09] bg-[#C5A880] hover:bg-[#D4B992] transition-all active:scale-[0.98]"
              >
                {isAddingNew ? 'Add Card' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-sans">Cards currently in your wallet:</span>
            <button
              onClick={handleStartAdd}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#C5A880] hover:bg-[#D4B992] text-[#0C0A09] font-medium text-xs transition-all active:scale-[0.98]"
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
                className="p-4 rounded-2xl bg-[#0C0A09] border border-stone-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-300 font-mono text-xs">
                    {card.last4 ? `••${card.last4.slice(-2)}` : '💳'}
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-stone-100 text-sm">{card.nickname}</h4>
                    <p className="text-xs text-stone-400 font-sans">{template.name} ({template.issuer})</p>
                    <div className="flex items-center space-x-2 text-[11px] text-stone-500 mt-0.5 font-mono">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-stone-500" />
                        <span>Cycle: {card.billingCycleDay || 1}st</span>
                      </span>
                      <span>•</span>
                      <span>{template.pointName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-stone-400">
                  <button
                    onClick={() => handleStartEdit(card)}
                    className="p-2 rounded-xl hover:text-[#C5A880] hover:bg-stone-800 transition-colors"
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
                      className="p-2 rounded-xl hover:text-[#B85D43] hover:bg-stone-800 transition-colors"
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
