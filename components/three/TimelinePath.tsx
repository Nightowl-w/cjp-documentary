'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { usePreferences } from '@/components/providers/PreferencesProvider';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  position: number;
  type: 'protest' | 'legal' | 'violence' | 'solidarity' | 'statement';
}

const timelineEvents: TimelineEvent[] = [
  {
    id: 'start',
    date: '2024-01-15',
    title: 'CJP Announces Protest',
    description: 'Citizens for Justice and Peace calls for peaceful demonstration at Jantar Mantar demanding accountability for communal violence.',
    position: 0,
    type: 'statement',
  },
  {
    id: 'gathering',
    date: '2024-01-22',
    title: 'Protesters Gather',
    description: 'Hundreds assemble at Jantar Mantar. Speeches by activists, lawyers, and survivors. Police presence heavy but initially restrained.',
    position: 0.15,
    type: 'protest',
  },
  {
    id: 'speeches',
    date: '2024-01-22',
    title: 'Key Speeches Delivered',
    description: 'Teesta Setalvad, Harsh Mander, and others address the crowd. Demands for FIR registration, independent inquiry, compensation.',
    position: 0.25,
    type: 'protest',
  },
  {
    id: 'police-action',
    date: '2024-01-23',
    title: 'Police Action & Detentions',
    description: 'Late night police crackdown. Protesters detained, tents removed, sound systems seized. Legal team files habeas corpus petitions.',
    position: 0.4,
    type: 'violence',
  },
  {
    id: 'court-hearing',
    date: '2024-01-25',
    title: 'Delhi High Court Hearing',
    description: 'Court questions police action, demands status report on detentions. Interim relief granted for release of protesters.',
    position: 0.55,
    type: 'legal',
  },
  {
    id: 'solidarity',
    date: '2024-01-28',
    title: 'National Solidarity Protests',
    description: 'Sympathy protests across 20+ cities. Student unions, civil society groups, opposition parties join demand for justice.',
    position: 0.7,
    type: 'solidarity',
  },
  {
    id: 'ongoing',
    date: '2024-02-15',
    title: 'Struggle Continues',
    description: 'Legal battles continue. CJP files PIL for independent SIT. Protesters vow to return. Documentation and advocacy ongoing.',
    position: 1,
    type: 'statement',
  },
];

const typeColors: Record<string, number> = {
  protest: 0xd4a843,
  legal: 0x0d9488,
  violence: 0xb91c1c,
  solidarity: 0x6366f1,
  statement: 0xa1a1aa,
};

const typeLabels: Record<string, string> = {
  protest: 'PROTEST',
  legal: 'LEGAL',
  violence: 'CRACKDOWN',
  solidarity: 'SOLIDARITY',
  statement: 'STATEMENT',
};

interface TimelinePathProps {
  scrollProgress: number;
  activeSection: number;
}

export function TimelinePath({ scrollProgress, activeSection }: TimelinePathProps) {
  const { reducedMotion } = usePreferences();
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const eventMeshesRef = useRef<THREE.Mesh[]>([]);
  const progressRef = useRef(0);

  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(-25, 8, -10),
      new THREE.Vector3(-10, 12, -5),
      new THREE.Vector3(0, 15, 0),
      new THREE.Vector3(10, 12, 5),
      new THREE.Vector3(25, 8, 10),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    curve.closed = false;
    curveRef.current = curve;
    return curve;
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    progressRef.current = scrollProgress;
  }, [scrollProgress, reducedMotion]);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    eventMeshesRef.current.forEach((mesh, i) => {
      const event = timelineEvents[i];
      const eventProgress = event.position;
      const distance = Math.abs(progressRef.current - eventProgress);

      if (distance < 0.15) {
        const intensity = 1 - distance / 0.15;
        mesh.scale.setScalar(1 + intensity * 0.5);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * 0.5;
      } else {
        mesh.scale.setScalar(1);
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }

      mesh.rotation.y += delta * 0.2;
    });
  });

  if (reducedMotion) return null;

  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 100, 0.15, 8, false), [curve]);
  const tubeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xd4a843,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  }), []);

  const eventPoints = useMemo(() => {
    return timelineEvents.map(event => {
      const point = curve.getPoint(event.position);
      return { ...event, point };
    });
  }, [curve]);

  return (
    <group>
      <mesh geometry={tubeGeometry} material={tubeMaterial} />

      {eventPoints.map(({ point, id, type, title, date }) => {
        const meshIndex = timelineEvents.findIndex(e => e.id === id);
        return (
          <group key={id} position={[point.x, point.y, point.z]}>
            <mesh
              ref={el => { if (el) eventMeshesRef.current[meshIndex] = el; }}
              geometry={new THREE.SphereGeometry(0.4, 16, 16)}
              material={new THREE.MeshStandardMaterial({
                color: typeColors[type],
                emissive: typeColors[type],
                emissiveIntensity: 0,
                metalness: 0.5,
                roughness: 0.3,
              })}
            />
            {/* Particle glow around each event node */}
            <points
              geometry={new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)])}
              material={new THREE.PointsMaterial({
                color: typeColors[type],
                size: 0.8,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              })}
            />
          </group>
        );
      })}
    </group>
  );
}