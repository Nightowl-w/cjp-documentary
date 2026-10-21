import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Methodology, Media & Credits — Cockroach Janta Party Documentary',
  description:
    'How this interactive documentary was researched, how the real photographs and audio excerpts were sourced, and how visitor privacy is handled.',
};

const sections = [
  {
    id: 'methodology',
    title: 'Methodology',
    body: [
      'This documentary is assembled from public reporting and public recordings: The Indian Express, AP News, The Hindu, BBC News India, and the official channels of the Cockroach Janta Party and Sonam Wangchuk. Dates follow contemporaneous reporting. Disputed figures are attributed to the side that gave them — for example, the injury count from the 20 July march is described as Delhi Police’s figure, while protesters’ accounts are reported separately.',
      'The timeline covers May to July 2026, from the Supreme Court remark that gave the movement its name to Education Minister Dharmendra Pradhan’s resignation on 25 July. The 3D reconstruction of Jantar Mantar is an interpretive visualisation, not a survey-grade model: proportions and placement are approximate and intended to convey scale and atmosphere. The interactive map on the home page follows the same rule — it is a storytelling device, not a surveyed plan, and its guided tour narrates the camp and the 20 July march rather than claiming geographic precision.',
      'The voice clips are real excerpts from public recordings — not text-to-speech and not dramatic reconstructions. Every clip carries its source, date and timestamp in the Voices section. Transcripts follow the recording; where crowd audio is partially indistinct, the transcript is marked as approximate.',
      'The photo essay uses eleven published press photographs, not reconstructions: seven by Akul Baiju for The Hindu, two Express Photo frames from The Indian Express, and two Mint photographs. Each frame carries the publisher’s caption, date, place and credit, and links to the article it came from. The full recordings behind the audio excerpts stay on their original platforms and are linked from the In Pictures section; nothing is re-uploaded.',
      'Corrections and additional context are welcome. Documentation is treated as a living record, and this page will note substantive updates as they are verified.',
    ],
  },
  {
    id: 'audio',
    title: 'Photographs, Audio & Fair Use',
    body: [
      'Audio excerpts on this site are short extracts of publicly available recordings, used for documentary commentary, criticism and education. Rights remain with the original creators: the Cockroach Janta Party, Sonam Wangchuk, NDTV, The Indian Express and The Hindu. Each excerpt links to its full source so listeners can watch the complete recording in context.',
      'Photographs are reproduced from the reporting of The Hindu, The Indian Express and Mint, with the publishers’ own captions and credit. They are used for documentary commentary and education; rights remain with the photographers and publishers. No generative imagery is used. If you are a rights holder and want a photograph or excerpt removed, open an issue on the GitHub repository and it will be taken down promptly.',
      'No synthetic narration or voice cloning is used anywhere in the documentary.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'This site does not require an account and does not run advertising or third-party analytics. Theme, reduced-motion and ambience preferences are stored locally in your browser. No audio plays before you interact with the page: the ambience is armed by default and begins on your first click or tap. Use the Ambience On/Off button to mute it, and that choice is remembered.',
      'If you open an issue or contact the project, your message is used only to respond or to verify a correction. Identifying information is not published without explicit consent.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Corrections',
    body: [
      'This is an independent, unofficial documentary and is not affiliated with the Cockroach Janta Party or any political party. For corrections, source material or takedown requests, open an issue on the GitHub repository.',
      'For the movement’s own statements, or to support its work, go directly to the Cockroach Janta Party’s official website.',
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="relative z-10 pt-16">
        <section className="section">
          <div className="container-narrow">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-accent-gold transition-colors hover:text-accent-gold/70"
            >
              <span aria-hidden="true">←</span> Back to the documentary
            </Link>

            <span className="text-caption font-medium text-accent-gold">COLOPHON</span>
            <h1 className="mt-2 mb-6 font-display text-display-lg font-light gradient-text">
              How this record was made
            </h1>
            <p className="max-w-2xl text-body-lg leading-relaxed text-muted-foreground">
              An interactive documentary is still a document. These notes describe how the material
              was gathered, how the real recordings were prepared, and how visitor privacy is
              handled.
            </p>

            <div className="mt-16 space-y-14">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="mb-4 font-display text-2xl font-light">{section.title}</h2>
                  <div className="space-y-4 leading-relaxed text-muted-foreground">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 rounded-lg border border-border/60 bg-card/60 p-8">
              <h2 className="mb-3 font-display text-xl font-light">Credits</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Research, writing, design and development by the documentary project. Built with
                Next.js, Three.js, Framer Motion and Tailwind CSS. Deployed on Vercel. Open source
                on GitHub — including the script that prepares the audio excerpts from their
                original sources. Press photographs by Akul Baiju (The Hindu), Express Photo (The
                Indian Express), PTI and Mint. Dedicated to the students who asked only for a fair
                exam.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <a
                  href="https://github.com/Nightowl-w/cjp-documentary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  GitHub repository
                </a>
                <a
                  href="https://www.cockroachjantaparty.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  CJP official website
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
