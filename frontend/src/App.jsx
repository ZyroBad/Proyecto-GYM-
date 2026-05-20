import { useState } from 'react';
import FormularioSesion from './components/FormularioSesion.jsx';
import ListaSesiones from './components/ListaSesiones.jsx';
import { useStorage } from './context/StorageContext.jsx';

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

  const [sesionEditando, setSesionEditando] = useState(null);

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

  return (
    <div className="app">
      <header className="encabezado">
        <h1>Mi Colección Personal</h1>
        <p className="sub">Bitácora de sesiones (fase 1, simple).</p>
      </header>

      <main className="contenido">
        <div className="bloque" style={{ marginBottom: 14 }}>
          <h2>Modo</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button type="button" onClick={() => setModo(modo === 'api' ? 'local' : 'api')}>
              Cambiar a {modo === 'api' ? 'LocalStorage' : 'API'}
            </button>
            <span style={{ color: '#a8a8a8' }}>Actual: {modo}</span>
            {cargando ? <span style={{ color: '#a8a8a8' }}>cargando...</span> : null}
            {error ? <span style={{ color: '#ffb4b4' }}>{error}</span> : null}
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
          <ListaSesiones
            sesiones={sesiones}
            onArchivar={archivarSesion}
            onEditar={iniciarEdicion}
          />
        </div>
      </main>
    </div>
  );
}
