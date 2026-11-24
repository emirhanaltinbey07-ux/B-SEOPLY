import * as THREE from 'three';
import { CharacterAvatarId } from '../game/types';

/**
 * Articulated Stylized 3D Student Characters:
 * 1. 'etken'   -> Etken: Kız öğrenci, turuncu saçlı, beyaz tenli (vibrant orange wavy hair + ponytail, pale ivory skin)
 * 2. 'edilgen' -> Edilgen: Erkek öğrenci, siyah kısa saçlı (short sculpted black hair, varsity jacket & trousers)
 * 3. 'donuslu' -> Dönüşlü: Kız öğrenci, siyah uzun saçlı (long flowing black hair past shoulders/back, school cardigan)
 *
 * Articulated hip/shoulder pivots allow genuine running/walking stride across board tiles,
 * arms-up victory celebration on correct answers, brief slump on wrong answers,
 * and calm waiting posture in jail.
 */

export type CharacterAnimMode = 'idle' | 'run' | 'celebrate' | 'sad' | 'jail';

export interface CharacterFigurine3D {
  teamId: number;
  characterId: CharacterAvatarId;
  group: THREE.Group;
  bodyRoot: THREE.Group;
  headGroup: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  pedestalMat: THREE.MeshStandardMaterial;
  accentMat: THREE.MeshStandardMaterial;
  nameSprite: THREE.Sprite;
  currentPos: THREE.Vector3;
}

function createTeamNameplateTexture(teamName: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(20, 42, 58, 0.9)';
  ctx.beginPath();
  ctx.roundRect(14, 18, 484, 92, 46);
  ctx.fill();

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(18, 22, 476, 84, 42);
  ctx.stroke();

  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.arc(68, 64, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const clean = teamName.length > 18 ? teamName.slice(0, 17) + '…' : teamName;
  ctx.fillText(clean, 274, 65);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function updateCharacterNameplate(
  fig: CharacterFigurine3D,
  teamName: string,
  colorHex: string
) {
  const mat = fig.nameSprite.material as THREE.SpriteMaterial;
  const oldMap = mat.map;
  mat.map = createTeamNameplateTexture(teamName, colorHex);
  mat.needsUpdate = true;
  oldMap?.dispose();
  fig.pedestalMat.color.set(colorHex);
  fig.accentMat.color.set(colorHex);
}

function addFaceDetails(
  headGroup: THREE.Group,
  options: { zOffset?: number; browColor: number; isGirl: boolean }
) {
  const zOffset = options.zOffset ?? 0.34;
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.14 });
  const browMat = new THREE.MeshStandardMaterial({ color: options.browColor, roughness: 0.6 });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: options.isGirl ? 0xf6a3a0 : 0xe9a390,
    roughness: 0.72,
  });

  for (const sx of [-0.13, 0.13]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), eyeWhiteMat);
    sclera.position.set(sx, 0.02, zOffset);
    sclera.scale.set(1, 1.12, 0.5);
    headGroup.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 8), pupilMat);
    pupil.position.set(sx, 0.02, zOffset + 0.024);
    pupil.scale.set(1, 1.1, 0.5);
    headGroup.add(pupil);

    // Subtle eyebrow
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.024, 0.025), browMat);
    brow.position.set(sx, 0.12, zOffset + 0.01);
    brow.rotation.z = sx < 0 ? 0.08 : -0.08;
    headGroup.add(brow);

    if (options.isGirl) {
      const blush = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), cheekMat);
      blush.position.set(sx * 1.65, -0.07, zOffset - 0.025);
      blush.scale.set(1.2, 0.65, 0.35);
      headGroup.add(blush);
    }
  }
}

export function createStylizedCharacterFigurine(
  teamId: number,
  characterId: CharacterAvatarId,
  teamColorHex: string,
  teamName: string,
  shadowTex: THREE.CanvasTexture
): CharacterFigurine3D {
  const root = new THREE.Group();

  const pedestalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(teamColorHex),
    roughness: 0.28,
    metalness: 0.22,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(teamColorHex),
    roughness: 0.42,
    metalness: 0.15,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.15,
  });

  const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.11, 20), pedestalMat);
  baseDisc.position.y = 0.055;
  baseDisc.castShadow = true;
  baseDisc.receiveShadow = true;
  root.add(baseDisc);

  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.032, 8, 20), rimMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.11;
  root.add(baseRing);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.68, 18),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.48,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.015;
  root.add(shadow);

  // Character-specific skin tones:
  // Etken = fair pale ivory-white skin (beyaz tenli)
  // Edilgen = warm natural skin
  // Dönüşlü = light warm skin
  const skinHex =
    characterId === 'etken' ? 0xffeae0 : characterId === 'edilgen' ? 0xf1c5a8 : 0xf6ccb4;
  const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.52 });
  const sneakerMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f6, roughness: 0.42 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0x35424f, roughness: 0.65 });

  const bodyRoot = new THREE.Group();
  bodyRoot.position.y = 0.11;
  root.add(bodyRoot);

  const isGirl = characterId !== 'edilgen';
  const legColor =
    characterId === 'etken'
      ? 0xf7f5f0 // White knee socks / tights under pleated skirt
      : characterId === 'edilgen'
        ? 0x263850 // Dark navy boy trousers
        : 0x2f3b52; // Dark leggings / jeans
  const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.66 });

  const buildLegPivot = (xPos: number): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(xPos, 0.56, 0);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.08, 0.44, 10), legMat);
    leg.position.y = -0.22;
    leg.castShadow = true;
    pivot.add(leg);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.28), sneakerMat);
    shoe.position.set(0, -0.47, 0.04);
    shoe.castShadow = true;
    pivot.add(shoe);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.22), accentMat);
    stripe.position.set(0, -0.47, 0.04);
    pivot.add(stripe);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.3), soleMat);
    sole.position.set(0, -0.54, 0.04);
    pivot.add(sole);

    bodyRoot.add(pivot);
    return pivot;
  };

  const leftLegPivot = buildLegPivot(-0.14);
  const rightLegPivot = buildLegPivot(0.14);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.26, 1.04, 0);
  bodyRoot.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.26, 1.04, 0);
  bodyRoot.add(rightArmPivot);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.48, 0);
  bodyRoot.add(headGroup);

  const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 14), skinMat);
  headSphere.scale.set(1.02, 0.96, 0.95);
  headSphere.castShadow = true;
  headGroup.add(headSphere);

  addFaceDetails(headGroup, {
    zOffset: 0.33,
    browColor: characterId === 'etken' ? 0xc45112 : 0x16181f,
    isGirl,
  });

  if (characterId === 'etken') {
    // ETKEN: Kız, turuncu saçlı, beyaz tenli
    const orangeHairMat = new THREE.MeshStandardMaterial({ color: 0xf26e1d, roughness: 0.44 });
    const orangeHighlightMat = new THREE.MeshStandardMaterial({ color: 0xf88a36, roughness: 0.42 });
    const blouseMat = new THREE.MeshStandardMaterial({ color: 0xfffaf2, roughness: 0.6 });
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0x24496e, roughness: 0.65 });
    const bookMat = new THREE.MeshStandardMaterial({ color: 0xd9483b, roughness: 0.55 });

    // Stylish student blouse + flared skirt + team cardigan sash
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.46, 14), blouseMat);
    torso.position.y = 0.88;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.34, 0.32, 16), skirtMat);
    skirt.position.y = 0.58;
    skirt.castShadow = true;
    bodyRoot.add(skirt);

    const cardiganLeft = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.26), accentMat);
    cardiganLeft.position.set(-0.17, 0.88, -0.02);
    bodyRoot.add(cardiganLeft);

    const cardiganRight = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.26), accentMat);
    cardiganRight.position.set(0.17, 0.88, -0.02);
    bodyRoot.add(cardiganRight);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.045, 8, 14), blouseMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.1;
    bodyRoot.add(collar);

    for (const [pivot, dir] of [
      [leftArmPivot, -1],
      [rightArmPivot, 1],
    ] as const) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.064, 0.4, 10), accentMat);
      arm.position.set(dir * 0.03, -0.18, 0.02);
      arm.castShadow = true;
      pivot.add(arm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.064, 10, 8), skinMat);
      hand.position.set(dir * 0.03, -0.38, 0.04);
      pivot.add(hand);
    }

    // Turkish notebook held in right hand
    const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.05), bookMat);
    notebook.position.set(0.06, -0.36, 0.14);
    notebook.rotation.y = -0.25;
    rightArmPivot.add(notebook);

    // Vibrant orange hair crown + bangs + flowing wavy side locks + back volume
    const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), orangeHairMat);
    hairCrown.position.set(0, 0.08, -0.07);
    hairCrown.castShadow = true;
    headGroup.add(hairCrown);

    const bangs = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), orangeHighlightMat);
    bangs.position.set(-0.08, 0.26, 0.24);
    bangs.scale.set(1.35, 0.55, 0.62);
    headGroup.add(bangs);

    const orangeLocks: [number, number, number, number][] = [
      [-0.36, -0.04, 0.04, 0.2],
      [0.36, -0.04, 0.04, 0.2],
      [-0.35, -0.26, -0.04, 0.18],
      [0.35, -0.26, -0.04, 0.18],
      [0, -0.24, -0.28, 0.27],
      [-0.2, -0.36, -0.24, 0.19],
      [0.2, -0.36, -0.24, 0.19],
    ];
    for (const [hx, hy, hz, hr] of orangeLocks) {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(hr, 10, 10), orangeHairMat);
      lock.position.set(hx, hy, hz);
      lock.castShadow = true;
      headGroup.add(lock);
    }

    // Cute orange side hairband ribbon
    const ribbon = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.032, 8, 18, Math.PI), accentMat);
    ribbon.position.set(0, 0.14, 0.05);
    ribbon.rotation.z = 0;
    headGroup.add(ribbon);
  } else if (characterId === 'edilgen') {
    // EDİLGEN: Erkek, siyah kısa saçlı
    const blackHairMat = new THREE.MeshStandardMaterial({ color: 0x16181f, roughness: 0.55 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x224c78, roughness: 0.58 });
    const teeMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f2, roughness: 0.65 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.6 });

    // Boy's varsity jacket over white tee + school backpack
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.56, 14), jacketMat);
    torso.position.y = 0.84;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const frontTee = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.08), teeMat);
    frontTee.position.set(0, 0.84, 0.22);
    bodyRoot.add(frontTee);

    const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.28), accentMat);
    chestStripe.position.set(0, 0.64, 0);
    bodyRoot.add(chestStripe);

    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.18), accentMat);
    backpack.position.set(0, 0.86, -0.26);
    backpack.castShadow = true;
    bodyRoot.add(backpack);

    for (const [pivot, dir] of [
      [leftArmPivot, -1],
      [rightArmPivot, 1],
    ] as const) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.42, 10), sleeveMat);
      arm.position.set(dir * 0.03, -0.18, 0.03);
      arm.castShadow = true;
      pivot.add(arm);

      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.074, 0.072, 0.07, 10), accentMat);
      cuff.position.set(dir * 0.03, -0.35, 0.03);
      pivot.add(cuff);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), skinMat);
      hand.position.set(dir * 0.03, -0.4, 0.05);
      pivot.add(hand);
    }

    // Short sculpted black hair (distinctly short male hairstyle: neat crop + subtle front quiff)
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.54),
      blackHairMat
    );
    hairCap.position.set(0, 0.04, -0.03);
    hairCap.castShadow = true;
    headGroup.add(hairCap);

    // Back short crop taper
    const backCrop = new THREE.Mesh(new THREE.SphereGeometry(0.35, 14, 10), blackHairMat);
    backCrop.position.set(0, 0.0, -0.13);
    backCrop.scale.set(0.96, 0.86, 0.72);
    headGroup.add(backCrop);

    // Neat short textured front quiff
    const quiff = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.22), blackHairMat);
    quiff.position.set(0, 0.34, 0.16);
    quiff.rotation.x = -0.22;
    headGroup.add(quiff);

    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), blackHairMat);
    tuft.position.set(0.06, 0.36, 0.21);
    tuft.scale.set(1.2, 0.65, 0.85);
    headGroup.add(tuft);
  } else {
    // DÖNÜŞLÜ: Kız, siyah uzun saçlı
    const longBlackHairMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.42 });
    const sweaterMat = new THREE.MeshStandardMaterial({ color: 0xf4ece1, roughness: 0.62 });
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0x1d5f4a, roughness: 0.64 });

    // Stylish student sweater + skirt + team scarf
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.46, 14), sweaterMat);
    torso.position.y = 0.88;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.33, 0.32, 16), skirtMat);
    skirt.position.y = 0.58;
    skirt.castShadow = true;
    bodyRoot.add(skirt);

    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.06, 8, 14), accentMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.08;
    bodyRoot.add(scarf);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.06, 14), accentMat);
    belt.position.y = 0.72;
    bodyRoot.add(belt);

    for (const [pivot, dir] of [
      [leftArmPivot, -1],
      [rightArmPivot, 1],
    ] as const) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.064, 0.4, 10), sweaterMat);
      arm.position.set(dir * 0.03, -0.18, 0.02);
      arm.castShadow = true;
      pivot.add(arm);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.064, 10, 8), skinMat);
      hand.position.set(dir * 0.03, -0.38, 0.04);
      pivot.add(hand);
    }

    // Long flowing black hair: sleek crown + long cascading back hair curtain + front shoulder drapes!
    const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.41, 16, 14), longBlackHairMat);
    hairCrown.position.set(0, 0.06, -0.05);
    hairCrown.castShadow = true;
    headGroup.add(hairCrown);

    // Side-parted forehead bangs
    const bangLeft = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8), longBlackHairMat);
    bangLeft.position.set(-0.18, 0.24, 0.23);
    bangLeft.scale.set(1.1, 0.55, 0.65);
    headGroup.add(bangLeft);

    const bangRight = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), longBlackHairMat);
    bangRight.position.set(0.18, 0.24, 0.23);
    bangRight.scale.set(1.05, 0.55, 0.65);
    headGroup.add(bangRight);

    // Long flowing back hair panel extending down past shoulders & torso
    const backCurtain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.44, 0.92, 14, 1, false, Math.PI * 0.55, Math.PI * 0.9),
      longBlackHairMat
    );
    backCurtain.position.set(0, -0.34, -0.06);
    backCurtain.castShadow = true;
    headGroup.add(backCurtain);

    const backSheet = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.88, 0.2), longBlackHairMat);
    backSheet.position.set(0, -0.36, -0.28);
    backSheet.castShadow = true;
    headGroup.add(backSheet);

    // Long front-shoulder hair drapes on left and right
    for (const sx of [-1, 1]) {
      const sideStrand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.085, 0.78, 10),
        longBlackHairMat
      );
      sideStrand.position.set(sx * 0.34, -0.28, 0.05);
      sideStrand.rotation.z = sx * 0.08;
      sideStrand.castShadow = true;
      headGroup.add(sideStrand);
    }
  }

  // Crisp floating Team Nameplate above student head
  const nameTex = createTeamNameplateTexture(teamName, teamColorHex);
  const nameSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: nameTex, transparent: true, depthTest: false })
  );
  nameSprite.position.set(0, 2.38 + (teamId % 3) * 0.26, 0);
  nameSprite.scale.set(2.05, 0.5, 1);
  nameSprite.renderOrder = 20;
  root.add(nameSprite);

  return {
    teamId,
    characterId,
    group: root,
    bodyRoot,
    headGroup,
    leftLegPivot,
    rightLegPivot,
    leftArmPivot,
    rightArmPivot,
    pedestalMat,
    accentMat,
    nameSprite,
    currentPos: new THREE.Vector3(),
  };
}

/**
 * Drive articulated limb animation for running, celebrating, sad slump, waiting in jail, or idle breathing!
 */
export function animateCharacterPose(
  fig: CharacterFigurine3D,
  mode: CharacterAnimMode,
  phase: number
) {
  if (mode === 'run') {
    const stride = Math.sin(phase * 11);
    const bounce = Math.abs(Math.sin(phase * 11)) * 0.14;
    fig.bodyRoot.position.y = 0.11 + bounce;
    fig.bodyRoot.rotation.x = 0.14;
    fig.leftLegPivot.rotation.x = stride * 0.78;
    fig.rightLegPivot.rotation.x = -stride * 0.78;
    fig.leftArmPivot.rotation.x = -stride * 0.72;
    fig.rightArmPivot.rotation.x = stride * 0.72;
    fig.leftArmPivot.rotation.z = -0.16;
    fig.rightArmPivot.rotation.z = 0.16;
    fig.headGroup.rotation.y = 0;
    fig.headGroup.rotation.x = -0.08;
  } else if (mode === 'celebrate') {
    const hop = Math.abs(Math.sin(phase * 10)) * 0.42;
    fig.bodyRoot.position.y = 0.11 + hop;
    fig.bodyRoot.rotation.x = -0.05;
    fig.leftLegPivot.rotation.x = Math.sin(phase * 10) * 0.25;
    fig.rightLegPivot.rotation.x = -Math.sin(phase * 10) * 0.25;
    fig.leftArmPivot.rotation.x = -2.4 + Math.sin(phase * 14) * 0.22;
    fig.rightArmPivot.rotation.x = -2.4 - Math.sin(phase * 14) * 0.22;
    fig.leftArmPivot.rotation.z = -0.32;
    fig.rightArmPivot.rotation.z = 0.32;
    fig.headGroup.rotation.y = Math.sin(phase * 8) * 0.15;
    fig.headGroup.rotation.x = -0.08;
  } else if (mode === 'sad') {
    fig.bodyRoot.position.y = 0.08;
    fig.bodyRoot.rotation.x = 0.14;
    fig.leftLegPivot.rotation.x = 0;
    fig.rightLegPivot.rotation.x = 0;
    fig.leftArmPivot.rotation.x = 0.18;
    fig.rightArmPivot.rotation.x = 0.18;
    fig.leftArmPivot.rotation.z = -0.05;
    fig.rightArmPivot.rotation.z = 0.05;
    fig.headGroup.rotation.y = Math.sin(phase * 12) * 0.35;
    fig.headGroup.rotation.x = 0.22;
  } else if (mode === 'jail') {
    fig.bodyRoot.position.y = 0.11;
    fig.bodyRoot.rotation.x = 0;
    fig.leftLegPivot.rotation.x = 0;
    fig.rightLegPivot.rotation.x = 0;
    fig.leftArmPivot.rotation.x = -0.35;
    fig.rightArmPivot.rotation.x = -0.35;
    fig.leftArmPivot.rotation.z = 0.28;
    fig.rightArmPivot.rotation.z = -0.28;
    fig.headGroup.rotation.y = Math.sin(phase * 1.4) * 0.2;
    fig.headGroup.rotation.x = 0.08;
  } else {
    fig.bodyRoot.position.y = 0.11 + Math.sin(phase * 2.4) * 0.025;
    fig.bodyRoot.rotation.x = 0;
    fig.leftLegPivot.rotation.x = 0;
    fig.rightLegPivot.rotation.x = 0;
    fig.leftArmPivot.rotation.x = Math.sin(phase * 2.4) * 0.06;
    fig.rightArmPivot.rotation.x = -Math.sin(phase * 2.4) * 0.06;
    fig.leftArmPivot.rotation.z = -0.12;
    fig.rightArmPivot.rotation.z = 0.12;
    fig.headGroup.rotation.y = Math.sin(phase * 1.3 + fig.teamId) * 0.14;
    fig.headGroup.rotation.x = 0;
  }
}
