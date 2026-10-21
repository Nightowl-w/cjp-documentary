import * as THREE from 'three';
import type { TimePreset } from './tourData';

export type Quality = 'high' | 'low';

/** Anchor points for DOM labels and highlight rings (world units). */
export const ANCHORS: Record<string, [number, number, number]> = {
  samrat: [0, 10.4, 0],
  jaiprakash: [-11, 3.4, 9.75],
  ram: [0.2, 4.6, 15],
  misra: [12, 5.6, -8],
  stage: [14, 4.6, 10],
  tents: [-8, 2.6, -16],
  langar: [-24, 3.1, -1],
  medical: [6, 2.9, -16],
  stop: [31.2, 3.2, -30],
  bangla: [18, 6.2, -52],
  parliament: [42, 11, -110],
};

export interface WorldHandle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  setPreset(preset: TimePreset): void;
  setRouteVisible(visible: boolean): void;
  setHighlight(id: string | null): void;
  startIntro(instant?: boolean): void;
  update(delta: number, elapsed: number): void;
  dispose(): void;
}

/* --------------------------------- helpers -------------------------------- */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createCanvasTexture(
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D, width: number, height: number) => void
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createSkyTexture(top: string, mid: string, horizon: string, bottom: string) {
  return createCanvasTexture(8, 256, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(0.42, mid);
    gradient.addColorStop(0.64, horizon);
    gradient.addColorStop(1, bottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });
}

function createRoadTexture(dashColor = '#c9b489') {
  return createCanvasTexture(128, 512, (context, width, height) => {
    context.fillStyle = '#3a3c41';
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i < 90; i += 1) {
      context.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    context.fillStyle = dashColor;
    context.fillRect(width / 2 - 3, 40, 6, 200);
    context.fillRect(width / 2 - 3, 300, 6, 200);
    context.fillStyle = 'rgba(240,238,230,0.5)';
    context.fillRect(8, 0, 4, height);
    context.fillRect(width - 12, 0, 4, height);
  });
}

function drawCockroach(context: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineCap = 'round';
  context.lineWidth = Math.max(2, size * 0.08);
  context.beginPath();
  context.ellipse(cx, cy, size * 0.34, size * 0.46, 0, 0, Math.PI * 2);
  context.stroke();
  for (const [dx, dy, ex, ey] of [
    [-0.2, -0.34, -0.62, -0.6],
    [0.2, -0.34, 0.62, -0.6],
    [-0.28, -0.08, -0.66, -0.2],
    [0.28, -0.08, 0.66, -0.2],
    [-0.28, 0.16, -0.66, 0.3],
    [0.28, 0.16, 0.66, 0.3],
    [-0.22, 0.38, -0.58, 0.64],
    [0.22, 0.38, 0.58, 0.64],
  ] as const) {
    context.beginPath();
    context.moveTo(cx + dx * size, cy + dy * size);
    context.lineTo(cx + ex * size, cy + ey * size);
    context.stroke();
  }
  context.restore();
}

function createFlagTexture(variant: 'gold' | 'cream') {
  const dark = variant === 'gold';
  return createCanvasTexture(256, 160, (context, width, height) => {
    context.fillStyle = dark ? '#15131a' : '#f2ead6';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = dark ? 'rgba(212,168,67,0.85)' : 'rgba(21,19,26,0.85)';
    context.lineWidth = 5;
    context.strokeRect(6, 6, width - 12, height - 12);
    drawCockroach(context, 70, height / 2, 78, dark ? '#d4a843' : '#15131a');
    context.fillStyle = dark ? '#e9c877' : '#15131a';
    context.font = 'bold 58px Georgia, "Times New Roman", serif';
    context.textBaseline = 'middle';
    context.fillText('CJP', 132, height / 2 + 4);
  });
}

function createBackdropTexture() {
  return createCanvasTexture(1024, 384, (context, width, height) => {
    context.fillStyle = '#141117';
    context.fillRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(212,168,67,0.16)');
    gradient.addColorStop(0.5, 'rgba(212,168,67,0.02)');
    gradient.addColorStop(1, 'rgba(212,168,67,0.16)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgba(212,168,67,0.6)';
    context.lineWidth = 3;
    context.strokeRect(14, 14, width - 28, height - 28);
    context.fillStyle = '#e9c877';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font =
      '600 84px "Nirmala UI", "Noto Sans Devanagari", "Mangal", system-ui, sans-serif';
    context.fillText('झुकती है दुनिया,', width / 2, height / 2 - 52);
    context.font =
      '600 72px "Nirmala UI", "Noto Sans Devanagari", "Mangal", system-ui, sans-serif';
    context.fillText('झुकाने वाला चाहिए', width / 2, height / 2 + 44);
    drawCockroach(context, width - 96, 74, 52, 'rgba(212,168,67,0.9)');
    context.textAlign = 'left';
    context.font = 'bold 40px Georgia, serif';
    context.fillText('CJP', 60, 72);
  });
}

function createCrossTexture() {
  return createCanvasTexture(256, 256, (context, width, height) => {
    context.fillStyle = '#f4f1ea';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#c0392b';
    context.fillRect(width / 2 - 26, 48, 52, 160);
    context.fillRect(48, height / 2 - 26, 160, 52);
  });
}

function createCompassTexture() {
  return createCanvasTexture(256, 256, (context, width, height) => {
    const cx = width / 2;
    const cy = height / 2;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = 'rgba(212,168,67,0.7)';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(cx, cy, 104, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(cx, cy, 78, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(212,168,67,0.35)';
    context.stroke();
    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2;
      const inner = i % 4 === 0 ? 70 : 82;
      context.beginPath();
      context.moveTo(cx + Math.sin(angle) * inner, cy - Math.cos(angle) * inner);
      context.lineTo(cx + Math.sin(angle) * 98, cy - Math.cos(angle) * 98);
      context.strokeStyle = i % 4 === 0 ? 'rgba(212,168,67,0.8)' : 'rgba(212,168,67,0.4)';
      context.lineWidth = i % 4 === 0 ? 4 : 2;
      context.stroke();
    }
    context.fillStyle = '#e9c877';
    context.beginPath();
    context.moveTo(cx, cy - 66);
    context.lineTo(cx - 16, cy - 22);
    context.lineTo(cx + 16, cy - 22);
    context.closePath();
    context.fill();
    context.fillStyle = '#f2ead6';
    context.font = 'bold 34px Georgia, serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('N', cx, cy - 90);
  });
}

/* ---------------------------------- world --------------------------------- */

export interface WorldOptions {
  ambientMotion?: boolean;
}

export function createWorld(
  renderer: THREE.WebGLRenderer,
  quality: Quality,
  options: WorldOptions = {}
): WorldHandle {
  const random = mulberry32(20260625);
  const high = quality === 'high';
  const ambientMotion = options.ambientMotion !== false;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.5, 1400);
  camera.position.set(44, 38, 50);
  camera.lookAt(2, 0, -6);

  const disposables: { geometries: Set<THREE.BufferGeometry>; materials: Set<THREE.Material>; textures: Set<THREE.Texture> } = {
    geometries: new Set(),
    materials: new Set(),
    textures: new Set(),
  };

  const track = <T extends THREE.BufferGeometry>(geometry: T): T => {
    disposables.geometries.add(geometry);
    return geometry;
  };
  const trackMaterial = <T extends THREE.Material>(material: T): T => {
    disposables.materials.add(material);
    return material;
  };
  const trackTexture = <T extends THREE.Texture>(texture: T): T => {
    disposables.textures.add(texture);
    return texture;
  };

  /* -------------------------------- materials ------------------------------- */

  const sandstone = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0xd8ad88, roughness: 0.82, metalness: 0.04 })
  );
  const sandstoneLight = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0xe4bf9a, roughness: 0.78, metalness: 0.05 })
  );
  const sandstoneDark = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0xb08b68, roughness: 0.88, metalness: 0.04 })
  );
  const gold = trackMaterial(
    new THREE.MeshStandardMaterial({
      color: 0xf0c465,
      roughness: 0.28,
      metalness: 0.75,
      emissive: 0x54380e,
      emissiveIntensity: 0.5,
    })
  );
  const steel = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.42, metalness: 0.78 })
  );
  const darkMetal = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x3c3f45, roughness: 0.55, metalness: 0.6 })
  );
  const whiteCloth = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0xf1ece1, roughness: 0.9, metalness: 0.02, side: THREE.DoubleSide })
  );
  const bowlInterior = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0xa87e5c, roughness: 0.72, metalness: 0.1, side: THREE.DoubleSide })
  );
  const waterMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x2f6f86, roughness: 0.14, metalness: 0.55 })
  );
  const groundMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x332f28, roughness: 0.97, metalness: 0.03 })
  );
  const campGroundMaterial = trackMaterial(
    new THREE.MeshStandardMaterial({ color: 0x413b31, roughness: 0.95, metalness: 0.03 })
  );
  const tentColors = [0x2f5d8c, 0x3f6b47, 0xb0562f, 0xd8d3c6, 0xc9a13d].map((color) =>
    trackMaterial(new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.03, side: THREE.DoubleSide }))
  );
  const routeMaterial = trackMaterial(
    new THREE.MeshBasicMaterial({
      color: 0xe0b45a,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  const routeGhostMaterial = trackMaterial(
    new THREE.MeshBasicMaterial({
      color: 0xb9c2cc,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
  );
  const stopMaterial = trackMaterial(
    new THREE.MeshBasicMaterial({ color: 0xd0503c, transparent: true, opacity: 0.85 })
  );

  const glowTexture = trackTexture(createGlowTexture());
  const accentMats: { material: THREE.MeshStandardMaterial; day: number; night: number }[] = [];

  /* ---------------------------------- sky ----------------------------------- */

  const skyTextures = {
    golden: trackTexture(createSkyTexture('#2c2340', '#6d4f5a', '#caa07a', '#caa07a')),
    day: trackTexture(createSkyTexture('#5c8fbd', '#a9c6da', '#c9d6e0', '#c9d6e0')),
    night: trackTexture(createSkyTexture('#03050b', '#0a1023', '#131a2e', '#131a2e')),
  };

  const skyMaterial = trackMaterial(
    new THREE.MeshBasicMaterial({
      map: skyTextures.golden,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    })
  );
  const sky = new THREE.Mesh(track(new THREE.SphereGeometry(900, 32, 20)), skyMaterial);
  scene.add(sky);

  scene.fog = new THREE.Fog(0xcaa07a, 80, 420);

  /* --------------------------------- lights --------------------------------- */

  const hemi = new THREE.HemisphereLight(0xa08a72, 0x3a332a, 1.05);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffc07a, 3.0);
  sun.position.set(-46, 30, 30);
  sun.castShadow = high;
  if (high) {
    sun.shadow.mapSize.set(2048, 2048);
    const shadowCamera = sun.shadow.camera;
    shadowCamera.left = -80;
    shadowCamera.right = 80;
    shadowCamera.top = 80;
    shadowCamera.bottom = -80;
    shadowCamera.near = 5;
    shadowCamera.far = 260;
    sun.shadow.bias = -0.0006;
  }
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xbcd0ea, 0.5);
  fill.position.set(40, 26, -30);
  scene.add(fill);

  const stageLight = new THREE.PointLight(0xffb066, 0, 60, 2);
  stageLight.position.set(14, 4.5, 9);
  scene.add(stageLight);

  const campLight = new THREE.PointLight(0x9fb6e6, 0, 52, 2);
  campLight.position.set(-18, 3.4, -4);
  scene.add(campLight);

  /* --------------------------------- ground --------------------------------- */

  const world = new THREE.Group();
  scene.add(world);

  const ground = new THREE.Mesh(track(new THREE.PlaneGeometry(4000, 4000)), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = high;
  world.add(ground);

  const campGround = new THREE.Mesh(track(new THREE.CircleGeometry(33, 72)), campGroundMaterial);
  campGround.rotation.x = -Math.PI / 2;
  campGround.position.set(0, 0.015, -2);
  campGround.receiveShadow = high;
  world.add(campGround);

  const campRing = new THREE.Mesh(
    track(new THREE.RingGeometry(32.4, 32.9, 96)),
    trackMaterial(
      new THREE.MeshBasicMaterial({
        color: 0xd4a843,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    )
  );
  campRing.rotation.x = -Math.PI / 2;
  campRing.position.set(0, 0.03, -2);
  world.add(campRing);

  // Roads
  const roadTexture = trackTexture(createRoadTexture());
  roadTexture.wrapT = THREE.RepeatWrapping;
  roadTexture.repeat.set(1, 20);
  const roadMaterial = trackMaterial(new THREE.MeshStandardMaterial({ map: roadTexture, roughness: 0.92, metalness: 0.04 }));
  const mainRoad = new THREE.Mesh(track(new THREE.PlaneGeometry(10, 200)), roadMaterial);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(31.5, 0.02, -34);
  mainRoad.receiveShadow = high;
  world.add(mainRoad);

  const crossTexture = trackTexture(createRoadTexture());
  crossTexture.wrapT = THREE.RepeatWrapping;
  crossTexture.repeat.set(1, 8);
  const crossMaterial = trackMaterial(new THREE.MeshStandardMaterial({ map: crossTexture, roughness: 0.92, metalness: 0.04 }));
  const crossRoad = new THREE.Mesh(track(new THREE.PlaneGeometry(8, 76)), crossMaterial);
  crossRoad.rotation.x = -Math.PI / 2;
  crossRoad.rotation.z = Math.PI / 2;
  crossRoad.position.set(-3, 0.021, 20);
  crossRoad.receiveShadow = high;
  world.add(crossRoad);

  const intersection = new THREE.Mesh(track(new THREE.PlaneGeometry(12, 12)), roadMaterial);
  intersection.rotation.x = -Math.PI / 2;
  intersection.position.set(31.5, 0.025, 20);
  world.add(intersection);

  const kerbMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0x6d6a62, roughness: 0.9 }));
  for (const side of [-1, 1]) {
    const kerb = new THREE.Mesh(track(new THREE.BoxGeometry(0.3, 0.22, 200)), kerbMaterial);
    kerb.position.set(31.5 + side * 5.15, 0.11, -34);
    world.add(kerb);
  }

  const compass = new THREE.Mesh(
    track(new THREE.CircleGeometry(4.6, 48)),
    trackMaterial(
      new THREE.MeshBasicMaterial({
        map: trackTexture(createCompassTexture()),
        transparent: true,
        opacity: 0.9,
      })
    )
  );
  compass.rotation.x = -Math.PI / 2;
  compass.position.set(-34, 0.05, 30);
  world.add(compass);

  /* ------------------------------- instruments ------------------------------ */

  const introScale: { object: THREE.Object3D; delay: number }[] = [];
  const introFade: { material: THREE.Material; base: number; delay: number }[] = [];

  const monuments = new THREE.Group();
  world.add(monuments);

  const samrat = createSamratYantra();
  samrat.position.set(0, 0, 0);
  monuments.add(samrat);
  introScale.push({ object: samrat, delay: 0 });

  const jaiprakash = createJaiPrakash();
  jaiprakash.position.set(-11, 0, 9.75);
  monuments.add(jaiprakash);
  introScale.push({ object: jaiprakash, delay: 0.12 });

  const ram = createRamYantra();
  ram.position.set(0.2, 0, 15);
  monuments.add(ram);
  introScale.push({ object: ram, delay: 0.22 });

  const misra = createMisraYantra();
  misra.position.set(12, 0, -8);
  monuments.add(misra);
  introScale.push({ object: misra, delay: 0.32 });

  const minor = createMinorInstruments();
  minor.position.set(-16.5, 0, -7);
  monuments.add(minor);
  introScale.push({ object: minor, delay: 0.4 });

  /* ---------------------------------- camp ---------------------------------- */

  const camp = new THREE.Group();
  world.add(camp);

  const stage = createStage();
  stage.position.set(14, 0, 10);
  stage.rotation.y = Math.PI / 2;
  camp.add(stage);
  introScale.push({ object: stage, delay: 0.5 });

  const tentPositions: [number, number, number][] = [
    [-8, -16, 0.4],
    [-13, -13.5, 0.8],
    [-17.5, -9.5, 1.1],
    [-20, -4.5, 1.5],
    [-20.5, 1.5, 1.9],
    [-18.5, 7.5, 2.3],
    [-14, 12.5, 2.7],
    [-8.5, 16, 3.1],
    [-3, -18, 0.1],
    [2, -19, -0.2],
    [6.5, -18.5, -0.5],
  ];
  tentPositions.forEach(([x, z, rotation], index) => {
    const tent = createTent(tentColors[index % tentColors.length]);
    tent.position.set(x, 0, z);
    tent.rotation.y = rotation;
    camp.add(tent);
    introScale.push({ object: tent, delay: 0.56 + index * 0.035 });
  });

  const langar = createLangar();
  langar.position.set(-24, 0, -1);
  camp.add(langar);
  introScale.push({ object: langar, delay: 0.98 });

  const waterPoint = createWaterPoint();
  waterPoint.position.set(-21, 0, -8);
  camp.add(waterPoint);
  introScale.push({ object: waterPoint, delay: 1.04 });

  const medical = createMedicalCamp();
  medical.position.set(6, 0, -16);
  medical.rotation.y = -0.4;
  camp.add(medical);
  introScale.push({ object: medical, delay: 1.1 });

  const ambulance = createAmbulance();
  ambulance.position.set(10.5, 0, -17.5);
  ambulance.rotation.y = -0.6;
  camp.add(ambulance);
  introScale.push({ object: ambulance, delay: 1.14 });

  /* --------------------------------- flags ---------------------------------- */

  const flagTextures = [trackTexture(createFlagTexture('gold')), trackTexture(createFlagTexture('cream'))];
  const flagWavers: {
    geometry: THREE.PlaneGeometry;
    base: Float32Array;
    phase: number;
    amplitude: number;
  }[] = [];
  const flagMaterialGold = trackMaterial(
    new THREE.MeshStandardMaterial({ map: flagTextures[0], side: THREE.DoubleSide, roughness: 0.85 })
  );
  const flagMaterialCream = trackMaterial(
    new THREE.MeshStandardMaterial({ map: flagTextures[1], side: THREE.DoubleSide, roughness: 0.85 })
  );

  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2 + 0.18;
    const x = Math.cos(angle) * 27;
    const z = Math.sin(angle) * 23;
    const group = new THREE.Group();

    const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.09, 6, 8)), darkMetal);
    pole.position.y = 3;
    pole.castShadow = high;
    group.add(pole);

    const flagGeometry = track(new THREE.PlaneGeometry(1.7, 1.05, 12, 6));
    const flag = new THREE.Mesh(flagGeometry, i % 2 === 0 ? flagMaterialGold : flagMaterialCream);
    flag.position.set(0.92, 5.35, 0);
    flag.castShadow = high;
    group.add(flag);

    flagWavers.push({
      geometry: flagGeometry,
      base: new Float32Array(flagGeometry.getAttribute('position').array),
      phase: random() * Math.PI * 2,
      amplitude: 0.16 + random() * 0.12,
    });

    group.position.set(x, 0, z);
    group.rotation.y = -angle + Math.PI / 2;
    camp.add(group);
    introScale.push({ object: group, delay: 0.86 + i * 0.022 });
  }

  /* ------------------------------- barricades ------------------------------- */

  const perimeter = new THREE.Group();
  perimeter.rotation.y = Math.PI / 2;
  for (let i = 0; i < 13; i += 1) {
    const unit = createBarricadeUnit();
    unit.position.set(-14 + i * 2.4, 0, 25);
    unit.rotation.y = 0;
    perimeter.add(unit);
    introScale.push({ object: unit, delay: 1.18 + i * 0.015 });
  }
  perimeter.position.set(-1.5, 0, -3);
  world.add(perimeter);

  for (let i = 0; i < 4; i += 1) {
    const unit = createBarricadeUnit();
    unit.position.set(31.2 + (i - 1.5) * 2.35, 0, -30);
    unit.rotation.y = 0;
    world.add(unit);
    introScale.push({ object: unit, delay: 1.36 + i * 0.03 });
  }

  /* ---------------------------------- route --------------------------------- */

  const routeCurve = new THREE.CatmullRomCurve3(
    [
      [12, 0.08, 8],
      [20, 0.08, 2],
      [27, 0.08, -6],
      [30, 0.08, -18],
      [31.2, 0.08, -30],
      [33, 0.08, -46],
      [36, 0.08, -66],
      [38, 0.08, -86],
      [40, 0.08, -104],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z))
  );

  // Find the arc-length parameter closest to the stop point (31.2, -30).
  let stopT = 0.5;
  {
    const stopPoint = new THREE.Vector3(31.2, 0.08, -30);
    let best = Infinity;
    for (let i = 0; i <= 200; i += 1) {
      const t = i / 200;
      const distance = routeCurve.getPointAt(t).distanceTo(stopPoint);
      if (distance < best) {
        best = distance;
        stopT = t;
      }
    }
  }

  const routeGroup = new THREE.Group();
  routeGroup.visible = false;
  world.add(routeGroup);

  const routeTube = new THREE.Mesh(
    track(new THREE.TubeGeometry(routeCurve, 220, 0.07, 6, false)),
    routeMaterial
  );
  routeGroup.add(routeTube);

  const dashGeometry = track(new THREE.BoxGeometry(0.85, 0.05, 0.2));
  for (let i = 0; i < 40; i += 1) {
    const t = (i / 40) * stopT;
    const point = routeCurve.getPointAt(t);
    const tangent = routeCurve.getTangentAt(t);
    const dash = new THREE.Mesh(dashGeometry, i % 2 === 0 ? routeMaterial : routeGhostMaterial);
    dash.position.copy(point);
    dash.position.y += 0.06;
    dash.rotation.y = Math.atan2(tangent.x, tangent.z);
    routeGroup.add(dash);
  }
  for (let i = 0; i < 16; i += 1) {
    const t = stopT + ((i + 1) / 17) * (1 - stopT);
    const point = routeCurve.getPointAt(t);
    const tangent = routeCurve.getTangentAt(t);
    const dash = new THREE.Mesh(dashGeometry, routeGhostMaterial);
    dash.position.copy(point);
    dash.position.y += 0.06;
    dash.rotation.y = Math.atan2(tangent.x, tangent.z);
    routeGroup.add(dash);
  }

  const marchers = new THREE.InstancedMesh(
    track(new THREE.CapsuleGeometry(0.16, 0.34, 4, 8)),
    trackMaterial(new THREE.MeshStandardMaterial({ color: 0xe8c477, roughness: 0.6, metalness: 0.1 })),
    high ? 44 : 24
  );
  marchers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  routeGroup.add(marchers);

  const stopRing = new THREE.Mesh(track(new THREE.TorusGeometry(2.8, 0.1, 8, 64)), stopMaterial);
  stopRing.rotation.x = -Math.PI / 2;
  stopRing.position.set(31.2, 0.1, -30);
  routeGroup.add(stopRing);

  const stopGlow = new THREE.Sprite(
    trackMaterial(
      new THREE.SpriteMaterial({
        map: trackTexture(createGlowTexture()),
        color: 0xd0503c,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  stopGlow.position.set(31.2, 1.4, -30);
  stopGlow.scale.setScalar(7);
  routeGroup.add(stopGlow);

  introFade.push({ material: routeMaterial, base: 0.42, delay: 1.3 });
  introFade.push({ material: routeGhostMaterial, base: 0.22, delay: 1.4 });

  /* -------------------------------- landmarks ------------------------------- */

  const landmarks = new THREE.Group();
  world.add(landmarks);

  const parliament = createParliament();
  parliament.position.set(42, 0, -110);
  landmarks.add(parliament);
  introScale.push({ object: parliament, delay: 0.1 });

  const banglaSahib = createBanglaSahib();
  banglaSahib.position.set(18, 0, -52);
  landmarks.add(banglaSahib);
  introScale.push({ object: banglaSahib, delay: 0.3 });

  /* ---------------------------------- crowd --------------------------------- */

  const crowdCount = high ? 260 : 110;
  const crowdGeometry = track(new THREE.CapsuleGeometry(0.19, 0.52, 3, 8));
  const crowdMaterial = trackMaterial(new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.02 }));

  const crowdColors = [0xd9d4c8, 0x8aa6c8, 0xc09a86, 0x8aa08a, 0xb8b2a4, 0xc9b06d].map(
    (color) => new THREE.Color(color)
  );
  const crowdData: { x: number; z: number; phase: number; speed: number; scale: number; facing: number }[] = [];
  const exclusion = [
    { x: 0, z: 0, r: 10 },
    { x: -11, z: 9.75, r: 5.2 },
    { x: 0.2, z: 15, r: 5.6 },
    { x: 12, z: -8, r: 5.4 },
    { x: -16.5, z: -7, r: 4 },
    { x: 14, z: 10, r: 5.4 },
    { x: -24, z: -1, r: 4.4 },
    { x: -21, z: -8, r: 3.4 },
    { x: 6, z: -16, r: 3.8 },
    { x: 10.5, z: -17.5, r: 3.2 },
  ];
  for (const [x, z] of tentPositions) exclusion.push({ x, z, r: 2.6 });

  let guard = 0;
  while (crowdData.length < crowdCount && guard < crowdCount * 60) {
    guard += 1;
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random());
    const x = 2 + Math.cos(angle) * radius * 24;
    const z = -3 + Math.sin(angle) * radius * 20;
    if (exclusion.some((zone) => Math.hypot(zone.x - x, zone.z - z) < zone.r)) continue;
    crowdData.push({
      x,
      z,
      phase: random() * Math.PI * 2,
      speed: 0.6 + random() * 0.9,
      scale: 0.95 + random() * 0.35,
      facing: random() * Math.PI * 2,
    });
  }

  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scaleVector = new THREE.Vector3();
  const upAxis = new THREE.Vector3(0, 1, 0);

  const crowd = new THREE.InstancedMesh(crowdGeometry, crowdMaterial, crowdData.length);
  crowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  world.add(crowd);

  crowdData.forEach((person, index) => {
    crowd.setColorAt(index, crowdColors[index % crowdColors.length]);
  });
  if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true;

  /* -------------------------------- placards -------------------------------- */

  const placardTextures = [flagTextures[0], flagTextures[1]];
  const placardData: [number, number, number][] = [
    [-4, -10, 0.4],
    [1.5, -12.5, -0.3],
    [7, -13, 0.9],
    [-9, -20, 0.2],
    [-15, -18, 1.4],
    [-20, -14, 2.1],
    [-24, -8, 2.6],
    [-25.5, 2, 3.4],
    [-22, 10, 4.2],
    [-15, 17, 5],
    [-7, 20, 5.6],
    [1, 21, 6.1],
    [9, 19, 0.1],
    [17, 15, 0.6],
    [20, 6, 1.2],
    [17, -3, 1.8],
  ];
  placardData.forEach(([x, z, rotation], index) => {
    const group = new THREE.Group();
    const stick = new THREE.Mesh(track(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6)), darkMetal);
    stick.position.y = 0.8;
    group.add(stick);
    const board = new THREE.Mesh(
      track(new THREE.PlaneGeometry(0.85, 0.55)),
      trackMaterial(
        new THREE.MeshStandardMaterial({
          map: placardTextures[index % 2],
          side: THREE.DoubleSide,
          roughness: 0.85,
        })
      )
    );
    board.position.y = 1.55;
    board.rotation.y = rotation + Math.PI / 2;
    group.add(board);
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    camp.add(group);
    introScale.push({ object: group, delay: 1.2 + index * 0.02 });
  });

  /* -------------------------------- light poles ------------------------------ */

  const nightGroup = new THREE.Group();
  nightGroup.visible = false;
  world.add(nightGroup);

  const lampPositions: [number, number][] = [
    [37.6, 12],
    [37.6, -8],
    [37.6, -34],
    [37.6, -60],
  ];
  lampPositions.forEach(([x, z]) => {
    const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.09, 0.12, 7.4, 8)), darkMetal);
    pole.position.set(x, 3.7, z);
    world.add(pole);
    const head = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.32, 12, 12)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xfff0c9, emissive: 0xffd79a, emissiveIntensity: 1.4 }))
    );
    head.position.set(x, 7.5, z);
    nightGroup.add(head);
    const glow = new THREE.Sprite(
      trackMaterial(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0xffd9a0,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      )
    );
    glow.position.set(x, 7.5, z);
    glow.scale.setScalar(6);
    nightGroup.add(glow);
  });

  const stageGlows: THREE.Sprite[] = [];
  [
    [13, 3.4, 12.4, 12],
    [15.5, 3.6, 7.4, 10],
  ].forEach(([x, y, z, size]) => {
    const sprite = new THREE.Sprite(
      trackMaterial(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: 0xffb066,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      )
    );
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(size);
    nightGroup.add(sprite);
    stageGlows.push(sprite);
  });

  for (let i = 0; i < 9; i += 1) {
    const bulb = new THREE.Mesh(
      track(new THREE.SphereGeometry(0.12, 8, 8)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xffe9bd, emissive: 0xffc978, emissiveIntensity: 1.6 }))
    );
    bulb.position.set(-26 + i * 3.4, 2.7, -14 + Math.sin(i) * 2.2);
    nightGroup.add(bulb);
  }

  /* ---------------------------------- dust ---------------------------------- */

  const dustCount = high ? 320 : 140;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustSpeeds = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = -45 + random() * 95;
    dustPositions[i * 3 + 1] = 0.4 + random() * 15;
    dustPositions[i * 3 + 2] = -70 + random() * 110;
    dustSpeeds[i] = 0.25 + random() * 0.6;
  }
  const dustGeometry = track(new THREE.BufferGeometry());
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    trackMaterial(
      new THREE.PointsMaterial({
        map: glowTexture,
        color: 0xffdca8,
        size: 0.3,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    )
  );
  world.add(dust);
  introFade.push({ material: dust.material as THREE.Material, base: 0.3, delay: 0.4 });

  /* ------------------------------- highlight -------------------------------- */

  const highlightRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(2.6, 0.09, 8, 64)),
    trackMaterial(
      new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    )
  );
  highlightRing.rotation.x = -Math.PI / 2;
  highlightRing.visible = false;
  scene.add(highlightRing);

  const highlightGlow = new THREE.Sprite(
    trackMaterial(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffd27a,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  highlightGlow.visible = false;
  scene.add(highlightGlow);

  /* --------------------------------- intro ---------------------------------- */

  let introStarted = false;
  let introTime = 0;

  const applyIntroScale = (progress: number) => {
    for (const entry of introScale) {
      const p = THREE.MathUtils.clamp((progress - entry.delay) / 0.8, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      entry.object.scale.setScalar(Math.max(0.001, eased));
    }
  };

  applyIntroScale(-99);

  // Keep the fading elements invisible until the intro actually starts, so the
  // map does not flash a half-built scene before it scrolls into view.
  for (const entry of introFade) {
    const material = entry.material as THREE.MeshBasicMaterial | THREE.PointsMaterial;
    if ('opacity' in material) material.opacity = 0;
  }

  /* --------------------------------- updates -------------------------------- */

  let routeVisible = false;
  let crowdIntro = 0;

  const update = (delta: number, elapsed: number) => {

    if (introStarted) {
      introTime += delta;
      applyIntroScale(introTime);
      crowdIntro = THREE.MathUtils.clamp((introTime - 1.0) / 1.4, 0, 1);
      for (const entry of introFade) {
        const p = THREE.MathUtils.clamp((introTime - entry.delay) / 0.9, 0, 1);
        const material = entry.material as THREE.MeshBasicMaterial | THREE.PointsMaterial;
        if ('opacity' in material) material.opacity = entry.base * p;
      }
    }

    // Flags
    if (ambientMotion) {
      for (const waver of flagWavers) {
        const attribute = waver.geometry.getAttribute('position') as THREE.BufferAttribute;
        const array = attribute.array as Float32Array;
        for (let i = 0; i < attribute.count; i += 1) {
          const x = waver.base[i * 3];
          const y = waver.base[i * 3 + 1];
          const influence = (x + 0.85) / 1.7;
          array[i * 3 + 2] =
            Math.sin(x * 2.4 + elapsed * 3.1 + waver.phase) * waver.amplitude * influence +
            Math.sin(y * 3.2 + elapsed * 2.2 + waver.phase) * 0.05 * influence;
        }
        attribute.needsUpdate = true;
      }
    }

    // Crowd
    const motionFactor = ambientMotion ? 1 : 0;
    for (let i = 0; i < crowdData.length; i += 1) {
      const person = crowdData[i];
      const bob = Math.sin(elapsed * 1.7 * person.speed + person.phase) * 0.035 * motionFactor;
      const sway = Math.sin(elapsed * 0.6 + person.phase) * 0.35 * motionFactor;
      position.set(person.x, 0.42 * person.scale + bob, person.z);
      quaternion.setFromAxisAngle(upAxis, person.facing + sway);
      scaleVector.setScalar(person.scale * Math.max(0.001, crowdIntro));
      matrix.compose(position, quaternion, scaleVector);
      crowd.setMatrixAt(i, matrix);
    }
    crowd.instanceMatrix.needsUpdate = true;

    // Dust
    if (ambientMotion) {
      const attribute = dustGeometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < dustCount; i += 1) {
        let y = attribute.getY(i) + dustSpeeds[i] * delta;
        if (y > 16.5) y = 0.35;
        attribute.setY(i, y);
      }
      attribute.needsUpdate = true;
      dust.rotation.y = elapsed * 0.008;
    }

    // March dots
    if (routeVisible) {
      const count = marchers.count;
      for (let i = 0; i < count; i += 1) {
        const t = ((elapsed * 0.035 + i / count) % 1) * stopT;
        const point = routeCurve.getPointAt(t);
        const tangent = routeCurve.getTangentAt(t);
        position.set(point.x, 0.52, point.z);
        quaternion.setFromAxisAngle(upAxis, Math.atan2(tangent.x, tangent.z));
        scaleVector.setScalar(1);
        matrix.compose(position, quaternion, scaleVector);
        marchers.setMatrixAt(i, matrix);
      }
      marchers.instanceMatrix.needsUpdate = true;

      const pulse = 1 + Math.sin(elapsed * 3.4) * 0.08;
      stopRing.scale.setScalar(pulse);
      stopMaterial.opacity = 0.65 + Math.sin(elapsed * 3.4) * 0.25;
      (stopGlow.material as THREE.SpriteMaterial).opacity = 0.35 + Math.sin(elapsed * 2.6) * 0.15;
    }

    // Highlight pulse
    if (highlightRing.visible) {
      const pulse = 1 + Math.sin(elapsed * 3.2) * 0.1;
      highlightRing.scale.setScalar(pulse);
      highlightRing.rotation.z = elapsed * 0.6;
      (highlightGlow.material as THREE.SpriteMaterial).opacity = 0.28 + Math.sin(elapsed * 2.4) * 0.1;
    }

    // Night flicker
    if (nightGroup.visible) {
      stageGlows.forEach((sprite, index) => {
        (sprite.material as THREE.SpriteMaterial).opacity =
          0.42 + Math.sin(elapsed * (2.2 + index) + index) * 0.08;
      });
    }
  };

  /* --------------------------------- presets -------------------------------- */

  const goldMats: THREE.MeshStandardMaterial[] = [];
  scene.traverse((object) => {
    const material = (object as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    for (const entry of materials) {
      if (entry === gold) goldMats.push(entry as THREE.MeshStandardMaterial);
    }
  });

  const presets: Record<TimePreset, () => void> = {
    golden: () => {
      skyMaterial.map = skyTextures.golden;
      hemi.color.set(0xa08a72);
      hemi.groundColor.set(0x3a332a);
      hemi.intensity = 1.05;
      sun.color.set(0xffc07a);
      sun.intensity = 3.0;
      sun.position.set(-46, 30, 30);
      fill.intensity = 0.5;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.set(0xcaa07a);
        scene.fog.near = 80;
        scene.fog.far = 420;
      }
      renderer.toneMappingExposure = 1.2;
      nightGroup.visible = false;
      stageLight.intensity = 0;
      campLight.intensity = 0;
      goldMats.forEach((material) => (material.emissiveIntensity = 0.5));
      accentMats.forEach((entry) => (entry.material.emissiveIntensity = entry.day));
    },
    day: () => {
      skyMaterial.map = skyTextures.day;
      hemi.color.set(0xd5e4f2);
      hemi.groundColor.set(0x3a3833);
      hemi.intensity = 1.2;
      sun.color.set(0xfff6e6);
      sun.intensity = 3.3;
      sun.position.set(34, 62, 28);
      fill.intensity = 0.55;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.set(0xc9d6e0);
        scene.fog.near = 100;
        scene.fog.far = 460;
      }
      renderer.toneMappingExposure = 1.06;
      nightGroup.visible = false;
      stageLight.intensity = 0;
      campLight.intensity = 0;
      goldMats.forEach((material) => (material.emissiveIntensity = 0.3));
      accentMats.forEach((entry) => (entry.material.emissiveIntensity = entry.day));
    },
    night: () => {
      skyMaterial.map = skyTextures.night;
      hemi.color.set(0x28304f);
      hemi.groundColor.set(0x0c0e16);
      hemi.intensity = 0.5;
      sun.color.set(0xa9bdf0);
      sun.intensity = 0.85;
      sun.position.set(40, 54, -30);
      fill.intensity = 0.15;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.color.set(0x131a2e);
        scene.fog.near = 70;
        scene.fog.far = 400;
      }
      renderer.toneMappingExposure = 1.2;
      nightGroup.visible = true;
      stageLight.intensity = 50;
      campLight.intensity = 22;
      goldMats.forEach((material) => (material.emissiveIntensity = 1.1));
      accentMats.forEach((entry) => (entry.material.emissiveIntensity = entry.night));
    },
  };

  presets.golden();

  return {
    scene,
    camera,
    setPreset(preset) {
      presets[preset]();
    },
    setRouteVisible(visible) {
      routeVisible = visible;
      routeGroup.visible = visible;
    },
    setHighlight(id) {
      if (!id || !ANCHORS[id]) {
        highlightRing.visible = false;
        highlightGlow.visible = false;
        return;
      }
      const [x, y, z] = ANCHORS[id];
      highlightRing.position.set(x, 0.12, z);
      highlightGlow.position.set(x, y * 0.55 + 1.2, z);
      highlightGlow.scale.setScalar(5 + y * 0.4);
      highlightRing.visible = true;
      highlightGlow.visible = true;
    },
    startIntro(instant = false) {
      if (instant) {
        introStarted = true;
        introTime = 99;
        applyIntroScale(99);
        crowdIntro = 1;
        for (const entry of introFade) {
          const material = entry.material as THREE.MeshBasicMaterial | THREE.PointsMaterial;
          if ('opacity' in material) material.opacity = entry.base;
        }
        return;
      }
      introStarted = true;
      introTime = 0;
    },
    update,
    dispose() {
      disposables.geometries.forEach((geometry) => geometry.dispose());
      disposables.materials.forEach((material) => material.dispose());
      disposables.textures.forEach((texture) => texture.dispose());
    },
  };

  /* ------------------------------ constructors ------------------------------ */

  function createSamratYantra() {
    const group = new THREE.Group();

    const plinth = new THREE.Mesh(track(new THREE.CylinderGeometry(8, 8.6, 0.5, 48)), sandstoneDark);
    plinth.position.y = 0.25;
    plinth.receiveShadow = high;
    group.add(plinth);

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(7.6, 0);
    shape.lineTo(0, 8.6);
    shape.closePath();
    const prismGeometry = track(
      new THREE.ExtrudeGeometry(shape, { depth: 1.7, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 1 })
    );
    prismGeometry.translate(0, 0, -0.85);
    const prism = new THREE.Mesh(prismGeometry, sandstone);
    prism.position.y = 0.5;
    prism.castShadow = high;
    prism.receiveShadow = high;
    group.add(prism);

    const edge = new THREE.LineSegments(
      track(new THREE.EdgesGeometry(prismGeometry)),
      trackMaterial(new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.55 }))
    );
    edge.position.y = 0.5;
    group.add(edge);

    // Quarter arcs of the dial on the ground
    for (const rotation of [0.5, Math.PI + 0.5]) {
      const arcGeometry = track(new THREE.TorusGeometry(8.2, 0.08, 8, 64, Math.PI / 2.2));
      arcGeometry.rotateX(-Math.PI / 2);
      arcGeometry.rotateY(rotation);
      const arc = new THREE.Mesh(arcGeometry, gold);
      arc.position.y = 0.56;
      group.add(arc);
    }

    const tip = new THREE.Mesh(track(new THREE.SphereGeometry(0.4, 16, 16)), gold);
    tip.position.set(0, 9.5, 0);
    group.add(tip);

    return group;
  }

  function createJaiPrakash() {
    const group = new THREE.Group();

    const plinth = new THREE.Mesh(track(new THREE.CylinderGeometry(8.2, 8.8, 0.45, 48)), sandstoneDark);
    plinth.position.y = 0.22;
    plinth.receiveShadow = high;
    group.add(plinth);

    const bowlGeometry = track(new THREE.SphereGeometry(3.4, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));
    const rimGeometry = track(new THREE.TorusGeometry(3.4, 0.09, 8, 64));
    const spokeMaterial = trackMaterial(new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.4 }));

    for (const offset of [-4.6, 4.6]) {
      const bowl = new THREE.Mesh(bowlGeometry, bowlInterior);
      bowl.position.set(offset, 3.46, 0);
      bowl.castShadow = high;
      bowl.receiveShadow = high;
      group.add(bowl);

      const rim = new THREE.Mesh(rimGeometry, gold);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(offset, 3.46, 0);
      group.add(rim);

      const post = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.14, 3.4, 10)), steel);
      post.position.set(offset, 1.7, 0);
      group.add(post);

      const ring = new THREE.Mesh(track(new THREE.TorusGeometry(0.6, 0.05, 6, 32)), gold);
      ring.position.set(offset, 3.1, 0);
      group.add(ring);

      for (let i = 0; i < 6; i += 1) {
        const angle = (i / 6) * Math.PI * 2;
        const spoke = new THREE.Line(
          track(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0.4, 0),
              new THREE.Vector3(Math.cos(angle) * 3.3, 3.4, Math.sin(angle) * 3.3),
            ])
          ),
          spokeMaterial
        );
        spoke.position.set(offset, 0, 0);
        group.add(spoke);
      }
    }

    return group;
  }

  function createRamYantra() {
    const group = new THREE.Group();

    const plinth = new THREE.Mesh(track(new THREE.CylinderGeometry(7, 7.6, 0.4, 48)), sandstoneDark);
    plinth.position.y = 0.2;
    plinth.receiveShadow = high;
    group.add(plinth);

    const cylinderGeometry = track(new THREE.CylinderGeometry(2.5, 2.6, 3.6, 36, 1, false));
    const rimGeometry = track(new THREE.TorusGeometry(2.5, 0.08, 8, 48));
    const barGeometry = track(new THREE.BoxGeometry(4.6, 0.06, 0.12));

    for (const offset of [-3.6, 3.6]) {
      const shell = new THREE.Mesh(cylinderGeometry, sandstoneLight);
      shell.position.set(offset, 1.8, 0);
      shell.castShadow = high;
      shell.receiveShadow = high;
      group.add(shell);

      const rim = new THREE.Mesh(rimGeometry, gold);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(offset, 3.6, 0);
      group.add(rim);

      const pillar = new THREE.Mesh(track(new THREE.CylinderGeometry(0.16, 0.18, 4.4, 10)), sandstone);
      pillar.position.set(offset, 2.2, 0);
      group.add(pillar);

      const cap = new THREE.Mesh(track(new THREE.SphereGeometry(0.22, 12, 12)), gold);
      cap.position.set(offset, 4.5, 0);
      group.add(cap);

      for (let i = 0; i < 4; i += 1) {
        const bar = new THREE.Mesh(barGeometry, gold);
        bar.position.set(offset, 3.66, 0);
        bar.rotation.y = (i / 4) * Math.PI;
        group.add(bar);
      }
    }

    return group;
  }

  function createMisraYantra() {
    const group = new THREE.Group();

    const plinth = new THREE.Mesh(track(new THREE.CylinderGeometry(4.6, 5.1, 0.45, 40)), sandstoneDark);
    plinth.position.y = 0.22;
    plinth.receiveShadow = high;
    group.add(plinth);

    const wall = new THREE.Mesh(track(new THREE.BoxGeometry(5.6, 3.4, 0.32)), sandstone);
    wall.position.set(1.4, 2.2, 0);
    wall.castShadow = high;
    group.add(wall);

    const wallEdge = new THREE.Mesh(track(new THREE.BoxGeometry(5.7, 3.5, 0.06)), gold);
    wallEdge.position.set(1.4, 2.2, 0.2);
    group.add(wallEdge);

    const wedgeShape = new THREE.Shape();
    wedgeShape.moveTo(-1.4, 0);
    wedgeShape.lineTo(1.4, 0);
    wedgeShape.lineTo(-1.4, 4.2);
    wedgeShape.closePath();
    const wedgeGeometry = track(new THREE.ExtrudeGeometry(wedgeShape, { depth: 1.1, bevelEnabled: false }));
    wedgeGeometry.translate(0, 0, -0.55);
    const wedge = new THREE.Mesh(wedgeGeometry, sandstone);
    wedge.position.set(-2.1, 0.5, 0);
    wedge.castShadow = high;
    group.add(wedge);

    const dialGeometry = track(new THREE.CylinderGeometry(1.5, 1.6, 0.22, 32));
    const dialRimGeometry = track(new THREE.TorusGeometry(1.5, 0.06, 8, 40));
    for (const height of [4.4, 6]) {
      const dial = new THREE.Mesh(dialGeometry, sandstoneLight);
      dial.position.set(1.4, height, 0);
      dial.castShadow = high;
      group.add(dial);
      const dialRim = new THREE.Mesh(dialRimGeometry, gold);
      dialRim.rotation.x = Math.PI / 2;
      dialRim.position.set(1.4, height + 0.12, 0);
      group.add(dialRim);
    }

    const cap = new THREE.Mesh(track(new THREE.SphereGeometry(0.34, 14, 14)), gold);
    cap.position.set(1.4, 6.7, 0);
    group.add(cap);

    return group;
  }

  function createMinorInstruments() {
    const group = new THREE.Group();

    const wall = new THREE.Mesh(track(new THREE.BoxGeometry(5.4, 0.5, 1)), sandstoneLight);
    wall.position.set(0, 0.25, 0);
    wall.castShadow = high;
    group.add(wall);

    const plate = new THREE.Mesh(track(new THREE.CylinderGeometry(0.95, 1, 0.18, 28)), sandstone);
    plate.position.set(-2.4, 0.6, 1.6);
    group.add(plate);

    const plateRing = new THREE.Mesh(track(new THREE.TorusGeometry(0.95, 0.05, 6, 32)), gold);
    plateRing.rotation.x = Math.PI / 2;
    plateRing.position.set(-2.4, 0.7, 1.6);
    group.add(plateRing);

    const dial = new THREE.Mesh(track(new THREE.CylinderGeometry(0.7, 0.75, 0.14, 24)), sandstone);
    dial.position.set(2.1, 0.58, 1.4);
    group.add(dial);

    return group;
  }

  function createStage() {
    const group = new THREE.Group();

    const platform = new THREE.Mesh(track(new THREE.BoxGeometry(7, 0.6, 3.4)), darkMetal);
    platform.position.y = 0.3;
    platform.castShadow = high;
    platform.receiveShadow = high;
    group.add(platform);

    const trim = new THREE.Mesh(track(new THREE.BoxGeometry(7.1, 0.08, 3.5)), gold);
    trim.position.y = 0.62;
    group.add(trim);

    for (const x of [-3.2, 3.2]) {
      for (const z of [-1.5, 1.5]) {
        const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.07, 0.07, 3.4, 8)), steel);
        pole.position.set(x, 2.3, z);
        pole.castShadow = high;
        group.add(pole);
      }
    }

    const roof = new THREE.Mesh(track(new THREE.BoxGeometry(7.6, 0.12, 3.9)), darkMetal);
    roof.position.y = 4.05;
    roof.castShadow = high;
    group.add(roof);

    const backdropMaterial = trackMaterial(
      new THREE.MeshStandardMaterial({
        map: trackTexture(createBackdropTexture()),
        side: THREE.DoubleSide,
        roughness: 0.85,
        emissive: 0xd4a843,
        emissiveIntensity: 0.15,
      })
    );
    accentMats.push({ material: backdropMaterial, day: 0.15, night: 0.75 });
    const backdrop = new THREE.Mesh(track(new THREE.PlaneGeometry(7.2, 2.7)), backdropMaterial);
    backdrop.position.set(0, 2.5, 1.72);
    group.add(backdrop);

    for (const x of [-3.9, 3.9]) {
      const speakerPole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 8)), steel);
      speakerPole.position.set(x, 2.3, -0.6);
      group.add(speakerPole);
      const horn = new THREE.Mesh(track(new THREE.ConeGeometry(0.42, 0.9, 14, 1, true)), darkMetal);
      horn.position.set(x, 4.5, -0.9);
      horn.rotation.x = Math.PI / 2.4;
      group.add(horn);
    }

    return group;
  }

  function createTent(material: THREE.Material) {
    const group = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(-1.3, 0);
    shape.lineTo(1.3, 0);
    shape.lineTo(0, 1.2);
    shape.closePath();
    const geometry = track(new THREE.ExtrudeGeometry(shape, { depth: 2.6, bevelEnabled: false }));
    geometry.translate(0, 0, -1.3);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = high;
    mesh.receiveShadow = high;
    group.add(mesh);

    const base = new THREE.Mesh(track(new THREE.BoxGeometry(2.6, 0.1, 2.6)), darkMetal);
    base.position.y = 0.05;
    group.add(base);

    return group;
  }

  function createLangar() {
    const group = new THREE.Group();

    const counter = new THREE.Mesh(track(new THREE.BoxGeometry(4.4, 0.9, 0.8)), steel);
    counter.position.set(0, 0.45, 0);
    counter.castShadow = high;
    group.add(counter);

    const counterTop = new THREE.Mesh(track(new THREE.BoxGeometry(4.6, 0.08, 0.9)), whiteCloth);
    counterTop.position.set(0, 0.94, 0);
    group.add(counterTop);

    const potGeometry = track(new THREE.CylinderGeometry(0.5, 0.42, 0.5, 20));
    const potMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.4, metalness: 0.7 }));
    for (let i = 0; i < 3; i += 1) {
      const pot = new THREE.Mesh(potGeometry, potMaterial);
      pot.position.set(-1.4 + i * 1.4, 1.2, 0.1);
      pot.castShadow = high;
      group.add(pot);
    }

    for (const x of [-1.6, 1.6]) {
      for (const z of [-0.6, 0.6]) {
        const pole = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8)), steel);
        pole.position.set(x, 1.3, z);
        group.add(pole);
      }
    }

    const canopy = new THREE.Mesh(track(new THREE.PlaneGeometry(5, 3.4)), whiteCloth);
    canopy.rotation.x = -Math.PI / 2;
    canopy.position.y = 2.62;
    canopy.castShadow = high;
    group.add(canopy);

    return group;
  }

  function createWaterPoint() {
    const group = new THREE.Group();

    const tankGeometry = track(new THREE.CylinderGeometry(0.72, 0.72, 1.7, 20));
    const tankMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0x2f78a8, roughness: 0.5, metalness: 0.3 }));
    for (const offset of [-0.9, 0.9]) {
      const tank = new THREE.Mesh(tankGeometry, tankMaterial);
      tank.position.set(offset, 0.85, 0);
      tank.castShadow = high;
      group.add(tank);
    }

    const stand = new THREE.Mesh(track(new THREE.BoxGeometry(2.6, 0.9, 0.8)), steel);
    stand.position.set(0, 0.45, 1.6);
    group.add(stand);

    return group;
  }

  function createMedicalCamp() {
    const group = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(-1.9, 0);
    shape.lineTo(1.9, 0);
    shape.lineTo(0, 1.7);
    shape.closePath();
    const geometry = track(new THREE.ExtrudeGeometry(shape, { depth: 3.6, bevelEnabled: false }));
    geometry.translate(0, 0, -1.8);
    const tent = new THREE.Mesh(geometry, whiteCloth);
    tent.castShadow = high;
    tent.receiveShadow = high;
    group.add(tent);

    const cross = new THREE.Mesh(
      track(new THREE.PlaneGeometry(1.5, 1.5)),
      trackMaterial(
        new THREE.MeshStandardMaterial({ map: trackTexture(createCrossTexture()), side: THREE.DoubleSide, roughness: 0.9 })
      )
    );
    cross.position.set(-1.92, 0.75, 0);
    cross.rotation.y = -Math.PI / 2;
    group.add(cross);

    return group;
  }

  function createAmbulance() {
    const group = new THREE.Group();

    const bodyMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.5, metalness: 0.2 }));
    const body = new THREE.Mesh(track(new THREE.BoxGeometry(3.8, 1.5, 1.8)), bodyMaterial);
    body.position.y = 1.05;
    body.castShadow = high;
    group.add(body);

    const stripe = new THREE.Mesh(
      track(new THREE.BoxGeometry(3.85, 0.28, 1.85)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6, metalness: 0.05 }))
    );
    stripe.position.y = 0.95;
    group.add(stripe);

    const cab = new THREE.Mesh(track(new THREE.BoxGeometry(1.3, 1.1, 1.75)), bodyMaterial);
    cab.position.set(2.35, 0.85, 0);
    group.add(cab);

    const wheelGeometry = track(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14));
    const wheelMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: 0.9 }));
    for (const x of [-1.2, 1.1, 2.5]) {
      for (const z of [-0.85, 0.85]) {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, 0.34, z);
        group.add(wheel);
      }
    }

    const beacon = new THREE.Mesh(
      track(new THREE.BoxGeometry(0.9, 0.16, 0.4)),
      trackMaterial(new THREE.MeshStandardMaterial({ color: 0xd0503c, emissive: 0xd0503c, emissiveIntensity: 1.2 }))
    );
    beacon.position.set(1.6, 1.88, 0);
    group.add(beacon);

    return group;
  }

  function createBarricadeUnit() {
    const group = new THREE.Group();

    const postGeometry = track(new THREE.BoxGeometry(0.07, 1.1, 0.07));
    for (const x of [-1.15, 1.15]) {
      const post = new THREE.Mesh(postGeometry, steel);
      post.position.set(x, 0.55, 0);
      post.castShadow = high;
      group.add(post);
    }

    for (const y of [0.45, 0.95]) {
      const rail = new THREE.Mesh(track(new THREE.BoxGeometry(2.3, 0.06, 0.06)), steel);
      rail.position.set(0, y, 0);
      group.add(rail);
    }

    const diagonal = new THREE.Mesh(track(new THREE.BoxGeometry(2.4, 0.05, 0.05)), steel);
    diagonal.position.set(0, 0.7, 0);
    diagonal.rotation.z = 0.32;
    group.add(diagonal);

    const diagonal2 = diagonal.clone();
    diagonal2.rotation.z = -0.32;
    group.add(diagonal2);

    return group;
  }

  function createParliament() {
    const group = new THREE.Group();

    const plinthMaterial = trackMaterial(new THREE.MeshStandardMaterial({ color: 0xb9b3a6, roughness: 0.85 }));
    const plinth = new THREE.Mesh(track(new THREE.CylinderGeometry(15, 16, 1, 48)), plinthMaterial);
    plinth.position.y = 0.5;
    group.add(plinth);

    const colonnade = new THREE.Mesh(track(new THREE.CylinderGeometry(13, 13, 5.4, 48)), sandstoneLight);
    colonnade.position.y = 3.7;
    colonnade.castShadow = high;
    group.add(colonnade);

    const ring = new THREE.Mesh(track(new THREE.TorusGeometry(13.2, 0.5, 8, 64)), plinthMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 6.5;
    group.add(ring);

    const dome = new THREE.Mesh(track(new THREE.SphereGeometry(6.6, 36, 24)), whiteCloth);
    dome.position.y = 9.4;
    dome.scale.y = 0.82;
    dome.castShadow = high;
    group.add(dome);

    const spire = new THREE.Mesh(track(new THREE.CylinderGeometry(0.16, 0.22, 2.2, 10)), gold);
    spire.position.y = 15.4;
    group.add(spire);

    return group;
  }

  function createBanglaSahib() {
    const group = new THREE.Group();

    const hall = new THREE.Mesh(track(new THREE.BoxGeometry(9, 4.4, 7)), whiteCloth);
    hall.position.y = 2.2;
    hall.castShadow = high;
    group.add(hall);

    const dome = new THREE.Mesh(track(new THREE.SphereGeometry(2.6, 28, 18)), gold);
    dome.position.y = 5.6;
    dome.scale.y = 0.85;
    group.add(dome);

    const spire = new THREE.Mesh(track(new THREE.CylinderGeometry(0.12, 0.16, 1.6, 10)), gold);
    spire.position.y = 8;
    group.add(spire);

    const chhatriGeometry = track(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 16));
    const chhatriDomeGeometry = track(new THREE.SphereGeometry(0.9, 16, 12));
    for (const x of [-3.4, 3.4]) {
      const chhatri = new THREE.Mesh(chhatriGeometry, whiteCloth);
      chhatri.position.set(x, 4.9, -2.6);
      group.add(chhatri);
      const chhatriDome = new THREE.Mesh(chhatriDomeGeometry, gold);
      chhatriDome.position.set(x, 5.7, -2.6);
      chhatriDome.scale.y = 0.8;
      group.add(chhatriDome);
    }

    const pool = new THREE.Mesh(track(new THREE.CircleGeometry(5.4, 40)), waterMaterial);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.02, 6.6);
    group.add(pool);

    const poolRim = new THREE.Mesh(track(new THREE.TorusGeometry(5.4, 0.14, 8, 48)), whiteCloth);
    poolRim.rotation.x = Math.PI / 2;
    poolRim.position.set(0, 0.06, 6.6);
    group.add(poolRim);

    return group;
  }
}

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
