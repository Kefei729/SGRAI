// Planta 2D vista de cima (SVG) construída a partir do JSON do layout da cozinha.

// Top-down 2D floor plan (SVG) built from the kitchen layout JSON.
export default function createFloorPlan(layout) {
  // A sala é ajustada a uma área de 720 x 450 centrada no desenho, seja qual for o seu tamanho no JSON.

  // The room is fitted inside a 720 x 450 area centred on the drawing, whatever its size in the JSON.
  const { width: kitchenWidth, depth: kitchenDepth } = layout.kitchen
  const scale = Math.min(720 / kitchenWidth, 450 / kitchenDepth)
  const centerX = 450
  const centerY = 300
  const roomWidth = kitchenWidth * scale
  const roomDepth = kitchenDepth * scale
  const roomLeft = centerX - roomWidth / 2
  const roomTop = centerY - roomDepth / 2
  const toX = (x) => centerX + x * scale
  const toY = (z) => centerY + z * scale
  const fills = { 'assembly-line': '#53605b', 'wood-fired-oven': '#bd6348', 'tunnel-oven': '#bd6348', refrigerator: '#899597', dishwasher: '#899597', 'prep-table': '#c28c57', column: '#2a2c2d' }

  // Nomes curtos na planta para os equipamentos encostados às paredes (os nomes completos não cabem).

  // Short plan labels for equipment along the walls (the full names are too long to fit there).
  const shortLabels = { refrigerator: 'Refrigerator', sink: 'Sink', dishwasher: 'Dishwasher', griddle: 'Griddle & grill', 'deep-fryer': 'Deep fryer', 'work-counter': 'Work counter', 'exhaust-hood': 'Exhaust hood (overhead)', 'wall-shelves': 'Ingredient shelves', 'tool-rail': 'Tool rail' }
  const escapeText = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  // Área ocupada na planta (largura e profundidade trocadas quando rodado 90°).

  // Footprint on the plan (width and depth swapped when rotated 90°).
  function planRect(position, rotationY, [itemWidth, itemDepth]) {
    const turned = Math.abs(Math.sin(rotationY ?? 0)) > 0.7
    const width = (turned ? itemDepth : itemWidth) * scale
    const depth = (turned ? itemWidth : itemDepth) * scale
    const [x, , z] = position
    return { x: toX(x) - width / 2, y: toY(z) - depth / 2, width, depth, centerX: toX(x), centerY: toY(z), worldX: x }
  }

  // Nome junto ao objeto: para dentro da sala nas paredes laterais, por baixo nos restantes.

  // Label beside the item: inwards for the side walls, below everywhere else.
  function planLabel(rect, text, small = false) {
    const className = small ? 'equipment-label equipment-label--small' : 'equipment-label'
    if (rect.worldX < -6) return `<text x="${rect.x + rect.width + 8}" y="${rect.centerY + 4}" class="${className} equipment-label--start">${escapeText(text)}</text>`
    if (rect.worldX > 6) return `<text x="${rect.x - 16}" y="${rect.centerY + 4}" class="${className} equipment-label--end">${escapeText(text)}</text>`
    return `<text x="${rect.centerX}" y="${rect.y + rect.depth + 18}" class="${className}">${escapeText(text)}</text>`
  }

  // Um retângulo por equipamento; os pilares são explicados na legenda e o exaustor suspenso é um contorno tracejado desenhado no fim.

  // One rectangle per equipment item; pilasters are explained in the key, the overhead hood is a dashed outline drawn last.
  const drawEquipment = (item) => {
    const rect = planRect(item.position, item.rotation?.[1], [item.dimensions[0], item.dimensions[2]])
    const title = `<title>${escapeText(item.name)}</title>`
    if (item.type === 'exhaust-hood') {
      return `<g>${title}<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.depth}" rx="6" fill="none" stroke="#5f5a50" stroke-width="2" stroke-dasharray="7 5"/>${planLabel({ ...rect, centerY: rect.y + 10 }, shortLabels[item.type], true)}</g>`
    }
    const fill = fills[item.type] ?? '#a9aaa2'
    const shape = `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.depth}" rx="6" fill="${fill}" stroke="#fffaf0" stroke-width="3"/>`
    if (item.type === 'column') return `<g>${title}${shape}</g>`
    if (item.type === 'wall-shelves') return `<g>${title}${shape}<text x="${rect.centerX}" y="${rect.centerY + 4}" class="equipment-label equipment-label--small">${shortLabels[item.type]}</text></g>`
    const short = shortLabels[item.id] ?? shortLabels[item.type]
    return `<g>${title}${shape}${planLabel(rect, short ?? item.name, Boolean(short))}</g>`
  }
  const equipment = layout.equipment.filter((item) => item.type !== 'exhaust-hood').map(drawEquipment).join('')
    + layout.equipment.filter((item) => item.type === 'exhaust-hood').map(drawEquipment).join('')

  // Objetos importados que ocupam chão e aparecem na planta: estantes (um só nome para o par) e o extintor.

  // Imported floor-standing props shown on the plan: storage racks (one label for the pair) and the fire extinguisher.
  const planProps = {
    steelShelves: { size: [0.594, 0.502], fill: '#3b3d3c', label: 'Storage racks' },
    fireExtinguisher: { size: [0.28, 0.37], fill: '#c8402f' },
  }
  const labelledProps = new Set()
  const props = layout.props.filter((placement) => planProps[placement.model]).map((placement) => {
    const definition = planProps[placement.model]
    const rect = planRect(placement.position, placement.rotation?.[1], definition.size)
    const shape = `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.depth}" rx="3" fill="${definition.fill}" stroke="#fffaf0" stroke-width="2"/>`
    if (!definition.label || labelledProps.has(placement.model)) return shape
    labelledProps.add(placement.model)

    // Centra o nome no grupo inteiro do mesmo modelo.

    // Centre the label on the whole group of the same model.
    const group = layout.props.filter((other) => other.model === placement.model)
    const groupCenterZ = group.reduce((sum, other) => sum + other.position[2], 0) / group.length
    return shape + planLabel({ ...rect, centerY: toY(groupCenterZ) }, definition.label, true)
  }).join('')

  // Legenda para os símbolos pequenos que não têm nome próprio.

  // Key for the small symbols that have no label of their own.
  const key = `
    <g class="plan-key">
      <rect x="300" y="582" width="10" height="10" rx="2" fill="#2a2c2d"/><text x="316" y="591">PILASTER</text>
      <rect x="420" y="582" width="10" height="10" rx="2" fill="#c8402f"/><text x="436" y="591">FIRE EXTINGUISHER</text>
      <rect x="590" y="582" width="10" height="10" rx="2" fill="none" stroke="#5f5a50" stroke-dasharray="3 2"/><text x="606" y="591">OVERHEAD</text>
    </g>`
  // Linhas da grelha do chão.

  // Floor grid lines.
  const columns = Math.max(2, Math.round(kitchenWidth) - 1)
  const rows = Math.max(2, Math.round(kitchenDepth))
  const grid = Array.from({ length: columns }, (_, index) =>
    `<path d="M${roomLeft + index * roomWidth / (columns - 1)} ${roomTop}v${roomDepth}" />`,
  ).join('') + Array.from({ length: rows }, (_, index) =>
    `<path d="M${roomLeft} ${roomTop + index * roomDepth / (rows - 1)}h${roomWidth}" />`,
  ).join('')

  // Planta SVG com paredes de tijolo, equipamentos e legendas.

  // SVG plan with brick walls, equipment and labels.
  const plan = document.createElement('div')
  plan.className = 'floor-plan'
  plan.setAttribute('role', 'img')
  plan.setAttribute('aria-label', 'Top-down kitchen floor plan')
  plan.innerHTML = `
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><pattern id="brick-pattern" width="32" height="16" patternUnits="userSpaceOnUse"><path d="M0 0H32M0 8H32M16 0V8M0 8V16" fill="none" stroke="#b97658" stroke-width="1.5" opacity=".52"/></pattern></defs>
      <rect x="${roomLeft - 14}" y="${roomTop - 14}" width="${roomWidth + 28}" height="${roomDepth + 28}" rx="8" fill="#fffdf7" stroke="#826d5a" stroke-width="9"/>
      <rect x="${roomLeft - 8}" y="${roomTop - 8}" width="${roomWidth + 16}" height="${roomDepth + 16}" fill="#e4e0d7"/>
      <g stroke="#c8c3b9" stroke-width="1" opacity=".42">${grid}</g>
      <rect x="${roomLeft - 8}" y="${roomTop - 8}" width="${roomWidth + 16}" height="16" fill="url(#brick-pattern)"/>
      <rect x="${roomLeft - 8}" y="${roomTop + 8}" width="16" height="${roomDepth - 16}" fill="url(#brick-pattern)"/>
      <rect x="${roomLeft + roomWidth - 8}" y="${roomTop + 8}" width="16" height="${roomDepth - 16}" fill="url(#brick-pattern)"/>
      <text x="450" y="43" class="wall-label">LA PRIZZA · KITCHEN FLOOR PLAN</text>
      <g>${props}</g>
      <g>${equipment}</g>
      <text x="450" y="570" class="wall-label">${kitchenWidth} m × ${kitchenDepth} m · TOP-DOWN VIEW</text>
      ${key}
    </svg>
  `
  return plan
}
