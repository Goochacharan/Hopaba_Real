
import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PostalCodeSearch from '@/components/search/PostalCodeSearch';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import MarketplaceCategoryTabs from '@/components/marketplace/MarketplaceCategoryTabs';

type SortOption = 'newest' | 'price-low-high' | 'price-high-low' | 'top-rated';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'cars', name: 'Cars' },
  { id: 'bikes', name: 'Bikes' },
  { id: 'mobiles', name: 'Mobiles' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'furniture', name: 'Furniture' },
  { id: 'home_appliances', name: 'Home Appliances' }
];

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
  const [postalCodeFilter, setPostalCodeFilter] = useState<string>('');
  const itemsPerPage = 9;

  useEffect(() => {
    if (categoryParam && categoryParam !== currentCategory) {
      console.log("Setting category from URL:", categoryParam);
      setCurrentCategory(categoryParam);
    }
  }, [categoryParam]);

  const {
    data: allListings,
    isLoading: loading,
    error,
  } = useMarketplaceListings({
    category: currentCategory !== 'all' ? currentCategory : undefined,
    searchQuery: searchQuery,
    condition: conditionFilter !== 'all' ? conditionFilter : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
    minRating: ratingFilter > 0 ? ratingFilter : undefined,
    includeAllStatuses: true
  });

  const listings = allListings ? allListings.filter(listing => {
    if (postalCodeFilter && listing.postal_code) {
      return listing.postal_code === postalCodeFilter;
    }
    return true;
  }) : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory, searchQuery, conditionFilter, priceRange, ratingFilter, sortOption, postalCodeFilter]);

  const handlePostalCodeSearch = (postalCode: string) => {
    console.log(`Searching listings in postal code: ${postalCode}`);
    setPostalCodeFilter(postalCode);
    if (!postalCode) {
      setPostalCodeFilter('');
    }
    setCurrentPage(1);
    if (postalCode) {
      toast({
        title: "Filtering by postal code",
        description: `Showing listings with postal code: ${postalCode}`,
      });
    }
  };

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

  const sortListings = (items: typeof listings): typeof items => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'top-rated':
          const ratingA = a.seller_rating || 0;
          const ratingB = b.seller_rating || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });
  };

  useEffect(() => {
    if (highlightedListingId && !loading) {
      const highlightedListing = listings.find(listing => listing.id === highlightedListingId);
      if (highlightedListing) {
        if (currentCategory !== 'all' && currentCategory !== highlightedListing.category) {
          setCurrentCategory(highlightedListing.category);
        }
        
        setTimeout(() => {
          if (highlightedListingRef.current) {
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
          }
        }, 300);
      }
    }
  }, [highlightedListingId, listings, loading, currentCategory]);

  const sortedListings = sortListings(listings);
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const paginatedListings = sortedListings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <MainLayout>
      <div className="animate-fade-in px-[7px]">
        {user && (
          <div className="mb-4">
            <Button 
              onClick={() => navigate('/marketplace/new')} 
              className="w-full bg-primary text-white hover:bg-primary/90"
            >
              Sell your item
            </Button>
          </div>
        )}
        
        <PostalCodeSearch 
          onSearch={handlePostalCodeSearch} 
          initialValue={postalCodeFilter}
        />
        
        <ScrollArea className="w-full">
          <MarketplaceFilters
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            yearRange={yearRange}
            setYearRange={setYearRange}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            conditionFilter={conditionFilter}
            setConditionFilter={setConditionFilter}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            sortOption={sortOption}
            onSortChange={(option) => setSortOption(option as SortOption)}
          />
        </ScrollArea>

        <MarketplaceCategoryTabs
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
          categories={categories}
          paginatedListings={paginatedListings}
          loading={loading}
          error={error}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          highlightedListingId={highlightedListingId}
          highlightedListingRef={highlightedListingRef}
        />
      </div>
    </MainLayout>
  );
};

export default Marketplace;
