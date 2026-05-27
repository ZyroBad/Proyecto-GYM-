import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { CATEGORIAS, categoriaPorId } from '../../utils/categorias.js';

export default function DistribucionCategoriaPie({ sesiones }) {
  const counts = new Map(CATEGORIAS.map((c) => [c.id, 0]));

  for (const s of sesiones || []) {
    if (!s.activo) continue;
    counts.set(s.categoriaId, (counts.get(s.categoriaId) || 0) + 1);
  }

  const data = Array.from(counts.entries())
    .map(([id, value]) => {
      const c = categoriaPorId(id);
      return { id, name: `${c.emoji} ${c.nombre}`, value, color: c.color };
    })
    .filter((x) => x.value > 0);

  if (!data.length) {
    return <div className="empty-state">Sin datos para categorías.</div>;
  }

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={78}
            innerRadius={40}
            paddingAngle={2}
            stroke="rgba(0,0,0,0.08)"
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

