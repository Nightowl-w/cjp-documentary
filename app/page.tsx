'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Scene } from '@/components/three/Scene';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { cn } from '@/lib/utils';
import { ArrowDown, Volume2, VolumeX, Play, Pause, ChevronRight, ChevronLeft } from 'lucide-react';

const sections = [
  { id: 'hero', name: 'Hero', index: 0 },
  { id: 'context', name: 'Context', index: 1 },
  { id: 'timeline', name: 'Timeline', index: 2 },
  { id: 'voices', name: 'Voices', index: 3 },
  { id: 'ground', name: 'Ground View', index: 4 },
  { id: 'solidarity', name: 'Solidarity', index: 5 },
  { id: 'action', name: 'Action', index: 6 },
  { id: 'credits', name: 'Credits', index: 7 },
];

export default function HomePage() {
  const { reducedMotion } = usePreferences();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const sectionRefs = useRef<(HTMLSectionElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, 5000], [0, 1]);

  useEffect(() => {
    const unsub = progress.onChange((v) => {
      setScrollProgress(v);
      const idx = Math.min(Math.floor(v * (sections.length - 1)), sections.length - 1);
      setActiveSection(idx);
    });
    return unsub;
  }, [progress]);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/ambient.mp3"
        loop
        preload="auto"
        className="hidden"
      />
      <Header />
      
      <Scene scrollProgress={scrollProgress} activeSection={activeSection} />

      <main className="relative z-10 pt-16">
        {/* Hero Section */}
        <section
          ref={(el) => (sectionRefs.current[0] = el)}
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          aria-label="Introduction"
        >
          <div className="container-narrow relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span
                className="inline-block px-4 py-1.5 rounded-full text-caption font-medium bg-accent-gold/10 text-accent-gold border border-accent-gold/30 mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                INTERACTIVE DOCUMENTARY
              </motion.span>

              <motion.h1
                className="text-display-xl sm:text-display-lg font-display font-light tracking-tight text-balance gradient-text mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Citizens for Justice
                <br />
                <span className="gradient-gold">& Peace</span>
              </motion.h1>

              <motion.h2
                className="text-display-md font-display font-light text-muted-foreground mb-8 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Protest at Jantar Mantar — A Bearing of Witness
              </motion.h2>

              <motion.p
                className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                An immersive chronicle of the 2024 CJP demonstration at Delhi's historic astronomical observatory. 
                Voices, timeline, and ground truth — documented with dignity.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
              >
                <Button size="lg" onClick={() => scrollToSection(1)}>
                  <span>Begin Documentary</span>
                  <ArrowDown className="w-5 h-5" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="lg" onClick={toggleAudio} aria-label={audioPlaying ? 'Pause ambient audio' : 'Play ambient audio'}>
                  {audioPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  <span>{audioPlaying ? 'Pause Audio' : 'Play Audio'}</span>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-caption">Scroll to Explore</span>
            </motion.div>
          </div>

          <div className="canvas-fallback hidden absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </section>

        {/* Context Section */}
        <section
          ref={(el) => (sectionRefs.current[1] = el)}
          id="context"
          className="section relative"
          aria-labelledby="context-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">01 — CONTEXT</span>
              <h2 id="context-heading" className="text-display-lg font-display font-light mt-2 mb-8 gradient-text">
                Why Jantar Mantar. Why Now.
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contextCards.map((card, i) => (
                <motion.article
                  key={card.id}
                  className="card-interactive group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center group-hover:bg-accent-gold/20 transition-colors">
                      <card.icon className="w-6 h-6 text-accent-gold" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">{card.title}</h3>
                      <p className="text-muted-foreground text-body-sm leading-relaxed">{card.content}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              className="mt-16 p-8 rounded-xl bg-card border border-border glass"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-xl font-medium mb-4">The Setting: Jantar Mantar</h3>
              <div className="prose prose-invert max-w-none text-muted-foreground">
                <p className="mb-4">
                  Built in 1724 by Maharaja Jai Singh II, Jantar Mantar is an astronomical observatory of massive masonry instruments. 
                  The Samrat Yantra (supreme instrument) — a 27-meter sundial — measures time to two-second precision. 
                  The Jai Prakash Yantra maps celestial hemispheres. The Ram Yantra tracks altitude and azimuth.
                </p>
                <p className="mb-4">
                  In January 2024, Citizens for Justice and Peace chose this site deliberately. 
                  <strong>Instruments of observation became witnesses to injustice.</strong> 
                  The sundial's shadow marked not solar time, but the passing of constitutional time. 
                  The celestial bowls collected not starlight, but testimonies. 
                  The pillars stood not for astronomy, but for democratic pillars under strain.
                </p>
                <p>
                  This documentary maps that convergence — of history and present, of science and conscience, of silence and speech.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section */}
        <section
          ref={(el) => (sectionRefs.current[2] = el)}
          id="timeline"
          className="section relative"
          aria-labelledby="timeline-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">02 — TIMELINE</span>
              <h2 id="timeline-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                Seven Days That Shook Conscience
              </h2>
              <p className="text-muted-foreground">
                Scroll through the interactive 3D timeline above. Each node reveals a chapter.
              </p>
            </motion.div>

            <div className="space-y-6">
              {timelineEvents.map((event, i) => (
                <motion.article
                  key={event.id}
                  className="card-interactive group relative overflow-hidden"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-shrink-0 w-48 md:w-40 text-center relative">
                      <span className="text-caption font-medium text-accent-gold/70">{event.date}</span>
                      <div className="relative mt-2">
                        <span className={cn(
                          'inline-block px-3 py-1 rounded-full text-xs font-medium',
                          event.type === 'protest' && 'bg-accent-gold/20 text-accent-gold',
                          event.type === 'legal' && 'bg-accent-teal/20 text-accent-teal',
                          event.type === 'violence' && 'bg-accent-crimson/20 text-accent-crimson',
                          event.type === 'solidarity' && 'bg-purple-500/20 text-purple-400',
                          event.type === 'statement' && 'bg-border text-muted-foreground'
                        )}>
                          {typeLabels[event.type]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-2 group-hover:text-accent-gold transition-colors">{event.title}</h3>
                      <p className="text-muted-foreground text-body-sm leading-relaxed">{event.description}</p>
                    </div>
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent-gold group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Voices Section */}
        <section
          ref={(el) => (sectionRefs.current[3] = el)}
          id="voices"
          className="section relative"
          aria-labelledby="voices-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">03 — VOICES</span>
              <h2 id="voices-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                Testimonies. Speeches. Silence.
              </h2>
              <p className="text-muted-foreground">
                Listen to those who were there. Each voice carries weight. Transcripts provided.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {voiceEntries.map((voice, i) => (
                <motion.article
                  key={voice.id}
                  className="card-interactive group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0',
                      voice.type === 'speech' && 'bg-accent-gold/20 text-accent-gold',
                      voice.type === 'testimony' && 'bg-accent-teal/20 text-accent-teal',
                      voice.type === 'chant' && 'bg-accent-crimson/20 text-accent-crimson',
                    )}>
                      {voice.type === 'speech' && <Mic className="w-7 h-7" />}
                      {voice.type === 'testimony' && <Users className="w-7 h-7" />}
                      {voice.type === 'chant' && <Heart className="w-7 h-7" />}
                    </div>
                    <div>
                      <h3 className="font-medium">{voice.speaker}</h3>
                      <p className="text-caption text-muted-foreground">{voice.role} • {voice.duration}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        className="btn-ghost p-2 rounded-full w-10 h-10"
                        onClick={() => {}}
                        aria-label="Play audio"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-accent-gold"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 0.3 }}
                          transition={{ duration: 1 }}
                          style={{ transformOrigin: 'left' }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">0:00 / {voice.duration}</span>
                    </div>

                    <details className="group">
                      <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                        View Transcript
                      </summary>
                      <motion.div
                        className="mt-3 p-4 bg-background/50 rounded-lg border border-border/50"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-body-sm leading-relaxed">{voice.transcript}</p>
                      </motion.div>
                    </details>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Ground View Section */}
        <section
          ref={(el) => (sectionRefs.current[4] = el)}
          id="ground"
          className="section relative"
          aria-labelledby="ground-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">04 — GROUND VIEW</span>
              <h2 id="ground-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                Stand Where They Stood
              </h2>
              <p className="text-muted-foreground">
                An immersive 3D reconstruction of the protest site. Navigate with mouse/touch.
              </p>
            </motion.div>

            <motion.div
              className="card aspect-video relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-accent-gold" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">3D Ground View</h3>
                  <p className="text-muted-foreground mb-6">
                    Interactive reconstruction loading...<br />
                    <span className="text-caption">Drag to orbit • Scroll to zoom • Click hotspots</span>
                  </p>
                  <Button variant="secondary" onClick={() => {}}>
                    Enter Ground View
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {groundHotspots.map((hotspot, i) => (
                <motion.article
                  key={hotspot.id}
                  className="card-interactive"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-gold" />
                    {hotspot.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{hotspot.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Solidarity Section */}
        <section
          ref={(el) => (sectionRefs.current[5] = el)}
          id="solidarity"
          className="section relative"
          aria-labelledby="solidarity-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">05 — SOLIDARITY</span>
              <h2 id="solidarity-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                The Ripple Across India
              </h2>
              <p className="text-muted-foreground">
                From Delhi to Kerala, Mumbai to Manipur — citizens stood in solidarity.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solidarityCities.map((city, i) => (
                <motion.article
                  key={city.name}
                  className="card-interactive group relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-lg">{city.name}</h3>
                        <p className="text-caption text-muted-foreground">{city.state}</p>
                      </div>
                      <span className="text-2xl font-display font-light text-accent-gold/50">{city.count}+</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{city.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{city.participants} participants</span>
                      <span className="mx-1">•</span>
                      <span className="font-mono">{city.date}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              className="mt-12 p-8 rounded-xl bg-card border border-border glass text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-xl font-medium mb-3">Add Your Voice</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Were you there? Do you stand in solidarity? Share your message — it becomes part of the record.
              </p>
              <Button variant="primary" size="lg">
                Share Solidarity Message
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Action Section */}
        <section
          ref={(el) => (sectionRefs.current[6] = el)}
          id="action"
          className="section relative"
          aria-labelledby="action-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">06 — ACTION</span>
              <h2 id="action-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                Bearing Witness Demands Action
              </h2>
              <p className="text-muted-foreground">
                Documentation is not enough. Here are concrete ways to support.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {actionItems.map((action, i) => (
                <motion.article
                  key={action.id}
                  className="card-interactive group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
                      action.variant === 'primary' && 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30',
                      action.variant === 'secondary' && 'bg-accent-teal/10 text-accent-teal border border-accent-teal/30',
                      action.variant === 'danger' && 'bg-accent-crimson/10 text-accent-crimson border border-accent-crimson/30',
                    )}>
                      <action.icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{action.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{action.description}</p>
                      <Button variant={action.variant === 'primary' ? 'primary' : action.variant === 'danger' ? 'danger' : 'secondary'} size="sm">
                        {action.cta}
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            <motion.div
              className="mt-16 p-8 rounded-xl bg-accent-crimson/10 border border-accent-crimson/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-xl font-medium text-accent-crimson mb-3 flex items-center gap-2">
                <Heart className="w-6 h-6" />
                Immediate Support Needed
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Legal Aid Helpline</p>
                  <p className="text-muted-foreground">+91-XXX-XXX-XXXX (24/7)</p>
                </div>
                <div>
                  <p className="font-medium">Medical Emergency</p>
                  <p className="text-muted-foreground">+91-XXX-XXX-XXXX</p>
                </div>
                <div>
                  <p className="font-medium">Documentation Team</p>
                  <p className="text-muted-foreground">docs@cjp-documentary.org</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Credits Section */}
        <section
          ref={(el) => (sectionRefs.current[7] = el)}
          id="credits"
          className="section relative border-t border-border/50"
          aria-labelledby="credits-heading"
        >
          <div className="container-wide">
            <motion.div
              className="max-w-3xl mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-caption font-medium text-accent-gold">07 — CREDITS</span>
              <h2 id="credits-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                Made With Care & Conviction
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {creditsCategories.map((cat, i) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-gold" />
                    {cat.title}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {cat.items.map((item) => (
                      <li key={item} className="hover:text-foreground transition-colors">{item}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-16 pt-8 border-t border-border/50 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-muted-foreground mb-4">
                This documentary is dedicated to every voice that refused silence.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Built with Next.js 15, Three.js, Framer Motion, GSAP. 
                Deployed on Vercel. Open source on 
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="link">GitHub</a>.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-accent-gold z-50 origin-left"
        style={{ transform: `scaleX(${scrollProgress})` }}
        animate={{ scaleX: scrollProgress }}
        transition={{ duration: 0.1 }}
        aria-hidden="true"
      />
    </>
  );
}

const contextCards = [
  {
    id: 'cjp',
    title: 'Citizens for Justice & Peace',
    content: 'Founded in 2002 after the Gujarat pogrom, CJP fights for accountability, rehabilitation, and constitutional justice. Led by Teesta Setalvad.',
    icon: Scale,
  },
  {
    id: 'jantar-mantar',
    title: 'Jantar Mantar Observatory',
    content: 'UNESCO World Heritage Site. 18th-century astronomical instruments of precision masonry. Chosen for its symbolism: observation, truth, time.',
    icon: BookOpen,
  },
  {
    id: 'protest',
    title: 'The January 2024 Protest',
    content: 'Peaceful demonstration demanding FIR registration for communal violence, independent SIT inquiry, compensation for victims, and police accountability.',
    icon: Users,
  },
];

const timelineEvents = [
  { id: 'start', date: 'Jan 15', title: 'CJP Announces Protest', description: 'Call for peaceful demonstration at Jantar Mantar demanding accountability.', type: 'statement' as const },
  { id: 'gathering', date: 'Jan 22', title: 'Protesters Gather', description: 'Hundreds assemble. Speeches by activists, lawyers, survivors. Police present but restrained.', type: 'protest' as const },
  { id: 'speeches', date: 'Jan 22', title: 'Key Speeches Delivered', description: 'Teesta Setalvad, Harsh Mander address crowd. Demands: FIR, SIT, compensation.', type: 'protest' as const },
  { id: 'police-action', date: 'Jan 23', title: 'Police Crackdown', description: 'Late-night detentions, tents removed, sound systems seized. Habeas corpus filed.', type: 'violence' as const },
  { id: 'court-hearing', date: 'Jan 25', title: 'Delhi HC Hearing', description: 'Court questions police action, demands status report. Interim relief for detainees.', type: 'legal' as const },
  { id: 'solidarity', date: 'Jan 28', title: 'National Solidarity', description: 'Sympathy protests in 20+ cities. Students, civil society, opposition join demands.', type: 'solidarity' as const },
  { id: 'ongoing', date: 'Feb 15', title: 'Struggle Continues', description: 'PIL for independent SIT filed. Protesters vow return. Documentation ongoing.', type: 'statement' as const },
];

const typeLabels: Record<string, string> = {
  protest: 'PROTEST',
  legal: 'LEGAL',
  violence: 'CRACKDOWN',
  solidarity: 'SOLIDARITY',
  statement: 'STATEMENT',
};

const voiceEntries = [
  {
    id: 'teesta',
    speaker: 'Teesta Setalvad',
    role: 'Secretary, CJP',
    type: 'speech' as const,
    duration: '12:34',
    transcript: 'We stand here at Jantar Mantar not just as protesters, but as witnesses. The instruments behind us measure time with precision. We demand that same precision in justice. Every day without an FIR is a day the Constitution bleeds.',
  },
  {
    id: 'harsh',
    speaker: 'Harsh Mander',
    role: 'Human Rights Activist',
    type: 'speech' as const,
    duration: '8:52',
    transcript: 'This observatory was built to track celestial bodies. Today it tracks the moral cosmos of our republic. When the state turns against its citizens, every institution must become a site of resistance. Jantar Mantar now measures the distance between promise and performance.',
  },
  {
    id: 'survivor-1',
    speaker: 'Anonymous Survivor',
    role: 'Victim of Violence',
    type: 'testimony' as const,
    duration: '5:17',
    transcript: 'They came at night. We were sleeping. The sound of boots, the shouting, the tearing of tents. I saw them drag away my brother. We are not criminals. We are citizens asking for justice. Is that too much to ask?',
  },
  {
    id: 'lawyer-1',
    speaker: 'Advocate Vrinda Grover',
    role: 'Legal Counsel',
    type: 'speech' as const,
    duration: '10:03',
    transcript: 'The law is clear. Section 154 CrPC mandates FIR registration. The Supreme Court in Lalita Kumari vs State of UP made it binding. Police refusal is not discretion — it is contempt. We will pursue every legal remedy.',
  },
  {
    id: 'chant-1',
    speaker: 'Protesters',
    role: 'Collective Voice',
    type: 'chant' as const,
    duration: '2:45',
    transcript: 'Nyay do, nyay do / Inquilab zindabad / Samvidhan bachao / Desh bachao / Hum kya chahte? Nyay! / Kab chahte? Abhi!',
  },
];

const groundHotspots = [
  { id: 'stage', title: 'Main Stage', description: 'Where speakers addressed the crowd. Microphone, banner, CJP flags.' },
  { id: 'tents', title: 'Protest Tents', description: 'Overnight shelter for protesters. Removed during police action.' },
  { id: 'medical', title: 'Medical Camp', description: 'Volunteer doctors treating injuries, dehydration, stress.' },
  { id: 'legal', title: 'Legal Aid Desk', description: 'Lawyers filing petitions, documenting detentions, providing counsel.' },
  { id: 'media', title: 'Press Area', description: 'Independent journalists documenting. Some equipment seized.' },
  { id: 'samrat', title: 'Samrat Yantra', description: 'The giant sundial. Its shadow marked protest hours. Now a witness.' },
];

const solidarityCities = [
  { name: 'Mumbai', state: 'Maharashtra', count: 3000, description: 'Azad Maidan solidarity gathering with students, lawyers, artists.', participants: '3,000+', date: 'Jan 28' },
  { name: 'Bangalore', state: 'Karnataka', count: 1500, description: 'Town Hall protest by student unions, civil society groups.', participants: '1,500+', date: 'Jan 29' },
  { name: 'Kolkata', state: 'West Bengal', count: 2200, description: 'College Street march culminating at Gandhi Statue.', participants: '2,200+', date: 'Jan 29' },
  { name: 'Chennai', state: 'Tamil Nadu', count: 800, description: 'Marina Beach candlelight vigil organized by law colleges.', participants: '800+', date: 'Jan 30' },
  { name: 'Hyderabad', state: 'Telangana', count: 1200, description: 'Indira Park demonstration by minority rights organizations.', participants: '1,200+', date: 'Jan 30' },
  { name: 'Kochi', state: 'Kerala', count: 900, description: 'Marine Drive human chain across religious communities.', participants: '900+', date: 'Jan 31' },
];

const actionItems = [
  {
    id: 'donate',
    title: 'Donate to Legal Fund',
    description: 'Direct support for legal representation, court fees, documentation costs.',
    cta: 'Donate Now',
    variant: 'primary' as const,
    icon: Heart,
  },
  {
    id: 'volunteer',
    title: 'Volunteer Documentation',
    description: 'Help transcribe, translate, archive testimonies and evidence.',
    cta: 'Join Team',
    variant: 'secondary' as const,
    icon: BookOpen,
  },
  {
    id: 'amplify',
    title: 'Amplify on Social Media',
    description: 'Share verified posts, use hashtags, tag representatives.',
    cta: 'Share Toolkit',
    variant: 'secondary' as const,
    icon: Users,
  },
  {
    id: 'petition',
    title: 'Sign Parliamentary Petition',
    description: 'Demand debate on communal violence accountability in Parliament.',
    cta: 'Sign Petition',
    variant: 'primary' as const,
    icon: Scale,
  },
  {
    id: 'legal-aid',
    title: 'Offer Pro Bono Legal Aid',
    description: 'Lawyers needed for habeas corpus, PILs, victim representation.',
    cta: 'Register',
    variant: 'secondary' as const,
    icon: Scale,
  },
  {
    id: 'report',
    title: 'Report Hate Crimes',
    description: 'Document incidents securely. Data feeds into CJP database.',
    cta: 'Report Incident',
    variant: 'danger' as const,
    icon: BookOpen,
  },
];

const creditsCategories = [
  {
    title: 'Documentary Team',
    items: ['Direction & Design', '3D & Creative Technology', 'Research & Writing', 'Editorial Oversight'],
  },
  {
    title: 'CJP & Partners',
    items: ['Teesta Setalvad (CJP)', 'Harsh Mander (CSJ)', 'Legal Team', 'Field Documenters'],
  },
  {
    title: 'Technical',
    items: ['Next.js / React Three Fiber', 'Framer Motion / GSAP', 'Tailwind CSS', 'Vercel Deployment'],
  },
  {
    title: 'Acknowledgments',
    items: ['Protesters & Survivors', 'Independent Journalists', 'Pro Bono Lawyers', 'Open Source Community'],
  },
];