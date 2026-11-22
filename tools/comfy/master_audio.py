"""Master raw ComfyUI audio into game assets.

  python master_audio.py            # music + sfx
Music: pick the best of candidates A/B (objective checks), loop-cut 80-102 s, -14 LUFS, limiter -> assets/audio/<key>.mp3 (112 kbps).
SFX: pick the cleanest of the takes, trim/fade/normalise -> assets/audio/<name>.wav (mono 16-bit).
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audiolib as al  # noqa: E402
import defs_cs as d  # noqa: E402

REPORT = {}


def music():
    for key in d.MUSIC:
        best = None
        for c in 'AB':
            w = os.path.join(d.RAW_MUSIC, '%s_%s.wav' % (key, c))
            if not os.path.exists(w):
                continue
            sr, x = al.read_wav(w)
            raw = al.analyze_music(x, sr); y, info = al.master_music(x, sr); m = al.analyze_music(y, sr)
            probs = al.music_problems(m); sc = al.music_score(raw)
            print(key, c, 'score', sc, 'problems', probs, 'loop', info['dur_s'], flush=True)
            rank = (len(probs) == 0, sc)
            if best is None or rank > best[0]:
                best = (rank, c, y, sr, info, probs)
        if not best:
            print('no raw audio for', key); continue
        out = os.path.join(d.OUT, key + '.mp3')
        n = al.encode_mp3(out, best[2], best[3], 112)
        REPORT[key] = {'cand': best[1], 'info': best[4], 'problems': best[5], 'bytes': n}
        print('->', key, 'cand', best[1], '%.1f MB' % (n / 1e6), flush=True)


def sfx():
    for name in d.SFX:
        best = None
        for t in (1, 2, 3):
            w = os.path.join(d.RAW_SFX, '%s_%d.wav' % (name, t))
            if not os.path.exists(w):
                continue
            sr, x = al.read_wav(w)
            y, info = al.process_sfx(x, sr, max_len=d.SFX[name][3])
            if y is None:
                continue
            rank = (-abs(info['events'] - 1) if name not in ('levelup', 'chest', 'victory', 'defeat', 'warning', 'heal', 'boss', 'nova', 'beam', 'boom', 'slam') else 0, -info['pre_noise_db'] * -1 * -1, info['crest_db'])
            if best is None or rank > best[0]:
                best = (rank, y, sr, info)
        if not best:
            print('no sfx for', name); continue
        al.write_wav(os.path.join(d.OUT, name + '.wav'), best[2], best[1]); REPORT['sfx_' + name] = best[3]
        print('sfx', name, best[3]['dur_s'], 's', flush=True)


if __name__ == '__main__':
    os.makedirs(d.OUT, exist_ok=True)
    what = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if what in ('all', 'music'): music()
    if what in ('all', 'sfx'): sfx()
    json.dump(REPORT, open(os.path.join(d.RAW, 'master_report.json'), 'w'), indent=1)
