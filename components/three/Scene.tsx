'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePreferences } from '@/components/providers/PreferencesProvider';

interface SceneProps {
  scrollProgress: number;
  activeSection: number;
}

const NODE_COLORS = [0xd4a843, 0xd4a843, 0xd4a843, 0xb91c1c, 0x2dd4bf, 0x818cf8, 0xd4a843];

const NODE_POSITIONS: [number, number, number][] = [
  [-26, 15, 14],
  [-16, 19, 8],
  [-6, 22, 2],
  [4, 24, -2],
  [14, 21, 4],
  [24, 18, 10],
  [32, 14, 16],
];

/**
 * Fixed, full-viewport background scene built with plain Three.js.
 * No react-three-fiber / reconciler, so there is no dependency on
 * React internals (the previous `ReactCurrentBatchConfig` crash).
 */
export function Scene({ scrollProgress, activeSection }: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const sectionRef = useRef(0);
  const { reducedMotion } = usePreferences();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    sectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      console.error('[scene] WebGL is unavailable', error);
      setFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070a, 0.008);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    camera.position.set(0, 16, 38);
    camera.lookAt(0, 9, 0);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    /* ---------------------------------- lights --------------------------------- */

    scene.add(new THREE.HemisphereLight(0x3b3b62, 0x0a0a0c, 1.55));

    const sun = new THREE.DirectionalLight(0xfff1cf, 3.2);
    sun.position.set(26, 44, 20);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0xd4a843, 2.7);
    rim.position.set(-30, 20, -24);
    scene.add(rim);

    const ember = new THREE.PointLight(0xff6b35, 55, 90, 2);
    ember.position.set(0, 16, 12);
    scene.add(ember);

    /* --------------------------------- materials ------------------------------- */

    const stone = new THREE.MeshStandardMaterial({
      color: 0x2b2b35,
      roughness: 0.88,
      metalness: 0.18,
    });
    const stoneLight = new THREE.MeshStandardMaterial({
      color: 0x3c3c48,
      roughness: 0.8,
      metalness: 0.24,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.32,
      metalness: 0.85,
      emissive: 0x2a1a04,
      emissiveIntensity: 0.55,
    });
    const crimson = new THREE.MeshStandardMaterial({
      color: 0x9f1d1d,
      roughness: 0.62,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });

    /* ---------------------------------- ground --------------------------------- */

    const world = new THREE.Group();
    scene.add(world);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(64, 96),
      new THREE.MeshStandardMaterial({ color: 0x0b0b0f, roughness: 0.95, metalness: 0.06 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.06;
    world.add(ground);

    for (const radius of [18, 29, 42]) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius, radius + 0.07, 128),
        new THREE.MeshBasicMaterial({
          color: 0xd4a843,
          transparent: true,
          opacity: radius === 29 ? 0.22 : 0.12,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.015;
      world.add(ring);
    }

    /* -------------------------------- monuments -------------------------------- */

    const samrat = createSamratYantra(stone, gold);
    samrat.position.set(-15, 0, -12);
    world.add(samrat);

    const jaiPrakash = createJaiPrakash(stone, stoneLight, gold);
    jaiPrakash.position.set(14, 0, -13);
    world.add(jaiPrakash);

    const ramYantra = createRamYantra(stone, stoneLight, gold);
    ramYantra.position.set(-14, 0, 11);
    world.add(ramYantra);

    const misraYantra = createMisraYantra(stone, stoneLight, gold);
    misraYantra.position.set(14, 0, 12);
    world.add(misraYantra);

    /* ---------------------------------- banners -------------------------------- */

    const bannerGroup = new THREE.Group();
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 33;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 9, 6), gold);
      pole.position.set(Math.cos(angle) * radius, 4.5, Math.sin(angle) * radius);

      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 1.5),
        i % 3 === 0 ? crimson : gold
      );
      flag.position.set(
        Math.cos(angle) * radius + Math.cos(angle) * 1.2,
        8.1,
        Math.sin(angle) * radius + Math.sin(angle) * 1.2
      );
      flag.rotation.y = -angle;

      bannerGroup.add(pole, flag);
    }
    world.add(bannerGroup);

    /* --------------------------------- particles ------------------------------- */

    const particleCount = reducedMotion ? 700 : 1800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const goldColor = new THREE.Color(0xd4a843);
    const whiteColor = new THREE.Color(0xfff6df);
    const crimsonColor = new THREE.Color(0xb91c1c);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 7 + Math.random() * 44;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.5 + Math.random() * 38;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const pick = Math.random();
      color.copy(pick < 0.6 ? goldColor : pick < 0.86 ? whiteColor : crimsonColor);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      speeds[i] = 0.25 + Math.random() * 0.7;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.24,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    /* ------------------------------- timeline arc ------------------------------ */

    const curve = new THREE.CatmullRomCurve3(
      NODE_POSITIONS.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    );

    const timeline = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 160, 0.055, 6, false),
      new THREE.MeshBasicMaterial({
        color: 0xd4a843,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(timeline);

    const glowTexture = createGlowTexture();
    const nodeSprites: THREE.Sprite[] = [];

    NODE_POSITIONS.forEach(([x, y, z], index) => {
      const nodeColor = NODE_COLORS[index % NODE_COLORS.length];

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshBasicMaterial({ color: nodeColor })
      );
      core.position.set(x, y, z);
      scene.add(core);

      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: nodeColor,
          transparent: true,
          opacity: 0.3,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      sprite.position.set(x, y, z);
      sprite.scale.setScalar(2.8);
      scene.add(sprite);
      nodeSprites.push(sprite);
    });

    /* ---------------------------------- resize --------------------------------- */

    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, true);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener('resize', resize);

    /* ----------------------------------- loop ---------------------------------- */

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const renderFrame = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
      const active = sectionRef.current;

      const targetY = 16 + progress * 30;
      const targetZ = 38 - progress * 18;

      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.4, delta);
      camera.position.x = Math.sin(progress * Math.PI * 0.85) * 5;
      camera.lookAt(0, 9 + progress * 4, 0);

      world.rotation.y = 0.1 + progress * 0.5;
      particles.rotation.y = elapsed * 0.014;
      bannerGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.02;

      const attribute = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i += 1) {
        let y = attribute.getY(i) + speeds[i] * delta;
        if (y > 39) y = 0.4;
        attribute.setY(i, y);
      }
      attribute.needsUpdate = true;

      const activeIndex = Math.round(active * (nodeSprites.length - 1));
      nodeSprites.forEach((sprite, index) => {
        const isActive = index === activeIndex;
        const scale = 2.6 + Math.sin(elapsed * 1.8 + index * 0.7) * 0.3 + (isActive ? 1.3 : 0);
        sprite.scale.setScalar(scale);
        (sprite.material as THREE.SpriteMaterial).opacity = isActive ? 0.85 : 0.24;
      });

      renderer.render(scene, camera);
    };

    const loop = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(loop);
      if (document.hidden) return;
      renderFrame();
    };

    if (reducedMotion) {
      renderer.render(scene, camera);
    } else {
      loop();
    }

    /* --------------------------------- cleanup --------------------------------- */

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost);

      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();

        const material = (mesh as THREE.Mesh).material as
          | THREE.Material
          | THREE.Material[]
          | undefined;

        if (Array.isArray(material)) {
          material.forEach((entry) => entry.dispose());
        } else if (material) {
          material.dispose();
        }
      });

      glowTexture.dispose();
      renderer.dispose();

      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 94%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 94%)',
      }}
    >
      {failed && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(212,168,67,0.16),transparent_62%)]" />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Monuments                                 */
/* -------------------------------------------------------------------------- */

function createSamratYantra(stone: THREE.Material, gold: THREE.Material) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 8, 0.5, 48), stone);
  base.position.y = 0.25;
  group.add(base);

  // Triangular gnomon (the giant sundial wall)
  const shape = new THREE.Shape();
  shape.moveTo(-7, 0);
  shape.lineTo(7, 0);
  shape.lineTo(0, 26);
  shape.closePath();

  const prismGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.5,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.1,
    bevelThickness: 0.1,
  });
  prismGeometry.translate(0, 0, -0.75);

  const prism = new THREE.Mesh(prismGeometry, stone);
  prism.position.y = 0.5;
  group.add(prism);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(prismGeometry),
    new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.6 })
  );
  edges.position.y = 0.5;
  group.add(edges);

  // Quarter-circle rails tracing the sun's path
  const arcGeometry = new THREE.TorusGeometry(12.5, 0.09, 8, 64, Math.PI / 2);
  [-1.2, 1.2].forEach((z) => {
    const arc = new THREE.Mesh(arcGeometry, gold);
    arc.position.set(0, 0.5, z);
    group.add(arc);
  });

  for (let i = 1; i < 6; i += 1) {
    const angle = (i / 6) * (Math.PI / 2);
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.07, 0.07), gold);
    tick.position.set(Math.cos(angle) * 12.5, 0.5 + Math.sin(angle) * 12.5, 1.2);
    tick.rotation.z = angle;
    group.add(tick);
  }

  const crown = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), gold);
  crown.position.y = 26.9;
  group.add(crown);

  return group;
}

function createJaiPrakash(stone: THREE.Material, stoneLight: THREE.Material, gold: THREE.Material) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(7, 7.6, 0.6, 48), stoneLight);
  base.position.y = 0.3;
  group.add(base);

  const bowlGeometry = new THREE.SphereGeometry(6, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowl = new THREE.Mesh(
    bowlGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x1c1c23,
      roughness: 0.8,
      metalness: 0.25,
      side: THREE.DoubleSide,
    })
  );
  bowl.rotation.x = Math.PI;
  bowl.position.y = 6.6;
  group.add(bowl);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(6, 0.09, 8, 72), gold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 6.6;
  group.add(rim);

  // Cross-hair sightlines inside the bowl
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xd4a843,
    transparent: true,
    opacity: 0.35,
  });
  for (let i = 0; i < 8; i += 1) {
    const angle = (i / 8) * Math.PI * 2;
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.7, 0),
        new THREE.Vector3(Math.cos(angle) * 6, 6.5, Math.sin(angle) * 6),
      ]),
      lineMaterial
    );
    group.add(line);
  }

  const centre = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), gold);
  centre.position.y = 1.2;
  group.add(centre);

  return group;
}

function createRamYantra(stone: THREE.Material, stoneLight: THREE.Material, gold: THREE.Material) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 7, 0.5, 48), stoneLight);
  base.position.y = 0.25;
  group.add(base);

  const outer = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 4, 48, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x1b1b22,
      roughness: 0.85,
      metalness: 0.2,
      side: THREE.DoubleSide,
    })
  );
  outer.position.y = 2.5;
  group.add(outer);

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.4, 4, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x22222a,
      roughness: 0.85,
      metalness: 0.2,
      side: THREE.DoubleSide,
    })
  );
  inner.position.y = 2.5;
  group.add(inner);

  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4, 2.6), stone);
    wall.position.set(Math.cos(angle) * 4.7, 2.5, Math.sin(angle) * 4.7);
    wall.rotation.y = Math.PI / 2 - angle;
    group.add(wall);
  }

  [6, 3.4].forEach((radius) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.08, 8, 64), gold);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 4.5;
    group.add(rim);
  });

  return group;
}

function createMisraYantra(stone: THREE.Material, stoneLight: THREE.Material, gold: THREE.Material) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 6, 1, 48), stoneLight);
  base.position.y = 0.5;
  group.add(base);

  const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 15, 1.4), stone);
  pillar.position.y = 8;
  group.add(pillar);

  const pillarEdge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 15.1, 0.12), gold);
  pillarEdge.position.set(0, 8, 0.72);
  group.add(pillarEdge);

  [5.5, 8.5, 11.5].forEach((height, index) => {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(3.4 - index * 0.5, 3.4 - index * 0.5, 0.18, 48), stoneLight);
    disc.position.y = height;
    group.add(disc);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4 - index * 0.5, 0.06, 8, 64), gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    group.add(ring);
  });

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 20), gold);
  cap.position.y = 15.8;
  group.add(cap);

  for (let i = 0; i < 4; i += 1) {
    const angle = (i / 4) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.1, 0.1), gold);
    arm.position.set(0, 8.5, 0);
    arm.rotation.y = angle;
    group.add(arm);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), gold);
    tip.position.set(Math.cos(angle) * 3, 8.5, -Math.sin(angle) * 3);
    group.add(tip);
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

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
