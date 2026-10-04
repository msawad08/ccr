'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Plus,
  Sparkles,
  Check,
  Search,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Award,
  Edit3,
  Trash2,
} from 'lucide-react';
import { CardTemplate } from '../types/card';
import { canManageCards } from '../lib/adminAuth';

interface CommunityCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogTemplates: CardTemplate[];
  userCardTemplateIds: string[];
  currentUserEmail?: string | null;
  isAdmin?: boolean;
  onAddCardToWallet: (templateId: string) => void;
  onEditCard: (template: CardTemplate) => void;
  onDeleteCard?: (templateId: string) => void;
  onCreateNewCard?: () => void;
  onRequestCardUpdate?: (template: CardTemplate) => void;
}

export const CommunityCatalogModal: React.FC<CommunityCatalogModalProps> = ({
  isOpen,
  onClose,
  catalogTemplates,
  userCardTemplateIds,
  currentUserEmail,
  isAdmin,
  onAddCardToWallet,
  onEditCard,
  onDeleteCard,
  onCreateNewCard,
  onRequestCardUpdate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const effectiveIsAdmin = isAdmin !== undefined ? isAdmin : canManageCards(currentUserEmail);

  const issuers = Array.from(new Set(catalogTemplates.map((c) => c.issuer)));

  const filteredCards = catalogTemplates.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(search.toLowerCase()) ||
      card.issuer.toLowerCase().includes(search.toLowerCase()) ||
      (card.creatorName && card.creatorName.toLowerCase().includes(search.toLowerCase()));

    const matchesIssuer = selectedIssuer === 'all' || card.issuer === selectedIssuer;

    return matchesSearch && matchesIssuer;
  });

  const handleAdd = (templateId: string) => {
    onAddCardToWallet(templateId);
    setAddedIds((prev) => [...prev, templateId]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== templateId));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#141210] border border-stone-800 rounded-3xl shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800/80 bg-gradient-to-r from-stone-950 via-[#161412] to-stone-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 border border-stone-700/60 flex items-center justify-center text-[#C5A880] shadow-sm">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">
                Curated Registry & Rules
              </span>
              <h2 className="text-xl font-serif tracking-tight text-stone-100">
                CardCap Community Catalog
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCreateNewCard && (
              <button
                type="button"
                onClick={onCreateNewCard}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-stone-950 bg-[#C5A880] hover:bg-[#d4b993] transition-all active:scale-[0.98] shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Card / AI Studio</span>
                <span className="sm:hidden">New Card</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-stone-800/80 bg-stone-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
            <input
              type="text"
              placeholder="Search by card name, bank, or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedIssuer('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedIssuer === 'all'
                  ? 'bg-stone-900 text-stone-100 font-medium border border-stone-700/70'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All Issuers
            </button>
            {issuers.map((issuer) => (
              <button
                key={issuer}
                onClick={() => setSelectedIssuer(issuer)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  selectedIssuer === issuer
                    ? 'bg-stone-900 text-stone-100 font-medium border border-stone-700/70'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {issuer}
              </button>
            ))}
          </div>
        </div>

        {/* Card Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => {
              const alreadyInWallet = userCardTemplateIds.includes(card.id);
              const isJustAdded = addedIds.includes(card.id);

              return (
                <div
                  key={card.id}
                  className="p-5 bg-stone-950/80 border border-stone-800 hover:border-stone-700 rounded-2xl space-y-4 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                          {card.issuer} &bull; {card.network}
                        </span>
                        <h4 className="text-base font-serif tracking-tight text-stone-100">
                          {card.name}
                        </h4>
                      </div>

                      {/* Creator Credit Badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-[#C5A880]">
                        {card.isOfficial ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#C5A880]" />
                            <span>Official</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-3 h-3 text-[#C5A880]" />
                            <span>{card.creatorName || 'Community'}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Rate & Math Specs */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/60 text-xs font-mono text-stone-300">
                      <div>
                        <span className="text-[10px] text-stone-500 block">Base Rate</span>
                        <span>
                          {card.baseRule.pointsPerStep} {card.pointName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Step Spend</span>
                        <span>₹{card.baseRule.spendStep}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 block">Point Val</span>
                        <span>₹{card.pointValueInInr.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Multipliers snippet */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-stone-500">
                        Top Multipliers & Caps
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {card.rewardRules.slice(0, 3).map((r) => (
                          <span
                            key={r.id}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-900/90 border border-stone-800/80 text-stone-300"
                          >
                            {r.name.split('(')[0]}: {r.bonusMultiplier ? `${r.bonusMultiplier + 1}X` : '1X'}
                          </span>
                        ))}
                        {card.rewardRules.length > 3 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 text-stone-500">
                            +{card.rewardRules.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-800/60 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditCard(card)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-stone-300 hover:text-stone-100 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all text-xs font-medium active:scale-[0.98]"
                        title="Edit rules for your wallet, or propose updates for everyone"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>Edit</span>
                      </button>

                      {effectiveIsAdmin && onDeleteCard && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete "${card.name}" from the Community Catalog? This action cannot be undone.`
                              )
                            ) {
                              onDeleteCard(card.id);
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-red-400/80 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-800/50 transition-all text-xs font-medium active:scale-[0.98]"
                          title="Admin Only: Delete card from catalog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdd(card.id)}
                      disabled={isJustAdded}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-medium transition-all active:scale-[0.98] shadow-sm ${
                        isJustAdded
                          ? 'bg-stone-900 text-[#C5A880] border border-[#C5A880]/40'
                          : alreadyInWallet
                          ? 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700'
                          : 'bg-stone-100 text-stone-950 hover:bg-stone-200'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                          <span>Added!</span>
                        </>
                      ) : alreadyInWallet ? (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Another</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Wallet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
