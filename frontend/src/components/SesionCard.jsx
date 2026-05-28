import React from 'react';
import { CATEGORIAS } from '../utils/categorias.js';

const CAT_ICON = {
  fuerza: 'ti-barbell',
  cardio: 'ti-run',
  flexibilidad: 'ti-yoga',
  deportes: 'ti-ball-basketball'
};

function formatFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SesionCard({ sesion, onEditar, onArchivar, onMarcarCompletada }) {
  const cat = CATEGORIAS.find((c) => c.id === sesion.categoriaId) ?? CATEGORIAS[0];
  const icon = CAT_ICON[sesion.categoriaId] ?? 'ti-dumbbell';
  const dur = sesion.atributos?.duracionMinutos ?? '—';

  return (
    <article className="sesion-card">
      <div className="sesion-card-header">
        <div className="flex items-center gap-2">
          <div className={`cat-icon cat-icon-${sesion.categoriaId}`} aria-hidden="true">
            <i className={`ti ${icon}`} />
          </div>
          <div>
            <p className="sesion-card-title">
              {sesion.nombre}{' '}
              {!sesion.activo && <span className="sesion-card-archived">(archivada)</span>}
            </p>
            <div className="sesion-card-meta">
              <span className={`badge badge-${sesion.categoriaId}`}>
                {cat.emoji} {cat.nombre}
              </span>
              <span>·</span>
              <span>{sesion.estado}</span>
              {sesion.fechaActividad && (
                <>
                  <span>·</span>
                  <span>{formatFecha(sesion.fechaActividad)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {sesion.activo && (
          <div className="sesion-card-actions">
            {sesion.estado !== 'completada' && (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => onMarcarCompletada?.(sesion.id)}
                aria-label={`Marcar como completada ${sesion.nombre}`}
              >
                <i className="ti ti-check" aria-hidden="true" style={{ fontSize: 13 }} />
                Completar
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onEditar?.(sesion)}
              aria-label={`Editar sesión ${sesion.nombre}`}
            >
              <i className="ti ti-edit" aria-hidden="true" style={{ fontSize: 13 }} />
              Editar
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onArchivar?.(sesion.id)}
              aria-label={`Archivar sesión ${sesion.nombre}`}
            >
              <i className="ti ti-archive" aria-hidden="true" style={{ fontSize: 13 }} />
              Archivar
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-1" style={{ flexWrap: 'wrap' }}>
        <span className="flex items-center gap-2 text-muted" style={{ fontSize: 12 }}>
          <i className="ti ti-clock" aria-hidden="true" style={{ fontSize: 13 }} />
          {dur} min
        </span>
        {sesion.puntuacion != null && (
          <span className="flex items-center gap-2 text-muted" style={{ fontSize: 12 }}>
            <i className="ti ti-star" aria-hidden="true" style={{ fontSize: 13 }} />
            {sesion.puntuacion}/5
          </span>
        )}
        {sesion.notas && (
          <span className="text-muted" style={{ fontSize: 12 }}>
            {sesion.notas.slice(0, 60)}
            {sesion.notas.length > 60 ? '…' : ''}
          </span>
        )}
      </div>
    </article>
  );
}

export default React.memo(SesionCard);

