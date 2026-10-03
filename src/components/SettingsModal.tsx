'use client';

import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  getSupabaseConfig,
  setCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  signInWithGoogle,
  signOutSupabase,
} from '../lib/supabaseClient';
import { exportBackupJSON, importBackupJSON } from '../lib/storage';

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
  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig?.url || '');
  const [supabaseKey, setSupabaseKey] = useState(currentConfig?.anonKey || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl.trim() && supabaseKey.trim()) {
      setCustomSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleClearConfig = () => {
    clearCustomSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardcap_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('Backup successfully restored!');
          onDataImported();
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Failed to parse backup file. Please verify JSON format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Settings & Data Storage</h3>
              <p className="text-xs text-zinc-400">
                Configure Supabase Cloud sync or manage local offline data backups
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

        {/* Storage Mode Status */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentConfig ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-sm font-semibold text-white">
                Active Mode: {currentConfig ? 'Supabase Cloud Connected' : 'Demo / Local Storage Mode'}
              </span>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                currentConfig
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {currentConfig ? 'Cloud Sync Active' : 'Offline / Local'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            {currentConfig
              ? 'Your transactions and cards are securely synced to your Supabase PostgreSQL instance protected by Row Level Security.'
              : 'All calculations, rules, and transactions are stored locally in your browser storage. You can configure Supabase credentials below to sync with the cloud.'}
          </p>
        </div>

        {/* Supabase Configuration Form */}
        <form onSubmit={handleSaveConfig} className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Supabase Cloud Connection
          </h4>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Supabase Project URL
            </label>
            <input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-zinc-500">
              Database schema is located at <code className="text-zinc-400">supabase/schema.sql</code>
            </div>

            <div className="flex items-center space-x-2">
              {currentConfig && (
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors"
                >
                  Disconnect
                </button>
              )}
              <button
                type="submit"
                className="flex items-center space-x-1 px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{saveSuccess ? 'Saved!' : 'Save Credentials'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Data Backup & Reset */}
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Backup & Data Management
          </h4>

          {importStatus && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Export JSON */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors font-medium"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Backup</span>
            </button>

            {/* Import JSON */}
            <label className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors font-medium cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {/* Reset to Samples */}
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
              className="flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-zinc-950 hover:bg-red-950/30 border border-zinc-800 hover:border-red-800/50 text-xs text-zinc-300 hover:text-red-300 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>Reset Samples</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
