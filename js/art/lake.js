// 日月潭（11/26）：白鹿鹿鹿、船、救生衣、邵族的杵、慈恩塔、拉魯島、湖邊的危險。
// 一樣是軟膠玩具質感，不描黑邊。角色 160×170；小圖 100×100。
const S = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const eyes = (x1, x2, y, r = 6) => `<circle cx="${x1}" cy="${y}" r="${r}" fill="#2a2f3a"/><circle cx="${x2}" cy="${y}" r="${r}" fill="#2a2f3a"/><circle cx="${x1 + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/><circle cx="${x2 + 2}" cy="${y - 2}" r="${r / 3}" fill="#fff"/>`;
const smile = (x, y, w = 10) => `<path d="M${x - w} ${y} Q${x} ${y + w * 0.8} ${x + w} ${y}" stroke="#2a2f3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const blush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".6"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="#ff8fa3" opacity=".6"/>`;
const shadow = '<ellipse cx="80" cy="160" rx="44" ry="9" fill="#000" opacity=".08"/>';
const CV = '0 0 160 170';

// 鹿鹿：玩具白鹿（邵族傳說：白鹿帶路，找到了日月潭）。小小的金色鹿角、粉紅耳朵、脖子上一條紅藍織帶
export const luoluSvg = () => S(`${shadow}
  <rect x="50" y="124" width="14" height="32" rx="7" fill="#eef1f6"/><rect x="96" y="124" width="14" height="32" rx="7" fill="#eef1f6"/>
  <ellipse cx="57" cy="156" rx="9" ry="5" fill="#c9b8a8"/><ellipse cx="103" cy="156" rx="9" ry="5" fill="#c9b8a8"/>
  <ellipse cx="80" cy="118" rx="42" ry="28" fill="#fbfcff"/><circle cx="118" cy="104" r="9" fill="#fff"/>
  <path d="M56 26 Q48 10 54 2 M56 26 Q40 22 36 10 M104 26 Q112 10 106 2 M104 26 Q120 22 124 10" stroke="#f0c44a" stroke-width="6" fill="none" stroke-linecap="round"/>
  <ellipse cx="36" cy="54" rx="18" ry="9" fill="#fbfcff" transform="rotate(-24 36 54)"/><ellipse cx="38" cy="54" rx="10" ry="4.5" fill="#ffc2cf" transform="rotate(-24 38 54)"/>
  <ellipse cx="124" cy="54" rx="18" ry="9" fill="#fbfcff" transform="rotate(24 124 54)"/><ellipse cx="122" cy="54" rx="10" ry="4.5" fill="#ffc2cf" transform="rotate(24 122 54)"/>
  <ellipse cx="80" cy="66" rx="38" ry="36" fill="#fbfcff"/><ellipse cx="80" cy="88" rx="20" ry="13" fill="#fff3ea"/><ellipse cx="80" cy="82" rx="6" ry="4.5" fill="#3a3040"/>
  ${eyes(64, 96, 64, 7)}${smile(80, 92, 7)}${blush(54, 106, 80)}
  <path d="M50 100 Q80 114 110 100 L108 110 Q80 124 52 110Z" fill="#e2453a"/><path d="M54 106 Q80 118 106 106" stroke="#3a6fd8" stroke-width="3" fill="none" stroke-dasharray="6 4"/>
  ${[[60, 128], [96, 126], [78, 136]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="#e8eef8"/>`).join('')}`, CV);

// ---- 小圖 ----
export const LAKE = {
  rowboat: S('<path d="M6 54 H94 L82 76 H18Z" fill="#c98b5e"/><path d="M6 54 H94" stroke="#a86b3c" stroke-width="5" stroke-linecap="round"/><path d="M24 62 H76" stroke="#e0a878" stroke-width="3"/><path d="M30 50 L4 30 M70 50 L96 30" stroke="#8a5a32" stroke-width="5" stroke-linecap="round"/><ellipse cx="4" cy="30" rx="6" ry="9" fill="#8a5a32" transform="rotate(-50 4 30)"/><ellipse cx="96" cy="30" rx="6" ry="9" fill="#8a5a32" transform="rotate(50 96 30)"/><path d="M8 84 Q30 78 50 84 T92 84" stroke="#7fd3ff" stroke-width="5" fill="none" stroke-linecap="round"/>'),
  yacht: S('<path d="M8 60 H92 L80 78 H22Z" fill="#fff"/><path d="M8 60 H92" stroke="#3ea8e0" stroke-width="5"/><rect x="28" y="40" width="46" height="20" rx="6" fill="#e9f3ff"/><rect x="33" y="45" width="36" height="8" rx="3" fill="#3ea8e0"/><rect x="56" y="28" width="6" height="14" fill="#ff5d5d"/><path d="M6 86 Q28 80 50 86 T94 86" stroke="#7fd3ff" stroke-width="5" fill="none" stroke-linecap="round"/>'),
  // 救生衣（橘色、三個黑色扣環）
  vest: S(`<path d="M26 18 L42 10 Q50 22 58 10 L74 18 L80 88 Q50 96 20 88Z" fill="#ff7a1a"/><path d="M50 22 V92" stroke="#d65a00" stroke-width="4"/>${[40, 56, 72].map((y) => `<rect x="30" y="${y}" width="40" height="6" fill="#2a2f3a"/><rect x="45" y="${y - 2}" width="10" height="10" rx="2" fill="#555b6a"/>`).join("")}<path d="M28 24 L34 80 M72 24 L66 80" stroke="#ffd2a8" stroke-width="5" opacity=".9"/>`),
  // 邵族的杵（長長的木棒）和石板
  pestle: S('<rect x="40" y="6" width="16" height="74" rx="8" fill="#b8865a"/><rect x="38" y="70" width="20" height="16" rx="6" fill="#9c6c42"/><path d="M45 12 V68" stroke="#d9a878" stroke-width="3"/><rect x="10" y="84" width="80" height="12" rx="6" fill="#8d96a3"/>'),
  // 慈恩塔（八角的塔，在山頂）
  pagoda: S(`${[0, 1, 2, 3, 4].map((i) => `<rect x="${32 + i * 3}" y="${78 - i * 15}" width="${36 - i * 6}" height="12" fill="#f3ead8"/><path d="M${24 + i * 3} ${78 - i * 15} H${76 - i * 3} L${68 - i * 3} ${72 - i * 15} H${32 + i * 3}Z" fill="#c9553a"/>`).join('')}<path d="M50 4 V14" stroke="#f0c44a" stroke-width="4"/><rect x="26" y="90" width="48" height="6" fill="#bfb6a6"/>`),
  island: S('<ellipse cx="50" cy="72" rx="44" ry="14" fill="#7fd3ff"/><ellipse cx="50" cy="66" rx="30" ry="10" fill="#8fd07a"/><rect x="47" y="34" width="6" height="30" fill="#a9744f"/><circle cx="50" cy="32" r="16" fill="#4fbf6e"/><circle cx="34" cy="50" r="9" fill="#5fcf7e"/>'),
  hut: S('<rect x="20" y="50" width="60" height="40" fill="#c99a6a"/><path d="M10 54 L50 18 L90 54Z" fill="#8a6a3a"/><path d="M14 52 L50 20 L86 52" stroke="#b09060" stroke-width="3" fill="none"/><rect x="42" y="64" width="16" height="26" fill="#6a4a2a"/><path d="M20 70 H80" stroke="#e2453a" stroke-width="4"/>'),
  tea: S(`<ellipse cx="50" cy="70" rx="42" ry="18" fill="#3f9f5a"/><ellipse cx="50" cy="58" rx="34" ry="16" fill="#4fbf6e"/>${[[34, 52], [50, 46], [66, 52], [42, 62], [58, 62]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="#9be38a"/>`).join("")}`),
  deer: S('<ellipse cx="54" cy="62" rx="28" ry="16" fill="#fbfcff"/><rect x="34" y="70" width="7" height="22" fill="#eef1f6"/><rect x="66" y="70" width="7" height="22" fill="#eef1f6"/><circle cx="28" cy="44" r="14" fill="#fbfcff"/><path d="M24 30 Q20 18 26 12 M32 30 Q36 18 42 16" stroke="#f0c44a" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="44" r="2.6" fill="#2a2f3a"/><ellipse cx="16" cy="50" rx="4" ry="3" fill="#3a3040"/>'),
  mountain: S('<path d="M0 90 L34 30 L50 52 L70 18 L100 90Z" fill="#5aa84a"/><path d="M62 30 L70 18 L78 32 L70 36Z" fill="#fff" opacity=".7"/>'),
  sick: S('<circle cx="50" cy="50" r="40" fill="#d9f2c4"/><path d="M30 44 Q36 38 42 44 M58 44 Q64 38 70 44" stroke="#2a2f3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M34 66 Q42 60 50 66 T66 66" stroke="#2a2f3a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M76 20 q6 6 0 12 q-6 6 0 12" stroke="#7fb86a" stroke-width="4" fill="none"/>'),
  // 暈車時怎麼辦：看遠方、開窗吹風、低頭看平板（不好）
  lookFar: S('<path d="M0 80 L30 40 L46 58 L66 30 L100 80Z" fill="#5aa84a"/><circle cx="78" cy="22" r="10" fill="#ffd23f"/><path d="M8 92 L44 70 M92 92 L56 70" stroke="#3a3550" stroke-width="4" stroke-dasharray="6 5"/>'),
  window: S('<rect x="10" y="14" width="80" height="72" rx="12" fill="#bfe6ff"/><rect x="10" y="14" width="80" height="72" rx="12" fill="none" stroke="#8a8fa0" stroke-width="6"/><path d="M24 40 q10 -6 20 0 t20 0 M30 58 q10 -6 20 0 t20 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>'),
  tablet: S('<rect x="22" y="12" width="56" height="76" rx="8" fill="#3a3550"/><rect x="27" y="18" width="46" height="60" rx="3" fill="#7fd3ff"/><circle cx="50" cy="83" r="3" fill="#8a8fa0"/><circle cx="40" cy="40" r="8" fill="#ffd23f"/><path d="M50 66 L60 46 L70 66Z" fill="#ff5d73"/><rect x="30" y="58" width="14" height="10" rx="2" fill="#4fbf6e"/><path d="M38 96 Q50 84 62 96" stroke="#3a3550" stroke-width="4" fill="none"/>'),
  drum: S('<ellipse cx="50" cy="34" rx="38" ry="14" fill="#f3e6c8"/><path d="M12 34 V70 Q50 90 88 70 V34" fill="#e2453a"/><path d="M12 34 Q50 50 88 34" fill="none" stroke="#c9302a" stroke-width="3"/><path d="M20 44 L30 76 M40 50 L44 82 M60 50 L56 82 M80 44 L70 76" stroke="#fff3d6" stroke-width="3"/>'),
};

// 上船規矩：好（等船停好、排隊、坐好抓扶手）／不好（站起來跑、手伸出去玩水、跳上船）
export const BOARD = {
  wait: S('<path d="M10 70 H90 L80 86 H20Z" fill="#c98b5e"/><rect x="0" y="56" width="40" height="10" fill="#b8865a"/><rect x="58" y="30" width="30" height="14" rx="4" fill="#4fbf6e"/><text x="73" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">✓</text><path d="M64 46 V56" stroke="#8a8fa0" stroke-width="3"/><circle cx="22" cy="34" r="9" fill="#ffd9b8"/><rect x="15" y="42" width="14" height="16" rx="6" fill="#4a78c2"/>'),
  queue: S(`${[18, 42, 66].map((x, i) => `<circle cx="${x}" cy="${36 + i * 2}" r="${9 - i}" fill="#ffd9b8"/><rect x="${x - 8}" y="${46 + i * 2}" width="16" height="${32 - i * 3}" rx="7" fill="${["#4a78c2", "#ff8fb8", "#ffb627"][i]}"/>`).join("")}<path d="M6 90 H94" stroke="#bfb6a6" stroke-width="5"/>`),
  sit: S('<path d="M8 66 H92 L80 86 H20Z" fill="#c98b5e"/><circle cx="50" cy="38" r="11" fill="#ffd9b8"/><rect x="38" y="48" width="24" height="20" rx="8" fill="#ff7a1a"/><path d="M38 56 L24 64 M62 56 L76 64" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/><path d="M14 64 H86" stroke="#a86b3c" stroke-width="4"/>'),
  stand: S('<path d="M8 72 H92 L80 90 H20Z" fill="#c98b5e"/><circle cx="50" cy="20" r="10" fill="#ffd9b8"/><rect x="40" y="30" width="20" height="26" rx="8" fill="#4a78c2"/><path d="M42 56 L34 72 M58 56 L68 70 M40 36 L24 26 M60 36 L76 26" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/><path d="M12 92 Q30 86 50 92 T88 92" stroke="#7fd3ff" stroke-width="4" fill="none"/>'),
  hand: S('<path d="M8 60 H70 L62 80 H16Z" fill="#c98b5e"/><circle cx="36" cy="38" r="10" fill="#ffd9b8"/><rect x="26" y="48" width="20" height="14" rx="6" fill="#ff8fb8"/><path d="M44 52 L84 70" stroke="#ffd9b8" stroke-width="6" stroke-linecap="round"/><path d="M70 82 Q80 76 92 82" stroke="#7fd3ff" stroke-width="5" fill="none"/><circle cx="86" cy="74" r="3" fill="#7fd3ff"/>'),
  jump: S('<path d="M40 74 H96 L86 90 H50Z" fill="#c98b5e"/><rect x="0" y="62" width="30" height="10" fill="#b8865a"/><circle cx="36" cy="18" r="9" fill="#ffd9b8"/><rect x="28" y="27" width="16" height="18" rx="6" fill="#4fbf6e"/><path d="M30 45 L20 56 M42 45 L54 52" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/><path d="M16 30 Q30 4 56 30" stroke="#ff5d5d" stroke-width="3" fill="none" stroke-dasharray="5 4"/><path d="M8 94 Q30 88 50 94 T92 94" stroke="#7fd3ff" stroke-width="4" fill="none"/>'),
};

// 湖邊的危險（要轉一轉才找得到的有的躲在後面）
export const HAZARD = {
  fence: S(`<path d="M4 80 H96" stroke="#a9744f" stroke-width="6"/><path d="M4 56 H96" stroke="#a9744f" stroke-width="6"/>${[10, 34, 58, 82].map((x) => `<rect x="${x}" y="44" width="7" height="46" fill="#8a5a32"/>`).join("")}<circle cx="62" cy="24" r="9" fill="#ffd9b8"/><rect x="54" y="32" width="16" height="18" rx="6" fill="#ffb627"/><path d="M56 50 L44 58 M68 50 L74 38" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/><text x="22" y="30" font-size="24" fill="#ff4a4a" font-weight="800">!</text>`),
  slippery: S('<ellipse cx="50" cy="74" rx="40" ry="16" fill="#7fa0a8"/><ellipse cx="44" cy="68" rx="18" ry="6" fill="#bfe6ff" opacity=".8"/><path d="M20 90 Q35 84 50 90 T80 90" stroke="#7fd3ff" stroke-width="4" fill="none"/><path d="M70 30 q-6 10 0 14 q6 -4 0 -14Z" fill="#7fd3ff"/><text x="22" y="40" font-size="24" fill="#ff4a4a" font-weight="800">!</text>'),
  alone: S('<path d="M0 72 Q25 64 50 72 T100 72 V100 H0Z" fill="#3ea8e0"/><circle cx="40" cy="34" r="10" fill="#ffd9b8"/><rect x="31" y="44" width="18" height="20" rx="7" fill="#ff8fb8"/><path d="M34 64 L30 74 M46 64 L50 74" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/><text x="70" y="40" font-size="24" fill="#ff4a4a" font-weight="800">!</text>'),
  run: S('<rect x="0" y="66" width="100" height="16" fill="#b8865a"/><path d="M0 90 Q25 84 50 90 T100 90" stroke="#7fd3ff" stroke-width="5" fill="none"/><circle cx="56" cy="22" r="9" fill="#ffd9b8"/><rect x="48" y="31" width="16" height="18" rx="6" fill="#3ea8e0"/><path d="M50 49 L38 62 M62 49 L72 62 M50 36 L36 30 M62 36 L74 44" stroke="#ffd9b8" stroke-width="5" stroke-linecap="round"/><path d="M22 30 H36 M18 40 H34" stroke="#bfb6a6" stroke-width="3"/>'),
  // 安全的：大人陪著、走在步道上（不是要找的，當背景）
};

// 水面倒影的題目：不對稱的東西，才分得出「上下顛倒」和「左右相反」
export const MIRROR = {
  sailboat: S('<path d="M14 72 H86 L76 88 H24Z" fill="#c98b5e"/><path d="M60 70 V12" stroke="#8a5a32" stroke-width="4"/><path d="M58 14 L58 66 L22 66Z" fill="#fff"/><path d="M62 16 L84 56 H62Z" fill="#ff5d73"/><path d="M60 12 L74 6 L60 2Z" fill="#ffd23f"/>'),
  tree: S('<path d="M44 92 Q46 60 38 40" stroke="#a9744f" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="34" cy="32" r="22" fill="#4fbf6e"/><circle cx="56" cy="44" r="13" fill="#5fcf7e"/><circle cx="74" cy="80" r="8" fill="#ff5d73"/>'),
  deer: LAKE_DEER(),
  house: S('<rect x="16" y="46" width="56" height="44" fill="#ffd6a0"/><path d="M8 50 L44 18 L80 50Z" fill="#c9553a"/><rect x="62" y="20" width="10" height="20" fill="#8a8fa0"/><rect x="24" y="58" width="14" height="14" fill="#bfe6ff"/><rect x="48" y="62" width="14" height="28" fill="#8a5a32"/><circle cx="86" cy="80" r="8" fill="#4fbf6e"/>'),
  pagoda: S(`${[0, 1, 2, 3].map((i) => `<rect x="${30 + i * 3}" y="${78 - i * 18}" width="${30 - i * 6}" height="14" fill="#f3ead8"/><path d="M${22 + i * 3} ${78 - i * 18} H${68 - i * 3} L${60 - i * 3} ${72 - i * 18} H${30 + i * 3}Z" fill="#c9553a"/>`).join('')}<path d="M45 6 V22" stroke="#f0c44a" stroke-width="4"/><circle cx="80" cy="26" r="10" fill="#ffd23f"/><rect x="20" y="90" width="50" height="6" fill="#bfb6a6"/>`),
};
function LAKE_DEER() {
  return S('<ellipse cx="54" cy="58" rx="28" ry="16" fill="#fbfcff"/><rect x="36" y="66" width="7" height="26" fill="#eef1f6"/><rect x="66" y="66" width="7" height="26" fill="#eef1f6"/><circle cx="26" cy="38" r="14" fill="#fbfcff"/><path d="M22 24 Q18 10 24 4 M30 24 Q36 10 44 10" stroke="#f0c44a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="22" cy="38" r="2.8" fill="#2a2f3a"/><ellipse cx="14" cy="44" rx="4" ry="3" fill="#3a3040"/><path d="M82 52 Q92 46 90 40" stroke="#fbfcff" stroke-width="6" stroke-linecap="round" fill="none"/>');
}
