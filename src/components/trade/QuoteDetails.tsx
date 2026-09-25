import { formatPct, formatPrice, formatToken, PLACEHOLDER_NUMBER } from '../../lib/format';
import type { SwapQuote } from '../../lib/trade/quote';
import { exceedsSlippage } from '../../lib/trade/quote';

export function QuoteDetails({
  quote,
  slippagePct,
  receiveSymbol,
  rateLabel,
}: {
  quote: SwapQuote;
  slippagePct: number;
  receiveSymbol: string;
  rateLabel: string;
}) {
  const high = exceedsSlippage(quote.impactPct, slippagePct);
  return (
    <dl className="quote-rows">
      <div>
        <dt>Rate</dt>
        <dd className="num">{rateLabel}</dd>
      </div>
      <div>
        <dt>Estimated output</dt>
        <dd className="num">
          {quote.amountOut == null ? PLACEHOLDER_NUMBER : `${formatToken(quote.amountOut)} ${receiveSymbol}`}
        </dd>
      </div>
      <div>
        <dt>Price impact</dt>
        <dd className={high ? 'num impact-high' : 'num'}>
          {high ? 'High · ' : 'Normal · '}
          {formatPct(quote.impactPct, false)}
        </dd>
      </div>
      <div>
        <dt>Pool fee</dt>
        <dd className="num">{quote.feeUsd == null ? PLACEHOLDER_NUMBER : formatPrice(quote.feeUsd)}</dd>
      </div>
      <div>
        <dt>Minimum received</dt>
        <dd className="num">
          {quote.minReceived == null ? PLACEHOLDER_NUMBER : `${formatToken(quote.minReceived)} ${receiveSymbol}`}
        </dd>
      </div>
    </dl>
  );
}
