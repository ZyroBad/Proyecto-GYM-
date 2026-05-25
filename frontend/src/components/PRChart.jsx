import { useEffect, useRef, useState } from 'react';
import { useProgresoPR } from '../hooks/useProgresoPR.js';

/**
 * PRChart
 * Gráfica de línea: evolución del PR (peso máximo) + volumen total por ejercicio.
 * Usa Chart.js vía CDN (si no está cargado, se muestra un mensaje).
 */
export default function PRChart({ sesiones }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const { prs, seriesPorEjercicio } = useProgresoPR(sesiones);

  const ejercicios = Object.keys(seriesPorEjercicio);
  const [ejercicioActivo, setEjercicioActivo] = useState(ejercicios[0] ?? '');

  useEffect(() => {
    if (ejercicios.length && !ejercicios.includes(ejercicioActivo)) {
      setEjercicioActivo(ejercicios[0]);
    }
  }, [ejercicios, ejercicioActivo]);

  useEffect(() => {
    if (!canvasRef.current || !ejercicioActivo) return;

    const Chart = window.Chart;
    if (!Chart) return;

    const serie = seriesPorEjercicio[ejercicioActivo] ?? [];
    if (!serie.length) return;

    const labels = serie.map((p) =>
      new Date(p.fecha).toLocaleDateString('es', { day: '2-digit', month: 'short' })
    );
    const pesos = serie.map((p) => p.peso);
    const volumen = serie.map((p) => Math.round((p.volumen / 1000) * 10) / 10);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Peso máx (kg)',
            data: pesos,
            borderColor: '#D85A30',
            backgroundColor: 'rgba(216, 90, 48, 0.07)',
            borderWidth: 2.5,
            pointBackgroundColor: '#D85A30',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Volumen (t)',
            data: volumen,
            borderColor: '#185FA5',
            borderWidth: 2,
            borderDash: [5, 4],
            pointBackgroundColor: '#185FA5',
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: false,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2C2B28',
            titleFont: { size: 12 },
            bodyFont: { size: 12 },
            callbacks: {
              label: (ctx) => (ctx.datasetIndex === 0 ? ` ${ctx.raw} kg` : ` ${ctx.raw.toFixed(1)} t`)
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 11 }, color: '#888780', maxRotation: 45 },
            border: { display: false }
          },
          y: {
            position: 'left',
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { size: 11 },
              color: '#888780',
              callback: (v) => v + ' kg'
            },
            border: { display: false }
          },
          y2: {
            position: 'right',
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              color: '#185FA5',
              callback: (v) => v + ' t'
            },
            border: { display: false }
          }
        }
      }
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [ejercicioActivo, seriesPorEjercicio]);

  if (!ejercicios.length) {
    return (
      <div className="empty-state" style={{ padding: '24px 0' }}>
        <i className="ti ti-chart-line" aria-hidden="true" />
        <p>Registrá sesiones con ejercicios para ver progreso.</p>
      </div>
    );
  }

  if (!window.Chart) {
    return (
      <div className="empty-state" style={{ padding: '24px 0' }}>
        <i className="ti ti-alert-triangle" aria-hidden="true" />
        <p>Gráfica en reserva (Chart.js no está cargado).</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2" style={{ gap: 10 }}>
        <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
          <i className="ti ti-trophy text-accent" aria-hidden="true" style={{ fontSize: 15 }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Progreso de PRs</span>
          {ejercicioActivo ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              — {ejercicioActivo}:{' '}
              <strong style={{ color: 'var(--accent)' }}>{prs[ejercicioActivo]?.peso ?? '—'} kg</strong>
            </span>
          ) : null}
        </div>

        <select
          value={ejercicioActivo}
          onChange={(e) => setEjercicioActivo(e.target.value)}
          style={{ width: 'auto', padding: '4px 8px', fontSize: 12 }}
          aria-label="Seleccionar ejercicio"
        >
          {ejercicios.map((ej) => (
            <option key={ej} value={ej}>
              {ej}
            </option>
          ))}
        </select>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 200 }}>
        <canvas ref={canvasRef} role="img" aria-label={`Gráfica PR de ${ejercicioActivo}`} />
      </div>
    </div>
  );
}

