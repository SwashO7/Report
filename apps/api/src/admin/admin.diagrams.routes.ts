import { Hono } from 'hono';
import { z } from 'zod';
import { requireContentEditor, getAuthUser } from '../core/auth';
import { audit } from '../audit/audit.service';
import {
  DIAGRAM_MIME_TYPES,
  createDiagram,
  deleteDiagram,
  getDiagram,
  listDiagrams,
  updateDiagram,
} from '../diagrams/diagrams.service';

const mime = z.enum(DIAGRAM_MIME_TYPES);

const createSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only'),
  title: z.string().trim().min(2).max(200),
  description: z.string().max(500).default(''),
  mimeType: mime.default('image/svg+xml'),
  content: z.string().min(1).max(1_400_000),
  category: z.string().max(60).default('general'),
});

const updateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().max(500).optional(),
  mimeType: mime.optional(),
  content: z.string().min(1).max(1_400_000).optional(),
  category: z.string().max(60).optional(),
});

export const adminDiagramRoutes = new Hono()
  .use('*', requireContentEditor)

  .get('/', async (c) => c.json({ diagrams: await listDiagrams() }))

  .get('/:slug', async (c) => c.json({ diagram: await getDiagram(c.req.param('slug')) }))

  .post('/', async (c) => {
    const user = getAuthUser(c);
    const input = createSchema.parse(await c.req.json());
    const row = await createDiagram(input, user.id);
    await audit({ actorId: user.id, action: 'diagram_created', entityType: 'diagram', entityId: row.id, metadata: { slug: row.slug } });
    return c.json({ diagram: row }, 201);
  })

  .patch('/:slug', async (c) => {
    const user = getAuthUser(c);
    const input = updateSchema.parse(await c.req.json());
    const row = await updateDiagram(c.req.param('slug'), input, user.id);
    await audit({ actorId: user.id, action: 'diagram_updated', entityType: 'diagram', entityId: row.id, metadata: { slug: row.slug } });
    return c.json({ diagram: row });
  })

  .delete('/:slug', async (c) => {
    const user = getAuthUser(c);
    const slug = c.req.param('slug');
    const row = await deleteDiagram(slug);
    await audit({ actorId: user.id, action: 'diagram_deleted', entityType: 'diagram', entityId: row.id, metadata: { slug } });
    return c.json({ ok: true });
  });
