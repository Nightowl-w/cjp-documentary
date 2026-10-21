"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  timelineEvents,
  timelineLegend,
  timelineTypeLabels,
  timelineTypeStyles,
} from "./timelineData";

const TOTAL = timelineEvents.length;
const AUTOPLAY_MS = 6500;
const START_X = 7;
const END_X = 93;

function nodeX(index: number) {
  return START_X + (index / (TOTAL - 1)) * (END_X - START_X);
}

function getDateDisplay(date: string) {
  const [month, second] = date.split(" ");

  if (second?.length === 4) {
    return { big: month.toUpperCase(), small: second };
  }

  return {
    big: (second ?? "").padStart(2, "0"),
    small: `${month.toUpperCase()} 2026`,
  };
}

export function AnimatedTimeline() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const animationsEnabled = mounted && !reduceMotion;

  const activeEvent = timelineEvents[active];
  const activeDate = getDateDisplay(activeEvent.date);
  const activeStyle = timelineTypeStyles[activeEvent.type];

  useEffect(() => {
    setMounted(true);
  }, []);

  const monthGroups = useMemo(() => {
    const groups: { month: string; start: number; end: number }[] = [];

    timelineEvents.forEach((event, index) => {
      const month = event.date.split(" ")[0];
      const last = groups[groups.length - 1];

      if (last && last.month === month) last.end = index;
      else groups.push({ month, start: index, end: index });
    });

    return groups;
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (active === TOTAL - 1) {
      setPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setActive((current) => Math.min(current + 1, TOTAL - 1));
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [active, playing]);

  const select = (index: number) => {
    setPlaying(false);
    setActive(index);
  };

  const step = (delta: number) => {
    setPlaying(false);
    setActive((current) => (current + delta + TOTAL) % TOTAL);
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }

    if (active === TOTAL - 1) setActive(0);
    setPlaying(true);
  };

  const gridStyle = {
    backgroundImage:
      "linear-gradient(to right, hsl(var(--border) / 0.18) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border) / 0.18) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
    maskImage: "radial-gradient(ellipse at center, black 15%, transparent 76%)",
    WebkitMaskImage:
      "radial-gradient(ellipse at center, black 15%, transparent 76%)",
  };

  return (
    <div>
      <div className="relative overflow-hidden border border-border/60 bg-background/95 shadow-2xl shadow-black/20 backdrop-blur-md">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={gridStyle}
          aria-hidden="true"
        />

        <div className="relative p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent-gold">
              <span className="sm:hidden">
                Moment {String(active + 1).padStart(2, "0")} ·{" "}
                {activeEvent.date}
              </span>
              <span className="hidden sm:inline">
                {TOTAL} reported moments · May–July 2026
              </span>
            </p>

            <div className="hidden flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex sm:max-w-[50%] sm:justify-end">
              {timelineLegend.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-foreground/70"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      timelineTypeStyles[type].dot,
                    )}
                    aria-hidden="true"
                  />
                  {timelineTypeLabels[type]}
                </span>
              ))}
            </div>
          </div>

          <div
            className="relative mt-4 h-[145px] sm:h-[175px]"
            role="group"
            aria-label="Animated timeline of reported moments"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-accent-gold/25 to-transparent blur-[2px]"
              aria-hidden="true"
            />

            <motion.div
              className="pointer-events-none absolute top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/10 blur-2xl"
              animate={{ left: `${nodeX(active)}%` }}
              transition={{
                duration: animationsEnabled ? 0.55 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              aria-hidden="true"
            />

            <motion.div
              className="pointer-events-none absolute bottom-0 top-0 z-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent-gold/75 to-transparent"
              animate={{ left: `${nodeX(active)}%` }}
              transition={{
                duration: animationsEnabled ? 0.55 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              aria-hidden="true"
            >
              <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent-gold shadow-lg shadow-accent-gold/50" />
            </motion.div>

            {timelineEvents.map((event, index) => {
              const selected = index === active;
              const above = index % 2 === 0;
              const style = timelineTypeStyles[event.type];

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => select(index)}
                  aria-label={`${event.date}: ${event.title}`}
                  aria-current={selected ? "step" : undefined}
                  title={`${event.date} — ${event.title}`}
                  className="absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-8 sm:w-8"
                  style={{ left: `${nodeX(index)}%`, top: "50%" }}
                >
                  {selected && animationsEnabled && (
                    <motion.span
                      className="pointer-events-none absolute inset-0 z-0 m-auto h-4 w-4 rounded-full border border-accent-gold/50"
                      initial={{ scale: 0.9, opacity: 0.6 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 block rounded-full border-2 border-background transition-all duration-300",
                      selected
                        ? cn(
                            "h-4 w-4 ring-2 ring-offset-2 ring-offset-background",
                            style.dot,
                            style.ring,
                            style.glow,
                          )
                        : cn("h-3 w-3", style.dot),
                    )}
                    aria-hidden="true"
                  />
                  <span
                    className={cn(
                      "pointer-events-none absolute left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300 sm:block",
                      above ? "bottom-full mb-1.5" : "top-full mt-1.5",
                      selected ? "text-accent-gold" : "text-foreground/70",
                    )}
                    aria-hidden="true"
                  >
                    {event.date}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-1 h-6" aria-hidden="true">
            {monthGroups.map((group) => {
              const left = nodeX(group.start);
              const width = nodeX(group.end) - left;

              return (
                <div
                  key={group.month}
                  className="absolute top-0 flex h-full flex-col items-center"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {group.month}
                  </span>
                  <span className="mt-1 h-px w-full bg-foreground/15" />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous timeline moment"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-accent-gold/50 hover:text-accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-pressed={playing}
                aria-label={playing ? "Pause timeline" : "Play timeline"}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-gold px-4 font-mono text-[9px] uppercase tracking-[0.16em] text-accent-foreground transition-colors hover:bg-accent-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {playing ? (
                  <Pause
                    className="h-3.5 w-3.5 fill-current"
                    aria-hidden="true"
                  />
                ) : (
                  <Play
                    className="h-3.5 w-3.5 fill-current"
                    aria-hidden="true"
                  />
                )}
                {playing ? (
                  "Pause"
                ) : (
                  <>
                    <span className="sm:hidden">Play</span>
                    <span className="hidden sm:inline">Play timeline</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next timeline moment"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:border-accent-gold/50 hover:text-accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                Click a node to jump
              </span>
              <span className="font-mono text-[10px] tabular-nums text-foreground/80">
                {String(active + 1).padStart(2, "0")}{" "}
                <span className="text-muted-foreground">
                  / {String(TOTAL).padStart(2, "0")}
                </span>
              </span>
            </div>
          </div>

          {playing && animationsEnabled && (
            <motion.div
              key={active}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-accent-gold/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
              aria-hidden="true"
            />
          )}
        </div>

        <div className="relative border-t border-border/60 bg-background/95 p-4 sm:p-6 lg:p-7">
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:gap-6">
            <div className="flex items-end justify-between gap-4 md:block">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  Moment {String(active + 1).padStart(2, "0")}
                </p>
                <div className="mt-1 flex flex-wrap items-end gap-x-2 gap-y-0.5 md:block">
                  <span className="font-display text-4xl font-light leading-none text-foreground sm:text-6xl">
                    {activeDate.big}
                  </span>
                  <span className="pb-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:mt-1.5 md:block md:pb-0">
                    {activeDate.small}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] md:mt-4",
                  activeStyle.badge,
                )}
              >
                {timelineTypeLabels[activeEvent.type]}
              </span>
            </div>

            <div className="min-w-0">
              <div className="grid">
                {timelineEvents.map((event) => (
                  <div
                    key={event.id}
                    className="invisible col-start-1 row-start-1"
                    aria-hidden="true"
                  >
                    <h3 className="font-display text-2xl font-light leading-snug sm:text-3xl">
                      {event.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                ))}

                <div
                  className="col-start-1 row-start-1"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeEvent.id}
                      initial={animationsEnabled ? { opacity: 0, y: 8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        animationsEnabled ? { opacity: 0, y: -6 } : undefined
                      }
                      transition={{
                        duration: animationsEnabled ? 0.25 : 0,
                        ease: "easeOut",
                      }}
                    >
                      <h3 className="font-display text-2xl font-light leading-snug text-foreground sm:text-3xl">
                        {activeEvent.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {activeEvent.description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-foreground/15">
                  <motion.div
                    className="h-full bg-accent-gold/70"
                    animate={{ width: `${((active + 1) / TOTAL) * 100}%` }}
                    transition={{ duration: animationsEnabled ? 0.45 : 0 }}
                  />
                </div>
                <a
                  href="#sources"
                  className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent-gold"
                >
                  Sourcing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Spacing follows sequence, not elapsed days</span>
        <span>Dates follow contemporaneous reporting</span>
      </div>
    </div>
  );
}
