# LaPrizza kitchen 3D scene

## Run locally

Open this folder in VS Code with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html` and choose **Open with Live Server** (`http://127.0.0.1:5500/index.html`). A web server is required because the ES modules, the kitchen JSON and the glTF models do not load from a file opened directly.

Three.js is already installed in `node_modules`; the import map in `index.html` also resolves its add-ons (controls, GLTF/HDR loaders, RectAreaLight uniforms). Textures, the HDRI and the fonts are stored in the project (`public/textures/`, `public/hdri/`, `public/fonts/`), so no internet connection is needed.

A specific camera view can be shared with a URL hash: `#view=camX,camY,camZ,targetX,targetY,targetZ` (e.g. `#view=-1.2,1.75,-1.2,-0.3,1.15,-3.6` for a close-up of a topping robot).

## Scene decisions

- **Units and origin:** one Three.js world unit equals one meter. The kitchen is 16 m × 10 m × 4.2 m, with the floor center at `[0, 0, 0]`, Y up and +Z towards the open (camera) side.
- **Reference look:** the layout follows the supplied reference render: red-brick walls, black steel pilasters and ceiling beam, white plaster ceiling with rows of linear fluorescent fixtures, a polished light floor, a long concrete counter on white steel portal frames, white articulated robots along a grey belt and a wood-fired oven with a steel flue and an open firewood store underneath.
- **Layout (US2):** `public/kitchen-layout.json` is the single source of truth: kitchen dimensions, materials and texture paths, every equipment item (`type`, position, rotation, scale, dimensions and type-specific parameters), imported model paths (`models`) and their placements (`props`), camera limits, environment map and lights. Equipment: assembly line and wood-fired tunnel oven on the rear wall; griddle + charbroiler grill, deep fryer, work counter and exhaust hood on the right wall; refrigerator, sink, dishwasher and storage racks on the left wall; a fire extinguisher on the rear wall, right of the oven; dough preparation table in the middle; ingredient shelves and a tool rail with pizza peels on the walls.
- **Assembly line (US3):** a 10.55 m concrete counter runs along the rear wall. From left to right: an overhead crust dispenser (glass magazine with a stack of crusts, fed by a pipe from the ceiling and hung from a white gantry) above a rectangular stainless receiving platform, integrated at belt height at the start of the line; a 9.5 m conveyor belt; four articulated 6-axis-style robots (sauce, cheese, pepperoni, basil), each next to its ingredient pan; and a rustic wood-fired brick tunnel oven. The belt reaches the oven mouth, where it meets a mesh oven belt that runs straight through the vaulted brick chamber (arched mouths with copper trim on both ends), so baked pizzas come out on the far side onto a stainless exit tray; a single-mouth dome oven would need a peel or extra robot to take pizzas out. Pizzas on the belt show the assembly progression: bare dough → sauce → cheese → finished pizzas. A procedural dome oven (`type: "wood-fired-oven"`) is still available in the code as an alternative.
- **Ready for Sprint 3 animation:** the dispenser, crust stack, belt surface and each robot joint (`turret`, `shoulder`, `elbow`, `wrist`) are separate named groups, exposed as properties of the `AssemblyLine` class in `src/assembly_line.js` (`arms`, `dispenser`, `crusts`, `conveyor`, `beltSurface`), which has an `update(deltaT)` method called every frame. Robot poses come from a small 2-link inverse-kinematics solver (`solveArmPose`) driven by `reach`/`tipHeight` in the JSON, so animating the arms only means changing those targets. The belt material has its own texture instance, so its offset can be animated. The tunnel oven's belt is a separate group (`oven-belt`), but it still needs its own textured surface before it can be animated.
- **Procedural vs imported models:** the room, counters, oven, dispenser, conveyor and robots are procedural, because they must match exact dimensions and be animated part by part. Small, detail-heavy objects are imported glTF models (paths in the JSON): pizzas, fluorescent fixtures, steel racks, pots, storage boxes, cutting boards, hatchet, fire extinguisher and wall clock. The Pocolov Pizzas model was reduced to a 10-pizza subset (4.5 MB instead of 11 MB) to keep loading fast.
- **Materials and textures (US4):** every procedural material has a color map plus roughness and normal maps (Poly Haven 1K JPG, CC0). Geometry UVs are generated in meters and each material defines a `tileSize`, so texel density is consistent across objects of different sizes. Each material clones the shared texture (same image, uploaded once), so repeats can differ per material. Painted steel, stainless steel and robot shells use neutral low-contrast plaster maps tinted per material (with a brushed normal map for steel), because Poly Haven's metal textures are dark diamond plates. Diversity comes from different tints, map scales and the 10 distinct pizza textures; firewood is a seeded instanced mesh with varied radius and rotation. No texture is generated procedurally.
- **Render style:** realistic PBR (`MeshStandardMaterial`, ACES tone mapping), no cel shading, because the user stories ask for realistic surfaces. A neutral studio HDRI (Poly Haven "Studio Small 09", 1K) is used only for reflections on metal, not as background.
- **Lighting (US5):** ambient light + hemisphere light for base visibility, one shadow-casting spotlight (2048 shadow map) over the assembly line, a soft directional fill, one rectangular area light per row of fluorescent fixtures, a faint upward area light for ceiling bounce and orange point lights at the oven mouths. Only the spotlight casts shadows to keep performance stable. The setup works at every zoom level because the ambient/hemisphere/environment terms do not depend on the camera.
- **Camera (US7):** the perspective camera's initial target is the kitchen floor center. Left drag pans (target clamped inside the kitchen), right drag orbits, the wheel dollies (2.2–26 m); damping and polar-angle limits keep movement smooth and above the floor. The walls are double-sided, so they stay visible from outside the room; the ceiling and its fixtures are hidden when the camera is above it, giving a cut-away overview.
- **Logo menu and 2D plan:** clicking the LaPrizza logo opens a menu with *Reset view* (back to the initial 3D view) and *View 2D* (a top-down floor plan generated from the layout JSON by `src/floor_plan.js`; the option changes to *View 3D* while the plan is open). The same plan is shown automatically, without the menu, when WebGL is unavailable.
- **Loading:** the scene is only shown once the imported models, textures and HDRI have finished loading and the scene has been prepared on the graphics card; until then the page shows "Preparing the kitchen…". A file that fails to load does not block the scene, and a missing texture map shows a warning.
- **Code organization:** `src/main.js` sets up the page, renderer, materials, lights and render loop, and places the imported models listed in `props`. The objects are built in `src/room.js` (floor, walls, ceiling), `src/ovens.js`, `src/appliances.js` (refrigerator, griddle, fryer, work counter, exhaust hood, sink, dishwasher), `src/furniture.js` (tables, wall shelves, tool rail, pilasters), `src/assembly_line.js` and `src/wall_clock.js`; `src/equipment.js` chooses the function for each JSON `type`, `src/floor_plan.js` draws the 2D plan and `src/mesh_helpers.js` holds the shared geometry helpers.

## Credits

- **Poly Haven** (CC0 1.0, [license](https://polyhaven.com/license)): all PBR textures, the "Studio Small 09" HDRI and the models Mounted Fluorescent Lights, Steel Frame Shelves 02, Enamel Pot 01, Ceramic Pot, Plastic Container, Wooden Cutting Board, Hatchet, Korean Fire Extinguisher 01 and Wall Clock (`public/models/polyhaven/`; the clock is driven by the `WallClock` class in `src/wall_clock.js`).
- **Kenney** (CC0 1.0): "Pizza Box" from the [Food Kit](https://kenney.nl/assets/food-kit) (`public/models/pizza-box/`, license text included). Stacked closed boxes on the lower shelf of the dough preparation table, drawn with instancing; lid-closing and stacking logic adapted from the LaPrizza project.
- This work is based on ["Pocolov Pizzas"](https://sketchfab.com/3d-models/pocolov-pizzas-18c884b3805a45728cf350ee6a377f95) by [pocolov](https://sketchfab.com/pocolov), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). A 10-pizza subset is stored in `public/models/pocolov-pizzas/` together with the original license text.

## Downloaded asset sources

These files were originally loaded from the internet and are now stored in the project. Each row gives the local file and the address it was downloaded from.

### Textures and HDRI

Author: [Poly Haven](https://polyhaven.com). License: [CC0 1.0](https://polyhaven.com/license). Resolution: 1K.

| Local file | Downloaded from |
| --- | --- |
| `public/hdri/studio_small_09_1k.hdr` | <https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr> |
| `public/textures/concrete_wall_008/concrete_wall_008_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_008/concrete_wall_008_diff_1k.jpg> |
| `public/textures/concrete_wall_008/concrete_wall_008_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_008/concrete_wall_008_rough_1k.jpg> |
| `public/textures/concrete_wall_008/concrete_wall_008_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_008/concrete_wall_008_nor_gl_1k.jpg> |
| `public/textures/large_red_bricks/large_red_bricks_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/large_red_bricks/large_red_bricks_diff_1k.jpg> |
| `public/textures/large_red_bricks/large_red_bricks_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/large_red_bricks/large_red_bricks_rough_1k.jpg> |
| `public/textures/large_red_bricks/large_red_bricks_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/large_red_bricks/large_red_bricks_nor_gl_1k.jpg> |
| `public/textures/white_plaster_02/white_plaster_02_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_plaster_02/white_plaster_02_diff_1k.jpg> |
| `public/textures/white_plaster_02/white_plaster_02_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_plaster_02/white_plaster_02_rough_1k.jpg> |
| `public/textures/white_plaster_02/white_plaster_02_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_plaster_02/white_plaster_02_nor_gl_1k.jpg> |
| `public/textures/brushed_concrete/brushed_concrete_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brushed_concrete/brushed_concrete_diff_1k.jpg> |
| `public/textures/brushed_concrete/brushed_concrete_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brushed_concrete/brushed_concrete_rough_1k.jpg> |
| `public/textures/brushed_concrete/brushed_concrete_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brushed_concrete/brushed_concrete_nor_gl_1k.jpg> |
| `public/textures/rubber_tiles/rubber_tiles_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rubber_tiles/rubber_tiles_rough_1k.jpg> |
| `public/textures/rubber_tiles/rubber_tiles_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rubber_tiles/rubber_tiles_nor_gl_1k.jpg> |
| `public/textures/bark_brown_02/bark_brown_02_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_diff_1k.jpg> |
| `public/textures/bark_brown_02/bark_brown_02_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_rough_1k.jpg> |
| `public/textures/bark_brown_02/bark_brown_02_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_nor_gl_1k.jpg> |
| `public/textures/wood_table/wood_table_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table/wood_table_diff_1k.jpg> |
| `public/textures/wood_table/wood_table_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table/wood_table_rough_1k.jpg> |
| `public/textures/wood_table/wood_table_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table/wood_table_nor_gl_1k.jpg> |

### Fonts

DM Sans and Playfair Display from [Google Fonts](https://fonts.google.com), SIL Open Font License 1.1 (license texts in `public/fonts/OFL-DMSans.txt` and `public/fonts/OFL-PlayfairDisplay.txt`). Only the `latin` and `latin-ext` subsets are included; `public/fonts/fonts.css` declares them.

| Local file | Downloaded from |
| --- | --- |
| `public/fonts/DMSans-normal-latin-ext.woff2` | <https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopwDRUUHvP-6oMc49xLtf07PCg&skey=cd068b3e1b767e51&v=v17> |
| `public/fonts/DMSans-normal-latin.woff2` | <https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopwDRUUHvP-6oMc49xLtf0DPCg&skey=cd068b3e1b767e51&v=v17> |
| `public/fonts/PlayfairDisplay-italic-latin-ext.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFeD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqTDN3oCIU3oE2BEqj_M4vtR0g&skey=f57a6d1e6bccdd9c&v=v40> |
| `public/fonts/PlayfairDisplay-italic-latin.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFeD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqTDN3oCIU3oE2BEqj_M4vjR0g&skey=f57a6d1e6bccdd9c&v=v40> |
| `public/fonts/PlayfairDisplay-normal-latin-ext.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFcD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vSLbRiIwYe6tDkqUBOz5frvh&skey=f3b68f0152604ed9&v=v40> |
| `public/fonts/PlayfairDisplay-normal-latin.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFcD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vSLbRiIwYe6tDkqUBOz5cLvh&skey=f3b68f0152604ed9&v=v40> |

## Layout data

The scene fetches `public/kitchen-layout.json` at runtime. To move an item, edit its `position`/`rotation`/`scale`; to add one, add an `equipment` entry with an existing `type` (or a `props` entry pointing to a model in `models`). Positions and dimensions are in meters. Every field is described in [`JSONschema.md`](JSONschema.md).

---

# Cena 3D da cozinha LaPrizza (Português)

## Executar localmente

Abra esta pasta no VS Code com a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), clique com o botão direito no `index.html` e escolha **Open with Live Server** (`http://127.0.0.1:5500/index.html`). É necessário um servidor web porque os módulos ES, o JSON da cozinha e os modelos glTF não carregam a partir de um ficheiro aberto diretamente.

O Three.js já está instalado em `node_modules`; o import map do `index.html` também resolve os seus extras (controlos, carregadores GLTF/HDR, uniforms das RectAreaLight). As texturas, o HDRI e os tipos de letra estão guardados no projeto (`public/textures/`, `public/hdri/`, `public/fonts/`), por isso não é necessária ligação à internet.

É possível partilhar uma vista específica da câmara com um hash no URL: `#view=camX,camY,camZ,alvoX,alvoY,alvoZ` (ex.: `#view=-1.2,1.75,-1.2,-0.3,1.15,-3.6` para ver de perto um robô de ingredientes).

## Decisões da cena

- **Unidades e origem:** uma unidade do mundo Three.js equivale a um metro. A cozinha tem 16 m × 10 m × 4,2 m, com o centro do chão em `[0, 0, 0]`, o Y para cima e o +Z virado para o lado aberto (da câmara).
- **Aspeto de referência:** o layout segue a imagem de referência fornecida: paredes de tijolo vermelho, pilares e viga do teto em aço preto, teto em gesso branco com filas de lâmpadas fluorescentes lineares, chão claro polido, uma bancada comprida de betão sobre pórticos de aço branco, robôs articulados brancos ao longo de um tapete cinzento e um forno a lenha com chaminé de aço e arrumação de lenha aberta por baixo.
- **Layout (US2):** o `public/kitchen-layout.json` é a única fonte de verdade: dimensões da cozinha, materiais e caminhos das texturas, cada equipamento (`type`, posição, rotação, escala, dimensões e parâmetros específicos do tipo), caminhos dos modelos importados (`models`) e as suas colocações (`props`), limites da câmara, mapa de ambiente e luzes. Equipamentos: linha de montagem e forno de túnel a lenha na parede do fundo; chapa + grelhador, fritadeira, bancada de trabalho e exaustor na parede direita; frigorífico, lava-loiça, máquina de lavar e estantes de arrumação na parede esquerda; extintor na parede do fundo, à direita do forno; mesa de preparação de massa ao centro; prateleiras de ingredientes e uma barra de utensílios com pás de pizza nas paredes.
- **Linha de montagem (US3):** uma bancada de betão com 10,55 m percorre a parede do fundo. Da esquerda para a direita: um dispensador suspenso de massas (tubo de vidro com uma pilha de massas, alimentado por um tubo vindo do teto e pendurado num pórtico branco) por cima de uma plataforma de receção retangular em inox, integrada à altura do tapete no início da linha; um tapete rolante de 9,5 m; quatro robôs articulados ao estilo de 6 eixos (molho, queijo, pepperoni, manjericão), cada um ao lado do seu recipiente de ingredientes; e um forno de túnel rústico em tijolo, a lenha. O tapete chega à boca do forno, onde encontra um tapete de malha que atravessa a câmara abobadada de tijolo (bocas em arco com remates de cobre nas duas pontas), por isso as pizzas cozidas saem do outro lado para um tabuleiro de saída em inox; um forno de cúpula com uma só boca precisaria de uma pá ou de um robô extra para retirar as pizzas. As pizzas no tapete mostram a progressão da montagem: só massa → molho → queijo → pizzas prontas. Um forno de cúpula procedimental (`type: "wood-fired-oven"`) continua disponível no código como alternativa.
- **Preparado para a animação do Sprint 3:** o dispensador, a pilha de massas, a superfície do tapete e cada articulação dos robôs (`turret`, `shoulder`, `elbow`, `wrist`) são grupos separados com nome, acessíveis como propriedades da classe `AssemblyLine` em `src/assembly_line.js` (`arms`, `dispenser`, `crusts`, `conveyor`, `beltSurface`), que tem um método `update(deltaT)` chamado em cada frame. As poses dos robôs vêm de um pequeno solver de cinemática inversa de 2 segmentos (`solveArmPose`) controlado por `reach`/`tipHeight` no JSON, por isso animar os braços é só mudar esses alvos. O material do tapete tem a sua própria instância de textura, por isso o seu deslocamento pode ser animado. O tapete do forno de túnel é um grupo separado (`oven-belt`), mas ainda precisa de uma superfície própria com textura para poder ser animado.
- **Modelos procedimentais vs importados:** a sala, as bancadas, o forno, o dispensador, o tapete e os robôs são procedimentais, porque têm de corresponder a dimensões exatas e ser animados peça a peça. Objetos pequenos e cheios de detalhe são modelos glTF importados (caminhos no JSON): pizzas, lâmpadas fluorescentes, estantes de aço, tachos, caixas de arrumação, tábuas de corte, machado, extintor e relógio de parede. O modelo Pocolov Pizzas foi reduzido a um subconjunto de 10 pizzas (4,5 MB em vez de 11 MB) para manter o carregamento rápido.
- **Materiais e texturas (US4):** cada material procedimental tem um color map mais roughness map e normal map (Poly Haven, JPG 1K, CC0). As UVs das geometrias são geradas em metros e cada material define um `tileSize`, por isso a densidade da textura é consistente entre objetos de tamanhos diferentes. Cada material clona a textura partilhada (mesma imagem, enviada uma só vez para a GPU), por isso a repetição pode ser diferente por material. O aço pintado, o inox e as carcaças dos robôs usam mapas neutros de gesso, de baixo contraste, com uma cor por material (com um normal map escovado para o aço), porque as texturas de metal da Poly Haven são chapas xadrez escuras. A diversidade vem das diferentes cores, escalas dos mapas e das 10 texturas de pizza distintas; a lenha é uma malha instanciada com semente, com raio e rotação variados. Nenhuma textura é gerada proceduralmente.
- **Estilo de renderização:** PBR realista (`MeshStandardMaterial`, tone mapping ACES), sem cel shading, porque as user stories pedem superfícies realistas. Um HDRI neutro de estúdio (Poly Haven "Studio Small 09", 1K) é usado só para os reflexos no metal, e não como fundo.
- **Iluminação (US5):** luz ambiente + luz hemisférica para visibilidade base, um spotlight com sombras (shadow map 2048) sobre a linha de montagem, uma luz direcional suave de preenchimento, uma luz de área retangular por cada fila de lâmpadas fluorescentes, uma luz de área fraca virada para cima para o reflexo no teto e luzes pontuais laranja nas bocas do forno. Só o spotlight projeta sombras, para manter o desempenho estável. A configuração funciona em qualquer nível de zoom porque as componentes ambiente/hemisférica/ambiente HDR não dependem da câmara.
- **Câmara (US7):** o alvo inicial da câmara em perspetiva é o centro do chão da cozinha. Arrastar com o botão esquerdo desloca (com o alvo limitado ao interior da cozinha), arrastar com o direito roda em órbita e a roda do rato aproxima/afasta (2,2–26 m); o amortecimento e os limites do ângulo polar mantêm o movimento suave e acima do chão. As paredes têm duas faces, por isso continuam visíveis de fora da sala; o teto e as suas lâmpadas ficam escondidos quando a câmara está acima dele, dando uma vista em corte.
- **Menu do logótipo e planta 2D:** clicar no logótipo LaPrizza abre um menu com *Reset view* (volta à vista 3D inicial) e *View 2D* (uma planta vista de cima gerada a partir do JSON do layout pelo `src/floor_plan.js`; a opção passa a *View 3D* enquanto a planta está aberta). A mesma planta aparece automaticamente, sem o menu, quando o WebGL não está disponível.
- **Carregamento:** a cena só é mostrada depois de os modelos importados, as texturas e o HDRI terem terminado de carregar e de a cena estar preparada na placa gráfica; até lá a página mostra "Preparing the kitchen…". Um ficheiro que não carregue não impede a cena de aparecer, e um mapa de textura em falta mostra um aviso.
- **Organização do código:** o `src/main.js` prepara a página, o renderizador, os materiais, as luzes e o ciclo de desenho, e coloca os modelos importados listados em `props`. Os objetos são construídos em `src/room.js` (chão, paredes, teto), `src/ovens.js`, `src/appliances.js` (frigorífico, chapa, fritadeira, bancada de trabalho, exaustor, lava-loiça, máquina de lavar), `src/furniture.js` (mesas, prateleiras de parede, barra de utensílios, pilares), `src/assembly_line.js` e `src/wall_clock.js`; o `src/equipment.js` escolhe a função para cada `type` do JSON, o `src/floor_plan.js` desenha a planta 2D e o `src/mesh_helpers.js` guarda as funções auxiliares de geometria partilhadas.

## Créditos

- **Poly Haven** (CC0 1.0, [licença](https://polyhaven.com/license)): todas as texturas PBR, o HDRI "Studio Small 09" e os modelos Mounted Fluorescent Lights, Steel Frame Shelves 02, Enamel Pot 01, Ceramic Pot, Plastic Container, Wooden Cutting Board, Hatchet, Korean Fire Extinguisher 01 e Wall Clock (`public/models/polyhaven/`; o relógio é controlado pela classe `WallClock` em `src/wall_clock.js`).
- **Kenney** (CC0 1.0): "Pizza Box" do [Food Kit](https://kenney.nl/assets/food-kit) (`public/models/pizza-box/`, com o texto da licença). Pilhas de caixas fechadas na prateleira de baixo da mesa de preparação de massa, desenhadas com instancing; a lógica de fechar a tampa e empilhar foi adaptada do projeto LaPrizza.
- Este trabalho baseia-se em ["Pocolov Pizzas"](https://sketchfab.com/3d-models/pocolov-pizzas-18c884b3805a45728cf350ee6a377f95) de [pocolov](https://sketchfab.com/pocolov), licenciado sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Um subconjunto de 10 pizzas está guardado em `public/models/pocolov-pizzas/`, juntamente com o texto original da licença.

## Origem dos ficheiros descarregados

Estes ficheiros eram carregados da internet e estão agora guardados no projeto. Cada linha indica o ficheiro local e o endereço de onde foi descarregado.

### Texturas e HDRI

Autor: [Poly Haven](https://polyhaven.com). Licença: [CC0 1.0](https://polyhaven.com/license). Resolução: 1K.

| Ficheiro local | Descarregado de |
| --- | --- |
| `public/hdri/studio_small_09_1k.hdr` | <https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr> |
| `public/textures/concrete_wall_008/concrete_wall_008_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_008/concrete_wall_008_diff_1k.jpg> |
| `public/textures/concrete_wall_008/concrete_wall_008_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_008/concrete_wall_008_rough_1k.jpg> |
| `public/textures/concrete_wall_008/concrete_wall_008_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_wall_008/concrete_wall_008_nor_gl_1k.jpg> |
| `public/textures/large_red_bricks/large_red_bricks_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/large_red_bricks/large_red_bricks_diff_1k.jpg> |
| `public/textures/large_red_bricks/large_red_bricks_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/large_red_bricks/large_red_bricks_rough_1k.jpg> |
| `public/textures/large_red_bricks/large_red_bricks_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/large_red_bricks/large_red_bricks_nor_gl_1k.jpg> |
| `public/textures/white_plaster_02/white_plaster_02_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_plaster_02/white_plaster_02_diff_1k.jpg> |
| `public/textures/white_plaster_02/white_plaster_02_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_plaster_02/white_plaster_02_rough_1k.jpg> |
| `public/textures/white_plaster_02/white_plaster_02_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/white_plaster_02/white_plaster_02_nor_gl_1k.jpg> |
| `public/textures/brushed_concrete/brushed_concrete_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brushed_concrete/brushed_concrete_diff_1k.jpg> |
| `public/textures/brushed_concrete/brushed_concrete_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brushed_concrete/brushed_concrete_rough_1k.jpg> |
| `public/textures/brushed_concrete/brushed_concrete_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brushed_concrete/brushed_concrete_nor_gl_1k.jpg> |
| `public/textures/rubber_tiles/rubber_tiles_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rubber_tiles/rubber_tiles_rough_1k.jpg> |
| `public/textures/rubber_tiles/rubber_tiles_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/rubber_tiles/rubber_tiles_nor_gl_1k.jpg> |
| `public/textures/bark_brown_02/bark_brown_02_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_diff_1k.jpg> |
| `public/textures/bark_brown_02/bark_brown_02_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_rough_1k.jpg> |
| `public/textures/bark_brown_02/bark_brown_02_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/bark_brown_02/bark_brown_02_nor_gl_1k.jpg> |
| `public/textures/wood_table/wood_table_diff_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table/wood_table_diff_1k.jpg> |
| `public/textures/wood_table/wood_table_rough_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table/wood_table_rough_1k.jpg> |
| `public/textures/wood_table/wood_table_nor_gl_1k.jpg` | <https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/wood_table/wood_table_nor_gl_1k.jpg> |

### Tipos de letra

DM Sans e Playfair Display do [Google Fonts](https://fonts.google.com), SIL Open Font License 1.1 (textos da licença em `public/fonts/OFL-DMSans.txt` e `public/fonts/OFL-PlayfairDisplay.txt`). Só estão incluídos os subconjuntos `latin` e `latin-ext`; o `public/fonts/fonts.css` declara-os.

| Ficheiro local | Descarregado de |
| --- | --- |
| `public/fonts/DMSans-normal-latin-ext.woff2` | <https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopwDRUUHvP-6oMc49xLtf07PCg&skey=cd068b3e1b767e51&v=v17> |
| `public/fonts/DMSans-normal-latin.woff2` | <https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopwDRUUHvP-6oMc49xLtf0DPCg&skey=cd068b3e1b767e51&v=v17> |
| `public/fonts/PlayfairDisplay-italic-latin-ext.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFeD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqTDN3oCIU3oE2BEqj_M4vtR0g&skey=f57a6d1e6bccdd9c&v=v40> |
| `public/fonts/PlayfairDisplay-italic-latin.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFeD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqTDN3oCIU3oE2BEqj_M4vjR0g&skey=f57a6d1e6bccdd9c&v=v40> |
| `public/fonts/PlayfairDisplay-normal-latin-ext.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFcD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vSLbRiIwYe6tDkqUBOz5frvh&skey=f3b68f0152604ed9&v=v40> |
| `public/fonts/PlayfairDisplay-normal-latin.woff2` | <https://fonts.gstatic.com/l/font?kit=nuFcD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vSLbRiIwYe6tDkqUBOz5cLvh&skey=f3b68f0152604ed9&v=v40> |

## Dados do layout

A cena carrega o `public/kitchen-layout.json` durante a execução. Para mover um item, edite a sua `position`/`rotation`/`scale`; para acrescentar um, adicione uma entrada em `equipment` com um `type` existente (ou uma entrada em `props` que aponte para um modelo em `models`). As posições e dimensões estão em metros. Todos os campos estão descritos em [`JSONschema.md`](JSONschema.md).
