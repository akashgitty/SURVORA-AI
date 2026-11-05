import React, { useMemo, useState } from 'react';
import { REGIONS, SHELTERS, SHELTER_TYPES, getRegion } from '../data/regions.js';
import { rankShelters } from '../utils/shelters.js';
import SpookyMap from '../components/SpookyMap.jsx';

// Safe havens sorted by distance, with a capacity bar and a "reserve" button.
export default function Shelters({ levels, selected, onSelect, reservations, onReserve, onRelease, ranked }) {
  const [type, setType] = useState('All');
  const region = getRegion(selected);

  const list = useMemo(
    () => ranked.filter((s) => type === 'All' || s.type === type),
    [ranked, type]
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Safe Havens</h2>
          <p className="muted">Shelters nearest to {region.name}. Reserve a spot before you travel.</p>
        </div>
        <label className="select">
          <span className="muted small">Your region</span>
          <select value={selected} onChange={(e) => onSelect(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="chips">
        {SHELTER_TYPES.map((t) => (
          <button key={t} className={`chip ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid-bottom">
        <div className="shelter-list">
          {list.length === 0 && <p className="muted">No shelters of this type.</p>}
          {list.map((s, i) => {
            const pct = Math.round((s.occupied / s.capacity) * 100);
            const mine = reservations[s.id] || 0;
            const full = s.free === 0;
            return (
              <div key={s.id} className="card shelter">
                <div className="shelter-top">
                  <div>
                    <h4>
                      {i === 0 && type === 'All' ? '⭐ ' : ''}
                      {s.name}
                    </h4>
                    <p className="muted small">
                      {s.type} · {s.km} km away
                    </p>
                  </div>
                  <span className={`pill ${full ? 'red' : s.free < 40 ? 'amber' : 'green'}`}>
                    {full ? 'Full' : `${s.free} free`}
                  </span>
                </div>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${pct}%`, background: pct > 85 ? '#f43f5e' : pct > 60 ? '#fb923c' : '#4ade80' }}
                  />
                </div>
                <div className="shelter-actions">
                  <span className="muted small">
                    {s.occupied}/{s.capacity} occupied
                  </span>
                  {mine > 0 ? (
                    <button className="btn ghost" onClick={() => onRelease(s.id)}>
                      Cancel my spot
                    </button>
                  ) : (
                    <button className="btn" disabled={full} onClick={() => onReserve(s.id, s.name)}>
                      Reserve a spot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <SpookyMap
          regions={REGIONS}
          levels={levels}
          shelters={SHELTERS}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
