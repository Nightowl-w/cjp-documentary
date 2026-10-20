# CJP Protest at Jantar Mantar - Interactive Documentary
## Product Requirements Document

---

### **Project Overview**
An immersive, interactive documentary website documenting the Citizens for Justice and Peace (CJP) protest at Jantar Mantar, New Delhi. The experience should feel like a world-class digital exhibition — cinematic, respectful, and technically exceptional.

---

### **Core Philosophy**
- **Respect First**: Every design decision honors the protesters, their cause, and the gravity of the subject
- **Truth Over Spectacle**: 3D and motion serve the narrative, never distract from it
- **Accessibility as Baseline**: WCAG AA minimum, prefers-reduced-motion honored
- **Performance as Respect**: Fast loading, works on mobile, low-bandwidth friendly

---

### **Tech Stack**
| Layer | Technology | Reason |
|-------|------------|--------|
| Framework | Next.js 15 (App Router) + TypeScript | Modern React, excellent Vercel integration |
| 3D | Three.js + React Three Fiber (R3F) + Drei | Declarative 3D, React ecosystem |
| Animation | Framer Motion + GSAP ScrollTrigger | Complex choreography, scroll-driven narratives |
| Styling | Tailwind CSS + CSS Variables | Design system, dark mode, performance |
| Typography | Variable fonts (Inter, Space Grotesk) | Expressive, performant |
| Media | Next.js Image/Video, Mux/Cloudinary | Optimized delivery |
| Deployment | Vercel (connected) + GitHub | CI/CD, preview deployments |

---

### **Information Architecture**

#### **Pages / Sections**
1. **Landing / Hero** — Atmospheric entry, Jantar Mantar silhouette in 3D, ambient sound
2. **Context** — Historical background, why CJP, why Jantar Mantar
3. **Timeline** — Interactive 3D timeline of events (scroll-driven)
4. **Voices** — Testimonials, speeches, interviews (audio + transcript)
5. **Ground View** — Immersive 3D recreation of protest site
6. **Solidarity** — Map of support, signatures, global resonance
7. **Action / Resources** — Legal aid, donation, volunteer, share
8. **Credits / About** — Team, sources, methodology

---

### **3D & Visual Language**

#### **Jantar Mantar 3D Centerpiece**
- Astronomical instruments as metaphors: **time, precision, observation, truth**
- Samrat Yantra (sundial) → **shadow of injustice moving across time**
- Jai Prakash Yantra (hemispherical bowls) → **voices collected, amplified**
- Ram Yantra (cylindrical pillars) → **pillars of democracy, standing firm**

#### **Particle Systems**
- **Dust/motes** in light beams = individual voices, presence
- **Paper fragments** = petitions, pamphlets, suppressed documents
- **Sound visualization** = chants, speeches as waveform geometry

#### **Color Palette**
```
Dark Mode (default):
--bg-deep:       #0a0a0b        // Near black
--bg-elevated:   #131316        // Cards, panels
--fg-primary:    #fafafa        // Primary text
--fg-muted:      #a1a1aa        // Secondary text
--accent-gold:   #d4a843        // Warmth, dignity, justice
--accent-crimson:#b91c1c        // Urgency, blood, sacrifice
--accent-teal:   #0d9488        // Truth, clarity
--border:        #27272a        // Subtle divisions

Light Mode:
--bg-deep:       #fafafa
--bg-elevated:   #ffffff
--fg-primary:    #0a0a0b
--fg-muted:      #52525b
--accent-gold:   #b8860b
--accent-crimson:#991b1b
--accent-teal:   #0f766e
--border:        #e4e4e7
```

#### **Typography Scale**
- **Display**: Space Grotesk Variable (wght 300-700) — headlines, numbers
- **Body**: Inter Variable (wght 300-600) — reading text
- **Mono**: JetBrains Mono — timestamps, data, code

---

### **Motion Design Specification**

#### **Guiding Principles**
1. **Physics-based**: Spring animations, natural easing
2. **Staggered entrance**: Content breathes in, never dumps
3. **Scroll as conductor**: GSAP ScrollTrigger orchestrates 3D + 2D
4. **Reduced motion**: All animations have static fallbacks

#### **Key Choreographies**

| Moment | Animation |
|--------|-----------|
| Page load | 3D scene fades in → camera dolly → hero text reveals (staggered) |
| Section enter | Content lifts + fades (0.6s spring), 3D elements rotate into view |
| Timeline scrub | Camera moves along path, events scale/pulse at trigger points |
| Voice playback | Waveform draws in real-time, particle burst on key phrases |
| Hover (interactive) | Magnetic pull, subtle scale, color shift — 150ms spring |
| Transition | Page wipe via shader (custom WebGL), not DOM |

#### **Performance Budgets**
- **Initial JS**: < 120KB gzipped
- **3D scene**: < 500KB (GLTF + textures)
- **FPS**: 60fps desktop, 30fps mobile
- **LCP**: < 2.5s
- **CLS**: < 0.1

---

### **Content Strategy**

#### **Sources Required**
- CJP official statements, press releases
- News coverage (The Wire, Scroll, Article 14, etc.)
- Protest photographs (with attribution/permission)
- Video footage (protesters, speeches, police action)
- Legal documents, FIRs, court orders
- Testimonies (anonymized where needed)

#### **Tone Guidelines**
- **Factual, not sensational**
- **Human-centered**, not abstract
- **Urgent but dignified**
- **No voyeurism** — no graphic violence without purpose

---

### **Accessibility Checklist**
- [ ] Semantic HTML5 landmarks
- [ ] ARIA labels on all interactive 3D elements
- [ ] Keyboard navigation for all 3D interactions
- [ ] `prefers-reduced-motion` disables non-essential animation
- [ ] `prefers-contrast` high-contrast mode
- [ ] Transcripts for all audio/video
- [ ] Alt text for all images (descriptive, not decorative)
- [ ] Focus visible states
- [ ] Screen reader announcements for dynamic content

---

### **Technical Architecture**

#### **Project Structure**
```
cjp-documentary/
├── app/
│   ├── layout.tsx              # Root layout, providers, fonts
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Design tokens, global styles
│   ├── context/                # Context section
│   ├── timeline/               # Interactive timeline
│   ├── voices/                 # Testimonials
│   ├── ground/                 # 3D ground view
│   ├── solidarity/             # Support map
│   ├── action/                 # Resources
│   └── credits/                # About
├── components/
│   ├── three/                  # R3F components
│   │   ├── Scene.tsx           # Main canvas wrapper
│   │   ├── JantarMantar.tsx    # Monument group
│   │   ├── Particles.tsx       # Particle systems
│   │   ├── TimelinePath.tsx    # 3D timeline curve
│   │   └── shaders/            # Custom shaders
│   ├── ui/                     # Reusable UI
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── MediaPlayer.tsx     # Audio/video with waveform
│   │   ├── ScrollProgress.tsx
│   │   └── Transcript.tsx
│   └── layout/                 # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
├── lib/
│   ├── animations.ts           # GSAP/Framer configs
│   ├── three-utils.ts          # Three.js helpers
│   ├── content.ts              # Content data (JSON/MDX)
│   └── analytics.ts            # Privacy-respecting analytics
├── public/
│   ├── models/                 # GLTF/GLB files
│   ├── textures/
│   ├── audio/
│   └── videos/
├── styles/
│   └── globals.css
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

#### **State Management**
- **React Context**: User preferences (theme, reduced motion, language)
- **Zustand** (optional): 3D scene state, audio playback, scroll position
- **URL State**: Deep linking to timeline events, voices

---

### **Development Phases**

#### **Phase 1: Foundation (Day 1-2)**
- [ ] Next.js 15 + TypeScript + Tailwind setup
- [ ] Design token system (CSS variables)
- [ ] Font loading (variable fonts, fallback)
- [ ] R3F canvas wrapper + basic scene
- [ ] GitHub repo init + Vercel deploy

#### **Phase 2: 3D Core (Day 3-4)**
- [ ] Jantar Mantar monument modeling (primitives + GLTF)
- [ ] Lighting system (physical, time-of-day)
- [ ] Camera rig + scroll-driven camera path
- [ ] Particle systems (dust, paper, sound)
- [ ] Custom shaders (transition, glow, atmosphere)

#### **Phase 3: Narrative Sections (Day 5-7)**
- [ ] Landing/Hero with atmospheric entry
- [ ] Context section (scroll-triggered reveals)
- [ ] Interactive 3D Timeline
- [ ] Voices section (audio player + waveform)
- [ ] Ground View (immersive 3D)
- [ ] Solidarity map
- [ ] Action/Resources
- [ ] Credits

#### **Phase 4: Motion Polish (Day 8-9)**
- [ ] GSAP ScrollTrigger orchestration
- [ ] Framer Motion page transitions
- [ ] Micro-interactions (hover, focus, tap)
- [ ] Loading states, skeletons
- [ ] Reduced motion implementations

#### **Phase 5: Content & Deploy (Day 10)**
- [ ] Real content integration
- [ ] Image/video optimization
- [ ] Accessibility audit
- [ ] Performance audit (Lighthouse)
- [ ] GitHub push + Vercel production deploy

---

### **GitHub + Vercel Workflow**
1. `main` branch → Vercel Production
2. `develop` branch → Vercel Preview
3. Feature branches → Vercel Preview Deployments
4. PR checks: TypeScript, ESLint, Prettier, Lighthouse CI

---

### **Risks & Mitigations**

| Risk | Mitigation |
|------|------------|
| 3D performance on mobile | Fallback to 2D illustrations, `prefers-reduced-motion` |
| Content sensitivity | Legal review, anonymization, consent forms |
| Browser compatibility | Progressive enhancement, graceful degradation |
| Hosting takedown risk | Static export option, IPFS mirror, archive.org |
| Emotional impact | Content warnings, pause controls, support resources |

---

### **Success Metrics**
- **Qualitative**: Survivor/protester feedback, journalist recognition
- **Quantitative**: Time on page > 4min, scroll depth > 80%, shares
- **Technical**: Lighthouse > 90 all categories, zero critical a11y issues

---

### **Next Steps**
1. **Approve this PRD** → I'll scaffold the full project
2. **Provide content assets** (or I'll use placeholders with clear markers)
3. **Daily check-ins** on progress
4. **Final review** before GitHub push + Vercel deploy

---

*This document is a living specification. It will evolve as we build.*