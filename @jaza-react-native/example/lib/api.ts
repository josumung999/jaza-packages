import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Base URL for Expo Router API routes.
 * On device/simulator, points at the Metro / Expo host serving +api handlers.
 */
export function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return '';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.experienceUrl?.replace(/^exp:\/\//, '') ??
    null;

  if (!hostUri) {
    return 'http://127.0.0.1:8081';
  }

  const host = hostUri.split('/')[0];
  return `http://${host}`;
}

export async function apiFetch(
  path: string,
  init: RequestInit & { userId?: string } = {},
): Promise<Response> {
  const { userId, headers, ...rest } = init;
  const nextHeaders = new Headers(headers);
  if (userId) {
    nextHeaders.set('X-User-Id', userId);
  }
  if (rest.body && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: nextHeaders,
  });
}
