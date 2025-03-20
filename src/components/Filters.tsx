
import React, { useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star, IndianRupee, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Default filter values
const DEFAULT_DISTANCE = [5];
const DEFAULT_RATING = [4];
const DEFAULT_PRICE_RANGE = 2;
const DEFAULT_OPEN_NOW = false;

interface FiltersProps {
  distance: number[];
  setDistance: (value: number[]) => void;
  minRating: number[];
  setMinRating: (value: number[]) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (value: boolean) => void;
}

const Filters: React.FC<FiltersProps> = ({
  distance,
  setDistance,
  minRating,
  setMinRating,
  priceRange,
  setPriceRange,
  openNowOnly,
  setOpenNowOnly
}) => {
  // Reset filters on component mount
  useEffect(() => {
    setDistance(DEFAULT_DISTANCE);
    setMinRating(DEFAULT_RATING);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setOpenNowOnly(DEFAULT_OPEN_NOW);
  }, []);
  
  // Function to reset filters manually
  const resetFilters = () => {
    setDistance(DEFAULT_DISTANCE);
    setMinRating(DEFAULT_RATING);
    setPriceRange(DEFAULT_PRICE_RANGE);
    setOpenNowOnly(DEFAULT_OPEN_NOW);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-4 mb-6 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="h-8 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="distance" className="text-sm font-medium">Distance</Label>
          <span className="text-sm text-muted-foreground">{distance[0]} km</span>
        </div>
        <Slider
          id="distance"
          defaultValue={distance}
          max={10}
          step={0.5}
          onValueChange={setDistance}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="rating" className="text-sm font-medium">Top Rated</Label>
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
            <span className="text-sm text-muted-foreground">{minRating[0]}+</span>
          </div>
        </div>
        <Slider
          id="rating"
          defaultValue={minRating}
          min={3}
          max={5}
          step={0.1}
          onValueChange={setMinRating}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label htmlFor="price" className="text-sm font-medium">Price Range</Label>
          <div className="text-sm text-muted-foreground">
            {Array(priceRange).fill('₹').join('')}
          </div>
        </div>
        <Slider
          id="price"
          defaultValue={[priceRange]}
          min={1}
          max={3}
          step={1}
          onValueChange={(value) => setPriceRange(value[0])}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="open-now" className="text-sm font-medium cursor-pointer">
          Open Now Only
        </Label>
        <Switch
          id="open-now"
          checked={openNowOnly}
          onCheckedChange={setOpenNowOnly}
        />
      </div>
    </div>
  );
};

export default Filters;
