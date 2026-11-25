// 機場、澎湖、合歡山（11/26）：翔翔（玩具小飛機）、龜龜（綠蠵龜）、雪雪（小雪人），還有各關卡的小東西。
// 一樣是軟膠玩具質感，不描黑邊。角色 160×170；小圖 100×100。
const S = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const eyes = (x1, x2, y, r = 6) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#2a2f3a"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#2a2f3a"/><circle cx="${x1 + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/><circle cx="${x2 + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/>`;
const smile = (x, y, w = 10) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.8} ${x + w} ${y}" stroke="#2a2f3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const blush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".6"/>`;
const shadow = '<ellipse cx="80" cy="160" rx="44" ry="9" fill="#000" opacity=".08"/>';
const CV = '0 0 160 170';

// ---- 角色 ----
// 翔翔：玩具小飛機（機場），白色機身、藍色尾巴，駕駛艙是臉
export const xiangxiangSvg = () => S(`${shadow}
  <path d="M30 96 L6 60 H22 L50 92Z" fill="#3ea8e0"/>
  <path d="M52 108 L20 150 H40 L84 112Z" fill="#dfe8f5"/><path d="M52 84 L30 48 H44 L82 84Z" fill="#c9d6ea"/>
  <path d="M24 96 Q24 74 60 72 L120 72 Q150 74 152 96 Q150 118 120 120 L60 120 Q24 118 24 96Z" fill="#fbfcff"/>
  <path d="M28 104 Q60 114 148 104" stroke="#3ea8e0" stroke-width="6" fill="none"/>
  <path d="M112 76 Q140 78 146 92 H112Z" fill="#bfe6ff"/>
  ${eyes(98, 122, 92, 6)}${smile(112, 104, 8)}${blush(90, 134, 102)}
  ${[44, 58, 72].map((x) => `<circle cx="${x}" cy="90" r="4.5" fill="#bfe6ff"/>`).join('')}`, CV);
// 龜龜：玩具綠蠵龜（澎湖望安）
export const guiguiSvg = () => S(`${shadow}
  <ellipse cx="36" cy="140" rx="22" ry="11" fill="#9be3a8" transform="rotate(-20 36 140)"/><ellipse cx="124" cy="140" rx="22" ry="11" fill="#9be3a8" transform="rotate(20 124 140)"/>
  <ellipse cx="30" cy="96" rx="26" ry="12" fill="#9be3a8" transform="rotate(-30 30 96)"/><ellipse cx="130" cy="96" rx="26" ry="12" fill="#9be3a8" transform="rotate(30 130 96)"/>
  <ellipse cx="80" cy="116" rx="52" ry="40" fill="#3a9a55"/><path d="M50 100 L64 86 H96 L110 100 L98 126 H62Z" fill="#4fbf6e"/>
  <path d="M64 86 L50 100 M96 86 L110 100 M62 126 L48 134 M98 126 L112 134 M80 86 V76" stroke="#2f7f45" stroke-width="4"/>
  <circle cx="80" cy="56" r="32" fill="#9be3a8"/>${eyes(68, 92, 54, 6)}${smile(80, 68, 8)}${blush(60, 100, 64)}
  <circle cx="64" cy="40" r="4" fill="#7fc98a"/><circle cx="96" cy="40" r="4" fill="#7fc98a"/>`, CV);
// 雪雪：小雪人（合歡山），紅圍巾、紅蘿蔔鼻子、藍色毛線帽
export const xuexueSvg = () => S(`${shadow}
  <circle cx="80" cy="120" r="40" fill="#fbfdff"/><circle cx="80" cy="64" r="32" fill="#fbfdff"/>
  <ellipse cx="68" cy="112" rx="12" ry="20" fill="#e6f0fa" opacity=".8"/>
  <path d="M48 32 Q80 4 112 32 Z" fill="#3ea8e0"/><rect x="46" y="30" width="68" height="10" rx="5" fill="#ffd23f"/><circle cx="80" cy="10" r="7" fill="#fff"/>
  ${eyes(70, 90, 60, 5)}<path d="M80 68 L100 72 L80 74Z" fill="#ff8a3d"/>${blush(62, 98, 74)}
  <path d="M48 92 Q80 104 112 92 L112 102 Q80 114 48 102Z" fill="#ff4a4a"/><path d="M98 100 L104 128 L92 128 Z" fill="#ff4a4a"/>
  ${[106, 122, 138].map((y) => `<circle cx="80" cy="${y}" r="3.5" fill="#3a3550"/>`).join('')}
  <path d="M42 112 L18 96 M118 112 L142 96" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/>`, CV);

// ---- 地點圖示（世界地圖、區域地圖的標記）----
export const FAR_ICON = {
  airport: S(`<path d="M10 56 L80 50 Q96 50 96 58 Q96 64 80 64 L10 62Z" fill="#fff"/><path d="M44 56 L26 26 H38 L62 56Z M44 60 L26 90 H38 L62 60Z" fill="#dfe8f5"/><path d="M14 56 L6 40 H16 L26 56Z" fill="#3ea8e0"/>${[56, 64, 72].map((x) => `<circle cx="${x}" cy="57" r="2.2" fill="#3ea8e0"/>`).join("")}`),
  penghu: S('<path d="M50 84 C20 64 14 44 28 34 C38 27 48 32 50 42 C52 32 62 27 72 34 C86 44 80 64 50 84Z" fill="none" stroke="#8d96a3" stroke-width="7"/><path d="M50 70 C34 58 32 48 38 44 C43 41 48 44 50 49 C52 44 57 41 62 44 C68 48 66 58 50 70Z" fill="none" stroke="#a9b2bf" stroke-width="5"/><path d="M0 88 Q25 80 50 88 T100 88 V100 H0Z" fill="#3ea8e0"/>'),
  hehuan: S('<path d="M2 88 L36 30 L52 52 L70 20 L98 88Z" fill="#7aa0c8"/><path d="M28 44 L36 30 L44 42 L38 46Z M60 36 L70 20 L80 38 L70 42Z" fill="#fff"/><circle cx="20" cy="70" r="3" fill="#fff"/><circle cx="80" cy="60" r="3" fill="#fff"/><circle cx="50" cy="76" r="3" fill="#fff"/>'),
};

// ---- 機場 ----
const bag = (c, sticker = '', tag = '#ffd23f') => S(`<rect x="14" y="26" width="72" height="62" rx="12" fill="${c}"/><rect x="38" y="12" width="24" height="16" rx="6" fill="none" stroke="#3a3550" stroke-width="5"/><path d="M14 46 H86 M14 68 H86" stroke="#000" stroke-width="2" opacity=".12"/><circle cx="26" cy="92" r="5" fill="#3a3550"/><circle cx="74" cy="92" r="5" fill="#3a3550"/>${sticker}<path d="M62 16 L72 30" stroke="#3a3550" stroke-width="2"/><rect x="66" y="28" width="12" height="16" rx="2" fill="${tag}"/>`);
export const STICKER = {
  star: '<polygon points="50,40 54,50 64,50 56,56 59,66 50,60 41,66 44,56 36,50 46,50" fill="#ffd23f"/>',
  heart: '<path d="M50 66 C38 58 36 50 40 46 C44 42 49 44 50 48 C51 44 56 42 60 46 C64 50 62 58 50 66Z" fill="#ff5d73"/>',
  dino: '<path d="M36 64 Q36 50 50 50 Q56 42 62 46 Q66 50 62 54 L60 64Z" fill="#4fbf6e"/><circle cx="60" cy="48" r="1.6" fill="#2a2f3a"/>',
  moon: '<path d="M54 42 A12 12 0 1 0 60 64 A10 10 0 1 1 54 42Z" fill="#ffd23f"/>',
};
export const bagSvg = bag;
export const AIR = {
  scale: S('<rect x="8" y="60" width="84" height="22" rx="6" fill="#8a8fa0"/><rect x="30" y="40" width="40" height="18" rx="4" fill="#3a3550"/><text x="50" y="54" text-anchor="middle" font-size="12" font-weight="800" fill="#7ee06a">OK</text>'),
  tag: S(`<rect x="22" y="22" width="56" height="40" rx="6" fill="#fff" stroke="#ffd23f" stroke-width="4"/>${[30, 36, 40, 46, 50, 56, 62, 66].map((x) => `<rect x="${x}" y="30" width="${x % 3 ? 2 : 4}" height="18" fill="#3a3550"/>`).join("")}<path d="M50 62 V90" stroke="#ffd23f" stroke-width="4"/>`),
  belt: S(`<rect x="0" y="54" width="100" height="22" rx="10" fill="#4a4f5e"/>${[8, 26, 44, 62, 80].map((x) => `<rect x="${x}" y="58" width="12" height="14" rx="2" fill="#6a7080"/>`).join("")}<path d="M60 40 L80 40 L74 34 M80 40 L74 46" stroke="#7ee06a" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  tray: S('<path d="M8 40 H92 L84 76 H16Z" fill="#8a8fa0"/><path d="M14 44 H86" stroke="#bfc4cf" stroke-width="4"/>'),
  backpack: S('<rect x="22" y="22" width="56" height="70" rx="18" fill="#4a78c2"/><rect x="32" y="56" width="36" height="24" rx="8" fill="#5b8ad6"/><path d="M38 22 Q50 6 62 22" stroke="#3a3550" stroke-width="5" fill="none"/>'),
  water: S('<rect x="36" y="20" width="28" height="70" rx="10" fill="#bfe6ff"/><rect x="40" y="10" width="20" height="12" rx="3" fill="#3ea8e0"/><rect x="36" y="44" width="28" height="18" fill="#fff" opacity=".7"/>'),
  jacket: S('<path d="M30 18 L50 26 L70 18 L90 34 L82 50 L74 44 V92 H26 V44 L18 50 L10 34Z" fill="#ff8a3d"/><path d="M50 26 V92" stroke="#d66a20" stroke-width="3"/>'),
  ipad: S('<rect x="20" y="14" width="60" height="76" rx="8" fill="#3a3550"/><rect x="25" y="20" width="50" height="60" rx="3" fill="#7fd3ff"/><circle cx="50" cy="85" r="3" fill="#8a8fa0"/>'),
  robot: S('<rect x="30" y="34" width="40" height="40" rx="8" fill="#c9d3dc"/><rect x="36" y="14" width="28" height="22" rx="6" fill="#aab3bf"/><circle cx="44" cy="25" r="3.5" fill="#3ea8e0"/><circle cx="56" cy="25" r="3.5" fill="#3ea8e0"/><path d="M50 14 V6" stroke="#8a94a3" stroke-width="3"/><rect x="34" y="74" width="10" height="16" fill="#aab3bf"/><rect x="56" y="74" width="10" height="16" fill="#aab3bf"/>'),
  book: S('<path d="M14 26 Q32 18 50 26 Q68 18 86 26 V84 Q68 76 50 84 Q32 76 14 84Z" fill="#fff"/><path d="M50 26 V84" stroke="#bfb6a6" stroke-width="3"/><path d="M14 26 V84" stroke="#ff5d73" stroke-width="6"/>'),
  shirt: S('<path d="M30 18 L50 24 L70 18 L90 34 L80 46 L72 40 V88 H28 V40 L20 46 L10 34Z" fill="#7ee06a"/>'),
  plane: S('<path d="M6 54 L84 50 Q98 50 98 56 Q98 62 84 62 L6 60Z" fill="#fff"/><path d="M40 54 L22 30 H34 L58 54Z" fill="#dfe8f5"/><path d="M10 54 L4 36 H14 L22 54Z" fill="#3ea8e0"/>'),
  speaker: S('<path d="M20 40 H36 L58 22 V78 L36 60 H20Z" fill="#3a3550"/><path d="M68 36 Q78 50 68 64 M76 28 Q92 50 76 72" stroke="#3a3550" stroke-width="5" fill="none" stroke-linecap="round"/>'),
  seatUp: S('<path d="M30 14 H58 Q64 14 62 22 L56 70 H30Z" fill="#3e6fb8"/><rect x="24" y="68" width="50" height="16" rx="6" fill="#3e6fb8"/><path d="M78 20 V60 M70 28 L78 20 L86 28" stroke="#7ee06a" stroke-width="5" fill="none" stroke-linecap="round"/>'),
  earFace: S('<circle cx="50" cy="52" r="30" fill="#ffd9b8"/><ellipse cx="18" cy="52" rx="7" ry="10" fill="#ffd9b8"/><ellipse cx="82" cy="52" rx="7" ry="10" fill="#ffd9b8"/><path d="M38 44 Q42 40 46 44 M54 44 Q58 40 62 44" stroke="#2a2f3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M40 64 Q50 58 60 64" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M4 36 q-4 8 0 16 M96 36 q4 8 0 16 M8 28 q-8 14 0 30 M92 28 q8 14 0 30" stroke="#ff8a3d" stroke-width="3" fill="none"/>'),
  swallow: S('<circle cx="50" cy="46" r="30" fill="#ffd9b8"/><circle cx="40" cy="40" r="4" fill="#2a2f3a"/><circle cx="60" cy="40" r="4" fill="#2a2f3a"/><path d="M42 56 Q50 62 58 56" stroke="#7a3b2e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 78 V92 M44 86 L50 92 L56 86" stroke="#3ea8e0" stroke-width="4" fill="none" stroke-linecap="round"/>'),
  yawn: S('<circle cx="50" cy="48" r="32" fill="#ffd9b8"/><path d="M36 38 Q40 34 44 38 M56 38 Q60 34 64 38" stroke="#2a2f3a" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="60" rx="10" ry="13" fill="#c2344a"/><text x="78" y="26" font-size="18" fill="#7a8aa0" font-weight="800">z</text>'),
  drink: S('<path d="M34 24 H66 L62 88 H38Z" fill="#fff"/><path d="M36 44 H64 L61 84 H39Z" fill="#7fd3ff"/><path d="M58 10 L52 40" stroke="#ff5d73" stroke-width="5" stroke-linecap="round"/>'),
  walk: S('<circle cx="50" cy="18" r="10" fill="#ffd9b8"/><rect x="42" y="28" width="16" height="28" rx="7" fill="#4a78c2"/><path d="M44 56 L36 80 M56 56 L66 78 M42 34 L28 46 M58 34 L72 26" stroke="#ffd9b8" stroke-width="6" stroke-linecap="round"/><path d="M78 76 L90 64 M90 76 L78 64" stroke="#ff4a4a" stroke-width="5" stroke-linecap="round"/><rect x="66" y="6" width="28" height="16" rx="4" fill="#ffd23f"/><path d="M74 14 H86" stroke="#3a3550" stroke-width="3"/>'),
};
// 登機門的四個顏色
export const GATE_COLORS = { red: '#ff5d5d', green: '#46b46a', blue: '#3ea8e0', yellow: '#ffc21a' };

// ---- 澎湖 ----
export const PH = {
  stone: S('<path d="M14 70 Q10 44 34 36 Q56 28 76 40 Q92 52 86 70Z" fill="#8d96a3"/><path d="M30 46 Q44 38 58 42" stroke="#fff" stroke-width="4" opacity=".3" fill="none"/>'),
  fish: S('<ellipse cx="44" cy="50" rx="30" ry="16" fill="#ffb627"/><path d="M72 50 L92 36 V64Z" fill="#ffb627"/><circle cx="26" cy="46" r="3.5" fill="#2a2f3a"/>'),
  crab: S(`<ellipse cx="50" cy="60" rx="26" ry="18" fill="#ff7a4a"/><path d="M22 44 Q10 30 20 22 Q28 30 26 40Z M78 44 Q90 30 80 22 Q72 30 74 40Z" fill="#ff7a4a"/>${eyes(42, 58, 46, 4)}`),
  shoes: S('<path d="M8 66 Q8 44 30 46 L46 50 Q54 52 54 62 V74 H10Z" fill="#46b46a"/><path d="M46 66 Q46 44 68 46 L84 50 Q92 52 92 62 V74 H48Z" fill="#3ea8e0"/><path d="M10 74 H54 M48 74 H92" stroke="#3a3550" stroke-width="5" stroke-dasharray="4 3"/>'),
  camera: S('<rect x="14" y="30" width="72" height="50" rx="10" fill="#3a3550"/><rect x="34" y="20" width="24" height="14" rx="4" fill="#3a3550"/><circle cx="50" cy="55" r="16" fill="#7fd3ff"/><circle cx="50" cy="55" r="8" fill="#2a2f3a"/>'),
  takeCrab: S('<rect x="20" y="40" width="50" height="46" rx="8" fill="#bfe6ff" opacity=".9"/><path d="M20 40 H70" stroke="#3ea8e0" stroke-width="4"/><ellipse cx="45" cy="70" rx="14" ry="9" fill="#ff7a4a"/><path d="M76 30 L60 50" stroke="#ffd9b8" stroke-width="8" stroke-linecap="round"/>'),
  flipRock: S('<path d="M10 76 Q14 54 40 50 Q66 46 86 62 L80 80Z" fill="#8d96a3" transform="rotate(-25 50 66)"/><path d="M30 86 Q50 80 70 86" stroke="#7fd3ff" stroke-width="5" fill="none"/><ellipse cx="50" cy="84" rx="8" ry="4" fill="#ff7a4a"/>'),
  tideUp: S('<path d="M0 54 Q25 44 50 54 T100 54 V100 H0Z" fill="#2f8fd0"/><circle cx="50" cy="40" r="9" fill="#ffd9b8"/><rect x="42" y="49" width="16" height="12" rx="5" fill="#ff8fb8"/><path d="M14 30 L22 20 L30 30 M70 26 L78 16 L86 26" stroke="#2f8fd0" stroke-width="4" fill="none"/>'),
  adult: null,   // 用 personSvg('dad')
  turtle: S('<ellipse cx="50" cy="60" rx="34" ry="24" fill="#3a9a55"/><path d="M30 54 L40 44 H60 L70 54 L62 70 H38Z" fill="#4fbf6e"/><circle cx="88" cy="56" r="10" fill="#9be3a8"/><circle cx="92" cy="54" r="2" fill="#2a2f3a"/><ellipse cx="24" cy="80" rx="12" ry="6" fill="#9be3a8"/><ellipse cx="74" cy="82" rx="12" ry="6" fill="#9be3a8"/>'),
  baby: S('<ellipse cx="46" cy="58" rx="20" ry="14" fill="#3a9a55"/><circle cx="70" cy="54" r="8" fill="#9be3a8"/><circle cx="73" cy="52" r="1.8" fill="#2a2f3a"/><ellipse cx="32" cy="70" rx="8" ry="4" fill="#9be3a8"/><ellipse cx="58" cy="72" rx="8" ry="4" fill="#9be3a8"/>'),
  eggs: S(`${[[36, 60], [50, 56], [64, 60], [43, 70], [57, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#fff8ea"/>`).join("")}<path d="M16 76 Q50 90 84 76" stroke="#d9c08a" stroke-width="6" fill="none"/>`),
  torchOn: S('<rect x="14" y="44" width="46" height="18" rx="6" fill="#3a3550"/><path d="M60 40 H70 L92 22 V84 L70 66 H60Z" fill="#ffd23f"/><path d="M92 22 L100 10 M92 84 L100 96" stroke="#ffd23f" stroke-width="4"/>'),
  torchOff: S('<rect x="14" y="44" width="46" height="18" rx="6" fill="#3a3550"/><path d="M60 40 H70 L80 34 V72 L70 66 H60Z" fill="#6a7080"/>'),
  radioOn: S('<rect x="14" y="34" width="72" height="46" rx="10" fill="#ff8a3d"/><circle cx="36" cy="57" r="12" fill="#3a3550"/><rect x="56" y="46" width="22" height="8" rx="3" fill="#fff"/><path d="M78 20 q6 6 0 12 M88 14 q10 12 0 24" stroke="#ff4a4a" stroke-width="4" fill="none"/><text x="10" y="26" font-size="18" fill="#ff4a4a" font-weight="800">♪</text>'),
  radioOff: S('<rect x="14" y="34" width="72" height="46" rx="10" fill="#c9b8a8"/><circle cx="36" cy="57" r="12" fill="#6a7080"/><rect x="56" y="46" width="22" height="8" rx="3" fill="#eee"/>'),
  rope: S(`<path d="M4 70 H96" stroke="#c9302a" stroke-width="5" stroke-dasharray="10 6"/>${[10, 50, 90].map((x) => `<rect x="${x - 3}" y="50" width="6" height="36" fill="#8a5a32"/>`).join("")}`),
};
// 玄武岩柱（從旁邊看）：高 h 格
export const basalt = (h, c = '#5b6170') => { const top = 276 - h * 42; return S(`<rect x="16" y="${top}" width="68" height="${h * 42}" fill="${c}"/><path d="M16 ${top} L30 ${top - 10} H70 L84 ${top}Z" fill="#7d8494"/><path d="M38 ${top} V276 M62 ${top} V276" stroke="#000" stroke-width="2.5" opacity=".15"/>${[...Array(h)].map((_, i) => `<path d="M16 ${276 - i * 42} H84" stroke="#000" stroke-width="2" opacity=".1"/>`).join('')}`, '0 0 100 280'); };

// ---- 合歡山 ----
export const HH = {
  inner: S('<path d="M30 18 L50 24 L70 18 L88 30 L82 60 L74 56 V92 H26 V56 L18 60 L12 30Z" fill="#f4f1ea"/><path d="M42 20 Q50 30 58 20" stroke="#cfc8bb" stroke-width="3" fill="none"/>'),
  sweater: S(`<path d="M30 16 L50 24 L70 16 L90 30 L86 70 L76 66 V92 H24 V66 L14 70 L10 30Z" fill="#ff5d73"/>${[40, 56, 72].map((y) => `<path d="M24 ${y} H76" stroke="#fff" stroke-width="4" stroke-dasharray="6 5"/>`).join("")}<path d="M40 18 Q50 30 60 18" stroke="#d94a5e" stroke-width="5" fill="none"/>`),
  coat: S(`<path d="M28 12 L50 22 L72 12 L94 28 L90 80 L78 76 V96 H22 V76 L10 80 L6 28Z" fill="#3e6fb8"/>${[30, 48, 66, 84].map((y) => `<path d="M22 ${y} H78" stroke="#2f5a9a" stroke-width="3"/>`).join("")}<path d="M50 22 V96" stroke="#ffd23f" stroke-width="3"/><path d="M36 14 Q50 4 64 14" stroke="#fff" stroke-width="8" fill="none"/>`),
  beanie: S('<path d="M18 66 Q18 22 50 22 Q82 22 82 66Z" fill="#ffd23f"/><rect x="14" y="60" width="72" height="16" rx="8" fill="#ff8a3d"/><circle cx="50" cy="18" r="9" fill="#fff"/>'),
  gloves: S('<path d="M14 80 V48 Q14 36 26 36 Q38 36 38 48 V80Z M38 52 L46 44" fill="#46b46a"/><path d="M58 80 V48 Q58 36 70 36 Q82 36 82 48 V80Z" fill="#46b46a"/><rect x="12" y="76" width="28" height="10" rx="4" fill="#fff"/><rect x="56" y="76" width="28" height="10" rx="4" fill="#fff"/><path d="M14 56 L6 48 M82 56 L90 48" stroke="#46b46a" stroke-width="8" stroke-linecap="round"/>'),
  shorts: S('<path d="M20 26 H80 L86 74 H58 L50 46 L42 74 H14Z" fill="#ffb627"/><text x="66" y="22" font-size="22">☀</text>'),
  flipflop: S('<ellipse cx="34" cy="56" rx="16" ry="32" fill="#ff8fb8"/><ellipse cx="68" cy="56" rx="16" ry="32" fill="#ff8fb8"/><path d="M34 34 L26 50 M34 34 L42 50 M68 34 L60 50 M68 34 L76 50" stroke="#3a3550" stroke-width="3"/>'),
  ball: S('<circle cx="50" cy="52" r="38" fill="#fbfdff"/><ellipse cx="38" cy="40" rx="12" ry="16" fill="#e6f0fa"/>'),
  coal: S('<circle cx="34" cy="50" r="10" fill="#2a2f3a"/><circle cx="66" cy="50" r="10" fill="#2a2f3a"/><circle cx="37" cy="47" r="3" fill="#fff" opacity=".6"/><circle cx="69" cy="47" r="3" fill="#fff" opacity=".6"/>'),
  carrot: S('<path d="M14 50 L86 40 L86 60Z" fill="#ff8a3d"/><path d="M86 40 L96 34 M86 50 L98 50 M86 60 L96 66" stroke="#4fbf6e" stroke-width="5" stroke-linecap="round"/>'),
  scarf: S('<path d="M10 40 Q50 56 90 40 L90 56 Q50 72 10 56Z" fill="#ff4a4a"/><path d="M66 58 L74 92 H58 Z" fill="#ff4a4a"/><path d="M20 46 V58 M40 52 V64 M60 52 V64 M80 46 V58" stroke="#fff" stroke-width="3"/>'),
  boot: S('<path d="M30 14 H58 V60 L86 66 Q94 70 92 84 H30Z" fill="#8a5a32"/><rect x="28" y="80" width="66" height="10" rx="4" fill="#3a3550"/>'),
  breath: S('<circle cx="40" cy="50" r="28" fill="#ffd9b8"/><circle cx="32" cy="44" r="3.5" fill="#2a2f3a"/><circle cx="48" cy="44" r="3.5" fill="#2a2f3a"/><ellipse cx="40" cy="62" rx="6" ry="4" fill="#c2344a"/><path d="M70 50 q8 -4 16 0 M72 62 q8 -4 16 0 M70 38 q8 -4 16 0" stroke="#9fc7e6" stroke-width="4" fill="none" stroke-linecap="round"/>'),
  foot: S(`<path d="M36 12 Q58 10 60 34 Q62 54 56 72 Q50 90 36 86 Q24 82 26 60 Q28 40 24 26 Q24 14 36 12Z" fill="#8a5a32"/>${[[32, 6], [42, 4], [52, 6], [60, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#8a5a32"/>`).join("")}`),
};

// ---- 花東（11/26）----
// 飄飄：彩色熱氣球（台東鹿野），氣球上是臉，下面吊著小籃子
export const piaopiaoSvg = () => S(`${shadow}
  <path d="M80 8 C126 8 146 44 140 72 C134 98 108 112 96 122 H64 C52 112 26 98 20 72 C14 44 34 8 80 8Z" fill="#ff8a3d"/>
  <path d="M80 8 C100 8 108 44 106 72 C104 98 94 112 90 122 H70 C66 112 56 98 54 72 C52 44 60 8 80 8Z" fill="#ffd23f"/>
  <path d="M80 8 C86 8 88 44 88 72 C88 98 84 112 82 122 H78 C76 112 72 98 72 72 C72 44 74 8 80 8Z" fill="#46b46a"/>
  <path d="M30 44 Q80 54 130 44" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>
  ${eyes(66, 94, 68, 6)}${smile(80, 82, 9)}${blush(56, 104, 80)}
  <path d="M64 122 L66 136 M96 122 L94 136" stroke="#8a5a32" stroke-width="3"/>
  <rect x="60" y="134" width="40" height="22" rx="5" fill="#c98b5e"/><path d="M60 142 H100 M60 150 H100" stroke="#a86b3c" stroke-width="2"/>`, CV);
FAR_ICON.huadong = S('<path d="M50 6 C76 6 86 28 82 46 C78 60 64 68 58 74 H42 C36 68 22 60 18 46 C14 28 24 6 50 6Z" fill="#ff8a3d"/><path d="M50 6 C60 6 64 28 62 46 C60 60 54 68 52 74 H48 C46 68 40 60 38 46 C36 28 40 6 50 6Z" fill="#ffd23f"/><rect x="40" y="80" width="20" height="12" rx="3" fill="#c98b5e"/><path d="M42 74 L42 80 M58 74 L58 80" stroke="#8a5a32" stroke-width="2"/>');
export const HD = {
  helmet: S('<path d="M14 64 Q14 22 50 22 Q86 22 86 64Z" fill="#ffd23f"/><rect x="10" y="60" width="80" height="12" rx="6" fill="#f0b800"/><path d="M34 26 Q50 18 66 26 L62 40 Q50 34 38 40Z" fill="#fff" opacity=".5"/><path d="M30 72 Q30 86 44 86" stroke="#3a3550" stroke-width="4" fill="none"/>'),
  bird: S('<path d="M10 50 Q30 34 46 46 L50 50 L54 46 Q70 34 90 50 Q70 44 58 54 L64 72 L50 60 L36 72 L42 54 Q30 44 10 50Z" fill="#2f3a6a"/><circle cx="50" cy="50" r="6" fill="#ff8a3d"/>'),
  bridge: S(`<path d="M4 40 Q50 80 96 40" stroke="#ff4a4a" stroke-width="6" fill="none"/><path d="M4 62 Q50 74 96 62" stroke="#8a5a32" stroke-width="8" fill="none"/>${[16, 30, 44, 58, 72, 86].map((x, i) => `<path d="M${x} ${46 + Math.sin(i / 1.6) * 12} V${66 + Math.sin(i / 1.6) * 3}" stroke="#ff4a4a" stroke-width="2"/>`).join("")}<rect x="0" y="30" width="8" height="40" fill="#7d8494"/><rect x="92" y="30" width="8" height="40" fill="#7d8494"/>`),
  monkey: S('<circle cx="50" cy="40" r="20" fill="#a9744f"/><ellipse cx="50" cy="45" rx="12" ry="10" fill="#f2c7a0"/><circle cx="44" cy="40" r="3" fill="#2a2f3a"/><circle cx="56" cy="40" r="3" fill="#2a2f3a"/><ellipse cx="50" cy="72" rx="18" ry="16" fill="#a9744f"/><path d="M68 76 Q86 70 84 52" stroke="#a9744f" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="30" cy="38" r="6" fill="#f2c7a0"/><circle cx="70" cy="38" r="6" fill="#f2c7a0"/>'),
  waterfall: S('<rect x="10" y="10" width="26" height="80" fill="#7d8494"/><rect x="64" y="10" width="26" height="80" fill="#7d8494"/><rect x="36" y="10" width="28" height="74" fill="#bfe9ff"/><path d="M40 14 V80 M50 14 V82 M60 14 V80" stroke="#fff" stroke-width="3" opacity=".8"/><ellipse cx="50" cy="88" rx="26" ry="8" fill="#7fd3ff"/><path d="M38 4 H62 L58 10 H42Z" fill="#c9553a"/>'),
  signL: S('<circle cx="50" cy="50" r="42" fill="#3ea8e0"/><path d="M70 50 H32 M46 34 L30 50 L46 66" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  signR: S('<circle cx="50" cy="50" r="42" fill="#3ea8e0"/><path d="M30 50 H68 M54 34 L70 50 L54 66" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  signDown: S('<path d="M50 8 L94 88 H6Z" fill="#ffd23f" stroke="#ff4a4a" stroke-width="6" stroke-linejoin="round"/><path d="M24 76 L76 46" stroke="#3a3550" stroke-width="8" stroke-linecap="round"/><circle cx="40" cy="58" r="6" fill="#3a3550"/>'),
  signWalk: S('<path d="M50 8 L94 88 H6Z" fill="#ffd23f" stroke="#ff4a4a" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="38" r="7" fill="#3a3550"/><path d="M50 46 V62 M50 62 L42 78 M50 62 L58 78 M50 50 L40 58 M50 50 L60 56" stroke="#3a3550" stroke-width="6" stroke-linecap="round"/>'),
  handL: S('<circle cx="62" cy="62" r="16" fill="#ffd9b8"/><rect x="56" y="70" width="14" height="24" rx="6" fill="#4a78c2"/><path d="M58 58 L20 58" stroke="#ffd9b8" stroke-width="10" stroke-linecap="round"/><path d="M26 44 L12 58 L26 72" stroke="#3ea8e0" stroke-width="6" fill="none" stroke-linecap="round"/><text x="70" y="30" font-size="24" font-weight="800" fill="#3a3550">L</text>'),
  handR: S('<circle cx="38" cy="62" r="16" fill="#ffd9b8"/><rect x="30" y="70" width="14" height="24" rx="6" fill="#4a78c2"/><path d="M42 58 L80 58" stroke="#ffd9b8" stroke-width="10" stroke-linecap="round"/><path d="M74 44 L88 58 L74 72" stroke="#3ea8e0" stroke-width="6" fill="none" stroke-linecap="round"/><text x="12" y="30" font-size="24" font-weight="800" fill="#3a3550">R</text>'),
  brake: S('<path d="M14 40 H70" stroke="#3a3550" stroke-width="10" stroke-linecap="round"/><path d="M60 46 Q84 56 88 76" stroke="#ff4a4a" stroke-width="9" fill="none" stroke-linecap="round"/><rect x="8" y="30" width="20" height="20" rx="6" fill="#555b6a"/><circle cx="50" cy="80" r="12" fill="none" stroke="#ff4a4a" stroke-width="5"/><path d="M50 68 V92" stroke="#ff4a4a" stroke-width="5"/>'),
  cloud: S('<ellipse cx="50" cy="56" rx="44" ry="24" fill="#fff"/><ellipse cx="34" cy="44" rx="22" ry="20" fill="#fff"/><ellipse cx="64" cy="40" rx="24" ry="22" fill="#fff"/>'),
  fire: S('<path d="M50 90 C24 80 26 54 40 40 C40 54 48 56 50 46 C50 30 58 18 66 10 C64 30 82 44 78 64 C76 80 66 88 50 90Z" fill="#ff8a3d"/><path d="M50 88 C38 82 40 66 48 58 C50 68 58 66 58 58 C66 68 66 82 50 88Z" fill="#ffd23f"/>'),
  dolphin: S('<path d="M12 62 Q20 30 56 28 Q80 28 90 40 L96 30 L96 54 L86 50 Q74 66 46 66 Q30 66 22 72 L20 60Z" fill="#6f8fb8"/><path d="M50 28 L58 14 L64 30Z" fill="#6f8fb8"/><path d="M24 60 Q48 64 80 54" stroke="#dbe6f4" stroke-width="6" fill="none"/><circle cx="26" cy="46" r="3" fill="#2a2f3a"/>'),
  whale: S('<path d="M6 60 Q10 34 46 32 Q78 32 86 50 L98 40 L96 70 L86 62 Q72 78 42 76 Q12 76 6 60Z" fill="#4f6f9a"/><circle cx="20" cy="54" r="3" fill="#2a2f3a"/><path d="M40 26 Q36 10 28 6 M44 26 Q46 8 54 2 M48 28 Q56 14 66 12" stroke="#bfe9ff" stroke-width="5" fill="none" stroke-linecap="round"/>'),
  rice: S(`<rect x="4" y="50" width="92" height="44" rx="6" fill="#8fd36a"/>${[14, 30, 46, 62, 78].map((x) => `<path d="M${x} 90 V58 M${x} 64 L${x - 6} 54 M${x} 64 L${x + 6} 54" stroke="#4f9a44" stroke-width="3"/>`).join("")}`),
  bikeKid: null,
};
