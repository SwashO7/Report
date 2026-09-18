import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { emailTemplates } from '../db/schema';
import { templates, type TemplateKey } from './templates';

/**
 * Template resolution & management.
 *
 * A row in `email_templates` OVERRIDES the code template of the same key. When
 * no row exists we fall back to the compiled-in code template, so an admin can
 * never break transactional mail (verification, password reset) by deleting a
 * row — the fallback always exists.
 *
 * Placeholders are `{{variable}}`; every substituted value is HTML-escaped, so
 * an admin-authored template can never inject raw markup a recipient would run.
 */

export interface ResolvedTemplate {
  key: string;
  subject: string;
  html: string;
  text: string;
  transactional: boolean;
  /** true when an admin DB override supplied this, false for the code fallback. */
  fromDb: boolean;
}

const CODE_TEMPLATE_KEYS = Object.keys(templates) as TemplateKey[];

/** HTML-escape a single interpolated value. Never trust template-author input. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch,
  );
}

/** Extract the distinct `{{name}}` placeholder names from a template string. */
function extractVariables(...bodies: (string | null | undefined)[]): string[] {
  const found = new Set<string>();
  for (const body of bodies) {
    if (!body) continue;
    for (const m of body.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)) found.add(m[1]);
  }
  return [...found];
}

/**
 * Substitute `{{name}}` placeholders with HTML-escaped values from `vars`.
 * Unknown placeholders are left as an empty string rather than leaking `{{x}}`.
 */
export function renderPlaceholders(body: string, vars: Record<string, unknown>): string {
  return body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_full, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? escapeHtml(vars[name]) : '',
  );
}

/**
 * Render a code template with a payload. Code templates already produce final
 * HTML (they escape their own inputs), so no placeholder pass is applied.
 */
function renderCodeTemplate(key: TemplateKey, payload: Record<string, unknown>): ResolvedTemplate {
  const fn = templates[key];
  const rendered = fn(payload as never);
  return { key, subject: rendered.subject, html: rendered.html, text: rendered.text, transactional: true, fromDb: false };
}

/**
 * Resolve a template by key against a payload of variables.
 *
 * DB override wins; code template is the fallback. Returns null only when the
 * key matches neither a DB row nor a code template.
 */
export async function resolveTemplate(
  key: string,
  vars: Record<string, unknown> = {},
): Promise<ResolvedTemplate | null> {
  const row = (await db.select().from(emailTemplates).where(eq(emailTemplates.key, key)).limit(1))[0];

  if (row) {
    const html = renderPlaceholders(row.htmlBody, vars);
    const text = row.textBody
      ? renderPlaceholders(row.textBody, vars)
      : html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
      key: row.key,
      subject: renderPlaceholders(row.subject, vars),
      html,
      text,
      transactional: row.transactional,
      fromDb: true,
    };
  }

  if ((CODE_TEMPLATE_KEYS as string[]).includes(key)) {
    return renderCodeTemplate(key as TemplateKey, vars);
  }
  return null;
}

/* ------------------------------- Admin CRUD ------------------------------- */

export interface TemplateUpsertInput {
  name: string;
  description?: string | null;
  subject: string;
  htmlBody: string;
  textBody?: string | null;
  enabled?: boolean;
  transactional?: boolean;
}

/** List every template row (admin view). */
export async function listTemplates() {
  return db.select().from(emailTemplates).orderBy(emailTemplates.key);
}

/** Fetch a single template row by key, or null. */
export async function getTemplate(key: string) {
  return (await db.select().from(emailTemplates).where(eq(emailTemplates.key, key)).limit(1))[0] ?? null;
}

/**
 * Create or update the DB override for a key. Variables are derived from the
 * bodies so the editor's help text stays accurate without a separate field.
 *
 * A key that already exists in code is treated as transactional by default and
 * its `transactional`/`enabled` flags are pinned so an admin cannot demote a
 * transactional template into something the marketing opt-out could suppress.
 */
export async function upsertTemplate(key: string, input: TemplateUpsertInput, updatedBy: string) {
  const isCodeKey = (CODE_TEMPLATE_KEYS as string[]).includes(key);
  const transactional = isCodeKey ? true : Boolean(input.transactional);
  const enabled = isCodeKey ? true : input.enabled ?? true;
  const variables = extractVariables(input.subject, input.htmlBody, input.textBody);

  const existing = await getTemplate(key);
  if (existing) {
    const [row] = await db
      .update(emailTemplates)
      .set({
        name: input.name,
        description: input.description ?? null,
        subject: input.subject,
        htmlBody: input.htmlBody,
        textBody: input.textBody ?? null,
        variables,
        enabled,
        transactional,
        updatedBy,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.key, key))
      .returning();
    return row;
  }

  const [row] = await db
    .insert(emailTemplates)
    .values({
      key,
      name: input.name,
      description: input.description ?? null,
      subject: input.subject,
      htmlBody: input.htmlBody,
      textBody: input.textBody ?? null,
      variables,
      enabled,
      transactional,
      updatedBy,
    })
    .returning();
  return row;
}

/** Sample variables used by the admin preview so a render shows real shape. */
export function sampleVarsFor(key: string): Record<string, unknown> {
  const common: Record<string, unknown> = {
    name: 'Alex Sharma',
    url: 'https://surakshalabs.example/verify/sample',
    title: 'SQL Injection Basics',
    labTitle: 'SQL Injection Basics',
    description: 'Solve five labs without a single hint.',
    kind: 'lab',
    xp: 250,
    rank: 7,
  };
  return common;
}

/**
 * Seed/upsert a DB row for every code TemplateKey with transactional=true, so
 * the admin panel lists them immediately. Renders each code template with its
 * sample vars to capture a real starting HTML body; existing rows are NOT
 * overwritten (an admin's edits win). Idempotent — safe to run on every boot.
 */
export async function seedTemplates(): Promise<{ created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  for (const key of CODE_TEMPLATE_KEYS) {
    const existing = await getTemplate(key);
    if (existing) {
      skipped += 1;
      continue;
    }
    const rendered = renderCodeTemplate(key, sampleVarsFor(key));
    await db.insert(emailTemplates).values({
      key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
      description: 'Transactional template (falls back to code when unset).',
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      variables: extractVariables(rendered.subject, rendered.html, rendered.text),
      enabled: true,
      transactional: true,
    });
    created += 1;
  }
  return { created, skipped };
}
