import { useEffect, useRef, useState } from 'react';
import { CATEGORIAS } from '../utils/categorias.js';

const estados = ['pendiente', 'completada', 'pausada'];

export default function FormularioSesion({
  onGuardar,
  sesionEditando,
  onActualizar,
  onCancelarEdicion
}) {
  const nombreRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('fuerza');
  const [estado, setEstado] = useState('pendiente');
  const [puntuacion, setPuntuacion] = useState(3);
  const [fechaActividad, setFechaActividad] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState(45);
  const [notas, setNotas] = useState('');

  const estaEditando = Boolean(sesionEditando);

  useEffect(() => {
    if (!sesionEditando) return;

    // cuando le doy "Editar", cargo los valores en el form
    setNombre(sesionEditando.nombre || '');
    setCategoriaId(sesionEditando.categoriaId || 'fuerza');
    setEstado(sesionEditando.estado || 'pendiente');
    setPuntuacion(sesionEditando.puntuacion ?? 3);
    setFechaActividad(sesionEditando.fechaActividad || '');
    setDuracionMinutos(sesionEditando.atributos?.duracionMinutos ?? 45);
    setNotas(sesionEditando.notas || '');
  }, [sesionEditando]);

  // useRef #1: Ctrl+N enfoca el input de nombre
  useEffect(() => {
    function onKeyDown(e) {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        nombreRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function enviarFormulario(e) {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) return;

    if (estaEditando) {
      const sesionActualizada = {
        ...sesionEditando,
        nombre: nombreLimpio,
        categoriaId,
        estado,
        puntuacion: Number(puntuacion),
        fechaActividad: fechaActividad || null,
        notas: notas.trim(),
        atributos: {
          ...sesionEditando.atributos,
          duracionMinutos: Number(duracionMinutos)
        }
      };

      console.log('Actualizando sesión:', sesionActualizada.nombre);
      onActualizar(sesionActualizada);
      return;
    }

    const nuevaSesion = {
      id: crypto.randomUUID(),
      nombre: nombreLimpio,
      categoriaId,
      estado,
      puntuacion: Number(puntuacion),
      fechaRegistro: new Date().toISOString(),
      fechaActividad: fechaActividad || null,
      notas: notas.trim(),
      atributos: {
        duracionMinutos: Number(duracionMinutos),
        ejercicios: [],
        volumenTotal: 0
      },
      activo: true
    };

    console.log('Guardando sesión:', nuevaSesion.nombre);
    onGuardar(nuevaSesion);

    // reseteo simple (no quiero ponerlo ultra perfecto por ahora)
    setNombre('');
    setNotas('');

    // useRef #1: después de guardar, vuelvo a enfocar el nombre
    nombreRef.current?.focus();
  }

  return (
    <form onSubmit={enviarFormulario}>
      <label>
        Nombre
        <input
          ref={nombreRef}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Push pesado pecho/tríceps"
        />
      </label>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <label>
          Categoría
          <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            {estados.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Punt.
          <input
            type="number"
            min="1"
            max="5"
            value={puntuacion}
            onChange={(e) => setPuntuacion(e.target.value)}
          />
        </label>

        <label>
          Duración
          <input
            type="number"
            min="5"
            max="240"
            value={duracionMinutos}
            onChange={(e) => setDuracionMinutos(e.target.value)}
          />
        </label>
      </div>

      <label style={{ marginTop: 10, display: 'block' }}>
        Fecha actividad
        <input
          type="date"
          value={fechaActividad}
          onChange={(e) => setFechaActividad(e.target.value)}
        />
      </label>

      <label style={{ marginTop: 10, display: 'block' }}>
        Notas
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Algo corto... (series, sensaciones, etc.)"
          rows={3}
        />
      </label>

      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <button type="submit">{estaEditando ? 'Guardar cambios' : 'Guardar sesión'}</button>
        {estaEditando ? (
          <button type="button" onClick={onCancelarEdicion}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
