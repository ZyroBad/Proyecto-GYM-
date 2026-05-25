import SesionCard from './SesionCard.jsx';

export default function ListaSesiones({ sesiones, onEditar, onArchivar }) {
  if (!sesiones.length) {
    return (
      <div className="empty-state">
        <i className="ti ti-calendar-off" aria-hidden="true" />
        <p>Todavía no tenés sesiones registradas.</p>
      </div>
    );
  }

  return (
    <div className="flex-col gap-3">
      {sesiones.map((sesion) => (
        <SesionCard
          key={sesion.id}
          sesion={sesion}
          onEditar={onEditar}
          onArchivar={onArchivar}
        />
      ))}
    </div>
  );
}