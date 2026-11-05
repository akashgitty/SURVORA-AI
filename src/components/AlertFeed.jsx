import React from 'react';
import { getDisaster } from '../data/disasters.js';
import { levelInfo } from '../data/levels.js';

// Live list of warnings, newest first.
export default function AlertFeed({ alerts }) {
  return (
    <div className="card feed-card">
      <h3 className="card-title">
        Whispers from the Void <span className="live-dot" /> <span className="muted small">live</span>
      </h3>
      {alerts.length === 0 && <p className="muted">All quiet... for now.</p>}
      <ul className="feed">
        {alerts.map((a) => {
          const d = getDisaster(a.disasterId);
          const info = levelInfo(a.level);
          return (
            <li key={a.id} className="feed-item" style={{ borderColor: info.color }}>
              <span className="feed-icon">{d.icon}</span>
              <div>
                <p>{a.message}</p>
                <p className="muted small">{new Date(a.time).toLocaleTimeString()}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
