// Linha de montagem automática: constrói a bancada, o dispensador, o tapete, as pizzas e os robôs, e guarda as partes animáveis como propriedades.

// Automated assembly line: builds the counter, dispenser, conveyor, pizzas and robots, and keeps the animatable parts as properties.
import * as THREE from 'three'
import { addAxle, addBox, addCylinder, addMesh, capsuleGeometry, cylinderGeometry, scaleUVs, seededRandom } from './mesh_helpers.js'

// Bancada no estilo da referência: laje grossa de betão sobre pórticos de aço branco.

// Counter in the reference style: thick concrete slab on white steel portal frames.
function addSlabCounter(parent, materials, size, slabMaterial, frameMaterial, spacing) {
  const [width, height, depth] = size
  const slab = 0.1
  addBox(parent, slabMaterial, [0, height - slab / 2, 0], [width, slab, depth])
  const frames = Math.max(2, Math.round(width / spacing) + 1)
  for (let index = 0; index < frames; index++) {
    const x = -width / 2 + 0.12 + index * (width - 0.24) / (frames - 1)
    for (const z of [-depth / 2 + 0.12, depth / 2 - 0.12]) {
      addBox(parent, frameMaterial, [x, (height - slab) / 2, z], [0.05, height - slab, 0.05])
    }
    addBox(parent, frameMaterial, [x, height - slab - 0.03, 0], [0.05, 0.05, depth - 0.2])
  }
  for (const z of [-depth / 2 + 0.12, depth / 2 - 0.12]) {
    addBox(parent, frameMaterial, [0, 0.22, z], [width - 0.24, 0.04, 0.04])
  }
}

// Pizza procedimental numa fase da montagem: massa, massa + molho, ou massa + molho + queijo.

// Procedural pizza at an assembly stage: dough, dough + sauce, or dough + sauce + cheese.
function addPizzaBase(parent, materials, position, stage) {
  const pizza = new THREE.Group()
  pizza.position.set(...position)
  pizza.rotation.y = position[0] * 1.7
  parent.add(pizza)
  const profile = [[0, 0], [0.14, 0], [0.151, 0.004], [0.155, 0.012], [0.151, 0.02], [0.14, 0.023], [0.13, 0.014], [0.0, 0.011]]
  const lathe = scaleUVs(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 40), () => [0.97, 0.2])
  addMesh(pizza, lathe, materials.dough)
  if (stage === 'sauce' || stage === 'cheese') {
    addCylinder(pizza, materials.sauce, [0, 0.012, 0], 0.128, 0.128, 0.004, 40)
  }
  if (stage === 'cheese') {
    const random = seededRandom(Math.round(position[0] * 1000))
    addCylinder(pizza, materials.cheese, [0, 0.0145, 0], 0.112, 0.118, 0.004, 40)
    for (let index = 0; index < 9; index++) {
      const angle = random() * Math.PI * 2
      const radius = 0.03 + random() * 0.08
      addCylinder(pizza, materials.cheese, [Math.cos(angle) * radius, 0.017, Math.sin(angle) * radius], 0.02, 0.026, 0.006, 12)
    }
  }
  return pizza
}

// Recipiente de inox ao lado de cada robô (molho, queijo, pepperoni ou manjericão).

// Stainless ingredient pan next to each robot (sauce, cheese, pepperoni or basil).
function addIngredientBin(parent, materials, position, ingredient) {
  const bin = new THREE.Group()
  bin.position.set(...position)
  parent.add(bin)
  addBox(bin, materials.steel, [0, 0.005, 0], [0.34, 0.01, 0.3])
  for (const [x, z, w, d] of [[-0.165, 0, 0.01, 0.3], [0.165, 0, 0.01, 0.3], [0, -0.145, 0.34, 0.01], [0, 0.145, 0.34, 0.01]]) {
    addBox(bin, materials.steel, [x, 0.06, z], [w, 0.12, d])
  }
  const random = seededRandom(ingredient.length * 97)
  if (ingredient === 'pepperoni' || ingredient === 'basil') {
    addBox(bin, materials[ingredient === 'basil' ? 'basil' : 'pepperoni'], [0, 0.05, 0], [0.31, 0.08, 0.27])
    for (let index = 0; index < 14; index++) {
      const x = (random() - 0.5) * 0.26
      const z = (random() - 0.5) * 0.22
      const radius = ingredient === 'basil' ? 0.018 : 0.022
      addCylinder(bin, materials[ingredient], [x, 0.094, z], radius, radius, 0.006, 14).rotation.set((random() - 0.5) * 0.5, 0, (random() - 0.5) * 0.5)
    }
  } else {
    addBox(bin, materials[ingredient], [0, 0.05, 0], [0.31, 0.09, 0.27])
  }
  return bin
}

// Cinemática inversa: calcula os ângulos do ombro, cotovelo e pulso para a ferramenta apontar para baixo em (alcance, altura da ponta).

// Inverse kinematics: finds the shoulder, elbow and wrist angles so the tool points straight down at (reach, tipHeight).
function solveArmPose({ shoulderHeight, upperArm, forearm, tool }, reach, tipHeight) {
  const wristZ = reach
  const wristY = tipHeight + tool - shoulderHeight
  const distance = THREE.MathUtils.clamp(Math.hypot(wristZ, wristY), Math.abs(upperArm - forearm) + 0.01, upperArm + forearm - 0.01)
  const phi = Math.atan2(wristY, wristZ)
  const alpha = Math.acos((upperArm ** 2 + distance ** 2 - forearm ** 2) / (2 * upperArm * distance))
  const elevation = phi + alpha
  const shoulder = Math.PI / 2 - elevation
  const elbowZ = upperArm * Math.cos(elevation)
  const elbowY = upperArm * Math.sin(elevation)
  const forearmAngle = Math.atan2(wristZ - elbowZ, wristY - elbowY)
  return { shoulder, elbow: forearmAngle - shoulder, wrist: Math.PI - forearmAngle }
}

// Braço robótico articulado: base > torre > ombro > cotovelo > pulso > ferramenta. Cada articulação é um grupo para poder ser animada.

// Articulated robot arm: base > turret > shoulder > elbow > wrist > tool. Each joint is a group so it can be animated.
function addRobotArm(parent, materials, definition, dimensions, baseHeight) {
  const arm = new THREE.Group()
  arm.name = definition.id
  arm.position.set(definition.x, baseHeight, definition.z)
  parent.add(arm)
  const white = materials.robotWhite
  const dark = materials.blackPaint

  addCylinder(arm, dark, [0, 0.03, 0], 0.17, 0.18, 0.06, 32)
  addCylinder(arm, white, [0, 0.13, 0], 0.13, 0.15, 0.14, 32)

  // Torre: roda em Y para orientar o braço.

  // Turret: rotates around Y to aim the arm.
  const turret = new THREE.Group()
  turret.name = `${definition.id}-turret`
  turret.position.y = 0.2
  turret.rotation.y = definition.yaw ?? 0
  arm.add(turret)
  addCylinder(turret, white, [0, 0.05, 0], 0.12, 0.13, 0.1, 32)
  addBox(turret, white, [0, 0.11, -0.02], [0.2, 0.08, 0.2])

  // Articulação do ombro e braço superior.

  // Shoulder joint and upper arm.
  const shoulder = new THREE.Group()
  shoulder.name = `${definition.id}-shoulder`
  shoulder.position.y = dimensions.shoulderHeight - 0.2
  turret.add(shoulder)
  addAxle(shoulder, white, [0, 0, 0], 0.1, 0.22, 'x', 28)
  addAxle(shoulder, dark, [0, 0, 0], 0.062, 0.27, 'x', 24)
  addMesh(shoulder, capsuleGeometry(0.066, dimensions.upperArm - 0.13), white, [0, dimensions.upperArm / 2, 0])

  // Articulação do cotovelo e antebraço.

  // Elbow joint and forearm.
  const elbow = new THREE.Group()
  elbow.name = `${definition.id}-elbow`
  elbow.position.y = dimensions.upperArm
  shoulder.add(elbow)
  addAxle(elbow, white, [0, 0, 0], 0.078, 0.17, 'x', 28)
  addAxle(elbow, dark, [0, 0, 0], 0.046, 0.21, 'x', 20)
  addMesh(elbow, capsuleGeometry(0.052, dimensions.forearm - 0.1), white, [0, dimensions.forearm / 2, 0])

  // Articulação do pulso e flange da ferramenta.

  // Wrist joint and tool flange.
  const wrist = new THREE.Group()
  wrist.name = `${definition.id}-wrist`
  wrist.position.y = dimensions.forearm
  elbow.add(wrist)
  addAxle(wrist, dark, [0, 0, 0], 0.046, 0.12, 'x', 20)
  addCylinder(wrist, dark, [0, 0.045, 0], 0.036, 0.036, 0.07, 20)
  addCylinder(wrist, materials.steel, [0, 0.1, 0], 0.03, 0.03, 0.04, 20)

  // Ferramenta: bico doseador por defeito, ou garra de dois dedos que se afastam.

  // Tool: a dispensing nozzle by default, or a two-finger gripper whose fingers slide apart.
  let toolLength = dimensions.tool
  const fingers = []
  if (definition.tool === 'gripper') {
    toolLength = 0.2
    addBox(wrist, dark, [0, 0.13, 0], [0.13, 0.02, 0.05])
    for (const side of [-1, 1]) {
      const finger = new THREE.Group()
      finger.name = `${definition.id}-finger-${side < 0 ? 'left' : 'right'}`
      finger.position.set(side * (definition.gripperOpening ?? 0.03) / 2, 0.14, 0)
      wrist.add(finger)
      addBox(finger, materials.steel, [side * 0.006, 0.03, 0], [0.012, 0.06, 0.03])
      addBox(finger, dark, [0, 0.05, 0], [0.012, 0.02, 0.032])
      fingers.push(finger)
    }
  } else {
    addCylinder(wrist, materials.steel, [0, dimensions.tool - 0.015, 0], 0.008, 0.026, 0.05, 16)
  }

  // Aplica a pose calculada pela cinemática inversa.

  // Applies the pose computed by inverse kinematics.
  const pose = solveArmPose({ ...dimensions, tool: toolLength }, definition.reach, definition.tipHeight)
  shoulder.rotation.x = pose.shoulder
  elbow.rotation.x = pose.elbow
  wrist.rotation.x = pose.wrist
  return { arm, turret, shoulder, elbow, wrist, fingers, ingredient: definition.ingredient }
}

// Linha de montagem automática (US3): bancada, plataforma de receção, dispensador de massas, tapete, pizzas e robôs.

// Automated assembly line (US3): counter, receiving platform, crust dispenser, conveyor, pizzas and robots.
export default class AssemblyLine extends THREE.Group {
  constructor(materials, item) {
    super()
    this.name = item.id
    this.position.set(...item.position)
    this.rotation.set(...item.rotation)
    this.scale.set(...item.scale)
    const [width, height, depth] = item.dimensions
    addSlabCounter(this, materials, item.dimensions, materials[item.materials.top], materials[item.materials.frame], item.frameSpacing)

    // Plataforma de receção por baixo do dispensador: fixa, integrada na linha, à altura do tapete e encostada a ele.

    // Receiving platform under the dispenser: static, integrated in the line, at belt height and touching the belt.
    const platformDef = item.receivingPlatform
    const [platformLength, platformHeight, platformWidth] = platformDef.size
    this.platform = new THREE.Group()
    this.platform.name = 'receiving-platform'
    this.platform.position.set(platformDef.x, height, platformDef.z)
    this.add(this.platform)
    addBox(this.platform, materials.darkSteel, [0, platformHeight / 2 - 0.02, 0], [platformLength, platformHeight - 0.04, platformWidth - 0.04])
    addBox(this.platform, materials[platformDef.material], [0, platformHeight - 0.006, 0], [platformLength, 0.012, platformWidth - 0.06])
    for (const side of [-1, 1]) {
      addBox(this.platform, materials.steel, [0, platformHeight - 0.01, side * (platformWidth / 2)], [platformLength, 0.07, 0.02])
      addBox(this.platform, materials.steel, [0, platformHeight + 0.035, side * (platformWidth / 2 + 0.005)], [platformLength, 0.02, 0.03])
    }

    // Batente na ponta esquerda; a ponta direita fica aberta para a massa passar para o tapete.

    // End stop on the left; the right end stays open so the crust can move onto the belt.
    addBox(this.platform, materials.steel, [-platformLength / 2 + 0.01, platformHeight - 0.01, 0], [0.02, 0.07, platformWidth])

    // Dispensador suspenso: tubo de vidro com massas, pendurado num pórtico e alimentado a partir do teto.

    // Overhead crust dispenser: glass magazine with crusts, hung from a gantry and fed from the ceiling.
    const dispenserDef = item.dispenser
    this.dispenser = new THREE.Group()
    this.dispenser.name = 'crust-dispenser'
    this.dispenser.position.set(dispenserDef.x, 0, dispenserDef.z)
    this.add(this.dispenser)
    const radius = dispenserDef.radius
    const bottom = dispenserDef.magazineBottom
    const magazineTop = bottom + dispenserDef.magazineHeight
    const gantryZ = -depth / 2 + 0.12 - dispenserDef.z
    for (const x of [-0.5, 0.5]) {
      addBox(this.dispenser, materials.whitePaint, [x, (height + dispenserDef.gantryHeight) / 2, gantryZ], [0.09, dispenserDef.gantryHeight - height, 0.09])
    }
    addBox(this.dispenser, materials.whitePaint, [0, dispenserDef.gantryHeight, gantryZ], [1.1, 0.1, 0.1])
    addBox(this.dispenser, materials.whitePaint, [0, dispenserDef.gantryHeight, gantryZ / 2], [0.1, 0.1, Math.abs(gantryZ) + 0.1])
    const magazine = addMesh(this.dispenser, cylinderGeometry(radius, radius, dispenserDef.magazineHeight, 32, true), materials.glass, [0, (bottom + magazineTop) / 2, 0], { castShadow: false })
    magazine.renderOrder = 2
    addCylinder(this.dispenser, materials.steel, [0, magazineTop + 0.06, 0], radius + 0.03, radius + 0.03, 0.12, 32)
    addCylinder(this.dispenser, materials.steel, [0, bottom - 0.03, 0], radius + 0.03, radius + 0.03, 0.06, 32)
    for (let index = 0; index < 3; index++) {
      const angle = index * Math.PI * 2 / 3
      addBox(this.dispenser, materials.darkSteel, [Math.cos(angle) * (radius + 0.01), bottom - 0.07, Math.sin(angle) * (radius + 0.01)], [0.03, 0.06, 0.03])
    }
    for (let index = 0; index < 3; index++) {
      const angle = index * Math.PI * 2 / 3 + Math.PI / 3
      addBox(this.dispenser, materials.steel, [Math.cos(angle) * (radius + 0.005), (bottom + magazineTop) / 2, Math.sin(angle) * (radius + 0.005)], [0.018, dispenserDef.magazineHeight, 0.018])
    }
    addCylinder(this.dispenser, materials.steel, [0, magazineTop + 0.25, 0], 0.075, radius + 0.02, 0.26, 32)
    addCylinder(this.dispenser, materials.steel, [0, (magazineTop + 0.38 + dispenserDef.feedPipeTop) / 2, 0], 0.075, 0.075, dispenserDef.feedPipeTop - magazineTop - 0.38)

    // Pilha de massas dentro do tubo.

    // Stack of crusts inside the magazine.
    this.crusts = new THREE.Group()
    this.crusts.name = 'crust-stack'
    this.dispenser.add(this.crusts)
    for (let index = 0; index < dispenserDef.crustCount; index++) {
      addPizzaBase(this.crusts, materials, [0, bottom + 0.005 + index * 0.026, 0], 'dough').scale.setScalar((radius - 0.012) / 0.155)
    }

    // Tapete rolante desde a plataforma de receção até ao forno.

    // Conveyor belt from the receiving platform to the oven.
    const beltDef = item.conveyor
    this.conveyor = new THREE.Group()
    this.conveyor.name = 'conveyor-belt'
    const beltLength = beltDef.end - beltDef.start
    this.conveyor.position.set((beltDef.start + beltDef.end) / 2, height, beltDef.z)
    this.add(this.conveyor)
    const beltTop = beltDef.height
    addBox(this.conveyor, materials.darkSteel, [0, beltTop / 2 - 0.02, 0], [beltLength, beltTop - 0.04, beltDef.width - 0.04])
    this.beltSurface = addBox(this.conveyor, materials[beltDef.material], [0, beltTop - 0.006, 0], [beltLength - 0.1, 0.012, beltDef.width - 0.06])
    this.beltSurface.name = 'belt-surface'
    for (const side of [-1, 1]) {
      addBox(this.conveyor, materials.steel, [0, beltTop - 0.01, side * (beltDef.width / 2)], [beltLength, 0.07, 0.02])
      addBox(this.conveyor, materials.steel, [0, beltTop + 0.035, side * (beltDef.width / 2 + 0.005)], [beltLength, 0.02, 0.03])
    }
    for (const x of [-beltLength / 2 + 0.06, beltLength / 2 - 0.06]) {
      addAxle(this.conveyor, materials.steel, [x, beltTop - 0.04, 0], 0.045, beltDef.width - 0.04, 'z')
    }
    addBox(this.conveyor, materials.darkSteel, [beltLength / 2 - 0.72, beltTop / 2 - 0.02, -beltDef.width / 2 - 0.12], [0.3, beltTop - 0.04, 0.2])

    // Pizzas que mostram a progressão da montagem (massa > molho > queijo).

    // Pizzas showing the assembly progression (dough > sauce > cheese).
    for (const stage of item.pizzaStages) {
      addPizzaBase(this, materials, [stage.x, height + beltTop, beltDef.z], stage.stage)
    }

    // Robôs com os seus recipientes; as partes animáveis ficam guardadas como propriedades deste objeto (como os ponteiros de um relógio) para o Sprint 3.

    // Robots with their ingredient pans; the animatable parts are kept as properties of this object (like the hands of a watch) for Sprint 3.
    this.arms = item.robotArms.map((definition) => {
      addIngredientBin(this, materials, [definition.ingredientBin.x, height, definition.ingredientBin.z], definition.ingredient)
      return addRobotArm(this, materials, definition, item.armDimensions, height)
    })
  }

  // Chamado uma vez por frame com os segundos decorridos desde o anterior; as animações do Sprint 3 ficam aqui.

  // Called once per frame with the seconds elapsed since the previous one; the Sprint 3 animations go here.
  update(deltaT) {
  }
}
