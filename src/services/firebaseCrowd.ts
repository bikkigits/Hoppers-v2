import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  increment,
  Firestore,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import { CrowdLevel } from '../types';

export type VoteCategory = 'low' | 'moderate' | 'heavy' | 'extreme';

export interface PandalCrowdRecord {
  pandalId: string;
  low: number;
  moderate: number;
  heavy: number;
  extreme: number;
  lastUpdated: number;
  dominantLevel: CrowdLevel;
  totalVotes: number;
  dominantPercent: number;
  isCrowdsourced: boolean;
}

export interface UserVoteHistory {
  category: VoteCategory;
  votedAt: number;
}

const VOTES_LOCAL_STORAGE_KEY = 'hoppers_pandal_votes_v1';
const AGGREGATE_CACHE_KEY = 'hoppers_crowd_consensus_cache_v1';
const VOTE_COOLDOWN_MS = 60 * 60 * 1000; // 60 minutes cooldown to prevent spam

// Global in-memory cache for ultra-fast instant UI reads
const inMemoryConsensusCache: Map<string, PandalCrowdRecord> = new Map();

// Load initial cached aggregates from localStorage
try {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(AGGREGATE_CACHE_KEY);
    if (raw) {
      const parsed: Record<string, PandalCrowdRecord> = JSON.parse(raw);
      Object.entries(parsed).forEach(([id, rec]) => {
        inMemoryConsensusCache.set(id, rec);
      });
    }
  }
} catch (e) {
  console.warn('Failed to load crowd cache from localStorage:', e);
}

// Check if Vite environment variables for Firebase are configured
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('YourApiKeyHere')
);

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const databaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';
    firestoreDb = databaseId && databaseId !== '(default)'
      ? getFirestore(firebaseApp, databaseId)
      : getFirestore(firebaseApp);
  } catch (err) {
    console.warn('Firebase initialization error, fallback to offline local consensus:', err);
  }
}

/**
 * Calculates majority consensus crowd level from vote tallies
 */
export function calculateConsensus(
  pandalId: string,
  votes: { low: number; moderate: number; heavy: number; extreme: number; lastUpdated?: number },
  defaultLevel: CrowdLevel = 'Moderate'
): PandalCrowdRecord {
  const low = Math.max(0, Number(votes.low) || 0);
  const moderate = Math.max(0, Number(votes.moderate) || 0);
  const heavy = Math.max(0, Number(votes.heavy) || 0);
  const extreme = Math.max(0, Number(votes.extreme) || 0);
  const totalVotes = low + moderate + heavy + extreme;

  if (totalVotes === 0) {
    return {
      pandalId,
      low: 0,
      moderate: 0,
      heavy: 0,
      extreme: 0,
      lastUpdated: votes.lastUpdated || Date.now(),
      dominantLevel: defaultLevel,
      totalVotes: 0,
      dominantPercent: 100,
      isCrowdsourced: false,
    };
  }

  // Find category with maximum votes. Tie-breaker favors higher caution (extreme > heavy > moderate > low)
  let maxVotes = low;
  let dominantCategory: VoteCategory = 'low';
  let dominantLevel: CrowdLevel = 'Low';

  if (moderate >= maxVotes) {
    maxVotes = moderate;
    dominantCategory = 'moderate';
    dominantLevel = 'Moderate';
  }
  if (heavy >= maxVotes) {
    maxVotes = heavy;
    dominantCategory = 'heavy';
    dominantLevel = 'Heavy';
  }
  if (extreme >= maxVotes) {
    maxVotes = extreme;
    dominantCategory = 'extreme';
    dominantLevel = 'Extreme';
  }

  const dominantPercent = Math.round((maxVotes / totalVotes) * 100);

  return {
    pandalId,
    low,
    moderate,
    heavy,
    extreme,
    lastUpdated: votes.lastUpdated || Date.now(),
    dominantLevel,
    totalVotes,
    dominantPercent,
    isCrowdsourced: true,
  };
}

/**
 * Check if the user is allowed to vote for a specific pandal (60-min cooldown spam prevention)
 */
export function checkUserVoteStatus(pandalId: string): {
  canVote: boolean;
  remainingMinutes: number;
  lastVote?: UserVoteHistory;
} {
  try {
    if (typeof localStorage === 'undefined') {
      return { canVote: true, remainingMinutes: 0 };
    }
    const raw = localStorage.getItem(VOTES_LOCAL_STORAGE_KEY);
    if (!raw) return { canVote: true, remainingMinutes: 0 };

    const history: Record<string, UserVoteHistory> = JSON.parse(raw);
    const vote = history[pandalId];
    if (!vote) return { canVote: true, remainingMinutes: 0 };

    const elapsed = Date.now() - vote.votedAt;
    if (elapsed >= VOTE_COOLDOWN_MS) {
      return { canVote: true, remainingMinutes: 0, lastVote: vote };
    }

    const remainingMinutes = Math.ceil((VOTE_COOLDOWN_MS - elapsed) / 60000);
    return {
      canVote: false,
      remainingMinutes,
      lastVote: vote,
    };
  } catch (e) {
    console.warn('Error reading vote history:', e);
    return { canVote: true, remainingMinutes: 0 };
  }
}

/**
 * Get the current crowd consensus record for a pandal (Instant in-memory read)
 */
export function getPandalConsensus(
  pandalId: string,
  defaultLevel: CrowdLevel = 'Moderate'
): PandalCrowdRecord {
  const cached = inMemoryConsensusCache.get(pandalId);
  if (cached) return cached;

  const initial = calculateConsensus(
    pandalId,
    { low: 0, moderate: 0, heavy: 0, extreme: 0 },
    defaultLevel
  );
  inMemoryConsensusCache.set(pandalId, initial);
  return initial;
}

/**
 * Save in-memory cache to localStorage
 */
function persistCache() {
  try {
    if (typeof localStorage === 'undefined') return;
    const obj: Record<string, PandalCrowdRecord> = {};
    inMemoryConsensusCache.forEach((val, key) => {
      obj[key] = val;
    });
    localStorage.setItem(AGGREGATE_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to persist crowd cache:', e);
  }
}

/**
 * Submit a crowd vote with optimistic UI update and Firestore atomic sync
 */
export async function submitCrowdVote(
  pandalId: string,
  category: VoteCategory,
  defaultLevel: CrowdLevel = 'Moderate'
): Promise<{ success: boolean; message: string; record: PandalCrowdRecord; remainingMinutes?: number }> {
  // 1. Check Spam Prevention Cooldown
  const status = checkUserVoteStatus(pandalId);
  if (!status.canVote) {
    const current = getPandalConsensus(pandalId, defaultLevel);
    return {
      success: false,
      message: `You already voted ${status.lastVote?.category?.toUpperCase()} for this pandal. You can vote again in ${status.remainingMinutes}m.`,
      record: current,
      remainingMinutes: status.remainingMinutes,
    };
  }

  // 2. Record vote in local user vote history
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(VOTES_LOCAL_STORAGE_KEY);
      const history: Record<string, UserVoteHistory> = raw ? JSON.parse(raw) : {};
      history[pandalId] = {
        category,
        votedAt: Date.now(),
      };
      localStorage.setItem(VOTES_LOCAL_STORAGE_KEY, JSON.stringify(history));
    }
  } catch (e) {
    console.warn('Failed to save user vote history:', e);
  }

  // 3. Optimistic Update in Local Cache
  const current = getPandalConsensus(pandalId, defaultLevel);
  const updatedVotes = {
    low: current.low + (category === 'low' ? 1 : 0),
    moderate: current.moderate + (category === 'moderate' ? 1 : 0),
    heavy: current.heavy + (category === 'heavy' ? 1 : 0),
    extreme: current.extreme + (category === 'extreme' ? 1 : 0),
    lastUpdated: Date.now(),
  };

  const optimisticRecord = calculateConsensus(pandalId, updatedVotes, defaultLevel);
  inMemoryConsensusCache.set(pandalId, optimisticRecord);
  persistCache();

  // Dispatch live custom event for reactive UI components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('hoppers_crowd_consensus_updated', {
        detail: { pandalId, record: optimisticRecord },
      })
    );
  }

  // 4. Background Sync to Firestore
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'pandal_crowd', pandalId);
      await setDoc(
        docRef,
        {
          [category]: increment(1),
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore sync failed, retained optimistic vote:', err);
    }
  }

  return {
    success: true,
    message: `Vote recorded! Current consensus is ${optimisticRecord.dominantLevel} (${optimisticRecord.dominantPercent}% majority).`,
    record: optimisticRecord,
  };
}

/**
 * Subscribe in real-time to a specific pandal's crowd voting updates
 */
export function subscribePandalCrowd(
  pandalId: string,
  defaultLevel: CrowdLevel,
  onUpdate: (record: PandalCrowdRecord) => void
): () => void {
  // Immediately emit current cached record
  onUpdate(getPandalConsensus(pandalId, defaultLevel));

  // Listen to local event updates
  const handleLocalEvent = (e: Event) => {
    const customEv = e as CustomEvent<{ pandalId: string; record: PandalCrowdRecord }>;
    if (customEv.detail && customEv.detail.pandalId === pandalId) {
      onUpdate(customEv.detail.record);
    }
  };

  window.addEventListener('hoppers_crowd_consensus_updated', handleLocalEvent);

  let unsubscribeFirestore: (() => void) | null = null;

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, 'pandal_crowd', pandalId);
      unsubscribeFirestore = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const record = calculateConsensus(
              pandalId,
              {
                low: data.low || 0,
                moderate: data.moderate || 0,
                heavy: data.heavy || 0,
                extreme: data.extreme || 0,
                lastUpdated: data.lastUpdated?.toMillis?.() || Date.now(),
              },
              defaultLevel
            );
            inMemoryConsensusCache.set(pandalId, record);
            persistCache();
            onUpdate(record);
          }
        },
        (error) => {
          console.warn('Firestore subscription error for', pandalId, error);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore snapshot listener:', err);
    }
  }

  return () => {
    window.removeEventListener('hoppers_crowd_consensus_updated', handleLocalEvent);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}

/**
 * Subscribe to all pandals crowd consensus updates
 */
export function subscribeAllPandalCrowds(
  onUpdate: (records: Map<string, PandalCrowdRecord>) => void
): () => void {
  onUpdate(new Map(inMemoryConsensusCache));

  const handleLocalEvent = () => {
    onUpdate(new Map(inMemoryConsensusCache));
  };

  window.addEventListener('hoppers_crowd_consensus_updated', handleLocalEvent);

  let unsubscribeFirestore: (() => void) | null = null;

  if (firestoreDb) {
    try {
      const colRef = collection(firestoreDb, 'pandal_crowd');
      unsubscribeFirestore = onSnapshot(
        colRef,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const pandalId = change.doc.id;
            const data = change.doc.data();
            const record = calculateConsensus(pandalId, {
              low: data.low || 0,
              moderate: data.moderate || 0,
              heavy: data.heavy || 0,
              extreme: data.extreme || 0,
              lastUpdated: data.lastUpdated?.toMillis?.() || Date.now(),
            });
            inMemoryConsensusCache.set(pandalId, record);
          });
          persistCache();
          onUpdate(new Map(inMemoryConsensusCache));
        },
        (error) => {
          console.warn('Firestore all pandals subscription error:', error);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore all-pandals listener:', err);
    }
  }

  return () => {
    window.removeEventListener('hoppers_crowd_consensus_updated', handleLocalEvent);
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
    }
  };
}
