import { useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './ThemeContext.jsx';
import { useAtajoTeclado } from '../hooks/useAtajoTeclado.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

function aplicarTemaAlBody(tema) {
  document.body.setAttribute('data-theme', tema);
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useLocalStorage('tema', 'oscuro');

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
