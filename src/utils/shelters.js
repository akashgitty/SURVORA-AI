import { distance, toKm } from '../data/regions.js';

// Adds distance (km) and free places to each shelter, nearest first.
// `reservations` is { shelterId: numberOfSpotsReservedByThisUser }.
export function rankShelters(region, shelters, reservations = {}) {
  return shelters
    .map((s) => {
      const occupied = s.occupied + (reservations[s.id] || 0);
      return {
        ...s,
        occupied,
        free: Math.max(0, s.capacity - occupied),
        km: toKm(distance(region, s)),
      };
    })
    .sort((a, b) => a.km - b.km);
}
