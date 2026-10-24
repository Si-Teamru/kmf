"""Библиотека для сборки 3D-планов KMF в Blender.

Координаты плана — миллиметры, как на чертеже (лист 11 «План расстановки мебели»): x вправо, y вниз
(к югу), z вверх от чистого пола. to_world() переводит их в метры Blender (Z вверх, Y на север) со
сдвигом в центр квартиры.
"""
import math
import os

import bmesh
import bpy
import numpy as np

# Центр квартиры в координатах плана (мм) — точка отсчёта GLB по ТЗ.
ORIGIN_X = -109.0
ORIGIN_Y = 3446.0
WALL_CUT = 1300.0  # срез стен, мм
TALL_TOP = 2640.0  # верх высокой мебели KMF (потолок 2740 минус опуск 100)
DOOR_H = 2100.0

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def to_world(x, y, z=0.0):
    return ((x - ORIGIN_X) / 1000.0, (ORIGIN_Y - y) / 1000.0, z / 1000.0)


# ---------- материалы и текстуры ----------

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4))


def hex01(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])


def principled(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def material(name, color, rough=0.75, alpha=1.0, image=None, uv_m=1.0):
    """uv_m — сколько метров покрывает один повтор текстуры."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = principled(mat)
    bsdf.inputs['Base Color'].default_value = (*hex_rgb(color), 1.0)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = 0.0
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.2
    bsdf.inputs['Alpha'].default_value = alpha
    if alpha < 1.0:
        mat.surface_render_method = 'BLENDED'
    if image is not None:
        nodes, links = mat.node_tree.nodes, mat.node_tree.links
        tex = next((n for n in nodes if n.type == 'TEX_IMAGE'), None) or nodes.new('ShaderNodeTexImage')
        tex.image = image
        tex.location = (-400, 300)
        links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
    mat.diffuse_color = (*hex_rgb(color), alpha)
    mat['uv_m'] = uv_m
    return mat


def save_image(name, rgb, path):
    size_y, size_x = rgb.shape[:2]
    rgba = np.concatenate([np.clip(rgb, 0, 1), np.ones((size_y, size_x, 1))], axis=2).astype(np.float32)
    rgba = rgba[::-1]  # Blender хранит строки снизу вверх
    img = bpy.data.images.get(name)
    if img is None or tuple(img.size) != (size_x, size_y):
        if img is not None:
            bpy.data.images.remove(img)
        img = bpy.data.images.new(name, size_x, size_y)
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = path
    img.file_format = 'PNG'
    img.save()
    return img


def grain(size, freq, seed, warp_amp=0.012):
    """Вертикальные волокна шпона без сучков, тайлится. Значения около 0."""
    rng = np.random.default_rng(seed)
    u = np.arange(size) / size
    U, V = np.meshgrid(u, u)
    warp = warp_amp * np.sin(2 * math.pi * (V * 2 + U * 3)) + warp_amp / 2 * np.sin(2 * math.pi * V * 5)
    g = 0.55 * np.sin(2 * math.pi * (U + warp) * freq) + 0.45 * np.sin(2 * math.pi * (U + warp * 1.7) * freq * 2.7)
    cols = rng.normal(0, 1, size)
    cols = np.convolve(np.tile(cols, 3), np.ones(9) / 9, mode='same')[size:2 * size]
    return 0.045 * g + 0.035 * cols[None, :]


def veneer_tex(name, base_hex, size=512, seed=7):
    rgb = hex01(base_hex)[None, None, :] * (1 + grain(size, 23, seed))[..., None]
    return save_image(name, rgb, os.path.join(ROOT, 'textures', name + '.png'))


def parquet_tex(name, base_hex, size=1024, seed=3):
    """Паркетная доска 200 мм, повтор 1,2 м: 6 рядов досок по 1200 со сдвигом стыков."""
    rng = np.random.default_rng(seed)
    base = hex01(base_hex)
    rows = 6
    h = size // rows
    rgb = np.zeros((size, size, 3))
    g = grain(size, 40, seed, 0.004).T  # волокна вдоль доски (по горизонтали)
    for r in range(rows):
        shift = int(rng.integers(0, size))
        tone = 1 + rng.normal(0, 0.025)
        band = np.roll(g[r * h:(r + 1) * h], shift, axis=1)
        rgb[r * h:(r + 1) * h] = base * (tone + band)[..., None]
        rgb[r * h, :] *= 0.9  # продольный шов
        rgb[r * h:(r + 1) * h, shift % size] *= 0.9  # торцевой шов
    return save_image(name, rgb, os.path.join(ROOT, 'textures', name + '.png'))


def tile_tex(name, base_hex, size=512, seed=5):
    """Керамогранит 600×1200 (повтор 1,2 м): лёгкий шум и тонкие швы."""
    rng = np.random.default_rng(seed)
    base = hex01(base_hex)
    noise = rng.normal(0, 0.012, (size, size))
    rgb = base * (1 + noise)[..., None]
    for k in (0, size // 2):
        rgb[k, :] *= 0.9  # шов каждые 600
    rgb[:, 0] *= 0.9  # шов каждые 1200
    return save_image(name, rgb, os.path.join(ROOT, 'textures', name + '.png'))


def hex_tex(name, base_hex, line_hex, size=512, cells=4):
    """Шестигранная мозаика «соты» для кухонного фартука."""
    base, line = hex01(base_hex), hex01(line_hex)
    ys, xs = np.mgrid[0:size, 0:size] / size * cells
    # координаты в решётке шестиугольников (pointy-top)
    r3 = math.sqrt(3)
    q = (r3 / 3 * xs - ys / 3)
    rr = 2 / 3 * ys
    x, z = q, rr
    y = -x - z
    rx, ry, rz = np.round(x), np.round(y), np.round(z)
    dx, dy, dz = np.abs(rx - x), np.abs(ry - y), np.abs(rz - z)
    edge = np.maximum(np.maximum(dx, dy), dz)
    t = np.clip((edge - 0.42) / 0.06, 0, 1)
    rgb = base * (1 - t)[..., None] + line * t[..., None]
    return save_image(name, rgb, os.path.join(ROOT, 'textures', name + '.png'))


def build_materials():
    return {
        # мебель KMF — цвета проекта по визуализациям
        'kmf-white': material('kmf-white', '#e9e4dd', 0.7),
        'kmf-gap': material('kmf-gap', '#bdb5ab', 0.8),
        'kmf-walnut': material('kmf-walnut', '#8a6a50', 0.65, image=veneer_tex('kmf-walnut', '#8a6a50')),
        'kmf-oak': material('kmf-oak', '#cdb89c', 0.7, image=veneer_tex('kmf-oak', '#cdb89c', seed=11)),
        'kmf-ochre': material('kmf-ochre', '#c99a52', 0.75),
        'kmf-terracotta': material('kmf-terracotta', '#93503f', 0.9),
        'kmf-top': material('kmf-top', '#ece9e4', 0.6),
        'kmf-glass': material('kmf-glass', '#6b5646', 0.3, alpha=0.4),
        # окружение — нейтральное (ТЗ, раздел 3)
        'wall': material('wall', '#ffffff', 0.9),
        'parquet': material('parquet', '#dccfbd', 0.8, image=parquet_tex('parquet', '#dccfbd'), uv_m=1.2),
        'tile': material('tile', '#e4e2dd', 0.7, image=tile_tex('tile', '#e4e2dd'), uv_m=1.2),
        'hex': material('hex', '#f1f0ed', 0.6, image=hex_tex('hex', '#f3f2ef', '#c9c6c0'), uv_m=0.35),
        'soft': material('soft', '#e4e2df', 0.95),
        'soft-light': material('soft-light', '#f4f3f3', 0.95),
        'neutral': material('neutral', '#d9d7d3', 0.8),
        'graphite': material('graphite', '#4c4c4c', 0.6),
        'appliance': material('appliance', '#2e2e2e', 0.5),
        'plant': material('plant', '#7d8a6b', 0.9),
        'glass': material('glass', '#dfe5e8', 0.2, alpha=0.3),
    }


# ---------- объекты ----------

def empty(name, parent=None, title=None):
    obj = bpy.data.objects.new(name, None)
    obj.empty_display_type = 'PLAIN_AXES'
    obj.empty_display_size = 0.3
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    if title:
        obj['title'] = title  # уходит в GLB как extras — подпись для плашки
    return obj


def planar_uv(bm, uv_layer, mats):
    """UV проекцией на грань в метрах, с учётом размера повтора текстуры материала.
    На вертикальных гранях v — высота (волокна шпона вертикальны)."""
    for f in bm.faces:
        n = f.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        s = 1.0 / mats[f.material_index].get('uv_m', 1.0) if f.material_index < len(mats) else 1.0
        for loop in f.loops:
            co = loop.vert.co
            if ax == 2:
                loop[uv_layer].uv = (co.x * s, co.y * s)
            elif ax == 0:
                loop[uv_layer].uv = (co.y * s, co.z * s)
            else:
                loop[uv_layer].uv = (co.x * s, co.z * s)


def mesh_object(name, bm, mats, parent):
    mats = mats if isinstance(mats, (list, tuple)) else [mats]
    uv = bm.loops.layers.uv.verify()
    bm.normal_update()
    planar_uv(bm, uv, mats)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    return obj


def box(name, x0, x1, y0, y1, z0, z1, mat, parent=None, bevel=0.0, skip_bottom=True):
    """Параллелепипед по координатам плана (мм). Низ не нужен (ТЗ: невидимые грани удалять)."""
    a = to_world(min(x0, x1), max(y0, y1), min(z0, z1))
    b = to_world(max(x0, x1), min(y0, y1), max(z0, z1))
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = a[0] if v.co.x < 0 else b[0]
        v.co.y = a[1] if v.co.y < 0 else b[1]
        v.co.z = a[2] if v.co.z < 0 else b[2]
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel / 1000.0, segments=2,
                        profile=0.5, affect='EDGES', clamp_overlap=True)
    if skip_bottom and a[2] <= 0.0005:
        bm.normal_update()
        bottom = [f for f in bm.faces if f.normal.z < -0.99 and abs(f.calc_center_median().z - a[2]) < 1e-6]
        bmesh.ops.delete(bm, geom=bottom, context='FACES')
    return mesh_object(name, bm, mat, parent)


def rotated_box(name, cx, cy, length, thick, angle, z0, z1, mat, parent=None):
    """Плоская панель (дверное полотно): центр, длина вдоль angle (рад, в осях плана), толщина."""
    obj = box(name, -length / 2, length / 2, -thick / 2, thick / 2, z0, z1, mat, parent)
    me = obj.data
    o = to_world(0, 0, 0)
    c = to_world(cx, cy, 0)
    ca, sa = math.cos(-angle), math.sin(-angle)  # y плана направлен вниз — угол в мире с обратным знаком
    for v in me.vertices:
        x, y = v.co.x - o[0], v.co.y - o[1]
        v.co.x, v.co.y = c[0] + x * ca - y * sa, c[1] + x * sa + y * ca
    return obj


def cylinder(name, cx, cy, r, z0, z1, mat, parent=None, segments=24):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segments, radius1=r / 1000.0,
                          radius2=r / 1000.0, depth=(z1 - z0) / 1000.0)
    bmesh.ops.translate(bm, verts=bm.verts, vec=to_world(cx, cy, (z0 + z1) / 2))
    return mesh_object(name, bm, mat, parent)


def fronts_row(prefix, ranges, fixed, z_rows, mat, parent, axis='x', depth=20.0, gap=3.0):
    """Ряд фасадов с зазорами. axis='x': фасады в плоскости x (толщина fixed-depth..fixed);
    axis='y': в плоскости y."""
    objs = []
    for i, (s0, s1) in enumerate(ranges):
        for j, (z0, z1) in enumerate(z_rows):
            a0, a1, b0, b1 = s0 + gap / 2, s1 - gap / 2, z0 + gap / 2, z1 - gap / 2
            if axis == 'x':
                objs.append(box(f'{prefix}-{i}-{j}', fixed - depth, fixed, a0, a1, b0, b1, mat, parent))
            else:
                objs.append(box(f'{prefix}-{i}-{j}', a0, a1, fixed - depth, fixed, b0, b1, mat, parent))
    return objs


def split(a, b, n):
    step = (b - a) / n
    return [(a + k * step, a + (k + 1) * step) for k in range(n)]


def join_children(parent, name):
    """Склеить меши внутри предмета в один объект (ТЗ: внутри предмета объединять можно и нужно)."""
    return join_objects([c for c in parent.children if c.type == 'MESH'], name, parent)


def join_objects(kids, name, parent):
    if not kids:
        return None
    if len(kids) > 1:
        ctx = {'active_object': kids[0], 'selected_editable_objects': kids, 'selected_objects': kids}
        with bpy.context.temp_override(**ctx):
            bpy.ops.object.join()
    obj = kids[0]
    obj.name = name
    obj.data.name = name
    obj.parent = parent
    # одинаковые материалы — одним слотом
    seen, order = {}, []
    for slot in obj.material_slots:
        if slot.material.name not in seen:
            seen[slot.material.name] = len(order)
            order.append(slot.material)
    remap = [seen[s.material.name] for s in obj.material_slots]
    idx = [remap[p.material_index] for p in obj.data.polygons]
    obj.data.materials.clear()
    for m in order:
        obj.data.materials.append(m)
    obj.data.polygons.foreach_set('material_index', idx)
    return obj


# ---------- нейтральная мебель (своя библиотека, одна визуальная семья) ----------

def soft_block(name, x0, x1, y0, y1, z0, z1, mat, parent, r=45):
    return box(name, x0, x1, y0, y1, z0, z1, mat, parent, bevel=r)


def dining_chair(prefix, cx, cy, facing, mats, parent, s=200):
    """Стул 2s×2s: сиденье и спинка светлые, ножки графит. facing — куда смотрит сидящий."""
    objs = [box(f'{prefix}-seat', cx - s, cx + s, cy - s, cy + s, 400, 470, mats['soft-light'], parent, bevel=20)]
    back = {'E': (cx - s, cx - s + 60, cy - s, cy + s), 'W': (cx + s - 60, cx + s, cy - s, cy + s),
            'S': (cx - s, cx + s, cy - s, cy - s + 60), 'N': (cx - s, cx + s, cy + s - 60, cy + s)}[facing]
    objs.append(box(f'{prefix}-back', *back, 560, 800, mats['soft-light'], parent, bevel=20))
    for i, (dx, dy) in enumerate(((-1, -1), (1, -1), (-1, 1), (1, 1))):
        lx, ly = cx + dx * (s - 35), cy + dy * (s - 35)
        objs.append(box(f'{prefix}-leg{i}', lx - 15, lx + 15, ly - 15, ly + 15, 0, 400, mats['graphite'], parent))
    return objs


def plant(prefix, cx, cy, mats, parent, h=1100):
    parts = [cylinder(f'{prefix}-pot', cx, cy, 150, 0, 380, mats['neutral'], parent)]
    for i, (dx, dy, z, r) in enumerate(((0, 0, h - 250, 230), (-90, 60, h - 520, 200), (100, -40, h - 600, 180))):
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r / 1000.0)
        bmesh.ops.translate(bm, verts=bm.verts, vec=to_world(cx + dx, cy + dy, z))
        parts.append(mesh_object(f'{prefix}-leaf{i}', bm, mats['plant'], parent))
    obj = join_objects(parts, prefix, parent)
    obj['outline'] = 0  # просмотрщик не рисует контур по листве
    return obj


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.images):
        for item in list(coll):
            if item.users == 0:
                coll.remove(item)
