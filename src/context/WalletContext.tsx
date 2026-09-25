import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { fetchPortfolio, type AccountSnapshot, type ActivityItem } from '../lib/api';
import { getExpectedChain, isExpectedChain } from '../lib/rpc/network';
import { connectMockWallet, switchMockChain, type WalletId } from '../lib/rpc/wallet';

export type WalletModalView = 'closed' | 'select' | 'connecting' | 'wrong-network';

export interface Account extends AccountSnapshot {
  address: string;
  chainId: number;
  walletId: WalletId;
}

interface WalletContextValue {
  account: Account | null;
  status: 'disconnected' | 'connecting' | 'wrong-network' | 'connected';
  modal: WalletModalView;
  pendingWallet: WalletId | null;
  accountLoading: boolean;
  accountError: string | null;
  networkOk: boolean;
  openConnect: () => void;
  closeModal: () => void;
  connect: (id: WalletId) => Promise<void>;
  switchNetwork: () => Promise<void>;
  disconnect: () => void;
  reloadAccount: () => Promise<void>;
  applyBalances: (recipe: (account: Account) => Account) => void;
  prependHistory: (item: ActivityItem) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [modal, setModal] = useState<WalletModalView>('closed');
  const [pendingWallet, setPendingWallet] = useState<WalletId | null>(null);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(getExpectedChain().id);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const status: WalletContextValue['status'] = account
    ? 'connected'
    : modal === 'connecting'
      ? 'connecting'
      : modal === 'wrong-network'
        ? 'wrong-network'
        : 'disconnected';

  const loadAccount = useCallback(async (address: string, walletId: WalletId, nextChainId: number) => {
    setAccountLoading(true);
    setAccountError(null);
    try {
      const snapshot = await fetchPortfolio();
      setAccount({ ...snapshot, address, walletId, chainId: nextChainId });
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Couldn't load portfolio — retry");
      setAccount({
        address,
        walletId,
        chainId: nextChainId,
        balances: { ETH: 0, STONK: 0 },
        staked: 0,
        pendingRewards: 0,
        tokenized: [],
        history: [],
        performance: { '1D': [], '1W': [], '1M': [], '3M': [], '1Y': [], ALL: [] },
        illustrative: true,
      });
    } finally {
      setAccountLoading(false);
    }
  }, []);

  const connect = useCallback(
    async (id: WalletId) => {
      setPendingWallet(id);
      setModal('connecting');
      const result = await connectMockWallet(id);
      setPendingAddress(result.address);
      setChainId(result.chainId);
      if (!isExpectedChain(result.chainId)) {
        setModal('wrong-network');
        return;
      }
      setModal('closed');
      await loadAccount(result.address, id, result.chainId);
    },
    [loadAccount],
  );

  const switchNetwork = useCallback(async () => {
    const next = await switchMockChain();
    setChainId(next);
    if (account) {
      setAccount({ ...account, chainId: next });
      setModal('closed');
      return;
    }
    if (pendingWallet && pendingAddress) {
      setModal('closed');
      await loadAccount(pendingAddress, pendingWallet, next);
    }
  }, [account, loadAccount, pendingAddress, pendingWallet]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setPendingWallet(null);
    setPendingAddress(null);
    setAccountError(null);
    setModal('closed');
  }, []);

  const reloadAccount = useCallback(async () => {
    if (!account) return;
    await loadAccount(account.address, account.walletId, account.chainId);
  }, [account, loadAccount]);

  const applyBalances = useCallback((recipe: (current: Account) => Account) => {
    setAccount((current) => (current ? recipe(current) : current));
  }, []);

  const prependHistory = useCallback((item: ActivityItem) => {
    setAccount((current) => (current ? { ...current, history: [item, ...current.history].slice(0, 40) } : current));
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      account,
      status,
      modal,
      pendingWallet,
      accountLoading,
      accountError,
      networkOk: account ? isExpectedChain(account.chainId) : isExpectedChain(chainId),
      openConnect: () => setModal('select'),
      closeModal: () => setModal('closed'),
      connect,
      switchNetwork,
      disconnect,
      reloadAccount,
      applyBalances,
      prependHistory,
    }),
    [
      account,
      status,
      modal,
      pendingWallet,
      accountLoading,
      accountError,
      chainId,
      connect,
      switchNetwork,
      disconnect,
      reloadAccount,
      applyBalances,
      prependHistory,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
