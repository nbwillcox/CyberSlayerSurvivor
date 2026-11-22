"""Z-Image Turbo text-to-image via the LOCAL ComfyUI for Cyber Slayer Survivor sprites, floor tiles and the title backdrop.

  python gen_art.py                 # everything, 2 takes each
  python gen_art.py --only gunner,skeleton --takes 3 --force
Raw PNGs -> assets/raw_art/<key>_<take>.png (gitignored).  Then run make_sprites.py to pixelate + install.
"""
import argparse
import os
import sys
import urllib.parse
import zlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import comfy_client as cc  # noqa: E402

cc.CLIENT = 'cyberslayer-art-' + cc.CLIENT.split('-')[-1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RAW = os.path.join(ROOT, 'assets', 'raw_art')

SPRITE = ("Pixel art game sprite of {s}. 16-bit retro action game style, bold dark outline, strong readable silhouette, limited "
          "colour palette, neon cyberpunk gothic sci-fi fantasy, front three-quarter top-down view, full body centered with "
          "empty space around, isolated on a flat solid pure magenta background (#FF00FF), no ground shadow, no ground line, absolutely no text or letters.")
TILE = ("Seamless top-down game floor texture, {s}, dark muted colours, subtle low-contrast detail, flat even lighting, pixel art "
        "style, no characters, no objects in the middle, tileable pattern.")

S = {  # key -> subject
    'gunner': 'a cyber-mercenary in a tattered tactical trench coat with a glowing cyan visor, chrome cybernetic arm, holding a smoking heavy revolver pistol',
    'engineer': 'a female engineer in a bulky exosuit rig with welding goggles on her forehead, a glowing green plasma backpack and a utility belt with tools',
    'priest': 'a neo-gothic cyber priest in long violet cyber-robes with neon-gold scripture plates, a floating holographic gold halo, holding a bionic staff',
    'skeleton': 'a cybernetic skeleton with a rusted chrome ribcage, glowing red optical eye sockets and a cyan plasma shiv',
    'ghost': 'a translucent holographic cyan skull fused to a hovering quad-rotor drone chassis',
    'hound': 'a four-legged necro-cyborg hound, skeletal frame with hydraulic pistons and glowing red eyes, side view facing right',
    'lich': 'a techno-lich acolyte in tattered dark purple cyber-robes with a skull face and a floating glowing violet dark-matter core in its chest',
    'golem': 'a hulking rusted industrial scrap-mech possessed by a dark spirit with a glowing orange furnace core and red eyes, heavy armor plates',
    'banshee': 'a screaming void-wraith digital apparition, purple glitching static body, open mouth, torn floating pixels',
    'mb_0': 'ARCH-LICH MAINFRAME, a floating server-rack lich in a hood of glowing cables with a skull monitor face and a purple core',
    'mb_1': 'GOLIATH BONE-CRUSHER, a gigantic bone and steel brute mech with huge piston fists and orange glowing joints',
    'mb_2': 'SERAPHIM CORRUPTED AI, a six-winged glitching golden angel machine with a halo ring of broken code',
    'mb_3': 'CYBER-REAPER PRIME, a hooded skeletal reaper with a crimson energy scythe and tattered cyber cloak',
    'boss_0': 'WARDEN NECRO-BOT, a giant prison-warden robot with a skull helmet, purple neon runes and chained shoulder cannons',
    'boss_1': 'a towering walking furnace golem made of molten slag and giant bones, glowing lava veins, chimney horns on its head and dripping lava, full body',
    'boss_2': 'a floating spectral lich with a glowing cyan holographic monitor for a face, translucent ghostly robes and server-rack arms, full body',
    'boss_3': 'ABOMINATION UNIT-09, a fused flesh-and-steel laboratory monstrosity with exposed ribs, mutant claws and a pink glow',
    'boss_4': 'DREADNOUGHT CAPTAIN VANE, an undead starship captain in wrecked cyber armor with a glowing red helm and a laser cutlass',
    'boss_5': 'FALLEN CYBER-ARCHANGEL, a fallen armored angel with a cracked golden halo and black and gold wings of stained-glass hologram',
    'boss_6': 'HYDRA-CORE 7, a multi-headed toxic hydra reactor with green acid glow and cables as necks',
    'boss_7': 'SUB-ZERO LICH, a frost-covered cryo lich with an icy crystal crown and glowing blue eyes',
    'boss_8': 'CHRONO-REAPER, a time-bending reaper with a clock-face chest, a magenta chrono scythe and a broken hourglass',
    'boss_9': 'DEUS EX NECROS, a golden and crimson imperial death-god mech emperor on a throne with a crown of spikes and many glowing eyes',
}
T = {  # floor tiles
    'tile_0': 'purple and cyan neon circuit-board crypt tiles with glowing traces',
    'tile_1': 'rusted foundry metal plates with rivets, hazard stripes and faint lava cracks',
    'tile_2': 'dark blue glass server floor with faint falling data glyphs',
    'tile_3': 'flesh and steel laboratory grates with pink veins',
    'tile_4': 'wrecked starship hull plating with panel seams and a few stars',
    'tile_5': 'gothic cathedral stained-glass floor with gold and violet diamond patterns',
    'tile_6': 'toxic swamp metal grating with green acid puddles and moss',
    'tile_7': 'frozen server vault floor with ice cracks and frost',
    'tile_8': 'void reactor floor with dark crimson plasma rings and cables',
    'tile_9': 'golden and crimson imperial throne room floor tiles with ornate inlay',
}
TITLE = ('Cinematic neon cyberpunk gothic wide illustration, a ruined cyber-cathedral crypt with glowing purple and cyan circuitry, '
         'floating skulls and drone ghosts in the dark distance, a lone silhouetted slayer in the foreground, moody fog, '
         'dramatic backlight, dark vignette, pixel art style, no text.')


ICON = ("Pixel art game item icon of {s}. Single centered emblem filling the frame, bold dark outline, vibrant saturated colours, "
        "16-bit retro style, isolated on a flat solid pure magenta background (#FF00FF), no ground shadow, absolutely no text or letters.")
I = {
    'icon_slug': 'a heavy futuristic revolver pistol with a glowing orange slug round',
    'icon_drone': 'a small hovering assault drone with a plasma gun and green glowing core',
    'icon_bolt': 'a golden holy lightning bolt with cyan sparks',
    'icon_grenade': 'a glowing plasma grenade launcher shell with an orange explosion burst',
    'icon_tesla': 'a tesla coil emitting blue chain lightning',
    'icon_nova': 'an expanding ring of golden holy fire',
    'icon_orbital': 'an orbital satellite firing a bright pink vertical ion beam',
    'icon_nanite': 'a swirling cloud of green nanobots',
    'icon_saw': 'a spinning neon steel circular sawblade with cyan glow',
    'icon_turret': 'an automatic gun turret nest with twin barrels',
    'icon_stim': 'a red injector syringe filled with glowing stim fluid',
    'icon_gunship': 'an attack helicopter gunship firing, seen from the front',
    'icon_dronebay': 'a drone launch bay with three small drones flying out',
    'icon_emp': 'an electromagnetic pulse emitter ring with blue lightning arcs',
    'icon_fabricator': 'a factory robot arm assembling a small kamikaze drone bomb',
    'icon_sanctum': 'a sacred circle on the ground burning with golden holy fire and runes',
    'icon_litany': 'an open holy book emitting violet light and glowing words',
    'icon_wings': 'a pair of glowing white feathered angel wings',
    'icon_vanguard_gunner': 'a cyber-trooper soldier robot holding a rifle',
    'icon_vanguard_engineer': 'a builder drone robot with a welding torch',
    'icon_vanguard_priest': 'a cyber-paladin knight with a glowing laser sword and shield',
    'icon_sniper_gunner': 'a ghostly rail-gun sniper robot with a long rifle',
    'icon_sniper_engineer': 'a tesla drone with a glowing coil on top',
    'icon_sniper_priest': 'a rail-seraph angel construct holding a long glowing rifle',
    'icon_aegis_gunner': 'an aegis shield-bearer robot holding a huge shield',
    'icon_aegis_engineer': 'a shield drone projecting a blue hexagon barrier',
    'icon_aegis_priest': 'a holo-cherub floating angel child with a golden halo',
    'icon_detonator_gunner': 'a round micro-bomber robot ball with a lit fuse',
    'icon_detonator_engineer': 'a kamikaze drone carrying a red bomb',
    'icon_detonator_priest': 'a radiant reliquary, a glowing golden holy relic orb',
    'icon_fusion_gunner': 'a huge elite combat mech suit',
    'icon_fusion_engineer': 'an orbital dreadnought drone, a big armored flying battle drone',
    'icon_fusion_priest': 'an archangel construct made of golden hard light',
    'icon_plating': 'a titanium armor chestplate with glowing seams',
    'icon_regen': 'a green glowing heart woven with nanite threads',
    'icon_deflector': 'a blue energy shield bubble deflecting a hit',
    'icon_thrusters': 'winged boots with purple glowing thrusters',
    'icon_graviton': 'a swirling black hole orb with a golden ring',
}


def graph(prompt, w, h, seed, prefix):
    return {
        '1': {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'z_image_turbo_bf16.safetensors', 'weight_dtype': 'default'}},
        '2': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen_3_4b.safetensors', 'type': 'lumina2', 'device': 'default'}},
        '3': {'class_type': 'VAELoader', 'inputs': {'vae_name': 'ae.safetensors'}},
        '4': {'class_type': 'ModelSamplingAuraFlow', 'inputs': {'model': ['1', 0], 'shift': 3.0}},
        '5': {'class_type': 'CLIPTextEncode', 'inputs': {'text': prompt, 'clip': ['2', 0]}},
        '6': {'class_type': 'ConditioningZeroOut', 'inputs': {'conditioning': ['5', 0]}},
        '7': {'class_type': 'EmptySD3LatentImage', 'inputs': {'width': int(w), 'height': int(h), 'batch_size': 1}},
        '8': {'class_type': 'KSampler', 'inputs': {'model': ['4', 0], 'seed': int(seed), 'steps': 9, 'cfg': 1.0, 'sampler_name': 'res_multistep', 'scheduler': 'simple',
                                                    'positive': ['5', 0], 'negative': ['6', 0], 'latent_image': ['7', 0], 'denoise': 1.0}},
        '9': {'class_type': 'VAEDecode', 'inputs': {'samples': ['8', 0], 'vae': ['3', 0]}},
        '10': {'class_type': 'SaveImage', 'inputs': {'images': ['9', 0], 'filename_prefix': prefix}},
    }


def fetch(hist):
    for _n, o in (hist.get('outputs') or {}).items():
        for im in o.get('images', []) or []:
            q = urllib.parse.urlencode({'filename': im['filename'], 'subfolder': im.get('subfolder', ''), 'type': im.get('type', 'output')})
            return cc._req('/view?' + q, timeout=600)
    raise RuntimeError('no image')


def jobs():
    for k, s in S.items():
        yield k, SPRITE.format(s=s), 1024, 1024
    for k, s in T.items():
        yield k, TILE.format(s=s), 768, 768
    for k, s in I.items():
        yield k, ICON.format(s=s), 640, 640
    yield 'title_bg', TITLE, 1344, 768


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--only', default='all'); ap.add_argument('--takes', type=int, default=2); ap.add_argument('--force', action='store_true')
    a = ap.parse_args(); os.makedirs(RAW, exist_ok=True)
    only = None if a.only == 'all' else set(a.only.split(','))
    for key, prompt, w, h in jobs():
        if only and key not in only:
            continue
        for t in range(1, (1 if key == 'title_bg' else a.takes) + 1):
            out = os.path.join(RAW, '%s_%d.png' % (key, t))
            if os.path.exists(out) and not a.force:
                print('skip', key, t, flush=True); continue
            seed = zlib.crc32(('cs-art-%s-%d' % (key, t)).encode()) & 0x7fffffff
            try:
                hist, dt = cc.run(graph(prompt, w, h, seed, 'cyberslayer/art_%s_%d' % (key, t)), timeout=1800)
                open(out, 'wb').write(fetch(hist)); print('art', key, t, '%.1fs' % dt, flush=True)
            except Exception as e:
                print('FAILED', key, t, repr(e)[:500], flush=True)
