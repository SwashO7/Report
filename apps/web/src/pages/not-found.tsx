import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSeo } from '@/lib/seo';

export function NotFoundPage() {
  useSeo('Page not found — Suraksha Labs');

  return (
    <div className="hero-texture flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
          <Compass className="size-6 text-accent" aria-hidden />
        </div>

        <p className="mt-8 text-[5rem] font-bold leading-none tracking-tight text-border-strong sm:text-[6rem]" aria-hidden>
          404
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-text">This page doesn't exist</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
          The link may be broken, or the page may have been moved. Everything else is right where you left it.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button>
              <Home className="size-4" aria-hidden />
              Back to home
            </Button>
          </Link>
          <Link to="/labs">
            <Button variant="outline">Explore labs</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
