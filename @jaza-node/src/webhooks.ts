import { createHmac, timingSafeEqual } from 'node:crypto';
import { JazaError } from './errors.js';
import type { WebhookEvent, WebhookEventType } from './types.js';

const DEFAULT_TOLERANCE_SEC = 300;

function parseSignatureHeader(header: string): { timestamp: number; v1: string } {
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const [k, ...rest] = p.trim().split('=');
      return [k, rest.join('=')];
    }),
  );
  const timestamp = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(timestamp) || !v1) {
    throw new JazaError('Invalid Jaza-Signature header', {
      statusCode: 0,
      code: 'webhook_signature_invalid',
    });
  }
  return { timestamp, v1 };
}

/**
 * Verify `Jaza-Signature` and parse the JSON event body.
 * Throws `JazaError` on invalid signature, stale timestamp, or bad JSON.
 */
export function constructEvent(
  rawBody: string | Buffer,
  signatureHeader: string,
  secret: string,
  options?: { toleranceSec?: number },
): WebhookEvent {
  if (!secret?.trim()) {
    throw new JazaError('webhook secret is required', {
      statusCode: 0,
      code: 'invalid_config',
    });
  }
  if (!signatureHeader?.trim()) {
    throw new JazaError('Jaza-Signature header is required', {
      statusCode: 0,
      code: 'webhook_signature_invalid',
    });
  }

  const body =
    typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const { timestamp, v1 } = parseSignatureHeader(signatureHeader);
  const tolerance = options?.toleranceSec ?? DEFAULT_TOLERANCE_SEC;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    throw new JazaError('Webhook signature timestamp outside tolerance', {
      statusCode: 0,
      code: 'webhook_signature_timestamp',
    });
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(v1, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new JazaError('Webhook signature verification failed', {
      statusCode: 0,
      code: 'webhook_signature_invalid',
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new JazaError('Webhook body is not valid JSON', {
      statusCode: 0,
      code: 'webhook_payload_invalid',
    });
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof (parsed as WebhookEvent).id !== 'string' ||
    typeof (parsed as WebhookEvent).type !== 'string' ||
    typeof (parsed as WebhookEvent).created !== 'number' ||
    typeof (parsed as WebhookEvent).data !== 'object'
  ) {
    throw new JazaError('Webhook payload missing required fields', {
      statusCode: 0,
      code: 'webhook_payload_invalid',
    });
  }

  return parsed as WebhookEvent;
}

export const WEBHOOK_EVENT_TYPES = [
  'jaza.webhook.topUp.pending',
  'jaza.webhook.topUp.completed',
  'jaza.webhook.topUp.failed',
  'jaza.webhook.consumption.succeeded',
  'jaza.webhook.consumption.insufficient_credits',
  'jaza.webhook.consumption.failed',
] as const satisfies readonly WebhookEventType[];
