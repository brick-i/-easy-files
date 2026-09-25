export function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} КБ`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} МБ`;
  return `${(bytes / 1073741824).toFixed(2)} ГБ`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EXT_MAP = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'heic', 'avif', 'tiff'],
  video: ['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', 'mpeg', 'ts'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus', 'wma'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'cab'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'csv', 'epub'],
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'json', 'html', 'css', 'php', 'java', 'c', 'cpp', 'cs', 'go', 'rs', 'sh', 'bat', 'xml', 'yml', 'yaml', 'sql'],
};

export function fileCategory(name = '') {
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  for (const [category, exts] of Object.entries(EXT_MAP)) {
    if (exts.includes(ext)) return category;
  }
  return 'file';
}
