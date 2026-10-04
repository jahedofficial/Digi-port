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

export const getStoredAuthUser = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
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
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to update auth user in localStorage', e);
  }
};
