// 明星小鎮的全部角色（11/24）：開場一起歡迎、名人堂認識每一位。
// screen：在哪裡會遇到（去過那裡就「認識了」，名人堂的台座會亮）；place：中文地點，給閃閃提示用。
import { shanSvg, wanSvg } from '../art/stars.js';
import { guaSvg, dongSvg, bibiSvg } from '../art/more.js';
import { babaSvg, dadaSvg, duoduoSvg, baobaoSvg, jiujiuSvg } from '../art/town.js';
import { shaoSvg } from '../art/fun.js';
import { xieSvg } from '../art/doctor.js';
import { luoluSvg } from '../art/lake.js';
import { huahuaSvg, xiuxiuSvg, guguSvg, xinxinSvg, baibaiSvg, jiajiaSvg, zhuzhuSvg } from '../art/world.js';

export const CAST = [
  { id: 'shan', name: '閃閃', svg: shanSvg, screens: ['living', 'garbage', 'town'], color: '#ffd23f' },
  { id: 'wan', name: '晚晚', svg: wanSvg, screens: ['bedroom'], color: '#a98bff' },
  { id: 'gua', name: '呱呱', svg: guaSvg, screens: ['bath'], color: '#ffd23f' },
  { id: 'dong', name: '咚咚', svg: dongSvg, screens: ['kitchen'], color: '#7ee06a' },
  { id: 'bibi', name: '嗶嗶', svg: () => bibiSvg(), screens: ['school'], color: '#3ec7e0' },
  { id: 'baba', name: '叭叭', svg: babaSvg, screens: ['ride', 'house'], color: '#ff5d5d' },
  { id: 'duoduo', name: '多多', svg: duoduoSvg, screens: ['market'], color: '#ff8fb8' },
  { id: 'jiujiu', name: '啾啾', svg: jiujiuSvg, screens: ['park'], color: '#ffb627' },
  { id: 'baobao', name: '抱抱', svg: baobaoSvg, screens: ['clinic'], color: '#c98b5e' },
  { id: 'dada', name: '達達', svg: dadaSvg, screens: ['farm'], color: '#e0a060' },
  { id: 'shao', name: '哨哨', svg: shaoSvg, screens: ['police'], color: '#3a6fd8' },
  { id: 'huahua', name: '嘩嘩', svg: huahuaSvg, screens: ['fire'], color: '#ff4a4a' },
  { id: 'xiuxiu', name: '咻咻', svg: xiuxiuSvg, screens: ['mrt'], color: '#3ea8e0' },
  { id: 'gugu', name: '咕咕', svg: guguSvg, screens: ['library'], color: '#b48a6a' },
  { id: 'xinxin', name: '信信', svg: xinxinSvg, screens: ['post'], color: '#2fa65a' },
  { id: 'baibai', name: '白白', svg: baibaiSvg, screens: ['aquarium'], color: '#bfe6ff' },
  { id: 'jiajia', name: '夾夾', svg: jiajiaSvg, screens: ['beach'], color: '#ff7a4a' },
  { id: 'zhuzhu', name: '竹竹', svg: zhuzhuSvg, screens: ['zoo'], color: '#4fbf6e' },
  { id: 'luolu', name: '鹿鹿', svg: luoluSvg, screens: ['pier', 'thao'], color: '#f0c44a' },   // 日月潭的白鹿（11/26）
  { id: 'xie', name: '謝醫生', svg: xieSvg, screens: ['clinic'], color: '#5b8fd8' },   // 唯一的人類角色（小兒科）
];
export const CAST_BY_ID = Object.fromEntries(CAST.map((c) => [c.id, c]));
// 哪個畫面會遇到誰
export const CAST_OF_SCREEN = {};
for (const c of CAST) for (const s of c.screens) (CAST_OF_SCREEN[s] = CAST_OF_SCREEN[s] || []).push(c.id);
