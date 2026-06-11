import './loadEnv.js';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { app } from './app.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const distPath = join(__dirname, '../dist');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  const hasToken = Boolean(process.env.SANITY_WRITE_TOKEN?.trim());
  console.log(`CMS API (Sanity) running at http://localhost:${PORT}`);
  console.log(`Sanity project: ${process.env.SANITY_PROJECT_ID || '6992crjl'}`);
  console.log(`Sanity write token: ${hasToken ? 'loaded' : 'MISSING — add SANITY_WRITE_TOKEN to .env'}`);
  if (!hasToken) {
    console.warn('Admin uploads will fail until SANITY_WRITE_TOKEN is set in .env');
  }
  if (existsSync(distPath)) {
    console.log('Serving production build from /dist');
  }
});
