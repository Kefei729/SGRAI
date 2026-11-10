// Mesas, prateleiras de parede, barra de utensílios e pilares de parede.

// Tables, wall shelves, the tool rail and the wall pilasters.
import { addBox, addCylinder } from './mesh_helpers.js'

// Mesa de preparação em inox com prateleira inferior.

// Stainless prep table with undershelf.
export function addPrepTable(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addBox(equipment, materials.steel, [0, height - 0.02, 0], [width, 0.04, depth])
  addBox(equipment, materials.steel, [0, 0.25, 0], [width - 0.1, 0.03, depth - 0.1])
  for (const x of [-width / 2 + 0.05, width / 2 - 0.05]) {
    for (const z of [-depth / 2 + 0.05, depth / 2 - 0.05]) addCylinder(equipment, materials.steel, [x, (height - 0.04) / 2, z], 0.022, 0.022, height - 0.04, 12)
  }
}

// Prateleiras de madeira na parede sobre suportes pretos.

// Wooden wall shelves on black brackets.
export function addWallShelves(equipment, materials, item) {
  const [width, , depth] = item.dimensions
  for (const level of item.levels) {
    addBox(equipment, materials.wood, [0, level, 0], [width, 0.04, depth])
    for (let x = -width / 2 + 0.3; x <= width / 2; x += 1.2) {
      addBox(equipment, materials.blackPaint, [x, level - 0.09, -depth / 2 + 0.17], [0.03, 0.15, 0.3])
    }
  }
}

// Barra de parede com pás de pizza e utensílios pendurados.

// Wall rail with hanging pizza peels and tools.
export function addToolRail(equipment, materials, item) {
  const [width] = item.dimensions
  addBox(equipment, materials.steel, [0, 0, 0.02], [width, 0.04, 0.04])
  for (const tool of item.tools) {
    addCylinder(equipment, materials.wood, [tool.x, -tool.handle / 2 + 0.3, 0.06], 0.014, 0.014, tool.handle, 12)
    addBox(equipment, materials[tool.material], [tool.x, 0.3 + tool.blade[1] / 2, 0.06], [tool.blade[0], tool.blade[1], 0.008])
  }
}

// Pilar de aço preto encostado a uma parede.

// Black steel pilaster against a wall.
export function addColumn(equipment, materials, item) {
  const [width, height, depth] = item.dimensions
  addBox(equipment, materials[item.material], [0, height / 2, 0], [width, height, depth])
}
