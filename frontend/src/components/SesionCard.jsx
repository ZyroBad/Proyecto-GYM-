export default function SesionCard({ sesion, onArchivar, onEditar }) {
  return (
    <article
      style={{
        padding: '12px 14px',
        background: 'var(--bg-card-light)',
        border: '1px solid var(--border-soft)',
        borderRadius: '10px 18px 12px 16px',
        boxShadow: '0 12px 24px var(--shadow-card)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>
            {sesion.nombre}{' '}
            {!sesion.activo ? (
              <span style={{ color: 'var(--text-muted)' }}>(archivada)</span>
            ) : null}
          </h3>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>
            {sesion.categoriaId} • {sesion.estado} • {sesion.atributos?.duracionMinutos ?? '?'} min
          </p>
        </div>

        {sesion.activo ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <button type="button" onClick={() => onEditar?.(sesion)}>
              Editar
            </button>
            <button type="button" onClick={() => onArchivar(sesion.id)}>
              Archivar
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
