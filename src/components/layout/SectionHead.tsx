import type { ReactNode } from 'react';

export function SectionHead({
  eyebrow,
  title,
  action,
  as = 'h2',
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
}) {
  const Title = as;
  const className = as === 'h1' ? 'heading-lg' : 'display-lg';
  return (
    <div className="section-head">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Title className={className}>{title}</Title>
      </div>
      {action}
    </div>
  );
}
