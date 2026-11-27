'use strict';
/* ==========================================================
 *  萌宠小花园 · 林间空地的八个小游戏（素材全部用手绘图标）
 * ========================================================== */
const Games = (function () {
  const LIST = [
    { id: 'catch',  name: '接果果',     ic: 'basket',  desc: '接住掉下来的水果', how: '左右移动手指或鼠标（也可以用 ← → 键），用篮子接住水果和星星。小心，别接到臭袜子和辣椒！' },
    { id: 'fly',    name: '飞飞摘星',   ic: 'star',    desc: '飞上天空摘星星',   how: '上下移动手指或鼠标（也可以用 ↑ ↓ 键），飞起来摘星星、气球和彩虹。躲开打雷的乌云，一共有 3 颗爱心！' },
    { id: 'memory', name: '翻翻乐',     ic: 'book',    desc: '找出一样的卡片',   how: '每次翻开两张卡片，找到一模一样的就配对成功。用的步数越少，奖励越多！' },
    { id: 'melody', name: '鹦鹉学唱',   ic: 'note',    desc: '记住旋律跟着弹',   how: '先仔细听一段旋律，再按同样的顺序点彩色琴键。每过一关，旋律会多一个音哦！' },
    { id: 'math',   name: '口算小达人', ic: 'tasks',   desc: '算对了有奖励',     how: '一共 10 道口算题，一到六年级都有，先选好年级再开始。选出正确答案，算对越多橡果越多！' },
    { id: 'match',  name: '水果消消乐', ic: 'match3',  desc: '三个一样连成线',   how: '点一个水果，再点它旁边的水果，两个就会交换位置。三个或更多一样的水果连成一排就会消掉，连着消分数更高。步数有限，消得越多橡果越多！' },
    { id: 'chess',  name: '国际象棋',   ic: 'chess',   desc: '和电脑下一盘棋',   how: '你走白棋，电脑走黑棋。点一下自己的棋子，再点亮起来的格子就能走。把对方的国王将死就赢啦！兵走到最后一排会变成皇后。' },
    { id: 'gomoku', name: '五子棋',     ic: 'gomoku',  desc: '先连成五个就赢',   how: '你下黑子，电脑下白子，轮流在格子里落子。横着、竖着或斜着先连成五个的赢。别忘了拦住对方哦！' }
  ];
  let cur = null;
  const imgCache = {};

  /* 等级：口算按年级分，其余游戏分三档难度。选好以后会记住 */
  const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'], DIFFS = ['轻松', '普通', '挑战'];
  const levelsOf = id => id === 'math' ? GRADES : DIFFS;
  function lvOf(id) { const all = levelsOf(id), v = (S.gameLv || {})[id]; return v >= 1 && v <= all.length ? v : (id === 'math' ? 3 : id === 'chess' ? 1 : 2); }
  const levelName = id => levelsOf(id)[lvOf(id) - 1];

  /* 宠物在家就用宠物；出门旅行了，就由来做客的小伙伴陪着玩 */
  const buddy = () => gone() ? (S.visitor ? S.visitor.id : 'hedgehog') : null;
  function playerSVG(mood) { const b = buddy(); return b ? friendSVG(b) : petSVG(S.pet.type, mood, S.wear); }
  function svgImg(svg) { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); return img; }
  function playerImg() { const b = buddy(); return svgImg(b ? friendSVG(b, true) : petSVG(S.pet.type, 'happy', S.wear, true)); }
  function icoImg(name) { return imgCache[name] || (imgCache[name] = svgImg(iconImageSVG(name))); }
  const ready = img => img.complete && img.naturalWidth > 0;
  function drawIcon(c, name, x, y, size) { const im = icoImg(name); if (ready(im)) c.drawImage(im, x - size / 2, y - size / 2, size, size); }

  function open(id) {
    const g = LIST.find(x => x.id === id); if (!g) return;
    if (!gone()) {
      if (S.sick) { toast(S.pet.name + ' 生病了，等它好了再一起玩吧'); return; }
      if (S.sleeping) { toast(S.pet.name + ' 正在睡觉呢，先叫它起床吧'); return; }
      if (S.stats.energy < 10) { toast(S.pet.name + ' 太累啦，让它睡一会儿再玩吧'); return; }
    }
    $('#game').classList.add('on');
    $('#g-title').innerHTML = icon(g.ic) + g.name;
    intro(g);
  }
  function intro(g) {
    stop(); $('#g-info').textContent = '';
    const b = buddy();
    $('#g-body').innerHTML = `<div class="g-panel"><div class="g-big">${icon(g.ic)}</div><h2>${g.name}</h2><p>${g.how}</p>` +
      (b ? `<p class="hint">${esc(S.pet.name)} ${S.runaway ? '不在家' : '出门旅行了'}，这次由${FRIENDS[b].name}陪你玩</p>` : '') +
      `<span class="lv-label">${g.id === 'math' ? '选一个年级' : '选一个难度'}</span><div class="lv-pick" id="lv-pick">` +
      levelsOf(g.id).map((n, i) => `<button class="lv-btn${lvOf(g.id) === i + 1 ? ' on' : ''}" data-lv="${i + 1}">${n}</button>`).join('') +
      '</div><button class="btn big" id="g-start">开始</button></div>';
    $('#lv-pick').onclick = e => {
      const t = e.target.closest('[data-lv]'); if (!t) return;
      if (!S.gameLv) S.gameLv = {};
      S.gameLv[g.id] = +t.dataset.lv; save(); Sound.sfx.pop();
      $$('#lv-pick .lv-btn').forEach(x => x.classList.toggle('on', x === t));
    };
    $('#g-start').onclick = () => { Sound.sfx.click(); run(g); };
  }
  function run(g) {
    stop();
    if (!gone()) { S.stats.energy = clamp(S.stats.energy - 10, 0, 100); updateHUD(); }
    $('#g-body').innerHTML = '';
    const G = {
      alive: true, lv: lvOf(g.id), body: $('#g-body'), offs: [], timers: [],
      info(html) { $('#g-info').innerHTML = html; },
      on(target, ev, fn, opt) { target.addEventListener(ev, fn, opt); this.offs.push(() => target.removeEventListener(ev, fn, opt)); },
      later(fn, ms) { const self = this; this.timers.push(setTimeout(() => { if (self.alive) fn(); }, ms)); },
      end(coins, text) { finish(g, G, coins, text); }
    };
    cur = G; Games.active = true;
    Sound.music(g.id === 'melody' ? null : 'game');
    IMPL[g.id](G);
  }
  function stop() {
    if (!cur) return;
    cur.alive = false; cur.offs.forEach(f => f()); cur.timers.forEach(clearTimeout); cur = null;
  }
  function finish(g, G, coins, text) {
    if (!G.alive) return;
    stop();
    coins = Math.max(0, Math.round(coins));
    Sound.music('play'); Sound.sfx[coins > 0 ? 'level' : 'bad']();
    if (coins >= 15) confetti();
    S.coins += coins; if (!gone()) addStat('happy', 12);
    S.counters.game++; progress('game');
    addExp(12 + Math.min(20, coins)); afterAction();
    $('#g-info').textContent = '';
    $('#g-body').innerHTML = `<div class="g-panel"><div class="g-big">${coins >= 15 ? icon('trophy') : coins > 0 ? icon('star') : playerSVG('normal')}</div><h2>${text}</h2>
      <p class="g-reward">${icon('acorn')}+${coins}${gone() ? '' : '　' + icon('heart') + '+12'}</p>
      <div class="row"><button class="btn" id="g-again">再玩一次</button><button class="btn plain" id="g-exit">回空地</button></div></div>`;
    $('#g-again').onclick = () => {
      Sound.sfx.click();
      if (!gone() && S.stats.energy < 10) { close(); toast(S.pet.name + ' 玩累啦，让它睡一会儿吧'); return; }
      run(g);
    };
    $('#g-exit').onclick = () => { Sound.sfx.click(); close(); };
  }
  function close() {
    stop(); Games.active = false;
    $('#game').classList.remove('on'); $('#g-body').innerHTML = '';
    renderGameCards(); playSceneMusic(); save();
  }

  function mkCanvas(G) {
    const cv = document.createElement('canvas'); G.body.appendChild(cv);
    const o = { cv, c: cv.getContext('2d'), W: 0, H: 0 };
    o.fit = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      o.W = Math.max(50, G.body.clientWidth); o.H = Math.max(50, G.body.clientHeight);
      cv.width = Math.round(o.W * d); cv.height = Math.round(o.H * d);
      cv.style.width = o.W + 'px'; cv.style.height = o.H + 'px';
      o.c.setTransform(d, 0, 0, d, 0, 0);
    };
    o.fit(); G.on(window, 'resize', o.fit);
    return o;
  }
  const FONT = 'bold 24px "LXGW WenKai","STKaiti","KaiTi","楷体",serif';
  function drawPops(c, pops, dt) {
    c.font = FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const p of pops) {
      p.t -= dt; p.y -= 50 * dt;
      c.globalAlpha = Math.max(0, p.t / .7); c.fillStyle = p.bad ? '#C9705F' : '#6B4F3A';
      c.fillText(p.s, p.x, p.y);
    }
    c.globalAlpha = 1;
  }
  /* 手绘感的背景：纸色天空 + 棕色铅笔线勾的山坡和云 */
  function hill(c, cx, cy, rx, ry, fill) {
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = fill; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#6B4F3A'; c.stroke();
  }
  function cloud(c, x, y, s) {
    c.beginPath(); c.ellipse(x, y, 54 * s, 18 * s, 0, 0, Math.PI * 2); c.ellipse(x + 20 * s, y - 14 * s, 30 * s, 20 * s, 0, 0, Math.PI * 2);
    c.fillStyle = '#FFFDF6'; c.fill();
  }
  const infoLine = (score, time, hearts) => icon('star') + score + (hearts != null ? '　' + icon('heart').repeat(Math.max(0, hearts)) : '') + '　剩 ' + Math.max(0, Math.ceil(time)) + ' 秒';

  const IMPL = {};

  /* ---------- 1. 接果果 ---------- */
  IMPL.catch = function (G) {
    const K = mkCanvas(G), c = K.c, img = playerImg(), wide = !!buddy();
    const GOOD = ['apple', 'strawberry', 'orange', 'pear', 'peach', 'carrot'], BAD = ['sock', 'pepper'];
    GOOD.concat(BAD, ['star', 'basket']).forEach(icoImg);
    // 三档难度：下落速度、坏东西的比例、掉落间隔、奖励倍数
    const D = [null, { v: .75, bad: .12, gap: 1.15, pay: .8 }, { v: 1, bad: .2, gap: 1, pay: 1 }, { v: 1.3, bad: .28, gap: .85, pay: 1.3 }][G.lv];
    let px = K.W / 2, tx = px, score = 0, time = 40, items = [], pops = [], spawn = .5, last = performance.now(), shake = 0, shown = -1;
    const keys = {};
    const setX = e => { tx = e.clientX - K.cv.getBoundingClientRect().left; };
    G.on(K.cv, 'pointerdown', setX); G.on(K.cv, 'pointermove', setX);
    G.on(window, 'keydown', e => { keys[e.key] = true; }); G.on(window, 'keyup', e => { keys[e.key] = false; });

    function frame(now) {
      if (!G.alive) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const W = K.W, H = K.H, el = 40 - time;
      time -= dt;
      if (keys.ArrowLeft) tx -= 560 * dt; if (keys.ArrowRight) tx += 560 * dt;
      const size = clamp(H * .26, 70, 130), ph = wide ? size * .84 : size, py = H - ph - 4, fs = clamp(H * .1, 34, 54);
      tx = clamp(tx, size * .4, W - size * .4); px += (tx - px) * Math.min(1, dt * 14);
      spawn -= dt;
      if (spawn <= 0) {
        const r = Math.random(), bad = r < D.bad, star = !bad && r < D.bad + .1;
        items.push({ x: 26 + Math.random() * Math.max(1, W - 52), y: -30, v: (H * .28 + Math.random() * H * .13) * (1 + el / 55) * D.v, e: bad ? pick(BAD) : star ? 'star' : pick(GOOD), t: bad ? -2 : star ? 3 : 1, a: Math.random() * 6 });
        spawn = Math.max(.32, .66 - el / 110) * D.gap;
      }
      for (const it of items) {
        it.y += it.v * dt;
        if (!it.hit && it.y > py - size * .4 && it.y < py + size * .12 && Math.abs(it.x - px) < size * .47) {
          it.hit = true; score = Math.max(0, score + it.t);
          pops.push({ x: it.x, y: py - size * .5, t: .7, s: (it.t > 0 ? '+' : '') + it.t, bad: it.t < 0 });
          if (it.t > 0) Sound.sfx[it.t > 1 ? 'coin' : 'pop'](); else { Sound.sfx.bad(); shake = .3; }
        }
      }
      items = items.filter(it => !it.hit && it.y < H + 40);
      pops = pops.filter(p => p.t > 0);

      c.fillStyle = '#E4EFDF'; c.fillRect(0, 0, W, H);
      cloud(c, W * .2, H * .18, 1); cloud(c, W * .76, H * .3, .8);
      hill(c, W * .25, H + 40, W * .5, 110, '#CFE0B6'); hill(c, W * .8, H + 60, W * .5, 120, '#BAD197');
      hill(c, W / 2, H + 70, W * .9, 110, '#A9C987');
      for (const it of items) { c.save(); c.translate(it.x, it.y); c.rotate(Math.sin(now / 300 + it.a) * .25); drawIcon(c, it.e, 0, 0, fs); c.restore(); }
      shake = Math.max(0, shake - dt);
      const sx = shake > 0 ? Math.sin(now / 18) * 7 : 0;
      if (ready(img)) c.drawImage(img, px - size / 2 + sx, py, size, ph);
      drawIcon(c, 'basket', px + sx, py - size * .16, size * .62);
      drawPops(c, pops, dt);
      const sec = Math.ceil(time); if (sec !== shown || pops.length) { shown = sec; G.info(infoLine(score, time)); }
      if (time <= 0) { G.end(Math.min(30, score * .6) * D.pay, score >= 25 ? `太厉害了！接到 ${score} 分` : `接到 ${score} 分，真不错`); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- 2. 飞飞摘星 ---------- */
  IMPL.fly = function (G) {
    const K = mkCanvas(G), c = K.c, img = playerImg(), b = buddy(), flyer = !b && !!PETS[S.pet.type].fly;
    ['star', 'balloon', 'rainbow', 'storm', 'heartbreak'].forEach(icoImg);
    // 三档难度：飞行速度、乌云的比例、爱心数、奖励倍数
    const D = [null, { v: .75, storm: .16, hearts: 4, pay: .8 }, { v: 1, storm: .24, hearts: 3, pay: 1 }, { v: 1.25, storm: .32, hearts: 3, pay: 1.3 }][G.lv];
    let y = K.H / 2, ty = y, score = 0, hearts = D.hearts, time = 45, items = [], pops = [], spawn = .6, inv = 0, last = performance.now(), scroll = 0, shown = '';
    const clouds = []; for (let i = 0; i < 6; i++) clouds.push({ x: Math.random(), y: Math.random() * .7, s: .6 + Math.random() * .8 });
    const keys = {};
    const setY = e => { ty = e.clientY - K.cv.getBoundingClientRect().top; };
    G.on(K.cv, 'pointerdown', setY); G.on(K.cv, 'pointermove', setY);
    G.on(window, 'keydown', e => { keys[e.key] = true; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); });
    G.on(window, 'keyup', e => { keys[e.key] = false; });

    function frame(now) {
      if (!G.alive) return;
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const W = K.W, H = K.H, el = 45 - time;
      time -= dt; inv = Math.max(0, inv - dt);
      if (keys.ArrowUp) ty -= 520 * dt; if (keys.ArrowDown) ty += 520 * dt;
      const size = clamp(H * .2, 60, 110), px = W * .2, fs = clamp(H * .1, 34, 54);
      ty = clamp(ty, size * .9, H - size * .6); y += (ty - y) * Math.min(1, dt * 9);
      const speed = (170 + el * 4) * clamp(W / 640, .7, 1.4) * D.v;
      scroll += speed * dt;
      spawn -= dt;
      if (spawn <= 0) {
        const r = Math.random();
        const it = r < D.storm ? { e: 'storm', t: -1 } : r < D.storm + .1 ? { e: 'balloon', t: 2 } : r < D.storm + .15 ? { e: 'rainbow', t: 5 } : { e: 'star', t: 1 };
        it.x = W + 40; it.y = 40 + Math.random() * Math.max(1, H - 100); it.w = Math.random() * 6;
        items.push(it); spawn = Math.max(.34, .72 - el / 100);
      }
      for (const it of items) {
        it.x -= speed * dt;
        const iy = it.y + Math.sin(now / 400 + it.w) * 8;
        if (!it.hit && Math.hypot(it.x - px, iy - y) < size * .4 + fs * .34) {
          if (it.t > 0) { it.hit = true; score += it.t; pops.push({ x: it.x, y: iy - 20, t: .7, s: '+' + it.t }); Sound.sfx[it.t > 1 ? 'coin' : 'pop'](); }
          else if (inv <= 0) { it.hit = true; hearts--; inv = 1.3; Sound.sfx.bad(); pops.push({ x: px, y: y - size * .7, t: .7, s: '哎呀', bad: true }); }
        }
      }
      items = items.filter(it => !it.hit && it.x > -50);
      pops = pops.filter(p => p.t > 0);

      c.fillStyle = '#DCECE6'; c.fillRect(0, 0, W, H);
      for (const cl of clouds) {
        const cx = ((cl.x * (W + 300) - scroll * .25 * cl.s) % (W + 300) + (W + 300)) % (W + 300) - 150;
        cloud(c, cx, cl.y * H + 30, cl.s);
      }
      for (let i = -1; i < 6; i++) { const hx = ((i * 260 - scroll * .5) % 1560 + 1560) % 1560 - 260; hill(c, hx, H + 34, 190, 74, i % 2 ? '#BAD197' : '#A9C987'); }
      for (const it of items) drawIcon(c, it.e, it.x, it.y + Math.sin(now / 400 + it.w) * 8, fs);
      c.save(); c.translate(px, y); c.rotate(clamp((ty - y) * .004, -.35, .35));
      if (inv > 0 && Math.floor(now / 90) % 2) c.globalAlpha = .35;
      if (!flyer) drawIcon(c, 'balloon', 0, -size * .82, size * .8);
      if (ready(img)) c.drawImage(img, -size / 2, -size / 2, size, b ? size * .84 : size);
      c.restore();
      drawPops(c, pops, dt);
      const key = score + '|' + hearts + '|' + Math.ceil(time); if (key !== shown) { shown = key; G.info(infoLine(score, time, hearts)); }
      if (time <= 0 || hearts <= 0) { G.end(Math.min(30, score * .6) * D.pay, hearts <= 0 ? `被乌云淋湿啦，摘到 ${score} 颗星` : `飞行成功！摘到 ${score} 颗星`); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- 3. 翻翻乐 ---------- */
  IMPL.memory = function (G) {
    // 轻松 12 张、普通 16 张、挑战 20 张
    const faces = ['bird', 'parrot', 'cat', 'dog', 'rabbit', 'hamster', 'sunflower', 'strawberry', 'apple', 'carrot'].slice(0, [0, 6, 8, 10][G.lv]);
    const face = f => PETS[f] ? petSVG(f, 'happy') : icon(f);
    const deck = faces.concat(faces).map(f => ({ f, k: Math.random() })).sort((a, b) => a.k - b.k).map(x => x.f);
    G.body.innerHTML = '<div class="mem-wrap"><div class="mem-grid" style="--rows:' + deck.length / 4 + '">' + deck.map((f, i) => `<button class="mem" data-i="${i}"><span class="mf">？</span><span class="mb">${face(f)}</span></button>`).join('') + '</div></div>';
    let first = null, lock = false, moves = 0, found = 0;
    G.info('步数：0');
    G.on(G.body, 'click', e => {
      const b = e.target.closest('.mem');
      if (!b || lock || b.classList.contains('open') || b.classList.contains('done')) return;
      b.classList.add('open'); Sound.sfx.flip();
      if (!first) { first = b; return; }
      moves++; G.info('步数：' + moves);
      const a = first; first = null;
      if (deck[+a.dataset.i] === deck[+b.dataset.i]) {
        a.classList.add('done'); b.classList.add('done'); found++; Sound.sfx.coin();
        if (found === faces.length) G.later(() => G.end(clamp([0, 26, 36, 48][G.lv] - moves, [0, 8, 10, 12][G.lv], [0, 18, 26, 34][G.lv]),`全部找到啦，用了 ${moves} 步`), 700);
      } else {
        lock = true;
        G.later(() => { a.classList.remove('open'); b.classList.remove('open'); lock = false; }, 800);
      }
    });
  };

  /* ---------- 4. 鹦鹉学唱 ---------- */
  IMPL.melody = function (G) {
    const names = ['do', 're', 'mi', 'sol'];
    G.body.innerHTML = `<div class="mel"><div class="mel-pet">${petSVG('parrot', 'happy')}</div><div class="mel-msg" id="mel-msg">准备好了吗？</div>
      <div class="mel-pads">${names.map((n, i) => `<button class="pad p${i}" data-i="${i}">${n}</button>`).join('')}</div></div>`;
    const pads = $$('.pad', G.body), msg = t => { $('#mel-msg').textContent = t; };
    // 三档难度：播放快慢、要过几关、每关奖励；挑战档一开始就是两个音
    const P = [null, { base: 780, min: 430, goal: 8, pay: 3, win: 30, start: 1 }, { base: 640, min: 340, goal: 10, pay: 4, win: 40, start: 1 }, { base: 520, min: 280, goal: 12, pay: 5, win: 55, start: 2 }][G.lv];
    const seq = []; let pos = 0, accept = false, round = 0;
    function flash(i) { const p = pads[i]; p.classList.add('lit'); Sound.sfx.note(i); G.later(() => p.classList.remove('lit'), 260); }
    function next() {
      round++; seq.push(rand(0, 3)); if (round === 1 && P.start > 1) seq.push(rand(0, 3)); accept = false;
      msg('第 ' + round + ' 关：仔细听~'); G.info('第 ' + round + ' 关');
      let i = 0;
      const step = () => {
        if (i >= seq.length) { accept = true; pos = 0; msg('轮到你啦'); return; }
        flash(seq[i++]); G.later(step, Math.max(P.min, P.base - round * 22));
      };
      G.later(step, 800);
    }
    G.on(G.body, 'click', e => {
      const b = e.target.closest('.pad'); if (!b || !accept) return;
      const i = +b.dataset.i; flash(i);
      if (i === seq[pos]) {
        pos++;
        if (pos === seq.length) {
          accept = false;
          if (round >= P.goal) G.later(() => G.end(P.win, P.goal + ' 关全部通过，你是音乐小天才'), 600);
          else { msg(pick(['真棒！', '好厉害！', '完全正确！'])); G.later(next, 900); }
        }
      } else {
        accept = false; Sound.sfx.bad(); msg('哎呀，弹错啦~');
        G.later(() => G.end((round - 1) * P.pay, round > 1 ? `记住了 ${round - 1} 段旋律` : '没关系，再试一次吧'), 900);
      }
    });
    G.later(next, 600);
  };

  /* ---------- 5. 口算小达人（一到六年级） ---------- */
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const dec = (n, d) => d ? (n / Math.pow(10, d)).toFixed(d).replace(/\.?0+$/, '') : String(n);   // 把放大了 10^d 倍的整数写回小数
  const minus = s => String(s).replace('-', '−');
  /* 整数、小数题：ans 是放大 10^d 倍后的整数，三个错误选项都在它附近 */
  function numQ(text, ans, d, allowNeg, step) {
    const set = new Set([ans]), offs = [1, -1, 2, -2, 10, -10, 3, -3, 5, -5, 9, -9, 20, -20];
    let guard = 0;
    while (set.size < 4 && guard++ < 200) { const v = ans + pick(offs) * (step || 1); if (allowNeg || v > 0) set.add(v); }
    return { text: text + ' = ?', ans: minus(dec(ans, d || 0)), opts: shuffle(Array.from(set)).map(v => minus(dec(v, d || 0))) };
  }
  function eqQ(eq, x) { const q = numQ('', x); q.text = eq + '，x = ?'; return q; }
  /* 分数题：答案约成最简分数 */
  const fr = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
  function fracQ(text, n, d) {
    const g = gcd(n, d) || 1, a = n / g, b = d / g, ans = fr(a, b), set = new Set([ans]);
    const cands = shuffle([[a + 1, b], [a, b + 1], [a + 1, b + 1], [b, a], [a + 2, b], [a, b + 2], [a + 1, b + 2], [2 * a + 1, 2 * b]]);
    for (const c of cands) { if (set.size >= 4) break; if (c[0] * b !== a * c[1]) set.add(fr(c[0], c[1])); }
    for (let k = 3; set.size < 4 && k < 20; k++) if ((a + k) * b !== a * (b + 1)) set.add(fr(a + k, b + 1));
    return { text: text + ' = ?', ans, opts: shuffle(Array.from(set)) };
  }
  function ratioQ(a, b, k) {
    const ans = a + ' : ' + b, set = new Set([ans]);
    for (const c of shuffle([[b, a], [a + 1, b], [a, b + 1], [a + 1, b + 2], [a + 2, b + 1], [a, b + 2]])) { if (set.size >= 4) break; if (c[0] * b !== a * c[1]) set.add(c[0] + ' : ' + c[1]); }
    return { text: `${a * k} : ${b * k} 化成最简比`, ans, opts: shuffle(Array.from(set)) };
  }
  const pf = (maxN, maxGap) => { const a = rand(1, maxN), b = a + rand(1, maxGap), g = gcd(a, b); return [a / g, b / g]; };   // 随机一个最简真分数
  /* 每个年级的题型，大致对应课本里的口算内容 */
  const MATH = {
    1: [   // 20 以内加减法、整十数加减、两位数加一位数（不进位）
      () => { const a = rand(2, 9), b = rand(2, 11); return numQ(`${a} + ${b}`, a + b); },
      () => { const a = rand(11, 20), b = rand(2, 9); return numQ(`${a} − ${b}`, a - b); },
      () => { const a = rand(1, 5) * 10, b = rand(1, 4) * 10; return numQ(`${a} + ${b}`, a + b, 0, false, 10); },
      () => { const a = rand(3, 9) * 10, b = rand(1, a / 10 - 1) * 10; return numQ(`${a} − ${b}`, a - b, 0, false, 10); },
      () => { const t = rand(2, 8) * 10, u = rand(1, 5), b = rand(1, 9 - u); return numQ(`${t + u} + ${b}`, t + u + b); }
    ],
    2: [   // 100 以内加减法、表内乘法和除法
      () => { const a = rand(15, 68), b = rand(12, 99 - a); return numQ(`${a} + ${b}`, a + b); },
      () => { const a = rand(31, 99), b = rand(12, a - 8); return numQ(`${a} − ${b}`, a - b); },
      () => { const a = rand(2, 9), b = rand(2, 9); return numQ(`${a} × ${b}`, a * b); },
      () => { const b = rand(2, 9), q = rand(2, 9); return numQ(`${b * q} ÷ ${b}`, q); }
    ],
    3: [   // 两位数乘除一位数、几百几十的加减法
      () => { const a = rand(12, 48), b = rand(2, 9); return numQ(`${a} × ${b}`, a * b); },
      () => { const b = rand(2, 6), q = rand(11, 25); return numQ(`${b * q} ÷ ${b}`, q); },
      () => { const a = rand(12, 60) * 10, b = rand(11, 99 - a / 10) * 10; return numQ(`${a} + ${b}`, a + b, 0, false, 10); },
      () => { const a = rand(30, 99) * 10, b = rand(11, a / 10 - 8) * 10; return numQ(`${a} − ${b}`, a - b, 0, false, 10); },
      () => { const a = rand(6, 9), b = rand(6, 9); return numQ(`${a} × ${b}`, a * b); },
      () => { const b = rand(6, 9), q = rand(6, 9); return numQ(`${b * q} ÷ ${b}`, q); }
    ],
    4: [   // 整十数乘两位数、除数是整十数、四则混合运算、一位小数加减
      () => { const a = rand(2, 9) * 10, b = rand(11, 35); return numQ(`${a} × ${b}`, a * b, 0, false, 10); },
      () => { const b = rand(2, 9) * 10, q = rand(3, 9); return numQ(`${b * q} ÷ ${b}`, q); },
      () => { const b = rand(3, 9), q = rand(12, 40); return numQ(`${b * q} ÷ ${b}`, q); },
      () => { const a = rand(5, 30), b = rand(2, 9), c = rand(2, 9); return numQ(`${a} + ${b} × ${c}`, a + b * c); },
      () => { const b = rand(2, 12), a = b + rand(3, 15), c = rand(2, 9); return numQ(`(${a} − ${b}) × ${c}`, (a - b) * c); },
      () => { const a = rand(12, 89), b = rand(11, 60); return numQ(`${dec(a, 1)} + ${dec(b, 1)}`, a + b, 1); },
      () => { const a = rand(30, 99), b = rand(11, a - 6); return numQ(`${dec(a, 1)} − ${dec(b, 1)}`, a - b, 1); }
    ],
    5: [   // 小数乘除法、简易方程、分数加法
      () => { const a = rand(11, 49), b = rand(2, 9); return numQ(`${dec(a, 1)} × ${b}`, a * b, 1); },
      () => { const a = rand(2, 9), b = rand(2, 9); return numQ(`${dec(a, 1)} × ${dec(b, 1)}`, a * b, 2); },
      () => { const b = rand(2, 9), q = rand(2, 9); return numQ(`${dec(b * q, 1)} ÷ ${dec(b, 1)}`, q); },
      () => { const b = rand(2, 9), q = rand(2, 9); return numQ(`${dec(b * q, 1)} ÷ ${b}`, q, 1); },
      () => { const x = rand(8, 60), a = rand(5, 40); return eqQ(`x + ${a} = ${x + a}`, x); },
      () => { const x = rand(20, 90), a = rand(5, 19); return eqQ(`x − ${a} = ${x - a}`, x); },
      () => { const x = rand(3, 15), a = rand(2, 9); return eqQ(`${a}x = ${a * x}`, x); },
      () => { const d = pick([5, 6, 7, 8, 9, 10, 12]), a = rand(1, d - 2), b = rand(1, d - 1 - a); return fracQ(`${a}/${d} + ${b}/${d}`, a + b, d); },
      () => { const p = pick([[2, 3], [2, 4], [3, 4], [2, 6], [3, 6], [4, 6], [2, 5]]); return fracQ(`1/${p[0]} + 1/${p[1]}`, p[0] + p[1], p[0] * p[1]); }
    ],
    6: [   // 分数乘除法、百分数、化简比、负数
      () => { const [a, b] = pf(4, 4), [c, d] = pf(5, 4); return fracQ(`${a}/${b} × ${c}/${d}`, a * c, b * d); },
      () => { const [a, b] = pf(5, 4), [c, d] = pf(4, 4); return fracQ(`${a}/${b} ÷ ${c}/${d}`, a * d, b * c); },
      () => { const [a, b] = pf(5, 5), k = rand(2, 5); return fracQ(`${a}/${b} ÷ ${k}`, a, b * k); },
      () => { const p = pick([10, 20, 25, 50, 75]), n = rand(1, 12) * (p === 25 || p === 75 ? 4 : p === 50 ? 2 : 10); return numQ(`${n} 的 ${p}%`, n * p / 100); },
      () => { const a = rand(1, 5), b = a + rand(1, 4), g = gcd(a, b); return ratioQ(a / g, b / g, rand(2, 6)); },
      () => { const a = rand(2, 12), b = rand(a + 1, a + 12); return numQ(`${a} − ${b}`, a - b, 0, true); },
      () => { const a = rand(2, 12), b = rand(1, 20); return numQ(`−${a} + ${b}`, b - a, 0, true); }
    ]
  };
  IMPL.math = function (G) {
    const TOTAL = 10, gens = MATH[G.lv] || MATH[3];
    let n = 0, right = 0, lock = false, Q = null, lastText = '';
    G.body.innerHTML = `<div class="math"><div class="math-top"><div class="math-pet" id="math-pet"></div><div class="math-q" id="math-q"></div></div><div class="math-opts" id="math-opts"></div></div>`;
    const face = m => { $('#math-pet').innerHTML = playerSVG(m); };
    const info = () => G.info(`${GRADES[G.lv - 1]}　第 ${Math.min(TOTAL, n + 1)} / ${TOTAL} 题　答对 ${right}`);
    function make() {
      let q, guard = 0;
      do { q = pick(gens)(); } while ((q.text === lastText || q.opts.length < 4) && guard++ < 30);
      Q = q; lastText = q.text;
      const el = $('#math-q'); el.textContent = q.text; el.classList.toggle('long', q.text.length > 11);
      $('#math-opts').innerHTML = q.opts.map(v => `<button class="opt" data-v="${v}">${v}</button>`).join('');
      info(); face('normal'); lock = false;
    }
    G.on(G.body, 'click', e => {
      const b = e.target.closest('.opt'); if (!b || lock) return;
      lock = true;
      const ok = b.dataset.v === Q.ans;
      if (ok) { right++; b.classList.add('right'); Sound.sfx.ok(); face('joy'); }
      else {
        b.classList.add('wrong'); Sound.sfx.bad(); face('sad');
        $$('.opt', G.body).forEach(o => { if (o.dataset.v === Q.ans) o.classList.add('right'); });
      }
      n++;
      G.later(() => {
        if (n >= TOTAL) G.end(right * 3 + (right === TOTAL ? 5 : 0), right === TOTAL ? '全对！你是口算小达人' : `答对了 ${right} 题，继续加油`);
        else make();
      }, ok ? 800 : 1600);
    });
    make();
  };

  /* ---------- 6. 水果消消乐 ---------- */
  IMPL.match = function (G) {
    const N = 7, KINDS = ['apple', 'strawberry', 'orange', 'grape', 'lemon', 'watermelon'].slice(0, [0, 5, 6, 6][G.lv]);
    const TINT = { apple: '#F6D9D2', strawberry: '#F9DCE0', orange: '#FBE5C8', grape: '#E4DAF0', lemon: '#FBF3C4', watermelon: '#DCEBCF' };
    let moves = [0, 24, 20, 18][G.lv], score = 0, sel = -1, busy = false;
    const bd = [];   // 每一格是第几种水果；-1 表示刚消掉、还空着
    const rnd = () => rand(0, KINDS.length - 1);
    const k = (r, c) => r >= 0 && r < N && c >= 0 && c < N ? bd[r * N + c] : -1;
    for (let i = 0; i < N * N; i++) {   // 一开始不能有现成的三连
      const r = Math.floor(i / N), c = i % N; let v;
      do v = rnd(); while ((k(r, c - 1) === v && k(r, c - 2) === v) || (k(r - 1, c) === v && k(r - 2, c) === v));
      bd[i] = v;
    }
    function matches() {   // 所有连成三个以上的格子
      const hit = new Set();
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const v = k(r, c); if (v < 0) continue;
        if (k(r, c + 1) === v && k(r, c + 2) === v) { let x = c; while (k(r, x) === v) { hit.add(r * N + x); x++; } }
        if (k(r + 1, c) === v && k(r + 2, c) === v) { let y = r; while (k(y, c) === v) { hit.add(y * N + c); y++; } }
      }
      return hit;
    }
    const swap = (a, b) => { const t = bd[a]; bd[a] = bd[b]; bd[b] = t; };
    function canMove() {   // 还有没有换一下就能消的走法
      for (let i = 0; i < N * N; i++) for (const j of [i + 1, i + N]) {
        if (j >= N * N || (j === i + 1 && j % N === 0)) continue;
        swap(i, j); const ok = matches().size > 0; swap(i, j);
        if (ok) return true;
      }
      return false;
    }
    function shuffle() { do { for (let i = N * N - 1; i > 0; i--) swap(i, rand(0, i)); } while (matches().size || !canMove()); }
    if (!canMove()) shuffle();
    G.body.innerHTML = '<div class="m3-wrap"><div class="m3-grid" id="m3-grid"></div></div>';
    const grid = $('#m3-grid');
    function draw(fx) {   // fx：格子编号 → 这一格要播的动画
      grid.innerHTML = bd.map((v, i) => `<button class="m3${i === sel ? ' sel' : ''}${fx && fx[i] ? ' ' + fx[i] : ''}" data-i="${i}" style="background:${v < 0 ? 'transparent' : TINT[KINDS[v]]}">${v < 0 ? '' : icon(KINDS[v])}</button>`).join('');
      G.info(`还能走 ${moves} 步　分数 ${score}`);
    }
    function resolve(chain) {   // 消掉 → 往下掉 → 补新的 → 再看有没有连上的（连着消分数更高）
      const hit = matches();
      if (!hit.size) {
        if (moves <= 0) { G.later(() => G.end(clamp(Math.round(score / [0, 44, 40, 36][G.lv]), 3, [0, 28, 36, 46][G.lv]), `得了 ${score} 分${score >= 1000 ? '，太厉害啦' : ''}`), 500); return; }
        if (!canMove()) { toast('没有能消的了，重新洗一洗'); shuffle(); draw(); }
        busy = false; return;
      }
      score += hit.size * 10 * chain; Sound.sfx[chain > 1 ? 'coin' : 'pop']();
      const fx = {}; hit.forEach(i => { fx[i] = 'gone'; }); draw(fx);
      G.later(() => {
        hit.forEach(i => { bd[i] = -1; });
        const fx2 = {};
        for (let c = 0; c < N; c++) {
          let w = N - 1;
          for (let r = N - 1; r >= 0; r--) if (bd[r * N + c] >= 0) { if (w !== r) { bd[w * N + c] = bd[r * N + c]; bd[r * N + c] = -1; fx2[w * N + c] = 'drop'; } w--; }
          for (; w >= 0; w--) { bd[w * N + c] = rnd(); fx2[w * N + c] = 'drop'; }
        }
        draw(fx2);
        G.later(() => resolve(chain + 1), 300);
      }, 260);
    }
    G.on(grid, 'click', e => {
      const b = e.target.closest('.m3'); if (!b || busy) return;
      const i = +b.dataset.i;
      if (sel < 0 || sel === i) { sel = sel === i ? -1 : i; Sound.sfx.pop(); draw(); return; }
      const adj = Math.abs(sel - i) === N || (Math.abs(sel - i) === 1 && Math.floor(sel / N) === Math.floor(i / N));
      if (!adj) { sel = i; Sound.sfx.pop(); draw(); return; }
      const a = sel; sel = -1; swap(a, i);
      if (!matches().size) { swap(a, i); Sound.sfx.bad(); const fx = {}; fx[a] = fx[i] = 'no'; draw(fx); return; }
      moves--; busy = true; draw(); G.later(() => resolve(1), 120);
    });
    draw();
  };

  /* ---------- 7. 国际象棋 ----------
   * 棋盘是 64 格的数组，0 是左上角（a8），63 是右下角（h1）。大写是白棋（你），小写是黑棋（电脑）。
   * 规则是完整的：王车易位、吃过路兵、兵走到底变皇后、不能送王 */
  IMPL.chess = function (G) {
    const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
    let B = 'rnbqkbnrpppppppp'.split('').concat(Array(32).fill(''), 'PPPPPPPPRNBQKBNR'.split(''));
    let cast = { K: true, Q: true, k: true, q: true }, ep = -1;
    const isW = p => p === p.toUpperCase(), on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const N_D = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]], K_D = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    const R_D = [[-1, 0], [1, 0], [0, -1], [0, 1]], B_D = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    function attacked(sq, by) {   // sq 这一格会不会被 by 这一方吃到
      const r = sq >> 3, c = sq & 7, w = by === 'w', pr = w ? r + 1 : r - 1;   // 白兵往上走，所以能吃到这一格的白兵在它下面一行
      for (const dc of [-1, 1]) if (on(pr, c + dc) && B[pr * 8 + c + dc] === (w ? 'P' : 'p')) return true;
      for (const d of N_D) { const a = r + d[0], b = c + d[1]; if (on(a, b) && B[a * 8 + b] === (w ? 'N' : 'n')) return true; }
      for (const d of K_D) { const a = r + d[0], b = c + d[1]; if (on(a, b) && B[a * 8 + b] === (w ? 'K' : 'k')) return true; }
      const slide = (dirs, s1, s2) => {
        for (const d of dirs) { let a = r + d[0], b = c + d[1]; while (on(a, b)) { const p = B[a * 8 + b]; if (p) { if (p === s1 || p === s2) return true; break; } a += d[0]; b += d[1]; } }
        return false;
      };
      return w ? slide(R_D, 'R', 'Q') || slide(B_D, 'B', 'Q') : slide(R_D, 'r', 'q') || slide(B_D, 'b', 'q');
    }
    function pseudo(s) {   // 这一方所有“看起来能走”的走法（还没检查会不会送王）
      const out = [], w = s === 'w';
      for (let i = 0; i < 64; i++) {
        const p = B[i]; if (!p || isW(p) !== w) continue;
        const r = i >> 3, c = i & 7, t = p.toLowerCase();
        const add = (a, b, extra) => { out.push(Object.assign({ f: i, t: a * 8 + b }, extra)); };
        if (t === 'p') {
          const d = w ? -1 : 1, start = w ? 6 : 1, last = w ? 0 : 7;
          if (on(r + d, c) && !B[(r + d) * 8 + c]) {
            add(r + d, c, r + d === last ? { promo: 1 } : null);
            if (r === start && !B[(r + 2 * d) * 8 + c]) add(r + 2 * d, c, { two: 1 });
          }
          for (const dc of [-1, 1]) if (on(r + d, c + dc)) {
            const q = (r + d) * 8 + c + dc, x = B[q];
            if (x) { if (isW(x) !== w) add(r + d, c + dc, r + d === last ? { promo: 1 } : null); }
            else if (q === ep) add(r + d, c + dc, { ep: 1 });
          }
        } else if (t === 'n' || t === 'k') {
          for (const d of (t === 'n' ? N_D : K_D)) { const a = r + d[0], b = c + d[1]; if (on(a, b)) { const x = B[a * 8 + b]; if (!x || isW(x) !== w) add(a, b); } }
          const home = w ? 60 : 4, opp = w ? 'b' : 'w', rook = w ? 'R' : 'r';
          if (t === 'k' && i === home && (cast[w ? 'K' : 'k'] || cast[w ? 'Q' : 'q']) && !attacked(home, opp)) {
            if (cast[w ? 'K' : 'k'] && !B[home + 1] && !B[home + 2] && B[home + 3] === rook && !attacked(home + 1, opp)) add(r, 6, { castle: 'k' });
            if (cast[w ? 'Q' : 'q'] && !B[home - 1] && !B[home - 2] && !B[home - 3] && B[home - 4] === rook && !attacked(home - 1, opp)) add(r, 2, { castle: 'q' });
          }
        } else {
          for (const d of (t === 'r' ? R_D : t === 'b' ? B_D : K_D)) {
            let a = r + d[0], b = c + d[1];
            while (on(a, b)) { const x = B[a * 8 + b]; if (!x) add(a, b); else { if (isW(x) !== w) add(a, b); break; } a += d[0]; b += d[1]; }
          }
        }
      }
      return out;
    }
    function make(m) {
      const p = B[m.f], w = isW(p), u = { m, p, cap: B[m.t], cast: Object.assign({}, cast), ep };
      B[m.t] = m.promo ? (w ? 'Q' : 'q') : p; B[m.f] = '';
      if (m.ep) { u.epSq = m.t + (w ? 8 : -8); u.epCap = B[u.epSq]; B[u.epSq] = ''; }
      if (m.castle) { const r0 = m.t & ~7; if (m.castle === 'k') { B[r0 + 5] = B[r0 + 7]; B[r0 + 7] = ''; } else { B[r0 + 3] = B[r0]; B[r0] = ''; } }
      ep = m.two ? (m.f + m.t) / 2 : -1;
      if (p === 'K') cast.K = cast.Q = false;
      if (p === 'k') cast.k = cast.q = false;
      if (m.f === 63 || m.t === 63) cast.K = false;
      if (m.f === 56 || m.t === 56) cast.Q = false;
      if (m.f === 7 || m.t === 7) cast.k = false;
      if (m.f === 0 || m.t === 0) cast.q = false;
      return u;
    }
    function unmake(u) {
      const m = u.m; B[m.f] = u.p; B[m.t] = u.cap; cast = u.cast; ep = u.ep;
      if (m.ep) B[u.epSq] = u.epCap;
      if (m.castle) { const r0 = m.t & ~7; if (m.castle === 'k') { B[r0 + 7] = B[r0 + 5]; B[r0 + 5] = ''; } else { B[r0] = B[r0 + 3]; B[r0 + 3] = ''; } }
    }
    const inCheck = s => attacked(B.indexOf(s === 'w' ? 'K' : 'k'), s === 'w' ? 'b' : 'w');
    const legal = s => pseudo(s).filter(m => { const u = make(m), ok = !inCheck(s); unmake(u); return ok; });
    const mid = i => 3.5 - Math.max(Math.abs((i >> 3) - 3.5), Math.abs((i & 7) - 3.5));   // 越靠近棋盘中间越大（0～3）
    function score() {   // 局面对黑棋（电脑）有多好：子力，加上一点点位置
      let v = 0;
      for (let i = 0; i < 64; i++) {
        const p = B[i]; if (!p) continue;
        const t = p.toLowerCase(), w = isW(p);
        let x = VAL[t];
        if (t === 'n' || t === 'b') x += mid(i) * 8; else if (t === 'p') x += mid(i) * 4 + (w ? 6 - (i >> 3) : (i >> 3) - 1) * 5; else if (t !== 'k') x += mid(i) * 2;
        v += w ? -x : x;
      }
      return v;
    }
    const capVal = m => B[m.t] ? VAL[B[m.t].toLowerCase()] : 0;
    function search(depth, s, alpha, beta) {
      if (depth === 0) return score();
      const ms = legal(s);
      if (!ms.length) return inCheck(s) ? (s === 'b' ? -99000 - depth : 99000 + depth) : 0;
      ms.sort((a, b) => capVal(b) - capVal(a));
      let best = s === 'b' ? -Infinity : Infinity;
      for (const m of ms) {
        const u = make(m), v = search(depth - 1, s === 'b' ? 'w' : 'b', alpha, beta); unmake(u);
        if (s === 'b') { if (v > best) best = v; if (best > alpha) alpha = best; } else { if (v < best) best = v; if (best < beta) beta = best; }
        if (alpha >= beta) break;
      }
      return best;
    }
    function aiMove() {   // 轻松：只看眼前一步，还经常走神；普通：多想一步；挑战：多想两步
      const ms = legal('b'), depth = [0, 0, 1, 2][G.lv], noise = [0, 170, 30, 8][G.lv];
      let best = null, bv = -Infinity;
      for (const m of ms) { const u = make(m), v = search(depth, 'w', -Infinity, Infinity) + Math.random() * noise; unmake(u); if (v > bv) { bv = v; best = m; } }
      return best;
    }

    let sel = -1, myMoves = legal('w'), last = null, turn = 'w', steps = 0;
    G.body.innerHTML = '<div class="ch-wrap"><div class="ch-board" id="ch-board"></div></div>';
    const board = $('#ch-board');
    function draw() {
      const tg = {}; if (sel >= 0) myMoves.forEach(m => { if (m.f === sel) tg[m.t] = B[m.t] || m.ep ? 'cap' : 'go'; });
      board.innerHTML = B.map((p, i) => `<button class="ch-sq${((i >> 3) + (i & 7)) % 2 ? ' dk' : ''}${i === sel ? ' sel' : ''}${tg[i] ? ' tgt ' + tg[i] : ''}${last && (last.f === i || last.t === i) ? ' last' : ''}" data-i="${i}">${p ? chessSVG(p.toLowerCase(), isW(p)) : ''}</button>`).join('');
    }
    function over(coins, text) { turn = ''; G.later(() => G.end(coins, text), 1100); }
    function afterMove(s) {   // s 这一方刚走完，看看对方还能不能走
      const o = s === 'w' ? 'b' : 'w', ms = legal(o), chk = inCheck(o);
      if (!ms.length) {
        if (!chk) { G.info('没有棋可走，和棋'); over(15, '和棋！谁也没赢谁'); }
        else if (o === 'b') { G.info('将死！'); Sound.sfx.ok(); over([0, 30, 45, 60][G.lv], '将死！你赢啦'); }
        else { G.info('被将死了'); over(6, '被将死了，下次再来'); }
        return false;
      }
      if (s === 'w' && steps >= 70) {
        const lead = -score(); over(lead > 300 ? 22 : 12, lead > 300 ? '下了好久，你的棋子更多，算你小胜' : '下了好久还没分出胜负，算和棋');
        return false;
      }
      if (chk) Sound.sfx.note(3);
      G.info(o === 'w' ? (chk ? '将军！快保护你的国王' : '该你走了（白棋）') : (chk ? '将军！电脑在想办法…' : '电脑在想…'));
      return true;
    }
    function play(m, s) {
      const cap = B[m.t] || m.ep; make(m); last = m; sel = -1;
      Sound.sfx[cap ? 'coin' : 'flip'](); draw();
      if (!afterMove(s)) return;
      if (s === 'w') { turn = 'b'; G.later(() => { const a = aiMove(); if (a) play(a, 'b'); }, 450); }
      else { turn = 'w'; myMoves = legal('w'); }
    }
    G.on(board, 'click', e => {
      const b = e.target.closest('.ch-sq'); if (!b || turn !== 'w') return;
      const i = +b.dataset.i, m = sel >= 0 && myMoves.find(x => x.f === sel && x.t === i);
      if (m) { steps++; play(m, 'w'); return; }
      sel = B[i] && isW(B[i]) && sel !== i ? i : -1;
      if (sel >= 0) Sound.sfx.pop();
      draw();
    });
    G.info('你走白棋，先走一步吧'); draw();
  };

  /* ---------- 8. 五子棋 ---------- */
  IMPL.gomoku = function (G) {
    const N = 11, bd = Array(N * N).fill(0);   // 0 空，1 你（黑子），2 电脑（白子）
    const at = (r, c) => r >= 0 && r < N && c >= 0 && c < N ? bd[r * N + c] : -1;
    const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
    function run(r, c, d, who) {   // 在 (r,c) 放上 who 的子以后，这个方向上连了几个、两头有几头是空的
      let n = 1, open = 0;
      for (const s of [1, -1]) { let a = r + d[0] * s, b = c + d[1] * s; while (at(a, b) === who) { n++; a += d[0] * s; b += d[1] * s; } if (at(a, b) === 0) open++; }
      return [n, open];
    }
    function worth(r, c, who) {
      let s = 0;
      for (const d of DIRS) {
        const [n, open] = run(r, c, d, who);
        s += n >= 5 ? 100000 : n === 4 ? [0, 1200, 10000][open] : n === 3 ? [0, 120, 1000][open] : n === 2 ? [0, 12, 100][open] : open;
      }
      return s;
    }
    const five = (r, c, who) => DIRS.some(d => run(r, c, d, who)[0] >= 5);
    function aiPick() {   // 每个空格算一算：自己下在这儿有多好，加上不下在这儿会多危险
      const defend = [0, .5, .9, 1.05][G.lv], noise = [0, 320, 50, 0][G.lv];
      let best = -1, bv = -1;
      for (let i = 0; i < N * N; i++) if (!bd[i]) {
        const r = Math.floor(i / N), c = i % N;
        const v = worth(r, c, 2) + worth(r, c, 1) * defend + Math.random() * noise + (5 - Math.max(Math.abs(r - 5), Math.abs(c - 5)));
        if (v > bv) { bv = v; best = i; }
      }
      return best;
    }
    let turn = 1, lastAt = -1, mine = 0;
    G.body.innerHTML = '<div class="ch-wrap"><div class="gm-board" id="gm-board"></div></div>';
    const board = $('#gm-board');
    const draw = () => { board.innerHTML = bd.map((v, i) => `<button class="gm${v === 1 ? ' b' : v === 2 ? ' w' : ''}${i === lastAt ? ' new' : ''}" data-i="${i}">${v ? '<i></i>' : ''}</button>`).join(''); };
    function put(i, who) {
      bd[i] = who; lastAt = i; Sound.sfx.flip(); draw();
      if (five(Math.floor(i / N), i % N, who)) {
        turn = 0; if (who === 1) Sound.sfx.ok();
        G.info(who === 1 ? '连成五个啦！' : '电脑连成五个了');
        G.later(() => G.end(who === 1 ? [0, 20, 32, 46][G.lv] : 5, who === 1 ? `五子连珠！你用 ${mine} 颗子赢了` : '电脑先连成了五个，下次拦住它'), 1100);
        return false;
      }
      if (bd.every(v => v)) { turn = 0; G.later(() => G.end(10, '棋盘下满了，算和棋'), 900); return false; }
      return true;
    }
    G.on(board, 'click', e => {
      const b = e.target.closest('.gm'); if (!b || turn !== 1) return;
      const i = +b.dataset.i; if (bd[i]) return;
      mine++;
      if (!put(i, 1)) return;
      turn = 2; G.info('电脑在想…');
      G.later(() => { if (put(aiPick(), 2)) { turn = 1; G.info('该你下了（黑子）'); } }, 420);
    });
    G.info('你下黑子，先下一颗吧'); draw();
  };

  $('#g-close').addEventListener('click', () => { Sound.sfx.click(); close(); });

  return { LIST, open, close, levelName, mathQ: lv => pick(MATH[lv])(), active: false };
})();
