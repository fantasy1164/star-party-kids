// 世界地圖與分區（11/24）：
//   城市（生活區，開車就能到的地方）→ town.js
//   郊區：農場
//   海邊：海生館（參考屏東海生館）、沙灘
//   山上：動物園（參考木柵動物園，旁邊有纜車）
// 跨區域：開車走高速公路，或到火車站坐火車；路上看窗外找東西（不用一直做決定）。
import { createDiorama } from '../engine/diorama.js';
import { div, wait, burst, stageW, shuffle, pick, stageRect } from '../core/dom.js';
import { speak } from '../core/voice.js';
import { sfx, playMusic } from '../core/audio.js';
import { isDark, roomTint } from '../core/clock.js';
import { turnsScene, turnsOn, nextTurn, whoseTurn, levelNow } from '../core/turns.js';
import { setHint, setPlaying, mountClock } from '../core/session.js';
import { shanSvg, kidSvg, starIcon } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { babaSvg, itemSvg } from '../art/town.js';
import { ANIMALS } from '../art/fun.js';
import { PLACE_ICON, ZOO, SEA, MISC } from '../art/world.js';
import { backdrop, homeBtn, rotateBtns, jars, roundBtn, zoomBtns } from '../ui/hud.js';
import { ICON2 } from '../art/more.js';
import { seatbelt, placeBar } from './town.js';

const S = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" width="100%" height="100%">${inner}</svg>`;
const tree = (c = '#4fbf6e') => S(`<rect x="34" y="70" width="12" height="38" rx="5" fill="#a9744f"/><circle cx="40" cy="48" r="34" fill="${c}"/><circle cx="28" cy="36" r="10" fill="#fff" opacity=".2"/>`, '0 0 80 110');
const palm = () => S(`<path d="M42 108 Q38 70 46 40" stroke="#a9744f" stroke-width="9" fill="none" stroke-linecap="round"/>${[-60, -20, 20, 60, 100].map((a) => `<ellipse cx="46" cy="30" rx="30" ry="9" fill="#4fbf6e" transform="rotate(${a} 46 40)"/>`).join('')}`, '0 0 90 110');
const lighthouse = () => S(`<path d="M24 120 L30 30 H50 L56 120Z" fill="#fff"/><path d="M27 60 H53 M25 90 H55" stroke="#ff4a4a" stroke-width="12"/><rect x="28" y="16" width="24" height="16" fill="#ffd23f"/><path d="M24 16 L40 2 L56 16Z" fill="#ff4a4a"/>`, '0 0 80 120');
const sailboat = () => S(`<path d="M10 70 H90 L78 86 H22Z" fill="#ff8a3d"/><path d="M50 10 V68" stroke="#8a6a4a" stroke-width="4"/><path d="M52 14 L84 62 H52Z" fill="#fff"/><path d="M48 24 L22 62 H48Z" fill="#7fd3ff"/>`);
const windmill = () => S(`<path d="M42 110 L48 50 H56 L62 110Z" fill="#fff6e8"/>${[0, 90, 180, 270].map((a) => `<rect x="50" y="20" width="10" height="34" rx="3" fill="#ff8a3d" transform="rotate(${a} 52 50)"/>`).join('')}<circle cx="52" cy="50" r="6" fill="#8a6a4a"/>`, '0 0 104 112');
const monkey = () => S(`<circle cx="50" cy="40" r="22" fill="#a9744f"/><ellipse cx="50" cy="46" rx="14" ry="12" fill="#f1c9a0"/><circle cx="28" cy="38" r="8" fill="#f1c9a0"/><circle cx="72" cy="38" r="8" fill="#f1c9a0"/><circle cx="44" cy="40" r="3" fill="#2a2f3a"/><circle cx="56" cy="40" r="3" fill="#2a2f3a"/><ellipse cx="50" cy="76" rx="18" ry="16" fill="#a9744f"/><path d="M68 80 Q88 70 82 50" stroke="#a9744f" stroke-width="6" fill="none"/>`);
const cablecar = () => S(`<path d="M0 10 L100 30" stroke="#4a3b6b" stroke-width="3"/><path d="M50 20 V36" stroke="#4a3b6b" stroke-width="4"/><rect x="28" y="36" width="44" height="40" rx="10" fill="#3ec7e0"/><rect x="34" y="42" width="32" height="16" rx="4" fill="#fff" opacity=".8"/>`);
const building = (c = '#bfd3ef') => S(`<rect x="20" y="10" width="60" height="90" rx="4" fill="${c}"/>${[20, 40, 60].map((y) => `<rect x="30" y="${y}" width="14" height="12" fill="#fff" opacity=".8"/><rect x="56" y="${y}" width="14" height="12" fill="#fff" opacity=".8"/>`).join('')}`);
const field = () => S(`<path d="M0 70 H100 V100 H0Z" fill="#9fd87f"/>${[10, 30, 50, 70, 90].map((x) => `<path d="M${x} 100 L${x + 6} 70" stroke="#5aa84a" stroke-width="3"/>`).join('')}`);
const peak = (c = '#5aa84a', snow = true) => S(`<path d="M0 160 L70 30 L100 62 L140 0 L200 160Z" fill="${c}"/><path d="M0 160 L70 30 L80 160Z" fill="#000" opacity=".08"/>${snow ? '<path d="M128 22 L140 0 L152 24 L140 32Z" fill="#fff" opacity=".85"/>' : ''}`, '0 0 200 160');
const seagull = () => S(`<path d="M10 50 Q30 30 50 50 Q70 30 90 50" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`);

// ---- 區域 ----
export const ZONES = {
  city: { icon: PLACE_ICON.train, music: 'town' },
  suburb: { icon: itemSvg('cow'), music: 'farm', entry: 'farm' },
  sea: { icon: PLACE_ICON.beach, music: 'sea', entry: 'beach' },
  mountain: { icon: ZOO.panda, music: 'zoo', entry: 'zoo' },
};
// 各區域的地點（城市的在 town.js）
const ZONE_PLACES = {
  suburb: { farm: { x: 420, y: 330, screen: 'farm', icon: itemSvg('feed'), h: 180 } },
  sea: { aquarium: { x: 300, y: 520, screen: 'aquarium', icon: PLACE_ICON.aquarium, h: 150 }, beach: { x: 720, y: 440, screen: 'beach', icon: PLACE_ICON.beach, h: 120 } },
  mountain: { zoo: { x: 450, y: 420, screen: 'zoo', icon: PLACE_ICON.zoo, h: 170 } },
};
export const zoneOfScreen = (screen) => {
  for (const [z, ps] of Object.entries(ZONE_PLACES)) for (const [id, p] of Object.entries(ps)) if (p.screen === screen) return [z, id];
  return null;
};

// 世界地圖按鈕（每張區域地圖右上角）
const GLOBE = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#3ec7e0"/><path d="M30 28 Q46 24 50 38 Q40 52 28 46Z M58 30 Q76 34 76 50 Q66 58 58 50Z M40 62 Q54 58 60 72 Q48 82 38 74Z" fill="#7ee06a"/><circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="4"/></svg>`;
export function worldBtn(root, app) {
  return roundBtn(root, 'btn-world', GLOBE, () => { setPlaying(false); app.go('world'); });
}

// ======================= 區域地圖（郊區、海邊、山上） =======================
function buildZone(zone) {
  const W = 1000, D = 800;
  const floors = {
    suburb: 'background: radial-gradient(circle at 30% 30%, #c8ec9a, #a6d87a)',
    sea: 'background: linear-gradient(0deg, #f6e3b0 0 52%, #bfe9ff 52% 54%, #5ec3ee 54% 100%)',
    mountain: 'background: radial-gradient(circle at 60% 40%, #9fd87f, #6fb85a)',
  };
  const skirt = { suburb: '#a6d987', sea: '#5ec3ee', mountain: '#7fc86a' }[zone];
  const horizon = { suburb: 'nature', sea: 'sea', mountain: 'mountain' }[zone];
  const dio = createDiorama({ gl: true, w: W, d: D, walls: false, zoom: 0.8, zmin: 0.45, zmax: 1.6, cy: 0.58, skirt, horizon, floorCss: floors[zone] });
  const markers = {};
  const P = ZONE_PLACES[zone];
  // 進出這一區的地方：一小段公路＋小車站
  dio.addDecal({ x: 0, y: 720, w: W, h: 60, z: 0.8, css: 'background:#8a8fa0' });
  dio.addDecal({ x: 0, y: 748, w: W, h: 4, z: 1, css: 'background:repeating-linear-gradient(90deg,#fff 0 30px,transparent 30px 60px)' });
  if (zone === 'suburb') {
    // 田（一格一格）、穀倉、圓筒倉、風車、牛
    for (let i = 0; i < 6; i++) dio.addDecal({ x: 620 + (i % 2) * 170, y: 80 + Math.floor(i / 2) * 190, w: 150, h: 170, z: 0.7, css: `background:repeating-linear-gradient(90deg,${i % 3 ? '#8fd36a' : '#e8d36a'} 0 14px,#7cc35a 14px 18px);border-radius:10px` });
    const p = P.farm;
    const tap = 'go:farm';
    const door = `<svg viewBox="0 0 160 100" width="100%" height="100%" preserveAspectRatio="none"><rect x="46" y="34" width="68" height="66" fill="#fff"/><rect x="52" y="40" width="56" height="60" fill="#c9503a"/><path d="M52 40 L108 100 M108 40 L52 100" stroke="#fff" stroke-width="6"/></svg>`;
    dio.addBox({ x: p.x - 80, y: p.y - 80, w: 160, d: 160, h: 100, color: '#e0503a', tap, faces: { s: door, n: door } });
    dio.addGable({ x: p.x - 80, y: p.y - 80, w: 160, d: 160, z: 100, h: 80, over: 12, color: '#7a3b30', wallColor: '#e0503a', ridge: 'y', tap });
    dio.addSprite({ x: p.x + 130, y: p.y - 20, w: 70, h: 230, shadow: 0.5, tap, html: `<svg viewBox="0 0 70 230"><rect x="6" y="40" width="58" height="190" fill="#c9ced8"/><path d="M6 42 C6 4 64 4 64 42Z" fill="#c9503a"/></svg>` });
    dio.addSprite({ x: 160, y: 560, w: 110, h: 120, shadow: 0.4, html: windmill() });
    for (const [x, y] of [[260, 160], [560, 620], [700, 680]]) dio.addSprite({ x, y, w: 80, h: 70, shadow: 0.4, html: itemSvg('cow') });
    for (const [x, y] of [[60, 80], [80, 380], [960, 520]]) dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: tree() });
  }
  if (zone === 'sea') {
    // 海生館：白色建築＋好幾個藍色的波浪屋頂（像海浪），門口一隻白鯨雕像
    const p = P.aquarium, tap = 'go:aquarium';
    const front = `<svg viewBox="0 0 300 90" width="100%" height="100%" preserveAspectRatio="none"><rect x="0" y="40" width="300" height="50" fill="#bfe6ff"/><rect x="128" y="44" width="44" height="46" fill="#3ea8e0"/><path d="M0 40 H300" stroke="#3ea8e0" stroke-width="6"/></svg>`;
    dio.addBox({ x: p.x - 150, y: p.y - 80, w: 300, d: 160, h: 90, color: '#f4f8ff', tap, faces: { s: front } });
    ['#3ea8e0', '#5ec3ee', '#2f8fd0'].forEach((c, i) => dio.addGable({ x: p.x - 150 + i * 100, y: p.y - 80, w: 100, d: 160, z: 90, h: 46 + (i % 2) * 18, over: 4, color: c, wallColor: '#e6f4ff', ridge: 'y', tap }));
    dio.addSprite({ x: p.x + 200, y: p.y + 60, w: 110, h: 90, shadow: 0.4, tap, html: SEA.beluga });
    // 沙灘：陽傘、燈塔、椰子樹
    const b = P.beach;
    dio.addSprite({ x: b.x, y: b.y, w: 110, h: 110, shadow: 0.4, tap: 'go:beach', html: PLACE_ICON.beach });
    dio.addSprite({ x: 900, y: 400, w: 80, h: 150, shadow: 0.4, html: lighthouse() });
    for (const [x, y] of [[60, 420], [560, 470], [900, 640]]) dio.addSprite({ x, y, w: 90, h: 120, shadow: 0.5, html: palm() });
    dio.addSprite({ x: 600, y: 180, z: 2, w: 100, h: 80, shadow: 0, html: sailboat() });
    dio.addSprite({ x: 260, y: 120, z: 2, w: 90, h: 70, shadow: 0, html: sailboat() });
  }
  if (zone === 'mountain') {
    // 一層一層的山、動物園大門（上面一隻熊貓）、纜車
    for (const [x, y, w, h, c] of [[800, 160, 420, 330, '#5aa84a'], [640, 80, 320, 240, '#6fb85a'], [170, 120, 380, 280, '#4f9a44'], [940, 420, 300, 220, '#6fb85a']]) dio.addSprite({ x, y, w, h, shadow: 0, html: peak(c) });
    const p = P.zoo, tap = 'go:zoo';
    dio.addBox({ x: p.x - 110, y: p.y - 20, w: 34, d: 40, h: 120, color: '#a9744f', tap });
    dio.addBox({ x: p.x + 76, y: p.y - 20, w: 34, d: 40, h: 120, color: '#a9744f', tap });
    dio.addBox({ x: p.x - 124, y: p.y - 26, z: 120, w: 248, d: 52, h: 34, color: '#7ed36a', tap, faces: { s: `<svg viewBox="0 0 248 34" width="100%" height="100%" preserveAspectRatio="none">${[30, 80, 130, 180, 220].map((x) => `<circle cx="${x}" cy="17" r="9" fill="#fff"/><circle cx="${x - 5}" cy="15" r="2.5" fill="#2a2f3a"/><circle cx="${x + 5}" cy="15" r="2.5" fill="#2a2f3a"/>`).join('')}</svg>` } });
    dio.addSprite({ x: p.x, y: p.y, z: 154, w: 90, h: 90, shadow: 0, tap, html: ZOO.panda });
    for (const [x, y] of [[300, 600], [600, 560]]) dio.addSprite({ x, y, w: 90, h: 90, shadow: 0.4, html: pick([ZOO.giraffe, ZOO.zebra, ZOO.penguin]) });
    dio.addSprite({ x: 760, y: 420, z: 220, w: 120, h: 100, shadow: 0, html: cablecar() });
    dio.addSprite({ x: 860, y: 300, z: 320, w: 120, h: 100, shadow: 0, html: cablecar() });
    for (const [x, y] of [[100, 600], [180, 420], [900, 640], [520, 160]]) dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: tree('#3f9f5a') });
  }
  for (const [id, p] of Object.entries(P)) {
    markers[id] = dio.addSprite({ x: p.x, y: p.y, z: p.h + 60, w: 120, h: 120, html: `<div class="inner">${p.icon}</div>`, cls: 'marker place-mark', shadow: 0, tap: `go:${id}` });
  }
  dio.seal();
  return { dio, markers };
}

export async function mountZone(root, app) {
  const zone = app.trip.zone;
  backdrop(root);
  const T = buildZone(zone);
  const { dio } = T;
  root.appendChild(dio.el);
  root.classList.add(`zone-${zone}`);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  if (isDark()) root.classList.add('night');
  const shan = dio.addSprite({ x: 500, y: 690, z: 1, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  homeBtn(root, () => app.go('opening'));
  jars(root, app.profile.members);
  mountClock(root);
  rotateBtns(root, dio);
  zoomBtns(root, dio);
  turnsScene(root);
  worldBtn(root, app);
  setPlaying(true);
  playMusic(isDark() ? 'lullaby' : ZONES[zone].music);
  const first = Object.keys(ZONE_PLACES[zone])[0];
  setHint(() => T.markers[first].el);
  let going = false;
  placeBar(root, dio, ZONE_PLACES[zone], T.markers, app.trip.location, (id) => onTapZone(`go:${id}`), shan.el);
  const onTapZone = async (name) => {
    if (name.startsWith('go:')) {
      if (going) return;
      going = true;
      const to = name.slice(3);
      sfx('tap');
      T.markers[to].el.classList.add('hop');
      setPlaying(false);
      app.trip.location = to;
      await speak('shan', `zone_go_${to}`, { node: shan.el });
      if (app.alive()) app.go(ZONE_PLACES[zone][to].screen);
    } else if (name === 'shan') {
      sfx('boing'); shan.el.classList.remove('hop'); void shan.el.offsetWidth; shan.el.classList.add('hop');
      speak('shan', `zone_hello_${zone}`, { node: shan.el });
    }
  };
  dio.onTap(onTapZone);
  if (!app.trip.seenZone?.[zone]) {
    app.trip.seenZone = { ...(app.trip.seenZone || {}), [zone]: true };
    await speak('shan', `zone_hello_${zone}`, { node: shan.el });
  }
}

// ======================= 世界地圖 =======================
export async function mountWorld(root, app) {
  backdrop(root);
  const W = 1200, D = 900;
  // 一座自然的島：彎彎曲曲的海岸線，城市在西北、平原（郊區）在東北、沙灘在西南、山在東南；
  // 高速公路和鐵路彎彎地把四區連起來；四周是一直延伸到天邊的海
  const island = 'M130 170 Q250 40 520 78 Q760 26 990 120 Q1150 210 1118 420 Q1170 640 1040 790 Q860 890 600 852 Q330 890 170 770 Q50 610 92 420 Q56 260 130 170Z';
  const map = `<svg viewBox="0 0 ${W} ${D}" width="100%" height="100%">
    <path d="${island}" fill="#f2dca6" stroke="#bfe9ff" stroke-width="26"/>
    <path d="${island}" fill="#9fd87f" transform="translate(600 450) scale(.94) translate(-600 -450)"/>
    <path d="M150 140 Q330 80 520 150 Q560 300 430 380 Q250 420 140 330Z" fill="#cfd6e0"/>
    <path d="M680 110 Q900 70 1060 180 Q1090 330 960 400 Q760 410 660 300Z" fill="#c6e88a"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${700 + i * 55} 150 L${740 + i * 55} 380" stroke="#e8d36a" stroke-width="22" opacity=".8"/>`).join('')}
    <path d="M90 520 Q200 480 330 560 Q420 660 330 800 Q200 820 120 700Z" fill="#f6e3b0"/>
    <path d="M60 640 Q160 640 220 720 Q240 820 140 860 Q60 820 40 720Z" fill="#7fd3ff"/>
    <path d="M660 520 Q880 470 1080 560 Q1100 720 980 800 Q780 840 680 720Z" fill="#6fb85a"/>
    <path d="M330 260 Q640 200 900 250 M330 260 Q300 480 300 700 M900 250 Q960 480 880 700" stroke="#8a8fa0" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M300 700 Q600 640 880 700" stroke="#8a8fa0" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M360 300 Q620 360 860 300 Q980 520 860 690" stroke="#a9744f" stroke-width="10" fill="none" stroke-dasharray="4 10"/>
  </svg>`;
  const dio = createDiorama({ gl: true, w: W, d: D, walls: false, zoom: 0.62, zmin: 0.4, zmax: 1.3, cy: 0.56, skirt: '#3ea8e0', horizon: 'sea', floorCss: 'background:transparent' });
  dio.addDecal({ x: 0, y: 0, w: W, h: D, z: 0.6, html: map, budget: 6e6 });
  root.appendChild(dio.el);
  app.onLeave(() => { setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  // 城市：一堆小樓
  [[120, 120, 60, 140, '#bfd3ef'], [200, 100, 70, 200, '#ffd6a0'], [300, 140, 60, 120, '#d6c8ff'], [400, 110, 80, 170, '#c8f0d6'], [160, 260, 90, 90, '#ffe0a8'], [380, 280, 70, 110, '#ffb8c0']].forEach(([x, y, w, h, c]) => dio.addBox({ x, y, w, d: w, h, color: c, tap: 'zone:city' }));
  // 郊區：穀倉、風車、牛
  dio.addBox({ x: 760, y: 140, w: 110, d: 110, h: 70, color: '#e0503a', tap: 'zone:suburb' });
  dio.addGable({ x: 760, y: 140, w: 110, d: 110, z: 70, h: 54, over: 8, color: '#7a3b30', wallColor: '#e0503a', ridge: 'y', tap: 'zone:suburb' });
  dio.addSprite({ x: 1020, y: 300, w: 90, h: 100, shadow: 0.4, tap: 'zone:suburb', html: windmill() });
  dio.addSprite({ x: 700, y: 340, w: 70, h: 60, shadow: 0.4, tap: 'zone:suburb', html: itemSvg('cow') });
  // 海邊：海生館（藍色波浪屋頂）、燈塔、帆船
  dio.addBox({ x: 120, y: 540, w: 180, d: 110, h: 60, color: '#f4f8ff', tap: 'zone:sea' });
  ['#3ea8e0', '#5ec3ee', '#2f8fd0'].forEach((c, i) => dio.addGable({ x: 120 + i * 60, y: 540, w: 60, d: 110, z: 60, h: 34 + (i % 2) * 14, over: 3, color: c, ridge: 'y', tap: 'zone:sea' }));
  dio.addSprite({ x: 470, y: 560, w: 70, h: 130, shadow: 0.4, tap: 'zone:sea', html: lighthouse() });
  dio.addSprite({ x: 420, y: 790, z: 2, w: 90, h: 70, shadow: 0, tap: 'zone:sea', html: sailboat() });
  // 山上：一層一層的山＋纜車＋熊貓
  [[860, 640, 300, 230, '#5aa84a'], [760, 690, 220, 170, '#6fb85a'], [990, 700, 220, 170, '#4f9a44']].forEach(([x, y, w, h, c]) => dio.addSprite({ x, y, w, h, shadow: 0.2, tap: 'zone:mountain', html: peak(c) }));
  dio.addSprite({ x: 1080, y: 560, z: 180, w: 100, h: 80, shadow: 0, tap: 'zone:mountain', html: cablecar() });
  // 區域標記
  const pos = { city: [300, 230, 250], suburb: [900, 230, 200], sea: [300, 700, 170], mountain: [900, 700, 300] };
  const markers = {};
  for (const [z, [x, y, h]] of Object.entries(pos)) markers[z] = dio.addSprite({ x, y, z: h, w: 140, h: 140, cls: 'marker place-mark', shadow: 0, tap: `zone:${z}`, html: `<div class="inner">${ZONES[z].icon}</div>` });
  dio.seal();
  const here = app.trip.zone || 'city';
  markers[here].el.classList.add('here');
  const shan = dio.addSprite({ x: 600, y: 450, z: 1, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  homeBtn(root, () => app.go('town'));
  jars(root, app.profile.members);
  mountClock(root);
  rotateBtns(root, dio);
  zoomBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  playMusic('world');
  setHint(() => markers[here === 'city' ? 'sea' : 'city'].el);
  let going = false;
  dio.onTap(async (name) => {
    if (!name.startsWith('zone:') || going) {
      if (name === 'shan') { sfx('boing'); speak('shan', 'world_hello', { node: shan.el }); }
      return;
    }
    const to = name.slice(5);
    going = true;
    sfx('tap');
    markers[to].el.classList.add('hop');
    setPlaying(false);
    await speak('shan', `world_go_${to}`, { node: shan.el });
    if (!app.alive()) return;
    if (to === here) { app.go('town'); return; }
    const mode = await pickTravel(root);
    if (!mode) { going = false; setPlaying(true); markers[to].el.classList.remove('hop'); return; }
    if (app.alive()) app.go('trip', { to, mode });
  });
  if (!app.trip.seenWorld) { app.trip.seenWorld = true; await speak('shan', 'world_hello', { node: shan.el }); }
}

// 開車走高速公路，還是坐火車？
function pickTravel(root) {
  return new Promise((resolve) => {
    const scrim = div('scrim');
    const box = div('vpick ui', `<button class="vopt" data-v="car">${babaSvg()}</button><button class="vopt" data-v="train">${PLACE_ICON.train}</button><button class="vback">${ICON2.skip}</button>`);
    root.append(scrim, box);
    speak('shan', 'pick_travel');
    const done = (v) => { scrim.remove(); box.remove(); resolve(v); };
    box.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const b = e.target.closest('.vopt');
      if (b) { sfx('tap'); b.classList.add('hop'); setTimeout(() => done(b.dataset.v), 250); return; }
      if (e.target.closest('.vback')) { sfx('tap'); done(null); }
    });
    scrim.addEventListener('pointerdown', (e) => { e.stopPropagation(); done(null); });
  });
}

// ======================= 坐火車：刷卡進站 → 站在黃線後面 → 先下後上 =======================
// 捷運站的關卡也用這一段（mrt）
export async function boardTrain(root, { say, alive, kind = 'train', glow = false } = {}) {
  const P = div('panel boardpanel');
  const scrim = div('scrim');
  root.append(scrim, P);
  const ok = () => alive();
  const waitTap = (el) => new Promise((resolve) => {
    const h = (e) => { e.stopPropagation(); el.removeEventListener('pointerdown', h); resolve(); };
    el.addEventListener('pointerdown', h);
    const t = setInterval(() => { if (!ok()) { clearInterval(t); resolve(); } }, 400);
  });
  try {
    // 1. 刷卡
    P.innerHTML = `<div class="gate"><div class="reader"></div><div class="gdoor l"></div><div class="gdoor r"></div></div><div class="mycard">${MISC.card}</div>`;
    const card = P.querySelector('.mycard'), reader = P.querySelector('.reader');
    if (glow) reader.classList.add('glowy-2d');
    setHint(() => reader);
    await say('board_card');
    await waitTap(reader);
    if (!ok()) return;
    card.classList.add('tapped');
    sfx('ding');
    await wait(350);
    P.querySelector('.gate').classList.add('open');
    sfx('sparkle');
    await say('board_card_ok');
    // 2. 站在黃線後面
    P.innerHTML = `<div class="platform"><div class="tracks"></div><div class="yline"></div><button class="spot bad" data-s="front"></button><button class="spot good" data-s="back"></button></div>`;
    const good = P.querySelector('.spot.good');
    if (glow) good.classList.add('glowy-2d');
    setHint(() => good);
    await say('board_line');
    await new Promise((resolve) => {
      P.querySelectorAll('.spot').forEach((sp) => sp.addEventListener('pointerdown', async (e) => {
        e.stopPropagation();
        if (sp.dataset.s === 'back') { sp.innerHTML = kidSvg('yy'); sp.classList.remove('glowy-2d'); sp.classList.add('me'); sfx('sparkle'); resolve(); }
        else { sfx('soft'); say('board_line_wrong'); }
      }));
      const t = setInterval(() => { if (!ok()) { clearInterval(t); resolve(); } }, 400);
    });
    if (!ok()) return;
    await say('board_line_ok');
    // 3. 車來了，先下後上
    const train = div('ptrain', `<div class="pdoor"></div>${[0, 1, 2].map((i) => `<div class="pout" style="--i:${i}">${personSvg(['mom', 'uncle', 'grandma'][i])}</div>`).join('')}`);
    P.querySelector('.platform').appendChild(train);
    sfx('whoosh');
    await wait(1300);
    await say('board_off_first');
    train.classList.add('off');
    let early = false;
    const door = train.querySelector('.pdoor');
    const early1 = (e) => { e.stopPropagation(); if (!early) { early = true; sfx('soft'); say('board_wait'); } };
    door.addEventListener('pointerdown', early1);
    await wait(2600);
    door.removeEventListener('pointerdown', early1);
    door.classList.add('glowy-2d');
    setHint(() => door);
    await say('board_now');
    await waitTap(door);
    if (!ok()) return;
    sfx('click'); sfx('sparkle');
    await say(early ? 'board_good_wait' : 'board_good');
  } finally {
    setHint(null);
    P.remove();
    scrim.remove();
  }
}

// ======================= 跨區域的路程：看窗外找東西 =======================
const SCENERY = {
  suburb: { things: { cow: itemSvg('cow'), windmill: windmill(), tree: tree(), field: field() }, targets: ['cow', 'windmill'], sky: '#bfe6ff', ground: '#9fd87f', far: '#8fcf8a' },
  sea: { things: { boat: sailboat(), lighthouse: lighthouse(), palm: palm(), gull: seagull() }, targets: ['boat', 'lighthouse'], sky: '#bfe6ff', ground: '#f2dca6', far: '#3ec7e0' },
  mountain: { things: { monkey: monkey(), cable: cablecar(), tree: tree('#3f9f5a'), tree2: tree() }, targets: ['monkey', 'cable'], sky: '#cfe8ff', ground: '#7fc86a', far: '#5aa84a' },
  city: { things: { mrt: PLACE_ICON.mrt, building: building(), building2: building('#ffd6a0'), tree: tree() }, targets: ['mrt', 'building'], sky: '#d6e8ff', ground: '#c9d3de', far: '#a9b8cc' },
};

export async function mountTrip(root, app) {
  const to = app.params?.to || 'sea';
  const mode = app.params?.mode || 'car';
  let alive = true;
  app.onLeave(() => { alive = false; setHint(null); setPlaying(false); });
  backdrop(root);
  mountClock(root);
  turnsScene(root);
  setPlaying(true);
  homeBtn(root, () => app.go('opening'));
  const host = mode === 'car' ? 'baba' : 'xiuxiu';
  const say = (id) => (alive ? speak(host, id) : Promise.resolve());
  try {
    // 出發前：開車要繫安全帶；坐火車要刷卡、站在黃線後面、先下後上
    playMusic('drive');
    if (mode === 'car') await seatbelt(root, app, true, () => alive);
    else await boardTrain(root, { say, alive: () => alive, glow: levelNow(app.profile) === 'easy' });
    if (!alive) return;
    // 路程：窗外的風景往後跑，看到要找的東西就點
    const sc = SCENERY[to];
    const scene = div('trip-scene', `<div class="tsky" style="background:${isDark() ? '#26305e' : sc.sky}"></div><div class="tfar" style="background:${sc.far}"></div><div class="tground" style="background:${sc.ground}"></div><div class="troad ${mode}"></div><div class="tthings"></div>
      <div class="tvehicle ${mode}">${mode === 'car' ? babaSvg() : PLACE_ICON.train}</div>${mode === 'train' ? '<div class="twindow"></div>' : ''}<div class="tlook"></div>`);
    root.appendChild(scene);
    const things = scene.querySelector('.tthings'), look = scene.querySelector('.tlook');
    playMusic(mode === 'car' ? 'drive' : 'trip');
    await say(`trip_go_${to}`);
    const targets = shuffle(sc.targets.slice());
    const easy = levelNow(app.profile) === 'easy';
    for (const t of targets) {
      if (!alive) return;
      look.innerHTML = `<div class="tl">${sc.things[t]}</div>`;
      look.classList.remove('pop'); void look.offsetWidth; look.classList.add('pop');
      await say(`trip_find_${t}`);
      const found = await new Promise((resolve) => {
        let n = 0, done = false;
        const others = Object.keys(sc.things).filter((k) => k !== t);
        const spawn = () => {
          if (done || !alive) return;
          n++;
          const isT = n % 3 === 0;
          const k = isT ? t : pick(others);
          const el = div(`tthing ${isT ? 'target' : ''}`, sc.things[k]);
          el.style.top = `${330 + Math.random() * 120}px`;
          if (isT && easy) el.classList.add('glowy-2d');
          things.appendChild(el);
          el.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            if (done) return;
            if (k === t) {
              done = true;
              sfx('sparkle');
              const r = stageRect(el);
              burst(r.x, r.y, { n: 16, stars: true });
              el.classList.add('got');
              resolve(true);
            } else { sfx('soft'); el.classList.add('nope'); }
          });
          setTimeout(() => el.remove(), 6200);
          if (n < 12) setTimeout(spawn, 1300 + Math.random() * 500);
          else setTimeout(() => { if (!done) { done = true; resolve(false); } }, 6000);
        };
        spawn();
      });
      if (!alive) return;
      await say(found ? `trip_found_${t}` : 'trip_missed');
      if (turnsOn()) nextTurn({ say: false });
    }
    look.innerHTML = '';
    await wait(800);
    await say(`trip_arrive_${to}`);
    if (!alive) return;
    app.trip.zone = to;
    app.trip.location = to === 'city' ? (mode === 'train' ? 'train' : 'home') : ZONES[to].entry;
    app.go('town');
  } catch (e) {
    if (alive) throw e;
  }
}
