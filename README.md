# CJP Protest at Jantar Mantar — Interactive Documentary

An immersive, respectful, world-class interactive documentary documenting the Citizens for Justice and Peace (CJP) protest at Jantar Mantar, New Delhi.

## Live Demo

**[cjp-documentary.vercel.app](https://cjp-documentary.vercel.app)**

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| 3D | Three.js + React Three Fiber + Drei |
| Animation | Framer Motion + GSAP ScrollTrigger |
| Styling | Tailwind CSS + CSS Variables |
| Fonts | Space Grotesk, Inter, JetBrains Mono (Variable) |
| Deployment | Vercel |

## Features

- **Cinematic 3D scene**: Jantar Mantar astronomical instruments recreated in Three.js — Samrat Yantra (sundial), Jai Prakash Yantra (hemispheric bowls), Ram Yantra (pillars), Misra Yantra
- **Particle systems**: Additive-blended shader particles representing voices, dust, and suppressed documents
- **Scroll-driven narrative**: GSAP ScrollTrigger orchestrates camera movement, section reveals, and timeline progression
- **Interactive timeline**: 7 key events from protest announcement to ongoing legal struggle
- **Voices section**: Audio players with waveform visualization, transcripts, and speaker info
- **Solidarity map**: Cities across India that stood in support
- **Action section**: Legal aid, volunteer, donation, petition links
- **Accessibility**: WCAG AA compliant, `prefers-reduced-motion` honored, keyboard navigable
- **Performance**: < 120KB initial JS, optimized images/videos, lazy-loaded 3D assets

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm
- GitHub account + GitHub CLI (`gh`) — optional but recommended
- Vercel account + Vercel CLI (`vercel`) — optional but recommended

### Installation

```bash
# Clone the repository
git clone https://github.com/Nightowl-w/cjp-documentary.git
cd cjp-documentary

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repository directly on [vercel.com](https://vercel.com) for automatic deployments on every push.

## Project Structure

```
cjp-documentary/
├── app/
│   ├── layout.tsx          # Root layout, fonts, providers
│   ├── page.tsx            # Main documentary page (all sections)
│   ├── globals.css         # Design tokens, global styles
│   └── fonts.ts            # Variable font loading
├── components/
│   ├── three/              # React Three Fiber components
│   │   ├── Scene.tsx       # Main canvas, lighting, post-processing
│   │   ├── JantarMantar.tsx # Monument 3D models
│   │   ├── ParticleSystem.tsx # Shader-based particles
│   │   └── TimelinePath.tsx   # 3D timeline curve
│   ├── ui/                 # Reusable UI components
│   │   └── Button.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── providers/          # Context providers
│       └── PreferencesProvider.tsx
├── lib/
│   └── utils.ts            # Utility functions
├── public/
│   ├── models/             # GLTF/GLB 3D models
│   ├── textures/
│   ├── audio/
│   └── videos/
├── PRD.md                  # Product Requirements Document
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── .gitignore
```

## Design Principles

1. **Respect first**: Every design decision honors the protesters, their cause, and the gravity of the subject
2. **Truth over spectacle**: 3D and motion serve the narrative, never distract from it
3. **Accessibility as baseline**: WCAG AA minimum, prefers-reduced-motion honored
4. **Performance as respect**: Fast loading, works on mobile, low-bandwidth friendly

## Content Warning

This documentary contains descriptions of police violence and communal harm. Viewer discretion advised. Support resources are linked in the Action section.

## License

This project is open source and available under the MIT License. Content used under fair use for documentation purposes.

## Contact

- **Website**: cjp-documentary.vercel.app
- **GitHub**: https://github.com/Nightowl-w/cjp-documentary
- **CJP Official**: https://cjp.org.in

---

*This documentary bears witness. Truth persists.*