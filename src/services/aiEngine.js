// The "brain" of SURVORA-AI.
//
// askAI() first tries a real AWS endpoint (API Gateway -> Lambda -> Amazon Bedrock)
// if VITE_AWS_AI_ENDPOINT is set. Otherwise it uses the offline rules below so the
// demo always works, even without internet.

import { DISASTERS, getDisaster } from '../data/disasters.js';
import { levelInfo, regionScore, worstThreat } from '../data/levels.js';

const ENDPOINT = import.meta.env.VITE_AWS_AI_ENDPOINT;

const has = (q, words) => words.some((w) => q.includes(w));

function disasterAdvice(id) {
  const d = getDisaster(id);
  return (
    `🕯️ ${d.monster} (${d.name}) - what to do\n\n` +
    `BEFORE:\n• ${d.guide.before.join('\n• ')}\n\n` +
    `DURING:\n• ${d.guide.during.join('\n• ')}\n\n` +
    `AFTER:\n• ${d.guide.after.join('\n• ')}`
  );
}

export function localAnswer(question, ctx) {
  const q = question.toLowerCase();
  const { region, levels, nearestShelter } = ctx;
  const score = regionScore(levels);
  const info = levelInfo(score);
  const [worstId, worstVal] = worstThreat(levels);
  const worst = getDisaster(worstId);

  if (has(q, ['sos', 'emergency', 'help me', 'trapped', 'bleed', 'injur'])) {
    return (
      '🚨 If someone is in immediate danger, call your local emergency number now (112 in India).\n\n' +
      'Then open the SOS tab here to send your location and details to responders.\n\n' +
      'First aid basics:\n• Heavy bleeding: press firmly with clean cloth, do not remove it.\n' +
      '• Not breathing: start CPR if trained.\n• Stay calm, stay put if the area is unsafe.'
    );
  }
  if (has(q, ['status', 'risk', 'how bad', 'safe', 'danger', 'threat'])) {
    return (
      `👻 ${region.name} is "${info.label}" ${info.emoji} with a doom score of ${score}/100.\n\n` +
      `Biggest threat: ${worst.monster} (${worst.name}) at ${worstVal}%.\n` +
      Object.entries(levels)
        .map(([id, v]) => `• ${getDisaster(id).name}: ${v}%`)
        .join('\n')
    );
  }
  if (has(q, ['shelter', 'where', 'evacuat', 'go to', 'nearest'])) {
    return nearestShelter
      ? `🏚️ Nearest shelter to ${region.name}: ${nearestShelter.name} (${nearestShelter.type}), about ${nearestShelter.km} km away with ${nearestShelter.free} places free.\n\nOpen the Shelters tab to reserve a spot.`
      : 'Open the Shelters tab to see all safe havens near you.';
  }
  if (has(q, ['kit', 'bag', 'pack', 'prepare', 'supplies', 'checklist'])) {
    return '🎒 Pack the essentials: 3 days of water and food, medicines, torch, radio, power bank, documents and a whistle.\n\nTick them off in the Survival tab and watch your Ghost-Proof score climb.';
  }
  for (const d of DISASTERS) {
    const keys = {
      flood: ['flood', 'water', 'rain', 'dam'],
      quake: ['quake', 'earthquake', 'shake', 'tremor'],
      fire: ['fire', 'smoke', 'burn', 'wildfire'],
      storm: ['storm', 'cyclone', 'wind', 'hurricane', 'typhoon'],
    }[d.id];
    if (has(q, keys)) return disasterAdvice(d.id);
  }
  if (has(q, ['hello', 'hi', 'hey', 'who are you'])) {
    return "🎃 I'm Survora, your spectral safety guide. Ask me about the current risk, nearest shelter, what to pack, or what to do in a flood, earthquake, fire or cyclone.";
  }
  return `🔮 My crystal ball is cloudy on that one. Try asking:\n• "What is the risk here?"\n• "Where is the nearest shelter?"\n• "What do I do in a flood?"\n• "What should I pack?"`;
}

export async function askAI(question, ctx) {
  if (ENDPOINT) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: ctx }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.answer) return { text: data.answer, source: 'aws' };
      }
    } catch {
      /* fall through to the offline brain */
    }
  }
  await new Promise((r) => setTimeout(r, 700)); // little "thinking" pause
  return { text: localAnswer(question, ctx), source: 'local' };
}
