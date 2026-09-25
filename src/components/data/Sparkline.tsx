export function Sparkline({
  points,
  tone = 'accent',
}: {
  points: number[];
  tone?: 'accent' | 'positive' | 'negative';
}) {
  if (points.length < 2) return <div className="spark" />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const width = 320;
  const height = 88;
  const step = width / (points.length - 1);
  const coords = points.map((point, index) => {
    const x = index * step;
    const y = height - ((point - min) / span) * (height - 8) - 4;
    return [x, y] as const;
  });
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <polygon className={`spark-area spark-${tone}`} points={area} />
      <polyline className={`spark-line spark-${tone}`} points={line} fill="none" />
    </svg>
  );
}
