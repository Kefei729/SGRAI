// Funções auxiliares de geometria e malhas partilhadas pelos equipamentos da cozinha.

// Geometry and mesh helpers shared by the kitchen equipment.
import * as THREE from 'three'

// Reescala as UVs para metros, para que o tileSize de cada material mantenha a densidade da textura igual em todos os objetos.

// Rescales UVs to meters so each material's tileSize keeps the texture density equal on every object.
export function scaleUVs(geometry, scaleFor) {
  const uv = geometry.attributes.uv
  for (let index = 0; index < uv.count; index++) {
    const [su, sv] = scaleFor(index)
    uv.setXY(index, uv.getX(index) * su, uv.getY(index) * sv)
  }
  return geometry
}

// Caixa com UVs em metros (cada face escalada pelo seu tamanho).

// Box with UVs in meters (each face scaled by its own size).
export function boxGeometry(width, height, depth) {
  const faces = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]]
  return scaleUVs(new THREE.BoxGeometry(width, height, depth), (index) => faces[Math.floor(index / 4)])
}

// Cilindro (ou parte de um) com UVs em metros na lateral e nas tampas.

// Cylinder (or part of one) with UVs in meters on the side and caps.
export function cylinderGeometry(radiusTop, radiusBottom, height, segments = 24, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, openEnded, thetaStart, thetaLength)
  const sideCount = (segments + 1) * 2
  const radius = Math.max(radiusTop, radiusBottom)
  return scaleUVs(geometry, (index) => index < sideCount ? [radius * thetaLength, height] : [radius * 2, radius * 2])
}

// Esfera (ou cúpula quando thetaLength < PI) com UVs em metros.

// Sphere (or dome when thetaLength < PI) with UVs in meters.
export function sphereGeometry(radius, widthSegments, heightSegments, thetaLength = Math.PI) {
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, thetaLength)
  return scaleUVs(geometry, () => [Math.PI * 2 * radius, thetaLength * radius])
}

// Cápsula usada nos segmentos dos braços robóticos, com UVs em metros.

// Capsule used for the robot arm links, with UVs in meters.
export function capsuleGeometry(radius, length) {
  const geometry = new THREE.CapsuleGeometry(radius, length, 6, 20)
  return scaleUVs(geometry, () => [Math.PI * 2 * radius, length + radius * 2])
}

// Cria uma malha, posiciona-a, ativa sombras e adiciona-a a um pai.

// Creates a mesh, positions it, enables shadows and adds it to a parent.
export function addMesh(parent, geometry, material, position = [0, 0, 0], options = {}) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  if (options.rotation) mesh.rotation.set(...options.rotation)
  mesh.castShadow = options.castShadow ?? true
  mesh.receiveShadow = options.receiveShadow ?? true
  parent.add(mesh)
  return mesh
}

// Atalho: adiciona uma caixa.

// Shortcut: adds a box.
export function addBox(parent, material, position, size, options = {}) {
  return addMesh(parent, boxGeometry(...size), material, position, options)
}

// Atalho: adiciona um cilindro vertical.

// Shortcut: adds an upright cylinder.
export function addCylinder(parent, material, position, radiusTop, radiusBottom, height, segments = 24, options = {}) {
  return addMesh(parent, cylinderGeometry(radiusTop, radiusBottom, height, segments), material, position, options)
}

// Cilindro deitado ao longo de X ou Z (articulações, rolos, botões).

// Horizontal cylinder along X or Z (joint housings, rollers, knobs).
export function addAxle(parent, material, position, radius, length, axis = 'x', segments = 20) {
  const rotation = axis === 'x' ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]
  return addMesh(parent, cylinderGeometry(radius, radius, length, segments), material, position, { rotation })
}

// Gerador aleatório determinístico: a mesma semente dá o mesmo resultado 'aleatório' em cada carregamento.

// Deterministic random generator: the same seed gives the same 'random' result on every load.
export function seededRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
