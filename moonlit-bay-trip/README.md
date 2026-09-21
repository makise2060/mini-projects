# moonlit-bay-trip · 月满湾区

「月满湾区 · 四人之行」中秋出行展示网页——四人两队情侣、三座城市、一轮满月。

- **行程**：广州（9.24–9.25，中秋正日）→ 珠海（9.26–9.27）→ 顺德（9.27–9.28）
- **叙事主线**：月亮一路随行——右侧「活月亮」随滚动在相邻两日之间连续插值，2026-09-25 满月为全站情绪顶点
- **定位**：出发前分享给朋友的预告展示页（v2.0）；行后把 `js/photos.js` 的图位换成四人实拍即成纪念页
- **状态**：v2.1——v2.0 视觉改版（Web 字体、实拍全图位、杂志式版式、滚动叙事动效）+ 四人头像双人徽章
- **仓库**：本目录是父仓库 [mini-projects](https://github.com/makise2060/mini-projects) 的子项目

> 图位清单、图源出处与「换成自己照片」的步骤见 [PHOTO-SLOTS.md](PHOTO-SLOTS.md)。

## 权威文档

设计方案的唯一权威版本在文档库（不在本仓库，避免双头维护）：

- `docs_repo/Project/Github/moonlit-bay-trip/设计/设计方案260920.md`（v1.0：信息架构 / Token / 组件 / 动效 / 素材 / 无障碍 / 性能）
- `docs_repo/Project/Github/moonlit-bay-trip/设计/设计方案260921.md`（v2.0：视觉改版决策、字体、板块规格、新增动效、图片方案）
- 项目协作入口：同目录 `CLAUDE.md`

## 技术路线

原生 HTML/CSS/JS 单页，无框架无构建；`data-city` 属性切换三城主题（广州暖金 / 珠海海蓝 / 顺德食色）；移动端优先（微信分享场景）。

```text
moonlit-bay-trip/
├── index.html            # 语义化结构 + Web 字体（fonts.loli.net 镜像，swap）
├── css/
│   ├── tokens.css        # 设计 Token（色 / 字体 / 字号阶 / 间距 / 动效）
│   ├── base.css          # 重置 / 排版 / 章节头 / 入场动效类 / 纸纹
│   └── components.css    # 各板块组件 + 响应式
├── js/
│   ├── photos.js         # 图位 → 照片（Pexels / Unsplash 外链 + 出处）；行后换实拍只改这里
│   ├── data.js           # 行程数据（唯一数据源，行程微调只改这里）
│   └── main.js           # 渲染 / 滚动叙事 / 月相插值 / 灯箱 / 主题切换
├── tools/
│   └── download-photos.mjs   # 把外链图下载到 assets/img 并生成 photos.local.js
└── assets/img/           # 本地化后的照片（可选，默认不提交）
```

## 本地预览

```bash
npx serve .        # 或直接双击 index.html（字体与图片走外链，需联网）
```

## 图片本地化（可选）

外链依赖 Pexels / Unsplash 图床；若担心手机端加载，执行：

```bash
node tools/download-photos.mjs          # 默认 1600px 宽，写入 assets/img 与 js/photos.local.js
```

然后在 `index.html` 里 `photos.js` 之后加一行 `<script src="js/photos.local.js"></script>`。

## 约定

- 提交规范：Conventional Commits（`feat:` / `fix:` / `docs:` / `chore:`），中文描述
- 是否 push、是否发布由用户决定，不自动执行
- 图片授权：Pexels License / Unsplash License 均允许免费商用，无需署名；本页在尾声与灯箱主动标注摄影师并链回原图页
