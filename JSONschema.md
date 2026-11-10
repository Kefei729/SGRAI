# JSONschema — `public/kitchen-layout.json`

**PT:** Este documento descreve todos os elementos do ficheiro `public/kitchen-layout.json`, a única fonte de dados da cena 3D da cozinha LaPrizza. Cada tabela tem a legenda em português e em inglês.

**EN:** This document describes every element of `public/kitchen-layout.json`, the single data source of the LaPrizza kitchen 3D scene. Each table has its legend in Portuguese and English.

## 1. Regras gerais / General rules

| Regra / Rule | Português | English |
| --- | --- | --- |
| Unidades / Units | Distâncias em metros. | Distances in meters. |
| Origem / Origin | `[0, 0, 0]` é o centro do chão da cozinha. | `[0, 0, 0]` is the center of the kitchen floor. |
| Eixos / Axes | X para a direita, Y para cima, +Z para o lado aberto da sala (câmara). A parede do fundo está em z = −5. | X to the right, Y up, +Z towards the open side of the room (camera). The rear wall is at z = −5. |
| Vetores / Vectors | `position` e `target` são `[x, y, z]`. | `position` and `target` are `[x, y, z]`. |
| Rotações / Rotations | `rotation` é `[x, y, z]` em radianos. | `rotation` is `[x, y, z]` in radians. |
| Tamanhos / Sizes | `dimensions` é `[largura, altura, profundidade]`. | `dimensions` is `[width, height, depth]`. |
| Cores / Colors | Texto hexadecimal, por exemplo `"#ffffff"`. | Hexadecimal string, for example `"#ffffff"`. |
| Caminhos / Paths | Relativos à raiz do projeto, por exemplo `./public/...`. | Relative to the project root, for example `./public/...`. |
| Coordenadas locais / Local coordinates | Quando indicado, o valor é relativo à `position` do equipamento. | When stated, the value is relative to the equipment's `position`. |

## 2. Estrutura principal / Top-level structure

| Campo / Field | Tipo / Type | Português | English |
| --- | --- | --- | --- |
| `name` | string | Nome da cena. | Scene name. |
| `units` | string | Unidade usada (`meters`). | Unit used (`meters`). |
| `coordinateSystem` | object | Descrição do sistema de coordenadas. | Description of the coordinate system. |
| `kitchen` | object | Dimensões e materiais da sala. | Room dimensions and materials. |
| `camera` | object | Vista inicial e limites da câmara. | Initial view and camera limits. |
| `environment` | object | Mapa HDRI usado nos reflexos. | HDRI map used for reflections. |
| `modelSource` | object | Nota sobre a origem dos modelos. | Note on where the models come from. |
| `materials` | object | Os 25 materiais, por nome. | The 25 materials, by name. |
| `equipment` | array | Os 18 equipamentos construídos por código. | The 18 pieces of equipment built in code. |
| `models` | object | Os 11 modelos 3D importados, por nome. | The 11 imported 3D models, by name. |
| `props` | array | As 110 colocações desses modelos na sala. | The 110 placements of those models in the room. |
| `lighting` | object | Luzes da cena. | Scene lights. |
| `attribution` | array | Créditos e licenças. | Credits and licenses. |

## 3. `coordinateSystem`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `up` | string | `"y"` | Eixo vertical. | Vertical axis. |
| `floorCenter` | number[3] | `[0, 0, 0]` | Centro do chão. | Floor center. |
| `description` | string | — | Explicação em texto. | Text explanation. |

## 4. `kitchen`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `width` | number | `16` | Largura da sala (X). | Room width (X). |
| `depth` | number | `10` | Profundidade da sala (Z). | Room depth (Z). |
| `wallHeight` | number | `4.2` | Altura das paredes e do teto. | Wall and ceiling height. |
| `materials.floor` | string | `"floor"` | Material do chão. | Floor material. |
| `materials.walls` | string | `"brick"` | Material das paredes. | Wall material. |
| `materials.wallsOutside` | string | `"brickOutside"` | Face exterior translúcida das paredes (desativada, ver secção 14). | Translucent outer wall face (disabled, see section 14). |
| `materials.ceiling` | string | `"ceiling"` | Material do teto. | Ceiling material. |
| `materials.beam` | string | `"blackPaint"` | Material da viga do teto. | Ceiling beam material. |
| `ceilingBeam.x` | number | `0.6` | Posição X da viga. | Beam X position. |
| `ceilingBeam.width` | number | `0.34` | Largura da viga. | Beam width. |
| `ceilingBeam.height` | number | `0.3` | Altura da viga. | Beam height. |

## 5. `camera`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `fov` | number | `40` | Campo de visão vertical, em graus. | Vertical field of view, in degrees. |
| `position` | number[3] | `[4.2, 6.4, 12.8]` | Posição inicial da câmara. | Initial camera position. |
| `target` | number[3] | `[0, 0, 0]` | Ponto para onde a câmara olha no início. | Point the camera looks at initially. |
| `minDistance` | number | `2.2` | Zoom máximo (distância mínima ao alvo). | Maximum zoom (minimum distance to the target). |
| `maxDistance` | number | `26` | Zoom mínimo (distância máxima ao alvo). | Minimum zoom (maximum distance to the target). |
| `minPolarAngle` | number | `0.12` | Ângulo mínimo da órbita, em múltiplos de π. | Minimum orbit angle, as a multiple of π. |
| `maxPolarAngle` | number | `0.48` | Ângulo máximo da órbita, em múltiplos de π. | Maximum orbit angle, as a multiple of π. |
| `panBounds.min` | number[3] | `[-7.5, 0, -4.5]` | Limite inferior do alvo ao deslocar a vista. | Lower limit of the target when panning. |
| `panBounds.max` | number[3] | `[7.5, 3, 4.5]` | Limite superior do alvo ao deslocar a vista. | Upper limit of the target when panning. |

## 6. `environment`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `url` | string | `"./public/hdri/studio_small_09_1k.hdr"` | Caminho do ficheiro HDRI. | HDRI file path. |
| `intensity` | number | `1` | Força dos reflexos do ambiente. | Strength of the environment reflections. |
| `credit` | string | — | Crédito do HDRI. | HDRI credit. |

## 7. `modelSource`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `type` | string | `"hybrid"` | Indica que há objetos feitos por código e importados. | States that objects are both code-built and imported. |
| `description` | string | — | Explicação em texto. | Text explanation. |

## 8. `materials`

Cada entrada é um material, identificado pelo nome. / Each entry is a material, identified by its name.

### 8.1 Campos / Fields

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `color` | string | `"#fbfaf7"` | Cor base, multiplicada pela textura. | Base color, multiplied by the texture. |
| `roughness` | number | `0.28` | Rugosidade, de 0 (polido) a 1 (mate). | Roughness, from 0 (polished) to 1 (matte). |
| `metalness` | number | `0` | Aspeto metálico, de 0 a 1. | Metallic look, from 0 to 1. |
| `tileSize` | number[2] | `[3, 3]` | Metros cobertos por uma repetição da textura. | Meters covered by one texture repeat. |
| `maps.color` | string | — | Caminho da textura de cor (opcional). | Color texture path (optional). |
| `maps.roughness` | string | — | Caminho da textura de rugosidade. | Roughness texture path. |
| `maps.normal` | string | — | Caminho da textura de relevo. | Normal (relief) texture path. |
| `normalScale` | number[2] | `[0.25, 0.25]` | Força do relevo (opcional; por defeito 0.35). | Relief strength (optional; defaults to 0.35). |
| `doubleSided` | boolean | `true` | Desenha as duas faces (opcional). | Draws both faces (optional). |
| `side` | string | `"back"` | Desenha só a face de trás (opcional). | Draws only the back face (optional). |
| `transparent` | boolean | `true` | Ativa a transparência (opcional). | Enables transparency (optional). |
| `opacity` | number | `0.25` | Opacidade, de 0 a 1 (opcional). | Opacity, from 0 to 1 (optional). |
| `emissive` | string | `"#ff6a1c"` | Cor da luz própria (opcional). | Self-illumination color (optional). |
| `emissiveIntensity` | number | `2.4` | Força da luz própria (opcional). | Self-illumination strength (optional). |

### 8.2 Materiais / Materials

| Nome / Name | Português | English |
| --- | --- | --- |
| `floor` | Chão da cozinha. | Kitchen floor. |
| `brick` | Tijolo das paredes (duas faces). | Wall brick (double-sided). |
| `brickOutside` | Face exterior translúcida das paredes (sem uso, ver secção 14). | Translucent outer wall face (unused, see section 14). |
| `ovenBrick` | Tijolo do forno. | Oven brick. |
| `ceiling` | Teto branco. | White ceiling. |
| `concrete` | Betão da bancada e da base do forno. | Concrete of the counter and oven base. |
| `ovenConcrete` | Betão alternativo do forno (sem uso, ver secção 14). | Alternative oven concrete (unused, see section 14). |
| `soot` | Fuligem das bocas do forno. | Soot of the oven mouths. |
| `steel` | Inox claro. | Light stainless steel. |
| `darkSteel` | Aço escuro. | Dark steel. |
| `whitePaint` | Estruturas de aço pintadas de branco. | White-painted steel frames. |
| `robotWhite` | Corpo branco dos robôs. | White robot shells. |
| `blackPaint` | Aço pintado de preto (pilares, viga, suportes). | Black-painted steel (pilasters, beam, brackets). |
| `copper` | Remates de cobre do forno. | Copper trim of the oven. |
| `belt` | Superfície da passadeira. | Conveyor belt surface. |
| `bark` | Casca da lenha. | Firewood bark. |
| `logEnd` | Topo cortado da lenha. | Cut end of the firewood. |
| `wood` | Madeira das prateleiras. | Shelf wood. |
| `glass` | Vidro do tubo do dispensador. | Glass of the dispenser magazine. |
| `dough` | Massa das pizzas. | Pizza dough. |
| `sauce` | Molho. | Sauce. |
| `cheese` | Queijo. | Cheese. |
| `pepperoni` | Pepperoni. | Pepperoni. |
| `basil` | Manjericão. | Basil. |
| `embers` | Brasas incandescentes do forno. | Glowing oven embers. |

## 9. `equipment`

### 9.1 Campos comuns / Common fields

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `id` | string | `"tunnel-oven"` | Identificador único. | Unique identifier. |
| `type` | string | `"tunnel-oven"` | Escolhe a função que constrói o objeto. | Chooses the function that builds the object. |
| `name` | string | `"Black steel pilaster"` | Nome completo, mostrado na planta 2D. | Full name, shown on the 2D plan. |
| `position` | number[3] | `[4.3, 0, -3.85]` | Posição na sala. | Position in the room. |
| `rotation` | number[3] | `[0, 1.570796, 0]` | Rotação em radianos. | Rotation in radians. |
| `scale` | number[3] | `[1, 1, 1]` | Escala em cada eixo. | Scale on each axis. |
| `dimensions` | number[3] | `[2.3, 0.95, 2]` | Largura, altura e profundidade. | Width, height and depth. |

### 9.2 Equipamentos / Equipment

| `id` | `type` | Português | English |
| --- | --- | --- | --- |
| `assembly-line` | `assembly-line` | Linha de montagem automática. | Automated assembly line. |
| `tunnel-oven` | `tunnel-oven` | Forno de túnel a lenha em tijolo. | Wood-fired brick tunnel oven. |
| `refrigerator` | `refrigerator` | Frigorífico de duas portas. | Two-door refrigerator. |
| `griddle` | `griddle` | Chapa e grelhador. | Griddle and charbroiler. |
| `deep-fryer` | `deep-fryer` | Fritadeira de dois cestos. | Twin-basket deep fryer. |
| `cook-line-counter` | `work-counter` | Bancada de trabalho em inox. | Stainless work counter. |
| `exhaust-hood` | `exhaust-hood` | Exaustor. | Exhaust hood. |
| `sink` | `sink` | Lava-loiça de duas cubas. | Double-bowl sink. |
| `dishwasher` | `dishwasher` | Máquina de lavar. | Dishwasher. |
| `prep-table` | `prep-table` | Mesa de preparação de massa. | Dough preparation table. |
| `wall-shelves` | `wall-shelves` | Prateleiras de ingredientes na parede. | Ingredient wall shelves. |
| `tool-rail` | `tool-rail` | Barra de utensílios. | Tool rail. |
| `pilaster-1` a/to `pilaster-6` | `column` | Pilares de aço preto. | Black steel pilasters. |

O código aceita também o tipo `wood-fired-oven` (forno de cúpula), que esta cozinha não usa. / The code also accepts the `wood-fired-oven` type (dome oven), which this kitchen does not use.

### 9.3 Campos de `assembly-line` / `assembly-line` fields

Os valores `x` e `z` são coordenadas locais. / The `x` and `z` values are local coordinates.

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `materials.top` | string | `"concrete"` | Material do tampo da bancada. | Counter top material. |
| `materials.frame` | string | `"whitePaint"` | Material dos pórticos da bancada. | Counter frame material. |
| `frameSpacing` | number | `1.15` | Distância aproximada entre pórticos. | Approximate distance between frames. |
| `components` | string[] | — | Lista informativa de componentes. | Informative list of components. |
| `receivingPlatform.x` | number | `-4.425` | Centro X da plataforma de receção. | Receiving platform center X. |
| `receivingPlatform.z` | number | `0.25` | Centro Z da plataforma de receção. | Receiving platform center Z. |
| `receivingPlatform.size` | number[3] | `[0.85, 0.14, 0.6]` | Comprimento (X), altura e largura (Z) da plataforma. | Platform length (X), height and width (Z). |
| `receivingPlatform.material` | string | `"steel"` | Material da superfície da plataforma. | Platform surface material. |
| `dispenser.x` | number | `-4.425` | Posição X do dispensador. | Dispenser X position. |
| `dispenser.z` | number | `0.25` | Posição Z do dispensador. | Dispenser Z position. |
| `dispenser.magazineBottom` | number | `1.45` | Altura da base do tubo de vidro. | Height of the glass magazine base. |
| `dispenser.magazineHeight` | number | `0.9` | Altura do tubo de vidro. | Glass magazine height. |
| `dispenser.radius` | number | `0.19` | Raio do tubo de vidro. | Glass magazine radius. |
| `dispenser.crustCount` | number | `16` | Número de massas na pilha. | Number of crusts in the stack. |
| `dispenser.gantryHeight` | number | `2.62` | Altura do pórtico de suporte. | Support gantry height. |
| `dispenser.feedPipeTop` | number | `4.2` | Altura do topo do tubo de alimentação. | Height of the top of the feed pipe. |
| `conveyor.start` | number | `-4` | Início da passadeira (X). | Conveyor start (X). |
| `conveyor.end` | number | `5.464` | Fim da passadeira (X). | Conveyor end (X). |
| `conveyor.z` | number | `0.25` | Posição Z da passadeira. | Conveyor Z position. |
| `conveyor.width` | number | `0.6` | Largura da passadeira. | Conveyor width. |
| `conveyor.height` | number | `0.14` | Altura da superfície acima da bancada. | Surface height above the counter. |
| `conveyor.material` | string | `"belt"` | Material da superfície. | Surface material. |
| `robotArms[].id` | string | `"arm-sauce"` | Identificador do robô. | Robot identifier. |
| `robotArms[].x` | number | `-2.675` | Posição X do robô. | Robot X position. |
| `robotArms[].z` | number | `-0.5` | Posição Z do robô. | Robot Z position. |
| `robotArms[].ingredient` | string | `"sauce"` | Ingrediente: `sauce`, `cheese`, `pepperoni` ou `basil`. | Ingredient: `sauce`, `cheese`, `pepperoni` or `basil`. |
| `robotArms[].reach` | number | `0.75` | Distância horizontal até à ponta da ferramenta. | Horizontal distance to the tool tip. |
| `robotArms[].tipHeight` | number | `0.27` | Altura da ponta da ferramenta acima da bancada. | Tool tip height above the counter. |
| `robotArms[].yaw` | number | `0` | Rotação da torre do robô, em radianos. | Robot turret rotation, in radians. |
| `robotArms[].ingredientBin.x` | number | `-2.255` | Posição X do recipiente de ingredientes. | Ingredient bin X position. |
| `robotArms[].ingredientBin.z` | number | `-0.52` | Posição Z do recipiente de ingredientes. | Ingredient bin Z position. |
| `armDimensions.shoulderHeight` | number | `0.42` | Altura do ombro. | Shoulder height. |
| `armDimensions.upperArm` | number | `0.68` | Comprimento do braço. | Upper arm length. |
| `armDimensions.forearm` | number | `0.6` | Comprimento do antebraço. | Forearm length. |
| `armDimensions.tool` | number | `0.15` | Comprimento da ferramenta. | Tool length. |
| `pizzaStages[].x` | number | `-4.425` | Posição X da pizza na passadeira. | Pizza X position on the conveyor. |
| `pizzaStages[].stage` | string | `"dough"` | Fase da montagem: `dough`, `sauce` ou `cheese`. | Assembly stage: `dough`, `sauce` or `cheese`. |

### 9.4 Campos de `tunnel-oven` / `tunnel-oven` fields

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `materials.base` | string | `"concrete"` | Material da base. | Base material. |
| `materials.brick` | string | `"ovenBrick"` | Material do corpo de tijolo. | Brick body material. |
| `materials.trim` | string | `"copper"` | Material dos remates. | Trim material. |
| `materials.flue` | string | `"steel"` | Material da chaminé. | Flue material. |
| `body.length` | number | `1.9` | Comprimento do corpo de tijolo. | Brick body length. |
| `body.depth` | number | `1.4` | Profundidade do corpo de tijolo. | Brick body depth. |
| `body.wallHeight` | number | `0.45` | Altura das paredes retas, abaixo da abóbada. | Height of the straight walls, below the vault. |
| `body.centerZ` | number | `0.2` | Centro do corpo em Z (local). | Body center in Z (local). |
| `tunnelZ` | number | `0.25` | Posição Z do túnel (local). | Tunnel Z position (local). |
| `archWidth` | number | `0.7` | Largura das bocas em arco. | Width of the arched mouths. |
| `beltTop` | number | `1.09` | Altura da superfície do tapete. | Belt surface height. |
| `beltStart` | number | `-0.961` | Início do tapete do forno (X local). | Oven belt start (local X). |
| `beltEnd` | number | `1.35` | Fim do tapete do forno (X local). | Oven belt end (local X). |
| `flueTop` | number | `4.2` | Altura do topo da chaminé. | Height of the top of the flue. |
| `firewood.rows` | number | `6` | Número máximo de filas de lenha. | Maximum number of firewood rows. |
| `firewood.seed` | number | `11` | Semente da variação da lenha. | Seed of the firewood variation. |

### 9.5 Outros campos específicos / Other specific fields

| Tipo / Type | Campo / Field | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `exhaust-hood` | `ductTop` | `4.2` | Altura do topo da conduta. | Height of the top of the duct. |
| `wall-shelves` | `levels` | `[2.05, 2.55, 3.05]` | Altura de cada prateleira. | Height of each shelf. |
| `column` | `material` | `"blackPaint"` | Material do pilar. | Pilaster material. |
| `tool-rail` | `tools[].x` | `-0.6` | Posição do utensílio ao longo da barra (local). | Tool position along the rail (local). |
| `tool-rail` | `tools[].blade` | `[0.36, 0.36]` | Largura e altura da lâmina ou pá. | Blade or peel width and height. |
| `tool-rail` | `tools[].handle` | `1.2` | Comprimento do cabo. | Handle length. |
| `tool-rail` | `tools[].material` | `"steel"` | Material da lâmina ou pá. | Blade or peel material. |

## 10. `models`

Cada entrada é um modelo 3D importado, identificado pelo nome. / Each entry is an imported 3D model, identified by its name.

### 10.1 Campos / Fields

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `url` | string | `"./public/models/pizza-box/pizza-box.glb"` | Caminho do ficheiro glTF ou GLB. | glTF or GLB file path. |
| `scale` | number | `0.016` | Escala base do modelo (opcional). | Base model scale (optional). |
| `align` | string | `"bottom"` | Assenta a base do modelo na posição indicada (opcional). | Rests the model's base on the given position (optional). |
| `instanced` | boolean | `true` | Desenha as cópias numa só operação, para melhor desempenho (opcional). | Draws the copies in one operation, for better performance (optional). |
| `nodeOverrides` | object | `{ "lid": { ... } }` | Muda a `position` e a `rotation` de partes do modelo, pelo nome (opcional). | Changes the `position` and `rotation` of model parts, by name (optional). |
| `emissive.color` | string | `"#fff8ec"` | Cor da luz própria (opcional). | Self-illumination color (optional). |
| `emissive.intensity` | number | `4` | Força da luz própria (opcional). | Self-illumination strength (optional). |
| `clockHands.hours` | object | — | Ponteiro das horas (opcional). | Hour hand (optional). |
| `clockHands.minutes` | object | — | Ponteiro dos minutos (opcional). | Minute hand (optional). |
| `clockHands.seconds` | object | — | Ponteiro dos segundos (opcional). | Second hand (optional). |
| `clockHands.*.node` | string | `"wall_clock_hours_hand"` | Nome da peça no modelo. | Part name in the model. |
| `clockHands.*.restAngle` | number | `306.8` | Ângulo do ponteiro no modelo, em graus. | Hand angle in the model, in degrees. |
| `credit` | string | — | Crédito do modelo. | Model credit. |
| `license` | string | `"CC0-1.0"` | Licença. | License. |
| `sourceUrl` | string | — | Página de origem. | Source page. |

### 10.2 Modelos / Models

| Nome / Name | Colocações / Placements | Português | English |
| --- | --- | --- | --- |
| `pizzas` | 9 | Pizzas prontas. | Finished pizzas. |
| `pizzaBox` | 10 pilhas / stacks | Caixas de pizza. | Pizza boxes. |
| `fluorescentLight` | 48 | Lâmpadas fluorescentes do teto. | Ceiling fluorescent lights. |
| `steelShelves` | 2 | Estantes metálicas. | Steel shelving racks. |
| `enamelPot` | 11 | Tachos esmaltados. | Enamel pots. |
| `ceramicPot` | 8 | Potes de cerâmica. | Ceramic pots. |
| `storageBox` | 17 | Caixas de arrumação. | Storage boxes. |
| `cuttingBoard` | 2 | Tábuas de corte. | Cutting boards. |
| `hatchet` | 1 | Machado. | Hatchet. |
| `fireExtinguisher` | 1 | Extintor. | Fire extinguisher. |
| `wallClock` | 1 | Relógio de parede. | Wall clock. |

## 11. `props`

Cada entrada coloca uma cópia de um modelo na sala. / Each entry places one copy of a model in the room.

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `model` | string | `"pizzas"` | Nome do modelo em `models`. | Model name in `models`. |
| `position` | number[3] | `[-1.5, 1.09, -3.6]` | Posição na sala. | Position in the room. |
| `rotation` | number[3] | `[0, 0.3, 0]` | Rotação em radianos. | Rotation in radians. |
| `scale` | number | `1` | Escala, multiplicada pela `scale` do modelo. | Scale, multiplied by the model's `scale`. |
| `node` | string | `"Pizza_01"` | Usa só esta peça do modelo (opcional). | Uses only this part of the model (optional). |
| `mount` | string | `"ceiling"` | Pertence ao teto e fica escondido com ele (opcional). | Belongs to the ceiling and is hidden with it (optional). |
| `stack.count` | number | `6` | Número de cópias empilhadas (opcional). | Number of stacked copies (optional). |
| `stack.spacing` | number | `0.0648` | Distância vertical entre cópias. | Vertical distance between copies. |
| `stack.seed` | number | `0` | Semente da variação da rotação. | Seed of the rotation variation. |
| `stack.twist` | number | `0.02` | Força da variação da rotação. | Strength of the rotation variation. |

## 12. `lighting`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `ambient.color` | string | `"#ffffff"` | Cor da luz ambiente. | Ambient light color. |
| `ambient.intensity` | number | `0.45` | Intensidade da luz ambiente. | Ambient light intensity. |
| `hemisphere.skyColor` | string | `"#ffffff"` | Cor da luz vinda de cima. | Color of the light from above. |
| `hemisphere.groundColor` | string | `"#d6cfc8"` | Cor da luz vinda de baixo. | Color of the light from below. |
| `hemisphere.intensity` | number | `0.6` | Intensidade da luz hemisférica. | Hemisphere light intensity. |
| `spotlight.color` | string | `"#fff8ef"` | Cor do foco principal. | Key spotlight color. |
| `spotlight.intensity` | number | `40` | Intensidade do foco. | Spotlight intensity. |
| `spotlight.position` | number[3] | `[0.6, 4.05, -0.6]` | Posição do foco. | Spotlight position. |
| `spotlight.target` | number[3] | `[-0.6, 0.95, -3.85]` | Ponto iluminado pelo foco. | Point lit by the spotlight. |
| `spotlight.angle` | number | `1` | Abertura do cone, em radianos. | Cone angle, in radians. |
| `spotlight.penumbra` | number | `0.6` | Suavidade da borda do cone, de 0 a 1. | Softness of the cone edge, from 0 to 1. |
| `spotlight.decay` | number | `1.5` | Perda de intensidade com a distância. | Intensity loss with distance. |
| `spotlight.distance` | number | `18` | Alcance máximo. | Maximum range. |
| `spotlight.castShadow` | boolean | `true` | Projeta sombras. | Casts shadows. |
| `spotlight.shadowMapSize` | number | `2048` | Resolução das sombras. | Shadow resolution. |
| `spotlight.shadowBias` | number | `-0.0003` | Correção de artefactos das sombras. | Shadow artifact correction. |
| `spotlight.shadowNormalBias` | number | `0.02` | Correção de artefactos nas superfícies. | Surface artifact correction. |
| `fill.color` | string | `"#eef3ff"` | Cor da luz direcional de preenchimento. | Directional fill light color. |
| `fill.intensity` | number | `0.55` | Intensidade da luz de preenchimento. | Fill light intensity. |
| `fill.position` | number[3] | `[-4, 9, 9]` | Direção de onde vem a luz. | Direction the light comes from. |
| `ceilingStrips.color` | string | `"#f6f8ff"` | Cor das faixas de luz do teto. | Ceiling light strip color. |
| `ceilingStrips.intensity` | number | `3.5` | Intensidade de cada faixa. | Intensity of each strip. |
| `ceilingStrips.width` | number | `13.5` | Comprimento da faixa (X). | Strip length (X). |
| `ceilingStrips.height` | number | `0.3` | Largura da faixa (Z). | Strip width (Z). |
| `ceilingStrips.y` | number | `4.1` | Altura das faixas. | Strip height. |
| `ceilingStrips.rows` | number[] | `[-3.3, -1, 1.4, 3.6]` | Posição Z de cada fila. | Z position of each row. |
| `ceilingBounce.color` | string | `"#fffaf4"` | Cor da luz refletida no teto. | Color of the light bounced onto the ceiling. |
| `ceilingBounce.intensity` | number | `0.8` | Intensidade da luz refletida. | Bounced light intensity. |
| `ceilingBounce.width` | number | `15` | Largura da área de luz (X). | Light area width (X). |
| `ceilingBounce.height` | number | `9` | Profundidade da área de luz (Z). | Light area depth (Z). |
| `ceilingBounce.y` | number | `3.6` | Altura da área de luz. | Light area height. |
| `ovenFire.color` | string | `"#ff7b30"` | Cor da luz do fogo nas bocas do forno. | Color of the fire light at the oven mouths. |
| `ovenFire.intensity` | number | `1.2` | Intensidade da luz do fogo. | Fire light intensity. |
| `ovenFire.distance` | number | `2.2` | Alcance da luz do fogo. | Fire light range. |
| `ovenFire.decay` | number | `2` | Perda de intensidade da luz do fogo. | Fire light intensity loss. |

## 13. `attribution`

| Campo / Field | Tipo / Type | Exemplo / Example | Português | English |
| --- | --- | --- | --- | --- |
| `asset` | string | `"Pocolov Pizzas"` | Recurso creditado. | Credited asset. |
| `author` | string | `"pocolov"` | Autor. | Author. |
| `license` | string | `"CC-BY-4.0"` | Licença. | License. |
| `url` | string | — | Ligação para a licença ou a origem. | Link to the license or source. |

## 14. Campos que o código não lê / Fields the code does not read

**PT:** Alterar estes campos não muda a cena.

**EN:** Changing these fields does not change the scene.

| Campo / Field | Português | English |
| --- | --- | --- |
| `units`, `coordinateSystem`, `modelSource`, `attribution` | Só documentação. | Documentation only. |
| `credit`, `license`, `sourceUrl` | Só créditos. | Credits only. |
| `equipment[].components` | Lista informativa. | Informative list. |
| `kitchen.materials.wallsOutside` e o material / and the material `brickOutside` | Pertencem a uma opção desativada em `src/room.js`. | Belong to a disabled option in `src/room.js`. |
| `materials.ovenConcrete` | Nenhum objeto o usa. | No object uses it. |

## 15. Implementação futura: adicionar robôs / Future implementation: adding robots

**PT:** Cada robô é uma entrada na lista `robotArms` da linha de montagem. O código constrói todos os robôs da lista, cada um com o seu recipiente, e guarda-os em `this.arms` para a animação.

**EN:** Each robot is an entry in the assembly line's `robotArms` list. The code builds every robot in the list, each with its ingredient bin, and keeps them in `this.arms` for animation.

Exemplo de um quinto robô / Example of a fifth robot:

```json
{
  "id": "arm-extra",
  "x": 3.975,
  "z": -0.5,
  "ingredient": "pepperoni",
  "reach": 0.75,
  "tipHeight": 0.28,
  "yaw": 0,
  "ingredientBin": { "x": 4.395, "z": -0.52 }
}
```

| Ponto / Topic | Português | English |
| --- | --- | --- |
| Espaço / Space | Os robôs atuais estão a cada 1.65 m. Com esse afastamento só cabe mais um, em `x` = 3.975, antes do forno. Para mais, é preciso aproximá-los. | The current robots are 1.65 m apart. At that spacing only one more fits, at `x` = 3.975, before the oven. Adding more requires moving them closer together. |
| Ingrediente / Ingredient | Tem de ser um material de `materials` (`sauce`, `cheese`, `pepperoni` ou `basil`). Um ingrediente novo precisa de um material novo, com as suas texturas. | Must be a material in `materials` (`sauce`, `cheese`, `pepperoni` or `basil`). A new ingredient needs a new material, with its textures. |
| Recipiente / Bin | Só `pepperoni` e `basil` mostram pedaços soltos; os outros aparecem como um bloco. Um ingrediente novo com pedaços exige alterar `addIngredientBin` em `src/assembly_line.js`. | Only `pepperoni` and `basil` show loose pieces; the others appear as a solid block. A new ingredient with pieces requires changing `addIngredientBin` in `src/assembly_line.js`. |
| Alcance / Reach | Se `x` ou `z` mudarem muito, `reach` e `tipHeight` podem precisar de ajuste. | If `x` or `z` change a lot, `reach` and `tipHeight` may need adjusting. |
| Textos / Text | O painel da página ("Conveyor & 4 topping robots", em `src/main.js`) e o `README.md` indicam quatro robôs e não se atualizam sozinhos. | The page panel ("Conveyor & 4 topping robots", in `src/main.js`) and `README.md` state four robots and do not update on their own. |
| Pizzas | `pizzaStages` e as pizzas em `props` mostram a montagem por fases. Um robô novo não as altera, mas a sequência visual pode precisar de ajuste. | `pizzaStages` and the pizzas in `props` show the assembly in stages. A new robot does not change them, but the visual sequence may need adjusting. |

## 16. Implementação futura: texturas mais realistas nos móveis / Future implementation: more realistic furniture textures

**PT:** Os móveis em inox (frigorífico, chapa, fritadeira, lava-loiça, máquina de lavar, bancada de trabalho e exaustor) usam o material `steel`, cujas texturas não são de metal, o que lhes dá um aspeto manchado, mais parecido com pedra. O `darkSteel` tem o mesmo problema.

**EN:** The stainless furniture (refrigerator, griddle, fryer, sink, dishwasher, work counter and exhaust hood) uses the `steel` material, whose textures are not metal, which gives it a mottled, stone-like look. `darkSteel` has the same problem.

| Mapa / Map | Textura atual / Current texture |
| --- | --- |
| `maps.color` | `white_plaster_02` |
| `maps.roughness` | `white_plaster_02` |
| `maps.normal` | `brushed_concrete` |

### Melhorias, por ordem de impacto / Improvements, by impact

| # | Português | English |
| --- | --- | --- |
| 1 | Trocar as texturas por inox escovado verdadeiro, de um site com texturas livres (o enunciado sugere, por exemplo, o ambientCG). Basta descarregar os ficheiros e mudar os caminhos do `steel` e do `darkSteel` no JSON, sem alterar o código. | Replace the textures with real brushed stainless steel from a free texture site (the brief suggests, for example, ambientCG). Only requires downloading the files and changing the `steel` and `darkSteel` paths in the JSON, with no code changes. |
| 2 | Ajustar `roughness`, `normalScale` e `tileSize`, para o escovado ter a escala certa. | Adjust `roughness`, `normalScale` and `tileSize`, so the brushed finish has the right scale. |
| 3 | Dar materiais diferentes a alguns móveis (por exemplo, frente escovada no frigorífico e tampo mais polido nas bancadas). Exige alterar o código, para cada peça escolher o material no JSON. | Give some furniture different materials (for example, a brushed refrigerator front and a more polished counter top). Requires code changes, so that each part chooses its material in the JSON. |

### Limitações / Limitations

| Ponto / Topic | Português | English |
| --- | --- | --- |
| Orientação / Orientation | O escovado depende da orientação da textura, e o código aplica-a da mesma forma em todas as faces. Em algumas o traço pode ficar no sentido errado. | The brushed finish depends on the texture orientation, and the code applies it the same way on every face. On some faces the grain may run the wrong way. |
| Reflexos / Reflections | O metal depende dos reflexos, e o HDRI atual é de um estúdio. Pode ser preciso ajustar `environment.intensity`. | Metal depends on reflections, and the current HDRI is of a studio. `environment.intensity` may need adjusting. |
| Outras peças / Other parts | O `steel` também é usado noutras peças, como as mesas, as guias da passadeira e o dispensador, que mudam também. | `steel` is also used on other parts, such as the tables, conveyor rails and dispenser, which change too. |
| Peso / Size | Cada conjunto de texturas acrescenta cerca de 2 MB, sem efeito significativo no tempo de carregamento. | Each texture set adds about 2 MB, with no significant effect on loading time. |
