import { useMemo } from 'react';

/**
 * useProgresoPR
 *
 * Recibe el array de sesiones activas y devuelve:
 *   - prs: objeto  { [ejercicio]: { peso, fecha, sesionId } }
 *   - seriesPorEjercicio: objeto  { [ejercicio]: [{ fecha, peso, volumen }] }
 *   - volumenSemanal: array de { semana, volumenKgRep } para las últimas N semanas
 *
 * "Volumen" = series × reps × peso (kg·rep).
 * Los ejercicios se leen de sesion.atributos.ejercicios:
 *   [{ nombre, series, reps, pesoKg }]
 */
export function useProgresoPR(sesiones, semanas = 8) {
    return useMemo(() => {
        // ── 1. PRs y series por ejercicio ──────────────────────────────────
        const prs = {}; // { nombre: { peso, fecha, sesionId } }
        const seriesPorEjercicio = {}; // { nombre: [{ fecha, peso, volumen }] }

        const activas = sesiones.filter((s) => s.activo && s.estado === 'completada');

        for (const sesion of activas) {
            const ejercicios = sesion.atributos ? .ejercicios ? ? [];
            const fechaISO = sesion.fechaActividad ? ? sesion.fechaRegistro;

            for (const ej of ejercicios) {
                const { nombre, series = 1, reps = 1, pesoKg = 0 } = ej;
                if (!nombre) continue;

                const volumen = series * reps * pesoKg;
                const punto = { fecha: fechaISO, peso: pesoKg, volumen };

                // series temporales
                if (!seriesPorEjercicio[nombre]) seriesPorEjercicio[nombre] = [];
                seriesPorEjercicio[nombre].push(punto);

                // PR
                if (!prs[nombre] || pesoKg > prs[nombre].peso) {
                    prs[nombre] = { peso: pesoKg, fecha: fechaISO, sesionId: sesion.id };
                }
            }
        }

        // Ordenar series cronológicamente
        for (const nombre of Object.keys(seriesPorEjercicio)) {
            seriesPorEjercicio[nombre].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        }

        // ── 2. Volumen semanal (últimas N semanas) ─────────────────────────
        const ahora = new Date();
        const volumenSemanal = [];

        for (let i = semanas - 1; i >= 0; i--) {
            const inicio = new Date(ahora);
            inicio.setDate(inicio.getDate() - i * 7 - 6);
            inicio.setHours(0, 0, 0, 0);

            const fin = new Date(inicio);
            fin.setDate(fin.getDate() + 6);
            fin.setHours(23, 59, 59, 999);

            const etiqueta = inicio.toLocaleDateString('es', { day: '2-digit', month: 'short' });

            let total = 0;
            for (const sesion of activas) {
                const fecha = new Date(sesion.fechaActividad ? ? sesion.fechaRegistro);
                if (fecha < inicio || fecha > fin) continue;
                for (const ej of sesion.atributos ? .ejercicios ? ? []) {
                    total += (ej.series ? ? 1) * (ej.reps ? ? 1) * (ej.pesoKg ? ? 0);
                }
            }

            volumenSemanal.push({ semana: etiqueta, volumen: Math.round(total) });
        }

        return { prs, seriesPorEjercicio, volumenSemanal };
    }, [sesiones, semanas]);
}