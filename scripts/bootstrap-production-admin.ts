/**
 * Production super-admin bootstrap.
 *
 *   bun scripts/bootstrap-production-admin.ts
 *   bun scripts/bootstrap-production-admin.ts --force
 *
 * Creates exactly ONE `super_admin` on a fresh production database. This is the
 * only account that exists at launch; every other staff member is invited from
 * inside the admin panel afterwards (see docs/GCP_DEPLOYMENT.md Part 17).
 *
 * Design constraints (all deliberate):
 *   - Idempotent: refuses to run if a super_admin already exists, unless --force.
 *   - The password is NEVER read from a CLI argument. argv is visible in shell
 *     history and in `ps`, so it is read from a hidden prompt or from the
 *     BOOTSTRAP_ADMIN_PASSWORD env var (useful for `gcloud run jobs execute`).
 *   - Strong-password policy enforced; the published dev demo passwords are
 *     rejected outright so a copy-paste from the seed output cannot happen.
 *   - Argon2id hashing is REUSED from the platform (Bun.password, same params
 *     as apps/api/src/db/seed/index.ts). Hashing is not reimplemented here.
 *   - emailVerifiedAt is set so the account can log in immediately.
 *   - An audit_logs row is written via the platform audit() helper.
 *   - Nothing secret is ever printed. Only the email and a 2FA reminder.
 *
 * Env it uses: BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME (optional),
 * BOOTSTRAP_ADMIN_USERNAME (optional), BOOTSTRAP_ADMIN_PASSWORD (optional).
 */
import { db } from '../apps/api/src/db/client';
import { users } from '../apps/api/src/db/schema';
import { audit } from '../apps/api/src/audit/audit.service';

/*
 * Note: drizzle query operators (eq/sql) are NOT imported at the top level.
 * A repo-root script cannot resolve the workspace-hoisted `drizzle-orm`
 * package, but the relational query API (db.query.<table>) hands `eq` to its
 * `where` callback, so lookups work without a package-level import.
 */

/* Argon2id params — must match the platform's hashing everywhere else. */
const ARGON2 = { algorithm: 'argon2id', memoryCost: 65536, timeCost: 3 } as const;

/* Known dev/demo passwords that must never become a production credential.
 * Kept in sync with apps/api/src/db/seed/users.ts. */
const FORBIDDEN_PASSWORDS = new Set([
  'SurakshaAdmin1',
  'SurakshaEditor1',
  'SurakshaLabmgr1',
  'SurakshaLearner1',
  'SurakshaDemo1',
]);

const MIN_LENGTH = 16;

function hasArg(name: string): boolean {
  return process.argv.slice(2).includes(name);
}

/** Fail early if a password was passed on the command line (it leaks). */
function guardAgainstPasswordArg(): void {
  for (const a of process.argv.slice(2)) {
    if (a === '--force') continue;
    // A bare value or --password=... on argv is always a mistake here.
    if (a.startsWith('--password') || a.startsWith('-p=') || (!a.startsWith('-') && a.length > 0)) {
      console.error(
        'Refusing to run: the password must NOT be passed as a command-line argument ' +
          '(it leaks into shell history and the process list). ' +
          'Set BOOTSTRAP_ADMIN_PASSWORD, or run with no extra args and type it at the prompt.',
      );
      process.exit(2);
    }
  }
}

/** Strong-password policy: length + at least 3 of {lower,upper,digit,symbol}. */
function passwordProblems(pw: string): string[] {
  const problems: string[] = [];
  if (pw.length < MIN_LENGTH) problems.push(`must be at least ${MIN_LENGTH} characters (got ${pw.length})`);
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(pw)).length;
  if (classes < 3) problems.push('must mix at least 3 of: lowercase, uppercase, digit, symbol');
  if (FORBIDDEN_PASSWORDS.has(pw)) problems.push('this is a known demo password and can never be used in production');
  if (/^(.)\1+$/.test(pw)) problems.push('must not be a single repeated character');
  return problems;
}

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/** Reads a line from the TTY with echo disabled (best-effort). Falls back to
 *  visible input only when there is no interactive TTY. */
async function promptHidden(label: string): Promise<string> {
  const stdin = process.stdin;
  process.stdout.write(label);

  const isTTY = Boolean(stdin.isTTY);
  if (isTTY && typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true);
    stdin.resume();
    let value = '';
    return await new Promise<string>((resolve) => {
      const onData = (buf: Buffer) => {
        const ch = buf.toString('utf8');
        for (const c of ch) {
          if (c === '\r' || c === '\n') {
            stdin.setRawMode!(false);
            stdin.pause();
            stdin.off('data', onData);
            process.stdout.write('\n');
            resolve(value);
            return;
          } else if (c === '\u0003') {
            // Ctrl-C
            stdin.setRawMode!(false);
            stdin.pause();
            process.stdout.write('\n');
            process.exit(130);
          } else if (c === '\u007f' || c === '\b') {
            value = value.slice(0, -1);
          } else {
            value += c;
          }
        }
      };
      stdin.on('data', onData);
    });
  }

  // No interactive TTY (e.g. a Cloud Run job): require the env var instead.
  process.stdout.write('\n');
  throw new Error('no interactive terminal — set BOOTSTRAP_ADMIN_PASSWORD instead');
}

async function promptVisible(label: string): Promise<string> {
  process.stdout.write(label);
  return await new Promise<string>((resolve) => {
    const stdin = process.stdin;
    stdin.resume();
    stdin.once('data', (buf: Buffer) => {
      stdin.pause();
      resolve(buf.toString('utf8').trim());
    });
  });
}

async function main(): Promise<void> {
  guardAgainstPasswordArg();
  const force = hasArg('--force');

  // 1. Idempotency: is there already a super_admin?
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.role, 'super_admin'),
    columns: { id: true, email: true },
  });

  if (existing && !force) {
    console.error(
      `A super_admin already exists (${existing.email}). ` +
        'Refusing to create another. Re-run with --force only if you are certain you need a second one.',
    );
    process.exit(1);
  }

  // 2. Collect the email.
  let email = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? '').trim().toLowerCase();
  if (!email) email = (await promptVisible('Super-admin email: ')).toLowerCase();
  if (!isValidEmail(email)) {
    console.error('That does not look like a valid email address.');
    process.exit(2);
  }
  if (email.endsWith('@suraksha.local')) {
    console.error('Refusing: @suraksha.local is the reserved DEV demo domain. Use a real staff email.');
    process.exit(2);
  }

  const name = (process.env.BOOTSTRAP_ADMIN_NAME ?? '').trim() || 'Platform Administrator';
  const username = ((process.env.BOOTSTRAP_ADMIN_USERNAME ?? '').trim() || email.split('@')[0]).slice(0, 32);

  // Reject a duplicate email up front with a clear message.
  const clash = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
    columns: { id: true },
  });
  if (clash) {
    console.error(`A user with email ${email} already exists. Choose a different email, or promote that user in the admin panel.`);
    process.exit(1);
  }

  // 3. Collect the password (env var first, then hidden prompt). Never argv.
  let password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '';
  let confirm = password; // env var path skips the confirmation prompt
  if (!password) {
    password = await promptHidden('New password (min 16 chars, hidden): ');
    confirm = await promptHidden('Confirm password: ');
  }

  if (password !== confirm) {
    console.error('Passwords did not match.');
    process.exit(2);
  }

  const problems = passwordProblems(password);
  if (problems.length > 0) {
    console.error('Password rejected:');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(2);
  }

  // 4. Hash with the platform's Argon2id (never reimplemented here).
  const passwordHash = await Bun.password.hash(password, ARGON2);
  // Drop the plaintext from memory as soon as it is hashed.
  password = '';
  confirm = '';

  const now = new Date();

  // 5. Insert the account, email pre-verified so it can log in immediately.
  const [row] = await db
    .insert(users)
    .values({
      name,
      username,
      email,
      passwordHash,
      authProvider: 'email',
      role: 'super_admin',
      status: 'active',
      emailVerifiedAt: now,
      onboardedAt: now,
      profileVisibility: 'private',
    })
    .returning({ id: users.id, email: users.email });

  // 6. Audit the bootstrap (no secret in metadata).
  await audit({
    actorId: row.id,
    action: 'admin_bootstrap',
    entityType: 'user',
    entityId: row.id,
    metadata: { email: row.email, role: 'super_admin', forced: force },
  });

  // 7. Report — nothing secret on stdout.
  console.log('\n✅ Super-admin created.');
  console.log(`   email: ${row.email}`);
  console.log(`   role:  super_admin`);
  console.log('\n⚠️  ENROL 2FA NOW. Log in, open Admin → Security → Two-factor, and');
  console.log('    complete TOTP enrolment before you do anything else. Store the');
  console.log('    recovery codes somewhere safe (a password manager, not this host).');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Bootstrap failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
