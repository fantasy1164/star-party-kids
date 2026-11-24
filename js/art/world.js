// 世界地圖擴大（11/24）：新角色、動物、垃圾車、各地點的小東西。
// 一樣是軟膠玩具質感，不描黑邊。角色 160×170；小圖 100×100。
const S = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const eyes = (x1, x2, y, r = 6) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#2a2f3a"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#2a2f3a"/><circle cx="${x1 + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/><circle cx="${x2 + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/>`;
const smile = (x, y, w = 10) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.8} ${x + w} ${y}" stroke="#2a2f3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const blush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".6"/>`;
const shadow = '<ellipse cx="80" cy="160" rx="44" ry="9" fill="#000" opacity=".08"/>';
const CV = '0 0 160 170';

// ---- 新角色 ----
// 嘩嘩：玩具消防栓（消防局），戴消防帽
export const huahuaSvg = () => S(`${shadow}<rect x="44" y="70" width="72" height="84" rx="16" fill="#ff4a4a"/><rect x="24" y="92" width="24" height="26" rx="8" fill="#e03535"/><rect x="112" y="92" width="24" height="26" rx="8" fill="#e03535"/>
  <circle cx="30" cy="105" r="7" fill="#ffd23f"/><circle cx="130" cy="105" r="7" fill="#ffd23f"/><rect x="36" y="146" width="88" height="14" rx="6" fill="#c92a2a"/>
  <path d="M38 70 Q80 18 122 70Z" fill="#ffd23f"/><rect x="30" y="64" width="100" height="12" rx="6" fill="#f0b800"/><rect x="72" y="30" width="16" height="26" rx="6" fill="#f0b800"/>
  ${eyes(66, 94, 98)}${smile(80, 116)}${blush(56, 104, 112)}`, CV);
// 咻咻：玩具捷運車廂
export const xiuxiuSvg = () => S(`${shadow}<rect x="30" y="30" width="100" height="120" rx="30" fill="#f4f6fb"/><rect x="30" y="112" width="100" height="14" fill="#3ea8e0"/>
  <rect x="44" y="44" width="72" height="44" rx="14" fill="#bfe6ff"/>${eyes(66, 94, 66, 7)}${smile(80, 80, 9)}
  <circle cx="46" cy="138" r="7" fill="#ffd23f"/><circle cx="114" cy="138" r="7" fill="#ffd23f"/><rect x="58" y="150" width="14" height="10" fill="#8a8fa0"/><rect x="88" y="150" width="14" height="10" fill="#8a8fa0"/>`, CV);
// 咕咕：圖書館的貓頭鷹（戴眼鏡）
export const guguSvg = () => S(`${shadow}<ellipse cx="80" cy="100" rx="50" ry="58" fill="#b48a6a"/><ellipse cx="80" cy="116" rx="32" ry="38" fill="#f1dcc0"/>
  <path d="M36 50 L46 26 L62 46Z M124 50 L114 26 L98 46Z" fill="#b48a6a"/><circle cx="62" cy="76" r="18" fill="#fff"/><circle cx="98" cy="76" r="18" fill="#fff"/>
  <circle cx="62" cy="76" r="18" fill="none" stroke="#4a3b6b" stroke-width="4"/><circle cx="98" cy="76" r="18" fill="none" stroke="#4a3b6b" stroke-width="4"/><path d="M80 76 H80" stroke="#4a3b6b" stroke-width="4"/>
  <circle cx="63" cy="77" r="7" fill="#2a2f3a"/><circle cx="97" cy="77" r="7" fill="#2a2f3a"/><path d="M74 92 L80 102 L86 92Z" fill="#ffb627"/>
  <rect x="52" y="128" width="56" height="18" rx="4" fill="#ff5d73"/><rect x="56" y="131" width="48" height="12" fill="#fff8ea"/>`, CV);
// 信信：綠色郵筒（台灣郵筒綠色寄平信、紅色寄限時）
export const xinxinSvg = () => S(`${shadow}<rect x="40" y="52" width="80" height="102" rx="12" fill="#2fa65a"/><path d="M36 58 Q80 10 124 58Z" fill="#2fa65a"/><rect x="36" y="52" width="88" height="10" rx="5" fill="#238a49"/>
  <rect x="56" y="70" width="48" height="8" rx="4" fill="#1d5a33"/>${eyes(66, 94, 100)}${smile(80, 118)}${blush(56, 104, 114)}<rect x="48" y="150" width="64" height="10" rx="4" fill="#238a49"/>`, CV);
// 白白：玩具白鯨（海生館）
export const baibaiSvg = () => S(`${shadow}<path d="M20 110 Q20 50 84 46 Q140 44 142 96 Q144 140 92 146 Q40 150 20 110Z" fill="#eef6ff"/><ellipse cx="84" cy="64" rx="30" ry="16" fill="#fff" opacity=".7"/>
  <path d="M120 128 L150 150 L146 120Z" fill="#dbe8f7"/><path d="M60 140 L48 160 L74 148Z" fill="#dbe8f7"/>${eyes(70, 106, 92)}${smile(88, 112, 12)}${blush(60, 116, 108)}`, CV);
// 夾夾：玩具小螃蟹（沙灘）
export const jiajiaSvg = () => S(`${shadow}<ellipse cx="80" cy="110" rx="52" ry="38" fill="#ff7a4a"/><path d="M28 70 Q8 50 22 34 Q36 44 30 58 Q44 52 40 70Z" fill="#ff7a4a"/><path d="M132 70 Q152 50 138 34 Q124 44 130 58 Q116 52 120 70Z" fill="#ff7a4a"/>
  <path d="M34 120 L12 132 M36 132 L16 148 M126 120 L148 132 M124 132 L144 148" stroke="#e85d30" stroke-width="7" stroke-linecap="round"/>
  <rect x="62" y="60" width="6" height="22" fill="#e85d30"/><rect x="92" y="60" width="6" height="22" fill="#e85d30"/><circle cx="65" cy="58" r="10" fill="#fff"/><circle cx="95" cy="58" r="10" fill="#fff"/><circle cx="66" cy="59" r="5" fill="#2a2f3a"/><circle cx="96" cy="59" r="5" fill="#2a2f3a"/>
  ${smile(80, 112, 12)}${blush(58, 102, 106)}`, CV);
// 竹竹：玩具熊貓（動物園）
export const zhuzhuSvg = () => S(`${shadow}<ellipse cx="80" cy="122" rx="44" ry="36" fill="#fff"/><ellipse cx="46" cy="128" rx="14" ry="20" fill="#2a2f3a"/><ellipse cx="114" cy="128" rx="14" ry="20" fill="#2a2f3a"/>
  <circle cx="80" cy="70" r="42" fill="#fff"/><circle cx="46" cy="38" r="14" fill="#2a2f3a"/><circle cx="114" cy="38" r="14" fill="#2a2f3a"/>
  <ellipse cx="64" cy="70" rx="11" ry="14" fill="#2a2f3a" transform="rotate(-20 64 70)"/><ellipse cx="96" cy="70" rx="11" ry="14" fill="#2a2f3a" transform="rotate(20 96 70)"/>
  <circle cx="66" cy="70" r="4" fill="#fff"/><circle cx="94" cy="70" r="4" fill="#fff"/><ellipse cx="80" cy="86" rx="6" ry="4" fill="#2a2f3a"/>${smile(80, 92, 7)}${blush(54, 106, 88)}
  <rect x="118" y="80" width="8" height="70" rx="4" fill="#7ed36a" transform="rotate(15 122 115)"/>`, CV);

// ---- 動物（動物園、海生館、ABC）----
export const ZOO = {
  panda: S(`<ellipse cx="50" cy="66" rx="30" ry="24" fill="#fff"/><circle cx="50" cy="40" r="24" fill="#fff"/><circle cx="31" cy="20" r="8" fill="#2a2f3a"/><circle cx="69" cy="20" r="8" fill="#2a2f3a"/><ellipse cx="41" cy="40" rx="6" ry="8" fill="#2a2f3a"/><ellipse cx="59" cy="40" rx="6" ry="8" fill="#2a2f3a"/><circle cx="42" cy="40" r="2" fill="#fff"/><circle cx="58" cy="40" r="2" fill="#fff"/><ellipse cx="50" cy="50" rx="4" ry="3" fill="#2a2f3a"/><ellipse cx="28" cy="70" rx="8" ry="12" fill="#2a2f3a"/><ellipse cx="72" cy="70" rx="8" ry="12" fill="#2a2f3a"/>`),
  koala: S(`<ellipse cx="50" cy="68" rx="26" ry="24" fill="#a9adb8"/><circle cx="50" cy="42" r="24" fill="#b8bcc6"/><circle cx="26" cy="30" r="13" fill="#b8bcc6"/><circle cx="74" cy="30" r="13" fill="#b8bcc6"/><circle cx="26" cy="30" r="7" fill="#fff"/><circle cx="74" cy="30" r="7" fill="#fff"/><ellipse cx="50" cy="48" rx="7" ry="9" fill="#3a3550"/>${eyes(40, 60, 38, 3.5)}<rect x="70" y="20" width="6" height="76" rx="3" fill="#8a6a4a"/>`),
  giraffe: S(`<rect x="44" y="20" width="14" height="50" rx="6" fill="#ffc94a"/><ellipse cx="54" cy="74" rx="28" ry="16" fill="#ffc94a"/><ellipse cx="54" cy="18" rx="14" ry="10" fill="#ffc94a"/><path d="M48 8 V2 M58 8 V2" stroke="#a86b3c" stroke-width="3"/>${[[46, 34], [54, 50], [44, 62], [62, 70], [40, 76], [70, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#d08a3a"/>`).join('')}<circle cx="58" cy="16" r="2" fill="#2a2f3a"/>${[32, 44, 62, 74].map((x) => `<rect x="${x}" y="84" width="6" height="14" fill="#ffc94a"/>`).join('')}`),
  zebra: S(`<ellipse cx="50" cy="60" rx="32" ry="18" fill="#fff"/><path d="M22 52 Q14 30 26 26 Q34 32 30 50Z" fill="#fff"/>${[34, 46, 58, 70].map((x) => `<path d="M${x} 44 Q${x + 4} 60 ${x} 76" stroke="#2a2f3a" stroke-width="4" fill="none"/>`).join('')}<circle cx="24" cy="34" r="2" fill="#2a2f3a"/>${[28, 40, 60, 72].map((x) => `<rect x="${x}" y="74" width="6" height="18" fill="#fff" stroke="#2a2f3a" stroke-width="1"/>`).join('')}`),
  lion: S(`<circle cx="50" cy="46" r="34" fill="#e08a3a"/><circle cx="50" cy="48" r="22" fill="#ffc94a"/>${eyes(42, 58, 44, 3.5)}<ellipse cx="50" cy="54" rx="5" ry="3.5" fill="#8a4a2a"/>${smile(50, 60, 6)}<ellipse cx="50" cy="86" rx="20" ry="10" fill="#ffc94a"/>`),
  hippo: S(`<ellipse cx="50" cy="62" rx="38" ry="26" fill="#a98bc8"/><ellipse cx="34" cy="44" rx="22" ry="18" fill="#b9a0d6"/><circle cx="24" cy="44" r="3" fill="#2a2f3a"/><circle cx="18" cy="52" r="2" fill="#7a5ea0"/><circle cx="28" cy="34" r="2.5" fill="#2a2f3a"/><circle cx="30" cy="26" r="5" fill="#a98bc8"/>`),
  blackbear: S(`<ellipse cx="50" cy="64" rx="32" ry="26" fill="#2f2a36"/><circle cx="50" cy="38" r="22" fill="#2f2a36"/><circle cx="32" cy="20" r="8" fill="#2f2a36"/><circle cx="68" cy="20" r="8" fill="#2f2a36"/><ellipse cx="50" cy="46" rx="10" ry="7" fill="#c9a77a"/><path d="M30 60 Q50 74 70 60 L50 66Z" fill="#fff"/><circle cx="42" cy="34" r="3" fill="#fff"/><circle cx="58" cy="34" r="3" fill="#fff"/>`),
  leopardcat: S(`<ellipse cx="54" cy="66" rx="30" ry="18" fill="#d9a35a"/><circle cx="30" cy="46" r="18" fill="#d9a35a"/><path d="M16 34 L18 18 L28 30Z M44 34 L42 18 L32 30Z" fill="#d9a35a"/><path d="M24 40 V50 M36 40 V50" stroke="#fff" stroke-width="3"/>${eyes(24, 36, 44, 3)}${[[50, 60], [62, 64], [74, 60], [56, 72], [70, 72]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#6a4a2a"/>`).join('')}<path d="M82 66 Q96 50 90 40" stroke="#d9a35a" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  penguin: S(`<ellipse cx="50" cy="56" rx="26" ry="36" fill="#2f3a4a"/><ellipse cx="50" cy="62" rx="18" ry="28" fill="#fff"/>${eyes(42, 58, 36, 3.5)}<path d="M45 44 L50 50 L55 44Z" fill="#ffb627"/><ellipse cx="40" cy="94" rx="8" ry="4" fill="#ffb627"/><ellipse cx="60" cy="94" rx="8" ry="4" fill="#ffb627"/>`),
};
export const SEA = {
  beluga: S(`<path d="M8 60 Q10 30 50 28 Q86 28 88 56 Q90 80 56 82 Q22 84 8 60Z" fill="#eef6ff"/>${eyes(38, 62, 52, 3.5)}${smile(50, 62, 8)}<path d="M80 74 L96 86 L92 66Z" fill="#dbe8f7"/>`),
  clownfish: S(`<ellipse cx="46" cy="50" rx="34" ry="22" fill="#ff8a3d"/><path d="M78 50 L96 34 L96 66Z" fill="#ff8a3d"/><path d="M30 30 Q36 50 30 70 M52 28 Q58 50 52 72" stroke="#fff" stroke-width="7" fill="none"/><circle cx="20" cy="46" r="4" fill="#2a2f3a"/>`),
  whaleshark: S(`<path d="M6 54 Q20 30 60 32 Q80 34 88 48 L98 36 L96 64 L86 56 Q76 72 50 72 Q18 72 6 54Z" fill="#5a7aa8"/><path d="M14 58 Q40 68 70 62" stroke="#c9d8ef" stroke-width="6" fill="none"/>${[[30, 42], [42, 40], [54, 42], [36, 50], [50, 50], [64, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`).join('')}<circle cx="16" cy="50" r="2.5" fill="#2a2f3a"/>`),
  jellyfish: S(`<path d="M20 46 Q20 14 50 14 Q80 14 80 46Z" fill="#ff9fd0" opacity=".9"/>${[28, 40, 52, 64, 74].map((x) => `<path d="M${x} 46 Q${x - 6} 64 ${x} 80 Q${x + 4} 90 ${x - 2} 96" stroke="#ff9fd0" stroke-width="4" fill="none"/>`).join('')}${eyes(40, 60, 34, 3)}`),
  ray: S(`<path d="M50 20 Q90 40 96 56 Q70 56 52 70 Q30 56 4 56 Q10 40 50 20Z" fill="#7d8fb8"/><path d="M52 70 Q56 86 70 96" stroke="#7d8fb8" stroke-width="4" fill="none"/>${eyes(42, 58, 44, 3)}`),
  turtle: S(`<ellipse cx="50" cy="54" rx="32" ry="22" fill="#4fbf6e"/><path d="M30 46 L42 38 L58 38 L70 46 L60 60 H40Z" fill="#3a9a55"/><circle cx="88" cy="54" r="10" fill="#9be3a8"/><circle cx="91" cy="51" r="1.8" fill="#2a2f3a"/><ellipse cx="26" cy="74" rx="10" ry="5" fill="#9be3a8"/><ellipse cx="70" cy="76" rx="10" ry="5" fill="#9be3a8"/>`),
};
export const SHELLS = {
  fan: S(`<path d="M50 86 L14 42 Q50 4 86 42Z" fill="#ffc7a8"/>${[26, 38, 50, 62, 74].map((x) => `<path d="M50 86 L${x} 26" stroke="#f09a78" stroke-width="3"/>`).join('')}`),
  spiral: S(`<path d="M50 90 Q20 80 22 52 Q24 26 50 22 Q74 22 74 44 Q74 60 56 60 Q44 60 46 48" stroke="#e0b48a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M50 90 Q20 80 22 52" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>`),
  star: S(`<path d="M50 8 L60 38 L92 38 L66 56 L76 88 L50 68 L24 88 L34 56 L8 38 L40 38Z" fill="#ff9a5a"/>${[[50, 30], [62, 48], [38, 48], [44, 64], [56, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffd3a8"/>`).join('')}`),
};

// ---- ABC 的小圖（沒有的才畫；其他用現有的）----
export const ABC_ART = {
  cat: S(`<ellipse cx="50" cy="66" rx="26" ry="22" fill="#ffb067"/><circle cx="50" cy="40" r="22" fill="#ffb067"/><path d="M30 30 L32 10 L46 24Z M70 30 L68 10 L54 24Z" fill="#ffb067"/>${eyes(42, 58, 40, 3.5)}<path d="M46 50 L50 54 L54 50" stroke="#2a2f3a" stroke-width="3" fill="none"/><path d="M76 74 Q94 60 86 44" stroke="#ffb067" stroke-width="8" fill="none" stroke-linecap="round"/>`),
  fish: SEA.clownfish,
  hat: S(`<ellipse cx="50" cy="70" rx="44" ry="12" fill="#3ea8e0"/><path d="M26 70 Q26 26 50 26 Q74 26 74 70Z" fill="#3ea8e0"/><rect x="26" y="56" width="48" height="10" fill="#ffd23f"/>`),
  juice: S(`<path d="M30 30 H70 L64 92 H36Z" fill="#fff"/><path d="M33 44 H67 L63 88 H37Z" fill="#ff9a3d"/><rect x="54" y="8" width="6" height="40" rx="3" fill="#ff5d73" transform="rotate(15 57 28)"/><circle cx="72" cy="34" r="10" fill="#ffd23f"/>`),
  kite: S(`<path d="M50 6 L82 40 L50 74 L18 40Z" fill="#ff5d73"/><path d="M50 6 V74 M18 40 H82" stroke="#fff" stroke-width="3"/><path d="M50 74 Q40 84 52 90 Q62 94 54 100" stroke="#4a3b6b" stroke-width="3" fill="none"/>`),
  lion: ZOO.lion,
  giraffe: ZOO.giraffe,
  orange: S(`<circle cx="50" cy="56" r="34" fill="#ff9a3d"/><path d="M50 22 Q60 8 72 14 Q62 26 50 22Z" fill="#4fbf6e"/><circle cx="38" cy="44" r="7" fill="#fff" opacity=".4"/>`),
  queen: S(`<path d="M14 76 L20 30 L36 52 L50 22 L64 52 L80 30 L86 76Z" fill="#ffd23f"/><rect x="14" y="74" width="72" height="12" rx="4" fill="#f0b800"/><circle cx="50" cy="60" r="6" fill="#ff5d73"/><circle cx="30" cy="64" r="4" fill="#3ea8e0"/><circle cx="70" cy="64" r="4" fill="#3ea8e0"/>`),
  umbrella: S(`<path d="M8 50 Q50 0 92 50 Q80 42 70 50 Q60 42 50 50 Q40 42 30 50 Q20 42 8 50Z" fill="#a98bff"/><path d="M50 50 V84 Q50 94 40 92" stroke="#4a3b6b" stroke-width="5" fill="none" stroke-linecap="round"/>`),
  xylophone: S(`${[0, 1, 2, 3, 4].map((i) => `<rect x="${10 + i * 17}" y="${20 + i * 7}" width="13" height="${62 - i * 9}" rx="5" fill="${['#ff5d73', '#ffb627', '#7ee06a', '#3ec7e0', '#a98bff'][i]}"/>`).join('')}`),
  zebra: ZOO.zebra,
};

// ---- 垃圾車（黃色）、資源回收車（白色）----
export const garbageTruckSvg = () => S(`<rect x="4" y="30" width="60" height="44" rx="8" fill="#ffd23f"/><path d="M4 40 L64 34" stroke="#f0b800" stroke-width="4"/><rect x="62" y="40" width="30" height="34" rx="8" fill="#ffd23f"/><rect x="70" y="46" width="16" height="12" rx="3" fill="#bfe6ff"/><rect x="0" y="46" width="10" height="24" rx="3" fill="#3a3550"/><circle cx="22" cy="76" r="9" fill="#3a3550"/><circle cx="76" cy="76" r="9" fill="#3a3550"/><path d="M30 52 L36 46 L42 52 M36 46 V62" stroke="#3a9a55" stroke-width="4" fill="none"/>`);
export const recycleTruckSvg = () => S(`<rect x="4" y="34" width="60" height="40" rx="6" fill="#f4f6fb"/>${[['#3ea8e0', 8], ['#ffb627', 26], ['#4cd07d', 44]].map(([c, x]) => `<rect x="${x}" y="40" width="16" height="22" rx="3" fill="${c}"/>`).join('')}<rect x="62" y="40" width="30" height="34" rx="8" fill="#3ea8e0"/><rect x="70" y="46" width="16" height="12" rx="3" fill="#bfe6ff"/><circle cx="22" cy="76" r="9" fill="#3a3550"/><circle cx="76" cy="76" r="9" fill="#3a3550"/><path d="M34 24 l6 -8 l6 8 M40 16 v10" stroke="#3a9a55" stroke-width="3" fill="none"/>`);
export const trashBagSvg = (c = '#4a4f5e') => S(`<path d="M24 36 Q20 90 50 92 Q80 90 76 36Z" fill="${c}"/><path d="M36 36 Q50 16 64 36" stroke="${c}" stroke-width="8" fill="none"/><path d="M34 52 Q46 60 40 76" stroke="#fff" stroke-width="3" fill="none" opacity=".3"/>`);

// ---- 消防、交通、郵局、圖書館的小東西 ----
export const MISC = {
  flame: S(`<path d="M50 6 Q74 34 70 58 Q68 86 50 92 Q30 88 28 62 Q28 44 40 32 Q42 50 50 52 Q56 34 50 6Z" fill="#ff5a2a"/><path d="M50 48 Q62 62 58 76 Q54 88 48 88 Q38 84 40 70 Q42 60 50 48Z" fill="#ffd23f"/>`),
  towel: S(`<path d="M18 24 H82 V80 Q66 72 50 80 Q34 88 18 80Z" fill="#7fd3ff"/><path d="M18 36 H82 M18 66 H82" stroke="#fff" stroke-width="5"/>`),
  crawl: S(`<rect x="6" y="80" width="88" height="6" fill="#a9744f"/><circle cx="76" cy="52" r="10" fill="#ffd9b8"/><path d="M68 58 L30 64 L18 78 M44 62 L48 78 M66 62 L70 78" stroke="#2f7fe0" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M10 30 Q50 10 92 30" stroke="#8a8fa0" stroke-width="10" opacity=".4" fill="none"/>`),
  stairs: S(`<path d="M10 90 V74 H30 V58 H50 V42 H70 V26 H90 V90Z" fill="#c9a87a"/><path d="M10 74 H30 V58 H50 V42 H70 V26 H90" stroke="#a9744f" stroke-width="4" fill="none"/><circle cx="58" cy="20" r="8" fill="#ffd9b8"/><path d="M58 28 V44 L50 56 M58 44 L66 54" stroke="#2f7fe0" stroke-width="6" stroke-linecap="round" fill="none"/>`),
  elevator: S(`<rect x="18" y="10" width="64" height="84" rx="6" fill="#c9ced8"/><rect x="24" y="22" width="25" height="68" fill="#9aa3b5"/><rect x="51" y="22" width="25" height="68" fill="#9aa3b5"/><path d="M42 16 L50 8 L58 16Z" fill="#4a3b6b"/><circle cx="50" cy="52" r="34" fill="none" stroke="#ff4a4a" stroke-width="7"/><path d="M26 28 L74 76" stroke="#ff4a4a" stroke-width="7"/>`),
  meetpoint: S(`<rect x="46" y="20" width="8" height="74" fill="#8a8fa0"/><rect x="20" y="10" width="60" height="40" rx="8" fill="#4cd07d"/>${[[36, 30], [50, 30], [64, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y - 4}" r="5" fill="#fff"/><rect x="${x - 4}" y="${y + 2}" width="8" height="10" rx="3" fill="#fff"/>`).join('')}`),
  card: S(`<rect x="12" y="26" width="76" height="50" rx="10" fill="#3ea8e0"/><rect x="12" y="38" width="76" height="8" fill="#2f5fbf"/><circle cx="72" cy="62" r="8" fill="#ffd23f"/><path d="M24 62 H52" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`),
  seat: S(`<rect x="22" y="20" width="16" height="56" rx="6" fill="#3ea8e0"/><rect x="22" y="58" width="58" height="16" rx="6" fill="#3ea8e0"/><rect x="28" y="74" width="6" height="20" fill="#8a8fa0"/><rect x="70" y="74" width="6" height="20" fill="#8a8fa0"/>`),
  letter: S(`<rect x="10" y="24" width="80" height="54" rx="6" fill="#fff"/><path d="M10 28 L50 56 L90 28" stroke="#c9ced8" stroke-width="4" fill="none"/><rect x="68" y="30" width="16" height="18" fill="#ff5d73"/>`),
  express: S(`<rect x="10" y="24" width="80" height="54" rx="6" fill="#fff"/><path d="M10 28 L50 56 L90 28" stroke="#c9ced8" stroke-width="4" fill="none"/><path d="M44 30 L32 54 H48 L40 74 L64 44 H48 L58 30Z" fill="#ff4a4a"/>`),
  stamp: S(`<rect x="18" y="14" width="64" height="72" rx="4" fill="#fff" stroke="#ffb627" stroke-width="4" stroke-dasharray="6 4"/><circle cx="50" cy="44" r="16" fill="#ff8fbf"/><path d="M30 72 H70" stroke="#4cd07d" stroke-width="6"/>`),
  mailRed: S(`<rect x="24" y="30" width="52" height="64" rx="8" fill="#e83a3a"/><path d="M20 34 Q50 4 80 34Z" fill="#e83a3a"/><rect x="36" y="44" width="28" height="6" rx="3" fill="#8a1a1a"/><path d="M48 58 L42 70 H52 L46 82 L60 64 H50 L56 58Z" fill="#ffd23f"/>`),
  mailGreen: S(`<rect x="24" y="30" width="52" height="64" rx="8" fill="#2fa65a"/><path d="M20 34 Q50 4 80 34Z" fill="#2fa65a"/><rect x="36" y="44" width="28" height="6" rx="3" fill="#1d5a33"/><rect x="38" y="60" width="24" height="16" rx="2" fill="#fff"/>`),
  book: (c = '#ff5d73', mark = '') => S(`<rect x="22" y="10" width="56" height="80" rx="6" fill="${c}"/><rect x="22" y="10" width="10" height="80" rx="4" fill="#000" opacity=".15"/><rect x="38" y="24" width="32" height="20" rx="4" fill="#fff" opacity=".85"/>${mark ? `<text x="54" y="40" text-anchor="middle" font-size="18" font-weight="900" font-family="-apple-system,sans-serif" fill="${c}">${mark}</text>` : ''}`),
  loud: S(`<path d="M14 40 H30 L56 20 V80 L30 60 H14Z" fill="#ff8a3d"/><path d="M66 32 Q78 50 66 68 M76 22 Q94 50 76 78" stroke="#ff8a3d" stroke-width="6" fill="none" stroke-linecap="round"/>`),
  quiet: S(`<circle cx="50" cy="50" r="38" fill="#ffd9b8"/>${eyes(38, 62, 42, 3.5)}<rect x="47" y="40" width="7" height="40" rx="3.5" fill="#ffb067"/><circle cx="50" cy="62" r="5" fill="#2a2f3a" opacity=".6"/>`),
  sunscreen: S(`<rect x="30" y="24" width="40" height="66" rx="12" fill="#fff"/><rect x="38" y="10" width="24" height="16" rx="4" fill="#ffb627"/><circle cx="50" cy="56" r="12" fill="#ffd23f"/>`),
  cap: S(`<path d="M18 62 Q18 26 50 26 Q82 26 82 62Z" fill="#ff5d73"/><path d="M50 62 H96 Q90 72 50 70Z" fill="#e0405a"/><circle cx="50" cy="26" r="4" fill="#fff"/>`),
  flipflop: S(`<ellipse cx="36" cy="54" rx="14" ry="34" fill="#3ec7e0"/><ellipse cx="66" cy="54" rx="14" ry="34" fill="#3ec7e0"/><path d="M28 50 L36 34 L44 50 M58 50 L66 34 L74 50" stroke="#ffd23f" stroke-width="4" fill="none"/>`),
  bucket: S(`<path d="M22 38 H78 L70 90 H30Z" fill="#ffd23f"/><path d="M22 38 Q50 6 78 38" stroke="#ff8a3d" stroke-width="5" fill="none"/>`),
  flags: S(`<rect x="14" y="10" width="5" height="84" fill="#8a8fa0"/><rect x="81" y="10" width="5" height="84" fill="#8a8fa0"/><path d="M19 12 H40 V30 H19Z M86 12 H65 V30 H86Z" fill="#ff4a4a"/><path d="M19 12 L40 30 M86 12 L65 30" stroke="#ffd23f" stroke-width="4"/><path d="M8 78 Q30 66 50 78 T92 78" stroke="#3ea8e0" stroke-width="7" fill="none"/>`),
  deep: S(`<path d="M0 50 Q25 36 50 50 T100 50 V100 H0Z" fill="#2f5fbf"/><circle cx="50" cy="38" r="9" fill="#ffd9b8"/><path d="M40 52 L30 40 M60 52 L70 40" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/>`),
  glassTap: S(`<rect x="10" y="10" width="80" height="80" rx="8" fill="#bfe6ff" opacity=".8"/><path d="M60 50 L80 40" stroke="#ff8a3d" stroke-width="6" stroke-linecap="round"/><circle cx="56" cy="52" r="10" fill="#ffd9b8"/><path d="M30 30 L40 40 M38 26 L42 36" stroke="#fff" stroke-width="4"/>`),
  flash: S(`<rect x="16" y="32" width="68" height="46" rx="8" fill="#4a3b6b"/><circle cx="50" cy="55" r="15" fill="#9ab"/><rect x="62" y="26" width="16" height="10" rx="3" fill="#ffd23f"/><path d="M70 10 V20 M84 16 L78 24 M56 16 L62 24" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>`),
  feedHand: S(`<circle cx="62" cy="36" r="10" fill="#ff8a3d"/><path d="M20 70 Q30 52 56 50 Q70 50 70 60 Q70 70 56 70 H36" stroke="#ffd9b8" stroke-width="14" fill="none" stroke-linecap="round"/>`),
  path: S(`<path d="M10 92 Q40 60 50 50 Q60 40 90 10" stroke="#e8cf95" stroke-width="20" fill="none" stroke-linecap="round"/><path d="M20 82 L28 74 M44 58 L52 50 M68 34 L76 26" stroke="#fff" stroke-width="4"/>`),
  bamboo: S(`<rect x="30" y="8" width="12" height="86" rx="5" fill="#7ed36a"/><rect x="56" y="16" width="12" height="78" rx="5" fill="#6cc25a"/><path d="M30 34 H42 M30 62 H42 M56 40 H68 M56 70 H68" stroke="#4fa04a" stroke-width="3"/><path d="M42 30 Q60 18 70 22 Q58 32 42 30Z" fill="#9be38a"/>`),
  eucalyptus: S(`<path d="M50 94 Q48 50 54 8" stroke="#8a6a4a" stroke-width="4" fill="none"/>${[[40, 28], [62, 38], [38, 52], [62, 62], [42, 76]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#8fbfa8"/>`).join('')}`),
  leaves: S(`<path d="M50 94 V40" stroke="#8a6a4a" stroke-width="6"/><circle cx="50" cy="34" r="26" fill="#4fbf6e"/><circle cx="34" cy="48" r="16" fill="#6cd07a"/><circle cx="66" cy="48" r="16" fill="#6cd07a"/>`),
  meat: S(`<ellipse cx="44" cy="54" rx="30" ry="22" fill="#e06a5a"/><ellipse cx="40" cy="50" rx="16" ry="10" fill="#f59a8a"/><rect x="68" y="50" width="22" height="9" rx="4" fill="#fff"/><circle cx="90" cy="49" r="6" fill="#fff"/><circle cx="90" cy="60" r="6" fill="#fff"/>`),
  smallfish: S(`<ellipse cx="44" cy="50" rx="28" ry="14" fill="#9ab8d8"/><path d="M70 50 L90 36 V64Z" fill="#9ab8d8"/><circle cx="26" cy="46" r="3" fill="#2a2f3a"/>`),
};

// ---- 地點的招牌圖示（小鎮與世界地圖上的漂浮標記）----
export const PLACE_ICON = {
  fire: S(`<rect x="10" y="40" width="80" height="50" rx="6" fill="#ff4a4a"/><path d="M6 44 L50 12 L94 44Z" fill="#c92a2a"/><rect x="22" y="56" width="56" height="34" rx="4" fill="#fff"/><path d="M22 66 H78 M22 76 H78" stroke="#c9ced8" stroke-width="3"/><circle cx="50" cy="32" r="8" fill="#ffd23f"/>`),
  mrt: S(`<rect x="16" y="14" width="68" height="70" rx="18" fill="#f4f6fb"/><rect x="24" y="24" width="52" height="28" rx="8" fill="#bfe6ff"/><rect x="16" y="60" width="68" height="8" fill="#3ea8e0"/><circle cx="30" cy="74" r="5" fill="#ffd23f"/><circle cx="70" cy="74" r="5" fill="#ffd23f"/><path d="M30 90 L20 98 M70 90 L80 98" stroke="#8a8fa0" stroke-width="4"/>`),
  library: S(`<path d="M10 40 L50 12 L90 40Z" fill="#c9a87a"/><rect x="14" y="40" width="72" height="8" fill="#e8d4b0"/>${[20, 38, 56, 74].map((x) => `<rect x="${x}" y="48" width="8" height="34" fill="#fff6e8"/>`).join('')}<rect x="10" y="82" width="80" height="10" fill="#c9a87a"/><rect x="40" y="22" width="20" height="12" rx="2" fill="#ff5d73"/>`),
  post: S(`<rect x="10" y="34" width="80" height="58" rx="6" fill="#2fa65a"/><rect x="10" y="26" width="80" height="12" rx="4" fill="#238a49"/><rect x="18" y="46" width="64" height="40" rx="4" fill="#fff"/><path d="M18 50 L50 72 L82 50" stroke="#2fa65a" stroke-width="4" fill="none"/>`),
  train: S(`<rect x="12" y="20" width="76" height="56" rx="14" fill="#ff8a3d"/><rect x="20" y="28" width="60" height="22" rx="6" fill="#bfe6ff"/><rect x="12" y="58" width="76" height="6" fill="#fff"/><circle cx="28" cy="80" r="7" fill="#3a3550"/><circle cx="72" cy="80" r="7" fill="#3a3550"/><path d="M4 92 H96" stroke="#8a6a4a" stroke-width="5"/>`),
  garbage: garbageTruckSvg(),
  aquarium: SEA.beluga,
  beach: S(`<path d="M0 66 Q25 56 50 66 T100 66 V100 H0Z" fill="#3ec7e0"/><path d="M0 80 H100 V100 H0Z" fill="#f2dca6"/><path d="M50 70 L50 20" stroke="#a9744f" stroke-width="4"/><path d="M14 30 Q50 -6 86 30Z" fill="#ff5d73"/><path d="M38 30 Q50 6 62 30" fill="#fff"/>`),
  zoo: ZOO.panda,
  farm: null,
};
