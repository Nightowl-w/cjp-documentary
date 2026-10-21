'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePreferences } from '@/components/providers/PreferencesProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Menu, X, Scale, BookOpen, MapPin, Mic, Landmark, Newspaper, Camera } from 'lucide-react';

const navItems = [
  { href: '/#context', label: 'Context', icon: BookOpen },
  { href: '/#timeline', label: 'Timeline', icon: MapPin },
  { href: '/#voices', label: 'Voices', icon: Mic },
  { href: '/#photos', label: 'Photos', icon: Camera },
  { href: '/#site', label: 'The Site', icon: Landmark },
  { href: '/#outcome', label: 'Outcome', icon: Scale },
  { href: '/#sources', label: 'Sources', icon: Newspaper },
];

export function Header() {
  const { theme, toggleTheme, reducedMotion } = usePreferences();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        'bg-background/80 backdrop-blur-md border-b border-border/50'
      )}
      style={{ boxShadow: '0 4px 30px -10px hsl(var(--background) / 0.3)' }}
    >
      <div className="container-wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="CJP Documentary Home">
            <motion.span
              className="text-xl font-display font-light tracking-tight gradient-gold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              CJP
            </motion.span>
            <span className="hidden lg:block text-xs text-muted-foreground uppercase tracking-widest">
              Documentary
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-medium text-muted-foreground',
                  'hover:text-foreground transition-colors duration-300',
                  'rounded-md hover:bg-accent/10',
                  'after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-accent-gold after:transition-all after:duration-300 hover:after:w-3/4'
                )}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <item.icon className="hidden w-4 h-4 xl:block" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-lg"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn-ghost p-2 rounded-lg"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            className="md:hidden py-4 border-t border-border/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                  style={{ transitionDelay: `${i * 30}ms` }}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}