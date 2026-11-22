# CYBER SLAYER SURVIVOR

A free pixel-art **bullet-heaven + minion-summoner roguelite** with a Mega Man-style stage select. Plain HTML5 Canvas + JavaScript, zero dependencies, no build step.

**Play:** https://nbwillcox.github.io/CyberSlayerSurvivor/ (or open `index.html` through any static server, e.g. `python -m http.server`).

## Features

* **3 classes** - Gunner (heavy ballistics + trooper squad), Engineer (assault drone + swarm drones), Holy Priest (Holy Cyber Bolt + hard-light seraphs). Each fires its primary at the nearest enemy once per second and has its own minion roster and a 4-upgrade Armory tree.
* **19 upgradeable systems, all Lv 1-10** - 3 primary weapons, 6 spells/heavy weapons, 5 minion squads (incl. Minion Fusion), 5 defense systems. Lv 5 = awakening mutation, Lv 10 = apex transformation.
* **5 rarity tiers** (Basic 1.0x, Enhanced 1.35x, Superior 1.75x, Epic 2.25x, Legendary 3.0x + a bonus modifier). Mid-boss chests guarantee Blue/Purple/Gold.
* **Heavy & fast:** instant XP (no gems), magnetic loot vacuum, hit-flash, hit-stop, trauma screen shake, knockback, pooled entities and a spatial hash for 500+ enemies at 60 FPS.
* **6 enemy types, 4 mid-bosses (every 90 s), 10 sector bosses**, 10 stages with distinct palettes and hazards (slag, conveyors, storms, laser grids, acid, ice, plasma rings).
* **Mega Man-style progression:** clear Sector 01 to open the 3x3 Neural Grid. Every first clear grants a Decryption Key - spend keys to unlock stages 2-9 in any order. Sector 10 (Omega Citadel) opens after 1-9.
* **The Armory Sanctum:** shared + class-exclusive permanent upgrades, Rank 1-10.
* **Standard (8-10 min) or Blitz (5 min)** runs, ending in a sector boss.
* Keyboard, mouse, **gamepad** and **touch** (floating stick) controls. Integer pixel scaling, crisp `image-rendering: pixelated`.

## Controls

Move: `WASD` / arrows / pad left stick / touch drag. Menus: arrows + `Enter`, mouse or touch. Draft: `1 2 3`, `R` reroll. Pause + full stats breakdown: `Esc` / `P` / `Tab` / pad Start.

## Art & audio

The game generates all sprites and sound procedurally. To use your own ComfyUI art/audio see **[COMFYUI_GUIDE.md](COMFYUI_GUIDE.md)** (workflow, exact prompts, file naming). Drop files in `assets/sprites` / `assets/audio` and run `node tools/gen-manifest.js`.

## Project layout

```
index.html  css/style.css
js/config.js     balance tables: classes, rarity, enemies, 10 stages, 19 items, Armory
js/util.js       pools, spatial hash       js/save.js   localStorage progress
js/input.js      kb/mouse/touch/gamepad    js/audio.js  Web Audio synth + BGM + sample override
js/art.js        procedural sprites, bitmap font, tiles, PNG override loader
js/fx.js         particles, damage numbers, XP arcs, shake, hit-stop
js/game.js       combat world, damage model, loot, hazards, spawn director, render
js/weapons.js    items / rarity / Lv1-10 behaviours   js/minions.js  minion AI + fusion
js/enemies.js    enemy AI + boss pattern engine       js/ui.js, screens.js  HUD & menus
js/main.js       fixed-timestep loop + state machine
assets/manifest.json  tools/gen-manifest.js
```

Debug URL flags: `?go=1&stage=3&cls=priest&time=60&god=1&boost=10&gold=5000` (start straight in a run, shorten the stage, invulnerable, all items at the given level).

## License

**Free for non-commercial use** under [CC BY-NC 4.0](LICENSE). Any use, fork or redistribution must **link back to https://nictools.dev or https://github.com/nbwillcox/CyberSlayerSurvivor**. Commercial use is not permitted.
