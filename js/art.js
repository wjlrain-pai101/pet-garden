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

/* ---------- 六只宠物（只画身体，外层统一加线条和滤镜） ---------- */
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
    <text x="400" y="136" text-anchor="middle" font-size="32" font-weight="bold" fill="${C.line}" stroke="none" font-family="STKaiti,KaiTi,楷体,serif">小小杂货铺</text>
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
