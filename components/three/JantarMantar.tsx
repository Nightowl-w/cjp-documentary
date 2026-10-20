'use client';

import { Group, Mesh, CylinderGeometry, ConeGeometry, SphereGeometry, BoxGeometry, TubeGeometry, CatmullRomCurve3, Vector3, MeshStandardMaterial, MeshPhysicalMaterial, DoubleSide } from 'three';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { usePreferences } from '@/components/providers/PreferencesProvider';

interface JantarMantarProps {
  scrollProgress: number;
  activeSection: number;
}

export function JantarMantar({ scrollProgress, activeSection }: JantarMantarProps) {
  const { reducedMotion } = usePreferences();
  const groupRef = useRef<Group>(null);
  const instrumentsRef = useRef<Mesh[]>([]);

  const samratYantra = useMemo(() => createSamratYantra(), []);
  const jaiPrakash = useMemo(() => createJaiPrakash(), []);
  const ramYantra = useMemo(() => createRamYantra(), []);
  const misraYantra = useMemo(() => createMisraYantra(), []);
  const ground = useMemo(() => createGround(), []);

  useFrame((state, delta) => {
    if (reducedMotion || !groupRef.current) return;

    const t = state.clock.getElapsedTime();

    groupRef.current.rotation.y = scrollProgress * Math.PI * 0.5;

    instrumentsRef.current.forEach((mesh, i) => {
      if (mesh.userData.float) {
        mesh.position.y = mesh.userData.baseY + Math.sin(t * mesh.userData.floatSpeed + i) * mesh.userData.floatAmount;
      }
      if (mesh.userData.rotate) {
        mesh.rotation.y += mesh.userData.rotateSpeed * delta;
      }
      if (mesh.userData.pulse) {
        const scale = 1 + Math.sin(t * mesh.userData.pulseSpeed) * mesh.userData.pulseAmount;
        mesh.scale.setScalar(scale);
      }
    });

    if (activeSection === 4) {
      groupRef.current.position.y = -5 + scrollProgress * 5;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <group position={[-15, 0, -10]}>{samratYantra as any}</group>
      <group position={[15, 0, -10]}>{jaiPrakash as any}</group>
      <group position={[-15, 0, 15]}>{ramYantra as any}</group>
      <group position={[15, 0, 15]}>{misraYantra as any}</group>
      <group position={[0, -0.25, 0]}>{ground as any}</group>
    </group>
  );
}

function createSamratYantra() {
  const group = new Group();
  const materials = {
    stone: new MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
    }),
    gold: new MeshPhysicalMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    }),
    accent: new MeshPhysicalMaterial({
      color: 0xb91c1c,
      roughness: 0.4,
      metalness: 0.6,
    }),
  };

  const gnomon = new Mesh(
    new BoxGeometry(1, 25, 1),
    materials.stone
  );
  gnomon.position.y = 12.5;
  gnomon.userData = { float: true, floatSpeed: 0.5, floatAmount: 0.1, baseY: 12.5 };
  group.add(gnomon);

  const gnomonEdge = new Mesh(
    new BoxGeometry(0.15, 25, 0.15),
    materials.gold
  );
  gnomonEdge.position.y = 12.5;
  group.add(gnomonEdge);

  const quadrant = new Mesh(
    new CylinderGeometry(12, 12, 0.5, 32, 1, true, 0, Math.PI),
    materials.stone
  );
  quadrant.rotation.x = -Math.PI / 2;
  quadrant.position.y = 0.25;
  group.add(quadrant);

  const quadrantEdge = new Mesh(
    new CylinderGeometry(12.1, 12.1, 0.6, 32, 1, true, 0, Math.PI),
    materials.gold
  );
  quadrantEdge.rotation.x = -Math.PI / 2;
  quadrantEdge.position.y = 0.2;
  group.add(quadrantEdge);

  for (let i = 0; i < 12; i++) {
    const hourLine = new Mesh(
      new BoxGeometry(0.08, 0.1, 12),
      materials.gold
    );
    hourLine.position.set(
      Math.sin((i / 12) * Math.PI) * 6,
      0.3,
      Math.cos((i / 12) * Math.PI) * 6
    );
    hourLine.rotation.y = (i / 12) * Math.PI;
    group.add(hourLine);
  }

  const shadow = new Mesh(
    new BoxGeometry(0.3, 0.02, 15),
    new MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
  );
  shadow.position.set(0, 0.26, -7.5);
  shadow.rotation.x = -Math.PI / 4;
  shadow.userData = { rotate: true, rotateSpeed: 0.02 };
  group.add(shadow);

  const base = new Mesh(
    new CylinderGeometry(14, 16, 2, 32),
    materials.stone
  );
  base.position.y = -1;
  group.add(base);

  return group;
}

function createJaiPrakash() {
  const group = new Group();
  const materials = {
    stone: new MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
    }),
    gold: new MeshPhysicalMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      side: DoubleSide,
    }),
    glass: new MeshPhysicalMaterial({
      color: 0xd4a843,
      roughness: 0.1,
      metalness: 0.9,
      transmission: 0.3,
      thickness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0,
      side: DoubleSide,
    }),
  };

  const bowl = new Mesh(
    new SphereGeometry(8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.glass
  );
  bowl.position.y = 4;
  bowl.userData = { float: true, floatSpeed: 0.3, floatAmount: 0.15, baseY: 4, pulse: true, pulseSpeed: 1, pulseAmount: 0.02 };
  group.add(bowl);

  const bowlInner = new Mesh(
    new SphereGeometry(7.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    materials.gold
  );
  bowlInner.position.y = 4;
  group.add(bowlInner);

  const crosswire1 = new Mesh(
    new CylinderGeometry(0.05, 0.05, 16, 8),
    materials.gold
  );
  crosswire1.position.y = 4;
  group.add(crosswire1);

  const crosswire2 = new Mesh(
    new CylinderGeometry(0.05, 0.05, 16, 8),
    materials.gold
  );
  crosswire2.position.y = 4;
  crosswire2.rotation.z = Math.PI / 2;
  group.add(crosswire2);

  const crosswire3 = new Mesh(
    new CylinderGeometry(0.05, 0.05, 16, 8),
    materials.gold
  );
  crosswire3.position.y = 4;
  crosswire3.rotation.x = Math.PI / 2;
  group.add(crosswire3);

  const rings = 6;
  for (let r = 1; r <= rings; r++) {
    const ring = new Mesh(
      new CylinderGeometry(8 * (r / rings), 8 * (r / rings), 0.1, 64, 1, true),
      materials.gold
    );
    ring.position.y = 4 * (r / rings);
    ring.userData = { rotate: true, rotateSpeed: 0.01 * (r % 2 === 0 ? 1 : -1) };
    group.add(ring);
  }

  const base = new Mesh(
    new CylinderGeometry(10, 12, 3, 32),
    materials.stone
  );
  base.position.y = -1.5;
  group.add(base);

  const particles = new Group();
  for (let i = 0; i < 50; i++) {
    const particle = new Mesh(
      new SphereGeometry(0.05, 8, 8),
      materials.gold
    );
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI / 2;
    const radius = 8 + Math.random() * 2;
    particle.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      4 + radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    particle.userData = {
      float: true,
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatAmount: 0.3 + Math.random() * 0.3,
      baseY: particle.position.y,
      rotate: true,
      rotateSpeed: (Math.random() - 0.5) * 0.02,
    };
    particles.add(particle);
  }
  group.add(particles);

  return group;
}

function createRamYantra() {
  const group = new Group();
  const materials = {
    stone: new MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
    }),
    gold: new MeshPhysicalMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    }),
  };

  const pillars = 12;
  for (let i = 0; i < pillars; i++) {
    const angle = (i / pillars) * Math.PI * 2;
    const radius = 6;

    const pillar = new Mesh(
      new CylinderGeometry(0.4, 0.5, 12, 8),
      materials.stone
    );
    pillar.position.set(
      Math.cos(angle) * radius,
      6,
      Math.sin(angle) * radius
    );
    pillar.userData = {
      float: true,
      floatSpeed: 0.4,
      floatAmount: 0.05,
      baseY: 6,
      rotate: true,
      rotateSpeed: 0.005,
    };
    group.add(pillar);

    const capital = new Mesh(
      new CylinderGeometry(0.6, 0.4, 0.8, 8),
      materials.gold
    );
    capital.position.set(
      Math.cos(angle) * radius,
      12.4,
      Math.sin(angle) * radius
    );
    group.add(capital);
  }

  const upperRing = new Mesh(
    new CylinderGeometry(6.2, 6.2, 0.3, 32),
    materials.gold
  );
  upperRing.position.y = 12.8;
  upperRing.userData = { rotate: true, rotateSpeed: -0.008 };
  group.add(upperRing);

  const lowerRing = new Mesh(
    new CylinderGeometry(6.2, 6.2, 0.3, 32),
    materials.gold
  );
  lowerRing.position.y = 0.3;
  group.add(lowerRing);

  const centerPillar = new Mesh(
    new CylinderGeometry(0.3, 0.3, 13, 16),
    materials.gold
  );
  centerPillar.position.y = 6.5;
  group.add(centerPillar);

  const base = new Mesh(
    new CylinderGeometry(8, 9, 2, 32),
    materials.stone
  );
  base.position.y = -1;
  group.add(base);

  return group;
}

function createMisraYantra() {
  const group = new Group();
  const materials = {
    stone: new MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
    }),
    gold: new MeshPhysicalMaterial({
      color: 0xd4a843,
      roughness: 0.3,
      metalness: 0.8,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
    }),
    crimson: new MeshPhysicalMaterial({
      color: 0xb91c1c,
      roughness: 0.4,
      metalness: 0.6,
    }),
  };

  const pillars = 5;
  for (let i = 0; i < pillars; i++) {
    const x = (i - 2) * 3;

    const pillar = new Mesh(
      new BoxGeometry(0.8, 18, 0.8),
      materials.stone
    );
    pillar.position.set(x, 9, 0);
    pillar.userData = {
      float: true,
      floatSpeed: 0.3 + i * 0.1,
      floatAmount: 0.08,
      baseY: 9,
    };
    group.add(pillar);

    const cap = new Mesh(
      new BoxGeometry(1, 1, 1),
      materials.gold
    );
    cap.position.set(x, 18.5, 0);
    group.add(cap);

    if (i === 2) {
      const indicator = new Mesh(
        new ConeGeometry(0.5, 2, 8),
        materials.crimson
      );
      indicator.position.set(x, 20, 0);
      indicator.userData = { pulse: true, pulseSpeed: 2, pulseAmount: 0.1 };
      group.add(indicator);
    }
  }

  const crossBeam = new Mesh(
    new BoxGeometry(14, 0.6, 0.6),
    materials.gold
  );
  crossBeam.position.y = 18.8;
  group.add(crossBeam);

  const base = new Mesh(
    new BoxGeometry(16, 2, 10),
    materials.stone
  );
  base.position.y = -1;
  group.add(base);

  return group;
}

function createGround() {
  const geometry = new CylinderGeometry(50, 50, 0.5, 64);
  const material = new MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 1,
    metalness: 0,
  });
  const ground = new Mesh(geometry, material);
  ground.position.y = -0.25;
  ground.receiveShadow = true;
  return ground;
}