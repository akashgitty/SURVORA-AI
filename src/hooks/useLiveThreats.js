import { useCallback, useEffect, useRef, useState } from 'react';
import { REGIONS, getRegion } from '../data/regions.js';
import { DISASTERS, getDisaster } from '../data/disasters.js';

const ALERT_AT = 70; // threat level that raises an alert

const clamp = (n) => Math.max(0, Math.min(100, n));

const initialLevels = () =>
  Object.fromEntries(REGIONS.map((r) => [r.id, { ...r.base }]));

function makeAlert(regionId, disasterId, level) {
  const region = getRegion(regionId);
  const d = getDisaster(disasterId);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: new Date().toISOString(),
    regionId,
    disasterId,
    level,
    message: `${d.monster} stirs in ${region.name}. ${d.name} risk is ${level}%.`,
  };
}

// Simulates a live sensor feed. Swap the setInterval for a WebSocket or
// polling call to a real API (e.g. API Gateway + Lambda) when you go live.
export default function useLiveThreats() {
  const [levels, setLevels] = useState(initialLevels);
  const [alerts, setAlerts] = useState(() => [
    makeAlert('witch', 'flood', 70),
    makeAlert('bonehaven', 'storm', 72),
  ]);
  const levelsRef = useRef(levels);
  levelsRef.current = levels;

  const pushAlert = useCallback((alert) => {
    setAlerts((prev) => [alert, ...prev].slice(0, 12));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const prev = levelsRef.current;
      const next = {};
      const fresh = [];

      for (const r of REGIONS) {
        next[r.id] = {};
        for (const d of DISASTERS) {
          const old = prev[r.id][d.id];
          // drift gently back toward the baseline with a little noise
          const pull = (r.base[d.id] - old) * 0.1;
          const value = clamp(Math.round(old + pull + (Math.random() * 8 - 4)));
          next[r.id][d.id] = value;
          if (old < ALERT_AT && value >= ALERT_AT) fresh.push(makeAlert(r.id, d.id, value));
        }
      }

      setLevels(next);
      if (fresh.length) setAlerts((a) => [...fresh, ...a].slice(0, 12));
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Demo helper: force a disaster so judges can see alerts in action.
  const simulate = useCallback(
    (regionId, disasterId) => {
      const level = 92;
      setLevels((prev) => ({
        ...prev,
        [regionId]: { ...prev[regionId], [disasterId]: level },
      }));
      pushAlert(makeAlert(regionId, disasterId, level));
    },
    [pushAlert]
  );

  return { levels, alerts, simulate };
}
