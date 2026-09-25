/** Pure quote math. Figures come from the caller — this module has no market snapshot. */

export const GAS_RESERVE_ETH = 0.002;
export const DEFAULT_SLIPPAGE_PCT = 0.5;
export const SLIPPAGE_PRESETS = [0.1, 0.5, 1] as const;

const IMPACT_USD_DIVISOR = 500_000;
const NETWORK_FEE_USD = 1.15;

export interface SwapQuote {
  amountIn: number;
  amountOut: number | null;
  rate: number | null;
  impactPct: number | null;
  feeUsd: number | null;
  minReceived: number | null;
  valueUsd: number | null;
}

export function quoteSwap(input: {
  amountIn: number;
  priceIn: number | null;
  priceOut: number | null;
  slippagePct: number;
}): SwapQuote {
  const { amountIn, priceIn, priceOut, slippagePct } = input;
  if (!(amountIn > 0) || priceIn == null || priceOut == null || !(priceOut > 0)) {
    return {
      amountIn,
      amountOut: null,
      rate: null,
      impactPct: null,
      feeUsd: null,
      minReceived: null,
      valueUsd: null,
    };
  }

  const valueUsd = amountIn * priceIn;
  const amountOut = valueUsd / priceOut;
  const impactPct = Math.min(25, (valueUsd / IMPACT_USD_DIVISOR) * 100);
  const minReceived = amountOut * (1 - slippagePct / 100);

  return {
    amountIn,
    amountOut,
    rate: priceIn / priceOut,
    impactPct,
    feeUsd: NETWORK_FEE_USD,
    minReceived,
    valueUsd,
  };
}

export function projectedRewards(amount: number, aprPct: number | null): {
  daily: number | null;
  weekly: number | null;
  monthly: number | null;
  yearly: number | null;
} {
  if (!(amount > 0) || aprPct == null || !Number.isFinite(aprPct)) {
    return { daily: null, weekly: null, monthly: null, yearly: null };
  }
  const yearly = amount * (aprPct / 100);
  return {
    daily: yearly / 365,
    weekly: yearly / 52,
    monthly: yearly / 12,
    yearly,
  };
}

export function exceedsSlippage(impactPct: number | null, slippagePct: number): boolean {
  if (impactPct == null) return false;
  return impactPct > slippagePct;
}
