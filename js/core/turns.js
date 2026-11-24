// 兩兄弟一起玩的輪流。
// iPad 分不出是誰點的，所以靠：閃閃唱名、左下（岳岳）右下（愷愷）頭像——輪到的放大發亮、
// 一支「明星麥克風」飛到輪到的人那邊（拿麥克風的人才點）、可以點的東西發輪到的人的顏色。
// 等待的人頭上有「拍手」鈕當啦啦隊：等待也有事做，比較不會去搶（岳岳最需要）。
import { KIDS } from '../config.js';
import { speak } from './voice.js';
import { sfx, isThinking, onThinkEnd } from './audio.js';
import { div, burst, stageRect } from './dom.js';
import { kidHead } from '../art/stars.js';

let ids = [];
let cur = null;
let bar = null;
let mic = null;
let announced = false;
let lastCheerThanks = 0;

const MIC = `<svg viewBox="0 0 100 100"><rect x="42" y="44" width="16" height="48" rx="8" fill="#4a3b6b"/>
  <circle cx="50" cy="32" r="24" fill="#ff5fae"/><path d="M32 24 h36 M30 34 h40 M34 44 h32" stroke="#fff" stroke-width="3" opacity=".5"/>
  <circle cx="42" cy="22" r="6" fill="#fff" opacity=".6"/></svg>`;

export function setupTurns(profile, first = null) {
  ids = profile && profile.members.length > 1 ? [...profile.members] : [];
  cur = first && ids.includes(first) ? first : ids[0] || null;
  paint();
}
export function turnsOn() { return ids.length > 1; }
export function whoseTurn() { return turnsOn() ? cur : null; }
export function members() { return ids; }

function paint() {
  document.body.classList.remove('turn-yy', 'turn-kk');
  if (!turnsOn()) return;
  document.body.classList.add(`turn-${cur}`);
  if (!bar) return;
  bar.querySelectorAll('.tkid').forEach((n) => {
    n.classList.toggle('on', n.dataset.id === cur);
    n.classList.toggle('wait', n.dataset.id !== cur);
  });
  placeMic();
}
function placeMic() {
  if (!mic || !bar) return;
  const side = KIDS[cur].side;
  mic.style.top = '640px';
  mic.style.left = side === 'left' ? '150px' : `calc(${'var(--sw)'} - 224px)`;
}

// 每個畫面呼叫：在畫面上放兩個頭像和麥克風
export function turnsScene(root, { first = null } = {}) {
  bar?.remove();
  bar = null; mic = null;
  announced = false;
  if (!turnsOn() || !root) { paint(); return; }
  if (first && ids.includes(first)) cur = first;
  bar = div('turnbar');
  for (const id of ids) {
    const k = KIDS[id];
    const t = div(`tkid ${k.side}`);
    t.dataset.id = id;
    t.style.setProperty('--c', k.color);
    t.innerHTML = `<div class="ring"></div>${kidHead(id, 120)}<button class="cheer ui" aria-label="cheer"><svg viewBox="0 0 100 100"><g fill="#ffd9b8" stroke="#c98b5e" stroke-width="3"><rect x="22" y="30" width="24" height="50" rx="12" transform="rotate(-18 34 55)"/><rect x="54" y="30" width="24" height="50" rx="12" transform="rotate(18 66 55)"/></g><path d="M50 8 V20 M30 14 L36 24 M70 14 L64 24" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/></svg></button>`;
    t.querySelector('.cheer').addEventListener('pointerdown', (e) => { e.stopPropagation(); cheer(t); });
    bar.appendChild(t);
  }
  mic = div('mictoken', MIC);
  bar.appendChild(mic);
  root.appendChild(bar);
  paint();
}

function cheer(t) {
  // 另一個人正在想答案：先只亮光不出聲，答完才拍手（岳岳對聲音很敏感）
  if (isThinking()) {
    t.classList.add('cheer-wait');
    if (!t.dataset.pending) { t.dataset.pending = '1'; onThinkEnd(() => { delete t.dataset.pending; t.classList.remove('cheer-wait'); sfx('applause'); }); }
  } else sfx('clap');
  const r = stageRect(t);
  burst(r.x, r.y - 120, { n: 10, spread: 90 });
  t.querySelector('.cheer').classList.remove('hop');
  void t.offsetWidth;
  t.querySelector('.cheer').classList.add('hop');
  if (!isThinking() && Date.now() - lastCheerThanks > 25000) {
    lastCheerThanks = Date.now();
    setTimeout(() => speak('shan', 'cheer_thanks'), 300);
  }
}

// 唱名：每個畫面第一次說「岳岳，換你囉」，之後換人時說「換愷愷！」
export async function callTurn() {
  if (!turnsOn()) return;
  const k = KIDS[cur];
  await speak('shan', announced ? 'turn_next' : 'turn_first', { name: k.name, who: cur });
  announced = true;
}
// 做完一個動作：換人（麥克風飛過去）
export function nextTurn({ say = true } = {}) {
  if (!turnsOn()) return Promise.resolve();
  cur = ids.find((x) => x !== cur);
  sfx('whoosh');
  paint();
  return say ? callTurn() : Promise.resolve();
}
// 現在用誰的難度：一起玩時看輪到的人，一個人玩看自己
export function levelNow(profile) {
  if (turnsOn()) return KIDS[cur].level;
  return KIDS[profile.members[0]].level;
}
export function nameNow(profile) {
  if (turnsOn()) return { name: KIDS[cur].name, who: cur };
  return { name: KIDS[profile.members[0]].name, who: profile.members[0] };
}
