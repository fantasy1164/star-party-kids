// 家長頁「進階」：假裝現在幾點（時段卡片＋±30 分＋日期），手機上也好按，不用鍵盤。
import { TEST_KEY, testing, hour as clockHour, dateKey, phase, sky } from '../core/clock.js';
import { yearList } from '../core/festival.js';

const p2 = (n) => String(n).padStart(2, '0');
const fmt = (h) => `${p2(Math.floor(h))}:${p2(Math.round((h % 1) * 60))}`;
const WEEK = '日一二三四五六';
const parseDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const dateText = (k) => { const d = parseDate(k); return `${d.getMonth() + 1}/${d.getDate()}（${WEEK[d.getDay()]}）`; };
const addDays = (k, n) => { const d = parseDate(k); d.setDate(d.getDate() + n); return dateKey(d); };
const grad = (h) => { const s = sky(h); return `linear-gradient(${s.top},${s.bottom})`; };
const realToday = () => dateKey(new Date());

function tiles(s) {
  const wake = s.wake ?? 6, bed = s.bedtime ?? 21;
  return [
    ['🌅', '起床', wake],
    ['🪥', '早上', Math.max(8, wake + 1)],
    ['🍱', '中午', 12],
    ['🌇', '傍晚', 17.5],
    ['🛁', '睡前', bed - 0.5],
    ['🌙', '睡覺', Math.min(23.5, bed + 1)],
  ];
}

const WHAT = { morning: '🌅 早上', day: '☀️ 白天', evening: '🌇 傍晚', night: '🛏️ 睡覺時間：玩具都睡了（睡覺畫面）' };

function sceneWin(h) {
  const dark = sky(h).dark;
  let orb;
  if (!dark) {
    const k = Math.min(1, Math.max(0, (h - 6) / 12.5));
    orb = `<i class="orb sun" style="left:${10 + 80 * k}%;top:${80 - 62 * Math.sin(Math.PI * k)}%"></i>`;
  } else {
    const k = ((h + 5.5) % 24) / 11.5;
    const kk = Math.min(1, Math.max(0, k));
    orb = `<i class="orb moon" style="left:${10 + 80 * kk}%;top:${72 - 52 * Math.sin(Math.PI * kk)}%"></i>`;
  }
  const stars = dark ? [[20, 20], [60, 14], [82, 34], [36, 40], [70, 55]].map(([x, y]) => `<i class="star" style="left:${x}%;top:${y}%"></i>`).join('') : '';
  return `<div class="tm-win${dark ? ' dark' : ''}" style="background:${grad(h)}">${stars}${orb}<i class="hill"></i></div>`;
}

export function timeMachineHtml() {
  return `<div class="tm" id="tm"></div>`;
}

export function bindTimeMachine(root, settings) {
  const box = root.querySelector('#tm');
  if (!box) return;
  const start = { h: Math.round(clockHour() * 2) / 2 % 24, d: dateKey() };
  const cur = { ...start };

  const render = () => {
    const changed = cur.h !== start.h || cur.d !== start.d;
    const badge = changed ? '<span class="tm-badge edit">✏️ 還沒套用</span>'
      : testing ? '<span class="tm-badge">🧪 測試時間中（同步暫停）</span>' : '<span class="tm-badge real">✓ 真實時間</span>';
    const fx = yearList(parseDate(cur.d).getFullYear()).filter((f) => f.date === cur.d).map((f) => `<span class="fe">${f.name}</span>`).join('');
    box.innerHTML = `
      <div class="tm-top">${sceneWin(cur.h)}
        <div class="tm-read">${badge}
          <div class="tm-clock">${fmt(cur.h)}</div>
          <div class="tm-date">${dateText(cur.d)}${fx}</div>
          <div class="tm-what">${WHAT[phase(settings, cur.h)]}</div>
        </div>
        <div class="tm-steps"><button class="tm-step" data-step="0.5">＋30分</button><button class="tm-step" data-step="-0.5">－30分</button></div>
      </div>
      <div class="tm-h">⏰ 幾點（點一下就好）</div>
      <div class="tm-tiles">${tiles(settings).map(([ic, name, h]) => `<button class="tile${h === cur.h ? ' on' : ''}${sky(h).dark ? '' : ' lt'}" data-h="${h}" style="background:${grad(h)}"><span class="ti">${ic}</span><span class="tn">${name}</span><span class="tt">${fmt(h)}</span></button>`).join('')}</div>
      <div class="tm-h">📅 哪一天</div>
      <div class="tm-dates">
        <button class="dbtn" data-day="-1">◀</button>
        <div class="tm-dshow">${dateText(cur.d)}</div>
        <button class="dbtn" data-day="1">▶</button>
        <button class="dbtn today">今天</button>
        <label class="dbtn dpick">🗓️ 選日期<input type="date" value="${cur.d}"></label>
      </div>
      <div class="tm-act"><button class="go">▶ 套用，重新開啟</button><button class="back">↺ 回到真實時間</button></div>`;
  };

  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.step) {
      let h = cur.h + parseFloat(b.dataset.step);
      if (h >= 24) { h -= 24; cur.d = addDays(cur.d, 1); }
      if (h < 0) { h += 24; cur.d = addDays(cur.d, -1); }
      cur.h = h;
    } else if (b.dataset.h) cur.h = parseFloat(b.dataset.h);
    else if (b.dataset.day) cur.d = addDays(cur.d, +b.dataset.day);
    else if (b.classList.contains('today')) cur.d = realToday();
    else if (b.classList.contains('go')) {
      const keep = cur.d === realToday() ? {} : { date: cur.d };
      localStorage.setItem(TEST_KEY, JSON.stringify({ ...keep, hour: cur.h, setAt: Date.now() }));
      location.reload();
      return;
    } else if (b.classList.contains('back')) {
      localStorage.removeItem(TEST_KEY);
      location.reload();
      return;
    } else return;
    render();
  });
  box.addEventListener('change', (e) => {
    if (e.target.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) { cur.d = e.target.value; render(); }
  });
  render();
}
