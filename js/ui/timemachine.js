// 家長頁「進階」：假裝現在幾點（時段卡片＋±30 分＋日期＋節慶月曆），手機上也好按，不用鍵盤。
import { TEST_KEY, testing, hour as clockHour, dateKey, sky } from '../core/clock.js';
import { festSpans } from '../core/festival.js';
import { FEST_SIGN, FEST_COLOR } from '../art/festival.js';

const p2 = (n) => String(n).padStart(2, '0');
const fmt = (h) => `${p2(Math.floor(h))}:${p2(Math.round((h % 1) * 60))}`;
const WEEK = '日一二三四五六';
const parseDate = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const dateText = (k) => { const d = parseDate(k); return `${d.getMonth() + 1}/${d.getDate()}（${WEEK[d.getDay()]}）`; };
const addDays = (k, n) => { const d = parseDate(k); d.setDate(d.getDate() + n); return dateKey(d); };
const grad = (h) => { const s = sky(h); return `linear-gradient(${s.top},${s.bottom})`; };
const realToday = () => dateKey(new Date());

// 某一年的節慶（快取；月曆會跨年看）
const spanCache = {};
const spans = (y) => (spanCache[y] ||= festSpans(y));
const festOn = (k) => spans(+k.slice(0, 4)).filter((f) => f.date === k);
const windowOn = (k) => spans(+k.slice(0, 4)).filter((f) => f.from <= k && k <= f.to);

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

export function timeMachineHtml() {
  return `<div class="tm" id="tm"></div>`;
}

// 月曆：一次一個月，節慶正日有圖示和名字，活動期間淡淡上色；點一天就選好
function calendarHtml(month, sel) {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const days = new Date(y, m, 0).getDate();
  const today = realToday();
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push('<div class="cal-d empty"></div>');
  for (let d = 1; d <= days; d++) {
    const k = `${y}-${p2(m)}-${p2(d)}`;
    const main = festOn(k);
    const win = main.length ? main : windowOn(k);
    const tint = win.length ? `style="--fc:${FEST_COLOR[win[0].id][0]}"` : '';
    const cls = ['cal-d', win.length ? 'win' : '', main.length ? 'fest' : '', k === sel ? 'on' : '', k === today ? 'today' : ''].filter(Boolean).join(' ');
    cells.push(`<button class="${cls}" data-date="${k}" ${tint}><span class="cn">${d}</span>${main.length ? `<span class="ci">${FEST_SIGN[main[0].id]}</span><span class="cf">${main.map((f) => f.name).join('・')}</span>` : ''}</button>`);
  }
  return `<div class="cal-mask"><div class="cal">
    <div class="cal-head"><button class="cal-nav" data-mon="-1">◀</button><div class="cal-title">${y} 年 ${m} 月</div><button class="cal-nav" data-mon="1">▶</button><button class="cal-x">✕</button></div>
    <div class="cal-week">${[...WEEK].map((w) => `<span>${w}</span>`).join('')}</div>
    <div class="cal-grid">${cells.join('')}</div>
    <div class="cal-note"><i class="sw"></i>有顏色的日子：城市會出現節慶舞台</div>
  </div></div>`;
}

export function bindTimeMachine(root, settings) {
  const box = root.querySelector('#tm');
  if (!box) return;
  const start = { h: Math.round(clockHour() * 2) / 2 % 24, d: dateKey() };
  const cur = { ...start };
  let calMonth = null; // 月曆打開時是 'YYYY-MM'

  const render = () => {
    const changed = cur.h !== start.h || cur.d !== start.d;
    const badge = changed ? '<span class="tm-badge edit">✏️ 還沒套用</span>'
      : testing ? '<span class="tm-badge">🧪 測試時間中（同步暫停）</span>' : '<span class="tm-badge real">✓ 真實時間</span>';
    const fx = festOn(cur.d).map((f) => `<span class="fe">${f.name}</span>`).join('');
    box.innerHTML = `
      <div class="tm-h first">⏰ 幾點 ${badge}</div>
      <div class="tm-tiles">${tiles(settings).map(([ic, name, h]) => `<button class="tile${h === cur.h ? ' on' : ''}${sky(h).dark ? '' : ' lt'}" data-h="${h}" style="background:${grad(h)}"><span class="ti">${ic}</span><span class="tn">${name}</span><span class="tt">${fmt(h)}</span></button>`).join('')}</div>
      <div class="tm-row">
        <button class="dbtn" data-step="-0.5">－30分</button>
        <div class="tm-dshow">${fmt(cur.h)}</div>
        <button class="dbtn" data-step="0.5">＋30分</button>
      </div>
      <div class="tm-h">📅 哪一天</div>
      <div class="tm-row">
        <button class="dbtn" data-day="-1">◀</button>
        <div class="tm-dshow">${dateText(cur.d)}${fx}</div>
        <button class="dbtn" data-day="1">▶</button>
        <button class="dbtn today">今天</button>
        <button class="dbtn opencal">🗓️ 月曆</button>
      </div>
      <div class="tm-act"><button class="go">▶ 套用，重新開啟</button><button class="back">↺ 回到真實時間</button></div>
      ${calMonth ? calendarHtml(calMonth, cur.d) : ''}`;
  };

  box.addEventListener('click', (e) => {
    if (e.target.classList.contains('cal-mask')) { calMonth = null; render(); return; } // 點月曆外面＝關掉
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.step) {
      let h = cur.h + parseFloat(b.dataset.step);
      if (h >= 24) { h -= 24; cur.d = addDays(cur.d, 1); }
      if (h < 0) { h += 24; cur.d = addDays(cur.d, -1); }
      cur.h = h;
    } else if (b.dataset.h) cur.h = parseFloat(b.dataset.h);
    else if (b.dataset.day) cur.d = addDays(cur.d, +b.dataset.day);
    else if (b.dataset.date) { cur.d = b.dataset.date; calMonth = null; }
    else if (b.dataset.mon) { const d = parseDate(`${calMonth}-01`); d.setMonth(d.getMonth() + +b.dataset.mon); calMonth = dateKey(d).slice(0, 7); }
    else if (b.classList.contains('opencal')) calMonth = cur.d.slice(0, 7);
    else if (b.classList.contains('cal-x')) calMonth = null;
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
  render();
}
