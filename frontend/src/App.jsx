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

  useEffect(() => {
    localStorage.setItem('sesionesGym', JSON.stringify(sesiones));
  }, [sesiones]);

  function guardarSesion(nuevaSesion) {
    setSesiones((prev) => [nuevaSesion, ...prev]);
  }

  function archivarSesion(id) {
    setSesiones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, activo: false } : s))
    );
  }

  return (
    <div className="app">
      <header className="encabezado">
        <h1>Mi Colección Personal</h1>
        <p className="sub">Bitácora de sesiones (fase 1, simple).</p>
      </header>

      <main className="contenido">
        <div className="bloque">
          <h2>Nueva sesión</h2>
          <FormularioSesion onGuardar={guardarSesion} />
        </div>

        <div className="bloque" style={{ marginTop: 14 }}>
          <h2>Sesiones</h2>
          <ListaSesiones sesiones={sesiones} onArchivar={archivarSesion} />
        </div>
      </main>
    </div>
  );
}
