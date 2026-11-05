import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRequest } from './server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// API routes handled by full-stack router
app.use('/api', (req, res, next) => {
  handleApiRequest(req, res, next);
});

// Serve static assets from Vite build in dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Health check endpoint for Cloud Run
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// SPA fallback for all client routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Production server listening on ${HOST}:${PORT}`);
});
