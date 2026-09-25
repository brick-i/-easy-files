async function parseResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // не JSON — оставим null
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Ошибка ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function uploadFile(file, opts, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    form.append('ttl', String(opts.ttl));
    form.append('maxDownloads', String(opts.maxDownloads));
    if (opts.password) form.append('password', opts.password);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded, e.total);
    });
    xhr.addEventListener('load', () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // пустой или не-JSON ответ
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data?.error || `Ошибка ${xhr.status}`));
    });
    xhr.addEventListener('error', () => reject(new Error('Ошибка сети — сервер недоступен')));
    xhr.addEventListener('abort', () => reject(new Error('Загрузка отменена')));
    xhr.open('POST', '/api/upload');
    xhr.send(form);
  });
}

export const getInfo = (id) => fetch(`/api/file/${id}`).then(parseResponse);

export const verifyPassword = (id, password) =>
  fetch(`/api/verify/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(parseResponse);

export const deleteFile = (id, deleteToken) =>
  fetch(`/api/file/${id}`, { method: 'DELETE', headers: { 'x-delete-token': deleteToken } }).then(parseResponse);

export const adminList = (key) =>
  fetch('/api/admin/files', { headers: { 'x-admin-key': key } }).then(parseResponse);

export const adminDelete = (key, id) =>
  fetch(`/api/admin/files/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } }).then(parseResponse);
