'use strict';

// Pós-build: copia o esquema SQL e os manifestos para dist/ e registra metadados do build.
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const dist = path.join(raiz, 'dist');

fs.cpSync(path.join(raiz, 'db'), path.join(dist, 'db'), { recursive: true });
for (const arquivo of ['package.json', 'package-lock.json']) {
  fs.copyFileSync(path.join(raiz, arquivo), path.join(dist, arquivo));
}

if (!fs.existsSync(path.join(dist, 'src', 'server.js'))) {
  throw new Error('Build inválido: dist/src/server.js não foi gerado');
}

const info = {
  versao: JSON.parse(fs.readFileSync(path.join(raiz, 'package.json'), 'utf8')).version,
  commit: process.env.GITHUB_SHA || 'local',
  data: new Date().toISOString(),
};
fs.writeFileSync(path.join(dist, 'build-info.json'), JSON.stringify(info, null, 2));
console.log('Build concluído:', info);
