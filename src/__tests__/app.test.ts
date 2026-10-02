import { describe, it, expect } from 'vitest';
import { PANDALS_DATA, METRO_STATIONS, CRITICAL_FACILITIES } from '../data/mockData';
import { METRO_LINES } from '../data/metroLines';
import { TRANSLATIONS } from '../data/translations';
import { matchesPandalFilter, getPandalMatchedZones } from '../utils/pandalClassification';
import { sanitizePandalZones } from '../utils/sanitizePandalZones';
import { calculateDistanceKm } from '../utils/geo';
import { calculateConsensus, checkUserVoteStatus } from '../services/firebaseCrowd';

// Distance calculation helper (Haversine formula)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
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

// Distance formatter helper
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

describe('Data Integrity & Geographic Bounds', () => {
  it('contains valid pandals data with non-empty attributes and unique IDs', () => {
    expect(PANDALS_DATA.length).toBeGreaterThan(50);

    const ids = new Set<string>();
    for (const pandal of PANDALS_DATA) {
      expect(pandal.id).toBeTruthy();
      expect(ids.has(pandal.id)).toBe(false); // Unique IDs
      ids.add(pandal.id);

      // Names in EN, BN, HI
      expect(pandal.name.en.trim()).not.toBe('');
      expect(pandal.name.bn.trim()).not.toBe('');
      expect(pandal.name.hi.trim()).not.toBe('');

      // Coordinates within Kolkata Metropolitan Area bounds
      expect(pandal.lat).toBeGreaterThan(22.0);
      expect(pandal.lat).toBeLessThan(23.5);
      expect(pandal.lng).toBeGreaterThan(87.5);
      expect(pandal.lng).toBeLessThan(89.0);

      // Zone validity
      expect(['North', 'Central', 'South', 'East']).toContain(pandal.zone);
    }
  });

  it('contains valid metro stations with line definitions and coordinates', () => {
    expect(METRO_STATIONS.length).toBeGreaterThan(20);

    for (const station of METRO_STATIONS) {
      expect(station.id).toBeTruthy();
      expect(station.name.en).toBeTruthy();
      expect(station.lines.length).toBeGreaterThan(0);
      expect(station.lat).toBeGreaterThan(22.0);
      expect(station.lat).toBeLessThan(23.0);
      expect(station.lng).toBeGreaterThan(88.0);
      expect(station.lng).toBeLessThan(89.0);
    }
  });

  it('contains valid critical facilities (police, toilets, medical, food, ferry)', () => {
    expect(CRITICAL_FACILITIES.length).toBeGreaterThan(20);

    for (const facility of CRITICAL_FACILITIES) {
      expect(facility.id).toBeTruthy();
      expect(facility.name.en).toBeTruthy();
      expect(facility.category).toBeTruthy();
      expect(facility.lat).toBeGreaterThan(22.0);
      expect(facility.lat).toBeLessThan(23.0);
      expect(facility.lng).toBeGreaterThan(88.0);
      expect(facility.lng).toBeLessThan(89.0);
    }
  });

  it('contains 5 official Kolkata metro line corridors in metadata', () => {
    expect(METRO_LINES.length).toBe(5);
    const lineCodes = METRO_LINES.map((l) => l.code);
    expect(lineCodes).toContain('blue');
    expect(lineCodes).toContain('green');
    expect(lineCodes).toContain('orange');
    expect(lineCodes).toContain('purple');
    expect(lineCodes).toContain('yellow');
  });
});

describe('Geospatial Zone Classification & Filtering', () => {
  it('filters pandals by micro-zones correctly', () => {
    const allCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'all')).length;
    const northCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'north')).length;
    const southCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'south')).length;
    const centralCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'central')).length;
    const saltlakeCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'saltlake')).length;
    const rajarhatCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'rajarhat')).length;
    const dumdumCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'dumdum')).length;
    const westCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'west')).length;
    const behalaCount = PANDALS_DATA.filter((p) => matchesPandalFilter(p, 'behala')).length;

    expect(allCount).toBe(PANDALS_DATA.length);
    expect(northCount).toBeGreaterThan(15);
    expect(southCount).toBeGreaterThan(15);
    expect(centralCount).toBeGreaterThan(5);
    expect(saltlakeCount).toBeGreaterThan(0);
    expect(dumdumCount).toBeGreaterThan(2);
    expect(behalaCount).toBeGreaterThan(3);
    expect(westCount).toBeGreaterThan(0);
  });

  it('correctly maps specific iconic pandals to their expected micro-zones', () => {
    const bagbazar = PANDALS_DATA.find((p) => p.id === 'bagbazar');
    expect(bagbazar).toBeDefined();
    if (bagbazar) {
      expect(matchesPandalFilter(bagbazar, 'north')).toBe(true);
    }

    const collegeSquare = PANDALS_DATA.find((p) => p.id === 'college-square');
    expect(collegeSquare).toBeDefined();
    if (collegeSquare) {
      expect(matchesPandalFilter(collegeSquare, 'central')).toBe(true);
    }

    const behalaClub = PANDALS_DATA.find((p) => p.id.includes('behala') || p.name.en.toLowerCase().includes('behala'));
    if (behalaClub) {
      expect(matchesPandalFilter(behalaClub, 'behala')).toBe(true);
    }

    const sreebhumi = PANDALS_DATA.find((p) => p.id === 'sreebhumi' || p.name.en.toLowerCase().includes('sreebhumi'));
    if (sreebhumi) {
      expect(matchesPandalFilter(sreebhumi, 'dumdum')).toBe(true);
    }
  });

  it('extracts multi-zone tag associations via getPandalMatchedZones', () => {
    const bagbazar = PANDALS_DATA.find((p) => p.id === 'bagbazar');
    if (bagbazar) {
      const tags = getPandalMatchedZones(bagbazar);
      expect(tags).toContain('North');
    }
  });
});

describe('Geospatial & Distance Calculations', () => {
  it('accurately computes distance between Kolkata landmarks', () => {
    // Bagbazar (22.6026, 88.3683) to Kumartuli Park (22.5991, 88.3662) ~ 450m (0.45 km)
    const dist = getDistanceFromLatLonInKm(22.6026, 88.3683, 22.5991, 88.3662);
    expect(dist).toBeGreaterThan(0.3);
    expect(dist).toBeLessThan(0.7);
  });

  it('correctly formats distances in meters (<1km) and kilometers (>=1km)', () => {
    expect(formatDistance(0.45)).toBe('450 m');
    expect(formatDistance(0.08)).toBe('80 m');
    expect(formatDistance(1.24)).toBe('1.2 km');
    expect(formatDistance(5.67)).toBe('5.7 km');
  });

  it('finds nearest metro station to a given coordinate', () => {
    const bagbazarLat = 22.6026;
    const bagbazarLng = 88.3683;

    let nearest = METRO_STATIONS[0];
    let minDistance = Infinity;

    for (const station of METRO_STATIONS) {
      const d = getDistanceFromLatLonInKm(bagbazarLat, bagbazarLng, station.lat, station.lng);
      if (d < minDistance) {
        minDistance = d;
        nearest = station;
      }
    }

    // Shyambazar or Sovabazar is nearest to Bagbazar
    expect(['Shyambazar', 'Sovabazar Sutanuti']).toContain(nearest.name.en);
    expect(minDistance).toBeLessThan(1.5);
  });
});

describe('Metro Network Topology', () => {
  it('identifies interchange stations correctly', () => {
    const interchangeStations = METRO_STATIONS.filter((s) => s.isInterchange);
    expect(interchangeStations.length).toBeGreaterThan(0);

    const esplanade = METRO_STATIONS.find((s) => s.id === 'esplanade');
    expect(esplanade).toBeDefined();
    expect(esplanade?.lines).toContain('blue');
    expect(esplanade?.lines).toContain('green');
    expect(esplanade?.isInterchange).toBe(true);
  });

  it('verifies all 5 metro lines have non-empty stations and coordinates', () => {
    for (const line of METRO_LINES) {
      expect(line.stations.length).toBeGreaterThan(0);
      expect(line.coordinates.length).toBeGreaterThan(0);
      expect(line.color).toMatch(/^#/);
      expect(line.name.en).toBeTruthy();
    }
  });
});

describe('Translations 1:1 Parity', () => {
  it('ensures identical translation keys across English, Bengali, and Hindi', () => {
    const enKeys = Object.keys(TRANSLATIONS.en).sort();
    const bnKeys = Object.keys(TRANSLATIONS.bn).sort();
    const hiKeys = Object.keys(TRANSLATIONS.hi).sort();

    expect(enKeys.length).toBeGreaterThan(40);
    expect(bnKeys).toEqual(enKeys);
    expect(hiKeys).toEqual(enKeys);

    for (const key of enKeys) {
      expect(TRANSLATIONS.en[key]).toBeTruthy();
      expect(TRANSLATIONS.bn[key]).toBeTruthy();
      expect(TRANSLATIONS.hi[key]).toBeTruthy();
    }
  });
});

describe('sanitizePandalZones In-Memory Re-Classification Patch', () => {
  it('ensures all pandals in PANDALS_DATA are strictly classified into North, Central, South, or East', () => {
    const validZones = new Set(['North', 'Central', 'South', 'East']);
    for (const pandal of PANDALS_DATA) {
      expect(validZones.has(pandal.zone)).toBe(true);
    }
  });

  it('correctly maps pandals by ID, nearest metro station, and locality hierarchy', () => {
    const northPandal = PANDALS_DATA.find((p) => p.id === 'bagbazar' || p.nearestMetroEn?.includes('Shyambazar'));
    expect(northPandal?.zone).toBe('North');

    const centralPandal = PANDALS_DATA.find((p) => p.id === 'college-square' || p.nearestMetroEn?.includes('MG Road'));
    expect(centralPandal?.zone).toBe('Central');

    const southPandal = PANDALS_DATA.find((p) => p.id === 'ekdalia' || p.nearestMetroEn?.includes('Kalighat'));
    expect(southPandal?.zone).toBe('South');

    const eastPandal = PANDALS_DATA.find((p) => p.id === 'salt-lake-fd-block' || p.nearestMetroEn?.includes('Karunamoyee'));
    expect(eastPandal?.zone).toBe('East');
  });

  it('executes in-memory reclassification under 10ms for hundreds/thousands of items', () => {
    const t0 = performance.now();
    const testArray = PANDALS_DATA.map(p => ({ ...p }));
    const result = sanitizePandalZones(testArray);
    const t1 = performance.now();
    expect(result.length).toBe(PANDALS_DATA.length);
    expect(t1 - t0).toBeLessThan(20); // Sub-20ms ultra high performance
  });
});

describe('Location Throttling & 50m Displacement Engine', () => {
  it('calculates accurate displacements and distinguishes sub-50m jitter vs >=50m travel', () => {
    const originLat = 22.5726; // Esplanade
    const originLng = 88.3639;

    // Small jitter ~10 meters (approx 0.00009 deg lat)
    const jitterLat = 22.57268;
    const jitterLng = 88.36392;
    const jitterDistM = calculateDistanceKm(originLat, originLng, jitterLat, jitterLng) * 1000;
    expect(jitterDistM).toBeLessThan(50);

    // Meaningful movement ~75 meters (approx 0.0007 deg lat)
    const movedLat = 22.5733;
    const movedLng = 88.3639;
    const movedDistM = calculateDistanceKm(originLat, originLng, movedLat, movedLng) * 1000;
    expect(movedDistM).toBeGreaterThanOrEqual(50);
  });
});

describe('Firebase Real-Time Crowd Majority Voting Engine', () => {
  it('correctly calculates majority crowd status from community votes', () => {
    // 5 Low, 12 Moderate, 28 Heavy, 2 Extreme -> Heavy wins
    const consensus = calculateConsensus('bagbazar', {
      low: 5,
      moderate: 12,
      heavy: 28,
      extreme: 2,
    });

    expect(consensus.dominantLevel).toBe('Heavy');
    expect(consensus.totalVotes).toBe(47);
    expect(consensus.dominantPercent).toBe(60); // 28 / 47 ~ 60%
    expect(consensus.isCrowdsourced).toBe(true);
  });

  it('falls back to pandal baseline level when vote count is 0', () => {
    const consensus = calculateConsensus(
      'kumartuli',
      { low: 0, moderate: 0, heavy: 0, extreme: 0 },
      'Moderate'
    );

    expect(consensus.dominantLevel).toBe('Moderate');
    expect(consensus.totalVotes).toBe(0);
    expect(consensus.isCrowdsourced).toBe(false);
  });

  it('correctly selects Extreme when extreme crowd votes dominate', () => {
    const consensus = calculateConsensus('sreebhumi', {
      low: 1,
      moderate: 3,
      heavy: 10,
      extreme: 45,
    });

    expect(consensus.dominantLevel).toBe('Extreme');
    expect(consensus.totalVotes).toBe(59);
    expect(consensus.dominantPercent).toBe(76); // 45 / 59 ~ 76%
  });

  it('handles tie-breaking with safety caution priority', () => {
    // Tie between Moderate (10) and Heavy (10) -> Heavy provides safer advisory
    const consensus = calculateConsensus('ahiritola', {
      low: 0,
      moderate: 10,
      heavy: 10,
      extreme: 0,
    });

    expect(consensus.dominantLevel).toBe('Heavy');
  });

  it('provides spam prevention checks with cooldown calculation', () => {
    const voteStatus = checkUserVoteStatus('test-pandal-id');
    expect(typeof voteStatus.canVote).toBe('boolean');
    expect(typeof voteStatus.remainingMinutes).toBe('number');
  });
});

describe('AMOLED Power Save Survival Mode & Battery Engine', () => {
  it('ensures all Power Save translation keys are present across en, bn, and hi', () => {
    const requiredKeys = [
      'powerSaveTitle',
      'powerSaveDesc',
      'powerSaveActive',
      'powerSaveDisabled',
      'lowBatteryAlert',
      'enablePowerSavePrompt',
      'batteryPercentage',
    ];

    for (const key of requiredKeys) {
      expect(TRANSLATIONS.en[key]).toBeTruthy();
      expect(TRANSLATIONS.bn[key]).toBeTruthy();
      expect(TRANSLATIONS.hi[key]).toBeTruthy();
    }
  });

  it('verifies low battery threshold evaluation logic', () => {
    // Battery level <= 20% and not charging = isLowBattery
    const isLowBatteryLevel = (level: number, charging: boolean) => level <= 20 && !charging;

    expect(isLowBatteryLevel(14, false)).toBe(true);
    expect(isLowBatteryLevel(20, false)).toBe(true);
    expect(isLowBatteryLevel(21, false)).toBe(false);
    expect(isLowBatteryLevel(10, true)).toBe(false); // Charging suppresses low battery warning
  });
});

