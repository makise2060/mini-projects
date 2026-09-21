/* ============================================================
   main.js — 渲染与交互（260921 改版）
   月满湾区 · 四人之行
   依赖：js/photos.js（PHOTOS）、js/data.js（TRIP）
   ============================================================ */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SMOOTH = REDUCED ? 'auto' : 'smooth';
  var FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  /* ?static=1：跳过入场动画，全部直接呈现（截图 / 打印 / 低性能设备） */
  var STATIC = /[?&]static=1/.test(location.search);
  var PH = window.PHOTOS || {};

  /* ============================================================
     一、图片解析（slot → 实拍 URL / 兜底插画）
     ============================================================ */

  function photo(slot) { return PH[slot] || null; }
  /* 本地图（img 字段）在 photos.js 里可能没写 base，统一兜底 */
  function photoBase(p) { return p.base || p.img; }

  /* 图床 URL：Pexels 与 Unsplash 均走 imgix 风格参数，按 base 域名区分 */
  function unsplashURL(base, w, ratio) {
    var q;
    if (base.indexOf('images.pexels.com') >= 0) {
      q = '?auto=compress&cs=tinysrgb&fit=crop&w=' + w;
    } else {
      q = '?auto=format&fit=crop&crop=entropy&q=78&w=' + w;
    }
    if (ratio) q += '&h=' + Math.round(w / ratio);
    return base + q;
  }

  function providerName(p) {
    if (p.provider) return p.provider;
    return (p.base || p.img || '').indexOf('pexels') >= 0 ? 'Pexels' : 'Unsplash';
  }

  /* 生成 <img>：w 为主宽度，ratio 可选（w/h），sizes 描述 */
  function imgHTML(slot, opts) {
    var p = photo(slot);
    if (!p) return null;
    opts = opts || {};
    var w = opts.w || 900;
    var ratio = opts.ratio || null;
    var widths = [Math.round(w * 0.5), w, Math.round(w * 1.6)];
    var src = p.img ? p.img : unsplashURL(p.base, w, ratio);
    var srcset = p.img ? '' : widths.map(function (x) { return unsplashURL(p.base, x, ratio) + ' ' + x + 'w'; }).join(', ');
    var pos = p.pos ? ' style="object-position:' + p.pos + '"' : '';
    return '<img class="ph" src="' + src + '"' +
      (srcset ? ' srcset="' + srcset + '" sizes="' + (opts.sizes || '(max-width: 767px) 100vw, 50vw') + '"' : '') +
      ' alt="' + esc(opts.alt || p.alt || '') + '" loading="' + (opts.eager ? 'eager' : 'lazy') + '" decoding="async"' +
      ' data-photo-slot="' + slot + '"' + pos + '>';
  }

  /* 图片加载态：加载完成去掉 shimmer */
  document.addEventListener('load', function (ev) {
    var t = ev.target;
    if (t && t.tagName === 'IMG' && t.classList.contains('ph')) t.classList.add('loaded');
  }, true);

  /* ============================================================
     二、SVG 插画体系（兜底 + 装饰）
     ============================================================ */

  function svg(vb, inner, ratio) {
    return '<svg viewBox="' + vb + '" preserveAspectRatio="' + (ratio || 'xMidYMid meet') +
      '" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /* —— 连续月相：ill ∈ [0,1]，dir = wax | wane | full —— */
  var moonUid = 0;
  function moonSVG(ill, dir, size, opts) {
    opts = opts || {};
    var s = size || 26;
    var id = 'mc' + (moonUid++);
    var r = 18, cx = 20, cy = 20;
    var lit;
    if (ill >= 0.995) {
      lit = '<circle cx="20" cy="20" r="18" fill="' + (opts.fill || 'var(--lamp)') + '"/>';
    } else {
      var k = Math.max(0, Math.min(1, ill));
      var rx, sweep;
      if (k >= 0.5) { rx = (2 * k - 1) * r; sweep = 1; }
      else          { rx = (1 - 2 * k) * r; sweep = 0; }
      rx = Math.max(rx, 0.01);
      var d = 'M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
        ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + sweep + ' ' + cx + ' ' + (cy - r) + ' Z';
      var tf = dir === 'wane' ? ' transform="translate(40 0) scale(-1 1)"' : '';
      lit = '<path d="' + d + '" fill="' + (opts.fill || 'var(--lamp)') + '"' + tf + '/>';
    }
    var craters = ill >= 0.9
      ? '<circle cx="14" cy="13" r="2.4" fill="rgba(43,43,43,.08)"/><circle cx="26" cy="24" r="3.2" fill="rgba(43,43,43,.07)"/>'
      : '';
    return '<svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="' + id + '"><circle cx="20" cy="20" r="18"/></clipPath></defs>' +
      '<circle cx="20" cy="20" r="18" fill="' + (opts.dark || 'rgba(35,33,30,.16)') + '"/>' +
      '<g clip-path="url(#' + id + ')">' + lit + craters + '</g>' +
      '<circle cx="20" cy="20" r="17.5" fill="none" stroke="' + (opts.stroke || 'rgba(35,33,30,.18)') + '" stroke-width="1"/></svg>';
  }

  /* —— 食物图形（96×96） —— */
  var FOOD_ICONS = {
    steamer: function () {
      return svg('0 0 96 96',
        '<path d="M30 36 q4 -8 0 -14 M48 32 q4 -8 0 -14 M66 36 q4 -8 0 -14" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/>' +
        '<ellipse cx="48" cy="50" rx="34" ry="8" fill="var(--accent-strong)"/>' +
        '<circle cx="32" cy="44" r="9" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<circle cx="48" cy="42" r="9" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<circle cx="64" cy="44" r="9" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<rect x="14" y="50" width="68" height="22" rx="6" fill="var(--accent)"/>' +
        '<ellipse cx="48" cy="74" rx="36" ry="5" fill="var(--accent-strong)"/>');
    },
    teacup: function () {
      return svg('0 0 96 96',
        '<ellipse cx="48" cy="38" rx="24" ry="6" fill="var(--accent)"/>' +
        '<path d="M26 42 h44 l-5 30 a6 6 0 0 1 -6 5 h-22 a6 6 0 0 1 -6 -5 z" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<ellipse cx="48" cy="80" rx="30" ry="4.5" fill="var(--accent-strong)"/>');
    },
    roll: function () {
      return svg('0 0 96 96',
        '<ellipse cx="48" cy="72" rx="36" ry="9" fill="var(--accent-strong)"/>' +
        '<rect x="20" y="42" width="30" height="16" rx="8" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5" transform="rotate(-8 35 50)"/>' +
        '<rect x="42" y="46" width="32" height="16" rx="8" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5" transform="rotate(6 58 54)"/>');
    },
    congee: function () {
      return svg('0 0 96 96',
        '<path d="M18 46 h60 a30 26 0 0 1 -60 0 z" fill="var(--accent-strong)"/>' +
        '<ellipse cx="48" cy="46" rx="30" ry="8" fill="#FFFFFF"/>');
    },
    streetfood: function () {
      return svg('0 0 96 96',
        '<circle cx="78" cy="18" r="7" fill="var(--lamp)"/>' +
        '<path d="M16 52 h64 a32 24 0 0 1 -64 0 z" fill="var(--accent)"/>' +
        '<ellipse cx="48" cy="52" rx="32" ry="7" fill="#FFFFFF"/>');
    },
    milk: function () {
      return svg('0 0 96 96',
        '<path d="M30 34 h36 l-3 40 a6 6 0 0 1 -6 5 h-18 a6 6 0 0 1 -6 -5 z" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<ellipse cx="48" cy="34" rx="18" ry="6" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="2"/>');
    },
    goose: function () {
      return svg('0 0 96 96',
        '<ellipse cx="48" cy="54" rx="26" ry="28" fill="var(--accent-strong)"/>' +
        '<ellipse cx="48" cy="88" rx="20" ry="4" fill="var(--accent)" opacity=".5"/>');
    },
    feast: function () {
      return svg('0 0 96 96',
        '<circle cx="48" cy="38" r="13" fill="var(--accent-strong)"/>' +
        '<ellipse cx="48" cy="70" rx="30" ry="10" fill="var(--accent-strong)"/>');
    }
  };

  /* —— 相册场景兜底（简化版） —— */
  function sceneFallback() {
    return svg('0 0 120 160',
      '<circle cx="92" cy="30" r="14" fill="var(--lamp)"/>' +
      '<path d="M10 150 h100" stroke="var(--accent-ink)" stroke-width="2" opacity=".35"/>' +
      '<rect x="30" y="98" width="60" height="48" fill="var(--accent-strong)"/>' +
      '<path d="M12 100 Q60 56 108 100" fill="none" stroke="var(--accent-ink)" stroke-width="6" stroke-linecap="round"/>');
  }

  /* —— 鱼灯（大） —— */
  function fishLanternSVG() {
    return svg('0 0 200 240',
      '<line x1="100" y1="0" x2="100" y2="20" stroke="rgba(250,232,195,.55)" stroke-width="2"/>' +
      '<circle cx="100" cy="22" r="3" fill="#F8D989"/>' +
      '<circle cx="100" cy="118" r="78" fill="rgba(250,199,117,.14)"/>' +
      '<circle cx="100" cy="118" r="56" fill="rgba(250,199,117,.18)"/>' +
      '<path d="M168 106 l30 -17 -9 23 14 4 -11 19 -24 -11 z" fill="#EF9F27" stroke="#B4632C" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="102" cy="118" rx="60" ry="44" fill="#EF9F27"/>' +
      '<ellipse cx="102" cy="132" rx="60" ry="30" fill="#F8D989" opacity=".6"/>' +
      '<path d="M66 104 q8 9 16 0 M96 98 q8 9 16 0 M126 104 q8 9 16 0 M80 122 q8 9 16 0 M110 118 q8 9 16 0" stroke="#B4632C" stroke-width="2.5" fill="none" opacity=".6"/>' +
      '<path d="M90 76 q12 -24 34 -15 q-11 8 -9 19 z" fill="#F5C4B3" stroke="#B4632C" stroke-width="2.5"/>' +
      '<path d="M92 162 q11 19 30 11 q-9 -9 -7 -17 z" fill="#F5C4B3" stroke="#B4632C" stroke-width="2.5"/>' +
      '<circle cx="62" cy="108" r="6.5" fill="#4A1B0C"/><circle cx="64" cy="106" r="2.2" fill="#FFF"/>' +
      '<path d="M44 124 q4 5 11 3" stroke="#4A1B0C" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<line x1="102" y1="162" x2="102" y2="184" stroke="#B4632C" stroke-width="2"/>' +
      '<line x1="95" y1="184" x2="95" y2="202" stroke="#B4632C" stroke-width="1.5"/>' +
      '<line x1="102" y1="184" x2="102" y2="206" stroke="#B4632C" stroke-width="1.5"/>' +
      '<line x1="109" y1="184" x2="109" y2="202" stroke="#B4632C" stroke-width="1.5"/>' +
      '<circle cx="102" cy="210" r="4" fill="#F8D989"/>');
  }

  /* —— 游动小鱼灯（侧视） —— */
  function fishSwimSVG() {
    return svg('0 0 120 60',
      '<path d="M8 30 l22 -14 -4 14 4 14 z" fill="#EF9F27" stroke="#B4632C" stroke-width="2" stroke-linejoin="round"/>' +
      '<ellipse cx="66" cy="30" rx="40" ry="20" fill="#EF9F27"/>' +
      '<ellipse cx="66" cy="36" rx="40" ry="12" fill="#F8D989" opacity=".6"/>' +
      '<path d="M50 24 q5 6 10 0 M66 20 q5 6 10 0 M82 24 q5 6 10 0 M58 34 q5 6 10 0 M76 32 q5 6 10 0" stroke="#B4632C" stroke-width="1.6" fill="none" opacity=".6"/>' +
      '<path d="M60 12 q8 -12 22 -6 q-8 4 -6 12 z" fill="#F5C4B3" stroke="#B4632C" stroke-width="1.6"/>' +
      '<circle cx="94" cy="26" r="4" fill="#4A1B0C"/><circle cx="95" cy="25" r="1.4" fill="#FFF"/>');
  }

  /* —— 交通图标（16×16） —— */
  var T_ICONS = {
    plane: function () { return svg('0 0 16 16', '<path d="M1 8 L15 2 L9 15 L7 9 Z" fill="var(--accent-strong)"/>'); },
    car: function () {
      return svg('0 0 16 16',
        '<path d="M2 10 l1.5 -4 a1.5 1.5 0 0 1 1.4 -1 h6.2 a1.5 1.5 0 0 1 1.4 1 l1.5 4 z" fill="var(--accent-strong)"/>' +
        '<rect x="1.5" y="10" width="13" height="3" rx="1.5" fill="var(--accent-strong)"/>' +
        '<circle cx="4.5" cy="13.5" r="1.6" fill="var(--accent-ink)"/><circle cx="11.5" cy="13.5" r="1.6" fill="var(--accent-ink)"/>');
    },
    metro: function () {
      return svg('0 0 16 16',
        '<rect x="3" y="1.5" width="10" height="10" rx="2.5" fill="var(--accent-strong)"/>' +
        '<rect x="4.5" y="3.5" width="7" height="3" rx="1" fill="#FFF6E8"/>' +
        '<path d="M3 12.5 l-1.5 2.5 M13 12.5 l1.5 2.5" stroke="var(--accent-strong)" stroke-width="1.8" stroke-linecap="round"/>');
    },
    train: function () {
      return svg('0 0 16 16',
        '<rect x="3" y="1.5" width="10" height="10" rx="2.5" fill="var(--accent-strong)"/>' +
        '<rect x="4.5" y="3.5" width="7" height="3" rx="1" fill="#FFF6E8"/>' +
        '<circle cx="5.5" cy="9" r="1" fill="var(--lamp)"/><circle cx="10.5" cy="9" r="1" fill="var(--lamp)"/>' +
        '<path d="M2 15 l2.5 -3 M14 15 l-2.5 -3" stroke="var(--accent-strong)" stroke-width="1.8" stroke-linecap="round"/>');
    },
    bike: function () {
      return svg('0 0 16 16',
        '<circle cx="3.5" cy="11" r="2.6" fill="none" stroke="var(--accent-strong)" stroke-width="1.6"/>' +
        '<circle cx="12.5" cy="11" r="2.6" fill="none" stroke="var(--accent-strong)" stroke-width="1.6"/>' +
        '<path d="M3.5 11 L7 5.5 H10.5 M7 5.5 L9.5 11 H12.5 M10.5 5.5 l1.5 -1.5" stroke="var(--accent-strong)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');
    }
  };

  var BED_ICON = svg('0 0 16 16',
    '<path d="M1.5 13.5 V4.5 M1.5 8.5 H14.5 V13.5 M14.5 13.5 V10.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="4.6" cy="6.6" r="1.6" fill="currentColor"/><path d="M7 8.5 V6.8 a1.7 1.7 0 0 1 3.4 0 V8.5 H14.5 V10.5 H7 z" fill="currentColor"/>');
  var MOVE_ICON = svg('0 0 16 16',
    '<path d="M1.5 8.5 h9 M10.5 8.5 l-2.5 -2.5 M10.5 8.5 l-2.5 2.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="13.5" cy="8.5" r="1.8" fill="currentColor"/>');

  /* ============================================================
     三、渲染
     ============================================================ */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function splitChars(text, cls) {
    return String(text).split('').map(function (c) {
      return '<span class="' + (cls || 't-char') + '">' + esc(c) + '</span>';
    }).join('');
  }

  /* 灯箱集合：{ key: [ {slot,name,line} ] } */
  var LB = { food: [], days: [] };
  var USED_SLOTS = {};
  function useSlot(slot) { if (slot) USED_SLOTS[slot] = true; }
  var dayIdxBySlot = {};

  function lbItemAttr(group, idx, label) {
    return ' data-lightbox="' + group + '" data-idx="' + idx + '" tabindex="0" role="button" aria-label="' + esc(label) + '，放大查看"';
  }

  function registerDayImage(slot, name, line) {
    if (!slot || dayIdxBySlot[slot] !== undefined) return dayIdxBySlot[slot];
    var i = LB.days.length;
    LB.days.push({ slot: slot, name: name, line: line });
    dayIdxBySlot[slot] = i;
    useSlot(slot);
    return i;
  }

  function sealsHTML(dark) {
    var s = TRIP.meta.couples.map(function (c) {
      return '<span class="seal seal--' + c.cls + '"><span class="seal__moon"></span>' +
        esc(c.a) + '<span class="seal__amp">&amp;</span>' + esc(c.b) + '</span>';
    }).join('');
    return s + '<span class="stamp">' + esc(TRIP.meta.stamp) + '</span>';
  }

  function renderHero() {
    var m = TRIP.meta;
    $('#heroKicker').textContent = m.kicker;
    $('#heroTitle').innerHTML = splitChars(m.title);
    $('#heroEn').textContent = m.en;
    $('#heroSub').textContent = m.subtitle;
    $('#heroSeals').innerHTML = sealsHTML();

    var hp = photo(m.heroSlot);
    var img = $('#heroPhoto');
    var hero = $('.hero');
    if (hp) {
      useSlot(m.heroSlot);
      img.src = hp.img || unsplashURL(hp.base, Math.min(2000, Math.max(1200, Math.round(window.innerWidth * 1.3))));
      if (hp.pos) img.style.objectPosition = hp.pos;
      img.alt = hp.alt || '';
      var ready = function () { hero.classList.add('is-ready'); };
      if (img.complete && img.naturalWidth) ready(); else { img.addEventListener('load', ready); img.addEventListener('error', ready); }
      setTimeout(ready, 2500);
    } else {
      hero.classList.add('is-ready');
    }
  }

  function renderFinale() {
    var m = TRIP.meta;
    $('#finaleLine').textContent = m.finale.line;
    $('#finaleSub').textContent = m.finale.sub;
    $('#finaleSeals').innerHTML = sealsHTML(true);
    var fp = photo(m.finaleSlot);
    if (fp) {
      useSlot(m.finaleSlot);
      var wrap = $('#finalePhoto');
      wrap.innerHTML = imgHTML(m.finaleSlot, { w: 1600, sizes: '100vw' });
    }
  }

  function renderCredit() {
    var provs = {};
    Object.keys(USED_SLOTS).forEach(function (s) {
      var p = PH[s];
      if (p && !p.img) provs[providerName(p)] = true;
    });
    var names = Object.keys(provs);
    $('#finaleCredit').innerHTML = esc(TRIP.meta.finale.credit) +
      (names.length
        ? '<br>照片为出发前的氛围预告，来自 ' + names.map(function (n) {
            var url = n === 'Pexels' ? 'https://www.pexels.com/license/' : 'https://unsplash.com/license';
            return '<a href="' + url + '" target="_blank" rel="noopener">' + n + '</a>';
          }).join(' / ') + ' 免费图库<br>行程结束后将替换为四人实拍'
        : '');
  }

  /* —— ② 看板 · 车票 —— */
  function renderDashboard() {
    var grid = $('#dashGrid');
    grid.innerHTML = TRIP.days.map(function (d) {
      var stars = d.events.filter(function (e) { return e.star || e.link === 'fish'; })
        .map(function (e) { return e.name; });
      var moodShort = d.mood.split(' · ')[0];
      useSlot(d.cover);
      var media = imgHTML(d.cover, { w: 600, ratio: 1.6, sizes: '(max-width: 767px) 50vw, 25vw', alt: d.cityName }) || sceneFallback();
      return '<a class="ticket" href="#' + d.id + '" data-city="' + d.city + '">' +
        '<div class="ticket__media">' + media +
        '<div class="ticket__date"><small>' + d.month + '</small>' + d.num + '</div>' +
        '<span class="ticket__moon">' + moonSVG(d.moon.ill, d.moon.dir, 30, { dark: 'rgba(8,15,33,.5)', stroke: 'rgba(255,255,255,.4)' }) + '</span>' +
        '</div>' +
        '<div class="ticket__body">' +
        '<div class="ticket__city">' + esc(d.cityName) + ' · ' + esc(moodShort) + '</div>' +
        '<div class="ticket__kw">' + d.title.replace(/<\/?em>/g, '') + '</div>' +
        (stars.length ? '<div class="ticket__star">高光 <b>' + esc(stars.join(' · ')) + '</b></div>' : '') +
        '</div></a>';
    }).join('');
  }

  /* —— ③ 时间线 —— */
  function thumbHTML(slot, name, line, cls) {
    if (!slot) return '';
    var i = registerDayImage(slot, name, line);
    var inner = imgHTML(slot, { w: 300, ratio: 1, sizes: '120px', alt: name }) || sceneFallback();
    return '<div class="' + (cls || 'ev__thumb') + '"' + lbItemAttr('days', i, name) + '>' + inner + '</div>';
  }

  function eventHTML(e) {
    if (e.fork) {
      var f = e.fork;
      var col = function (c) {
        return '<div class="fork__col"><div class="fork__col-title"><span class="seal seal--' + c.cls + '" style="display:contents"><span class="seal__moon"></span></span>' + esc(c.title) + '</div>' +
          c.items.map(function (it) {
            var i = registerDayImage(it.slot, it.n, it.d);
            var th = imgHTML(it.slot, { w: 200, ratio: 1, sizes: '64px', alt: it.n }) || sceneFallback();
            return '<div class="fork__item"' + lbItemAttr('days', i, it.n) + '>' +
              '<div class="fork__item-thumb">' + th + '</div>' +
              '<div class="fork__item-text"><b>' + esc(it.n) + '</b><span class="mono">' + esc(it.t) + '</span> · ' + esc(it.d) + '</div></div>';
          }).join('') + '</div>';
      };
      return '<div class="fork reveal">' +
        '<div class="fork__cap">' + esc(f.cap) + '</div>' +
        '<div class="fork__cols">' + col(f.colA) + col(f.colB) + '</div>' +
        '<div class="junction"><span class="junction__lamps" aria-hidden="true"><i></i><i></i></span>' + esc(f.junction) + '</div>' +
        '</div>';
    }

    var tags = (e.train ? ' <span class="pill mono">车次</span>' : '') + (e.star ? ' <span class="pill pill--star">高光</span>' : '');

    if (e.star) {
      var si = registerDayImage(e.slot, e.name, e.desc);
      var big = imgHTML(e.slot, { w: 1200, ratio: 1.9, sizes: '(max-width: 1023px) 100vw, 800px', alt: e.name }) || '';
      return '<div class="ev ev--star reveal' + (e.bubbles ? ' has-bubbles' : '') + '"' + (e.subCity ? ' data-city="' + e.subCity + '"' : '') +
        lbItemAttr('days', si, e.name) + '>' +
        '<div class="ev__photo">' + big + '</div>' +
        (e.bubbles ? '<div class="bubbles" aria-hidden="true"></div>' : '') +
        '<div class="ev__content">' +
        '<span class="ev__time">' + esc(e.t) + '</span>' +
        '<div class="ev__name">' + esc(e.name) + tags + '</div>' +
        (e.desc ? '<p class="ev__desc">' + esc(e.desc) + '</p>' : '') +
        '</div></div>';
    }

    var cls = 'ev reveal' + (e.subCity ? ' ev--sub' : '') + (e.slot ? '' : ' ev--nothumb');
    return '<div class="' + cls + '"' + (e.subCity ? ' data-city="' + e.subCity + '"' : '') + '>' +
      thumbHTML(e.slot, e.name, e.desc) +
      '<div class="ev__content">' +
      '<span class="ev__time">' + esc(e.t || '·') + '</span>' +
      '<div class="ev__name">' + esc(e.name) + tags + '</div>' +
      (e.desc ? '<p class="ev__desc">' + esc(e.desc) + '</p>' : '') +
      '</div></div>';
  }

  function renderTimeline() {
    var tl = $('#tl');
    var html = '';
    TRIP.days.forEach(function (d) {
      html += '<article class="day' + (d.small ? ' day--small' : '') + '" id="' + d.id + '" data-city="' + d.city + '" data-spy data-navto="timeline" data-day>' +
        '<span class="day__dot" aria-hidden="true"></span>' +
        '<aside class="day__aside">' +
        '<div class="day__num reveal-pop"><small>' + d.month + ' · ' + esc(d.cityName) + '</small>' + d.num + '</div>' +
        '<div class="day__moon reveal">' + moonSVG(d.moon.ill, d.moon.dir, 40) + '<span>' + esc(d.moon.name) + '</span></div>' +
        '<div class="day__city reveal"><span class="pill pill--city">' + esc(d.cityName) + '</span></div>' +
        '<p class="day__mood reveal">' + esc(d.mood) + '</p>' +
        '</aside>' +
        '<div class="day__main">' +
        '<h3 class="day__title reveal">' + d.title + '</h3>' +
        '<div class="day__body">' + d.events.map(eventHTML).join('') + '</div>' +
        '<div class="day__badges reveal">' +
        '<span class="badge">' + BED_ICON + '住 <b>' + esc(d.badges.stay) + '</b></span>' +
        '<span class="badge">' + MOVE_ICON + '行 <b>' + esc(d.badges.move) + '</b></span>' +
        '</div>' +
        '</div></article>';

      if (d.id === 'd25') {
        useSlot('gz-lantern-01');
        var fishPhoto = imgHTML('gz-lantern-01', { w: 1800, sizes: '100vw', alt: '灯会夜色' }) || '';
        html += '<section class="fish" id="fish" data-spy data-navto="timeline" data-dark aria-label="光孝路鱼灯 · 中秋正日高光">' +
          '<div class="fish__photo" id="fishPhoto" aria-hidden="true">' + fishPhoto + '</div>' +
          '<div class="fish__glow" aria-hidden="true"></div>' +
          '<span class="fish__swim fish__swim--1" aria-hidden="true">' + fishSwimSVG() + '</span>' +
          '<span class="fish__swim fish__swim--2" aria-hidden="true">' + fishSwimSVG() + '</span>' +
          '<span class="fish__swim fish__swim--3" aria-hidden="true">' + fishSwimSVG() + '</span>' +
          '<div class="fish__inner">' +
          '<div class="fish__kicker reveal">09.25 · 18:00 · 西门口 · 光孝路</div>' +
          '<div class="fish__lantern reveal-pop">' + fishLanternSVG() + '</div>' +
          '<p class="fish__line reveal">光孝路的鱼灯亮起来，<br><em>八月十五</em>才算真正开始</p>' +
          '<div class="fish__hint reveal">—— 中秋正日 · 满月 ——</div>' +
          '</div></section>';
      }
    });
    tl.insertAdjacentHTML('beforeend', html);
  }

  /* —— ④ 美食 —— */
  function renderFood() {
    var track = $('#foodTrack');
    track.innerHTML = TRIP.food.map(function (f, i) {
      var city = f.cat.indexOf('顺德') === 0 ? 'sd' : 'gz';
      LB.food.push({ slot: f.slot, name: f.name, line: f.cat + ' · ' + f.line });
      useSlot(f.slot);
      var media = imgHTML(f.slot, { w: f.star ? 1000 : 700, ratio: f.star ? 1.15 : 0.75, sizes: f.star ? '460px' : '300px', alt: f.name }) || FOOD_ICONS[f.icon]();
      return '<div class="food-card reveal' + (f.star ? ' food-card--star' : '') + '" data-city="' + city + '"' +
        lbItemAttr('food', i, f.name) + '>' +
        '<div class="food-card__media">' + media + '</div>' +
        '<span class="food-card__idx" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        (f.star ? '<span class="stamp">压轴</span>' : '') +
        '<div class="food-card__body">' +
        '<div class="food-card__cat">' + esc(f.cat) + '</div>' +
        '<div class="food-card__name">' + esc(f.name) + '</div>' +
        '<div class="food-card__line">' + esc(f.line) + '</div>' +
        '</div></div>';
    }).join('');

    var step = function (dir) {
      track.scrollBy({ left: dir * Math.max(320, track.clientWidth * 0.7), behavior: SMOOTH });
    };
    $('#foodPrev').addEventListener('click', function () { step(-1); });
    $('#foodNext').addEventListener('click', function () { step(1); });
  }

  /* —— ⑤ 相册 —— */
  function renderAlbum() {
    var tabs = $('#albumTabs');
    var panels = $('#albumPanels');
    tabs.innerHTML = TRIP.album.tabs.map(function (t, i) {
      return '<button class="album-tab" role="tab" id="tab-' + t.key + '" aria-selected="' + (i === 0) + '"' +
        ' aria-controls="panel-' + t.key + '" tabindex="' + (i === 0 ? 0 : -1) + '"><span class="seal__moon"></span>' + esc(t.label) + '</button>';
    }).join('');

    panels.innerHTML = TRIP.album.tabs.map(function (t) {
      var key = 'album-' + t.key;
      LB[key] = [];
      var tiles = TRIP.album.groups[t.key].map(function (s, i) {
        LB[key].push({ slot: s.slot, name: s.name, line: s.sub });
        useSlot(s.slot);
        var big = s.size === 'big';
        var wide = s.size === 'wide';
        var tall = s.size === 'tall';
        var w = big ? 1200 : (wide ? 1000 : (tall ? 600 : 600));
        var ratio = big ? 1.05 : (wide ? 2.1 : (tall ? 0.52 : 1.05));
        var inner = imgHTML(s.slot, { w: w, ratio: ratio, sizes: big || wide ? '(max-width: 767px) 100vw, 50vw' : '(max-width: 767px) 50vw, 25vw', alt: s.name });
        return '<figure class="tile' + (s.size ? ' tile--' + s.size : '') + '"' + lbItemAttr(key, i, s.name) + '>' +
          (inner ? '<div class="reveal-img">' + inner + '</div>' : sceneFallback()) +
          (s.star ? '<span class="stamp">中秋</span>' : '') +
          '<figcaption class="tile__cap"><div class="tile__name">' + esc(s.name) + '</div>' +
          '<div class="tile__sub">' + esc(s.sub) + '</div></figcaption></figure>';
      }).join('');
      return '<div class="album-grid" role="tabpanel" id="panel-' + t.key + '" aria-labelledby="tab-' + t.key + '"' +
        ' data-city="' + t.key + '" data-spy data-navto="album"' + (t.key !== 'gz' ? ' hidden' : '') + '>' + tiles + '</div>';
    }).join('');

    function select(btn) {
      $$('.album-tab', tabs).forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      $$('.album-grid', panels).forEach(function (p) {
        var show = p.id === btn.getAttribute('aria-controls');
        p.hidden = !show;
        if (show) {
          document.body.setAttribute('data-city', p.dataset.city);
          $$('.reveal-img', p).forEach(function (el) { revealIO.observe(el); });
        }
      });
    }

    tabs.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.album-tab');
      if (btn) select(btn);
    });

    tabs.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
      var btns = $$('.album-tab', tabs);
      var cur = btns.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = ev.key === 'ArrowRight' ? (cur + 1) % btns.length : (cur - 1 + btns.length) % btns.length;
      btns[next].focus();
      select(btns[next]);
    });
  }

  /* —— ⑥ 住宿 —— */
  function renderHotels() {
    $('#hotelGrid').innerHTML = TRIP.hotels.map(function (h) {
      useSlot(h.slot);
      var media = imgHTML(h.slot, { w: 700, ratio: 1.6, sizes: '(max-width: 767px) 120px, 25vw', alt: h.name }) || '';
      return '<div class="hotel-card" data-city="' + h.city + '">' +
        '<div class="hotel-card__media">' + media + '<span class="hotel-card__date">' + h.date + '</span></div>' +
        '<div class="hotel-card__body">' +
        '<div class="hotel-card__brand">' + esc(h.brand) + '</div>' +
        '<div class="hotel-card__name">' + esc(h.name) + '</div>' +
        '<div class="hotel-card__line">' + esc(h.line) + '</div>' +
        '</div></div>';
    }).join('');
  }

  /* —— ⑦ 交通 —— */
  var TRANSIT_CITY = { '9.24': 'gz', '9.25': 'gz', '9.26': 'zh', '9.27': 'zh', '9.28': 'sd' };
  var TRANSIT_NAME = { '9.24': '广州 GZ', '9.25': '广州 GZ', '9.26': '珠海 ZH', '9.27': '珠海 → 顺德', '9.28': '顺德 → 家' };

  function renderTransit() {
    var byDay = {};
    TRIP.transit.forEach(function (n) { (byDay[n.day] = byDay[n.day] || []).push(n); });
    $('#transitAxis').innerHTML = Object.keys(byDay).map(function (day) {
      return '<div class="transit__day reveal" data-city="' + TRANSIT_CITY[day] + '">' +
        '<div class="transit__head"><span class="transit__day-num">' + day.replace('9.', '09.') + '</span>' +
        '<span class="transit__day-city">' + esc(TRANSIT_NAME[day]) + '</span></div>' +
        '<div class="transit__nodes">' +
        byDay[day].map(function (n) {
          return '<div class="tnode' + (n.icon === 'train' ? ' tnode--train' : '') + '" tabindex="0">' +
            '<span class="tnode__icon">' + T_ICONS[n.icon]() + '</span>' +
            '<span class="tnode__label">' + esc(n.label) + '</span>' +
            '<span class="tnode__time">' + esc(n.time) + '</span>' +
            '<span class="tnode__tip" role="tooltip">' + esc(n.tip) + '</span></div>';
        }).join('') +
        '</div></div>';
    }).join('');
  }

  /* ============================================================
     四、全局组件
     ============================================================ */

  var moonLive, moonLiveLabel, moonchipMini;

  function renderMoonRail() {
    var rail = $('#moonRail');
    rail.innerHTML = '<div class="moon-live" id="moonLive">' + moonSVG(0.85, 'wax', 34) +
      '<span class="moon-live__label" id="moonLiveLabel">月将至</span></div>' +
      '<span class="moon-rail__sep" aria-hidden="true"></span>' +
      TRIP.days.map(function (d) {
        return '<button class="moon-btn" data-target="' + d.id + '" aria-label="跳到 09.' + d.num + ' ' + esc(d.cityName) + ' · ' + esc(d.moon.name) + '">' +
          '<span class="moon-btn__dot"></span>' +
          '<span class="moon-btn__label">09.' + d.num + ' · ' + esc(d.cityName) + '</span></button>';
      }).join('');

    moonLive = $('#moonLive');
    moonLiveLabel = $('#moonLiveLabel');
    moonchipMini = $('#moonchipMini');
    moonchipMini.innerHTML = moonSVG(0.85, 'wax', 16);

    rail.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.moon-btn');
      if (!btn) return;
      var target = document.getElementById(btn.dataset.target);
      if (target) target.scrollIntoView({ behavior: SMOOTH, block: 'start' });
    });
  }

  function renderDayChip() {
    var chip = $('#daychip');
    var pop = $('#daychipPop');
    pop.innerHTML = TRIP.days.map(function (d) {
      return '<button role="menuitem" data-target="' + d.id + '">09.' + d.num + ' · ' + esc(d.cityName) + '</button>';
    }).join('');

    chip.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-target]')) {
        var t = document.getElementById(ev.target.closest('[data-target]').dataset.target);
        if (t) t.scrollIntoView({ behavior: SMOOTH, block: 'start' });
        chip.setAttribute('aria-expanded', 'false');
        return;
      }
      chip.setAttribute('aria-expanded', chip.getAttribute('aria-expanded') !== 'true' ? 'true' : 'false');
    });

    document.addEventListener('click', function (ev) {
      if (!chip.contains(ev.target)) chip.setAttribute('aria-expanded', 'false');
    });
  }

  /* —— 滚动侦测：导航高亮 + 月相激活 + 城市主题 + 深色区 —— */
  var inDark = false;

  function setupSpy() {
    var navLinks = {};
    $$('.topnav a').forEach(function (a) { navLinks[a.dataset.nav] = a; });
    var moonBtns = {};
    $$('.moon-btn').forEach(function (b) { moonBtns[b.dataset.target] = b; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var navto = el.dataset.navto;

        Object.keys(navLinks).forEach(function (k) {
          navLinks[k].classList.toggle('is-active', k === navto && k !== 'top');
        });

        if (moonBtns[el.id]) {
          Object.keys(moonBtns).forEach(function (k) { moonBtns[k].classList.toggle('is-active', k === el.id); });
          var d = TRIP.days.filter(function (x) { return x.id === el.id; })[0];
          if (d) $('#daychipLabel').textContent = '09.' + d.num + ' · ' + d.cityName;
        }

        if (el.dataset.city) {
          document.body.setAttribute('data-city', el.dataset.city);
        } else if (navto === 'top' || navto === 'finale' || el.id === 'fish') {
          document.body.removeAttribute('data-city');
        }

        inDark = el.hasAttribute('data-dark');
        $('#cursorGlow').classList.toggle('on', inDark && FINE_POINTER);
        document.body.classList.toggle('is-finale', navto === 'finale');
      });
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });

    $$('[data-spy]').forEach(function (el) { io.observe(el); });
  }

  /* —— 渐入 —— */
  var revealIO;

  function setupReveal() {
    var all = $$('.reveal, .reveal-pop, .reveal-track, .reveal-stagger, .reveal-img');
    if (STATIC || REDUCED) {
      all.forEach(function (el) { el.classList.add('in'); });
      var finS = $('.finale'); if (finS) finS.classList.add('in');
      revealIO = { observe: function () {} };
      return;
    }
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          revealIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

    all.forEach(function (el) { revealIO.observe(el); });

    setTimeout(function () {
      $$('.reveal:not(.in), .reveal-pop:not(.in), .reveal-track:not(.in), .reveal-stagger:not(.in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.2) el.classList.add('in');
      });
    }, 2500);

    var fin = $('.finale');
    if (fin) {
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { fin.classList.add('in'); fio.disconnect(); }
        });
      }, { threshold: 0.3 });
      fio.observe(fin);
    }
  }

  /* —— 气泡 —— */
  function setupBubbles() {
    if (REDUCED) return;
    $$('.bubbles').forEach(function (box) {
      var html = '';
      for (var i = 0; i < 14; i++) {
        var size = 6 + Math.random() * 14;
        html += '<span class="bubble" style="left:' + (4 + Math.random() * 92) + '%;width:' + size + 'px;height:' + size +
          'px;animation-duration:' + (7 + Math.random() * 6) + 's;animation-delay:' + (Math.random() * 8) + 's"></span>';
      }
      box.innerHTML = html;
    });
  }

  /* —— 月相插值：滚动位置 → (ill, dir, label) —— */
  function moonAt(pos) {
    var days = TRIP.days;
    if (pos <= 0) return { ill: days[0].moon.ill, dir: days[0].moon.dir, name: days[0].moon.name };
    if (pos >= days.length - 1) { var l = days[days.length - 1].moon; return { ill: l.ill, dir: l.dir, name: l.name }; }
    var i = Math.floor(pos), f = pos - i;
    var a = days[i].moon, b = days[i + 1].moon;
    var ill = a.ill + (b.ill - a.ill) * f;
    var dir = (b.ill >= a.ill) ? 'wax' : 'wane';
    if (a.dir === 'full' && b.dir === 'wane') dir = 'wane';
    if (a.dir === 'wax' && b.dir === 'full') dir = 'wax';
    return { ill: ill, dir: dir, name: f < 0.5 ? a.name : b.name };
  }

  /* —— 滚动驱动（rAF）：进度 / 导航 / 视差 / 月相 / 时间线主干 —— */
  function setupScrollFX() {
    var progress = $('#progress');
    var topnav = $('#topnav');
    var backtop = $('#backtop');
    var daychip = $('#daychip');
    var rail = $('#moonRail');
    var hero = $('.hero');
    var heroBody = $('#heroBody');
    var heroPhotoWrap = $('#heroPhotoWrap');
    var moonWrap = $('#moonWrap');
    var tower = $('.hero__tower');
    var skyline = $('.hero__skyline');
    var tl = $('#tl');
    var dayEls = $$('[data-day]');
    var fishPhoto = $('#fishPhoto');
    var finalePhoto = $('#finalePhoto');
    var ticking = false;
    var lastMoonKey = '';

    function parallaxIn(el, speed) {
      if (!el) return;
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var center = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = 'translateY(' + (center * speed) + 'px)';
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var vh = window.innerHeight;
        var docH = document.documentElement.scrollHeight - vh;
        progress.style.transform = 'scaleX(' + (docH > 0 ? y / docH : 0) + ')';

        var heroH = hero ? hero.offsetHeight : 600;
        var pastHero = y > heroH * 0.7;
        topnav.classList.toggle('show', pastHero);
        rail.classList.toggle('show', pastHero);
        daychip.classList.toggle('show', pastHero);
        backtop.classList.toggle('show', y > 2200);

        if (!REDUCED && y < heroH * 1.2) {
          if (moonWrap) moonWrap.style.transform = 'translateY(' + y * 0.28 + 'px)';
          if (tower) tower.style.transform = 'translateY(' + y * 0.10 + 'px)';
          if (skyline) skyline.style.transform = 'translateY(' + y * 0.05 + 'px)';
          if (heroPhotoWrap) heroPhotoWrap.style.transform = 'translateY(' + y * 0.18 + 'px)';
          if (heroBody) {
            var k = Math.min(1, y / (heroH * 0.65));
            heroBody.style.opacity = String(1 - k);
            heroBody.style.transform = 'translateY(' + y * 0.22 + 'px)';
          }
        }

        if (!REDUCED) {
          parallaxIn(fishPhoto, -0.12);
          parallaxIn(finalePhoto, -0.12);
        }

        /* 时间线主干：随视口中线画出；经过的日点亮 */
        if (tl && dayEls.length) {
          var tr = tl.getBoundingClientRect();
          var mid = vh * 0.45;
          var prog = (mid - tr.top) / tr.height;
          tl.style.setProperty('--tl-progress', String(Math.max(0, Math.min(1, prog))));

          var pos = 0;
          for (var i = 0; i < dayEls.length; i++) {
            var dr = dayEls[i].getBoundingClientRect();
            var lit = dr.top < mid;
            dayEls[i].classList.toggle('is-lit', lit);
            if (lit) {
              var next = dayEls[i + 1] ? dayEls[i + 1].getBoundingClientRect().top : dr.bottom;
              var span = Math.max(1, next - dr.top);
              pos = i + Math.max(0, Math.min(1, (mid - dr.top) / span));
            }
          }
          if (tr.top > mid) pos = 0;
          if (tr.bottom < mid) pos = dayEls.length - 1;

          var m = moonAt(pos);
          var key = m.dir + Math.round(m.ill * 100);
          if (key !== lastMoonKey) {
            lastMoonKey = key;
            var svgStr = moonSVG(m.ill, m.dir, 34);
            if (moonLive) { moonLive.firstChild.outerHTML = svgStr; }
            if (moonchipMini) moonchipMini.innerHTML = moonSVG(m.ill, m.dir, 16);
            if (moonLiveLabel) moonLiveLabel.textContent = m.name + ' · ' + Math.round(m.ill * 100) + '%';
          }
        }

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    backtop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: SMOOTH }); });
  }

  /* —— 光标柔光（深色区） —— */
  function setupCursorGlow() {
    if (!FINE_POINTER || REDUCED) return;
    var g = $('#cursorGlow');
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    document.addEventListener('mousemove', function (ev) {
      tx = ev.clientX; ty = ev.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    function tick() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      g.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(tick); else raf = null;
    }
  }

  /* —— 磁性微倾（卡片 hover 跟随） —— */
  function setupTilt() {
    if (!FINE_POINTER || REDUCED) return;
    document.addEventListener('mousemove', function (ev) {
      var card = ev.target.closest('.food-card, .ticket');
      if (!card) return;
      var r = card.getBoundingClientRect();
      var dx = (ev.clientX - r.left) / r.width - 0.5;
      var dy = (ev.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'translateY(-10px) rotateX(' + (-dy * 5) + 'deg) rotateY(' + (dx * 6) + 'deg)';
      card.style.transition = 'transform 120ms var(--ease-std), box-shadow var(--t-slow)';
    }, { passive: true });
    document.addEventListener('mouseout', function (ev) {
      var card = ev.target.closest && ev.target.closest('.food-card, .ticket');
      if (!card || card.contains(ev.relatedTarget)) return;
      card.style.transform = '';
      card.style.transition = '';
    });
  }

  /* ============================================================
     五、灯箱（focus trap + 键盘 + 计数）
     ============================================================ */

  function setupLightbox() {
    var lb = $('#lightbox');
    var stage = $('#lbStage');
    var btns = [$('#lbClose'), $('#lbPrev'), $('#lbNext')];
    var group = null;
    var idx = 0;
    var lastFocus = null;

    function items(g) { return LB[g] || []; }

    function show(g, i) {
      group = g;
      var list = items(g);
      var len = list.length;
      if (!len) return;
      idx = ((i % len) + len) % len;
      var it = list[idx];
      var p = photo(it.slot);
      stage.innerHTML = p
        ? '<img src="' + (p.img || unsplashURL(p.base, 1600)) + '" alt="' + esc(it.name) + '"' + (p.pos ? ' style="object-position:' + p.pos + '"' : '') + '>'
        : sceneFallback();
      $('#lbName').textContent = it.name;
      $('#lbLine').textContent = it.line || '';
      $('#lbCounter').textContent = (idx + 1) + ' / ' + len;
      if (p && !p.img) {
        var prov = providerName(p);
        var href = p.link || (prov === 'Unsplash' ? unsplashURL(p.base, 2000) : p.base);
        $('#lbSlot').innerHTML = esc(p.note || '氛围预告图') +
          ' · 图源 <a href="' + esc(href) + '" target="_blank" rel="noopener">' + prov + '</a>';
      } else if (p) {
        $('#lbSlot').textContent = p.note || '';
      } else {
        $('#lbSlot').textContent = '插画示意';
      }
      $('#lbPrev').disabled = len <= 1;
      $('#lbNext').disabled = len <= 1;
      /* 预载相邻 */
      [idx + 1, idx - 1].forEach(function (j) {
        var n = list[((j % len) + len) % len];
        var np = photo(n.slot);
        if (np && !np.img) { var im = new Image(); im.src = unsplashURL(np.base, 1600); }
      });
    }

    function open(g, i) {
      lastFocus = document.activeElement;
      show(g, i);
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add('open'); });
      document.body.style.overflow = 'hidden';
      btns[0].focus();
    }

    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () { lb.hidden = true; }, REDUCED ? 0 : 300);
      if (lastFocus) lastFocus.focus();
    }

    function move(step) {
      var len = items(group).length;
      if (len) show(group, (idx + step + len) % len);
    }

    document.addEventListener('click', function (ev) {
      var card = ev.target.closest('[data-lightbox]');
      if (card) {
        ev.preventDefault();
        open(card.dataset.lightbox, parseInt(card.dataset.idx, 10) || 0);
        return;
      }
      if (ev.target.closest('#lbClose')) { close(); return; }
      if (ev.target.closest('#lbPrev')) { move(-1); return; }
      if (ev.target.closest('#lbNext')) { move(1); return; }
      if (ev.target === lb) close();
    });

    document.addEventListener('keydown', function (ev) {
      var card = ev.target.closest && ev.target.closest('[data-lightbox]');
      if (card && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        open(card.dataset.lightbox, parseInt(card.dataset.idx, 10) || 0);
        return;
      }
      if (lb.hidden) return;
      if (ev.key === 'Escape') { close(); return; }
      if (ev.key === 'ArrowLeft') { move(-1); return; }
      if (ev.key === 'ArrowRight') { move(1); return; }
      if (ev.key === 'Tab') {
        ev.preventDefault();
        var cur = btns.indexOf(document.activeElement);
        var next = ev.shiftKey ? (cur - 1 + btns.length) % btns.length : (cur + 1) % btns.length;
        btns[next].focus();
      }
    });

    /* 触屏左右滑切换 */
    var sx = 0;
    lb.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (ev) {
      var dx = ev.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1);
    });
  }

  /* ============================================================
     六、启动
     ============================================================ */

  function init() {
    renderHero();
    renderDashboard();
    renderTimeline();
    renderFood();
    renderAlbum();
    renderHotels();
    renderTransit();
    renderFinale();
    renderCredit();
    renderMoonRail();
    renderDayChip();
    setupSpy();
    setupReveal();
    setupBubbles();
    setupScrollFX();
    setupCursorGlow();
    setupTilt();
    setupLightbox();

    if (location.hash) {
      var t = document.querySelector(location.hash);
      if (t) setTimeout(function () { t.scrollIntoView(); }, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
