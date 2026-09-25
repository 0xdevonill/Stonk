import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAsset, useMarket } from '../context/MarketContext';
import { fetchHolders, fetchTokenomics } from '../lib/api';
import { contracts } from '../lib/contracts/config';
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
  const asset = useAsset();
  const tokenomics = useQuery('token-tokenomics', fetchTokenomics);
  const holders = useQuery('token-holders', fetchHolders);
  const stats = market.stats;

  return (
    <Container className="stack page-wrap">
      <header className="page-intro">
        <p className="eyebrow">Token</p>
        <h1 className="heading-lg">{asset.name}</h1>
        <p className="body-lg muted measure">
          {asset.displaySymbol} is the asset this terminal reads from {contracts.chainName}. Supply, the curve, and the
          pool price come from that contract.
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
            <dt>Curve</dt>
            <dd className="num">{stats?.curveAddress ? formatAddress(stats.curveAddress, 10, 8) : '--'}</dd>
          </div>
          <div>
            <dt>Quote</dt>
            <dd className="num">
              {stats?.quoteSymbol ?? '--'} {stats?.quoteToken ? formatAddress(stats.quoteToken, 10, 8) : ''}
            </dd>
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
        <p className="caption faint">Only figures this contract publishes.</p>
        <DataBoundary
          loading={tokenomics.loading}
          error={tokenomics.error}
          empty={(tokenomics.data?.tokenomics.slices.length ?? 0) === 0}
          onRetry={tokenomics.reload}
          skeleton={<div className="skeleton-block" />}
          emptyState={<p className="body-md muted">No allocation split is stored on this contract. Total supply is above.</p>}
        >
          <TokenomicsChart slices={tokenomics.data?.tokenomics.slices ?? []} />
        </DataBoundary>
      </section>
      <section className="card">
        <h2 className="heading-md">Distribution</h2>
        <DataBoundary
          loading={holders.loading}
          error={holders.error}
          empty={(holders.data?.segments.length ?? 0) === 0}
          onRetry={holders.reload}
          skeleton={<div className="skeleton-block" />}
          emptyState={<p className="body-md muted">This contract does not publish a holder distribution.</p>}
        >
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
