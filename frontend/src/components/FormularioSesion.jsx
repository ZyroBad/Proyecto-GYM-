import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIAS } from '../utils/categorias.js';
import { useAtajoTeclado } from '../hooks/useAtajoTeclado.js';
import { useFetch } from '../hooks/useFetch.js';

const ESTADOS = ['pendiente', 'completada', 'pausada'];

const DEFAULT_HOST = 'exercisedb.p.rapidapi.com';
const DEFAULT_BASE = 'https://exercisedb.p.rapidapi.com';

function buildExerciseDbUrl(base, q) {
  const texto = String(q || '').trim();
  if (!texto) return null;
  return `${base}/exercises/name/${encodeURIComponent(texto)}?limit=12`;
}

const DEFAULT = {
  nombre: '',
  categoriaId: 'fuerza',
  estado: 'pendiente',
  puntuacion: 3,
  fechaActividad: '',
  duracionMinutos: 45,
  notas: '',
  ejercicios: [],
};

export default function FormularioSesion({
  onGuardar,
  sesionEditando,
  onActualizar,
  onCancelarEdicion,
  ejercicioParaAgregar,
  onEjercicioAgregado,
}) {
  const nombreRef = useRef(null);
  const [form, setForm] = useState(DEFAULT);
  const estaEditando = Boolean(sesionEditando);
  const [ejerciciosAbierto, setEjerciciosAbierto] = useState(true);
  const [notasAbierto, setNotasAbierto] = useState(false);

  // ExerciseDB (RapidAPI) - se usa dentro de Bitácora para agregar ejercicios rápido
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY || '';
  const apiHost = import.meta.env.VITE_RAPIDAPI_HOST || DEFAULT_HOST;
  const apiBase = import.meta.env.VITE_EXERCISEDB_BASE || DEFAULT_BASE;

  const [dbAbierto, setDbAbierto] = useState(false);
  const [qDb, setQDb] = useState('');
  const [enviarQDb, setEnviarQDb] = useState('');

  const urlDb = useMemo(() => {
    if (!apiKey) return null;
    if (enviarQDb.trim().length < 2) return null;
    return buildExerciseDbUrl(apiBase, enviarQDb);
  }, [apiBase, apiKey, enviarQDb]);

  const optionsDb = useMemo(
    () => ({
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      }
    }),
    [apiKey, apiHost]
  );

  const {
    data: ejerciciosDbData,
    loading: ejerciciosDbLoading,
    error: ejerciciosDbError,
    refetch: refetchEjerciciosDb
  } = useFetch(urlDb, optionsDb);

  const ejerciciosDb = Array.isArray(ejerciciosDbData) ? ejerciciosDbData : [];

  useEffect(() => {
    if (!ejercicioParaAgregar) return;

    const nombre = String(ejercicioParaAgregar?.nombre || '').trim();
    if (!nombre) return;

    setForm((prev) => ({
      ...prev,
      ejercicios: [
        ...prev.ejercicios,
        {
          nombre,
          series: Number(ejercicioParaAgregar?.series ?? 3),
          reps: Number(ejercicioParaAgregar?.reps ?? 8),
          pesoKg: Number(ejercicioParaAgregar?.pesoKg ?? 0),
        },
      ],
    }));

    onEjercicioAgregado?.();
  }, [ejercicioParaAgregar, onEjercicioAgregado]);

  // Cargar datos al editar
  useEffect(() => {
    if (!sesionEditando) return;

    const ejerciciosPrev = Array.isArray(sesionEditando.atributos?.ejercicios)
      ? sesionEditando.atributos.ejercicios
      : [];

    setForm({
      nombre:          sesionEditando.nombre ?? '',
      categoriaId:     sesionEditando.categoriaId ?? 'fuerza',
      estado:          sesionEditando.estado ?? 'pendiente',
      puntuacion:      sesionEditando.puntuacion ?? 3,
      fechaActividad:  sesionEditando.fechaActividad ?? '',
      duracionMinutos: sesionEditando.atributos?.duracionMinutos ?? 45,
      notas:           sesionEditando.notas ?? '',
      ejercicios:      ejerciciosPrev.map((e) => ({
        nombre: String(e?.nombre || ''),
        series: e?.series ?? 3,
        reps: e?.reps ?? 8,
        pesoKg: e?.pesoKg ?? 0,
      })),
    });

    setEjerciciosAbierto(true);
    setNotasAbierto(Boolean(String(sesionEditando.notas || '').trim()));
  }, [sesionEditando]);

  // Ctrl+N enfoca el nombre
  useAtajoTeclado(
    (e) => e.ctrlKey && e.key.toLowerCase() === 'n',
    (e) => {
      e.preventDefault();
      nombreRef.current?.focus();
    },
    { ignoreInputs: false }
  );

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function agregarEjercicio() {
    setForm((prev) => ({
      ...prev,
      ejercicios: [...prev.ejercicios, { nombre: '', series: 3, reps: 8, pesoKg: 0 }],
    }));
  }

  function quitarEjercicio(idx) {
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== idx),
    }));
  }

  function setEjercicio(idx, field, value) {
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
    }));
  }

  function agregarEjercicioConNombre(nombre) {
    const limpio = String(nombre || '').trim();
    if (!limpio) return;
    setForm((prev) => ({
      ...prev,
      ejercicios: [...prev.ejercicios, { nombre: limpio, series: 3, reps: 8, pesoKg: 0 }],
    }));

    // UX: al elegir uno, cierro la búsqueda para que no estorbe.
    setDbAbierto(false);
    setQDb('');
    setEnviarQDb('');
  }

  function buscarEnDb() {
    if (!apiKey) return;
    if (qDb.trim().length < 2) return;
    setEnviarQDb(qDb);
    // el hook reacciona a urlDb, pero refetch ayuda si repetís misma búsqueda
    setTimeout(() => refetchEjerciciosDb(), 0);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nombre = form.nombre.trim();
    if (!nombre) return;

    const ejerciciosLimpios = (form.ejercicios || [])
      .map((e) => ({
        nombre: String(e.nombre || '').trim(),
        series: Number(e.series ?? 0),
        reps: Number(e.reps ?? 0),
        pesoKg: Number(e.pesoKg ?? 0),
      }))
      .filter((e) => e.nombre);

    const payload = {
      nombre,
      categoriaId:     form.categoriaId,
      estado:          form.estado,
      puntuacion:      Number(form.puntuacion),
      fechaActividad:  form.fechaActividad || null,
      notas:           form.notas.trim(),
      atributos: {
        ...(sesionEditando?.atributos ?? {}),
        duracionMinutos: Number(form.duracionMinutos),
        ejercicios: ejerciciosLimpios,
      },
    };

    if (estaEditando) {
      onActualizar({ ...sesionEditando, ...payload });
    } else {
      onGuardar({
        id: crypto.randomUUID(),
        ...payload,
        fechaRegistro: new Date().toISOString(),
        activo: true,
      });
      setForm(DEFAULT);
      nombreRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">

        <div className="form-field full">
          <label htmlFor="nombre">Nombre de la sesión</label>
          <input
            id="nombre"
            ref={nombreRef}
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej: Push pesado pecho/tríceps"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="categoriaId">Categoría</label>
          <select
            id="categoriaId"
            value={form.categoriaId}
            onChange={(e) => set('categoriaId', e.target.value)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={form.estado}
            onChange={(e) => set('estado', e.target.value)}
          >
            {ESTADOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="duracionMinutos">Duración (min)</label>
          <input
            id="duracionMinutos"
            type="number"
            min="5"
            max="300"
            value={form.duracionMinutos}
            onChange={(e) => set('duracionMinutos', e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="puntuacion">Puntuación (1–5)</label>
          <input
            id="puntuacion"
            type="number"
            min="1"
            max="5"
            value={form.puntuacion}
            onChange={(e) => set('puntuacion', e.target.value)}
          />
        </div>

        <div className="form-field full">
          <label htmlFor="fechaActividad">Fecha de actividad</label>
          <input
            id="fechaActividad"
            type="date"
            value={form.fechaActividad}
            onChange={(e) => set('fechaActividad', e.target.value)}
          />
        </div>

        <div className="form-field full">
          <button
            type="button"
            className="section-toggle"
            onClick={() => setNotasAbierto((v) => !v)}
            aria-expanded={notasAbierto}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-notes" aria-hidden="true" style={{ color: 'var(--accent)' }} />
              Notas
            </span>
            <span className="section-meta">
              {form.notas.trim() ? 'con texto' : 'opcional'}
              <i className={`ti ${notasAbierto ? 'ti-chevron-up' : 'ti-chevron-down'}`} aria-hidden="true" />
            </span>
          </button>

          {notasAbierto && (
            <div className="section-body">
              <textarea
                id="notas"
                rows={3}
                value={form.notas}
                onChange={(e) => set('notas', e.target.value)}
                placeholder="Series, sensaciones, peso usado…"
              />
            </div>
          )}
        </div>

        <div className="form-field full">
          <button
            type="button"
            className="section-toggle"
            onClick={() => setEjerciciosAbierto((v) => !v)}
            aria-expanded={ejerciciosAbierto}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-dumbbell" aria-hidden="true" style={{ color: 'var(--accent)' }} />
              Ejercicios
            </span>
            <span className="section-meta">
              {form.ejercicios.length ? `${form.ejercicios.length} en la sesión` : 'opcional'}
              <i
                className={`ti ${ejerciciosAbierto ? 'ti-chevron-up' : 'ti-chevron-down'}`}
                aria-hidden="true"
              />
            </span>
          </button>

          {ejerciciosAbierto && (
            <div className="section-body">
              <div className="form-ex-head">
            <div>
              <label>Ejercicios (para PRs)</label>
              <p className="help">
                Meté al menos 1 ejercicio con peso/series/reps y ya te aparece en Records (PR).
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-sm" onClick={() => setDbAbierto((v) => !v)}>
                <i className="ti ti-search" aria-hidden="true" style={{ fontSize: 13 }} />
                Buscar (DB)
              </button>
              <button type="button" className="btn btn-sm" onClick={agregarEjercicio}>
                <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 13 }} />
                Agregar manual
              </button>
            </div>
          </div>

          {dbAbierto && (
            <div className="ex-db-panel">
              {!apiKey ? (
                <div className="empty-inline" style={{ width: '100%', marginTop: 0 }}>
                  <i className="ti ti-key" aria-hidden="true" />
                  <span>
                    Falta <code>VITE_RAPIDAPI_KEY</code> en <code>frontend/.env</code>.
                  </span>
                </div>
              ) : (
                <div className="ex-db-search" role="search" aria-label="Buscar en ExerciseDB">
                  <input
                    className="input"
                    value={qDb}
                    onChange={(e) => setQDb(e.target.value)}
                    placeholder="Buscar ejercicio (ej: squat, bench, pull up)"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return;
                      // Evita que el Enter dispare el submit del form principal
                      e.preventDefault();
                      buscarEnDb();
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    disabled={qDb.trim().length < 2}
                    onClick={buscarEnDb}
                  >
                    Buscar
                  </button>
                </div>
              )}

              {apiKey && ejerciciosDbLoading && (
                <p className="ex-db-msg">Buscando…</p>
              )}
              {apiKey && !ejerciciosDbLoading && ejerciciosDbError && (
                <p className="ex-db-msg error">{ejerciciosDbError}</p>
              )}

              {apiKey && !ejerciciosDbLoading && !ejerciciosDbError && enviarQDb.trim().length >= 2 && (
                <div className="ex-db-results" role="list">
                  {!ejerciciosDb.length ? (
                    <div className="ex-db-empty">
                      <i className="ti ti-mood-empty" aria-hidden="true" />
                      <span>No encontré resultados.</span>
                    </div>
                  ) : (
                    ejerciciosDb.map((e) => (
                      <button
                        key={e.id || `${e.name}-${e.target}`}
                        type="button"
                        className="ex-db-item"
                        onClick={() => agregarEjercicioConNombre(e.name)}
                        role="listitem"
                        title="Agregar a la sesión"
                      >
                        <span className="ex-db-name">{String(e.name || '')}</span>
                        <span className="ex-db-meta">
                          {e.target ? `Target: ${e.target}` : 'Target: —'}
                        </span>
                        <span className="ex-db-add">
                          <i className="ti ti-plus" aria-hidden="true" />
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {form.ejercicios.length === 0 ? (
            <div className="empty-inline">
              <i className="ti ti-dumbbell" aria-hidden="true" />
              <span>Sin ejercicios aún.</span>
            </div>
          ) : (
            <div className="ex-list">
              {form.ejercicios.map((ejer, idx) => (
                <div key={idx} className="ex-row">
                  <input
                    className="input"
                    value={ejer.nombre}
                    onChange={(ev) => setEjercicio(idx, 'nombre', ev.target.value)}
                    placeholder="Ej: Bench press"
                    aria-label={`Ejercicio ${idx + 1}`}
                  />
                  <input
                    className="input ex-num"
                    type="number"
                    min="1"
                    value={ejer.series}
                    onChange={(ev) => setEjercicio(idx, 'series', ev.target.value)}
                    aria-label={`Series ${idx + 1}`}
                    title="Series"
                  />
                  <input
                    className="input ex-num"
                    type="number"
                    min="1"
                    value={ejer.reps}
                    onChange={(ev) => setEjercicio(idx, 'reps', ev.target.value)}
                    aria-label={`Reps ${idx + 1}`}
                    title="Reps"
                  />
                  <input
                    className="input ex-num"
                    type="number"
                    min="0"
                    step="0.5"
                    value={ejer.pesoKg}
                    onChange={(ev) => setEjercicio(idx, 'pesoKg', ev.target.value)}
                    aria-label={`Peso ${idx + 1}`}
                    title="Peso (kg)"
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => quitarEjercicio(idx)}
                    aria-label={`Quitar ejercicio ${idx + 1}`}
                    title="Quitar"
                  >
                    <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 13 }} />
                  </button>
                </div>
              ))}
              <div className="ex-hints">
                <span>nombre</span>
                <span>series</span>
                <span>reps</span>
                <span>kg</span>
              </div>
            </div>
          )}
            </div>
          )}
        </div>

        <div className="form-field actions">
          {estaEditando && (
            <button type="button" className="btn" onClick={onCancelarEdicion}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            <i
              className={`ti ${estaEditando ? 'ti-check' : 'ti-plus'}`}
              aria-hidden="true"
              style={{ fontSize: 14 }}
            />
            {estaEditando ? 'Guardar cambios' : 'Guardar sesión'}
          </button>
        </div>

      </div>
    </form>
  );
}
