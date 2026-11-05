import React from 'react';
import { levelInfo } from '../data/levels.js';

// A round "Doom Meter" that fills up as the overall risk grows.
export default function RiskMeter({ score, regionName }) {
  const info = levelInfo(score);
  return (
    <div className="card meter-card">
      <h3 className="card-title">Doom Meter</h3>
      <div
        className="meter"
        style={{ '--p': score, '--c': info.color }}
        role="img"
        aria-label={`Risk score ${score} out of 100`}
      >
        <div className="meter-inner">
          <span className="meter-emoji">{info.emoji}</span>
          <span className="meter-score">{score}</span>
        </div>
      </div>
      <p className="meter-label" style={{ color: info.color }}>
        {info.label}
      </p>
      <p className="muted">{regionName}</p>
    </div>
  );
}
