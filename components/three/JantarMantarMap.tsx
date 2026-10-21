'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Route,
  Sun,
  Sunrise,
  Tags,
  X,
} from 'lucide-react';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { cn } from '@/lib/utils';
import { createOrbit, type OrbitHandle } from '@/components/three/map/orbit';
import { ANCHORS, createWorld, type Quality, type WorldHandle } from '@/components/three/map/world';
import {
  HOTSPOTS,
  LEGEND,
  PRESETS,
  TOUR_STOPS,
  type TimePreset,
} from '@/components/three/map/tourData';

const FLY_SECONDS = 2.6;
const DWELL_SECONDS = 6.6;
const DWELL_SECONDS_REDUCED = 9.5;

const PRESET_ICONS: Record<TimePreset, typeof Sun> = {
  golden: Sunrise,
  day: Sun,
  night: Moon,
};

export function JantarMantarMap() {
  const { reducedMotion } = usePreferences();

  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<WorldHandle | null>(null);
  const orbitRef = useRef<OrbitHandle | null>(null);
  const labelRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const visibleRef = useRef(false);
  const introStartedRef = useRef(false);
  const pendingTourRef = useRef(false);
  const presetRef = useRef<TimePreset>('golden');
  const routeRef = useRef(false);
  const labelsRef = useRef(true);
  const reducedMotionRef = useRef(reducedMotion);
  const activeIdRef = useRef<string | null>(null);
  const hoverIdRef = useRef<string | null>(null);
  const narrowRef = useRef(false);
  const tourRef = useRef<{ index: number; phase: 'fly' | 'dwell'; time: number; paused: boolean } | null>(null);
  const startTourRef = useRef<(index: number) => void>(() => {});
  const stepTourRef = useRef<(delta: number) => void>(() => {});

  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [preset, setPreset] = useState<TimePreset>('golden');
  const [routeOn, setRouteOn] = useState(false);
  const [labelsOn, setLabelsOn] = useState(true);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [tourPaused, setTourPaused] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  reducedMotionRef.current = reducedMotion;

  /* ------------------------------ main lifecycle ----------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    const host = hostRef.current;
    if (!container || !host) return;

    const isSmall = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
    const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 8 : 8;
    const quality: Quality = !isSmall && cores > 4 ? 'high' : 'low';

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: quality === 'high', powerPreference: 'high-performance' });
    } catch (error) {
      console.error('[map] WebGL is unavailable', error);
      setFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === 'high' ? 2 : 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = quality === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.outline = 'none';
    host.appendChild(canvas);

    const world = createWorld(renderer, quality, { ambientMotion: !reducedMotionRef.current });
    world.setPreset(presetRef.current);
    world.setRouteVisible(routeRef.current);
    worldRef.current = world;

    const narrow = host.clientWidth < 640;
    narrowRef.current = narrow;
    const homeTarget = new THREE.Vector3(2, 0, -6);
    const homePosition = narrow ? new THREE.Vector3(58, 50, 70) : new THREE.Vector3(44, 38, 50);

    const orbit = createOrbit(world.camera, canvas, {
      target: homeTarget,
      position: homePosition,
      minDistance: 10,
      maxDistance: 150,
    });
    orbit.setWheelEnabled(false);
    orbit.setDriftEnabled(!reducedMotionRef.current);
    orbitRef.current = orbit;

    // Start further out; the first time the map scrolls into view we dolly in
    // while the monuments rise into place.
    const entrancePosition = homePosition
      .clone()
      .sub(homeTarget)
      .multiplyScalar(narrow ? 1.3 : 1.5)
      .add(homeTarget);
    orbit.flyTo(entrancePosition, homeTarget, 0, true);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    /* resize */
    const labelSizes = new Map<string, { width: number; height: number }>();
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width === 0 || height === 0) return;
      narrowRef.current = width < 640;
      labelSizes.clear();
      renderer.setSize(width, height, false);
      world.camera.aspect = width / height;
      world.camera.fov = width < 640 ? 58 : 46;
      world.camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    /* tour controls */
    const applyStop = (index: number) => {
      const stop = TOUR_STOPS[index];
      if (!stop) return;
      tourRef.current = { index, phase: 'fly', time: 0, paused: false };
      setTourIndex(index);
      setTourPaused(false);
      setActiveId(stop.hotspot);
      if (stop.route && !routeRef.current) {
        routeRef.current = true;
        setRouteOn(true);
        world.setRouteVisible(true);
      }
      world.setHighlight(stop.hotspot);
      const duration = reducedMotionRef.current ? 0 : FLY_SECONDS;
      const stopTarget = new THREE.Vector3(...stop.target);
      const stopPosition = new THREE.Vector3(...stop.position);
      if (narrowRef.current) stopPosition.sub(stopTarget).multiplyScalar(1.35).add(stopTarget);
      orbit.flyTo(stopPosition, stopTarget, duration, duration === 0);
    };

    startTourRef.current = (index: number) => {
      applyStop(index);
      orbit.setDriftEnabled(false);
    };

    stepTourRef.current = (delta: number) => {
      const tour = tourRef.current;
      if (!tour || tour.paused) return;
      tour.time += delta;
      if (tour.phase === 'fly') {
        if (!orbit.isFlying() || tour.time > FLY_SECONDS + 0.4) {
          tour.phase = 'dwell';
          tour.time = 0;
        }
        return;
      }
      const dwell = reducedMotionRef.current ? DWELL_SECONDS_REDUCED : DWELL_SECONDS;
      if (tour.time > dwell) {
        if (tour.index + 1 < TOUR_STOPS.length) applyStop(tour.index + 1);
        else {
          tourRef.current = null;
          setTourIndex(null);
          world.setHighlight(null);
        }
      }
    };

    /* labels */
    const projectLabels = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width === 0 || height === 0) return;
      const camera = world.camera;
      const tour = tourRef.current;
      const tourHotspot = tour ? TOUR_STOPS[tour.index]?.hotspot ?? null : null;
      const active = activeIdRef.current;
      const hovered = hoverIdRef.current;
      const showLabels = labelsRef.current;

      const candidates: {
        id: string;
        element: HTMLButtonElement;
        x: number;
        y: number;
        opacity: number;
        priority: number;
      }[] = [];

      for (const hotspot of HOTSPOTS) {
        const element = labelRefs.current.get(hotspot.id);
        if (!element) continue;
        const anchor = ANCHORS[hotspot.id];
        if (!anchor) continue;
        const vector = new THREE.Vector3(anchor[0], anchor[1], anchor[2]);
        const distance = camera.position.distanceTo(vector);
        vector.project(camera);
        if (vector.z > 1) {
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
          continue;
        }
        const x = (vector.x * 0.5 + 0.5) * width;
        const y = (-vector.y * 0.5 + 0.5) * height;
        if (x < -70 || x > width + 70 || y < -70 || y > height + 70) {
          element.style.opacity = '0';
          element.style.pointerEvents = 'none';
          continue;
        }
        let opacity = THREE.MathUtils.clamp(1 - (distance - 25) / 200, 0.4, 1);
        if (!showLabels) opacity = 0;
        const isFocused = active === hotspot.id || tourHotspot === hotspot.id || hovered === hotspot.id;
        if (isFocused) opacity = 1;
        else if (tour && tourHotspot) opacity = 0;
        const known = labelSizes.get(hotspot.id);
        const halfWidth = (known?.width ?? 96) / 2;
        const halfHeight = (known?.height ?? 24) / 2;
        const margin = 8;
        candidates.push({
          id: hotspot.id,
          element,
          x: THREE.MathUtils.clamp(x, halfWidth + margin, width - halfWidth - margin),
          y: THREE.MathUtils.clamp(y, halfHeight + margin, height - halfHeight - margin),
          opacity,
          priority: (isFocused ? 1000 : 0) + hotspot.weight * 100 + (220 - distance),
        });
      }

      candidates.sort((a, b) => b.priority - a.priority);
      const boxes: { left: number; right: number; top: number; bottom: number }[] = [];

      for (const candidate of candidates) {
        let size = labelSizes.get(candidate.id);
        if (!size || size.width === 0) {
          size = {
            width: candidate.element.offsetWidth || 96,
            height: candidate.element.offsetHeight || 24,
          };
          labelSizes.set(candidate.id, size);
        }
        const left = candidate.x - size.width / 2;
        const right = candidate.x + size.width / 2;
        const top = candidate.y - size.height / 2;
        const bottom = candidate.y + size.height / 2;
        const padding = 6;
        const collides =
          candidate.opacity > 0.05 &&
          boxes.some(
            (box) =>
              left - padding < box.right &&
              right + padding > box.left &&
              top - padding < box.bottom &&
              bottom + padding > box.top
          );

        candidate.element.style.transform = `translate3d(${candidate.x}px, ${candidate.y}px, 0) translate(-50%, -50%)`;

        if (collides && candidate.priority < 1000) {
          candidate.element.style.opacity = '0';
          candidate.element.style.pointerEvents = 'none';
          continue;
        }

        if (candidate.opacity > 0.05) boxes.push({ left, right, top, bottom });
        candidate.element.style.opacity = String(Number(candidate.opacity.toFixed(3)));
        candidate.element.style.pointerEvents = candidate.opacity > 0.05 && showLabels ? 'auto' : 'none';
      }
    };

    /* loop */
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let firstFrame = true;

    const frame = () => {
      if (disposed) return;
      frameId = requestAnimationFrame(frame);
      if (!visibleRef.current || document.hidden) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      stepTourRef.current(delta);
      orbit.update(delta);
      world.update(delta, elapsed);
      projectLabels();
      renderer.render(world.scene, world.camera);

      if (firstFrame) {
        firstFrame = false;
        setReady(true);
      }
    };

    if (reducedMotionRef.current) {
      // static first frame is enough; the loop below still handles interaction
    }
    frame();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.12;
        visibleRef.current = visible;
        if (visible && !introStartedRef.current) {
          introStartedRef.current = true;
          world.startIntro(reducedMotionRef.current);
          const immediate = reducedMotionRef.current;
          orbit.flyTo(homePosition, homeTarget, immediate ? 0 : 3.4, immediate);
        }
        if (visible && pendingTourRef.current) {
          pendingTourRef.current = false;
          startTourRef.current(0);
        }
      },
      { threshold: [0.12] }
    );
    observer.observe(container);

    const onMapTourEvent = () => {
      if (visibleRef.current) startTourRef.current(0);
      else pendingTourRef.current = true;
    };
    window.addEventListener('cjp:map-tour', onMapTourEvent);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('cjp:map-tour', onMapTourEvent);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      orbit.dispose();
      world.dispose();
      renderer.dispose();
      worldRef.current = null;
      orbitRef.current = null;
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  /* ------------------------------- state wiring ------------------------------ */

  useEffect(() => {
    presetRef.current = preset;
    worldRef.current?.setPreset(preset);
  }, [preset]);

  useEffect(() => {
    routeRef.current = routeOn;
    worldRef.current?.setRouteVisible(routeOn);
  }, [routeOn]);

  useEffect(() => {
    labelsRef.current = labelsOn;
  }, [labelsOn]);

  useEffect(() => {
    activeIdRef.current = activeId;
    hoverIdRef.current = hoverId;
    worldRef.current?.setHighlight(activeId ?? hoverId);
  }, [activeId, hoverId]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  /* --------------------------------- actions -------------------------------- */

  const selectHotspot = useCallback((id: string) => {
    const world = worldRef.current;
    const orbit = orbitRef.current;
    if (!world || !orbit) return;
    tourRef.current = null;
    setTourIndex(null);
    setTourPaused(false);
    setActiveId(id);
    const anchor = ANCHORS[id];
    if (!anchor) return;
    const target = new THREE.Vector3(anchor[0], anchor[1], anchor[2]);
    const direction = world.camera.position.clone().sub(target).normalize();
    const baseDistance = id === 'parliament' ? 42 : id === 'bangla' ? 26 : 20;
    const distance = baseDistance * (narrowRef.current ? 1.35 : 1);
    const destination = target.clone().add(direction.multiplyScalar(distance));
    destination.y = Math.max(destination.y, target.y + 5);
    orbit.flyTo(destination, target, reducedMotionRef.current ? 0 : 1.9, reducedMotionRef.current);
  }, []);

  const stopTour = useCallback(() => {
    tourRef.current = null;
    setTourIndex(null);
    setTourPaused(false);
    worldRef.current?.setHighlight(activeIdRef.current);
  }, []);

  const toggleTourPaused = useCallback(() => {
    const tour = tourRef.current;
    if (!tour) return;
    tour.paused = !tour.paused;
    setTourPaused(tour.paused);
  }, []);

  const jumpTour = useCallback(
    (direction: number) => {
      const current = tourRef.current?.index ?? -1;
      const next = Math.min(Math.max(current + direction, 0), TOUR_STOPS.length - 1);
      startTourRef.current(next);
    },
    []
  );

  const resetView = useCallback(() => {
    tourRef.current = null;
    setTourIndex(null);
    setActiveId(null);
    setHoverId(null);
    orbitRef.current?.reset(reducedMotionRef.current);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void>;
    };
    const target = element as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> };
    const supportsNative =
      typeof element.requestFullscreen === 'function' || typeof target.webkitRequestFullscreen === 'function';
    if (!supportsNative) {
      // iOS Safari and older browsers: fall back to a CSS fullscreen overlay.
      setFullscreen((value) => !value);
      return;
    }
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      void (document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
    } else {
      void (target.requestFullscreen?.() ?? target.webkitRequestFullscreen?.());
    }
  }, []);

  const handleCanvasPointerDown = useCallback(() => {
    setEngaged(true);
    orbitRef.current?.setWheelEnabled(true);
    orbitRef.current?.setDriftEnabled(false);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    switch (event.key) {
      case 'ArrowLeft':
        orbit.rotateBy(0.2, 0);
        event.preventDefault();
        break;
      case 'ArrowRight':
        orbit.rotateBy(-0.2, 0);
        event.preventDefault();
        break;
      case 'ArrowUp':
        orbit.rotateBy(0, -0.14);
        event.preventDefault();
        break;
      case 'ArrowDown':
        orbit.rotateBy(0, 0.14);
        event.preventDefault();
        break;
      case '+':
      case '=':
        orbit.zoomBy(0.82);
        break;
      case '-':
      case '_':
        orbit.zoomBy(1.22);
        break;
      case 'r':
      case 'R':
        resetView();
        break;
      case 't':
      case 'T':
        if (tourRef.current) stopTour();
        else startTourRef.current(0);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'l':
      case 'L':
        setLabelsOn((value) => !value);
        break;
      case 'm':
      case 'M':
        setRouteOn((value) => !value);
        break;
      case 'Escape':
        if (fullscreen && !document.fullscreenElement) setFullscreen(false);
        break;
      default:
        break;
    }
  }, [resetView, stopTour, toggleFullscreen, fullscreen]);

  const activeHotspot = activeId ? HOTSPOTS.find((hotspot) => hotspot.id === activeId) ?? null : null;
  const tourStop = tourIndex !== null ? TOUR_STOPS[tourIndex] : null;
  const tourStopNumber = tourIndex ?? 0;

  return (
    <div
      ref={containerRef}
      id="jantar-mantar-map"
      role="region"
      aria-label="Interactive 3D map of Jantar Mantar"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'group/map isolate overflow-hidden border border-border/70 bg-[#0b0b10] shadow-2xl outline-none transition-colors focus-visible:border-accent-gold/60',
        fullscreen
          ? 'fixed inset-0 z-[120] h-full rounded-none border-0'
          : 'relative h-[440px] rounded-2xl sm:h-[540px] lg:h-[640px]'
      )}
    >
      <div ref={hostRef} className="absolute inset-0" onPointerDown={handleCanvasPointerDown} aria-hidden="true" />

      {/* labels */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {HOTSPOTS.map((hotspot) => {
          const isActive = activeId === hotspot.id || tourStop?.hotspot === hotspot.id;
          const isHovered = hoverId === hotspot.id;
          return (
            <button
              key={hotspot.id}
              type="button"
              data-hotspot={hotspot.id}
              aria-label={`${hotspot.label} — ${hotspot.short}`}
              title={`${hotspot.label} — ${hotspot.short}`}
              ref={(element) => {
                if (element) labelRefs.current.set(hotspot.id, element);
                else labelRefs.current.delete(hotspot.id);
              }}
              onClick={() => selectHotspot(hotspot.id)}
              onMouseEnter={() => setHoverId(hotspot.id)}
              onMouseLeave={() => setHoverId((current) => (current === hotspot.id ? null : current))}
              onFocus={() => setHoverId(hotspot.id)}
              onBlur={() => setHoverId((current) => (current === hotspot.id ? null : current))}
              style={{ transform: 'translate3d(-9999px, -9999px, 0)', opacity: 0 }}
              className={cn(
                'absolute left-0 top-0 flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9.5px] font-medium tracking-wide transition-colors sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10.5px]',
                isActive
                  ? 'border-accent-gold/80 bg-black/85 text-accent-gold'
                  : isHovered
                    ? 'border-white/40 bg-black/80 text-white'
                    : 'border-white/15 bg-black/70 text-white/85'
              )}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  hotspot.kind === 'instrument' && 'bg-[#c09270]',
                  hotspot.kind === 'camp' && 'bg-[#5b93c9]',
                  hotspot.kind === 'route' && 'bg-[#d0503c]',
                  hotspot.kind === 'landmark' && 'bg-[#e6dfd0]'
                )}
              />
              {hotspot.label}
            </button>
          );
        })}
      </div>

      {/* top-left identity */}
      <div className="pointer-events-none absolute left-3 top-3 flex max-w-[70%] flex-col gap-1.5 sm:left-5 sm:top-5">
        <div className="pointer-events-auto inline-flex items-center gap-2 self-start rounded-full border border-white/12 bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-gold" />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/90">
            Interactive 3D map
          </span>
        </div>
        <span className="hidden text-[10.5px] uppercase tracking-[0.16em] text-white/45 sm:block">
          Jantar Mantar · interpretive, not survey-grade
        </span>
      </div>

      {/* top-right controls */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 sm:right-5 sm:top-5 sm:gap-2">
        <div className="hidden items-center gap-1 rounded-full border border-white/12 bg-black/60 p-1 backdrop-blur-md sm:flex">
          {PRESETS.map((option) => {
            const Icon = PRESET_ICONS[option.id];
            const isActive = preset === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPreset(option.id)}
                aria-pressed={isActive}
                title={option.label}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                  isActive ? 'bg-accent-gold text-black' : 'text-white/70 hover:text-white'
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">{option.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-white/12 bg-black/60 p-1 backdrop-blur-md sm:flex">
          <button
            type="button"
            onClick={() => setRouteOn((value) => !value)}
            aria-pressed={routeOn}
            title="March route and stop point"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              routeOn ? 'bg-accent-crimson/90 text-white' : 'text-white/70 hover:text-white'
            )}
          >
            <Route className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setLabelsOn((value) => !value)}
            aria-pressed={labelsOn}
            title="Map labels"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              labelsOn ? 'bg-accent-gold text-black' : 'text-white/70 hover:text-white'
            )}
          >
            <Tags className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-white/12 bg-black/60 p-1 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setLegendOpen((value) => !value)}
            aria-pressed={legendOpen}
            title="Legend"
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              legendOpen ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
            )}
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={resetView}
            title="Reset view (R)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Fullscreen (F)"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* legend panel */}
      <AnimatePresence>
        {legendOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-3 top-16 w-60 rounded-xl border border-white/12 bg-black/80 p-4 text-white backdrop-blur-md sm:right-5 sm:top-20"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">Legend</h3>
              <button
                type="button"
                onClick={() => setLegendOpen(false)}
                className="text-white/60 transition-colors hover:text-white"
                aria-label="Close legend"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-2">
              {LEGEND.map((entry) => (
                <li key={entry.id} className="flex items-center gap-2.5 text-xs text-white/80">
                  <span className={cn('h-2.5 w-2.5 rounded-full', entry.swatch)} />
                  {entry.label}
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-[10.5px] leading-relaxed text-white/55">
                The map is an interpretive visualisation built for storytelling. Proportions, spacing and
                placement are approximate and should not be read as a surveyed plan of the site.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 sm:hidden">
              {PRESETS.map((option) => {
                const Icon = PRESET_ICONS[option.id];
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPreset(option.id)}
                    className={cn(
                      'flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px]',
                      preset === option.id ? 'bg-accent-gold text-black' : 'text-white/75'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setRouteOn((value) => !value)}
                className={cn(
                  'flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px]',
                  routeOn ? 'bg-accent-crimson/90 text-white' : 'text-white/75'
                )}
              >
                <Route className="h-3.5 w-3.5" aria-hidden="true" />
                March route
              </button>
              <button
                type="button"
                onClick={() => setLabelsOn((value) => !value)}
                className={cn(
                  'flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px]',
                  labelsOn ? 'bg-accent-gold text-black' : 'text-white/75'
                )}
              >
                <Tags className="h-3.5 w-3.5" aria-hidden="true" />
                Labels
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* zoom */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 sm:bottom-5 sm:left-5">
        <button
          type="button"
          onClick={() => orbitRef.current?.zoomBy(0.8)}
          title="Zoom in (+)"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => orbitRef.current?.zoomBy(1.25)}
          title="Zoom out (−)"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/60 text-white/80 backdrop-blur-md transition-colors hover:text-white"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* hint */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 lg:block">
        <p className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10.5px] tracking-wide text-white/55 backdrop-blur-md">
          {engaged
            ? 'Drag to orbit · scroll to zoom · click a label to explore'
            : 'Click the map to enable scroll-zoom · drag to orbit · click a label'}
        </p>
      </div>

      {/* tour caption */}
      <AnimatePresence>
        {tourStop && (
          <motion.div
            key={tourStop.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute bottom-16 left-1/2 w-[min(92%,560px)] -translate-x-1/2 sm:bottom-20"
            aria-live="polite"
          >
            <div className="rounded-xl border border-accent-gold/30 bg-black/80 p-4 backdrop-blur-md sm:p-5">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">
                  Guided tour · {tourStopNumber + 1}/{TOUR_STOPS.length}
                </span>
              </div>
              <h3 className="text-base font-medium text-white sm:text-lg">{tourStop.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-sm">{tourStop.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* tour / bottom-right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 sm:bottom-5 sm:right-5 sm:gap-2">
        {tourStop ? (
          <div className="flex items-center gap-1 rounded-full border border-accent-gold/40 bg-black/70 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => jumpTour(-1)}
              disabled={tourIndex === 0}
              title="Previous stop"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleTourPaused}
              title={tourPaused ? 'Resume tour' : 'Pause tour'}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-gold text-black transition-colors"
            >
              {tourPaused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => jumpTour(1)}
              disabled={tourIndex === TOUR_STOPS.length - 1}
              title="Next stop"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="mx-1 hidden items-center gap-1 sm:flex">
              {TOUR_STOPS.map((stop, index) => (
                <span
                  key={stop.id}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    index === tourIndex ? 'w-4 bg-accent-gold' : 'w-1.5 bg-white/30'
                  )}
                />
              ))}
            </span>
            <button
              type="button"
              onClick={stopTour}
              title="End tour"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setRouteOn((value) => !value)}
              className={cn(
                'hidden items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium backdrop-blur-md transition-colors sm:flex',
                routeOn
                  ? 'border-accent-crimson/60 bg-accent-crimson/25 text-white'
                  : 'border-white/15 bg-black/60 text-white/80 hover:text-white'
              )}
              aria-pressed={routeOn}
            >
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              March route
            </button>
            <button
              type="button"
              onClick={() => startTourRef.current(0)}
              className="flex items-center gap-2 rounded-full border border-accent-gold/50 bg-accent-gold/90 px-3.5 py-2 text-xs font-semibold text-black backdrop-blur-md transition-colors hover:bg-accent-gold sm:px-4 sm:text-sm"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              Play the tour
            </button>
          </div>
        )}
      </div>

      {/* hotspot info card */}
      <AnimatePresence>
        {activeHotspot && !tourStop && (
          <motion.div
            key={activeHotspot.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="absolute left-3 top-20 w-[min(86%,320px)] rounded-xl border border-white/12 bg-black/82 p-4 text-white backdrop-blur-md sm:left-5 sm:top-24"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-gold">
                  {activeHotspot.kind === 'instrument'
                    ? 'Observatory instrument'
                    : activeHotspot.kind === 'camp'
                      ? 'Protest camp'
                      : activeHotspot.kind === 'route'
                        ? 'March · 20 July'
                        : 'Landmark'}
                </p>
                <h3 className="mt-1 text-base font-medium">{activeHotspot.label}</h3>
                <p className="text-[11px] text-white/60">{activeHotspot.short}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="text-white/60 transition-colors hover:text-white"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-white/75">{activeHotspot.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* loading / failure overlays */}
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0b0b10]/70">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">Building the map…</span>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0b10] p-6 text-center">
          <p className="max-w-md text-sm text-white/70">
            The interactive 3D map needs WebGL, which this browser has disabled. The field notes below
            cover the same ground in text.
          </p>
        </div>
      )}
    </div>
  );
}
