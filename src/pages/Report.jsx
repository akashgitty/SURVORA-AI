import React, { useState } from 'react';
import { DISASTERS, getDisaster } from '../data/disasters.js';
import { getRegion } from '../data/regions.js';

const NEEDS = ['Rescue', 'Medical', 'Food & water', 'Shelter', 'Other'];

// SOS page: send a detailed report and see the history.
export default function Report({ region, reports, onSubmit }) {
  const [form, setForm] = useState({
    disasterId: DISASTERS[0].id,
    need: NEEDS[0],
    people: 1,
    details: '',
  });
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    await onSubmit({ ...form, people: Number(form.people) || 1 });
    setForm({ ...form, details: '' });
    setSending(false);
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Send an SOS</h2>
          <p className="muted">
            For life-threatening emergencies also call <strong>112</strong>. Your region ({region.name}) is
            attached automatically.
          </p>
        </div>
      </div>

      <div className="grid-two">
        <form className="card form" onSubmit={submit}>
          <h3 className="card-title">Report</h3>

          <label>
            <span>What is happening?</span>
            <select value={form.disasterId} onChange={set('disasterId')}>
              {DISASTERS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.icon} {d.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>What do you need?</span>
            <select value={form.need} onChange={set('need')}>
              {NEEDS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>

          <label>
            <span>People with you</span>
            <input type="number" min="1" max="500" value={form.people} onChange={set('people')} />
          </label>

          <label>
            <span>Details (landmarks, injuries, hazards)</span>
            <textarea rows="4" value={form.details} onChange={set('details')} placeholder="Describe your situation..." />
          </label>

          <button className="btn big" disabled={sending}>
            {sending ? 'Summoning rescuers...' : '🚨 Send SOS'}
          </button>
        </form>

        <div className="card">
          <h3 className="card-title">Your Reports</h3>
          {reports.length === 0 && <p className="muted">Nothing sent yet. Hope it stays that way.</p>}
          <ul className="reports">
            {reports.map((r) => (
              <li key={r.id} className="report">
                <div className="report-top">
                  <strong>
                    {getDisaster(r.disasterId).icon} {getDisaster(r.disasterId).name}
                  </strong>
                  <span className="pill green">{r.status}</span>
                </div>
                <p className="muted small">
                  {r.need} · {r.people} {r.people === 1 ? 'person' : 'people'} · {getRegion(r.regionId).name}
                </p>
                {r.details && <p>{r.details}</p>}
                <p className="muted small">
                  {new Date(r.time).toLocaleString()} · ref {r.id.slice(-6)}
                  {r.mode === 'offline-demo' && ' · demo mode'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
