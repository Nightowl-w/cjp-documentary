'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generative ambient bed for the hero. There is no audio file: a quiet drone is
 * synthesised with the Web Audio API after the user presses play, so it never
 * autoplays and never 404s.
 */
export function useAmbientAudio() {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

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

  const toggle = useCallback(async () => {
    try {
      const context = buildGraph();
      if (context.state === 'suspended') await context.resume();

      const master = masterRef.current;
      if (!master) return;

      const now = context.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);

      if (playingRef.current) {
        master.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        playingRef.current = false;
        setPlaying(false);
      } else {
        master.gain.linearRampToValueAtTime(0.16, now + 1.2);
        playingRef.current = true;
        setPlaying(true);
      }
    } catch (error) {
      console.error('[ambient] could not start audio', error);
      setUnavailable(true);
    }
  }, [buildGraph]);

  useEffect(() => {
    return () => {
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

  return { playing, toggle, unavailable };
}
