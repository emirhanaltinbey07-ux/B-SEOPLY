import * as THREE from 'three';

/**
 * 10 genuinely distinct, composite 5-12 part 3D Istanbul architectural landmarks.
 * Each landmark is pivoted at bottom-center (y = 0) so it sits flush on its pedestal/ground.
 */

export interface LandmarkSharedMaterials {
  limestone: THREE.MeshStandardMaterial;
  whiteMarble: THREE.MeshStandardMaterial;
  leadDome: THREE.MeshStandardMaterial;
  terracotta: THREE.MeshStandardMaterial;
  goldFinial: THREE.MeshStandardMaterial;
  darkSlate: THREE.MeshStandardMaterial;
  steelBlue: THREE.MeshStandardMaterial;
  warmWood: THREE.MeshStandardMaterial;
  windowGlass: THREE.MeshStandardMaterial;
  rockBase: THREE.MeshStandardMaterial;
}

export function createLandmarkMaterials(stoneBump: THREE.CanvasTexture): LandmarkSharedMaterials {
  return {
    limestone: new THREE.MeshStandardMaterial({
      color: 0xe6dac3,
      roughness: 0.78,
      metalness: 0.04,
      bumpMap: stoneBump,
      bumpScale: 0.06,
    }),
    whiteMarble: new THREE.MeshStandardMaterial({
      color: 0xf6f3ec,
      roughness: 0.42,
      metalness: 0.06,
    }),
    leadDome: new THREE.MeshStandardMaterial({
      color: 0x627382,
      roughness: 0.38,
      metalness: 0.45,
    }),
    terracotta: new THREE.MeshStandardMaterial({
      color: 0xc25539,
      roughness: 0.72,
      metalness: 0.05,
    }),
    goldFinial: new THREE.MeshStandardMaterial({
      color: 0xdca42c,
      roughness: 0.22,
      metalness: 0.88,
    }),
    darkSlate: new THREE.MeshStandardMaterial({
      color: 0x3b4856,
      roughness: 0.55,
      metalness: 0.25,
    }),
    steelBlue: new THREE.MeshStandardMaterial({
      color: 0x3a6484,
      roughness: 0.36,
      metalness: 0.65,
    }),
    warmWood: new THREE.MeshStandardMaterial({
      color: 0x8b5a34,
      roughness: 0.8,
      metalness: 0.04,
    }),
    windowGlass: new THREE.MeshStandardMaterial({
      color: 0x265070,
      roughness: 0.14,
      metalness: 0.62,
    }),
    rockBase: new THREE.MeshStandardMaterial({
      color: 0x767c7d,
      roughness: 0.92,
      metalness: 0.02,
      bumpMap: stoneBump,
      bumpScale: 0.1,
    }),
  };
}

function addMinaret(
  group: THREE.Group,
  x: number,
  z: number,
  height: number,
  mats: LandmarkSharedMaterials,
  balconies = 1
) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.55, 0.32), mats.whiteMarble);
  base.position.set(x, 0.275, z);
  base.castShadow = true;
  group.add(base);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.125, height, 10),
    mats.whiteMarble
  );
  shaft.position.set(x, 0.5 + height / 2, z);
  shaft.castShadow = true;
  group.add(shaft);

  for (let i = 0; i < balconies; i++) {
    const by = 0.5 + height * (balconies === 1 ? 0.72 : 0.45 + i * 0.26);
    const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.11, 0.1, 10), mats.limestone);
    bal.position.set(x, by, z);
    group.add(bal);
  }

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.52, 10), mats.leadDome);
  spire.position.set(x, 0.5 + height + 0.26, z);
  spire.castShadow = true;
  group.add(spire);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.24, 6), mats.goldFinial);
  finial.position.set(x, 0.5 + height + 0.6, z);
  group.add(finial);
}

/** 1. Üsküdar: Historic coastal mosque + wooden ferry pier + tea pavilion */
function buildUskudar(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Coastal stone embankment
  const quay = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.35, 2.4), mats.limestone);
  quay.position.set(0, 0.175, 0);
  quay.receiveShadow = true;
  g.add(quay);

  // Main Mihrimah-inspired mosque body
  const hall = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.15, 1.4), mats.whiteMarble);
  hall.position.set(-0.45, 0.92, -0.15);
  hall.castShadow = true;
  g.add(hall);

  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.26, 16), mats.limestone);
  drum.position.set(-0.45, 1.62, -0.15);
  g.add(drum);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.64, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    mats.leadDome
  );
  dome.position.set(-0.45, 1.72, -0.15);
  dome.castShadow = true;
  g.add(dome);

  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 8), mats.goldFinial);
  finial.position.set(-0.45, 2.48, -0.15);
  g.add(finial);

  addMinaret(g, -1.2, -0.68, 1.9, mats, 1);
  addMinaret(g, 0.28, -0.68, 1.9, mats, 1);

  // Historic Üsküdar wooden ferry pier building (İskele)
  const pierBody = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.68, 0.85), mats.terracotta);
  pierBody.position.set(0.92, 0.68, 0.52);
  pierBody.castShadow = true;
  g.add(pierBody);

  const pierRoof = new THREE.Mesh(new THREE.ConeGeometry(0.84, 0.38, 4), mats.darkSlate);
  pierRoof.rotation.y = Math.PI / 4;
  pierRoof.position.set(0.92, 1.2, 0.52);
  g.add(pierRoof);

  const pierDock = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.55), mats.warmWood);
  pierDock.position.set(0.92, 0.36, 1.15);
  g.add(pierDock);

  return g;
}

/** 2. Kız Kulesi (Maiden's Tower) on a rocky Bosphorus islet */
function buildKizKulesi(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Irregular rocky island plinth
  const rock = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.72, 0.38, 9), mats.rockBase);
  rock.position.y = 0.19;
  rock.receiveShadow = true;
  g.add(rock);

  // Stone courtyard wall
  const courtyard = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.12, 0.45, 8), mats.limestone);
  courtyard.position.y = 0.6;
  courtyard.castShadow = true;
  g.add(courtyard);

  // Lower fort pavilion
  const lowerFort = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.72, 1.1), mats.whiteMarble);
  lowerFort.position.y = 1.06;
  lowerFort.castShadow = true;
  g.add(lowerFort);

  // Terracotta pitched perimeter roof
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.98, 0.36, 4), mats.terracotta);
  lowerRoof.rotation.y = Math.PI / 4;
  lowerRoof.position.y = 1.6;
  g.add(lowerRoof);

  // Iconic square-to-cylindrical white watchtower
  const towerMid = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.62), mats.whiteMarble);
  towerMid.position.y = 2.02;
  towerMid.castShadow = true;
  g.add(towerMid);

  const lanternRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.42, 12), mats.windowGlass);
  lanternRoom.position.y = 2.64;
  g.add(lanternRoom);

  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.36, 0.1, 12), mats.limestone);
  gallery.position.y = 2.45;
  g.add(gallery);

  // Pointed lead cupola + gold spire
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.78, 12), mats.leadDome);
  spire.position.y = 3.24;
  spire.castShadow = true;
  g.add(spire);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 8), mats.goldFinial);
  finial.position.y = 3.76;
  g.add(finial);

  return g;
}

/** 3. 15 Temmuz Şehitler Köprüsü (Suspension bridge with H-towers & parabolic cables) */
function buildBogazKoprusu(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  const towerMat = new THREE.MeshStandardMaterial({
    color: 0xdce5ec,
    roughness: 0.32,
    metalness: 0.55,
  });
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0xc45539,
    roughness: 0.38,
    metalness: 0.5,
  });
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x3b4856,
    roughness: 0.68,
    metalness: 0.2,
  });

  // Two H-frame bridge towers
  for (const tx of [-1.45, 1.45]) {
    // Pier foundation
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.55, 1.3), mats.limestone);
    pier.position.set(tx, 0.275, 0);
    g.add(pier);

    // Left and right steel legs
    for (const tz of [-0.42, 0.42]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.25, 0.18), towerMat);
      leg.position.set(tx, 2.05, tz);
      leg.castShadow = true;
      g.add(leg);
    }

    // Horizontal cross-beams
    for (const by of [1.55, 2.55, 3.45]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.92), towerMat);
      beam.position.set(tx, by, 0);
      g.add(beam);
    }
  }

  // Suspended highway deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 0.72), deckMat);
  deck.position.set(0, 1.25, 0);
  deck.castShadow = true;
  g.add(deck);

  // Parabolic suspension main cables using TubeGeometry on both sides
  for (const cz of [-0.42, 0.42]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.2, 1.35, cz),
      new THREE.Vector3(-1.45, 3.55, cz),
      new THREE.Vector3(-0.65, 2.1, cz),
      new THREE.Vector3(0, 1.65, cz),
      new THREE.Vector3(0.65, 2.1, cz),
      new THREE.Vector3(1.45, 3.55, cz),
      new THREE.Vector3(2.2, 1.35, cz),
    ]);
    const cableGeo = new THREE.TubeGeometry(curve, 28, 0.04, 6, false);
    const cable = new THREE.Mesh(cableGeo, cableMat);
    g.add(cable);

    // Vertical suspender hangers
    for (let sx = -1.1; sx <= 1.11; sx += 0.36) {
      const yTop = 1.65 + (sx * sx) * 0.85;
      const h = Math.max(0.3, yTop - 1.3);
      const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, h, 4), towerMat);
      hanger.position.set(sx, 1.3 + h / 2, cz);
      g.add(hanger);
    }
  }

  return g;
}

/** 4. Ortaköy Mosque (Neo-Baroque dome + twin slender minarets + waterfront plaza) */
function buildOrtakoy(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Waterfront stone square
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.32, 2.4), mats.limestone);
  plaza.position.y = 0.16;
  plaza.receiveShadow = true;
  g.add(plaza);

  // Main Neo-Baroque cube hall
  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(1.45, 1.35, 1.45), mats.whiteMarble);
  mainHall.position.set(0, 0.99, -0.1);
  mainHall.castShadow = true;
  g.add(mainHall);

  // Tall arched facade windows on all sides
  for (const wz of [-0.84, 0.64]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.04), mats.windowGlass);
    win.position.set(0, 1.02, wz);
    g.add(win);
  }

  // Front entrance imperial pavilion (Hünkar Kasrı)
  const pavilion = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.72, 0.56), mats.limestone);
  pavilion.position.set(0, 0.68, 0.75);
  g.add(pavilion);

  // Ornate drum + dome
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.3, 16), mats.whiteMarble);
  drum.position.set(0, 1.78, -0.1);
  g.add(drum);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.64, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    mats.leadDome
  );
  dome.position.set(0, 1.9, -0.1);
  dome.castShadow = true;
  g.add(dome);

  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.35, 8), mats.goldFinial);
  finial.position.set(0, 2.66, -0.1);
  g.add(finial);

  // Twin slender baroque minarets
  addMinaret(g, -0.92, 0.58, 2.25, mats, 1);
  addMinaret(g, 0.92, 0.58, 2.25, mats, 1);

  return g;
}

/** 5. Beşiktaş: Dolmabahçe Clock Tower + Maritime Square Arch + Eagle Monument */
function buildBesiktas(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  const square = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.32, 2.4), mats.limestone);
  square.position.y = 0.16;
  square.receiveShadow = true;
  g.add(square);

  // Tiered Dolmabahçe-style Baroque Clock Tower
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), mats.whiteMarble);
  t1.position.set(-0.55, 0.79, -0.15);
  t1.castShadow = true;
  g.add(t1);

  const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.9, 0.76), mats.limestone);
  t2.position.set(-0.55, 1.7, -0.15);
  t2.castShadow = true;
  g.add(t2);

  const t3 = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.62), mats.whiteMarble);
  t3.position.set(-0.55, 2.5, -0.15);
  t3.castShadow = true;
  g.add(t3);

  // Clock faces
  for (const dir of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 14), mats.goldFinial);
    face.rotation.x = Math.PI / 2;
    face.position.set(-0.55, 2.52, -0.15 + dir * 0.32);
    g.add(face);
  }

  const clockCrown = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.55, 4), mats.leadDome);
  clockCrown.rotation.y = Math.PI / 4;
  clockCrown.position.set(-0.55, 3.12, -0.15);
  g.add(clockCrown);

  // Sculpted Eagle Monument on Pedestal
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.75, 8), mats.darkSlate);
  pedestal.position.set(0.75, 0.68, 0.35);
  g.add(pedestal);

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0x2a3138,
    roughness: 0.34,
    metalness: 0.76,
  });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 8), bronzeMat);
  body.position.set(0.75, 1.32, 0.35);
  g.add(body);

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.24), bronzeMat);
    wing.position.set(0.75 + side * 0.35, 1.46, 0.35);
    wing.rotation.z = side * 0.42;
    g.add(wing);
  }

  return g;
}

/** 6. Galata Kulesi: Iconic tall medieval cylindrical stone tower + conical dark spire */
function buildGalataKulesi(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Hillside stone plaza
  const hill = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.65, 0.42, 16), mats.limestone);
  hill.position.y = 0.21;
  hill.receiveShadow = true;
  g.add(hill);

  // Thick medieval cylindrical shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 2.75, 20), mats.limestone);
  shaft.position.y = 1.78;
  shaft.castShadow = true;
  g.add(shaft);

  // Decorative stone bands
  for (const by of [1.1, 2.1, 2.95]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.05, 8, 20), mats.whiteMarble);
    band.rotation.x = Math.PI / 2;
    band.position.y = by;
    g.add(band);
  }

  // Arched observation gallery + iron balustrade
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.72, 0.22, 20), mats.whiteMarble);
  gallery.position.y = 3.22;
  g.add(gallery);

  const upperRoom = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.64, 0.46, 18), mats.windowGlass);
  upperRoom.position.y = 3.55;
  g.add(upperRoom);

  // Signature tall conical dark slate spire
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.45, 20), mats.darkSlate);
  cone.position.y = 4.48;
  cone.castShadow = true;
  g.add(cone);

  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.48, 8), mats.goldFinial);
  finial.position.y = 5.38;
  g.add(finial);

  // Small adjacent Beyoğlu townhouse
  const sideHouse = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.95, 0.78), mats.terracotta);
  sideHouse.position.set(-1.02, 0.88, 0.35);
  sideHouse.castShadow = true;
  g.add(sideHouse);

  return g;
}

/** 7. Karaköy: Historic Neo-Classical Port Building + Nostalgic Red Tram */
function buildKarakoy(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.32, 2.3), mats.limestone);
  base.position.y = 0.16;
  base.receiveShadow = true;
  g.add(base);

  // Neoclassical stone bank/han building
  const building = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.55, 1.15), mats.limestone);
  building.position.set(-0.25, 1.09, -0.35);
  building.castShadow = true;
  g.add(building);

  // Classical cornice & pediment
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.14, 1.28), mats.whiteMarble);
  cornice.position.set(-0.25, 1.92, -0.35);
  g.add(cornice);

  const domeCupola = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mats.leadDome
  );
  domeCupola.position.set(-0.25, 1.98, -0.35);
  g.add(domeCupola);

  // Front columns
  for (const cx of [-0.95, -0.45, 0.05, 0.45]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.45, 10), mats.whiteMarble);
    col.position.set(cx, 1.05, 0.26);
    g.add(col);
  }

  // Nostalgic red-and-cream Istanbul tram in front
  const tramRed = new THREE.MeshStandardMaterial({ color: 0xc42d2d, roughness: 0.35, metalness: 0.25 });
  const tramBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.58, 0.46), tramRed);
  tramBody.position.set(0.42, 0.68, 0.72);
  tramBody.castShadow = true;
  g.add(tramBody);

  const tramRoof = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.1, 0.48), mats.whiteMarble);
  tramRoof.position.set(0.42, 1.02, 0.72);
  g.add(tramRoof);

  const tramWin = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.24, 0.48), mats.windowGlass);
  tramWin.position.set(0.42, 0.76, 0.72);
  g.add(tramWin);

  return g;
}

/** 8. Galata Köprüsü: Double-deck Haliç bridge with arched lower promenade & lamps */
function buildGalataKoprusu(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Four stone/steel support piers
  for (const px of [-1.45, -0.48, 0.48, 1.45]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.9, 1.25), mats.limestone);
    pier.position.set(px, 0.45, 0);
    g.add(pier);
  }

  // Lower promenade deck (restaurants & fishing level)
  const lowerDeck = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.18, 1.15), mats.steelBlue);
  lowerDeck.position.set(0, 0.85, 0);
  lowerDeck.castShadow = true;
  g.add(lowerDeck);

  // Upper roadway deck
  const upperDeck = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.18, 1.25), mats.darkSlate);
  upperDeck.position.set(0, 1.48, 0);
  upperDeck.castShadow = true;
  g.add(upperDeck);

  // Side railing trusses & glowing Istanbul bridge lamps
  const lampGlow = new THREE.MeshStandardMaterial({
    color: 0xffe4a0,
    emissive: 0xffc857,
    emissiveIntensity: 0.7,
    roughness: 0.2,
  });
  for (const lx of [-1.4, -0.45, 0.45, 1.4]) {
    for (const lz of [-0.54, 0.54]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.65, 6), mats.steelBlue);
      post.position.set(lx, 1.88, lz);
      g.add(post);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lampGlow);
      globe.position.set(lx, 2.24, lz);
      g.add(globe);
    }
  }

  // Iconic bridge control towers at center
  for (const tz of [-0.62, 0.62]) {
    const kiosk = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.72, 0.24), mats.terracotta);
    kiosk.position.set(0, 1.16, tz);
    g.add(kiosk);
  }

  return g;
}

/** 9. Sultanahmet (Blue Mosque): Cascading domes + 6 slender minarets */
function buildSultanahmet(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Courtyard terrace
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.34, 2.8), mats.limestone);
  terrace.position.y = 0.17;
  terrace.receiveShadow = true;
  g.add(terrace);

  // Main prayer hall
  const hall = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.15, 1.9), mats.whiteMarble);
  hall.position.set(0, 0.9, 0);
  hall.castShadow = true;
  g.add(hall);

  // Four cascading semi-domes
  const semiOffsets: [number, number][] = [
    [0.65, 0],
    [-0.65, 0],
    [0, 0.65],
    [0, -0.65],
  ];
  for (const [sx, sz] of semiOffsets) {
    const semi = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      mats.leadDome
    );
    semi.position.set(sx, 1.48, sz);
    g.add(semi);
  }

  // Central grand dome
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.32, 18), mats.whiteMarble);
  drum.position.set(0, 1.62, 0);
  g.add(drum);

  const grandDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
    mats.leadDome
  );
  grandDome.position.set(0, 1.76, 0);
  grandDome.castShadow = true;
  g.add(grandDome);

  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.38, 8), mats.goldFinial);
  finial.position.set(0, 2.64, 0);
  g.add(finial);

  // Famous 6 minarets of Sultanahmet
  const minaretCoords: [number, number, number][] = [
    [-1.18, -1.02, 2.3],
    [1.18, -1.02, 2.3],
    [-1.18, 0.2, 2.15],
    [1.18, 0.2, 2.15],
    [-1.18, 1.08, 1.95],
    [1.18, 1.08, 1.95],
  ];
  for (const [mx, mz, mh] of minaretCoords) {
    addMinaret(g, mx, mz, mh, mats, 2);
  }

  return g;
}

/** 10. Balat: Vibrant stepped row of colorful Ottoman bay-window (cumba) houses */
function buildBalat(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Cobblestone slope plinth
  const slope = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.35, 2.2), mats.limestone);
  slope.position.y = 0.175;
  slope.receiveShadow = true;
  g.add(slope);

  const houseConfigs = [
    { x: -1.15, h: 1.55, color: 0xe6a832 }, // Ochre yellow
    { x: -0.38, h: 1.85, color: 0xc84b3b }, // Terracotta red
    { x: 0.38, h: 1.7, color: 0x2b7cb3 }, // Cobalt blue
    { x: 1.15, h: 1.45, color: 0x3b8f6d }, // Sage green
  ];

  for (const cfg of houseConfigs) {
    const wallMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      roughness: 0.68,
      metalness: 0.04,
    });

    // Lower floor
    const lower = new THREE.Mesh(new THREE.BoxGeometry(0.72, cfg.h * 0.55, 1.05), wallMat);
    lower.position.set(cfg.x, 0.35 + (cfg.h * 0.55) / 2, 0);
    lower.castShadow = true;
    g.add(lower);

    // Overhanging upper floor (cumba bay window)
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.74, cfg.h * 0.5, 1.24), wallMat);
    upper.position.set(cfg.x, 0.35 + cfg.h * 0.75, 0.12);
    upper.castShadow = true;
    g.add(upper);

    // Window trims
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.04), mats.windowGlass);
    win.position.set(cfg.x, 0.35 + cfg.h * 0.78, 0.75);
    g.add(win);

    // Pitched tile roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.42, 4), mats.terracotta);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(cfg.x, 0.35 + cfg.h + 0.16, 0.08);
    g.add(roof);
  }

  return g;
}

/** 11. Taksim: Cumhuriyet Anıtı + Nostalgic Red İstiklal Tram + Beyoğlu Plaza */
function buildTaksim(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();

  // Circular Taksim Republic Plaza plinth
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.82, 0.34, 20), mats.limestone);
  plaza.position.y = 0.17;
  plaza.receiveShadow = true;
  g.add(plaza);

  const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.24, 0.22, 16), mats.whiteMarble);
  innerRing.position.y = 0.44;
  g.add(innerRing);

  // Iconic Taksim Cumhuriyet Anıtı (arched red-pink marble & bronze monument)
  const marblePink = new THREE.MeshStandardMaterial({ color: 0xc98a7c, roughness: 0.48, metalness: 0.08 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x3b4540, roughness: 0.32, metalness: 0.72 });

  const monBase = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.72, 0.95), marblePink);
  monBase.position.set(-0.25, 0.9, -0.15);
  monBase.castShadow = true;
  g.add(monBase);

  const monArch = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.35, 0.75), marblePink);
  monArch.position.set(-0.25, 1.9, -0.15);
  monArch.castShadow = true;
  g.add(monArch);

  const monCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.76, 14), marblePink);
  monCrown.rotation.x = Math.PI / 2;
  monCrown.position.set(-0.25, 2.55, -0.15);
  g.add(monCrown);

  // Sculpted bronze figure silhouettes flanking monument
  for (const fx of [-0.52, -0.25, 0.02]) {
    const statue = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.65, 8), bronzeMat);
    statue.position.set(fx, 1.52, 0.28);
    g.add(statue);
  }

  // Nostalgic Red İstiklal Street Tram gliding beside the monument!
  const tramRed = new THREE.MeshStandardMaterial({ color: 0xd92b2b, roughness: 0.3, metalness: 0.22 });
  const tramBody = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.68, 0.56), tramRed);
  tramBody.position.set(0.68, 0.74, 0.68);
  tramBody.rotation.y = -0.35;
  tramBody.castShadow = true;
  g.add(tramBody);

  const tramWin = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.26, 0.58), mats.windowGlass);
  tramWin.position.set(0.68, 0.84, 0.68);
  tramWin.rotation.y = -0.35;
  g.add(tramWin);

  const tramRoof = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.12, 0.58), mats.whiteMarble);
  tramRoof.position.set(0.68, 1.12, 0.68);
  tramRoof.rotation.y = -0.35;
  g.add(tramRoof);

  const pantograph = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), mats.darkSlate);
  pantograph.position.set(0.68, 1.38, 0.68);
  g.add(pantograph);

  return g;
}

/** 12. BAŞLANGIÇ Istanbul Start Gate Archway */
function buildBaslangicGate(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();
  const crimsonMat = new THREE.MeshStandardMaterial({ color: 0xd93829, roughness: 0.35, metalness: 0.12 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.28, 1.6), mats.limestone);
  plinth.position.y = 0.14;
  plinth.receiveShadow = true;
  g.add(plinth);

  for (const px of [-0.98, 0.98]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.46, 2.25, 0.46), mats.whiteMarble);
    col.position.set(px, 1.4, 0);
    col.castShadow = true;
    g.add(col);

    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mats.goldFinial);
    cap.position.set(px, 2.75, 0);
    g.add(cap);
  }

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.52, 0.58), crimsonMat);
  lintel.position.set(0, 2.52, 0);
  lintel.castShadow = true;
  g.add(lintel);

  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(2.74, 0.12, 0.64), mats.goldFinial);
  goldTrim.position.set(0, 2.82, 0);
  g.add(goldTrim);

  return g;
}

/** Dedicated Recognizable 3D Istanbul BANKA Building (Clickable Finance Center!) */
export function createBankBuildingMesh(mats: LandmarkSharedMaterials): THREE.Group {
  const g = new THREE.Group();
  const navyAccent = new THREE.MeshStandardMaterial({ color: 0x163854, roughness: 0.35, metalness: 0.25 });

  // Grand stepped marble staircase plinth
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.22, 3.0), mats.limestone);
  step1.position.y = 0.11;
  step1.receiveShadow = true;
  g.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.22, 2.55), mats.whiteMarble);
  step2.position.y = 0.33;
  g.add(step2);

  // Neoclassical marble hall
  const hall = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.95, 2.0), mats.whiteMarble);
  hall.position.set(0, 1.4, -0.1);
  hall.castShadow = true;
  g.add(hall);

  // Four classical front pillars
  for (const cx of [-1.15, -0.42, 0.42, 1.15]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 1.92, 12), mats.whiteMarble);
    pillar.position.set(cx, 1.4, 0.98);
    pillar.castShadow = true;
    g.add(pillar);
  }

  // Brass double vault entrance door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.25, 0.14), mats.goldFinial);
  door.position.set(0, 1.06, 0.9);
  g.add(door);

  // Deep navy frieze & triangular golden-trimmed classical pediment
  const frieze = new THREE.Mesh(new THREE.BoxGeometry(3.22, 0.34, 2.38), navyAccent);
  frieze.position.set(0, 2.52, 0.02);
  g.add(frieze);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.35, 0.88, 4), mats.leadDome);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, 3.12, 0.02);
  roof.castShadow = true;
  g.add(roof);

  const goldCoinEmblem = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16), mats.goldFinial);
  goldCoinEmblem.rotation.x = Math.PI / 2;
  goldCoinEmblem.position.set(0, 2.55, 1.24);
  g.add(goldCoinEmblem);

  return g;
}

export function createLandmarkMesh(stopId: string, mats: LandmarkSharedMaterials): THREE.Group {
  switch (stopId) {
    case 'baslangic':
      return buildBaslangicGate(mats);
    case 'uskudar':
      return buildUskudar(mats);
    case 'kiz-kulesi':
      return buildKizKulesi(mats);
    case 'kopru':
      return buildBogazKoprusu(mats);
    case 'ortakoy':
      return buildOrtakoy(mats);
    case 'besiktas':
      return buildBesiktas(mats);
    case 'taksim':
      return buildTaksim(mats);
    case 'galata-kulesi':
      return buildGalataKulesi(mats);
    case 'karakoy':
      return buildKarakoy(mats);
    case 'galata-koprusu':
      return buildGalataKoprusu(mats);
    case 'sultanahmet':
      return buildSultanahmet(mats);
    case 'balat':
      return buildBalat(mats);
    default:
      return buildUskudar(mats);
  }
}
