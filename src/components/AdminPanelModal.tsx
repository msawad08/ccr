'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  CreditCard,
  MessageSquare,
  Users,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Sparkles,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Search,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { CardSubmission, FeedbackItem, AppUser } from '../types/admin';
import {
  fetchAllSubmissions,
  approveCardSubmission,
  rejectCardSubmission,
  fetchAllFeedbacks,
  updateFeedbackStatus,
} from '../lib/communityCatalog';
import {
  fetchAllUsers,
  addAdminUser,
  removeAdminUser,
  toggleBlockUser,
  isSuperAdmin,
  getUserRole,
} from '../lib/adminAuth';
import { CardTemplate } from '../types/card';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string | null;
  onCardPublished?: (card: CardTemplate) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  onCardPublished,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'users' | 'feedback'>('submissions');
  const [submissions, setSubmissions] = useState<CardSubmission[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Submissions state
  const [submissionFilter, setSubmissionFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [inspectingSubmission, setInspectingSubmission] = useState<CardSubmission | null>(null);
  const [rejectModalSubId, setRejectModalSubId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Feedback state
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'card' | 'app'>('all');

  // User management state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const isSuper = isSuperAdmin(currentUserEmail);
  const userRole = getUserRole(currentUserEmail);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, fbs, usrs] = await Promise.all([
        fetchAllSubmissions(),
        fetchAllFeedbacks(),
        fetchAllUsers(),
      ]);
      setSubmissions(subs);
      setFeedbacks(fbs);
      setUsers(usrs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Submissions handlers
  const handleApprove = async (sub: CardSubmission) => {
    try {
      const approved = await approveCardSubmission(sub.id, currentUserEmail || 'admin');
      notify(`"${approved.name}" has been approved and published to the Community Catalog!`);
      if (onCardPublished) {
        onCardPublished(approved);
      }
      setInspectingSubmission(null);
      await loadData();
    } catch (err: any) {
      notify(`Approval failed: ${err?.message || err}`);
    }
  };

  const handleReject = async (subId: string) => {
    if (!rejectReason.trim()) {
      notify('Please provide a reason for rejection.');
      return;
    }
    try {
      await rejectCardSubmission(subId, currentUserEmail || 'admin', rejectReason.trim());
      notify('Submission rejected and feedback noted.');
      setRejectModalSubId(null);
      setRejectReason('');
      setInspectingSubmission(null);
      await loadData();
    } catch (err: any) {
      notify(`Rejection failed: ${err?.message || err}`);
    }
  };

  // User Management handlers
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    try {
      await addAdminUser(newAdminEmail.trim(), currentUserEmail || '');
      notify(`Granted Admin privileges to ${newAdminEmail.trim()}`);
      setNewAdminEmail('');
      await loadData();
    } catch (err: any) {
      notify(err?.message || 'Failed to add admin.');
    }
  };

  const handleRemoveAdmin = async (targetEmail: string) => {
    try {
      await removeAdminUser(targetEmail, currentUserEmail || '');
      notify(`Revoked Admin privileges for ${targetEmail}`);
      await loadData();
    } catch (err: any) {
      notify(err?.message || 'Failed to revoke admin.');
    }
  };

  const handleToggleBlock = async (targetEmail: string) => {
    try {
      const nowBlocked = await toggleBlockUser(targetEmail, currentUserEmail || '');
      notify(`${targetEmail} is now ${nowBlocked ? 'blocked' : 'unblocked'}.`);
      await loadData();
    } catch (err: any) {
      notify(err?.message || 'Failed to update user block state.');
    }
  };

  // Feedback handlers
  const handleFeedbackStatus = async (fbId: string, status: 'reviewed' | 'resolved') => {
    try {
      await updateFeedbackStatus(fbId, status);
      notify(`Feedback marked as ${status}.`);
      await loadData();
    } catch (err: any) {
      notify(`Update failed: ${err?.message || err}`);
    }
  };

  if (!isOpen) return null;

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'all') return true;
    return s.status === submissionFilter;
  });

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (feedbackFilter === 'all') return true;
    return f.type === feedbackFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    return u.email.toLowerCase().includes(userSearch.toLowerCase());
  });

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;
  const pendingFeedbacksCount = feedbacks.filter((f) => f.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#141210] border border-stone-800 rounded-3xl shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-800/80 bg-gradient-to-r from-stone-950 via-[#161412] to-stone-950">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 border border-stone-700/60 flex items-center justify-center text-[#C5A880] shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">
                  Curator Terminal
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-[#C5A880]/15 text-[#EAE4DC] border border-[#C5A880]/30 font-semibold uppercase">
                  {userRole.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-xl font-serif tracking-tight text-stone-100">
                CardCap Admin & Governance
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-mono text-stone-300">{currentUserEmail || 'Administrator'}</p>
              <p className="text-[10px] text-stone-500">Authorized Session</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-stone-800/80 px-6 bg-stone-950/40">
          <div className="flex space-x-1 sm:space-x-2 py-2">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'submissions'
                  ? 'bg-stone-900 text-stone-100 border border-stone-700/70 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Card Publishing Queue</span>
              {pendingSubmissionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#C5A880] text-stone-950 font-bold">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'feedback'
                  ? 'bg-stone-900 text-stone-100 border border-stone-700/70 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-stone-300" />
              <span>Feedback Inbox</span>
              {pendingFeedbacksCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-stone-700 text-stone-200 font-bold">
                  {pendingFeedbacksCount}
                </span>
              )}
            </button>

            {isSuper && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-stone-900 text-stone-100 border border-stone-700/70 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Super Admin: Users & Roles</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-stone-900 border border-[#C5A880]/40 text-xs text-[#EAE4DC] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#C5A880]" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-400 hover:text-stone-200 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Card Submissions & Publishing */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1.5 p-1 bg-stone-950 border border-stone-800/80 rounded-xl text-xs">
                  {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSubmissionFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                        submissionFilter === filter
                          ? 'bg-stone-900 text-stone-100 font-medium border border-stone-700/60'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-stone-400 font-mono">
                  Showing {filteredSubmissions.length} submission(s)
                </span>
              </div>

              {/* Submissions List */}
              {filteredSubmissions.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-stone-800 rounded-3xl bg-stone-950/20 text-stone-500 space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-sm font-medium text-stone-400">No submissions found</p>
                  <p className="text-xs">
                    When users create custom cards and request to publish, they will appear in this review queue.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredSubmissions.map((sub) => {
                    const card = sub.template;
                    return (
                      <div
                        key={sub.id}
                        className="p-5 bg-stone-950/80 border border-stone-800 hover:border-stone-700/80 rounded-2xl transition-all space-y-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400">
                                {card.issuer}
                              </span>
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                                  sub.status === 'approved'
                                    ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400'
                                    : sub.status === 'rejected'
                                    ? 'bg-red-950/40 border-red-800/40 text-red-400'
                                    : 'bg-amber-950/40 border-amber-800/40 text-amber-300'
                                }`}
                              >
                                {sub.status}
                              </span>
                              <span className="text-[10px] font-mono text-stone-500">
                                {sub.type === 'new_card' ? 'New Card' : 'Update to Existing Card'}
                              </span>
                            </div>
                            <h4 className="text-base font-serif tracking-tight text-stone-100">
                              {card.name}
                            </h4>
                            <p className="text-xs text-stone-400 flex items-center gap-2">
                              <span>Submitted by:</span>
                              <strong className="text-stone-300 font-normal">{sub.submittedByEmail}</strong>
                              <span>&bull; Creator Credit:</span>
                              <strong className="text-[#C5A880] font-normal">{sub.creatorName}</strong>
                            </p>
                            {sub.changeSummary && (
                              <p className="text-xs text-stone-300 bg-stone-900/60 p-2 rounded-lg border border-stone-800/60 mt-1">
                                <span className="text-stone-500">Change Summary:</span> {sub.changeSummary}
                              </p>
                            )}
                          </div>

                          {/* Quick Stats Pill */}
                          <div className="flex items-center gap-3 text-xs font-mono bg-stone-900/70 p-2.5 rounded-xl border border-stone-800/60 text-stone-300">
                            <div>
                              <span className="text-[10px] text-stone-500 block">Reward Rate</span>
                              <span>
                                {card.baseRule.pointsPerStep} {card.pointName}/₹{card.baseRule.spendStep}
                              </span>
                            </div>
                            <div className="h-6 w-px bg-stone-800" />
                            <div>
                              <span className="text-[10px] text-stone-500 block">Rules</span>
                              <span>{card.rewardRules?.length || 0} categories</span>
                            </div>
                            <div className="h-6 w-px bg-stone-800" />
                            <div>
                              <span className="text-[10px] text-stone-500 block">Milestones</span>
                              <span>{card.milestoneRules?.length || 0} goals</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 text-xs">
                          <button
                            onClick={() =>
                              setInspectingSubmission(
                                inspectingSubmission?.id === sub.id ? null : sub
                              )
                            }
                            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>
                              {inspectingSubmission?.id === sub.id ? 'Hide Details' : 'Inspect Rules & Math'}
                            </span>
                          </button>

                          <div className="flex items-center gap-2">
                            {sub.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => setRejectModalSubId(sub.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-800/50 transition-colors"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                                <button
                                  onClick={() => handleApprove(sub)}
                                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-stone-100 text-stone-950 hover:bg-stone-200 font-medium transition-all active:scale-[0.98] shadow-sm"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-800" />
                                  <span>Approve & Publish</span>
                                </button>
                              </>
                            )}
                            {sub.status === 'approved' && (
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                                <span>Published on {new Date(sub.reviewedAt || sub.submittedAt).toLocaleDateString()}</span>
                              </span>
                            )}
                            {sub.status === 'rejected' && sub.rejectionReason && (
                              <span className="text-xs text-red-400/90 italic">
                                Reason: {sub.rejectionReason}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded Rules Inspector */}
                        {inspectingSubmission?.id === sub.id && (
                          <div className="p-4 bg-stone-900/60 rounded-xl border border-stone-800/80 space-y-4 animate-in fade-in">
                            <h5 className="text-xs font-mono tracking-wider uppercase text-stone-300">
                              Detailed Configuration Preview
                            </h5>

                            {/* Reward Rules list */}
                            <div className="space-y-2">
                              <span className="text-[11px] font-mono text-stone-400">Multiplier Rules:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {card.rewardRules.map((r) => (
                                  <div
                                    key={r.id}
                                    className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/60 space-y-1"
                                  >
                                    <div className="flex justify-between font-medium text-stone-200">
                                      <span>{r.name}</span>
                                      <span className="text-[#C5A880] font-mono">
                                        {r.bonusMultiplier ? `${r.bonusMultiplier + 1}X` : '1X Base'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-stone-400">
                                      Cap: {r.monthlyBonusCap ? `${r.monthlyBonusCap} RP/mo` : 'No Cap'}
                                      {r.dailyBonusCap ? ` (${r.dailyBonusCap}/day)` : ''}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Milestone Rules */}
                            {card.milestoneRules?.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-[11px] font-mono text-stone-400">Milestone Trackers:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {card.milestoneRules.map((m) => (
                                    <div
                                      key={m.id}
                                      className="p-2.5 rounded-lg bg-stone-950/70 border border-stone-800/60 space-y-1"
                                    >
                                      <div className="flex justify-between font-medium text-stone-200">
                                        <span>{m.title}</span>
                                        <span className="text-[#C5A880] font-mono">{m.period}</span>
                                      </div>
                                      <p className="text-[11px] text-stone-400">
                                        Target: ₹{m.targetSpend?.toLocaleString('en-IN') || m.targetCount} &rarr; Benefit: {m.benefitValue || `${m.rewardPoints} pts`}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rejection Reason Modal */}
              {rejectModalSubId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="w-full max-w-md bg-[#141210] border border-stone-800 rounded-2xl p-6 space-y-4 text-stone-100">
                    <h4 className="text-base font-serif text-stone-100">Reject Card Submission</h4>
                    <p className="text-xs text-stone-400">
                      Provide a constructive explanation (e.g. incorrect multiplier, missing cap group, duplicate).
                    </p>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. GyFTR voucher monthly cap is currently ₹3,000 RP, please update..."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          setRejectModalSubId(null);
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs text-stone-400 hover:text-stone-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(rejectModalSubId)}
                        className="px-4 py-1.5 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-medium border border-red-800"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Super Admin User Management */}
          {activeTab === 'users' && isSuper && (
            <div className="space-y-6">
              {/* Promotion Box */}
              <div className="p-5 bg-stone-950/60 border border-stone-800/80 rounded-2xl space-y-3">
                <h4 className="text-xs font-mono tracking-wider uppercase text-[#C5A880] flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Grant Admin Privileges</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Admins can approve and publish community card submissions, and manage feedback.
                </p>
                <form onSubmit={handleAddAdmin} className="flex gap-2">
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-950 hover:bg-stone-200 font-medium text-xs transition-colors"
                  >
                    Promote to Admin
                  </button>
                </form>
              </div>

              {/* Users Directory */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono tracking-wider uppercase text-stone-400">
                    User Accounts & Roles
                  </h4>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
                    <input
                      type="text"
                      placeholder="Search email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-stone-700"
                    />
                  </div>
                </div>

                <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-2xl bg-stone-950/40 overflow-hidden text-xs">
                  {filteredUsers.map((u) => {
                    const isSuperTarget = u.role === 'super_admin';
                    return (
                      <div
                        key={u.id}
                        className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-stone-900/30 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-stone-200 font-medium">{u.email}</span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold ${
                                isSuperTarget
                                  ? 'bg-[#C5A880]/15 text-[#EAE4DC] border border-[#C5A880]/30'
                                  : u.role === 'admin'
                                  ? 'bg-stone-800 text-stone-300 border border-stone-700'
                                  : 'bg-stone-900 text-stone-400'
                              }`}
                            >
                              {u.role.replace('_', ' ')}
                            </span>
                            {u.isBlocked && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-red-950/60 text-red-400 border border-red-800/60">
                                Blocked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500">{u.createdAt}</p>
                        </div>

                        {!isSuperTarget && (
                          <div className="flex items-center gap-2">
                            {u.role === 'admin' ? (
                              <button
                                onClick={() => handleRemoveAdmin(u.email)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-stone-800 text-stone-400 hover:text-amber-400 transition-colors"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Demote</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => addAdminUser(u.email, currentUserEmail || '')}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-stone-800 text-stone-400 hover:text-[#C5A880] transition-colors"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Make Admin</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleBlock(u.email)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors ${
                                u.isBlocked
                                  ? 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/40'
                                  : 'border-red-800/60 text-red-400 hover:bg-red-950/40'
                              }`}
                            >
                              {u.isBlocked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Unblock</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Block</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Community Feedback Inbox */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1.5 p-1 bg-stone-950 border border-stone-800/80 rounded-xl text-xs">
                  {(['all', 'card', 'app'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFeedbackFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                        feedbackFilter === filter
                          ? 'bg-stone-900 text-stone-100 font-medium border border-stone-700/60'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {filter === 'all' ? 'All Feedback' : filter === 'card' ? 'Card Rule Changes' : 'General App'}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-stone-400 font-mono">
                  Showing {filteredFeedbacks.length} feedback item(s)
                </span>
              </div>

              {/* Feedback items */}
              {filteredFeedbacks.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-stone-800 rounded-3xl bg-stone-950/20 text-stone-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-sm font-medium text-stone-400">Feedback inbox is clear</p>
                  <p className="text-xs">
                    When users submit feedback or report bank devaluations, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredFeedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-5 bg-stone-950/80 border border-stone-800 rounded-2xl space-y-3 shadow-sm hover:border-stone-700/70 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              fb.type === 'card'
                                ? 'bg-[#C5A880]/15 text-[#EAE4DC] border border-[#C5A880]/30'
                                : 'bg-stone-800 text-stone-300 border border-stone-700'
                            }`}
                          >
                            {fb.type === 'card' ? `Card: ${fb.cardName || 'Specific'}` : 'App Feedback'}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded">
                            {fb.category.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                          <span>{fb.userEmail}</span>
                          <span>&bull;</span>
                          <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-200 leading-relaxed bg-stone-900/50 p-3 rounded-xl border border-stone-800/60">
                        {fb.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] font-mono text-stone-500 uppercase">
                          Status: <strong className="text-stone-400 font-normal">{fb.status}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {fb.status === 'pending' && (
                            <button
                              onClick={() => handleFeedbackStatus(fb.id, 'reviewed')}
                              className="px-3 py-1 rounded-lg border border-stone-800 text-stone-300 hover:border-stone-600 transition-colors text-xs"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {fb.status !== 'resolved' && (
                            <button
                              onClick={() => handleFeedbackStatus(fb.id, 'resolved')}
                              className="px-3 py-1 rounded-lg bg-stone-900 border border-[#C5A880]/40 text-[#EAE4DC] hover:bg-stone-800 transition-colors text-xs"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
