'use client';

import React from 'react';
import { UserCard, CardTemplate } from '../types/card';
import { Plus, CreditCard, Calendar, Sliders } from 'lucide-react';

interface CardSelectorProps {
  userCards: UserCard[];
  cardTemplates: CardTemplate[];
  activeCardId: string;
  onSelectCard: (cardId: string) => void;
  onAddNewCard: () => void;
  onEditCardRules: (templateId: string) => void;
}

export const CardSelector: React.FC<CardSelectorProps> = ({
  userCards,
  cardTemplates,
  activeCardId,
  onSelectCard,
  onAddNewCard,
  onEditCardRules,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline space-x-2">
          <h2 className="font-serif text-sm font-medium text-stone-300 tracking-wide uppercase text-[11px]">
            Active Portfolio
          </h2>
          <span className="text-[11px] font-mono text-stone-400">({userCards.length} Cards)</span>
        </div>
        <button
          onClick={onAddNewCard}
          className="text-xs text-[#C5A880] hover:text-[#EAE4DC] flex items-center space-x-1.5 font-medium transition-colors active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {userCards.map((userCard) => {
          const template =
            userCard.templateOverride ||
            cardTemplates.find((t) => t.id === userCard.cardTemplateId) ||
            cardTemplates[0];

          const isActive = userCard.id === activeCardId;

          return (
            <div
              key={userCard.id}
              onClick={() => onSelectCard(userCard.id)}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-left group overflow-hidden active:scale-[0.98] ${
                isActive
                  ? 'bg-gradient-to-b from-[#1C1815] to-[#12100E] border-[#C5A880]/70 ring-1 ring-[#C5A880]/30 shadow-xl shadow-black/40'
                  : 'bg-[#141210] border-stone-800/80 hover:bg-[#181614] hover:border-stone-700'
              }`}
            >
              {/* Subtle Warm Atmosphere Sheen */}
              <div
                className={`absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-300 ${
                  isActive ? 'opacity-25' : 'group-hover:opacity-20'
                }`}
                style={{
                  background:
                    'radial-gradient(ellipse at top right, rgba(197, 168, 128, 0.18), transparent 70%)',
                }}
              />

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[114px]">
                {/* Header row: Issuer & Network */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 font-medium">
                    {template.issuer}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-stone-900 border border-stone-800 text-stone-300">
                      {template.network}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] ring-4 ring-[#C5A880]/20" />
                    )}
                  </div>
                </div>

                {/* Card Name & Nickname */}
                <div className="my-2.5">
                  <h3 className="font-serif font-medium text-stone-100 text-base tracking-tight truncate">
                    {userCard.nickname || template.name}
                  </h3>
                  <div className="text-xs text-stone-400 truncate font-sans">
                    {template.name !== userCard.nickname ? template.name : template.pointName}
                  </div>
                </div>

                {/* Footer details: Last 4 & Billing cycle */}
                <div className="flex items-center justify-between pt-2.5 border-t border-stone-800/80 text-[11px] text-stone-400">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <CreditCard className="w-3 h-3 text-stone-400" />
                    <span>•••• {userCard.last4 || '••••'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 font-mono text-stone-400">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>Cycle {userCard.billingCycleDay || 1}st</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCardRules(template.id);
                      }}
                      title="Configure Card Rules & Caps"
                      className="text-stone-400 hover:text-[#C5A880] transition-colors p-1 rounded-md hover:bg-stone-800"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Add Card Placeholder */}
        <button
          onClick={onAddNewCard}
          className="rounded-2xl p-4 border border-dashed border-stone-800 hover:border-stone-700 bg-[#12100E]/50 hover:bg-[#181614] text-stone-400 hover:text-stone-200 flex flex-col items-center justify-center min-h-[114px] space-y-2 transition-all active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 group-hover:text-[#C5A880]">
            <Plus className="w-4 h-4 text-[#C5A880]" />
          </div>
          <span className="text-xs font-medium tracking-tight">Add Another Card</span>
        </button>
      </div>
    </div>
  );
};
