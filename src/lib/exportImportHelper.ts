import JSON5 from 'json5';
import * as XLSX from 'xlsx';
import { UserCard, CardTemplate, Transaction } from '../types/card';
import {
  loadUserCards,
  saveUserCards,
  loadCardTemplates,
  saveCardTemplates,
  loadTransactions,
  saveTransactions,
} from './storage';
import { computeRawBasePoints, computeRawBonusPoints } from './rewardsEngine';

export interface ExportBackupData {
  version: string;
  exportedAt: string;
  app: string;
  userCards: UserCard[];
  cardTemplates: CardTemplate[];
  transactions: Transaction[];
}

/**
 * Export complete CardCap data as formatted JSON5 file
 */
export function exportDataToJSON5(): void {
  const userCards = loadUserCards();
  const cardTemplates = loadCardTemplates();
  const transactions = loadTransactions();

  const backupData: ExportBackupData = {
    version: '2.0',
    app: 'CardCap Rewards & Milestone Tracker',
    exportedAt: new Date().toISOString(),
    userCards,
    cardTemplates,
    transactions,
  };

  const json5String = `// ==============================================================================
// CardCap Application Full Data Backup (JSON5)
// Exported: ${new Date().toLocaleString()}
// This file contains all your cards, custom reward rules, caps, milestones, and transactions.
// You can import this file on any other device running CardCap.
// ==============================================================================
${JSON5.stringify(backupData, null, 2)}
`;

  const blob = new Blob([json5String], { type: 'application/json5;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `cardcap_backup_${dateStr}.json5`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import and restore CardCap data from JSON5 or JSON content
 */
export function importDataFromJSON5(rawContent: string): {
  success: boolean;
  message: string;
  counts?: { cards: number; templates: number; transactions: number };
} {
  try {
    const data = JSON5.parse(rawContent);

    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file: Root must be an object.' };
    }

    let cardsCount = 0;
    let templatesCount = 0;
    let txnsCount = 0;

    if (Array.isArray(data.userCards) && data.userCards.length > 0) {
      saveUserCards(data.userCards);
      cardsCount = data.userCards.length;
    }

    if (Array.isArray(data.cardTemplates) && data.cardTemplates.length > 0) {
      saveCardTemplates(data.cardTemplates);
      templatesCount = data.cardTemplates.length;
    }

    if (Array.isArray(data.transactions) && data.transactions.length > 0) {
      saveTransactions(data.transactions);
      txnsCount = data.transactions.length;
    }

    return {
      success: true,
      message: `Successfully restored ${cardsCount} cards, ${templatesCount} card templates, and ${txnsCount} transactions!`,
      counts: { cards: cardsCount, templates: templatesCount, transactions: txnsCount },
    };
  } catch (err: any) {
    console.error('Failed to parse JSON5 backup:', err);
    return {
      success: false,
      message: `Parse Error: ${err?.message || 'Invalid JSON5/JSON format.'}`,
    };
  }
}

/**
 * Export transactions and cards to a multi-sheet Microsoft Excel (.xlsx) workbook
 */
export function exportDataToExcel(): void {
  const userCards = loadUserCards();
  const cardTemplates = loadCardTemplates();
  const transactions = loadTransactions();

  // Create helper lookup maps
  const cardMap = new Map<string, UserCard>(userCards.map((c) => [c.id, c]));
  const templateMap = new Map<string, CardTemplate>(cardTemplates.map((t) => [t.id, t]));

  // Sheet 1: Transactions
  const txnRows = transactions.map((txn) => {
    const userCard = cardMap.get(txn.userCardId);
    const template = userCard
      ? userCard.templateOverride || templateMap.get(userCard.cardTemplateId)
      : undefined;

    const rule = template?.rewardRules.find((r) => r.id === txn.ruleId) || template?.rewardRules[0];
    let basePoints = 0;
    let bonusPoints = 0;
    let totalPoints = 0;
    let rewardValue = 0;

    if (rule && template) {
      basePoints = computeRawBasePoints(txn.amount, rule, template);
      bonusPoints = computeRawBonusPoints(basePoints, rule);
      totalPoints = basePoints + bonusPoints;
      if (txn.isRefund) {
        basePoints = -basePoints;
        bonusPoints = -bonusPoints;
        totalPoints = -totalPoints;
      }
      rewardValue = Number((totalPoints * (template.pointValueInInr ?? 0.5)).toFixed(2));
    }

    return {
      'Posting Date': txn.postingDate || txn.transactionDate,
      'Transaction Date': txn.transactionDate,
      'Card Nickname': userCard?.nickname || 'Unknown Card',
      'Card Model': template?.name || 'Unknown',
      'Merchant / Description': txn.merchant,
      'Amount (₹)': txn.amount,
      'Type': txn.isRefund ? 'Refund' : 'Debit',
      'Category / Rule': rule?.name || txn.ruleId,
      'Base Points': basePoints,
      'Bonus Points': bonusPoints,
      'Total Points': totalPoints,
      'Estimated Value (₹)': rewardValue,
      'Notes': txn.notes || '',
    };
  });

  // Sheet 2: User Cards Wallet
  const cardRows = userCards.map((c) => {
    const template = c.templateOverride || templateMap.get(c.cardTemplateId);
    return {
      'Card Nickname': c.nickname,
      'Card Model': template?.name || c.cardTemplateId,
      'Bank / Issuer': template?.issuer || 'Unknown',
      'Network': template?.network || 'Visa',
      'Last 4 Digits': c.last4 || 'N/A',
      'Billing Cycle Day': c.billingCycleDay,
      'Point Name': template?.pointName || 'RP',
      'Point Value (₹)': template?.pointValueInInr ?? 0.5,
      'Added On': c.createdAt ? c.createdAt.split('T')[0] : '',
    };
  });

  // Sheet 3: Overall Summary
  const totalSpend = transactions.filter((t) => !t.isRefund).reduce((s, t) => s + t.amount, 0);
  const totalRefunds = transactions.filter((t) => t.isRefund).reduce((s, t) => s + t.amount, 0);
  const netSpend = totalSpend - totalRefunds;

  const summaryRows = [
    { 'Metric': 'Total Spend Volume (₹)', 'Value': totalSpend },
    { 'Metric': 'Total Refunds (₹)', 'Value': totalRefunds },
    { 'Metric': 'Net Spend (₹)', 'Value': netSpend },
    { 'Metric': 'Total Transactions Logged', 'Value': transactions.length },
    { 'Metric': 'Total Cards in Wallet', 'Value': userCards.length },
    { 'Metric': 'Report Generated At', 'Value': new Date().toLocaleString() },
  ];

  // Build Workbook
  const wb = XLSX.utils.book_new();

  const wsTxns = XLSX.utils.json_to_sheet(txnRows);
  const wsCards = XLSX.utils.json_to_sheet(cardRows);
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);

  // Set friendly column widths for Transactions sheet
  wsTxns['!cols'] = [
    { wch: 14 }, // Posting Date
    { wch: 14 }, // Txn Date
    { wch: 20 }, // Card Nickname
    { wch: 22 }, // Card Model
    { wch: 28 }, // Merchant
    { wch: 12 }, // Amount
    { wch: 10 }, // Type
    { wch: 25 }, // Category / Rule
    { wch: 12 }, // Base Points
    { wch: 12 }, // Bonus Points
    { wch: 12 }, // Total Points
    { wch: 16 }, // Value
    { wch: 30 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsTxns, 'Transactions');
  XLSX.utils.book_append_sheet(wb, wsCards, 'My Cards');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `cardcap_export_${dateStr}.xlsx`);
}

/**
 * Export transactions to standard CSV
 */
export function exportDataToCSV(): void {
  const userCards = loadUserCards();
  const cardTemplates = loadCardTemplates();
  const transactions = loadTransactions();

  const cardMap = new Map<string, UserCard>(userCards.map((c) => [c.id, c]));
  const templateMap = new Map<string, CardTemplate>(cardTemplates.map((t) => [t.id, t]));

  const txnRows = transactions.map((txn) => {
    const userCard = cardMap.get(txn.userCardId);
    const template = userCard
      ? userCard.templateOverride || templateMap.get(userCard.cardTemplateId)
      : undefined;

    const rule = template?.rewardRules.find((r) => r.id === txn.ruleId) || template?.rewardRules[0];
    let totalPoints = 0;
    let rewardValue = 0;

    if (rule && template) {
      const basePoints = computeRawBasePoints(txn.amount, rule, template);
      const bonusPoints = computeRawBonusPoints(basePoints, rule);
      totalPoints = basePoints + bonusPoints;
      if (txn.isRefund) {
        totalPoints = -totalPoints;
      }
      rewardValue = Number((totalPoints * (template.pointValueInInr ?? 0.5)).toFixed(2));
    }

    return {
      'Date': txn.postingDate || txn.transactionDate,
      'Card': userCard?.nickname || 'Unknown Card',
      'Merchant': txn.merchant,
      'Amount': txn.amount,
      'Is_Refund': txn.isRefund ? 'YES' : 'NO',
      'Rule': rule?.name || txn.ruleId,
      'Total_Points': totalPoints,
      'Reward_Value_INR': rewardValue,
      'Notes': txn.notes || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(txnRows);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `cardcap_transactions_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
