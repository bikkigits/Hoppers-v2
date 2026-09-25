import React, { useState, useEffect } from 'react';
import { NavigationTab, Language, Pandal, FacilityPoint, VisitedPandal, WalkRoute, MetroMapRoute, TrailStop } from './types';
import { PANDALS_DATA } from './data/mockData';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { DirectoryView } from './components/DirectoryView';
import { MetroRouterView } from './components/MetroRouterView';
import { PassportView } from './components/PassportView';
import { PandalBottomSheet } from './components/PandalBottomSheet';
import { TrailBuilderSheet } from './components/TrailBuilderSheet';
import { EmergencySOSSheet } from './components/EmergencySOSSheet';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('map');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('hoppers_language');
    if (saved === 'en' || saved === 'bn' || saved === 'hi') {
      return saved;
    }
    return 'en';
  });

  const [visitedList, setVisitedList] = useState<VisitedPandal[]>(() => {
    try {
      const saved = localStorage.getItem('hoppers_passport');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse passport state from localStorage:', e);
    }
    return [];
  });

  const [selectedItem, setSelectedItem] = useState<Pandal | FacilityPoint | null>(null);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeWalkRoute, setActiveWalkRoute] = useState<WalkRoute | null>(null);
  const [activeMetroRoute, setActiveMetroRoute] = useState<MetroMapRoute | null>(null);

  // Multi-Stop Trail State & Drawer
  const [isTrailBuilderOpen, setIsTrailBuilderOpen] = useState(false);
  const [trailStops, setTrailStops] = useState<TrailStop[]>(() => {
    try {
      const saved = localStorage.getItem('hoppers_trail_stops');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse trail stops from localStorage:', e);
    }
    // Default initial preview trail: North Kolkata Heritage Circuit
    return [
      {
        id: 'bagbazar',
        pandalId: 'bagbazar',
        name: { en: 'Bagbazar Sarbojanin', bn: 'বাগবাজার সার্বজনীন', hi: 'बागबाजार सार्वजनीन' },
        lat: 22.6033,
        lng: 88.3672,
        nearestMetro: 'Shyambazar',
        crowdLevel: 'Extreme',
        zone: 'North',
      },
      {
        id: 'kumartuli',
        pandalId: 'kumartuli',
        name: { en: 'Kumartuli Park', bn: 'কুমোরটুলি পার্ক', hi: 'कुमोरटुली पार्क' },
        lat: 22.5996,
        lng: 88.3639,
        nearestMetro: 'Sovabazar Sutanuti',
        crowdLevel: 'Heavy',
        zone: 'North',
      },
      {
        id: 'sovabazar-rajbari',
        pandalId: 'sovabazar-rajbari',
        name: { en: 'Sovabazar Rajbari Puja', bn: 'শোভাবাজার রাজবাড়ি', hi: 'शोभाबाजार राजबाड़ी' },
        lat: 22.5975,
        lng: 88.3650,
        nearestMetro: 'Sovabazar Sutanuti',
        crowdLevel: 'Heavy',
        zone: 'North',
      },
      {
        id: 'ahiritola',
        pandalId: 'ahiritola',
        name: { en: 'Ahiritola Sarbojanin', bn: 'আহিরীটোলা সার্বজনীন', hi: 'आहिरीটোলা सार्वजनीन' },
        lat: 22.5925,
        lng: 88.3586,
        nearestMetro: 'Sovabazar Sutanuti',
        crowdLevel: 'Moderate',
        zone: 'North',
      },
    ];
  });

  // Persist language
  useEffect(() => {
    localStorage.setItem('hoppers_language', language);
  }, [language]);

  // Persist visited pandals in passport
  useEffect(() => {
    try {
      localStorage.setItem('hoppers_passport', JSON.stringify(visitedList));
    } catch (e) {
      console.error('Failed to save passport state:', e);
    }
  }, [visitedList]);

  // Persist trail stops
  useEffect(() => {
    try {
      localStorage.setItem('hoppers_trail_stops', JSON.stringify(trailStops));
    } catch (e) {
      console.error('Failed to save trail stops:', e);
    }
  }, [trailStops]);

  const handleToggleTrailStop = (pandal: Pandal) => {
    setTrailStops((prev) => {
      const exists = prev.some((s) => s.pandalId === pandal.id);
      if (exists) {
        return prev.filter((s) => s.pandalId !== pandal.id);
      } else {
        const newStop: TrailStop = {
          id: pandal.id,
          pandalId: pandal.id,
          name: pandal.name,
          lat: pandal.lat,
          lng: pandal.lng,
          nearestMetro: pandal.nearestMetroEn,
          crowdLevel: pandal.crowdLevel,
          zone: pandal.zone,
        };
        return [...prev, newStop];
      }
    });
  };

  const handleToggleVisited = (pandalId: string) => {
    setVisitedList((prev) => {
      const exists = prev.some((p) => p.pandalId === pandalId);
      if (exists) {
        return prev.filter((p) => p.pandalId !== pandalId);
      } else {
        return [...prev, { pandalId, timestamp: Date.now() }];
      }
    });
  };

  const handleClearPassport = () => {
    setVisitedList([]);
  };

  const handleAddFacilityToTrail = (facility: FacilityPoint) => {
    const newStop: TrailStop = {
      id: facility.id,
      name: facility.name,
      lat: facility.lat,
      lng: facility.lng,
    };
    setTrailStops((prev) => {
      if (prev.some((s) => s.id === facility.id)) {
        return prev.filter((s) => s.id !== facility.id);
      }
      return [...prev, newStop];
    });
  };

  const handleViewFacilityOnMap = (facility: FacilityPoint) => {
    setSelectedItem(facility);
    setCurrentTab('map');
  };

  const handlePlanRoute = (pandal: Pandal) => {
    const fromCoords = userCoords || { lat: 22.5726, lng: 88.3639 }; // Fallback to Kolkata Central
    setActiveWalkRoute({
      pandal,
      fromCoords,
    });
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar with Brand & Trilingual Switcher */}
      <TopBar
        language={language}
        onLanguageChange={setLanguage}
        visitedCount={visitedList.length}
        totalPandals={PANDALS_DATA.length}
        visitedList={visitedList}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator language={language} />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 relative w-full overflow-x-hidden">
        {(currentTab === 'map' || currentTab === 'metro') && (
          <div className="relative w-full h-full">
            <MapView
              language={language}
              onSelectPandal={(pandal) => setSelectedItem(pandal)}
              onSelectFacility={(facility) => setSelectedItem(facility)}
              userCoords={userCoords}
              onUserCoordsChange={setUserCoords}
              visitedList={visitedList}
              activeWalkRoute={activeWalkRoute}
              onClearWalkRoute={() => setActiveWalkRoute(null)}
              activeMetroRoute={activeMetroRoute}
              onClearMetroRoute={() => setActiveMetroRoute(null)}
              trailStops={trailStops}
              onOpenTrailBuilder={() => setIsTrailBuilderOpen(true)}
              selectedItem={selectedItem}
            />

            {/* Metro Router Overlay above the map */}
            {currentTab === 'metro' && (
              <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center p-3 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto"
                  onClick={() => setCurrentTab('map')}
                />
                <MetroRouterView
                  language={language}
                  onSelectPandal={(pandal) => setSelectedItem(pandal)}
                  onRouteCalculated={setActiveMetroRoute}
                  isOverlay={true}
                  onCloseOverlay={() => setCurrentTab('map')}
                  onViewOnMap={() => setCurrentTab('map')}
                />
              </div>
            )}
          </div>
        )}

        {currentTab === 'directory' && (
          <DirectoryView
            language={language}
            onSelectPandal={(pandal) => setSelectedItem(pandal)}
            onSelectFacility={(facility) => setSelectedItem(facility)}
            userCoords={userCoords}
            visitedList={visitedList}
            onToggleVisited={handleToggleVisited}
            trailStops={trailStops}
            onToggleTrailStop={handleToggleTrailStop}
            onAddFacilityToTrail={handleAddFacilityToTrail}
            onOpenTrailBuilder={() => setIsTrailBuilderOpen(true)}
            onViewFacilityOnMap={handleViewFacilityOnMap}
          />
        )}

        {currentTab === 'passport' && (
          <PassportView
            language={language}
            visitedList={visitedList}
            onSelectPandal={(pandal) => setSelectedItem(pandal)}
            onClearPassport={handleClearPassport}
            onOpenMap={() => setCurrentTab('map')}
          />
        )}
      </main>

      {/* Pandal & Facility Detail Bottom Sheet */}
      <PandalBottomSheet
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        userCoords={userCoords}
        language={language}
        visitedList={visitedList}
        onToggleVisited={handleToggleVisited}
        onPlanRoute={handlePlanRoute}
        trailStops={trailStops}
        onToggleTrailStop={handleToggleTrailStop}
      />

      {/* Multi-Stop Puja Trail Builder & Corridor Detour Sheet */}
      <TrailBuilderSheet
        isOpen={isTrailBuilderOpen}
        onClose={() => setIsTrailBuilderOpen(false)}
        trailStops={trailStops}
        onUpdateTrailStops={setTrailStops}
        allPandals={PANDALS_DATA}
        language={language}
        userCoords={userCoords}
        onSelectPandalPreview={(pandal) => {
          setIsTrailBuilderOpen(false);
          setSelectedItem(pandal);
        }}
        onFocusMapOnTrail={() => {
          setIsTrailBuilderOpen(false);
          setCurrentTab('map');
        }}
      />

      {/* 1-Tap Emergency SOS Dialer Modal */}
      <EmergencySOSSheet
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        language={language}
      />

      {/* Floating Bottom Navigation Dock */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        language={language}
        onOpenSOS={() => setIsSOSOpen(true)}
        visitedCount={visitedList.length}
        trailStopsCount={trailStops.length}
        onOpenTrailBuilder={() => setIsTrailBuilderOpen(true)}
      />
    </div>
  );
}

export default App;
