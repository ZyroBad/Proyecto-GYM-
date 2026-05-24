export const CATEGORIAS = [
  { id: 'fuerza', nombre: 'Fuerza', emoji: '🏋️‍♂️', color: '#DE6542' },
  { id: 'cardio', nombre: 'Cardio', emoji: '🏃‍♀️', color: '#545454' },
  { id: 'flexibilidad', nombre: 'Flexibilidad', emoji: '🧘‍♂️', color: '#6D6D6D' },
  { id: 'deportes', nombre: 'Deportes', emoji: '🏀', color: '#404040' }
];

export function categoriaPorId(id) {
  return CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[0];
}

