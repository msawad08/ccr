import JSON5 from 'json5';
import { CardTemplate } from '../types/card';

/**
 * Standard JSON5 schema documentation with comprehensive instructions for Generative AI (Gemini / ChatGPT)
 */
export const CARD_TEMPLATE_JSON5_SCHEMA_DOC = `// CardCap Card Template Schema Specification (JSON5)
// This schema defines credit card reward rules, caps, milestones, and calculation models.
{
  // Unique machine ID (letters, numbers, underscores)
  id: "card_id_example",

  // Human-readable card details
  name: "Bank Name Card Model",
  issuer: "HDFC Bank / American Express / SBI Card / Axis Bank / ICICI Bank",
  network: "Visa", // "Visa" | "Mastercard" | "Amex" | "RuPay" | "Diners" | "Other"
  currency: "INR",
  pointName: "RP", // "RP" | "MR Points" | "Cashback ₹" | "Miles"
  pointValueInInr: 0.50, // Monetary redemption value per point in INR (e.g. 0.25, 0.65, 1.00)
  statementCeilingPoints: null, // Optional cycle cap (e.g. 50000) or null for unlimited

  // Visual Theme
  theme: {
    gradientFrom: "from-blue-700",
    gradientTo: "to-zinc-950",
    accentColor: "blue-400",
    cardTextColor: "text-blue-100",
    tagBg: "bg-blue-500/20 text-blue-300 border-blue-500/30"
  },

  // Base Accrual Rule
  baseRule: {
    spendStep: 100, // e.g. 200 for HDFC (5 RP/₹200), 50 for Amex (1 MR/₹50), 100 for SBI (1% / ₹100)
    pointsPerStep: 1, // Points earned per spendStep
    // Calculation Mode:
    // 'floor' => Math.floor(spend / step) * points (e.g. standard HDFC rule)
    // 'direct_percentage' => (spend * points) / step (e.g. SBI Cashback 5% exact cashback even on non-multiples)
    // 'proportional' => proportional fractional points
    // 'round' => round to nearest step
    calculationMode: "direct_percentage",
    excludedCategoryIds: ["exempt_spends"]
  },

  // Shared Cap Groups (Optional for nested or shared sub-caps)
  capGroups: {
    // Example: online_5x or smartbuy
    online_cap: {
      id: "online_cap",
      name: "Online Spends Cap",
      monthlyBonusCap: 5000, // Max monthly points
      dailyBonusCap: null, // Optional daily limit (e.g. 2000 for SmartBuy)
      parentGroupId: null, // Optional parent cap group for nested sub-caps
      // 'bonus_only' => caps only bonus points (e.g. HDFC SmartBuy)
      // 'total_points' => caps entire reward (base + bonus), e.g. SBI Cashback 5% online max ₹5,000
      capTarget: "total_points",
      description: "Monthly cap on online cashback"
    }
  },

  // Reward Rules (Categories & Multipliers)
  rewardRules: [
    {
      id: "rule_online_5x",
      name: "Online Spends (5% Cashback)",
      categoryKey: "online",
      baseRateSpend: 100,
      baseRatePoints: 1,
      bonusMultiplier: 4, // 1 base + 4 bonus = 5X total (5%)
      capGroupId: "online_cap",
      capTarget: "total_points", // Entire 5% capped at monthly limit
      notes: "5% cashback on online merchant transactions"
    },
    {
      id: "rule_offline_1x",
      name: "Offline Retail (1%)",
      categoryKey: "retail",
      baseRateSpend: 100,
      baseRatePoints: 1,
      bonusMultiplier: 0,
      notes: "1% unlimited cashback on standard retail"
    },
    {
      id: "exempt_spends",
      name: "Exempt Spends (Fuel, Rent, Utilities, Wallet) (0%)",
      categoryKey: "exempt",
      baseRateSpend: 100,
      baseRatePoints: 0,
      bonusMultiplier: 0,
      isExempt: true,
      notes: "No reward points on excluded transactions"
    }
  ],

  // Milestone Rules (Monthly, Quarterly, Annual, Spend Vouchers, Fee Waivers & Lounge Access)
  milestoneRules: [
    // Quarterly Milestone Example (e.g. Regalia Gold ₹1.5L voucher or ₹50k lounge visits)
    {
      id: "ms_quarterly_lounge",
      title: "Quarterly Lounge Access",
      description: "Spend ₹50,000 in a calendar quarter to unlock 2 complimentary airport lounge visits",
      type: "cumulative_spend", // "cumulative_spend" | "transaction_count"
      period: "quarterly", // "calendar_month" | "quarterly" | "annual" | "billing_cycle"
      targetSpend: 50000,
      benefitType: "lounge_access", // "lounge_access" | "voucher" | "fee_waiver" | "points"
      benefitValue: "2 Lounge Visits Unlocked",
      loungeVisitsCount: 2,
      excludedRuleIds: ["exempt_spends"], // Granular rule IDs that do NOT count
      badgeText: "Quarterly Lounge"
    },
    // Annual Fee Waiver Milestone
    {
      id: "ms_annual_fee_waiver",
      title: "Annual Fee Waiver",
      description: "Spend ₹2,00,000 in an annual year to waive renewal fee",
      type: "cumulative_spend",
      period: "annual",
      targetSpend: 200000,
      benefitType: "fee_waiver",
      benefitValue: "Annual Fee Waived (₹999 Saved)",
      excludedRuleIds: ["exempt_spends"],
      badgeText: "Fee Waiver"
    }
  ]
}`;

/**
 * Generate a complete AI Prompt for Gemini or ChatGPT with schema and instructions
 */
export function generateGeminiPrompt(cardName: string = 'Axis Atlas Credit Card'): string {
  return `You are a credit card rewards specialist. I need a valid JSON5 card template for "${cardName}" to use in the CardCap Rewards Tracker web app.

Please research the exact current reward structure, base accrual rate, category multipliers, monthly/daily caps, and milestones (monthly, quarterly, annual fee waiver, lounge access, spend vouchers) for "${cardName}".

Return ONLY a valid JSON5 object strictly conforming to the following CardCap JSON5 Schema specification (do not wrap in explanations, only the raw JSON5):

${CARD_TEMPLATE_JSON5_SCHEMA_DOC}

Key Requirements:
1. "calculationMode": use "direct_percentage" for cashback/direct cards (e.g. SBI Cashback 5%), or "floor" for bank points (e.g. HDFC 5 RP per ₹200).
2. "capTarget": set "total_points" if capping applies to the entire multiplier (like SBI CB 5%), or "bonus_only" if base points remain uncapped (like HDFC SmartBuy).
3. "milestoneRules": include quarterly/annual milestones (e.g., fee waivers, lounge access with spend requirements, milestone vouchers). Specify "excludedRuleIds" or "eligibleRuleIds" for granular category inclusion.
4. Ensure all category keys and rule IDs are unique.
5. Use JSON5 format (comments allowed).
`;
}

/**
 * Parse and validate a JSON or JSON5 string into a safe CardTemplate object
 */
export function parseAndValidateJSON5Card(input: string): { success: boolean; card?: CardTemplate; error?: string } {
  try {
    let clean = input.trim();
    // Strip markdown code fences if provided by LLM (```json5 ... ``` or ```json ... ```)
    if (clean.startsWith('```')) {
      const firstLineEnd = clean.indexOf('\n');
      const lastLineStart = clean.lastIndexOf('```');
      if (firstLineEnd !== -1 && lastLineStart !== -1 && lastLineStart > firstLineEnd) {
        clean = clean.substring(firstLineEnd + 1, lastLineStart).trim();
      }
    }

    const parsed = JSON5.parse(clean);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Parsed content is not a valid JSON object.' };
    }

    if (!parsed.name || typeof parsed.name !== 'string') {
      return { success: false, error: 'Missing required field: "name" (string).' };
    }

    // Default missing properties safely
    const card: CardTemplate = {
      id: parsed.id ? String(parsed.id).replace(/\s+/g, '_').toLowerCase() : `custom_${Date.now()}`,
      name: String(parsed.name).trim(),
      issuer: parsed.issuer ? String(parsed.issuer).trim() : 'Custom Bank',
      network: parsed.network || 'Visa',
      currency: parsed.currency || 'INR',
      pointName: parsed.pointName || 'Points',
      pointValueInInr: typeof parsed.pointValueInInr === 'number' ? parsed.pointValueInInr : 0.5,
      statementCeilingPoints: parsed.statementCeilingPoints ?? null,
      theme: parsed.theme || {
        gradientFrom: 'from-indigo-700',
        gradientTo: 'to-zinc-950',
        accentColor: 'indigo-400',
        cardTextColor: 'text-indigo-100',
        tagBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      },
      baseRule: {
        spendStep: parsed.baseRule?.spendStep || 100,
        pointsPerStep: parsed.baseRule?.pointsPerStep ?? 1,
        calculationMode: parsed.baseRule?.calculationMode || 'floor',
        excludedCategoryIds: parsed.baseRule?.excludedCategoryIds || [],
      },
      capGroups: parsed.capGroups || {},
      rewardRules: Array.isArray(parsed.rewardRules) ? parsed.rewardRules : [],
      milestoneRules: Array.isArray(parsed.milestoneRules) ? parsed.milestoneRules : [],
      isCustom: true,
    };

    if (card.rewardRules.length === 0) {
      card.rewardRules.push({
        id: `rule_base_${Date.now()}`,
        name: 'Standard Retail',
        categoryKey: 'retail',
        baseRateSpend: card.baseRule.spendStep,
        baseRatePoints: card.baseRule.pointsPerStep,
        bonusMultiplier: 0,
      });
    }

    return { success: true, card };
  } catch (err: any) {
    return { success: false, error: `JSON5 Syntax Error: ${err.message || 'Failed to parse JSON5.'}` };
  }
}

/**
 * Export any card template as clean, formatted JSON5 string
 */
export function exportCardAsJSON5(card: CardTemplate): string {
  try {
    return JSON5.stringify(card, { space: 2, quote: '"' });
  } catch {
    return JSON.stringify(card, null, 2);
  }
}
