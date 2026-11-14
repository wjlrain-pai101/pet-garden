'use strict';
/* ==========================================================
 *  萌宠小花园 · 林间空地的五个小游戏（素材全部用手绘图标）
 * ========================================================== */
const Games = (function () {
  const LIST = [
    { id: 'catch',  name: '接果果',     ic: 'basket',  desc: '接住掉下来的水果', how: '左右移动手指或鼠标（也可以用 ← → 键），用篮子接住水果和星星。小心，别接到臭袜子和辣椒！' },
    { id: 'fly',    name: '飞飞摘星',   ic: 'star',    desc: '飞上天空摘星星',   how: '上下移动手指或鼠标（也可以用 ↑ ↓ 键），飞起来摘星星、气球和彩虹。躲开打雷的乌云，一共有 3 颗爱心！' },
    { id: 'memory', name: '翻翻乐',     ic: 'book',    desc: '找出一样的卡片',   how: '每次翻开两张卡片，找到一模一样的就配对成功。用的步数越少，奖励越多！' },
    { id: 'melody', name: '鹦鹉学唱',   ic: 'note',    desc: '记住旋律跟着弹',   how: '先仔细听一段旋律，再按同样的顺序点彩色琴键。每过一关，旋律会多一个音哦！' },
    { id: 'math',   name: '口算小达人', ic: 'tasks',   desc: '算对了有奖励',     how: '一共 10 道口算题，一到六年级都有，先选好年级再开始。选出正确答案，算对越多橡果越多！' }
  ];
  let cur = null;
  const imgCache = {};

  /* 等级：口算按年级分，其余游戏分三档难度。选好以后会记住 */
  const GRADES = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'], DIFFS = ['轻松', '普通', '挑战'];
  const levelsOf = id => id === 'math' ? GRADES : DIFFS;
  function lvOf(id) { const all = levelsOf(id), v = (S.gameLv || {})[id]; return v >= 1 && v <= all.length ? v : (id === 'math' ? 3 : 2); }
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

  $('#g-close').addEventListener('click', () => { Sound.sfx.click(); close(); });

  return { LIST, open, close, levelName, mathQ: lv => pick(MATH[lv])(), active: false };
})();
