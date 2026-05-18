const express = require('express');
const cors = require('cors');
require('dotenv').config();

const itemsRouter = require('./routes/items');

const app = express();

app.use(cors());
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
