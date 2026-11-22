"""Generate raw music + SFX with Stable Audio 3 Medium through the LOCAL ComfyUI (127.0.0.1:8188).

  python gen_audio.py music              # 11 tracks x 2 candidates (A=P1, B=P2)
  python gen_audio.py sfx                # every SFX x 3 takes
  python gen_audio.py music --ids music_0 --force
Resume-safe: existing WAVs are skipped.
"""
import argparse
import os
import sys
import time
import zlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audiolib as al  # noqa: E402
import comfy_client as cc  # noqa: E402
import defs_cs as d  # noqa: E402


def music(ids, force):
    os.makedirs(d.RAW_MUSIC, exist_ok=True)
    for key in ids:
        for cand, pk in (('A', 'P1'), ('B', 'P2')):
            w = os.path.join(d.RAW_MUSIC, '%s_%s.wav' % (key, cand))
            if os.path.exists(w) and not force:
                print('skip', key, cand, flush=True); continue
            prompt = d.music_prompt(key)
            seed = zlib.crc32(('cs-' + key + cand).encode()) & 0x7fffffff
            t0 = time.time()
            try:
                files, dt = cc.generate(prompt, d.MUSIC_SECONDS, seed, batch=1, prefix='cyberslayer/%s_%s' % (key, cand), **d.PIPELINES[pk])
            except Exception as e:
                print('FAILED', key, cand, repr(e)[:600], flush=True); continue
            sr, x = al.decode(files[0][1]); al.write_wav(w, sr, x)
            print('music', key, cand, '%.0fs audio in %.0fs' % (x.shape[1] / sr, time.time() - t0), flush=True)


def sfx(names, takes, force):
    os.makedirs(d.RAW_SFX, exist_ok=True)
    pipe = dict(d.PIPELINES['P2']); pipe['negative'] = 'music, melody, singing, voice, speech, background noise, hum, reverb wash, quiet, muffled'
    for nm in names:
        ws = [os.path.join(d.RAW_SFX, '%s_%d.wav' % (nm, k + 1)) for k in range(takes)]
        if all(os.path.exists(w) for w in ws) and not force:
            print('skip', nm, flush=True); continue
        seed = zlib.crc32(('cs-sfx-' + nm).encode()) & 0x7fffffff
        try:
            files, dt = cc.generate(d.sfx_prompt(nm), d.SFX[nm][2], seed, batch=takes, prefix='cyberslayer/sfx_%s' % nm, **pipe)
        except Exception as e:
            print('FAILED', nm, repr(e)[:600], flush=True); continue
        for i, w in enumerate(ws):
            if i < len(files):
                sr, x = al.decode(files[i][1]); al.write_wav(w, sr, x)
        print('sfx', nm, '%d takes in %.1fs' % (len(files), dt), flush=True)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('what'); ap.add_argument('--ids', default='all'); ap.add_argument('--takes', type=int, default=3); ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    if a.what == 'music': music(list(d.MUSIC) if a.ids == 'all' else a.ids.split(','), a.force)
    else: sfx(list(d.SFX) if a.ids == 'all' else a.ids.split(','), a.takes, a.force)
