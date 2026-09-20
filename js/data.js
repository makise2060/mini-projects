/* ============================================================
   data.js — 行程数据（唯一数据源）
   依据：腾讯文档《26广州出行计划》思维导图
   说明：行程若有变，只改这里，不动结构与样式。
   ============================================================ */

const TRIP = {
  meta: {
    title: '月满湾区 · 四人之行',
    kicker: '2026 中秋 · 四天三夜 · 四人之行',
    subtitle: '广州 · 珠海 · 顺德 —— 把四天走成一轮圆月',
    couples: [
      { cls: 'a', label: '君药 & Yana' },
      { cls: 'b', label: '江澈 & 陳' },
    ],
    finale: {
      line: '月亮带我们走了一程，回家。',
      sub: '下一轮满月，再出发',
      credit: '本页依据《26广州出行计划》制作 · 图位虚位以待，等四位的实拍',
    },
  },

  days: [
    {
      id: 'd24', num: '09.24', city: 'gz', cityName: '广州',
      moon: { ill: 0.85, dir: 'wax', name: '渐盈凸月' },
      mood: '温暖启程 · 月将至',
      title: '落地，月亮已经在等',
      events: [
        { t: '20:00', name: '出发 · 白云机场', desc: '四人两车，夜航落地广州' },
        { t: '夜里', name: '入住 · 鹤边亚朵', desc: '广州白云站鹤边地铁站亚朵酒店，落定即歇' },
        { t: '夜宵提案', name: '肠粉 / 糖水', desc: '第一晚的仪式感，从一盘肠粉开始' },
      ],
      badges: { move: '机场打车', stay: '鹤边亚朵' },
    },
    {
      id: 'd25', num: '09.25', city: 'gz', cityName: '广州',
      moon: { ill: 1, dir: 'full', name: '满月 · 中秋正日' },
      mood: '烟火人间 · 月满（全站高潮）',
      title: '中秋这天，把荔湾走成一条灯河',
      events: [
        { t: '08:30', name: '早茶 · 好广味', desc: '一盅两件，把日子过慢的第一步' },
        {
          fork: {
            cap: '白天 · 荔湾区 · 并行游玩',
            colA: {
              title: 'A 线 · 老城手艺',
              items: [
                { t: '9:30-10:30', n: '陈家祠', d: '灰塑与满洲窗，先看一场岭南手艺' },
                { t: '上午', n: '永庆坊', d: '老街新貌，顺手带一杯奶茶' },
                { t: '12:00', n: '裕记粥档', d: '一碗艇仔粥，把荔湾的早晨煮开了' },
              ],
            },
            colB: {
              title: 'B 线 · 江畔洋楼',
              items: [
                { t: '午后', n: '沙面岛', d: '欧式老建筑与榕树，拍照不赶时间' },
                { t: '傍晚前', n: '圣心大教堂', d: '石室哥特尖顶，抬头就震撼' },
              ],
            },
            junction: '18:00 · 西门口 C 口 汇合',
          },
        },
        { t: '18:00', name: '光孝路 · 鱼灯', desc: '两队汇合，跟着鱼灯走进中秋夜', link: 'fish' },
        { t: '18:00-19:00', name: '晚饭 · 西门口小吃', desc: '不设菜单，边走边吃' },
        { t: '20:00-21:20', name: '长隆大马戏', star: true, banner: 'circus', desc: '八点的马戏团，大人小孩一起尖叫' },
      ],
      badges: { move: '地铁 · 荔湾一线', stay: '钟村亚朵 · 看完大马戏走几步就睡' },
    },
    {
      id: 'd26', num: '09.26', city: 'zh', cityName: '珠海',
      moon: { ill: 0.85, dir: 'wane', name: '亏凸月' },
      mood: '蓝色欢乐 · 月伴海',
      title: '换一座城，把下午交给海豚和鲸鲨',
      events: [
        { t: '08:00', name: '出发 · 打车至广州南', desc: '赶高铁，行李随人' },
        { t: '08:46-09:46', name: 'C7619 · 广州南 → 珠海', train: true, desc: '一小时，从老城到海边' },
        { t: '10:03-10:30', name: 'S3841 · 珠海 → 珠海长隆', train: true, desc: '站内换乘，直达乐园门口' },
        { t: '10:30', name: '长隆海洋王国', star: true, banner: 'whale', bubbles: true, desc: '出站行李寄存，入园把一整天交给海豚和鲸鲨' },
      ],
      badges: { move: '高铁 C7619 · 城轨 S3841', stay: '全季明珠站 · 离海不远，离站很近' },
    },
    {
      id: 'd27', num: '09.27', city: 'zh', cityName: '珠海 → 顺德',
      moon: { ill: 0.7, dir: 'wane', name: '亏凸月' },
      mood: '浪漫治愈 → 饕餮回甘',
      title: '海风骑到日月贝，晚饭吃进龙江镇',
      events: [
        { t: '早上', name: 'Sea Walk · 骑行', desc: '共享单车，情侣南路 → 日月贝，把海风骑成两个人的歌' },
        { t: '上午', name: '圆明新园', desc: '湖畔亭台，骑行的中途驿站' },
        { t: '午后', name: '海天公园', desc: '海天一线，收尾这段海岸线' },
        { t: '~17:40', name: '城际 · 珠海 → 顺德学院', train: true, subCity: 'sd', desc: '傍晚移师顺德，换个频道继续吃' },
        { t: '17:46', name: '打车 · 龙江亚朵', subCity: 'sd', desc: '佛山顺德龙江会展中心亚朵酒店，寄存行李' },
        { t: '晚上', name: '龙江镇 · 晚饭', star: true, subCity: 'sd', desc: '晚饭不设限，龙江镇见' },
      ],
      badges: { move: '骑行 · 城际', stay: '龙江会展中心亚朵 · 寄存行李直奔食街' },
    },
    {
      id: 'd28', num: '09.28', city: 'sd', cityName: '顺德 → 家',
      moon: { ill: 0.6, dir: 'wane', name: '亏凸月 · 渐残' },
      mood: '余韵收尾 · 月落启新',
      title: '月亮带我们走了一程，回家',
      small: true,
      events: [
        { t: '白天', name: '归程 · 白云机场', desc: '顺德龙江镇打车直达机场，预计一个半小时内到达' },
      ],
      badges: { move: '打车 ~1.5h', stay: '各自的家' },
    },
  ],

  food: [
    { slot: 'gz-dimsum-01', cat: '广式早茶', name: '虾饺', line: '皮薄馅满，先拍照再动筷', icon: 'steamer' },
    { slot: 'gz-dimsum-02', cat: '广式早茶', name: '一盅两件', line: '凤爪配普洱，老广的慢早晨', icon: 'teacup' },
    { slot: 'gz-dimsum-03', cat: '广式早茶', name: '肠粉', line: '落地第一晚的仪式感', icon: 'roll' },
    { slot: 'gz-street-01', cat: '老城小吃', name: '艇仔粥', line: '裕记粥档 · 把荔湾的早晨煮开了', icon: 'congee' },
    { slot: 'gz-street-02', cat: '老城小吃', name: '西门口小吃', line: '不设菜单，边走边吃', icon: 'streetfood' },
    { slot: 'sd-food-01', cat: '顺德龙江', name: '双皮奶', line: '甜，是这一程的休止符', icon: 'milk' },
    { slot: 'sd-food-02', cat: '顺德龙江', name: '烧鹅', line: '皮脆那一声，是顺德在打招呼', icon: 'goose' },
    { slot: 'sd-food-03', cat: '顺德龙江', name: '龙江晚饭', line: '不设限的一餐，龙江镇见', icon: 'feast', star: true },
  ],

  album: {
    tabs: [
      { key: 'gz', label: '广州 · 荔湾烟火' },
      { key: 'zh', label: '珠海 · 海与乐园' },
      { key: 'sd', label: '顺德 · 食光归途' },
    ],
    groups: {
      gz: [
        { slot: 'gz-scene-01', name: '陈家祠', sub: '岭南建筑集大成', motif: 'hall' },
        { slot: 'gz-scene-02', name: '永庆坊', sub: '老街新貌', motif: 'fang' },
        { slot: 'gz-scene-03', name: '沙面岛', sub: '江畔洋楼', motif: 'shamian' },
        { slot: 'gz-scene-04', name: '圣心大教堂', sub: '石室哥特', motif: 'church' },
        { slot: 'gz-scene-05', name: '光孝路 · 鱼灯', sub: '中秋限定高光', motif: 'fishlamp', wide: true },
        { slot: 'gz-scene-06', name: '长隆大马戏', sub: '20:00 开演', motif: 'circus' },
      ],
      zh: [
        { slot: 'zh-scene-01', name: '海洋王国 · 鲸鲨馆', sub: '一整天的蓝色', motif: 'whale', wide: true },
        { slot: 'zh-scene-02', name: '情侣南路', sub: '海风骑行', motif: 'coast' },
        { slot: 'zh-scene-03', name: '日月贝', sub: '海边歌剧院', motif: 'shell' },
        { slot: 'zh-scene-04', name: '海天公园', sub: '海天一线', motif: 'park' },
        { slot: 'zh-scene-05', name: '圆明新园', sub: '湖畔亭台', motif: 'pavilion' },
        { slot: 'zh-scene-06', name: '珠海站', sub: '城际换乘', motif: 'station' },
      ],
      sd: [
        { slot: 'sd-scene-01', name: '龙江镇 · 食街夜色', sub: '当日味觉高潮', motif: 'street', wide: true },
        { slot: 'sd-scene-02', name: '顺德学院站', sub: '傍晚抵达', motif: 'station2' },
        { slot: 'sd-scene-03', name: '归程 · 机场高速', sub: '月亮随行', motif: 'road' },
      ],
    },
  },

  hotels: [
    { slot: 'gz-hotel-01', date: '9.24', name: '广州白云站鹤边地铁站亚朵酒店', line: '落地即歇，明早进老城', city: 'gz' },
    { slot: 'gz-hotel-02', date: '9.25', name: '广州番禺长隆钟村地铁站亚朵酒店', line: '看完大马戏走几步就睡', city: 'gz' },
    { slot: 'zh-hotel-01', date: '9.26', name: '全季珠海香洲印象城明珠站酒店', line: '离海不远，离站很近', city: 'zh' },
    { slot: 'sd-hotel-01', date: '9.27', name: '佛山顺德龙江会展中心亚朵酒店', line: '寄存行李，直奔食街', city: 'sd' },
  ],

  transit: [
    { day: '9.24', icon: 'plane', label: '出发 · 白云机场', time: '20:00', tip: '夜航落地，四人两车' },
    { day: '9.24', icon: 'car', label: '打车 → 鹤边亚朵', time: '夜里', tip: '机场进城，安顿第一晚' },
    { day: '9.25', icon: 'metro', label: '地铁 · 荔湾一线', time: '白天', tip: '陈家祠 / 永庆坊 / 沙面 / 西门口' },
    { day: '9.25', icon: 'car', label: '打车 → 钟村亚朵', time: '21:30', tip: '大马戏散场即到家' },
    { day: '9.26', icon: 'car', label: '打车 → 广州南', time: '08:00', tip: '赶高铁，掐点出发' },
    { day: '9.26', icon: 'train', label: 'C7619 广州南 → 珠海', time: '08:46→09:46', tip: '一小时，老城到海边' },
    { day: '9.26', icon: 'train', label: 'S3841 珠海 → 珠海长隆', time: '10:03→10:30', tip: '站内换乘直达乐园' },
    { day: '9.26', icon: 'car', label: '打车 → 全季明珠站', time: '晚上', tip: '玩累了直接回酒店' },
    { day: '9.27', icon: 'bike', label: '骑行 情侣南路 → 日月贝', time: '早上', tip: '海风限定 sea walk' },
    { day: '9.27', icon: 'train', label: '城际 珠海 → 顺德学院', time: '~17:40', tip: '傍晚移师顺德' },
    { day: '9.27', icon: 'car', label: '17:46 打车 → 龙江亚朵', time: '傍晚', tip: '寄存行李直奔食街' },
    { day: '9.28', icon: 'car', label: '打车 → 白云机场', time: '白天', tip: '约 1.5 小时，回家' },
  ],
};
