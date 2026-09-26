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

// Раздаём собранный клиент (client/dist). Папка uploads наружу напрямую не отдаётся —
// все файлы проходят через /api/download с проверкой пароля, срока и лимитов.
const distDir = path.join(__dirname, '..', 'client', 'dist');
const distIndex = path.join(distDir, 'index.html');
app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  // пути с расширением (например /uploads/file.txt) — это не маршруты SPA
  if (path.extname(req.path)) return res.status(404).json({ error: 'Не найдено' });
  if (!fs.existsSync(distIndex)) {
    return res.status(503).type('html').send(
      '<meta charset="utf-8"><title>EasyFiles</title>' +
      '<div style="font-family:sans-serif;max-width:560px;margin:80px auto;padding:32px;color:#e9eef8;background:#0b1120;border:1px solid #2a3550;border-radius:14px">' +
      '<h1 style="margin:0 0 12px">Клиент ещё не собран</h1>' +
      '<p style="color:#94a1bb">Сервер работает, но интерфейс нужно собрать один раз. В папке проекта выполните:</p>' +
      '<pre style="background:#05070d;border:1px solid #2a3550;border-radius:8px;padding:14px;overflow:auto"><code>npm run install-all\nnpm run build</code></pre>' +
      '<p style="color:#94a1bb">…или просто перезапустите <code>npm start</code> — он соберёт клиент автоматически.</p>' +
      '</div>',
    );
  }
  res.sendFile(distIndex);
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
  if (!fs.existsSync(distIndex)) {
    console.log('');
    console.log('  ⚠ Клиент не собран — страницы пока не откроются.');
    console.log('    Перезапустите npm start — клиент соберётся автоматически.');
  }
  if (!config.ADMIN_KEY) console.log('  ⚠ Админ-панель отключена (задайте ADMIN_KEY)');
  console.log('═══════════════════════════════════════════');
});
