import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre Web Worker configuration
// Point to the dedicated static worker served from /public/maplibre-gl-worker.mjs
try {
  if (typeof window !== 'undefined') {
    maplibregl.setWorkerUrl('/public/maplibre-gl-worker.mjs');
  }
} catch {
  // Ignore fallback if already set
}
import {
  Pandal,
  FacilityPoint,
  FacilityCategory,
  MetroStation,
  MetroLine,
  FilterType,
  Language,
  VisitedPandal,
  WalkRoute,
  MetroMapRoute,
  TrailStop,
  SuggestedPandal,
  SelectedMapItem,
  BusDiversion,
} from '../types';
import {
  PANDALS_DATA,
  CRITICAL_FACILITIES,
  METRO_STATIONS,
} from '../data/mockData';
import { TRANSIT_HUBS } from '../data/transitHubsData';
import { METRO_LINES, getLineStations } from '../data/metroStations';
import { TRANSLATIONS } from '../data/translations';
import {
  formatDistance,
  estimateWalkingMinutes,
  calculateDistanceKm,
  calculateCrowdWalkingEta,
  clampToKolkata,
  ESPLANADE_CENTER,
} from '../utils/geo';
import {
  subscribeAllPandalCrowds,
  PandalCrowdRecord,
} from '../services/firebaseCrowd';
import { usePowerSave } from '../context/PowerSaveContext';
import { useFilters } from '../context/FilterContext';
import { NearbyFilterBar } from './NearbyFilterBar';
import { MetroLegend } from './MetroLegend';
import { matchesPandalFilter } from '../utils/pandalClassification';
import { useThrottledLocation } from '../hooks/useThrottledLocation';
import {
  Crosshair,
  Compass,
  Plus,
  Minus,
  X,
  Route,
  Train,
  Search,
  Navigation,
} from 'lucide-react';

// Premium MapTiler Dataviz Dark Vector Style (Deep dark canvas, distinct water bodies & roads, zoom POIs)
const MAPTILER_DARK_STYLE_URL =
  'https://api.maptiler.com/maps/dataviz-dark/style.json?key=CgynQqvDEVTkha4abnCw';

// Create a GeoJSON polygon approximation for circular radius (in meters)
function createCircleGeoJSON(center: [number, number], radiusInMeters: number, points = 64): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const [lng, lat] = center;
  const km = radiusInMeters / 1000;
  const distanceLat = km / 110.574;
  const distanceLng = km / (111.32 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceLng * Math.cos(theta);
    const y = distanceLat * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  coords.push(coords[0]); // close polygon

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
    properties: {},
  };
}



// Clean, small, minimalist vector circle icons with glyphs inside (matching video aesthetic)
function registerMinimalistMapIcons(map: maplibregl.Map) {
  const iconConfigs: {
    id: string;
    bgColor: string;
    drawGlyph: (ctx: CanvasRenderingContext2D, center: number) => void;
  }[] = [
    {
      id: 'icon-toilets',
      bgColor: '#10B981',
      drawGlyph: (ctx, center) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WC', center, center + 0.5);
      },
    },
    {
      id: 'icon-hospital',
      bgColor: '#F43F5E',
      drawGlyph: (ctx, center) => {
        ctx.fillStyle = '#FFFFFF';
        const w = 4.5;
        const len = 15;
        ctx.fillRect(center - w / 2, center - len / 2, w, len);
        ctx.fillRect(center - len / 2, center - w / 2, len, w);
      },
    },
    {
      id: 'icon-police',
      bgColor: '#EF4444',
      drawGlyph: (ctx, center) => {
        ctx.beginPath();
        ctx.moveTo(center, center - 8.5);
        ctx.lineTo(center + 7.5, center - 4.5);
        ctx.lineTo(center + 7.5, center + 1.5);
        ctx.quadraticCurveTo(center + 6.5, center + 8, center, center + 10.5);
        ctx.quadraticCurveTo(center - 6.5, center + 8, center - 7.5, center + 1.5);
        ctx.lineTo(center - 7.5, center - 4.5);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(center, center + 0.5, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.fill();
      },
    },
    {
      id: 'icon-food',
      bgColor: '#F59E0B',
      drawGlyph: (ctx, center) => {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(center - 4.5, center - 7);
        ctx.lineTo(center - 4.5, center + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(center - 4.5, center - 3, 2.5, Math.PI, 0, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(center + 4.5, center - 7);
        ctx.lineTo(center + 4.5, center + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(center + 4.5, center - 4.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      },
    },
    {
      id: 'icon-parking',
      bgColor: '#3B82F6',
      drawGlyph: (ctx, center) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 18px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', center + 0.5, center);
      },
    },
    {
      id: 'icon-railway',
      bgColor: '#7C3AED',
      drawGlyph: (ctx, center) => {
        ctx.beginPath();
        ctx.roundRect(center - 6.5, center - 8, 13, 14.5, [3, 3, 1.5, 1.5]);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.fillStyle = '#7C3AED';
        ctx.fillRect(center - 5, center - 6, 10, 4.5);
        ctx.beginPath();
        ctx.arc(center - 3.2, center + 2.5, 1.2, 0, Math.PI * 2);
        ctx.arc(center + 3.2, center + 2.5, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#7C3AED';
        ctx.fill();
      },
    },
    {
      id: 'icon-ferry',
      bgColor: '#06B6D4',
      drawGlyph: (ctx, center) => {
        ctx.beginPath();
        ctx.moveTo(center - 8, center + 0.5);
        ctx.lineTo(center + 8, center + 0.5);
        ctx.lineTo(center + 5.5, center + 6.5);
        ctx.lineTo(center - 5.5, center + 6.5);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.fillRect(center - 4, center - 6, 8, 5);
        ctx.fillStyle = '#06B6D4';
        ctx.fillRect(center - 2.5, center - 4.5, 5, 2.5);
      },
    },
    {
      id: 'icon-bus',
      bgColor: '#0284C7',
      drawGlyph: (ctx, center) => {
        ctx.beginPath();
        ctx.roundRect(center - 6, center - 7.5, 12, 13.5, [2.5, 2.5, 1, 1]);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(center - 4.5, center - 5.5, 9, 4);
        ctx.beginPath();
        ctx.arc(center - 3, center + 2.5, 1.1, 0, Math.PI * 2);
        ctx.arc(center + 3, center + 2.5, 1.1, 0, Math.PI * 2);
        ctx.fillStyle = '#0284C7';
        ctx.fill();
      },
    },
  ];

  const size = 44;
  iconConfigs.forEach(({ id, bgColor, drawGlyph }) => {
    if (map.hasImage(id)) return;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const center = size / 2;
    const radius = size / 2 - 2.5;

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();

    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    drawGlyph(ctx, center);

    const imgData = ctx.getImageData(0, 0, size, size);
    map.addImage(id, { width: size, height: size, data: imgData.data }, { pixelRatio: 2 });
  });
}

interface Props {
  language: Language;
  onSelectPandal: (pandal: Pandal) => void;
  onSelectFacility: (facility: FacilityPoint) => void;
  onSelectStation?: (station: MetroStation) => void;
  userCoords: { lat: number; lng: number } | null;
  onUserCoordsChange: (coords: { lat: number; lng: number } | null) => void;
  visitedList: VisitedPandal[];
  activeWalkRoute?: WalkRoute | null;
  onClearWalkRoute?: () => void;
  activeMetroRoute?: MetroMapRoute | null;
  onClearMetroRoute?: () => void;
  activeBusDiversion?: BusDiversion | null;
  onClearBusDiversion?: () => void;
  trailStops?: TrailStop[];
  onOpenTrailBuilder?: () => void;
  onOpenSuggestPandal?: () => void;
  suggestedPandals?: SuggestedPandal[];
  selectedItem?: SelectedMapItem | null;
  isActiveTab?: boolean;
}

export const MapView: React.FC<Props> = ({
  language,
  onSelectPandal,
  onSelectFacility,
  onSelectStation,
  userCoords,
  onUserCoordsChange,
  visitedList,
  activeWalkRoute,
  onClearWalkRoute,
  activeMetroRoute,
  onClearMetroRoute,
  activeBusDiversion,
  onClearBusDiversion,
  trailStops,
  onOpenTrailBuilder,
  onOpenSuggestPandal,
  suggestedPandals = [],
  selectedItem,
  isActiveTab = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const utilityMarkersRef = useRef<maplibregl.Marker[]>([]);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);
  const isMapLoadedRef = useRef<boolean>(false);

  // Throttled GPS coordinates (50m displacement filter + bounding box clamp)
  const throttledCoords = useThrottledLocation(userCoords, 50, null);

  const prevNonMetroFilterRef = useRef<FilterType>('all');
  
  // Point 1 & 2: Global filter synchronization across Map and Pandal List
  const {
    zoneFilter,
    setZoneFilter,
    poiFilter,
    setPoiFilter,
    activeUtility,
    setActiveUtility,
    clearUtilityFilter,
    clearZoneFilter,
  } = useFilters();

  const [isFilterTrayExpanded, setIsFilterTrayExpanded] = useState(false);

  // Unified active filter: If activeUtility is set, use it; otherwise use zoneFilter
  const activeFilter: FilterType = activeUtility ? activeUtility : zoneFilter;
  const { isPowerSaveMode } = usePowerSave();
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [crowdConsensusMap, setCrowdConsensusMap] = useState<Map<string, PandalCrowdRecord>>(new Map());

  // Handle tab reactivation without tearing down WebGL canvas (Point 7)
  useEffect(() => {
    if (isActiveTab && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.resize();
      }, 50);
    }
  }, [isActiveTab]);

  // Subscribe to all pandals crowd consensus updates
  useEffect(() => {
    const unsubscribe = subscribeAllPandalCrowds((records) => {
      setCrowdConsensusMap(new Map(records));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const [mapCenterCoords, setMapCenterCoords] = useState<{ lat: number; lng: number }>({
    lat: ESPLANADE_CENTER.lat,
    lng: ESPLANADE_CENTER.lng,
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Effective reference coordinates for Haversine proximity calculations
  const effectiveCoords = useMemo(() => {
    if (throttledCoords) return throttledCoords;
    return mapCenterCoords;
  }, [throttledCoords, mapCenterCoords]);

  // Dedicated Metro state (toggled via HUD button or Metro tab)
  const [isMetroActive, setIsMetroActive] = useState(false);
  const [isolatedLine, setIsolatedLine] = useState<MetroLine | null>(null);
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  const t = TRANSLATIONS[language];

  // Track current map zoom level for smooth dynamic UX
  const [currentZoom, setCurrentZoom] = useState<number>(13);

  // Helper to test if active filter is a critical civic utility layer (excluding decoupled transit infrastructure)
  const isUtilityActive =
    activeFilter === 'police' ||
    activeFilter === 'toilets' ||
    activeFilter === 'food' ||
    activeFilter === 'hospital' ||
    activeFilter === 'parking';

  // Synchronized Metro rail toggle handler
  const handleToggleMetro = () => {
    setIsMetroActive((prev) => !prev);
    if (isMetroActive) {
      setIsolatedLine(null);
    } else {
      setIsLegendExpanded(true);
    }
  };

  // 10,492 Civic Utilities & 400 Parking Spots extracted from public/hoppers_master.db
  const [poiFeatures, setPoiFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetch('/Hoppers_2026_POIs.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch POIs');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.features)) {
          setPoiFeatures(data.features);
        }
      })
      .catch((err) => {
        console.warn('[Hoppers 2026] Could not load Hoppers_2026_POIs.geojson:', err);
      });
  }, []);

  // Check if a pandal is actively selected
  const isPandalSelected = Boolean(
    selectedItem &&
    'lat' in selectedItem &&
    'lng' in selectedItem &&
    typeof (selectedItem as any).lat === 'number' &&
    typeof (selectedItem as any).lng === 'number' &&
    ('zone' in selectedItem || 'nearestMetro' in selectedItem || 'crowdLevel' in selectedItem)
  );

  // Strict 500m Live Lock only applies when a specific pandal is selected, or when user has GPS locked nearby
  const isTargetLocked = isPandalSelected || Boolean(throttledCoords && activeFilter === 'nearby');

  // Proximity reference coordinates for Haversine distance calculations
  const proximityReferenceCoords = useMemo<{ lat: number; lng: number }>(() => {
    if (isPandalSelected) {
      return { lat: (selectedItem as any).lat, lng: (selectedItem as any).lng };
    }
    if (throttledCoords) {
      return throttledCoords;
    }
    return mapCenterCoords;
  }, [isPandalSelected, selectedItem, throttledCoords, mapCenterCoords]);

  // Intercept category filter selection from NearbyFilterBar (Point 1 & Point 2)
  const handleFilterChange = (newFilter: FilterType) => {
    prevNonMetroFilterRef.current = newFilter;
    setIsolatedLine(null);

    const isUtil =
      newFilter === 'police' ||
      newFilter === 'toilets' ||
      newFilter === 'food' ||
      newFilter === 'hospital' ||
      newFilter === 'parking' ||
      newFilter === 'railway' ||
      newFilter === 'ferry';

    if (isUtil) {
      setActiveUtility(newFilter);
      setPoiFilter(newFilter);
    } else {
      setZoneFilter(newFilter);
      setActiveUtility(null);
      setPoiFilter('all');
    }

    // Smoothly pan to zone centers when micro-zone filter is tapped
    const map = mapInstanceRef.current;
    if (map) {
      if (newFilter === 'railway') {
        map.flyTo({ center: [88.3450, 22.5830], zoom: 13.5, duration: 1000 });
        return;
      }
      if (newFilter === 'ferry') {
        map.flyTo({ center: [88.3420, 22.5750], zoom: 14.2, duration: 1000 });
        return;
      }

      const zoneCenters: Partial<Record<FilterType, { lat: number; lng: number; zoom: number }>> = {
        all: { lat: 22.5697, lng: 88.3516, zoom: 13 },
        north: { lat: 22.5991, lng: 88.3683, zoom: 14 },
        south: { lat: 22.5200, lng: 88.3550, zoom: 14 },
        central: { lat: 22.5680, lng: 88.3620, zoom: 14 },
        saltlake: { lat: 22.5850, lng: 88.4150, zoom: 14 },
        rajarhat: { lat: 22.6100, lng: 88.4550, zoom: 14 },
        saltlake_rajarhat: { lat: 22.5920, lng: 88.4350, zoom: 13.5 },
        newtown: { lat: 22.5780, lng: 88.4800, zoom: 14.2 },
        dumdum: { lat: 22.6250, lng: 88.4000, zoom: 14 },
        west: { lat: 22.5350, lng: 88.3150, zoom: 14 },
        behala: { lat: 22.4950, lng: 88.3150, zoom: 14 },
      };

      const target = zoneCenters[newFilter];
      if (target) {
        map.flyTo({ center: [target.lng, target.lat], zoom: target.zoom, duration: 1000 });
      }
    }
  };

  // Search Results for map search bar
  const searchResults = useMemo(() => {
    if (!mapSearchQuery.trim()) return [];
    const query = mapSearchQuery.toLowerCase();
    return PANDALS_DATA.filter((pandal) => {
      const nameMatch =
        pandal.name.en.toLowerCase().includes(query) ||
        pandal.name.bn.toLowerCase().includes(query) ||
        pandal.name.hi.toLowerCase().includes(query);
      const metroMatch =
        pandal.nearestMetro.toLowerCase().includes(query) ||
        pandal.nearestMetroEn.toLowerCase().includes(query);
      const zoneMatch = pandal.zone.toLowerCase().includes(query);
      const themeMatch =
        pandal.theme.en.toLowerCase().includes(query) ||
        pandal.theme.bn.toLowerCase().includes(query);
      return nameMatch || metroMatch || zoneMatch || themeMatch;
    });
  }, [mapSearchQuery]);

  // Map Transit Hubs into FacilityPoint structure for unified rendering
  const transitHubFacilities = useMemo<FacilityPoint[]>(() => {
    return TRANSIT_HUBS.map((h) => ({
      id: h.id,
      name: { en: h.name, bn: h.name, hi: h.name },
      category: (h.category === 'ferry' ? 'ferry' : 'railway') as any,
      lat: h.lat,
      lng: h.lng,
      address: { en: h.connectingZones, bn: h.connectingZones, hi: h.connectingZones },
      details: { en: `${h.type} • ${h.travelTip}`, bn: `${h.type} • ${h.travelTip}`, hi: `${h.type} • ${h.travelTip}` },
      pujaHoursBadge: h.operator,
    }));
  }, []);

  // Active Civic Utilities / Parking POIs (Smart 500m Live Lock when locked, citywide at minzoom: 15 when unlocked)
  const activePoiFacilities = useMemo<{ facility: FacilityPoint; isLocked: boolean; distM: number }[]>(() => {
    if (!isUtilityActive) return [];

    const refLat = proximityReferenceCoords.lat;
    const refLng = proximityReferenceCoords.lng;

    let pool: FacilityPoint[] = [];

    if (poiFeatures.length > 0) {
      // Filter from extracted 10,892 POI features
      const matchingFeatures = poiFeatures.filter((f) => {
        const cat = f.properties?.category;
        if (activeFilter === 'toilets') return cat === 'toilets' || cat === 'toilet';
        if (activeFilter === 'hospital') return cat === 'hospital' || cat === 'medical';
        if (activeFilter === 'police') return cat === 'police' || cat === 'helpdesk';
        if (activeFilter === 'food') return cat === 'food' || cat === 'restaurant';
        if (activeFilter === 'parking') return cat === 'parking';
        return false;
      });

      pool = matchingFeatures.map((f) => {
        const p = f.properties || {};
        const coords = (f.geometry as GeoJSON.Point).coordinates;
        const lat = coords[1];
        const lng = coords[0];
        const cat = (p.category || 'toilets') as FacilityCategory;
        const isParking = p.category === 'parking';
        return {
          id: p.id || String(f.id),
          name: { en: p.name, bn: p.name, hi: p.name },
          category: cat,
          lat,
          lng,
          address: { en: p.address || '', bn: p.address || '', hi: p.address || '' },
          details: {
            en: isParking ? `Capacity: ${p.capacity || 50} vehicles • ${p.fee_type || 'KMC Authorized'}` : (p.address || ''),
            bn: isParking ? `Capacity: ${p.capacity || 50} vehicles • ${p.fee_type || 'KMC Authorized'}` : (p.address || ''),
            hi: isParking ? `Capacity: ${p.capacity || 50} vehicles • ${p.fee_type || 'KMC Authorized'}` : (p.address || ''),
          },
          pujaHoursBadge: cat === 'hospital' ? '24x7 Emergency' : isParking ? `${p.capacity || 50} Lots` : 'Puja 24x7',
          is24x7: cat === 'hospital' || cat === 'police',
        };
      });
    }

    if (pool.length === 0) {
      // Fallback while GeoJSON is loading
      const fallback = CRITICAL_FACILITIES.filter((f) => {
        if (activeFilter === 'toilets') return f.category === 'toilets';
        if (activeFilter === 'hospital') return f.category === 'hospital' || f.category === 'medical';
        if (activeFilter === 'police') return f.category === 'police';
        if (activeFilter === 'food') return f.category === 'food' || f.category === 'restaurant';
        if (activeFilter === 'parking') return f.category === 'parking';
        return false;
      });
      pool = fallback;
    }

    const withDist = pool.map((facility) => {
      const distKm = calculateDistanceKm(refLat, refLng, facility.lat, facility.lng);
      const distM = distKm * 1000;
      return { facility, distKm, distM };
    });

    withDist.sort((a, b) => a.distM - b.distM);

    if (isTargetLocked) {
      // Pandal or GPS selected: Apply strict 500m radius 'Live Lock'
      const within500m = withDist.filter((item) => item.distM <= 500);
      const finalSelection = within500m.length > 0 ? within500m.slice(0, 35) : withDist.filter((i) => i.distM <= 1500).slice(0, 6);
      return finalSelection.map((item) => ({ facility: item.facility, isLocked: true, distM: item.distM }));
    } else {
      // NO pandal selected: Show all POIs of this category across map bounds (visible at minzoom: 15)
      return withDist.map((item) => ({ facility: item.facility, isLocked: false, distM: item.distM }));
    }
  }, [isUtilityActive, poiFeatures, activeFilter, isTargetLocked, proximityReferenceCoords]);

  // Proximity Summary for Active Utility Filter
  const closestUtilitySummary = useMemo(() => {
    if (!isUtilityActive || activePoiFacilities.length === 0) return null;

    const closest = activePoiFacilities[0];
    const eta = calculateCrowdWalkingEta(closest.distM);

    const distBadge = isTargetLocked
      ? (closest.distM < 1000
          ? `${Math.round(closest.distM)}m • ${eta.text}`
          : `${(closest.distM / 1000).toFixed(1)} km • ${eta.text}`)
      : (currentZoom >= 15
          ? `${Math.round(closest.distM)}m away • ${eta.text}`
          : 'Zoom in (lvl 15) to reveal');

    return {
      totalCount: activePoiFacilities.length,
      isLocked: isTargetLocked,
      closest: closest.facility,
      distanceBadge: distBadge,
      googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${closest.facility.lat},${closest.facility.lng}`,
    };
  }, [isUtilityActive, activePoiFacilities, isTargetLocked, currentZoom]);

  // Build GeoJSON dataset for pandals (pandals NEVER disappear when utility filters are active!)
  const pandalsGeoJSON = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(() => {
    if (isMetroActive) {
      return { type: 'FeatureCollection', features: [] };
    }

    // When utility filter is active, pandals display according to the active micro-zone or 'all'
    const effectivePandalFilter: FilterType = isUtilityActive
      ? (prevNonMetroFilterRef.current && !['police', 'toilets', 'food', 'hospital', 'parking', 'railway', 'ferry'].includes(prevNonMetroFilterRef.current)
          ? prevNonMetroFilterRef.current
          : 'all')
      : activeFilter;

    const visitedSet = new Set(visitedList.map((v) => v.pandalId));

    const filtered = PANDALS_DATA.filter((pandal) => {
      if (mapSearchQuery.trim()) {
        const q = mapSearchQuery.toLowerCase();
        const nameMatch =
          pandal.name.en.toLowerCase().includes(q) ||
          pandal.name.bn.toLowerCase().includes(q) ||
          pandal.name.hi.toLowerCase().includes(q);
        const metroMatch =
          pandal.nearestMetro.toLowerCase().includes(q) ||
          pandal.nearestMetroEn.toLowerCase().includes(q);
        const zoneMatch = pandal.zone.toLowerCase().includes(q);
        if (!nameMatch && !metroMatch && !zoneMatch) return false;
      }

      const isMatchedByFilter = matchesPandalFilter(pandal, effectivePandalFilter, visitedList);
      if (!isMatchedByFilter) return false;

      // Dynamic Live Lock: highlight within 1km when nearby active
      if (throttledCoords && effectivePandalFilter === 'nearby') {
        const distKm = calculateDistanceKm(throttledCoords.lat, throttledCoords.lng, pandal.lat, pandal.lng);
        if (distKm > 1.0) return false;
      }

      return true;
    });

    const features: GeoJSON.Feature<GeoJSON.Point>[] = filtered.map((p) => {
      const isVisited = visitedSet.has(p.id);
      const consensus = crowdConsensusMap.get(p.id);
      const effectiveCrowd = consensus?.dominantLevel || p.crowdLevel;

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
        properties: {
          id: p.id,
          name: p.name[language] || p.name.en,
          zone: p.zone,
          theme: p.theme[language] || p.theme.en,
          crowdLevel: effectiveCrowd,
          isFeatured: !!p.isFeatured,
          isVisited,
          category: p.category || 'Traditional',
          pandalJson: JSON.stringify(p),
        },
      };
    });

    // Add Community Pandals
    if (suggestedPandals && suggestedPandals.length > 0) {
      suggestedPandals.forEach((sp) => {
        if (!matchesPandalFilter(sp as unknown as Pandal, effectivePandalFilter)) return;
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [sp.lng, sp.lat],
          },
          properties: {
            id: sp.id,
            name: `[Community] ${sp.name[language] || sp.name.en}`,
            zone: 'Community',
            theme: 'Community Puja',
            crowdLevel: 'Moderate',
            isFeatured: true,
            isVisited: false,
            category: 'Community',
            pandalJson: JSON.stringify(sp),
          },
        });
      });
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }, [
    isMetroActive,
    isUtilityActive,
    activeFilter,
    mapSearchQuery,
    visitedList,
    throttledCoords,
    language,
    crowdConsensusMap,
    suggestedPandals,
  ]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_DARK_STYLE_URL,
      center: [ESPLANADE_CENTER.lng, ESPLANADE_CENTER.lat],
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      attributionControl: false,
    });

    // Error listener: Log cleanly without circular event crash
    let hasSwitchedToFallback = false;
    map.on('error', (e) => {
      const errMsg = e?.error?.message || (typeof e?.error === 'string' ? e.error : '') || '';
      const status = (e as any)?.status;
      if (import.meta.env.DEV && errMsg) {
        console.warn(`[MapLibre Event] ${errMsg} (status: ${status || 'N/A'})`);
      }
      // ONLY switch to fallback if style genuinely failed to load (401 or 403 or style fetch failure)
      if (!hasSwitchedToFallback && (errMsg.includes('style') || status === 401 || status === 403)) {
        hasSwitchedToFallback = true;
        console.warn('[MapLibre] MapTiler style unavailable, switching to dark vector fallback');
        try {
          map.setStyle('https://tiles.openfreemap.org/styles/dark');
        } catch (err) {
          console.warn('[MapLibre Fallback Error]', (err as Error)?.message || err);
        }
      }
    });

    // Idempotent setup of icons, vector overrides, sources, and layers
    const setupCustomLayers = () => {
      if (!map.isStyleLoaded()) return;

      // Register clean SVG circular vector icons
      registerMinimalistMapIcons(map);

      // 0. Water Layer Override to Deep Blue/Cyan (#061B2E) for River Hooghly
      try {
        const style = map.getStyle();
        if (style && style.layers) {
          style.layers.forEach((layer) => {
            if (
              layer.type === 'fill' &&
              (layer.id.includes('water') ||
                (layer as any)['source-layer'] === 'water' ||
                layer.id === 'water' ||
                layer.id === 'waterway')
            ) {
              try {
                map.setPaintProperty(layer.id, 'fill-color', '#061B2E');
              } catch (_) {}
            }
          });
        }
      } catch (_) {}

      // 0.2 Bus Network GeoJSON Source & Layers (160 Routes & 880 Stops)
      if (!map.getSource('bus-network')) {
        map.addSource('bus-network', {
          type: 'geojson',
          data: '/Hoppers_2026_BusRoutes.geojson',
        });
      }

      // Bus Stop icons: Minimalist circular SVG icon (matching reference video), strictly visible at high zoom (minzoom: 15)
      map.addLayer({
        id: 'bus-stops-symbol',
        type: 'symbol',
        source: 'bus-network',
        filter: ['==', ['get', 'category'], 'bus_stop'],
        minzoom: 15,
        layout: {
          'icon-image': 'icon-bus',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0.6,
            16,
            0.75,
            18,
            0.95,
          ],
          'icon-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-size': 9,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'icon-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0.8,
            15.5,
            1.0,
          ],
          'text-color': '#E0F2FE',
          'text-halo-color': '#080B11',
          'text-halo-width': 1.5,
        },
      });

      // 0.3 Permanent Map Infrastructure: Railway Stations & Ferry Ghats (Decoupled from utilities, permanent map layers)
      map.addSource('transit-infrastructure', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: TRANSIT_HUBS.map((h) => ({
            type: 'Feature',
            id: h.id,
            geometry: {
              type: 'Point',
              coordinates: [h.lng, h.lat],
            },
            properties: {
              id: h.id,
              name: h.name,
              category: h.category === 'ferry' ? 'ferry' : 'railway',
              iconId: h.category === 'ferry' ? 'icon-ferry' : 'icon-railway',
              hubType: h.type,
              operator: h.operator,
              connectingZones: h.connectingZones,
              travelTip: h.travelTip,
            },
          })),
        },
      });

      // Railway Stations (Permanent Infrastructure, minzoom: 13, clean minimalist SVG icon)
      map.addLayer({
        id: 'railway-stations-symbol',
        type: 'symbol',
        source: 'transit-infrastructure',
        filter: ['==', ['get', 'category'], 'railway'],
        minzoom: 13,
        layout: {
          'icon-image': 'icon-railway',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13,
            0.7,
            15,
            0.85,
            17,
            1.0,
          ],
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-size': 9.5,
          'text-offset': [0, 1.35],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'icon-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13,
            0.85,
            14,
            1.0,
          ],
          'text-color': '#EDE9FE',
          'text-halo-color': '#080B11',
          'text-halo-width': 2,
        },
      });

      // Ferry Ghats (Permanent Infrastructure, minzoom: 14, strictly anchored in river water #061B2E)
      map.addLayer({
        id: 'ferry-ghats-symbol',
        type: 'symbol',
        source: 'transit-infrastructure',
        filter: ['==', ['get', 'category'], 'ferry'],
        minzoom: 14,
        layout: {
          'icon-image': 'icon-ferry',
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0.75,
            16,
            0.9,
            18,
            1.05,
          ],
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-size': 9.5,
          'text-offset': [0, 1.35],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'icon-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0.85,
            15,
            1.0,
          ],
          'text-color': '#CFFAFE',
          'text-halo-color': '#061B2E',
          'text-halo-width': 2,
        },
      });

      // 0.4 Civic Utilities & Parking POIs (Smart 500m Live Lock or citywide minzoom: 15)
      map.addSource('civic-pois', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Minimalist, clean circular SVG vector markers (split into locked 500m & macro views for spec compliance)
      // 0.4a Locked Facilities within 500m of Selected Pandal (visible from zoom 12+)
      map.addLayer({
        id: 'civic-pois-locked-symbol',
        type: 'symbol',
        source: 'civic-pois',
        filter: ['==', ['get', 'isLocked'], true],
        minzoom: 12,
        layout: {
          'icon-image': ['get', 'iconId'],
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            0.65,
            14,
            0.8,
            17,
            1.0,
          ],
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-size': 9.5,
          'text-offset': [0, 1.35],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'icon-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            0.85,
            13,
            1.0,
          ],
          'text-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12.5,
            0,
            13.5,
            0.95,
          ],
          'text-color': '#F1F5F9',
          'text-halo-color': '#080B11',
          'text-halo-width': 2,
        },
      });

      // 0.4b Macro Civic Facilities across Kolkata (strictly visible at high zoom: minzoom 15, matching video)
      map.addLayer({
        id: 'civic-pois-macro-symbol',
        type: 'symbol',
        source: 'civic-pois',
        filter: ['==', ['get', 'isLocked'], false],
        minzoom: 15,
        layout: {
          'icon-image': ['get', 'iconId'],
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0.65,
            16,
            0.8,
            18,
            1.0,
          ],
          'icon-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-size': 9.5,
          'text-offset': [0, 1.35],
          'text-anchor': 'top',
          'text-optional': true,
        },
        paint: {
          'icon-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0.85,
            15.5,
            1.0,
          ],
          'text-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15.2,
            0,
            15.6,
            0.95,
          ],
          'text-color': '#F1F5F9',
          'text-halo-color': '#080B11',
          'text-halo-width': 2,
        },
      });

      // 1. Live Lock Radius Source & Layer (1km Pandals / 500m Utilities)
      map.addSource('live-lock-radius', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'live-lock-radius-fill',
        type: 'fill',
        source: 'live-lock-radius',
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': 0.1,
        },
      });

      map.addLayer({
        id: 'live-lock-radius-stroke',
        type: 'line',
        source: 'live-lock-radius',
        paint: {
          'line-color': '#60A5FA',
          'line-width': 1.5,
          'line-dasharray': [4, 4],
          'line-opacity': 0.8,
        },
      });

      // 2. Metro Lines GeoJSON Source & Layers (Hidden by default, activated via Metro HUD toggle)
      map.addSource('metro-lines', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'metro-lines-casing',
        type: 'line',
        source: 'metro-lines',
        layout: {
          visibility: 'none',
        },
        paint: {
          'line-color': '#020617',
          'line-width': ['get', 'casingWidth'],
          'line-opacity': ['get', 'casingOpacity'],
        },
      });

      map.addLayer({
        id: 'metro-lines-core',
        type: 'line',
        source: 'metro-lines',
        layout: {
          visibility: 'none',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-opacity': ['get', 'opacity'],
          'line-dasharray': ['case', ['boolean', ['get', 'isDashed'], false], ['literal', [2, 2]], ['literal', [1, 0]]],
        },
      });

      // 3. Active Routes Source & Layers (Walking, Metro, Bus Diversion, Multi-Stop Trail)
      map.addSource('active-routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'active-routes-glow',
        type: 'line',
        source: 'active-routes',
        paint: {
          'line-color': ['get', 'glowColor'],
          'line-width': 8,
          'line-opacity': 0.35,
          'line-blur': 3,
        },
      });

      map.addLayer({
        id: 'active-routes-core',
        type: 'line',
        source: 'active-routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4.5,
          'line-opacity': 0.95,
          'line-dasharray': ['case', ['boolean', ['get', 'isDashed'], false], ['literal', [2, 2]], ['literal', [1, 0]]],
        },
      });

      // 4. Native Supercluster Pandals GeoJSON Source (Cluster radius reduced to 45 for crisp macro grouping)
      map.addSource('pandals', {
        type: 'geojson',
        data: pandalsGeoJSON,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45,
      });

      // Cluster Outer Glow (Max 30px radius to never occlude city geometry)
      map.addLayer({
        id: 'pandal-clusters-glow',
        type: 'circle',
        source: 'pandals',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#F59E0B',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10,
            22,
            30,
            26,
            75,
            30,
          ],
          'circle-opacity': 0.25,
          'circle-blur': 0.6,
        },
      });

      // Cluster Circle Layer (Amber/Gold step gradient with crisp #FEF3C7 border)
      map.addLayer({
        id: 'pandal-clusters',
        type: 'circle',
        source: 'pandals',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#F59E0B', // < 10
            10,
            '#D97706', // 10-29
            30,
            '#B45309', // 30-74
            75,
            '#EA580C', // 75+
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FEF3C7',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            16,
            10,
            20,
            30,
            24,
            75,
            28,
          ],
          'circle-opacity': 0.95,
        },
      });

      // Cluster PUJAS Count Text Layer
      map.addLayer({
        id: 'pandal-cluster-count',
        type: 'symbol',
        source: 'pandals',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          'text-size': 13,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      // Cluster "PUJAS" Sub-Label
      map.addLayer({
        id: 'pandal-cluster-label',
        type: 'symbol',
        source: 'pandals',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': 'PUJAS',
          'text-size': 7.5,
          'text-offset': [0, 1.2],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#FEF3C7',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });

      // Unclustered Single Pandal Pin Glow
      map.addLayer({
        id: 'pandal-unclustered-glow',
        type: 'circle',
        source: 'pandals',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#F59E0B',
          'circle-radius': 14,
          'circle-opacity': 0.35,
          'circle-blur': 0.5,
        },
      });

      // Unclustered Single Pandal Pin Circle
      map.addLayer({
        id: 'pandal-unclustered',
        type: 'circle',
        source: 'pandals',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['boolean', ['get', 'isVisited'], false],
            '#64748B',
            ['boolean', ['get', 'isFeatured'], false],
            '#F59E0B',
            '#FBBF24',
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // Unclustered Single Pandal Label
      map.addLayer({
        id: 'pandal-unclustered-label',
        type: 'symbol',
        source: 'pandals',
        filter: ['!', ['has', 'point_count']],
        minzoom: 13.5,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
          'text-max-width': 8,
          'text-line-height': 1.15,
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#080B11',
          'text-halo-width': 2,
        },
      });

      // Cluster Tap Handler -> Smooth Expansion (map.easeTo)
      map.on('click', 'pandal-clusters', (e: any) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['pandal-clusters'] });
        const clusterId = features[0]?.properties?.cluster_id;
        if (clusterId == null) return;

        const source = map.getSource('pandals') as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          const geom = features[0].geometry;
          if (geom.type === 'Point') {
            map.easeTo({
              center: geom.coordinates as [number, number],
              zoom: Math.min(zoom + 0.5, 17),
              duration: 500,
            });
          }
        }).catch((err) => {
          console.warn('Error expanding cluster:', err);
        });
      });

      // Unclustered Single Pandal Pin Tap -> Open Peeking Drawer
      map.on('click', 'pandal-unclustered', (e: any) => {
        const feature = e.features?.[0];
        if (!feature || !feature.properties) return;
        const pandalId = feature.properties.id;
        console.log('[Hoppers 2026] Selected Pandal ID:', pandalId);

        try {
          const raw = feature.properties.pandalJson;
          const pandal = raw ? JSON.parse(raw) : PANDALS_DATA.find((p) => p.id === pandalId);
          if (pandal) {
            onSelectPandal(pandal);
          }
        } catch {
          const pandal = PANDALS_DATA.find((p) => p.id === pandalId);
          if (pandal) onSelectPandal(pandal);
        }
      });

      // Cursor Pointers
      map.on('mouseenter', 'pandal-clusters', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'pandal-clusters', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'pandal-unclustered', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'pandal-unclustered', () => {
        map.getCanvas().style.cursor = '';
      });

      // Bus Stop interactive tooltip on click
      map.on('click', 'bus-stops-symbol', (e: any) => {
        const feat = e.features?.[0];
        if (!feat || !feat.properties) return;
        const name = feat.properties.name;
        const count = feat.properties.routeCount;
        const routesRaw = feat.properties.routes;
        let routeList = '';
        try {
          const parsed = typeof routesRaw === 'string' ? JSON.parse(routesRaw) : routesRaw;
          routeList = Array.isArray(parsed) ? parsed.join(', ') : String(routesRaw || '');
        } catch {
          routeList = String(routesRaw || '');
        }

        new maplibregl.Popup({ closeButton: true, className: 'bus-stop-map-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="font-family: system-ui, sans-serif; padding: 6px 10px; background: #0A0F1D; color: #FFFFFF; border-radius: 8px; border: 1.5px solid #0284C7; box-shadow: 0 4px 14px rgba(0,0,0,0.8);">
              <div style="display: flex; align-items: center; gap: 6px; font-weight: bold; font-size: 12px; color: #38BDF8;">
                <span>🚏</span>
                <span>${name}</span>
              </div>
              <div style="font-size: 10px; color: #94A3B8; margin-top: 4px; line-height: 1.35; max-width: 220px;">
                <span style="color: #FBBF24; font-weight: 700;">${count ? `${count} Routes:` : 'Routes:'}</span> ${routeList}
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on('mouseenter', 'bus-stops-symbol', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'bus-stops-symbol', () => {
        map.getCanvas().style.cursor = '';
      });

      // Civic POIs (Survival Layer) Tap Handler -> onSelectFacility
      const handleCivicPoiClick = (e: any) => {
        const feat = e.features?.[0];
        if (!feat || !feat.properties) return;
        const p = feat.properties;
        const coords = (feat.geometry as GeoJSON.Point).coordinates;
        const facilityPoint: FacilityPoint = {
          id: p.id || String(feat.id || Math.random()),
          name: { en: p.name, bn: p.name, hi: p.name },
          category: (p.category || 'toilets') as FacilityCategory,
          lat: coords[1],
          lng: coords[0],
          address: { en: p.address || '', bn: p.address || '', hi: p.address || '' },
          details: {
            en: p.parking_type ? `${p.parking_type} • ${p.fee_type || 'KMC Authorized'}` : (p.address || ''),
            bn: p.parking_type ? `${p.parking_type} • ${p.fee_type || 'KMC Authorized'}` : (p.address || ''),
            hi: p.parking_type ? `${p.parking_type} • ${p.fee_type || 'KMC Authorized'}` : (p.address || ''),
          },
          pujaHoursBadge: p.category === 'hospital' ? '24x7 Emergency' : p.category === 'parking' ? `${p.capacity || 50} Spots` : 'Puja 24x7',
          is24x7: p.category === 'hospital' || p.category === 'police',
        };
        onSelectFacility(facilityPoint);
      };

      map.on('click', 'civic-pois-locked-symbol', handleCivicPoiClick);
      map.on('click', 'civic-pois-macro-symbol', handleCivicPoiClick);
      map.on('mouseenter', 'civic-pois-locked-symbol', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'civic-pois-locked-symbol', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'civic-pois-macro-symbol', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'civic-pois-macro-symbol', () => {
        map.getCanvas().style.cursor = '';
      });

      // Permanent Transit Infrastructure (Railways & Ferries) Tap Handler -> onSelectFacility
      const handleTransitHubClick = (e: any) => {
        const feat = e.features?.[0];
        if (!feat || !feat.properties) return;
        const p = feat.properties;
        const hub = TRANSIT_HUBS.find((h) => h.id === p.id);
        if (hub) {
          const facilityPoint: FacilityPoint = {
            id: hub.id,
            name: { en: hub.name, bn: hub.name, hi: hub.name },
            category: (hub.category === 'ferry' ? 'ferry' : 'railway') as FacilityCategory,
            lat: hub.lat,
            lng: hub.lng,
            address: { en: hub.connectingZones, bn: hub.connectingZones, hi: hub.connectingZones },
            details: { en: `${hub.type} • ${hub.travelTip}`, bn: `${hub.type} • ${hub.travelTip}`, hi: `${hub.type} • ${hub.travelTip}` },
            pujaHoursBadge: hub.operator,
          };
          onSelectFacility(facilityPoint);
        }
      };

      map.on('click', 'railway-stations-symbol', handleTransitHubClick);
      map.on('click', 'ferry-ghats-symbol', handleTransitHubClick);
      map.on('mouseenter', 'railway-stations-symbol', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'railway-stations-symbol', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'ferry-ghats-symbol', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'ferry-ghats-symbol', () => {
        map.getCanvas().style.cursor = '';
      });

      // Point 7 & Point 9: Initial camera framing if selectedItem is already present on map load
      if (selectedItem) {
        const isPandal =
          'zone' in selectedItem ||
          'nearestMetro' in selectedItem ||
          'crowdLevel' in selectedItem;
        if (isPandal) {
          const latDelta = 0.00451;
          const lngDelta = 0.00488;
          map.fitBounds(
            [
              [selectedItem.lng - lngDelta, selectedItem.lat - latDelta],
              [selectedItem.lng + lngDelta, selectedItem.lat + latDelta],
            ],
            {
              padding: { top: 80, bottom: 200, left: 30, right: 30 },
              duration: 900,
              maxZoom: 16.5,
            }
          );
        } else {
          map.flyTo({
            center: [selectedItem.lng, selectedItem.lat],
            zoom: 16.5,
            duration: 800,
          });
        }
      }
    };

    map.on('style.load', () => {
      isMapLoadedRef.current = true;
      setupCustomLayers();
    });

    map.on('load', () => {
      isMapLoadedRef.current = true;
      setupCustomLayers();
    });

    if (map.isStyleLoaded()) {
      isMapLoadedRef.current = true;
      setupCustomLayers();
    }

    // Moveend & Zoomend listeners: updates mapCenterCoords and zoom state
    map.on('moveend', () => {
      const center = map.getCenter();
      const clamped = clampToKolkata(center.lat, center.lng);
      setCurrentZoom(map.getZoom());
      setMapCenterCoords((prev) => {
        const distKm = calculateDistanceKm(prev.lat, prev.lng, clamped.lat, clamped.lng);
        if (distKm * 1000 >= 50) {
          return clamped;
        }
        return prev;
      });
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      isMapLoadedRef.current = false;
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Pandals GeoJSON Source whenever filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoadedRef.current) return;
    const source = map.getSource('pandals') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(pandalsGeoJSON);
    }
  }, [pandalsGeoJSON]);

  // Update Live Lock Radius Circle Layer (1km for Pandals, 500m for locked Utilities)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoadedRef.current) return;
    const source = map.getSource('live-lock-radius') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (isUtilityActive && isTargetLocked) {
      // Strictly 500m Live Lock radius around selected pandal or active GPS
      const circleFeature = createCircleGeoJSON([proximityReferenceCoords.lng, proximityReferenceCoords.lat], 500);
      source.setData({
        type: 'FeatureCollection',
        features: [circleFeature],
      });
    } else if (throttledCoords && activeFilter === 'nearby') {
      const circleFeature = createCircleGeoJSON([throttledCoords.lng, throttledCoords.lat], 1000);
      source.setData({
        type: 'FeatureCollection',
        features: [circleFeature],
      });
    } else {
      source.setData({ type: 'FeatureCollection', features: [] });
    }
  }, [isUtilityActive, isTargetLocked, proximityReferenceCoords, throttledCoords, activeFilter]);

  // Update Civic POIs GeoJSON Source (Separate from pandals, unclustered, smart visibility)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoadedRef.current) return;
    const source = map.getSource('civic-pois') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (!isUtilityActive || activePoiFacilities.length === 0) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const poiCollection: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: activePoiFacilities.map(({ facility: f, isLocked, distM }) => ({
        type: 'Feature',
        id: f.id,
        geometry: {
          type: 'Point',
          coordinates: [f.lng, f.lat],
        },
        properties: {
          id: f.id,
          name: f.name[language] || f.name.en,
          category: f.category,
          iconId:
            f.category === 'hospital' || f.category === 'medical'
              ? 'icon-hospital'
              : f.category === 'police' || f.category === 'helpdesk'
              ? 'icon-police'
              : f.category === 'food' || f.category === 'restaurant'
              ? 'icon-food'
              : f.category === 'parking'
              ? 'icon-parking'
              : 'icon-toilets',
          isLocked,
          distM,
          address: f.address ? (f.address[language] || f.address.en) : '',
          details: f.details ? (f.details[language] || f.details.en) : '',
          parking_type: f.category === 'parking' ? f.details?.en : undefined,
          capacity: f.pujaHoursBadge,
          fee_type: f.details?.en,
        },
      })),
    };

    source.setData(poiCollection);
  }, [isUtilityActive, activePoiFacilities, language]);

  // Render Metro Lines & Stations
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoadedRef.current) return;

    // Clear previous station markers
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    const source = map.getSource('metro-lines') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    // Toggle layer visibility dynamically based on isMetroActive state
    if (map.getLayer('metro-lines-casing')) {
      map.setLayoutProperty('metro-lines-casing', 'visibility', isMetroActive ? 'visible' : 'none');
    }
    if (map.getLayer('metro-lines-core')) {
      map.setLayoutProperty('metro-lines-core', 'visibility', isMetroActive ? 'visible' : 'none');
    }

    if (!isMetroActive) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const metroFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    const addLineFeature = (
      coords: [number, number][],
      color: string,
      options: { isDashed?: boolean; isIsolated?: boolean; isDimmed?: boolean } = {}
    ) => {
      if (coords.length < 2) return;
      const { isDashed = false, isIsolated = false, isDimmed = false } = options;
      const opacity = isDimmed ? 0.2 : 0.95;
      const casingOpacity = isDimmed ? 0.1 : isIsolated ? 0.7 : 0.45;
      const width = isIsolated ? 5.5 : 4.5;
      const casingWidth = isIsolated ? 11 : 8;

      metroFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords.map(([lat, lng]) => [lng, lat]),
        },
        properties: {
          color,
          width,
          opacity,
          casingWidth,
          casingOpacity,
          isDashed,
        },
      });
    };

    // 1. Blue Line (#3B82F6)
    const blueStations = getLineStations('blue');
    addLineFeature(
      blueStations.map((s) => [s.lat, s.lng]),
      '#3B82F6',
      { isIsolated: isolatedLine === 'blue', isDimmed: isolatedLine !== null && isolatedLine !== 'blue' }
    );

    // 2. Green Line (East-West with Hooghly underwater tunnel) (#10B981)
    const howrahMaidan = METRO_STATIONS.find((s) => s.id === 'howrah-maidan');
    const howrahStn = METRO_STATIONS.find((s) => s.id === 'howrah-station-metro');
    const mahakaran = METRO_STATIONS.find((s) => s.id === 'mahakaran');
    const esplanade = METRO_STATIONS.find((s) => s.id === 'esplanade');
    const sealdah = METRO_STATIONS.find((s) => s.id === 'sealdah-metro');

    const isGreenIso = isolatedLine === 'green';
    const isGreenDim = isolatedLine !== null && !isGreenIso;

    if (howrahMaidan && howrahStn) {
      addLineFeature([[howrahMaidan.lat, howrahMaidan.lng], [howrahStn.lat, howrahStn.lng]], '#10B981', {
        isIsolated: isGreenIso,
        isDimmed: isGreenDim,
      });
    }
    if (howrahStn && mahakaran) {
      // Underwater tunnel Cyan
      addLineFeature([[howrahStn.lat, howrahStn.lng], [mahakaran.lat, mahakaran.lng]], '#06B6D4', {
        isIsolated: isGreenIso,
        isDimmed: isGreenDim,
      });
    }
    if (mahakaran && esplanade) {
      addLineFeature([[mahakaran.lat, mahakaran.lng], [esplanade.lat, esplanade.lng]], '#10B981', {
        isIsolated: isGreenIso,
        isDimmed: isGreenDim,
      });
    }
    if (esplanade && sealdah) {
      // Bowbazar Dashed Connector
      addLineFeature([[esplanade.lat, esplanade.lng], [sealdah.lat, sealdah.lng]], '#10B981', {
        isDashed: true,
        isIsolated: isGreenIso,
        isDimmed: isGreenDim,
      });
    }
    const greenEastStns = METRO_STATIONS.filter((s) => s.lines.includes('green') && (s.orderGreen ?? 0) >= 5).sort(
      (a, b) => (a.orderGreen ?? 0) - (b.orderGreen ?? 0)
    );
    if (greenEastStns.length >= 2) {
      addLineFeature(
        greenEastStns.map((s) => [s.lat, s.lng]),
        '#10B981',
        { isDashed: true, isIsolated: isGreenIso, isDimmed: isGreenDim }
      );
    }

    // 3. Orange Line (#F97316)
    const orangeStations = getLineStations('orange');
    addLineFeature(
      orangeStations.map((s) => [s.lat, s.lng]),
      '#F97316',
      { isIsolated: isolatedLine === 'orange', isDimmed: isolatedLine !== null && isolatedLine !== 'orange' }
    );

    // 4. Purple Line (#8B5CF6)
    const purpleStations = getLineStations('purple');
    addLineFeature(
      purpleStations.map((s) => [s.lat, s.lng]),
      '#8B5CF6',
      { isIsolated: isolatedLine === 'purple', isDimmed: isolatedLine !== null && isolatedLine !== 'purple' }
    );

    // 5. Yellow Line (#EAB308)
    const yellowStations = getLineStations('yellow');
    addLineFeature(
      yellowStations.map((s) => [s.lat, s.lng]),
      '#EAB308',
      { isIsolated: isolatedLine === 'yellow', isDimmed: isolatedLine !== null && isolatedLine !== 'yellow' }
    );

    source.setData({
      type: 'FeatureCollection',
      features: metroFeatures,
    });

    // Render Station Markers
    METRO_STATIONS.forEach((stn) => {
      if (isolatedLine && !stn.lines.includes(isolatedLine)) return;

      const el = document.createElement('div');
      el.className = 'cursor-pointer select-none transition-transform hover:scale-125';
      el.innerHTML = `
        <div style="
          width: ${stn.isInterchange ? '18px' : '12px'};
          height: ${stn.isInterchange ? '18px' : '12px'};
          background: ${stn.isInterchange ? '#F59E0B' : '#FFFFFF'};
          border: 2px solid #080B11;
          border-radius: 9999px;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${stn.isInterchange ? '<span style="font-size: 8px; color: #000; font-weight: 900;">★</span>' : ''}
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stn.lng, stn.lat])
        .addTo(map);

      el.addEventListener('click', () => {
        if (onSelectStation) {
          onSelectStation(stn);
        } else {
          const metroFacility: FacilityPoint = {
            id: stn.id,
            name: stn.name,
            category: 'metro',
            lat: stn.lat,
            lng: stn.lng,
            details: {
              en: `Lines: ${stn.lines.join(', ').toUpperCase()}. Exit Gates: ${stn.exitGates.map((g) => `${g.gate}: ${g.destination.en}`).join(' | ')}`,
              bn: `লাইন: ${stn.lines.join(', ').toUpperCase()}। এক্সিট গেট: ${stn.exitGates.map((g) => `${g.gate}: ${g.destination.bn}`).join(' | ')}`,
              hi: `लाइन्स: ${stn.lines.join(', ').toUpperCase()}। निकास गेट: ${stn.exitGates.map((g) => `${g.gate}: ${g.destination.hi}`).join(' | ')}`,
            },
          };
          onSelectFacility(metroFacility);
        }
      });

      stationMarkersRef.current.push(marker);
    });
  }, [isMetroActive, isolatedLine, onSelectStation, onSelectFacility]);

  // Civic Utilities & Transit are rendered via clean MapLibre GL vector layers (no bulky HTML pills)
  useEffect(() => {
    utilityMarkersRef.current.forEach((m) => m.remove());
    utilityMarkersRef.current = [];
  }, [isUtilityActive]);

  // Render Active Routes (Walking Route, Metro Route, Bus Diversion, Multi-Stop Trail)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoadedRef.current) return;
    const source = map.getSource('active-routes') as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    const routeFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    // 1. Walking Route
    if (activeWalkRoute) {
      const from: [number, number] = [activeWalkRoute.fromCoords.lng, activeWalkRoute.fromCoords.lat];
      const to: [number, number] = [activeWalkRoute.pandal.lng, activeWalkRoute.pandal.lat];
      routeFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [from, to] },
        properties: { color: '#FBBF24', glowColor: '#F59E0B', isDashed: true },
      });

      const bounds = new maplibregl.LngLatBounds(from, to);
      if (userCoords) bounds.extend([userCoords.lng, userCoords.lat]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
    }

    // 2. Metro Route
    if (activeMetroRoute && activeMetroRoute.coordinates.length >= 2) {
      const coords: [number, number][] = activeMetroRoute.coordinates.map(([lat, lng]) => [lng, lat]);
      const lineColor =
        activeMetroRoute.line === 'green'
          ? '#10B981'
          : activeMetroRoute.line === 'orange'
          ? '#F97316'
          : activeMetroRoute.line === 'purple'
          ? '#9333EA'
          : activeMetroRoute.line === 'yellow'
          ? '#EAB308'
          : '#2563EB';

      routeFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { color: lineColor, glowColor: '#FFFFFF', isDashed: false },
      });

      const bounds = coords.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }

    // 3. Multi-Stop Trail
    if (trailStops && trailStops.length >= 2) {
      const coords: [number, number][] = trailStops.map((s) => [s.lng, s.lat]);
      routeFeatures.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { color: '#FBBF24', glowColor: '#F59E0B', isDashed: true },
      });

      const bounds = coords.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 70, maxZoom: 16 });
    }

    source.setData({
      type: 'FeatureCollection',
      features: routeFeatures,
    });
  }, [activeWalkRoute, activeMetroRoute, trailStops, userCoords]);

  // Center on Selected Item (Point 7: POI View Map flyTo & Point 9: Auto FitBounds 500m for Pandals)
  useEffect(() => {
    if (!selectedItem || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const isPandal =
      'zone' in selectedItem ||
      'nearestMetro' in selectedItem ||
      'crowdLevel' in selectedItem;

    if (isPandal) {
      // Point 9: Auto fitBounds for 500m Live Lock radius circle on mobile screens
      // 500m latitude delta ≈ 0.00451 deg, 500m longitude delta ≈ 0.00488 deg at Kolkata 22.57°N
      const latDelta = 0.00451;
      const lngDelta = 0.00488;
      map.fitBounds(
        [
          [selectedItem.lng - lngDelta, selectedItem.lat - latDelta],
          [selectedItem.lng + lngDelta, selectedItem.lat + latDelta],
        ],
        {
          padding: { top: 80, bottom: 200, left: 30, right: 30 },
          duration: 900,
          maxZoom: 16.5,
        }
      );
    } else {
      // Point 7: POI Facility / Metro Station - smoothly fly to the location on the live map canvas
      map.flyTo({
        center: [selectedItem.lng, selectedItem.lat],
        zoom: 16.5,
        duration: 800,
      });
    }
  }, [selectedItem]);

  // User GPS Blue Dot Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLngLat([userCoords.lng, userCoords.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'relative flex items-center justify-center';
        el.innerHTML = `
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(37, 99, 235, 0.9);"></div>
        `;

        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([userCoords.lng, userCoords.lat])
          .addTo(map);
      }
    } else {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    }
  }, [userCoords]);

  // Line isolation handler
  const handleToggleLineIsolation = (lineId: MetroLine | null) => {
    const map = mapInstanceRef.current;
    if (!isMetroActive) {
      setIsMetroActive(true);
      setIsLegendExpanded(true);
    }

    if (!lineId || isolatedLine === lineId) {
      setIsolatedLine(null);
      if (map) {
        const allCoords = METRO_STATIONS.map((s) => [s.lng, s.lat] as [number, number]);
        const bounds = allCoords.reduce(
          (b, c) => b.extend(c),
          new maplibregl.LngLatBounds(allCoords[0], allCoords[0])
        );
        map.fitBounds(bounds, { padding: 60 });
      }
    } else {
      setIsolatedLine(lineId);
      if (map) {
        const lineStations = getLineStations(lineId);
        if (lineStations.length > 0) {
          const coords = lineStations.map((s) => [s.lng, s.lat] as [number, number]);
          const bounds = coords.reduce(
            (b, c) => b.extend(c),
            new maplibregl.LngLatBounds(coords[0], coords[0])
          );
          map.fitBounds(bounds, { padding: 70 });
        }
      }
    }
  };

  // GPS "Find My Location"
  const handleFindLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg(t.gpsDenied);
      setTimeout(() => setGpsStatusMsg(null), 3500);
      return;
    }

    setGpsLoading(true);
    setGpsStatusMsg(t.gpsSearching);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const { latitude, longitude } = position.coords;
        const clamped = clampToKolkata(latitude, longitude);
        onUserCoordsChange(clamped);
        setGpsStatusMsg(t.gpsFound);
        setTimeout(() => setGpsStatusMsg(null), 3000);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo({ center: [clamped.lng, clamped.lat], zoom: 15, duration: 800 });
        }
      },
      () => {
        setGpsLoading(false);
        setGpsStatusMsg(t.gpsDenied);
        setTimeout(() => setGpsStatusMsg(null), 3500);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleLockNorth = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.resetNorth({ duration: 500 });
      setGpsStatusMsg('Strict North Orientation Locked');
      setTimeout(() => setGpsStatusMsg(null), 2500);
    }
  };

  const handleSelectSearchResult = (pandal: Pandal) => {
    setIsSearchDropdownOpen(false);
    setMapSearchQuery(pandal.name[language] || pandal.name.en);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: [pandal.lng, pandal.lat], zoom: 16, duration: 600 });
    }
    onSelectPandal(pandal);
  };

  const getCommuteAdvice = (km: number) => {
    if (km < 1.5) return '🚶 Walking Distance (~15 mins)';
    if (km <= 5.0) return '🛺 Auto/Taxi recommended';
    return '🚇 Metro/Cab recommended';
  };

  return (
    <div id="map-view-container" className="relative w-full h-full overflow-hidden bg-[#080B11]">
      {/* Primary MapLibre GL Stage */}
      <div
        id="maplibre-map"
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', backgroundColor: '#080B11' }}
        className="w-full h-full z-0"
      />

      {/* Floating Top Search Bar (Point 4: Gutter right-16 prevents collision with 44px dock buttons) */}
      <div className="absolute top-2.5 left-2.5 right-16 max-w-md mx-auto z-25 pointer-events-none flex flex-col gap-1.5">
        <div className="relative pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-750/90 rounded-2xl shadow-xl shadow-black/50 focus-within:border-amber-400/80 transition-colors">
            <Search className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => {
                setMapSearchQuery(e.target.value);
                setIsSearchDropdownOpen(true);
              }}
              onFocus={() => setIsSearchDropdownOpen(true)}
              placeholder={t.searchPandalsPlaceholder || 'Search pandals, stations, themes...'}
              className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-hidden"
            />
            {mapSearchQuery && (
              <button
                onClick={() => {
                  setMapSearchQuery('');
                  setIsSearchDropdownOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition active:scale-95"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Dropdown */}
          {isSearchDropdownOpen && mapSearchQuery.trim() && (
            <div className="absolute top-11 left-0 right-0 max-h-56 overflow-y-auto bg-slate-900/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl p-1.5 space-y-1 z-35 animate-slide-down">
              {searchResults.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  No matching pandals found
                </div>
              ) : (
                searchResults.slice(0, 6).map((pandal) => (
                  <button
                    key={pandal.id}
                    onClick={() => handleSelectSearchResult(pandal)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-left transition"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-white truncate">
                        {pandal.name[language] || pandal.name.en}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {pandal.zone} Kolkata · Near {pandal.nearestMetro}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md shrink-0">
                      View
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Active Walking Route Banner */}
      {activeWalkRoute && (() => {
        const distKm = calculateDistanceKm(
          activeWalkRoute.fromCoords.lat,
          activeWalkRoute.fromCoords.lng,
          activeWalkRoute.pandal.lat,
          activeWalkRoute.pandal.lng
        );
        return (
          <div
            id="active-walk-route-banner"
            className="absolute top-2 left-2.5 right-16 max-w-md mx-auto z-30 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between gap-3 animate-slide-up"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400 shrink-0">
                <Route className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="font-semibold text-amber-400">
                    {formatDistance(distKm)}
                  </span>
                  <span>·</span>
                  <span>
                    ~{estimateWalkingMinutes(distKm)} min walk
                  </span>
                </div>
                <p className="text-xs font-semibold text-white truncate mt-0.5">
                  {activeWalkRoute.pandal.name[language] || activeWalkRoute.pandal.name.en}
                </p>
                <p className="text-[11px] text-slate-300 mt-1 font-medium bg-slate-800/80 px-2 py-0.5 rounded-md inline-block truncate max-w-full">
                  {getCommuteAdvice(distKm)}
                </p>
              </div>
            </div>

            {onClearWalkRoute && (
              <button
                onClick={onClearWalkRoute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition shrink-0"
                title={t.clearRoute}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })()}

      {/* Floating Active Metro Route Banner */}
      {activeMetroRoute && !activeWalkRoute && (
        <div
          id="active-metro-route-banner"
          className="absolute top-2 left-2.5 right-16 max-w-md mx-auto z-30 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
              <Train className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Metro Route Active
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {activeMetroRoute.stations[0]?.name[language] || activeMetroRoute.stations[0]?.name.en} → {activeMetroRoute.stations[activeMetroRoute.stations.length - 1]?.name[language] || activeMetroRoute.stations[activeMetroRoute.stations.length - 1]?.name.en}
              </p>
            </div>
          </div>

          {onClearMetroRoute && (
            <button
              onClick={onClearMetroRoute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition shrink-0"
              title={t.clearRoute}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Floating Active Bus Diversion Route Banner */}
      {activeBusDiversion && !activeWalkRoute && !activeMetroRoute && (
        <div
          id="active-bus-diversion-banner"
          className="absolute top-2 inset-x-2.5 max-w-md mx-auto z-30 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-red-500/50 shadow-xl flex items-center justify-between gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0 font-black text-xs">
              🚌
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="font-bold">Route {activeBusDiversion.routeNo}</span>
                <span>·</span>
                <span className="text-[10px] text-amber-300 font-semibold">{activeBusDiversion.operationalStatus}</span>
              </div>
              <p className="text-xs font-semibold text-white truncate mt-0.5">
                {activeBusDiversion.normalOrigin} ➔ {activeBusDiversion.normalDestination}
              </p>
              <p className="text-[10px] text-slate-300 mt-1 font-medium bg-slate-800/90 px-2 py-0.5 rounded-md inline-block truncate max-w-full">
                🔄 {activeBusDiversion.divertedPath}
              </p>
            </div>
          </div>

          {onClearBusDiversion && (
            <button
              onClick={onClearBusDiversion}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition shrink-0"
              title="Clear bus diversion"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Docked MetroLegend Component at Map Corner */}
      {isMetroActive && (
        <div className="absolute top-[96px] left-2.5 z-15 pointer-events-auto">
          <MetroLegend
            language={language}
            isolatedLine={isolatedLine}
            onSelectLine={handleToggleLineIsolation}
            isOpen={isLegendExpanded}
            onToggleOpen={setIsLegendExpanded}
          />
        </div>
      )}

      {/* Right HUD Controls: Compact Glassmorphic Dock (Point 4: Min 44x44px touch targets & collision-free layout) */}
      <div
        className={`absolute right-3.5 z-20 flex flex-col gap-1.5 items-center pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-750/90 rounded-2xl p-1 shadow-xl shadow-black/50 transition-all duration-200 ${
          activeWalkRoute || activeMetroRoute ? 'top-[116px]' : 'top-[68px]'
        }`}
      >
        {/* Dedicated METRO Map Layer Toggle (Min 44x44px) */}
        <button
          id="map-metro-toggle-btn"
          onClick={handleToggleMetro}
          className={`flex flex-col items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl transition-all active:scale-95 touch-manipulation ${
            isMetroActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isMetroActive ? 'Deactivate Metro Mode & Restore Pandals' : 'Activate Metro Network Mode'}
          aria-label="Toggle Metro Lines"
        >
          <Train className="w-5 h-5" />
        </button>

        <div className="w-6 h-[1px] bg-slate-800 my-0.5" />

        {/* Zoom In & Zoom Out Buttons (Min 44x44px) */}
        <button
          id="map-zoom-in-btn"
          onClick={handleZoomIn}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 touch-manipulation"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          id="map-zoom-out-btn"
          onClick={handleZoomOut}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 touch-manipulation"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="w-6 h-[1px] bg-slate-800 my-0.5" />

        {/* Lock North Button (Min 44x44px) */}
        <button
          id="lock-north-btn"
          onClick={handleLockNorth}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95 touch-manipulation"
          title="Strictly Locked to True North (N 0°)"
          aria-label="Lock North"
        >
          <Compass className="w-5 h-5 text-amber-400" />
        </button>

        {/* Find My Location (Min 44x44px) */}
        <button
          id="gps-locate-btn"
          onClick={handleFindLocation}
          disabled={gpsLoading}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all active:scale-95 touch-manipulation ${
            userCoords
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={gpsLoading ? t.gpsSearching : t.locateMe}
          aria-label="Find GPS Location"
        >
          <Crosshair
            className={`w-5 h-5 ${
              userCoords ? 'text-white' : 'text-slate-300'
            } ${gpsLoading ? 'animate-spin' : ''}`}
          />
        </button>

        {/* Status Toast */}
        {gpsStatusMsg && (
          <div
            id="gps-status-pill"
            className="absolute right-12 top-20 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-200 text-xs font-medium shadow-xl backdrop-blur-md whitespace-nowrap animate-fade-in"
          >
            {gpsStatusMsg}
          </div>
        )}

        {/* AMOLED Power Save Active Indicator */}
        {isPowerSaveMode && (
          <div
            id="hud-power-save-badge"
            className="absolute right-12 bottom-1 px-2 py-0.5 rounded-md bg-black border border-amber-400 text-amber-300 text-[10px] font-bold shadow-md shadow-black flex items-center gap-1 whitespace-nowrap"
          >
            <span>⚡</span>
            <span>AMOLED ECO</span>
          </div>
        )}
      </div>

      {/* Floating Active Trail Badge */}
      {trailStops && trailStops.length > 0 && onOpenTrailBuilder && (
        <div className="absolute top-[108px] left-3 z-20 pointer-events-auto animate-fade-in">
          <button
            id="map-floating-route-btn"
            onClick={onOpenTrailBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-black/60 border border-amber-300 active:scale-95 transition"
            title={t.trailBuilderTitle}
          >
            <Route className="w-3.5 h-3.5" />
            <span>{trailStops.length} {trailStops.length === 1 ? 'Stop' : 'Stops'}</span>
          </button>
        </div>
      )}

      {/* Unified Floating Bottom Stage */}
      <div
        id="map-floating-bottom-stage"
        className="absolute bottom-[calc(var(--bottom-dock-height)+var(--safe-bottom)+8px)] inset-x-0 z-20 pointer-events-none flex flex-col gap-2"
      >
        {/* Proximity Quick-Preview Card for Closest Utility Node (Point 5 & Point 6) */}
        {closestUtilitySummary && !isFilterTrayExpanded && (
          <div className="w-full max-w-md mx-auto px-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-950/95 border border-slate-750/90 backdrop-blur-xl shadow-xl shadow-black/80 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 text-xs shrink-0">
                  📍
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-bold text-emerald-400">{closestUtilitySummary.distanceBadge}</span>
                    <span>•</span>
                    <span className="truncate">{closestUtilitySummary.totalCount} {closestUtilitySummary.isLocked ? 'within 500m' : 'in city'}</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">
                    {closestUtilitySummary.closest.name[language] || closestUtilitySummary.closest.name.en}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!closestUtilitySummary.isLocked && currentZoom < 15 && (
                  <button
                    onClick={() => {
                      const map = mapInstanceRef.current;
                      if (map) {
                        map.flyTo({
                          center: [closestUtilitySummary.closest.lng, closestUtilitySummary.closest.lat],
                          zoom: 15.5,
                          duration: 800,
                        });
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 active:scale-95 transition"
                  >
                    <span>Zoom In</span>
                  </button>
                )}
                <a
                  href={closestUtilitySummary.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 transition shadow-xs"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Directions</span>
                </a>
                <button
                  onClick={() => onSelectFacility(closestUtilitySummary.closest)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs active:scale-95 transition"
                >
                  Details
                </button>
                {/* Point 6: Cancel/Dismiss Utility Filter Button */}
                <button
                  onClick={() => clearUtilityFilter()}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white active:scale-95 transition"
                  title="Clear utility filter"
                  aria-label="Clear utility filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Nearby Filter Rail */}
        <div className="w-full">
          <NearbyFilterBar
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            language={language}
            onClearFilter={clearUtilityFilter}
            onTrayExpandedChange={setIsFilterTrayExpanded}
          />
        </div>
      </div>
    </div>
  );
};
