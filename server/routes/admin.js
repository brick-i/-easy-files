const express = require('express');
const config = require('../config');
const storage = require('../lib/storage');
const { isExpired, isExhausted } = require('../lib/security');

const router = express.Router();

// Админ-API включается только переменной окружения ADMIN_KEY.
function requireAdmin(req, res, next) {
  if (!config.ADMIN_KEY) {
    return res.status(403).json({
      error: 'Админ-панель отключена. Задайте переменную окружения ADMIN_KEY при запуске сервера.',
      disabled: true,
    });
  }
  if (req.get('x-admin-key') !== config.ADMIN_KEY) {
    return res.status(401).json({ error: 'Неверный ключ доступа' });
  }
  next();
}

router.get('/files', requireAdmin, (req, res) => {
  const files = storage
    .listMetas()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((m) => ({
      id: m.id,
      originalName: m.originalName,
      size: m.size,
      createdAt: m.createdAt,
      expiresAt: m.expiresAt,
      maxDownloads: m.maxDownloads || 0,
      downloads: m.downloads,
      hasPassword: !!m.password,
      expired: isExpired(m) || isExhausted(m),
    }));

  res.json({
    files,
    stats: {
      count: files.length,
      totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    },
  });
});

router.delete('/files/:id', requireAdmin, (req, res) => {
  const meta = storage.readMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: 'Файл не найден' });

  storage.removeFile(meta);
  res.json({ success: true });
});

module.exports = router;
