import { Pandal, TrailStop, TravelMode, CorridorDetourSuggestion, CuratedTrailPreset, Language } from '../types';
import { calculateDistanceKm, formatDistance } from './geo';

export interface TrailMetrics {
  totalDistanceKm: number;
  travelTimeMin: number;
  queueTimeMin: number;
  totalDurationMin: number;
  legDistancesKm: number[];
  legTimesMin: number[];
}

/**
 * Calculates cumulative travel metrics, leg-by-leg distances,
 * and estimated queuing times based on crowd levels.
 */
export function calculateTrailMetrics(
  stops: TrailStop[] = [],
  travelMode: TravelMode = 'walking'
): TrailMetrics {
  const safeStops = stops || [];
  if (safeStops.length < 2) {
    const queueTimeMin = safeStops.reduce((acc, stop) => acc + getQueueWaitMinutes(stop.crowdLevel), 0);
    return {
      totalDistanceKm: 0,
      travelTimeMin: 0,
      queueTimeMin,
      totalDurationMin: queueTimeMin,
      legDistancesKm: [],
      legTimesMin: [],
    };
  }

  let totalDistanceKm = 0;
  let travelTimeMin = 0;
  let queueTimeMin = 0;
  const legDistancesKm: number[] = [];
  const legTimesMin: number[] = [];

  // Add queue time for all stops that are pandals
  stops.forEach((s) => {
    queueTimeMin += getQueueWaitMinutes(s.crowdLevel);
  });

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    const dist = calculateDistanceKm(from.lat, from.lng, to.lat, to.lng);
    legDistancesKm.push(dist);
    totalDistanceKm += dist;

    // Estimate time based on travel mode
    let legTime = 0;
    if (travelMode === 'walking') {
      // Average festive Kolkata crowd walking pace ~ 3.5 km/h
      legTime = Math.max(1, Math.round((dist / 3.5) * 60));
    } else if (travelMode === 'cycling') {
      // Festive cycle pace ~ 12 km/h navigating street crowds
      legTime = Math.max(2, Math.round((dist / 12) * 60));
    } else if (travelMode === 'transit') {
      // Metro/Transit: 5 min waiting/access + ~20 km/h in-transit
      legTime = Math.max(6, Math.round(5 + (dist / 20) * 60));
    } else {
      // Driving / Auto / Cab: festive congestion ~ 14 km/h average
      legTime = Math.max(5, Math.round(4 + (dist / 14) * 60));
    }

    legTimesMin.push(legTime);
    travelTimeMin += legTime;
  }

  return {
    totalDistanceKm,
    travelTimeMin,
    queueTimeMin,
    totalDurationMin: travelTimeMin + queueTimeMin,
    legDistancesKm,
    legTimesMin,
  };
}

/**
 * Queue wait estimates based on Kolkata Durga Puja crowd density
 */
export function getQueueWaitMinutes(crowdLevel?: string): number {
  switch (crowdLevel) {
    case 'Extreme':
      return 60; // 1 hr queue wait at mega pandals
    case 'Heavy':
      return 35; // ~35 mins
    case 'Moderate':
      return 15; // ~15 mins
    case 'Low':
      return 5; // Direct entry
    default:
      return 10;
  }
}

/**
 * Format total duration into human readable string (e.g., "2h 45m" or "45m")
 */
export function formatDurationHoursMins(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;
}

/**
 * Smart Traveling Salesperson (TSP) heuristic to optimize stop order for shortest total distance.
 * Keeps the first stop (starting point) fixed, then greedily picks the nearest unvisited stop.
 */
export function optimizeTrailOrder(stops: TrailStop[]): TrailStop[] {
  if (stops.length <= 2) return stops;

  const result: TrailStop[] = [stops[0]];
  const remaining = stops.slice(1);

  while (remaining.length > 0) {
    const current = result[result.length - 1];
    let nearestIdx = 0;
    let nearestDist = calculateDistanceKm(current.lat, current.lng, remaining[0].lat, remaining[0].lng);

    for (let i = 1; i < remaining.length; i++) {
      const d = calculateDistanceKm(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    result.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return result;
}

/**
 * Corridor Detour Detection Algorithm ("Pandals on Your Way"):
 * Identifies pandals located within a buffer corridor along the path
 * between consecutive stops in the user's trail.
 */
export function detectPandalsOnWay(
  stops: TrailStop[] = [],
  allPandals: Pandal[] = [],
  maxCorridorDistanceKm = 0.55 // 550 meters walking corridor
): CorridorDetourSuggestion[] {
  const safeStops = stops || [];
  const safePandals = allPandals || [];
  if (safeStops.length < 2 || safePandals.length === 0) return [];

  const existingIds = new Set(safeStops.map((s) => s.pandalId || s.id));
  const candidatePandals = safePandals.filter((p) => !existingIds.has(p.id));
  const suggestions: CorridorDetourSuggestion[] = [];

  for (let i = 0; i < safeStops.length - 1; i++) {
    const stopA = safeStops[i];
    const stopB = safeStops[i + 1];

    const directDistKm = calculateDistanceKm(stopA.lat, stopA.lng, stopB.lat, stopB.lng);
    // Skip if stops are extremely close (< 200m)
    if (directDistKm < 0.2) continue;

    // Equirectangular projection coordinates for Kolkata region
    const midLat = ((stopA.lat + stopB.lat) / 2) * (Math.PI / 180);
    const kx = Math.cos(midLat) * 111.32; // km per degree longitude
    const ky = 110.57; // km per degree latitude

    const dx = (stopB.lng - stopA.lng) * kx;
    const dy = (stopB.lat - stopA.lat) * ky;
    const segLenSq = dx * dx + dy * dy;

    if (segLenSq === 0) continue;

    for (const cand of candidatePandals) {
      const px = (cand.lng - stopA.lng) * kx;
      const py = (cand.lat - stopA.lat) * ky;

      // Project point onto line segment: t = dot(P-A, B-A) / |B-A|^2
      const t = (px * dx + py * dy) / segLenSq;

      // Must be genuinely between Stop A and Stop B (not past the endpoints)
      if (t < 0.08 || t > 0.92) continue;

      const projX = t * dx;
      const projY = t * dy;
      const perpDistKm = Math.hypot(px - projX, py - projY);

      if (perpDistKm <= maxCorridorDistanceKm) {
        const distAtoCand = calculateDistanceKm(stopA.lat, stopA.lng, cand.lat, cand.lng);
        const distCandtoB = calculateDistanceKm(cand.lat, cand.lng, stopB.lat, stopB.lng);
        const extraDetourKm = Math.max(0, distAtoCand + distCandtoB - directDistKm);

        suggestions.push({
          pandal: cand,
          insertIndex: i + 1,
          perpendicularDistanceKm: perpDistKm,
          extraDetourKm,
          betweenStopA: stopA.name.en,
          betweenStopB: stopB.name.en,
        });
      }
    }
  }

  // Deduplicate: if a pandal triggered multiple segments, keep the one with lowest extra detour
  const uniqueMap = new Map<string, CorridorDetourSuggestion>();
  for (const s of suggestions) {
    const existing = uniqueMap.get(s.pandal.id);
    if (!existing || s.extraDetourKm < existing.extraDetourKm) {
      uniqueMap.set(s.pandal.id, s);
    }
  }

  return Array.from(uniqueMap.values()).sort((a, b) => a.extraDetourKm - b.extraDetourKm);
}

/**
 * Batch insert all detected corridor detours along the trail in geographic sequence
 */
export function batchInsertAllDetours(
  currentStops: TrailStop[],
  suggestions: CorridorDetourSuggestion[]
): TrailStop[] {
  if (suggestions.length === 0) return currentStops;
  const existingIds = new Set(currentStops.map((s) => s.id));

  // Clone current stops
  const result: TrailStop[] = [...currentStops];

  // Group suggestions by segment index
  const bySegment = new Map<number, CorridorDetourSuggestion[]>();
  for (const s of suggestions) {
    if (existingIds.has(s.pandal.id)) continue;
    const segIdx = s.insertIndex - 1; // segment starting at segIdx
    const list = bySegment.get(segIdx) || [];
    list.push(s);
    bySegment.set(segIdx, list);
  }

  // Work backwards from last segment to first segment so indexes don't shift earlier segments
  const sortedSegmentIndexes = Array.from(bySegment.keys()).sort((a, b) => b - a);

  for (const segIdx of sortedSegmentIndexes) {
    const list = bySegment.get(segIdx)!;
    const segOrigin = currentStops[segIdx];
    // Sort items along this segment by distance from origin
    list.sort((a, b) => {
      const distA = calculateDistanceKm(segOrigin.lat, segOrigin.lng, a.pandal.lat, a.pandal.lng);
      const distB = calculateDistanceKm(segOrigin.lat, segOrigin.lng, b.pandal.lat, b.pandal.lng);
      return distA - distB;
    });

    const newStops: TrailStop[] = list.map((s) => ({
      id: s.pandal.id,
      name: s.pandal.name,
      lat: s.pandal.lat,
      lng: s.pandal.lng,
      pandalId: s.pandal.id,
      nearestMetro: s.pandal.nearestMetro,
      crowdLevel: s.pandal.crowdLevel,
      zone: s.pandal.zone,
    }));

    // Insert into result at position segIdx + 1
    result.splice(segIdx + 1, 0, ...newStops);
  }

  return result;
}

/**
 * Builds Google Maps Multi-Stop Navigation URL
 * Supports origin, destination, and intermediate waypoints with travel mode
 */
export function buildGoogleMapsMultiStopUrl(
  stops: TrailStop[] = [],
  travelMode: TravelMode = 'walking'
): string {
  const safeStops = stops || [];
  if (safeStops.length === 0) return 'https://www.google.com/maps';

  if (safeStops.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${safeStops[0].lat},${safeStops[0].lng}`;
  }

  const origin = `${safeStops[0].lat},${safeStops[0].lng}`;
  const destination = `${safeStops[safeStops.length - 1].lat},${safeStops[safeStops.length - 1].lng}`;
  const gmapsTravelMode =
    travelMode === 'transit'
      ? 'transit'
      : travelMode === 'driving'
      ? 'driving'
      : travelMode === 'cycling'
      ? 'bicycling'
      : 'walking';

  let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}&travelmode=${gmapsTravelMode}`;

  if (safeStops.length > 2) {
    const waypoints = safeStops
      .slice(1, -1)
      .map((s) => `${s.lat},${s.lng}`)
      .join('|');
    url += `&waypoints=${encodeURIComponent(waypoints)}`;
  }

  return url;
}

/**
 * Generates formatted WhatsApp Durga Puja Hopping Itinerary
 */
export function buildWhatsAppItineraryText(
  stops: TrailStop[] = [],
  language: Language,
  metrics: TrailMetrics,
  travelMode: TravelMode
): string {
  const safeStops = stops || [];
  const modeEmoji =
    travelMode === 'walking'
      ? '🚶'
      : travelMode === 'cycling'
      ? '🚲'
      : travelMode === 'transit'
      ? '🚇'
      : '🛺';
  const gmapsUrl = buildGoogleMapsMultiStopUrl(stops, travelMode);

  const header =
    language === 'bn'
      ? `🏮 *আমার দুর্গাপূজা ট্রেইল প্ল্যানার (হপার্স)* 🏮\n✨ *মোট স্টপ:* ${stops.length}টি মণ্ডপ\n${modeEmoji} *ভ্রমণ মাধ্যম:* ${travelMode === 'walking' ? 'হাঁটা' : travelMode === 'cycling' ? 'সাইকেল' : travelMode === 'transit' ? 'মেট্রো / গণপরিবহন' : 'অটো / ট্যাক্সি'}\n📏 *মোট দূরত্ব:* ${metrics.totalDistanceKm.toFixed(1)} কিমি\n⏳ *আনুমানিক সময়:* ~${formatDurationHoursMins(metrics.totalDurationMin)} (মণ্ডপ লাইন সহ)\n`
      : language === 'hi'
      ? `🏮 *मेरा दुर्गा पूजा ट्रेल प्लानर (हॉपर्स)* 🏮\n✨ *कुल पड़ाव:* ${stops.length} पंडाल\n${modeEmoji} *यात्रा माध्यम:* ${travelMode === 'walking' ? 'पैदल' : travelMode === 'cycling' ? 'साइकिल' : travelMode === 'transit' ? 'मेट्रो' : 'ऑटो / टैक्सी'}\n📏 *कुल दूरी:* ${metrics.totalDistanceKm.toFixed(1)} किमी\n⏳ *अनुमानित समय:* ~${formatDurationHoursMins(metrics.totalDurationMin)} (लाइन सहित)\n`
      : `🏮 *Durga Puja Hopper Trail Itinerary* 🏮\n✨ *Total Stops:* ${stops.length} Pandals\n${modeEmoji} *Mode:* ${travelMode.toUpperCase()}\n📏 *Total Distance:* ${metrics.totalDistanceKm.toFixed(1)} km\n⏳ *Est. Hopping Duration:* ~${formatDurationHoursMins(metrics.totalDurationMin)} (incl. pandal queues)\n`;

  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  const stopList = stops
    .map((stop, idx) => {
      const num = idx < 10 ? numberEmojis[idx] : `[${idx + 1}]`;
      const name = stop.name[language] || stop.name.en;
      const metro = stop.nearestMetro ? `🚇 ${stop.nearestMetro}` : '';
      const crowd = stop.crowdLevel ? `👥 ${stop.crowdLevel} Rush` : '';
      const parts = [name];
      if (metro) parts.push(metro);
      if (crowd) parts.push(crowd);
      return `${num} *${parts.join(' | ')}*`;
    })
    .join('\n');

  const footer =
    language === 'bn'
      ? `\n\n🗺️ *গুগল ম্যাপে পুরো রুট খুলুন:*\n${gmapsUrl}\n\n🌸 *হপার্স – অফলাইন কলকাতা দুর্গাপূজা নেভিগেটর দিয়ে তৈরি*`
      : language === 'hi'
      ? `\n\n🗺️ *गूगल मैप्स पर पूरा रूट देखें:*\n${gmapsUrl}\n\n🌸 *हॉपर्स – ऑफलाइन कोलकाता दुर्गा पूजा कंपैनियन द्वारा साझा*`
      : `\n\n🗺️ *Open Full Turn-by-Turn Route in Google Maps:*\n${gmapsUrl}\n\n🌸 *Crafted with Hoppers – Kolkata Offline Durga Puja Companion*`;

  return `${header}\n${stopList}${footer}`;
}

export { CURATED_TRAILS } from '../data/presetTrails';

