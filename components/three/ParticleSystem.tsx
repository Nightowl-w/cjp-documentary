'use client';

import { Points, BufferGeometry, BufferAttribute, ShaderMaterial, AdditiveBlending, Group, useFrame } from 'three';
import { useMemo, useRef } from 'react';
import { usePreferences } from '@/components/providers/PreferencesProvider';

interface ParticleSystemProps {
  scrollProgress: number;
  activeSection: number;
}

const particleVertexShader = `
  attribute float size;
  attribute float opacity;
  attribute vec3 customColor;
  attribute float particleType;
  varying float vOpacity;
  varying vec3 vColor;
  varying float vType;
  varying float vSize;
  void main() {
    vOpacity = opacity;
    vColor = customColor;
    vType = particleType;
    vSize = size;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying float vOpacity;
  varying vec3 vColor;
  varying float vType;
  varying float vSize;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = 0.0;
    if (vType == 0.0) {
      alpha = smoothstep(0.5, 0.0, dist);
    } else if (vType == 1.0) {
      alpha = smoothstep(0.5, 0.0, dist) * (1.0 - dist * 0.5);
    } else if (vType == 2.0) {
      alpha = exp(-dist * 8.0);
    }
    gl_FragColor = vec4(vColor, alpha * vOpacity);
    if (gl_FragColor.a < 0.01) discard;
  }
`;

export function ParticleSystem({ scrollProgress, activeSection }: ParticleSystemProps) {
  const { reducedMotion } = usePreferences();
  const pointsRef = useRef<Points>(null);
  const geometryRef = useRef<BufferGeometry>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const timeRef = useRef(0);

  const particleCount = useMemo(() => reducedMotion ? 0 : 2000, [reducedMotion]);

  const { positions, sizes, opacities, colors, types } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const siz = new Float32Array(particleCount);
    const opa = new Float32Array(particleCount);
    const col = new Float32Array(particleCount * 3);
    const typ = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const typeChoice = Math.random();
      let x, y, z, size, opacity, r, g, b, type;

      if (typeChoice < 0.4) {
        type = 0;
        const radius = 15 + Math.random() * 25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.cos(phi) + 10;
        z = radius * Math.sin(phi) * Math.sin(theta);
        size = 0.5 + Math.random() * 1.5;
        opacity = 0.1 + Math.random() * 0.3;
        r = 0.9; g = 0.75; b = 0.3;
      } else if (typeChoice < 0.7) {
        type = 1;
        x = (Math.random() - 0.5) * 60;
        y = Math.random() * 30 + 5;
        z = (Math.random() - 0.5) * 60;
        size = 0.3 + Math.random() * 0.8;
        opacity = 0.05 + Math.random() * 0.2;
        r = 0.95; g = 0.9; b = 0.7;
      } else {
        type = 2;
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 12;
        x = Math.cos(angle) * radius;
        y = 4 + Math.random() * 8;
        z = Math.sin(angle) * radius;
        size = 0.2 + Math.random() * 0.5;
        opacity = 0.2 + Math.random() * 0.4;
        r = 0.8; g = 0.3; b = 0.2;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      siz[i] = size;
      opa[i] = opacity;
      col[i * 3] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = b;
      typ[i] = type;
    }

    return { positions: pos, sizes: siz, opacities: opa, colors: col, types: typ };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (reducedMotion || !pointsRef.current) return;

    timeRef.current += delta;
    const positions = geometryRef.current?.getAttribute('position');
    if (!positions) return;

    const scrollInfluence = scrollProgress * 0.5;
    const sectionInfluence = activeSection * 0.2;

    for (let i = 0; i < particleCount; i++) {
      const type = types[i];
      const y = positions.getY(i);
      const baseY = positions.array[i * 3 + 1];

      if (type === 0) {
        positions.setY(i, baseY + Math.sin(timeRef.current * 0.3 + i * 0.1) * 0.5);
        positions.setX(i, positions.getX(i) + Math.sin(timeRef.current * 0.2 + i) * 0.01);
        positions.setZ(i, positions.getZ(i) + Math.cos(timeRef.current * 0.2 + i) * 0.01);
      } else if (type === 1) {
        positions.setY(i, y - delta * (0.5 + scrollInfluence));
        if (y < -5) {
          positions.setY(i, 35);
          positions.setX(i, (Math.random() - 0.5) * 60);
          positions.setZ(i, (Math.random() - 0.5) * 60);
        }
        positions.setX(i, positions.getX(i) + Math.sin(timeRef.current + i) * 0.02);
      } else if (type === 2) {
        const angle = timeRef.current * 0.5 + i * 0.2;
        const radius = 8 + Math.sin(timeRef.current * 0.3 + i) * 4;
        positions.setX(i, Math.cos(angle) * radius);
        positions.setZ(i, Math.sin(angle) * radius);
        positions.setY(i, baseY + Math.sin(timeRef.current * 2 + i) * 0.3);
      }
    }

    positions.needsUpdate = true;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress;
      materialRef.current.uniforms.uActiveSection.value = activeSection;
    }
  });

  if (reducedMotion || particleCount === 0) return null;

  return (
    <Group>
      <Points
        ref={pointsRef}
        onPointerMissed={(e) => e.stopPropagation()}
      >
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-size" array={sizes} itemSize={1} />
          <bufferAttribute attach="attributes-opacity" array={opacities} itemSize={1} />
          <bufferAttribute attach="attributes-customColor" array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-particleType" array={types} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={particleVertexShader}
          fragmentShader={particleFragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          uniforms={{
            uTime: { value: 0 },
            uScrollProgress: { value: 0 },
            uActiveSection: { value: 0 },
          }}
        />
      </Points>
    </Group>
  );
}