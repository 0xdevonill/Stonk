import { mockFetch } from './client';
import {
  createAccount,
  createActivity,
  createCommission,
  createEarnAssets,
  createHolders,
  createStaking,
  createTokenomics,
  createTokenStats,
  buildCandles,
} from './mock';
import type { ChartTimeframe } from './types';

export type {
  AccountSnapshot,
  ActivityItem,
  ActivityKind,
  ActivitySnapshot,
  Candle,
  ChartTimeframe,
  CommissionSnapshot,
  DistributionSegment,
  EarnAsset,
  EarnEligibility,
  HolderRow,
  HolderSnapshot,
  PortfolioRange,
  StakingMarket,
  TokenomicsSlice,
  TokenStats,
  TokenomicsSnapshot,
} from './types';

export { CHART_TIMEFRAMES, PORTFOLIO_RANGES } from './types';
export { nextActivity } from './mock';

/** Typed fetchers. Each one is mock-mode only and can fail via `?fault=`. */

export function fetchTokenStats() {
  return mockFetch('stats', createTokenStats());
}

export function fetchChart(timeframe: ChartTimeframe) {
  return mockFetch('chart', { timeframe, candles: buildCandles(timeframe) });
}

export function fetchHolders() {
  return mockFetch('holders', createHolders());
}

export function fetchActivity() {
  return mockFetch('activity', createActivity());
}

export function fetchStaking() {
  return mockFetch('staking', createStaking());
}

export function fetchEarn() {
  return mockFetch('earn', { assets: createEarnAssets() });
}

export function fetchPortfolio() {
  return mockFetch('portfolio', createAccount());
}

export function fetchTokenomics() {
  return mockFetch('tokenomics', {
    tokenomics: createTokenomics(),
    commission: createCommission(),
  });
}
