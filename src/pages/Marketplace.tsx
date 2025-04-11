
import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { useUserMarketplaceListings } from '@/hooks/useUserMarketplaceListings';
import LocationSelector from '@/components/LocationSelector';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MarketplaceListing } from '@/types/marketplace';
import NoResultsMessage from '@/components/search/NoResultsMessage';

type SortOption = 'newest' | 'price-low-high' | 'price-high-low' | 'top-rated';

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const highlightedListingId = searchParams.get('highlight') || '';
  const highlightedListingRef = useRef<HTMLDivElement>(null);
  
  const [currentCategory, setCurrentCategory] = useState<string>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, new Date().getFullYear()]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const itemsPerPage = 9;
  
  useEffect(() => {
    if (categoryParam && categoryParam !== currentCategory) {
      console.log("Setting category from URL:", categoryParam);
      setCurrentCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const {
    listings,
    loading,
    error,
    refetch: refetchListings
  } = useMarketplaceListings({
    category: currentCategory !== 'all' ? currentCategory : undefined,
    searchQuery: searchQuery,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    minRating: ratingFilter > 0 ? ratingFilter : undefined,
    includeAllStatuses: true
  });

  const { 
    listings: userListings, 
    loading: userListingsLoading 
  } = useUserMarketplaceListings();

  const pendingListings = userListings.filter(listing => listing.approval_status === 'pending');
  
  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, searchQuery, conditionFilter, priceRange, ratingFilter, sortOption]);

  const handleLocationChange = (location: string) => {
    console.log(`Location changed to: ${location}`);
    setSelectedLocation(location);
  };

  const categories = [
    {
      id: 'all',
      name: 'All Categories'
    },
    {
      id: 'cars',
      name: 'Cars'
    },
    {
      id: 'bikes',
      name: 'Bikes'
    },
    {
      id: 'mobiles',
      name: 'Mobiles'
    },
    {
      id: 'electronics',
      name: 'Electronics'
    },
    {
      id: 'furniture',
      name: 'Furniture'
    },
    {
      id: 'home_appliances',
      name: 'Home Appliances'
    }
  ];

  useEffect(() => {
    if (!loading && currentCategory !== 'all') {
      console.log(`Filtering for category: ${currentCategory}`);
      console.log(`Found ${listings.length} listings`);
      
      const categoryValues = [...new Set(listings.map(l => l.category))];
      console.log('Available categories in listings:', categoryValues);
    }
  }, [listings, loading, currentCategory]);

  const handleCategoryChange = (category: string) => {
    console.log(`Category changed to: ${category}`);
    setCurrentCategory(category);
    setCurrentPage(1);
    setSearchParams(params => {
      if (category === 'all') {
        params.delete('category');
      } else {
        params.set('category', category);
      }
      
      if (highlightedListingId) {
        params.set('highlight', highlightedListingId);
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

  useEffect(() => {
    if (highlightedListingId && !loading) {
      console.log(`Looking for highlighted listing: ${highlightedListingId}`);
      
      const highlightedListing = listings.find(listing => listing.id === highlightedListingId);
      if (highlightedListing) {
        console.log(`Found highlighted listing: ${highlightedListing.title}`);
        
        if (currentCategory !== 'all' && currentCategory !== highlightedListing.category) {
          console.log(`Switching to category: ${highlightedListing.category} from ${currentCategory}`);
          setCurrentCategory(highlightedListing.category);
        }
        
        setTimeout(() => {
          if (highlightedListingRef.current) {
            console.log('Scrolling to highlighted listing');
            highlightedListingRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            highlightedListingRef.current.classList.add('ring-4', 'ring-primary', 'ring-opacity-50');
            setTimeout(() => {
              if (highlightedListingRef.current) {
                highlightedListingRef.current.classList.remove('ring-4', 'ring-primary', 'ring-opacity-50');
              }
            }, 2000);
          } else {
            console.log('Highlighted listing ref not found in DOM');
          }
        }, 300);
      } else {
        console.log(`Highlighted listing not found in current listings`);
      }
    }
  }, [highlightedListingId, listings, loading, currentCategory]);

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

  const isPriceFilterActive = priceRange[0] > 0 || priceRange[1] < 10000000;
  const isYearFilterActive = yearRange[0] > 2010 || yearRange[1] < new Date().getFullYear();
  const isRatingFilterActive = ratingFilter > 0;
  const isConditionFilterActive = conditionFilter !== 'all';
  const isSortFilterActive = sortOption !== 'newest';

  return <MainLayout>
      <div className="animate-fade-in px-[7px]">
        <div className="flex items-center justify-between">
          <LocationSelector selectedLocation={selectedLocation} onLocationChange={handleLocationChange} />
        </div>
        
        {pendingListings.length > 0 && user && (
          <Alert className="my-3 bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Approval</AlertTitle>
            <AlertDescription>
              You have {pendingListings.length} listing{pendingListings.length > 1 ? 's' : ''} waiting for admin approval.
              {pendingListings.some(l => l.title.toLowerCase().includes('honda') && l.title.toLowerCase().includes('wrv')) && (
                <span className="block mt-1 font-medium">Your Honda WRV listing will appear after approval.</span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="w-full">
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
          </div>
        </ScrollArea>
        
        <Tabs defaultValue={currentCategory} value={currentCategory} onValueChange={handleCategoryChange} className="mb-6">
          <TabsList className="mb-4 flex flex-nowrap overflow-auto pb-1 scrollbar-none py-0">
            {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap text-justify font-semibold text-sm mx-[8px] px-[7px]">
                {category.name}
              </TabsTrigger>)}
          </TabsList>
          
          {categories.map(category => <TabsContent key={category.id} value={category.id}>
              {error && <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>}
  
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-white/50 h-80 rounded-xl border border-border/50 animate-pulse" />)}
                </div>
              ) : paginatedListings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedListings.map((listing, index) => (
                      <div 
                        key={listing.id} 
                        ref={listing.id === highlightedListingId ? highlightedListingRef : null}
                        className={cn(
                          "transition-all duration-300",
                          listing.id === highlightedListingId ? "ring-4 ring-primary ring-opacity-50" : ""
                        )}
                      >
                        <MarketplaceListingCard listing={listing} />
                      </div>
                    ))}
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
                </>
              ) : (
                <NoResultsMessage 
                  type="marketplace" 
                  onNewSearch={(query) => {
                    console.log(`New search requested: ${query}`);
                  }} 
                />
              )}
            </TabsContent>)}
        </Tabs>
      </div>
    </MainLayout>;
};

export default Marketplace;
