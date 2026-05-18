const express = require('express');
const { pool } = require('../db/database');

const router = express.Router();

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

module.exports = router;
