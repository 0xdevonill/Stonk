# Mr.Stonk

The trading terminal for the internet's favorite asset class. This repository is the interface: a light and dark theme, shared trade and swap panels, and a mock data layer so the screens can be reviewed without a live chain.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## What you can click through

- Home, Trade, Swap, Stake, Earn, Portfolio, Analytics, Token, and Docs
- Theme toggle, remembered in local storage and defaulting to the system preference
- Wallet modal: MetaMask is the recommended path. WalletConnect reports Sepolia so the wrong-network state is reachable, then **Switch to Ethereum**
- Buy, sell, swap, stake, and claim share one transaction dialog: preparing, waiting for the wallet, confirming, processing, then success. Reject declines the mock prompt. A size whose price impact exceeds slippage ends in the failed state

Orders are simulated. Nothing is broadcast, and the interface will not ask for a seed phrase.

## Data

Figures are illustrative and come from `src/lib/api`. Components do not embed prices or APRs. Missing numbers render as `--`, missing percentages as `XX%`.

Append `?fault=chart` (or `stats`, `holders`, `activity`, `staking`, `earn`, `portfolio`, `tokenomics`) to force that block's error state and retry action.

Contract addresses and chain name are read from the environment. See `.env.example`.

## Design

Tokens live in `src/styles/tokens.css` (color, type, space, radius, shadow, motion). Both themes are explicit, not inversions. Small text uses contrast-safe companions where the spec's tertiary, positive, and warning colors miss 4.5:1; candles and large fills keep the specified colors.
