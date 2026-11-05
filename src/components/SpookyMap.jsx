import React from 'react';
import { levelInfo, regionScore } from '../data/levels.js';

// An SVG map of the (fictional) land. Click a region to select it.
export default function SpookyMap({ regions, levels, shelters, selected, onSelect, showShelters = true }) {
  return (
    <div className="card map-card">
      <h3 className="card-title">Haunted Map</h3>
      <svg viewBox="0 0 100 70" className="map" role="group" aria-label="Region map">
        <defs>
          <radialGradient id="fog" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#2a1650" />
            <stop offset="100%" stopColor="#0b0613" />
          </radialGradient>
        </defs>
        <rect width="100" height="70" fill="url(#fog)" rx="2" />

        {/* faint grid like an old treasure map */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="70" className="map-grid" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} className="map-grid" />
        ))}

        {showShelters &&
          shelters.map((s) => (
            <g key={s.id} transform={`translate(${s.x} ${s.y})`}>
              <text fontSize="3.6" textAnchor="middle" dominantBaseline="middle">
                🏚️
              </text>
              <title>{s.name}</title>
            </g>
          ))}

        {regions.map((r) => {
          const score = regionScore(levels[r.id]);
          const info = levelInfo(score);
          const isSel = selected === r.id;
          return (
            <g
              key={r.id}
              transform={`translate(${r.x} ${r.y})`}
              className="map-region"
              onClick={() => onSelect(r.id)}
              tabIndex={0}
              role="button"
              aria-label={`${r.name}, risk ${score}`}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(r.id)}
            >
              {score >= 70 && <circle r="6" fill={info.color} className="map-pulse" />}
              <circle
                r={3 + score / 25}
                fill={info.color}
                fillOpacity="0.85"
                stroke={isSel ? '#fff' : 'transparent'}
                strokeWidth="0.6"
              />
              <text y="-0.2" fontSize="3" textAnchor="middle" dominantBaseline="middle">
                {info.emoji}
              </text>
              <text y="8.5" fontSize="2.4" textAnchor="middle" className="map-label">
                {r.name}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="muted small">Demo data. Tap a region to focus on it.</p>
    </div>
  );
}
