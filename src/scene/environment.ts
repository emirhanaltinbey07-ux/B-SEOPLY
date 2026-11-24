import * as THREE from 'three';
import { createChampionBannerTexture } from './materials';

/**
 * Reference Image 1 + Istanbul Bosphorus Stylized 3D City Diorama Environment:
 * - Surrounding crisp asphalt city avenues, pale concrete sidewalks, white crosswalks & stairs
 * - Animated miniature yellow taxis & pastel cars driving around the city loop
 * - 12 animated 3D Istanbul street NPCs strolling sidewalks & waving near market stalls and park
 * - Lush stylized city park (curved sandy path, iron park archway, benches, autumn-orange & lush-green round-canopy trees)
 * - Colorful stylized city blocks (windows, awnings, rooftop water towers, red-white striped market stalls)
 * - Sparkling blue Bosphorus waterfront channel beyond the city avenues with animated Şehir Hatları ferries & flapping seagulls
 * - Orbiting 3D Champion Propeller Airplane towing a fluttering sky banner displaying the winning team's name
 * - Pooled zero-GC celebration fireworks/confetti system
 */

export interface RoadCarActor {
  group: THREE.Group;
  progress: number; // 0..1 around square road loop
  speed: number;
  laneOffset: number;
}

export interface StreetNpcActor {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  mode: 'patrol' | 'idle';
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  phase: number;
  speed: number;
}

export interface VictoryAirplaneActor {
  group: THREE.Group;
  propeller: THREE.Group;
  bannerMesh: THREE.Mesh;
  bannerMat: THREE.MeshStandardMaterial;
  bannerBaseZ: Float32Array;
  active: boolean;
  angle: number;
}

export interface FerryActor {
  group: THREE.Group;
  orbitRadiusX: number;
  orbitRadiusZ: number;
  angle: number;
  speed: number;
  direction: number;
}

export interface SeagullActor {
  group: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  radius: number;
  height: number;
  angle: number;
  speed: number;
  flapPhase: number;
}

export interface FireworksSystem {
  mesh: THREE.InstancedMesh;
  active: boolean;
  trigger: () => void;
  update: (dt: number) => void;
}

export interface IstanbulEnvironment {
  group: THREE.Group;
  waterMesh: THREE.Mesh;
  waterBaseY: Float32Array;
  cars: RoadCarActor[];
  npcs: StreetNpcActor[];
  ferries: FerryActor[];
  seagulls: SeagullActor[];
  airplane: VictoryAirplaneActor;
  fireworks: FireworksSystem;
  activateChampionPlane: (teamName: string, accentHex: string, maxAniso: number) => void;
  hideChampionPlane: () => void;
  update: (elapsed: number, dt: number) => void;
}

const _dummy = new THREE.Object3D();
const _tmpColor = new THREE.Color();

function createSkyDome(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#1f84de');
  grad.addColorStop(0.42, '#5cbcf5');
  grad.addColorStop(0.6, '#bae5fc');
  grad.addColorStop(0.7, '#e2f4fd');
  grad.addColorStop(1.0, '#0d7dc2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft sunlit daytime clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
  for (let i = 0; i < 20; i++) {
    const cx = Math.random() * 512;
    const cy = 110 + Math.random() * 110;
    const rx = 30 + Math.random() * 56;
    const ry = 9 + Math.random() * 15;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.SphereGeometry(240, 28, 16),
    new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false })
  );
}

/** Stylized toy/diorama city car (Yellow Taxi / Pastel Coupe) matching Reference Image 1 */
function createCityCar(colorHex: number, isTaxi = false): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.32, metalness: 0.15 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x3b607a, roughness: 0.15, metalness: 0.55 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222930, roughness: 0.65 });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 0.78), bodyMat);
  chassis.position.y = 0.34;
  chassis.castShadow = true;
  g.add(chassis);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.36, 0.66), bodyMat);
  cabin.position.set(-0.06, 0.7, 0);
  cabin.castShadow = true;
  g.add(cabin);

  const windows = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.24, 0.68), glassMat);
  windows.position.set(-0.06, 0.7, 0);
  g.add(windows);

  if (isTaxi) {
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.12, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x1b242c, roughness: 0.4 })
    );
    sign.position.set(-0.06, 0.94, 0);
    g.add(sign);
  }

  for (const wx of [-0.45, 0.45]) {
    for (const wz of [-0.4, 0.4]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 10), wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, 0.18, wz);
      g.add(wheel);
    }
  }
  return g;
}

/** Stylized colorful multi-story city block building matching Reference Image 1 */
function createCityBuilding(
  w: number,
  h: number,
  d: number,
  wallHex: number,
  trimHex: number,
  hasAwning = false
): THREE.Group {
  const g = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.72 });
  const trimMat = new THREE.MeshStandardMaterial({ color: trimHex, roughness: 0.55 });
  const winMat = new THREE.MeshStandardMaterial({ color: 0x6ca7c9, roughness: 0.18, metalness: 0.4 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Roof parapet cornice
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.24, 0.28, d + 0.24), trimMat);
  cornice.position.y = h + 0.12;
  g.add(cornice);

  // Clean recessed window grid on front & back
  const floors = Math.max(2, Math.floor(h / 1.45));
  const cols = Math.max(2, Math.floor(w / 1.3));
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = -w / 2 + ((c + 0.5) * w) / cols;
      const wy = 1.05 + f * ((h - 1.35) / floors);
      const winF = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.08), winMat);
      winF.position.set(wx, wy, d / 2 + 0.02);
      g.add(winF);

      const winB = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.75, 0.08), winMat);
      winB.position.set(wx, wy, -d / 2 - 0.02);
      g.add(winB);
    }
  }

  if (hasAwning) {
    const awningMat = new THREE.MeshStandardMaterial({ color: 0x3b6ea5, roughness: 0.5 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.25, 0.75), awningMat);
    awning.position.set(0, 1.15, d / 2 + 0.35);
    awning.rotation.x = 0.25;
    g.add(awning);
  }

  return g;
}

/** Red-and-white striped miniature market stall (Ref 1 foreground charm!) */
function createMarketStall(): THREE.Group {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x9b683b, roughness: 0.75 });
  const red = new THREE.MeshStandardMaterial({ color: 0xe23b26, roughness: 0.45 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });

  const counter = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.72, 0.9), wood);
  counter.position.y = 0.36;
  counter.castShadow = true;
  g.add(counter);

  for (const px of [-0.66, 0.66]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.45, 6), wood);
    post.position.set(px, 0.95, 0);
    g.add(post);
  }

  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.14, 1.15),
      i % 2 === 0 ? red : white
    );
    stripe.position.set(-0.64 + i * 0.32, 1.66, 0);
    stripe.rotation.x = 0.22;
    g.add(stripe);
  }
  return g;
}

function createFerryMesh(): THREE.Group {
  const g = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: 0xf7f7f5, roughness: 0.42, metalness: 0.08 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x13385b, roughness: 0.45, metalness: 0.15 });
  const funnelMat = new THREE.MeshStandardMaterial({ color: 0xf0b429, roughness: 0.35, metalness: 0.25 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1c4c70, roughness: 0.12, metalness: 0.65 });
  const wakeMat = new THREE.MeshBasicMaterial({ color: 0xe6f8ff, transparent: true, opacity: 0.55 });

  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.44, 0.92), hullMat);
  hull.position.y = 0.18;
  g.add(hull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.75, 4), hullMat);
  bow.rotation.z = -Math.PI / 2;
  bow.rotation.x = Math.PI / 4;
  bow.position.set(1.85, 0.18, 0);
  g.add(bow);

  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.14, 0.12, 0.95), trimMat);
  stripe.position.y = 0.04;
  g.add(stripe);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.44, 0.76), hullMat);
  cabin.position.set(-0.08, 0.62, 0);
  g.add(cabin);

  const windows = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.8), glassMat);
  windows.position.set(-0.08, 0.64, 0);
  g.add(windows);

  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.62, 10), funnelMat);
  funnel.position.set(-0.35, 1.08, 0);
  g.add(funnel);

  const wake = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.75), wakeMat);
  wake.rotation.x = -Math.PI / 2;
  wake.position.set(-2.6, 0.04, 0);
  g.add(wake);
  return g;
}

function createSeagull(): { group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh } {
  const g = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.48 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0xd0dce6, roughness: 0.52 });

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 6), whiteMat);
  body.rotation.x = Math.PI / 2;
  g.add(body);

  const wingGeo = new THREE.BoxGeometry(0.58, 0.03, 0.2);
  const leftWing = new THREE.Mesh(wingGeo, tipMat);
  leftWing.position.set(-0.28, 0.02, 0);
  g.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, tipMat);
  rightWing.position.set(0.28, 0.02, 0);
  g.add(rightWing);
  return { group: g, leftWing, rightWing };
}

/** Stylized miniature Istanbul pedestrian NPC for bustling sidewalks, stalls & park */
function createStreetNpc(
  shirtHex: number,
  pantsHex: number,
  hairHex: number,
  hasHat: boolean
): Omit<StreetNpcActor, 'mode' | 'startPos' | 'endPos' | 'phase' | 'speed'> {
  const g = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xf7d2b5, roughness: 0.58 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtHex, roughness: 0.55 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsHex, roughness: 0.68 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.65 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x262e36, roughness: 0.7 });

  const makeLeg = (x: number) => {
    const leg = new THREE.Group();
    leg.position.set(x, 0.52, 0);
    const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.46, 8), pantsMat);
    limb.position.y = -0.23;
    limb.castShadow = true;
    leg.add(limb);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.24), shoeMat);
    foot.position.set(0, -0.47, 0.04);
    leg.add(foot);
    return leg;
  };

  const makeArm = (x: number) => {
    const arm = new THREE.Group();
    arm.position.set(x, 1.0, 0);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.36, 8), shirtMat);
    sleeve.position.y = -0.18;
    arm.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), skinMat);
    hand.position.y = -0.38;
    arm.add(hand);
    return arm;
  };

  const leftLeg = makeLeg(-0.11);
  const rightLeg = makeLeg(0.11);
  const leftArm = makeArm(-0.25);
  const rightArm = makeArm(0.25);
  g.add(leftLeg, rightLeg, leftArm, rightArm);

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.54, 10), shirtMat);
  torso.position.y = 0.8;
  torso.castShadow = true;
  g.add(torso);

  // Stylized big chibi head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 10), skinMat);
  head.position.y = 1.28;
  head.castShadow = true;
  g.add(head);

  // Hair cap
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.245, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hair.position.y = 1.3;
  g.add(hair);

  if (hasHat) {
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xf4c425, roughness: 0.42 });
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 12), hatMat);
    brim.position.y = 1.44;
    g.add(brim);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.16, 12), hatMat);
    crown.position.y = 1.54;
    g.add(crown);
  }

  return { group: g, leftLeg, rightLeg, leftArm, rightArm };
}

/** 3D Red-and-White Propeller Airplane towing a large animated fluttering Champion Banner! */
function createVictoryAirplane(): VictoryAirplaneActor {
  const g = new THREE.Group();
  const redMat = new THREE.MeshStandardMaterial({ color: 0xe30a17, roughness: 0.3, metalness: 0.22 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.28, metalness: 0.14 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf5b82e, roughness: 0.26, metalness: 0.65 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x2a6990, roughness: 0.12, metalness: 0.68 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.5 });

  // Fuselage pointing along +X
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.56, 3.6, 14), whiteMat);
  fuselage.rotation.z = -Math.PI / 2;
  fuselage.castShadow = true;
  g.add(fuselage);

  // Red nose cone at +X
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.85, 14), redMat);
  nose.rotation.z = -Math.PI / 2;
  nose.position.set(2.2, 0, 0);
  g.add(nose);

  // Racing stripe along fuselage
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.16, 1.14), redMat);
  stripe.position.set(0.1, 0.04, 0);
  g.add(stripe);

  // Cockpit canopy
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.46, 12, 10), glassMat);
  cockpit.scale.set(1.55, 0.72, 0.82);
  cockpit.position.set(0.45, 0.42, 0);
  g.add(cockpit);

  // Main wings (spanning Z)
  const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 5.4), redMat);
  mainWing.position.set(0.45, 0.05, 0);
  mainWing.castShadow = true;
  g.add(mainWing);

  // Gold wingtip stripes
  for (const wz of [-2.4, 2.4]) {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.14, 0.42), goldMat);
    tip.position.set(0.45, 0.05, wz);
    g.add(tip);
  }

  // Tailfin & horizontal stabilizer at -X
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.12), redMat);
  tailFin.position.set(-1.55, 0.55, 0);
  g.add(tailFin);

  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 2.1), whiteMat);
  tailWing.position.set(-1.55, 0.14, 0);
  g.add(tailWing);

  // Spinning nose propeller
  const propeller = new THREE.Group();
  propeller.position.set(2.65, 0, 0);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), goldMat);
  propeller.add(hub);
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.55, 0.18), darkMat);
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 1.55), darkMat);
  propeller.add(blade1, blade2);
  g.add(propeller);

  // Tow cable trailing behind tail along -X
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), darkMat);
  cable.rotation.z = Math.PI / 2;
  cable.position.set(-3.0, 0, 0);
  g.add(cable);

  // Lead vertical crossbar for banner
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.7, 8), goldMat);
  bar.position.set(-4.2, 0, 0);
  g.add(bar);

  // Large fluttering horizontal sky banner trailing behind the airplane (-4.2 .. -15.6)
  const bannerW = 11.4;
  const bannerH = 2.6;
  const bannerGeo = new THREE.PlaneGeometry(bannerW, bannerH, 20, 4);
  const bPos = bannerGeo.attributes.position as THREE.BufferAttribute;
  const bannerBaseZ = new Float32Array(bPos.count);
  for (let i = 0; i < bPos.count; i++) {
    bannerBaseZ[i] = bPos.getZ(i);
  }

  const bannerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });

  const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
  bannerMesh.position.set(-4.2 - bannerW / 2, 0, 0);
  // Slight upward tilt toward elevated tabletop camera for crystal-clear readability
  bannerMesh.rotation.x = -0.28;
  g.add(bannerMesh);

  g.scale.setScalar(0.84);
  g.visible = false;

  return {
    group: g,
    propeller,
    bannerMesh,
    bannerMat,
    bannerBaseZ,
    active: false,
    angle: 2.1,
  };
}

/**
 * Stylized Monopoly-Go City Streetscape & Park Blocks surrounding the board (Reference Image 1!)
 */
function buildCityDioramaSurroundings(group: THREE.Group) {
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x4e5c69, roughness: 0.85 });
  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xd0d9e0, roughness: 0.78 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x93a1ad, roughness: 0.75 });
  const parkGrassMat = new THREE.MeshStandardMaterial({ color: 0x57ad14, roughness: 0.8 });
  const sandPathMat = new THREE.MeshStandardMaterial({ color: 0xf2ba57, roughness: 0.82 });
  const whiteStripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  // Main stylized city island slab (62 x 62) floating cleanly in the blue Bosphorus
  const roadSlab = new THREE.Mesh(new THREE.BoxGeometry(62, 1.4, 62), asphaltMat);
  roadSlab.position.y = -1.75;
  roadSlab.receiveShadow = true;
  group.add(roadSlab);

  // Outer stone seawall framing the Istanbul city peninsula
  const seaWall = new THREE.Mesh(
    new THREE.BoxGeometry(64, 1.2, 64),
    new THREE.MeshStandardMaterial({ color: 0xb7b1a5, roughness: 0.82 })
  );
  seaWall.position.y = -2.15;
  group.add(seaWall);

  // Raised sidewalk plaza directly framing the 24-tile board, 11 landmarks & BANKA (35 x 35)
  const innerSidewalk = new THREE.Mesh(new THREE.BoxGeometry(35.0, 0.45, 35.0), sidewalkMat);
  innerSidewalk.position.y = -0.82;
  innerSidewalk.receiveShadow = true;
  group.add(innerSidewalk);

  // Four side steps descending from the board sidewalk down to the city avenues (Ref 1 detail!)
  const stairPositions: [number, number, number][] = [
    [0, -0.92, 17.9],
    [0, -0.92, -17.9],
    [17.9, -0.92, 0],
    [-17.9, -0.92, 0],
  ];
  for (const [sx, sy, sz] of stairPositions) {
    const isZ = Math.abs(sz) > Math.abs(sx);
    const stair = new THREE.Mesh(
      new THREE.BoxGeometry(isZ ? 3.2 : 1.0, 0.36, isZ ? 1.0 : 3.2),
      curbMat
    );
    stair.position.set(sx, sy, sz);
    group.add(stair);
  }

  // Crisp white crosswalk stripes on the 4 city avenues (Ref 1 detail!)
  for (let i = -2; i <= 2; i++) {
    for (const side of [-1, 1]) {
      const zStripe = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.04, 2.2), whiteStripeMat);
      zStripe.position.set(i * 0.95, -1.03, side * 21.4);
      group.add(zStripe);

      const xStripe = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.04, 0.45), whiteStripeMat);
      xStripe.position.set(side * 21.4, -1.03, i * 0.95);
      group.add(xStripe);
    }
  }

  // Four outer city blocks beyond the avenues (y = -0.85):
  // 1) Northeast Lush Park Block (like Reference Image 1 top-right park!)
  const neParkBase = new THREE.Mesh(new THREE.BoxGeometry(18, 0.45, 18), parkGrassMat);
  neParkBase.position.set(27.5, -0.85, -24.5);
  neParkBase.receiveShadow = true;
  group.add(neParkBase);

  const nePath = new THREE.Mesh(new THREE.BoxGeometry(12, 0.06, 2.4), sandPathMat);
  nePath.position.set(27.5, -0.6, -24.5);
  nePath.rotation.y = Math.PI * 0.25;
  group.add(nePath);

  // Ornamental Iron Park Gate Archway (Ref 1 signature!)
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x2a343d, roughness: 0.45, metalness: 0.7 });
  for (const px of [-1.8, 1.8]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.2, 0.32), ironMat);
    pillar.position.set(21.4 + px * 0.7, 0.85, -18.4 - px * 0.7);
    group.add(pillar);
  }
  const archTop = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.35, 0.28), ironMat);
  archTop.position.set(21.4, 2.45, -18.4);
  archTop.rotation.y = -Math.PI * 0.25;
  group.add(archTop);

  // 2) Northwest Stylized City Block (Ref 1 pastel tan, mint & warm ochre buildings!)
  const nwSidewalk = new THREE.Mesh(new THREE.BoxGeometry(22, 0.45, 14), sidewalkMat);
  nwSidewalk.position.set(-22, -0.85, -26.5);
  group.add(nwSidewalk);

  const nwBuildings: [number, number, number, number, number, number, number, boolean][] = [
    [-28, -26, 5.2, 6.8, 4.6, 0x8db5b2, 0xf2eadc, true],
    [-21, -26.5, 5.4, 8.6, 4.8, 0xe8d9be, 0x8ea9b8, true],
    [-14, -26, 4.8, 5.4, 4.2, 0xc7956d, 0xf0e4cf, true],
  ];
  for (const [bx, bz, w, h, d, wc, tc, awn] of nwBuildings) {
    const b = createCityBuilding(w, h, d, wc, tc, awn);
    b.position.set(bx, -0.62, bz);
    group.add(b);
  }

  // 3) Southwest & Southeast City Blocks + Market Stalls (Ref 1 foreground!)
  const swSidewalk = new THREE.Mesh(new THREE.BoxGeometry(16, 0.45, 18), sidewalkMat);
  swSidewalk.position.set(-26.5, -0.85, 22);
  group.add(swSidewalk);

  const swB1 = createCityBuilding(5.2, 5.4, 4.8, 0xc49574, 0xf2e8d8, true);
  swB1.position.set(-25.5, -0.62, 23.5);
  group.add(swB1);

  const swB2 = createCityBuilding(4.8, 4.6, 4.5, 0xe8e0d2, 0x5c7c96, true);
  swB2.position.set(-25.5, -0.62, 16.2);
  group.add(swB2);

  const seSidewalk = new THREE.Mesh(new THREE.BoxGeometry(16, 0.45, 16), sidewalkMat);
  seSidewalk.position.set(26.5, -0.85, 23);
  group.add(seSidewalk);

  const seB1 = createCityBuilding(5.4, 5.8, 4.8, 0xd9cbb6, 0x5382a6, true);
  seB1.position.set(26.5, -0.62, 23.5);
  group.add(seB1);

  // Charming red-white market stalls near foreground sidewalk corners (Ref 1!)
  const stall1 = createMarketStall();
  stall1.position.set(16.6, -0.6, 10.6);
  stall1.rotation.y = -Math.PI * 0.5;
  group.add(stall1);

  const stall2 = createMarketStall();
  stall2.position.set(-16.4, -0.6, 10.4);
  stall2.rotation.y = Math.PI * 0.5;
  group.add(stall2);

  // Stylized Round-Canopy Park & Street Trees (Vibrant Autumn Orange, Golden Yellow, Lush Green — Ref 1!)
  const treeSpecs: [number, number, number][] = [
    // NE Park grove
    [23.5, -23.5, 0xf27d16],
    [27.5, -27.5, 0x4ca816],
    [31.0, -22.5, 0xfab514],
    [25.0, -29.0, 0x3d9414],
    [31.5, -28.0, 0xf27d16],
    // Sidewalk perimeter stylized round trees (clear of landmarks at +-14.4)
    [-16.6, -16.8, 0x52b018],
    [-16.8, -10.5, 0xf27d16],
    [-16.8, 4.2, 0x469e16],
    [-16.8, 16.6, 0xfab514],
    [16.8, -16.2, 0xf27d16],
    [16.8, -11.0, 0x4ca816],
    [16.8, 3.6, 0xfab514],
    [16.8, 16.8, 0x469e16],
    [-10.2, -16.8, 0x52b018],
    [10.2, -16.8, 0xe8892a],
    [-10.2, 16.8, 0x5da125],
    [10.2, 16.8, 0xf2b730],
    [-24.0, 4.0, 0xe8892a],
    [24.5, 5.5, 0x62a826],
    [25.5, -6.5, 0xf2b730],
    [-24.5, -7.0, 0x5da125],
  ];

  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.2, 1.25, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7c5032, roughness: 0.88 });
  const crownGeo = new THREE.DodecahedronGeometry(0.95, 1);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.72 });

  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treeSpecs.length);
  const crowns = new THREE.InstancedMesh(crownGeo, crownMat, treeSpecs.length);
  crowns.castShadow = true;

  treeSpecs.forEach(([tx, tz, hex], i) => {
    const sc = 0.88 + ((i * 17) % 28) / 100;
    _dummy.position.set(tx, -0.6 + 0.62 * sc, tz);
    _dummy.rotation.set(0, i * 0.9, 0);
    _dummy.scale.set(sc, sc, sc);
    _dummy.updateMatrix();
    trunks.setMatrixAt(i, _dummy.matrix);

    _dummy.position.set(tx, -0.6 + 1.72 * sc, tz);
    _dummy.scale.set(sc * 1.05, sc * 1.15, sc * 1.05);
    _dummy.updateMatrix();
    crowns.setMatrixAt(i, _dummy.matrix);

    _tmpColor.setHex(hex);
    crowns.setColorAt(i, _tmpColor);
  });

  trunks.instanceMatrix.needsUpdate = true;
  crowns.instanceMatrix.needsUpdate = true;
  if (crowns.instanceColor) crowns.instanceColor.needsUpdate = true;
  trunks.computeBoundingSphere();
  crowns.computeBoundingSphere();
  group.add(trunks, crowns);

  // Warm Glowing Street Lamps along the sidewalks
  const lampCoords: [number, number][] = [
    [-16.4, 16.4], [-3.2, 16.8], [3.2, 16.8],
    [-16.4, -16.4], [-3.2, -16.8], [3.2, -16.8],
    [-16.8, -3.2], [16.8, -3.2],
    [23.0, -18.5], [27.0, -22.5],
  ];
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3b4856, roughness: 0.4, metalness: 0.65 });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff2be,
    emissive: 0xffd15c,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });

  for (const [lx, lz] of lampCoords) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 7), poleMat);
    pole.position.set(lx, 0.45, lz);
    group.add(pole);

    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), bulbMat);
    globe.position.set(lx, 1.62, lz);
    group.add(globe);
  }
}

function createFireworksSystem(group: THREE.Group): FireworksSystem {
  const count = 180;
  const geo = new THREE.OctahedronGeometry(0.26, 0);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  mesh.visible = false;
  group.add(mesh);

  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const life = new Float32Array(count);
  const colors = [0xffc83d, 0x26b5c4, 0xf25c43, 0x45d178, 0xffffff, 0x4d96ff];

  for (let i = 0; i < count; i++) {
    _tmpColor.setHex(colors[i % colors.length]);
    mesh.setColorAt(i, _tmpColor);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  let active = false;
  let burstTimer = 0;
  let burstCursor = 0;

  const spawnBurst = (offsetIdx: number, burstCount: number) => {
    const cx = (Math.random() - 0.5) * 24;
    const cy = 9 + Math.random() * 7;
    const cz = (Math.random() - 0.5) * 18;
    for (let i = 0; i < burstCount; i++) {
      const idx = (offsetIdx + i) % count;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const spd = 3.5 + Math.random() * 6.5;
      pos[idx * 3] = cx;
      pos[idx * 3 + 1] = cy;
      pos[idx * 3 + 2] = cz;
      vel[idx * 3] = Math.sin(phi) * Math.cos(theta) * spd;
      vel[idx * 3 + 1] = Math.cos(phi) * spd + 2.2;
      vel[idx * 3 + 2] = Math.sin(phi) * Math.sin(theta) * spd;
      life[idx] = 1.6 + Math.random() * 1.1;
    }
  };

  const trigger = () => {
    active = true;
    mesh.visible = true;
    burstTimer = 0;
    spawnBurst(0, 60);
    spawnBurst(60, 60);
    spawnBurst(120, 60);
  };

  const update = (dt: number) => {
    if (!active) return;
    burstTimer += dt;
    if (burstTimer > 1.15) {
      burstTimer = 0;
      spawnBurst(burstCursor, 60);
      burstCursor = (burstCursor + 60) % count;
    }

    for (let i = 0; i < count; i++) {
      if (life[i] > 0) {
        life[i] -= dt;
        vel[i * 3 + 1] -= 4.8 * dt;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        const s = Math.max(0.01, Math.min(1.15, life[i] * 0.78));
        _dummy.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
        _dummy.rotation.set(life[i] * 3, life[i] * 2.5, 0);
        _dummy.scale.set(s, s, s);
      } else {
        _dummy.position.set(0, -50, 0);
        _dummy.scale.set(0.001, 0.001, 0.001);
      }
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  return {
    mesh,
    get active() {
      return active;
    },
    trigger,
    update,
  };
}

/** Map progress [0..1) around a square city avenue loop of half-size R */
function sampleSquareLoop(t: number, r: number): { x: number; z: number; yaw: number } {
  const u = ((t % 1) + 1) % 1;
  const seg = u * 4;
  if (seg < 1) {
    return { x: -r + seg * 2 * r, z: r, yaw: 0 };
  } else if (seg < 2) {
    return { x: r, z: r - (seg - 1) * 2 * r, yaw: Math.PI / 2 };
  } else if (seg < 3) {
    return { x: r - (seg - 2) * 2 * r, z: -r, yaw: Math.PI };
  } else {
    return { x: -r, z: -r + (seg - 3) * 2 * r, yaw: -Math.PI / 2 };
  }
}

export function createIstanbulEnvironment(): IstanbulEnvironment {
  const group = new THREE.Group();

  // 1. Bright daytime Marmara sky dome
  group.add(createSkyDome());

  // 2. Sparkling blue Bosphorus Sea framing the Istanbul city diorama
  const waterGeo = new THREE.PlaneGeometry(320, 320, 34, 34);
  waterGeo.rotateX(-Math.PI / 2);
  const posAttr = waterGeo.attributes.position as THREE.BufferAttribute;
  const waterBaseY = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) {
    waterBaseY[i] = posAttr.getY(i);
  }
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0c84c9,
    roughness: 0.15,
    metalness: 0.24,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.position.y = -2.25;
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  // 3. Stylized Monopoly-Go City Avenues, Sidewalks, Park & Buildings
  buildCityDioramaSurroundings(group);

  // 4. Animated Yellow Taxis & Pastel City Cars driving around the 4 avenues (Ref 1!)
  const carConfigs: { color: number; isTaxi: boolean; progress: number; speed: number; lane: number }[] = [
    { color: 0xffc40a, isTaxi: true, progress: 0.08, speed: 0.032, lane: 19.6 },
    { color: 0xd08ee0, isTaxi: false, progress: 0.34, speed: 0.028, lane: 21.4 },
    { color: 0xffc40a, isTaxi: true, progress: 0.58, speed: 0.034, lane: 19.6 },
    { color: 0x35b3e6, isTaxi: false, progress: 0.82, speed: 0.03, lane: 21.4 },
  ];
  const cars: RoadCarActor[] = carConfigs.map((c) => {
    const mesh = createCityCar(c.color, c.isTaxi);
    group.add(mesh);
    return {
      group: mesh,
      progress: c.progress,
      speed: c.speed,
      laneOffset: c.lane,
    };
  });

  // 5. Animated Şehir Hatları ferries cruising outside the seawall
  const ferries: FerryActor[] = [
    { group: createFerryMesh(), orbitRadiusX: 38, orbitRadiusZ: 34, angle: 0.5, speed: 0.08, direction: 1 },
    { group: createFerryMesh(), orbitRadiusX: 44, orbitRadiusZ: 39, angle: 2.8, speed: 0.065, direction: -1 },
  ];
  for (const f of ferries) {
    f.group.position.y = -2.15;
    group.add(f.group);
  }

  // 6. Gliding seagulls
  const seagulls: SeagullActor[] = [];
  for (let i = 0; i < 7; i++) {
    const bird = createSeagull();
    const actor: SeagullActor = {
      ...bird,
      radius: 17 + (i % 3) * 6.5,
      height: 8.5 + (i % 3) * 2.2,
      angle: (i / 7) * Math.PI * 2,
      speed: 0.22 + (i % 3) * 0.06,
      flapPhase: i * 1.2,
    };
    group.add(actor.group);
    seagulls.push(actor);
  }

  // 7. 12 Animated 3D Istanbul Street NPCs (8 strolling sidewalks + 4 waving near stalls & NE park)
  const npcDefs: {
    shirt: number;
    pants: number;
    hair: number;
    hat: boolean;
    mode: 'patrol' | 'idle';
    start: [number, number, number];
    end: [number, number, number];
    speed: number;
  }[] = [
    // South sidewalk walkers
    { shirt: 0x2563eb, pants: 0x1e293b, hair: 0x2b1d14, hat: false, mode: 'patrol', start: [-13.5, -0.6, 16.0], end: [-3.5, -0.6, 16.0], speed: 0.34 },
    { shirt: 0xe11d48, pants: 0x334155, hair: 0x4a2e1b, hat: true, mode: 'patrol', start: [3.2, -0.6, 16.2], end: [11.5, -0.6, 16.2], speed: 0.31 },
    // North sidewalk walkers
    { shirt: 0x16a34a, pants: 0x1e293b, hair: 0x1c1917, hat: false, mode: 'patrol', start: [-11.0, -0.6, -16.1], end: [1.5, -0.6, -16.1], speed: 0.29 },
    { shirt: 0xd97706, pants: 0x374151, hair: 0x5c3a21, hat: true, mode: 'patrol', start: [4.0, -0.6, -16.0], end: [13.0, -0.6, -16.0], speed: 0.33 },
    // West sidewalk walkers
    { shirt: 0x7c3aed, pants: 0x1f2937, hair: 0x111827, hat: false, mode: 'patrol', start: [-16.1, -0.6, -9.0], end: [-16.1, -0.6, 2.5], speed: 0.3 },
    { shirt: 0x0891b2, pants: 0x334155, hair: 0x6b3f1d, hat: false, mode: 'patrol', start: [-16.2, -0.6, 5.5], end: [-16.2, -0.6, 14.5], speed: 0.32 },
    // East sidewalk walkers
    { shirt: 0xea580c, pants: 0x1e293b, hair: 0x1c1917, hat: true, mode: 'patrol', start: [16.1, -0.6, -9.5], end: [16.1, -0.6, 2.0], speed: 0.31 },
    // NE Park strolling visitor
    { shirt: 0x0d9488, pants: 0x334155, hair: 0x3b2416, hat: false, mode: 'patrol', start: [23.8, -0.6, -21.0], end: [30.2, -0.6, -27.2], speed: 0.26 },
    // Idle/waving Istanbul locals near market stalls, NW street, and park gate
    { shirt: 0xf43f5e, pants: 0x1f2937, hair: 0x261a12, hat: true, mode: 'idle', start: [15.4, -0.6, 10.6], end: [15.4, -0.6, 10.6], speed: 0 },
    { shirt: 0x2563eb, pants: 0x334155, hair: 0x1c1917, hat: false, mode: 'idle', start: [-15.2, -0.6, 10.4], end: [-15.2, -0.6, 10.4], speed: 0 },
    { shirt: 0xca8a04, pants: 0x1e293b, hair: 0x4b2e19, hat: false, mode: 'idle', start: [-18.5, -0.6, -21.2], end: [-18.5, -0.6, -21.2], speed: 0 },
    { shirt: 0x059669, pants: 0x374151, hair: 0x18181b, hat: true, mode: 'idle', start: [22.6, -0.6, -16.8], end: [22.6, -0.6, -16.8], speed: 0 },
  ];

  const npcs: StreetNpcActor[] = npcDefs.map((cfg, idx) => {
    const parts = createStreetNpc(cfg.shirt, cfg.pants, cfg.hair, cfg.hat);
    const startPos = new THREE.Vector3(...cfg.start);
    const endPos = new THREE.Vector3(...cfg.end);
    parts.group.position.copy(startPos);
    if (cfg.mode === 'idle') {
      parts.group.rotation.y = Math.atan2(-startPos.x, -startPos.z);
    }
    group.add(parts.group);
    return {
      ...parts,
      mode: cfg.mode,
      startPos,
      endPos,
      phase: idx * 0.9,
      speed: cfg.speed,
    };
  });

  // 8. Orbiting 3D Champion Airplane towing Team Name Banner (activated on Champion Reveal!)
  const airplane = createVictoryAirplane();
  group.add(airplane.group);

  const activateChampionPlane = (teamName: string, accentHex: string, maxAniso: number) => {
    const oldMap = airplane.bannerMat.map;
    airplane.bannerMat.map = createChampionBannerTexture(teamName, accentHex, maxAniso);
    airplane.bannerMat.needsUpdate = true;
    oldMap?.dispose();
    airplane.active = true;
    // Start in NW sky sweeping smoothly left-to-right broadside across camera view!
    airplane.angle = 2.05;
    airplane.group.visible = true;
  };

  const hideChampionPlane = () => {
    airplane.active = false;
    airplane.group.visible = false;
  };

  // 9. Celebration fireworks
  const fireworks = createFireworksSystem(group);

  const update = (elapsed: number, dt: number) => {
    const p = waterGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i);
      const vz = p.getZ(i);
      const wave =
        Math.sin(vx * 0.1 + elapsed * 1.4) * 0.14 +
        Math.cos(vz * 0.09 + elapsed * 1.1) * 0.12;
      p.setY(i, waterBaseY[i] + wave);
    }
    p.needsUpdate = true;

    // Move stylized taxis & cars along the 4 avenues
    for (const car of cars) {
      car.progress = (car.progress + dt * car.speed) % 1;
      const sample = sampleSquareLoop(car.progress, car.laneOffset);
      car.group.position.set(sample.x, -1.04, sample.z);
      car.group.rotation.y = sample.yaw;
    }

    // Animate 12 Istanbul street NPCs strolling sidewalks & waving near stalls/park
    for (const npc of npcs) {
      if (npc.mode === 'patrol') {
        const raw = (elapsed * npc.speed + npc.phase) % 2;
        const goingForward = raw < 1;
        const t = goingForward ? raw : 2 - raw;
        const x = THREE.MathUtils.lerp(npc.startPos.x, npc.endPos.x, t);
        const z = THREE.MathUtils.lerp(npc.startPos.z, npc.endPos.z, t);
        const dx = goingForward ? npc.endPos.x - npc.startPos.x : npc.startPos.x - npc.endPos.x;
        const dz = goingForward ? npc.endPos.z - npc.startPos.z : npc.startPos.z - npc.endPos.z;
        const stride = Math.sin(elapsed * 7.5 + npc.phase) * 0.55;
        npc.group.position.set(x, npc.startPos.y + Math.abs(Math.sin(elapsed * 7.5 + npc.phase)) * 0.06, z);
        npc.group.rotation.y = Math.atan2(dx, dz);
        npc.leftLeg.rotation.x = stride;
        npc.rightLeg.rotation.x = -stride;
        npc.leftArm.rotation.x = -stride * 0.7;
        npc.rightArm.rotation.x = stride * 0.7;
      } else {
        // Gentle friendly wave / idle bobbing
        npc.group.position.y = npc.startPos.y + Math.sin(elapsed * 2.4 + npc.phase) * 0.03;
        npc.rightArm.rotation.z = -2.1 + Math.sin(elapsed * 5.2 + npc.phase) * 0.25;
        npc.leftArm.rotation.x = Math.sin(elapsed * 2.0 + npc.phase) * 0.08;
      }
    }

    // Move Bosphorus ferries
    for (const f of ferries) {
      f.angle += dt * f.speed * f.direction;
      const x = Math.cos(f.angle) * f.orbitRadiusX;
      const z = Math.sin(f.angle) * f.orbitRadiusZ;
      const nx = Math.cos(f.angle + 0.05 * f.direction) * f.orbitRadiusX;
      const nz = Math.sin(f.angle + 0.05 * f.direction) * f.orbitRadiusZ;
      f.group.position.set(x, -2.15 + Math.sin(elapsed * 2.2 + f.angle) * 0.05, z);
      f.group.rotation.y = Math.atan2(-(nz - z), nx - x);
    }

    // Flap & glide seagulls
    for (const bird of seagulls) {
      bird.angle += dt * bird.speed;
      const x = Math.cos(bird.angle) * bird.radius;
      const z = Math.sin(bird.angle) * bird.radius * 0.88;
      const y = bird.height + Math.sin(elapsed * 1.8 + bird.flapPhase) * 0.55;
      bird.group.position.set(x, y, z);
      bird.group.rotation.y = -bird.angle;
      const flap = Math.sin(elapsed * 6.5 + bird.flapPhase) * 0.45;
      bird.leftWing.rotation.z = flap;
      bird.rightWing.rotation.z = -flap;
    }

    // Orbiting Champion Propeller Airplane + Fluttering Sky Banner!
    if (airplane.active) {
      // Decrease angle so on the front/center arc the plane flies left-to-right broadside to the camera
      airplane.angle -= dt * 0.28;
      const rx = 12.2;
      const rz = 10.2;
      const x = Math.cos(airplane.angle) * rx;
      const z = Math.sin(airplane.angle) * rz;
      const nx = Math.cos(airplane.angle - 0.05) * rx;
      const nz = Math.sin(airplane.angle - 0.05) * rz;
      const y = 8.4 + Math.sin(elapsed * 1.5) * 0.45;

      airplane.group.position.set(x, y, z);
      // Point +X nose along flight tangent (banner +Z face points cleanly toward viewer on hero arc!)
      airplane.group.rotation.y = Math.atan2(-(nz - z), nx - x);
      airplane.group.rotation.x = -0.08;
      airplane.propeller.rotation.x += dt * 34;

      // Flutter banner cloth wave along X (stronger toward trailing tail end)
      const bp = airplane.bannerMesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < bp.count; i++) {
        const bx = bp.getX(i); // -5.7 .. +5.7 (right edge +5.7 is near crossbar, left -5.7 is trailing tail)
        const distFromBar = Math.max(0, 5.7 - bx);
        const amp = (distFromBar / 11.4) * 0.55;
        const ripple = Math.sin(elapsed * 7.8 + bx * 0.72) * amp;
        bp.setZ(i, airplane.bannerBaseZ[i] + ripple);
      }
      bp.needsUpdate = true;
    }

    fireworks.update(dt);
  };

  return {
    group,
    waterMesh,
    waterBaseY,
    cars,
    npcs,
    ferries,
    seagulls,
    airplane,
    fireworks,
    activateChampionPlane,
    hideChampionPlane,
    update,
  };
}
