import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { exceedsSlippage } from '../lib/trade/quote';
import { useWallet } from './WalletContext';

export type TxStatus =
  | 'preparing'
  | 'waiting'
  | 'confirming'
  | 'processing'
  | 'success'
  | 'failed'
  | 'rejected'
  | 'wrong-network';

export type TxKind = 'buy' | 'sell' | 'swap' | 'stake' | 'unstake' | 'claim';

export interface TxRequest {
  kind: TxKind;
  title: string;
  summary: string;
  amountLabel: string;
  slippagePct: number;
  impactPct: number | null;
  feeLabel: string;
  apply?: () => void;
}

interface TransactionContextValue {
  request: TxRequest | null;
  status: TxStatus | null;
  error: string | null;
  start: (request: TxRequest) => void;
  approve: () => void;
  reject: () => void;
  retry: () => void;
  close: () => void;
  continueAfterSwitch: () => void;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const walletRef = useRef(wallet);
  walletRef.current = wallet;
  const [request, setRequest] = useState<TxRequest | null>(null);
  const [status, setStatus] = useState<TxStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const decisionRef = useRef<((value: 'approve' | 'reject') => void) | null>(null);
  const runRef = useRef(0);

  const close = useCallback(() => {
    runRef.current += 1;
    decisionRef.current?.('reject');
    decisionRef.current = null;
    setRequest(null);
    setStatus(null);
    setError(null);
  }, []);

  const run = useCallback(async (next: TxRequest) => {
    const id = ++runRef.current;
    const alive = () => runRef.current === id;
    setRequest(next);
    setError(null);
    setStatus('preparing');
    await wait(280);
    if (!alive()) return;

    if (!walletRef.current.networkOk) {
      setStatus('wrong-network');
      return;
    }

    setStatus('waiting');
    const decision = await new Promise<'approve' | 'reject'>((resolve) => {
      decisionRef.current = resolve;
    });
    decisionRef.current = null;
    if (!alive()) return;
    if (decision === 'reject') {
      setStatus('rejected');
      return;
    }

    if (!walletRef.current.networkOk) {
      setStatus('wrong-network');
      return;
    }

    setStatus('confirming');
    await wait(640);
    if (!alive()) return;
    setStatus('processing');
    await wait(820);
    if (!alive()) return;

    if (exceedsSlippage(next.impactPct, next.slippagePct)) {
      setError(
        `Price moved past your slippage (${next.slippagePct.toFixed(2)}% set, ${next.impactPct?.toFixed(2) ?? 'XX'}% impact).`,
      );
      setStatus('failed');
      return;
    }

    next.apply?.();
    setStatus('success');
  }, []);

  const start = useCallback(
    (next: TxRequest) => {
      void run(next);
    },
    [run],
  );

  const approve = useCallback(() => {
    decisionRef.current?.('approve');
  }, []);

  const reject = useCallback(() => {
    decisionRef.current?.('reject');
  }, []);

  const retry = useCallback(() => {
    if (request) void run(request);
  }, [request, run]);

  const continueAfterSwitch = useCallback(() => {
    if (request) void run(request);
  }, [request, run]);

  const value = useMemo(
    () => ({ request, status, error, start, approve, reject, retry, close, continueAfterSwitch }),
    [request, status, error, start, approve, reject, retry, close, continueAfterSwitch],
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}

export function useTransaction(): TransactionContextValue {
  const context = useContext(TransactionContext);
  if (!context) throw new Error('useTransaction must be used within TransactionProvider');
  return context;
}
