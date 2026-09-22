import React, { useState, useEffect } from 'react';
import { NavigationTab, Language, Pandal, FacilityPoint, VisitedPandal, WalkRoute, MetroMapRoute } from './types';
import { PANDALS_DATA } from './data/mockData';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { DirectoryView } from './components/DirectoryView';
import { MetroRouterView } from './components/MetroRouterView';
import { PassportView } from './components/PassportView';
import { PandalBottomSheet } from './components/PandalBottomSheet';
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

  const handlePlanRoute = (pandal: Pandal) => {
    const fromCoords = userCoords || { lat: 22.5726, lng: 88.3639 }; // Fallback to Kolkata Central
    setActiveWalkRoute({
      pandal,
      fromCoords,
    });
    setCurrentTab('map');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
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
                  onRouteCalculated={(route) => setActiveMetroRoute(route)}
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
            userCoords={userCoords}
            visitedList={visitedList}
            onToggleVisited={handleToggleVisited}
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
      />
    </div>
  );
}

export default App;
