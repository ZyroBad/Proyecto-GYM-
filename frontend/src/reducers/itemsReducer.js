const ESTADO_INICIAL = {
  lista: [],
  filtroCategoria: 'todas',
  filtroEstado: 'todos',
  busqueda: ''
};

export const initialState = ESTADO_INICIAL;

// Reducer puro: nada de fetch, Date.now, ni mutaciones del estado anterior.
export function itemsReducer(state, action) {
  switch (action.type) {
    case 'HIDRATAR': {
      const lista = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, lista };
    }

    case 'AGREGAR': {
      const item = action.payload;
      if (!item || !item.id) return state;
      const yaExiste = state.lista.some((it) => it.id === item.id);
      if (!yaExiste) return { ...state, lista: [item, ...state.lista] };
      return { ...state, lista: state.lista.map((it) => (it.id === item.id ? item : it)) };
    }

    case 'ELIMINAR': {
      const id = action.payload;
      if (!id) return state;
      return {
        ...state,
        lista: state.lista.map((it) => (it.id === id ? { ...it, activo: false } : it))
      };
    }

    case 'CAMBIAR_ESTADO': {
      const { id, estado } = action.payload || {};
      if (!id || !estado) return state;
      return {
        ...state,
        lista: state.lista.map((it) => (it.id === id ? { ...it, estado } : it))
      };
    }

    case 'FILTRAR': {
      const next = action.payload || {};
      return {
        ...state,
        filtroCategoria: next.filtroCategoria ?? state.filtroCategoria,
        filtroEstado: next.filtroEstado ?? state.filtroEstado,
        busqueda: next.busqueda ?? state.busqueda
      };
    }

    case 'LIMPIAR_FILTROS': {
      return {
        ...state,
        filtroCategoria: ESTADO_INICIAL.filtroCategoria,
        filtroEstado: ESTADO_INICIAL.filtroEstado,
        busqueda: ESTADO_INICIAL.busqueda
      };
    }

    case 'REGISTRAR_ACTIVIDAD': {
      const { id, registro } = action.payload || {};
      if (!id || !registro) return state;

      return {
        ...state,
        lista: state.lista.map((it) => {
          if (it.id !== id) return it;
          const historialPrevio = Array.isArray(it.historial) ? it.historial : [];
          return { ...it, historial: [registro, ...historialPrevio] };
        })
      };
    }

    default:
      return state;
  }
}
