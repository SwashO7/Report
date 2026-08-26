import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, CheckCircle2, ChevronRight, CircleDashed } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { useSeo } from '@/lib/seo';
import { Skeleton } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AchievementMedallion } from '@/features/achievements/achievement-icon';
import { LabRowList } from '@/features/labs/lab-card';
import type { AchievementPublic, LabCard } from '@suraksha/shared';

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

const JOURNEY = [
  { level: 0, slug: 'foundations', name: 'Foundations', blurb: 'How computers talk: IPs, ports, DNS, HTTP and the command line.' },
  { level: 1, slug: 'linux', name: 'Linux & Scripting', blurb: 'Live in the terminal — files, permissions, pipes, SSH and shell fluency.' },
  { level: 2, slug: 'networking', name: 'Networking', blurb: 'TCP/IP, routing, firewalls and reading packets like a professional.' },
  { level: 3, slug: 'web', name: 'Web Security', blurb: 'Injection, XSS, access control and the logic flaws behind real breaches.' },
  { level: 4, slug: 'recon', name: 'Recon & OSINT', blurb: 'Map attack surfaces methodically with Nmap, ffuf, subfinder and more.' },
  { level: 5, slug: 'vulnerability-research', name: 'Vulnerability Research', blurb: 'Find, validate and report vulnerabilities with evidence that counts.' },
];

const STEPS = [
  {
    n: '01',
    title: 'Learn',
    description:
      'Short lessons build real understanding — video, plain language and worked examples. No prerequisite knowledge required.',
  },
  {
    n: '02',
    title: 'Practice',
    description:
      'Every concept is followed by a checked exercise so knowledge turns into reflex before you face a live target.',
  },
  {
    n: '03',
    title: 'Solve',
    description:
      'Download a realistic lab, run it on your own machine, find the vulnerability and capture the flag to earn XP.',
  },
];

/* ------------------------- Static product preview ------------------------- */

const PREVIEW_ROWS = [
  { solved: true, title: 'Port Discovery', cat: 'Networking', d: 'Beginner', xp: 150 },
  { solved: true, title: 'HTTP Investigation', cat: 'Web Security', d: 'Beginner', xp: 200 },
  { solved: false, title: 'Invoice Portal', cat: 'Web Security', d: 'Intermediate', xp: 250 },
  { solved: false, title: 'Log Hunter', cat: 'Linux', d: 'Intermediate', xp: 300 },
];

function HeroPanel() {
  return (
    <div className="relative" aria-hidden>
      {/* Level card */}
      <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4">
        <div>
          <p className="micro-label">Level 4 · Web Specialist</p>
          <div className="mt-2 h-1.5 w-56 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full w-[72%] rounded-full bg-accent" />
          </div>
        </div>
        <p className="text-sm tabular-nums text-text-secondary">1,440 / 2,000 XP</p>
      </div>

      {/* Labs index */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border bg-surface px-5 py-2">
          <p className="micro-label">Labs</p>
        </div>
        <ul>
          {PREVIEW_ROWS.map((r) => (
            <li key={r.title} className="flex items-center gap-3.5 border-b border-border px-5 py-3 last:border-b-0">
              {r.solved ? (
                <CheckCircle2 className="size-[18px] shrink-0 text-success" />
              ) : (
                <CircleDashed className="size-[18px] shrink-0 text-text-tertiary/60" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{r.title}</span>
                <span className="block truncate text-xs text-text-tertiary">{r.cat}</span>
              </span>
              <span className="hidden text-xs capitalize text-text-secondary sm:block">{r.d}</span>
              <span className="w-16 shrink-0 text-right text-sm font-medium tabular-nums text-text">+{r.xp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* First Blood chip */}
      <div className="absolute -top-5 right-0 flex items-center gap-3 rounded-lg border border-border bg-surface py-2 pl-2 pr-4 shadow-md sm:-right-6">
        <AchievementMedallion icon="flag" rarity="rare" size="sm" />
        <div className="leading-tight">
          <p className="text-xs font-semibold text-text">First Blood</p>
          <p className="text-[11px] text-text-tertiary">Rare · +100 XP</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Sections -------------------------------- */

function SectionHeading({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="max-w-xl">
      {eyebrow && <p className="micro-label">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function FeaturedLabs() {
  const { data, isLoading } = useQuery({
    queryKey: qk.labs('pageSize=4&sort=popular'),
    queryFn: () => api<{ labs: LabCard[] }>('/labs?pageSize=4&sort=popular'),
    staleTime: 120_000,
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
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

      <div className="mt-7">
        {isLoading ? (
          <div className="space-y-px rounded-lg border border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-none border-b border-border bg-surface" />
            ))}
          </div>
        ) : (data?.labs ?? []).length > 0 ? (
          <LabRowList labs={data!.labs} />
        ) : null}
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

  const achievements = (data?.achievements ?? []).slice(0, 6);
  if (achievements.length === 0) return null;

  return (
    <section className="border-y border-border bg-bg-subtle">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading eyebrow="Recognition" title="Achievements worth chasing" />
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {achievements.map((a) => (
              <li key={a.slug} className="flex flex-col items-start gap-3">
                <AchievementMedallion icon={a.icon} rarity={a.rarity} size="lg" />
                <div>
                  <p className="text-sm font-semibold leading-tight text-text">{a.title}</p>
                  <p className="mt-1 text-xs capitalize text-text-tertiary">{a.rarity}</p>
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
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,10fr)_minmax(0,9fr)] lg:gap-16">
          <motion.div {...fadeUp} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="max-w-xl text-balance text-5xl font-bold leading-[1.06] tracking-tight text-text sm:text-5xl">
              Learn cybersecurity.
              <br />
              Actually practice it.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              Suraksha Labs takes you from zero to practical security skills — structured lessons, checked practice,
              and real lab environments you run on your own machine.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
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

            <dl className="mt-12 grid max-w-md grid-cols-3 divide-x divide-border border-y border-border">
              {[
                ['Free forever', 'No fees, no limits'],
                ['Learn → Solve', 'Theory to flags'],
                ['Local labs', 'Runs on your machine'],
              ].map(([t, s]) => (
                <div key={t} className="px-4 py-3.5 first:pl-0 last:pr-0">
                  <dt className="text-sm font-semibold text-text">{t}</dt>
                  <dd className="mt-0.5 text-xs text-text-tertiary">{s}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div {...fadeUp} transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="pb-6 lg:pb-0">
            <HeroPanel />
          </motion.div>
        </div>
      </section>

      {/* ---------------------------- How it works ---------------------------- */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading eyebrow="The method" title="How it works" />
        </motion.div>

        <div className="mt-9 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="bg-surface p-6 sm:p-7">
              <p className="font-mono text-xs font-medium tracking-widest text-accent">{step.n}</p>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- Learning journey -------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <SectionHeading eyebrow="Curriculum" title="Six levels. One path." />
          <p className="mt-3 max-w-xl text-base leading-relaxed text-text-secondary">
            Each level builds on the last. Finish the lessons, prove the skills in labs, unlock the next tier.
          </p>
        </motion.div>

        <nav aria-label="Learning journey" className="mt-8">
          <ol className="overflow-hidden rounded-lg border border-border bg-surface">
            {JOURNEY.map((j, i) => (
              <li key={j.slug} className={i > 0 ? 'border-t border-border' : ''}>
                <Link to={`/learn/${j.slug}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2 sm:gap-6 sm:px-6">
                  <span className="w-14 shrink-0">
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-text-tertiary">Level</span>
                    <span className="block text-lg font-bold tabular-nums leading-none text-text">{j.level}</span>
                  </span>
                  <span className="hidden h-10 w-px bg-border sm:block" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-text transition-colors group-hover:text-accent">
                      {j.name}
                    </span>
                    <span className="mt-0.5 hidden truncate text-sm text-text-tertiary md:block">{j.blurb}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-text-tertiary transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
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
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-lg border border-border bg-surface px-6 py-14 text-center"
        >
          <h2 className="mx-auto max-w-md text-3xl font-bold tracking-tight text-text">
            Your first flag is waiting.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-text-secondary">
            Create a free account and solve your first lab today. Everything stays free, forever.
          </p>
          <div className="mt-8 flex justify-center">
            {startCta && (
              <Link to={startCta}>
                <Button size="lg">
                  Start Learning
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </Link>
            )}
          </div>
          <p className="mt-5 text-xs text-text-tertiary">Your first lab takes about 30 minutes. No prior experience required.</p>
        </motion.div>
      </section>
    </div>
  );
}
