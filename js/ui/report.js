// 家長頁的「總覽」和「一週紀錄」（11/25）：不列流水帳，用圖表和幾句重點呈現學習成果與心情。
// 以岳岳為主（大卡），愷愷縮小；一週紀錄可以切換看誰。
import { KIDS } from '../config.js';
import { state } from '../core/store.js';
import { kidHead } from '../art/stars.js';
import { dayStats, rangeStats, lastDays, today, avgFocusMin, DOMAINS, domainOf, rideStruggle } from '../core/stats.js';
import { moodFace, MOOD_NAME, moodChart, barChart, stackChart, pairedChart, lineChart, C } from './charts.js';

const WEEK = '日一二三四五六';
const parse = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const wd = (k) => WEEK[parse(k).getDay()];
const md = (k) => { const d = parse(k); return `${d.getMonth() + 1}/${d.getDate()}`; };
const r1 = (v) => Math.round(v * 10) / 10;
const join = (a) => a.join('、');

// 遊戲名稱（家長頁的 NAMES）；節慶的關卡不拿來當建議
function gameName(names, key) { return names[key] || key; }

// ---- 總覽：岳岳大卡＋愷愷小卡 ----
function highlights(id, st, names) {
  const out = [];
  const clean = Object.entries(st.games).filter(([, r]) => r[2] > 0 && !r[3] && !r[4]).map(([k]) => gameName(names, k));
  if (clean.length) out.push(`✨ ${join(clean.slice(0, 3))}${clean.length > 1 ? '都' : ''}一次就做對`);
  if (st.moodS != null && st.moodE != null && st.moodE > st.moodS) out.push('✨ 玩完心情變好了');
  const quits = Object.entries(st.games).filter(([, r]) => r[4] > 0).map(([k]) => gameName(names, k));
  if (quits.length >= 2) out.push(`🟡 中途離開了 ${quits.length} 關（${join(quits.slice(0, 3))}），可能太難或分心了，可以陪他玩一次`);
  if (rideStruggle(id)) out.push('🧭 坐車認路最近比較常卡住，遊戲已經自動多幫一點：對的箭頭一開始就發亮、早一點提示轉一轉小鎮');
  if (st.moodS != null && st.moodS <= 2) out.push('💛 玩之前心情不太好，可以抱抱他、聊聊今天發生的事');
  else if (st.moodE != null && st.moodE <= 2) out.push('💛 玩完心情不太好，可以問問他哪一關卡住了');
  return out;
}
const blankFace = (size) => `<span class="mood-none" style="width:${size}px;height:${size}px">？</span>`;
const face = (v, size) => (v == null ? blankFace(size) : `<span title="${MOOD_NAME[v]}">${moodFace(v, size)}</span>`);
const delta = (v, unit, better = 'up') => {
  if (v == null || Math.abs(v) < 0.5) return '';
  const up = v > 0;
  return `<div class="d ${(up ? 'up' : 'down') === better ? 'good' : 'bad'}">${up ? '▲' : '▼'} 比平常${up ? '多' : '少'} ${Math.abs(Math.round(v))} ${unit}</div>`;
};

export function todayHtml(names) {
  const day = today();
  const past = lastDays(8).slice(0, 7);
  const kid = (id) => {
    const st = dayStats(id, day);
    const pastDays = past.map((d) => dayStats(id, d)).filter((s) => s.tries);
    const avgMin = pastDays.length ? pastDays.reduce((t, s) => t + s.ms, 0) / pastDays.length / 60000 : null;
    const min = Math.round(st.ms / 60000);
    return { st, min, dMin: avgMin == null || !st.tries ? null : min - avgMin, hl: highlights(id, st, names) };
  };
  const y = kid('yy'), k = kid('kk');
  const yy = `<div class="rp-hero"><h3>${kidHead('yy', 52)} ${KIDS.yy.name}</h3>
    <div class="rp-row">
      <div class="rp-mood"><div>${face(y.st.moodS, 84)}<div class="lab">玩之前</div></div><div class="arrow">➜</div><div>${face(y.st.moodE, 84)}<div class="lab">玩之後</div></div></div>
      <div class="rp-tile"><div class="k">專注</div><div class="v">${y.min}<small>分鐘</small></div>${delta(y.dMin, '分鐘')}</div>
      <div class="rp-tile"><div class="k">完成</div><div class="v">${y.st.done}<small>關</small></div><div class="d">${y.st.quit ? `中途離開 ${y.st.quit} 關` : y.st.tries ? '沒有中途離開' : ''}</div></div>
      <div class="rp-tile"><div class="k">自己完成</div><div class="v">${y.st.solo}<small>/ ${y.st.done}</small></div><div class="d">${y.st.done ? `靠提示 ${y.st.help} 關` : ''}</div></div>
    </div>
    <div class="rp-hl">${y.hl.length ? y.hl.join('<br>') : y.st.tries ? '今天玩得很穩，沒有特別要注意的地方' : '今天還沒玩'}</div>
  </div>`;
  const kkMood = k.st.moodE ?? k.st.moodS;
  const kk = `<div class="rp-mini">${kidHead('kk', 44)}<span class="nm">${KIDS.kk.name}</span>${face(kkMood, 44)}
    <span>專注 <b>${k.min}</b> 分鐘</span><span>完成 <b>${k.st.done}</b> 關</span><span>自己完成 <b>${k.st.solo}</b></span>
    <span class="hl1">${k.hl[0] || (k.st.tries ? '' : '今天還沒玩')}</span></div>`;
  return yy + kk;
}

// ---- 一週紀錄：三件事＋五張圖 ----
function insights(id, names) {
  const d7 = lastDays(7), p7 = lastDays(14).slice(0, 7);
  const a = rangeStats(id, d7), b = rangeStats(id, p7);
  const out = [];
  if (a.tries) {
    const fa = a.ms / a.tries / 60000;
    let s = `⏱️ 每關平均專注 <b>${r1(fa)} 分鐘</b>`;
    if (b.tries) { const df = fa - b.ms / b.tries / 60000; if (Math.abs(df) >= 0.1) s += `，比上週${df > 0 ? '多' : '少'} ${r1(Math.abs(df))} 分鐘`; }
    s += b.tries ? `；中途離開 ${a.quit} 次（上週 ${b.quit} 次）` : `；中途離開 ${a.quit} 次`;
    out.push(s);
  }
  const moods = d7.map((day) => ({ day, ...dayStats(id, day) })).filter((x) => x.moodS != null || x.moodE != null);
  if (moods.length) {
    const low = moods.filter((x) => (x.moodS ?? 9) <= 2 || (x.moodE ?? 9) <= 2).map((x) => (x.day === today() ? '今天' : `週${wd(x.day)}`));
    const pairs = moods.filter((x) => x.moodS != null && x.moodE != null);
    const up = pairs.filter((x) => x.moodE > x.moodS).length, down = pairs.filter((x) => x.moodE < x.moodS).length;
    let s = low.length ? `💛 <b>${join(low)}</b>心情比較低` : '💛 這週心情都還不錯';
    if (pairs.length) s += up > down ? '；玩完心情大多會回升' : down > up ? '；玩完反而比較低，可以留意是不是關卡太難或時間太長' : '';
    out.push(s);
  }
  if (a.done) {
    const dom = DOMAINS.map(([k, ic, n]) => ({ k, ic, n, v: a.dom[k] }));
    const max = dom.reduce((m, x) => (x.v > m.v ? x : m));
    const min = dom.reduce((m, x) => (x.v < m.v ? x : m));
    let s = `🧭 「${max.n}」類這週玩得最多`;
    if (min.v <= Math.max(1, max.v / 3)) {
      const sug = Object.keys(names).filter((k) => !k.startsWith('fest.') && domainOf(k) === min.k).slice(0, 2).map((k) => names[k]);
      s += `；「${min.n}」只玩了 ${min.v} 關${sug.length ? `，可以多帶他玩：${join(sug)}` : ''}`;
    }
    out.push(s);
  }
  return out;
}

export function weekHtml(id, names) {
  const d14 = lastDays(14), d7 = d14.slice(7), p7 = d14.slice(0, 7);
  const t = today();
  const has = d14.some((day) => { const s = dayStats(id, day); return s.tries || s.moodS != null || s.moodE != null; });
  const sw = `<span class="kidsw">${['yy', 'kk'].map((k) => `<button class="${k === id ? 'on' : ''}" data-kid="${k}">${KIDS[k].name}</button>`).join('')}</span>`;
  if (!has) {
    return `<h2>這兩週 ${sw}</h2><div class="rp-empty">📈 從今天開始記錄：每一關玩多久、有沒有靠提示、玩之前和玩之後的心情。<br>玩幾天以後，這裡就會畫出心情曲線、專注力和學習領域的圖。</div>${multCard(id, d14)}`;
  }
  const ins = insights(id, names);
  const s7 = d7.map((day) => dayStats(id, day));
  const lab7 = d7.map((day) => (day === t ? `${wd(day)}(今)` : wd(day)));
  const mood14 = d14.map((day) => dayStats(id, day));
  const lab14 = d14.map((day, i) => (i === 0 || i === 13 || parse(day).getDate() === 1 ? md(day) : String(parse(day).getDate())));
  const a = rangeStats(id, d7), b = rangeStats(id, p7);
  return `<h2>這兩週 ${sw}</h2>
    ${ins.length ? `<div class="rp-three"><b>本週三件事</b><ul>${ins.map((x) => `<li>${x}</li>`).join('')}</ul></div>` : ''}
    <div class="rp-card"><h4>心情曲線</h4><div class="q">每次開始玩、休息時各打卡一次；粉紅底的日子心情比較低</div>
      ${moodChart({ labels: lab14, today: 13, series: [
        { name: '玩之前', color: C.s1, dash: true, vals: mood14.map((s) => s.moodS) },
        { name: '玩之後', color: C.s2, vals: mood14.map((s) => s.moodE) }] })}</div>
    <div class="rp-card"><h4>專注力</h4><div class="q">每關平均專注幾分鐘（下面是完成率）</div>
      ${barChart({ labels: lab7, today: 6, vals: s7.map((s) => { const v = avgFocusMin(s); return v == null ? null : r1(v); }), unit: ' 分',
        sub: s7.map((s) => (s.tries ? `${Math.round((s.done / s.tries) * 100)}%` : '—')) })}</div>
    <div class="rp-card"><h4>自己完成</h4><div class="q">每天玩的關卡：自己完成、靠提示（錯兩次以上或出現手指提示）、中途離開</div>
      ${stackChart({ labels: lab7, today: 6, segs: [
        { name: '自己完成', color: C.s1, vals: s7.map((s) => s.solo) },
        { name: '靠提示', color: C.s4, vals: s7.map((s) => s.help) },
        { name: '中途離開', color: C.gray, vals: s7.map((s) => s.quit) }] })}</div>
    <div class="rp-card"><h4>生活領域</h4><div class="q">這週玩完了哪些類型（和上週比）</div>
      ${pairedChart({ cats: DOMAINS.map(([, icon, name]) => ({ icon, name })), a: { name: '這週', color: C.s1, vals: DOMAINS.map(([k]) => a.dom[k]) }, b: { name: '上週', color: C.gray, vals: DOMAINS.map(([k]) => b.dom[k]) } })}</div>
    ${multCard(id, d14)}`;
}

function multCard(id, d14) {
  if (id !== 'yy') return '';
  const h = state.multHist || {};
  const vals = d14.map((day) => (h[day] == null ? null : h[day]));
  if (!vals.some((v) => v != null)) return '';
  const lab = d14.map((day, i) => (i === 0 || i === 13 ? md(day) : String(parse(day).getDate())));
  return `<div class="rp-card"><h4>九九乘法</h4><div class="q">學會的題數（共 81 題）</div>${lineChart({ labels: lab, vals, max: 81, unit: ' 題' })}</div>`;
}
