import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { qk } from '@/lib/queries';
import { FormHint, Input, Label, Select } from '@/components/ui/input';
import type { DiagramSummary } from '@suraksha/shared';

/**
 * Picks a diagram from the database for an image block, with a live preview.
 *
 * Editors can also paste any URL, so this never traps them - but the dropdown is
 * the intended path, because those images are the ones they can edit in
 * Admin -> Diagrams.
 */
export function DiagramPicker({
  src,
  onChange,
}: {
  src: string;
  onChange: (next: string) => void;
}) {
  const [manual, setManual] = useState(() => Boolean(src) && !src.startsWith('/api/v1/diagrams/'));

  const listQ = useQuery({
    queryKey: qk.adminDiagrams,
    queryFn: () => api<{ diagrams: DiagramSummary[] }>('/admin/diagrams'),
    staleTime: 60_000,
  });

  const diagrams = listQ.data?.diagrams ?? [];
  const grouped = useMemo(() => {
    const map = new Map<string, DiagramSummary[]>();
    for (const d of diagrams) {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [diagrams]);

  const selected = diagrams.find((d) => d.url === src) ?? null;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="img-diagram">Diagram</Label>
          <button
            type="button"
            onClick={() => setManual((m) => !m)}
            className="text-xs font-medium text-accent hover:underline"
          >
            {manual ? 'Pick from library' : 'Use a custom URL'}
          </button>
        </div>

        {manual ? (
          <>
            <Input
              id="img-diagram"
              value={src}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or /api/v1/diagrams/your-slug"
              className="font-mono"
            />
            <FormHint>A custom URL is not editable in the admin panel. Prefer a library diagram.</FormHint>
          </>
        ) : (
          <>
            <Select id="img-diagram" value={selected?.url ?? ''} onChange={(e) => onChange(e.target.value)}>
              <option value="">
                {listQ.isLoading ? 'Loading diagrams…' : diagrams.length ? 'Select a diagram…' : 'No diagrams yet'}
              </option>
              {grouped.map(([category, items]) => (
                <optgroup key={category} label={category}>
                  {items.map((d) => (
                    <option key={d.id} value={d.url}>
                      {d.title} ({d.slug})
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
            <FormHint>
              <Link to="/admin/diagrams" className="inline-flex items-center gap-1 text-accent hover:underline">
                Manage diagrams <ExternalLink className="size-3" aria-hidden />
              </Link>{' '}
              to add or edit the picture itself.
            </FormHint>
          </>
        )}
      </div>

      {src && (
        <div className="rounded-lg border border-border bg-surface-2 p-2">
          <img src={src} alt="" className="mx-auto max-h-48 w-full object-contain" />
        </div>
      )}
    </div>
  );
}
