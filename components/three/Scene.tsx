'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { JantarMantar } from './JantarMantar';
import { ParticleSystem } from './ParticleSystem';
import { TimelinePath } from './TimelinePath';
import { usePreferences } from '@/components/providers/PreferencesProvider';

interface SceneProps {
  scrollProgress: number;
  activeSection: number;
}

export function Scene({ scrollProgress, activeSection }: SceneProps) {
  const { reducedMotion } = usePreferences();
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const targetY = 15 + scrollProgress * 40;
    camera.position.y += (targetY - camera.position.y) * 0.05;

    const targetZ = 30 - scrollProgress * 20;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    camera.lookAt(0, 5, 0);
  });

  return (
    <Canvas
      className="canvas-container"
      camera={{ position: [0, 15, 30], fov: 50 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
      shadows={!reducedMotion}
      dpr={[1, 2]}
    >
      <Suspense fallback={<LoadingFallback />}>
        <primitive object={new THREE.Color(0x0a0a0b)} attach="background" />
        <ambientLight intensity={0.3 + scrollProgress * 0.2} color="#1a1a2e" />
        <directionalLight
          position={[30, 50, 20]}
          intensity={2}
          color="#fff8e7"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-20, 30, -15]}
          intensity={1 + scrollProgress * 0.5}
          color="#d4a843"
          castShadow
        />
        <pointLight position={[0, 25, 0]} intensity={1.5} color="#ff6b35" distance={60} decay={2} />
        <hemisphereLight groundColor="#0a0a0b" color="#2a1a0a" intensity={0.5} />

        <JantarMantar scrollProgress={scrollProgress} activeSection={activeSection} />
        <ParticleSystem scrollProgress={scrollProgress} activeSection={activeSection} />
        <TimelinePath scrollProgress={scrollProgress} activeSection={activeSection} />
      </Suspense>
    </Canvas>
  );
}

function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-mono text-sm">Loading documentary...</p>
      </div>
    </div>
  );
}

// Lights and 3D components are provided by R3F's JSX namespace