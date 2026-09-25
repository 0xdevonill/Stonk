import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomTabBar, MobileMenu, Navbar } from './Navbar';
import { Footer } from './Footer';
import { WalletModal } from '../overlays/WalletModal';
import { TransactionModal } from '../overlays/TransactionModal';
import { Toaster } from '../overlays/Toaster';
import { AppRoutes } from '../../routes';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main id="main" className="app-main" key={location.pathname}>
        <div className="page-fade">
          <AppRoutes />
        </div>
      </main>
      <Footer />
      <BottomTabBar onMenu={() => setMenuOpen(true)} />
      <WalletModal />
      <TransactionModal />
      <Toaster />
    </div>
  );
}
