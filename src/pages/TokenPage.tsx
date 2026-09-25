import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMarket } from '../context/MarketContext';
import { fetchHolders, fetchTokenomics } from '../lib/api';
import { contracts, tokenMeta } from '../lib/contracts/config';
import { formatAddress, formatCompact } from '../lib/format';
import { Container } from '../components/layout/Container';
import { PriceCard } from '../components/data/PriceCard';
import { DataBoundary } from '../components/primitives/StateBlock';
import { CopyButton } from '../components/primitives/CopyButton';
import { TokenomicsChart } from '../components/composite/TokenomicsChart';

const utility = [
  { title: 'Trade', body: 'Candles, a ticket, and the holder tape on one screen.', href: '/trade' },
  { title: 'Stake', body: 'An estimated APR, a calculator, and a position that starts empty.', href: '/stake' },
  { title: 'Earn', body: 'Markets with an eligibility label you can filter.', href: '/earn' },
];

export function TokenPage() {
  usePageTitle('Token');
  const market = useMarket();
  const tokenomics = useQuery('token-tokenomics', fetchTokenomics);
  const holders = useQuery('token-holders', fetchHolders);
  const stats = market.stats;

  return (
    <Container className="stack page-wrap">
      <header className="page-intro">
        <p className="eyebrow">Token</p>
        <h1 className="heading-lg">{tokenMeta.name}</h1>
        <p className="body-lg muted measure">
          {tokenMeta.displaySymbol} is the asset this terminal is built around. Supply, addresses, and the draft allocation
          live here. Prices on this page are illustrative.
        </p>
      </header>
      <PriceCard
        loading={market.loading}
        price={stats?.priceUsd ?? null}
        changePct={stats?.change24hPct ?? null}
        sparkline={stats?.sparkline ?? []}
      />
      <section className="card" id="contract">
        <h2 className="heading-md">Contract</h2>
        <dl className="quote-rows">
          <div>
            <dt>Token</dt>
            <dd className="num">
              {formatAddress(contracts.tokenAddress, 10, 8)} <CopyButton value={contracts.tokenAddress} label="Copy token address" />
            </dd>
          </div>
          <div>
            <dt>Staking</dt>
            <dd className="num">{formatAddress(contracts.stakingAddress, 10, 8)}</dd>
          </div>
          <div>
            <dt>Router</dt>
            <dd className="num">{formatAddress(contracts.routerAddress, 10, 8)}</dd>
          </div>
          <div>
            <dt>Network</dt>
            <dd>{contracts.chainName}</dd>
          </div>
          <div>
            <dt>Supply</dt>
            <dd className="num">{formatCompact(stats?.totalSupply ?? null)}</dd>
          </div>
        </dl>
      </section>
      <section className="card">
        <h2 className="heading-md">Tokenomics</h2>
        <p className="caption faint">Draft allocation. Not a final cap table.</p>
        <DataBoundary loading={tokenomics.loading} error={tokenomics.error} onRetry={tokenomics.reload} skeleton={<div className="skeleton-block" />}>
          <TokenomicsChart slices={tokenomics.data?.tokenomics.slices ?? []} />
        </DataBoundary>
      </section>
      <section className="card">
        <h2 className="heading-md">Distribution</h2>
        <DataBoundary loading={holders.loading} error={holders.error} onRetry={holders.reload} skeleton={<div className="skeleton-block" />}>
          <TokenomicsChart slices={holders.data?.segments ?? []} />
        </DataBoundary>
      </section>
      <section>
        <h2 className="heading-md">Utility</h2>
        <div className="feature-grid">
          {utility.map((item) => (
            <Link key={item.href} to={item.href} className="card feature-card">
              <h3 className="heading-sm">{item.title}</h3>
              <p className="body-md muted">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
