'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Play,
  X,
} from 'lucide-react';
import {
  embedUrl,
  photos,
  videos,
  youtubeUrl,
  type Photo,
} from './mediaData';

type FrameProps = {
  photo: Photo;
  index: number;
  onOpen: (index: number) => void;
  className?: string;
  aspect?: string;
  sizes?: string;
};

function Frame({
  photo,
  index,
  onOpen,
  className = '',
  aspect = 'aspect-[4/3]',
  sizes = '(max-width: 768px) 100vw, 50vw',
}: FrameProps) {
  return (
    <figure className={className}>
      <button
        type="button"
        onClick={() => onOpen(index)}
        className={`frame-grain group relative block w-full overflow-hidden bg-black/50 ${aspect}`}
        aria-label={`View frame ${index + 1}: ${photo.caption}`}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70" />
        <span className="absolute right-3 top-3 z-20 border border-white/20 bg-black/55 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.16em] text-white/85">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 bg-black/65 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Maximize2 className="h-3 w-3" aria-hidden="true" />
          View frame
        </span>
      </button>
      <figcaption className="mt-3 border-l border-accent-gold/30 pl-3">
        <p className="text-sm leading-relaxed text-foreground/90">{photo.caption}</p>
        <p className="mt-1.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
          {photo.location} · {photo.date} ·{' '}
          <a
            href={photo.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border/70 underline-offset-2 transition-colors hover:text-accent-gold"
          >
            {photo.credit}
          </a>
        </p>
      </figcaption>
    </figure>
  );
}

function Chapter({
  numeral,
  title,
  note,
}: {
  numeral: string;
  title: string;
  note: string;
}) {
  return (
    <div className="mb-6 mt-16 flex items-end justify-between gap-4 border-b border-border/60 pb-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tracking-[0.18em] text-accent-gold">{numeral}</span>
        <h3 className="font-display text-2xl font-light sm:text-3xl">{title}</h3>
      </div>
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
        {note}
      </span>
    </div>
  );
}

export function PhotoEssay() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closePhoto = useCallback(() => setActivePhoto(null), []);
  const closeVideo = useCallback(() => setActiveVideo(null), []);
  const openVideo = useCallback((index: number) => {
    // A full recording takes priority over the ambient bed.
    window.dispatchEvent(new Event('cjp:voice-start'));
    setActiveVideo(index);
  }, []);
  const nextPhoto = useCallback(
    () => setActivePhoto((current) => (current === null ? current : (current + 1) % photos.length)),
    []
  );
  const previousPhoto = useCallback(
    () =>
      setActivePhoto((current) =>
        current === null ? current : (current - 1 + photos.length) % photos.length
      ),
    []
  );

  useEffect(() => {
    if (activePhoto === null && activeVideo === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activePhoto !== null) closePhoto();
        else closeVideo();
      }
      if (activePhoto !== null && event.key === 'ArrowRight') nextPhoto();
      if (activePhoto !== null && event.key === 'ArrowLeft') previousPhoto();
    };

    document.addEventListener('keydown', onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activePhoto, activeVideo, closePhoto, closeVideo, nextPhoto, previousPhoto]);

  const currentPhoto = activePhoto === null ? null : photos[activePhoto];
  const currentVideo = activeVideo === null ? null : videos[activeVideo];
  const lead = photos[0];

  return (
    <div className="container-wide">
      <motion.div
        className="mb-10 grid gap-8 lg:grid-cols-12 lg:items-end"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <div className="lg:col-span-8">
          <span className="text-caption font-medium text-accent-gold">04 — IN PICTURES</span>
          <h2
            id="photos-heading"
            className="mt-2 mb-4 font-display text-display-lg font-light gradient-text"
          >
            The Ground, in Frames
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Eleven photographs from the seven weeks at Jantar Mantar and the night of 20 July —
            the camp, the march, the barricades and the aftermath. They are reproduced from the
            reporting of The Hindu, The Indian Express and Mint, with the original captions and
            credit.
          </p>
        </div>

        <div className="lg:col-span-4 lg:justify-self-end">
          <div className="w-full border border-border/60 bg-card/50 p-4 lg:max-w-xs">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-gold">
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              Photo essay
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[9px] uppercase tracking-[0.14em]">
              <div>
                <dt className="text-muted-foreground">Location</dt>
                <dd className="mt-0.5 text-foreground">Jantar Mantar</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Period</dt>
                <dd className="mt-0.5 text-foreground">Jun–Jul 2026</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Frames</dt>
                <dd className="mt-0.5 text-foreground">11</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Sources</dt>
                <dd className="mt-0.5 text-foreground">3</dd>
              </div>
            </dl>
          </div>
        </div>
      </motion.div>

      {/* Lead frame */}
      <motion.figure
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8 }}
      >
        <button
          type="button"
          onClick={() => setActivePhoto(0)}
          className="frame-grain group relative block aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-[16/9]"
          aria-label={`View frame 1: ${lead.caption}`}
        >
          <Image
            src={lead.src}
            alt={lead.alt}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.02]"
          />
          <span className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/15 to-black/30" />
          <span className="absolute left-4 top-4 z-20 border border-white/25 bg-black/45 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/85 sm:left-6 sm:top-6">
            Frame 01 / 11
          </span>
          <span className="absolute inset-x-0 bottom-0 z-20 flex flex-wrap items-end justify-between gap-4 p-4 sm:p-7">
            <span className="max-w-3xl">
              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-accent-gold">
                The crowd · Jantar Mantar
              </span>
              <span className="mt-2 hidden font-display text-base font-light leading-snug text-white sm:block sm:text-2xl">
                {lead.caption}
              </span>
            </span>
            <span className="hidden items-center gap-1.5 border border-white/25 bg-black/50 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/85 transition-colors group-hover:border-accent-gold/60 group-hover:text-accent-gold lg:inline-flex">
              <Maximize2 className="h-3 w-3" aria-hidden="true" />
              View frame
            </span>
          </span>
        </button>
        <figcaption className="mt-3">
          <p className="text-sm leading-relaxed text-foreground/90 sm:hidden">{lead.caption}</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:mt-0">
            <span>
              {lead.location} · {lead.date}
            </span>
            <a
              href={lead.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border/70 underline-offset-2 transition-colors hover:text-accent-gold"
            >
              {lead.credit}
            </a>
          </div>
        </figcaption>
      </motion.figure>

      {/* Opening note */}
      <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-[1.5fr_1fr]">
        <p className="text-body-sm leading-relaxed text-muted-foreground first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.8] first-letter:text-accent-gold">
          For seven weeks, the 18th-century observatory grounds became a city within a city: a
          stage, a langar, tents, medical lines, and a crowd that kept returning. These frames
          move from the camp in June to the barricades of 20 July, and into the night that
          followed. They are the ground-level record this documentary is built on.
        </p>
        <div className="border-t border-border/60 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent-gold">
            How to read this essay
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Click or tap any photograph to view it full-screen. Use the arrow keys to move between
            frames. Captions and credits follow the publishers’ original reporting.
          </p>
        </div>
      </div>

      {/* Content note — placed after the lead frame so the essay opens on the crowd. */}
      <div className="mx-auto mt-8 flex max-w-5xl items-start gap-3 border-l-2 border-accent-crimson/60 bg-accent-crimson/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-crimson" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Content note:</span> some frames show
          violence and distress. Captions follow the original reporting; every photograph is
          credited and linked to its source.
        </p>
      </div>

      {/* Chapter I */}
      <Chapter numeral="I" title="The camp" note="June 2026 · Jantar Mantar" />

      <div className="grid gap-6 md:grid-cols-12 md:items-start">
        <Frame
          photo={photos[1]}
          index={1}
          onOpen={setActivePhoto}
          className="md:col-span-7"
          aspect="aspect-[16/9]"
          sizes="(max-width: 768px) 100vw, 56vw"
        />
        <Frame
          photo={photos[2]}
          index={2}
          onOpen={setActivePhoto}
          className="md:col-span-5"
          aspect="aspect-[4/5]"
          sizes="(max-width: 768px) 100vw, 34vw"
        />
        <Frame
          photo={photos[3]}
          index={3}
          onOpen={setActivePhoto}
          className="md:col-span-7 md:col-start-4"
          aspect="aspect-[3/2]"
          sizes="(max-width: 768px) 100vw, 56vw"
        />
      </div>

      <motion.blockquote
        className="my-14 border-y border-accent-gold/25 bg-accent-gold/[0.04] px-5 py-9 text-center sm:px-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
      >
        <p className="mx-auto max-w-3xl font-display text-xl font-light italic leading-snug text-foreground sm:text-2xl">
          “We asked for Make in India. You gave us Leak in India.”
        </p>
        <footer className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          Slogan at Jantar Mantar · reported by Mint, 6 June 2026
        </footer>
      </motion.blockquote>

      {/* Chapter II */}
      <Chapter numeral="II" title="20 July" note="The march · the barricades · the night" />

      <Frame
        photo={photos[4]}
        index={4}
        onOpen={setActivePhoto}
        aspect="aspect-[3/2]"
        sizes="100vw"
      />

      <div className="mt-8 grid gap-6 md:grid-cols-12 md:items-end">
        <Frame
          photo={photos[5]}
          index={5}
          onOpen={setActivePhoto}
          className="md:col-span-4"
          aspect="aspect-[3/4]"
          sizes="(max-width: 768px) 100vw, 30vw"
        />
        <Frame
          photo={photos[6]}
          index={6}
          onOpen={setActivePhoto}
          className="md:col-span-4"
          aspect="aspect-[9/14]"
          sizes="(max-width: 768px) 100vw, 30vw"
        />
        <div className="md:col-span-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent-gold">
            What happened
          </p>
          <div className="mt-3 border-l border-border/70 pl-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              On 20 July, CJP called for a march to Parliament. Police stopped the procession at
              layered barricades; the day ended in lathi-charges and tear gas. Delhi Police put
              the number of injured at around 180, including its own personnel.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Protesters sheltered inside Bangla Sahib gurdwara as the streets emptied.
            </p>
          </div>
        </div>
      </div>

      <Frame
        photo={photos[7]}
        index={7}
        onOpen={setActivePhoto}
        className="mt-8"
        aspect="aspect-[16/9]"
        sizes="100vw"
      />

      {/* Chapter III */}
      <Chapter numeral="III" title="After dark" note="Kerala House · Jantar Mantar" />

      <div className="grid gap-6 md:grid-cols-12 md:items-start">
        <Frame
          photo={photos[8]}
          index={8}
          onOpen={setActivePhoto}
          className="md:col-span-7"
          aspect="aspect-[4/3]"
          sizes="(max-width: 768px) 100vw, 56vw"
        />
        <Frame
          photo={photos[9]}
          index={9}
          onOpen={setActivePhoto}
          className="md:col-span-5"
          aspect="aspect-[4/3]"
          sizes="(max-width: 768px) 100vw, 34vw"
        />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <p className="font-display text-xl font-light leading-relaxed text-foreground sm:text-2xl">
            That night, the stage at Jantar Mantar was being rebuilt.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Near Janpath, a bus stood damaged; a police car lay overturned. Near Kerala House, a
            poster read: <span lang="hi">ab aur chup nahi rahenge</span> — we will stay silent no
            longer. Dipke, who had repeatedly urged discipline, sat in the crowd and wept.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Five days later, on 25 July, Education Minister Dharmendra Pradhan resigned. CJP called
            off the protest. The photographs are the record.
          </p>
          <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.18em] text-accent-gold">
            The map that follows is the reconstruction.
          </p>
        </div>
        <div className="md:col-span-5">
          <Frame
            photo={photos[10]}
            index={10}
            onOpen={setActivePhoto}
            aspect="aspect-[3/4]"
            sizes="(max-width: 768px) 100vw, 34vw"
          />
        </div>
      </div>

      {/* Contact sheet */}
      <div className="mt-16 border-t border-border/60 pt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Contact sheet · 11 frames · Jantar Mantar / Delhi / 2026
          </p>
          <p className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:block">
            Click to enlarge
          </p>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-6 sm:gap-2 sm:overflow-visible sm:px-0 lg:grid-cols-11">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActivePhoto(index)}
              className="group relative aspect-square w-20 shrink-0 overflow-hidden border border-border/50 bg-black/50 sm:w-auto"
              aria-label={`View frame ${index + 1}: ${photo.caption}`}
            >
              <Image
                src={photo.src}
                alt=""
                fill
                sizes="120px"
                className="object-cover opacity-75 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              />
              <span className="absolute bottom-1 left-1 bg-black/60 px-1 font-mono text-[8px] tracking-[0.12em] text-white/80">
                {String(index + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* The record — full videos */}
      <div className="mt-20 border-t border-border/60 pt-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-gold">
              The record
            </span>
            <h3 className="mt-2 font-display text-3xl font-light sm:text-4xl">
              Watch the full recordings
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The voices in this documentary are excerpts from public recordings. Nothing has been
              re-uploaded: each card opens the original video on YouTube, at the moment the excerpt
              begins.
            </p>
            <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
              Full recordings · external player · some quotes translated from Hindi
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {videos.map((video, index) => (
              <button
                key={video.id}
                type="button"
                onClick={() => openVideo(index)}
                data-ambient-ignore="true"
                className="group flex min-h-[210px] flex-col justify-between border border-border/60 bg-card/50 p-5 text-left transition-all duration-500 hover:border-accent-gold/50 hover:bg-card"
                aria-label={`Play video: ${video.title} — ${video.source}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
                    {video.source} · {video.date}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-gold/40 text-accent-gold transition-colors group-hover:bg-accent-gold group-hover:text-accent-foreground">
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-6 block">
                  <span className="block font-display text-lg font-light leading-snug">
                    “{video.quote}”
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">{video.speaker}</span>
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent-gold">
                  Watch · {video.title}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-12 max-w-3xl text-xs leading-relaxed text-muted-foreground/80">
        Photographs are reproduced from the original publishers for documentary commentary and are
        credited in every caption. Rights remain with the photographers and publishers; any frame
        will be removed on request. Corrections and takedown requests can be opened on{' '}
        <a
          href="https://github.com/Nightowl-w/cjp-documentary/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-border/70 underline-offset-2 transition-colors hover:text-accent-gold"
        >
          GitHub
        </a>
        .
      </p>

      {mounted &&
        createPortal(
          <>
            {/* Photo viewer */}
            <AnimatePresence>
        {currentPhoto && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Photograph ${(activePhoto ?? 0) + 1} of ${photos.length}`}
          >
            <div className="flex h-[100dvh] flex-col">
              <div className="flex items-center justify-between px-4 py-3 sm:px-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  Frame {String((activePhoto ?? 0) + 1).padStart(2, '0')} / {photos.length}
                </p>
                <button
                  type="button"
                  autoFocus
                  onClick={closePhoto}
                  className="rounded-full border border-white/20 p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close photograph"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div
                className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16"
                onClick={closePhoto}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    previousPhoto();
                  }}
                  className="absolute left-1 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:left-4"
                  aria-label="Previous photograph"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Use the original file here: the lightbox should show the full frame,
                    not a viewport-sized optimizer variant. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPhoto.src}
                  alt={currentPhoto.alt}
                  width={currentPhoto.width}
                  height={currentPhoto.height}
                  onClick={(event) => event.stopPropagation()}
                  className="h-auto max-h-[72dvh] w-auto max-w-full object-contain"
                />

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-1 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:right-4"
                  aria-label="Next photograph"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mx-auto w-full max-w-4xl px-4 pb-6 sm:px-8">
                <p className="text-sm leading-relaxed text-white/90">{currentPhoto.caption}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/50">
                  <span>
                    {currentPhoto.location} · {currentPhoto.date}
                  </span>
                  <span aria-hidden="true">/</span>
                  <a
                    href={currentPhoto.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition-colors hover:text-accent-gold"
                  >
                    {currentPhoto.credit}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video player */}
      <AnimatePresence>
        {currentVideo && (
          <motion.div
            className="fixed inset-0 z-[100] overflow-y-auto bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Video: ${currentVideo.title}`}
          >
            <div
              className="flex min-h-full items-center justify-center p-4 sm:p-8"
              onClick={closeVideo}
            >
              <div
                className="w-full max-w-5xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-gold">
                      The record · {currentVideo.source}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-light text-white sm:text-2xl">
                      {currentVideo.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    autoFocus
                    onClick={closeVideo}
                    className="shrink-0 rounded-full border border-white/20 p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Close video"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-black">
                  <iframe
                    src={embedUrl(currentVideo)}
                    title={`${currentVideo.title} — ${currentVideo.source}`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-white/60">{currentVideo.note}</p>
                  <a
                    href={youtubeUrl(currentVideo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-accent-gold transition-colors hover:text-accent-gold/70"
                  >
                    Watch on YouTube
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
}
