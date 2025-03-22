
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, ChevronLeft, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import LocationCard from '@/components/LocationCard';
import MainLayout from '@/components/MainLayout';
import useRecommendations from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import FilterTabs from '@/components/FilterTabs';
import Filters from '@/components/Filters';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Recommendation } from '@/lib/mockData';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') || 'all') as any;
  
  const [distance, setDistance] = useState<number[]>([5]);
  const [minRating, setMinRating] = useState<number[]>([3]);
  const [priceRange, setPriceRange] = useState<number>(3);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [showNewestOnly, setShowNewestOnly] = useState<boolean>(false);
  
  const {
    recommendations,
    events,
    loading,
    error,
    query,
    category,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  } = useRecommendations({
    initialQuery,
    initialCategory,
  });

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const filteredRecommendations = filterRecommendations(recommendations, {
    maxDistance: distance[0],
    minRating: minRating[0],
    priceLevel: priceRange,
    openNowOnly
  }).filter(rec => {
    // Add filter for newest listings (last week)
    if (showNewestOnly) {
      const creationDate = new Date(rec.created_at || new Date().toISOString());
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return creationDate > oneWeekAgo;
    }
    return true;
  });

  const isNewerThanOneWeek = (dateString: string): boolean => {
    const listingDate = new Date(dateString || new Date().toISOString());
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return listingDate > oneWeekAgo;
  };

  return (
    <MainLayout>
      <div className="relative animate-fade-in">
        <div className="mb-4 flex items-center gap-2 px-[7px]">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <SearchBar 
            initialQuery={initialQuery} 
            onSearch={handleSearch} 
            className="flex-1" 
          />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="pb-4">
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your search results
                </SheetDescription>
              </SheetHeader>

              <div className="py-2">
                <h3 className="font-semibold mb-2">Categories</h3>
                <CategoryFilter 
                  activeCategory={category}
                  onCategoryChange={handleCategoryChange}
                />
              </div>

              <div className="py-4">
                <h3 className="font-semibold mb-4">Newest Listings</h3>
                <div className="flex items-center justify-between mb-6">
                  <Label htmlFor="newest-listings" className="cursor-pointer">
                    Show only listings from the last week
                  </Label>
                  <Switch
                    id="newest-listings"
                    checked={showNewestOnly}
                    onCheckedChange={setShowNewestOnly}
                  />
                </div>
              </div>
              
              <Filters 
                distance={distance}
                setDistance={setDistance}
                minRating={minRating}
                setMinRating={setMinRating}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                openNowOnly={openNowOnly}
                setOpenNowOnly={setOpenNowOnly}
              />
            </SheetContent>
          </Sheet>
        </div>
        
        <ScrollArea className="w-full mb-4">
          <div className="flex items-center gap-2 px-[7px]">
            <Badge 
              variant={showNewestOnly ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setShowNewestOnly(!showNewestOnly)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Newest
            </Badge>
            <FilterTabs 
              distance={distance}
              setDistance={setDistance}
              minRating={minRating}
              setMinRating={setMinRating}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              openNowOnly={openNowOnly}
              setOpenNowOnly={setOpenNowOnly}
            />
          </div>
        </ScrollArea>
        
        <div className="px-[7px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="text-center py-20">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We couldn't find any matches for "{query}". Try different keywords or filters.
              </p>
              <Button onClick={() => {
                handleSearch('');
                setOpenNowOnly(false);
                setDistance([5]);
                setMinRating([3]);
                setPriceRange(3);
                setShowNewestOnly(false);
              }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {filteredRecommendations.map((item) => (
                <LocationCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
