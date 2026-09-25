import { usePageTitle } from '../hooks/usePageTitle';

export function DocsPage() {
  usePageTitle('Docs');
  return (
    <article className="prose page-wrap">
      <p className="eyebrow">Docs</p>
      <h1 className="heading-lg">How to read the terminal</h1>
      <p className="body-lg muted">
        Mr.Stonk is a trading interface for one token. Price, supply, and swap quotes are read from that token&apos;s
        contract on Robinhood Chain. Wallet confirms in this build are still simulated and are not broadcast.
      </p>

      <h2 id="status">Status</h2>
      <p>
        The price is the graduated pool&apos;s spot, converted with the quote token&apos;s USDG pool. Swap output comes
        from the chain quoter. Holder tables and staking rates stay empty when the contract does not publish them. A
        block can still fail on purpose with a
        <span className="num"> ?fault=chart </span>
        style query, and every failed block keeps its own retry.
      </p>

      <h2>Wallets</h2>
      <p>
        Connect is simulated. MetaMask, Rabby, and Coinbase Wallet land on Robinhood Chain. WalletConnect reports Sepolia so
        you can reach the wrong-network state and switch with one button. No seed phrase is requested. No signature is
        requested.
      </p>

      <h2>Orders</h2>
      <p>
        Buy, sell, swap, stake, and claim share one status sequence: preparing, waiting for the wallet, confirming,
        processing, then success. Reject, wrong network, and slippage failure are separate endings. A size that moves
        price past your slippage fails on purpose — raise the gear setting and the same order can pass.
      </p>

      <h2 id="risk">Risk</h2>
      <p>
        Digital-asset markets move. Even a live deployment of this interface would not remove price impact, smart
        contract risk, or the chance of a failed transaction. Nothing on the screen is an offer, a solicitation, or a
        guarantee of yield.
      </p>

      <h2 id="privacy">Privacy</h2>
      <p>
        Theme preference is stored in local storage on this device. The mock wallet does not transmit an address. There
        is no account server in this build.
      </p>

      <h2 id="terms">Terms</h2>
      <p>
        Pool prices and swap quotes are chain reads, not an offer. Rewards are not published by this token and are not
        owed. A simulated wallet confirm is not a mainnet transaction.
      </p>
    </article>
  );
}
