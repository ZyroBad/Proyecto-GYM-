import SesionCard from './SesionCard.jsx';

export default function ListaSesiones({ sesiones, onArchivar }) {
  if (!sesiones.length) {
    return <p style={{ color: '#a8a8a8' }}>Todavía no tenés sesiones guardadas.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {sesiones.map((sesion) => (
        <SesionCard key={sesion.id} sesion={sesion} onArchivar={onArchivar} />
      ))}
    </div>
  );
}

