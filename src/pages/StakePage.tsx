import { Lock, Wallet } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { useWallet } from '../context/WalletContext';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { useOrderSubmit } from '../hooks/useOrderSubmit';
import { useIsMobile } from '../hooks/useMediaQuery';
import { fetchStaking } from '../lib/api';
import { formatPct, formatToken, parseAmount, sanitizeAmount, PLACEHOLDER_NUMBER } from '../lib/format';
import { projectedRewards } from '../lib/trade/quote';
import { Button } from '../components/primitives/Button';
import { DataBoundary, EmptyState } from '../components/primitives/StateBlock';
import { BottomSheet } from '../components/overlays/BottomSheet';
import { tokenMeta } from '../lib/contracts/config';

export function StakePage() {
  usePageTitle('Stake');
  const staking = useQuery('staking', fetchStaking);
  const wallet = useWallet();
  const market = useMarket();
  const submit = useOrderSubmit();
  const mobile = useIsMobile();
  const [amount, setAmount] = useState('');
  const [sheet, setSheet] = useState(false);
  const parsed = parseAmount(amount);
  const rewards = useMemo(
    () => projectedRewards(parsed ?? 0, staking.data?.aprPct ?? null),
    [parsed, staking.data?.aprPct],
  );
  const balance = wallet.account?.balances.STONK ?? null;
  const over = parsed != null && balance != null && parsed > balance;

  function stake() {
    if (!wallet.account) {
      wallet.openConnect();
      return;
    }
    if (!wallet.networkOk) {
      void wallet.switchNetwork();
      return;
    }
    if (parsed == null || parsed <= 0 || over) return;
    const daily = rewards.daily ?? 0;
    submit({
      kind: 'stake',
      title: 'Stake $STONK',
      summary: `${formatToken(parsed)} ${tokenMeta.symbol} locked`,
      amountLabel: `${formatToken(parsed)} ${tokenMeta.symbol}`,
      impactPct: 0,
      feeLabel: PLACEHOLDER_NUMBER,
      slippagePct: 100,
      fill: { type: 'stake', amount: parsed, rewardSeed: daily },
    });
    setSheet(false);
  }

  function claim() {
    const pending = wallet.account?.pendingRewards ?? 0;
    if (!(pending > 0)) return;
    submit({
      kind: 'claim',
      title: 'Claim rewards',
      summary: `${formatToken(pending)} ${tokenMeta.symbol} estimated rewards`,
      amountLabel: `${formatToken(pending)} ${tokenMeta.symbol}`,
      impactPct: 0,
      feeLabel: PLACEHOLDER_NUMBER,
      slippagePct: 100,
      fill: { type: 'claim', amount: pending },
    });
  }

  const calculator = (
    <div className="panel">
      <h2 className="heading-sm">Calculator</h2>
      <label className="field">
        <span className="field-label">Amount</span>
        <input
          className="input num"
          inputMode="decimal"
          aria-label="Stake amount"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
        />
        <span className="field-hint">Balance {balance == null ? PLACEHOLDER_NUMBER : formatToken(balance)}</span>
      </label>
      {over ? <p className="field-error">Amount is above your {tokenMeta.symbol} balance.</p> : null}
      <dl className="quote-rows">
        {(
          [
            ['Daily', rewards.daily],
            ['Weekly', rewards.weekly],
            ['Monthly', rewards.monthly],
            ['Yearly', rewards.yearly],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className="num">{value == null ? PLACEHOLDER_NUMBER : `${formatToken(value)} ${tokenMeta.symbol}`}</dd>
          </div>
        ))}
      </dl>
      <p className="caption faint">Estimated, not guaranteed. Priced off the illustrative APR{market.stats ? '' : ''}.</p>
      <Button block size="lg" onClick={stake} disabled={Boolean(wallet.account) && (over || !(parsed && parsed > 0))}>
        {wallet.account ? `Stake ${tokenMeta.displaySymbol}` : 'Connect wallet'}
      </Button>
    </div>
  );

  const staked = wallet.account?.staked ?? 0;

  return (
    <div className="page-wrap has-sticky-action">
      <header className="page-intro">
        <p className="eyebrow">Stake</p>
        <h1 className="heading-lg">Lock {tokenMeta.displaySymbol}</h1>
      </header>
      <div className="stake-layout">
        {mobile ? null : calculator}
        <div className="stack">
          <DataBoundary loading={staking.loading} error={staking.error} onRetry={staking.reload} skeleton={<div className="card skeleton-block" />}>
            {!wallet.account ? (
              <EmptyState
                icon={Wallet}
                message="Connect to see your position."
                action={<Button onClick={wallet.openConnect}>Connect wallet</Button>}
              />
            ) : staked <= 0 ? (
              <EmptyState
                icon={Lock}
                message="You haven't staked yet."
                action={
                  mobile ? (
                    <Button onClick={() => setSheet(true)}>{`Stake ${tokenMeta.displaySymbol}`}</Button>
                  ) : undefined
                }
              />
            ) : (
              <article className="card">
                <p className="eyebrow">Your position</p>
                <p className="data-lg num">{formatToken(staked)}</p>
                <p className="caption faint">{tokenMeta.symbol} staked</p>
                <div className="between">
                  <div>
                    <p className="eyebrow">Pending rewards</p>
                    <p className="data-md num">{formatToken(wallet.account.pendingRewards)}</p>
                  </div>
                  <Button variant="secondary" onClick={claim} disabled={!(wallet.account.pendingRewards > 0)}>
                    Claim
                  </Button>
                </div>
              </article>
            )}
            <article className="card">
              <p className="eyebrow">Terms</p>
              <dl className="quote-rows">
                <div>
                  <dt>Estimated APR</dt>
                  <dd className="num">{formatPct(staking.data?.aprPct ?? null, false)}</dd>
                </div>
                <div>
                  <dt>Lock period</dt>
                  <dd className="num">{staking.data ? `${staking.data.lockDays} days` : PLACEHOLDER_NUMBER}</dd>
                </div>
                <div>
                  <dt>Protocol staked</dt>
                  <dd className="num">{formatToken(staking.data?.totalStaked ?? null)}</dd>
                </div>
              </dl>
              <p className="caption faint">Illustrative. Rewards can change and are not guaranteed.</p>
            </article>
          </DataBoundary>
        </div>
      </div>
      {mobile ? (
        <>
          <button type="button" className="sticky-action btn btn-primary btn-lg" onClick={() => setSheet(true)}>
            Stake {tokenMeta.displaySymbol}
          </button>
          <BottomSheet open={sheet} title="Stake" onClose={() => setSheet(false)}>
            {calculator}
          </BottomSheet>
        </>
      ) : null}
    </div>
  );
}
