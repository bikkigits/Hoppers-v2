import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FilterType } from '../types';

export interface FilterContextType {
  // Unified Zone Filter across Map and Pandal List ('all', 'nearby', 'north', 'south', 'central', etc.)
  zoneFilter: FilterType;
  setZoneFilter: (filter: FilterType) => void;

  // Unified POI Category Filter ('all', 'toilets', 'hospital', 'food', 'police', 'parking', 'metro', 'railway', 'ferry', etc.)
  poiFilter: string;
  setPoiFilter: (category: string) => void;

  // Active Map Utility Layer ('toilets', 'hospital', 'police', 'food', 'parking', 'railway', 'ferry' or null)
  activeUtility: FilterType | null;
  setActiveUtility: (utility: FilterType | null) => void;

  // Clear helpers
  clearUtilityFilter: () => void;
  clearZoneFilter: () => void;
  clearAllFilters: () => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

const MAP_UTILITY_SET = new Set<string>([
  'police',
  'toilets',
  'food',
  'restaurant',
  'hospital',
  'medical',
  'parking',
  'railway',
  'ferry',
  'metro',
]);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default zone filter is 'all'
  const [zoneFilter, setZoneFilterState] = useState<FilterType>('all');

  // Default POI category is 'all'
  const [poiFilter, setPoiFilterState] = useState<string>('all');

  // Active Map Utility is null (none active by default)
  const [activeUtility, setActiveUtilityState] = useState<FilterType | null>(null);

  const setZoneFilter = useCallback((filter: FilterType) => {
    setZoneFilterState(filter);
  }, []);

  const setPoiFilter = useCallback((category: string) => {
    setPoiFilterState(category);

    // Sync to activeUtility if it's a map utility
    if (category === 'all') {
      setActiveUtilityState(null);
    } else {
      let mappedUtil: FilterType | null = null;
      if (category === 'hospital' || category === 'medical') mappedUtil = 'hospital';
      else if (category === 'toilets') mappedUtil = 'toilets';
      else if (category === 'police' || category === 'helpdesk') mappedUtil = 'police';
      else if (category === 'food' || category === 'restaurant') mappedUtil = 'food';
      else if (category === 'parking') mappedUtil = 'parking';
      else if (category === 'railway') mappedUtil = 'railway';
      else if (category === 'ferry') mappedUtil = 'ferry';

      if (mappedUtil) {
        setActiveUtilityState(mappedUtil);
      }
    }
  }, []);

  const setActiveUtility = useCallback((utility: FilterType | null) => {
    setActiveUtilityState(utility);
    if (!utility) {
      // If cleared, reset poiFilter to 'all' if it was a utility
      setPoiFilterState('all');
    } else {
      setPoiFilterState(utility);
    }
  }, []);

  const clearUtilityFilter = useCallback(() => {
    setActiveUtilityState(null);
    setPoiFilterState('all');
  }, []);

  const clearZoneFilter = useCallback(() => {
    setZoneFilterState('all');
  }, []);

  const clearAllFilters = useCallback(() => {
    setZoneFilterState('all');
    setActiveUtilityState(null);
    setPoiFilterState('all');
  }, []);

  const value = useMemo(
    () => ({
      zoneFilter,
      setZoneFilter,
      poiFilter,
      setPoiFilter,
      activeUtility,
      setActiveUtility,
      clearUtilityFilter,
      clearZoneFilter,
      clearAllFilters,
    }),
    [
      zoneFilter,
      setZoneFilter,
      poiFilter,
      setPoiFilter,
      activeUtility,
      setActiveUtility,
      clearUtilityFilter,
      clearZoneFilter,
      clearAllFilters,
    ]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};

export function useFilters(): FilterContextType {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return ctx;
}
