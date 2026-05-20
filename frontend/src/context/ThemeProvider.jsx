import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.jsx';

const KEY_TEMA = 'tema';

function aplicarTemaAlBody(tema) {
  document.body.setAttribute('data-theme', tema);
}

export function ThemeProvider({ children }) {
  const [tema, setTemaState] = useState(() => localStorage.getItem(KEY_TEMA) || 'oscuro');

  const setTema = (nuevoTema) => {
    setTemaState(nuevoTema);
    localStorage.setItem(KEY_TEMA, nuevoTema);
  };

  const alternarTema = () => {
    setTema(tema === 'oscuro' ? 'claro' : 'oscuro');
  };

  useEffect(() => {
    aplicarTemaAlBody(tema);
  }, [tema]);

  useEffect(() => {
    function onKeyDown(e) {
      // Atajo fase 2: T cambia tema
      if (e.key.toLowerCase() === 't') {
        // si está escribiendo en un input, no molesto
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        alternarTema();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tema]);

  const value = useMemo(() => ({ tema, setTema, alternarTema }), [tema]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

