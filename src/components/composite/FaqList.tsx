import { CaretDown } from '@phosphor-icons/react';
import { useState } from 'react';
import { Icon } from '../primitives/Icon';

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q} className="faq-item">
            <button
              type="button"
              className="faq-trigger"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? null : index)}
            >
              <span>{item.q}</span>
              <Icon icon={CaretDown} size={20} className={expanded ? 'caret-open' : undefined} />
            </button>
            {expanded ? <p className="body-md muted faq-answer">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export const homeFaq = [
  {
    q: 'What is Mr.Stonk?',
    a: 'A trading terminal for one token. Its price and swap quotes are read from that contract, so the numbers on the ticket match the pool.',
  },
  {
    q: 'Do you custody funds?',
    a: 'No. A connected wallet signs its own transactions. This build does not hold keys, and the orders you confirm here are simulated.',
  },
  {
    q: 'Will you ask for my seed phrase?',
    a: 'No. Anyone who does is not us.',
  },
  {
    q: 'Which network do I need?',
    a: 'The configured network is Robinhood Chain. If a wallet reports somewhere else, the terminal stops and asks you to switch before you confirm.',
  },
  {
    q: 'Are reward figures guaranteed?',
    a: 'No. This token contract does not publish a staking APR. An empty reward figure is not a promise of return.',
  },
  {
    q: 'What is price impact?',
    a: 'Impact is how far your size moves the execution price. It sits next to the minimum you receive, before you confirm.',
  },
  {
    q: 'Why would a transaction fail?',
    a: 'The wallet declined it, the network was wrong, or the price moved past your slippage. The status screen names which one.',
  },
  {
    q: 'What is the Robinhood network tile?',
    a: 'A path for eligible tokenized assets to sit beside the rest of the book. It uses the same panels and the same confirmation states.',
  },
];
