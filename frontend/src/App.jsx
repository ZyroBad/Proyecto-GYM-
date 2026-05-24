import { useEffect, useRef, useState } from 'react';
import FormularioSesion from './components/FormularioSesion.jsx';
import ListaSesiones from './components/ListaSesiones.jsx';
import { useStorage } from './context/StorageContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';

export default function App() {
  const {
    modo,
    setModo,
    items: sesiones,
    cargando,
    error,
    guardarItem,
    actualizarItem
  } = useStorage();
  const { tema, alternarTema } = useTheme();

  const [sesionEditando, setSesionEditando] = useState(null);
  const autoReloadRef = useRef(null);

  function iniciarEdicion(sesion) {
    setSesionEditando(sesion);
  }

  function cancelarEdicion() {
    setSesionEditando(null);
  }

  async function guardarSesion(nuevaSesion) {
    await guardarItem(nuevaSesion);
  }

  async function actualizarSesion(sesionActualizada) {
    await actualizarItem(sesionActualizada);
    setSesionEditando(null);
  }

  async function archivarSesion(id) {
    const sesion = sesiones.find((s) => s.id === id);
    if (!sesion) return;

    // si justo estaba editando esa sesión, mejor salir
    if (sesionEditando?.id === id) setSesionEditando(null);

    await actualizarItem({ ...sesion, activo: false });
  }

  // useRef #2: guardar id de intervalo (sin re-render)
  useEffect(() => {
    if (autoReloadRef.current) {
      clearInterval(autoReloadRef.current);
      autoReloadRef.current = null;
    }

    // solo auto-refresh si está en API (así se siente vivo)
    if (modo !== 'api') return;

    autoReloadRef.current = setInterval(() => {
      // no lo await para que no congele si tarda
      obtenerItems();
    }, 12000);

    return () => {
      if (autoReloadRef.current) clearInterval(autoReloadRef.current);
      autoReloadRef.current = null;
    };
  }, [modo, obtenerItems]);

  return (
    <div className="app">
      <header className="encabezado">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>TitanFit</h1>
            <p className="sub" style={{ marginTop: 8 }}>
              Bitácora de sesiones (fase 2: tema + contextos).
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <button type="button" onClick={alternarTema} title="Atajo: T">
              Tema: {tema}
            </button>
          </div>
        </div>
      </header>

      <main className="contenido">
        <div className="bloque" style={{ marginBottom: 14 }}>
          <h2>Modo</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={() => setModo(modo === 'api' ? 'local' : 'api')}>
              Cambiar a {modo === 'api' ? 'LocalStorage' : 'API'}
            </button>
            <span style={{ color: 'var(--text-muted)' }}>Actual: {modo}</span>
            {cargando ? <span style={{ color: 'var(--text-muted)' }}>cargando...</span> : null}
            {error ? <span style={{ color: '#b00020' }}>{error}</span> : null}
          </div>
        </div>

        <div className="bloque">
          <h2>{sesionEditando ? 'Editar sesión' : 'Nueva sesión'}</h2>
          <FormularioSesion
            onGuardar={guardarSesion}
            sesionEditando={sesionEditando}
            onActualizar={actualizarSesion}
            onCancelarEdicion={cancelarEdicion}
          />
        </div>

        <div className="bloque" style={{ marginTop: 14 }}>
          <h2>Sesiones</h2>
          <ListaSesiones sesiones={sesiones} onArchivar={archivarSesion} onEditar={iniciarEdicion} />
        </div>
      </main>
    </div>
  );
}
