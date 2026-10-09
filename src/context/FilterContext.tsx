import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FilterType } from '../types';

export interface FilterContextType {
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  selectedPoiCategory: string;
  setSelectedPoiCategory: (category: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeFilter, setActiveFilterState] = useState<FilterType>('all');
  const [selectedFilter, setSelectedFilterState] = useState<string>('nearby');
  const [selectedPoiCategory, setSelectedPoiCategory] = useState<string>('nearby');

  const setActiveFilter = (filter: FilterType) => {
    setActiveFilterState(filter);
    if (filter === 'all' || filter === 'nearby') {
      setSelectedFilterState(filter);
    } else if (
      ['north', 'south', 'central', 'east', 'saltlake_rajarhat', 'newtown', 'howrah', 'behala'].includes(filter)
    ) {
      const capMap: Record<string, string> = {
        north: 'North',
        south: 'South',
        central: 'Central',
        east: 'East',
        saltlake_rajarhat: 'saltlake_rajarhat',
        newtown: 'newtown',
        howrah: 'howrah',
        behala: 'behala',
      };
      setSelectedFilterState(capMap[filter] || filter);
    } else if (['toilets', 'hospital', 'police', 'food', 'parking', 'railway', 'ferry'].includes(filter)) {
      setSelectedPoiCategory(filter === 'food' ? 'restaurant' : filter);
    }
  };

  const setSelectedFilter = (filter: string) => {
    setSelectedFilterState(filter);
    const lower = filter.toLowerCase();
    setActiveFilterState(lower as FilterType);
  };

  return (
    <FilterContext.Provider
      value={{
        activeFilter,
        setActiveFilter,
        selectedFilter,
        setSelectedFilter,
        selectedPoiCategory,
        setSelectedPoiCategory,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

export default FilterContext;
