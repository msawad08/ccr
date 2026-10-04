'use client';

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  CreditCard,
  Sparkles,
  Send,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { FeedbackType, FeedbackCategory } from '../types/admin';
import { submitFeedback } from '../lib/communityCatalog';
import { CardTemplate } from '../types/card';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCards: CardTemplate[];
  userEmail?: string | null;
  defaultCardId?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  availableCards,
  userEmail,
  defaultCardId,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(
    defaultCardId ? 'card' : 'app'
  );
  const [selectedCardId, setSelectedCardId] = useState<string>(
    defaultCardId || (availableCards[0]?.id ?? '')
  );
  const [category, setCategory] = useState<FeedbackCategory>(
    defaultCardId ? 'devaluation' : 'general'
  );
  const [email, setEmail] = useState<string>(userEmail || '');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim() || userEmail?.trim() || 'anonymous@community.user';
    const cleanMsg = message.trim();

    if (!cleanMsg) {
      setErrorMessage('Please enter your feedback message.');
      return;
    }

    setSubmitting(true);
    try {
      const cardObj = availableCards.find((c) => c.id === selectedCardId);
      await submitFeedback({
        userEmail: cleanEmail,
        type: feedbackType,
        cardTemplateId: feedbackType === 'card' ? selectedCardId : undefined,
        cardName: feedbackType === 'card' ? cardObj?.name || selectedCardId : undefined,
        category,
        message: cleanMsg,
      });

      setSuccessMessage('Thank you! Your feedback has been sent directly to the admin review desk.');
      setMessage('');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141210] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-100 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800/80 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">
              Community Intelligence
            </span>
            <h3 className="text-lg font-serif tracking-tight text-stone-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C5A880]" />
              <span>Feedback & Rule Updates</span>
            </h3>
            <p className="text-xs text-stone-400">
              Report bank devaluations, suggest rules, or submit general app suggestions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Type Tabs */}
        <div className="grid grid-cols-2 p-1 bg-stone-950/70 border border-stone-800/70 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setFeedbackType('card')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              feedbackType === 'card'
                ? 'bg-stone-900 text-stone-100 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Card Rule / Devaluation</span>
          </button>
          <button
            type="button"
            onClick={() => setFeedbackType('app')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              feedbackType === 'app'
                ? 'bg-stone-900 text-stone-100 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-300" />
            <span>General App Idea</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/30 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-stone-900 border border-[#C5A880]/40 rounded-xl text-xs text-[#EAE4DC] flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-[#C5A880]" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Picker (When Card Type is Active) */}
          {feedbackType === 'card' && (
            <div>
              <label className="block text-[11px] font-mono tracking-wider uppercase text-stone-400 mb-1.5">
                Target Credit Card
              </label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880] transition-colors"
              >
                {availableCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.issuer} - {card.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-stone-400 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'devaluation', label: 'Devaluation' },
                { key: 'rule_change', label: 'Cap / Rule Change' },
                { key: 'feature', label: 'Feature Request' },
                { key: 'bug', label: 'Bug / Correction' },
                { key: 'general', label: 'General Feedback' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key as FeedbackCategory)}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] text-left border transition-all ${
                    category === item.key
                      ? 'border-[#C5A880] bg-[#C5A880]/10 text-stone-100 font-medium'
                      : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Email (Optional) */}
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-stone-400 mb-1">
              Your Email (For Follow-up)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com (optional)"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-[11px] font-mono tracking-wider uppercase text-stone-400 mb-1">
              Detailed Notes & Bank Source
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'card'
                  ? 'e.g. HDFC lowered SmartBuy voucher cap from 3,000 to 2,000 RP effective 1st of next month...'
                  : 'Tell us how we can make CardCap more seamless and refined...'
              }
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none focus:border-[#C5A880] resize-none"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-stone-500 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-stone-500" />
              <span>Visible only to CardCap administrators</span>
            </span>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 text-stone-950 hover:bg-stone-200 font-medium text-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Send Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
