"""Reconstruct the No.303 campaign cap in Blender; export the web asset and render.

Run: /Applications/Blender.app/Contents/MacOS/Blender -b --python scripts/build_merch_cap.py
Visual reference: public/merch/acid-bass-303.jpg. Geometry and fabric maps are authored here.
"""
import bpy
import math
import os
import random
from mathutils import Vector
from math import sin, cos, pi, sqrt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/merch/models')
SOURCE = os.path.join(ROOT, 'assets/merch')
os.makedirs(OUT, exist_ok=True)
os.makedirs(SOURCE, exist_ok=True)
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Keep studio objects separate from the product exported to glTF.
product = bpy.data.collections.new('NO303 | Product')
bpy.context.scene.collection.children.link(product)

def own(obj):
    for c in list(obj.users_collection): c.objects.unlink(obj)
    product.objects.link(obj)
    return obj

def material(name, color, roughness=.8, metallic=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = roughness
    p.inputs['Metallic'].default_value = metallic
    return m

# Tileable cotton twill normal map. It is a real image texture in the GLB,
# so the material remains intact outside Blender.
size = 512
pixels = []
for y in range(size):
    for x in range(size):
        diagonal = (x - y) * 2 * pi / 16
        cross = (x + y) * 2 * pi / 4
        dx = .37 * cos(diagonal) + .13 * cos(cross)
        dy = -.37 * cos(diagonal) + .13 * cos(cross)
        length = sqrt(1 + dx * dx + dy * dy)
        pixels.extend((.5 - dx / length * .5, .5 - dy / length * .5, .5 + .5 / length, 1))
normal = bpy.data.images.new('Cotton twill | tangent normal', width=size, height=size)
normal.colorspace_settings.name = 'Non-Color'
normal.pixels.foreach_set(pixels)
normal.filepath_raw = os.path.join(SOURCE, 'cotton-twill-normal.png')
normal.file_format = 'PNG'
normal.save()
normal.pack()

cloth = material('01 | Washed cobalt cotton', (.021, .075, .26), .88)
lining = material('02 | Midnight cotton lining', (.009, .017, .036), .97)
underside = material('08 | Cobalt visor underside', (.012, .038, .14), .94)
thread = material('03 | Tonal cobalt stitching', (.025, .084, .255), .95)
seam = material('04 | Panel seam shadow', (.012, .04, .14), .96)
lime = material('05 | Acid lime embroidery', (.69, .70, .12), .94)
dark = material('06 | Ink embroidery', (.014, .022, .008), .96)
for mat, strength in [(cloth, .45), (lining, .22)]:
    nodes = mat.node_tree.nodes
    tex = nodes.new('ShaderNodeTexImage'); tex.image = normal
    nm = nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = strength
    mat.node_tree.links.new(tex.outputs['Color'], nm.inputs['Color'])
    mat.node_tree.links.new(nm.outputs['Normal'], nodes.get('Principled BSDF').inputs['Normal'])
    nodes.get('Principled BSDF').inputs['Sheen Weight'].default_value = 0


# Uneven dyed yarn makes the cotton read as fabric rather than molded plastic.
rng = random.Random(303)
color_pixels = []
for y in range(size):
    for x in range(size):
        yarn = .90 + .055 * sin((x-y)*2*pi/16) + rng.uniform(-.065,.065)
        wash = 1 + .04*sin(x*2*pi/256)*cos(y*2*pi/128)
        color_pixels.extend((.105*yarn*wash, .285*yarn*wash, .52*yarn*wash, 1))
dye = bpy.data.images.new('Washed cobalt | cotton yarn color', width=size, height=size)
dye.pixels.foreach_set(color_pixels)
dye.filepath_raw = os.path.join(SOURCE, 'cobalt-cotton-color.png')
dye.file_format='PNG'; dye.save(); dye.pack()
tex = cloth.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=dye
cloth.node_tree.links.new(tex.outputs['Color'],cloth.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])


def mesh(name, vertices, faces, mat, uvs=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces); data.update()
    obj = bpy.data.objects.new(name, data); product.objects.link(obj)
    obj.data.materials.append(mat)
    for f in data.polygons: f.use_smooth = True
    if uvs:
        layer = data.uv_layers.new(name='Cotton UV')
        for polygon in data.polygons:
            for li in polygon.loop_indices:
                layer.data[li].uv = uvs[data.loops[li].vertex_index]
    return obj


def paths(name, lines, radius, mat, cyclic=False):
    data = bpy.data.curves.new(name, 'CURVE'); data.dimensions = '3D'
    data.resolution_u = 1; data.bevel_depth = radius; data.bevel_resolution = 1
    for line in lines:
        s = data.splines.new('POLY'); s.points.add(len(line) - 1)
        for point, co in zip(s.points, line): point.co = (*co, 1)
        s.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, data); product.objects.link(obj)
    data.materials.append(mat)
    return obj


def crown(a, t, offset=0):
    # Six relaxed panels, with a gently flattened crown and sewn-in wrinkles.
    r = max(0, cos(t)) ** .82
    front = (-sin(a) + 1) / 2
    crease = (.005 * sin(a * 19 + t * 3) + .003 * sin(a * 31 - t * 7)) * math.exp(-t * 4)
    x = (r + crease) * cos(a)
    y = (r + crease) * sin(a) * 1.12
    front_weight = min(1, max(0, -sin(a))/.4)
    front_weight = front_weight*front_weight*(3-2*front_weight)
    base = (.08-.4*cos(a)**2)*front_weight
    z = .98 * sin(t) ** .88 + .025 * front * sin(2*t) + base*cos(t)**3
    n = Vector((cos(a) * cos(t), sin(a) * cos(t), sin(t))).normalized()
    return Vector((x, y, z)) + n * offset


def bottom_angle(a):
    # Smooth arch above the adjustment strap at the back.
    d = abs((a - pi / 2 + pi) % (2 * pi) - pi)
    return .33 * max(0, cos(d / .43 * pi / 2)) ** .6 if d < .43 else 0

# Individual panels retain a very subtle seam valley.
for panel in range(6):
    start = -2 * pi / 3 + panel * pi / 3
    cols, rows = 24, 32
    verts, uv, faces = [], [], []
    for j in range(rows + 1):
        for i in range(cols + 1):
            a = start + (i / cols) * pi / 3
            low = bottom_angle(a)
            t = low + (pi / 2 - low) * j / rows
            p = crown(a, t)
            verts.append(tuple(p)); uv.append((i / cols * 2.2, j / rows * 2.7))
    for j in range(rows):
        for i in range(cols):
            k = j * (cols + 1) + i
            faces.append((k, k + 1, k + cols + 2, k + cols + 1))
    obj = mesh('Crown | panel %02d' % (panel + 1), verts, faces, cloth, uv)
    solid = obj.modifiers.new('Cotton shell thickness', 'SOLIDIFY'); solid.thickness = .018; solid.offset = -1
    obj.data.materials.append(lining); solid.material_offset = 1

# Full panel piping and the two rows of short stitches beside each seam.
seams, stitches = [], []
for panel in range(6):
    a = -2 * pi / 3 + panel * pi / 3
    lo = bottom_angle(a)
    seams.append([crown(a, lo + (1.565 - lo) * j / 80, .004) for j in range(81)])
    for side in [-1, 1]:
        for j in range(50):
            t = lo + .03 + (1.41 - lo) * j / 50
            da = side * .018 / max(.24, cos(t))
            stitches.append([crown(a + da, t + s * .011, .008) for s in [0, .5, 1]])
paths('Crown | recessed seam cords', seams, .0025, seam)
paths('Crown | double needle topstitch', stitches, .0018, thread)

# Edge binding follows the curved rear opening.
paths('Crown | bound lower edge', [[crown(a, bottom_angle(a), -.002) for a in [2 * pi * j / 256 for j in range(256)]]], .007, cloth, True)

# The campaign has a compact, strongly bowed baseball visor, not a flat paddle.
# Width/depth are proportions relative to the crown; they are not product measurements.
# Rear edge follows the crown ellipse; both edges share the transverse bow.
def brim(u, v, lift=0):
    rear_width = .91
    rear = sqrt(max(0, 1 - (rear_width*u)**2)) * 1.12
    taper = sqrt(max(0, 1-u*u))
    x = u * rear_width
    y = -(rear + v*.64*taper)
    attachment = .08 - .4*x*x
    # Both boundaries meet at the temples: no dangling rectangular side flaps.
    # The longitudinal drop vanishes at the sewn endpoints, keeping the join closed.
    z = attachment - taper*(.045*v + .025*v*v) + lift
    return Vector((x, y, z))

cols, rows = 80, 24
verts, uv, faces = [], [], []
for j in range(rows + 1):
    for i in range(cols + 1):
        u, v = i / cols * 2 - 1, j / rows
        verts.append(brim(u, v)); uv.append((i / cols * 4, v * 2))
for j in range(rows):
    for i in range(cols):
        k = j * (cols + 1) + i
        faces.append((k, k + cols + 1, k + cols + 2, k + 1))
obj = mesh('Visor | curved cotton sandwich', verts, faces, cloth, uv)
# The crescent collapses to one vertex at each temple; weld those shared endpoints
# before thickening the shell so no zero-area strips or crossing side faces remain.
bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.remove_doubles(threshold=.00001)
bpy.ops.object.mode_set(mode='OBJECT')
obj.data.materials.append(underside)
solid = obj.modifiers.new('Stiffened visor thickness', 'SOLIDIFY'); solid.thickness = .024; solid.offset = -1; solid.material_offset = 1
bevel = obj.modifiers.new('Soft rounded visor edge', 'BEVEL'); bevel.width = .006; bevel.segments = 3
paths('Visor | rolled outer binding', [[brim(-1 + j / 100 * 2, 1, -.01) for j in range(101)]], .008, cloth)
lines = []
for row in range(6):
    v = .36 + row * .105
    for j in range(88):
        u = -.96 + j / 88 * 1.92
        lines.append([brim(u + s * .014, v, .005) for s in [0, .5, 1]])
paths('Visor | six subtle stitch rows', lines, .0017, thread)

# Inner sweatband with a real opening; the back arch stays open.
verts, faces, uv = [], [], []
for j in range(2):
    for i in range(161):
        a = pi / 2 + .40 + (2 * pi - .80) * i / 160
        p = crown(a, .02 + j * .105, -.027)
        verts.append(p); uv.append((i / 160 * 8, j * .5))
for i in range(160): faces.append((i, i + 1, i + 162, i + 161))
obj = mesh('Interior | continuous sweatband', verts, faces, lining, uv)
solid = obj.modifiers.new('Sweatband thickness', 'SOLIDIFY'); solid.thickness = .012

# Fabric covered top button.
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=(0, 0, .991))
obj = own(bpy.context.object); obj.name = 'Crown | fabric covered button'; obj.scale = (.065, .065, .023); obj.data.materials.append(cloth)
for f in obj.data.polygons: f.use_smooth = True

# Sewn ventilation eyelets sit on each panel, with a dark inset.
for panel in range(1, 5):
    a = -pi / 2 + pi / 6 + panel * pi / 3
    t = .68
    center = crown(a, t, .009)
    n = Vector((cos(a) * cos(t), sin(a) * cos(t), sin(t))).normalized()
    xaxis = Vector((-sin(a), cos(a), 0))
    yaxis = n.cross(xaxis).normalized()
    paths('Eyelet | tonal stitched ring', [[center + .022 * (xaxis * cos(j * 2 * pi / 32) + yaxis * sin(j * 2 * pi / 32)) for j in range(32)]], .007, thread, True)
    verts = [center - n * .003] + [center - n * .003 + .018 * (xaxis * cos(j * 2 * pi / 32) + yaxis * sin(j * 2 * pi / 32)) for j in range(32)]
    mesh('Eyelet | dark center', verts, [(0, j + 1, (j + 1) % 32 + 1) for j in range(32)], lining)

# Small smile embroidered almost flush on the plain front panel, as in the photo.
# Map embroidery coordinates onto the actual curved surface instead of a flat coin.
badge_a = -pi / 2 + .04
badge_t = .59
eps = .0001
tangent_scale = (crown(badge_a+eps,badge_t)-crown(badge_a-eps,badge_t)).length/(2*eps)
polar_scale = (crown(badge_a,badge_t+eps)-crown(badge_a,badge_t-eps)).length/(2*eps)
def badge(x, y, depth=0):
    return crown(badge_a + x*.5/tangent_scale, badge_t + y*.5/polar_scale, .005 + depth*.4)
radius = .196
verts = [badge(0, 0, .009)]
uv = [(0.5, .5)]
for ring in range(1, 9):
    for j in range(96):
        a = j * 2 * pi / 96; r = radius * ring / 8
        verts.append(badge(r*cos(a), r*sin(a), .009)); uv.append((.5+cos(a)*r*8, .5+sin(a)*r*8))
faces = [(0, j + 1, (j + 1) % 96 + 1) for j in range(96)]
for ring in range(7):
    for j in range(96):
        a = 1 + ring * 96 + j; b = 1 + ring * 96 + (j + 1) % 96
        faces.append((a, b, b+96, a+96))
mesh('Badge | domed acid embroidered backing', verts, faces, lime, uv)
paths('Badge | satin stitched border', [[badge(radius*cos(a),radius*sin(a),.01) for a in [j*2*pi/128 for j in range(128)]]], .004, lime, True)
# Parallel satin threads cover the patch, including its center.
patch_threads=[]
for j in range(79):
    y=-.19+j*.0048
    half=sqrt(max(0,.19*.19-y*y))
    patch_threads.append([badge(-half+2*half*k/24,y,.012) for k in range(25)])
paths('Badge | satin fill embroidery', patch_threads, .0009, lime)
# Fine radial border stitches catch the studio light.
paths('Badge | individual border stitches', [[badge(r*cos(a),r*sin(a),.018) for r in [.185,.202]] for a in [j*2*pi/120 for j in range(120)]], .0009, lime)
paths('Badge | ink outline', [[badge(.178*cos(a), .178*sin(a), .024) for a in [j*2*pi/96 for j in range(96)]]], .0025, dark, True)
features = []
for x in [-.065,.065]:
    features.append([badge(x, .043 + j / 12*.040, .020) for j in range(13)])
features.append([badge(.105*cos(a),-.007 + .102*sin(a),.021) for a in [pi*1.10 + j/48*pi*.80 for j in range(49)]])
paths('Badge | raised smile embroidery', features, .0035, dark)

# Woven adjustment strap with a rounded brushed-metal buckle.
def box(name, location, scale, mat, bevel=.01):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj=own(bpy.context.object); obj.name=name; obj.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    if bevel:
        b=obj.modifiers.new('Soft edges','BEVEL'); b.width=bevel; b.segments=3
        obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    return obj
box('Rear | cotton adjustment strap', (0,1.094,.065), (.85,.035,.15), cloth)
# The campaign back view shows a plain blue strap, without an exposed metal frame.
paths('Rear | strap topstitch', [[(-.39+j/26*.78,1.115,z),(-.39+j/26*.78+.016,1.115,z)] for z in [.014,.12] for j in range(26)], .0017, thread)

# Convert modifiers and curves, join by material to keep browser draw calls low.
bpy.ops.object.select_all(action='DESELECT')
for obj in list(product.objects): obj.select_set(True)
bpy.context.view_layer.objects.active=next(iter(product.objects))
bpy.ops.object.convert(target='MESH')
for obj in list(product.objects):
    for f in obj.data.polygons: f.use_smooth=True
# Split multi-material solids, then combine matching material surfaces.
for obj in list(product.objects):
    if len(obj.data.materials)>1:
        bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='MATERIAL'); bpy.ops.object.mode_set(mode='OBJECT')
for mat in [cloth,lining,thread,seam,lime,dark,underside]:
    objects=[o for o in product.objects if len(o.data.materials) and o.data.materials[0] == mat]
    if objects:
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1: bpy.ops.object.join()
        objects[0].name=mat.name

# Triangulate the curved surfaces before exporting stable tangent-space normals.
for obj in product.objects:
    bpy.ops.object.select_all(action='DESELECT'); obj.select_set(True); bpy.context.view_layer.objects.active=obj
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.quads_convert_to_tris(quad_method='BEAUTY', ngon_method='BEAUTY')
    bpy.ops.object.mode_set(mode='OBJECT')

# glTF uses +Y up, with the visor toward +Z. Center model for orbit controls.
for obj in product.objects: obj.location.z -= .34; obj.location.y += .34
bpy.ops.object.select_all(action='DESELECT')
for obj in product.objects: obj.select_set(True)
bpy.context.view_layer.objects.active=next(iter(product.objects))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'no303-cap.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False,export_tangents=True)

# Three large softboxes and a matte studio surface for the product render.
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=32; scene.cycles.use_denoising=True
scene.world.color=(.16,.16,.16)
scene.view_settings.view_transform='AgX'

def aim(obj,target): obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,color):
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size; data.color=color
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj); obj.location=loc; aim(obj,(0,0,0)); return obj
area('Studio | large key',(-3,-4,5),450,4,(.88,.93,1))
area('Studio | fill',(3,-1,2.8),160,3,(.75,.86,1))
area('Studio | edge',(0,4,3),500,3,(1,.97,.85))
floor=material('Studio | warm grey',(.22,.23,.20),.9)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.67)); bpy.context.object.name='Studio | ground'; bpy.context.object.data.materials.append(floor)
data=bpy.data.cameras.new('Studio camera'); cam=bpy.data.objects.new('Studio camera',data); scene.collection.objects.link(cam)
cam.location=(-3,-5.8,1.55); aim(cam,(0,-.25,.04)); data.type='ORTHO'; data.ortho_scale=4.2; scene.camera=cam
scene.render.resolution_x=1400; scene.render.resolution_y=1200; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.film_transparent=False
scene.render.filepath=os.path.join(ROOT,'public/merch/no303-cap-campaign.png')
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCE,'no303-cap.blend'))
if not os.environ.get('MERCH_SKIP_RENDER'): bpy.ops.render.render(write_still=True)
print('NO303_EXPORT_COMPLETE',len(product.objects),'meshes')
