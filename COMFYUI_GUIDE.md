# ComfyUI Art & Audio Guide - Cyber Slayer Survivor

The game ships 100% playable with procedural pixel art and a Web Audio synth. Drop files into `assets/sprites/` and `assets/audio/`, run `node tools/gen-manifest.js`, reload. Anything missing falls back automatically. `node tools/gen-manifest.js --catalog` lists every key with its exact recommended size.

## File naming

| Type | Pattern | Example |
|---|---|---|
| Sprite | `assets/sprites/<key>.png` (transparent PNG) | `gunner.png`, `skeleton.png`, `boss_3.png` |
| Animated strip | `<key>@<frames>.png` (frames side by side) | `skeleton@4.png` |
| SFX | `assets/audio/<name>.ogg\|wav\|mp3` | `slug.wav`, `coin.ogg`, `levelup.wav` |
| Stage BGM (loops) | `music_0` ... `music_9`, `music_menu` | `music_0.ogg` = Neon Catacombs |

Key families: `gunner engineer priest` - `skeleton ghost hound lich golem banshee` - `drone` - `mn_<vanguard|sniper|aegis|detonator|giant>_<class>` - `mb_0..3` (mid-bosses) - `boss_0..9` (sector bosses) - `coin scrap health magnet chest` - `shot_slug shot_plasma shot_orb shot_saw shot_bolt` - `icon_<itemId>`.

Generated PNGs are drawn **1:1 at their native size** (the manifest entry carries `"scale": 1`), so author them at the final in-game size - `python tools/comfy/make_sprites.py` does exactly that (max dimension: players 54 px, small enemies 36-46, golem 58, mid-bosses 96, sector bosses 128, final boss 168). Tiles are 256x256 (seamless) and `title_bg` is 960x540. Entries without `scale` fall back to the procedural sprite's draw size.

## Automated pipeline (what shipped in this repo)

All art/audio in `assets/` was produced with the scripts in `tools/comfy/` against a local ComfyUI (`127.0.0.1:8188`, no cloud nodes):

```
python tools/comfy/gen_art.py          # Z-Image Turbo -> assets/raw_art/*.png (magenta-key sprites, tiles, title)
python tools/comfy/make_sprites.py     # chroma-key, box-downscale, 32-colour palette, outline -> assets/sprites/
python tools/comfy/gen_audio.py sfx    # Stable Audio 3 Medium, 3 takes per SFX
python tools/comfy/gen_audio.py music  # 11 tracks x 2 candidates
python tools/comfy/master_audio.py     # pick best take, loop-cut, -14 LUFS, MP3 / WAV -> assets/audio/
node tools/gen-manifest.js             # rebuild assets/manifest.json
```
Raw intermediates (`assets/raw_art`, `assets/raw_audio`) are gitignored. Python deps: `numpy scipy pillow av`.

## A. Pixel-art workflow (zero blur)

1. **Checkpoint:** SDXL 1.0 or Flux.1 Dev. **LoRA:** Pixel Art XL, weight 0.85-1.0.
2. **KSampler:** 1024x1024 (or 512x512), Euler a or DPM++ 2M Karras, 28-35 steps, CFG 5.5-7.0 (Flux: CFG 1, guidance 3.5).
3. **Background removal:** RMBG-2.0 node (or BiRefNet) -> clean alpha.
4. **Downscale:** `ImageScale` / "Image Resize" node, method **nearest-exact** (never bilinear/bicubic/lanczos) to the exact target (64x64 characters, 32x32 projectiles & icons, 128x128 bosses; the manifest guide above shows the final sizes).
5. **Palette quantize:** a Color Palette Quantizer node (32-64 colours, no dither) so edges stay razor-sharp.
6. **Save:** `SaveImage` as PNG with alpha, filename = the key.

Tip: generate 4 variations per subject, pick the one with the strongest silhouette, and always keep a 1-px dark outline in the prompt.

### Shared prompt wrapper

Positive: `<SUBJECT>, pixel art, 16-bit sprite, single character centered, front 3/4 top-down view, strong dark outline, limited palette, crisp pixels, flat shading, neon cyberpunk gothic sci-fi fantasy, plain solid magenta background`

Negative: `blurry, smooth gradient, anti-aliasing, soft edges, photo, 3d render, realistic, painting, text, watermark, multiple characters, cropped, jpeg artifacts, dithering noise, background scenery`

### Classes (64x64 -> key)

| Key | `<SUBJECT>` |
|---|---|
| `gunner` | cyber-mercenary in a tattered tactical trench coat, glowing cyan visor, chrome cybernetic arm, smoking heavy revolver pistol |
| `engineer` | female engineer in a bulky exosuit rig, welding goggles on forehead, glowing plasma backpack, utility belt with tools |
| `priest` | neo-gothic cyber priest, long violet cyber-robes with neon-gold scripture plates, floating holographic gold halo, bionic staff |

### Regular enemies (key)

| Key | `<SUBJECT>` |
|---|---|
| `skeleton` | cybernetic skeleton, rusted chrome ribcage, glowing red optical sockets, plasma shiv |
| `ghost` | translucent holographic skull fused to a hovering quad-rotor drone chassis, cyan glow |
| `hound` | four-legged necro-cyborg hound, exposed skeletal frame with hydraulic pistons, red eyes, side view |
| `lich` | techno-lich acolyte in tattered cyber-robes, floating dark-matter purple core in chest, skull face |
| `golem` | hulking rusted industrial mech possessed by a dark spirit, glowing orange furnace core, heavy armor plates |
| `banshee` | screaming void-wraith digital apparition, purple glitching static body, open mouth, torn pixels |

### Minions (per class, 32x32 -> `mn_<kind>_<class>`)

Kinds: `vanguard` (melee trooper bot), `sniper` (long-rifle ranged unit), `aegis` (floating shield orbiter), `detonator` (spherical suicide bot), `giant` (fused elite mech, 64x64). Per class flavour: **gunner** = cyber-trooper squad / elite mech; **engineer** = builder, tesla, shield and kamikaze drones / orbital dreadnought; **priest** = cyber-paladin, rail-seraph, holo-cherub, radiant reliquary / archangel construct. Reuse the wrapper with `<kind> <flavour>, <class accent colour>`.

### Mid-bosses (`mb_0..3`, 128x128)

| Key | `<SUBJECT>` |
|---|---|
| `mb_0` | ARCH-LICH MAINFRAME: floating server-rack lich in a hood of cables, glowing purple core, skull monitor face |
| `mb_1` | GOLIATH BONE-CRUSHER MK.IV: gigantic bone-and-steel brute mech with piston fists, orange glowing joints |
| `mb_2` | SERAPHIM CORRUPTED AI: six-winged glitching golden angel machine, halo ring of broken code |
| `mb_3` | CYBER-REAPER PRIME: hooded skeletal reaper with a crimson energy scythe, tattered cyber-cloak |

### Sector bosses (`boss_0..9`, 128x128, final boss 192x192 then downscaled)

| Key | Boss | `<SUBJECT>` |
|---|---|---|
| `boss_0` | Warden Necro-Bot | giant prison-warden robot with skull helm, purple neon runes, chained cannons |
| `boss_1` | Molten Bone-Forge | walking furnace of molten slag and giant bones, chimney horns, lava dripping |
| `boss_2` | Specter-OS | floating spectral operating-system lich, cyan holographic windows, ghostly rack arms |
| `boss_3` | Abomination Unit-09 | fused flesh-and-steel lab monstrosity, exposed ribs, mutant claws, pink glow |
| `boss_4` | Dreadnought Captain Vane | undead starship captain in a wrecked cyber-armor, glowing red helm, laser cutlass |
| `boss_5` | Fallen Cyber-Archangel | fallen armoured angel, cracked golden halo, black-gold wings of stained-glass hologram |
| `boss_6` | Hydra-Core 7 | multi-headed toxic hydra reactor, green acid glow, cables as necks |
| `boss_7` | Sub-Zero Lich | frost-covered cryo lich in a stasis pod crown, icy blue crystals, glowing eyes |
| `boss_8` | Chrono-Reaper | time-bending reaper with clock-face chest, magenta chrono scythe, broken hourglass |
| `boss_9` | DEUS EX NECROS | golden-and-crimson imperial death-god mech-throne emperor, crown of spikes, many eyes, ultimate final boss |

### Tilemaps (256x256, seamless) and cards

Generate with SDXL `Seamless Tiling` (circular padding) or the "Tile" ControlNet: `top-down floor texture, <STAGE LOOK>, pixel art, dark muted, subtle details, seamless tileable, no characters`. Stages: 01 purple/cyan circuit tombs - 02 rusted foundry plates and lava cracks - 03 glass server floor with falling data - 04 flesh and steel lab grates - 05 starship wreck hull and stars - 06 gothic stained-glass floor - 07 toxic swamp metal grating with acid - 08 frozen server floor, ice cracks - 09 void reactor rings and plasma - 10 golden/crimson imperial throne room tiles.
Rarity card frames (not yet read from disk; draw your own overlay art for Basic `#9E9E9E`, Enhanced `#4CAF50`, Superior `#2196F3`, Epic `#9C27B0`, Legendary `#FFD700` borders): `ornate sci-fi card frame, <colour> glowing metal border, pixel art, transparent centre`.

## B. High-definition audio

* **Model:** Stable Audio Open 1.0 (ComfyUI native `EmptyLatentAudio` + `KSampler` + `VAEDecodeAudio`) or AudioLDM2 (ComfyUI-AudioScheduler / StableAudio nodes). 
* **Export:** `SaveAudio` WAV 48 kHz 24-bit for SFX, or high-bitrate OGG Vorbis (q8) for music loops. Normalise to -3 dBFS, trim silence, keep SFX under ~1.2 s.
* **Looping BGM:** generate 45-60 s, crossfade the tail into the head (Audacity "Crossfade Loops" or a ComfyUI audio crossfade node), export `music_<n>.ogg`.

### SFX prompts (file name -> prompt)

* `slug` - `heavy revolver gunshot, deep punchy sub-bass thump, metallic crack, sci-fi, dry, no reverb`
* `plasma` - `rapid small plasma bolt zap, short, bright`
* `bolt` - `holy electric crackle, golden-cyan hard-light lightning arc, short`
* `zap` - `tesla coil lightning zap, crackling chain discharge`
* `hit`/`crit`/`kill` - `flesh-and-metal impact thud` / `sharp critical hit crunch with bright ring` / `small robotic skeleton collapse`
* `coin`/`scrap` - `crisp metallic coin clink with sparkle` / `small scrap metal clatter pickup`
* `whoosh` - `short magnetic vacuum whoosh pulling toward`
* `boom`/`smallboom`/`slam` - `big sci-fi explosion, deep low end` / `small explosion pop` / `boss ground slam, massive sub-bass impact`
* `levelup`/`pick`/`chest` - `triumphant ascending synth arpeggio` / `confirming UI blip` / `golden treasure chest fanfare with sparkle`
* `warning` - `industrial alarm siren, three sweeps, mid-boss warning`
* `hurt`, `shield`, `shieldbreak`, `dodge`, `laser`, `beam`, `nova`, `spawn`, `boss`, `summon`, `telegraph`, `saw`, `heal`, `victory`, `defeat`, `click`, `move`, `buy`, `deny` - describe in the same style.

### Music (`music_0`..`music_9`, `music_menu`)

Prompt wrapper: `<STAGE MOOD>, synthwave, cyber-gothic industrial, driving 4/4 beat, <BPM> bpm, pulsing bass, arpeggios, dark, loopable, no vocals`

| Key | Stage | Mood / BPM |
|---|---|---|
| `music_0` | Neon Catacombs | eerie crypt synth, minor arps, 120 |
| `music_1` | Rust-Waste Foundry | clanking industrial, heavy distorted bass, 108 |
| `music_2` | Astral Data-Spire | airy glitchy digital choir, fast, 132 |
| `music_3` | Bio-Mech Ossuary | pulsing organic machine horror, 116 |
| `music_4` | Orbital Graveyard | cold space-wreck drones, laser pings, 124 |
| `music_5` | Cyber-Basilica | gothic pipe-organ synth, choir pads, 112 |
| `music_6` | Toxic Synth-Swamp | squelchy acid bass, murky, 118 |
| `music_7` | Cryo-Stasis Vault | icy bells, slow crystalline, 104 |
| `music_8` | Void Reactor Core | frantic reactor overdrive, 136 |
| `music_9` | Omega Citadel | epic imperial orchestral-synth final battle, 140 |
| `music_menu` | Title / menus | moody neon intro, 96 |

Audio is only decoded when served over `http(s)://` (use any static server or GitHub Pages); `file://` falls back to the built-in synth.
