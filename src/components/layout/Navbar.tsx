import {
  BookOpen,
  CaretDown,
  ChartBar,
  House,
  List,
  Moon,
  SignOut,
  Stack,
  Sun,
  Swap,
  Wallet,
  X,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { useWallet } from '../../context/WalletContext';
import { contracts } from '../../lib/contracts/config';
import { formatAddress, formatToken } from '../../lib/format';
import { cn } from '../../lib/cn';
import { Identicon } from '../brand/Identicon';
import { Lockup } from '../brand/Logo';
import { Icon } from '../primitives/Icon';
import { CopyButton } from '../primitives/CopyButton';

const primary = [
  ['Trade', '/trade'],
  ['Swap', '/swap'],
  ['Stake', '/stake'],
  ['Earn', '/earn'],
  ['Portfolio', '/portfolio'],
] as const;

const secondary = [
  ['Analytics', '/analytics'],
  ['Token', '/token'],
  ['Docs', '/docs'],
] as const;

export function Navbar({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const wallet = useWallet();
  const { push } = useToast();
  const [menu, setMenu] = useState<'more' | 'account' | null>(null);

  const close = () => setMenu(null);

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand" aria-label="Mr.Stonk home" onClick={close}>
          <Lockup markSize={26} />
        </NavLink>

        <nav className="nav-links" aria-label="Primary">
          {primary.map(([label, href]) => (
            <NavLink key={href} to={href} className={({ isActive }) => cn('nav-link', isActive && 'is-active')}>
              {label}
            </NavLink>
          ))}
          {secondary.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) => cn('nav-link', 'nav-link-secondary', isActive && 'is-active')}
            >
              {label}
            </NavLink>
          ))}
          <div className="more-wrap">
            <button
              type="button"
              className={cn('nav-link more-btn', menu === 'more' && 'is-active')}
              aria-expanded={menu === 'more'}
              onClick={() => setMenu((current) => (current === 'more' ? null : 'more'))}
            >
              More <Icon icon={CaretDown} size={20} />
            </button>
            {menu === 'more' ? (
              <div className="dropdown raised" role="menu">
                {secondary.map(([label, href]) => (
                  <NavLink key={href} to={href} role="menuitem" className="dropdown-item" onClick={close}>
                    {label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className={cn('network-chip', !wallet.networkOk && wallet.account && 'is-warn')}
            onClick={() => {
              if (wallet.account && !wallet.networkOk) wallet.openConnect();
            }}
          >
            <span className={cn('status-dot', wallet.networkOk ? 'is-ok' : 'is-warn')} aria-hidden="true" />
            <span>{wallet.networkOk ? contracts.chainName : 'Wrong network'}</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon icon={theme === 'dark' ? Sun : Moon} size={20} />
          </button>
          {wallet.account ? (
            <div className="account-wrap">
              <button
                type="button"
                className="wallet-btn"
                aria-expanded={menu === 'account'}
                onClick={() => setMenu((current) => (current === 'account' ? null : 'account'))}
              >
                <Identicon address={wallet.account.address} />
                <span className="num">{formatAddress(wallet.account.address)}</span>
              </button>
              {menu === 'account' ? (
                <div className="dropdown raised account-card" role="menu">
                  <div className="account-head">
                    <Identicon address={wallet.account.address} size={36} />
                    <div>
                      <p className="num">{formatAddress(wallet.account.address, 8, 6)}</p>
                      <p className="caption faint">{contracts.chainName}</p>
                    </div>
                    <CopyButton value={wallet.account.address} label="Copy address" />
                  </div>
                  <dl className="quote-rows">
                    <div>
                      <dt>ETH</dt>
                      <dd className="num">{formatToken(wallet.account.balances.ETH)}</dd>
                    </div>
                    <div>
                      <dt>$STONK</dt>
                      <dd className="num">{formatToken(wallet.account.balances.STONK)}</dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      wallet.disconnect();
                      close();
                      push({ title: 'Wallet disconnected.', tone: 'info' });
                    }}
                  >
                    <Icon icon={SignOut} size={20} /> Disconnect
                  </button>
                  <p className="caption faint security-line">We will never ask for your seed phrase.</p>
                </div>
              ) : null}
            </div>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={wallet.openConnect}>
              Connect
            </button>
          )}
          <button
            type="button"
            className="icon-btn nav-burger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={onMenu}
          >
            <Icon icon={menuOpen ? X : List} size={24} />
          </button>
        </div>
      </div>
      {menu ? <button className="dismiss-layer" aria-label="Close menu" tabIndex={-1} onClick={close} /> : null}
    </header>
  );
}

export function BottomTabBar({ onMenu }: { onMenu: () => void }) {
  const tabs = [
    { label: 'Home', href: '/', icon: House },
    { label: 'Trade', href: '/trade', icon: ChartBar },
    { label: 'Swap', href: '/swap', icon: Swap },
    { label: 'Portfolio', href: '/portfolio', icon: Stack },
  ] as const;

  return (
    <nav className="tabbar" aria-label="Mobile">
      {tabs.map((tab) => (
        <NavLink key={tab.href} to={tab.href} end={tab.href === '/'} className={({ isActive }) => cn('tabbar-link', isActive && 'is-active')}>
          <Icon icon={tab.icon} size={20} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
      <button type="button" className="tabbar-link" onClick={onMenu}>
        <Icon icon={BookOpen} size={20} />
        <span>Menu</span>
      </button>
    </nav>
  );
}

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const wallet = useWallet();
  if (!open) return null;
  return (
    <div className="mobile-menu" role="dialog" aria-label="Menu">
      {[...primary, ...secondary].map(([label, href]) => (
        <NavLink key={href} to={href} className="mobile-link" onClick={onClose}>
          {label}
        </NavLink>
      ))}
      <button type="button" className="mobile-link" onClick={toggleTheme}>
        <Icon icon={theme === 'dark' ? Sun : Moon} size={20} />
        {theme === 'dark' ? 'Light theme' : 'Dark theme'}
      </button>
      {wallet.account ? (
        <button
          type="button"
          className="mobile-link"
          onClick={() => {
            wallet.disconnect();
            onClose();
          }}
        >
          <Icon icon={Wallet} size={20} /> Disconnect
        </button>
      ) : (
        <button
          type="button"
          className="mobile-link"
          onClick={() => {
            wallet.openConnect();
            onClose();
          }}
        >
          <Icon icon={Wallet} size={20} /> Connect wallet
        </button>
      )}
    </div>
  );
}
