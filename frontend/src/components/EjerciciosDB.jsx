import { useEffect, useMemo, useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';

const DEFAULT_HOST = 'exercisedb.p.rapidapi.com';
const DEFAULT_BASE = 'https://exercisedb.p.rapidapi.com';

function buildUrl(base, q) {
  const texto = String(q || '').trim();
  if (!texto) return null;
  // endpoint simple (por nombre)
  return `${base}/exercises/name/${encodeURIComponent(texto)}?limit=18`;
}

export default function EjerciciosDB({ onUsarEjercicio }) {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || '';
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST || DEFAULT_HOST;
  const apiBase = import.meta.env.VITE_EXERCISEDB_BASE || DEFAULT_BASE;

  const [q, setQ] = useState('');
  const [enviarQ, setEnviarQ] = useState('');

  const url = useMemo(() => {
    if (!apiKey) return null;
    if (enviarQ.trim().length < 2) return null;
    return buildUrl(apiBase, enviarQ);
  }, [apiBase, apiKey, enviarQ]);

  const options = useMemo(
    () => ({
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    }),
    [apiKey, apiHost]
  );

  const { data, loading, error, refetch } = useFetch(url, options);

  useEffect(() => {
    // si no hay key, no intentamos ni nada
    if (!apiKey) return;
  }, [apiKey]);

  const ejercicios = Array.isArray(data) ? data : [];

  function usar(e) {
    if (!onUsarEjercicio) return;

    const nombre = String(e?.name || '').trim();
    if (!nombre) return;

    onUsarEjercicio({
      nombre,
      series: 3,
      reps: 8,
      pesoKg: 0
    });
  }

  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div className="card">
        <div className="card-head">
          <h3>
            <i
              className="ti ti-database"
              aria-hidden="true"
              style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
            />
            ExerciseDB (RapidAPI)
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {apiKey ? 'key cargada' : 'sin key'}
          </span>
        </div>

        {!apiKey && (
          <div className="empty-state" style={{ padding: '18px 0' }}>
            <i className="ti ti-key" aria-hidden="true" />
            <p>
              Falta `VITE_RAPIDAPI_KEY` en `frontend/.env`.
              <br />
              (No la subÃ¡s a git.)
            </p>
          </div>
        )}

        {apiKey && (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEnviarQ(q);
                setTimeout(() => refetch(), 0);
              }}
              className="exercise-search"
            >
              <div style={{ flex: 1 }}>
                <label className="input-label" htmlFor="q-ej">
                  Buscar por nombre
                </label>
                <input
                  id="q-ej"
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ej: squat, bench, pull up..."
                  autoComplete="off"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={q.trim().length < 2}>
                <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 14 }} />
                Buscar
              </button>
            </form>

            {loading && (
              <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: 13 }}>
                Buscando ejerciciosâ€¦
              </p>
            )}

            {!loading && error && (
              <p className="error-msg" style={{ marginTop: 10 }}>
                {error}
              </p>
            )}

            {!loading && !error && enviarQ.trim().length >= 2 && !ejercicios.length && (
              <div className="empty-state" style={{ padding: '18px 0' }}>
                <i className="ti ti-mood-empty" aria-hidden="true" />
                <p>No encontrÃ© resultados para "{enviarQ}".</p>
              </div>
            )}

            {!!ejercicios.length && (
              <div className="exercise-grid" role="list">
                {ejercicios.map((e) => (
                  <div key={e.id || `${e.name}-${e.target}`} className="exercise-card" role="listitem">
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div className="exercise-badge" aria-hidden="true">
                        <i className="ti ti-dumbbell" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 650, fontSize: 14 }}>
                          {String(e.name || '').replace(/^\w/, (m) => m.toUpperCase())}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                          {e.bodyPart ? `Body: ${e.bodyPart}` : 'Body: â€”'} â€¢{' '}
                          {e.target ? `Target: ${e.target}` : 'Target: â€”'}
                        </p>
                      </div>
                    </div>

                    {!!onUsarEjercicio && (
                      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-sm" onClick={() => usar(e)}>
                          <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 13 }} />
                          Usar en sesión
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
