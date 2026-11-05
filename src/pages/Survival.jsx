import React from 'react';
import KitChecklist from '../components/KitChecklist.jsx';
import GuideList from '../components/GuideList.jsx';

// "Grimoire": preparation checklist and step-by-step disaster guides.
export default function Survival() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2 className="page-title">Survival Grimoire</h2>
          <p className="muted">Prepare before the spirits rise. Everything is saved on your device.</p>
        </div>
      </div>
      <div className="grid-two">
        <KitChecklist />
        <GuideList />
      </div>
    </div>
  );
}
