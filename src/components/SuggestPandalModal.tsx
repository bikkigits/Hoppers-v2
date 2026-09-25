import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Language, Zone, SuggestedPandal } from '../types';
import { METRO_STATIONS } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { calculateDistanceKm } from '../utils/geo';
import {
  X,
  MapPin,
  Train,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  RotateCcw,
  Send,
  User,
  Phone,
  Mail,
  Compass,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userCoords: { lat: number; lng: number } | null;
  onSubmitSuccess: (pandal: SuggestedPandal) => void;
}

export const SuggestPandalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  userCoords,
  onSubmitSuccess,
}) => {
  const t = TRANSLATIONS[language];

  // Coordinates state (defaults to userCoords or Central Kolkata Esplanade)
  const defaultCoords = userCoords || { lat: 22.5645, lng: 88.3524 };
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(defaultCoords);

  // Form Fields
  const [pandalName, setPandalName] = useState('');
  const [zone, setZone] = useState<Zone>('Central');
  const [isZoneAuto, setIsZoneAuto] = useState(true);
  const [locality, setLocality] = useState('');
  const [theme, setTheme] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');

  // GPS & Map State
  const [mapLayer, setMapLayer] = useState<'street' | 'hybrid'>('street');
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: boolean; submitterName?: boolean; submitterPhone?: boolean }>({});

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Synchronize initial coordinates when userCoords becomes available
  useEffect(() => {
    if (userCoords && !gpsActive) {
      setCoords(userCoords);
    }
  }, [userCoords]);

  // Spatial Auto-Calculation for Zone
  useEffect(() => {
    if (!isZoneAuto) return;
    const { lat, lng } = coords;
    let detectedZone: Zone = 'Central';
    if (lat > 22.585) {
      detectedZone = 'North';
    } else if (lat < 22.535) {
      detectedZone = 'South';
    } else if (lng > 88.390) {
      detectedZone = 'East';
    } else {
      detectedZone = 'Central';
    }
    setZone(detectedZone);
  }, [coords, isZoneAuto]);

  // Spatial Calculation for Nearest Metro Station
  const nearestMetroInfo = React.useMemo(() => {
    let closestStation = METRO_STATIONS[0];
    let minDistance = Infinity;

    for (const station of METRO_STATIONS) {
      const dist = calculateDistanceKm(coords.lat, coords.lng, station.lat, station.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestStation = station;
      }
    }

    const distFormatted =
      minDistance < 1
        ? `${Math.round(minDistance * 1000)}m`
        : `${minDistance.toFixed(2)} km`;
    const walkMin = Math.max(2, Math.round(minDistance * 13));

    return {
      station: closestStation,
      distanceKm: minDistance,
      distanceFormatted: distFormatted,
      walkMinutes: walkMin,
    };
  }, [coords]);

  // Initialize Leaflet Mini-Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      const streetTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      streetTiles.addTo(map);
      tileLayerRef.current = streetTiles;

      // Custom Lotus Pin Icon
      const lotusPinHtml = `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 34px; height: 34px; border-radius: 9999px; background: radial-gradient(circle, #DC2626 0%, #991B1B 100%); border: 2.5px solid #FDE047; box-shadow: 0 0 15px rgba(220, 38, 38, 0.7); display: flex; align-items: center; justify-content: center; transform: translateY(-4px);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: 0px; left: 50%; transform: translateX(-50%); width: 6px; height: 6px; border-radius: 9999px; background: #FDE047; box-shadow: 0 0 6px #FDE047;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: lotusPinHtml,
        className: 'suggest-pandal-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 34],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        setGpsActive(false);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        setGpsActive(false);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Update Tile Layer Street vs Hybrid
  const handleToggleLayer = (layer: 'street' | 'hybrid') => {
    setMapLayer(layer);
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTiles =
      layer === 'street'
        ? L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { maxZoom: 19 }
          )
        : L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { maxZoom: 18 }
          );
    newTiles.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTiles;
  };

  // Recenter Map
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.setView([coords.lat, coords.lng], 16, { animate: true });
    markerRef.current.setLatLng([coords.lat, coords.lng]);
  };

  // Trigger GPS On Location
  const handleLocateOnLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(newCoords);
        setGpsActive(true);
        setGpsAccuracy(Math.round(pos.coords.accuracy));

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newCoords.lat, newCoords.lng], 16, { animate: true });
          markerRef.current.setLatLng([newCoords.lat, newCoords.lng]);
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn('GPS location error:', err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: boolean; submitterName?: boolean; submitterPhone?: boolean } = {};
    if (!pandalName.trim()) errors.name = true;
    if (!submitterName.trim()) errors.submitterName = true;
    if (!submitterPhone.trim()) errors.submitterPhone = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const metroName = nearestMetroInfo.station.name[language] || nearestMetroInfo.station.name.en;
    const newPandal: SuggestedPandal = {
      id: `suggested-${Date.now()}`,
      name: {
        en: pandalName.trim(),
        bn: pandalName.trim(),
        hi: pandalName.trim(),
      },
      zone,
      locality: locality.trim() || undefined,
      nearestMetro: metroName,
      nearestMetroEn: nearestMetroInfo.station.name.en,
      walkingTimeToMetroMin: nearestMetroInfo.walkMinutes,
      lat: coords.lat,
      lng: coords.lng,
      theme: {
        en: theme.trim() || 'Community Puja Exhibition',
        bn: theme.trim() || 'পাড়ার সর্বজনীন পুজো',
        hi: theme.trim() || 'सामुदायिक दुर्गा पूजा',
      },
      crowdLevel: 'Moderate',
      facilities: ['Drinking Water', 'Police Aid', 'First Aid'],
      description: {
        en: `Suggested community pandal in ${zone} Kolkata. Verified by local devotees.`,
        bn: `${zone} কলকাতার ভক্তদের প্রস্তাবিত পাড়ার দুর্গাপূজা।`,
        hi: `${zone} कोलकाता में भक्तों द्वारा सुझाया गया पंडाल।`,
      },
      highlight: {
        en: `Near ${nearestMetroInfo.station.name.en} Metro (${nearestMetroInfo.distanceFormatted})`,
        bn: `${metroName} মেট্রো সংলগ্ন (${nearestMetroInfo.distanceFormatted})`,
        hi: `${nearestMetroInfo.station.name.hi} मेट्रो के निकट (${nearestMetroInfo.distanceFormatted})`,
      },
      submitterName: submitterName.trim(),
      submitterPhone: submitterPhone.trim(),
      submitterEmail: submitterEmail.trim() || undefined,
      status: 'pending',
      createdAt: Date.now(),
    };

    // Save to local storage
    try {
      const stored = localStorage.getItem('hoppers_suggested_pandals');
      const list: SuggestedPandal[] = stored ? JSON.parse(stored) : [];
      list.unshift(newPandal);
      localStorage.setItem('hoppers_suggested_pandals', JSON.stringify(list));
    } catch (err) {
      console.error('Failed to save suggested pandal to localStorage:', err);
    }

    setIsSubmitted(true);
    onSubmitSuccess(newPandal);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setPandalName('');
    setLocality('');
    setTheme('');
    setSubmitterName('');
    setSubmitterPhone('');
    setSubmitterEmail('');
    setFormErrors({});
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="suggest-pandal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-amber-500/25 rounded-3xl shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
              <MapPin className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5 leading-snug">
                {t.suggestPandalTitle}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">
                {t.suggestPandalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          {isSubmitted ? (
            /* Submission Success State */
            <div className="py-8 flex flex-col items-center text-center space-y-4 animate-scale-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {t.pandalSubmittedSuccess}
                </h3>
                <p className="text-slate-300 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                  {t.pandalSubmittedMsg}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left w-full space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Pandal Name:</span>
                  <span className="font-semibold text-white">{pandalName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Zone:</span>
                  <span className="font-semibold text-amber-400">{zone} Kolkata</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Nearest Metro:</span>
                  <span className="font-semibold text-emerald-400">
                    {nearestMetroInfo.station.name[language] || nearestMetroInfo.station.name.en} ({nearestMetroInfo.distanceFormatted})
                  </span>
                </div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold transition shadow-lg active:scale-98"
              >
                Done / Explore on Map
              </button>
            </div>
          ) : (
            /* Suggestion Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-Spam Notice */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-amber-200/90 font-medium">
                  {t.suggestAntiSpam}
                </p>
              </div>

              {/* Pandal Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t.pandalNameLabel}
                </label>
                <input
                  type="text"
                  value={pandalName}
                  onChange={(e) => {
                    setPandalName(e.target.value);
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder={t.pandalNamePlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 transition ${
                    formErrors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[10px] text-rose-400 mt-1">Please enter the pandal or para name.</p>
                )}
              </div>

              {/* Zone (with Auto-Calculated badge) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-200">
                    {t.zoneLabel}
                  </label>
                  {isZoneAuto && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-md">
                      Auto-Calculated
                    </span>
                  )}
                </div>
                <select
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value as Zone);
                    setIsZoneAuto(false);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 transition"
                >
                  <option value="North">North Kolkata</option>
                  <option value="Central">Central Kolkata</option>
                  <option value="South">South Kolkata</option>
                  <option value="East">East Kolkata (Salt Lake / EM Bypass)</option>
                </select>
              </div>

              {/* Locality or Street Landmark */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t.localityLabel}
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder={t.localityPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 transition"
                />
              </div>

              {/* Pin Location on Map Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {t.pinLocationLabel}
                  </span>

                  {/* Mini-map Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleLocateOnLocation}
                      disabled={gpsLoading}
                      className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition"
                    >
                      <Crosshair className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                      {t.onLocationBtn}
                    </button>

                    <div className="flex rounded-lg bg-slate-800/80 border border-slate-700/80 p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleToggleLayer('street')}
                        className={`px-1.5 py-0.5 rounded-md font-medium transition ${
                          mapLayer === 'street' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
                        }`}
                      >
                        {t.streetLayer}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLayer('hybrid')}
                        className={`px-1.5 py-0.5 rounded-md font-medium transition ${
                          mapLayer === 'hybrid' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'
                        }`}
                      >
                        {t.hybridLayer}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleRecenter}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={t.recenterBtn}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* GPS Location Status Pill */}
                {gpsActive && (
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Positioned to your live location {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}
                    </span>
                    <span className="font-mono text-[9px] bg-emerald-500/20 px-1 rounded text-emerald-200">
                      {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Interactive Leaflet Mini-Map Container */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
                  <div ref={mapContainerRef} className="w-full h-full" />
                  <div className="absolute bottom-2 left-2 z-10 pointer-events-none px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[9px] text-slate-300 border border-slate-800">
                    Tap or drag pin to position
                  </div>
                </div>

                {/* Spatial Auto-Calculation Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* Auto-Calculated Zone Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center text-amber-400 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{t.autoCalculatedZone}</p>
                      <p className="text-xs font-bold text-amber-400 truncate">
                        {zone} Kolkata
                      </p>
                    </div>
                  </div>

                  {/* Calculated Nearest Metro Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                      <Train className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400">{t.calculatedMetro}</p>
                      <p className="text-xs font-bold text-emerald-400 truncate">
                        {nearestMetroInfo.station.name[language] || nearestMetroInfo.station.name.en}{' '}
                        <span className="text-[10px] font-normal text-slate-300">
                          ({nearestMetroInfo.distanceFormatted})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme or Notes (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t.themeOptionalLabel}
                </label>
                <textarea
                  rows={2}
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={t.themePlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 transition resize-none"
                />
              </div>

              {/* Contact Details For Verification */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    {t.contactDetailsTitle}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    {t.contactDetailsSub}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      {t.yourNameLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={submitterName}
                        onChange={(e) => {
                          setSubmitterName(e.target.value);
                          if (formErrors.submitterName) setFormErrors((prev) => ({ ...prev, submitterName: false }));
                        }}
                        placeholder={t.yourNamePlaceholder}
                        className={`w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-400 ${
                          formErrors.submitterName ? 'border-rose-500' : 'border-slate-800'
                        }`}
                      />
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                      {t.phoneLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={submitterPhone}
                        onChange={(e) => {
                          setSubmitterPhone(e.target.value);
                          if (formErrors.submitterPhone) setFormErrors((prev) => ({ ...prev, submitterPhone: false }));
                        }}
                        placeholder={t.phonePlaceholder}
                        className={`w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-400 ${
                          formErrors.submitterPhone ? 'border-rose-500' : 'border-slate-800'
                        }`}
                      />
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={submitterEmail}
                      onChange={(e) => setSubmitterEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs active:scale-95 transition"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  {t.submitPandalBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
