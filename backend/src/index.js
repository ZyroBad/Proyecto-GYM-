const express = require('express');
const cors = require('cors');
require('dotenv').config();

const itemsRouter = require('./routes/items');

const app = express();

// CORS (fase 4): en Render/Vercel el frontend y backend son dominios distintos.
// Si FRONTEND_URL está definido, solo permito ese origen.
// En local, si no está definido, dejo abierto para no trabarme.
const frontendUrl = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: (origin, cb) => {
      if (!frontendUrl) return cb(null, true);
      if (!origin) return cb(null, true); // Postman/cURL o mismo host
      return cb(null, origin === frontendUrl);
    }
  })
);
app.use(express.json());

// ruta simple para ver que el backend levantó
app.get('/api/health', (req, res) => {
  res.json({ ok: true, fecha: new Date().toISOString() });
});

app.use('/api/items', itemsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log('Backend escuchando en http://localhost:' + port);
});
