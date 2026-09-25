import { useEffect, useRef, useState } from 'react';
import { formatUsd } from '../../lib/format';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export function CommissionCard({ amount, label }: { amount: number | null; label: string }) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(reduced ? amount : 0);

  useEffect(() => {
    if (amount == null) {
      setShown(null);
      return;
    }
    if (reduced) {
      setShown(amount);
      return;
    }
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 900);
        const eased = 1 - (1 - t) ** 3;
        setShown(amount * eased);
        if (t < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
      observer.disconnect();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [amount, reduced]);

  return (
    <article className="card commission-card" ref={ref}>
      <p className="eyebrow">Creator commission</p>
      <p className="data-lg num">{shown == null ? '--' : formatUsd(shown)}</p>
      <p className="body-md muted">{label}. Illustrative accrual — not a payout instruction.</p>
    </article>
  );
}
