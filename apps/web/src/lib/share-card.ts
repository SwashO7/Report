export interface ProgressCardData {
  name: string;
  username: string;
  level: string;
  xp: number;
  labs: number;
  lessons: number;
  achievements: number;
  streak: number;
  rank: number | null;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

export async function createProgressCard(data: ProgressCardData): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported in this browser.');

  ctx.fillStyle = '#0d1210';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 54) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y <= canvas.height; y += 54) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  ctx.fillStyle = '#4fb896';
  ctx.fillRect(0, 0, 18, canvas.height);
  ctx.fillStyle = '#e9efe9';
  ctx.font = '700 34px system-ui, sans-serif';
  ctx.fillText('SURAKSHA LABS', 78, 104);
  ctx.fillStyle = '#7a8880';
  ctx.font = '600 18px ui-monospace, monospace';
  ctx.fillText('PROOF OF PRACTICE', 78, 142);

  ctx.fillStyle = '#4fb896';
  ctx.font = '650 22px ui-monospace, monospace';
  ctx.fillText(data.level.toUpperCase(), 78, 278);
  ctx.fillStyle = '#e9efe9';
  ctx.font = '750 76px system-ui, sans-serif';
  ctx.fillText(data.name.slice(0, 24), 78, 372);
  ctx.fillStyle = '#a3b0a8';
  ctx.font = '500 30px system-ui, sans-serif';
  ctx.fillText(`@${data.username}`, 80, 420);

  roundRect(ctx, 78, 500, 924, 206, 28);
  ctx.fillStyle = '#141a17';
  ctx.fill();
  ctx.strokeStyle = '#263029';
  ctx.stroke();
  ctx.fillStyle = '#7a8880';
  ctx.font = '600 20px ui-monospace, monospace';
  ctx.fillText('TOTAL EXPERIENCE', 118, 558);
  ctx.fillStyle = '#e9efe9';
  ctx.font = '760 92px ui-monospace, monospace';
  ctx.fillText(new Intl.NumberFormat('en-US').format(data.xp), 112, 662);
  ctx.fillStyle = '#4fb896';
  ctx.font = '700 30px ui-monospace, monospace';
  ctx.fillText('XP', 830, 648);

  const stats = [
    ['LABS', data.labs],
    ['LESSONS', data.lessons],
    ['BADGES', data.achievements],
    ['STREAK', `${data.streak}D`],
  ] as const;
  stats.forEach(([label, value], index) => {
    const x = 78 + index * 237;
    roundRect(ctx, x, 748, 213, 170, 22);
    ctx.fillStyle = '#141a17';
    ctx.fill();
    ctx.strokeStyle = '#263029';
    ctx.stroke();
    ctx.fillStyle = '#e9efe9';
    ctx.font = '720 44px ui-monospace, monospace';
    ctx.fillText(String(value), x + 24, 826);
    ctx.fillStyle = '#7a8880';
    ctx.font = '600 17px ui-monospace, monospace';
    ctx.fillText(label, x + 24, 874);
  });

  ctx.fillStyle = '#e9efe9';
  ctx.font = '720 46px system-ui, sans-serif';
  ctx.fillText(data.rank ? `GLOBAL RANK #${data.rank}` : 'BUILDING MY FIRST RANK', 78, 1040);
  ctx.fillStyle = '#a3b0a8';
  ctx.font = '500 27px system-ui, sans-serif';
  ctx.fillText('Skills are earned in lessons, practice, and real labs.', 78, 1094);

  ctx.fillStyle = '#4fb896';
  ctx.fillRect(78, 1200, 74, 6);
  ctx.fillStyle = '#7a8880';
  ctx.font = '600 19px ui-monospace, monospace';
  ctx.fillText('surakshalabs.com  /  SHADOW SECURITY', 78, 1258);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Could not create the share image.')), 'image/jpeg', 0.94);
  });
  return new File([blob], `suraksha-${data.username}-progress.jpg`, { type: 'image/jpeg' });
}

export async function shareProgressCard(file: File, title: string, text: string): Promise<'shared' | 'downloaded'> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  const payload: ShareData = { title, text, files: [file] };
  if (nav.share && (!nav.canShare || nav.canShare(payload))) {
    await nav.share(payload);
    return 'shared';
  }
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  return 'downloaded';
}
