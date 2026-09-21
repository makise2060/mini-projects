/* ============================================================
   photos.js — 图位 → 照片（出发前预告版）
   ------------------------------------------------------------
   来源：Pexels / Unsplash 免费授权图库（经 Tavily 检索、逐张验证可访问）
   字段：base      图床地址（不带参数，渲染层按用途拼 w/h/crop）
         provider  Pexels | Unsplash
         link      原图页（Pexels 有；Unsplash 无法从 CDN 反推，留空则链到图床）
         alt       替代文本
         pos       可选 object-position 裁切焦点
         note      可选 灯箱小字（精确地标无图时的意境图统一标注）
         img       可选 本地/实拍路径；一旦存在即覆盖 base（行后换四人实拍只填这个）
   ============================================================ */

function px(id) { return 'https://images.pexels.com/photos/' + id + '/pexels-photo-' + id + '.jpeg'; }
function pxLink(id) { return 'https://www.pexels.com/photo/' + id + '/'; }

window.PHOTOS = {
  /* —— 全局 —— */
  'hero-01':       { base: px(5265116),  provider: 'Pexels', link: pxLink(5265116),  alt: '夜色里亮起粉紫灯光的广州塔', pos: '62% 40%' },
  'finale-01':     { base: px(845254),   provider: 'Pexels', link: pxLink(845254),   alt: '暮色中的海面与栈桥', pos: '50% 45%' },
  'gz-lantern-01': { base: px(36700368), provider: 'Pexels', link: pxLink(36700368), alt: '灯会夜色，人群走在红灯笼下', pos: '50% 40%' },

  /* —— 广州 —— */
  'gz-night-01':   { base: px(3005772),  provider: 'Pexels', link: pxLink(3005772),  alt: '珠江猎德大桥夜景' },
  'gz-airport-01': { base: px(12717174), provider: 'Pexels', link: pxLink(12717174), alt: '白云机场航站楼' },
  'gz-hotel-01':   { base: px(38936032), provider: 'Pexels', link: pxLink(38936032), alt: '暖光台灯下的客房', note: '客房氛围示意' },
  'gz-hotel-02':   { base: px(31728399), provider: 'Pexels', link: pxLink(31728399), alt: '明亮简约的酒店客房', note: '客房氛围示意' },
  'gz-dimsum-01':  { base: px(32393812), provider: 'Pexels', link: pxLink(32393812), alt: '竹笼里的虾饺' },
  'gz-dimsum-02':  { base: px(13081506), provider: 'Pexels', link: pxLink(13081506), alt: '一盅两件：虾饺配一壶茶' },
  'gz-dimsum-03':  { base: 'https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835', provider: 'Unsplash', alt: '淋了豉油的肠粉' },
  'gz-street-01':  { base: px(36340265), provider: 'Pexels', link: pxLink(36340265), alt: '一碗热粥', note: '艇仔粥意境图' },
  'gz-street-02':  { base: px(30563089), provider: 'Pexels', link: 'https://www.pexels.com/photo/vibrant-asian-street-food-vendor-display-30563089', alt: '广东街头小吃摊' },
  'gz-scene-01':   { base: px(35272174), provider: 'Pexels', link: pxLink(35272174), alt: '陈家祠屋脊灰塑', pos: '50% 35%' },
  'gz-scene-02':   { base: 'https://images.unsplash.com/photo-1696618041995-a3c76f4850eb', provider: 'Unsplash', alt: '广州西关骑楼老街', note: '西关老街意境图' },
  'gz-scene-03':   { base: px(37160874), provider: 'Pexels', link: pxLink(37160874), alt: '沙面岛榕树下的洋楼' },
  'gz-scene-04':   { base: px(35144769), provider: 'Pexels', link: pxLink(35144769), alt: '石室圣心大教堂双塔', pos: '50% 30%' },
  'gz-scene-05':   { base: px(34291462), provider: 'Pexels', link: pxLink(34291462), alt: '中秋鲤鱼灯', note: '鱼灯意境图' },
  'gz-scene-06':   { img: 'assets/img/gz-scene-06.jpg', alt: '长隆大马戏现场：小丑热气球与漫天泡泡', pos: '50% 42%', note: '长隆大马戏 · 现场实拍' },

  /* —— 珠海 —— */
  'zh-hotel-01':   { base: px(37836001), provider: 'Pexels', link: pxLink(37836001), alt: '客房窗外的城市与海', note: '客房氛围示意' },
  'zh-train-01':   { base: px(7494174),  provider: 'Pexels', link: pxLink(7494174),  alt: 'CRH 和谐号停靠站台' },
  'zh-scene-01':   { base: px(19613766), provider: 'Pexels', link: pxLink(19613766), alt: '鲸鲨馆巨型水族缸前的人影', note: '鲸鲨馆意境图' },
  'zh-scene-02':   { base: px(12408911), provider: 'Pexels', link: pxLink(12408911), alt: '海边骑行的傍晚', note: '情侣路骑行意境图' },
  'zh-scene-03':   { base: px(33575124), provider: 'Pexels', link: pxLink(33575124), alt: '蓝天下的日月贝', pos: '50% 45%' },
  'zh-scene-04':   { base: px(30154474), provider: 'Pexels', link: pxLink(30154474), alt: '珠海海湾落日与跨海大桥' },
  'zh-scene-05':   { base: px(33575131), provider: 'Pexels', link: 'https://www.pexels.com/photo/traditional-chinese-pavilion-beside-serene-pond-33575131', alt: '湖畔亭台', note: '圆明新园意境图' },
  'zh-scene-06':   { base: px(32267731), provider: 'Pexels', link: pxLink(32267731), alt: '高铁站台与出站口', note: '珠海站意境图' },

  /* —— 顺德 —— */
  'sd-hotel-01':   { base: px(25003352), provider: 'Pexels', link: pxLink(25003352), alt: '暖灯下的客房床头', note: '客房氛围示意' },
  'sd-food-01':    { base: px(37146773), provider: 'Pexels', link: 'https://www.pexels.com/photo/vibrant-bowl-of-asian-dessert-with-jelly-and-milk-37146773', alt: '一碗奶底糖水', note: '糖水意境图（双皮奶待实拍）' },
  'sd-food-02':    { base: px(33414704), provider: 'Pexels', link: pxLink(33414704), alt: '烧腊档挂着的烧鹅' },
  'sd-food-03':    { base: px(38175310), provider: 'Pexels', link: pxLink(38175310), alt: '岭南老宅里的一桌粤菜', pos: '50% 70%', note: '顺德寻味意境图' },
  'sd-scene-01':   { base: px(27852299), provider: 'Pexels', link: pxLink(27852299), alt: '红灯笼下的夜市食街', note: '食街夜色意境图' },
  'sd-scene-02':   { base: px(37474453), provider: 'Pexels', link: pxLink(37474453), alt: '傍晚暖光里的站台', note: '顺德学院站意境图' },
  'sd-scene-03':   { base: px(37218157), provider: 'Pexels', link: pxLink(37218157), alt: '蓝调时刻的海岸公路车流', pos: '50% 55%' },
};
