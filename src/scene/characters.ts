import * as THREE from 'three';
import { CharacterAvatarId } from '../game/types';
import {
  CharacterAnimMode,
  CharacterExpression,
  CharacterReactionMode,
  getExpressionForAnimMode,
  getFacialExpressionPose,
} from './characterExpressions';

export type { CharacterAnimMode, CharacterExpression, CharacterReactionMode };

/**
 * Articulated Stylized 3D Storybook Mascots:
 * 1. 'etken'   -> Benzetme: Cesur Aslan Maskotu ("Aslan gibi cesur!")
 * 2. 'edilgen' -> Kişileştirme: Neşeli Bulut Maskotu ("Gülümseyen canlı bulut!")
 * 3. 'donuslu' -> Söz Ustası: Bilge Baykuş Maskotu ("Söz sanatlarının bilge rehberi!")
 *
 * Articulated hip/shoulder pivots and a full 3D facial rig drive running stride,
 * joyful smiling celebration ('celebrate'), sad downturn ('sad'), startled surprise ('surprised'),
 * calm jail waiting ('jail'), and periodic natural eye blinking ('idle').
 */

export interface CharacterFaceRig {
  leftEyeGroup: THREE.Group;
  rightEyeGroup: THREE.Group;
  leftPupil: THREE.Mesh;
  rightPupil: THREE.Mesh;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  leftBlush: THREE.Mesh;
  rightBlush: THREE.Mesh;
  blushMat: THREE.MeshStandardMaterial;
  baseBlushOpacity: number;
  baseBrowY: number;
  basePupilY: number;
  mouthNeutral: THREE.Group;
  mouthSmile: THREE.Group;
  mouthSad: THREE.Group;
  mouthSurprised: THREE.Group;
}

export interface CharacterFigurine3D {
  teamId: number;
  characterId: CharacterAvatarId;
  group: THREE.Group;
  bodyRoot: THREE.Group;
  headGroup: THREE.Group;
  face: CharacterFaceRig;
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
): CharacterFaceRig {
  const zOffset = options.zOffset ?? 0.34;
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.14 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const browMat = new THREE.MeshStandardMaterial({ color: options.browColor, roughness: 0.55 });
  const baseBlushOpacity = options.isGirl ? 0.52 : 0.22;
  const blushMat = new THREE.MeshStandardMaterial({
    color: options.isGirl ? 0xf68c8c : 0xe98c7c,
    roughness: 0.72,
    transparent: true,
    opacity: baseBlushOpacity,
  });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xa63442, roughness: 0.45 });
  const sadLipMat = new THREE.MeshStandardMaterial({ color: 0x6b2f3b, roughness: 0.55 });
  const mouthCavityMat = new THREE.MeshStandardMaterial({
    color: 0x5c1422,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });
  const teethMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const tongueMat = new THREE.MeshStandardMaterial({
    color: 0xe85d75,
    roughness: 0.45,
    side: THREE.DoubleSide,
  });

  const baseBrowY = 0.135;
  const basePupilY = 0;

  const buildEye = (sx: number) => {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(sx, 0.025, zOffset);
    headGroup.add(eyeGroup);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.074, 12, 10), eyeWhiteMat);
    sclera.scale.set(1, 1.12, 0.52);
    eyeGroup.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), pupilMat);
    pupil.position.set(0, basePupilY, 0.026);
    pupil.scale.set(1, 1.1, 0.5);
    eyeGroup.add(pupil);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), glintMat);
    glint.position.set(0.016, 0.018, 0.024);
    pupil.add(glint);

    return { eyeGroup, pupil };
  };

  const leftEye = buildEye(-0.132);
  const rightEye = buildEye(0.132);

  const browGeom = new THREE.BoxGeometry(0.128, 0.028, 0.032);
  const leftBrow = new THREE.Mesh(browGeom, browMat);
  leftBrow.position.set(-0.132, baseBrowY, zOffset + 0.018);
  leftBrow.rotation.z = 0.08;
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeom, browMat);
  rightBrow.position.set(0.132, baseBrowY, zOffset + 0.018);
  rightBrow.rotation.z = -0.08;
  headGroup.add(rightBrow);

  const blushGeom = new THREE.SphereGeometry(0.056, 8, 8);
  const leftBlush = new THREE.Mesh(blushGeom, blushMat);
  leftBlush.position.set(-0.215, -0.068, zOffset - 0.025);
  leftBlush.scale.set(1.2, 0.65, 0.35);
  headGroup.add(leftBlush);

  const rightBlush = new THREE.Mesh(blushGeom, blushMat);
  rightBlush.position.set(0.215, -0.068, zOffset - 0.025);
  rightBlush.scale.set(1.2, 0.65, 0.35);
  headGroup.add(rightBlush);

  // 1) Neutral mouth: soft friendly resting smile curve
  const mouthNeutral = new THREE.Group();
  mouthNeutral.position.set(0, -0.095, zOffset + 0.02);
  const neutralArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.056, 0.014, 8, 16, Math.PI * 0.72),
    lipMat
  );
  neutralArc.rotation.z = Math.PI * 1.14;
  mouthNeutral.add(neutralArc);
  headGroup.add(mouthNeutral);

  // 2) Smile (gülümseme): wide joyful open D-smile with teeth, tongue & coral rim
  const mouthSmile = new THREE.Group();
  mouthSmile.position.set(0, -0.092, zOffset + 0.024);
  const smileCavity = new THREE.Mesh(
    new THREE.CircleGeometry(0.092, 18, Math.PI, Math.PI),
    mouthCavityMat
  );
  mouthSmile.add(smileCavity);

  const smileTeeth = new THREE.Mesh(new THREE.BoxGeometry(0.156, 0.028, 0.018), teethMat);
  smileTeeth.position.set(0, -0.014, 0.008);
  mouthSmile.add(smileTeeth);

  const smileTongue = new THREE.Mesh(
    new THREE.CircleGeometry(0.048, 14, 0, Math.PI),
    tongueMat
  );
  smileTongue.position.set(0, -0.088, 0.006);
  mouthSmile.add(smileTongue);

  const smileRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.092, 0.015, 8, 18, Math.PI),
    lipMat
  );
  smileRim.rotation.z = Math.PI;
  smileRim.position.z = 0.005;
  mouthSmile.add(smileRim);
  mouthSmile.visible = false;
  headGroup.add(mouthSmile);

  // 3) Sad (üzülme): pronounced downward-curving frown arc
  const mouthSad = new THREE.Group();
  mouthSad.position.set(0, -0.165, zOffset + 0.024);
  const sadArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.076, 0.02, 8, 18, Math.PI * 0.82),
    sadLipMat
  );
  sadArc.rotation.z = Math.PI * 0.09;
  mouthSad.add(sadArc);
  mouthSad.visible = false;
  headGroup.add(mouthSad);

  // 4) Surprised (şaşırma): open round 'O' gasp mouth
  const mouthSurprised = new THREE.Group();
  mouthSurprised.position.set(0, -0.125, zOffset + 0.026);
  const oCavity = new THREE.Mesh(new THREE.CircleGeometry(0.058, 16), mouthCavityMat);
  mouthSurprised.add(oCavity);
  const oLip = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.018, 10, 20), lipMat);
  oLip.position.z = 0.004;
  mouthSurprised.add(oLip);
  mouthSurprised.visible = false;
  headGroup.add(mouthSurprised);

  return {
    leftEyeGroup: leftEye.eyeGroup,
    rightEyeGroup: rightEye.eyeGroup,
    leftPupil: leftEye.pupil,
    rightPupil: rightEye.pupil,
    leftBrow,
    rightBrow,
    leftBlush,
    rightBlush,
    blushMat,
    baseBlushOpacity,
    baseBrowY,
    basePupilY,
    mouthNeutral,
    mouthSmile,
    mouthSad,
    mouthSurprised,
  };
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

  const isLion = characterId === 'etken';
  const isCloud = characterId === 'edilgen';
  const sneakerMat = new THREE.MeshStandardMaterial({ color: 0xf8f8f6, roughness: 0.38 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0x35424f, roughness: 0.65 });

  const bodyRoot = new THREE.Group();
  bodyRoot.position.y = 0.11;
  root.add(bodyRoot);

  const legMat = new THREE.MeshStandardMaterial({
    color: isLion ? 0xf2b94e : isCloud ? 0x2563eb : 0xe69524,
    roughness: isLion ? 0.66 : isCloud ? 0.56 : 0.48,
  });

  const buildLegPivot = (xPos: number): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(xPos, 0.56, 0);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.44, 10), legMat);
    leg.position.y = -0.22;
    leg.castShadow = true;
    pivot.add(leg);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.29), sneakerMat);
    shoe.position.set(0, -0.47, 0.04);
    shoe.castShadow = true;
    pivot.add(shoe);

    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.042, 0.22), accentMat);
    stripe.position.set(0, -0.47, 0.04);
    pivot.add(stripe);

    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.31), soleMat);
    sole.position.set(0, -0.54, 0.04);
    pivot.add(sole);

    bodyRoot.add(pivot);
    return pivot;
  };

  const leftLegPivot = buildLegPivot(-0.145);
  const rightLegPivot = buildLegPivot(0.145);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.29, 1.03, 0);
  bodyRoot.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.29, 1.03, 0);
  bodyRoot.add(rightArmPivot);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.49, 0);
  bodyRoot.add(headGroup);

  let face: CharacterFaceRig;

  if (isLion) {
    // BENZETME ('etken'): Cesur Aslan Maskotu ("Aslan gibi cesur!")
    const furMat = new THREE.MeshStandardMaterial({ color: 0xf8c96b, roughness: 0.64 });
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xfff1d6, roughness: 0.68 });
    const manePrimaryMat = new THREE.MeshStandardMaterial({ color: 0xd96b1f, roughness: 0.72 });
    const maneDeepMat = new THREE.MeshStandardMaterial({ color: 0xc25412, roughness: 0.76 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xffd7b5, roughness: 0.6 });
    const noseMat = new THREE.MeshStandardMaterial({ color: 0x5c2e16, roughness: 0.32 });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xf6c945,
      roughness: 0.26,
      metalness: 0.55,
    });

    // Head sphere + soft cream muzzle accent + cute dark button nose
    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.39, 18, 16), furMat);
    headSphere.scale.set(1.04, 0.96, 0.96);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    const muzzlePad = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), creamMat);
    muzzlePad.position.set(0, -0.085, 0.295);
    muzzlePad.scale.set(1.22, 0.86, 0.52);
    headGroup.add(muzzlePad);

    const lionNose = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), noseMat);
    lionNose.position.set(0, -0.042, 0.378);
    lionNose.scale.set(1.28, 0.85, 0.75);
    headGroup.add(lionNose);

    face = addFaceDetails(headGroup, {
      zOffset: 0.352,
      browColor: 0x7c3410,
      isGirl: true,
    });

    // Fluffy radial sunburst lion mane (12 alternating tufts + 3 back crown puffs)
    const maneCount = 12;
    for (let i = 0; i < maneCount; i++) {
      const angle = (i / maneCount) * Math.PI * 2;
      const radius = i % 2 === 0 ? 0.43 : 0.41;
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(i % 2 === 0 ? 0.165 : 0.15, 10, 10),
        i % 2 === 0 ? manePrimaryMat : maneDeepMat
      );
      puff.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.95, -0.06);
      puff.scale.set(1.0, 1.0, 0.92);
      puff.castShadow = true;
      headGroup.add(puff);
    }

    const backManePuffs: [number, number, number, number][] = [
      [0, 0.08, -0.32, 0.28],
      [-0.22, -0.1, -0.26, 0.22],
      [0.22, -0.1, -0.26, 0.22],
    ];
    for (const [mx, my, mz, mr] of backManePuffs) {
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(mr, 10, 10), manePrimaryMat);
      tuft.position.set(mx, my, mz);
      tuft.castShadow = true;
      headGroup.add(tuft);
    }

    // Round lion ears peeking out of the mane
    for (const sx of [-1, 1]) {
      const earOuter = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), furMat);
      earOuter.position.set(sx * 0.31, 0.34, 0.04);
      earOuter.scale.set(1, 1, 0.55);
      earOuter.castShadow = true;
      headGroup.add(earOuter);

      const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), earInnerMat);
      earInner.position.set(sx * 0.31, 0.34, 0.085);
      earInner.scale.set(1, 1, 0.4);
      headGroup.add(earInner);
    }

    // Plush torso + cream belly + team-colored explorer vest & gold scarf buckle
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.58, 16), furMat);
    torso.position.y = 0.84;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), creamMat);
    belly.position.set(0, 0.81, 0.14);
    belly.scale.set(0.88, 1.12, 0.65);
    bodyRoot.add(belly);

    const vestLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.34), accentMat);
    vestLeft.position.set(-0.2, 0.84, -0.02);
    vestLeft.castShadow = true;
    bodyRoot.add(vestLeft);

    const vestRight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.34), accentMat);
    vestRight.position.set(0.2, 0.84, -0.02);
    vestRight.castShadow = true;
    bodyRoot.add(vestRight);

    const vestBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.14), accentMat);
    vestBack.position.set(0, 0.84, -0.2);
    vestBack.castShadow = true;
    bodyRoot.add(vestBack);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.3, 0.08, 16), maneDeepMat);
    belt.position.y = 0.63;
    bodyRoot.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.06), brassMat);
    buckle.position.set(0, 0.63, 0.285);
    bodyRoot.add(buckle);

    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.055, 8, 16), accentMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.1;
    bodyRoot.add(scarf);

    // Sculpted curved lion tail with fluffy amber tip
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.62, -0.25),
      new THREE.Vector3(0.08, 0.58, -0.46),
      new THREE.Vector3(0.14, 0.78, -0.58),
      new THREE.Vector3(0.06, 0.94, -0.56),
    ]);
    const tailShaft = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 14, 0.042, 8, false), furMat);
    tailShaft.castShadow = true;
    bodyRoot.add(tailShaft);

    const tailTuft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), manePrimaryMat);
    tailTuft.position.set(0.06, 0.96, -0.56);
    tailTuft.scale.set(0.95, 1.28, 0.95);
    tailTuft.castShadow = true;
    bodyRoot.add(tailTuft);

    // Articulated lion arms & soft paws
    for (const [pivot, dir] of [
      [leftArmPivot, -1],
      [rightArmPivot, 1],
    ] as const) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.072, 0.4, 10), furMat);
      arm.position.set(dir * 0.03, -0.18, 0.02);
      arm.castShadow = true;
      pivot.add(arm);

      const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.08, 0.07, 10), accentMat);
      cuff.position.set(dir * 0.03, -0.33, 0.02);
      pivot.add(cuff);

      const paw = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), creamMat);
      paw.position.set(dir * 0.03, -0.4, 0.04);
      paw.castShadow = true;
      pivot.add(paw);
    }
  } else if (isCloud) {
    // KİŞİLEŞTİRME ('edilgen'): Neşeli Bulut Maskotu ("Gülümseyen canlı bulut!")
    const cloudWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf7fbff,
      roughness: 0.48,
      emissive: 0xdbeeff,
      emissiveIntensity: 0.14,
    });
    const cloudSoftBlueMat = new THREE.MeshStandardMaterial({
      color: 0xd4ecff,
      roughness: 0.52,
    });
    const tunicMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.54 });
    const starGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffca28,
      roughness: 0.24,
      metalness: 0.42,
      emissive: 0xffb300,
      emissiveIntensity: 0.18,
    });

    // Main plush cloud face core
    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 16), cloudWhiteMat);
    headSphere.scale.set(1.08, 0.94, 0.96);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    face = addFaceDetails(headGroup, {
      zOffset: 0.362,
      browColor: 0x1d4ed8,
      isGirl: true,
    });

    // Multi-puff 3D cloud silhouette framing the head (front face remains completely open!)
    const cloudPuffs: [number, number, number, number, boolean][] = [
      [-0.36, 0.02, -0.02, 0.24, false],
      [0.36, 0.02, -0.02, 0.24, false],
      [-0.26, 0.27, -0.04, 0.23, false],
      [0.26, 0.27, -0.04, 0.23, false],
      [0, 0.35, -0.04, 0.25, false],
      [-0.24, -0.18, -0.08, 0.2, true],
      [0.24, -0.18, -0.08, 0.2, true],
      [0, 0.12, -0.32, 0.3, true],
      [-0.24, 0.02, -0.26, 0.24, false],
      [0.24, 0.02, -0.26, 0.24, false],
    ];
    for (const [cx, cy, cz, cr, isBlue] of cloudPuffs) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(cr, 12, 10),
        isBlue ? cloudSoftBlueMat : cloudWhiteMat
      );
      puff.position.set(cx, cy, cz);
      puff.castShadow = true;
      headGroup.add(puff);
    }

    // Extruded 5-pointed golden star charm perched cheerfully on top right of the cloud
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? 0.13 : 0.056;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const sx = Math.cos(a) * rad;
      const sy = Math.sin(a) * rad;
      if (i === 0) starShape.moveTo(sx, sy);
      else starShape.lineTo(sx, sy);
    }
    starShape.closePath();
    const starGeom = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.012,
      bevelSegments: 2,
    });
    starGeom.center();
    const starMesh = new THREE.Mesh(starGeom, starGoldMat);
    starMesh.position.set(0.28, 0.48, 0.08);
    starMesh.rotation.z = -0.22;
    starMesh.castShadow = true;
    headGroup.add(starMesh);

    // Miniature 3-band rainbow arch perched on the top-left cloud puff
    const rainbowBands: [number, number][] = [
      [0.16, 0xff5a7a],
      [0.13, 0xffd166],
      [0.1, 0x38bdf8],
    ];
    for (const [rad, hex] of rainbowBands) {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(rad, 0.018, 8, 16, Math.PI),
        new THREE.MeshStandardMaterial({ color: hex, roughness: 0.35 })
      );
      arc.position.set(-0.27, 0.37, 0.07);
      arc.rotation.z = 0.35;
      headGroup.add(arc);
    }

    // Sky-blue tunic + cloud-puff collar + team-colored adventurer cape + belt
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 0.56, 16), tunicMat);
    torso.position.y = 0.84;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const cape = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.08), accentMat);
    cape.position.set(0, 0.82, -0.26);
    cape.rotation.x = 0.14;
    cape.castShadow = true;
    bodyRoot.add(cape);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.06, 8, 16), cloudWhiteMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 1.1;
    bodyRoot.add(collar);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.3, 0.075, 16), accentMat);
    belt.position.y = 0.64;
    bodyRoot.add(belt);

    const chestStar = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), starGoldMat);
    chestStar.position.set(0, 0.88, 0.255);
    chestStar.scale.set(1, 1, 0.45);
    bodyRoot.add(chestStar);

    // Sky-blue arms with fluffy cloud mittens
    for (const [pivot, dir] of [
      [leftArmPivot, -1],
      [rightArmPivot, 1],
    ] as const) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.072, 0.4, 10), tunicMat);
      arm.position.set(dir * 0.03, -0.18, 0.02);
      arm.castShadow = true;
      pivot.add(arm);

      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.026, 8, 12), accentMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.set(dir * 0.03, -0.34, 0.02);
      pivot.add(cuff);

      const mitten = new THREE.Mesh(new THREE.SphereGeometry(0.088, 10, 8), cloudWhiteMat);
      mitten.position.set(dir * 0.03, -0.4, 0.04);
      mitten.castShadow = true;
      pivot.add(mitten);
    }
  } else {
    // SÖZ USTASI ('donuslu'): Bilge Baykuş Maskotu ("Söz sanatlarının bilge rehberi!")
    const featherTealMat = new THREE.MeshStandardMaterial({ color: 0x168a73, roughness: 0.66 });
    const featherDeepMat = new THREE.MeshStandardMaterial({ color: 0x0e5c4e, roughness: 0.72 });
    const creamFeatherMat = new THREE.MeshStandardMaterial({ color: 0xf5fbf7, roughness: 0.64 });
    const mintFeatherMat = new THREE.MeshStandardMaterial({ color: 0xc8eee2, roughness: 0.62 });
    const beakMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.32,
      metalness: 0.14,
    });
    const goldMetalMat = new THREE.MeshStandardMaterial({
      color: 0xf6c945,
      roughness: 0.22,
      metalness: 0.68,
    });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x4c2882, roughness: 0.58 });

    // Plush rounded owl head
    const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 16), featherTealMat);
    headSphere.scale.set(1.06, 0.96, 0.96);
    headSphere.castShadow = true;
    headGroup.add(headSphere);

    // Heart-shaped bright cream facial disc framing the eyes & dynamic mouth cleanly
    for (const sx of [-1, 1]) {
      const disc = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), creamFeatherMat);
      disc.position.set(sx * 0.115, 0.015, 0.245);
      disc.scale.set(1.02, 1.08, 0.52);
      headGroup.add(disc);
    }
    const lowerDisc = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), creamFeatherMat);
    lowerDisc.position.set(0, -0.1, 0.255);
    lowerDisc.scale.set(1.18, 0.82, 0.52);
    headGroup.add(lowerDisc);

    // Full dynamic 3D facial rig (smile, sad, surprised, blink)
    face = addFaceDetails(headGroup, {
      zOffset: 0.354,
      browColor: 0x0d4f45,
      isGirl: true,
    });

    // Cute sculpted amber beak nestled cleanly between eyes and dynamic mouth
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.095, 6), beakMat);
    beak.position.set(0, -0.04, 0.382);
    beak.rotation.x = Math.PI * 0.62;
    beak.castShadow = true;
    headGroup.add(beak);

    // Brushed-gold round scholar spectacles framing the eyes
    for (const sx of [-1, 1]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.014, 8, 20), goldMetalMat);
      rim.position.set(sx * 0.132, 0.025, 0.39);
      headGroup.add(rim);
    }
    const glassesBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), goldMetalMat);
    glassesBridge.rotation.z = Math.PI / 2;
    glassesBridge.position.set(0, 0.032, 0.39);
    headGroup.add(glassesBridge);

    // Swept feathered owl ear tufts (outer deep teal + inner mint feather)
    for (const sx of [-1, 1]) {
      const earOuter = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.27, 8), featherDeepMat);
      earOuter.position.set(sx * 0.31, 0.36, 0.02);
      earOuter.rotation.z = -sx * 0.48;
      earOuter.castShadow = true;
      headGroup.add(earOuter);

      const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.18, 6), mintFeatherMat);
      earInner.position.set(sx * 0.295, 0.355, 0.065);
      earInner.rotation.z = -sx * 0.48;
      headGroup.add(earInner);
    }

    // Mini royal-purple scholar cap + golden tassel at crown
    const capBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.1, 16), capMat);
    capBase.position.set(0, 0.375, -0.02);
    capBase.castShadow = true;
    headGroup.add(capBase);

    const capBoard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.42), capMat);
    capBoard.position.set(0, 0.445, -0.02);
    capBoard.rotation.y = Math.PI / 4;
    capBoard.castShadow = true;
    headGroup.add(capBoard);

    const capButton = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), goldMetalMat);
    capButton.position.set(0, 0.475, -0.02);
    headGroup.add(capButton);

    const tasselCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.47, -0.02),
      new THREE.Vector3(0.18, 0.45, 0.04),
      new THREE.Vector3(0.24, 0.34, 0.08),
    ]);
    const tasselCord = new THREE.Mesh(new THREE.TubeGeometry(tasselCurve, 10, 0.014, 6, false), goldMetalMat);
    headGroup.add(tasselCord);

    const tasselDrop = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.08, 8), goldMetalMat);
    tasselDrop.position.set(0.24, 0.3, 0.08);
    headGroup.add(tasselDrop);

    // Feathered owl torso + scalloped cream belly + team-colored sash & scarf
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.58, 16), featherTealMat);
    torso.position.y = 0.84;
    torso.castShadow = true;
    bodyRoot.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 12), creamFeatherMat);
    belly.position.set(0, 0.81, 0.145);
    belly.scale.set(0.92, 1.12, 0.62);
    bodyRoot.add(belly);

    // Little mint feather scallops across belly
    const bellySpots: [number, number][] = [
      [-0.08, 0.9],
      [0.08, 0.9],
      [0, 0.8],
      [-0.08, 0.71],
      [0.08, 0.71],
    ];
    for (const [bx, by] of bellySpots) {
      const spot = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), mintFeatherMat);
      spot.position.set(bx, by, 0.275);
      spot.scale.set(1.25, 0.62, 0.3);
      bodyRoot.add(spot);
    }

    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.058, 8, 16), accentMat);
    scarf.rotation.x = Math.PI / 2;
    scarf.position.y = 1.1;
    bodyRoot.add(scarf);

    const teamCape = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.08), accentMat);
    teamCape.position.set(0, 0.84, -0.25);
    teamCape.rotation.x = 0.12;
    teamCape.castShadow = true;
    bodyRoot.add(teamCape);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.31, 0.075, 16), accentMat);
    belt.position.y = 0.63;
    bodyRoot.add(belt);

    const beltMedallion = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12), goldMetalMat);
    beltMedallion.rotation.x = Math.PI / 2;
    beltMedallion.position.set(0, 0.63, 0.295);
    bodyRoot.add(beltMedallion);

    // Fanned 3-feather owl tail at back
    for (const angle of [-0.28, 0, 0.28]) {
      const tailBlade = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.26, 0.04), featherDeepMat);
      tailBlade.position.set(Math.sin(angle) * 0.14, 0.64, -0.34);
      tailBlade.rotation.x = 0.55;
      tailBlade.rotation.z = -angle;
      tailBlade.castShadow = true;
      bodyRoot.add(tailBlade);
    }

    // Articulated feathered owl wings mounted to arm pivots
    for (const [pivot, dir] of [
      [leftArmPivot, -1],
      [rightArmPivot, 1],
    ] as const) {
      const upperWing = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), featherTealMat);
      upperWing.position.set(dir * 0.045, -0.18, 0.01);
      upperWing.scale.set(0.68, 1.75, 1.05);
      upperWing.castShadow = true;
      pivot.add(upperWing);

      const wingStripe = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.1, 0.17), accentMat);
      wingStripe.position.set(dir * 0.055, -0.26, 0.01);
      pivot.add(wingStripe);

      const wingTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), featherDeepMat);
      wingTip.position.set(dir * 0.045, -0.37, 0.02);
      wingTip.scale.set(0.65, 1.25, 0.92);
      wingTip.castShadow = true;
      pivot.add(wingTip);
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
    face,
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
 * Drive articulated limb + dynamic 3D facial expression animations
 * (gülümseme / üzülme / şaşırma / doğal göz kırpma).
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
    fig.headGroup.rotation.z = 0;
  } else if (mode === 'celebrate') {
    const hop = Math.abs(Math.sin(phase * 10)) * 0.36;
    fig.bodyRoot.position.y = 0.11 + hop;
    fig.bodyRoot.rotation.x = -0.05;
    fig.leftLegPivot.rotation.x = Math.sin(phase * 10) * 0.24;
    fig.rightLegPivot.rotation.x = -Math.sin(phase * 10) * 0.24;
    fig.leftArmPivot.rotation.x = -2.35 + Math.sin(phase * 14) * 0.22;
    fig.rightArmPivot.rotation.x = -2.35 - Math.sin(phase * 14) * 0.22;
    fig.leftArmPivot.rotation.z = -0.34;
    fig.rightArmPivot.rotation.z = 0.34;
    fig.headGroup.rotation.y = Math.sin(phase * 7) * 0.14;
    fig.headGroup.rotation.x = -0.08;
    fig.headGroup.rotation.z = Math.sin(phase * 7) * 0.06;
  } else if (mode === 'surprised') {
    const startleHop = Math.abs(Math.sin(phase * 8.5)) * 0.22;
    fig.bodyRoot.position.y = 0.11 + startleHop;
    fig.bodyRoot.rotation.x = -0.08;
    fig.leftLegPivot.rotation.x = 0;
    fig.rightLegPivot.rotation.x = 0;
    fig.leftArmPivot.rotation.x = -1.65 + Math.sin(phase * 12) * 0.12;
    fig.rightArmPivot.rotation.x = -1.65 - Math.sin(phase * 12) * 0.12;
    fig.leftArmPivot.rotation.z = 0.24;
    fig.rightArmPivot.rotation.z = -0.24;
    fig.headGroup.rotation.y = Math.sin(phase * 5.5) * 0.1;
    fig.headGroup.rotation.x = -0.12;
    fig.headGroup.rotation.z = Math.sin(phase * 6.5) * 0.07;
  } else if (mode === 'sad') {
    fig.bodyRoot.position.y = 0.07;
    fig.bodyRoot.rotation.x = 0.14;
    fig.leftLegPivot.rotation.x = 0;
    fig.rightLegPivot.rotation.x = 0;
    fig.leftArmPivot.rotation.x = 0.18;
    fig.rightArmPivot.rotation.x = 0.18;
    fig.leftArmPivot.rotation.z = -0.05;
    fig.rightArmPivot.rotation.z = 0.05;
    fig.headGroup.rotation.y = Math.sin(phase * 9) * 0.24;
    fig.headGroup.rotation.x = 0.2;
    fig.headGroup.rotation.z = Math.sin(phase * 4.5) * 0.05;
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
    fig.headGroup.rotation.z = 0;
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
    fig.headGroup.rotation.z = 0;
  }

  // Apply dynamic 3D facial expression pose (eyes, pupils, brows, cheeks, sculpted mouth)
  const expression = getExpressionForAnimMode(mode);
  const pose = getFacialExpressionPose(expression, phase + fig.teamId * 1.1);
  const f = fig.face;

  f.leftEyeGroup.scale.set(pose.eyeScaleX, pose.eyeScaleY, 1);
  f.rightEyeGroup.scale.set(pose.eyeScaleX, pose.eyeScaleY, 1);

  f.leftPupil.scale.set(pose.pupilScale, pose.pupilScale * 1.1, 0.5);
  f.rightPupil.scale.set(pose.pupilScale, pose.pupilScale * 1.1, 0.5);
  f.leftPupil.position.y = f.basePupilY + pose.pupilOffsetY;
  f.rightPupil.position.y = f.basePupilY + pose.pupilOffsetY;

  f.leftBrow.position.y = f.baseBrowY + pose.browOffsetY;
  f.rightBrow.position.y = f.baseBrowY + pose.browOffsetY;
  f.leftBrow.rotation.z = pose.leftBrowRotZ;
  f.rightBrow.rotation.z = pose.rightBrowRotZ;

  f.leftBlush.scale.set(1.2 * pose.blushScale, 0.65 * pose.blushScale, 0.35);
  f.rightBlush.scale.set(1.2 * pose.blushScale, 0.65 * pose.blushScale, 0.35);
  f.blushMat.opacity =
    expression === 'neutral' ? f.baseBlushOpacity : Math.min(0.95, pose.blushOpacity);

  f.mouthNeutral.visible = pose.mouthShape === 'neutral';
  f.mouthSmile.visible = pose.mouthShape === 'smile';
  f.mouthSad.visible = pose.mouthShape === 'sad';
  f.mouthSurprised.visible = pose.mouthShape === 'surprised';

  const activeMouth =
    pose.mouthShape === 'smile'
      ? f.mouthSmile
      : pose.mouthShape === 'sad'
        ? f.mouthSad
        : pose.mouthShape === 'surprised'
          ? f.mouthSurprised
          : f.mouthNeutral;
  activeMouth.scale.set(pose.mouthScaleX, pose.mouthScaleY, 1);
}
