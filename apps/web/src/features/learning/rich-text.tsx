import { useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Token {
  kind: 'text' | 'bold' | 'italic' | 'code' | 'link';
  value: string;
  href?: string;
}

const INLINE_PATTERN = '\\*\\*([^*\\n]+)\\*\\*|\\*([^*\\n]+)\\*|`([^`\\n]+)`|\\[([^\\]\\n]+)\\]\\(([^)\\s]+)\\)';

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  const re = new RegExp(INLINE_PATTERN, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push({ kind: 'text', value: line.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ kind: 'bold', value: m[1] });
    else if (m[2] !== undefined) tokens.push({ kind: 'italic', value: m[2] });
    else if (m[3] !== undefined) tokens.push({ kind: 'code', value: m[3] });
    else if (m[4] !== undefined && m[5] !== undefined) tokens.push({ kind: 'link', value: m[4], href: m[5] });
    last = m.index + m[0].length;
  }
  if (last < line.length) tokens.push({ kind: 'text', value: line.slice(last) });
  return tokens;
}

function renderTokens(tokens: Token[], keyPrefix: string): ReactNode[] {
  return tokens.map((t, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (t.kind) {
      case 'bold':
        return (
          <strong key={key} className="font-semibold text-text">
            {t.value}
          </strong>
        );
      case 'italic':
        return <em key={key}>{t.value}</em>;
      case 'code':
        return <code key={key}>{t.value}</code>;
      case 'link': {
        const external = /^https?:\/\//i.test(t.href ?? '');
        return (
          <a
            key={key}
            href={t.href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {t.value}
          </a>
        );
      }
      default:
        return t.value;
    }
  });
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const nodes = useMemo(() => {
    const lines = text.split('\n');
    const out: ReactNode[] = [];
    lines.forEach((line, li) => {
      out.push(...renderTokens(tokenizeLine(line), `ln${li}`));
      if (li < lines.length - 1) out.push(<br key={`br-${li}`} />);
    });
    return out;
  }, [text]);

  return <span className={cn('rich-text', className)}>{nodes}</span>;
}
