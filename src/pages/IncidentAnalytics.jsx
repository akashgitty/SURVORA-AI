import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CountUp from '../components/CountUp';
import Gauge from '../components/Gauge';
import Modal from '../components/Modal';
import SeverityBadge from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { RES_KEYS, RES_META } from '../services/analytics';
import { AnalyticsApi } from '../services/endpoints';
import { ago, pretty } from '../utils/format';

const CREW_COLORS = ['#6f9150', '#5e8c88', '#c7794f', '#b8963f', '#8a7fb0', '#b85450'];

export default function IncidentAnalytics() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast, openChat } = useUi();
  const { data, error, loading, reload } = useFetch(() => AnalyticsApi.incident(+id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const t = setInterval(() => reload(true), 6000); return () => clearInterval(t); }, [reload]);

  if (loading && !data) return <div className="skeleton" style={{ height: 320 }} />;
  if (error || !data) return <div className="card center narrow"><h2>Incident not found</h2><Link className="btn p" to="/analytics">Back to analytics</Link></div>;

  const { incident: i, analysis: a, availability: av, allocation } = data;
  const canDispatch = user.role === 'AUTHORITY' && !allocation && i.status !== 'RESOLVED';
  const shortCount = allocation ? 0 : RES_KEYS.filter((k) => av[k].short > 0).length;
  const crew = Object.entries(a.crew).filter(([, v]) => v > 0);

  async function dispatch() {
    setBusy(true);
    try { const r = await AnalyticsApi.dispatch(i.id); toast(Object.keys(r.allocation.shortfall).length ? 'Dispatched with some shortfalls' : 'All recommended resources dispatched ✅'); setConfirm(false); reload(true); }
    catch (e) { toast(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="page">
      <div className="ahead">
        <div>
          <Link className="crumb" to="/analytics">← All analytics</Link>
          <h2>{i.code} · {pretty(i.type)} <SeverityBadge level={i.severity} /></h2>
          <div className="mu">{i.city} · reported {ago(i.createdAt)} · {pretty(i.status)} · <span className="live">Live</span></div>
        </div>
        <div className="row" style={{ flex: 'none' }}>
          {i.mine && <Link className="btn f0" to="/tracking">🧭 Track rescue</Link>}
          <button className="btn f0" onClick={() => openChat(`${pretty(i.type)} safety`)}>🤖 Ask Survora</button>
          {canDispatch && <button className="btn p f0" onClick={() => setConfirm(true)}>🚀 Dispatch recommended</button>}
        </div>
      </div>

      <div className="hero-a">
        <div className="card center">
          <h3>Risk score</h3>
          <Gauge value={a.risk} label={`${a.level} priority`} />
          <div className="mu">Target response within <b>{a.targetEta} min</b></div>
        </div>
        <div className="card">
          <h3>Situation</h3>
          <div className="facts">
            <div className="fact"><span className="mu">People affected</span><b><CountUp to={i.peopleAffected} /></b></div>
            <div className="fact"><span className="mu">Est. needing medical care</span><b>{a.injured}</b></div>
            <div className="fact"><span className="mu">Main hazard</span><b>{a.hazard}</b></div>
            <div className="fact"><span className="mu">Responders required</span><b>{a.crewTotal}</b></div>
            <div className="fact"><span className="mu">Shelter places needed</span><b>{a.shelterNeeded}</b></div>
          </div>
        </div>
        <div className="card">
          <h3>Location</h3>
          <div className="facts">
            <div className="fact"><span className="mu">Coordinates</span><b>{a.coords[0].toFixed(4)}, {a.coords[1].toFixed(4)}</b></div>
            <div className="fact"><span className="mu">Fixed by</span><b>{a.coordsSource === 'GPS' ? '📡 GPS' : '🏙️ City centre'}</b></div>
            <div className="fact"><span className="mu">Terrain</span><b>{a.terrain} (×{a.factor})</b></div>
            <div className="fact"><span className="mu">Nearest hospital</span><b>{a.nearestHospital ? `${a.nearestHospital.name} · ${a.nearestHospital.km} km · ~${a.travelEta} min` : '—'}</b></div>
            <div className="fact"><span className="mu">Nearest shelter</span><b>{a.nearestShelter ? `${a.nearestShelter.name} · ${a.nearestShelter.km} km` : 'None with space'}</b></div>
          </div>
          <a className="btn sm w" style={{ marginTop: 10 }} target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${a.coords[0]},${a.coords[1]}`}>Open in maps</a>
        </div>
      </div>

      <div className="sec"><h3>Resources required at this location</h3>{allocation ? <span className="pill ok">Dispatched by {allocation.by}</span> : shortCount ? <span className="pill short">{shortCount} resource type{shortCount > 1 ? 's' : ''} short</span> : <span className="pill ok">Pool can cover this</span>}</div>
      <div className="res-grid">
        {RES_KEYS.map((k) => {
          const r = av[k], [label, ic] = RES_META[k], given = allocation?.allocated?.[k], need = allocation ? allocation.requested[k] : r.required;
          return (
            <div key={k} className={`res ${need ? '' : 'zero'}`}>
              <div className="ic">{ic}</div><div className="n"><CountUp to={need} /></div><div className="mu">{label}</div>
              <div className="bar" style={{ margin: '10px 0 8px' }}><i style={{ width: `${allocation ? (need ? (given / need) * 100 : 100) : need ? Math.min(100, (r.available / need) * 100) : 100}%` }} /></div>
              {allocation ? <span className={`pill ${given >= need ? 'ok' : 'short'}`}>Dispatched {given}/{need}</span>
                : !need ? <span className="pill ok">Not needed</span>
                : r.short ? <span className="pill short">Short by {r.short} · {r.available} free</span>
                : <span className="pill ok">{r.available} available</span>}
            </div>
          );
        })}
      </div>

      <div className="two" style={{ marginTop: 18 }}>
        <div className="card">
          <h3>People required on site: {a.crewTotal}</h3>
          <div className="stack">{crew.map(([n, v], k) => <i key={n} style={{ width: `${(v / a.crewTotal) * 100}%`, background: CREW_COLORS[k % 6] }} />)}</div>
          <div className="legend">{crew.map(([n, v], k) => <span key={n} style={{ '--c': CREW_COLORS[k % 6] }}>{n}: <b>{v}</b></span>)}</div>
        </div>
        <div className="card">
          <h3>Recommended actions</h3>
          {a.recommendations.map((r) => <div className="rec" key={r}>{r}</div>)}
        </div>
      </div>

      {confirm && (
        <Modal title="Dispatch recommended resources" onClose={() => setConfirm(false)}>
          <p className="mu">Resources are taken from the shared pool. If something is short, the available amount is sent and the rest is flagged.</p>
          {RES_KEYS.filter((k) => av[k].required).map((k) => (
            <div className="fact" key={k}><span>{RES_META[k][1]} {RES_META[k][0]}</span><b>{Math.min(av[k].required, av[k].available)} / {av[k].required}{av[k].short ? ' ⚠' : ''}</b></div>
          ))}
          <div className="row" style={{ marginTop: 16 }}><button className="btn p" disabled={busy} onClick={dispatch}>{busy ? 'Dispatching…' : 'Confirm dispatch'}</button><button className="btn" onClick={() => setConfirm(false)}>Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}
