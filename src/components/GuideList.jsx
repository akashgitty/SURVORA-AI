import React, { useState } from 'react';
import { DISASTERS } from '../data/disasters.js';

const PHASES = [
  { id: 'before', label: 'Before', icon: '🕯️' },
  { id: 'during', label: 'During', icon: '⚡' },
  { id: 'after', label: 'After', icon: '🌅' },
];

// Expandable safety guides: pick a monster, then a phase.
export default function GuideList() {
  const [open, setOpen] = useState(DISASTERS[0].id);
  const [phase, setPhase] = useState('during');

  return (
    <div className="card">
      <h3 className="card-title">Monster Manual</h3>

      {DISASTERS.map((d) => (
        <div key={d.id} className="acc">
          <button
            className={`acc-head ${open === d.id ? 'open' : ''}`}
            onClick={() => setOpen(open === d.id ? null : d.id)}
            aria-expanded={open === d.id}
          >
            <span>
              {d.icon} {d.monster}
            </span>
            <span className="muted">{d.name}</span>
          </button>

          {open === d.id && (
            <div className="acc-body">
              <div className="tabs">
                {PHASES.map((p) => (
                  <button
                    key={p.id}
                    className={`tab ${phase === p.id ? 'active' : ''}`}
                    onClick={() => setPhase(p.id)}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
              <ul className="steps">
                {d.guide[phase].map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
