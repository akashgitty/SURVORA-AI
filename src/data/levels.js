// Turns raw 0-100 numbers into spooky labels and colours used across the UI.

export function levelInfo(score) {
  if (score < 35) return { label: 'Quiet Crypt', color: '#4ade80', emoji: '😴' };
  if (score < 60) return { label: 'Restless Spirits', color: '#facc15', emoji: '👀' };
  if (score < 80) return { label: 'Haunted', color: '#fb923c', emoji: '😱' };
  return { label: 'Full Poltergeist', color: '#f43f5e', emoji: '💀' };
}

// Overall risk for a region = mostly the worst threat, a bit of the average.
export function regionScore(levels) {
  if (!levels) return 0;
  const vals = Object.values(levels);
  const max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(max * 0.6 + avg * 0.4);
}

export function worstThreat(levels) {
  return Object.entries(levels).sort((a, b) => b[1] - a[1])[0];
}
