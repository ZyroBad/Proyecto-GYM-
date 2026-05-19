import { useEffect, useState } from 'react';
import FormularioSesion from './components/FormularioSesion.jsx';
import ListaSesiones from './components/ListaSesiones.jsx';

export default function App() {
  const [sesiones, setSesiones] = useState(() => {
    try {
      const guardadas = localStorage.getItem('sesionesGym');
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });
  const [sesionEditando, setSesionEditando] = useState(null);
  const [cargandoBackend, setCargandoBackend] = useState(false);
  const [errorBackend, setErrorBackend] = useState('');

  useEffect(() => {
    localStorage.setItem('sesionesGym', JSON.stringify(sesiones));
  }, [sesiones]);

  async function cargarDesdeBackend() {
    setCargandoBackend(true);
    setErrorBackend('');

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const resp = await fetch(baseUrl + '/api/items');

      if (!resp.ok) {
        throw new Error('HTTP ' + resp.status);
      }

      const items = await resp.json();

      // modo "híbrido" por ahora: lo de backend gana si hay mismo id
      setSesiones((prev) => {
        const porId = new Map();
        for (const s of prev) porId.set(s.id, s);
        for (const s of items) porId.set(s.id, s);
        return Array.from(porId.values());
      });
    } catch (err) {
      console.log('Error cargando del backend:', err);
      setErrorBackend('No pude cargar del backend (revisá que esté prendido).');
    } finally {
      setCargandoBackend(false);
    }
  }

  function guardarSesion(nuevaSesion) {
    setSesiones((prev) => [nuevaSesion, ...prev]);
  }

  function iniciarEdicion(sesion) {
    setSesionEditando(sesion);
  }

  function cancelarEdicion() {
    setSesionEditando(null);
  }

  function actualizarSesion(sesionActualizada) {
    setSesiones((prev) =>
      prev.map((s) => (s.id === sesionActualizada.id ? sesionActualizada : s))
    );
    setSesionEditando(null);
  }

  function archivarSesion(id) {
    setSesiones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: false } : s))
    );

    // si justo estaba editando esa sesión, mejor salir
    if (sesionEditando?.id === id) setSesionEditando(null);
  }

  return (
    <div className="app">
      <header className="encabezado">
        <h1>Mi Colección Personal</h1>
        <p className="sub">Bitácora de sesiones (fase 1, simple).</p>
      </header>

      <main className="contenido">
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
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <button type="button" onClick={cargarDesdeBackend} disabled={cargandoBackend}>
              {cargandoBackend ? 'Cargando...' : 'Cargar del backend'}
            </button>
            {errorBackend ? <span style={{ color: '#ffb4b4' }}>{errorBackend}</span> : null}
          </div>
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
