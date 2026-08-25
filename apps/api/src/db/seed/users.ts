export const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 6000, 10000, 16000, 25000];

export type DemoUserSeed = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'super_admin' | 'content_editor' | 'lab_manager' | 'learner';
  password: string;
  bio: string;
  xp?: number;
};

export const STAFF_USERS: DemoUserSeed[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    name: 'Shadow Security Admin',
    username: 'admin',
    email: 'admin@suraksha.local',
    role: 'super_admin',
    password: 'SurakshaAdmin1',
    bio: 'Platform owner. Watches the watchers.',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    name: 'Content Editor',
    username: 'editor',
    email: 'editor@suraksha.local',
    role: 'content_editor',
    password: 'SurakshaEditor1',
    bio: 'Writes the lessons you read.',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    name: 'Lab Manager',
    username: 'labmgr',
    email: 'labmgr@suraksha.local',
    role: 'lab_manager',
    password: 'SurakshaLabmgr1',
    bio: 'Builds and ships the lab containers.',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    name: 'Demo Learner',
    username: 'learner',
    email: 'learner@suraksha.local',
    role: 'learner',
    password: 'SurakshaLearner1',
    bio: 'Just here to learn.',
  },
];

export const LEADERBOARD_USERS: DemoUserSeed[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000101',
    name: 'Ava Chen',
    username: 'demo-ava',
    email: 'demo-ava@suraksha.local',
    role: 'learner',
    password: 'SurakshaDemo1',
    bio: 'CTF addict. Currently obsessed with packet captures.',
    xp: 4200,
  },
  {
    id: 'a0000000-0000-4000-8000-000000000102',
    name: 'Raj Patel',
    username: 'demo-raj',
    email: 'demo-raj@suraksha.local',
    role: 'learner',
    password: 'SurakshaDemo1',
    bio: 'Linux or it did not happen.',
    xp: 2600,
  },
  {
    id: 'a0000000-0000-4000-8000-000000000103',
    name: 'Mia Torres',
    username: 'demo-mia',
    email: 'demo-mia@suraksha.local',
    role: 'learner',
    password: 'SurakshaDemo1',
    bio: 'Learning the web, one header at a time.',
    xp: 900,
  },
];

export function levelOrderForXp(xp: number): number {
  let order = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) order = i;
  }
  return order;
}

export type XpEventSeed = {
  userId: string;
  amount: number;
  source: string;
  sourceId: string | null;
  description: string;
  createdAt: Date;
};

const XP_SOURCES: { source: string; amount: number; description: string }[] = [
  { source: 'lab', amount: 150, description: 'Solved a lab' },
  { source: 'lesson', amount: 50, description: 'Completed a lesson' },
  { source: 'practice', amount: 25, description: 'Completed a practice exercise' },
];

export function buildXpEvents(userId: string, totalXp: number): XpEventSeed[] {
  const events: XpEventSeed[] = [];
  let remaining = totalXp;
  let i = 0;
  const now = Date.now();
  while (remaining > 0) {
    const pick = XP_SOURCES[i % XP_SOURCES.length];
    const amount = Math.min(pick.amount, remaining % pick.amount === 0 ? pick.amount : remaining);
    remaining -= amount;
    const dayOffsetMs = (i % 20) * 24 * 60 * 60 * 1000;
    const hourOffsetMs = ((i * 7) % 23) * 60 * 60 * 1000;
    events.push({
      userId,
      amount,
      source: pick.source,
      sourceId: `${pick.source}-${String(i + 1).padStart(3, '0')}`,
      description: pick.description,
      createdAt: new Date(now - dayOffsetMs - hourOffsetMs),
    });
    i++;
  }
  return events;
}
