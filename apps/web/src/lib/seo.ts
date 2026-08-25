import { useEffect } from 'react';

/** Sets document.title (and meta description) per page — call once at the top of a page component. */
export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title;

    if (!description) return;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [title, description]);
}
