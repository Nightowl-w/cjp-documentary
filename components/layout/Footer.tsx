import Link from 'next/link';
import { Code2, Globe, Scale, Heart, Users, BookOpen, Newspaper, Landmark, Camera } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container-wide py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6" aria-label="Cockroach Janta Party documentary home">
              <span className="text-xl font-display font-light tracking-tight gradient-gold">CJP</span>
            </Link>
            <p className="text-muted-foreground text-body-sm leading-relaxed mb-6 max-w-xs">
              An independent, unofficial documentary on the Cockroach Janta Party protest at Jantar
              Mantar, New Delhi — from the courtroom remark to a minister’s resignation.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/Nightowl-w/cjp-documentary"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-gold transition-colors"
                aria-label="GitHub repository"
              >
                <Code2 className="w-5 h-5" />
              </a>
              <a
                href="https://www.cockroachjantaparty.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-gold transition-colors"
                aria-label="Cockroach Janta Party official website"
              >
                <Globe className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/cockroachjantaparty/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent-gold transition-colors"
                aria-label="Cockroach Janta Party on Instagram"
              >
                <Heart className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4">Navigate</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {[
                  { href: '/#context', label: 'Context', icon: BookOpen },
                  { href: '/#timeline', label: 'Timeline', icon: Scale },
                  { href: '/#voices', label: 'Voices & Recordings', icon: Users },
                  { href: '/#photos', label: 'In Pictures', icon: Camera },
                  { href: '/#site', label: 'The Site', icon: Landmark },
                  { href: '/#outcome', label: 'What the Protest Won', icon: Heart },
                  { href: '/#sources', label: 'Sources', icon: Newspaper },
                ].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-gold transition-colors group">
                      <item.icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4">External Sources</h3>
            <ul className="space-y-3">
              {[
                { label: 'CJP official website', href: 'https://www.cockroachjantaparty.org/' },
                {
                  label: 'Indian Express timeline',
                  href: 'https://indianexpress.com/article/india/cjp-protest-timeline-five-key-moments-dharmendra-pradhan-resignation-10803274/',
                },
                { label: 'AP News report', href: 'https://apnews.com/article/india-cockroach-party-exam-leaks-protest-05fc69ad9aa4c59486acb734af5baa64' },
                { label: 'The Hindu ground report', href: 'https://www.youtube.com/watch?v=qa20AKineKc' },
                { label: 'Sonam Wangchuk (official)', href: 'https://www.youtube.com/watch?v=euPMOFtH_38' },
                { label: 'Corrections on GitHub', href: 'https://github.com/Nightowl-w/cjp-documentary/issues' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-accent-gold transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-medium text-lg mb-4">About This Project</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Real photographs and audio excerpts, credited beneath every frame and clip</li>
              <li>Built with Next.js 15, Three.js, Framer Motion</li>
              <li>Designed for accessibility (WCAG AA)</li>
              <li>Optimised for performance & low bandwidth</li>
              <li>Open source on GitHub · Deployed on Vercel</li>
              <li className="pt-4 border-t border-border/50">
                <span className="font-medium text-foreground">Content warning:</span> contains
                descriptions of police violence, exam paper leaks and student suicides, and
                photographs of the 20 July crackdown. Viewer discretion advised.
              </li>
              <li>
                <span className="font-medium text-foreground">Disclaimer:</span> unofficial and not
                affiliated with the Cockroach Janta Party or any political party.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} CJP Documentary Project (unofficial). Audio excerpts and photographs
            remain the property of their creators and publishers and are used for commentary and
            education.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/about#privacy" className="hover:text-accent-gold transition-colors">Privacy</Link>
            <Link href="/about#methodology" className="hover:text-accent-gold transition-colors">Methodology</Link>
            <Link href="/#credits" className="hover:text-accent-gold transition-colors">Credits</Link>
            <Link href="/about#contact" className="hover:text-accent-gold transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
