import { DEFAULT_API_BASE_URL } from '../version.js';

export const PAYWALL_INSUFFICIENT_EVENT = 'jaza.paywall.insufficient_credits';

export type PaywallInsufficientPayload = {
  featureCode?: string;
  requiredCredits: number;
  balanceCredits: number;
  customerId: string | null;
};

export type RealtimeMessage = {
  event: string;
  data?: unknown;
};

function toWsBaseUrl(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.replace(/\/$/, '');
  if (trimmed.startsWith('https://')) {
    return `wss://${trimmed.slice('https://'.length)}`;
  }
  if (trimmed.startsWith('http://')) {
    return `ws://${trimmed.slice('http://'.length)}`;
  }
  return trimmed;
}

export type ClientRealtimeConfig = {
  publishableKey: string;
  apiBaseUrl?: string;
  getSessionToken: () => string | null;
  onPaywallInsufficient: (payload: PaywallInsufficientPayload) => void;
  onError?: (err: Error) => void;
};

/**
 * Thin WebSocket client for `/v1/client/realtime`.
 * Auth: `?token=<client session JWT>&pk=<publishable key>`.
 */
export class ClientRealtime {
  private socket: WebSocket | null = null;
  private intentionalClose = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly apiBaseUrl: string;

  constructor(private readonly config: ClientRealtimeConfig) {
    this.apiBaseUrl = config.apiBaseUrl ?? DEFAULT_API_BASE_URL;
  }

  connect(): void {
    this.intentionalClose = false;
    const token = this.config.getSessionToken()?.trim();
    if (!token) return;

    this.disconnectSocketOnly();

    const url = `${toWsBaseUrl(this.apiBaseUrl)}/v1/client/realtime?token=${encodeURIComponent(token)}&pk=${encodeURIComponent(this.config.publishableKey)}`;
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onmessage = (event) => {
      try {
        const raw =
          typeof event.data === 'string'
            ? event.data
            : String(event.data ?? '');
        const parsed = JSON.parse(raw) as RealtimeMessage;
        if (
          parsed.event === PAYWALL_INSUFFICIENT_EVENT &&
          parsed.data &&
          typeof parsed.data === 'object'
        ) {
          this.config.onPaywallInsufficient(
            parsed.data as PaywallInsufficientPayload,
          );
        }
      } catch (err) {
        this.config.onError?.(
          err instanceof Error ? err : new Error('Realtime parse error'),
        );
      }
    };

    socket.onerror = () => {
      this.config.onError?.(new Error('Realtime socket error'));
    };

    socket.onclose = () => {
      this.socket = null;
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.disconnectSocketOnly();
  }

  private disconnectSocketOnly(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        /* ignore */
      }
      this.socket = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 2500);
  }
}
