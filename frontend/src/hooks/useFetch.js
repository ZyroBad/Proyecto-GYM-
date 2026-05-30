import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useFetch
 * Fetch con estados data/loading/error y AbortController.
 *
 * @template T
 * @param {string | null} url
 * @param {RequestInit} [options]
 * @returns {{ data: T|null, loading: boolean, error: string|null, refetch: () => Promise<T|null> }}
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    if (!url) return null;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      return json;
    } catch (err) {
      if (err?.name === 'AbortError') return null;
      setError(err?.message || 'Error en fetch');
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  return { data, loading, error, refetch: run };
}
