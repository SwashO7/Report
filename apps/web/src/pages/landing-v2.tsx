import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Check, FlaskConical, PencilLine, ShieldCheck } from 'lucide-react';
import type { LabCard } from '@suraksha/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { qk } from '@/lib/queries';
import { useSeo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Badge, Skeleton } from '@/components/ui/card';
import { LabRowList } from '@/features/labs/lab-card';

const route = [
  ['00', 'Foundations', 'Understand networks, the web, and the command line.'],
  ['01', 'Linux', 'Work confidently with files, permissions, and shell tools.'],
  ['02', 'Networking', 'Read traffic and reason about how systems communicate.'],
  ['03', 'Web security', 'Find and explain common application vulnerabilities.'],
  ['04', 'Recon', 'Map attack surfaces carefully and responsibly.'],
  ['05', 'Research', 'Turn evidence into a clear vulnerability report.'],
];

const loop = [
  { icon: BookOpen, title: 'Understand', body: 'Short lessons explain one concept at a time in plain language.' },
  { icon: PencilLine, title: 'Recall', body: 'Checked exercises reveal gaps before they become confusion.' },
  { icon: FlaskConical, title: 'Prove', body: 'Local labs turn the concept into evidence you can show.' },
];

export default function LandingV2() {
  const { user, loading } = useAuth();
  const labs = useQuery({ queryKey: qk.labs('pageSize=4&sort=popular'), queryFn: () => api<{ labs: LabCard[] }>('/labs?pageSize=4&sort=popular'), staleTime: 120_000 });
  useSeo('Suraksha Labs | Learn cybersecurity by doing', 'Free, structured cybersecurity learning with checked practice and local hands-on labs from Shadow Security.');
  const primary = loading ? null : user ? '/dashboard' : '/signup';

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:pb-24 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:items-center lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }}>
            <p className="signal-label"><ShieldCheck className="size-3.5" /> Learn safely. Practise for real.</p>
            <h1 className="display-title mt-6 max-w-2xl">Cybersecurity makes sense when you can use it.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">Learn the concepts, practise with feedback, then prove your skills in local security labs.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {primary && <Link to={primary}><Button size="lg">{user ? 'Continue learning' : 'Start free'}<ArrowRight className="size-4" /></Button></Link>}
              <Link to="/learn"><Button size="lg" variant="outline">See the curriculum</Button></Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-success" />No prior experience</span>
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-success" />Free access</span>
              <span className="inline-flex items-center gap-2"><Check className="size-4 text-success" />Labs run locally</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.42, delay: 0.08 }} className="surface-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="signal-label">Your route</p><h2 className="mt-2 text-lg font-semibold">Zero to vulnerability research</h2></div><span className="font-mono text-xs text-text-tertiary">6 levels</span></div>
            <ol className="grid sm:grid-cols-2">
              {route.map(([level, name, description], index) => (
                <li key={level} className={`relative p-5 ${index % 2 === 0 ? 'sm:border-r sm:border-border' : ''} ${index < 4 ? 'border-b border-border' : ''}`}>
                  <div className="flex gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg font-mono text-sm font-bold text-accent">{level}</span><div><h3 className="text-sm font-semibold">{name}</h3><p className="mt-1 text-xs leading-relaxed text-text-tertiary">{description}</p></div></div>
                </li>
              ))}
            </ol>
            <Link to="/learn" className="flex items-center justify-between border-t border-border bg-accent-subtle px-5 py-4 text-sm font-semibold text-accent">Explore every lesson <ArrowRight className="size-4" /></Link>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-border bg-bg-subtle">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="max-w-xl"><h2 className="page-title">A loop that builds real recall</h2><p className="mt-3 text-base leading-relaxed text-text-secondary">Every surface points to the next useful action. You never need to guess where to continue.</p></div>
          <div className="mt-10 grid gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            {loop.map((item, index) => (
              <div key={item.title} className="contents">
                <article className="py-5 lg:py-0"><span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><item.icon className="size-5" /></span><h3 className="mt-5 text-xl font-semibold">{item.title}</h3><p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">{item.body}</p></article>
                {index < loop.length - 1 && <ArrowRight className="my-3 size-5 rotate-90 text-border-strong lg:mx-10 lg:my-0 lg:rotate-0" aria-hidden />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="signal-label">Hands-on missions</p><h2 className="page-title mt-3">See a concept behave</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">Download a contained environment, investigate it on your machine, and submit the flag.</p></div><Link to="/labs" className="inline-flex items-center gap-2 text-sm font-semibold text-accent">Browse every lab <ArrowRight className="size-4" /></Link></div>
        <div className="mt-8">{labs.isLoading ? <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> : (labs.data?.labs.length ?? 0) > 0 ? <LabRowList labs={labs.data!.labs} /> : <div className="surface-panel p-8 text-sm text-text-secondary">Labs are being prepared for release.</div>}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
        <div className="signal-panel grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><Badge variant="accent">Free for every learner</Badge><h2 className="mt-4 text-3xl font-bold tracking-tight">Start where you are. Build proof as you go.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">Your workspace remembers progress, builds a daily plan, and turns achievements into shareable proof.</p></div>
          {primary && <Link to={primary}><Button size="lg">{user ? 'Open workspace' : 'Create your workspace'}<ArrowRight className="size-4" /></Button></Link>}
        </div>
      </section>
    </div>
  );
}
