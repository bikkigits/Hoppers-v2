/**
 * Kolkata Durga Puja PWA (Hoppers) - Geospatial Engine
 * Canonical geospatial algorithms, bounding boxes, displacement calculations, and crowd walking ETAs.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface WalkingEtaResult {
  minutes: number;
  text: string;
}

/**
 * Strict Kolkata Metropolitan Area Bounding Box
 * Lat: [22.45, 22.65], Lng: [88.25, 88.48]
 */
export const KOLKATA_BOUNDS: GeoBounds = {
  minLat: 22.45,
  maxLat: 22.65,
  minLng: 88.25,
  maxLng: 88.48,
};

/**
 * Canonical Fallback Anchor: Esplanade / Central Kolkata Hub
 */
export const ESPLANADE_CENTER: Coordinates = {
  lat: 22.5697,
  lng: 88.3516,
};

/**
 * Crowd-Adjusted Durga Puja Walking Speed
 * Locked at 3.5 km/h to account for heavy pedestrian festival footfall.
 */
export const CROWD_WALKING_SPEED_KMH = 3.5;

/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Haversine distance calculator returning both meters and kilometers.
 */
export function haversineDistance(
  coords1: Coordinates,
  coords2: Coordinates
): { meters: number; kilometers: number } {
  const kilometers = calculateDistanceKm(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
  const meters = kilometers * 1000;
  return { meters, kilometers };
}

/**
 * Determines whether a coordinate pair falls strictly within Kolkata's bounding box.
 */
export function isWithinKolkataBounds(lat: number, lng: number): boolean {
  if (isNaN(lat) || isNaN(lng)) return false;
  return (
    lat >= KOLKATA_BOUNDS.minLat &&
    lat <= KOLKATA_BOUNDS.maxLat &&
    lng >= KOLKATA_BOUNDS.minLng &&
    lng <= KOLKATA_BOUNDS.maxLng
  );
}

/**
 * Clamps a given coordinate pair into the Kolkata bounding box or returns the Esplanade fallback if invalid.
 */
export function clampToKolkata(lat: number, lng: number): Coordinates {
  if (isNaN(lat) || isNaN(lng)) {
    return { ...ESPLANADE_CENTER };
  }

  const clampedLat = Math.min(Math.max(lat, KOLKATA_BOUNDS.minLat), KOLKATA_BOUNDS.maxLat);
  const clampedLng = Math.min(Math.max(lng, KOLKATA_BOUNDS.minLng), KOLKATA_BOUNDS.maxLng);

  return {
    lat: clampedLat,
    lng: clampedLng,
  };
}

/**
 * Calculates walking duration and formatted badge string based on crowd walking speed (3.5 km/h).
 */
export function calculateCrowdWalkingEta(distanceInMeters: number): WalkingEtaResult {
  if (distanceInMeters <= 0 || isNaN(distanceInMeters)) {
    return { minutes: 1, text: '1 min walk' };
  }

  const distanceKm = distanceInMeters / 1000;
  const hours = distanceKm / CROWD_WALKING_SPEED_KMH;
  const minutes = Math.max(1, Math.round(hours * 60));

  return {
    minutes,
    text: `${minutes} min walk`,
  };
}

/**
 * Formats a distance in kilometers into a clean, human-readable distance badge.
 */
export function formatDistance(distanceKm: number): string {
  if (isNaN(distanceKm) || distanceKm <= 0) {
    return '0 m';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Backward-compatible helper estimating walking minutes.
 */
export function estimateWalkingMinutes(distanceKm: number): number {
  return calculateCrowdWalkingEta(distanceKm * 1000).minutes;
}
