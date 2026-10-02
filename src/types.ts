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
  | 'hospital'
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
  zone?: Zone | string;
  is24x7?: boolean;
  hasBloodBank?: boolean;
  isPaid?: boolean;
  hasDisabledAccess?: boolean;
  operator?: 'KMC' | 'Sulabh' | 'Metro Railway' | string;
  dietaryType?: 'pure-veg' | 'veg-friendly' | 'non-veg';
  cuisineTags?: string[];
  googleMapsUrl?: string;
}

export type MetroLine = 'blue' | 'green' | 'orange' | 'purple' | 'yellow';

export interface MetroLineMeta {
  id: MetroLine;
  code: string;
  name: LocalizedString;
  color: string;
  corridor: LocalizedString;
  stationsCount: number;
  terminalStart: LocalizedString;
  terminalEnd: LocalizedString;
  highlightHaloColor?: string;
}

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

export type SelectedMapItem = Pandal | FacilityPoint | MetroStation;

export interface VisitedPandal {
  pandalId: string;
  timestamp: number;
}

export type FilterType =
  | 'all'
  | 'featured'
  | 'heritage'
  | 'saved'
  | 'north'
  | 'south'
  | 'central'
  | 'saltlake'
  | 'rajarhat'
  | 'dumdum'
  | 'west'
  | 'behala'
  | 'police'
  | 'toilets'
  | 'food'
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

export interface CrowdReport {
  pandalId: string;
  intensity: 'Low' | 'Medium' | 'Heavy' | 'Extreme';
  timestamp: number;
  reportCount?: number;
}

export type CivicPOICategory =
  | 'hospital'
  | 'toilet'
  | 'police'
  | 'ferry'
  | 'railway'
  | 'pure_veg'
  | 'iconic_food';

export interface GeoBoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface BasePOI {
  id: string;
  name: string;
  category: CivicPOICategory;
  coordinates: { lat: number; lng: number };
  zone: Zone | string;
  address: string;
  landmark?: string;
}

export interface HospitalPOI extends BasePOI {
  category: 'hospital';
  emergencyPhone: string;
  bloodBank: boolean;
  is24x7: boolean;
  totalBeds?: number;
}

export interface SanitationPOI extends BasePOI {
  category: 'toilet';
  operator: 'KMC' | 'Sulabh' | 'Metro' | 'Metro Railway' | string;
  fee: number;
  hasDifferentlyAbledAccess: boolean;
  hours?: string;
}

export interface DiningPOI extends BasePOI {
  category: 'pure_veg' | 'iconic_food';
  pureVeg: boolean;
  isLateNight?: boolean;
  cuisine?: string[];
  specialty?: string;
  avgCostForTwo?: number;
  rating?: number;
  priceRange?: 'Budget' | 'Mid' | 'Fine Dining' | string;
}

export type UnifiedPOI = HospitalPOI | SanitationPOI | DiningPOI | (BasePOI & { [key: string]: any });


