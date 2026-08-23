export type JazaSdkErrorBody = {
  statusCode?: number;
  message?: string | { message?: string };
  error?: string;
};

export class JazaSdkError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly raw: unknown;

  constructor(statusCode: number, message: string, raw?: unknown) {
    super(message);
    this.name = 'JazaSdkError';
    this.statusCode = statusCode;
    this.code = `HTTP_${statusCode}`;
    this.raw = raw;
  }

  static fromResponse(status: number, body: unknown): JazaSdkError {
    let message = `Request failed (${status})`;
    if (typeof body === 'object' && body !== null) {
      const m = (body as JazaSdkErrorBody).message;
      if (typeof m === 'string') {
        message = m;
      } else if (typeof m === 'object' && m?.message) {
        message = m.message;
      }
    }
    return new JazaSdkError(status, message, body);
  }
}
