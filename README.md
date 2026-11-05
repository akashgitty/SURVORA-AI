# 🎃 SURVORA-AI - Survive the Haunting

An AI-powered disaster management web app with a Halloween UI.
Disasters become "monsters" (flood = *The Drowned Wraith*, earthquake = *The Grave Shaker*...), but all safety advice is real and practical.

## Run it

```bash
npm install
npm run dev        # opens http://localhost:5173
npm run build      # production build in /dist
```

Needs Node 18 or newer.

## Features

| Tab | What it does |
|---|---|
| 📡 Haunt Radar | Live (simulated) risk per region, Doom Meter, alert feed, haunted map. "Summon" button forces a disaster for demos. |
| 🔮 Ask Survora | AI chat that knows your region: risk, nearest shelter, what to pack, what to do in each disaster. |
| 🏚️ Shelters | Nearest shelters first, capacity bars, type filter, reserve / cancel a spot. |
| 📜 Grimoire | Emergency kit checklist (saved on device) and before / during / after guides. |
| 🚨 SOS | Detailed SOS form + report history. A floating hold-to-send SOS button is on every page. |

## Project map (where to look for what)

```
src/
├── main.jsx                 entry point
├── App.jsx                  shared state + page switching
├── styles.css               the whole Halloween theme (sections are numbered)
│
├── pages/                   one file per tab
│   ├── Dashboard.jsx
│   ├── Assistant.jsx
│   ├── Shelters.jsx
│   ├── Survival.jsx
│   └── Report.jsx
│
├── components/              small reusable pieces
│   ├── Header.jsx           logo + navigation tabs
│   ├── FloatingSpooks.jsx   bats, ghosts, moon (decoration)
│   ├── RiskMeter.jsx        round "Doom Meter"
│   ├── ThreatCard.jsx       one disaster's live level
│   ├── SpookyMap.jsx        SVG map of regions and shelters
│   ├── AlertFeed.jsx        live warnings list
│   ├── ChatBot.jsx          chat window
│   ├── KitChecklist.jsx     packing checklist
│   ├── GuideList.jsx        before / during / after guides
│   ├── SOSButton.jsx        floating hold-to-send button
│   └── Toast.jsx            pop-up message
│
├── hooks/
│   ├── useLiveThreats.js    simulated sensor feed + alerts
│   └── useLocalStorage.js   useState that survives reload
│
├── services/
│   ├── aiEngine.js          the AI brain (offline rules, or AWS Bedrock)
│   └── aws.js               SOS sending (offline demo, or AWS SNS)
│
├── data/                    all the content, easy to edit
│   ├── disasters.js         monsters + safety steps
│   ├── regions.js           regions + shelters
│   ├── levels.js            risk score -> label / colour
│   └── kit.js               checklist items
│
└── utils/shelters.js        distance + free-space calculation
```

**Data flow in one line:** `useLiveThreats` makes the numbers → `App.jsx` holds them → pages pass them to components → components only draw.

## AWS integration (optional)

The app works fully offline. To plug in AWS, copy `.env.example` to `.env` and fill in:

| Variable | AWS path | Purpose |
|---|---|---|
| `VITE_AWS_AI_ENDPOINT` | API Gateway → Lambda → **Amazon Bedrock** | Smarter answers in Ask Survora. Receives `{question, context}`, returns `{answer}`. |
| `VITE_AWS_SOS_ENDPOINT` | API Gateway → Lambda → **DynamoDB + SNS** | Stores SOS reports and sends SMS / push to responders. Receives `{report}`, returns `{id}`. |

Other good fits: **AWS Amplify Hosting** (deploy this app), **Amazon Location Service** (real maps and routes), **Amazon Kinesis / IoT Core** (real sensor streams to replace `useLiveThreats`), **Amazon Translate** (regional languages).

If a call fails, the app silently falls back to offline mode, so the demo never breaks.

## Notes

- All region, shelter and risk data is **simulated** for the demo. Replace `src/data/regions.js` and `useLiveThreats.js` with real feeds for production.
- In a real emergency, call your local emergency number (112 in India).
