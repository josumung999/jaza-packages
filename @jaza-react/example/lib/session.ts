import type { SessionUser } from './types';

const SESSION_KEY = 'jaza.sample.session';

export async function getSession(): Promise<SessionUser | null> {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSession(session: SessionUser): Promise<void> {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  window.localStorage.removeItem(SESSION_KEY);
}
