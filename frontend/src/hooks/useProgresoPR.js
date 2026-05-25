import { useMemo } from 'react';

function normalizarFecha(s) {
  return s.fechaActividad || s.fechaRegistro || new Date().toISOString();
}

function volumenDeEjercicio(ej) {
  const series = Number(ej.series ?? 1);
  const reps = Number(ej.reps ?? 1);
  const peso = Number(ej.pesoKg ?? 0);
  return series * reps * peso;
}

export function useProgresoPR(sesiones) {
  return useMemo(() => {
    const seriesPorEjercicio = {};
    const prs = {};

    for (const sesion of sesiones || []) {
      const ejercicios = sesion.atributos?.ejercicios ?? [];
      if (!Array.isArray(ejercicios) || !ejercicios.length) continue;

      const fecha = normalizarFecha(sesion);

      for (const ej of ejercicios) {
        const nombre = String(ej.nombre || '').trim();
        if (!nombre) continue;

        const peso = Number(ej.pesoKg ?? 0);
        const volumen = volumenDeEjercicio(ej);

        if (!seriesPorEjercicio[nombre]) seriesPorEjercicio[nombre] = [];
        seriesPorEjercicio[nombre].push({ fecha, peso, volumen });

        const prActual = prs[nombre];
        if (!prActual || peso > prActual.peso) {
          prs[nombre] = { peso, fecha };
        }
      }
    }

    for (const nombre of Object.keys(seriesPorEjercicio)) {
      seriesPorEjercicio[nombre].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    return { prs, seriesPorEjercicio };
  }, [sesiones]);
}

