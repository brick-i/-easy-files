const crypto = require('node:crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  if (!password || !stored) return false;
  try {
    if (!stored.startsWith('scrypt$')) {
      // пароли из версии 1.0 хранились в открытом виде — сравниваем и заодно
      // оставляем совместимость со старыми meta-файлами
      return crypto.timingSafeEqual(Buffer.from(String(password)), Buffer.from(String(stored)));
    }
    const [, salt, hash] = stored.split('$');
    const candidate = crypto.scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

const newToken = () => crypto.randomUUID();

function rateLimit({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);

    if (list.length >= max) {
      return res.status(429).json({ error: 'Слишком много запросов. Попробуйте позже.' });
    }

    list.push(now);
    hits.set(ip, list);

    if (hits.size > 5000) {
      for (const [key, times] of hits) if (!times.length) hits.delete(key);
    }

    next();
  };
}

const isExpired = (meta) => !!meta.expiresAt && Date.now() > Date.parse(meta.expiresAt);
const isExhausted = (meta) => !!meta.maxDownloads && meta.downloads >= meta.maxDownloads;

module.exports = { hashPassword, verifyPassword, newToken, rateLimit, isExpired, isExhausted };
