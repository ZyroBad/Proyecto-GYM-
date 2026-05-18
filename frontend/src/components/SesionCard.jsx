export default function SesionCard({ sesion, onArchivar }) {
  return (
    <article
      style={{
        padding: '12px 14px',
        background: 'rgba(22, 26, 34, 0.55)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px 18px 12px 16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16 }}>
            {sesion.nombre}{' '}
            {!sesion.activo ? <span style={{ color: '#a8a8a8' }}>(archivada)</span> : null}
          </h3>
          <p style={{ margin: '6px 0 0', color: '#a8a8a8' }}>
            {sesion.categoriaId} • {sesion.estado} • {sesion.atributos?.duracionMinutos ?? '?'} min
          </p>
        </div>

        {sesion.activo ? (
          <button type="button" onClick={() => onArchivar(sesion.id)}>
            Archivar
          </button>
        ) : null}
      </div>
    </article>
  );
}

