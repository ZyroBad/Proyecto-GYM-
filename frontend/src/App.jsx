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

  useEffect(() => {
    localStorage.setItem('sesionesGym', JSON.stringify(sesiones));
  }, [sesiones]);

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
