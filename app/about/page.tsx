import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Methodology, Privacy & Credits — CJP Documentary',
  description:
    'How this interactive documentary was researched, built, and how we handle visitor privacy. Credits and contact information.',
};

const sections = [
  {
    id: 'methodology',
    title: 'Methodology',
    body: [
      'This documentary is assembled from public reporting, statements released by Citizens for Justice and Peace, court filings, and interviews conducted with organisers, lawyers, and survivors. Testimonies are presented as recorded; where anonymity was requested, identifying details have been withheld.',
      'The timeline reflects reported dates for the January 2024 demonstration and its aftermath. Disputed claims are attributed rather than presented as settled fact. The 3D reconstruction of Jantar Mantar is an interpretive visualisation, not a survey-grade model: proportions and placement are approximate and intended to convey scale and atmosphere.',
      'The voice clips in this documentary are neural text-to-speech readings in Hindi of the written testimony. They are not archival recordings and are labelled as synthesized narration throughout the site.',
      'Corrections and additional testimony are welcome. Documentation is treated as a living record, and this page will note substantive updates as they are verified.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'This site does not require an account and does not run advertising or third-party analytics. Theme and reduced-motion preferences are stored locally in your browser. Audio is opt-in and is never autoplayed.',
      'If you contact the documentation team, your message is used only to respond to you or to verify a correction. We do not publish identifying information without explicit consent.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Corrections',
    body: [
      'For corrections, press enquiries, or offers of pro bono legal and translation support, write to docs@cjp-documentary.org. Survivors seeking support should reach out to CJP directly through cjp.org.in rather than through this archive.',
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
              was gathered, how the reconstruction was built, and how we handle the trust of the
              people who shared their accounts.
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
                Research and writing by the CJP Documentation Team. 3D reconstruction, interaction
                design, and development by the documentary engineering team. Built with Next.js,
                Three.js, and Framer Motion. Deployed on Vercel. Open source on GitHub. Dedicated to
                every voice that refused silence.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
