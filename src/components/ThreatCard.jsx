import React from 'react';
import { levelInfo } from '../data/levels.js';

// One monster = one disaster type, with its live threat level.
export default function ThreatCard({ disaster, level, onSimulate }) {
  const info = levelInfo(level);
  return (
    <div className="card threat" style={{ '--accent': disaster.color }}>
      <div className="threat-top">
        <span className="threat-icon">{disaster.icon}</span>
        <div>
          <h4 className="threat-monster">{disaster.monster}</h4>
          <p className="muted">{disaster.name}</p>
        </div>
        <span className="threat-level" style={{ color: info.color }}>
          {level}%
        </span>
      </div>

      <div className="bar">
        <div className="bar-fill" style={{ width: `${level}%`, background: info.color }} />
      </div>

      <div className="threat-bottom">
        <span style={{ color: info.color }}>{info.label}</span>
        {onSimulate && (
          <button className="link-btn" onClick={onSimulate} title="Demo: force this disaster">
            Summon
          </button>
        )}
      </div>
    </div>
  );
}
