'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/drei';
import { useMemo, Suspense, useEffect } from 'react';
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
  const { camera, scene } = useThree();

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const targetY = 15 + scrollProgress * 40;
    camera.position.y += (targetY - camera.position.y) * 0.05;

    const targetZ = 30 - scrollProgress * 20;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    camera.lookAt(0, 5, 0);
  });

  const composerProps = useMemo(() => ({
    multisampling: 0,
    renderPriority: 1,
  }), []);

  return (
    <Canvas
      className="canvas-container"
      camera={{ position: [0, 15, 30], fov: 50 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
      shadows={!reducedMotion}
      dpr={[1, 2]}
    >
      <Suspense fallback={<LoadingFallback />}>
        <ColorAttachments />
        <scene.environment={null}>
          <JantarMantar scrollProgress={scrollProgress} activeSection={activeSection} />
          <ParticleSystem scrollProgress={scrollProgress} activeSection={activeSection} />
          <TimelinePath scrollProgress={scrollProgress} activeSection={activeSection} />
          <LightingRig scrollProgress={scrollProgress} activeSection={activeSection} />
        </scene.environment>
      </Suspense>

      {!reducedMotion && (
        <EffectComposer multisampling={0} renderPriority={1}>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.5}
            mipmapBlur={true}
          />
          <Vignette eskil={false} offset={0.3} darkness={1.2} />
          <Noise opacity={0.02} size={256} />
          <DepthOfField
            focusDistance={25}
            focalLength={50}
            bokehScale={2}
            height={480}
          />
        </EffectComposer>
      )}
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

function ColorAttachments() {
  return <primitive object={new THREE.Color(0x0a0a0b)} attach="background" />;
}

function LightingRig({ scrollProgress, activeSection }: { scrollProgress: number; activeSection: number }) {
  const time = useThree(state => state.clock.getElapsedTime());

  useFrame(() => {
    if (activeSection === 0) return;
  });

  return (
    <>
      <ambientLight intensity={0.3 + scrollProgress * 0.2} color="#1a1a2e" />
      <directionalLight
        position={[30, 50, 20]}
        intensity={2 + Math.sin(time * 0.5) * 0.3}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
      />
      <directionalLight
        position={[-20, 30, -15]}
        intensity={1 + scrollProgress * 0.5}
        color="#d4a843"
        castShadow
      />
      <pointLight position={[0, 25, 0]} intensity={1.5} color="#ff6b35" distance={60} decay={2} />
      <hemisphereLight groundColor="#0a0a0b" skyColor="#2a1a0a" intensity={0.5} />
    </>
  );
}