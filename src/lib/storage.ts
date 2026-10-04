import { UserCard, CardTemplate, Transaction } from '../types/card';
import { DEFAULT_CARD_TEMPLATES } from '../data/defaultTemplates';
import { getSupabaseClient } from './supabaseClient';

const STORAGE_KEYS = {
  USER_CARDS: 'ccr_user_cards_v1',
  CARD_TEMPLATES: 'ccr_card_templates_v1',
  TRANSACTIONS: 'ccr_transactions_v1',
  ACTIVE_CARD_ID: 'ccr_active_card_id',
  STORAGE_MODE: 'ccr_storage_mode', // 'demo' | 'supabase'
};

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

// Generate realistic mock sample data matching plan.md specifications
export function getInitialSampleData(): {
  userCards: UserCard[];
  cardTemplates: CardTemplate[];
  transactions: Transaction[];
} {
  const { year, month } = getCurrentYearMonth();
  const mStr = String(month).padStart(2, '0');

  const userCards: UserCard[] = [
    {
      id: 'uc_regalia_gold',
      cardTemplateId: 'regalia_gold',
      nickname: 'Primary Regalia Gold',
      last4: '4821',
      billingCycleDay: 15,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'uc_amex_mrcc',
      cardTemplateId: 'amex_mrcc',
      nickname: 'Amex Rewards Card',
      last4: '3009',
      billingCycleDay: 20,
      createdAt: new Date().toISOString(),
    },
  ];

  const transactions: Transaction[] = [
    // --- HDFC Regalia Gold Sample Transactions ---
    // GyFTR & Woohoo vouchers: ₹13,639 total (Yields 1,360 bonus RP, ₹16,361 capacity left)
    {
      id: 'txn_rg_1',
      userCardId: 'uc_regalia_gold',
      ruleId: 'rg_sb_voucher',
      transactionDate: `${year}-${mStr}-03`,
      postingDate: `${year}-${mStr}-04`,
      merchant: 'GyFTR Amazon Pay Voucher',
      amount: 10000,
      isRefund: false,
      notes: 'SmartBuy Amazon Shopping Vouchers (5X)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_rg_2',
      userCardId: 'uc_regalia_gold',
      ruleId: 'rg_sb_voucher',
      transactionDate: `${year}-${mStr}-06`,
      postingDate: `${year}-${mStr}-07`,
      merchant: 'Woohoo Swiggy Voucher',
      amount: 3639,
      isRefund: false,
      notes: 'Food vouchers via SmartBuy (5X)',
      createdAt: new Date().toISOString(),
    },
    // Partner 5X: Myntra ₹4,000
    {
      id: 'txn_rg_3',
      userCardId: 'uc_regalia_gold',
      ruleId: 'rg_partner_5x',
      transactionDate: `${year}-${mStr}-10`,
      postingDate: `${year}-${mStr}-11`,
      merchant: 'Myntra Fashion',
      amount: 4000,
      isRefund: false,
      notes: '5X Accelerated Partner spend',
      createdAt: new Date().toISOString(),
    },
    // SmartBuy Flight: Indigo ₹7,500
    {
      id: 'txn_rg_4',
      userCardId: 'uc_regalia_gold',
      ruleId: 'rg_sb_flight',
      transactionDate: `${year}-${mStr}-12`,
      postingDate: `${year}-${mStr}-13`,
      merchant: 'SmartBuy Indigo Flights',
      amount: 7500,
      isRefund: false,
      notes: 'Delhi to Mumbai flight booking (5X)',
      createdAt: new Date().toISOString(),
    },
    // Grocery: Blinkit ₹3,400 (Capped at 2,000 RP)
    {
      id: 'txn_rg_5',
      userCardId: 'uc_regalia_gold',
      ruleId: 'rg_grocery',
      transactionDate: `${year}-${mStr}-14`,
      postingDate: `${year}-${mStr}-14`,
      merchant: 'Blinkit Grocery',
      amount: 3400,
      isRefund: false,
      notes: 'Weekly grocery run',
      createdAt: new Date().toISOString(),
    },
    // Fuel: Shell Petrol ₹2,500 (0 RP Exempt)
    {
      id: 'txn_rg_6',
      userCardId: 'uc_regalia_gold',
      ruleId: 'rg_exempt_0x',
      transactionDate: `${year}-${mStr}-16`,
      postingDate: `${year}-${mStr}-17`,
      merchant: 'Shell Petrol Station',
      amount: 2500,
      isRefund: false,
      notes: 'Fuel fillup (0 RP)',
      createdAt: new Date().toISOString(),
    },

    // --- Amex MRCC Sample Transactions ---
    // Plan.md wireframe target: 3 of 4 ₹1,500 transactions (₹1,850, ₹2,100, ₹1,500) and ₹14,500 total spend
    {
      id: 'txn_amex_1',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-02`,
      postingDate: `${year}-${mStr}-03`,
      merchant: 'Amazon Shopping',
      amount: 1850,
      isRefund: false,
      notes: 'Milestone Txn 1 (>= ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_2',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_fuel_utility',
      transactionDate: `${year}-${mStr}-05`,
      postingDate: `${year}-${mStr}-06`,
      merchant: 'HPCL Fuel Station',
      amount: 2100,
      isRefund: false,
      notes: 'Milestone Txn 2 (>= ₹1,500, fuel 0 base MR, milestone eligible)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_3',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-09`,
      postingDate: `${year}-${mStr}-10`,
      merchant: 'Reliance Retail',
      amount: 1500,
      isRefund: false,
      notes: 'Milestone Txn 3 (>= ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_4',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_fuel_utility',
      transactionDate: `${year}-${mStr}-12`,
      postingDate: `${year}-${mStr}-13`,
      merchant: 'Tata Power Electricity Bill',
      amount: 1450,
      isRefund: false,
      notes: 'Utility bill (< ₹1,500, counts toward ₹20k spend)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_5',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-14`,
      postingDate: `${year}-${mStr}-15`,
      merchant: 'Blinkit Instant Grocery',
      amount: 1400,
      isRefund: false,
      notes: 'Grocery spend (< ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_6',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-16`,
      postingDate: `${year}-${mStr}-17`,
      merchant: 'Apollo Pharmacy',
      amount: 1400,
      isRefund: false,
      notes: 'Pharmacy (< ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_7',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-18`,
      postingDate: `${year}-${mStr}-19`,
      merchant: 'Zomato Dining',
      amount: 1400,
      isRefund: false,
      notes: 'Dining (< ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_8',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-20`,
      postingDate: `${year}-${mStr}-21`,
      merchant: 'BookMyShow Movies',
      amount: 1400,
      isRefund: false,
      notes: 'Movie tickets (< ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_9',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-22`,
      postingDate: `${year}-${mStr}-23`,
      merchant: 'Zara Fashion',
      amount: 1400,
      isRefund: false,
      notes: 'Apparel (< ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'txn_amex_10',
      userCardId: 'uc_amex_mrcc',
      ruleId: 'mrcc_standard',
      transactionDate: `${year}-${mStr}-24`,
      postingDate: `${year}-${mStr}-25`,
      merchant: 'Uber Rides',
      amount: 600,
      isRefund: false,
      notes: 'Cab commute (< ₹1,500)',
      createdAt: new Date().toISOString(),
    },
    // Total Amex spend = 1850 + 2100 + 1500 + 1450 + 1400 + 1400 + 1400 + 1400 + 1400 + 600 = ₹14,500!
    // Exact qualifying count >= ₹1,500 = 3 of 4! Remaining spend to ₹20,000 = ₹5,500!
  ];

  return {
    userCards,
    cardTemplates: DEFAULT_CARD_TEMPLATES,
    transactions,
  };
}

const DELETED_TEMPLATES_KEY = 'ccr_deleted_templates_v1';

export function loadDeletedTemplateIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeletedTemplateIds(ids: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DELETED_TEMPLATES_KEY, JSON.stringify(ids));
  }
}

export function loadCardTemplates(): CardTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_CARD_TEMPLATES;
  try {
    const deletedIds = new Set(loadDeletedTemplateIds());
    const raw = localStorage.getItem(STORAGE_KEYS.CARD_TEMPLATES);
    if (!raw) {
      const filteredDefaults = DEFAULT_CARD_TEMPLATES.filter((d) => !deletedIds.has(d.id));
      saveCardTemplates(filteredDefaults);
      return filteredDefaults;
    }
    const parsed: CardTemplate[] = JSON.parse(raw);
    const validParsed = parsed.filter((c: CardTemplate) => !deletedIds.has(c.id));
    
    // Ensure all default templates are present in case new defaults were added, unless deleted
    const ids = new Set(validParsed.map((c: CardTemplate) => c.id));
    for (const d of DEFAULT_CARD_TEMPLATES) {
      if (!ids.has(d.id) && !deletedIds.has(d.id)) {
        validParsed.push(d);
      }
    }
    return validParsed;
  } catch (e) {
    console.error('Error loading card templates:', e);
    return DEFAULT_CARD_TEMPLATES;
  }
}

export function saveCardTemplates(templates: CardTemplate[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CARD_TEMPLATES, JSON.stringify(templates));
  }
}

export function saveCardTemplate(template: CardTemplate): void {
  // If template was previously deleted, un-delete it
  const deleted = loadDeletedTemplateIds();
  if (deleted.includes(template.id)) {
    saveDeletedTemplateIds(deleted.filter((id) => id !== template.id));
  }

  const current = loadCardTemplates();
  const idx = current.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    current[idx] = template;
  } else {
    current.push(template);
  }
  saveCardTemplates(current);
}

export function deleteCardTemplate(templateId: string): void {
  const deleted = loadDeletedTemplateIds();
  if (!deleted.includes(templateId)) {
    deleted.push(templateId);
    saveDeletedTemplateIds(deleted);
  }
  const current = loadCardTemplates().filter((t) => t.id !== templateId);
  saveCardTemplates(current);
}

export function resetCardTemplates(): CardTemplate[] {
  saveDeletedTemplateIds([]);
  saveCardTemplates(DEFAULT_CARD_TEMPLATES);
  return DEFAULT_CARD_TEMPLATES;
}

export function loadUserCards(): UserCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_CARDS);
    if (!raw) {
      const sample = getInitialSampleData();
      saveUserCards(sample.userCards);
      saveTransactions(sample.transactions);
      return sample.userCards;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading user cards:', e);
    return [];
  }
}

export function saveUserCards(cards: UserCard[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USER_CARDS, JSON.stringify(cards));
  }
}

export function saveUserCard(card: UserCard): void {
  const current = loadUserCards();
  const idx = current.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    current[idx] = card;
  } else {
    current.push(card);
  }
  saveUserCards(current);
}

export function deleteUserCard(cardId: string): void {
  const current = loadUserCards().filter((c) => c.id !== cardId);
  saveUserCards(current);
  // Also remove associated transactions
  const txns = loadTransactions().filter((t) => t.userCardId !== cardId);
  saveTransactions(txns);
}

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const sample = getInitialSampleData();
      saveTransactions(sample.transactions);
      return sample.transactions;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions:', e);
    return [];
  }
}

export function saveTransactions(txns: Transaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  }
}

export function addTransaction(txn: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const newTxn: Transaction = {
    ...txn,
    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  const current = loadTransactions();
  current.unshift(newTxn);
  saveTransactions(current);
  return newTxn;
}

export function updateTransaction(txn: Transaction): void {
  const current = loadTransactions();
  const idx = current.findIndex((t) => t.id === txn.id);
  if (idx >= 0) {
    current[idx] = txn;
    saveTransactions(current);
  }
}

export function deleteTransaction(txnId: string): void {
  const current = loadTransactions().filter((t) => t.id !== txnId);
  saveTransactions(current);
}

export function resetAllToSampleData(): void {
  const sample = getInitialSampleData();
  saveCardTemplates(sample.cardTemplates);
  saveUserCards(sample.userCards);
  saveTransactions(sample.transactions);
}

export function exportBackupJSON(): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userCards: loadUserCards(),
      cardTemplates: loadCardTemplates(),
      transactions: loadTransactions(),
    },
    null,
    2
  );
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.userCards && Array.isArray(data.userCards)) {
      saveUserCards(data.userCards);
    }
    if (data.cardTemplates && Array.isArray(data.cardTemplates)) {
      saveCardTemplates(data.cardTemplates);
    }
    if (data.transactions && Array.isArray(data.transactions)) {
      saveTransactions(data.transactions);
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup:', e);
    return false;
  }
}

/**
 * Push all local cards, custom templates, and transactions up to Supabase for the signed-in user
 */
export async function pushLocalDataToSupabase(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  try {
    const userCards = loadUserCards();
    const cardTemplates = loadCardTemplates().filter((t) => t.isCustom);
    const transactions = loadTransactions();

    // 1. Sync Custom Card Templates
    for (const t of cardTemplates) {
      await supabase.from('card_templates').upsert({
        id: t.id,
        user_id: userId,
        template_json: t,
        is_custom: true,
        updated_at: new Date().toISOString(),
      });
    }

    // 2. Sync User Cards
    for (const c of userCards) {
      await supabase.from('user_cards').upsert({
        id: c.id,
        user_id: userId,
        card_id: c.cardTemplateId,
        nickname: c.nickname,
        last4: c.last4,
        billing_cycle_day: c.billingCycleDay,
        template_override: c.templateOverride || null,
      });
    }

    // 3. Sync Transactions
    for (const txn of transactions) {
      await supabase.from('transactions').upsert({
        id: txn.id,
        user_id: userId,
        user_card_id: txn.userCardId,
        rule_id: txn.ruleId,
        transaction_date: txn.transactionDate,
        posting_date: txn.postingDate || null,
        merchant: txn.merchant,
        amount: txn.amount,
        is_refund: txn.isRefund,
        related_transaction_id: txn.relatedTransactionId || null,
        notes: txn.notes || null,
      });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Failed to push data to Supabase:', err);
    return { success: false, error: err?.message || 'Upload failed' };
  }
}

/**
 * Fetch cards, custom templates, and transactions from Supabase for the signed-in user and update local cache
 */
export async function fetchUserDataFromSupabase(userId: string): Promise<{ success: boolean; hasData: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, hasData: false, error: 'Supabase client not initialized' };

  try {
    // 1. Fetch user cards
    const { data: dbCards, error: cardsErr } = await supabase
      .from('user_cards')
      .select('*')
      .eq('user_id', userId);

    if (cardsErr) throw cardsErr;

    // 2. Fetch custom templates
    const { data: dbTemplates, error: tmplErr } = await supabase
      .from('card_templates')
      .select('*')
      .eq('user_id', userId);

    if (tmplErr) throw tmplErr;

    // 3. Fetch transactions
    const { data: dbTxns, error: txnsErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (txnsErr) throw txnsErr;

    const hasData = Boolean(dbCards && dbCards.length > 0);

    if (hasData) {
      // Map user cards
      const mappedCards: UserCard[] = dbCards.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        cardTemplateId: c.card_id,
        nickname: c.nickname || '',
        last4: c.last4 || undefined,
        billingCycleDay: c.billing_cycle_day || 1,
        templateOverride: c.template_override || undefined,
        createdAt: c.created_at,
      }));
      saveUserCards(mappedCards);

      // Map custom templates
      if (dbTemplates && dbTemplates.length > 0) {
        const currentTemplates = loadCardTemplates();
        const map = new Map<string, CardTemplate>(currentTemplates.map((t) => [t.id, t]));
        for (const t of dbTemplates) {
          if (t.template_json) {
            map.set(t.id, t.template_json as CardTemplate);
          }
        }
        saveCardTemplates(Array.from(map.values()));
      }

      // Map transactions
      if (dbTxns) {
        const mappedTxns: Transaction[] = dbTxns.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          userCardId: t.user_card_id,
          ruleId: t.rule_id,
          transactionDate: t.transaction_date,
          postingDate: t.posting_date || null,
          merchant: t.merchant,
          amount: parseFloat(t.amount) || 0,
          isRefund: Boolean(t.is_refund),
          relatedTransactionId: t.related_transaction_id || null,
          notes: t.notes || undefined,
          createdAt: t.created_at,
        }));
        saveTransactions(mappedTxns);
      }
    }

    return { success: true, hasData };
  } catch (err: any) {
    console.error('Failed to fetch data from Supabase:', err);
    return { success: false, hasData: false, error: err?.message || 'Fetch failed' };
  }
}
