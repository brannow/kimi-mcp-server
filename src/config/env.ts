import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { defaults } from './defaults.js';

// Try multiple common locations for .env file
const envFile = process.env.KIMI_ENV_FILE || '.env';
const possiblePaths = [
  envFile,
  resolve(process.cwd(), envFile),           // Current working directory
  resolve(import.meta.dirname, envFile),     // Same dir as this file
  resolve(import.meta.dirname, '..', envFile), // One level up
  resolve(import.meta.dirname, '../..', envFile), // Two levels up
  resolve(import.meta.dirname, '../../..', envFile), // Three levels up
  resolve(import.meta.dirname, '../../../..', envFile), // four levels up
  resolve(import.meta.dirname, '../../../../..', envFile), // four levels up
];

for (const envPath of possiblePaths) {
  if (existsSync(envPath)) {
    config({ path: envPath, quiet: true });
    break;
  }
}

export const env = {
  KIMI_API_KEY: process.env.KIMI_API_KEY!,
  KIMI_API_URL: process.env.KIMI_API_URL || defaults.KIMI_API_URL,
  KIMI_API_MODEL: process.env.KIMI_API_MODEL || defaults.KIMI_API_MODEL
};
