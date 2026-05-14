require('dotenv').config();

const express = require('express');
const cors = require('cors');

const brandsRoute = require('./routes/brands');
const submitRoute = require('./routes/submit');

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: frontendOrigin === '*' ? true : frontendOrigin.split(',').map((s) => s.trim()),
    credentials: false
  })
);
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

app.use('/api/brands', brandsRoute);
app.use('/api/submit', submitRoute);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found', path: req.path });
});

app.use((err, _req, res, _next) => {
  console.error('[server] error:', err);
  res.status(500).json({ error: 'internal_error' });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
