import { AppUser, UserRole } from '../types/admin';
import { getSupabaseClient } from './supabaseClient';

const ROLES_STORAGE_KEY = 'ccr_app_roles_v1';
const BLOCKED_USERS_STORAGE_KEY = 'ccr_blocked_users_v1';

// Default super admin is msawad08@gmail.com, configurable via NEXT_PUBLIC_SUPER_ADMIN_EMAILS
const DEFAULT_SUPER_ADMINS = ['msawad08@gmail.com'];

/**
 * Returns list of configured super admin emails
 */
export function getSuperAdminEmails(): string[] {
  const envVal = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS;
  if (!envVal || !envVal.trim()) return DEFAULT_SUPER_ADMINS;
  return envVal
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Checks whether an email belongs to a Super Admin
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return getSuperAdminEmails().includes(clean);
}

/**
 * Load all designated admin emails from local storage
 */
export function loadAdminEmails(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(ROLES_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save admin emails list to local storage
 */
export function saveAdminEmails(emails: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(emails));
}

/**
 * Load blocked users list
 */
export function loadBlockedUsers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(BLOCKED_USERS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Save blocked users list
 */
export function saveBlockedUsers(emails: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BLOCKED_USERS_STORAGE_KEY, JSON.stringify(emails));
}

/**
 * Check if an email is blocked
 */
export function isUserBlocked(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return loadBlockedUsers().includes(clean);
}

/**
 * Resolve effective role for a user email
 */
export function getUserRole(email?: string | null): UserRole {
  if (!email) return 'user';
  const clean = email.trim().toLowerCase();

  // Super admin takes precedence
  if (isSuperAdminEmail(clean)) return 'super_admin';

  // Check admin list
  const admins = loadAdminEmails();
  if (admins.includes(clean)) return 'admin';

  return 'user';
}

/**
 * Returns whether user has admin or super admin privileges
 */
export function canManageCards(email?: string | null): boolean {
  const role = getUserRole(email);
  return role === 'admin' || role === 'super_admin';
}

/**
 * Returns whether user has super admin privileges
 */
export function isSuperAdmin(email?: string | null): boolean {
  return getUserRole(email) === 'super_admin';
}

/**
 * Super Admin adds a new admin
 */
export async function addAdminUser(targetEmail: string, callerEmail: string): Promise<boolean> {
  if (!isSuperAdmin(callerEmail)) {
    throw new Error('Only a Super Admin can promote users to Admin.');
  }

  const clean = targetEmail.trim().toLowerCase();
  const list = loadAdminEmails();
  if (!list.includes(clean)) {
    list.push(clean);
    saveAdminEmails(list);
  }

  // Also sync to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').upsert({
        email: clean,
        role: 'admin',
      });
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * Super Admin removes an admin
 */
export async function removeAdminUser(targetEmail: string, callerEmail: string): Promise<boolean> {
  if (!isSuperAdmin(callerEmail)) {
    throw new Error('Only a Super Admin can remove admins.');
  }

  const clean = targetEmail.trim().toLowerCase();
  const list = loadAdminEmails().filter((e) => e !== clean);
  saveAdminEmails(list);

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').update({ role: 'user' }).eq('email', clean);
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * Super Admin blocks or unblocks a user
 */
export async function toggleBlockUser(targetEmail: string, callerEmail: string): Promise<boolean> {
  if (!isSuperAdmin(callerEmail)) {
    throw new Error('Only a Super Admin can block or unblock users.');
  }

  const clean = targetEmail.trim().toLowerCase();
  if (isSuperAdminEmail(clean)) {
    throw new Error('Cannot block a Super Admin.');
  }

  const list = loadBlockedUsers();
  let nowBlocked = false;
  if (list.includes(clean)) {
    // Unblock
    saveBlockedUsers(list.filter((e) => e !== clean));
    nowBlocked = false;
  } else {
    // Block
    list.push(clean);
    saveBlockedUsers(list);
    nowBlocked = true;
  }

  // Sync to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').update({ is_blocked: nowBlocked }).eq('email', clean);
    } catch {
      // ignore
    }
  }

  return nowBlocked;
}

/**
 * Super Admin fetches all users (from Supabase or local list)
 */
export async function fetchAllUsers(): Promise<AppUser[]> {
  const superAdmins = getSuperAdminEmails();
  const admins = loadAdminEmails();
  const blocked = loadBlockedUsers();

  const userMap = new Map<string, AppUser>();

  // Add super admins
  superAdmins.forEach((email) => {
    userMap.set(email, {
      id: `usr_${email}`,
      email,
      role: 'super_admin',
      isBlocked: false,
      createdAt: 'Default Super Admin',
    });
  });

  // Add admins
  admins.forEach((email) => {
    if (!userMap.has(email)) {
      userMap.set(email, {
        id: `usr_${email}`,
        email,
        role: 'admin',
        isBlocked: blocked.includes(email),
        createdAt: 'Promoted Admin',
      });
    }
  });

  // Add any known blocked users
  blocked.forEach((email) => {
    if (!userMap.has(email)) {
      userMap.set(email, {
        id: `usr_${email}`,
        email,
        role: 'user',
        isBlocked: true,
        createdAt: 'Blocked User',
      });
    }
  });

  // If Supabase is connected, fetch profiles
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase.from('profiles').select('*');
      if (data && Array.isArray(data)) {
        data.forEach((p) => {
          const email = (p.email || '').toLowerCase();
          if (email) {
            userMap.set(email, {
              id: p.id || `usr_${email}`,
              email,
              name: p.name,
              role: isSuperAdminEmail(email) ? 'super_admin' : (p.role as UserRole) || 'user',
              isBlocked: Boolean(p.is_blocked),
              createdAt: p.created_at || new Date().toISOString(),
            });
          }
        });
      }
    } catch {
      // fallback to local map
    }
  }

  return Array.from(userMap.values());
}
