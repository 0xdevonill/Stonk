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
    if (!stats) return;
    const timer = window.setInterval(() => {
      setStats((current) => {
        if (!current) return current;
        const base = query.data?.priceUsd ?? current.priceUsd;
        const shock = (Math.random() - 0.48) * 0.0016;
        const next = Math.min(base * 1.012, Math.max(base * 0.988, current.priceUsd * (1 + shock)));
        const sparkline = current.sparkline.slice();
        sparkline[sparkline.length - 1] = next;
        return { ...current, priceUsd: next, sparkline };
      });
    }, 2800);
    return () => window.clearInterval(timer);
  }, [stats == null, query.data?.priceUsd]);

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
