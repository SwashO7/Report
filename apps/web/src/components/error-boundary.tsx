import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Detects the "stale client" failure: the browser is running an index.html from
 * a previous deploy, so its content-hashed lazy chunks no longer exist on the
 * server. The dynamic import rejects, React unmounts the tree, and the user
 * gets a blank screen with no clue what happened.
 *
 * Browsers word this differently, hence the pattern list rather than one match.
 */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /Loading chunk|Loading CSS chunk|ChunkLoadError|dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
    message,
  );
}

const RELOAD_FLAG = 'suraksha:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 15_000;

/**
 * Reloads once to pick up the current index.html. Guarded by a timestamp in
 * sessionStorage so a genuinely broken deploy cannot become a reload loop.
 * Returns true when a reload was triggered.
 */
export function reloadForStaleChunks(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode / blocked): fall through and
    // reload anyway. Worst case the user sees the recovery screen instead.
  }
  window.location.reload();
  return true;
}

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  reloading: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, reloading: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[error-boundary]', error, info.componentStack);
    if (isChunkLoadError(error) && reloadForStaleChunks()) {
      this.setState({ reloading: true });
    }
  }

  render() {
    const { error, reloading } = this.state;
    if (!error) return this.props.children;

    const stale = isChunkLoadError(error);

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold tracking-tight text-text">
          {stale ? 'This page is out of date' : 'Something went wrong'}
        </h1>
        <p className="max-w-md text-sm text-text-secondary">
          {reloading
            ? 'Reloading to pick up the latest version…'
            : stale
              ? 'The app was updated while this tab was open, so part of it could not load. Reloading will fetch the current version.'
              : 'This section failed to render. Reloading usually clears it. If it keeps happening, the details below help us track it down.'}
        </p>
        {!reloading && (
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
        )}
        {!stale && (
          <details className="max-w-xl text-left">
            <summary className="cursor-pointer text-xs text-text-tertiary">Technical details</summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-lg bg-surface-2 p-3 font-mono text-xs text-text-secondary">
              {error.name}: {error.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
