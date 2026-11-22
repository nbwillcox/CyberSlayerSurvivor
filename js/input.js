/* input: keyboard, mouse/touch (virtual-resolution coords), gamepad, floating touch stick */
(function () {
  var In = CS.In = { keys: {}, p: {}, mx: -1, my: -1, taps: [], joy: { on: false, id: -1, ox: 0, oy: 0, x: 0, y: 0 }, joyEnabled: false, pad: null, padPrev: [], lastDev: 'kb', canvas: null };
  var NAV = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code.indexOf('Arrow') === 0) e.preventDefault();
    In.lastDev = 'kb';
    In.keys[e.code] = true;
    var d = NAV[e.code]; if (d) In.p[d] = true;
    if (e.code === 'Enter' || e.code === 'Space') In.p.confirm = true;
    if (e.code === 'Escape' || e.code === 'KeyP') In.p.pause = true;
    if (e.code === 'Escape' || e.code === 'Backspace') In.p.back = true;
    if (e.code === 'KeyR') In.p.reroll = true;
    if (e.code === 'KeyB') In.p.alt = true;
    if (e.code === 'Digit1') In.p.d1 = true; if (e.code === 'Digit2') In.p.d2 = true; if (e.code === 'Digit3') In.p.d3 = true; if (e.code === 'Digit4') In.p.d4 = true;
    if (e.code === 'Tab') { e.preventDefault(); In.p.pause = true; }
  });
  window.addEventListener('keyup', function (e) { In.keys[e.code] = false; });
  window.addEventListener('blur', function () { In.keys = {}; In.p.blur = true; });

  In.attach = function (canvas) {
    In.canvas = canvas;
    function pos(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * CS.W / r.width, y: (e.clientY - r.top) * CS.H / r.height }; }
    canvas.addEventListener('pointermove', function (e) { var q = pos(e); In.mx = q.x; In.my = q.y; if (e.pointerType === 'mouse') In.lastDev = 'mouse';
      if (In.joy.on && e.pointerId === In.joy.id) { In.joy.x = q.x - In.joy.ox; In.joy.y = q.y - In.joy.oy; } });
    canvas.addEventListener('pointerdown', function (e) {
      var q = pos(e); In.mx = q.x; In.my = q.y; In.lastDev = e.pointerType === 'mouse' ? 'mouse' : 'touch';
      try { canvas.setPointerCapture(e.pointerId); } catch (_) { }
      if (In.joyEnabled && e.pointerType !== 'mouse' && !In.joy.on) { In.joy.on = true; In.joy.id = e.pointerId; In.joy.ox = q.x; In.joy.oy = q.y; In.joy.x = 0; In.joy.y = 0; }
      else In.taps.push({ x: q.x, y: q.y });
      e.preventDefault();
    });
    function up(e) { if (In.joy.on && e.pointerId === In.joy.id) { In.joy.on = false; In.joy.x = In.joy.y = 0; } }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  };

  function dz(v) { return Math.abs(v) < 0.2 ? 0 : v; }
  In.poll = function () {
    var gps = navigator.getGamepads ? navigator.getGamepads() : [], g = null, i;
    for (i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { g = gps[i]; break; }
    In.pad = g;
    if (!g) return;
    var b = g.buttons, prev = In.padPrev, any = false;
    function edge(idx) { var d = b[idx] && b[idx].pressed; var r = d && !prev[idx]; return r; }
    if (edge(0)) In.p.confirm = true; if (edge(1)) In.p.back = true; if (edge(9)) In.p.pause = true; if (edge(3)) In.p.reroll = true; if (edge(2)) In.p.alt = true;
    if (edge(12)) In.p.up = true; if (edge(13)) In.p.down = true; if (edge(14)) In.p.left = true; if (edge(15)) In.p.right = true;
    var ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    var sx = Math.abs(ax) > 0.6 ? Math.sign(ax) : 0, sy = Math.abs(ay) > 0.6 ? Math.sign(ay) : 0;
    if (sx !== (prev.sx || 0) && sx) In.p[sx > 0 ? 'right' : 'left'] = true;
    if (sy !== (prev.sy || 0) && sy) In.p[sy > 0 ? 'down' : 'up'] = true;
    prev.sx = sx; prev.sy = sy;
    for (i = 0; i < b.length; i++) { prev[i] = b[i].pressed; if (b[i].pressed) any = true; }
    if (any || Math.abs(ax) > 0.3 || Math.abs(ay) > 0.3) In.lastDev = 'pad';
  };
  In.move = function () {
    var x = 0, y = 0, k = In.keys;
    if (k.KeyA || k.ArrowLeft) x -= 1; if (k.KeyD || k.ArrowRight) x += 1; if (k.KeyW || k.ArrowUp) y -= 1; if (k.KeyS || k.ArrowDown) y += 1;
    if (In.pad) { x += dz(In.pad.axes[0] || 0); y += dz(In.pad.axes[1] || 0); if (In.pad.buttons[14] && In.pad.buttons[14].pressed) x -= 1; if (In.pad.buttons[15] && In.pad.buttons[15].pressed) x += 1; if (In.pad.buttons[12] && In.pad.buttons[12].pressed) y -= 1; if (In.pad.buttons[13] && In.pad.buttons[13].pressed) y += 1; }
    if (In.joy.on) { x += In.joy.x / 45; y += In.joy.y / 45; }
    var l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    return { x: x, y: y };
  };
  In.endFrame = function () { In.p = {}; In.taps.length = 0; };
})();
