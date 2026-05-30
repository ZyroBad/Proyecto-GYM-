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
  const optionsRef = useRef(options);

  // Evita loops: `options` puede ser un objeto nuevo en cada render.
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const run = useCallback(async () => {
    if (!url) return null;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, { ...(optionsRef.current || {}), signal: controller.signal });
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
  }, [url]);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  return { data, loading, error, refetch: run };
}
