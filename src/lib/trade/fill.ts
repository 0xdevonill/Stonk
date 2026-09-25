import type { Account } from '../../context/WalletContext';
import type { ActivityItem, ActivityKind } from '../api';

export type Fill =
  | { type: 'swap'; spend: 'ETH' | 'STONK'; receive: 'ETH' | 'STONK'; amountIn: number; amountOut: number }
  | { type: 'stake'; amount: number; rewardSeed: number }
  | { type: 'unstake'; amount: number }
  | { type: 'claim'; amount: number };

export interface OrderDraft {
  kind: ActivityKind | 'swap';
  title: string;
  summary: string;
  amountLabel: string;
  impactPct: number | null;
  feeLabel: string;
  slippagePct: number;
  fill: Fill;
}

export function applyFill(account: Account, fill: Fill): Account {
  const balances = { ...account.balances };
  let staked = account.staked;
  let pendingRewards = account.pendingRewards;

  if (fill.type === 'swap') {
    balances[fill.spend] -= fill.amountIn;
    balances[fill.receive] += fill.amountOut;
  } else if (fill.type === 'stake') {
    balances.STONK -= fill.amount;
    staked += fill.amount;
    pendingRewards += fill.rewardSeed;
  } else if (fill.type === 'unstake') {
    balances.STONK += fill.amount;
    staked -= fill.amount;
  } else {
    balances.STONK += fill.amount;
    pendingRewards = 0;
  }

  return { ...account, balances, staked, pendingRewards };
}

export function historyFromFill(address: string, fill: Fill, priceUsd: number): ActivityItem {
  const kind: ActivityKind =
    fill.type === 'swap' ? (fill.receive === 'STONK' ? 'buy' : 'sell') : fill.type === 'claim' ? 'claim' : fill.type;
  const amount = fill.type === 'swap' ? (fill.receive === 'STONK' ? fill.amountOut : fill.amountIn) : fill.amount;
  return {
    id: `local-${Date.now()}`,
    kind,
    address,
    amount,
    symbol: 'STONK',
    valueUsd: amount * priceUsd,
    time: Date.now(),
  };
}
