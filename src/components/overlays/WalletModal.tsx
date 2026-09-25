import { CircleNotch, ShieldCheck, ShareNetwork, Wallet, Warning } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useWallet } from '../../context/WalletContext';
import { getExpectedChain } from '../../lib/rpc/network';
import { walletChoices, type WalletId } from '../../lib/rpc/wallet';
import { foreignChain } from '../../lib/rpc/network';
import { useDialog } from '../../hooks/useDialog';
import { Icon, type IconType } from '../primitives/Icon';
import { Button } from '../primitives/Button';

const icons: Record<WalletId, IconType> = {
  metamask: Wallet,
  rabby: ShieldCheck,
  coinbase: Wallet,
  walletconnect: ShareNetwork,
};

export function WalletModal() {
  const wallet = useWallet();
  const open = wallet.modal !== 'closed';
  const onClose = useCallback(() => wallet.closeModal(), [wallet]);
  const ref = useDialog(open, onClose);
  if (!open) return null;
  const expected = getExpectedChain();
  const choice = walletChoices.find((item) => item.id === wallet.pendingWallet);

  return (
    <div className="overlay">
      <button className="overlay-dismiss" aria-label="Close wallet dialog" onClick={onClose} />
      <div className="modal raised" role="dialog" aria-modal="true" aria-labelledby="wallet-title" ref={ref}>
        {wallet.modal === 'select' ? (
          <>
            <header className="modal-head">
              <h2 id="wallet-title" className="heading-sm">
                Select wallet
              </h2>
              <p className="body-md muted">Connect a wallet to read a portfolio and simulate an order.</p>
            </header>
            <ul className="wallet-list">
              {walletChoices.map((item) => (
                <li key={item.id}>
                  <button type="button" className="wallet-row" onClick={() => wallet.connect(item.id)}>
                    <span className="wallet-icon">
                      <Icon icon={icons[item.id]} size={24} />
                    </span>
                    <span>{item.name}</span>
                    {item.recommended ? <span className="badge badge-accent">Recommended</span> : null}
                  </button>
                </li>
              ))}
            </ul>
            <p className="caption faint security-line">Demo mode. No signature is requested. We will never ask for your seed phrase.</p>
          </>
        ) : null}

        {wallet.modal === 'connecting' ? (
          <div className="modal-center">
            <span className="wallet-icon pulse-opacity">
              <Icon icon={choice ? icons[choice.id] : Wallet} size={24} />
            </span>
            <CircleNotch className="spin" size={20} aria-hidden="true" />
            <h2 id="wallet-title" className="heading-sm">
              Connecting…
            </h2>
            <p className="body-md muted">Waiting on {choice?.name ?? 'your wallet'}.</p>
          </div>
        ) : null}

        {wallet.modal === 'wrong-network' ? (
          <div className="modal-center">
            <span className="state-icon warn">
              <Icon icon={Warning} size={24} />
            </span>
            <h2 id="wallet-title" className="heading-sm">
              Wrong network
            </h2>
            <p className="body-md muted">
              You&apos;re on {foreignChain.name}. {expected.name} is required before an order can be prepared.
            </p>
            <Button
              block
              onClick={() => {
                void wallet.switchNetwork();
              }}
            >
              Switch to {expected.name}
            </Button>
            <p className="caption faint security-line">We will never ask for your seed phrase.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
