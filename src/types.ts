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
}

export type FacilityCategory =
  | 'police'
  | 'toilets'
  | 'metro'
  | 'railway'
  | 'food'
  | 'ferry'
  | 'medical'
  | 'parking'
  | 'entry-exit';

export interface FacilityPoint {
  id: string;
  name: LocalizedString;
  category: FacilityCategory;
  lat: number;
  lng: number;
  details: LocalizedString;
  contact?: string;
  nearPandalId?: string;
}

export interface MetroStation {
  id: string;
  name: LocalizedString;
  lines: ('blue' | 'green')[];
  orderBlue?: number;
  orderGreen?: number;
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
  line: 'blue' | 'green' | 'interchange';
  coordinates: [number, number][];
}

export interface RouteResult {
  fromStation: MetroStation;
  toStation: MetroStation;
  isDirect: boolean;
  line: 'blue' | 'green' | 'interchange';
  stationsCount: number;
  estimatedMinutes: number;
  steps: {
    instruction: LocalizedString;
    subtext?: LocalizedString;
    lineBadge?: 'blue' | 'green';
  }[];
  transferStation?: MetroStation;
  exitGateAdvice?: { gate: string; destination: LocalizedString }[];
  destinationPandals: Pandal[];
  stationsList?: MetroStation[];
}
