// Núcleo do Three.js e extras usados: controlos de câmara, carregadores glTF e HDR, e suporte a luzes de área.

// Three.js core plus the add-ons used: camera controls, glTF and HDR loaders, and area-light support.
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import AssemblyLine from './assembly_line.js'
import WallClock from './wall_clock.js'
import createFloorPlan from './floor_plan.js'
import addEquipment from './equipment.js'
import addKitchenStructure from './room.js'

// Interface da página: canvas da cena 3D, barra superior, legenda da linha de montagem, dicas de controlo e mensagem de carregamento.

// Page interface: canvas for the 3D scene, top bar, assembly-line legend, control hints and loading message.
const app = document.querySelector('#app')
app.innerHTML = `
  <main class="scene-shell">
    <canvas id="scene" aria-label="Interactive 3D view of the LaPrizza kitchen"></canvas>
    <header class="topbar">
      <div class="brand-menu">
        <button class="brand" id="brand-toggle" type="button" aria-label="Open or close the menu" aria-haspopup="menu" aria-expanded="false" aria-controls="brand-menu-list"><span class="brand-mark">L</span><span>LaPrizza <small>OPERATIONS</small></span></button>
        <div class="brand-menu-list" id="brand-menu-list" role="menu" hidden>
          <button class="brand-menu-item" id="reset-camera" type="button" role="menuitem">Reset view</button>
          <button class="brand-menu-item" id="toggle-plan" type="button" role="menuitem">View 2D</button>
        </div>
      </div>
    </header>
    <aside class="legend legend--collapsed">
      <button class="legend-heading" id="legend-toggle" type="button" aria-expanded="false" aria-controls="legend-body">
        ASSEMBLY LINE
        <i class="legend-toggle-icon" aria-hidden="true"></i>
        <b class="visually-hidden">Minimize or expand the assembly line panel</b>
      </button>
      <div class="legend-body" id="legend-body" hidden>
        <div class="legend-row"><i class="legend-dot legend-dot--dough"></i> Overhead crust dispenser</div>
        <div class="legend-row"><i class="legend-dot legend-dot--belt"></i> Conveyor &amp; 4 topping robots</div>
        <div class="legend-row"><i class="legend-dot legend-dot--oven"></i> Wood-fired tunnel oven</div>
        <div class="legend-divider"></div>
        <div class="legend-meta"><span>FLOOR AREA</span><b id="floor-area"></b></div>
        <div class="legend-meta"><span>MEASUREMENT</span><b>1 unit = 1 m</b></div>
      </div>
    </aside>
    <footer class="control-bar">
      <div class="control-instructions">
        <span class="control-icon">↔</span><span><b>Pan</b> <i>Left drag</i></span>
        <span class="control-separator"></span>
        <span class="control-icon control-icon--orbit">⟳</span><span><b>Orbit</b> <i>Right drag</i></span>
        <span class="control-separator"></span>
        <span class="control-icon">⌕</span><span><b>Zoom</b> <i>Scroll</i></span>
      </div>
    </footer>
    <div class="loading-message" role="status">Preparing the kitchen…</div>
  </main>
`

// Referências ao canvas e à mensagem de carregamento.

// References to the canvas and the loading message.
const canvas = document.querySelector('#scene')
const loadingMessage = document.querySelector('.loading-message')

// Painel da legenda minimizável; a página abre sempre com ele minimizado.

// Collapsible legend panel; the page always opens with it minimized.
const legend = document.querySelector('.legend')
const legendToggle = document.querySelector('#legend-toggle')

// Mostra ou esconde o conteúdo da legenda e atualiza o estado do botão para leitores de ecrã.

// Shows or hides the legend body and updates the button state for screen readers.
function setLegendCollapsed(collapsed) {
  legend.classList.toggle('legend--collapsed', collapsed)
  legendToggle.setAttribute('aria-expanded', String(!collapsed))
  document.querySelector('#legend-body').hidden = collapsed
}
setLegendCollapsed(true)

// Alterna o painel ao clicar.

// Toggles the panel on click.
legendToggle.addEventListener('click', () => {
  setLegendCollapsed(!legend.classList.contains('legend--collapsed'))
})

// Menu do logótipo: o logótipo abre-o ou fecha-o; escolher uma opção, clicar fora ou carregar em Escape fecha-o.

// Logo menu: the logo opens or closes it; choosing an option, clicking elsewhere or pressing Escape closes it.
const brandToggle = document.querySelector('#brand-toggle')
const brandMenuList = document.querySelector('#brand-menu-list')
function setBrandMenuOpen(open) {
  brandMenuList.hidden = !open
  brandToggle.setAttribute('aria-expanded', String(open))
}
brandToggle.addEventListener('click', () => setBrandMenuOpen(brandMenuList.hidden))
brandMenuList.addEventListener('click', () => setBrandMenuOpen(false))
document.addEventListener('click', (event) => {
  if (!event.target.closest('.brand-menu')) setBrandMenuOpen(false)
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !brandMenuList.hidden) {
    setBrandMenuOpen(false)
    brandToggle.focus()
  }
})

// Carrega o JSON do layout da cozinha (dimensões, materiais, equipamentos, modelos, luzes, câmara).

// Loads the kitchen layout JSON (dimensions, materials, equipment, models, lights, camera).
async function fetchLayout() {
  let response = await fetch('./public/kitchen-layout.json')
  if (!response.ok) response = await fetch('./kitchen-layout.json')
  if (!response.ok) throw new Error(`Kitchen layout request failed: ${response.status}`)
  return response.json()
}

// Cria o renderizador WebGL; se o WebGL não estiver disponível, é mostrada uma planta 2D.

// Creates the WebGL renderer; if WebGL is unavailable, a 2D floor plan is shown instead.
let renderer = null
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
} catch (error) {
  console.error('WebGL is unavailable. Showing the kitchen floor-plan fallback.', error)
  canvas.hidden = true
  document.querySelector('.scene-shell').classList.add('scene-shell--plan')
}

// Tudo o que segue constrói e desenha a cena 3D (só quando o WebGL funciona).

// Everything below builds and renders the 3D scene (only when WebGL works).
if (renderer) {
// Configuração do renderizador: densidade de píxeis limitada, sombras, saída sRGB, tone mapping fílmico e suporte a luzes de área.

// Renderer settings: capped pixel ratio, shadows, sRGB output, filmic tone mapping and area-light support.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.1
RectAreaLightUniformsLib.init()

// O canvas fica escondido até a cena estar totalmente carregada.

// The canvas stays hidden until the scene has fully loaded.
canvas.style.visibility = 'hidden'

// Cena com cor de fundo neutra.

// Scene with a neutral background colour.
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xe9e6e0)

// Câmara em perspetiva e controlos de órbita: botão esquerdo desloca, botão direito roda, a roda faz zoom, com amortecimento para um movimento suave.

// Perspective camera and orbit controls: left drag pans, right drag orbits, wheel zooms, with damping for smooth motion.
const camera = new THREE.PerspectiveCamera()
camera.near = 0.05
camera.far = 120
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.08
controls.rotateSpeed = 0.7
controls.panSpeed = 0.8
controls.zoomSpeed = 0.9
controls.screenSpacePanning = true
controls.mouseButtons.LEFT = THREE.MOUSE.PAN
controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE
controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY

// Limites de deslocamento e vista inicial (preenchidos com as definições de câmara do JSON).

// Pan limits and initial view (filled in from the camera settings in the JSON).
const panMin = new THREE.Vector3()
const panMax = new THREE.Vector3()
const initialView = { position: new THREE.Vector3(), target: new THREE.Vector3() }

// Carregadores e caches: cada imagem e ficheiro glTF é descarregado uma vez e reutilizado.

// Loaders and caches: each image and glTF file is downloaded once and reused.
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const imageCache = new Map()
const gltfCache = new Map()
const textureFailureMessages = []

// Objetos do teto (escondidos quando a câmara está acima do teto) e relógios de parede atualizados em cada frame.

// Ceiling objects (hidden when the camera is above the ceiling) and wall clocks updated every frame.
const ceilingGroup = new THREE.Group()
let assemblyLine = null
let kitchenLayout = null
const clocks = []
let wallHeight = 0

// Carrega uma textura de imagem uma vez (em cache) e devolve uma cópia por material com o espaço de cor e a repetição corretos.

// Loads an image texture once (cached) and returns a per-material copy with the right colour space and wrapping.
function loadImageTexture(url, colorMap) {
  if (!imageCache.has(url)) {
    imageCache.set(url, textureLoader.loadAsync(url).catch((error) => {
      textureFailureMessages.push(`Texture could not be loaded: ${url}`)
      console.error(`Texture could not be loaded: ${url}`, error)
      return null
    }))
  }
  return imageCache.get(url).then((source) => {
    if (!source) return null

    // Cada material tem a sua própria Texture (mesma imagem) para a repetição/deslocamento poderem ser diferentes.

    // Each material gets its own Texture (same image) so repeat/offset can differ.
    const texture = source.clone()
    texture.colorSpace = colorMap ? THREE.SRGBColorSpace : THREE.NoColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)
    texture.needsUpdate = true
    return texture
  })
}

// Cria um material PBR a partir de uma definição do JSON (os mapas são adicionados depois, quando carregados).

// Creates a PBR material from a JSON definition (maps are added later, once loaded).
function createMaterial(definition) {
  return new THREE.MeshStandardMaterial({
    color: definition.color,
    roughness: definition.roughness,
    metalness: definition.metalness,
    normalScale: new THREE.Vector2(...(definition.normalScale ?? [0.35, 0.35])),
    emissive: definition.emissive ?? 0x000000,
    emissiveIntensity: definition.emissiveIntensity ?? 1,
    transparent: definition.transparent ?? false,
    opacity: definition.opacity ?? 1,
    depthWrite: !(definition.transparent ?? false),
    side: definition.side === 'back' ? THREE.BackSide : definition.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  })
}

// Carrega os mapas de cor/rugosidade/normal de um material e define a repetição a partir do tileSize.

// Loads a material's colour/roughness/normal maps and sets their repeat from tileSize.
async function applyMaterialMaps(material, definition) {
  const [tileU, tileV] = definition.tileSize ?? [1, 1]
  const slots = { color: 'map', roughness: 'roughnessMap', normal: 'normalMap', bump: 'bumpMap' }
  await Promise.all(Object.entries(definition.maps).map(async ([kind, url]) => {
    const texture = await loadImageTexture(url, kind === 'color')
    if (!texture) return
    texture.repeat.set(1 / tileU, 1 / tileV)
    material[slots[kind]] = texture
  }))
  material.needsUpdate = true
}

// Carrega um modelo glTF uma vez e guarda a promessa em cache.

// Loads a glTF model once and caches the promise.
function loadGltf(url) {
  if (!gltfCache.has(url)) gltfCache.set(url, gltfLoader.loadAsync(url))
  return gltfCache.get(url)
}

// Carrega os modelos glTF importados e coloca cada cópia listada em 'props' (pizzas, luzes, tachos, relógio...).

// Loads the imported glTF models and places every copy listed in 'props' (pizzas, lights, pots, clock...).
async function addProps(layout) {
  const props = new THREE.Group()
  props.name = 'imported-props'
  scene.add(props)
  const results = await Promise.allSettled(Object.entries(layout.models).map(async ([name, model]) => [name, await loadGltf(model.url)]))
  const loaded = new Map()

  // Guarda os modelos carregados; faz as lâmpadas fluorescentes brilhar usando o mapa emissivo.

  // Keeps the models that loaded; makes the fluorescent tubes glow using their emissive map.
  results.forEach((result, index) => {
    const [name, model] = Object.entries(layout.models)[index]
    if (result.status === 'fulfilled') {
      loaded.set(name, result.value[1])
      if (model.emissive) {
        result.value[1].scene.traverse((object) => {
          if (object.isMesh && object.material.emissiveMap) {
            object.material.emissive.set(model.emissive.color)
            object.material.emissiveIntensity = model.emissive.intensity
          }
        })
      }
    } else {
      console.error(`Model could not be loaded: ${model.url}`, result.reason)
    }
  })

  // Modelos marcados "instanced" (ex.: caixas de pizza) são desenhados como uma InstancedMesh por peça, em vez de muitas cópias.

  // Models flagged "instanced" (e.g. pizza boxes) are drawn as one InstancedMesh per part instead of many copies.
  const instancedParts = new Map()

  // Clona o modelo (ou um nó com nome), escala-o, opcionalmente pousa-o na superfície e posiciona-o.

  // Clones the model (or one named node), scales it, optionally sits it on the surface and positions it.
  for (const placement of layout.props.flatMap(expandStack)) {
    const gltf = loaded.get(placement.model)
    if (!gltf) continue
    const model = layout.models[placement.model]
    const source = placement.node ? gltf.scene.getObjectByName(placement.node) : gltf.scene
    if (!source) {
      console.warn(`Node "${placement.node}" not found in ${model.url}`)
      continue
    }
    const instance = source.clone()
    instance.position.set(0, 0, 0)

    // Ajusta peças do modelo com nome, ex.: fecha a tampa da caixa de pizza (no modelo vem aberta).

    // Adjusts named parts of the model, e.g. closes the pizza box lid (it comes open in the model).
    for (const [name, pose] of Object.entries(model.nodeOverrides ?? {})) {
      const part = instance.getObjectByName(name)
      if (!part) continue
      if (pose.position) part.position.set(...pose.position)
      if (pose.rotation) part.rotation.set(...pose.rotation)
    }
    const wrapper = model.clockHands ? new WallClock(instance, model.clockHands) : new THREE.Group().add(instance)
    wrapper.scale.setScalar((model.scale ?? 1) * placement.scale)
    if (model.align === 'bottom') {
      const bounds = new THREE.Box3().setFromObject(wrapper)
      instance.position.y -= bounds.min.y / wrapper.scale.y
    }
    wrapper.position.set(...placement.position)
    wrapper.rotation.set(...placement.rotation)

    // Modelos instanciados: guarda a matriz final de cada peça; as InstancedMesh são criadas depois do ciclo.

    // Instanced models: store each part's final matrix; the InstancedMeshes are built after the loop.
    if (model.instanced) {
      wrapper.updateMatrixWorld(true)
      wrapper.traverse((object) => {
        if (!object.isMesh) return
        const key = `${object.geometry.uuid}/${object.material.uuid}`
        if (!instancedParts.has(key)) instancedParts.set(key, { mesh: object, matrices: [] })
        instancedParts.get(key).matrices.push(object.matrixWorld.clone())
      })
      continue
    }
    const ceilingMounted = placement.mount === 'ceiling'
    wrapper.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = !ceilingMounted
        object.receiveShadow = true
      }
    })

    // Guarda os relógios para o ciclo de desenho os atualizar.

    // Keeps the clocks so the render loop can update them.
    if (model.clockHands) clocks.push(wrapper)
    ;(ceilingMounted ? ceilingGroup : props).add(wrapper)
  }

  // Uma InstancedMesh por peça do modelo (ex.: todas as bases das caixas numa só chamada de desenho, todas as tampas noutra).

  // One InstancedMesh per model part (e.g. all box bases in one draw call, all lids in another).
  for (const { mesh, matrices } of instancedParts.values()) {
    const batch = new THREE.InstancedMesh(mesh.geometry, mesh.material, matrices.length)
    matrices.forEach((matrix, index) => batch.setMatrixAt(index, matrix))
    batch.castShadow = true
    batch.receiveShadow = true
    props.add(batch)
  }
}

// Expande uma colocação com "stack" numa colocação por item, cada uma um pouco mais acima e ligeiramente desalinhada (como na pilha de caixas do LaPrizza).

// Expands a "stack" placement into one placement per item, each a little higher and slightly misaligned (as in LaPrizza's box stack).
function expandStack(placement) {
  const stack = placement.stack
  if (!stack) return [placement]
  const [x, y, z] = placement.position
  const [rotationX, rotationY, rotationZ] = placement.rotation
  return Array.from({ length: stack.count }, (_, index) => ({
    ...placement,
    position: [x, y + index * stack.spacing, z],
    rotation: [rotationX, rotationY + (((index + (stack.seed ?? 0)) * 37) % 9 - 4) * (stack.twist ?? 0.02), rotationZ],
  }))
}

// Iluminação (US5): luz ambiente + hemisférica para visibilidade base em qualquer vista.

// Lighting (US5): ambient + hemisphere light for base visibility in every view.
function addLighting(layout) {
  const lighting = layout.lighting
  scene.add(new THREE.AmbientLight(lighting.ambient.color, lighting.ambient.intensity))
  scene.add(new THREE.HemisphereLight(lighting.hemisphere.skyColor, lighting.hemisphere.groundColor, lighting.hemisphere.intensity))

  // Spotlight principal sobre a linha de montagem: a única luz com sombras, para manter o desempenho estável.

  // Key spotlight over the assembly line: the only light with shadows, to keep performance stable.
  const spot = lighting.spotlight
  const keyLight = new THREE.SpotLight(spot.color, spot.intensity, spot.distance, spot.angle, spot.penumbra, spot.decay)
  keyLight.position.set(...spot.position)
  keyLight.target.position.set(...spot.target)
  keyLight.castShadow = spot.castShadow
  keyLight.shadow.mapSize.set(spot.shadowMapSize, spot.shadowMapSize)
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 14
  keyLight.shadow.bias = spot.shadowBias
  keyLight.shadow.normalBias = spot.shadowNormalBias
  scene.add(keyLight, keyLight.target)

  // Luz direcional suave de preenchimento (sem sombras) para definir contornos.

  // Soft directional fill light (no shadows) to define contours.
  const fill = new THREE.DirectionalLight(lighting.fill.color, lighting.fill.intensity)
  fill.position.set(...lighting.fill.position)
  scene.add(fill)

  // Luzes de área suaves alinhadas com as filas de lâmpadas fluorescentes (sem sombras, leves de desenhar).

  // Soft area lights matching the rows of fluorescent fixtures (no shadows, cheap to render).
  const strips = lighting.ceilingStrips
  for (const z of strips.rows) {
    const strip = new THREE.RectAreaLight(strips.color, strips.intensity, strips.width, strips.height)
    strip.position.set(0, strips.y, z)
    strip.lookAt(0, 0, z)
    scene.add(strip)
  }

  // Luz de área fraca virada para cima, a simular a luz refletida do chão para o teto branco.

  // Faint upward area light simulating light bounced off the floor onto the white ceiling.
  const bounce = lighting.ceilingBounce
  if (bounce) {
    const ceilingFill = new THREE.RectAreaLight(bounce.color, bounce.intensity, bounce.width, bounce.height)
    ceilingFill.position.set(0, bounce.y, 0)
    ceilingFill.lookAt(0, wallHeight, 0)
    scene.add(ceilingFill)
  }
}

// Carrega o mapa de ambiente HDR, usado só para reflexos (metal) e não como fundo.

// Loads the HDR environment map, used only for reflections (metal), not as background.
function loadEnvironment(layout) {
  if (!layout.environment?.url) return
  const pmrem = new THREE.PMREMGenerator(renderer)
  return new HDRLoader().loadAsync(layout.environment.url).then((hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = pmrem.fromEquirectangular(hdr).texture
    scene.environmentIntensity = layout.environment.intensity
    hdr.dispose()
    pmrem.dispose()
  }).catch((error) => {
    console.error(`Environment map could not be loaded: ${layout.environment.url}`, error)
  })
}

// Aplica as definições de câmara do JSON: vista inicial (alvo = centro do chão), limites de zoom/ângulo e de deslocamento.

// Applies the JSON camera settings: initial view (target = floor centre), zoom/angle limits and pan bounds.
function configureCamera(layout) {
  const settings = layout.camera
  camera.fov = settings.fov
  initialView.position.set(...settings.position)
  initialView.target.set(...settings.target)
  camera.position.copy(initialView.position)
  controls.target.copy(initialView.target)

  // Vista opcional partilhável no URL: #view=camX,camY,camZ,alvoX,alvoY,alvoZ

  // Optional shareable view in the URL: #view=camX,camY,camZ,targetX,targetY,targetZ
  const sharedView = location.hash.match(/view=([-\d.,]+)/)?.[1].split(',').map(Number)
  if (sharedView?.length === 6 && sharedView.every(Number.isFinite)) {
    camera.position.set(...sharedView.slice(0, 3))
    controls.target.set(...sharedView.slice(3))
  }
  controls.minDistance = settings.minDistance
  controls.maxDistance = settings.maxDistance
  controls.minPolarAngle = Math.PI * settings.minPolarAngle
  controls.maxPolarAngle = Math.PI * settings.maxPolarAngle
  panMin.set(...settings.panBounds.min)
  panMax.set(...settings.panBounds.max)
  camera.updateProjectionMatrix()
  controls.update()
}

// Constrói a cena completa a partir do JSON: câmara, ambiente, materiais, sala, luzes, equipamentos, modelos e texturas.

// Builds the whole scene from the JSON: camera, environment, materials, room, lights, equipment, models and textures.
async function buildKitchen() {
  try {
    const layout = await fetchLayout()
    document.querySelector('#floor-area').textContent = `${layout.kitchen.width * layout.kitchen.depth} m²`
    configureCamera(layout)
    const environmentLoad = loadEnvironment(layout)

    const materials = Object.fromEntries(
      Object.entries(layout.materials).map(([name, definition]) => [name, createMaterial(definition)]),
    )
    wallHeight = layout.kitchen.wallHeight
    addKitchenStructure(scene, ceilingGroup, materials, layout)
    addLighting(layout)

    // Equipamentos do JSON (a linha de montagem tem a sua própria função).

    // Equipment from the JSON (the assembly line has its own builder).
    const equipmentGroup = new THREE.Group()
    equipmentGroup.name = 'equipment'
    scene.add(equipmentGroup)
    for (const item of layout.equipment) {
      let object
      if (item.type === 'assembly-line') {
        assemblyLine = new AssemblyLine(materials, item)
        equipmentGroup.add(assemblyLine)
        object = assemblyLine
      } else {
        object = addEquipment(equipmentGroup, materials, item, layout.lighting)
      }

      // Cada item fica em scene.userData para as partes animadas serem fáceis de aceder no Sprint 3.

      // Each item is kept in scene.userData so animated parts are easy to reach in Sprint 3.
      scene.userData[item.id] = object
    }

    // Espera pelos modelos, pelas texturas e pelo HDRI; um ficheiro que falhe não impede a cena de aparecer.

    // Waits for the models, textures and HDRI; a file that fails does not stop the scene from appearing.
    const textureLoads = Object.entries(layout.materials).map(([name, definition]) => applyMaterialMaps(materials[name], definition))
    await Promise.all([
      addProps(layout).catch((error) => console.error('Unable to place imported models.', error)),
      Promise.all(textureLoads).catch((error) => console.error('Unable to apply kitchen surface textures.', error)),
      environmentLoad,
    ])

    // Aparece um aviso se algum mapa de textura falhar.

    // A warning appears if any texture map fails.
    if (textureFailureMessages.length > 0) {
      const warning = document.createElement('p')
      warning.className = 'texture-warning'
      warning.setAttribute('role', 'status')
      warning.textContent = `${textureFailureMessages.length} surface map(s) could not be loaded. See the browser console for details.`
      document.querySelector('.scene-shell').append(warning)
    }

    // Prepara a cena na placa gráfica e só depois a mostra, para evitar um bloqueio na primeira imagem.

    // Prepares the scene on the graphics card and only then shows it, to avoid a stall on the first frame.
    await renderer.compileAsync(scene, camera).catch((error) => console.error('Unable to prepare the scene for rendering.', error))
    kitchenLayout = layout
    loadingMessage.remove()
    canvas.style.visibility = ''
  } catch (error) {
    // Mostra uma mensagem de erro se a cena não puder ser construída.

    // Shows an error message if the scene cannot be built.
    console.error('Unable to build the LaPrizza kitchen scene.', error)
    loadingMessage.textContent = 'The kitchen could not be loaded. Check the layout file and refresh to try again.'
    loadingMessage.classList.add('loading-message--error')
    throw error
  }
}

// Mantém o tamanho do canvas e a proporção da câmara de acordo com a janela.

// Keeps the canvas size and camera aspect in sync with the window.
function resize() {
  const { clientWidth, clientHeight } = canvas.parentElement
  camera.aspect = clientWidth / clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(clientWidth, clientHeight, false)
}

window.addEventListener('resize', resize)
resize()

// Alterna entre a cena 3D e a planta 2D; a planta é construída na primeira vez que é aberta.

// Switches between the 3D scene and the 2D floor plan; the plan is built the first time it is opened.
const sceneShell = document.querySelector('.scene-shell')
const togglePlanButton = document.querySelector('#toggle-plan')
let floorPlan = null
let planVisible = false
function setPlanVisible(visible) {
  if (!kitchenLayout) return
  if (visible && !floorPlan) {
    floorPlan = createFloorPlan(kitchenLayout)
    sceneShell.insertBefore(floorPlan, document.querySelector('.topbar'))
  }
  planVisible = visible
  if (floorPlan) floorPlan.hidden = !visible
  sceneShell.classList.toggle('scene-shell--plan', visible)
  canvas.style.visibility = visible ? 'hidden' : ''
  document.querySelector('.control-instructions').hidden = visible
  togglePlanButton.textContent = visible ? 'View 3D' : 'View 2D'
}
togglePlanButton.addEventListener('click', () => setPlanVisible(!planVisible))

// Opção 'Reset view': mostra a cena 3D e devolve a câmara à vista inicial.

// 'Reset view' option: shows the 3D scene and returns the camera to the initial view.
document.querySelector('#reset-camera').addEventListener('click', () => {
  setPlanVisible(false)
  camera.position.copy(initialView.position)
  controls.target.copy(initialView.target)
  controls.update()
})

// Mantém o alvo da câmara dentro da cozinha ao deslocar (a câmara move-se com ele).

// Keeps the camera target inside the kitchen while panning (the camera moves with it).
const clampedTarget = new THREE.Vector3()
function keepTargetInKitchen() {
  clampedTarget.copy(controls.target).clamp(panMin, panMax)
  if (!clampedTarget.equals(controls.target)) {
    camera.position.add(clampedTarget.clone().sub(controls.target))
    controls.target.copy(clampedTarget)
  }
}

// Constrói a cozinha e depois corre o ciclo de desenho em cada frame.

// Builds the kitchen, then runs the render loop every frame.
async function start() {
  await buildKitchen()
  let previousTime = performance.now()
  function render() {
    const currentTime = performance.now()
    const deltaT = (currentTime - previousTime) / 1000
    previousTime = currentTime
    controls.update()
    keepTargetInKitchen()
    for (const clock of clocks) clock.update()
    assemblyLine?.update(deltaT)

    // Esconde o teto quando se olha de cima, para a vista em corte ficar legível.

    // Hides the ceiling when looking from above so the cut-away view stays readable.
    ceilingGroup.visible = camera.position.y < wallHeight
    if (!planVisible) renderer.render(scene, camera)
    requestAnimationFrame(render)
  }
  render()
}

// Inicia a cena e regista qualquer erro de arranque.

// Starts the scene and logs any startup error.
start().catch((error) => {
  console.error('The kitchen scene failed to start.', error)
})
} else {
  // Alternativa sem WebGL: desenha uma planta 2D vista de cima (SVG) a partir do mesmo JSON.

  // Fallback without WebGL: draws a top-down 2D floor plan (SVG) from the same JSON.
  async function showKitchenFallback() {
    try {
      const layout = await fetchLayout()
      document.querySelector('.scene-shell').insertBefore(createFloorPlan(layout), document.querySelector('.topbar'))
      document.querySelector('#brand-toggle').disabled = true
      loadingMessage.remove()

      // Aviso a explicar como ativar a vista 3D.

      // Notice explaining how to enable the 3D view.
      const notice = document.createElement('div')
      notice.className = 'fallback-notice'
      notice.setAttribute('role', 'status')
      notice.textContent = 'Showing the kitchen plan. Enable hardware acceleration in your browser and reload for the interactive 3D view.'
      document.querySelector('.scene-shell').append(notice)
      document.querySelector('.control-instructions').hidden = true
    } catch (error) {
      console.error('Unable to show the kitchen floor-plan fallback.', error)
      loadingMessage.textContent = 'WebGL is unavailable and the kitchen layout could not be loaded.'
      loadingMessage.classList.add('loading-message--error')
    }
  }
  showKitchenFallback()
}
