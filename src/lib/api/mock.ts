import type {
  AccountSnapshot,
  ActivityItem,
  ActivityKind,
  ActivitySnapshot,
  Candle,
  ChartTimeframe,
  CommissionSnapshot,
  EarnAsset,
  HolderSnapshot,
  PerformancePoint,
  PortfolioRange,
  StakingMarket,
  TokenomicsSnapshot,
  TokenStats,
} from './types';

/** Illustrative market snapshot. Not a live quote. */
export const MOCK_PRICE_USD = 0.842;
export const MOCK_ETH_PRICE_USD = 3184.2;
export const MOCK_TOTAL_SUPPLY = 100_000_000;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexAddress(rand: () => number): string {
  let out = '0x';
  for (let i = 0; i < 40; i += 1) {
    out += Math.floor(rand() * 16).toString(16);
  }
  return out;
}

const timeframePlan: Record<ChartTimeframe, { count: number; stepMs: number; seed: number }> = {
  '1H': { count: 60, stepMs: 60_000, seed: 11 },
  '4H': { count: 48, stepMs: 5 * 60_000, seed: 23 },
  '1D': { count: 48, stepMs: 30 * 60_000, seed: 41 },
  '1W': { count: 42, stepMs: 4 * 60 * 60_000, seed: 67 },
  '1M': { count: 30, stepMs: 24 * 60 * 60_000, seed: 89 },
  '3M': { count: 45, stepMs: 2 * 24 * 60 * 60_000, seed: 101 },
  '1Y': { count: 52, stepMs: 7 * 24 * 60 * 60_000, seed: 131 },
};

export function buildCandles(timeframe: ChartTimeframe, endPrice = MOCK_PRICE_USD): Candle[] {
  const plan = timeframePlan[timeframe];
  const rand = mulberry32(plan.seed);
  let price = endPrice * 0.86;
  const raw: Candle[] = [];
  const now = Date.now();

  for (let i = plan.count - 1; i >= 0; i -= 1) {
    const drift = (rand() - 0.46) * 0.035;
    const open = price;
    const close = Math.max(0.05, open * (1 + drift));
    const high = Math.max(open, close) * (1 + rand() * 0.012);
    const low = Math.min(open, close) * (1 - rand() * 0.012);
    const volume = 80_000 + rand() * 640_000 * (1 + Math.abs(drift) * 8);
    raw.push({
      time: now - i * plan.stepMs,
      open,
      high,
      low,
      close,
      volume,
    });
    price = close;
  }

  const scale = endPrice / raw[raw.length - 1].close;
  return raw.map((candle) => ({
    ...candle,
    open: candle.open * scale,
    high: candle.high * scale,
    low: candle.low * scale,
    close: candle.close * scale,
  }));
}

function sparklineFrom(candles: Candle[]): number[] {
  const step = Math.max(1, Math.floor(candles.length / 24));
  const points: number[] = [];
  for (let i = 0; i < candles.length; i += step) points.push(candles[i].close);
  points.push(candles[candles.length - 1].close);
  return points;
}

const dayCandles = buildCandles('1D');

export function createTokenStats(): TokenStats {
  const priceUsd = MOCK_PRICE_USD;
  const change24hPct = 6.4;
  return {
    symbol: 'STONK',
    name: 'Mr.Stonk',
    priceUsd,
    change24hPct,
    change24hUsd: priceUsd - priceUsd / (1 + change24hPct / 100),
    marketCapUsd: priceUsd * MOCK_TOTAL_SUPPLY,
    liquidityUsd: 6_400_000,
    volume24hUsd: 2_180_000,
    holders: 12_840,
    transactions24h: 6_421,
    stakedAmount: 18_400_000,
    ethPriceUsd: MOCK_ETH_PRICE_USD,
    ethChange24hPct: -0.82,
    sparkline: sparklineFrom(dayCandles),
    totalSupply: MOCK_TOTAL_SUPPLY,
    illustrative: true,
  };
}

function holderWeights(count: number): number[] {
  return Array.from({ length: count }, (_, index) => 1 / (index + 1) ** 0.82);
}

export function createHolders(priceUsd = MOCK_PRICE_USD): HolderSnapshot {
  const count = 100;
  const rand = mulberry32(404);
  const weights = holderWeights(count);
  const sum = weights.reduce((total, weight) => total + weight, 0);
  const holders = weights.map((weight, index) => {
    const sharePct = (weight / sum) * 100;
    const balance = (sharePct / 100) * MOCK_TOTAL_SUPPLY;
    return {
      rank: index + 1,
      address: hexAddress(rand),
      balance,
      sharePct,
      valueUsd: balance * priceUsd,
    };
  });

  const top10 = holders.slice(0, 10).reduce((total, row) => total + row.sharePct, 0);
  const next40 = holders.slice(10, 50).reduce((total, row) => total + row.sharePct, 0);
  const rest = Math.max(0, 100 - top10 - next40);

  return {
    illustrative: true,
    holders,
    segments: [
      { id: 'top10', label: 'Top 10', sharePct: top10 },
      { id: 'next40', label: 'Ranks 11–50', sharePct: next40 },
      { id: 'rest', label: 'Everyone else', sharePct: rest },
    ],
  };
}

const activityKinds: ActivityKind[] = [
  'buy',
  'buy',
  'sell',
  'buy',
  'transfer',
  'stake',
  'sell',
  'buy',
  'claim',
  'sell',
  'buy',
  'unstake',
];

export function createActivity(priceUsd = MOCK_PRICE_USD, now = Date.now()): ActivitySnapshot {
  const rand = mulberry32(808);
  const items: ActivityItem[] = activityKinds.map((kind, index) => {
    const amount = 400 + rand() * 18_000;
    return {
      id: `act-${index + 1}`,
      kind,
      address: hexAddress(rand),
      amount,
      symbol: 'STONK',
      valueUsd: amount * priceUsd,
      time: now - (index + 1) * 75_000 - Math.floor(rand() * 20_000),
    };
  });

  const trades = items.filter((item) => item.kind === 'buy' || item.kind === 'sell');
  const buy = trades.filter((item) => item.kind === 'buy').length;
  const sell = trades.filter((item) => item.kind === 'sell').length;
  const total = Math.max(1, buy + sell);

  return {
    illustrative: true,
    items,
    buyPct: (buy / total) * 100,
    sellPct: (sell / total) * 100,
  };
}

let liveSeq = 0;

export function nextActivity(priceUsd: number, now = Date.now()): ActivityItem {
  liveSeq += 1;
  const kinds: ActivityKind[] = ['buy', 'sell', 'buy', 'transfer', 'stake'];
  const kind = kinds[liveSeq % kinds.length];
  const rand = mulberry32(now % 100000 + liveSeq);
  const amount = 250 + rand() * 9000;
  return {
    id: `live-${liveSeq}`,
    kind,
    address: hexAddress(rand),
    amount,
    symbol: 'STONK',
    valueUsd: amount * priceUsd,
    time: now,
  };
}

export function createStaking(): StakingMarket {
  return {
    aprPct: 11.5,
    lockDays: 30,
    totalStaked: 18_400_000,
    illustrative: true,
  };
}

export function createEarnAssets(): EarnAsset[] {
  return [
    {
      id: 'stonk',
      name: 'Stonk',
      ticker: 'STONK',
      priceUsd: MOCK_PRICE_USD,
      change24hPct: 6.4,
      eligibility: 'eligible',
      blurb: 'Spot balance held in your wallet.',
    },
    {
      id: 'stonk-stake',
      name: 'Staked Stonk',
      ticker: 'sSTONK',
      priceUsd: MOCK_PRICE_USD,
      change24hPct: 6.4,
      eligibility: 'eligible',
      blurb: 'Locked position. Rewards are estimated.',
    },
    {
      id: 'stonk-eth',
      name: 'STONK / ETH',
      ticker: 'STONK-ETH',
      priceUsd: 42.18,
      change24hPct: 3.1,
      eligibility: 'eligible',
      blurb: 'Pool receipt for the configured router.',
    },
    {
      id: 'rh-receipt',
      name: 'Robinhood Network Receipt',
      ticker: 'RNR',
      priceUsd: 1,
      change24hPct: 0,
      eligibility: 'soon',
      blurb: 'Tokenized-asset path. Not open in this build.',
    },
    {
      id: 'treasury',
      name: 'Treasury Note',
      ticker: 'TNOTE',
      priceUsd: 0.998,
      change24hPct: 0.02,
      eligibility: 'ineligible',
      blurb: 'Restricted to the treasury address.',
    },
    {
      id: 'creator',
      name: 'Creator Stream',
      ticker: 'CSTR',
      priceUsd: 12.4,
      change24hPct: -1.4,
      eligibility: 'ineligible',
      blurb: 'Streams to the creator address only.',
    },
  ];
}

export function createTokenomics(): TokenomicsSnapshot {
  return {
    illustrative: true,
    slices: [
      { id: 'liquidity', label: 'Liquidity', sharePct: 35, detail: 'Seeded into the pool so the book can clear.' },
      { id: 'community', label: 'Community', sharePct: 25, detail: 'Distributed to holders and public programs.' },
      { id: 'rewards', label: 'Staking rewards', sharePct: 15, detail: 'Emissions that fund the estimated APR.' },
      { id: 'treasury', label: 'Treasury', sharePct: 10, detail: 'Held for operations. Not a promise of buybacks.' },
      { id: 'contributors', label: 'Contributors', sharePct: 10, detail: 'Allocated to people who build the terminal.' },
      { id: 'creator', label: 'Creator commission', sharePct: 5, detail: 'A fixed share of the draft allocation.' },
    ],
  };
}

export function createCommission(): CommissionSnapshot {
  return {
    accruedUsd: 42_860.19,
    epochLabel: 'Current epoch',
    illustrative: true,
  };
}

function performanceSeries(range: PortfolioRange, endValue: number): PerformancePoint[] {
  const plan: Record<PortfolioRange, { count: number; stepMs: number; seed: number }> = {
    '1D': { count: 48, stepMs: 30 * 60_000, seed: 501 },
    '1W': { count: 42, stepMs: 4 * 60 * 60_000, seed: 502 },
    '1M': { count: 30, stepMs: 24 * 60 * 60_000, seed: 503 },
    '3M': { count: 36, stepMs: 2 * 24 * 60 * 60_000, seed: 504 },
    '1Y': { count: 52, stepMs: 7 * 24 * 60 * 60_000, seed: 505 },
    ALL: { count: 60, stepMs: 14 * 24 * 60 * 60_000, seed: 506 },
  };
  const { count, stepMs, seed } = plan[range];
  const rand = mulberry32(seed);
  const now = Date.now();
  let value = endValue * 0.78;
  const points: PerformancePoint[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    value = Math.max(1000, value * (1 + (rand() - 0.47) * 0.03));
    points.push({ time: now - i * stepMs, value });
  }
  const scale = endValue / points[points.length - 1].value;
  return points.map((point) => ({ ...point, value: point.value * scale }));
}

export function createAccount(): AccountSnapshot {
  const balances = { ETH: 1.85, STONK: 15_000 };
  const endValue = balances.ETH * MOCK_ETH_PRICE_USD + balances.STONK * MOCK_PRICE_USD;
  const ranges: PortfolioRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  const performance = Object.fromEntries(ranges.map((range) => [range, performanceSeries(range, endValue)])) as Record<
    PortfolioRange,
    PerformancePoint[]
  >;

  return {
    illustrative: true,
    balances,
    staked: 0,
    pendingRewards: 0,
    tokenized: [
      {
        id: 'rh-receipt',
        name: 'Robinhood Network Receipt',
        ticker: 'RNR',
        amount: 0,
        valueUsd: 0,
        change24hPct: 0,
      },
    ],
    history: createActivity().items.slice(0, 8).map((item) => ({
      ...item,
      address: '0x4F2A91C8bE10d0A77E51c84B0eA6D3C19B7a0042',
    })),
    performance,
  };
}

export function rescaleHolders(snapshot: HolderSnapshot, priceUsd: number): HolderSnapshot {
  return {
    ...snapshot,
    holders: snapshot.holders.map((row) => ({ ...row, valueUsd: row.balance * priceUsd })),
  };
}
