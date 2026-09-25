const os = require('node:os');

// multer в multipart заголовках отдаёт имя файла в latin1 — кириллица
// превращается в "Ð¤Ð°Ð¹Ð». Пробуем декодировать, если похоже на брак.
function decodeFilename(originalName = '') {
  const decoded = Buffer.from(originalName, 'latin1').toString('utf8');
  const looksMojibake = /[ÐÑÃÂ]/.test(originalName);
  const decodedLooksReadable = /[\u0400-\u04ff]/.test(decoded) || !decoded.includes('\uFFFD');
  const name = looksMojibake && decodedLooksReadable ? decoded : originalName;

  return name.replace(/[\x00-\x1f\x7f]/g, '').trim() || 'file';
}

function getPublicOrigin(req, publicBaseUrl) {
  if (publicBaseUrl) return publicBaseUrl;

  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${proto}://${host}`;
}

// Адреса сервера в локальной сети — чтобы показать в консоли при старте.
function lanAddresses(port) {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const net of list || []) {
      if (net.family === 'IPv4' && !net.internal) {
        out.push(`http://${net.address}:${port}`);
      }
    }
  }
  return out;
}

module.exports = { decodeFilename, getPublicOrigin, lanAddresses };
