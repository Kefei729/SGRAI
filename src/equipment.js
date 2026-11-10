// Constrói cada equipamento da cozinha a partir da sua entrada no JSON.

// Builds each piece of kitchen equipment from its JSON entry.
import * as THREE from 'three'
import { addOven, addTunnelOven } from './ovens.js'
import { addRefrigerator, addGriddle, addDeepFryer, addWorkCounter, addExhaustHood, addSink, addDishwasher } from './appliances.js'
import { addPrepTable, addWallShelves, addToolRail, addColumn } from './furniture.js'

// A função que constrói cada 'type' usado no JSON.

// The function that builds each 'type' used in the JSON.
const builders = {
  'wood-fired-oven': addOven,
  'tunnel-oven': addTunnelOven,
  'refrigerator': addRefrigerator,
  'griddle': addGriddle,
  'deep-fryer': addDeepFryer,
  'work-counter': addWorkCounter,
  'exhaust-hood': addExhaustHood,
  'sink': addSink,
  'dishwasher': addDishwasher,
  'prep-table': addPrepTable,
  'wall-shelves': addWallShelves,
  'tool-rail': addToolRail,
  'column': addColumn,
}

// Cria o grupo do equipamento na sua posição e deixa a função correspondente preenchê-lo; os tipos desconhecidos são indicados na consola.

// Creates the equipment's group at its position and lets the matching function fill it; unknown types are reported in the console.
export default function addEquipment(parent, materials, item, lighting) {
  const equipment = new THREE.Group()
  equipment.name = item.id
  equipment.position.set(...item.position)
  equipment.rotation.set(...item.rotation)
  equipment.scale.set(...item.scale)
  parent.add(equipment)
  const build = builders[item.type]
  if (build) build(equipment, materials, item, lighting)
  else console.warn(`Unknown equipment type "${item.type}" for ${item.id}`)
  return equipment
}
