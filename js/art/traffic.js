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

// ---- 可以坐的專屬車（11/25）：超市 → 生鮮貨車、郵局 → 郵務車、圖書館 → 行動圖書車 ----
// 生鮮貨車（冷藏車：白色車廂、藍色雪花，側面畫魚和菜）
export const freshTruckSvg = () => S('0 0 120 80', `<rect x="4" y="12" width="78" height="50" rx="6" fill="#f4fbff"/><rect x="4" y="12" width="78" height="10" rx="5" fill="#7fc8f0"/>
  <path d="M22 34 L22 52 M14 38 L30 48 M14 48 L30 38" stroke="#3ea8e0" stroke-width="4" stroke-linecap="round"/>
  <path d="M40 46 C46 38 58 38 62 46 C58 54 46 54 40 46Z" fill="#7fb8ff"/><path d="M62 46 L70 40 V52Z" fill="#7fb8ff"/><circle cx="46" cy="45" r="2" fill="#2b2140"/>
  <path d="M68 32 Q72 24 76 32 Q72 40 68 32Z" fill="#5fcf72"/><circle cx="58" cy="30" r="6" fill="#ff7043"/>
  <path d="M82 28 H98 L112 44 V62 H82Z" fill="#3ea8e0"/><path d="M86 32 H97 L106 44 H86Z" fill="#bfe6ff"/><rect x="106" y="50" width="6" height="5" rx="2" fill="#fff3a0"/>
  ${tire(24, 64, 10)}${tire(96, 64, 10)}`);
// 郵務車（綠色廂型車，側面一個大信封）
export const postVanSvg = () => S('0 0 110 74', `<rect x="4" y="12" width="74" height="46" rx="8" fill="#2fa65a"/><path d="M78 22 H92 L104 38 V58 H78Z" fill="#2fa65a"/><path d="M81 26 H91 L99 38 H81Z" fill="#bfe6ff"/>
  <rect x="18" y="22" width="44" height="28" rx="4" fill="#fff"/><path d="M18 24 L40 40 L62 24" stroke="#c9ced8" stroke-width="3" fill="none"/><rect x="52" y="25" width="8" height="9" fill="#e83a3a"/>
  <rect x="4" y="50" width="100" height="4" fill="#1d7a40"/><rect x="98" y="44" width="6" height="5" rx="2" fill="#fff3a0"/>
  ${tire(24, 60, 9)}${tire(88, 60, 9)}`);
// 行動圖書車（藍色小巴，窗戶裡看得到一排排彩色的書）
export const bookmobileSvg = () => S('0 0 120 80', `<rect x="4" y="10" width="104" height="52" rx="12" fill="#4f7fe0"/><rect x="4" y="46" width="104" height="6" fill="#ffd23f"/>
  <rect x="12" y="18" width="70" height="24" rx="4" fill="#fff8e6"/>${['#ff5d73', '#ffb627', '#4cd07d', '#3ea8e0', '#a98bff', '#ff8a3d', '#5fcf72', '#ff5d73', '#3ea8e0'].map((c, i) => `<rect x="${15 + i * 7.4}" y="${21 + (i % 3) * 2}" width="6" height="${19 - (i % 3) * 2}" rx="1.5" fill="${c}"/>`).join('')}
  <rect x="88" y="18" width="14" height="22" rx="3" fill="#bfe6ff"/><rect x="102" y="50" width="6" height="5" rx="2" fill="#fff3a0"/>
  ${tire(26, 64, 10)}${tire(88, 64, 10)}`);

// 裝貨小任務用的東西（100×100）
const P = (inner) => S('0 0 100 100', inner);
export const LOAD_ART = {
  // 小熊躺在擔架上（腳受傷，貼了 OK 繃）
  teddyStretcher: P(`<rect x="6" y="56" width="88" height="12" rx="5" fill="#ff8a8a"/><rect x="2" y="60" width="96" height="5" rx="2" fill="#8a8fa0"/><circle cx="16" cy="78" r="6" fill="#3a3550"/><circle cx="84" cy="78" r="6" fill="#3a3550"/><path d="M16 66 V72 M84 66 V72" stroke="#8a8fa0" stroke-width="4"/>
    <circle cx="26" cy="34" r="7" fill="#b5794b"/><circle cx="40" cy="30" r="7" fill="#b5794b"/><circle cx="33" cy="44" r="15" fill="#c98b5e"/><ellipse cx="33" cy="49" rx="6" ry="4.5" fill="#f1d2b0"/><circle cx="28" cy="41" r="2" fill="#2b2140"/><circle cx="38" cy="41" r="2" fill="#2b2140"/>
    <ellipse cx="62" cy="52" rx="26" ry="9" fill="#bfe6ff"/><rect x="74" y="44" width="14" height="7" rx="3" fill="#fff" transform="rotate(-10 81 47)"/>`),
  medkit: P(`<rect x="14" y="30" width="72" height="54" rx="10" fill="#fff"/><rect x="38" y="20" width="24" height="14" rx="5" fill="none" stroke="#e53935" stroke-width="5"/><rect x="44" y="42" width="12" height="32" fill="#e53935"/><rect x="34" y="52" width="32" height="12" fill="#e53935"/>`),
  blanket: P(`<rect x="12" y="34" width="76" height="44" rx="10" fill="#ffb627"/><path d="M12 48 H88 M12 62 H88" stroke="#ff8a3d" stroke-width="5"/><rect x="12" y="34" width="76" height="44" rx="10" fill="none" stroke="#ff8a3d" stroke-width="3"/>`),
  // 冷藏櫃、常溫架
  fridge: P(`<rect x="10" y="6" width="80" height="88" rx="10" fill="#e6f6ff"/><rect x="10" y="6" width="80" height="88" rx="10" fill="none" stroke="#7fc8f0" stroke-width="5"/>
    <path d="M50 22 V54 M36 30 L64 46 M36 46 L64 30" stroke="#3ea8e0" stroke-width="5" stroke-linecap="round"/><rect x="74" y="58" width="6" height="22" rx="3" fill="#7fc8f0"/>`),
  shelf: P(`<rect x="10" y="10" width="80" height="84" rx="6" fill="#e8cf95"/><rect x="16" y="16" width="68" height="20" rx="3" fill="#fff8e6"/><rect x="16" y="42" width="68" height="20" rx="3" fill="#fff8e6"/><rect x="16" y="68" width="68" height="20" rx="3" fill="#fff8e6"/>`),
  // 郵袋
  bagRed: P(`<path d="M22 30 Q50 20 78 30 L86 88 Q50 96 14 88Z" fill="#e83a3a"/><path d="M30 30 Q50 6 70 30" stroke="#b72a2a" stroke-width="6" fill="none"/><rect x="38" y="52" width="24" height="16" rx="2" fill="#fff"/><path d="M38 53 L50 62 L62 53" stroke="#e83a3a" stroke-width="2.5" fill="none"/>`),
  bagGreen: P(`<path d="M22 30 Q50 20 78 30 L86 88 Q50 96 14 88Z" fill="#2fa65a"/><path d="M30 30 Q50 6 70 30" stroke="#1d7a40" stroke-width="6" fill="none"/><rect x="38" y="52" width="24" height="16" rx="2" fill="#fff"/><path d="M38 53 L50 62 L62 53" stroke="#2fa65a" stroke-width="2.5" fill="none"/>`),
  letterRed: P(`<rect x="8" y="24" width="84" height="54" rx="6" fill="#fff"/><path d="M8 28 L50 56 L92 28" stroke="#c9ced8" stroke-width="4" fill="none"/><rect x="8" y="24" width="84" height="54" rx="6" fill="none" stroke="#e83a3a" stroke-width="6"/><rect x="70" y="30" width="16" height="18" fill="#e83a3a"/>`),
  letterGreen: P(`<rect x="8" y="24" width="84" height="54" rx="6" fill="#fff"/><path d="M8 28 L50 56 L92 28" stroke="#c9ced8" stroke-width="4" fill="none"/><rect x="8" y="24" width="84" height="54" rx="6" fill="none" stroke="#2fa65a" stroke-width="6"/><rect x="70" y="30" width="16" height="18" fill="#2fa65a"/>`),
  // 書（顏色、高度不同）和書架上的空格
  book: (c, h) => P(`<rect x="26" y="${94 - h}" width="48" height="${h}" rx="5" fill="${c}"/><rect x="26" y="${94 - h}" width="9" height="${h}" fill="#000" opacity=".12"/><rect x="44" y="${100 - h}" width="22" height="7" rx="3" fill="#fff" opacity=".8"/>`),
  slot: (c, h) => P(`<rect x="22" y="${97 - h}" width="56" height="${h + 3}" rx="6" fill="${c}" opacity=".18"/><rect x="22" y="${97 - h}" width="56" height="${h + 3}" rx="6" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="8 6"/>`),
  // 垃圾車、資源回收車（從後面看，張開的口）
  truckTrash: P(`<rect x="8" y="20" width="84" height="70" rx="10" fill="#ffd23f"/><rect x="18" y="30" width="64" height="40" rx="8" fill="#5a4a3a"/><path d="M34 46 H66 M34 54 H66" stroke="#ffd23f" stroke-width="4" opacity=".5"/><circle cx="26" cy="82" r="5" fill="#ff8a3d"/><circle cx="74" cy="82" r="5" fill="#ff8a3d"/>`),
  truckRecycle: P(`<rect x="8" y="20" width="84" height="70" rx="10" fill="#e6f6ff"/><rect x="8" y="20" width="84" height="70" rx="10" fill="none" stroke="#3ea8e0" stroke-width="5"/><rect x="18" y="30" width="64" height="40" rx="8" fill="#5a6a7a"/>
    <path d="M50 34 L66 62 H34Z" stroke="#4cd07d" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M44 40 L50 34 L52 43 M70 56 L66 62 L58 59 M32 58 L34 62 L42 65" stroke="#4cd07d" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="82" r="5" fill="#3ea8e0"/><circle cx="74" cy="82" r="5" fill="#3ea8e0"/>`),
  trashBag: P(`<path d="M30 30 Q24 50 22 70 Q22 92 50 92 Q78 92 78 70 Q76 50 70 30Z" fill="#3a3f4a"/><path d="M36 30 L42 14 L50 26 L58 14 L64 30Z" fill="#3a3f4a"/><path d="M36 30 H64" stroke="#ffd23f" stroke-width="5"/>`),
  // 警笛按鈕
  sirenBtn: P(`<circle cx="50" cy="50" r="46" fill="#fff"/><path d="M26 74 V50 Q26 26 50 26 Q74 26 74 50 V74Z" fill="#ff4a4a"/><rect x="20" y="72" width="60" height="12" rx="5" fill="#4a3b6b"/><path d="M38 46 Q40 36 50 36" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M10 30 L18 36 M90 30 L82 36 M14 56 H6 M86 56 H94" stroke="#ffb627" stroke-width="5" stroke-linecap="round"/>`),
};
