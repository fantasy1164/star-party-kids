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
import { turnsScene, turnsOn, nextTurn, whoseTurn, levelNow, callTurn } from '../core/turns.js';
import { setHint, setPlaying, mountClock, stillNow } from '../core/session.js';
import { shanSvg, kidSvg, starIcon } from '../art/stars.js';
import { personSvg } from '../art/more.js';
import { babaSvg, itemSvg } from '../art/town.js';
import { VEHICLES } from '../art/fun.js';
import { carSvg } from '../art/traffic.js';
import { ANIMALS } from '../art/fun.js';
import { PLACE_ICON, ZOO, SEA, MISC } from '../art/world.js';
import { backdrop, homeBtn, rotateBtns, jars, roundBtn, zoomBtns } from '../ui/hud.js';
import { ICON2 } from '../art/more.js';
import { seatbelt, placeBar } from './town.js';
import { buildCities } from './worldcity.js';
import { LAKE } from '../art/lake.js';

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
  lake: { icon: LAKE.rowboat, music: 'lake', entry: 'pier' },   // 日月潭（11/26）
};
// 各區域的地點（城市的在 town.js）
const ZONE_PLACES = {
  suburb: { farm: { x: 420, y: 330, screen: 'farm', icon: itemSvg('feed'), h: 180 } },
  sea: { aquarium: { x: 300, y: 520, screen: 'aquarium', icon: PLACE_ICON.aquarium, h: 150 }, beach: { x: 720, y: 440, screen: 'beach', icon: PLACE_ICON.beach, h: 120 } },
  mountain: { zoo: { x: 450, y: 420, screen: 'zoo', icon: PLACE_ICON.zoo, h: 170 } },
  lake: { pier: { x: 330, y: 560, screen: 'pier', icon: LAKE.rowboat, h: 110 }, thao: { x: 790, y: 330, screen: 'thao', icon: LAKE.pestle, h: 150 } },
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
    lake: 'background: radial-gradient(circle at 50% 50%, #a6dd86, #7cc46a)',
  };
  const skirt = { suburb: '#a6d987', sea: '#5ec3ee', mountain: '#7fc86a', lake: '#7cc46a' }[zone];
  const horizon = { suburb: 'nature', sea: 'sea', mountain: 'mountain', lake: 'mountain' }[zone];
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
  if (zone === 'lake') {
    // 日月潭：東邊圓圓的像太陽、西邊彎彎的像月亮；中間的拉魯島、山上的慈恩塔、碼頭、伊達邵的茅草屋、遊湖的船
    const lakeSvg = `<svg viewBox="0 0 1000 800" width="100%" height="100%"><path d="M600 130 C800 110 900 260 870 420 C840 580 660 650 520 600 C460 580 420 600 360 640 C250 700 120 640 110 520 C100 400 200 330 300 350 C360 360 380 300 420 240 C470 170 520 140 600 130Z" fill="#bfe9ff"/><path d="M600 150 C780 135 870 270 845 415 C815 560 665 620 530 580 C470 560 420 585 360 615 C260 665 145 615 135 515 C128 410 215 360 305 375 C375 385 400 320 440 255 C485 185 530 160 600 150Z" fill="#3ea8e0"/>${[[300, 470], [620, 300], [700, 470], [480, 420]].map(([x, y]) => `<path d="M${x} ${y} q16 -10 32 0 q16 10 32 0" stroke="#bfe9ff" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>`).join('')}<path d="M330 600 L330 520" stroke="#b8865a" stroke-width="34"/><path d="M790 340 L760 400" stroke="#b8865a" stroke-width="26"/></svg>`;
    dio.addDecal({ x: 0, y: 0, w: W, h: D, z: 0.7, html: lakeSvg, budget: 1.2e6 });
    dio.addSprite({ x: 560, y: 400, z: 1, w: 120, h: 110, shadow: 0, html: LAKE.island });
    for (const [x, y, w, h, c] of [[120, 120, 360, 280, '#5aa84a'], [880, 140, 320, 240, '#4f9a44'], [940, 640, 260, 200, '#6fb85a'], [60, 700, 280, 200, '#6fb85a']]) dio.addSprite({ x, y, w, h, shadow: 0, html: peak(c, false) });
    dio.addSprite({ x: 180, y: 200, z: 150, w: 90, h: 110, shadow: 0, html: LAKE.pagoda });
    // 碼頭：木頭棧橋伸進湖裡，旁邊停著小船
    const p = P.pier, tap = 'go:pier';
    dio.addBox({ x: p.x - 22, y: p.y - 110, w: 44, d: 130, h: 10, color: '#b8865a', tap });
    dio.addSprite({ x: p.x + 70, y: p.y - 60, z: 2, w: 90, h: 70, shadow: 0, tap, html: LAKE.rowboat });
    dio.addSprite({ x: p.x - 80, y: p.y - 80, z: 2, w: 110, h: 80, shadow: 0, tap, html: LAKE.yacht });
    // 伊達邵：茅草屋和石板上的杵
    const q = P.thao, tq = 'go:thao';
    [[q.x - 90, q.y - 30], [q.x + 40, q.y - 60], [q.x + 60, q.y + 50]].forEach(([x, y]) => { dio.addBox({ x: x - 36, y: y - 28, w: 72, d: 56, h: 46, color: '#c99a6a', tap: tq }); dio.addGable({ x: x - 36, y: y - 28, z: 46, w: 72, d: 56, h: 34, over: 8, color: '#8a6a3a', wallColor: '#c99a6a', ridge: 'x', tap: tq }); });
    dio.addSprite({ x: q.x - 20, y: q.y + 40, w: 80, h: 80, shadow: 0.3, tap: tq, html: LAKE.pestle });
    for (const [x, y] of [[60, 420], [470, 700], [930, 420], [250, 720], [640, 60]]) dio.addSprite({ x, y, w: 80, h: 110, shadow: 0.6, html: tree(x % 3 ? '#3f9f5a' : '#4fbf6e') });
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
// ======================= 世界地圖：台灣（11/26） =======================
// 用孩子真的住的地方當世界：明星小鎮在中部（台中）、動物園在北部（木柵，旁邊有貓空纜車）、
// 海生館和沙灘在南部（屏東）、郊區的農場在小鎮南邊的平原（彰化）；中央山脈在中間偏東。
// 灰色加鎖的是「以後會開放」的地方，點了閃閃說還在蓋。海上、天上有會動的東西（火車、車子、船、鯨魚、海鳥、飛機、雲），
// 讓世界有「很大、很遠」的感覺。坐車、坐火車要「往北、往南」。
const TW_W = 1600, TW_D = 2600;
// 台灣海岸線（順時針，從北邊的富貴角開始）
const TW_COAST = [[980, 120], [1080, 180], [1160, 270], [1130, 420], [1110, 620], [1080, 900], [1050, 1200], [1010, 1500], [960, 1800], [900, 2050], [850, 2280], [800, 2470], [740, 2500], [700, 2400], [660, 2300], [590, 2150], [540, 2000], [480, 1800], [440, 1600], [430, 1400], [450, 1200], [500, 1000], [560, 820], [640, 640], [740, 460], [830, 300], [900, 180]];
// 平滑的封閉曲線（Catmull-Rom）：給 SVG 路徑、也給「在不在島上」用
function smoothLoop(P, n = 8) {
  const out = [];
  for (let i = 0; i < P.length; i++) {
    const p0 = P[(i - 1 + P.length) % P.length], p1 = P[i], p2 = P[(i + 1) % P.length], p3 = P[(i + 2) % P.length];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  return out;
}
const COAST = smoothLoop(TW_COAST);
const coastPath = 'M' + COAST.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L') + 'Z';
const inIsland = (x, y) => { let c = false; for (let i = 0, j = COAST.length - 1; i < COAST.length; j = i++) { const [xi, yi] = COAST[i], [xj, yj] = COAST[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
const segDist = (x, y, P) => { let d = 1e9; for (let i = 0; i < P.length - 1; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1; const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)); d = Math.min(d, Math.hypot(x - ax - dx * u, y - ay - dy * u)); } return d; };
const coastDist = (x, y) => segDist(x, y, [...COAST, COAST[0]]);
// 中央山脈的稜線（北邊從台北盆地東南開始，一路往南到恆春半島）
const RIDGE = [[1000, 400], [985, 700], [935, 1000], [905, 1300], [880, 1600], [840, 1900], [800, 2200], [765, 2380]];
const ss01 = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function twGround(x, y) {
  if (!inIsland(x, y)) return 0;
  const d = segDist(x, y, RIDGE);
  const taper = ss01(330, 520, y) * (1 - 0.45 * ss01(2050, 2420, y));   // 北邊台北盆地、南邊恆春比較低
  return 250 * Math.exp(-((d / 175) ** 2)) * taper * ss01(0, 70, coastDist(x, y));
}
// 路線：國道（西部，台北 → 屏東）、鐵路（在國道旁邊）
const HIGHWAY = [[950, 330], [790, 430], [660, 620], [610, 840], [600, 1000], [540, 1230], [480, 1500], [490, 1800], [570, 2060], [690, 2300]];
const RAILWAY = HIGHWAY.map(([x, y], i) => [x - 34 + (i === 0 ? 20 : 0), y + 10]);
const linePath = (P) => 'M' + P.map(([x, y]) => `${x} ${y}`).join(' L');
// 沿著折線走：t（0~1）→ 位置和方向
function polyAt(P, t) {
  const L = []; let tot = 0;
  for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); L.push(l); tot += l; }
  let d = Math.max(0, Math.min(1, t)) * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const u = Math.min(1, d / L[i]); const [ax, ay] = P[i], [bx, by] = P[i + 1]; return { x: ax + (bx - ax) * u, y: ay + (by - ay) * u, dx: bx - ax, dy: by - ay }; } d -= L[i]; }
  return { x: P[0][0], y: P[0][1], dx: 1, dy: 0 };
}
// 四個可以去的地方（真實的相對位置）
const TW_ZONES = { city: [620, 1000], suburb: [520, 1450], sea: [720, 2310], mountain: [1065, 455], lake: [820, 1210] };   // 動物園在木柵（台北盆地東南邊的山上），101 在盆地裡
// 以後會開放的地方
const SOON = [
  { id: 'hehuan', x: 930, y: 960, icon: '🏔️' },
  { id: 'huadong', x: 1040, y: 1650, icon: '🌊' }, { id: 'penghu', x: 230, y: 1520, icon: '⛴️' }, { id: 'airport', x: 800, y: 400, icon: '✈️' },
];
const cloudSvg = () => S(`<ellipse cx="60" cy="44" rx="42" ry="22" fill="#fff"/><ellipse cx="38" cy="38" rx="24" ry="20" fill="#fff"/><ellipse cx="80" cy="34" rx="22" ry="18" fill="#fff"/>`, '0 0 120 70');
const whaleSvg = () => S(`<path d="M10 58 Q20 34 56 34 Q86 36 94 52 L108 40 L106 70 L94 62 Q80 76 50 74 Q20 74 10 58Z" fill="#4f6f9a"/><path d="M18 62 Q50 72 84 64" stroke="#c9d8ef" stroke-width="6" fill="none"/><circle cx="24" cy="52" r="3" fill="#1d2433"/><g class="spout"><path d="M44 30 Q40 12 30 8 M46 30 Q48 10 56 4 M48 30 Q56 16 66 14" stroke="#bfe9ff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`, '0 0 120 80');
const ferrySvg = () => S(`<path d="M8 50 H112 L100 72 H20Z" fill="#fff"/><rect x="28" y="30" width="62" height="20" rx="4" fill="#e9f3ff"/><rect x="34" y="34" width="50" height="8" fill="#3ea8e0"/><rect x="66" y="16" width="10" height="16" fill="#ff5d5d"/><path d="M8 50 H112" stroke="#3ea8e0" stroke-width="4"/>`, '0 0 120 80');
const boatSvg = () => S(`<path d="M10 50 H90 L80 66 H20Z" fill="#ff8a3d"/><rect x="36" y="32" width="26" height="18" fill="#fff"/><path d="M62 12 V50" stroke="#8a6a4a" stroke-width="3"/>`, '0 0 100 80');
const planeSvg = () => S(`<path d="M10 44 L96 40 Q112 40 112 48 Q112 54 96 54 L10 52Z" fill="#fff"/><path d="M50 46 L30 16 H42 L70 46Z M50 50 L30 80 H42 L70 50Z" fill="#dfe8f5"/><path d="M14 44 L6 28 H16 L26 44Z" fill="#3ea8e0"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${60 + i * 8}" cy="46" r="2.2" fill="#3ea8e0"/>`).join('')}`, '0 0 120 96');
const birdSvg = () => S(`<path d="M10 50 Q30 30 50 50 Q70 30 90 50" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`);
const trainTW = () => S(`<rect x="4" y="18" width="70" height="30" rx="10" fill="#ff8a3d"/><rect x="78" y="18" width="70" height="30" rx="8" fill="#ff8a3d"/>${[12, 30, 48, 86, 104, 122].map((x) => `<rect x="${x}" y="24" width="14" height="10" rx="2" fill="#e9f6ff"/>`).join('')}<rect x="4" y="38" width="144" height="4" fill="#fff"/>`, '0 0 152 60');

// 城市的地面：灰色的市區、白色的街道格子、幾個綠色的小公園
const cityGround = (cx, cy, rx, ry, id) => {
  let g = '';
  for (let x = cx - rx; x <= cx + rx; x += 30) g += `<path d="M${x} ${cy - ry} V${cy + ry}" stroke="#fff" stroke-width="3.5" opacity=".75"/>`;
  for (let y = cy - ry; y <= cy + ry; y += 30) g += `<path d="M${cx - rx} ${y} H${cx + rx}" stroke="#fff" stroke-width="3.5" opacity=".75"/>`;
  g += [[-0.55, 0.45], [0.5, -0.6], [0.1, 0.7]].map(([u, v]) => `<rect x="${cx + u * rx - 13}" y="${cy + v * ry - 13}" width="26" height="26" rx="6" fill="#8fd07a"/>`).join('');
  return `<clipPath id="cg${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath><ellipse cx="${cx}" cy="${cy}" rx="${rx + 8}" ry="${ry + 8}" fill="#a4d97f"/><g clip-path="url(#cg${id})"><rect x="${cx - rx}" y="${cy - ry}" width="${rx * 2}" height="${ry * 2}" fill="#cfd5de"/>${g}</g>`;
};

export async function mountWorld(root, app) {
  backdrop(root);
  const W = TW_W, D = TW_D;
  // 地面大圖：海、台灣、海岸沙灘、平原的田、城市、國道、鐵路、澎湖、綠島、蘭嶼、指北針
  const map = `<svg viewBox="0 0 ${W} ${D}" width="100%" height="100%">
    <defs><linearGradient id="mt" x1="0" x2="1"><stop offset="0" stop-color="#7cc46a"/><stop offset=".5" stop-color="#4f9a44"/><stop offset="1" stop-color="#6fb85a"/></linearGradient></defs>
    <rect width="${W}" height="${D}" fill="#3ea8e0"/>
    ${[...Array(70)].map((_, i) => { const x = 40 + ((i * 0.6180339) % 1) * (W - 140), y = 60 + ((i * 0.7548776) % 1) * (D - 120); return inIsland(x + 30, y) ? '' : `<path d="M${x} ${y} q16 -10 32 0 q16 10 32 0" stroke="#bfe9ff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>`; }).join('')}
    <path d="${coastPath}" fill="#f2dca6" stroke="#9fdcff" stroke-width="40"/>
    <path d="${coastPath}" fill="#a4d97f" transform="translate(800 1300) scale(.975) translate(-800 -1300)"/>
    <path d="M${RIDGE.map(([x, y]) => `${x} ${y}`).join(' L')}" stroke="url(#mt)" stroke-width="300" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
    ${[...Array(9)].map((_, i) => `<path d="M${450 + (i % 3) * 40} ${1380 + Math.floor(i / 3) * 50} l60 20" stroke="#e3d36a" stroke-width="20" opacity=".7" stroke-linecap="round"/>`).join('')}
    ${cityGround(610, 985, 175, 140, 1)}${cityGround(955, 275, 130, 95, 2)}<ellipse cx="560" cy="2070" rx="80" ry="60" fill="#d3d9e2" opacity=".7"/><ellipse cx="490" cy="1740" rx="60" ry="45" fill="#d3d9e2" opacity=".6"/>
    <circle cx="836" cy="1206" r="26" fill="#7fd3ff"/><path d="M812 1186 Q786 1206 810 1232 Q796 1208 812 1186Z" fill="#7fd3ff" stroke="#7fd3ff" stroke-width="8" stroke-linejoin="round"/>
    <path d="${linePath(HIGHWAY)}" stroke="#8a8fa0" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${linePath(HIGHWAY)}" stroke="#fff" stroke-width="2.5" stroke-dasharray="14 14" fill="none"/>
    <path d="${linePath(RAILWAY)}" stroke="#a9744f" stroke-width="10" fill="none" stroke-dasharray="4 8" stroke-linecap="round"/>
    ${[[200, 1500, 50, 34], [260, 1560, 30, 22], [180, 1580, 24, 18], [1290, 1930, 34, 26], [1330, 2260, 46, 32]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx + 10}" ry="${ry + 10}" fill="#f2dca6"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#a4d97f"/>`).join('')}
    <path d="M450 1560 Q330 1500 230 1520" stroke="#fff" stroke-width="4" stroke-dasharray="10 12" fill="none" opacity=".7"/>
    <g transform="translate(1400 300)"><circle r="90" fill="#fff" opacity=".9"/><path d="M0 -70 L26 10 H-26Z" fill="#ff5d5d"/><path d="M0 70 L26 -10 H-26Z" fill="#c9ced8"/><text y="-90" text-anchor="middle" font-size="64" font-weight="800" fill="#fff" stroke="#3a3550" stroke-width="6" paint-order="stroke">北</text></g>
  </svg>`;
  const dio = createDiorama({ gl: true, w: W, d: D, walls: false, zoom: 0.55, zmin: 0.2, zmax: 1.2, cy: 0.56, skirt: '#3ea8e0', horizon: 'sea', floorCss: 'background:transparent', groundZ: twGround });
  if (dio.gl) dio.addTerrain({ html: map, ground: twGround, cell: 50, margin: 0 });
  else dio.addDecal({ x: 0, y: 0, w: W, h: D, z: 0.6, html: map, budget: 6e6 });
  root.appendChild(dio.el);
  let alive = true;
  app.onLeave(() => { alive = false; setHint(null); setPlaying(false); dio.destroy(); });
  dio.setTint(roomTint());
  const gz = (x, y) => twGround(x, y);
  // 城市：台中（明星小鎮，有台中火車站）和台北盆地（有 101），每棟樓有窗、陽台、水塔（worldcity.js）
  buildCities(dio, { gz, tree, night: isDark(), avoid: (x, y, r) => segDist(x, y, HIGHWAY) < r + 12 || segDist(x, y, RAILWAY) < r + 6 });
  dio.addSprite({ x: 1010, y: 490, z: gz(1010, 490) + 60, w: 100, h: 80, shadow: 0, tap: 'zone:mountain', html: cablecar() });
  // 郊區：穀倉、風車、牛
  dio.addBox({ x: 540, y: 1470, w: 80, d: 80, h: 54, color: '#e0503a', tap: 'zone:suburb' });
  dio.addGable({ x: 540, y: 1470, w: 80, d: 80, z: 54, h: 40, over: 6, color: '#7a3b30', wallColor: '#e0503a', ridge: 'y', tap: 'zone:suburb' });
  dio.addSprite({ x: 470, y: 1520, w: 80, h: 90, shadow: 0.4, tap: 'zone:suburb', html: windmill() });
  dio.addSprite({ x: 640, y: 1540, w: 60, h: 50, shadow: 0.4, tap: 'zone:suburb', html: itemSvg('cow') });
  // 南部：海生館（藍色波浪屋頂）、鵝鑾鼻燈塔、沙灘的椰子樹
  dio.addBox({ x: 620, y: 2330, w: 140, d: 80, h: 46, color: '#f4f8ff', tap: 'zone:sea' });
  ['#3ea8e0', '#5ec3ee', '#2f8fd0'].forEach((c, i) => dio.addGable({ x: 620 + i * 46.6, y: 2330, w: 46.6, d: 80, z: 46, h: 28 + (i % 2) * 12, over: 3, color: c, ridge: 'y', tap: 'zone:sea' }));
  dio.addSprite({ x: 790, y: 2470, z: gz(790, 2470), w: 60, h: 120, shadow: 0.4, tap: 'zone:sea', html: lighthouse() });
  [[700, 2440], [740, 2420], [820, 2380]].forEach(([x, y]) => dio.addSprite({ x, y, z: gz(x, y), w: 60, h: 80, shadow: 0.3, tap: 'zone:sea', html: palm() }));
  // 山上的樹
  for (let i = 0; i < 70; i++) {
    const t = (i * 0.618) % 1, side = ((i * 7) % 5) - 2;
    const p = polyAt(RIDGE, t), l = Math.hypot(p.dx, p.dy) || 1;
    const x = p.x + (-p.dy / l) * side * 70, y = p.y + (p.dx / l) * side * 70;
    if (!inIsland(x, y) || SOON.some((s) => Math.hypot(s.x - x, s.y - y) < 80)) continue;
    dio.addSprite({ x, y, z: gz(x, y) - 2, w: 50, h: 70, shadow: 0, html: tree(i % 3 ? '#3f9f5a' : '#4fb36a') });
  }
  // 區域標記（踩在地形上）
  const markers = {};
  for (const [z, [x, y]] of Object.entries(TW_ZONES)) markers[z] = dio.addSprite({ x, y, z: gz(x, y) + (z === 'mountain' ? 130 : 110), w: 140, h: 140, cls: 'marker place-mark', shadow: 0, tap: `zone:${z}`, html: `<div class="inner">${ZONES[z].icon}</div>` });
  // 以後會開放：灰色加鎖
  for (const s of SOON) dio.addSprite({ x: s.x, y: s.y, z: gz(s.x, s.y) + 90, w: 110, h: 110, cls: 'marker place-mark locked', shadow: 0, tap: `soon:${s.id}`, html: `<div class="inner"><span class="emo">${s.icon}</span></div><i class="lock">🔒</i>` });
  dio.seal();
  const here = app.trip.zone || 'city';
  markers[here].el.classList.add('here');
  const [hx, hy] = TW_ZONES[here];
  const shan = dio.addSprite({ x: hx + 110, y: hy + 60, z: gz(hx + 110, hy + 60) + 1, w: 120, h: 136, html: shanSvg(), shadow: 0.7, tap: 'shan' });
  dio.view.px = hx; dio.view.py = hy + 120; dio.view.a = 0;   // 北邊朝上，「往北、往南」才對得起來
  dio.apply(true);

  // ---- 會動的東西 ----
  const live = (o) => dio.addSprite({ ...o, live: true, abs: true });
  const face = (sp, dx) => { const f = dx < 0; if (sp.flip !== f) { sp.flip = f; sp.el.firstElementChild.style.transform = f ? 'scaleX(-1)' : ''; } };
  const movers = [];
  // 火車（往北、往南各一列）、國道上的車
  [[0.1, 1, 'train'], [0.6, -1, 'train'], [0.3, 1, 'car', '#ffb627'], [0.75, -1, 'car', '#2f7fe0'], [0.5, 1, 'bus']].forEach(([t, dir, k, c]) => {
    const P = k === 'train' ? RAILWAY : HIGHWAY;
    const art = k === 'train' ? trainTW() : k === 'bus' ? VEHICLES.bus : carSvg(c);
    const sp = live({ x: 0, y: 0, z: 0, w: k === 'train' ? 150 : k === 'bus' ? 70 : 56, h: k === 'train' ? 60 : k === 'bus' ? 56 : 36, shadow: 0.3, html: `<div class="veh">${art}</div>` });
    movers.push({ step: (s) => { t += dir * s * (k === 'train' ? 0.035 : 0.025); if (t > 1) t -= 1; if (t < 0) t += 1; const p = polyAt(P, t); sp.move(p.x, p.y, gz(p.x, p.y) + 6); face(sp, p.dx * dir); } });
  });
  // 澎湖的渡輪（來回）、漁船、鯨魚（東邊外海，偶爾噴水）、海鳥
  { const sp = live({ x: 450, y: 1560, z: 2, w: 90, h: 60, shadow: 0, html: `<div class="veh">${ferrySvg()}</div>` }); let t = 0;
    movers.push({ step: (s) => { t += s * 0.05; const u = (Math.sin(t) + 1) / 2; const x = 450 - 220 * u, y = 1560 - 40 * Math.sin(u * Math.PI); sp.move(x, y, 2); face(sp, -Math.cos(t)); } }); }
  [[300, 900, 140], [260, 2200, 110], [1300, 1100, 160]].forEach(([cx, cy, r], i) => { const sp = live({ x: cx, y: cy, z: 2, w: 60, h: 48, shadow: 0, html: `<div class="veh">${boatSvg()}</div>` }); let a = i * 2; movers.push({ step: (s) => { a += s * 0.12; sp.move(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6, 2); face(sp, -Math.sin(a)); } }); });
  { const sp = live({ x: 1350, y: 1500, z: 1, w: 140, h: 94, shadow: 0, cls: 'whale', html: `<div class="veh">${whaleSvg()}</div>` }); let t = 0;
    movers.push({ step: (s) => { t += s * 0.04; sp.move(1350 + Math.sin(t) * 90, 1500 + t * 0 + Math.cos(t * 0.7) * 160, 1); face(sp, Math.cos(t)); } }); }
  [[1250, 800], [350, 1900], [380, 600]].forEach(([cx, cy], i) => { const sp = live({ x: cx, y: cy, z: 140, w: 46, h: 46, shadow: 0, html: birdSvg() }); let a = i; movers.push({ step: (s) => { a += s * 0.5; sp.move(cx + Math.cos(a) * 80, cy + Math.sin(a) * 50, 140 + Math.sin(a * 3) * 10); } }); });
  // 飛機：從西南邊的海飛過整個台灣到東北（很高，看得到影子）
  { const sp = live({ x: 0, y: 0, z: 620, w: 150, h: 120, shadow: 0.25, html: `<div class="veh">${planeSvg()}</div>` }); let t = 0.2;
    movers.push({ step: (s) => { t += s * 0.018; if (t > 1.15) t = -0.15; const x = 100 + 1400 * t, y = 2300 - 2100 * t; sp.move(x, y, 620); face(sp, 1); } }); }
  // 雲：很高、慢慢飄，影子掃過大地
  [[300, 500], [1100, 900], [500, 1500], [1200, 2000], [800, 2300], [900, 150]].forEach(([x0, y]) => { const sp = live({ x: x0, y, z: 720, w: 260, h: 150, shadow: 0.18, cls: 'cloud', html: cloudSvg() }); let x = x0; movers.push({ step: (s) => { x += s * 14; if (x > W + 300) x = -300; sp.move(x, y, 720); } }); });
  let last = performance.now(), acc = 0;
  const tick = (now) => {
    if (!alive) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now; acc += dt;
    if (acc >= 0.033) { if (!stillNow()) for (const m of movers) m.step(acc); acc = 0; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  homeBtn(root, () => app.go('town'));
  jars(root, app.profile.members);
  mountClock(root);
  rotateBtns(root, dio);
  zoomBtns(root, dio);
  turnsScene(root);
  setPlaying(true);
  playMusic('world');
  setHint(() => markers[here === 'city' ? 'sea' : 'city'].el);
  let going = false, lastSoon = 0;
  dio.onTap(async (name) => {
    if (name.startsWith('soon:')) {
      if (Date.now() - lastSoon < 1500) return;
      lastSoon = Date.now();
      sfx('soft');
      speak('shan', `world_soon_${name.slice(5)}`, { node: shan.el });
      return;
    }
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
    const mode = to === 'lake' || here === 'lake' ? 'car' : await pickTravel(root);   // 日月潭沒有火車，開山路去
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

// ======================= 開山路去日月潭：暈車怎麼辦（11/26） =======================
// 三個選擇：看遠方的山、開窗吹風（對）；低頭看平板（不對）。兩個對的都點到就好了。一起玩時輪流點。
async function carSick(root, say, alive) {
  const P = div('panel sickpanel');
  const scrim = div('scrim');
  root.append(scrim, P);
  try {
    P.innerHTML = `<div class="sick-face">${LAKE.sick}</div><div class="sick-opts">${shuffle(['far', 'window', 'tablet']).map((k) => `<button class="sick-opt" data-k="${k}">${{ far: LAKE.lookFar, window: LAKE.window, tablet: LAKE.tablet }[k]}<i></i></button>`).join('')}</div>`;
    await say('sick_intro');
    if (!alive()) return;
    if (turnsOn()) await callTurn();
    const got = new Set();
    let busy = false;
    await new Promise((resolve) => {
      P.querySelectorAll('.sick-opt').forEach((b) => b.addEventListener('pointerdown', async (e) => {
        e.stopPropagation();
        const k = b.dataset.k;
        if (busy || got.has(k) || b.classList.contains('no')) return;
        busy = true;
        if (k === 'tablet') { sfx('soft'); b.classList.add('no'); await say('sick_tablet'); }
        else {
          got.add(k); sfx('sparkle'); b.classList.add('yes');
          const r = stageRect(b); burst(r.x, r.y, { n: 12, stars: true });
          await say(k === 'far' ? 'sick_far' : 'sick_window');
          if (got.size === 2) { resolve(); return; }
          if (turnsOn()) nextTurn({ say: false });
        }
        busy = false;
        const left = [...P.querySelectorAll('.sick-opt')].find((x) => x.dataset.k !== 'tablet' && !got.has(x.dataset.k));
        setHint(() => left);
      }));
      setHint(() => [...P.querySelectorAll('.sick-opt')].find((x) => x.dataset.k !== 'tablet'));
      const t = setInterval(() => { if (!alive()) { clearInterval(t); resolve(); } }, 400);
    });
    if (!alive()) return;
    P.querySelector('.sick-face').classList.add('better');
    sfx('fanfare');
    await say('sick_done');
  } finally { setHint(null); P.remove(); scrim.remove(); }
}

// ======================= 跨區域的路程：看窗外找東西 =======================
const SCENERY = {
  suburb: { things: { cow: itemSvg('cow'), windmill: windmill(), tree: tree(), field: field() }, targets: ['cow', 'windmill'], sky: '#bfe6ff', ground: '#9fd87f', far: '#8fcf8a' },
  sea: { things: { boat: sailboat(), lighthouse: lighthouse(), palm: palm(), gull: seagull() }, targets: ['boat', 'lighthouse'], sky: '#bfe6ff', ground: '#f2dca6', far: '#3ec7e0' },
  mountain: { things: { monkey: monkey(), cable: cablecar(), tree: tree('#3f9f5a'), tree2: tree() }, targets: ['monkey', 'cable'], sky: '#cfe8ff', ground: '#7fc86a', far: '#5aa84a' },
  lake: { things: { tea: LAKE.tea, deer: LAKE.deer, tree: tree('#3f9f5a'), mountain: LAKE.mountain }, targets: ['tea', 'deer'], sky: '#cfe8ff', ground: '#7fc86a', far: '#4f9a44' },
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
    if (to === 'lake' && mode === 'car') { scene.classList.add('curvy'); await carSick(root, say, () => alive); if (!alive) return; }
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
