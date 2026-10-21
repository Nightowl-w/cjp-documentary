'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Scene } from '@/components/three/Scene';
import { JantarMantarMap } from '@/components/three/JantarMantarMap';
import { PhotoEssay } from '@/components/documentary/PhotoEssay';
import { AnimatedTimeline } from '@/components/timeline/AnimatedTimeline';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { VoicePlayer } from '@/components/audio/VoicePlayer';
import { useAmbientAudio } from '@/components/audio/useAmbientAudio';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  Volume2,
  VolumeX,
  ChevronRight,
  Mic,
  Users,
  Heart,
  MapPin,
  Scale,
  BookOpen,
  Info,
  Globe,
  Newspaper,
  Camera,
  Radio,
  Code2,
  Map as MapIcon,
  Gavel,
  ShieldCheck,
  Eye,
  ExternalLink,
} from 'lucide-react';

const sections = [
  { id: 'hero', name: 'Hero', index: 0 },
  { id: 'context', name: 'Context', index: 1 },
  { id: 'timeline', name: 'Timeline', index: 2 },
  { id: 'voices', name: 'Voices', index: 3 },
  { id: 'photos', name: 'Photos', index: 4 },
  { id: 'site', name: 'The Site', index: 5 },
  { id: 'outcome', name: 'Outcome', index: 6 },
  { id: 'sources', name: 'Sources', index: 7 },
  { id: 'credits', name: 'Credits', index: 8 },
];

const contextCards = [
  {
    id: 'word',
    title: 'A word became a movement',
    content:
      'On 15 May 2026, during a Supreme Court hearing, Chief Justice Surya Kant compared unemployed young Indians to “cockroaches”. Within a day, a satirical post by Abhijeet Dipke asked what would happen if the cockroaches organised. The Cockroach Janta Party was born on 16 May — a parody party that became the loudest address for a generation’s anger.',
    icon: Scale,
  },
  {
    id: 'exam',
    title: 'The exam that broke trust',
    content:
      'NEET-UG 2026 was cancelled after reports of paper leaks and irregularities. By CJP’s account, the crisis touched more than a crore students across NEET, CUET, CBSE and SSC-GD examinations. Several aspirants reportedly died by suicide. The demand was simple: accountability at the top, starting with the Education Minister.',
    icon: BookOpen,
  },
  {
    id: 'site',
    title: 'Why Jantar Mantar',
    content:
      'Delhi’s designated protest ground sits between the 18th-century observatory and Parliament. From early June 2026, students, parents and exam aspirants made it the country’s most visible address for exam reform — a sit-in that held for seven weeks, through heat, rain and a lathi charge.',
    icon: MapPin,
  },
];

const voiceEntries = [
  {
    id: 'dipke',
    speaker: 'Abhijeet Dipke',
    role: 'Founder, Cockroach Janta Party',
    type: 'speech' as const,
    audio: '/audio/dipke.mp3',
    source: 'NDTV',
    sourceUrl: 'https://www.youtube.com/watch?v=vDD5ZgZpezk',
    sourceNote: '25 July 2026 · 0:07–0:38',
    transcript:
      'We have done it. We have done it. धर्मेंद्र प्रधान ने रिज़ाइन कर दिया है। क्या कहते थे ये? क्या कहते थे? इस सरकार में इस्तीफ़े नहीं होते। हम कहना चाहते हैं — झुकती है दुनिया, झुकाने वाला चाहिए।',
    translation:
      'We have done it. We have done it. Dharmendra Pradhan has resigned. What did they say? What did they say? That there are no resignations in this government. We want to say — the world bows, but it takes someone to make it bow.',
  },
  {
    id: 'wangchuk',
    speaker: 'Sonam Wangchuk',
    role: 'Education reformer · On hunger strike',
    type: 'speech' as const,
    audio: '/audio/wangchuk.mp3',
    source: 'Sonam Wangchuk (official channel)',
    sourceUrl: 'https://www.youtube.com/watch?v=euPMOFtH_38',
    sourceNote: '28 June 2026 · Day 14 of the fast',
    transcript:
      'नमस्कार साथियों। आप लोगों में से ज़्यादातर को तो पता चल ही चुका होगा कि हम पिछले 14 दिनों से यहां जंतर मंतर पे अनशन पे हैं — नमक और पानी पे। जो नीट की परीक्षाओं में 20 बच्चों ने आत्महत्याएं की हैं, या शिक्षा प्रणाली में सुधार की जो ज़रूरत है, उसके लिए सब सरकार से जवाबदेही मांगने के लिए…',
    translation:
      'Greetings, friends. Most of you already know that we have been on a hunger strike here at Jantar Mantar for the last 14 days — on salt and water. For the 20 children who died by suicide over the NEET examinations, and for the reforms our education system needs — to demand accountability from the government…',
  },
  {
    id: 'student',
    speaker: 'SSC aspirant',
    role: 'Student at Jantar Mantar · Name not stated in source',
    type: 'testimony' as const,
    audio: '/audio/student.mp3',
    source: 'The Hindu (ground report)',
    sourceUrl: 'https://www.youtube.com/watch?v=qa20AKineKc',
    sourceNote: '1:11–1:36',
    transcript:
      'ये मेरे डोमेन में एसएससी का पेपर आता था। मुझे आता था तो मैंने दिया। मेरे नंबर जो इस बार दिल्ली पुलिस कांस्टेबल में थे, वो 75 मार्क्स थे। तो क्या ये मेरी गलती है कि आपने ईजी शिफ्ट में मेरा नंबर रखा? ... अब यह हुआ है कि मेरे 75 मार्क्स से 10 नंबर काट के 65 कर दिया। मैं इन लिस्ट था और मैं आउट ऑफ द लिस्ट हो गया।',
    translation:
      'The SSC paper was from my domain. I knew it, so I attempted it. My marks in this year’s Delhi Police Constable exam were 75. Is it my fault that you put my paper in an easy shift? ... Now what has happened is — from my 75 marks, 10 were cut and it became 65. I was on the list, and I went out of the list.',
  },
  {
    id: 'parent',
    speaker: 'Parent at the protest',
    role: 'Father of a student · Name not stated in source',
    type: 'testimony' as const,
    audio: '/audio/parent.mp3',
    source: 'The Hindu (ground report)',
    sourceUrl: 'https://www.youtube.com/watch?v=qa20AKineKc',
    sourceNote: '3:28–3:42',
    transcript:
      'मैं एक बाप बन के आया हूं। मैं किसी अपने बच्चे के बाप हूं। तो मैं प्रोटेस्ट में हाजिर हुआ। मैं हाजिरी देने आया हूं। आने वाले वक्त में मैं समझता हूं कि मोदी सरकार नहीं रहेगी, और प्रधान को तो इस्तीफा देना ही होगा।',
    translation:
      'I have come here as a father. I am the father of someone’s child. So I came to the protest. I have come to show up. In the times to come, I believe the Modi government will not remain, and Pradhan will have to resign.',
  },
  {
    id: 'cjp-rep',
    speaker: 'CJP organiser',
    role: 'Speaking to reporters at Jantar Mantar · Name not stated in source',
    type: 'testimony' as const,
    audio: '/audio/cjp-rep.mp3',
    source: 'The Indian Express',
    sourceUrl: 'https://www.youtube.com/watch?v=BNS7Tr6ngmo',
    sourceNote: '20 June 2026 · 0:00–0:19',
    transcript:
      'वाशरूम का एक्सेस, पानी का एक्सेस, लाइट का एक्सेस। यहां पे इतनी सारी वुमेन प्रोटेस्टर्स हैं, और लाइट इतना कम है। अगर कुछ भी प्रॉब्लम हो जाता है तो दिल्ली पुलिस विल बी रेस्पोंसिबल। आज अगर आपने इस तरह की हरकतें जारी रखीं, तो करोड़ों युवाओं का आप पर से भरोसा उठ जाएगा। ये लड़ाई हम आपके बच्चों के लिए भी लड़ रहे हैं।',
    translation:
      'Access to washrooms, access to water, access to light. There are so many women protesters here, and the light is so low. If anything happens, Delhi Police will be responsible. If you keep behaving like this, millions of young people will lose faith in you. We are fighting this fight for your children too.',
  },
  {
    id: 'chant',
    speaker: 'Protesters at Jantar Mantar',
    role: 'Collective voice',
    type: 'chant' as const,
    audio: '/audio/chant.mp3',
    source: 'The Hindu (ground report)',
    sourceUrl: 'https://www.youtube.com/watch?v=qa20AKineKc',
    sourceNote: '2:36–2:59 · crowd chant, partially indistinct',
    transcript:
      'जय भीम! जय भीम! जय भीम! बदलो-बदलो आज की शिक्षा! नहीं तो जागे युवा हुए तैयार!',
    translation:
      'Jai Bhim! Jai Bhim! Jai Bhim! Change today’s education — or the youth have awakened, ready!',
  },
];

const groundHotspots = [
  {
    id: 'samrat',
    title: 'Samrat Yantra',
    description:
      'The giant sundial at the edge of the grounds — an 18th-century instrument of measurement that became the backdrop for demands of accountability.',
  },
  {
    id: 'stage',
    title: 'The people’s stage',
    description:
      'Where Abhijeet Dipke, Sonam Wangchuk and student organisers addressed the crowd through the evenings.',
  },
  {
    id: 'tents',
    title: 'Tents and the sit-in',
    description:
      'Shelter for students and families who stayed for weeks through Delhi’s summer heat and monsoon rain.',
  },
  {
    id: 'langar',
    title: 'Food, water and medical lines',
    description:
      'Volunteers ran food, water and medical support through the day. On 20 June, CJP accused Delhi Police of cutting off access to water, food and washrooms.',
  },
  {
    id: 'barricades',
    title: 'Police barricades',
    description:
      'On 20 July, layered barricades and heavy deployment stopped the Chalo Sansad march before it could reach Parliament.',
  },
  {
    id: 'bangla-sahib',
    title: 'Gurdwara Bangla Sahib',
    description:
      'The nearby gurdwara sheltered protesters during the baton charge and tear-gas shelling on 20 July.',
  },
];

const outcomeCards = [
  {
    id: 'resignation',
    title: 'The minister resigns',
    date: 'Jul 25',
    description:
      'Union Education Minister Dharmendra Pradhan tenders his resignation — the movement’s central demand.',
    icon: Scale,
  },
  {
    id: 'cases',
    title: 'No cases for peaceful protesters',
    date: 'Jul 23–25',
    description:
      'Written assurances that peaceful protesters will not face action, and that cases will be reviewed and withdrawn.',
    icon: ShieldCheck,
  },
  {
    id: 'compensation',
    title: 'Compensation promised',
    date: 'Jul 23',
    description:
      'Support for the families of students who died by suicide amid the exam crisis, within government rules.',
    icon: Heart,
  },
  {
    id: 'law',
    title: 'A stricter paper-leak law',
    date: 'Jul 23',
    description:
      'A commitment to fast-track courts and stronger penalties for exam paper leaks, plus a parliamentary discussion on the issue.',
    icon: Gavel,
  },
  {
    id: 'reform',
    title: 'Exam reform on the table',
    date: '2026 onwards',
    description:
      'A committee to examine exam reform and test security; NEET-UG is set to move to computer-based testing.',
    icon: BookOpen,
  },
  {
    id: 'watch',
    title: 'What remains',
    date: 'Ongoing',
    description:
      'The promises now need implementation — an independent probe into the leaks, compensation delivery, and cases actually withdrawn. CJP says its push for reform is not over.',
    icon: Eye,
  },
];

const sourceLinks = [
  {
    id: 'cjp',
    title: 'Cockroach Janta Party',
    publisher: 'Official website',
    description: 'The movement’s charter, demands and public statements.',
    href: 'https://www.cockroachjantaparty.org/',
    icon: Globe,
  },
  {
    id: 'ie',
    title: 'Five key moments from the CJP protest',
    publisher: 'The Indian Express',
    description: 'A reported timeline from the courtroom remark to Pradhan’s resignation.',
    href: 'https://indianexpress.com/article/india/cjp-protest-timeline-five-key-moments-dharmendra-pradhan-resignation-10803274/',
    icon: Newspaper,
  },
  {
    id: 'ap',
    title: 'India’s Cockroach Party protest demands minister’s resignation',
    publisher: 'AP News',
    description: 'Ground report on the utensil-banging protest and the demand for accountability.',
    href: 'https://apnews.com/article/india-cockroach-party-exam-leaks-protest-05fc69ad9aa4c59486acb734af5baa64',
    icon: Newspaper,
  },
  {
    id: 'hindu',
    title: 'Voices from the CJP protest at Jantar Mantar',
    publisher: 'The Hindu',
    description: 'Ground report with protester interviews and the crowd chants used in this documentary.',
    href: 'https://www.youtube.com/watch?v=qa20AKineKc',
    icon: Radio,
  },
  {
    id: 'bbc',
    title: 'How Jantar Mantar became the centre of India’s biggest protests',
    publisher: 'BBC News India',
    description: 'Explainer on the observatory-turned-protest-site and the movement around it.',
    href: 'https://www.youtube.com/watch?v=M-6LtYNk3nA',
    icon: Radio,
  },
  {
    id: 'hindu-photos',
    title: 'When protest meets crackdown',
    publisher: 'The Hindu · Photo essay',
    description: 'Akul Baiju’s photographs of the 20 July crackdown and its aftermath.',
    href: 'https://www.thehindu.com/photos/when-protest-meets-crackdown-cockroach-janta-party-protest-in-pictures/article71247873.ece',
    icon: Camera,
  },
  {
    id: 'ie-photos',
    title: 'CJP holds second protest at Jantar Mantar',
    publisher: 'The Indian Express · Photo essay',
    description: 'Express Photo from the 20 June sit-in, thali protest and camp.',
    href: 'https://indianexpress.com/photos/india-news/in-photos-cjp-holds-second-protest-at-jantar-mantar-over-exam-irregularities/',
    icon: Camera,
  },
  {
    id: 'mint-photos',
    title: 'Inside CJP’s Jantar Mantar protest',
    publisher: 'Mint · Visual story',
    description: 'Placards, slogans, a tambourine and flowers from 6 June 2026.',
    href: 'https://www.livemint.com/photos/inside-cjps-jantar-mantar-protest-a-visual-story-of-placards-slogans-tambourine-and-flowers-11780730802315.html',
    icon: Camera,
  },
  {
    id: 'repo',
    title: 'This documentary on GitHub',
    publisher: 'Source code',
    description: 'Reproducible audio preparation, corrections and the full commit history.',
    href: 'https://github.com/Nightowl-w/cjp-documentary',
    icon: Code2,
  },
];

const creditsCategories = [
  {
    title: 'The Documentary',
    items: [
      'Independent research, writing and edit',
      'Design and art direction',
      '3D scene and interaction',
      'Timeline and source checks',
    ],
  },
  {
    title: 'Media Sources',
    items: [
      'Cockroach Janta Party (official)',
      'Sonam Wangchuk (official)',
      'NDTV',
      'The Indian Express',
      'The Hindu',
      'Mint',
      'PTI (agency photographs)',
    ],
  },
  {
    title: 'Technical',
    items: ['Next.js 15 / React 19', 'Three.js', 'Framer Motion', 'Tailwind CSS', 'Vercel'],
  },
  {
    title: 'Acknowledgments',
    items: [
      'The students, parents and organisers who spoke on the record',
      'Journalists who documented the protest',
      'Everyone who marched on 20 July',
      'In memory of the students who did not live to see the answer',
    ],
  },
];

export default function ClientPage() {
  const { reducedMotion } = usePreferences();
  const {
    playing: ambientPlaying,
    armed: ambientArmed,
    toggle: toggleAmbient,
    unavailable: ambientUnavailable,
  } = useAmbientAudio();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Every hook runs unconditionally, in a stable order. The previous version
  // returned early before these hooks while `mounted` was false, which threw
  // "Rendered more hooks than during the previous render" right after hydration.
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    return scrollYProgress.on('change', (value) => {
      setScrollProgress(value);
    });
  }, [scrollYProgress]);

  useEffect(() => {
    const updateActiveSection = () => {
      // The scroll-progress fraction is not proportional to section heights, so
      // derive the active section from the actual document positions instead.
      const marker = window.scrollY + window.innerHeight * 0.38;
      let next = 0;

      sectionRefs.current.forEach((element, index) => {
        if (!element) return;
        const top = element.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) next = index;
      });

      setActiveSection((current) => (current === next ? current : next));
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, []);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <ErrorBoundary>
      <>
        <Header />

        <Scene scrollProgress={scrollProgress} activeSection={activeSection} />

        {/* Section dots — presentation-friendly quick navigation (desktop) */}
        <nav
          className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
          aria-label="Section navigation"
        >
          {sections.map((section) => {
            const isActive = activeSection === section.index;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToSection(section.index)}
                aria-label={`Go to ${section.name}`}
                aria-current={isActive ? 'true' : undefined}
                className="pointer-events-auto group flex items-center gap-2"
              >
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] transition-opacity',
                    isActive
                      ? 'border-accent-gold/50 bg-black/70 text-accent-gold opacity-100'
                      : 'border-white/15 bg-black/60 text-white/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  )}
                >
                  {section.name}
                </span>
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full border transition-all',
                    isActive
                      ? 'scale-125 border-accent-gold bg-accent-gold'
                      : 'border-white/30 bg-white/10 group-hover:border-white/60'
                  )}
                />
              </button>
            );
          })}
        </nav>

        <main className="relative z-10 pt-16">
          {/* Hero Section */}
          <section
            ref={(el) => { sectionRefs.current[0] = el; }}
            id="hero"
            className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden"
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
                  INTERACTIVE DOCUMENTARY · 2026
                </motion.span>

                <motion.h1
                  className="text-display-xl sm:text-display-lg font-display font-light tracking-tight text-balance gradient-text mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Cockroach
                  <br />
                  <span className="gradient-gold">Janta Party</span>
                </motion.h1>

                <motion.h2
                  className="text-display-md font-display font-light text-muted-foreground mb-8 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  Fifty days at Jantar Mantar that toppled an education minister
                </motion.h2>

                <motion.p
                  className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                >
                  An interactive documentary on India’s 2026 youth uprising — from a courtroom insult
                  to a countrywide movement demanding accountability for exam paper leaks.
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
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      const map = document.getElementById('jantar-mantar-map');
                      // The photo essay sits between the hero and the map, so a smooth
                      // scroll would take seconds. Jump to the map, then start the tour.
                      if (map) {
                        map.scrollIntoView({ behavior: 'auto', block: 'center' });
                      } else {
                        scrollToSection(5);
                      }
                      window.setTimeout(
                        () => window.dispatchEvent(new CustomEvent('cjp:map-tour')),
                        reducedMotion ? 350 : 700
                      );
                    }}
                  >
                    <MapIcon className="w-5 h-5" aria-hidden="true" />
                    <span>Explore 3D Map</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="min-w-[13.5rem]"
                    onClick={() => void toggleAmbient()}
                    disabled={ambientUnavailable}
                    data-ambient-ignore="true"
                    data-ambient-state={
                      ambientUnavailable
                        ? 'unavailable'
                        : ambientPlaying
                          ? 'playing'
                          : ambientArmed
                            ? 'armed'
                            : 'off'
                    }
                    aria-pressed={ambientPlaying || ambientArmed}
                    aria-label={
                      ambientPlaying || ambientArmed
                        ? 'Turn ambient sound off'
                        : 'Turn ambient sound on'
                    }
                  >
                    {ambientPlaying || ambientArmed ? (
                      <Volume2 className="w-5 h-5" />
                    ) : (
                      <VolumeX className="w-5 h-5" />
                    )}
                    <span>
                      {ambientUnavailable
                        ? 'Audio Unavailable'
                        : ambientPlaying
                          ? 'Pause Ambience'
                          : ambientArmed
                            ? 'Ambience On'
                            : 'Ambience Off'}
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground sm:flex"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-caption">Scroll to Explore</span>
            </motion.div>
          </section>

          {/* Context Section */}
          <section
            ref={(el) => { sectionRefs.current[1] = el; }}
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
                <div className="max-w-none text-muted-foreground leading-relaxed">
                  <p className="mb-4">
                    Built in 1724 by Maharaja Jai Singh II, Jantar Mantar is an observatory of giant
                    masonry instruments. The Samrat Yantra — a 27-metre sundial — measures time. The
                    Jai Prakash Yantra maps the sky in hemispheric bowls. The Ram Yantra tracks
                    altitude and azimuth.
                  </p>
                  <p className="mb-4">
                    The ground beside it has spent decades as Delhi’s designated protest site — the
                    closest citizens can legally gather to Parliament. In 2026 the two histories met.
                    <strong> Instruments of observation became the backdrop for demands of accountability:</strong>{' '}
                    how long a paper leak can go unanswered, how many students it costs, how many
                    days a youth movement can hold a sit-in.
                  </p>
                  <p>
                    The 3D canvas behind this page is an interpretive sketch of that site — its
                    instruments, its timeline arc, its dust. It is a mood, not a survey.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Timeline Section */}
          <section
            ref={(el) => { sectionRefs.current[2] = el; }}
            id="timeline"
            className="section relative bg-background/95"
            aria-labelledby="timeline-heading"
          >
            <div className="container-wide">
              <motion.div
                className="max-w-4xl mb-6 sm:mb-8"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-caption font-medium text-accent-gold">02 — TIMELINE</span>
                <h2 id="timeline-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                  Seven Weeks, in Motion
                </h2>
                <p className="text-muted-foreground">
                  From a courtroom remark in May to a minister’s resignation in July. Click a date
                  or press play — eleven reported moments, one at a time.
                </p>
              </motion.div>

              <AnimatedTimeline />
            </div>
          </section>

          {/* Voices Section */}
          <section
            ref={(el) => { sectionRefs.current[3] = el; }}
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
                  The Voices That Would Not Bow
                </h2>
                <p className="text-muted-foreground">
                  Real recordings from the protest — the founder, a hunger striker, students, a
                  parent, an organiser and the crowd. Each clip is a short, attributed excerpt from
                  a public recording; transcripts follow the audio.
                </p>
              </motion.div>

              <div className="mb-8 flex max-w-3xl items-start gap-3 rounded-lg border border-accent-gold/25 bg-accent-gold/5 p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-gold" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Archive audio:</span> these are
                  excerpts from public recordings by CJP, NDTV, The Indian Express and The Hindu.
                  They are real voices, not synthesized narration. Excerpts are used for documentary
                  commentary and are credited beneath every clip.
                </p>
              </div>

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
                        <p className="text-caption text-muted-foreground">
                          {voice.role} • <span className="text-accent-gold">Real recording</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <VoicePlayer id={voice.id} src={voice.audio} label={voice.speaker} />

                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        <a
                          href={voice.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link inline-flex items-center gap-1 font-medium text-accent-gold hover:text-accent-gold/70"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          {voice.source}
                        </a>
                        <span className="mx-1.5">·</span>
                        {voice.sourceNote}
                      </p>

                      <details className="group">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                          View Transcript & Source
                        </summary>
                        <motion.div
                          className="mt-3 p-4 bg-background/50 rounded-lg border border-border/50"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <p lang="hi" className="text-body-sm leading-relaxed">
                            {voice.transcript}
                          </p>
                          <div className="mt-4 border-t border-border/50 pt-3">
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                              English translation
                            </p>
                            <p className="text-body-sm leading-relaxed text-muted-foreground">
                              {voice.translation}
                            </p>
                          </div>
                        </motion.div>
                      </details>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          {/* In Pictures Section */}
          <section
            ref={(el) => { sectionRefs.current[4] = el; }}
            id="photos"
            className="section relative border-y border-border/60 bg-background/95"
            aria-labelledby="photos-heading"
          >
            <PhotoEssay />
          </section>

          {/* The Site Section */}
          <section
            ref={(el) => { sectionRefs.current[5] = el; }}
            id="site"
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
                <span className="text-caption font-medium text-accent-gold">05 — THE SITE</span>
                <h2 id="ground-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                  Stand Where They Stood
                </h2>
                <p className="text-muted-foreground">
                  An interactive 3D map of Jantar Mantar and the protest ground: orbit it, take the
                  guided tour, switch the light from golden hour to night, and trace the march that
                  was stopped before it reached Parliament.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8 }}
              >
                <JantarMantarMap />
              </motion.div>

              <div className="mt-16 mb-8 max-w-3xl">
                <h3 className="text-xl font-medium mb-2">Field notes</h3>
                <p className="text-muted-foreground text-sm">
                  What the map shows, in words. The full-page background canvas is a separate
                  ambient sketch; the interactive map above is the one to explore.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
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

          {/* Outcome Section */}
          <section
            ref={(el) => { sectionRefs.current[6] = el; }}
            id="outcome"
            className="section relative"
            aria-labelledby="outcome-heading"
          >
            <div className="container-wide">
              <motion.div
                className="max-w-3xl mb-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-caption font-medium text-accent-gold">06 — OUTCOME</span>
                <h2 id="outcome-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                  What the Protest Won
                </h2>
                <p className="text-muted-foreground">
                  The resignation was the headline demand. These are the commitments recorded as the
                  protest ended — and what still needs watching.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {outcomeCards.map((card, i) => (
                  <motion.article
                    key={card.id}
                    className="card-interactive group relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-accent-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                          <card.icon className="w-6 h-6 text-accent-gold" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{card.title}</h3>
                          <p className="font-mono text-caption text-accent-gold/70">{card.date}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{card.description}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          {/* Sources Section */}
          <section
            ref={(el) => { sectionRefs.current[7] = el; }}
            id="sources"
            className="section relative"
            aria-labelledby="sources-heading"
          >
            <div className="container-wide">
              <motion.div
                className="max-w-3xl mb-12"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-caption font-medium text-accent-gold">07 — SOURCES</span>
                <h2 id="sources-heading" className="text-display-lg font-display font-light mt-2 mb-4 gradient-text">
                  Read the Record
                </h2>
                <p className="text-muted-foreground">
                  This is an independent, unofficial documentary. Every claim on this page should be
                  checkable — start with these.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sourceLinks.map((source, i) => (
                  <motion.article
                    key={source.id}
                    className="card-interactive group flex flex-col"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center group-hover:bg-accent-gold/20 transition-colors">
                        <source.icon className="w-6 h-6 text-accent-gold" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium">{source.title}</h3>
                        <p className="text-caption text-muted-foreground">{source.publisher}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm flex-1 mb-4">{source.description}</p>
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold transition-colors hover:text-accent-gold/70"
                    >
                      Open source
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </motion.article>
                ))}
              </div>

              <motion.div
                className="mt-12 rounded-xl border border-border/60 bg-card/60 p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-xl font-medium mb-3">Corrections</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  If a date, name or transcript on this page is wrong, open an issue on the GitHub
                  repository. Audio excerpts and photographs are included for commentary and
                  education; rights remain with the original creators and publishers, and any
                  excerpt or frame will be removed on request from the rights holder.
                </p>
                <a
                  href="https://github.com/Nightowl-w/cjp-documentary/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-gold transition-colors hover:text-accent-gold/70"
                >
                  Open an issue
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </motion.div>
            </div>
          </section>

          {/* Credits Section */}
          <section
            ref={(el) => { sectionRefs.current[8] = el; }}
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
                <span className="text-caption font-medium text-accent-gold">08 — CREDITS</span>
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
                  For the students who asked only for a fair exam — and for everyone who kept
                  showing up.
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Unofficial documentary. Not affiliated with the Cockroach Janta Party or any
                  political party. Built with Next.js 15, Three.js, Framer Motion and Tailwind CSS.
                  Open source on{' '}
                  <a
                    href="https://github.com/Nightowl-w/cjp-documentary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    GitHub
                  </a>
                  .
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
    </ErrorBoundary>
  );
}
