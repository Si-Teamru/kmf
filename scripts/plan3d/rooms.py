"""Остальные комнаты: прихожая, постирочная, детская, спальня, гардеробная, санузлы, лоджия.

Размеры — лист 11 «План расстановки мебели» (те же координаты, что у кухни), цвета мебели KMF —
визуализации «Часть 2». Ключи тестовые (согласованы с пользователем как пример).
"""
import kmf_lib as L
from kmf_lib import TALL_TOP, box, fronts_row, split


def item(zone, key, title):
    return L.empty(f'item--{key}', zone, title)


def done(it, key):
    L.join_children(it, key)


# ---------- прихожая ----------

def hallway(m, zone):
    white, gap, tc = m['kmf-white'], m['kmf-gap'], m['kmf-terracotta']
    it = item(zone, 'wardrobe-01', 'Шкаф с местом для сидения')
    box('body', 2265, 2765, 5101, 6172, 100, TALL_TOP, gap, it)
    fronts_row('front', split(5101, 6172, 2), 2785, [(100, TALL_TOP)], white, it)
    box('plinth', 2265, 2735, 5101, 6172, 0, 100, m['graphite'], it)
    box('seat-base', 2265, 2785, 6172, 6871, 100, 420, white, it)
    box('seat', 2265, 2785, 6182, 6861, 420, 520, tc, it)
    box('seat-back', 2265, 2310, 6182, 6861, 520, 1550, tc, it)
    box('seat-top', 2265, 2785, 6172, 6871, 2440, TALL_TOP, white, it)
    box('seat-side', 2265, 2785, 6851, 6871, 100, TALL_TOP, white, it)
    done(it, 'wardrobe-01')

    it = item(zone, 'console-01', 'Подвесная консоль')
    box('console', 2845, 3645, 3938, 4238, 700, 880, white, it)
    done(it, 'console-01')

    it = item(zone, 'wall-panel-02', 'Стеновая панель за зеркалом')
    box('panel', 3315, 4315, 3918, 3938, 0, TALL_TOP, m['kmf-walnut'], it)
    done(it, 'wall-panel-02')
    box('mirror', 3415, 4215, 3938, 3958, 0, 2280, m['glass'], zone)


# ---------- постирочная ----------

def laundry(m, zone):
    wood, gap = m['kmf-walnut'], m['kmf-gap']
    it = item(zone, 'sink-cabinet-01', 'Тумба под хозяйственную раковину')
    box('body', 4435, 5430, 4643, 5073, 300, 850, gap, it)
    fronts_row('front', split(4435, 5430, 2), 5093, [(300, 850)], wood, it, axis='y')
    done(it, 'sink-cabinet-01')
    box('laundry-sink', 4475, 5390, 4650, 5090, 850, 1000, m['soft-light'], zone)

    it = item(zone, 'utility-cabinet-01', 'Хозяйственный шкаф')
    box('body', 5450, 6036, 4927, 6877, 0, TALL_TOP, gap, it)
    fronts_row('front-a', [(4927, 5502)], 5450, [(100, TALL_TOP)], wood, it)
    fronts_row('front-b', [(5502, 6077)], 5450, [(1750, TALL_TOP)], wood, it)
    fronts_row('front-c', [(6077, 6877)], 5450, [(100, TALL_TOP)], wood, it)
    box('niche-bottom', 5430, 6036, 5502, 6077, 0, 100, wood, it)
    done(it, 'utility-cabinet-01')
    box('washer', 5470, 6000, 5530, 6050, 100, 920, m['soft-light'], zone)
    box('dryer', 5470, 6000, 5530, 6050, 930, 1740, m['soft-light'], zone)


# ---------- детская ----------

def kids(m, zone):
    oak, ochre, white, gap = m['kmf-oak'], m['kmf-ochre'], m['kmf-white'], m['kmf-gap']
    it = item(zone, 'window-seat-01', 'Тумба у окна с подсветкой полок')
    box('body', -3076, -920, 20, 520, 0, 450, oak, it)
    for i, (a, b) in enumerate(split(-3000, -1000, 4)):
        box(f'niche{i}', a + 40, b - 40, 500, 522, 60, 390, gap, it)
    done(it, 'window-seat-01')
    L.soft_block('seat-cushion', -3040, -960, 40, 500, 450, 540, m['soft-light'], zone, r=30)

    it = item(zone, 'desk-01', 'Рабочий стол с пегбордом')
    box('top', -920, -220, 520, 1520, 730, 760, oak, it)
    box('side0', -920, -240, 520, 540, 0, 730, oak, it)
    box('side1', -920, -240, 1500, 1520, 0, 730, oak, it)
    box('pegboard', -240, -220, 560, 1480, 900, 1800, white, it)
    box('shelf', -380, -240, 600, 1400, 1450, 1470, oak, it)
    done(it, 'desk-01')
    L.join_objects(L.dining_chair('kids-chair', -1150, 1020, 'E', m, zone, s=180), 'kids-chair', zone)

    it = item(zone, 'wardrobe-02', 'Шкаф со стеллажами')
    box('body', -751, -220, 1890, 3448, 0, TALL_TOP, gap, it)
    fronts_row('front', split(1890, 3448, 3), -751, [(100, TALL_TOP)], ochre, it)
    for i, (a, b) in enumerate(((1520, 1890), (3448, 3818))):
        box(f'rack{i}-back', -240, -220, a, b, 0, TALL_TOP, oak, it)
        box(f'rack{i}-s0', -771, -220, a, a + 20, 0, TALL_TOP, oak, it)
        box(f'rack{i}-s1', -771, -220, b - 20, b, 0, TALL_TOP, oak, it)
        for k, z in enumerate(range(0, 2700, 440)):
            box(f'rack{i}-sh{k}', -771, -240, a + 20, b - 20, z, z + 20, oak, it)
    done(it, 'wardrobe-02')

    it = item(zone, 'wall-panel-03', 'Панели за кроватью с подсветкой')
    box('panel-low', -3076, -3056, 1450, 3880, 0, 900, m['kmf-gap'], it)
    box('panel-high', -3076, -3060, 1900, 3400, 900, 1600, ochre, it)
    done(it, 'wall-panel-03')

    soft, light = m['soft'], m['soft-light']
    bed = [L.soft_block('kbed-base', -3050, -1900, 1560, 3810, 0, 320, soft, zone),
           L.soft_block('kbed-mat', -3000, -1950, 1600, 3770, 320, 480, light, zone, r=40),
           L.soft_block('kbed-back', -3050, -2900, 1560, 3810, 320, 780, soft, zone),
           L.soft_block('kbed-end0', -3050, -1900, 1560, 1700, 320, 700, soft, zone),
           L.soft_block('kbed-end1', -3050, -1900, 3670, 3810, 320, 700, soft, zone)]
    L.join_objects(bed, 'kids-bed', zone)
    L.cylinder('kids-rug', -1550, 2650, 650, 0, 8, light, zone, segments=40)


# ---------- спальня ----------

def bedroom(m, zone):
    wood, white, gap = m['kmf-walnut'], m['kmf-white'], m['kmf-gap']
    it = item(zone, 'tv-stand-02', 'Тумба под ТВ и туалетный столик')
    box('table-top', -3444, -3245, 1589, 2389, 730, 760, white, it)
    box('table-drawer', -3424, -3245, 1589, 2389, 600, 730, white, it)
    box('tv-body', -3424, -3245, 2389, 4058, 250, 520, gap, it)
    fronts_row('tv-front', split(2389, 4058, 3), -3424, [(250, 520)], wood, it)
    done(it, 'tv-stand-02')

    soft, light = m['soft'], m['soft-light']
    bed = [L.soft_block('bed-base', -6122, -3962, 2265, 4325, 0, 330, soft, zone),
           L.soft_block('bed-mat', -6080, -4000, 2300, 4290, 330, 520, light, zone, r=50),
           L.soft_block('bed-head', -6222, -6122, 2265, 4325, 0, 1100, soft, zone),
           L.soft_block('bed-pillow0', -6060, -5700, 2400, 3220, 520, 650, light, zone, r=40),
           L.soft_block('bed-pillow1', -6060, -5700, 3370, 4190, 520, 650, light, zone, r=40),
           L.soft_block('bed-throw', -4700, -3990, 2280, 4310, 520, 545, soft, zone, r=10)]
    L.join_objects(bed, 'bed', zone)
    stands = [box('stand0', -6222, -5872, 1815, 2265, 0, 520, m['graphite'], zone),
              box('stand1', -6222, -5872, 4325, 4775, 0, 520, m['graphite'], zone)]
    L.join_objects(stands, 'nightstands', zone)
    L.cylinder('pouf', -3560, 1756, 200, 0, 420, soft, zone)
    box('bed-rug', -5300, -3550, 1950, 4650, 0, 8, light, zone)
    box('bedroom-tv', -3275, -3245, 2600, 3850, 950, 1650, m['appliance'], zone)
    L.plant('bedroom-plant', -3700, 4750, m, zone)


# ---------- гардеробная ----------

def wardrobe(m, zone):
    wood, g = m['kmf-walnut'], m['graphite']
    it = item(zone, 'wardrobe-system-01', 'Гардеробная система')
    # вдоль западной стены — открытые полки и штанга
    box('w-back', -6222, -6202, 5111, 6371, 0, TALL_TOP, wood, it)
    for k, y in enumerate((5111, 5741, 6351)):
        box(f'w-side{k}', -6222, -5722, y, y + 20, 0, TALL_TOP, wood, it)
    for k, z in enumerate((400, 1900, 2300)):
        box(f'w-shelf{k}', -6202, -5722, 5131, 6351, z, z + 25, wood, it)
    box('w-rail', -5990, -5970, 5131, 6351, 1780, 1800, g, it)
    # вдоль южной стены — тумба с ящиками, над ней штанга и полки
    box('s-body', -5722, -3196, 6391, 6871, 100, 800, m['kmf-gap'], it)
    fronts_row('s-front', split(-5722, -3196, 3), 6391, [(100, 450), (450, 800)], wood, it, axis='y')
    box('s-top', -5722, -3196, 6371, 6871, 800, 825, wood, it)
    box('s-back', -5722, -3196, 6851, 6871, 825, TALL_TOP, wood, it)
    box('s-side', -3216, -3196, 6371, 6871, 0, TALL_TOP, wood, it)
    for k, z in enumerate((2000, 2350)):
        box(f's-shelf{k}', -5722, -3216, 6491, 6851, z, z + 25, wood, it)
    box('s-rail', -5722, -3216, 6640, 6660, 1780, 1800, g, it)
    done(it, 'wardrobe-system-01')


# ---------- мастер-санузел ----------

def bathroom(m, zone):
    wood, gap = m['kmf-walnut'], m['kmf-gap']
    it = item(zone, 'vanity-01', 'Тумба под раковину')
    box('body', -3061, -1945, 6376, 6856, 300, 830, gap, it)
    fronts_row('front', split(-3061, -1945, 2), 6376, [(300, 565), (565, 830)], wood, it, axis='y')
    box('top', -3061, -1945, 6356, 6856, 830, 850, m['kmf-top'], it)
    done(it, 'vanity-01')
    L.cylinder('basin', -2503, 6606, 210, 850, 970, m['neutral'], zone)

    it = item(zone, 'bath-cabinet-01', 'Шкаф над инсталляцией')
    box('body', -1910, -1210, 6611, 6891, 1200, TALL_TOP, gap, it)
    fronts_row('front', split(-1910, -1210, 2), 6611, [(1200, TALL_TOP)], wood, it, axis='y')
    done(it, 'bath-cabinet-01')
    box('install-box', -1910, -1210, 6691, 6891, 0, 1200, m['wall'], zone)
    L.soft_block('toilet', -1753, -1403, 6168, 6656, 300, 420, m['soft-light'], zone, r=60)
    box('shower-tray', -1210, -445, 5081, 6656, 0, 120, m['tile'], zone)
    box('shower-glass', -1220, -1210, 5081, 6000, 120, 2000, m['glass'], zone)


# ---------- гостевой санузел ----------

def bathroom2(m, zone):
    wood, gap = m['kmf-walnut'], m['kmf-gap']
    it = item(zone, 'vanity-02', 'Тумба под умывальник')
    box('body', 35, 1430, 6436, 6856, 300, 830, gap, it)
    fronts_row('front', split(35, 1430, 2), 6436, [(300, 830)], wood, it, axis='y')
    box('top', 35, 1430, 6416, 6856, 830, 850, m['kmf-top'], it)
    done(it, 'vanity-02')
    L.cylinder('basin-2', 730, 6640, 200, 850, 960, m['neutral'], zone)

    it = item(zone, 'bath-cabinet-02', 'Шкаф над инсталляцией со стеллажами')
    box('rack0', -311, -45, 5116, 5466, 0, TALL_TOP, wood, it)
    box('rack1', -311, -45, 6066, 6416, 0, TALL_TOP, wood, it)
    box('over-install', -311, -45, 5466, 6066, 1200, TALL_TOP, wood, it)
    done(it, 'bath-cabinet-02')
    box('install-box-2', -311, -45, 5466, 6066, 0, 1200, m['wall'], zone)
    L.soft_block('toilet-2', -45, 443, 5591, 5941, 300, 420, m['soft-light'], zone, r=60)
    tub = [L.soft_block('tub', 1430, 2130, 5116, 6746, 0, 560, m['soft-light'], zone, r=30),
           box('tub-inner', 1510, 2050, 5200, 6660, 0, 565, m['neutral'], zone)]
    L.join_objects(tub, 'bathtub', zone)
    box('bath-glass', 1430, 2130, 5900, 5910, 560, 2000, m['glass'], zone)


# ---------- лоджия ----------

def balcony(m, zone):
    wood = m['kmf-walnut']
    it = item(zone, 'desk-02', 'Рабочий стол')
    box('top', -6274, -5674, -87, 1039, 730, 760, wood, it)
    box('side0', -6274, -5694, -87, -67, 0, 730, wood, it)
    box('side1', -6274, -5694, 1019, 1039, 0, 730, wood, it)
    box('drawer', -6274, -5694, 600, 1019, 560, 730, wood, it)
    done(it, 'desk-02')
    L.join_objects(L.dining_chair('work-chair', -5684, 461, 'W', m, zone), 'work-chair', zone)
    light = m['soft-light']
    arm = [L.soft_block('arm-seat', -4379, -3574, 439, 939, 0, 420, light, zone),
           L.soft_block('arm-back', -3754, -3574, 439, 939, 420, 780, light, zone),
           L.soft_block('arm-l', -4379, -3574, 439, 539, 420, 620, light, zone),
           L.soft_block('arm-r', -4379, -3574, 839, 939, 420, 620, light, zone)]
    L.join_objects(arm, 'armchair', zone)
    L.cylinder('side-table', -4429, 167, 230, 0, 550, m['graphite'], zone)
    L.plant('balcony-plant', -3720, 120, m, zone, h=900)


ZONES = {
    # ключ зоны: (подпись, функция комнаты)
    'hallway': ('Прихожая', hallway),
    'laundry': ('Постирочная', laundry),
    'kids': ('Детская', kids),
    'bedroom': ('Спальня', bedroom),
    'wardrobe': ('Гардеробная', wardrobe),
    'bathroom': ('Мастер-санузел', bathroom),
    'bathroom-2': ('Гостевой санузел', bathroom2),
    'balcony': ('Лоджия', balcony),
}
