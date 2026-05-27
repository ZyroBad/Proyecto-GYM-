import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const ESTADOS = ['pendiente', 'pausada', 'completada'];

export default function DuracionPorEstadoChart({ sesiones }) {
  const porEstado = Object.fromEntries(ESTADOS.map((e) => [e, 0]));

  for (const s of sesiones || []) {
    if (!s.activo) continue;
    const dur = Number(s.atributos?.duracionMinutos ?? 0) || 0;
    if (!porEstado[s.estado]) porEstado[s.estado] = 0;
    porEstado[s.estado] += dur;
  }

  const data = [
    {
      name: 'Duración',
      pendiente: porEstado.pendiente || 0,
      pausada: porEstado.pausada || 0,
      completada: porEstado.completada || 0
    }
  ];

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar name="Pendiente (min)" dataKey="pendiente" stackId="a" fill="#898685" radius={[6, 6, 0, 0]} />
          <Bar name="Pausada (min)" dataKey="pausada" stackId="a" fill="#545454" radius={[6, 6, 0, 0]} />
          <Bar name="Completada (min)" dataKey="completada" stackId="a" fill="#DE6542" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

