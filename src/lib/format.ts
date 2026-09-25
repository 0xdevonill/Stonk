export const PLACEHOLDER_NUMBER = '--';
export const PLACEHOLDER_PERCENT = 'XX%';

function adaptiveDigits(abs: number): number {
  if (abs >= 1000) return 2;
  if (abs >= 0.01) return 4;
  if (abs >= 0.0001) return 6;
  if (abs === 0) return 2;
  return Math.min(12, Math.ceil(-Math.log10(abs)) + 3);
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER_NUMBER;
  const digits = adaptiveDigits(Math.abs(value));
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(digits, 2),
    maximumFractionDigits: digits,
  });
}

export function formatUsd(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER_NUMBER;
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatStatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER_NUMBER;
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  return formatUsd(value);
}

export function formatCompact(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER_NUMBER;
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatToken(value: number | null | undefined, digits?: number): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER_NUMBER;
  const abs = Math.abs(value);
  const fraction = digits ?? adaptiveDigits(abs);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fraction,
  });
}

export function formatPct(value: number | null | undefined, withSign = true): string {
  if (value == null || !Number.isFinite(value)) return PLACEHOLDER_PERCENT;
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatAddress(address: string, head = 6, tail = 4): string {
  if (!address) return PLACEHOLDER_NUMBER;
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function formatRelative(time: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  return `${cleaned.slice(0, dot + 1)}${cleaned.slice(dot + 1).replace(/\./g, '')}`;
}

export function trimAmount(value: number): string {
  if (!Number.isFinite(value)) return '';
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 1000) return value.toFixed(2);
  if (abs >= 1) return value.toFixed(4);
  if (abs >= 0.000001) return value.toFixed(6);
  return value.toPrecision(6);
}

export function parseAmount(raw: string): number | null {
  if (!raw || raw === '.') return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value;
}
