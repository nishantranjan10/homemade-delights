import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import specialsRoutes from './routes/specials.js';
import orderRoutes from './routes/orders.js';
import configRoutes from './routes/config.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/config', configRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/specials', specialsRoutes);
app.use('/api/orders', orderRoutes);

// Centralised error handler so async route throws return JSON, not HTML.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rupalis_delights').then(
  () => {
    app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
  }
);
