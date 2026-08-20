import { JazaError } from './errors.js';
import { VERSION } from './version.js';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class HttpClient {
  constructor(
    private readonly apiBaseUrl: string,
    private readonly secretKey: string,
  ) {}

  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.apiBaseUrl.replace(/\/$/, '')}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      Accept: 'application/json',
      'User-Agent': `@jazadev/node/${VERSION}`,
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = { message: text };
      }
    }

    if (!response.ok) {
      throw JazaError.fromResponse(response.status, parsed);
    }

    return parsed as T;
  }
}
