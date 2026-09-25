import { useMarket } from '../context/MarketContext';
import { useWallet } from '../context/WalletContext';
import { useOrderSubmit } from './useOrderSubmit';

export function usePanelProps() {
  const market = useMarket();
  const wallet = useWallet();
  const onSubmit = useOrderSubmit();
  const account = wallet.account;

  return {
    baseSymbol: market.stats?.symbol ?? '…',
    quoteSymbol: market.stats?.quoteSymbol ?? '…',
    basePriceUsd: market.stats?.priceUsd ?? null,
    quotePriceUsd: market.stats?.quotePriceUsd ?? null,
    balances: account ? { base: account.balances.STONK, quote: account.balances.ETH } : null,
    connected: Boolean(account),
    networkOk: wallet.networkOk,
    onConnect: wallet.openConnect,
    onSwitchNetwork: () => {
      void wallet.switchNetwork();
    },
    onSubmit,
    market,
    wallet,
  };
}
