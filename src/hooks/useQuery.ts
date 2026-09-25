import { useCallback, useEffect, useRef, useState } from 'react';

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useQuery<T>(key: string, fetcher: () => Promise<T>): QueryState<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const hasData = useRef(false);

  const run = useCallback(() => {
    const id = ++seq.current;
    if (!hasData.current) setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then((next) => {
        if (seq.current !== id) return;
        hasData.current = true;
        setData(next);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (seq.current !== id) return;
        setError(err instanceof Error ? err.message : 'Could not load');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    hasData.current = false;
    setData(null);
    run();
    return () => {
      seq.current += 1;
    };
  }, [key, run]);

  return { data, loading: loading && data == null, error: data ? null : error, reload: run };
}
