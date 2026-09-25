import { useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useWallet } from '../context/WalletContext';
import { useQuery } from '../hooks/useQuery';
import { usePageTitle } from '../hooks/usePageTitle';
import { fetchEarn, type EarnEligibility } from '../lib/api';
import { DataBoundary, EmptyState } from '../components/primitives/StateBlock';
import { EarnCard } from '../components/composite/EarnCard';
import { Icon } from '../components/primitives/Icon';
import { cn } from '../lib/cn';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'eligible', label: 'Eligible' },
  { id: 'ineligible', label: 'Not eligible' },
  { id: 'soon', label: 'Coming soon' },
] as const;

export function EarnPage() {
  usePageTitle('Earn');
  const earn = useQuery('earn', fetchEarn);
  const wallet = useWallet();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const [query, setQuery] = useState('');

  const assets = useMemo(() => {
    const list = earn.data?.assets ?? [];
    return list.filter((asset) => {
      const matchesFilter = filter === 'all' || asset.eligibility === (filter as EarnEligibility);
      const haystack = `${asset.name} ${asset.ticker}`.toLowerCase();
      return matchesFilter && haystack.includes(query.trim().toLowerCase());
    });
  }, [earn.data, filter, query]);

  function holdingFor(ticker: string): number | null {
    if (!wallet.account) return null;
    if (ticker === 'STONK') return wallet.account.balances.STONK;
    if (ticker === 'sSTONK') return wallet.account.staked;
    return 0;
  }

  return (
    <div className="page-wrap">
      <header className="page-intro">
        <p className="eyebrow">Earn</p>
        <h1 className="heading-lg">Asset markets</h1>
        <p className="body-md muted">Eligibility is a label, not a promise that a position will pay.</p>
      </header>
      <div className="between earn-tools">
        <div className="preset-row" role="tablist" aria-label="Eligibility">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn('pill', filter === item.id && 'is-active')}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="search">
          <Icon icon={MagnifyingGlass} size={20} />
          <input
            className="input"
            value={query}
            placeholder="Search markets"
            aria-label="Search markets"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <DataBoundary
        loading={earn.loading}
        error={earn.error}
        onRetry={earn.reload}
        skeleton={<div className="earn-grid">{Array.from({ length: 6 }, (_, index) => <div key={index} className="card skeleton-block" />)}</div>}
        empty={assets.length === 0}
        emptyState={<EmptyState icon={MagnifyingGlass} message="Nothing in this filter." />}
      >
        <div className="earn-grid">
          {assets.map((asset) => (
            <EarnCard key={asset.id} asset={asset} holding={holdingFor(asset.ticker)} />
          ))}
        </div>
      </DataBoundary>
    </div>
  );
}
