"""Turn raw ComfyUI art into crisp game pixel art.

  python make_sprites.py                    # use take 1 of everything (or choices.json)
  python make_sprites.py --sheet            # write assets/raw_art/contact_*.png to eyeball the takes
Per sprite: magenta chroma-key -> alpha, crop, box-downscale to the in-game draw size, 24-colour palette, binary alpha,
1px dark outline, then nearest-neighbour x2 (so the final PNG is exactly 2x the draw size, see `node tools/gen-manifest.js --catalog`).
Tiles: seamless blend, pixelate to 128, darken toward the stage colour, nearest x2 -> 256x256. Title: pixelate to 480x270 -> x2.
Writes assets/sprites/<key>.png.
"""
import argparse
import json
import os

import numpy as np
from PIL import Image, ImageFilter
import scipy.ndimage as ndi

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RAW = os.path.join(ROOT, 'assets', 'raw_art')
OUT = os.path.join(ROOT, 'assets', 'sprites')
CH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'art_choices.json')
DRAW = {'gunner': 54, 'engineer': 54, 'priest': 54, 'skeleton': 36, 'ghost': 36, 'hound': 46, 'lich': 46, 'golem': 58, 'banshee': 40,
        'mb_0': 96, 'mb_1': 96, 'mb_2': 96, 'mb_3': 96, 'boss_0': 128, 'boss_1': 128, 'boss_2': 128, 'boss_3': 128, 'boss_4': 128,
        'boss_5': 128, 'boss_6': 128, 'boss_7': 128, 'boss_8': 128, 'boss_9': 168}   # max dimension in px, drawn 1:1 in game
import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_art import I as _ICONS  # noqa: E402
ICONS = list(_ICONS)
BG = ['#0b0618', '#1c0d05', '#050f24', '#1a0510', '#04060d', '#14091f', '#06150a', '#04141a', '#12040a', '#1a0a05']


def keyed(im):
    rgb = np.asarray(im.convert('RGB')).astype(np.float32) / 255.0
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60.0
    sat = d / (mx + 1e-6)
    bg = (h > 285) & (h < 338) & (sat > 0.5) & (mx > 0.25)           # magenta + its darker shadow, not violet robes
    fg = ~ndi.binary_dilation(bg, iterations=1)                      # every magenta-ish pixel is background, even enclosed gaps
    fg = ndi.binary_opening(fg, iterations=1)
    lab2, n2 = ndi.label(fg)
    if n2 > 1:
        sizes = ndi.sum(fg, lab2, range(1, n2 + 1)); keep = [i + 1 for i, s in enumerate(sizes) if s > sizes.max() * 0.03]
        fg = np.isin(lab2, keep)
    rgba = np.dstack([np.asarray(im.convert('RGB')), (fg * 255).astype(np.uint8)])
    return Image.fromarray(rgba, 'RGBA')


def pixelate(im, size, colors=32):
    im = im.crop(im.getbbox()); w, h = im.size; k = size / max(w, h)
    tw, th = max(1, round(w * k)), max(1, round(h * k))
    small = im.resize((tw, th), Image.BOX)
    arr = np.asarray(small).copy(); alpha = arr[..., 3] > 120
    rgb = Image.fromarray(arr[..., :3], 'RGB').filter(ImageFilter.UnsharpMask(radius=0.7, percent=90, threshold=2))
    rgb = rgb.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    arr[..., :3] = np.asarray(rgb); arr[..., 3] = np.where(alpha, 255, 0)
    edge = ndi.binary_dilation(alpha, structure=np.ones((3, 3))) & ~alpha
    out = np.zeros((th + 2, tw + 2, 4), np.uint8); out[1:-1, 1:-1] = arr
    al2 = np.pad(alpha, 1); ed = ndi.binary_dilation(al2, structure=np.ones((3, 3)), iterations=1) & ~al2
    out[ed] = (12, 8, 22, 255)                                              # 1px dark outline
    return Image.fromarray(out, 'RGBA')


def sprite(path, size):
    return pixelate(keyed(Image.open(path)), size)


def icon(path):
    sp = pixelate(keyed(Image.open(path)), 42)
    out = Image.new('RGBA', (48, 48), (0, 0, 0, 0)); out.alpha_composite(sp, ((48 - sp.width) // 2, (48 - sp.height) // 2)); return out


def tile(path, i):
    im = Image.open(path).convert('RGB').resize((512, 512), Image.LANCZOS); a = np.asarray(im).astype(np.float32)
    n = 512; x = np.linspace(-1, 1, n); w = 0.5 - 0.5 * np.cos(np.pi * (1 - np.abs(x)) )     # 0 at edges, 1 at centre
    m = np.outer(w, w)[..., None]
    rolled = np.roll(a, (n // 2, n // 2), (0, 1)); b = a * m + rolled * (1 - m)
    bg = np.array([int(BG[i][k:k + 2], 16) for k in (1, 3, 5)], np.float32)
    b = b * 0.55 + bg * 0.45                                      # keep it dark so enemies/loot read
    sd = max(1.0, float(b.std())); b = np.clip((b - b.mean()) * min(2.4, max(0.9, 19.0 / sd)) + b.mean() * 0.95, 0, 255) * 0.82
    small = Image.fromarray(b.astype(np.uint8)).resize((128, 128), Image.BOX).quantize(colors=28, dither=Image.NONE).convert('RGB')
    return small.resize((256, 256), Image.NEAREST)


def title(path):
    im = Image.open(path).convert('RGB').resize((480, 270), Image.BOX).quantize(colors=40, dither=Image.NONE).convert('RGB')
    return im.resize((960, 540), Image.NEAREST)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--sheet', action='store_true'); ap.add_argument('--only', default='all'); a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    choices = json.load(open(CH)) if os.path.exists(CH) else {}
    keys = [k for k in list(DRAW) + ['tile_%d' % i for i in range(10)] + ['title_bg'] + ICONS if a.only == 'all' or k in a.only.split(',')]
    if a.sheet:
        grps = [(list(DRAW)[:9], 'chars'), (list(DRAW)[9:], 'bosses'), (ICONS[:20], 'icons1'), (ICONS[20:], 'icons2')]
        for grp, name in grps:
            cols = 6; cell = 192; rows = len(grp) * 2 // cols + 1; sh = Image.new('RGBA', (cols * cell, rows * cell), (40, 40, 60, 255)); n = 0
            for k in grp:
                for t in (1, 2):
                    p = os.path.join(RAW, '%s_%d.png' % (k, t))
                    if os.path.exists(p):
                        sp = sprite(p, DRAW[k]) if k in DRAW else icon(p); f = (cell - 8) / max(sp.size); sp = sp.resize((max(1, int(sp.width * f)), max(1, int(sp.height * f))), Image.NEAREST); sh.alpha_composite(sp, ((n % cols) * cell + 4, (n // cols) * cell + 4))
                    n += 1
            sh.convert('RGB').save(os.path.join(RAW, 'contact_%s.png' % name)); print('sheet', name)
        raise SystemExit
    for k in keys:
        t = choices.get(k, 1); p = os.path.join(RAW, '%s_%d.png' % (k, t))
        if not os.path.exists(p):
            print('missing', p); continue
        if k in DRAW: sprite(p, DRAW[k]).save(os.path.join(OUT, k + '.png'))
        elif k.startswith('icon_'): icon(p).save(os.path.join(OUT, k + '.png'))
        elif k.startswith('tile_'): tile(p, int(k[5:])).save(os.path.join(OUT, k + '.png'))
        else: title(p).save(os.path.join(OUT, k + '.png'))
        print('wrote', k, 'take', t)
