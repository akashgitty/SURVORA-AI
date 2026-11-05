import React, { useCallback, useMemo, useState } from 'react';
import { REGIONS, SHELTERS, getRegion } from './data/regions.js';
import { DISASTERS } from './data/disasters.js';
import { rankShelters } from './utils/shelters.js';
import useLiveThreats from './hooks/useLiveThreats.js';
import useLocalStorage from './hooks/useLocalStorage.js';
import { sendSOS } from './services/aws.js';

import FloatingSpooks from './components/FloatingSpooks.jsx';
import Header from './components/Header.jsx';
import SOSButton from './components/SOSButton.jsx';
import Toast from './components/Toast.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Assistant from './pages/Assistant.jsx';
import Shelters from './pages/Shelters.jsx';
import Survival from './pages/Survival.jsx';
import Report from './pages/Report.jsx';

// App holds the shared state and decides which page to show.
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selected, setSelected] = useLocalStorage('survora-region', REGIONS[0].id);
  const [reports, setReports] = useLocalStorage('survora-reports', []);
  const [reservations, setReservations] = useLocalStorage('survora-reservations', {});
  const [toast, setToast] = useState('');

  const { levels, alerts, simulate } = useLiveThreats();
  const region = getRegion(selected) || REGIONS[0];

  const ranked = useMemo(
    () => rankShelters(region, SHELTERS, reservations),
    [region, reservations]
  );

  // Context handed to the AI so answers are about the user's own region.
  const aiContext = useMemo(
    () => ({ region, levels: levels[region.id], nearestShelter: ranked[0] }),
    [region, levels, ranked]
  );

  const closeToast = useCallback(() => setToast(''), []);

  function handleSimulate(regionId, disasterId) {
    simulate(regionId, disasterId);
    const d = DISASTERS.find((x) => x.id === disasterId);
    setToast(`${d.monster} has been summoned in ${getRegion(regionId).name}! 👻`);
  }

  async function submitReport(data) {
    const report = {
      ...data,
      id: `sos-${Date.now()}`,
      regionId: region.id,
      time: new Date().toISOString(),
      status: 'Sending',
    };
    const result = await sendSOS(report);
    setReports((prev) => [
      { ...report, status: result.ok ? 'Received' : 'Failed', mode: result.mode },
      ...prev,
    ]);
    setToast(
      result.ok
        ? '🚨 SOS received. Stay calm and stay safe.'
        : 'SOS failed to send. Please call 112 directly.'
    );
  }

  // The floating hold-to-send button sends a quick report with defaults.
  function quickSOS() {
    const worst = Object.entries(levels[region.id]).sort((a, b) => b[1] - a[1])[0][0];
    submitReport({ disasterId: worst, need: 'Rescue', people: 1, details: 'Quick SOS from the panic button.' });
  }

  function reserve(shelterId, name) {
    setReservations({ ...reservations, [shelterId]: 1 });
    setToast(`Spot reserved at ${name} 🏚️`);
  }

  function release(shelterId) {
    const next = { ...reservations };
    delete next[shelterId];
    setReservations(next);
  }

  return (
    <div className="app">
      <FloatingSpooks />
      <Header page={page} onNavigate={setPage} />

      <main>
        {page === 'dashboard' && (
          <Dashboard
            levels={levels}
            alerts={alerts}
            selected={selected}
            onSelect={setSelected}
            onSimulate={handleSimulate}
          />
        )}
        {page === 'assistant' && <Assistant context={aiContext} />}
        {page === 'shelters' && (
          <Shelters
            levels={levels}
            selected={selected}
            onSelect={setSelected}
            reservations={reservations}
            onReserve={reserve}
            onRelease={release}
            ranked={ranked}
          />
        )}
        {page === 'survival' && <Survival />}
        {page === 'sos' && <Report region={region} reports={reports} onSubmit={submitReport} />}
      </main>

      <footer className="footer">
        <p>
          🎃 SURVORA-AI · Demo data is simulated. In a real emergency call <strong>112</strong>.
        </p>
      </footer>

      <SOSButton onTrigger={quickSOS} />
      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}
