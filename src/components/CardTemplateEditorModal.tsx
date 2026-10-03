'use client';

import React, { useState } from 'react';
import { CardTemplate, RewardRule, MilestoneRule, CapGroupDefinition } from '../types/card';
import { X, Sliders, Plus, Trash2, RotateCcw, Save, ShieldAlert, Check } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState<'general' | 'base' | 'caps' | 'rules' | 'milestones'>('rules');
  const [showSavedToast, setShowSavedToast] = useState(false);

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
                      <div className="flex items-end justify-end">
                        <button
                          onClick={() => handleDeleteCapGroup(group.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete Cap Group"
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
                {template.milestoneRules.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Milestone Title</label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => handleUpdateMilestone(idx, { title: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium">Milestone Type</label>
                        <select
                          value={m.type}
                          onChange={(e) =>
                            handleUpdateMilestone(idx, { type: e.target.value as any })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-white"
                        >
                          <option value="transaction_count">Transaction Count (e.g. 4x ₹1,500)</option>
                          <option value="cumulative_spend">Cumulative Spend (e.g. ₹20,000)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {m.type === 'transaction_count' ? (
                        <>
                          <div>
                            <label className="text-[11px] text-zinc-400">Target Count</label>
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
                            value={m.targetSpend || 20000}
                            onChange={(e) =>
                              handleUpdateMilestone(idx, { targetSpend: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] text-zinc-400">Bonus Points Unlocked</label>
                        <input
                          type="number"
                          value={m.rewardPoints}
                          onChange={(e) =>
                            handleUpdateMilestone(idx, { rewardPoints: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-white font-mono"
                        />
                      </div>

                      <div className="flex items-end justify-between">
                        <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-zinc-400">
                          <input
                            type="checkbox"
                            checked={m.includeExemptCategories ?? true}
                            onChange={(e) =>
                              handleUpdateMilestone(idx, { includeExemptCategories: e.target.checked })
                            }
                            className="rounded text-amber-500"
                          />
                          <span>Fuel/Utility Counts</span>
                        </label>
                        <button
                          onClick={() => handleDeleteMilestone(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
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
