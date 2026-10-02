import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Pandal,
  FacilityPoint,
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
} from '../types';
import {
  PANDALS_DATA,
  CRITICAL_FACILITIES,
  METRO_STATIONS,
} from '../data/mockData';
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
import { createDynamicMarkerIcon, MarkerCategory } from '../utils/markerStyles';
import { MapMarkerSizeHelper } from '../utils/MapMarkerSizeHelper';
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
  Sparkles,
  Search,
  Navigation,
} from 'lucide-react';

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
  trailStops?: TrailStop[];
  onOpenTrailBuilder?: () => void;
  onOpenSuggestPandal?: () => void;
  suggestedPandals?: SuggestedPandal[];
  selectedItem?: SelectedMapItem | null;
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
  trailStops,
  onOpenTrailBuilder,
  onOpenSuggestPandal,
  suggestedPandals = [],
  selectedItem,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const metroLinesLayerRef = useRef<L.LayerGroup | null>(null);
  const metroStationsLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Throttled GPS coordinates (50m displacement filter + bounding box clamp)
  const throttledCoords = useThrottledLocation(userCoords, 50, mapInstanceRef.current);

  const prevNonMetroFilterRef = useRef<FilterType>('all');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { isPowerSaveMode, batteryLevel } = usePowerSave();
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [crowdConsensusMap, setCrowdConsensusMap] = useState<Map<string, PandalCrowdRecord>>(new Map());

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
  // Priority: Throttled GPS coords -> Fallback to Map Center coords (updated strictly on moveend)
  const effectiveCoords = useMemo(() => {
    if (throttledCoords) return throttledCoords;
    return mapCenterCoords;
  }, [throttledCoords, mapCenterCoords]);

  // Dedicated Metro state (toggled via HUD button or Metro tab)
  const [isMetroActive, setIsMetroActive] = useState(false);
  const [isolatedLine, setIsolatedLine] = useState<MetroLine | null>(null);
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  const t = TRANSLATIONS[language];

  // Helper to test if active filter is a critical utility layer
  const isUtilityActive =
    activeFilter === 'police' ||
    activeFilter === 'toilets' ||
    activeFilter === 'food' ||
    activeFilter === 'ferry' ||
    activeFilter === 'railway' ||
    (activeFilter as string) === 'hospital';

  // Synchronized Metro rail toggle handler
  const handleToggleMetro = () => {
    setIsMetroActive((prev) => !prev);
    if (isMetroActive) {
      setIsolatedLine(null);
    } else {
      setIsLegendExpanded(true);
    }
  };

  // Intercept category filter selection from NearbyFilterBar
  const handleFilterChange = (newFilter: FilterType) => {
    prevNonMetroFilterRef.current = newFilter;
    setActiveFilter(newFilter);
    setIsolatedLine(null);

    // Smoothly pan to zone centers when micro-zone filter is tapped
    const map = mapInstanceRef.current;
    if (map) {
      const zoneCenters: Partial<Record<FilterType, { lat: number; lng: number; zoom: number }>> = {
        all: { lat: 22.5697, lng: 88.3516, zoom: 13 },
        north: { lat: 22.5991, lng: 88.3683, zoom: 14 },
        south: { lat: 22.5200, lng: 88.3550, zoom: 14 },
        central: { lat: 22.5680, lng: 88.3620, zoom: 14 },
        saltlake: { lat: 22.5850, lng: 88.4150, zoom: 14 },
        rajarhat: { lat: 22.6100, lng: 88.4550, zoom: 14 },
        dumdum: { lat: 22.6250, lng: 88.4000, zoom: 14 },
        west: { lat: 22.5350, lng: 88.3150, zoom: 14 },
        behala: { lat: 22.4950, lng: 88.3150, zoom: 14 },
      };

      const target = zoneCenters[newFilter];
      if (target) {
        map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.0 });
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

  // Proximity Summary for Active Utility Filter (Memoized with pure isolation)
  const closestUtilitySummary = useMemo(() => {
    if (!isUtilityActive) return null;

    const refLat = effectiveCoords.lat;
    const refLng = effectiveCoords.lng;

    const matching = CRITICAL_FACILITIES.filter((facility) => {
      if (activeFilter === 'police') return facility.category === 'police';
      if (activeFilter === 'toilets') return facility.category === 'toilets';
      if (activeFilter === 'food') return facility.category === 'food' || facility.category === 'restaurant';
      if (activeFilter === 'ferry') return facility.category === 'ferry';
      if (activeFilter === 'railway') return facility.category === 'railway';
      if ((activeFilter as string) === 'hospital') return facility.category === 'hospital' || facility.category === 'medical';
      return false;
    }).map((facility) => {
      const distKm = calculateDistanceKm(refLat, refLng, facility.lat, facility.lng);
      const distM = distKm * 1000;
      return { facility, distKm, distM };
    });

    if (matching.length === 0) return null;
    matching.sort((a, b) => a.distKm - b.distKm);
    const closest = matching[0];
    const eta = calculateCrowdWalkingEta(closest.distM);
    const distBadge =
      closest.distM < 1000
        ? `${Math.round(closest.distM)}m • ${eta.text}`
        : `${closest.distKm.toFixed(1)} km • ${eta.text}`;

    return {
      totalCount: matching.length,
      closest: closest.facility,
      distanceBadge: distBadge,
      googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${closest.facility.lat},${closest.facility.lng}`,
    };
  }, [activeFilter, isUtilityActive, effectiveCoords]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Remove any lingering Leaflet internal ID from DOM node if hot reloaded
    if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
      delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
    }

    // Central Kolkata default
    const map = L.map(mapContainerRef.current, {
      center: [ESPLANADE_CENTER.lat, ESPLANADE_CENTER.lng], // Esplanade central hub
      zoom: 13,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      touchZoom: true,
      boxZoom: false,
      doubleClickZoom: true,
      scrollWheelZoom: true,
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      keepBuffer: 12,
      crossOrigin: true,
    }).addTo(map);

    tileLayer.on('tileerror', (e) => {
      console.warn('Map tile failed to load (offline or slow network):', e);
    });

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Strict moveend listener: guarantees ZERO Haversine execution during continuous drag/pan events.
    // Only triggers mapCenterCoords state update when the user finishes dragging and displacement >= 50m.
    map.on('moveend', () => {
      const center = map.getCenter();
      const clamped = clampToKolkata(center.lat, center.lng);
      setMapCenterCoords((prev) => {
        const distKm = calculateDistanceKm(prev.lat, prev.lng, clamped.lat, clamped.lng);
        if (distKm * 1000 >= 50) {
          return clamped;
        }
        return prev;
      });
    });

    // Layer Groups: Metro Polylines on bottom, Routes in middle, Stations & Markers on top
    const metroLinesLayer = L.layerGroup().addTo(map);
    const routesLayer = L.layerGroup().addTo(map);
    const metroStationsLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    metroLinesLayerRef.current = metroLinesLayer;
    routesLayerRef.current = routesLayer;
    metroStationsLayerRef.current = metroStationsLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      try {
        map.remove();
      } catch (err) {
        console.warn('Error during Leaflet cleanup:', err);
      }
      mapInstanceRef.current = null;
      if (mapContainerRef.current && (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
        delete (mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id;
      }
    };
  }, []);

  // Handler to open station details sheet
  const handleStationClick = (station: MetroStation) => {
    if (onSelectStation) {
      onSelectStation(station);
    } else {
      const metroFacility: FacilityPoint = {
        id: station.id,
        name: station.name,
        category: 'metro',
        lat: station.lat,
        lng: station.lng,
        details: {
          en: `Lines: ${station.lines.join(', ').toUpperCase()}. Exit Gates: ${station.exitGates.map((g) => `${g.gate}: ${g.destination.en}`).join(' | ')}`,
          bn: `লাইন: ${station.lines.join(', ').toUpperCase()}। এক্সিট গেট: ${station.exitGates.map((g) => `${g.gate}: ${g.destination.bn}`).join(' | ')}`,
          hi: `लाइन्स: ${station.lines.join(', ').toUpperCase()}। निकास गेट: ${station.exitGates.map((g) => `${g.gate}: ${g.destination.hi}`).join(' | ')}`,
        },
      };
      onSelectFacility(metroFacility);
    }
  };

  // Render Metro Line Polylines (Dual-Layer Casing + Under-River Tunnel + Bowbazar Connector)
  useEffect(() => {
    const metroLinesLayer = metroLinesLayerRef.current;
    if (!metroLinesLayer) return;

    metroLinesLayer.clearLayers();

    if (!isMetroActive) return;

    // Helper to add dual-layer polyline
    const addDualLayerPolyline = (
      coords: [number, number][],
      lineColor: string,
      options: {
        isDashed?: boolean;
        isUnderRiver?: boolean;
        isIsolated?: boolean;
        isDimmed?: boolean;
        customLabel?: string;
      } = {}
    ) => {
      if (coords.length < 2) return;

      const {
        isDashed = false,
        isUnderRiver = false,
        isIsolated = false,
        isDimmed = false,
        customLabel,
      } = options;

      const baseOpacity = isDimmed ? 0.2 : 0.95;
      const casingOpacity = isDimmed ? 0.1 : isIsolated ? 0.7 : 0.45;
      const casingWeight = isIsolated ? 11 : 8;
      const innerWeight = isIsolated ? 5.5 : 4.5;

      // 1. Dual-Layer Outer Contrast Halo Casing
      const outerCasing = L.polyline(coords, {
        color: isUnderRiver ? '#083344' : '#020617',
        weight: casingWeight,
        opacity: casingOpacity,
        lineCap: 'round',
        lineJoin: 'round',
      });
      metroLinesLayer.addLayer(outerCasing);

      // 1b. Extra Glow Halo if isolated
      if (isIsolated) {
        const glowHalo = L.polyline(coords, {
          color: isUnderRiver ? '#22D3EE' : lineColor,
          weight: 14,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        });
        metroLinesLayer.addLayer(glowHalo);
      }

      // 2. Inner Vibrant Core Track Line
      const innerLine = L.polyline(coords, {
        color: isUnderRiver ? '#06B6D4' : lineColor,
        weight: innerWeight,
        opacity: baseOpacity,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: isDashed ? '6, 7' : undefined,
      });

      if (customLabel) {
        innerLine.bindTooltip(customLabel, {
          sticky: true,
          className: 'metro-corridor-tooltip',
        });
      }

      metroLinesLayer.addLayer(innerLine);
    };

    // 1. Blue Line 1 (Dakshineswar ↔ Kavi Subhash)
    const blueStations = getLineStations('blue');
    const blueCoords: [number, number][] = blueStations.map((s) => [s.lat, s.lng]);
    const isBlueIsolated = isolatedLine === 'blue';
    const isBlueDimmed = isolatedLine !== null && !isBlueIsolated;
    addDualLayerPolyline(blueCoords, '#2563EB', {
      isIsolated: isBlueIsolated,
      isDimmed: isBlueDimmed,
      customLabel: `Blue Line 1 (North-South spine · 26 Stations)`,
    });

    // 2. Green Line 2 (East-West corridor with Underwater Tunnel & Bowbazar connector)
    const isGreenIsolated = isolatedLine === 'green';
    const isGreenDimmed = isolatedLine !== null && !isGreenIsolated;

    // Segment A: Howrah Maidan -> Howrah (Solid Green)
    const howrahMaidan = METRO_STATIONS.find((s) => s.id === 'howrah-maidan');
    const howrahStn = METRO_STATIONS.find((s) => s.id === 'howrah-station-metro');
    const mahakaran = METRO_STATIONS.find((s) => s.id === 'mahakaran');
    const esplanade = METRO_STATIONS.find((s) => s.id === 'esplanade');
    const sealdah = METRO_STATIONS.find((s) => s.id === 'sealdah-metro');

    if (howrahMaidan && howrahStn) {
      addDualLayerPolyline(
        [[howrahMaidan.lat, howrahMaidan.lng], [howrahStn.lat, howrahStn.lng]],
        '#10B981',
        { isIsolated: isGreenIsolated, isDimmed: isGreenDimmed }
      );
    }

    // Segment B: UNDER-RIVER HOOGHLY TUNNEL (Howrah ↔ Mahakaran) -> Distinct Cyan (#06B6D4)
    if (howrahStn && mahakaran) {
      addDualLayerPolyline(
        [[howrahStn.lat, howrahStn.lng], [mahakaran.lat, mahakaran.lng]],
        '#06B6D4',
        {
          isUnderRiver: true,
          isIsolated: isGreenIsolated,
          isDimmed: isGreenDimmed,
          customLabel: `🌊 Hooghly Under-River Underwater Tunnel (Howrah ↔ Mahakaran)`,
        }
      );
    }

    // Segment C: Mahakaran -> Esplanade (Solid Green)
    if (mahakaran && esplanade) {
      addDualLayerPolyline(
        [[mahakaran.lat, mahakaran.lng], [esplanade.lat, esplanade.lng]],
        '#10B981',
        { isIsolated: isGreenIsolated, isDimmed: isGreenDimmed }
      );
    }

    // Segment D: BOWBAZAR CONNECTOR (Esplanade ↔ Sealdah) -> Dashed Line
    if (esplanade && sealdah) {
      addDualLayerPolyline(
        [[esplanade.lat, esplanade.lng], [sealdah.lat, sealdah.lng]],
        '#10B981',
        {
          isDashed: true,
          isIsolated: isGreenIsolated,
          isDimmed: isGreenDimmed,
          customLabel: `Bowbazar Connector (Esplanade ↔ Sealdah)`,
        }
      );
    }

    // Segment E: Sealdah -> Salt Lake Sector V (Solid Green)
    const greenEastStns = METRO_STATIONS.filter(
      (s) => s.lines.includes('green') && (s.orderGreen ?? 0) >= 5
    ).sort((a, b) => (a.orderGreen ?? 0) - (b.orderGreen ?? 0));
    const greenEastCoords: [number, number][] = greenEastStns.map((s) => [s.lat, s.lng]);
    if (greenEastCoords.length >= 2) {
      addDualLayerPolyline(greenEastCoords, '#10B981', {
        isIsolated: isGreenIsolated,
        isDimmed: isGreenDimmed,
        customLabel: `Green Line 2 East (Sealdah ↔ Salt Lake Sector V)`,
      });
    }

    // 3. Orange Line 6 (Kavi Subhash ↔ Beleghata)
    const orangeStations = getLineStations('orange');
    const orangeCoords: [number, number][] = orangeStations.map((s) => [s.lat, s.lng]);
    const isOrangeIsolated = isolatedLine === 'orange';
    const isOrangeDimmed = isolatedLine !== null && !isOrangeIsolated;
    addDualLayerPolyline(orangeCoords, '#F97316', {
      isIsolated: isOrangeIsolated,
      isDimmed: isOrangeDimmed,
      customLabel: `Orange Line 6 (EM Bypass corridor · 9 Stations)`,
    });

    // 4. Purple Line 3 (Joka ↔ Majerhat)
    const purpleStations = getLineStations('purple');
    const purpleCoords: [number, number][] = purpleStations.map((s) => [s.lat, s.lng]);
    const isPurpleIsolated = isolatedLine === 'purple';
    const isPurpleDimmed = isolatedLine !== null && !isPurpleIsolated;
    addDualLayerPolyline(purpleCoords, '#9333EA', {
      isIsolated: isPurpleIsolated,
      isDimmed: isPurpleDimmed,
      customLabel: `Purple Line 3 (Diamond Harbour Rd · 7 Stations)`,
    });

    // 5. Yellow Line 4 (Noapara ↔ Jai Hind Airport)
    const yellowStations = getLineStations('yellow');
    const yellowCoords: [number, number][] = yellowStations.map((s) => [s.lat, s.lng]);
    const isYellowIsolated = isolatedLine === 'yellow';
    const isYellowDimmed = isolatedLine !== null && !isYellowIsolated;
    addDualLayerPolyline(yellowCoords, '#EAB308', {
      isIsolated: isYellowIsolated,
      isDimmed: isYellowDimmed,
      customLabel: `Yellow Line 4 (Airport Express corridor · 4 Stations)`,
    });
  }, [isMetroActive, isolatedLine]);

  // Render De-Cluttered Metro Station Hierarchy Dots & Interchange Rings
  useEffect(() => {
    const metroStationsLayer = metroStationsLayerRef.current;
    if (!metroStationsLayer) return;

    let rafId: number | null = null;

    rafId = requestAnimationFrame(() => {
      metroStationsLayer.clearLayers();

      if (!isMetroActive) return;

      const dim = MapMarkerSizeHelper.getDimensions(currentZoom);
      const tooltipOffset: [number, number] = [0, -dim.iconAnchor[1] - 4];

      METRO_STATIONS.forEach((station) => {
        // Filter out stations if a specific line is isolated
        if (isolatedLine && !station.lines.includes(isolatedLine)) {
          return;
        }

        const primaryLine = station.lines[0] || 'blue';
        const lineColor =
          primaryLine === 'green'
            ? '#10B981'
            : primaryLine === 'orange'
            ? '#F97316'
            : primaryLine === 'purple'
            ? '#9333EA'
            : primaryLine === 'yellow'
            ? '#EAB308'
            : '#2563EB';

        const icon = station.isInterchange
          ? createDynamicMarkerIcon('metro-interchange', currentZoom, {
              metroLines: station.lines,
            })
          : createDynamicMarkerIcon('metro-station', currentZoom, {
              metroColor: lineColor,
            });

        const marker = L.marker([station.lat, station.lng], {
          icon,
          title: station.name[language] || station.name.en,
          zIndexOffset: station.isInterchange ? 600 : 350,
        });

        // Rich Informative Tooltip
        const lineLabels = station.lines
          .map((l) => {
            if (l === 'blue') return 'Line 1 Blue';
            if (l === 'green') return 'Line 2 Green';
            if (l === 'orange') return 'Line 6 Orange';
            if (l === 'purple') return 'Line 3 Purple';
            return 'Line 4 Yellow';
          })
          .join(' · ');

        const tooltipContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 130px; padding: 2px;">
            <div style="font-weight: 700; font-size: 12px; color: #FFFFFF; display: flex; align-items: center; gap: 4px;">
              ${station.isInterchange ? '<span>⇄</span>' : ''}
              <span>${station.name[language] || station.name.en}</span>
            </div>
            <div style="font-size: 10px; color: #94A3B8; margin-top: 2px;">
              ${lineLabels}
            </div>
            ${
              station.isInterchange
                ? `<div style="font-size: 9px; font-weight: 700; color: #F59E0B; margin-top: 3px;">★ Transfer Interchange Hub</div>`
                : ''
            }
            <div style="font-size: 9px; color: #38BDF8; margin-top: 3px; font-weight: 600;">
              Tap for exits & feeder pandals →
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          direction: 'top',
          offset: tooltipOffset,
          className: 'hopper-metro-station-tooltip',
        });

        marker.on('click', () => {
          handleStationClick(station);
        });

        metroStationsLayer.addLayer(marker);
      });
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isMetroActive, isolatedLine, currentZoom, language]);

  // Update Pandals and other POI Markers (Strict Exclusive Layer Isolation with RAF Batching)
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    let rafId: number | null = null;

    rafId = requestAnimationFrame(() => {
      // Always clear entire markers layer first to prevent orphaned DOM nodes
      markersLayer.clearLayers();

      // Invariant 1: When Metro mode is active, completely clear all pandals and POIs
      if (isMetroActive) {
        return;
      }

      const visitedSet = new Set(visitedList.map((v) => v.pandalId));
      const dim = MapMarkerSizeHelper.getDimensions(currentZoom);
      const tooltipOffset: [number, number] = [0, -dim.iconAnchor[1] - 4];
      const batchMarkers: L.Marker[] = [];

      const refLat = effectiveCoords.lat;
      const refLng = effectiveCoords.lng;

      // Invariant 2: When ANY Utility Filter is active, ALL 724+ pandals are completely cleared/unmounted.
      // Pandal markers only render when no utility filter is active.
      if (!isUtilityActive) {
        PANDALS_DATA.forEach((pandal) => {
          // Search Query filter check
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
            if (!nameMatch && !metroMatch && !zoneMatch) return;
          }

          // Single Source of Truth: Unified Capsule Rail Filter Check
          const isMatchedByFilter = matchesPandalFilter(pandal, activeFilter, visitedList);
          if (!isMatchedByFilter) return;

          // In 'all' view with no search, prioritize featured first when zoomed out
          if (
            currentZoom < 14 &&
            !pandal.isFeatured &&
            activeFilter === 'all' &&
            !mapSearchQuery.trim()
          ) {
            return;
          }

          const isVisited = visitedSet.has(pandal.id);
          const consensus = crowdConsensusMap.get(pandal.id);
          const effectiveCrowd = consensus?.dominantLevel || pandal.crowdLevel;
          const crowdEmoji = effectiveCrowd === 'Low' ? '🟢' : effectiveCrowd === 'Moderate' ? '🟡' : effectiveCrowd === 'Heavy' ? '🔴' : '🟣';

          const marker = L.marker([pandal.lat, pandal.lng], {
            icon: createDynamicMarkerIcon('pandal', currentZoom, {
              isVisited,
              isFeatured: pandal.isFeatured,
            }),
            title: pandal.name[language] || pandal.name.en,
            zIndexOffset: isVisited ? 100 : pandal.isFeatured ? 300 : 200,
          });

          const tooltipContent = `
            <div style="font-family: system-ui, sans-serif; font-size: 11px; font-weight: 700; color: #FFFFFF; display: flex; align-items: center; gap: 4px;">
              <span>${pandal.name[language] || pandal.name.en}</span>
              <span style="font-size: 10px; font-weight: 600; opacity: 0.9;">· ${crowdEmoji} ${effectiveCrowd}</span>
            </div>
          `;

          marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: tooltipOffset,
            className: 'hopper-metro-station-tooltip',
          });

          marker.on('click', () => {
            onSelectPandal(pandal);
          });

          batchMarkers.push(marker);
        });

        // Add Suggested Community Pandals
        if (suggestedPandals && suggestedPandals.length > 0) {
          suggestedPandals.forEach((sp) => {
            if (!matchesPandalFilter(sp as unknown as Pandal, activeFilter)) return;

            const marker = L.marker([sp.lat, sp.lng], {
              icon: createDynamicMarkerIcon('pandal', currentZoom, {
                isCommunity: true,
                isFeatured: true,
              }),
              title: `[Community] ${sp.name[language] || sp.name.en}`,
              zIndexOffset: 350,
            });

            marker.bindTooltip(`[Community] ${sp.name[language] || sp.name.en}`, {
              direction: 'top',
              offset: tooltipOffset,
              className: 'hopper-metro-station-tooltip',
            });

            marker.on('click', () => {
              onSelectPandal(sp as unknown as Pandal);
            });

            batchMarkers.push(marker);
          });
        }
      }

      // Proximity-Sorted Utility POIs (Only rendered when a utility category is actively selected)
      if (isUtilityActive) {
        const matchingFacilities = CRITICAL_FACILITIES.filter((facility) => {
          if (activeFilter === 'police') return facility.category === 'police';
          if (activeFilter === 'toilets') return facility.category === 'toilets';
          if (activeFilter === 'food') return facility.category === 'food' || facility.category === 'restaurant';
          if (activeFilter === 'ferry') return facility.category === 'ferry';
          if (activeFilter === 'railway') return facility.category === 'railway';
          if ((activeFilter as string) === 'hospital') return facility.category === 'hospital' || facility.category === 'medical';
          return false;
        }).map((facility) => {
          const distKm = calculateDistanceKm(refLat, refLng, facility.lat, facility.lng);
          const distM = distKm * 1000;
          return { facility, distKm, distM };
        });

        // Sort ascending by distance from reference point
        matchingFacilities.sort((a, b) => a.distKm - b.distKm);

        // Limit to 15 closest nodes or nodes within 1.5km
        const displayedFacilities =
          matchingFacilities.length <= 15
            ? matchingFacilities
            : matchingFacilities.filter((item) => item.distM <= 1500).length >= 15
            ? matchingFacilities.filter((item) => item.distM <= 1500)
            : matchingFacilities.slice(0, 15);

        displayedFacilities.forEach(({ facility, distM, distKm }) => {
          let iconType: MarkerCategory = 'police';
          if (facility.category === 'police') iconType = 'police';
          else if (facility.category === 'toilets') iconType = 'toilet';
          else if (facility.category === 'food' || facility.category === 'restaurant') iconType = 'food';
          else if (facility.category === 'ferry') iconType = 'ferry';
          else if (facility.category === 'railway') iconType = 'railway';

          const eta = calculateCrowdWalkingEta(distM);
          const distanceBadgeText =
            distM < 1000 ? `${Math.round(distM)}m • ${eta.text}` : `${distKm.toFixed(1)} km • ${eta.text}`;
          const distanceShort = distM < 1000 ? `${Math.round(distM)}m` : `${distKm.toFixed(1)} km`;
          const displayName = facility.name[language] || facility.name.en;
          const displayAddress = facility.address ? (facility.address[language] || facility.address.en) : '';

          const marker = L.marker([facility.lat, facility.lng], {
            icon: createDynamicMarkerIcon(iconType, currentZoom),
            title: `${displayName} (${distanceShort})`,
            zIndexOffset: 400,
          });

          // Proximity Tooltip
          marker.bindTooltip(
            `<div class="font-sans text-xs font-bold text-white flex items-center gap-1.5">
              <span>${displayName}</span>
              <span class="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-black">${distanceShort}</span>
            </div>`,
            {
              direction: 'top',
              offset: tooltipOffset,
              className: 'hopper-metro-station-tooltip',
            }
          );

          // Rich Proximity Popup with Direct Google Maps Navigation
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
          const popupContent = `
            <div style="font-family: inherit; min-width: 200px; padding: 4px; color: #f8fafc;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #fbbf24; background: rgba(251, 191, 36, 0.15); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(251, 191, 36, 0.3);">
                  ${facility.category.toUpperCase()}
                </span>
                <span style="font-size: 10px; font-weight: 700; color: #34d399; background: rgba(52, 211, 153, 0.15); padding: 2px 6px; border-radius: 4px;">
                  📍 ${distanceBadgeText}
                </span>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 2px; line-height: 1.3;">
                ${displayName}
              </div>
              ${
                displayAddress
                  ? `<div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${displayAddress}
                    </div>`
                  : ''
              }
              <div style="padding-top: 6px; border-top: 1px solid rgba(148, 163, 184, 0.2); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; background: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 6px; text-decoration: none;">
                  🗺️ Directions
                </a>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, {
            className: 'hopper-leaflet-popup',
            maxWidth: 280,
          });

          marker.on('click', () => {
            onSelectFacility(facility);
          });

          batchMarkers.push(marker);
        });
      }

      // Batch mount all prepared markers into layer in single frame
      batchMarkers.forEach((m) => markersLayer.addLayer(m));
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [
    isMetroActive,
    isUtilityActive,
    activeFilter,
    mapSearchQuery,
    currentZoom,
    language,
    visitedList,
    suggestedPandals,
    effectiveCoords,
    crowdConsensusMap,
  ]);

  // Handle Active Walking Route Polyline
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    if (!activeWalkRoute) {
      if (!activeMetroRoute && (!trailStops || trailStops.length < 2)) {
        routesLayer.clearLayers();
      }
      return;
    }

    routesLayer.clearLayers();

    const from: [number, number] = [activeWalkRoute.fromCoords.lat, activeWalkRoute.fromCoords.lng];
    const to: [number, number] = [activeWalkRoute.pandal.lat, activeWalkRoute.pandal.lng];

    const glowLine = L.polyline([from, to], {
      color: '#F59E0B',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
    });

    const dashedLine = L.polyline([from, to], {
      color: '#FFB300',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.95,
      lineCap: 'round',
    });

    routesLayer.addLayer(glowLine);
    routesLayer.addLayer(dashedLine);

    const points: [number, number][] = [from, to];
    if (userCoords) {
      points.push([userCoords.lat, userCoords.lng]);
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 16, animate: true });
  }, [activeWalkRoute, userCoords]);

  // Handle Active Metro Route Polyline
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    if (!activeMetroRoute || activeMetroRoute.coordinates.length < 2) {
      if (!activeWalkRoute && (!trailStops || trailStops.length < 2)) {
        routesLayer.clearLayers();
      }
      return;
    }

    routesLayer.clearLayers();

    const coords = activeMetroRoute.coordinates;
    const lineColor =
      activeMetroRoute.line === 'green'
        ? '#10B981'
        : activeMetroRoute.line === 'orange'
        ? '#F97316'
        : activeMetroRoute.line === 'purple'
        ? '#9333EA'
        : activeMetroRoute.line === 'yellow'
        ? '#EAB308'
        : activeMetroRoute.line === 'interchange'
        ? '#EC4899'
        : '#2563EB';

    const outerCasing = L.polyline(coords, {
      color: '#FFFFFF',
      weight: 9,
      opacity: 0.55,
      lineCap: 'round',
    });

    const metroLine = L.polyline(coords, {
      color: lineColor,
      weight: 5.5,
      opacity: 0.98,
      lineCap: 'round',
    });

    routesLayer.addLayer(outerCasing);
    routesLayer.addLayer(metroLine);

    activeMetroRoute.stations.forEach((station) => {
      const stationDot = L.circleMarker([station.lat, station.lng], {
        radius: station.isInterchange ? 6.5 : 4.5,
        fillColor: station.isInterchange ? '#F59E0B' : lineColor,
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 1,
      });

      stationDot.bindTooltip(station.name[language] || station.name.en, {
        direction: 'top',
        className: 'metro-station-tooltip',
      });

      routesLayer.addLayer(stationDot);
    });

    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [80, 80], animate: true });
  }, [activeMetroRoute, language]);

  // Handle Multi-Stop Trail Polyline (Batched via requestAnimationFrame)
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    let rafId: number | null = null;

    rafId = requestAnimationFrame(() => {
      if (!trailStops || trailStops.length < 2) {
        if (!activeWalkRoute && !activeMetroRoute) {
          routesLayer.clearLayers();
        }
        return;
      }

      routesLayer.clearLayers();

      const latlngs: [number, number][] = trailStops.map((s) => [s.lat, s.lng]);

      const glowLine = L.polyline(latlngs, {
        color: '#F59E0B',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      });

      const dashedLine = L.polyline(latlngs, {
        color: '#FBBF24',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });

      routesLayer.addLayer(glowLine);
      routesLayer.addLayer(dashedLine);

      const dim = MapMarkerSizeHelper.getDimensions(currentZoom);
      const tooltipOffset: [number, number] = [0, -dim.iconAnchor[1] - 4];

      trailStops.forEach((stop, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === trailStops.length - 1;
        const icon = createDynamicMarkerIcon('trail-stop', currentZoom, {
          stopNumber: idx + 1,
          isTrailStart: isStart,
          isTrailEnd: isEnd,
        });

        const marker = L.marker([stop.lat, stop.lng], { icon, zIndexOffset: 2000 + idx });
        marker.bindTooltip(`Stop #${idx + 1}: ${stop.name[language] || stop.name.en}`, {
          direction: 'top',
          offset: tooltipOffset,
        });

        if (stop.pandalId) {
          marker.on('click', () => {
            const found = PANDALS_DATA.find((p) => p.id === stop.pandalId);
            if (found) onSelectPandal(found);
          });
        }

        routesLayer.addLayer(marker);
      });

      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16, animate: true });
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [trailStops, currentZoom, language]);

  // Center map on selectedItem (whether pandal, facility, or metro station)
  useEffect(() => {
    if (!selectedItem || !mapInstanceRef.current) return;
    mapInstanceRef.current.setView([selectedItem.lat, selectedItem.lng], 16, { animate: true });
  }, [selectedItem]);

  // Line isolation handler with smooth map fitBounds
  const handleToggleLineIsolation = (lineId: MetroLine | null) => {
    const map = mapInstanceRef.current;
    if (!isMetroActive) {
      setIsMetroActive(true);
      setIsLegendExpanded(true);
    }

    if (!lineId || isolatedLine === lineId) {
      setIsolatedLine(null);
      if (map) {
        // Fit all metro network stations
        const allCoords = METRO_STATIONS.map((s) => [s.lat, s.lng] as [number, number]);
        map.fitBounds(L.latLngBounds(allCoords), { padding: [60, 60], animate: true });
      }
    } else {
      setIsolatedLine(lineId);
      if (map) {
        const lineStations = getLineStations(lineId);
        if (lineStations.length > 0) {
          const coords = lineStations.map((s) => [s.lat, s.lng] as [number, number]);
          map.fitBounds(L.latLngBounds(coords), { padding: [70, 70], animate: true });
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
        const { latitude, longitude, accuracy } = position.coords;
        const clamped = clampToKolkata(latitude, longitude);
        onUserCoordsChange(clamped);
        setGpsStatusMsg(t.gpsFound);
        setTimeout(() => setGpsStatusMsg(null), 3000);

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([clamped.lat, clamped.lng], 15, { animate: true });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([clamped.lat, clamped.lng]);
          } else {
            const userIcon = L.divIcon({
              className: 'gps-user-marker',
              html: `
                <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
                  <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background-color: rgba(59, 130, 246, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="position: relative; width: 14px; height: 14px; border-radius: 9999px; background-color: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 0 10px rgba(37, 99, 235, 0.9);"></div>
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            const marker = L.marker([clamped.lat, clamped.lng], {
              icon: userIcon,
              zIndexOffset: 1000,
            }).addTo(map);

            marker.bindTooltip(t.yourLocation, { direction: 'top' });
            userMarkerRef.current = marker;
          }

          if (userCircleRef.current) {
            userCircleRef.current.setLatLng([clamped.lat, clamped.lng]);
            userCircleRef.current.setRadius(Math.max(50, accuracy));
          } else {
            const circle = L.circle([clamped.lat, clamped.lng], {
              radius: Math.max(50, accuracy),
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.12,
              weight: 1.5,
            }).addTo(map);
            userCircleRef.current = circle;
          }
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
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleLockNorth = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panBy([0, 0]);
      setGpsStatusMsg('Strict North Orientation Locked');
      setTimeout(() => setGpsStatusMsg(null), 2500);
    }
  };

  const handleSelectSearchResult = (pandal: Pandal) => {
    setIsSearchDropdownOpen(false);
    setMapSearchQuery(pandal.name[language] || pandal.name.en);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([pandal.lat, pandal.lng], 16, { animate: true });
    }
    onSelectPandal(pandal);
  };

  const getCommuteAdvice = (km: number) => {
    if (km < 1.5) return '🚶 Walking Distance (~15 mins)';
    if (km <= 5.0) return '🛺 Auto/Taxi recommended';
    return '🚇 Metro/Cab recommended';
  };

  return (
    <div id="map-view-container" className="relative w-full h-full overflow-hidden">
      {/* Primary Map Stage */}
      <div
        id="leaflet-map"
        ref={mapContainerRef}
        className="w-full h-full bg-[#0B0F19] z-0"
      />

      {/* Floating Top Search Bar */}
      <div className="absolute top-2.5 inset-x-2.5 max-w-md mx-auto z-25 pointer-events-none flex flex-col gap-1.5">
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
            className="absolute top-2 inset-x-2.5 max-w-md mx-auto z-30 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between gap-3 animate-slide-up"
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
          className="absolute top-2 inset-x-2.5 max-w-md mx-auto z-30 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-xl flex items-center justify-between gap-3 animate-slide-up"
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

      {/* Right HUD Controls: Compact Glassmorphic Dock */}
      <div className="absolute top-[108px] right-3 z-20 flex flex-col gap-1 items-center pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-750/90 rounded-2xl p-1 shadow-xl shadow-black/50">
        {/* Dedicated METRO Map Layer Toggle */}
        <button
          id="map-metro-toggle-btn"
          onClick={handleToggleMetro}
          className={`flex flex-col items-center justify-center w-8.5 h-8.5 rounded-xl transition-all active:scale-95 ${
            isMetroActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isMetroActive ? 'Deactivate Metro Mode & Restore Pandals' : 'Activate Metro Network Mode'}
          aria-label="Toggle Metro Lines"
        >
          <Train className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-slate-800 my-0.5" />

        {/* Zoom In & Zoom Out Buttons */}
        <button
          id="map-zoom-in-btn"
          onClick={handleZoomIn}
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          id="map-zoom-out-btn"
          onClick={handleZoomOut}
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-5 h-[1px] bg-slate-800 my-0.5" />

        {/* Lock North Button */}
        <button
          id="lock-north-btn"
          onClick={handleLockNorth}
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          title="Strictly Locked to True North (N 0°)"
          aria-label="Lock North"
        >
          <Compass className="w-4 h-4 text-amber-400" />
        </button>

        {/* Find My Location */}
        <button
          id="gps-locate-btn"
          onClick={handleFindLocation}
          disabled={gpsLoading}
          className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            userCoords
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title={gpsLoading ? t.gpsSearching : t.locateMe}
          aria-label="Find GPS Location"
        >
          <Crosshair
            className={`w-4 h-4 ${
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

      {/* Floating Active Trail Badge (Non-intrusive when trail is active) */}
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
        {/* Proximity Quick-Preview Card for Closest Utility Node */}
        {closestUtilitySummary && (
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
                    <span className="truncate">{closestUtilitySummary.totalCount} in area</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">
                    {closestUtilitySummary.closest.name[language] || closestUtilitySummary.closest.name.en}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
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
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs active:scale-95 transition"
                >
                  Details
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
          />
        </div>
      </div>
    </div>
  );
};
