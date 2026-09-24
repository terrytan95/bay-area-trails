
from PIL import Image, ImageDraw, ImageFilter
import json, math

bbox = {"west": -123.05, "east": -121.75, "south": 36.95, "north": 38.35}
mid_lat = (bbox["north"] + bbox["south"]) / 2
widthM = int(round((bbox["east"] - bbox["west"]) * 111139 * math.cos(math.radians(mid_lat))))
heightM = int(round((bbox["north"] - bbox["south"]) * 111139))

mask = Image.open('work/bay_water_mask_perfect.png')
w, h = mask.size
pix = mask.load()

trails = json.load(open('work/dist/data/trails.json'))
print(f"Initial trails: {len(trails)}")

# 1. Filter out erroneous lines that cut into deep open ocean or open bay
# Exception: The Golden Gate Bridge (which is iconic and connects SF to Marin)
clean_trails = []
removed_lines = 0

for t in trails:
    new_lines = []
    is_ggb = "Golden Gate Bridge" in t.get("name", "")
    for l in t["lines"]:
        n_pts = len(l) // 3
        if n_pts < 2: continue
        
        # Check how many points are in water and deep water
        water_pts = 0
        deep_water_pts = 0
        total_len = 0
        for i in range(0, len(l)-3, 3):
            dx = l[i+3] - l[i]
            dy = l[i+4] - l[i+1]
            total_len += math.hypot(dx, dy)
            gx = int(round((l[i] / widthM) * (w - 1)))
            gy = int(round((1.0 - l[i+1] / heightM) * (h - 1)))
            if 0 <= gx < w and 0 <= gy < h:
                if pix[gx, gy] == 0:
                    water_pts += 1
                    # In Pacific ocean (gx < 140 or Bolinas lagoon loop)
                    if gx < 140 or (36.95 + (l[i+1]/heightM)*1.40 < 37.93 and -123.05 + (l[i]/widthM)*1.30 < -122.64):
                        deep_water_pts += 1
        
        water_ratio = water_pts / n_pts
        # Remove long open water lines (>1.2km) in deep water, unless it is Golden Gate Bridge
        if not is_ggb and (deep_water_pts / n_pts > 0.6 or (water_ratio > 0.9 and total_len > 1500)):
            removed_lines += 1
            continue
        new_lines.append(l)
    
    if len(new_lines) > 0:
        t["lines"] = new_lines
        clean_trails.append(t)

print(f"Removed {removed_lines} spurious open-water lines. Clean trails remaining: {len(clean_trails)}")

# Re-index trails
for idx, t in enumerate(clean_trails):
    t["id"] = idx

json.dump(clean_trails, open('work/dist/data/trails.json', 'w'))

# 2. Carve a 3px land buffer under ALL remaining trails in the water mask
# so that shoreline trails (like SF Bay Trail, Crown Beach, Foster City levee)
# sit on solid land and never get submerged under water!
draw = ImageDraw.Draw(mask)
for t in clean_trails:
    for l in t["lines"]:
        pts = []
        for i in range(0, len(l), 3):
            gx = int(round((l[i] / widthM) * (w - 1)))
            gy = int(round((1.0 - l[i+1] / heightM) * (h - 1)))
            pts.append((gx, gy))
        if len(pts) >= 2:
            draw.line(pts, fill=255, width=4)

# Save new clean water mask
mask.save('work/bay_water_mask_final_clean.png')

# Generate mask.png (RGBA for WebGL shader)
tw = w * 2
th = h * 2
im_res = mask.resize((tw, th), Image.Resampling.BILINEAR)
water_r = Image.eval(im_res, lambda x: 255 if x < 128 else 0)
blur1 = water_r.filter(ImageFilter.GaussianBlur(12))
blur2 = water_r.filter(ImageFilter.GaussianBlur(30))
water_g = Image.blend(blur1, blur2, 0.5)
b_img = Image.new('L', (tw, th), 255)
rgba = Image.merge('RGBA', (water_r, water_g, b_img, Image.new('L', (tw, th), 255)))
rgba.save('work/dist/data/mask.png')
print("Generated and saved work/dist/data/mask.png")

