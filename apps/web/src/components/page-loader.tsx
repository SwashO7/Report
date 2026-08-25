export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-3">
        <img src="/brand/logo-white.png" alt="" className="size-8 animate-pulse dark:block hidden" aria-hidden />
        <img src="/brand/logo-dark.png" alt="" className="size-8 animate-pulse dark:hidden" aria-hidden />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
