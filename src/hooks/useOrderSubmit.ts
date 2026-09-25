import { useCallback } from 'react';
import { useTransaction } from '../context/TransactionContext';
import { useWallet } from '../context/WalletContext';
import { useMarket } from '../context/MarketContext';
import { applyFill, historyFromFill, type OrderDraft } from '../lib/trade/fill';

export function useOrderSubmit() {
  const tx = useTransaction();
  const wallet = useWallet();
  const market = useMarket();

  const submit = useCallback(
    (draft: OrderDraft) => {
      const price = market.stats?.priceUsd ?? 0;
      tx.start({
        kind: draft.fill.type === 'swap' ? 'swap' : draft.fill.type,
        title: draft.title,
        summary: draft.summary,
        amountLabel: draft.amountLabel,
        slippagePct: draft.slippagePct,
        impactPct: draft.impactPct,
        feeLabel: draft.feeLabel,
        apply: () => {
          const address = wallet.account?.address;
          wallet.applyBalances((account) => applyFill(account, draft.fill));
          if (address) wallet.prependHistory(historyFromFill(address, draft.fill, price, market.stats?.symbol));
        },
      });
    },
    [market.stats?.priceUsd, market.stats?.symbol, tx, wallet],
  );

  return submit;
}
