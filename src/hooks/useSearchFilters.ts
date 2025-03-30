
import { useState } from 'react';
import { SortOption } from '@/components/SortButton';

export interface SearchFilters {
  distance: number[];
  minRating: number[];
  priceRange: number;
  openNowOnly: boolean;
  hiddenGemOnly: boolean;
  mustVisitOnly: boolean;
  sortBy: SortOption;
}

export function useSearchFilters(initialFilters?: Partial<SearchFilters>) {
  const [distance, setDistance] = useState<number[]>(initialFilters?.distance || [5]);
  const [minRating, setMinRating] = useState<number[]>(initialFilters?.minRating || [3]);
  const [priceRange, setPriceRange] = useState<number>(initialFilters?.priceRange || 2);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(initialFilters?.openNowOnly || false);
  const [hiddenGemOnly, setHiddenGemOnly] = useState<boolean>(initialFilters?.hiddenGemOnly || false);
  const [mustVisitOnly, setMustVisitOnly] = useState<boolean>(initialFilters?.mustVisitOnly || false);
  const [sortBy, setSortBy] = useState<SortOption>(initialFilters?.sortBy || 'rating');

  return {
    filters: {
      distance,
      minRating,
      priceRange,
      openNowOnly,
      hiddenGemOnly,
      mustVisitOnly,
      sortBy
    },
    setters: {
      setDistance,
      setMinRating,
      setPriceRange,
      setOpenNowOnly,
      setHiddenGemOnly,
      setMustVisitOnly,
      setSortBy
    }
  };
}
