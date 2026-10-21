'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const AMBIENCE_PREFERENCE = 'cjp-ambience';

function persistPreference(value: 'on' | 'off') {
  try {
    window.localStorage.setItem(AMBIENCE_PREFERENCE, value);
  } catch {
    // Private mode or blocked storage: keep the in-memory state only.
  }
}

/**
 * Generative ambient bed for the hero. There is no audio file: a quiet drone is
 * synthesised with the Web Audio API.
 *
 * Browsers do not allow audible autoplay before a gesture. The bed is therefore
 * armed by default and starts on the first meaningful click, tap or keyboard
 * activation, instead of making the listener press the Ambience button first.
 * An explicit mute is remembered in localStorage.
 */
export function useAmbientAudio() {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playingRef = useRef(false);
  const armedRef = useRef(true);
  const preferenceReadyRef = useRef(false);
  const mountedRef = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const setArmedState = useCallback((next: boolean) => {
    armedRef.current = next;
    setArmed(next);
  }, []);

  const buildGraph = useCallback(() => {
    if (contextRef.current) return contextRef.current;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) throw new Error('Web Audio is not supported');

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.value = 0.0001;
    master.connect(context.destination);

    // Low, slowly breathing drone.
    const droneGain = context.createGain();
    droneGain.gain.value = 0.32;
    droneGain.connect(master);

    [55, 82.5, 110].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 0 ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index === 2 ? -7 : 4;

      const gain = context.createGain();
      gain.gain.value = index === 0 ? 0.5 : index === 1 ? 0.18 : 0.1;
      oscillator.connect(gain).connect(droneGain);
      oscillator.start();
      oscillatorsRef.current.push(oscillator);
    });

    // Very quiet filtered noise, like wind around the observatory.
    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i += 1) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 340;
    filter.Q.value = 0.6;

    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.05;

    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start();
    sourcesRef.current.push(noise);

    // Slow swell so the drone does not feel static.
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain).connect(droneGain.gain);
    lfo.start();
    oscillatorsRef.current.push(lfo);

    contextRef.current = context;
    masterRef.current = master;
    return context;
  }, []);

  const start = useCallback(async () => {
    try {
      const context = buildGraph();

      // Update the UI immediately so a mute during resume() is not overwritten
      // when the resume promise resolves.
      playingRef.current = true;
      setPlaying(true);
      setArmedState(true);

      if (context.state === 'suspended') await context.resume();
      if (!mountedRef.current || !playingRef.current) return;

      const master = masterRef.current;
      if (!master) return;

      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.linearRampToValueAtTime(0.16, now + 1.2);
      persistPreference('on');
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('[ambient] could not start audio', error);
      setUnavailable(true);
      setArmedState(false);
      playingRef.current = false;
      setPlaying(false);
    }
  }, [buildGraph, setArmedState]);

  const pause = useCallback(
    (persist: boolean) => {
      if (persist) persistPreference('off');
      setArmedState(false);
      playingRef.current = false;
      setPlaying(false);

      const context = contextRef.current;
      const master = masterRef.current;
      if (!context || !master) return;

      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    },
    [setArmedState]
  );

  const toggle = useCallback(() => {
    if (playingRef.current || armedRef.current) {
      pause(true);
    } else {
      void start();
    }
  }, [pause, start]);

  // Read the saved mute preference after hydration. If it is absent, the bed
  // stays armed by default.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(AMBIENCE_PREFERENCE) === 'off') {
        setArmedState(false);
      }
    } catch {
      // localStorage unavailable: keep the default (armed).
    }
    preferenceReadyRef.current = true;
  }, [setArmedState]);

  // Start the bed on the first meaningful gesture. The browser autoplay policy
  // needs a gesture; this is that gesture, not a pre-page-load autoplay.
  useEffect(() => {
    if (!armed || playing) return;

    let triggered = false;

    const startOnFirstGesture = (event: Event) => {
      if (triggered || !preferenceReadyRef.current) return;

      if (event.type === 'keydown') {
        const key = (event as KeyboardEvent).key;
        if (key !== 'Enter' && key !== ' ') return;

        const keyTarget = event.target;
        if (
          !(keyTarget instanceof Element) ||
          !keyTarget.closest('button, a, [role="button"]')
        ) {
          return;
        }
      }

      if (event instanceof PointerEvent && event.button !== 0) return;

      const target = event.target;
      if (target instanceof Element && target.closest('[data-ambient-ignore]')) return;

      triggered = true;
      void start();
    };

    document.addEventListener('pointerdown', startOnFirstGesture, true);
    document.addEventListener('keydown', startOnFirstGesture, true);

    return () => {
      document.removeEventListener('pointerdown', startOnFirstGesture, true);
      document.removeEventListener('keydown', startOnFirstGesture, true);
    };
  }, [armed, playing, start]);

  // A real recording takes priority over the ambient bed. Do not remember this
  // pause as an explicit mute: the next manual start still works.
  useEffect(() => {
    const onVoiceStart = () => pause(false);
    window.addEventListener('cjp:voice-start', onVoiceStart);
    return () => window.removeEventListener('cjp:voice-start', onVoiceStart);
  }, [pause]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      playingRef.current = false;
      sourcesRef.current.forEach((source) => {
        try {
          source.stop();
        } catch {
          // already stopped
        }
      });
      oscillatorsRef.current.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // already stopped
        }
      });
      void contextRef.current?.close().catch(() => undefined);
    };
  }, []);

  return { playing, armed, toggle, unavailable };
}
