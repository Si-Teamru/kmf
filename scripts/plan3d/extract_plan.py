"""Снять геометрию квартиры с векторного PDF «Часть 1» (масштаб 1:50) → plan.json.

Запуск системным Python (нужны pymupdf, numpy, pillow, scipy):
    python extract_plan.py
Координаты в plan.json — мм плана: x вправо, y вниз; x=0/y=0 — грань стены ТВ / оконной стены кухни.
"""
import json
import os

import fitz
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

PDF = r'D:\Desktop\KMF\ЖК Новое Медведково. Часть 1. Техническая документация.pdf'
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'plan.json')
K = 17.639  # мм в 1 pt при 1:50
X0, Y0 = 464.0, 123.4  # pt → начало координат плана
RES = 0.5  # шаг сетки, pt (~9 мм)
BX0, BY0, BX1, BY1 = 85.0, 100.0, 830.0, 536.0  # рамка квартиры, pt
W, H = int((BX1 - BX0) / RES), int((BY1 - BY0) / RES)

BEARING = (0.31, 0.31, 0.31)
NEW_WALL = (0.51, 0.81, 0.56)
LAMINATE = (0.71, 0.64, 0.36)
TILE = (0.59, 0.79, 1.0)
VINYL = (1.0, 0.4, 0.0)


def key(c):
    return tuple(round(x, 2) for x in c) if c else None


def poly_points(g):
    pts = []
    for it in g['items']:
        if it[0] == 're':
            r = it[1]
            pts += [(r.x0, r.y0), (r.x1, r.y0), (r.x1, r.y1), (r.x0, r.y1)]
        elif it[0] == 'qu':
            q = it[1]
            pts += [(q.ul.x, q.ul.y), (q.ur.x, q.ur.y), (q.lr.x, q.lr.y), (q.ll.x, q.ll.y)]
        else:
            for q in it[1:]:
                if isinstance(q, fitz.Point):
                    pts.append((q.x, q.y))
    return pts


# Листы свёрстаны со сдвигом плана по x относительно листа 11 (стр. 13), к нему всё и приводим.
DX_MONTAGE, DX_FLOORS = 14.17, -5.67


def to_px(pts, dx=0.0):
    return [((x - dx - BX0) / RES, (y - BY0) / RES) for x, y in pts]


def mm(x, y):
    return round((x - X0) * K), round((y - Y0) * K)


def rects_from_mask(mask):
    """Жадное разбиение маски на прямоугольники (строки → слияние одинаковых по вертикали)."""
    rects, open_runs = [], {}
    for j in range(mask.shape[0] + 1):
        runs = set()
        if j < mask.shape[0]:
            row = np.concatenate([[0], mask[j].astype(np.int8), [0]])
            d = np.diff(row)
            runs = set(zip(np.where(d == 1)[0], np.where(d == -1)[0]))
        nxt = {}
        for run in runs:
            nxt[run] = open_runs.pop(run, j)
        for (a, b), j0 in open_runs.items():
            rects.append((a, j0, b, j))
        open_runs = nxt
    out = []
    for a, j0, b, j1 in rects:
        x0, y0 = mm(BX0 + a * RES, BY0 + j0 * RES)
        x1, y1 = mm(BX0 + b * RES, BY0 + j1 * RES)
        out.append([x0, x1, y0, y1])
    return out


doc = fitz.open(PDF)
montage, floors_page, furniture_page = doc[7], doc[24], doc[12]

# ---- стены: несущие + новые перегородки + штриховка существующих перегородок ----
wall = Image.new('L', (W, H), 0)
dw = ImageDraw.Draw(wall)
for g in montage.get_drawings():
    f = key(g.get('fill'))
    if f in (BEARING, NEW_WALL):
        dw.polygon(to_px(poly_points(g), DX_MONTAGE), fill=255)
    elif g['type'] == 's' and key(g.get('color')) == (0.5, 0.5, 0.5) and len(g['items']) == 1 \
            and g['items'][0][0] == 'l':
        r = g['rect']
        if 1.0 < r.width < 6.0 and 1.0 < r.height < 6.0:  # штрих перегородки 45°
            dw.rectangle(to_px([(r.x0, r.y0), (r.x1, r.y1)], DX_MONTAGE), fill=255)
wall_mask = np.array(wall) > 127
wall_mask = ndimage.binary_closing(wall_mask, iterations=1)
wall_mask = ndimage.binary_opening(wall_mask, iterations=1)  # убрать одиночные штрихи
lab, n = ndimage.label(wall_mask)
sizes = ndimage.sum(wall_mask, lab, range(1, n + 1))
wall_mask = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 250])  # обрывки откосов в проёмах
Image.fromarray((wall_mask * 255).astype(np.uint8)).save(os.path.join(os.path.dirname(OUT), 'renders', 'debug-walls.png'))

# ---- полы ----
floors = []
for g in floors_page.get_drawings():
    f = key(g.get('fill'))
    if f in (LAMINATE, TILE, VINYL) and g['rect'].width * g['rect'].height > 500:
        img = Image.new('L', (W, H), 0)
        ImageDraw.Draw(img).polygon(to_px(poly_points(g), DX_FLOORS), fill=255)
        r = g['rect']
        floors.append({'kind': {LAMINATE: 'laminate', TILE: 'tile', VINYL: 'vinyl'}[f],
                       'bbox_mm': [*mm(r.x0 - DX_FLOORS, r.y0), *mm(r.x1 - DX_FLOORS, r.y1)],
                       'mask': np.array(img) > 127})

# ---- мебель (для справки) ----
furniture = []
for g in furniture_page.get_drawings():
    if key(g.get('fill')) == (0.87, 0.85, 0.82):
        r = g['rect']
        if r.width * K > 150 and r.height * K > 150:
            x0, y0 = mm(r.x0, r.y0)
            x1, y1 = mm(r.x1, r.y1)
            furniture.append([x0, x1, y0, y1])
labels = []
for w in furniture_page.get_text('words'):
    if BX0 < w[0] < BX1 and BY0 < w[1] < BY1 and not w[4].replace(' ', '').isdigit():
        labels.append([*mm(w[0], w[1]), w[4]])

# ---- зоны пола: какая комната (зона) и какое покрытие в каждой клетке сетки ----
ZONES = ['', 'kitchen', 'hallway', 'laundry', 'kids', 'bedroom', 'wardrobe', 'bathroom', 'bathroom-2',
         'balcony', 'corridor']
KINDS = ['', 'laminate', 'tile', 'vinyl']
cx_mm = (BX0 + (np.arange(W) + 0.5) * RES - X0) * K
cy_mm = (BY0 + (np.arange(H) + 0.5) * RES - Y0) * K
CX, CY = np.meshgrid(cx_mm, cy_mm)
zone = np.zeros((H, W), np.int8)
kind = np.zeros((H, W), np.int8)
BEDROOM_SPLIT = 5030  # декоративная перегородка спальня / гардеробная
for fl in floors:
    m, (bx0, by0, bx1, by1) = fl['mask'] & ~wall_mask, fl['bbox_mm']
    kind[m] = KINDS.index(fl['kind'])
    cxm, cym = (bx0 + bx1) / 2, (by0 + by1) / 2
    if fl['kind'] == 'vinyl':
        zone[m] = ZONES.index('balcony')
    elif fl['kind'] == 'tile':
        name = ('bathroom' if cxm < -1000 else 'bathroom-2' if cxm < 1500 else 'kitchen' if cym < 3000
                else 'hallway' if cxm < 4200 else 'laundry')
        zone[m] = ZONES.index(name)
    elif bx1 < -3000:  # спальня + гардеробная
        zone[m & (CY < BEDROOM_SPLIT)] = ZONES.index('bedroom')
        zone[m & (CY >= BEDROOM_SPLIT)] = ZONES.index('wardrobe')
    elif bx1 < 0:
        zone[m] = ZONES.index('kids')
    else:  # гостиная + коридор + часть прихожей
        zone[m] = ZONES.index('corridor')
        zone[m & (CY < 3918) & (CX > -100)] = ZONES.index('kitchen')
        zone[m & (CY >= 3918) & (CX > 2245)] = ZONES.index('hallway')
# Пол отделки не доходит до стен (облицовка ГКЛ, место под ванной, короба) — дорастить зоны
# до стен заливкой, которая не проходит сквозь стены (замкнутые шахты остаются пустыми).
def shift(a, dy, dx):
    out = np.zeros_like(a)
    out[max(dy, 0):a.shape[0] + min(dy, 0), max(dx, 0):a.shape[1] + min(dx, 0)] = \
        a[max(-dy, 0):a.shape[0] + min(-dy, 0), max(-dx, 0):a.shape[1] + min(-dx, 0)]
    return out


PX, PY = np.meshgrid(BX0 + (np.arange(W) + 0.5) * RES, BY0 + (np.arange(H) + 0.5) * RES)
inside = (PX > 107.0) & (PX < 808.6) & (PY > 114.4) & (PY < 514.2)  # внутренние грани наружных стен
for _ in range(90):
    grown = False
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        src_z = shift(zone, dy, dx)
        src_k = shift(kind, dy, dx)
        take = (zone == 0) & ~wall_mask & inside & (src_z > 0)
        if take.any():
            zone[take], kind[take], grown = src_z[take], src_k[take], True
    if not grown:
        break
np.save(os.path.join(os.path.dirname(OUT), 'walls.npy'), wall_mask)
np.save(os.path.join(os.path.dirname(OUT), 'zones.npy'), zone)
np.save(os.path.join(os.path.dirname(OUT), 'kinds.npy'), kind)
dbg = np.zeros((H, W, 3), np.uint8)
pal = np.array([[0, 0, 0], [240, 200, 150], [120, 180, 240], [90, 200, 120], [250, 230, 90], [200, 140, 220],
                [160, 100, 200], [80, 200, 220], [60, 140, 200], [240, 120, 60], [150, 150, 150]], np.uint8)
dbg[:] = pal[zone]
dbg[wall_mask] = 255
Image.fromarray(dbg).save(os.path.join(os.path.dirname(OUT), 'renders', 'debug-zones.png'))

data = {
    'grid': {'x0_pt': BX0, 'y0_pt': BY0, 'res_pt': RES, 'mm_per_pt': K, 'origin_pt': [X0, Y0],
             'zones': ZONES, 'kinds': KINDS},
    'walls': rects_from_mask(wall_mask),
    'zone_rects': {ZONES[zi]: {KINDS[ki]: rects_from_mask((zone == zi) & (kind == ki))
                               for ki in range(1, len(KINDS)) if ((zone == zi) & (kind == ki)).any()}
                   for zi in range(1, len(ZONES))},
    'floors': [{'kind': fl['kind'], 'bbox': fl['bbox_mm'], 'rects': rects_from_mask(fl['mask'])} for fl in floors],
    'furniture': furniture,
    'labels': labels,
}
with open(OUT, 'w', encoding='utf-8') as fh:
    json.dump(data, fh, ensure_ascii=False)
print('walls', len(data['walls']), 'floors', [(f['kind'], f['bbox'], len(f['rects'])) for f in data['floors']],
      'furniture', len(furniture))
