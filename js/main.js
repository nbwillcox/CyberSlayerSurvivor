/* core engine: fixed-timestep loop (60Hz logic, decoupled rAF render), integer pixel scaling, state machine
   TITLE -> CLASS -> LEVEL_SELECT -> COMBAT -> LEVEL_UP_DRAFT / CHEST_REWARD / PAUSE -> RESULT -> ARMORY */
(function () {
  var U = CS.U, In = CS.In, AU = CS.audio, SV = CS.save, ui = CS.ui, fx = CS.fx, G = CS.G, SC = CS.screens, W = CS.W, H = CS.H;
  var M = CS.main = { state: 'title', sel: 0, msg: '', msgT: 0, cards: [], res: null, prev: 'title', prevShop: null };
  var canvas, ctx, last = 0, acc = 0, STEP = 1 / 60, q = {};
  location.search.replace(/[?&]([^=&]+)=([^&]*)/g, function (_, k, v) { q[k] = decodeURIComponent(v); });

  function resize() {
    var dpr = window.devicePixelRatio || 1, vw = window.innerWidth * dpr, vh = window.innerHeight * dpr, s = Math.min(vw / W, vh / H);
    s = s >= 1 ? Math.floor(s) : s; // integer multiples whenever the window is large enough: zero blur
    canvas.style.width = (W * s / dpr) + 'px'; canvas.style.height = (H * s / dpr) + 'px';
  }

  M.go = function (st) {
    if (st === 'title' || st === 'levels' || st === 'class' || st === 'shop') { AU.music('menu'); In.joyEnabled = false; }
    if (st === 'combat') In.joyEnabled = true; else In.joyEnabled = false;
    M.state = st; ui.focus = ''; In.p = {}; In.taps.length = 0;
  };
  M.startRun = function (stage) {
    AU.init(); G.start(stage, SV.d.cls, { blitz: SV.d.blitz, time: q.time ? +q.time : 0, god: q.god === '1' });
    if (q.boost) debugBoost();
    AU.music(stage); M.go('combat'); G.banner = { t: 2.4, text: CS.STAGES[stage].sub, sub: CS.STAGES[stage].n, c: CS.STAGES[stage].pal[2] };
  };
  function debugBoost() { var p = G.p; CS.ITEM_ORDER.forEach(function (id) { var d = CS.ITEMS[id]; if (d.cls && d.cls !== G.cls) return; if (d.cat !== 'defense' && !p.items[id] && CS.WP.offenseCount() >= CS.MAX_OFFENSE) return; var it = p.items[id] || CS.WP.addItem(id, 4); it.lv = +q.boost; it.pw = 1 + (it.lv - 1) * 2; }); CS.WP.recalc(); CS.MN.fillAll(); p.hp = p.maxHp; }
  M.pick = function (i) {
    var c = M.cards[i]; if (!c) return; CS.WP.apply(c); AU.sfx(c.rar >= 3 ? 'levelup' : 'pick'); fx.shake(0.1); G.pendingLv--; if (G.pendingLv > 0) M.openDraft(); else M.go('combat');
  };
  M.openDraft = function () { M.cards = CS.WP.rollCards(3); M.state = 'draft'; ui.focus = 'c0'; AU.sfx('levelup'); In.joyEnabled = false; In.joy.on = false; };
  M.endChest = function () { G.chest = null; M.go('combat'); };

  M.finish = function () {
    var p = G.p, won = G.won, d = SV.d, st = G.stage, gold = G.stats.gold, bonus = won ? Math.round((300 + 120 * st) * (G.blitz ? 0.7 : 1)) : 0, lost = won ? 0 : Math.round(gold * 0.4), banked = gold + bonus - lost, keyGain = false, um = '';
    d.gold += banked; d.runs++; d.kills += G.stats.kills;
    if (won) {
      var n = st + 1; if (!d.cleared[n]) { d.cleared[n] = true; if (n < 10) { d.keys++; keyGain = true; } if (n === 1) um = 'NEURAL STAGE SELECT GRID UNLOCKED!'; }
      if (!d.best[n] || G.t < d.best[n]) d.best[n] = Math.floor(G.t); d.unlocked[n] = true;
      var all = true; for (var i = 1; i <= 9; i++) if (!d.cleared[i]) all = false; if (all && n !== 10 && !d.cleared[10]) um = 'THE OMEGA CITADEL IS OPEN!';
    }
    SV.store(); AU.stopMusic(); AU.sfx(won ? 'victory' : 'defeat');
    M.res = { won: won, stage: st, time: G.t, level: p.lv, kills: G.stats.kills, bosses: G.stats.bosses, gold: gold, bonus: bonus, lost: lost, banked: banked, keyGain: keyGain, unlockMsg: um };
    M.sel = Math.min(9, won && st < 8 ? st + 1 : st); M.go('result'); AU.music('menu');
  };

  function frame(now) {
    requestAnimationFrame(frame);
    var rdt = Math.min(0.1, (now - last) / 1000 || 0); last = now; acc += rdt;
    var steps = 0;
    while (acc >= STEP && steps < 5) { acc -= STEP; steps++; tick(STEP, rdt); }
    if (steps === 0 && acc > 1) acc = 0;
    render();
    if (fx.hitstop > 0) fx.hitstop -= rdt * 1000;
  }
  var ticked = false;
  function tick(dt, rdt) {
    In.poll();
    if (M.state === 'combat') {
      if (In.p.pause || In.p.blur) { M.go('pause'); }
      else if (fx.hitstop <= 0) {
        G.update(dt);
        if (G.over) M.finish();
        else if (G.pendingLv > 0) M.openDraft();
        else if (G.chest) { M.state = 'chest'; ui.focus = ''; In.joyEnabled = false; In.joy.on = false; }
      }
      if (In.taps.length && M.state === 'combat') { for (var i = 0; i < In.taps.length; i++) { var t = In.taps[i]; if (t.x > W - 40 && t.y > H - 40) M.go('pause'); } }
    }
    ticked = true;
  }
  function render() {
    ctx.imageSmoothingEnabled = false; var dt = 1 / 60;
    if (!CS.G.p || M.state === 'title' || M.state === 'levels' || M.state === 'class' || M.state === 'shop' || M.state === 'result') CS.t = performance.now() / 1000;
    ui.begin(ctx, dt);
    switch (M.state) {
      case 'title': SC.title(ctx); break; case 'class': SC.class(ctx); break; case 'levels': SC.levels(ctx); break; case 'shop': SC.shop(ctx); break; case 'result': SC.result(ctx, M); break;
      case 'combat': G.draw(ctx); ui.hud(ctx); fx.drawXp(ctx); break;
      case 'draft': SC.draft(ctx, M); break; case 'chest': SC.chest(ctx, M); break; case 'pause': SC.pause(ctx, M); break;
    }
    if (M.state !== 'combat') In.endFrame(); else { In.p = {}; In.taps.length = 0; }
  }

  function boot() {
    canvas = document.getElementById('game'); canvas.width = W; canvas.height = H; ctx = canvas.getContext('2d', { alpha: false }); ctx.imageSmoothingEnabled = false;
    In.attach(canvas); SV.load(); CS.art.init(); G.init(); resize(); window.addEventListener('resize', resize);
    var unlock = function () { AU.init(); }; ['pointerdown', 'keydown'].forEach(function (e) { window.addEventListener(e, unlock); });
    if (q.cls && CS.CLASSES[q.cls]) SV.d.cls = q.cls;
    CS.art.load();
    if (q.go) { SV.d.intro = true; M.startRun(Math.max(0, (+q.stage || 1) - 1)); } else M.go('title');
    if (q.gold) SV.d.gold = +q.gold;
    requestAnimationFrame(function (t) { last = t; frame(t); });
  }
  window.addEventListener('load', boot);
})();
