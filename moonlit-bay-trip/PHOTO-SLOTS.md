# PHOTO-SLOTS — 图位清单与替换指南

页面里每一张图都对应一个槽位（slot），由 `js/photos.js` 的 `window.PHOTOS[slot]` 提供。渲染层只认 slot，换图不动结构与样式。

## 数据格式

```js
window.PHOTOS = {
  'gz-scene-01': {
    base: 'https://images.pexels.com/photos/35272174/pexels-photo-35272174.jpeg', // 图床地址（不带参数）
    author: 'Bingqian Li',                       // 摄影师（尾声致谢 + 灯箱署名）
    link: 'https://www.pexels.com/photo/35272174/', // 原图页
    alt: '陈家祠屋脊灰塑',                        // 图片替代文本
    pos: '50% 30%',                               // 可选：object-position 裁切焦点
    note: '氛围预告图',                            // 可选：灯箱小字（意境图默认标注）
    img: 'assets/img/gz-scene-01.jpg',            // 可选：一旦存在即覆盖 base，用于本地图 / 实拍图
  },
};
```

## 图位一览

| 槽位 | 用途 | 显示位置 |
| --- | --- | --- |
| `hero-01` | 广州夜景 | Hero 满幅背景 |
| `finale-01` | 海面月夜 | 尾声背景 |
| `gz-lantern-01` | 灯会夜色 | 鱼灯高光节背景 |
| `gz-night-01` | 珠江夜色 | 9.24 车票 / 相册 |
| `gz-airport-01` | 白云机场 | 9.24 事件 |
| `gz-hotel-01` `gz-hotel-02` `zh-hotel-01` `sd-hotel-01` | 四晚客房 | 住宿卡 / 9.24、9.27 事件 |
| `gz-dimsum-01` ~ `03` | 虾饺 / 一盅两件 / 肠粉 | 美食卡 / 9.24、9.25 事件 |
| `gz-street-01` `02` | 艇仔粥 / 西门口小吃 | 美食卡 / 9.25 分叉与事件 |
| `sd-food-01` ~ `03` | 双皮奶 / 烧鹅 / 龙江晚饭 | 美食卡 / 相册 / 9.27 高光 |
| `gz-scene-01` ~ `06` | 陈家祠 / 永庆坊 / 沙面 / 圣心大教堂 / 鱼灯 / 大马戏 | 相册 / 9.25 分叉与高光 |
| `zh-scene-01` ~ `06` | 鲸鲨馆 / 情侣路 / 日月贝 / 海天公园 / 圆明新园 / 珠海站 | 相册 / 9.26、9.27 事件 |
| `zh-train-01` | 高铁 | 9.26 事件 |
| `sd-scene-01` ~ `03` | 龙江食街 / 顺德学院站 / 归程 | 相册 / 9.27、9.28 事件 |

## 当前图源

全部图位为 Pexels / Unsplash 免费授权实拍，通过 Tavily 检索并逐张验证可访问。精确地标在免费图库无图时使用同类意境图（灯箱标注「氛围预告图」）。每张图的摄影师与原图页记录在 `photos.js` 内，页面尾声自动汇总致谢。

## 换成四位自己的照片（行后必做）

1. 把照片放进 `assets/img/`，按槽位命名，例如 `gz-dimsum-01.jpg`；
2. 在 `js/photos.js` 对应槽位加 `img: 'assets/img/gz-dimsum-01.jpg'`，并把 `author` / `link` / `note` 删掉（不再显示图源署名）；
3. 想换标题/说明，改 `js/data.js` 同条目的 `name` / `sub` / `desc`；
4. 尾声文案在 `data.js` 的 `meta.finale`。

> 建议尺寸：Hero / 高光横图 ≥1800px 宽；美食卡 ≥900px 竖图（3:4）；相册瓦片 ≥1200px。

## 一键本地化外链图

```bash
node tools/download-photos.mjs           # 下载到 assets/img，生成 js/photos.local.js
node tools/download-photos.mjs --force   # 强制重新下载
```

在 `index.html` 中于 `photos.js` 之后引入 `photos.local.js` 即切换为本地图。
