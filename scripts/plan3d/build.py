"""Пересобрать всю квартиру и выгрузить GLB.

В Blender: exec(open(r'D:\\Desktop\\KMF\\mytishchi-astakhova\\scripts\\build.py', encoding='utf-8').read())
Перед этим, если менялся PDF или правила зон: системным Python `python extract_plan.py`.
"""
import importlib
import json
import math
import os
import re
import sys

import bpy

SCRIPTS = r'D:\Desktop\KMF\mytishchi-astakhova\scripts'
if SCRIPTS not in sys.path:
    sys.path.insert(0, SCRIPTS)

import kmf_lib  # noqa: E402

importlib.reload(kmf_lib)  # сначала библиотека — модули комнат импортируют из неё имена
import room_kitchen  # noqa: E402
import rooms  # noqa: E402

for mod in (room_kitchen, rooms):
    importlib.reload(mod)
L = kmf_lib
box = L.box

# Окна: x от–до, полоса стены по y, отметка подоконника, ось стекла (мм плана).
WINDOWS = [
    ('loggia', -6100, -3784, -300, -157, 654, -231),
    ('loggia-door', -5692, -3744, 1062, 1369, 105, 1214),
    ('kids', -2725, -770, -300, 0, 668, -150),
    ('living-0', 395, 2345, -300, 0, 661, -150),
    ('living-1', 3368, 5330, -300, 0, 658, -150),
]
# Двери (лист 8 «План заполнения дверных проёмов»): петля, конец полотна в закрытом и открытом виде.
DOORS = [
    ('door-kids', (-1800, 3918), (-1000, 3918), (-1800, 4718)),
    ('door-bedroom', (-3096, 4858), (-3096, 4058), (-2296, 4858)),
    ('door-bath-2', (320, 5001), (1020, 5001), (320, 4301)),
    ('door-bath', (-3096, 5231), (-3096, 5931), (-2396, 5231)),
    ('door-laundry', (4336, 5333), (4336, 6036), (3721, 5333)),
]
DOOR_OPEN = math.radians(70)  # приоткрыты, чтобы не перекрывать проходы (ТЗ)


def build_shell(m, shell, plan):
    walls = [box(f'wall{i}', *r, -20, L.WALL_CUT, m['wall'], shell) for i, r in enumerate(plan['walls'])]
    L.join_objects(walls, 'walls', shell)
    for name, x0, x1, y0, y1, sill, gy in WINDOWS:
        box(f'{name}-sill', x0, x1, y0, y1, -20, sill, m['wall'], shell)
        mid = (x0 + x1) / 2
        parts = [box(f'{name}-rail', x0, x1, gy - 30, gy + 30, sill, sill + 50, m['graphite'], shell)]
        for k, (p0, p1) in enumerate(((x0, x0 + 50), (mid - 25, mid + 25), (x1 - 50, x1))):
            parts.append(box(f'{name}-post{k}', p0, p1, gy - 30, gy + 30, sill, L.WALL_CUT, m['graphite'], shell))
        L.join_objects(parts, f'{name}-frame', shell)
        box(f'{name}-glass', x0 + 50, x1 - 50, gy - 4, gy + 4, sill + 50, L.WALL_CUT, m['glass'], shell)
    for name, hinge, closed, opened in DOORS:
        cx, cy = closed[0] - hinge[0], closed[1] - hinge[1]
        ox, oy = opened[0] - hinge[0], opened[1] - hinge[1]
        vx = cx * math.cos(DOOR_OPEN) + ox * math.sin(DOOR_OPEN)
        vy = cy * math.cos(DOOR_OPEN) + oy * math.sin(DOOR_OPEN)
        length = math.hypot(vx, vy)
        L.rotated_box(name, hinge[0] + vx / 2, hinge[1] + vy / 2, length, 40, math.atan2(vy, vx),
                      0, L.DOOR_H, m['kmf-oak'], shell)
    box('door-entrance', 3270, 4260, 7011, 7071, 0, L.DOOR_H, m['graphite'], shell)
    # декоративная перегородка спальня / гардеробная: глухие створки по краям, сдвижные — за ними
    for k, (a, b) in enumerate(((-6222, -5450), (-3908, -3136))):
        box(f'partition-fixed{k}', a, b, 5010, 5050, 0, L.WALL_CUT, m['wall'], shell)
        box(f'partition-slide{k}', a + 40, b - 40, 5050, 5090, 0, L.WALL_CUT, m['wall'], shell)


def build_floors(m, zones_root, shell, plan):
    mats = {'laminate': m['parquet'], 'tile': m['tile'], 'vinyl': m['tile']}
    for key, by_kind in plan['zone_rects'].items():
        parent = shell if key == 'corridor' else zones_root[key]
        parts = [box(f'f-{key}-{kind}-{i}', *r, -20, 0, mats[kind], parent)
                 for kind, rects in by_kind.items() for i, r in enumerate(rects)]
        L.join_objects(parts, f'floor-{key}', parent)


def setup_view(target, ortho_scale):
    """Камера сайта: ортографическая, поворот 45° вокруг вертикали, наклон 35° сверху."""
    scene = bpy.context.scene
    cam_data = bpy.data.cameras.new('site-camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = ortho_scale
    cam = bpy.data.objects.new('site-camera', cam_data)
    scene.collection.objects.link(cam)
    tilt, yaw = math.radians(35), math.radians(-45)
    cam.rotation_euler = (math.radians(90) - tilt, 0, yaw)
    d = 40.0
    dx, dy, dz = math.sin(-yaw) * math.cos(tilt), math.cos(-yaw) * math.cos(tilt), -math.sin(tilt)
    cam.location = (target[0] - dx * d, target[1] - dy * d, target[2] - dz * d)
    cam_data.clip_end = 100
    scene.camera = cam

    world = bpy.data.worlds.get('kmf-world') or bpy.data.worlds.new('kmf-world')
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    light = nt.nodes.new('ShaderNodeBackground')
    light.inputs['Color'].default_value = (1, 1, 1, 1)
    light.inputs['Strength'].default_value = 0.6
    backdrop = nt.nodes.new('ShaderNodeBackground')
    backdrop.inputs['Color'].default_value = (*L.hex_rgb('#eeede8'), 1)
    path = nt.nodes.new('ShaderNodeLightPath')
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(path.outputs['Is Camera Ray'], mix.inputs['Fac'])
    nt.links.new(light.outputs['Background'], mix.inputs[1])
    nt.links.new(backdrop.outputs['Background'], mix.inputs[2])
    nt.links.new(mix.outputs['Shader'], out.inputs['Surface'])
    scene.world = world
    sun_data = bpy.data.lights.new('soft-sun', 'SUN')
    sun_data.energy = 2.0
    sun_data.angle = math.radians(25)
    sun = bpy.data.objects.new('soft-sun', sun_data)
    sun.rotation_euler = (math.radians(40), math.radians(10), math.radians(-120))
    scene.collection.objects.link(sun)


def setup_render(path):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    try:
        prefs.compute_device_type = 'OPTIX'
        prefs.get_devices()
        for dev in prefs.devices:
            dev.use = dev.type == 'OPTIX'
        sc.cycles.device = 'GPU'
    except TypeError:
        sc.cycles.device = 'CPU'
    sc.cycles.samples = 256
    sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 1800, 1300
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.render.filepath = path


def export(name='mytishchi-astakhova'):
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(L.ROOT, name + '.blend'))
    glb = os.path.join(L.ROOT, name + '.glb')
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', export_yup=True, export_apply=True,
                              export_cameras=False, export_lights=False, export_extras=True,
                              export_image_format='AUTO')
    keys = sorted(o.name for o in bpy.data.objects if re.match(r'^(zone|item)--', o.name))
    with open(os.path.join(L.ROOT, name + '-keys.txt'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(keys) + '\n')
    dg = bpy.context.evaluated_depsgraph_get()
    tris = 0
    for o in bpy.data.objects:
        if o.type == 'MESH':
            ev = o.evaluated_get(dg)
            me = ev.to_mesh()
            me.calc_loop_triangles()
            tris += len(me.loop_triangles)
            ev.to_mesh_clear()
    dupes = [o.name for o in bpy.data.objects if re.search(r'\.\d{3}$', o.name)]
    mats = len([mt for mt in bpy.data.materials if mt.users])
    return {'keys': len(keys), 'tris': tris, 'mb': round(os.path.getsize(glb) / 1e6, 2), 'materials': mats,
            'dupes': dupes}


L.clear_scene()
plan = json.load(open(os.path.join(L.ROOT, 'plan.json'), encoding='utf-8'))
mats = L.build_materials()
shell = L.empty('shell')
zones = {'kitchen': L.empty('zone--kitchen', None, 'Кухня-гостиная')}
for key, (title, _) in rooms.ZONES.items():
    zones[key] = L.empty(f'zone--{key}', None, title)
build_shell(mats, shell, plan)
build_floors(mats, zones, shell, plan)
room_kitchen.build(mats, zones['kitchen'])
for key, (_, fn) in rooms.ZONES.items():
    fn(mats, zones[key])
setup_view(L.to_world(0, 3446, 600), 14.5)
setup_render(os.path.join(L.ROOT, 'renders', 'apartment.png'))
print('objects:', len(bpy.data.objects))
