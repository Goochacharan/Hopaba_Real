import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { ChevronDown, IndianRupee, Calendar, Star, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface MarketplaceFiltersProps {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  yearRange: [number, number];
  setYearRange: (range: [number, number]) => void;
  ratingFilter: number;
  setRatingFilter: (rating: number) => void;
  conditionFilter: string;
  setConditionFilter: (condition: string) => void;
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  sortOption: string;
  onSortChange: (option: string) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  priceRange,
  setPriceRange,
  yearRange,
  setYearRange,
  ratingFilter,
  setRatingFilter,
  conditionFilter,
  setConditionFilter,
  activeFilter,
  setActiveFilter,
  sortOption,
  onSortChange
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isPriceFilterActive = priceRange[0] > 0 || priceRange[1] < 10000000;
  const isYearFilterActive = yearRange[0] > 2010 || yearRange[1] < new Date().getFullYear();
  const isRatingFilterActive = ratingFilter > 0;
  const isConditionFilterActive = conditionFilter !== 'all';
  const isSortFilterActive = sortOption !== 'newest';

  return (
    <div className="flex items-center gap-3 mb-4 overflow-x-auto py-1 px-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant={isSortFilterActive ? "default" : "outline"} 
            size="sm" 
            className={cn(
              "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0",
              isSortFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
            )}
          >
            <ChevronDown className="h-3 w-3" />
            {isSortFilterActive && (
              <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                •
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-2">
          <div className="space-y-1">
            <Button variant={sortOption === 'newest' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => onSortChange('newest')}>
              Newest First
            </Button>
            <Button variant={sortOption === 'price-low-high' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => onSortChange('price-low-high')}>
              Price: Low to High
            </Button>
            <Button variant={sortOption === 'price-high-low' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => onSortChange('price-high-low')}>
              Price: High to Low
            </Button>
            <Button variant={sortOption === 'top-rated' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => onSortChange('top-rated')}>
              Top Rated
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={activeFilter === 'rating'} onOpenChange={open => setActiveFilter(open ? 'rating' : null)}>
        <PopoverTrigger asChild>
          <Button 
            variant={isRatingFilterActive ? "default" : "outline"} 
            size="icon" 
            className={cn(
              "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", 
              activeFilter === 'rating' && "border-primary ring-2 ring-primary/20", 
              isRatingFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
            )}
          >
            <Star className="h-4 w-4" />
            {isRatingFilterActive && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                {ratingFilter}+
              </Badge>}
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
                  <span className="text-sm font-medium">{ratingFilter}+</span>
                </div>
              </div>
              <Slider value={[ratingFilter]} min={0} max={5} step={0.5} onValueChange={value => setRatingFilter(value[0])} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={activeFilter === 'price'} onOpenChange={open => setActiveFilter(open ? 'price' : null)}>
        <PopoverTrigger asChild>
          <Button 
            variant={isPriceFilterActive ? "default" : "outline"} 
            size="icon" 
            className={cn(
              "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", 
              activeFilter === 'price' && "border-primary ring-2 ring-primary/20", 
              isPriceFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
            )}
          >
            <IndianRupee className="h-4 w-4" />
            {isPriceFilterActive && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                ₹
              </Badge>}
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
                  }).format(priceRange[0])}</span>
                </span>
              </div>
              <Slider 
                value={[priceRange[0]]} 
                min={0} 
                max={10000000} 
                step={100000} 
                onValueChange={value => setPriceRange([value[0], priceRange[1]])} 
              />
              <div className="flex justify-between mt-4">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-sm font-medium inline-flex items-center">
                  <span className="text-sm">₹</span>
                  <span className="text-sm">{new Intl.NumberFormat('en-IN', {
                    maximumFractionDigits: 0
                  }).format(priceRange[1])}</span>
                </span>
              </div>
              <Slider 
                value={[priceRange[1]]} 
                min={0} 
                max={10000000} 
                step={100000} 
                onValueChange={value => setPriceRange([priceRange[0], value[0]])} 
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={activeFilter === 'year'} onOpenChange={open => setActiveFilter(open ? 'year' : null)}>
        <PopoverTrigger asChild>
          <Button 
            variant={isYearFilterActive ? "default" : "outline"} 
            size="icon" 
            className={cn(
              "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", 
              activeFilter === 'year' && "border-primary ring-2 ring-primary/20", 
              isYearFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
            )}
          >
            <Calendar className="h-4 w-4" />
            {isYearFilterActive && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                {yearRange[0].toString().slice(-2)}-{yearRange[1].toString().slice(-2)}
              </Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Model Year Range</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="text-sm font-medium">{yearRange[0]}</span>
              </div>
              <Slider value={[yearRange[0]]} min={2000} max={new Date().getFullYear()} step={1} onValueChange={value => setYearRange([value[0], yearRange[1]])} />
              <div className="flex justify-between mt-4">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-sm font-medium">{yearRange[1]}</span>
              </div>
              <Slider value={[yearRange[1]]} min={2000} max={new Date().getFullYear()} step={1} onValueChange={value => setYearRange([yearRange[0], value[0]])} />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={activeFilter === 'condition'} onOpenChange={open => setActiveFilter(open ? 'condition' : null)}>
        <PopoverTrigger asChild>
          <Button 
            variant={isConditionFilterActive ? "default" : "outline"} 
            size="icon" 
            className={cn(
              "rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", 
              activeFilter === 'condition' && "border-primary ring-2 ring-primary/20", 
              isConditionFilterActive && "bg-blue-500 hover:bg-blue-600 text-white border-blue-400"
            )}
          >
            <Layers className="h-4 w-4" />
            {isConditionFilterActive && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                •
              </Badge>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Item Condition</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={conditionFilter === 'all' ? "default" : "outline"} size="sm" onClick={() => setConditionFilter('all')}>
                All
              </Button>
              <Button variant={conditionFilter === 'new' ? "default" : "outline"} size="sm" onClick={() => setConditionFilter('new')}>
                New
              </Button>
              <Button variant={conditionFilter === 'like new' ? "default" : "outline"} size="sm" onClick={() => setConditionFilter('like new')}>
                Like New
              </Button>
              <Button variant={conditionFilter === 'good' ? "default" : "outline"} size="sm" onClick={() => setConditionFilter('good')}>
                Good
              </Button>
              <Button variant={conditionFilter === 'fair' ? "default" : "outline"} size="sm" onClick={() => setConditionFilter('fair')}>
                Fair
              </Button>
              <Button variant={conditionFilter === 'poor' ? "default" : "outline"} size="sm" onClick={() => setConditionFilter('poor')}>
                Poor
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {user && (
        <Button
          onClick={() => navigate('/profile')}
          variant="outline"
          size="sm"
          className="rounded-full border border-border/60 flex items-center justify-center bg-primary text-white hover:bg-primary/90 whitespace-nowrap px-4"
        >
          Sell your item
        </Button>
      )}
    </div>
  );
};

export default MarketplaceFilters;
