const express = require('express');
const { pool } = require('../db/database');

const router = express.Router();

const categoriasValidas = ['fuerza', 'cardio', 'flexibilidad', 'deportes'];
const estadosValidos = ['pendiente', 'completada', 'pausada'];

// Por ahora: endpoint simple para ir probando
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM items ORDER BY fechaRegistro DESC NULLS LAST'
    );
    res.json(resultado.rows);
  } catch (err) {
    console.log('Error leyendo items:', err);
    res.status(500).json({ error: 'No se pudieron leer los items' });
  }
});

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};

    // validación bien básica, sin ponerse exquisitos
    const nombre = String(body.nombre || '').trim();
    const categoriaId = String(body.categoriaId || '').trim();
    const estado = String(body.estado || '').trim();

    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
    if (!categoriasValidas.includes(categoriaId)) {
      return res.status(400).json({ error: 'categoriaId inválida' });
    }
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'estado inválido' });
    }

    const id = body.id; // viene del frontend con crypto.randomUUID()
    if (!id) return res.status(400).json({ error: 'Falta id' });

    const puntuacion =
      body.puntuacion === null || body.puntuacion === undefined ? null : Number(body.puntuacion);
    const fechaRegistro = body.fechaRegistro || new Date().toISOString();
    const fechaActividad = body.fechaActividad || null;
    const notas = body.notas || '';
    const atributos = body.atributos || {};
    const activo = body.activo === false ? false : true;

    const insert = await pool.query(
      `INSERT INTO items
        (id, nombre, categoriaId, estado, puntuacion, fechaRegistro, fechaActividad, notas, atributos, activo)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        id,
        nombre,
        categoriaId,
        estado,
        Number.isNaN(puntuacion) ? null : puntuacion,
        fechaRegistro,
        fechaActividad,
        notas,
        atributos,
        activo
      ]
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.log('Error creando item:', err);
    res.status(500).json({ error: 'No se pudo crear el item' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const nombre = String(body.nombre || '').trim();
    const categoriaId = String(body.categoriaId || '').trim();
    const estado = String(body.estado || '').trim();

    if (!nombre) return res.status(400).json({ error: 'Falta nombre' });
    if (!categoriasValidas.includes(categoriaId)) {
      return res.status(400).json({ error: 'categoriaId inválida' });
    }
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'estado inválido' });
    }

    const puntuacion =
      body.puntuacion === null || body.puntuacion === undefined ? null : Number(body.puntuacion);
    const fechaRegistro = body.fechaRegistro || null;
    const fechaActividad = body.fechaActividad || null;
    const notas = body.notas || '';
    const atributos = body.atributos || {};
    const activo = body.activo === false ? false : true;

    const update = await pool.query(
      `UPDATE items SET
        nombre = $2,
        categoriaId = $3,
        estado = $4,
        puntuacion = $5,
        fechaRegistro = COALESCE($6, fechaRegistro),
        fechaActividad = $7,
        notas = $8,
        atributos = $9,
        activo = $10
      WHERE id = $1
      RETURNING *`,
      [
        id,
        nombre,
        categoriaId,
        estado,
        Number.isNaN(puntuacion) ? null : puntuacion,
        fechaRegistro,
        fechaActividad,
        notas,
        atributos,
        activo
      ]
    );

    if (!update.rows.length) {
      return res.status(404).json({ error: 'No existe ese item' });
    }

    res.json(update.rows[0]);
  } catch (err) {
    console.log('Error actualizando item:', err);
    res.status(500).json({ error: 'No se pudo actualizar el item' });
  }
});

module.exports = router;
