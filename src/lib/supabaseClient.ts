import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;
let runtimeConfig: { url: string; anonKey: string } | null = null;

const STORAGE_MODE_KEY = 'ccr_storage_mode';

/**
 * Manually set runtime Supabase credentials (e.g. dynamically fetched from /api/supabase-config)
 */
export function setRuntimeSupabaseConfig(config: { url: string; anonKey: string } | null) {
  runtimeConfig = config;
  supabaseInstance = null; // force re-initialization
}

/**
 * Returns whether Supabase credentials exist in environment variables or runtime config
 */
export function isSupabaseConfigured(): boolean {
  if (runtimeConfig?.url && runtimeConfig?.anonKey) return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && anonKey && url.trim().length > 0 && anonKey.trim().length > 0);
}

/**
 * Asynchronously checks /api/supabase-config and initializes Supabase client if server has credentials
 */
export async function checkAndInitSupabase(): Promise<{ configured: boolean; hasCommentedLines?: boolean }> {
  if (isSupabaseConfigured()) {
    return { configured: true };
  }
  if (typeof window === 'undefined') {
    return { configured: false };
  }
  try {
    const res = await fetch('/api/supabase-config', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.configured && data.url && data.anonKey) {
        setRuntimeSupabaseConfig({ url: data.url, anonKey: data.anonKey });
        return { configured: true };
      }
      return { configured: false, hasCommentedLines: Boolean(data.hasCommentedLines) };
    }
  } catch (err) {
    console.warn('Could not fetch Supabase runtime configuration:', err);
  }
  return { configured: false };
}

/**
 * Get active storage mode preference: 'local' (device-only) or 'supabase' (cloud sync)
 */
export function getStorageMode(): 'local' | 'supabase' {
  if (typeof window === 'undefined') return 'local';
  const saved = localStorage.getItem(STORAGE_MODE_KEY);
  if (saved === 'supabase' && isSupabaseConfigured()) {
    return 'supabase';
  }
  return 'local';
}

/**
 * Update storage mode preference
 */
export function setStorageMode(mode: 'local' | 'supabase'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  }
}

/**
 * Returns the Supabase configuration from runtime or environment variables
 */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  if (runtimeConfig?.url && runtimeConfig?.anonKey) {
    return runtimeConfig;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey && url.trim().length > 0 && anonKey.trim().length > 0) {
    return { url: url.trim(), anonKey: anonKey.trim() };
  }
  return null;
}

/**
 * Returns or initializes the singleton Supabase client
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Authentication Helpers
// ---------------------------------------------------------------------------

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured in environment variables.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  });

  return { user: data.user, session: data.session, error: error ? new Error(error.message) : null };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured in environment variables.');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, session: data.session, error: error ? new Error(error.message) : null };
}

/**
 * Sign in with passwordless Magic Link (captured in local Inbucket at http://127.0.0.1:54324)
 */
export async function signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured in environment variables.');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Sign in with Google OAuth (works for both local Supabase and Supabase Cloud)
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: new Error('Supabase is not configured in environment variables.') };

  try {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err: any) {
    return { error: new Error(err?.message || 'Google sign in failed.') };
  }
}

/**
 * Sign out user from current session
 */
export async function signOutSupabase(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

/**
 * Listen to Auth State changes (login, logout, token refresh)
 */
export function onAuthStateChange(callback: (user: User | null) => void): (() => void) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}
