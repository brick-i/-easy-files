const config = require('../config');
const storage = require('./storage');
const { isExpired, isExhausted } = require('./security');

// Удаляет файлы с истёкшим сроком или исчерпанным лимитом скачиваний.
function sweepOnce() {
  let removed = 0;
  for (const meta of storage.listMetas()) {
    if (isExpired(meta) || isExhausted(meta)) {
      storage.removeFile(meta);
      removed++;
    }
  }
  return removed;
}

function startSweeper() {
  const initial = sweepOnce();
  if (initial) console.log(`[cleanup] Удалено просроченных файлов: ${initial}`);

  const timer = setInterval(() => {
    try {
      const removed = sweepOnce();
      if (removed) console.log(`[cleanup] Удалено просроченных файлов: ${removed}`);
    } catch (err) {
      console.error('[cleanup] Ошибка очистки:', err.message);
    }
  }, config.SWEEP_INTERVAL_MS);

  timer.unref();
}

module.exports = { sweepOnce, startSweeper };
