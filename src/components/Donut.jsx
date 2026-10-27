export default function Donut({ data, size = 150 }) {
  const sum = data.reduce((s, d) => s + d.value, 0), total = sum || 1, r = 52, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 140 140" width={size} role="img" aria-label={`${sum} active incidents by severity`}>
      <circle cx="70" cy="70" r={r} fill="none" style={{ stroke: 'var(--bd)' }} strokeWidth="18" />
      {data.map((d) => { const len = (d.value / total) * c, el = <circle key={d.label} cx="70" cy="70" r={r} fill="none" style={{ stroke: d.color }} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform="rotate(-90 70 70)" />; acc += len; return el; })}
      <text x="70" y="77" textAnchor="middle" fontSize="26" fontWeight="800" style={{ fill: 'var(--tx)' }}>{sum}</text>
    </svg>
  );
}
