/* ============================================================
   photos.optional.js — 可选实拍图包（Wikimedia Commons · CC 授权）
   ------------------------------------------------------------
   默认不加载：本环境的网络策略屏蔽了 upload.wikimedia.org，
   因此这些链接未经本机验证。若你的网络能访问 Wikimedia，
   在 index.html 里取消下面这行注释即可让全部图位换成实拍：

     <script src="js/photos.optional.js"></script>

   说明：链接按 Commons 图床规则（文件名 MD5 前缀）确定性构造，
   文件页即出处与作者/协议；若个别链接失效，对应图位会自动回落到
   内置 SVG 插画（渲染层已做兜底）。
   ============================================================ */

window.OPTIONAL_PHOTOS = {
  /* —— 相册 · 广州 —— */
  'gz-scene-01': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Chen_Clan_Ancestral_Hall_2025.06_03.jpg/1200px-Chen_Clan_Ancestral_Hall_2025.06_03.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Chen_Clan_Ancestral_Hall_2025.06_03.jpg',
  },
  'gz-scene-02': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Yongqingfang.jpg/1200px-Yongqingfang.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Yongqingfang.jpg',
  },
  'gz-scene-03': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Guangzhou_Shamian_2012.11.15_09-51-26.jpg/1200px-Guangzhou_Shamian_2012.11.15_09-51-26.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Guangzhou_Shamian_2012.11.15_09-51-26.jpg',
  },
  'gz-scene-04': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Sacred_Heart_Cathedral_of_Guangzhou_2025.06_02.jpg/1200px-Sacred_Heart_Cathedral_of_Guangzhou_2025.06_02.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Sacred_Heart_Cathedral_of_Guangzhou_2025.06_02.jpg',
  },
  /* —— 相册 · 珠海 —— */
  'zh-scene-01': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Male_whale_shark_at_Georgia_Aquarium.jpg/1200px-Male_whale_shark_at_Georgia_Aquarium.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Male_whale_shark_at_Georgia_Aquarium.jpg',
  },
  'zh-scene-02': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Lover%27s_Avenue_in_Zhuhai_%28cropped%29.jpg/1200px-Lover%27s_Avenue_in_Zhuhai_%28cropped%29.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Lover%27s_Avenue_in_Zhuhai_%28cropped%29.jpg',
  },
  'zh-scene-03': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Zhuhai_Grand_Theatre_Exterior_Southeast2021.jpg/1200px-Zhuhai_Grand_Theatre_Exterior_Southeast2021.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Zhuhai_Grand_Theatre_Exterior_Southeast2021.jpg',
  },
  'zh-scene-06': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Zhuhai_Railway_Station.jpg/1200px-Zhuhai_Railway_Station.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Zhuhai_Railway_Station.jpg',
  },
  /* —— 相册 · 顺德与归程 —— */
  'sd-scene-01': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Qing_Hui_Yuan.jpeg/1200px-Qing_Hui_Yuan.jpeg',
    src: 'https://commons.wikimedia.org/wiki/File:Qing_Hui_Yuan.jpeg',
    name: '清晖园',
    sub: '顺德的名片 · 留给下次',
  },
  'sd-scene-03': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/20241207_Aerial_view_of_Guangzhou_Baiyun_International_Airport.jpg/1200px-20241207_Aerial_view_of_Guangzhou_Baiyun_International_Airport.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:20241207_Aerial_view_of_Guangzhou_Baiyun_International_Airport.jpg',
    name: '归程 · 白云机场',
    sub: '月亮随行',
  },
  /* —— 美食（补齐未实拍的四道） —— */
  'gz-dimsum-03': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/GD_Rice_Product_1.JPG/1200px-GD_Rice_Product_1.JPG',
    src: 'https://commons.wikimedia.org/wiki/File:GD_Rice_Product_1.JPG',
  },
  'sd-food-01': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Double_skin_milk.jpg/1200px-Double_skin_milk.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Double_skin_milk.jpg',
  },
  'sd-food-02': {
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Sio_mei.jpg/1200px-Sio_mei.jpg',
    src: 'https://commons.wikimedia.org/wiki/File:Sio_mei.jpg',
  },
};
