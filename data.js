export const LEVELS = [
  { id: "red", score: 5, color: "#ef5747" },
  { id: "orange", score: 4, color: "#dc8a32" },
  { id: "yellow", score: 3, color: "#f4bf19" },
  { id: "green", score: 2, color: "#39c778" },
  { id: "blue", score: 1, color: "#3498db" },
  { id: "white", score: 0, color: "#ffffff" }
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level]));
export const LEVEL_ORDER = ["white", "blue", "green", "yellow", "orange", "red"];

export const I18N = {
  zh: {
    metaDescription: "ChinaEX 制省等级：记录走过的中国每一个省级行政区。",
    mapLabel: "中国省级行政区地图",
    mapLabels: "地区标签",
    displayNameLabel: "显示名字",
    export: "导出",
    appName: "制省等级",
    appSubtitle: "记录走过的中国每一处省级行政区",
    level: "制省等级",
    visited: "已到访 {count}/{total}",
    actions: "操作",
    setName: "设置名字",
    copyLink: "复制链接",
    share: "分享",
    shareX: "分享到 X",
    shareFacebook: "分享到 Facebook",
    exportPng: "导出 PNG",
    exportSvg: "导出 SVG",
    reset: "重置记录",
    fitMap: "适配全图",
    language: "English",
    detailsTitle: "地区详情",
    currentLevel: "当前等级",
    search: "搜索旅游信息",
    close: "关闭",
    chooseLevel: "选择足迹等级",
    nameDialogTitle: "显示名字",
    nameDialogHint: "它会显示在导出的图片和分享链接中。",
    namePlaceholder: "例如：小明",
    save: "保存",
    cancel: "取消",
    resetDialogTitle: "重置全部足迹？",
    resetDialogText: "这会清除本设备保存的所有地区等级，且无法撤销。",
    resetConfirm: "确认重置",
    copied: "分享链接已复制",
    copyFailed: "无法自动复制，请从地址栏复制链接。",
    shareText: "我的 ChinaEX 制省等级为 {level}，已到访 {count}/{total} 个省级行政区。",
    exportTitle: "{name}的制省等级：{level}",
    exportTitleAnonymous: "制省等级：{level}",
    shortNameIndex: "地图短名索引",
    noName: "未设置名字",
    mapHint: "拖动地图，双指缩放；点按地区选择等级。",
    labelSuffix: "，当前等级 {level}",
    levelLabels: {
      red: "居住（曾居住）",
      orange: "留宿（曾过夜）",
      yellow: "游览（曾游玩）",
      green: "停留（曾换乘、休息）",
      blue: "途经（曾路过）",
      white: "未到访"
    },
    levelNames: { red: "居住", orange: "留宿", yellow: "游览", green: "停留", blue: "途经", white: "未到访" }
  },
  en: {
    appName: "ChinaEX",
    appSubtitle: "Map your experience across China's province-level regions",
    metaDescription: "ChinaEX maps your experience across every province-level region in China.",
    mapLabel: "China province-level region map",
    mapLabels: "Region labels",
    displayNameLabel: "Display name",
    export: "Export",
    level: "ChinaEX level",
    visited: "Visited {count}/{total}",
    actions: "Actions",
    setName: "Set name",
    copyLink: "Copy link",
    share: "Share",
    shareX: "Share to X",
    shareFacebook: "Share to Facebook",
    exportPng: "Export PNG",
    exportSvg: "Export SVG",
    reset: "Reset map",
    fitMap: "Fit map",
    language: "中文",
    detailsTitle: "Region details",
    currentLevel: "Current level",
    search: "Search travel info",
    close: "Close",
    chooseLevel: "Choose your experience level",
    nameDialogTitle: "Display name",
    nameDialogHint: "It appears in exports and shared links.",
    namePlaceholder: "For example: Alex",
    save: "Save",
    cancel: "Cancel",
    resetDialogTitle: "Reset all experiences?",
    resetDialogText: "This removes all saved region levels from this device and cannot be undone.",
    resetConfirm: "Reset everything",
    copied: "Share link copied",
    copyFailed: "Couldn't copy automatically. Copy the URL from the address bar.",
    shareText: "My ChinaEX level is {level}; I've visited {count}/{total} province-level regions.",
    exportTitle: "{name}'s ChinaEX level: {level}",
    exportTitleAnonymous: "ChinaEX level: {level}",
    shortNameIndex: "Short-name index",
    noName: "No name set",
    mapHint: "Drag to pan, pinch to zoom, and tap a region to set its level.",
    labelSuffix: ", current level {level}",
    levelLabels: {
      red: "Lived there",
      orange: "Stayed overnight",
      yellow: "Visited",
      green: "Stopped over",
      blue: "Passed through",
      white: "Not visited"
    },
    levelNames: { red: "Lived", orange: "Stayed", yellow: "Visited", green: "Stopover", blue: "Transit", white: "Not visited" }
  }
};

// English anchors move dense labels to the nearest clear map space. The source point remains available for a leader line.
const EN_LABEL_ANCHORS = [
  null, null, null, null, null, [20.7, 13.35], [20.55, 10.05], [22.82, 10.05], [24.35, 12.3],
  [25.55, 16.7], [24.1, 14.75], [24.65, 18.1], [23.15, 21.35], [20.1, 22.25], null, [19.65, 24.38],
  [22.35, 24.38], null, null, null, [22.45, 19.2], null, null, null, null, [19.15, 11.95], [17.75, 14.25],
  null, [22.55, 16.05], null, [17.1, 18.65], [25.8, 22], null, [17.25, 12.25]
];

const REGION_TYPES = [
  "province", "province", "province", "autonomous-region", "province", "province", "municipality", "municipality", "province", "municipality",
  "province", "province", "province", "province", "autonomous-region", "special-administrative-region", "special-administrative-region", "province", "province", "province",
  "province", "province", "autonomous-region", "autonomous-region", "province", "province", "province", "province", "province", "province",
  "municipality", "province", "province", "autonomous-region"
];

// `shortEn` is deliberately readable rather than an opaque two-letter code.
export const REGIONS = [
  ["黑龙江", "Heilongjiang", "Heil.", 26, 5.5, ["黑龙江"]],
  ["吉林", "Jilin", "Jilin", 25, 8, ["吉林"]],
  ["辽宁", "Liaoning", "Liao.", 24.25, 10, ["辽宁"]],
  ["新疆", "Xinjiang", "Xin.", 5, 9, ["新疆"]],
  ["甘肃", "Gansu", "Gansu", 13, 11, ["甘肃"]],
  ["河北", "Hebei", "Hebei", 21.3, 12.55, ["河北"]],
  ["北京", "Beijing", "Beij.", 21.45, 10.6, ["北", "京"]],
  ["天津", "Tianjin", "Tian.", 22.5, 10.6, ["天", "津"]],
  ["山东", "Shandong", "Shand.", 23.5, 12.6, ["山", "东"]],
  ["上海", "Shanghai", "Shang.", 24.55, 16.55, ["沪"]],
  ["江苏", "Jiangsu", "JiangS", 24, 15.4, ["江苏"]],
  ["浙江", "Zhejiang", "Zhej.", 24, 18, ["浙江"]],
  ["福建", "Fujian", "Fuj.", 23, 21, ["福建"]],
  ["广东", "Guangdong", "Guangd.", 20.5, 22.6, ["广东"]],
  ["广西", "Guangxi", "Guangx.", 17, 22, ["广西"]],
  ["澳门", "Macao", "Macao", 20.5, 23.6, ["澳"]],
  ["香港", "Hong Kong", "HongK.", 21.5, 23.6, ["港"]],
  ["云南", "Yunnan", "Yunn.", 13, 21, ["云南"]],
  ["贵州", "Guizhou", "Guiz.", 16.5, 20, ["贵州"]],
  ["湖南", "Hunan", "Hunan", 19.5, 19.5, ["湖南"]],
  ["江西", "Jiangxi", "JiangX", 22, 19, ["江西"]],
  ["青海", "Qinghai", "Qing.", 11, 14, ["青海"]],
  ["西藏", "Tibet", "Tibet", 6, 14.5, ["西", "藏"]],
  ["内蒙古", "Inner Mongolia", "InMong", 21.5, 5, ["内", "蒙", "古"]],
  ["四川", "Sichuan", "Sich.", 14, 17, ["四川"]],
  ["山西", "Shanxi", "Shanx.", 19.5, 12.7, ["山", "西"]],
  ["陕西", "Shaanxi", "Shaan.", 18, 14.6, ["陕", "西"]],
  ["河南", "Henan", "Henan", 20.5, 15, ["河南"]],
  ["安徽", "Anhui", "Anhui", 22.5, 15.8, ["安", "徽"]],
  ["湖北", "Hubei", "Hubei", 19.5, 17, ["湖北"]],
  ["重庆", "Chongqing", "Chong.", 17, 18.6, ["重庆"]],
  ["台湾", "Taiwan", "Taiw.", 25, 22, ["台"]],
  ["海南", "Hainan", "Hain.", 18, 25.4, ["海南"]],
  ["宁夏", "Ningxia", "Ning.", 17.5, 12.7, ["宁", "夏"]]
].map(([id, en, shortEn, x, y, zhLines], index) => {
  const enAnchor = EN_LABEL_ANCHORS[index];
  return {
    id,
    zh: id,
    en,
    shortEn,
    type: REGION_TYPES[index],
    search: { zh: id, en },
    export: { shortName: shortEn },
    label: { x, y, zhLines, en: enAnchor && { x: enAnchor[0], y: enAnchor[1] } }
  };
});

export const REGION_BY_ID = Object.fromEntries(REGIONS.map((region) => [region.id, region]));
export const REGION_IDS = REGIONS.map((region) => region.id);

export function text(lang, key, values = {}) {
  let value = I18N[lang][key];
  Object.entries(values).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}


