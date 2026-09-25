import { useMarket } from '../context/MarketContext';
import { useWallet } from '../context/WalletContext';
import { useOrderSubmit } from './useOrderSubmit';

export function usePanelProps() {
  const market = useMarket();
  const wallet = useWallet();
  const onSubmit = useOrderSubmit();

  return {
    stonkPrice: market.stats?.priceUsd ?? null,
    ethPrice: market.stats?.ethPriceUsd ?? null,
    balances: wallet.account?.balances ?? null,
    connected: Boolean(wallet.account),
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
