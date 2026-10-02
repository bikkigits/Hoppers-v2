import { Pandal, FilterType } from '../types';

export type MicroZoneId =
  | 'central'
  | 'saltlake'
  | 'rajarhat'
  | 'dumdum'
  | 'west'
  | 'behala';

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Strict Rectangular Coordinate Bounding Boxes (Hard Geofences)
 * Zero tolerance for coordinate boundary leakage.
 */
export const ZONE_BOUNDING_BOXES: Record<
  'north' | 'central' | 'south' | 'saltlake' | 'rajarhat' | 'dumdum' | 'west' | 'behala',
  BoundingBox
> = {
  // North Kolkata: Shyambazar, Bagbazar, Sovabazar, Kumartuli, Tala, Cossipore, Ultadanga
  // Strictly east of Hooghly River (lng >= 88.345) and north of lat 22.585
  north: {
    minLat: 22.585,
    maxLat: 22.660,
    minLng: 88.345,
    maxLng: 88.395,
  },

  // Central Kolkata: College Street, Bowbazar, MG Road, Sealdah, Chandni Chowk, Esplanade, BBD Bagh
  // Strictly bounded between North (lat < 22.585) and South (lat >= 22.555), west of EM Bypass fringe (lng <= 88.382)
  central: {
    minLat: 22.555,
    maxLat: 22.585,
    minLng: 88.340,
    maxLng: 88.382,
  },

  // South Kolkata: Gariahat, Ballygunge, Jodhpur Park, Tollygunge, Kalighat, Rashbehari, Jadavpur, Dhakuria, Alipore
  // Strictly south of Central (lat < 22.555) and east of West Kolkata/Howrah (lng >= 88.330)
  south: {
    minLat: 22.450,
    maxLat: 22.555,
    minLng: 88.330,
    maxLng: 88.410,
  },

  // Salt Lake: FD, BJ, AJ, EC, AE Blocks, Bidhannagar, Karunamoyee, Central Park, Sector 1-3
  // Strictly cuts off Lake Town / Baguiati to north (maxLat 22.595) and New Town to east (maxLng 88.435)
  saltlake: {
    minLat: 22.565,
    maxLat: 22.595,
    minLng: 88.395,
    maxLng: 88.435,
  },

  // Rajarhat & New Town: Action Area 1-3, Chinar Park, Eco Park, City Centre 2
  // Strictly bounded corridor east of Salt Lake (lng > 88.435) and excludes Barasat (maxLat 22.635)
  rajarhat: {
    minLat: 22.560,
    maxLat: 22.635,
    minLng: 88.435001,
    maxLng: 88.490,
  },

  // Dum Dum: Dum Dum Park, Nagerbazar, Motijheel, Cantonment, Lake Town, Sreebhumi, Bangur
  // Strictly bounded northern-eastern corridor
  dumdum: {
    minLat: 22.595,
    maxLat: 22.650,
    minLng: 88.375,
    maxLng: 88.435,
  },

  // West Kolkata: Kidderpore, Watgunj, Garden Reach, Hastings, Metiabruz, Mominpur
  // Strictly bounds port corridor; excludes Shibpur / Howrah across the river
  west: {
    minLat: 22.520,
    maxLat: 22.560,
    minLng: 88.290,
    maxLng: 88.335,
  },

  // Behala: Behala Chowrasta, Manton, Parnasree, James Long Sarani, Sakher Bazar, Taratala, Thakurpukur
  // Strictly bounded; excludes Budge Budge and Uluberia to the far west (minLng 88.275)
  behala: {
    minLat: 22.460,
    maxLat: 22.520,
    minLng: 88.275,
    maxLng: 88.335,
  },
};

/**
 * Hard boundary check: Returns true IF AND ONLY IF (lat, lng) strictly lies within the bounding box.
 */
export function isWithinBoundingBox(lat: number, lng: number, box: BoundingBox): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return false;
  }
  return lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng;
}

/**
 * Validates whether a pandal strictly satisfies the hard geofenced bounding box of the specified filter.
 * Under NO circumstance will a pandal pass if its (lat, lng) falls outside the strict numeric range.
 *
 * @param pandal - The pandal object to evaluate
 * @param filter - The active filter key
 * @returns boolean - True if the pandal is within the geofenced boundary
 */
export function matchesPandalFilter(
  pandal: Pandal,
  filter: FilterType,
  visitedList?: { pandalId: string }[]
): boolean {
  // 1. 'all': Return true for all pandals
  if (filter === 'all') {
    return true;
  }

  // 2. Curated Filters
  if (filter === 'featured') {
    return Boolean(pandal.isFeatured);
  }

  if (filter === 'heritage') {
    return Boolean(
      pandal.category?.toLowerCase().includes('heritage') ||
      pandal.theme?.en?.toLowerCase().includes('traditional') ||
      pandal.theme?.en?.toLowerCase().includes('sabeki') ||
      pandal.theme?.en?.toLowerCase().includes('heritage') ||
      pandal.description?.en?.toLowerCase().includes('bonedi') ||
      pandal.highlight?.en?.toLowerCase().includes('heritage')
    );
  }

  if (filter === 'saved') {
    return visitedList ? visitedList.some((v) => v.pandalId === pandal.id) : false;
  }

  // 3. POI / Utility filters do not match pandals directly
  if (
    filter === 'police' ||
    filter === 'toilets' ||
    filter === 'food' ||
    filter === 'railway' ||
    filter === 'ferry'
  ) {
    return false;
  }

  const lat = pandal.lat;
  const lng = pandal.lng;

  // 4. Strict rectangular bounding box evaluation (Hard Geofencing)
  switch (filter) {
    case 'north':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.north);

    case 'central':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.central);

    case 'south':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.south);

    case 'saltlake':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.saltlake);

    case 'rajarhat':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.rajarhat);

    case 'dumdum':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.dumdum);

    case 'west':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.west);

    case 'behala':
      return isWithinBoundingBox(lat, lng, ZONE_BOUNDING_BOXES.behala);

    default:
      return false;
  }
}

/**
 * Returns all matched zone tags for a pandal (for badge display & multifaceted search)
 * strictly verified against hard coordinate geofences.
 */
export function getPandalMatchedZones(pandal: Pandal): string[] {
  const matched: string[] = [];
  if (matchesPandalFilter(pandal, 'north')) matched.push('North');
  if (matchesPandalFilter(pandal, 'south')) matched.push('South');
  if (matchesPandalFilter(pandal, 'central')) matched.push('Central');
  if (matchesPandalFilter(pandal, 'saltlake')) matched.push('Salt Lake');
  if (matchesPandalFilter(pandal, 'rajarhat')) matched.push('Rajarhat');
  if (matchesPandalFilter(pandal, 'dumdum')) matched.push('Dum Dum');
  if (matchesPandalFilter(pandal, 'west')) matched.push('West Kolkata');
  if (matchesPandalFilter(pandal, 'behala')) matched.push('Behala');
  return matched;
}
