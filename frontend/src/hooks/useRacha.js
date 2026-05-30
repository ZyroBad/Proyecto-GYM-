import { useMemo } from 'react';

function toDiaKey(fechaIso) {
  if (!fechaIso) return null;
  try {
    // YYYY-MM-DD (para comparar dÃ­as sin hora)
    return new Date(fechaIso).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function sumarDias(diaKey, delta) {
  const d = new Date(`${diaKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function calcularRacha(diasKeysOrdenadosDesc) {
  if (!diasKeysOrdenadosDesc.length) return 0;

  let racha = 1;
  for (let i = 0; i < diasKeysOrdenadosDesc.length - 1; i++) {
    const actual = diasKeysOrdenadosDesc[i];
    const siguienteEsperado = sumarDias(actual, -1);
    const siguiente = diasKeysOrdenadosDesc[i + 1];
    if (siguiente === siguienteEsperado) racha++;
    else break;
  }
  return racha;
}

function calcularMejorRacha(diasKeysOrdenadosAsc) {
  if (!diasKeysOrdenadosAsc.length) return 0;

  let mejor = 1;
  let racha = 1;

  for (let i = 1; i < diasKeysOrdenadosAsc.length; i++) {
    const prev = diasKeysOrdenadosAsc[i - 1];
    const curr = diasKeysOrdenadosAsc[i];

    const esperado = sumarDias(prev, 1);
    if (curr === esperado) {
      racha++;
      if (racha > mejor) mejor = racha;
    } else {
      racha = 1;
    }
  }

  return mejor;
}

/**
 * useRacha
 * Calcula rachas por dÃ­a basadas en sesiones completadas.
 *
 * Regla simple:
 * - cuenta un dÃ­a si hay al menos 1 sesiÃ³n `completada` y `activo`
 * - usa `fechaActividad` (si no hay, cae a `fechaRegistro`)
 *
 * @param {Array<any>} sesiones
 * @returns {{ rachaActual: number, mejorRacha: number, ultimoDia: string|null, diasUnicos: string[] }}
 */
export function useRacha(sesiones) {
  return useMemo(() => {
    const lista = Array.isArray(sesiones) ? sesiones : [];

    const diasSet = new Set();
    for (const s of lista) {
      if (!s?.activo) continue;
      if (s?.estado !== 'completada') continue;
      const diaKey = toDiaKey(s?.fechaActividad || s?.fechaRegistro);
      if (diaKey) diasSet.add(diaKey);
    }

    const diasUnicos = Array.from(diasSet);
    diasUnicos.sort(); // asc

    const mejorRacha = calcularMejorRacha(diasUnicos);
    const desc = [...diasUnicos].sort().reverse();

    const ultimoDia = desc[0] || null;
    const rachaActual = calcularRacha(desc);

    return { rachaActual, mejorRacha, ultimoDia, diasUnicos };
  }, [sesiones]);
}

