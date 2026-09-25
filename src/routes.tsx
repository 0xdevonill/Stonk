import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TradePage } from './pages/TradePage';
import { SwapPage } from './pages/SwapPage';
import { StakePage } from './pages/StakePage';
import { EarnPage } from './pages/EarnPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TokenPage } from './pages/TokenPage';
import { DocsPage } from './pages/DocsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trade" element={<TradePage />} />
      <Route path="/swap" element={<SwapPage />} />
      <Route path="/stake" element={<StakePage />} />
      <Route path="/earn" element={<EarnPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/token" element={<TokenPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
