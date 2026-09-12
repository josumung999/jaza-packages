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

  return fetch(path, {
    ...rest,
    headers: nextHeaders,
  });
}
