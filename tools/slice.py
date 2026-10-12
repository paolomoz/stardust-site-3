import sys
from PIL import Image
src, prefix = sys.argv[1], sys.argv[2]
step = int(sys.argv[3]) if len(sys.argv) > 3 else 1800
im = Image.open(src); w, h = im.size
for i, y in enumerate(range(0, h, step)):
    c = im.crop((0, y, w, min(y+step, h)))
    c = c.resize((w//2, c.size[1]//2))
    c.save(f"{prefix}-{i:02d}.png")
print(w, h, (h+step-1)//step)
