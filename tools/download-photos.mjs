#!/usr/bin/env node
/* ============================================================
   download-photos.mjs — 把 js/photos.js 里的外链图片下载到本地
   用法：node tools/download-photos.mjs [--width 1600] [--force]
   结果：assets/img/<slot>.jpg，并生成 js/photos.local.js
         （在 index.html 中于 photos.js 之后引入即可切换为本地图）
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const WIDTH = Number(args[args.indexOf('--width') + 1]) || 1600;
const FORCE = args.includes('--force');

const src = readFileSync(resolve(ROOT, 'js/photos.js'), 'utf8');
// photos.js 以 window.PHOTOS = {...} 形式声明，这里模拟 window
const win = {};
new Function('window', src)(win);
const photos = win.PHOTOS;
if (!photos) { console.error('未能读取 window.PHOTOS'); process.exit(1); }

const outDir = resolve(ROOT, 'assets/img');
mkdirSync(outDir, { recursive: true });

function remoteURL(base) {
  return base.includes('images.pexels.com')
    ? `${base}?auto=compress&cs=tinysrgb&w=${WIDTH}`
    : `${base}?auto=format&fit=max&q=80&w=${WIDTH}`;
}

const local = {};
let ok = 0, skip = 0, fail = 0;
for (const [slot, p] of Object.entries(photos)) {
  if (!p.base) { skip++; continue; }
  const file = resolve(outDir, `${slot}.jpg`);
  if (existsSync(file) && !FORCE) { local[slot] = `assets/img/${slot}.jpg`; skip++; continue; }
  try {
    const res = await fetch(remoteURL(p.base), { headers: { 'User-Agent': 'moonlit-bay-trip/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    local[slot] = `assets/img/${slot}.jpg`;
    ok++;
    console.log(`✓ ${slot}`);
  } catch (e) {
    fail++;
    console.error(`✗ ${slot}: ${e.message}`);
  }
}

const out = `/* 自动生成：node tools/download-photos.mjs · 本地图覆盖外链，在 photos.js 之后引入 */\n` +
  `(function () {\n  var L = ${JSON.stringify(local, null, 2)};\n` +
  `  Object.keys(L).forEach(function (k) { if (window.PHOTOS[k]) window.PHOTOS[k].img = L[k]; });\n})();\n`;
writeFileSync(resolve(ROOT, 'js/photos.local.js'), out);
console.log(`\n完成：下载 ${ok}，跳过 ${skip}，失败 ${fail}。已写入 js/photos.local.js`);
console.log('启用：在 index.html 里 <script src="js/photos.js"></script> 之后加 <script src="js/photos.local.js"></script>');
