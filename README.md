# Cockroach Janta Party at Jantar Mantar — Interactive Documentary

An independent, unofficial interactive documentary on the 2026 Cockroach Janta Party (CJP) protest at Jantar Mantar, New Delhi — from the Supreme Court remark that gave the movement its name to Education Minister Dharmendra Pradhan's resignation on 25 July 2026.

**Live:** [cjp-documentary.vercel.app](https://cjp-documentary.vercel.app)

## What the site contains

- **Cinematic 3D scene** — a stylised, non-survey reconstruction of Jantar Mantar's instruments, built with vanilla Three.js and scroll-driven camera motion.
- **Real audio excerpts** — recorded voices from the protest (Abhijeet Dipke, Sonam Wangchuk, students, a parent, a CJP organiser and a crowd chant), each credited with its source and timestamp. No text-to-speech, no voice cloning.
- **Reported timeline** — May to July 2026, with disputed figures attributed to their source.
- **Outcome section** — the resignation and the written assurances that ended the fast, plus what still needs watching.
- **Sources page content** — direct links to The Indian Express, AP News, The Hindu, BBC News India and official CJP channels.
- **Accessibility** — reduced-motion support, keyboard-navigable audio players, opt-in audio, no autoplay.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5 (App Router) + TypeScript |
| 3D | Three.js 0.186 (vanilla, no React Three Fiber) |
| Animation | Framer Motion |
| Styling | Tailwind CSS 3 + CSS variables |
| Fonts | Space Grotesk, Inter, JetBrains Mono |
| Deployment | Vercel |

## Real audio

Audio clips live in `public/audio/` and are short excerpts of public recordings, used for documentary commentary and education. Rights remain with the original creators (CJP, Sonam Wangchuk, NDTV, The Indian Express, The Hindu). Every clip links back to its full source on the site.

To reproduce the excerpts:

```bash
python -m pip install yt-dlp          # ffmpeg also required (or imageio-ffmpeg)
python scripts/prepare-audio.py
```

`scripts/prepare-audio.py` documents each clip's source, start/end time and credit line. Downloads are audio-only; full videos stay on their original platforms.

## Getting started

```bash
git clone https://github.com/Nightowl-w/cjp-documentary.git
cd cjp-documentary
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

Deploy: connect the GitHub repository on Vercel for automatic deployments, or run `vercel --prod`.

## Project structure

```
cjp-documentary/
├── app/
│   ├── layout.tsx          # Metadata, fonts, providers
│   ├── page.tsx            # Renders the client page
│   ├── about/page.tsx      # Methodology, audio/fair use, privacy, credits
│   ├── icon.svg            # Cockroach mark
│   └── globals.css         # Design tokens
├── components/
│   ├── pages/ClientPage.tsx        # Sections, timeline, voices data
│   ├── three/Scene.tsx             # Vanilla Three.js scene + monuments
│   ├── audio/VoicePlayer.tsx       # Play, pause, seek, duration
│   ├── audio/useAmbientAudio.ts    # Generative Web Audio ambience
│   ├── layout/Header.tsx
│   ├── layout/Footer.tsx
│   └── ui/                         # Button, ErrorBoundary
├── lib/utils.ts
├── public/audio/           # Six credited audio excerpts
├── scripts/prepare-audio.py
├── PRD.md
└── package.json
```

## Design principles

1. **Accuracy first** — dates and figures follow reporting, and disputed claims are attributed.
2. **No fake voices** — only real recordings, with source and timestamp on every clip.
3. **Respect** — the documentary centres students and families, and avoids spectacle.
4. **Accessibility as baseline** — reduced motion, keyboard support, opt-in audio.
5. **Performance** — fast on mobile and low bandwidth.

## Content warning

Contains descriptions of police violence, exam paper leaks and student suicides. Viewer discretion advised.

## Disclaimer and licence

This is an unofficial documentary and is not affiliated with the Cockroach Janta Party or any political party. Audio excerpts remain the property of their creators and are used for commentary and education; takedown requests are honoured via the repository issues page. Code is released under the MIT License.

## Contact

- GitHub: https://github.com/Nightowl-w/cjp-documentary
- CJP official: https://www.cockroachjantaparty.org/

---

*For the students who asked only for a fair exam.*
