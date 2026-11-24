// 透天厝（11/24）：一樓車庫、二樓客廳＋廚房、三樓臥室＋廁所，Z 字型樓梯從一樓貫穿到三樓，
// 扶手在欄杆那一側，Z 字中間的空隙用童軍繩編了防墜網。
// 這裡放房間裡用的「窗外的街景」和「通往樓梯的門」，讓每個房間都看得到外面、知道房子是連在一起的。

// 窗戶：外面是街道、對面的透天、天空（白天）；晚上天空變深、窗戶亮燈
export function streetWindow(night = false) {
  const sky = night ? '#26305e' : '#bfe6ff';
  const lit = night ? '#ffe9a8' : '#e6f4ff';
  return `<svg viewBox="0 0 200 150" width="100%" height="100%"><rect x="4" y="4" width="192" height="142" rx="10" fill="#fff"/>
    <rect x="14" y="14" width="172" height="122" rx="4" fill="${sky}"/>
    ${night ? '<circle cx="160" cy="34" r="10" fill="#fff6c0"/>' : '<circle cx="160" cy="34" r="12" fill="#fff3a0"/><ellipse cx="60" cy="34" rx="22" ry="8" fill="#fff" opacity=".8"/>'}
    <rect x="22" y="56" width="44" height="80" fill="#e6f4e8"/><rect x="70" y="44" width="48" height="92" fill="#fff0f0"/><rect x="122" y="60" width="56" height="76" fill="#fff8d6"/>
    ${[[30, 66], [46, 66], [30, 92], [46, 92], [78, 54], [98, 54], [78, 82], [98, 82], [132, 70], [156, 70], [132, 98], [156, 98]].map(([x, y]) => `<rect x="${x}" y="${y}" width="12" height="14" fill="${lit}"/>`).join('')}
    <circle cx="96" cy="40" r="7" fill="#3ea8e0"/><rect x="92" y="40" width="8" height="6" fill="#3ea8e0"/>
    <path d="M14 75 H186 M100 14 V136" stroke="#fff" stroke-width="6"/></svg>`;
}

// 門：門外是 Z 字型樓梯，扶手在欄杆側，中間有童軍繩編的防墜網
export function stairDoor() {
  const net = [...Array(7)].map((_, i) => `<path d="M${70 + i * 8} 24 L${70 + i * 8 - 30} 176" stroke="#d9b98a" stroke-width="2.5"/><path d="M${40 + i * 8} 24 L${40 + i * 8 + 30} 176" stroke="#d9b98a" stroke-width="2.5"/>`).join('');
  return `<svg viewBox="0 0 120 200" width="100%" height="100%"><rect x="4" y="4" width="112" height="196" rx="8" fill="#c98b5e"/>
    <rect x="14" y="14" width="92" height="186" fill="#f3e6d2"/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${18 + i * 8}" y="${150 - i * 20}" width="30" height="8" fill="#b9875a"/>`).join('')}
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${72 - i * 8}" y="${70 - i * 12}" width="30" height="8" fill="#b9875a"/>`).join('')}
    <g opacity=".85">${net}</g>
    <path d="M18 140 L58 60 M102 70 L62 18" stroke="#8a5a3a" stroke-width="4"/></svg>`;
}

// 防墜網（給娃娃屋用）：菱形網格的童軍繩
export function ropeNet(w, h) {
  let s = '';
  for (let x = -h; x < w + h; x += 22) {
    s += `<path d="M${x} 0 L${x + h} ${h}" stroke="#e2c08e" stroke-width="3"/><path d="M${x} ${h} L${x + h} 0" stroke="#d9b07a" stroke-width="3"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><rect x="0" y="0" width="${w}" height="4" fill="#c9a06a"/><rect x="0" y="${h - 4}" width="${w}" height="4" fill="#c9a06a"/>${s}</svg>`;
}
