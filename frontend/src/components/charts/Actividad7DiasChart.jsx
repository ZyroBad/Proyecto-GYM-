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

function yyyyMmDd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function etiquetaCorta(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { weekday: 'short', day: '2-digit' });
}

export default function Actividad7DiasChart({ sesiones }) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    dias.push(d);
  }

  const porDia = new Map(dias.map((d) => [yyyyMmDd(d), 0]));

  for (const s of sesiones || []) {
    if (!s.activo) continue;
    const fecha = s.fechaActividad || s.fechaRegistro;
    if (!fecha) continue;
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    const key = yyyyMmDd(d);
    if (!porDia.has(key)) continue;
    porDia.set(key, porDia.get(key) + 1);
  }

  const data = Array.from(porDia.entries()).map(([fecha, cantidad]) => ({
    fecha,
    dia: etiquetaCorta(fecha),
    cantidad
  }));

  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar name="Sesiones" dataKey="cantidad" fill="#DE6542" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

