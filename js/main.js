/* ============================================================
   main.js — 渲染与交互
   月满湾区 · 四人之行
   依赖：js/data.js（TRIP）
   ============================================================ */

(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SMOOTH = REDUCED ? 'auto' : 'smooth';

  /* ============================================================
     一、SVG 插画体系（图位 placeholder · 为实拍而设计）
     ============================================================ */

  function svg(vb, inner, ratio) {
    return '<svg viewBox="' + vb + '" preserveAspectRatio="' + (ratio || 'xMidYMid meet') +
      '" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /* —— 月相 —— */
  function moonSVG(m, size) {
    var s = size || 26;
    var id = 'mc-' + m.dir + '-' + String(m.ill).replace('.', '_');
    var off = (1 - m.ill) * 36;
    var x = m.dir === 'wax' ? 20 - off : 20 + off;
    var shadow = m.dir === 'full' ? '' : '<circle cx="' + x + '" cy="20" r="18" fill="#E9E3D5"/>';
    var craters = m.dir === 'full'
      ? '<circle cx="14" cy="13" r="2.4" fill="rgba(43,43,43,.08)"/><circle cx="26" cy="24" r="3.2" fill="rgba(43,43,43,.07)"/>'
      : '';
    return '<svg viewBox="0 0 40 40" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="' + id + '"><circle cx="20" cy="20" r="18"/></clipPath></defs>' +
      '<g clip-path="url(#' + id + ')"><circle cx="20" cy="20" r="18" fill="var(--lamp)"/>' + craters + shadow + '</g>' +
      '<circle cx="20" cy="20" r="17.5" fill="none" stroke="rgba(43,43,43,.18)" stroke-width="1"/></svg>';
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
        '<path d="M28 44 q4 4 8 0 M44 42 q4 4 8 0 M60 44 q4 4 8 0" stroke="var(--accent-strong)" stroke-width="1.5" fill="none"/>' +
        '<rect x="14" y="50" width="68" height="22" rx="6" fill="var(--accent)"/>' +
        '<path d="M18 58 h60 M18 64 h60" stroke="var(--accent-strong)" stroke-width="1.5" opacity=".4"/>' +
        '<ellipse cx="48" cy="74" rx="36" ry="5" fill="var(--accent-strong)"/>'
      );
    },
    teacup: function () {
      return svg('0 0 96 96',
        '<path d="M44 16 q4 -7 0 -12 M56 18 q4 -7 0 -12" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".55"/>' +
        '<ellipse cx="48" cy="38" rx="24" ry="6" fill="var(--accent)"/>' +
        '<circle cx="48" cy="30" r="5" fill="var(--accent-strong)"/>' +
        '<path d="M26 42 h44 l-5 30 a6 6 0 0 1 -6 5 h-22 a6 6 0 0 1 -6 -5 z" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<path d="M30 52 h36" stroke="var(--accent)" stroke-width="2" opacity=".5"/>' +
        '<path d="M40 60 h16" stroke="var(--accent-strong)" stroke-width="2" opacity=".5"/>' +
        '<ellipse cx="48" cy="80" rx="30" ry="4.5" fill="var(--accent-strong)"/>'
      );
    },
    roll: function () {
      return svg('0 0 96 96',
        '<ellipse cx="48" cy="72" rx="36" ry="9" fill="var(--accent-strong)"/>' +
        '<rect x="20" y="42" width="30" height="16" rx="8" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5" transform="rotate(-8 35 50)"/>' +
        '<rect x="42" y="46" width="32" height="16" rx="8" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5" transform="rotate(6 58 54)"/>' +
        '<path d="M22 46 q14 -6 30 -2 q14 4 28 -4 l3 5 q-15 9 -31 4 q-14 -4 -27 3 z" fill="var(--accent)" opacity=".85"/>' +
        '<path d="M40 26 q3 -7 0 -12 M56 24 q3 -7 0 -12" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/>'
      );
    },
    congee: function () {
      return svg('0 0 96 96',
        '<path d="M36 26 q4 -8 0 -14 M60 28 q4 -8 0 -14" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/>' +
        '<path d="M18 46 h60 a30 26 0 0 1 -60 0 z" fill="var(--accent-strong)"/>' +
        '<ellipse cx="48" cy="46" rx="30" ry="8" fill="#FFFFFF"/>' +
        '<rect x="40" y="30" width="5" height="20" rx="2.5" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="1.5"/>' +
        '<rect x="50" y="32" width="5" height="18" rx="2.5" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="1.5"/>' +
        '<path d="M14 76 h68" stroke="var(--accent-strong)" stroke-width="3" stroke-linecap="round" opacity=".5"/>'
      );
    },
    streetfood: function () {
      return svg('0 0 96 96',
        '<circle cx="78" cy="18" r="7" fill="var(--lamp)"/>' +
        '<line x1="78" y1="25" x2="78" y2="34" stroke="var(--accent-strong)" stroke-width="1.5"/>' +
        '<path d="M34 30 q4 -8 0 -14 M58 30 q4 -8 0 -14" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/>' +
        '<path d="M16 52 h64 a32 24 0 0 1 -64 0 z" fill="var(--accent)"/>' +
        '<ellipse cx="48" cy="52" rx="32" ry="7" fill="#FFFFFF"/>' +
        '<path d="M20 84 l24 -22 M28 86 l24 -22" stroke="var(--accent-strong)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="48" cy="78" rx="34" ry="4" fill="var(--accent-strong)"/>'
      );
    },
    milk: function () {
      return svg('0 0 96 96',
        '<path d="M30 34 h36 l-3 40 a6 6 0 0 1 -6 5 h-18 a6 6 0 0 1 -6 -5 z" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<ellipse cx="48" cy="34" rx="18" ry="6" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<ellipse cx="48" cy="33" rx="12" ry="3.5" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="1.2" opacity=".8"/>' +
        '<path d="M33 52 h30" stroke="var(--accent)" stroke-width="2" opacity=".45"/>' +
        '<path d="M56 40 l8 -12" stroke="var(--accent-strong)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="66" cy="27" rx="3.5" ry="5" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="1.5" transform="rotate(-30 66 27)"/>'
      );
    },
    goose: function () {
      return svg('0 0 96 96',
        '<line x1="48" y1="6" x2="48" y2="18" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<path d="M36 18 h24" stroke="var(--accent-strong)" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="48" y1="18" x2="48" y2="26" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<ellipse cx="48" cy="54" rx="26" ry="28" fill="var(--accent-strong)"/>' +
        '<path d="M30 44 q18 -10 36 0" stroke="#FFFFFF" stroke-width="2" fill="none" opacity=".35"/>' +
        '<circle cx="58" cy="40" r="2.5" fill="#FFFFFF" opacity=".5"/>' +
        '<path d="M40 78 q-2 10 4 12 M56 78 q2 10 -4 12" stroke="var(--accent-strong)" stroke-width="4" stroke-linecap="round" fill="none"/>' +
        '<ellipse cx="48" cy="88" rx="20" ry="4" fill="var(--accent)" opacity=".5"/>'
      );
    },
    feast: function () {
      return svg('0 0 96 96',
        '<path d="M38 14 q4 -7 0 -12 M58 16 q4 -7 0 -12" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".5"/>' +
        '<circle cx="48" cy="38" r="13" fill="var(--accent-strong)"/>' +
        '<circle cx="48" cy="38" r="7" fill="var(--accent)"/>' +
        '<path d="M33 38 h-8 M63 38 h8" stroke="var(--accent-strong)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<ellipse cx="24" cy="62" rx="11" ry="5" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<ellipse cx="72" cy="62" rx="11" ry="5" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<ellipse cx="48" cy="74" rx="30" ry="10" fill="var(--accent)"/>' +
        '<ellipse cx="48" cy="70" rx="30" ry="10" fill="var(--accent-strong)"/>' +
        '<ellipse cx="24" cy="78" rx="11" ry="4.5" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<ellipse cx="72" cy="78" rx="11" ry="4.5" fill="#FFFFFF" stroke="var(--accent-strong)" stroke-width="2"/>'
      );
    }
  };

  /* —— 相册场景（常规 120×160 / 宽幅 200×260） —— */
  var SCENES = {
    hall: function () {
      return svg('0 0 120 160',
        '<path d="M10 150 h100" stroke="var(--accent-ink)" stroke-width="2" opacity=".35"/>' +
        '<rect x="30" y="98" width="60" height="48" fill="var(--accent-strong)"/>' +
        '<rect x="52" y="122" width="16" height="24" rx="8" fill="var(--accent)"/>' +
        '<rect x="38" y="104" width="6" height="40" fill="#FFF6E8" opacity=".9"/>' +
        '<rect x="76" y="104" width="6" height="40" fill="#FFF6E8" opacity=".9"/>' +
        '<path d="M12 100 Q60 56 108 100" fill="none" stroke="var(--accent-ink)" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M28 88 Q60 62 92 88" fill="none" stroke="var(--accent-ink)" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
        '<line x1="26" y1="98" x2="26" y2="88" stroke="var(--accent-ink)" stroke-width="3"/>' +
        '<line x1="94" y1="98" x2="94" y2="88" stroke="var(--accent-ink)" stroke-width="3"/>' +
        '<circle cx="26" cy="94" r="4" fill="var(--lamp)"/><circle cx="94" cy="94" r="4" fill="var(--lamp)"/>' +
        '<circle cx="60" cy="76" r="3" fill="var(--accent)"/><circle cx="50" cy="72" r="2" fill="var(--accent)"/><circle cx="70" cy="72" r="2" fill="var(--accent)"/>'
      );
    },
    fang: function () {
      return svg('0 0 120 160',
        '<path d="M14 150 h92" stroke="var(--accent-ink)" stroke-width="2" opacity=".35"/>' +
        '<path d="M28 150 V72 Q60 46 92 72 V150" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="3"/>' +
        '<rect x="44" y="118" width="32" height="32" rx="4" fill="var(--accent)"/>' +
        '<rect x="50" y="126" width="20" height="24" rx="10" fill="var(--accent-strong)"/>' +
        '<rect x="46" y="76" width="28" height="16" rx="3" fill="var(--accent-strong)"/>' +
        '<text x="60" y="89" text-anchor="middle" font-size="12" fill="#FFF6E8" style="font-family:var(--f-serif)">坊</text>' +
        '<path d="M20 66 q10 6 20 0 q10 6 20 0 q10 6 20 0 q10 6 20 0" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round"/>' +
        '<circle cx="20" cy="66" r="3" fill="var(--lamp)"/><circle cx="60" cy="66" r="3" fill="var(--lamp)"/><circle cx="100" cy="66" r="3" fill="var(--lamp)"/>'
      );
    },
    shamian: function () {
      return svg('0 0 120 160',
        '<path d="M10 148 h100" stroke="var(--accent-ink)" stroke-width="2" opacity=".35"/>' +
        '<rect x="24" y="60" width="72" height="86" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="3"/>' +
        '<path d="M18 60 L60 34 L102 60 Z" fill="var(--accent-strong)"/>' +
        '<rect x="34" y="70" width="7" height="66" fill="var(--accent)"/>' +
        '<rect x="57" y="70" width="7" height="66" fill="var(--accent)"/>' +
        '<rect x="80" y="70" width="7" height="66" fill="var(--accent)"/>' +
        '<circle cx="60" cy="96" r="6" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<rect x="14" y="118" width="8" height="30" fill="var(--accent-ink)"/>' +
        '<circle cx="18" cy="106" r="14" fill="var(--accent)" opacity=".85"/>' +
        '<circle cx="26" cy="114" r="9" fill="var(--accent)" opacity=".7"/>'
      );
    },
    church: function () {
      return svg('0 0 120 160',
        '<path d="M10 150 h100" stroke="var(--accent-ink)" stroke-width="2" opacity=".35"/>' +
        '<rect x="34" y="84" width="52" height="62" fill="var(--accent-ink)"/>' +
        '<path d="M30 84 L42 30 L54 84 Z" fill="var(--accent-ink)"/>' +
        '<path d="M66 84 L78 30 L90 84 Z" fill="var(--accent-ink)"/>' +
        '<line x1="42" y1="30" x2="42" y2="20" stroke="var(--accent-ink)" stroke-width="2"/>' +
        '<line x1="37" y1="24" x2="47" y2="24" stroke="var(--accent-ink)" stroke-width="2"/>' +
        '<line x1="78" y1="30" x2="78" y2="20" stroke="var(--accent-ink)" stroke-width="2"/>' +
        '<line x1="73" y1="24" x2="83" y2="24" stroke="var(--accent-ink)" stroke-width="2"/>' +
        '<circle cx="60" cy="102" r="9" fill="var(--lamp)" stroke="#FFF6E8" stroke-width="2"/>' +
        '<circle cx="60" cy="102" r="4" fill="var(--accent-strong)"/>' +
        '<path d="M52 146 v-18 a8 8 0 0 1 16 0 v18 z" fill="var(--lamp)"/>'
      );
    },
    fishlamp: function () {
      return svg('0 0 200 260',
        '<circle cx="168" cy="34" r="16" fill="var(--lamp)" opacity=".9"/>' +
        '<circle cx="162" cy="30" r="3" fill="var(--accent-strong)" opacity=".4"/><circle cx="172" cy="38" r="2.4" fill="var(--accent-strong)" opacity=".35"/>' +
        '<circle cx="20" cy="52" r="1.8" fill="#FFF6E8" opacity=".8"/><circle cx="40" cy="30" r="1.5" fill="#FFF6E8" opacity=".6"/><circle cx="58" cy="46" r="1.5" fill="#FFF6E8" opacity=".5"/><circle cx="186" cy="88" r="1.5" fill="#FFF6E8" opacity=".6"/>' +
        '<line x1="100" y1="52" x2="100" y2="66" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<circle cx="100" cy="58" r="3" fill="var(--lamp)"/>' +
        '<circle cx="100" cy="150" r="76" fill="var(--lamp)" opacity=".16"/>' +
        '<circle cx="100" cy="150" r="54" fill="var(--lamp)" opacity=".2"/>' +
        '<path d="M160 138 l30 -16 -9 22 13 4 -11 18 -23 -10 z" fill="var(--accent)" stroke="var(--accent-strong)" stroke-width="3" stroke-linejoin="round"/>' +
        '<ellipse cx="96" cy="150" rx="58" ry="42" fill="var(--accent)"/>' +
        '<ellipse cx="96" cy="162" rx="58" ry="30" fill="var(--lamp)" opacity=".55"/>' +
        '<path d="M62 138 q7 8 14 0 M88 132 q7 8 14 0 M114 138 q7 8 14 0 M75 154 q7 8 14 0 M101 150 q7 8 14 0" stroke="var(--accent-strong)" stroke-width="2" fill="none" opacity=".55"/>' +
        '<path d="M84 110 q12 -22 32 -14 q-10 8 -8 18 z" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<path d="M86 190 q10 18 28 10 q-8 -8 -6 -16 z" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<circle cx="58" cy="140" r="6" fill="var(--accent-ink)"/><circle cx="60" cy="138" r="2" fill="#FFF"/>' +
        '<path d="M40 156 q4 4 10 2" stroke="var(--accent-ink)" stroke-width="2" fill="none"/>' +
        '<line x1="96" y1="192" x2="96" y2="212" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<line x1="90" y1="212" x2="90" y2="228" stroke="var(--accent-strong)" stroke-width="1.5"/>' +
        '<line x1="96" y1="212" x2="96" y2="232" stroke="var(--accent-strong)" stroke-width="1.5"/>' +
        '<line x1="102" y1="212" x2="102" y2="228" stroke="var(--accent-strong)" stroke-width="1.5"/>' +
        '<circle cx="96" cy="236" r="3.5" fill="var(--lamp)"/>'
      );
    },
    circus: function () {
      return svg('0 0 120 160',
        '<polygon points="6,6 34,40 6,40" fill="var(--accent)" opacity=".18"/>' +
        '<polygon points="114,6 86,40 114,40" fill="var(--accent)" opacity=".18"/>' +
        '<path d="M10 150 h100" stroke="var(--accent-ink)" stroke-width="2" opacity=".35"/>' +
        '<path d="M14 96 Q60 40 106 96 Z" fill="var(--accent)"/>' +
        '<path d="M40 66 L60 44 L80 66 L60 96 Z" fill="#FFF6E8"/>' +
        '<path d="M14 96 q12 10 23 0 q12 10 23 0 q12 10 23 0 q12 10 23 0 l0 6 l-92 0 z" fill="var(--accent-strong)"/>' +
        '<line x1="60" y1="44" x2="60" y2="28" stroke="var(--accent-ink)" stroke-width="2"/>' +
        '<path d="M60 28 l16 6 l-16 6 z" fill="var(--accent-strong)"/>' +
        '<circle cx="30" cy="24" r="3" fill="var(--lamp)"/><circle cx="90" cy="24" r="3" fill="var(--lamp)"/>' +
        '<path d="M20 34 q10 5 20 0 M80 34 q10 5 20 0" stroke="var(--accent)" stroke-width="1.5" fill="none" opacity=".6"/>' +
        '<rect x="46" y="112" width="28" height="16" rx="8" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="2"/>'
      );
    },
    whale: function () {
      return svg('0 0 200 260',
        '<polygon points="100,0 40,90 160,90" fill="#FFFFFF" opacity=".08"/>' +
        '<polygon points="100,0 70,90 130,90" fill="#FFFFFF" opacity=".08"/>' +
        '<circle cx="26" cy="40" r="2" fill="#FFF" opacity=".5"/><circle cx="176" cy="56" r="2.5" fill="#FFF" opacity=".5"/><circle cx="150" cy="28" r="1.8" fill="#FFF" opacity=".4"/><circle cx="50" cy="20" r="1.5" fill="#FFF" opacity=".4"/>' +
        '<path d="M158 118 q22 -12 34 -2 q-10 6 -12 12 q8 6 10 14 q-14 4 -32 -12 z" fill="var(--accent-strong)"/>' +
        '<path d="M44 96 q54 -26 108 0 q14 30 -6 52 q-48 18 -96 0 q-20 -24 -6 -52 z" fill="var(--accent-strong)"/>' +
        '<path d="M50 128 q46 16 92 0 q-4 14 -12 20 q-34 10 -68 0 q-8 -8 -12 -20 z" fill="#FFFFFF" opacity=".85"/>' +
        '<circle cx="70" cy="108" r="5" fill="#FFF" opacity=".9"/><circle cx="88" cy="102" r="4" fill="#FFF" opacity=".8"/>' +
        '<circle cx="106" cy="106" r="5" fill="#FFF" opacity=".85"/><circle cx="124" cy="102" r="3.5" fill="#FFF" opacity=".7"/>' +
        '<circle cx="96" cy="118" r="4" fill="#FFF" opacity=".7"/>' +
        '<circle cx="58" cy="102" r="3.5" fill="#FFF" opacity=".6"/>' +
        '<circle cx="56" cy="94" r="5" fill="#FFF"/><circle cx="55" cy="93" r="2" fill="var(--accent-ink)"/>' +
        '<circle cx="150" cy="180" r="7" fill="#FFF" opacity=".35"/><circle cx="164" cy="204" r="5" fill="#FFF" opacity=".3"/><circle cx="142" cy="226" r="8" fill="#FFF" opacity=".25"/><circle cx="170" cy="240" r="4" fill="#FFF" opacity=".3"/>' +
        '<path d="M0 252 q50 -10 100 0 t100 0" stroke="var(--accent)" stroke-width="3" fill="none" opacity=".4"/>'
      );
    },
    coast: function () {
      return svg('0 0 120 160',
        '<circle cx="92" cy="30" r="14" fill="var(--lamp)"/>' +
        '<rect x="0" y="96" width="120" height="64" fill="var(--accent)" opacity=".22"/>' +
        '<path d="M0 96 h120" stroke="var(--accent-strong)" stroke-width="2" opacity=".5"/>' +
        '<path d="M0 112 q30 -8 60 0 t60 0" stroke="var(--accent)" stroke-width="2" fill="none" opacity=".4"/>' +
        '<path d="M0 126 q30 -8 60 0 t60 0" stroke="var(--accent)" stroke-width="2" fill="none" opacity=".3"/>' +
        '<path d="M10 96 Q30 60 66 48 Q92 40 104 22" stroke="var(--accent-ink)" stroke-width="3" fill="none" opacity=".55" stroke-dasharray="6 5"/>' +
        '<circle cx="44" cy="72" r="9" fill="none" stroke="var(--ink)" stroke-width="2.5"/>' +
        '<circle cx="72" cy="58" r="9" fill="none" stroke="var(--ink)" stroke-width="2.5"/>' +
        '<path d="M50 68 l16 -6 M56 76 l8 -12" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M64 62 l4 -8" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/>'
      );
    },
    shell: function () {
      return svg('0 0 120 160',
        '<circle cx="30" cy="28" r="11" fill="var(--lamp)"/>' +
        '<rect x="0" y="108" width="120" height="52" fill="var(--accent)" opacity=".22"/>' +
        '<path d="M0 108 h120" stroke="var(--accent-strong)" stroke-width="2" opacity=".5"/>' +
        '<path d="M28 108 a32 40 0 0 1 64 0 z" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="3"/>' +
        '<path d="M48 74 l-6 34 M60 70 v38 M72 74 l6 34 M38 84 l-5 24 M82 84 l5 24" stroke="var(--accent-strong)" stroke-width="2" opacity=".5"/>' +
        '<path d="M44 108 a18 26 0 0 1 32 0 z" fill="var(--accent)" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<path d="M0 124 q30 -6 60 0 t60 0" stroke="var(--accent)" stroke-width="2" fill="none" opacity=".4"/>'
      );
    },
    park: function () {
      return svg('0 0 120 160',
        '<circle cx="26" cy="28" r="10" fill="#FFF" opacity=".7"/>' +
        '<circle cx="36" cy="24" r="10" fill="#FFF" opacity=".7"/>' +
        '<rect x="0" y="100" width="120" height="60" fill="var(--accent)" opacity=".22"/>' +
        '<path d="M0 100 h120" stroke="var(--accent-strong)" stroke-width="2" opacity=".5"/>' +
        '<ellipse cx="88" cy="124" rx="26" ry="10" fill="var(--accent-ink)" opacity=".55"/>' +
        '<path d="M84 122 q-4 -18 6 -34" stroke="var(--accent-ink)" stroke-width="3" fill="none"/>' +
        '<path d="M90 88 q-16 -8 -26 2 M90 88 q-2 -16 -14 -20 M90 88 q12 -12 24 -4 M90 88 q16 -4 22 8" stroke="var(--accent-strong)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M18 136 q20 -5 40 0" stroke="var(--accent)" stroke-width="2" fill="none" opacity=".4"/>'
      );
    },
    pavilion: function () {
      return svg('0 0 120 160',
        '<rect x="0" y="132" width="120" height="28" fill="var(--accent)" opacity=".18"/>' +
        '<path d="M14 76 Q60 46 106 76" fill="none" stroke="var(--accent-ink)" stroke-width="5" stroke-linecap="round"/>' +
        '<path d="M28 66 Q60 44 92 66" fill="none" stroke="var(--accent-ink)" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
        '<rect x="44" y="70" width="32" height="10" fill="var(--accent-strong)"/>' +
        '<path d="M26 94 Q60 72 94 94" fill="none" stroke="var(--accent-ink)" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="40" y="92" width="40" height="8" fill="var(--accent-strong)"/>' +
        '<line x1="46" y1="100" x2="46" y2="132" stroke="var(--accent-ink)" stroke-width="3"/>' +
        '<line x1="74" y1="100" x2="74" y2="132" stroke="var(--accent-ink)" stroke-width="3"/>' +
        '<rect x="34" y="132" width="52" height="6" fill="var(--accent-ink)"/>' +
        '<circle cx="60" cy="60" r="3" fill="var(--lamp)"/>'
      );
    },
    station: function () {
      return svg('0 0 120 160',
        '<rect x="26" y="42" width="68" height="76" rx="12" fill="var(--accent-strong)"/>' +
        '<rect x="34" y="52" width="52" height="20" rx="6" fill="#FFF6E8"/>' +
        '<circle cx="46" cy="86" r="5" fill="var(--lamp)"/><circle cx="74" cy="86" r="5" fill="var(--lamp)"/>' +
        '<rect x="48" y="100" width="24" height="18" rx="9" fill="var(--accent)"/>' +
        '<path d="M10 126 h100" stroke="var(--accent-ink)" stroke-width="3"/>' +
        '<path d="M22 126 l-8 26 M98 126 l8 26" stroke="var(--accent-ink)" stroke-width="2.5"/>' +
        '<path d="M30 132 l-4 18 M44 132 l-2 18 M60 132 v18 M76 132 l2 18 M90 132 l4 18" stroke="var(--accent-ink)" stroke-width="2" opacity=".6"/>' +
        '<circle cx="60" cy="26" r="6" fill="var(--accent)"/>'
      );
    },
    street: function () {
      return svg('0 0 200 260',
        '<circle cx="172" cy="36" r="13" fill="var(--lamp)" opacity=".9"/>' +
        '<circle cx="30" cy="52" r="1.8" fill="#FFF6E8" opacity=".7"/><circle cx="52" cy="32" r="1.5" fill="#FFF6E8" opacity=".5"/><circle cx="146" cy="66" r="1.8" fill="#FFF6E8" opacity=".6"/>' +
        '<path d="M20 96 h44 l-4 -18 h-36 z" fill="var(--accent)"/>' +
        '<path d="M24 96 q4 6 9 0 q5 6 9 0 q5 6 9 0 q5 6 9 0" stroke="var(--accent-strong)" stroke-width="2.5" fill="none"/>' +
        '<path d="M136 104 h44 l-4 -18 h-36 z" fill="var(--accent)"/>' +
        '<path d="M140 104 q4 6 9 0 q5 6 9 0 q5 6 9 0 q5 6 9 0" stroke="var(--accent-strong)" stroke-width="2.5" fill="none"/>' +
        '<rect x="24" y="96" width="36" height="58" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<rect x="140" y="104" width="36" height="50" fill="#FFF6E8" stroke="var(--accent-strong)" stroke-width="2.5"/>' +
        '<ellipse cx="42" cy="118" rx="12" ry="5" fill="var(--accent)" opacity=".6"/>' +
        '<ellipse cx="158" cy="126" rx="12" ry="5" fill="var(--accent)" opacity=".6"/>' +
        '<path d="M36 112 q3 -8 0 -14 M48 110 q3 -8 0 -14 M152 120 q3 -8 0 -14 M164 118 q3 -8 0 -14" stroke="var(--accent-strong)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>' +
        '<line x1="70" y1="86" x2="70" y2="100" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<circle cx="70" cy="106" r="9" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<line x1="126" y1="86" x2="126" y2="100" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<circle cx="126" cy="106" r="9" fill="var(--lamp)" stroke="var(--accent-strong)" stroke-width="2"/>' +
        '<path d="M0 172 q50 -8 100 0 t100 0" stroke="var(--accent)" stroke-width="3" fill="none" opacity=".35"/>' +
        '<path d="M0 248 q50 -8 100 0 t100 0" stroke="var(--accent)" stroke-width="3" fill="none" opacity=".25"/>'
      );
    },
    road: function () {
      return svg('0 0 120 160',
        '<circle cx="92" cy="28" r="13" fill="var(--lamp)"/>' +
        '<circle cx="86" cy="24" r="2.4" fill="var(--accent-strong)" opacity=".4"/>' +
        '<path d="M0 84 h120" stroke="var(--accent-ink)" stroke-width="2" opacity=".4"/>' +
        '<polygon points="42,160 78,160 62,84 58,84" fill="var(--accent-ink)" opacity=".85"/>' +
        '<line x1="60" y1="158" x2="60" y2="88" stroke="#FFF6E8" stroke-width="2.5" stroke-dasharray="8 7" opacity=".85"/>' +
        '<polygon points="48,160 52,160 56,84 54,84" fill="var(--accent)" opacity=".18"/>' +
        '<polygon points="68,160 72,160 66,84 64,84" fill="var(--accent)" opacity=".18"/>' +
        '<path d="M14 100 q14 -6 28 0" stroke="var(--accent)" stroke-width="2" fill="none" opacity=".4"/>'
      );
    }
  };
  SCENES.station2 = SCENES.station;

  /* —— 事件横幅（320×180） —— */
  var BANNERS = {
    circus: function () {
      return svg('0 0 320 180',
        '<rect width="320" height="180" fill="var(--accent-weak)"/>' +
        '<polygon points="0,0 90,120 0,120" fill="var(--accent)" opacity=".16"/>' +
        '<polygon points="320,0 230,120 320,120" fill="var(--accent)" opacity=".16"/>' +
        '<circle cx="40" cy="26" r="3" fill="var(--lamp)"/><circle cx="284" cy="34" r="3" fill="var(--lamp)"/><circle cx="252" cy="18" r="2.4" fill="var(--lamp)" opacity=".8"/><circle cx="72" cy="40" r="2.4" fill="var(--lamp)" opacity=".8"/>' +
        '<path d="M64 128 Q160 46 256 128 Z" fill="var(--accent)"/>' +
        '<path d="M116 88 L160 50 L204 88 L160 128 Z" fill="#FFF6E8"/>' +
        '<path d="M64 128 q12 11 24 0 q12 11 24 0 q12 11 24 0 q12 11 24 0 q12 11 24 0 q12 11 24 0 q12 11 24 0 q12 11 24 0 l0 8 l-192 0 z" fill="var(--accent-strong)"/>' +
        '<line x1="160" y1="50" x2="160" y2="28" stroke="var(--accent-ink)" stroke-width="2.5"/>' +
        '<path d="M160 28 l22 8 l-22 8 z" fill="var(--accent-strong)"/>' +
        '<path d="M100 42 q16 8 32 0 M188 42 q16 8 32 0" stroke="var(--accent)" stroke-width="2" fill="none" opacity=".6"/>' +
        '<circle cx="100" cy="42" r="3.5" fill="var(--lamp)"/><circle cx="132" cy="42" r="3.5" fill="var(--lamp)"/><circle cx="188" cy="42" r="3.5" fill="var(--lamp)"/><circle cx="220" cy="42" r="3.5" fill="var(--lamp)"/>',
        'xMidYMid meet');
    },
    whale: function () {
      return svg('0 0 320 180',
        '<rect width="320" height="180" fill="var(--accent-weak)"/>' +
        '<polygon points="160,0 100,180 220,180" fill="#FFF" opacity=".22"/>' +
        '<polygon points="160,0 130,180 190,180" fill="#FFF" opacity=".16"/>' +
        '<circle cx="34" cy="30" r="2.5" fill="#FFF" opacity=".7"/><circle cx="292" cy="44" r="3" fill="#FFF" opacity=".7"/><circle cx="256" cy="22" r="2" fill="#FFF" opacity=".5"/><circle cx="66" cy="52" r="2" fill="#FFF" opacity=".5"/>' +
        '<path d="M236 96 q26 -14 40 -3 q-12 7 -14 14 q10 7 12 16 q-16 5 -38 -14 z" fill="var(--accent-strong)"/>' +
        '<path d="M84 74 q62 -30 128 0 q16 34 -7 60 q-56 20 -112 0 q-24 -28 -9 -60 z" fill="var(--accent-strong)"/>' +
        '<path d="M92 110 q54 18 108 0 q-5 16 -14 23 q-40 11 -80 0 q-9 -9 -14 -23 z" fill="#FFF" opacity=".85"/>' +
        '<circle cx="116" cy="86" r="5.5" fill="#FFF" opacity=".9"/><circle cx="138" cy="79" r="4.5" fill="#FFF" opacity=".8"/>' +
        '<circle cx="160" cy="84" r="5.5" fill="#FFF" opacity=".85"/><circle cx="182" cy="79" r="4" fill="#FFF" opacity=".7"/>' +
        '<circle cx="150" cy="98" r="4.5" fill="#FFF" opacity=".7"/><circle cx="172" cy="97" r="3.5" fill="#FFF" opacity=".6"/>' +
        '<circle cx="100" cy="79" r="4" fill="#FFF" opacity=".55"/>' +
        '<circle cx="98" cy="70" r="6" fill="#FFF"/><circle cx="97" cy="69" r="2.4" fill="var(--accent-ink)"/>' +
        '<circle cx="262" cy="140" r="6" fill="#FFF" opacity=".4"/><circle cx="276" cy="160" r="4" fill="#FFF" opacity=".35"/><circle cx="60" cy="150" r="5" fill="#FFF" opacity=".35"/><circle cx="46" cy="166" r="3.5" fill="#FFF" opacity=".3"/>' +
        '<path d="M0 172 q80 -8 160 0 t160 0" stroke="var(--accent)" stroke-width="3" fill="none" opacity=".4"/>',
        'xMidYMid meet');
    }
  };

  /* —— 鱼灯高光节（大图） —— */
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
      '<circle cx="102" cy="210" r="4" fill="#F8D989"/>',
      'xMidYMid meet');
  }

  /* —— 住宿小图（40×40） —— */
  function hotelSVG() {
    return svg('0 0 40 40',
      '<rect x="8" y="8" width="24" height="28" rx="3" fill="var(--accent-strong)"/>' +
      '<rect x="12" y="13" width="4" height="4" fill="#FFF6E8"/><rect x="18" y="13" width="4" height="4" fill="var(--lamp)"/><rect x="24" y="13" width="4" height="4" fill="#FFF6E8"/>' +
      '<rect x="12" y="20" width="4" height="4" fill="var(--lamp)"/><rect x="18" y="20" width="4" height="4" fill="#FFF6E8"/><rect x="24" y="20" width="4" height="4" fill="#FFF6E8"/>' +
      '<rect x="16" y="28" width="8" height="8" rx="4" fill="var(--accent)"/>'
    );
  }

  /* —— 交通图标（16×16） —— */
  var T_ICONS = {
    plane: function () {
      return svg('0 0 16 16', '<path d="M1 8 L15 2 L9 15 L7 9 Z" fill="var(--accent-strong)"/>');
    },
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
     二、渲染
     ============================================================ */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function sealsHTML() {
    return TRIP.meta.couples.map(function (c) {
      return '<span class="seal seal--' + c.cls + '"><span class="seal__moon"></span>' + esc(c.label) + '</span>';
    }).join('');
  }

  function renderHeroAndFinale() {
    $('#heroSeals').innerHTML = sealsHTML();
    $('#finaleLine').textContent = TRIP.meta.finale.line;
    $('#finaleSub').textContent = TRIP.meta.finale.sub;
    $('#finaleSeals').innerHTML = sealsHTML();
    $('#finaleCredit').textContent = TRIP.meta.finale.credit;
  }

  function renderDashboard() {
    var grid = $('#dashGrid');
    grid.innerHTML = TRIP.days.map(function (d) {
      var stars = d.events.filter(function (e) { return e.star || e.link === 'fish'; })
        .map(function (e) { return e.name; }).join(' · ');
      var moodShort = d.mood.split(' · ')[0];
      return '<div class="dash-card reveal" data-city="' + d.city + '">' +
        '<span class="dash-card__bar" aria-hidden="true"></span>' +
        '<div class="dash-card__date">' + d.num + '</div>' +
        '<div class="dash-card__city">' + esc(d.cityName) + ' · ' + esc(moodShort) + '</div>' +
        '<div class="dash-card__kw">' + esc(d.title) + '</div>' +
        (stars ? '<div class="dash-card__star">高光 · ' + esc(stars) + '</div>' : '') +
        '</div>';
    }).join('');
  }

  function eventHTML(e) {
    if (e.fork) {
      var f = e.fork;
      var col = function (c) {
        return '<div class="fork__col"><div class="fork__col-title">' + esc(c.title) + '</div>' +
          c.items.map(function (it) {
            return '<div class="fork__item"><span class="mono">' + esc(it.t) + '</span>' +
              '<span><b>' + esc(it.n) + '</b> · ' + esc(it.d) + '</span></div>';
          }).join('') + '</div>';
      };
      return '<div class="fork reveal">' +
        '<div class="fork__cap">' + esc(f.cap) + '</div>' +
        '<div class="fork__cols">' + col(f.colA) + col(f.colB) + '</div>' +
        '<div class="junction"><span class="junction__lamps" aria-hidden="true"><i></i><i></i></span>' + esc(f.junction) + '</div>' +
        '</div>';
    }

    var cls = 'ev reveal' + (e.star ? ' ev--star' : '') + (e.subCity ? ' ev--sub' : '') + (e.bubbles ? ' has-bubbles' : '');
    return '<div class="' + cls.trim() + '"' + (e.subCity ? ' data-city="' + e.subCity + '"' : '') + '>' +
      (e.t ? '<span class="ev__time">' + esc(e.t) + '</span>' : '<span class="ev__time">·</span>') +
      '<div>' +
      '<div class="ev__name">' + esc(e.name) +
      (e.train ? ' <span class="pill mono" style="font-size:11px">车次</span>' : '') +
      (e.star ? ' <span class="pill pill--star">高光</span>' : '') +
      '</div>' +
      (e.desc ? '<p class="ev__desc">' + esc(e.desc) + '</p>' : '') +
      (e.banner && BANNERS[e.banner] ? '<div class="ev__banner">' + BANNERS[e.banner]() + '</div>' : '') +
      (e.bubbles ? '<div class="bubbles" aria-hidden="true"></div>' : '') +
      '</div></div>';
  }

  function renderTimeline() {
    var tl = $('#tl');
    var html = '';
    TRIP.days.forEach(function (d) {
      html += '<article class="day' + (d.small ? ' day--small' : '') + '" id="' + d.id + '" data-city="' + d.city + '" data-spy data-navto="timeline">' +
        '<span class="day__dot" aria-hidden="true"></span>' +
        '<header class="day__head reveal">' +
        '<span class="day__num reveal-pop">' + d.num + '</span>' +
        '<span class="pill pill--city">' + esc(d.cityName) + '</span>' +
        '<span class="day__mood mono">' + esc(d.moon.name) + ' · ' + esc(d.mood) + '</span>' +
        '<h3 class="day__title">' + esc(d.title) + '</h3>' +
        '</header>' +
        '<div class="day__body">' + d.events.map(eventHTML).join('') + '</div>' +
        '<div class="day__badges reveal">' +
        '<span class="badge">' + BED_ICON + '住 <b>' + esc(d.badges.stay) + '</b></span>' +
        '<span class="badge">' + MOVE_ICON + '行 <b>' + esc(d.badges.move) + '</b></span>' +
        '</div>' +
        '</article>';

      /* 鱼灯高光节：插在 9.25 之后 */
      if (d.id === 'd25') {
        html += '<section class="fish" id="fish" data-spy data-navto="timeline" aria-label="光孝路鱼灯 · 中秋正日高光">' +
          '<div class="fish__glow" aria-hidden="true"></div>' +
          '<div class="fish__inner">' +
          '<div class="fish__kicker">09.25 · 18:00 · 西门口 · 光孝路</div>' +
          '<div class="fish__lantern">' + fishLanternSVG() + '</div>' +
          '<p class="fish__line">光孝路的鱼灯亮起来，<br>八月十五才算真正开始</p>' +
          '<div class="fish__hint">—— 中秋正日 · 满月 ——</div>' +
          '</div></section>';
      }
    });
    tl.insertAdjacentHTML('beforeend', html);
  }

  function renderFood() {
    var track = $('#foodTrack');
    track.innerHTML = TRIP.food.map(function (f, i) {
      var city = f.cat.indexOf('顺德') === 0 ? 'sd' : 'gz';
      return '<div class="food-card reveal' + (f.star ? ' food-card--star' : '') + '" data-city="' + city + '"' +
        ' data-lightbox="food" data-idx="' + i + '" tabindex="0" role="button" aria-label="' + esc(f.name) + '，放大查看">' +
        '<div class="food-card__media">' + FOOD_ICONS[f.icon]() + '</div>' +
        '<div class="food-card__body">' +
        '<div class="food-card__cat">' + esc(f.cat) + '</div>' +
        '<div class="food-card__name">' + esc(f.name) + '</div>' +
        '<div class="food-card__line">' + esc(f.line) + '</div>' +
        '</div><span class="food-card__slot">' + f.slot + '</span></div>';
    }).join('');
  }

  function renderAlbum() {
    var tabs = $('#albumTabs');
    var panels = $('#albumPanels');
    tabs.innerHTML = TRIP.album.tabs.map(function (t, i) {
      return '<button class="album-tab" role="tab" id="tab-' + t.key + '" aria-selected="' + (i === 0) + '"' +
        ' aria-controls="panel-' + t.key + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(t.label) + '</button>';
    }).join('');

    panels.innerHTML = TRIP.album.tabs.map(function (t) {
      var tiles = TRIP.album.groups[t.key].map(function (s, i) {
        return '<figure class="tile' + (s.wide ? ' tile--wide' : '') + '" data-lightbox="album-' + t.key + '" data-idx="' + i + '"' +
          ' tabindex="0" role="button" aria-label="' + esc(s.name) + '，放大查看">' +
          SCENES[s.motif]() +
          '<figcaption class="tile__cap"><div class="tile__name">' + esc(s.name) + '</div>' +
          '<div class="tile__sub">' + esc(s.sub) + '</div></figcaption>' +
          '<span class="tile__slot">' + s.slot + '</span></figure>';
      }).join('');
      return '<div class="album-grid" role="tabpanel" id="panel-' + t.key + '" aria-labelledby="tab-' + t.key + '"' +
        ' data-city="' + t.key + '" data-spy data-navto="album"' + (t.key !== 'gz' ? ' hidden' : '') + '>' + tiles + '</div>';
    }).join('');

    /* Tab 切换 */
    tabs.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.album-tab');
      if (!btn) return;
      $$('.album-tab', tabs).forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', String(on));
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
      $$('.album-grid', panels).forEach(function (p) {
        p.hidden = (p.id !== btn.getAttribute('aria-controls'));
      });
    });

    /* 键盘左右切换 tab */
    tabs.addEventListener('keydown', function (ev) {
      if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
      var btns = $$('.album-tab', tabs);
      var cur = btns.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = ev.key === 'ArrowRight' ? (cur + 1) % btns.length : (cur - 1 + btns.length) % btns.length;
      btns[next].focus();
      btns[next].click();
    });
  }

  function renderHotels() {
    $('#hotelGrid').innerHTML = TRIP.hotels.map(function (h) {
      return '<div class="hotel-card reveal" data-city="' + h.city + '">' +
        '<div class="hotel-card__top"><span class="hotel-card__date">' + h.date + '</span>' +
        '<span class="hotel-card__glyph">' + hotelSVG() + '</span></div>' +
        '<div class="hotel-card__name">' + esc(h.name) + '</div>' +
        '<div class="hotel-card__line">' + esc(h.line) + '</div>' +
        '<div class="hotel-card__slot">SLOT ' + h.slot + '</div></div>';
    }).join('');
  }

  var TRANSIT_CITY = { '9.24': 'gz', '9.25': 'gz', '9.26': 'zh', '9.27': 'zh', '9.28': 'sd' };

  function renderTransit() {
    var byDay = {};
    TRIP.transit.forEach(function (n) {
      (byDay[n.day] = byDay[n.day] || []).push(n);
    });
    $('#transitAxis').innerHTML = Object.keys(byDay).map(function (day) {
      return '<div class="transit__day" data-city="' + TRANSIT_CITY[day] + '">' +
        '<div class="transit__day-num mono">' + day + '</div>' +
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
     三、全局组件
     ============================================================ */

  function renderMoonRail() {
    var rail = $('#moonRail');
    rail.innerHTML = TRIP.days.map(function (d) {
      return '<button class="moon-btn" data-target="' + d.id + '" aria-label="跳到 ' + d.num + ' ' + esc(d.cityName) + ' · ' + esc(d.moon.name) + '">' +
        moonSVG(d.moon) +
        '<span class="moon-btn__label">' + d.num + ' · ' + esc(d.moon.name) + '</span></button>';
    }).join('');

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
      return '<button role="menuitem" data-target="' + d.id + '">' + d.num + ' · ' + esc(d.cityName) + '</button>';
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

  /* —— 滚动侦测：导航高亮 + 月相激活 + 城市主题 —— */
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
          navLinks[k].classList.toggle('is-active', k === navto);
        });

        var dayMatch = moonBtns[el.id];
        Object.keys(moonBtns).forEach(function (k) {
          moonBtns[k].classList.toggle('is-active', k === el.id);
        });
        if (dayMatch) {
          var d = TRIP.days.filter(function (x) { return x.id === el.id; })[0];
          if (d) $('#daychipLabel').textContent = d.num + ' · ' + d.cityName;
        }

        if (el.dataset.city) {
          document.body.setAttribute('data-city', el.dataset.city);
        } else if (navto === 'top' || navto === 'finale') {
          document.body.removeAttribute('data-city');
        }
      });
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });

    $$('[data-spy]').forEach(function (el) { io.observe(el); });
  }

  /* —— 渐入 —— */
  function setupReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18 });

    $$('.reveal, .reveal-pop').forEach(function (el) { io.observe(el); });

    /* 兜底：IO 未及时触发（后台标签/极端环境）时，2s 后强制呈现，绝不静默留白 */
    setTimeout(function () {
      $$('.reveal:not(.in), .reveal-pop:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 2000);

    /* 尾声月升 */
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
      for (var i = 0; i < 12; i++) {
        var size = 6 + Math.random() * 10;
        html += '<span class="bubble" style="left:' + (4 + Math.random() * 92) + '%;width:' + size + 'px;height:' + size +
          'px;animation-duration:' + (6 + Math.random() * 4) + 's;animation-delay:' + (Math.random() * 6) + 's"></span>';
      }
      box.innerHTML = html;
    });
  }

  /* —— 滚动驱动（rAF 节流）：进度条 / 导航浮现 / 视差 / 回顶 —— */
  function setupScrollFX() {
    var progress = $('.progress');
    var topnav = $('.topnav');
    var backtop = $('#backtop');
    var hero = $('.hero');
    var moonWrap = $('#moonWrap');
    var tower = $('.hero__tower');
    var skyline = $('.hero__skyline');
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = docH > 0 ? (y / docH) * 100 + '%' : '0%';

        var heroH = hero ? hero.offsetHeight : 600;
        topnav.classList.toggle('show', y > heroH * 0.6);
        backtop.classList.toggle('show', y > 2000);

        if (!REDUCED && y < heroH * 1.2) {
          if (moonWrap) moonWrap.style.transform = 'translateY(' + y * 0.22 + 'px)';
          if (tower) tower.style.transform = 'translateY(' + y * 0.08 + 'px)';
          if (skyline) skyline.style.transform = 'translateY(' + y * 0.04 + 'px)';
        }
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backtop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: SMOOTH });
    });
  }

  /* ============================================================
     四、灯箱（focus trap + 键盘）
     ============================================================ */

  function setupLightbox() {
    var lb = $('#lightbox');
    var stage = $('#lbStage');
    var btns = [$('#lbClose'), $('#lbPrev'), $('#lbNext')];
    var group = null;
    var idx = 0;
    var lastFocus = null;

    function itemSVG(g, i) {
      if (g === 'food') {
        var f = TRIP.food[i];
        return { svg: FOOD_ICONS[f.icon](), name: f.name, line: f.cat + ' · ' + f.line, slot: f.slot };
      }
      var key = g.replace('album-', '');
      var s = TRIP.album.groups[key][i];
      return { svg: SCENES[s.motif](), name: s.name, line: s.sub, slot: s.slot };
    }

    function show(g, i) {
      group = g;
      var len = g === 'food' ? TRIP.food.length : TRIP.album.groups[g.replace('album-', '')].length;
      idx = ((i % len) + len) % len;
      var it = itemSVG(g, idx);
      stage.innerHTML = it.svg;
      $('#lbName').textContent = it.name;
      $('#lbLine').textContent = it.line;
      $('#lbSlot').textContent = 'SLOT ' + it.slot;
      $('#lbPrev').disabled = len <= 1;
      $('#lbNext').disabled = len <= 1;
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
      var len = group === 'food' ? TRIP.food.length : TRIP.album.groups[group.replace('album-', '')].length;
      show(group, (idx + step + len) % len);
    }

    document.addEventListener('click', function (ev) {
      var card = ev.target.closest('[data-lightbox]');
      if (card) {
        open(card.dataset.lightbox, parseInt(card.dataset.idx, 10) || 0);
        return;
      }
      if (ev.target.closest('#lbClose')) { close(); return; }
      if (ev.target.closest('#lbPrev')) { move(-1); return; }
      if (ev.target.closest('#lbNext')) { move(1); return; }
      if (ev.target === lb) close();
    });

    /* 键盘：Enter/Space 打开 */
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
  }

  /* ============================================================
     五、启动
     ============================================================ */

  function init() {
    renderHeroAndFinale();
    renderDashboard();
    renderTimeline();
    renderFood();
    renderAlbum();
    renderHotels();
    renderTransit();
    renderMoonRail();
    renderDayChip();
    setupSpy();
    setupReveal();
    setupBubbles();
    setupScrollFX();
    setupLightbox();

    /* 支持带锚点分享（#d25 / #fish 等动态渲染区块） */
    if (location.hash) {
      var t = document.querySelector(location.hash);
      if (t) setTimeout(function () { t.scrollIntoView(); }, 60);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
