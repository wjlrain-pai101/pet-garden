'use strict';
/* ==========================================================
 *  萌宠小花园 · 插画（手绘绘本风，全部原创 SVG）
 *  画法：棕色铅笔线 + 低饱和水彩色块 + “手抖”滤镜 + 纸纹
 * ========================================================== */

const C = {
  line: '#6B4F3A', cream: '#FBF5E3', paper: '#F4ECD6', white: '#FFFDF6',
  green: '#9DBB7A', lgreen: '#C3D69B', dgreen: '#6F9460', sky: '#BFDDE3', blue: '#8FB7CC',
  pink: '#EBB0A6', coral: '#E08A70', red: '#D9705F', yellow: '#EBC66B', orange: '#E6A15C',
  purple: '#B7A3CC', wood: '#C79F72', dwood: '#A87F56', sand: '#E9D3A0', gray: '#9AA3AD'
};

/* 让线条微微抖动的滤镜（三种粗细）。页面里放一份，单独导出成图片时再各带一份 */
const FILTER_DEFS =
  '<filter id="wob" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
  '<filter id="wob-s" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
  '<filter id="wob-m" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>' +
  '<filter id="wob-l" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".014" numOctaves="2" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>' +
  `<pattern id="hatch" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 6 h13" stroke="${C.line}" stroke-width="1.1" opacity=".07"/></pattern>`;
const G_OPEN = (f, w) => `<g filter="url(#${f})" stroke="${C.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" fill="none">`;

const PETS = {
  bird:    { name: '小鸟', defName: '啾啾', desc: '爱唱歌的小蓝鸟',   fav: 'millet', talent: '唱歌',   talentIcon: 'note',    eyes: [76, 124, 104], hat: [100, 62], fly: true },
  parrot:  { name: '鹦鹉', defName: '彩彩', desc: '会学说话的小机灵', fav: 'seed',   talent: '学说话', talentIcon: 'talk',    eyes: [79, 121, 76],  hat: [100, 38], fly: true },
  cat:     { name: '小猫', defName: '咪咪', desc: '爱撒娇的小橘猫',   fav: 'fish',   talent: '打滚',   talentIcon: 'sparkle', eyes: [78, 122, 86],  hat: [100, 44] },
  dog:     { name: '小狗', defName: '旺旺', desc: '忠诚的好朋友',     fav: 'bone',   talent: '转圈圈', talentIcon: 'sparkle', eyes: [78, 122, 84],  hat: [100, 42] },
  rabbit:  { name: '小兔', defName: '雪球', desc: '蹦蹦跳跳真可爱',   fav: 'carrot', talent: '蹦蹦跳', talentIcon: 'sparkle', eyes: [80, 120, 88],  hat: [100, 54] },
  hamster: { name: '仓鼠', defName: '团团', desc: '圆滚滚的小吃货',   fav: 'nut',    talent: '翻跟头', talentIcon: 'sparkle', eyes: [78, 122, 100], hat: [100, 64] }
};

/* ---------- 五官 ---------- */
function _eye(x, y, mood, r) {
  r = r || 6;
  if (mood === 'sleep') return `<path d="M${x - r - 2} ${y} q${r + 2} ${r} ${r * 2 + 4} 0"/>`;
  if (mood === 'joy' || mood === 'eat') return `<path d="M${x - r - 2} ${y + 3} q${r + 2} ${-r * 1.7} ${r * 2 + 4} 0"/>`;
  // 着凉：半睁着的眼睛；肚子疼：疼得眯成 > <
  if (mood === 'cold' || mood === 'fever') return `<path d="M${x - r} ${y - 1} a${r} ${r} 0 0 0 ${r * 2} 0z" fill="${C.line}" stroke-width="2"/>`;
  if (mood === 'tummy') { const s = x < 100 ? 1 : -1; return `<path d="M${x - s * r} ${y - r * .9} L${x + s * r * .7} ${y} L${x - s * r} ${y + r * .9}" stroke-width="3.200"/>`; }
  let s = `<g class="eye" stroke="none"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.14}" fill="${C.line}"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.42}" r="${r * 0.34}" fill="#fff"/></g>`;
  if (mood === 'sad' || mood === 'throat') {
    const left = x < 100 && mood === 'sad';
    const l = x < 100;
    s += `<path d="M${x - r - 3} ${y - r - (l ? 4 : 10)} L${x + r + 3} ${y - r - (l ? 10 : 4)}" stroke-width="2.6"/>`;
    if (left) s += `<path d="M${x - r} ${y + r + 2} q-5 9 0 12 q5 -3 0 -12z" fill="${C.sky}" stroke-width="1.6"/>`;
  }
  return s;
}
function _blush(x1, x2, y) {
  const one = x => `M${x - 6} ${y + 4} l3 -8 M${x} ${y + 4} l3 -8 M${x + 6} ${y + 4} l3 -8`;
  return `<path d="${one(x1)} ${one(x2)}" stroke="${C.coral}" stroke-width="2.2" opacity=".75"/>`;
}
function _mouth(x, y, mood) {
  if (mood === 'throat') return '';   // 嗓子疼戴着口罩，嘴巴看不见
  if (mood === 'cold' || mood === 'tummy' || mood === 'fever') return `<path d="M${x - 9} ${y + 6} q4.500 -5 9 0 q4.500 5 9 0" stroke-width="2.600"/>`;
  if (mood === 'eat') return `<ellipse cx="${x}" cy="${y + 6}" rx="7" ry="8" fill="#C9705F" stroke-width="2.4"/>`;
  if (mood === 'sad') return `<path d="M${x - 8} ${y + 9} q8 -9 16 0" stroke-width="2.6"/>`;
  if (mood === 'happy' || mood === 'joy') return `<path d="M${x - 9} ${y + 1} q9 14 18 0z" fill="#C9705F" stroke-width="2.4"/>`;
  return `<path d="M${x} ${y} q-5 7 -11 2 M${x} ${y} q5 7 11 2" stroke-width="2.6"/>`;
}

/* ---------- 最早的六只宠物（只画身体，外层统一加线条和滤镜；后来的八只在文件后面） ---------- */
const PET_DRAW = {
  bird(m) {
    const e = PETS.bird.eyes;
    const beak = m === 'eat'
      ? `<path d="M88 110 L112 110 L100 119Z" fill="${C.yellow}"/><path d="M91 123 L109 123 L100 135Z" fill="${C.orange}"/>`
      : `<path d="M89 113 L111 113 L100 129Z" fill="${C.yellow}"/>`;
    return `
      <path d="M50 138 q-32 -4 -38 -30 q24 4 44 16z" fill="#7FAEC4"/>
      <path d="M84 172 v12 m-8 0 h16 M116 172 v12 m-8 0 h16" stroke="#C98A3C" stroke-width="4.5"/>
      <ellipse cx="100" cy="118" rx="60" ry="58" fill="#9CC3D5"/>
      <ellipse cx="100" cy="141" rx="37" ry="30" fill="#F7F1DF" stroke="none"/>
      <g transform="rotate(16 42 124)"><ellipse class="wing wl" cx="42" cy="124" rx="15" ry="28" fill="#7FAEC4"/></g>
      <g transform="rotate(-16 158 124)"><ellipse class="wing wr" cx="158" cy="124" rx="15" ry="28" fill="#7FAEC4"/></g>
      <path d="M97 63 q-8 -22 -20 -24 q2 15 12 25z M100 62 q-1 -26 8 -32 q6 15 -1 32z M104 63 q9 -19 22 -17 q-5 13 -16 18z" fill="#7FAEC4"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 122)}${beak}`;
  },
  parrot(m) {
    const e = PETS.parrot.eyes, dy = m === 'eat' ? 9 : 0;
    return `
      <path d="M90 170 L80 199 L100 189 L120 199 L110 170Z" fill="${C.blue}"/>
      <path d="M84 174 v11 m-7 0 h14 M116 174 v11 m-7 0 h14" stroke="#8C8478" stroke-width="4.5"/>
      <ellipse cx="100" cy="132" rx="46" ry="50" fill="#E58B74"/>
      <ellipse cx="100" cy="148" rx="26" ry="28" fill="#F2B8A2" stroke="none"/>
      <g transform="rotate(14 54 138)"><g class="wing wl"><ellipse cx="54" cy="138" rx="16" ry="34" fill="${C.yellow}"/><ellipse cx="54" cy="149" rx="12" ry="22" fill="${C.green}" stroke="none"/><ellipse cx="54" cy="158" rx="9" ry="13" fill="${C.blue}" stroke="none"/></g></g>
      <g transform="rotate(-14 146 138)"><g class="wing wr"><ellipse cx="146" cy="138" rx="16" ry="34" fill="${C.yellow}"/><ellipse cx="146" cy="149" rx="12" ry="22" fill="${C.green}" stroke="none"/><ellipse cx="146" cy="158" rx="9" ry="13" fill="${C.blue}" stroke="none"/></g></g>
      <path d="M92 38 q-12 -22 -3 -32 q9 11 9 30z" fill="${C.yellow}"/>
      <path d="M101 36 q0 -27 13 -31 q4 15 -5 31z" fill="${C.orange}"/>
      <path d="M109 40 q13 -19 26 -14 q-5 13 -20 19z" fill="${C.yellow}"/>
      <circle cx="100" cy="76" r="44" fill="#E58B74"/>
      <ellipse cx="77" cy="77" rx="18" ry="20" fill="${C.cream}" stroke="none"/><ellipse cx="123" cy="77" rx="18" ry="20" fill="${C.cream}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(68, 132, 92)}
      <path d="M90 ${97 + dy} Q100 ${120 + dy} 110 ${97 + dy}Z" fill="${C.line}"/>
      <path d="M84 87 Q100 72 116 87 Q114 101 100 112 Q86 101 84 87Z" fill="${C.yellow}"/>`;
  },
  cat(m) {
    const e = PETS.cat.eyes;
    return `
      <path class="tail" d="M138 162 q40 -6 34 -46" stroke="${C.line}" stroke-width="19"/><path class="tail" d="M138 162 q40 -6 34 -46" stroke="#E0A765" stroke-width="13"/>
      <ellipse cx="100" cy="150" rx="44" ry="36" fill="#EDBE85"/>
      <ellipse cx="100" cy="158" rx="25" ry="23" fill="${C.cream}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${C.cream}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${C.cream}"/>
      <path d="M54 64 L49 17 L92 44Z" fill="#EDBE85"/><path d="M60 54 L58 30 L80 45Z" fill="${C.pink}" stroke="none"/>
      <path d="M146 64 L151 17 L108 44Z" fill="#EDBE85"/><path d="M140 54 L142 30 L120 45Z" fill="${C.pink}" stroke="none"/>
      <ellipse cx="100" cy="88" rx="54" ry="48" fill="#EDBE85"/>
      <path d="M100 44 v13 M87 46 l2 11 M113 46 l-2 11" stroke="#C98C4E" stroke-width="4.5"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(60, 140, 104)}
      <path d="M95 99 h10 l-5 6z" fill="${C.coral}" stroke-width="2"/>
      ${_mouth(100, 106, m)}
      <path d="M50 96 l-20 -4 M50 104 l-20 4 M150 96 l20 -4 M150 104 l20 4" stroke-width="2"/>`;
  },
  dog(m) {
    const e = PETS.dog.eyes;
    return `
      <path class="tail" d="M138 158 q32 -10 28 -42" stroke="${C.line}" stroke-width="17"/><path class="tail" d="M138 158 q32 -10 28 -42" stroke="#C99C6B" stroke-width="11"/>
      <ellipse cx="100" cy="150" rx="44" ry="36" fill="#EAD7B5"/>
      <ellipse cx="100" cy="158" rx="25" ry="23" fill="${C.cream}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${C.cream}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${C.cream}"/>
      <ellipse cx="100" cy="88" rx="52" ry="48" fill="#EAD7B5"/>
      <ellipse cx="122" cy="84" rx="18" ry="20" fill="#D6B487" stroke="none"/>
      <ellipse cx="48" cy="84" rx="16" ry="33" fill="#B58A5E" transform="rotate(12 48 84)"/>
      <ellipse cx="152" cy="84" rx="16" ry="33" fill="#B58A5E" transform="rotate(-12 152 84)"/>
      <ellipse cx="100" cy="109" rx="24" ry="18" fill="${C.cream}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(60, 140, 104)}
      <ellipse cx="100" cy="100" rx="8" ry="6" fill="${C.line}" stroke="none"/>
      ${_mouth(100, 108, m)}`;
  },
  rabbit(m) {
    const e = PETS.rabbit.eyes, w = '#FBF6EA';
    return `
      <circle cx="143" cy="164" r="12" fill="${w}"/>
      <ellipse cx="78" cy="36" rx="14" ry="38" fill="${w}" transform="rotate(-8 78 36)"/>
      <ellipse cx="78" cy="38" rx="6.5" ry="26" fill="${C.pink}" stroke="none" transform="rotate(-8 78 38)"/>
      <ellipse cx="122" cy="36" rx="14" ry="38" fill="${w}" transform="rotate(8 122 36)"/>
      <ellipse cx="122" cy="38" rx="6.5" ry="26" fill="${C.pink}" stroke="none" transform="rotate(8 122 38)"/>
      <ellipse cx="100" cy="152" rx="42" ry="34" fill="${w}"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${w}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${w}"/>
      <ellipse cx="100" cy="94" rx="50" ry="44" fill="${w}"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(62, 138, 106)}
      <ellipse cx="100" cy="102" rx="5" ry="3.5" fill="${C.coral}" stroke="none"/>
      ${m === 'normal' || m === 'sleep' ? `<rect x="96" y="112" width="8" height="7" rx="2" fill="#fff" stroke-width="1.6"/>` : ''}
      ${_mouth(100, 107, m)}`;
  },
  hamster(m) {
    const e = PETS.hamster.eyes;
    return `
      <circle cx="58" cy="60" r="17" fill="#D9A866"/><circle cx="58" cy="60" r="8" fill="${C.pink}" stroke="none"/>
      <circle cx="142" cy="60" r="17" fill="#D9A866"/><circle cx="142" cy="60" r="8" fill="${C.pink}" stroke="none"/>
      <ellipse cx="80" cy="178" rx="14" ry="7" fill="#D9A866"/><ellipse cx="120" cy="178" rx="14" ry="7" fill="#D9A866"/>
      <ellipse cx="100" cy="120" rx="62" ry="58" fill="#EFC987"/>
      <ellipse cx="100" cy="138" rx="45" ry="37" fill="${C.cream}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(55, 145, 120)}
      <ellipse cx="100" cy="112" rx="5" ry="4" fill="${C.coral}" stroke="none"/>
      ${_mouth(100, 117, m)}
      <ellipse cx="76" cy="152" rx="9" ry="7" fill="#F6E3C0" stroke-width="2.2"/><ellipse cx="124" cy="152" rx="9" ry="7" fill="#F6E3C0" stroke-width="2.2"/>`;
  }
};

/* ---------- 装饰品 ---------- */
function wearSVG(id, p) {
  const hx = p.hat[0], hy = p.hat[1], e = p.eyes;
  switch (id) {
    case 'bow':
      return `<g transform="translate(${hx + 30} ${hy + 14}) rotate(20)"><path d="M0 0 L-17 -11 L-17 11Z M0 0 L17 -11 L17 11Z" fill="${C.pink}"/><circle r="5.5" fill="${C.coral}"/></g>`;
    case 'star': {
      let pts = '';
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 6 : 14; pts += (Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r).toFixed(1) + ' '; }
      return `<g transform="translate(${hx - 32} ${hy + 18}) rotate(-15)"><polygon points="${pts}" fill="${C.yellow}"/></g>`;
    }
    case 'hat':
      return `<g transform="translate(${hx} ${hy + 6})"><path d="M-18 0 L0 -40 L18 0Z" fill="${C.purple}"/><path d="M-11 -13 L11 -13 M-6 -26 L6 -26" stroke="${C.yellow}" stroke-width="4"/><circle cy="-42" r="6.5" fill="${C.pink}"/></g>`;
    case 'crown':
      return `<g transform="translate(${hx} ${hy + 6})"><path d="M-22 0 L-26 -22 L-12 -10 L0 -27 L12 -10 L26 -22 L22 0Z" fill="${C.yellow}"/><circle cx="-12" cy="-5" r="3" fill="${C.red}" stroke="none"/><circle cx="0" cy="-8" r="3.5" fill="${C.blue}" stroke="none"/><circle cx="12" cy="-5" r="3" fill="${C.red}" stroke="none"/></g>`;
    case 'wreath': {
      const cs = [C.pink, C.yellow, C.purple, C.yellow, C.pink], ps = [[-31, 8], [-17, -2], [0, -6], [17, -2], [31, 8]];
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-33 10 Q0 -14 33 10" stroke="${C.dgreen}" stroke-width="5"/>` +
        ps.map((q, i) => `<circle cx="${q[0]}" cy="${q[1]}" r="7.5" fill="${cs[i]}" stroke-width="2"/><circle cx="${q[0]}" cy="${q[1]}" r="2.6" fill="#fff" stroke="none"/>`).join('') + '</g>';
    }
    case 'glasses':
      return `<g fill="rgba(255,255,255,.35)" stroke-width="3.2"><circle cx="${e[0]}" cy="${e[2]}" r="14.5"/><circle cx="${e[1]}" cy="${e[2]}" r="14.5"/><path d="M${e[0] + 14.5} ${e[2]} L${e[1] - 14.5} ${e[2]}"/></g>`;
    case 'beret':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M2 -24 l3 -9"/><path d="M-28 0 Q-33 -24 0 -25 Q33 -24 28 0 Q0 9 -28 0Z" fill="${C.coral}"/></g>`;
    case 'flower': {
      let pt = '';
      for (let i = 0; i < 5; i++) pt += `<ellipse cx="0" cy="-8" rx="6" ry="7.500" fill="${C.pink}" stroke-width="2" transform="rotate(${i * 72})"/>`;
      return `<g transform="translate(${hx + 32} ${hy + 16}) rotate(15)">${pt}<circle r="4.500" fill="${C.yellow}" stroke-width="2"/></g>`;
    }
    case 'cap':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M8 -3 Q42 -6 47 6 Q28 1 8 4Z" fill="#6F9DB5"/><path d="M-26 0 Q-26 -27 0 -27 Q26 -27 26 0Z" fill="${C.blue}"/><circle cy="-27" r="3.200" fill="${C.cream}" stroke-width="2"/></g>`;
    case 'wizard':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-17 -2 Q-6 -30 9 -54 Q13 -26 18 -2Z" fill="#8E7DB8"/><path d="M-33 0 Q0 -11 33 0 Q0 9 -33 0Z" fill="#7C6BA6"/><polygon points="0,-30 2,-25 7,-25 3,-21.500 4.500,-16.500 0,-19.500 -4.500,-16.500 -3,-21.500 -7,-25 -2,-25" fill="${C.yellow}" stroke-width="1.600"/></g>`;
    case 'chef':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-20 0 v-17 q-15 -4 -9 -19 q8 -13 19 -4 q10 -13 21 0 q13 -4 12 9 q0 10 -10 14 v17z" fill="${C.white}"/><path d="M-20 -7 h40" stroke-width="2"/></g>`;
    case 'leaf':
      return `<g transform="translate(${hx + 4} ${hy + 9}) rotate(-18)"><path d="M0 0 Q-22 -8 -17 -32 Q7 -27 0 0Z" fill="${C.green}"/><path d="M0 0 L-11 -23" stroke-width="2"/></g>`;
    case 'bunny':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-17 -2 Q-31 -44 -19 -50 Q-7 -46 -6 -6Z" fill="${C.white}"/><path d="M17 -2 Q31 -44 19 -50 Q7 -46 6 -6Z" fill="${C.white}"/><path d="M-15 -14 Q-21 -34 -17 -40 M15 -14 Q21 -34 17 -40" stroke="${C.pink}" stroke-width="5"/><path d="M-30 6 Q0 -12 30 6" stroke-width="9"/><path d="M-30 6 Q0 -12 30 6" stroke="${C.coral}" stroke-width="5"/></g>`;
    case 'sunglasses':
      return `<g fill="#5B4636" stroke-width="3"><path d="M${e[0] + 15} ${e[2] - 6} L${e[1] - 15} ${e[2] - 6}"/><path d="M${e[0] - 15} ${e[2] - 9} h30 v8 q0 13 -15 13 q-15 0 -15 -13z"/><path d="M${e[1] - 15} ${e[2] - 9} h30 v8 q0 13 -15 13 q-15 0 -15 -13z"/></g><path d="M${e[0] - 9} ${e[2] - 2} l6 -3 M${e[1] - 9} ${e[2] - 2} l6 -3" stroke="#fff" stroke-width="2.400"/>`;
    case 'headphones':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-40 34 Q-42 -12 0 -12 Q42 -12 40 34" stroke-width="9.500"/><path d="M-40 34 Q-42 -12 0 -12 Q42 -12 40 34" stroke="#8C7B8C" stroke-width="5"/><rect x="-51" y="22" width="17" height="27" rx="7.500" fill="${C.coral}"/><rect x="34" y="22" width="17" height="27" rx="7.500" fill="${C.coral}"/></g>`;
    case 'santa':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-24 -2 Q-22 -36 8 -42 Q30 -40 34 -18 Q26 -26 18 -22 Q24 -12 24 -2Z" fill="${C.red}"/><rect x="-30" y="-8" width="60" height="13" rx="6.500" fill="${C.white}"/><circle cx="35" cy="-14" r="7" fill="${C.white}"/></g>`;
    case 'halo':
      return `<g transform="translate(${hx} ${hy - 18})"><ellipse rx="27" ry="8" stroke-width="9.500"/><ellipse rx="27" ry="8" stroke="${C.yellow}" stroke-width="5"/></g>`;
    case 'helmet':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-31 8 Q-36 -31 0 -31 Q36 -31 31 8Z" fill="${C.red}"/><path d="M0 -30 V7" stroke="#fff" stroke-width="8"/><path d="M-31 8 Q-36 -31 0 -31 Q36 -31 31 8Z"/><path d="M-35 8 H35" stroke-width="5.500"/></g>`;
    case 'pirate':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-40 5 Q-32 -34 0 -38 Q32 -34 40 5 Q0 -10 -40 5Z" fill="#5B4636"/><path d="M-13 -26 L13 -9 M13 -26 L-13 -9" stroke="#fff" stroke-width="3.200"/><circle cy="-19" r="7.500" fill="#fff" stroke-width="1.600"/><path d="M-3 -19 v.100 M3 -19 v.100" stroke-width="2.800"/></g>`;
    case 'gradcap':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-23 -14 v14 q23 10 46 0 v-14" fill="#5B4636"/><path d="M0 -36 L42 -21 L0 -6 L-42 -21Z" fill="#5B4636"/><path d="M31 -18 v21" stroke="${C.yellow}" stroke-width="3.200"/><circle cx="31" cy="6" r="4.500" fill="${C.yellow}"/></g>`;
    case 'nightcap':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-24 -2 Q-22 -36 8 -42 Q30 -40 34 -18 Q26 -26 18 -22 Q24 -12 24 -2Z" fill="${C.blue}"/><path d="M-8 -20 v.100 M6 -30 v.100 M4 -14 v.100 M18 -32 v.100" stroke="#fff" stroke-width="3.600"/><rect x="-30" y="-8" width="60" height="13" rx="6.500" fill="${C.white}"/><circle cx="35" cy="-14" r="7" fill="${C.yellow}"/></g>`;
    case 'acornhat':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M0 -30 q2 -9 9 -11" stroke-width="4"/><path d="M-30 2 Q-32 -30 0 -30 Q32 -30 30 2 Q0 -8 -30 2Z" fill="${C.dwood}"/><path d="M-20 -12 l6 6 M-6 -20 l6 6 M8 -14 l6 6 M18 -4 l4 4 M-12 -4 l5 5 M0 -8 l5 5" stroke-width="1.600"/></g>`;
    case 'butterfly':
      return `<g transform="translate(${hx + 30} ${hy + 14}) rotate(18)"><path d="M0 0 Q-20 -22 -22 -4 Q-22 8 0 0Z M0 0 Q20 -22 22 -4 Q22 8 0 0Z" fill="${C.purple}"/><path d="M0 0 Q-14 6 -12 14 Q-4 16 0 0Z M0 0 Q14 6 12 14 Q4 16 0 0Z" fill="${C.pink}"/><path d="M0 -8 v18" stroke-width="3.200"/></g>`;
    case 'sailor':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-28 0 Q-36 -22 0 -24 Q36 -22 28 0Z" fill="${C.white}"/><path d="M-27 -3 Q0 6 27 -3 L27 3 Q0 12 -27 3Z" fill="${C.blue}"/><path d="M22 4 l9 12 M26 2 l12 8" stroke="${C.blue}" stroke-width="4"/></g>`;
    case 'shellclip':
      return `<g transform="translate(${hx - 32} ${hy + 18}) rotate(-15)"><path d="M0 12 Q-20 4 -14 -10 Q0 -20 14 -10 Q20 4 0 12Z" fill="${C.sky}"/><path d="M0 12 V-14 M0 12 L-10 -9 M0 12 L10 -9" stroke-width="1.600"/></g>`;
    case 'earmuff':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-40 34 Q-42 -12 0 -12 Q42 -12 40 34" stroke-width="8"/><path d="M-40 34 Q-42 -12 0 -12 Q42 -12 40 34" stroke="${C.blue}" stroke-width="4"/><circle cx="-43" cy="36" r="13" fill="${C.white}"/><circle cx="43" cy="36" r="13" fill="${C.white}"/></g>`;
    case 'knitcap':
      return `<g transform="translate(${hx} ${hy + 10})"><circle cy="-36" r="8" fill="${C.white}"/><path d="M-27 0 Q-28 -30 0 -30 Q28 -30 27 0Z" fill="${C.coral}"/><path d="M-24 -14 Q0 -22 24 -14" stroke="${C.cream}" stroke-width="4"/><rect x="-30" y="-6" width="60" height="11" rx="5.500" fill="${C.cream}"/><path d="M-18 -5 v9 M-6 -5 v9 M6 -5 v9 M18 -5 v9" stroke-width="1.400"/></g>`;
    case 'cowboy':
      return `<g transform="translate(${hx} ${hy + 12})"><path d="M-44 -2 Q-30 8 0 4 Q30 8 44 -2 Q34 -12 22 -8 L18 -30 Q10 -36 0 -28 Q-10 -36 -18 -30 L-22 -8 Q-34 -12 -44 -2Z" fill="${C.dwood}"/><path d="M-21 -12 Q0 -6 21 -12" stroke="${C.yellow}" stroke-width="4"/></g>`;
    case 'explorer':
      return `<g transform="translate(${hx} ${hy + 12})"><path d="M-38 0 Q0 -10 38 0 Q0 8 -38 0Z" fill="#D9C79A"/><path d="M-25 -3 Q-25 -30 0 -30 Q25 -30 25 -3" fill="${C.sand}"/><path d="M-25 -8 Q0 -2 25 -8" stroke="${C.dwood}" stroke-width="4"/><circle cy="-31" r="3" fill="${C.dwood}" stroke-width="1.600"/></g>`;
    case 'unicornhorn':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-30 6 Q0 -12 30 6" stroke-width="8"/><path d="M-30 6 Q0 -12 30 6" stroke="${C.pink}" stroke-width="4"/><path d="M-9 -4 L0 -46 L9 -4Z" fill="${C.yellow}"/><path d="M-6 -16 l10 -5 M-4 -27 l7 -4" stroke-width="1.600"/><circle cx="-17" cy="-1" r="5" fill="${C.purple}" stroke-width="1.600"/><circle cx="17" cy="-1" r="5" fill="${C.blue}" stroke-width="1.600"/></g>`;
    case 'antenna':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-30 6 Q0 -12 30 6" stroke-width="8"/><path d="M-30 6 Q0 -12 30 6" stroke="#9BE0B8" stroke-width="4"/><path d="M-14 -4 q-6 -16 -12 -26 M14 -4 q6 -16 12 -26" stroke-width="2.600"/><circle cx="-27" cy="-33" r="7" fill="#9BE0B8"/><circle cx="27" cy="-33" r="7" fill="#9BE0B8"/></g>`;
    case 'tophat':
      return `<g transform="translate(${hx} ${hy + 10})"><ellipse rx="36" ry="7" fill="#5B4636"/><path d="M-21 -2 V-36 Q0 -42 21 -36 V-2 Q0 4 -21 -2Z" fill="#5B4636"/><path d="M-21 -12 Q0 -6 21 -12" stroke="${C.red}" stroke-width="5"/></g>`;
    case 'starglasses':
      return `<g stroke-width="2.600">${_star(e[0], e[2], 19, 10.5, 'rgba(235,198,107,.5)')}${_star(e[1], e[2], 19, 10.5, 'rgba(235,198,107,.5)')}<path d="M${e[0] + 13} ${e[2] - 2} L${e[1] - 13} ${e[2] - 2}"/></g>`;
    case 'ladybug':
      return `<g transform="translate(${hx + 30} ${hy + 14}) rotate(20)"><circle cy="-12" r="5.500" fill="${C.line}" stroke="none"/><ellipse rx="14" ry="12" fill="${C.red}"/><path d="M0 -11 v23" stroke-width="2"/><circle cx="-6" cy="-3" r="2.400" fill="${C.line}" stroke="none"/><circle cx="6" cy="-3" r="2.400" fill="${C.line}" stroke="none"/><circle cx="-5" cy="6" r="2" fill="${C.line}" stroke="none"/><circle cx="5" cy="6" r="2" fill="${C.line}" stroke="none"/></g>`;
    case 'crabhat':
      return `<g transform="translate(${hx} ${hy + 8})"><path d="M-22 -8 q-10 -6 -8 -16 M22 -8 q10 -6 8 -16" stroke-width="3"/><circle cx="-31" cy="-27" r="6.500" fill="${C.red}"/><circle cx="31" cy="-27" r="6.500" fill="${C.red}"/><ellipse cy="-8" rx="25" ry="14" fill="${C.red}"/><path d="M-8 -12 v.100 M8 -12 v.100" stroke-width="4.500"/><path d="M-6 -4 q6 4 12 0" stroke-width="2"/></g>`;
    case 'reindeer': {
      const horn = 'M-14 -4 Q-20 -24 -30 -32 M-19 -18 Q-30 -18 -36 -24 M14 -4 Q20 -24 30 -32 M19 -18 Q30 -18 36 -24';
      return `<g transform="translate(${hx} ${hy + 10})"><path d="${horn}" stroke-width="8.500"/><path d="${horn}" stroke="#C99A5E" stroke-width="4.500"/><path d="M-30 6 Q0 -12 30 6" stroke-width="8"/><path d="M-30 6 Q0 -12 30 6" stroke="${C.red}" stroke-width="4"/></g>`;
    }
    case 'pharaoh':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-30 32 L-35 -6 Q-30 -30 0 -30 Q30 -30 35 -6 L30 32 L21 4 Q0 -4 -21 4Z" fill="${C.yellow}"/><path d="M-26 -15 Q0 -23 26 -15 M-32 -2 l9 3 M32 -2 l-9 3 M-31 12 h8 M31 12 h-8" stroke="${C.blue}" stroke-width="4"/><circle cy="-25" r="4" fill="${C.red}" stroke-width="1.600"/></g>`;
    case 'mooncrown':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-30 6 Q0 -12 30 6" stroke-width="8"/><path d="M-30 6 Q0 -12 30 6" stroke="${C.purple}" stroke-width="4"/><path d="M4 -36 A15 15 0 1 0 15 -9 A12 12 0 0 1 4 -36Z" fill="${C.yellow}"/><g stroke-width="1.600">${_star(-19, -6, 5.500, 2.400, C.yellow)}${_star(22, 0, 4.500, 2, C.yellow)}</g></g>`;
    case 'jester':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-26 0 Q-30 -22 -44 -34 Q-18 -38 0 -14 L0 0Z" fill="${C.coral}"/><path d="M26 0 Q30 -22 44 -34 Q18 -38 0 -14 L0 0Z" fill="${C.blue}"/><circle cx="-45" cy="-35" r="5" fill="${C.yellow}"/><circle cx="45" cy="-35" r="5" fill="${C.yellow}"/><rect x="-28" y="-5" width="56" height="10" rx="5" fill="${C.yellow}"/></g>`;
    case 'catears':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-26 -2 L-22 -32 L-6 -10Z" fill="${C.orange}"/><path d="M26 -2 L22 -32 L6 -10Z" fill="${C.orange}"/><path d="M-21 -8 L-20 -23 L-12 -11Z M21 -8 L20 -23 L12 -11Z" fill="${C.pink}" stroke="none"/><path d="M-30 6 Q0 -12 30 6" stroke-width="8"/><path d="M-30 6 Q0 -12 30 6" stroke="#5B4636" stroke-width="4"/></g>`;
    case 'strawberryhat':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-28 2 Q-30 -32 0 -32 Q30 -32 28 2 Q0 -6 -28 2Z" fill="${C.red}"/><path d="M-12 -14 v.100 M2 -20 v.100 M14 -12 v.100 M-2 -8 v.100 M-18 -4 v.100 M20 -2 v.100" stroke="${C.yellow}" stroke-width="3"/><path d="M0 -30 q-12 -2 -14 -10 q8 0 14 6 q0 -8 2 -12 q4 4 2 12 q6 -6 12 -6 q0 8 -16 10z" fill="${C.green}" stroke-width="1.800"/></g>`;
    case 'detective':
      return `<g transform="translate(${hx} ${hy + 10})"><path d="M-26 -3 Q-41 -3 -45 6 Q-34 5 -26 5Z M26 -3 Q41 -3 45 6 Q34 5 26 5Z" fill="#8C6B4A"/><path d="M-26 2 Q-28 -28 0 -28 Q28 -28 26 2 Q0 -6 -26 2Z" fill="#B08A64"/><path d="M-12 -26 v21 M12 -26 v21 M-26 -13 h52" stroke="#8C6B4A" stroke-width="2"/><circle cy="-29" r="3.500" fill="#8C6B4A" stroke-width="1.600"/></g>`;
    case 'tiara':
      return `<g transform="translate(${hx} ${hy + 8})"><path d="M-22 2 Q0 -8 22 2 L26 -7 L16 -6 L12 -19 L5 -8 L0 -25 L-5 -8 L-12 -19 L-16 -6 L-26 -7Z" fill="#F3DC8A"/><circle cy="-10" r="3" fill="${C.pink}" stroke-width="1.400"/><circle cx="-11" cy="-5" r="2" fill="${C.sky}" stroke="none"/><circle cx="11" cy="-5" r="2" fill="${C.sky}" stroke="none"/></g>`;
    case 'strawhat':
      return `<g transform="translate(${hx} ${hy + 12})"><ellipse rx="40" ry="10" fill="${C.sand}"/><path d="M-23 -1 Q-23 -28 0 -28 Q23 -28 23 -1" fill="${C.sand}"/><path d="M-22.5 -8 Q0 0 22.5 -8" stroke="${C.coral}" stroke-width="5"/></g>`;
  }
  return '';
}
function petInner(type, mood, wear) {
  if (!PETS[type]) type = 'bird';
  const p = PETS[type];
  let extra = '';
  if (mood === 'fever')  // 发烧：头上顶一个冰袋，脸蛋红红的
    extra = `<g transform="translate(${p.hat[0]} ${p.hat[1] + 8})"><path d="M-7 -22 l-4 -9 h22 l-4 9" fill="${C.sky}"/><path d="M-21 -1 Q-24 -23 0 -23 Q24 -23 21 -1 Q0 7 -21 -1Z" fill="${C.sky}"/><path d="M-10 -12 q3 -5 8 -6" stroke="#fff" stroke-width="2.400"/></g>`;
  if (mood === 'tummy')  // 头顶冒出一个晕乎乎的小圈
    extra = `<path d="M${p.hat[0] + 44} ${p.hat[1] - 2} m-9 0 a9 9 0 1 1 9 9 a5.500 5.500 0 1 1 -5.500 -5.500" stroke-width="2.600"/>`;
  const e0 = p.eyes[0], e1 = p.eyes[1], cx = (e0 + e1) / 2, ey = p.eyes[2];
  if (mood === 'fever')
    extra += `<circle cx="${e0 - 9}" cy="${ey + 17}" r="10" fill="${C.red}" opacity=".4" stroke="none"/><circle cx="${e1 + 9}" cy="${ey + 17}" r="10" fill="${C.red}" opacity=".4" stroke="none"/>`;
  if (mood === 'cold')   // 着凉：流鼻涕，冷得发抖
    extra = `<path d="M${cx + 7} ${ey + 20} q-5 10 0 13 q5 -3 0 -13z" fill="${C.sky}" stroke-width="1.800"/>` +
      `<path d="M${e0 - 34} ${ey - 8} l-9 -4 M${e0 - 37} ${ey + 5} l-10 0 M${e1 + 34} ${ey - 8} l9 -4 M${e1 + 37} ${ey + 5} l10 0" stroke="${C.blue}" stroke-width="2.600"/>`;
  if (mood === 'throat') // 嗓子疼：戴口罩
    extra = `<path d="M${cx - 23} ${ey + 14} L${e0 - 30} ${ey + 4} M${cx + 23} ${ey + 14} L${e1 + 30} ${ey + 4}" stroke-width="2"/>` +
      `<rect x="${cx - 24}" y="${ey + 9}" width="48" height="29" rx="10" fill="${C.white}"/><path d="M${cx - 14} ${ey + 19} h28 M${cx - 14} ${ey + 28} h28" stroke="${C.blue}" stroke-width="1.600"/>`;
  return PET_DRAW[type](mood || 'normal') + (wear ? wearSVG(wear, p) : '') + extra;
}
function petSVG(type, mood, wear, forImage) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"${forImage ? ` width="240" height="240"><defs>${FILTER_DEFS}</defs>` : '>'}` +
    `<ellipse cx="100" cy="188" rx="50" ry="6" fill="${C.line}" opacity=".13"/>` +
    G_OPEN('wob', 3) + petInner(type, mood, wear) + '</g></svg>';
}

/* ---------- 来做客的小伙伴 ---------- */
const FRIENDS = {
  snail: { name: '蜗牛慢慢', line: '我爬了好久才到呢~' },
  hedgehog: { name: '刺猬栗子', line: '闻到好香的味道啦！' },
  duck: { name: '小鸭嘎嘎', line: '嘎嘎！来找你玩啦~' }
};
const FRIEND_DRAW = {
  snail: () => `
    <path d="M16 84 Q8 62 20 46 Q31 40 35 55 Q37 70 52 72 L100 72 Q114 76 108 84Z" fill="${C.lgreen}"/>
    <circle cx="74" cy="52" r="29" fill="${C.yellow}"/>
    <path d="M74 52 m-15 0 a15 15 0 1 1 15 15 a9 9 0 1 1 -9 -9" stroke-width="2.4"/>
    <path d="M21 46 l-7 -17 M30 43 l2 -17"/><circle cx="14" cy="27" r="3.5" fill="${C.line}" stroke="none"/><circle cx="32" cy="24" r="3.5" fill="${C.line}" stroke="none"/>
    <path d="M19 64 q5 5 10 0" stroke-width="2.2"/><path d="M30 60 l2 -5 M35 60 l2 -5" stroke="${C.coral}" stroke-width="2"/>`,
  hedgehog: () => `
    <path d="M30 80 L20 64 L32 61 L25 45 L38 47 L36 30 L49 37 L53 22 L63 33 L73 20 L79 35 L91 27 L93 43 L105 41 L101 56 L111 62 L103 80Z" fill="${C.dwood}"/>
    <path d="M10 71 Q19 50 44 51 Q69 54 76 80 L28 82 Q13 82 10 71Z" fill="${C.cream}"/>
    <circle cx="10" cy="70" r="4.5" fill="${C.line}" stroke="none"/><ellipse cx="33" cy="63" rx="3.6" ry="4.2" fill="${C.line}" stroke="none"/>
    <path d="M20 75 q5 4 10 -1" stroke-width="2.2"/><path d="M40 72 l2 -5 M45 72 l2 -5" stroke="${C.coral}" stroke-width="2"/>
    <ellipse cx="42" cy="85" rx="9" ry="4.5" fill="#E9D3B0" stroke-width="2.2"/><ellipse cx="80" cy="85" rx="9" ry="4.5" fill="#E9D3B0" stroke-width="2.2"/>`,
  duck: () => `
    <path d="M92 60 l18 -12 l-5 20z" fill="#F3D98B"/>
    <ellipse cx="64" cy="66" rx="36" ry="22" fill="#F3D98B"/>
    <circle cx="36" cy="40" r="21" fill="#F3D98B"/>
    <path d="M18 40 l-15 5 l15 7z" fill="${C.orange}"/>
    <ellipse cx="33" cy="36" rx="3.6" ry="4.2" fill="${C.line}" stroke="none"/>
    <path d="M40 47 l2 -5 M45 47 l2 -5" stroke="${C.coral}" stroke-width="2"/>
    <path d="M54 62 q16 -9 28 2 q-12 12 -28 -2z" fill="${C.yellow}"/>
    <path d="M56 87 v6 m-6 0 h12 M76 87 v6 m-6 0 h12" stroke="${C.orange}" stroke-width="3.5"/>`
};
function friendSVG(id, forImage) {
  if (!FRIEND_DRAW[id]) id = 'snail';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100"${forImage ? ` width="240" height="200"><defs>${FILTER_DEFS}</defs>` : '>'}` +
    `<ellipse cx="62" cy="92" rx="42" ry="4" fill="${C.line}" opacity=".12"/>` + G_OPEN('wob-m', 2.6) + FRIEND_DRAW[id]() + '</g></svg>';
}

/* ---------- 手绘小图标（48×48） ---------- */
function _star(cx, cy, R, r, fill) {
  let pts = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; pts += (cx + Math.cos(a) * q).toFixed(1) + ',' + (cy + Math.sin(a) * q).toFixed(1) + ' '; }
  return `<polygon points="${pts}" fill="${fill}"/>`;
}
function _petals(cx, cy, n, d, rx, ry, fill) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<ellipse cx="${cx}" cy="${cy - d}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`;
  return s;
}
const _stem = `<path d="M24 46 V26"/><path d="M24 40 q-10 -1 -12 -9 q10 0 12 9z" fill="${C.green}"/><path d="M24 36 q10 -1 12 -9 q-10 0 -12 9z" fill="${C.green}"/>`;
const _cloud = f => `<path d="M12 33 a8 8 0 0 1 2 -16 a11 11 0 0 1 21 -1 a8.5 8.5 0 0 1 1 17z" fill="${f}"/>`;
const _heart = f => `<path d="M24 41 Q4 26 9 14 Q15 5 24 15 Q33 5 39 14 Q44 26 24 41Z" fill="${f}"/>`;
const ICONS = {
  acorn: `<path d="M12 21 Q12 39 24 44 Q36 39 36 21 Q24 27 12 21Z" fill="#D9A866"/><path d="M9 20 Q24 3 39 20 Q24 28 9 20Z" fill="${C.dwood}"/><path d="M24 10 v-6"/><path d="M18 30 q1 7 5 9" stroke="#fff" stroke-width="2" opacity=".7"/>`,
  heart: _heart(C.pink),
  heartbreak: _heart(C.pink) + `<path d="M24 15 l-5 8 l8 4 l-4 9"/>`,
  bowl: `<path d="M10 24 q14 -20 28 0z" fill="${C.white}"/><path d="M6 24 h36 q-2 17 -18 17 q-16 0 -18 -17z" fill="${C.coral}"/>`,
  drop: `<path d="M24 5 Q10 24 10 31 a14 14 0 0 0 28 0 Q38 24 24 5Z" fill="${C.sky}"/><path d="M17 31 q1 6 6 7" stroke="#fff" stroke-width="2.2"/>`,
  bolt: `<path d="M27 4 L11 27 h10 l-3 17 L37 20 h-11z" fill="${C.yellow}"/>`,
  tasks: `<rect x="9" y="8" width="30" height="36" rx="4" fill="${C.cream}"/><rect x="17" y="4" width="14" height="8" rx="3" fill="${C.wood}"/><path d="M15 21 h18 M15 28 h18 M15 35 h11"/>`,
  note: `<path d="M18 36 V10 l18 -4 v24"/><ellipse cx="13" cy="36" rx="6" ry="4.5" fill="${C.purple}"/><ellipse cx="31" cy="30" rx="6" ry="4.5" fill="${C.purple}"/>`,
  mute: `<path d="M18 36 V10 l18 -4 v24"/><ellipse cx="13" cy="36" rx="6" ry="4.5" fill="#ccc"/><ellipse cx="31" cy="30" rx="6" ry="4.5" fill="#ccc"/><path d="M6 6 L42 42" stroke="${C.red}" stroke-width="3.4"/>`,
  gear: `<path d="M24 5 v8 M24 35 v8 M5 24 h8 M35 24 h8 M10.5 10.5 l5.5 5.5 M32 32 l5.5 5.5 M37.500 10.5 l-5.5 5.5 M16 32 l-5.5 5.5" stroke-width="5"/><circle cx="24" cy="24" r="11" fill="${C.wood}"/><circle cx="24" cy="24" r="4" fill="${C.cream}"/>`,
  apple: `<path d="M24 16 Q12 8 8 22 Q6 38 18 43 Q24 45 30 43 Q42 38 40 22 Q36 8 24 16Z" fill="${C.red}"/><path d="M24 16 q0 -7 4 -10"/><path d="M27 10 q8 -6 12 0 q-6 6 -12 0z" fill="${C.green}"/>`,
  tub: `<circle cx="14" cy="18" r="5.5" fill="${C.sky}"/><circle cx="24" cy="14" r="7" fill="${C.sky}"/><circle cx="34" cy="18" r="5.5" fill="${C.sky}"/><path d="M4 24 h40 q0 14 -9 16 h-22 q-9 -2 -9 -16z" fill="${C.white}"/><path d="M14 41 v4 M34 41 v4"/>`,
  moon: `<path d="M31 5 A19.500 19.500 0 1 0 43 31 A16 16 0 0 1 31 5Z" fill="${C.yellow}"/>` + _star(38, 11, 5, 2.2, C.cream),
  sun: `<path d="M24 3 v6 M24 39 v6 M3 24 h6 M39 24 h6 M9 9 l4.500 4.500 M34.500 34.500 l4.500 4.500 M39 9 l-4.500 4.500 M13.500 34.500 l-4.500 4.500" stroke="${C.orange}" stroke-width="3"/><circle cx="24" cy="24" r="10" fill="${C.yellow}"/>`,
  bow: `<path d="M24 24 L7 13 V35Z M24 24 L41 13 V35Z" fill="${C.pink}"/><circle cx="24" cy="24" r="5" fill="${C.coral}"/>`,
  backpack: `<path d="M18 14 q0 -9 6 -9 q6 0 6 9"/><rect x="9" y="13" width="30" height="31" rx="10" fill="${C.green}"/><path d="M9 23 h30"/><rect x="15" y="28" width="18" height="11" rx="4" fill="${C.lgreen}"/>`,
  talk: `<path d="M8 8 h32 q4 0 4 4 v17 q0 4 -4 4 h-16 l-9 9 v-9 h-7 q-4 0 -4 -4 v-17 q0 -4 4 -4z" fill="${C.cream}"/><path d="M15 21 h.1 M24 21 h.1 M33 21 h.1" stroke-width="4"/>`,
  sparkle: `<path d="M24 4 Q26 21 44 24 Q26 27 24 44 Q22 27 4 24 Q22 21 24 4Z" fill="${C.yellow}"/>`,
  star: _star(24, 25, 20, 9, C.yellow),
  house: `<rect x="10" y="23" width="28" height="20" fill="${C.cream}"/><path d="M4 25 L24 6 L44 25Z" fill="${C.coral}"/><path d="M20 43 v-9 a4 4 0 0 1 8 0 v9" fill="${C.wood}"/>`,
  garden: _stem + _petals(24, 15, 6, 7, 4.500, 5.500, C.pink) + `<circle cx="24" cy="15" r="4" fill="${C.yellow}"/>`,
  kite: `<path d="M24 4 L39 20 L24 38 L9 20Z" fill="${C.coral}"/><path d="M24 4 V38 M9 20 H39" stroke-width="1.8"/><path d="M24 38 q-7 3 -2 8"/>`,
  basket: `<path d="M13 20 Q24 -2 35 20"/><path d="M6 20 h36 l-4 23 h-28z" fill="${C.wood}"/><path d="M9 28 h30 M11 36 h26" stroke-width="1.8"/>`,
  book: `<path d="M24 12 Q14 6 5 10 V40 Q14 36 24 42 Q34 36 43 40 V10 Q34 6 24 12Z" fill="${C.cream}"/><path d="M24 12 V42"/><path d="M10 18 q5 -2 9 0 M10 25 q5 -2 9 0 M29 18 q5 -2 9 0" stroke-width="1.8"/>`,
  mail: `<rect x="5" y="11" width="38" height="27" rx="3" fill="${C.cream}"/><path d="M5 13 L24 28 L43 13"/><rect x="32" y="27" width="7" height="7" fill="${C.coral}" stroke-width="1.6"/>`,
  gift: `<rect x="8" y="20" width="32" height="23" rx="2" fill="${C.coral}"/><rect x="5" y="13" width="38" height="9" rx="2" fill="${C.pink}"/><path d="M24 13 V43" stroke="${C.yellow}" stroke-width="5"/><path d="M24 13 q-10 -12 -13 -3 q3 4 13 3z M24 13 q10 -12 13 -3 q-3 4 -13 3z" fill="${C.yellow}"/>`,
  eye: `<path d="M3 24 Q24 5 45 24 Q24 43 3 24Z" fill="${C.white}"/><circle cx="24" cy="24" r="8" fill="${C.blue}"/><circle cx="24" cy="24" r="3" fill="${C.line}" stroke="none"/>`,
  trophy: `<path d="M14 12 q-10 0 -8 8 q2 6 9 6 M34 12 q10 0 8 8 q-2 6 -9 6"/><path d="M13 7 h22 v11 q0 13 -11 13 q-11 0 -11 -13z" fill="${C.yellow}"/><path d="M24 31 v7"/><path d="M15 43 q0 -5 9 -5 q9 0 9 5z" fill="${C.wood}"/>`,
  can: `<path d="M17 20 L4 9 l4 -4 L22 16z" fill="${C.blue}"/><path d="M38 20 q9 0 8 9 q-1 8 -9 8"/><path d="M15 15 h24 v24 a5 5 0 0 1 -5 5 h-14 a5 5 0 0 1 -5 -5z" fill="${C.sky}"/>`,
  // 食物
  millet: `<path d="M24 46 V16"/><ellipse cx="24" cy="9" rx="4.5" ry="6.5" fill="${C.yellow}"/><ellipse cx="17" cy="18" rx="4.5" ry="6" fill="${C.yellow}" transform="rotate(-25 17 18)"/><ellipse cx="31" cy="18" rx="4.5" ry="6" fill="${C.yellow}" transform="rotate(25 31 18)"/><ellipse cx="17" cy="29" rx="4.5" ry="6" fill="${C.yellow}" transform="rotate(-25 17 29)"/><ellipse cx="31" cy="29" rx="4.5" ry="6" fill="${C.yellow}" transform="rotate(25 31 29)"/>`,
  seed: `<path d="M17 6 Q4 26 17 42 Q30 26 17 6Z" fill="${C.cream}" transform="rotate(-12 17 24)"/><path d="M16 12 v24" stroke-width="1.8" transform="rotate(-12 17 24)"/><path d="M33 10 Q22 27 33 43 Q44 27 33 10Z" fill="#8C7B68" transform="rotate(12 33 26)"/>`,
  nut: `<path d="M24 5 Q8 14 7 28 Q8 43 24 43 Q40 43 41 28 Q40 14 24 5Z" fill="${C.dwood}"/><path d="M9 34 Q24 26 39 34 Q36 43 24 43 Q12 43 9 34Z" fill="#E9D3B0"/>`,
  fish: `<path d="M5 24 Q18 8 34 20 L44 12 V36 L34 28 Q18 40 5 24Z" fill="${C.blue}"/><circle cx="14" cy="22" r="2.2" fill="${C.line}" stroke="none"/><path d="M22 17 q4 7 0 14" stroke-width="1.8"/>`,
  bone: `<path d="M16 19 A6 6 0 1 0 10 25 A6 6 0 1 0 16 31 L32 31 A6 6 0 1 0 38 25 A6 6 0 1 0 32 19 Z" fill="#F1E2C4"/>`,
  carrot: `<path d="M31 15 Q30 4 38 3 Q40 10 33 16Z" fill="${C.green}"/><path d="M34 17 Q42 10 46 16 Q42 22 35 19Z" fill="${C.green}"/><path d="M30 14 Q40 20 34 28 L10 45 L20 18 Q24 12 30 14Z" fill="${C.orange}"/><path d="M24 24 l4 3 M18 32 l4 3" stroke-width="1.8"/>`,
  corn: `<path d="M24 4 Q34 14 33 30 Q32 41 24 44 Q16 41 15 30 Q14 14 24 4Z" fill="${C.yellow}"/><path d="M18 15 h12 M16.500 23 h15 M16.500 31 h15 M24 7 v35" stroke-width="1.5"/><path d="M16 34 Q6 30 6 17 Q16 22 20 40Z" fill="${C.green}"/><path d="M32 34 Q42 30 42 17 Q32 22 28 40Z" fill="${C.green}"/>`,
  strawberry: `<path d="M24 13 Q41 9 40 24 Q38 38 24 45 Q10 38 8 24 Q7 9 24 13Z" fill="${C.red}"/><path d="M24 14 l-10 -6 l8 -1 l2 -5 l2 5 l8 1z" fill="${C.green}"/><path d="M17 24 v.1 M24 28 v.1 M31 24 v.1 M20 34 v.1 M28 35 v.1" stroke="${C.cream}" stroke-width="3"/>`,
  cake: `<path d="M12 27 h24 l-4 17 h-16z" fill="${C.wood}"/><path d="M17 30 l1 11 M24 30 v12 M31 30 l-1 11" stroke-width="1.6"/><path d="M10 27 Q7 17 17 16 Q24 6 31 16 Q41 17 38 27Z" fill="${C.pink}"/><circle cx="24" cy="9" r="4.500" fill="${C.red}"/>`,
  orange: `<circle cx="24" cy="26" r="17" fill="${C.orange}"/><path d="M24 9 q6 -7 12 -2 q-5 6 -12 2z" fill="${C.green}"/>`,
  pear: `<path d="M24 8 Q31 8 31 18 Q40 26 38 35 Q34 45 24 45 Q14 45 10 35 Q8 26 17 18 Q17 8 24 8Z" fill="${C.lgreen}"/><path d="M24 8 q1 -4 4 -5"/>`,
  peach: `<path d="M24 12 Q40 6 41 24 Q40 40 24 44 Q8 40 7 24 Q8 6 24 12Z" fill="${C.pink}"/><path d="M24 12 q-4 14 0 30" stroke-width="1.8"/><path d="M25 11 q7 -8 13 -3 q-5 7 -13 3z" fill="${C.green}"/>`,
  // 花和作物
  sunflower: _stem + _petals(24, 16, 10, 9, 3.6, 5.500, C.yellow) + `<circle cx="24" cy="16" r="6.500" fill="${C.dwood}"/>`,
  tulip: _stem + `<path d="M14 8 Q13 27 24 27 Q35 27 34 8 L29 15 L24 6 L19 15Z" fill="${C.pink}"/>`,
  rose: _stem + `<circle cx="24" cy="16" r="12" fill="${C.red}"/><path d="M24 16 m-6 0 a6 6 0 1 1 6 6 a3.500 3.500 0 1 1 -3.500 -3.500" stroke-width="1.8"/>`,
  // 装扮
  party: `<path d="M9 42 L24 8 L39 42Z" fill="${C.purple}"/><path d="M15 30 h18 M19 20 h10" stroke="${C.yellow}" stroke-width="3.500"/><circle cx="24" cy="7" r="4.500" fill="${C.pink}"/>`,
  glasses: `<circle cx="14" cy="26" r="9" fill="${C.white}"/><circle cx="34" cy="26" r="9" fill="${C.white}"/><path d="M23 26 h2 M5 24 l-3 -5 M43 24 l3 -5"/>`,
  wreath: `<path d="M5 34 Q24 6 43 34" stroke="${C.dgreen}" stroke-width="3.500"/><circle cx="8" cy="31" r="5.500" fill="${C.pink}"/><circle cx="16" cy="20" r="5.500" fill="${C.yellow}"/><circle cx="24" cy="15" r="5.500" fill="${C.purple}"/><circle cx="32" cy="20" r="5.500" fill="${C.yellow}"/><circle cx="40" cy="31" r="5.500" fill="${C.pink}"/>`,
  crown: `<path d="M8 40 L4 14 L16 26 L24 8 L32 26 L44 14 L40 40Z" fill="${C.yellow}"/><circle cx="16" cy="34" r="2.6" fill="${C.red}" stroke="none"/><circle cx="24" cy="32" r="3" fill="${C.blue}" stroke="none"/><circle cx="32" cy="34" r="2.6" fill="${C.red}" stroke="none"/>`,
  // 生病时用的
  ginger: `<path d="M8 30 Q6 20 16 20 Q18 10 28 14 Q34 8 40 16 Q46 24 38 30 Q40 40 30 40 Q22 44 18 38 Q8 40 8 30Z" fill="#E2C48A"/><path d="M17 27 q4 2 6 -1 M28 21 q3 3 7 1 M24 34 q3 -2 6 1" stroke-width="1.600"/>`,
  gingertea: `<path d="M17 13 q-3 -4 0 -9 M25 13 q-3 -4 0 -9"/><path d="M36 23 q9 0 8 7 q-1 7 -10 5"/><path d="M7 20 h30 q0 19 -15 21 q-15 -2 -15 -21z" fill="${C.cream}"/><ellipse cx="22" cy="21" rx="13" ry="3.500" fill="#E6B45C" stroke-width="1.600"/><ellipse cx="22" cy="21" rx="4" ry="1.600" fill="#F6E6B4" stroke="none"/>`,
  mint: `<path d="M24 46 V14"/><path d="M24 37 q-13 0 -15 -11 q13 -1 15 11z" fill="${C.green}"/><path d="M24 31 q13 0 15 -11 q-13 -1 -15 11z" fill="${C.green}"/><path d="M24 23 q-10 0 -11 -9 q10 -1 11 9z" fill="${C.lgreen}"/><path d="M24 17 q9 -1 9 -11 q-9 1 -9 11z" fill="${C.lgreen}"/>`,
  med: `<rect x="17" y="4" width="14" height="8" rx="2" fill="${C.wood}"/><path d="M14 12 h20 v4 q5 3 5 9 v14 q0 5 -5 5 h-20 q-5 0 -5 -5 v-14 q0 -6 5 -9z" fill="${C.cream}"/><path d="M24 23 v13 M17.500 29.500 h13" stroke="${C.red}" stroke-width="4"/>`,
  // 旅行用品
  bell: `<path d="M24 9 q-5 -6 0 -6 q5 0 0 6" fill="${C.coral}"/><path d="M24 8 Q36 10 36 27 L41 35 H7 L12 27 Q12 10 24 8Z" fill="${C.yellow}"/><circle cx="24" cy="40" r="4" fill="${C.orange}"/>`,
  strawhat: `<ellipse cx="24" cy="31" rx="21" ry="8" fill="${C.sand}"/><path d="M11 30 Q11 11 24 11 Q37 11 37 30" fill="${C.sand}"/><path d="M11.500 25 Q24 31 36.500 25" stroke="${C.coral}" stroke-width="3.500"/>`,
  tent: `<path d="M24 7 L45 41 H3Z" fill="${C.green}"/><path d="M24 7 L31 41 H17Z" fill="${C.cream}"/><path d="M24 7 v-4"/>`,
  lantern: `<path d="M24 3 v6 M24 42 v4"/><rect x="18" y="8" width="12" height="5" rx="1.500" fill="${C.dwood}"/><ellipse cx="24" cy="26" rx="14" ry="14" fill="${C.coral}"/><path d="M24 12 v28 M17 14 q-5 12 0 24 M31 14 q5 12 0 24" stroke-width="1.600"/><rect x="18" y="38" width="12" height="5" rx="1.500" fill="${C.dwood}"/>`,
  // 特产
  shell: `<path d="M24 43 Q3 35 6 18 Q14 6 24 8 Q34 6 42 18 Q45 35 24 43Z" fill="${C.pink}"/><path d="M24 43 L10 16 M24 43 L18 9 M24 43 L30 9 M24 43 L38 16" stroke-width="1.700"/>`,
  tea: `<path d="M17 13 q-3 -4 0 -9 M25 13 q-3 -4 0 -9"/><path d="M36 23 q9 0 8 7 q-1 7 -10 5"/><path d="M7 20 h30 q0 19 -15 21 q-15 -2 -15 -21z" fill="${C.cream}"/><ellipse cx="22" cy="21" rx="13" ry="3.500" fill="#D9B77A" stroke-width="1.600"/><circle cx="22" cy="21" r="2.300" fill="${C.pink}" stroke="none"/>`,
  onigiri: `<path d="M24 5 Q30 5 40 27 Q45 40 34 43 H14 Q3 40 8 27 Q18 5 24 5Z" fill="${C.white}"/><rect x="16" y="30" width="16" height="13" fill="#5E6B55"/>`,
  egg: `<path d="M17 11 q-3 -3 0 -7 M24 9 q-3 -3 0 -7 M31 11 q-3 -3 0 -7" stroke-width="1.800"/><path d="M24 12 Q37 18 37 31 Q35 44 24 44 Q13 44 11 31 Q11 18 24 12Z" fill="${C.cream}"/><path d="M17 30 q1 6 5 8" stroke="#fff" stroke-width="2.200"/>`,
  bamboo: `<path d="M24 4 Q37 22 34 41 Q24 46 14 41 Q11 22 24 4Z" fill="#D9B77A"/><path d="M14.500 34 Q24 25 33.500 34 M17 23 Q24 16 31 23" stroke-width="1.800"/><path d="M24 4 q-4 7 -3 11 q3 -4 6 0 q1 -4 -3 -11z" fill="${C.green}"/>`,
  tanghulu: `<path d="M24 47 V3"/><circle cx="24" cy="12" r="7.500" fill="${C.red}"/><circle cx="24" cy="25" r="7.500" fill="${C.red}"/><circle cx="24" cy="38" r="7.500" fill="${C.red}"/><path d="M20 9 q1 -2 3 -2 M20 22 q1 -2 3 -2 M20 35 q1 -2 3 -2" stroke="#fff" stroke-width="2"/>`,
  snowflake: `<path d="M24 4 v40 M6.700 14 l34.600 20 M6.700 34 l34.600 -20 M24 11 l-5 -4 M24 11 l5 -4 M24 37 l-5 4 M24 37 l5 4 M13 17.500 l-6.500 1 M13 17.500 l-1.500 -6 M35 30.500 l6.500 -1 M35 30.500 l1.500 6 M13 30.500 l-6.500 -1 M13 30.500 l-1.500 6 M35 17.500 l6.500 1 M35 17.500 l1.500 -6" stroke="${C.blue}" stroke-width="2.800"/>`,
  firefly: `<rect x="15" y="5" width="18" height="6" rx="2" fill="${C.wood}"/><path d="M14 11 h20 v3 q6 4 6 12 v9 q0 8 -8 8 h-16 q-8 0 -8 -8 v-9 q0 -8 6 -12z" fill="#E2EFE6"/><circle cx="19" cy="27" r="3.200" fill="${C.yellow}" stroke="none"/><circle cx="29" cy="22" r="2.600" fill="${C.yellow}" stroke="none"/><circle cx="27" cy="34" r="3" fill="${C.yellow}" stroke="none"/>`,
  // 小游戏里的东西
  rainbow: `<path d="M5 38 A19 19 0 0 1 43 38" stroke="${C.coral}" stroke-width="5.500"/><path d="M11 38 A13 13 0 0 1 37 38" stroke="${C.yellow}" stroke-width="5.500"/><path d="M17 38 A7 7 0 0 1 31 38" stroke="${C.blue}" stroke-width="5.500"/>`,
  storm: _cloud(C.gray) + `<path d="M25 30 l-6 8 h5 l-3 8 l9 -11 h-5z" fill="${C.yellow}" stroke-width="1.800"/>`,
  cloud: _cloud(C.white),
  balloon: `<path d="M24 34 q-4 6 2 12"/><path d="M24 4 Q38 5 37 19 Q35 31 24 34 Q13 31 11 19 Q10 5 24 4Z" fill="${C.coral}"/><path d="M17 14 q1 -5 5 -6" stroke="#fff" stroke-width="2.200"/>`,
  sock: `<path d="M17 4 h14 v21 l9 8 q4 7 -4 10 h-11 q-9 -1 -8 -11z" fill="${C.purple}"/><path d="M17 11 h14" stroke-width="1.800"/><path d="M6 20 q4 -4 0 -8 M11 14 q4 -4 0 -8" stroke="${C.dgreen}" stroke-width="2"/>`,
  pepper: `<path d="M21 12 Q37 10 39 24 Q39 40 20 45 Q30 32 21 12Z" fill="${C.red}"/><path d="M22 12 q-1 -6 -6 -8" stroke="${C.dgreen}" stroke-width="3.500"/>`
};
function icon(name, cls) {
  return `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 48 48">${G_OPEN('wob-s', 2.2)}${ICONS[name] || ''}</g></svg>`;
}
function iconImageSVG(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="144" height="144"><defs>${FILTER_DEFS}</defs>${G_OPEN('wob-s', 2.2)}${ICONS[name] || ''}</g></svg>`;
}

/* ---------- 花园里的植物、水壶、浴缸 ---------- */
function plantSVG(st) {
  const leaf = (x, y, s, flip) => `<path transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" d="M0 0 q-16 -3 -19 -17 q17 1 19 17z" fill="${C.green}"/>`;
  const stem = h => `<path d="M30 78 v-${h}" stroke="${C.dgreen}" stroke-width="3.500"/>`;
  let b;
  if (st === 's0') b = stem(9) + leaf(30, 70, .5) + leaf(30, 70, .5, 1);
  else if (st === 's1') b = stem(28) + leaf(30, 62, .85) + leaf(30, 56, .85, 1);
  else if (st === 's2') b = stem(46) + leaf(30, 66, .95) + leaf(30, 58, .95, 1) + leaf(30, 46, .7) + leaf(30, 42, .7, 1) + `<circle cx="30" cy="27" r="8" fill="${C.lgreen}"/>`;
  else b = stem(40) + leaf(30, 66, 1) + leaf(30, 58, 1, 1) + leaf(30, 48, .75) + leaf(30, 44, .75, 1);
  return `<svg viewBox="0 0 60 80">${G_OPEN('wob-s', 2)}${b}</g></svg>`;
}
function tubSVG() {
  let foam = '';
  for (let i = 0; i < 9; i++) foam += `<circle cx="${22 + i * 25}" cy="${18 + (i % 2) * 5}" r="${12 + (i % 3) * 3}" fill="#fff" stroke-width="2"/>`;
  return `<svg viewBox="0 0 240 104">${G_OPEN('wob-m', 3)}<path d="M12 32 h216 q0 56 -42 60 h-132 q-42 -4 -42 -60z" fill="${C.white}"/><rect x="2" y="24" width="236" height="16" rx="8" fill="${C.sky}"/>${foam}<path d="M60 93 v7 M180 93 v7"/></g></svg>`;
}

/* ---------- 场景背景（800×500，纯静态；会动的东西放在页面里单独叠上去） ---------- */
const _SCENE_OPEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="8 8 784 484" preserveAspectRatio="xMidYMax slice">';
const _grass = pts => `<path d="${pts.map(p => `M${p[0]} ${p[1]} l-4 -10 M${p[0]} ${p[1]} l0 -13 M${p[0]} ${p[1]} l4 -10`).join(' ')}" stroke="${C.dgreen}" stroke-width="2.200"/>`;
const _flower = (x, y, c) => `<path d="M${x} ${y} v14" stroke="${C.dgreen}" stroke-width="2.200"/><circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke-width="2"/>`;
function _bunting(x1, x2, y0, sag, colors) {
  let s = `<path d="M${x1} ${y0} Q${(x1 + x2) / 2} ${y0 + sag * 2} ${x2} ${y0}" stroke-width="2"/>`;
  const n = Math.round((x2 - x1) / 70);
  for (let i = 0; i < n; i++) {
    const t = (i + .5) / n, x = x1 + (x2 - x1) * t, y = y0 + sag * 4 * t * (1 - t);
    s += `<path d="M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 26}Z" fill="${colors[i % colors.length]}" stroke-width="2"/>`;
  }
  return s;
}

function sceneHomeSVG() {
  let stars = '';
  [[120, 120], [150, 150], [205, 118], [236, 176], [122, 196], [170, 210]].forEach(p => { stars += `<circle cx="${p[0]}" cy="${p[1]}" r="2.400" fill="#FFF6C9"/>`; });
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="372" fill="#F3E6C4" stroke="none"/>
    <path d="M110 0 v300 M250 0 v300 M390 0 v300 M530 0 v300 M670 0 v300" stroke="#E2D0A6" stroke-width="2"/>
    <rect y="300" width="800" height="72" fill="#E3CFA5" stroke="none"/>
    <rect width="800" height="372" fill="url(#hatch)" stroke="none"/>
    <path d="M0 300 H800" stroke-width="2.400"/>
    <path d="M400 0 V34"/><path d="M366 66 Q400 22 434 66Z" fill="${C.yellow}"/>
    <path d="M90 252 V150 Q90 84 180 84 Q270 84 270 150 V252Z" fill="${C.white}"/>
    <path class="win-sky" d="M102 242 V152 Q102 96 180 96 Q258 96 258 152 V242Z" stroke="none"/>
    <circle class="win-sun" cx="224" cy="134" r="15" stroke="none"/>
    <g class="win-stars" stroke="none">${stars}</g>
    <path class="win-hill" d="M102 242 V212 Q140 184 180 208 Q222 186 258 204 V242Z" stroke="none"/>
    <defs><clipPath id="win-clip"><path d="M102 242 V152 Q102 96 180 96 Q258 96 258 152 V242Z"/></clipPath></defs><g class="win-view" clip-path="url(#win-clip)"></g>
    <path d="M180 86 V250 M92 172 H268" stroke-width="5" stroke="${C.white}"/><path d="M180 96 V242 M102 172 H258" stroke-width="1.600"/>
    <rect x="78" y="250" width="204" height="13" rx="4" fill="${C.wood}"/>
    <path d="M70 78 H290" stroke-width="5"/>
    <path d="M82 80 q32 22 34 62 q-2 52 -34 76z" fill="#B9CFA0"/><path d="M278 80 q-32 22 -34 62 q2 52 34 76z" fill="#B9CFA0"/>
    <path d="M96 100 q10 30 6 70 M264 100 q-10 30 -6 70" stroke-width="1.600"/>
    <rect x="500" y="238" width="246" height="12" rx="3" fill="${C.wood}"/>
    <path d="M516 250 v18 M730 250 v18"/>
    <rect x="516" y="192" width="17" height="46" rx="2" fill="${C.blue}"/><rect x="535" y="200" width="14" height="38" rx="2" fill="${C.yellow}"/>
    <rect x="551" y="186" width="19" height="52" rx="2" fill="${C.coral}"/><rect x="572" y="204" width="14" height="34" rx="2" fill="${C.purple}"/>
    <path d="M612 238 q-8 -22 6 -30 h20 q14 8 6 30z" fill="#E2EFE6"/><rect x="616" y="202" width="24" height="7" rx="2" fill="${C.wood}"/>
    <path d="M700 196 q-14 -26 0 -40 q14 14 0 40z M700 200 q-26 -10 -26 -30 q20 4 26 30z M700 200 q26 -10 26 -30 q-20 4 -26 30z" fill="${C.green}"/>
    <path d="M682 238 l5 -34 h26 l5 34z" fill="${C.orange}"/>
    <rect y="372" width="800" height="128" fill="#DBC196" stroke="none"/>
    <path d="M0 372 H800" stroke-width="2.600"/>
    <path d="M0 414 H800 M0 458 H800 M130 374 v40 M430 374 v40 M690 374 v40 M270 414 v44 M570 414 v44 M100 458 v42 M410 458 v42 M710 458 v42" stroke="#C4A77A" stroke-width="2"/>
    <path d="M700 372 V350 H726 V328 H752 V306 H778 V284 H810 V372Z" fill="#DBC196"/>
    <path d="M704 328 L806 240" stroke-width="5"/><path d="M713 348 v-28 M739 326 v-28 M765 304 v-28 M791 282 v-28" stroke-width="2.400"/>
  </g></svg>`;
}

function sceneGardenSVG() {
  let fence = '';
  for (let i = 0, x = 196; x < 800; x += 46, i++) { const h = 250 + (i * 37) % 9; fence += `<path d="M${x} 318 V${h} l9 -10 l9 10 V318Z" fill="#F7F1DF"/>`; }
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="500" fill="#DCECE6" stroke="none"/>
    <rect width="800" height="330" fill="url(#hatch)" stroke="none"/>
    <circle cx="548" cy="70" r="32" fill="#F3D98B"/>
    <path d="M0 262 Q150 188 330 250 T640 232 T800 222 V500 H0Z" fill="#CFE0B6"/>
    <path d="M0 290 Q210 240 420 280 T800 262 V500 H0Z" fill="#BAD197"/>
    <path d="M158 96 q10 -16 0 -30 q-10 -12 2 -26" stroke-width="2"/>
    <rect x="140" y="104" width="20" height="40" fill="${C.dwood}"/>
    <rect x="22" y="176" width="156" height="126" fill="${C.cream}"/>
    <path d="M4 182 L100 98 L196 182Z" fill="${C.coral}"/>
    <path d="M40 150 l12 -10 M70 126 l12 -10 M120 126 l12 10 M150 150 l12 10" stroke-width="1.800"/>
    <path d="M118 302 v-52 a20 20 0 0 1 40 0 v52" fill="${C.wood}"/><circle cx="150" cy="276" r="2.500" fill="${C.line}" stroke="none"/>
    <circle cx="64" cy="232" r="19" fill="${C.sky}"/><path d="M64 213 v38 M45 232 h38" stroke-width="2"/>
    ${fence}<path d="M190 270 H800 M190 298 H800" stroke-width="2.400"/>
    <rect x="708" y="170" width="24" height="150" rx="6" fill="${C.dwood}"/>
    <path d="M720 184 Q650 184 652 128 Q654 70 720 76 Q786 70 788 128 Q790 184 720 184Z" fill="${C.green}"/>
    <path d="M690 110 q8 -10 18 0 M730 140 q8 -10 18 0 M700 150 q8 -10 18 0" stroke="${C.dgreen}" stroke-width="2"/>
    <circle cx="686" cy="138" r="7" fill="${C.red}" stroke-width="2"/><circle cx="752" cy="116" r="7" fill="${C.red}" stroke-width="2"/>
    <path d="M0 322 Q200 296 400 316 T800 306 V500 H0Z" fill="#A9C987"/>
    <path d="M0 322 Q200 296 400 316 T800 306 V500 H0Z" fill="url(#hatch)" stroke="none"/>
    ${_grass([[36, 372], [228, 344], [352, 338], [584, 340], [752, 356], [130, 470], [690, 462]])}
    ${_flower(214, 356, C.pink)}${_flower(604, 330, C.yellow)}${_flower(768, 400, C.purple)}${_flower(24, 420, C.yellow)}
  </g></svg>`;
}

function scenePlaySVG() {
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="500" fill="#E4EFDF" stroke="none"/>
    <rect width="800" height="340" fill="url(#hatch)" stroke="none"/>
    <circle cx="120" cy="80" r="30" fill="#F3D98B"/>
    <path d="M0 290 Q170 210 360 270 T800 236 V500 H0Z" fill="#CFE0B6"/>
    <path d="M60 300 V214 M250 300 V200"/>${_bunting(60, 250, 214, 12, [C.coral, C.yellow, C.blue, C.pink])}
    <rect x="588" y="150" width="34" height="210" rx="8" fill="${C.dwood}"/>
    <path d="M606 172 Q500 176 506 96 Q512 16 606 30 Q700 16 706 96 Q712 176 606 172Z" fill="${C.green}"/>
    <path d="M560 80 q8 -10 18 0 M620 110 q8 -10 18 0 M580 130 q8 -10 18 0 M640 66 q8 -10 18 0" stroke="${C.dgreen}" stroke-width="2"/>
    <path d="M588 190 Q540 186 520 196" stroke-width="6" stroke="${C.dwood}"/><path d="M588 186 Q540 182 518 192" stroke-width="2"/>
    <path d="M528 198 V318 M560 192 V318" stroke-width="2"/><rect x="518" y="316" width="52" height="10" rx="3" fill="${C.wood}"/>
    <path d="M0 340 Q200 312 400 332 T800 320 V500 H0Z" fill="#A9C987"/>
    <path d="M0 340 Q200 312 400 332 T800 320 V500 H0Z" fill="url(#hatch)" stroke="none"/>
    <path d="M318 356 q-2 -16 22 -16 q24 0 22 16z" fill="${C.red}"/><rect x="333" y="356" width="14" height="16" rx="4" fill="${C.cream}"/>
    <circle cx="332" cy="349" r="3" fill="#fff" stroke="none"/><circle cx="347" cy="346" r="3" fill="#fff" stroke="none"/>
    <path d="M700 380 q0 -14 26 -14 q26 0 26 14 v20 h-52z" fill="${C.wood}"/><ellipse cx="726" cy="380" rx="26" ry="8" fill="#E2C79C"/>
    <path d="M714 380 a12 3.500 0 0 0 24 0" stroke-width="1.600"/>
    ${_grass([[44, 380], [270, 362], [450, 360], [660, 350], [770, 420]])}
    ${_flower(420, 372, C.yellow)}${_flower(96, 392, C.pink)}${_flower(640, 398, C.purple)}
  </g></svg>`;
}

function sceneShopSVG() {
  let awn = '', goods = '';
  for (let i = 0; i < 10; i++) awn += `<path d="M${i * 80} 0 h80 v50 a40 30 0 0 1 -80 0z" fill="${i % 2 ? C.cream : '#B9CFA0'}"/>`;
  const jc = [C.yellow, C.pink, C.blue, C.purple, C.lgreen, C.orange];
  for (let i = 0; i < 6; i++) {
    const x = 96 + i * 108;
    goods += `<path d="M${x} 236 q-6 -30 6 -44 h42 q12 14 6 44z" fill="#E9F1E6"/><rect x="${x + 8}" y="184" width="38" height="10" rx="3" fill="${jc[(i + 2) % 6]}"/><ellipse cx="${x + 27}" cy="218" rx="15" ry="11" fill="${jc[i]}" stroke-width="1.800"/>`;
    goods += i % 2 ? `<path d="M${x - 4} 336 l6 -40 h50 l6 40z" fill="${jc[(i + 3) % 6]}"/><path d="M${x + 8} 296 q19 -18 38 0" stroke-width="2"/>`
      : `<rect x="${x - 4}" y="292" width="62" height="44" rx="5" fill="${jc[(i + 3) % 6]}"/><path d="M${x + 27} 292 v44" stroke-width="2"/>`;
  }
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="404" fill="#EFE3C2" stroke="none"/>
    <path d="M90 60 v344 M230 60 v344 M370 60 v344 M510 60 v344 M650 60 v344" stroke="#DECDA2" stroke-width="2"/>
    <rect width="800" height="404" fill="url(#hatch)" stroke="none"/>
    <path d="M300 60 V96 M500 60 V96" stroke-width="2"/>
    <rect x="262" y="94" width="276" height="60" rx="8" fill="${C.wood}"/>
    <text class="shop-sign" x="400" y="136" text-anchor="middle" font-size="32" font-weight="bold" fill="${C.line}" stroke="none" font-family="STKaiti,KaiTi,楷体,serif">小小杂货铺</text>
    ${goods}
    <rect x="60" y="236" width="680" height="14" rx="4" fill="${C.dwood}"/><rect x="60" y="336" width="680" height="14" rx="4" fill="${C.dwood}"/>
    <rect y="404" width="800" height="96" fill="${C.wood}" stroke="none"/><path d="M0 404 H800 M0 440 H800" stroke-width="2.400"/>
    <path d="M100 404 v36 M300 404 v36 M500 404 v36 M700 404 v36 M200 440 v60 M400 440 v60 M600 440 v60" stroke-width="1.800"/>
    ${awn}
  </g></svg>`;
}

function sceneTitleSVG() {
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="500" fill="#DCECE6" stroke="none"/><rect width="800" height="500" fill="url(#hatch)" stroke="none"/>
    <circle cx="660" cy="92" r="38" fill="#F3D98B"/>
    <path d="M110 110 a14 14 0 0 1 4 -28 a20 20 0 0 1 38 -2 a15 15 0 0 1 2 30z M470 70 a11 11 0 0 1 3 -22 a16 16 0 0 1 30 -2 a12 12 0 0 1 2 24z" fill="${C.white}"/>
    <path d="M0 330 Q120 220 260 300 Q400 200 560 290 Q700 220 800 280 V500 H0Z" fill="#CFE0B6"/>
    <rect x="592" y="246" width="60" height="50" fill="${C.cream}"/><path d="M582 250 L622 214 L662 250Z" fill="${C.coral}"/><path d="M614 296 v-20 a8 8 0 0 1 16 0 v20" fill="${C.wood}"/>
    <rect x="150" y="250" width="14" height="60" rx="4" fill="${C.dwood}"/><path d="M157 262 Q118 262 120 226 Q124 192 157 196 Q190 192 194 226 Q196 262 157 262Z" fill="${C.green}"/>
    <path d="M0 372 Q200 318 420 356 T800 336 V500 H0Z" fill="#B5CE92"/>
    <path d="M360 500 Q380 430 470 400 Q560 372 600 300" stroke="#E9DDB8" stroke-width="26"/><path d="M360 500 Q380 430 470 400 Q560 372 600 300" stroke="#F4ECD0" stroke-width="19"/>
    <path d="M0 440 Q260 400 800 430 V500 H0Z" fill="#A9C987"/>
    ${_grass([[60, 420], [250, 392], [520, 428], [720, 404]])}${_flower(100, 444, C.pink)}${_flower(690, 440, C.yellow)}${_flower(300, 448, C.purple)}
  </g></svg>`;
}

/* ---------- 旅行目的地与明信片（300×200） ---------- */
const DESTS = {
  flower: { name: '风车花田', time: 120, souv: 'tea',       pet: [96, 104, .42] },
  rice:   { name: '稻田小路', time: 120, souv: 'onigiri',   pet: [176, 100, .42] },
  spring: { name: '林间温泉', time: 150, souv: 'egg',       pet: [108, 66, .42] },
  sea:    { name: '海边灯塔', time: 180, souv: 'shell',     pet: [68, 104, .42] },
  bamboo: { name: '竹林深处', time: 180, souv: 'bamboo',    pet: [108, 104, .42] },
  town:   { name: '灯笼小镇', time: 210, souv: 'tanghulu',  pet: [116, 37, .34] },
  snow:   { name: '雪山脚下', time: 240, souv: 'snowflake', pet: [86, 104, .42] },
  camp:   { name: '星空营地', time: 240, souv: 'firefly',   pet: [12, 108, .4] },
  sakura:    { name: '樱花小径', time: 150, souv: 'dango',        pet: [86, 104, .42] },
  meadow:    { name: '青青草原', time: 150, souv: 'yogurt',       pet: [30, 104, .42] },
  waterfall: { name: '彩虹瀑布', time: 210, souv: 'springwater',  pet: [4, 96, .42] },
  desert:    { name: '沙漠绿洲', time: 210, souv: 'melon',        pet: [96, 104, .42] },
  ocean:     { name: '海底世界', time: 240, souv: 'roll',         pet: [108, 56, .42] },
  ferris:    { name: '摩天轮乐园', time: 210, souv: 'cottoncandy', pet: [84, 104, .42] }
};
/* 特产：每个地方一种，都可以吃或喝，比商店里的东西更管用。
 * drink 表示是喝的；sweet 表示是甜食（连着吃太多甜的会肚子疼） */
const SOUVS = {
  tea:         { name: '花田花茶',   ic: 'tea',         drink: true, thirst: 32, happy: 10 },
  onigiri:     { name: '新米饭团',   ic: 'onigiri',     hunger: 36 },
  egg:         { name: '温泉蛋',     ic: 'egg',         hunger: 26, energy: 10 },
  shell:       { name: '贝壳酥',     ic: 'shell',       hunger: 20, happy: 12 },
  bamboo:      { name: '鲜竹笋',     ic: 'bamboo',      hunger: 30 },
  tanghulu:    { name: '冰糖葫芦',   ic: 'tanghulu',    hunger: 12, happy: 20, sweet: 1 },
  snowflake:   { name: '雪花冰',     ic: 'shavedice',   drink: true, thirst: 22, happy: 15 },
  firefly:     { name: '烤棉花糖',   ic: 'marshmallow', hunger: 10, happy: 22, sweet: 1 },
  dango:       { name: '樱花团子',   ic: 'dango',       hunger: 18, happy: 15, sweet: 1 },
  yogurt:      { name: '草原酸奶',   ic: 'yogurt',      drink: true, thirst: 26, hunger: 10 },
  springwater: { name: '山泉水',     ic: 'springwater', drink: true, thirst: 42 },
  melon:       { name: '沙漠蜜瓜',   ic: 'melon',       hunger: 16, thirst: 20 },
  roll:        { name: '海苔饭卷',   ic: 'roll',        hunger: 32 },
  cottoncandy: { name: '彩虹棉花糖', ic: 'cottoncandy', hunger: 6, happy: 26, sweet: 1 }
};
const _hill = (d, f) => `<path d="${d}" fill="${f}"/>`;
const CARD_BG = {
  flower(r) {
    let rows = '';
    [[150, C.pink], [166, C.yellow], [182, C.coral]].forEach((q, k) => { for (let x = 8 + k * 6; x < 300; x += 17) rows += `<circle cx="${x}" cy="${q[0]}" r="4.500" fill="${q[1]}" stroke-width="1.400"/>`; });
    return `<rect width="300" height="200" fill="#DCECE6" stroke="none"/>
      ${r ? `<path d="M40 150 A110 110 0 0 1 260 150" stroke="${C.coral}" stroke-width="7" opacity=".8"/><path d="M50 150 A100 100 0 0 1 250 150" stroke="${C.yellow}" stroke-width="7" opacity=".8"/><path d="M60 150 A90 90 0 0 1 240 150" stroke="${C.blue}" stroke-width="7" opacity=".8"/>` : `<circle cx="50" cy="40" r="18" fill="#F3D98B"/>`}
      ${_hill('M0 130 Q80 100 160 124 T300 112 V200 H0Z', '#CFE0B6')}
      <path d="M212 136 L222 70 H242 L252 136Z" fill="${C.cream}"/><path d="M218 70 L232 54 L246 70Z" fill="${C.coral}"/>
      <path d="M232 66 L200 40 M232 66 L266 42 M232 66 L206 96 M232 66 L262 94" stroke-width="5" stroke="${C.wood}"/><circle cx="232" cy="66" r="4" fill="${C.line}"/>
      ${_hill('M0 144 Q150 128 300 142 V200 H0Z', '#A9C987')}${rows}`;
  },
  rice(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 230 : 250}" cy="${r ? 62 : 38}" r="${r ? 24 : 17}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 112 L60 60 L110 100 L170 50 L240 104 L300 80 V200 H0Z', r ? '#C9B79A' : '#B9CDBE')}
      ${_hill('M0 118 Q150 100 300 116 V200 H0Z', '#C3D69B')}
      <path d="M0 134 Q150 118 300 132 M0 152 Q150 138 300 150 M0 172 Q150 160 300 170" stroke="${C.dgreen}" stroke-width="2"/>
      <path d="M20 128 v-8 M50 126 v-8 M90 124 v-8 M210 124 v-8 M250 126 v-8 M280 128 v-8 M30 146 v-9 M70 144 v-9 M230 143 v-9 M270 145 v-9 M24 166 v-10 M64 164 v-10 M250 163 v-10" stroke="${C.dgreen}" stroke-width="2.400"/>
      <path d="M96 150 V96 M76 112 H116"/><circle cx="96" cy="90" r="10" fill="${C.cream}"/><path d="M82 82 L96 70 L110 82Z" fill="${C.sand}"/><path d="M80 112 l-4 14 M112 112 l4 14" stroke-width="2"/>
      ${r ? `<path d="M150 40 h14 M157 36 v8 M196 60 h12 M202 57 v6 M130 70 h10 M135 67 v6" stroke="${C.red}" stroke-width="2.200"/>` : ''}`;
  },
  spring(r) {
    return `<rect width="300" height="200" fill="#E4EFDF" stroke="none"/>
      ${_hill('M0 110 Q80 70 150 100 T300 86 V200 H0Z', '#CFE0B6')}
      <rect x="30" y="50" width="12" height="80" fill="${C.dwood}"/><path d="M36 64 Q4 62 8 34 Q14 10 36 14 Q58 10 64 34 Q68 62 36 64Z" fill="${C.coral}"/>
      <rect x="256" y="40" width="12" height="90" fill="${C.dwood}"/><path d="M262 58 Q230 56 234 28 Q240 4 262 8 Q284 4 290 28 Q294 56 262 58Z" fill="${C.orange}"/>
      ${_hill('M0 126 Q150 108 300 124 V200 H0Z', '#A9C987')}
      <path d="M110 70 q-6 -10 0 -20 q6 -10 0 -20 M160 60 q-6 -10 0 -20 q6 -10 0 -20 M200 74 q-6 -10 0 -20" stroke="#fff" stroke-width="3" opacity=".9"/>
      ${r ? `<g transform="translate(176 104) scale(.42)">${FRIEND_DRAW.hedgehog()}</g>` : ''}`;
  },
  springFront() {
    return `<path d="M52 158 Q60 130 150 130 Q240 130 248 158 Q240 192 150 192 Q60 192 52 158Z" fill="${C.sky}"/>
      <path d="M84 156 q10 -6 20 0 M150 172 q10 -6 20 0 M196 152 q10 -6 20 0" stroke="#fff" stroke-width="2.200"/>
      <path d="M38 166 q-4 -18 16 -18 q14 0 14 14 q-2 12 -30 4z M234 158 q0 -16 18 -14 q16 2 12 18 q-14 8 -30 -4z M118 196 q0 -12 16 -12 q16 0 14 12z" fill="#C9C2B4"/>`;
  },
  sea(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 150 : 44}" cy="${r ? 92 : 36}" r="${r ? 26 : 17}" fill="${r ? C.orange : '#F3D98B'}"/>
      <rect y="92" width="300" height="60" fill="${C.blue}" stroke="none"/><path d="M0 92 H300"/>
      <path d="M20 108 q10 -6 20 0 M90 120 q10 -6 20 0 M150 106 q10 -6 20 0 M60 136 q10 -6 20 0 M180 132 q10 -6 20 0" stroke="#fff" stroke-width="2.200"/>
      ${r ? `<path d="M110 100 h40 l-8 10 h-24z" fill="${C.wood}"/><path d="M130 100 V70 L152 96Z" fill="${C.cream}"/>` : ''}
      <path d="M196 100 Q230 84 300 96 V152 H196Z" fill="#B9CDA4"/>
      <path d="M238 96 L244 34 H262 L268 96Z" fill="${C.white}"/><path d="M241 62 h24 M243 46 h20" stroke="${C.red}" stroke-width="7"/>
      <rect x="240" y="24" width="26" height="12" fill="${C.yellow}"/><path d="M238 24 L253 12 L268 24Z" fill="${C.red}"/>
      ${_hill('M0 150 Q150 136 300 148 V200 H0Z', C.sand)}
      <path d="M150 50 q6 -6 12 0 q6 -6 12 0 M196 34 q5 -5 10 0 q5 -5 10 0" stroke-width="2"/>
      <path d="M150 178 l5 -8 l5 8 l-10 -5 h10z" fill="${C.pink}" stroke-width="1.600"/>`;
  },
  bamboo(r) {
    let b = '';
    [[20, 12], [52, 9], [84, 13], [196, 10], [228, 13], [262, 9], [288, 12]].forEach((q, i) => {
      b += `<rect x="${q[0]}" y="-6" width="${q[1]}" height="170" fill="${i % 2 ? '#9DBB7A' : '#B5CF90'}"/><path d="M${q[0]} 40 h${q[1]} M${q[0]} 90 h${q[1]} M${q[0]} 136 h${q[1]}" stroke-width="2"/>`;
      b += `<path d="M${q[0] + q[1]} 40 q16 -10 22 2 q-12 6 -22 -2z" fill="${C.green}" stroke-width="1.600"/>`;
    });
    return `<rect width="300" height="200" fill="#E4EFDF" stroke="none"/>
      <path d="M150 0 L60 160 H240Z" fill="#F6F0CF" stroke="none" opacity=".8"/>
      ${b}${_hill('M0 150 Q150 136 300 148 V200 H0Z', '#A9C987')}
      <path d="M120 200 Q140 170 150 150 Q160 170 180 200Z" fill="#E9DDB8"/>
      ${r ? `<g transform="translate(184 138) scale(.44)">${FRIEND_DRAW.snail()}</g><circle cx="110" cy="60" r="3.500" fill="${C.yellow}" stroke="none"/><circle cx="170" cy="40" r="3" fill="${C.yellow}" stroke="none"/><circle cx="140" cy="90" r="3" fill="${C.yellow}" stroke="none"/>` : ''}`;
  },
  town(r) {
    const lan = (x, y) => `<path d="M${x} ${y - 10} v4"/><ellipse cx="${x}" cy="${y}" rx="6" ry="7" fill="${C.coral}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="#D9D2E6" stroke="none"/>
      ${r ? `<path d="M70 44 l0 -14 M70 44 l12 -8 M70 44 l12 8 M70 44 l0 14 M70 44 l-12 8 M70 44 l-12 -8" stroke="${C.yellow}" stroke-width="2.600"/><path d="M230 34 l0 -12 M230 34 l10 -6 M230 34 l10 6 M230 34 l0 12 M230 34 l-10 6 M230 34 l-10 -6" stroke="${C.coral}" stroke-width="2.600"/>` : `<circle cx="252" cy="34" r="14" fill="#FFF6C9"/>`}
      <rect x="0" y="62" width="64" height="72" fill="${C.cream}"/><path d="M-6 64 L32 38 L70 64Z" fill="#8C7B8C"/>
      <rect x="236" y="56" width="70" height="78" fill="${C.cream}"/><path d="M230 58 L270 30 L310 58Z" fill="#8C7B8C"/>
      <rect x="18" y="84" width="14" height="16" fill="${C.yellow}" stroke-width="1.600"/><rect x="258" y="80" width="14" height="16" fill="${C.yellow}" stroke-width="1.600"/>
      ${lan(52, 80)}${lan(246, 76)}${lan(290, 76)}${lan(8, 80)}
      <rect y="134" width="300" height="66" fill="#9DB4CC" stroke="none"/>
      <path d="M30 160 q10 -6 20 0 M230 170 q10 -6 20 0 M130 184 q10 -6 20 0" stroke="#fff" stroke-width="2"/>
      <path d="M40 134 Q150 60 260 134 V146 Q150 84 40 146Z" fill="${C.wood}"/>
      <path d="M70 116 v14 M110 96 v14 M150 90 v14 M190 96 v14 M230 116 v14" stroke-width="2"/>`;
  },
  snow(r) {
    return `<rect width="300" height="200" fill="${r ? '#31406E' : '#DCE9EF'}" stroke="none"/>
      ${r ? `<path d="M10 60 Q80 10 150 50 T290 30" stroke="#9BE0B8" stroke-width="12" opacity=".7"/><path d="M10 80 Q80 34 150 72 T290 54" stroke="#B7A3CC" stroke-width="8" opacity=".7"/>` : `<circle cx="48" cy="38" r="16" fill="#F3D98B"/>`}
      <path d="M90 140 L170 30 L250 140Z" fill="#B9C9D6"/><path d="M146 64 L170 30 L194 64 L182 58 L170 70 L158 58Z" fill="${C.white}"/>
      <path d="M190 140 L250 70 L310 140Z" fill="#C9D6E0"/><path d="M234 90 L250 70 L266 90 L250 84Z" fill="${C.white}"/>
      ${_hill('M0 136 Q150 118 300 134 V200 H0Z', C.white)}
      <path d="M26 132 L40 96 L54 132Z M32 108 L40 84 L48 108Z" fill="${C.dgreen}"/><rect x="37" y="132" width="6" height="10" fill="${C.dwood}" stroke-width="1.600"/>
      <circle cx="200" cy="150" r="15" fill="${C.white}"/><circle cx="200" cy="128" r="10" fill="${C.white}"/><path d="M200 130 l8 2" stroke="${C.orange}" stroke-width="3"/>
      <circle cx="196" cy="126" r="1.500" fill="${C.line}" stroke="none"/><circle cx="204" cy="126" r="1.500" fill="${C.line}" stroke="none"/><path d="M186 146 l-12 -8 M214 146 l12 -8" stroke-width="2"/>`;
  },
  camp(r) {
    let st = '';
    [[30, 30], [70, 54], [110, 22], [150, 46], [196, 26], [236, 58], [270, 30], [50, 80], [220, 86]].forEach(p => { st += `<circle cx="${p[0]}" cy="${p[1]}" r="2.200" fill="#FFF6C9"/>`; });
    return `<rect width="300" height="200" fill="#31406E" stroke="none"/><g stroke="none">${st}</g>
      <path d="M262 30 A16 16 0 1 0 276 56 A13 13 0 0 1 262 30Z" fill="#FFF6C9"/>
      ${r ? `<path d="M40 20 l40 20 M120 10 l44 22 M190 50 l34 17" stroke="#FFF6C9" stroke-width="2.400"/><g transform="translate(206 142) scale(.42)">${FRIEND_DRAW.duck()}</g>` : ''}
      ${_hill('M0 130 Q80 96 160 124 T300 110 V200 H0Z', '#3E5A52')}
      ${_hill('M0 150 Q150 134 300 148 V200 H0Z', '#56755A')}
      <path d="M150 80 L204 158 H96Z" fill="${C.orange}"/><path d="M150 80 L166 158 H134Z" fill="#5B4636"/>
      <path d="M106 176 l22 -8 M128 176 l-22 -8" stroke-width="4" stroke="${C.dwood}"/>
      <path d="M117 168 q-10 -14 0 -26 q10 12 0 26z" fill="${C.yellow}"/>`;
  }
};
/* cardId 形如 "sea:a"（普通）或 "sea:b"（稀有） */
function postcardSVG(cardId, petType, wear) {
  const p = cardId.split(':'), d = DESTS[p[0]], rare = p[1] === 'b';
  if (!d) return '';
  const pos = d.pet;
  const petG = `<g transform="translate(${pos[0]} ${pos[1]}) scale(${pos[2]})" stroke-width="${(2.4 / pos[2]).toFixed(1)}">${petInner(petType, 'joy', wear)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 292 192" preserveAspectRatio="xMidYMid slice">${G_OPEN('wob-m', 2.4)}` +
    CARD_BG[p[0]](rare) + petG + (CARD_BG[p[0] + 'Front'] ? CARD_BG[p[0] + 'Front']() : '') + '</g></svg>';
}

/* ---------- 花园里的信箱和树桩 ---------- */
function mailboxSVG(has) {
  return `<svg viewBox="0 0 84 112">${G_OPEN('wob-m', 2.6)}<rect x="35" y="52" width="10" height="56" fill="${C.dwood}"/>` +
    `<path d="M10 54 V32 Q10 12 40 12 Q70 12 70 32 V54Z" fill="${C.coral}"/><path d="M40 54 V32 Q40 14 25 14" stroke-width="2"/>` +
    `<rect x="17" y="36" width="16" height="5" rx="2" fill="${C.line}" stroke="none"/>` +
    (has ? `<path d="M70 42 V6"/><path d="M70 6 h-17 l5 6 l-5 6 h17z" fill="${C.yellow}"/><rect x="16" y="18" width="18" height="13" fill="${C.cream}" stroke-width="1.800" transform="rotate(-10 25 24)"/>`
      : `<path d="M70 42 h10 v8" stroke-width="2.400"/>`) + '</g></svg>';
}
function stumpSVG() {
  return `<svg viewBox="0 0 120 56">${G_OPEN('wob-m', 2.6)}<path d="M14 20 q-2 24 -8 32 h108 q-6 -8 -8 -32z" fill="${C.dwood}"/><ellipse cx="60" cy="20" rx="46" ry="13" fill="#E2C79C"/>` +
    `<path d="M40 20 a20 5.500 0 0 0 40 0 M52 19 a8 2.500 0 0 0 16 0" stroke-width="1.600"/></g></svg>`;
}

/* ---------- 第二批图标：饮料、新食物、新药、新装扮、新旅行用品、新特产 ---------- */
const _glass = liquid => `<path d="M11 7 h26 l-3 35 q0 2 -3 2 h-14 q-3 0 -3 -2z" fill="#EEF5F4"/><path d="M12.800 21 h22.400 l-1.900 21 h-18.600z" fill="${liquid}" stroke-width="1.600"/>`;
const _slice = (rind, flesh) => `<path d="M2 14 A22.500 22.500 0 0 0 46 14Z" fill="${rind}"/><path d="M8 14 A16.500 16.500 0 0 0 40 14Z" fill="${flesh}" stroke-width="1.600"/>`;
Object.assign(ICONS, {
  // 喝的
  water: _glass(C.sky),
  milk: `<rect x="18" y="4" width="12" height="7" rx="2" fill="${C.blue}"/><path d="M17 11 h14 v5 q6 4 6 10 v15 q0 3 -3 3 h-20 q-3 0 -3 -3 v-15 q0 -6 6 -10z" fill="${C.white}"/><rect x="11" y="27" width="26" height="9" fill="${C.sky}" stroke-width="1.600"/>`,
  juice: _glass(C.orange) + `<path d="M30 3 l-7 30" stroke="${C.red}" stroke-width="3"/><circle cx="38" cy="10" r="6" fill="${C.yellow}" stroke-width="1.800"/>`,
  honey: `<rect x="14" y="5" width="20" height="7" rx="2" fill="${C.wood}"/><path d="M12 12 h24 q5 6 5 16 q0 15 -17 15 q-17 0 -17 -15 q0 -10 5 -16z" fill="${C.yellow}"/><path d="M24 20 q-7 9 0 14 q7 -5 0 -14z" fill="#F8E9B0" stroke-width="1.600"/>`,
  cocoa: `<path d="M17 9 q-3 -3 0 -6 M26 9 q-3 -3 0 -6"/><path d="M34 22 q10 0 9 8 q-1 7 -9 6"/><path d="M7 16 h28 v19 q0 9 -9 9 h-10 q-9 0 -9 -9z" fill="${C.coral}"/><ellipse cx="21" cy="17" rx="14" ry="3.600" fill="${C.dwood}" stroke-width="1.600"/><rect x="16" y="12" width="9" height="7" rx="2.500" fill="${C.white}" stroke-width="1.600"/>`,
  // 吃的
  bread: `<path d="M6 26 Q4 12 16 12 Q24 6 32 12 Q44 12 42 26 V38 Q42 42 38 42 H10 Q6 42 6 38Z" fill="#E2B877"/><path d="M16 18 l-3 8 M24 16 l-3 9 M32 18 l-3 8" stroke-width="1.800"/>`,
  cheese: `<path d="M4 34 L40 13 L44 34 V42 H4Z" fill="${C.yellow}"/><path d="M4 34 H44" stroke-width="1.800"/><circle cx="17" cy="38" r="2.600" fill="${C.orange}" stroke="none"/><circle cx="31" cy="27" r="3.200" fill="${C.orange}" stroke="none"/><circle cx="35" cy="38" r="2.200" fill="${C.orange}" stroke="none"/>`,
  friedegg: `<path d="M8 26 Q4 12 18 12 Q26 4 34 12 Q46 16 42 28 Q44 42 28 42 Q12 46 8 26Z" fill="${C.white}"/><circle cx="25" cy="26" r="8.500" fill="${C.yellow}"/>`,
  watermelon: _slice(C.green, C.red) + `<path d="M17 19 v.100 M24 25 v.100 M31 19 v.100 M24 17 v.100" stroke-width="3"/>`,
  cookie: `<circle cx="24" cy="24" r="18" fill="#D9A866"/><path d="M16 17 v.100 M28 15 v.100 M32 26 v.100 M20 29 v.100 M26 34 v.100 M14 25 v.100" stroke="${C.dwood}" stroke-width="4.500"/>`,
  pudding: `<path d="M3 41 h42"/><path d="M13 14 h22 l7 23 q0 4 -4 4 h-28 q-4 0 -4 -4z" fill="${C.yellow}"/><path d="M13 14 h22 l2.500 8 q-13.500 5 -27 0z" fill="${C.dwood}"/><circle cx="24" cy="9" r="4" fill="${C.red}"/>`,
  candy: `<path d="M13 24 L3 15 V33Z M35 24 L45 15 V33Z" fill="${C.coral}"/><circle cx="24" cy="24" r="11.500" fill="${C.pink}"/><path d="M17 20 q7 -5 14 0 M17 28 q7 5 14 0" stroke-width="1.600"/>`,
  tomato: `<circle cx="24" cy="28" r="17" fill="${C.red}"/><path d="M24 13 l-9 -5 l6 7 l-8 2 l11 2 l11 -2 l-8 -2 l6 -7z" fill="${C.green}" stroke-width="1.800"/>`,
  // 药
  pearsoup: `<path d="M17 12 q-3 -4 0 -8 M28 12 q-3 -4 0 -8"/><path d="M5 22 h38 q-2 20 -19 20 q-17 0 -19 -20z" fill="${C.white}"/><ellipse cx="24" cy="22" rx="19" ry="4.200" fill="#F3E3A8" stroke-width="1.600"/><path d="M19 22 q-1 -7 5 -7 q6 0 5 7z" fill="${C.lgreen}" stroke-width="1.600"/>`,
  feverpatch: `<g transform="rotate(-12 24 24)"><rect x="4" y="13" width="40" height="22" rx="7" fill="${C.sky}"/><path d="M13 20 h22 M13 28 h22" stroke="#fff" stroke-width="2.400"/></g>`,
  vitamin: `<rect x="15" y="4" width="18" height="9" rx="2" fill="${C.orange}"/><rect x="10" y="13" width="28" height="31" rx="7" fill="${C.cream}"/><circle cx="24" cy="29" r="8.500" fill="${C.orange}"/><path d="M20 29 h8 M24 25 v8" stroke="#fff" stroke-width="2.600"/>`,
  panacea: `<rect x="19" y="3" width="10" height="7" rx="2" fill="${C.wood}"/><path d="M20 10 v10 L8 38 q-2 6 4 6 h24 q6 0 4 -6 L28 20 v-10z" fill="#E6F0E8"/><path d="M14 30 L11.500 37 q-1.500 5 3 5 h19 q4.500 0 3 -5 L34 30z" fill="${C.purple}" stroke-width="1.600"/>` + _star(24, 36, 4.800, 2.100, C.yellow),
  // 装扮
  beret: `<path d="M25 11 l3 -7"/><path d="M5 30 Q1 11 24 11 Q47 11 43 30 Q24 39 5 30Z" fill="${C.coral}"/>`,
  flowerclip: _petals(24, 24, 5, 9.500, 6.500, 8, C.pink) + `<circle cx="24" cy="24" r="5" fill="${C.yellow}"/>`,
  cap: `<path d="M26 30 Q45 27 47 37 Q36 33 26 36Z" fill="#6F9DB5"/><path d="M7 32 Q7 9 24 9 Q41 9 41 32Z" fill="${C.blue}"/><circle cx="24" cy="9" r="3" fill="${C.cream}"/>`,
  wizard: `<path d="M12 37 Q20 18 30 3 Q32 22 36 37Z" fill="#8E7DB8"/><path d="M3 40 Q24 30 45 40 Q24 47 3 40Z" fill="#7C6BA6"/>` + _star(25, 26, 4.800, 2.100, C.yellow),
  // 旅行用品
  umbrella: `<path d="M24 8 V40 q0 5 -5 4"/><path d="M4 26 Q6 8 24 8 Q42 8 44 26 Q38 20 34 26 Q29 20 24 26 Q19 20 14 26 Q10 20 4 26Z" fill="${C.coral}"/>`,
  goggles: `<path d="M5 22 l-3 -3 M43 22 l3 -3"/><rect x="5" y="13" width="38" height="22" rx="10" fill="${C.sky}"/><path d="M24 13 v22" stroke-width="1.800"/><path d="M11 20 q3 -3 7 -3 M30 20 q3 -3 7 -3" stroke="#fff" stroke-width="2.200"/>`,
  camera: `<rect x="16" y="7" width="13" height="8" rx="2" fill="#8C8478"/><rect x="4" y="14" width="40" height="27" rx="5" fill="#A39A8C"/><circle cx="24" cy="27" r="9.500" fill="${C.sky}"/><circle cx="24" cy="27" r="4" fill="${C.white}" stroke-width="1.600"/><circle cx="38" cy="20" r="2" fill="${C.yellow}" stroke="none"/>`,
  // 特产
  dango: `<path d="M24 47 V3"/><circle cx="24" cy="12" r="7.500" fill="${C.pink}"/><circle cx="24" cy="25" r="7.500" fill="${C.white}"/><circle cx="24" cy="38" r="7.500" fill="${C.lgreen}"/>`,
  yogurt: `<path d="M12 13 h24 l-3 29 q0 2 -3 2 h-12 q-3 0 -3 -2z" fill="${C.white}"/><rect x="9" y="7" width="30" height="7" rx="2" fill="${C.blue}"/><path d="M17 26 q7 -7 14 0 q-7 8 -14 0z" fill="${C.pink}" stroke-width="1.600"/>`,
  springwater: `<rect x="19" y="2" width="10" height="7" rx="2" fill="${C.blue}"/><path d="M17 9 h14 l3 8 v26 q0 3 -3 3 h-14 q-3 0 -3 -3 v-26z" fill="#EEF5F4"/><rect x="14" y="24" width="20" height="11" fill="${C.sky}" stroke-width="1.600"/>`,
  melon: _slice(C.lgreen, '#F3C98B') + `<path d="M17 19 v.100 M24 23 v.100 M31 19 v.100" stroke="${C.dwood}" stroke-width="3"/>`,
  roll: `<path d="M7 19 v13 a17 9 0 0 0 34 0 v-13" fill="#5E6B55"/><ellipse cx="24" cy="19" rx="17" ry="9" fill="${C.white}"/><circle cx="19" cy="18" r="3.800" fill="${C.orange}" stroke="none"/><circle cx="28" cy="21" r="3.800" fill="${C.green}" stroke="none"/>`,
  cottoncandy: `<path d="M24 47 V28"/><path d="M10 27 a9 9 0 0 1 4 -17 a11 11 0 0 1 20 0 a9 9 0 0 1 4 17 a10.500 10.500 0 0 1 -28 0z" fill="${C.pink}"/><path d="M16 17 q4 -5 9 -3 M27 24 q4 1 6 -3" stroke="#fff" stroke-width="2"/>`,
  marshmallow: `<path d="M5 45 L41 7"/><g transform="rotate(-46 27 19)"><rect x="18" y="11" width="18" height="16" rx="6" fill="${C.white}"/><path d="M22 16 q5 -3 10 0" stroke="${C.dwood}" stroke-width="2.400"/></g>`,
  shavedice: `<path d="M10 26 Q12 5 24 5 Q36 5 38 26Z" fill="${C.white}"/><path d="M15 17 q9 -9 18 0" stroke="${C.red}" stroke-width="4.500" opacity=".75"/><path d="M5 26 h38 q-2 17 -19 17 q-17 0 -19 -17z" fill="${C.sky}"/>`
});

/* ---------- 第二批旅行目的地的明信片 ---------- */
const _arcBow = (cx, cy, r) => `<path d="M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}" stroke="${C.coral}" stroke-width="6" opacity=".8"/><path d="M${cx - r + 9} ${cy} A${r - 9} ${r - 9} 0 0 1 ${cx + r - 9} ${cy}" stroke="${C.yellow}" stroke-width="6" opacity=".8"/><path d="M${cx - r + 18} ${cy} A${r - 18} ${r - 18} 0 0 1 ${cx + r - 18} ${cy}" stroke="${C.blue}" stroke-width="6" opacity=".8"/>`;
const _burst = (x, y, c, s) => `<path d="M${x} ${y} l0 -${13 * s} M${x} ${y} l${11 * s} -${7 * s} M${x} ${y} l${11 * s} ${7 * s} M${x} ${y} l0 ${13 * s} M${x} ${y} l-${11 * s} ${7 * s} M${x} ${y} l-${11 * s} -${7 * s}" stroke="${c}" stroke-width="2.600"/>`;
Object.assign(CARD_BG, {
  sakura(r) {
    let petals = '';
    for (let i = 0, n = r ? 30 : 10; i < n; i++) { const x = (i * 53 + 17) % 296, y = (i * 37 + 11) % 150 + 18; petals += `<ellipse cx="${x}" cy="${y}" rx="3.400" ry="2" fill="#F2B8C0" stroke="none" transform="rotate(${i * 40} ${x} ${y})"/>`; }
    const tree = (x, s) => `<path d="M${x} 152 q-4 -30 2 -${50 * s}" stroke="${C.dwood}" stroke-width="${7 * s}"/>` +
      `<path d="M${x + 2 - 34 * s} ${152 - 52 * s} a${18 * s} ${16 * s} 0 0 1 ${14 * s} -${24 * s} a${22 * s} ${20 * s} 0 0 1 ${40 * s} 0 a${18 * s} ${16 * s} 0 0 1 ${14 * s} ${24 * s} a${34 * s} ${16 * s} 0 0 1 -${68 * s} 0z" fill="#F2B8C0"/>`;
    return `<rect width="300" height="200" fill="#F7ECE6" stroke="none"/><circle cx="254" cy="34" r="15" fill="#F3D98B"/>
      ${_hill('M0 124 Q90 96 170 120 T300 108 V200 H0Z', '#D6E5BD')}${tree(150, .7)}${tree(48, 1)}${tree(240, 1.150)}
      ${_hill('M0 146 Q150 130 300 144 V200 H0Z', '#B9D398')}
      <path d="M126 200 Q144 170 150 148 Q158 170 178 200Z" fill="#EFE3C4"/>${petals}
      ${r ? `<rect x="196" y="168" width="56" height="20" rx="3" fill="${C.coral}" transform="rotate(-5 224 178)"/><g transform="translate(198 134) scale(.400)">${FRIEND_DRAW.duck()}</g>` : ''}`;
  },
  meadow(r) {
    const sheep = (x, y) => `<path d="M${x - 6} ${y + 8} v7 M${x + 7} ${y + 8} v7" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="15" ry="10" fill="${C.white}"/><circle cx="${x - 14}" cy="${y - 3}" r="6" fill="#5B4636" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 70 : 60}" cy="${r ? 60 : 36}" r="${r ? 24 : 17}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${r ? `<path d="M168 62 l-6 16 h12z" fill="${C.wood}" stroke-width="1.600"/><ellipse cx="168" cy="38" rx="19" ry="23" fill="${C.coral}"/><path d="M168 15 v46 M158 19 q-7 19 0 40 M178 19 q7 19 0 40" stroke-width="1.400"/>` : ''}
      ${_hill('M0 122 Q80 84 160 112 T300 98 V200 H0Z', '#C9DDB0')}
      <path d="M216 138 v-22 q26 -22 52 0 v22z" fill="${C.white}"/><path d="M210 118 q32 -30 64 0z" fill="${C.sand}"/><path d="M235 138 v-13 a7 7 0 0 1 14 0 v13" fill="${C.coral}"/>
      ${_hill('M0 142 Q150 122 300 140 V200 H0Z', '#A9C987')}
      ${sheep(152, 152)}${sheep(198, 170)}
      <path d="M120 180 l-3 -8 M120 180 l0 -10 M120 180 l3 -8 M260 174 l-3 -8 M260 174 l0 -10 M260 174 l3 -8" stroke="${C.dgreen}" stroke-width="2"/>`;
  },
  waterfall(r) {
    return `<rect width="300" height="200" fill="#DCECE6" stroke="none"/>
      <path d="M-6 -6 H112 Q100 60 114 152 H-6Z" fill="#9DB89A"/><path d="M306 -6 H188 Q200 60 186 152 H306Z" fill="#8FAE8C"/>
      <path d="M112 -6 H188 Q200 60 186 152 H114 Q100 60 112 -6Z" fill="#EEF5F4"/>
      <path d="M128 2 q-6 70 2 144 M150 2 v146 M172 2 q6 70 -2 144" stroke="${C.blue}" stroke-width="2.400"/>
      <path d="M40 60 L52 30 L64 60Z M236 76 L248 46 L260 76Z" fill="${C.dgreen}"/>
      ${r ? _arcBow(150, 150, 96) : ''}
      <path d="M38 152 Q150 134 262 152 Q252 192 150 194 Q48 192 38 152Z" fill="${C.sky}"/>
      <g stroke="none" fill="#fff" opacity=".85"><ellipse cx="128" cy="150" rx="20" ry="9"/><ellipse cx="156" cy="146" rx="24" ry="10"/><ellipse cx="180" cy="152" rx="18" ry="8"/></g>
      <path d="M-6 150 Q46 140 78 160 Q72 190 60 206 H-6Z" fill="#A9C987"/><path d="M306 150 Q254 140 222 160 Q228 190 240 206 H306Z" fill="#A9C987"/>`;
  },
  desert(r) {
    const camel = (x, y) => `<path d="M${x} ${y} q4 -14 12 -8 q4 -10 10 0 q6 -6 10 2 l4 -11 l5 2 l-4 13 v15 h-4 v-11 h-22 v11 h-4z" fill="${C.dwood}" stroke-width="1.600"/>`;
    const arm = d => `<path d="${d}" stroke="${C.line}" stroke-width="10"/><path d="${d}" stroke="${C.green}" stroke-width="5.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F3D2A8' : '#F6E9C8'}" stroke="none"/>
      <circle cx="58" cy="42" r="${r ? 24 : 18}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 120 Q70 84 150 116 T300 100 V200 H0Z', '#EBD39A')}
      ${r ? camel(172, 100) + camel(216, 96) : ''}
      ${_hill('M0 148 Q100 126 190 144 T300 138 V200 H0Z', '#E3C27F')}
      ${arm('M40 138 h-11 v-14')}${arm('M48 130 h11 v-12')}<path d="M36 156 V112 q0 -8 8 -8 q8 0 8 8 V156z" fill="${C.green}"/>
      <ellipse cx="238" cy="172" rx="42" ry="12" fill="${C.sky}"/>
      <path d="M262 166 q-7 -30 2 -54" stroke="${C.dwood}" stroke-width="6"/>
      <path d="M264 112 q-26 -12 -38 6 q22 -6 38 -6z M264 112 q-10 -24 -32 -20 q18 6 32 20z M264 112 q22 -14 36 2 q-20 -4 -36 -2z M264 112 q8 -22 28 -22 q-14 8 -28 22z" fill="${C.green}" stroke-width="1.800"/>`;
  },
  ocean(r) {
    let bub = '';
    [[30, 40, 5], [52, 92, 3.500], [252, 60, 4.500], [272, 122, 3], [204, 28, 3.500], [96, 20, 3]].forEach(b => { bub += `<circle cx="${b[0]}" cy="${b[1]}" r="${b[2]}" stroke="#fff" stroke-width="1.800"/>`; });
    const fish = (x, y, c, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M-14 0 Q-4 -10 8 -2 L16 -8 V8 L8 2 Q-4 10 -14 0Z" fill="${c}"/><circle cx="-8" cy="-1.500" r="1.600" fill="${C.line}" stroke="none"/></g>`;
    return `<rect width="300" height="200" fill="#8FC0D4" stroke="none"/>
      <path d="M60 -6 L16 206 H92 L112 -6Z M172 -6 L192 206 H256 L212 -6Z" fill="#A9D2DF" stroke="none" opacity=".7"/>
      ${fish(56, 64, C.orange)}${fish(246, 92, C.yellow, 1)}${fish(222, 44, C.pink)}
      ${r ? `<path d="M176 158 q30 -32 82 -12 q10 -14 22 -12 q-4 12 -8 18 q-10 26 -62 22 q-28 -2 -34 -16z" fill="#6F9DB5"/><circle cx="204" cy="152" r="2.200" fill="${C.line}" stroke="none"/><rect x="26" y="158" width="36" height="24" rx="3" fill="${C.wood}"/><path d="M26 168 h36 M44 164 v8" stroke-width="2"/>` : ''}
      ${_hill('M-6 178 Q150 162 306 176 V206 H-6Z', C.sand)}
      <path d="M92 180 q-8 -16 0 -30 q8 -14 0 -28 M108 182 q8 -14 0 -28" stroke="${C.dgreen}" stroke-width="5"/>
      <path d="M278 180 v-26 m0 12 l-11 -11 m11 4 l11 -13" stroke="${C.coral}" stroke-width="5"/>${bub}`;
  },
  oceanFront() {
    return `<circle cx="150" cy="96" r="52" fill="rgba(255,255,255,.2)" stroke="#fff" stroke-width="2.600"/><path d="M116 70 q8 -15 23 -19" stroke="#fff" stroke-width="3.200"/>`;
  },
  ferris(r) {
    let cab = '', st = '', lights = '';
    const cs = [C.coral, C.yellow, C.blue, C.pink, C.lgreen, C.purple, C.orange, C.sky];
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, x = 210 + Math.cos(a) * 58, y = 90 + Math.sin(a) * 58; cab += `<path d="M210 90 L${x.toFixed(1)} ${y.toFixed(1)}" stroke-width="1.600"/><rect x="${(x - 8).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="16" height="13" rx="3" fill="${cs[i]}" stroke-width="1.600"/>`; }
    [[24, 26], [70, 44], [118, 20], [150, 52], [280, 30], [44, 70]].forEach(p => { st += `<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="#FFF6C9"/>`; });
    for (let i = 0; i < 9; i++) lights += `<circle cx="${14 + i * 15}" cy="${112 + Math.round(8 * Math.sin(i / 8 * Math.PI))}" r="3" fill="${cs[i % 8]}" stroke="none"/>`;
    return `<rect width="300" height="200" fill="#3E4A7A" stroke="none"/><g stroke="none">${st}</g>
      ${r ? _burst(64, 46, C.yellow, 1.100) + _burst(118, 70, C.coral, .800) + _burst(28, 84, C.pink, .700) : `<path d="M62 26 A15 15 0 1 0 76 50 A12 12 0 0 1 62 26Z" fill="#FFF6C9"/>`}
      <path d="M210 90 L180 160 M210 90 L240 160" stroke-width="4"/><circle cx="210" cy="90" r="58"/>${cab}<circle cx="210" cy="90" r="6" fill="${C.yellow}"/>
      ${_hill('M-6 158 Q150 146 306 156 V206 H-6Z', '#56755A')}
      <path d="M8 162 L36 120 L64 162Z" fill="${C.coral}"/><path d="M28 162 L36 120 L44 162Z" fill="${C.cream}"/>
      <path d="M10 112 Q76 126 140 112" stroke-width="1.600"/>${lights}`;
  }
});

/* ---------- 第三批图标：做菜用的蔬菜、锅、楼梯、布置 ---------- */
Object.assign(ICONS, {
  lettuce: `<path d="M24 44 Q6 40 6 24 Q6 10 16 10 Q18 4 24 6 Q30 4 32 10 Q42 10 42 24 Q42 40 24 44Z" fill="${C.lgreen}"/><path d="M24 44 V16 M24 31 q-8 -4 -10 -12 M24 27 q8 -4 10 -10" stroke="${C.dgreen}" stroke-width="1.800"/>`,
  potato: `<path d="M10 28 Q6 14 20 10 Q36 6 42 20 Q46 34 32 40 Q16 44 10 28Z" fill="#E2C48A"/><path d="M18 20 v.100 M30 18 v.100 M26 30 v.100 M36 28 v.100" stroke="${C.dwood}" stroke-width="3"/>`,
  mushroom: `<path d="M18 26 h12 l3 16 q-9 4 -18 0z" fill="${C.cream}"/><path d="M4 26 Q4 6 24 6 Q44 6 44 26Z" fill="${C.coral}"/><circle cx="16" cy="17" r="3.500" fill="#fff" stroke="none"/><circle cx="30" cy="14" r="3" fill="#fff" stroke="none"/><circle cx="35" cy="21" r="2.400" fill="#fff" stroke="none"/>`,
  pumpkin: `<path d="M24 13 q2 -6 6 -8" stroke="${C.dgreen}" stroke-width="3.500"/><ellipse cx="24" cy="28" rx="19" ry="15" fill="#E9A04E"/><path d="M24 13 q-10 15 0 30 M24 13 q10 15 0 30 M12 17 q-6 11 0 22 M36 17 q6 11 0 22" stroke-width="1.600"/>`,
  eggplant: `<path d="M30 12 Q44 22 38 36 Q30 48 16 42 Q6 36 14 24 Q20 16 30 12Z" fill="#9A7DB8"/><path d="M30 12 q-9 -2 -11 5 q7 0 11 -5z M30 12 q7 -5 11 0 q-6 3 -11 0z" fill="${C.green}" stroke-width="1.800"/><path d="M30 12 l4 -8" stroke="${C.dgreen}" stroke-width="3"/>`,
  pot: `<path d="M17 12 q-3 -4 0 -8 M25 11 q-3 -4 0 -8 M33 12 q-3 -4 0 -8"/><path d="M8 26 h-6 M40 26 h6" stroke-width="3.500"/><path d="M8 20 h32 v16 q0 8 -8 8 h-16 q-8 0 -8 -8z" fill="${C.gray}"/><path d="M5 20 h38" stroke-width="4"/>`,
  stairsup: `<path d="M4 44 h10 v-10 h10 v-10 h10 v-10 h10"/><path d="M12 22 L26 8 M17 8 h9 v9" stroke="${C.dcoral || C.coral}" stroke-width="3"/>`,
  stairsdown: `<path d="M4 14 h10 v10 h10 v10 h10 v10 h10"/><path d="M26 8 L40 22 M31 22 h9 v-9" stroke="${C.coral}" stroke-width="3"/>`,
  sofa: `<path d="M10 26 V16 q0 -6 6 -6 h16 q6 0 6 6 v10" fill="#E9A090"/><rect x="5" y="23" width="38" height="15" rx="5" fill="${C.coral}"/><path d="M11 38 v6 M37 38 v6"/>`
});

/* 一道菜的图标：按做法（汤 / 沙拉 / 烤 / 炒）画盘子，用两种蔬菜的颜色上色 */
function dishIcon(kind, c1, c2) {
  const more = _dishIconMore(kind, c1, c2); if (more) return more;
  if (kind === 'soup') return `<path d="M17 12 q-3 -4 0 -8 M28 12 q-3 -4 0 -8"/><path d="M5 22 h38 q-2 20 -19 20 q-17 0 -19 -20z" fill="${C.white}"/><ellipse cx="24" cy="22" rx="19" ry="4.400" fill="${c1}" stroke-width="1.600"/><circle cx="17" cy="22" r="2.700" fill="${c2}" stroke="none"/><circle cx="27" cy="21" r="2.300" fill="${c2}" stroke="none"/><circle cx="33" cy="23" r="2" fill="${c2}" stroke="none"/>`;
  if (kind === 'salad') return `<path d="M6 24 h36 q-2 18 -18 18 q-16 0 -18 -18z" fill="${C.wood}"/><path d="M8 24 q2 -13 10 -10 q4 -9 12 -2 q10 -3 10 12z" fill="${c1}"/><circle cx="17" cy="19" r="3.200" fill="${c2}" stroke-width="1.400"/><circle cx="29" cy="17" r="3.200" fill="${c2}" stroke-width="1.400"/><circle cx="24" cy="22" r="2.600" fill="${c2}" stroke-width="1.400"/>`;
  if (kind === 'bake') return `<ellipse cx="24" cy="34" rx="21" ry="8" fill="${C.white}"/><ellipse cx="24" cy="27" rx="16" ry="9.500" fill="${c1}"/><path d="M14 25 q10 -6 20 0 M16 31 q8 -4 16 0" stroke="${c2}" stroke-width="3"/>`;
  return `<ellipse cx="24" cy="34" rx="21" ry="8" fill="${C.white}"/><path d="M9 32 q2 -17 15 -17 q13 0 15 17 q-15 6 -30 0z" fill="${c1}"/><circle cx="18" cy="26" r="3.500" fill="${c2}" stroke-width="1.400"/><circle cx="29" cy="24" r="3.500" fill="${c2}" stroke-width="1.400"/><circle cx="24" cy="31" r="3" fill="${c2}" stroke-width="1.400"/>`;
}

/* ---------- 家具 ----------
 * type：floor 放在地上，rug 是地毯（永远在最下面），wall 挂在墙上
 * w 是在房间里的宽度（和场景同一把尺子），vb 是画的时候的画布大小 */
const _fish = (x, y, c) => `<path d="M${x - 9} ${y} q7 -7 14 -1 l6 -4 v10 l-6 -4 q-7 6 -14 -1z" fill="${c}" stroke-width="1.400"/>`;
const FURNS = {
  rug:      { name: '圆地毯',   type: 'rug',   price: 0,   w: 440, vb: [440, 100], draw: () => `<ellipse cx="220" cy="50" rx="216" ry="46" fill="#E3B7A6"/><ellipse cx="220" cy="50" rx="180" ry="36" fill="#F1DFC4" stroke-width="1.800"/><ellipse cx="220" cy="50" rx="130" ry="24" fill="#C6D7AC" stroke-width="1.800"/>` },
  cushion:  { name: '软垫子',   type: 'floor', price: 0,   w: 180, vb: [180, 72],  draw: () => `<ellipse cx="90" cy="42" rx="86" ry="27" fill="${C.purple}"/><ellipse cx="90" cy="34" rx="70" ry="20" fill="#E6DCEF" stroke-width="2"/><ellipse cx="60" cy="27" rx="28" ry="11" fill="${C.white}" stroke-width="2.200"/>` },
  stump:    { name: '树桩茶桌', type: 'floor', price: 0,   w: 150, vb: [150, 112], draw: () => `<path d="M10 36 Q14 88 2 108 H148 Q136 88 140 36Z" fill="${C.dwood}"/><ellipse cx="75" cy="34" rx="66" ry="16" fill="#E2C79C"/><path d="M52 34 a22 6 0 0 0 44 0" stroke-width="1.600"/><path d="M92 28 q-2 -18 12 -18 q14 0 12 18z" fill="${C.cream}"/><path d="M116 14 q9 0 7 8 q-2 5 -8 4"/><path d="M46 30 h18 l-2 -11 h-14z" fill="${C.white}" stroke-width="2.200"/>` },
  cards:    { name: '明信片绳', type: 'wall',  price: 0,   w: 270, vb: [270, 112], draw: () => `<path d="M5 9 Q135 46 265 9" stroke-width="2"/><circle cx="5" cy="9" r="3.600" fill="${C.dwood}"/><circle cx="265" cy="9" r="3.600" fill="${C.dwood}"/>` },
  sofa:     { name: '小沙发',   type: 'floor', price: 90,  w: 200, vb: [200, 112], draw: () => `<path d="M30 98 v10 M170 98 v10"/><path d="M20 62 V26 Q20 8 40 8 H160 Q180 8 180 26 V62Z" fill="#E9A090"/><rect x="14" y="54" width="172" height="42" rx="12" fill="${C.coral}"/><rect x="4" y="40" width="28" height="58" rx="12" fill="#E9A090"/><rect x="168" y="40" width="28" height="58" rx="12" fill="#E9A090"/><path d="M100 56 v38" stroke-width="1.800"/>` },
  desk:     { name: '小书桌',   type: 'floor', price: 70,  w: 170, vb: [170, 122], draw: () => `<path d="M16 60 V118 M154 60 V118"/><rect x="100" y="58" width="52" height="28" fill="#E2C79C"/><circle cx="126" cy="72" r="3" fill="${C.line}" stroke="none"/><rect x="4" y="46" width="162" height="13" rx="4" fill="${C.wood}"/><rect x="18" y="38" width="38" height="8" fill="${C.blue}" stroke-width="1.800"/><rect x="22" y="30" width="30" height="8" fill="${C.coral}" stroke-width="1.800"/><path d="M122 46 v-22 l-14 -10"/><path d="M92 22 l20 -15 l9 14z" fill="${C.yellow}"/>` },
  bookcase: { name: '小书架',   type: 'floor', price: 85,  w: 120, vb: [120, 172], draw: () => {
    let b = '', cs = [C.blue, C.yellow, C.coral, C.purple, C.green, C.orange];
    [16, 66, 116].forEach((y, r) => { b += `<rect x="14" y="${y}" width="92" height="42" fill="#F3E6C8" stroke-width="1.800"/>`; for (let i = 0; i < 5; i++) { const h = 26 + (i * 7 + r * 5) % 13; b += `<rect x="${20 + i * 15}" y="${y + 42 - h}" width="12" height="${h}" fill="${cs[(i + r * 2) % 6]}" stroke-width="1.600"/>`; } });
    return `<rect x="6" y="6" width="108" height="162" rx="4" fill="${C.wood}"/>${b}`; } },
  lampf:    { name: '落地灯',   type: 'floor', price: 55,  w: 70,  vb: [70, 172],  draw: () => `<path d="M35 60 V160"/><ellipse cx="35" cy="162" rx="22" ry="7" fill="${C.dwood}"/><path d="M12 62 L22 14 H48 L58 62Z" fill="${C.yellow}"/>` },
  plant:    { name: '大盆栽',   type: 'floor', price: 45,  w: 90,  vb: [90, 142],  draw: () => `<path d="M45 98 q-36 -20 -31 -66 q31 17 31 66z" fill="${C.green}"/><path d="M45 98 q36 -20 31 -66 q-31 17 -31 66z" fill="${C.green}"/><path d="M45 98 q-13 -52 0 -92 q13 40 0 92z" fill="${C.lgreen}"/><path d="M22 98 h46 l-6 40 h-34z" fill="${C.orange}"/>` },
  toybox:   { name: '玩具箱',   type: 'floor', price: 60,  w: 120, vb: [120, 92],  draw: () => `<circle cx="36" cy="28" r="15" fill="${C.coral}"/><rect x="62" y="12" width="24" height="24" fill="${C.yellow}" transform="rotate(12 74 24)"/><path d="M94 36 l8 -22 l8 22z" fill="${C.green}"/><rect x="6" y="36" width="108" height="52" rx="5" fill="${C.blue}"/><path d="M6 50 h108" stroke-width="1.800"/>${_star(60, 70, 11, 5, C.yellow)}` },
  bed:      { name: '小木床',   type: 'floor', price: 130, w: 220, vb: [220, 122], draw: () => `<path d="M34 94 v24 M206 94 v24"/><path d="M8 102 V34 Q8 14 30 14 Q52 14 52 34 V102Z" fill="${C.wood}"/><rect x="30" y="58" width="184" height="32" rx="8" fill="${C.white}"/><ellipse cx="62" cy="56" rx="24" ry="10" fill="${C.cream}"/><path d="M88 54 H214 V94 H88 Q80 74 88 54Z" fill="${C.pink}"/><path d="M110 66 v.100 M140 78 v.100 M170 64 v.100 M196 80 v.100 M126 84 v.100" stroke="#fff" stroke-width="5"/>` },
  fishtank: { name: '小鱼缸',   type: 'floor', price: 110, w: 130, vb: [130, 132], draw: () => `<rect x="14" y="82" width="102" height="46" rx="4" fill="${C.wood}"/><path d="M14 104 h102" stroke-width="1.800"/><rect x="8" y="10" width="114" height="74" rx="8" fill="${C.sky}"/><path d="M12 24 h106" stroke="#fff" stroke-width="2"/><path d="M30 82 q-6 -14 0 -26 M38 82 q6 -12 0 -22" stroke="${C.dgreen}" stroke-width="3.500"/>${_fish(60, 44, C.orange)}${_fish(92, 62, C.yellow)}<circle cx="100" cy="36" r="3" stroke="#fff" stroke-width="1.600"/><circle cx="108" cy="26" r="2" stroke="#fff" stroke-width="1.600"/>` },
  piano:    { name: '玩具钢琴', type: 'floor', price: 120, w: 150, vb: [150, 112], draw: () => `<path d="M22 86 v22 M128 86 v22"/><rect x="8" y="42" width="134" height="46" fill="#8C7B8C"/><rect x="4" y="30" width="142" height="14" rx="3" fill="#6F5F70"/><rect x="14" y="60" width="122" height="20" fill="${C.white}" stroke-width="1.800"/><path d="M26 60 v20 M38 60 v20 M50 60 v20 M62 60 v20 M74 60 v20 M86 60 v20 M98 60 v20 M110 60 v20 M122 60 v20" stroke-width="1.400"/><path d="M32 60 v11 M44 60 v11 M68 60 v11 M80 60 v11 M92 60 v11 M116 60 v11" stroke-width="5"/>` },
  globe:    { name: '地球仪',   type: 'floor', price: 50,  w: 70,  vb: [70, 102],  draw: () => `<path d="M20 98 h30 M35 98 v-16"/><path d="M9 46 a27 27 0 0 0 51 9"/><circle cx="35" cy="42" r="24" fill="${C.sky}"/><path d="M24 30 q8 -6 14 0 q2 8 -6 10 q-10 0 -8 -10z M40 46 q8 -2 10 6 q-4 8 -10 4z" fill="${C.green}" stroke-width="1.600"/>` },
  teepee:   { name: '游戏帐篷', type: 'floor', price: 100, w: 150, vb: [150, 152], draw: () => `<path d="M66 4 l18 18 M84 4 l-18 18"/><path d="M75 12 L140 146 H10Z" fill="${C.cream}"/><path d="M75 62 L100 146 H50Z" fill="${C.coral}"/><path d="M36 92 l10 8 l10 -8 l10 8 M84 100 l10 -8 l10 8 l10 -8" stroke="${C.blue}" stroke-width="3"/>` },
  rug2:     { name: '条纹地毯', type: 'rug',   price: 50,  w: 380, vb: [380, 92],  draw: () => `<path d="M2 20 l-0 0 M10 14 v64 M370 14 v64" stroke-width="1.600"/><rect x="14" y="8" width="352" height="76" rx="26" fill="${C.blue}"/><path d="M80 9 v74 M140 9 v74 M200 9 v74 M260 9 v74 M320 9 v74" stroke="${C.cream}" stroke-width="16"/><rect x="14" y="8" width="352" height="76" rx="26"/>` },
  rug3:     { name: '星星地毯', type: 'rug',   price: 60,  w: 300, vb: [300, 84],  draw: () => `<ellipse cx="150" cy="42" rx="146" ry="38" fill="${C.purple}"/><ellipse cx="150" cy="42" rx="120" ry="29" stroke="#fff" stroke-width="2" stroke-dasharray="6 8"/><g transform="translate(150 42) scale(1 .560)">${_star(0, 0, 44, 19, C.yellow)}</g>` },
  clock:    { name: '小挂钟',   type: 'wall',  price: 40,  w: 70,  vb: [70, 70],   draw: () => `<circle cx="35" cy="35" r="30" fill="${C.white}"/><path d="M35 9 v5 M35 56 v5 M9 35 h5 M56 35 h5" stroke-width="2"/><path d="M35 35 V17 M35 35 L48 43"/><circle cx="35" cy="35" r="3" fill="${C.coral}"/>` },
  painting: { name: '风景画',   type: 'wall',  price: 55,  w: 120, vb: [120, 92],  draw: () => `<rect x="4" y="4" width="112" height="84" rx="4" fill="${C.wood}"/><rect x="13" y="13" width="94" height="66" fill="${C.sky}" stroke-width="1.800"/><circle cx="86" cy="32" r="9" fill="#F3D98B" stroke-width="1.600"/><path d="M13 79 V58 Q40 40 62 60 Q84 46 107 58 V79Z" fill="${C.green}" stroke-width="1.800"/>` },
  lights:   { name: '小灯串',   type: 'wall',  price: 65,  w: 300, vb: [300, 54],  draw: () => {
    let b = ''; const cs = [C.coral, C.yellow, C.blue, C.pink, C.lgreen, C.purple, C.orange, C.yellow];
    for (let i = 0; i < 8; i++) { const t = (i + .5) / 8, x = 5 + 290 * t, y = 8 + 4 * 16 * t * (1 - t) * 2.2; b += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} v6" stroke-width="1.600"/><ellipse cx="${x.toFixed(1)}" cy="${(y + 13).toFixed(1)}" rx="6" ry="8" fill="${cs[i]}" stroke-width="1.800"/>`; }
    return `<path d="M5 8 Q150 78 295 8" stroke-width="2"/>${b}`; } },
  frame:    { name: '爱心相框', type: 'wall',  price: 45,  w: 80,  vb: [80, 92],   draw: () => `<rect x="5" y="5" width="70" height="82" rx="8" fill="${C.white}"/><rect x="5" y="5" width="70" height="82" rx="8" stroke="${C.orange}" stroke-width="6"/><path d="M40 68 q-26 -18 -18 -34 q8 -11 18 2 q10 -13 18 -2 q8 16 -18 34z" fill="${C.pink}" stroke-width="1.800"/>` },
  shelfw:   { name: '小搁板',   type: 'wall',  price: 50,  w: 140, vb: [140, 74],  draw: () => `<path d="M20 62 v10 M120 62 v10"/><rect x="4" y="52" width="132" height="10" rx="3" fill="${C.wood}"/><path d="M22 52 l4 -20 h20 l4 20z" fill="${C.orange}"/><path d="M36 32 q-10 -14 0 -26 q10 12 0 26z" fill="${C.green}"/><path d="M70 52 q-6 -18 4 -24 h16 q10 6 4 24z" fill="#E2EFE6"/><rect x="106" y="26" width="12" height="26" fill="${C.purple}" stroke-width="1.800"/><rect x="119" y="32" width="11" height="20" fill="${C.yellow}" stroke-width="1.800"/>` }
};
function furnSVG(id) {
  const f = FURNS[id]; if (!f) return '';
  return `<svg viewBox="0 0 ${f.vb[0]} ${f.vb[1]}">${G_OPEN('wob-m', 2.6)}${f.draw()}</g></svg>`;
}

/* ---------- 二楼：小阁楼 ---------- */
function sceneAtticSVG() {
  let stars = '', dots = '';
  [[372, 128], [392, 172], [430, 166], [416, 120]].forEach(p => { stars += `<circle cx="${p[0]}" cy="${p[1]}" r="2.200" fill="#FFF6C9"/>`; });
  [[150, 250], [240, 300], [560, 300], [650, 250], [330, 330], [470, 330]].forEach(p => { dots += _star(p[0], p[1], 9, 4, '#F1DDA6'); });
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="372" fill="#EFE6D2" stroke="none"/>
    <g stroke-width="1.400">${dots}</g>
    <rect width="800" height="372" fill="url(#hatch)" stroke="none"/>
    <path d="M-10 -10 H330 L-10 250Z" fill="#DBC196"/><path d="M810 -10 H470 L810 250Z" fill="#DBC196"/>
    <path d="M330 -10 L-10 250 M470 -10 L810 250" stroke-width="6"/>
    <path d="M250 -10 L-10 190 M170 -10 L-10 128 M550 -10 L810 190 M630 -10 L810 128" stroke="#C4A77A" stroke-width="2"/>
    <circle cx="400" cy="150" r="64" fill="${C.white}"/>
    <circle class="win-sky" cx="400" cy="150" r="52" stroke="none"/>
    <circle class="win-sun" cx="424" cy="132" r="13" stroke="none"/>
    <g class="win-stars" stroke="none">${stars}</g>
    <path d="M400 98 V202 M348 150 H452" stroke="${C.white}" stroke-width="6"/><path d="M400 98 V202 M348 150 H452" stroke-width="1.600"/>
    <circle cx="400" cy="150" r="52"/>
    <rect y="372" width="800" height="128" fill="#DBC196" stroke="none"/>
    <path d="M0 372 H800" stroke-width="2.600"/>
    <path d="M0 414 H800 M0 458 H800 M130 374 v40 M430 374 v40 M690 374 v40 M270 414 v44 M570 414 v44 M100 458 v42 M410 458 v42 M710 458 v42" stroke="#C4A77A" stroke-width="2"/>
    <path d="M694 392 h100 v64 h-100z" fill="#8C6F4E"/><path d="M704 404 h80 M704 420 h80 M704 436 h80" stroke-width="2"/>
    <path d="M694 392 v-40 M794 392 v-40 M690 352 h108" stroke-width="4"/>
  </g></svg>`;
}

/* ==========================================================
 *  第四批：更多蔬菜和食材、零食饮料、装扮、家具、旅行用品、景点
 * ========================================================== */
const _dots = (pts, r, fill) => pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}" stroke="none"/>`).join('');
Object.assign(ICONS, {
  // 蔬菜
  cabbage: `<path d="M24 45 Q10 44 12 26 Q6 16 14 8 Q19 3 24 8 Q29 3 34 8 Q42 16 36 26 Q38 44 24 45Z" fill="${C.lgreen}"/><path d="M24 45 Q15 42 17 27 Q20 17 24 15 Q28 17 31 27 Q33 42 24 45Z" fill="${C.white}"/><path d="M24 41 V21" stroke-width="1.600"/>`,
  cucumber: `<g transform="rotate(-38 24 24)"><rect x="3" y="16" width="42" height="16" rx="8" fill="#8DB574"/><path d="M12 21 v.100 M20 27 v.100 M28 21 v.100 M36 27 v.100" stroke="${C.dgreen}" stroke-width="3"/></g>`,
  broccoli: `<path d="M19 28 h10 l2 16 h-14z" fill="${C.lgreen}"/><path d="M8 27 a8 8 0 0 1 3 -15 a10 10 0 0 1 17 -4 a9 9 0 0 1 12 9 a7.500 7.500 0 0 1 -1 12 q-15 5 -31 -2z" fill="#7FA86B"/><path d="M17 19 q2 -3 5 -3 M28 15 q3 0 4 3" stroke-width="1.600"/>`,
  spinach: `<path d="M24 44 Q8 30 12 10 Q22 14 24 44Z" fill="#6F9A66"/><path d="M24 44 Q40 30 36 10 Q26 14 24 44Z" fill="#6F9A66"/><path d="M24 44 Q16 22 24 4 Q32 22 24 44Z" fill="${C.green}"/><path d="M24 38 V12" stroke-width="1.600"/><path d="M21 44.500 h6" stroke="${C.coral}" stroke-width="4"/>`,
  onion: `<path d="M24 13 q-2 -5 -6 -9 M24 13 q1 -5 5 -9"/><path d="M24 12 Q42 18 40 32 Q36 44 24 44 Q12 44 8 32 Q6 18 24 12Z" fill="#C9A3C4"/><path d="M24 14 Q16 28 22 43 M24 14 Q32 28 26 43" stroke-width="1.600"/>`,
  sweetpotato: `<path d="M3 30 Q10 14 24 14 Q38 12 45 20 Q40 36 26 38 Q12 42 3 30Z" fill="#C0788A"/><path d="M14 27 l5 1 M25 21 l5 1 M30 31 l5 -1" stroke-width="1.600"/>`,
  pea: `<path d="M44 22 q3 -5 2 -9"/><path d="M4 22 Q24 6 44 22 Q24 42 4 22Z" fill="${C.green}"/><circle cx="14" cy="23" r="5" fill="${C.lgreen}" stroke-width="1.600"/><circle cx="24" cy="24" r="5.500" fill="${C.lgreen}" stroke-width="1.600"/><circle cx="34" cy="23" r="5" fill="${C.lgreen}" stroke-width="1.600"/>`,
  radish: `<path d="M24 15 v-11"/><path d="M22 14 Q12 4 8 6 Q10 14 20 16Z" fill="${C.green}"/><path d="M26 14 Q34 2 40 5 Q38 14 28 16Z" fill="${C.green}"/><path d="M14 18 Q24 10 34 18 Q36 34 24 46 Q12 34 14 18Z" fill="${C.white}"/><path d="M18 24 h5 M26 31 h5" stroke-width="1.600"/>`,
  // 厨房里的食材
  eggs: `<path d="M24 5 Q38 12 38 29 Q36 44 24 44 Q12 44 10 29 Q10 12 24 5Z" fill="#F3DFC0"/><path d="M16 28 q1 7 6 9" stroke="#fff" stroke-width="2.200"/>`,
  rice: `<path d="M9 24 Q10 8 24 8 Q38 8 39 24Z" fill="${C.white}"/><path d="M17 16 v.100 M24 13 v.100 M30 17 v.100 M21 20 v.100" stroke-width="2.600"/><path d="M5 24 h38 q-2 18 -19 18 q-17 0 -19 -18z" fill="${C.blue}"/><path d="M17 42.500 h14"/>`,
  noodle: `<path d="M30 4 L38 22 M36 3 L42 21" stroke="${C.dwood}" stroke-width="2.600"/><path d="M8 24 q4 -9 9 -4 q4 -8 9 -2 q5 -7 9 0 q4 -3 5 6z" fill="#F1DDA6"/><path d="M5 24 h38 q-2 18 -19 18 q-17 0 -19 -18z" fill="${C.coral}"/><path d="M17 42.500 h14"/>`,
  tofu: `<path d="M6 20 L24 11 L42 20 V36 L24 45 L6 36Z" fill="${C.white}"/><path d="M6 20 L24 29 L42 20 M24 29 V45" stroke-width="1.800"/><path d="M19 18 q5 -3 10 0" stroke="${C.green}" stroke-width="3"/>`,
  // 水果
  banana: `<path d="M14 8 l-2 -5" stroke-width="3.500"/><path d="M8 14 Q10 36 30 40 Q42 40 44 32 Q30 34 20 24 Q14 16 14 8 Q10 8 8 14Z" fill="#F3DC7A"/><path d="M13 16 Q18 30 34 35" stroke-width="1.500"/>`,
  grape: `<path d="M24 13 V4"/><path d="M24 7 q8 -6 13 0 q-6 6 -13 0z" fill="${C.green}"/>` + [[15, 19], [24, 18], [33, 19], [19.5, 27], [28.5, 27], [24, 35.5]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="5.500" fill="#A68BC4" stroke-width="1.600"/>`).join(''),
  // 零食
  icecream: `<path d="M14 24 L24 46 L34 24Z" fill="#E2B877"/><path d="M18 30 l9 6 M30 30 l-8 6" stroke-width="1.400"/><path d="M11 24 Q9 8 24 6 Q39 8 37 24 Q30 28 24 24 Q18 28 11 24Z" fill="${C.pink}"/><circle cx="24" cy="6" r="3.500" fill="${C.red}"/>`,
  donut: `<circle cx="24" cy="25" r="18" fill="#D9A866"/><path d="M7 22 Q8 7 24 7 Q40 7 41 22 Q38 28 34 24 Q30 30 26 25 Q21 30 17 25 Q12 29 7 22Z" fill="${C.pink}"/><circle cx="24" cy="24" r="5.500" fill="${C.paper}"/><path d="M14 15 l2 2 M24 11 v3 M33 15 l-2 2" stroke="#fff" stroke-width="2.400"/>`,
  popcorn: `<path d="M10 20 a6 6 0 0 1 6 -8 a7 7 0 0 1 12 -3 a6 6 0 0 1 10 5 a5 5 0 0 1 0 8z" fill="#FBEFC4"/><path d="M9 20 h30 l-4 24 h-22z" fill="${C.white}"/><path d="M17 21 l2 22 M24 21 v23 M31 21 l-2 22" stroke="${C.red}" stroke-width="3"/><path d="M9 20 h30 l-4 24 h-22z"/>`,
  dumpling: `<path d="M4 34 Q6 14 24 12 Q42 14 44 34 Q24 42 4 34Z" fill="${C.cream}"/><path d="M10 20 q4 3 3 7 M17 15 q4 3 3 7 M24 13 q3 4 1 8 M31 15 q2 4 -1 7 M38 20 q0 4 -3 6" stroke-width="1.600"/>`,
  // 饮料
  soymilk: _glass('#F1E3C0') + `<ellipse cx="38" cy="38" rx="6" ry="4.500" fill="#E2C48A" stroke-width="1.800" transform="rotate(-20 38 38)"/>`,
  lemonade: _glass('#F3E9A8') + `<path d="M20 3 l5 28" stroke="${C.green}" stroke-width="3"/><circle cx="37" cy="9" r="7" fill="${C.yellow}" stroke-width="1.800"/><path d="M37 9 v-7 M37 9 l6 3.500 M37 9 l-6 3.500" stroke-width="1.200"/>`,
  bubbletea: `<path d="M27 2 l-3 26" stroke="${C.coral}" stroke-width="3.500"/><path d="M11 12 h26 l-3 30 q0 2 -3 2 h-14 q-3 0 -3 -2z" fill="#E6C9A8"/><path d="M8 12 h32" stroke-width="4"/>` + _dots([[19, 37], [26, 39], [30, 34], [22, 32]], 2.600, C.line),
  coconut: `<circle cx="24" cy="28" r="17" fill="${C.dwood}"/><ellipse cx="24" cy="17" rx="11" ry="4.500" fill="${C.white}" stroke-width="1.800"/><path d="M28 17 L34 2" stroke="${C.coral}" stroke-width="3.200"/><path d="M14 31 q2 6 8 8" stroke-width="1.600"/>`,
  // 花
  lavender: _stem + `<path d="M24 26 V8"/>` + [5, 10, 15, 20].map((y, i) => `<ellipse cx="${24 + (i % 2 ? 3.5 : -3.5)}" cy="${y}" rx="4.800" ry="3.600" fill="${C.purple}" stroke-width="1.600"/>`).join(''),
  daisy: _stem + _petals(24, 15, 8, 8, 3.400, 5.500, C.white) + `<circle cx="24" cy="15" r="4.500" fill="${C.yellow}"/>`,
  // 药
  firstaid: `<path d="M17 12 v-4 q0 -3 3 -3 h8 q3 0 3 3 v4"/><rect x="5" y="12" width="38" height="30" rx="5" fill="${C.white}"/><path d="M24 19 v16 M16 27 h16" stroke="${C.red}" stroke-width="5"/>`,
  // 装扮
  leaf: `<path d="M8 40 Q6 12 40 8 Q42 40 8 40Z" fill="${C.green}"/><path d="M8 40 L32 16" stroke-width="1.800"/>`,
  bunny: `<path d="M14 30 Q6 6 14 4 Q22 6 20 27Z" fill="${C.white}"/><path d="M34 30 Q42 6 34 4 Q26 6 28 27Z" fill="${C.white}"/><path d="M15 24 Q12 12 15 9 M33 24 Q36 12 33 9" stroke="${C.pink}" stroke-width="3"/><path d="M6 41 Q24 22 42 41" stroke="${C.coral}" stroke-width="4"/>`,
  sunglasses: `<path d="M3 20 h42"/><path d="M5 20 h17 v6 q0 9 -8.500 9 q-8.500 0 -8.500 -9z" fill="#5B4636"/><path d="M26 20 h17 v6 q0 9 -8.500 9 q-8.500 0 -8.500 -9z" fill="#5B4636"/><path d="M9 25 l4 -2 M30 25 l4 -2" stroke="#fff" stroke-width="2"/>`,
  headphones: `<path d="M8 30 Q8 8 24 8 Q40 8 40 30" stroke-width="4"/><rect x="3" y="26" width="11" height="16" rx="5" fill="${C.coral}"/><rect x="34" y="26" width="11" height="16" rx="5" fill="${C.coral}"/>`,
  santa: `<path d="M8 36 Q10 12 30 8 Q42 10 42 22 Q36 16 32 20 Q38 28 38 36Z" fill="${C.red}"/><rect x="4" y="33" width="38" height="10" rx="5" fill="${C.white}"/><circle cx="42" cy="24" r="5" fill="${C.white}"/>`,
  halo: `<ellipse cx="24" cy="18" rx="18" ry="7" stroke-width="7.500"/><ellipse cx="24" cy="18" rx="18" ry="7" stroke="${C.yellow}" stroke-width="3.600"/>` + _star(24, 38, 6, 2.600, C.yellow),
  // 旅行用品
  boat: `<path d="M24 6 V30"/><path d="M25 8 L40 28 H25Z" fill="${C.cream}"/><path d="M22 12 L10 28 H22Z" fill="${C.coral}"/><path d="M4 31 h40 l-6 11 h-28z" fill="${C.wood}"/>`,
  hotair: `<path d="M18 34 l1 6 M30 34 l-1 6"/><path d="M24 4 Q42 4 42 20 Q40 30 30 34 H18 Q8 30 6 20 Q6 4 24 4Z" fill="${C.coral}"/><path d="M24 4 Q14 18 18 34 M24 4 Q34 18 30 34" stroke-width="1.600"/><rect x="18" y="39" width="12" height="7" rx="2" fill="${C.wood}"/>`,
  rocket: `<path d="M19 33 Q24 48 29 33Z" fill="${C.yellow}"/><path d="M15 26 L7 38 L16 34Z M33 26 L41 38 L32 34Z" fill="${C.coral}"/><path d="M24 3 Q35 14 33 33 H15 Q13 14 24 3Z" fill="${C.white}"/><circle cx="24" cy="18" r="5" fill="${C.sky}"/>`,
  // 特产
  lotussoup: `<path d="M5 22 h38 q-2 20 -19 20 q-17 0 -19 -20z" fill="${C.white}"/><ellipse cx="24" cy="22" rx="19" ry="4.200" fill="#F6EBD0" stroke-width="1.600"/><circle cx="15" cy="22" r="2.400" fill="${C.cream}" stroke-width="1.200"/><circle cx="33" cy="22.500" r="2.400" fill="${C.cream}" stroke-width="1.200"/><path d="M24 20 q-7 -8 0 -16 q7 8 0 16z" fill="${C.pink}" stroke-width="1.600"/>`,
  applepie: `<circle cx="24" cy="25" r="19" fill="#E2B877"/><circle cx="24" cy="25" r="13" fill="${C.red}" stroke-width="1.600"/><path d="M13 19 L35 31 M13 31 L35 19 M24 12 V38" stroke="#E2B877" stroke-width="4"/>`,
  pancake: `<ellipse cx="24" cy="36" rx="19" ry="6" fill="#E2B877"/><ellipse cx="24" cy="29" rx="19" ry="6" fill="#E2B877"/><ellipse cx="24" cy="22" rx="19" ry="6" fill="#EBC98F"/><path d="M10 22 Q14 30 18 24 Q24 34 30 24 Q34 28 38 22 Q24 14 10 22Z" fill="${C.dwood}" stroke-width="1.600"/><rect x="20" y="15" width="8" height="6" rx="1.500" fill="${C.yellow}" stroke-width="1.600"/>`,
  mushcookie: `<path d="M19 26 h10 l2 16 q-7 3 -14 0z" fill="#EBD3A6"/><path d="M5 26 Q5 7 24 7 Q43 7 43 26Z" fill="${C.dwood}"/><path d="M14 18 v.100 M24 13 v.100 M33 19 v.100" stroke="${C.cream}" stroke-width="4"/>`,
  cocojelly: `<path d="M34 21 L40 5" stroke="${C.coral}" stroke-width="3"/><path d="M5 22 h38 q-1 21 -19 21 q-18 0 -19 -21z" fill="${C.dwood}"/><ellipse cx="24" cy="22" rx="19" ry="6" fill="${C.white}"/><path d="M14 22 q4 -3 8 0" stroke="${C.sky}" stroke-width="2"/>`,
  popsicle: `<path d="M24 34 V46" stroke-width="6.500"/><path d="M24 34 V45" stroke="${C.wood}" stroke-width="3.200"/><path d="M12 34 V16 Q12 4 24 4 Q36 4 36 16 V34Z" fill="${C.sky}"/><path d="M12 23 Q24 29 36 23" stroke="#fff" stroke-width="3"/><path d="M19 12 v.100 M29 12 v.100" stroke-width="3.400"/><path d="M22 17 h4" stroke="${C.orange}" stroke-width="3"/>`,
  cloudbread: _cloud('#F3DDB0') + `<path d="M18 25 v.100 M30 25 v.100" stroke-width="3"/><path d="M22 28 q2 2 4 0" stroke-width="1.600"/>`,
  mooncake: `<circle cx="24" cy="24" r="19" fill="#D9A05C"/><circle cx="24" cy="24" r="13.500" stroke-width="1.600"/><path d="M19 28 A7 7 0 1 1 28 18 A5.500 5.500 0 0 0 19 28Z" fill="${C.yellow}" stroke-width="1.400"/>`
});

/* 新的做法：果汁、甜点、三明治、盖饭、面 */
function _dishIconMore(kind, c1, c2) {
  const bowl = f => `<path d="M5 24 h38 q-2 18 -19 18 q-17 0 -19 -18z" fill="${f}"/>`;
  if (kind === 'juice') return `<path d="M29 3 l-6 30" stroke="${C.coral}" stroke-width="3"/>` + _glass(c1) + `<circle cx="38" cy="10" r="6" fill="${c2}" stroke-width="1.800"/>`;
  if (kind === 'sweet') return `<ellipse cx="24" cy="38" rx="21" ry="6" fill="${C.white}"/><path d="M9 22 v13 q15 6 30 0 v-13z" fill="#F3E3B8"/><path d="M9.500 29 q14.500 6 29 0" stroke="${c2}" stroke-width="3"/><ellipse cx="24" cy="22" rx="15" ry="5.500" fill="${c1}"/><circle cx="24" cy="18" r="4" fill="${c2}" stroke-width="1.600"/>`;
  if (kind === 'bun') return `<path d="M6 37 h36 v4 q0 3 -3 3 h-30 q-3 0 -3 -3z" fill="#E9C98F"/><path d="M4 30 h40 v4 q-5 6 -10 2 q-5 5 -10 0 q-5 5 -10 0 q-5 4 -10 -2z" fill="${c2}"/><path d="M4 26 h40 v5 h-40z" fill="${c1}"/><path d="M5 26 L24 7 L43 26Z" fill="#E9C98F"/>`;
  if (kind === 'rice') return `<path d="M9 24 Q10 8 24 8 Q38 8 39 24Z" fill="${C.white}"/><circle cx="18" cy="17" r="4.200" fill="${c1}" stroke-width="1.400"/><circle cx="29" cy="15" r="4.200" fill="${c2}" stroke-width="1.400"/><circle cx="25" cy="21" r="3" fill="${c1}" stroke-width="1.400"/>` + bowl(C.blue);
  if (kind === 'noodle') return `<path d="M31 3 L37 20 M37 2 L41 19" stroke="${C.dwood}" stroke-width="2.400"/><path d="M8 24 q4 -9 9 -4 q4 -8 9 -2 q5 -7 9 0 q4 -3 5 6z" fill="#F1DDA6"/><circle cx="17" cy="19" r="3.600" fill="${c1}" stroke-width="1.400"/><circle cx="29" cy="18" r="3.600" fill="${c2}" stroke-width="1.400"/>` + bowl(C.coral);
  return '';
}

/* ---------- 新家具 ---------- */
Object.assign(FURNS, {
  stove:    { name: '小灶台',   type: 'floor', price: 95,  w: 130, vb: [130, 132], draw: () => `<path d="M56 22 q-4 -6 0 -12 M72 22 q-4 -6 0 -12"/><path d="M40 28 h50 v12 q0 6 -6 6 h-38 q-6 0 -6 -6z" fill="${C.gray}"/><path d="M32 30 h66" stroke-width="3.500"/><rect x="8" y="46" width="114" height="82" rx="5" fill="${C.white}"/><rect x="20" y="70" width="90" height="46" rx="4" fill="#C9D6E0" stroke-width="2"/><path d="M34 62 h62" stroke-width="4"/><circle cx="24" cy="57" r="3" fill="${C.coral}" stroke="none"/><circle cx="106" cy="57" r="3" fill="${C.coral}" stroke="none"/><path d="M4 46 h122" stroke-width="5"/>` },
  fridge:   { name: '小冰箱',   type: 'floor', price: 100, w: 90,  vb: [90, 172],  draw: () => `<path d="M18 164 v6 M72 164 v6"/><rect x="8" y="6" width="74" height="158" rx="8" fill="${C.sky}"/><path d="M8 62 h74"/><path d="M20 26 v22 M20 76 v34" stroke-width="4"/><rect x="46" y="82" width="15" height="13" fill="${C.yellow}" stroke-width="1.800"/><circle cx="64" cy="110" r="6.500" fill="${C.coral}" stroke-width="1.800"/>` },
  table:    { name: '小餐桌',   type: 'floor', price: 75,  w: 170, vb: [170, 112], draw: () => `<path d="M40 62 v46 M130 62 v46"/><path d="M14 44 h142 l-10 26 h-122z" fill="${C.pink}"/><ellipse cx="85" cy="42" rx="78" ry="14" fill="${C.cream}"/><circle cx="76" cy="31" r="7.500" fill="${C.red}" stroke-width="1.800"/><circle cx="93" cy="30" r="7.500" fill="${C.orange}" stroke-width="1.800"/><path d="M62 36 h46 q-2 12 -23 12 q-21 0 -23 -12z" fill="${C.blue}" stroke-width="2"/>` },
  horse:    { name: '小木马',   type: 'floor', price: 85,  w: 140, vb: [140, 122], draw: () => `<path d="M110 54 q14 2 14 22" stroke="${C.dwood}" stroke-width="5"/><path d="M44 66 h12 l-6 40 h-10z M84 66 h12 l8 40 h-10z" fill="${C.wood}"/><path d="M8 98 Q70 122 132 98 L128 107 Q70 131 12 107Z" fill="${C.wood}"/><path d="M34 50 Q36 38 52 40 H92 Q112 40 110 58 Q108 72 90 72 H52 Q36 72 34 50Z" fill="${C.orange}"/><path d="M40 54 Q28 32 30 14 Q44 8 52 22 L54 44Z" fill="${C.orange}"/><path d="M35 14 l-2 -9 l8 6"/><path d="M51 20 q8 8 5 20" stroke="${C.dwood}" stroke-width="4"/><circle cx="38" cy="24" r="2.200" fill="${C.line}" stroke="none"/><path d="M62 40 h24 v10 q-12 6 -24 0z" fill="${C.coral}" stroke-width="2"/>` },
  beanbag:  { name: '懒人沙发', type: 'floor', price: 65,  w: 130, vb: [130, 102], draw: () => `<path d="M10 80 Q4 40 40 30 Q64 6 92 28 Q126 38 120 80 Q112 98 66 98 Q18 98 10 80Z" fill="${C.lgreen}"/><path d="M34 52 Q64 70 98 50" stroke-width="2"/><circle cx="66" cy="24" r="3" fill="${C.line}" stroke="none"/>` },
  rug4:     { name: '草莓地毯', type: 'rug',   price: 70,  w: 320, vb: [320, 92],  draw: () => `<ellipse cx="160" cy="46" rx="156" ry="42" fill="${C.pink}"/><ellipse cx="160" cy="46" rx="128" ry="31" fill="${C.cream}" stroke-width="1.800"/>` +
    [92, 160, 228].map(x => `<g transform="translate(${x} 44) scale(1 .620)"><path d="M0 -14 Q18 -18 16 0 Q12 16 0 22 Q-12 16 -16 0 Q-18 -18 0 -14Z" fill="${C.red}" stroke-width="2"/><path d="M0 -13 l-9 -7 h18z" fill="${C.green}" stroke-width="1.600"/></g>`).join('') },
  mirror:   { name: '小镜子',   type: 'wall',  price: 45,  w: 70,  vb: [70, 92],   draw: () => `<ellipse cx="35" cy="46" rx="29" ry="40" fill="${C.wood}"/><ellipse cx="35" cy="46" rx="22" ry="33" fill="${C.sky}" stroke-width="1.800"/><path d="M24 30 q4 -8 12 -10 M21 42 q1 -3 3 -5" stroke="#fff" stroke-width="3"/>` },
  balloons: { name: '气球束',   type: 'wall',  price: 40,  w: 90,  vb: [90, 132],  draw: () => `<path d="M28 52 Q40 90 46 126 M62 48 Q52 90 46 126 M46 40 V126" stroke-width="1.600"/><ellipse cx="26" cy="32" rx="18" ry="22" fill="${C.coral}"/><ellipse cx="64" cy="28" rx="18" ry="22" fill="${C.blue}"/><ellipse cx="46" cy="22" rx="17" ry="20" fill="${C.yellow}"/>` },
  map:      { name: '世界地图', type: 'wall',  price: 60,  w: 150, vb: [150, 102], draw: () => `<rect x="4" y="6" width="142" height="90" rx="3" fill="#F3E6C8"/><path d="M22 30 q14 -12 30 -4 q4 12 -8 16 q-4 14 -14 12 q-12 -8 -8 -24z M78 26 q20 -10 44 2 q8 16 -6 26 q-14 4 -18 -8 q-16 0 -20 -20z M98 66 q12 -4 16 8 q-10 8 -16 -8z" fill="${C.green}" stroke-width="1.600"/><path d="M4 6 h142" stroke-width="7"/><circle cx="62" cy="66" r="3.500" fill="${C.red}" stroke="none"/>` }
});

/* ---------- 第三批旅行目的地 ---------- */
Object.assign(DESTS, {
  lake:     { name: '荷花池塘', time: 150, souv: 'lotussoup',  pet: [70, 84, .42] },
  orchard:  { name: '苹果果园', time: 150, souv: 'applepie',   pet: [30, 104, .42] },
  maple:    { name: '枫叶山谷', time: 180, souv: 'pancake',    pet: [108, 104, .42] },
  mushwood: { name: '蘑菇森林', time: 210, souv: 'mushcookie', pet: [100, 104, .42] },
  island:   { name: '椰子小岛', time: 240, souv: 'cocojelly',  pet: [84, 82, .42] },
  penguin:  { name: '企鹅冰原', time: 270, souv: 'popsicle',   pet: [60, 100, .42] },
  cloud:    { name: '云上城堡', time: 270, souv: 'cloudbread', pet: [70, 84, .42] },
  moon:     { name: '月亮上面', time: 300, souv: 'mooncake',   pet: [86, 90, .42] }
});
Object.assign(SOUVS, {
  lotussoup:  { name: '莲子羹',   ic: 'lotussoup',  hunger: 20, thirst: 22 },
  applepie:   { name: '苹果派',   ic: 'applepie',   hunger: 28, happy: 14 },
  pancake:    { name: '枫糖松饼', ic: 'pancake',    hunger: 26, energy: 12 },
  mushcookie: { name: '蘑菇饼干', ic: 'mushcookie', hunger: 18, happy: 16 },
  cocojelly:  { name: '椰子冻',   ic: 'cocojelly',  drink: true, thirst: 30, hunger: 8, happy: 10 },
  popsicle:   { name: '企鹅雪糕', ic: 'popsicle',   drink: true, thirst: 20, happy: 20, sweet: 1 },
  cloudbread: { name: '云朵面包', ic: 'cloudbread', hunger: 34, happy: 8 },
  mooncake:   { name: '小月饼',   ic: 'mooncake',   hunger: 24, happy: 18, sweet: 1 }
});
Object.assign(CARD_BG, {
  lake(r) {
    const leaf = (x, y, s) => `<ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${8 * s}" fill="${C.green}"/><path d="M${x} ${y} l${14 * s} ${-3 * s}" stroke-width="1.600"/>`;
    const bloom = (x, y) => `<path d="M${x} ${y} q-13 -5 -11 -17 q9 2 11 17z M${x} ${y} q13 -5 11 -17 q-9 2 -11 17z" fill="#F2B8C0" stroke-width="1.600"/><path d="M${x} ${y} q-7 -12 0 -24 q7 12 0 24z" fill="${C.pink}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 222 : 248}" cy="${r ? 62 : 36}" r="${r ? 24 : 16}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 104 Q70 66 150 92 T300 78 V110 H0Z', r ? '#C9B79A' : '#C4D9B4')}
      <rect y="104" width="300" height="100" fill="${r ? '#A9C2CC' : C.sky}" stroke="none"/><path d="M0 104 H300"/>
      <path d="M22 122 q10 -6 20 0 M196 120 q10 -6 20 0 M222 190 q10 -6 20 0" stroke="#fff" stroke-width="2.200"/>
      ${leaf(252, 130, .9)}${leaf(262, 174, 1.2)}${leaf(196, 186, .9)}${leaf(34, 138, .8)}${bloom(258, 124)}${bloom(274, 164)}
      ${r ? `<g transform="translate(168 108) scale(.34)">${FRIEND_DRAW.duck()}</g>` : ''}
      <path d="M40 170 v26 M150 170 v26"/><path d="M-6 158 H172 V170 H-6Z" fill="${C.wood}"/><path d="M52 158 v12 M112 158 v12" stroke-width="1.600"/>`;
  },
  orchard(r) {
    const tree = (x, y, s) => `<path d="M${x} ${y} v${-34 * s}" stroke="${C.dwood}" stroke-width="${7 * s}"/><circle cx="${x}" cy="${y - 54 * s}" r="${28 * s}" fill="${C.green}"/>` +
      [[-12, -62], [10, -68], [-2, -46], [15, -48], [-17, -44]].map(q => `<circle cx="${x + q[0] * s}" cy="${y + q[1] * s}" r="${4.4 * s}" fill="${C.red}" stroke-width="1.400"/>`).join('');
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 60 : 52}" cy="${r ? 58 : 36}" r="${r ? 24 : 16}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 118 Q90 84 170 110 T300 96 V200 H0Z', '#CFE0B6')}${tree(128, 128, .7)}${tree(184, 122, .6)}
      ${_hill('M0 142 Q150 124 300 140 V200 H0Z', '#A9C987')}${tree(250, 162, 1.1)}
      <circle cx="202" cy="170" r="6.500" fill="${C.red}" stroke-width="1.600"/><circle cx="213" cy="166" r="6.500" fill="${C.red}" stroke-width="1.600"/><circle cx="223" cy="170" r="6.500" fill="${C.red}" stroke-width="1.600"/>
      <path d="M190 172 h44 l-5 21 h-34z" fill="${C.wood}"/><path d="M193 180 h38" stroke-width="1.600"/>
      ${r ? `<g transform="translate(112 126) scale(.34)">${FRIEND_DRAW.hedgehog()}</g>` : ''}`;
  },
  maple(r) {
    let lv = '';
    for (let i = 0, n = r ? 26 : 9; i < n; i++) { const x = (i * 47 + 23) % 288, y = (i * 31 + 15) % 140 + 20; lv += `<path d="M${x} ${y} l4 -6 l4 6 l-4 5z" fill="${i % 2 ? C.orange : C.red}" stroke="none" transform="rotate(${i * 50} ${x + 4} ${y})"/>`; }
    const tree = (x, s, c) => `<path d="M${x} 150 q-3 -26 2 -${46 * s}" stroke="${C.dwood}" stroke-width="${7 * s}"/>` +
      `<path d="M${x + 2 - 32 * s} ${150 - 48 * s} a${17 * s} ${15 * s} 0 0 1 ${13 * s} -${23 * s} a${21 * s} ${19 * s} 0 0 1 ${38 * s} 0 a${17 * s} ${15 * s} 0 0 1 ${13 * s} ${23 * s} a${32 * s} ${15 * s} 0 0 1 -${64 * s} 0z" fill="${c}"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#EFE9D6'}" stroke="none"/><circle cx="150" cy="${r ? 50 : 34}" r="${r ? 22 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 112 L70 62 L130 104 L200 56 L260 100 L300 84 V200 H0Z', '#D9B58C')}
      ${_hill('M0 126 Q90 100 170 122 T300 110 V200 H0Z', '#E3C98F')}${tree(196, .75, C.orange)}${tree(56, 1, C.red)}${tree(254, 1.1, '#E9A04E')}
      ${_hill('M0 148 Q150 132 300 146 V200 H0Z', '#D6B46F')}
      <path d="M118 200 Q140 172 150 150 Q160 172 184 200Z" fill="#EFE3C4"/>${lv}`;
  },
  mushwood(r) {
    const mush = (x, y, s, c) => `<path d="M${x - 9 * s} ${y} q${3 * s} -${22 * s} 0 -${42 * s} h${18 * s} q-${3 * s} ${20 * s} 0 ${42 * s}z" fill="${C.cream}"/><path d="M${x - 36 * s} ${y - 38 * s} Q${x - 34 * s} ${y - 80 * s} ${x} ${y - 80 * s} Q${x + 34 * s} ${y - 80 * s} ${x + 36 * s} ${y - 38 * s}Z" fill="${c}"/>` +
      [[-16, -53, 5], [2, -65, 6], [18, -51, 4.5]].map(q => `<circle cx="${x + q[0] * s}" cy="${y + q[1] * s}" r="${q[2] * s}" fill="#fff" stroke="none"/>`).join('');
    return `<rect width="300" height="200" fill="${r ? '#3E4A6A' : '#DDE8D2'}" stroke="none"/>
      ${r ? `<path d="M40 22 A14 14 0 1 0 53 46 A11 11 0 0 1 40 22Z" fill="#FFF6C9"/>` + _dots([[96, 24], [150, 44], [200, 20], [272, 40], [120, 70]], 2, '#FFF6C9') : `<circle cx="46" cy="34" r="15" fill="#F3D98B"/>`}
      ${_hill('M0 112 Q80 84 150 104 T300 92 V200 H0Z', r ? '#4F6B5E' : '#B9D0A4')}
      ${mush(238, 152, 1.5, C.coral)}${mush(48, 148, 1.15, C.purple)}${mush(160, 138, .7, C.orange)}
      ${_hill('M0 148 Q150 134 300 146 V200 H0Z', r ? '#56755A' : '#A9C987')}
      ${mush(274, 192, .45, C.yellow)}${mush(24, 192, .4, C.coral)}
      ${r ? _dots([[76, 96], [128, 62], [196, 88], [222, 60], [168, 112], [98, 132], [284, 108]], 3, C.yellow) + `<g transform="translate(184 138) scale(.36)">${FRIEND_DRAW.snail()}</g>` : ''}`;
  },
  island(r) {
    const palm = (x, y, h, lean) => { const tx = x + lean / 2, ty = y - h; return `<path d="M${x} ${y} q${-lean} -${h / 2} ${lean / 2} -${h}" stroke="${C.dwood}" stroke-width="6"/>` +
      `<path d="M${tx} ${ty} q-26 -12 -38 6 q22 -6 38 -6z M${tx} ${ty} q-10 -24 -32 -20 q18 6 32 20z M${tx} ${ty} q22 -14 36 2 q-20 -4 -36 -2z M${tx} ${ty} q8 -22 28 -22 q-14 8 -28 22z" fill="${C.green}" stroke-width="1.800"/>` +
      `<circle cx="${tx - 4}" cy="${ty + 6}" r="4" fill="${C.dwood}" stroke-width="1.400"/><circle cx="${tx + 5}" cy="${ty + 7}" r="4" fill="${C.dwood}" stroke-width="1.400"/>`; };
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="254" cy="${r ? 76 : 32}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <rect y="96" width="300" height="110" fill="${C.blue}" stroke="none"/><path d="M0 96 H300"/>
      <path d="M16 126 q10 -6 20 0 M250 118 q10 -6 20 0 M150 110 q10 -6 20 0 M6 184 q10 -6 20 0 M268 186 q10 -6 20 0" stroke="#fff" stroke-width="2.200"/>
      ${r ? `<path d="M12 106 Q30 66 62 92 l9 -5 l-3 12 Q48 82 22 108Z" fill="#6F9DB5"/><circle cx="28" cy="92" r="1.600" fill="${C.line}" stroke="none"/>` : `<path d="M22 96 h34 l-7 9 h-20z" fill="${C.wood}"/><path d="M38 96 V70 L56 92Z" fill="${C.cream}"/>`}
      <path d="M28 170 Q150 112 272 170 Q150 198 28 170Z" fill="${C.sand}"/>
      ${palm(216, 152, 70, 10)}${palm(240, 156, 48, -10)}
      <path d="M186 172 l5 -8 l5 8 l-10 -5 h10z" fill="${C.pink}" stroke-width="1.600"/>`;
  },
  penguin(r) {
    const pg = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-5 0 l-6 3 M5 0 l6 3" stroke="${C.orange}" stroke-width="4"/>` +
      `<path d="M-12 0 Q-17 -22 -10 -35 Q0 -47 10 -35 Q17 -22 12 0Z" fill="#4A5568"/><path d="M-13 -22 q-7 7 -5 15 M13 -22 q7 7 5 15" stroke-width="3"/>` +
      `<path d="M-7 0 Q-10 -17 -5 -25 Q0 -30 5 -25 Q10 -17 7 0Z" fill="${C.white}" stroke-width="1.400"/><circle cx="-4" cy="-34" r="1.700" fill="#fff" stroke="none"/><circle cx="4" cy="-34" r="1.700" fill="#fff" stroke="none"/>` +
      `<path d="M-3 -30 h6 l-3 5z" fill="${C.orange}" stroke-width="1"/></g>`;
    return `<rect width="300" height="200" fill="${r ? '#F2D5D0' : '#DCE9EF'}" stroke="none"/>
      <circle cx="150" cy="${r ? 58 : 36}" r="${r ? 22 : 15}" fill="${r ? C.coral : '#F3D98B'}"/>
      <path d="M8 118 L40 58 L64 92 L84 70 L114 118Z" fill="#C9DCE6"/><path d="M176 118 L206 74 L226 100 L246 82 L274 118Z" fill="#D6E5EC"/>
      <rect y="116" width="300" height="30" fill="${C.blue}" stroke="none"/><path d="M0 116 H300"/>
      ${_hill('M0 142 Q150 128 300 140 V200 H0Z', C.white)}
      <path d="M198 170 q0 -34 36 -34 q36 0 36 34z" fill="${C.white}"/><path d="M224 170 v-12 a10 10 0 0 1 20 0 v12" fill="#8FA9B8"/>
      <path d="M201 154 h66 M211 144 h46 M234 136 v8 M220 144 v10 M248 144 v10" stroke-width="1.400"/>
      ${pg(160, 182, 1)}${pg(186, 190, .8)}
      ${r ? pg(24, 178, .9) + pg(46, 188, .7) + _dots([[30, 30], [70, 62], [110, 24], [196, 44], [236, 22], [276, 58], [56, 100], [262, 100]], 2.600, '#fff') : ''}`;
  },
  cloud(r) {
    const cl = (x, y, s) => `<path d="M${x} ${y} a${8 * s} ${8 * s} 0 0 1 ${2 * s} -${16 * s} a${11 * s} ${11 * s} 0 0 1 ${21 * s} -${s} a${8.5 * s} ${8.5 * s} 0 0 1 ${s} ${17 * s}z" fill="#fff"/>`;
    return `<rect width="300" height="200" fill="${r ? '#D9D2E6' : '#CFE4EC'}" stroke="none"/>
      ${r ? _arcBow(196, 150, 104) : `<circle cx="46" cy="36" r="16" fill="#F3D98B"/>`}
      ${cl(92, 62, 1.6)}${cl(16, 112, 1.3)}
      <rect x="186" y="84" width="64" height="66" fill="${C.cream}"/>
      <rect x="174" y="66" width="22" height="84" fill="${C.cream}"/><rect x="240" y="66" width="22" height="84" fill="${C.cream}"/>
      <path d="M170 66 L185 38 L200 66Z" fill="${C.coral}"/><path d="M236 66 L251 38 L266 66Z" fill="${C.coral}"/>
      <rect x="207" y="56" width="22" height="30" fill="${C.cream}"/><path d="M203 56 L218 28 L233 56Z" fill="${C.purple}"/>
      <path d="M218 28 v-14 l12 5 l-12 5" fill="${C.yellow}" stroke-width="1.600"/>
      <path d="M208 150 v-24 a10 10 0 0 1 20 0 v24" fill="${C.wood}"/>
      <rect x="180" y="86" width="10" height="13" rx="5" fill="${C.sky}" stroke-width="1.600"/><rect x="246" y="86" width="10" height="13" rx="5" fill="${C.sky}" stroke-width="1.600"/><rect x="213" y="64" width="10" height="13" rx="5" fill="${C.sky}" stroke-width="1.600"/>
      <path d="M-10 206 V152 q20 -22 44 -8 q16 -22 44 -6 q22 -20 50 -2 q24 -18 48 0 q26 -16 50 2 q24 -14 44 4 q20 -8 40 6 V206Z" fill="${C.white}"/>
      ${r ? _burst(40, 44, C.yellow, .7) + _burst(110, 30, C.pink, .6) : ''}`;
  },
  cloudFront() {
    return `<path d="M52 206 V180 q16 -16 36 -4 q18 -14 38 0 q18 -10 34 6 V206Z" fill="${C.white}"/>`;
  },
  moon(r) {
    let st = '';
    for (let i = 0; i < 16; i++) st += `<circle cx="${(i * 61 + 19) % 296}" cy="${(i * 29 + 11) % 110 + 6}" r="${i % 3 ? 1.6 : 2.4}" fill="#FFF6C9"/>`;
    return `<rect width="300" height="200" fill="#2B3560" stroke="none"/><g stroke="none">${st}</g>
      <circle cx="56" cy="50" r="24" fill="#8FC0D4"/><path d="M42 38 q8 -8 16 -2 q2 8 -6 12 q-10 2 -10 -10z M60 56 q10 -2 12 6 q-4 8 -12 6z" fill="${C.green}" stroke-width="1.600"/>
      ${r ? `<ellipse cx="170" cy="38" rx="30" ry="8" stroke="${C.yellow}" stroke-width="3" transform="rotate(-18 170 38)"/><circle cx="170" cy="38" r="14" fill="${C.orange}"/><path d="M96 16 l34 17 M230 22 l28 14" stroke="#FFF6C9" stroke-width="2.400"/>` : ''}
      <g transform="translate(0 16)"><path d="M238 118 v10 M254 118 v10"/><path d="M233 104 L220 126 L234 118Z M259 104 L272 126 L258 118Z" fill="${C.coral}"/><path d="M246 60 Q262 78 259 118 H233 Q230 78 246 60Z" fill="${C.white}"/><circle cx="246" cy="86" r="7" fill="${C.sky}"/></g>
      ${_hill('M-6 150 Q150 122 306 150 V206 H-6Z', '#D9D4C4')}
      <ellipse cx="46" cy="176" rx="20" ry="6" fill="#C2BCAA"/><ellipse cx="214" cy="184" rx="26" ry="7" fill="#C2BCAA"/><ellipse cx="270" cy="162" rx="12" ry="4" fill="#C2BCAA"/>
      <path d="M190 142 v-42"/><path d="M190 100 h24 l-6 8 l6 8 h-24z" fill="${C.coral}"/>`;
  },
  moonFront() {
    return `<circle cx="128" cy="128" r="50" fill="rgba(255,255,255,.16)" stroke="#fff" stroke-width="2.600"/><path d="M96 102 q8 -15 23 -19" stroke="#fff" stroke-width="3.200"/>`;
  }
});

/* ==========================================================
 *  第五批：小车和停车位、旅行地图、更多景点和商店物品
 * ========================================================== */
const _wh = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5B4636"/><circle cx="${x}" cy="${y}" r="${(r * .42).toFixed(1)}" fill="${C.cream}" stroke-width="1.600"/>`;
const _line2 = (d, c, w) => `<path d="${d}" stroke-width="${w + 4}"/><path d="${d}" stroke="${c}" stroke-width="${w}"/>`;   // 带描边的彩色粗线
Object.assign(ICONS, {
  // 小车
  scooter: _wh(10, 40, 5.5) + _wh(38, 40, 5.5) + `<path d="M36 31 L31 7" stroke-width="3.500"/><path d="M25 7 h12" stroke-width="4"/><path d="M8 33 h24 l3 -4 h4 l-3 8 h-28z" fill="${C.coral}"/>`,
  bike: `<circle cx="11" cy="34" r="9" stroke-width="3"/><circle cx="37" cy="34" r="9" stroke-width="3"/><path d="M11 34 L21 17 H33 L37 34 M21 17 L26 34 L33 17 M26 34 H11" stroke="${C.coral}" stroke-width="3"/><path d="M16 14 h10" stroke-width="4"/><path d="M33 17 l-2 -8 h7" stroke-width="3"/>`,
  minicar: `<path d="M3 34 V27 Q3 23 9 22 L15 12 Q17 9 22 9 H31 Q35 9 38 13 L43 22 Q46 24 46 28 V34 Q46 36 44 36 H5 Q3 36 3 34Z" fill="${C.coral}"/><path d="M17 21 L21 13 H26 V21Z M29 13 H32 Q34 13 36 16 L39 21 H29Z" fill="${C.sky}" stroke-width="1.600"/>` + _wh(14, 37, 5.5) + _wh(36, 37, 5.5),
  camper: `<path d="M3 34 V14 Q3 10 7 10 H33 Q36 10 38 13 L42 22 Q46 23 46 28 V34 Q46 36 44 36 H5 Q3 36 3 34Z" fill="${C.cream}"/><path d="M4.500 29 H45" stroke="${C.blue}" stroke-width="3"/><rect x="7" y="14" width="10" height="8" rx="2" fill="${C.sky}" stroke-width="1.600"/><rect x="20" y="14" width="8" height="8" rx="2" fill="${C.sky}" stroke-width="1.600"/><path d="M31 14 h3 l4 8 h-7z" fill="${C.sky}" stroke-width="1.600"/>` + _wh(13, 37, 5.5) + _wh(37, 37, 5.5),
  racer: `<path d="M4 25 V18 M1 18 H9" stroke-width="3"/><path d="M2 32 Q2 27 7 26 L15 24 Q20 15 27 15 H31 Q36 15 39 22 L44 25 Q47 27 47 31 Q47 34 45 34 H4 Q2 34 2 32Z" fill="${C.yellow}"/><path d="M20 23 Q23 18 27 18 H31 Q34 18 36 23Z" fill="${C.sky}" stroke-width="1.600"/>` + _wh(13, 35, 5) + _wh(37, 35, 5),
  mapic: `<path d="M4 12 L17 7 L31 12 L44 7 V37 L31 42 L17 37 L4 42Z" fill="${C.cream}"/><path d="M17 7 V37 M31 12 V42" stroke-width="1.600"/><path d="M9 30 q6 -8 12 -2 q6 6 14 -6" stroke="${C.coral}" stroke-width="2.400" stroke-dasharray="3 3.500"/><circle cx="36" cy="20" r="3.200" fill="${C.red}" stroke="none"/>`,
  // 吃的
  pizza: `<path d="M6 12 Q24 2 42 12 L24 46Z" fill="${C.yellow}"/><path d="M6 12 Q24 2 42 12 L40 17 Q24 8 8 17Z" fill="#E2B877"/><circle cx="20" cy="21" r="3.600" fill="${C.red}" stroke-width="1.400"/><circle cx="29" cy="24" r="3.200" fill="${C.red}" stroke-width="1.400"/><circle cx="23" cy="33" r="3" fill="${C.red}" stroke-width="1.400"/>`,
  burger: `<path d="M6 37 h36 v3 q0 5 -5 5 h-26 q-5 0 -5 -5z" fill="#E2B877"/><rect x="5" y="29" width="38" height="8" rx="4" fill="${C.dwood}"/><path d="M4 23 h40 v3 q-5 5 -10 1 q-5 5 -10 0 q-5 5 -10 0 q-5 4 -10 -1z" fill="${C.green}"/><path d="M6 23 Q6 6 24 6 Q42 6 42 23Z" fill="#E2B877"/><path d="M16 13 v.100 M24 10 v.100 M32 13 v.100 M21 17 v.100 M28 17 v.100" stroke="${C.cream}" stroke-width="2.600"/>`,
  fries: `<path d="M13 22 l-2 -15 h5 l1 15z M20 22 v-19 h5 v19z M28 22 l2 -17 h5 l-3 17z" fill="${C.yellow}"/><path d="M9 20 h30 l-4 25 h-22z" fill="${C.red}"/><circle cx="24" cy="32" r="5" fill="${C.cream}" stroke-width="1.600"/>`,
  mantou: `<path d="M18 9 q-3 -3 0 -6 M28 9 q-3 -3 0 -6" stroke-width="1.800"/><path d="M5 39 Q3 13 24 13 Q45 13 43 39Z" fill="${C.white}"/><path d="M3 39 h42"/><path d="M17 23 q7 -5 14 0" stroke-width="1.600"/>`,
  chocolate: `<g transform="rotate(-10 24 24)"><rect x="8" y="6" width="32" height="36" rx="3" fill="${C.dwood}"/><path d="M24 6 v22 M8 17 h32" stroke-width="1.600"/><path d="M8 27 h32 v12 q0 3 -3 3 h-26 q-3 0 -3 -3z" fill="${C.coral}"/></g>`,
  jelly: `<path d="M3 41 h42"/><path d="M12 40 Q8 15 24 13 Q40 15 36 40Z" fill="#F2B8C0"/><path d="M17 23 q2 -5 6 -6" stroke="#fff" stroke-width="2.400"/><path d="M24 13 q-5 -6 0 -10 q5 4 0 10z" fill="${C.green}" stroke-width="1.600"/>`,
  lollipop: `<path d="M24 28 V46" stroke-width="3"/><circle cx="24" cy="17" r="13" fill="${C.pink}"/><path d="M24 17 m-7 0 a7 7 0 1 1 7 7 a4 4 0 1 1 -4 -4" stroke="${C.coral}" stroke-width="2.400"/>`,
  // 水果
  cherry: `<path d="M16 30 Q18 14 30 6 Q32 18 34 28"/><path d="M30 6 q8 -2 12 4 q-8 3 -12 -4z" fill="${C.green}"/><circle cx="15" cy="35" r="9" fill="#C9485A"/><circle cx="34" cy="34" r="9" fill="#C9485A"/><path d="M11 32 q1 -3 4 -4 M30 31 q1 -3 4 -4" stroke="#fff" stroke-width="2"/>`,
  pineapple: `<path d="M24 17 q-10 -4 -10 -13 q6 2 8 6 q0 -6 2 -9 q2 3 2 9 q2 -4 8 -6 q0 9 -10 13z" fill="${C.green}"/><ellipse cx="24" cy="31" rx="13" ry="14.500" fill="${C.yellow}"/><path d="M14 25 l17 14 M13 33 l11 10 M20 18 l15 12 M34 25 l-17 14 M35 33 l-11 10 M28 18 l-15 12" stroke-width="1.300"/>`,
  mango: `<path d="M34 9 q2 -4 6 -5"/><path d="M36 8 q6 -4 9 1 q-5 3 -9 -1z" fill="${C.green}"/><path d="M10 30 Q8 14 22 9 Q38 6 42 20 Q44 36 30 42 Q14 46 10 30Z" fill="#F0B24E"/><path d="M16 28 q1 7 7 10" stroke="#fff" stroke-width="2.200" opacity=".8"/>`,
  lemon: `<path d="M3 24 Q8 22 10 16 Q16 8 26 9 Q36 9 40 18 Q44 22 46 25 Q42 27 40 31 Q34 40 24 40 Q14 40 9 31 Q7 27 3 24Z" fill="#F3DC5A"/><path d="M17 17 q5 -3 9 -2" stroke="#fff" stroke-width="2.200"/>`,
  // 饮料
  barleytea: _glass('#D9A866') + `<rect x="16" y="25" width="7" height="7" rx="1.500" fill="#fff" opacity=".75" stroke-width="1.200"/><rect x="24" y="31" width="7" height="7" rx="1.500" fill="#fff" opacity=".75" stroke-width="1.200"/>`,
  plumjuice: `<path d="M29 3 l-6 30" stroke="${C.green}" stroke-width="3"/>` + _glass('#A8566A') + `<circle cx="38" cy="10" r="5.500" fill="#8C4660" stroke-width="1.800"/>`,
  mungsoup: `<path d="M5 22 h38 q-2 20 -19 20 q-17 0 -19 -20z" fill="${C.white}"/><ellipse cx="24" cy="22" rx="19" ry="4.200" fill="#C9D8A0" stroke-width="1.600"/>` + _dots([[15, 22], [22, 23.5], [29, 21.5], [34, 23]], 1.800, C.dgreen),
  // 花
  lily: _stem + `<path d="M24 27 Q10 23 8 8 Q18 10 24 20 Q30 10 40 8 Q38 23 24 27Z" fill="${C.white}"/><path d="M24 27 Q18 13 24 4 Q30 13 24 27Z" fill="#FBE9EE"/><path d="M24 22 v-8 M21 21 l-3 -6 M27 21 l3 -6" stroke="${C.orange}" stroke-width="1.600"/>`,
  // 装扮
  helmet: `<path d="M5 30 Q5 8 24 8 Q43 8 43 30 V34 H5Z" fill="${C.red}"/><path d="M24 9 V33" stroke="${C.white}" stroke-width="5"/><path d="M5 30 Q5 8 24 8 Q43 8 43 30 V34 H5Z"/><path d="M27 25 h16 v9 h-16z" fill="${C.sky}" stroke-width="1.800"/>`,
  pirate: `<path d="M4 35 Q8 11 24 8 Q40 11 44 35 Q24 26 4 35Z" fill="#5B4636"/><path d="M15 15 L33 27 M33 15 L15 27" stroke="#fff" stroke-width="2.400"/><circle cx="24" cy="20" r="5.500" fill="#fff" stroke-width="1.400"/><path d="M22 20 v.100 M26 20 v.100" stroke-width="2"/>`,
  gradcap: `<path d="M11 22 v10 q13 8 26 0 v-10" fill="#5B4636"/><path d="M24 8 L46 18 L24 28 L2 18Z" fill="#5B4636"/><path d="M40 20 v13" stroke="${C.yellow}" stroke-width="2.600"/><circle cx="40" cy="36" r="3" fill="${C.yellow}"/>`,
  nightcap: `<path d="M8 36 Q10 12 30 8 Q42 10 42 22 Q36 16 32 20 Q38 28 38 36Z" fill="${C.blue}"/><path d="M18 20 v.100 M27 15 v.100 M24 27 v.100 M33 28 v.100" stroke="#fff" stroke-width="2.600"/><rect x="4" y="33" width="38" height="10" rx="5" fill="${C.white}"/><circle cx="42" cy="24" r="5" fill="${C.yellow}"/>`,
  // 特产
  creampuff: `<path d="M8 36 Q10 44 24 44 Q38 44 40 36Z" fill="#E2B877"/><path d="M5 31 q5 -6 10 0 q5 -6 9 0 q5 -6 10 0 q5 -6 9 0 q0 6 -19 6 q-19 0 -19 -6z" fill="${C.white}"/><path d="M6 30 Q4 16 16 14 Q24 4 32 14 Q44 16 42 30 Q38 26 34 30 Q29 25 24 30 Q19 25 15 30 Q10 26 6 30Z" fill="#E2B877"/>`,
  matcha: `<path d="M6 20 L26 10 L44 18 V34 L24 44 L6 36Z" fill="#A9C987"/><path d="M6 20 L24 28 L44 18 M24 28 V44" stroke-width="1.800"/><path d="M6 28 L24 36 L44 26" stroke="${C.white}" stroke-width="2.600"/>`,
  crystalcandy: `<path d="M24 4 L40 18 L32 44 H16 L8 18Z" fill="${C.sky}"/><path d="M8 18 H40 M24 4 L18 18 L24 44 L30 18Z" stroke-width="1.500"/><path d="M12 14 l5 -4" stroke="#fff" stroke-width="2.400"/>`,
  energybar: `<g transform="rotate(-18 24 24)"><rect x="5" y="15" width="38" height="18" rx="4" fill="#D9A866"/><path d="M25 21 v.100 M31 27 v.100 M37 21 v.100" stroke="${C.dwood}" stroke-width="4"/><path d="M5 19 q0 -4 4 -4 h10 v18 h-10 q-4 0 -4 -4z" fill="${C.green}" stroke-width="1.800"/></g>`,
  pyramidcake: `<path d="M3 41 h42"/><path d="M24 6 L42 40 H6Z" fill="#E2B877"/><path d="M24 6 L30 40 H42Z" fill="#C99A5E" stroke-width="1.600"/><path d="M17 21 h8 M12 31 h15" stroke="${C.cream}" stroke-width="2.600"/>`,
  champsoda: `<rect x="19" y="3" width="10" height="6" rx="2" fill="${C.yellow}"/><path d="M19 9 h10 v7 q6 4 6 12 v13 q0 3 -3 3 h-16 q-3 0 -3 -3 v-13 q0 -8 6 -12z" fill="${C.sky}"/><rect x="13" y="27" width="22" height="11" fill="${C.white}" stroke-width="1.600"/>` + _star(24, 32.5, 4.600, 2, C.yellow),
  cactusjuice: `<path d="M22 3 l3 30" stroke="${C.coral}" stroke-width="3"/>` + _glass('#A9CC7A') + `<path d="M34 15 V6 q0 -3.500 3.500 -3.500 q3.500 0 3.500 3.500 V15" fill="${C.green}" stroke-width="1.800"/>`,
  gingerman: `<path d="M14 18 H34 L44 22 L42 28 L33 26 V32 L38 44 H29 L24 36 L19 44 H10 L15 32 V26 L6 28 L4 22Z" fill="#D9A866"/><circle cx="24" cy="11" r="8" fill="#D9A866"/><path d="M21 10 v.100 M27 10 v.100" stroke-width="2.200"/><path d="M21 13.500 q3 2.500 6 0" stroke-width="1.400"/><path d="M24 22 v.100 M24 28 v.100" stroke="${C.red}" stroke-width="3.400"/><path d="M7 24 l3 1 M38 25 l3 -1 M13 40 h5 M30 40 h5" stroke="#fff" stroke-width="2"/>`
});

/* ---------- 小车（停在负一楼的车库，旅行的时候可以开）和新家具 ----------
 * car 是开车时路上快几倍；ic 是小图标；tip 是商店里的说明 */
Object.assign(FURNS, {
  parkmat:  { name: '停车位',   type: 'rug',   price: 0,    w: 290, vb: [300, 96],  draw: () => `<path d="M26 8 H274 L296 88 H4Z" fill="#B8BCC0"/><path d="M42 19 H258 L274 77 H26Z" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/><path d="M139 66 V32 h14 q12 0 12 9.500 q0 9.500 -12 9.500 h-14" stroke="#fff" stroke-width="6"/>` },
  scooter:  { name: '滑板车',   type: 'floor', price: 350,  car: 1.5, ic: 'scooter', tip: '路上快一半', w: 96, vb: [130, 130],
    draw: () => _line2('M100 96 L90 22', C.blue, 5) + `<path d="M74 22 h30" stroke-width="8"/><path d="M22 98 h66 l8 -10 h10 l-8 18 h-76z" fill="${C.coral}"/>` + _wh(24, 112, 12) + _wh(104, 112, 12) },
  bike:     { name: '自行车',   type: 'floor', price: 600,  car: 2,   ic: 'bike',    tip: '路上快 2 倍', w: 130, vb: [180, 130],
    draw: () => `<circle cx="38" cy="96" r="27" stroke-width="5.500"/><circle cx="142" cy="96" r="27" stroke-width="5.500"/><path d="M38 96 l0 -27 M38 96 l23 14 M38 96 l-23 14 M142 96 l0 -27 M142 96 l23 14 M142 96 l-23 14" stroke-width="1.400"/>` +
      _line2('M38 96 L72 52 H120 L142 96 M72 52 L90 96 L120 52 M90 96 H38', C.coral, 4.5) + `<path d="M72 52 l-3 -9" stroke-width="4"/><path d="M57 42 h28" stroke-width="8"/><path d="M120 52 L114 28 h14" stroke-width="5"/><path d="M128 32 h26 l-4 18 h-18z" fill="${C.wood}"/><circle cx="90" cy="96" r="5" fill="${C.cream}"/>` },
  minicar:  { name: '小汽车',   type: 'floor', price: 1000, car: 3,   ic: 'minicar', tip: '路上快 3 倍', w: 180, vb: [230, 128],
    draw: () => `<path d="M12 96 V72 Q12 60 30 58 L52 30 Q58 20 74 20 H138 Q152 20 162 32 L182 58 Q214 62 218 78 V96 Q218 102 210 102 H20 Q12 102 12 96Z" fill="${C.coral}"/><path d="M62 56 L77 32 H104 V56Z" fill="${C.sky}"/><path d="M112 32 H140 Q148 32 154 40 L166 56 H112Z" fill="${C.sky}"/><path d="M108 58 V98" stroke-width="1.800"/><path d="M118 68 h12" stroke-width="3.500"/><circle cx="208" cy="77" r="6.500" fill="${C.yellow}"/><path d="M12 84 h10" stroke="${C.red}" stroke-width="5"/>` + _wh(60, 102, 20) + _wh(170, 102, 20) },
  camper:   { name: '小房车',   type: 'floor', price: 1600, car: 4,   ic: 'camper',  tip: '路上快 4 倍', w: 200, vb: [270, 158],
    draw: () => `<rect x="52" y="8" width="62" height="14" rx="4" fill="${C.wood}"/><path d="M72 8 v14 M94 8 v14" stroke-width="1.600"/><path d="M10 124 V36 Q10 22 26 22 H190 Q204 22 212 34 L236 74 Q256 78 258 96 V124 Q258 130 250 130 H18 Q10 130 10 124Z" fill="${C.cream}"/><path d="M13 96 H256" stroke="${C.blue}" stroke-width="9"/><rect x="28" y="40" width="50" height="34" rx="6" fill="${C.sky}"/><path d="M29 41 q16 14 2 32 M77 41 q-16 14 -2 32" fill="${C.pink}" stroke-width="1.600"/><rect x="92" y="40" width="40" height="34" rx="6" fill="${C.sky}"/><rect x="144" y="40" width="34" height="78" rx="5" fill="#F3E6C8"/><circle cx="171" cy="82" r="2.600" fill="${C.line}" stroke="none"/><path d="M190 40 h14 l20 34 h-34z" fill="${C.sky}"/><circle cx="250" cy="106" r="5.500" fill="${C.yellow}"/>` + _wh(66, 130, 22) + _wh(204, 130, 22) },
  racer:    { name: '小跑车',   type: 'floor', price: 2400, car: 5,   ic: 'racer',   tip: '路上快 5 倍', w: 186, vb: [250, 106],
    draw: () => `<path d="M16 58 V38 M6 38 H36" stroke-width="5.500"/><path d="M8 78 Q8 62 28 58 L70 52 Q92 30 124 30 H150 Q170 30 186 52 L226 60 Q244 64 244 78 Q244 86 236 86 H16 Q8 86 8 78Z" fill="${C.yellow}"/><path d="M90 52 Q104 38 124 38 H148 Q160 38 170 52Z" fill="${C.sky}"/><path d="M36 71 H96 M160 71 H224" stroke="${C.coral}" stroke-width="5"/><circle cx="128" cy="68" r="11.500" fill="${C.white}"/><path d="M125 64 l4 -3 v14" stroke-width="2.600"/><circle cx="236" cy="72" r="4.500" fill="${C.white}" stroke-width="1.800"/>` + _wh(58, 84, 18) + _wh(196, 84, 18) },
  tv:       { name: '小电视',   type: 'floor', price: 110,  w: 120, vb: [120, 112], draw: () => `<path d="M42 10 L60 26 L78 8"/><path d="M28 92 l-6 16 M92 92 l6 16"/><rect x="8" y="26" width="104" height="66" rx="10" fill="${C.orange}"/><rect x="18" y="36" width="64" height="46" rx="6" fill="${C.sky}"/><path d="M36 54 v.100 M62 54 v.100" stroke-width="5"/><path d="M40 64 q10 8 20 0" stroke-width="2.400"/><circle cx="97" cy="47" r="5.500" fill="${C.cream}" stroke-width="1.800"/><circle cx="97" cy="66" r="5.500" fill="${C.cream}" stroke-width="1.800"/>` },
  wardrobe: { name: '小衣柜',   type: 'floor', price: 120,  w: 120, vb: [120, 172], draw: () => `<path d="M18 158 v10 M102 158 v10"/><rect x="8" y="8" width="104" height="150" rx="6" fill="${C.wood}"/><path d="M60 8 V158"/><path d="M20 22 h28 v44 h-28z M72 22 h28 v44 h-28z M20 80 h28 v64 h-28z M72 80 h28 v64 h-28z" fill="#D9B98C" stroke-width="1.800"/><circle cx="53" cy="92" r="3.500" fill="${C.cream}" stroke-width="1.600"/><circle cx="67" cy="92" r="3.500" fill="${C.cream}" stroke-width="1.600"/>` },
  easel:    { name: '小画架',   type: 'floor', price: 70,   w: 100, vb: [100, 152], draw: () => `<path d="M50 14 L18 146 M50 14 L82 146 M50 14 V132"/><rect x="14" y="28" width="72" height="62" fill="${C.white}"/><circle cx="66" cy="46" r="8" fill="${C.yellow}" stroke-width="1.600"/><path d="M14 90 V74 Q34 56 52 74 Q68 62 86 74 V90Z" fill="${C.green}" stroke-width="1.800"/><path d="M8 93 h84" stroke-width="5.500"/>` },
  dollhouse: { name: '娃娃屋',  type: 'floor', price: 140,  w: 140, vb: [140, 142], draw: () => `<rect x="14" y="56" width="112" height="80" fill="${C.cream}"/><path d="M14 96 h112 M70 58 v78" stroke-width="1.800"/><rect x="28" y="66" width="24" height="20" fill="${C.sky}" stroke-width="1.800"/><rect x="88" y="66" width="24" height="20" fill="${C.sky}" stroke-width="1.800"/><rect x="28" y="106" width="24" height="20" fill="${C.sky}" stroke-width="1.800"/><path d="M86 136 v-24 a10 10 0 0 1 20 0 v24" fill="${C.wood}"/><path d="M4 58 L70 8 L136 58Z" fill="${C.coral}"/><circle cx="70" cy="38" r="8" fill="${C.sky}" stroke-width="1.800"/>` },
  gaspump:  { name: '加油桩',   type: 'floor', price: 90,   w: 80,  vb: [84, 152],  draw: () => `<path d="M58 62 q18 0 18 16 v36"/><rect x="69" y="110" width="13" height="22" rx="3" fill="${C.gray}"/><rect x="6" y="136" width="60" height="12" rx="3" fill="${C.gray}"/><rect x="14" y="20" width="44" height="118" rx="8" fill="${C.red}"/><rect x="22" y="32" width="28" height="24" rx="3" fill="${C.white}" stroke-width="1.800"/><path d="M28 44 h16" stroke-width="2"/><circle cx="36" cy="88" r="11" fill="${C.yellow}" stroke-width="1.800"/><path d="M36 82 q-6 8 0 11 q6 -3 0 -11z" fill="${C.coral}" stroke-width="1.400"/>` },
  poster:   { name: '赛车海报', type: 'wall',  price: 45,   w: 100, vb: [100, 122], draw: () => `<rect x="6" y="6" width="88" height="110" rx="3" fill="${C.sky}"/><path d="M6 86 H94 V113 Q94 116 91 116 H9 Q6 116 6 113Z" fill="#B8BCC0" stroke-width="1.800"/><path d="M14 100 h14 M38 100 h14 M62 100 h14" stroke="#fff" stroke-width="3"/>` + _star(28, 28, 9, 4, C.yellow) + _star(70, 22, 6, 2.700, C.yellow) + `<path d="M18 82 Q18 68 32 66 L42 52 H62 L72 66 Q86 68 86 82Z" fill="${C.red}" stroke-width="2"/><path d="M40 66 L46 57 H58 L64 66Z" fill="${C.white}" stroke-width="1.600"/><circle cx="34" cy="84" r="8" fill="#5B4636" stroke-width="1.800"/><circle cx="70" cy="84" r="8" fill="#5B4636" stroke-width="1.800"/>` },
  wallflower: { name: '干花挂饰', type: 'wall', price: 50,  w: 80,  vb: [80, 116],  draw: () => `<path d="M40 4 v18"/><path d="M40 24 L18 92 M40 24 L32 100 M40 24 L48 100 M40 24 L62 92" stroke="${C.dgreen}" stroke-width="2.400"/><circle cx="17" cy="95" r="9" fill="${C.pink}" stroke-width="1.800"/><circle cx="32" cy="103" r="8" fill="${C.purple}" stroke-width="1.800"/><circle cx="49" cy="103" r="8" fill="${C.yellow}" stroke-width="1.800"/><circle cx="63" cy="95" r="9" fill="${C.coral}" stroke-width="1.800"/><path d="M40 26 l-14 -9 v16z M40 26 l14 -9 v16z" fill="${C.coral}" stroke-width="1.800"/>` },
  starlamp: { name: '星星壁灯', type: 'wall',  price: 55,   w: 70,  vb: [70, 96],   draw: () => `<path d="M35 4 v16"/><path d="M8 34 l-5 -4 M62 34 l5 -4 M6 76 l-4 4 M64 76 l4 4" stroke="${C.yellow}" stroke-width="3"/>` + _star(35, 54, 31, 14, C.yellow) + `<path d="M28 50 v.100 M42 50 v.100" stroke-width="3.400"/><path d="M30 57 q5 4 10 0" stroke-width="1.800"/>` }
});

/* ---------- 第四批旅行目的地 ---------- */
Object.assign(DESTS, {
  farm:    { name: '小小农场',   time: 150, souv: 'creampuff',    pet: [24, 104, .42] },
  teahill: { name: '茶山梯田',   time: 180, souv: 'matcha',       pet: [86, 104, .42] },
  cave:    { name: '水晶山洞',   time: 210, souv: 'crystalcandy', pet: [100, 98, .42] },
  safari:  { name: '长颈鹿草原', time: 240, souv: 'energybar',    pet: [96, 104, .42] },
  pyramid: { name: '金字塔',     time: 240, souv: 'pyramidcake',  pet: [14, 104, .42] },
  track:   { name: '赛车场',     time: 210, souv: 'champsoda',    pet: [56, 100, .42] },
  canyon:  { name: '大峡谷',     time: 270, souv: 'cactusjuice',  pet: [198, 100, .42] },
  candy:   { name: '糖果王国',   time: 270, souv: 'gingerman',    pet: [100, 104, .42] }
});
Object.assign(SOUVS, {
  creampuff:    { name: '鲜奶泡芙',   ic: 'creampuff',    hunger: 20, happy: 16 },
  matcha:       { name: '抹茶糕',     ic: 'matcha',       hunger: 24, energy: 10 },
  crystalcandy: { name: '水晶糖',     ic: 'crystalcandy', hunger: 6,  happy: 26, sweet: 1 },
  energybar:    { name: '坚果能量棒', ic: 'energybar',    hunger: 24, energy: 16 },
  pyramidcake:  { name: '金字塔蛋糕', ic: 'pyramidcake',  hunger: 30, happy: 10 },
  champsoda:    { name: '冠军汽水',   ic: 'champsoda',    drink: true, thirst: 26, happy: 18 },
  cactusjuice:  { name: '仙人掌果汁', ic: 'cactusjuice',  drink: true, thirst: 36, energy: 6 },
  gingerman:    { name: '姜饼人',     ic: 'gingerman',    hunger: 18, happy: 20, sweet: 1 }
});
Object.assign(CARD_BG, {
  farm(r) {
    const cow = (x, y) => `<path d="M${x - 12} ${y + 9} v11 M${x + 12} ${y + 9} v11" stroke-width="2.400"/><ellipse cx="${x}" cy="${y}" rx="20" ry="12" fill="${C.white}"/><path d="M${x - 8} ${y - 9} q8 5 14 -1 q5 9 -4 11 q-9 0 -10 -10z" fill="#5B4636" stroke="none"/>` +
      `<path d="M${x + 18} ${y - 15} l-3 -5 M${x + 27} ${y - 15} l3 -5" stroke-width="2"/><circle cx="${x + 22}" cy="${y - 8}" r="8.500" fill="${C.white}"/><ellipse cx="${x + 25}" cy="${y - 4}" rx="5.500" ry="3.600" fill="${C.pink}" stroke-width="1.400"/><circle cx="${x + 19}" cy="${y - 11}" r="1.500" fill="${C.line}" stroke="none"/>`;
    const chick = (x, y) => `<circle cx="${x}" cy="${y}" r="5.500" fill="${C.yellow}" stroke-width="1.600"/><path d="M${x + 5} ${y - 1} l4 1.500 l-4 1.500z" fill="${C.orange}" stroke-width="1"/><circle cx="${x + 2}" cy="${y - 2}" r="1" fill="${C.line}" stroke="none"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 70 : 56}" cy="${r ? 60 : 36}" r="${r ? 24 : 16}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 118 Q90 90 170 112 T300 100 V200 H0Z', '#CFE0B6')}
      <rect x="196" y="92" width="76" height="62" fill="${C.red}"/><path d="M188 94 L234 56 L280 94Z" fill="${C.red}"/><path d="M198 91 L234 62 L270 91" stroke="#fff" stroke-width="2.400"/>
      <circle cx="234" cy="80" r="6" fill="${C.cream}" stroke-width="1.600"/><path d="M222 154 v-32 h24 v32z" fill="${C.cream}"/><path d="M222 122 l24 32 M246 122 l-24 32" stroke-width="1.600"/>
      ${_hill('M0 146 Q150 130 300 144 V200 H0Z', '#A9C987')}
      <path d="M108 150 H190 M108 162 H190" stroke-width="2"/><path d="M114 142 v28 M138 142 v28 M162 142 v28 M186 142 v28" stroke-width="3"/>
      ${cow(146, 176)}
      <path d="M252 194 q0 -28 20 -28 q20 0 20 28z" fill="${C.yellow}"/><path d="M262 176 q10 -6 20 0 M258 186 q14 -6 28 0" stroke-width="1.600"/>
      ${r ? chick(196, 184) + chick(212, 190) + chick(226, 182) : ''}`;
  },
  teahill(r) {
    const band = (y, c) => `<path d="M-6 ${y} Q80 ${y - 24} 160 ${y - 6} T306 ${y - 16} V206 H-6Z" fill="${c}"/>`;
    const bush = (y, dx) => { let s = ''; for (let x = 12 + dx; x < 296; x += 34) s += `M${x} ${y - Math.round(10 * Math.sin((x + 40) / 95))} q6 -7 12 0 `; return `<path d="${s}" stroke="${C.dgreen}" stroke-width="2.400"/>`; };
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 150 : 250}" cy="${r ? 62 : 34}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 98 L60 52 L120 90 L190 42 L250 86 L300 64 V200 H0Z', r ? '#C9B79A' : '#B9CDBE')}
      ${r ? `<g stroke="none" fill="#fff" opacity=".85"><ellipse cx="60" cy="96" rx="56" ry="11"/><ellipse cx="170" cy="90" rx="62" ry="12"/><ellipse cx="270" cy="98" rx="44" ry="10"/></g>` : ''}
      ${band(116, '#C3D69B')}<path d="M222 104 v-24 M250 102 v-24"/><path d="M210 80 L236 58 L262 80Z" fill="${C.coral}"/><path d="M216 105 h40" stroke-width="3.500"/>
      ${band(138, '#B2CC8C')}${bush(131, 0)}${band(160, '#9DBB7A')}${bush(153, 16)}${band(182, '#8DB574')}${bush(175, 6)}
      <path d="M206 186 h30 l-4 12 h-22z" fill="${C.wood}"/><path d="M208 186 q13 -12 26 0z" fill="${C.green}" stroke-width="1.600"/>`;
  },
  cave(r) {
    const cry = (x, y, s, c) => `<path d="M${x} ${y} l${-10 * s} ${-26 * s} l${10 * s} ${-18 * s} l${10 * s} ${18 * s}z" fill="${c}"/><path d="M${x} ${y} v${-44 * s} M${x - 10 * s} ${y - 26 * s} h${20 * s}" stroke="#fff" stroke-width="1.400" opacity=".7"/>`;
    return `<rect width="300" height="200" fill="#4A4660" stroke="none"/>
      <path d="M118 -6 L78 206 H222 L182 -6Z" fill="#676383" stroke="none" opacity=".7"/>
      <path d="M-6 -6 H306 V20 L282 44 L262 18 L240 52 L222 16 L196 30 L176 10 L150 26 L126 8 L100 40 L80 14 L56 48 L36 16 L14 36 L-6 20Z" fill="#35324A"/>
      ${_hill('M-6 160 Q150 144 306 158 V206 H-6Z', '#5E5A78')}
      <circle cx="142" cy="142" r="58" fill="#FFF6C9" opacity=".16" stroke="none"/>
      ${cry(40, 168, 1.2, C.purple)}${cry(64, 174, .8, C.pink)}${cry(234, 166, 1.3, C.sky)}${cry(260, 174, .9, '#9BE0B8')}${cry(206, 180, .7, C.yellow)}
      ${r ? cry(18, 180, .7, C.sky) + cry(284, 182, .7, C.pink) + _burst(52, 96, C.yellow, .7) + _burst(246, 88, '#fff', .7) + _burst(150, 60, C.pink, .6) : ''}
      ${_dots([[92, 70], [206, 64], [66, 124], [228, 118], [162, 44]], 2.200, '#FFF6C9')}`;
  },
  safari(r) {
    return `<rect width="300" height="200" fill="${r ? '#F3C89A' : '#F6E9C8'}" stroke="none"/>
      <circle cx="${r ? 160 : 56}" cy="${r ? 86 : 40}" r="${r ? 32 : 17}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 128 Q150 114 300 126 V200 H0Z', '#E3C98F')}
      ${r ? `<path d="M118 128 q0 -20 22 -20 q20 0 22 16 q8 2 8 14 v6 h-5 v-8 q-4 0 -6 -4 v12 h-8 v-12 h-16 v12 h-8z" fill="#9AA3AD" stroke-width="1.600"/><circle cx="158" cy="118" r="1.400" fill="${C.line}" stroke="none"/>` : ''}
      <path d="M62 152 q-3 -30 8 -52" stroke="${C.dwood}" stroke-width="6"/><path d="M24 100 q48 -34 100 0 q-50 14 -100 0z" fill="${C.green}"/>
      ${_hill('M0 152 Q150 138 300 150 V200 H0Z', '#D6B46F')}
      <path d="M208 178 v-32 M219 178 v-32 M236 178 v-32 M247 178 v-32" stroke-width="3"/><ellipse cx="228" cy="140" rx="26" ry="13" fill="${C.yellow}"/>
      <path d="M240 136 L251 80 h11 L258 140Z" fill="${C.yellow}"/><path d="M256 70 v-8 M263 70 v-8" stroke-width="2"/><path d="M249 82 q2 -13 14 -11 q9 2 9 10 q-9 5 -23 1z" fill="${C.yellow}"/>
      ${_dots([[214, 138], [228, 145], [238, 134], [249, 118], [253, 100]], 3.200, C.dwood)}<circle cx="265" cy="76" r="1.500" fill="${C.line}" stroke="none"/>
      <path d="M30 182 l-3 -8 M30 182 l0 -10 M30 182 l3 -8 M190 190 l-3 -8 M190 190 l0 -10 M190 190 l3 -8 M276 186 l-3 -8 M276 186 l0 -10 M276 186 l3 -8" stroke="${C.dwood}" stroke-width="2"/>`;
  },
  pyramid(r) {
    const camel = (x, y) => `<path d="M${x} ${y} q4 -14 12 -8 q4 -10 10 0 q6 -6 10 2 l4 -11 l5 2 l-4 13 v15 h-4 v-11 h-22 v11 h-4z" fill="${C.dwood}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#3E4A7A' : '#F6E9C8'}" stroke="none"/>
      ${r ? _dots([[30, 24], [84, 44], [130, 18], [228, 30], [276, 52], [180, 28]], 2, '#FFF6C9') + `<path d="M256 22 A15 15 0 1 0 270 46 A12 12 0 0 1 256 22Z" fill="#FFF6C9"/>` : `<circle cx="58" cy="38" r="17" fill="#F3D98B"/>`}
      <path d="M124 142 L198 46 L272 142Z" fill="#E9CF8F"/><path d="M198 46 L228 142 H272Z" fill="#D6B46F" stroke-width="1.600"/>
      <path d="M150 110 h36 M140 124 h54 M168 86 h20" stroke-width="1.400"/>
      <path d="M32 142 L86 78 L140 142Z" fill="#EBD39A"/><path d="M86 78 L106 142 H140Z" fill="#D9BC7A" stroke-width="1.600"/>
      ${_hill('M0 138 Q100 126 190 140 T300 134 V200 H0Z', r ? '#C2A878' : '#E3C27F')}
      ${r ? camel(150, 138) + camel(196, 142) : ''}
      <path d="M274 176 q-6 -26 2 -46" stroke="${C.dwood}" stroke-width="5"/>
      <path d="M276 130 q-22 -10 -32 5 q18 -5 32 -5z M276 130 q-8 -20 -27 -17 q15 5 27 17z M276 130 q18 -12 30 2 q-17 -4 -30 -2z" fill="${C.green}" stroke-width="1.800"/>`;
  },
  track(r) {
    let sq = '', crowd = '';
    for (let i = 0; i < 12; i++) if ((i + Math.floor(i / 4)) % 2 === 0) sq += `<rect x="${250 + (i % 4) * 9}" y="${66 + Math.floor(i / 4) * 9}" width="9" height="9" fill="${C.line}" stroke="none"/>`;
    const cs = [C.coral, C.yellow, C.blue, C.pink, C.lgreen, C.purple];
    for (let i = 0; i < 18; i++) crowd += `<circle cx="${30 + (i % 9) * 13}" cy="${86 + Math.floor(i / 9) * 12}" r="4" fill="${cs[i % 6]}" stroke="none"/>`;
    const car = (x, y, c) => `<path d="M${x - 24} ${y} q0 -9 10 -10 l8 -9 h18 l8 9 q12 1 12 10z" fill="${c}" stroke-width="2"/><circle cx="${x - 12}" cy="${y + 1}" r="6" fill="#5B4636" stroke-width="1.600"/><circle cx="${x + 14}" cy="${y + 1}" r="6" fill="#5B4636" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="#DCECE6" stroke="none"/><circle cx="210" cy="34" r="15" fill="#F3D98B"/>
      ${r ? _burst(40, 34, C.coral, .9) + _burst(116, 22, C.yellow, .7) + _burst(170, 52, C.pink, .6) : ''}
      <path d="M14 76 L20 62 H152 L158 76Z" fill="${C.coral}"/><rect x="20" y="76" width="132" height="38" fill="${C.cream}"/>${crowd}
      ${_hill('M0 114 Q150 102 300 112 V200 H0Z', '#A9C987')}
      <path d="M-6 150 Q150 120 306 150 V206 H-6Z" fill="#9A9488"/><path d="M-6 150 Q150 120 306 150" stroke="${C.red}" stroke-width="5" stroke-dasharray="10 10"/>
      <path d="M0 176 Q150 148 300 176" stroke="#fff" stroke-width="3" stroke-dasharray="14 12"/>
      <path d="M250 140 V64"/><rect x="250" y="66" width="36" height="27" fill="${C.white}"/>${sq}<rect x="250" y="66" width="36" height="27"/>
      ${car(196, 158, C.blue)}${r ? car(254, 180, C.yellow) : ''}
      ${r ? `<path d="M168 184 h20 M178 184 v-8"/><path d="M166 152 h24 v8 q0 14 -12 16 q-12 -2 -12 -16z" fill="${C.yellow}"/>` : ''}`;
  },
  canyon(r) {
    const hb = (x, y, c) => `<path d="M${x - 5} ${y + 18} l2 6 M${x + 5} ${y + 18} l-2 6" stroke-width="1.200"/><ellipse cx="${x}" cy="${y}" rx="13" ry="16" fill="${c}"/><rect x="${x - 4}" y="${y + 23}" width="8" height="6" rx="1.500" fill="${C.wood}" stroke-width="1.400"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6C9A0' : '#F6E9C8'}" stroke="none"/>
      <circle cx="${r ? 150 : 150}" cy="${r ? 70 : 32}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${r ? hb(60, 34, C.coral) + hb(104, 58, C.blue) : `<path d="M60 40 q6 -6 12 0 q6 -6 12 0" stroke-width="2"/>`}
      <path d="M-6 122 V74 H38 V58 H98 V80 H128 V122Z" fill="#D9936B"/><path d="M-6 92 H128 M38 74 H98" stroke-width="1.400"/>
      <path d="M172 122 V62 H228 V46 H272 V74 H306 V122Z" fill="#CC8560"/><path d="M172 84 H306 M228 62 H272 M172 104 H306" stroke-width="1.400"/>
      <path d="M-6 120 H306 V206 H-6Z" fill="#E0A070"/><path d="M-6 120 H306"/>
      <path d="M112 206 L138 124 H176 L196 206Z" fill="#B86F50"/><path d="M142 206 L152 140 H164 L172 206Z" fill="${C.sky}" stroke-width="1.800"/>
      <path d="M124 150 l10 2 M186 164 l-10 2 M120 180 l12 2" stroke-width="1.400"/>
      <path d="M50 186 V150 q0 -8 8 -8 q8 0 8 8 V186z" fill="${C.green}"/><path d="M44 170 h-9 v-12 M72 164 h9 v-10" stroke="${C.line}" stroke-width="9"/><path d="M44 170 h-9 v-12 M72 164 h9 v-10" stroke="${C.green}" stroke-width="5"/>`;
  },
  candy(r) {
    const lol = (x, y, h, rr, c) => `<path d="M${x} ${y} v${-h}" stroke-width="3.500"/><circle cx="${x}" cy="${y - h - rr + 3}" r="${rr}" fill="${c}"/><path d="M${x} ${y - h - rr + 3} m${-rr * .55} 0 a${rr * .55} ${rr * .55} 0 1 1 ${rr * .55} ${rr * .55} a${rr * .3} ${rr * .3} 0 1 1 ${-rr * .3} ${-rr * .3}" stroke="#fff" stroke-width="2.200"/>`;
    const cl = (x, y, s) => `<path d="M${x} ${y} a${8 * s} ${8 * s} 0 0 1 ${2 * s} -${16 * s} a${11 * s} ${11 * s} 0 0 1 ${21 * s} -${s} a${8.5 * s} ${8.5 * s} 0 0 1 ${s} ${17 * s}z" fill="#fff"/>`;
    let sp = '';
    for (let i = 0, n = r ? 22 : 0; i < n; i++) { const x = (i * 43 + 19) % 290, y = (i * 29 + 13) % 120 + 10; sp += `<path d="M${x} ${y} l5 3" stroke="${[C.coral, C.blue, C.yellow, C.green][i % 4]}" stroke-width="3" transform="rotate(${i * 47} ${x} ${y})"/>`; }
    return `<rect width="300" height="200" fill="${r ? '#EDE4F5' : '#FBE9EE'}" stroke="none"/>
      ${r ? _arcBow(150, 150, 112) : cl(30, 52, 1.5) + cl(210, 44, 1.2)}
      ${_hill('M0 126 Q80 98 160 120 T300 106 V200 H0Z', '#F6D3DA')}
      ${lol(40, 150, 46, 17, C.coral)}${lol(84, 142, 30, 12, C.blue)}
      <rect x="198" y="108" width="68" height="48" fill="#D9A866"/><path d="M188 110 L232 70 L276 110Z" fill="${C.pink}"/>
      <path d="M192 108 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0 q5 7 10 0" stroke="#fff" stroke-width="3"/>
      <path d="M222 156 v-22 a10 10 0 0 1 20 0 v22z" fill="${C.coral}"/><circle cx="210" cy="124" r="5" fill="${C.yellow}" stroke-width="1.600"/><circle cx="254" cy="124" r="5" fill="${C.sky}" stroke-width="1.600"/><circle cx="232" cy="90" r="5.500" fill="${C.white}" stroke-width="1.600"/>
      ${_hill('M0 150 Q150 136 300 148 V200 H0Z', '#F2B8C0')}
      <path d="M270 192 V150 q0 -12 -11 -12 q-11 0 -11 12" stroke-width="10"/><path d="M270 192 V150 q0 -12 -11 -12 q-11 0 -11 12" stroke="#fff" stroke-width="6"/><path d="M270 192 V150 q0 -12 -11 -12 q-11 0 -11 12" stroke="${C.red}" stroke-width="6" stroke-dasharray="7 9"/>
      ${_dots([[20, 176], [66, 186], [200, 180], [228, 190], [186, 168]], 3, C.white)}${sp}`;
  }
});

/* ==========================================================
 *  第六批：更多宠物、负一楼车库、更多小车、搬家和各地的小铺、更多景点
 * ========================================================== */
/* ---------- 八只新宠物 ----------
 * trick 是表演才艺时的动作 */
Object.assign(PETS, {
  panda:   { name: '熊猫',   defName: '滚滚', desc: '爱吃竹笋的黑白团子', fav: 'shoot',       talent: '打滚',   talentIcon: 'sparkle', trick: 'trick-roll', eyes: [77, 123, 90], hat: [100, 45] },
  fox:     { name: '小狐狸', defName: '阿橘', desc: '机灵的大尾巴',       fav: 'grape',       talent: '转圈圈', talentIcon: 'sparkle', trick: 'trick-spin', eyes: [78, 122, 88], hat: [100, 44] },
  penguin: { name: '小企鹅', defName: '摇摇', desc: '走路一摇一摆',       fav: 'fish',        talent: '翻跟头', talentIcon: 'sparkle', trick: 'trick-flip', eyes: [80, 120, 92], hat: [100, 34] },
  pig:     { name: '小猪',   defName: '噜噜', desc: '粉嘟嘟的小吃货',     fav: 'sweetpotato', talent: '打滚',   talentIcon: 'sparkle', trick: 'trick-roll', eyes: [76, 124, 82], hat: [100, 45] },
  monkey:  { name: '小猴',   defName: '淘淘', desc: '爬树荡秋千样样行',   fav: 'banana',      talent: '翻跟头', talentIcon: 'sparkle', trick: 'trick-flip', eyes: [80, 120, 88], hat: [100, 44] },
  bear:    { name: '小熊',   defName: '布布', desc: '抱起来软乎乎',       fav: 'strawberry',  talent: '转圈圈', talentIcon: 'sparkle', trick: 'trick-spin', eyes: [78, 122, 86], hat: [100, 45] },
  dino:    { name: '小恐龙', defName: '嗷嗷', desc: '其实一点也不凶',     fav: 'broccoli',    talent: '蹦蹦跳', talentIcon: 'sparkle', trick: 'trick-jump', eyes: [78, 122, 84], hat: [100, 46] },
  unicorn: { name: '独角兽', defName: '星星', desc: '鬃毛像彩虹一样',     fav: 'peach',       talent: '转圈圈', talentIcon: 'sparkle', trick: 'trick-spin', eyes: [78, 122, 88], hat: [100, 44] }
});
Object.assign(PET_DRAW, {
  panda(m) {
    const e = PETS.panda.eyes, k = '#5B4636';
    return `
      <circle cx="56" cy="50" r="18" fill="${k}"/><circle cx="144" cy="50" r="18" fill="${k}"/>
      <ellipse cx="100" cy="152" rx="44" ry="35" fill="${C.white}"/>
      <path d="M60 152 q-10 -26 12 -36 q12 14 4 38z" fill="${k}"/><path d="M140 152 q10 -26 -12 -36 q-12 14 -4 38z" fill="${k}"/>
      <ellipse cx="80" cy="182" rx="15" ry="8" fill="${k}"/><ellipse cx="120" cy="182" rx="15" ry="8" fill="${k}"/>
      <ellipse cx="100" cy="90" rx="54" ry="47" fill="${C.white}"/>
      <ellipse cx="${e[0]}" cy="${e[2]}" rx="16" ry="19" fill="${k}" stroke="none" transform="rotate(18 ${e[0]} ${e[2]})"/><ellipse cx="${e[1]}" cy="${e[2]}" rx="16" ry="19" fill="${k}" stroke="none" transform="rotate(-18 ${e[1]} ${e[2]})"/>
      <circle cx="${e[0]}" cy="${e[2]}" r="10" fill="#fff" stroke="none"/><circle cx="${e[1]}" cy="${e[2]}" r="10" fill="#fff" stroke="none"/>
      ${_eye(e[0], e[2], m, 5)}${_eye(e[1], e[2], m, 5)}${_blush(56, 144, 112)}
      <ellipse cx="100" cy="106" rx="6.500" ry="4.500" fill="${k}" stroke="none"/>
      ${_mouth(100, 111, m)}`;
  },
  fox(m) {
    const e = PETS.fox.eyes, o = '#E59A5A';
    return `
      <g class="tail"><path d="M134 170 Q192 170 176 106 Q146 124 150 148 Q146 160 134 170Z" fill="${o}"/><path d="M176 106 Q160 114 155 130 Q170 136 180 126 Q182 116 176 106Z" fill="${C.cream}" stroke-width="2"/></g>
      <ellipse cx="100" cy="150" rx="42" ry="35" fill="${o}"/>
      <ellipse cx="100" cy="160" rx="24" ry="22" fill="${C.cream}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="#5B4636"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="#5B4636"/>
      <path d="M54 68 L42 12 L94 42Z" fill="${o}"/><path d="M59 54 L53 26 L79 42Z" fill="${C.cream}" stroke="none"/>
      <path d="M146 68 L158 12 L106 42Z" fill="${o}"/><path d="M141 54 L147 26 L121 42Z" fill="${C.cream}" stroke="none"/>
      <path d="M100 42 Q150 42 156 82 Q170 100 148 116 Q126 136 100 136 Q74 136 52 116 Q30 100 44 82 Q50 42 100 42Z" fill="${o}"/>
      <path d="M45 102 Q72 94 100 112 Q128 94 155 102 Q148 118 126 129 Q112 134 100 134 Q88 134 74 129 Q52 118 45 102Z" fill="${C.cream}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 106)}
      <ellipse cx="100" cy="109" rx="6.500" ry="4.500" fill="${C.line}" stroke="none"/>
      ${_mouth(100, 114, m)}`;
  },
  penguin(m) {
    const e = PETS.penguin.eyes, k = '#5F7186';
    const beak = m === 'eat'
      ? `<path d="M90 105 L110 105 L100 112Z" fill="${C.orange}"/><path d="M92 116 L108 116 L100 126Z" fill="${C.orange}"/>`
      : `<path d="M90 107 L110 107 L100 121Z" fill="${C.orange}"/>`;
    return `
      <path d="M82 176 q-16 2 -18 12 h30z M118 176 q16 2 18 12 h-30z" fill="${C.orange}"/>
      <path d="M100 30 Q158 32 160 112 Q162 182 100 182 Q38 182 40 112 Q42 32 100 30Z" fill="${k}"/>
      <path d="M100 68 Q74 54 63 82 Q55 112 61 140 Q69 175 100 175 Q131 175 139 140 Q145 112 137 82 Q126 54 100 68Z" fill="${C.white}" stroke="none"/>
      <g transform="rotate(20 42 128)"><ellipse class="wing wl" cx="42" cy="128" rx="12" ry="30" fill="${k}"/></g>
      <g transform="rotate(-20 158 128)"><ellipse class="wing wr" cx="158" cy="128" rx="12" ry="30" fill="${k}"/></g>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(64, 136, 110)}${beak}`;
  },
  pig(m) {
    const e = PETS.pig.eyes, p = '#F4C6C4', d = '#E8A3A0';
    return `
      <path class="tail" d="M140 160 q18 -2 17 -15 q-1 -10 -10 -8 q-7 3 -4 10 q3 5 9 2" stroke-width="4"/>
      <ellipse cx="100" cy="150" rx="46" ry="36" fill="${p}"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${d}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${d}"/>
      <path d="M60 64 L42 28 Q72 24 90 46Z" fill="${d}"/><path d="M140 64 L158 28 Q128 24 110 46Z" fill="${d}"/>
      <ellipse cx="100" cy="90" rx="54" ry="47" fill="${p}"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(54, 146, 100)}
      <ellipse cx="100" cy="103" rx="21" ry="15" fill="${d}"/><path d="M93 103 v.100 M107 103 v.100" stroke-width="6"/>
      ${_mouth(100, 119, m)}`;
  },
  monkey(m) {
    const e = PETS.monkey.eyes, b = '#B98A5E', f = '#F3DFC1';
    const tail = 'M138 166 q38 0 36 -34 q-2 -22 -20 -18 q-12 4 -8 16';
    return `
      <path class="tail" d="${tail}" stroke="${C.line}" stroke-width="13"/><path class="tail" d="${tail}" stroke="${b}" stroke-width="7.500"/>
      <ellipse cx="100" cy="152" rx="40" ry="33" fill="${b}"/>
      <ellipse cx="100" cy="160" rx="23" ry="21" fill="${f}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${f}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${f}"/>
      <circle cx="46" cy="88" r="19" fill="${b}"/><circle cx="46" cy="88" r="10" fill="${f}" stroke="none"/>
      <circle cx="154" cy="88" r="19" fill="${b}"/><circle cx="154" cy="88" r="10" fill="${f}" stroke="none"/>
      <ellipse cx="100" cy="88" rx="50" ry="46" fill="${b}"/>
      <path d="M100 66 Q86 54 72 62 Q58 72 62 92 Q60 124 100 128 Q140 124 138 92 Q142 72 128 62 Q114 54 100 66Z" fill="${f}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(64, 136, 104)}
      <path d="M96 101 v.100 M104 101 v.100" stroke-width="3"/>
      ${_mouth(100, 106, m)}`;
  },
  bear(m) {
    const e = PETS.bear.eyes, b = '#CFA06C', f = '#F3E3C4';
    return `
      <circle cx="58" cy="50" r="18" fill="${b}"/><circle cx="58" cy="50" r="9" fill="${f}" stroke="none"/>
      <circle cx="142" cy="50" r="18" fill="${b}"/><circle cx="142" cy="50" r="9" fill="${f}" stroke="none"/>
      <circle cx="142" cy="166" r="10" fill="${b}"/>
      <ellipse cx="100" cy="152" rx="45" ry="35" fill="${b}"/>
      <ellipse cx="100" cy="160" rx="26" ry="22" fill="${f}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="15" ry="8" fill="${b}"/><ellipse cx="120" cy="182" rx="15" ry="8" fill="${b}"/>
      <ellipse cx="100" cy="90" rx="54" ry="47" fill="${b}"/>
      <ellipse cx="100" cy="108" rx="24" ry="18" fill="${f}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 104)}
      <ellipse cx="100" cy="100" rx="8" ry="6" fill="${C.line}" stroke="none"/>
      ${_mouth(100, 108, m)}`;
  },
  dino(m) {
    const e = PETS.dino.eyes, g = '#A9CC8E', d = '#7FAE6E';
    return `
      <path class="tail" d="M134 174 Q178 178 186 138 Q164 150 138 146Z" fill="${g}"/>
      <ellipse cx="100" cy="150" rx="44" ry="36" fill="${g}"/>
      <ellipse cx="100" cy="159" rx="26" ry="23" fill="${C.cream}" stroke="none"/>
      <path d="M86 150 h28 M84 160 h32 M88 170 h24" stroke="#E0D2A8" stroke-width="2"/>
      <ellipse cx="59" cy="146" rx="9" ry="6.500" fill="${g}"/><ellipse cx="141" cy="146" rx="9" ry="6.500" fill="${g}"/>
      <ellipse cx="80" cy="182" rx="15" ry="8" fill="${d}"/><ellipse cx="120" cy="182" rx="15" ry="8" fill="${d}"/>
      <path d="M82 50 L89 28 L100 44 L111 26 L118 50Z" fill="${d}"/>
      <ellipse cx="100" cy="90" rx="52" ry="46" fill="${g}"/>
      <circle cx="60" cy="72" r="4.500" fill="${d}" stroke="none"/><circle cx="142" cy="68" r="5.500" fill="${d}" stroke="none"/><circle cx="132" cy="56" r="3.500" fill="${d}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 102)}
      <path d="M94 99 v.100 M106 99 v.100" stroke-width="3"/>
      ${_mouth(100, 105, m)}`;
  },
  unicorn(m) {
    const e = PETS.unicorn.eyes, w = '#FDF8F0';
    return `
      <path class="tail" d="M138 162 q36 -2 36 -38 q-14 4 -18 16 q-2 -10 -12 -12 q4 18 -6 34z" fill="${C.purple}"/>
      <ellipse cx="100" cy="152" rx="42" ry="34" fill="${w}"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${C.pink}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${C.pink}"/>
      <path d="M62 62 L54 26 L86 46Z" fill="${w}"/><path d="M138 62 L146 26 L114 46Z" fill="${w}"/>
      <path d="M90 48 L100 4 L110 48Z" fill="${C.yellow}"/><path d="M95 34 l9 -5 M93 43 l13 -7 M98 22 l5 -3" stroke-width="1.800"/>
      <ellipse cx="100" cy="90" rx="52" ry="46" fill="${w}"/>
      <path d="M102 46 Q76 40 62 58 Q56 68 58 78 Q68 64 84 62 Q96 58 102 46Z" fill="${C.pink}"/>
      <path d="M100 46 Q124 40 140 58 Q146 68 144 76 Q134 62 118 60 Q106 56 100 46Z" fill="${C.purple}"/>
      <path d="M150 74 q12 14 6 36 q-10 -6 -12 -20z" fill="${C.sky}"/>
      <ellipse cx="100" cy="111" rx="25" ry="16" fill="#FBE3E0" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 104)}
      <path d="M92 109 v.100 M108 109 v.100" stroke-width="3"/>
      ${_mouth(100, 113, m)}`;
  }
});

/* ---------- 第六批图标 ---------- */
Object.assign(ICONS, {
  // 新小车
  tricycle: _wh(36, 36, 8) + _wh(11, 39, 5) + `<path d="M36 36 L31 14" stroke-width="3"/><path d="M26 14 h10" stroke-width="4"/>` + _line2('M33 23 L14 30', C.coral, 3) + `<path d="M7 25 h13 v4.500 h-13z" fill="${C.yellow}"/>`,
  motorbike: _wh(11, 37, 7) + _wh(38, 37, 7) + `<path d="M6 33 Q6 25 15 24 H27 L31 32 H34 L37 14 H42 L44 34 H37 Q33 28 28 34 H18 Q14 28 8 31Z" fill="${C.blue}"/><path d="M14 24 h13 q2 -4.500 -2 -5.500 h-9 q-3 1 -2 5.500z" fill="#5B4636"/><path d="M34 14 h9" stroke-width="3.500"/>`,
  jeep: `<path d="M4 33 V20 H16 V11 H34 L38 20 H44 Q46 21 46 24 V33 Q46 35 44 35 H6 Q4 35 4 33Z" fill="#8DB574"/><path d="M19 19 V14 H25 V19Z M28 14 H32 L35 19 H28Z" fill="${C.sky}" stroke-width="1.600"/><rect x="1" y="20" width="4" height="10" rx="2" fill="#5B4636"/>` + _wh(14, 36, 6) + _wh(36, 36, 6),
  bus: `<path d="M3 33 V13 Q3 9 7 9 H38 Q44 10 45 18 V33 Q45 35 43 35 H5 Q3 35 3 33Z" fill="${C.yellow}"/><path d="M4 27 H45" stroke="#5B4636" stroke-width="2.400"/><rect x="7" y="13" width="7" height="8" rx="1.500" fill="${C.sky}" stroke-width="1.400"/><rect x="16" y="13" width="7" height="8" rx="1.500" fill="${C.sky}" stroke-width="1.400"/><rect x="25" y="13" width="7" height="8" rx="1.500" fill="${C.sky}" stroke-width="1.400"/><rect x="35" y="13" width="6" height="18" rx="1.500" fill="${C.sky}" stroke-width="1.400"/>` + _wh(13, 36, 5.5) + _wh(35, 36, 5.5),
  firetruck: `<path d="M3 33 V19 H28 V12 H38 Q42 13 44 19 L46 24 V33 Q46 35 44 35 H5 Q3 35 3 33Z" fill="${C.red}"/><path d="M31 15 H37 Q40 16 41 21 H31Z" fill="${C.sky}" stroke-width="1.600"/><path d="M5 12 H26 M5 16 H26 M9 12 v4 M14 12 v4 M19 12 v4 M24 12 v4" stroke-width="1.600"/><path d="M4.500 29 H45" stroke="#fff" stroke-width="2.600"/><rect x="33" y="7.500" width="5" height="4.500" rx="1.500" fill="${C.blue}" stroke-width="1.400"/>` + _wh(13, 36, 5.5) + _wh(36, 36, 5.5),
  train: `<rect x="4" y="11" width="16" height="23" rx="2" fill="${C.red}"/><rect x="7" y="15" width="8" height="8" rx="1.500" fill="${C.sky}" stroke-width="1.400"/><path d="M20 20 H38 Q43 20 43 25 V34 H20Z" fill="${C.blue}"/><path d="M32 20 V13 h-2 v-4 h9 v4 h-2 v7z" fill="#5B4636"/><path d="M2 11 h20" stroke-width="3.500"/>` + _wh(12, 37, 6) + _wh(26, 38, 5) + _wh(37, 38, 5),
  heli: `<path d="M8 8 H42 M25 8 v5" stroke-width="3"/><path d="M16 13 H30 Q39 14 40 22 Q39 30 30 31 H21 Q14 30 13 24 L3 21 V17 L13 18 Q14 14 16 13Z" fill="${C.orange}"/><path d="M28 16 H31 Q36 17 37 22 H28Z" fill="${C.sky}" stroke-width="1.600"/><path d="M20 31 v5 M31 31 v5 M14 37.500 H38" stroke-width="2.400"/><circle cx="4" cy="19" r="3.500" stroke-width="1.600"/>`,
  ufo: `<path d="M14 30 l-4 11 M34 30 l4 11 M24 32 v9" stroke-width="2.400"/><path d="M15 21 Q15 6 24 6 Q33 6 33 21Z" fill="${C.sky}"/><ellipse cx="24" cy="24" rx="21" ry="7.500" fill="${C.purple}"/>` + _dots([[9, 25], [17, 28], [24, 29], [31, 28], [39, 25]], 2, C.yellow),
  // 新旅行用品
  compass: `<rect x="21" y="3" width="6" height="6" rx="2" fill="${C.yellow}"/><circle cx="24" cy="26" r="18" fill="${C.cream}"/><circle cx="24" cy="26" r="13" stroke-width="1.600"/><path d="M24 14 L28 26 H20Z" fill="${C.red}" stroke-width="1.600"/><path d="M24 38 L28 26 H20Z" fill="${C.white}" stroke-width="1.600"/>`,
  rod: `<path d="M8 44 L36 6" stroke-width="3"/><path d="M36 6 Q46 14 40 28" stroke-width="1.400"/><circle cx="15" cy="35" r="4" fill="${C.yellow}" stroke-width="1.600"/>` + _fish(36, 34, C.orange),
  sled: `<path d="M5 10 l4 3 M14 5 l2 5 M40 8 l-3 4" stroke="${C.blue}" stroke-width="2"/><path d="M6 38 H36 Q44 38 44 30" stroke-width="3"/><path d="M12 38 V28 M30 38 V28" stroke-width="2.400"/><rect x="6" y="20" width="30" height="8" rx="3" fill="${C.red}"/><path d="M36 24 Q44 22 44 30" stroke-width="2"/>`,
  ticket: `<path d="M4 14 h40 v7 a4 4 0 0 0 0 8 v7 h-40 v-7 a4 4 0 0 0 0 -8z" fill="${C.pink}"/><path d="M32 14 v22" stroke-width="1.400" stroke-dasharray="3 3"/>` + _star(18, 25, 7, 3.2, C.yellow),
  treasure: `<path d="M6 10 Q24 4 42 10 V38 Q24 32 6 38Z" fill="${C.sand}"/><path d="M12 30 q6 -10 12 -4 q6 4 10 -8" stroke="${C.dwood}" stroke-width="2" stroke-dasharray="3 3"/><path d="M31 13 l6 6 M37 13 l-6 6" stroke="${C.red}" stroke-width="2.600"/>`,
  // 新特产
  raisin: `<path d="M30 10 q8 -6 12 2 q-8 4 -12 -2z" fill="${C.green}" stroke-width="1.600"/><path d="M6 24 h36 q-2 18 -18 18 q-16 0 -18 -18z" fill="${C.white}"/><ellipse cx="24" cy="24" rx="18" ry="4.500" fill="#8C6BA6" stroke-width="1.600"/>` + _dots([[16, 23], [24, 25], [32, 23], [20, 21.5], [28, 21.5]], 1.800, '#6E4E86'),
  seedcake: `<ellipse cx="24" cy="28" rx="20" ry="13" fill="#E2B877"/><path d="M7 26 q17 -12 34 0" stroke-width="1.600"/><path d="M15 31 l3 -3 M23 34 l3 -3 M31 30 l3 -3 M21 26 l3 -3 M28 25 l3 -3" stroke="${C.dwood}" stroke-width="3"/>`,
  lavice: `<path d="M26 7 l4 -5" stroke="${C.dgreen}" stroke-width="2"/><path d="M15 24 L24 46 L33 24Z" fill="#E2B877"/><path d="M19 30 l8 5 M29 30 l-8 5" stroke-width="1.200"/><path d="M10 24 Q8 6 24 6 Q40 6 38 24 q-3.500 5 -7 0 q-3.500 5 -7 0 q-3.500 5 -7 0 q-3.500 5 -7 0z" fill="${C.purple}"/>`,
  bananachip: `<path d="M10 8 h28 l-2 5 l3 27 q0 4 -4 4 h-22 q-4 0 -4 -4 l3 -27z" fill="${C.yellow}"/><path d="M11.500 13 h25" stroke-width="1.600"/><circle cx="24" cy="28" r="8" fill="${C.cream}" stroke-width="1.600"/><path d="M21 29 v.100 M27 29 v.100 M24 25 v.100" stroke="${C.dwood}" stroke-width="2.200"/>`,
  pandabun: `<circle cx="11" cy="15" r="5.500" fill="#5B4636"/><circle cx="37" cy="15" r="5.500" fill="#5B4636"/><path d="M5 39 Q3 12 24 12 Q45 12 43 39Z" fill="${C.white}"/><path d="M3 39 h42"/><ellipse cx="17" cy="26" rx="4" ry="5" fill="#5B4636" stroke="none"/><ellipse cx="31" cy="26" rx="4" ry="5" fill="#5B4636" stroke="none"/><circle cx="24" cy="31" r="1.800" fill="#5B4636" stroke="none"/>`,
  fishcake: `<path d="M4 24 Q14 8 30 14 L44 8 V40 L30 34 Q14 40 4 24Z" fill="#E2B877"/><circle cx="12" cy="22" r="1.800" fill="${C.line}" stroke="none"/><path d="M20 18 q4 6 0 12 M26 17 q4 7 0 14" stroke-width="1.500"/>`,
  starcookie: _star(24, 25, 21, 10, '#E9B48A') + _dots([[24, 25], [24, 13], [14, 22], [34, 22], [18, 35], [30, 35]], 1.700, C.dwood),
  osmanthus: `<path d="M6 22 L24 12 L42 22 V34 L24 44 L6 34Z" fill="#F6E7B4"/><path d="M6 22 L24 32 L42 22 M24 32 V44" stroke-width="1.800"/><path d="M6 28 L24 38 L42 28" stroke="${C.orange}" stroke-width="2.400"/>` + _dots([[18, 20], [24, 17], [30, 21], [24, 24]], 1.800, C.orange),
  goldcoin: `<circle cx="24" cy="24" r="19" fill="${C.yellow}"/><circle cx="24" cy="24" r="14" stroke-width="1.600"/>` + _star(24, 24, 8, 3.6, '#F6E7B4'),
  clamsoup: `<path d="M16 13 q-3 -3 0 -6 M24 13 q-3 -3 0 -6 M32 13 q-3 -3 0 -6" stroke-width="1.800"/><path d="M5 22 h38 q-2 20 -19 20 q-17 0 -19 -20z" fill="${C.white}"/><ellipse cx="24" cy="22" rx="19" ry="4.200" fill="#F3DCA8" stroke-width="1.600"/><path d="M17 22.500 q7 -8 14 0z" fill="${C.pink}" stroke-width="1.400"/>`,
  aurorajelly: `<path d="M3 41 h42"/><path d="M10 40 Q6 14 24 12 Q42 14 38 40Z" fill="#9BE0B8"/><path d="M10.500 31 q13.500 -8 27 0 l.500 9 h-28z" fill="${C.purple}" stroke="none" opacity=".7"/><path d="M10 40 Q6 14 24 12 Q42 14 38 40Z"/>` + _dots([[18, 22], [28, 19], [24, 27]], 1.600, '#fff'),
  fishball: `<path d="M37 31 q-3 -3 0 -6 M42 37 q-3 -3 0 -6" stroke-width="1.600"/><path d="M10 43 L38 7" stroke-width="2.400"/><circle cx="16" cy="35" r="7" fill="${C.cream}"/><circle cx="24" cy="25" r="7" fill="${C.cream}"/><circle cx="32" cy="15" r="7" fill="${C.cream}"/>`,
  lavacake: `<path d="M22 9 q-3 -3 0 -6" stroke-width="1.600"/><path d="M3 41 h42"/><path d="M8 40 V22 Q8 16 16 16 H32 Q40 16 40 22 V40Z" fill="#8C5A44"/><path d="M11 17 q3 11 8 3 q3 12 8 0 q4 9 9.500 -3z" fill="${C.orange}" stroke-width="1.600"/>`,
  dinoegg: `<path d="M24 4 Q40 6 40 28 Q40 44 24 44 Q8 44 8 28 Q8 6 24 4Z" fill="${C.cream}"/>` + _dots([[17, 16], [30, 13], [33, 33], [17, 36], [25, 38]], 3, '#9DBB7A') + `<path d="M8.500 27 l6 -4 l5 5 l6 -5 l5 5 l8.500 -4" stroke-width="1.600"/>`,
  crowncookie: `<path d="M6 38 L4 14 L15 24 L24 8 L33 24 L44 14 L42 38Z" fill="#E2B877"/><path d="M9 32 h30" stroke="${C.cream}" stroke-width="3"/><circle cx="24" cy="21" r="2.600" fill="${C.red}" stroke="none"/><circle cx="12" cy="25" r="2" fill="${C.blue}" stroke="none"/><circle cx="36" cy="25" r="2" fill="${C.blue}" stroke="none"/>`,
  spaceice: `<rect x="7" y="12" width="32" height="28" rx="4" fill="${C.pink}"/><path d="M7 22 h32 v9 h-32z" fill="${C.white}" stroke-width="1.400"/><path d="M7 31 h32 v5 q0 4 -4 4 h-24 q-4 0 -4 -4z" fill="#C9A27A" stroke-width="1.400"/>` + _star(38, 10, 7, 3, C.yellow),
  rainbowcandy: `<path d="M6 34 A18 18 0 0 1 42 34" stroke="${C.coral}" stroke-width="6"/><path d="M12 34 A12 12 0 0 1 36 34" stroke="${C.yellow}" stroke-width="6"/><path d="M18 34 A6 6 0 0 1 30 34" stroke="${C.blue}" stroke-width="6"/><circle cx="8" cy="37" r="6" fill="#fff" stroke-width="1.600"/><circle cx="40" cy="37" r="6" fill="#fff" stroke-width="1.600"/>`,
  animalcracker: `<circle cx="12" cy="14" r="6" fill="#E2B877"/><circle cx="36" cy="14" r="6" fill="#E2B877"/><circle cx="24" cy="26" r="17" fill="#E2B877"/><path d="M18 23 v.100 M30 23 v.100" stroke-width="3"/><ellipse cx="24" cy="31" rx="6" ry="4.500" fill="${C.cream}" stroke-width="1.400"/><path d="M24 29.500 v.100" stroke-width="2.600"/>`,
  railbento: `<path d="M6 8 h36 M6 4.500 h36" stroke-width="1.600"/><rect x="4" y="13" width="40" height="28" rx="4" fill="${C.wood}"/><rect x="8" y="17" width="16" height="20" rx="2" fill="${C.white}" stroke-width="1.400"/><circle cx="16" cy="27" r="3" fill="${C.red}" stroke="none"/><rect x="26" y="17" width="14" height="9" rx="2" fill="${C.yellow}" stroke-width="1.400"/><rect x="26" y="28" width="14" height="9" rx="2" fill="${C.green}" stroke-width="1.400"/>`,
  takoyaki: `<path d="M27 19 L33 5" stroke-width="1.600"/><path d="M4 30 h40 l-5 12 h-30z" fill="${C.cream}"/><circle cx="14" cy="26" r="7.500" fill="#D9A866"/><circle cx="34" cy="26" r="7.500" fill="#D9A866"/><circle cx="24" cy="24" r="7.500" fill="#D9A866"/><path d="M9 23 q5 -4 10 0 M29 23 q5 -4 10 0 M19 21 q5 -4 10 0" stroke="#8C5A44" stroke-width="2.600"/>`,
  // 各地小铺的吃的喝的
  honeycomb: `<path d="M24 4 L41 14 V34 L24 44 L7 34 V14Z" fill="${C.yellow}"/><path d="M24 14 l8 5 v10 l-8 5 l-8 -5 v-10z" fill="#F6E7B4" stroke-width="1.600"/><path d="M24 4 v10 M41 14 l-9 5 M41 34 l-9 -5 M24 44 v-10 M7 34 l9 -5 M7 14 l9 5" stroke-width="1.400"/>`,
  berrypie: `<path d="M4 30 Q4 15 24 15 Q44 15 44 30Z" fill="#B0688A"/><path d="M12 20 l8 10 M22 16 l8 14 M32 18 l6 12 M36 20 l-8 10 M26 16 l-8 14 M16 18 l-6 12" stroke="#E2B877" stroke-width="2.600"/><path d="M2 30 h44 l-4 10 h-36z" fill="#E2B877"/>`,
  shrimpchip: `<path d="M10 40 Q4 26 12 14 Q22 6 34 12 Q44 20 40 34 Q34 44 24 40 Q16 44 10 40Z" fill="#F6C9C0"/><path d="M14 30 q6 -10 14 -6 M18 36 q8 -8 16 -4 M16 20 q6 -6 14 -2" stroke="${C.coral}" stroke-width="1.600"/>`,
  saltsoda: `<path d="M30 3 l-5 30" stroke="${C.blue}" stroke-width="3"/>` + _glass('#BFE3EA') + _dots([[19, 30], [26, 35], [30, 27]], 1.800, '#fff'),
  hotpot: `<path d="M14 14 q-3 -3 0 -6 M24 14 q-3 -3 0 -6 M34 14 q-3 -3 0 -6" stroke-width="1.800"/><path d="M2 27 h4 M42 27 h4" stroke-width="3.500"/><path d="M6 22 h36 v8 q0 12 -18 12 q-18 0 -18 -12z" fill="${C.red}"/><ellipse cx="24" cy="22" rx="18" ry="4.500" fill="#F3B48A" stroke-width="1.600"/>` + _dots([[17, 22], [25, 23.5], [31, 21.5]], 1.800, C.dgreen),
  gingermilk: `<path d="M17 10 q-3 -3 0 -6 M27 10 q-3 -3 0 -6" stroke-width="1.800"/><path d="M36 22 q9 0 8 8 q-1 6 -8 5"/><path d="M8 16 h28 v20 q0 6 -6 6 h-16 q-6 0 -6 -6z" fill="${C.white}"/><ellipse cx="22" cy="17" rx="13.500" ry="3" fill="#F6E7B4" stroke-width="1.400"/>`,
  datecake: `<path d="M6 20 L24 10 L42 20 V34 L24 44 L6 34Z" fill="#B07A52"/><path d="M6 20 L24 30 L42 20 M24 30 V44" stroke-width="1.800"/><ellipse cx="24" cy="20" rx="6" ry="3.500" fill="${C.cream}" stroke-width="1.400"/>`,
  minttea: _glass('#BFE3C0') + `<rect x="17" y="30" width="7" height="7" rx="1.500" fill="#fff" opacity=".75" stroke-width="1.200"/><path d="M22 21 q8 -11 17 -7 q-4 11 -17 7z" fill="${C.green}" stroke-width="1.600"/>`,
  starcandy: `<rect x="15" y="4" width="18" height="6" rx="2" fill="${C.wood}"/><path d="M12 10 h24 q4 4 4 10 v18 q0 6 -6 6 h-20 q-6 0 -6 -6 v-18 q0 -6 4 -10z" fill="#EEF5F4"/><g stroke-width="1.300">` + _star(18, 24, 5, 2.2, C.yellow) + _star(29, 22, 5, 2.2, C.pink) + _star(24, 34, 5, 2.2, C.sky) + _star(33, 35, 4, 1.8, C.purple) + _star(15, 36, 4, 1.8, C.lgreen) + '</g>',
  stardrink: _glass('#B7A3CC') + _star(24, 31, 6.5, 2.8, C.yellow) + _dots([[30, 25], [18, 36]], 1.600, '#fff'),
  hotdog: `<path d="M4 27 Q4 16 14 16 H34 Q44 16 44 27 Q44 38 34 38 H14 Q4 38 4 27Z" fill="#E2B877"/><path d="M2 25 Q2 19.500 8 19.500 H40 Q46 19.500 46 25 Q46 30.500 40 30.500 H8 Q2 30.500 2 25Z" fill="${C.coral}"/><path d="M8 25 q4 -5 8 0 q4 5 8 0 q4 -5 8 0 q4 5 8 0" stroke="${C.yellow}" stroke-width="2.400"/>`,
  crepe: `<path d="M28 9 l6 -6" stroke="${C.dwood}" stroke-width="3"/><path d="M10 16 L24 46 L38 16Z" fill="#F3DCA8"/><path d="M17 27 l12 7" stroke-width="1.200"/><path d="M8 17 q4 -11 16 -11 q12 0 16 11 q-4 5 -8 0 q-4 5 -8 0 q-4 5 -8 0 q-4 5 -8 0z" fill="${C.white}"/><circle cx="18" cy="9" r="5" fill="${C.red}" stroke-width="1.600"/>`,
  // 各地小铺的装扮
  acornhat: `<path d="M24 12 q1 -6 6 -8" stroke-width="3"/><path d="M5 34 Q3 12 24 12 Q45 12 43 34 Q24 26 5 34Z" fill="${C.dwood}"/><path d="M12 24 l4 4 M22 18 l4 4 M32 22 l4 4 M18 28 l3 3 M28 27 l3 3" stroke-width="1.400"/>`,
  butterfly: `<path d="M24 24 Q6 4 4 20 Q4 30 24 24Z M24 24 Q42 4 44 20 Q44 30 24 24Z" fill="${C.purple}"/><path d="M24 24 Q10 30 12 40 Q20 42 24 24Z M24 24 Q38 30 36 40 Q28 42 24 24Z" fill="${C.pink}"/><path d="M24 14 v24" stroke-width="3"/>`,
  sailor: `<path d="M6 30 Q0 12 24 10 Q48 12 42 30Z" fill="${C.white}"/><path d="M7 27 Q24 34 41 27 L41 33 Q24 40 7 33Z" fill="${C.blue}"/><path d="M36 35 l6 8 M40 33 l6 5" stroke="${C.blue}" stroke-width="3"/>`,
  shellclip: `<path d="M24 42 Q2 32 8 14 Q24 2 40 14 Q46 32 24 42Z" fill="${C.sky}"/><path d="M24 42 V8 M24 42 L12 14 M24 42 L36 14" stroke-width="1.600"/>`,
  earmuff: `<path d="M8 30 Q6 6 24 6 Q42 6 40 30" stroke-width="6"/><path d="M8 30 Q6 6 24 6 Q42 6 40 30" stroke="${C.blue}" stroke-width="3"/><circle cx="8" cy="32" r="8" fill="${C.white}"/><circle cx="40" cy="32" r="8" fill="${C.white}"/>`,
  knitcap: `<circle cx="24" cy="8" r="5.500" fill="${C.white}"/><path d="M7 34 Q6 12 24 12 Q42 12 41 34Z" fill="${C.coral}"/><path d="M9 24 Q24 18 39 24" stroke="${C.cream}" stroke-width="3"/><rect x="5" y="31" width="38" height="9" rx="4.500" fill="${C.cream}"/>`,
  cowboy: `<path d="M2 32 Q10 38 24 35 Q38 38 46 32 Q40 26 34 28 L32 12 Q28 8 24 13 Q20 8 16 12 L14 28 Q8 26 2 32Z" fill="${C.dwood}"/><path d="M14.500 25 Q24 29 33.500 25" stroke="${C.yellow}" stroke-width="3"/>`,
  explorer: `<path d="M3 34 Q24 26 45 34 Q24 40 3 34Z" fill="#D9C79A"/><path d="M9 31 Q9 10 24 10 Q39 10 39 31" fill="${C.sand}"/><path d="M9 27 Q24 32 39 27" stroke="${C.dwood}" stroke-width="3"/><circle cx="24" cy="9" r="2.200" fill="${C.dwood}" stroke-width="1.400"/>`,
  unicornhorn: `<path d="M6 40 Q24 28 42 40" stroke-width="6"/><path d="M6 40 Q24 28 42 40" stroke="${C.pink}" stroke-width="3"/><path d="M17 34 L24 4 L31 34Z" fill="${C.yellow}"/><path d="M19.500 25 l8 -4 M21.500 16 l5 -2.500" stroke-width="1.500"/>`,
  antenna: `<path d="M6 40 Q24 28 42 40" stroke-width="6"/><path d="M6 40 Q24 28 42 40" stroke="#9BE0B8" stroke-width="3"/><path d="M16 34 q-4 -10 -8 -18 M32 34 q4 -10 8 -18" stroke-width="2"/><circle cx="7" cy="12" r="5.500" fill="#9BE0B8"/><circle cx="41" cy="12" r="5.500" fill="#9BE0B8"/>`,
  tophat: `<ellipse cx="24" cy="36" rx="21" ry="5" fill="#5B4636"/><path d="M12 35 V10 Q24 6 36 10 V35 Q24 39 12 35Z" fill="#5B4636"/><path d="M12 28 Q24 32 36 28" stroke="${C.red}" stroke-width="4"/>`,
  starglasses: `<g stroke-width="2">` + _star(13, 24, 11.5, 6, C.yellow) + _star(35, 24, 11.5, 6, C.yellow) + `</g><path d="M21 23 h6" stroke-width="2.400"/>`
});

/* ---------- 更多小车（都停在负一楼的车库）和各地小铺才有的家具 ---------- */
Object.assign(FURNS, {
  tricycle:  { name: '三轮车',   type: 'floor', price: 450,  car: 1.8, ic: 'tricycle',  tip: '路上快八成', w: 104, vb: [150, 132],
    draw: () => _wh(118, 104, 23) + _wh(36, 112, 14) + _line2('M118 104 L104 40', C.coral, 5) + `<path d="M86 40 h34" stroke-width="8"/>` + _line2('M108 62 L46 86', C.coral, 5) + `<path d="M22 76 h36 q6 0 6 6 v6 h-48 v-6 q0 -6 6 -6z" fill="${C.yellow}"/><path d="M124 58 h18 l-3 16 h-12z" fill="${C.wood}" stroke-width="2"/>` },
  motorbike: { name: '小摩托',   type: 'floor', price: 800,  car: 2.5, ic: 'motorbike', tip: '路上快 2.5 倍', w: 140, vb: [190, 132],
    draw: () => _wh(40, 106, 20) + _wh(150, 106, 20) + `<path d="M22 96 Q22 70 52 66 H98 Q104 66 108 74 L114 90 H128 L138 40 H154 L166 100 H142 Q132 78 112 98 H68 Q58 78 40 80 Q28 82 22 96Z" fill="${C.blue}"/><path d="M48 66 h48 q6 -11 -4 -13 h-38 q-9 2 -6 13z" fill="#5B4636"/><path d="M130 40 h26" stroke-width="7"/><circle cx="160" cy="64" r="6.500" fill="${C.yellow}"/><path d="M26 92 h14" stroke="${C.red}" stroke-width="5"/>` },
  jeep:      { name: '越野车',   type: 'floor', price: 1300, car: 3.5, ic: 'jeep',      tip: '路上快 3.5 倍', w: 180, vb: [230, 140],
    draw: () => `<path d="M14 102 V60 H60 V30 H150 L168 60 H208 Q218 62 218 74 V102 Q218 108 210 108 H22 Q14 108 14 102Z" fill="#8DB574"/><path d="M70 58 V40 H104 V58Z M112 40 H144 L154 58 H112Z" fill="${C.sky}"/><path d="M108 60 V106" stroke-width="1.800"/><path d="M118 70 h12" stroke-width="3.500"/><rect x="2" y="62" width="14" height="34" rx="6" fill="#5B4636"/><circle cx="208" cy="80" r="6.500" fill="${C.yellow}"/><path d="M196 98 h22" stroke-width="5"/><path d="M64 30 V20 H146 V30" stroke-width="4"/>` + _wh(58, 108, 24) + _wh(170, 108, 24) },
  bus:       { name: '小巴士',   type: 'floor', price: 2000, car: 4.5, ic: 'bus',       tip: '路上快 4.5 倍', w: 208, vb: [280, 150],
    draw: () => `<path d="M10 118 V36 Q10 22 26 22 H236 Q262 24 268 60 V118 Q268 124 260 124 H18 Q10 124 10 118Z" fill="${C.yellow}"/><path d="M13 90 H266" stroke="#5B4636" stroke-width="5"/>` +
      [24, 62, 100, 138, 176].map(x => `<rect x="${x}" y="38" width="30" height="32" rx="5" fill="${C.sky}"/>`).join('') +
      `<rect x="216" y="38" width="30" height="78" rx="5" fill="${C.sky}"/><path d="M231 38 v78" stroke-width="1.600"/><circle cx="262" cy="104" r="5.500" fill="${C.white}" stroke-width="1.800"/><path d="M10 104 h10" stroke="${C.red}" stroke-width="5"/>` + _wh(62, 124, 22) + _wh(206, 124, 22) },
  firetruck: { name: '消防车',   type: 'floor', price: 2800, car: 5.5, ic: 'firetruck', tip: '路上快 5.5 倍', w: 208, vb: [280, 150],
    draw: () => `<rect x="198" y="20" width="16" height="14" rx="4" fill="${C.blue}"/><path d="M10 118 V60 H170 V34 H228 Q246 36 256 62 L268 86 V118 Q268 124 260 124 H18 Q10 124 10 118Z" fill="${C.red}"/><path d="M182 46 H224 Q236 48 244 68 H182Z" fill="${C.sky}"/><path d="M16 42 H166 M16 54 H166" stroke-width="3"/><path d="M30 42 v12 M50 42 v12 M70 42 v12 M90 42 v12 M110 42 v12 M130 42 v12 M150 42 v12" stroke-width="2"/><path d="M13 102 H267" stroke="#fff" stroke-width="6"/><circle cx="118" cy="80" r="13" fill="${C.yellow}"/><circle cx="118" cy="80" r="5" fill="${C.cream}" stroke-width="1.800"/><circle cx="262" cy="106" r="5.500" fill="${C.yellow}" stroke-width="1.800"/>` + _wh(62, 124, 22) + _wh(206, 124, 22) },
  train:     { name: '小火车',   type: 'floor', price: 3600, car: 6.5, ic: 'train',     tip: '路上快 6.5 倍', w: 200, vb: [272, 162],
    draw: () => `<path d="M186 64 V36 h-6 v-12 h30 v12 h-6 V64Z" fill="#5B4636"/><path d="M132 64 q0 -17 14 -17 q14 0 14 17z" fill="${C.yellow}"/><rect x="14" y="32" width="86" height="92" rx="6" fill="${C.red}"/><rect x="28" y="46" width="36" height="32" rx="5" fill="${C.sky}"/><path d="M6 30 h102" stroke-width="9"/><path d="M100 64 H216 Q238 64 238 86 V124 H100Z" fill="${C.blue}"/><path d="M118 64 v60 M196 64 v60" stroke="${C.yellow}" stroke-width="4"/><circle cx="240" cy="86" r="7.500" fill="${C.yellow}"/><path d="M236 124 L264 144 H224Z" fill="${C.gray}"/><path d="M14 124 H240" stroke-width="4"/>` + _wh(52, 132, 23) + _wh(120, 136, 18) + _wh(170, 136, 18) + _wh(214, 138, 15) + `<path d="M52 132 H170" stroke-width="5"/>` },
  heli:      { name: '直升机',   type: 'floor', price: 5000, car: 8,   ic: 'heli',      tip: '路上快 8 倍', w: 200, vb: [270, 160],
    draw: () => `<path d="M36 26 H234" stroke-width="5"/><path d="M135 26 v18" stroke-width="5"/><path d="M110 120 v18 M170 120 v18" stroke-width="4"/><path d="M82 140 H202 q9 0 11 -9" stroke-width="4.500"/><path d="M84 44 H160 Q204 46 208 86 Q206 118 160 120 H110 Q76 118 70 94 L20 80 V64 L70 68 Q74 46 84 44Z" fill="${C.orange}"/><path d="M150 54 H162 Q192 58 196 84 H150Z" fill="${C.sky}"/><path d="M74 96 H204" stroke="#fff" stroke-width="5"/><circle cx="20" cy="72" r="15" stroke-width="2"/><path d="M20 55 v34 M5 72 h30" stroke-width="3.500"/>` },
  ufo:       { name: '小飞碟',   type: 'floor', price: 8000, car: 10,  ic: 'ufo',       tip: '路上快 10 倍', w: 176, vb: [240, 150],
    draw: () => `<path d="M70 100 L52 140 M170 100 L188 140 M120 104 V140" stroke-width="4"/><path d="M40 142 h24 M176 142 h24 M108 142 h24" stroke-width="4.500"/><path d="M78 68 Q78 16 120 16 Q162 16 162 68Z" fill="${C.sky}"/><path d="M96 40 q6 -12 20 -14" stroke="#fff" stroke-width="3"/><ellipse cx="120" cy="78" rx="110" ry="27" fill="${C.purple}"/><ellipse cx="120" cy="70" rx="64" ry="12" fill="#DDD1EA" stroke-width="2"/>` +
      [[34, 82], [76, 95], [120, 99], [164, 95], [206, 82]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${C.yellow}" stroke-width="1.800"/>`).join('') },
  // 各地小铺才有的家具
  hammock:   { name: '小吊床',   type: 'floor', price: 120, w: 220, vb: [220, 132], draw: () => `<path d="M4 128 h24 M192 128 h24" stroke-width="4.500"/>` + _line2('M16 128 V20', C.wood, 6) + _line2('M204 128 V20', C.wood, 6) + `<path d="M16 34 Q110 84 204 34 Q110 142 16 34Z" fill="${C.pink}"/><path d="M62 66 q4 20 -2 34 M110 76 v36 M158 66 q-4 20 2 34" stroke="${C.cream}" stroke-width="5"/><ellipse cx="60" cy="58" rx="18" ry="8" fill="${C.white}" stroke-width="2" transform="rotate(24 60 58)"/>` },
  birdhouse: { name: '小鸟屋',   type: 'wall',  price: 60,  w: 80,  vb: [80, 100],  draw: () => `<rect x="16" y="40" width="48" height="52" fill="${C.cream}"/><path d="M6 44 L40 8 L74 44Z" fill="${C.coral}"/><circle cx="40" cy="60" r="10" fill="#5B4636"/><path d="M32 82 h16" stroke-width="4"/><circle cx="40" cy="74" r="6" fill="${C.sky}" stroke-width="1.800"/><path d="M45 73 l5 2 l-5 2z" fill="${C.orange}" stroke-width="1"/><circle cx="41.500" cy="72.500" r="1" fill="${C.line}" stroke="none"/>` },
  surfboard: { name: '冲浪板',   type: 'floor', price: 90,  w: 76,  vb: [84, 182],  draw: () => `<g transform="rotate(8 42 176)"><path d="M42 6 Q70 60 64 132 Q58 174 42 176 Q26 174 20 132 Q14 60 42 6Z" fill="${C.sky}"/><path d="M42 8 V174" stroke="${C.coral}" stroke-width="6"/><path d="M22 98 Q42 86 63 98" stroke="#fff" stroke-width="5"/><path d="M21 112 Q42 100 63 112" stroke="${C.yellow}" stroke-width="4"/></g>` },
  lifebuoy:  { name: '救生圈',   type: 'wall',  price: 55,  w: 80,  vb: [80, 86],   draw: () => `<path d="M40 2 v8"/><circle cx="40" cy="46" r="23" stroke-width="22"/><circle cx="40" cy="46" r="23" stroke="${C.white}" stroke-width="17"/><circle cx="40" cy="46" r="23" stroke="${C.red}" stroke-width="17" stroke-dasharray="18.060 18.060" stroke-linecap="butt"/>` },
  fireplace: { name: '小壁炉',   type: 'floor', price: 150, w: 150, vb: [150, 140], draw: () => `<rect x="12" y="20" width="126" height="116" fill="#D9A58F"/><path d="M12 48 h126 M12 76 h30 M108 76 h30 M12 104 h30 M108 104 h30 M40 20 v28 M76 20 v28 M110 20 v28 M26 48 v28 M124 48 v28 M26 104 v32 M124 104 v32" stroke-width="1.400"/><rect x="4" y="6" width="142" height="14" rx="3" fill="${C.wood}"/><path d="M42 136 V86 Q42 60 75 60 Q108 60 108 86 V136Z" fill="#5B4636"/><path d="M75 132 q-24 -8 -14 -32 q6 8 10 4 q-2 -16 8 -26 q2 14 12 22 q8 12 0 26 q-6 8 -16 6z" fill="${C.orange}"/><path d="M75 132 q-10 -6 -4 -18 q6 6 8 -2 q8 10 2 18z" fill="${C.yellow}" stroke-width="1.600"/><path d="M52 134 h46" stroke-width="5"/>` },
  snowman:   { name: '雪人摆件', type: 'floor', price: 80,  w: 84,  vb: [84, 132],  draw: () => `<path d="M14 86 l-11 -13 M70 86 l11 -13" stroke-width="2.600"/><circle cx="42" cy="98" r="30" fill="${C.white}"/><circle cx="42" cy="52" r="21" fill="${C.white}"/><rect x="31" y="10" width="22" height="22" fill="#5B4636"/><path d="M23 32 h38" stroke-width="5.500"/><path d="M35 48 v.100 M49 48 v.100" stroke-width="4"/><path d="M42 54 l15 4 l-15 3z" fill="${C.orange}" stroke-width="1.600"/><path d="M24 68 q18 10 36 0" stroke-width="9.500"/><path d="M24 68 q18 10 36 0" stroke="${C.red}" stroke-width="5.500"/><path d="M42 88 v.100 M42 102 v.100" stroke-width="4.500"/>` },
  cactus:    { name: '仙人掌盆栽', type: 'floor', price: 60, w: 80,  vb: [80, 132],  draw: () => `<path d="M30 72 h-10 q-8 0 -8 -8 v-12" stroke-width="12"/><path d="M30 72 h-10 q-8 0 -8 -8 v-12" stroke="${C.green}" stroke-width="7.500"/><path d="M50 62 h10 q8 0 8 -8 v-8" stroke-width="12"/><path d="M50 62 h10 q8 0 8 -8 v-8" stroke="${C.green}" stroke-width="7.500"/><path d="M29 94 V36 q0 -12 11 -12 q11 0 11 12 V94z" fill="${C.green}"/><path d="M40 36 v50" stroke="${C.dgreen}" stroke-width="1.600"/><circle cx="40" cy="20" r="6.500" fill="${C.pink}" stroke-width="1.800"/><path d="M18 94 h44 l-6 34 h-32z" fill="${C.orange}"/><path d="M16 94 h48" stroke-width="5"/>` },
  sandglass: { name: '大沙漏',   type: 'floor', price: 85,  w: 70,  vb: [70, 130],  draw: () => `<path d="M12 16 v98 M58 16 v98" stroke-width="3"/><path d="M16 16 H54 Q54 50 38 64 Q54 78 54 114 H16 Q16 78 32 64 Q16 50 16 16Z" fill="#EEF5F4"/><path d="M21 34 H49 Q45 52 35 61 Q25 52 21 34Z" fill="${C.sand}" stroke-width="1.400"/><path d="M35 62 v30" stroke="#D9BC7A" stroke-width="2"/><path d="M19 114 Q21 94 35 90 Q49 94 51 114Z" fill="${C.sand}" stroke-width="1.400"/><rect x="8" y="6" width="54" height="10" rx="3" fill="${C.wood}"/><rect x="8" y="114" width="54" height="10" rx="3" fill="${C.wood}"/>` },
  moonlamp:  { name: '月亮灯',   type: 'wall',  price: 90,  w: 84,  vb: [84, 92],   draw: () => `<path d="M34 2 v12"/><path d="M50 14 A32 32 0 1 0 72 62 A26 26 0 0 1 50 14Z" fill="${C.yellow}"/><path d="M24 44 q5 5 10 0" stroke-width="2"/><path d="M26 58 q7 5 13 0" stroke-width="1.800"/>` + _star(62, 30, 8, 3.6, C.white) },
  telescope: { name: '望远镜',   type: 'floor', price: 130, w: 110, vb: [110, 150], draw: () => `<path d="M55 80 L24 146 M55 80 L86 146 M55 80 V140" stroke-width="4.500"/><g transform="rotate(-28 55 72)"><rect x="8" y="58" width="80" height="26" rx="5" fill="${C.blue}"/><rect x="82" y="52" width="20" height="38" rx="4" fill="#6F9DB5"/><rect x="-4" y="64" width="13" height="14" rx="3" fill="#5B4636"/><path d="M30 58 v26 M58 58 v26" stroke="${C.yellow}" stroke-width="3"/></g><circle cx="55" cy="80" r="7" fill="${C.wood}"/>` },
  gacha:     { name: '扭蛋机',   type: 'floor', price: 140, w: 100, vb: [100, 160], draw: () => `<rect x="14" y="76" width="72" height="78" rx="8" fill="${C.red}"/><circle cx="50" cy="46" r="40" fill="#EEF5F4"/>` +
      [[30, 62, C.coral], [50, 68, C.yellow], [70, 62, C.blue], [40, 46, C.purple], [61, 48, C.lgreen]].map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="10" fill="${q[2]}" stroke-width="1.800"/><path d="M${q[0] - 10} ${q[1]} h20" stroke-width="1.400"/>`).join('') +
      `<path d="M22 32 q6 -13 18 -17" stroke="#fff" stroke-width="3.500"/><circle cx="50" cy="106" r="12" fill="${C.yellow}"/><path d="M42 106 h16" stroke-width="3.500"/><rect x="34" y="130" width="32" height="16" rx="3" fill="#5B4636"/>` },
  neon:      { name: '霓虹灯牌', type: 'wall',  price: 80,  w: 130, vb: [130, 84],  draw: () => `<path d="M30 10 V2 M100 10 V2"/><rect x="4" y="10" width="122" height="68" rx="10" fill="#4A4660"/><g stroke="${C.yellow}" stroke-width="4">` + _star(38, 44, 21, 9.5, 'none') + `</g><path d="M92 62 q-24 -16 -16 -30 q8 -10 16 2 q8 -12 16 -2 q8 14 -16 30z" stroke="${C.pink}" stroke-width="4"/>` }
});

/* ---------- 负一楼：车库 ---------- */
function sceneGarageSVG() {
  let bricks = '';
  for (let r = 0; r < 8; r++) { const y = 20 + r * 44; bricks += `M0 ${y} H800 `; for (let x = (r % 2) * 55 + 30; x < 800; x += 110) bricks += `M${x} ${y} v44 `; }
  let slats = '';
  for (let y = 152; y < 372; y += 30) slats += `M270 ${y} h260 `;
  return _SCENE_OPEN + G_OPEN('wob-l', 3) + `
    <rect width="800" height="372" fill="#DAD4C6" stroke="none"/>
    <path d="${bricks}" stroke="#C6BEAC" stroke-width="2"/>
    <rect width="800" height="372" fill="url(#hatch)" stroke="none"/>
    <rect x="86" y="104" width="140" height="66" rx="6" fill="${C.white}"/>
    <rect class="win-sky" x="96" y="114" width="120" height="46" stroke="none"/>
    <path class="win-hill" d="M96 160 v-10 q30 -12 60 -2 q30 -10 60 0 v12z" stroke="none"/>
    <path d="M156 114 v46" stroke="${C.white}" stroke-width="5"/><path d="M156 114 v46" stroke-width="1.600"/><rect x="96" y="114" width="120" height="46" stroke-width="1.600"/>
    <rect x="270" y="122" width="260" height="250" fill="#B8BCC0"/><path d="${slats}" stroke-width="2"/>
    <rect x="258" y="108" width="284" height="18" rx="5" fill="${C.dwood}"/><rect x="382" y="338" width="36" height="9" rx="3" fill="#5B4636"/>
    <path d="M400 0 V50"/><path d="M372 76 Q400 38 428 76Z" fill="${C.yellow}"/>
    <rect x="600" y="100" width="62" height="62" rx="9" fill="${C.blue}"/><path d="M620 148 V114 h13 q13 0 13 10 q0 10 -13 10 h-13" stroke="#fff" stroke-width="7"/>
    <rect x="572" y="246" width="130" height="11" rx="3" fill="${C.wood}"/><path d="M586 257 v16 M688 257 v16"/>
    <rect x="584" y="216" width="40" height="30" rx="4" fill="${C.red}"/><path d="M596 216 q8 -12 16 0" stroke-width="2.400"/>
    <path d="M640 246 v-24 q0 -6 6 -6 h10 q6 0 6 6 v24z" fill="${C.yellow}"/><path d="M662 226 l12 -8" stroke-width="3"/>
    <ellipse cx="80" cy="348" rx="44" ry="15" fill="#5B4636"/><ellipse cx="80" cy="322" rx="44" ry="15" fill="#5B4636"/><ellipse cx="80" cy="296" rx="44" ry="15" fill="#5B4636"/><ellipse cx="80" cy="296" rx="20" ry="6" fill="#DAD4C6" stroke-width="2"/>
    <rect y="372" width="800" height="128" fill="#C9C6BE" stroke="none"/>
    <path d="M0 372 H800" stroke-width="2.600"/>
    <path d="M168 386 L128 500 M352 386 L336 500 M528 386 L540 500 M704 400 L744 500" stroke="#fff" stroke-width="5" stroke-dasharray="16 12"/>
    <path d="M40 430 l10 3 M250 470 l12 -2 M440 420 l10 4 M610 480 l12 -3" stroke="#B5B1A6" stroke-width="2"/>
    <path d="M700 372 V350 H726 V328 H752 V306 H778 V284 H810 V372Z" fill="#C9C6BE"/>
    <path d="M704 328 L806 240" stroke-width="5"/><path d="M713 348 v-28 M739 326 v-28 M765 304 v-28 M791 282 v-28" stroke-width="2.400"/>
  </g></svg>`;
}

/* ---------- 第五批旅行目的地（20 个） ---------- */
Object.assign(DESTS, {
  vineyard:     { name: '葡萄庄园',   time: 150, souv: 'raisin',        pet: [16, 104, .42] },
  sunfield:     { name: '向日葵花海', time: 150, souv: 'seedcake',      pet: [108, 104, .42] },
  lavender:     { name: '薰衣草庄园', time: 150, souv: 'lavice',        pet: [184, 104, .42] },
  jungle:       { name: '热带雨林',   time: 240, souv: 'bananachip',    pet: [108, 104, .42] },
  pandavale:    { name: '熊猫竹谷',   time: 210, souv: 'pandabun',      pet: [150, 104, .42] },
  harbor:       { name: '渔港码头',   time: 180, souv: 'fishcake',      pet: [22, 82, .42] },
  beach:        { name: '贝壳沙滩',   time: 180, souv: 'starcookie',    pet: [140, 104, .42] },
  watertown:    { name: '水乡小桥',   time: 210, souv: 'osmanthus',     pet: [110, 30, .4] },
  piratebay:    { name: '海盗湾',     time: 270, souv: 'goldcoin',      pet: [20, 100, .42] },
  coastroad:    { name: '海滨公路',   time: 210, souv: 'clamsoup',      pet: [10, 44, .42] },
  aurora:       { name: '极光冰原',   time: 270, souv: 'aurorajelly',   pet: [108, 104, .42] },
  igloo:        { name: '冰屋村',     time: 240, souv: 'fishball',      pet: [140, 104, .42] },
  volcano:      { name: '火山口',     time: 270, souv: 'lavacake',      pet: [16, 104, .42] },
  dinovalley:   { name: '恐龙谷',     time: 270, souv: 'dinoegg',       pet: [16, 104, .42] },
  castle:       { name: '古城堡',     time: 240, souv: 'crowncookie',   pet: [16, 104, .42] },
  spacestation: { name: '太空站',     time: 300, souv: 'spaceice',      pet: [100, 100, .42] },
  rainbow:      { name: '彩虹桥',     time: 270, souv: 'rainbowcandy',  pet: [110, 17, .4] },
  zoo:          { name: '动物园',     time: 180, souv: 'animalcracker', pet: [14, 104, .42] },
  station:      { name: '小火车站',   time: 180, souv: 'railbento',     pet: [18, 104, .42] },
  nightmarket:  { name: '夜市',       time: 210, souv: 'takoyaki',      pet: [108, 104, .42] }
});
Object.assign(SOUVS, {
  raisin:        { name: '葡萄干',       ic: 'raisin',        hunger: 16, happy: 10 },
  seedcake:      { name: '瓜子酥',       ic: 'seedcake',      hunger: 22, happy: 8 },
  lavice:        { name: '薰衣草冰淇淋', ic: 'lavice',        hunger: 8,  thirst: 8, happy: 20, sweet: 1 },
  bananachip:    { name: '香蕉脆片',     ic: 'bananachip',    hunger: 20, energy: 10 },
  pandabun:      { name: '熊猫包',       ic: 'pandabun',      hunger: 30, happy: 8 },
  fishcake:      { name: '烤鱼饼',       ic: 'fishcake',      hunger: 30, energy: 6 },
  starcookie:    { name: '海星饼干',     ic: 'starcookie',    hunger: 16, happy: 14 },
  osmanthus:     { name: '桂花糕',       ic: 'osmanthus',     hunger: 20, happy: 12, sweet: 1 },
  goldcoin:      { name: '金币巧克力',   ic: 'goldcoin',      hunger: 10, happy: 22, sweet: 1 },
  clamsoup:      { name: '海鲜浓汤',     ic: 'clamsoup',      hunger: 22, thirst: 14 },
  aurorajelly:   { name: '极光果冻',     ic: 'aurorajelly',   thirst: 12, happy: 24, sweet: 1 },
  fishball:      { name: '热鱼丸',       ic: 'fishball',      hunger: 26, energy: 8 },
  lavacake:      { name: '熔岩蛋糕',     ic: 'lavacake',      hunger: 18, happy: 18, sweet: 1 },
  dinoegg:       { name: '恐龙蛋',       ic: 'dinoegg',       hunger: 24, happy: 12 },
  crowncookie:   { name: '皇冠饼干',     ic: 'crowncookie',   hunger: 18, happy: 16 },
  spaceice:      { name: '太空冰淇淋',   ic: 'spaceice',      hunger: 12, happy: 22, sweet: 1 },
  rainbowcandy:  { name: '彩虹糖',       ic: 'rainbowcandy',  hunger: 6,  happy: 26, sweet: 1 },
  animalcracker: { name: '动物饼干',     ic: 'animalcracker', hunger: 22, happy: 10 },
  railbento:     { name: '铁路便当',     ic: 'railbento',     hunger: 40 },
  takoyaki:      { name: '章鱼小丸子',   ic: 'takoyaki',      hunger: 24, happy: 12 }
});
Object.assign(CARD_BG, {
  vineyard(r) {
    const vine = (x, y) => `<path d="M${x} ${y} v-26 M${x - 14} ${y - 22} h28" stroke-width="2.200"/><path d="M${x - 14} ${y - 22} q-4 6 0 10 M${x + 14} ${y - 22} q4 6 0 10" stroke="${C.dgreen}" stroke-width="2"/>` +
      _dots([[x - 8, y - 14], [x - 3, y - 14], [x - 5.5, y - 9], [x + 6, y - 15], [x + 11, y - 15], [x + 8.5, y - 10]], 3, '#8C6BA6');
    let rows = '';
    for (let i = 0; i < 5; i++) rows += vine(130 + i * 36, 152 + (i % 2) * 6) + vine(148 + i * 36, 188 - (i % 2) * 4);
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 60 : 250}" cy="${r ? 56 : 34}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 112 Q80 82 160 106 T300 94 V200 H0Z', '#CFE0B6')}
      <rect x="196" y="72" width="52" height="40" fill="${C.cream}"/><path d="M188 74 L222 46 L256 74Z" fill="${C.coral}"/><path d="M214 112 v-18 a8 8 0 0 1 16 0 v18" fill="${C.wood}"/>
      ${_hill('M0 132 Q150 116 300 130 V200 H0Z', '#B5CE92')}${rows}
      ${r ? `<path d="M96 198 h30 l-3 -20 h-24z" fill="${C.wood}"/>` + _dots([[103, 174], [111, 172], [119, 175], [107, 167], [115, 167]], 4.200, '#8C6BA6') : ''}`;
  },
  sunfield(r) {
    const sf = (x, y, s) => `<path d="M${x} ${y} v${-26 * s}" stroke="${C.dgreen}" stroke-width="3"/><path d="M${x} ${y - 9 * s} q${-9 * s} ${-2 * s} ${-11 * s} ${-9 * s}" stroke="${C.dgreen}" stroke-width="2.400"/><circle cx="${x}" cy="${y - 32 * s}" r="${11 * s}" fill="${C.yellow}" stroke-width="1.800"/><circle cx="${x}" cy="${y - 32 * s}" r="${5 * s}" fill="${C.dwood}" stroke-width="1.200"/>`;
    let far = '';
    for (let x = 8; x < 300; x += 15) far += `<circle cx="${x}" cy="${130 + (x % 2 ? 0 : 5)}" r="5" fill="${C.yellow}" stroke-width="1.200"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 150 : 50}" cy="${r ? 70 : 34}" r="${r ? 28 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 112 Q150 90 300 108 V200 H0Z', '#CFE0B6')}
      <path d="M252 148 v-44 M234 116 h36" stroke-width="3"/><circle cx="252" cy="101" r="8.500" fill="${C.sand}"/><path d="M241 96 h22 l-11 -13z" fill="${C.coral}"/>
      ${_hill('M0 132 Q150 120 300 130 V200 H0Z', '#A9C987')}${far}
      ${sf(26, 198, 1.2)}${sf(62, 192, 1)}${sf(210, 194, 1)}${sf(244, 200, 1.3)}${sf(282, 192, 1)}
      ${r ? `<path d="M70 50 q5 -7 10 0 q5 -7 10 0 M214 40 q5 -7 10 0 q5 -7 10 0" stroke-width="2"/>` : ''}`;
  },
  lavender(r) {
    let rows = '';
    for (let i = 0; i < 7; i++) { const x = -44 + i * 58, t = v => (150 + (v - 150) * .3).toFixed(1); rows += `<path d="M${t(x)} 122 L${x} 206 L${x + 34} 206 L${t(x + 34)} 122Z" fill="${i % 2 ? '#B7A3CC' : '#9F8ABF'}" stroke-width="1.400"/>`; }
    return `<rect width="300" height="200" fill="${r ? '#F3D3C8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 226 : 250}" cy="${r ? 66 : 34}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 108 L70 70 L130 100 L200 62 L300 104 V200 H0Z', '#B9CDBE')}
      <rect y="120" width="300" height="80" fill="#C3D69B" stroke="none"/>${rows}<path d="M0 122 H300"/>
      <rect x="34" y="92" width="44" height="30" fill="${C.cream}"/><path d="M28 94 L56 72 L84 94Z" fill="${C.blue}"/><rect x="50" y="104" width="12" height="18" fill="${C.wood}" stroke-width="1.800"/>
      <path d="M104 122 q-10 -30 0 -54 q10 24 0 54z" fill="${C.dgreen}"/><path d="M122 122 q-7 -22 0 -40 q7 18 0 40z" fill="${C.dgreen}"/>
      ${r ? `<path d="M140 50 q5 -7 10 0 q5 -7 10 0 M96 34 q4 -6 8 0 q4 -6 8 0" stroke-width="2"/>` : ''}`;
  },
  jungle(r) {
    const leaf = (x, y, a, c) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0 Q-20 -30 0 -64 Q20 -30 0 0Z" fill="${c}"/><path d="M0 0 V-58" stroke-width="1.400"/></g>`;
    return `<rect width="300" height="200" fill="${r ? '#E6EDC8' : '#D9E9D2'}" stroke="none"/>
      <path d="M40 30 Q32 120 44 206 M262 30 Q270 120 256 206" stroke="${C.line}" stroke-width="17"/><path d="M40 30 Q32 120 44 206 M262 30 Q270 120 256 206" stroke="${C.dwood}" stroke-width="12"/>
      <path d="M92 40 q10 40 -4 70 M206 38 q-10 30 0 50 M150 40 q6 16 0 30" stroke="${C.dgreen}" stroke-width="3"/>
      <path d="M262 100 H186" stroke="${C.line}" stroke-width="9"/><path d="M262 100 H186" stroke="${C.dwood}" stroke-width="5"/>
      <path d="M-6 -6 H306 V40 Q268 62 236 38 Q204 64 172 36 Q140 60 108 36 Q76 62 48 38 Q20 56 -6 40Z" fill="#7FA86E"/>
      <path d="M20 22 q8 -8 16 0 M96 16 q8 -8 16 0 M180 20 q8 -8 16 0 M250 16 q8 -8 16 0" stroke="${C.dgreen}" stroke-width="2"/>
      ${r ? `<ellipse cx="206" cy="84" rx="11" ry="15" fill="#5B4636"/><ellipse cx="204" cy="82" rx="5" ry="8" fill="${C.cream}" stroke="none"/><circle cx="206" cy="66" r="9.500" fill="#5B4636"/><path d="M213 61 q22 -3 26 9 q-14 6 -26 -1z" fill="${C.orange}" stroke-width="1.600"/><circle cx="208" cy="64" r="2.800" fill="#fff" stroke="none"/><circle cx="208.500" cy="64" r="1.200" fill="${C.line}" stroke="none"/>` : ''}
      ${_hill('M0 152 Q150 136 300 150 V200 H0Z', '#8DB574')}
      ${leaf(18, 198, -30, '#6F9460')}${leaf(52, 204, 10, C.green)}${leaf(250, 204, -14, C.green)}${leaf(286, 198, 28, '#6F9460')}
      <circle cx="226" cy="172" r="7" fill="${C.coral}" stroke-width="1.800"/><circle cx="226" cy="172" r="2.400" fill="${C.yellow}" stroke="none"/><circle cx="84" cy="180" r="6" fill="${C.pink}" stroke-width="1.800"/><circle cx="84" cy="180" r="2" fill="${C.yellow}" stroke="none"/>`;
  },
  pandavale(r) {
    const bam = (x, w) => `<path d="M${x} -6 V206" stroke="${C.line}" stroke-width="${w + 3.5}"/><path d="M${x} -6 V206" stroke="#9DBB7A" stroke-width="${w}"/><path d="M${x - w / 2} 46 h${w} M${x - w / 2} 104 h${w} M${x - w / 2} 158 h${w}" stroke-width="1.600"/>`;
    const k = '#5B4636';
    const panda = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-13" cy="-35" r="6.500" fill="${k}"/><circle cx="13" cy="-35" r="6.500" fill="${k}"/><ellipse cx="0" cy="0" rx="21" ry="18" fill="${C.white}"/><ellipse cx="-15" cy="11" rx="8.500" ry="6.500" fill="${k}"/><ellipse cx="15" cy="11" rx="8.500" ry="6.500" fill="${k}"/><circle cx="0" cy="-22" r="16.500" fill="${C.white}"/><ellipse cx="-6.500" cy="-23" rx="4.200" ry="5.200" fill="${k}" stroke="none"/><ellipse cx="6.500" cy="-23" rx="4.200" ry="5.200" fill="${k}" stroke="none"/><circle cx="0" cy="-16" r="1.900" fill="${k}" stroke="none"/><path d="M13 -2 l14 -24" stroke="${C.dgreen}" stroke-width="3.500"/><ellipse cx="13" cy="-3" rx="6" ry="5" fill="${k}"/></g>`;
    return `<rect width="300" height="200" fill="${r ? '#E9F0D4' : '#DCECE6'}" stroke="none"/>
      ${_hill('M0 120 Q150 98 300 116 V200 H0Z', '#C3D69B')}
      ${bam(22, 12)}${bam(54, 8)}${bam(126, 7)}${bam(252, 12)}${bam(284, 8)}
      <path d="M28 62 q20 -10 30 4 q-18 4 -30 -4z M246 86 q-20 -10 -30 4 q18 4 30 -4z M58 120 q16 -10 26 2 q-14 5 -26 -2z M278 34 q-18 -8 -28 4 q16 4 28 -4z M130 66 q14 -8 24 2 q-12 5 -24 -2z" fill="${C.green}" stroke-width="1.600"/>
      ${_hill('M0 160 Q150 146 300 158 V200 H0Z', '#A9C987')}
      ${panda(92, 170, 1)}${r ? panda(262, 180, .62) : ''}`;
  },
  harbor(r) {
    const boat = (x, y, c) => `<path d="M${x - 26} ${y} h52 l-8 14 h-36z" fill="${c}"/><path d="M${x} ${y} v-36"/><path d="M${x + 3} ${y - 34} l20 28 h-20z" fill="${C.white}" stroke-width="1.800"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6D9B8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 150 : 56}" cy="${r ? 84 : 34}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <path d="M64 44 q6 -6 12 0 q6 -6 12 0 M112 62 q5 -5 10 0 q5 -5 10 0" stroke-width="2"/>
      <rect y="98" width="300" height="102" fill="${r ? '#8FB0C4' : '#A9CDD9'}" stroke="none"/><path d="M0 98 H300" stroke-width="1.600"/>
      <path d="M150 118 q8 -5 16 0 M222 142 q8 -5 16 0 M178 176 q8 -5 16 0 M262 106 q8 -5 16 0 M140 152 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      ${boat(198, 124, C.coral)}${boat(256, 158, C.blue)}
      <path d="M116 170 v36 M84 170 v36 M30 170 v36" stroke-width="6"/>
      <path d="M-6 152 H130 V170 H-6Z" fill="${C.wood}"/><path d="M20 152 v18 M48 152 v18 M76 152 v18 M104 152 v18" stroke-width="1.400"/>
      <path d="M124 152 v-14" stroke-width="5"/><circle cx="124" cy="136" r="5" fill="${C.red}" stroke-width="1.800"/>
      ${r ? `<rect x="92" y="134" width="28" height="18" fill="${C.sand}"/>` + _fish(104, 132, C.orange) + _fish(110, 126, C.sky) : ''}`;
  },
  beach(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6D3B0' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 210 : 250}" cy="${r ? 72 : 32}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <rect y="86" width="300" height="60" fill="${r ? '#8FB0C4' : '#A9CDD9'}" stroke="none"/><path d="M0 86 H300" stroke-width="1.600"/>
      <path d="M40 102 q8 -5 16 0 M170 98 q8 -5 16 0 M240 110 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <path d="M-6 130 q26 -10 52 0 t52 0 t52 0 t52 0 t52 0 t52 0 V206 H-6Z" fill="${C.sand}"/>
      <path d="M-6 136 q26 -10 52 0 t52 0 t52 0 t52 0 t52 0 t52 0" stroke="#fff" stroke-width="3"/>
      <path d="M62 198 L74 112"/><path d="M26 126 Q66 70 122 108 Q92 102 74 112 Q50 110 26 126Z" fill="${C.coral}"/><path d="M74 112 Q70 92 80 84 M74 112 Q54 96 46 100 M74 112 Q96 94 104 98" stroke-width="1.600"/>
      <path d="M236 188 v-26 h8 v-8 h8 v8 h10 v-16 h8 v16 h10 v-8 h8 v8 h8 v26z" fill="#E3C98F"/><path d="M258 188 v-12 a6 6 0 0 1 12 0 v12" fill="${C.dwood}" stroke-width="1.600"/><path d="M266 146 v-13 l11 4 l-11 4" fill="${C.red}" stroke-width="1.600"/>
      <g stroke-width="1.600">${_star(122, 184, 9, 4, C.coral)}</g><path d="M200 192 q-10 -14 6 -18 q16 4 6 18z" fill="${C.pink}" stroke-width="1.600"/><path d="M206 192 v-16 M206 192 l-6 -13 M206 192 l6 -13" stroke-width="1.200"/>
      ${r ? `<ellipse cx="34" cy="174" rx="10" ry="7" fill="${C.red}"/><path d="M26 170 l-6 -6 M42 170 l6 -6 M24 178 l-5 4 M44 178 l5 4" stroke-width="2"/><circle cx="18" cy="162" r="3.500" fill="${C.red}" stroke-width="1.400"/><circle cx="50" cy="162" r="3.500" fill="${C.red}" stroke-width="1.400"/><path d="M31 171 v.100 M37 171 v.100" stroke-width="2"/>` : ''}`;
  },
  watertown(r) {
    const house = (x, w, h) => `<rect x="${x}" y="${120 - h}" width="${w}" height="${h}" fill="${C.white}"/><path d="M${x - 5} ${120 - h} h${w + 10} l-7 -11 h${-(w - 4)}z" fill="#6E6A72"/><rect x="${x + w / 2 - 6}" y="${132 - h}" width="12" height="12" fill="${r ? C.yellow : '#9A8E86'}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#4A5680' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[30, 20], [90, 12], [150, 24], [216, 10], [272, 26]], 1.800, '#FFF6C9') + `<path d="M256 34 A13 13 0 1 0 270 54 A10 10 0 0 1 256 34Z" fill="#FFF6C9"/>` : `<circle cx="252" cy="30" r="14" fill="#F3D98B"/>`}
      ${house(6, 56, 50)}${house(66, 42, 64)}${house(196, 42, 60)}${house(242, 54, 46)}
      ${r ? `<circle cx="20" cy="84" r="5" fill="${C.red}" stroke-width="1.400"/><circle cx="96" cy="70" r="5" fill="${C.red}" stroke-width="1.400"/><circle cx="210" cy="74" r="5" fill="${C.red}" stroke-width="1.400"/><circle cx="282" cy="88" r="5" fill="${C.red}" stroke-width="1.400"/>` : ''}
      <rect y="120" width="300" height="80" fill="${r ? '#6E86A6' : '#A9CDD9'}" stroke="none"/><path d="M0 120 H300" stroke-width="1.600"/>
      <path d="M38 152 Q150 58 262 152 H228 Q150 98 72 152Z" fill="#D8D2C2"/><path d="M58 136 Q150 66 242 136" stroke-width="1.600"/>
      <path d="M20 168 q8 -5 16 0 M96 182 q8 -5 16 0 M262 176 q8 -5 16 0 M130 160 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <path d="M178 174 h72 l-10 14 h-52z" fill="${C.wood}"/><path d="M198 174 q15 -20 32 0" fill="#6E6A72" stroke-width="1.800"/>`;
  },
  piratebay(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6D3B0' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 120 : 110}" cy="${r ? 80 : 34}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <rect y="102" width="300" height="98" fill="${r ? '#8FB0C4' : '#A9CDD9'}" stroke="none"/><path d="M0 102 H300" stroke-width="1.600"/>
      <path d="M150 170 q8 -5 16 0 M250 178 q8 -5 16 0 M190 190 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <path d="M222 132 V50 M192 132 V78"/>
      <path d="M226 58 h36 q9 26 0 54 h-36 q9 -28 0 -54z" fill="${C.cream}"/><path d="M160 84 h30 q7 18 0 36 h-30 q7 -18 0 -36z" fill="${C.cream}"/>
      <path d="M222 50 h-22 v-15 h22z" fill="#5B4636"/><path d="M204 38 l14 9 M218 38 l-14 9" stroke="#fff" stroke-width="2"/>
      <path d="M168 132 h102 l-12 28 h-76z" fill="${C.dwood}"/><path d="M176 143 h86" stroke-width="1.600"/>${_dots([[196, 151], [218, 151], [240, 151]], 2.600, '#5B4636')}
      <path d="M-6 206 V152 Q60 130 132 162 Q152 188 142 206Z" fill="${C.sand}"/>
      <path d="M12 160 q-6 -40 8 -72" stroke="${C.line}" stroke-width="9"/><path d="M12 160 q-6 -40 8 -72" stroke="${C.dwood}" stroke-width="5"/>
      <path d="M20 88 q-22 -10 -32 5 q18 -5 32 -5z M20 88 q-8 -20 -27 -17 q15 5 27 17z M20 88 q18 -12 30 2 q-17 -4 -30 -2z M20 88 q10 -18 26 -14 q-14 4 -26 14z" fill="${C.green}" stroke-width="1.800"/>
      <rect x="104" y="170" width="34" height="22" fill="${C.wood}"/><path d="M104 170 q17 -17 34 0z" fill="${C.dwood}"/><rect x="118" y="172" width="6" height="9" fill="${C.yellow}" stroke-width="1.400"/>
      ${r ? _burst(121, 150, C.yellow, .6) + `<circle cx="96" cy="194" r="4" fill="${C.yellow}" stroke-width="1.400"/><circle cx="146" cy="196" r="4" fill="${C.yellow}" stroke-width="1.400"/>` : ''}`;
  },
  coastroad(r) {
    const road = 'M-10 134 Q70 126 112 150 Q142 170 148 210';
    return `<rect width="300" height="200" fill="${r ? '#F6D3B0' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 226 : 250}" cy="${r ? 74 : 34}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <path d="M150 40 q6 -6 12 0 q6 -6 12 0 M196 58 q5 -5 10 0 q5 -5 10 0" stroke-width="2"/>
      <rect y="92" width="300" height="108" fill="${r ? '#8FB0C4' : '#A9CDD9'}" stroke="none"/><path d="M0 92 H300" stroke-width="1.600"/>
      <path d="M196 114 q8 -5 16 0 M244 136 q8 -5 16 0 M218 164 q8 -5 16 0 M262 184 q8 -5 16 0 M176 136 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <path d="M236 110 h30 l-5 9 h-20z" fill="${C.coral}" stroke-width="1.800"/><path d="M251 110 v-24 l13 20z" fill="${C.white}" stroke-width="1.800"/>
      <path d="M-6 206 V84 Q50 78 98 98 Q152 120 178 152 Q198 182 192 206Z" fill="#C3D69B"/>
      <path d="${road}" stroke="${C.line}" stroke-width="35"/><path d="${road}" stroke="#A8A296" stroke-width="30"/><path d="${road}" stroke="#fff" stroke-width="2.400" stroke-dasharray="10 9"/>
      <path d="M96 152 q0 -9 10 -10 l7 -8 h16 l7 8 q11 1 11 10z" fill="${C.red}" stroke-width="2"/><circle cx="108" cy="153" r="5.500" fill="#5B4636" stroke-width="1.600"/><circle cx="134" cy="153" r="5.500" fill="#5B4636" stroke-width="1.600"/>
      <path d="M168 196 v-22" stroke-width="3"/><path d="M158 160 h22 l6 7 l-6 7 h-22z" fill="${C.cream}" stroke-width="1.800"/>
      ${r ? `<path d="M36 186 l-3 -8 M36 186 l0 -10 M36 186 l3 -8 M70 196 l-3 -8 M70 196 l0 -10 M70 196 l3 -8" stroke="${C.dgreen}" stroke-width="2"/><circle cx="52" cy="182" r="5" fill="${C.pink}" stroke-width="1.600"/><circle cx="20" cy="194" r="5" fill="${C.yellow}" stroke-width="1.600"/>` : ''}`;
  }
});
Object.assign(CARD_BG, {
  aurora(r) {
    const band = (d, c, w) => `<path d="${d}" stroke="${c}" stroke-width="${w}" opacity=".55"/>`;
    const pine = (x, y, s) => `<path d="M${x} ${y} v${6 * s}" stroke-width="3"/><path d="M${x - 12 * s} ${y} L${x} ${y - 32 * s} L${x + 12 * s} ${y}Z" fill="#5E8478"/><path d="M${x - 5 * s} ${y - 18 * s} L${x} ${y - 32 * s} L${x + 5 * s} ${y - 18 * s}" fill="#fff" stroke-width="1.400"/>`;
    return `<rect width="300" height="200" fill="#2E3A66" stroke="none"/>
      ${_dots([[20, 16], [64, 34], [110, 10], [160, 20], [214, 12], [268, 26], [286, 70], [14, 80]], 1.800, '#FFF6C9')}
      ${band('M-10 76 Q60 26 120 66 T240 46 T320 66', '#9BE0B8', 16)}${band('M-10 100 Q70 56 140 90 T320 78', '#B7A3CC', 12)}${r ? band('M-10 50 Q80 4 150 38 T320 24', '#8FD0E0', 12) : ''}
      ${r ? `<path d="M226 20 l34 -12" stroke="#FFF6C9" stroke-width="2.400"/><g stroke-width="1.400">${_star(224, 21, 6, 2.6, '#FFF6C9')}</g>` : ''}
      ${_hill('M0 134 L50 100 L96 130 L150 92 L210 128 L260 102 L300 124 V200 H0Z', '#56628C')}
      <path d="M40 108 L50 100 L60 107 M138 101 L150 92 L162 100 M250 108 L260 102 L270 108" stroke="#fff" stroke-width="3"/>
      ${_hill('M0 152 Q150 136 300 150 V200 H0Z', C.white)}
      ${pine(34, 170, 1.1)}${pine(66, 182, .8)}${pine(246, 176, 1)}${pine(278, 166, 1.2)}
      <path d="M100 186 q10 -4 20 0 M200 190 q10 -4 20 0" stroke="#C9D8E6" stroke-width="2"/>`;
  },
  igloo(r) {
    const ig = (x, y, s) => `<path d="M${x - 36 * s} ${y} a${36 * s} ${34 * s} 0 0 1 ${72 * s} 0z" fill="${C.white}"/><path d="M${x - 31 * s} ${y - 15 * s} h${62 * s} M${x - 19 * s} ${y - 28 * s} h${38 * s} M${x} ${y - 34 * s} v${6 * s} M${x - 13 * s} ${y - 28 * s} v${13 * s} M${x + 13 * s} ${y - 28 * s} v${13 * s} M${x - 25 * s} ${y - 15 * s} v${15 * s} M${x + 25 * s} ${y - 15 * s} v${15 * s}" stroke-width="1.400"/><path d="M${x - 10 * s} ${y} v${-12 * s} a${10 * s} ${10 * s} 0 0 1 ${20 * s} 0 v${12 * s}z" fill="${r ? C.yellow : '#6E86A6'}"/>`;
    return `<rect width="300" height="200" fill="${r ? '#4A5680' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[24, 20], [84, 14], [150, 28], [210, 12], [276, 30]], 1.800, '#FFF6C9') + `<path d="M246 34 A13 13 0 1 0 260 54 A10 10 0 0 1 246 34Z" fill="#FFF6C9"/>` : `<circle cx="250" cy="32" r="14" fill="#F3D98B"/>`}
      ${_hill('M0 112 L60 72 L110 106 L170 62 L240 102 L300 82 V200 H0Z', r ? '#7C88B0' : '#C9D8E6')}
      <path d="M48 80 L60 72 L72 80 M156 72 L170 62 L184 72" stroke="#fff" stroke-width="3"/>
      ${_hill('M0 134 Q150 118 300 132 V200 H0Z', C.white)}
      ${ig(70, 156, 1)}${ig(256, 146, .78)}
      ${r ? `<path d="M70 118 q-5 -6 0 -12 q5 -6 0 -12" stroke="#fff" stroke-width="2.400" opacity=".8"/>` : ''}
      <ellipse cx="258" cy="184" rx="22" ry="7.500" fill="#8FB7CC"/><path d="M226 178 L262 150 V182" stroke-width="1.800"/><path d="M222 180 l8 -4" stroke-width="4"/>
      <path d="M20 184 q10 -4 20 0 M120 192 q10 -4 20 0" stroke="#C9D8E6" stroke-width="2"/>`;
  },
  volcano(r) {
    return `<rect width="300" height="200" fill="${r ? '#4A4660' : '#F6E9C8'}" stroke="none"/>
      ${r ? _dots([[20, 24], [60, 50], [110, 20], [282, 92], [134, 60]], 1.800, '#FFF6C9') + _burst(209, 30, C.orange, 1.1) + _dots([[186, 20], [232, 16], [170, 44], [248, 40], [209, 6]], 3, C.red)
        : `<circle cx="50" cy="36" r="15" fill="#F3D98B"/><path d="M190 42 a11 11 0 0 1 3 -22 a15 15 0 0 1 29 0 a11 11 0 0 1 2 22z" fill="${C.white}"/>`}
      <path d="M92 154 L184 56 H234 L306 136 V154Z" fill="#A87F6A"/>
      <path d="M184 56 q6 14 13 4 q6 16 12 2 q7 14 13 0 q6 10 12 -6z" fill="${C.orange}"/>
      <path d="M204 70 q-6 28 6 46 q8 14 2 34" stroke-width="10"/><path d="M204 70 q-6 28 6 46 q8 14 2 34" stroke="${C.orange}" stroke-width="6"/>
      <path d="M150 112 l10 8 M252 102 l-8 10 M130 138 l12 4" stroke-width="1.600"/>
      ${_hill('M0 144 Q150 130 300 142 V200 H0Z', '#C99A7A')}
      <path d="M120 192 l10 -17 l17 4 l8 13z" fill="#8C7B6C"/><path d="M246 198 l8 -14 l14 2 l10 12z" fill="#8C7B6C"/><path d="M176 182 l6 -9 l10 3 l3 6z" fill="#8C7B6C" stroke-width="1.800"/>`;
  },
  dinovalley(r) {
    const fern = (x, y) => `<path d="M${x} ${y} q-14 -10 -18 -26 M${x} ${y} q0 -16 2 -30 M${x} ${y} q14 -10 18 -24" stroke="${C.dgreen}" stroke-width="3"/>`;
    const g = '#9DBB7A';
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#E4EFD8'}" stroke="none"/>
      <circle cx="${r ? 60 : 44}" cy="${r ? 50 : 34}" r="${r ? 22 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${r ? `<path d="M104 34 l16 8 l16 -8 l-11 15 l6 9 l-11 -5 l-11 5 l6 -9z" fill="${C.dwood}" stroke-width="1.600"/>` : ''}
      ${_hill('M0 126 L36 98 L84 122 L124 102 L170 124 H300 V200 H0Z', '#C9B79A')}
      ${_hill('M0 146 Q150 130 300 144 V200 H0Z', '#B5CE92')}
      <path d="M266 138 Q292 134 302 112 Q302 148 270 158Z" fill="${g}"/>
      <rect x="190" y="152" width="13" height="36" rx="5" fill="#8DB574"/><rect x="246" y="152" width="13" height="36" rx="5" fill="#8DB574"/>
      <ellipse cx="226" cy="144" rx="46" ry="25" fill="${g}"/>
      <rect x="206" y="156" width="13" height="36" rx="5" fill="${g}"/><rect x="232" y="156" width="13" height="36" rx="5" fill="${g}"/>
      <path d="M186 140 Q174 102 176 66 Q158 64 156 51 Q160 38 181 40 Q198 42 198 66 Q198 106 216 126Z" fill="${g}"/>
      <circle cx="170" cy="50" r="1.800" fill="${C.line}" stroke="none"/><path d="M160 57 q6 4 12 1" stroke-width="1.600"/>
      ${_dots([[214, 138], [232, 132], [250, 140], [238, 152], [188, 98], [190, 78]], 3.500, '#7FAE6E')}
      ${fern(118, 198)}${fern(286, 200)}
      ${r ? `<ellipse cx="140" cy="188" rx="21" ry="7" fill="${C.dwood}"/><ellipse cx="132" cy="180" rx="6.500" ry="8.500" fill="${C.cream}" stroke-width="1.600"/><ellipse cx="147" cy="180" rx="6.500" ry="8.500" fill="${C.cream}" stroke-width="1.600"/>` : ''}`;
  },
  castle(r) {
    const tower = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#E9E0CF"/><path d="M${x - 5} ${y} L${x + w / 2} ${y - w * 1.1} L${x + w + 5} ${y}Z" fill="${c}"/><rect x="${x + w / 2 - 3.5}" y="${y + 10}" width="7" height="11" rx="3.500" fill="#6E86A6" stroke-width="1.400"/>`;
    return `<rect width="300" height="200" fill="${r ? '#3E4A7A' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[20, 20], [70, 40], [120, 14], [282, 30], [136, 60]], 1.800, '#FFF6C9') + _burst(60, 66, C.coral, .9) + _burst(112, 40, C.yellow, .7) + _burst(280, 56, C.pink, .6)
        : `<circle cx="56" cy="36" r="15" fill="#F3D98B"/><path d="M96 58 a8 8 0 0 1 2 -16 a11 11 0 0 1 21 -1 a8.500 8.500 0 0 1 1 17z" fill="#fff"/>`}
      ${_hill('M0 134 Q90 98 190 106 Q260 106 300 124 V200 H0Z', '#C3D69B')}
      <path d="M156 94 v-8 h10 v8 M176 94 v-8 h10 v8 M226 94 v-8 h10 v8" fill="#E9E0CF" stroke-width="1.800"/><rect x="156" y="94" width="100" height="50" fill="#E9E0CF"/>
      ${tower(142, 74, 26, 70, C.purple)}${tower(244, 74, 26, 70, C.purple)}${tower(191, 50, 30, 62, C.coral)}
      <path d="M206 17 v-13 l11 4.500 l-11 4.500" fill="${C.yellow}" stroke-width="1.600"/>
      <path d="M195 144 v-20 a11 11 0 0 1 22 0 v20z" fill="${C.dwood}"/>
      ${_hill('M0 154 Q150 140 300 152 V200 H0Z', '#A9C987')}
      <path d="M206 146 Q204 174 164 206" stroke="#EADFBE" stroke-width="15"/>`;
  },
  spacestation(r) {
    return `<rect width="300" height="200" fill="#2B3560" stroke="none"/>
      ${_dots([[20, 20], [60, 50], [100, 16], [150, 34], [210, 14], [270, 24], [286, 110], [240, 126], [30, 100], [130, 86], [196, 174], [280, 164]], 1.800, '#FFF6C9')}
      <circle cx="40" cy="236" r="112" fill="#8FB7CC"/><path d="M-6 152 q26 -16 50 2 q-2 26 -30 24 q-14 -2 -20 -10z M70 170 q28 -18 52 6 q-6 26 -34 22z" fill="#9DBB7A" stroke-width="1.600"/>
      ${r ? `<circle cx="64" cy="50" r="17" fill="${C.yellow}"/><ellipse cx="64" cy="50" rx="30" ry="7" stroke="${C.orange}" stroke-width="3.500" transform="rotate(-18 64 50)"/>` + _burst(250, 150, '#FFF6C9', .5) : ''}
      <path d="M178 66 H148 M250 66 H270" stroke-width="3"/>
      <rect x="118" y="46" width="30" height="40" fill="${C.blue}"/><path d="M128 46 v40 M138 46 v40 M118 66 h30" stroke-width="1.200"/>
      <rect x="270" y="46" width="30" height="40" fill="${C.blue}"/><path d="M280 46 v40 M290 46 v40 M270 66 h30" stroke-width="1.200"/>
      <path d="M214 30 v-12"/><circle cx="214" cy="15" r="3.500" fill="${C.red}"/>
      <rect x="202" y="30" width="24" height="72" rx="9" fill="#D8D2C2"/>
      <rect x="176" y="52" width="76" height="28" rx="13" fill="#EEEAE0"/>
      <circle cx="194" cy="66" r="6" fill="${C.yellow}" stroke-width="1.600"/><circle cx="214" cy="66" r="6" fill="${C.yellow}" stroke-width="1.600"/><circle cx="234" cy="66" r="6" fill="${C.yellow}" stroke-width="1.600"/>`;
  },
  rainbow(r) {
    const cl = (x, y, s) => `<path d="M${x} ${y} a${8 * s} ${8 * s} 0 0 1 ${2 * s} -${16 * s} a${11 * s} ${11 * s} 0 0 1 ${21 * s} -${s} a${8.5 * s} ${8.5 * s} 0 0 1 ${s} ${17 * s}z" fill="#fff"/>`;
    const arc = (rad, c) => `<path d="M${150 - rad} 196 A${rad} ${rad} 0 0 1 ${150 + rad} 196" stroke="${c}" stroke-width="13"/>`;
    return `<rect width="300" height="200" fill="${r ? '#EDE4F5' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 40 : 262}" cy="34" r="${r ? 20 : 15}" fill="${r ? C.yellow : '#F3D98B'}"/>
      ${r ? _dots([[90, 20], [130, 44], [200, 24], [240, 60], [60, 76], [270, 104]], 2.200, C.yellow) + _burst(214, 50, C.pink, .5) + _burst(84, 46, C.yellow, .5) : cl(20, 64, 1.2) + cl(226, 88, 1)}
      <path d="M52 196 A98 98 0 0 1 248 196" stroke-width="17"/>
      ${arc(98, C.coral)}${arc(86, C.yellow)}${arc(74, C.lgreen)}${arc(62, C.blue)}
      <path d="M94.500 196 A55.500 55.500 0 0 1 205.500 196" stroke-width="2.400"/>
      ${cl(-6, 202, 2.4)}${cl(214, 204, 2.6)}${cl(112, 206, 1.6)}`;
  },
  zoo(r) {
    const bal = (x, y, c) => `<path d="M${x} ${y + 11} q-4 12 2 24" stroke-width="1.400"/><ellipse cx="${x}" cy="${y}" rx="9" ry="11" fill="${c}" stroke-width="1.800"/>`;
    const e = '#B8BCC0';
    return `<rect width="300" height="200" fill="#DCECE6" stroke="none"/><circle cx="40" cy="34" r="15" fill="#F3D98B"/>
      ${_hill('M0 122 Q150 102 300 118 V200 H0Z', '#CFE0B6')}
      <path d="M238 152 L246 80 h12 L262 152Z" fill="${C.yellow}"/><path d="M252 70 v-8 M259 70 v-8" stroke-width="2"/><path d="M244 82 q2 -14 16 -12 q10 2 10 10 q-10 6 -26 2z" fill="${C.yellow}"/>
      ${_dots([[250, 102], [254, 120], [248, 136], [256, 142]], 3.200, C.dwood)}<circle cx="262" cy="77" r="1.500" fill="${C.line}" stroke="none"/>
      <rect x="106" y="86" width="14" height="72" fill="${C.wood}"/><rect x="186" y="86" width="14" height="72" fill="${C.wood}"/>
      <path d="M98 92 Q153 46 208 92 V108 Q153 66 98 108Z" fill="${C.coral}"/>
      <circle cx="153" cy="82" r="5" fill="${C.cream}" stroke-width="1.400"/>${_dots([[145, 73], [153, 70], [161, 73]], 2.400, C.cream)}
      <path d="M200 132 H300 M200 148 H300" stroke-width="2"/><path d="M214 124 v32 M232 124 v32 M270 124 v32 M288 124 v32" stroke-width="3"/>
      ${_hill('M0 154 Q150 142 300 152 V200 H0Z', '#A9C987')}
      ${bal(113, 54, C.blue)}${bal(193, 52, C.pink)}${r ? bal(124, 40, C.yellow) + bal(182, 38, C.lgreen) : ''}
      ${r ? `<rect x="222" y="184" width="10" height="13" rx="3" fill="${e}" stroke-width="1.800"/><rect x="246" y="184" width="10" height="13" rx="3" fill="${e}" stroke-width="1.800"/><ellipse cx="240" cy="176" rx="26" ry="16" fill="${e}"/><circle cx="266" cy="168" r="13" fill="${e}"/><ellipse cx="258" cy="166" rx="7" ry="10" fill="#A4A8AC" stroke-width="1.600"/>` + _line2('M275 172 q9 6 5 20', e, 5) + `<circle cx="270" cy="165" r="1.500" fill="${C.line}" stroke="none"/>` : ''}`;
  },
  station(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 252 : 244}" cy="${r ? 56 : 30}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 114 Q150 94 300 110 V200 H0Z', '#CFE0B6')}
      <rect x="10" y="76" width="92" height="54" fill="${C.cream}"/><path d="M2 78 L56 46 L110 78Z" fill="${C.coral}"/><circle cx="56" cy="66" r="8" fill="#fff" stroke-width="1.600"/><path d="M56 66 v-5 M56 66 l4 2" stroke-width="1.400"/>
      <rect x="22" y="92" width="20" height="18" fill="${C.sky}" stroke-width="1.600"/><rect x="68" y="92" width="20" height="18" fill="${C.sky}" stroke-width="1.600"/>
      ${_hill('M-6 130 H306 V206 H-6Z', '#B5CE92')}
      <path d="M112 164 v18 M134 164 v18 M156 164 v18 M178 164 v18 M200 164 v18 M222 164 v18 M244 164 v18 M266 164 v18 M288 164 v18" stroke="${C.dwood}" stroke-width="3"/><path d="M100 168 H306 M100 178 H306" stroke-width="2"/>
      <path d="M152 86 a8 8 0 0 1 2 -16 a11 11 0 0 1 20 0 a8 8 0 0 1 0 16z" fill="#fff" stroke-width="1.600"/>${r ? `<path d="M186 62 a6 6 0 0 1 2 -12 a8 8 0 0 1 15 0 a6 6 0 0 1 0 12z" fill="#fff" stroke-width="1.600"/>` : ''}
      <path d="M150 124 v-22 h-4 v-8 h20 v8 h-4 v22z" fill="#5B4636"/>
      <path d="M136 124 H200 V162 H136 Q128 162 128 152 V134 Q128 124 136 124Z" fill="${C.red}"/>
      <rect x="196" y="102" width="40" height="60" rx="4" fill="${C.red}"/><rect x="204" y="110" width="24" height="20" rx="3" fill="${C.sky}" stroke-width="1.600"/><path d="M190 102 h52" stroke-width="5"/>
      <circle cx="129" cy="138" r="5" fill="${C.yellow}" stroke-width="1.600"/>
      <path d="M236 152 h8" stroke-width="3"/><rect x="244" y="112" width="62" height="50" rx="4" fill="${C.blue}"/><rect x="252" y="120" width="18" height="16" rx="3" fill="${C.sky}" stroke-width="1.600"/><rect x="276" y="120" width="18" height="16" rx="3" fill="${C.sky}" stroke-width="1.600"/>
      ${_wh(146, 166, 9)}${_wh(170, 166, 9)}${_wh(216, 166, 11)}${_wh(260, 166, 9)}${_wh(288, 166, 9)}`;
  },
  nightmarket(r) {
    const stall = (x, c) => `<rect x="${x}" y="110" width="76" height="48" fill="${C.wood}"/><path d="M${x - 6} 110 h88 l-8 -26 h-72z" fill="${c}"/><path d="M${x + 14} 86 l-4 22 M${x + 38} 86 v22 M${x + 62} 86 l4 22" stroke="#fff" stroke-width="5" opacity=".8"/><rect x="${x + 8}" y="118" width="60" height="16" fill="${C.cream}" stroke-width="1.600"/>` + _dots([[x + 20, 126], [x + 32, 126], [x + 44, 126], [x + 56, 126]], 4, C.orange);
    let lan = '';
    for (let i = 0; i < 7; i++) { const t = (i + .5) / 7, x = 300 * t, y = 30 + 88 * t * (1 - t); lan += `<ellipse cx="${x.toFixed(1)}" cy="${(y + 9).toFixed(1)}" rx="7" ry="9" fill="${i % 2 ? C.yellow : C.red}" stroke-width="1.600"/>`; }
    return `<rect width="300" height="200" fill="#3E4A7A" stroke="none"/>
      ${_dots([[24, 16], [80, 10], [140, 18], [262, 14], [290, 60], [10, 64]], 1.800, '#FFF6C9')}
      ${r ? _burst(70, 76, C.coral, .8) + _burst(230, 74, C.yellow, .8) + _burst(150, 84, C.pink, .6) : `<path d="M196 6 A12 12 0 1 0 208 26 A10 10 0 0 1 196 6Z" fill="#FFF6C9"/>`}
      <path d="M0 30 Q150 74 300 30" stroke-width="1.600"/>${lan}
      ${stall(4, C.coral)}${stall(220, C.blue)}
      <path d="M30 78 q-4 -5 0 -10 M52 80 q-4 -5 0 -10 M250 78 q-4 -5 0 -10 M272 80 q-4 -5 0 -10" stroke="#fff" stroke-width="1.800" opacity=".8"/>
      <rect y="158" width="300" height="42" fill="#6E6A8C" stroke="none"/><path d="M0 158 H300"/>
      <path d="M40 176 h30 M150 186 h34 M240 174 h30" stroke="#8C88A8" stroke-width="2"/>`;
  }
});

/* ---------- 旅行地图 ----------
 * 每个地方在地图上的位置，以及圆点的颜色（g 草木、b 水、w 冰雪、y 沙、p 奇幻、t 热闹的地方）。
 * 圆点的颜色也决定了住在那里时，小铺里卖哪一类本地货 */
const MAP_W = 1040, MAP_H = 850;
const MAP_HOME = [410, 302], MAP_FRIEND = [466, 352];
const MAP_AT = {
  cloud: [86, 70, 'p'], penguin: [232, 60, 'w'], snow: [362, 98, 'w'], camp: [488, 106, 'w'], aurora: [606, 52, 'w'], moon: [724, 70, 'p'], spacestation: [860, 64, 'p'], rainbow: [972, 64, 'p'],
  candy: [80, 158, 'p'], waterfall: [190, 160, 'b'], bamboo: [300, 164, 'g'], cave: [410, 172, 'p'], teahill: [520, 174, 'g'], sea: [636, 160, 'b'], igloo: [880, 150, 'w'],
  mushwood: [80, 236, 'g'], spring: [190, 238, 'b'], sakura: [300, 238, 'g'], flower: [410, 240, 'g'], town: [520, 242, 't'], island: [716, 238, 'b'], zoo: [850, 236, 't'], station: [960, 240, 't'],
  maple: [80, 314, 'g'], orchard: [190, 316, 'g'], rice: [300, 316, 'g'], ferris: [524, 318, 't'], ocean: [652, 324, 'b'], beach: [760, 330, 'b'], nightmarket: [856, 318, 't'], castle: [962, 322, 'p'],
  canyon: [80, 394, 'y'], farm: [190, 394, 'g'], meadow: [300, 394, 'g'], lake: [410, 398, 'b'], track: [524, 396, 't'], harbor: [632, 410, 'b'], piratebay: [748, 436, 'b'], watertown: [866, 402, 'b'],
  desert: [124, 468, 'y'], pyramid: [250, 470, 'y'], safari: [386, 470, 'y'],
  sunfield: [110, 556, 'g'], vineyard: [226, 560, 'g'], lavender: [342, 556, 'g'], pandavale: [458, 560, 'g'], coastroad: [580, 548, 'b'],
  jungle: [150, 636, 'g'], dinovalley: [280, 640, 'y'], volcano: [410, 636, 'y'],
  circus: [504, 472, 't'], beefarm: [596, 478, 'g'], treehouse: [522, 628, 'g'], clocktower: [960, 404, 't'], coral: [700, 536, 'b'], whale: [846, 520, 'b'],
  flamingo: [760, 620, 'b'], toyisland: [900, 596, 'p'], glacier: [986, 150, 'w'], floatisle: [778, 152, 'p'],
  berryfarm: [120, 736, 'g'], kitehill: [250, 736, 'g'], bazaar: [380, 740, 'y'], bigcity: [510, 736, 't'], fireworks: [640, 740, 't'], aquarium: [790, 736, 'b'], pearlbay: [920, 740, 'b'],
  skiresort: [200, 806, 'w'], observatory: [330, 806, 'p'], magicschool: [460, 806, 'p']
};
const MAP_COL = { g: '#9DBB7A', b: '#8FB7CC', w: '#FFFDF6', y: '#EBC66B', p: '#B7A3CC', t: '#E08A70' };
/* 从家（from，不写就是老家）到某个地方的那条弯弯的路；u 从 0（家）到 1（目的地），返回路上的那个点 */
function mapRoute(to, from) {
  const a = from || MAP_HOME, b = to, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const c = [mx - dy * .18, my + dx * .18];
  return {
    d: `M${a[0]} ${a[1]} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${b[0]} ${b[1]}`,
    at: u => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]
  };
}
/* seen(id) 去过没有；cur 是现在正去的地方（没去过也把名字写出来）；friend 表示要不要画栗子家；home 是现在住在哪个地方（没搬过家就不写）。
 * 每个地方都包在 data-spot 里，点一下可以看看那里 */
function mapSVG(seen, cur, friend, home) {
  const label = (x, y, t, dim) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="13" font-weight="bold" fill="${C.line}" stroke="#F8F2DF" stroke-width="3.500" paint-order="stroke" stroke-linejoin="round"${dim ? ' opacity=".55"' : ''}>${t}</text>`;
  const house = (x, y, c) => `<path d="M${x - 13} ${y + 8} v-13 h26 v13z" fill="${C.cream}"/><path d="M${x - 18} ${y - 4} L${x} ${y - 19} L${x + 18} ${y - 4}Z" fill="${c}"/><path d="M${x - 4} ${y + 8} v-8 h8 v8" fill="${C.wood}" stroke-width="1.800"/>`;
  const spot = (id, x, y, inner) => `<g class="spot" data-spot="${id}"><circle cx="${x}" cy="${y}" r="26" fill="none" stroke="none" pointer-events="all"/>${inner}</g>`;
  const tree = pts => pts.map(p => `M${p[0]} ${p[1]} l0 -9 M${p[0] - 4} ${p[1] - 2} q4 -12 8 0`).join(' ');
  let nodes = '', texts = '';
  for (const id in MAP_AT) {
    const p = MAP_AT[id], ok = seen(id) || id === cur || id === home;
    nodes += spot(id, p[0], p[1], id === home ? house(p[0], p[1], C.coral)
      : ok ? `<circle cx="${p[0]}" cy="${p[1]}" r="${id === cur ? 10.5 : 8.5}" fill="${MAP_COL[p[2]]}"/><circle cx="${p[0]}" cy="${p[1]}" r="2.600" fill="${C.line}" stroke="none"/>`
      : `<circle cx="${p[0]}" cy="${p[1]}" r="7.500" fill="#EFE8D4" stroke-width="1.800" stroke-dasharray="3 3"/>`);
    texts += label(p[0], p[1] + (id === home ? 26 : 25), ok ? (id === home ? '家·' : '') + DESTS[id].name : '？', !ok);
  }
  const hx = MAP_HOME[0], hy = MAP_HOME[1];
  nodes += spot('home', hx, hy, home ? `<circle cx="${hx}" cy="${hy}" r="10" fill="${C.lgreen}"/><circle cx="${hx}" cy="${hy}" r="3.600" fill="${C.pink}" stroke-width="1.400"/>` : house(hx, hy, C.coral));
  texts += label(hx, hy + 26, home ? '小花园' : '家');
  return `<svg class="map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAP_W} ${MAP_H}">${G_OPEN('wob-m', 2.4)}
    <rect width="${MAP_W}" height="${MAP_H}" fill="${C.sky}" stroke="none"/>
    <path d="M680 470 q9 -6 18 0 M720 390 q9 -6 18 0 M650 250 q9 -6 18 0 M120 34 q9 -6 18 0 M690 300 q9 -6 18 0 M800 566 q9 -6 18 0 M900 500 q9 -6 18 0 M950 560 q9 -6 18 0 M690 620 q9 -6 18 0 M860 640 q9 -6 18 0 M790 484 q9 -6 18 0 M990 150 q9 -6 18 0 M776 196 q9 -6 18 0 M1000 480 q9 -6 18 0" stroke="#fff" stroke-width="2.400"/>
    <path d="M40 152 Q28 112 90 112 Q170 98 250 102 Q300 62 370 54 Q450 46 520 72 Q572 92 590 132 Q640 122 666 150 Q672 178 622 192 Q590 232 592 292 Q606 362 618 428 Q640 510 606 584 Q570 652 440 664 Q300 678 150 664 Q52 650 30 560 Q14 480 36 422 Q18 300 40 152Z" fill="#CFE0B6"/>
    <path d="M812 262 Q800 204 862 196 Q950 180 1012 206 Q1040 250 1030 330 Q1034 420 962 444 Q880 462 828 436 Q796 384 812 262Z" fill="#CFE0B6"/>
    <path d="M70 762 Q58 712 150 704 Q300 690 460 700 Q610 694 690 718 Q722 772 660 814 Q560 842 400 838 Q220 846 112 826 Q62 804 70 762Z" fill="#CFE0B6"/>
    <path d="M122 802 Q150 774 222 780 Q270 792 262 818 Q200 838 132 824Z" fill="#F7F8F2" stroke="none"/><path d="M318 732 Q380 708 440 730 Q452 756 400 768 Q332 768 318 732Z" fill="#EBD9A6" stroke="none"/>
    <path d="${tree([[300, 718], [572, 724], [620, 790], [548, 808], [176, 718], [84, 778]])}" stroke="${C.dgreen}" stroke-width="2"/>
    <path d="M186 784 l9 -15 l9 15 M236 796 l8 -13 l8 13" stroke-width="2"/>
    <path d="M760 800 q9 -6 18 0 M880 812 q9 -6 18 0 M960 704 q9 -6 18 0 M730 690 q9 -6 18 0 M30 696 q9 -6 18 0 M990 800 q9 -6 18 0 M850 700 q9 -6 18 0" stroke="#fff" stroke-width="2.400"/>
    <ellipse cx="920" cy="744" rx="42" ry="18" fill="${C.sand}"/><circle cx="790" cy="736" r="22" fill="rgba(255,255,255,.3)" stroke="#fff"/>
    <path d="M298 112 Q328 66 372 58 Q450 50 516 74 Q562 94 554 126 Q470 152 380 138 Q318 138 298 112Z" fill="#F7F8F2" stroke="none"/>
    <path d="M42 368 Q120 352 200 432 Q300 444 432 442 Q474 470 444 498 Q300 512 150 500 Q52 490 38 422Z" fill="#EBD9A6" stroke="none"/>
    <path d="M222 624 Q300 598 420 606 Q472 620 462 648 Q400 670 300 666 Q232 662 222 624Z" fill="#EBD9A6" stroke="none"/>
    <path d="M60 612 Q120 588 200 608 Q214 640 180 658 Q100 662 64 640Z" fill="#B5CE92" stroke="none"/>
    <path d="M822 382 Q866 370 912 384 Q920 416 890 430 Q846 434 824 416Z" fill="#BFDDE3" stroke="none"/>
    <path d="M322 90 l10 -16 l10 16 M398 80 l9 -15 l9 15 M440 96 l8 -13 l8 13 M530 108 l8 -13 l8 13" stroke-width="2"/>
    <path d="${tree([[136, 198], [246, 204], [356, 204], [134, 280], [244, 356], [466, 204], [356, 356], [906, 282], [1004, 284], [912, 366], [1002, 398], [170, 596], [286, 602], [400, 590], [520, 606], [70, 590], [520, 520]])}" stroke="${C.dgreen}" stroke-width="2"/>
    <path d="M176 448 q10 -8 20 0 M306 486 q10 -8 20 0 M446 474 q10 -8 20 0 M60 440 q10 -8 20 0 M330 630 q10 -8 20 0" stroke="${C.dwood}" stroke-width="1.800"/>
    <ellipse cx="232" cy="64" rx="46" ry="19" fill="${C.white}"/><ellipse cx="606" cy="56" rx="46" ry="19" fill="${C.white}"/><ellipse cx="880" cy="154" rx="46" ry="19" fill="${C.white}"/>
    <path d="M44 86 a17 17 0 0 1 4 -34 a23 23 0 0 1 44 -2 a18 18 0 0 1 36 6 a15 15 0 0 1 -2 30z" fill="${C.white}"/>
    <path d="M678 72 a46 46 0 0 1 46 -46 h136 a46 46 0 0 1 0 92 h-136 a46 46 0 0 1 -46 -46z" fill="#2B3560"/><g stroke="none" fill="#FFF6C9"><circle cx="694" cy="52" r="2"/><circle cx="752" cy="50" r="2.400"/><circle cx="700" cy="96" r="1.800"/><circle cx="748" cy="98" r="2"/><circle cx="722" cy="36" r="1.600"/><circle cx="792" cy="40" r="2"/><circle cx="806" cy="96" r="1.800"/><circle cx="828" cy="44" r="1.600"/><circle cx="892" cy="42" r="2"/><circle cx="884" cy="98" r="1.800"/></g>
    ${_arcBow(972, 88, 40)}<circle cx="934" cy="90" r="11" fill="${C.white}"/><circle cx="1010" cy="90" r="11" fill="${C.white}"/>
    <ellipse cx="716" cy="242" rx="42" ry="18" fill="${C.sand}"/><ellipse cx="760" cy="334" rx="42" ry="18" fill="${C.sand}"/><ellipse cx="748" cy="440" rx="42" ry="18" fill="${C.sand}"/>
    <circle cx="652" cy="324" r="22" fill="rgba(255,255,255,.3)" stroke="#fff"/><circle cx="846" cy="520" r="22" fill="rgba(255,255,255,.3)" stroke="#fff"/>
    <ellipse cx="700" cy="540" rx="42" ry="18" fill="#F6D3CC"/><ellipse cx="760" cy="624" rx="42" ry="18" fill="${C.sand}"/><ellipse cx="900" cy="600" rx="42" ry="18" fill="#F6E7B4"/><ellipse cx="986" cy="154" rx="44" ry="18" fill="${C.white}"/>
    <path d="M746 154 Q778 194 810 154Z" fill="${C.dwood}"/><ellipse cx="778" cy="154" rx="34" ry="10" fill="${C.lgreen}"/>
    <path d="M636 160 l-7 -5 M636 160 l8 -4" stroke="${C.yellow}" stroke-width="3"/>
    <path d="M636 620 h30 l-5 9 h-20z" fill="${C.coral}" stroke-width="1.800"/><path d="M651 620 v-22 l13 18z" fill="${C.white}" stroke-width="1.800"/>
    <circle cx="1000" cy="644" r="24" fill="${C.cream}"/><path d="M1000 624 L1007 644 L1000 664 L993 644Z" fill="${C.coral}" stroke-width="1.800"/><path d="M980 644 h40" stroke-width="1.600"/>
    ${friend ? house(MAP_FRIEND[0], MAP_FRIEND[1], C.dwood) : ''}
    <path class="map-route" d="" stroke="${C.coral}" stroke-width="3.400" stroke-dasharray="2 9"/>
    ${nodes}</g>
    ${texts}${friend ? label(MAP_FRIEND[0], MAP_FRIEND[1] + 26, '栗子家') : ''}
    <g class="map-pet"></g></svg>`;
}
/* 地图上的宠物：一个小圆牌，里面是宠物；开车的话旁边带着车 */
function mapPetSVG(type, wear, carIc) {
  return `<g stroke="${C.line}" stroke-width="2.400" stroke-linejoin="round" stroke-linecap="round" fill="none"><circle r="25" fill="${C.white}" stroke="${C.coral}" stroke-width="3.400"/>` +
    `<g transform="translate(-21 -23) scale(.21)" stroke-width="11">${petInner(type, 'joy', wear)}</g>` +
    (carIc ? `<g transform="translate(12 6) scale(.62)" stroke-width="3"><circle cx="24" cy="26" r="25" fill="${C.cream}"/>${ICONS[carIc]}</g>` : '') + '</g>';
}

/* ==========================================================
 *  第七批：又六只宠物、五辆车、十个景点、更多本地货和商店物品、棋子
 * ========================================================== */
Object.assign(PETS, {
  tiger:    { name: '小老虎', defName: '虎虎', desc: '威风凛凛的小胖虎', fav: 'burger',     talent: '打滚',   talentIcon: 'sparkle', trick: 'trick-roll', eyes: [78, 122, 86], hat: [100, 43] },
  koala:    { name: '考拉',   defName: '呼呼', desc: '抱着树就能睡一天', fav: 'lettuce',    talent: '转圈圈', talentIcon: 'sparkle', trick: 'trick-spin', eyes: [76, 124, 88], hat: [100, 46] },
  sheep:    { name: '小羊',   defName: '绵绵', desc: '像一朵软软的云',   fav: 'cabbage',    talent: '蹦蹦跳', talentIcon: 'sparkle', trick: 'trick-jump', eyes: [80, 120, 92], hat: [100, 36] },
  owl:      { name: '猫头鹰', defName: '咕咕', desc: '晚上最有精神',     fav: 'popcorn',    talent: '拍翅膀', talentIcon: 'sparkle', trick: 'flap',       eyes: [76, 124, 90], hat: [100, 56], fly: true },
  elephant: { name: '小象',   defName: '嘟嘟', desc: '长鼻子会喷水',     fav: 'watermelon', talent: '转圈圈', talentIcon: 'sparkle', trick: 'trick-spin', eyes: [76, 124, 84], hat: [100, 44] },
  deer:     { name: '小鹿',   defName: '斑斑', desc: '跑起来轻轻的',     fav: 'apple',      talent: '蹦蹦跳', talentIcon: 'sparkle', trick: 'trick-jump', eyes: [78, 122, 88], hat: [100, 50] }
});
Object.assign(PET_DRAW, {
  tiger(m) {
    const e = PETS.tiger.eyes, o = '#EDA85C', k = '#5B4636';
    return `
      <path class="tail" d="M138 162 q40 -6 34 -46" stroke="${C.line}" stroke-width="19"/><path class="tail" d="M138 162 q40 -6 34 -46" stroke="${o}" stroke-width="13"/>
      <ellipse cx="100" cy="150" rx="44" ry="36" fill="${o}"/>
      <ellipse cx="100" cy="158" rx="25" ry="23" fill="${C.cream}" stroke="none"/>
      <path d="M59 140 h12 M58 153 h11 M141 140 h-12 M142 153 h-11" stroke="${k}" stroke-width="4"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${C.cream}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${C.cream}"/>
      <circle cx="58" cy="50" r="16" fill="${o}"/><circle cx="58" cy="50" r="8" fill="${C.cream}" stroke="none"/>
      <circle cx="142" cy="50" r="16" fill="${o}"/><circle cx="142" cy="50" r="8" fill="${C.cream}" stroke="none"/>
      <ellipse cx="100" cy="88" rx="54" ry="48" fill="${o}"/>
      <path d="M100 42 v14 M86 45 l3 11 M114 45 l-3 11 M48 80 h13 M49 93 h12 M152 80 h-13 M151 93 h-12" stroke="${k}" stroke-width="4.500"/>
      <ellipse cx="100" cy="109" rx="22" ry="16" fill="${C.cream}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(60, 140, 106)}
      <path d="M94 99 h12 l-6 7z" fill="${C.coral}" stroke-width="2"/>
      ${_mouth(100, 106, m)}`;
  },
  koala(m) {
    const e = PETS.koala.eyes, g = '#B9BEC6', f = '#F1EEE8';
    return `
      <circle cx="44" cy="66" r="24" fill="${g}"/><circle cx="44" cy="66" r="13" fill="${f}" stroke="none"/>
      <circle cx="156" cy="66" r="24" fill="${g}"/><circle cx="156" cy="66" r="13" fill="${f}" stroke="none"/>
      <ellipse cx="100" cy="152" rx="42" ry="34" fill="${g}"/>
      <ellipse cx="100" cy="160" rx="24" ry="21" fill="${f}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${g}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${g}"/>
      <ellipse cx="100" cy="90" rx="52" ry="46" fill="${g}"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(56, 144, 106)}
      <ellipse cx="100" cy="99" rx="10" ry="13" fill="#5B4636"/>
      ${_mouth(100, 115, m)}`;
  },
  sheep(m) {
    const e = PETS.sheep.eyes, w = '#FBF6EA', f = '#F3DFC6';
    const puff = (pts, r) => pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${w}"/>`).join('');
    return `
      ${puff([[64, 136], [136, 136], [60, 164], [140, 164], [82, 124], [118, 124]], 18)}
      <ellipse cx="100" cy="152" rx="40" ry="32" fill="${w}" stroke="none"/>
      <ellipse cx="82" cy="182" rx="11" ry="8" fill="#5B4636"/><ellipse cx="118" cy="182" rx="11" ry="8" fill="#5B4636"/>
      <ellipse cx="50" cy="86" rx="16" ry="9" fill="${f}" transform="rotate(-18 50 86)"/><ellipse cx="150" cy="86" rx="16" ry="9" fill="${f}" transform="rotate(18 150 86)"/>
      <ellipse cx="100" cy="94" rx="44" ry="42" fill="${f}"/>
      ${puff([[70, 60], [130, 60], [100, 52], [84, 46], [116, 46]], 17)}
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(64, 136, 108)}
      <path d="M95 104 h10 l-5 6z" fill="${C.coral}" stroke-width="2"/>
      ${_mouth(100, 110, m)}`;
  },
  owl(m) {
    const e = PETS.owl.eyes, b = '#B08A64', f = '#EAD9BC';
    const beak = m === 'eat'
      ? `<path d="M92 107 L108 107 L100 113Z" fill="${C.yellow}"/><path d="M94 117 L106 117 L100 127Z" fill="${C.orange}"/>`
      : `<path d="M92 108 L108 108 L100 122Z" fill="${C.yellow}"/>`;
    return `
      <path d="M84 174 v10 m-7 0 h14 M116 174 v10 m-7 0 h14" stroke="#C98A3C" stroke-width="4.500"/>
      <path d="M56 72 L50 30 L86 54Z" fill="${b}"/><path d="M144 72 L150 30 L114 54Z" fill="${b}"/>
      <ellipse cx="100" cy="116" rx="58" ry="62" fill="${b}"/>
      <ellipse cx="100" cy="146" rx="36" ry="29" fill="${f}" stroke="none"/>
      <path d="M84 140 q5 5 10 0 M106 140 q5 5 10 0 M95 153 q5 5 10 0 M80 158 q4 4 8 0 M112 158 q4 4 8 0" stroke="${b}" stroke-width="2.400"/>
      <g transform="rotate(14 44 128)"><ellipse class="wing wl" cx="44" cy="128" rx="14" ry="30" fill="#8C6B4A"/></g>
      <g transform="rotate(-14 156 128)"><ellipse class="wing wr" cx="156" cy="128" rx="14" ry="30" fill="#8C6B4A"/></g>
      <circle cx="${e[0]}" cy="${e[2]}" r="21" fill="${f}"/><circle cx="${e[1]}" cy="${e[2]}" r="21" fill="${f}"/>
      ${_eye(e[0], e[2], m, 7)}${_eye(e[1], e[2], m, 7)}${_blush(50, 150, 118)}${beak}`;
  },
  elephant(m) {
    const e = PETS.elephant.eyes, g = '#AFC3D2', d = '#93AABB';
    return `
      <ellipse cx="100" cy="152" rx="44" ry="35" fill="${g}"/>
      <ellipse cx="80" cy="182" rx="15" ry="8" fill="${d}"/><ellipse cx="120" cy="182" rx="15" ry="8" fill="${d}"/>
      <path d="M56 56 Q14 48 16 92 Q20 126 58 118Z" fill="${g}"/><path d="M52 68 Q30 66 30 90 Q33 108 54 106Z" fill="${C.pink}" stroke="none"/>
      <path d="M144 56 Q186 48 184 92 Q180 126 142 118Z" fill="${g}"/><path d="M148 68 Q170 66 170 90 Q167 108 146 106Z" fill="${C.pink}" stroke="none"/>
      <ellipse cx="100" cy="88" rx="50" ry="46" fill="${g}"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 102)}
      <path d="M88 96 Q86 130 96 146 Q104 153 109 144 Q102 126 112 96Z" fill="${g}"/>
      <path d="M92 118 h13 M93 130 h10" stroke="${d}" stroke-width="2"/>`;
  },
  deer(m) {
    const e = PETS.deer.eyes, b = '#D2A679', f = '#F6E7CF';
    const horn = 'M76 52 Q70 32 60 24 M70 38 Q60 38 54 32 M124 52 Q130 32 140 24 M130 38 Q140 38 146 32';
    return `
      <circle cx="140" cy="164" r="9" fill="${f}"/>
      <ellipse cx="100" cy="152" rx="40" ry="33" fill="${b}"/>
      <ellipse cx="100" cy="160" rx="22" ry="20" fill="${f}" stroke="none"/>
      <circle cx="68" cy="142" r="4" fill="${f}" stroke="none"/><circle cx="133" cy="146" r="4" fill="${f}" stroke="none"/><circle cx="72" cy="160" r="3.500" fill="${f}" stroke="none"/>
      <ellipse cx="82" cy="182" rx="12" ry="8" fill="#8C6B4A"/><ellipse cx="118" cy="182" rx="12" ry="8" fill="#8C6B4A"/>
      <path d="${horn}" stroke="${C.line}" stroke-width="9"/><path d="${horn}" stroke="#C99A5E" stroke-width="5"/>
      <ellipse cx="50" cy="76" rx="18" ry="10" fill="${b}" transform="rotate(-24 50 76)"/><ellipse cx="150" cy="76" rx="18" ry="10" fill="${b}" transform="rotate(24 150 76)"/>
      <ellipse cx="100" cy="92" rx="48" ry="44" fill="${b}"/>
      <ellipse cx="100" cy="111" rx="22" ry="16" fill="${f}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(60, 140, 106)}
      <ellipse cx="100" cy="102" rx="7" ry="5" fill="${C.coral}" stroke="none"/>
      ${_mouth(100, 109, m)}`;
  }
});

/* ---------- 国际象棋的棋子（48×48）。p 兵、r 车、n 马、b 象、q 后、k 王 ---------- */
const CHESS_DRAW = {
  p: `<circle cx="24" cy="14" r="7"/><path d="M17 38 Q21 28 21 20 h6 Q27 28 31 38Z"/><path d="M12 44 h24 v-6 h-24z"/>`,
  r: `<path d="M13 8 h5 v4 h4 v-4 h4 v4 h4 v-4 h5 v10 h-22z"/><path d="M16 18 h16 l2 20 h-20z"/><path d="M11 44 h26 v-6 h-26z"/>`,
  n: `<path d="M15 38 Q14 22 22 16 L20 8 L27 12 Q39 14 39 30 L34 31 Q30 24 26 26 Q28 32 32 38Z"/><path d="M11 44 h26 v-6 h-26z"/>`,
  b: `<circle cx="24" cy="7" r="3"/><path d="M24 10 Q35 20 28 30 h-8 Q13 20 24 10Z"/><path d="M17 38 h14 l-2 -8 h-10z"/><path d="M11 44 h26 v-6 h-26z"/>`,
  q: `<path d="M9 14 L16 30 h16 L39 14 L31 23 L24 10 L17 23Z"/><circle cx="9" cy="13" r="2.600"/><circle cx="24" cy="9" r="2.600"/><circle cx="39" cy="13" r="2.600"/><path d="M15 38 h18 l-1 -8 h-16z"/><path d="M11 44 h26 v-6 h-26z"/>`,
  k: `<path d="M24 3 v11 M19 8 h10" stroke-width="3"/><path d="M14 30 Q7 18 18 16 Q24 16 24 23 Q24 16 30 16 Q41 18 34 30Z"/><path d="M15 38 h18 l-1 -8 h-16z"/><path d="M11 44 h26 v-6 h-26z"/>`
};
function chessSVG(type, white) {
  return `<svg class="ic" viewBox="0 0 48 48">${G_OPEN('wob-s', 2.2)}<g fill="${white ? C.white : '#5B4636'}">${CHESS_DRAW[type] || ''}</g>` +
    (type === 'n' ? `<circle cx="28" cy="18" r="1.600" fill="${white ? C.line : C.cream}" stroke="none"/>` : '') + '</g></svg>';
}

/* ---------- 第七批图标 ---------- */
Object.assign(ICONS, {
  // 小游戏
  match3: `<rect x="3" y="14" width="13" height="13" rx="4" fill="${C.coral}"/><rect x="17.500" y="14" width="13" height="13" rx="4" fill="${C.coral}"/><rect x="32" y="14" width="13" height="13" rx="4" fill="${C.coral}"/><rect x="10" y="30" width="13" height="13" rx="4" fill="${C.yellow}"/><rect x="25" y="30" width="13" height="13" rx="4" fill="${C.blue}"/>` + _burst(24, 7, C.yellow, .38),
  chess: `<g fill="${C.cream}">${CHESS_DRAW.n}</g><circle cx="28" cy="18" r="1.600" fill="${C.line}" stroke="none"/>`,
  gomoku: `<path d="M8 14 H40 M8 24 H40 M8 34 H40 M14 8 V40 M24 8 V40 M34 8 V40" stroke-width="1.400"/><circle cx="14" cy="14" r="5" fill="#5B4636"/><circle cx="24" cy="24" r="5" fill="#5B4636"/><circle cx="34" cy="34" r="5" fill="#5B4636"/><circle cx="34" cy="14" r="5" fill="${C.white}"/><circle cx="14" cy="34" r="5" fill="${C.white}"/>`,
  // 新小车
  tractor: `<path d="M12 22 v-9" stroke-width="3"/><path d="M6 31 V22 H21 V11 H38 V31Z" fill="${C.green}"/><rect x="25" y="14" width="9" height="8" fill="${C.sky}" stroke-width="1.400"/>` + _wh(33, 34, 10) + _wh(11, 38, 6),
  police: `<rect x="20" y="4" width="8" height="5" rx="1.500" fill="${C.red}" stroke-width="1.400"/><path d="M3 34 V27 Q3 23 9 22 L15 12 Q17 9 22 9 H31 Q35 9 38 13 L43 22 Q46 24 46 28 V34 Q46 36 44 36 H5 Q3 36 3 34Z" fill="${C.white}"/><path d="M17 21 L21 13 H26 V21Z M29 13 H32 Q34 13 36 16 L39 21 H29Z" fill="${C.sky}" stroke-width="1.600"/><path d="M4 29 H45" stroke="${C.blue}" stroke-width="3.500"/>` + _wh(14, 37, 5.5) + _wh(36, 37, 5.5),
  icetruck: `<path d="M3 34 V14 Q3 10 7 10 H33 Q36 10 38 13 L42 22 Q46 23 46 28 V34 Q46 36 44 36 H5 Q3 36 3 34Z" fill="#F9DCE0"/><path d="M31 14 h3 l4 8 h-7z" fill="${C.sky}" stroke-width="1.600"/><path d="M8 20 L13 31 L18 20Z" fill="#E2B877" stroke-width="1.400"/><circle cx="13" cy="17" r="5.500" fill="${C.white}" stroke-width="1.400"/><rect x="21" y="14" width="8" height="8" rx="1.500" fill="${C.sky}" stroke-width="1.400"/>` + _wh(13, 37, 5.5) + _wh(37, 37, 5.5),
  excavator: `<rect x="3" y="34" width="29" height="10" rx="5" fill="#5B4636"/><path d="M7 34 V20 H24 V34Z" fill="${C.yellow}"/><rect x="11" y="23" width="9" height="7" fill="${C.sky}" stroke-width="1.400"/>` + _line2('M24 25 L35 10 L41 23', C.yellow, 3.5) + `<path d="M36 23 h10 l-2 9 h-6z" fill="${C.gray}" stroke-width="1.600"/>`,
  airship: `<path d="M39 11 l7 -6 v13z M39 25 l7 6 v-13z" fill="${C.yellow}" stroke-width="1.600"/><ellipse cx="23" cy="18" rx="20" ry="12" fill="${C.coral}"/><path d="M4 18 H42" stroke="${C.cream}" stroke-width="3"/><path d="M17 30 v5 M29 30 v5" stroke-width="1.600"/><rect x="13" y="34" width="20" height="9" rx="3.500" fill="${C.cream}"/>`,
  // 新旅行用品
  binoculars: `<rect x="19" y="19" width="10" height="9" fill="${C.gray}"/><rect x="6" y="12" width="15" height="28" rx="6" fill="#5B4636"/><rect x="27" y="12" width="15" height="28" rx="6" fill="#5B4636"/><circle cx="13.500" cy="33" r="4.500" fill="${C.sky}" stroke-width="1.600"/><circle cx="34.500" cy="33" r="4.500" fill="${C.sky}" stroke-width="1.600"/>`,
  // 新特产
  candyapple: `<path d="M24 28 V46" stroke-width="3"/><circle cx="24" cy="18" r="14" fill="${C.red}"/><path d="M11 21 q13 9 26 0 q0 11 -13 11 q-13 0 -13 -11z" fill="#E2B877" stroke-width="1.600"/><path d="M15 13 q3 -6 9 -7" stroke="#fff" stroke-width="2.600"/>`,
  nutpie: `<path d="M4 30 Q4 15 24 15 Q44 15 44 30Z" fill="#D9A866"/>` + _dots([[13, 25], [21, 21], [30, 23], [36, 27], [24, 27]], 2.600, C.dwood) + `<path d="M2 30 h44 l-4 10 h-36z" fill="#E2B877"/>`,
  waffle: `<rect x="7" y="11" width="34" height="30" rx="6" fill="#E9B96E"/><path d="M18 11 v30 M30 11 v30 M7 21 h34 M7 31 h34" stroke-width="1.600"/><path d="M14 10 q10 7 20 0 q2 9 -10 10 q-12 -1 -10 -10z" fill="${C.white}" stroke-width="1.600"/><circle cx="24" cy="10" r="4" fill="${C.red}" stroke-width="1.400"/>`,
  coraljelly: _line2('M24 44 V8 M24 32 Q14 28 13 13 M24 30 Q34 26 35 11 M17 22 Q9 21 7 15 M31 20 Q39 19 41 13', C.coral, 5),
  whalebread: `<path d="M21 14 q-2 -6 -6 -7 M21 14 q2 -6 6 -7" stroke="${C.blue}" stroke-width="2"/><path d="M5 28 Q5 14 21 14 Q35 14 38 26 L46 18 V36 L38 30 Q34 40 20 40 Q5 40 5 28Z" fill="#E2B877"/><circle cx="13" cy="26" r="1.800" fill="${C.line}" stroke="none"/><path d="M9 33 q6 3 12 0" stroke-width="1.500"/>`,
  pinkmilk: `<rect x="18" y="3" width="12" height="6" rx="2" fill="${C.red}"/><path d="M17 9 h14 l3 9 v22 q0 4 -4 4 h-12 q-4 0 -4 -4 v-22z" fill="#F9DCE0"/><path d="M14 24 h20 v11 h-20z" fill="${C.white}" stroke-width="1.400"/><circle cx="24" cy="29.500" r="3" fill="${C.red}" stroke="none"/>`,
  icemint: `<path d="M9 24 L2 17 V31Z M39 24 L46 17 V31Z" fill="${C.white}" stroke-width="1.600"/><path d="M8 24 L16 12 H32 L40 24 L32 36 H16Z" fill="#CFEDE6"/><path d="M16 12 L20 24 L16 36 M32 12 L28 24 L32 36 M8 24 H40" stroke-width="1.400"/>`,
  skyfruit: `<path d="M11 25 Q0 21 2 12 Q10 14 14 21Z M37 25 Q48 21 46 12 Q38 14 34 21Z" fill="${C.white}" stroke-width="1.600"/><path d="M24 16 q2 -8 8 -9"/><circle cx="24" cy="29" r="13" fill="${C.purple}"/><path d="M17 25 q2 -5 6 -6" stroke="#fff" stroke-width="2.200"/>`,
  honeycake: `<path d="M3 41 h42"/><path d="M8 40 V20 H40 V40Z" fill="#F0C56B"/><path d="M8 31 H40" stroke="${C.cream}" stroke-width="3"/><path d="M8 20 Q8 12 24 12 Q40 12 40 20 q-3 8 -7 2 q-3 10 -8 1 q-4 8 -8 0 q-4 6 -9 -3z" fill="#D9963C" stroke-width="1.600"/>`,
  blockcookie: `<rect x="6" y="24" width="18" height="18" rx="2" fill="${C.coral}"/><rect x="24" y="24" width="18" height="18" rx="2" fill="${C.blue}"/><rect x="15" y="6" width="18" height="18" rx="2" fill="${C.yellow}"/><path d="M12 33 h6 M30 33 h6 M21 15 h6" stroke="#fff" stroke-width="2.400"/>`,
  // 各地小铺的新吃的
  chestnutcake: `<path d="M24 11 v-6" stroke-width="2.400"/><path d="M6 34 Q4 16 24 10 Q44 16 42 34 Q24 44 6 34Z" fill="#B98A5E"/><path d="M9 32 Q24 40 39 32" stroke="${C.cream}" stroke-width="5"/>`,
  coconutcake: `<path d="M6 22 L24 12 L42 22 V34 L24 44 L6 34Z" fill="${C.white}"/><path d="M6 22 L24 32 L42 22 M24 32 V44" stroke-width="1.800"/>` + _dots([[16, 21], [24, 18], [32, 22], [24, 25], [12, 30], [36, 30], [30, 38], [17, 37]], 1.400, C.dwood),
  snowcake: `<path d="M27 7 q4 -4 8 -2" stroke="${C.dgreen}" stroke-width="2"/><path d="M3 41 h42"/><circle cx="24" cy="26" r="15" fill="${C.white}"/><path d="M12 21 q12 -10 24 0" stroke="${C.sky}" stroke-width="2"/><circle cx="24" cy="10" r="4" fill="${C.red}" stroke-width="1.400"/>`,
  cactuscandy: _line2('M18 31 h-5 q-4 0 -4 -4 v-5', '#A9CC7A', 4.5) + _line2('M30 27 h5 q4 0 4 -4 v-4', '#A9CC7A', 4.5) + `<path d="M17 43 V16 q0 -8 7 -8 q7 0 7 8 V43z" fill="#A9CC7A"/>` + _dots([[21, 18], [27, 24], [21, 30], [27, 36]], 1.500, '#fff'),
  rainbowcake: `<path d="M6 41 V15 Q24 7 42 15 V41Z" fill="${C.white}"/><path d="M6.500 21 H41.500" stroke="${C.coral}" stroke-width="4"/><path d="M6.500 28 H41.500" stroke="${C.yellow}" stroke-width="4"/><path d="M6.500 35 H41.500" stroke="${C.blue}" stroke-width="4"/><path d="M6 41 V15 Q24 7 42 15 V41Z"/><g stroke-width="1.300">` + _star(24, 8, 5, 2.2, C.yellow) + '</g>',
  pretzel: _line2('M24 41 Q4 31 8 16 Q14 6 24 17 Q34 6 40 16 Q44 31 24 41 M15 35 L33 15 M33 35 L15 15', '#C98A4E', 4.5) + _dots([[10, 22], [38, 22], [24, 14], [18, 36], [30, 36]], 1.500, '#fff'),
  // 各地小铺的新装扮
  ladybug: `<circle cx="24" cy="10" r="6" fill="${C.line}" stroke="none"/><ellipse cx="24" cy="27" rx="17" ry="15" fill="${C.red}"/><path d="M24 12 v30" stroke-width="2"/>` + _dots([[16, 22], [32, 22], [17, 33], [31, 33]], 2.800, C.line),
  crabhat: `<path d="M12 26 q-7 -4 -6 -12 M36 26 q7 -4 6 -12" stroke-width="2.400"/><circle cx="6" cy="12" r="5" fill="${C.red}"/><circle cx="42" cy="12" r="5" fill="${C.red}"/><ellipse cx="24" cy="28" rx="17" ry="11" fill="${C.red}"/><path d="M18 25 v.100 M30 25 v.100" stroke-width="3.400"/><path d="M19 32 q5 3 10 0" stroke-width="1.800"/>`,
  reindeer: `<path d="M6 40 Q24 28 42 40" stroke-width="6"/><path d="M6 40 Q24 28 42 40" stroke="${C.red}" stroke-width="3"/>` + _line2('M16 33 Q13 18 6 12 M13 22 Q6 22 3 18 M32 33 Q35 18 42 12 M35 22 Q42 22 45 18', '#C99A5E', 3.5),
  pharaoh: `<path d="M8 44 L5 20 Q8 6 24 6 Q40 6 43 20 L40 44 L34 26 Q24 22 14 26Z" fill="${C.yellow}"/><path d="M10 15 Q24 10 38 15 M7 24 l6 2 M41 24 l-6 2 M8 33 h6 M40 33 h-6" stroke="${C.blue}" stroke-width="3"/><circle cx="24" cy="9" r="3" fill="${C.red}" stroke-width="1.400"/>`,
  mooncrown: `<path d="M6 40 Q24 28 42 40" stroke-width="6"/><path d="M6 40 Q24 28 42 40" stroke="${C.purple}" stroke-width="3"/><path d="M27 6 A13 13 0 1 0 36 28 A10.500 10.500 0 0 1 27 6Z" fill="${C.yellow}"/><g stroke-width="1.300">` + _star(11, 24, 4.500, 2, C.yellow) + '</g>',
  jester: `<path d="M8 38 Q6 22 1 14 Q14 10 24 26 L24 38Z" fill="${C.coral}"/><path d="M40 38 Q42 22 47 14 Q34 10 24 26 L24 38Z" fill="${C.blue}"/><circle cx="3" cy="12" r="3.500" fill="${C.yellow}" stroke-width="1.400"/><circle cx="45" cy="12" r="3.500" fill="${C.yellow}" stroke-width="1.400"/><rect x="6" y="34" width="36" height="8" rx="4" fill="${C.yellow}"/>`,
  // 货架上的新东西
  sandwich: `<path d="M4 38 L24 8 L44 38Z" fill="#F3DCA8"/><path d="M10 31 h28" stroke="${C.green}" stroke-width="3.500"/><path d="M14 25 h20" stroke="${C.coral}" stroke-width="3.500"/><path d="M4 38 L24 8 L44 38Z"/>`,
  sushi: `<ellipse cx="24" cy="31" rx="18" ry="10" fill="${C.white}"/><path d="M7 25 Q24 9 41 25 Q24 31 7 25Z" fill="${C.coral}"/><path d="M15 21 l3 6 M33 21 l-3 6" stroke="#fff" stroke-width="1.600"/><path d="M21 17 q-1.500 12 0 23 h6 q1.500 -11 0 -23z" fill="#5B4636" stroke-width="1.400"/>`,
  baozi: `<path d="M18 7 q-3 -3 0 -5 M28 7 q-3 -3 0 -5" stroke-width="1.600"/><path d="M5 38 Q3 16 24 12 Q45 16 43 38Z" fill="${C.white}"/><path d="M3 38 h42"/><path d="M24 12 q-2 6 -8 8 M24 12 v9 M24 12 q2 6 8 8" stroke-width="1.600"/>`,
  cupcake: `<path d="M12 26 h24 l-3 18 h-18z" fill="${C.blue}"/><path d="M17 27 l1 17 M24 27 v17 M31 27 l-1 17" stroke-width="1.200"/><path d="M9 26 Q7 16 16 15 Q18 6 26 9 Q36 6 37 16 Q42 20 39 26Z" fill="${C.pink}"/><circle cx="25" cy="7" r="4" fill="${C.red}" stroke-width="1.400"/>`,
  milkshake: `<path d="M30 2 l-4 16" stroke="${C.coral}" stroke-width="3"/>` + _glass('#F6D3DA') + `<path d="M10 9 q2 -8 8 -4 q4 -6 9 -1 q8 -3 11 5z" fill="${C.white}" stroke-width="1.600"/>`,
  catears: `<path d="M6 40 Q24 28 42 40" stroke-width="6"/><path d="M6 40 Q24 28 42 40" stroke="#5B4636" stroke-width="3"/><path d="M8 34 L11 10 L24 28Z" fill="${C.orange}"/><path d="M40 34 L37 10 L24 28Z" fill="${C.orange}"/><path d="M12 29 L13 17 L19 27Z M36 29 L35 17 L29 27Z" fill="${C.pink}" stroke="none"/>`,
  strawberryhat: `<path d="M5 36 Q3 10 24 10 Q45 10 43 36 Q24 28 5 36Z" fill="${C.red}"/><path d="M14 22 v.100 M24 18 v.100 M34 23 v.100 M20 29 v.100 M30 28 v.100" stroke="${C.yellow}" stroke-width="2.600"/><path d="M24 12 q-9 -1 -11 -7 q6 0 11 4 q0 -5 2 -8 q3 3 1 8 q5 -4 10 -4 q-1 6 -13 7z" fill="${C.green}" stroke-width="1.600"/>`,
  detective: `<path d="M6 30 Q-4 30 2 38 Q8 36 8 34Z M42 30 Q52 30 46 38 Q40 36 40 34Z" fill="#8C6B4A" stroke-width="1.600"/><path d="M6 34 Q6 10 24 10 Q42 10 42 34Z" fill="#B08A64"/><path d="M15 13 v21 M33 13 v21 M7 23 h34" stroke="#8C6B4A" stroke-width="1.800"/><circle cx="24" cy="9" r="3" fill="#8C6B4A" stroke-width="1.400"/>`,
  tiara: `<path d="M5 36 Q24 28 43 36 L46 26 L37 27 L33 14 L27 25 L24 8 L21 25 L15 14 L11 27 L2 26Z" fill="#F3DC8A"/><circle cx="24" cy="22" r="3" fill="${C.pink}" stroke-width="1.400"/><circle cx="15" cy="27" r="2" fill="${C.sky}" stroke="none"/><circle cx="33" cy="27" r="2" fill="${C.sky}" stroke="none"/>`
});

/* ---------- 第七批：小车和家具 ---------- */
Object.assign(FURNS, {
  tractor:   { name: '拖拉机',   type: 'floor', price: 1150, car: 3.2, ic: 'tractor',   tip: '路上快 3.2 倍', w: 150, vb: [170, 140],
    draw: () => `<path d="M128 60 V32" stroke-width="7"/><path d="M30 100 V30 H96 V60 H146 Q156 62 156 74 V100Z" fill="${C.green}"/><path d="M40 60 V40 H86 V60Z" fill="${C.sky}"/><path d="M24 30 H102" stroke-width="7"/><circle cx="150" cy="82" r="5.500" fill="${C.yellow}" stroke-width="1.800"/>` + _wh(54, 100, 34) + _wh(138, 116, 18) },
  police:    { name: '小警车',   type: 'floor', price: 2200, car: 4.8, ic: 'police',    tip: '路上快 4.8 倍', w: 180, vb: [230, 128],
    draw: () => `<rect x="96" y="5" width="28" height="15" rx="5" fill="${C.red}"/><path d="M110 5 h9 q5 0 5 5 v5 q0 5 -5 5 h-9z" fill="${C.blue}" stroke-width="1.800"/><path d="M12 96 V72 Q12 60 30 58 L52 30 Q58 20 74 20 H138 Q152 20 162 32 L182 58 Q214 62 218 78 V96 Q218 102 210 102 H20 Q12 102 12 96Z" fill="${C.white}"/><path d="M62 56 L77 32 H104 V56Z" fill="${C.sky}"/><path d="M112 32 H140 Q148 32 154 40 L166 56 H112Z" fill="${C.sky}"/><path d="M14 80 H217" stroke="${C.blue}" stroke-width="11"/><g stroke-width="1.600">` + _star(110, 80, 10, 4.5, C.yellow) + `</g><circle cx="209" cy="70" r="5.500" fill="${C.yellow}" stroke-width="1.800"/>` + _wh(60, 102, 20) + _wh(170, 102, 20) },
  icetruck:  { name: '冰淇淋车', type: 'floor', price: 3000, car: 5.8, ic: 'icetruck',  tip: '路上快 5.8 倍', w: 205, vb: [270, 158],
    draw: () => `<path d="M10 124 V36 Q10 22 26 22 H190 Q204 22 212 34 L236 74 Q256 78 258 96 V124 Q258 130 250 130 H18 Q10 130 10 124Z" fill="#F9DCE0"/><rect x="92" y="54" width="78" height="38" rx="4" fill="${C.sky}"/><path d="M86 42 h90 v14 h-90z" fill="${C.coral}"/><path d="M108 42 v14 M131 42 v14 M154 42 v14" stroke="#fff" stroke-width="7"/><path d="M190 40 h14 l20 34 h-34z" fill="${C.sky}"/><path d="M38 80 L52 112 L66 80Z" fill="#E2B877" stroke-width="1.800"/><circle cx="52" cy="70" r="16" fill="${C.white}" stroke-width="1.800"/><circle cx="52" cy="54" r="5" fill="${C.red}" stroke-width="1.600"/><path d="M13 112 H256" stroke="${C.white}" stroke-width="6"/><circle cx="250" cy="102" r="5.500" fill="${C.yellow}" stroke-width="1.800"/>` + _wh(66, 130, 22) + _wh(204, 130, 22) },
  excavator: { name: '挖掘机',   type: 'floor', price: 4200, car: 7,   ic: 'excavator', tip: '路上快 7 倍', w: 200, vb: [250, 160],
    draw: () => `<path d="M40 66 V42" stroke-width="7"/>` + _line2('M112 78 L176 24 L216 86', C.yellow, 10) + `<path d="M200 84 h36 l-6 30 q-18 6 -30 -8z" fill="${C.gray}"/><rect x="12" y="118" width="134" height="36" rx="18" fill="#5B4636"/><circle cx="34" cy="136" r="9" fill="${C.cream}" stroke-width="1.800"/><circle cx="79" cy="136" r="7" fill="${C.cream}" stroke-width="1.800"/><circle cx="124" cy="136" r="9" fill="${C.cream}" stroke-width="1.800"/><path d="M26 118 V64 H116 Q128 66 128 80 V118Z" fill="${C.yellow}"/><rect x="70" y="72" width="46" height="34" rx="4" fill="${C.sky}"/><path d="M34 100 h26" stroke="#5B4636" stroke-width="5"/>` },
  airship:   { name: '小飞艇',   type: 'floor', price: 6500, car: 9,   ic: 'airship',   tip: '路上快 9 倍', w: 205, vb: [260, 152],
    draw: () => `<path d="M222 40 l32 -24 v40z M222 84 l32 24 v-40z" fill="${C.yellow}"/><ellipse cx="124" cy="62" rx="116" ry="50" fill="${C.coral}"/><path d="M9 62 H240" stroke="${C.cream}" stroke-width="9"/><path d="M52 24 Q124 48 196 24 M52 100 Q124 76 196 100" stroke-width="1.600"/><path d="M96 110 v14 M152 110 v14" stroke-width="3"/><rect x="84" y="122" width="80" height="26" rx="9" fill="${C.cream}"/><circle cx="104" cy="135" r="6" fill="${C.sky}" stroke-width="1.800"/><circle cx="124" cy="135" r="6" fill="${C.sky}" stroke-width="1.800"/><circle cx="144" cy="135" r="6" fill="${C.sky}" stroke-width="1.800"/>` },
  // 各地小铺才有的
  swing:      { name: '小秋千',   type: 'floor', price: 110, w: 130, vb: [130, 160], draw: () => _line2('M18 156 L44 12', C.wood, 6) + _line2('M112 156 L86 12', C.wood, 6) + `<path d="M34 12 H96" stroke-width="9"/><path d="M52 16 V104 M78 16 V104" stroke-width="2"/><rect x="43" y="102" width="44" height="11" rx="4" fill="${C.coral}"/>` },
  sandcastle: { name: '沙堡',     type: 'floor', price: 70,  w: 110, vb: [110, 100], draw: () => `<path d="M59 28 V8 l15 6 l-15 6" fill="${C.red}" stroke-width="1.800"/><path d="M8 94 V54 h14 v-12 h14 v12 h14 V28 h14 v26 h14 v-12 h14 v12 h10 v40z" fill="#E3C98F"/><path d="M46 94 v-18 a9 9 0 0 1 18 0 v18" fill="${C.dwood}" stroke-width="1.800"/><path d="M14 66 h8 M82 66 h8" stroke-width="2"/><path d="M2 94 h106" stroke-width="3"/>` },
  skis:       { name: '滑雪板',   type: 'wall',  price: 65,  w: 70,  vb: [70, 130],  draw: () => _line2('M18 124 L46 10', C.red, 7) + _line2('M52 124 L24 10', C.blue, 7) + `<circle cx="35" cy="67" r="6" fill="${C.yellow}" stroke-width="1.800"/>` },
  cameltoy:   { name: '骆驼摇摇', type: 'floor', price: 100, w: 130, vb: [130, 124], draw: () => `<path d="M30 98 V72 Q30 52 46 58 Q54 40 64 58 Q76 40 86 60 L92 30 Q96 20 106 26 L113 32 L104 39 L98 66 V98 H86 V80 H44 V98Z" fill="#D9B27A"/><circle cx="102" cy="30" r="1.800" fill="${C.line}" stroke="none"/><path d="M50 58 h30 v11 h-30z" fill="${C.coral}" stroke-width="1.800"/>` + _line2('M8 102 Q65 128 122 102', C.wood, 5.5) },
  cloudsofa:  { name: '云朵沙发', type: 'floor', price: 135, w: 200, vb: [200, 112], draw: () => `<path d="M30 104 a22 22 0 0 1 -8 -42 a30 30 0 0 1 50 -26 a34 34 0 0 1 62 0 a30 30 0 0 1 46 28 a22 22 0 0 1 -10 40z" fill="${C.white}"/><path d="M40 82 q60 14 120 0" stroke="${C.sky}" stroke-width="3"/><g stroke-width="1.600">` + _star(72, 56, 8, 3.6, C.yellow) + _star(134, 60, 6, 2.7, C.pink) + '</g>' },
  arcade:     { name: '游戏机',   type: 'floor', price: 150, w: 100, vb: [100, 170], draw: () => `<path d="M14 166 V40 L26 8 H74 L86 40 V166Z" fill="${C.purple}"/><rect x="28" y="14" width="44" height="18" rx="3" fill="${C.coral}"/><rect x="24" y="44" width="52" height="40" rx="4" fill="#4A4660"/><g stroke-width="1.600">` + _star(50, 64, 12, 5.4, C.yellow) + `</g><path d="M14 96 H86 V114 H14Z" fill="${C.yellow}"/><path d="M34 102 v-11" stroke-width="3.500"/><circle cx="34" cy="89" r="5" fill="${C.red}" stroke-width="1.800"/><circle cx="58" cy="105" r="4.500" fill="${C.blue}" stroke-width="1.600"/><circle cx="72" cy="105" r="4.500" fill="${C.coral}" stroke-width="1.600"/><rect x="38" y="130" width="24" height="12" rx="2" fill="#4A4660"/>` },
  // 货架上的新家具
  slide:      { name: '小滑梯',   type: 'floor', price: 125, w: 190, vb: [190, 140], draw: () => `<path d="M30 136 V30 M58 136 V30 M30 60 H58 M30 86 H58 M30 112 H58" stroke-width="5"/><path d="M22 30 H72" stroke-width="8"/>` + _line2('M66 36 Q122 52 150 112 L182 126', C.coral, 14) },
  chesstable: { name: '小棋桌',   type: 'floor', price: 95,  w: 130, vb: [130, 110], draw: () => `<path d="M24 60 V106 M106 60 V106" stroke-width="5"/><path d="M8 46 L28 30 H102 L122 46Z" fill="${C.cream}"/><path d="M46 30 L36 46 M65 30 V46 M84 30 L94 46 M18 38 H112" stroke-width="1.400"/><rect x="8" y="46" width="114" height="12" rx="3" fill="${C.wood}"/><circle cx="48" cy="16" r="6" fill="${C.white}" stroke-width="1.800"/><path d="M41 34 q7 -16 14 0z" fill="${C.white}" stroke-width="1.800"/><circle cx="84" cy="16" r="6" fill="#5B4636" stroke-width="1.800"/><path d="M77 34 q7 -16 14 0z" fill="#5B4636" stroke-width="1.800"/>` },
  trampoline: { name: '小蹦床',   type: 'floor', price: 115, w: 170, vb: [170, 92],  draw: () => `<path d="M22 44 V86 M148 44 V86 M60 56 V88 M110 56 V88" stroke-width="5"/><ellipse cx="85" cy="40" rx="80" ry="24" fill="${C.blue}"/><ellipse cx="85" cy="40" rx="60" ry="16" fill="#5B4636"/><g transform="translate(85 40) scale(1 .5)" stroke-width="1.600">` + _star(0, 0, 18, 8, C.yellow) + '</g>' },
  trophycase: { name: '奖杯柜',   type: 'floor', price: 130, w: 110, vb: [110, 160], draw: () => `<rect x="6" y="6" width="98" height="150" rx="5" fill="${C.wood}"/><rect x="14" y="14" width="82" height="62" fill="#F3E6C8" stroke-width="1.800"/><rect x="14" y="84" width="82" height="62" fill="#F3E6C8" stroke-width="1.800"/><path d="M44 28 h22 v8 q0 14 -11 16 q-11 -2 -11 -16z" fill="${C.yellow}" stroke-width="1.800"/><path d="M44 32 q-8 0 -6 8 q2 5 8 5 M66 32 q8 0 6 8 q-2 5 -8 5" stroke-width="1.800"/><path d="M55 52 v12 M45 66 h20" stroke-width="3"/><g stroke-width="1.600">` + _star(36, 114, 13, 5.8, C.yellow) + _star(74, 116, 11, 5, C.coral) + '</g>' },
  windchime:  { name: '小风铃',   type: 'wall',  price: 50,  w: 70,  vb: [70, 122],  draw: () => `<path d="M35 2 v10"/><path d="M35 26 v70"/><path d="M35 96 q-9 9 0 20 q9 -11 0 -20z" fill="${C.green}" stroke-width="1.600"/>` + _line2('M16 26 v48', C.sky, 4) + _line2('M26 28 v62', C.sky, 4) + _line2('M44 28 v56', C.sky, 4) + _line2('M54 26 v42', C.sky, 4) + `<ellipse cx="35" cy="19" rx="27" ry="8" fill="${C.wood}"/>` }
});

/* ---------- 第六批旅行目的地（10 个） ---------- */
Object.assign(DESTS, {
  circus:     { name: '马戏团',   time: 210, souv: 'candyapple',  pet: [14, 104, .42] },
  treehouse:  { name: '树屋村',   time: 240, souv: 'nutpie',      pet: [20, 104, .42] },
  clocktower: { name: '大钟楼',   time: 180, souv: 'waffle',      pet: [18, 100, .42] },
  coral:      { name: '珊瑚礁',   time: 270, souv: 'coraljelly',  pet: [108, 56, .42] },
  whale:      { name: '鲸鱼湾',   time: 270, souv: 'whalebread',  pet: [16, 104, .42] },
  flamingo:   { name: '火烈鸟岛', time: 240, souv: 'pinkmilk',    pet: [16, 104, .42] },
  glacier:    { name: '北极冰川', time: 300, souv: 'icemint',     pet: [16, 104, .42] },
  floatisle:  { name: '浮空岛',   time: 300, souv: 'skyfruit',    pet: [108, 33, .42] },
  beefarm:    { name: '蜂蜜农庄', time: 150, souv: 'honeycake',   pet: [16, 104, .42] },
  toyisland:  { name: '玩具岛',   time: 270, souv: 'blockcookie', pet: [108, 104, .42] }
});
Object.assign(SOUVS, {
  candyapple:  { name: '苹果糖',     ic: 'candyapple',  hunger: 12, happy: 20, sweet: 1 },
  nutpie:      { name: '坚果派',     ic: 'nutpie',      hunger: 26, energy: 8 },
  waffle:      { name: '奶油华夫饼', ic: 'waffle',      hunger: 22, happy: 12 },
  coraljelly:  { name: '珊瑚软糖',   ic: 'coraljelly',  hunger: 6,  happy: 24, sweet: 1 },
  whalebread:  { name: '鲸鱼面包',   ic: 'whalebread',  hunger: 32, happy: 6 },
  pinkmilk:    { name: '草莓牛奶',   ic: 'pinkmilk',    drink: true, thirst: 28, happy: 14 },
  icemint:     { name: '冰川薄荷糖', ic: 'icemint',     thirst: 10, happy: 16, energy: 10 },
  skyfruit:    { name: '浮空果',     ic: 'skyfruit',    hunger: 14, thirst: 14, energy: 12 },
  honeycake:   { name: '蜂蜜蛋糕',   ic: 'honeycake',   hunger: 24, happy: 14 },
  blockcookie: { name: '积木饼干',   ic: 'blockcookie', hunger: 20, happy: 14 }
});
Object.assign(CARD_BG, {
  circus(r) {
    return `<rect width="300" height="200" fill="${r ? '#3E4A7A' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[20, 20], [60, 44], [110, 16], [282, 28], [250, 76]], 1.800, '#FFF6C9') + _burst(46, 62, C.yellow, .8) + _burst(274, 50, C.pink, .6) : `<circle cx="46" cy="36" r="15" fill="#F3D98B"/>`}
      ${_hill('M0 126 Q150 108 300 122 V200 H0Z', '#CFE0B6')}
      <path d="M170 40 v-22 l15 6 l-15 6" fill="${C.yellow}" stroke-width="1.600"/>
      <rect x="98" y="98" width="144" height="58" fill="${C.cream}"/><path d="M118 98 v58 M146 98 v58 M194 98 v58 M222 98 v58" stroke="${C.red}" stroke-width="9"/><rect x="98" y="98" width="144" height="58"/>
      <path d="M84 100 L170 40 L256 100Z" fill="${C.red}"/><path d="M170 44 L143 97 M170 44 L197 97 M170 44 L114 97 M170 44 L226 97" stroke="${C.cream}" stroke-width="8"/><path d="M84 100 L170 40 L256 100Z"/>
      <path d="M156 156 v-32 q14 -14 28 0 v32z" fill="#5B4636"/>
      ${_hill('M0 156 Q150 144 300 154 V200 H0Z', '#A9C987')}
      <circle cx="268" cy="180" r="13" fill="${C.blue}"/><g stroke-width="1.400">${_star(268, 180, 7, 3.2, C.yellow)}</g>
      ${r ? `<path d="M118 180 q-4 12 2 22 M136 184 q-4 10 2 18" stroke-width="1.400"/><ellipse cx="118" cy="170" rx="9" ry="11" fill="${C.coral}" stroke-width="1.800"/><ellipse cx="136" cy="174" rx="9" ry="11" fill="${C.yellow}" stroke-width="1.800"/>` : ''}`;
  },
  treehouse(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 60 : 50}" cy="${r ? 58 : 34}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 130 Q150 112 300 126 V200 H0Z', '#CFE0B6')}
      <path d="M186 206 Q190 150 180 100 H224 Q214 150 220 206Z" fill="${C.dwood}"/>
      <path d="M202 112 Q110 114 116 56 Q124 4 202 14 Q280 4 288 56 Q294 114 202 112Z" fill="${C.green}"/>
      <path d="M140 40 q8 -10 18 0 M240 34 q8 -10 18 0 M256 70 q8 -10 18 0 M130 78 q8 -10 18 0" stroke="${C.dgreen}" stroke-width="2"/>
      <rect x="172" y="64" width="60" height="40" fill="${C.cream}"/><path d="M164 66 L202 38 L240 66Z" fill="${C.coral}"/><rect x="193" y="76" width="18" height="16" fill="${r ? C.yellow : C.sky}" stroke-width="1.600"/>
      <path d="M158 104 H246" stroke-width="5"/>
      <path d="M148 204 L168 106 M166 204 L186 106" stroke-width="3"/><path d="M152 184 h17 M156 164 h17 M160 144 h17 M164 124 h17" stroke-width="2"/>
      ${_hill('M0 164 Q150 150 300 162 V200 H0Z', '#A9C987')}
      ${r ? `<circle cx="150" cy="96" r="5" fill="${C.yellow}" stroke-width="1.400"/><circle cx="254" cy="96" r="5" fill="${C.yellow}" stroke-width="1.400"/><circle cx="118" cy="182" r="6" fill="${C.pink}" stroke-width="1.800"/><circle cx="262" cy="186" r="6" fill="${C.yellow}" stroke-width="1.800"/>` : ''}`;
  },
  clocktower(r) {
    const house = (x, w, h, c) => `<rect x="${x}" y="${160 - h}" width="${w}" height="${h}" fill="${C.cream}"/><path d="M${x - 5} ${160 - h} L${x + w / 2} ${138 - h} L${x + w + 5} ${160 - h}Z" fill="${c}"/><rect x="${x + w / 2 - 6}" y="${172 - h}" width="12" height="12" fill="${r ? C.yellow : C.sky}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#4A5680' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[24, 22], [70, 40], [130, 20], [270, 34], [150, 60]], 1.800, '#FFF6C9') + `<path d="M256 30 A13 13 0 1 0 270 50 A10 10 0 0 1 256 30Z" fill="#FFF6C9"/>` : `<circle cx="52" cy="34" r="15" fill="#F3D98B"/>`}
      ${house(106, 46, 44, C.coral)}${house(240, 52, 54, C.purple)}
      <rect x="176" y="52" width="48" height="108" fill="#E9E0CF"/><path d="M170 54 L200 14 L230 54Z" fill="${C.blue}"/>
      <circle cx="200" cy="80" r="15" fill="${r ? '#FFF6C9' : '#fff'}"/><path d="M200 80 v-10 M200 80 l7 4" stroke-width="2"/>
      <path d="M190 160 v-24 a10 10 0 0 1 20 0 v24z" fill="${C.dwood}"/><path d="M188 110 h24" stroke-width="2"/>
      <rect x="-6" y="160" width="312" height="46" fill="#D8D2C2"/>
      <path d="M20 174 h22 M70 186 h24 M130 176 h22 M210 184 h24 M262 174 h22 M160 192 h22" stroke="#B5B1A6" stroke-width="2"/>
      <path d="M118 182 q5 -6 10 0 l5 -2 l-3 5 q-6 4 -12 -3z M252 190 q5 -6 10 0 l5 -2 l-3 5 q-6 4 -12 -3z" fill="#B8BCC0" stroke-width="1.400"/>`;
  },
  coral(r) {
    const br = (x, y, s, c) => _line2(`M${x} ${y} v${-34 * s} M${x} ${y - 14 * s} q${-12 * s} ${-4 * s} ${-12 * s} ${-18 * s} M${x} ${y - 20 * s} q${12 * s} ${-4 * s} ${13 * s} ${-20 * s}`, c, 5);
    return `<rect width="300" height="200" fill="#9CCBD9" stroke="none"/>
      ${r ? `<path d="M40 -6 L90 206 H130 L70 -6Z M150 -6 L190 206 H236 L186 -6Z" fill="#fff" opacity=".18" stroke="none"/>` : ''}
      <circle cx="60" cy="50" r="5" stroke="#fff" stroke-width="1.600"/><circle cx="70" cy="30" r="3" stroke="#fff" stroke-width="1.600"/><circle cx="246" cy="30" r="4" stroke="#fff" stroke-width="1.600"/><circle cx="210" cy="78" r="3" stroke="#fff" stroke-width="1.600"/>
      ${_fish(50, 96, C.orange)}${_fish(250, 60, C.yellow)}${_fish(226, 118, C.coral)}
      <path d="M200 196 q-8 -20 0 -36 q8 -16 0 -30 M214 196 q8 -18 0 -30" stroke="${C.dgreen}" stroke-width="4"/>
      ${_hill('M0 168 Q80 152 160 166 T300 160 V200 H0Z', C.sand)}
      ${br(40, 178, 1.2, C.coral)}${br(84, 186, .8, C.pink)}${br(240, 180, 1.2, C.purple)}${br(276, 188, .8, C.coral)}
      <g stroke-width="1.600">${_star(150, 186, 9, 4, C.yellow)}</g>
      ${r ? `<path d="M40 146 l-9 6 M70 150 l7 7" stroke="${C.line}" stroke-width="8"/><path d="M40 146 l-9 6 M70 150 l7 7" stroke="#C3D69B" stroke-width="5"/><circle cx="82" cy="134" r="7.500" fill="#C3D69B"/><circle cx="85" cy="132" r="1.400" fill="${C.line}" stroke="none"/><ellipse cx="58" cy="138" rx="20" ry="13" fill="#9DBB7A"/><path d="M46 134 l8 8 M58 126 v24 M70 134 l-8 8" stroke-width="1.400"/>` : ''}`;
  },
  whale(r) {
    const sea = r ? '#8FB0C4' : '#A9CDD9';
    return `<rect width="300" height="200" fill="${r ? '#F6D3B0' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 60 : 56}" cy="${r ? 84 : 34}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <rect y="112" width="300" height="88" fill="${sea}" stroke="none"/><path d="M0 112 H300" stroke-width="1.600"/>
      ${r ? `<path d="M86 114 q-2 -18 -16 -22 q10 -2 16 6 q6 -8 16 -6 q-14 4 -16 22z" fill="#7FA3BF" stroke-width="1.800"/>` : ''}
      <path d="M196 100 q-4 -22 -18 -26 M196 100 q0 -24 4 -32 M196 100 q6 -20 20 -24" stroke="${C.blue}" stroke-width="3.500"/>
      <path d="M146 146 Q146 104 198 102 Q250 102 262 136 L292 114 V166 L262 150 Q250 178 198 178 Q146 178 146 146Z" fill="#7FA3BF"/>
      <path d="M153 160 Q198 186 252 164" stroke="${C.cream}" stroke-width="7"/><circle cx="168" cy="138" r="2.400" fill="${C.line}" stroke="none"/><path d="M154 150 q8 5 16 2" stroke-width="1.800"/>
      <rect x="120" y="172" width="186" height="34" fill="${sea}" stroke="none"/>
      <path d="M124 172 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#fff" stroke-width="3"/>
      <path d="M150 190 q8 -5 16 0 M230 192 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <path d="M-6 206 V152 Q50 140 106 162 Q122 188 114 206Z" fill="${C.sand}"/>`;
  },
  flamingo(r) {
    const p = '#F2A7B0';
    const fl = (x, y, s, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M0 0 v34 M6 2 v32" stroke="${C.coral}" stroke-width="2"/><ellipse cx="2" cy="-8" rx="16" ry="11" fill="${p}"/>` + _line2('M12 -12 q10 -10 4 -22 q-6 -8 4 -14', p, 4) + `<circle cx="22" cy="-50" r="5.500" fill="${p}"/><path d="M26 -51 l9 3 l-8 3z" fill="#5B4636" stroke-width="1"/></g>`;
    return `<rect width="300" height="200" fill="${r ? '#F9D3C8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 150 : 60}" cy="${r ? 84 : 34}" r="${r ? 28 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 108 Q60 90 120 106 T300 98 V200 H0Z', '#CFE0B6')}
      <rect y="120" width="300" height="80" fill="#BFE3E0" stroke="none"/><path d="M0 120 H300" stroke-width="1.600"/>
      <path d="M150 140 q8 -5 16 0 M250 186 q8 -5 16 0 M196 194 q8 -5 16 0 M130 176 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      ${fl(172, 150, 1, false)}${fl(232, 142, .8, true)}${fl(270, 158, .9, false)}${r ? fl(128, 136, .6, true) : ''}
      <path d="M-6 206 V152 Q50 140 106 162 Q122 188 114 206Z" fill="${C.sand}"/>
      <path d="M8 160 q-6 -40 6 -70" stroke="${C.line}" stroke-width="9"/><path d="M8 160 q-6 -40 6 -70" stroke="${C.dwood}" stroke-width="5"/>
      <path d="M14 90 q-22 -10 -30 5 q16 -5 30 -5z M14 90 q-8 -20 -25 -17 q13 5 25 17z M14 90 q18 -12 30 2 q-17 -4 -30 -2z M14 90 q10 -18 26 -14 q-14 4 -26 14z" fill="${C.green}" stroke-width="1.800"/>`;
  },
  glacier(r) {
    const berg = (x, y, s) => `<path d="M${x - 40 * s} ${y} L${x - 22 * s} ${y - 46 * s} L${x - 4 * s} ${y - 28 * s} L${x + 12 * s} ${y - 62 * s} L${x + 40 * s} ${y}Z" fill="${C.white}"/><path d="M${x - 22 * s} ${y - 46 * s} L${x - 14 * s} ${y} M${x + 12 * s} ${y - 62 * s} L${x + 16 * s} ${y}" stroke="#C9D8E6" stroke-width="2"/>`;
    const w = '#FBF6EA';
    return `<rect width="300" height="200" fill="${r ? '#2E3A66' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[24, 18], [80, 30], [140, 14], [270, 22], [200, 34]], 1.800, '#FFF6C9') + `<path d="M-10 70 Q60 24 130 60 T320 46" stroke="#9BE0B8" stroke-width="14" opacity=".55"/>` : `<circle cx="52" cy="34" r="15" fill="#F3D98B"/>`}
      <rect y="112" width="300" height="88" fill="${r ? '#56628C' : '#A9CDD9'}" stroke="none"/><path d="M0 112 H300" stroke-width="1.600"/>
      ${berg(112, 118, .7)}${berg(214, 126, 1.1)}
      <path d="M130 150 q8 -5 16 0 M150 190 q8 -5 16 0 M270 150 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <ellipse cx="228" cy="180" rx="58" ry="13" fill="${C.white}"/>
      <rect x="208" y="166" width="10" height="13" rx="4" fill="${w}" stroke-width="1.800"/><rect x="234" y="166" width="10" height="13" rx="4" fill="${w}" stroke-width="1.800"/>
      <circle cx="246" cy="143" r="4" fill="${w}" stroke-width="1.800"/><circle cx="258" cy="143" r="4" fill="${w}" stroke-width="1.800"/>
      <ellipse cx="226" cy="160" rx="25" ry="14" fill="${w}"/><circle cx="252" cy="152" r="11" fill="${w}"/>
      <circle cx="261" cy="154" r="2" fill="${C.line}" stroke="none"/><circle cx="254" cy="149" r="1.400" fill="${C.line}" stroke="none"/>
      <path d="M-6 206 V160 Q40 148 108 158 L122 178 Q90 198 60 206Z" fill="${C.white}"/>`;
  },
  floatisle(r) {
    const isle = (x, y, s) => `<path d="M${x - 40 * s} ${y} H${x + 40 * s} Q${x + 30 * s} ${y + 26 * s} ${x} ${y + 34 * s} Q${x - 30 * s} ${y + 26 * s} ${x - 40 * s} ${y}Z" fill="${C.dwood}"/><path d="M${x - 44 * s} ${y + 1} Q${x} ${y - 14 * s} ${x + 44 * s} ${y + 1} Q${x} ${y + 8 * s} ${x - 44 * s} ${y + 1}Z" fill="${C.green}"/>`;
    const cl = (x, y, s) => `<path d="M${x} ${y} a${8 * s} ${8 * s} 0 0 1 ${2 * s} -${16 * s} a${11 * s} ${11 * s} 0 0 1 ${21 * s} -${s} a${8.5 * s} ${8.5 * s} 0 0 1 ${s} ${17 * s}z" fill="#fff"/>`;
    return `<rect width="300" height="200" fill="${r ? '#EDE4F5' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 262 : 258}" cy="${r ? 150 : 150}" r="${r ? 18 : 14}" fill="${r ? C.yellow : '#F3D98B'}"/>
      ${r ? _arcBow(60, 150, 70) + _dots([[30, 30], [120, 20], [210, 34], [280, 90]], 2.200, C.yellow) : ''}
      ${isle(40, 66, .6)}${isle(266, 56, .5)}
      ${_line2('M214 124 V194', C.sky, 6)}
      ${isle(150, 118, 2)}
      <path d="M196 110 v-24" stroke-width="4"/><circle cx="196" cy="76" r="14" fill="${C.lgreen}"/><path d="M188 74 q8 -8 16 0" stroke="${C.dgreen}" stroke-width="2"/>
      <path d="M84 112 l-3 -8 M84 112 l0 -10 M84 112 l3 -8" stroke="${C.dgreen}" stroke-width="2"/>
      ${cl(-10, 204, 2.2)}${cl(196, 206, 2.4)}${cl(90, 208, 1.6)}`;
  },
  beefarm(r) {
    const hive = (x, y, c) => `<path d="M${x + 6} ${y + 36} v10 M${x + 34} ${y + 36} v10" stroke-width="3"/><rect x="${x}" y="${y}" width="40" height="18" fill="${c}"/><rect x="${x}" y="${y + 18}" width="40" height="18" fill="${C.cream}"/><path d="M${x - 4} ${y} h48" stroke-width="5"/><path d="M${x + 14} ${y + 29} h12" stroke-width="3"/>`;
    const bee = (x, y) => `<ellipse cx="${x - 3}" cy="${y - 5}" rx="4" ry="3" fill="#fff" stroke-width="1"/><ellipse cx="${x}" cy="${y}" rx="6" ry="4.500" fill="${C.yellow}" stroke-width="1.400"/><path d="M${x - 1} ${y - 4} v8 M${x + 2.5} ${y - 3.5} v7" stroke-width="1.400"/>`;
    let fl = '';
    for (let x = 110; x < 300; x += 22) fl += `<path d="M${x} 196 v-12" stroke="${C.dgreen}" stroke-width="2.200"/><circle cx="${x}" cy="${182 - (x % 3) * 2}" r="5" fill="${[C.pink, C.yellow, C.purple][x % 3]}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 60 : 52}" cy="${r ? 58 : 34}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 116 Q150 96 300 112 V200 H0Z', '#CFE0B6')}
      <path d="M270 112 v-30" stroke-width="5"/><circle cx="270" cy="70" r="20" fill="${C.green}"/>
      ${_hill('M0 150 Q150 136 300 148 V200 H0Z', '#A9C987')}
      ${hive(130, 112, C.yellow)}${hive(184, 106, C.blue)}${hive(238, 114, C.coral)}
      ${bee(120, 90)}${bee(176, 76)}${bee(226, 92)}${r ? bee(150, 60) + bee(206, 54) + bee(262, 70) : ''}
      ${fl}
      ${r ? `<rect x="100" y="160" width="10" height="5" rx="2" fill="${C.wood}" stroke-width="1.400"/><path d="M96 165 h18 q4 4 4 10 v14 q0 5 -5 5 h-16 q-5 0 -5 -5 v-14 q0 -6 4 -10z" fill="${C.yellow}" stroke-width="1.800"/>` : ''}`;
  },
  toyisland(r) {
    const b = '#CFA06C';
    return `<rect width="300" height="200" fill="${r ? '#EDE4F5' : '#DCECE6'}" stroke="none"/>
      <circle cx="56" cy="34" r="15" fill="#F3D98B"/>
      ${r ? `<path d="M150 62 q-4 14 2 28 M172 54 q-4 14 2 30 M128 58 q-4 14 2 28" stroke-width="1.400"/><ellipse cx="150" cy="50" rx="10" ry="12" fill="${C.coral}" stroke-width="1.800"/><ellipse cx="172" cy="42" rx="10" ry="12" fill="${C.blue}" stroke-width="1.800"/><ellipse cx="128" cy="46" rx="10" ry="12" fill="${C.yellow}" stroke-width="1.800"/>` : `<path d="M110 50 a8 8 0 0 1 2 -16 a11 11 0 0 1 21 -1 a8.500 8.500 0 0 1 1 17z" fill="#fff"/>`}
      <rect y="118" width="300" height="82" fill="#A9CDD9" stroke="none"/><path d="M0 118 H300" stroke-width="1.600"/>
      <path d="M-6 206 Q10 142 150 138 Q290 142 306 206Z" fill="#F6E7B4"/>
      <rect x="196" y="114" width="34" height="34" rx="3" fill="${C.coral}"/><rect x="230" y="114" width="34" height="34" rx="3" fill="${C.blue}"/><rect x="213" y="80" width="34" height="34" rx="3" fill="${C.yellow}"/>
      <g stroke-width="1.400">${_star(230, 97, 9, 4, C.white)}</g><circle cx="213" cy="131" r="7" fill="${C.white}" stroke-width="1.600"/><path d="M240 124 h14 v14 h-14z" fill="${C.white}" stroke-width="1.600"/>
      <circle cx="46" cy="106" r="6.500" fill="${b}"/><circle cx="74" cy="106" r="6.500" fill="${b}"/>
      <ellipse cx="60" cy="152" rx="22" ry="20" fill="${b}"/><ellipse cx="60" cy="156" rx="12" ry="11" fill="#F3E3C4" stroke="none"/>
      <circle cx="60" cy="120" r="17" fill="${b}"/><path d="M54 118 v.100 M66 118 v.100" stroke-width="3"/><ellipse cx="60" cy="126" rx="5" ry="3.500" fill="#F3E3C4" stroke-width="1.400"/>
      <circle cx="268" cy="180" r="12" fill="${C.white}"/><path d="M256 180 h24 M268 168 v24" stroke="${C.red}" stroke-width="3"/><circle cx="268" cy="180" r="12"/>`;
  }
});

/* ==========================================================
 *  第八批：又六只宠物、十个景点（地图往南扩了一截）
 * ========================================================== */
Object.assign(PETS, {
  squirrel: { name: '小松鼠', defName: '果果', desc: '大尾巴像小毯子',   fav: 'nut',    talent: '翻跟头', talentIcon: 'sparkle', trick: 'trick-flip', eyes: [78, 122, 86],  hat: [100, 46] },
  lion:     { name: '小狮子', defName: '阿毛', desc: '一头蓬蓬的鬃毛',   fav: 'pizza',  talent: '转圈圈', talentIcon: 'sparkle', trick: 'trick-spin', eyes: [80, 120, 86],  hat: [100, 34] },
  cow:      { name: '小奶牛', defName: '朵朵', desc: '身上有朵朵花斑',   fav: 'cheese', talent: '打滚',   talentIcon: 'sparkle', trick: 'trick-roll', eyes: [78, 122, 84],  hat: [100, 44] },
  chick:    { name: '小鸡',   defName: '叽叽', desc: '毛茸茸的小黄球',   fav: 'corn',   talent: '蹦蹦跳', talentIcon: 'sparkle', trick: 'trick-jump', eyes: [78, 122, 106], hat: [100, 62] },
  seal:     { name: '小海豹', defName: '滑滑', desc: '圆滚滚爱晒太阳',   fav: 'fish',   talent: '打滚',   talentIcon: 'sparkle', trick: 'trick-roll', eyes: [78, 122, 88],  hat: [100, 38] },
  raccoon:  { name: '小浣熊', defName: '团子', desc: '戴着小眼罩的淘气包', fav: 'cookie', talent: '翻跟头', talentIcon: 'sparkle', trick: 'trick-flip', eyes: [78, 122, 86],  hat: [100, 46] }
});
Object.assign(PET_DRAW, {
  squirrel(m) {
    const e = PETS.squirrel.eyes, b = '#C9895A', f = '#F6E3C7';
    return `
      <path class="tail" d="M132 172 Q192 178 186 112 Q182 72 150 82 Q134 90 144 108 Q158 104 158 126 Q156 154 132 172Z" fill="${b}"/>
      <ellipse cx="100" cy="152" rx="40" ry="33" fill="${b}"/>
      <ellipse cx="100" cy="160" rx="23" ry="21" fill="${f}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${f}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${f}"/>
      <path d="M62 62 L54 20 L88 44Z" fill="${b}"/><path d="M138 62 L146 20 L112 44Z" fill="${b}"/>
      <ellipse cx="100" cy="90" rx="50" ry="44" fill="${b}"/>
      <ellipse cx="100" cy="109" rx="30" ry="18" fill="${f}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(60, 140, 104)}
      <ellipse cx="100" cy="100" rx="5.500" ry="4" fill="${C.coral}" stroke="none"/>
      ${_mouth(100, 105, m)}`;
  },
  lion(m) {
    const e = PETS.lion.eyes, o = '#EDC06B', mn = '#C9803E';
    let mane = '';
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; mane += `<circle cx="${(100 + 49 * Math.cos(a)).toFixed(1)}" cy="${(86 + 45 * Math.sin(a)).toFixed(1)}" r="16" fill="${mn}"/>`; }
    return `
      <path class="tail" d="M138 162 q36 -6 32 -42" stroke="${C.line}" stroke-width="13"/><path class="tail" d="M138 162 q36 -6 32 -42" stroke="${o}" stroke-width="7.500"/>
      <ellipse cx="100" cy="152" rx="42" ry="34" fill="${o}"/>
      <ellipse cx="100" cy="160" rx="24" ry="21" fill="${C.cream}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${o}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${o}"/>
      ${mane}<ellipse cx="100" cy="86" rx="50" ry="46" fill="${mn}" stroke="none"/>
      <circle cx="66" cy="52" r="11" fill="${o}"/><circle cx="134" cy="52" r="11" fill="${o}"/>
      <ellipse cx="100" cy="90" rx="42" ry="39" fill="${o}"/>
      <ellipse cx="100" cy="107" rx="19" ry="14" fill="${C.cream}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(66, 134, 102)}
      <path d="M94 98 h12 l-6 7z" fill="${C.coral}" stroke-width="2"/>
      ${_mouth(100, 105, m)}`;
  },
  cow(m) {
    const e = PETS.cow.eyes, w = '#FDF8F0', k = '#5B4636';
    return `
      <path class="tail" d="M140 160 q22 -4 24 -32" stroke-width="4.500"/>
      <ellipse cx="100" cy="150" rx="45" ry="36" fill="${w}"/>
      <path d="M66 138 q14 -10 24 4 q-4 16 -22 10q-6 -6 -2 -14z M118 158 q14 -6 20 6 q-6 12 -20 6z" fill="${k}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${k}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${k}"/>
      <path d="M72 52 q-12 -14 -4 -26 q8 8 14 20z M128 52 q12 -14 4 -26 q-8 8 -14 20z" fill="#EADFC8"/>
      <ellipse cx="48" cy="76" rx="17" ry="9" fill="${w}" transform="rotate(-20 48 76)"/><ellipse cx="152" cy="76" rx="17" ry="9" fill="${w}" transform="rotate(20 152 76)"/>
      <ellipse cx="100" cy="88" rx="50" ry="44" fill="${w}"/>
      <path d="M110 45 Q142 47 148 70 Q132 73 121 63 Q112 55 110 45Z" fill="${k}" stroke="none"/>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(54, 146, 98)}
      <ellipse cx="100" cy="110" rx="28" ry="18" fill="#F6C9C4"/><path d="M90 106 v.100 M110 106 v.100" stroke-width="5"/>
      ${_mouth(100, 111, m)}`;
  },
  chick(m) {
    const e = PETS.chick.eyes, y = '#F6D76B', d = '#EBC04A';
    const beak = m === 'eat'
      ? `<path d="M90 112 L110 112 L100 119Z" fill="${C.orange}"/><path d="M92 123 L108 123 L100 133Z" fill="${C.orange}"/>`
      : `<path d="M90 114 L110 114 L100 128Z" fill="${C.orange}"/>`;
    return `
      <path d="M84 172 v12 m-8 0 h16 M116 172 v12 m-8 0 h16" stroke="#C98A3C" stroke-width="4.500"/>
      <path d="M98 64 q-12 -16 -4 -28 q6 8 4 28z M102 64 q6 -20 20 -20 q-4 12 -20 20z" fill="${y}"/>
      <ellipse cx="100" cy="120" rx="60" ry="58" fill="${y}"/>
      <g transform="rotate(18 42 128)"><ellipse class="wing wl" cx="42" cy="128" rx="13" ry="24" fill="${d}"/></g>
      <g transform="rotate(-18 158 128)"><ellipse class="wing wr" cx="158" cy="128" rx="13" ry="24" fill="${d}"/></g>
      ${_eye(e[0], e[2], m)}${_eye(e[1], e[2], m)}${_blush(58, 142, 124)}${beak}`;
  },
  seal(m) {
    const e = PETS.seal.eyes, g = '#C9D3DB', d = '#A9B6C2', f = '#EEF2F4';
    return `
      <path class="tail" d="M128 178 q24 -4 32 -20 q6 18 -8 26 q-14 4 -24 -6z" fill="${d}"/>
      <path d="M100 34 Q156 36 158 110 Q160 184 100 184 Q40 184 42 110 Q44 36 100 34Z" fill="${g}"/>
      <ellipse cx="100" cy="148" rx="34" ry="29" fill="${f}" stroke="none"/>
      <path d="M46 126 q-20 8 -22 28 q18 0 28 -12z" fill="${d}"/><path d="M154 126 q20 8 22 28 q-18 0 -28 -12z" fill="${d}"/>
      ${_eye(e[0], e[2], m, 7)}${_eye(e[1], e[2], m, 7)}${_blush(58, 142, 106)}
      <ellipse cx="89" cy="109" rx="12" ry="8.500" fill="${f}" stroke-width="1.800"/><ellipse cx="111" cy="109" rx="12" ry="8.500" fill="${f}" stroke-width="1.800"/>
      <ellipse cx="100" cy="102" rx="6.500" ry="4.500" fill="${C.line}" stroke="none"/>
      <path d="M76 108 l-16 -3 M76 112 l-16 4 M124 108 l16 -3 M124 112 l16 4" stroke-width="1.600"/>
      ${_mouth(100, 114, m)}`;
  },
  raccoon(m) {
    const e = PETS.raccoon.eyes, g = '#ADA69E', k = '#5B4636', f = '#F3EEE4';
    const tail = 'M136 166 q44 -4 40 -54';
    return `
      <path class="tail" d="${tail}" stroke="${C.line}" stroke-width="21"/><path class="tail" d="${tail}" stroke="${g}" stroke-width="15"/><path class="tail" d="${tail}" stroke="${k}" stroke-width="15" stroke-dasharray="9 13" stroke-linecap="butt"/>
      <ellipse cx="100" cy="152" rx="42" ry="34" fill="${g}"/>
      <ellipse cx="100" cy="160" rx="24" ry="21" fill="${f}" stroke="none"/>
      <ellipse cx="80" cy="182" rx="14" ry="8" fill="${k}"/><ellipse cx="120" cy="182" rx="14" ry="8" fill="${k}"/>
      <path d="M58 64 L52 24 L90 46Z" fill="${g}"/><path d="M62 54 L59 34 L78 46Z" fill="${k}" stroke="none"/>
      <path d="M142 64 L148 24 L110 46Z" fill="${g}"/><path d="M138 54 L141 34 L122 46Z" fill="${k}" stroke="none"/>
      <ellipse cx="100" cy="90" rx="54" ry="46" fill="${g}"/>
      <path d="M48 84 Q60 64 84 71 Q100 82 116 71 Q140 64 152 84 Q142 106 118 101 Q100 93 82 101 Q58 106 48 84Z" fill="${k}" stroke="none"/>
      <circle cx="${e[0]}" cy="${e[2]}" r="9.500" fill="#fff" stroke="none"/><circle cx="${e[1]}" cy="${e[2]}" r="9.500" fill="#fff" stroke="none"/>
      ${_eye(e[0], e[2], m, 5)}${_eye(e[1], e[2], m, 5)}
      <ellipse cx="100" cy="113" rx="22" ry="15" fill="${f}" stroke="none"/>${_blush(56, 144, 112)}
      <ellipse cx="100" cy="105" rx="6" ry="4.500" fill="${k}" stroke="none"/>
      ${_mouth(100, 110, m)}`;
  }
});

Object.assign(ICONS, {
  wand: `<path d="M10 42 L30 16" stroke-width="4"/><g stroke-width="1.600">` + _star(34, 12, 10, 4.5, C.yellow) + '</g>' + _dots([[16, 14], [42, 28], [22, 6]], 1.800, C.yellow),
  berryjam: `<rect x="14" y="5" width="20" height="7" rx="2" fill="${C.red}"/><path d="M12 12 h24 q4 4 4 10 v16 q0 6 -6 6 h-20 q-6 0 -6 -6 v-16 q0 -6 4 -10z" fill="#E88A8A"/><rect x="14" y="22" width="20" height="13" rx="2" fill="${C.cream}" stroke-width="1.400"/><circle cx="24" cy="28.500" r="3.600" fill="${C.red}" stroke="none"/>`,
  kitecookie: `<path d="M24 4 L40 22 L24 40 L8 22Z" fill="#E9B96E"/><path d="M24 4 V40 M8 22 H40" stroke-width="1.500"/><path d="M24 40 q-6 2 -4 6 M24 40 q6 2 4 6" stroke="${C.coral}" stroke-width="2"/>`,
  hotchoco: `<path d="M17 10 q-3 -3 0 -6 M27 10 q-3 -3 0 -6" stroke-width="1.800"/><path d="M36 22 q9 0 8 8 q-1 6 -8 5"/><path d="M8 16 h28 v20 q0 6 -6 6 h-16 q-6 0 -6 -6z" fill="${C.coral}"/><ellipse cx="22" cy="17" rx="13.500" ry="3" fill="#8C5A44" stroke-width="1.400"/><circle cx="18" cy="16.500" r="2.600" fill="#fff" stroke="none"/><circle cx="25" cy="17.500" r="2.200" fill="#fff" stroke="none"/>`,
  starpie: `<path d="M4 30 Q4 15 24 15 Q44 15 44 30Z" fill="#3E4A7A"/><g stroke-width="1.200">` + _star(16, 24, 4, 1.8, C.yellow) + _star(27, 21, 5, 2.2, C.yellow) + _star(36, 26, 3.500, 1.600, C.yellow) + `</g><path d="M2 30 h44 l-4 10 h-36z" fill="#E2B877"/>`,
  magicbean: `<ellipse cx="15" cy="30" rx="9" ry="12" fill="${C.purple}" transform="rotate(-20 15 30)"/><ellipse cx="33" cy="30" rx="9" ry="12" fill="#9BE0B8" transform="rotate(20 33 30)"/><ellipse cx="24" cy="18" rx="9" ry="12" fill="${C.yellow}"/><path d="M21 13 q2 -4 5 -4" stroke="#fff" stroke-width="2"/>` + _dots([[8, 10], [40, 12], [24, 42]], 1.600, C.yellow),
  fishcracker: `<path d="M4 24 Q14 10 28 16 L40 9 V39 L28 32 Q14 38 4 24Z" fill="#E9B96E"/><circle cx="12" cy="22" r="1.800" fill="${C.line}" stroke="none"/><path d="M18 27 q4 3 8 0" stroke-width="1.400"/>` + _dots([[20, 20], [30, 24], [34, 18], [34, 30]], 1.300, C.dwood),
  pearlcandy: `<path d="M4 26 Q4 12 24 12 Q44 12 44 26Z" fill="${C.pink}"/><path d="M12 14 l3 12 M24 12 v14 M36 14 l-3 12" stroke-width="1.400"/><path d="M4 26 Q24 46 44 26Z" fill="#F6D3DA"/><circle cx="24" cy="27" r="8" fill="${C.white}"/><path d="M20 24 q2 -3 5 -3" stroke="${C.sky}" stroke-width="2"/>`,
  nutbrittle: `<path d="M5 30 L14 12 H36 L43 28 L34 40 H12Z" fill="#D9A866"/>` + _dots([[16, 20], [26, 18], [34, 24], [20, 30], [30, 33]], 3, '#F3DFC1') + `<path d="M5 30 L14 12 H36 L43 28 L34 40 H12Z"/>`,
  bagel: `<ellipse cx="24" cy="26" rx="20" ry="16" fill="#D9A866"/><ellipse cx="24" cy="24" rx="7" ry="5" fill="${C.cream}" stroke-width="1.800"/>` + _dots([[10, 22], [16, 15], [30, 13], [38, 22], [36, 32], [14, 34], [24, 38]], 1.400, C.cream),
  sparklesoda: `<rect x="19" y="3" width="10" height="6" rx="2" fill="${C.red}"/><path d="M19 9 h10 v7 q6 4 6 12 v13 q0 3 -3 3 h-16 q-3 0 -3 -3 v-13 q0 -8 6 -12z" fill="#CFE0F0"/><rect x="13" y="26" width="22" height="12" fill="#3E4A7A" stroke-width="1.600"/>` + _burst(24, 32, C.yellow, .32)
});

Object.assign(DESTS, {
  berryfarm:   { name: '草莓园',   time: 150, souv: 'berryjam',    pet: [16, 104, .42] },
  kitehill:    { name: '风筝山坡', time: 150, souv: 'kitecookie',  pet: [108, 104, .42] },
  skiresort:   { name: '滑雪场',   time: 270, souv: 'hotchoco',    pet: [16, 104, .42] },
  observatory: { name: '天文台',   time: 300, souv: 'starpie',     pet: [16, 104, .42] },
  magicschool: { name: '魔法学院', time: 300, souv: 'magicbean',   pet: [16, 104, .42] },
  aquarium:    { name: '水族馆',   time: 240, souv: 'fishcracker', pet: [108, 104, .42] },
  pearlbay:    { name: '珍珠湾',   time: 270, souv: 'pearlcandy',  pet: [16, 104, .42] },
  bazaar:      { name: '沙漠集市', time: 240, souv: 'nutbrittle',  pet: [108, 104, .42] },
  bigcity:     { name: '大都市',   time: 210, souv: 'bagel',       pet: [16, 104, .42] },
  fireworks:   { name: '烟花大会', time: 240, souv: 'sparklesoda', pet: [108, 104, .42] }
});
Object.assign(SOUVS, {
  berryjam:    { name: '草莓酱',     ic: 'berryjam',    hunger: 14, happy: 16, sweet: 1 },
  kitecookie:  { name: '风筝饼干',   ic: 'kitecookie',  hunger: 20, happy: 12 },
  hotchoco:    { name: '热巧克力',   ic: 'hotchoco',    drink: true, thirst: 20, happy: 16, energy: 6 },
  starpie:     { name: '星空派',     ic: 'starpie',     hunger: 26, happy: 12 },
  magicbean:   { name: '魔法豆',     ic: 'magicbean',   hunger: 8,  happy: 20, energy: 12 },
  fishcracker: { name: '小鱼饼干',   ic: 'fishcracker', hunger: 22, happy: 10 },
  pearlcandy:  { name: '珍珠糖',     ic: 'pearlcandy',  hunger: 6,  happy: 26, sweet: 1 },
  nutbrittle:  { name: '果仁酥',     ic: 'nutbrittle',  hunger: 24, energy: 10 },
  bagel:       { name: '芝麻贝果',   ic: 'bagel',       hunger: 34 },
  sparklesoda: { name: '烟花汽水',   ic: 'sparklesoda', drink: true, thirst: 28, happy: 16 }
});
Object.assign(CARD_BG, {
  berryfarm(r) {
    let rows = '';
    for (let k = 0; k < 3; k++) for (let x = 112 + k * 8; x < 300; x += 30) { const y = 150 + k * 20; rows += `<path d="M${x - 9} ${y} q9 -12 18 0z" fill="${C.green}" stroke-width="1.600"/><circle cx="${x - 5}" cy="${y + 3}" r="3.500" fill="${C.red}" stroke-width="1.200"/><circle cx="${x + 5}" cy="${y + 4}" r="3" fill="${C.red}" stroke-width="1.200"/>`; }
    return `<rect width="300" height="200" fill="${r ? '#F6DDB8' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 60 : 250}" cy="${r ? 56 : 34}" r="${r ? 24 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      ${_hill('M0 116 Q150 96 300 112 V200 H0Z', '#CFE0B6')}
      <path d="M176 118 V96 Q208 70 240 96 V118Z" fill="#EEF5F4"/><path d="M176 98 H240 M208 80 V118" stroke-width="1.400"/>
      ${_hill('M0 136 Q150 124 300 134 V200 H0Z', '#B5CE92')}
      <path d="M104 148 H306 M104 168 H306 M104 188 H306" stroke="${C.dwood}" stroke-width="2"/>${rows}
      ${r ? `<path d="M118 110 q6 -8 12 0 q6 -8 12 0" stroke-width="2"/><path d="M84 196 h30 l-4 -16 h-22z" fill="${C.wood}"/>` + _dots([[92, 178], [100, 176], [107, 179]], 4, C.red) : ''}`;
  },
  kitehill(r) {
    const kite = (x, y, s, c) => `<path d="M${x} ${y + 16 * s} q${-8 * s} ${14 * s} ${2 * s} ${30 * s}" stroke-width="1.400"/><path d="M${x} ${y - 16 * s} L${x + 12 * s} ${y} L${x} ${y + 16 * s} L${x - 12 * s} ${y}Z" fill="${c}"/><path d="M${x} ${y - 16 * s} V${y + 16 * s} M${x - 12 * s} ${y} H${x + 12 * s}" stroke-width="1.400"/>`;
    return `<rect width="300" height="200" fill="#DCECE6" stroke="none"/>
      <circle cx="52" cy="36" r="15" fill="#F3D98B"/>
      ${r ? _arcBow(210, 150, 100) : `<path d="M196 70 a8 8 0 0 1 2 -16 a11 11 0 0 1 21 -1 a8.500 8.500 0 0 1 1 17z" fill="#fff"/>`}
      ${kite(110, 46, 1.2, C.coral)}${kite(250, 40, 1, C.blue)}${kite(176, 26, .8, C.yellow)}${r ? kite(40, 86, .8, C.purple) + kite(280, 96, .7, C.pink) : ''}
      ${_hill('M0 140 Q80 90 170 120 Q240 140 300 112 V200 H0Z', '#C3D69B')}
      ${_hill('M0 160 Q150 142 300 158 V200 H0Z', '#A9C987')}
      <path d="M30 176 l-3 -8 M30 176 l0 -10 M30 176 l3 -8 M230 186 l-3 -8 M230 186 l0 -10 M230 186 l3 -8 M276 170 l-3 -8 M276 170 l0 -10 M276 170 l3 -8" stroke="${C.dgreen}" stroke-width="2"/>
      <circle cx="210" cy="176" r="5" fill="${C.pink}" stroke-width="1.600"/><circle cx="60" cy="188" r="5" fill="${C.yellow}" stroke-width="1.600"/>`;
  },
  skiresort(r) {
    const pine = (x, y, s) => `<path d="M${x} ${y} v${6 * s}" stroke-width="3"/><path d="M${x - 11 * s} ${y} L${x} ${y - 30 * s} L${x + 11 * s} ${y}Z" fill="#5E8478"/>`;
    const chair = (x, y) => `<path d="M${x} ${y} v12" stroke-width="1.600"/><path d="M${x - 7} ${y + 12} h14 v7 h-14z" fill="${C.coral}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#4A5680' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[30, 20], [90, 30], [150, 14], [270, 26]], 1.800, '#FFF6C9') : `<circle cx="250" cy="34" r="15" fill="#F3D98B"/>`}
      ${_hill('M0 110 L60 60 L120 100 L190 44 L260 96 L300 76 V200 H0Z', r ? '#7C88B0' : '#C9D8E6')}
      <path d="M176 54 L190 44 L204 54 M48 70 L60 60 L72 70" stroke="#fff" stroke-width="3"/>
      <path d="M100 170 L300 60 V200 H100Z" fill="${C.white}" stroke="none"/><path d="M100 170 L300 60" stroke-width="1.600"/>
      <path d="M120 116 L300 32" stroke-width="1.600"/>${chair(160, 97)}${chair(214, 72)}${chair(266, 48)}<path d="M132 150 V110" stroke-width="4"/>
      ${_hill('M-6 150 Q100 136 200 160 L306 150 V206 H-6Z', C.white)}
      <rect x="226" y="140" width="50" height="32" fill="${C.wood}"/><path d="M218 142 L251 118 L284 142Z" fill="${r ? '#E9E0CF' : C.white}"/><rect x="244" y="152" width="14" height="20" fill="${r ? C.yellow : C.dwood}" stroke-width="1.600"/>
      ${pine(120, 186, 1)}${pine(196, 190, .8)}
      <path d="M160 150 l14 8 M178 134 l14 8" stroke="${C.blue}" stroke-width="2"/>`;
  },
  observatory(r) {
    return `<rect width="300" height="200" fill="#2E3A66" stroke="none"/>
      ${_dots([[20, 20], [60, 44], [104, 16], [150, 34], [206, 12], [262, 28], [288, 70], [130, 70], [40, 80]], 1.800, '#FFF6C9')}
      ${r ? `<path d="M210 30 l40 -16 M150 60 l30 -12" stroke="#FFF6C9" stroke-width="2.400"/><circle cx="70" cy="40" r="13" fill="${C.orange}"/><ellipse cx="70" cy="40" rx="24" ry="5.500" stroke="${C.yellow}" stroke-width="3" transform="rotate(-18 70 40)"/>` : `<path d="M60 26 A14 14 0 1 0 76 48 A11 11 0 0 1 60 26Z" fill="#FFF6C9"/>`}
      ${_hill('M0 136 Q110 96 220 116 Q270 124 300 140 V200 H0Z', '#56628C')}
      <rect x="170" y="96" width="76" height="38" fill="#E9E0CF"/><path d="M166 98 A42 42 0 0 1 250 98Z" fill="#D8D2C2"/><path d="M204 57 L226 60 L222 98 H206Z" fill="#3E4A7A"/>
      <path d="M214 76 L246 46" stroke="${C.line}" stroke-width="9"/><path d="M214 76 L246 46" stroke="${C.gray}" stroke-width="5.500"/>
      <rect x="200" y="112" width="14" height="22" fill="${C.dwood}" stroke-width="1.600"/><rect x="178" y="106" width="12" height="10" fill="${C.yellow}" stroke-width="1.400"/><rect x="226" y="106" width="12" height="10" fill="${C.yellow}" stroke-width="1.400"/>
      ${_hill('M0 158 Q150 144 300 156 V200 H0Z', '#6E86A6')}`;
  },
  magicschool(r) {
    const tw = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#D9CCE6"/><path d="M${x - 5} ${y} L${x + w / 2} ${y - w * 1.5} L${x + w + 5} ${y}Z" fill="${c}"/><rect x="${x + w / 2 - 3.5}" y="${y + 12}" width="7" height="11" rx="3.500" fill="${C.yellow}" stroke-width="1.400"/>`;
    return `<rect width="300" height="200" fill="#5A4E86" stroke="none"/>
      ${_dots([[24, 22], [70, 44], [118, 20], [280, 30], [130, 70], [44, 96]], 1.800, '#FFF6C9')}
      <path d="M60 30 A15 15 0 1 0 78 54 A12 12 0 0 1 60 30Z" fill="#FFF6C9"/>
      ${r ? _burst(110, 50, C.yellow, .5) + _burst(276, 80, C.pink, .5) + `<path d="M130 100 v10 M146 84 v10 M286 110 v10" stroke="${C.cream}" stroke-width="4"/>` + _dots([[130, 97], [146, 81], [286, 107]], 3, C.yellow) : ''}
      ${_hill('M0 140 Q120 108 220 120 Q270 126 300 142 V200 H0Z', '#7C6BA6')}
      <rect x="170" y="96" width="92" height="46" fill="#D9CCE6"/>
      ${tw(160, 84, 22, 58, '#3E4A7A')}${tw(250, 84, 22, 58, '#3E4A7A')}${tw(200, 58, 30, 84, C.coral)}
      <g stroke-width="1.400">${_star(215, 8, 6, 2.700, C.yellow)}</g>
      <path d="M204 142 v-22 a11 11 0 0 1 22 0 v22z" fill="${C.dwood}"/>
      ${_hill('M0 160 Q150 146 300 158 V200 H0Z', '#8E7DB8')}`;
  },
  aquarium(r) {
    const jelly = (x, y, c) => `<path d="M${x - 10} ${y} q-2 14 2 20 M${x} ${y} v22 M${x + 10} ${y} q2 14 -2 20" stroke="${c}" stroke-width="2"/><path d="M${x - 14} ${y} a14 13 0 0 1 28 0z" fill="${c}" stroke-width="1.800"/>`;
    return `<rect width="300" height="200" fill="#E9E0CF" stroke="none"/>
      <rect x="14" y="14" width="272" height="130" rx="10" fill="#8FC4D4"/>
      <path d="M24 30 h60 M24 40 h30" stroke="#fff" stroke-width="3" opacity=".7"/>
      ${_fish(60, 70, C.orange)}${_fish(110, 44, C.yellow)}${_fish(236, 96, C.coral)}${_fish(200, 40, C.pink)}${jelly(256, 50, '#D9C8EA')}${jelly(40, 104, '#F6C9D2')}
      ${r ? `<path d="M120 86 Q150 62 196 76 L216 62 V100 L196 90 Q160 104 120 86Z" fill="#7FA3BF"/><circle cx="136" cy="82" r="2" fill="${C.line}" stroke="none"/><path d="M160 76 l8 -14 l6 14z" fill="#7FA3BF" stroke-width="1.800"/>` : _fish(160, 84, C.blue)}
      <path d="M90 142 q-8 -18 0 -32 M100 142 q8 -16 0 -28 M214 142 q-8 -16 0 -30" stroke="${C.dgreen}" stroke-width="4"/>
      <rect x="14" y="14" width="272" height="130" rx="10"/>
      <rect x="-6" y="152" width="312" height="54" fill="#D8D2C2" stroke="none"/><path d="M0 152 H300"/>
      <path d="M30 170 h30 M250 176 h30 M200 190 h26" stroke="#B5B1A6" stroke-width="2"/>`;
  },
  pearlbay(r) {
    return `<rect width="300" height="200" fill="${r ? '#F6D3B0' : '#DCECE6'}" stroke="none"/>
      <circle cx="${r ? 150 : 250}" cy="${r ? 80 : 34}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <path d="M-6 96 Q40 60 90 96Z M210 96 Q260 50 306 96Z" fill="#C9B79A"/>
      <rect y="96" width="300" height="104" fill="${r ? '#8FB0C4' : '#A9CDD9'}" stroke="none"/><path d="M0 96 H300" stroke-width="1.600"/>
      <path d="M120 116 q8 -5 16 0 M180 130 q8 -5 16 0 M90 140 q8 -5 16 0" stroke="#fff" stroke-width="2"/>
      <path d="M-6 206 V160 Q80 140 170 150 Q260 144 306 162 V206Z" fill="${C.sand}"/>
      <path d="M184 176 Q184 150 220 148 Q256 150 256 176Z" fill="${C.pink}"/><path d="M196 174 L204 154 M220 174 V149 M244 174 L236 154" stroke-width="1.400"/>
      <path d="M184 176 Q220 200 256 176Z" fill="#F6D3DA"/><circle cx="220" cy="177" r="9" fill="${C.white}"/><path d="M216 174 q2 -3 5 -3" stroke="${C.sky}" stroke-width="2"/>
      <circle cx="140" cy="184" r="5" fill="${C.white}" stroke-width="1.600"/><circle cx="154" cy="190" r="4" fill="${C.white}" stroke-width="1.600"/><circle cx="276" cy="186" r="5" fill="${C.white}" stroke-width="1.600"/>
      ${r ? _burst(220, 156, '#FFF6C9', .7) : ''}`;
  },
  bazaar(r) {
    const stall = (x, c) => `<rect x="${x}" y="112" width="74" height="46" fill="${C.wood}"/><path d="M${x - 6} 112 h86 l-8 -24 h-70z" fill="${c}"/><path d="M${x + 14} 90 l-4 20 M${x + 37} 90 v20 M${x + 60} 90 l4 20" stroke="${C.cream}" stroke-width="5" opacity=".85"/><rect x="${x + 8}" y="120" width="58" height="14" fill="${C.cream}" stroke-width="1.600"/>`;
    return `<rect width="300" height="200" fill="${r ? '#E9A878' : '#F6E9C8'}" stroke="none"/>
      <circle cx="${r ? 150 : 150}" cy="${r ? 70 : 30}" r="${r ? 26 : 15}" fill="${r ? C.orange : '#F3D98B'}"/>
      <rect x="108" y="70" width="84" height="60" fill="#EBD39A"/><path d="M118 72 A32 30 0 0 1 182 72Z" fill="${C.blue}"/><path d="M150 42 v-12"/><path d="M140 130 v-22 a10 10 0 0 1 20 0 v22z" fill="${C.dwood}"/>
      ${stall(4, C.coral)}${stall(222, C.purple)}
      ${_dots([[22, 127], [34, 127], [46, 127], [58, 127]], 4, C.orange)}<path d="M238 132 q0 -10 6 -10 q6 0 6 10z M258 132 q0 -12 7 -12 q7 0 7 12z" fill="${C.sky}" stroke-width="1.600"/>
      <rect x="-6" y="158" width="312" height="48" fill="#E3C27F" stroke="none"/><path d="M0 158 H300"/>
      <path d="M96 184 h44 l6 12 h-56z" fill="${C.red}" stroke-width="1.800"/><path d="M104 190 h34" stroke="${C.yellow}" stroke-width="2.400"/>
      ${r ? `<path d="M0 60 Q150 96 300 60" stroke-width="1.600"/>` + [40, 96, 150, 204, 260].map((x, i) => `<ellipse cx="${x}" cy="${[78, 88, 91, 88, 78][i]}" rx="6" ry="8" fill="${i % 2 ? C.yellow : C.red}" stroke-width="1.600"/>`).join('') : ''}`;
  },
  bigcity(r) {
    const cs = ['#D8D2C2', '#C9D8E6', '#E9E0CF', '#C9B8D8', '#D8D2C2', '#C9D8E6'];
    let b = '';
    [[96, 60, 34], [132, 34, 30], [164, 76, 38], [204, 20, 32], [238, 56, 34], [274, 84, 32]].forEach((q, i) => {
      b += `<rect x="${q[0]}" y="${q[1]}" width="${q[2]}" height="${150 - q[1]}" fill="${r ? '#56628C' : cs[i]}"/>`;
      for (let y = q[1] + 10; y < 138; y += 16) for (let x = q[0] + 6; x < q[0] + q[2] - 8; x += 12) b += `<rect x="${x}" y="${y}" width="6" height="8" fill="${r ? ((x + y) % 5 ? C.yellow : '#3E4A7A') : C.sky}" stroke="none"/>`;
    });
    return `<rect width="300" height="200" fill="${r ? '#2E3A66' : '#DCECE6'}" stroke="none"/>
      ${r ? _dots([[20, 20], [60, 40], [100, 16]], 1.800, '#FFF6C9') + `<path d="M50 44 A13 13 0 1 0 64 64 A10 10 0 0 1 50 44Z" fill="#FFF6C9"/>` : `<circle cx="52" cy="36" r="15" fill="#F3D98B"/>`}
      ${b}<path d="M220 20 v-14" stroke-width="2"/>
      <rect x="-6" y="150" width="312" height="56" fill="#9A9488" stroke="none"/><path d="M0 150 H300"/><path d="M0 178 H300" stroke="#fff" stroke-width="3" stroke-dasharray="14 12"/>
      <path d="M176 164 V140 Q176 134 184 134 H250 Q262 136 264 148 V164Z" fill="${C.yellow}" stroke-width="2"/><path d="M184 140 h12 v10 h-12z M202 140 h12 v10 h-12z M220 140 h12 v10 h-12z M240 140 h12 l6 10 h-18z" fill="${C.sky}" stroke-width="1.400"/>${_wh(196, 166, 7)}${_wh(246, 166, 7)}`;
  },
  fireworks(r) {
    return `<rect width="300" height="200" fill="#2B3560" stroke="none"/>
      ${_dots([[20, 16], [140, 10], [286, 20], [10, 90], [292, 110]], 1.600, '#FFF6C9')}
      ${_burst(70, 54, C.coral, 1.4)}${_burst(230, 44, C.yellow, 1.5)}${_burst(150, 80, C.pink, 1)}${r ? _burst(116, 30, '#9BE0B8', .9) + _burst(270, 96, C.sky, .8) + _burst(30, 100, C.yellow, .7) + `<path d="M186 16 A12 12 0 1 0 198 36 A10 10 0 0 1 186 16Z" fill="#FFF6C9"/>` : ''}
      ${_dots([[70, 54], [230, 44], [150, 80]], 3, '#fff')}
      <path d="M0 132 H300" stroke-width="1.600"/><rect y="132" width="300" height="34" fill="#3E4A7A" stroke="none"/>
      <path d="M-6 132 Q150 86 306 132 V140 Q150 100 -6 140Z" fill="#56628C"/><path d="M40 122 v14 M100 110 v20 M150 106 v22 M200 110 v20 M260 122 v14" stroke-width="2"/>
      <path d="M60 150 q8 -4 16 0 M180 156 q8 -4 16 0 M240 148 q8 -4 16 0" stroke="#8FB7CC" stroke-width="2"/>
      <rect x="-6" y="166" width="312" height="40" fill="#6E6A8C" stroke="none"/><path d="M0 166 H300"/>
      <path d="M24 166 v-18 M276 166 v-18" stroke-width="3"/><ellipse cx="24" cy="142" rx="7" ry="9" fill="${C.red}" stroke-width="1.600"/><ellipse cx="276" cy="142" rx="7" ry="9" fill="${C.yellow}" stroke-width="1.600"/>`;
  }
});
