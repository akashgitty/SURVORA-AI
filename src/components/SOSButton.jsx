import React, { useRef, useState } from 'react';

const HOLD_MS = 1500;

// Floating panic button. Press and hold so it cannot be triggered by accident.
export default function SOSButton({ onTrigger }) {
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const start = useRef(0);

  function begin() {
    start.current = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start.current) / HOLD_MS) * 100);
      setProgress(p);
      if (p >= 100) {
        cancel();
        onTrigger();
      }
    }, 30);
  }

  function cancel() {
    clearInterval(timer.current);
    setProgress(0);
  }

  return (
    <button
      className="sos-fab"
      style={{ '--p': progress }}
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onKeyDown={(e) => e.key === 'Enter' && onTrigger()}
      aria-label="Hold to send an emergency SOS"
      title="Hold to send SOS"
    >
      <span>SOS</span>
      <small>hold</small>
    </button>
  );
}
