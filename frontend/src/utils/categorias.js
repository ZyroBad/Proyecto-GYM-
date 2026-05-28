export const CATEGORIAS = [
  // Colores pensados para gráficas (que se distingan rápido).
  { id: 'fuerza', nombre: 'Fuerza', emoji: '🏋️‍♂️', color: '#DE6542' },
  { id: 'cardio', nombre: 'Cardio', emoji: '🏃‍♀️', color: '#2E86AB' },
  { id: 'flexibilidad', nombre: 'Flexibilidad', emoji: '🧘‍♂️', color: '#2E7D32' },
  { id: 'deportes', nombre: 'Deportes', emoji: '🏀', color: '#6D28D9' }
];

export function categoriaPorId(id) {
  return CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[0];
}
