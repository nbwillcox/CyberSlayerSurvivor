"""Cyber Slayer Survivor audio definitions (Stable Audio 3 Medium caption style via local ComfyUI)."""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RAW = os.path.join(ROOT, 'assets', 'raw_audio')          # gitignored (assets/raw*/)
RAW_MUSIC = os.path.join(RAW, 'music')
RAW_SFX = os.path.join(RAW, 'sfx')
OUT = os.path.join(ROOT, 'assets', 'audio')
MUSIC_SECONDS = 112

PIPELINES = {
    'P1': {'cfg': 1.0, 'steps': 8, 'sampler': 'lcm', 'scheduler': 'simple', 'negative': ''},
    'P2': {'cfg': 1.8, 'steps': 8, 'sampler': 'lcm', 'scheduler': 'simple',
           'negative': 'vocals, singing, voice, speech, lyrics, rap, choir, lo-fi, muffled, quiet, ambient, soft'},
}
_I = 'instrumental with no vocals'
# key (matches game: music_menu, music_0 .. music_9) -> (bpm, description)
MUSIC = {
    'music_menu': (96, 'Dark cyberpunk synthwave ' + _I + ', moody neon arpeggios, deep analog bass pulse, gated reverb drums, '
                   'cold shimmering pads and a lonely gothic lead, creating mysterious, anticipation-filled energy'),
    'music_0': (120, 'Dark gothic synthwave ' + _I + ', eerie crypt church organ synth, driving four-on-the-floor kick, pulsing '
                'minor-key bass, neon arpeggios and haunting cyan bell leads, creating spooky, relentless energy'),
    'music_1': (108, 'Industrial metal synthwave ' + _I + ', clanking anvil percussion, heavily distorted guitar riffs, grinding '
                'saw bass, hammering drums and molten synth stabs, creating hot, heavy, factory energy'),
    'music_2': (132, 'Glitchy digital trance synthwave ' + _I + ', fast shimmering arpeggios, airy synth choir pads, crisp '
                'electronic drums with glitch stutters and a pumping bass, creating floating, ethereal, fast energy'),
    'music_3': (116, 'Dark industrial horror synthwave ' + _I + ', pulsing organic machine bass, wet squelchy synth, thumping '
                'kick, distorted guitar stabs and dissonant strings, creating unsettling, heavy, biomechanical energy'),
    'music_4': (124, 'Cold space-wreck synthwave ' + _I + ', echoing sonar pings, laser arpeggios, deep sub bass, crisp '
                'electronic drums and drifting metallic pads, creating lonely, tense, zero-gravity energy'),
    'music_5': (112, 'Gothic cathedral synth metal ' + _I + ', huge pipe organ, dramatic choir-like synth pads, heavy distorted '
                'guitars, pounding drums and a soaring neon violin lead, creating holy, grand, haunted energy'),
    'music_6': (118, 'Toxic acid synthwave ' + _I + ', squelchy resonant acid bassline, bubbling synth arpeggios, hard electro '
                'drums and warped detuned leads, creating murky, hazardous, hypnotic energy'),
    'music_7': (104, 'Icy crystalline synthwave ' + _I + ', cold glassy bell arpeggios, slow heavy sub bass, crisp snare, wide '
                'frozen pads and a glittering lead, creating eerie, frozen, suspenseful energy'),
    'music_8': (136, 'Frantic overdriven reactor techno metal ' + _I + ', pounding fast kick, screaming distorted saw leads, '
                'rapid arpeggios, heavy distorted bass and alarm-like synth stabs, creating unstable, urgent, explosive energy'),
    'music_9': (140, 'Epic final boss symphonic synth metal ' + _I + ', thunderous double bass drums, crushing distorted guitars, '
                'dramatic pipe organ, orchestral strings and brass, soaring shred lead, creating apocalyptic, imperial, climactic energy'),
}


def music_prompt(key, seconds=MUSIC_SECONDS):
    bpm, d = MUSIC[key]
    return '%s. BPM: %d. Length: %d seconds' % (d, bpm, int(seconds))


# name (matches CS.audio sfx names) -> (prompt, prompt length s, generated s, max kept s)
SFX = {
    'slug': ('Heavy futuristic revolver gunshot, deep punchy sub-bass thump with a sharp metallic crack, close-up, dry, action game', 1, 3, 0.6),
    'plasma': ('Small sci-fi plasma bolt zap, short bright electric pew, arcade game', 1, 3, 0.3),
    'bolt': ('Holy electric lightning crackle zap, bright golden energy arc with a shimmering tail, sci-fi magic', 1, 3, 0.6),
    'zap': ('Tesla coil chain lightning zap, crackling electric discharge, short', 1, 3, 0.5),
    'hit': ('Short meaty impact thud with a metallic clink, game hit sound, dry', 1, 3, 0.25),
    'crit': ('Sharp critical hit impact, bright metallic crunch with a deep thump and a ringing sparkle, game', 1, 3, 0.5),
    'kill': ('Small robotic skeleton collapsing, quick rattle of bones and metal falling, short', 1, 3, 0.4),
    'boom': ('Big sci-fi explosion, deep booming blast with rumbling debris and heavy low end, cinematic game', 2, 3, 1.4),
    'smallboom': ('Small punchy explosion pop with crackle, short, action game', 1, 3, 0.7),
    'coin': ('Bright metallic coin pickup clink with a sparkling chime ding, arcade game', 1, 3, 0.5),
    'scrap': ('Small scrap metal clatter pickup, quick metallic clinks, game', 1, 3, 0.4),
    'whoosh': ('Short magnetic vacuum whoosh sweeping toward the listener, swish, sci-fi', 1, 3, 0.5),
    'heal': ('Soft rising healing chime arpeggio, warm sparkling magical restore sound, game', 1, 3, 0.9),
    'levelup': ('Triumphant ascending synth arpeggio level up fanfare with a shimmering sparkle, rewarding video game', 2, 3, 1.6),
    'pick': ('Confirming rising two-note synth blip with a sparkle, game upgrade selected', 1, 3, 0.5),
    'chest': ('Golden treasure chest opening fanfare with brass hit, sparkling coins and a rising synth arpeggio, rewarding game', 3, 4, 2.2),
    'warning': ('Industrial alarm klaxon siren, loud blaring boss warning, three rising sweeps, sci-fi', 3, 4, 2.4),
    'hurt': ('Player taking damage, harsh distorted impact thud with a short electronic buzz, game', 1, 3, 0.5),
    'shield': ('Energy barrier shield absorbing a hit, rising electric hum zap, sci-fi', 1, 3, 0.5),
    'shieldbreak': ('Energy shield shattering, glassy electric crash with a downward sweep, sci-fi', 1, 3, 0.8),
    'dodge': ('Quick phase shift whoosh with a faint electric zip, evasive dash, sci-fi', 1, 3, 0.35),
    'laser': ('Powerful sci-fi laser beam firing, bright descending sweep with buzzing energy', 1, 3, 0.7),
    'beam': ('Huge orbital ion beam strike from the sky, rising charge then massive energy blast, cinematic sci-fi', 2, 3, 1.3),
    'nova': ('Expanding holy fire shockwave nova, swelling whoosh with a bright crackling burst, sci-fi', 2, 3, 1.0),
    'spawn': ('Low digital materialize pulse, a short deep synth swell blip, sci-fi', 1, 3, 0.4),
    'boss': ('Gigantic menacing boss roar, deep distorted growl with a rumbling metallic drone, cinematic', 3, 4, 2.0),
    'slam': ('Massive ground slam impact, enormous sub-bass thud with a rolling shockwave rumble, cinematic', 2, 3, 1.4),
    'click': ('Short crisp futuristic UI button click, tiny digital tick', 1, 3, 0.15),
    'move': ('Very short soft UI cursor blip, tiny digital tick', 1, 3, 0.1),
    'buy': ('Cash register style purchase chime, bright two-note ding with a coin clink, game shop', 1, 3, 0.7),
    'deny': ('Denied buzzer error tone, short low dull buzz, game UI', 1, 3, 0.35),
    'victory': ('Heroic victory fanfare, triumphant brass and synth arpeggio, short jingle, video game stage clear', 4, 5, 3.5),
    'defeat': ('Sad descending defeat jingle, slow falling minor synth notes, game over', 3, 4, 2.8),
    'saw': ('Spinning circular sawblade whir, short metallic scrape zing', 1, 3, 0.35),
    'summon': ('Magical-tech summoning swell, rising synth whoosh with a shimmer and a deep thump, sci-fi', 1, 3, 0.8),
    'telegraph': ('Short rising warning blip, sonar style ping alert', 1, 3, 0.3),
}


def sfx_prompt(name):
    p, ln = SFX[name][0], SFX[name][1]
    return '%s. Length: %d second%s' % (p, ln, '' if ln == 1 else 's')
