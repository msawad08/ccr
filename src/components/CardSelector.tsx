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
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Active Credit Card
        </h2>
        <button
          onClick={onAddNewCard}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-medium transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border text-left group overflow-hidden ${
                isActive
                  ? 'ring-2 ring-amber-400/80 border-amber-500/50 shadow-xl shadow-amber-500/10 scale-[1.01]'
                  : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              {/* Background gradient banner */}
              <div
                className={`absolute inset-0 opacity-20 bg-gradient-to-br ${template.theme.gradientFrom} ${template.theme.gradientTo}`}
              />

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[110px]">
                {/* Header row: Issuer & Network */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {template.issuer}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                      {template.network}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                </div>

                {/* Card Name & Nickname */}
                <div className="my-2">
                  <h3 className="font-bold text-white text-base tracking-tight truncate">
                    {userCard.nickname || template.name}
                  </h3>
                  <div className="text-xs text-zinc-400 truncate">
                    {template.name !== userCard.nickname ? template.name : template.pointName}
                  </div>
                </div>

                {/* Footer details: Last 4 & Billing cycle */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <div className="flex items-center space-x-2 font-mono">
                    <CreditCard className="w-3 h-3 text-zinc-500" />
                    <span>•••• {userCard.last4 || '••••'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>Cycle: {userCard.billingCycleDay || 1}th</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCardRules(template.id);
                      }}
                      title="Configure Rules & Caps"
                      className="text-zinc-500 hover:text-amber-400 transition-colors p-1"
                    >
                      <Sliders className="w-3 h-3" />
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
          className="rounded-2xl p-4 border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 flex flex-col items-center justify-center min-h-[110px] space-y-2 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-amber-400">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">Add Another Card</span>
        </button>
      </div>
    </div>
  );
};
