/* ============================================================
   shot.mjs — 通过 Chrome DevTools Protocol 分段截图 + 页面诊断
   用法：node tools/shot.mjs [desktop|mobile|both] [--out dir] [--diag]
   先起静态服务：npx serve . -l 5173（或设 SHOT_URL）
   依赖：Node ≥ 22（内置 WebSocket）、本机 Chrome
   ============================================================ */
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const URL = process.env.SHOT_URL || 'http://127.0.0.1:5173/';
const mode = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'both';
const outIdx = process.argv.indexOf('--out');
const OUT = resolve(outIdx > 0 ? process.argv[outIdx + 1] : '.shots');
const DIAG = process.argv.includes('--diag');
mkdirSync(OUT, { recursive: true });

const PORT = 9333;
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitPort() {
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return; } catch {}
    await sleep(250);
  }
  throw new Error('Chrome 调试端口未就绪');
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = [];
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) { const { res, rej } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
      else if (msg.method) this.events.push(msg);
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async eval(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result.value; }
}

async function openTab() {
  const t = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const c = new CDP(ws);
  await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Log.enable');
  return c;
}

const targets = [];
if (mode !== 'mobile') targets.push({ name: 'desktop', w: 1440, h: 900, mobile: false });
if (mode !== 'desktop') targets.push({ name: 'mobile', w: 390, h: 844, mobile: true });
const anchors = ['top', 'dashboard', 'd24', 'd25', 'fish', 'd26', 'd27', 'food', 'album', 'hotels', 'transit', 'finale'];

await waitPort();
try {
  for (const t of targets) {
    const c = await openTab();
    await c.send('Emulation.setDeviceMetricsOverride', { width: t.w, height: t.h, deviceScaleFactor: 1, mobile: t.mobile });
    if (t.mobile) await c.send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await c.send('Page.navigate', { url: `${URL}?static=1` });
    await sleep(2500);
    // 等字体与首屏图
    await c.eval('document.fonts.ready.then(()=>1)');
    await sleep(800);

    const errors = c.events.filter((e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'))
      .map((e) => e.method === 'Runtime.exceptionThrown' ? e.params.exceptionDetails.text + ' ' + (e.params.exceptionDetails.exception?.description || '') : e.params.entry.text);
    if (errors.length) console.log(`[${t.name}] 控制台错误：\n  ` + errors.join('\n  '));

    if (DIAG) {
      const d = await c.eval(`(() => {
        const q = (s) => document.querySelector(s);
        const rect = (s) => { const el = q(s); if (!el) return 'missing'; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { x: r.x|0, y: r.y|0, w: r.width|0, h: r.height|0, op: cs.opacity, vis: cs.visibility, disp: cs.display, color: cs.color, tf: cs.transform }; };
        return {
          scrollH: document.documentElement.scrollHeight,
          dashboard: rect('#dashboard'), dashGrid: rect('#dashGrid'), ticket: rect('.ticket'), secTitle: rect('#dashboard .sec-title'),
          day: rect('#d25'), ev: rect('#d25 .ev'), food: rect('.food-card'), tile: rect('.tile'), grain: rect('.grain'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
          inCount: document.querySelectorAll('.in').length, revealCount: document.querySelectorAll('.reveal,.reveal-pop,.reveal-track,.reveal-stagger,.reveal-img').length,
        };
      })()`);
      console.log(`[${t.name}] 诊断：`, JSON.stringify(d, null, 1));
    }

    for (const a of anchors) {
      await c.eval(`(() => { const el = document.getElementById(${JSON.stringify(a)}); if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' }); return window.scrollY; })()`);
      await sleep(900);
      const shot = await c.send('Page.captureScreenshot', { format: 'png' });
      const file = resolve(OUT, `${t.name}-${a}.png`);
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(`${t.name} #${a} -> ${file}`);
    }
    c.ws.close();
  }
} finally {
  chrome.kill();
}
