const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const config = require('./config');
const files = require('./routes/files');
const admin = require('./routes/admin');
const storage = require('./lib/storage');
const { lanAddresses } = require('./lib/util');
const { startSweeper } = require('./lib/cleanup');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'EasyFiles', version: '2.0.0', uptime: process.uptime() });
});

app.use('/api/admin', admin);
app.use('/api', files);

// Раздаём только собранный клиент. Папка uploads наружу не отдаётся напрямую —
// все файлы проходят через /api/download с проверкой пароля, срока и лимитов.
const distDir = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  // пути с расширением (например /uploads/file.txt) — это не маршруты SPA
  if (path.extname(req.path)) return res.status(404).json({ error: 'Не найдено' });
  res.sendFile(path.join(distDir, 'index.html'));
});

// Ошибка multer «файл слишком большой» и прочие сбои загрузки.
app.use((err, req, res, next) => {
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.name === 'MulterError')) {
    const gb = (config.MAX_FILE_SIZE / 1024 ** 3).toFixed(0);
    return res.status(413).json({ error: `Файл слишком большой. Максимум ${gb} ГБ` });
  }
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

storage.ensureDirs();
startSweeper();

app.listen(config.PORT, config.HOST, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  EasyFiles v2.0 — сервер запущен');
  console.log(`  Локально:   http://localhost:${config.PORT}`);
  for (const addr of lanAddresses(config.PORT)) {
    console.log(`  Лок. сеть:  ${addr}`);
  }
  if (config.PUBLIC_BASE_URL) console.log(`  Публично:   ${config.PUBLIC_BASE_URL}`);
  console.log(`  Папка данных: ${config.DATA_DIR}`);
  if (!config.ADMIN_KEY) console.log('  ⚠ Админ-панель отключена (задайте ADMIN_KEY)');
  console.log('═══════════════════════════════════════════');
});
