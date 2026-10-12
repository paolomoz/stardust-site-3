import sys
from PIL import Image, ImageChops
a, b, out = sys.argv[1], sys.argv[2], sys.argv[3]
A = Image.open(a).convert('RGB'); B = Image.open(b).convert('RGB')
h = min(A.height, B.height); w = min(A.width, B.width)
A1, B1 = A.crop((0, 0, w, h)), B.crop((0, 0, w, h))
d = ImageChops.difference(A1, B1).convert('L')
mask = d.point(lambda v: 255 if v > 24 else 0)
n = sum(1 for v in mask.getdata() if v)
pct = 100 * n / (w * h)
print(f'size A {A.size} B {B.size} | diff pixels {n} / {w*h} = {pct:.3f}%  (height delta {B.height - A.height}px)')
# band report: which 200px bands carry the diff
bands = []
for y in range(0, h, 200):
    c = mask.crop((0, y, w, min(y + 200, h)))
    k = sum(1 for v in c.getdata() if v)
    if k > 500: bands.append((y, k))
print('hot bands (y, px):', bands[:20])
vis = Image.blend(A1, Image.new('RGB', A1.size, (255, 0, 0)), 0.0)
red = Image.new('RGB', A1.size, (255, 40, 40)); vis.paste(red, (0, 0), mask)
vis.save(out)
