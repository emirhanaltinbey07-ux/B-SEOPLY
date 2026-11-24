import * as THREE from 'three';
import { BoardTile } from '../game/types';

/**
 * Procedural CanvasTexture generators styled after Reference Image 1:
 * - Lush vibrant Monopoly-style emerald lawn center with warm sandy garden paths & bold red BİSEOPLY sign
 * - Mint-cream Monopoly perimeter stop plaques with saturated district top bars
 * - Physical orange-gold SORU KARTLARI (15 Kart) deck and emerald-teal EMLAK VE ARAÇ KARTLARI deck
 * - Upright card front faces & dice pip faces (1..6)
 */

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, 'rgba(18, 38, 22, 0.5)');
  grad.addColorStop(0.6, 'rgba(18, 38, 22, 0.22)');
  grad.addColorStop(1, 'rgba(18, 38, 22, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createStoneBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const rowH = 32;
  for (let row = 0; row < 8; row++) {
    const offset = (row % 2) * 32;
    for (let col = -1; col < 5; col++) {
      const x = col * 64 + offset;
      const y = row * rowH;
      const shade = 115 + Math.floor(Math.random() * 40);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(x + 2, y + 2, 60, rowH - 4);
      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, 62, rowH - 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

/**
 * Reference Image 1 inspired vibrant green park lawn center with sandy winding paths
 * and iconic crimson-red white-bordered BİSEOPLY banner plaque!
 */
export function createBoardCenterTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Lush Monopoly-Go style vibrant emerald-lime lawn
  const lawnGrad = ctx.createRadialGradient(512, 512, 60, 512, 512, 660);
  lawnGrad.addColorStop(0, '#7ad119');
  lawnGrad.addColorStop(0.65, '#5db310');
  lawnGrad.addColorStop(1, '#438f0a');
  ctx.fillStyle = lawnGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle mowed grass texture stripes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.055)';
  for (let i = 0; i < 1024; i += 64) {
    ctx.fillRect(i, 0, 32, 1024);
  }

  // Warm sandy golden border framing the inner lawn (like Reference Image 1)
  ctx.strokeStyle = '#cc8b2c';
  ctx.lineWidth = 34;
  ctx.strokeRect(17, 17, 990, 990);
  ctx.strokeStyle = '#f5c35e';
  ctx.lineWidth = 12;
  ctx.strokeRect(28, 28, 968, 968);

  // Winding sandy park pathway connecting top-right to bottom-left (just like Ref 1!)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#d49032';
  ctx.lineWidth = 84;
  ctx.beginPath();
  ctx.moveTo(220, 960);
  ctx.bezierCurveTo(280, 680, 720, 420, 820, 64);
  ctx.stroke();

  ctx.strokeStyle = '#f7c865';
  ctx.lineWidth = 64;
  ctx.beginPath();
  ctx.moveTo(220, 960);
  ctx.bezierCurveTo(280, 680, 720, 420, 820, 64);
  ctx.stroke();

  // Horizontal sandy pad for the central BİSEOPLY banner
  ctx.fillStyle = '#ebb452';
  ctx.beginPath();
  ctx.roundRect(145, 378, 734, 212, 24);
  ctx.fill();
  ctx.restore();

  // Scattered autumn leaves on the green lawn (charming detail from Ref 1!)
  const leaves: [number, number, string][] = [
    [180, 210, '#f57d14'],
    [225, 248, '#fab81a'],
    [820, 680, '#f57d14'],
    [775, 724, '#e65314'],
    [665, 220, '#fab81a'],
    [320, 760, '#f57d14'],
  ];
  for (const [lx, ly, col] of leaves) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 16, 8, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Iconic Bold Crimson & White Framed BİSEOPLY Center Sign (matching Ref 1!)
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(172, 404, 680, 160, 18);
  ctx.fill();

  ctx.fillStyle = '#e82814';
  ctx.beginPath();
  ctx.roundRect(186, 418, 652, 132, 12);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BİSEOPLY', 512, 474);

  ctx.fillStyle = '#ffeb99';
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('İSTANBUL SENİN · OYUN SENİN', 512, 526);
  ctx.restore();

  // Sandy deck pads for the 2 physical decks in the lower & upper-left/right park zones
  const drawPad = (x: number, y: number, w: number, h: number, label: string) => {
    ctx.fillStyle = '#d49032';
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 10, w + 20, h + 20, 16);
    ctx.fill();
    ctx.fillStyle = '#f7c96a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h + 36);
  };

  drawPad(134, 622, 260, 260, 'SORU KARTLARI');
  drawPad(630, 622, 260, 260, 'EMLAK KARTLARI');

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

/**
 * Crisp elevated 3D signboard sprite above Istanbul landmarks, BAŞLANGIÇ, and BANKA
 * so students at the back of a 1920x1080 classroom can read every landmark effortlessly!
 */
export function createFloatingSignSprite(
  title: string,
  accentHex: string,
  sublabel?: string
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 160);

  // Soft outer drop frame
  ctx.fillStyle = 'rgba(18, 36, 52, 0.92)';
  ctx.beginPath();
  ctx.roundRect(14, 18, 484, 118, 22);
  ctx.fill();

  // Crisp colored accent border & left bar
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(18, 22, 476, 110, 18);
  ctx.stroke();

  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.roundRect(22, 26, 26, 102, 10);
  ctx.fill();

  // High-contrast title
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = title.length > 18 ? 30 : title.length > 13 ? 36 : 42;
  ctx.font = `900 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(title, 268, sublabel ? 62 : 78);

  if (sublabel) {
    ctx.fillStyle = '#ffe7a6';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(sublabel.toUpperCase(), 268, 104);
  }

  // Little downward pointer triangle
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.moveTo(240, 134);
  ctx.lineTo(272, 134);
  ctx.lineTo(256, 154);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
  );
  sprite.scale.set(3.15, 0.98, 1);
  sprite.renderOrder = 15;
  return sprite;
}

export function createBoardTileTexture(
  tile: BoardTile,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  // Distinct tile paper base matching Monopoly Go readability (livelier saturation)
  const bgMap: Record<BoardTile['type'], string> = {
    start: '#ffeedb',
    location: '#d2ebd0',
    question: '#ffead1',
    reward: '#fff3c4',
    jail: '#dce3ec',
  };
  ctx.fillStyle = bgMap[tile.type];
  ctx.fillRect(0, 0, 384, 384);

  // Outer tile border
  ctx.strokeStyle = '#1b3545';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 374, 374);

  // Top saturated color band
  ctx.fillStyle = tile.accentColor;
  ctx.fillRect(10, 10, 364, 84);

  // Index circle badge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(54, 52, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#183244';
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tile.type === 'start' ? '★' : String(tile.index), 54, 53);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  const topTag =
    tile.type === 'start'
      ? 'BAŞLANGIÇ'
      : tile.type === 'question'
        ? 'SORU KARTI'
        : tile.type === 'reward'
          ? 'ÖDÜL KARESİ'
          : tile.type === 'jail'
            ? 'HAPİS · BEKLE'
            : tile.districtTag.toUpperCase();
  ctx.fillText(topTag.slice(0, 16), 90, 53);

  // Center emblem + main Turkish title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (tile.type === 'start') {
    ctx.fillStyle = '#d93829';
    ctx.font = '900 44px Georgia, serif';
    ctx.fillText('BAŞLANGIÇ', 192, 190);
    ctx.fillStyle = '#1d6f42';
    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('TUR +50 BP', 192, 256);
    ctx.fillStyle = '#d93829';
    ctx.font = '900 42px sans-serif';
    ctx.fillText('➜', 192, 322);
  } else if (tile.type === 'question') {
    ctx.fillStyle = '#f27b1a';
    ctx.font = '900 120px Georgia, serif';
    ctx.fillText('?', 192, 206);
    ctx.fillStyle = '#142a3a';
    ctx.font = '800 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SORU ÇEK', 192, 326);
  } else if (tile.type === 'reward') {
    ctx.fillStyle = '#d9910d';
    ctx.font = '900 84px Georgia, serif';
    ctx.fillText('★', 192, 186);
    ctx.fillStyle = '#156b43';
    ctx.font = '900 40px "JetBrains Mono", monospace';
    ctx.fillText('+10 BP', 192, 272);
    ctx.fillStyle = '#6c4d10';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('HEDİYE ÖDÜL', 192, 330);
  } else if (tile.type === 'jail') {
    // Stylized jail bars icon
    ctx.strokeStyle = '#3b4a59';
    ctx.lineWidth = 10;
    for (const bx of [126, 170, 214, 258]) {
      ctx.beginPath();
      ctx.moveTo(bx, 128);
      ctx.lineTo(bx, 246);
      ctx.stroke();
    }
    ctx.strokeRect(114, 128, 156, 118);
    ctx.fillStyle = '#1f2e3b';
    ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('HAPİS', 192, 288);
    ctx.fillStyle = '#b03025';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('50 BP / 1 TUR', 192, 332);
  } else {
    ctx.fillStyle = '#142a3a';
    const label = tile.shortLabel;
    if (label.length > 12) {
      const parts = label.split(' ');
      const l1 = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
      const l2 = parts.slice(Math.ceil(parts.length / 2)).join(' ');
      ctx.font = '800 36px Georgia, serif';
      ctx.fillText(l1, 192, 186);
      ctx.fillText(l2, 192, 236);
    } else {
      ctx.font = '800 42px Georgia, serif';
      ctx.fillText(label, 192, 212);
    }
    ctx.fillStyle = '#2b5842';
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('İSTANBUL DURAĞI', 192, 326);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

/**
 * Physical Card Deck Back Texture (Ref 1 vibrant orange '?' deck for SORU KARTLARI,
 * vibrant emerald-teal deck for EMLAK VE ARAÇ KARTLARI).
 */
export function createCardDeckTexture(
  titleLine1: string,
  titleLine2: string,
  subtitle: string,
  primaryHex: string,
  accentHex: string,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  // White card outer rim (classic Monopoly Go tactile deck look)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 680);

  // Saturated glossy center card fill
  const grad = ctx.createLinearGradient(0, 20, 512, 660);
  grad.addColorStop(0, primaryHex);
  grad.addColorStop(1, accentHex);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(24, 24, 464, 632, 28);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(42, 42, 428, 596, 20);
  ctx.stroke();

  // Giant bold emblem icon in upper half
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 180px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleLine1.includes('SORU') ? '?' : '★', 256, 224);

  // Clean white title banner in lower half
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.beginPath();
  ctx.roundRect(62, 365, 388, 224, 22);
  ctx.fill();

  ctx.fillStyle = '#142a3a';
  ctx.font = '800 42px Georgia, serif';
  ctx.fillText(titleLine1, 256, 434);
  if (titleLine2) {
    ctx.fillText(titleLine2, 256, 488);
  }

  ctx.fillStyle = primaryHex;
  ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, 256, 550);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export function createCardFrontTexture(
  header: string,
  accentHex: string,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d')!;

  // Flip vertically on canvas so when box bottom (-y) rotates 180deg around Z toward camera it reads upright!
  ctx.translate(512, 680);
  ctx.rotate(Math.PI);

  ctx.fillStyle = '#fcf9f2';
  ctx.fillRect(0, 0, 512, 680);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 16;
  ctx.strokeRect(20, 20, 472, 640);

  ctx.fillStyle = accentHex;
  ctx.fillRect(36, 36, 440, 118);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 38px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(header, 256, 95);

  ctx.fillStyle = '#142a3a';
  ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('KART AÇILIYOR...', 256, 360);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

export function createDiceFaceTexture(value: number, maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#d8ccb4';
  ctx.lineWidth = 12;
  ctx.strokeRect(8, 8, 240, 240);

  const pipPositions: Record<number, [number, number][]> = {
    1: [[128, 128]],
    2: [
      [74, 74],
      [182, 182],
    ],
    3: [
      [70, 70],
      [128, 128],
      [186, 186],
    ],
    4: [
      [74, 74],
      [182, 74],
      [74, 182],
      [182, 182],
    ],
    5: [
      [72, 72],
      [184, 72],
      [128, 128],
      [72, 184],
      [184, 184],
    ],
    6: [
      [74, 64],
      [182, 64],
      [74, 128],
      [182, 128],
      [74, 192],
      [182, 192],
    ],
  };

  const pips = pipPositions[value] ?? pipPositions[1];
  for (const [px, py] of pips) {
    ctx.fillStyle = value === 1 ? '#e23b26' : '#142a3a';
    ctx.beginPath();
    ctx.arc(px, py, value === 1 ? 30 : 22, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

/** Crisp official Turkish Flag CanvasTexture (#E30A17 crimson field, white crescent & 5-pointed star) */
export function createTurkishFlagTexture(maxAniso: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 342;
  const ctx = canvas.getContext('2d')!;

  // Crimson red field
  ctx.fillStyle = '#E30A17';
  ctx.fillRect(0, 0, 512, 342);

  // Subtle woven fabric horizontal highlight bands
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < 342; y += 12) {
    ctx.fillRect(0, y, 512, 4);
  }

  // Outer white circle of crescent
  const cx = 192;
  const cy = 171;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 84, 0, Math.PI * 2);
  ctx.fill();

  // Inner red cutout to form crescent
  ctx.fillStyle = '#E30A17';
  ctx.beginPath();
  ctx.arc(cx + 22, cy, 67, 0, Math.PI * 2);
  ctx.fill();

  // 5-pointed white star tilted toward crescent opening
  const sx = 296;
  const sy = 171;
  const outerR = 40;
  const innerR = 15.5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI + (i * Math.PI) / 5;
    const px = sx + Math.cos(angle) * r;
    const py = sy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

/** High-contrast fluttering airplane sky banner announcing the Champion Team Name! */
export function createChampionBannerTexture(
  teamName: string,
  accentHex: string,
  maxAniso: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Bright sunlit ivory ribbon background with golden & team-accent borders
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.fillStyle = '#E30A17';
  ctx.fillRect(0, 0, 1024, 26);
  ctx.fillRect(0, 230, 1024, 26);

  ctx.fillStyle = '#f5b82e';
  ctx.fillRect(0, 26, 1024, 12);
  ctx.fillRect(0, 218, 1024, 12);

  // Decorative left & right color ribbons
  ctx.fillStyle = accentHex || '#1d6fd1';
  ctx.fillRect(14, 44, 44, 168);
  ctx.fillRect(966, 44, 44, 168);

  // Subtitle
  ctx.fillStyle = '#b91c1c';
  ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★  BİSEOPLY İSTANBUL ŞAMPİYONU  ★', 512, 82);

  // Huge bold team name
  const display = teamName.trim().toUpperCase() || 'ŞAMPİYON TAKIM';
  const fontSize = display.length > 18 ? 64 : display.length > 12 ? 78 : 92;
  ctx.fillStyle = '#12263a';
  ctx.font = `900 ${fontSize}px Georgia, serif`;
  ctx.fillText(display, 512, 164);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

