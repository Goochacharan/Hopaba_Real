
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import MarketplaceItemsList from '@/components/search/MarketplaceItemsList';
import MarketplaceFilters from '@/components/marketplace/MarketplaceFilters';
import MarketplaceSortButton from '@/components/marketplace/MarketplaceSortButton';
import MarketplaceListingDetails from '@/pages/MarketplaceListingDetails'; // Updated import path
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, MapPin, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/contexts/LocationContext';
import PostalCodeSearch from '@/components/search/PostalCodeSearch';
import { useMarketplaceFilters } from '@/hooks/useMarketplaceFilters';
import { useMarketplaceListings, MarketplaceListing } from '@/hooks/useMarketplaceListings';

interface MarketplaceListingWithDistance extends Omit<MarketplaceListing, 'distance'> {
  distance?: number;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedLocation } = useLocation();
  const [searchParams] = useSearchParams();
  const [showListingDetails, setShowListingDetails] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingWithDistance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { listings, fetchListings } = useMarketplaceListings();
  const {
    filters,
    setters,
    states,
    filterListings,
    sortListings
  } = useMarketplaceFilters(listings);

  useEffect(() => {
    fetchListings().finally(() => setLoading(false));
  }, [selectedLocation, searchParams]);

  const filteredListings = filterListings(listings);
  const sortedListings = sortListings(filteredListings);

  const handleAddListingClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a listing.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    navigate('/marketplace/add');
  };

  const handleListingClick = (listing: MarketplaceListingWithDistance) => {
    setSelectedListing({
      ...listing,
      distance: listing.distance?.toString() || ''
    });
    setShowListingDetails(true);
  };

  const handleCloseDetails = () => {
    setShowListingDetails(false);
    setSelectedListing(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="md:flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-4 items-center">
            <PostalCodeSearch onSearch={setters.handleLocationSearch} />
            <Button onClick={handleAddListingClick} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
          </div>
        </div>

        <div className="md:flex gap-4">
          {showFilters && (
            <div className="md:w-1/4 mb-4">
              <MarketplaceFilters
                filters={filters}
                setters={setters}
                states={states}
              />
            </div>
          )}

          <div className="md:w-3/4">
            <div className="flex justify-end items-center mb-4">
              <MarketplaceSortButton
                sortOption={filters.sortOption}
                onSortChange={setters.setSortOption}
                isSortFilterActive={states.isSortFilterActive}
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[150px] w-full rounded-md" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MarketplaceItemsList
                listings={sortedListings}
                loading={false}
                onListingClick={handleListingClick}
              />
            )}
          </div>
        </div>

        {selectedListing && (
          <MarketplaceListingDetails
            isOpen={showListingDetails}
            onClose={handleCloseDetails}
            listing={selectedListing}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Marketplace;
