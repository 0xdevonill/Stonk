import { Check, Info, Warning, X } from '@phosphor-icons/react';
import { useToast, type ToastTone } from '../../context/ToastContext';
import { Icon, type IconType } from '../primitives/Icon';

const icons: Record<ToastTone, IconType> = {
  success: Check,
  info: Info,
  warning: Warning,
  error: Warning,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast raised toast-${toast.tone}`}>
          <Icon icon={icons[toast.tone]} size={20} />
          <p>{toast.title}</p>
          <button type="button" className="icon-btn" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)}>
            <Icon icon={X} size={20} />
          </button>
        </div>
      ))}
    </div>
  );
}
