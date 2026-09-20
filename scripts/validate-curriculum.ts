/**
 * Validates the whole curriculum seed against the authoring contract in
 * `apps/api/src/db/seed/curriculum/_AUTHORING.md`, without needing a database.
 *
 *   bun scripts/validate-curriculum.ts
 *
 * Exits 1 if any ERROR is found. Warnings are advisory (prose length, video
 * placement) and do not fail the run.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { EXERCISE_SEEDS, PATH_SEEDS } from '../apps/api/src/db/seed/curriculum/index';

/** Diagram slugs are the SVG filenames in the seed's diagrams directory. */
const DIAGRAM_SLUGS = new Set(
  readdirSync(join(import.meta.dir, '..', 'apps', 'api', 'src', 'db', 'seed', 'diagrams'))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, '')),
);

const ALLOWED_BLOCKS = new Set([
  'heading',
  'paragraph',
  'video',
  'image',
  'code',
  'command',
  'callout',
  'list',
  'quiz',
  'practice_ref',
  'lab_ref',
  'resource',
  'related_lesson',
]);
const ALLOWED_VARIANTS = new Set(['info', 'warning', 'success', 'danger']);
const ALLOWED_LABS = new Set(['port-discovery', 'http-investigation', 'invoice-portal', 'log-hunter']);

const errors: string[] = [];
const warnings: string[] = [];

/* Pass 1: collect every slug so cross-references can be checked. */
const lessonSlugs = new Set<string>();
const moduleSlugs = new Set<string>();
const exerciseSlugs = new Set(EXERCISE_SEEDS.map((e) => e.slug));
let lessonCount = 0;
let moduleCount = 0;
let blockCount = 0;

for (const path of PATH_SEEDS) {
  for (const mod of path.modules) {
    moduleCount++;
    if (moduleSlugs.has(`${path.slug}/${mod.slug}`)) errors.push(`duplicate module ${path.slug}/${mod.slug}`);
    moduleSlugs.add(`${path.slug}/${mod.slug}`);
    for (const lesson of mod.lessons) {
      lessonCount++;
      if (lessonSlugs.has(lesson.slug)) errors.push(`DUPLICATE lesson slug '${lesson.slug}' (must be globally unique)`);
      lessonSlugs.add(lesson.slug);
    }
  }
}

/* Pass 2: validate structure, blocks and cross-references. */
const wordsOf = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

for (const path of PATH_SEEDS) {
  if (path.modules.length === 0) errors.push(`path '${path.slug}' has no modules - it will be unpublished by the seeder`);

  for (const mod of path.modules) {
    const where = `${path.slug}/${mod.slug}`;
    if (mod.description.length < 150 || mod.description.length > 420) {
      warnings.push(`${where}: module description is ${mod.description.length} chars (aim 200-380)`);
    }
    if (mod.lessons.length === 0) errors.push(`${where}: module has no lessons`);

    const coreLessons = mod.lessons.filter((l) => l.importance !== 'optional');
    const exercisesHere = EXERCISE_SEEDS.filter((e) => mod.lessons.some((l) => l.slug === e.lessonSlug));
    if (exercisesHere.length === 0) errors.push(`${where}: module has NO exercise attached to any of its lessons`);
    if (coreLessons.length === 0) warnings.push(`${where}: module has no core lessons`);

    for (const lesson of mod.lessons) {
      const at = `${where}/${lesson.slug}`;
      if (!lesson.slug || !lesson.title || !lesson.summary) errors.push(`${at}: missing slug/title/summary`);
      if (lesson.summary.length > 160) warnings.push(`${at}: summary is ${lesson.summary.length} chars (keep under 160)`);
      if (lesson.estimatedMinutes < 3 || lesson.estimatedMinutes > 20) {
        warnings.push(`${at}: estimatedMinutes = ${lesson.estimatedMinutes}`);
      }
      if (!['essential', 'core', 'optional'].includes(lesson.importance)) {
        errors.push(`${at}: bad importance '${lesson.importance}'`);
      }
      if (!Array.isArray(lesson.blocks) || lesson.blocks.length === 0) {
        errors.push(`${at}: no blocks`);
        continue;
      }

      let quizzes = 0;
      let successCallouts = 0;
      let videos = 0;
      let prose = 0;

      for (const block of lesson.blocks as any[]) {
        blockCount++;
        if (!ALLOWED_BLOCKS.has(block.type)) {
          errors.push(`${at}: illegal block type '${block.type}'`);
          continue;
        }
        switch (block.type) {
          case 'heading':
            if (![2, 3, 4].includes(block.level)) errors.push(`${at}: heading level ${block.level} (must be 2, 3 or 4)`);
            if (block.text?.trim().toLowerCase() === lesson.title.trim().toLowerCase()) {
              errors.push(`${at}: heading repeats the lesson title`);
            }
            prose += wordsOf(block.text ?? '');
            break;
          case 'paragraph':
            if (!block.text?.trim()) errors.push(`${at}: empty paragraph`);
            prose += wordsOf(block.text ?? '');
            break;
          case 'list':
            if (typeof block.ordered !== 'boolean') errors.push(`${at}: list missing 'ordered'`);
            if (!Array.isArray(block.items) || block.items.length < 1 || block.items.length > 50) {
              errors.push(`${at}: list must have 1-50 items`);
            }
            prose += (block.items ?? []).reduce((n: number, i: string) => n + wordsOf(i), 0);
            break;
          case 'callout':
            if (!ALLOWED_VARIANTS.has(block.variant)) errors.push(`${at}: bad callout variant '${block.variant}'`);
            if (block.variant === 'success') successCallouts++;
            if (!block.text?.trim()) errors.push(`${at}: empty callout`);
            prose += wordsOf(block.text ?? '');
            break;
          case 'command':
            if (!Array.isArray(block.commands) || block.commands.length < 1 || block.commands.length > 20) {
              errors.push(`${at}: command block must have 1-20 commands`);
            }
            break;
          case 'code':
            if (!block.language) errors.push(`${at}: code block missing language`);
            if (!block.code?.trim()) errors.push(`${at}: empty code block`);
            break;
          case 'video':
            videos++;
            if (block.provider !== 'youtube' && block.provider !== 'direct') {
              errors.push(`${at}: bad video provider '${block.provider}'`);
            }
            break;
          case 'quiz': {
            quizzes++;
            const opts = block.options ?? [];
            if (opts.length < 2 || opts.length > 6) errors.push(`${at}: quiz has ${opts.length} options`);
            if (typeof block.correctIndex !== 'number' || block.correctIndex < 0 || block.correctIndex >= opts.length) {
              errors.push(`${at}: quiz correctIndex ${block.correctIndex} out of range`);
            }
            if (new Set(opts).size !== opts.length) errors.push(`${at}: quiz has duplicate options`);
            break;
          }
          case 'lab_ref':
            if (!ALLOWED_LABS.has(block.labSlug)) errors.push(`${at}: lab_ref to non-existent lab '${block.labSlug}'`);
            break;
          case 'related_lesson':
            if (!lessonSlugs.has(block.lessonSlug)) {
              errors.push(`${at}: related_lesson points at unknown lesson '${block.lessonSlug}'`);
            }
            if (block.lessonSlug === lesson.slug) errors.push(`${at}: related_lesson points at itself`);
            break;
          case 'practice_ref':
            if (!exerciseSlugs.has(block.exerciseSlug)) {
              errors.push(`${at}: practice_ref points at unknown exercise '${block.exerciseSlug}'`);
            }
            break;
          case 'resource':
            if (!block.url || !block.label) errors.push(`${at}: resource missing label/url`);
            break;
          case 'image': {
            if (!block.alt?.trim()) errors.push(`${at}: image block missing alt text`);
            const m = /^\/api\/v1\/diagrams\/([a-z0-9-]+)$/.exec(block.src ?? '');
            if (!m) {
              errors.push(`${at}: image src '${block.src}' is not a /api/v1/diagrams/<slug> reference`);
            } else if (!DIAGRAM_SLUGS.has(m[1])) {
              errors.push(`${at}: image references unknown diagram '${m[1]}'`);
            }
            break;
          }
        }
      }

      if (quizzes !== 1) errors.push(`${at}: has ${quizzes} quiz blocks (must be exactly 1)`);
      if (successCallouts < 1) errors.push(`${at}: missing the 'success' callout`);
      if (videos > 1) errors.push(`${at}: has ${videos} video blocks`);
      if (prose < 380) warnings.push(`${at}: only ${prose} words of prose (aim 450-700)`);
      if (prose > 950) warnings.push(`${at}: ${prose} words of prose (aim 450-700)`);
    }
  }
}

/* Pass 3: exercises. */
const seenExerciseSlug = new Set<string>();
for (const ex of EXERCISE_SEEDS) {
  if (seenExerciseSlug.has(ex.slug)) errors.push(`DUPLICATE exercise slug '${ex.slug}'`);
  seenExerciseSlug.add(ex.slug);
  if (!lessonSlugs.has(ex.lessonSlug)) {
    errors.push(`exercise '${ex.slug}' attaches to unknown lesson '${ex.lessonSlug}'`);
  }
  if (ex.kind !== 'quiz') errors.push(`exercise '${ex.slug}': kind must be 'quiz'`);
  if (ex.questions.length < 3) warnings.push(`exercise '${ex.slug}' has only ${ex.questions.length} questions (aim 4-6)`);
  for (const [i, q] of ex.questions.entries()) {
    if (q.options.length < 2) errors.push(`exercise '${ex.slug}' q${i + 1}: needs at least 2 options`);
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      errors.push(`exercise '${ex.slug}' q${i + 1}: correctIndex out of range`);
    }
    if (new Set(q.options).size !== q.options.length) errors.push(`exercise '${ex.slug}' q${i + 1}: duplicate options`);
  }
}

/* Report. */
const pathLines = PATH_SEEDS.map((p) => {
  const lessons = p.modules.reduce((n, m) => n + m.lessons.length, 0);
  return `  L${String(p.levelNumber).padStart(2, '0')} ${p.name.padEnd(38)} ${String(p.modules.length).padStart(2)} modules  ${String(lessons).padStart(3)} lessons`;
});

console.log('Curriculum seed validation');
console.log(pathLines.join('\n'));
console.log(
  `\n  TOTAL: ${PATH_SEEDS.length} paths, ${moduleCount} modules, ${lessonCount} lessons, ${blockCount} content blocks, ${EXERCISE_SEEDS.length} exercises`,
);

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 40)) console.log(`  ~ ${w}`);
  if (warnings.length > 40) console.log(`  ... and ${warnings.length - 40} more`);
}

if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors.slice(0, 60)) console.log(`  x ${e}`);
  if (errors.length > 60) console.log(`  ... and ${errors.length - 60} more`);
  process.exit(1);
}

console.log('\nNo errors. Seed is contract-clean.');
