// Sala da cozinha: chão, paredes de tijolo, teto e viga do teto.

// Kitchen room: floor, brick walls, ceiling and ceiling beam.
import * as THREE from 'three'
import { addBox, addMesh, scaleUVs } from './mesh_helpers.js'

// Constrói a sala: chão, três paredes de tijolo, teto e viga preta do teto.

// Builds the room: floor, three brick walls, ceiling and black ceiling beam.
export default function addKitchenStructure(scene, ceilingGroup, materials, layout) {
  const kitchen = new THREE.Group()
  kitchen.name = 'kitchen-shell'
  scene.add(kitchen)
  const { width, depth, wallHeight } = layout.kitchen
  const names = layout.kitchen.materials

  addBox(kitchen, materials[names.floor], [0, -0.05, 0], [width, 0.1, depth], { castShadow: false })

  // Paredes: opacas e com duas faces (material "brick" com doubleSided), por isso veem-se de qualquer ângulo, por dentro ou por fora. O teto tem uma só face.

  // Walls: opaque and double-sided (material "brick" with doubleSided), so they are visible from any angle, inside or outside. The ceiling is single-sided.
  const walls = [
    { size: [width, wallHeight], position: [0, wallHeight / 2, -depth / 2], rotationY: 0 },
    { size: [depth, wallHeight], position: [-width / 2, wallHeight / 2, 0], rotationY: Math.PI / 2 },
    { size: [depth, wallHeight], position: [width / 2, wallHeight / 2, 0], rotationY: -Math.PI / 2 },
  ]
  for (const wall of walls) {
    const geometry = scaleUVs(new THREE.PlaneGeometry(...wall.size), () => wall.size)
    addMesh(kitchen, geometry, materials[names.walls], wall.position, { rotation: [0, wall.rotationY, 0], castShadow: false })

    // Desativado: face exterior translúcida (material "brickOutside"). Para a usar, retira o comentário deste bloco e remove o doubleSided do "brick" no JSON (public/kitchen-layout.json, "materials" > "brick"), ou seja, apaga esta linha e a vírgula no fim da linha anterior:
    //   "doubleSided": true

    // Disabled: translucent outer face (material "brickOutside"). To use it, uncomment this block and remove doubleSided from "brick" in the JSON (public/kitchen-layout.json, "materials" > "brick"), i.e. delete this line and the comma at the end of the line before it:
    //   "doubleSided": true
    // if (names.wallsOutside) {
    //   addMesh(kitchen, geometry, materials[names.wallsOutside], wall.position, { rotation: [0, wall.rotationY, 0], castShadow: false, receiveShadow: false })
    // }
  }

  // Plano do teto virado para baixo e viga do teto.

  // Ceiling plane facing down and the ceiling beam.
  scene.add(ceilingGroup)
  const ceiling = scaleUVs(new THREE.PlaneGeometry(width, depth), () => [width, depth])
  addMesh(ceilingGroup, ceiling, materials[names.ceiling], [0, wallHeight, 0], { rotation: [Math.PI / 2, 0, 0], castShadow: false })
  const beam = layout.kitchen.ceilingBeam
  addBox(ceilingGroup, materials[names.beam], [beam.x, wallHeight - beam.height / 2, 0], [beam.width, beam.height, depth], { castShadow: false })
  return kitchen
}
