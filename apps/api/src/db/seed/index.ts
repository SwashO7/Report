import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { eq, sql } from 'drizzle-orm';
import { db } from '../client';
import {
  achievements,
  difficultyLevels,
  diagrams,
  labCategories,
  labs,
  learningPaths,
  lessons,
  levels,
  modules,
  practiceExercises,
  seasons,
  siteSettings,
  users,
  xpEvents,
} from '../schema';
import { env } from '../../config/env';
import { flagHmacFor } from '../../core/crypto';
import { EXERCISE_SEEDS, PATH_SEEDS } from './curriculum';
import { loadDiagramSeeds } from './diagram-seeds';
import { LAB_SEEDS } from './labs';
import { ACHIEVEMENT_SEEDS } from './achievements';
import {
  LEADERBOARD_USERS,
  STAFF_USERS,
  buildXpEvents,
  levelOrderForXp,
  type DemoUserSeed,
} from './users';

const LEVELS_SEED = [
  { order: 0, name: 'Initiate', title: 'Level 0 — Initiate', xpThreshold: 0 },
  { order: 1, name: 'Apprentice', title: 'Level 1 — Apprentice', xpThreshold: 500 },
  { order: 2, name: 'Practitioner', title: 'Level 2 — Practitioner', xpThreshold: 1500 },
  { order: 3, name: 'Operator', title: 'Level 3 — Operator', xpThreshold: 3000 },
  { order: 4, name: 'Analyst', title: 'Level 4 — Analyst', xpThreshold: 6000 },
  { order: 5, name: 'Hunter', title: 'Level 5 — Hunter', xpThreshold: 10000 },
  { order: 6, name: 'Specialist', title: 'Level 6 — Specialist', xpThreshold: 16000 },
  { order: 7, name: 'Elite', title: 'Level 7 — Elite', xpThreshold: 25000 },
];

const LEVEL_DESCRIPTIONS = [
  'Just arrived. The whole platform is ahead of you.',
  'You know your way around the basics.',
  'Concepts click. Time to go deeper.',
  'You operate tools with intent.',
  'You analyze systems, not just screens.',
  'You hunt flaws methodically.',
  'Deep specialization. Rare air.',
  'The top tier. Few make it here.',
];

const CATEGORY_SEED = [
  { slug: 'web-security', name: 'Web Security', description: 'Break and defend web applications.', sortOrder: 0 },
  { slug: 'networking', name: 'Networking', description: 'Scanning, protocols, and traffic analysis.', sortOrder: 1 },
  { slug: 'recon', name: 'Reconnaissance', description: 'Mapping targets before touching them.', sortOrder: 2 },
  { slug: 'linux', name: 'Linux', description: 'Command-line fluency and system internals.', sortOrder: 3 },
  { slug: 'cryptography', name: 'Cryptography', description: 'Ciphers, keys, and the math of secrets.', sortOrder: 4 },
];

const DIFFICULTY_SEED = [
  { slug: 'beginner', label: 'Beginner', sortOrder: 0 },
  { slug: 'intermediate', label: 'Intermediate', sortOrder: 1 },
  { slug: 'advanced', label: 'Advanced', sortOrder: 2 },
  { slug: 'expert', label: 'Expert', sortOrder: 3 },
];

const SETTINGS_SEED = [
  {
    key: 'xp_config',
    value: { lesson_completion: 50, practice_completion: 25, first_attempt_bonus: 100, no_hint_bonus: 50 },
  },
  {
    key: 'platform_config',
    value: {
      registration_enabled: true,
      leaderboard_visible: true,
      flag_submission_cooldown_seconds: 10,
      announcement: null,
    },
  },
] as const;

function labPackageArtifact(slug: string, version: string): { packagePath?: string; packageSizeBytes?: number } {
  const storageRoot = resolve(process.cwd(), env.STORAGE_DIR);
  const absPath = join(storageRoot, 'labs', `${slug}-v${version}.zip`);
  if (existsSync(absPath)) {
    return { packagePath: absPath, packageSizeBytes: statSync(absPath).size };
  }
  return {};
}

type Counts = {
  levels: number;
  categories: number;
  difficulties: number;
  settings: number;
  paths: number;
  modules: number;
  lessons: number;
  exercises: number;
  diagrams: number;
  hiddenEmptyModules: number;
  hiddenEmptyPaths: number;
  labs: number;
  achievements: number;
  users: number;
  xpEvents: number;
  seasons: number;
};

async function main(): Promise<void> {
  console.log('→ Seeding Suraksha Labs database…');
  const now = new Date();
  const counts: Counts = {
    levels: 0,
    categories: 0,
    difficulties: 0,
    settings: 0,
    paths: 0,
    modules: 0,
    lessons: 0,
    exercises: 0,
    diagrams: 0,
    hiddenEmptyModules: 0,
    hiddenEmptyPaths: 0,
    labs: 0,
    achievements: 0,
    users: 0,
    xpEvents: 0,
    seasons: 0,
  };

  await db.transaction(async (tx) => {
    /* 1. Levels */
    for (let i = 0; i < LEVELS_SEED.length; i++) {
      const l = LEVELS_SEED[i];
      await tx
        .insert(levels)
        .values({ ...l, description: LEVEL_DESCRIPTIONS[i] ?? '' })
        .onConflictDoUpdate({
          target: levels.order,
          set: { name: l.name, title: l.title, xpThreshold: l.xpThreshold, description: LEVEL_DESCRIPTIONS[i] ?? '' },
        });
      counts.levels++;
    }

    /* 2. Lab categories */
    for (const c of CATEGORY_SEED) {
      await tx
        .insert(labCategories)
        .values(c)
        .onConflictDoUpdate({
          target: labCategories.slug,
          set: { name: c.name, description: c.description, sortOrder: c.sortOrder },
        });
      counts.categories++;
    }

    /* 3. Difficulty levels */
    for (const d of DIFFICULTY_SEED) {
      await tx
        .insert(difficultyLevels)
        .values(d)
        .onConflictDoUpdate({ target: difficultyLevels.slug, set: { label: d.label, sortOrder: d.sortOrder } });
      counts.difficulties++;
    }

    /* 4. Site settings */
    for (const s of SETTINGS_SEED) {
      await tx
        .insert(siteSettings)
        .values({ key: s.key, value: s.value })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value: s.value, updatedAt: new Date() } });
      counts.settings++;
    }

    /* 5. Learning paths → modules → lessons → exercises */
    const lessonIdBySlug = new Map<string, string>();
    for (const p of PATH_SEEDS) {
      const [pathRow] = await tx
        .insert(learningPaths)
        .values({
          slug: p.slug,
          name: p.name,
          levelNumber: p.levelNumber,
          icon: p.icon,
          sortOrder: p.sortOrder,
          description: p.description,
          published: true,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: learningPaths.slug,
          set: {
            name: p.name,
            levelNumber: p.levelNumber,
            icon: p.icon,
            sortOrder: p.sortOrder,
            description: p.description,
            published: true,
            updatedAt: new Date(),
          },
        })
        .returning({ id: learningPaths.id });
      counts.paths++;

      let moduleSort = 0;
      for (const m of p.modules) {
        const [moduleRow] = await tx
          .insert(modules)
          .values({
            pathId: pathRow.id,
            slug: m.slug,
            title: m.title,
            description: m.description,
            published: true,
            sortOrder: moduleSort++,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [modules.pathId, modules.slug],
            set: {
              title: m.title,
              description: m.description,
              published: true,
              sortOrder: moduleSort - 1,
              updatedAt: new Date(),
            },
          })
          .returning({ id: modules.id });
        counts.modules++;

        let lessonSort = 0;
        for (const l of m.lessons) {
          const [lessonRow] = await tx
            .insert(lessons)
            .values({
              moduleId: moduleRow.id,
              slug: l.slug,
              title: l.title,
              summary: l.summary,
              estimatedMinutes: l.estimatedMinutes,
              importance: l.importance ?? 'core',
              blocks: l.blocks,
              status: 'published',
              publishedAt: now,
              sortOrder: lessonSort++,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: lessons.slug,
              set: {
                moduleId: moduleRow.id,
                title: l.title,
                summary: l.summary,
                estimatedMinutes: l.estimatedMinutes,
                importance: l.importance ?? 'core',
                blocks: l.blocks,
                status: 'published',
                publishedAt: now,
                sortOrder: lessonSort - 1,
                updatedAt: new Date(),
              },
            })
            .returning({ id: lessons.id });
          lessonIdBySlug.set(l.slug, lessonRow.id);
          counts.lessons++;
        }
      }
    }

    /* 5b. Diagrams — insert-only, so admin edits survive a re-seed. */
    for (const d of loadDiagramSeeds()) {
      await tx
        .insert(diagrams)
        .values({
          slug: d.slug,
          title: d.title,
          description: d.description,
          category: d.category,
          mimeType: d.mimeType,
          encoding: d.encoding,
          content: d.content,
          sizeBytes: d.sizeBytes,
        })
        .onConflictDoNothing({ target: diagrams.slug });
      counts.diagrams++;
    }

    /* 5c. Hide empty modules and paths.
     *
     * Re-shaping the curriculum leaves orphans behind: a module whose lessons
     * moved elsewhere, or a path whose modules all went away. A published track
     * with nothing in it looks broken to a learner, so unpublish those rather
     * than deleting anything - lesson rows and user progress are preserved, and
     * an editor can republish from the admin panel.
     */
    const emptyModules = await tx.execute(sql`
      UPDATE modules SET published = false, updated_at = now()
      WHERE published = true
        AND NOT EXISTS (
          SELECT 1 FROM lessons l WHERE l.module_id = modules.id AND l.status = 'published'
        )
      RETURNING id
    `);
    const emptyPaths = await tx.execute(sql`
      UPDATE learning_paths SET published = false, updated_at = now()
      WHERE published = true
        AND NOT EXISTS (
          SELECT 1 FROM modules m WHERE m.path_id = learning_paths.id AND m.published = true
        )
      RETURNING id
    `);
    counts.hiddenEmptyModules = emptyModules.length;
    counts.hiddenEmptyPaths = emptyPaths.length;

    for (const e of EXERCISE_SEEDS) {
      const lessonId = lessonIdBySlug.get(e.lessonSlug);
      if (!lessonId) throw new Error(`Exercise ${e.slug} references unknown lesson ${e.lessonSlug}`);
      await tx
        .insert(practiceExercises)
        .values({
          lessonId,
          slug: e.slug,
          title: e.title,
          instructions: e.instructions,
          kind: e.kind,
          questions: e.questions,
          xpReward: e.xpReward,
          status: 'published',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: practiceExercises.slug,
          set: {
            lessonId,
            title: e.title,
            instructions: e.instructions,
            kind: e.kind,
            questions: e.questions,
            xpReward: e.xpReward,
            status: 'published',
            updatedAt: new Date(),
          },
        });
      counts.exercises++;
    }

    /* 6. Labs */
    const catRows = await tx.select({ id: labCategories.id, slug: labCategories.slug }).from(labCategories);
    const diffRows = await tx.select({ id: difficultyLevels.id, slug: difficultyLevels.slug }).from(difficultyLevels);
    const categoryIdBySlug = new Map(catRows.map((c) => [c.slug, c.id]));
    const difficultyIdBySlug = new Map(diffRows.map((d) => [d.slug, d.id]));

    for (const lab of LAB_SEEDS) {
      const categoryId = categoryIdBySlug.get(lab.categorySlug);
      const difficultyId = difficultyIdBySlug.get(lab.difficultySlug);
      if (!categoryId || !difficultyId) throw new Error(`Lab ${lab.slug}: missing category or difficulty`);

      const relatedLessonIds = lab.relatedLessonSlugs
        .map((s) => lessonIdBySlug.get(s))
        .filter((id): id is string => Boolean(id));

      const artifact = labPackageArtifact(lab.slug, lab.packageVersion);

      await tx
        .insert(labs)
        .values({
          slug: lab.slug,
          title: lab.title,
          shortDescription: lab.shortDescription,
          description: lab.description,
          categoryId,
          difficultyId,
          estimatedMinutes: lab.estimatedMinutes,
          xpReward: lab.xpReward,
          objectives: lab.objectives,
          skills: lab.skills,
          hints: lab.hints,
          setupInstructions: lab.setupInstructions,
          flagHmac: flagHmacFor(lab.flag, lab.flagCaseSensitive ?? true),
          flagCaseSensitive: lab.flagCaseSensitive,
          runtimeType: lab.runtimeType,
          packageVersion: lab.packageVersion,
          relatedLessonIds,
          status: 'published',
          visibility: 'public',
          version: 1,
          publishedAt: now,
          securityReviewedAt: now,
          updatedAt: new Date(),
          ...artifact,
        })
        .onConflictDoUpdate({
          target: labs.slug,
          set: {
            title: lab.title,
            shortDescription: lab.shortDescription,
            description: lab.description,
            categoryId,
            difficultyId,
            estimatedMinutes: lab.estimatedMinutes,
            xpReward: lab.xpReward,
            objectives: lab.objectives,
            skills: lab.skills,
            hints: lab.hints,
            setupInstructions: lab.setupInstructions,
            flagHmac: flagHmacFor(lab.flag, lab.flagCaseSensitive ?? true),
            flagCaseSensitive: lab.flagCaseSensitive,
            runtimeType: lab.runtimeType,
            packageVersion: lab.packageVersion,
            relatedLessonIds,
            status: 'published',
            visibility: 'public',
            updatedAt: new Date(),
            ...(artifact.packagePath ? artifact : {}),
          },
        });
      counts.labs++;
    }

    /* 7. Achievements */
    let achievementSort = 0;
    for (const a of ACHIEVEMENT_SEEDS) {
      await tx
        .insert(achievements)
        .values({ ...a, isVisible: true, sortOrder: achievementSort++ })
        .onConflictDoUpdate({
          target: achievements.slug,
          set: {
            title: a.title,
            description: a.description,
            icon: a.icon,
            category: a.category,
            rarity: a.rarity,
            criteria: a.criteria,
            xpReward: a.xpReward,
            isVisible: true,
            sortOrder: achievementSort - 1,
          },
        });
      counts.achievements++;
    }

    /* 8. Demo users */
    const allDemoUsers: DemoUserSeed[] = [...STAFF_USERS, ...LEADERBOARD_USERS];
    const todayIso = new Date().toISOString().slice(0, 10);
    for (const u of allDemoUsers) {
      const passwordHash = await Bun.password.hash(u.password, { algorithm: 'argon2id', memoryCost: 65536, timeCost: 3 });
      await tx
        .insert(users)
        .values({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          passwordHash,
          authProvider: 'email',
          role: u.role,
          status: 'active',
          bio: u.bio,
          xp: u.xp ?? 0,
          levelOrder: levelOrderForXp(u.xp ?? 0),
          emailVerifiedAt: now,
          onboardedAt: now,
          profileVisibility: 'public',
          lastActiveDate: todayIso,
          streakCount: u.xp && u.xp > 3000 ? 6 : u.xp ? 3 : 0,
        })
        .onConflictDoNothing({ target: users.email });
      counts.users++;

      if (u.xp) {
        const [{ existing }] = await tx
          .select({ existing: sql<number>`count(*)::int` })
          .from(xpEvents)
          .where(eq(xpEvents.userId, u.id));
        if (existing === 0) {
          const events = buildXpEvents(u.id, u.xp);
          await tx.insert(xpEvents).values(events);
          counts.xpEvents += events.length;
        }
      }
    }

    /* 9. Season */
    const seasonName = 'Suraksha Cyber League — Season 01';
    const startsAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endsAt = new Date(Date.now() + 335 * 24 * 60 * 60 * 1000);
    const rewards = {
      description: 'Top researchers earn recognition and Suraksha VDP fast-track consideration.',
    };
    const existingSeason = await tx.select({ id: seasons.id }).from(seasons).where(eq(seasons.name, seasonName)).limit(1);
    if (existingSeason.length > 0) {
      await tx
        .update(seasons)
        .set({ startsAt, endsAt, isActive: true, rewards })
        .where(eq(seasons.name, seasonName));
    } else {
      await tx.insert(seasons).values({ name: seasonName, startsAt, endsAt, isActive: true, rewards });
    }
    counts.seasons++;
  });

  console.log('\n=== SEED SUMMARY ===');
  console.log(`Levels:             ${counts.levels}`);
  console.log(`Lab categories:     ${counts.categories}`);
  console.log(`Difficulty levels:  ${counts.difficulties}`);
  console.log(`Site settings:      ${counts.settings}`);
  console.log(`Learning paths:     ${counts.paths}`);
  console.log(`Modules:            ${counts.modules}`);
  console.log(`Lessons:            ${counts.lessons}`);
  console.log(`Practice exercises: ${counts.exercises}`);
  console.log(`Diagrams:           ${counts.diagrams}`);
  if (counts.hiddenEmptyModules || counts.hiddenEmptyPaths) {
    console.log(`Hidden as empty:    ${counts.hiddenEmptyModules} module(s), ${counts.hiddenEmptyPaths} path(s)`);
  }
  console.log(`Labs:               ${counts.labs}`);
  console.log(`Achievements:       ${counts.achievements}`);
  console.log(`Demo users:         ${counts.users}`);
  console.log(`XP events:          ${counts.xpEvents}`);
  console.log(`Seasons:            ${counts.seasons}`);
  console.log('Seed completed successfully.');

  console.log('\n=== DEMO DATA (development only — do NOT use in production) ===');
  for (const u of [...STAFF_USERS, ...LEADERBOARD_USERS]) {
    console.log(`${u.email.padEnd(28)} / ${u.password.padEnd(16)} (${u.role}${u.xp ? `, ${u.xp} XP` : ''})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
