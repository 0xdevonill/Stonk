import { Component, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WalletProvider } from './context/WalletContext';
import { TradeSettingsProvider } from './context/TradeSettingsContext';
import { MarketProvider } from './context/MarketContext';
import { TransactionProvider } from './context/TransactionContext';
import { AppShell } from './components/layout/AppShell';
import { Lockup } from './components/brand/Logo';
import { Button } from './components/primitives/Button';

interface BoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="full-error">
          <Lockup variant="stacked" markSize={48} />
          <h1 className="heading-lg">The terminal is down.</h1>
          <p className="body-md muted">The interface failed to render. Retry, and if it persists the session needs a reload.</p>
          <Button onClick={() => this.setState({ error: null })}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <WalletProvider>
          <TradeSettingsProvider>
            <MarketProvider>
              <TransactionProvider>
                <BrowserRouter>
                  <AppErrorBoundary>
                    <AppShell />
                  </AppErrorBoundary>
                </BrowserRouter>
              </TransactionProvider>
            </MarketProvider>
          </TradeSettingsProvider>
        </WalletProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
