import { config } from 'dotenv';
import { resolve } from 'path';
import { defaults } from './defaults.js';

// Load environment variables from custom or default .env file
const envFile = process.env.KIMI_ENV_FILE || '.env';
const envPath = resolve(envFile);

config({ path: envPath, quiet: true });

export const env = {
  KIMI_API_KEY: process.env.KIMI_API_KEY!,
  KIMI_API_URL: process.env.KIMI_API_URL || defaults.KIMI_API_URL,
  KIMI_API_MODEL: process.env.KIMI_API_MODEL || defaults.KIMI_API_MODEL
};
