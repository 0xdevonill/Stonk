import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useAnimatedNumber(value: number | null, duration = 200): number | null {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (value == null || !Number.isFinite(value)) {
      setDisplay(null);
      fromRef.current = null;
      return;
    }

    const from = fromRef.current;
    if (from == null || reduced || from === value) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame = window.requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value, duration, reduced]);

  return display;
}
