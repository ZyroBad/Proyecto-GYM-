const NAV_ITEMS = [
  {
    section: 'Entrenamiento',
    items: [
      { icon: 'ti-layout-grid', label: 'Dashboard', view: 'dashboard' },
      { icon: 'ti-calendar-time', label: 'Bitácora', view: 'bitacora' },
      { icon: 'ti-trophy', label: 'Records (PR)', view: 'records' },
      { icon: 'ti-chart-line', label: 'Progreso', view: 'progreso' }
    ],
  },
  {
    section: 'App',
    items: [{ icon: 'ti-database', label: 'Ejercicios DB', view: 'ejercicios' }]
  }
];

export default function Sidebar({ vistaActiva, onCambiarVista }) {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" aria-hidden="true">
          <i className="ti ti-barbell" />
        </div>
        <span className="sidebar-logo-text">TitanFit</span>
      </div>

      <nav>
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section}>
            <p className="sidebar-section-label">{section}</p>
            {items.map(({ icon, label, view }) => (
              <button
                key={view}
                type="button"
                className={`sidebar-nav-item${vistaActiva === view ? ' active' : ''}`}
                onClick={() => onCambiarVista(view)}
                aria-current={vistaActiva === view ? 'page' : undefined}
              >
                <i className={`ti ${icon}`} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar" aria-hidden="true">SG</div>
          <div>
            <p className="sidebar-user-name">Sebastián</p>
            <p className="sidebar-user-plan">Plan Pro</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
