"""Кухня-гостиная (помещение 3, 24,15 м²).

Размеры сняты с векторного PDF «Часть 1», лист 11 «План расстановки мебели» (масштаб 1:50),
развёртка — лист 27, вид — визуализации «Часть 2», листы 5–15.
Координаты плана: x=0 — чистовая грань левой стены (стена ТВ), y=0 — грань оконной стены.
"""
import kmf_lib as L
from kmf_lib import box, fronts_row, TALL_TOP

BASE_MODULES = [(822, 1422), (1422, 2022), (2022, 2622), (2622, 3222)]


def build_kitchen_item(m, item):
    """item--kitchen-01: гарнитур вдоль правой стены + пеналы с холодильником у перегородки."""
    white, gap, wood, g = m['kmf-white'], m['kmf-gap'], m['kmf-walnut'], m['graphite']
    # белый пенал с духовкой и СВЧ у окна
    box('oven-body', 5477, 6057, 222, 822, 100, TALL_TOP, gap, item)
    fronts_row('oven-front', [(222, 822)], 5477, [(100, 760), (1740, TALL_TOP)], white, item)
    box('oven', 5457, 5477, 225, 819, 762, 1358, m['appliance'], item)
    box('microwave', 5457, 5477, 225, 819, 1362, 1738, m['appliance'], item)
    # нижние модули 4×600, столешница, профиль Gola
    box('base-body', 5477, 6057, 822, 3222, 100, 860, gap, item)
    fronts_row('base-front', BASE_MODULES, 5477, [(100, 470), (470, 832)], white, item)
    box('gola', 5470, 5477, 822, 3222, 834, 858, g, item)
    box('countertop', 5437, 6057, 822, 3222, 860, 900, m['kmf-top'], item)
    box('hob', 5517, 6007, 862, 1382, 900, 905, m['appliance'], item)
    box('sink', 5537, 5977, 2112, 2532, 896, 901, g, item)
    box('faucet', 5985, 6015, 2307, 2337, 900, 1220, g, item)
    box('faucet-spout', 5860, 6015, 2307, 2337, 1190, 1220, g, item)
    # верхние шкафы в два яруса, глубина 350
    box('upper-body', 5727, 6057, 822, 3222, 1500, TALL_TOP, gap, item)
    fronts_row('upper-front', BASE_MODULES, 5727, [(1500, 2250), (2250, TALL_TOP)], white, item)
    # шпонированные пеналы: модуль у угла + ряд с холодильником вдоль перегородки
    box('tall-body', 5477, 6057, 3222, 3822, 100, TALL_TOP, wood, item)
    fronts_row('tall-front', [(3222, 3822)], 5477, [(100, 880), (880, TALL_TOP)], wood, item)
    box('fridge-body', 4435, 6057, 3842, 4422, 100, TALL_TOP, wood, item)
    fronts_row('fridge-front', [(4435, 5125), (5125, 5457)], 3842, [(100, 880), (880, TALL_TOP)],
               wood, item, axis='y')
    box('corner-front', 5457, 6057, 3822, 3842, 100, TALL_TOP, wood, item)
    box('plinth', 5507, 6057, 222, 3822, 0, 100, g, item)
    box('plinth-2', 4435, 6057, 3872, 4422, 0, 100, g, item)


def build_tv_item(m, item):
    """item--tv-stand-01: подвесная тумба 3500 с биокамином + две витрины со стеклом."""
    white, gap, wood, glass = m['kmf-white'], m['kmf-gap'], m['kmf-walnut'], m['kmf-glass']
    box('tv-body', 20, 300, 220, 3720, 150, 430, gap, item)
    box('tv-top', 20, 320, 220, 3720, 430, 450, white, item)
    fronts_row('tv-front', [(220, 1095), (1095, 1970), (1970, 2845), (2845, 3720)], 320,
               [(150, 432)], white, item)
    box('fireplace', 100, 240, 1370, 2170, 450, 456, m['appliance'], item)
    for i, (y0, y1) in enumerate(((3020, 3320), (3420, 3720))):
        p = f'case{i}'
        box(f'{p}-back', 20, 40, y0, y1, 450, TALL_TOP, wood, item)
        box(f'{p}-side0', 20, 320, y0, y0 + 20, 450, TALL_TOP, wood, item)
        box(f'{p}-side1', 20, 320, y1 - 20, y1, 450, TALL_TOP, wood, item)
        box(f'{p}-top', 20, 320, y0, y1, TALL_TOP - 20, TALL_TOP, wood, item)
        box(f'{p}-bottom', 20, 320, y0, y1, 450, 470, wood, item)
        box(f'{p}-glass', 306, 312, y0 + 20, y1 - 20, 470, TALL_TOP - 20, glass, item)
        for k, z in enumerate((900, 1350, 1800, 2250)):
            box(f'{p}-shelf{k}', 40, 300, y0 + 20, y1 - 20, z, z + 8, glass, item)


def build_decor(m, zone):
    soft = m['soft']
    sofa = [
        L.soft_block('sofa-back', 2627, 2877, 201, 2801, 0, 760, soft, zone),
        L.soft_block('sofa-seat', 1877, 2627, 201, 2501, 0, 430, soft, zone),
        L.soft_block('sofa-arm', 1877, 2627, 2501, 2801, 0, 600, soft, zone),
        L.soft_block('sofa-chaise', 1177, 1877, 201, 1101, 0, 430, soft, zone),
        L.soft_block('sofa-pillow0', 2480, 2600, 500, 1000, 430, 800, m['soft-light'], zone, r=40),
        L.soft_block('sofa-pillow1', 2480, 2600, 1900, 2400, 430, 800, m['soft-light'], zone, r=40),
    ]
    L.join_objects(sofa, 'sofa', zone)
    L.cylinder('coffee-table', 1299, 1851, 350, 0, 400, m['neutral'], zone, segments=48)
    box('rug', 450, 2150, 650, 3050, 0, 8, m['soft-light'], zone)

    table = [box('table-top', 3477, 4277, 850, 2150, 720, 750, m['neutral'], zone)]
    for i, (lx, ly) in enumerate(((3537, 910), (4217, 910), (3537, 2090), (4217, 2090))):
        table.append(box(f'table-leg{i}', lx - 20, lx + 20, ly - 20, ly + 20, 0, 720, m['graphite'], zone))
    L.join_objects(table, 'dining-table', zone)

    chairs = []
    for i, (cx, cy, f) in enumerate(((3477, 1250, 'E'), (3477, 1750, 'E'), (4277, 1250, 'W'),
                                     (4277, 1750, 'W'), (3877, 850, 'S'), (3877, 2100, 'N'))):
        chairs += L.dining_chair(f'chair{i}', cx, cy, f, m, zone)
    L.join_objects(chairs, 'chairs', zone)

    L.plant('plant', 3070, 330, m, zone)
    box('backsplash', 6047, 6057, 822, 3222, 900, 1500, m['hex'], zone)
    box('tv', 150, 185, 914, 2364, 900, 1720, m['appliance'], zone)


def build(m, zone):
    kitchen = L.empty('item--kitchen-01', zone, 'Кухонный гарнитур с пеналами')
    build_kitchen_item(m, kitchen)
    L.join_children(kitchen, 'kitchen-01')
    tv = L.empty('item--tv-stand-01', zone, 'Тумба под ТВ со стеллажами')
    build_tv_item(m, tv)
    L.join_children(tv, 'tv-stand-01')
    panel = L.empty('item--wall-panel-01', zone, 'Стеновая панель под шпон')
    box('wall-panel', 2745, 4435, 3816, 3836, 0, TALL_TOP, m['kmf-walnut'], panel)
    L.join_children(panel, 'wall-panel-01')
    build_decor(m, zone)
