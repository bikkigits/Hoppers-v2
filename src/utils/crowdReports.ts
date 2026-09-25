import { CrowdLevel } from '../types';

export type CrowdIntensity = 'low' | 'medium' | 'heavy';

export interface CrowdReportItem {
  id: string;
  pandalId: string;
  intensity: CrowdIntensity;
  timestamp: number;
  isVerifiedOnSite: boolean;
  userDistanceMeters?: number;
}

export interface PandalCrowdSummary {
  effectiveLevel: CrowdLevel;
  isCrowdsourced: boolean;
  totalRecentReports: number;
  onSiteCount: number;
  lastReportedTimestamp: number | null;
  counts: {
    low: number;
    medium: number;
    heavy: number;
  };
  confidence: 'High (Verified On-Site)' | 'Medium (Community)' | 'Baseline Estimate';
}

const STORAGE_KEY = 'hoppers_crowd_reports_v2';
const COOLDOWN_MS = 8 * 60 * 1000; // 8 minutes per pandal to prevent spam
const EXPIRY_MS = 90 * 60 * 1000; // 90 minutes rolling validity window

// Calculate geodesic distance in meters
function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Retrieve all reports from localStorage
export function getAllCrowdReports(): CrowdReportItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: CrowdReportItem[] = JSON.parse(raw);
    const now = Date.now();
    // Filter out reports older than 90 minutes
    return list.filter((r) => now - r.timestamp < EXPIRY_MS);
  } catch (e) {
    console.warn('Failed to parse crowd reports:', e);
    return [];
  }
}

// Submit a crowd report with GPS verification
export function submitCrowdReport(
  pandalId: string,
  intensity: CrowdIntensity,
  userCoords?: { lat: number; lng: number } | null,
  pandalCoords?: { lat: number; lng: number }
): { success: boolean; isVerifiedOnSite: boolean; message: string } {
  const all = getAllCrowdReports();
  const now = Date.now();

  // Check cooldown for this pandal
  const recentUserReport = all.find(
    (r) => r.pandalId === pandalId && now - r.timestamp < COOLDOWN_MS
  );
  if (recentUserReport) {
    return {
      success: false,
      isVerifiedOnSite: false,
      message: 'You already submitted an update for this pandal recently. Thank you!',
    };
  }

  // Determine if user is within 500m of the pandal for on-site verification
  let isVerifiedOnSite = false;
  let distanceMeters: number | undefined;

  if (userCoords && pandalCoords) {
    distanceMeters = getDistanceMeters(
      userCoords.lat,
      userCoords.lng,
      pandalCoords.lat,
      pandalCoords.lng
    );
    if (distanceMeters <= 550) {
      isVerifiedOnSite = true;
    }
  }

  const newReport: CrowdReportItem = {
    id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    pandalId,
    intensity,
    timestamp: now,
    isVerifiedOnSite,
    userDistanceMeters: distanceMeters,
  };

  const updatedList = [newReport, ...all].slice(0, 1000); // keep at most 1000 recent reports
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // Dispatch custom window event so all reactive views immediately refresh
  window.dispatchEvent(
    new CustomEvent('hoppers_crowd_updated', {
      detail: { pandalId, intensity, isVerifiedOnSite },
    })
  );

  return {
    success: true,
    isVerifiedOnSite,
    message: isVerifiedOnSite
      ? 'Verified On-Site! Your crowd update has been applied with top priority.'
      : 'Crowd report recorded! Thank you for helping fellow devotees.',
  };
}

// Compute the live crowd status of a pandal with algorithmic weighting
export function getPandalCrowdSummary(
  pandalId: string,
  defaultLevel: CrowdLevel = 'Moderate'
): PandalCrowdSummary {
  const all = getAllCrowdReports();
  const now = Date.now();
  const reports = all.filter((r) => r.pandalId === pandalId && now - r.timestamp < EXPIRY_MS);

  if (reports.length === 0) {
    return {
      effectiveLevel: defaultLevel,
      isCrowdsourced: false,
      totalRecentReports: 0,
      onSiteCount: 0,
      lastReportedTimestamp: null,
      counts: { low: 0, medium: 0, heavy: 0 },
      confidence: 'Baseline Estimate',
    };
  }

  // Weighted scoring: On-site reports get 2.5x weight, remote get 1x.
  // Newer reports (<20 min) get 1.5x recency multiplier.
  let lowScore = 0;
  let mediumScore = 0;
  let highScore = 0;

  const counts = { low: 0, medium: 0, heavy: 0 };
  let onSiteCount = 0;
  let lastReportedTimestamp: number | null = null;

  for (const r of reports) {
    counts[r.intensity] += 1;
    if (r.isVerifiedOnSite) onSiteCount += 1;
    if (!lastReportedTimestamp || r.timestamp > lastReportedTimestamp) {
      lastReportedTimestamp = r.timestamp;
    }

    const ageMin = (now - r.timestamp) / (1000 * 60);
    const recencyMultiplier = ageMin <= 20 ? 1.5 : ageMin <= 50 ? 1.0 : 0.7;
    const siteWeight = r.isVerifiedOnSite ? 2.5 : 1.0;
    const totalWeight = siteWeight * recencyMultiplier;

    if (r.intensity === 'low') lowScore += totalWeight;
    else if (r.intensity === 'medium') mediumScore += totalWeight;
    else if (r.intensity === 'heavy') highScore += totalWeight;
  }

  let effectiveLevel: CrowdLevel = defaultLevel;
  if (highScore >= mediumScore && highScore >= lowScore) {
    effectiveLevel = 'Heavy';
  } else if (mediumScore >= highScore && mediumScore >= lowScore) {
    effectiveLevel = 'Moderate';
  } else {
    effectiveLevel = 'Low';
  }

  const confidence =
    onSiteCount > 0
      ? 'High (Verified On-Site)'
      : reports.length >= 2
      ? 'Medium (Community)'
      : 'Baseline Estimate';

  return {
    effectiveLevel,
    isCrowdsourced: true,
    totalRecentReports: reports.length,
    onSiteCount,
    lastReportedTimestamp,
    counts,
    confidence,
  };
}
