export interface ChartDatum {
  date: string;
  count: number;
}

const W = 640;
const PAD_X = 10;
const PAD_T = 12;
const PAD_B = 24;

function shortDate(date: string): string {
  return date.slice(5).replace('-', '/');
}

function Frame({ ih }: { ih: number }) {
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const y = PAD_T + (i / 3) * ih;
        return <line key={i} x1={PAD_X} x2={W - PAD_X} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />;
      })}
    </>
  );
}

function Empty({ height }: { height: number }) {
  return (
    <div className="flex items-center justify-center rounded-lg bg-surface-2 text-sm text-text-tertiary" style={{ height }}>
      No data
    </div>
  );
}

function Labels({ data, H }: { data: ChartDatum[]; H: number }) {
  return (
    <>
      <text x={PAD_X} y={H - 6} fontSize="11" fill="var(--text-tertiary)">
        {shortDate(data[0].date)}
      </text>
      <text x={W - PAD_X} y={H - 6} fontSize="11" fill="var(--text-tertiary)" textAnchor="end">
        {shortDate(data[data.length - 1].date)}
      </text>
    </>
  );
}

export function LineChart({ data, height = 180 }: { data: ChartDatum[]; height?: number }) {
  if (data.length === 0) return <Empty height={height} />;
  const H = height;
  const ih = H - PAD_T - PAD_B;
  const max = Math.max(1, ...data.map((d) => d.count));
  const iw = W - PAD_X * 2;
  const x = (i: number) => PAD_X + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (c: number) => PAD_T + ih - (c / max) * ih;
  const pts = data.map((d, i) => ({ ...d, cx: x(i), cy: y(d.count) }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].cx.toFixed(1)} ${(PAD_T + ih).toFixed(1)} L${pts[0].cx.toFixed(1)} ${(PAD_T + ih).toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Trend chart">
      <Frame ih={ih} />
      <path d={area} fill="var(--accent)" opacity="0.08" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p) => (
        <g key={p.date}>
          <circle cx={p.cx} cy={p.cy} r="9" fill="transparent">
            <title>{`${p.date}: ${p.count}`}</title>
          </circle>
          <circle cx={p.cx} cy={p.cy} r="2.5" fill="var(--accent)">
            <title>{`${p.date}: ${p.count}`}</title>
          </circle>
        </g>
      ))}
      <Labels data={data} H={H} />
    </svg>
  );
}

export function BarChart({ data, height = 180 }: { data: ChartDatum[]; height?: number }) {
  if (data.length === 0) return <Empty height={height} />;
  const H = height;
  const ih = H - PAD_T - PAD_B;
  const max = Math.max(1, ...data.map((d) => d.count));
  const iw = W - PAD_X * 2;
  const slot = iw / data.length;
  const bw = Math.min(28, Math.max(4, slot * 0.62));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Bar chart">
      <Frame ih={ih} />
      {data.map((d, i) => {
        const bh = Math.max((d.count / max) * ih, d.count > 0 ? 2 : 1);
        const bx = PAD_X + i * slot + (slot - bw) / 2;
        const by = PAD_T + ih - bh;
        return (
          <rect key={d.date} x={bx} y={by} width={bw} height={bh} rx="3" fill="var(--accent)" opacity="0.85">
            <title>{`${d.date}: ${d.count}`}</title>
          </rect>
        );
      })}
      <Labels data={data} H={H} />
    </svg>
  );
}
