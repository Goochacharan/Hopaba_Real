import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import LocationSelector from '@/components/LocationSelector';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Clock, ChevronDown, IndianRupee, Star, Calendar, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
type SortOption = 'newest' | 'price-low-high' | 'price-high-low' | 'top-rated';
const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const [currentCategory, setCurrentCategory] = useState<string>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, new Date().getFullYear()]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const itemsPerPage = 9;
  const {
    listings,
    loading,
    error
  } = useMarketplaceListings({
    category: currentCategory !== 'all' ? currentCategory : undefined,
    searchQuery: searchQuery,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
    minRating: ratingFilter > 0 ? ratingFilter : undefined
  });
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, searchQuery, conditionFilter, priceRange, ratingFilter, sortOption]);
  const handleLocationChange = (location: string) => {
    console.log(`Location changed to: ${location}`);
    setSelectedLocation(location);
  };
  const categories = [{
    id: 'all',
    name: 'All Categories'
  }, {
    id: 'cars',
    name: 'Cars'
  }, {
    id: 'bikes',
    name: 'Bikes'
  }, {
    id: 'mobiles',
    name: 'Mobiles'
  }, {
    id: 'electronics',
    name: 'Electronics'
  }, {
    id: 'furniture',
    name: 'Furniture'
  }, {
    id: 'home_appliances',
    name: 'Home Appliances'
  }];
  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
    setSearchParams(params => {
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      return params;
    });
  };
  const sortListings = (items: MarketplaceListing[]): MarketplaceListing[] => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'top-rated':
          return b.seller_rating - a.seller_rating;
        default:
          return 0;
      }
    });
  };
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };
  const filteredListings = listings.filter(listing => {
    const price = listing.price;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    const listingYear = new Date(listing.created_at).getFullYear();
    if (listingYear < yearRange[0] || listingYear > yearRange[1]) return false;
    if (ratingFilter > 0 && listing.seller_rating < ratingFilter) return false;
    if (conditionFilter !== 'all' && listing.condition.toLowerCase() !== conditionFilter.toLowerCase()) return false;
    return true;
  });
  const sortedListings = sortListings(filteredListings);
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const paginatedListings = sortedListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  return <MainLayout>
      <div className="animate-fade-in px-[7px]">
        <LocationSelector selectedLocation={selectedLocation} onLocationChange={handleLocationChange} />
        
        <ScrollArea className="w-full">
          <div className="flex items-center gap-3 mb-4 overflow-x-auto py-1 px-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full border border-border/60 flex items-center gap-1 h-8 px-3">
                  <span>Sort</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-2">
                <div className="space-y-1">
                  <Button variant={sortOption === 'newest' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => handleSortChange('newest')}>
                    Newest First
                  </Button>
                  <Button variant={sortOption === 'price-low-high' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => handleSortChange('price-low-high')}>
                    Price: Low to High
                  </Button>
                  <Button variant={sortOption === 'price-high-low' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => handleSortChange('price-high-low')}>
                    Price: High to Low
                  </Button>
                  <Button variant={sortOption === 'top-rated' ? "default" : "ghost"} size="sm" className="w-full justify-start" onClick={() => handleSortChange('top-rated')}>
                    Top Rated
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={activeFilter === 'rating'} onOpenChange={open => setActiveFilter(open ? 'rating' : null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={cn("rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", activeFilter === 'rating' && "border-primary ring-2 ring-primary/20", ratingFilter > 0 && "border-primary/30 bg-primary/5")}>
                  <Star className="h-4 w-4" />
                  {ratingFilter > 0 && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
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
                <Button variant="outline" size="icon" className={cn("rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", activeFilter === 'price' && "border-primary ring-2 ring-primary/20", (priceRange[0] > 0 || priceRange[1] < 500000) && "border-primary/30 bg-primary/5")}>
                  <IndianRupee className="h-4 w-4" />
                  {(priceRange[0] > 0 || priceRange[1] < 500000) && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                      ₹₹
                    </Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Price Range</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="text-sm font-medium">{formatPrice(priceRange[0])}</span>
                    </div>
                    <Slider value={[priceRange[0]]} min={0} max={500000} step={5000} onValueChange={value => setPriceRange([value[0], priceRange[1]])} />
                    <div className="flex justify-between mt-4">
                      <span className="text-sm text-muted-foreground">To</span>
                      <span className="text-sm font-medium">{formatPrice(priceRange[1])}</span>
                    </div>
                    <Slider value={[priceRange[1]]} min={0} max={500000} step={5000} onValueChange={value => setPriceRange([priceRange[0], value[0]])} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={activeFilter === 'year'} onOpenChange={open => setActiveFilter(open ? 'year' : null)}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={cn("rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", activeFilter === 'year' && "border-primary ring-2 ring-primary/20", (yearRange[0] > 2010 || yearRange[1] < new Date().getFullYear()) && "border-primary/30 bg-primary/5")}>
                  <Calendar className="h-4 w-4" />
                  {(yearRange[0] > 2010 || yearRange[1] < new Date().getFullYear()) && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
                      {yearRange[0].toString().slice(-2)}
                    </Badge>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Year Range</h4>
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
                <Button variant="outline" size="icon" className={cn("rounded-full border border-border/60 flex items-center justify-center bg-background w-8 h-8 relative p-0", activeFilter === 'condition' && "border-primary ring-2 ring-primary/20", conditionFilter !== 'all' && "border-primary/30 bg-primary/5")}>
                  <Layers className="h-4 w-4" />
                  {conditionFilter !== 'all' && <Badge variant="default" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium">
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
          </div>
        </ScrollArea>
        
        <Tabs defaultValue={currentCategory} value={currentCategory} onValueChange={handleCategoryChange} className="mb-6">
          <TabsList className="mb-4 flex flex-nowrap overflow-auto pb-1 scrollbar-none py-[23px]">
            {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap text-justify px-0 font-semibold text-sm mx-[8px]">
                {category.name}
              </TabsTrigger>)}
          </TabsList>
          
          {categories.map(category => <TabsContent key={category.id} value={category.id}>
              {error && <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>}
          
              {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-white/50 h-80 rounded-xl border border-border/50 animate-pulse" />)}
                </div> : paginatedListings.length > 0 ? <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedListings.map((listing, index) => <MarketplaceListingCard key={listing.id} listing={listing} />)}
                  </div>
                  
                  {totalPages > 1 && <Pagination className="mt-8">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
                        </PaginationItem>
                        
                        {Array.from({
                  length: totalPages
                }).map((_, index) => <PaginationItem key={index}>
                            <PaginationLink onClick={() => setCurrentPage(index + 1)} isActive={currentPage === index + 1}>
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>)}
                        
                        <PaginationItem>
                          <PaginationNext onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>}
                </> : <div className="text-center py-16">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No listings found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We couldn't find any items matching your criteria. Try changing your search or filter settings.
                  </p>
                  <Button onClick={() => {
              setCurrentCategory('all');
              setPriceRange([0, 500000]);
              setYearRange([2010, new Date().getFullYear()]);
              setRatingFilter(0);
              setConditionFilter('all');
            }}>
                    Reset all filters
                  </Button>
                </div>}
            </TabsContent>)}
        </Tabs>
      </div>
    </MainLayout>;
};
export default Marketplace;