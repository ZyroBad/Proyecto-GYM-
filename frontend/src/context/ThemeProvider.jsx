import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.jsx';
import { useAtajoTeclado } from '../hooks/useAtajoTeclado.js';

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

  useAtajoTeclado(
    (e) => e.key.toLowerCase() === 't',
    () => alternarTema(),
    { ignoreInputs: true }
  );

  const value = useMemo(() => ({ tema, setTema, alternarTema }), [tema]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
