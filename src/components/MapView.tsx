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
import { formatDistance, estimateWalkingMinutes, calculateDistanceKm } from '../utils/geo';
import { createDynamicMarkerIcon, MarkerCategory } from '../utils/markerStyles';
import { MapMarkerSizeHelper } from '../utils/MapMarkerSizeHelper';
import { NearbyFilterBar } from './NearbyFilterBar';
import { MetroLegend } from './MetroLegend';
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
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowLeftRight,
  Waves,
  Eye,
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

  const prevNonMetroFilterRef = useRef<FilterType>('all');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [mapFilter, setMapFilter] = useState<'all' | 'featured' | 'heritage' | 'saved'>('all');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Synchronized Metro state
  const isMetroActive = activeFilter === 'metro';
  const [isolatedLine, setIsolatedLine] = useState<MetroLine | null>(null);
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  const t = TRANSLATIONS[language];

  // Synchronized Metro rail toggle handler
  const handleToggleMetro = () => {
    if (isMetroActive) {
      // Toggle OFF: Restore previous non-metro filter or default to 'all'
      const fallbackFilter = prevNonMetroFilterRef.current === 'metro' ? 'all' : prevNonMetroFilterRef.current;
      setActiveFilter(fallbackFilter);
      setIsolatedLine(null);
    } else {
      // Toggle ON: Remember current non-metro filter, activate metro, and expand legend
      prevNonMetroFilterRef.current = activeFilter;
      setActiveFilter('metro');
      setIsLegendExpanded(true);
    }
  };

  // Intercept category filter selection from NearbyFilterBar
  const handleFilterChange = (newFilter: FilterType) => {
    if (newFilter === 'metro') {
      if (activeFilter !== 'metro') {
        prevNonMetroFilterRef.current = activeFilter;
      }
      setActiveFilter('metro');
      setIsLegendExpanded(true);
    } else {
      prevNonMetroFilterRef.current = newFilter;
      setActiveFilter(newFilter);
      setIsolatedLine(null);
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Central Kolkata default
    const map = L.map(mapContainerRef.current, {
      center: [22.5645, 88.3516], // Esplanade central hub
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      keepBuffer: 12,
      crossOrigin: true,
    }).addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
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
      map.remove();
      mapInstanceRef.current = null;
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

  // Update Pandals and other POI Markers (Mutual Visibility & Layer Isolation with RAF Batching)
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    if (!markersLayer) return;

    let rafId: number | null = null;

    rafId = requestAnimationFrame(() => {
      markersLayer.clearLayers();

      // When Metro mode is active, completely clear & isolate metro view (hide all pandals & POIs)
      if (isMetroActive) {
        return;
      }

      const visitedSet = new Set(visitedList.map((v) => v.pandalId));

      const showAll = activeFilter === 'all';
      const showNorth = showAll || activeFilter === 'north';
      const showSouth = showAll || activeFilter === 'south';

      const dim = MapMarkerSizeHelper.getDimensions(currentZoom);
      const tooltipOffset: [number, number] = [0, -dim.iconAnchor[1] - 4];

      const batchMarkers: L.Marker[] = [];

      // 1. Add Pandals (Zoom-Tiered with Top Filter & Search)
      PANDALS_DATA.forEach((pandal) => {
        // Top filter chips check
        if (mapFilter === 'featured' && !pandal.isFeatured) return;
        if (mapFilter === 'saved' && !visitedSet.has(pandal.id)) return;
        if (mapFilter === 'heritage') {
          const text = (pandal.theme.en + ' ' + pandal.name.en + ' ' + pandal.description.en).toLowerCase();
          const isHeritage =
            text.includes('heritage') ||
            text.includes('traditional') ||
            text.includes('rajbari') ||
            text.includes('bagbazar') ||
            text.includes('kumartuli') ||
            text.includes('sovabazar');
          if (!isHeritage) return;
        }

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

        const matchNorth = pandal.zone === 'North' && showNorth;
        const matchSouth = (pandal.zone === 'South' || pandal.zone === 'Central' || pandal.zone === 'East') && showSouth;

        if (matchNorth || matchSouth || showAll) {
          if (
            currentZoom < 14 &&
            !pandal.isFeatured &&
            activeFilter === 'all' &&
            mapFilter === 'all' &&
            !mapSearchQuery.trim()
          ) {
            return;
          }

          const isVisited = visitedSet.has(pandal.id);
          const marker = L.marker([pandal.lat, pandal.lng], {
            icon: createDynamicMarkerIcon('pandal', currentZoom, {
              isVisited,
              isFeatured: pandal.isFeatured,
            }),
            title: pandal.name[language] || pandal.name.en,
            zIndexOffset: isVisited ? 100 : pandal.isFeatured ? 300 : 200,
          });

          marker.bindTooltip(pandal.name[language] || pandal.name.en, {
            direction: 'top',
            offset: tooltipOffset,
            className: 'hopper-metro-station-tooltip',
          });

          marker.on('click', () => {
            onSelectPandal(pandal);
          });

          batchMarkers.push(marker);
        }
      });

      // 1b. Add Suggested Community Pandals
      if (suggestedPandals && suggestedPandals.length > 0) {
        suggestedPandals.forEach((sp) => {
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

      // 2. Add POIs (Police, Toilets, Food, Railway, Ferry)
      if (activeFilter === 'police' || activeFilter === 'toilets' || activeFilter === 'food' || activeFilter === 'ferry' || activeFilter === 'railway') {
        CRITICAL_FACILITIES.forEach((facility) => {
          let shouldShow = false;
          let iconType: MarkerCategory = 'police';

          if (facility.category === 'police' && activeFilter === 'police') {
            shouldShow = true;
            iconType = 'police';
          } else if (facility.category === 'toilets' && activeFilter === 'toilets') {
            shouldShow = true;
            iconType = 'toilet';
          } else if (facility.category === 'food' && activeFilter === 'food') {
            shouldShow = true;
            iconType = 'food';
          } else if (facility.category === 'ferry' && activeFilter === 'ferry') {
            shouldShow = true;
            iconType = 'ferry';
          } else if (facility.category === 'railway' && activeFilter === 'railway') {
            shouldShow = true;
            iconType = 'railway';
          }

          if (shouldShow) {
            const marker = L.marker([facility.lat, facility.lng], {
              icon: createDynamicMarkerIcon(iconType, currentZoom),
              title: facility.name[language] || facility.name.en,
              zIndexOffset: 250,
            });

            marker.bindTooltip(facility.name[language] || facility.name.en, {
              direction: 'top',
              offset: tooltipOffset,
              className: 'hopper-metro-station-tooltip',
            });

            marker.on('click', () => {
              onSelectFacility(facility);
            });

            batchMarkers.push(marker);
          }
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
  }, [isMetroActive, activeFilter, mapFilter, mapSearchQuery, currentZoom, language, visitedList, suggestedPandals]);

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
      prevNonMetroFilterRef.current = activeFilter;
      setActiveFilter('metro');
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

  const handleResetIsolation = () => {
    handleToggleLineIsolation(null);
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
        const coords = { lat: latitude, lng: longitude };
        onUserCoordsChange(coords);
        setGpsStatusMsg(t.gpsFound);
        setTimeout(() => setGpsStatusMsg(null), 3000);

        const map = mapInstanceRef.current;
        if (map) {
          map.setView([latitude, longitude], 15, { animate: true });

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
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

            const marker = L.marker([latitude, longitude], {
              icon: userIcon,
              zIndexOffset: 1000,
            }).addTo(map);

            marker.bindTooltip(t.yourLocation, { direction: 'top' });
            userMarkerRef.current = marker;
          }

          if (userCircleRef.current) {
            userCircleRef.current.setLatLng([latitude, longitude]);
            userCircleRef.current.setRadius(Math.max(50, accuracy));
          } else {
            const circle = L.circle([latitude, longitude], {
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

      {/* Floating Top Search Bar & Quick Filter Chips */}
      <div className="absolute top-2 inset-x-2.5 max-w-md mx-auto z-25 pointer-events-none flex flex-col gap-1.5">
        <div className="relative pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-xl shadow-black/60">
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
                className="p-1 rounded-lg text-slate-400 hover:text-white"
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
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                      View
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Filter Chips immediately below Search Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar pointer-events-auto px-0.5">
          <button
            onClick={() => setMapFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition shadow-sm ${
              mapFilter === 'all'
                ? 'bg-red-600 text-white shadow-red-600/30'
                : 'bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            All ({PANDALS_DATA.length})
          </button>
          <button
            onClick={() => setMapFilter('featured')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition flex items-center gap-1 ${
              mapFilter === 'featured'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/30'
                : 'bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t.filterFeatured} ({PANDALS_DATA.filter((p) => p.isFeatured).length})
          </button>
          <button
            onClick={() => setMapFilter('heritage')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition flex items-center gap-1 ${
              mapFilter === 'heritage'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/30'
                : 'bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            👑 {t.filterHeritage}
          </button>
          <button
            onClick={() => setMapFilter('saved')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition flex items-center gap-1 ${
              mapFilter === 'saved'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-amber-500/30'
                : 'bg-slate-900/90 backdrop-blur-md text-slate-300 border border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            🔖 {t.filterSaved} ({visitedList.length})
          </button>
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

      {/* Right Controls Stack: METRO Toggle, Zoom (+/-), Lock North, Find My Location */}
      <div className="absolute top-[96px] right-2.5 z-15 flex flex-col gap-1.5 items-center pointer-events-auto">
        {/* Dedicated METRO Map Layer Toggle */}
        <button
          id="map-metro-toggle-btn"
          onClick={handleToggleMetro}
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl shadow-lg border backdrop-blur-md transition-all active:scale-95 ${
            isMetroActive
              ? 'bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-blue-400 shadow-blue-500/30 ring-2 ring-blue-400/30'
              : 'bg-slate-900/85 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
          title={isMetroActive ? 'Deactivate Metro Mode & Restore Pandals' : 'Activate Metro Network Mode'}
        >
          <Train className={`w-4 h-4 ${isMetroActive ? 'text-white' : 'text-slate-400'}`} />
          <span className="text-[7px] font-black tracking-wider leading-none mt-0.5">METRO</span>
        </button>

        {/* Zoom In & Zoom Out Buttons */}
        <div className="flex flex-col rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-lg overflow-hidden">
          <button
            id="map-zoom-in-btn"
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95 border-b border-slate-800/80"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out-btn"
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Lock North Button */}
        <button
          id="lock-north-btn"
          onClick={handleLockNorth}
          className="flex flex-col items-center justify-center w-9 h-9 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white shadow-lg hover:bg-slate-800 active:scale-95 transition"
          title="Strictly Locked to True North (N 0°)"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-[8px] font-semibold leading-none text-slate-400 mt-0.5">N</span>
        </button>

        {/* Find My Location */}
        <button
          id="gps-locate-btn"
          onClick={handleFindLocation}
          disabled={gpsLoading}
          className={`flex flex-col items-center justify-center w-9 h-9 rounded-xl shadow-lg border backdrop-blur-md transition-all active:scale-95 ${
            userCoords
              ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
              : 'bg-slate-900/85 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
          title={gpsLoading ? t.gpsSearching : t.locateMe}
        >
          <Crosshair
            className={`w-4 h-4 ${
              userCoords ? 'text-white' : 'text-slate-300'
            } ${gpsLoading ? 'animate-spin' : ''}`}
          />
          <span className="text-[7px] font-bold leading-none mt-0.5">GPS</span>
        </button>

        {/* Status Toast */}
        {gpsStatusMsg && (
          <div
            id="gps-status-pill"
            className="absolute right-11 top-24 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-200 text-xs font-medium shadow-xl backdrop-blur-md whitespace-nowrap animate-fade-in"
          >
            {gpsStatusMsg}
          </div>
        )}
      </div>

      {/* Unified Floating Bottom Stage (Strictly anchored above BottomNav dock with zero overlap) */}
      <div
        id="map-floating-bottom-stage"
        className="absolute bottom-[calc(var(--bottom-dock-height)+var(--safe-bottom)+12px)] inset-x-0 z-20 pointer-events-none flex flex-col gap-2"
      >
        {/* Row 1: Action Buttons (+ Add Pandal on Left & Route on Right) */}
        <div className="flex items-center justify-between px-3 w-full max-w-md mx-auto">
          {/* Floating Left: + Add Pandal */}
          {onOpenSuggestPandal && (
            <button
              id="map-floating-add-pandal-btn"
              onClick={onOpenSuggestPandal}
              className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-black/80 border border-red-400/50 active:scale-95 transition"
              title={t.suggestPandalTitle}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.addPandalBtn}</span>
            </button>
          )}

          {/* Floating Right: Route Planner */}
          {onOpenTrailBuilder && (
            <button
              id="map-floating-route-btn"
              onClick={onOpenTrailBuilder}
              className={`pointer-events-auto ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full backdrop-blur-md font-bold text-xs shadow-lg shadow-black/80 border active:scale-95 transition ${
                trailStops && trailStops.length > 0
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/20'
                  : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
              }`}
              title={t.trailBuilderTitle}
            >
              <Route className="w-3.5 h-3.5" />
              <span>{t.tabTrail || 'Route'}</span>
              {trailStops && trailStops.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[9px] font-black flex items-center justify-center">
                  {trailStops.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Row 2: Horizontal Nearby Filter Rail */}
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

