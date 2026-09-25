import { useEffect, useState } from 'react';
import { quotePool } from '../lib/market/chain';
import type { SwapQuote } from '../lib/trade/quote';

function emptyQuote(amountIn: number): SwapQuote {
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

export function usePoolQuote(amountIn: number, zeroForOne: boolean, slippagePct: number) {
  const [quote, setQuote] = useState<SwapQuote>(emptyQuote(amountIn));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!(amountIn > 0)) {
      setQuote(emptyQuote(amountIn));
      setLoading(false);
      setError(null);
      return;
    }

    let cancel = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      quotePool(amountIn, zeroForOne, slippagePct)
        .then((next) => {
          if (cancel) return;
          setQuote(next);
          setError(null);
        })
        .catch(() => {
          if (cancel) return;
          setQuote(emptyQuote(amountIn));
          setError('The pool could not price this size.');
        })
        .finally(() => {
          if (!cancel) setLoading(false);
        });
    }, 280);

    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [amountIn, zeroForOne, slippagePct]);

  return { quote, loading, error };
}
