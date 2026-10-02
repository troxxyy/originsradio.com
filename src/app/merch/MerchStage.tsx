'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import styles from './merch.module.css'

type View = 'Front' | 'Side' | 'Back'
type Controls = { view: (view: View) => void; zoom: (delta: number) => void; reset: () => void; refresh: () => void }

function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    geometries.add(object.geometry)
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material)
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
    }
  })
  geometries.forEach((geometry) => geometry.dispose())
  materials.forEach((material) => material.dispose())
  textures.forEach((texture) => texture.dispose())
}

export default function MerchStage() {
  const mountRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<Controls | null>(null)
  const spinningRef = useRef(false)
  const [spinning, setSpinning] = useState(false)
  const [activeView, setActiveView] = useState<View | null>('Front')
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    } catch {
      setStatus('fallback')
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const environment = new RoomEnvironment()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const environmentMap = pmrem.fromScene(environment, 0.04)
    scene.environment = environmentMap.texture
    scene.environmentIntensity = 0.35
    environment.dispose(); pmrem.dispose()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30)
    const pivot = new THREE.Group()
    scene.add(pivot)
    pivot.rotation.set(0, 0.48, 0)
    scene.add(new THREE.HemisphereLight('#eef3ff', '#737761', 0.6))
    const key = new THREE.DirectionalLight('#ffffff', 1.6)
    key.position.set(-3, 5, 4); scene.add(key)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = key.shadow.camera.bottom = -3
    key.shadow.camera.right = key.shadow.camera.top = 3
    key.shadow.bias = -0.0003
    key.shadow.normalBias = 0.025
    const fill = new THREE.DirectionalLight('#c9dcff', 0.3)
    fill.position.set(3, 1, 2); scene.add(fill)
    const rim = new THREE.DirectionalLight('#fff5d9', 0.8)
    rim.position.set(1, 3, -3); scene.add(rim)
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.15 }))
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.7
    floor.receiveShadow = true
    scene.add(floor)

    let disposed = false, visible = true, frame = 0, lastTime = 0, zoom = 1
    let pointer: { id: number; x: number; y: number; yaw: number; pitch: number } | null = null
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const render = () => { if (!disposed) renderer.render(scene, camera) }
    const animate = (time: number) => {
      frame = 0
      if (disposed || !visible || document.hidden) return
      if (spinningRef.current && !pointer) {
        pivot.rotation.y += Math.min((time - lastTime) / 1000, 0.05) * 0.25
      }
      lastTime = time
      render()
      if (spinningRef.current) frame = requestAnimationFrame(animate)
    }
    const refresh = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      if (disposed || !visible || document.hidden) return
      lastTime = performance.now()
      render()
      if (spinningRef.current) frame = requestAnimationFrame(animate)
    }
    const resize = () => {
      const width = Math.max(mount.clientWidth, 1), height = Math.max(mount.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      const distance = Math.max(4.2, 3.5 / camera.aspect) / zoom
      camera.position.set(0, distance * 0.18, distance)
      camera.lookAt(0, -0.2, 0)
      camera.updateProjectionMatrix()
      refresh()
    }
    const stopSpin = () => {
      spinningRef.current = false; setSpinning(false)
    }
    const view = (name: View) => {
      stopSpin(); setActiveView(name)
      pivot.rotation.set(0, name === 'Front' ? 0.48 : name === 'Side' ? Math.PI / 2 : Math.PI, 0)
      refresh()
    }
    controlsRef.current = {
      view,
      zoom: (delta) => { zoom = THREE.MathUtils.clamp(zoom + delta, 0.8, 1.3); resize() },
      reset: () => { zoom = 1; view('Front'); resize() },
      refresh,
    }
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return
      stopSpin(); setActiveView(null)
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: pivot.rotation.y, pitch: pivot.rotation.x }
      mount.setPointerCapture(event.pointerId)
      mount.dataset.dragging = 'true'
    }
    const move = (event: PointerEvent) => {
      if (!pointer || event.pointerId !== pointer.id) return
      pivot.rotation.y = pointer.yaw + (event.clientX - pointer.x) * 0.009
      if (event.pointerType !== 'touch') pivot.rotation.x = THREE.MathUtils.clamp(pointer.pitch + (event.clientY - pointer.y) * 0.005, -0.4, 0.6)
      refresh()
    }
    const up = () => { pointer = null; delete mount.dataset.dragging }
    const keyboard = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) return
      event.preventDefault(); stopSpin()
      if (event.key === 'Home') view('Front')
      else { setActiveView(null); pivot.rotation.y += event.key === 'ArrowLeft' ? -0.25 : 0.25; refresh() }
    }
    const lost = (event: Event) => {
      event.preventDefault(); disposed = true
      cancelAnimationFrame(frame)
      controlsRef.current = null
      setStatus('fallback')
    }
    const motionChange = () => { if (motion.matches) stopSpin(); refresh() }
    mount.addEventListener('pointerdown', down)
    mount.addEventListener('pointermove', move)
    mount.addEventListener('pointerup', up)
    mount.addEventListener('pointercancel', up)
    mount.addEventListener('lostpointercapture', up)
    mount.addEventListener('keydown', keyboard)
    renderer.domElement.addEventListener('webglcontextlost', lost)
    document.addEventListener('visibilitychange', refresh)
    motion.addEventListener('change', motionChange)
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refresh() }, { threshold: 0.05 })
    intersection.observe(mount)
    resize()
    new GLTFLoader().load('/merch/models/no303-cap.glb?v=campaign-3', ({ scene: model }) => {
      if (disposed) { disposeModel(model); return }
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true
          object.receiveShadow = true
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (material instanceof THREE.MeshStandardMaterial && material.normalMap) {
              material.normalMap.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
            }
          }
        }
      })
      pivot.add(model)
      setStatus('ready')
      refresh()
    }, undefined, () => { if (!disposed) setStatus('fallback') })

    return () => {
      disposed = true
      controlsRef.current = null
      cancelAnimationFrame(frame)
      observer.disconnect(); intersection.disconnect()
      mount.removeEventListener('pointerdown', down); mount.removeEventListener('pointermove', move)
      mount.removeEventListener('pointerup', up); mount.removeEventListener('pointercancel', up)
      mount.removeEventListener('lostpointercapture', up); mount.removeEventListener('keydown', keyboard)
      document.removeEventListener('visibilitychange', refresh); motion.removeEventListener('change', motionChange)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      disposeModel(scene)
      environmentMap.dispose()
      key.shadow.map?.dispose()
      renderer.dispose(); renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  const toggleSpin = () => {
    const next = !spinningRef.current
    spinningRef.current = next; setSpinning(next); setActiveView(null)
    controlsRef.current?.refresh()
  }

  return (
    <div className={styles.viewer} data-testid="merch-viewer" data-state={status}>
      <div className={styles.viewerTop}><span>NO.303 / ACID BASS</span><span className={styles.previewBadge}>360° PREVIEW</span></div>
      <span className={styles.viewerNumber} aria-hidden="true">303</span>
      <div className={styles.stageArea}>
        {status !== 'ready' && <Image src="/merch/no303-cap-campaign.png" alt="Studio render of the cobalt No.303 cap with embroidered smile badge" loading="eager" fill sizes="(max-width: 700px) 100vw, 55vw" className={styles.fallbackImage} />}
        <div ref={mountRef} className={styles.canvasMount} tabIndex={status === 'ready' ? 0 : -1} role="img" aria-label="Interactive blue No.303 cap. Drag horizontally or use left and right arrow keys to rotate. Home resets the view." />
      </div>
      {status === 'ready' ? <>
        <div className={styles.viewerHint}><Maximize2 size={12} /><span>Drag to explore</span><span>Concept preview</span></div>
        <div className={styles.viewerControls}>
          <div className={styles.viewAngles} aria-label="Product angles">
            {(['Front', 'Side', 'Back'] as View[]).map((view) => <button key={view} aria-pressed={activeView === view} onClick={() => controlsRef.current?.view(view)}>{view}</button>)}
          </div>
          <div className={styles.viewerTools}>
            <button onClick={toggleSpin} aria-label={spinning ? 'Pause rotation' : 'Start rotation'} aria-pressed={spinning}>{spinning ? <Pause size={15} /> : <Play size={15} />}</button>
            <button onClick={() => controlsRef.current?.zoom(-0.1)} aria-label="Zoom out"><Minus size={15} /></button>
            <button onClick={() => controlsRef.current?.zoom(0.1)} aria-label="Zoom in"><Plus size={15} /></button>
            <button onClick={() => controlsRef.current?.reset()} aria-label="Reset view"><RotateCcw size={15} /></button>
          </div>
        </div>
      </> : <p className={styles.viewerFallback} role="status">{status === 'loading' ? 'Preparing the preview…' : 'Explore the campaign below. 3D is unavailable in this browser.'}</p>}
    </div>
  )
}
