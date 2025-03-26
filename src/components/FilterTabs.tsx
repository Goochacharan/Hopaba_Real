
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
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-10 h-10 relative",
                activeFilter === 'rating' && "ring-2 ring-primary/20"
              )}
            >
              <Star className="w-4 h-4" />
              {minRating[0] > 3 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium bg-primary text-white">
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
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-10 h-10 relative",
                activeFilter === 'price' && "ring-2 ring-primary/20"
              )}
            >
              <IndianRupee className="w-4 h-4" />
              {priceRange < 3 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium bg-primary text-white">
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
        <Popover open={activeFilter === 'hours'} onOpenChange={(open) => setActiveFilter(open ? 'hours' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant={openNowOnly ? "default" : "outline"}
              size="sm" 
              className={cn(
                "rounded-full border flex items-center justify-center w-10 h-10 relative",
                activeFilter === 'hours' && "ring-2 ring-primary/20"
              )}
              onClick={() => {
                if (!openNowOnly) {
                  setOpenNowOnly(true);
                  setActiveFilter(null);
                } else {
                  setOpenNowOnly(false);
                }
              }}
            >
              <Clock className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">Hours</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="open-now" className="text-sm font-medium cursor-pointer">
                  Open Now
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

        {/* Hidden Gem Filter */}
        <Button 
          variant={hiddenGemOnly ? "default" : "outline"}
          size="sm" 
          className={cn(
            "rounded-full border flex items-center justify-center w-10 h-10 relative",
            hiddenGemOnly && "bg-purple-500 hover:bg-purple-600"
          )}
          onClick={() => setHiddenGemOnly(!hiddenGemOnly)}
        >
          <Sparkles className="w-4 h-4" />
        </Button>

        {/* Must Visit Filter */}
        <Button 
          variant={mustVisitOnly ? "default" : "outline"}
          size="sm" 
          className={cn(
            "rounded-full border flex items-center justify-center w-10 h-10 relative",
            mustVisitOnly && "bg-orange-500 hover:bg-orange-600"
          )}
          onClick={() => setMustVisitOnly(!mustVisitOnly)}
        >
          <Award className="w-4 h-4" />
        </Button>

        {/* Distance Filter */}
        <Popover open={activeFilter === 'distance'} onOpenChange={(open) => setActiveFilter(open ? 'distance' : null)}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "rounded-full border border-border/60 flex items-center justify-center bg-background w-10 h-10 relative",
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
              {distance[0] !== 5 && (
                <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium bg-primary text-white">
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

        {/* Remove the All Filters Button that wasn't working */}
      </div>
    </ScrollArea>
  );
};

export default FilterTabs;
