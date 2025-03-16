
import React, { useState } from 'react';
import { Star, Clock, DollarSign, FilterIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FilterTabsProps {
  distance: number[];
  setDistance: (value: number[]) => void;
  minRating: number[];
  setMinRating: (value: number[]) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  openNowOnly: boolean;
  setOpenNowOnly: (value: boolean) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  distance,
  setDistance,
  minRating,
  setMinRating,
  priceRange,
  setPriceRange,
  openNowOnly,
  setOpenNowOnly
}) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  return (
    <ScrollArea className="w-full">
      <div className="flex items-center gap-2 pb-2 pt-1 px-1 overflow-x-auto min-w-max">
        {/* Rating Filter */}
        <Popover open={activeFilter === 'rating'} onOpenChange={(open) => setActiveFilter(open ? 'rating' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full border border-border/60 flex items-center gap-1.5 bg-background",
                activeFilter === 'rating' && "ring-2 ring-primary/20"
              )}
            >
              <Star className="w-4 h-4" /> 
              Rating
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              {minRating[0] > 3 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs font-normal">
                  {minRating[0]}+
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Minimum Rating</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Show results rated</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                    <span className="text-sm font-medium">{minRating[0]}+</span>
                  </div>
                </div>
                <Slider
                  id="rating"
                  value={minRating}
                  min={3}
                  max={5}
                  step={0.1}
                  onValueChange={setMinRating}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Range Filter */}
        <Popover open={activeFilter === 'price'} onOpenChange={(open) => setActiveFilter(open ? 'price' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full border border-border/60 flex items-center gap-1.5 bg-background",
                activeFilter === 'price' && "ring-2 ring-primary/20"
              )}
            >
              <DollarSign className="w-4 h-4" /> 
              Price
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              {priceRange < 3 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs font-normal">
                  {Array(priceRange).fill('$').join('')}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Price Range</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Show results priced</span>
                  <span className="text-sm font-medium">
                    {Array(priceRange).fill('$').join('')}
                  </span>
                </div>
                <Slider
                  id="price"
                  value={[priceRange]}
                  min={1}
                  max={3}
                  step={1}
                  onValueChange={(value) => setPriceRange(value[0])}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Hours Filter */}
        <Popover open={activeFilter === 'hours'} onOpenChange={(open) => setActiveFilter(open ? 'hours' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full border border-border/60 flex items-center gap-1.5 bg-background",
                activeFilter === 'hours' && "ring-2 ring-primary/20",
                openNowOnly && "border-primary/30 bg-primary/5"
              )}
            >
              <Clock className="w-4 h-4" /> 
              Hours
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              {openNowOnly && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs font-normal">
                  Open Now
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Hours</h4>
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
          </PopoverContent>
        </Popover>

        {/* Distance Filter */}
        <Popover open={activeFilter === 'distance'} onOpenChange={(open) => setActiveFilter(open ? 'distance' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full border border-border/60 flex items-center gap-1.5 bg-background",
                activeFilter === 'distance' && "ring-2 ring-primary/20"
              )}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Distance
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              {distance[0] !== 5 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs font-normal">
                  {distance[0]} mi
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Distance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Within</span>
                  <span className="text-sm font-medium">{distance[0]} miles</span>
                </div>
                <Slider
                  id="distance"
                  value={distance}
                  max={10}
                  step={0.5}
                  onValueChange={setDistance}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* All Filters Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full border border-border/60 flex items-center gap-1.5 bg-background min-w-20"
        >
          <FilterIcon className="w-4 h-4" /> 
          All filters
        </Button>
      </div>
    </ScrollArea>
  );
};

export default FilterTabs;
