/**
 * Curriculum seed validator.
 *
 *   bun scripts/validate-curriculum.ts
 *
 * Checks everything the DB and the app assume, before a seed is attempted:
 * unique slugs, valid content blocks, exercise -> lesson wiring, cross-links
 * that resolve, plus the house-style rules from
 * apps/api/src/db/seed/curriculum/_AUTHORING.md.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { contentBlockSchema } from '../packages/shared/src/content';
import { EXERCISE_SEEDS, PATH_SEEDS } from '../apps/api/src/db/seed/curriculum';

const LAB_SLUGS = new Set(['port-discovery', 'http-investigation', 'invoice-portal', 'log-hunter']);

const errors: string[] = [];
const warnings: string[] = [];

const lessonSlugs = new Set<string>();
const moduleKeys = new Set<string>();
const pathSlugs = new Set<string>();
const exerciseSlugs = new Set<string>();
const referencedExercises = new Set<string>();
const relatedLessonRefs: { from: string; to: string }[] = [];

let lessonCount = 0;
let moduleCount = 0;
let coreCount = 0;
let essentialCount = 0;
let optionalCount = 0;
let videoSlots = 0;
let diagramCount = 0;
let totalMinutes = 0;

for (const p of PATH_SEEDS) {
  if (pathSlugs.has(p.slug)) errors.push(`duplicate path slug: ${p.slug}`);
  pathSlugs.add(p.slug);
  if (!p.modules.length) errors.push(`path ${p.slug} has no modules`);

  for (const m of p.modules) {
    moduleCount++;
    const key = `${p.slug}/${m.slug}`;
    if (moduleKeys.has(key)) errors.push(`duplicate module slug: ${key}`);
    moduleKeys.add(key);
    if (!m.lessons.length) errors.push(`module ${key} has no lessons`);
    if (!m.description) errors.push(`module ${key} has no description`);
    else if (m.description.length < 150) {
      errors.push(`module ${key}: description is ${m.description.length} chars - too thin to sell the module (want 200-380)`);
    } else if (m.description.length > 500) {
      warnings.push(`module ${key}: description is ${m.description.length} chars - trim it`);
    }

    for (const l of m.lessons) {
      lessonCount++;
      if (lessonSlugs.has(l.slug)) errors.push(`duplicate lesson slug: ${l.slug} (in ${key})`);
      lessonSlugs.add(l.slug);

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(l.slug)) errors.push(`bad lesson slug format: ${l.slug}`);
      if (!l.title) errors.push(`${l.slug}: missing title`);
      if (!l.summary) errors.push(`${l.slug}: missing summary`);
      if (l.summary && l.summary.length > 200) warnings.push(`${l.slug}: summary is ${l.summary.length} chars (aim < 160)`);
      if (l.importance !== 'essential' && l.importance !== 'core' && l.importance !== 'optional') {
        errors.push(`${l.slug}: importance must be 'essential', 'core' or 'optional'`);
      }
      if (l.estimatedMinutes < 3 || l.estimatedMinutes > 20) warnings.push(`${l.slug}: estimatedMinutes ${l.estimatedMinutes} outside 3-20`);
      if (l.importance === 'core') coreCount++;
      else if (l.importance === 'essential') essentialCount++;
      else optionalCount++;
      totalMinutes += l.estimatedMinutes;

      const parsed = contentBlockSchema.array().safeParse(l.blocks);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        errors.push(`${l.slug}: invalid blocks -> ${issue.path.join('.')}: ${issue.message}`);
        continue;
      }

      const blocks = parsed.data;
      if (blocks.length < 8) errors.push(`${l.slug}: only ${blocks.length} blocks (recipe wants 9-14)`);
      if (blocks.length > 20) warnings.push(`${l.slug}: ${blocks.length} blocks - probably too long`);

      // A video is optional now: only lessons where watching beats reading get
      // one. When present it must lead, so the page opens with the player.
      const videoBlocks = blocks.filter((b) => b.type === 'video');
      if (videoBlocks.length > 1) errors.push(`${l.slug}: ${videoBlocks.length} video blocks, expected at most 1`);
      if (videoBlocks.length === 1) {
        if (blocks[0].type !== 'video') errors.push(`${l.slug}: the video block must be the first block`);
        videoSlots++;
      }

      const quizzes = blocks.filter((b) => b.type === 'quiz');
      if (quizzes.length !== 1) errors.push(`${l.slug}: expected exactly 1 inline quiz, found ${quizzes.length}`);
      for (const q of quizzes) {
        if (q.type !== 'quiz') continue;
        if (q.correctIndex < 0 || q.correctIndex >= q.options.length) errors.push(`${l.slug}: quiz correctIndex out of range`);
        if (new Set(q.options).size !== q.options.length) errors.push(`${l.slug}: quiz has duplicate options`);
      }

      if (!blocks.some((b) => b.type === 'callout' && b.variant === 'success')) {
        errors.push(`${l.slug}: missing the 'success' dopamine callout`);
      }

      if (blocks.some((b) => b.type === 'heading' && b.text.trim().toLowerCase() === l.title.trim().toLowerCase())) {
        errors.push(`${l.slug}: heading block repeats the lesson title`);
      }

      for (const b of blocks) {
        if (b.type === 'lab_ref' || b.type === 'related_lab') {
          if (!LAB_SLUGS.has(b.labSlug)) errors.push(`${l.slug}: unknown lab slug '${b.labSlug}'`);
        }
        if (b.type === 'related_lesson') relatedLessonRefs.push({ from: l.slug, to: b.lessonSlug });
        if (b.type === 'practice_ref') referencedExercises.add(b.exerciseSlug);
        if (b.type === 'image') {
          const m = /^\/api\/v1\/diagrams\/([a-z0-9-]+)$/.exec(b.src);
          if (!m) warnings.push(`${l.slug}: image src '${b.src}' is not a /api/v1/diagrams/<slug> URL`);
          else if (!existsSync(join('apps', 'api', 'src', 'db', 'seed', 'diagrams', `${m[1]}.svg`))) {
            errors.push(`${l.slug}: image references diagram '${m[1]}' with no seed asset`);
          } else diagramCount++;
        }
      }

      const prose = blocks
        .filter((b) => b.type === 'paragraph')
        .map((b) => (b.type === 'paragraph' ? b.text : ''))
        .join(' ');
      const words = prose.split(/\s+/).filter(Boolean).length;
      // Depth: a learner who skips the video must still understand the topic.
      // Under 250 words the lesson is a caption, not a lesson - that is a hard
      // failure. 250-450 is readable but below the target, so it is flagged for
      // a depth pass rather than blocking the build.
      if (words < 250) errors.push(`${l.slug}: only ${words} words of prose - unusable without the video (want 450-700)`);
      else if (words < 450) warnings.push(`${l.slug}: ${words} words of prose - below the 450 target, needs a depth pass`);
      else if (words > 900) warnings.push(`${l.slug}: ${words} words of prose - textbook territory`);

      // A snippet with no interpretation teaches nothing.
      const hasSnippet = blocks.some((b) => b.type === 'command' || b.type === 'code');
      if (!hasSnippet && l.importance !== 'optional') {
        warnings.push(`${l.slug}: no command or code block - is there really nothing to try?`);
      }

      const raw = JSON.stringify(l.blocks);
      for (const [needle, label] of [
        ['\u2014', 'em dash'],
        ['\u2018', 'smart quote'],
        ['\u2019', 'smart apostrophe'],
        ['\u201c', 'smart double quote'],
        ['\u201d', 'smart double quote'],
      ] as const) {
        if (raw.includes(needle)) warnings.push(`${l.slug}: contains ${label}`);
      }
    }
  }
}

for (const e of EXERCISE_SEEDS) {
  if (exerciseSlugs.has(e.slug)) errors.push(`duplicate exercise slug: ${e.slug}`);
  exerciseSlugs.add(e.slug);
  if (!lessonSlugs.has(e.lessonSlug)) errors.push(`exercise ${e.slug} points at unknown lesson '${e.lessonSlug}'`);
  if (e.kind !== 'quiz') errors.push(`exercise ${e.slug}: kind must be 'quiz'`);
  if (e.questions.length < 3) errors.push(`exercise ${e.slug}: only ${e.questions.length} questions (want 4-6)`);
  if (e.xpReward <= 0) errors.push(`exercise ${e.slug}: xpReward must be positive`);
  for (const [i, q] of e.questions.entries()) {
    if (q.options.length < 2) errors.push(`exercise ${e.slug} q${i + 1}: needs at least 2 options`);
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) errors.push(`exercise ${e.slug} q${i + 1}: correctIndex out of range`);
    if (new Set(q.options).size !== q.options.length) errors.push(`exercise ${e.slug} q${i + 1}: duplicate options`);
  }
}

for (const ref of relatedLessonRefs) {
  if (!lessonSlugs.has(ref.to)) errors.push(`${ref.from}: related_lesson points at unknown lesson '${ref.to}'`);
}
for (const slug of referencedExercises) {
  if (!exerciseSlugs.has(slug)) errors.push(`a practice_ref points at unknown exercise '${slug}'`);
}

/* Lesson slugs the shipped labs depend on. Losing one silently unlinks a lab. */
for (const required of [
  'ports',
  'nmap-first-scan',
  'http',
  'headers',
  'cookies',
  'sessions',
  'authentication-vs-authorization',
  'terminal-basics',
  'files-and-permissions',
  'users-and-processes',
]) {
  if (!lessonSlugs.has(required)) errors.push(`lab-referenced lesson slug '${required}' is missing from the curriculum`);
}

const modulesWithoutExercise: string[] = [];
for (const p of PATH_SEEDS) {
  for (const m of p.modules) {
    const slugsInModule = new Set(m.lessons.map((l) => l.slug));
    if (!EXERCISE_SEEDS.some((e) => slugsInModule.has(e.lessonSlug))) modulesWithoutExercise.push(`${p.slug}/${m.slug}`);
  }
}
for (const m of modulesWithoutExercise) warnings.push(`module ${m} has no practice exercise`);

console.log('=== CURRICULUM VALIDATION ===');
console.log(`paths:     ${PATH_SEEDS.length}`);
console.log(`modules:   ${moduleCount}`);
console.log(`lessons:   ${lessonCount}  (must-know ${essentialCount} / normal ${coreCount} / optional ${optionalCount})`);
console.log(`exercises: ${EXERCISE_SEEDS.length}`);
console.log(`video slots reserved: ${videoSlots}/${lessonCount}`);
console.log(`diagrams attached:    ${diagramCount}`);
console.log(`total learn time: ${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`);
console.log('');

if (warnings.length) {
  console.log(`--- ${warnings.length} warning(s) ---`);
  for (const w of warnings.slice(0, 60)) console.log('  ! ' + w);
  if (warnings.length > 60) console.log(`  ... ${warnings.length - 60} more`);
  console.log('');
}

if (errors.length) {
  console.log(`--- ${errors.length} ERROR(s) ---`);
  for (const e of errors.slice(0, 120)) console.log('  x ' + e);
  if (errors.length > 120) console.log(`  ... ${errors.length - 120} more`);
  process.exit(1);
}

console.log('All checks passed.');
