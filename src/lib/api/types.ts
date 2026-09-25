export interface TokenStats {
  symbol: string;
  name: string;
  priceUsd: number;
  change24hPct: number;
  change24hUsd: number;
  marketCapUsd: number;
  liquidityUsd: number;
  volume24hUsd: number;
  holders: number;
  transactions24h: number;
  stakedAmount: number;
  ethPriceUsd: number;
  ethChange24hPct: number;
  sparkline: number[];
  totalSupply: number;
  illustrative: true;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ChartTimeframe = '1H' | '4H' | '1D' | '1W' | '1M' | '3M' | '1Y';

export const CHART_TIMEFRAMES: ChartTimeframe[] = ['1H', '4H', '1D', '1W', '1M', '3M', '1Y'];

export interface HolderRow {
  rank: number;
  address: string;
  balance: number;
  sharePct: number;
  valueUsd: number;
}

export interface DistributionSegment {
  id: string;
  label: string;
  sharePct: number;
}

export interface HolderSnapshot {
  segments: DistributionSegment[];
  holders: HolderRow[];
  illustrative: true;
}

export type ActivityKind = 'buy' | 'sell' | 'stake' | 'unstake' | 'transfer' | 'claim';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  address: string;
  amount: number;
  symbol: string;
  valueUsd: number;
  time: number;
}

export interface ActivitySnapshot {
  items: ActivityItem[];
  buyPct: number;
  sellPct: number;
  illustrative: true;
}

export interface StakingMarket {
  aprPct: number;
  lockDays: number;
  totalStaked: number;
  illustrative: true;
}

export type EarnEligibility = 'eligible' | 'ineligible' | 'soon';

export interface EarnAsset {
  id: string;
  name: string;
  ticker: string;
  priceUsd: number;
  change24hPct: number;
  eligibility: EarnEligibility;
  blurb: string;
}

export interface TokenomicsSlice {
  id: string;
  label: string;
  sharePct: number;
  detail: string;
}

export interface TokenomicsSnapshot {
  slices: TokenomicsSlice[];
  illustrative: true;
}

export interface CommissionSnapshot {
  accruedUsd: number;
  epochLabel: string;
  illustrative: true;
}

export type PortfolioRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const PORTFOLIO_RANGES: PortfolioRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export interface PerformancePoint {
  time: number;
  value: number;
}

export interface TokenizedPosition {
  id: string;
  name: string;
  ticker: string;
  amount: number;
  valueUsd: number;
  change24hPct: number;
}

export interface AccountSnapshot {
  balances: { ETH: number; STONK: number };
  staked: number;
  pendingRewards: number;
  tokenized: TokenizedPosition[];
  history: ActivityItem[];
  performance: Record<PortfolioRange, PerformancePoint[]>;
  illustrative: true;
}

export type FaultKey =
  | 'stats'
  | 'chart'
  | 'holders'
  | 'activity'
  | 'staking'
  | 'earn'
  | 'portfolio'
  | 'tokenomics';
