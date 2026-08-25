import { Badge, type BadgeVariant } from '@/components/ui/card';

const STATUS_CONFIG: Record<string, { variant: BadgeVariant; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  published: { variant: 'success', label: 'Published' },
  archived: { variant: 'outline', label: 'Archived' },
  internal_testing: { variant: 'warning', label: 'Internal testing' },
  security_review: { variant: 'accent', label: 'Security review' },
  ready: { variant: 'success', label: 'Ready' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { variant: 'default' as BadgeVariant, label: status.replace(/_/g, ' ') };
  return <Badge variant={cfg.variant} className="capitalize">{cfg.label}</Badge>;
}

/** Linear lab review workflow: the single allowed next transition per status. */
export const LAB_WORKFLOW: Record<string, { to: string; label: string }> = {
  draft: { to: 'internal_testing', label: 'Submit for internal testing' },
  internal_testing: { to: 'security_review', label: 'Send to security review' },
  security_review: { to: 'ready', label: 'Mark ready' },
  ready: { to: 'published', label: 'Publish lab' },
  published: { to: 'archived', label: 'Archive' },
  archived: { to: 'draft', label: 'Restore to draft' },
};
