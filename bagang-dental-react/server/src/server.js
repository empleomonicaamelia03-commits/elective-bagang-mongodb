import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import bookingRoutes from './routes/bookings.js';
import contactRoutes from './routes/contact.js';
import invoiceRoutes from './routes/invoices.js';
import catalogRoutes from './routes/catalog.js';
import { seedCatalog } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(
  helmet({
    // The React build loads Google Fonts and OpenStreetMap tiles/Leaflet assets.
    contentSecurityPolicy: false,
  })
);

const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api', catalogRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Optionally serve the built React app (run `npm run build` in the project root first).
const dist = path.resolve(__dirname, '../../dist');
if (fs.existsSync(path.join(dist, 'index.html'))) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors)[0]?.message || 'Invalid data.' });
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const port = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => seedCatalog()) // fills services, dentists and schedules on a brand-new database
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
