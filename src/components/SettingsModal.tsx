'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Upload,
  RotateCcw,
  ShieldCheck,
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
  checkAndInitSupabase,
  getStorageMode,
  setStorageMode as saveStorageModePref,
  signUpWithEmail,
  signInWithEmail,
  signInWithMagicLink,
  signInWithGoogle,
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
  const [commentedWarning, setCommentedWarning] = useState(false);
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

      // Verify Supabase configuration
      checkAndInitSupabase().then((res) => {
        setSupabaseReady(res.configured);
        setCommentedWarning(Boolean(res.hasCommentedLines));

        if (res.configured) {
          getCurrentUser().then((user) => {
            setCurrentUser(user);
          });
        }
      });
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
          setAuthSuccess('Account created! Please check your inbox to confirm.');
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
          setAuthSuccess('Signed in successfully.');
          if (res.user) {
            setCurrentUser(res.user);
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
        setAuthSuccess('Magic link sent! Check your inbox to sign in instantly.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to send magic link.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setAuthLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.error) {
        setAuthError(res.error.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to initiate Google sign-in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutSupabase();
    setCurrentUser(null);
    setAuthSuccess('Signed out.');
    setTimeout(() => setAuthSuccess(null), 2500);
  };

  const handleSyncNow = async () => {
    if (!currentUser) return;
    setSyncLoading(true);
    setSyncMessage(null);

    try {
      const pushRes = await pushLocalDataToSupabase(currentUser.id);
      if (!pushRes.success) {
        setSyncMessage(`Push error: ${pushRes.error}`);
      } else {
        await fetchUserDataFromSupabase(currentUser.id);
        onDataImported();
        setSyncMessage('Data synced successfully with cloud storage.');
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
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#141210] border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 border border-stone-700/60 flex items-center justify-center text-[#C5A880] shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#C5A880] uppercase">
                System Preferences
              </span>
              <h3 className="text-xl font-serif tracking-tight text-stone-100">
                Storage & Governance
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: Storage Mode Selector Cards */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono tracking-wider uppercase text-stone-400">
            Select Data Storage & Sync Mode
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* OPTION A: Local Storage */}
            <div
              onClick={() => handleSelectMode('local')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                storageMode === 'local'
                  ? 'bg-stone-900 border-[#C5A880]/80 shadow-md ring-1 ring-[#C5A880]/30'
                  : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className={`w-4 h-4 ${storageMode === 'local' ? 'text-[#C5A880]' : 'text-stone-400'}`} />
                    <span className="text-sm font-medium text-stone-100 font-serif">Local Storage</span>
                  </div>
                  {storageMode === 'local' ? (
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#EAE4DC] border border-[#C5A880]/40">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-mono">Offline Only</span>
                  )}
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Fast, zero-setup storage retained solely inside this local browser.
                </p>
              </div>

              {/* Warning Notice Box */}
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1 text-[11px] text-stone-400">
                <div className="flex items-center space-x-1.5 font-medium text-stone-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Device Specific:</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Data will not sync to your other devices and can be erased if browser cache is cleared. Use the export below to transfer records.
                </p>
              </div>
            </div>

            {/* OPTION B: Supabase Cloud Sync */}
            <div
              onClick={() => handleSelectMode('supabase')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                storageMode === 'supabase'
                  ? 'bg-stone-900 border-[#C5A880]/80 shadow-md ring-1 ring-[#C5A880]/30'
                  : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className={`w-4 h-4 ${storageMode === 'supabase' ? 'text-[#C5A880]' : 'text-stone-400'}`} />
                    <span className="text-sm font-medium text-stone-100 font-serif">Supabase Cloud</span>
                  </div>
                  {storageMode === 'supabase' ? (
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#C5A880]/20 text-[#EAE4DC] border border-[#C5A880]/40">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-mono">Multi-Device</span>
                  )}
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  Real-time database backup with multi-device sync and Row Level Security.
                </p>
              </div>

              {/* Benefits Box */}
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1 text-[11px] text-stone-400">
                <div className="flex items-center space-x-1.5 font-medium text-stone-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Cloud Synchronized:</span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Access the same wallet and accruals across mobile and desktop securely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Supabase Authentication Section */}
        {storageMode === 'supabase' && (
          <div className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-semibold text-stone-200 uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <span>Supabase Account & Sync</span>
              </h4>
            </div>

            {!supabaseReady ? (
              process.env.NODE_ENV === 'development' ? (
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-400 space-y-2">
                  <p className="text-amber-400 font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Development Note: Credentials required</span>
                  </p>
                  <p className="text-[11px]">
                    To use Supabase Cloud or Local Docker, ensure credentials are set in <code className="text-stone-200">.env.local</code>.
                  </p>
                </div>
              ) : null
            ) : currentUser ? (
              /* Signed In Profile View */
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#C5A880]/15 text-[#C5A880] flex items-center justify-center font-bold text-xs">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-mono font-medium text-stone-200">{currentUser.email}</p>
                      <p className="text-[10px] text-[#C5A880] flex items-center space-x-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
                        <span>Connected & Ready to Sync</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-xs text-stone-400 hover:text-stone-200 px-3 py-1.5 rounded-xl border border-stone-800 hover:border-stone-700 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {syncMessage && (
                  <div className="p-3 rounded-xl bg-stone-900 border border-[#C5A880]/30 text-xs text-[#EAE4DC] flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{syncMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-stone-400">
                    Push local transactions and cards to Supabase or pull latest records.
                  </p>
                  <button
                    onClick={handleSyncNow}
                    disabled={syncLoading}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium text-stone-950 bg-stone-100 hover:bg-stone-200 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
                    <span>{syncLoading ? 'Syncing...' : 'Sync to Cloud Now'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Auth Form (Sign In / Sign Up) */
              <div className="space-y-3">
                <div className="flex border-b border-stone-800 text-xs">
                  <button
                    onClick={() => {
                      setAuthTab('signin');
                      setAuthError(null);
                      setAuthSuccess(null);
                    }}
                    className={`pb-2 px-3 font-medium border-b-2 transition-colors ${
                      authTab === 'signin'
                        ? 'text-[#C5A880] border-[#C5A880]'
                        : 'text-stone-400 border-transparent hover:text-stone-200'
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
                    className={`pb-2 px-3 font-medium border-b-2 transition-colors ${
                      authTab === 'signup'
                        ? 'text-[#C5A880] border-[#C5A880]'
                        : 'text-stone-400 border-transparent hover:text-stone-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccess && (
                  <div className="p-3 rounded-xl bg-stone-900 border border-[#C5A880]/40 text-xs text-[#EAE4DC] flex items-center space-x-2">
                    <Check className="w-4 h-4 flex-shrink-0 text-[#C5A880]" />
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-200 font-medium text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-stone-800 w-full" />
                  <span className="bg-[#141210] px-2 text-[10px] text-stone-500 uppercase tracking-wider font-mono absolute">
                    or continue with email
                  </span>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#C5A880]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleMagicLink}
                      disabled={authLoading}
                      className="text-[11px] text-stone-400 hover:text-stone-200 underline transition-colors"
                    >
                      Send Magic Link instead
                    </button>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium text-stone-950 bg-stone-100 hover:bg-stone-200 transition-all active:scale-[0.98] disabled:opacity-50"
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
        <div className="space-y-3 pt-3 border-t border-stone-800/80">
          <div>
            <h4 className="text-xs font-mono tracking-wider uppercase text-stone-400">
              Export & Import (Transfer Between Devices)
            </h4>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Export card rules, custom multipliers, caps, and transactions to JSON5, Excel, or CSV.
            </p>
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-stone-900 border border-[#C5A880]/30 text-xs text-[#EAE4DC] flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0 text-[#C5A880]" />
              <span>{importStatus}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Export Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={exportDataToJSON5}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs text-stone-200 transition-all font-medium"
            >
              <FileCode className="w-4 h-4 text-[#C5A880]" />
              <span>Export JSON5</span>
            </button>

            <button
              onClick={exportDataToExcel}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs text-stone-200 transition-all font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-stone-400" />
              <span>Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={exportDataToCSV}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs text-stone-200 transition-all font-medium"
            >
              <FileText className="w-4 h-4 text-stone-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Import JSON5 / JSON Backup File */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
            <label className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-100 font-medium cursor-pointer transition-all shadow-sm">
              <Upload className="w-4 h-4 text-[#C5A880]" />
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
                    'Reset all transactions, cards, and rules to default sample data?'
                  )
                ) {
                  onResetToSampleData();
                  onClose();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-stone-950 hover:bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs text-stone-400 hover:text-stone-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
