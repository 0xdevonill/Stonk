import type { ReactNode } from 'react';

export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  return (
    <span className="tooltip">
      {children}
      <span role="tooltip" className="tooltip-bubble">
        {content}
      </span>
    </span>
  );
}
