import React from 'react';
import { DISASTERS } from '../data/disasters.js';
import { REGIONS, SHELTERS, getRegion } from '../data/regions.js';
import { regionScore } from '../data/levels.js';
import RiskMeter from '../components/RiskMeter.jsx';
import ThreatCard from '../components/ThreatCard.jsx';
import SpookyMap from '../components/SpookyMap.jsx';
import AlertFeed from '../components/AlertFeed.jsx';

// "Haunt Radar": the home screen with live threats for the chosen region.
export default function Dashboard({ levels, alerts, selected, onSelect, onSimulate }) {
  const region = getRegion(selected);
  const regionLevels = levels[selected];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Haunt Radar</h2>
          <p className="muted">Live disaster risk across the land, powered by Survora's AI.</p>
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

      <div className="grid-top">
        <RiskMeter score={regionScore(regionLevels)} regionName={region.name} />
        <div className="threat-grid">
          {DISASTERS.map((d) => (
            <ThreatCard
              key={d.id}
              disaster={d}
              level={regionLevels[d.id]}
              onSimulate={() => onSimulate(selected, d.id)}
            />
          ))}
        </div>
      </div>

      <div className="grid-bottom">
        <SpookyMap
          regions={REGIONS}
          levels={levels}
          shelters={SHELTERS}
          selected={selected}
          onSelect={onSelect}
        />
        <AlertFeed alerts={alerts} />
      </div>
    </div>
  );
}
