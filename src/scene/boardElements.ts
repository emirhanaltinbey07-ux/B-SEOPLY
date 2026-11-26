import * as THREE from 'three';
import { BOARD_TILES, DEFAULT_TEAMS_SETUP, PROPERTY_ASSETS } from '../game/data';
import { CharacterAvatarId, PropertyAsset } from '../game/types';
import {
  CharacterFigurine3D,
  createStylizedCharacterFigurine,
  updateCharacterNameplate,
} from './characters';
import {
  createLandmarkMaterials,
  createLandmarkMesh,
} from './landmarks';
import {
  createBoardCenterTexture,
  createBoardTileTexture,
  createCardDeckTexture,
  createCardFrontTexture,
  createContactShadowTexture,
  createDiceFaceTexture,
  createFloatingSignSprite,
  createStoneBumpTexture,
  createTurkishFlagTexture,
} from './materials';

export interface BoardTile3D {
  tileIndex: number;
  tileMesh: THREE.Mesh;
  landmarkGroup?: THREE.Group;
  highlightRing: THREE.Mesh;
}

export interface Deck3D {
  kind: 'question' | 'property' | 'chance';
  group: THREE.Group;
  hitBox: THREE.Mesh;
  glowRing: THREE.Mesh;
  topY: number;
  basePos: THREE.Vector3;
}

export interface FlyingCard3D {
  mesh: THREE.Mesh;
  frontMat: THREE.MeshStandardMaterial;
  backMat: THREE.MeshStandardMaterial;
}

export interface BoardElements {
  root: THREE.Group;
  interactables: THREE.Object3D[];
  boardTiles: BoardTile3D[];
  questionDeck: Deck3D;
  chanceDeck: Deck3D;
  propertyDeck: Deck3D;
  flyingCard: FlyingCard3D;
  pawns: CharacterFigurine3D[];
  diceGroup: THREE.Group;
  diceMesh: THREE.Mesh;
  purchasedGroup: THREE.Group;
  turkishFlagMesh: THREE.Mesh;
  turkishFlagBaseZ: Float32Array;
  rebuildPawnFigurine: (
    teamId: number,
    characterId: CharacterAvatarId,
    colorHex: string,
    teamName: string,
    tileIndex: number
  ) => void;
  syncPurchasedAssets: (
    ownedPairs: { assetId: string; teamColorHex: string; teamIndex: number }[]
  ) => void;
}

function createPhysicalDeck(
  kind: 'question' | 'property' | 'chance',
  pos: THREE.Vector3,
  topTex: THREE.CanvasTexture,
  accentHex: number,
  shadowTex: THREE.CanvasTexture
): Deck3D {
  const group = new THREE.Group();
  group.position.copy(pos);

  const cardW = 2.6;
  const cardD = 3.45;
  const stackH = 0.72;

  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = 64;
  edgeCanvas.height = 64;
  const ectx = edgeCanvas.getContext('2d')!;
  ectx.fillStyle = '#ffffff';
  ectx.fillRect(0, 0, 64, 64);
  ectx.fillStyle = '#cfd6dc';
  for (let y = 0; y < 64; y += 5) {
    ectx.fillRect(0, y, 64, 1);
  }
  const edgeTex = new THREE.CanvasTexture(edgeCanvas);
  edgeTex.colorSpace = THREE.SRGBColorSpace;

  const sideMat = new THREE.MeshStandardMaterial({ map: edgeTex, roughness: 0.45 });
  const topMat = new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.28, metalness: 0.08 });
  const bottomMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.7 });

  const stackMesh = new THREE.Mesh(new THREE.BoxGeometry(cardW, stackH, cardD), [
    sideMat,
    sideMat,
    topMat,
    bottomMat,
    sideMat,
    sideMat,
  ]);
  stackMesh.position.y = stackH / 2 + 0.04;
  stackMesh.castShadow = true;
  stackMesh.receiveShadow = true;
  group.add(stackMesh);

  const glowRing = new THREE.Mesh(
    new THREE.RingGeometry(2.05, 2.42, 32),
    new THREE.MeshBasicMaterial({
      color: accentHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    })
  );
  glowRing.rotation.x = -Math.PI / 2;
  glowRing.position.y = 0.05;
  group.add(glowRing);

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(cardW + 0.8, cardD + 0.8),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.36,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(cardW + 0.4, stackH + 0.75, cardD + 0.4),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitBox.position.y = (stackH + 0.75) / 2;
  hitBox.userData = {
    interactType:
      kind === 'question'
        ? 'question_deck'
        : kind === 'chance'
          ? 'chance_deck'
          : 'property_deck',
  };
  group.add(hitBox);

  return {
    kind,
    group,
    hitBox,
    glowRing,
    topY: stackH + 0.08,
    basePos: pos.clone(),
  };
}

/** Stylized Monopoly-Go blue metallic vault chest at top-center of green lawn (Reference Image 1!) */
function createCenterVaultChest(): THREE.Group {
  const g = new THREE.Group();
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x199ae0, roughness: 0.24, metalness: 0.42 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xe3edf5, roughness: 0.2, metalness: 0.72 });
  const lockMat = new THREE.MeshStandardMaterial({ color: 0x1d344a, roughness: 0.28, metalness: 0.65 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.25, 1.5), blueMat);
  body.position.y = 0.625;
  body.castShadow = true;
  g.add(body);

  const lid = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.42, 1.6), silverMat);
  lid.position.y = 1.38;
  lid.castShadow = true;
  g.add(lid);

  for (const bx of [-0.78, 0.78]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.6, 1.58), silverMat);
    strap.position.set(bx, 0.82, 0);
    g.add(strap);
  }

  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.16), lockMat);
  lock.position.set(0, 0.9, 0.8);
  g.add(lock);

  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.95, 2.0),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.98;
  hit.userData = { interactType: 'vault_chest' };
  g.add(hit);
  g.userData.hitBox = hit;

  return g;
}

/** Tall brushed-steel flagpole + waving 3D Turkish Flag placed right beside the center blue vault building */
function createTurkishFlagpole(maxAniso: number): {
  group: THREE.Group;
  flagMesh: THREE.Mesh;
  baseZ: Float32Array;
} {
  const g = new THREE.Group();

  // Two-tier white marble pedestal
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.45 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xd49a1a, roughness: 0.25, metalness: 0.72 });
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xe5edf2, roughness: 0.22, metalness: 0.82 });

  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.24, 16), marbleMat);
  base1.position.y = 0.12;
  base1.castShadow = true;
  base1.receiveShadow = true;
  g.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.22, 16), marbleMat);
  base2.position.y = 0.34;
  base2.castShadow = true;
  g.add(base2);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.12, 12), trimMat);
  collar.position.y = 0.48;
  g.add(collar);

  // Tall metallic flagpole
  const poleHeight = 4.35;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, poleHeight, 12), poleMat);
  pole.position.y = 0.48 + poleHeight / 2;
  pole.castShadow = true;
  g.add(pole);

  // Golden finial sphere at top
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), trimMat);
  finial.position.y = 0.48 + poleHeight + 0.08;
  g.add(finial);

  // Segmented waving Turkish Flag geometry anchored cleanly on the pole's right side
  const flagW = 2.35;
  const flagH = 1.56;
  const flagGeo = new THREE.PlaneGeometry(flagW, flagH, 14, 6);
  // Shift geometry so X=0 sits right against the flagpole and extends to +flagW
  flagGeo.translate(flagW / 2 + 0.05, 0, 0);

  const posAttr = flagGeo.attributes.position as THREE.BufferAttribute;
  const baseZ = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) {
    baseZ[i] = posAttr.getZ(i);
  }

  const flagTex = createTurkishFlagTexture(maxAniso);
  const flagMat = new THREE.MeshStandardMaterial({
    map: flagTex,
    roughness: 0.48,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(0, 0.48 + poleHeight - flagH / 2 - 0.14, 0);
  flagMesh.castShadow = true;
  g.add(flagMesh);

  return { group: g, flagMesh, baseZ };
}

function createMiniatureAssetModel(asset: PropertyAsset, teamColorHex: string): THREE.Group {
  const g = new THREE.Group();
  const teamMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(teamColorHex),
    roughness: 0.3,
    metalness: 0.2,
  });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.55 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x3b7aa3, roughness: 0.14, metalness: 0.55 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x26313c, roughness: 0.55, metalness: 0.3 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.12, 12), teamMat);
  base.position.y = 0.06;
  g.add(base);

  const h =
    asset.id === 'bogaz-manzarali-villa' || asset.id === 'uskudar-yalisi' ? 0.74 : 0.54;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.66, h, 0.54), wallMat);
  body.position.y = 0.12 + h / 2;
  body.castShadow = true;
  g.add(body);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.54, 0.36, 4), teamMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 0.12 + h + 0.18;
  roof.castShadow = true;
  g.add(roof);

  const win = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.56), glassMat);
  win.position.y = 0.12 + h * 0.52;
  g.add(win);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.0, 6), darkMat);
  pole.position.set(0.35, 0.6, 0.2);
  g.add(pole);

  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.03), teamMat);
  flag.position.set(0.52, 0.98, 0.2);
  g.add(flag);

  return g;
}

export function createBoardElements(maxAniso: number): BoardElements {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const shadowTex = createContactShadowTexture();
  const stoneBump = createStoneBumpTexture();
  const landmarkMats = createLandmarkMaterials(stoneBump);

  // 1. Raised square terracotta & green Monopoly plinth framing the 24-tile track (-11.3 .. +11.3)
  const terracottaBase = new THREE.Mesh(
    new THREE.BoxGeometry(22.6, 0.72, 22.6),
    new THREE.MeshStandardMaterial({ color: 0xb25444, roughness: 0.62 })
  );
  terracottaBase.position.y = -0.36;
  terracottaBase.receiveShadow = true;
  root.add(terracottaBase);

  const boardTrim = new THREE.Mesh(
    new THREE.BoxGeometry(23.1, 0.16, 23.1),
    new THREE.MeshStandardMaterial({ color: 0x628c64, roughness: 0.45 })
  );
  boardTrim.position.y = -0.02;
  boardTrim.receiveShadow = true;
  root.add(boardTrim);

  // 2. Center Lush Green Park Lawn & Bold BİSEOPLY Sign (16.0 x 16.0)
  const centerTex = createBoardCenterTexture(maxAniso);
  const centerTop = new THREE.Mesh(
    new THREE.PlaneGeometry(16.0, 16.0),
    new THREE.MeshStandardMaterial({
      map: centerTex,
      roughness: 0.52,
      metalness: 0.04,
    })
  );
  centerTop.rotation.x = -Math.PI / 2;
  centerTop.position.y = 0.07;
  centerTop.receiveShadow = true;
  root.add(centerTop);

  // Blue Vault Chest at upper-center of lawn -> Clicking opens Fiilde Çatı Değerlendirme Paneli!
  const vaultChest = createCenterVaultChest();
  vaultChest.position.set(0, 0.08, -5.25);
  root.add(vaultChest);
  interactables.push(vaultChest.userData.hitBox);

  // Waving 3D Turkish Flag placed right beside the center blue building!
  const turkishFlag = createTurkishFlagpole(maxAniso);
  turkishFlag.group.position.set(2.35, 0.08, -5.25);
  root.add(turkishFlag.group);

  // 3. 24-Tile Monopoly Perimeter Track + 11 Distinct 3D Istanbul Landmarks + BAŞLANGIÇ Arch + Elevated Signboards
  const boardTiles: BoardTile3D[] = [];
  const tileGeo = new THREE.BoxGeometry(3.04, 0.14, 3.04);

  BOARD_TILES.forEach((tile) => {
    const tex = createBoardTileTexture(tile, maxAniso);
    const tileSideMat = new THREE.MeshStandardMaterial({ color: 0x9ec998, roughness: 0.48 });
    const tileTopMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.38, metalness: 0.02 });
    const tileMesh = new THREE.Mesh(tileGeo, [
      tileSideMat,
      tileSideMat,
      tileTopMat,
      tileSideMat,
      tileSideMat,
      tileSideMat,
    ]);
    tileMesh.position.set(tile.boardPos[0], 0.08, tile.boardPos[1]);
    tileMesh.receiveShadow = true;
    tileMesh.userData = { interactType: 'tile', tileIndex: tile.index };
    root.add(tileMesh);
    interactables.push(tileMesh);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.55, 1.82, 4),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(tile.accentColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.rotation.z = Math.PI / 4;
    ring.position.set(tile.boardPos[0], 0.17, tile.boardPos[1]);
    root.add(ring);

    let landmarkGroup: THREE.Group | undefined;
    if (tile.landmarkPos) {
      landmarkGroup = createLandmarkMesh(tile.id, landmarkMats);
      landmarkGroup.position.set(tile.landmarkPos[0], -0.6, tile.landmarkPos[1]);
      landmarkGroup.rotation.y = tile.landmarkRotY ?? 0;
      root.add(landmarkGroup);

      // Crisp elevated Turkish 3D Signboard above every Istanbul landmark & Başlangıç!
      const signHeight = tile.id === 'galata-kulesi' ? 6.2 : tile.id === 'kiz-kulesi' ? 4.8 : 4.2;
      const signSprite = createFloatingSignSprite(
        tile.shortLabel,
        tile.accentColor,
        tile.type === 'start' ? 'HER DÖNÜŞ +50 TL' : tile.districtTag
      );
      signSprite.position.set(tile.landmarkPos[0], signHeight, tile.landmarkPos[1]);
      root.add(signSprite);

      const landmarkHit = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 4.4, 3.2),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      landmarkHit.position.set(tile.landmarkPos[0], 1.5, tile.landmarkPos[1]);
      landmarkHit.userData = { interactType: 'tile', tileIndex: tile.index };
      root.add(landmarkHit);
      interactables.push(landmarkHit);
    }

    boardTiles.push({
      tileIndex: tile.index,
      tileMesh,
      landmarkGroup,
      highlightRing: ring,
    });
  });

  // 4. Three Prominent Physical 3D Card Decks on the Center Park Lawn
  //    (SORU KARTLARI, ÖDÜL YA DA CEZA, İLÇE KARTLARI)
  const qDeckTex = createCardDeckTexture(
    'SORU',
    'KARTLARI',
    '20 SÖZ SANATLARI',
    '#6d44a6',
    '#4c2b7a',
    maxAniso
  );
  const cDeckTex = createCardDeckTexture(
    'ÖDÜL YA DA',
    'CEZA',
    'SÜRPRİZ KART',
    '#d81b75',
    '#9c1154',
    maxAniso
  );
  const pDeckTex = createCardDeckTexture(
    'İLÇE',
    'KARTLARI',
    'İSTANBUL İLÇELERİ',
    '#0d9978',
    '#096b57',
    maxAniso
  );

  const questionDeck = createPhysicalDeck(
    'question',
    new THREE.Vector3(-4.55, 0.08, 4.45),
    qDeckTex,
    0xf27b1a,
    shadowTex
  );
  const chanceDeck = createPhysicalDeck(
    'chance',
    new THREE.Vector3(0, 0.08, 4.45),
    cDeckTex,
    0xd81b75,
    shadowTex
  );
  const propertyDeck = createPhysicalDeck(
    'property',
    new THREE.Vector3(4.55, 0.08, 4.45),
    pDeckTex,
    0x149a7c,
    shadowTex
  );
  root.add(questionDeck.group, chanceDeck.group, propertyDeck.group);
  interactables.push(questionDeck.hitBox, chanceDeck.hitBox, propertyDeck.hitBox);

  // 5. Animated 3D Flying & Flipping Card
  const cardFrontMat = new THREE.MeshStandardMaterial({
    map: createCardFrontTexture('SORU KARTI', '#6d44a6', maxAniso),
    roughness: 0.3,
  });
  const cardBackMat = new THREE.MeshStandardMaterial({ map: qDeckTex, roughness: 0.3 });
  const cardEdgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });

  const flyingCardMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.07, 3.45), [
    cardEdgeMat,
    cardEdgeMat,
    cardBackMat,
    cardFrontMat,
    cardEdgeMat,
    cardEdgeMat,
  ]);
  flyingCardMesh.visible = false;
  flyingCardMesh.castShadow = true;
  root.add(flyingCardMesh);

  const flyingCard: FlyingCard3D = {
    mesh: flyingCardMesh,
    frontMat: cardFrontMat,
    backMat: cardBackMat,
  };

  // 7. Three Articulated 3D Student Characters (NO metal pawns!)
  const defaultHexes = ['#1d6fd1', '#e06d1f', '#1e9363'];
  const pawns: CharacterFigurine3D[] = DEFAULT_TEAMS_SETUP.map((setup, i) => {
    const figurine = createStylizedCharacterFigurine(
      i,
      setup.characterId,
      defaultHexes[i],
      setup.name,
      shadowTex
    );
    const startTile = BOARD_TILES[0];
    const offsetAngle = (i - 1) * 1.15;
    const pos = new THREE.Vector3(
      startTile.boardPos[0] + Math.sin(offsetAngle) * 0.85,
      0.16,
      startTile.boardPos[1] + Math.cos(offsetAngle) * 0.62
    );
    figurine.group.position.copy(pos);
    figurine.currentPos.copy(pos);
    root.add(figurine.group);
    return figurine;
  });

  // 8. Physical 3D Die positioned cleanly below the SÖZOPLY banner above the 3 decks
  const diceFaces = [3, 4, 1, 6, 2, 5].map(
    (v) =>
      new THREE.MeshStandardMaterial({
        map: createDiceFaceTexture(v, maxAniso),
        roughness: 0.22,
        metalness: 0.06,
      })
  );
  const diceGroup = new THREE.Group();
  diceGroup.position.set(0, 0.7, 1.48);
  const diceMesh = new THREE.Mesh(new THREE.BoxGeometry(1.24, 1.24, 1.24), diceFaces);
  diceMesh.castShadow = true;
  diceMesh.userData = { interactType: 'dice' };
  diceGroup.add(diceMesh);
  root.add(diceGroup);
  interactables.push(diceMesh);

  // 9. Purchased 3D Properties & Vehicles Container (supports live buys, sales & transfers!)
  const purchasedGroup = new THREE.Group();
  root.add(purchasedGroup);
  let lastPurchasedSignature = '';

  const rebuildPawnFigurine = (
    teamId: number,
    characterId: CharacterAvatarId,
    colorHex: string,
    teamName: string,
    tileIndex: number
  ) => {
    const existing = pawns[teamId];
    if (!existing) return;
    if (existing.characterId === characterId) {
      updateCharacterNameplate(existing, teamName, colorHex);
      return;
    }
    root.remove(existing.group);
    const fresh = createStylizedCharacterFigurine(teamId, characterId, colorHex, teamName, shadowTex);
    const tile = BOARD_TILES[tileIndex % BOARD_TILES.length];
    const offsetAngle = (teamId - 1) * 1.15;
    fresh.currentPos.set(
      tile.boardPos[0] + Math.sin(offsetAngle) * 0.85,
      0.16,
      tile.boardPos[1] + Math.cos(offsetAngle) * 0.62
    );
    fresh.group.position.copy(fresh.currentPos);
    root.add(fresh.group);
    pawns[teamId] = fresh;
  };

  const syncPurchasedAssets = (
    ownedPairs: { assetId: string; teamColorHex: string; teamIndex: number }[]
  ) => {
    const sig = ownedPairs
      .map((p) => `${p.assetId}:${p.teamColorHex}:${p.teamIndex}`)
      .sort()
      .join('|');
    if (sig === lastPurchasedSignature) return;
    lastPurchasedSignature = sig;

    while (purchasedGroup.children.length > 0) {
      purchasedGroup.remove(purchasedGroup.children[0]);
    }

    ownedPairs.forEach((pair, slotIdx) => {
      const asset = PROPERTY_ASSETS.find((a) => a.id === pair.assetId);
      if (!asset) return;
      const tile = BOARD_TILES[asset.districtTileIndex] ?? BOARD_TILES[1];
      const mini = createMiniatureAssetModel(asset, pair.teamColorHex);
      const dx = tile.boardPos[0] >= 0 ? -1.1 : 1.1;
      const dz = tile.boardPos[1] >= 0 ? -1.0 : 1.0;
      mini.position.set(
        tile.boardPos[0] + dx * 0.72 + ((slotIdx % 3) - 1) * 0.36,
        0.16,
        tile.boardPos[1] + dz * 0.72
      );
      mini.scale.set(0.01, 0.01, 0.01);
      purchasedGroup.add(mini);
    });
  };

  return {
    root,
    interactables,
    boardTiles,
    questionDeck,
    chanceDeck,
    propertyDeck,
    flyingCard,
    pawns,
    diceGroup,
    diceMesh,
    purchasedGroup,
    turkishFlagMesh: turkishFlag.flagMesh,
    turkishFlagBaseZ: turkishFlag.baseZ,
    rebuildPawnFigurine,
    syncPurchasedAssets,
  };
}
