import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './app-v2';
import { reloadForStaleChunks } from './components/error-boundary';
import './styles/globals.css';
import './styles/redesign.css';

// Vite fires this when a lazy route's module (or its preload) cannot be
// fetched. After a redeploy the hashed chunk names change, so a tab still
// running the previous index.html asks for files that are gone. Recover by
// reloading once (rate-limited) rather than letting the import rejection
// blank the screen.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  reloadForStaleChunks();
});

document.documentElement.classList.add('dark');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
