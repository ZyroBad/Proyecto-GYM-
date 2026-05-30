import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { StorageContext } from './StorageContext.jsx';
import { initialState, itemsReducer } from '../reducers/itemsReducer.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

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
  const [modo, setModo] = useLocalStorage('modo', 'local');
  const [state, dispatch] = useReducer(itemsReducer, {
    ...initialState,
    lista: leerLocal()
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const LABELS_MODO = {
    api: { modo: 'API', alternar: 'Cambiar a Local' },
    local: { modo: 'LocalStorage', alternar: 'Cambiar a API' }
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
        dispatch({ type: 'HIDRATAR', payload: data });
        return data;
      } else {
        const data = leerLocal();
        dispatch({ type: 'HIDRATAR', payload: data });
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

      // optimista: siempre lo meto al estado
      dispatch({ type: 'AGREGAR', payload: item });

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
      dispatch({ type: 'AGREGAR', payload: item });

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
      dispatch({ type: 'ELIMINAR', payload: id });

      try {
        if (modo === 'api') {
          // Fase 3: "eliminar" = archivar (activo=false)
          const item = state.lista.find((x) => x.id === id);
          if (!item) return false;
          const res = await fetch(`${API_URL}/api/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, activo: false })
          });
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
    [API_URL, modo, state.lista]
  );

  const registrarActividad = useCallback(
    async (id, registro) => {
      setError(null);
      dispatch({ type: 'REGISTRAR_ACTIVIDAD', payload: { id, registro } });

      try {
        if (modo === 'api') {
          const res = await fetch(`${API_URL}/api/items/${id}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        }
        return registro;
      } catch (err) {
        console.log('Error en registrarActividad:', err);
        setError(err.message || 'Error registrando actividad');
        return null;
      }
    },
    [API_URL, modo]
  );

  const cambiarEstado = useCallback(
    async (id, estado) => {
      if (!id || !estado) return false;

      setError(null);
      dispatch({ type: 'CAMBIAR_ESTADO', payload: { id, estado } });

      try {
        const item = state.lista.find((x) => x.id === id);
        if (!item) return false;

        const actualizado = { ...item, estado };

        if (modo === 'api') {
          const res = await fetch(`${API_URL}/api/items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(actualizado)
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }

        return true;
      } catch (err) {
        console.log('Error en cambiarEstado:', err);
        setError(err.message || 'Error cambiando estado');
        return false;
      }
    },
    [API_URL, modo, state.lista]
  );

  // cuando estoy en local, sincronizo a localStorage
  useEffect(() => {
    if (modo !== 'local') return;
    guardarLocal(state.lista);
  }, [state.lista, modo]);

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
      items: state.lista,
      filtroCategoria: state.filtroCategoria,
      filtroEstado: state.filtroEstado,
      busqueda: state.busqueda,
      cargando,
      error,
      obtenerItems,
      guardarItem,
      actualizarItem,
      eliminarItem,
      registrarActividad,
      setFiltros: (payload) => dispatch({ type: 'FILTRAR', payload }),
      limpiarFiltros: () => dispatch({ type: 'LIMPIAR_FILTROS' }),
      cambiarEstado
    }),
    [
      modo,
      cargando,
      error,
      obtenerItems,
      guardarItem,
      actualizarItem,
      eliminarItem,
      labelModo,
      labelAlternarModo,
      state.lista,
      state.filtroCategoria,
      state.filtroEstado,
      state.busqueda,
      registrarActividad,
      cambiarEstado
    ]
  );

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}
