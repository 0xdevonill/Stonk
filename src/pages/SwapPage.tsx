import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { usePanelProps } from '../hooks/usePanelProps';
import { useIsMobile } from '../hooks/useMediaQuery';
import { tokenMeta } from '../lib/contracts/config';
import { SwapPanel } from '../components/trade/SwapPanel';
import { BottomSheet } from '../components/overlays/BottomSheet';

export function SwapPage() {
  usePageTitle('Swap');
  const panel = usePanelProps();
  const mobile = useIsMobile();
  const [sheet, setSheet] = useState(false);
  const props = {
    stonkPrice: panel.stonkPrice,
    ethPrice: panel.ethPrice,
    balances: panel.balances,
    connected: panel.connected,
    networkOk: panel.networkOk,
    onConnect: panel.onConnect,
    onSwitchNetwork: panel.onSwitchNetwork,
    onSubmit: panel.onSubmit,
  };

  return (
    <div className="swap-page has-sticky-action">
      <div className="swap-intro">
        <p className="eyebrow">Swap</p>
        <h1 className="heading-lg">Exchange {tokenMeta.displaySymbol}</h1>
        <p className="body-md muted">Same inputs as the trade ticket. Rate, impact, and fee stay one row away from the button.</p>
      </div>
      {mobile ? (
        <>
          <button type="button" className="sticky-action btn btn-primary btn-lg" onClick={() => setSheet(true)}>
            Swap
          </button>
          <BottomSheet open={sheet} title="Swap" onClose={() => setSheet(false)}>
            <SwapPanel {...props} />
          </BottomSheet>
        </>
      ) : (
        <SwapPanel {...props} />
      )}
    </div>
  );
}
