import { useMemo, useState } from 'react';
import { useTradeSettings } from '../../context/TradeSettingsContext';
import { formatToken, parseAmount, sanitizeAmount, PLACEHOLDER_NUMBER } from '../../lib/format';
import { GAS_RESERVE_ETH, quoteSwap } from '../../lib/trade/quote';
import type { OrderDraft } from '../../lib/trade/fill';
import { cn } from '../../lib/cn';
import { Button } from '../primitives/Button';
import { QuoteDetails } from './QuoteDetails';
import { SlippageControl } from './SlippageControl';
import { SwapPanel } from './SwapPanel';

type Side = 'buy' | 'sell' | 'swap';

export function TradingPanel({
  stonkPrice,
  ethPrice,
  balances,
  connected,
  networkOk,
  variant = 'full',
  onConnect,
  onSwitchNetwork,
  onSubmit,
}: {
  stonkPrice: number | null;
  ethPrice: number | null;
  balances: { ETH: number; STONK: number } | null;
  connected: boolean;
  networkOk: boolean;
  variant?: 'full' | 'buy-only';
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onSubmit: (draft: OrderDraft) => void;
}) {
  const { slippagePct } = useTradeSettings();
  const [side, setSide] = useState<Side>('buy');
  const [amount, setAmount] = useState('');
  const active = variant === 'buy-only' ? 'buy' : side;
  const parsed = parseAmount(amount);

  if (active === 'swap') {
    return (
      <div className="panel">
        <div className="between">
          <SideTabs side={side} onChange={setSide} />
          <SlippageControl />
        </div>
        <SwapPanel
          embedded
          stonkPrice={stonkPrice}
          ethPrice={ethPrice}
          balances={balances}
          connected={connected}
          networkOk={networkOk}
          onConnect={onConnect}
          onSwitchNetwork={onSwitchNetwork}
          onSubmit={onSubmit}
        />
      </div>
    );
  }

  const spend = active === 'buy' ? 'ETH' : 'STONK';
  const receive = active === 'buy' ? 'STONK' : 'ETH';
  const priceIn = spend === 'ETH' ? ethPrice : stonkPrice;
  const priceOut = receive === 'ETH' ? ethPrice : stonkPrice;
  const balance = balances ? balances[spend] : null;
  const max = balance == null ? null : spend === 'ETH' ? Math.max(0, balance - GAS_RESERVE_ETH) : balance;
  const over = parsed != null && max != null && parsed > max + 1e-12;
  const quote = useMemo(
    () => quoteSwap({ amountIn: parsed ?? 0, priceIn, priceOut, slippagePct }),
    [parsed, priceIn, priceOut, slippagePct],
  );
  const rateLabel =
    stonkPrice != null && ethPrice != null ? `1 STONK ≈ ${formatToken(stonkPrice / ethPrice)} ETH` : PLACEHOLDER_NUMBER;

  function submit() {
    if (!networkOk) {
      onSwitchNetwork();
      return;
    }
    if (!connected) {
      onConnect();
      return;
    }
    if (parsed == null || parsed <= 0 || quote.amountOut == null || over) return;
    onSubmit({
      kind: 'swap',
      title: active === 'buy' ? 'Buy $STONK' : 'Sell $STONK',
      summary: `${formatToken(parsed)} ${spend} → ${formatToken(quote.amountOut)} ${receive}`,
      amountLabel: `${formatToken(parsed)} ${spend}`,
      impactPct: quote.impactPct,
      feeLabel: quote.feeUsd == null ? PLACEHOLDER_NUMBER : `$${quote.feeUsd.toFixed(2)}`,
      slippagePct,
      fill: { type: 'swap', spend, receive, amountIn: parsed, amountOut: quote.amountOut },
    });
  }

  const buttonLabel = !networkOk ? 'Switch network' : !connected ? 'Connect wallet' : active === 'buy' ? 'Buy $STONK' : 'Sell $STONK';

  return (
    <div className="panel">
      <div className="between">
        {variant === 'buy-only' ? <h3 className="heading-sm">Quick buy</h3> : <SideTabs side={side} onChange={setSide} />}
        <SlippageControl />
      </div>
      <div className="token-row">
        <div className="between">
          <span className="eyebrow">Pay with {spend}</span>
          <span className="caption faint num">Balance {balance == null ? PLACEHOLDER_NUMBER : formatToken(balance)}</span>
        </div>
        <div className="token-row-main">
          <span className="token-chip">{spend}</span>
          <input
            className="token-input num"
            inputMode="decimal"
            aria-label={`Amount of ${spend}`}
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
          />
        </div>
        <div className="preset-row">
          {[0.25, 0.5, 0.75, 1].map((fraction) => (
            <button
              key={fraction}
              type="button"
              className="pill"
              onClick={() => max != null && setAmount(trim(max * fraction))}
            >
              {fraction === 1 ? 'Max' : `${fraction * 100}%`}
            </button>
          ))}
        </div>
      </div>
      {spend === 'ETH' ? <p className="caption faint">{GAS_RESERVE_ETH} ETH stays back for the network fee.</p> : null}
      {over ? (
        <p className="field-error" role="alert">
          Amount is above your {spend} balance.
        </p>
      ) : null}
      <QuoteDetails quote={quote} slippagePct={slippagePct} receiveSymbol={receive} rateLabel={rateLabel} />
      <Button
        block
        size="lg"
        variant={active === 'sell' ? 'sell' : 'buy'}
        onClick={submit}
        disabled={connected && networkOk && (over || !(parsed && parsed > 0))}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

function SideTabs({ side, onChange }: { side: Side; onChange: (side: Side) => void }) {
  const tabs: Side[] = ['buy', 'sell', 'swap'];
  return (
    <div className="seg" role="tablist" aria-label="Order side">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={side === tab}
          className={cn('seg-btn', side === tab && 'is-active', side === tab && tab === 'sell' && 'is-sell', side === tab && tab === 'buy' && 'is-buy')}
          onClick={() => onChange(tab)}
        >
          {tab === 'buy' ? 'Buy' : tab === 'sell' ? 'Sell' : 'Swap'}
        </button>
      ))}
    </div>
  );
}

function trim(value: number): string {
  if (value >= 1000) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(6);
}
