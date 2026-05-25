import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import FormularioSesion from './components/FormularioSesion.jsx';
import ListaSesiones from './components/ListaSesiones.jsx';
import PRChart from './components/PRChart.jsx';
import { useStorage } from './context/StorageContext.jsx';

// ── Vistas ────────────────────────────────────────────────────────────
function VistaDashboard({ sesiones, onNuevaSesion }) {
  const activas = sesiones.filter((s) => s.activo);
  const completadas = activas.filter((s) => s.estado === 'completada');

  const volumenTotal = completadas.reduce((acc, s) => {
    const ejercicios = s.atributos?.ejercicios ?? [];
    return acc + ejercicios.reduce((a, e) => a + (e.series ?? 1) * (e.reps ?? 1) * (e.pesoKg ?? 0), 0);
  }, 0);

  const durTotal = activas.reduce((acc, s) => acc + (s.atributos?.duracionMinutos ?? 0), 0);
  const h = Math.floor(durTotal / 60);
  const m = durTotal % 60;

  return (
    <>
      <div className="content">
        {/* Métricas */}
        <div className="card">
          <p className="card-label">Sesiones activas</p>
          <p className="card-value">{activas.length}</p>
          <p className="card-subtext">{completadas.length} completadas</p>
        </div>
        <div className="card">
          <p className="card-label">Volumen total</p>
          <p className="card-value">
            {volumenTotal >= 1000
              ? (Math.round(volumenTotal / 100) / 10).toFixed(1) + ' t'
              : volumenTotal + ' kg·rep'}
          </p>
          <p className="card-subtext">kg × series × reps</p>
        </div>
        <div className="card">
          <p className="card-label">Tiempo activo</p>
          <p className="card-value">{h}h {m}m</p>
          <p className="card-subtext">total acumulado</p>
        </div>

        {/* Gráfica de PRs */}
        <div className="card col-span-3">
          <PRChart sesiones={sesiones} />
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

function VistaBitacora({ sesiones, onEditar, onArchivar }) {
  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <ListaSesiones
        sesiones={sesiones.filter((s) => s.activo)}
        onEditar={onEditar}
        onArchivar={onArchivar}
      />
    </div>
  );
}

function VistaRecords({ sesiones }) {
  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div className="card">
        <PRChart sesiones={sesiones} />
      </div>
    </div>
  );
}

function VistaProgreso({ sesiones }) {
  return (
    <div style={{ padding: '18px 24px 28px' }}>
      <div className="card">
        <PRChart sesiones={sesiones} />
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
    setModo,
    guardarItem,
    actualizarItem,
  } = useStorage();

  const [vista, setVista] = useState('dashboard');
  const [sesionEditando, setSesionEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const TITULO = {
    dashboard: 'Dashboard',
    bitacora:  'Bitácora de sesiones',
    records:   'Personal Records (PRs)',
    progreso:  'Progreso',
  };

  async function guardarSesion(nueva) {
    await guardarItem(nueva);
    setMostrarFormulario(false);
  }

  async function actualizarSesion(actualizada) {
    await actualizarItem(actualizada);
    setSesionEditando(null);
    setMostrarFormulario(false);
  }

  async function archivarSesion(id) {
    const s = sesiones.find((x) => x.id === id);
    if (!s) return;
    if (sesionEditando?.id === id) setSesionEditando(null);
    await actualizarItem({ ...s, activo: false });
  }

  function iniciarEdicion(sesion) {
    setSesionEditando(sesion);
    setMostrarFormulario(true);
  }

  function cancelarEdicion() {
    setSesionEditando(null);
    setMostrarFormulario(false);
  }

  function irANuevaSesion() {
    setSesionEditando(null);
    setMostrarFormulario(true);
    setVista('bitacora');
  }

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
              {!cargando && !error && `Modo: ${modo}`}
            </p>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setModo(modo === 'api' ? 'local' : 'api')}
            >
              <i className="ti ti-refresh" aria-hidden="true" style={{ fontSize: 14 }} />
              {modo === 'api' ? 'Cambiar a Local' : 'Cambiar a API'}
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
              />
            </div>
          </div>
        )}

        {/* Vistas */}
        {vista === 'dashboard' && (
          <VistaDashboard
            sesiones={sesiones}
            onNuevaSesion={irANuevaSesion}
          />
        )}
        {vista === 'bitacora' && (
          <VistaBitacora
            sesiones={sesiones}
            onEditar={iniciarEdicion}
            onArchivar={archivarSesion}
          />
        )}
        {vista === 'records'  && <VistaRecords  sesiones={sesiones} />}
        {vista === 'progreso' && <VistaProgreso sesiones={sesiones} />}
      </div>
    </div>
  );
}