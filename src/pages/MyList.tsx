
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import LocationCard from '@/components/LocationCard';
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
import EventsList from '@/components/search/EventsList';

const MyList = () => {
  const {
    wishlist
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

  const isMarketplaceListing = (item: WishlistItem): item is WishlistItem & {
    type: 'marketplace';
  } => {
    return item.type === 'marketplace';
  };

  const isEvent = (item: WishlistItem): item is WishlistItem & {
    type: 'event';
  } => {
    return item.type === 'event';
  };

  const filteredWishlist = wishlist.filter(item => {
    if (activeTab === 'locations' && (isMarketplaceListing(item) || isEvent(item))) {
      return false;
    }
    if (activeTab === 'marketplace' && (!isMarketplaceListing(item) || isEvent(item))) {
      return false;
    }
    if (activeTab === 'events' && !isEvent(item)) {
      return false;
    }

    if (!searchQuery.trim()) return true;
    const lowercaseQuery = searchQuery.toLowerCase();

    if (isMarketplaceListing(item)) {
      return item.title?.toLowerCase().includes(lowercaseQuery) || 
             item.category?.toLowerCase().includes(lowercaseQuery) || 
             item.description?.toLowerCase().includes(lowercaseQuery) || 
             item.location?.toLowerCase().includes(lowercaseQuery) || 
             item.condition?.toLowerCase().includes(lowercaseQuery);
    } else if (isEvent(item)) {
      return item.title?.toLowerCase().includes(lowercaseQuery) || 
             item.description?.toLowerCase().includes(lowercaseQuery) || 
             item.location?.toLowerCase().includes(lowercaseQuery) || 
             item.date?.toLowerCase().includes(lowercaseQuery);
    } else {
      return item.name?.toLowerCase().includes(lowercaseQuery) || 
             item.category?.toLowerCase().includes(lowercaseQuery) || 
             item.description?.toLowerCase().includes(lowercaseQuery) || 
             item.address?.toLowerCase().includes(lowercaseQuery);
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWishlist.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWishlist.length / itemsPerPage);

  const handleRSVP = (eventTitle: string) => {
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

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
                    if (isMarketplaceListing(item)) {
                      return <MarketplaceListingCard 
                               key={item.id} 
                               listing={item as MarketplaceListing} 
                               className="search-result-card" // Add the search-result-card class here
                             />;
                    } else if (isEvent(item)) {
                      const events = [item as Event];
                      return <EventsList key={item.id} events={events} />;
                    } else {
                      return <LocationCard key={item.id} recommendation={item as Recommendation} />;
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
