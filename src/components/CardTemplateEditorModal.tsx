'use client';

import React, { useState } from 'react';
import { CardTemplate, RewardRule, MilestoneRule, CapGroupDefinition } from '../types/card';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  ShieldAlert,
  Check,
  Sparkles,
  Copy,
  Download,
  CheckCheck,
  FileCode,
  AlertCircle,
  ExternalLink,
  Bot
} from 'lucide-react';
import {
  CARD_TEMPLATE_JSON5_SCHEMA_DOC,
  generateGeminiPrompt,
  parseAndValidateJSON5Card,
  exportCardAsJSON5,
} from '../lib/json5CardHelper';

interface CardTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardTemplates: CardTemplate[];
  selectedTemplateId: string;
  onSaveTemplate: (template: CardTemplate) => void;
  onResetTemplates: () => void;
}

export const CardTemplateEditorModal: React.FC<CardTemplateEditorModalProps> = ({
  isOpen,
  onClose,
  cardTemplates,
  selectedTemplateId,
  onSaveTemplate,
  onResetTemplates,
}) => {
  const [activeTemplateId, setActiveTemplateId] = useState(selectedTemplateId || cardTemplates[0]?.id || 'regalia_gold');
  const [template, setTemplate] = useState<CardTemplate>(() => {
    const found = cardTemplates.find((t) => t.id === activeTemplateId) || cardTemplates[0];
    return JSON.parse(JSON.stringify(found));
  });

  const [activeTab, setActiveTab] = useState<'general' | 'base' | 'caps' | 'rules' | 'milestones' | 'ai_studio'>('rules');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // AI Template Studio States
  const [json5Input, setJson5Input] = useState('');
  const [json5Error, setJson5Error] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [aiCardName, setAiCardName] = useState('');

  const handleCopyPrompt = async () => {
    const prompt = generateGeminiPrompt(aiCardName.trim() || template.name);
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([CARD_TEMPLATE_JSON5_SCHEMA_DOC], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cardcap-template-schema.json5';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCardJSON5 = async () => {
    const json5Str = exportCardAsJSON5(template);
    try {
      await navigator.clipboard.writeText(json5Str);
      setCopiedExport(true);
      setTimeout(() => setCopiedExport(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleValidateAndInstallJSON5 = () => {
    setJson5Error(null);
    if (!json5Input.trim()) {
      setJson5Error('Please paste your JSON5 card template content first.');
      return;
    }
    const result = parseAndValidateJSON5Card(json5Input);
    if (!result.success || !result.card) {
      setJson5Error(result.error || 'Failed to parse JSON5 template.');
      return;
    }
    const installedCard = result.card;
    setTemplate(installedCard);
    onSaveTemplate(installedCard);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
    setActiveTab('rules');
  };

  // When switching selected template from dropdown
  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id);
    const found = cardTemplates.find((t) => t.id === id);
    if (found) {
      setTemplate(JSON.parse(JSON.stringify(found)));
    }
  };

  const handleCreateNewTemplate = () => {
    const newId = `custom_card_${Date.now()}`;
    const newTemplate: CardTemplate = {
      id: newId,
      name: 'Custom Rewards Card',
      issuer: 'Custom Bank',
      network: 'Visa',
      currency: 'INR',
      pointName: 'RP',
      pointValueInInr: 0.5,
      statementCeilingPoints: null,
      theme: {
        gradientFrom: 'from-emerald-700',
        gradientTo: 'to-zinc-950',
        accentColor: 'emerald-400',
        cardTextColor: 'text-emerald-100',
        tagBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      },
      baseRule: {
        spendStep: 100,
        pointsPerStep: 2,
        calculationMode: 'floor',
        excludedCategoryIds: [],
      },
      capGroups: {},
      rewardRules: [
        {
          id: `rule_std_${Date.now()}`,
          name: 'Standard Retail (1X)',
          categoryKey: 'retail',
          baseRateSpend: 100,
          baseRatePoints: 2,
          bonusMultiplier: 0,
        },
      ],
      milestoneRules: [],
      isCustom: true,
    };
    setActiveTemplateId(newId);
    setTemplate(newTemplate);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveTemplate(template);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // Rule management helpers
  const handleAddRule = () => {
    const newRule: RewardRule = {
      id: `rule_${Date.now()}`,
      name: 'New Multiplier Category',
      categoryKey: 'custom',
      baseRateSpend: template.baseRule.spendStep,
      baseRatePoints: template.baseRule.pointsPerStep,
      bonusMultiplier: 4, // 5X default
      notes: 'Custom multiplier rule',
    };
    setTemplate({
      ...template,
      rewardRules: [...template.rewardRules, newRule],
    });
  };

  const handleUpdateRule = (index: number, updated: Partial<RewardRule>) => {
    const rules = [...template.rewardRules];
    rules[index] = { ...rules[index], ...updated };
    setTemplate({ ...template, rewardRules: rules });
  };

  const handleDeleteRule = (index: number) => {
    const rules = template.rewardRules.filter((_, i) => i !== index);
    setTemplate({ ...template, rewardRules: rules });
  };

  // Cap Group management helpers
  const handleAddCapGroup = () => {
    const capId = `cap_${Date.now()}`;
    const newGroup: CapGroupDefinition = {
      id: capId,
      name: 'New Shared Cap Group',
      monthlyBonusCap: 3000,
      dailyBonusCap: null,
      description: 'Shared monthly cap',
    };
    setTemplate({
      ...template,
      capGroups: { ...template.capGroups, [capId]: newGroup },
    });
  };

  const handleUpdateCapGroup = (capId: string, updated: Partial<CapGroupDefinition>) => {
    setTemplate({
      ...template,
      capGroups: {
        ...template.capGroups,
        [capId]: { ...template.capGroups[capId], ...updated },
      },
    });
  };

  const handleDeleteCapGroup = (capId: string) => {
    const groups = { ...template.capGroups };
    delete groups[capId];
    setTemplate({ ...template, capGroups: groups });
  };

  // Milestone management helpers
  const handleAddMilestone = () => {
    const newM: MilestoneRule = {
      id: `ms_${Date.now()}`,
      title: 'Monthly Spend Milestone',
      description: 'Spend target in calendar month',
      type: 'cumulative_spend',
      period: 'calendar_month',
      targetSpend: 25000,
      rewardPoints: 1000,
      includeExemptCategories: true,
      badgeText: '₹25k Milestone',
    };
    setTemplate({
      ...template,
      milestoneRules: [...template.milestoneRules, newM],
    });
  };

  const handleUpdateMilestone = (index: number, updated: Partial<MilestoneRule>) => {
    const ms = [...template.milestoneRules];
    ms[index] = { ...ms[index], ...updated };
    setTemplate({ ...template, milestoneRules: ms });
  };

  const handleDeleteMilestone = (index: number) => {
    const ms = template.milestoneRules.filter((_, i) => i !== index);
    setTemplate({ ...template, milestoneRules: ms });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Card Rules & Template Editor</h3>
              <p className="text-xs text-zinc-400">
                Configure caps, bonus multipliers, and milestones to match bank terms or devaluations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {showSavedToast && (
              <span className="flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                <span>Saved & Applied!</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-zinc-800/80 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400 font-medium">Select Card:</span>
            <select
              value={template.id}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
            >
              {cardTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.issuer})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateNewTemplate}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Card Template</span>
            </button>
            <button
              onClick={onResetTemplates}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-amber-400 text-xs transition-colors"
              title="Reset all templates back to factory default bank terms"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex space-x-1 py-3 border-b border-zinc-800/60 text-xs flex-shrink-0">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'rules'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Multiplier Rules ({template.rewardRules.length})
          </button>
          <button
            onClick={() => setActiveTab('caps')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'caps'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cap Groups & Limits ({Object.keys(template.capGroups).length})
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'milestones'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Milestones ({template.milestoneRules.length})
          </button>
          <button
            onClick={() => setActiveTab('base')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'base'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Base Accrual
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Card Info
          </button>
          <button
            onClick={() => setActiveTab('ai_studio')}
            className={`px-3 py-1.5 rounded-xl font-medium flex items-center space-x-1.5 transition-colors ${
              activeTab === 'ai_studio'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-purple-400 hover:text-purple-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Studio (JSON5)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* TAB 1: Multiplier Rules */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Spend Categories & Multipliers</h4>
                  <p className="text-xs text-zinc-400">
                    Define bonus multipliers (e.g. 4 for 5X total) and assign to cap groups.
                  </p>
                </div>
                <button
                  onClick={handleAddRule}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="space-y-3">
                {template.rewardRules.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-zinc-400 font-medium">Category / Rule Name</label>
                        <input
                          type="text"
                          value={rule.name}
                          onChange={(e) => handleUpdateRule(idx, { name: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Cap Group</label>
                        <select
                          value={rule.capGroupId || ''}
                          onChange={(e) => handleUpdateRule(idx, { capGroupId: e.target.value || null })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white"
                        >
                          <option value="">None (Independent)</option>
                          {Object.values(template.capGroups).map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-zinc-400">Bonus Multiplier</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={rule.bonusMultiplier}
                          onChange={(e) =>
                            handleUpdateRule(idx, { bonusMultiplier: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                          title="e.g. 4 for 5X, 9 for 10X, 0 for 1X"
                        />
                        <span className="text-[10px] text-zinc-500">
                          {rule.bonusMultiplier > 0 ? `${rule.bonusMultiplier + 1}X Total Points` : '1X Base'}
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400">Monthly Bonus Cap</label>
                        <input
                          type="number"
                          placeholder="No cap"
                          value={rule.monthlyBonusCap ?? ''}
                          onChange={(e) =>
                            handleUpdateRule(idx, {
                              monthlyBonusCap: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400">Daily Bonus Cap</label>
                        <input
                          type="number"
                          placeholder="No cap"
                          value={rule.dailyBonusCap ?? ''}
                          onChange={(e) =>
                            handleUpdateRule(idx, {
                              dailyBonusCap: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                        />
                      </div>

                      <div className="flex items-end justify-between">
                        <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-zinc-400">
                          <input
                            type="checkbox"
                            checked={rule.isExempt || false}
                            onChange={(e) => handleUpdateRule(idx, { isExempt: e.target.checked })}
                            className="rounded text-amber-500"
                          />
                          <span>Exempt (0 RP)</span>
                        </label>
                        <button
                          onClick={() => handleDeleteRule(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Cap Groups */}
          {activeTab === 'caps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Shared Cap Groups (Sub-Caps & Limits)</h4>
                  <p className="text-xs text-zinc-400">
                    Handle complex limits like SmartBuy overall 4,000 bonus RP and voucher 3,000 RP sub-cap.
                  </p>
                </div>
                <button
                  onClick={handleAddCapGroup}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cap Group</span>
                </button>
              </div>

              <div className="space-y-3">
                {Object.values(template.capGroups).map((group) => (
                  <div
                    key={group.id}
                    className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Group Name</label>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => handleUpdateCapGroup(group.id, { name: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Parent Group (Sub-cap nesting)</label>
                        <select
                          value={group.parentGroupId || ''}
                          onChange={(e) =>
                            handleUpdateCapGroup(group.id, { parentGroupId: e.target.value || null })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white"
                        >
                          <option value="">None (Top Level)</option>
                          {Object.values(template.capGroups)
                            .filter((g) => g.id !== group.id)
                            .map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-zinc-400">Monthly Bonus Cap (Points)</label>
                        <input
                          type="number"
                          value={group.monthlyBonusCap ?? ''}
                          onChange={(e) =>
                            handleUpdateCapGroup(group.id, {
                              monthlyBonusCap: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">Daily Bonus Cap (Points)</label>
                        <input
                          type="number"
                          placeholder="No daily cap"
                          value={group.dailyBonusCap ?? ''}
                          onChange={(e) =>
                            handleUpdateCapGroup(group.id, {
                              dailyBonusCap: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400">Capping Target Scope</label>
                        <select
                          value={group.capTarget || 'bonus_only'}
                          onChange={(e) =>
                            handleUpdateCapGroup(group.id, {
                              capTarget: e.target.value as 'bonus_only' | 'total_points',
                            })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-white text-xs"
                          title="bonus_only: caps multiplier bonus only; total_points: caps entire reward (e.g. SBI Cashback 5%)"
                        >
                          <option value="bonus_only">Bonus Only (e.g. SmartBuy 4X)</option>
                          <option value="total_points">Entire Points/Cashback (e.g. SBI 5%)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteCapGroup(group.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors flex items-center space-x-1 text-xs"
                        title="Delete Cap Group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Group</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Milestones */}
          {activeTab === 'milestones' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Card Milestones</h4>
                  <p className="text-xs text-zinc-400">
                    Define spend thresholds or swipe count milestones (like Amex MRCC 4x ₹1.5k).
                  </p>
                </div>
                <button
                  onClick={handleAddMilestone}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-3">
                {template.milestoneRules.map((m, idx) => {
                  const benefitType = m.benefitType || (m.loungeVisitsCount ? 'lounge_access' : m.voucherValue ? 'voucher' : 'points');
                  const period = m.period || 'calendar_month';
                  return (
                    <div
                      key={m.id || idx}
                      className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3.5"
                    >
                      {/* Top Row: Title, Period, Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-1">
                          <label className="text-[11px] text-zinc-400 font-medium">Milestone Title</label>
                          <input
                            type="text"
                            value={m.title}
                            onChange={(e) => handleUpdateMilestone(idx, { title: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium">Evaluation Period</label>
                          <select
                            value={period}
                            onChange={(e) =>
                              handleUpdateMilestone(idx, { period: e.target.value as any })
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            <option value="calendar_month">Calendar Month</option>
                            <option value="quarterly">Quarterly (Jan-Mar, Apr-Jun, etc.)</option>
                            <option value="annual">Annual / Calendar Year</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium">Milestone Metric</label>
                          <select
                            value={m.type}
                            onChange={(e) =>
                              handleUpdateMilestone(idx, { type: e.target.value as any })
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white"
                          >
                            <option value="cumulative_spend">Cumulative Spend (₹ Target)</option>
                            <option value="transaction_count">Transaction Count (e.g. 4x ₹1.5k)</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Spend Target and Benefit Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        {m.type === 'transaction_count' ? (
                          <>
                            <div>
                              <label className="text-[11px] text-zinc-400">Target Swipe Count</label>
                              <input
                                type="number"
                                value={m.targetCount || 4}
                                onChange={(e) =>
                                  handleUpdateMilestone(idx, { targetCount: parseInt(e.target.value, 10) || 1 })
                                }
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-zinc-400">Min Spend per Txn (₹)</label>
                              <input
                                type="number"
                                value={m.minTxnAmount || 1500}
                                onChange={(e) =>
                                  handleUpdateMilestone(idx, { minTxnAmount: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                              />
                            </div>
                          </>
                        ) : (
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-zinc-400">Target Spend (₹)</label>
                            <input
                              type="number"
                              value={m.targetSpend || 25000}
                              onChange={(e) =>
                                handleUpdateMilestone(idx, { targetSpend: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                            />
                          </div>
                        )}

                        <div>
                          <label className="text-[11px] text-zinc-400">Reward / Benefit Type</label>
                          <select
                            value={benefitType}
                            onChange={(e) =>
                              handleUpdateMilestone(idx, { benefitType: e.target.value as any })
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-white text-xs"
                          >
                            <option value="points">Reward Points</option>
                            <option value="voucher">Gift / Travel Voucher</option>
                            <option value="lounge_access">Lounge Access Passes</option>
                            <option value="fee_waiver">Annual Fee Waiver</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Benefit Specific Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/60">
                        {benefitType === 'points' && (
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-zinc-400">Reward Points Unlocked</label>
                            <input
                              type="number"
                              value={m.rewardPoints || 0}
                              onChange={(e) =>
                                handleUpdateMilestone(idx, { rewardPoints: parseInt(e.target.value, 10) || 0 })
                              }
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                            />
                          </div>
                        )}

                        {benefitType === 'voucher' && (
                          <>
                            <div>
                              <label className="text-[11px] text-zinc-400">Voucher Value (₹)</label>
                              <input
                                type="number"
                                placeholder="e.g. 1500"
                                value={m.voucherValue || ''}
                                onChange={(e) =>
                                  handleUpdateMilestone(idx, {
                                    voucherValue: e.target.value ? parseFloat(e.target.value) : undefined,
                                    rewardPoints: e.target.value ? parseFloat(e.target.value) : 0,
                                  })
                                }
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] text-zinc-400">Voucher Brand / Partners</label>
                              <input
                                type="text"
                                placeholder="e.g. Flights / Marriott / M&S"
                                value={m.voucherBrand || ''}
                                onChange={(e) =>
                                  handleUpdateMilestone(idx, { voucherBrand: e.target.value })
                                }
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white"
                              />
                            </div>
                          </>
                        )}

                        {benefitType === 'lounge_access' && (
                          <>
                            <div>
                              <label className="text-[11px] text-zinc-400">Complimentary Visits</label>
                              <input
                                type="number"
                                placeholder="e.g. 2"
                                value={m.loungeVisitsCount || 2}
                                onChange={(e) =>
                                  handleUpdateMilestone(idx, {
                                    loungeVisitsCount: parseInt(e.target.value, 10) || 1,
                                    benefitValue: `${e.target.value} Lounge Visits`,
                                  })
                                }
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[11px] text-zinc-400">Lounge Benefit Notes</label>
                              <input
                                type="text"
                                placeholder="e.g. 2 Domestic Airport Lounge Visits per Quarter"
                                value={m.benefitValue || '2 Airport Lounge Visits'}
                                onChange={(e) =>
                                  handleUpdateMilestone(idx, { benefitValue: e.target.value })
                                }
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white"
                              />
                            </div>
                          </>
                        )}

                        {benefitType === 'fee_waiver' && (
                          <div className="sm:col-span-3">
                            <label className="text-[11px] text-zinc-400">Fee Waiver Benefit Text</label>
                            <input
                              type="text"
                              placeholder="e.g. Annual Fee Waived (₹2,500 Saved)"
                              value={m.benefitValue || 'Annual Membership Fee Waived'}
                              onChange={(e) =>
                                handleUpdateMilestone(idx, { benefitValue: e.target.value })
                              }
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* Row 4: Granular Category & Rule Eligibility */}
                      <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400">
                          <span className="font-semibold text-zinc-300">
                            Eligible Spend Categories / Multiplier Rules:
                          </span>
                          <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-zinc-400 mt-1 sm:mt-0">
                            <input
                              type="checkbox"
                              checked={m.includeExemptCategories ?? true}
                              onChange={(e) =>
                                handleUpdateMilestone(idx, { includeExemptCategories: e.target.checked })
                              }
                              className="rounded text-amber-500"
                            />
                            <span>Count non-rewarding/exempt spends (wallet, rent, etc.)</span>
                          </label>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {template.rewardRules.map((rule) => {
                            const isExcluded = m.excludedRuleIds?.includes(rule.id) || false;
                            return (
                              <button
                                key={rule.id}
                                type="button"
                                onClick={() => {
                                  const currentExcluded = m.excludedRuleIds || [];
                                  const nextExcluded = isExcluded
                                    ? currentExcluded.filter((id) => id !== rule.id)
                                    : [...currentExcluded, rule.id];
                                  handleUpdateMilestone(idx, { excludedRuleIds: nextExcluded });
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1 ${
                                  isExcluded
                                    ? 'bg-zinc-900 text-zinc-500 border-zinc-800 line-through'
                                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                }`}
                                title={isExcluded ? 'Click to count this rule in milestone' : 'Click to exclude this rule from milestone'}
                              >
                                <span>{rule.name}</span>
                                <span className="text-[10px] opacity-75">{isExcluded ? '(Excluded)' : '(Counts)'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Delete Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleDeleteMilestone(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors flex items-center space-x-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Milestone</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Base Accrual */}
          {activeTab === 'base' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <h4 className="text-sm font-semibold text-white">Base Accrual Settings</h4>
                <p className="text-xs text-zinc-400">
                  Standard points earned per spend step (e.g., 5 RP per ₹200 for HDFC, 1 MR per ₹50 for Amex).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Points Per Step</label>
                  <input
                    type="number"
                    value={template.baseRule.pointsPerStep}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        baseRule: {
                          ...template.baseRule,
                          pointsPerStep: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Spend Step (₹)</label>
                  <input
                    type="number"
                    value={template.baseRule.spendStep}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        baseRule: {
                          ...template.baseRule,
                          spendStep: parseFloat(e.target.value) || 1,
                        },
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Rounding / Calculation Mode</label>
                <select
                  value={template.baseRule.calculationMode}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      baseRule: {
                        ...template.baseRule,
                        calculationMode: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="direct_percentage">Direct Percentage / Divide (Cashback cards: (spend * points)/step, exact calculation)</option>
                  <option value="floor">Floor (Standard bank rule: Math.floor(amount / step) * points)</option>
                  <option value="proportional">Proportional / Exact (Fractional points allowed)</option>
                  <option value="round">Round to nearest step</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: General Info */}
          {activeTab === 'general' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <h4 className="text-sm font-semibold text-white">General Card Details</h4>
                <p className="text-xs text-zinc-400">Card brand, network, and point valuation.</p>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Card Name</label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Issuer</label>
                  <input
                    type="text"
                    value={template.issuer}
                    onChange={(e) => setTemplate({ ...template, issuer: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Network</label>
                  <select
                    value={template.network}
                    onChange={(e) => setTemplate({ ...template, network: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                    <option value="RuPay">RuPay</option>
                    <option value="Diners">Diners Club</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Point Name (RP / MR)</label>
                  <input
                    type="text"
                    value={template.pointName}
                    onChange={(e) => setTemplate({ ...template, pointName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Value in INR (₹ per point)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={template.pointValueInInr}
                    onChange={(e) =>
                      setTemplate({ ...template, pointValueInInr: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Statement Ceiling Points (Leave blank for unlimited)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000 for Regalia Gold"
                  value={template.statementCeilingPoints ?? ''}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      statementCeilingPoints: e.target.value ? parseInt(e.target.value, 10) : null,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 6: AI Template Studio (JSON5) */}
          {activeTab === 'ai_studio' && (
            <div className="space-y-5">
              {/* Intro Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border border-purple-800/40">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>AI Card Template Studio (JSON5)</span>
                      <span className="text-[11px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                        Gemini & ChatGPT Ready
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Generate prompts with full JSON5 schema specifications, download documentation, or paste AI-generated card templates to instantly install new cards or update devaluation terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Prompt Generator */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <Bot className="w-4 h-4" />
                      <span>Gemini / ChatGPT Prompt</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Copy schema-guided prompt tailored to any credit card to send to an LLM.
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. Axis Atlas, Infinia..."
                      value={aiCardName}
                      onChange={(e) => setAiCardName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-sm transition-all"
                  >
                    {copiedPrompt ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-zinc-950" />
                        <span>Prompt Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy AI Prompt</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Download Schema */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400">
                      <Download className="w-4 h-4" />
                      <span>JSON5 Schema Spec</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Download the complete JSON5 schema documentation file with rule & milestone instructions.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadSchema}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Schema (.json5)</span>
                  </button>
                </div>

                {/* 3. Export Card */}
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400">
                      <FileCode className="w-4 h-4" />
                      <span>Export Current Card</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Copy the active card ({template.name}) in clean JSON5 format to edit or share.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCardJSON5}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
                  >
                    {copiedExport ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-400" />
                        <span>Copied JSON5!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Export as JSON5</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Paste & Install Area */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <span>Paste & Install JSON5 Template</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        (Comments, unquoted keys & trailing commas supported)
                      </span>
                    </h5>
                  </div>
                  {json5Input && (
                    <button
                      onClick={() => {
                        setJson5Input('');
                        setJson5Error(null);
                      }}
                      className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  value={json5Input}
                  onChange={(e) => setJson5Input(e.target.value)}
                  placeholder={`// Paste your AI-generated JSON5 card template here...\n{\n  id: "custom_card",\n  name: "Bank Credit Card",\n  issuer: "Bank Name",\n  baseRule: { spendStep: 100, pointsPerStep: 2, calculationMode: "floor" },\n  rewardRules: [ ... ],\n  milestoneRules: [ ... ]\n}`}
                  rows={8}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-purple-400 transition-colors"
                />

                {json5Error && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Validation Error</p>
                      <p className="text-[11px] text-red-300/90">{json5Error}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500">
                    Once installed, you can inspect or fine-tune rules in the tabs above.
                  </span>
                  <button
                    onClick={handleValidateAndInstallJSON5}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Validate & Install Card</span>
                  </button>
                </div>
              </div>

              {/* Quick AI Workflow Guide */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
                <span className="font-semibold text-zinc-300">Quick 60-Second Workflow:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
                  <li>Enter the card name above (e.g. <em>Axis Atlas</em> or <em>SBI Cashback</em>) and click <strong>Copy AI Prompt</strong>.</li>
                  <li>Paste into <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline hover:text-amber-300">Google Gemini</a> or ChatGPT.</li>
                  <li>Copy the JSON5 response block and paste it in the box above.</li>
                  <li>Click <strong>Validate & Install Card</strong> — the card and all its multiplier caps and milestones become live immediately!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800 flex-shrink-0">
          <div className="text-xs text-zinc-400 flex items-center space-x-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Rule changes update all live meters and calculators dynamically.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
