/* menu / meta screens: title, class select, Mega Man style stage select, Armory Sanctum, draft, chest, pause, result */
(function () {
  var U = CS.U, A = CS.art, In = CS.In, AU = CS.audio, SV = CS.save, ui = CS.ui, W = CS.W, H = CS.H, SC = CS.screens = {};
  var C = function () { return CS.CLASSES[SV.d.cls]; };

  function toggles(y, x0) {
    var s = SV.d.set, labels = [['MUSIC', 'music'], ['SFX', 'sfx'], ['SHAKE', 'shake']], x = x0;
    labels.forEach(function (l, i) {
      var v = s[l[1]]; if (ui.btn('set' + i, x + i * 112, y, 106, 20, l[0] + ' ' + Math.round(v * (l[1] === 'shake' ? 100 : 100)) + '%', { c: '#7a8aa8' })) {
        var steps = l[1] === 'shake' ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1], idx = steps.indexOf(v); if (idx < 0) idx = 0; s[l[1]] = steps[(idx + 1) % steps.length]; SV.store(); AU.vol(); if (l[1] === 'music' && AU.ctx) { /* gain only */ }
      }
    });
    if (ui.btn('setap', x0 + 3 * 112, y, 124, 20, 'AUTO-PAUSE: ' + (s.autopause ? 'ON' : 'OFF'), { c: s.autopause ? '#5cff8a' : '#7a8aa8' })) { s.autopause = !s.autopause; SV.store(); }
  }

  /* ---------------- title ---------------- */
  SC.title = function (ctx) {
    var t = ui.t; ui.backdrop(ctx, ['#07040f', '#1a1040', '#b54cff']);
    // logo
    var y = 70 + Math.sin(t * 2) * 3; ui.text('CYBER SLAYER', W >> 1, y, '#27e6ff', 7, 'center'); ui.text('CYBER SLAYER', (W >> 1) - 2, y - 2, '#b54cff', 7, 'center', false); ui.text('CYBER SLAYER', W >> 1, y, '#e8ffff', 7, 'center', false);
    ui.text('SURVIVOR', W >> 1, y + 66, '#ffd700', 5, 'center'); ui.text('BULLET-HEAVEN MINION ROGUELITE', W >> 1, y + 112, '#9fb4d0', 1, 'center');
    ['gunner', 'engineer', 'priest'].forEach(function (c, i) { A.draw(ctx, c, W / 2 - 110 + i * 110, 250 + Math.sin(t * 3 + i) * 3, i === 2, false, 2.2); });
    if (ui.btn('start', W / 2 - 110, 300, 220, 36, SV.d.intro ? 'START' : 'NEW GAME', { c: '#27e6ff', sc: 2 })) { CS.main.go(SV.d.intro ? 'levels' : 'class'); }
    if (ui.btn('armory', W / 2 - 110, 344, 220, 28, 'THE ARMORY SANCTUM', { c: '#ffd700' })) CS.main.go('shop');
    if (ui.btn('class', W / 2 - 110, 378, 220, 28, 'CLASS: ' + C().n, { c: C().c })) CS.main.go('class');
    toggles(414, W / 2 - 230);
    ui.text('GOLD ' + U.num(SV.d.gold) + '   SECTORS CLEARED ' + SV.clearedCount() + '/10', W >> 1, 446, '#ffd700', 1, 'center');
    ui.text('WASD / ARROWS / PAD STICK / TOUCH TO MOVE.   ENTER SELECTS.   ESC PAUSES.', W >> 1, 468, '#6a7a98', 1, 'center');
    ui.text('FREE FOR NON-COMMERCIAL USE  -  CC BY-NC 4.0  -  LINK BACK REQUIRED', W >> 1, 490, '#9fb4d0', 1, 'center');
    ui.link('lk1', W / 2 - 170, 506, 150, 'NICTOOLS.DEV', CS.LINKS.site); ui.link('lk2', W / 2 + 20, 506, 150, 'GITHUB REPO', CS.LINKS.repo);
  };

  /* ---------------- class select ---------------- */
  SC.class = function (ctx) {
    ui.backdrop(ctx); ui.title('CHOOSE YOUR SLAYER', 22, '#27e6ff', 3);
    ['gunner', 'engineer', 'priest'].forEach(function (id, i) {
      var c = CS.CLASSES[id], x = 40 + i * 300, y = 70, w = 280, h = 390, sel = SV.d.cls === id;
      if (ui.btn('cl' + i, x, y, w, h, '', { c: c.c })) { SV.d.cls = id; SV.d.intro = true; SV.store(); CS.main.go('levels'); }
      ui.text(c.n, x + w / 2, y + 12, c.c, 2, 'center'); ui.text(c.sub, x + w / 2, y + 32, '#9fb4d0', 1, 'center');
      ctx.fillStyle = A.hex(c.c, 0.18); ctx.fillRect(x + 90, y + 50, 100, 100); A.draw(ctx, id, x + w / 2, y + 100 + Math.sin(ui.t * 3) * 2, false, false, 4);
      var st = [['HP', c.hp], ['ARMOR', c.armor], ['SPEED', c.spd], ['CRIT', Math.round(c.crit * 100) + '%'], ['PICKUP', c.pick]];
      st.forEach(function (s, j) { ui.text(s[0], x + 20, y + 162 + j * 12, '#8fb4d0', 1); ui.text('' + s[1], x + w - 20, y + 162 + j * 12, '#fff', 1, 'right'); });
      ui.text('PRIMARY', x + 20, y + 230, '#ffd700', 1); ui.text(CS.ITEMS[c.primary].n, x + 20, y + 242, '#fff', 1);
      ui.text('MINIONS', x + 20, y + 260, '#ffd700', 1); ui.text(c.mn.vanguard + ', ' + c.mn.sniper, x + 20, y + 272, '#fff', 1, 'left', false); ui.text(c.mn.aegis + ', ' + c.mn.detonator, x + 20, y + 282, '#fff', 1, 'left', false); ui.text('FUSES TO ' + c.mn.fusion, x + 20, y + 292, '#ff4fd8', 1, 'left', false);
      ui.wrap(c.d, 44).forEach(function (l, j) { ui.text(l, x + 20, y + 316 + j * 10, '#b8c4dc', 1, 'left', false); });
      if (sel) ui.text('CURRENT', x + w / 2, y + 372, '#5cff8a', 1, 'center');
    });
    if (ui.btn('back', 20, 490, 120, 24, 'BACK', {})) CS.main.go(CS.main.prev || 'title');
  };

  /* ---------------- level select ---------------- */
  var ORDER = [2, 3, 4, 5, 1, 6, 7, 8, 9];
  SC.canPlay = function (n) { var d = SV.d; if (n === 10) { for (var i = 1; i <= 9; i++) if (!d.cleared[i]) return false; return true; } return !!d.unlocked[n] || (n === 1); };
  SC.levels = function (ctx) {
    var d = SV.d, M = CS.main; ui.backdrop(ctx, ['#060a14', '#12264a', '#27e6ff']);
    ui.title(d.cleared[1] ? 'NEURAL STAGE SELECT GRID' : 'SECTOR 01', 14, '#27e6ff', 3);
    ui.text('GOLD ' + U.num(d.gold), W - 20, 20, '#ffd700', 2, 'right'); ui.text('DECRYPTION KEYS ' + d.keys, W - 20, 42, '#ffe44d', 1, 'right');
    var foc = ui.focus; if (foc.indexOf('st') === 0) M.sel = parseInt(foc.slice(2), 10) - 1;
    function cell(n, x, y, w, h) {
      var S = CS.STAGES[n - 1], open = SC.canPlay(n), clr = d.cleared[n], sel = M.sel === n - 1;
      if (ui.btn('st' + n, x, y, w, h, '', { c: S.pal[2] })) {
        if (open) M.startRun(n - 1); else if (n < 10 && d.keys > 0) { d.keys--; d.unlocked[n] = true; SV.store(); AU.sfx('buy'); M.msg = 'SECTOR ' + n + ' DECRYPTED'; M.msgT = 2; } else { AU.sfx('deny'); M.msg = n === 10 ? 'CLEAR SECTORS 1-9 FIRST' : 'NO DECRYPTION KEYS - CLEAR A SECTOR'; M.msgT = 2; }
      }
      ctx.drawImage(A.tile(n - 1), 0, 0, Math.min(256, w - 4), Math.min(256, h - 4), x + 2, y + 2, Math.min(256, w - 4), Math.min(256, h - 4));
      ctx.fillStyle = open ? 'rgba(0,0,0,.35)' : 'rgba(0,0,10,.78)'; ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      if (open) A.draw(ctx, 'boss_' + (n - 1), x + w - 36, y + h / 2 - 4, false, false, n === 10 ? 0.6 : 0.7);
      ui.text(S.sub, x + 8, y + 8, S.pal[2], 1); ui.text(open ? S.n : '???', x + 8, y + 20, open ? '#fff' : '#6a7a98', 1);
      ui.text(clr ? 'CLEARED' : open ? 'READY' : n === 10 ? 'LOCKED' : 'LOCKED - 1 KEY', x + 8, y + h - 14, clr ? '#5cff8a' : open ? '#ffd700' : '#ff7a7a', 1);
    }
    if (!d.cleared[1]) {
      cell(1, 150, 90, 330, 200); ui.text('BEAT THE WARDEN TO UNLOCK THE GRID', 315, 300, '#9fb4d0', 1, 'center'); ui.text('EACH CLEAR GRANTS A DECRYPTION KEY', 315, 314, '#9fb4d0', 1, 'center');
    } else {
      ORDER.forEach(function (n, i) { cell(n, 30 + (i % 3) * 176, 66 + Math.floor(i / 3) * 104, 170, 98); });
      cell(10, 30, 384, 524, 56);
    }
    // info panel
    var n = (M.sel || 0) + 1, S = CS.STAGES[n - 1], px = 586, py = 66, pw = 344, ph = d.cleared[1] ? 374 : 224; if (!d.cleared[1]) { px = 520; pw = 410; }
    ui.panel(px, py, pw, ph, S.pal[2], '#0a0e1c', 0.9); ui.text(S.sub, px + 12, py + 12, S.pal[2], 1); ui.text(SC.canPlay(n) ? S.n : 'ENCRYPTED SECTOR', px + 12, py + 26, '#fff', 2);
    if (SC.canPlay(n)) {
      ui.text('SECTOR BOSS', px + 12, py + 54, '#ffd700', 1); ui.text(S.boss.n, px + 12, py + 66, '#fff', 1);
      ui.text('HAZARDS', px + 12, py + 88, '#ffd700', 1); var hn = { slag: 'MOLTEN SLAG', conveyor: 'CONVEYORS', storm: 'STORMS', lasers: 'LASER GRIDS', acid: 'ACID POOLS', ice: 'SLIPPERY ICE', rings: 'PLASMA RINGS' }; ui.text(S.hz.length ? S.hz.map(function (h) { return hn[h]; }).join(', ') : 'NONE - WARM UP', px + 12, py + 100, '#fff', 1, 'left', false);
      ui.text('LENGTH', px + 12, py + 122, '#ffd700', 1); ui.text(U.fmt(CS.BAL.stageSec(n - 1, d.blitz)) + (d.blitz ? ' BLITZ' : ' STANDARD') + ' + BOSS', px + 12, py + 134, '#fff', 1);
      ui.text('BEST CLEAR', px + 12, py + 156, '#ffd700', 1); ui.text(d.best[n] ? U.fmt(d.best[n]) : '--', px + 12, py + 168, '#fff', 1);
      A.draw(ctx, 'boss_' + (n - 1), px + pw - 70, py + 110, false, false, 1);
    } else ui.text(n === 10 ? 'DEFEAT ALL NINE SECTOR BOSSES' : 'SPEND A DECRYPTION KEY TO UNLOCK', px + 12, py + 60, '#ff9a7a', 1);
    ui.text('YOUR SLAYER', px + 12, py + ph - 70, '#ffd700', 1); ui.text(C().n, px + 12, py + ph - 58, C().c, 1);
    ui.text('GOLD KEPT ON DEFEAT: 60%', px + 12, py + ph - 40, '#7a8aa8', 1);
    if (M.msgT > 0) { M.msgT -= 1 / 60; ui.text(M.msg, W >> 1, 456, '#ffe44d', 2, 'center'); }
    var by = 484;
    if (ui.btn('mode', 30, by, 190, 26, d.blitz ? 'MODE: BLITZ 5:00' : 'MODE: STANDARD', { c: '#ff9a3c' })) { d.blitz = !d.blitz; SV.store(); }
    if (ui.btn('cls', 230, by, 190, 26, 'CLASS: ' + C().n, { c: C().c })) { M.prev = 'levels'; M.go('class'); }
    if (ui.btn('arm', 430, by, 190, 26, 'THE ARMORY SANCTUM', { c: '#ffd700' })) M.go('shop');
    if (ui.btn('bk', 630, by, 120, 26, 'TITLE', {})) M.go('title');
    ui.link('lk', 780, by + 3, 150, 'NICTOOLS.DEV', CS.LINKS.site);
  };

  /* ---------------- Armory Sanctum (meta shop) ---------------- */
  SC.shop = function (ctx) {
    var d = SV.d, M = CS.main; ui.backdrop(ctx, ['#0a0710', '#2a1840', '#ffd700']);
    ui.title('THE ARMORY SANCTUM', 12, '#ffd700', 3); ui.text('GOLD ' + U.num(d.gold), W - 20, 20, '#ffd700', 2, 'right');
    ['gunner', 'engineer', 'priest'].forEach(function (id, i) { var c = CS.CLASSES[id]; if (ui.btn('tab' + i, 30 + i * 150, 50, 144, 22, c.n, { c: c.c, tc: d.cls === id ? '#fff' : '#99a' })) { d.cls = id; SV.store(); } });
    function col(list, x, title, tcol, shared) {
      ui.text(title, x, 84, tcol, 2);
      list.forEach(function (def, i) {
        var rank = shared ? SV.sharedRank(def.id) : SV.classRank(d.cls, def.id), cost = CS.shopCost(def, rank), max = rank >= 10, can = !max && d.gold >= cost, y = 106 + i * 62;
        if (ui.btn('sh' + (shared ? 'a' : 'b') + i, x, y, 440, 56, '', { c: tcol, dis: false })) {
          if (max) AU.sfx('deny'); else if (can) { d.gold -= cost; if (shared) d.shop.shared[def.id] = rank + 1; else d.shop[d.cls][def.id] = rank + 1; SV.store(); AU.sfx('buy'); CS.fx.reset(); } else { AU.sfx('deny'); M.msg = 'NOT ENOUGH GOLD'; M.msgT = 1.5; }
        }
        ui.text(def.n, x + 10, y + 8, '#fff', 1); ui.text(def.d, x + 10, y + 22, '#9fb4d0', 1, 'left', false);
        for (var k = 0; k < 10; k++) { ctx.fillStyle = k < rank ? tcol : '#1c2238'; ctx.fillRect(x + 10 + k * 14, y + 38, 11, 9); }
        ui.text(max ? 'MAX RANK' : cost + ' G', x + 430, y + 8, max ? '#5cff8a' : can ? '#ffd700' : '#ff7a7a', 1, 'right'); ui.text('RANK ' + rank + '/10', x + 430, y + 22, '#c9d6ff', 1, 'right');
      });
    }
    col(CS.SHOP.shared, 30, 'CORE UPGRADES', '#27e6ff', true);
    col(CS.SHOP[d.cls], 490, CS.CLASSES[d.cls].n.replace('THE ', '') + ' ARSENAL', CS.CLASSES[d.cls].c, false);
    ui.text('CLASS UPGRADES APPLY ONLY TO THE SELECTED SLAYER', 490, 360, '#7a8aa8', 1, 'left', false);
    if (M.msgT > 0) { M.msgT -= 1 / 60; ui.text(M.msg, W >> 1, 440, '#ffe44d', 2, 'center'); }
    if (ui.btn('bk', 30, 490, 200, 28, d.cleared[1] ? 'TO STAGE SELECT' : 'BACK', { c: '#27e6ff' })) M.go(M.prevShop || (SV.d.intro ? 'levels' : 'title'));
    ui.link('lk', 780, 494, 150, 'NICTOOLS.DEV', CS.LINKS.site);
  };

  /* ---------------- level-up draft ---------------- */
  SC.draft = function (ctx, M) {
    CS.G.draw(ctx); ctx.fillStyle = 'rgba(2,4,12,.78)'; ctx.fillRect(0, 0, W, H); ui.title('LEVEL UP!  LV ' + CS.G.p.lv, 30, '#ffe44d', 3);
    ui.text('CHOOSE AN UPGRADE  -  1 / 2 / 3', W >> 1, 66, '#9fb4d0', 1, 'center');
    var cards = M.cards, n = cards.length, w = 250, gap = 20, x0 = (W - (n * w + (n - 1) * gap)) / 2;
    cards.forEach(function (c, i) { if (ui.card(c, x0 + i * (w + gap), 90, w, 330, 'c' + i)) M.pick(i); });
    var p = CS.G.p; if (In.p.d1 && cards[0]) M.pick(0); else if (In.p.d2 && cards[1]) M.pick(1); else if (In.p.d3 && cards[2]) M.pick(2);
    if (ui.btn('rr', W / 2 - 90, 440, 180, 26, 'REROLL (R)  x' + p.rerolls, { c: '#ff9a3c', dis: p.rerolls <= 0 }) || (In.p.reroll && p.rerolls > 0)) { if (p.rerolls > 0) { p.rerolls--; M.cards = CS.WP.rollCards(3); AU.sfx('pick'); } }
  };
  /* ---------------- chest reward ---------------- */
  SC.chest = function (ctx, M) {
    var ch = CS.G.chest; CS.G.draw(ctx); ctx.fillStyle = 'rgba(10,6,0,.82)'; ctx.fillRect(0, 0, W, H); ch.t += 1 / 60;
    ui.title('CYBER-RELIC CHEST', 24, '#ffd700', 3); A.draw(ctx, 'chest', W / 2, 96 + Math.sin(ch.t * 4) * 3, false, false, 1.4);
    ui.text('+' + ch.gold + ' GOLD', W >> 1, 126, '#ffd700', 2, 'center');
    var n = ch.cards.length, w = 250, gap = 20, x0 = (W - (n * w + (n - 1) * gap)) / 2, shown = Math.min(n, Math.floor(ch.t / 0.55));
    for (var i = 0; i < n; i++) { if (i < shown) { if (ch.sh === undefined || ch.sh < i + 1) { ch.sh = i + 1; AU.sfx('pick'); CS.fx.shake(0.1); } var c = ch.cards[i]; ui.card(c.kind === 'item' ? c : c, x0 + i * (w + gap), 150, w, 290, null); } }
    if (shown >= n && ui.btn('ok', W / 2 - 90, 456, 180, 30, 'COLLECT', { c: '#ffd700', sc: 2 })) M.endChest();
  };

  /* ---------------- pause / stats ---------------- */
  SC.pause = function (ctx, M) {
    var G = CS.G, p = G.p; G.draw(ctx); ctx.fillStyle = 'rgba(2,4,12,.86)'; ctx.fillRect(0, 0, W, H); ui.title('PAUSED', 12, '#27e6ff', 3);
    ui.panel(20, 50, 300, 380, '#27e6ff'); ui.text('LOADOUT', 32, 60, '#ffd700', 1);
    p.order.forEach(function (id, i) { var it = p.items[id], y = 76 + i * 26, R = CS.RAR[it.rar]; ctx.fillStyle = R.c; ctx.fillRect(31, y - 1, 26, 26); ctx.fillStyle = '#000'; ctx.fillRect(32, y, 24, 24); A.drawIcon(ctx, id, 32, y, 1); ui.text(CS.itemName(id, G.cls), 64, y + 2, '#fff', 1); ui.text('LV ' + it.lv + (it.lv >= 10 ? ' APEX' : '') + '  ' + R.n, 64, y + 13, R.t, 1, 'left', false); });
    ui.panel(330, 50, 300, 380, '#ff9a3c'); ui.text('DAMAGE BREAKDOWN', 342, 60, '#ffd700', 1);
    var rows = []; for (var k in G.stats.dmg) rows.push([k, G.stats.dmg[k]]); rows.sort(function (a, b) { return b[1] - a[1]; }); var tot = rows.reduce(function (s, r) { return s + r[1]; }, 0) || 1;
    rows.slice(0, 10).forEach(function (r, i) { var y = 78 + i * 30, it = CS.ITEMS[r[0]]; ui.text(CS.itemName(r[0], G.cls), 342, y, '#fff', 1); ui.text(U.num(r[1]) + '  ' + Math.round(r[1] / tot * 100) + '%', 618, y, '#c9d6ff', 1, 'right'); ui.bar(342, y + 11, 276, 6, r[1] / rows[0][1], it ? it.c : '#fff', '#151a2c'); });
    ui.panel(640, 50, 300, 380, '#5cff8a'); ui.text('RUN STATS', 652, 60, '#ffd700', 1);
    var st = [['TIME', U.fmt(G.t) + ' / ' + U.fmt(G.dur)], ['LEVEL', p.lv], ['KILLS', G.stats.kills], ['BOSSES', G.stats.bosses], ['GOLD', U.num(p.gold)], ['DAMAGE TAKEN', U.num(G.stats.taken)], ['HEALED', U.num(G.stats.healed)], ['CRITS', G.stats.crits], ['MAX HP', p.maxHp], ['ARMOR', p.armor.toFixed(1)], ['MOVE SPEED', Math.round(p.spd)], ['CRIT', Math.round(p.crit * 100) + '% x' + p.critMul.toFixed(2)], ['PICKUP RADIUS', Math.round(p.pick)], ['XP GAIN', 'x' + p.xpMul.toFixed(2)], ['GOLD GAIN', 'x' + p.goldMul.toFixed(2)], ['MINIONS', G.mn.n + '/' + CS.WP.minionCap()], ['DODGE', Math.round(p.dodge * 100) + '%']];
    st.forEach(function (s, i) { ui.text(s[0], 652, 78 + i * 20, '#8fb4d0', 1); ui.text('' + s[1], 928, 78 + i * 20, '#fff', 1, 'right'); });
    if (ui.btn('res', 20, 444, 200, 30, 'RESUME', { c: '#5cff8a', sc: 2 }) || In.p.pause || In.p.back) M.go('combat');
    if (ui.btn('quit', 230, 444, 200, 30, 'ABANDON RUN', { c: '#ff6a6a' })) { G.over = true; G.won = false; M.finish(); }
    toggles(444, 460); ui.link('lk', 790, 478, 150, 'NICTOOLS.DEV', CS.LINKS.site); ui.text('FREE FOR NON-COMMERCIAL USE - LINK BACK TO NICTOOLS.DEV OR THE GITHUB REPO', 20, 490, '#6a7a98', 1, 'left', false);
  };

  /* ---------------- result ---------------- */
  SC.result = function (ctx, M) {
    var r = M.res; ui.backdrop(ctx, r.won ? ['#041208', '#0f4a28', '#ffd700'] : ['#140406', '#4a1020', '#ff4a5a']);
    ui.title(r.won ? (r.stage === 9 ? 'OMEGA CITADEL CLEARED!' : 'SECTOR CLEARED!') : 'SLAYER DOWN', 50, r.won ? '#ffd700' : '#ff4a5a', 4);
    ui.text(CS.STAGES[r.stage].n, W >> 1, 100, '#fff', 2, 'center');
    A.draw(ctx, SV.d.cls, W >> 1, 170, false, false, 3);
    var lines = [['TIME SURVIVED', U.fmt(r.time)], ['LEVEL REACHED', r.level], ['ENEMIES SLAIN', r.kills], ['BOSSES DOWN', r.bosses], ['GOLD COLLECTED', U.num(r.gold)], [r.won ? 'VICTORY BONUS' : 'GOLD LOST (40%)', r.won ? '+' + r.bonus : '-' + r.lost], ['GOLD BANKED', '+' + r.banked]];
    lines.forEach(function (l, i) { ui.text(l[0], 300, 230 + i * 20, '#9fb4d0', 1); ui.text('' + l[1], 660, 230 + i * 20, i === 6 ? '#ffd700' : '#fff', 1, 'right'); });
    if (r.keyGain) ui.text('+1 SECTOR DECRYPTION KEY', W >> 1, 380, '#ffe44d', 2, 'center'); if (r.unlockMsg) ui.text(r.unlockMsg, W >> 1, 404, '#5cff8a', 1, 'center');
    if (ui.btn('arm', W / 2 - 220, 440, 210, 34, 'THE ARMORY SANCTUM', { c: '#ffd700' })) { M.prevShop = 'levels'; M.go('shop'); }
    if (ui.btn('lv', W / 2 + 10, 440, 210, 34, 'STAGE SELECT', { c: '#27e6ff' })) M.go('levels');
  };
})();
