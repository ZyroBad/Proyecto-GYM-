import { useCallback, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import FormularioSesion from './components/FormularioSesion.jsx';
import ListaSesiones from './components/ListaSesiones.jsx';
import { useStorage } from './context/StorageContext.jsx';
import { CATEGORIAS } from './utils/categorias.js';
import Actividad7DiasChart from './components/charts/Actividad7DiasChart.jsx';
import DistribucionCategoriaPie from './components/charts/DistribucionCategoriaPie.jsx';
import DuracionPorEstadoChart from './components/charts/DuracionPorEstadoChart.jsx';
import { useRacha } from './hooks/useRacha.js';
import EjerciciosDB from './components/EjerciciosDB.jsx';

// ── Vistas ────────────────────────────────────────────────────────────
function VistaDashboard({ sesiones, onNuevaSesion }) {
  const activas = useMemo(() => sesiones.filter((s) => s.activo), [sesiones]);
  const { rachaActual, mejorRacha } = useRacha(activas);

  const stats = useMemo(() => {
    const completadas = activas.filter((s) => s.estado === 'completada');

    const volumenTotal = completadas.reduce((acc, s) => {
      const ejercicios = s.atributos?.ejercicios ?? [];
      return (
        acc +
        ejercicios.reduce((a, e) => a + (e.series ?? 1) * (e.reps ?? 1) * (e.pesoKg ?? 0), 0)
      );
    }, 0);

    const durTotal = activas.reduce((acc, s) => acc + (s.atributos?.duracionMinutos ?? 0), 0);

    return {
      activasCount: activas.length,
      completadasCount: completadas.length,
      volumenTotal,
      durTotal
    };
  }, [activas]);

  const h = Math.floor(stats.durTotal / 60);
  const m = stats.durTotal % 60;

  return (
    <>
      <div className="content">
        {/* Métricas */}
        <div className="card">
          <p className="card-label">Sesiones activas</p>
          <p className="card-value">{stats.activasCount}</p>
          <p className="card-subtext">{stats.completadasCount} completadas</p>
        </div>
        <div className="card">
          <p className="card-label">Volumen total</p>
          <p className="card-value">
            {stats.volumenTotal >= 1000
              ? (Math.round(stats.volumenTotal / 100) / 10).toFixed(1) + ' t'
              : stats.volumenTotal + ' kg·rep'}
          </p>
          <p className="card-subtext">kg × series × reps</p>
        </div>
        <div className="card">
          <p className="card-label">Tiempo activo</p>
          <p className="card-value">{h}h {m}m</p>
          <p className="card-subtext">total acumulado</p>
        </div>

        {/* Columna izquierda: racha + categorías, para llenar el espacio */}
        <div className="dash-left">
          <div className="card">
            <p className="card-label">Racha</p>
            <p className="card-value">{rachaActual} d</p>
            <p className="card-subtext">mejor: {mejorRacha} d</p>
          </div>

          <div className="card">
            <div className="card-head">
              <h3>
                <i
                  className="ti ti-chart-pie"
                  aria-hidden="true"
                  style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
                />
                Categorías
              </h3>
            </div>
            <DistribucionCategoriaPie sesiones={activas} />
          </div>
        </div>

        {/* Gráficas (Recharts) */}
        <div className="card col-span-2">
          <div className="card-head">
            <h3>
              <i
                className="ti ti-activity"
                aria-hidden="true"
                style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
              />
              Actividad (7 días)
            </h3>
          </div>
          <Actividad7DiasChart sesiones={activas} />
        </div>

        <div className="card col-span-3">
          <div className="card-head">
            <h3>
              <i
                className="ti ti-clock"
                aria-hidden="true"
                style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
              />
              Duración por estado
            </h3>
          </div>
          <DuracionPorEstadoChart sesiones={activas} />
        </div>

        {/* Sesiones recientes */}
        <div className="card col-span-2">
          <div className="card-head">
            <h3>
              <i className="ti ti-calendar-stats" aria-hidden="true"
                style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }} />
              Sesiones recientes
            </h3>
          </div>
          {activas.slice(0, 5).length ? (
            <div>
              {activas.slice(0, 5).map((s) => (
                <div key={s.id} className="session-row">
                  <div className={`cat-dot cat-dot-${s.categoriaId}`} aria-hidden="true" />
                  <span className="session-name">{s.nombre}</span>
                  <span className={`badge badge-${s.categoriaId}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                    {s.categoriaId}
                  </span>
                  <span className="session-dur">
                    {s.atributos?.duracionMinutos ?? '—'} min
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay sesiones aún.</p>
            </div>
          )}
        </div>

        {/* Quick add */}
        <div className="card">
          <div className="card-head">
            <h3>Nueva sesión rápida</h3>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={onNuevaSesion}
          >
            <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 15 }} />
            Registrar sesión
          </button>
          <p className="card-subtext mt-2" style={{ fontSize: 11 }}>
            O andá a "Bitácora" para ver y editar todas.
          </p>
        </div>
      </div>
    </>
  );
}

function VistaBitacora({
  sesiones,
  filtros,
  onCambiarFiltros,
  onLimpiarFiltros,
  onEditar,
  onArchivar,
  onMarcarCompletada
}) {
  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-head">
          <h3>
            <i className="ti ti-filter" aria-hidden="true" style={{ fontSize: 14, marginRight: 6 }} />
            Filtros
          </h3>
          <button type="button" className="btn btn-sm" onClick={onLimpiarFiltros}>
            Limpiar
          </button>
        </div>

        <div className="form-grid" style={{ padding: '0 18px 16px' }}>
          <div className="form-field full">
            <label>Búsqueda</label>
            <input
              value={filtros.busqueda}
              onChange={(e) => onCambiarFiltros({ busqueda: e.target.value })}
              placeholder="Buscar por nombre..."
            />
          </div>

          <div className="form-field">
            <label>Categoría</label>
            <select
              value={filtros.filtroCategoria}
              onChange={(e) => onCambiarFiltros({ filtroCategoria: e.target.value })}
            >
              <option value="todas">todas</option>
              {CATEGORIAS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Estado</label>
            <select
              value={filtros.filtroEstado}
              onChange={(e) => onCambiarFiltros({ filtroEstado: e.target.value })}
            >
              <option value="todos">todos</option>
              <option value="pendiente">pendiente</option>
              <option value="pausada">pausada</option>
              <option value="completada">completada</option>
            </select>
          </div>
        </div>
      </div>

      <ListaSesiones
        sesiones={sesiones.filter((s) => s.activo)}
        onEditar={onEditar}
        onArchivar={onArchivar}
        onMarcarCompletada={onMarcarCompletada}
      />
    </div>
  );
}

function VistaRecords({ sesiones }) {
  const [busquedaPr, setBusquedaPr] = useState('');

  const prs = useMemo(() => {
    const mapa = new Map();

    for (const s of sesiones || []) {
      if (!s?.activo) continue;
      const ejercicios = s?.atributos?.ejercicios ?? [];
      if (!Array.isArray(ejercicios)) continue;

      for (const ej of ejercicios) {
        const nombre = String(ej?.nombre || '').trim();
        if (!nombre) continue;

        const peso = Number(ej?.pesoKg ?? 0);
        const reps = Number(ej?.reps ?? 0);
        const series = Number(ej?.series ?? 0);
        const volumen = Math.max(0, peso) * Math.max(0, reps || 1) * Math.max(0, series || 1);

        const actual = mapa.get(nombre);
        if (!actual || peso > actual.peso || (peso === actual.peso && reps > actual.reps)) {
          mapa.set(nombre, { nombre, peso, reps, series, volumen });
        }
      }
    }

    return Array.from(mapa.values()).sort((a, b) => b.peso - a.peso);
  }, [sesiones]);

  const prsFiltrados = useMemo(() => {
    const texto = busquedaPr.trim().toLowerCase();
    if (!texto) return prs.slice(0, 30);
    return prs.filter((p) => String(p.nombre || '').toLowerCase().includes(texto)).slice(0, 30);
  }, [prs, busquedaPr]);

  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div className="card">
        <div className="card-head">
          <h3>
            <i
              className="ti ti-trophy"
              aria-hidden="true"
              style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
            />
            Tus PRs (simple)
          </h3>
        </div>

        {!prs.length ? (
          <div className="empty-state" style={{ padding: '18px 0' }}>
            <i className="ti ti-mood-empty" aria-hidden="true" />
            <p>
              Todavía no hay PRs.
              <br />
              Agregá ejercicios con `pesoKg`, `series` y `reps` en una sesión.
            </p>
          </div>
        ) : (
          <>
            <div className="pr-search">
              <label className="input-label" htmlFor="buscar-pr">
                Buscar ejercicio
              </label>
              <input
                id="buscar-pr"
                className="input"
                value={busquedaPr}
                onChange={(e) => setBusquedaPr(e.target.value)}
                placeholder="Ej: bench, squat, pull..."
                autoComplete="off"
              />
            </div>

            <div className="pr-grid" role="list">
              {prsFiltrados.map((p) => (
              <div key={p.nombre} className="pr-row">
                <div style={{ minWidth: 0 }}>
                  <p className="pr-name" title={p.nombre}>
                    {p.nombre}
                  </p>
                  <p className="pr-sub">
                    {p.series}x{p.reps} • volumen {Math.round(p.volumen)} kg·rep
                  </p>
                </div>
                <div className="pr-pill">{p.peso} kg</div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
}

function VistaProgreso({ sesiones }) {
  const resumen = useMemo(() => {
    const lista = (sesiones || []).filter((s) => s?.activo);

    let completadas = 0;
    let pendientes = 0;
    let pausadas = 0;
    let duracionTotal = 0;

    for (const s of lista) {
      if (s.estado === 'completada') completadas++;
      if (s.estado === 'pendiente') pendientes++;
      if (s.estado === 'pausada') pausadas++;
      duracionTotal += Number(s?.atributos?.duracionMinutos ?? 0);
    }

    return { completadas, pendientes, pausadas, duracionTotal };
  }, [sesiones]);

  const h = Math.floor(resumen.duracionTotal / 60);
  const m = resumen.duracionTotal % 60;

  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div className="content" style={{ padding: 0 }}>
        <div className="card">
          <p className="card-label">Completadas</p>
          <p className="card-value">{resumen.completadas}</p>
          <p className="card-subtext">sesiones</p>
        </div>
        <div className="card">
          <p className="card-label">Pendientes</p>
          <p className="card-value">{resumen.pendientes}</p>
          <p className="card-subtext">sesiones</p>
        </div>
        <div className="card">
          <p className="card-label">Pausadas</p>
          <p className="card-value">{resumen.pausadas}</p>
          <p className="card-subtext">sesiones</p>
        </div>

        <div className="card col-span-3">
          <div className="card-head">
            <h3>
              <i
                className="ti ti-clock"
                aria-hidden="true"
                style={{ fontSize: 15, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
              />
              Tiempo acumulado
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {h}h {m}m
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            (Suma de duraciónMinutos de todas tus sesiones activas)
          </p>
        </div>
      </div>
    </div>
  );
}

// ── App raíz ──────────────────────────────────────────────────────────
export default function App() {
  const {
    items: sesiones,
    cargando,
    error,
    modo,
    alternarModo,
    labelModo,
    labelAlternarModo,
    guardarItem,
    actualizarItem,
    cambiarEstado,
    registrarActividad,
    filtroCategoria,
    filtroEstado,
    busqueda,
    setFiltros,
    limpiarFiltros,
  } = useStorage();

  const [vista, setVista] = useState('dashboard');
  const [sesionEditando, setSesionEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ejercicioParaAgregar, setEjercicioParaAgregar] = useState(null);

  const TITULO = {
    dashboard: 'Dashboard',
    bitacora:  'Bitácora de sesiones',
    records:   'Personal Records (PRs)',
    progreso:  'Progreso',
    ejercicios:'Ejercicios DB',
  };

  const guardarSesion = useCallback(
    async (nueva) => {
      await guardarItem(nueva);
      setMostrarFormulario(false);
    },
    [guardarItem]
  );

  const actualizarSesion = useCallback(
    async (actualizada) => {
      await actualizarItem(actualizada);
      setSesionEditando(null);
      setMostrarFormulario(false);
    },
    [actualizarItem]
  );

  const archivarSesion = useCallback(
    async (id) => {
      const s = sesiones.find((x) => x.id === id);
      if (!s) return;
      if (sesionEditando?.id === id) setSesionEditando(null);
      await actualizarItem({ ...s, activo: false });
    },
    [sesiones, sesionEditando?.id, actualizarItem]
  );

  const marcarCompletada = useCallback(
    async (id) => {
      const ok = await cambiarEstado(id, 'completada');
      if (!ok) return;

      await registrarActividad(id, {
        fecha: new Date().toISOString(),
        nota: 'Marcada como completada desde la tarjeta'
      });
    },
    [cambiarEstado, registrarActividad]
  );

  const iniciarEdicion = useCallback((sesion) => {
    setSesionEditando(sesion);
    setMostrarFormulario(true);
  }, []);

  const cancelarEdicion = useCallback(() => {
    setSesionEditando(null);
    setMostrarFormulario(false);
  }, []);

  const irANuevaSesion = useCallback(() => {
    setSesionEditando(null);
    setMostrarFormulario(true);
    setVista('bitacora');
  }, []);

  const usarEjercicioDeDB = useCallback((ej) => {
    setEjercicioParaAgregar(ej);
    setSesionEditando(null);
    setMostrarFormulario(true);
    setVista('bitacora');
  }, []);

  const filtros = useMemo(
    () => ({ filtroCategoria, filtroEstado, busqueda }),
    [filtroCategoria, filtroEstado, busqueda]
  );

  const listaFiltrada = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return (sesiones || []).filter((s) => {
      if (!s.activo) return false;
      if (filtroCategoria !== 'todas' && s.categoriaId !== filtroCategoria) return false;
      if (filtroEstado !== 'todos' && s.estado !== filtroEstado) return false;
      if (!texto) return true;
      return String(s.nombre || '').toLowerCase().includes(texto);
    });
  }, [sesiones, filtroCategoria, filtroEstado, busqueda]);

  const onCambiarFiltros = useCallback((patch) => setFiltros(patch), [setFiltros]);

  return (
    <div className="app">
      <Sidebar vistaActiva={vista} onCambiarVista={setVista} />

      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <p className="topbar-title">{TITULO[vista]}</p>
            <p className="topbar-subtitle">
              {cargando && 'Cargando…'}
              {!cargando && error && <span className="error-msg">{error}</span>}
              {!cargando && !error && `Modo: ${labelModo}`}
            </p>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="btn"
              onClick={alternarModo}
            >
              <i className="ti ti-refresh" aria-hidden="true" style={{ fontSize: 14 }} />
              {labelAlternarModo}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={irANuevaSesion}
            >
              <i className="ti ti-plus" aria-hidden="true" style={{ fontSize: 14 }} />
              Nueva sesión
            </button>
          </div>
        </div>

        {/* Formulario inline (cuando corresponde) */}
        {mostrarFormulario && (
          <div style={{ padding: '14px 24px 0' }}>
            <div className="card">
              <div className="card-head">
                <h3>
                  <i
                    className="ti ti-edit"
                    aria-hidden="true"
                    style={{ fontSize: 14, color: 'var(--accent)', verticalAlign: '-2px', marginRight: 5 }}
                  />
                  {sesionEditando ? 'Editar sesión' : 'Nueva sesión'}
                </h3>
                <button type="button" className="btn btn-sm" onClick={cancelarEdicion}>
                  <i className="ti ti-x" aria-hidden="true" style={{ fontSize: 13 }} />
                  Cerrar
                </button>
              </div>
              <FormularioSesion
                onGuardar={guardarSesion}
                sesionEditando={sesionEditando}
                onActualizar={actualizarSesion}
                onCancelarEdicion={cancelarEdicion}
                ejercicioParaAgregar={ejercicioParaAgregar}
                onEjercicioAgregado={() => setEjercicioParaAgregar(null)}
              />
            </div>
          </div>
        )}

        {/* Vistas */}
        {vista === 'dashboard' && (
          <VistaDashboard
            sesiones={listaFiltrada}
            onNuevaSesion={irANuevaSesion}
          />
        )}
        {vista === 'bitacora' && (
          <VistaBitacora
            sesiones={listaFiltrada}
            filtros={filtros}
            onCambiarFiltros={onCambiarFiltros}
            onLimpiarFiltros={limpiarFiltros}
            onEditar={iniciarEdicion}
            onArchivar={archivarSesion}
            onMarcarCompletada={marcarCompletada}
          />
        )}
        {vista === 'records'  && <VistaRecords  sesiones={sesiones} />}
        {vista === 'progreso' && <VistaProgreso sesiones={sesiones} />}
        {vista === 'ejercicios' && <EjerciciosDB onUsarEjercicio={usarEjercicioDeDB} />}
      </div>
    </div>
  );
}
