
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Filter, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [currentCategory, setCurrentCategory] = useState<string>(categoryParam);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const { listings, loading, error } = useMarketplaceListings({
    category: currentCategory !== 'all' ? currentCategory : undefined,
    searchQuery: searchQuery
  });
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'cars', name: 'Cars' },
    { id: 'bikes', name: 'Bikes' },
    { id: 'mobiles', name: 'Mobiles' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'home_appliances', name: 'Home Appliances' }
  ];
  
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
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query') as string;
    
    setSearchParams(params => {
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      return params;
    });
  };
  
  // Pagination
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const paginatedListings = listings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">Browse and buy pre-owned items from trusted sellers</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input 
                type="text" 
                name="query" 
                placeholder="Search marketplace..." 
                defaultValue={searchQuery}
                className="pr-12"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-full"
              >
                Search
              </Button>
            </div>
          </form>
          
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Narrow down your search results
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <Label className="text-base">Categories</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {categories.slice(1).map(category => (
                        <Button
                          key={category.id}
                          variant={currentCategory === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryChange(category.id)}
                          className="justify-start"
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base">Price Range</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input type="number" placeholder="Min" />
                      <span>to</span>
                      <Input type="number" placeholder="Max" />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base">Condition</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" size="sm">Like New</Button>
                      <Button variant="outline" size="sm">Good</Button>
                      <Button variant="outline" size="sm">Fair</Button>
                      <Button variant="outline" size="sm">Poor</Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="relative">
              <Button variant="outline" className="flex gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue={currentCategory} value={currentCategory} onValueChange={handleCategoryChange} className="mb-6">
          <TabsList className="mb-4 flex flex-nowrap overflow-auto pb-1 scrollbar-none">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="whitespace-nowrap"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
          
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white/50 h-80 rounded-xl border border-border/50 animate-pulse" />
                  ))}
                </div>
              ) : paginatedListings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedListings.map((listing, index) => (
                      <MarketplaceListingCard 
                        key={listing.id} 
                        listing={listing}
                      />
                    ))}
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination className="mt-8">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }).map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => setCurrentPage(index + 1)}
                              isActive={currentPage === index + 1}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No listings found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We couldn't find any items matching your criteria. Try changing your search or filter settings.
                  </p>
                  <Button onClick={() => handleCategoryChange('all')}>
                    Show all listings
                  </Button>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Marketplace;
