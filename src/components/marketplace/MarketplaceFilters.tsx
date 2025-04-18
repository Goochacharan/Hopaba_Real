
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Star, IndianRupee, Calendar, Layers, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import MarketplaceSortButton, { SortOption } from './MarketplaceSortButton';

interface MarketplaceFiltersProps {
  filters: {
    priceRange: [number, number];
    yearRange: [number, number];
    ratingFilter: number;
    conditionFilter: string;
    distanceFilter: number;
    sortOption: SortOption;
    activeFilter: string | null;
  };
  states: {
    isPriceFilterActive: boolean;
    isYearFilterActive: boolean;
    isRatingFilterActive: boolean;
    isConditionFilterActive: boolean;
    isSortFilterActive: boolean;
    isDistanceFilterActive: boolean;
  };
  setters: {
    setPriceRange: (value: [number, number]) => void;
    setYearRange: (value: [number, number]) => void;
    setRatingFilter: (value: number) => void;
    setConditionFilter: (value: string) => void;
    setDistanceFilter: (value: number) => void;
    setSortOption: (value: SortOption) => void;
    setActiveFilter: (value: string | null) => void;
  };
  showDistanceFilter: boolean;
}

const MarketplaceFilters = ({
  filters,
  states,
  setters,
  showDistanceFilter
}: MarketplaceFiltersProps) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex items-center gap-3 mb-4 overflow-x-auto py-1 px-1">
        <MarketplaceSortButton 
          sortOption={filters.sortOption}
          onSortChange={setters.setSortOption}
          isSortFilterActive={states.isSortFilterActive}
        />

        {showDistanceFilter && (
          <Popover 
            open={filters.activeFilter === 'distance'} 
            onOpenChange={open => setters.setActiveFilter(open ? 'distance' : null)}
          >
            <PopoverTrigger asChild>
              <Button 
                variant={states.isDistanceFilterActive ? "default" : "outline"} 
                size="icon" 
                className={cn(
                  "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0",
                  filters.activeFilter === 'distance' && "border-primary ring-2 ring-primary/20",
                  states.isDistanceFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
                )}
              >
                <MapPin className="h-4 w-4" />
                {states.isDistanceFilterActive && (
                  <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                    {filters.distanceFilter}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Maximum Distance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Show results within</span>
                    <span className="text-sm font-medium">{filters.distanceFilter} km</span>
                  </div>
                  <Slider 
                    value={[filters.distanceFilter]} 
                    min={1} 
                    max={50} 
                    step={1} 
                    onValueChange={value => setters.setDistanceFilter(value[0])} 
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Rating Filter */}
        <Popover 
          open={filters.activeFilter === 'rating'} 
          onOpenChange={open => setters.setActiveFilter(open ? 'rating' : null)}
        >
          <PopoverTrigger asChild>
            <Button 
              variant={states.isRatingFilterActive ? "default" : "outline"} 
              size="icon" 
              className={cn(
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0",
                filters.activeFilter === 'rating' && "border-primary ring-2 ring-primary/20",
                states.isRatingFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
              )}
            >
              <Star className="h-4 w-4" />
              {states.isRatingFilterActive && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                  {filters.ratingFilter}+
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Minimum Seller Rating</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Show results rated</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                    <span className="text-sm font-medium">{filters.ratingFilter}+</span>
                  </div>
                </div>
                <Slider 
                  value={[filters.ratingFilter]} 
                  min={0} 
                  max={5} 
                  step={0.5} 
                  onValueChange={value => setters.setRatingFilter(value[0])} 
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Filter */}
        <Popover 
          open={filters.activeFilter === 'price'} 
          onOpenChange={open => setters.setActiveFilter(open ? 'price' : null)}
        >
          <PopoverTrigger asChild>
            <Button 
              variant={states.isPriceFilterActive ? "default" : "outline"} 
              size="icon" 
              className={cn(
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0",
                filters.activeFilter === 'price' && "border-primary ring-2 ring-primary/20",
                states.isPriceFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
              )}
            >
              <IndianRupee className="h-4 w-4" />
              {states.isPriceFilterActive && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                  ₹
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Price Range</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-sm font-medium inline-flex items-center">
                    <span className="text-sm">₹</span>
                    <span className="text-sm">{new Intl.NumberFormat('en-IN', {
                      maximumFractionDigits: 0
                    }).format(filters.priceRange[0])}</span>
                  </span>
                </div>
                <Slider 
                  value={[filters.priceRange[0]]} 
                  min={0} 
                  max={10000000} 
                  step={100000} 
                  onValueChange={value => setters.setPriceRange([value[0], filters.priceRange[1]])} 
                />
                <div className="flex justify-between mt-4">
                  <span className="text-sm text-muted-foreground">To</span>
                  <span className="text-sm font-medium inline-flex items-center">
                    <span className="text-sm">₹</span>
                    <span className="text-sm">{new Intl.NumberFormat('en-IN', {
                      maximumFractionDigits: 0
                    }).format(filters.priceRange[1])}</span>
                  </span>
                </div>
                <Slider 
                  value={[filters.priceRange[1]]} 
                  min={0} 
                  max={10000000} 
                  step={100000} 
                  onValueChange={value => setters.setPriceRange([filters.priceRange[0], value[0]])} 
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Year Filter */}
        <Popover 
          open={filters.activeFilter === 'year'} 
          onOpenChange={open => setters.setActiveFilter(open ? 'year' : null)}
        >
          <PopoverTrigger asChild>
            <Button 
              variant={states.isYearFilterActive ? "default" : "outline"} 
              size="icon" 
              className={cn(
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0",
                filters.activeFilter === 'year' && "border-primary ring-2 ring-primary/20",
                states.isYearFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
              )}
            >
              <Calendar className="h-4 w-4" />
              {states.isYearFilterActive && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                  {filters.yearRange[0].toString().slice(-2)}-{filters.yearRange[1].toString().slice(-2)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Model Year Range</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">From</span>
                  <span className="text-sm font-medium">{filters.yearRange[0]}</span>
                </div>
                <Slider 
                  value={[filters.yearRange[0]]} 
                  min={2000} 
                  max={new Date().getFullYear()} 
                  step={1} 
                  onValueChange={value => setters.setYearRange([value[0], filters.yearRange[1]])} 
                />
                <div className="flex justify-between mt-4">
                  <span className="text-sm text-muted-foreground">To</span>
                  <span className="text-sm font-medium">{filters.yearRange[1]}</span>
                </div>
                <Slider 
                  value={[filters.yearRange[1]]} 
                  min={2000} 
                  max={new Date().getFullYear()} 
                  step={1} 
                  onValueChange={value => setters.setYearRange([filters.yearRange[0], value[0]])} 
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Condition Filter */}
        <Popover 
          open={filters.activeFilter === 'condition'} 
          onOpenChange={open => setters.setActiveFilter(open ? 'condition' : null)}
        >
          <PopoverTrigger asChild>
            <Button 
              variant={states.isConditionFilterActive ? "default" : "outline"} 
              size="icon" 
              className={cn(
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0",
                filters.activeFilter === 'condition' && "border-primary ring-2 ring-primary/20",
                states.isConditionFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
              )}
            >
              <Layers className="h-4 w-4" />
              {states.isConditionFilterActive && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                  •
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Item Condition</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={filters.conditionFilter === 'all' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setters.setConditionFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={filters.conditionFilter === 'new' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setters.setConditionFilter('new')}
                >
                  New
                </Button>
                <Button 
                  variant={filters.conditionFilter === 'like new' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setters.setConditionFilter('like new')}
                >
                  Like New
                </Button>
                <Button 
                  variant={filters.conditionFilter === 'good' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setters.setConditionFilter('good')}
                >
                  Good
                </Button>
                <Button 
                  variant={filters.conditionFilter === 'fair' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setters.setConditionFilter('fair')}
                >
                  Fair
                </Button>
                <Button 
                  variant={filters.conditionFilter === 'poor' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setters.setConditionFilter('poor')}
                >
                  Poor
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </ScrollArea>
  );
};

export default MarketplaceFilters;
