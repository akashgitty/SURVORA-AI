import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Gauge from '../components/Gauge';
import Modal from '../components/Modal';
import WaveText from '../components/WaveText';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { RES_KEYS, RES_META, analyze } from '../services/analytics';
import './Landing.css';

const FEATURES = [
  ['⚡', 'Live alerts', 'Severity-ranked hazard alerts streamed to you in real time.', '/home'],
  ['🆘', 'One-tap SOS', 'Three seconds, and responders have your location and a resource plan.', '/home'],
  ['📊', 'Resource analytics', 'Ambulances, teams, boats and people needed at every incident, sized from severity, scale and terrain.', '/analytics'],
  ['🤖', 'AI assistant', 'Calm, step-by-step guidance for any emergency, any time.', 'chat'],
  ['🧭', 'Rescue tracking', 'Follow your request from received to rescued, live.', '/tracking'],
  ['🗺️', 'Safe zones', 'Shelters and hospitals with live capacity. Reserve a spot.', '/zones'],
  ['🛰️', 'Command centre', 'Dispatch recommended resources, broadcast alerts, balance the pool.', '/authority'],
  ['🌿', 'Calm space', 'Guided breathing and grounding for the moments between.', '/calm'],
];
const STEPS = [['📡', 'Detect', 'Your GPS pins the incident the moment you report it.'], ['🧮', 'Assess', 'Severity, people affected and terrain become a risk score.'], ['🚑', 'Allocate', 'Ambulances, crews, boats and more are sized and dispatched from the pool.'], ['🧭', 'Track', 'Follow the response live until everyone is safe.']];

export default function Landing() {
  const { user } = useAuth();
  const { openChat } = useUi();
  const nav = useNavigate();
  const [f, setF] = useState(null);
  const demo = useMemo(() => analyze({ type: 'FLOOD', severity: 'HIGH', city: 'Guwahati', peopleAffected: 40 }), []);
  const go = () => { const t = f[3]; setF(null); if (!user) return nav('/signup'); t === 'chat' ? openChat() : nav(t === '/authority' && user.role !== 'AUTHORITY' ? '/home' : t); };

  return (
    <div className="page">
      <section className="hero">
        <span className="eyebrow">🌿 Calm intelligence for crisis response</span>
        <h1>Know what it takes, <WaveText text="before it's needed." /></h1>
        <p>SURVORA-AI turns every emergency report into a live resource plan: how severe it is, how many ambulances, crews and people it needs, and where to send them.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn p f0" to={user ? '/report' : '/signup'}>{user ? 'Report an emergency' : 'Get started'}</Link>
          {user ? <Link className="btn f0" to="/analytics">Open analytics</Link> : <Link className="btn f0" to="/signin">Sign in</Link>}
        </div>
      </section>

      <div className="card showcase">
        <div className="center"><span className="eyebrow">Example: flood · Guwahati · 40 people</span><Gauge value={demo.risk} label={`${demo.level} priority`} /></div>
        <div>
          <h3>Sized in an instant</h3>
          <div className="mu" style={{ marginBottom: 10 }}>{demo.crewTotal} responders · respond within {demo.targetEta} min</div>
          {RES_KEYS.filter((k) => demo.required[k]).map((k) => <span key={k} className="tag">{RES_META[k][1]} {demo.required[k]} {RES_META[k][0]}</span>)}
        </div>
      </div>

      <div className="sec"><h3>Everything in one calm place</h3></div>
      <div className="grid g4">
        {FEATURES.map((x) => (
          <button key={x[1]} className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => setF(x)}>
            <span className="ico">{x[0]}</span><h3>{x[1]}</h3><div className="mu">{x[2]}</div>
          </button>
        ))}
      </div>

      <div className="sec"><h3>How it works</h3></div>
      <div className="steps">{STEPS.map((s) => <div key={s[1]} className="card step"><span className="ico">{s[0]}</span><h3>{s[1]}</h3><div className="mu">{s[2]}</div></div>)}</div>

      <div className="band"><h2>Calm responses save time.</h2><div>Create a free account and see your first resource plan in under a minute.</div><Link className="btn" to={user ? '/report' : '/signup'}>{user ? 'Report now' : 'Create account'}</Link></div>
      {f && <Modal title={f[1]} onClose={() => setF(null)}><p className="mu">{f[2]}</p><button className="btn p w" onClick={go}>{user ? 'Open' : 'Create free account'}</button></Modal>}
    </div>
  );
}
