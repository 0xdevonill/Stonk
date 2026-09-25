import { mockFetch } from './client';
import { loadLiveCandle, loadTokenStats } from '../market/chain';
import { createAccount } from './mock';
import type { ActivitySnapshot, ChartTimeframe, EarnAsset, HolderSnapshot } from './types';

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
/** Market reads come from the token contract. `?fault=` still fails a block on purpose. */

export async function fetchTokenStats() {
  return mockFetch('stats', await loadTokenStats());
}

export async function fetchChart(timeframe: ChartTimeframe) {
  void timeframe;
  return mockFetch('chart', await loadLiveCandle());
}

export function fetchHolders(): Promise<HolderSnapshot> {
  return mockFetch('holders', { segments: [], holders: [], illustrative: false });
}

export function fetchActivity(): Promise<ActivitySnapshot> {
  return mockFetch('activity', { items: [], buyPct: 0, sellPct: 0, illustrative: false });
}

export function fetchStaking() {
  return mockFetch('staking', {
    aprPct: null,
    lockDays: null,
    totalStaked: null,
    illustrative: false,
  });
}

export function fetchEarn(): Promise<{ assets: EarnAsset[] }> {
  return mockFetch('earn', { assets: [] });
}

export function fetchPortfolio() {
  return mockFetch('portfolio', createAccount());
}

export function fetchTokenomics() {
  return mockFetch('tokenomics', {
    tokenomics: { slices: [], illustrative: false },
    commission: { accruedUsd: null, epochLabel: 'Not published by this contract', illustrative: false },
  });
}
