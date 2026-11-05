import React from 'react';

// Purely decorative: bats, ghosts and a moon drifting in the background.
const SPOOKS = [
  { e: '🦇', left: '8%', size: 28, dur: 18, delay: 0 },
  { e: '👻', left: '22%', size: 34, dur: 26, delay: 4 },
  { e: '🦇', left: '41%', size: 22, dur: 21, delay: 9 },
  { e: '🕷️', left: '58%', size: 24, dur: 30, delay: 2 },
  { e: '👻', left: '73%', size: 30, dur: 24, delay: 11 },
  { e: '🦇', left: '90%', size: 26, dur: 19, delay: 6 },
];

export default function FloatingSpooks() {
  return (
    <div className="spooks" aria-hidden="true">
      <div className="moon" />
      {SPOOKS.map((s, i) => (
        <span
          key={i}
          className="spook"
          style={{
            left: s.left,
            fontSize: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.e}
        </span>
      ))}
    </div>
  );
}
