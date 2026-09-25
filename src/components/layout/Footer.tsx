import { Link } from 'react-router-dom';
import { contracts, tokenMeta } from '../../lib/contracts/config';
import { formatAddress } from '../../lib/format';
import { Lockup } from '../brand/Logo';
import { CopyButton } from '../primitives/CopyButton';

const columns = [
  {
    title: 'Product',
    links: [
      ['Trade', '/trade'],
      ['Swap', '/swap'],
      ['Stake', '/stake'],
      ['Earn', '/earn'],
      ['Portfolio', '/portfolio'],
      ['Analytics', '/analytics'],
      ['Token', '/token'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Docs', '/docs'],
      ['Questions', '/#faq'],
      ['Status', '/docs#status'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['Terms', '/docs#terms'],
      ['Privacy', '/docs#privacy'],
      ['Risk', '/docs#risk'],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Lockup />
          <p className="body-md muted">The trading terminal for the internet&apos;s favorite asset class.</p>
          <p className="caption faint">
            {tokenMeta.displaySymbol} · {contracts.chainName} ·{' '}
            <span className="num">{formatAddress(contracts.tokenAddress)}</span>
            <CopyButton value={contracts.tokenAddress} label="Copy token address" />
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="eyebrow">{column.title}</p>
            <ul className="footer-links">
              {column.links.map(([label, href]) => (
                <li key={href}>
                  {href.startsWith('/') ? <Link to={href}>{label}</Link> : <a href={href}>{label}</a>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container footer-bottom">
        <p className="caption faint">
          This build simulates orders. No transaction is broadcast. Figures are illustrative, not a quote, yield, or
          promise. We will never ask for your seed phrase.
        </p>
        <p className="caption faint">© {new Date().getFullYear()} Mr.Stonk</p>
      </div>
    </footer>
  );
}
