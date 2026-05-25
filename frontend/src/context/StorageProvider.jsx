import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StorageContext } from './StorageContext.jsx';

function leerLocal() {
  try {
    // venimos de fase 1 con esta key
    const guardadas = localStorage.getItem('sesionesGym');
    return guardadas ? JSON.parse(guardadas) : [];
  } catch {
    return [];
  }
}

function guardarLocal(items) {
  try {
    localStorage.setItem('sesionesGym', JSON.stringify(items));
  } catch {
    // si falla, ni modo (modo estudiante)
  }
}

export function StorageProvider({ children }) {
  const [modo, setModoState] = useState(() => localStorage.getItem('modo') || 'local');
  const [items, setItems] = useState(() => leerLocal());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const LABELS_MODO = {
    api: { modo: 'API', alternar: 'Cambiar a Local' },
    local: { modo: 'LocalStorage', alternar: 'Cambiar a API' }
  };

  const setModo = (nuevoModo) => {
    setModoState(nuevoModo);
    localStorage.setItem('modo', nuevoModo);
  };

  const alternarModo = () => setModo(modo === 'api' ? 'local' : 'api');
  const labelModo = (LABELS_MODO[modo] || LABELS_MODO.local).modo;
  const labelAlternarModo = (LABELS_MODO[modo] || LABELS_MODO.local).alternar;

  const obtenerItems = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      if (modo === 'api') {
        const res = await fetch(`${API_URL}/api/items`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(data);
        return data;
      } else {
        const data = leerLocal();
        setItems(data);
        return data;
      }
    } catch (err) {
      console.log('Error en obtenerItems:', err);
      setError(err.message || 'Error cargando items');
      return [];
    } finally {
      setCargando(false);
    }
  }, [API_URL, modo]);

  const guardarItem = useCallback(
    async (item) => {
      setError(null);

      // optimista: siempre lo meto al estado para que la UI se sienta rápida
      setItems((prev) => {
        const yaExiste = prev.some((x) => x.id === item.id);
        if (yaExiste) return prev.map((x) => (x.id === item.id ? item : x));
        return [item, ...prev];
      });

      try {
        if (modo === 'api') {
          const res = await fetch(`${API_URL}/api/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } else {
          // en local, solo guardo la lista completa
          // (lo dejo en un useEffect abajo)
          return item;
        }
      } catch (err) {
        console.log('Error en guardarItem:', err);
        setError(err.message || 'Error guardando item');
        return null;
      }
    },
    [API_URL, modo]
  );

  const actualizarItem = useCallback(
    async (item) => {
      setError(null);
      setItems((prev) => prev.map((x) => (x.id === item.id ? item : x)));

      try {
        if (modo === 'api') {
          const res = await fetch(`${API_URL}/api/items/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } else {
          return item;
        }
      } catch (err) {
        console.log('Error en actualizarItem:', err);
        setError(err.message || 'Error actualizando item');
        return null;
      }
    },
    [API_URL, modo]
  );

  const eliminarItem = useCallback(
    async (id) => {
      setError(null);
      setItems((prev) => prev.filter((x) => x.id !== id));

      try {
        if (modo === 'api') {
          const res = await fetch(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return true;
        } else {
          return true;
        }
      } catch (err) {
        console.log('Error en eliminarItem:', err);
        setError(err.message || 'Error eliminando item');
        return false;
      }
    },
    [API_URL, modo]
  );

  // cuando estoy en local, sincronizo a localStorage
  useEffect(() => {
    if (modo !== 'local') return;
    guardarLocal(items);
  }, [items, modo]);

  // cada vez que cambio modo, recargo
  useEffect(() => {
    obtenerItems();
  }, [modo, obtenerItems]);

  // useRef (fase 2): guardar el id del setInterval sin provocar re-render.
  // Solo lo uso cuando estoy en modo API para refrescar datos de vez en cuando.
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (modo !== 'api') return;

    intervalRef.current = setInterval(() => {
      obtenerItems();
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [modo, obtenerItems]);

  const value = useMemo(
    () => ({
      modo,
      setModo,
      alternarModo,
      labelModo,
      labelAlternarModo,
      items,
      cargando,
      error,
      obtenerItems,
      guardarItem,
      actualizarItem,
      eliminarItem
    }),
    [
      modo,
      items,
      cargando,
      error,
      obtenerItems,
      guardarItem,
      actualizarItem,
      eliminarItem,
      labelModo,
      labelAlternarModo
    ]
  );

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}
