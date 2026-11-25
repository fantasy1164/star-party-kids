// 進入點：舞台、聲音解鎖、畫面切換。
import { setupStage, stage, div, stageW } from './core/dom.js';
import { state, meet } from './core/store.js';
import { CAST_OF_SCREEN } from './data/cast.js';
import { mountFame } from './scenes/fame.js';
import { mountFest } from './scenes/festival.js';
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
import { mountWorld, mountTrip } from './scenes/world.js';
import { mountFire, mountMrt, mountLibrary, mountPost, mountGarbage } from './scenes/city.js';
import { mountAquarium, mountBeach, mountZoo } from './scenes/nature.js';
import { mountPier, mountThao } from './scenes/lake.js';
import { mountRest, mountSleep } from './ui/rest.js';
import { openParent } from './ui/parent.js';
import { moodCheck } from './ui/mood.js';
import { pruneLogs, snapMult } from './core/stats.js';
import { needInstallGuide, showInstallGuide } from './ui/install.js';
import { syncNow, setupSync } from './core/sync.js';

const SCREENS = { opening, town: mountTown, ride: mountRide, house, bedroom, bath, kitchen, living, school, market: mountMarket, park: mountPark, clinic: mountClinic, farm: mountFarm, police: mountPolice, draw, world: mountWorld, trip: mountTrip, fire: mountFire, mrt: mountMrt, library: mountLibrary, post: mountPost, garbage: mountGarbage, aquarium: mountAquarium, beach: mountBeach, zoo: mountZoo, pier: mountPier, thao: mountThao, fame: mountFame, fest: mountFest, rest: mountRest, sleep: mountSleep };
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
  trip: { zone: 'city', location: 'home', rides: 0, seenTown: false },
  stageCenter() { return { x: stageW() / 2, y: 450 }; },
  nameInfo() { const id = app.profile?.id || 'yy'; return { name: NAMES[id], who: id }; },
  async choose(id, first, node) {
    await bootSync;   // 開機時去抓的雲端進度（通常早就好了；最多等 6 秒）
    app.profile = PROFILES[id];
    app.trip.location = 'home';   // 每次選完人都從家出發（在城市）
    app.trip.zone = 'city';
    app.trip.rides = 0;           // 這次遊玩的第一趟車走完整版
    setupTurns(app.profile, first);
    await speak('shan', 'welcome', { name: NAMES[id], who: id, node });
    // 心情打卡（玩之前）：要去小鎮玩的時候才問（睡覺、休息中不問）
    if (route() === 'town') { const me = current; await moodCheck(stage(), app.profile.members, 's', () => current === me); if (current !== me) return; }
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
    if (app.profile && CAST_OF_SCREEN[name]) meet(CAST_OF_SCREEN[name]);   // 到了這裡就認識這裡的明星（名人堂會亮）
    Promise.resolve(SCREENS[name](root, ctx)).catch((e) => console.error(e));
  },
};
window.__app = app;   // 測試用

pruneLogs();
snapMult();
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

// 雲端進度：開機就去抓（沒網路就先用這台的，之後再合併）；離開很久回來，別台玩過的話重新載入
const bootSync = syncNow({ timeout: 6000 });
setupSync({ onReplaced: () => location.reload() });
// 一般瀏覽器打開時，先給爸媽看「加到主畫面」的步驟（已是 App 就直接開始）
if (needInstallGuide()) await showInstallGuide();
app.go('opening');

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
