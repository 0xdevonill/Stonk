import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SLIPPAGE_PCT } from '../lib/trade/quote';

interface TradeSettingsValue {
  slippagePct: number;
  setSlippagePct: (value: number) => void;
}

const TradeSettingsContext = createContext<TradeSettingsValue | null>(null);

export function TradeSettingsProvider({ children }: { children: ReactNode }) {
  const [slippagePct, setSlippagePct] = useState(DEFAULT_SLIPPAGE_PCT);
  const value = useMemo(() => ({ slippagePct, setSlippagePct }), [slippagePct]);
  return <TradeSettingsContext.Provider value={value}>{children}</TradeSettingsContext.Provider>;
}

export function useTradeSettings(): TradeSettingsValue {
  const context = useContext(TradeSettingsContext);
  if (!context) throw new Error('useTradeSettings must be used within TradeSettingsProvider');
  return context;
}
