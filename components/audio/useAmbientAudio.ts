"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AMBIENCE_SRC = "/audio/ambience.mp3";
const AMBIENCE_VOLUME = 0.22;

/**
 * Optional background loop.
 *
 * It is deliberately off and silent by default: the track is only created and
 * played from the listener's explicit Ambience button press. It never starts on
 * page load or on an incidental click elsewhere. Starting a real voice excerpt
 * or a video pauses it, so the recording takes priority.
 */
export function useAmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(true);
  const playingRef = useRef(false);
  const requestRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const syncPlaying = useCallback((next: boolean) => {
    playingRef.current = next;
    setPlaying(next);
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(AMBIENCE_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = AMBIENCE_VOLUME;

    audio.addEventListener("play", () => {
      if (!mountedRef.current) return;
      playingRef.current = true;
      setPlaying(true);
    });
    audio.addEventListener("pause", () => {
      if (!mountedRef.current) return;
      playingRef.current = false;
      setPlaying(false);
    });
    audio.addEventListener("error", () => {
      if (!mountedRef.current) return;
      console.error("[ambience] could not load the background audio");
      setUnavailable(true);
      syncPlaying(false);
    });

    audioRef.current = audio;
    return audio;
  }, [syncPlaying]);

  const start = useCallback(async () => {
    const request = requestRef.current + 1;
    requestRef.current = request;

    try {
      const audio = ensureAudio();
      setUnavailable(false);
      syncPlaying(true);

      await audio.play();

      if (!mountedRef.current || request !== requestRef.current) return;
      syncPlaying(true);
    } catch (error) {
      if (!mountedRef.current || request !== requestRef.current) return;
      console.error("[ambience] could not start the background audio", error);
      setUnavailable(true);
      syncPlaying(false);
    }
  }, [ensureAudio, syncPlaying]);

  const pause = useCallback(() => {
    requestRef.current += 1;
    syncPlaying(false);
    audioRef.current?.pause();
  }, [syncPlaying]);

  const toggle = useCallback(() => {
    if (playingRef.current) {
      pause();
      return;
    }

    void start();
  }, [pause, start]);

  // A real recording takes priority over the optional background loop. Do not
  // resume automatically afterwards; the listener can press Ambience again.
  useEffect(() => {
    const onVoiceStart = () => pause();
    window.addEventListener("cjp:voice-start", onVoiceStart);
    return () => window.removeEventListener("cjp:voice-start", onVoiceStart);
  }, [pause]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      playingRef.current = false;
      requestRef.current += 1;
      audioRef.current?.pause();
    };
  }, []);

  return { playing, toggle, unavailable };
}
