import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  Flag,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { cn, formatMinutes } from '@/lib/utils';
import { Badge, Progress, Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AchievementMedallion } from '@/features/achievements/achievement-icon';
import { LabCardView } from '@/features/labs/lab-card';
import type { AchievementPublic, LabCard } from '@suraksha/shared';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const JOURNEY = [
  { level: 0, slug: 'foundations', name: 'Foundations' },
  { level: 1, slug: 'linux', name: 'Linux & Scripting' },
  { level: 2, slug: 'networking', name: 'Networking' },
  { level: 3, slug: 'web', name: 'Web Security' },
  { level: 4, slug: 'recon', name: 'Recon & OSINT' },
  { level: 5, slug: 'vulnerability-research', name: 'Vulnerability Research' },
];

const STEPS = [
  {
    icon: BookOpen,
    title: 'Learn',
    description: 'Structured lessons take you from first principles to working knowledge.',
  },
  {
    icon: PencilLine,
    title: 'Practice',
    description: 'Download a real lab environment and run it on your own machine.',
  },
  {
    icon: Flag,
    title: 'Solve',
    description: 'Capture the flag, earn XP, and climb the leaderboard with proof of skill.',
  },
];

/* ------------------------------ Product mock ------------------------------ */

function HeroMock() {
  return (
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-14 w-full max-w-md pb-10 lg:mt-0 lg:max-w-none"
      aria-hidden
    >
      {/* Mini lab card */}
      <div className="relative z-10 rounded-xl border border-border bg-surface p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Web Security</span>
          <Badge variant="accent">Intermediate</Badge>
        </div>
        <p className="mt-3 font-semibold tracking-tight text-text">SQL injection: authentication bypass</p>
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          The login form trusts user input a little too much. Walk in without a password.
        </p>
        <div className="mt-4 flex items-center gap-3.5 border-t border-border pt-3.5 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1 font-medium text-accent">
            <Zap className="size-3.5" />+250 XP
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5 text-text-tertiary" />
            45 min
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-text-tertiary">
            <Users className="size-3.5" />
            1,284 solved
          </span>
        </div>
      </div>

      {/* XP progress card */}
      <div className="absolute -bottom-2 left-0 z-20 w-60 rounded-xl border border-border bg-surface p-4 shadow-md sm:-left-6 sm:-bottom-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text">Level 4 · Web Specialist</span>
          <span className="tabular-nums text-text-tertiary">72%</span>
        </div>
        <Progress value={72} label="Level progress" className="mt-2.5 h-1.5" />
        <p className="mt-2 text-[11px] text-text-tertiary tabular-nums">1,440 / 2,000 XP to next level</p>
      </div>

      {/* Achievement chip */}
      <div className="absolute -top-6 right-0 z-20 flex items-center gap-3 rounded-full border border-border bg-surface py-2 pl-2 pr-4 shadow-md sm:-right-4">
        <AchievementMedallion icon="flag" rarity="rare" size="sm" />
        <div className="leading-tight">
          <p className="text-xs font-semibold text-text">First Blood</p>
          <p className="text-[11px] text-text-tertiary">Rare · +100 XP</p>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------- Sections -------------------------------- */

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="max-w-xl">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h2>
    </div>
  );
}

function FeaturedLabs() {
  const { data, isLoading } = useQuery({
    queryKey: qk.labs('pageSize=3&sort=popular'),
    queryFn: () => api<{ labs: LabCard[] }>('/labs?pageSize=3&sort=popular'),
    staleTime: 120_000,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Hands-on" title="Featured labs" />
          <Link
            to="/labs"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Browse all labs
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-border bg-surface p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))
          : (data?.labs ?? []).map((lab) => <LabCardView key={lab.id} lab={lab} />)}
      </div>
    </section>
  );
}

function AchievementsTeaser() {
  const { data } = useQuery({
    queryKey: qk.achievements,
    queryFn: () => api<{ achievements: AchievementPublic[] }>('/achievements'),
    staleTime: 300_000,
  });

  const achievements = (data?.achievements ?? []).slice(0, 5);
  if (achievements.length === 0) return null;

  return (
    <section className="border-y border-border bg-bg-subtle/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Recognition" title="Achievements worth chasing" />
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
            >
              <Trophy className="size-4" aria-hidden />
              View the leaderboard
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {achievements.map((a) => (
              <li
                key={a.slug}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-4 py-6 text-center shadow-xs transition-colors hover:border-border-strong"
              >
                <AchievementMedallion icon={a.icon} rarity={a.rarity} size="lg" />
                <div>
                  <p className="text-sm font-semibold text-text">{a.title}</p>
                  <p className="mt-0.5 text-xs capitalize text-text-tertiary">{a.rarity}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function LandingPage() {
  const { user, loading } = useAuth();
  useSeo(
    'Suraksha Labs — Learn Cybersecurity by Shadow Security',
    'Free hands-on cybersecurity training. Learn theory, practice in real labs, capture flags, and build provable skills — from foundations to vulnerability research.',
  );

  const startCta = loading ? null : user ? '/dashboard' : '/signup';

  return (
    <div>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="hero-texture">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:pb-28 lg:pt-24">
          <motion.div {...fadeUp} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <Badge variant="accent" className="px-3 py-1">
              <Sparkles className="size-3.5" aria-hidden />
              Free forever — by Shadow Security
            </Badge>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-[3.4rem]">
              Learn cybersecurity.
              <br />
              <span className="text-accent">Actually practice it.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
              Go beyond videos and slides. Suraksha Labs pairs a structured curriculum with real,
              hands-on lab environments — so you build practical skills you can prove, not just watch.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {startCta && (
                <Link to={startCta}>
                  <Button size="lg">
                    Start Learning
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
              )}
              <Link to="/labs">
                <Button size="lg" variant="outline">
                  Explore Labs
                </Button>
              </Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-sm text-text-tertiary">
              <ShieldCheck className="size-4 text-success" aria-hidden />
              No setup fees. No subscriptions. Learn responsibly.
            </p>
          </motion.div>

          <HeroMock />
        </div>
      </section>

      {/* ---------------------------- How it works ---------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-16 sm:px-6 sm:pt-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading eyebrow="The method" title="How it works" />
        </motion.div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-4 sm:flex-col sm:gap-0"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-accent">
                <step.icon className="size-5" aria-hidden />
              </div>
              <div className="sm:mt-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-text">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --------------------------- Learning journey -------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading eyebrow="Curriculum" title="Your learning journey" />
          <p className="mt-2 max-w-xl text-base leading-relaxed text-text-secondary">
            Six levels, each building on the last. Finish a level to unlock the next tier of labs.
          </p>
        </motion.div>

        <nav aria-label="Learning journey" className="mt-8">
          <ol className="flex snap-x gap-3 overflow-x-auto pb-3">
            {JOURNEY.map((j) => (
              <li key={j.slug} className="snap-start">
                <Link
                  to={`/learn/${j.slug}`}
                  className="group flex items-center gap-3 whitespace-nowrap rounded-full border border-border bg-surface py-2 pl-2 pr-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm"
                >
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors',
                      j.level === 0 ? 'bg-success-subtle text-success' : 'bg-surface-3 text-text-secondary group-hover:bg-accent-subtle group-hover:text-accent',
                    )}
                  >
                    {j.level}
                  </span>
                  <span className="text-sm font-medium text-text">{j.name}</span>
                  <ChevronRight className="size-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* ---------------------------- Featured labs ---------------------------- */}
      <FeaturedLabs />

      {/* ------------------------- Achievements teaser ------------------------- */}
      <AchievementsTeaser />

      {/* ------------------------------ Final CTA ------------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-sm sm:py-16"
        >
          <h2 className="mx-auto max-w-md text-3xl font-bold tracking-tight text-text">
            Ready to start?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-text-secondary">
            Create a free account and solve your first lab today. Everything stays free, forever.
          </p>
          <div className="mt-7 flex justify-center">
            {startCta && (
              <Link to={startCta}>
                <Button size="lg">
                  Start Learning
                  <Zap className="size-4" aria-hidden />
                </Button>
              </Link>
            )}
          </div>
          <p className="mt-5 text-xs text-text-tertiary">
            {formatMinutes(30)} is all your first lab takes. No prior experience required.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
