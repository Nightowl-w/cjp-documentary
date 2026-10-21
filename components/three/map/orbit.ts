import * as THREE from 'three';

/**
 * Small, dependency-free orbit camera controller.
 * - mouse: drag to orbit, wheel to zoom (only once enabled), +/- via API
 * - touch: one finger drags horizontally, two fingers orbit + pinch zoom
 * - flyTo(): eased camera flight used by the guided tour
 */
export interface OrbitHandle {
  update(delta: number): void;
  flyTo(position: THREE.Vector3, target: THREE.Vector3, duration: number, immediate?: boolean): void;
  isFlying(): boolean;
  cancelFlight(): void;
  zoomBy(factor: number): void;
  rotateBy(deltaAzimuth: number, deltaPolar: number): void;
  reset(immediate?: boolean): void;
  setInputEnabled(enabled: boolean): void;
  setWheelEnabled(enabled: boolean): void;
  setDriftEnabled(enabled: boolean): void;
  dispose(): void;
}

interface OrbitOptions {
  target: THREE.Vector3;
  position: THREE.Vector3;
  minDistance?: number;
  maxDistance?: number;
  minPolar?: number;
  maxPolar?: number;
}

const EPSILON = 0.000001;

function toSpherical(position: THREE.Vector3, target: THREE.Vector3) {
  const offset = position.clone().sub(target);
  const radius = Math.max(offset.length(), EPSILON);
  const phi = Math.acos(THREE.MathUtils.clamp(offset.y / radius, -1, 1));
  const theta = Math.atan2(offset.x, offset.z);
  return { radius, phi, theta };
}

export function createOrbit(
  camera: THREE.PerspectiveCamera,
  dom: HTMLElement,
  options: OrbitOptions
): OrbitHandle {
  const minDistance = options.minDistance ?? 9;
  const maxDistance = options.maxDistance ?? 150;
  const minPolar = options.minPolar ?? 0.14;
  const maxPolar = options.maxPolar ?? 1.42;

  const home = {
    target: options.target.clone(),
    position: options.position.clone(),
  };

  const initial = toSpherical(home.position, home.target);
  const desired = { ...initial, target: home.target.clone() };
  const current = { ...initial, target: home.target.clone() };

  let inputEnabled = true;
  let wheelEnabled = false;
  let driftEnabled = true;
  let driftWeight = 0;
  let elapsed = 0;
  let flying = false;
  let flight = {
    fromPosition: new THREE.Vector3(),
    toPosition: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    duration: 1,
    time: 0,
  };

  const pointers = new Map<number, { x: number; y: number }>();
  let pinchDistance = 0;

  dom.style.touchAction = 'pan-y';

  const onPointerDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    }
    if (event.pointerType === 'mouse') dom.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    const stored = pointers.get(event.pointerId);
    if (!stored) return;

    const dx = event.clientX - stored.x;
    const dy = event.clientY - stored.y;
    stored.x = event.clientX;
    stored.y = event.clientY;

    if (flying || !inputEnabled) return;

    if (pointers.size === 1) {
      if (event.pointerType === 'touch') {
        desired.theta -= dx * 0.006;
      } else {
        desired.theta -= dx * 0.005;
        desired.phi = THREE.MathUtils.clamp(desired.phi - dy * 0.004, minPolar, maxPolar);
      }
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDistance > 0 && distance > 0) {
        desired.radius = THREE.MathUtils.clamp(
          desired.radius * (pinchDistance / distance),
          minDistance,
          maxDistance
        );
      }
      pinchDistance = distance;
      desired.theta -= dx * 0.004;
      desired.phi = THREE.MathUtils.clamp(desired.phi - dy * 0.004, minPolar, maxPolar);
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchDistance = 0;
    if (event.pointerType === 'mouse') dom.releasePointerCapture?.(event.pointerId);
  };

  const onWheel = (event: WheelEvent) => {
    if (!wheelEnabled || flying || !inputEnabled) return;
    event.preventDefault();
    const scale = Math.exp(event.deltaY * 0.0012);
    desired.radius = THREE.MathUtils.clamp(desired.radius * scale, minDistance, maxDistance);
  };

  dom.addEventListener('pointerdown', onPointerDown);
  dom.addEventListener('pointermove', onPointerMove);
  dom.addEventListener('pointerup', onPointerUp);
  dom.addEventListener('pointercancel', onPointerUp);
  dom.addEventListener('pointerleave', onPointerUp);
  dom.addEventListener('wheel', onWheel, { passive: false });

  const syncFromSpherical = () => {
    const sinPhi = Math.sin(current.phi);
    camera.position.set(
      current.target.x + current.radius * sinPhi * Math.sin(current.theta),
      current.target.y + current.radius * Math.cos(current.phi),
      current.target.z + current.radius * sinPhi * Math.cos(current.theta)
    );
    camera.lookAt(current.target);
  };

  const applyFlight = () => {
    const t = THREE.MathUtils.clamp(flight.time / flight.duration, 0, 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(flight.fromPosition, flight.toPosition, eased);
    current.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);
    camera.lookAt(current.target);
  };

  const update = (delta: number) => {
    elapsed += delta;

    if (flying) {
      flight.time += delta;
      applyFlight();
      if (flight.time >= flight.duration) {
        flying = false;
        const spherical = toSpherical(flight.toPosition, flight.toTarget);
        Object.assign(current, {
          radius: spherical.radius,
          phi: spherical.phi,
          theta: spherical.theta,
        });
        Object.assign(desired, {
          radius: spherical.radius,
          phi: spherical.phi,
          theta: spherical.theta,
        });
        desired.target.copy(flight.toTarget);
        current.target.copy(flight.toTarget);
      }
      return;
    }

    driftWeight = THREE.MathUtils.damp(driftWeight, driftEnabled ? 1 : 0, 2.5, delta);
    const k = 1 - Math.exp(-9 * delta);
    current.radius += (desired.radius - current.radius) * k;
    current.phi += (desired.phi - current.phi) * k;
    current.theta += (desired.theta - current.theta) * k;
    current.target.lerp(desired.target, k);

    const drift = Math.sin(elapsed * 0.22) * 0.045 * driftWeight;
    const sinPhi = Math.sin(current.phi);
    const theta = current.theta + drift;
    camera.position.set(
      current.target.x + current.radius * sinPhi * Math.sin(theta),
      current.target.y + current.radius * Math.cos(current.phi),
      current.target.z + current.radius * sinPhi * Math.cos(theta)
    );
    camera.lookAt(current.target);
  };

  return {
    update,
    flyTo(position, target, duration, immediate = false) {
      if (immediate || duration <= 0) {
        camera.position.copy(position);
        current.target.copy(target);
        desired.target.copy(target);
        const spherical = toSpherical(position, target);
        Object.assign(current, { radius: spherical.radius, phi: spherical.phi, theta: spherical.theta });
        Object.assign(desired, { radius: spherical.radius, phi: spherical.phi, theta: spherical.theta });
        camera.lookAt(target);
        return;
      }
      flight = {
        fromPosition: camera.position.clone(),
        toPosition: position.clone(),
        fromTarget: current.target.clone(),
        toTarget: target.clone(),
        duration,
        time: 0,
      };
      flying = true;
    },
    isFlying: () => flying,
    cancelFlight() {
      flying = false;
    },
    zoomBy(factor) {
      desired.radius = THREE.MathUtils.clamp(desired.radius * factor, minDistance, maxDistance);
    },
    rotateBy(deltaAzimuth, deltaPolar) {
      desired.theta += deltaAzimuth;
      desired.phi = THREE.MathUtils.clamp(desired.phi + deltaPolar, minPolar, maxPolar);
    },
    reset(immediate = false) {
      desired.radius = initial.radius;
      desired.phi = initial.phi;
      desired.theta = initial.theta;
      desired.target.copy(home.target);
      if (immediate) {
        Object.assign(current, {
          radius: initial.radius,
          phi: initial.phi,
          theta: initial.theta,
        });
        current.target.copy(home.target);
        syncFromSpherical();
      } else {
        this.flyTo(home.position, home.target, 1.4);
      }
    },
    setInputEnabled(enabled) {
      inputEnabled = enabled;
    },
    setWheelEnabled(enabled) {
      wheelEnabled = enabled;
    },
    setDriftEnabled(enabled) {
      driftEnabled = enabled;
    },
    dispose() {
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('pointercancel', onPointerUp);
      dom.removeEventListener('pointerleave', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
    },
  };
}
