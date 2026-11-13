import { UserProfile } from '@/types';

export const DEMO_USERS: (UserProfile & { passwordHint: string; description: string })[] = [
  {
    id: 'user_jahed_gmail',
    name: 'Jahed Shomaddar',
    email: 'jahedshomadan@gmail.com',
    role: 'SUPER_ADMIN',
    initials: 'JS',
    passwordHint: 'admin123',
    description: 'Super Admin • Primary Executive Command',
    lastLoginAt: 'Just now',
  },
  {
    id: 'user_jahed_agency',
    name: 'Jahed Shomaddar',
    email: 'jahed@digitalmarketr.com',
    role: 'SUPER_ADMIN',
    initials: 'JS',
    passwordHint: 'admin123',
    description: 'Super Admin • Full Agency Command Access',
    lastLoginAt: 'Just now',
  },
];

export const AUTH_STORAGE_KEY = 'digital_marketr_authenticated_user_v1';
export const AUTH_EXPIRY_KEY = 'digital_marketr_auth_session_expiry_v1';
export const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour session duration

export const getStoredAuthUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    // Check 1-hour session expiration
    const rawExpiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    if (rawExpiry) {
      const expiresAt = parseInt(rawExpiry, 10);
      if (Date.now() > expiresAt) {
        // 1 hour elapsed: session expired
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_EXPIRY_KEY);
        return null;
      }
    }

    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    console.error('Failed to read auth user from localStorage', e);
    return null;
  }
};

export const setStoredAuthUser = (user: UserProfile | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      const now = Date.now();
      const expiresAt = now + SESSION_DURATION_MS; // 1 hour from login
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_EXPIRY_KEY, expiresAt.toString());
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
    }
  } catch (e) {
    console.error('Failed to update auth user in localStorage', e);
  }
};

export const getSessionRemainingSeconds = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const rawExpiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    if (!rawExpiry) return 0;
    const expiresAt = parseInt(rawExpiry, 10);
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  } catch {
    return 0;
  }
};
