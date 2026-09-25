export interface TokenStats {
  symbol: string;
  name: string;
  quoteSymbol: string;
  quoteToken: string;
  curveAddress: string;
  priceUsd: number;
  quotePriceUsd: number | null;
  change24hPct: number | null;
  change24hUsd: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  holders: number | null;
  transactions24h: number | null;
  stakedAmount: number | null;
  ethPriceUsd: number | null;
  ethChange24hPct: number | null;
  takerFeeBps: number | null;
  sparkline: number[];
  totalSupply: number;
  illustrative: boolean;
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
  illustrative: boolean;
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
  illustrative: boolean;
}

export interface StakingMarket {
  aprPct: number | null;
  lockDays: number | null;
  totalStaked: number | null;
  illustrative: boolean;
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
  illustrative: boolean;
}

export interface CommissionSnapshot {
  accruedUsd: number | null;
  epochLabel: string;
  illustrative: boolean;
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
  illustrative: boolean;
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
