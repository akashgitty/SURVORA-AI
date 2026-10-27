import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Gauge from '../components/Gauge';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { RES_KEYS, RES_META, analyze, availabilityOf } from '../services/analytics';
import { AnalyticsApi, IncidentApi } from '../services/endpoints';
import { SEVERITIES, TYPES, pretty } from '../utils/format';
import { CITIES, getPosition, nearestCity } from '../utils/geo';

const TEMPLATES = ['Water rising fast', 'Building damaged', 'Person injured', 'Road blocked'];

export default function ReportEmergency() {
  const { user } = useAuth();
  const { toast } = useUi();
  const nav = useNavigate();
  const ctx = useFetch(AnalyticsApi.context);
  const [f, setF] = useState({ type: 'FLOOD', severity: 'HIGH', peopleAffected: 5, city: user.city, description: '', latitude: null, longitude: null });
  const [loc, setLoc] = useState({ state: 'locating' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const up = (p) => setF((x) => ({ ...x, ...p }));

  const locate = useCallback(async () => {
    setLoc({ state: 'locating' });
    try {
      const p = await getPosition(8000), city = nearestCity(p.latitude, p.longitude);
      setF((x) => ({ ...x, latitude: p.latitude, longitude: p.longitude, city }));
      setLoc({ state: 'ok', accuracy: Math.round(p.accuracy || 0) });
    } catch (e) { setLoc({ state: 'denied', msg: e.message }); }
  }, []);
  useEffect(() => { locate(); }, [locate]); // ask for the location as soon as the page opens

  const analysis = useMemo(() => analyze(f, ctx.data?.zones || []), [f, ctx.data]);
  const avail = useMemo(() => (ctx.data ? availabilityOf(ctx.data.pool, analysis.required) : null), [analysis, ctx.data]);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { const inc = await IncidentApi.create(f); toast('Report submitted. Here is your resource plan 📊'); nav(`/analytics/${inc.id}`); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <div className="ahead"><div><h2>Report an emergency</h2><div className="mu">We pin your location and size the response while you type.</div></div></div>
      <div className="two">
        <form className="card" onSubmit={submit}>
          <div className="locbar" role="status">
            {loc.state === 'locating' && <span className="live">Detecting your location…</span>}
            {loc.state === 'ok' && <span>📍 <b>{f.city}</b> · {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)} · ±{loc.accuracy} m</span>}
            {loc.state === 'denied' && <span>📍 {loc.msg}. Using <b>{f.city}</b> city centre.</span>}
            {loc.state === 'manual' && <span>📍 Using <b>{f.city}</b> city centre</span>}
            <button type="button" className="btn sm f0" onClick={locate}>{loc.state === 'ok' ? 'Re-detect' : 'Use my location'}</button>
          </div>
          <label>Type</label><div className="tabs">{TYPES.map((t) => <button type="button" key={t} className={`chip ${f.type === t ? 'on' : ''}`} onClick={() => up({ type: t })}>{pretty(t)}</button>)}</div>
          <label>Severity</label><div className="tabs">{SEVERITIES.map((s) => <button type="button" key={s} className={`chip ${f.severity === s ? 'on' : ''}`} onClick={() => up({ severity: s })}>{pretty(s)}</button>)}</div>
          <label>People affected</label>
          <div className="row"><button type="button" className="btn f0" onClick={() => up({ peopleAffected: Math.max(1, f.peopleAffected - 5) })}>−5</button><button type="button" className="btn f0" onClick={() => up({ peopleAffected: Math.max(1, f.peopleAffected - 1) })}>−</button><input type="number" min="1" max="100000" value={f.peopleAffected} onChange={(e) => up({ peopleAffected: Math.max(1, +e.target.value || 1) })} aria-label="People affected" style={{ textAlign: 'center', fontWeight: 700 }} /><button type="button" className="btn f0" onClick={() => up({ peopleAffected: f.peopleAffected + 1 })}>+</button><button type="button" className="btn f0" onClick={() => up({ peopleAffected: f.peopleAffected + 5 })}>+5</button></div>
          <label htmlFor="c">City</label>
          <select id="c" value={f.city} onChange={(e) => { up({ city: e.target.value, latitude: null, longitude: null }); setLoc({ state: 'manual' }); }}>{Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}</select>
          <label htmlFor="d">What is happening?</label>
          <div className="tabs">{TEMPLATES.map((t) => <button type="button" key={t} className="chip" onClick={() => up({ description: t })}>{t}</button>)}</div>
          <textarea id="d" rows={3} required maxLength={1000} value={f.description} onChange={(e) => up({ description: e.target.value })} placeholder="Describe the situation…" />
          {err && <div className="err" role="alert">{err}</div>}
          <button className="btn p w" style={{ marginTop: 18 }} disabled={busy}>{busy ? 'Submitting…' : 'Submit report & get resource plan'}</button>
        </form>

        <div className="card sticky">
          <div className="row"><h3 style={{ margin: 0, flex: 3 }}>Live impact estimate</h3><span className="live f0">Updates as you type</span></div>
          <div className="center"><Gauge value={analysis.risk} label={`${analysis.level} priority`} /></div>
          <div className="facts">
            <div className="fact"><span className="mu">Est. needing medical care</span><b>{analysis.injured}</b></div>
            <div className="fact"><span className="mu">Responders required</span><b>{analysis.crewTotal}</b></div>
            <div className="fact"><span className="mu">Target response</span><b>{analysis.targetEta} min</b></div>
            <div className="fact"><span className="mu">Nearest hospital</span><b>{analysis.nearestHospital ? `${analysis.nearestHospital.name} · ${analysis.nearestHospital.km} km` : '—'}</b></div>
          </div>
          <div style={{ marginTop: 12 }}>
            {RES_KEYS.filter((k) => analysis.required[k]).map((k) => { const short = avail?.[k].short > 0; return <span key={k} className={`tag ${short ? 'short' : ''}`}>{RES_META[k][1]} {analysis.required[k]} {RES_META[k][0]}{short ? ' ⚠' : ''}</span>; })}
          </div>
          {avail && RES_KEYS.some((k) => avail[k].short > 0) && <div className="mu" style={{ marginTop: 6 }}>⚠ Some resources are currently short. Control room will be alerted.</div>}
        </div>
      </div>
    </div>
  );
}
