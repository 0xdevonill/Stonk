import { useState } from 'react';
import { useTradeSettings } from '../../context/TradeSettingsContext';
import { formatToken, parseAmount, sanitizeAmount, trimAmount, PLACEHOLDER_NUMBER } from '../../lib/format';
import type { OrderDraft } from '../../lib/trade/fill';
import { usePoolQuote } from '../../hooks/usePoolQuote';
import { cn } from '../../lib/cn';
import { Button } from '../primitives/Button';
import { QuoteDetails } from './QuoteDetails';
import { SlippageControl } from './SlippageControl';
import { SwapPanel } from './SwapPanel';

type Side = 'buy' | 'sell' | 'swap';

export function TradingPanel({
  baseSymbol,
  quoteSymbol,
  balances,
  connected,
  networkOk,
  variant = 'full',
  onConnect,
  onSwitchNetwork,
  onSubmit,
}: {
  baseSymbol: string;
  quoteSymbol: string;
  balances: { base: number; quote: number } | null;
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
  const buying = active === 'buy';
  const { quote, loading, error } = usePoolQuote(active === 'swap' ? 0 : (parsed ?? 0), !buying, slippagePct);

  if (active === 'swap') {
    return (
      <div className="panel">
        <div className="between">
          <SideTabs side={side} onChange={setSide} />
          <SlippageControl />
        </div>
        <SwapPanel
          embedded
          baseSymbol={baseSymbol}
          quoteSymbol={quoteSymbol}
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

  const spend = buying ? quoteSymbol : baseSymbol;
  const receive = buying ? baseSymbol : quoteSymbol;
  const balance = balances ? (buying ? balances.quote : balances.base) : null;
  const over = parsed != null && balance != null && parsed > balance + 1e-12;
  const display = baseSymbol.startsWith('$') ? baseSymbol : `$${baseSymbol}`;
  const rateLabel =
    quote.rate != null && parsed != null && parsed > 0
      ? `1 ${spend} ≈ ${formatToken(quote.rate)} ${receive}`
      : PLACEHOLDER_NUMBER;

  function submit() {
    if (!networkOk) {
      onSwitchNetwork();
      return;
    }
    if (!connected) {
      onConnect();
      return;
    }
    if (parsed == null || parsed <= 0 || quote.amountOut == null || over || loading) return;
    onSubmit({
      kind: 'swap',
      title: buying ? `Buy ${display}` : `Sell ${display}`,
      summary: `${formatToken(parsed)} ${spend} → ${formatToken(quote.amountOut)} ${receive}`,
      amountLabel: `${formatToken(parsed)} ${spend}`,
      impactPct: quote.impactPct,
      feeLabel: quote.feeUsd == null ? PLACEHOLDER_NUMBER : `$${quote.feeUsd.toFixed(2)}`,
      slippagePct,
      fill: {
        type: 'swap',
        spend: buying ? 'ETH' : 'STONK',
        receive: buying ? 'STONK' : 'ETH',
        amountIn: parsed,
        amountOut: quote.amountOut,
      },
    });
  }

  const buttonLabel = !networkOk
    ? 'Switch network'
    : !connected
      ? 'Connect wallet'
      : loading
        ? 'Pricing…'
        : buying
          ? `Buy ${display}`
          : `Sell ${display}`;

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
              onClick={() => balance != null && setAmount(trimAmount(balance * fraction))}
            >
              {fraction === 1 ? 'Max' : `${fraction * 100}%`}
            </button>
          ))}
        </div>
      </div>
      {over ? (
        <p className="field-error" role="alert">
          Amount is above your {spend} balance.
        </p>
      ) : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <QuoteDetails quote={quote} slippagePct={slippagePct} receiveSymbol={receive} rateLabel={rateLabel} />
      <Button
        block
        size="lg"
        variant={active === 'sell' ? 'sell' : 'buy'}
        onClick={submit}
        disabled={connected && networkOk && (over || loading || !(parsed && parsed > 0))}
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
