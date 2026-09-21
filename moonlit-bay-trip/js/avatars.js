/* ============================================================
   avatars.js — 四人头像接入（设计方案260922）
   依赖：js/main.js 已完成渲染（本脚本在其后加载）
   头像文件：assets/avatar/*.jpg（320×320 方图）
   未配置头像的成员自动退回文本名条。
   ============================================================ */

(function () {
  'use strict';

  var AVATARS = {
    '君药': 'assets/avatar/junyao.jpg',
    'Yana': 'assets/avatar/yana.jpg',
    '江澈': 'assets/avatar/jiangche.jpg',
    '陳': 'assets/avatar/chen.jpg',
  };

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function ava(name, cls) {
    var src = AVATARS[name];
    if (!src) return '';
    return '<img class="' + cls + '" src="' + src + '" alt="' + esc(name) + '" width="52" height="52" loading="lazy" decoding="async">';
  }

  /* 双人徽章（Hero / 尾声） */
  function duoHTML(c) {
    if (!AVATARS[c.a] || !AVATARS[c.b]) return null;
    return '<span class="duo duo--' + c.cls + '">' +
      '<span class="duo__pair">' + ava(c.a, 'duo__ava duo__ava--a') + ava(c.b, 'duo__ava duo__ava--b') + '</span>' +
      '<span class="duo__names">' + esc(c.a) + '<span class="duo__amp">&amp;</span>' + esc(c.b) + '</span>' +
      '</span>';
  }

  /* 小头像对（分叉列标题 / 汇合节点） */
  function miniPair(c, size) {
    if (!AVATARS[c.a] || !AVATARS[c.b]) return '';
    var s = size || 28;
    return '<span class="mini-pair mini-pair--' + c.cls + '">' +
      '<img src="' + AVATARS[c.a] + '" alt="' + esc(c.a) + '" width="' + s + '" height="' + s + '" loading="lazy">' +
      '<img src="' + AVATARS[c.b] + '" alt="' + esc(c.b) + '" width="' + s + '" height="' + s + '" loading="lazy">' +
      '</span>';
  }

  /* data.js 用顶层 const 声明 TRIP，不在 window 上，这里按词法作用域取 */
  function trip() { return (typeof TRIP !== 'undefined') ? TRIP : window.TRIP; }

  function upgradeSeals(container) {
    if (!container) return;
    var seals = $$('.seal', container);
    var couples = trip().meta.couples;
    seals.forEach(function (el, i) {
      var c = couples[i];
      if (!c) return;
      var html = duoHTML(c);
      if (html) el.outerHTML = html;
    });
  }

  function upgradeFork() {
    var couples = trip().meta.couples;
    var byCls = {};
    couples.forEach(function (c) { byCls[c.cls] = c; });

    $$('.fork__col-title').forEach(function (title) {
      var dot = $('.seal', title);
      var cls = dot && dot.className.indexOf('seal--b') >= 0 ? 'b' : 'a';
      var c = byCls[cls];
      if (!c) return;
      var html = miniPair(c);
      if (html && dot) dot.outerHTML = html;
    });

    $$('.junction').forEach(function (j) {
      var a = byCls.a, b = byCls.b;
      if (!a || !b) return;
      var lamps = $('.junction__lamps', j);
      var crewA = '<span class="junction__crew junction__crew--a">' + miniPair(a, 32) + '</span>';
      var crewB = '<span class="junction__crew junction__crew--b">' + miniPair(b, 32) + '</span>';
      if (lamps) {
        lamps.insertAdjacentHTML('beforebegin', crewA);
        lamps.insertAdjacentHTML('afterend', crewB);
      } else {
        j.insertAdjacentHTML('afterbegin', crewA);
        j.insertAdjacentHTML('beforeend', crewB);
      }
    });
  }

  function init() {
    var t = trip();
    if (!t || !t.meta || !t.meta.couples) return;
    upgradeSeals($('#heroSeals'));
    upgradeSeals($('#finaleSeals'));
    upgradeFork();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
