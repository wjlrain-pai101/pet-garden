'use strict';
/* ==========================================================
 *  萌宠小花园 · 主玩法
 *  养成（喂食/洗澡/睡觉）+ 花园 + 商店 + 旅行（行囊/明信片/特产）+ 小客人
 * ========================================================== */
const SAVE_KEY = 'mengchong_garden_v2';
const SPEED = /[?&]fast\b/.test(location.search) ? 20 : 1;   // 网址后面加 ?fast 可以让旅行变快，方便试玩
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayNum = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000); };

/* ---------- 数据表 ---------- */
const FOODS = {
  millet:     { name: '小米',     ic: 'millet',     hunger: 16, price: 4 },
  seed:       { name: '瓜子',     ic: 'seed',       hunger: 16, price: 5 },
  nut:        { name: '栗子',     ic: 'nut',        hunger: 18, price: 6 },
  fish:       { name: '小鱼干',   ic: 'fish',       hunger: 20, price: 8 },
  bone:       { name: '骨头饼干', ic: 'bone',       hunger: 20, price: 8 },
  carrot:     { name: '胡萝卜',   ic: 'carrot',     hunger: 16, price: 5 },
  corn:       { name: '玉米',     ic: 'corn',       hunger: 18, price: 6 },
  apple:      { name: '苹果',     ic: 'apple',      hunger: 14, happy: 4, price: 5 },
  strawberry: { name: '草莓',     ic: 'strawberry', hunger: 12, happy: 8, price: 7 },
  cake:       { name: '小蛋糕',   ic: 'cake',       hunger: 10, happy: 16, price: 14 }
};
const SEEDS = {
  carrot:     { name: '胡萝卜', ic: 'carrot',     time: 60,  give: 3, food: 'carrot',     price: 5 },
  millet:     { name: '小米',   ic: 'millet',     time: 60,  give: 4, food: 'millet',     price: 5 },
  corn:       { name: '玉米',   ic: 'corn',       time: 90,  give: 3, food: 'corn',       price: 7 },
  strawberry: { name: '草莓',   ic: 'strawberry', time: 90,  give: 3, food: 'strawberry', price: 8 },
  sunflower:  { name: '向日葵', ic: 'sunflower',  time: 120, give: 4, food: 'seed',       price: 9 },
  tulip:      { name: '郁金香', ic: 'tulip',      time: 75,  coins: 25, price: 8 },
  rose:       { name: '玫瑰',   ic: 'rose',       time: 110, coins: 40, price: 12 },
  ginger:     { name: '生姜',   ic: 'ginger',     time: 75,  give: 2, med: 'gingertea', price: 6 },
  mint:       { name: '薄荷',   ic: 'mint',       time: 60,  give: 2, med: 'mint',      price: 6 }
};
/* 生病很温和：不会变重，也不会有更坏的结果；吃药 + 休息就好，实在没药过几分钟也会自己好 */
const MEDS = {
  gingertea: { name: '姜茶',   ic: 'gingertea', price: 8, desc: '着凉的时候喝' },
  mint:      { name: '薄荷草', ic: 'mint',      price: 8, desc: '肚子疼的时候吃' }
};
const ILLS = {
  cold:  { name: '着凉了', med: 'gingertea', how: '给它喝一杯姜茶，再让它睡一觉就会好', say: '阿嚏！我好像着凉了…',
           lines: [['阿嚏！鼻子痒痒的…', '想喝一杯热热的姜茶…'], ['喝了姜茶暖暖的，想睡一觉…']] },
  tummy: { name: '肚子疼', med: 'mint', how: '给它吃一点薄荷草，再休息一会儿就会好', say: '哎哟，肚子好疼…',
           lines: [['肚子咕噜咕噜地疼…', '想吃一点薄荷草…'], ['舒服多了，再歇一会儿就好…']] }
};
const WEARS = {
  bow:     { name: '蝴蝶结',   ic: 'bow',     price: 30 },
  star:    { name: '星星发卡', ic: 'star',    price: 30 },
  hat:     { name: '派对帽',   ic: 'party',   price: 50 },
  glasses: { name: '小眼镜',   ic: 'glasses', price: 60 },
  wreath:  { name: '花环',     ic: 'wreath',  price: 80 },
  crown:   { name: '小皇冠',   ic: 'crown',   price: 150 }
};
const GEAR = {
  bell:     { name: '幸运铃铛', ic: 'bell',     price: 18, desc: '更容易遇见珍贵风景', once: true },
  strawhat: { name: '草帽',     ic: 'strawhat', price: 45, desc: '可以走到海边', to: ['sea'] },
  lantern:  { name: '小灯笼',   ic: 'lantern',  price: 60, desc: '可以去竹林和小镇', to: ['bamboo', 'town'] },
  tent:     { name: '小帐篷',   ic: 'tent',     price: 80, desc: '可以去雪山和营地', to: ['snow', 'camp'] }
};
const BASE_DESTS = ['flower', 'rice', 'spring'];
const TASKS = [
  { id: 'feed',    name: '喂宠物吃 3 次饭',   need: 3, coin: 15, ic: 'apple' },
  { id: 'water',   name: '给植物浇 5 次水',   need: 5, coin: 15, ic: 'drop' },
  { id: 'game',    name: '玩 2 次小游戏',     need: 2, coin: 20, ic: 'kite' },
  { id: 'bath',    name: '给宠物洗 1 次澡',   need: 1, coin: 15, ic: 'tub' },
  { id: 'harvest', name: '收获 2 次植物',     need: 2, coin: 20, ic: 'sunflower' },
  { id: 'trip',    name: '送宠物去旅行 1 次', need: 1, coin: 20, ic: 'backpack' }
];
const STICKERS = [
  { id: 's1',  ic: 'apple',     name: '小小饲养员',   c: 'feed', n: 5 },
  { id: 's2',  ic: 'can',       name: '浇水小能手',   c: 'water', n: 10 },
  { id: 's3',  ic: 'sunflower', name: '小园丁',       c: 'harvest', n: 5 },
  { id: 's4',  ic: 'tub',       name: '爱干净宝宝',   c: 'bath', n: 3 },
  { id: 's5',  ic: 'heart',     name: '最好的朋友',   c: 'pet', n: 30 },
  { id: 's6',  ic: 'kite',      name: '游戏小达人',   c: 'game', n: 5 },
  { id: 's7',  ic: 'trophy',    name: '游戏冠军',     c: 'game', n: 20 },
  { id: 's8',  ic: 'backpack',  name: '小小旅行家',   c: 'trip', n: 1 },
  { id: 's9',  ic: 'tent',      name: '走遍四方',     c: 'trip', n: 8 },
  { id: 's10', ic: 'mail',      name: '明信片收藏家', c: 'cards', n: 8 },
  { id: 's11', ic: 'tea',       name: '热情小主人',   c: 'guest', n: 5 },
  { id: 's12', ic: 'crown',     name: '超级明星',     c: 'level', n: 6 },
  { id: 's13', ic: 'med',       name: '细心小护士',   c: 'cure', n: 1 }
];

/* ---------- 存档 ---------- */
let S = null;
function newState(type, name) {
  const inv = { apple: 2 }; inv[PETS[type].fav] = 3;
  return {
    v: 2, pet: { type, name }, level: 1, exp: 0, coins: 60,
    stats: { hunger: 62, clean: 74, happy: 70, energy: 86 },
    inv, seeds: { carrot: 2, tulip: 1 }, owned: [], wear: null, gear: {},
    plots: [null, null, null, null, null, null],
    sleeping: false, last: Date.now(),
    trip: null, mail: [], cards: {}, cardLog: [], souv: {}, visitor: null, albumNew: false,
    daily: { day: 0, signed: false, prog: {}, claimed: {} }, streak: 0,
    sick: null, meds: {}, risk: { cold: 0, tummy: 0 }, sweet: 0, immune: 0,
    counters: { feed: 0, water: 0, harvest: 0, game: 0, bath: 0, pet: 0, trip: 0, guest: 0, cure: 0 },
    gameLv: { math: 3, catch: 2, fly: 2, memory: 2, melody: 2 },   // 小游戏等级：口算是年级，其余是 1 轻松 / 2 普通 / 3 挑战
    stickers: [], phrases: [], soundOn: true
  };
}
function save() {
  if (!S) return;
  S.last = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}
function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!d || !d.pet || !PETS[d.pet.type]) return null;
    const b = newState(d.pet.type, d.pet.name);
    const s = Object.assign({}, b, d);
    s.stats = Object.assign(b.stats, d.stats);
    s.counters = Object.assign(b.counters, d.counters);
    s.daily = Object.assign(b.daily, d.daily);
    if (!Array.isArray(s.plots) || s.plots.length !== 6) s.plots = b.plots;
    if (s.trip && !DESTS[s.trip.dest]) s.trip = null;
    if (s.sick && !ILLS[s.sick.type]) s.sick = null;
    if (!s.risk) s.risk = { cold: 0, tummy: 0 };
    if (!s.meds) s.meds = {};
    return s;
  } catch (e) { return null; }
}

/* ---------- 通用小工具：提示、特效、弹窗 ---------- */
let toastTimer, bannerTimer, modalOnClose = null;
const acorns = n => icon('acorn') + ' ' + n;
function toast(t, ms) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), ms || 2400);
}
function banner(t, ms) {
  const el = $('#banner'); el.textContent = t; el.classList.add('show');
  clearTimeout(bannerTimer); bannerTimer = setTimeout(() => el.classList.remove('show'), ms || 2400);
}
function floatFx(html, x, y) {
  const el = document.createElement('div'); el.className = 'fx-float'; el.innerHTML = html;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  $('#fx').appendChild(el); setTimeout(() => el.remove(), 1250);
}
function flyIcon(name, x1, y1, x2, y2, cb) {
  const el = document.createElement('div'); el.className = 'fx-fly'; el.innerHTML = icon(name);
  $('#fx').appendChild(el);
  // 动画结束后才生效；如果页面在后台、动画不走，就靠定时器兜底，保证东西不会白白用掉
  let done = false;
  const finish = () => { if (done) return; done = true; el.remove(); cb && cb(); };
  setTimeout(finish, 900);
  if (!el.animate) { finish(); return; }
  const a = el.animate([
    { transform: `translate(${x1 - 20}px,${y1 - 20}px) scale(1.2)` },
    { transform: `translate(${(x1 + x2) / 2 - 20}px,${Math.min(y1, y2) - 90}px) scale(1.5)`, offset: .5 },
    { transform: `translate(${x2 - 20}px,${y2 - 20}px) scale(.5)` }
  ], { duration: 650, easing: 'ease-in-out' });
  a.onfinish = finish;
}
function confetti() {
  const cs = ['#EBAE9C', '#EBC66B', '#B9CFA0', '#A9CDD9', '#CBBBDD'];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement('i'); el.className = 'confetti';
    el.style.left = rand(0, 100) + 'vw'; el.style.background = pick(cs);
    el.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
    el.style.animationDelay = (Math.random() * .4) + 's';
    $('#fx').appendChild(el); setTimeout(() => el.remove(), 3800);
  }
}
function openModal(html, opt) {
  opt = opt || {};
  closeModal();
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-mask"><div class="modal">${opt.noClose ? '' : '<button class="x" data-close>×</button>'}${html}</div></div>`;
  const mask = root.firstChild;
  mask.addEventListener('click', e => {
    if ((e.target === mask && !opt.noClose) || e.target.closest('[data-close]')) { Sound.sfx.click(); closeModal(); }
  });
  modalOnClose = opt.onClose || null;
  return mask.querySelector('.modal');
}
function closeModal() {
  const root = $('#modal-root');
  if (!root.firstChild) return;
  root.innerHTML = '';
  const f = modalOnClose; modalOnClose = null; f && f();
}
const modalOpen = () => !!$('#modal-root').firstChild;
function showScreen(id) { $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + id)); }
function fillIcons(root) { $$('[data-ic]', root).forEach(el => { el.innerHTML = icon(el.dataset.ic); }); }
function itemBtn(attr, ic, name, sub, sel) {
  return `<button class="item${sel ? ' sel' : ''}" ${attr}>${icon(ic, 'big')}<b>${name}</b>${sub ? '<small>' + sub + '</small>' : ''}</button>`;
}

/* ---------- 成长 ---------- */
const needExp = lv => 40 + lv * 30;
const levelTitle = lv => lv < 3 ? '宝宝' : lv < 6 ? '小可爱' : lv < 10 ? '小明星' : '超级明星';
function addStat(k, v) { S.stats[k] = clamp(S.stats[k] + v, 0, 100); }
function addCoins(n) {
  S.coins += n;
  const c = $('#hud-coin'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  Sound.sfx.coin(); updateHUD();
}
function addExp(n) {
  S.exp += n;
  let up = false;
  while (S.exp >= needExp(S.level)) { S.exp -= needExp(S.level); S.level++; S.coins += 20; up = true; }
  if (up) {
    Sound.sfx.level(); confetti();
    banner('长大啦！Lv.' + S.level + ' ' + levelTitle(S.level));
    setTimeout(() => toast('升级奖励：橡果 +20'), 2500);
    renderPet(true);
  }
}
function afterAction() { updateHUD(); renderPet(); checkStickers(); save(); }

/* ---------- 顶部状态栏 ---------- */
function updateHUD() {
  $('#hud-petname').textContent = S.pet.name;
  $('#hud-lv').innerHTML = 'Lv.' + S.level + '<em> ' + levelTitle(S.level) + '</em>';
  $('#hud-exp').style.width = (S.exp / needExp(S.level) * 100) + '%';
  $('#hud-coin b').textContent = S.coins;
  $('#hud-ill').textContent = S.sick && !S.trip ? ILLS[S.sick.type].name : '';
  for (const k in S.stats) {
    const el = $(`.stat[data-k="${k}"]`); if (!el) continue;
    el.querySelector('.bar i').style.width = S.stats[k] + '%';
    el.classList.toggle('low', S.stats[k] < 25);
  }
}
function updateSoundBtn() { $('#btn-music').innerHTML = icon(S.soundOn ? 'note' : 'mute'); }
function updateDots() {
  $('#btn-tasks').classList.toggle('has', TASKS.some(t => (S.daily.prog[t.id] || 0) >= t.need && !S.daily.claimed[t.id]));
  $('#nav [data-scene=garden]').classList.toggle('has', S.mail.length > 0 || !!(S.visitor && !S.visitor.fed));
  $('#nav [data-scene=album]').classList.toggle('has', !!S.albumNew);
}

/* ---------- 宠物的表情和动作 ---------- */
let tempMood = null, tempTimer = null, petSig = '', sayTimer = null;
function calcMood() {
  if (S.sleeping) return 'sleep';
  if (tempMood) return tempMood;
  if (S.sick) return S.sick.type;
  const s = S.stats, mn = Math.min(s.hunger, s.clean, s.happy, s.energy);
  if (mn < 25) return 'sad';
  return (s.hunger + s.clean + s.happy + s.energy) / 4 >= 72 ? 'happy' : 'normal';
}
function renderPet(force) {
  const mood = calcMood(), sig = S.pet.type + '|' + mood + '|' + S.wear;
  if (!force && sig === petSig) return;
  petSig = sig;
  const svg = petSVG(S.pet.type, mood, S.wear);
  ['#pet', '#pet-garden'].forEach(id => {
    const el = $(id); el.innerHTML = svg;
    el.className = el.className.replace(/\s*mood-\w+/g, '') + ' mood-' + mood;
  });
  $('#hud-avatar').innerHTML = petSVG(S.pet.type, ['sleep', 'sad', 'cold', 'tummy'].includes(mood) ? mood : 'normal', S.wear);
  $('#scene-home').classList.toggle('night', S.sleeping);
  document.documentElement.style.setProperty('--grow', (0.84 + Math.min(S.level, 10) * 0.016).toFixed(3));
}
function setTempMood(m, ms) {
  tempMood = m; clearTimeout(tempTimer);
  tempTimer = setTimeout(() => { tempMood = null; if (S) renderPet(); }, ms);
  renderPet();
}
function petAnim(cls, ms) {
  const el = $('#pet'); el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
function say(t, ms) {
  const b = $('#bubble'); b.textContent = t; b.classList.add('show');
  clearTimeout(sayTimer); sayTimer = setTimeout(() => b.classList.remove('show'), ms || 2800);
}
/* 宠物不在家或在睡觉时，照顾类的操作先不做 */
function blocked() {
  if (S.trip) { toast(S.pet.name + ' 出门旅行了，等它回来吧'); return true; }
  if (S.sleeping) { toast('嘘… ' + S.pet.name + ' 正在睡觉，先叫它起床吧'); return true; }
  return false;
}
function petCenter() { const r = $('#pet').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }; }

let lastPat = 0;
function patPet(e) {
  if (bath || S.trip) return;
  if (S.sleeping) { say('呼… 呼…', 1500); return; }
  const now = Date.now(); if (now - lastPat < 450) return; lastPat = now;
  floatFx(icon(pick(['heart', 'heart', 'sparkle'])), e.clientX, e.clientY - 20);
  Sound.sfx[PETS[S.pet.type].fly ? 'chirp' : 'pop']();
  setTempMood('joy', 900);
  addStat('happy', 2); S.counters.pet++;
  if (S.counters.pet % 4 === 1) say(pick(['好舒服呀~', '嘻嘻，好痒！', '最喜欢你啦！', '再摸摸我嘛~']));
  afterAction();
}

const LINES = {
  hunger: ['肚子咕咕叫，想吃东西~', '我饿啦，有好吃的吗？'],
  clean: ['身上脏脏的，想洗澡澡~', '帮我洗个澡好不好？'],
  happy: ['陪我玩一会儿好吗？', '有点无聊，我们去游乐场吧！'],
  energy: ['好困呀，想睡觉了…', '眼睛快睁不开啦…'],
  ok: ['今天也要开开心心！', '和你在一起真好~', '花园里的小苗长高了吗？', '记得多喝水哦！', '好想去远一点的地方看看呀~', '我们是最好的朋友！', '写完作业再来找我玩哦~'],
  parrot: ['你好！你好！', '早上好呀！', '彩虹真漂亮！', '我会说话，厉害吧！']
};
function autoSay() {
  if (S.sleeping || S.trip || scene !== 'home' || bath || Games.active) return;
  if (S.sick) { say(pick(ILLS[S.sick.type].lines[S.sick.treated ? 1 : 0])); return; }
  const s = S.stats, keys = ['hunger', 'clean', 'happy', 'energy'];
  const low = keys.filter(k => s[k] < 35).sort((a, b) => s[a] - s[b])[0];
  if (low) { say(pick(LINES[low])); return; }
  if (S.mail.length) { say('信箱里好像有我寄的明信片！'); return; }
  if (S.plots.some(p => p && p.growth < 100 && p.water <= 0)) { say('花园里的小苗口渴啦，快去浇水吧！'); return; }
  if (S.plots.some(p => p && p.growth >= 100)) { say('花园里有东西成熟啦，去看看吧！'); return; }
  let pool = LINES.ok;
  if (S.pet.type === 'parrot') pool = pool.concat(LINES.parrot, S.phrases || []);
  say(pick(pool));
}
/* 在家时自己走走、看看书、喝喝茶 */
const IDLE = { book: '今天看一本图画书~', tea: '喝口茶，歇一会儿~', note: '哼一首小曲儿 ♪' };
function idleAct() {
  if (S.sleeping || S.trip || S.sick || bath || scene !== 'home' || Games.active || modalOpen()) return;
  const z = $('#pet-zone'), x = pick([30, 50, 50, 68]), prop = $('#prop');
  if ((z.dataset.x || '50') !== String(x)) { z.dataset.x = x; z.style.left = x + '%'; petAnim('walk', 1800); }
  const act = pick([null, 'book', 'tea', 'note']);
  if (act) {
    prop.innerHTML = icon(act);
    setTimeout(() => { if (S && !S.trip && !bath) { prop.classList.add('show'); if (Math.random() < .6) say(IDLE[act]); } }, 1900);
  } else prop.classList.remove('show');
}
function resetIdle() { const z = $('#pet-zone'); z.dataset.x = '50'; z.style.left = '50%'; $('#prop').classList.remove('show'); }

/* ---------- 喂食 ---------- */
const myFoods = () => Object.keys(S.inv).filter(k => S.inv[k] > 0 && FOODS[k]);
const noFoodHTML = '<p class="empty">食物吃光啦！<br>去商店买一些，或者去花园种出来吧~</p><div class="row"><button class="btn small" data-go="shop">去商店</button><button class="btn small green" data-go="garden">去花园</button></div>';
function openFeed() {
  if (blocked() || bath) return;
  const ids = myFoods(), fav = PETS[S.pet.type].fav;
  let html = '<h2>喂点什么好呢？</h2>';
  if (!ids.length) html += noFoodHTML;
  else html += '<div class="item-grid">' + ids.map(k => itemBtn(`data-food="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k] + (fav === k ? ' 最爱' : ''))).join('') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-food]'), g = e.target.closest('[data-go]');
    if (b) { closeModal(); feed(b.dataset.food); }
    if (g) { closeModal(); shopTab = 'food'; switchScene(g.dataset.go); }
  });
}
function feed(id) {
  const f = FOODS[id]; if (!f || !S.inv[id]) return;
  if (S.stats.hunger >= 96) { say('我吃得饱饱的，吃不下啦~'); return; }
  if (id === 'cake' && S.sick && S.sick.type === 'tummy') { say('肚子疼，现在不能吃蛋糕…'); return; }
  S.inv[id]--; $('#prop').classList.remove('show');
  const pc = petCenter(), st = $('#stage').getBoundingClientRect();
  flyIcon(f.ic, st.left + st.width / 2, st.bottom - 10, pc.x, pc.r.top + pc.r.height * .56, () => {
    Sound.sfx.eat(); setTempMood('eat', 1300); petAnim('chomp', 1300);
    addStat('hunger', f.hunger); if (f.happy) addStat('happy', f.happy);
    if (PETS[S.pet.type].fav === id) { addStat('happy', 10); say('哇！是我最爱吃的' + f.name + '！'); }
    else say(pick(['啊呜啊呜，真好吃！', '谢谢你，好香呀~', '吃饱饱，长高高！']));
    floatFx(icon('bowl') + '+' + f.hunger, pc.x, pc.r.top);
    S.counters.feed++; progress('feed'); addExp(8); afterAction();
    if (id === 'cake') {   // 蛋糕连着吃太多会肚子疼：第二块先提醒，第三块才生病
      S.sweet = (S.sweet || 0) + 1;
      if (S.sweet >= 2.6) setTimeout(() => { if (S) getSick('tummy'); }, 1600);
      else if (S.sweet >= 1.6) setTimeout(() => { if (S && !S.sick) say('蛋糕真好吃！不过再吃就要肚子疼啦~', 3600); }, 1600);
    }
  });
}

/* ---------- 洗澡 ---------- */
let bath = null;
function startBath() {
  if (blocked() || bath) return;
  if (S.stats.clean >= 95) { say('我已经香喷喷的啦~'); return; }
  resetIdle();
  const layer = $('#bath-layer');
  layer.innerHTML = `<div class="bath-tip">在 ${esc(S.pet.name)} 身上搓一搓，搓出泡泡</div><div class="bath-bar"><i></i></div><button class="bath-x">×</button>`;
  layer.classList.add('on'); $('#pet-zone').classList.add('bathing');
  $('#bubble').classList.remove('show');
  bath = { p: 0, last: 0, n: 0, done: false };
  Sound.sfx.water();
}
function bathMove(e) {
  if (!bath || bath.done) return;
  const now = performance.now(); if (now - bath.last < 45) return;
  const r = $('#pet').getBoundingClientRect();
  if (e.clientX < r.left - 14 || e.clientX > r.right + 14 || e.clientY < r.top - 14 || e.clientY > r.bottom + 14) return;
  bath.last = now;
  const layer = $('#bath-layer'), lr = layer.getBoundingClientRect(), sz = rand(16, 42);
  const b = document.createElement('i'); b.className = 'bub';
  b.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - lr.left - sz / 2}px;top:${e.clientY - lr.top - sz / 2}px`;
  layer.appendChild(b);
  if (++bath.n % 4 === 0) Sound.sfx.bubble();
  bath.p = Math.min(100, bath.p + 2);
  layer.querySelector('.bath-bar i').style.width = bath.p + '%';
  if (bath.p >= 100) finishBath();
}
function finishBath() {
  bath.done = true;
  const layer = $('#bath-layer'), lr = layer.getBoundingClientRect(), r = $('#pet').getBoundingClientRect();
  layer.querySelector('.bath-tip').textContent = '哗啦啦~ 冲干净';
  layer.classList.add('rinse'); Sound.sfx.water();
  $$('.bub', layer).forEach(b => { b.style.animationDelay = (Math.random() * .4) + 's'; });
  for (let i = 0; i < 16; i++) {
    const d = document.createElement('i'); d.className = 'drop';
    d.style.left = (r.left - lr.left + Math.random() * r.width) + 'px';
    d.style.top = (r.top - lr.top - 20) + 'px';
    d.style.animationDelay = (Math.random() * .45) + 's';
    layer.appendChild(d);
  }
  setTimeout(() => {
    if (!bath) return;
    endBath();
    S.stats.clean = 100; addStat('happy', 8);
    S.counters.bath++; progress('bath'); addExp(12);
    const pc = petCenter();
    for (let i = 0; i < 5; i++) setTimeout(() => floatFx(icon('sparkle'), pc.r.left + Math.random() * pc.r.width, pc.r.top + Math.random() * pc.r.height * .7), i * 120);
    Sound.sfx.ok(); setTempMood('joy', 1500); say('洗白白，香喷喷！谢谢你~');
    afterAction();
  }, 1300);
}
function endBath() {
  bath = null;
  const layer = $('#bath-layer'); layer.classList.remove('on', 'rinse'); layer.innerHTML = '';
  $('#pet-zone').classList.remove('bathing');
}

/* ---------- 睡觉 ---------- */
function toggleSleep() {
  if (bath) return;
  if (S.trip) { blocked(); return; }
  if (!S.sleeping) {
    if (S.stats.energy >= 92 && !S.sick) { say('我现在精神满满，还不想睡~'); return; }
    S.sleeping = true; resetIdle(); say('晚安…', 2000);
  } else { S.sleeping = false; setTimeout(() => say('睡得真香！你好呀~'), 300); }
  Sound.sfx.click();
  renderPet(true); updateActions(); playSceneMusic(); save();
}
function updateActions() {
  const set = (act, ic, label) => { const b = $(`.act[data-act=${act}]`); b.querySelector('i').innerHTML = icon(ic); b.querySelector('em').textContent = label; };
  set('sleep', S.sleeping ? 'sun' : 'moon', S.sleeping ? '起床' : '睡觉');
  const p = PETS[S.pet.type];
  if (S.sick && !S.trip) set('talent', 'med', '吃药'); else set('talent', p.talentIcon, p.talent);
  set('travel', 'backpack', S.trip ? '旅行中' : '旅行');
  $$('.act').forEach(b => b.classList.toggle('off', !!S.trip && b.dataset.act !== 'travel'));
}

/* ---------- 才艺（小鸟唱歌 / 鹦鹉学说话 / 其他宠物表演） ---------- */
function talent() {
  if (blocked() || bath) return;
  if (S.stats.energy < 5) { say('好累呀，想先睡一觉…'); return; }
  const type = S.pet.type;
  if (type === 'parrot') { openParrotTalk(); return; }
  $('#prop').classList.remove('show');
  S.stats.energy = clamp(S.stats.energy - 3, 0, 100); addStat('happy', 8); addExp(4);
  if (type === 'bird') birdSing();
  else {
    petAnim({ cat: 'trick-roll', dog: 'trick-spin', rabbit: 'trick-jump', hamster: 'trick-flip' }[type], 1300);
    setTempMood('joy', 1400); Sound.sfx.ok();
    say(pick(['看我的！', '厉害吧？嘿嘿~', '当当当当~ 表演完毕！']));
  }
  afterAction();
}
function birdSing() {
  petAnim('flap', 1600); setTempMood('eat', 1700); say('啾啾~ 啾啾啾~ ♪', 2400);
  const notes = [1047, 1175, 1319, 1568, 1760, 2093], pc = petCenter();
  for (let i = 0; i < 8; i++) setTimeout(() => {
    Sound.beep(pick(notes), .2, 'sine', .2);
    floatFx(icon('note'), pc.r.left + pc.r.width * (.2 + Math.random() * .6), pc.r.top + pc.r.height * .2);
  }, i * 200);
}
function openParrotTalk() {
  const chips = (S.phrases || []).map(p => `<button class="chip" data-say="${esc(p)}">${esc(p)}</button>`).join('');
  const m = openModal(`<h2>教 ${esc(S.pet.name)} 说话</h2><p>写一句话，它会学着说给你听哦</p>
    <input id="say-input" class="text-input" maxlength="16" placeholder="比如：你好呀" autocomplete="off">
    <div class="row"><button class="btn" id="say-go">教它说</button></div>
    ${chips ? '<p class="hint">已经学会的话（点一下再说一遍）</p><div class="chips">' + chips + '</div>' : ''}`);
  const go = t => {
    t = (t || '').trim().slice(0, 16);
    if (!t) { toast('先写一句话吧~'); return; }
    closeModal(); parrotSay(t);
  };
  $('#say-go', m).onclick = () => go($('#say-input', m).value);
  $('#say-input', m).onkeydown = e => { if (e.key === 'Enter') go(e.target.value); };
  m.addEventListener('click', e => { const c = e.target.closest('[data-say]'); if (c) go(c.dataset.say); });
}
function parrotSay(t) {
  S.stats.energy = clamp(S.stats.energy - 3, 0, 100); addStat('happy', 8); addExp(4);
  S.phrases = [t].concat((S.phrases || []).filter(p => p !== t)).slice(0, 6);
  $('#prop').classList.remove('show');
  petAnim('flap', 1600); setTempMood('eat', 1800); Sound.sfx.chirp();
  say('「' + t + '」！' + t + '~', 3600);
  try {
    if (S.soundOn && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN'; u.pitch = 1.9; u.rate = 1.15;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  } catch (e) { }
  afterAction();
}

/* ---------- 生病和照顾 ----------
 * 着凉：身上太脏太久，或者从雪山/营地回来偶尔会得 → 喝姜茶，再睡一觉
 * 肚子疼：饿太久，或者连着吃三块蛋糕 → 吃薄荷草，再休息一会儿
 * 生病时不能旅行、表演和玩小游戏，但不会变重；没有药的话，照顾好了几分钟后也会自己好 */
function getSick(type) {
  if (!S || S.sick || S.trip) return;
  S.sick = { type, treated: false, rest: 0, age: 0 };
  S.risk = { cold: 0, tummy: 0 }; S.sweet = 0;
  resetIdle(); renderPet(true); updateActions(); updateHUD(); Sound.sfx.bad();
  say(ILLS[type].say, 4000);
  if (!Games.active && !modalOpen()) showSickHelp(); else toast(S.pet.name + ' ' + ILLS[type].name);
  save();
}
function showSickHelp() {
  const ill = ILLS[S.sick.type], med = MEDS[ill.med];
  const m = openModal(`<div class="hero">${petSVG(S.pet.type, S.sick.type, S.wear)}</div><h2>${esc(S.pet.name)} ${ill.name}</h2>
    <p>别担心，${ill.how}。<br>${med.name}可以在商店买，也可以在花园里种。</p>
    <div class="row"><button class="btn" id="sick-go">去照顾它</button></div>`);
  $('#sick-go', m).onclick = () => { closeModal(); if (scene !== 'home') switchScene('home'); openMeds(); };
}
function openMeds() {
  if (!S.sick || S.trip || bath) return;
  const k = S.sick, ill = ILLS[k.type], key = ill.med, med = MEDS[key], n = S.meds[key] || 0;
  if (k.treated) { toast(k.type === 'cold' ? '已经喝过姜茶啦，让它睡一觉吧' : '已经吃过药啦，让它休息一会儿'); return; }
  if (S.sleeping) { toast('它睡着了，先叫醒再吃药吧'); return; }
  let html = `<h2>${esc(S.pet.name)} ${ill.name}</h2><p>${ill.how}。</p>`;
  if (n) html += '<div class="item-grid">' + itemBtn('data-med="1"', med.ic, med.name, '×' + n) + '</div>';
  else html += `<p class="empty">家里没有${med.name}了。</p><div class="row"><button class="btn small" data-go="shop">去商店买</button><button class="btn small green" data-go="garden">去花园种</button></div>`;
  const m = openModal(html);
  m.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'food'; switchScene(g.dataset.go); }
    if (e.target.closest('[data-med]')) { closeModal(); giveMed(); }
  });
}
function giveMed() {
  const k = S.sick; if (!k || k.treated) return;
  const key = ILLS[k.type].med; if (!S.meds[key]) return;
  S.meds[key]--; k.treated = true; k.rest = 0;
  const pc = petCenter(), st = $('#stage').getBoundingClientRect();
  flyIcon(MEDS[key].ic, st.left + st.width / 2, st.bottom - 10, pc.x, pc.r.top + pc.r.height * .56, () => {
    Sound.sfx.eat(); setTempMood('eat', 1300); petAnim('chomp', 1300);
    say(k.type === 'cold' ? '暖暖的… 我想睡一觉' : '舒服一点了，让我歇一会儿', 3600);
    if (k.type === 'cold') setTimeout(() => toast('点“睡觉”，让它好好睡一觉'), 1600);
  });
  save();
}
function cure() {
  S.sick = null; S.immune = 240; S.counters.cure = (S.counters.cure || 0) + 1;
  addStat('happy', 15);
  renderPet(true); updateActions(); updateHUD(); playSceneMusic();
  Sound.sfx.level(); confetti(); banner(S.pet.name + ' 好起来啦');
  say('我好啦！谢谢你照顾我~', 3800);
  addExp(10); afterAction();
}
function tickSick(dt) {
  if (S.trip) return;
  S.immune = Math.max(0, (S.immune || 0) - dt);
  S.sweet = Math.max(0, (S.sweet || 0) - dt / 120);   // 两分钟消化掉一块蛋糕
  const k = S.sick, st = S.stats;
  if (!k) {
    if (S.immune > 0 || Games.active) return;
    const r = S.risk;
    r.cold = st.clean < 20 ? r.cold + dt : Math.max(0, r.cold - dt);
    r.tummy = st.hunger < 15 ? r.tummy + dt : Math.max(0, r.tummy - dt);
    if (r.cold >= 90) getSick('cold'); else if (r.tummy >= 90) getSick('tummy');
    return;
  }
  k.age += dt;
  if (k.treated) {
    if (k.type === 'cold') { if (S.sleeping) k.rest += dt; if (k.rest >= 20) { S.sleeping = false; cure(); } }
    else { if (!Games.active) k.rest += dt; if (k.rest >= 30) cure(); }
  } else if (k.age > 360 && Math.min(st.hunger, st.clean, st.energy) >= 50) cure();
}

/* ---------- 装扮 ---------- */
function openWardrobe() {
  if (blocked() || bath) return;
  let html = '<h2>今天戴什么呢？</h2>';
  if (!S.owned.length) html += '<p class="empty">还没有装饰品哦~<br>去商店挑一件漂亮的吧</p><div class="row"><button class="btn small" data-go="shop">去商店</button></div>';
  else html += '<div class="item-grid">' + `<button class="item${!S.wear ? ' sel' : ''}" data-wear=""><b style="line-height:44px">不戴</b></button>` +
    S.owned.map(k => itemBtn(`data-wear="${k}"`, WEARS[k].ic, WEARS[k].name, '', S.wear === k)).join('') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-wear]'), g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'wear'; switchScene('shop'); }
    if (b) {
      S.wear = b.dataset.wear || null; closeModal(); renderPet(true); renderWall();
      if (S.wear) { petAnim('trick-jump', 1200); Sound.sfx.ok(); say('好看吗？'); }
      save();
    }
  });
}

/* ---------- 旅行：准备行囊 → 出发 → 寄明信片 → 带特产回家 ---------- */
const tripLeft = () => S.trip ? Math.max(0, S.trip.dur - (Date.now() - S.trip.start) / 1000 * SPEED) : 0;
const leftText = () => { const s = tripLeft(); return s < 60 ? '不到 1 分钟就回来' : '大约 ' + Math.ceil(s / 60) + ' 分钟后回来'; };
const travelWear = () => S.wear || (S.gear.strawhat ? 'strawhat' : null);
function pcHTML(id, cls) {
  const p = id.split(':');
  return `<span class="pc${p[1] === 'b' ? ' rare' : ''}${cls ? ' ' + cls : ''}" data-card="${id}"><span class="img">${postcardSVG(id, S.pet.type, travelWear())}</span><span class="cap">${DESTS[p[0]].name}</span></span>`;
}
function openPack() {
  if (bath) return;
  if (S.trip) { toast(S.pet.name + ' 正在旅行，' + leftText()); return; }
  if (blocked()) return;
  if (S.sick) { say('生病了不能出门，先把病养好吧…'); return; }
  if (S.stats.hunger < 40) { say('肚子还饿着呢，吃饱了再出发吧~'); return; }
  if (S.stats.energy < 35) { say('有点困，睡一觉再去旅行吧~'); return; }
  const foods = myFoods(), fav = PETS[S.pet.type].fav;
  if (!foods.length) {
    const m0 = openModal('<h2>准备行囊</h2><p class="empty">出门要带便当，可是家里没有吃的了。</p>' + noFoodHTML.replace(/^<p.*?<\/p>/, ''));
    m0.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { closeModal(); shopTab = 'food'; switchScene(g.dataset.go); } });
    return;
  }
  const tools = Object.keys(GEAR).filter(k => !GEAR[k].once && S.gear[k]);
  const sel = { food: null, tool: null, bell: false };
  let html = `<h2>准备行囊</h2><p>带上便当，${esc(S.pet.name)} 会自己去远方走走，<br>路上还会寄明信片回来。</p><h3>便当（选一样）</h3><div class="item-grid">` +
    foods.map(k => itemBtn(`data-pf="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k] + (fav === k ? ' 最爱' : ''))).join('') + '</div><h3>旅行用品（可以不带）</h3>';
  if (!tools.length && !S.gear.bell) html += '<p class="hint" style="margin-top:0">商店的“旅行用品”里有草帽、灯笼和帐篷，<br>带上它们能去更远的地方。</p>';
  else html += '<div class="item-grid">' + tools.map(k => itemBtn(`data-pt="${k}"`, GEAR[k].ic, GEAR[k].name, GEAR[k].desc)).join('') +
    (S.gear.bell ? itemBtn('data-pb="1"', 'bell', '幸运铃铛', '×' + S.gear.bell) : '') + '</div>';
  html += '<div class="row"><button class="btn big green" id="go-trip">出发</button></div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const f = e.target.closest('[data-pf]'), t = e.target.closest('[data-pt]'), b = e.target.closest('[data-pb]');
    if (f) { sel.food = f.dataset.pf; $$('[data-pf]', m).forEach(x => x.classList.toggle('sel', x === f)); Sound.sfx.pop(); }
    if (t) { sel.tool = sel.tool === t.dataset.pt ? null : t.dataset.pt; $$('[data-pt]', m).forEach(x => x.classList.toggle('sel', x.dataset.pt === sel.tool)); Sound.sfx.pop(); }
    if (b) { sel.bell = !sel.bell; b.classList.toggle('sel', sel.bell); Sound.sfx.pop(); }
    if (e.target.closest('#go-trip')) {
      if (!sel.food) { toast('先选一样便当吧'); return; }
      closeModal(); startTrip(sel);
    }
  });
}
function startTrip(sel) {
  S.inv[sel.food]--;
  if (sel.bell) S.gear.bell--;
  const isFav = PETS[S.pet.type].fav === sel.food;
  const dest = sel.tool && Math.random() < .75 ? pick(GEAR[sel.tool].to) : pick(BASE_DESTS);
  const rareP = .15 + (sel.bell ? .3 : 0) + (isFav ? .1 : 0) + (sel.food === 'cake' ? .1 : 0);
  const rare = Math.random() < rareP;
  S.trip = {
    dest, start: Date.now(), dur: DESTS[dest].time,
    card: dest + (rare ? ':b' : ':a'),
    extra: Math.random() < (rare ? .5 : .2) ? dest + (rare ? ':a' : ':b') : null,
    souv: isFav || Math.random() < .7 ? DESTS[dest].souv : null,
    coins: rand(8, 20), mailed: false
  };
  progress('trip'); resetIdle();
  Sound.sfx.trip(); setTempMood('joy', 1500); say('我出发啦！等我的明信片哦~', 1800);
  setTimeout(() => { if (S && S.trip) { renderAway(); updateActions(); toast(S.pet.name + ' 背着小包出门了'); } }, 1700);
  save();
}
function renderAway() {
  const away = !!S.trip;
  $('#pet-zone').classList.toggle('gone', away);
  $('#pet-garden').style.visibility = away ? 'hidden' : '';
  const note = $('#away-note');
  note.classList.toggle('on', away);
  if (away) note.innerHTML = `<b>我去旅行啦</b><small id="away-left">${leftText()}</small><div class="sign">—— ${esc(S.pet.name)}</div>`;
}
function addCard(id) {
  const isNew = !S.cards[id];
  S.cards[id] = (S.cards[id] || 0) + 1;
  if (isNew) { S.cardLog.push(id); S.albumNew = true; } else S.coins += 5;
  return isNew;
}
function tickTrip() {
  const t = S.trip; if (!t) return;
  const el = (Date.now() - t.start) / 1000 * SPEED;
  if (!t.mailed && el >= t.dur * .5) {
    t.mailed = true; S.mail.push(t.card);
    Sound.sfx.mail(); if (!Games.active) toast('叮咚~ 信箱里有一张新明信片');
    renderMailbox(); updateDots(); save();
  }
  if (el >= t.dur) { if (!Games.active && !modalOpen()) finishTrip(); }
  else { const a = $('#away-left'); if (a) a.textContent = leftText(); }
}
function finishTrip() {
  const t = S.trip, st = S.stats, d = DESTS[t.dest];
  const chilly = (t.dest === 'snow' || t.dest === 'camp') && !S.immune && Math.random() < .2;   // 去冷的地方，偶尔会着凉
  if (!t.mailed) S.mail.push(t.card);
  S.trip = null;
  st.hunger = Math.max(30, st.hunger - 25); st.clean = Math.max(28, st.clean - 32);
  st.energy = Math.max(30, st.energy - 25); st.happy = Math.min(100, st.happy + 30);
  S.coins += t.coins;
  let gifts = `<span>${acorns('+' + t.coins)}</span>`;
  if (t.souv) {
    const isNew = !S.souv[t.souv]; S.souv[t.souv] = (S.souv[t.souv] || 0) + 1; if (isNew) S.albumNew = true;
    gifts += `<span>${icon(t.souv)}${SOUVS[t.souv]}${isNew ? '<i class="new-tag">新</i>' : ''}</span>`;
  }
  let extra = '';
  if (t.extra) { const isNew = addCard(t.extra); extra = pcHTML(t.extra, 'big') + (isNew ? '' : '<p class="hint">这张已经有了，换成了 5 颗橡果</p>'); }
  S.counters.trip++;
  renderAway(); resetIdle(); renderPet(true); updateActions(); renderMailbox(); renderWall(); updateDots();
  Sound.sfx.trip(); confetti(); setTempMood('joy', 2500);
  openModal(`<div class="hero">${petSVG(S.pet.type, 'joy', travelWear())}</div><h2>${esc(S.pet.name)} 回来啦</h2>
    <p>它去了「${d.name}」，给你带回了：</p><div class="gift-list">${gifts}</div>${extra}
    ${S.mail.length ? '<p class="hint">花园的信箱里还有它寄来的明信片，记得去看看</p>' : ''}
    <div class="row"><button class="btn" data-close>欢迎回家</button></div>`,
    { onClose: () => { if (chilly) getSick('cold'); else say(pick(['外面真好玩！不过我有点饿了…', '走了好远的路，想洗个澡~', '下次还想去更远的地方！'])); } });
  addExp(20); afterAction();
}
function renderMailbox() {
  const el = $('#mailbox'); el.innerHTML = mailboxSVG(S.mail.length > 0); el.classList.toggle('has', S.mail.length > 0);
}
function openMailbox() {
  if (!S.mail.length) { toast(S.trip ? '信箱还是空的，明信片在路上了' : '信箱空空的，送' + S.pet.name + '去旅行才会有明信片'); return; }
  const id = S.mail.shift(), isNew = addCard(id), rare = id.split(':')[1] === 'b';
  Sound.sfx.page(); renderMailbox(); renderWall(); updateDots();
  const m = openModal(`<h2>${esc(S.pet.name)} 寄来的明信片</h2>${pcHTML(id, 'big')}
    <p>${rare ? '是很难遇见的珍贵风景！<br>' : ''}${isNew ? '已经收进旅行手帐啦' : '这张已经有了，换成了 5 颗橡果'}</p>
    <div class="row"><button class="btn" data-close>收好</button><button class="btn plain" id="to-album">去手帐看看</button></div>`);
  $('#to-album', m).onclick = () => { closeModal(); switchScene('album'); };
  afterAction();
}
/* 小屋墙上的绳子：挂最近的三张明信片 */
function renderWall() {
  const xs = [500, 600, 700], ys = [84, 93, 84], ids = S.cardLog.slice(-3);
  $('#wall-cards').innerHTML = ids.map((id, i) => {
    const p = id.split(':');
    return `<span class="pc${p[1] === 'b' ? ' rare' : ''}" style="left:calc(50% + var(--u) * ${xs[i] - 400 - 37});top:calc(100% - var(--u) * ${500 - ys[i]});transform:rotate(${[-4, 2, 5][i]}deg)"><span class="img">${postcardSVG(id, S.pet.type, travelWear())}</span></span>`;
  }).join('');
}

/* ---------- 旅行手帐（明信片 / 特产 / 贴纸） ---------- */
let albumTab = 'cards';
function renderAlbum() {
  $$('#album-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === albumTab));
  const body = $('#album-body'); let h = '';
  if (albumTab === 'cards') {
    const all = []; Object.keys(DESTS).forEach(d => { all.push(d + ':a', d + ':b'); });
    const got = all.filter(id => S.cards[id]).length;
    h = `<p class="album-note">收集到 ${got} / ${all.length} 张 · 带上不同的旅行用品，能去不同的地方</p><div class="pc-grid">` +
      all.map(id => S.cards[id] ? pcHTML(id) : `<span class="pc lock"><span class="img">？</span><span class="cap">${id.split(':')[1] === 'b' ? '珍贵风景' : '还没去过'}</span></span>`).join('') + '</div>';
  } else if (albumTab === 'souv') {
    h = '<p class="album-note">每个地方都有自己的特产，带着最爱的便当出门一定能带回来</p><div class="souv-grid">' +
      Object.keys(DESTS).map(d => { const k = DESTS[d].souv, n = S.souv[k] || 0; return `<div class="souv${n ? '' : ' lock'}">${icon(k, 'big')}<b>${n ? SOUVS[k] : '？？？'}</b><small>${n ? DESTS[d].name + ' ×' + n : '还没有'}</small></div>`; }).join('') + '</div>';
  } else {
    h = `<p class="album-note">贴纸 ${S.stickers.length} / ${STICKERS.length} · 多照顾、多旅行、多玩耍就能得到</p><div class="souv-grid">` +
      STICKERS.map(s => { const own = S.stickers.includes(s.id); return `<div class="souv${own ? '' : ' lock'}">${icon(s.ic, 'big')}<b>${s.name}</b><small>${own ? '已获得' : '还没有'}</small></div>`; }).join('') + '</div>';
  }
  body.innerHTML = h;
  if (S.albumNew) { S.albumNew = false; updateDots(); }
}

/* ---------- 来做客的小伙伴 ---------- */
function renderGuest() {
  const v = S.visitor;
  $('#guest').innerHTML = stumpSVG() + (v ? `<span class="friend">${friendSVG(v.id)}</span>${v.fed ? '' : '<span class="tag">请我吃点东西吧</span>'}` : '');
}
function tickVisitor(dt) {
  const v = S.visitor;
  if (v) { if (Date.now() > v.until) { S.visitor = null; renderGuest(); updateDots(); } return; }
  if (Math.random() < dt / (S.trip ? 60 : 140)) {
    const id = pick(Object.keys(FRIENDS));
    S.visitor = { id, until: Date.now() + 180000, fed: false };
    renderGuest(); updateDots(); Sound.sfx.pop();
    if (scene !== 'garden' && !Games.active) toast(FRIENDS[id].name + ' 来花园做客啦');
  }
}
function openGuest() {
  const v = S.visitor;
  if (!v) { toast('树桩上空空的，也许一会儿会有小客人来'); return; }
  const f = FRIENDS[v.id];
  if (v.fed) { toast(f.name + '：吃得好饱，谢谢你！'); return; }
  const foods = myFoods();
  const m = openModal(`<div class="hero">${friendSVG(v.id)}</div><h2>${f.name} 来做客啦</h2><p>“${f.line}”<br>请它吃点什么呢？</p>` +
    (foods.length ? '<div class="item-grid">' + foods.map(k => itemBtn(`data-gf="${k}"`, FOODS[k].ic, FOODS[k].name, '×' + S.inv[k])).join('') + '</div>' : noFoodHTML));
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-gf]'), g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'food'; switchScene(g.dataset.go); }
    if (b && S.visitor && !S.visitor.fed) {
      S.inv[b.dataset.gf]--; closeModal();
      S.visitor.fed = true; S.visitor.until = Date.now() + 8000;
      const n = rand(6, 14), bell = Math.random() < .25;
      if (bell) S.gear.bell = (S.gear.bell || 0) + 1;
      S.counters.guest++; renderGuest(); updateDots();
      const r = $('#guest').getBoundingClientRect();
      floatFx(icon('heart'), r.left + r.width / 2, r.top - 30);
      toast(f.name + '：谢谢款待！送你 ' + n + ' 颗橡果' + (bell ? '和一个幸运铃铛' : ''), 3200);
      addCoins(n); addExp(6); afterAction();
    }
  });
}

/* ---------- 花园 ---------- */
function plotStage(p) { return !p ? 'empty' : p.growth >= 100 ? 'ripe' : p.growth < 25 ? 's0' : p.growth < 60 ? 's1' : 's2'; }
function renderGarden() {
  $('#plots').innerHTML = S.plots.map((p, i) => `<button class="plot" data-i="${i}"></button>`).join('');
  S.plots.forEach((p, i) => renderPlot(i, true));
  renderMailbox(); renderGuest();
}
function renderPlot(i, force) {
  const el = $$('#plots .plot')[i]; if (!el) return;
  const p = S.plots[i], st = plotStage(p), growing = p && st !== 'ripe', dry = growing && p.water <= 0;
  const sig = st + '|' + (dry ? 1 : 0) + '|' + (p ? p.seed : '');
  if (force || el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.className = 'plot ' + st + (dry ? ' dry' : '') + (growing && !dry ? ' wet' : '');
    let h = '<span class="soil"></span>';
    if (!p) h += '<span class="plus">＋</span>';
    else {
      h += `<span class="plant">${plantSVG(st)}</span>`;
      if (st === 'ripe') h += `<span class="crop">${icon(SEEDS[p.seed].ic)}</span><span class="tag">收获</span>`;
      else h += '<span class="grow"><i></i></span>';
      if (dry) h += `<span class="thirst">${icon('drop')}</span>`;
    }
    el.innerHTML = h;
  }
  const bar = el.querySelector('.grow i');
  if (bar && p) bar.style.width = Math.min(100, p.growth) + '%';
}
function plotClick(i) {
  const p = S.plots[i];
  if (!p) openSeedPicker(i);
  else if (p.growth >= 100) harvest(i);
  else water(i);
}
function openSeedPicker(i) {
  const ids = Object.keys(S.seeds).filter(k => S.seeds[k] > 0 && SEEDS[k]);
  let html = '<h2>种点什么呢？</h2>';
  if (!ids.length) html += '<p class="empty">种子用完啦，去商店买一些吧~</p><div class="row"><button class="btn small" data-go="shop">去商店</button></div>';
  else html += '<div class="item-grid">' + ids.map(k => { const s = SEEDS[k]; return itemBtn(`data-seed="${k}"`, s.ic, s.name, '×' + S.seeds[k] + (s.food ? ' 结' + s.give + '个' : s.med ? ' 做药' + s.give + '份' : ' 可卖钱')); }).join('') + '</div>';
  const m = openModal(html);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-seed]'), g = e.target.closest('[data-go]');
    if (g) { closeModal(); shopTab = 'seed'; switchScene('shop'); }
    if (b && !S.plots[i]) {
      const k = b.dataset.seed; S.seeds[k]--;
      S.plots[i] = { seed: k, growth: 0, water: 0 };
      closeModal(); Sound.sfx.pop(); renderPlot(i, true);
      toast('种下了' + SEEDS[k].name + '，记得浇水哦'); save();
    }
  });
}
function water(i) {
  const p = S.plots[i];
  if (p.water > 80) { toast('水还很多呢，等一会儿再浇吧~'); return; }
  p.water = 100; p.growth = Math.min(99.9, p.growth + 4);
  const r = $$('#plots .plot')[i].getBoundingClientRect(), fx = $('#fx');
  const can = document.createElement('div'); can.className = 'can'; can.innerHTML = icon('can');
  can.style.left = (r.left + r.width * .5) + 'px'; can.style.top = (r.top - 30) + 'px';
  fx.appendChild(can); setTimeout(() => can.remove(), 1150);
  for (let k = 0; k < 8; k++) {
    const d = document.createElement('i'); d.className = 'wdrop';
    d.style.left = (r.left + r.width * .5 - 14 + Math.random() * 22) + 'px';
    d.style.top = (r.top + 6 + Math.random() * 10) + 'px';
    d.style.animationDelay = (.2 + k * .08) + 's';
    fx.appendChild(d); setTimeout(() => d.remove(), 1500);
  }
  Sound.sfx.water();
  S.counters.water++; progress('water'); addExp(3);
  renderPlot(i); afterAction();
}
function harvest(i) {
  const p = S.plots[i], s = SEEDS[p.seed];
  const r = $$('#plots .plot')[i].getBoundingClientRect(), cx = r.left + r.width / 2;
  if (s.food) {
    S.inv[s.food] = (S.inv[s.food] || 0) + s.give;
    for (let k = 0; k < s.give; k++) setTimeout(() => floatFx(icon(FOODS[s.food].ic), cx - 30 + k * 26, r.top + 20), k * 110);
    toast('收获了 ' + FOODS[s.food].name + ' ×' + s.give + '，可以当饭吃，也可以做便当');
    Sound.sfx.ok();
  } else if (s.med) {
    S.meds[s.med] = (S.meds[s.med] || 0) + s.give;
    floatFx(icon(MEDS[s.med].ic) + '+' + s.give, cx, r.top + 20);
    toast('收获了 ' + MEDS[s.med].name + ' ×' + s.give + '，生病的时候用得上');
    Sound.sfx.ok();
  } else {
    floatFx(acorns('+' + s.coins), cx, r.top + 20);
    toast('漂亮的' + s.name + '换了 ' + s.coins + ' 颗橡果'); addCoins(s.coins);
  }
  S.plots[i] = null;
  S.counters.harvest++; progress('harvest'); addExp(10);
  renderPlot(i, true);
  const g = $('#pet-garden'); g.classList.remove('trick-jump'); void g.offsetWidth; g.classList.add('trick-jump');
  setTimeout(() => g.classList.remove('trick-jump'), 1200);
  afterAction();
}
function tickGarden(dt) {
  S.plots.forEach((p, i) => {
    if (!p || p.growth >= 100) return;
    if (p.water > 0) {
      p.growth = Math.min(100, p.growth + 100 / SEEDS[p.seed].time * dt);
      p.water = Math.max(0, p.water - 100 / 45 * dt);
      if (p.growth >= 100) {
        if (scene === 'garden') Sound.sfx.pop();
        if (!Games.active) toast(SEEDS[p.seed].name + '成熟啦');
      }
    }
    if (scene === 'garden') renderPlot(i);
  });
}

/* ---------- 商店 ---------- */
let shopTab = 'food';
function renderShop() {
  $$('#shop-tabs .tab').forEach(t => t.classList.toggle('on', t.dataset.tab === shopTab));
  const card = (ic, name, d1, d2, price, kind, id, owned) =>
    `<div class="sitem">${icon(ic, 'big')}<b>${name}</b><small>${d1}</small><small>${d2}</small>` +
    (owned ? '<button class="btn small gray" disabled>已拥有</button>' : `<button class="btn small" data-buy="${kind}:${id}">${acorns(price)}</button>`) + '</div>';
  let h = '';
  if (shopTab === 'food') {
    const fav = PETS[S.pet.type].fav;
    for (const k in FOODS) { const f = FOODS[k]; h += card(f.ic, f.name, '饱饱+' + f.hunger + (f.happy ? ' 开心+' + f.happy : '') + (k === fav ? ' 最爱' : ''), '我有 ' + (S.inv[k] || 0) + ' 个', f.price, 'food', k); }
    for (const k in MEDS) { const m = MEDS[k]; h += card(m.ic, m.name, m.desc, '我有 ' + (S.meds[k] || 0) + ' 份', m.price, 'med', k); }
  } else if (shopTab === 'seed') {
    for (const k in SEEDS) { const s = SEEDS[k]; h += card(s.ic, s.name + '种子', s.food ? '能结 ' + s.give + ' 个' : s.med ? '能做 ' + s.give + ' 份' + MEDS[s.med].name : '开花能换 ' + s.coins + ' 橡果', '我有 ' + (S.seeds[k] || 0) + ' 颗', s.price, 'seed', k); }
  } else if (shopTab === 'wear') {
    for (const k in WEARS) { const w = WEARS[k]; h += card(w.ic, w.name, '给宠物戴上', '', w.price, 'wear', k, S.owned.includes(k)); }
  } else {
    for (const k in GEAR) { const g = GEAR[k]; h += card(g.ic, g.name, g.desc, g.once ? '用一次少一个 · 有 ' + (S.gear[k] || 0) + ' 个' : '可以一直用', g.price, 'gear', k, !g.once && !!S.gear[k]); }
  }
  $('#shop-grid').innerHTML = h;
}
function buy(kind, id, btn) {
  const item = { food: FOODS, seed: SEEDS, wear: WEARS, gear: GEAR, med: MEDS }[kind][id];
  if (!item) return;
  if (S.coins < item.price) { Sound.sfx.bad(); toast('橡果不够啦，去游乐场玩游戏捡一些吧'); return; }
  S.coins -= item.price;
  if (kind === 'food') S.inv[id] = (S.inv[id] || 0) + 1;
  else if (kind === 'seed') S.seeds[id] = (S.seeds[id] || 0) + 1;
  else if (kind === 'med') S.meds[id] = (S.meds[id] || 0) + 1;
  else if (kind === 'gear') { S.gear[id] = (S.gear[id] || 0) + 1; if (!item.once) toast('买到啦！准备行囊的时候记得带上' + item.name); }
  else { S.owned.push(id); S.wear = id; renderPet(true); toast('买到啦！已经帮 ' + S.pet.name + ' 戴上了'); }
  const r = btn.getBoundingClientRect();
  floatFx(icon(item.ic) + '+1', r.left + r.width / 2, r.top - 20);
  Sound.sfx.coin(); updateHUD(); renderShop(); save();
}

/* ---------- 每日签到、任务和贴纸 ---------- */
function checkDaily() {
  const d = dayNum();
  if (S.daily.day !== d) {
    S.streak = S.daily.day === d - 1 ? (S.streak || 0) + 1 : 1;
    S.daily = { day: d, signed: false, prog: {}, claimed: {} };
    save();
  }
  if (!S.daily.signed && !modalOpen()) {
    const bonus = 30 + Math.min(6, S.streak - 1) * 5;
    const m = openModal(`<div class="hero">${icon('gift')}</div><h2>每日签到 · 第 ${S.streak} 天</h2><p>${esc(S.pet.name)} 每天都在等你来哦<br>今天的礼物：<b>${bonus} 颗橡果</b></p><div class="row"><button class="btn big" id="sign-go">收下礼物</button></div>`, { noClose: true });
    $('#sign-go', m).onclick = () => { S.daily.signed = true; closeModal(); addCoins(bonus); confetti(); toast('签到成功，橡果 +' + bonus); save(); };
  }
  updateDots();
}
function progress(key) {
  const t = TASKS.find(x => x.id === key); if (!t) return;
  const before = S.daily.prog[key] || 0;
  S.daily.prog[key] = before + 1;
  if (before < t.need && before + 1 >= t.need) setTimeout(() => toast('任务完成：' + t.name + '，去领奖励吧'), 900);
  updateDots();
}
function stickerValue(s) { return s.c === 'level' ? S.level : s.c === 'cards' ? Object.keys(S.cards).length : (S.counters[s.c] || 0); }
function checkStickers() {
  STICKERS.forEach(s => {
    if (!S.stickers.includes(s.id) && stickerValue(s) >= s.n) {
      S.stickers.push(s.id); S.albumNew = true; updateDots();
      setTimeout(() => { banner('新贴纸：' + s.name); Sound.sfx.level(); }, 1200);
    }
  });
}
function openTasks() {
  let h = '<h2>今日任务</h2>';
  TASKS.forEach(t => {
    const v = Math.min(t.need, S.daily.prog[t.id] || 0), done = v >= t.need, got = S.daily.claimed[t.id];
    h += `<div class="task">${icon(t.ic)}<div class="t-mid">${t.name}（${v}/${t.need}）<div class="t-bar"><i style="width:${v / t.need * 100}%"></i></div></div>` +
      (got ? '<button class="btn small gray" disabled>已领取</button>' : done ? `<button class="btn small" data-claim="${t.id}">领 ${acorns(t.coin)}</button>` : `<button class="btn small gray" disabled>${acorns(t.coin)}</button>`) + '</div>';
  });
  h += '<p class="hint">贴纸、明信片和特产都收在“手帐”里</p>';
  const m = openModal(h);
  m.addEventListener('click', e => {
    const b = e.target.closest('[data-claim]'); if (!b) return;
    const t = TASKS.find(x => x.id === b.dataset.claim);
    if (!t || S.daily.claimed[t.id]) return;
    S.daily.claimed[t.id] = true; addCoins(t.coin);
    const r = b.getBoundingClientRect(); floatFx(acorns('+' + t.coin), r.left + r.width / 2, r.top);
    updateDots(); save(); openTasks();
  });
}

/* ---------- 设置 ---------- */
function openMenu() {
  const m = openModal(`<h2>设置</h2>
    <div class="row"><button class="btn small plain" id="m-rename">改名字</button><button class="btn small green" id="m-title">回到封面</button></div>
    <h3>给爸爸妈妈的话</h3>
    <p style="font-size:15px;text-align:left">进度会自动保存在这台设备的浏览器里。一次旅行大约 2～4 分钟，关掉游戏时间也照常走。连续玩 20 分钟会提醒孩子休息眼睛。宠物太脏、太饿或蛋糕吃太多时，偶尔会着凉或肚子疼，吃药加休息就好，不会变重，更不会离开。</p>
    <div class="row"><button class="btn small gray" id="m-reset">重新领养一只</button></div>`);
  $('#m-rename', m).onclick = () => {
    const m2 = openModal(`<h2>新名字</h2><input id="rn" class="text-input" maxlength="6" value="${esc(S.pet.name)}" autocomplete="off"><div class="row"><button class="btn" id="rn-ok">好啦</button></div>`);
    $('#rn-ok', m2).onclick = () => { const v = $('#rn', m2).value.trim().slice(0, 6); if (v) { S.pet.name = v; updateHUD(); renderAway(); save(); if (!S.trip) say('我的新名字是' + v + '！'); } closeModal(); };
  };
  $('#m-title', m).onclick = () => { closeModal(); save(); backToTitle(); };
  $('#m-reset', m).onclick = () => confirmReset();
}
function confirmReset() {
  const m = openModal(`<h2>真的要重新领养吗？</h2><p>现在的宠物、橡果、花园和明信片都会重新开始哦。</p><div class="row"><button class="btn" data-close>再想想</button><button class="btn gray" id="rs-ok">重新领养</button></div>`);
  $('#rs-ok', m).onclick = () => {
    closeModal(); try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
    S = null; stopTicker(); showChoose();
  };
}
function backToTitle() { stopTicker(); S = null; Sound.music('home'); initTitle(); showScreen('title'); }

/* ---------- 场景切换 ---------- */
let scene = 'home', built = false;
const GAME_COLORS = ['#EBB0A6', '#A9CDD9', '#CBBBDD', '#EBC66B', '#B9CFA0'];
function buildScenes() {
  if (built) return; built = true;
  $('#scene-home .bg').innerHTML = sceneHomeSVG();
  $('#scene-garden .bg').innerHTML = sceneGardenSVG();
  $('#scene-play .bg').innerHTML = scenePlaySVG();
  $('#scene-shop .bg').innerHTML = sceneShopSVG();
  $('#tub').innerHTML = tubSVG();
  renderGameCards();
}
function renderGameCards() {
  $('#game-cards').innerHTML = Games.LIST.map((g, i) => `<button class="gcard" data-game="${g.id}" style="background:${GAME_COLORS[i % 5]}">${icon(g.ic)}<b>${g.name}</b><small>${g.desc}</small><i class="lv-tag">${Games.levelName(g.id)}</i></button>`).join('');
}
function fitStage() {
  const st = $('#stage'), W = st.clientWidth, H = st.clientHeight; if (!W || !H) return;
  const u = Math.max(W / 800, H / 500), pu = Math.max(0.3, Math.min(u, (H - 44 * u - 46) / 215));
  st.style.setProperty('--u', u + 'px'); st.style.setProperty('--pu', pu + 'px'); st.style.setProperty('--stH', H + 'px');
}
function playSceneMusic() {
  Sound.music({ home: S && S.sleeping ? 'night' : 'home', garden: 'garden', play: 'play', shop: 'shop', album: 'album' }[scene]);
}
function switchScene(n) {
  if (bath) endBath();
  scene = n;
  $$('.scene').forEach(el => el.classList.toggle('active', el.id === 'scene-' + n));
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.scene === n));
  $('#actions').classList.toggle('hide', n !== 'home');
  if (n === 'garden') renderGarden();
  if (n === 'shop') renderShop();
  if (n === 'play') renderGameCards();
  if (n === 'album') { renderAlbum(); Sound.sfx.page(); }
  fitStage(); playSceneMusic();
}

/* ---------- 时间流逝 ---------- */
let ticker = null, lastTick = 0, tickN = 0, playSecs = 0, restDue = false;
function stopTicker() { clearInterval(ticker); ticker = null; }
function applyOffline() {
  const el = clamp((Date.now() - (S.last || Date.now())) / 1000, 0, 8 * 3600);
  if (el < 5) return;
  const st = S.stats, soft = (k, rate) => { st[k] = Math.max(Math.min(st[k], 20), st[k] - el * rate * 0.2); };
  if (!S.trip) {
    if (S.sleeping) { st.energy = clamp(st.energy + el * 1.6, 0, 100); if (st.energy >= 100) S.sleeping = false; }
    else soft('energy', 0.03);
    soft('hunger', 0.1); soft('clean', 0.045); soft('happy', 0.06);
  }
  S.plots.forEach(p => {
    if (!p || p.growth >= 100) return;
    const eff = Math.min(el, p.water / 100 * 45);
    p.growth = Math.min(100, p.growth + 100 / SEEDS[p.seed].time * eff);
    p.water = Math.max(0, p.water - el * 100 / 45);
  });
  if (S.visitor && Date.now() > S.visitor.until) S.visitor = null;
}
function tick() {
  if (!S) return;
  const now = Date.now(), dt = clamp((now - lastTick) / 1000, 0, 5); lastTick = now;
  const st = S.stats;
  if (S.trip) { /* 旅行途中，家里的状态先不变 */ }
  else if (S.sleeping) {
    st.energy = clamp(st.energy + 1.6 * dt, 0, 100); st.hunger = clamp(st.hunger - 0.03 * dt, 0, 100);
    if (st.energy >= 100 && !(S.sick && S.sick.type === 'cold' && S.sick.treated)) {
      S.sleeping = false; renderPet(true); updateActions(); playSceneMusic();
      say('睡饱啦！精神满满~'); toast(S.pet.name + ' 睡醒啦');
    }
  } else if (!Games.active) {
    st.hunger = clamp(st.hunger - 0.1 * dt, 0, 100); st.clean = clamp(st.clean - 0.045 * dt, 0, 100);
    st.happy = clamp(st.happy - 0.06 * dt, 0, 100); st.energy = clamp(st.energy - 0.03 * dt, 0, 100);
  }
  tickGarden(dt); tickTrip(); if (S) { tickVisitor(dt); tickSick(dt); }
  updateHUD(); renderPet();
  tickN++; playSecs += dt;
  if (tickN % 5 === 0) save();
  if (tickN % 16 === 6) autoSay();
  if (tickN % 16 === 14) idleAct();
  if (playSecs >= 20 * 60) { playSecs = 0; restDue = true; }
  if (restDue && !Games.active && !modalOpen() && !bath) {
    restDue = false;
    openModal(`<div class="hero">${icon('eye')}</div><h2>眼睛休息时间到</h2><p>你已经玩了 20 分钟啦。<br>站起来动一动，看看窗外远远的地方，<br>${esc(S.pet.name)} 会在这里等你回来~</p><div class="row"><button class="btn" data-close>我休息好啦</button></div>`);
  }
}

/* ---------- 开始界面 ---------- */
function initTitle() {
  $('#title-pets').innerHTML = Object.keys(PETS).map((k, i) => `<div class="tp" style="animation-delay:${(i * .3).toFixed(2)}s">${petSVG(k, 'happy')}</div>`).join('');
  const has = !!loadState();
  $('#btn-continue').style.display = has ? '' : 'none';
  $('#btn-new').textContent = has ? '重新领养' : '开始领养';
  $('#btn-continue').onclick = () => { Sound.init(); Sound.sfx.click(); S = loadState(); if (S) enterGame(false); else showChoose(); };
  $('#btn-new').onclick = () => {
    Sound.init(); Sound.sfx.click(); Sound.music('home');
    if (has) confirmReset(); else showChoose();
  };
}
let chosen = 'bird';
function showChoose() {
  showScreen('choose'); Sound.music('shop');
  const grid = $('#choose-grid'), inp = $('#pet-name');
  grid.innerHTML = Object.keys(PETS).map(k => `<button class="pcard" data-type="${k}"><div class="pp">${petSVG(k, 'happy')}</div><b>${PETS[k].name}</b><small>${PETS[k].desc}</small></button>`).join('');
  delete inp.dataset.touched;
  const sel = (k, quiet) => {
    chosen = k; $$('.pcard').forEach(c => c.classList.toggle('sel', c.dataset.type === k));
    if (!inp.dataset.touched) inp.value = PETS[k].defName;
    if (!quiet) Sound.sfx[PETS[k].fly ? 'chirp' : 'pop']();
  };
  grid.onclick = e => { const c = e.target.closest('.pcard'); if (c) sel(c.dataset.type); };
  inp.oninput = () => { inp.dataset.touched = '1'; };
  sel('bird', true);
  $('#btn-adopt').onclick = () => {
    Sound.init();
    const name = (inp.value || '').trim().slice(0, 6) || PETS[chosen].defName;
    S = newState(chosen, name); save(); enterGame(true);
  };
}
function enterGame(isNew) {
  showScreen('game'); buildScenes();
  if (!isNew) applyOffline();
  Sound.setOn(S.soundOn !== false);
  petSig = ''; tempMood = null; shopTab = 'food'; albumTab = 'cards'; playSecs = 0; restDue = false;
  renderPet(true); updateHUD(); updateActions(); updateSoundBtn(); resetIdle(); renderAway(); renderWall(); updateDots(); switchScene('home');
  stopTicker(); lastTick = Date.now(); ticker = setInterval(tick, 1000);
  if (isNew) {
    confetti(); Sound.sfx.level(); banner('欢迎 ' + S.pet.name + ' 回家');
    say('你好呀！我是' + S.pet.name + '，以后请多多照顾~', 4200);
    setTimeout(() => { if (S) checkDaily(); }, 3000);
  } else {
    if (!S.trip) say(pick(['你回来啦！我好想你~', '欢迎回来！今天做点什么呢？']), 3200);
    setTimeout(() => { if (S) checkDaily(); }, 700);
  }
}

/* ---------- 绑定事件 ---------- */
function bindEvents() {
  $('#nav').addEventListener('click', e => { const b = e.target.closest('[data-scene]'); if (b) { Sound.sfx.click(); switchScene(b.dataset.scene); } });
  $('#actions').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    Sound.sfx.click();
    ({ feed: openFeed, bath: startBath, sleep: toggleSleep, talent: () => (S.sick && !S.trip ? openMeds() : talent()), dress: openWardrobe, travel: openPack })[b.dataset.act]();
  });
  $('#pet').addEventListener('pointerdown', patPet);
  $('#pet-garden').addEventListener('pointerdown', e => { if (!S.sleeping) { floatFx(icon('heart'), e.clientX, e.clientY - 20); Sound.sfx.pop(); } });
  const layer = $('#bath-layer');
  layer.addEventListener('pointermove', bathMove); layer.addEventListener('pointerdown', bathMove);
  layer.addEventListener('click', e => { if (e.target.closest('.bath-x')) endBath(); });
  $('#plots').addEventListener('click', e => { const b = e.target.closest('.plot'); if (b) plotClick(+b.dataset.i); });
  $('#mailbox').onclick = () => openMailbox();
  $('#guest').onclick = () => { Sound.sfx.click(); openGuest(); };
  $('#scene-shop').addEventListener('click', e => {
    const t = e.target.closest('.tab'), b = e.target.closest('[data-buy]');
    if (t) { Sound.sfx.click(); shopTab = t.dataset.tab; renderShop(); }
    if (b) { const a = b.dataset.buy.split(':'); buy(a[0], a[1], b); }
  });
  $('#scene-album').addEventListener('click', e => {
    const t = e.target.closest('.tab'), c = e.target.closest('.pc[data-card]');
    if (t) { Sound.sfx.page(); albumTab = t.dataset.tab; renderAlbum(); }
    if (c) {
      Sound.sfx.page(); const id = c.dataset.card;
      openModal(pcHTML(id, 'big') + `<p>${esc(S.pet.name)} 在「${DESTS[id.split(':')[0]].name}」${id.split(':')[1] === 'b' ? '<br>遇见了很难得的风景' : ''}</p>`);
    }
  });
  $('#game-cards').addEventListener('click', e => { const b = e.target.closest('[data-game]'); if (b) { Sound.sfx.click(); Games.open(b.dataset.game); } });
  $('#btn-tasks').onclick = () => { Sound.sfx.click(); openTasks(); };
  $('#btn-menu').onclick = () => { Sound.sfx.click(); openMenu(); };
  $('#btn-music').onclick = () => { S.soundOn = !S.soundOn; Sound.setOn(S.soundOn); updateSoundBtn(); Sound.sfx.click(); save(); };
  window.addEventListener('resize', fitStage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); Sound.suspend(); } else { Sound.resume(); lastTick = Date.now(); }
  });
  window.addEventListener('pagehide', save);
}

window.addEventListener('DOMContentLoaded', () => {
  $('#svg-defs').innerHTML = '<svg width="0" height="0"><defs>' + FILTER_DEFS + '</defs></svg>';
  $('#title-bg').innerHTML = sceneTitleSVG();
  fillIcons(document);
  bindEvents(); initTitle();
});
