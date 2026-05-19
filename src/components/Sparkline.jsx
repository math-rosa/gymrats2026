export function Sparkline({ data, color, width = 272, height = 56 }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const padTop = 14;
  const padBottom = 3;
  const padX = 14;
  const usableH = height - padTop - padBottom;
  const usableW = width - padX * 2;
  const stepX = data.length > 1 ? usableW / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padTop + usableH - (v / max) * usableH;
    return [x, y];
  });

  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const areaPath = `${path} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => {
        const value = data[i];
        const hasValue = value > 0;
        const anchor = i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="2.5" fill={color} opacity={hasValue ? 1 : 0.25} />
            {hasValue && (
              <text
                x={x}
                y={y - 6}
                textAnchor={anchor}
                fontSize="9"
                fontWeight="700"
                fill="#FFFFFF"
                style={{ fontFamily: 'ui-monospace, monospace' }}
              >
                {value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
