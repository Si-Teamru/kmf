'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

import { cn } from '@/components/ui/cn'

/** Габариты изделия по модели, мм: высота, ширина (длинная сторона в плане), глубина. */
export type PlanItemSize = { height: number; width: number; depth: number }
export type PlanItem = { key: string; title: string; size: PlanItemSize }
/** Рамка, в которую вписывается модель, — px относительно холста. Холст может быть больше рамки. */
export type PlanRect = { x: number; y: number; w: number; h: number }
export type PlanZone = { key: string; title: string; items: PlanItem[] }
export type PlanSelection = { zoneKey: string | null; itemKey: string | null }

const ACCENT = '#db5440' // var(--accent-red): three.js не читает CSS-переменные
const CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M3 2.5 L3 22 L8.6 16.8 L12.4 25 L16 23.4 L12.3 15.4 L19.8 15.4 Z' fill='%23fff' stroke='%23222' stroke-width='1.6' stroke-linejoin='round'/%3E%3C/svg%3E\") 3 2, pointer"

/** Ключ из имени объекта: zone--kitchen → kitchen. */
const keyOf = (o: THREE.Object3D) => o.name.replace(/^(zone|item)--/, '')
const titleOf = (o: THREE.Object3D) => (o.userData.title as string | undefined) ?? keyOf(o)

/** Что подсвечивать под курсором: предмет KMF целиком, иначе — вся зона; shell — ничего (ТЗ). */
function targetOf(obj: THREE.Object3D): THREE.Object3D | null {
  let item: THREE.Object3D | null = null
  for (let o: THREE.Object3D | null = obj; o; o = o.parent) {
    if (!item && o.name.startsWith('item--')) item = o
    if (o.name.startsWith('zone--')) return item ?? o
  }
  return null
}

function materials(mesh: THREE.Mesh) {
  return ([] as THREE.Material[]).concat(mesh.material) as THREE.MeshStandardMaterial[]
}

function tint(root: THREE.Object3D, amount: number) {
  root.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return
    for (const m of materials(o as THREE.Mesh)) {
      m.emissive.set(ACCENT)
      m.emissiveIntensity = amount
    }
  })
}

/** Контуры по перепадам глубины и нормалей — тонкая графитовая линия, как в макете плана. */
const edgeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tNormal: { value: null as THREE.Texture | null },
    tDepth: { value: null as THREE.Texture | null },
    texel: { value: new THREE.Vector2() },
    range: { value: 1 },
    lineColor: { value: new THREE.Color('#3f3f3f') },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse, tNormal, tDepth; uniform vec2 texel; uniform float range; uniform vec3 lineColor;
    varying vec2 vUv;
    float d(vec2 o){ return texture2D(tDepth, vUv + o * texel).x * range; }
    vec3 n(vec2 o){ return texture2D(tNormal, vUv + o * texel).xyz * 2.0 - 1.0; }
    void main(){
      vec4 col = texture2D(tDiffuse, vUv);
      float dc = d(vec2(0)); vec3 nc = n(vec2(0));
      float de = 0.0, ne = 0.0;
      vec2 offs[4]; offs[0]=vec2(1,0); offs[1]=vec2(-1,0); offs[2]=vec2(0,1); offs[3]=vec2(0,-1);
      for (int i = 0; i < 4; i++) { de = max(de, abs(d(offs[i]) - dc)); ne = max(ne, 1.0 - dot(nc, n(offs[i]))); }
      float edge = max(smoothstep(0.035, 0.08, de), smoothstep(0.15, 0.35, ne));
      if (dc >= range * 0.9999) edge = 0.0;
      gl_FragColor = vec4(mix(col.rgb, lineColor, edge * 0.85), col.a);
    }`,
}

/**
 * Plan3DViewer — интерактивная 3D-модель плана (GLB по ТЗ KMF: zone--/item--, подписи в extras.title).
 * Ортокамера 45° / 35°, вращение по кругу (снизу не заглянуть), контуры и AO, подсветка и плашка
 * с названием у курсора. Выбор — снаружи (`selection`), клик по модели сообщает `onSelect`.
 * `frame` — где на холсте стоит модель: холст бывает шире рамки (модель не обрезается при вращении),
 * смена рамки анимируется — так модель «отъезжает» и уменьшается при открытой вкладке.
 */
export function Plan3DViewer({
  src,
  selection,
  onSelect,
  onZones,
  frame,
  className,
}: {
  src: string
  selection: PlanSelection
  onSelect: (s: PlanSelection) => void
  onZones?: (zones: PlanZone[]) => void
  frame?: PlanRect | null
  className?: string
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<{ select: (s: PlanSelection) => void } | null>(null)
  const onSelectRef = useRef(onSelect)
  const onZonesRef = useRef(onZones)
  const frameRef = useRef(frame)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
    onZonesRef.current = onZones
    frameRef.current = frame
  })

  useEffect(() => {
    const host = hostRef.current
    const tip = tipRef.current
    if (!host || !tip) return
    const dpr = Math.min(window.devicePixelRatio, 2)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(dpr)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.prepend(renderer.domElement)
    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.touchAction = 'none'

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#ffffff')
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe7e2da, 2.3))
    const sun = new THREE.DirectionalLight(0xfffaf3, 1.3)
    sun.castShadow = true
    sun.shadow.mapSize.set(4096, 4096)
    sun.shadow.radius = 5
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.02
    Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 0.5, far: 40 })
    scene.add(sun, sun.target)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 90)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minPolarAngle = THREE.MathUtils.degToRad(2)
    controls.maxPolarAngle = THREE.MathUtils.degToRad(82)
    controls.minZoom = 0.6
    controls.maxZoom = 6
    controls.zoomToCursor = true
    controls.enableZoom = false // колесо листает страницу; включается по клику в модель
    let fit = 13

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const gtao = new GTAOPass(scene, camera, 1, 1)
    gtao.blendIntensity = 0.75
    gtao.updateGtaoMaterial({
      radius: 0.6,
      distanceExponent: 1.2,
      thickness: 1.0,
      scale: 1.2,
      samples: 16,
    })
    gtao.updatePdMaterial({
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 3,
      radius: 6,
      rings: 2,
      samples: 16,
    })
    composer.addPass(gtao)
    const normalTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })
    normalTarget.depthTexture = new THREE.DepthTexture(1, 1, THREE.FloatType)
    const normalMaterial = new THREE.MeshNormalMaterial()
    const edgePass = new ShaderPass(edgeShader)
    edgePass.uniforms.tNormal.value = normalTarget.texture
    edgePass.uniforms.tDepth.value = normalTarget.depthTexture
    edgePass.uniforms.range.value = camera.far - camera.near
    composer.addPass(edgePass)
    composer.addPass(new OutputPass())

    // Текущая рамка модели (анимируется к frameRef). Без рамки — весь холст.
    let cur: PlanRect | null = null
    const targetRect = (): PlanRect =>
      frameRef.current ?? { x: 0, y: 0, w: host.clientWidth, h: host.clientHeight }
    const applyCamera = () => {
      const W = host.clientWidth
      const H = host.clientHeight
      if (!W || !H || !cur) return
      const view = Math.max(fit * 0.72, (fit * 1.15) / (cur.w / cur.h)) // мир по высоте рамки
      const u = view / cur.h // мир на 1 px
      const cx = cur.x + cur.w / 2
      const cy = cur.y + cur.h / 2
      Object.assign(camera, {
        left: -cx * u,
        right: (W - cx) * u,
        top: cy * u,
        bottom: -(H - cy) * u,
      })
      camera.updateProjectionMatrix()
    }
    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return
      cur = targetRect()
      applyCamera()
      renderer.setSize(w, h)
      composer.setSize(w, h)
      gtao.setSize(w * dpr, h * dpr)
      normalTarget.setSize(w * dpr, h * dpr)
      edgePass.uniforms.texel.value.set(0.75 / w, 0.75 / h)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let model: THREE.Object3D | null = null
    let hovered: THREE.Object3D | null = null
    let selected: THREE.Object3D | null = null
    const refresh = () => {
      if (!model) return
      tint(model, 0)
      if (selected) tint(selected, 0.45)
      if (hovered && hovered !== selected) tint(hovered, 0.22)
    }
    apiRef.current = {
      select: ({ zoneKey, itemKey }) => {
        if (!model) return
        const name = itemKey ? `item--${itemKey}` : zoneKey ? `zone--${zoneKey}` : null
        selected = name ? (model.getObjectByName(name) ?? null) : null
        refresh()
      },
    }

    let disposed = false
    new GLTFLoader().load(src, (gltf) => {
      if (disposed) return
      model = gltf.scene
      model.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        const mats = materials(mesh).map((m) => m.clone())
        mesh.material = mats.length === 1 ? mats[0] : mats
        mesh.castShadow = !mats.some((m) => m.transparent)
        mesh.receiveShadow = true
      })
      scene.add(model)
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      fit = Math.max(size.x, size.z)
      const tilt = THREE.MathUtils.degToRad(35)
      const dir = new THREE.Vector3(
        -Math.cos(tilt) * Math.SQRT1_2,
        Math.sin(tilt),
        Math.cos(tilt) * Math.SQRT1_2,
      )
      controls.target.copy(center)
      camera.position.copy(center).addScaledVector(dir, 40)
      sun.position.copy(center).add(new THREE.Vector3(-6, 12, 8))
      sun.target.position.copy(center)
      resize()

      const zones: PlanZone[] = []
      model.traverse((o) => {
        if (!o.name.startsWith('zone--')) return
        const items: PlanItem[] = []
        o.traverse((c) => {
          if (!c.name.startsWith('item--')) return
          const s = new THREE.Box3().setFromObject(c).getSize(new THREE.Vector3())
          const mm = (v: number) => Math.round(v * 100) * 10
          items.push({
            key: keyOf(c),
            title: titleOf(c),
            size: { height: mm(s.y), width: mm(Math.max(s.x, s.z)), depth: mm(Math.min(s.x, s.z)) },
          })
        })
        zones.push({ key: keyOf(o), title: titleOf(o), items })
      })
      onZonesRef.current?.(zones)
      setLoaded(true)
    })

    const ray = new THREE.Raycaster()
    const ptr = new THREE.Vector2()
    const pick = (e: PointerEvent) => {
      if (!model) return null
      const r = canvas.getBoundingClientRect()
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ptr, camera)
      const hit = ray.intersectObject(model, true)[0]
      return hit ? targetOf(hit.object) : null
    }
    const onMove = (e: PointerEvent) => {
      const h = e.buttons ? null : pick(e)
      if (h !== hovered) {
        hovered = h
        refresh()
      }
      canvas.style.cursor = h ? CURSOR : ''
      if (h) {
        tip.textContent = titleOf(h)
        const r = host.getBoundingClientRect()
        const x =
          e.clientX - r.left + 22 + tip.offsetWidth > r.width
            ? e.clientX - r.left - tip.offsetWidth - 12
            : e.clientX - r.left + 22
        tip.style.transform = `translate3d(${x}px, ${e.clientY - r.top + 18}px, 0)`
      }
      tip.style.opacity = h ? '1' : '0'
    }
    const onLeave = () => {
      hovered = null
      tip.style.opacity = '0'
      controls.enableZoom = false
      refresh()
    }
    let downAt: [number, number] | null = null
    const onDown = (e: PointerEvent) => {
      downAt = [e.clientX, e.clientY]
      controls.enableZoom = true
    }
    const onUp = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return // это было вращение
      const t = pick(e)
      let zone: THREE.Object3D | null = t
      while (zone && !zone.name.startsWith('zone--')) zone = zone.parent
      onSelectRef.current({
        zoneKey: zone ? keyOf(zone) : null,
        itemKey: t?.name.startsWith('item--') ? keyOf(t) : null,
      })
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)

    renderer.setAnimationLoop(() => {
      // плавный переезд рамки модели (≈0,4 с)
      const t = targetRect()
      if (
        cur &&
        Math.abs(cur.x - t.x) +
          Math.abs(cur.y - t.y) +
          Math.abs(cur.w - t.w) +
          Math.abs(cur.h - t.h) >
          0.5
      ) {
        const k = 0.14
        cur = {
          x: cur.x + (t.x - cur.x) * k,
          y: cur.y + (t.y - cur.y) * k,
          w: cur.w + (t.w - cur.w) * k,
          h: cur.h + (t.h - cur.h) * k,
        }
        applyCamera()
      }
      controls.update()
      if (!model) return
      const bg = scene.background
      scene.background = null
      scene.overrideMaterial = normalMaterial
      renderer.setRenderTarget(normalTarget)
      renderer.setClearColor(0x000000, 0)
      renderer.clear()
      renderer.render(scene, camera)
      renderer.setRenderTarget(null)
      scene.overrideMaterial = null
      scene.background = bg
      composer.render()
    })

    return () => {
      disposed = true
      ro.disconnect()
      renderer.setAnimationLoop(null)
      controls.dispose()
      composer.dispose()
      normalTarget.dispose()
      renderer.dispose()
      canvas.remove()
      apiRef.current = null
    }
  }, [src])

  useEffect(() => {
    apiRef.current?.select(selection)
  }, [selection, loaded])

  return (
    <div ref={hostRef} className={cn('relative overflow-hidden', className)}>
      <div
        ref={tipRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-bg-cream px-5 py-2.5 text-body-l whitespace-nowrap text-text-primary opacity-0 transition-opacity duration-200"
      />
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center text-caption text-text-secondary">
          Загрузка модели…
        </div>
      )}
    </div>
  )
}
