
import math, os, glob, struct
from PIL import Image

bbox = {"west": -123.05, "east": -121.75, "south": 36.95, "north": 38.35}
mid_lat = (bbox["north"] + bbox["south"]) / 2
widthM = int(round((bbox["east"] - bbox["west"]) * 111139 * math.cos(math.radians(mid_lat))))
heightM = int(round((bbox["north"] - bbox["south"]) * 111139))

grid_w = 750
grid_h = 1020

tiles_x = list(range(161, 166))
tiles_y = list(range(393, 399))

mosaic_w = len(tiles_x) * 256
mosaic_h = len(tiles_y) * 256
mosaic = Image.new("RGB", (mosaic_w, mosaic_h))

for ix, tx in enumerate(tiles_x):
    for iy, ty in enumerate(tiles_y):
        path = f"work/tiles/{tx}_{ty}.png"
        tile = Image.open(path)
        mosaic.paste(tile, (ix * 256, iy * 256))

print("Mosaic created:", mosaic.size)

z = 10
n = 2.0 ** z

pix = mosaic.load()

scale = 4
heights = []
min_ele = 999999
max_ele = -999999

for row in range(grid_h):
    frac_y = row / (grid_h - 1)
    lat = bbox["north"] - frac_y * (bbox["north"] - bbox["south"])
    
    lat_rad = math.radians(lat)
    y_tile_frac = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    mosaic_y = int(round((y_tile_frac - tiles_y[0]) * 256))
    mosaic_y = max(0, min(mosaic_h - 1, mosaic_y))
    
    for col in range(grid_w):
        frac_x = col / (grid_w - 1)
        lon = bbox["west"] + frac_x * (bbox["east"] - bbox["west"])
        
        x_tile_frac = (lon + 180.0) / 360.0 * n
        mosaic_x = int(round((x_tile_frac - tiles_x[0]) * 256))
        mosaic_x = max(0, min(mosaic_w - 1, mosaic_x))
        
        r, g, b = pix[mosaic_x, mosaic_y]
        ele = (r * 256.0 + g + b / 256.0) - 32768.0
        if ele < 0:
            ele = 0.0
        val = int(round(ele * scale))
        val = max(0, min(65535, val))
        heights.append(val)
        if ele < min_ele: min_ele = ele
        if ele > max_ele: max_ele = ele

print(f"Grid sampled: {len(heights)} points. Elevation range: {min_ele:.1f}m to {max_ele:.1f}m ({min_ele*3.28084:.0f}ft to {max_ele*3.28084:.0f}ft)")

with open("work/terrain.bin", "wb") as f:
    f.write(struct.pack(f"<{len(heights)}H", *heights))

print(f"Saved work/terrain.bin, size: {os.path.getsize('work/terrain.bin')} bytes")

