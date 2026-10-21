'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

// Only one voice clip should play at a time across all cards.
let activeAudio: HTMLAudioElement | null = null;

interface VoicePlayerProps {
  id: string;
  src: string;
  label: string;
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VoicePlayer({ id, src, label }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onTime = () => setCurrent(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setCurrent(audio.currentTime);
    };
    const onError = () => {
      setFailed(true);
      setPlaying(false);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('durationchange', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Metadata can finish loading before this effect attaches its listeners.
    if (audio.readyState >= 1) onLoaded();
    if (audio.currentTime > 0) setCurrent(audio.currentTime);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('durationchange', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      if (activeAudio === audio) activeAudio = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || failed) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (activeAudio && activeAudio !== audio) activeAudio.pause();
    activeAudio = audio;
    void audio.play().catch(() => setFailed(true));
  };

  const seek = (event: ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(event.target.value);
    audio.currentTime = next;
    setCurrent(next);
  };

  const progress = duration > 0 ? Math.min(current / duration, 1) : 0;

  return (
    <div className="space-y-2">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={failed}
          data-testid={`voice-play-${id}`}
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-gold/30 bg-accent-gold/10 text-accent-gold transition-colors hover:bg-accent-gold/20 focus-visible:ring-2 focus-visible:ring-accent-gold disabled:opacity-40"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(current, duration || 0)}
          onChange={seek}
          disabled={!duration || failed}
          aria-label={`Seek within ${label}`}
          className="audio-range w-full flex-1"
          style={{
            background: `linear-gradient(to right, hsl(var(--accent-gold)) ${progress * 100}%, hsl(var(--border)) ${progress * 100}%)`,
          }}
        />

        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {formatTime(current)} / {duration > 0 ? formatTime(duration) : '--:--'}
        </span>
      </div>

      {failed && (
        <p className="text-xs text-accent-crimson">
          Audio could not be loaded. Please check your connection and try again.
        </p>
      )}
    </div>
  );
}
