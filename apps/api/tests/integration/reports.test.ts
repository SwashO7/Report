/**
 * Integration tests for public reports and admin report management, run against
 * the real app and database. Requires a migrated database.
 * Run: bun test tests/integration/reports.test.ts   (from apps/api)
 */
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { eq, inArray } from 'drizzle-orm';
import { createApp } from '../../src/core/app';
import { db } from '../../src/db/client';
import { reports, users } from '../../src/db/schema';
import { FIXTURES } from '../fixtures/media';

const app = createApp();
const stamp = Date.now();
const PASSWORD = 'Str0ngPassphrase1';

type Res = { status: number; headers: Headers; body: any };

async function call(method: string, path: string, opts: { cookie?: string; json?: unknown; form?: FormData; headers?: Record<string, string> } = {}): Promise<Res> {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.cookie) headers.Cookie = opts.cookie;
  let body: RequestInit['body'];
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    body = opts.form;
  }
  const res = await app.request(`/api/v1${path}`, { method, headers, body });
  const type = res.headers.get('content-type') ?? '';
  const parsed = type.includes('application/json') ? await res.json().catch(() => null) : await res.arrayBuffer();
  return { status: res.status, headers: res.headers, body: parsed };
}

async function signupAs(label: string, role: string): Promise<{ id: string; cookie: string }> {
  const email = `rp-${label}-${stamp}@suraksha.test`;
  const username = `rp${label.slice(0, 3)}${stamp % 1_000_000}`;
  const res = await app.request('/api/v1/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Reports ${label}`, username, email, password: PASSWORD }),
  });
  expect(res.status).toBe(201);
  const { user } = (await res.json()) as { user: { id: string } };
  await db.update(users).set({ role }).where(eq(users.id, user.id));
  // Log in again so the session reflects the new role.
  const login = await app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  expect(login.status).toBe(200);
  return { id: user.id, cookie: login.headers.get('set-cookie')!.split(';')[0] };
}

function reportForm(fields: Record<string, string>, files: { image?: File; video?: File } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  if (files.image) fd.append('image', files.image);
  if (files.video) fd.append('video', files.video);
  return fd;
}

const png = () => new File([FIXTURES.png()], 'shot.png', { type: 'image/png' });
const jpeg = () => new File([FIXTURES.jpeg()], 'shot.jpg', { type: 'image/jpeg' });
const mp4 = () => new File([FIXTURES.mp4()], 'clip.mp4', { type: 'video/mp4' });

let admin: { id: string; cookie: string };
let moderator: { id: string; cookie: string };
let learner: { id: string; cookie: string };
const createdIds: string[] = [];
const userIds: string[] = [];

const ids: Record<string, { id: string; slug: string }> = {};

beforeAll(async () => {
  admin = await signupAs('admin', 'administrator');
  moderator = await signupAs('moder', 'moderator');
  learner = await signupAs('learn', 'learner');
  userIds.push(admin.id, moderator.id, learner.id);
});

afterAll(async () => {
  // Remove anything this run created (media is removed by the delete endpoint).
  for (const id of createdIds) await call('DELETE', `/admin/reports/${id}`, { cookie: admin.cookie });
  if (createdIds.length) await db.delete(reports).where(inArray(reports.id, createdIds));
  if (userIds.length) await db.delete(users).where(inArray(users.id, userIds));
});

async function create(label: string, fields: Record<string, string>, files: { image?: File; video?: File } = {}) {
  const res = await call('POST', '/admin/reports', { cookie: admin.cookie, form: reportForm(fields, files) });
  expect(res.status).toBe(201);
  createdIds.push(res.body.report.id);
  ids[label] = { id: res.body.report.id, slug: res.body.report.slug };
  return res.body.report;
}

describe('admin creates reports', () => {
  test('1. text-only report', async () => {
    const r = await create('text', { title: `Bug in Example Application ${stamp}`, description: 'The **login** form crashes.\n\nSecond paragraph.', status: 'published' });
    expect(r.image).toBeNull();
    expect(r.video).toBeNull();
    expect(r.status).toBe('published');
    expect(r.slug).toBe(`bug-in-example-application-${stamp}`);
    expect(r.publishedAt).not.toBeNull();
  });

  test('2. image-only report', async () => {
    const r = await create('image', { title: `Image report ${stamp}`, description: 'Screenshot attached.', status: 'published', imageAlt: 'Error dialog' }, { image: png() });
    expect(r.image.mimeType).toBe('image/png');
    expect(r.image.url).toMatch(/^\/api\/v1\/reports\/media\/[0-9a-f-]{36}\.png$/);
    expect(r.image.alt).toBe('Error dialog');
    expect(r.video).toBeNull();
  });

  test('3. video-only report', async () => {
    const r = await create('video', { title: `Video report ${stamp}`, description: 'Recording attached.', status: 'published' }, { video: mp4() });
    expect(r.video.mimeType).toBe('video/mp4');
    expect(r.image).toBeNull();
  });

  test('4. image + video report (saved as draft)', async () => {
    const r = await create('both', { title: `Both media ${stamp}`, description: 'Both attached.' }, { image: png(), video: mp4() });
    expect(r.image).not.toBeNull();
    expect(r.video).not.toBeNull();
    expect(r.status).toBe('draft');
    expect(r.publishedAt).toBeNull();
  });

  test('duplicate titles get a unique slug; explicit duplicate slug is a conflict', async () => {
    const again = await create('dup', { title: `Bug in Example Application ${stamp}`, description: 'Duplicate title.' });
    expect(again.slug).toBe(`bug-in-example-application-${stamp}-2`);
    const clash = await call('POST', '/admin/reports', {
      cookie: admin.cookie,
      form: reportForm({ title: 'Clash', slug: ids.text.slug, description: 'x' }),
    });
    expect(clash.status).toBe(409);
  });

  test('missing title/description is a validation error', async () => {
    const res = await call('POST', '/admin/reports', { cookie: admin.cookie, form: reportForm({ title: '', description: '' }) });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('admin edits and deletes', () => {
  test('5. edit text and publish state', async () => {
    const res = await call('PATCH', `/admin/reports/${ids.both.id}`, {
      cookie: admin.cookie,
      form: reportForm({ title: `Both media edited ${stamp}`, description: 'Updated body.', status: 'published' }),
    });
    expect(res.status).toBe(200);
    expect(res.body.report.title).toBe(`Both media edited ${stamp}`);
    expect(res.body.report.status).toBe('published');
    expect(res.body.report.image).not.toBeNull(); // untouched media is kept
    expect(res.body.report.video).not.toBeNull();
  });

  test('6. replace image and remove video; old files stop being served', async () => {
    const before = (await call('GET', `/admin/reports/${ids.both.id}`, { cookie: admin.cookie })).body.report;
    const res = await call('PATCH', `/admin/reports/${ids.both.id}`, {
      cookie: admin.cookie,
      form: reportForm({ removeVideo: 'true' }, { image: jpeg() }),
    });
    expect(res.status).toBe(200);
    const after = res.body.report;
    expect(after.image.mimeType).toBe('image/jpeg');
    expect(after.image.url).not.toBe(before.image.url);
    expect(after.video).toBeNull();
    expect((await call('GET', before.image.url.replace('/api/v1', ''))).status).toBe(404);
    expect((await call('GET', before.video.url.replace('/api/v1', ''))).status).toBe(404);
    expect((await call('GET', after.image.url.replace('/api/v1', ''))).status).toBe(200);
  });

  test('publish/unpublish endpoint toggles visibility', async () => {
    const off = await call('POST', `/admin/reports/${ids.image.id}/status`, { cookie: admin.cookie, json: { status: 'draft' } });
    expect(off.status).toBe(200);
    expect((await call('GET', `/reports/${ids.image.slug}`)).status).toBe(404);
    const on = await call('POST', `/admin/reports/${ids.image.id}/status`, { cookie: admin.cookie, json: { status: 'published' } });
    expect(on.status).toBe(200);
    expect((await call('GET', `/reports/${ids.image.slug}`)).status).toBe(200);
  });

  test('7. delete removes the report and its media', async () => {
    const r = await create('del', { title: `Delete me ${stamp}`, description: 'Bye.', status: 'published' }, { image: png() });
    const res = await call('DELETE', `/admin/reports/${r.id}`, { cookie: admin.cookie });
    expect(res.status).toBe(200);
    expect((await call('GET', `/reports/${r.slug}`)).status).toBe(404);
    expect((await call('GET', r.image.url.replace('/api/v1', ''))).status).toBe(404);
    expect((await call('GET', `/admin/reports/${r.id}`, { cookie: admin.cookie })).status).toBe(404);
  });
});

describe('public access', () => {
  test('8. feed lists published reports only, newest first, with excerpts', async () => {
    const res = await call('GET', '/reports?pageSize=50');
    expect(res.status).toBe(200);
    const slugs = res.body.reports.map((r: { slug: string }) => r.slug);
    expect(slugs).toContain(ids.text.slug);
    expect(slugs).not.toContain(ids.dup.slug); // draft
    const card = res.body.reports.find((r: { slug: string }) => r.slug === ids.text.slug);
    expect(card.excerpt).toBe('The login form crashes. Second paragraph.');
    expect(card.description).toBeUndefined();
  });

  test('9. detail page data for a published report', async () => {
    const res = await call('GET', `/reports/${ids.text.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.report.description).toContain('Second paragraph');
  });

  test('draft is 404 publicly but previewable by an administrator', async () => {
    expect((await call('GET', `/reports/${ids.dup.slug}`)).status).toBe(404);
    expect((await call('GET', `/reports/${ids.dup.slug}`, { cookie: learner.cookie })).status).toBe(404);
    const preview = await call('GET', `/reports/${ids.dup.slug}`, { cookie: admin.cookie });
    expect(preview.status).toBe(200);
    expect(preview.body.report.status).toBe('draft');
  });

  test('10. image is served with its verified type and safe headers', async () => {
    const r = (await call('GET', `/reports/${ids.image.slug}`)).body.report;
    const res = await call('GET', r.image.url.replace('/api/v1', ''));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).toContain("default-src 'none'");
    expect(new Uint8Array(res.body).slice(0, 4)).toEqual(FIXTURES.png().slice(0, 4));
  });

  test('11. video supports range requests for playback/seeking', async () => {
    const r = (await call('GET', `/reports/${ids.video.slug}`)).body.report;
    const path = r.video.url.replace('/api/v1', '');
    const size = FIXTURES.mp4().byteLength;
    const partial = await call('GET', path, { headers: { Range: 'bytes=4-11' } });
    expect(partial.status).toBe(206);
    expect(partial.headers.get('content-range')).toBe(`bytes 4-11/${size}`);
    expect(partial.headers.get('accept-ranges')).toBe('bytes');
    expect(new TextDecoder().decode(new Uint8Array(partial.body))).toBe('ftypisom');
    const full = await call('GET', path);
    expect(full.status).toBe(200);
    expect(Number(full.headers.get('content-length'))).toBe(size);
    expect((await call('GET', path, { headers: { Range: `bytes=${size}-` } })).status).toBe(416);
  });

  test('media of a draft is hidden from the public', async () => {
    const r = await create('draftmedia', { title: `Draft media ${stamp}`, description: 'Hidden.' }, { image: png() });
    const path = r.image.url.replace('/api/v1', '');
    expect((await call('GET', path)).status).toBe(404);
    expect((await call('GET', path, { cookie: admin.cookie })).status).toBe(200);
  });

  test('media route rejects traversal and unknown names', async () => {
    expect((await call('GET', '/reports/media/..%2F..%2F.env')).status).toBe(404);
    expect((await call('GET', '/reports/media/00000000-0000-4000-8000-000000000000.png')).status).toBe(404);
  });

  test('sitemap lists published report URLs', async () => {
    const res = await app.request('/api/v1/reports/sitemap.xml');
    expect(res.status).toBe(200);
    const xml = await res.text();
    expect(xml).toContain(`/reports/${ids.text.slug}</loc>`);
    expect(xml).not.toContain(`/reports/${ids.dup.slug}</loc>`);
  });

  test('19. an out-of-range page returns an empty list (empty state data)', async () => {
    const res = await call('GET', '/reports?page=100000');
    expect(res.status).toBe(200);
    expect(res.body.reports).toEqual([]);
  });
});

describe('authorization is enforced server-side', () => {
  const attempts = () => [
    ['POST', '/admin/reports', { form: reportForm({ title: 'Nope nope', description: 'x', status: 'published' }, { image: png() }) }],
    ['PATCH', `/admin/reports/${ids.text.id}`, { json: { title: 'Hijacked title' } }],
    ['POST', `/admin/reports/${ids.text.id}/status`, { json: { status: 'draft' } }],
    ['DELETE', `/admin/reports/${ids.text.id}`, {}],
    ['GET', '/admin/reports', {}],
  ] as const;

  test('12-14. a learner cannot create, edit, publish or delete (403)', async () => {
    for (const [method, path, opts] of attempts()) {
      const res = await call(method, path, { ...opts, cookie: learner.cookie });
      expect(res.status).toBe(403);
    }
  });

  test('staff without the administrator role are also denied (403)', async () => {
    for (const [method, path, opts] of attempts()) {
      const res = await call(method, path, { ...opts, cookie: moderator.cookie });
      expect(res.status).toBe(403);
    }
  });

  test('15. unauthenticated requests are denied (401)', async () => {
    for (const [method, path, opts] of attempts()) {
      const res = await call(method, path, opts);
      expect(res.status).toBe(401);
    }
  });

  test('the public router has no write endpoints', async () => {
    expect((await call('POST', '/reports', { json: { title: 'x' } })).status).toBe(404);
    expect((await call('DELETE', `/reports/${ids.text.slug}`)).status).toBe(404);
  });

  test('nothing was changed by the denied attempts', async () => {
    const res = await call('GET', `/reports/${ids.text.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.report.title).toBe(`Bug in Example Application ${stamp}`);
  });
});

describe('upload validation', () => {
  test('16. invalid image (HTML disguised as PNG) is rejected', async () => {
    const fake = new File(['<html><script>alert(1)</script></html>'], 'evil.png', { type: 'image/png' });
    const res = await call('POST', '/admin/reports', { cookie: admin.cookie, form: reportForm({ title: 'Bad image', description: 'x' }, { image: fake }) });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('Unsupported image type');
  });

  test('17. invalid video (image in video field, and a random blob) is rejected', async () => {
    const asVideo = await call('POST', '/admin/reports', { cookie: admin.cookie, form: reportForm({ title: 'Bad video', description: 'x' }, { video: new File([FIXTURES.png()], 'x.mp4', { type: 'video/mp4' }) }) });
    expect(asVideo.status).toBe(400);
    const blob = await call('POST', '/admin/reports', { cookie: admin.cookie, form: reportForm({ title: 'Bad video', description: 'x' }, { video: new File([new Uint8Array(64).fill(7)], 'x.webm') }) });
    expect(blob.status).toBe(400);
    expect(blob.body.error.message).toContain('Unsupported video type');
  });

  test('18. oversized image is rejected and nothing is stored', async () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 16);
    big.set(FIXTURES.png());
    const title = `Too big ${stamp}`;
    const res = await call('POST', '/admin/reports', { cookie: admin.cookie, form: reportForm({ title, description: 'x' }, { image: new File([big], 'big.png', { type: 'image/png' }) }) });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('too large');
    expect((await db.select().from(reports).where(eq(reports.title, title))).length).toBe(0);
  });

  test('a failed edit leaves the report unchanged', async () => {
    const res = await call('PATCH', `/admin/reports/${ids.image.id}`, {
      cookie: admin.cookie,
      form: reportForm({ title: 'Should not apply' }, { video: new File(['nope'.repeat(10)], 'v.mp4') }),
    });
    expect(res.status).toBe(400);
    const r = (await call('GET', `/admin/reports/${ids.image.id}`, { cookie: admin.cookie })).body.report;
    expect(r.title).toBe(`Image report ${stamp}`);
  });
});

describe('20. existing features still work', () => {
  test('existing public endpoints respond', async () => {
    expect((await call('GET', '/health')).status).toBe(200);
    expect((await call('GET', '/labs')).status).toBe(200);
    expect((await call('GET', '/learn/paths')).status).toBe(200);
    expect((await call('GET', '/admin/stats', { cookie: admin.cookie })).status).toBe(200);
  });
});
