// 謝醫生：醫院裡唯一的人類角色，小兒科醫生（11/24，參考清泉醫院小兒科謝嘉誠醫師的五官）。
// 特徵：側分、前面微微翹起的黑色短髮，細金框眼鏡，圓圓的臉，閉著嘴溫和地笑；
//       白袍、紅色斜紋領帶、雙手抱胸（照片裡的招牌姿勢），脖子掛著小熊造型的兒童聽診器。
// 跟其他角色一樣是軟膠玩具的質感：大頭、不描黑邊。說話時 .mouth 換成 .mouth-o。
// 呼吸的上下晃動做在整個 svg 上（css 的 .char.xie），不是裡面的 <g class="bob">：
// 晃動放在裡面的群組時，Chrome 在立體場景裡只重畫左邊一部分，右半邊會不見。
const SKIN = '#ffd9b8';
let uid = 0;

export function xieSvg() {
  const u = `x${++uid}`;
  return `<svg class="char xie" viewBox="0 0 200 262" width="100%" height="100%"><defs>
    <linearGradient id="${u}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9eef4"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".7" stop-color="#fbfcfe"/><stop offset="1" stop-color="#dfe6ee"/></linearGradient>
    <radialGradient id="${u}f" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#ffe6cf"/><stop offset=".7" stop-color="${SKIN}"/><stop offset="1" stop-color="#f3c39c"/></radialGradient>
    <clipPath id="${u}t"><path d="M95 141 H105 L109 176 L100 186 L91 176Z"/></clipPath>
  </defs><g>
    <!-- 褲子、皮鞋 -->
    <rect x="76" y="226" width="20" height="26" rx="6" fill="#2b2f3a"/><rect x="104" y="226" width="20" height="26" rx="6" fill="#2b2f3a"/>
    <ellipse cx="84" cy="254" rx="16" ry="7" fill="#1d1f26"/><ellipse cx="116" cy="254" rx="16" ry="7" fill="#1d1f26"/>
    <!-- 白袍 -->
    <path d="M46 236 C42 186 50 146 100 134 C150 146 158 186 154 236 Z" fill="url(#${u}c)"/>
    <path d="M100 186 V236" stroke="#d6dde6" stroke-width="3"/>
    <circle cx="100" cy="200" r="3" fill="#cfd8e2"/><circle cx="100" cy="220" r="3" fill="#cfd8e2"/>
    <rect x="58" y="204" width="28" height="22" rx="5" fill="none" stroke="#dbe2ea" stroke-width="3"/>
    <rect x="114" y="204" width="28" height="22" rx="5" fill="none" stroke="#dbe2ea" stroke-width="3"/>
    <!-- 襯衫、領帶 -->
    <path d="M84 138 L100 188 L116 138 Z" fill="#fff"/>
    <path d="M95 141 H105 L109 176 L100 186 L91 176Z" fill="#b8323a"/>
    <g clip-path="url(#${u}t)" stroke="#e8a3a3" stroke-width="2.4">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M86 ${146 + i * 7} L114 ${134 + i * 7}"/>`).join('')}</g>
    <path d="M95 141 H105 L103 149 H97Z" fill="#9a2a31"/>
    <!-- 白袍翻領 -->
    <path d="M84 136 L74 150 L92 176 L100 188 L86 140Z" fill="#f6f8fb" stroke="#dbe2ea" stroke-width="2"/>
    <path d="M116 136 L126 150 L108 176 L100 188 L114 140Z" fill="#f6f8fb" stroke="#dbe2ea" stroke-width="2"/>
    <!-- 胸口繡字（藍色，只是兩行小線條） -->
    <path d="M62 156 H76 M62 162 H74" stroke="#3a5fc0" stroke-width="2.4" stroke-linecap="round"/>
    <!-- 聽診器：掛在脖子上，聽頭是小熊 -->
    <path d="M80 140 C74 160 76 172 84 180" fill="none" stroke="#5b8fd8" stroke-width="4" stroke-linecap="round"/>
    <path d="M120 140 C126 160 124 172 116 180" fill="none" stroke="#5b8fd8" stroke-width="4" stroke-linecap="round"/>
    <!-- 雙手抱胸 -->
    <path d="M48 176 C48 164 70 160 100 164 C126 167 146 166 150 178 C152 190 130 194 100 190 C70 187 48 190 48 176Z" fill="#f4f7fa" stroke="#dbe2ea" stroke-width="2"/>
    <path d="M150 170 C148 160 124 158 98 164 C76 168 56 170 54 182 C54 192 76 192 100 186 C126 180 152 182 150 170Z" fill="url(#${u}c)" stroke="#dbe2ea" stroke-width="2"/>
    <ellipse cx="62" cy="178" rx="9" ry="8" fill="${SKIN}"/><ellipse cx="138" cy="170" rx="9" ry="8" fill="${SKIN}"/>
    <rect x="124" y="181" width="9" height="8" rx="2" fill="#6a5a48"/>
    <!-- 小熊聽診頭 -->
    <circle cx="92" cy="194" r="8" fill="#ffd27a"/><circle cx="86" cy="188" r="3.4" fill="#ffd27a"/><circle cx="98" cy="188" r="3.4" fill="#ffd27a"/>
    <circle cx="89.5" cy="193" r="1.3" fill="#4a2f22"/><circle cx="94.5" cy="193" r="1.3" fill="#4a2f22"/><ellipse cx="92" cy="197" rx="2" ry="1.4" fill="#4a2f22"/>
    <!-- 脖子、耳朵、臉 -->
    <rect x="88" y="120" width="24" height="20" rx="8" fill="#f3c39c"/>
    <ellipse cx="51" cy="84" rx="9" ry="12" fill="${SKIN}"/><ellipse cx="149" cy="84" rx="9" ry="12" fill="${SKIN}"/>
    <ellipse cx="51" cy="85" rx="4" ry="6" fill="#f0b48c"/><ellipse cx="149" cy="85" rx="4" ry="6" fill="#f0b48c"/>
    <path d="M52 78 C52 40 72 22 100 22 C128 22 148 40 148 78 C148 106 132 126 100 128 C68 126 52 106 52 78Z" fill="url(#${u}f)"/>
    <!-- 頭髮：側分，前面往上翹，兩邊剪短 -->
    <path d="M50 82 C42 44 62 16 100 14 C140 14 160 40 150 82 C148 66 144 56 138 50 C124 54 98 52 80 44 C70 54 58 64 50 82Z" fill="#23202a"/>
    <path d="M78 44 C80 22 104 8 134 20 C122 18 106 22 96 30 C90 34 86 40 84 46Z" fill="#3a3544"/>
    <path d="M70 34 C78 26 88 22 98 22" fill="none" stroke="#4d4858" stroke-width="3" stroke-linecap="round"/>
    <path d="M146 60 C150 66 150 74 149 80" fill="none" stroke="#23202a" stroke-width="5" stroke-linecap="round"/>
    <path d="M54 60 C50 66 50 74 51 80" fill="none" stroke="#23202a" stroke-width="5" stroke-linecap="round"/>
    <!-- 眉毛 -->
    <path d="M68 66 C74 62 82 62 88 64" fill="none" stroke="#2b2733" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M112 64 C118 62 126 62 132 66" fill="none" stroke="#2b2733" stroke-width="3.6" stroke-linecap="round"/>
    <!-- 眼睛（微微笑的眼睛） -->
    <g class="eyes"><ellipse cx="79" cy="82" rx="4.6" ry="5.4" fill="#2b2140"/><ellipse cx="121" cy="82" rx="4.6" ry="5.4" fill="#2b2140"/>
      <circle cx="80.8" cy="80" r="1.7" fill="#fff"/><circle cx="122.8" cy="80" r="1.7" fill="#fff"/></g>
    <path d="M72 88 C76 91 82 91 86 88 M114 88 C118 91 124 91 128 88" fill="none" stroke="#e8a884" stroke-width="2" stroke-linecap="round"/>
    <!-- 細金框眼鏡 -->
    <g fill="#eaf6ff" fill-opacity=".22" stroke="#c4a46a" stroke-width="2.4">
      <rect x="64" y="70" width="31" height="23" rx="9"/><rect x="105" y="70" width="31" height="23" rx="9"/></g>
    <path d="M95 79 C98 76 102 76 105 79 M64 77 L54 75 M136 77 L146 75" fill="none" stroke="#c4a46a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M69 75 L75 72 M110 75 L116 72" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>
    <!-- 鼻子、臉頰、嘴巴（閉著嘴溫和地笑） -->
    <path d="M97 96 C99 100 103 100 104 97" fill="none" stroke="#e0a07a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="68" cy="102" rx="8" ry="5" fill="#ff9fb0" opacity=".45"/><ellipse cx="132" cy="102" rx="8" ry="5" fill="#ff9fb0" opacity=".45"/>
    <path class="mouth" d="M86 109 C92 115 108 115 114 109" fill="none" stroke="#9a4a3a" stroke-width="3.6" stroke-linecap="round"/>
    <ellipse class="mouth-o" cx="100" cy="112" rx="7" ry="5.5" fill="#c2344a"/>
  </g></svg>`;
}
