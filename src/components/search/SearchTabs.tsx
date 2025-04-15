
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Event } from '@/hooks/useRecommendations';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { Recommendation } from '@/lib/mockData';
import { useLocation } from 'react-router-dom';

import LocationsList from './LocationsList';
import EventsList from './EventsList';
import MarketplaceItemsList from './MarketplaceItemsList';
import NoResultsMessage from './NoResultsMessage';

interface SearchTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recommendations: Recommendation[];
  events: Event[];
  marketplaceListings: MarketplaceListing[];
  handleRSVP: (eventTitle: string) => void;
}

const SearchTabs: React.FC<SearchTabsProps> = ({
  activeTab,
  setActiveTab,
  recommendations,
  events,
  marketplaceListings,
  handleRSVP
}) => {
  const location = useLocation();
  const isMarketplacePage = location.pathname === '/marketplace' || location.pathname.startsWith('/marketplace');
  
  console.log("SearchTabs - marketplaceListings received:", marketplaceListings);
  
  // Additional logging to verify data completeness
  if (marketplaceListings.length > 0) {
    console.log("First listing details:", marketplaceListings[0]);
    console.log("First listing has damage images:", marketplaceListings[0].damage_images?.length || 0);
    console.log("First listing has inspection certificates:", marketplaceListings[0].inspection_certificates?.length || 0);
  }
  
  // Ensure listings have all required properties
  const enhancedListings = marketplaceListings.map(listing => ({
    ...listing,
    damage_images: listing.damage_images || [],
    inspection_certificates: listing.inspection_certificates || [],
    is_negotiable: listing.is_negotiable !== undefined ? listing.is_negotiable : false
  }));
  
  // For marketplace page, only show marketplace listings without tabs
  if (isMarketplacePage) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Marketplace Listings</h2>
        {enhancedListings.length > 0 ? (
          <MarketplaceItemsList listings={enhancedListings} />
        ) : (
          <NoResultsMessage type="marketplace" />
        )}
      </div>
    );
  }

  // For other pages, show normal tabs UI
  return (
    <Tabs defaultValue="locations" className="w-full" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="grid w-full max-w-md grid-cols-3 mb-1 TabsList">
        <TabsTrigger value="locations" className="font-medium text-sm py-1">
          Locations ({recommendations.length})
        </TabsTrigger>
        <TabsTrigger value="events" className="font-medium text-sm py-1">
          Events ({events.length})
        </TabsTrigger>
        <TabsTrigger value="marketplace" className="font-medium text-sm py-1">
          Marketplace ({enhancedListings.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="locations" className="pt-0">
        {recommendations.length > 0 ? (
          <LocationsList recommendations={recommendations} />
        ) : (
          <NoResultsMessage type="locations" />
        )}
      </TabsContent>
      
      <TabsContent value="events" className="pt-0">
        {events.length > 0 ? (
          <EventsList events={events} />
        ) : (
          <NoResultsMessage type="events" />
        )}
      </TabsContent>
      
      <TabsContent value="marketplace" className="pt-0">
        {enhancedListings.length > 0 ? (
          <MarketplaceItemsList listings={enhancedListings} />
        ) : (
          <NoResultsMessage type="marketplace" />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default SearchTabs;
