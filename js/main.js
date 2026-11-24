// 進入點：舞台、聲音解鎖、畫面切換。
import { setupStage, stage, div, stageW } from './core/dom.js';
import { state } from './core/store.js';
import { unlock, setMusicVolume, setQuietMode, think } from './core/audio.js';
import { loadVoiceManifest, primeTts, speak, hush } from './core/voice.js';
import { setupTurns, turnsScene } from './core/turns.js';
import { setupHints, resting, setHint, setPlaying } from './core/session.js';
import { phase } from './core/clock.js';
import { PROFILES, NAMES } from './config.js';
import { mount as opening } from './ui/opening.js';
import { mount as house } from './ui/house.js';
import { mount as bedroom } from './scenes/bedroom.js';
import { mount as bath } from './scenes/bathroom.js';
import { mount as kitchen } from './scenes/kitchen.js';
import { mount as living } from './scenes/living.js';
import { mount as school } from './scenes/school.js';
import { mountTown, mountRide } from './scenes/town.js';
import { mountMarket, mountPark, mountClinic, mountFarm, mountPolice } from './scenes/places.js';
import { mount as draw } from './scenes/fun.js';
import { mountRest, mountSleep } from './ui/rest.js';
import { openParent } from './ui/parent.js';

const SCREENS = { opening, town: mountTown, ride: mountRide, house, bedroom, bath, kitchen, living, school, market: mountMarket, park: mountPark, clinic: mountClinic, farm: mountFarm, police: mountPolice, draw, rest: mountRest, sleep: mountSleep };
const ROOMS = ['town', 'ride', 'house', 'bedroom', 'bath', 'kitchen', 'living', 'school', 'market', 'park', 'clinic', 'farm'];
let current = null;

// 現在應該去哪：睡覺時間 → 睡覺；發條休息中 → 休息；不然到小鎮地圖
function route() {
  if (phase(state.settings) === 'night') return 'sleep';
  if (resting()) return 'rest';
  return 'town';
}

const app = {
  profile: null,
  // 跨畫面共用的狀態（每個畫面拿到的 ctx 是 app 的分身，直接設 ctx.x 不會留到下一個畫面）
  trip: { location: 'home', rides: 0, seenTown: false },
  stageCenter() { return { x: stageW() / 2, y: 450 }; },
  nameInfo() { const id = app.profile?.id || 'yy'; return { name: NAMES[id], who: id }; },
  async choose(id, first, node) {
    app.profile = PROFILES[id];
    app.trip.location = 'home';   // 每次選完人都從家出發
    app.trip.rides = 0;           // 這次遊玩的第一趟車走完整版
    setupTurns(app.profile, first);
    await speak('shan', 'welcome', { name: NAMES[id], who: id, node });
    app.go(route());
  },
  parent() { openParent(stage()); },
  go(name, params = null) {
    think(false);   // 換畫面時一定結束思考時間（音樂回來）
    hush();
    setHint(null);
    setPlaying(false);
    if (current) {
      current.dead = true;
      current.leave.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
    }
    turnsScene(null);
    if (!app.profile && name !== 'opening') name = 'opening';
    if (ROOMS.includes(name) && route() !== 'town') name = route();
    const root = div(`screen fade-in scr-${name}`);
    stage().innerHTML = '';
    stage().appendChild(root);
    const ctx = Object.create(app);
    ctx.leave = [];
    ctx.dead = false;
    ctx.params = params;
    ctx.onLeave = (f) => ctx.leave.push(f);
    ctx.alive = () => !ctx.dead;
    current = ctx;
    Promise.resolve(SCREENS[name](root, ctx)).catch((e) => console.error(e));
  },
};
window.__app = app;   // 測試用

setupStage(document.getElementById('stage'));
setupHints(stage());
setMusicVolume(state.settings.musicVol);
setQuietMode(state.settings.quiet);
loadVoiceManifest();
// iOS：聲音與語音合成都要在觸碰的當下啟動
document.addEventListener('pointerdown', () => unlock(), { capture: true });
document.addEventListener('pointerup', () => { unlock(); primeTts(); }, { capture: true });
// 不要讓 iPad 把畫面捲動、縮放
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

app.go('opening');

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
