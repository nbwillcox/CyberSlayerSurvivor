#!/bin/bash
cd "$(dirname "$0")"
python gen_art.py --only "$(cat ids.txt)" --takes 2 > ../../lv.log 2>&1
python gen_art.py --only gunner,engineer,priest --takes 4 --force > ../../cls.log 2>&1
