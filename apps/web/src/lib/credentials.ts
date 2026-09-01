/**
 * Tells the browser a login/signup just succeeded so it can offer to save the
 * password. Suraksha Labs signs in via fetch() and then does a client-side
 * route change (React Router), so the browser never sees a normal form POST
 * or full-page navigation, the two signals Chrome/Edge/Firefox normally use
 * to trigger the "save password?" prompt. The Credential Management API
 * (navigator.credentials.store) is the correct, standards-based way to
 * signal this explicitly for a single-page app.
 *
 * No-op (never throws) when the API is unavailable: unsupported browser,
 * insecure context (plain HTTP on a non-localhost origin), or a user
 * preference that disabled it.
 */
/** Minimal shape of the Credential Management API's PasswordCredential constructor.
 *  Not consistently present in TypeScript's bundled DOM lib across versions,
 *  so it is declared locally rather than relied on ambiently. */
interface PasswordCredentialLike extends Credential {
  readonly password?: string;
}
interface PasswordCredentialConstructor {
  new (data: { id: string; password: string; name?: string; iconURL?: string }): PasswordCredentialLike;
}

export async function offerToSavePassword(identifier: string, password: string, name?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const PasswordCredentialCtor = (window as unknown as { PasswordCredential?: PasswordCredentialConstructor }).PasswordCredential;
  if (!PasswordCredentialCtor || !navigator.credentials?.store) return;

  try {
    const credential = new PasswordCredentialCtor({
      id: identifier,
      password,
      name,
    });
    await navigator.credentials.store(credential as unknown as Credential);
  } catch {
    // Best-effort only, never block or fail the login/signup flow on this.
  }
}
