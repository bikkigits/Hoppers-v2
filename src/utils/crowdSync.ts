import { CrowdReport, Language } from '../types';

const STORAGE_KEY = 'hoppers_crowd_reports_v2';
const BROADCAST_CHANNEL_NAME = 'hoppers_crowd_sync';

// Memory cache of reports
let inMemoryReports: Record<string, CrowdReport> = {};

// Broadcast channel for cross-tab communication
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported or restricted in this environment', e);
}

// Load initial reports from localStorage
export function loadLocalCrowdReports(): Record<string, CrowdReport> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      inMemoryReports = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse local crowd reports:', e);
  }
  return inMemoryReports;
}

// Save to localStorage & broadcast
function persistCrowdReports(reports: Record<string, CrowdReport>) {
  inMemoryReports = reports;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'CROWD_SYNC_UPDATE', payload: reports });
    }
  } catch (e) {
    console.error('Failed to persist crowd reports:', e);
  }
}

// Submit a new crowd report
export async function submitCrowdReport(
  pandalId: string,
  intensity: 'Low' | 'Medium' | 'Heavy'
): Promise<CrowdReport> {
  const currentReports = loadLocalCrowdReports();
  const now = Date.now();
  
  const existing = currentReports[pandalId];
  const reportCount = existing ? (existing.reportCount || 1) + 1 : 1;

  const newReport: CrowdReport = {
    pandalId,
    intensity,
    timestamp: now,
    reportCount,
  };

  currentReports[pandalId] = newReport;
  persistCrowdReports(currentReports);

  // Attempt background sync to server
  try {
    fetch('/api/crowd-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    }).catch(() => {
      // Offline fallback is already persisted locally
    });
  } catch {
    // Graceful offline operation
  }

  return newReport;
}

// Sync with server if online
export async function syncWithServer(): Promise<Record<string, CrowdReport>> {
  const localReports = loadLocalCrowdReports();
  try {
    const res = await fetch('/api/crowd-reports');
    if (res.ok) {
      const serverReports: Record<string, CrowdReport> = await res.json();
      // Merge with highest timestamp taking precedence
      const merged = { ...localReports };
      for (const [id, sRep] of Object.entries(serverReports)) {
        if (!merged[id] || sRep.timestamp > merged[id].timestamp) {
          merged[id] = sRep;
        }
      }
      persistCrowdReports(merged);
      return merged;
    }
  } catch {
    // Return local reports if offline
  }
  return localReports;
}

// Subscribe to live broadcast updates from other tabs
export function subscribeToCrowdUpdates(callback: (reports: Record<string, CrowdReport>) => void): () => void {
  if (!broadcastChannel) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'CROWD_SYNC_UPDATE') {
      callback(event.data.payload);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

// Compute Freshness Decay & localized label
export interface FreshnessInfo {
  label: string;
  badgeClass: string;
  minutesAgo: number;
  confidence: 'live' | 'recent' | 'fading' | 'baseline';
}

export function getCrowdFreshness(
  report: CrowdReport | undefined,
  language: Language
): FreshnessInfo | null {
  if (!report || !report.timestamp) return null;

  const diffMs = Date.now() - report.timestamp;
  const minutesAgo = Math.max(1, Math.round(diffMs / 60000));

  if (minutesAgo <= 15) {
    const text =
      language === 'bn'
        ? `সরাসরি আপডেট (${minutesAgo}মি আগে) · তাজা`
        : language === 'hi'
        ? `लाइव रिपोर्ट (${minutesAgo} मि पूर्व) · ताजा`
        : `Live Now (${minutesAgo}m ago) · Fresh`;
    return {
      label: text,
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      minutesAgo,
      confidence: 'live',
    };
  }

  if (minutesAgo <= 45) {
    const text =
      language === 'bn'
        ? `সাম্প্রতিক (${minutesAgo}মি আগে)`
        : language === 'hi'
        ? `हालिया (${minutesAgo} मि पूर्व)`
        : `Recent (${minutesAgo}m ago)`;
    return {
      label: text,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      minutesAgo,
      confidence: 'recent',
    };
  }

  if (minutesAgo <= 90) {
    const text =
      language === 'bn'
        ? `পুরনো তথ্য (${minutesAgo}মি আগে)`
        : language === 'hi'
        ? `पुरानी रिपोर्ट (${minutesAgo} मि पूर्व)`
        : `Fading (${minutesAgo}m ago)`;
    return {
      label: text,
      badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      minutesAgo,
      confidence: 'fading',
    };
  }

  const text =
    language === 'bn'
      ? `ঐতিহাসিক গড় (>১.৫ ঘণ্টা আগে)`
      : language === 'hi'
      ? `ऐतिहासिक औसत (>1.5 घंटे पूर्व)`
      : `Historical baseline (>1.5h ago)`;
  return {
    label: text,
    badgeClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/40',
    minutesAgo,
    confidence: 'baseline',
  };
}
