// Eletrodomésticos da cozinha construídos sobre um armário em inox, e o exaustor.

// Kitchen appliances built on a stainless cabinet, and the exhaust hood.
import { addAxle, addBox, addCylinder, addMesh, boxGeometry } from './mesh_helpers.js'

// Corpo de armário em inox sobre quatro pés (base da maioria dos equipamentos).

// Stainless cabinet body on four small feet (base of most kitchen equipment).
function addCabinet(group, materials, size, bodyMaterial = materials.steel) {
  const [width, height, depth] = size

  // O corpo assenta nos pés: desde o topo deles (0,05 m) até à altura total.

  // Body sits on the feet: from their top (0.05 m) up to the full height.
  const feetHeight = 0.05
  addBox(group, bodyMaterial, [0, (height + feetHeight) / 2, 0], [width, height - feetHeight, depth])
  for (const x of [-width / 2 + 0.05, width / 2 - 0.05]) {
    for (const z of [-depth / 2 + 0.05, depth / 2 - 0.05]) addCylinder(group, materials.darkSteel, [x, feetHeight / 2, z], 0.022, 0.026, feetHeight, 12)
  }
}

// Frigorífico de duas portas com puxadores e faixa de controlo no topo.

// Two-door refrigerator with handles and a top control strip.
export function addRefrigerator(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addCabinet(equipment, materials, item.dimensions)
  for (const side of [-1, 1]) {
    const x = side * width / 4
    addBox(equipment, materials.steel, [x, height / 2 + 0.06, depth / 2 + 0.015], [width / 2 - 0.02, height - 0.2, 0.03])
    addBox(equipment, materials.darkSteel, [x - side * (width / 4 - 0.07), height * 0.58, depth / 2 + 0.06], [0.03, 0.6, 0.04])
  }
  addBox(equipment, materials.blackPaint, [0, height - 0.08, depth / 2 + 0.035], [width - 0.1, 0.1, 0.01])
}

// Chapa (esquerda) e grelhador de barras (direita) com botões de controlo.

// Flat-top griddle (left) and charbroiler grill bars (right) with control knobs.
export function addGriddle(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addCabinet(equipment, materials, item.dimensions)
  addBox(equipment, materials.darkSteel, [-width / 4, height + 0.01, 0.02], [width / 2 - 0.06, 0.02, depth - 0.16])
  addBox(equipment, materials.steel, [-width / 4, height + 0.04, -depth / 2 + 0.05], [width / 2 - 0.04, 0.08, 0.02])
  for (let index = 0; index < 9; index++) {
    addBox(equipment, materials.blackPaint, [width * 0.06 + index * (width * 0.4 / 8), height + 0.02, 0.02], [0.012, 0.025, depth - 0.18])
  }
  for (let index = 0; index < 4; index++) {
    addAxle(equipment, materials.blackPaint, [-width / 2 + 0.15 + index * (width - 0.3) / 3, height - 0.12, depth / 2 + 0.03], 0.03, 0.04, 'z', 16)
  }
}

// Fritadeira de dois cestos com cubas de óleo, cestos e proteção traseira.

// Twin-basket deep fryer with oil wells, baskets and backsplash.
export function addDeepFryer(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addCabinet(equipment, materials, item.dimensions)
  for (const x of [-width / 4, width / 4]) {
    addBox(equipment, materials.blackPaint, [x, height - 0.02, 0.05], [width / 2 - 0.06, 0.02, depth - 0.3])
    addBox(equipment, materials.steel, [x, height + 0.06, 0.05], [width / 2 - 0.1, 0.12, depth * 0.45])
    addBox(equipment, materials.blackPaint, [x, height + 0.08, depth / 2 - 0.05], [0.03, 0.03, 0.22])
  }
  addBox(equipment, materials.steel, [0, height + 0.18, -depth / 2 + 0.06], [width, 0.36, 0.04])
}

// Bancada de trabalho simples em inox.

// Plain stainless work counter.
export function addWorkCounter(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addCabinet(equipment, materials, item.dimensions)
  addBox(equipment, materials.steel, [0, height + 0.01, 0], [width + 0.02, 0.02, depth + 0.02])
}

// Exaustor: caixa com o topo estreitado em trapézio, filtro e conduta até ao teto.

// Exhaust hood: a box with its top narrowed into a trapezoid, plus filter and duct to the ceiling.
export function addExhaustHood(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  const geometry = boxGeometry(width, height, depth)
  const position = geometry.attributes.position
  for (let index = 0; index < position.count; index++) {
    if (position.getY(index) > 0) {
      position.setX(index, position.getX(index) * 0.82)
      position.setZ(index, (position.getZ(index) - depth / 2) * 0.55 + depth / 2)
    }
  }
  geometry.computeVertexNormals()
  addMesh(equipment, geometry, materials.steel, [0, height / 2, 0])
  addBox(equipment, materials.steel, [0, 0.04, 0], [width + 0.04, 0.08, depth + 0.04])
  addBox(equipment, materials.darkSteel, [0, 0.005, 0], [width - 0.1, 0.01, depth - 0.1], { castShadow: false })
  addBox(equipment, materials.steel, [0, (height + item.ductTop - item.position[1]) / 2, depth * 0.2], [0.45, item.ductTop - item.position[1] - height, 0.45])
}

// Lava-loiça de duas cubas com proteção traseira e torneira.

// Double-bowl sink with backsplash and faucet.
export function addSink(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addCabinet(equipment, materials, item.dimensions)
  for (const x of [-width / 4, width / 4]) {
    addBox(equipment, materials.darkSteel, [x, height - 0.005, 0.02], [width / 2 - 0.12, 0.012, depth - 0.2], { castShadow: false })
  }
  addBox(equipment, materials.steel, [0, height + 0.12, -depth / 2 + 0.03], [width, 0.24, 0.02])
  addCylinder(equipment, materials.steel, [0, height + 0.2, -depth / 2 + 0.08], 0.018, 0.018, 0.4, 12)
  addAxle(equipment, materials.steel, [0, height + 0.38, -depth / 2 + 0.2], 0.014, 0.25, 'z', 12)
}

// Máquina de lavar de encastrar com porta, painel de controlo e puxador.

// Undercounter dishwasher with door, control panel and handle.
export function addDishwasher(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addCabinet(equipment, materials, item.dimensions)
  addBox(equipment, materials.steel, [0, height * 0.5, depth / 2 + 0.015], [width - 0.06, height * 0.62, 0.03])
  addBox(equipment, materials.blackPaint, [0, height * 0.88, depth / 2 + 0.02], [width - 0.08, 0.1, 0.02])
  addBox(equipment, materials.darkSteel, [0, height * 0.78, depth / 2 + 0.05], [width * 0.5, 0.03, 0.04])
  addBox(equipment, materials.steel, [0, height + 0.01, 0], [width + 0.02, 0.02, depth + 0.02])
}
