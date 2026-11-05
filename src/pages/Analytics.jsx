import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from '../components/CountUp';
import Donut from '../components/Donut';
import SeverityBadge from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useAlertStream } from '../hooks/useAlertStream';
import { RES_KEYS, RES_META } from '../services/analytics';
import { AnalyticsApi } from '../services/endpoints';
import { SEV_COLOR, pretty } from '../utils/format';

export default function Analytics() {
  const { user } = useAuth();
  const { data, loading, reload } = useFetch(AnalyticsApi.overview);
  const [scope, setScope] = useState('all');
  useAlertStream(() => reload(true));
  useEffect(() => { const t = setInterval(() => reload(true), 6000); return () => clearInterval(t); }, [reload]);

  if (loading && !data) return <div className="skeleton" style={{ height: 320 }} />;
  const t = data.totals, hot = data.hotspots.filter((h) => scope === 'all' || h.city === user.city);
  const maxType = Math.max(1, ...data.byType.map((x) => x.value));

  return (
    <div className="page">
      <div className="ahead">
        <div><h2>📊 Resource analytics</h2><div className="mu">What every active incident needs, versus what is free right now · <span className="live">Live</span></div></div>
        <div className="tabs"><button className={`chip ${scope === 'all' ? 'on' : ''}`} onClick={() => setScope('all')}>All regions</button><button className={`chip ${scope === 'city' ? 'on' : ''}`} onClick={() => setScope('city')}>{user.city} only</button></div>
      </div>

      <div className="kpis">
        <div className="card kpi"><div className="v"><CountUp to={t.active} /></div><div className="mu">Active incidents</div></div>
        <div className="card kpi crit"><div className="v"><CountUp to={t.critical} /></div><div className="mu">Critical</div></div>
        <div className="card kpi warn"><div className="v"><CountUp to={t.people} /></div><div className="mu">People affected</div></div>
        <div className="card kpi"><div className="v"><CountUp to={t.crew} /></div><div className="mu">Responders needed</div></div>
        <div className="card kpi warn"><div className="v"><CountUp to={t.pending} /></div><div className="mu">Awaiting dispatch</div></div>
      </div>

      <div className="two">
        <div className="card">
          <h3>Demand vs free capacity</h3><div className="mu">Needs of incidents not yet dispatched</div>
          {RES_KEYS.map((k) => { const r = data.availability[k], over = r.required > r.available; return (
            <div className="barrow" key={k}>
              <span>{RES_META[k][1]} {RES_META[k][0]}</span>
              <div className={`bar ${over ? 'warn' : ''}`}><i style={{ width: `${r.available ? Math.min(100, (r.required / r.available) * 100) : r.required ? 100 : 0}%` }} /></div>
              <span className={over ? 'pill short' : 'mu'}>{r.required} / {r.available}{over ? ` · short ${r.short}` : ''}</span>
            </div>); })}
        </div>
        <div className="card">
          <h3>Incident mix</h3>
          <div className="donutwrap">
            <Donut data={data.bySeverity.map((s) => ({ label: s.key, value: s.value, color: SEV_COLOR[s.key] }))} />
            <div className="legend" style={{ flexDirection: 'column', margin: 0 }}>{data.bySeverity.map((s) => <span key={s.key} style={{ '--c': SEV_COLOR[s.key] }}>{pretty(s.key)}: <b>{s.value}</b></span>)}</div>
          </div>
          <h3 style={{ marginTop: 18 }}>By type</h3>
          {data.byType.map((x) => <div className="barrow" style={{ gridTemplateColumns: '100px 1fr 24px' }} key={x.key}><span>{pretty(x.key)}</span><div className="bar"><i style={{ width: `${(x.value / maxType) * 100}%` }} /></div><b>{x.value}</b></div>)}
        </div>
      </div>

      <div className="sec"><h3>Hotspots, ranked by risk</h3><span className="mu">Tap one for its full resource plan</span></div>
      {hot.length === 0 && <div className="card center"><span className="ico">🌿</span><h3>All calm</h3><div className="mu">No active incidents in this view.</div></div>}
      {hot.map((h) => (
        <Link key={h.id} className="hot" to={`/analytics/${h.id}`}>
          <div className="rk" style={{ background: SEV_COLOR[h.severity] }}>{h.risk}</div>
          <div><b>{pretty(h.type)} · {h.city}</b> <SeverityBadge level={h.severity} /><div className="mu">{h.people} people · {RES_KEYS.filter((k) => h.required[k]).slice(0, 4).map((k) => `${RES_META[k][1]} ${h.required[k]}`).join(' · ')}</div></div>
          <span className={`pill ${h.dispatched ? 'ok' : 'short'}`}>{h.dispatched ? 'Dispatched' : 'Awaiting dispatch'}</span>
        </Link>
      ))}

      {data.byCity.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3>By city</h3>
          <div className="scroll-x"><table><thead><tr><th>City</th><th>Incidents</th><th>People</th><th>Responders</th><th>Peak risk</th></tr></thead>
            <tbody>{data.byCity.map((c) => <tr key={c.city}><td><b>{c.city}</b></td><td>{c.incidents}</td><td>{c.people}</td><td>{c.crew}</td><td><span className="pill" style={{ background: c.risk >= 80 ? 'var(--sev-critical)' : c.risk >= 60 ? 'var(--sev-high)' : 'var(--sev-medium)', color: '#fff' }}>{c.risk}</span></td></tr>)}</tbody></table></div>
        </div>
      )}
    </div>
  );
}
