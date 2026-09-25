import { X } from '@phosphor-icons/react';
import { useCallback, type ReactNode } from 'react';
import { useDialog } from '../../hooks/useDialog';
import { Icon } from '../primitives/Icon';

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const close = useCallback(() => onClose(), [onClose]);
  const ref = useDialog(open, close);
  if (!open) return null;
  return (
    <div className="overlay">
      <button className="overlay-dismiss" aria-label={`Close ${title}`} onClick={close} />
      <div className="sheet raised" role="dialog" aria-modal="true" aria-labelledby="sheet-title" ref={ref}>
        <div className="sheet-handle" aria-hidden="true" />
        <div className="between">
          <h2 id="sheet-title" className="heading-sm">
            {title}
          </h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close">
            <Icon icon={X} size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
