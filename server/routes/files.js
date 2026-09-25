const express = require('express');
const multer = require('multer');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('../config');
const storage = require('../lib/storage');
const { hashPassword, verifyPassword, newToken, rateLimit, isExpired, isExhausted } = require('../lib/security');
const { decodeFilename, getPublicOrigin } = require('../lib/util');

const router = express.Router();

const uploadLimiter = rateLimit({ max: 10 });
const downloadLimiter = rateLimit({ max: 60 });

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storage.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(decodeFilename(file.originalname)).slice(0, 20);
    cb(null, crypto.randomUUID() + ext);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: config.MAX_FILE_SIZE },
});

function fileInfo(meta) {
  return {
    id: meta.id,
    originalName: meta.originalName,
    size: meta.size,
    createdAt: meta.createdAt,
    expiresAt: meta.expiresAt,
    maxDownloads: meta.maxDownloads || 0,
    downloads: meta.downloads,
    hasPassword: !!meta.password,
  };
}

function checkAvailable(res, meta) {
  if (isExpired(meta) || isExhausted(meta)) {
    res.status(410).json({ error: 'Срок хранения файла истёк или лимит скачиваний исчерпан' });
    return false;
  }
  return true;
}

router.post('/upload', uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не получен' });
  }

  const id = crypto.randomUUID();
  const ttl = config.ALLOWED_TTL.includes(Number(req.body.ttl)) ? Number(req.body.ttl) : config.DEFAULT_TTL;
  const maxDownloads = Math.min(Math.max(parseInt(req.body.maxDownloads, 10) || 0, 0), 1000);
  const password = req.body.password ? hashPassword(req.body.password) : null;
  const originalName = decodeFilename(req.file.originalname);

  const meta = {
    id,
    originalName,
    storedName: req.file.filename,
    size: req.file.size,
    password,
    createdAt: new Date().toISOString(),
    expiresAt: ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : null,
    maxDownloads,
    downloads: 0,
    deleteToken: newToken(),
  };

  storage.writeMeta(meta);

  res.json({
    id,
    link: `${getPublicOrigin(req, config.PUBLIC_BASE_URL)}/download/${id}`,
    deleteToken: meta.deleteToken,
    originalName,
    size: meta.size,
    expiresAt: meta.expiresAt,
    maxDownloads,
    hasPassword: !!password,
  });
});

router.get('/file/:id', (req, res) => {
  const meta = storage.readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: 'Файл не найден' });
  if (!checkAvailable(res, meta)) return;
  res.json(fileInfo(meta));
});

// Предварительная проверка пароля — клиент вызывает перед нативным POST-скачиванием,
// чтобы показать «неверный пароль» без ухода со страницы.
router.post('/verify/:id', downloadLimiter, (req, res) => {
  const meta = storage.readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: 'Файл не найден' });
  if (!checkAvailable(res, meta)) return;

  if (meta.password && !verifyPassword(req.body.password, meta.password)) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  res.json({ ok: true });
});

// Скачивание — обычный POST-запрос (браузер сам показывает прогресс и пишет на диск).
router.post('/download/:id', downloadLimiter, (req, res) => {
  const meta = storage.readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: 'Файл не найден' });
  if (!checkAvailable(res, meta)) return;

  if (meta.password && !verifyPassword(req.body.password, meta.password)) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  const filePath = storage.storedPath(meta.storedName);
  if (!require('node:fs').existsSync(filePath)) {
    return res.status(404).json({ error: 'Файл не найден на диске' });
  }

  meta.downloads++;
  storage.writeMeta(meta);

  res.download(filePath, meta.originalName);
});

router.delete('/file/:id', (req, res) => {
  const meta = storage.readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: 'Файл не найден' });

  const token = req.get('x-delete-token');
  const adminKey = req.get('x-admin-key');
  const isOwner = token && token === meta.deleteToken;
  const isAdmin = config.ADMIN_KEY && adminKey === config.ADMIN_KEY;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Доступ запрещён: нужен токен удаления' });
  }

  storage.removeFile(meta);
  res.json({ success: true });
});

module.exports = router;
