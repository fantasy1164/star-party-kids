// 跟現實同步的時間與日夜。
// 測試：網址 ?hour=20.5、?date=2026-12-24，或家長頁「測試時間」（存在 spk-test）。
import { KEY } from '../config.js';

const params = new URLSearchParams(location.search);
export const TEST_KEY = `${KEY}-test`;
export function testSettings() {
  try { return JSON.parse(localStorage.getItem(TEST_KEY) || 'null') || {}; } catch { return {}; }
}
const saved = testSettings();
const hourRaw = params.has('hour') ? params.get('hour') : saved.hour;
const hourOverride = hourRaw !== undefined && hourRaw !== null && hourRaw !== '' ? parseFloat(hourRaw) : null;
const dateRaw = params.get('date') || saved.date || '';
const dateOverride = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw.split('-').map(Number) : null;
export const testing = !!(dateOverride || (hourOverride !== null && !Number.isNaN(hourOverride)));

// 家長頁設定的測試時間：從按下套用那一刻開始往前走（不會停住）
const offset = (() => {
  if (!testing) return 0;
  const start = saved.setAt && !params.has('hour') && !params.get('date') ? saved.setAt : Date.now();
  const d = new Date(start);
  if (dateOverride) d.setFullYear(dateOverride[0], dateOverride[1] - 1, dateOverride[2]);
  if (hourOverride !== null && !Number.isNaN(hourOverride)) {
    d.setHours(Math.floor(hourOverride), Math.round((hourOverride % 1) * 60), 0, 0);
  }
  return d.getTime() - start;
})();

export function now() { return new Date(Date.now() + offset); }
export function hour() { const d = now(); return d.getHours() + d.getMinutes() / 60; }
export function dateKey(d = now()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// 一天的時段：morning 起床～11、day 11～17、evening 17～睡覺、night 睡覺～起床
export function phase(settings, h = hour()) {
  const { wake = 6, bedtime = 21 } = settings || {};
  if (h < wake || h >= bedtime) return 'night';
  if (h < 11) return 'morning';
  if (h < 17) return 'day';
  return 'evening';
}
export function isDark(h = hour()) { return h < 6 || h >= 18.5; }

// 天空顏色（窗外、背景）：依小時內插
const SKY = [
  [0, '#0d1233', '#20265a'], [5, '#27336b', '#8a6f9a'], [6.2, '#7fb6e8', '#ffd3a8'],
  [8, '#78c7ff', '#e6f6ff'], [12, '#5fbdf7', '#d8f1ff'], [16.5, '#76bdf0', '#ffe4b0'],
  [18, '#f39a7d', '#ffd18a'], [19, '#4d4d93', '#c58aa6'], [20.5, '#1d2350', '#3a3c78'], [24, '#0d1233', '#20265a'],
];
function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
export function sky(h = hour()) {
  let i = 0;
  while (i < SKY.length - 2 && SKY[i + 1][0] <= h) i++;
  const [h0, t0, b0] = SKY[i], [h1, t1, b1] = SKY[i + 1];
  const k = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)));
  return { top: mix(t0, t1, k), bottom: mix(b0, b1, k), dark: isDark(h) };
}
// 房間的光：白天幾乎沒有、傍晚偏橘、晚上偏藍暗
export function roomTint(h = hour()) {
  if (h >= 6.5 && h < 16.5) return 'rgba(255,240,200,0)';
  if (h >= 16.5 && h < 18.5) return `rgba(255,140,70,${(0.06 + (h - 16.5) * 0.05).toFixed(3)})`;
  if (h >= 5 && h < 6.5) return 'rgba(120,110,190,0.22)';
  return 'rgba(14,20,72,0.46)';
}
