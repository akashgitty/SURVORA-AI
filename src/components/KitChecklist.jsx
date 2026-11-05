import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { KIT_ITEMS } from '../data/kit.js';

// Emergency kit checklist. Ticks are saved in the browser.
export default function KitChecklist() {
  const [done, setDone] = useLocalStorage('survora-kit', {});

  const total = KIT_ITEMS.length;
  const count = KIT_ITEMS.filter((i) => done[i.id]).length;
  const pct = Math.round((count / total) * 100);
  const groups = [...new Set(KIT_ITEMS.map((i) => i.group))];

  return (
    <div className="card">
      <h3 className="card-title">Ghost-Proof Kit</h3>

      <div className="kit-progress">
        <div className="bar big">
          <div className="bar-fill" style={{ width: `${pct}%`, background: '#ff7a18' }} />
        </div>
        <strong>{pct}%</strong>
      </div>
      <p className="muted small">
        {count} of {total} packed.{' '}
        {pct === 100 ? 'The ghosts cannot touch you! 🎉' : 'Keep going, brave soul.'}
      </p>

      {groups.map((g) => (
        <fieldset key={g} className="kit-group">
          <legend>{g}</legend>
          {KIT_ITEMS.filter((i) => i.group === g).map((item) => (
            <label key={item.id} className={`kit-item ${done[item.id] ? 'checked' : ''}`}>
              <input
                type="checkbox"
                checked={!!done[item.id]}
                onChange={() => setDone({ ...done, [item.id]: !done[item.id] })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </fieldset>
      ))}

      <button className="link-btn" onClick={() => setDone({})}>
        Reset checklist
      </button>
    </div>
  );
}
