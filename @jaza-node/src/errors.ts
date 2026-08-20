import type { JazaErrorBody } from './types.js';

export class JazaError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly raw: unknown;

  constructor(message: string, options: {
    statusCode: number;
    code?: string;
    raw?: unknown;
  }) {
    super(message);
    this.name = 'JazaError';
    this.statusCode = options.statusCode;
    this.code = options.code ?? 'api_error';
    this.raw = options.raw ?? null;
  }

  static fromResponse(statusCode: number, body: unknown): JazaError {
    const parsed = (body ?? {}) as JazaErrorBody;
    const message =
      typeof parsed.message === 'string'
        ? parsed.message
        : `Jaza API request failed with status ${statusCode}`;
    const code =
      typeof parsed.error === 'string'
        ? parsed.error
        : statusCode === 401
          ? 'unauthorized'
          : statusCode === 404
            ? 'not_found'
            : statusCode === 409
              ? 'conflict'
              : statusCode === 400
                ? 'bad_request'
                : 'api_error';
    return new JazaError(message, { statusCode, code, raw: body });
  }
}
