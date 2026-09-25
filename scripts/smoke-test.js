#!/usr/bin/env node
// Смоук-тест API EasyFiles.
// Запуск: node scripts/smoke-test.js [baseURL] [adminKey]
// Пример: node scripts/smoke-test.js http://localhost:3001 my-admin-key

const base = (process.argv[2] || 'http://localhost:3001').replace(/\/+$/, '');
const adminKey = process.argv[3] || '';

let passed = 0;
let failed = 0;

function check(name, cond, extra = '') {
  if (cond) {
    passed++;
    console.log(`  \u2714 ${name}`);
  } else {
    failed++;
    console.log(`  \u2718 ${name} ${extra}`);
  }
}

const upload = async (content, filename, fields = {}) => {
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/plain' }), filename);
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
  const res = await fetch(`${base}/api/upload`, { method: 'POST', body: form });
  return { status: res.status, data: await res.json() };
};

const download = async (id, body) =>
  fetch(`${base}/api/download/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });

async function main() {
  console.log(`\nEasyFiles smoke test \u2192 ${base}\n`);

  // --- health и SPA ---
  const health = await (await fetch(`${base}/api/health`)).json();
  check('health: ok', health.ok === true);

  const spa = await fetch(`${base}/download/some-id`);
  const spaText = await spa.text();
  check('SPA: /download/... отдаёт index.html', spa.ok && spaText.includes('<div id="root">'));

  // --- обычная загрузка ---
  const { data: up } = await upload('hello easyfiles', 'тест.txt', { ttl: 86400 });
  check('upload: вернулся id', !!up.id);
  check('upload: вернулся deleteToken', !!up.deleteToken);
  check('upload: ссылка содержит /download/', up.link?.includes(`/download/${up.id}`));
  check('upload: имя файла сохранилось (кириллица)', up.originalName === 'тест.txt', `got "${up.originalName}"`);

  const info = await (await fetch(`${base}/api/file/${up.id}`)).json();
  check('info: имя и размер', info.originalName === 'тест.txt' && info.size === 15);
  check('info: hasPassword=false', info.hasPassword === false);

  const dl = await download(up.id);
  const dlText = await dl.text();
  check('download: 200 и содержимое', dl.status === 200 && dlText === 'hello easyfiles');

  const infoAfter = await (await fetch(`${base}/api/file/${up.id}`)).json();
  check('info: счётчик скачиваний = 1', infoAfter.downloads === 1);

  // --- удаление ---
  const delWrong = await fetch(`${base}/api/file/${up.id}`, {
    method: 'DELETE',
    headers: { 'x-delete-token': 'wrong-token' },
  });
  check('delete: чужой токен → 403', delWrong.status === 403);

  const delOk = await fetch(`${base}/api/file/${up.id}`, {
    method: 'DELETE',
    headers: { 'x-delete-token': up.deleteToken },
  });
  check('delete: свой токен → ok', delOk.status === 200);

  const delInfo = await fetch(`${base}/api/file/${up.id}`);
  check('delete: после удаления → 404', delInfo.status === 404);

  // --- пароль + лимит скачиваний ---
  const upPw = await upload('secret-data', 'secret.txt', {
    ttl: 3600,
    password: 'пароль123',
    maxDownloads: 1,
  });
  check('upload+пароль: hasPassword=true', upPw.data.hasPassword === true);
  check('upload+пароль: expiresAt в пределах часа', upPw.data.expiresAt && Date.parse(upPw.data.expiresAt) - Date.now() <= 3600_000);
  const pwId = upPw.data.id;

  const badPw = await fetch(`${base}/api/verify/${pwId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'wrong' }),
  });
  check('verify: неверный пароль → 403', badPw.status === 403);

  const okPw = await fetch(`${base}/api/verify/${pwId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'пароль123' }),
  });
  check('verify: верный пароль → 200', okPw.status === 200);

  const noPwDl = await download(pwId);
  check('download: без пароля → 403', noPwDl.status === 403);

  const pwDl = await download(pwId, { password: 'пароль123' });
  const pwText = await pwDl.text();
  check('download: с паролем → содержимое', pwDl.status === 200 && pwText === 'secret-data');

  const exhausted = await download(pwId, { password: 'пароль123' });
  check('download: лимит исчерпан → 410', exhausted.status === 410);

  // --- валидация параметров ---
  const upOdd = await upload('odd', 'odd.txt', { ttl: 99999, maxDownloads: 5000 });
  check('upload: недопустимый ttl → дефолт 24ч', upOdd.data.expiresAt && Date.parse(upOdd.data.expiresAt) - Date.now() <= 86400_000);
  check('upload: maxDownloads ограничен 1000', upOdd.data.maxDownloads === 1000);
  await fetch(`${base}/api/file/${upOdd.data.id}`, {
    method: 'DELETE',
    headers: { 'x-delete-token': upOdd.data.deleteToken },
  });

  // --- админка ---
  if (adminKey) {
    const noKey = await fetch(`${base}/api/admin/files`);
    check('admin: без ключа → 401/403', noKey.status === 401 || noKey.status === 403);

    const withKey = await fetch(`${base}/api/admin/files`, { headers: { 'x-admin-key': adminKey } });
    const adminData = await withKey.json();
    check('admin: список с ключом → 200', withKey.status === 200);
    check('admin: в списке есть статистика', typeof adminData.stats?.count === 'number');

    const adminDel = await fetch(`${base}/api/admin/files/${pwId}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey },
    });
    check('admin: удаление исчерпанного файла → ok', adminDel.status === 200);
  } else {
    console.log('  \u26A0 Admin-тесты пропущены (не передан adminKey)');
  }

  // --- прямая раздача uploads закрыта ---
  const direct = await fetch(`${base}/uploads/anything.txt`);
  check('безопасность: /uploads не раздаётся напрямую', direct.status !== 200);

  console.log(`\nИтог: ${passed} прошло, ${failed} упало\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('Тест упал:', err.message);
  process.exit(1);
});
