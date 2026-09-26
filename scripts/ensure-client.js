// Перед запуском сервера убеждаемся, что серверные зависимости на месте
// и клиент собран. Если нет — устанавливаем и собираем автоматически,
// чтобы после git clone работал просто `npm start`.
const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.join(__dirname, '..');
const serverDir = path.join(root, 'server');
const clientDir = path.join(root, 'client');
const distIndex = path.join(clientDir, 'dist', 'index.html');

function run(cmd, cwd) {
  console.log(`> ${cmd} (${path.relative(root, cwd) || '.'})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

if (!fs.existsSync(path.join(serverDir, 'node_modules'))) {
  run('npm install', serverDir);
}

if (fs.existsSync(distIndex)) process.exit(0);

console.log('\nКлиент не собран — собираю (нужно один раз после клонирования)...\n');

if (!fs.existsSync(path.join(clientDir, 'node_modules'))) {
  run('npm install', clientDir);
}

run('npm run build', clientDir);

console.log('\nКлиент собран.\n');
