import { ArrowsDownUp } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { useTradeSettings } from '../../context/TradeSettingsContext';
import { formatToken, parseAmount, sanitizeAmount, PLACEHOLDER_NUMBER } from '../../lib/format';
import { GAS_RESERVE_ETH, quoteSwap } from '../../lib/trade/quote';
import type { OrderDraft } from '../../lib/trade/fill';
import { cn } from '../../lib/cn';
import { Icon } from '../primitives/Icon';
import { Button } from '../primitives/Button';
import { QuoteDetails } from './QuoteDetails';
import { SlippageControl } from './SlippageControl';

type Symbol = 'STONK' | 'ETH';

export function SwapPanel({
  stonkPrice,
  ethPrice,
  balances,
  connected,
  networkOk,
  compact = false,
  embedded = false,
  onConnect,
  onSwitchNetwork,
  onSubmit,
}: {
  stonkPrice: number | null;
  ethPrice: number | null;
  balances: { ETH: number; STONK: number } | null;
  connected: boolean;
  networkOk: boolean;
  compact?: boolean;
  embedded?: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
  onSubmit: (draft: OrderDraft) => void;
}) {
  const { slippagePct } = useTradeSettings();
  const [fromSymbol, setFromSymbol] = useState<Symbol>('ETH');
  const [amount, setAmount] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const toSymbol: Symbol = fromSymbol === 'ETH' ? 'STONK' : 'ETH';
  const priceIn = fromSymbol === 'ETH' ? ethPrice : stonkPrice;
  const priceOut = toSymbol === 'ETH' ? ethPrice : stonkPrice;
  const parsed = parseAmount(amount);
  const balance = balances ? balances[fromSymbol] : null;
  const max =
    balance == null ? null : fromSymbol === 'ETH' ? Math.max(0, balance - GAS_RESERVE_ETH) : balance;
  const over = parsed != null && max != null && parsed > max + 1e-12;

  const quote = useMemo(
    () => quoteSwap({ amountIn: parsed ?? 0, priceIn, priceOut, slippagePct }),
    [parsed, priceIn, priceOut, slippagePct],
  );

  const rateLabel =
    priceIn != null && priceOut != null && priceOut > 0
      ? `1 ${fromSymbol} ≈ ${formatToken(priceIn / priceOut)} ${toSymbol}`
      : PLACEHOLDER_NUMBER;

  function flip() {
    setFromSymbol(toSymbol);
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
    if (parsed == null || parsed <= 0 || quote.amountOut == null || over) return;
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
        spend: fromSymbol,
        receive: toSymbol,
        amountIn: parsed,
        amountOut: quote.amountOut,
      },
    });
  }

  const label = !networkOk ? 'Switch network' : !connected ? 'Connect wallet' : `Swap ${fromSymbol}`;

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
          onMax={() => max != null && setAmount(trimAmount(max))}
        />
        <button type="button" className="swap-flip" onClick={flip} aria-label="Switch direction">
          <Icon icon={ArrowsDownUp} size={20} />
        </button>
        <TokenRow
          label="To"
          symbol={toSymbol}
          amount={quote.amountOut == null || !(parsed && parsed > 0) ? '' : trimAmount(quote.amountOut)}
          readOnly
          balance={balances ? balances[toSymbol] : null}
        />
      </div>
      {over ? (
        <p className="field-error" role="alert">
          Amount is above your {fromSymbol} balance.
        </p>
      ) : null}
      <button type="button" className="details-toggle" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}>
        <span>Details</span>
        <span className="num faint">{rateLabel}</span>
      </button>
      {detailsOpen ? <QuoteDetails quote={quote} slippagePct={slippagePct} receiveSymbol={toSymbol} rateLabel={rateLabel} /> : null}
      <Button block size="lg" variant="primary" onClick={submit} disabled={connected && networkOk && (over || !(parsed && parsed > 0))}>
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
  symbol: Symbol;
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

function trimAmount(value: number): string {
  if (value >= 1000) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(6);
}
