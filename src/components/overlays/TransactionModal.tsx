import { CircleNotch, Warning, X } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useTransaction, type TxStatus } from '../../context/TransactionContext';
import { useWallet } from '../../context/WalletContext';
import { getExpectedChain } from '../../lib/rpc/network';
import { useDialog } from '../../hooks/useDialog';
import { Button } from '../primitives/Button';
import { Icon } from '../primitives/Icon';

const copy: Record<TxStatus, { title: string; body: string }> = {
  preparing: { title: 'Preparing', body: 'Building the transaction.' },
  waiting: { title: 'Waiting for wallet', body: 'Confirm or reject the request in your wallet.' },
  confirming: { title: 'Confirming', body: 'The network has the request.' },
  processing: { title: 'Processing', body: 'Waiting for the receipt.' },
  success: { title: 'Confirmed', body: 'The chain caught up.' },
  failed: { title: 'Couldn’t complete', body: 'The transaction failed before it was final.' },
  rejected: { title: 'Rejected', body: 'The wallet request was declined.' },
  'wrong-network': { title: 'Wrong network', body: 'Switch networks, then continue the same order.' },
};

export function TransactionModal() {
  const tx = useTransaction();
  const wallet = useWallet();
  const open = tx.status != null;
  const onClose = useCallback(() => tx.close(), [tx]);
  const ref = useDialog(open, onClose);
  if (!tx.status || !tx.request) return null;
  const status = tx.status;
  const text = copy[status];
  const expected = getExpectedChain();

  return (
    <div className="overlay">
      <button className="overlay-dismiss" aria-label="Close transaction dialog" onClick={onClose} />
      <div className="modal raised" role="dialog" aria-modal="true" aria-labelledby="tx-title" ref={ref}>
        <p className="sr-only" aria-live="polite">
          {text.title}. {tx.error ?? text.body}
        </p>
        <div className="modal-center">
          <StatusMark status={status} />
          <h2 id="tx-title" className="heading-sm">
            {text.title}
          </h2>
          <p className="body-md muted">{tx.error ?? text.body}</p>
        </div>
        <dl className="quote-rows">
          <div>
            <dt>Action</dt>
            <dd>{tx.request.title}</dd>
          </div>
          <div>
            <dt>Amount</dt>
            <dd className="num">{tx.request.amountLabel}</dd>
          </div>
          <div>
            <dt>Summary</dt>
            <dd>{tx.request.summary}</dd>
          </div>
          <div>
            <dt>Network fee</dt>
            <dd className="num">{tx.request.feeLabel}</dd>
          </div>
        </dl>
        <div className="modal-actions">
          {status === 'waiting' ? (
            <>
              <Button variant="secondary" onClick={tx.reject}>
                Reject
              </Button>
              <Button onClick={tx.approve}>Approve</Button>
            </>
          ) : null}
          {status === 'failed' ? (
            <>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              <Button onClick={tx.retry}>Retry</Button>
            </>
          ) : null}
          {status === 'rejected' ? <Button onClick={tx.retry}>Try again</Button> : null}
          {status === 'wrong-network' ? (
            <Button
              block
              onClick={() => {
                void wallet.switchNetwork().then(() => tx.continueAfterSwitch());
              }}
            >
              Switch to {expected.name}
            </Button>
          ) : null}
          {status === 'success' ? (
            <Button block onClick={onClose}>
              Done
            </Button>
          ) : null}
        </div>
        <p className="caption faint security-line">Mock wallet — nothing is broadcast. We will never ask for your seed phrase.</p>
      </div>
    </div>
  );
}

function StatusMark({ status }: { status: TxStatus }) {
  if (status === 'success') {
    return (
      <svg className="check-svg" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="check-circle" cx="24" cy="24" r="20" />
        <path className="check-path" d="M15 25.5 21.5 32 34 18" />
      </svg>
    );
  }
  if (status === 'failed' || status === 'wrong-network') {
    return (
      <span className="state-icon warn">
        <Icon icon={Warning} size={24} />
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="state-icon">
        <Icon icon={X} size={24} />
      </span>
    );
  }
  return <CircleNotch className="spin" size={28} aria-hidden="true" />;
}
