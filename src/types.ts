export type Language = 'en' | 'bn' | 'hi';

export type CrowdLevel = 'Low' | 'Moderate' | 'Heavy' | 'Extreme';

export type Zone = 'North' | 'Central' | 'South' | 'East';

export interface LocalizedString {
  en: string;
  bn: string;
  hi: string;
}

export interface Pandal {
  id: string;
  name: LocalizedString;
  zone: Zone;
  lat: number;
  lng: number;
  nearestMetro: string;
  nearestMetroEn: string;
  walkingTimeToMetroMin: number;
  theme: LocalizedString;
  crowdLevel: CrowdLevel;
  facilities: string[];
  description: LocalizedString;
  highlight: LocalizedString;
  exitGateSuggestion?: string;
  isFeatured?: boolean;
  rating?: number;
  category?: string;
  address?: string;
}

export type FacilityCategory =
  | 'police'
  | 'helpdesk'
  | 'toilets'
  | 'metro'
  | 'railway'
  | 'food'
  | 'restaurant'
  | 'ferry'
  | 'medical'
  | 'pharmacy'
  | 'atm'
  | 'parking'
  | 'hotel'
  | 'landmark'
  | 'petrol'
  | 'entry-exit';

export interface FacilityPoint {
  id: string;
  name: LocalizedString;
  category: FacilityCategory;
  lat: number;
  lng: number;
  details: LocalizedString;
  address?: LocalizedString;
  contact?: string;
  hours?: LocalizedString;
  pujaHoursBadge?: string;
  nearPandalId?: string;
}

export type MetroLine = 'blue' | 'green' | 'orange' | 'purple' | 'yellow';

export interface MetroStation {
  id: string;
  name: LocalizedString;
  lines: MetroLine[];
  orderBlue?: number;
  orderGreen?: number;
  orderOrange?: number;
  orderPurple?: number;
  orderYellow?: number;
  isInterchange?: boolean;
  lat: number;
  lng: number;
  exitGates: { gate: string; destination: LocalizedString }[];
  connectingPandals: string[]; // Pandal IDs
}

export interface VisitedPandal {
  pandalId: string;
  timestamp: number;
}

export type FilterType =
  | 'all'
  | 'north'
  | 'south'
  | 'police'
  | 'toilets'
  | 'food'
  | 'metro'
  | 'railway'
  | 'ferry';

export type NavigationTab = 'map' | 'directory' | 'metro' | 'passport';

export interface WalkRoute {
  pandal: Pandal;
  fromCoords: { lat: number; lng: number };
}

export interface MetroMapRoute {
  stations: MetroStation[];
  line: MetroLine | 'interchange';
  coordinates: [number, number][];
}

export interface RouteResult {
  fromStation: MetroStation;
  toStation: MetroStation;
  isDirect: boolean;
  line: MetroLine | 'interchange';
  stationsCount: number;
  estimatedMinutes: number;
  steps: {
    instruction: LocalizedString;
    subtext?: LocalizedString;
    lineBadge?: MetroLine | 'interchange' | 'bypass';
  }[];
  transferStation?: MetroStation;
  hasBypass?: boolean;
  bypassNote?: LocalizedString;
  exitGateAdvice?: { gate: string; destination: LocalizedString }[];
  destinationPandals: Pandal[];
  stationsList?: MetroStation[];
}

export type TravelMode = 'walking' | 'driving' | 'cycling' | 'transit';

export interface TrailStop {
  id: string;
  name: LocalizedString;
  lat: number;
  lng: number;
  pandalId?: string;
  nearestMetro?: string;
  crowdLevel?: CrowdLevel;
  zone?: Zone;
}

export interface CorridorDetourSuggestion {
  pandal: Pandal;
  insertIndex: number;
  perpendicularDistanceKm: number;
  extraDetourKm: number;
  betweenStopA: string;
  betweenStopB: string;
}

export interface CuratedTrailPreset {
  id: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  zone: Zone | 'Iconic';
  badge: string;
  pandalIds: string[];
}

export interface SuggestedPandal {
  id: string;
  name: LocalizedString;
  zone: Zone;
  locality?: string;
  nearestMetro: string;
  nearestMetroEn: string;
  walkingTimeToMetroMin: number;
  lat: number;
  lng: number;
  theme: LocalizedString;
  crowdLevel: CrowdLevel;
  facilities: string[];
  description: LocalizedString;
  highlight: LocalizedString;
  submitterName: string;
  submitterPhone: string;
  submitterEmail?: string;
  status: 'pending' | 'verified';
  createdAt: number;
}

