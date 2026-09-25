import type { FaultKey } from './types';

const LATENCY_MS = 420;

const faultMessages: Record<FaultKey, string> = {
  stats: "Couldn't load market stats — retry",
  chart: "Couldn't load chart data — retry",
  holders: "Couldn't load holders — retry",
  activity: "Couldn't load activity — retry",
  staking: "Couldn't load staking data — retry",
  earn: "Couldn't load earn markets — retry",
  portfolio: "Couldn't load portfolio — retry",
  tokenomics: "Couldn't load tokenomics — retry",
};

function readFault(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('fault');
}

export function delay(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Mock-mode fetch. Returns a structured clone of the fixture after a short delay.
 * Pass `?fault=<key>` to simulate a failure for that resource.
 */
export async function mockFetch<T>(key: FaultKey, data: T): Promise<T> {
  await delay();
  if (readFault() === key) {
    throw new Error(faultMessages[key]);
  }
  return structuredClone(data);
}

export function faultMessage(key: FaultKey): string {
  return faultMessages[key];
}
