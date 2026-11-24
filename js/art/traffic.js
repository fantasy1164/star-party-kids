// 城市裡的交通工具（11/25）：路上跑的汽車、機車、郵差機車、宅配車；地圖上的捷運列車和火車；救護車；
// 以及「大車旁邊哪裡安全」用的俯視圖（垃圾車從上面看）。都是側面看、車頭朝右；往左開時外面用 scaleX(-1) 翻過來。
// 原則：只畫有對應場景的車（郵局 → 郵差機車、客廳門鈴 → 宅配車、醫院 → 救護車、捷運站、火車站）。
const S = (vb, inner) => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const tire = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3a3550"/><circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#c9ced8"/>`;

// 一般汽車（自用車）
export const carSvg = (c = '#e53935') => S('0 0 80 50', `<rect x="4" y="20" width="72" height="20" rx="8" fill="${c}"/><path d="M18 21 Q24 6 40 6 Q58 6 64 21Z" fill="${c}"/>
  <path d="M24 20 Q28 11 39 11 V20Z M43 11 Q54 11 58 20 H43Z" fill="#bfe6ff"/><rect x="70" y="24" width="6" height="5" rx="2" fill="#fff3a0"/><rect x="4" y="24" width="5" height="5" rx="2" fill="#ff8a8a"/>
  ${tire(20, 41, 7)}${tire(60, 41, 7)}`);

// 騎機車的人（戴安全帽）
export const riderSvg = (c = '#2f7fe0', shirt = '#ffb627', helmet = '#ffffff') => S('0 0 60 60', `${tire(12, 50, 8)}${tire(48, 50, 8)}
  <path d="M10 44 H40 L46 30 H52" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="36" width="24" height="9" rx="4" fill="${c}"/>
  <rect x="22" y="18" width="14" height="20" rx="6" fill="${shirt}"/><path d="M34 24 L46 30" stroke="${shirt}" stroke-width="5" stroke-linecap="round"/><path d="M26 36 L34 46" stroke="#3a4a6a" stroke-width="6" stroke-linecap="round"/>
  <circle cx="30" cy="12" r="8" fill="#ffd9b8"/><path d="M21 13 Q22 1 31 2 Q40 3 39 13Z" fill="${helmet}" stroke="#c9ced8" stroke-width="1.5"/>`);

// 郵差的綠色機車（後面一個郵件箱）
export const postScooterSvg = () => S('0 0 64 60', `${tire(12, 50, 8)}${tire(50, 50, 8)}
  <rect x="2" y="22" width="20" height="18" rx="3" fill="#2fa65a"/><path d="M5 28 H19" stroke="#fff" stroke-width="3"/>
  <path d="M12 44 H42 L48 30 H54" stroke="#2fa65a" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="16" y="36" width="24" height="9" rx="4" fill="#2fa65a"/>
  <rect x="24" y="18" width="14" height="20" rx="6" fill="#2fa65a"/><path d="M36 24 L48 30" stroke="#2fa65a" stroke-width="5" stroke-linecap="round"/><path d="M28 36 L36 46" stroke="#1d5a33" stroke-width="6" stroke-linecap="round"/>
  <circle cx="32" cy="12" r="8" fill="#ffd9b8"/><path d="M23 13 Q24 1 33 2 Q42 3 41 13Z" fill="#2fa65a"/>`);

// 宅配車（白色小貨車，車身一條黃色，畫一個箱子）
export const vanSvg = () => S('0 0 96 60', `<rect x="4" y="10" width="64" height="38" rx="5" fill="#fff"/><path d="M68 20 H82 L92 34 V48 H68Z" fill="#fff"/><path d="M71 23 H81 L88 34 H71Z" fill="#bfe6ff"/>
  <rect x="4" y="34" width="88" height="6" fill="#ffc93c"/><path d="M24 18 L38 14 L52 18 L38 22Z" fill="#e0b27e"/><path d="M24 18 V30 L38 34 V22Z" fill="#c98b5e"/><path d="M52 18 V30 L38 34 V22Z" fill="#d9a066"/>
  ${tire(22, 50, 8)}${tire(78, 50, 8)}`);

// 救護車（醫院急診門口）
export const ambulanceSvg = () => S('0 0 110 74', `<rect x="4" y="16" width="74" height="42" rx="8" fill="#fff"/><path d="M78 26 H94 L106 42 V58 H78Z" fill="#fff"/><path d="M82 30 H93 L101 42 H82Z" fill="#bfe6ff"/>
  <rect x="4" y="40" width="102" height="6" fill="#d4e157"/><rect x="30" y="22" width="8" height="22" fill="#e53935"/><rect x="23" y="29" width="22" height="8" fill="#e53935"/><rect x="40" y="8" width="16" height="8" rx="3" fill="#ff4a4a"/>
  ${tire(24, 60, 9)}${tire(86, 60, 9)}`);

// 捷運列車（三節，前後對稱，往哪邊開都不用翻）
export const mrtTrainSvg = () => S('0 0 300 60', `${[0, 1, 2].map((i) => `<g transform="translate(${i * 100} 0)">
  <rect x="3" y="8" width="94" height="44" rx="${i === 1 ? 6 : 6}" fill="#f4f8fc"/>${i === 0 ? '<path d="M3 14 Q3 8 12 8 H20 V52 H10 Q3 52 3 44Z" fill="#3ea8e0"/>' : ''}${i === 2 ? '<path d="M97 14 Q97 8 88 8 H80 V52 H90 Q97 52 97 44Z" fill="#3ea8e0"/>' : ''}
  <rect x="3" y="34" width="94" height="6" fill="#3ea8e0"/>${[24, 46, 68].map((x) => `<rect x="${x}" y="14" width="14" height="16" rx="3" fill="#bfe6ff"/>`).join('')}</g>`).join('')}`);

// 城際火車（橘色，前後都是車頭）
export const trainSvg = (n = 2) => S(`0 0 ${n * 120} 70`, `${[...Array(n).keys()].map((i) => `<g transform="translate(${i * 120} 0)">
  <rect x="3" y="10" width="114" height="48" rx="8" fill="#ff8a3d"/><rect x="3" y="40" width="114" height="8" fill="#fff"/>
  ${[20, 44, 68, 92].map((x) => `<rect x="${x}" y="18" width="14" height="16" rx="3" fill="#bfe6ff"/>`).join('')}${tire(22, 60, 7)}${tire(98, 60, 7)}</g>`).join('')}
  <path d="M3 18 Q3 10 16 10 H18 V58 H8 Q3 58 3 50Z" fill="#e0602a"/><path d="M${n * 120 - 3} 18 Q${n * 120 - 3} 10 ${n * 120 - 16} 10 H${n * 120 - 18} V58 H${n * 120 - 8} Q${n * 120 - 3} 58 ${n * 120 - 3} 50Z" fill="#e0602a"/>`);

// 喇叭（點車子時的小圖示用不到，給聽聲音關卡的「再聽一次」按鈕）
export const speakerSvg = () => S('0 0 100 100', `<circle cx="50" cy="50" r="46" fill="#fff"/><path d="M22 40 H36 L56 24 V76 L36 60 H22Z" fill="#4a3b6b"/>
  <path d="M64 36 Q72 50 64 64 M72 28 Q86 50 72 72" stroke="#4a3b6b" stroke-width="6" fill="none" stroke-linecap="round"/>`);

// ---- 俯視圖（大車旁邊哪裡安全） ----
// 垃圾車從上面看：車頭在右邊（x 0..200，y 0..80）
export const truckTopSvg = () => `<g><rect x="0" y="4" width="150" height="72" rx="8" fill="#ffd23f"/><rect x="10" y="14" width="130" height="52" rx="6" fill="#ffe27a"/>
  <path d="M30 40 H120" stroke="#e0b030" stroke-width="4"/><rect x="152" y="6" width="46" height="68" rx="10" fill="#2f7fe0"/><rect x="170" y="12" width="22" height="56" rx="5" fill="#bfe6ff"/>
  <rect x="20" y="-4" width="26" height="10" rx="3" fill="#3a3550"/><rect x="20" y="74" width="26" height="10" rx="3" fill="#3a3550"/><rect x="160" y="-4" width="26" height="10" rx="3" fill="#3a3550"/><rect x="160" y="74" width="26" height="10" rx="3" fill="#3a3550"/></g>`;
