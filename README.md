# SURVORA-AI – Frontend only (React + Vite)

Calm, matcha-themed disaster-response intelligence. Runs **entirely in the browser**: no server, no API, no network calls.
Data lives in your browser's localStorage.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
```
`npm run build` → static files in `dist/` (serve with any static host; enable SPA fallback to `index.html`).

## What's new: Resource analytics
- **Report an emergency**: asks for your GPS location as soon as the page opens, and shows a **live impact estimate** (risk score,
  people needing care, responders required, ambulances, rescue teams, boats, fire engines, helicopters, kits, food packs)
  that updates as you change type, severity or people affected.
- **After every report (and SOS)** you land on that incident's **resource plan** (`/analytics/:id`): risk gauge, situation, location
  (coordinates, terrain, nearest hospital and shelter), resources required vs available, people required on site, recommended actions.
- **Analytics dashboard** (`/analytics`): demand vs free capacity for every resource, incident mix by severity and type,
  hotspots ranked by risk, city table. Updates live when new incidents arrive.
- **Authority**: "Dispatch recommended" allocates resources from the shared pool (partial if short, shortfall flagged),
  moves the incident to *Team dispatched*, and returns the resources to the pool when the incident is resolved.

### How the estimate works (`src/services/analytics.js`)
Severity multiplier × city density/terrain factor × people affected, with a per-disaster-type profile
(share needing medical care, people per rescue team, people per boat, people per fire engine, shelter and supply needs).
Helicopters only for large critical/high incidents of types where air rescue helps. It is a transparent rule-based model, so you can tune the numbers.

## Demo accounts
- Citizen: create one on the Sign-up page.
- Responder (Authority + dispatch): `authority@survora.local` / `Password123!`

## Notes
- Disaster ambience (🌊 🏚️ 🔥 🌀) switcher is bottom-left. Reset all data: clear the site's localStorage (`survora.*` keys).
- Data is per browser. Passwords use a simple non-cryptographic hash and roles are enforced client-side only: a demo layer, not real security.

## Structure
```
src/pages        Landing, SignIn, SignUp, Dashboard, Analytics, IncidentAnalytics, ReportEmergency, SafeZones,
                 RescueTracking, Resources, CalmSpace, Authority, Profile
src/components   Layout, Navbar, SosButton, ChatDrawer, Ambience, Gauge, Donut, Modal, Timeline, ...
src/services     analytics.js (estimation engine), localStore.js (storage + seed), endpoints.js (feature logic)
src/styles       tokens, base, components, animations, analytics
```
