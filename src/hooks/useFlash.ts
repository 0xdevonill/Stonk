import { useEffect, useRef, useState } from 'react';

export function useFlash(value: number | null): 'up' | 'down' | null {
  const previous = useRef(value);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value == null || previous.current == null || value === previous.current) {
      previous.current = value;
      return;
    }
    setDirection(value > previous.current ? 'up' : 'down');
    previous.current = value;
    const timeout = window.setTimeout(() => setDirection(null), 400);
    return () => window.clearTimeout(timeout);
  }, [value]);

  return direction;
}
