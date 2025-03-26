
import React, { useState } from 'react';
import { Star, Clock, IndianRupee, Sparkles, Award } from 'lucide-react';
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
import { Toggle } from '@/components/ui/toggle';

interface FilterTabsProps {
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
}

const FilterTabs: React.FC<FilterTabsProps> = ({
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
  setMustVisitOnly
}) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  return (
    <ScrollArea className="w-full">
      <div className="flex items-center gap-2 pb-2 pt-1 px-1 overflow-x-auto min-w-max">
        {/* Rating Filter */}
        <Popover open={activeFilter === 'rating'} onOpenChange={(open) => setActiveFilter(open ? 'rating' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant={minRating[0] > 3 ? "default" : "outline"}
              size="sm" 
              className={cn(
                "rounded-full flex items-center justify-center w-10 h-10 relative",
                activeFilter === 'rating' && "ring-2 ring-primary"
              )}
            >
              <Star className={cn("w-4 h-4", minRating[0] > 3 && "text-primary-foreground")} />
              {minRating[0] > 3 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium bg-white text-primary border-2 border-primary">
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
              variant={priceRange < 3 ? "default" : "outline"}
              size="sm" 
              className={cn(
                "rounded-full flex items-center justify-center w-10 h-10 relative",
                activeFilter === 'price' && "ring-2 ring-primary"
              )}
            >
              <IndianRupee className={cn("w-4 h-4", priceRange < 3 && "text-primary-foreground")} />
              {priceRange < 3 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium bg-white text-primary border-2 border-primary">
                  {Array(priceRange).fill('₹').join('')}
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
                    {Array(priceRange).fill('₹').join('')}
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
        <Toggle
          pressed={openNowOnly}
          onPressedChange={setOpenNowOnly}
          className={cn(
            "rounded-full w-10 h-10 p-0",
            openNowOnly 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Toggle open now"
        >
          <Clock className="w-4 h-4" />
        </Toggle>

        {/* Hidden Gem Filter */}
        <Toggle
          pressed={hiddenGemOnly}
          onPressedChange={setHiddenGemOnly}
          className={cn(
            "rounded-full w-10 h-10 p-0",
            hiddenGemOnly 
              ? "bg-purple-500 text-white hover:bg-purple-600" 
              : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Toggle hidden gems"
        >
          <Sparkles className="w-4 h-4" />
        </Toggle>

        {/* Must Visit Filter */}
        <Toggle
          pressed={mustVisitOnly}
          onPressedChange={setMustVisitOnly}
          className={cn(
            "rounded-full w-10 h-10 p-0",
            mustVisitOnly 
              ? "bg-orange-500 text-white hover:bg-orange-600" 
              : "bg-secondary/80 text-muted-foreground hover:bg-secondary"
          )}
          aria-label="Toggle must visit"
        >
          <Award className="w-4 h-4" />
        </Toggle>

        {/* Distance Filter */}
        <Popover open={activeFilter === 'distance'} onOpenChange={(open) => setActiveFilter(open ? 'distance' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant={distance[0] !== 5 ? "default" : "outline"}
              size="sm" 
              className={cn(
                "rounded-full flex items-center justify-center w-10 h-10 relative",
                activeFilter === 'distance' && "ring-2 ring-primary"
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
                className={cn("w-4 h-4", distance[0] !== 5 && "text-primary-foreground")}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              {distance[0] !== 5 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium bg-white text-primary border-2 border-primary">
                  {distance[0]}
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
                  <span className="text-sm font-medium">{distance[0]} km</span>
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
      </div>
    </ScrollArea>
  );
};

export default FilterTabs;
