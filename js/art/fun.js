// 興趣相關的美術（11/24）：
//   岳岳：太空（火箭、星球）、煮飯（水餃）、腳踏車、畫畫（印章）
//   愷愷：恐龍、車車（消防車、警車、公車）、警察（警察狗哨哨，原創角色）、貼紙、小動物（豬、羊、鴨子、烏龜）
// 一樣是軟膠玩具質感，不描黑邊。每個小圖都是 100×100。
const svg = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;

// ---- 哨哨：玩具警察狗（藍色警帽、脖子上掛哨子），原創角色 ----
export function shaoSvg() {
  return svg(`
    <ellipse cx="80" cy="150" rx="40" ry="14" fill="#000" opacity=".08"/>
    <rect x="46" y="96" width="68" height="56" rx="26" fill="#2f5fbf"/>
    <rect x="76" y="100" width="8" height="48" fill="#ffd23f"/>
    <circle cx="80" cy="112" r="5" fill="#ffd23f"/>
    <rect x="50" y="136" width="20" height="20" rx="9" fill="#e9b47a"/><rect x="90" y="136" width="20" height="20" rx="9" fill="#e9b47a"/>
    <ellipse cx="38" cy="58" rx="14" ry="26" fill="#a86b3c" transform="rotate(18 38 58)"/>
    <ellipse cx="122" cy="58" rx="14" ry="26" fill="#a86b3c" transform="rotate(-18 122 58)"/>
    <circle cx="80" cy="62" r="40" fill="#e9b47a"/>
    <ellipse cx="80" cy="80" rx="24" ry="18" fill="#fff1dd"/>
    <ellipse cx="80" cy="70" rx="9" ry="7" fill="#4a3b2b"/>
    <circle cx="64" cy="56" r="6" fill="#3a2a1a"/><circle cx="96" cy="56" r="6" fill="#3a2a1a"/>
    <circle cx="66" cy="54" r="2" fill="#fff"/><circle cx="98" cy="54" r="2" fill="#fff"/>
    <path d="M72 84 Q80 90 88 84" stroke="#4a3b2b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M42 34 Q80 6 118 34 L112 40 H48Z" fill="#2f5fbf"/><rect x="44" y="36" width="72" height="10" rx="5" fill="#1d3f8a"/>
    <path d="M80 16 l4 8 h8 l-6 6 2 8 -8 -5 -8 5 2 -8 -6 -6 h8z" fill="#ffd23f"/>
    <path d="M114 110 l14 -4 4 8 -14 6z" fill="#c9ced8"/>`, '0 0 160 170');
}

// ---- 交通工具（坐車可以選） ----
const wheel = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a3550"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="#c9ced8"/>`;
export const VEHICLES = {
  fire: svg(`<rect x="6" y="40" width="74" height="34" rx="8" fill="#ff4a4a"/><rect x="62" y="28" width="32" height="46" rx="8" fill="#ff4a4a"/>
    <rect x="70" y="34" width="18" height="16" rx="4" fill="#bfe6ff"/><rect x="10" y="28" width="52" height="6" rx="3" fill="#c9ced8"/>
    <path d="M14 22 H58 M18 22 V34 M30 22 V34 M42 22 V34 M54 22 V34" stroke="#c9ced8" stroke-width="4"/>
    <rect x="70" y="22" width="14" height="8" rx="3" fill="#ffd23f"/><rect x="10" y="50" width="20" height="14" rx="3" fill="#fff" opacity=".8"/>
    ${wheel(24, 76)}${wheel(76, 76)}`),
  police: svg(`<rect x="8" y="46" width="84" height="28" rx="12" fill="#fff"/><path d="M24 46 Q30 26 50 26 Q70 26 76 46Z" fill="#2f5fbf"/>
    <path d="M30 44 Q34 32 48 32 V44Z M52 32 Q66 32 70 44 H52Z" fill="#bfe6ff"/><rect x="40" y="18" width="10" height="8" rx="2" fill="#ff4a4a"/><rect x="50" y="18" width="10" height="8" rx="2" fill="#3ea8e0"/>
    <rect x="8" y="56" width="84" height="8" fill="#2f5fbf"/><circle cx="88" cy="52" r="4" fill="#ffd23f"/>${wheel(28, 76)}${wheel(72, 76)}`),
  bus: svg(`<rect x="6" y="24" width="88" height="50" rx="12" fill="#ffb627"/><rect x="6" y="58" width="88" height="6" fill="#ff8a3d"/>
    ${[12, 32, 52].map((x) => `<rect x="${x}" y="32" width="16" height="16" rx="3" fill="#bfe6ff"/>`).join('')}<rect x="74" y="32" width="14" height="28" rx="3" fill="#bfe6ff"/>
    ${wheel(24, 76)}${wheel(76, 76)}`),
  // 腳踏車＋戴安全帽的小孩（color：小孩的代表色）
  bike: (color = '#2f7fe0') => svg(`<circle cx="24" cy="74" r="16" fill="none" stroke="#3a3550" stroke-width="5"/><circle cx="78" cy="74" r="16" fill="none" stroke="#3a3550" stroke-width="5"/>
    <path d="M24 74 L42 50 L66 50 L78 74 M42 50 L52 74 L66 50 M60 42 L70 42" stroke="#ff5d73" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="34" y="44" width="16" height="5" rx="2" fill="#3a3550"/>
    <rect x="42" y="22" width="18" height="26" rx="8" fill="${color}"/><circle cx="52" cy="14" r="10" fill="#ffd9b8"/>
    <path d="M40 14 Q52 -2 64 14Z" fill="#ffd23f"/><path d="M56 30 L68 42" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`),
};
export const helmetSvg = () => svg(`<path d="M12 66 Q14 20 50 18 Q86 20 88 66Z" fill="#ffd23f"/><path d="M30 30 L38 64 M50 22 V64 M70 30 L62 64" stroke="#ffb000" stroke-width="5"/><rect x="8" y="62" width="84" height="10" rx="5" fill="#ff8a3d"/><path d="M26 72 Q50 96 74 72" stroke="#3a3550" stroke-width="4" fill="none"/>`);

// ---- 太空：火箭、星球（每學會一排口訣，一枚火箭飛到一顆星球）----
export const PLANET_COLORS = ['#ff8a3d', '#3ec7e0', '#7ee06a', '#a98bff', '#ff5d8f', '#ffd23f', '#4fb7a8', '#6b8cff'];
export function rocketSvg(c = '#ff5d73', flame = false) {
  return svg(`${flame ? '<path d="M40 78 Q50 104 60 78Z" fill="#ffb627"/><path d="M44 78 Q50 94 56 78Z" fill="#fff3a0"/>' : ''}
    <path d="M50 6 Q72 26 70 70 H30 Q28 26 50 6Z" fill="#f4f6fb"/><path d="M50 6 Q62 16 66 30 H34 Q38 16 50 6Z" fill="${c}"/>
    <circle cx="50" cy="46" r="9" fill="#bfe6ff" stroke="${c}" stroke-width="4"/>
    <path d="M30 56 L18 78 H32Z M70 56 L82 78 H68Z" fill="${c}"/><rect x="40" y="70" width="20" height="8" rx="3" fill="#8a8fa0"/>`);
}
export function planetSvg(i, withRocket = false) {
  const c = PLANET_COLORS[i % PLANET_COLORS.length];
  const ring = i % 3 === 1 ? `<ellipse cx="50" cy="52" rx="44" ry="12" fill="none" stroke="#fff3a0" stroke-width="5" opacity=".8"/>` : '';
  return svg(`<circle cx="50" cy="52" r="30" fill="${c}"/><circle cx="40" cy="42" r="8" fill="#fff" opacity=".35"/><circle cx="60" cy="62" r="5" fill="#000" opacity=".12"/>${ring}
    ${withRocket ? `<g transform="translate(58 4) scale(.4) rotate(30 50 50)">${rocketSvg('#ff5d73').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>` : ''}`);
}

// ---- 煮飯：水餃、盤子 ----
export const dumplingSvg = () => svg(`<path d="M10 62 Q50 10 90 62 Q50 78 10 62Z" fill="#fff8ea"/><path d="M22 52 Q28 44 32 52 Q38 42 44 50 Q50 40 56 50 Q62 42 68 52 Q72 44 78 52" stroke="#e6d4b0" stroke-width="3" fill="none"/><path d="M14 64 Q50 76 86 64" stroke="#e6d4b0" stroke-width="3" fill="none"/>`);
export const plateSvg = () => svg(`<ellipse cx="50" cy="56" rx="46" ry="30" fill="#fff"/><ellipse cx="50" cy="56" rx="34" ry="21" fill="#eef6ff"/><ellipse cx="50" cy="56" rx="46" ry="30" fill="none" stroke="#bfe6ff" stroke-width="4"/>`);

// ---- 恐龍（化石挖出來之後會活過來）與骨頭 ----
export const DINOS = {
  trex: svg(`<path d="M18 70 Q30 40 50 40 L58 20 Q74 10 88 20 Q92 30 80 34 L70 34 Q66 50 72 62 L78 82 H68 L62 66 Q50 70 42 66 L38 84 H28 L32 64 Q20 72 6 74Z" fill="#6fd17f"/><circle cx="76" cy="22" r="3" fill="#2a2f3a"/><path d="M70 30 H86" stroke="#fff" stroke-width="2"/><path d="M60 46 L66 52" stroke="#4fbf6e" stroke-width="4" stroke-linecap="round"/>`),
  tri: svg(`<path d="M10 64 Q20 40 50 42 Q70 42 76 50 L92 44 L86 56 Q90 64 82 68 L74 68 L72 82 H64 L62 70 H38 L36 82 H28 L28 70 Q14 70 10 64Z" fill="#ffb627"/><path d="M76 50 L96 34 M80 56 L100 52" stroke="#fff3c4" stroke-width="4" stroke-linecap="round"/><path d="M70 44 Q76 30 66 26 Q64 38 70 44Z" fill="#ff8a3d"/><circle cx="80" cy="56" r="3" fill="#2a2f3a"/>`),
  stego: svg(`<path d="M6 66 Q24 44 50 44 Q76 44 86 58 Q94 60 92 66 L82 68 L80 82 H72 L70 70 H34 L32 82 H24 L24 70 Q12 72 6 66Z" fill="#7d9cff"/>${[[28, 44], [40, 38], [52, 36], [64, 38], [74, 44]].map(([x, y]) => `<path d="M${x - 6} ${y + 6} L${x} ${y - 12} L${x + 6} ${y + 6}Z" fill="#ff8fbf"/>`).join('')}<circle cx="86" cy="60" r="2.5" fill="#2a2f3a"/>`),
  bronto: svg(`<path d="M8 76 Q20 56 46 56 Q62 56 66 48 L74 16 Q80 8 88 14 Q90 20 82 22 L76 54 Q74 66 64 70 L62 86 H54 L52 72 H34 L32 86 H24 L24 72 Q14 78 8 76Z" fill="#4fb7a8"/><circle cx="84" cy="15" r="2.5" fill="#2a2f3a"/>`),
};
export const boneSvg = (rot = 0) => svg(`<g transform="rotate(${rot} 50 50)"><rect x="22" y="44" width="56" height="12" rx="6" fill="#f4ead2"/><circle cx="22" cy="44" r="9" fill="#f4ead2"/><circle cx="22" cy="56" r="9" fill="#f4ead2"/><circle cx="78" cy="44" r="9" fill="#f4ead2"/><circle cx="78" cy="56" r="9" fill="#f4ead2"/></g>`);
export const skullSvg = () => svg(`<path d="M14 56 Q14 26 46 24 Q80 22 88 46 L86 62 Q70 70 56 64 L52 76 H40 L38 66 Q20 70 14 56Z" fill="#f4ead2"/><circle cx="60" cy="42" r="7" fill="#c9b78f"/><path d="M60 66 L64 72 L68 66 L72 72 L76 64" stroke="#c9b78f" stroke-width="3" fill="none"/>`);

// ---- 更多小動物 ----
export const ANIMALS = {
  pig: svg(`<ellipse cx="50" cy="58" rx="36" ry="26" fill="#ffb3c8"/><circle cx="30" cy="44" r="16" fill="#ffb3c8"/><path d="M20 30 L24 20 L32 30Z" fill="#ff8fb0"/><ellipse cx="18" cy="48" rx="8" ry="6" fill="#ff8fb0"/><circle cx="16" cy="48" r="1.6" fill="#a04a6a"/><circle cx="21" cy="48" r="1.6" fill="#a04a6a"/><circle cx="30" cy="40" r="2.5" fill="#3a2a2a"/>${[30, 44, 60, 72].map((x) => `<rect x="${x}" y="78" width="8" height="12" rx="3" fill="#ff8fb0"/>`).join('')}<path d="M86 52 q8 -4 4 6 q-4 6 4 6" stroke="#ff8fb0" stroke-width="3" fill="none"/>`),
  sheep: svg(`${[[34, 46], [50, 40], [66, 46], [40, 62], [60, 62], [74, 56], [28, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="#fff"/>`).join('')}<ellipse cx="20" cy="46" rx="11" ry="13" fill="#5a4a4a"/><circle cx="17" cy="44" r="2" fill="#fff"/>${[36, 64].map((x) => `<rect x="${x}" y="72" width="7" height="16" rx="3" fill="#5a4a4a"/>`).join('')}`),
  duck: svg(`<ellipse cx="54" cy="64" rx="34" ry="22" fill="#ffd23f"/><circle cx="30" cy="38" r="16" fill="#ffd23f"/><path d="M12 40 L2 44 L12 48Z" fill="#ff8a3d"/><circle cx="26" cy="34" r="2.6" fill="#3a2a2a"/><path d="M50 58 Q66 50 80 62" stroke="#ffb000" stroke-width="4" fill="none"/>`),
  turtle: svg(`<ellipse cx="50" cy="58" rx="34" ry="22" fill="#4fbf6e"/><path d="M30 50 L42 42 L58 42 L70 50 L60 62 H40Z" fill="#3a9a55"/><circle cx="88" cy="58" r="10" fill="#9be3a8"/><circle cx="91" cy="55" r="1.8" fill="#2a2f3a"/>${[[26, 76], [70, 76]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="#9be3a8"/>`).join('')}`),
};

// ---- 交通號誌、停／走牌 ----
export const signSvg = (go) => svg(go
  ? `<circle cx="50" cy="46" r="38" fill="#4cd07d"/><path d="M34 48 L46 60 L68 34" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="46" y="84" width="8" height="16" fill="#8a8fa0"/>`
  : `<polygon points="30,8 70,8 92,30 92,62 70,84 30,84 8,62 8,30" fill="#ff4a4a"/><rect x="24" y="40" width="52" height="12" rx="6" fill="#fff"/><rect x="46" y="84" width="8" height="16" fill="#8a8fa0"/>`);

// ---- 貼紙（愷愷做完關卡拿到；可以貼在小鎮上）----
// 每張貼紙：id、圖
export const STICKERS = {
  trex: DINOS.trex, tri: DINOS.tri, stego: DINOS.stego, bronto: DINOS.bronto,
  fire: VEHICLES.fire, police: VEHICLES.police, bus: VEHICLES.bus,
  pig: ANIMALS.pig, sheep: ANIMALS.sheep, duck: ANIMALS.duck, turtle: ANIMALS.turtle,
  shao: shaoSvg(), rocket: rocketSvg('#ff5d73', true),
};
