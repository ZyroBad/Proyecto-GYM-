const { Pool } = require('pg');

// Idea: algo simple y entendible, sin meter "capas" raras.
// El Pool agarra config de DATABASE_URL o de variables PG*.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDb() {
  // tablas bien básicas, sin tanta vuelta.
  // (Si ya existen no pasa nada)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoriaId TEXT NOT NULL,
      estado TEXT NOT NULL,
      puntuacion INTEGER,
      fechaRegistro TEXT,
      fechaActividad TEXT,
      notas TEXT,
      atributos JSONB,
      activo BOOLEAN DEFAULT TRUE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS registros (
      id SERIAL PRIMARY KEY,
      itemId TEXT NOT NULL REFERENCES items(id),
      fecha TEXT NOT NULL,
      nota TEXT
    );
  `);
}

// No lo freno si falla, pero al menos lo veo en consola
initDb().catch((err) => {
  console.log('No se pudo inicializar la DB:', err.message);
});

module.exports = {
  pool
};
