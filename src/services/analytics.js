import { CITIES } from '../utils/geo';

export const RES_KEYS = ['ambulances', 'medicalStaff', 'rescueTeams', 'boats', 'fireEngines', 'helicopters', 'medicalKits', 'foodPackets'];
export const RES_META = {
  ambulances: ['Ambulances', '🚑'], medicalStaff: ['Doctors & paramedics', '🩺'], rescueTeams: ['Rescue teams', '🦺'], boats: ['Rescue boats', '🚤'],
  fireEngines: ['Fire engines', '🚒'], helicopters: ['Helicopters', '🚁'], medicalKits: ['Medical kits', '🧰'], foodPackets: ['Food & water packs', '🥫'],
};
const SEV = { LOW: { m: 0.5, score: 18, eta: 60, label: 'Monitor' }, MEDIUM: { m: 0.8, score: 42, eta: 30, label: 'Respond' }, HIGH: { m: 1.2, score: 68, eta: 15, label: 'Urgent' }, CRITICAL: { m: 1.7, score: 92, eta: 8, label: 'Immediate' } };
// injury = share needing medical care · team = people per rescue team · boat = people per boat · fire = people per engine · food = days of supplies
const TYPE = {
  FLOOD: { injury: 0.08, team: 12, boat: 8, fire: 0, shelter: 1, food: 3, air: true, hazard: 'Rising water and stranded residents' },
  EARTHQUAKE: { injury: 0.3, team: 6, boat: 0, fire: 25, shelter: 0.9, food: 3, air: true, hazard: 'Structural collapse and trapped survivors' },
  FIRE: { injury: 0.22, team: 10, boat: 0, fire: 6, shelter: 0.6, food: 2, air: false, hazard: 'Spreading fire and smoke inhalation' },
  CYCLONE: { injury: 0.06, team: 20, boat: 25, fire: 0, shelter: 1, food: 3, air: true, hazard: 'High winds, flooding and power loss' },
  LANDSLIDE: { injury: 0.35, team: 6, boat: 0, fire: 0, shelter: 0.7, food: 2, air: true, hazard: 'Blocked roads and buried vehicles' },
  MEDICAL: { injury: 1, team: 0, boat: 0, fire: 0, shelter: 0, food: 0, air: false, hazard: 'Medical emergency' },
  OTHER: { injury: 0.2, team: 12, boat: 0, fire: 0, shelter: 0.5, food: 1, air: false, hazard: 'Unclassified emergency' },
};
// [density/complexity factor, terrain]
const CITY = { Delhi: [1.2, 'Dense urban'], Mumbai: [1.3, 'Dense coastal'], Lucknow: [1.05, 'Urban plains'], Kolkata: [1.2, 'Dense riverine'], Chennai: [1.1, 'Coastal urban'], Bengaluru: [1.1, 'Urban plateau'], Hyderabad: [1.1, 'Urban plateau'], Guwahati: [1.15, 'Hilly riverine'], Jaipur: [1.0, 'Semi-arid urban'], Patna: [1.1, 'Riverine plains'] };

const rad = (x) => (x * Math.PI) / 180;
export const distKm = (a1, o1, a2, o2) => { const h = Math.sin(rad(a2 - a1) / 2) ** 2 + Math.cos(rad(a1)) * Math.cos(rad(a2)) * Math.sin(rad(o2 - o1) / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(h)); };
export const coordsOf = (i) => (i.latitude != null && i.longitude != null ? [i.latitude, i.longitude] : CITIES[i.city] || CITIES.Delhi);

/** Estimates what a response to this incident needs. Pure function: same input, same output. */
export function analyze(inc, zones = []) {
  const T = TYPE[inc.type] || TYPE.OTHER, S = SEV[inc.severity] || SEV.MEDIUM, [f, terrain] = CITY[inc.city] || [1, 'Urban'];
  const p = Math.max(1, Math.round(+inc.peopleAffected || 1)), m = S.m * f;
  const injured = Math.min(p, Math.max(1, Math.round(p * T.injury * m)));
  const heli = T.air && ((inc.severity === 'CRITICAL' && p >= 15) || (inc.severity === 'HIGH' && p >= 60)) ? Math.ceil(p / 40) : 0;
  const required = {
    ambulances: Math.max(1, Math.ceil(injured / 3)),
    medicalStaff: Math.ceil(injured / 2) + 1,
    rescueTeams: T.team ? Math.max(1, Math.ceil((p * m) / T.team)) : 0,
    boats: T.boat ? Math.max(1, Math.ceil((p * m) / T.boat)) : 0,
    fireEngines: T.fire ? Math.max(1, Math.ceil((p * m) / T.fire)) + (inc.type === 'FIRE' ? 1 : 0) : 0,
    helicopters: heli,
    medicalKits: Math.ceil(injured * 2 + p * 0.2),
    foodPackets: Math.ceil(p * T.food * 3),
  };
  const crew = { 'Rescue crews': required.rescueTeams * 6, 'Medical staff': required.medicalStaff, 'Ambulance drivers': required.ambulances * 2, 'Fire crews': required.fireEngines * 5, 'Boat crews': required.boats * 3, 'Air crews': required.helicopters * 4 };
  const crewTotal = Object.values(crew).reduce((s, v) => s + v, 0);
  const [la, lo] = coordsOf(inc);
  const near = (types, needFree) => zones.filter((z) => types.includes(z.type) && (!needFree || z.capacity > z.occupied)).map((z) => ({ ...z, km: distKm(la, lo, z.latitude, z.longitude), free: z.capacity - z.occupied })).sort((a, b) => a.km - b.km)[0] || null;
  const hospital = near(['HOSPITAL'], false), shelter = near(['SHELTER', 'CAMP'], true);
  const travelEta = hospital ? Math.max(3, Math.round((hospital.km / (inc.severity === 'CRITICAL' ? 60 : 40)) * 60)) : 15;
  const shelterNeeded = Math.ceil(p * T.shelter);
  const risk = Math.min(99, Math.round(S.score + (Math.min(p, 200) / 200) * 8 + (f - 1) * 10));

  const rec = [`Dispatch ${required.ambulances} ambulance${required.ambulances > 1 ? 's' : ''} with ${required.medicalStaff} medical staff within ${S.eta} min.`];
  if (required.rescueTeams) rec.push(`Send ${required.rescueTeams} rescue team${required.rescueTeams > 1 ? 's' : ''} (${required.rescueTeams * 6} responders) for search and extraction.`);
  if (required.boats) rec.push(`Launch ${required.boats} rescue boat${required.boats > 1 ? 's' : ''} to reach stranded people.`);
  if (required.fireEngines) rec.push(`Deploy ${required.fireEngines} fire engine${required.fireEngines > 1 ? 's' : ''} and set a safety perimeter.`);
  if (required.helicopters) rec.push(`Request ${required.helicopters} helicopter${required.helicopters > 1 ? 's' : ''} for air evacuation.`);
  if (shelterNeeded) rec.push(shelter ? `Open ${shelterNeeded} shelter places. Nearest: ${shelter.name}, ${shelter.city} (${shelter.km.toFixed(0)} km, ${shelter.free} free).` : `Open ${shelterNeeded} temporary shelter places. No safe zone with free space was found.`);
  if (hospital && hospital.free < injured) rec.push(`${hospital.name} has only ${hospital.free} free beds. Pre-alert a second hospital.`);
  if (risk >= 85) rec.push('Escalate to the state control room and issue a public alert.');

  return {
    risk, level: S.label, targetEta: S.eta, travelEta, injured, terrain, factor: f, hazard: T.hazard, required, crew, crewTotal, shelterNeeded,
    nearestHospital: hospital && { name: hospital.name, city: hospital.city, km: Math.round(hospital.km), free: hospital.free },
    nearestShelter: shelter && { name: shelter.name, city: shelter.city, km: Math.round(shelter.km), free: shelter.free },
    recommendations: rec, coords: [la, lo], coordsSource: inc.latitude != null ? 'GPS' : 'City centre',
  };
}

export const availabilityOf = (pool, required) => Object.fromEntries(RES_KEYS.map((k) => {
  const r = pool.find((x) => x.key === k), need = required[k] || 0, avail = r ? Math.max(0, r.total - r.allocated) : 0;
  return [k, { total: r ? r.total : 0, available: avail, required: need, short: Math.max(0, need - avail) }];
}));

/** City-wide picture: demand of incidents not yet dispatched vs what is free in the pool. */
export function aggregate(incs, zones, pool) {
  const active = incs.filter((i) => i.status !== 'RESOLVED');
  const rows = active.map((i) => ({ i, a: analyze(i, zones) }));
  const pending = rows.filter((r) => !r.i.dispatched);
  const demand = Object.fromEntries(RES_KEYS.map((k) => [k, pending.reduce((s, r) => s + r.a.required[k], 0)]));
  const cities = {};
  rows.forEach(({ i, a }) => { const c = (cities[i.city] ??= { city: i.city, incidents: 0, people: 0, risk: 0, crew: 0 }); c.incidents++; c.people += i.peopleAffected; c.risk = Math.max(c.risk, a.risk); c.crew += a.crewTotal; });
  return {
    totals: { active: active.length, critical: active.filter((i) => i.severity === 'CRITICAL').length, people: active.reduce((s, i) => s + i.peopleAffected, 0), pending: pending.length, crew: rows.reduce((s, r) => s + r.a.crewTotal, 0) },
    demand, availability: availabilityOf(pool, demand),
    bySeverity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => ({ key: s, value: active.filter((i) => i.severity === s).length })),
    byType: Object.keys(TYPE).map((t) => ({ key: t, value: active.filter((i) => i.type === t).length })).filter((x) => x.value),
    byCity: Object.values(cities).sort((a, b) => b.risk - a.risk),
    hotspots: rows.map(({ i, a }) => ({ id: i.id, code: i.code, type: i.type, severity: i.severity, city: i.city, people: i.peopleAffected, risk: a.risk, dispatched: !!i.dispatched, required: a.required, crew: a.crewTotal, status: i.status })).sort((x, y) => y.risk - x.risk),
  };
}
