#!/bin/bash
cd "$(dirname "$0")"
python gen_art.py > ../../assets_art.log 2>&1
python gen_audio.py sfx > ../../assets_sfx.log 2>&1
python gen_audio.py music > ../../assets_music.log 2>&1
