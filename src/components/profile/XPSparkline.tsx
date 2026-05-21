interface XPSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export const XPSparkline = ({ data, width = 280, height = 60 }: XPSparklineProps) => {
  const pts = data.length > 0 ? data : [0, 0];
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts, 0);
  const range = max - min || 1;
  const step = pts.length > 1 ? width / (pts.length - 1) : width;

  const path = pts
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const last = pts[pts.length - 1];
  const lastX = (pts.length - 1) * step;
  const lastY = height - ((last - min) / range) * height;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={3.5} fill="hsl(var(--primary))" />
    </svg>
  );
};
