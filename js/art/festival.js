// 節慶與生日的美術（11/25）：一樣是軟膠玩具質感、不描黑邊、不用字。
const S = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const star = (cx, cy, r, c = '#ffd23f') => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; p += `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)} `; } return `<polygon points="${p}" fill="${c}"/>`; };
// 紅紙上的金色「字」：用彎彎的金線代替真的字（小朋友看形狀就好）
const gold = (x, y, w, h) => `<path d="M${x} ${y + h * 0.3} q${w * 0.25} ${-h * 0.25} ${w * 0.5} 0 t${w * 0.5} 0 M${x + w * 0.2} ${y + h * 0.65} h${w * 0.6} M${x + w * 0.5} ${y + h * 0.1} v${h * 0.8}" stroke="#ffd23f" stroke-width="${Math.max(3, w * 0.1)}" fill="none" stroke-linecap="round"/>`;

export const FICON = {
  // 生日
  cake: S(`<rect x="16" y="52" width="68" height="36" rx="8" fill="#ffb3cf"/><rect x="16" y="52" width="68" height="10" rx="5" fill="#fff"/><path d="M16 62 q8 8 17 0 t17 0 t17 0 t17 0" fill="#fff"/>
    <rect x="12" y="86" width="76" height="8" rx="4" fill="#c9d3de"/>${[34, 50, 66].map((x) => `<rect x="${x - 3}" y="30" width="6" height="22" rx="2" fill="#7fd3ff"/><path d="M${x} 20 q6 7 0 12 q-6 -5 0 -12Z" fill="#ffb627"/>`).join('')}`),
  candle: S(`<rect x="42" y="36" width="16" height="56" rx="4" fill="#7fd3ff"/><path d="M42 46 L58 40 M42 60 L58 54 M42 74 L58 68" stroke="#fff" stroke-width="4"/><path d="M50 8 q14 16 0 26 q-14 -10 0 -26Z" fill="#ffb627"/><path d="M50 18 q6 8 0 13 q-6 -5 0 -13Z" fill="#fff3a0"/>`),
  gift: S(`<rect x="14" y="40" width="72" height="50" rx="6" fill="#ff5d73"/><rect x="10" y="30" width="80" height="16" rx="5" fill="#ff8fa3"/><rect x="44" y="30" width="12" height="60" fill="#ffd23f"/>
    <path d="M50 30 C36 10 20 22 32 30Z M50 30 C64 10 80 22 68 30Z" fill="#ffd23f"/>`),
  card: S(`<rect x="12" y="18" width="76" height="64" rx="8" fill="#fff" stroke="#ffb3cf" stroke-width="4"/><path d="M50 70 C24 52 26 32 40 30 C46 29 49 33 50 37 C51 33 54 29 60 30 C74 32 76 52 50 70Z" fill="#ff5d8f"/>`),
  mic: S(`<rect x="38" y="10" width="24" height="44" rx="12" fill="#4a3b6b"/><path d="M28 44 q0 22 22 22 q22 0 22 -22" stroke="#4a3b6b" stroke-width="6" fill="none"/><rect x="47" y="66" width="6" height="16" fill="#4a3b6b"/><rect x="34" y="82" width="32" height="6" rx="3" fill="#4a3b6b"/><circle cx="44" cy="22" r="4" fill="#fff" opacity=".5"/>`),
  wish: S(`<circle cx="50" cy="50" r="44" fill="#3b3480"/>${star(50, 46, 22)}${star(24, 24, 7, '#fff3a0')}${star(78, 72, 6, '#fff3a0')}`),
  balloon: S(`<ellipse cx="50" cy="40" rx="28" ry="34" fill="#ff8fb8"/><ellipse cx="40" cy="26" rx="7" ry="11" fill="#fff" opacity=".5"/><path d="M46 74 H54 L50 80Z" fill="#ff5d8f"/><path d="M50 80 C44 88 56 92 50 99" stroke="#c9b6d8" stroke-width="2" fill="none"/>`),
  // 春節
  broom: S(`<rect x="47" y="6" width="7" height="56" rx="3" fill="#c98b5e" transform="rotate(20 50 50)"/><path d="M30 60 L62 56 L74 92 L22 96Z" fill="#e0b030" transform="rotate(20 50 70)"/><path d="M34 70 L30 92 M46 68 L44 94 M58 66 L60 92" stroke="#b08020" stroke-width="3" transform="rotate(20 50 70)"/>`),
  couplet: S(`<rect x="14" y="20" width="18" height="70" rx="3" fill="#e53935"/><rect x="68" y="20" width="18" height="70" rx="3" fill="#e53935"/><rect x="26" y="6" width="48" height="14" rx="3" fill="#e53935"/>${gold(17, 30, 12, 50)}${gold(71, 30, 12, 50)}
    <g transform="rotate(45 50 55)"><rect x="38" y="43" width="24" height="24" fill="#e53935"/></g>${gold(43, 48, 14, 14)}`),
  fu: S(`<g transform="rotate(45 50 50)"><rect x="18" y="18" width="64" height="64" rx="4" fill="#e53935"/></g>
    <g fill="none" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"><path d="M38 36 V70 M30 46 H44 M54 34 H70 M56 44 H68 V54 H56Z M54 60 H70 V72 H54Z M62 60 V72"/></g>`),
  redpacket: S(`<rect x="24" y="10" width="52" height="80" rx="6" fill="#e53935"/><path d="M24 30 Q50 46 76 30" fill="#c62828"/><circle cx="50" cy="40" r="10" fill="#ffd23f"/>${gold(36, 56, 28, 24)}`),
  lantern: S(`<rect x="46" y="4" width="8" height="10" fill="#c98b5e"/><rect x="34" y="12" width="32" height="8" rx="3" fill="#ffd23f"/><ellipse cx="50" cy="50" rx="34" ry="30" fill="#e53935"/>
    <path d="M50 20 V80 M34 24 Q24 50 34 76 M66 24 Q76 50 66 76" stroke="#ffb627" stroke-width="3" fill="none"/><rect x="34" y="78" width="32" height="8" rx="3" fill="#ffd23f"/><path d="M42 86 V98 M50 86 V98 M58 86 V98" stroke="#ffd23f" stroke-width="3"/>`),
  firecracker: S(`<path d="M30 20 Q50 30 70 20" stroke="#8a6a4a" stroke-width="3" fill="none"/>${[0, 1, 2, 3].map((i) => `<rect x="${30 + (i % 2) * 22}" y="${28 + i * 16}" width="18" height="14" rx="3" fill="#e53935"/>`).join('')}`),
  // 端午
  zongzi: S(`<path d="M50 14 L86 82 H14Z" fill="#6fbf5a"/><path d="M50 14 L68 82 M50 14 L32 82" stroke="#4f9f3e" stroke-width="3"/><path d="M22 66 H78 M30 50 H70" stroke="#e0b27e" stroke-width="5"/>`),
  sachet: S(`<path d="M50 12 V28" stroke="#e53935" stroke-width="3"/><path d="M28 30 Q50 22 72 30 L66 76 Q50 90 34 76Z" fill="#ff8fb8"/><circle cx="50" cy="52" r="10" fill="#ffd23f"/><path d="M42 84 V98 M50 86 V100 M58 84 V98" stroke="#e53935" stroke-width="3"/>`),
  boat: S(`<path d="M6 60 H94 Q86 80 64 82 H34 Q14 80 6 60Z" fill="#ff8a3d"/><path d="M6 60 Q0 44 12 40 Q20 44 18 54" fill="#4cd07d"/><circle cx="12" cy="44" r="3" fill="#2b2140"/><path d="M84 60 Q96 50 92 44" stroke="#4cd07d" stroke-width="6" fill="none"/>
    ${[30, 48, 66].map((x) => `<circle cx="${x}" cy="48" r="7" fill="#ffd9b8"/><path d="M${x} 56 L${x - 10} 70" stroke="#c98b5e" stroke-width="4"/>`).join('')}<path d="M6 66 H94" stroke="#ffd23f" stroke-width="4"/>`),
  egg: S(`<path d="M50 10 C72 10 82 44 82 62 C82 82 68 92 50 92 C32 92 18 82 18 62 C18 44 28 10 50 10Z" fill="#fff8ec" stroke="#e8d6b8" stroke-width="3"/><ellipse cx="40" cy="38" rx="7" ry="10" fill="#fff"/>`),
  lifejacket: S(`<path d="M26 16 H40 Q50 26 60 16 H74 L82 84 H18Z" fill="#ff8a3d"/><path d="M22 50 H78 M20 68 H80" stroke="#fff" stroke-width="5"/><rect x="47" y="24" width="6" height="60" fill="#e0602a"/>`),
  // 中秋
  moon: S(`<circle cx="50" cy="50" r="40" fill="#ffe27a"/><circle cx="38" cy="38" r="6" fill="#f4cf5a"/><circle cx="62" cy="58" r="8" fill="#f4cf5a"/><circle cx="44" cy="66" r="4" fill="#f4cf5a"/>`),
  rabbit: S(`<ellipse cx="50" cy="68" rx="26" ry="22" fill="#fff"/><circle cx="50" cy="44" r="18" fill="#fff"/><ellipse cx="41" cy="16" rx="6" ry="16" fill="#fff"/><ellipse cx="59" cy="16" rx="6" ry="16" fill="#fff"/>
    <ellipse cx="41" cy="16" rx="2.5" ry="10" fill="#ffc0d4"/><ellipse cx="59" cy="16" rx="2.5" ry="10" fill="#ffc0d4"/><circle cx="44" cy="42" r="3" fill="#2b2140"/><circle cx="56" cy="42" r="3" fill="#2b2140"/><circle cx="50" cy="50" r="2.5" fill="#ff8fb8"/>`),
  mooncake: S(`<circle cx="50" cy="52" r="36" fill="#d9a066"/><circle cx="50" cy="52" r="28" fill="#e8b47a"/>${[0, 45, 90, 135].map((a) => `<path d="M50 30 V74" stroke="#c98b5e" stroke-width="4" transform="rotate(${a} 50 52)"/>`).join('')}<circle cx="50" cy="52" r="9" fill="#d9a066"/>`),
  pomelo: S(`<circle cx="50" cy="56" r="36" fill="#c8e07a"/><circle cx="38" cy="44" r="8" fill="#fff" opacity=".35"/><path d="M50 20 Q52 10 60 8" stroke="#6b8a3a" stroke-width="4" fill="none"/><path d="M58 12 Q72 6 74 16 Q64 20 58 12Z" fill="#4fbf6e"/>`),
  bbq: S(`<rect x="14" y="40" width="72" height="12" rx="4" fill="#4a3b6b"/><path d="M20 52 L30 90 M80 52 L70 90" stroke="#4a3b6b" stroke-width="5"/>${[24, 40, 56, 72].map((x) => `<rect x="${x - 4}" y="22" width="8" height="18" rx="3" fill="#c96a3a"/>`).join('')}<path d="M30 38 q4 -10 0 -16 M50 38 q4 -10 0 -16 M70 38 q4 -10 0 -16" stroke="#ff8a3d" stroke-width="3" fill="none"/>`),
  // 萬聖節
  pumpkin: S(`<ellipse cx="50" cy="58" rx="40" ry="32" fill="#ff8a3d"/><path d="M50 26 V90 M30 30 Q22 58 30 86 M70 30 Q78 58 70 86" stroke="#e0602a" stroke-width="4" fill="none"/><path d="M48 26 Q46 12 56 8" stroke="#6b8a3a" stroke-width="6" fill="none"/>`),
  jack: S(`<ellipse cx="50" cy="58" rx="40" ry="32" fill="#ff8a3d"/><path d="M48 26 Q46 12 56 8" stroke="#6b8a3a" stroke-width="6" fill="none"/><path d="M28 48 L40 40 L42 54Z M72 48 L60 40 L58 54Z M44 62 L50 54 L56 62Z" fill="#ffd23f"/><path d="M28 70 Q50 86 72 70 L66 74 L60 70 L54 76 L46 70 L40 76 L34 70Z" fill="#ffd23f"/>`),
  candy: S(`<path d="M10 40 L28 50 L10 60Z M90 40 L72 50 L90 60Z" fill="#a98bff"/><circle cx="50" cy="50" r="24" fill="#ff8a3d"/><path d="M34 40 C44 50 56 50 66 40 M34 58 C44 64 56 64 66 58" stroke="#fff" stroke-width="5" fill="none"/>`),
  witch: S(`<path d="M50 6 L70 70 H30Z" fill="#6a4fb0"/><ellipse cx="50" cy="74" rx="44" ry="10" fill="#6a4fb0"/><rect x="34" y="58" width="32" height="8" fill="#ffd23f"/>${star(56, 36, 6)}`),
  ghost: S(`<path d="M20 90 V44 Q20 12 50 12 Q80 12 80 44 V90 L70 82 L60 90 L50 82 L40 90 L30 82Z" fill="#fff" stroke="#e3e0ef" stroke-width="3"/><ellipse cx="40" cy="44" rx="5" ry="7" fill="#2b2140"/><ellipse cx="60" cy="44" rx="5" ry="7" fill="#2b2140"/><ellipse cx="50" cy="60" rx="6" ry="4" fill="#ff8fb8"/>`),
  door: S(`<rect x="22" y="8" width="56" height="88" rx="6" fill="#a8693f"/><rect x="28" y="14" width="44" height="34" rx="4" fill="#c98b5e"/><rect x="28" y="54" width="44" height="36" rx="4" fill="#c98b5e"/><circle cx="66" cy="54" r="4" fill="#ffd23f"/>`),
  // 聖誕節
  tree: S(`<path d="M50 6 L80 44 H64 L86 74 H14 L36 44 H20Z" fill="#2f9a5a"/><rect x="44" y="74" width="12" height="18" fill="#a8693f"/>${star(50, 10, 9)}<circle cx="40" cy="40" r="4" fill="#ff5d73"/><circle cx="60" cy="56" r="4" fill="#ffd23f"/><circle cx="36" cy="64" r="4" fill="#7fd3ff"/>`),
  advent: S(`<rect x="8" y="12" width="84" height="80" rx="8" fill="#2f9a5a"/>${[...Array(9)].map((_, i) => `<rect x="${16 + (i % 3) * 25}" y="${20 + Math.floor(i / 3) * 24}" width="18" height="18" rx="3" fill="${i === 4 ? '#ffd23f' : '#e53935'}"/>`).join('')}`),
  cookie: S(`<circle cx="50" cy="50" r="36" fill="#d4955f"/><circle cx="40" cy="40" r="5" fill="#6b3f1f"/><circle cx="60" cy="48" r="5" fill="#6b3f1f"/><circle cx="46" cy="62" r="5" fill="#6b3f1f"/><circle cx="64" cy="66" r="4" fill="#6b3f1f"/>`),
  milk: S(`<path d="M30 20 H70 L66 90 H34Z" fill="#fff" stroke="#c9d3de" stroke-width="4"/><path d="M32 40 H68 L65 88 H35Z" fill="#f4f8fc"/>`),
  stocking: S(`<path d="M34 10 H64 V56 L80 70 Q86 84 72 88 L46 84 Q32 80 34 64Z" fill="#e53935"/><rect x="30" y="8" width="38" height="14" rx="6" fill="#fff"/>`),
  ornament: (c = '#e53935') => S(`<rect x="44" y="10" width="12" height="10" rx="2" fill="#ffd23f"/><circle cx="50" cy="56" r="34" fill="${c}"/><ellipse cx="40" cy="44" rx="8" ry="12" fill="#fff" opacity=".4"/>`),
  // 母親節、父親節、家人生日
  helper: S(`<path d="M50 84 C20 64 18 38 34 32 C42 29 48 34 50 40 C52 34 58 29 66 32 C82 38 80 64 50 84Z" fill="#ff5d8f"/><path d="M30 70 Q20 80 26 92 M70 70 Q80 80 74 92" stroke="#ffd9b8" stroke-width="9" stroke-linecap="round" fill="none"/>`),
  carnation: S(`<path d="M50 54 V96" stroke="#4fbf6e" stroke-width="5"/><path d="M50 74 Q34 66 30 76 Q40 82 50 78" fill="#6fd17f"/><circle cx="50" cy="38" r="22" fill="#ff5d8f"/>${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="50" cy="22" r="9" fill="#ff8fb8" transform="rotate(${a} 50 38)"/>`).join('')}`),
  tie: S(`<path d="M40 10 H60 L56 24 H44Z" fill="#2f5fbf"/><path d="M44 24 H56 L66 76 L50 92 L34 76Z" fill="#2f5fbf"/><path d="M40 40 L60 34 M38 56 L62 50 M38 72 L62 66" stroke="#7fb8ff" stroke-width="4"/>`),
};

// 開場角色頭上戴的小配件（看板上方）：birthday 派對帽、cny 小燈籠、dragon 香包、moon 兔耳朵、halloween 巫師帽、xmas 聖誕帽、kids 氣球、mother/father 愛心
export const ACCESSORY = {
  birthday: S(`<path d="M50 4 L74 84 H26Z" fill="#ff8fb8"/><path d="M38 44 L62 36 M32 66 L68 56" stroke="#fff" stroke-width="6"/><circle cx="50" cy="6" r="8" fill="#ffd23f"/>`),
  kids: FICON.balloon,
  cny: FICON.lantern,
  dragon: FICON.sachet,
  moon: S(`<ellipse cx="34" cy="50" rx="12" ry="40" fill="#fff"/><ellipse cx="66" cy="50" rx="12" ry="40" fill="#fff"/><ellipse cx="34" cy="50" rx="5" ry="28" fill="#ffc0d4"/><ellipse cx="66" cy="50" rx="5" ry="28" fill="#ffc0d4"/>`),
  halloween: FICON.witch,
  xmas: S(`<path d="M14 80 Q40 10 78 20 L84 60 Q60 40 44 80Z" fill="#e53935"/><rect x="8" y="74" width="60" height="16" rx="8" fill="#fff"/><circle cx="84" cy="62" r="10" fill="#fff"/>`),
  mother: FICON.carnation,
  father: FICON.tie,
  pbirthday: S(`<path d="M50 4 L74 84 H26Z" fill="#ff8fb8"/><circle cx="50" cy="6" r="8" fill="#ffd23f"/>`),
};

// 節慶舞台（城市裡的臨時活動場地）上方的大招牌圖案
export const FEST_SIGN = {
  birthday: FICON.cake, kids: FICON.balloon, cny: FICON.fu, dragon: FICON.boat, moon: FICON.moon, halloween: FICON.jack, xmas: FICON.tree, mother: FICON.carnation, father: FICON.tie, pbirthday: FICON.card,
};
// 節慶主色（舞台、帳篷、彩旗）
export const FEST_COLOR = {
  birthday: ['#ff8fb8', '#ffd23f'], kids: ['#7fd3ff', '#ffd23f'], cny: ['#e53935', '#ffd23f'], dragon: ['#4cd07d', '#ff8a3d'], moon: ['#3b3480', '#ffe27a'],
  halloween: ['#6a4fb0', '#ff8a3d'], xmas: ['#2f9a5a', '#e53935'], mother: ['#ff8fb8', '#ffffff'], father: ['#2f5fbf', '#ffd23f'], pbirthday: ['#ff8fb8', '#ffd23f'],
};
