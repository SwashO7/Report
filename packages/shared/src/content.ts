import { z } from 'zod';

/**
 * Modular lesson content blocks. Lessons store an ordered array of these.
 * The frontend renders each block through a dedicated, reusable component.
 * Rich text is a safe markdown subset (bold/italic/inline code/links/lists);
 * raw HTML is never rendered.
 */

export const headingBlock = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(2), z.literal(3), z.literal(4)]),
  text: z.string().min(1).max(300),
});

export const paragraphBlock = z.object({
  type: z.literal('paragraph'),
  text: z.string().min(1).max(20000),
});

export const videoBlock = z.object({
  type: z.literal('video'),
  provider: z.enum(['youtube', 'direct']),
  url: z.string().url().max(1000),
  title: z.string().max(300).optional(),
  startAt: z.number().int().min(0).optional(),
});

export const imageBlock = z.object({
  type: z.literal('image'),
  src: z.string().max(1000),
  alt: z.string().min(1).max(500),
  caption: z.string().max(500).optional(),
});

export const codeBlock = z.object({
  type: z.literal('code'),
  language: z.string().max(40).default('text'),
  filename: z.string().max(200).optional(),
  code: z.string().max(40000),
});

export const commandBlock = z.object({
  type: z.literal('command'),
  description: z.string().max(1000).optional(),
  commands: z.array(z.string().min(1).max(2000)).min(1).max(20),
});

export const calloutBlock = z.object({
  type: z.literal('callout'),
  variant: z.enum(['info', 'warning', 'success', 'danger']),
  title: z.string().max(200).optional(),
  text: z.string().min(1).max(5000),
});

export const listBlock = z.object({
  type: z.literal('list'),
  ordered: z.boolean(),
  items: z.array(z.string().min(1).max(2000)).min(1).max(50),
});

export const quizBlock = z.object({
  type: z.literal('quiz'),
  question: z.string().min(1).max(2000),
  options: z.array(z.string().min(1).max(1000)).min(2).max(10),
  correctIndex: z.number().int().min(0),
  explanation: z.string().max(3000).optional(),
});

export const practiceRefBlock = z.object({
  type: z.literal('practice_ref'),
  title: z.string().min(1).max(300),
  exerciseSlug: z.string().min(1).max(200),
});

export const labRefBlock = z.object({
  type: z.literal('lab_ref'),
  labSlug: z.string().min(1).max(200),
  title: z.string().max(300).optional(),
});

export const resourceBlock = z.object({
  type: z.literal('resource'),
  label: z.string().min(1).max(300),
  url: z.string().max(1000),
  kind: z.enum(['download', 'external']),
  description: z.string().max(500).optional(),
});

export const relatedLessonBlock = z.object({
  type: z.literal('related_lesson'),
  lessonSlug: z.string().min(1).max(200),
  title: z.string().max(300).optional(),
});

export const relatedLabBlock = z.object({
  type: z.literal('related_lab'),
  labSlug: z.string().min(1).max(200),
  title: z.string().max(300).optional(),
});

export const contentBlockSchema = z.discriminatedUnion('type', [
  headingBlock,
  paragraphBlock,
  videoBlock,
  imageBlock,
  codeBlock,
  commandBlock,
  calloutBlock,
  listBlock,
  quizBlock,
  practiceRefBlock,
  labRefBlock,
  resourceBlock,
  relatedLessonBlock,
  relatedLabBlock,
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export function youtubeEmbedUrl(url: string, startAt?: number): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) {
      const s = startAt && startAt > 0 ? `?start=${startAt}` : '';
      return `https://www.youtube-nocookie.com/embed/${m[1]}${s}`;
    }
  }
  return null;
}
