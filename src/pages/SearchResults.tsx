
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import LocationCard from '@/components/LocationCard';
import FilterTabs from '@/components/FilterTabs';
import LocationSelector from '@/components/LocationSelector';
import useRecommendations, { Event } from '@/hooks/useRecommendations';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Clock, Users, AlertCircle, ShoppingBag, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SortButton, { SortOption } from '@/components/SortButton';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const [activeTab, setActiveTab] = useState('locations');
  const [distance, setDistance] = useState<number[]>([5]);
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [priceRange, setPriceRange] = useState<number>(2);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  const {
    recommendations,
    events,
    loading: recommendationsLoading,
    error: recommendationsError,
    query,
    category,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  } = useRecommendations({
    initialQuery: searchQuery,
    initialCategory: categoryParam as any
  });

  const {
    listings: marketplaceListings,
    loading: marketplaceLoading,
    error: marketplaceError
  } = useMarketplaceListings({
    searchQuery: searchQuery
  });

  const loading = recommendationsLoading || marketplaceLoading;
  const error = recommendationsError || marketplaceError;

  const filteredRecommendations = filterRecommendations(recommendations, {
    maxDistance: distance[0],
    minRating: minRating[0],
    priceLevel: priceRange,
    openNow: openNowOnly,
    distanceUnit: 'km'
  });

  const sortRecommendations = (recommendations) => {
    return [...recommendations].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          const distanceA = parseFloat(a.distance?.split(' ')[0] || '0');
          const distanceB = parseFloat(b.distance?.split(' ')[0] || '0');
          return distanceA - distanceB;
        case 'reviewCount':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });
  };

  const rankedRecommendations = sortRecommendations(filteredRecommendations);

  useEffect(() => {
    if (searchQuery && searchQuery !== query) {
      console.log("SearchResults - Processing search query:", searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery, query, handleSearch]);

  useEffect(() => {
    if (categoryParam !== 'all' && categoryParam !== category) {
      console.log("SearchResults - Setting category from URL:", categoryParam);
      handleCategoryChange(categoryParam as any);
    }
  }, [categoryParam, category, handleCategoryChange]);

  useEffect(() => {
    if (!searchQuery) {
      navigate('/');
    }
  }, [searchQuery, navigate]);

  const handleLocationChange = (location: string) => {
    console.log(`Location changed to: ${location}`);
    setSelectedLocation(location);
  };

  const handleRSVP = (eventTitle: string) => {
    toast({
      title: "RSVP Successful",
      description: `You've RSVP'd to ${eventTitle}. We'll send you a reminder closer to the date.`,
      duration: 3000
    });
  };

  const handleNewSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  return <MainLayout>
      <div className="w-full animate-fade-in mx-0 px-[6px]">
        <LocationSelector selectedLocation={selectedLocation} onLocationChange={handleLocationChange} />
        
        <div className="flex items-center justify-between mb-6 mt-2">
          <FilterTabs distance={distance} setDistance={setDistance} minRating={minRating} setMinRating={setMinRating} priceRange={priceRange} setPriceRange={setPriceRange} openNowOnly={openNowOnly} setOpenNowOnly={setOpenNowOnly} />
          
          <SortButton currentSort={sortBy} onSortChange={handleSortChange} />
        </div>

        <div className="w-full">
          {error && <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <div key={i} className="bg-white/50 h-96 rounded-xl border border-border/50 animate-pulse" />)}
            </div> : <>
              {query && query !== searchQuery && <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">AI-enhanced search:</span> {query}
                  </p>
                </div>}
              
              <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h1 className="text-xl font-medium">
                    Results for: <span className="text-primary">{query || searchQuery}</span>
                    {category !== 'all' && <span className="ml-2 text-muted-foreground"> in {category}</span>}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Found {rankedRecommendations.length} locations, {events.length} events, and {marketplaceListings.length} marketplace items
                  </p>
                </div>
              </div>
              
              <Tabs defaultValue="locations" className="w-full mb-6" onValueChange={setActiveTab} value={activeTab}>
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
                  <TabsTrigger value="locations" className="font-medium">
                    Locations ({rankedRecommendations.length})
                  </TabsTrigger>
                  <TabsTrigger value="events" className="font-medium">
                    Events ({events.length})
                  </TabsTrigger>
                  <TabsTrigger value="marketplace" className="font-medium">
                    Marketplace ({marketplaceListings.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="locations">
                  {rankedRecommendations.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {rankedRecommendations.map((recommendation, index) => <div key={recommendation.id} className="animate-fade-in" style={{
                  animationDelay: `${index * 100}ms`
                }}>
                          <LocationCard recommendation={recommendation} ranking={index < 10 ? index + 1 : undefined} reviewCount={recommendation.reviewCount} className="h-full" />
                        </div>)}
                    </div> : <div className="text-center py-10 animate-fade-in">
                      <p className="text-lg font-medium mb-2">No locations found</p>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search or filters
                      </p>
                      <Button variant="outline" onClick={() => handleNewSearch("restaurant near me")} className="mr-2">
                        Try "Restaurant near me"
                      </Button>
                      <Button variant="outline" onClick={() => handleNewSearch("cafes in bangalore")}>
                        Try "Cafes in Bangalore"
                      </Button>
                    </div>}
                </TabsContent>
                
                <TabsContent value="events">
                  {events.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {events.map(event => <div key={event.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
                          <div className="relative h-48">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="p-5">
                            <h3 className="text-xl font-medium mb-3">{event.title}</h3>
                            
                            <div className="flex flex-col gap-2 mb-4">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 mr-2" />
                                {event.date}
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-4 h-4 mr-2" />
                                {event.time}
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 mr-2" />
                                {event.location}
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="w-4 h-4 mr-2" />
                                {event.attendees} attending
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">
                              {event.description}
                            </p>
                            
                            <Button onClick={() => handleRSVP(event.title)} className="w-full">
                              RSVP to Event
                            </Button>
                          </div>
                        </div>)}
                    </div> : <div className="text-center py-10 animate-fade-in">
                      <p className="text-lg font-medium mb-2">No events found</p>
                      <p className="text-muted-foreground">
                        Try adjusting your search criteria
                      </p>
                    </div>}
                </TabsContent>
                
                <TabsContent value="marketplace">
                  {marketplaceListings.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {marketplaceListings.map((listing, index) => <div key={listing.id} className="animate-fade-in" style={{
                  animationDelay: `${index * 100}ms`
                }}>
                          <MarketplaceListingCard listing={listing} />
                        </div>)}
                    </div> : <div className="text-center py-10 animate-fade-in">
                      <p className="text-lg font-medium mb-2">No marketplace items found</p>
                      <p className="text-muted-foreground mb-4">
                        Try searching with different terms or browsing the marketplace directly
                      </p>
                      <Button variant="outline" onClick={() => navigate("/marketplace")}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Browse Marketplace
                      </Button>
                    </div>}
                </TabsContent>
              </Tabs>
            </>}
        </div>
      </div>
    </MainLayout>;
};

export default SearchResults;
