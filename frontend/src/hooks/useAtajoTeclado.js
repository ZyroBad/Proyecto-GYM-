import { useEffect } from 'react';

/**
 * useAtajoTeclado
 * Escucha keydown y ejecuta una acción cuando se cumple una condición.
 *
 * @param {(e: KeyboardEvent) => boolean} when - Retorna true si se debe disparar.
 * @param {(e: KeyboardEvent) => void} action - Acción a ejecutar.
 * @param {object} [options]
 * @param {boolean} [options.ignoreInputs=true] - Evita disparar si el foco está en input/textarea/select.
 */
export function useAtajoTeclado(when, action, options = {}) {
  const { ignoreInputs = true } = options;

  useEffect(() => {
    function onKeyDown(e) {
      if (ignoreInputs) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      }

      if (when(e)) action(e);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [when, action, ignoreInputs]);
}

