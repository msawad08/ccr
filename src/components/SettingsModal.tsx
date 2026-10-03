'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  FileText,
  Cloud,
  HardDrive,
  AlertTriangle,
  LogIn,
  LogOut,
  User as UserIcon,
  RefreshCw,
  Mail,
  Key,
} from 'lucide-react';
import {
  isSupabaseConfigured,
  getStorageMode,
  setStorageMode as saveStorageModePref,
  signUpWithEmail,
  signInWithEmail,
  signInWithMagicLink,
  signOutSupabase,
  getCurrentUser,
} from '../lib/supabaseClient';
import {
  exportDataToJSON5,
  importDataFromJSON5,
  exportDataToExcel,
  exportDataToCSV,
} from '../lib/exportImportHelper';
import { pushLocalDataToSupabase, fetchUserDataFromSupabase } from '../lib/storage';
import { User } from '@supabase/supabase-js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToSampleData: () => void;
  onDataImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetToSampleData,
  onDataImported,
}) => {
  const [storageMode, setStorageMode] = useState<'local' | 'supabase'>('local');
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth Form State
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Sync State
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Import Status
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const mode = getStorageMode();
      setStorageMode(mode);
      const configured = isSupabaseConfigured();
      setSupabaseReady(configured);

      if (configured) {
        getCurrentUser().then((user) => {
          setCurrentUser(user);
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectMode = (mode: 'local' | 'supabase') => {
    setStorageMode(mode);
    saveStorageModePref(mode);
  };

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email.trim()) {
      setAuthError('Please enter your email address.');
      return;
    }

    setAuthLoading(true);

    try {
      if (authTab === 'signup') {
        if (!password || password.length < 6) {
          setAuthError('Password must be at least 6 characters.');
          setAuthLoading(false);
          return;
        }

        const res = await signUpWithEmail(email.trim(), password);
        if (res.error) {
          setAuthError(res.error.message);
        } else {
          setAuthSuccess(
            'Account created! If confirmation is required, please check your inbox (or local Inbucket at http://127.0.0.1:54324).'
          );
          if (res.user) {
            setCurrentUser(res.user);
          }
        }
      } else {
        // Sign In
        if (!password) {
          setAuthError('Please enter your password.');
          setAuthLoading(false);
          return;
        }

        const res = await signInWithEmail(email.trim(), password);
        if (res.error) {
          setAuthError(res.error.message);
        } else {
          setAuthSuccess('Signed in successfully!');
          if (res.user) {
            setCurrentUser(res.user);
            // Auto fetch user data
            fetchUserDataFromSupabase(res.user.id).then(() => {
              onDataImported();
            });
          }
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setAuthError('Please enter your email address first.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithMagicLink(email.trim());
      if (res.error) {
        setAuthError(res.error.message);
      } else {
        setAuthSuccess(
          'Magic link sent! Check your email (or local Inbucket at http://127.0.0.1:54324) to log in instantly.'
        );
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to send magic link.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    setAuthSuccess('Signed out of Supabase.');
    setTimeout(() => setAuthSuccess(null), 2500);
  };

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setSyncLoading(true);
    setSyncMessage(null);

    try {
      // Push local data up, then pull
      const pushRes = await pushLocalDataToSupabase(currentUser.id);
      if (!pushRes.success) {
        setSyncMessage(`Push error: ${pushRes.error}`);
      } else {
        await fetchUserDataFromSupabase(currentUser.id);
        onDataImported();
        setSyncMessage('Data synced successfully with Supabase!');
        setTimeout(() => setSyncMessage(null), 3500);
      }
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err?.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // Import File Handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDataFromJSON5(content);
        if (res.success) {
          setImportStatus(res.message);
          onDataImported();
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportError(res.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Storage Mode & Data Sync</h3>
              <p className="text-xs text-zinc-400">
                Choose between offline local storage or multi-device Supabase cloud sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: Storage Mode Selector Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Select Data Storage & Sync Mode
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* OPTION A: Local Storage */}
            <div
              onClick={() => handleSelectMode('local')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                storageMode === 'local'
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className={`w-5 h-5 ${storageMode === 'local' ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span className="text-sm font-bold text-white">Local Storage</span>
                  </div>
                  {storageMode === 'local' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Offline Only</span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Fast, zero-setup offline storage kept directly inside this browser.
                </p>
              </div>

              {/* Warning Notice Box */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5 text-[11px] text-amber-300/90">
                <div className="flex items-center space-x-1 font-semibold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Important Device Notice:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400 text-[11px]">
                  <li><strong className="text-zinc-300">Device-specific only:</strong> Does not sync to other phones or PCs.</li>
                  <li><strong className="text-amber-300">Risk of Data Loss:</strong> Clearing browser data/cookies will erase all transactions.</li>
                  <li>Use the <strong>JSON5 / Excel Export</strong> below to backup or move data across devices.</li>
                </ul>
              </div>
            </div>

            {/* OPTION B: Supabase Cloud Sync */}
            <div
              onClick={() => handleSelectMode('supabase')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                storageMode === 'supabase'
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className={`w-5 h-5 ${storageMode === 'supabase' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                    <span className="text-sm font-bold text-white">Supabase Sync</span>
                  </div>
                  {storageMode === 'supabase' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Multi-Device</span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Real-time cloud database backup powered by Supabase (PostgreSQL with Row Level Security).
                </p>
              </div>

              {/* Benefits Box */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 text-[11px] text-emerald-300/90">
                <div className="flex items-center space-x-1 font-semibold text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Cloud & Multi-Device Sync:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-zinc-400 text-[11px]">
                  <li><strong className="text-zinc-300">Syncs Everywhere:</strong> Access the same wallet and caps on any device.</li>
                  <li><strong className="text-emerald-300">Safe from Cache Clearing:</strong> Records are saved in the cloud.</li>
                  <li>Works with <strong>Supabase Cloud</strong> or local <strong>Supabase Docker</strong>.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Supabase Authentication Section (When Supabase Mode is Active) */}
        {storageMode === 'supabase' && (
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Supabase Account & Sync</span>
              </h4>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${supabaseReady ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {supabaseReady ? 'Configured in .env' : 'Missing .env Credentials'}
              </span>
            </div>

            {!supabaseReady ? (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                <p className="text-amber-400 font-semibold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Environment variables required</span>
                </p>
                <p className="text-[11px]">
                  To use Supabase Cloud or Local Docker, add the following to your <code className="text-white">.env.local</code> file:
                </p>
                <div className="p-2 rounded-lg bg-zinc-950 font-mono text-[10px] text-zinc-300">
                  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
                </div>
                <p className="text-[11px] text-zinc-500">
                  Check <code className="text-zinc-400">supabase/LOCAL_DOCKER_GUIDE.md</code> to start a local Docker instance in 1 command (<code className="text-zinc-300">npx supabase start</code>).
                </p>
              </div>
            ) : currentUser ? (
              /* Signed In Profile View */
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{currentUser.email}</p>
                      <p className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Connected & Ready to Sync</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-red-400 px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-red-800/50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {syncMessage && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{syncMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-zinc-400">
                    Push local transactions and cards to Supabase or pull latest records.
                  </p>
                  <button
                    onClick={handleSyncNow}
                    disabled={syncLoading}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                    <span>{syncLoading ? 'Syncing...' : 'Sync to Cloud Now'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Auth Form (Sign In / Sign Up) */
              <div className="space-y-3">
                <div className="flex border-b border-zinc-800 text-xs">
                  <button
                    onClick={() => {
                      setAuthTab('signin');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                      authTab === 'signin'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-zinc-400 border-transparent hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab('signup');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                      authTab === 'signup'
                        ? 'text-emerald-400 border-emerald-400'
                        : 'text-zinc-400 border-transparent hover:text-white'
                    }`}
                  >
                    Create Account (Sign Up)
                  </button>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center space-x-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleMagicLink}
                      disabled={authLoading}
                      className="text-[11px] text-zinc-400 hover:text-emerald-400 underline transition-colors"
                    >
                      Send Magic Link instead
                    </button>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors disabled:opacity-50"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{authLoading ? 'Processing...' : authTab === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Multi-Format Data Export & Import */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>Export & Import (Transfer Between Devices)</span>
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Export your full card rules, custom multipliers, caps, and transactions to JSON5 or Excel. Import JSON5 on any other device.
            </p>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {importError && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Export Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Export JSON5 */}
            <button
              onClick={exportDataToJSON5}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/40 text-xs text-zinc-200 transition-all font-medium group"
              title="Export complete database backup as JSON5 format (with comments & full schemas)"
            >
              <FileCode className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Export as JSON5</span>
            </button>

            {/* Export Excel (.xlsx) */}
            <button
              onClick={exportDataToExcel}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-xs text-zinc-200 transition-all font-medium group"
              title="Export all transactions, cards, and reward values into Microsoft Excel (.xlsx) workbook"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Export to Excel (.xlsx)</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportDataToCSV}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/40 text-xs text-zinc-200 transition-all font-medium group"
              title="Export transactions ledger as universal CSV format"
            >
              <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Export as CSV</span>
            </button>
          </div>

          {/* Import JSON5 / JSON Backup File */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
            <label className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-800/60 text-xs text-purple-200 font-bold cursor-pointer transition-all shadow-sm">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Import JSON5 Backup from Another Device</span>
              <input
                type="file"
                accept=".json5,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {/* Reset to Factory Samples */}
            <button
              onClick={() => {
                if (
                  confirm(
                    'Reset all transactions, cards, and rules to default sample data matching the specification?'
                  )
                ) {
                  onResetToSampleData();
                  onClose();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-red-950/30 border border-zinc-800 hover:border-red-800/50 text-xs text-zinc-400 hover:text-red-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
