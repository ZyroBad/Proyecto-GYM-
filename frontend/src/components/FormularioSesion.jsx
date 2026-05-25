import { useEffect, useRef, useState } from 'react';
import { CATEGORIAS } from '../utils/categorias.js';

const ESTADOS = ['pendiente', 'completada', 'pausada'];

const DEFAULT = {
  nombre: '',
  categoriaId: 'fuerza',
  estado: 'pendiente',
  puntuacion: 3,
  fechaActividad: '',
  duracionMinutos: 45,
  notas: '',
};

export default function FormularioSesion({
  onGuardar,
  sesionEditando,
  onActualizar,
  onCancelarEdicion,
}) {
  const nombreRef = useRef(null);
  const [form, setForm] = useState(DEFAULT);
  const estaEditando = Boolean(sesionEditando);

  // Cargar datos al editar
  useEffect(() => {
    if (!sesionEditando) return;
    setForm({
      nombre:          sesionEditando.nombre ?? '',
      categoriaId:     sesionEditando.categoriaId ?? 'fuerza',
      estado:          sesionEditando.estado ?? 'pendiente',
      puntuacion:      sesionEditando.puntuacion ?? 3,
      fechaActividad:  sesionEditando.fechaActividad ?? '',
      duracionMinutos: sesionEditando.atributos?.duracionMinutos ?? 45,
      notas:           sesionEditando.notas ?? '',
    });
  }, [sesionEditando]);

  // Ctrl+N enfoca el nombre
  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        nombreRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nombre = form.nombre.trim();
    if (!nombre) return;

    const payload = {
      nombre,
      categoriaId:     form.categoriaId,
      estado:          form.estado,
      puntuacion:      Number(form.puntuacion),
      fechaActividad:  form.fechaActividad || null,
      notas:           form.notas.trim(),
      atributos: {
        ...(sesionEditando?.atributos ?? {}),
        duracionMinutos: Number(form.duracionMinutos),
      },
    };

    if (estaEditando) {
      onActualizar({ ...sesionEditando, ...payload });
    } else {
      onGuardar({
        id: crypto.randomUUID(),
        ...payload,
        fechaRegistro: new Date().toISOString(),
        activo: true,
      });
      setForm(DEFAULT);
      nombreRef.current?.focus();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">

        <div className="form-field full">
          <label htmlFor="nombre">Nombre de la sesión</label>
          <input
            id="nombre"
            ref={nombreRef}
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            placeholder="Ej: Push pesado pecho/tríceps"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="categoriaId">Categoría</label>
          <select
            id="categoriaId"
            value={form.categoriaId}
            onChange={(e) => set('categoriaId', e.target.value)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            value={form.estado}
            onChange={(e) => set('estado', e.target.value)}
          >
            {ESTADOS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="duracionMinutos">Duración (min)</label>
          <input
            id="duracionMinutos"
            type="number"
            min="5"
            max="300"
            value={form.duracionMinutos}
            onChange={(e) => set('duracionMinutos', e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="puntuacion">Puntuación (1–5)</label>
          <input
            id="puntuacion"
            type="number"
            min="1"
            max="5"
            value={form.puntuacion}
            onChange={(e) => set('puntuacion', e.target.value)}
          />
        </div>

        <div className="form-field full">
          <label htmlFor="fechaActividad">Fecha de actividad</label>
          <input
            id="fechaActividad"
            type="date"
            value={form.fechaActividad}
            onChange={(e) => set('fechaActividad', e.target.value)}
          />
        </div>

        <div className="form-field full">
          <label htmlFor="notas">Notas</label>
          <textarea
            id="notas"
            rows={3}
            value={form.notas}
            onChange={(e) => set('notas', e.target.value)}
            placeholder="Series, sensaciones, peso usado…"
          />
        </div>

        <div className="form-field actions">
          {estaEditando && (
            <button type="button" className="btn" onClick={onCancelarEdicion}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            <i
              className={`ti ${estaEditando ? 'ti-check' : 'ti-plus'}`}
              aria-hidden="true"
              style={{ fontSize: 14 }}
            />
            {estaEditando ? 'Guardar cambios' : 'Guardar sesión'}
          </button>
        </div>

      </div>
    </form>
  );
}