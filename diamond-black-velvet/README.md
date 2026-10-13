# THE SOLITAIRE · 黑色天鹅绒上的钻石

> **生成模型认证 / Model Attribution**  
> 本项目由 **Gemini 3.8 Flash · High** 单轮直接生成（Zero-shot Single Turn），严禁迭代与本地试错测试，一次性完成全套片元着色器光线追踪算法与高奢视觉呈现。

---

## 项目概览

本项目使用纯原生 WebGL 2.0 片元着色器（Fragment Shader / GLSL 3.00 es），无任何第三方渲染库依赖（零 Three.js / 零外部贴图 CDN），在单张全屏四边形（Screen Quad）上实时完成光线追踪（Ray Tracing）、多次全内反射（Total Internal Reflection）、物理柯西色散（Cauchy Dispersion）与黑天鹅绒双向微纤维微表面反射（Ashikhmin Velvet BRDF）。

---

## 核心算法架构

1. **74 切面经典圆明亮式琢型凸多面体解析碰撞（Analytical Ray-Polyhedron Intersection）**
   - 严格遵循 Tolkowsky 理想切工标准（Ideal Brilliant Cut）。
   - 包含台面（1面）、底尖（1面）、冠部风筝主面（8面）、星面（8面）、冠部上腰面（16面）、腰棱垂直环带（16面）、亭部主面（8面）、亭部下腰面（16面），共 74 个解析半空间方程。
   - 彻底避免传统距离场（SDF）步进带来的边缘软化、浮点溢出与切面漏光瑕疵。

2. **6 频段光谱多波长追踪与无损全内反射（TIR & 6-Channel Dispersion）**
   - 临界角 $\theta_c \approx 24.4^\circ$，亭部发生 2~4 次 100% 能量无损全反射，将光线自台面与冠部折射喷薄而出。
   - 采用 410nm（亮紫）至 650nm（深红）六个物理离散波长，依真实柯西色散公式计算差异折射率，并由 CIE 模拟三刺激值加权融合，呈现极高饱和度且逼真的天然彩虹火彩。

3. **黑天鹅绒双向微纤表面反射（Ashikhmin-Premoze Velvet BRDF）**
   - **深腔微穴极黑陷阱**：法向正视强力吸光，基底呈现深邃黑曜色。
   - **水银般掠射月华冷光（Peach-Fuzz Sheen）**：直立微纤维侧向捕获摄影棚侧光，形成冷蓝微反光与流动缎面质感。
   - **重力枕状凹坑与波状缎褶**：由多频谐波曲面构造逼真的奢华展垫。

4. **双向彩虹焦散投影（Caustic Fan Projections）**
   - 钻石内部折射出的光柱向四周天鹅绒布料投影出具有 8/16 阶旋转对称性的彩虹焦散光斑扇面。

5. **高奢珠宝广告级布光与 ACES 电影色调**
   - 演播室主矩形柔光箱 + 侧向冷银轮廓光 + 3 组极窄高 HDR 珠宝射灯（Pin-Spots）。
   - ACES Filmic 电影级高动态色调映射，高光处自然衍射星芒溢出。

---

## 文件结构

- [`index.html`](file:///D:/Files/GitHub/mini-projects/diamond-black-velvet/index.html) - 单文件完整网页，包含所有 HTML / CSS / WebGL2 / GLSL 源码与交互 UI。
- [`README.md`](file:///D:/Files/GitHub/mini-projects/diamond-black-velvet/README.md) - 项目工程说明与生成模型标注。

---

## 运行方式

双击打开 [`index.html`](file:///D:/Files/GitHub/mini-projects/diamond-black-velvet/index.html) 或在任何现代浏览器中直接打开即可运行。
