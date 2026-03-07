#!/usr/bin/env python3
"""
Crop assets/exercises-collage.png into 9 equal cells (3×3 grid).

Run from the FitZee project root:
    python3 assets/crop_collage.py

The collage layout:
    [Wall Push-Up]  [Hip Flexor]   [Downward Dog]
    [Walk]          [Cat-Cow]      [Mountain Climbers]
    [World's Best]  [Butterfly]    [Pigeon Pose]

Only the 3 cells without a free-exercise-db match are saved and used
by IMAGE_MAP:  ex-downward-dog.png, ex-butterfly.png, ex-pigeon.png
(All 9 are saved anyway for reference.)
"""

from PIL import Image
import os

COLLAGE = os.path.join(os.path.dirname(__file__), "exercises-collage.png")
OUT_DIR = os.path.dirname(__file__)

CELLS = [
    ("ex-wall-pushup.png",      0, 0),
    ("ex-hip-flexor.png",       0, 1),
    ("ex-downward-dog.png",     0, 2),
    ("ex-walk.png",             1, 0),
    ("ex-cat-cow.png",          1, 1),
    ("ex-mountain-climbers.png",1, 2),
    ("ex-worlds-greatest.png",  2, 0),
    ("ex-butterfly.png",        2, 1),
    ("ex-pigeon.png",           2, 2),
]

img = Image.open(COLLAGE)
w, h = img.size
cw, ch = w // 3, h // 3

for name, row, col in CELLS:
    left   = col * cw
    top    = row * ch
    right  = left + cw
    bottom = top  + ch
    cell = img.crop((left, top, right, bottom))
    out = os.path.join(OUT_DIR, name)
    cell.save(out)
    print("saved", out)

print("Done.")
