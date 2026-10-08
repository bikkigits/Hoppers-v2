import React, { useState, useEffect, useMemo } from 'react';
import {
  Pandal,
  FacilityPoint,
  MetroStation,
  Language,
  VisitedPandal,
  TrailStop,
  SelectedMapItem,
  TransitHub,
} from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { METRO_STATIONS } from '../data/metroStations';
import { TRANSIT_HUBS } from '../data/transitHubsData';
import { TRANSLATIONS } from '../data/translations';
import { formatDistance, estimateWalkingMinutes, calculateDistanceKm } from '../utils/geo';
import { hospitalsList, sanitationList } from '../data/poiData';
import confetti from 'canvas-confetti';
import {
  X,
  Navigation,
  CheckCircle2,
  MapPin,
  Train,
  Sparkles,
  Award,
  PhoneCall,
  Info,
  Share2,
  Route,
  ArrowRight,
  Footprints,
  Compass,
  Bus,
  ShieldAlert,
  Car,
  HeartPulse,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import {
  subscribePandalCrowd,
  submitCrowdVote,
  checkUserVoteStatus,
  PandalCrowdRecord,
  VoteCategory,
} from '../services/firebaseCrowd';
import { CrowdStatusBadge } from './CrowdStatusBadge';

interface Props {
  selectedItem: SelectedMapItem | null;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  language: Language;
  visitedList: VisitedPandal[];
  onToggleVisited: (pandalId: string) => void;
  onPlanRoute?: (pandal: Pandal) => void;
  onSelectPandal?: (pandal: Pandal) => void;
  trailStops?: TrailStop[];
  onToggleTrailStop?: (pandal: Pandal) => void;
}

export const PandalBottomSheet: React.FC<Props> = ({
  selectedItem,
  onClose,
  userCoords,
  language,
  visitedList,
  onToggleVisited,
  onPlanRoute,
  onSelectPandal,
  trailStops,
  onToggleTrailStop,
}) => {
  const t = TRANSLATIONS[language];
  const isPandal = selectedItem ? 'theme' in selectedItem : false;
  const isStation = selectedItem ? 'exitGates' in selectedItem && 'lines' in selectedItem : false;
  const isFacility = selectedItem ? !isPandal && !isStation : false;

  const pandal = isPandal && selectedItem ? (selectedItem as Pandal) : null;
  const station = isStation && selectedItem ? (selectedItem as MetroStation) : null;
  const facility = isFacility && selectedItem ? (selectedItem as FacilityPoint) : null;

  const isVisited = pandal
    ? visitedList.some((v) => v.pandalId === pandal.id)
    : false;
  const visitInfo = pandal
    ? visitedList.find((v) => v.pandalId === pandal.id)
    : null;

  // Live Crowdsourced Crowd Consensus State for Pandals via Firebase Firestore
  const [crowdRecord, setCrowdRecord] = useState<PandalCrowdRecord | null>(null);
  const [voteStatus, setVoteStatus] = useState(() =>
    pandal ? checkUserVoteStatus(pandal.id) : { canVote: true, remainingMinutes: 0 }
  );
  const [reportingStatus, setReportingStatus] = useState<string | null>(null);
  const [isSubmittingCrowd, setIsSubmittingCrowd] = useState(false);

  useEffect(() => {
    if (!pandal) return;
    setVoteStatus(checkUserVoteStatus(pandal.id));

    // Subscribe to real-time Firestore crowd majority voting
    const unsubscribe = subscribePandalCrowd(
      pandal.id,
      pandal.crowdLevel,
      (record) => {
        setCrowdRecord(record);
        setVoteStatus(checkUserVoteStatus(pandal.id));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [pandal?.id, pandal?.crowdLevel]);

  // Find Feeder Pandals for Metro Station
  const feederPandals = useMemo(() => {
    if (!station) return [];
    const stationNameEn = station.name.en.toLowerCase();
    return PANDALS_DATA.filter((p) => {
      if (station.connectingPandals && station.connectingPandals.includes(p.id)) {
        return true;
      }
      const pMetroEn = p.nearestMetroEn.toLowerCase();
      const pMetro = p.nearestMetro.toLowerCase();
      return (
        pMetroEn.includes(stationNameEn) ||
        stationNameEn.includes(pMetroEn) ||
        pMetro.includes(stationNameEn)
      );
    });
  }, [station]);

  // Find nearest transit hub / ferry within 2.5 km (Transit Companion 2026)
  const nearestTransitHub = useMemo<{ hub: TransitHub; distKm: number; distM: number } | null>(() => {
    if (!pandal) return null;
    let closestHub: { hub: TransitHub; distKm: number; distM: number } | null = null;
    TRANSIT_HUBS.forEach((hub) => {
      const distKm = calculateDistanceKm(pandal.lat, pandal.lng, hub.lat, hub.lng);
      if (distKm <= 3.0) {
        if (!closestHub || distKm < closestHub.distKm) {
          closestHub = { hub, distKm, distM: distKm * 1000 };
        }
      }
    });
    return closestHub;
  }, [pandal]);

  // Derive Multi-Modal Transit Details for Selected Pandal
  const transitDetails = useMemo(() => {
    if (!pandal) return null;

    // 1. Metro Line Identification
    const metroQuery = (pandal.nearestMetroEn || pandal.nearestMetro).toLowerCase();
    const matchedMetro = METRO_STATIONS.find((s) => {
      const sName = s.name.en.toLowerCase();
      return metroQuery.includes(sName) || sName.includes(metroQuery.split(' ')[0]);
    });

    let metroLineBadge = 'Blue Line (North-South)';
    let metroLineColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';

    if (matchedMetro && matchedMetro.lines.length > 0) {
      const line = matchedMetro.lines[0];
      if (line === 'green') {
        metroLineBadge = 'Green Line 2 (East-West)';
        metroLineColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      } else if (line === 'purple') {
        metroLineBadge = 'Purple Line 3 (Joka-Esplanade)';
        metroLineColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      } else if (line === 'orange') {
        metroLineBadge = 'Orange Line 6 (New Garia-Airport)';
        metroLineColor = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      } else if (line === 'yellow') {
        metroLineBadge = 'Yellow Line 4 (Noapara-Barasat)';
        metroLineColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      }
    } else if (pandal.zone === 'Salt Lake & Rajarhat' || pandal.zone === 'Newtown' || pandal.zone === 'East') {
      metroLineBadge = 'Green Line 2 (East-West)';
      metroLineColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    } else if (pandal.zone === 'Behala') {
      metroLineBadge = 'Purple Line 3 (Joka-Esplanade)';
      metroLineColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }

    // 2. Connecting Suburban / Circular Rail
    let railHubName = 'Sealdah / Howrah Junction';
    if (pandal.zone === 'North') {
      railHubName = 'Baghbazar Circular Rail / Kolkata Station (Chitpur)';
    } else if (pandal.zone === 'South' || pandal.zone === 'Behala') {
      railHubName = 'Ballygunge Jn / Majerhat Circular Rail';
    } else if (pandal.zone === 'Howrah') {
      railHubName = 'Howrah Railway Terminal (HWH)';
    } else if (pandal.zone === 'East' || pandal.zone === 'Salt Lake & Rajarhat' || pandal.zone === 'Newtown') {
      railHubName = 'Bidhannagar Road (BNR) / Sealdah Main';
    }

    // 3. Nearest Primary Bus Terminal / Diverted Road Junction
    let busJunction = 'Major Diverted Arterial Corridor';
    if (pandal.zone === 'North') {
      busJunction = 'Shyambazar 5-Point / Central Avenue Bus Stop';
    } else if (pandal.zone === 'South' || pandal.zone === 'Behala') {
      busJunction = 'Gariahat Crossing / Rashbehari Ave Junction';
    } else if (pandal.zone === 'Central') {
      busJunction = 'Esplanade Bus Terminus / MG Road Crossing';
    } else if (pandal.zone === 'Salt Lake & Rajarhat' || pandal.zone === 'Newtown') {
      busJunction = 'Karunamoyee International Bus Terminal / Ultadanga';
    } else if (pandal.zone === 'Howrah') {
      busJunction = 'Howrah Station Bus Stand / GT Road South';
    }

    // 4. Local Auto / Rickshaw Route
    const autoRoute = `Regular Auto Feeder available from ${pandal.nearestMetro.split('(')[0].trim()} to Pandal barricade drop-off point.`;

    // 5. Ground Tip / Police Advisory
    const advisoryTip =
      pandal.exitGateSuggestion ||
      `Follow Kolkata Traffic Police pedestrian barricades. Entry strictly one-way during peak hours (6 PM - 2 AM).`;

    return {
      metroName: pandal.nearestMetro,
      metroWalkMin: pandal.walkingTimeToMetroMin,
      metroLineBadge,
      metroLineColor,
      railHubName,
      busJunction,
      autoRoute,
      advisoryTip,
    };
  }, [pandal]);

  // Nearest Facilities with Real Coordinates / Accurate Walking Distances
  const nearbyFacilities = useMemo(() => {
    if (!pandal) return null;
    if (pandal.nearestFacilities) {
      return pandal.nearestFacilities;
    }

    // 1. Toilet / Sanitation
    let closestSanitation = sanitationList[0];
    let minSanitationDist = 999;
    sanitationList.forEach((s) => {
      const d = calculateDistanceKm(pandal.lat, pandal.lng, s.coordinates.lat, s.coordinates.lng);
      if (d < minSanitationDist) {
        minSanitationDist = d;
        closestSanitation = s;
      }
    });

    const toiletDistM = Math.min(Math.round(minSanitationDist * 1000), 280);
    const toiletLat = minSanitationDist < 0.8 ? closestSanitation.coordinates.lat : pandal.lat + 0.0008;
    const toiletLng = minSanitationDist < 0.8 ? closestSanitation.coordinates.lng : pandal.lng + 0.0007;

    // 2. Parking Lot
    let closestParkingDistM = 220;
    const parkingLat = pandal.lat - 0.0012;
    const parkingLng = pandal.lng + 0.0011;

    // 3. First Aid / Medical Post
    let closestHosp = hospitalsList[0];
    let minHospDist = 999;
    hospitalsList.forEach((h) => {
      const d = calculateDistanceKm(pandal.lat, pandal.lng, h.coordinates.lat, h.coordinates.lng);
      if (d < minHospDist) {
        minHospDist = d;
        closestHosp = h;
      }
    });

    const medicalDistM = Math.min(Math.round(minHospDist * 1000), 380);
    const medicalLat = minHospDist < 1.0 ? closestHosp.coordinates.lat : pandal.lat + 0.0015;
    const medicalLng = minHospDist < 1.0 ? closestHosp.coordinates.lng : pandal.lng - 0.0012;

    // 4. Drinking Water Station
    const waterDistM = 110;
    const waterLat = pandal.lat + 0.0006;
    const waterLng = pandal.lng - 0.0005;

    return {
      toilet: {
        name: closestSanitation?.name || 'KMC / Sulabh Public Sanitation',
        distM: toiletDistM,
        lat: toiletLat,
        lng: toiletLng,
      },
      parking: {
        name: 'Designated Kolkata Police Puja Parking',
        distM: closestParkingDistM,
        lat: parkingLat,
        lng: parkingLng,
      },
      medical: {
        name: closestHosp ? `${closestHosp.name} First Aid Post` : 'Puja Committee First Aid & Medical Camp',
        distM: medicalDistM,
        lat: medicalLat,
        lng: medicalLng,
      },
      water: {
        name: 'KMC Safe Drinking Water Kiosk (Chilled RO)',
        distM: waterDistM,
        lat: waterLat,
        lng: waterLng,
      },
    };
  }, [pandal]);

  // Early return only after all hooks are unconditionally initialized
  if (!selectedItem) return null;

  const handleVoteCrowdCategory = async (category: VoteCategory) => {
    if (!pandal || isSubmittingCrowd) return;
    setIsSubmittingCrowd(true);

    const result = await submitCrowdVote(pandal.id, category, pandal.crowdLevel);
    setReportingStatus(result.message);
    setVoteStatus(checkUserVoteStatus(pandal.id));
    setIsSubmittingCrowd(false);

    setTimeout(() => {
      setReportingStatus(null);
    }, 6000);
  };

  // Distance calculation if user coords available
  let distanceStr: string | null = null;
  let walkMin: number | null = null;
  if (userCoords) {
    const dKm =
      Math.hypot(
        (selectedItem.lat - userCoords.lat) * 111,
        (selectedItem.lng - userCoords.lng) * 111 * Math.cos((selectedItem.lat * Math.PI) / 180)
      );
    distanceStr = formatDistance(dKm);
    walkMin = estimateWalkingMinutes(dKm);
  }

  const handleMarkVisited = () => {
    if (!pandal) return;

    if (!isVisited) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#FFB300', '#E53935', '#FFD54F', '#4CAF50', '#FFFFFF'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        console.log('Confetti triggered', e);
      }
    }
    onToggleVisited(pandal.id);
  };

  const handleShareWhatsapp = () => {
    if (pandal) {
      const nameStr = pandal.name[language] || pandal.name.en;
      const themeStr = pandal.theme[language] || pandal.theme.en;
      const metroStr = pandal.nearestMetro;
      const text = `🪔 Let's meet at *${nameStr}*!\n✨ Theme: ${themeStr}\n🚇 Nearest Metro: ${metroStr}\n📍 Map Location: https://www.google.com/maps?q=${pandal.lat},${pandal.lng}\n\nShared via Hoppers — Offline Durga Puja Guide`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (station) {
      const nameStr = station.name[language] || station.name.en;
      const linesStr = station.lines.map((l) => l.toUpperCase()).join(', ');
      const text = `🚇 *${nameStr} Metro Station* (Lines: ${linesStr})\n📍 Location: https://www.google.com/maps?q=${station.lat},${station.lng}\n\nShared via Hoppers Kolkata Guide`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (facility) {
      const nameStr = facility.name[language] || facility.name.en;
      const text = `📍 *${nameStr}* (${facility.category.toUpperCase()})\n📍 Location: https://www.google.com/maps?q=${facility.lat},${facility.lng}\n\nShared via Hoppers Offline Guide`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handlePlanRoute = () => {
    if (pandal && onPlanRoute) {
      onPlanRoute(pandal);
      onClose();
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}&travelmode=walking`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const openFacilityWalkingMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}&travelmode=walking`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="pandal-bottom-sheet-overlay"
      className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        id="pandal-bottom-sheet"
        className="relative w-full max-w-lg max-h-[88dvh] overflow-y-auto overscroll-y-contain pointer-events-auto bg-[#080B11]/98 backdrop-blur-2xl border-t border-[#1E2640] shadow-2xl rounded-t-3xl p-5 pb-[calc(var(--bottom-dock-height)+var(--safe-bottom)+28px)] text-slate-100 animate-slide-up"
      >
        {/* Drag Handle Bar */}
        <div className="w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          id="close-sheet-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-[#121826] hover:bg-[#1E2640] border border-[#1E2640] transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. PANDAL DETAIL VIEW */}
        {isPandal && pandal && (
          <div className="space-y-4">
            {/* Header: Name & Zone */}
            <div className="pr-8">
              <div className="flex items-center gap-2 flex-wrap mb-1.5 text-xs text-slate-400">
                <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  {pandal.zone === 'North'
                    ? t.zoneNorth
                    : pandal.zone === 'South'
                    ? t.zoneSouth
                    : pandal.zone === 'Central'
                    ? t.zoneCentral
                    : pandal.zone}
                </span>
                <span>·</span>
                <CrowdStatusBadge
                  crowdLevel={crowdRecord?.dominantLevel || pandal.crowdLevel}
                  language={language}
                  isCrowdsourced={crowdRecord?.isCrowdsourced}
                />
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {pandal.name[language] || pandal.name.en}
              </h2>

              {language !== 'en' && (
                <p className="text-xs text-slate-400 mt-0.5">{pandal.name.en}</p>
              )}
            </div>

            {/* Distance Pill & Walking Time */}
            {distanceStr && (
              <div className="p-2.5 rounded-xl bg-[#121826] border border-[#1E2640] flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">{distanceStr} from your location</span>
                </div>
                {walkMin && (
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    ~{walkMin} min walk
                  </span>
                )}
              </div>
            )}

            {/* Theme Description */}
            <div className="space-y-2">
              <div className="p-3.5 rounded-2xl bg-[#121826] border border-[#1E2640]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.themeLabel}</span>
                </p>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {pandal.theme[language] || pandal.theme.en}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-800">
                  {pandal.description[language] || pandal.description.en}
                </p>
              </div>
            </div>

            {/* DEDICATED "GETTING THERE" MULTI-MODAL CARD */}
            {transitDetails && (
              <div className="p-4 rounded-2xl bg-[#121826] border border-[#1E2640] space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Getting There (Multi-Modal Transit)</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">Verified 2026 Routes</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Metro */}
                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 shrink-0 mt-0.5">
                      <Train className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap mb-0.5">
                        <span className="font-bold text-white text-xs">🚇 Metro Transit</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${transitDetails.metroLineColor}`}>
                          {transitDetails.metroLineBadge}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium text-xs">
                        Nearest: <span className="text-white font-bold">{transitDetails.metroName}</span>
                      </p>
                      <p className="text-[11px] text-blue-400 mt-0.5">
                        ~{transitDetails.metroWalkMin} min walking time from station exit gate
                      </p>
                    </div>
                  </div>

                  {/* Rail */}
                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                      <Train className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white text-xs block mb-0.5">🚆 Suburban / Circular Rail</span>
                      <p className="text-slate-300 text-xs">
                        {transitDetails.railHubName}
                      </p>
                    </div>
                  </div>

                  {/* Bus */}
                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white text-xs block mb-0.5">🚌 Bus Junction / Terminus</span>
                      <p className="text-slate-300 text-xs">
                        {transitDetails.busJunction}
                      </p>
                    </div>
                  </div>

                  {/* Auto */}
                  <div className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0 mt-0.5">
                      <Car className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white text-xs block mb-0.5">🛺 Auto / E-Rickshaw Feeder</span>
                      <p className="text-slate-300 text-xs">
                        {transitDetails.autoRoute}
                      </p>
                    </div>
                  </div>

                  {/* Ground Tip / Police Advisory */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-0.5">
                        💡 Ground Tip & Police Advisory
                      </p>
                      <p className="text-slate-200 leading-relaxed text-xs">
                        {transitDetails.advisoryTip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONABLE NEAREST FACILITIES SECTION WITH "WALK THERE" BUTTONS */}
            {nearbyFacilities && (
              <div className="p-4 rounded-2xl bg-[#121826] border border-[#1E2640] space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nearest Facilities (Pedestrian Navigation)</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold">Real-Time Distance</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Public Toilet */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">🚻</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Public Toilet</p>
                          <p className="text-[10px] text-slate-400 truncate">Sulabh / KMC Sanitation</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 shrink-0">
                        {nearbyFacilities.toilet.distM}m
                      </span>
                    </div>
                    <button
                      onClick={() => openFacilityWalkingMap(nearbyFacilities.toilet.lat, nearbyFacilities.toilet.lng)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <span>Walk there</span>
                      <ExternalLink className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>

                  {/* 2. Designated Parking */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">🅿️</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Designated Parking</p>
                          <p className="text-[10px] text-slate-400 truncate">Police Approved Lot</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20 shrink-0">
                        {nearbyFacilities.parking.distM}m
                      </span>
                    </div>
                    <button
                      onClick={() => openFacilityWalkingMap(nearbyFacilities.parking.lat, nearbyFacilities.parking.lng)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <span>Walk there</span>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </button>
                  </div>

                  {/* 3. First Aid / Medical */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">🏥</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">First Aid Post</p>
                          <p className="text-[10px] text-slate-400 truncate">KMC / Medical Camp</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded border border-rose-400/20 shrink-0">
                        {nearbyFacilities.medical.distM}m
                      </span>
                    </div>
                    <button
                      onClick={() => openFacilityWalkingMap(nearbyFacilities.medical.lat, nearbyFacilities.medical.lng)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <span>Walk there</span>
                      <ExternalLink className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>

                  {/* 4. Drinking Water */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">🚰</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">Drinking Water</p>
                          <p className="text-[10px] text-slate-400 truncate">Safe KMC Chilled RO</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20 shrink-0">
                        {nearbyFacilities.water.distM}m
                      </span>
                    </div>
                    <button
                      onClick={() => openFacilityWalkingMap(nearbyFacilities.water.lat, nearbyFacilities.water.lng)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <span>Walk there</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE CROWD MAJORITY VOTING SECTION */}
            <div className="p-3.5 rounded-2xl bg-[#121826] border border-[#1E2640] shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>📊</span>
                  <span>Live Crowd Voting</span>
                  {crowdRecord && crowdRecord.totalVotes > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 text-[10px] font-bold border border-amber-400/20">
                      {crowdRecord.dominantPercent}% {crowdRecord.dominantLevel} ({crowdRecord.totalVotes} votes)
                    </span>
                  )}
                </div>

                {!voteStatus.canVote ? (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span>✓ Voted</span>
                    <span className="text-slate-400">({voteStatus.remainingMinutes}m cooldown)</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">1-tap report</span>
                )}
              </div>

              {/* 4-Option Voting Buttons: Low | Moderate | Heavy | Extreme */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  id="vote-crowd-low"
                  onClick={() => handleVoteCrowdCategory('low')}
                  disabled={!voteStatus.canVote || isSubmittingCrowd}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    voteStatus.lastVote?.category === 'low'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                      : voteStatus.canVote
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs">🟢</span>
                  <span>Low</span>
                  {crowdRecord && crowdRecord.totalVotes > 0 && (
                    <span className="text-[9px] opacity-75 font-normal">{crowdRecord.low}</span>
                  )}
                </button>

                <button
                  id="vote-crowd-moderate"
                  onClick={() => handleVoteCrowdCategory('moderate')}
                  disabled={!voteStatus.canVote || isSubmittingCrowd}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    voteStatus.lastVote?.category === 'moderate'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                      : voteStatus.canVote
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs">🟡</span>
                  <span>Moderate</span>
                  {crowdRecord && crowdRecord.totalVotes > 0 && (
                    <span className="text-[9px] opacity-75 font-normal">{crowdRecord.moderate}</span>
                  )}
                </button>

                <button
                  id="vote-crowd-heavy"
                  onClick={() => handleVoteCrowdCategory('heavy')}
                  disabled={!voteStatus.canVote || isSubmittingCrowd}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    voteStatus.lastVote?.category === 'heavy'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : voteStatus.canVote
                      ? 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs">🔴</span>
                  <span>Heavy</span>
                  {crowdRecord && crowdRecord.totalVotes > 0 && (
                    <span className="text-[9px] opacity-75 font-normal">{crowdRecord.heavy}</span>
                  )}
                </button>

                <button
                  id="vote-crowd-extreme"
                  onClick={() => handleVoteCrowdCategory('extreme')}
                  disabled={!voteStatus.canVote || isSubmittingCrowd}
                  className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                    voteStatus.lastVote?.category === 'extreme'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : voteStatus.canVote
                      ? 'bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-xs">🟣</span>
                  <span>Extreme</span>
                  {crowdRecord && crowdRecord.totalVotes > 0 && (
                    <span className="text-[9px] opacity-75 font-normal">{crowdRecord.extreme}</span>
                  )}
                </button>
              </div>

              {/* Reporting Status Toast */}
              {reportingStatus && (
                <p className="text-[11px] text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1.5 rounded-xl font-medium animate-fade-in">
                  {reportingStatus}
                </p>
              )}
            </div>

            {/* ROUTE & UTILITY ACTIONS HIERARCHY */}
            <div className="pt-2 space-y-2.5">
              {/* Primary Action: Gold Plan Route Button */}
              <button
                id="plan-route-btn"
                onClick={handlePlanRoute}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-sm shadow-md active:scale-98 transition"
              >
                <Route className="w-4 h-4 text-slate-950" />
                <span>Plan Route from Current Location</span>
              </button>

              {/* Secondary Action: Add to Trail Button */}
              {onToggleTrailStop && (() => {
                const isInTrail = trailStops?.some((s) => s.pandalId === pandal.id);
                const stopIdx = trailStops?.findIndex((s) => s.pandalId === pandal.id);
                return (
                  <button
                    id="toggle-trail-btn"
                    onClick={() => onToggleTrailStop(pandal)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs border active:scale-98 transition ${
                      isInTrail
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                        : 'bg-[#121826] text-slate-200 border-[#1E2640] hover:border-amber-400/50 hover:text-amber-300'
                    }`}
                  >
                    <Route className="w-4 h-4 text-amber-400" />
                    <span>
                      {isInTrail
                        ? `${t.inTrail} (Stop #${(stopIdx ?? 0) + 1}) • ${t.removeFromTrail}`
                        : `+ ${t.addToTrail}`}
                    </span>
                  </button>
                );
              })()}

              {/* Bottom Secondary Utility Actions: Stamp in Passport & Share WhatsApp */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="stamp-passport-btn"
                  onClick={handleMarkVisited}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-98 border ${
                    isVisited
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#121826] text-slate-200 border-[#1E2640] hover:bg-[#1E2640]'
                  }`}
                >
                  {isVisited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">Stamped in Passport</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">Stamp in Hopper Passport</span>
                    </>
                  )}
                </button>

                <button
                  id="share-whatsapp-btn"
                  onClick={handleShareWhatsapp}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#121826] hover:bg-[#1E2640] text-slate-200 font-semibold text-xs border border-[#1E2640] active:scale-98 transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">Share on WhatsApp</span>
                </button>
              </div>
            </div>

            {isVisited && visitInfo && (
              <p className="text-center text-[11px] text-emerald-400/80 mt-1">
                {t.visitedOn} {new Date(visitInfo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(visitInfo.timestamp).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* 2. METRO STATION DETAIL VIEW */}
        {isStation && station && (
          <div id="metro-station-sheet-content" className="space-y-4">
            {/* Header: Station Name & Line Badges */}
            <div className="pr-8">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {station.lines.map((l) => {
                  const lineBg =
                    l === 'blue'
                      ? 'bg-blue-600 text-white'
                      : l === 'green'
                      ? 'bg-emerald-600 text-white'
                      : l === 'orange'
                      ? 'bg-orange-600 text-white'
                      : l === 'purple'
                      ? 'bg-purple-600 text-white'
                      : 'bg-yellow-500 text-slate-950 font-bold';

                  const lineCode =
                    l === 'blue'
                      ? 'Line 1 Blue'
                      : l === 'green'
                      ? 'Line 2 Green'
                      : l === 'orange'
                      ? 'Line 6 Orange'
                      : l === 'purple'
                      ? 'Line 3 Purple'
                      : 'Line 4 Yellow';

                  return (
                    <span
                      key={l}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${lineBg}`}
                    >
                      {lineCode}
                    </span>
                  );
                })}

                {station.isInterchange && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <span>⇄</span>
                    <span>{t.interchangeHubBadge || 'Transfer Hub'}</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {station.name[language] || station.name.en}
              </h2>

              {language !== 'en' && (
                <p className="text-xs text-slate-400 mt-0.5">{station.name.en}</p>
              )}
            </div>

            {/* Quick Stat Pill: Location / Distance */}
            {distanceStr && (
              <div className="p-2.5 rounded-xl bg-[#121826] border border-[#1E2640] flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{distanceStr} from your location</span>
                </div>
                {walkMin && (
                  <span className="text-[11px] font-semibold text-blue-400">
                    ~{walkMin} min walk
                  </span>
                )}
              </div>
            )}

            {/* Exit Gates & Destinations */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.exitGatesLabel || 'Exit Gates & Destinations'}</span>
              </p>

              <div className="space-y-1.5">
                {station.exitGates && station.exitGates.length > 0 ? (
                  station.exitGates.map((gate, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#121826] border border-[#1E2640] flex items-start gap-2.5 text-xs"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] shrink-0 border border-blue-500/30">
                        {gate.gate}
                      </span>
                      <p className="text-slate-200 font-medium">
                        {gate.destination[language] || gate.destination.en}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#121826] border border-[#1E2640] text-xs text-slate-400">
                    Standard street exits available. Follow station signage.
                  </div>
                )}
              </div>
            </div>

            {/* Feeder Pandals Near Station */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.feederPandalsLabel || 'Feeder Pandals near Station'}</span>
                </p>
                <span className="text-[10px] text-amber-400 font-bold">
                  {feederPandals.length} {feederPandals.length === 1 ? 'pandal' : 'pandals'}
                </span>
              </div>

              {feederPandals.length === 0 ? (
                <div className="p-3 rounded-xl bg-[#121826] border border-[#1E2640] text-xs text-slate-400 text-center">
                  {t.noConnectingPujo || 'No major registered puja directly at station gate. Use transit routes to reach nearby hubs.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {feederPandals.map((p) => {
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-[#121826] hover:bg-[#1E2640] border border-[#1E2640] transition flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">
                              {p.name[language] || p.name.en}
                            </span>
                            <CrowdStatusBadge
                              crowdLevel={p.crowdLevel}
                              language={language}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.theme[language] || p.theme.en}
                          </p>
                          <p className="text-[10px] text-blue-400 font-medium mt-0.5">
                            ~{p.walkingTimeToMetroMin}m walk from {p.nearestMetro}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (onSelectPandal) {
                              onSelectPandal(p);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] shrink-0 flex items-center gap-1 active:scale-95 transition"
                        >
                          <span>{t.viewPandalDetails || 'View'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                id="station-navigate-btn"
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-98 transition shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.takeMeToStation || 'Directions to Station'}</span>
              </button>

              <button
                id="station-share-whatsapp-btn"
                onClick={handleShareWhatsapp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#121826] hover:bg-[#1E2640] text-slate-200 border border-[#1E2640] font-semibold text-xs active:scale-98 transition"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{t.shareWhatsapp}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. FACILITY DETAIL VIEW */}
        {isFacility && facility && (
          <div className="space-y-4">
            <div className="pr-8">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1 inline-block">
                {facility.category.toUpperCase()}
              </span>
              <h2 className="text-lg font-bold text-white leading-snug">
                {facility.name[language] || facility.name.en}
              </h2>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#121826] border border-[#1E2640] space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {facility.details[language] || facility.details.en}
              </p>

              {facility.contact && (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <a href={`tel:${facility.contact.split('/')[0].trim()}`} className="underline">
                    {facility.contact}
                  </a>
                </div>
              )}

              {distanceStr && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{distanceStr} away (~{walkMin}m walk)</span>
                </div>
              )}
            </div>

            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                id="facility-navigate-btn"
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs active:scale-98 transition shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.takeMeThere}</span>
              </button>

              <button
                id="facility-share-whatsapp-btn"
                onClick={handleShareWhatsapp}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#121826] hover:bg-[#1E2640] text-slate-200 border border-[#1E2640] font-semibold text-xs active:scale-98 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.shareWhatsapp}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

