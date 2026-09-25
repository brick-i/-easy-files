const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');

const uploadsDir = path.join(config.DATA_DIR, 'uploads');
const metaDir = path.join(config.DATA_DIR, 'meta');

function ensureDirs() {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(metaDir, { recursive: true });
}

const metaPath = (id) => path.join(metaDir, path.basename(id) + '.json');
const storedPath = (storedName) => path.join(uploadsDir, path.basename(storedName));

function readMeta(id) {
  const p = metaPath(id);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function writeMeta(meta) {
  fs.writeFileSync(metaPath(meta.id), JSON.stringify(meta, null, 2));
}

function removeFile(meta) {
  const stored = storedPath(meta.storedName);
  if (fs.existsSync(stored)) fs.unlinkSync(stored);
  const m = metaPath(meta.id);
  if (fs.existsSync(m)) fs.unlinkSync(m);
}

function listMetas() {
  if (!fs.existsSync(metaDir)) return [];
  return fs
    .readdirSync(metaDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(metaDir, f), 'utf-8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

module.exports = { uploadsDir, metaDir, ensureDirs, metaPath, storedPath, readMeta, writeMeta, removeFile, listMetas };
