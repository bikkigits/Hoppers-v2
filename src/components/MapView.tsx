import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Pandal,
  FacilityPoint,
  FilterType,
  Language,
  VisitedPandal,
  WalkRoute,
  MetroMapRoute,
} from '../types';
import {
  PANDALS_DATA,
  CRITICAL_FACILITIES,
  METRO_STATIONS,
} from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { formatDistance, estimateWalkingMinutes } from '../utils/geo';
import { NearbyFilterBar } from './NearbyFilterBar';
import {
  Crosshair,
  Compass,
  Plus,
  Minus,
  X,
  Route,
  Train,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  language: Language;
  onSelectPandal: (pandal: Pandal) => void;
  onSelectFacility: (facility: FacilityPoint) => void;
  userCoords: { lat: number; lng: number } | null;
  onUserCoordsChange: (coords: { lat: number; lng: number } | null) => void;
  visitedList: VisitedPandal[];
  activeWalkRoute?: WalkRoute | null;
  onClearWalkRoute?: () => void;
  activeMetroRoute?: MetroMapRoute | null;
  onClearMetroRoute?: () => void;
}

export const MapView: React.FC<Props> = ({
  language,
  onSelectPandal,
  onSelectFacility,
  userCoords,
  onUserCoordsChange,
  visitedList,
  activeWalkRoute,
  onClearWalkRoute,
  activeMetroRoute,
  onClearMetroRoute,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [currentZoom, setCurrentZoom] = useState(13);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  // Pure SVG/Tailwind widget markers (Lucide icons in colored circular divs)
  const createWidgetIcon = (
    type: 'pandal' | 'police' | 'toilet' | 'metro' | 'railway' | 'food' | 'ferry',
    isVisited: boolean = false,
    isFeatured: boolean = false
  ) => {
    let size = 32;
    let bgColor = '#1E293B';
    let borderColor = '#FFB300';
    let iconSvg = '';
    let extraBadge = '';

    if (type === 'pandal') {
      if (isVisited) {
        size = 34;
        bgColor = '#059669';
        borderColor = '#34D399';
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      } else if (isFeatured) {
        size = 38;
        bgColor = '#FFB300';
        borderColor = '#FFFFFF';
        // Diya / Sacred Flame icon with dark contrast
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0B0F19" stroke="#0B0F19" stroke-width="1.5"><path d="M12 2c-1.5 2.5-3 5-3 8 0 2.5 1.5 4 3 4s3-1.5 3-4c0-3-1.5-5.5-3-8z"/><path d="M5 14c0 3.5 3.1 6 7 6s7-2.5 7-6H5z"/></svg>`;
        extraBadge = `
          <div style="position: absolute; -top: 4px; -right: 4px; width: 14px; height: 14px; border-radius: 9999px; background-color: #EF4444; border: 1.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #FFFFFF; font-weight: 900;">
            ★
          </div>
        `;
      } else {
        size = 32;
        bgColor = '#1E293B';
        borderColor = '#FFB300';
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#FFB300" stroke="#FFB300" stroke-width="1"><path d="M12 2c-1.5 2.5-3 5-3 8 0 2.5 1.5 4 3 4s3-1.5 3-4c0-3-1.5-5.5-3-8z"/><path d="M5 14c0 3.5 3.1 6 7 6s7-2.5 7-6H5z"/></svg>`;
      }
    } else if (type === 'police') {
      size = 30;
      bgColor = '#EF4444';
      borderColor = '#FEE2E2';
      // Shield
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    } else if (type === 'toilet') {
      size = 28;
      bgColor = '#10B981';
      borderColor = '#D1FAE5';
      // Restroom
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h6a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9a3 3 0 0 1 3-3z"/><circle cx="12" cy="3" r="1"/></svg>`;
    } else if (type === 'metro') {
      size = 32;
      bgColor = '#2563EB';
      borderColor = '#DBEAFE';
      // Train
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/></svg>`;
    } else if (type === 'railway') {
      size = 32;
      bgColor = '#7C3AED';
      borderColor = '#EDE9FE';
      // Railway terminal
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="15" rx="3"/><path d="M3 10h18"/><circle cx="8" cy="14" r="1.5" fill="#FFF"/><circle cx="16" cy="14" r="1.5" fill="#FFF"/><path d="m7 21-2 2"/><path d="m17 21 2 2"/></svg>`;
    } else if (type === 'food') {
      size = 28;
      bgColor = '#F97316';
      borderColor = '#FFEDD5';
      // Utensils
      iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M2 6h8a4 4 0 0 1 4 4v12M6 2v4"/></svg>`;
    } else if (type === 'ferry') {
      size = 28;
      bgColor = '#06B6D4';
      borderColor = '#E0F2FE';
      // Anchor/Waves
      iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/></svg>`;
    }

    const html = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        background-color: ${bgColor};
        border: 2.5px solid ${borderColor};
        border-radius: 9999px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.15s ease-out;
      ">
        ${iconSvg}
        ${extraBadge}
      </div>
    `;

    return L.divIcon({
      className: 'hopper-widget-marker',
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Central Kolkata default
    const map = L.map(mapContainerRef.current, {
      center: [22.5726, 88.3639],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false, // Replaced with custom control stack on top-right
      attributionControl: false,
      // Rigid North orientation: touch-rotation disabled
      touchZoom: true,
      boxZoom: false,
      doubleClickZoom: true,
      scrollWheelZoom: true,
    });

    // 1. Standard, Free OpenStreetMap tile provider (No API Key Required watermark)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Track zoom level for zoom-tiered decluttering
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    const routesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    routesLayerRef.current = routesLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Handle container resize
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

  // Update Markers when filter, zoom level, language, or visited list changes
  // Decluttering logic:
  // - If zoom < 15: show only featured pandals
  // - If zoom >= 15: show all pandals
  // - Critical Facilities & POIs: ONLY show when their specific filter is active
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersLayer || !map) return;

    markersLayer.clearLayers();

    const visitedSet = new Set(visitedList.map((v) => v.pandalId));

    // Filter states
    const showAll = activeFilter === 'all';
    const showNorth = showAll || activeFilter === 'north';
    const showSouth = showAll || activeFilter === 'south';

    // 1. Add Pandals (Zoom-Tiered)
    PANDALS_DATA.forEach((pandal) => {
      const matchNorth = pandal.zone === 'North' && showNorth;
      const matchSouth = (pandal.zone === 'South' || pandal.zone === 'Central') && showSouth;

      if (matchNorth || matchSouth) {
        // Zoom decluttering constraint:
        // Default / zoomed-out view (< 15): show only featured pandals!
        // Zoom >= 15: reveal all pandals
        if (currentZoom < 15 && !pandal.isFeatured && activeFilter === 'all') {
          return;
        }

        const isVisited = visitedSet.has(pandal.id);
        const marker = L.marker([pandal.lat, pandal.lng], {
          icon: createWidgetIcon('pandal', isVisited, pandal.isFeatured),
          title: pandal.name[language] || pandal.name.en,
          zIndexOffset: isVisited ? 100 : pandal.isFeatured ? 300 : 200,
        });

        marker.on('click', () => {
          onSelectPandal(pandal);
        });

        markersLayer.addLayer(marker);
      }
    });

    // 2. Add POIs (Police, Toilets, Food, Railway, Ferry)
    // Hoppers Bible Rule: POIs only show when their specific filter pill is active!
    if (activeFilter === 'police' || activeFilter === 'toilets' || activeFilter === 'food' || activeFilter === 'ferry' || activeFilter === 'railway') {
      CRITICAL_FACILITIES.forEach((facility) => {
        let shouldShow = false;
        let iconType: 'police' | 'toilet' | 'food' | 'ferry' | 'railway' = 'police';

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
            icon: createWidgetIcon(iconType),
            title: facility.name[language] || facility.name.en,
            zIndexOffset: 250,
          });

          marker.on('click', () => {
            onSelectFacility(facility);
          });

          markersLayer.addLayer(marker);
        }
      });
    }

    // 3. Add Metro Stations: ONLY show when 'metro' filter is active
    if (activeFilter === 'metro') {
      METRO_STATIONS.forEach((station) => {
        const marker = L.marker([station.lat, station.lng], {
          icon: createWidgetIcon('metro'),
          title: station.name[language] || station.name.en,
          zIndexOffset: 280,
        });

        marker.on('click', () => {
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
        });

        markersLayer.addLayer(marker);
      });
    }
  }, [activeFilter, currentZoom, language, visitedList]);

  // Handle Active Walking Route Polyline
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    // Clear previous routes in this layer if no walk route
    if (!activeWalkRoute) {
      if (!activeMetroRoute) {
        routesLayer.clearLayers();
      }
      return;
    }

    routesLayer.clearLayers();

    const from: [number, number] = [activeWalkRoute.fromCoords.lat, activeWalkRoute.fromCoords.lng];
    const to: [number, number] = [activeWalkRoute.pandal.lat, activeWalkRoute.pandal.lng];

    // Outer glow casing
    const glowLine = L.polyline([from, to], {
      color: '#F59E0B',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
    });

    // Stylized Dashed Polyline
    const dashedLine = L.polyline([from, to], {
      color: '#FFB300',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.95,
      lineCap: 'round',
    });

    routesLayer.addLayer(glowLine);
    routesLayer.addLayer(dashedLine);

    // Zoom/fit map to show complete route
    const bounds = L.latLngBounds([from, to]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16, animate: true });
  }, [activeWalkRoute]);

  // Handle Active Metro Route Polyline
  useEffect(() => {
    const routesLayer = routesLayerRef.current;
    const map = mapInstanceRef.current;
    if (!routesLayer || !map) return;

    if (!activeMetroRoute || activeMetroRoute.coordinates.length < 2) {
      if (!activeWalkRoute) {
        routesLayer.clearLayers();
      }
      return;
    }

    routesLayer.clearLayers();

    const coords = activeMetroRoute.coordinates;
    const lineColor =
      activeMetroRoute.line === 'green'
        ? '#10B981'
        : activeMetroRoute.line === 'interchange'
        ? '#EAB308'
        : '#2563EB';

    // Outer white casing
    const outerCasing = L.polyline(coords, {
      color: '#FFFFFF',
      weight: 8,
      opacity: 0.45,
      lineCap: 'round',
    });

    // Solid colored metro route polyline
    const metroLine = L.polyline(coords, {
      color: lineColor,
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
    });

    routesLayer.addLayer(outerCasing);
    routesLayer.addLayer(metroLine);

    // Add intermediate station markers along the metro route
    activeMetroRoute.stations.forEach((station) => {
      const stationDot = L.circleMarker([station.lat, station.lng], {
        radius: station.isInterchange ? 6 : 4.5,
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

    // Fit map bounds to metro route
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [60, 60], animate: true });
  }, [activeMetroRoute, language]);

  // GPS "Find My Location" logic with animated pulsing blue dot
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

          // Render Animated Pulsing Blue Dot for live location
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

            userMarkerRef.current = L.marker([latitude, longitude], {
              icon: userIcon,
              zIndexOffset: 1000,
            }).addTo(map);
          }

          // Accuracy Ring
          if (userCircleRef.current) {
            userCircleRef.current.setLatLng([latitude, longitude]);
            userCircleRef.current.setRadius(Math.max(25, accuracy));
          } else {
            userCircleRef.current = L.circle([latitude, longitude], {
              radius: Math.max(25, accuracy),
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.15,
              weight: 1.5,
            }).addTo(map);
          }
        }
      },
      (error) => {
        setGpsLoading(false);
        console.warn('Geolocation denied or unavailable:', error.message);
        setGpsStatusMsg(t.gpsDenied);
        setTimeout(() => setGpsStatusMsg(null), 4000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      }
    );
  };

  // Zoom controls handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Reset to True North & Central Kolkata
  const handleLockNorth = () => {
    const map = mapInstanceRef.current;
    if (map) {
      // Re-center gently with North-facing orientation
      map.panTo(map.getCenter(), { animate: true });
      setGpsStatusMsg('Locked True North (0°)');
      setTimeout(() => setGpsStatusMsg(null), 2000);
    }
  };

  // Calculate walking route distance & duration for the floating banner
  let walkDistanceStr = '';
  let walkMinutesEst = 0;
  if (activeWalkRoute) {
    const dKm =
      Math.hypot(
        (activeWalkRoute.pandal.lat - activeWalkRoute.fromCoords.lat) * 111,
        (activeWalkRoute.pandal.lng - activeWalkRoute.fromCoords.lng) *
          111 *
          Math.cos((activeWalkRoute.pandal.lat * Math.PI) / 180)
      );
    walkDistanceStr = formatDistance(dKm);
    walkMinutesEst = estimateWalkingMinutes(dKm);
  }

  return (
    <div id="map-view-container" className="relative w-full h-[calc(100vh-62px)] overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />

      {/* Floating Active Walk Route Banner */}
      {activeWalkRoute && (
        <div
          id="active-walk-route-banner"
          className="absolute top-3 inset-x-3 max-w-md mx-auto z-20 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl flex items-center justify-between gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Route className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {t.routeActive}
                </span>
                <span className="text-[10px] text-slate-400">• {walkDistanceStr} (~{walkMinutesEst}m)</span>
              </div>
              <p className="text-xs font-bold text-white truncate">
                {activeWalkRoute.pandal.name[language] || activeWalkRoute.pandal.name.en}
              </p>
            </div>
          </div>

          {onClearWalkRoute && (
            <button
              onClick={onClearWalkRoute}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 active:scale-95 transition shrink-0"
              title={t.clearRoute}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Floating Active Metro Route Banner */}
      {activeMetroRoute && !activeWalkRoute && (
        <div
          id="active-metro-route-banner"
          className="absolute top-3 inset-x-3 max-w-md mx-auto z-20 pointer-events-auto p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-blue-500/40 shadow-2xl flex items-center justify-between gap-3 animate-slide-up"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Train className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Metro Route Active
              </span>
              <p className="text-xs font-bold text-white truncate">
                {activeMetroRoute.stations[0]?.name[language] || activeMetroRoute.stations[0]?.name.en} → {activeMetroRoute.stations[activeMetroRoute.stations.length - 1]?.name[language] || activeMetroRoute.stations[activeMetroRoute.stations.length - 1]?.name.en}
              </p>
            </div>
          </div>

          {onClearMetroRoute && (
            <button
              onClick={onClearMetroRoute}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 active:scale-95 transition shrink-0"
              title={t.clearRoute}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Zoom Tier Level Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 font-medium shadow-lg flex items-center gap-1.5">
          <span>{currentZoom < 15 ? '★ Featured Pandals' : 'All Pandals Visible'}</span>
          <span className="text-[10px] text-amber-400/80 font-mono">z{currentZoom}</span>
        </div>
      </div>

      {/* Right Controls Stack: Zoom (+/-), Lock North, Find My Location */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-center pointer-events-auto">
        {/* Zoom In & Zoom Out Buttons */}
        <div className="flex flex-col rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-xl overflow-hidden">
          <button
            id="map-zoom-in-btn"
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-slate-800 text-white transition active:scale-95 border-b border-white/10"
            title="Zoom In"
          >
            <Plus className="w-4 h-4 text-slate-200" />
          </button>
          <button
            id="map-zoom-out-btn"
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-slate-800 text-white transition active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4 text-slate-200" />
          </button>
        </div>

        {/* Lock North Button (Placed on RIGHT side directly below zoom controls) */}
        <button
          id="lock-north-btn"
          onClick={handleLockNorth}
          className="flex flex-col items-center justify-center w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/15 text-white shadow-xl hover:bg-slate-800 active:scale-95 transition"
          title="Strictly Locked to True North (N 0°)"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] font-bold leading-none text-slate-300 mt-0.5">N</span>
        </button>

        {/* Find My Location (Placed on RIGHT side directly below Lock North) */}
        <button
          id="gps-locate-btn"
          onClick={handleFindLocation}
          disabled={gpsLoading}
          className={`flex flex-col items-center justify-center w-10 h-10 rounded-2xl shadow-xl border backdrop-blur-md transition-all active:scale-95 ${
            userCoords
              ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/20'
              : 'bg-slate-900/90 text-slate-200 border-white/15 hover:bg-slate-800'
          }`}
          title={gpsLoading ? t.gpsSearching : t.locateMe}
        >
          <Crosshair
            className={`w-4 h-4 text-blue-400 ${
              gpsLoading ? 'animate-spin' : ''
            }`}
          />
          <span className="text-[8px] font-bold leading-none mt-0.5">GPS</span>
        </button>

        {/* Status Toast */}
        {gpsStatusMsg && (
          <div
            id="gps-status-pill"
            className="absolute right-12 top-20 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-amber-500/40 text-amber-300 text-xs font-medium shadow-2xl backdrop-blur-md whitespace-nowrap animate-fade-in"
          >
            {gpsStatusMsg}
          </div>
        )}
      </div>

      {/* Floating Filter Bar directly above the bottom dock */}
      <div className="absolute bottom-20 left-0 right-0 z-20 pointer-events-none">
        <NearbyFilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          language={language}
        />
      </div>
    </div>
  );
};
