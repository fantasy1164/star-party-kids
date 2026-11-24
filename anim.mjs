import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await (await b.newContext({ viewport: { width: 852, height: 393 }, deviceScaleFactor: 2 })).newPage();
await p.goto('http://localhost:8765/?noguide&notts=1&hour=10'); await p.waitForTimeout(500);
for (const s of ['opening', 'town', 'house']) {
  await p.evaluate((s) => { const a = window.__app; a.profile = { id: 'both', members: ['yy','kk'] }; a.go(s); }, s); await p.waitForTimeout(3500);
  const r = await p.evaluate(() => {
    const m = {};
    for (const a of document.getAnimations()) {
      const t = a.effect?.getTiming?.(); if (t?.iterations !== Infinity) continue;
      const kf = a.effect.getKeyframes().flatMap(k => Object.keys(k).filter(x => !['offset','easing','composite','computedOffset'].includes(x)));
      const key = `${a.animationName}:${[...new Set(kf)].join(',')}`;
      m[key] = (m[key] || 0) + 1;
    }
    return m;
  });
  console.log(s, JSON.stringify(r));
}
await b.close();
