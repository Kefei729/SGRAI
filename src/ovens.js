// Fornos a lenha e a respetiva pilha de lenha.

// Wood-fired ovens and their firewood stack.
import * as THREE from 'three'
import { addBox, addCylinder, addMesh, cylinderGeometry, seededRandom, sphereGeometry } from './mesh_helpers.js'

// Pilha de lenha como uma única malha instanciada (rápida a desenhar), com variação de tamanho e rotação pela semente.

// Firewood stack as one instanced mesh (fast to render), with seeded size and rotation variation.
function addFirewood(parent, materials, size, definition) {
  const [width, height, depth] = size
  const random = seededRandom(definition.seed)
  const logLength = 0.46
  const baseRadius = 0.05
  const geometry = cylinderGeometry(baseRadius, baseRadius, logLength, 14)
  geometry.rotateZ(Math.PI / 2)
  const instances = []
  let y = 0.11
  for (let row = 0; row < definition.rows && y < height - 0.08; row++) {
    const radius = baseRadius
    const offset = row % 2 ? radius : 0
    for (let z = -depth / 2 + 0.14 + offset; z < depth / 2 - 0.12; z += radius * 2.05) {
      instances.push({ y, z, radius: radius * (0.8 + random() * 0.4), shift: (random() - 0.5) * 0.08, spin: random() * Math.PI * 2 })
    }
    y += radius * 1.75
  }
  const logs = new THREE.InstancedMesh(geometry, [materials.bark, materials.logEnd, materials.logEnd], instances.length)
  logs.name = 'firewood'
  const matrix = new THREE.Matrix4()
  const quaternion = new THREE.Quaternion()
  instances.forEach((log, index) => {
    quaternion.setFromEuler(new THREE.Euler(log.spin, (random() - 0.5) * 0.08, 0))
    matrix.compose(new THREE.Vector3(width / 2 - logLength / 2 - 0.08 + log.shift, log.y, log.z), quaternion, new THREE.Vector3(1, log.radius / baseRadius, log.radius / baseRadius))
    logs.setMatrixAt(index, matrix)
  })
  logs.castShadow = true
  logs.receiveShadow = true
  parent.add(logs)
}

// Forno de cúpula a lenha tradicional (alternativa ao forno de túnel, tipo 'wood-fired-oven').

// Traditional dome wood-fired oven (alternative to the tunnel oven, type 'wood-fired-oven').
export function addOven(group, materials, item, lighting) {
  const [width, height, depth] = item.dimensions
  const base = materials[item.materials.base]
  const domeMaterial = materials[item.materials.dome]

  // Base com arrumação de lenha aberta; o +x local fica virado para a sala e o +z local para o tapete.

  // Plinth with an open firewood store; local +x faces the room, local +z faces the conveyor.
  addBox(group, base, [0, height - 0.05, 0], [width, 0.1, depth])
  addBox(group, base, [0, 0.03, 0], [width, 0.06, depth])
  for (const z of [-depth / 2 + 0.04, depth / 2 - 0.04]) addBox(group, base, [0, height / 2, z], [width, height - 0.1, 0.08])
  addBox(group, base, [-width / 2 + 0.04, height / 2, 0], [0.08, height - 0.1, depth - 0.16])
  addFirewood(group, materials, [width, height - 0.1, depth - 0.16], item.firewood)

  // Soleira e cúpula.

  // Hearth and dome.
  const { radius, heightScale, offsetZ } = item.dome
  const hearthTop = height + 0.15
  addCylinder(group, domeMaterial, [0, height + 0.075, offsetZ], radius + 0.07, radius + 0.09, 0.15, 48)
  const dome = addMesh(group, sphereGeometry(radius, 48, 20, Math.PI / 2), domeMaterial, [0, hearthTop, offsetZ])
  dome.scale.y = heightScale

  // Entrada em arco virada para o tapete.

  // Arched entrance facing the belt.
  const mouthZ = offsetZ + radius - 0.05
  const archRadius = 0.4

  // Meios cilindros rodados -90° em X ficam com a metade de cima e formam os arcos.

  // Half cylinders rotated -90° about X keep their upper half and form the arches.
  addBox(group, domeMaterial, [0, hearthTop + 0.15, mouthZ], [archRadius * 2, 0.3, 0.42])
  addMesh(group, cylinderGeometry(archRadius, archRadius, 0.42, 32, false, -Math.PI / 2, Math.PI), domeMaterial, [0, hearthTop + 0.3, mouthZ], { rotation: [-Math.PI / 2, 0, 0] })
  const front = mouthZ + 0.21
  addBox(group, materials.soot, [0, hearthTop + 0.11, front], [0.52, 0.22, 0.02], { castShadow: false })
  addMesh(group, cylinderGeometry(0.26, 0.26, 0.02, 32, false, -Math.PI / 2, Math.PI), materials.soot, [0, hearthTop + 0.22, front], { rotation: [-Math.PI / 2, 0, 0], castShadow: false })
  addBox(group, materials.embers, [0, hearthTop + 0.035, front + 0.012], [0.44, 0.05, 0.01], { castShadow: false })
  const trim = addMesh(group, new THREE.TorusGeometry(0.28, 0.018, 10, 32, Math.PI), materials.copper, [0, hearthTop + 0.22, front + 0.012])
  trim.castShadow = false
  for (const x of [-0.28, 0.28]) addBox(group, materials.copper, [x, hearthTop + 0.11, front + 0.012], [0.036, 0.22, 0.036])
  addBox(group, materials.steel, [0, hearthTop - 0.02, (front + depth / 2) / 2 + 0.02], [0.6, 0.02, depth / 2 - front + 0.04])

  // Luz laranja do fogo na boca do forno.

  // Orange fire light at the oven mouth.
  const fire = new THREE.PointLight(lighting.ovenFire.color, lighting.ovenFire.intensity, lighting.ovenFire.distance, lighting.ovenFire.decay)
  fire.name = 'oven-fire'
  fire.position.set(0, hearthTop + 0.18, front + 0.25)
  group.add(fire)
  group.userData.fire = fire

  // Chaminé do topo da cúpula até ao teto.

  // Flue from the top of the dome to the ceiling.
  const domeTop = hearthTop + radius * heightScale
  addCylinder(group, materials.steel, [0, domeTop + 0.06, offsetZ], 0.26, 0.3, 0.14, 40)
  addCylinder(group, materials[item.materials.flue], [0, (domeTop + item.flueTop) / 2, offsetZ], 0.17, 0.17, item.flueTop - domeTop, 40)
  addCylinder(group, materials.steel, [0, domeTop + 1.1, offsetZ], 0.19, 0.19, 0.06, 40)
  addCylinder(group, materials.steel, [0, item.flueTop - 0.05, offsetZ], 0.3, 0.3, 0.1, 40)
}

// Forno de túnel rústico em tijolo (forno atual): o tapete atravessa-o e as pizzas saem do outro lado.

// Rustic brick tunnel oven (current oven): the belt runs straight through and pizzas exit on the far side.
export function addTunnelOven(group, materials, item, lighting) {
  const [width, height, depth] = item.dimensions
  const base = materials[item.materials.base]
  const brick = materials[item.materials.brick]
  const trim = materials[item.materials.trim]

  // Base de betão: laje superior, fundo, laterais e traseira.

  // Concrete plinth: top slab, floor, sides and back.
  addBox(group, base, [0, height - 0.05, 0], [width, 0.1, depth])
  addBox(group, base, [0, 0.03, 0], [width, 0.06, depth])
  for (const x of [-width / 2 + 0.04, width / 2 - 0.04]) addBox(group, base, [x, height / 2, 0], [0.08, height - 0.1, depth])
  addBox(group, base, [0, height / 2, -depth / 2 + 0.04], [width - 0.16, height - 0.1, 0.08])

  // A arrumação da lenha abre para a sala (+z), por isso a pilha é construída em x e rodada.

  // Firewood store opens towards the room (+z), so the stack is built along x and turned.
  const woodStore = new THREE.Group()
  woodStore.rotation.y = -Math.PI / 2
  group.add(woodStore)
  addFirewood(woodStore, materials, [depth - 0.08, height - 0.1, width - 0.16], item.firewood)

  // Corpo de tijolo: paredes baixas e abóbada em meio cilindro, envolvidas por cintas de ferro pretas.

  // Brick body: low walls plus a half-cylinder vault, wrapped by black iron bands.
  const body = item.body
  const bodyTop = height + body.wallHeight
  const vaultRadius = body.depth / 2
  addBox(group, brick, [0, height + body.wallHeight / 2, body.centerZ], [body.length, body.wallHeight, body.depth])
  addMesh(group, cylinderGeometry(vaultRadius, vaultRadius, body.length, 40, false, 0, Math.PI), brick, [0, bodyTop, body.centerZ], { rotation: [0, 0, Math.PI / 2] })
  for (let index = 0; index < 4; index++) {
    const x = -body.length / 2 + 0.2 + index * (body.length - 0.4) / 3
    addMesh(group, cylinderGeometry(vaultRadius + 0.015, vaultRadius + 0.015, 0.05, 40, true, 0, Math.PI), materials.blackPaint, [x, bodyTop, body.centerZ], { rotation: [0, 0, Math.PI / 2] })
    for (const side of [-1, 1]) addBox(group, materials.blackPaint, [x, height + body.wallHeight / 2, body.centerZ + side * (vaultRadius + 0.008)], [0.05, body.wallHeight, 0.016])
  }

  // Bocas em arco nas duas pontas (fuligem, brasas, remate de cobre e luz do fogo), alinhadas com o tapete.

  // Arched mouths at both ends (soot, embers, copper trim and fire light), aligned with the belt.
  const beltTop = item.beltTop
  const archWidth = item.archWidth
  for (const side of [-1, 1]) {
    const x = side * (body.length / 2 + 0.011)
    const turn = [0, side * Math.PI / 2, 0]
    const mouth = new THREE.Group()
    mouth.position.set(x, 0, item.tunnelZ)
    mouth.rotation.set(...turn)
    group.add(mouth)
    addBox(mouth, materials.soot, [0, (height + beltTop + 0.25) / 2, 0], [archWidth, beltTop + 0.25 - height, 0.02], { castShadow: false })
    addMesh(mouth, cylinderGeometry(archWidth / 2, archWidth / 2, 0.02, 32, false, -Math.PI / 2, Math.PI), materials.soot, [0, beltTop + 0.25, 0], { rotation: [-Math.PI / 2, 0, 0], castShadow: false })
    addBox(mouth, materials.embers, [0, beltTop + 0.02, 0.012], [archWidth - 0.12, 0.03, 0.01], { castShadow: false })
    addMesh(mouth, new THREE.TorusGeometry(archWidth / 2 + 0.02, 0.02, 10, 32, Math.PI), trim, [0, beltTop + 0.25, 0.015])
    for (const post of [-1, 1]) addBox(mouth, trim, [post * (archWidth / 2 + 0.02), (height + beltTop + 0.25) / 2, 0.015], [0.04, beltTop + 0.25 - height, 0.04])
    const fire = new THREE.PointLight(lighting.ovenFire.color, lighting.ovenFire.intensity, lighting.ovenFire.distance, lighting.ovenFire.decay)
    fire.position.set(0, beltTop + 0.15, 0.25)
    mouth.add(fire)
  }

  // Tapete de malha que leva as pizzas através do forno até um tabuleiro de saída com batente.

  // Mesh belt carrying pizzas through the oven onto an exit tray with a stop.
  const beltLength = item.beltEnd - item.beltStart
  const belt = new THREE.Group()
  belt.name = 'oven-belt'
  belt.position.set((item.beltStart + item.beltEnd) / 2, height, item.tunnelZ)
  group.add(belt)
  addBox(belt, materials.darkSteel, [0, (beltTop - height) / 2, 0], [beltLength, beltTop - height - 0.01, 0.56])
  for (const z of [-0.29, 0.29]) addBox(belt, materials.steel, [0, beltTop - height + 0.01, z], [beltLength, 0.05, 0.02])
  addBox(belt, materials.steel, [beltLength / 2 - 0.01, beltTop - height + 0.03, 0], [0.02, 0.06, 0.6])

  // Colar de cobre e chaminé de aço até ao teto.

  // Copper collar and steel flue up to the ceiling.
  const domeTop = bodyTop + vaultRadius
  addCylinder(group, trim, [0, domeTop + 0.04, body.centerZ], 0.24, 0.28, 0.12, 40)
  addCylinder(group, materials[item.materials.flue], [0, (domeTop + item.flueTop) / 2, body.centerZ], 0.16, 0.16, item.flueTop - domeTop, 40)
  addCylinder(group, materials.steel, [0, item.flueTop - 0.05, body.centerZ], 0.28, 0.28, 0.1, 40)
}
