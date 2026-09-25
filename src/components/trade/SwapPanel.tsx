import { ArrowsDownUp } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTradeSettings } from '../../context/TradeSettingsContext';
import { formatToken, parseAmount, sanitizeAmount, trimAmount, PLACEHOLDER_NUMBER } from '../../lib/format';
import type { OrderDraft } from '../../lib/trade/fill';
import { usePoolQuote } from '../../hooks/usePoolQuote';
import { cn } from '../../lib/cn';
import { Icon } from '../primitives/Icon';
import { Button } from '../primitives/Button';
import { QuoteDetails } from './QuoteDetails';
import { SlippageControl } from './SlippageControl';

export function SwapPanel({
  baseSymbol,
  quoteSymbol,
  balances,
  connected,
  networkOk,
  compact = false,
  embedded = false,
  onConnect,
  onSwitchNetwork,
  onSubmit,
}: {
  baseSymbol: string;
  quoteSymbol: string;
  balances: { base: number; quote: number } | null;
  connected: boolean;
  networkOk: boolean;
  compact?: boolean;
  embedded?: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onSubmit: (draft: OrderDraft) => void;
}) {
  const { slippagePct } = useTradeSettings();
  const [payQuote, setPayQuote] = useState(true);
  const [amount, setAmount] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const fromSymbol = payQuote ? quoteSymbol : baseSymbol;
  const toSymbol = payQuote ? baseSymbol : quoteSymbol;
  const parsed = parseAmount(amount);
  const balance = balances ? (payQuote ? balances.quote : balances.base) : null;
  const outBalance = balances ? (payQuote ? balances.base : balances.quote) : null;
  const over = parsed != null && balance != null && parsed > balance + 1e-12;
  const { quote, loading, error } = usePoolQuote(parsed ?? 0, !payQuote, slippagePct);

  const rateLabel =
    quote.rate != null && parsed != null && parsed > 0
      ? `1 ${fromSymbol} ≈ ${formatToken(quote.rate)} ${toSymbol}`
      : PLACEHOLDER_NUMBER;

  function flip() {
    setPayQuote((current) => !current);
    setAmount('');
  }

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
      title: `Swap ${fromSymbol} for ${toSymbol}`,
      summary: `${formatToken(parsed)} ${fromSymbol} → ${formatToken(quote.amountOut)} ${toSymbol}`,
      amountLabel: `${formatToken(parsed)} ${fromSymbol}`,
      impactPct: quote.impactPct,
      feeLabel: quote.feeUsd == null ? PLACEHOLDER_NUMBER : `$${quote.feeUsd.toFixed(2)}`,
      slippagePct,
      fill: {
        type: 'swap',
        spend: payQuote ? 'ETH' : 'STONK',
        receive: payQuote ? 'STONK' : 'ETH',
        amountIn: parsed,
        amountOut: quote.amountOut,
      },
    });
  }

  const label = !networkOk ? 'Switch network' : !connected ? 'Connect wallet' : loading ? 'Pricing…' : `Swap ${fromSymbol}`;

  return (
    <div className={cn(!embedded && 'panel', compact && 'panel-compact')}>
      {embedded ? null : (
        <div className="between">
          <h3 className="heading-sm">Swap</h3>
          <SlippageControl />
        </div>
      )}
      <div className="swap-stack">
        <TokenRow
          label="From"
          symbol={fromSymbol}
          amount={amount}
          onAmount={setAmount}
          balance={balance}
          onMax={() => balance != null && setAmount(trimAmount(balance))}
        />
        <button type="button" className="swap-flip" onClick={flip} aria-label="Switch direction">
          <Icon icon={ArrowsDownUp} size={20} />
        </button>
        <TokenRow
          label="To"
          symbol={toSymbol}
          amount={loading || quote.amountOut == null || !(parsed && parsed > 0) ? '' : trimAmount(quote.amountOut)}
          readOnly
          balance={outBalance}
        />
      </div>
      {over ? (
        <p className="field-error" role="alert">
          Amount is above your {fromSymbol} balance.
        </p>
      ) : null}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <button type="button" className="details-toggle" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}>
        <span>Details</span>
        <span className="num faint">{loading ? 'Pricing…' : rateLabel}</span>
      </button>
      {detailsOpen ? <QuoteDetails quote={quote} slippagePct={slippagePct} receiveSymbol={toSymbol} rateLabel={rateLabel} /> : null}
      <Button block size="lg" variant="primary" onClick={submit} disabled={connected && networkOk && (over || !(parsed && parsed > 0) || loading)}>
        {label}
      </Button>
      <p className="caption faint security-line">We will never ask for your seed phrase.</p>
    </div>
  );
}

function TokenRow({
  label,
  symbol,
  amount,
  onAmount,
  balance,
  onMax,
  readOnly = false,
}: {
  label: string;
  symbol: string;
  amount: string;
  onAmount?: (value: string) => void;
  balance: number | null;
  onMax?: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className="token-row">
      <div className="between">
        <span className="eyebrow">{label}</span>
        <span className="caption faint num">Balance {balance == null ? PLACEHOLDER_NUMBER : formatToken(balance)}</span>
      </div>
      <div className="token-row-main">
        <span className="token-chip">{symbol}</span>
        <input
          className="token-input num"
          inputMode="decimal"
          aria-label={`${label} ${symbol} amount`}
          placeholder="0.00"
          value={amount}
          readOnly={readOnly}
          onChange={(event) => onAmount?.(sanitizeAmount(event.target.value))}
        />
      </div>
      {onMax ? (
        <button type="button" className="text-btn" onClick={onMax}>
          Max
        </button>
      ) : null}
    </div>
  );
}
