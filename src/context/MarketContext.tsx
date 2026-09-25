import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchTokenStats, type TokenStats } from '../lib/api';
import { useQuery } from '../hooks/useQuery';

interface MarketContextValue {
  stats: TokenStats | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: ReactNode }) {
  const query = useQuery('stats', fetchTokenStats);
  const [stats, setStats] = useState<TokenStats | null>(null);

  useEffect(() => {
    setStats(query.data);
  }, [query.data]);

  useEffect(() => {
    const timer = window.setInterval(() => query.reload(), 20_000);
    return () => window.clearInterval(timer);
  }, [query.reload]);

  const value = useMemo(
    () => ({
      stats,
      loading: query.loading,
      error: query.error,
      reload: query.reload,
    }),
    [stats, query.loading, query.error, query.reload],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket(): MarketContextValue {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within MarketProvider');
  return context;
}

export function useAsset() {
  const { stats } = useMarket();
  const symbol = stats?.symbol ?? '';
  return {
    symbol,
    displaySymbol: symbol ? `$${symbol}` : 'this token',
    name: stats?.name ?? 'Token',
    quoteSymbol: stats?.quoteSymbol ?? '',
  };
}
