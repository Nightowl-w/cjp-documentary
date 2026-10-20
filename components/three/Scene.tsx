'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { JantarMantar } from './JantarMantar';
import { ParticleSystem } from './ParticleSystem';
import { TimelinePath } from './TimelinePath';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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
    <div className="canvas-container relative w-full h-[600px] min-h-[600px]">
      <ErrorBoundary fallback={
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">3D Scene</h3>
            <p className="text-muted-foreground text-sm">WebGL not supported or failed to load.</p>
          </div>
        </div>
      }>
        <Canvas
          className="absolute inset-0"
          camera={{ position: [0, 15, 30], fov: 50 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' }}
          shadows={!reducedMotion}
          dpr={[1, 2]}
        >
          <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-black/50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold" /></div>}>
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
      </ErrorBoundary>
    </div>
  );
}