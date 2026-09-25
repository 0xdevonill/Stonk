import { Check, Copy } from '@phosphor-icons/react';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Icon } from './Icon';

export function CopyButton({ value, label }: { value: string; label: string }) {
  const { push } = useToast();
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="icon-btn icon-btn-inline"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          push({ title: 'Copied.', tone: 'success' });
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          push({ title: "Couldn't copy that.", tone: 'error' });
        }
      }}
    >
      <Icon icon={copied ? Check : Copy} size={20} />
    </button>
  );
}
