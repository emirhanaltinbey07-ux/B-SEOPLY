import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BOARD_TILES } from '../game/data';
import { CharacterAvatarId } from '../game/types';
import { createBoardElements, BoardElements } from './boardElements';
import {
  getDiceCameraTimings,
  getExpressionForAnimMode,
  CharacterReactionMode,
} from './characterExpressions';
import { animateCharacterPose } from './characters';
import { createIstanbulEnvironment, IstanbulEnvironment } from './environment';
import { createCardDeckTexture, createCardFrontTexture } from './materials';

export interface SceneCallbacks {
  onClickTile: (tileIndex: number) => void;
  onClickQuestionDeck: () => void;
  onClickPropertyDeck: () => void;
  onClickChanceDeck: () => void;
  onClickDice: () => void;
  onClickVaultChest: () => void;
}

interface DiceAnimation {
  active: boolean;
  startTimeMs: number;
  durationMs: number;
  targetValue: number;
  startRot: THREE.Euler;
  targetRot: THREE.Euler;
  arcX: number;
  arcZ: number;
  peakHeight: number;
  onComplete: () => void;
}

interface StudentRunAnimation {
  active: boolean;
  teamId: number;
  waypoints: THREE.Vector3[];
  segmentIdx: number;
  segmentStartMs: number;
  segmentDurationMs: number;
  entryStartMs: number;
  entryDurationMs: number;
  entryFromPos: THREE.Vector3;
  entryFromLookAt: THREE.Vector3;
  walkingStarted: boolean;
  fpsForward: THREE.Vector3;
  onStep?: (stepIdx: number) => void;
  onComplete: () => void;
}

interface CardFlipAnimation {
  active: boolean;
  startTimeMs: number;
  durationMs: number;
  startPos: THREE.Vector3;
  peakPos: THREE.Vector3;
  onComplete: () => void;
}

interface CharacterReaction {
  teamId: number;
  mode: CharacterReactionMode;
  endTimeMs: number;
  faceCameraYaw: number | null;
}

interface CameraTween {
  active: boolean;
  startTimeMs: number;
  durationMs: number;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startLook: THREE.Vector3;
  endLook: THREE.Vector3;
}

const _vec3 = new THREE.Vector3();
const _segDir = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _fpsCamPos = new THREE.Vector3();
const _fpsLookAt = new THREE.Vector3();
const _pointer = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function getDiceTargetRotation(value: number): THREE.Euler {
  switch (value) {
    case 1:
      return new THREE.Euler(0, 0, 0);
    case 6:
      return new THREE.Euler(Math.PI, 0, 0);
    case 2:
      return new THREE.Euler(-Math.PI / 2, 0, 0);
    case 5:
      return new THREE.Euler(Math.PI / 2, 0, 0);
    case 3:
      return new THREE.Euler(0, 0, Math.PI / 2);
    case 4:
      return new THREE.Euler(0, 0, -Math.PI / 2);
    default:
      return new THREE.Euler(0, 0, 0);
  }
}

export class IstanbulSceneController {
  public readonly isSoftwareGl: boolean;
  private readonly container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly raycaster = new THREE.Raycaster();
  private readonly env: IstanbulEnvironment;
  private readonly board: BoardElements;
  private readonly callbacks: SceneCallbacks;
  private readonly maxAniso: number;

  private frameId = 0;
  private disposed = false;
  private lastNowMs = performance.now();
  private elapsedTotal = 0;

  private titleOrbitMode = true;
  private cameraTween: CameraTween | null = null;
  private desiredCamPos = new THREE.Vector3(-23.0, 27.5, 30.5);
  private desiredLookAt = new THREE.Vector3(0, -0.2, 1.8);

  private activeTileHighlight = 0;
  private highlightQuestionDeck = false;
  private highlightPropertyDeck = false;
  private highlightChanceDeck = false;
  private jailedTeamIds = new Set<number>();

  private lastHoverCheck = 0;
  private pointerDownPos = new THREE.Vector2();

  private diceAnim: DiceAnimation | null = null;
  private runAnim: StudentRunAnimation | null = null;
  private cardAnim: CardFlipAnimation | null = null;
  private reaction: CharacterReaction | null = null;

  private resizeObserver: ResizeObserver;
  private envMapTexture: THREE.Texture | null = null;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 240);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x5eb8f2);
    // Keep foreground board & Istanbul landmarks 100% crisp and saturated; gentle haze only on distant horizon
    this.scene.fog = new THREE.Fog(0x7cc8f5, 92, 235);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMapTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envMapTexture;
    this.scene.environmentIntensity = 0.36;
    pmrem.dispose();

    const initialAspect = width / height;
    this.camera = new THREE.PerspectiveCamera(this.computeBaseFov(initialAspect), initialAspect, 0.4, 480);
    const overviewDistScale = this.computeOverviewScale(initialAspect);
    this.camera.position.set(-23.0 * overviewDistScale, 27.5 * overviewDistScale, 30.5 * overviewDistScale);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.8;
    this.controls.maxDistance = 86;
    this.controls.maxPolarAngle = Math.PI * 0.485;
    this.controls.minPolarAngle = 0.25;
    this.controls.target.set(0, -0.2, 1.8);
    this.controls.addEventListener('start', () => {
      this.cameraTween = null;
    });

    const hemiLight = new THREE.HemisphereLight(0x9bd8ff, 0x456b2e, 0.62);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff4d6, 1.78);
    sunLight.position.set(24, 38, 18);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.left = -32;
    sunLight.shadow.camera.right = 32;
    sunLight.shadow.camera.top = 32;
    sunLight.shadow.camera.bottom = -32;
    sunLight.shadow.camera.near = 6;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x52b8f7, 0.45);
    rimLight.position.set(-28, 18, -24);
    this.scene.add(rimLight);

    this.env = createIstanbulEnvironment();
    this.scene.add(this.env.group);

    this.board = createBoardElements(this.maxAniso);
    this.scene.add(this.board.root);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.addEventListener('webglcontextlost', this.handleContextLost);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    this.lastNowMs = performance.now();
    this.tick();
  }

  private handleContextLost = (e: Event) => {
    e.preventDefault();
  };

  private computeBaseFov(aspect: number): number {
    if (aspect < 0.85) {
      // Portrait phone/tablet: widen vertical FOV smoothly so all 4 sides of the 3D board stay in frame
      const t = Math.min(1, Math.max(0, (0.85 - aspect) / 0.45));
      return 42 + t * 14;
    }
    return 42;
  }

  private computeOverviewScale(aspect: number): number {
    if (aspect < 0.85) {
      const t = Math.min(1, Math.max(0, (0.85 - aspect) / 0.45));
      return 1 + t * 0.34;
    }
    return 1;
  }

  private handleResize() {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 320);
    const height = Math.max(this.container.clientHeight, 240);
    this.camera.aspect = width / height;
    if (!this.runAnim?.active) {
      this.camera.fov = this.computeBaseFov(this.camera.aspect);
    }
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setPointerNDC(clientX: number, clientY: number) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handlePointerDown = (e: PointerEvent) => {
    this.pointerDownPos.set(e.clientX, e.clientY);
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (this.titleOrbitMode) return;
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    if (dx * dx + dy * dy > 81) return;

    this.setPointerNDC(e.clientX, e.clientY);
    this.raycaster.setFromCamera(_pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.board.interactables, false);
    if (hits.length === 0) return;

    const hitData = hits[0].object.userData;
    if (hitData.interactType === 'question_deck') {
      this.callbacks.onClickQuestionDeck();
    } else if (hitData.interactType === 'property_deck') {
      this.callbacks.onClickPropertyDeck();
    } else if (hitData.interactType === 'chance_deck') {
      this.callbacks.onClickChanceDeck();
    } else if (hitData.interactType === 'dice') {
      this.callbacks.onClickDice();
    } else if (hitData.interactType === 'vault_chest') {
      this.callbacks.onClickVaultChest();
    } else if (hitData.interactType === 'tile' && typeof hitData.tileIndex === 'number') {
      this.callbacks.onClickTile(hitData.tileIndex);
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (this.titleOrbitMode) return;
    const now = performance.now();
    if (now - this.lastHoverCheck < 75) return;
    this.lastHoverCheck = now;

    this.setPointerNDC(e.clientX, e.clientY);
    this.raycaster.setFromCamera(_pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.board.interactables, false);
    this.renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
  };

  public setTitleOrbitMode(enabled: boolean) {
    const wasTitle = this.titleOrbitMode;
    this.titleOrbitMode = enabled;
    if (enabled && this.runAnim) {
      const movingPawn = this.board.pawns[this.runAnim.teamId];
      if (movingPawn) movingPawn.group.visible = true;
      this.runAnim = null;
    }
    this.controls.enabled = !enabled && !this.runAnim?.active;
    if (wasTitle && !enabled && !this.runAnim?.active) {
      this.focusOverview();
    }
  }

  private setCameraStageAttr(stage: string) {
    if (typeof document !== 'undefined') {
      document.body.dataset.cameraStage = stage;
    }
  }

  private startCameraTween(
    endPosX: number,
    endPosY: number,
    endPosZ: number,
    endLookX: number,
    endLookY: number,
    endLookZ: number,
    durationMs: number
  ) {
    this.desiredCamPos.set(endPosX, endPosY, endPosZ);
    this.desiredLookAt.set(endLookX, endLookY, endLookZ);
    this.cameraTween = {
      active: true,
      startTimeMs: performance.now(),
      durationMs: Math.max(120, durationMs),
      startPos: this.camera.position.clone(),
      endPos: this.desiredCamPos.clone(),
      startLook: this.controls.target.clone(),
      endLook: this.desiredLookAt.clone(),
    };
  }

  public focusOverview(fast = false) {
    const scale = this.computeOverviewScale(this.camera.aspect);
    const dur = this.isSoftwareGl ? (fast ? 380 : 460) : fast ? 680 : 850;
    this.startCameraTween(
      -23.0 * scale,
      27.5 * scale,
      30.5 * scale,
      0,
      -0.2,
      1.8,
      dur
    );
    this.setCameraStageAttr('board_overview');
  }

  public focusTile(tileIndex: number) {
    const tile = BOARD_TILES[tileIndex];
    if (!tile) return;
    this.activeTileHighlight = tileIndex;
    const lx = tile.landmarkPos ? (tile.boardPos[0] + tile.landmarkPos[0]) * 0.45 : tile.boardPos[0] * 0.85;
    const lz = tile.landmarkPos ? (tile.boardPos[1] + tile.landmarkPos[1]) * 0.45 : tile.boardPos[1] * 0.85;
    this.startCameraTween(
      tile.cameraFocusOffset[0],
      tile.cameraFocusOffset[1],
      tile.cameraFocusOffset[2],
      lx,
      1.1,
      lz,
      this.isSoftwareGl ? 360 : 720
    );
    this.setCameraStageAttr('tile_focus');
  }

  public focusCharacterFace(teamId: number): number | null {
    const pawn = this.board.pawns[teamId];
    if (!pawn || this.runAnim?.active) return null;
    const pos = pawn.group.position;

    // Aim inward from the tile toward the open board center so buildings never obstruct the portrait
    let inX = -pos.x;
    let inZ = -pos.z;
    const len = Math.hypot(inX, inZ);
    if (len > 0.01) {
      inX /= len;
      inZ /= len;
    } else {
      inX = 0;
      inZ = 1;
    }
    const rightX = -inZ;
    const rightZ = inX;

    // Character turns smoothly to face the portrait camera directly
    const faceCameraYaw = Math.atan2(inX, inZ);
    pawn.group.rotation.y = faceCameraYaw;

    // 3/4 portrait close-up looking directly at the character's dynamic 3D eyes, brows & mouth
    this.startCameraTween(
      pos.x + inX * 3.5 + rightX * 0.38,
      pos.y + 1.92,
      pos.z + inZ * 3.5 + rightZ * 0.38,
      pos.x,
      pos.y + 1.48,
      pos.z,
      this.isSoftwareGl ? 320 : 620
    );
    this.setCameraStageAttr('character_face');
    return faceCameraYaw;
  }

  public setDeckHighlights(
    questionActive: boolean,
    propertyActive: boolean,
    chanceActive = false
  ) {
    this.highlightQuestionDeck = questionActive;
    this.highlightPropertyDeck = propertyActive;
    this.highlightChanceDeck = chanceActive;
  }

  public playCharacterReaction(
    teamId: number,
    mode: CharacterReactionMode,
    durationMs = 3800,
    focusFace = false
  ) {
    const faceCameraYaw = focusFace ? this.focusCharacterFace(teamId) : null;
    this.reaction = {
      teamId,
      mode,
      endTimeMs: performance.now() + durationMs,
      faceCameraYaw,
    };
    if (typeof document !== 'undefined') {
      document.body.dataset.expression = getExpressionForAnimMode(mode);
    }
  }

  public syncTeams(
    teams: {
      id: number;
      name: string;
      colorHex: string;
      characterId: CharacterAvatarId;
      position: number;
      jailTurnsRemaining: number;
    }[],
    animateMove = false
  ) {
    this.jailedTeamIds.clear();
    for (const t of teams) {
      if (t.jailTurnsRemaining > 0) {
        this.jailedTeamIds.add(t.id);
      }
      this.board.rebuildPawnFigurine(t.id, t.characterId, t.colorHex, t.name, t.position);
      if (!animateMove) {
        const slot = this.getStudentSlotPosition(t.position, t.id);
        const nextSlot = this.getStudentSlotPosition((t.position + 1) % BOARD_TILES.length, t.id);
        const pawn = this.board.pawns[t.id];
        if (pawn) {
          pawn.currentPos.copy(slot);
          pawn.group.position.copy(slot);
          pawn.group.rotation.y = Math.atan2(nextSlot.x - slot.x, nextSlot.z - slot.z);
        }
      }
    }
  }

  public syncPurchasedAssets(
    ownedPairs: { assetId: string; teamColorHex: string; teamIndex: number }[]
  ) {
    this.board.syncPurchasedAssets(ownedPairs);
  }

  public triggerCelebrationFireworks(championName?: string, championColorHex?: string) {
    this.env.fireworks.trigger();
    if (championName) {
      this.env.activateChampionPlane(championName, championColorHex ?? '#1d6fd1', this.maxAniso);
    }
    this.startCameraTween(-25.5, 22.0, 34.5, 0, 4.6, 0, this.isSoftwareGl ? 420 : 850);
  }

  public resetCelebration() {
    this.env.hideChampionPlane();
  }

  public triggerBonusSparkle() {
    this.env.fireworks.trigger();
  }

  public getStudentSlotPosition(tileIndex: number, teamId: number): THREE.Vector3 {
    const tile = BOARD_TILES[tileIndex % BOARD_TILES.length];
    const offsets: [number, number][] = [
      [-0.86, 0.52],
      [0.02, -0.68],
      [0.86, 0.52],
    ];
    const [ox, oz] = offsets[teamId % 3];
    return new THREE.Vector3(tile.boardPos[0] + ox, 0.16, tile.boardPos[1] + oz);
  }

  /** Stage 1 of dice camera choreography: dramatic close-up zoom onto the tumbling 3D die */
  public animateDiceRoll(targetValue: number, onComplete: () => void) {
    const timings = getDiceCameraTimings(this.isSoftwareGl);
    this.startCameraTween(
      0.0,
      4.35,
      5.85,
      0.0,
      0.92,
      1.48,
      this.isSoftwareGl ? 320 : 560
    );
    this.setCameraStageAttr('dice_zoom');

    const targetRot = getDiceTargetRotation(targetValue);
    const randTurn = () => (Math.random() < 0.5 ? 1 : -1) * (2 + Math.floor(Math.random() * 3)) * Math.PI * 2;
    const spinRot = new THREE.Euler(
      targetRot.x + randTurn(),
      targetRot.y + randTurn(),
      targetRot.z + randTurn()
    );
    const arcX = (Math.random() < 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.3);
    const arcZ = (Math.random() < 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.2);
    const peakHeight = 1.85 + Math.random() * 0.5;

    this.diceAnim = {
      active: true,
      startTimeMs: performance.now(),
      durationMs: timings.diceRollMs,
      targetValue,
      startRot: this.board.diceMesh.rotation.clone(),
      targetRot: spinRot,
      arcX,
      arcZ,
      peakHeight,
      onComplete,
    };
  }

  /** Stage 3: Smooth swoop from full board overview into First-Person (FPS) step-by-step walk */
  public animateStudentRun(
    teamId: number,
    fromTile: number,
    steps: number,
    onStep: (stepIdx: number) => void,
    onComplete: () => void
  ) {
    const timings = getDiceCameraTimings(this.isSoftwareGl);
    // Ensure any previous interrupted run restores visibility for all pawns
    if (this.runAnim) {
      for (const p of this.board.pawns) {
        p.group.visible = true;
      }
    }

    const waypoints: THREE.Vector3[] = [];
    for (let s = 0; s <= steps; s++) {
      const idx = (fromTile + s) % BOARD_TILES.length;
      waypoints.push(this.getStudentSlotPosition(idx, teamId));
    }

    const initialForward = new THREE.Vector3(1, 0, 0);
    if (waypoints.length >= 2) {
      initialForward.subVectors(waypoints[1], waypoints[0]);
      initialForward.y = 0;
      if (initialForward.lengthSq() > 0.0001) {
        initialForward.normalize();
      }
    }

    this.controls.enabled = false;
    this.cameraTween = null;
    this.setCameraStageAttr('fps_walk');

    const now = performance.now();
    this.runAnim = {
      active: true,
      teamId,
      waypoints,
      segmentIdx: 0,
      segmentStartMs: now + timings.fpsBlendMs,
      segmentDurationMs: timings.stepDurationMs,
      entryStartMs: now,
      entryDurationMs: timings.fpsBlendMs,
      entryFromPos: this.camera.position.clone(),
      entryFromLookAt: this.controls.target.clone(),
      walkingStarted: false,
      fpsForward: initialForward,
      onStep,
      onComplete,
    };
  }

  public animateCardDraw(
    deckKind: 'question' | 'property' | 'chance',
    headerLabel: string,
    onComplete: () => void
  ) {
    const sourceDeck =
      deckKind === 'property'
        ? this.board.propertyDeck
        : deckKind === 'chance'
          ? this.board.chanceDeck
          : this.board.questionDeck;

    const accent =
      deckKind === 'property'
        ? '#149a7c'
        : deckKind === 'chance'
          ? '#d81b75'
          : '#6d44a6';

    const oldFront = this.board.flyingCard.frontMat.map;
    this.board.flyingCard.frontMat.map = createCardFrontTexture(
      headerLabel,
      accent,
      this.maxAniso
    );
    this.board.flyingCard.frontMat.needsUpdate = true;
    oldFront?.dispose();

    const oldBack = this.board.flyingCard.backMat.map;
    this.board.flyingCard.backMat.map = createCardDeckTexture(
      deckKind === 'property' ? 'İLÇE' : deckKind === 'chance' ? 'ÖDÜL YA DA' : 'SORU',
      deckKind === 'property' ? 'KARTLARI' : deckKind === 'chance' ? 'CEZA' : 'KARTLARI',
      deckKind === 'property'
        ? 'İSTANBUL İLÇELERİ'
        : deckKind === 'chance'
          ? 'SÜRPRİZ KART'
          : '20 SÖZ SANATLARI',
      accent,
      deckKind === 'question' ? '#4c2b7a' : deckKind === 'chance' ? '#9c1154' : '#096b57',
      this.maxAniso
    );
    this.board.flyingCard.backMat.needsUpdate = true;
    oldBack?.dispose();

    const startPos = sourceDeck.basePos.clone();
    startPos.y = sourceDeck.topY + 0.08;

    const peakPos = startPos.clone().lerp(this.camera.position, 0.34);
    peakPos.y = Math.max(peakPos.y, 7.2);

    this.board.flyingCard.mesh.position.copy(startPos);
    this.board.flyingCard.mesh.rotation.set(0, 0, 0);
    this.board.flyingCard.mesh.visible = true;

    this.cardAnim = {
      active: true,
      startTimeMs: performance.now(),
      durationMs: this.isSoftwareGl ? 360 : 720,
      startPos,
      peakPos,
      onComplete,
    };
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (this.disposed) return;

    const nowMs = performance.now();
    const rawDt = (nowMs - this.lastNowMs) / 1000;
    this.lastNowMs = nowMs;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
    this.elapsedTotal += dt;

    // 1. Update Istanbul diorama environment (taxis, NPCs, Bosphorus water, ferries, seagulls, airplane, fireworks)
    this.env.update(this.elapsedTotal, dt);

    // 1b. Gently wave the 3D Turkish Flag beside the center blue vault building
    const flagPos = this.board.turkishFlagMesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < flagPos.count; i++) {
      const fx = flagPos.getX(i); // 0.05 .. 2.40 (anchored at pole on left)
      const factor = Math.max(0, (fx - 0.05) / 2.35);
      const wave =
        Math.sin(this.elapsedTotal * 5.2 - fx * 2.4) * 0.22 * factor +
        Math.cos(this.elapsedTotal * 3.1 - fx * 1.6) * 0.06 * factor;
      flagPos.setZ(i, this.board.turkishFlagBaseZ[i] + wave);
    }
    flagPos.needsUpdate = true;

    // 2. Camera framing (Title orbit, active FPS walk, OR damped tabletop overview/landmark focus)
    const targetFov = this.runAnim?.active ? 58 : this.computeBaseFov(this.camera.aspect);
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, 1 - Math.exp(-7 * dt));
      this.camera.updateProjectionMatrix();
    }

    if (this.titleOrbitMode) {
      const a = -0.58 + Math.sin(this.elapsedTotal * 0.16) * 0.42;
      const scale = this.computeOverviewScale(this.camera.aspect);
      this.camera.position.set(
        Math.sin(a) * 35 * scale,
        (24.0 + Math.sin(this.elapsedTotal * 0.25) * 1.2) * scale,
        Math.cos(a) * 35 * scale
      );
      this.camera.lookAt(0, 1.2, 2.5);
    } else if (!this.runAnim?.active) {
      if (this.cameraTween?.active) {
        const tw = this.cameraTween;
        const u = Math.min(1, Math.max(0, (nowMs - tw.startTimeMs) / tw.durationMs));
        const ease = 1 - Math.pow(1 - u, 3);
        this.camera.position.lerpVectors(tw.startPos, tw.endPos, ease);
        this.controls.target.lerpVectors(tw.startLook, tw.endLook, ease);
        if (u >= 1) {
          this.camera.position.copy(tw.endPos);
          this.controls.target.copy(tw.endLook);
          this.cameraTween = null;
        }
      }
      this.controls.update();
      for (const p of this.board.pawns) {
        p.group.visible = this.camera.position.distanceTo(p.group.position) > 1.85;
      }
    }

    // 3. Highlight rings & decks
    const pulse = 0.55 + Math.sin(this.elapsedTotal * 4.2) * 0.35;
    for (const tile of this.board.boardTiles) {
      const mat = tile.highlightRing.material as THREE.MeshBasicMaterial;
      mat.opacity =
        tile.tileIndex === this.activeTileHighlight && !this.titleOrbitMode ? pulse : 0;
    }

    const qMat = this.board.questionDeck.glowRing.material as THREE.MeshBasicMaterial;
    qMat.opacity = this.highlightQuestionDeck ? pulse : 0;
    this.board.questionDeck.group.position.y = this.highlightQuestionDeck
      ? 0.08 + Math.sin(this.elapsedTotal * 4.5) * 0.1 + 0.1
      : 0.08;

    const pMat = this.board.propertyDeck.glowRing.material as THREE.MeshBasicMaterial;
    pMat.opacity = this.highlightPropertyDeck ? pulse : 0;
    this.board.propertyDeck.group.position.y = this.highlightPropertyDeck
      ? 0.08 + Math.sin(this.elapsedTotal * 4.5) * 0.1 + 0.1
      : 0.08;

    const cMat = this.board.chanceDeck.glowRing.material as THREE.MeshBasicMaterial;
    cMat.opacity = this.highlightChanceDeck ? pulse : 0;
    this.board.chanceDeck.group.position.y = this.highlightChanceDeck
      ? 0.08 + Math.sin(this.elapsedTotal * 4.5) * 0.1 + 0.1
      : 0.08;

    // 4. Articulated Student Character Pose & 3D Facial Expression Updates
    if (this.reaction && nowMs > this.reaction.endTimeMs) {
      this.reaction = null;
      if (typeof document !== 'undefined') {
        document.body.dataset.expression = 'neutral';
      }
    }

    this.board.pawns.forEach((p, idx) => {
      if (this.runAnim?.active && this.runAnim.teamId === idx) {
        animateCharacterPose(p, 'run', this.elapsedTotal);
      } else if (this.reaction && this.reaction.teamId === idx) {
        if (this.reaction.faceCameraYaw !== null) {
          p.group.rotation.y = this.reaction.faceCameraYaw;
        }
        animateCharacterPose(p, this.reaction.mode, this.elapsedTotal);
      } else if (this.jailedTeamIds.has(idx)) {
        animateCharacterPose(p, 'jail', this.elapsedTotal);
      } else {
        animateCharacterPose(p, 'idle', this.elapsedTotal);
      }

      // Hide giant floating nameSprite whenever camera zooms close for portrait / FPS views
      const camDist = this.camera.position.distanceTo(p.group.position);
      p.nameSprite.visible = camDist > 7.5 && !this.runAnim?.active;
    });

    // 5. Pop-in spring for purchased 3D properties
    for (const child of this.board.purchasedGroup.children) {
      if (child.scale.x < 0.99) {
        const nextS = THREE.MathUtils.damp(child.scale.x, 1, 8, dt);
        child.scale.set(nextS, nextS, nextS);
      }
    }

    // 6. Physical 3D Dice Animation (wall-clock timed)
    if (this.diceAnim?.active) {
      const t = Math.min(1, (nowMs - this.diceAnim.startTimeMs) / this.diceAnim.durationMs);
      const easeOut = 1 - Math.pow(1 - t, 3);
      const bounce =
        t < 0.65
          ? Math.sin((t / 0.65) * Math.PI) * this.diceAnim.peakHeight
          : Math.sin(((t - 0.65) / 0.35) * Math.PI) * (this.diceAnim.peakHeight * 0.28);

      this.board.diceGroup.position.set(
        Math.sin(t * Math.PI * 2) * (1 - t) * this.diceAnim.arcX,
        0.7 + bounce,
        1.48 + Math.cos(t * Math.PI) * (1 - t) * this.diceAnim.arcZ
      );
      this.board.diceMesh.rotation.set(
        THREE.MathUtils.lerp(this.diceAnim.startRot.x, this.diceAnim.targetRot.x, easeOut),
        THREE.MathUtils.lerp(this.diceAnim.startRot.y, this.diceAnim.targetRot.y, easeOut),
        THREE.MathUtils.lerp(this.diceAnim.startRot.z, this.diceAnim.targetRot.z, easeOut)
      );

      if (t >= 1) {
        this.board.diceMesh.rotation.copy(getDiceTargetRotation(this.diceAnim.targetValue));
        this.board.diceGroup.position.set(0, 0.7, 1.48);
        const cb = this.diceAnim.onComplete;
        this.diceAnim = null;
        cb();
      }
    }

    // 7. Smooth Swoop from Board Overview into First-Person (FPS) Step-by-Step Walk!
    if (this.runAnim?.active) {
      const anim = this.runAnim;
      const pawn = this.board.pawns[anim.teamId];
      const entryT = Math.min(1, Math.max(0, (nowMs - anim.entryStartMs) / anim.entryDurationMs));

      if (!anim.walkingStarted) {
        const easeEntry =
          entryT < 0.5
            ? 4 * entryT * entryT * entryT
            : 1 - Math.pow(-2 * entryT + 2, 3) / 2;

        const startWp = anim.waypoints[0];
        const eyeX = startWp.x + anim.fpsForward.x * 0.32;
        const eyeY = 2.05;
        const eyeZ = startWp.z + anim.fpsForward.z * 0.32;
        const lookX = eyeX + anim.fpsForward.x * 10.5;
        const lookY = 1.52;
        const lookZ = eyeZ + anim.fpsForward.z * 10.5;

        _fpsCamPos.set(eyeX, eyeY, eyeZ);
        _fpsLookAt.set(lookX, lookY, lookZ);
        this.camera.position.lerpVectors(anim.entryFromPos, _fpsCamPos, easeEntry);
        _targetLookAt.lerpVectors(anim.entryFromLookAt, _fpsLookAt, easeEntry);
        this.camera.lookAt(_targetLookAt);
        this.controls.target.copy(_targetLookAt);

        // Hide active student & any other close pawn as camera swoops down to eye level
        this.board.pawns.forEach((p, pIdx) => {
          if (pIdx === anim.teamId) {
            p.group.visible = entryT < 0.45;
          } else {
            p.group.visible = this.camera.position.distanceTo(p.group.position) > 3.2;
          }
        });

        if (entryT >= 1) {
          anim.walkingStarted = true;
          anim.segmentStartMs = nowMs;
          if (pawn) pawn.group.visible = false;
        }
      } else {
        const uRaw = (nowMs - anim.segmentStartMs) / anim.segmentDurationMs;

        if (uRaw >= 1) {
          anim.segmentIdx++;
          anim.segmentStartMs = nowMs;
          anim.onStep?.(anim.segmentIdx);

          if (anim.segmentIdx >= anim.waypoints.length - 1) {
            const finalPos = anim.waypoints[anim.waypoints.length - 1];
            pawn.currentPos.copy(finalPos);
            pawn.group.position.copy(finalPos);
            for (const p of this.board.pawns) {
              p.group.visible = this.camera.position.distanceTo(p.group.position) > 1.85;
            }
            this.controls.enabled = !this.titleOrbitMode;
            const cb = anim.onComplete;
            this.runAnim = null;
            cb();
          }
        }

        if (this.runAnim && pawn) {
          const from = anim.waypoints[anim.segmentIdx];
          const to = anim.waypoints[anim.segmentIdx + 1];
          const u = Math.min(1, Math.max(0, (nowMs - anim.segmentStartMs) / anim.segmentDurationMs));
          _vec3.lerpVectors(from, to, u);
          pawn.group.position.set(_vec3.x, _vec3.y, _vec3.z);
          pawn.group.rotation.y = Math.atan2(to.x - from.x, to.z - from.z);

          // Smoothly steer FPS forward vector around board corners
          _segDir.subVectors(to, from);
          _segDir.y = 0;
          if (_segDir.lengthSq() > 0.0001) {
            _segDir.normalize();
            const turnLerp = 1 - Math.exp(-8.0 * dt);
            anim.fpsForward.lerp(_segDir, turnLerp).normalize();
          }

          // First-Person eye-level camera with gentle relaxed walking head-bob & sway
          const headBobY = Math.sin(this.elapsedTotal * 7.2) * 0.07;
          const sideSway = Math.cos(this.elapsedTotal * 3.6) * 0.035;
          const rightX = -anim.fpsForward.z;
          const rightZ = anim.fpsForward.x;

          const eyeX = _vec3.x + anim.fpsForward.x * 0.32 + rightX * sideSway;
          const eyeY = 2.05 + headBobY;
          const eyeZ = _vec3.z + anim.fpsForward.z * 0.32 + rightZ * sideSway;

          const lookX = eyeX + anim.fpsForward.x * 10.5;
          const lookY = 1.52 + headBobY * 0.35;
          const lookZ = eyeZ + anim.fpsForward.z * 10.5;

          this.camera.position.set(eyeX, eyeY, eyeZ);
          this.camera.lookAt(lookX, lookY, lookZ);
          this.controls.target.set(lookX, lookY, lookZ);

          // Keep FPS camera view 100% unobstructed by hiding active pawn & any other pawn right in front of the lens
          this.board.pawns.forEach((p, pIdx) => {
            if (pIdx === anim.teamId) {
              p.group.visible = false;
            } else {
              p.group.visible = this.camera.position.distanceTo(p.group.position) > 3.2;
            }
          });
        }
      }
    }

    // 8. Physical 3D Card Draw & Flip Animation (wall-clock timed!)
    if (this.cardAnim?.active) {
      const t = Math.min(1, (nowMs - this.cardAnim.startTimeMs) / this.cardAnim.durationMs);
      const ease = 1 - Math.pow(1 - t, 3);

      this.board.flyingCard.mesh.position.lerpVectors(
        this.cardAnim.startPos,
        this.cardAnim.peakPos,
        ease
      );
      this.board.flyingCard.mesh.rotation.z = ease * Math.PI;
      this.board.flyingCard.mesh.rotation.x = Math.sin(ease * Math.PI * 0.5) * 0.42;

      if (t >= 1) {
        this.board.flyingCard.mesh.visible = false;
        const cb = this.cardAnim.onComplete;
        this.cardAnim = null;
        cb();
      }
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.controls.dispose();
    this.envMapTexture?.dispose();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          if (m) m.dispose();
        }
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
