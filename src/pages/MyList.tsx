
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LocationCardWrapper from '@/components/LocationCardWrapper';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { useWishlist, WishlistItem } from '@/contexts/WishlistContext';
import { Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Recommendation } from '@/lib/mockData';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Event } from '@/hooks/useRecommendations';
import EventCard from '@/components/EventCard';

const MyList = () => {
  const {
    wishlist,
    toggleWishlist
  } = useWishlist();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const itemsPerPage = 6;
  
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const {
        data
      } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      } else {
        setUser(data.session.user);
      }
      setLoading(false);
    };
    checkUser();
    const {
      data: authListener
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const filteredWishlist = wishlist.filter(item => {
    if (activeTab === 'locations' && item.type !== 'location') {
      return false;
    }
    if (activeTab === 'marketplace' && item.type !== 'marketplace') {
      return false;
    }
    if (activeTab === 'events' && item.type !== 'event') {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const lowercaseQuery = searchQuery.toLowerCase();

    if (item.type === 'marketplace') {
      const marketplaceItem = item as MarketplaceListing & { type: 'marketplace' };
      return marketplaceItem.title?.toLowerCase().includes(lowercaseQuery) || 
             marketplaceItem.category?.toLowerCase().includes(lowercaseQuery) || 
             marketplaceItem.description?.toLowerCase().includes(lowercaseQuery) || 
             marketplaceItem.location?.toLowerCase().includes(lowercaseQuery) || 
             marketplaceItem.condition?.toLowerCase().includes(lowercaseQuery);
    } else if (item.type === 'event') {
      const eventItem = item as Event & { type: 'event' };
      return eventItem.title?.toLowerCase().includes(lowercaseQuery) || 
             eventItem.description?.toLowerCase().includes(lowercaseQuery) || 
             eventItem.location?.toLowerCase().includes(lowercaseQuery) || 
             eventItem.date?.toLowerCase().includes(lowercaseQuery);
    } else {
      const locationItem = item as Recommendation & { type: 'location' };
      return locationItem.name?.toLowerCase().includes(lowercaseQuery) || 
             locationItem.category?.toLowerCase().includes(lowercaseQuery) || 
             locationItem.description?.toLowerCase().includes(lowercaseQuery) || 
             locationItem.address?.toLowerCase().includes(lowercaseQuery);
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWishlist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWishlist.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleHeartClick = (e: React.MouseEvent, item: WishlistItem) => {
    e.stopPropagation();
    toggleWishlist(item);
  };

  if (loading) {
    return <MainLayout>
        <div className="py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>;
  }

  return <MainLayout>
      <section className="py-8 px-[7px]">
        <h1 className="text-3xl font-medium mb-6">My Wishlist</h1>
        
        {wishlist.length > 0 ? <>
            <div className="mb-6 space-y-4">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input type="text" placeholder="Search your wishlist..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
            </div>
            
            {filteredWishlist.length > 0 ? <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentItems.map(item => {
                    if (item.type === 'marketplace') {
                      const marketplaceItem = item as MarketplaceListing & { type: 'marketplace' };
                      return (
                        <div key={item.id} className="relative group">
                          <MarketplaceListingCard 
                            listing={marketplaceItem} 
                            className="search-result-card" 
                            hideWishlistIcon={true} 
                          />
                          <button 
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                            onClick={(e) => handleHeartClick(e, item)}
                          >
                            <Heart className="h-4 w-4 fill-rose-500" />
                          </button>
                        </div>
                      );
                    } else if (item.type === 'event') {
                      const eventItem = item as Event & { type: 'event' };
                      return (
                        <div key={item.id} className="relative group">
                          <EventCard 
                            event={eventItem} 
                            className="search-result-card" 
                            hideWishlistIcon={true} 
                          />
                          <button 
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                            onClick={(e) => handleHeartClick(e, item)}
                          >
                            <Heart className="h-4 w-4 fill-rose-500" />
                          </button>
                        </div>
                      );
                    } else {
                      const locationItem = item as Recommendation & { type: 'location' };
                      // Use LocationCardWrapper instead of LocationCard directly
                      return (
                        <div key={item.id} className="relative group">
                          <LocationCardWrapper 
                            recommendation={locationItem} 
                            className="search-result-card" 
                            hideWishlistIcon={true} 
                          />
                          <button 
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10 text-rose-500"
                            onClick={(e) => handleHeartClick(e, item)}
                          >
                            <Heart className="h-4 w-4 fill-rose-500" />
                          </button>
                        </div>
                      );
                    }
                  })}
                </div>
                
                {totalPages > 1 && <Pagination className="mt-6">
                    <PaginationContent>
                      {currentPage > 1 && <PaginationItem>
                          <PaginationPrevious href="#" onClick={e => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                }} />
                        </PaginationItem>}
                      
                      {Array.from({
                length: totalPages
              }).map((_, i) => <PaginationItem key={i}>
                          <PaginationLink href="#" isActive={currentPage === i + 1} onClick={e => {
                  e.preventDefault();
                  setCurrentPage(i + 1);
                }}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>)}
                      
                      {currentPage < totalPages && <PaginationItem>
                          <PaginationNext href="#" onClick={e => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                }} />
                        </PaginationItem>}
                    </PaginationContent>
                  </Pagination>}
              </> : <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 stroke-[1.5]" />
                <h2 className="text-xl font-medium mb-2">No matching items found</h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search query or explore more locations to add to your wishlist.
                </p>
                <Button onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </div>}
          </> : <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4 stroke-[1.5]" />
            <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add items to your wishlist by clicking the heart icon on any location card or marketplace listing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/')}>
                Explore locations
              </Button>
              <Button onClick={() => navigate('/marketplace')} variant="outline">
                Browse marketplace
              </Button>
            </div>
          </div>}
      </section>
    </MainLayout>;
};

export default MyList;
