import { useEffect, useState } from 'react';

/** Semicircle risk gauge (0-100) that animates in. */
export default function Gauge({ value = 0, label = '', size = 190 }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(value), 60); return () => clearTimeout(t); }, [value]);
  const c = Math.PI * 70, color = value >= 80 ? 'var(--sev-critical)' : value >= 60 ? 'var(--sev-high)' : value >= 35 ? 'var(--sev-medium)' : 'var(--sev-low)';
  const arc = 'M20 95 A70 70 0 0 1 160 95';
  return (
    <svg viewBox="0 0 180 112" width={size} role="img" aria-label={`Risk score ${value} out of 100, ${label}`}>
      <path d={arc} fill="none" style={{ stroke: 'var(--bd)' }} strokeWidth="14" strokeLinecap="round" />
      <path d={arc} fill="none" style={{ stroke: color, transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)' }} strokeWidth="14" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      <text x="90" y="84" textAnchor="middle" fontSize="36" fontWeight="800" style={{ fill: 'var(--tx)' }}>{value}</text>
      <text x="90" y="105" textAnchor="middle" fontSize="11" style={{ fill: 'var(--mu)' }}>{label}</text>
    </svg>
  );
}
