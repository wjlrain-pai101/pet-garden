'use strict';
/* ==========================================================
 *  萌宠小花园 · 配乐与音效
 *  全部用 Web Audio 实时合成，原创旋律，不需要任何音频文件
 * ========================================================== */
const Sound = (function () {
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let on = true, cur = null, curName = null, timer = null;
  let mT = 0, bT = 0, mi = 0, bi = 0;

  const SEMI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(n) {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    return m ? 440 * Math.pow(2, (SEMI[m[1]] + (+m[2] - 4) * 12 - 9) / 12) : 0;
  }
  function parse(s) { return s.trim().split(/\s+/).map(x => { const p = x.split(':'); return [p[0], +p[1]]; }); }

  /* 每首曲子：旋律 + 低音，各 32 拍循环 */
  const TRACKS = {
    // 小屋：温柔的摇摆
    home: { bpm: 78, wave: 'pluck', vol: .2,
      mel: parse('E4:1 G4:1 A4:1 G4:1 E4:1 D4:1 C4:2 D4:1 E4:1 G4:1 E4:1 D4:2 -:2 E4:1 G4:1 A4:1 C5:1 A4:1 G4:1 E4:2 D4:1 E4:1 D4:1 C4:1 C4:3 -:1'),
      bass: parse('C3:4 A2:4 G2:4 G2:4 C3:4 F2:4 G2:4 C3:4') },
    // 花园：阳光下蹦蹦跳跳
    garden: { bpm: 96, wave: 'pluck', vol: .2,
      mel: parse('G4:.5 A4:.5 C5:1 A4:.5 G4:.5 E4:1 G4:.5 A4:.5 G4:.5 E4:.5 D4:2 E4:.5 G4:.5 A4:1 C5:.5 D5:.5 C5:1 A4:.5 G4:.5 E4:.5 D4:.5 C4:2 ' +
        'C5:1 D5:.5 E5:.5 D5:1 C5:1 A4:.5 C5:.5 A4:.5 G4:.5 E4:2 G4:.5 A4:.5 C5:1 D5:.5 C5:.5 A4:1 G4:.5 E4:.5 D4:1 C4:2'),
      bass: parse('C3:2 G2:2 G2:2 G2:2 A2:2 F2:2 G2:2 C3:2 C3:2 G2:2 F2:2 C3:2 F2:2 G2:2 G2:2 C3:2') },
    // 游乐场：欢快的旋转木马
    play: { bpm: 112, wave: 'pluck', vol: .17,
      mel: parse('C5:.5 E5:.5 G5:.5 E5:.5 C5:.5 E5:.5 D5:1 B4:.5 D5:.5 G5:.5 D5:.5 B4:.5 D5:.5 C5:1 A4:.5 C5:.5 F5:.5 C5:.5 A4:.5 C5:.5 B4:.5 D5:.5 C5:1 G4:1 C5:1 -:1 ' +
        'E5:.5 E5:.5 D5:.5 C5:.5 D5:1 G4:1 E5:.5 E5:.5 D5:.5 C5:.5 A4:2 F5:.5 E5:.5 D5:.5 C5:.5 B4:.5 C5:.5 D5:1 C5:1 E5:1 C5:2'),
      bass: parse('C3:1 G3:1 C3:1 G3:1 G2:1 D3:1 G2:1 D3:1 F2:1 C3:1 G2:1 D3:1 C3:1 G2:1 C3:2 C3:1 G3:1 G2:1 D3:1 C3:1 G3:1 F2:1 C3:1 F2:1 C3:1 G2:1 D3:1 C3:1 G2:1 C3:2') },
    // 商店：轻快的小碎步
    shop: { bpm: 90, wave: 'pluck', vol: .2,
      mel: parse('E4:1 G4:.5 A4:1 G4:.5 E4:1 D4:1 F4:.5 G4:1 F4:.5 D4:1 E4:1 G4:.5 C5:1 B4:.5 A4:1 G4:2 -:2 A4:1 C5:.5 A4:1 G4:.5 E4:1 F4:1 A4:.5 G4:1 E4:.5 D4:1 E4:.5 D4:.5 C4:1 D4:1 E4:1 C4:3 -:1'),
      bass: parse('C3:4 G2:4 A2:4 G2:4 F2:4 G2:4 C3:2 G2:2 C3:4') },
    // 夜晚：摇篮曲
    night: { bpm: 58, wave: 'sine', vol: .2,
      mel: parse('E4:2 G4:2 D4:3 -:1 C4:2 E4:2 G3:3 -:1 A3:2 C4:2 E4:3 -:1 D4:2 B3:2 C4:4'),
      bass: parse('C3:4 G2:4 A2:4 E2:4 F2:4 C3:4 G2:4 C3:4') }
  };
  TRACKS.game = Object.assign({}, TRACKS.play, { bpm: 128 });
  // 手帐：和小屋同一段旋律，慢一点、低一点，像翻相册
  TRACKS.album = Object.assign({}, TRACKS.home, { bpm: 66, wave: 'sine' });

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = on ? 0.9 : 0; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.55; musicGain.connect(master);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.8; sfxGain.connect(master);
    } catch (e) { ctx = null; }
  }

  function tone(f, t, dur, type, vol, dest, slideTo) {
    if (!ctx || !f) return;
    dur = Math.max(0.06, dur);
    if (type === 'pluck') {   // 像拇指琴一样：一下拨响，慢慢散开，上面叠一点点泛音
      tone(f, t, Math.max(dur, .5) * 1.5, 'sine', vol, dest);
      tone(f * 2, t, .22, 'triangle', vol * .28, dest);
      return;
    }
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function schedule() {
    if (!ctx || !cur || ctx.state !== 'running') return;
    const now = ctx.currentTime, spb = 60 / cur.bpm;
    if (mT < now - 0.2 || bT < now - 0.2) { mT = bT = now + 0.1; mi = bi = 0; }
    while (mT < now + 0.4) {
      const n = cur.mel[mi];
      if (n[0] !== '-') tone(freq(n[0]), mT, n[1] * spb * 0.95, cur.wave, cur.vol, musicGain);
      mT += n[1] * spb; mi = (mi + 1) % cur.mel.length;
    }
    while (bT < now + 0.4) {
      const n = cur.bass[bi];
      if (n[0] !== '-') tone(freq(n[0]), bT, n[1] * spb * 0.9, 'sine', 0.15, musicGain);
      bT += n[1] * spb; bi = (bi + 1) % cur.bass.length;
    }
  }

  /* 环境音：白天偶尔有小鸟叫，夜里有蛐蛐声 */
  function ambient() {
    if (!ctx || !on || ctx.state !== 'running' || document.hidden) return;
    const t = ctx.currentTime + 0.05;
    if (curName === 'night') {
      if (Math.random() < .5) for (let i = 0; i < 5; i++) tone(4200, t + i * .09, .05, 'sine', .035, musicGain);
    } else if (curName === 'home' || curName === 'garden' || curName === 'play') {
      if (Math.random() < .3) { const b = 2300 + Math.random() * 900; for (let i = 0; i < 2 + (Math.random() * 3 | 0); i++) tone(b + i * 160, t + i * .13, .09, 'sine', .05, musicGain, b + 700 + i * 160); }
    }
  }
  setInterval(ambient, 2600);

  function music(name) {
    if (name === curName) return;
    curName = name; cur = name ? TRACKS[name] : null;
    mi = bi = 0; mT = bT = 0;
    if (!timer) timer = setInterval(schedule, 100);
  }

  function setOn(v) {
    on = !!v;
    if (ctx && master) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.05);
    if (!on && window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) { } }
  }

  const T = () => ctx ? ctx.currentTime + 0.01 : 0;
  const sfx = {
    click() { tone(660, T(), .08, 'triangle', .22); },
    pop() { tone(520, T(), .11, 'sine', .3, null, 900); },
    coin() { const t = T(); tone(988, t, .09, 'square', .1); tone(1319, t + .08, .2, 'square', .1); },
    eat() { const t = T(); for (let i = 0; i < 4; i++) tone(240 + (i % 2) * 50, t + i * .14, .09, 'sawtooth', .12); },
    water() { const t = T(); for (let i = 0; i < 7; i++) tone(800 + Math.random() * 700, t + i * .07, .11, 'sine', .14, null, 380); },
    ok() { const t = T(); [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .09, .22, 'triangle', .24)); },
    bad() { const t = T(); tone(330, t, .18, 'sawtooth', .1, null, 210); tone(220, t + .16, .3, 'sawtooth', .1, null, 140); },
    chirp() { const t = T(); for (let i = 0; i < 3; i++) tone(2000 + i * 300, t + i * .11, .09, 'sine', .18, null, 2800 + i * 200); },
    level() { const t = T(); [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * .11, .28, 'triangle', .26)); },
    bubble() { tone(300 + Math.random() * 500, T(), .12, 'sine', .14, null, 1300); },
    flip() { tone(440, T(), .07, 'triangle', .2, null, 720); },
    mail() { const t = T(); tone(1319, t, .35, 'sine', .22); tone(1047, t + .22, .5, 'sine', .22); },
    page() { const t = T(); tone(700, t, .06, 'triangle', .1, null, 1100); tone(900, t + .05, .06, 'triangle', .08, null, 1300); },
    trip() { const t = T(); [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .13, .5, 'pluck', .2)); },
    note(i) { tone([523.25, 587.33, 659.25, 783.99][i] || 523.25, T(), .42, 'triangle', .34); }
  };
  // 包一层，没声音设备时也不会报错
  Object.keys(sfx).forEach(k => { const f = sfx[k]; sfx[k] = function (a) { if (ctx && on) { try { f(a); } catch (e) { } } }; });

  return {
    init, music, setOn, sfx,
    isOn: () => on,
    beep(f, dur, type, vol) { if (ctx && on) tone(f, T(), dur || .2, type || 'sine', vol || .2); },
    suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  };
})();
