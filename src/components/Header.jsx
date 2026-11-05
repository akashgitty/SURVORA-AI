import React from 'react';

export const TABS = [
  { id: 'dashboard', label: 'Haunt Radar', icon: '📡' },
  { id: 'assistant', label: 'Ask Survora', icon: '🔮' },
  { id: 'shelters', label: 'Shelters', icon: '🏚️' },
  { id: 'survival', label: 'Grimoire', icon: '📜' },
  { id: 'sos', label: 'SOS', icon: '🚨' },
];

export default function Header({ page, onNavigate }) {
  return (
    <header className="header">
      <div className="brand" onClick={() => onNavigate('dashboard')}>
        <span className="brand-pumpkin">🎃</span>
        <div>
          <h1 className="brand-name">SURVORA-AI</h1>
          <p className="brand-tag">Survive the Haunting</p>
        </div>
      </div>

      <nav className="nav" aria-label="Main">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn ${page === t.id ? 'active' : ''}`}
            onClick={() => onNavigate(t.id)}
          >
            <span>{t.icon}</span>
            <span className="nav-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}
