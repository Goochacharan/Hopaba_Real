
import React from 'react';
import FilterTabs from '@/components/FilterTabs';
import SortButton, { SortOption } from '@/components/SortButton';
import MapFilterButton from '@/components/search/MapFilterButton';

interface SearchControlsProps {
  distance: number[];
  setDistance: (value: number[]) => void;
  minRating: number[];
  setMinRating: (value: number[]) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (value: boolean) => void;
  hiddenGemOnly: boolean;
  setHiddenGemOnly: (value: boolean) => void;
  mustVisitOnly: boolean;
  setMustVisitOnly: (value: boolean) => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SearchControls: React.FC<SearchControlsProps> = ({
  distance,
  setDistance,
  minRating,
  setMinRating,
  priceRange,
  setPriceRange,
  openNowOnly,
  setOpenNowOnly,
  hiddenGemOnly,
  setHiddenGemOnly,
  mustVisitOnly,
  setMustVisitOnly,
  sortBy,
  onSortChange
}) => {
  return (
    <div className="flex items-center justify-between gap-2 mb-1 mt-0 px-1">
      <div className="flex-1 overflow-x-auto">
        <FilterTabs 
          distance={distance} 
          setDistance={setDistance} 
          minRating={minRating} 
          setMinRating={setMinRating} 
          priceRange={priceRange} 
          setPriceRange={setPriceRange} 
          openNowOnly={openNowOnly} 
          setOpenNowOnly={setOpenNowOnly}
          hiddenGemOnly={hiddenGemOnly}
          setHiddenGemOnly={setHiddenGemOnly}
          mustVisitOnly={mustVisitOnly}
          setMustVisitOnly={setMustVisitOnly}
        />
      </div>
      
      <div className="flex items-center gap-2 ml-2">  
        <MapFilterButton />
        <SortButton 
          currentSort={sortBy} 
          onSortChange={onSortChange} 
        />
      </div>
    </div>
  );
};

export default SearchControls;
