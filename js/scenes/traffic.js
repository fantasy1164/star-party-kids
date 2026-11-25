// 城市裡的車流（11/25）：汽車、騎機車的人、公車、郵差機車、宅配車沿著彎彎的馬路慢慢開，到路口停一下再隨便轉一個方向；
// 高架捷運來回開、在捷運站停一下；火車從東邊開進火車站、停一下再開走。
// 省電：沒人碰、沒人說話（stillNow）時全部停住；每秒只更新 30 次；車子很小、只動位置。
// 台灣靠右行駛：車子開在行進方向的右邊車道（機車更靠邊）。看板是側面、車頭朝右，往畫面左邊開的時候翻過來。
import { pick, wait } from '../core/dom.js';
import { stillNow } from '../core/session.js';
import { VEHICLES } from '../art/fun.js';
import { carSvg, riderSvg, postScooterSvg, vanSvg, mrtTrainSvg, trainSvg, freshTruckSvg, postVanSvg, bookmobileSvg } from '../art/traffic.js';

const FLEET = [
  // [種類, 圖, 寬, 高, 速度（每秒幾個單位）]
  ['car', () => carSvg('#e53935'), 78, 50, 95],
  ['car', () => carSvg('#2f7fe0'), 78, 50, 90],
  ['car', () => carSvg('#f4f4f4'), 78, 50, 100],
  ['car', () => carSvg('#3a3f4a'), 78, 50, 92],
  ['scooter', () => riderSvg('#2f7fe0', '#ffb627'), 50, 50, 110],
  ['scooter', () => riderSvg('#e53935', '#7ee06a', '#ffd23f'), 50, 50, 105],
  ['scooter', () => riderSvg('#f4f4f4', '#a98bff', '#ff8fb8'), 50, 50, 115],
  ['bus', () => VEHICLES.bus, 112, 88, 70],
  ['post', () => postScooterSvg(), 54, 52, 100],
  ['van', () => vanSvg(), 92, 58, 85],
  ['fresh', () => freshTruckSvg(), 104, 70, 75],
  ['postvan', () => postVanSvg(), 92, 62, 85],
  ['book', () => bookmobileSvg(), 104, 70, 70],
];

// 坐車時（11/25）：player() 回傳小孩坐的車在哪裡。路上的車靠近它就停下來等（不會穿過去）；
// 開了警笛（siren）的時候，更遠就停、而且往路邊靠，讓救護車、消防車、警車先過。
export function startTraffic(dio, roads, { alive, player = null }) {
  let siren = false;
  let onYield = null;
  const { NODES, neighbors, edgePts, along, MRT_LINE, TRAIN_LINE, PLACES, heightAt = () => 0, hwyPt = null, HWY = null, occludedBy = null } = roads;
  // 被高架橋、山擋住（從鏡頭看過去）：每幾格才算一次，省電
  let eye = null, occN = 0, trainOcc = false;
  const hidden = (x, y, z) => (occludedBy && eye ? !!occludedBy(eye, x, y, z) : false);
  // 開進山裡（隧道）就看不見；一半在裡面就半透明
  const inside = (x, y, len = 0, dx = 1, dy = 0) => {
    if (!len) return heightAt(x, y) > 30 ? 1 : 0;
    const l = Math.hypot(dx, dy) || 1; let n = 0;
    for (let k = -2; k <= 2; k++) if (heightAt(x + (dx / l) * len * k / 4, y + (dy / l) * len * k / 4) > 30) n++;
    return n / 5;
  };
  const veil = (el, f) => { const o = f >= 1 ? '0' : f > 0 ? String(1 - f) : ''; if (el.style.opacity !== o) el.style.opacity = o; };
  const ids = Object.keys(NODES);
  const cars = FLEET.map(([kind, art, w, h, speed], i) => {
    const a = NODES[ids[(i * 3) % ids.length]];
    const b = pick(neighbors(a));
    const sp = dio.addSprite({ x: a.x, y: a.y, z: 1, w, h, html: `<div class="veh">${art()}</div>`, shadow: 0.35, tap: `veh:${kind}`, live: true });
    sp.el.classList.add('vehicle');
    return { kind, sp, inner: sp.el.firstElementChild, a, b, E: edgePts(a.id, b.id), t: 0.1 + Math.random() * 0.7, speed: speed * (0.85 + Math.random() * 0.3), wait: 0, flip: false };
  });
  const lane = (k) => (k === 'scooter' || k === 'post' ? 36 : 20);
  const facing = (v, dx, dy) => {
    // 畫面上的水平方向：鏡頭繞 Z 軸轉了 view.a 度
    const a = (dio.view.a * Math.PI) / 180;
    const sx = dx * Math.cos(a) - dy * Math.sin(a);
    const f = sx < 0;
    if (f !== v.flip) { v.flip = f; v.inner.style.transform = f ? 'scaleX(-1)' : ''; }
  };
  function stepCars(s) {
    const me = player?.();
    for (const v of cars) {
      // 讓路：離小孩的車太近就停；開警笛時停得更遠、慢慢往路邊靠
      let hold = false;
      if (me) {
        const d = Math.hypot(v.sp.x - me.x, v.sp.y - me.y);
        hold = d < (siren ? 520 : 200);
        const want = hold ? (siren ? 1 : 0.7) : 0;   // 沒開警笛也稍微靠邊，小孩的車才不會穿過去
        v.pull = (v.pull || 0) + Math.max(-s * 1.5, Math.min(s * 1.5, want - (v.pull || 0)));
        if (siren && hold && !v.yielded) { v.yielded = true; onYield?.(); }
        if (!siren) v.yielded = false;
      }
      if (hold) { place(v); continue; }
      if (v.wait > 0) { v.wait -= s; place(v); continue; }
      v.t += (v.speed * s) / v.E.len;
      if (v.t >= 1) {
        // 到路口：停一下（像在等紅燈、看左右），再換一條路（不回頭，除非是死路）
        const nb = neighbors(v.b).filter((n) => n.id !== v.a.id);
        const next = pick(nb.length ? nb : neighbors(v.b));
        v.a = v.b; v.b = next; v.E = edgePts(v.a.id, v.b.id); v.t = 0;
        v.wait = 0.5 + Math.random() * 1.5;
      }
      place(v);
    }
  }
  function place(v) {
    const p = along(v.E, Math.min(1, v.t));
    const l = Math.hypot(p.dx, p.dy) || 1;
    const off = lane(v.kind) + (v.pull || 0) * 46;   // 讓路時往右邊的路邊靠
    const x = p.x - (p.dy / l) * off, y = p.y + (p.dx / l) * off;
    v.sp.move(x, y, 1);
    if (inside(x, y)) veil(v.sp.el, 1);
    else if (eye) { v.occ = hidden(x, y, 22); veil(v.sp.el, v.occ ? 1 : 0); }
    else veil(v.sp.el, v.occ ? 1 : 0);
    facing(v, p.dx, p.dy);
  }

  // ---- 捷運、火車：沿著一直線來回 ----
  const mrt = dio.addSprite({ x: MRT_LINE.x0, y: MRT_LINE.y + 2, z: MRT_LINE.z + 12, w: 230, h: 46, html: mrtTrainSvg(), shadow: 0, tap: 'veh:mrt', live: true });
  mrt.el.classList.add('vehicle', 'gone');
  const train = dio.addSprite({ x: TRAIN_LINE.far, y: TRAIN_LINE.y + 6, z: 1, w: 210, h: 62, html: trainSvg(2), shadow: 0.3, tap: 'veh:train', live: true });
  train.el.classList.add('vehicle', 'gone');
  // 一段一段開：legs = [[從, 到, 停幾秒], ...]；開的時候有加減速
  const movers = [];
  function runLegs(sp, y, z, legs) {
    return new Promise((resolve) => {
      movers.push({ sp, y, z, legs, k: 0, t: 0, hold: 0, resolve });
    });
  }
  function stepMovers(s) {
    for (let i = movers.length - 1; i >= 0; i--) {
      const m = movers[i];
      const [x0, x1, stop] = m.legs[m.k];
      if (m.hold > 0) { m.hold -= s; if (m.hold <= 0) m.k++; }
      else {
        const dur = Math.abs(x1 - x0) / 150;
        m.t = Math.min(1, m.t + s / dur);
        const e = m.t < 0.5 ? 2 * m.t * m.t : 1 - (-2 * m.t + 2) ** 2 / 2;
        m.sp.move(x0 + (x1 - x0) * e, m.y, m.z);
        if (m.sp === train) { if (eye) trainOcc = hidden(m.sp.x, m.y, 30); veil(train.el, Math.max(inside(m.sp.x, m.y, 210), trainOcc ? 1 : 0)); }   // 火車開進東山的隧道
        if (m.t >= 1) { m.t = 0; if (stop) m.hold = stop; else m.k++; }
      }
      if (m.k >= m.legs.length) { movers.splice(i, 1); m.resolve(); }
    }
  }
  const pause = async (ms) => { const end = Date.now() + ms; while (alive() && Date.now() < end) await wait(500); };
  (async () => {
    // 捷運：從一頭開到捷運站停 4 秒，再開到另一頭；等一下，換方向回來
    const st = PLACES.mrt.x, L = MRT_LINE;
    let dir = 1;
    await pause(1500);
    while (alive()) {
      const [a, b] = dir > 0 ? [L.x0 + 120, L.x1 - 120] : [L.x1 - 120, L.x0 + 120];
      mrt.el.classList.remove('gone');
      await runLegs(mrt, L.y + 2, L.z + 12, [[a, st, 4], [st, b, 0]]);
      mrt.el.classList.add('gone');
      dir = -dir;
      await pause(7000);
    }
  })();
  (async () => {
    // 火車：從東邊開進火車站，停 5 秒，再往東開走
    await pause(4000);
    while (alive()) {
      train.el.classList.remove('gone');
      await runLegs(train, TRAIN_LINE.y + 6, 1, [[TRAIN_LINE.far, TRAIN_LINE.stop, 5], [TRAIN_LINE.stop, TRAIN_LINE.far, 0]]);
      train.el.classList.add('gone');
      await pause(16000);
    }
  })();

  // ---- 高架快速道路上的車：兩個方向各跑，從西山的隧道進出 ----
  const hw = [];
  if (hwyPt && HWY) {
    const HL = (() => { let L = 0, p = hwyPt(0); for (let i = 1; i <= 60; i++) { const q = hwyPt(i / 60); L += Math.hypot(q.x - p.x, q.y - p.y); p = q; } return L; })();
    [['car', () => carSvg('#ffb627'), 0.1, 1], ['car', () => carSvg('#2f7fe0'), 0.55, 1], ['bus', () => VEHICLES.bus, 0.3, -1], ['van', () => vanSvg(), 0.8, -1]].forEach(([kind, art, t0, dir]) => {
      const sp = dio.addSprite({ x: 0, y: 0, z: HWY.z, w: kind === 'bus' ? 100 : 74, h: kind === 'bus' ? 80 : 48, html: `<div class="veh">${art()}</div>`, shadow: 0.3, tap: `veh:${kind}`, live: true });
      sp.el.classList.add('vehicle');
      hw.push({ sp, inner: sp.el.firstElementChild, t: t0, dir, speed: (dir > 0 ? 150 : 135) / HL, flip: false });
    });
  }
  function stepHwy(s) {
    for (const v of hw) {
      v.t += v.speed * s * v.dir;
      if (v.t > 1.04) v.t = -0.04; if (v.t < -0.04) v.t = 1.04;
      const p = hwyPt(Math.max(0, Math.min(1, v.t)));
      const l = Math.hypot(p.dx, p.dy) || 1, off = 22 * v.dir;
      const x = p.x - (p.dy / l) * off, y = p.y + (p.dx / l) * off;
      v.sp.move(x, y, HWY.z);
      if (eye) v.occ = hidden(x, y, HWY.z + 20);
      veil(v.sp.el, heightAt(x, y) > HWY.z + 6 || v.t < 0 || v.t > 1 || v.occ ? 1 : 0);
      facing(v, p.dx * v.dir, p.dy * v.dir);
    }
  }

  let last = performance.now(), acc = 0;
  const tick = (now) => {
    if (!alive()) { movers.forEach((m) => m.resolve()); return; }
    const dt = Math.min(120, now - last);
    last = now;
    if (!stillNow() && !document.hidden) {
      acc += dt;
      if (acc >= 33) { const s = acc / 1000; acc = 0; eye = (occN = (occN + 1) % 4) === 0 && dio.eyePos ? dio.eyePos() : null; stepCars(s); stepMovers(s); stepHwy(s); }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return {
    setSiren(on, cb = null) { siren = !!on; onYield = cb; },
  };
}
