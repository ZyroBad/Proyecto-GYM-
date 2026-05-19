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

  function apiBaseUrl() {
    return import.meta.env.VITE_API_URL || 'http://localhost:4000';
  }

  async function apiJson(ruta, opciones) {
    const resp = await fetch(apiBaseUrl() + ruta, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...opciones
    });

    if (!resp.ok) {
      throw new Error('HTTP ' + resp.status);
    }

    return resp.json();
  }

  async function cargarDesdeBackend() {
    setCargandoBackend(true);
    setErrorBackend('');

    try {
      const items = await apiJson('/api/items');

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

  async function guardarSesion(nuevaSesion) {
    // optimista: la muestro de una
    setSesiones((prev) => [nuevaSesion, ...prev]);
    setErrorBackend('');

    try {
      await apiJson('/api/items', {
        method: 'POST',
        body: JSON.stringify(nuevaSesion)
      });
    } catch (err) {
      console.log('No se pudo guardar en backend:', err);
      setErrorBackend('No se pudo guardar en backend (quedó en local).');
    }
  }

  function iniciarEdicion(sesion) {
    setSesionEditando(sesion);
  }

  function cancelarEdicion() {
    setSesionEditando(null);
  }

  async function actualizarSesion(sesionActualizada) {
    setSesiones((prev) =>
      prev.map((s) => (s.id === sesionActualizada.id ? sesionActualizada : s))
    );
    setSesionEditando(null);
    setErrorBackend('');

    try {
      await apiJson('/api/items/' + sesionActualizada.id, {
        method: 'PUT',
        body: JSON.stringify(sesionActualizada)
      });
    } catch (err) {
      console.log('No se pudo actualizar en backend:', err);
      setErrorBackend('No se pudo actualizar en backend (quedó en local).');
    }
  }

  async function archivarSesion(id) {
    let sesionAEnviar = null;

    setSesiones((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const archivada = { ...s, activo: false };
        sesionAEnviar = archivada;
        return archivada;
      })
    );

    // si justo estaba editando esa sesión, mejor salir
    if (sesionEditando?.id === id) setSesionEditando(null);

    setErrorBackend('');

    // archivar = update (activo=false). DELETE lo dejamos para "borrar definitivo" después si querés.
    try {
      if (sesionAEnviar) {
        await apiJson('/api/items/' + id, {
          method: 'PUT',
          body: JSON.stringify(sesionAEnviar)
        });
      }
    } catch (err) {
      console.log('No se pudo archivar en backend:', err);
      setErrorBackend('No se pudo archivar en backend (quedó en local).');
    }
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
