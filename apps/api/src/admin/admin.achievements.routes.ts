import { Hono } from 'hono';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { achievements } from '../db/schema';
import { errors } from '../core/errors';
import { requireRole, getAuthUser } from '../core/auth';
import { hasRole } from '../core/rbac';
import { audit } from '../audit/audit.service';

const achievementUpsertSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().min(2).max(2000).optional(),
  icon: z.string().max(60).optional(),
  category: z.string().max(60).optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
  criteria: z
    .object({
      event: z.enum(['lab_solved', 'lesson_completed', 'practice_completed', 'streak_day']),
      metric: z.enum(['count', 'first_attempt_solve', 'speed_solve']),
      threshold: z.number().int().min(1).max(10000),
      categorySlug: z.string().max(80).optional(),
      maxHints: z.number().int().min(0).max(10).optional(),
      withinMinutes: z.number().int().min(1).max(100000).optional(),
    })
    .optional(),
  xpReward: z.number().int().min(0).max(100000).optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const adminAchievementRoutes = new Hono()
  .use('*', requireRole('administrator', 'super_admin'))

  .get('/', async (c) => {
    const rows = await db.select().from(achievements).orderBy(achievements.sortOrder, achievements.title);
    return c.json({ achievements: rows });
  })

  .post('/', async (c) => {
    const user = getAuthUser(c);
    const input = achievementUpsertSchema.parse(await c.req.json());
    if (!input.slug || !input.title || !input.description || !input.criteria) {
      throw errors.badRequest('slug, title, description and criteria are required.');
    }
    const dup = (await db.select({ id: achievements.id }).from(achievements).where(eq(achievements.slug, input.slug)).limit(1))[0];
    if (dup) throw errors.conflict('An achievement with this slug already exists.');

    const [row] = await db
      .insert(achievements)
      .values({
        slug: input.slug,
        title: input.title,
        description: input.description,
        icon: input.icon ?? 'award',
        category: input.category ?? 'general',
        rarity: input.rarity ?? 'common',
        criteria: input.criteria,
        xpReward: input.xpReward ?? 0,
        isVisible: input.isVisible ?? true,
        sortOrder: input.sortOrder ?? 100,
      })
      .returning();
    await audit({ actorId: user.id, action: 'achievement_created', entityType: 'achievement', entityId: row.id, metadata: { slug: row.slug } });
    return c.json({ achievement: row }, 201);
  })

  .patch('/:id', async (c) => {
    const user = getAuthUser(c);
    const input = achievementUpsertSchema.partial().omit({ slug: true }).parse(await c.req.json());
    const id = c.req.param('id');
    const [row] = await db
      .update(achievements)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.rarity !== undefined ? { rarity: input.rarity } : {}),
        ...(input.criteria !== undefined ? { criteria: input.criteria } : {}),
        ...(input.xpReward !== undefined ? { xpReward: input.xpReward } : {}),
        ...(input.isVisible !== undefined ? { isVisible: input.isVisible } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      })
      .where(eq(achievements.id, id))
      .returning();
    if (!row) throw errors.notFound('Achievement not found.');
    await audit({ actorId: user.id, action: 'achievement_modified', entityType: 'achievement', entityId: id, metadata: { slug: row.slug } });
    return c.json({ achievement: row });
  });
