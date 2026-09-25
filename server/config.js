const path = require('node:path');

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  PORT: num(process.env.PORT, 3001),
  HOST: process.env.HOST || '0.0.0.0',
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL
    ? process.env.PUBLIC_BASE_URL.replace(/\/+$/, '')
    : '',
  MAX_FILE_SIZE: num(process.env.MAX_FILE_SIZE_MB, 2048) * 1024 * 1024,
  DATA_DIR: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
  ADMIN_KEY: process.env.ADMIN_KEY || '',
  SWEEP_INTERVAL_MS: num(process.env.SWEEP_INTERVAL_MS, 30_000),
  ALLOWED_TTL: [3600, 86400, 604800, 0],
  DEFAULT_TTL: 86400,
};
