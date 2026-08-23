import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionUser } from './types';

const SESSION_KEY = 'jaza.sample.session';

export async function getSession(): Promise<SessionUser | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function setSession(session: SessionUser): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
