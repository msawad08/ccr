'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { CardSelector } from '../components/CardSelector';
import { PeriodSelector } from '../components/PeriodSelector';
import { RegaliaGoldDashboard } from '../components/RegaliaGoldDashboard';
import { AmexMrccDashboard } from '../components/AmexMrccDashboard';
import { GenericCardDashboard } from '../components/GenericCardDashboard';
import { TransactionLedger } from '../components/TransactionLedger';
import { TransactionEntryModal } from '../components/TransactionEntryModal';
import { CardTemplateEditorModal } from '../components/CardTemplateEditorModal';
import { UserCardSettingsModal } from '../components/UserCardSettingsModal';
import { SettingsModal } from '../components/SettingsModal';
import { MonthlyReportModal } from '../components/MonthlyReportModal';
import { AdminPanelModal } from '../components/AdminPanelModal';
import { FeedbackModal } from '../components/FeedbackModal';
import { CommunityCatalogModal } from '../components/CommunityCatalogModal';

import {
  UserCard,
  CardTemplate,
  Transaction,
  DateTrackingBasis,
} from '../types/card';
import {
  loadUserCards,
  saveUserCard,
  deleteUserCard,
  loadCardTemplates,
  saveCardTemplate,
  resetCardTemplates,
  loadTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  resetAllToSampleData,
  getCurrentYearMonth,
  fetchUserDataFromSupabase,
} from '../lib/storage';
import { evaluateCardPeriodSummary } from '../lib/rewardsEngine';
import {
  isSupabaseConfigured as checkSupabaseConfigured,
  checkAndInitSupabase,
  getStorageMode,
  getCurrentUser,
  onAuthStateChange,
} from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [cardTemplates, setCardTemplates] = useState<CardTemplate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeUserCardId, setActiveUserCardId] = useState<string>('');

  const [storageMode, setStorageMode] = useState<'local' | 'supabase'>('local');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [yearMonth, setYearMonth] = useState(() => getCurrentYearMonth());
  const [trackingBasis, setTrackingBasis] = useState<DateTrackingBasis>('posting_date');
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Modals state
  const [isAddTxnOpen, setIsAddTxnOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [isCardRulesOpen, setIsCardRulesOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string>('regalia_gold');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Initialize data on client load
  useEffect(() => {
    setIsClient(true);
    const mode = getStorageMode();
    setStorageMode(mode);
    refreshData();

    checkAndInitSupabase().then((res) => {
      if (res.configured) {
        getCurrentUser().then((user) => {
          setCurrentUser(user);
          if (user && getStorageMode() === 'supabase') {
            fetchUserDataFromSupabase(user.id).then(() => refreshData());
          }
        });

        const unsub = onAuthStateChange((user) => {
          setCurrentUser(user);
          if (user) {
            setStorageMode('supabase');
            if (typeof window !== 'undefined') {
              localStorage.setItem('ccr_storage_mode', 'supabase');
              if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
            fetchUserDataFromSupabase(user.id).then(() => refreshData());
          }
        });

        return () => unsub();
      }
    });
  }, []);

  const refreshData = () => {
    const templates = loadCardTemplates();
    const cards = loadUserCards();
    const txns = loadTransactions();

    setCardTemplates(templates);
    setUserCards(cards);
    setTransactions(txns);

    if (cards.length > 0 && !activeUserCardId) {
      setActiveUserCardId(cards[0].id);
    }
  };

  // Find active card & template
  const activeUserCard = useMemo(() => {
    return userCards.find((c) => c.id === activeUserCardId) || userCards[0];
  }, [userCards, activeUserCardId]);

  const activeCardTemplate = useMemo(() => {
    if (!activeUserCard) return cardTemplates[0];
    return (
      activeUserCard.templateOverride ||
      cardTemplates.find((t) => t.id === activeUserCard.cardTemplateId) ||
      cardTemplates[0]
    );
  }, [activeUserCard, cardTemplates]);

  // Filter transactions for active card
  const activeCardTransactions = useMemo(() => {
    if (!activeUserCard) return [];
    return transactions.filter((t) => t.userCardId === activeUserCard.id);
  }, [transactions, activeUserCard]);

  // Evaluate Period Summary
  const periodSummary = useMemo(() => {
    if (!activeCardTemplate) return null;
    return evaluateCardPeriodSummary(
      activeCardTemplate,
      activeCardTransactions,
      yearMonth.year,
      yearMonth.month,
      trackingBasis,
      selectedDay
    );
  }, [activeCardTemplate, activeCardTransactions, yearMonth, trackingBasis, selectedDay]);

  // Handlers for transactions
  const handleSaveTransaction = (
    txnData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      const existing = transactions.find((t) => t.id === existingId);
      if (existing) {
        updateTransaction({
          ...existing,
          ...txnData,
        });
      }
    } else {
      addTransaction(txnData);
    }
    refreshData();
    setEditingTxn(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      refreshData();
    }
  };

  const handleToggleRefund = (txn: Transaction) => {
    updateTransaction({
      ...txn,
      isRefund: !txn.isRefund,
      amount: !txn.isRefund ? -Math.abs(txn.amount) : Math.abs(txn.amount),
    });
    refreshData();
  };

  // Handlers for templates
  const handleSaveTemplate = (updatedTemplate: CardTemplate) => {
    saveCardTemplate(updatedTemplate);
    refreshData();
  };

  const handleResetTemplates = () => {
    if (confirm('Reset all card templates back to default bank configurations?')) {
      resetCardTemplates();
      refreshData();
    }
  };

  // Handlers for user cards
  const handleSaveUserCard = (card: UserCard) => {
    saveUserCard(card);
    refreshData();
    if (!activeUserCardId) {
      setActiveUserCardId(card.id);
    }
  };

  const handleDeleteUserCard = (cardId: string) => {
    deleteUserCard(cardId);
    refreshData();
    const remaining = userCards.filter((c) => c.id !== cardId);
    if (remaining.length > 0) {
      setActiveUserCardId(remaining[0].id);
    }
  };

  const handleResetAllSamples = () => {
    resetAllToSampleData();
    refreshData();
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center text-stone-400">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
          <span className="font-serif tracking-tight text-stone-300">Loading CardCap Editorial Engine...</span>
        </div>
      </div>
    );
  }

  const isConfigured = checkSupabaseConfigured();

  return (
    <div className="min-h-screen bg-[#0C0A09] text-stone-100 flex flex-col font-sans selection:bg-[#C5A880] selection:text-[#0C0A09]">
      {/* Navigation Bar */}
      <Navbar
        onOpenAddTransaction={() => {
          setEditingTxn(null);
          setIsAddTxnOpen(true);
        }}
        onOpenCardRules={() => {
          setEditingTemplateId(activeCardTemplate?.id || 'regalia_gold');
          setIsCardRulesOpen(true);
        }}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenAdminPanel={() => setIsAdminOpen(true)}
        onOpenCommunityCatalog={() => setIsCatalogOpen(true)}
        isSupabaseConfigured={isConfigured}
        storageMode={storageMode}
        userEmail={currentUser?.email}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Card Selector Carousel */}
        <CardSelector
          userCards={userCards}
          cardTemplates={cardTemplates}
          activeCardId={activeUserCardId}
          onSelectCard={(id) => setActiveUserCardId(id)}
          onAddNewCard={() => setIsWalletOpen(true)}
          onEditCardRules={(templateId) => {
            setEditingTemplateId(templateId);
            setIsCardRulesOpen(true);
          }}
        />

        {/* Period Selector & Tracking Basis Toggle */}
        <PeriodSelector
          year={yearMonth.year}
          month={yearMonth.month}
          onChangePeriod={(year, month) => {
            setYearMonth({ year, month });
            setSelectedDay('');
          }}
          trackingBasis={trackingBasis}
          onChangeTrackingBasis={(basis) => setTrackingBasis(basis)}
        />

        {/* Card-Specific Dashboard */}
        {activeCardTemplate && periodSummary && (
          <>
            {activeCardTemplate.id === 'regalia_gold' ? (
              <RegaliaGoldDashboard
                card={activeCardTemplate}
                summary={periodSummary}
                selectedDay={selectedDay || periodSummary.capsProgress.find((c) => c.capGroupId === 'smartbuy')?.selectedDate || ''}
                onSelectDay={(day) => setSelectedDay(day)}
                onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
              />
            ) : activeCardTemplate.id === 'amex_mrcc' ? (
              <AmexMrccDashboard
                card={activeCardTemplate}
                summary={periodSummary}
                onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
              />
            ) : (
              <GenericCardDashboard
                card={activeCardTemplate}
                summary={periodSummary}
                selectedDay={selectedDay || periodSummary.capsProgress[0]?.selectedDate || ''}
                onSelectDay={(day) => setSelectedDay(day)}
                onOpenMonthlyReport={() => setIsMonthlyReportOpen(true)}
              />
            )}
          </>
        )}

        {/* Transaction Ledger Table */}
        {activeCardTemplate && (
          <TransactionLedger
            transactions={activeCardTransactions}
            card={activeCardTemplate}
            trackingBasis={trackingBasis}
            onEditTransaction={(txn) => {
              setEditingTxn(txn);
              setIsAddTxnOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onToggleRefund={handleToggleRefund}
            onOpenAddModal={() => {
              setEditingTxn(null);
              setIsAddTxnOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-[#0C0A09]/60 py-8 text-center text-xs text-stone-500 font-sans">
        <p className="tracking-wide">
          CardCap Rewards & Milestone Engine • Warm Editorial Minimalism • Client-first architecture with dynamic bank rule governance
        </p>
      </footer>

      {/* Modals */}
      <TransactionEntryModal
        isOpen={isAddTxnOpen}
        onClose={() => {
          setIsAddTxnOpen(false);
          setEditingTxn(null);
        }}
        onSave={handleSaveTransaction}
        userCards={userCards}
        cardTemplates={cardTemplates}
        activeUserCardId={activeUserCardId}
        existingTransactions={activeCardTransactions}
        editTransaction={editingTxn}
      />

      <CardTemplateEditorModal
        isOpen={isCardRulesOpen}
        onClose={() => setIsCardRulesOpen(false)}
        cardTemplates={cardTemplates}
        selectedTemplateId={editingTemplateId}
        onSaveTemplate={handleSaveTemplate}
        onResetTemplates={handleResetTemplates}
        userEmail={currentUser?.email}
        onCardPublished={(publishedCard) => {
          handleSaveTemplate(publishedCard);
        }}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          refreshData();
        }}
        currentUserEmail={currentUser?.email}
        onCardPublished={(publishedCard) => {
          handleSaveTemplate(publishedCard);
        }}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        availableCards={cardTemplates}
        userEmail={currentUser?.email}
        defaultCardId={activeCardTemplate?.id}
      />

      <CommunityCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        catalogTemplates={cardTemplates}
        userCardTemplateIds={userCards.map((c) => c.cardTemplateId)}
        onAddCardToWallet={(templateId) => {
          const t = cardTemplates.find((x) => x.id === templateId);
          const newCard: UserCard = {
            id: `uc_${Date.now()}`,
            cardTemplateId: templateId,
            nickname: t?.name || 'Community Card',
            billingCycleDay: 1,
            createdAt: new Date().toISOString(),
          };
          handleSaveUserCard(newCard);
          setIsCatalogOpen(false);
        }}
        onRequestCardUpdate={(template) => {
          setEditingTemplateId(template.id);
          setIsCatalogOpen(false);
          setIsCardRulesOpen(true);
        }}
      />

      <UserCardSettingsModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        userCards={userCards}
        cardTemplates={cardTemplates}
        onSaveCard={handleSaveUserCard}
        onDeleteCard={handleDeleteUserCard}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setStorageMode(getStorageMode());
          refreshData();
        }}
        onResetToSampleData={handleResetAllSamples}
        onDataImported={() => {
          setStorageMode(getStorageMode());
          refreshData();
        }}
      />

      {activeCardTemplate && (
        <MonthlyReportModal
          isOpen={isMonthlyReportOpen}
          onClose={() => setIsMonthlyReportOpen(false)}
          card={activeCardTemplate}
          transactions={activeCardTransactions}
          trackingBasis={trackingBasis}
          onSelectPeriod={(year, month) => {
            setYearMonth({ year, month });
            setSelectedDay('');
          }}
        />
      )}
    </div>
  );
}
