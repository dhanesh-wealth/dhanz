import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function loadLocalEnv() {
  // Netlify/Lambda inject env vars — do not read .env file (import.meta.url breaks when bundled)
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return;

  const metaUrl = typeof import.meta !== 'undefined' ? import.meta.url : undefined;
  if (!metaUrl) {
    dotenv.config();
    return;
  }

  try {
    const envPath = join(dirname(fileURLToPath(metaUrl)), '../.env');
    if (existsSync(envPath)) {
      dotenv.config({ path: envPath });
    }
  } catch {
    dotenv.config();
  }
}

loadLocalEnv();
