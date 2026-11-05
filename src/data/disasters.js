// The four "monsters" (disaster types) SURVORA-AI watches for.
// Each one has a spooky name, an icon, and real safety steps (before / during / after).

export const DISASTERS = [
  {
    id: 'flood',
    monster: 'The Drowned Wraith',
    name: 'Flood',
    icon: '🌊',
    color: '#38bdf8',
    guide: {
      before: [
        'Know your nearest high ground and two ways to reach it.',
        'Move documents, medicines and electronics to upper floors.',
        'Fill clean water containers before the water turns foul.',
      ],
      during: [
        'Move to higher ground immediately. Do not wait for instructions.',
        'Never walk or drive through moving water. 15 cm can knock you down.',
        'Switch off mains power if water is entering the house and it is safe to do so.',
      ],
      after: [
        'Avoid floodwater. It may be contaminated or electrically charged.',
        'Boil or treat drinking water until authorities say it is safe.',
        'Photograph damage before cleaning up for insurance and relief claims.',
      ],
    },
  },
  {
    id: 'quake',
    monster: 'The Grave Shaker',
    name: 'Earthquake',
    icon: '🏚️',
    color: '#f59e0b',
    guide: {
      before: [
        'Secure heavy furniture and shelves to walls.',
        'Identify safe spots: under sturdy tables, away from glass.',
        'Keep shoes and a torch next to your bed.',
      ],
      during: [
        'DROP to your hands and knees, COVER your head, HOLD ON.',
        'Stay indoors until shaking stops. Do not run outside.',
        'If outdoors, move away from buildings, trees and power lines.',
      ],
      after: [
        'Expect aftershocks. Drop, cover and hold on again.',
        'Check for gas leaks. If you smell gas, leave and do not use switches.',
        'Use text messages instead of calls to keep lines free.',
      ],
    },
  },
  {
    id: 'fire',
    monster: 'The Ember Phantom',
    name: 'Wildfire',
    icon: '🔥',
    color: '#ef4444',
    guide: {
      before: [
        'Clear dry leaves and brush within 10 m of your home.',
        'Pack a go-bag and keep your vehicle fuelled.',
        'Agree a family meeting point outside the danger zone.',
      ],
      during: [
        'Evacuate early when told to. Fire moves faster than you think.',
        'Cover nose and mouth with a damp cloth to limit smoke inhalation.',
        'If trapped, find a spot with no vegetation and call for help.',
      ],
      after: [
        'Do not return until officials declare the area safe.',
        'Watch for hot spots, smouldering stumps and weakened trees.',
        'Wear an N95 mask while cleaning up ash.',
      ],
    },
  },
  {
    id: 'storm',
    monster: 'The Banshee Wind',
    name: 'Cyclone',
    icon: '🌪️',
    color: '#a78bfa',
    guide: {
      before: [
        'Bring in loose outdoor items and secure doors and windows.',
        'Charge phones and power banks fully.',
        'Stock at least 3 days of food, water and medicines.',
      ],
      during: [
        'Shelter in the strongest interior room away from windows.',
        'Stay inside even if the eye passes. The wind returns.',
        'Keep a battery radio tuned to official updates.',
      ],
      after: [
        'Beware of fallen power lines and treat them as live.',
        'Check on elderly neighbours and anyone who may need help.',
        'Do not drink tap water until it is declared safe.',
      ],
    },
  },
];

export const getDisaster = (id) => DISASTERS.find((d) => d.id === id);
